'use client';

import styles from './DataReference.module.css';
import { formatDate } from '@/lib';

interface DataReferenceProps {
  /** Nombre de la normativa aplicada (ej: "IRPF 2025", "Demora comercial 2S-2025") */
  normativa: string;
  /** Texto de la fuente oficial (ej: "Ley 35/2006 + LPGE 2025") */
  fuente: string;
  /** Fecha de última verificación en formato ISO: "2025-01-15" */
  verificado: string;
  /** URL de la fuente oficial (opcional) */
  urlOficial?: string;
  /** Nota adicional aclaratoria (opcional) */
  nota?: string;
}

/**
 * DataReference — Transparencia de datos normativos
 *
 * Muestra la normativa aplicada, su fuente y fecha de verificación.
 * Complementa a DisclaimerCard (que cubre responsabilidad legal).
 *
 * Uso:
 *   <DisclaimerCard variant="financial" severity="critical" />
 *   <DataReference
 *     normativa="IRPF 2025"
 *     fuente={FISCAL_IRPF_META.fuente}
 *     verificado={FISCAL_IRPF_META.verificado}
 *     urlOficial={FISCAL_IRPF_META.urlOficial}
 *   />
 *
 * Ver: DISCLAIMER-POLICY.md — sección 6
 */
export default function DataReference({
  normativa,
  fuente,
  verificado,
  urlOficial,
  nota,
}: DataReferenceProps) {
  const fechaFormateada = (() => {
    try {
      return formatDate(new Date(verificado));
    } catch {
      return verificado;
    }
  })();

  return (
    <div className={styles.dataReference} role="note" aria-label="Datos de referencia normativos">
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          📅
        </span>
        <span className={styles.titulo}>Datos de referencia</span>
      </div>

      <div className={styles.body}>
        <div className={styles.fila}>
          <span className={styles.etiqueta}>Normativa aplicada:</span>
          <span className={styles.valor}>
            {normativa} — {fuente}
          </span>
        </div>

        <div className={styles.fila}>
          <span className={styles.etiqueta}>Última verificación:</span>
          <span className={styles.valor}>
            {fechaFormateada}
            {urlOficial && (
              <>
                {' · '}
                <a
                  href={urlOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.enlace}
                  aria-label={`Fuente oficial: ${normativa} (abre en nueva pestaña)`}
                >
                  Fuente oficial →
                </a>
              </>
            )}
          </span>
        </div>

        {nota && (
          <div className={styles.nota}>
            <span aria-hidden="true">ℹ️</span> {nota}
          </div>
        )}
      </div>
    </div>
  );
}
