'use client';

import React from 'react';
import { formatNumber } from '@/lib';
import type { ModoLectura, SerieNumerica } from '@/lib';
import styles from './LecturaSerie.module.css';

/**
 * Enseña cómo se ha leído una serie de números escrita o pegada por el usuario.
 *
 * Existe porque el fallo que corrige es SILENCIOSO: si la app lee «1,5 2,3» como cuatro
 * valores en vez de dos, la media que sale después no parece mal, simplemente es otra. La
 * detección automática acierta casi siempre, pero «casi» no basta cuando el error no se ve,
 * así que el resultado se muestra siempre y, cuando la entrada admite dos lecturas válidas,
 * se ofrece la otra con un clic en lugar de decidir en silencio.
 *
 * Es compartido a propósito: las dos apps de estadística del catálogo tenían criterios
 * opuestos para la coma (04/09/2026) y un componente común es lo que impide que vuelvan a
 * separarse. Sigue el criterio que ya usaba `lecturaAmbiguaAlternativa` en los campos de un
 * solo número: ante dos lecturas posibles, ofrecer la otra en vez de elegir a escondidas.
 */

interface LecturaSerieProps {
  serie: SerieNumerica;
  /** Modo activo. `auto` deja decidir a la detección; los otros dos los ha impuesto el usuario. */
  modo: ModoLectura;
  onCambiarModo: (modo: ModoLectura) => void;
  /** Cuántos valores se listan antes de resumir con «…». */
  maxMostrados?: number;
}

export default function LecturaSerie({
  serie,
  modo,
  onCambiarModo,
  maxMostrados = 8,
}: LecturaSerieProps) {
  const { valores, papelComa, ambigua, alternativa, descartados } = serie;

  if (valores.length === 0 && descartados.length === 0) return null;

  /**
   * Se muestran los decimales que el valor tiene, ni uno más: este eco existe para que el
   * usuario reconozca SUS datos, y un «15,50» donde escribió «15,5» hace dudar de si la app
   * ha tocado algo. El tope de seis evita que un periódico como 2,333333… ocupe la línea.
   */
  const muestra = valores.slice(0, maxMostrados).map((v) => {
    const decimales = Math.min(6, (String(v).split('.')[1] ?? '').length);
    return formatNumber(v, decimales);
  });
  const resto = valores.length - muestra.length;

  return (
    <div className={styles.caja} role="status" aria-live="polite">
      <p className={styles.linea}>
        <strong>
          {valores.length} {valores.length === 1 ? 'valor leído' : 'valores leídos'}
        </strong>
        {valores.length > 0 && <>: {muestra.join(' · ')}{resto > 0 && ` … (+${resto})`}</>}
      </p>

      {papelComa !== 'sin-comas' && (
        <p className={styles.detalle}>
          La coma se ha interpretado como{' '}
          <strong>{papelComa === 'decimal' ? 'separador decimal' : 'separador entre valores'}</strong>
          {modo !== 'auto' && ' porque tú lo has indicado'}.
        </p>
      )}

      {descartados.length > 0 && (
        <p className={styles.descartados}>
          No se ha reconocido como número: {descartados.slice(0, 5).map((d) => `«${d}»`).join(', ')}
          {descartados.length > 5 && ` y ${descartados.length - 5} más`}.
        </p>
      )}

      {/* La duda solo se plantea cuando las dos lecturas producen una serie válida */}
      {ambigua && alternativa && (
        <div className={styles.duda}>
          <span>
            Este texto admite otra lectura: {alternativa.valores.length}{' '}
            {alternativa.valores.length === 1 ? 'valor' : 'valores'} si la coma
            {alternativa.papelComa === 'decimal' ? ' fuera decimal' : ' separase valores'}.
          </span>
          <button
            type="button"
            className={styles.btnCambiar}
            onClick={() => onCambiarModo(alternativa.papelComa)}
          >
            Leerlo así
          </button>
        </div>
      )}

      {modo !== 'auto' && (
        <button type="button" className={styles.btnAuto} onClick={() => onCambiarModo('auto')}>
          Volver a la detección automática
        </button>
      )}
    </div>
  );
}
