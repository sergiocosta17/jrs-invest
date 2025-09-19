import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import toast from 'react-hot-toast';

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
        <Link to="/perfil" className={styles.profileLink}>
          <FiUser />
          <span>Meu Perfil</span>
        </Link>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Sair <FiLogOut />
        </button>
      </div>
    </header>
  );
}