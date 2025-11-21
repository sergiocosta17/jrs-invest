import styles from './Sidebar.module.css';
import { Link, NavLink } from 'react-router-dom';
import { FiGrid, FiRepeat, FiFileText, FiBarChart2 } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import logoDark from '../../assets/jrs-Invest-logo.svg';
import logoLight from '../../assets/jrs-Invest-logo-azul.svg';

interface SidebarProps {
  isOpen: boolean;
  closeMenu: () => void;
}

export function Sidebar({ isOpen, closeMenu }: SidebarProps) {
  const { theme } = useTheme();
  const sidebarClasses = `${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`;
  
  const currentLogo = theme === 'dark' ? logoDark : logoLight;

  return (
    <aside className={sidebarClasses}>
      <Link to="/dashboard" onClick={closeMenu}>
        <div className={styles.logoContainer}>
          <img src={currentLogo} alt="JRS Invest Logo" className={styles.logoImage} />
        </div>
      </Link>
      
      <nav className={styles.nav}>
        <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiGrid size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/carteira" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiBarChart2 size={20} />
          <span>Carteira</span>
        </NavLink>
        <NavLink to="/operacoes" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiRepeat size={20} />
          <span>Operações</span>
        </NavLink>
        <NavLink to="/relatorios" onClick={closeMenu} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiFileText size={20} />
          <span>Relatórios</span>
        </NavLink>
      </nav>
    </aside>
  );
}