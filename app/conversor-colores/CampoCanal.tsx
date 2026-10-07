'use client';

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';

interface Props {
  id: string;
  /** Nombre accesible, p. ej. «Rojo (R), de 0 a 255» */
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  onCambio: (v: number) => void;
  className?: string;
}

/**
 * Campo numérico de un canal de color con BORRADOR propio.
 *
 * ⚠️ 07/10/2026 (hallazgos 2932 y 2934): era un type=number con `Number(e.target.value)` sin
 * acotar. Fuera de rango, el valor entraba en el estado (rgb(300, …), cmyk(…, −18 %)) y los
 * cuatro formatos dejaban de describir el mismo color; y al vaciar el campo, Number('') = 0
 * reescribía «0» y el color saltaba a mitad de la edición. Ahora solo se aplica un entero dentro
 * del rango; lo demás se marca (aria-invalid) y, al salir del campo, vuelve el valor vigente.
 */
export default function CampoCanal({ id, etiqueta, valor, min, max, onCambio, className }: Props) {
  const [borrador, setBorrador] = useState<string | null>(null);
  const texto = borrador ?? String(valor);
  const n = parseSpanishNumber(texto);
  const valido = Number.isInteger(n) && n >= min && n <= max;

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      aria-label={etiqueta}
      aria-invalid={!valido}
      title={`Entero de ${min} a ${max}`}
      value={texto}
      onChange={(e) => {
        const t = e.target.value;
        setBorrador(t);
        const v = parseSpanishNumber(t);
        if (Number.isInteger(v) && v >= min && v <= max) onCambio(v);
      }}
      onBlur={() => setBorrador(null)}
      className={className}
    />
  );
}
