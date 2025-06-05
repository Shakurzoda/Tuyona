import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const isCategoryInternalNavigation =
      pathname.includes("/category/") && navigationType === "PUSH";

    if (!isCategoryInternalNavigation) {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}
