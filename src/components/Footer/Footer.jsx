import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Навигация",
      links: [
        { name: "Главная", path: "/" },
        { name: "Категории", path: "/category" },
        { name: "О нас", path: "/about" },
        { name: "Контакты", path: "/contact" },
      ],
    },
    {
      title: "Контакты",
      links: [
        { name: "info@tuyona.com", path: "mailto:info@tuyona.com" },
        { name: "+7 (123) 456-78-90", path: "tel:+71234567890" },
        { name: "Москва, ул. Примерная, 123", path: "#" },
      ],
    },
    {
      title: "Соцсети",
      links: [
        { name: "Instagram", path: "https://instagram.com" },
        { name: "Facebook", path: "https://facebook.com" },
        { name: "Telegram", path: "https://t.me" },
        { name: "WhatsApp", path: "https://wa.me" },
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <Link to="/" className={styles.logo}>
            Tuyona
          </Link>
          <p className={styles.description}>
            Создаем незабываемые моменты для ваших особенных событий
          </p>
          <div className={styles.socialIcons}>
            {footerLinks[2].links.map((social, index) => (
              <a
                key={index}
                href={social.path}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label={social.name}
              >
                <span className={styles.icon}>{social.name.charAt(0)}</span>
              </a>
            ))}
          </div>
        </div>
        <div className={styles.linksGrid}>
          {footerLinks.slice(0, 2).map((column, index) => (
            <div key={index} className={styles.linkColumn}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <ul className={styles.linkList}>
                {column.links.map((link, idx) => (
                  <li key={idx}>
                    {link.path.startsWith("http") ||
                    link.path.startsWith("mailto") ||
                    link.path.startsWith("tel") ? (
                      <a
                        href={link.path}
                        className={styles.link}
                        target={
                          link.path.startsWith("http") ? "_blank" : "_self"
                        }
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link to={link.path} className={styles.link}>
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.bottomFooter}>
        <div className={styles.container}>
          <p className={styles.copyright}>
            © {currentYear} Tuyona. Все права защищены
          </p>
          <div className={styles.legalLinks}>
            <Link to="/privacy" className={styles.legalLink}>
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className={styles.legalLink}>
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
