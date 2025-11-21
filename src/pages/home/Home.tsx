import { Link } from 'react-router-dom';
import { FiArrowRight, FiPieChart, FiTrendingUp, FiShield, FiPlayCircle } from 'react-icons/fi';
import { ThemeToggle } from '../../components/theme-toggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import styles from './Home.module.css';
import logoDark from '../../assets/jrs-Invest-logo.svg';
import logoLight from '../../assets/jrs-Invest-logo-azul.svg';

export function Home() {
  const { theme } = useTheme();
  const currentLogo = theme === 'dark' ? logoDark : logoLight;

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <img src={currentLogo} alt="JRS Invest" className={styles.logo} />
        <div className={styles.navActions}>
          <ThemeToggle />
          <Link to="/login" className={styles.linkLogin}>Entrar</Link>
          <Link to="/register" className={styles.btnRegister}>Criar conta</Link>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Plataforma de Gestão Inteligente</span>
          <h1 className={styles.heroTitle}>
            Domine seus investimentos com <span>precisão absoluta.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Abandone as planilhas complexas. Consolide sua carteira, acompanhe a rentabilidade em tempo real e tome decisões baseadas em dados claros.
          </p>
          <div className={styles.heroActions}>
            <Link to="/register" className={styles.ctaButton}>
              Começar Agora <FiArrowRight />
            </Link>
            <a href="#recursos" className={styles.secondaryButton}>
              <FiPlayCircle /> Ver como funciona
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.chartMockup}>
            <div className={`${styles.chartBar} ${styles.bar1}`}></div>
            <div className={`${styles.chartBar} ${styles.bar2}`}></div>
            <div className={`${styles.chartBar} ${styles.bar3}`}></div>
            <div className={`${styles.chartBar} ${styles.bar4}`}></div>
            <div className={`${styles.chartBar} ${styles.bar5}`}></div>
            
            <div className={styles.floatingCard}>
              <div className={styles.iconCircle}><FiTrendingUp /></div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Rentabilidade</strong>
                <span style={{ color: '#00C48C', fontWeight: 'bold' }}>+12.5%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>+...k</span>
            <span className={styles.statLabel}>Operações Registradas</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statLabel}>Segurança de Dados</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>0,00</span>
            <span className={styles.statLabel}>Custo para Começar</span>
          </div>
        </div>
      </section>

      <section id="recursos" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>Tecnologia a favor do seu patrimônio</h2>
          <p>Tudo o que você precisa para gerenciar sua carteira de ações, FIIs e Renda Fixa em um único lugar.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><FiPieChart /></div>
            <h3>Consolidação Automática</h3>
            <p>Visualize a alocação dos seus ativos com gráficos intuitivos. Saiba exatamente onde está o seu dinheiro.</p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardIcon}><FiTrendingUp /></div>
            <h3>Preço Médio Real</h3>
            <p>Chega de calcular preço médio na mão. O sistema atualiza automaticamente a cada nova operação de compra ou venda.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><FiShield /></div>
            <h3>Privacidade Total</h3>
            <p>Seus dados são criptografados e você é o único dono deles. Não vendemos informações para terceiros.</p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Pronto para evoluir sua gestão?</h2>
          <p>Junte-se a investidores inteligentes que já estão no controle. Crie sua conta gratuita hoje mesmo.</p>
          <Link to="/register" className={styles.whiteBtn}>
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <img src={currentLogo} alt="JRS Invest" className={styles.logo} />
            <p>A plataforma definitiva para o investidor moderno acompanhar sua evolução financeira.</p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.linkGroup}>
              <h4>Produto</h4>
              <a href="#">Recursos</a>
              <a href="#">Preços</a>
              <a href="#">App Mobile</a>
            </div>
            <div className={styles.linkGroup}>
              <h4>Suporte</h4>
              <a href="#">Central de Ajuda</a>
              <a href="#">Fale Conosco</a>
              <a href="#">Status</a>
            </div>
            <div className={styles.linkGroup}>
              <h4>Legal</h4>
              <a href="#">Termos de Uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} JRS Invest. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}