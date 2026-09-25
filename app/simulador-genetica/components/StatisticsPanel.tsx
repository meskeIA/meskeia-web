'use client';

import styles from '../SimuladorGenetica.module.css';
import { formatPercentage } from '@/lib';

/**
 * Un porcentaje fenotípico, con los decimales que tenga y sin ninguno si no los tiene.
 *
 * ⚠️ 22/09/2026 (hallazgo 1206) — el panel imprimía todos los porcentajes con `formatNumber(x, 0)`,
 * así que el 6,25 % de un dihíbrido salía como «6 %». La sección «Casos para clase» de la misma
 * página dice literalmente «Resuélvelos con el cuadro de Punnett de arriba», y su corrector exige
 * 6,25 con una tolerancia de 0,0625: el alumno que hacía exactamente eso —leer el panel— era
 * corregido en contra de lo que la herramienta le había enseñado, mientras en el caso 6 (56,25,
 * tolerancia 0,5625) el mismo «56» sí se aceptaba. La misma forma de responder valía o no según
 * el tamaño de la respuesta.
 *
 * Se repara por el lado de la CIFRA y no relajando el corrector: 6,25 % es lo que da el cuadro
 * de Punnett, y redondearlo a 6 % era perder justo la precisión que el ejercicio pide. El
 * corrector ya admite 0,01 de desvío, que cubre de sobra lo que aquí se publica.
 */
const porcentajeExacto = (valor: number): string =>
  // Con el % separado por espacio duro (formatPercentage, hallazgo 1698 del 25/09/2026).
  formatPercentage(valor / 100, Number.isInteger(valor) ? 0 : 2);
import { PunnettResult, Trait } from './types';
import { notacionGenotipo } from './genetics';

interface StatisticsPanelProps {
  punnett: PunnettResult;
  /** Los rasgos del cruce, en orden: solo para escribir los genotipos (Iᴬi en vez de AO). */
  rasgos: Trait[];
}

export default function StatisticsPanel({ punnett, rasgos }: StatisticsPanelProps) {
  /**
   * Ratio simplificado, EN EL MISMO ORDEN QUE LAS BARRAS Y CON SU ETIQUETA.
   *
   * ⚠️ 14/09/2026 (hallazgo 827) — las barras se pintan ordenadas de mayor a menor y esta
   * línea se armaba en el orden en que el motor descubrió los genotipos (`Object.values`, no
   * la lista ya ordenada). Como el ratio no llevaba etiquetas, el único orden que el lector
   * podía suponer era el de las barras de encima, y no coincidía: con el cruce por defecto
   * (Aa × Aa) las barras decían «Aa 50 % · AA 25 % · aa 25 %» y debajo se leía «Ratio:
   * 1:2:1», con el primer 1 cayendo sobre la barra de Aa, que vale 2.
   *
   * Ordenarlo como las barras alinea las dos lecturas, pero rompe la forma en que el ratio
   * se enseña: «1:2:1» pasaría a «2:1:1» y «9:3:3:1» a «9:3:3:1» solo por casualidad. Esas
   * cifras SON las leyes de Mendel y hay que poder reconocerlas de un vistazo. Lo que
   * sobraba no era el orden del motor —que es el canónico, AA, Aa, aa— sino que los números
   * fueran anónimos: con la leyenda detrás, el ratio se lee sin mirar las barras y ya no
   * importa que estas vayan de mayor a menor, que es como se leen mejor. Afectaba también
   * al dihíbrido con progenitor homocigoto.
   */
  const calculateSimplifiedRatio = (ratios: Record<string, number>): string => {
    const entradas = Object.entries(ratios).filter(([, v]) => v > 0);
    if (entradas.length === 0) return '';

    // Mínimo común denominador, en el orden del motor, que es el canónico
    const minValue = Math.min(...entradas.map(([, v]) => v));
    const numeros = entradas.map(([, v]) => Math.round(v / minValue)).join(':');
    const leyenda = entradas.map(([clave]) => clave).join(' · ');
    return `${numeros} (${leyenda})`;
  };

  // Las claves del motor son internas ('AO'); en pantalla van con la notación del rasgo.
  const genotypeRatioStr = calculateSimplifiedRatio(
    Object.fromEntries(
      Object.entries(punnett.genotypeRatios).map(([k, v]) => [notacionGenotipo(k, rasgos), v])
    )
  );
  const phenotypeRatioStr = calculateSimplifiedRatio(
    Object.fromEntries(
      Object.entries(punnett.phenotypeRatios).map(([k, v]) => [k, v.count])
    )
  );

  return (
    <div className={styles.statsGrid}>
      {/* Proporciones Genotípicas */}
      <div className={styles.statsSection}>
        <h4 className={styles.statsSectionTitle}>📊 Proporciones Genotípicas</h4>
        {Object.entries(punnett.genotypeRatios)
          .sort(([, a], [, b]) => b - a)
          .map(([genotype, ratio]) => (
            <div key={genotype} className={styles.ratioBar}>
              <span className={styles.ratioLabel}>
                <strong>{notacionGenotipo(genotype, rasgos)}</strong>
              </span>
              <div className={styles.ratioBarContainer}>
                <div
                  className={styles.ratioBarFill}
                  style={{
                    width: `${ratio * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  }}
                />
              </div>
              <span className={styles.ratioValue}>{porcentajeExacto(ratio * 100)}</span>
            </div>
          ))}
        {genotypeRatioStr && (
          <div className={styles.ratioSummary}>Ratio: {genotypeRatioStr}</div>
        )}
      </div>

      {/* Proporciones Fenotípicas */}
      <div className={styles.statsSection}>
        <h4 className={styles.statsSectionTitle}>🎨 Proporciones Fenotípicas</h4>
        {Object.entries(punnett.phenotypeRatios)
          .sort(([, a], [, b]) => b.count - a.count)
          .map(([phenotype, data]) => (
            <div key={phenotype} className={styles.ratioBar}>
              <span className={styles.ratioLabel}>
                {/* El « (♀)» / « (♂)» NO se recorta: en herencia ligada al sexo el recuento
                    separa por sexo, así que sin él quedaban dos filas de texto idéntico con
                    porcentajes distintos (Inspector, 20/08/2026). */}
                <span aria-hidden="true">{data.icon}</span> {phenotype}
              </span>
              <div className={styles.ratioBarContainer}>
                <div
                  className={styles.ratioBarFill}
                  style={{
                    width: `${data.count * 100}%`,
                    background: data.color,
                  }}
                />
              </div>
              <span className={styles.ratioValue}>{porcentajeExacto(data.count * 100)}</span>
            </div>
          ))}
        {phenotypeRatioStr && (
          <div className={styles.ratioSummary}>Ratio: {phenotypeRatioStr}</div>
        )}
      </div>
    </div>
  );
}
