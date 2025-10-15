export default function OverlayLoader({ show, label = "Загружаем…" }) {
  if (!show) return null;
  return (
    <div className="overlayLoader">
      <div className="overlaySpinner" aria-live="polite">
        {label}
      </div>
    </div>
  );
}
