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

export function Profile() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        
        // AJUSTE: Garantimos que os valores nulos se tornem strings vazias
        const profileData = {
          ...response.data,
          name: response.data.name || '',
          birth_date: response.data.birth_date ? new Date(response.data.birth_date).toISOString().slice(0, 10) : '',
          phone: response.data.phone || '',
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
    return <div>Carregando perfil...</div>;
  }

  if (!userData) {
    return <div>Não foi possível carregar os dados. Tente novamente.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={styles.container}>
      <h1 className={styles.title}>Meu Perfil</h1>
      <p className={styles.subtitle}>Gerencie suas informações pessoais.</p>

      <div className={styles.formCard}>
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
              console.error("Erro ao atualizar perfil:", error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="name">Nome Completo</label>
                <Field id="name" name="name" className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`} />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="email">E-mail</label>
                <Field id="email" name="email" type="email" disabled className={styles.input} />
                <small>O e-mail não pode ser alterado.</small>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="birth_date">Data de Nascimento</label>
                <Field id="birth_date" name="birth_date" type="date" className={styles.input} />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="phone">Telefone</label>
                <Field id="phone" name="phone" placeholder="(XX) XXXXX-XXXX" className={styles.input} />
              </div>

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </motion.div>
  );
}