import { useState } from 'react';
import api from '../../services/api';
import styles from './Relatorios.module.css';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function Relatorios() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));
  const [format, setFormat] = useState('pdf');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerateReport = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get('/api/reports', {
        params: {
          format,
          startDate,
          endDate,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `relatorio-operacoes-${startDate}-a-${endDate}.${format}`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Não foi possível gerar o relatório.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={styles.container}>
      <h1 className={styles.title}>Relatórios</h1>
      <p className={styles.subtitle}>Exporte o histórico de suas operações por período.</p>

      <div className={styles.formCard}>
        <h2>Gerar Relatório de Operações</h2>
        <div className={styles.formRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="startDate">Data de Início</label>
            <input 
              type="date" 
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="endDate">Data Final</label>
            <input 
              type="date" 
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="format">Formato</label>
            <select 
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={styles.input}
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
        <button 
          className={styles.generateButton}
          onClick={handleGenerateReport}
          disabled={isDownloading}
        >
          {isDownloading ? 'Gerando...' : 'Baixar Relatório'}
        </button>
      </div>
    </motion.div>
  );
}