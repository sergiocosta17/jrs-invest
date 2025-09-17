import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';

//interface SummaryResponse {
//  total_investido: string;
//}

interface PortfolioPosition {
  asset: string;
  quantity: string;
}

interface Quote {
  symbol: string;
  regularMarketPrice: number;
}

export function Dashboard() {
  const [valorInvestido, setValorInvestido] = useState(0);
  const [valorAtual, setValorAtual] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, portfolioResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/dashboard/summary'),
          axios.get('http://localhost:3001/api/portfolio')
        ]);

        const totalInvestido = parseFloat(summaryResponse.data.total_investido) || 0;
        setValorInvestido(totalInvestido);

        const portfolio: PortfolioPosition[] = portfolioResponse.data;

        if (portfolio.length > 0) {
          const tickers = portfolio.map(p => p.asset).join(',');
          const quotesResponse = await axios.get(`http://localhost:3001/api/quotes/${tickers}`);
          const quotes: Quote[] = quotesResponse.data;

          const quotesMap = quotes.reduce((acc, quote) => {
            acc[quote.symbol] = quote.regularMarketPrice;
            return acc;
          }, {} as { [key: string]: number });

          const valorAtualCalculado = portfolio.reduce((acc, position) => {
            const precoAtual = quotesMap[position.asset] || 0;
            const quantidade = parseFloat(position.quantity);
            return acc + (precoAtual * quantidade);
          }, 0);

          setValorAtual(valorAtualCalculado);
        }

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const rentabilidadeValor = valorAtual - valorInvestido;
  const rentabilidadePercentual = valorInvestido > 0 ? (rentabilidadeValor / valorInvestido) * 100 : 0;

  if (isLoading) {
    return <div className={styles.centeredMessage}>Carregando dados do Dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <header><p>Valor Investido</p><span>$</span></header>
          <strong>{valorInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
        </div>
        <div className={styles.card}>
          <header><p>Valor Atual</p><span>ⓘ</span></header>
          <strong>{valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
        </div>
        <div className={styles.card}>
          <header><p>Rentabilidade</p><span>↗</span></header>
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