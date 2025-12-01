import { useState, useCallback } from 'react';
import { parseSpanishNumber, formatNumber, isValidNumber } from '@/lib/formatters';

interface UseSpanishNumberOptions {
  decimals?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
}

interface UseSpanishNumberReturn {
  /** Valor como string (para inputs) */
  value: string;
  /** Valor numérico parseado */
  numericValue: number;
  /** Si el valor actual es válido */
  isValid: boolean;
  /** Actualizar valor desde input */
  setValue: (input: string) => void;
  /** Resetear a valor inicial */
  reset: () => void;
  /** Valor formateado para mostrar */
  formatted: string;
  /** Mensaje de error si no es válido */
  error: string | null;
}

/**
 * Hook para manejar inputs numéricos con formato español
 * Acepta coma o punto como decimal, valida rango y formatea salida
 *
 * @example
 * const { value, setValue, numericValue, formatted, isValid } = useSpanishNumber({
 *   decimals: 2,
 *   min: 0,
 *   max: 1000000
 * });
 *
 * <input value={value} onChange={(e) => setValue(e.target.value)} />
 * <span>Resultado: {formatted}</span>
 */
export function useSpanishNumber(
  initialValue: string = '',
  options: UseSpanishNumberOptions = {}
): UseSpanishNumberReturn {
  const { decimals = 2, min, max, allowNegative = true } = options;

  const [value, setValueState] = useState(initialValue);

  const numericValue = parseSpanishNumber(value);

  // Validación
  const getError = useCallback((): string | null => {
    if (value === '') return null; // Campo vacío no es error

    if (!isValidNumber(value)) {
      return 'Introduce un número válido';
    }

    const num = parseSpanishNumber(value);

    if (!allowNegative && num < 0) {
      return 'No se permiten valores negativos';
    }

    if (min !== undefined && num < min) {
      return `El valor mínimo es ${formatNumber(min, decimals)}`;
    }

    if (max !== undefined && num > max) {
      return `El valor máximo es ${formatNumber(max, decimals)}`;
    }

    return null;
  }, [value, min, max, decimals, allowNegative]);

  const error = getError();
  const isValid = value === '' || (isValidNumber(value) && error === null);

  const setValue = useCallback((input: string) => {
    // Permitir entrada vacía, números, comas, puntos y signo negativo
    const sanitized = input.replace(/[^\d,.\-]/g, '');
    setValueState(sanitized);
  }, []);

  const reset = useCallback(() => {
    setValueState(initialValue);
  }, [initialValue]);

  const formatted = isNaN(numericValue) ? '' : formatNumber(numericValue, decimals);

  return {
    value,
    numericValue,
    isValid,
    setValue,
    reset,
    formatted,
    error,
  };
}

export default useSpanishNumber;
