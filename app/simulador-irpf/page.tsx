'use client';

import { useState } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { jsonLd, faqJsonLd } from './metadata';
import styles from './SimuladorIRPF.module.css';

// Tipos
interface Tramo {
  limite: number;
  tipo: number;
  nombre: string;
}

interface TramoCalculado {
  nombre: string;
  baseTramo: number;
  tipoString: string;
  cuota: number;
}

const TRAMOS: Tramo[] = [
  { limite: 6000, tipo: 0.19, nombre: 'Hasta 6.000 €' },
  { limite: 50000, tipo: 0.21, nombre: '6.000 € - 50.000 €' },
  { limite: 200000, tipo: 0.23, nombre: '50.000 € - 200.000 €' },
  { limite: 300000, tipo: 0.26, nombre: '200.000 € - 300.000 €' },
  { limite: Infinity, tipo: 0.3, nombre: 'Más de 300.000 €' },
];

export default function SimuladorIRPF() {
  // Estados
  const [intereses, setIntereses] = useState<string>('');
  const [dividendos, setDividendos] = useState<string>('');
  const [ventaDerechos, setVentaDerechos] = useState<string>('');
  const [plusvaliasFondos, setPlusvaliasFondos] = useState<string>('');
  const [plusvaliasAcciones, setPlusvaliasAcciones] = useState<string>('');
  const [plusvaliasCripto, setPlusvaliasCripto] = useState<string>('');
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Función para formatear números al estilo español
  const formatearNumero = (numero: number): string => {
    if (numero === 0) return '0,00';

    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(numero);
  };

  // Función para convertir texto español a número
  const parseNumeroEspanol = (texto: string): number => {
    if (!texto || texto.trim() === '') return 0;

    let numeroLimpio = texto.replace(/\s/g, '');

    // Si hay tanto puntos como comas, los puntos son separadores de miles
    if (numeroLimpio.includes('.') && numeroLimpio.includes(',')) {
      numeroLimpio = numeroLimpio.replace(/\./g, '').replace(',', '.');
    }
    // Si solo hay comas, es separador decimal
    else if (numeroLimpio.includes(',') && !numeroLimpio.includes('.')) {
      numeroLimpio = numeroLimpio.replace(',', '.');
    }
    // Si solo hay puntos, podría ser miles o decimal
    else if (numeroLimpio.includes('.') && !numeroLimpio.includes(',')) {
      const lastDotIndex = numeroLimpio.lastIndexOf('.');
      if (
        numeroLimpio.length - lastDotIndex <= 3 &&
        numeroLimpio.length - lastDotIndex > 1
      ) {
        const partes = numeroLimpio.split('.');
        if (partes.length > 2) {
          numeroLimpio =
            partes.slice(0, -1).join('') + '.' + partes[partes.length - 1];
        }
      } else {
        numeroLimpio = numeroLimpio.replace(/\./g, '');
      }
    }

    let numero = parseFloat(numeroLimpio);

    if (isNaN(numero)) return 0;
    if (numero > 999999999) return 999999999;
    if (numero < -999999999) return -999999999;

    return numero;
  };

  // Handler para blur (formatear al salir del campo)
  const handleBlur = (
    value: string,
    setter: (value: string) => void,
    allowNegative: boolean = false
  ) => {
    if (value !== '') {
      let valor = parseNumeroEspanol(value);
      if (!allowNegative && valor < 0) {
        valor = Math.abs(valor);
      }
      setter(formatearNumero(valor));
    }
  };

  // Calcular resultados
  const interesesNum = parseNumeroEspanol(intereses);
  const dividendosNum = parseNumeroEspanol(dividendos);
  const ventaDerechosNum = parseNumeroEspanol(ventaDerechos);
  const plusvaliasFondosNum = parseNumeroEspanol(plusvaliasFondos);
  const plusvaliasAccionesNum = parseNumeroEspanol(plusvaliasAcciones);
  const plusvaliasCriptoNum = parseNumeroEspanol(plusvaliasCripto);

  const baseTotal =
    interesesNum +
    dividendosNum +
    ventaDerechosNum +
    plusvaliasFondosNum +
    plusvaliasAccionesNum +
    plusvaliasCriptoNum;

  // Calcular impuestos por tramos
  const calcularTramos = (): { tramos: TramoCalculado[]; totalImpuesto: number } => {
    let totalImpuesto = 0;
    let baseAcumulada = 0;
    const tramosCalculados: TramoCalculado[] = [];

    if (baseTotal <= 0) {
      TRAMOS.forEach((tramo) => {
        tramosCalculados.push({
          nombre: tramo.nombre,
          baseTramo: 0,
          tipoString: `${(tramo.tipo * 100).toFixed(0)}%`,
          cuota: 0,
        });
      });
      return { tramos: tramosCalculados, totalImpuesto: 0 };
    }

    let baseRestante = baseTotal;

    TRAMOS.forEach((tramo, index) => {
      const limiteInferior = index === 0 ? 0 : TRAMOS[index - 1].limite;
      const limiteTramo = tramo.limite - limiteInferior;

      if (baseRestante > 0) {
        const baseTramo = Math.min(baseRestante, limiteTramo);
        const cuota = baseTramo * tramo.tipo;

        tramosCalculados.push({
          nombre: tramo.nombre,
          baseTramo,
          tipoString: `${(tramo.tipo * 100).toFixed(0)}%`,
          cuota,
        });

        totalImpuesto += cuota;
        baseRestante -= baseTramo;
        baseAcumulada += baseTramo;
      } else {
        tramosCalculados.push({
          nombre: tramo.nombre,
          baseTramo: 0,
          tipoString: `${(tramo.tipo * 100).toFixed(0)}%`,
          cuota: 0,
        });
      }
    });

    return { tramos: tramosCalculados, totalImpuesto };
  };

  const { tramos: tramosCalculados, totalImpuesto } = calcularTramos();
  const tipoEfectivo = baseTotal > 0 ? (totalImpuesto / baseTotal) * 100 : 0;
  const netoRecibido = baseTotal - totalImpuesto;

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="simulador-irpf" />

      {/* Logo meskeIA */}
      <MeskeiaLogo />

      <div className="container-lg">
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.header}>
            <h1 className="text-2xl text-lg-3xl mb-sm">
              💰 Simulador IRPF 2025
            </h1>
            <p className="text-center">
              Calcula el IRPF sobre rendimientos del capital mobiliario según los
              tramos vigentes en 2025
            </p>
          </header>

          {/* Aviso legal */}
          <div className={styles.legalNotice}>
            <span className={styles.icon}>⚠️</span>
            Este simulador es orientativo. Para asesoramiento fiscal personalizado,
            consulta con un profesional cualificado.
          </div>

          {/* Layout principal */}
          <div className={styles.mainContent}>
            {/* Panel de inputs */}
            <div className={styles.panel}>
              <h2>📝 Rendimientos del Capital</h2>

              {/* Rendimientos */}
              <div className={styles.formGroup}>
                <label htmlFor="intereses">💵 Intereses</label>
                <input
                  type="text"
                  id="intereses"
                  placeholder="0,00 €"
                  value={intereses}
                  onChange={(e) => setIntereses(e.target.value)}
                  onBlur={(e) => handleBlur(e.target.value, setIntereses)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dividendos">📊 Dividendos</label>
                <input
                  type="text"
                  id="dividendos"
                  placeholder="0,00 €"
                  value={dividendos}
                  onChange={(e) => setDividendos(e.target.value)}
                  onBlur={(e) => handleBlur(e.target.value, setDividendos)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ventaDerechos">🎁 Venta de Derechos de Suscripción</label>
                <input
                  type="text"
                  id="ventaDerechos"
                  placeholder="0,00 €"
                  value={ventaDerechos}
                  onChange={(e) => setVentaDerechos(e.target.value)}
                  onBlur={(e) => handleBlur(e.target.value, setVentaDerechos)}
                  className={styles.input}
                />
              </div>

              {/* Plusvalías */}
              <div className={styles.plusvaliasGroup}>
                <h3>📈 Plusvalías / Minusvalías</h3>
                <p className={styles.hint}>
                  (Valores negativos = pérdidas que compensan ganancias)
                </p>

                <div className={styles.formGroup}>
                  <label htmlFor="plusvaliasFondos">🏦 Fondos de Inversión</label>
                  <input
                    type="text"
                    id="plusvaliasFondos"
                    placeholder="0,00 € (puede ser negativo)"
                    value={plusvaliasFondos}
                    onChange={(e) => setPlusvaliasFondos(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value, setPlusvaliasFondos, true)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="plusvaliasAcciones">📈 Acciones / ETFs</label>
                  <input
                    type="text"
                    id="plusvaliasAcciones"
                    placeholder="0,00 € (puede ser negativo)"
                    value={plusvaliasAcciones}
                    onChange={(e) => setPlusvaliasAcciones(e.target.value)}
                    onBlur={(e) =>
                      handleBlur(e.target.value, setPlusvaliasAcciones, true)
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="plusvaliasCripto">₿ Criptomonedas</label>
                  <input
                    type="text"
                    id="plusvaliasCripto"
                    placeholder="0,00 € (puede ser negativo)"
                    value={plusvaliasCripto}
                    onChange={(e) => setPlusvaliasCripto(e.target.value)}
                    onBlur={(e) => handleBlur(e.target.value, setPlusvaliasCripto, true)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Panel de resultados */}
            <div className={styles.panel}>
              <h2>🧮 Resultado del Cálculo</h2>

              {/* Base total */}
              <div className={styles.totalBase}>
                Base Total: {formatearNumero(baseTotal)} €
              </div>

              {/* Tabla de tramos */}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tramo</th>
                      <th>Base</th>
                      <th>Tipo</th>
                      <th>Cuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tramosCalculados.map((tramo, index) => (
                      <tr
                        key={index}
                        className={tramo.baseTramo === 0 ? styles.zeroRow : ''}
                      >
                        <td>{tramo.nombre}</td>
                        <td>{formatearNumero(tramo.baseTramo)} €</td>
                        <td>{tramo.tipoString}</td>
                        <td>{formatearNumero(tramo.cuota)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resultados finales */}
              <div className={styles.resultsContainer}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Total IRPF a pagar:</span>
                  <span className={styles.resultValue}>
                    {formatearNumero(totalImpuesto)} €
                  </span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Tipo efectivo:</span>
                  <span className={styles.resultValueSecondary}>
                    {tipoEfectivo.toFixed(2)}%
                  </span>
                </div>

                <div className={`${styles.resultItem} ${styles.resultHighlight}`}>
                  <span className={styles.resultLabel}>Neto recibido:</span>
                  <span className={styles.resultValue}>
                    {formatearNumero(netoRecibido)} €
                  </span>
                </div>
              </div>

              {/* Tramos 2025 */}
              <div className={styles.infoBox}>
                <h3>📋 Tramos IRPF 2025</h3>
                <ul>
                  <li>Hasta 6.000 € → 19%</li>
                  <li>6.000 € - 50.000 € → 21%</li>
                  <li>50.000 € - 200.000 € → 23%</li>
                  <li>200.000 € - 300.000 € → 26%</li>
                  <li>Más de 300.000 € → 30%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre IRPF y Tributación de Inversiones?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre cómo tributan los diferentes tipos de inversiones, estrategias de
            optimización fiscal y respuestas a preguntas frecuentes sobre el IRPF 2025
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent
              ? '⬆️ Ocultar Guía Educativa'
              : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido educativo colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            {/* Tipos de inversión */}
            <div className={styles.eduSection}>
              <h2>Tipos de Rendimientos e Inversiones</h2>

              <div className={styles.typeItem}>
                <h4>Intereses</h4>
                <p>
                  Rendimientos de depósitos bancarios, cuentas remuneradas y bonos.
                  Tributan directamente como rendimientos del capital mobiliario con
                  retención del 19% aplicada por el banco.
                </p>
              </div>

              <div className={styles.typeItem}>
                <h4>Dividendos</h4>
                <p>
                  Pagos de beneficios empresariales a accionistas. Tributan con
                  retención del 19% en origen. Los primeros 1.500€ anuales estaban
                  exentos hasta 2014 (normativa puede variar).
                </p>
              </div>

              <div className={styles.typeItem}>
                <h4>Acciones y ETFs</h4>
                <p>
                  Las plusvalías se calculan como diferencia entre precio de venta y
                  compra. Método FIFO (primero en entrar, primero en salir) para
                  determinar coste de adquisición en compras múltiples.
                </p>
              </div>

              <div className={styles.typeItem}>
                <h4>Fondos de Inversión</h4>
                <p>
                  Los traspasos entre fondos no tributan (diferimiento fiscal). Solo al
                  reembolso final se liquidan los impuestos sobre las ganancias
                  acumuladas. Ventaja fiscal significativa.
                </p>
              </div>

              <div className={styles.typeItem}>
                <h4>Criptomonedas</h4>
                <p>
                  Cada venta de criptomoneda genera una ganancia o pérdida patrimonial.
                  Las pérdidas pueden compensar ganancias del mismo año y hasta 4 años
                  siguientes.
                </p>
              </div>

              <div className={styles.typeItem}>
                <h4>Renta Fija</h4>
                <p>
                  Intereses de depósitos, bonos y letras tributan como rendimientos. Las
                  ganancias por venta anticipada de bonos tributan como plusvalías.
                </p>
              </div>
            </div>

            {/* Estrategias de optimización */}
            <div className={styles.eduSection}>
              <h2>Estrategias de Optimización Fiscal</h2>

              <div className={styles.tipCard}>
                <h4>💡 Tip 1: Compensación de Pérdidas</h4>
                <p>
                  Las minusvalías pueden compensar plusvalías del mismo ejercicio y
                  hasta 4 años siguientes. Planifica tus ventas para optimizar la carga
                  fiscal total.
                </p>
              </div>

              <div className={styles.tipCard}>
                <h4>💡 Tip 2: Traspasos de Fondos</h4>
                <p>
                  Los traspasos entre fondos no tributan, permitiendo rebalancear tu
                  cartera sin consecuencias fiscales inmediatas. Aplaza el pago de
                  impuestos.
                </p>
              </div>

              <div className={styles.tipCard}>
                <h4>💡 Tip 3: Timing de Realizaciones</h4>
                <p>
                  Distribuye las realizaciones de plusvalías entre diferentes ejercicios
                  fiscales para aprovechar los tramos inferiores y reducir la tributación
                  total.
                </p>
              </div>

              <div className={styles.tipCard}>
                <h4>💡 Tip 4: Planificación Anual</h4>
                <p>
                  Revisa tus ganancias y pérdidas antes de final de año para tomar
                  decisiones estratégicas de venta que optimicen tu situación fiscal.
                </p>
              </div>
            </div>

            {/* FAQs */}
            <div className={styles.faqSection}>
              <h2>❓ Preguntas Frecuentes</h2>

              <details className={styles.faqItem}>
                <summary>
                  ¿Cuándo debo declarar los rendimientos del capital mobiliario?
                </summary>
                <p>
                  Debes declararlos en tu declaración de la renta anual si superan
                  1.600€ anuales en rendimientos o tienes obligación de declarar por
                  otros conceptos. Los bancos retienen impuestos a cuenta, pero la
                  liquidación final se hace en la declaración.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Cómo se calculan las plusvalías de acciones?</summary>
                <p>
                  La plusvalía es la diferencia entre el precio de venta y el precio de
                  compra. Si tienes varias compras de la misma acción, se aplica el
                  método FIFO (primero en entrar, primero en salir) para determinar el
                  coste de adquisición.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Las criptomonedas tributan igual que las acciones?</summary>
                <p>
                  Sí, las ganancias por venta de criptomonedas tributan como ganancias
                  patrimoniales con los mismos tramos que el capital mobiliario
                  (19%-30%). Cada intercambio entre criptomonedas también es un hecho
                  imponible.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>
                  ¿Puedo compensar pérdidas de criptomonedas con ganancias de acciones?
                </summary>
                <p>
                  Sí, todas las ganancias y pérdidas patrimoniales se integran en la
                  misma base imponible. Las minusvalías de criptomonedas pueden compensar
                  plusvalías de cualquier otro activo financiero.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>
                  ¿Qué ocurre si tengo pérdidas superiores a las ganancias?
                </summary>
                <p>
                  Las pérdidas netas se pueden compensar con ganancias patrimoniales de
                  los 4 ejercicios siguientes. No se pierde el derecho a la compensación,
                  pero no se pueden compensar con otros tipos de renta.
                </p>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* Footer meskeIA Unificado */}
      <Footer appName="Simulador IRPF 2025 - meskeIA" />
    </>
  );
}
