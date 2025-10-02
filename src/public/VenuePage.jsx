import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AuroraVenue from "../VenueGallery/AuroraVenue/AuroraVenue";
import { normalizeMedia } from "../VenueGallery/AuroraVenue/media";

export default function VenuePage() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [socials, setSocials] = useState(null);
  const [media, setMedia] = useState([]);

  useEffect(() => {
    const vid = Number(id);
    Promise.all([
      supabase.from("venues").select("*").eq("id", vid).maybeSingle(),
      supabase
        .from("venue_socials")
        .select("*")
        .eq("venue_id", vid)
        .maybeSingle(),
      supabase
        .from("venue_media")
        .select("*")
        .eq("venue_id", vid)
        .order("sort_order", { ascending: true }),
    ]).then(([v, s, m]) => {
      if (!v.data || !v.data.is_published) {
        setVenue(null);
        return;
      }
      setVenue(v.data);
      setSocials(s.data || {});
      setMedia(m.data || []);
    });
  }, [id]);

  const auroraVenue = useMemo(
    () =>
      venue && {
        name: venue.title,
        categories: [venue.type],
        priceLevel: venue.price_level || "",
        openNow: !!venue.open_now,
        hours: venue.hours || "",
        phone: venue.phone || "",
        address: venue.address || "",
        mapLink: venue.map_link || "",
        description: venue.description || "",
        socials: {
          instagram: socials?.instagram || "",
          telegram: socials?.telegram || "",
          whatsapp: socials?.whatsapp || "",
          youtube: socials?.youtube || "",
        },
      },
    [venue, socials]
  );

  const auroraMedia = useMemo(() => {
    const prepared = media.map((m) =>
      m.kind === "video"
        ? { type: "video", src: m.src, poster: m.poster || "" }
        : { type: "image", src: m.src }
    );
    return normalizeMedia(prepared);
  }, [media]);

  if (venue === null)
    return (
      <div style={{ padding: 24 }}>
        Площадка не найдена или не опубликована.
      </div>
    );
  if (!venue || !auroraVenue)
    return <div style={{ padding: 24 }}>Загрузка…</div>;

  const onShare = () => {
    if (navigator.share)
      navigator
        .share({ title: venue.title, url: window.location.href })
        .catch(() => {});
    else alert("Скопируйте ссылку из адресной строки, чтобы поделиться");
  };

  return (
    <AuroraVenue
      hero={auroraMedia.find((x) => x.type === "image")?.src || ""}
      media={auroraMedia}
      venue={auroraVenue}
      onShare={onShare}
      showShare={true}
      showBook={false}
    />
  );
}
