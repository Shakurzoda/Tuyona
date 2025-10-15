import { Navigate, useParams } from "react-router-dom";


export default function LegacyToAurora({ mapType }) {
  const { id } = useParams();
  const type = mapType.toLowerCase();
  return <Navigate to={`/aurora/${type}/${id}`} replace />;
}
