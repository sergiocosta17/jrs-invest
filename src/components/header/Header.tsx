import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import toast from 'react-hot-toast';
import { ThemeToggle } from '../theme-toggle/ThemeToggle';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast.success('Você saiu com sucesso.');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <button className={styles.menuButton} onClick={onMenuToggle}>
        <FiMenu size={24} />
      </button>

      <div className={styles.userMenu}>
        
        <ThemeToggle />
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>

        <Link to="/perfil" className={styles.profileLink}>
          <FiUser size={20} />
          <span>Meu Perfil</span>
        </Link>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Sair <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
}