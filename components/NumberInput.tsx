/**
 * Componente NumberInput - meskeIA
 *
 * Input numérico con soporte para formato español (acepta coma y punto como decimal)
 * Compatible con dark mode y estilos meskeIA
 */

'use client';

import React from 'react';
import styles from './NumberInput.module.css';

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  error?: string;
}

export default function NumberInput({
  value,
  onChange,
  label,
  placeholder = '0',
  min,
  max,
  step = 1,
  required = false,
  disabled = false,
  className = '',
  helperText,
  error,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Permitir vacío, números, coma, punto, signo menos
    const regex = /^-?[\d.,]*$/;
    if (regex.test(val) || val === '') {
      onChange(val);
    }
  };

  const handleBlur = () => {
    // Al perder foco, normalizar el formato
    if (value && value.trim() !== '') {
      // Convertir coma a punto para validación
      const normalized = value.replace(',', '.');
      const num = parseFloat(normalized);

      if (!isNaN(num)) {
        // Validar min/max
        if (min !== undefined && num < min) {
          onChange(min.toString());
          return;
        }
        if (max !== undefined && num > max) {
          onChange(max.toString());
          return;
        }
      }
    }
  };

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : helperText ? `${label}-helper` : undefined}
      />

      {helperText && !error && (
        <p className={styles.helperText} id={`${label}-helper`}>
          {helperText}
        </p>
      )}

      {error && (
        <p className={styles.errorText} id={`${label}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
