import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";
import Logo from "./logo.png";
import { Link } from 'react-router';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1024) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  const isMobile = windowWidth <= 1024;

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Логотип */}
        <div className={styles.logoContainer}>
          <a href="/" className={styles.logoLink}>
            {/* <Logo className={styles.logo} />  */}
            <img src={Logo} alt="Логотип" className={styles.logo} />
            {/* <span className={styles.logoText}>{Logo}</span> */}
          </a>
        </div>

        <button
          className={`${styles.burger} ${isOpen ? styles.open : ""}`}
          onClick={toggleMenu}
          aria-label="Меню"
          aria-expanded={isOpen}
        >
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>

        <nav className={`${styles.nav} ${isOpen ? styles.open : ""}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink} onClick={closeMenu}>
                Главная
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                to="/category"
                className={styles.navLink}
                onClick={closeMenu}
              >
                Категории
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/about" className={styles.navLink} onClick={closeMenu}>
                О нас
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                to="/contact"
                className={styles.navLink}
                onClick={closeMenu}
              >
                Контакты
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div
        className={`${styles.overlay} ${isOpen ? styles.active : ""}`}
        onClick={closeMenu}
      />
    </header>
  );
};

export default Header;
