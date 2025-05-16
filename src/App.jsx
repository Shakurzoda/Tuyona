import "./App.css";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./components/Pages/Home/Home";
import CategoryPage from "./components/Pages/CategoryPage/CategoryPage";
import UserAdDetails from "./components/Pages/UserAdDetails/UserAdDetails";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/userAdDetails" element={<UserAdDetails />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
