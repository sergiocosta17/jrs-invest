import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';
import { motion } from 'framer-motion';

interface PositionDetailed {
  asset: string;
  quantity: string;
  total_invested: string;
}

interface Quote {
  symbol: string;
  regularMarketPrice: number;
}

export function Dashboard() {
  const [valorInvestido, setValorInvestido] = useState(0);
  const [valorAtual, setValorAtual] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const portfolioResponse = await axios.get('http://localhost:3001/api/portfolio/detailed');
        const portfolio: PositionDetailed[] = portfolioResponse.data;

        const totalInvestido = portfolio.reduce((acc, position) => acc + parseFloat(position.total_invested), 0);
        setValorInvestido(totalInvestido);

        if (portfolio.length > 0) {
          const tickers = portfolio.map(p => p.asset).join(',');
          const quotesResponse = await axios.get<Quote[]>(`http://localhost:3001/api/quotes/${tickers}`);
          const quotes = quotesResponse.data;

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <header><p>Custo da Carteira</p><span>$</span></header>
          <strong>{valorInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
        </div>
        <div className={styles.card}>
          <header><p>Valor Atual</p><span>ⓘ</span></header>
          <strong>{valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
        </div>
        <div className={styles.card}>
          <header><p>Rentabilidade</p><span>↗</span></header>
        <strong className={rentabilidadeValor >= 0 ? styles.positive : styles.negative}>
          {rentabilidadeValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </strong>
        <span className={rentabilidadeValor >= 0 ? styles.positive : styles.negative}>
          {rentabilidadeValor >= 0 ? '+' : ''}{rentabilidadePercentual.toFixed(2)}%
        </span>
        </div>
      </div>
    </motion.div>
  );
}