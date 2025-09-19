import { useState } from 'react';
import type { FieldProps } from 'formik';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './PasswordInput.module.css';

interface PasswordInputProps {
  label: string;
  placeholder?: string;
}

export function PasswordInput({ field, form, label, placeholder }: FieldProps & PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const hasError = form.errors[field.name] && form.touched[field.name];

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={field.name}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          id={field.name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          {...field}
          className={`${styles.inputField} ${hasError ? styles.inputError : ''}`}
        />
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>
    </div>
  );
}