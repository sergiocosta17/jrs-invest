import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={styles.toggleButton} 
      onClick={toggleTheme}
      aria-label="Alternar tema"
      title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
    >
      <div className={`${styles.iconWrapper} ${theme === 'dark' ? styles.dark : ''}`}>
        <FiSun className={styles.sun} />
        <FiMoon className={styles.moon} />
      </div>
    </button>
  );
}