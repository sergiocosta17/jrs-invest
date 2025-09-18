import { FiLogOut } from 'react-icons/fi';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    
    toast.success('Você saiu com sucesso.');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.userMenu}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Sair <FiLogOut />
        </button>
      </div>
    </header>
  );
}