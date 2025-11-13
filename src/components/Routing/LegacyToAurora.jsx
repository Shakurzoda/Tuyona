// src/components/Routing/LegacyToAurora.jsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function LegacyToAurora({ mapType = "restaurant" }) {
    const nav = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (!id) return;
        nav(`/aurora/${mapType}/${id}`, { replace: true });
    }, [id, mapType, nav]);

    return null;
}
