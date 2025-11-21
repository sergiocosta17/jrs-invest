import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { PasswordInput } from '../../components/password-input/PasswordInput';
import styles from './Register.module.css';
import JRSLogo from '../../assets/jrs-Invest-logo-sem-nome.svg';

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
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <img src={JRSLogo} alt="JRS Invest" className={styles.bannerLogo} />
            <h1>Sua liberdade<br />financeira começa aqui.</h1>
            <p>Junte-se a milhares de investidores que já assumiram o controle de seu patrimônio com a JRS Invest.</p>
          </div>
          <div className={styles.bannerFooter}>
            © {new Date().getFullYear()} JRS Invest
          </div>
        </div>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Crie sua conta</h2>
            <p>Preencha os dados abaixo para começar.</p>
          </div>

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
                const errorMessage = error.response?.data?.error || 'Não foi possível criar a conta.';
                setStatus(errorMessage);
                toast.error(errorMessage);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched, status }) => (
              <Form className={styles.form}>
                {status && <div className={styles.errorAlert}>{status}</div>}
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">E-mail</label>
                  <div className={styles.inputWithIcon}>
                    <FiMail className={styles.inputIcon} />
                    <Field
                      id="email"
                      type="email"
                      name="email"
                      placeholder="seu@email.com"
                      className={`${styles.inputField} ${errors.email && touched.email ? styles.inputError : ''}`}
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className={styles.errorMessage} />
                </div>

                <div className={styles.formGroup}>
                  <div className={`${styles.inputWrapperCustom} ${errors.password && touched.password ? styles.inputError : ''}`}>
                    <Field
                      name="password"
                      label="Senha"
                      placeholder="Mínimo 6 caracteres"
                      component={PasswordInput}
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className={styles.errorMessage} />
                </div>
                
                <div className={styles.formGroup}>
                  <div className={`${styles.inputWrapperCustom} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`}>
                    <Field
                      name="confirmPassword"
                      label="Confirmar Senha"
                      placeholder="Repita sua senha"
                      component={PasswordInput}
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className={styles.errorMessage} />
                </div>

                <button type="submit" className={styles.registerButton} disabled={isSubmitting}>
                  {isSubmitting ? 'Criando conta...' : 'Criar Conta'} <FiArrowRight />
                </button>
              </Form>
            )}
          </Formik>

          <div className={styles.loginLink}>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}