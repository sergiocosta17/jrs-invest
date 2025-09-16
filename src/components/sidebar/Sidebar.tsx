import styles from './Sidebar.module.css';
/*import logo from '../../assets/jrs-invest-logo.png';*/

import { FiGrid, FiBarChart2, FiFileText } from 'react-icons/fi';

export function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logoContainer}>
        {/*<img src={logo} alt="JRS Invest Logo" />*/}
        <h1 className={styles.logoText}>JRS Invest</h1>
      </div>

      <ul className={styles.navList}>
        <li className={`${styles.navItem} ${styles.active}`}>
          <FiGrid size={20} />
          <span>Dashboard</span>
        </li>
        <li className={styles.navItem}>
          <FiBarChart2 size={20} />
          <span>Carteira</span>
        </li>
        <li className={styles.navItem}>
          <FiFileText size={20} />
          <span>Operações</span>
        </li>
        <li className={styles.navItem}>
          <FiFileText size={20} />
          <span>Relatórios</span>
        </li>
      </ul>
    </nav>
  );
}