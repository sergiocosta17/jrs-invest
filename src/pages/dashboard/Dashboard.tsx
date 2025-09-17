import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';

interface DashboardSummary {
  total_investido: string;
  total_vendido: string;
}

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dashboard/summary');
        setSummary(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return <div className={styles.centeredMessage}>Carregando dados do Dashboard...</div>;
  }

  const valorInvestido = summary ? parseFloat(summary.total_investido) : 0;
  
  const valorAtual = valorInvestido;
  const rentabilidadeValor = valorAtual - valorInvestido;
  const rentabilidadePercentual = valorInvestido > 0 ? (rentabilidadeValor / valorInvestido) * 100 : 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <header>
            <p>Valor Investido</p>
            <span>$</span>
          </header>
          <strong>
            {valorInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>

        <div className={styles.card}>
          <header>
            <p>Valor Atual</p>
            <span>ⓘ</span>
          </header>
          <strong>
            {valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
          <small className={styles.cardSubtext}>*Valor de custo. Cotações em breve.</small>
        </div>

        <div className={styles.card}>
          <header>
            <p>Rentabilidade</p>
            <span>↗</span>
          </header>
          <strong style={{ color: rentabilidadeValor >= 0 ? '#33cc95' : '#e53e3e' }}>
            {rentabilidadeValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
          <span style={{ color: rentabilidadeValor >= 0 ? '#33cc95' : '#e53e3e' }}>
            {rentabilidadeValor >= 0 ? '+' : ''}{rentabilidadePercentual.toFixed(2)}%
          </span>
        </div>
      </div>
      
    </div>
  );
}