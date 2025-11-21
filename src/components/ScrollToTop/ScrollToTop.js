import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // небольшой отложенный вызов, чтобы контент уже отрендерился
    const id = setTimeout(() => {
      // 1) пробуем основной контейнер .App (очень частый случай)
      const app = document.querySelector(".App");
      if (app && app.scrollHeight > app.clientHeight) {
        if (typeof app.scrollTo === "function") {
          app.scrollTo({ top: 0, left: 0, behavior: "auto" });
        } else {
          app.scrollTop = 0;
        }
      }

      // 2) на всякий случай дёргаем window + html + body
      if (
        typeof window !== "undefined" &&
        typeof window.scrollTo === "function"
      ) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }

      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    }, 0);

    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
