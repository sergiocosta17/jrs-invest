import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import styles from './ForgotPassword.module.css';
import JRSLogo from '../../assets/jrs-Invest-logo-sem-nome.svg';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
});

export function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <img src={JRSLogo} alt="JRS Invest" className={styles.bannerLogo} />
            <h1>Recupere<br />seu acesso.</h1>
            <p>Esqueceu a senha? Não se preocupe, acontece. Vamos te ajudar a criar uma nova senha em instantes.</p>
          </div>
          <div className={styles.bannerFooter}>
            © {new Date().getFullYear()} JRS Invest
          </div>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Esqueceu a senha?</h2>
            <p>Digite seu e-mail abaixo para receber as instruções de redefinição.</p>
          </div>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await api.post('/api/forgot-password', values);
                toast.success(`Um link de recuperação foi enviado para ${values.email}`);
                resetForm();
                setTimeout(() => navigate('/login'), 3000);
              } catch (error) {
                toast.error('Ocorreu um erro ao enviar o e-mail. Verifique se o endereço está correto.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">E-mail cadastrado</label>
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

                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'} <FiArrowRight />
                </button>
              </Form>
            )}
          </Formik>

          <Link to="/login" className={styles.backLink}>
            <FiArrowLeft /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}