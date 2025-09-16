import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import './login.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Obrigatório'),
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
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(true);
          setTimeout(() => {
            console.log(values);
            navigate('/dashboard');
            setSubmitting(false);
          }, 500);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <Field type="email" name="email" placeholder="Email" className="input-field" />
            <ErrorMessage name="email" component="div" className="error-text" />

            <Field type="password" name="password" placeholder="Senha" className="input-field" />
            <ErrorMessage name="password" component="div" className="error-text" />

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </Form>
        )}
      </Formik>
      <h5>Demo: Use qualquer email e senha para entrar</h5>
    </div>
  );
}