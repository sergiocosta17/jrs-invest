import { Link } from 'react-router-dom';
import { FiArrowRight, FiPieChart, FiTrendingUp, FiShield } from 'react-icons/fi';
import styles from './Home.module.css';
import logoImage from '../../assets/jrs-Invest-logo-azul.svg';

export function Home() {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <img src={logoImage} alt="JRS Invest" className={styles.logo} />
        <div className={styles.navActions}>
          <Link to="/login" className={styles.linkLogin}>Entrar</Link>
          <Link to="/register" className={styles.btnRegister}>Criar conta</Link>
        </div>
      </nav>

      <header className={styles.hero}>
        <span className={styles.badge}>Gestão de Alta Performance</span>
        <h1 className={styles.heroTitle}>
          Seus investimentos,<br />
          <span>sob controle total.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Consolide sua carteira, acompanhe sua rentabilidade em tempo real e tome decisões baseadas em dados. A plataforma completa para o investidor moderno.
        </p>
        <Link to="/register" className={styles.ctaButton}>
          Começar Agora <FiArrowRight />
        </Link>
      </header>

      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>Por que escolher a JRS Invest?</h2>
          <p>Tecnologia e design a favor do seu patrimônio.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}><FiPieChart /></div>
            <h3>Consolidação Inteligente</h3>
            <p>Visualize todos os seus ativos em um único lugar. Ações, FIIs e Renda Fixa integrados em um dashboard intuitivo.</p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.iconWrapper}><FiTrendingUp /></div>
            <h3>Rentabilidade Real</h3>
            <p>Acompanhe a evolução do seu patrimônio com gráficos detalhados e cálculo automático de preço médio.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper}><FiShield /></div>
            <h3>Segurança e Privacidade</h3>
            <p>Seus dados são seus. Utilizamos criptografia de ponta para garantir que suas informações estejam sempre protegidas.</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="#">Termos de Uso</a>
          <a href="#">Política de Privacidade</a>
          <a href="#">Suporte</a>
        </div>
        <p className={styles.copy}>&copy; {new Date().getFullYear()} JRS Invest. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}