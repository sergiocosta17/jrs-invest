import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import { Header } from '../header/Header';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}