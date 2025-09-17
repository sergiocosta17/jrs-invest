import { FiLogOut } from 'react-icons/fi';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.userMenu}>
        <span>Usuário Demo</span>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Sair <FiLogOut />
        </button>
      </div>
    </header>
  );
}