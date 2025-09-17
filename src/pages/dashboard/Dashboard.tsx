import { FiClock, FiDollarSign, FiLogOut, FiTrendingUp } from 'react-icons/fi';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom'; // PASSO 1: Importar

interface Asset {
  ticker: string;
  name: string;
  shares: number;
  dailyChange: string;
  totalValue: string;
  totalReturn: string;
  returnPercentage: string;
  isPositive: boolean;
}

export function Dashboard() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/login');
  };

  const portfolioSummary: Asset[] = [
    { ticker: 'PETR4', name: 'Petrobras PN', shares: 100, dailyChange: '+5.2%', totalValue: 'R$ 3.215,00', totalReturn: '+R$ 365,00', returnPercentage: '(12.81%)', isPositive: true },
    { ticker: 'VALE3', name: 'Vale ON', shares: 50, dailyChange: '+2.1%', totalValue: 'R$ 3.445,00', totalReturn: '+R$ 155,00', returnPercentage: '(4.71%)', isPositive: true },
    { ticker: 'ITUB4', name: 'Itaú Unibanco PN', shares: 200, dailyChange: '-1.8%', totalValue: 'R$ 4.970,00', totalReturn: '-R$ 90,00', returnPercentage: '(-1.78%)', isPositive: false },
  ];

  return (
    <>
      <header className={styles.header}>
        <div />
        <div className={styles.userMenu}>
          <span>Usuário Demo</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Sair <FiLogOut />
          </button>
        </div>
      </header>

      <main>
        <h1 className={styles.title}>Dashboard</h1>

        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Valor Investido</span>
              <FiDollarSign color="#888" />
            </div>
            <p className={styles.cardValue}>R$ 13.480,00</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Valor Atual</span>
              <FiClock color="#888" />
            </div>
            <p className={styles.cardValue}>R$ 14.097,50</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span>Rentabilidade</span>
              <FiTrendingUp color="#888" />
            </div>
            <p className={`${styles.cardValue} ${styles.positive}`}>+R$ 617,50</p>
            <span className={`${styles.percentage} ${styles.positive}`}>+4.58%</span>
          </div>
        </div>
      
        <div className={styles.portfolioSummary}>
          <h2>Resumo da Carteira</h2>
          <p className={styles.subtitle}>Visão geral dos seus investimentos</p>
          
          <div className={styles.assetList}>
            {portfolioSummary.map((asset) => (
              <div className={styles.assetCard} key={asset.ticker}>
                <div className={styles.assetInfo}>
                  <div className={styles.assetTickerGroup}>
                    <span className={styles.assetTicker}>{asset.ticker}</span>
                    <span className={asset.isPositive ? styles.tagPositive : styles.tagNegative}>
                      {asset.dailyChange}
                    </span>
                  </div>
                  <span className={styles.assetName}>{asset.name}</span>
                  <span className={styles.assetShares}>{asset.shares} cotas</span>
                </div>
                <div className={styles.assetValues}>
                  <span className={styles.assetTotalValue}>{asset.totalValue}</span>
                  <span className={asset.isPositive ? styles.positive : styles.negative}>
                    {asset.totalReturn} {asset.returnPercentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}