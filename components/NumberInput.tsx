/**
 * Componente NumberInput - meskeIA
 *
 * Input numérico con soporte para formato español (acepta coma y punto como decimal)
 * Compatible con dark mode y estilos meskeIA
 */

'use client';

import React, { useId } from 'react';
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
  suffix?: string;
  /**
   * ¿Puede el blur REESCRIBIR un valor fuera de rango al límite más próximo? Por defecto sí,
   * que es el comportamiento de siempre y el que quieren las 60 apps que usan este control.
   *
   * ── Por qué existe la salida (15/09/2026, hallazgos 822 y 844 del Inspector) ──
   * Acotar al mínimo es inofensivo mientras el límite sea un valor neutro. Deja de serlo
   * cuando el límite SIGNIFICA algo distinto: en «Años de propiedad» de las apps de
   * compraventa, `min` es 0 y el 0 no es «ningún dato», es la reventa antes de cumplir el
   * año, con el tercer coeficiente más alto de COEFICIENTES_IIVTNU_2025 (0,14). Un −4
   * imposible se convertía así, al pasar al campo siguiente, en un supuesto fiscal
   * perfectamente válido y caro, y la app liquidaba y presentaba el neto como DEFINITIVO —
   * justo lo que el comentario de esas páginas declara que no debe pasar. Con el foco puesto
   * sí lo rechazaban: el mismo signo tenía dos tratamientos según cuándo se mirase.
   *
   * Con `false`, el valor se queda como lo escribió el usuario y la app decide qué hacer con
   * él, que es lo que esas páginas ya saben hacer («SIN CALCULAR» y neto marcado como techo).
   */
  acotarAlSalir?: boolean;
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
  suffix,
  acotarAlSalir = true,
}: NumberInputProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

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

      // Validar min/max — salvo que quien usa el control haya dicho que no acote: ver
      // `acotarAlSalir`, que existe porque reescribir al límite puede cambiar el SIGNIFICADO
      // del dato y no solo su valor (hallazgos 822 y 844).
      if (!isNaN(num) && acotarAlSalir) {
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
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <input
        id={id}
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
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
      />

      {helperText && !error && (
        <p className={styles.helperText} id={helperId}>
          {helperText}
        </p>
      )}

      {error && (
        <p className={styles.errorText} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
