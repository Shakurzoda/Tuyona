import styles from "./Header.module.css";
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const Header = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
     const handleScroll = () => {
       setScrolled(window.scrollY > 10);
     };
     window.addEventListener("scroll", handleScroll);
     return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   const navItems = [
     { name: "Главная", to: "/" },
     { name: "Категории", to: "/category" },
     { name: "О нас", to: "#about" },
     { name: "Добавить свое объявление", to: "#contact" },
   ];

   return (
     <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
       <div className={styles.container}>
         <Link to="/" className={styles.logo}>
           Tuyona
         </Link>
         <nav className={styles.desktopNav}>
           {navItems.map((item) => (
             <Link key={item.name} to={item.to} className={styles.navLink}>
               {item.name}
               <span className={styles.underline}></span>
             </Link>
           ))}
         </nav>
         <button
           className={`${styles.burger} ${isOpen ? styles.open : ""}`}
           onClick={() => setIsOpen(!isOpen)}
           aria-label="Меню"
         >
           <span></span>
           <span></span>
           <span></span>
         </button>
         <div className={`${styles.mobileNav} ${isOpen ? styles.open : ""}`}>
           <nav className={styles.mobileNavContent}>
             {navItems.map((item) => (
               <Link
                 key={item.name}
                 to={item.to}
                 className={styles.mobileNavLink}
                 onClick={() => setIsOpen(false)}
               >
                 {item.name}
               </Link>
             ))}
           </nav>
         </div>
       </div>
     </header>
   );
};

export default Header;
