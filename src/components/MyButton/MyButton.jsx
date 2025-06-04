import styles from "./MyButton.module.css";
import { Link } from "react-router-dom"; 

const MyButton = ({
  color = "white",
  size = "medium",
  children,
  disabled = false,
  onClick,
  href, 
  target = "_self",
  type = "button",
}) => {
  const colorClass = color === "green" ? styles.green : styles.white;
  const sizeClass = size === "large" ? styles.large : styles.medium;

  if (href) {
    const isExternal =
      href.startsWith("http") ||
      href.startsWith("mailto") ||
      href.startsWith("tel");

    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className={`${styles.MyButton} ${colorClass} ${sizeClass}`}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        to={href}
        className={`${styles.MyButton} ${colorClass} ${sizeClass}`}
      >
        {children}
      </Link>
    );
  }


  return (
    <button
      type={type}
      className={`${styles.MyButton} ${colorClass} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default MyButton;
