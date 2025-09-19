import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import { Header } from '../header/Header';
import styles from './Layout.module.css';

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isMenuOpen} closeMenu={toggleMenu} />
      
      <div 
        className={`${styles.overlay} ${isMenuOpen ? styles.visible : styles.hidden}`}
        onClick={toggleMenu}
      />

      <div className={styles.mainContent}>
        <Header onMenuToggle={toggleMenu} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}