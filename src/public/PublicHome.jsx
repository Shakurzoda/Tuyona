import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PublicHome() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    supabase
      .from("venues")
      .select("id,title,type")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .then(({ data }) => setRows(data || []));
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <h2>Площадки</h2>
      <ul>
        {rows.map((v) => (
          <li key={v.id}>
            <Link to={`/venue/${v.id}`}>{v.title}</Link>{" "}
            <small>({v.type})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
