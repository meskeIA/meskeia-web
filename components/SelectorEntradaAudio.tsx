'use client';

import { useId } from 'react';
import type { EntradaAudio } from '@/lib/useEntradaAudio';
import styles from './SelectorEntradaAudio.module.css';

/**
 * Desplegable «Entrada de audio» para las apps que escuchan por el micrófono. La lógica (lista
 * de dispositivos, apertura sin procesado de voz, vuelta a la predeterminada) vive en
 * `lib/useEntradaAudio`; aquí solo se pinta. Sin entradas —antes de conceder el micrófono— no
 * pinta nada.
 */
interface Props {
  entradas: EntradaAudio[];
  valor: string;
  onCambiar: (id: string) => void;
  /** Una línea bajo el desplegable: qué se gana con una entrada externa en ESTA app */
  ayuda: string;
}

export default function SelectorEntradaAudio({ entradas, valor, onCambiar, ayuda }: Props) {
  const id = useId();
  if (entradas.length === 0) return null;

  return (
    <div className={styles.entradaAudio}>
      <label htmlFor={`${id}-entrada`} className={styles.etiqueta}>Entrada de audio</label>
      <select
        id={`${id}-entrada`}
        className={styles.desplegable}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        aria-describedby={`${id}-ayuda`}
      >
        <option value="">La predeterminada del sistema</option>
        {entradas.map((entrada) => (
          <option key={entrada.id} value={entrada.id}>{entrada.nombre}</option>
        ))}
      </select>
      <p id={`${id}-ayuda`} className={styles.ayuda}>{ayuda}</p>
    </div>
  );
}
