import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AddOperacao.module.css';

const OperationSchema = Yup.object().shape({
  date: Yup.date()
    .required('Obrigatório')
    .max(new Date(), 'A data não pode ser no futuro'),
  type: Yup.string().oneOf(['Compra', 'Venda']).required('Obrigatório'),
  asset: Yup.string().required('Obrigatório'),
  quantity: Yup.number().positive('Deve ser positivo').required('Obrigatório'),
  price: Yup.number().positive('Deve ser positivo').required('Obrigatório'),
});

interface OperationData {
  id?: string;
  date: string;
  type: 'Compra' | 'Venda';
  asset: string;
  quantity: number;
  price: number;
}

interface AddOperationFormProps {
  onClose: () => void;
  onSave: (operation: any) => void;
  operationToEdit?: OperationData | null;
}

export function AddOperationForm({ onClose, onSave, operationToEdit }: AddOperationFormProps) {
  const initialValues = {
    date: operationToEdit ? new Date(operationToEdit.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    type: operationToEdit ? operationToEdit.type : 'Compra',
    asset: operationToEdit ? operationToEdit.asset : '',
    quantity: operationToEdit ? operationToEdit.quantity : 0,
    price: operationToEdit ? operationToEdit.price : 0,
  };

  return (
    <div className={styles.formContainer}>
      <h2>{operationToEdit ? 'Editar Operação' : 'Nova Operação'}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={OperationSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          try {
            let savedOperation;
            if (operationToEdit) {
              const response = await axios.put(`http://localhost:3001/api/operations/${operationToEdit.id}`, values);
              savedOperation = response.data;
            } else {
              const response = await axios.post('http://localhost:3001/api/operations', values);
              savedOperation = response.data;
            }
            onSave(savedOperation);
            onClose();
            toast.success(`Operação ${operationToEdit ? 'atualizada' : 'salva'} com sucesso!`);
          } catch (error) {
            console.error("Erro ao salvar operação:", error);
            toast.error("Não foi possível salvar a operação.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className={styles.form}>
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Data</label>
                <Field name="date" type="date" className={`${styles.input} ${errors.date && touched.date ? styles.inputError : ''}`} />
              </div>
              <div className={styles.fieldGroup}>
                <label>Tipo</label>
                <Field as="select" name="type" className={`${styles.input} ${errors.type && touched.type ? styles.inputError : ''}`}>
                  <option value="Compra">Compra</option>
                  <option value="Venda">Venda</option>
                </Field>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label>Ativo</label>
              <Field name="asset" placeholder="Ex: PETR4" className={`${styles.input} ${errors.asset && touched.asset ? styles.inputError : ''}`} />
            </div>
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Quantidade</label>
                <Field name="quantity" type="number" className={`${styles.input} ${errors.quantity && touched.quantity ? styles.inputError : ''}`} />
              </div>
              <div className={styles.fieldGroup}>
                <label>Preço (R$)</label>
                <Field name="price" type="number" step="0.01" className={`${styles.input} ${errors.price && touched.price ? styles.inputError : ''}`} />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? 'Salvando...' : 'Salvar Operação'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}