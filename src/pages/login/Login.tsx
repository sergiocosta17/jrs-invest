import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { PasswordInput } from '../../components/password-input/PasswordInput';
import './Login.css';
import JRSLogo from '../../assets/jrs-invest-logo-azul.svg';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  password: Yup.string().required('Obrigatório'),
});

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">
      
      <img src={JRSLogo} alt="JRS Invest Logo" className="login-logo" /> 

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const response = await api.post('/api/login', values);
            localStorage.setItem('authToken', response.data.token);
            toast.success('Login bem-sucedido!');
            navigate('/dashboard', { replace: true });
          } catch (error: any) {
            if (error.response && error.response.data.errors) {
              setErrors(error.response.data.errors);
            } else {
              toast.error('Não foi possível fazer login. Tente novamente.');
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="login-form">
            <div className="input-group">
              <label htmlFor="email" className="input-label">E-mail</label>
              <Field
                id="email"
                type="email"
                name="email"
                placeholder="seu@email.com"
                className={`input-field ${errors.email && touched.email ? 'input-error' : ''}`}
              />
              <ErrorMessage name="email" component="div" className="field-error-message" />
            </div>

            <div className="input-group">
              <Field
                name="password"
                label="Senha"
                placeholder="Sua senha"
                component={PasswordInput}
              />
              <ErrorMessage name="password" component="div" className="field-error-message" />
            </div>
            
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