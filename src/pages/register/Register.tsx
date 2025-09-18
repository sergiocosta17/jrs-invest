import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  password: Yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres').required('Obrigatório'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
    .required('Obrigatório'),
});

export function Register() {
  const navigate = useNavigate();

  return (
    <div className={styles.registerWrapper}>
      <h2>Criar Conta</h2>
      <p>Comece a gerenciar seus investimentos hoje mesmo.</p>
      <Formik
        initialValues={{ email: '', password: '', confirmPassword: '' }}
        validationSchema={RegisterSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            const response = await api.post('/api/register', {
              email: values.email,
              password: values.password,
            });

            toast.success(response.data.message);
            navigate('/login');

          } catch (error: any) {
            console.error("Erro no cadastro:", error);
            const errorMessage = error.response?.data?.error || 'Não foi possível criar a conta.';
            setStatus(errorMessage);
            toast.error(errorMessage);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched, status }) => (
          <Form className={styles.registerForm}>
            {status && <div className={styles.errorMessage}>{status}</div>}
            
            <label htmlFor="email">E-mail</label>
            <Field
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              className={`${styles.inputField} ${errors.email && touched.email ? styles.inputError : ''}`}
            />

            <label htmlFor="password">Senha</label>
            <Field
              id="password"
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              className={`${styles.inputField} ${errors.password && touched.password ? styles.inputError : ''}`}
            />

            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <Field
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Repita sua senha"
              className={`${styles.inputField} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`}
            />

            <button type="submit" className={styles.registerButton} disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </Form>
        )}
      </Formik>
      <div className={styles.loginLink}>
        Já tem uma conta? <Link to="/login">Faça login</Link>
      </div>
    </div>
  );
}