// App.jsx / App.js
import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ErrorBoundary from "./components/Errors/ErrorBoundary";

// ==== ленивые страницы (code splitting) ====
const Home = lazy(() => import("./components/Pages/Home/Home"));
const CategoryPage = lazy(() =>
  import("./components/Pages/CategoryPage/CategoryPage")
);
const UserAdDetails = lazy(() =>
  import("./components/Pages/UserAdDetails/UserAdDetails")
);
const PartnershipsPage = lazy(() =>
  import("./components/Pages/PartnershipsPage/PartnershipsPage")
);
const UniversalVenuePage = lazy(() =>
  import("./components/Pages/UniversalVenuePage/UniversalVenuePage")
);
const LegacyToAurora = lazy(() =>
  import("./components/Routing/LegacyToAurora")
);
const AboutPage = lazy(() => import("./components/Pages/AboutPage/AboutPage"));

// Админка
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminVenues = lazy(() => import("./admin/AdminVenues"));
const AdminVenueEdit = lazy(() => import("./admin/AdminVenueEdit"));
const AdminCategories = lazy(() => import("./admin/AdminCategories"));


// 404
const NotFound = lazy(() => import("./components/Pages/NotFound/NotFound"));

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

    useEffect(() => {
      // Прелоадим hero-картинки ТОЛЬКО на главной
      if (location.pathname !== "/") return;

      const lcpImages = ["/hero-image.webp", "/main-banner.jpg"];

      lcpImages.forEach((img) => {
        const exists = document.head.querySelector(
          `link[rel="preload"][as="image"][href="${img}"]`
        );
        if (exists) return;

        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = img;
        document.head.appendChild(link);
      });
    }, [location.pathname]);

  return (
    <div className="App">
      {!isAdminRoute && <Header />}
      <ScrollToTop />

      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<div className="page-loader">Загрузка…</div>}>
          <Routes>
            {/* Универсальная деталка */}
            <Route path="/aurora/:type/:id" element={<UniversalVenuePage />} />

            {/* Редиректы со старых детальных */}
            <Route
              path="/restaurant/:id"
              element={<LegacyToAurora mapType="restaurant" />}
            />
            <Route
              path="/musicians/:id"
              element={<LegacyToAurora mapType="musician" />}
            />
            <Route
              path="/cars/:id"
              element={<LegacyToAurora mapType="car" />}
            />
            <Route
              path="/decoration/:id"
              element={<LegacyToAurora mapType="decoration" />}
            />
            <Route
              path="/presenters/:id"
              element={<LegacyToAurora mapType="presenter" />}
            />
            <Route
              path="/photographers/:id"
              element={<LegacyToAurora mapType="photographer" />}
            />
            <Route
              path="/singers/:id"
              element={<LegacyToAurora mapType="singer" />}
            />
            <Route
              path="/beautySalons/:id"
              element={<LegacyToAurora mapType="beauty_salon" />}
            />

            {/* Публичные страницы */}
            <Route path="/" element={<Home />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/userAdDetails" element={<UserAdDetails />} />
            <Route path="/partnerships" element={<PartnershipsPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Админка */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminVenues />} />
              <Route path="venues/new" element={<AdminVenueEdit />} />
              <Route path="venues/:id" element={<AdminVenueEdit />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
