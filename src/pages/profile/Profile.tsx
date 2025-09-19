import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';
import { motion } from 'framer-motion';

interface UserProfile {
  name: string;
  email: string;
  birth_date: string;
  phone: string;
}

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Obrigatório'),
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  birth_date: Yup.date().nullable(),
  phone: Yup.string().nullable(),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Obrigatório'),
  newPassword: Yup.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres').required('Obrigatório'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'As senhas devem ser iguais')
    .required('Obrigatório'),
});

export function Profile() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        const profileData = {
          ...response.data,
          birth_date: response.data.birth_date ? new Date(response.data.birth_date).toISOString().slice(0, 10) : '',
        };
        setUserData(profileData);
      } catch (error) {
        toast.error('Não foi possível carregar os dados do perfil.');
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Carregando perfil...</div>;
  }

  if (!userData) {
    return <div className={styles.loading}>Não foi possível carregar os dados.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={styles.container}>
      <h1 className={styles.title}>Meu Perfil</h1>
      <p className={styles.subtitle}>Gerencie suas informações pessoais e de segurança.</p>

      <div className={styles.profileGrid}>
        <div className={styles.formCard}>
          <h2>Dados Pessoais</h2>
          <Formik
            initialValues={userData}
            validationSchema={ProfileSchema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const response = await api.put('/api/profile', values);
                const updatedProfile = {
                  ...response.data,
                  birth_date: response.data.birth_date ? new Date(response.data.birth_date).toISOString().slice(0, 10) : '',
                };
                setUserData(updatedProfile);
                toast.success('Perfil atualizado com sucesso!');
              } catch (error) {
                toast.error('Não foi possível atualizar o perfil.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className={styles.form}>
                <div className={styles.fieldGroup}><label>Nome Completo</label><Field name="name" className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`} /></div>
                <div className={styles.fieldGroup}><label>E-mail</label><Field name="email" type="email" disabled className={styles.input} /><small>O e-mail não pode ser alterado.</small></div>
                <div className={styles.fieldGroup}><label>Data de Nascimento</label><Field name="birth_date" type="date" className={styles.input} /></div>
                <div className={styles.fieldGroup}><label>Telefone</label><Field name="phone" placeholder="(XX) XXXXX-XXXX" className={styles.input} /></div>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Dados'}</button>
              </Form>
            )}
          </Formik>
        </div>

        <div className={styles.formCard}>
          <h2>Alterar Senha</h2>
          <Formik
            initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
            validationSchema={PasswordSchema}
            onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
              try {
                const response = await api.put('/api/profile/change-password', {
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
                toast.success(response.data.message);
                resetForm();
              } catch (error: any) {
                const errorMessage = error.response?.data?.error || "Não foi possível alterar a senha.";
                toast.error(errorMessage);
                setStatus({ error: errorMessage });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className={styles.form}>
                <div className={styles.fieldGroup}><label>Senha Atual</label><Field name="currentPassword" type="password" className={`${styles.input} ${errors.currentPassword && touched.currentPassword ? styles.inputError : ''}`} /></div>
                <div className={styles.fieldGroup}><label>Nova Senha</label><Field name="newPassword" type="password" className={`${styles.input} ${errors.newPassword && touched.newPassword ? styles.inputError : ''}`} /></div>
                <div className={styles.fieldGroup}><label>Confirmar Nova Senha</label><Field name="confirmPassword" type="password" className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`} /></div>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Alterar Senha'}</button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </motion.div>
  );
}