'use client';

import { TERRITORIOS_SIN_IVA, ITP_CCAA, ComunidadAutonoma } from '@/data/itp-ccaa';
import styles from './AvisoTerritorioSinIva.module.css';

interface Props {
  /** Comunidad o ciudad seleccionada en el simulador */
  ccaa: ComunidadAutonoma;
  /**
   * Solo tiene sentido cuando la operación devengaría IVA (obra nueva, o segunda mano con
   * renuncia a la exención). En una transmisión por ITP no hay nada que advertir.
   */
  aplica?: boolean;
}

/**
 * Advierte de que en Canarias, Ceuta y Melilla no rige el IVA español.
 *
 * Canarias tributa por IGIC y las ciudades autónomas por IPSI, con sus propios tipos. Las
 * siete apps del clúster de compraventa ofrecen esos territorios en su desplegable y les
 * liquidaban IVA del 21 % sin decir nada: una nave de 500.000 € en Canarias cobraba 105.000 €
 * de un impuesto que allí no existe (hallazgo 156 del Inspector, 21/08/2026, presente en las
 * siete). Calcular el IGIC y el IPSI exigiría sellar esos tipos con su propia fuente —el IPSI
 * además depende de la ordenanza de cada ciudad—, así que de momento el catálogo no los
 * calcula; lo que no puede es inventarse una cifra.
 *
 * Se devuelve `null` cuando no aplica, para que quien lo use no tenga que condicionarlo.
 */
export default function AvisoTerritorioSinIva({ ccaa, aplica = true }: Props) {
  const territorio = TERRITORIOS_SIN_IVA[ccaa];
  if (!territorio || !aplica) return null;

  return (
    <p className={styles.aviso} role="note">
      <span aria-hidden="true">⚠️</span> En {ITP_CCAA[ccaa].nombre} <strong>no se aplica el IVA</strong>:
      esta operación tributa por el {territorio.impuesto} ({territorio.nombre}), que tiene sus propios
      tipos. Esta herramienta no lo calcula, así que el importe del impuesto indirecto no es el tuyo —
      consúltalo en la administración tributaria de {ITP_CCAA[ccaa].nombre}.
    </p>
  );
}
