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
 *
 * ⚠️ El impuesto que falta PUEDE SER CERO, así que las siete apps dicen que el coste real
 * «puede ser mayor», no que «será mayor» (24/09/2026). El IGIC tiene tipo cero en las entregas
 * de viviendas protegidas por sus promotores, con su garaje y anexos si se transmiten a la
 * vez (art. 58.Uno.1 Ley canaria 4/2012), y en las obras de equipamiento comunitario
 * (art. 52); el IPSI depende de la ordenanza de cada ciudad. Solo un importe que seguro suma
 * —la gestoría ilegible— autoriza el «será».
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
