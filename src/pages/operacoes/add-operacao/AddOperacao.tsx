import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
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

interface AddOperationFormProps {
  onClose: () => void;
  onOperationAdded: (newOperation: any) => void;
}

export function AddOperationForm({ onClose, onOperationAdded }: AddOperationFormProps) {
  return (
    <div className={styles.formContainer}>
      <h2>Nova Operação</h2>
      <Formik
        initialValues={{
          date: new Date().toISOString().split('T')[0],
          type: 'Compra',
          asset: '',
          quantity: 0,
          price: 0
        }}
        validationSchema={OperationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const formattedDate = new Date(values.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const newOperation = { ...values, id: new Date().toISOString(), date: formattedDate, total: values.quantity * values.price };
            onOperationAdded(newOperation);
            onClose();
          } catch (error) {
            console.error("Erro ao adicionar operação:", error);
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
                <Field
                  name="date"
                  type="date"
                  className={`${styles.input} ${errors.date && touched.date ? styles.inputError : ''}`}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Tipo</label>
                <Field
                  as="select"
                  name="type"
                  className={`${styles.input} ${errors.type && touched.type ? styles.inputError : ''}`}
                >
                  <option value="Compra">Compra</option>
                  <option value="Venda">Venda</option>
                </Field>
              </div>
            </div>
            
            <div className={styles.fieldGroup}>
              <label>Ativo</label>
              <Field
                name="asset"
                placeholder="Ex: PETR4"
                className={`${styles.input} ${errors.asset && touched.asset ? styles.inputError : ''}`}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Quantidade</label>
                <Field
                  name="quantity"
                  type="number"
                  className={`${styles.input} ${errors.quantity && touched.quantity ? styles.inputError : ''}`}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Preço (R$)</label>
                <Field
                  name="price"
                  type="number"
                  step="0.01"
                  className={`${styles.input} ${errors.price && touched.price ? styles.inputError : ''}`}
                />
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