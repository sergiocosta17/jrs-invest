import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './Operacoes.module.css';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Modal } from '../../components/modal/Modal';
import { AddOperationForm } from './add-operacao/AddOperacao';
import { motion } from 'framer-motion';

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
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/operations');
        setOperations(response.data);
      } catch (error) {
        console.error("Erro ao buscar operações", error);
        toast.error("Não foi possível carregar as operações.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOperations();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOperation(null);
  };

  const handleOpenCreateModal = () => {
    setEditingOperation(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (operation: Operation) => {
    setEditingOperation(operation);
    setIsModalOpen(true);
  };

  const handleSaveOperation = (savedOperation: Operation) => {
    if (operations.some(op => op.id === savedOperation.id)) {
      setOperations(operations.map(op => op.id === savedOperation.id ? savedOperation : op));
    } else {
      setOperations(prev => [savedOperation, ...prev]);
    }
  };

  const handleDeleteOperation = async (id: string | number) => {
    const isConfirmed = window.confirm('Tem certeza que deseja excluir esta operação?');
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/api/operations/${id}`);
        setOperations(operations.filter(op => String(op.id) !== String(id)));
        toast.success('Operação excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir operação', error);
        toast.error('Não foi possível excluir a operação.');
      }
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      <header className={styles.header}>
        <h1>Histórico de Operações</h1>
        <button className={styles.newOperationButton} onClick={handleOpenCreateModal}>
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op.id}>
                <td>{new Date(op.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>
                  <span className={`${styles.tag} ${op.type === 'Compra' ? styles.tagCompra : styles.tagVenda}`}>
                    {op.type}
                  </span>
                </td>
                <td>{op.asset}</td>
                <td>{op.quantity}</td>
                <td>{Number(op.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{Number(op.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionButton} onClick={() => handleOpenEditModal(op)}>
                      <FiEdit size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDeleteOperation(String(op.id))}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <AddOperationForm
          onClose={handleCloseModal}
          onSave={handleSaveOperation}
          operationToEdit={editingOperation}
        />
      </Modal>
    </motion.div>
  );
}