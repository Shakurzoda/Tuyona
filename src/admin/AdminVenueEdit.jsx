// src/admin/AdminVenueEdit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";
import AuroraVenue from "../components/VenueGallery/AuroraVenue";
import { normalizeMedia } from "../components/VenueGallery/media";
import {
  uploadToMedia,
  moveInMedia,
  removeFromMedia,
  buildPath,
} from "../lib/storage";
import "./admin.css";

export default function AdminVenueEdit() {
  const { id: idParam } = useParams();
  const vid = Number(idParam);
  const isNew = idParam === "new" || !Number.isFinite(vid);
  const nav = useNavigate();

  const { session } = useAuth();
  const uid = session?.user?.id;

  const [venue, setVenue] = useState({
    type: "restaurant",
    title: "",
    description: "",
    address: "",
    map_link: "",
    phone: "",
    hours: "",
    price_level: "",
    open_now: true,
    is_published: true,
  });

  const [socials, setSocials] = useState({
    instagram: "",
    telegram: "",
    whatsapp: "",
    youtube: "",
  });

  const [media, setMedia] = useState([]);

  // Загрузка данных (ТОЛЬКО если редактирование существующего id)
  useEffect(() => {
    if (isNew) return; // <— важная защита от id=NaN
    (async () => {
      const { data: v, error: e1 } = await supabase
        .from("venues")
        .select("*")
        .eq("id", vid)
        .maybeSingle();
      if (e1 || !v) return;
      setVenue(v);

      const { data: s } = await supabase
        .from("venue_socials")
        .select("*")
        .eq("venue_id", vid)
        .maybeSingle();

      setSocials({
        instagram: s?.instagram || "",
        telegram: s?.telegram || "",
        whatsapp: s?.whatsapp || "",
        youtube: s?.youtube || "",
      });

      const { data: m } = await supabase
        .from("venue_media")
        .select("*")
        .eq("venue_id", vid)
        .order("sort_order", { ascending: true });

      setMedia(
        (m || []).map((x) => ({
          kind: x.kind,
          src: x.src, // ПУБЛИЧНЫЙ URL
          poster: x.poster || "",
          path: x.path || "",
          posterPath: x.poster_path || "",
        }))
      );
    })();
  }, [isNew, vid]);

  // Добавление медиа — ВСЕГДА кладём ПУБЛИЧНЫЙ URL в src
  const addImageByFile = async (file) => {
    if (!file || !uid) return;
    const base = venue.id ? `venues/${venue.id}` : `drafts/${uid}`;
    const path = buildPath("image", base, file);
    const { url } = await uploadToMedia(path, file);
    setMedia((m) => [...m, { kind: "image", src: url, path }]);
  };

  const addVideoByFile = async (file, posterFile) => {
    if (!file || !uid) return;
    const base = venue.id ? `venues/${venue.id}` : `drafts/${uid}`;

    const vPath = buildPath("video", base, file);
    const { url: vUrl } = await uploadToMedia(vPath, file);

    let poster = "",
      posterPath = "";
    if (posterFile) {
      const pPath = buildPath("poster", base, posterFile);
      const { url: pUrl } = await uploadToMedia(pPath, posterFile);
      poster = pUrl;
      posterPath = pPath;
    }

    setMedia((m) => [
      ...m,
      { kind: "video", src: vUrl, path: vPath, poster, posterPath },
    ]);
  };

  const moveDraftsToVenue = async (targetId) => {
    const moved = await Promise.all(
      media.map(async (m) => {
        const res = { ...m };
        if (m.path && uid && m.path.startsWith(`drafts/${uid}/`)) {
          const toPath = m.path.replace(
            `drafts/${uid}/`,
            `venues/${targetId}/`
          );
          const { path, url } = await moveInMedia(m.path, toPath);
          res.path = path;
          res.src = url;
        }
        if (m.posterPath && m.posterPath.startsWith(`drafts/${uid}/`)) {
          const toPoster = m.posterPath.replace(
            `drafts/${uid}/`,
            `venues/${targetId}/`
          );
          const { path, url } = await moveInMedia(m.posterPath, toPoster);
          res.posterPath = path;
          res.poster = url;
        }
        return res;
      })
    );
    setMedia(moved);
    return moved;
  };

  const save = async () => {
    let currentId = venue.id;

    if (isNew) {
      const { data: ins, error } = await supabase
        .from("venues")
        .insert(venue)
        .select("*")
        .single();
      if (error) return alert(error.message);
      currentId = ins.id;
      setVenue(ins);
    } else {
      const { error } = await supabase
        .from("venues")
        .update(venue)
        .eq("id", currentId);
      if (error) return alert(error.message);
    }

    // Переместим драфты → venues/<id>
    const normalizedMedia = await moveDraftsToVenue(currentId);

    // Соцсети
    await supabase
      .from("venue_socials")
      .upsert({ venue_id: currentId, ...socials }, { onConflict: "venue_id" });

    // Медиа
    await supabase.from("venue_media").delete().eq("venue_id", currentId);
    if (normalizedMedia.length) {
      await supabase.from("venue_media").insert(
        normalizedMedia.map((m, i) => ({
          venue_id: currentId,
          kind: m.kind,
          src: m.src,
          poster: m.poster || null,
          sort_order: i,
          path: m.path || null,
          poster_path: m.posterPath || null,
        }))
      );
    }

    alert("Сохранено");
    if (isNew) nav(`/admin/venues/${currentId}`);
  };

  // UI-хэлперы
  const addMedia = () => document.getElementById("file-image")?.click();
  const addVideo = () => document.getElementById("file-video")?.click();

  const updMedia = (i, patch) =>
    setMedia((m) => m.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const delMedia = async (i) => {
    const m = media[i];
    try {
      if (m?.path) await removeFromMedia(m.path);
      if (m?.posterPath) await removeFromMedia(m.posterPath);
    } catch {}
    setMedia((arr) => arr.filter((_, idx) => idx !== i));
  };

  const move = (i, dir) =>
    setMedia((m) => {
      const a = [...m];
      const j = i + dir;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });

  // Данные для предпросмотра Aurora
  const auroraVenue = useMemo(
    () => ({
      name: venue.title,
      categories: [venue.type].filter(Boolean),
      priceLevel: venue.price_level || "",
      openNow: !!venue.open_now,
      hours: venue.hours || "",
      phone: venue.phone || "",
      address: venue.address || "",
      mapLink: venue.map_link || "",
      description: venue.description || "",
      socials: { ...socials },
    }),
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

  const hero = useMemo(
    () => auroraMedia.find((x) => x.type === "image")?.src || "",
    [auroraMedia]
  );

  return (
    <div className="edit-shell">
      {/* Левая колонка */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            {isNew ? "Новая площадка" : `Редактировать #${venue.id ?? "…"}`}
          </div>
          <div className="right actions">
            <button className="btn" onClick={() => nav("/admin")}>
              Назад
            </button>
          </div>
        </div>

        <div className="panel-body">
          {/* Основные поля */}
          <div className="form-grid">
            <div>
              <div className="label">Тип</div>
              <select
                className="select"
                value={venue.type}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, type: e.target.value }))
                }
              >
                <option value="restaurant">restaurant</option>
                <option value="photographers">photographers</option>
                <option value="beautySalons">beautySalons</option>
                <option value="musicians">musicians</option>
                <option value="presenters">presenters</option>
              </select>
            </div>

            <div>
              <div className="label">Название</div>
              <input
                className="input"
                value={venue.title}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, title: e.target.value }))
                }
              />
            </div>

            <div className="full">
              <div className="label">Описание</div>
              <textarea
                className="textarea"
                value={venue.description || ""}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, description: e.target.value }))
                }
              />
            </div>

            <div>
              <div className="label">Адрес</div>
              <input
                className="input"
                value={venue.address || ""}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, address: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="label">Ссылка на карту</div>
              <input
                className="input"
                value={venue.map_link || ""}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, map_link: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="label">Телефон</div>
              <input
                className="input"
                value={venue.phone || ""}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="label">Часы</div>
              <input
                className="input"
                value={venue.hours || ""}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, hours: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="label">Price level</div>
              <input
                className="input"
                value={venue.price_level || ""}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, price_level: e.target.value }))
                }
              />
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={!!venue.open_now}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, open_now: e.target.checked }))
                }
              />
              Проверено
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!venue.is_published}
                onChange={(e) =>
                  setVenue((v) => ({ ...v, is_published: e.target.checked }))
                }
              />
              Опубликовано
            </label>
          </div>

          {/* Соцсети */}
          <div className="mt-16">
            <div className="label">Соцсети</div>
            <div className="form-grid">
              <div>
                <div className="label">Instagram</div>
                <input
                  className="input"
                  value={socials.instagram}
                  onChange={(e) =>
                    setSocials((s) => ({ ...s, instagram: e.target.value }))
                  }
                />
              </div>
              <div>
                <div className="label">Telegram</div>
                <input
                  className="input"
                  value={socials.telegram}
                  onChange={(e) =>
                    setSocials((s) => ({ ...s, telegram: e.target.value }))
                  }
                />
              </div>
              <div>
                <div className="label">WhatsApp</div>
                <input
                  className="input"
                  value={socials.whatsapp}
                  onChange={(e) =>
                    setSocials((s) => ({ ...s, whatsapp: e.target.value }))
                  }
                />
              </div>
              <div>
                <div className="label">YouTube</div>
                <input
                  className="input"
                  value={socials.youtube}
                  onChange={(e) =>
                    setSocials((s) => ({ ...s, youtube: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Медиа */}
          <div className="mt-16">
            <div className="label">Медиа</div>
            <div className="actions mb-8">
              <button className="btn" onClick={addMedia}>
                + Фото (файл)
              </button>
              <button className="btn" onClick={addVideo}>
                + Видео (файл)
              </button>
            </div>

            <input
              id="file-image"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await addImageByFile(f);
                e.target.value = "";
              }}
            />
            <input
              id="file-video"
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const poster = await pickPoster();
                await addVideoByFile(f, poster);
                e.target.value = "";
              }}
            />

            {media.map((m, i) => (
              <div key={i} className="media-row">
                <select
                  className="select media-kind"
                  value={m.kind}
                  onChange={(e) => updMedia(i, { kind: e.target.value })}
                >
                  <option value="image">image</option>
                  <option value="video">video</option>
                </select>

                <input
                  className="input"
                  placeholder={m.kind === "image" ? "image URL" : "video URL"}
                  value={m.src}
                  onChange={(e) => updMedia(i, { src: e.target.value })}
                />

                {m.kind === "video" ? (
                  <input
                    className="input"
                    placeholder="poster URL (опц.)"
                    value={m.poster || ""}
                    onChange={(e) => updMedia(i, { poster: e.target.value })}
                  />
                ) : (
                  <div className="badge gray">image</div>
                )}

                <div className="actions">
                  <button className="btn sm" onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button className="btn sm" onClick={() => move(i, 1)}>
                    ↓
                  </button>
                  <button className="btn sm danger" onClick={() => delMedia(i)}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="actions mt-16">
            <button className="btn primary" onClick={save}>
              Сохранить
            </button>
            <button className="btn" onClick={() => nav("/admin")}>
              Отмена
            </button>
          </div>
        </div>
      </div>

      {/* Правая колонка — предпросмотр Aurora */}
      <div className="preview-card panel">
        <div className="panel-header">
          <div className="panel-title">Предпросмотр</div>
        </div>
        <div className="panel-body">
          <AuroraVenue
            hero={hero}
            media={
              // ключ на <video> внутри Aurora: авто-play при переключении
              auroraMedia.map((it) =>
                it.type === "video"
                  ? {
                      ...it,
                      key: (it.sources?.[0]?.src || "") + Math.random(),
                    }
                  : it
              )
            }
            venue={auroraVenue}
            onShare={() => {}}
            showShare={false}
            showBook={false}
          />
        </div>
      </div>
    </div>
  );
}

function pickPoster() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}
