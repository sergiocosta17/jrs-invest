import { useState, useEffect } from 'react';
import styles from './Operacoes.module.css';
import { FiPlus } from 'react-icons/fi';
import { Modal } from '../../components/modal/Modal';
import { AddOperationForm } from './add-operacao/AddOperacao';

interface Operation {
  id: string;
  date: string;
  type: 'Compra' | 'Venda';
  asset: string;
  quantity: number;
  price: number;
  total: number;
}

export function Operacoes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const mockData: Operation[] = [
          { id: '1', date: '14/01/2024', type: 'Compra', asset: 'PETR4', quantity: 100, price: 28.50, total: 2850.00 },
          { id: '2', date: '19/01/2024', type: 'Compra', asset: 'VALE3', quantity: 50, price: 65.80, total: 3290.00 },
          { id: '3', date: '04/02/2024', type: 'Venda', asset: 'ITUB4', quantity: 50, price: 26.10, total: 1305.00 },
          { id: '4', date: '09/02/2024', type: 'Compra', asset: 'BBDC4', quantity: 150, price: 15.20, total: 2280.00 },
        ];
        setOperations(mockData);
      } catch (error) {
        console.error("Erro ao buscar operações", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperations();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleAddNewOperation = (newOperation: Operation) => {
    setOperations(prevOperations => [newOperation, ...prevOperations]);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Histórico de Operações</h1>
        <button className={styles.newOperationButton} onClick={handleOpenModal}>
          <FiPlus size={20} />
          Nova Operação
        </button>
      </header>

      <div className={styles.contentCard}>
        <h2>Últimas Operações</h2>
        <p className={styles.subtitle}>Histórico completo de compras e vendas</p>
        <table className={styles.operationsTable}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Ativo</th>
              <th>Quantidade</th>
              <th>Preço</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op.id}>
                <td>{op.date}</td>
                <td>
                  <span className={op.type === 'Compra' ? styles.tagCompra : styles.tagVenda}>
                    {op.type}
                  </span>
                </td>
                <td>{op.asset}</td>
                <td>{op.quantity}</td>
                <td>{op.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{op.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AddOperationForm 
          onClose={handleCloseModal}
          onOperationAdded={handleAddNewOperation}
        />
      </Modal>
    </div>
  );
}