import styles from './Sidebar.module.css';
import { Link, NavLink } from 'react-router-dom';
import { FiGrid, FiRepeat, FiFileText, FiBarChart2 } from 'react-icons/fi';
import logoImage from '../../assets/jrs-invest-logo.svg';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link to="/dashboard">
          <img src={logoImage} alt="JRS Invest Logo" className={styles.logoImage} />
        </Link>
      </div>
      
      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiGrid size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/carteira" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiBarChart2 size={20} />
          <span>Carteira</span>
        </NavLink>
        <NavLink to="/operacoes" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiRepeat size={20} />
          <span>Operações</span>
        </NavLink>
        <NavLink to="/relatorios" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <FiFileText size={20} />
          <span>Relatórios</span>
        </NavLink>
      </nav>
    </aside>
  );
}