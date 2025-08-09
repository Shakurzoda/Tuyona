import styles from "./Header.module.css";
import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    const handleClickOutside = (event) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        const burgerButton = document.querySelector(`.${styles.burger}`);
        if (!burgerButton.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const navItems = [
    { name: "Главная", to: "/" },
    { name: "Категории", to: "/category" },
/*     { name: "О нас", to: "/about" }, */
    { name: "Стать партнером", to: "/partnerships" },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={() => setIsOpen(false)}>
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
          aria-expanded={isOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div 
          ref={mobileNavRef}
          className={`${styles.mobileNav} ${isOpen ? styles.open : ""}`}
          aria-hidden={!isOpen}
        >
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