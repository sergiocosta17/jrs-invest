import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Carteira.module.css';
import { Modal } from '../../components/modal/Modal';
import { AddOperationForm } from '../operacoes/add-operacao/AddOperacao';

interface PositionDetailed {
  asset: string;
  quantity: string;
  average_price: string;
  total_invested: string;
  current_price?: number;
  daily_change?: number;
  current_value?: number;
  result_value?: number;
  result_percent?: number;
}

interface Quote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
}

export function Carteira() {
  const [positions, setPositions] = useState<PositionDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasFetched = useRef(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const portfolioResponse = await axios.get('http://localhost:3001/api/portfolio/detailed');
      const portfolio: PositionDetailed[] = portfolioResponse.data;

      if (portfolio.length > 0) {
        const tickers = portfolio.map(p => p.asset).join(',');
        const quotesResponse = await axios.get(`http://localhost:3001/api/quotes/${tickers}`);
        const quotes: Quote[] = quotesResponse.data;

        const quotesMap = quotes.reduce((acc, quote) => {
          acc[quote.symbol] = {
            price: quote.regularMarketPrice,
            change: quote.regularMarketChangePercent,
          };
          return acc;
        }, {} as { [key: string]: { price: number, change: number } });

        const finalPositions = portfolio.map(pos => {
          const quantity = parseFloat(pos.quantity);
          const totalInvested = parseFloat(pos.total_invested);
          const currentPrice = quotesMap[pos.asset]?.price || 0;
          const currentValue = quantity * currentPrice;
          const resultValue = currentValue - totalInvested;
          const resultPercent = totalInvested > 0 ? (resultValue / totalInvested) * 100 : 0;

          return {
            ...pos,
            current_price: currentPrice,
            daily_change: quotesMap[pos.asset]?.change || 0,
            current_value: currentValue,
            result_value: resultValue,
            result_percent: resultPercent,
          };
        });
        setPositions(finalPositions);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados da carteira:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  const handleSaveOperation = () => {
    fetchData();
  };

  if (isLoading) {
    return <div className={styles.centeredMessage}>Carregando sua carteira...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Carteira</h1>
      </header>

      <div className={styles.contentCard}>
        <h2>Lista de Ativos</h2>
        <p className={styles.subtitle}>Todos os seus investimentos em um só lugar</p>

        <div className={styles.tableWrapper}>
          <table className={styles.assetsTable}>
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Quantidade</th>
                <th>Preço Médio</th>
                <th>Preço Atual</th>
                <th>Variação</th>
                <th>Total Investido</th>
                <th>Valor Atual</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => (
                <tr key={pos.asset}>
                  <td>
                    <div className={styles.assetName}>
                      {pos.asset}
                    </div>
                  </td>
                  <td>{pos.quantity}</td>
                  <td>{Number(pos.average_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>{pos.current_price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <span className={`${styles.tag} ${pos.daily_change && pos.daily_change >= 0 ? styles.tagPositive : styles.tagNegative}`}>
                      {pos.daily_change?.toFixed(2)}%
                    </span>
                  </td>
                  <td>{Number(pos.total_invested).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>{pos.current_value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className={pos.result_value && pos.result_value >= 0 ? styles.positive : styles.negative}>
                    {pos.result_value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    <span>({pos.result_percent?.toFixed(2)}%)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddOperationForm 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOperation}
        />
      </Modal>
    </div>
  );
}