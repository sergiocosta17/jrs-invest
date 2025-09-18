import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PositionDetailed {
  asset: string;
  quantity: string;
  total_invested: string;
}

interface Quote {
  symbol: string;
  regularMarketPrice: number;
}

interface IbovData {
  regularMarketPrice: number;
  regularMarketChange: number;
  historicalDataPrice: {
    date: number;
    close: number;
  }[];
}

export function Dashboard() {
  const [valorInvestido, setValorInvestido] = useState(0);
  const [valorAtual, setValorAtual] = useState(0);
  const [ibovData, setIbovData] = useState<IbovData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const [portfolioResponse, ibovResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/portfolio/detailed'),
          axios.get('http://localhost:3001/api/chart/^BVSP')
        ]);

        setIbovData(ibovResponse.data);
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

  const formattedChartData = ibovData?.historicalDataPrice.map(item => ({
    date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    value: item.close,
  }));

  const rentabilidadeValor = valorAtual - valorInvestido;
  const rentabilidadePercentual = valorInvestido > 0 ? (rentabilidadeValor / valorInvestido) * 100 : 0;

  if (isLoading) {
    return <div className={styles.centeredMessage}>Carregando dados do Dashboard...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={styles.container}>
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

      {ibovData && (
        <motion.div className={styles.chartCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div className={styles.chartHeader}>
            <div>
              <h2>Ibovespa (IBOV)</h2>
              <p>Últimos 3 meses</p>
            </div>
            <div className={styles.chartStats}>
              <div>
                <strong>{ibovData.regularMarketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                <span>Pontos</span>
              </div>
              <div className={ibovData.regularMarketChange >= 0 ? styles.positive : styles.negative}>
                <strong>{ibovData.regularMarketChange >= 0 ? '+' : ''}{ibovData.regularMarketChange.toFixed(2)}</strong>
                <span>Variação (Dia)</span>
              </div>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#888' }} />
                <YAxis orientation="left" tickLine={false} axisLine={false} tickFormatter={(value) => new Intl.NumberFormat('pt-BR').format(value)} tick={{ fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a222e', border: 'none', borderRadius: '8px' }} 
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#0088FE' }}
                  formatter={(value: number) => `${value.toLocaleString('pt-BR')} pts`}
                />
                <Area type="monotone" dataKey="value" name="IBOV" stroke="#0088FE" strokeWidth={2} fillOpacity={1} fill="url(#chartColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}