import styles from './MyButton.module.css';

const MyButton = ({
  color = "white",
  size = "medium",
  children,
  disabled = false,
  onClick
}) => {
  const colorClass = color === "green" ? styles.green : styles.white;
  const sizeClass = size === "large" ? styles.large : styles.medium;

  return (
    <button
      className={`${styles.MyButton} ${colorClass} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default MyButton;

