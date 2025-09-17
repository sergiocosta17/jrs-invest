import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { useEffect } from 'react';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  password: Yup.string().min(1, 'Mínimo 1 caracteres').required('Obrigatório'),
});

export function Login() {
  const navigate = useNavigate();

    useEffect(() => {
    window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
      return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  },
[])

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
        {({ isSubmitting, errors, touched }) => (
          <Form className="login-form">
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
              {isSubmitting ? 'Entrar' : 'Entrar'}
            </button>
          </Form>
        )}
      </Formik>
      <h5>Demo: Use qualquer email e senha para entrar</h5>
    </div>
  );
}