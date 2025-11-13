import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import Home from "./components/Pages/Home/Home";
import CategoryPage from "./components/Pages/CategoryPage/CategoryPage";
import UserAdDetails from "./components/Pages/UserAdDetails/UserAdDetails";
import PartnershipsPage from "./components/Pages/PartnershipsPage/PartnershipsPage";
import UniversalVenuePage from "./components/Pages/UniversalVenuePage/UniversalVenuePage";
import LegacyToAurora from "./components/Routing/LegacyToAurora";

// Админка
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminVenues from "./admin/AdminVenues";
import AdminVenueEdit from "./admin/AdminVenueEdit";

// НОВОЕ:
import NotFound from "./components/Pages/NotFound/NotFound";
import ErrorBoundary from "./components/Errors/ErrorBoundary";

function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    useEffect(() => {
        const lcpImages = ["/hero-image.webp", "/main-banner.jpg"];
        lcpImages.forEach((img) => {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = img;
            document.head.appendChild(link);
        });
    }, []);

    return (
        <div className="App">
            {!isAdminRoute && <Header />}
            <ScrollToTop />

            {/* ErrorBoundary с resetKey — сбрасывается при смене маршрута */}
            <ErrorBoundary resetKey={location.pathname}>
                <Routes>
                    {/* Универсальная деталка */}
                    <Route path="/aurora/:type/:id" element={<UniversalVenuePage />} />

                    {/* Редиректы со старых детальных (если используете) */}
                    <Route path="/restaurant/:id" element={<LegacyToAurora mapType="restaurant" />} />
                    <Route path="/musicians/:id" element={<LegacyToAurora mapType="musician" />} />
                    <Route path="/cars/:id" element={<LegacyToAurora mapType="car" />} />
                    <Route path="/decoration/:id" element={<LegacyToAurora mapType="decoration" />} />
                    <Route path="/presenters/:id" element={<LegacyToAurora mapType="presenter" />} />
                    <Route path="/photographers/:id" element={<LegacyToAurora mapType="photographer" />} />
                    <Route path="/singers/:id" element={<LegacyToAurora mapType="singer" />} />
                    <Route path="/beautySalons/:id" element={<LegacyToAurora mapType="beauty_salon" />} />

                    {/* Публичные */}
                    <Route path="/" element={<Home />} />
                    <Route path="/category" element={<CategoryPage />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/userAdDetails" element={<UserAdDetails />} />
                    <Route path="/partnerships" element={<PartnershipsPage />} />

                    {/* Админка */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminVenues />} />
                        <Route path="venues/new" element={<AdminVenueEdit />} />
                        <Route path="venues/:id" element={<AdminVenueEdit />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </ErrorBoundary>

            {!isAdminRoute && <Footer />}
        </div>
    );
}

export default App;
