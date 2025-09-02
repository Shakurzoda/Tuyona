import { useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Header from "./components/Header/Header";
import Home from "./components/Pages/Home/Home";
import CategoryPage from "./components/Pages/CategoryPage/CategoryPage";
import UserAdDetails from "./components/Pages/UserAdDetails/UserAdDetails";
import Footer from "./components/Footer/Footer";
import RestaurantPage from "./components/Pages/RestaurantPage/RestaurantPage";
import MusiciansPage from "./components/Pages/MusiciansPage/MusiciansPage";
import CarsPage from "./components/Pages/CarsPage/CarsPage";
import DecorationPage from "./components/Pages/DecorationPage/DecorationPage";
import PresentersPage from "./components/Pages/PresentersPage/PresentersPage";
import PhotographersPage from "./components/Pages/PhotographersPage/PhotographersPage";
import SingersPage from "./components/Pages/SingersPage/SingersPage";
import BeautySalonsPage from "./components/Pages/BeautySalonsPage/BeautySalonsPage";
import PartnershipsPage from "./components/Pages/PartnershipsPage/PartnershipsPage";

function App() {
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
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/musicians/:id" element={<MusiciansPage />} />
        <Route path="/cars/:id" element={<CarsPage />} />
        <Route path="/decoration/:id" element={<DecorationPage />} />
        <Route path="/presenters/:id" element={<PresentersPage />} />
        <Route path="/photographers/:id" element={<PhotographersPage />} />
        <Route path="/singers/:id" element={<SingersPage />} />
        <Route path="/beautySalons/:id" element={<BeautySalonsPage />} />
        <Route path="/userAdDetails" element={<UserAdDetails />} />
        <Route path="/partnerships" element={<PartnershipsPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
