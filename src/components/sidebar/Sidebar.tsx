import styles from './Sidebar.module.css';
import { NavLink } from 'react-router-dom'; 
import { FiGrid, FiBarChart2, FiRepeat, FiFileText } from 'react-icons/fi';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>JRS Invest</div>
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