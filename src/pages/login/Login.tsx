import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './login.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  password: Yup.string().required('Obrigatório'),
});

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">
      <h2>JRS Invest</h2>
      <h5>Plataforma de gerenciamento de investimentos</h5>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            const response = await api.post('/api/login', values);
            
            localStorage.setItem('authToken', response.data.token);

            toast.success('Login bem-sucedido!');
            navigate('/dashboard', { replace: true });

          } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Não foi possível fazer login.';
            setStatus(errorMessage);
            toast.error(errorMessage);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched, status }) => (
          <Form className="login-form">
            {status && <div className="login-error-message">{status}</div>}
            
            <label htmlFor="email" className="input-label">E-mail</label>
            <Field
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              className={`input-field ${errors.email && touched.email ? 'input-error' : ''}`}
            />

            <label htmlFor="password" className="input-label">Senha</label>
            <Field
              id="password"
              type="password"
              name="password"
              placeholder="Sua senha"
              className={`input-field ${errors.password && touched.password ? 'input-error' : ''}`}
            />

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </Form>
        )}
      </Formik>

      <div className="register-link">
        Não tem uma conta? <Link to="/register">Cadastre-se</Link>
      </div>
    </div>
  );
}