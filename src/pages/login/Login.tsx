import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import { PasswordInput } from '../../components/password-input/PasswordInput';
import './Login.css';
import JRSLogo from '../../assets/jrs-Invest-logo-sem-nome.svg';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  password: Yup.string().required('Obrigatório'),
});

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-banner">
          <div className="banner-content">
            <img src={JRSLogo} alt="JRS Invest" className="banner-logo" />
            <h1>Invista no seu<br />futuro hoje.</h1>
            <p>Acompanhe sua rentabilidade, gerencie ativos e tome as melhores decisões com a JRS Invest.</p>
          </div>
          <div className="banner-footer">
            © {new Date().getFullYear()} JRS Invest
          </div>
        </div>
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>Acesse sua conta</h2>
            <p>Bem-vindo de volta! Por favor, insira seus dados.</p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              try {
                const response = await api.post('/api/login', values);
                localStorage.setItem('authToken', response.data.token);
                toast.success('Login realizado com sucesso!');
                navigate('/dashboard', { replace: true });
              } catch (error: any) {
                if (error.response && error.response.data.errors) {
                  setErrors(error.response.data.errors);
                } else {
                  toast.error('Falha no login. Verifique suas credenciais.');
                }
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="login-form">
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <div className={`input-with-icon ${errors.email && touched.email ? 'error' : ''}`}>
                    <FiMail className="input-icon" />
                    <Field
                      id="email"
                      type="email"
                      name="email"
                      placeholder="exemplo@email.com"
                      className="input-field"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">Senha</label>
                    <Link to="/forgot-password" className="forgot-link">Esqueceu a senha?</Link>
                  </div>
                  <div className={`input-wrapper-custom ${errors.password && touched.password ? 'error' : ''}`}>
                     <Field
                        name="password"
                        placeholder="Digite sua senha"
                        component={PasswordInput}
                      />
                  </div>
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>
                
                <button type="submit" className="login-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar'} <FiArrowRight />
                </button>

                <div className="separator">
                  <span>ou</span>
                </div>
                <button type="button" className="social-button">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
                  Entrar com Google
                </button>
              </Form>
            )}
          </Formik>

          <div className="register-cta">
            Não tem uma conta? <Link to="/register">Cadastre-se gratuitamente</Link>
          </div>
        </div>
      </div>
    </div>
  );
}