'use client';

import { useState } from 'react';
import styles from './CalculadoraPercentiles.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Sexo = 'nino' | 'nina';

// Datos OMS simplificados para peso (kg) por edad en meses - Percentiles P3, P15, P50, P85, P97
const PESO_NINOS: Record<number, number[]> = {
  0: [2.5, 2.9, 3.3, 3.9, 4.4],
  1: [3.4, 3.9, 4.5, 5.1, 5.8],
  2: [4.3, 4.9, 5.6, 6.3, 7.1],
  3: [5.0, 5.7, 6.4, 7.2, 8.0],
  6: [6.4, 7.1, 7.9, 8.8, 9.8],
  9: [7.2, 8.0, 8.9, 9.9, 11.0],
  12: [7.8, 8.6, 9.6, 10.8, 12.0],
  18: [8.8, 9.7, 10.9, 12.2, 13.7],
  24: [9.7, 10.8, 12.2, 13.6, 15.3],
  36: [11.3, 12.7, 14.3, 16.2, 18.3],
  48: [12.7, 14.4, 16.3, 18.6, 21.2],
  60: [14.1, 16.0, 18.3, 21.0, 24.2],
};

const PESO_NINAS: Record<number, number[]> = {
  0: [2.4, 2.8, 3.2, 3.7, 4.2],
  1: [3.2, 3.6, 4.2, 4.8, 5.5],
  2: [3.9, 4.5, 5.1, 5.8, 6.6],
  3: [4.5, 5.2, 5.8, 6.6, 7.5],
  6: [5.7, 6.5, 7.3, 8.2, 9.3],
  9: [6.5, 7.3, 8.2, 9.3, 10.5],
  12: [7.0, 7.9, 8.9, 10.1, 11.5],
  18: [8.1, 9.1, 10.2, 11.6, 13.2],
  24: [9.0, 10.2, 11.5, 13.0, 14.8],
  36: [10.8, 12.3, 14.0, 16.0, 18.3],
  48: [12.3, 14.0, 16.1, 18.5, 21.5],
  60: [13.7, 15.8, 18.2, 21.2, 24.9],
};

// Datos OMS simplificados para talla (cm) por edad en meses
const TALLA_NINOS: Record<number, number[]> = {
  0: [46.1, 48.0, 49.9, 51.8, 53.7],
  1: [50.8, 52.8, 54.7, 56.7, 58.6],
  2: [54.4, 56.4, 58.4, 60.4, 62.4],
  3: [57.3, 59.4, 61.4, 63.5, 65.5],
  6: [63.3, 65.5, 67.6, 69.8, 71.9],
  9: [67.5, 69.7, 72.0, 74.2, 76.5],
  12: [71.0, 73.4, 75.7, 78.1, 80.5],
  18: [76.9, 79.6, 82.3, 85.0, 87.7],
  24: [81.7, 84.8, 87.8, 90.9, 94.0],
  36: [89.9, 93.5, 96.1, 99.8, 103.5],
  48: [96.1, 100.3, 103.3, 107.5, 111.7],
  60: [102.0, 106.7, 110.0, 114.6, 119.2],
};

const TALLA_NINAS: Record<number, number[]> = {
  0: [45.4, 47.3, 49.1, 51.0, 52.9],
  1: [49.8, 51.7, 53.7, 55.6, 57.6],
  2: [53.0, 55.0, 57.1, 59.1, 61.1],
  3: [55.6, 57.7, 59.8, 61.9, 64.0],
  6: [61.2, 63.5, 65.7, 68.0, 70.3],
  9: [65.3, 67.7, 70.1, 72.6, 75.0],
  12: [68.9, 71.4, 74.0, 76.6, 79.2],
  18: [74.9, 77.8, 80.7, 83.6, 86.5],
  24: [80.0, 83.2, 86.4, 89.6, 92.9],
  36: [88.4, 91.9, 95.1, 99.1, 102.7],
  48: [94.9, 98.9, 102.7, 106.9, 111.3],
  60: [101.1, 105.5, 109.4, 114.2, 118.9],
};

export default function CalculadoraPercentilesPage() {
  const [sexo, setSexo] = useState<Sexo>('nino');
  const [edadMeses, setEdadMeses] = useState('');
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [resultado, setResultado] = useState<{
    percentilPeso: string;
    percentilTalla: string;
    interpretacionPeso: string;
    interpretacionTalla: string;
  } | null>(null);

  const obtenerEdadMasCercana = (meses: number): number => {
    const edades = [0, 1, 2, 3, 6, 9, 12, 18, 24, 36, 48, 60];
    return edades.reduce((prev, curr) =>
      Math.abs(curr - meses) < Math.abs(prev - meses) ? curr : prev
    );
  };

  const calcularPercentil = (valor: number, referencias: number[]): string => {
    // referencias = [P3, P15, P50, P85, P97]
    if (valor < referencias[0]) return '< 3';
    if (valor < referencias[1]) return '3-15';
    if (valor < referencias[2]) return '15-50';
    if (valor < referencias[3]) return '50-85';
    if (valor < referencias[4]) return '85-97';
    return '> 97';
  };

  const obtenerInterpretacion = (percentil: string): string => {
    if (percentil === '< 3') return 'Por debajo del rango normal. Consultar pediatra.';
    if (percentil === '3-15') return 'Rango bajo-normal.';
    if (percentil === '15-50') return 'Rango normal.';
    if (percentil === '50-85') return 'Rango normal.';
    if (percentil === '85-97') return 'Rango alto-normal.';
    return 'Por encima del rango normal. Consultar pediatra.';
  };

  const calcular = () => {
    const meses = parseInt(edadMeses);
    const pesoNum = parseFloat(peso.replace(',', '.'));
    const tallaNum = parseFloat(talla.replace(',', '.'));

    if (isNaN(meses) || meses < 0 || meses > 60) return;
    if (isNaN(pesoNum) || pesoNum <= 0) return;
    if (isNaN(tallaNum) || tallaNum <= 0) return;

    const edadRef = obtenerEdadMasCercana(meses);
    const tablaPeso = sexo === 'nino' ? PESO_NINOS : PESO_NINAS;
    const tablaTalla = sexo === 'nino' ? TALLA_NINOS : TALLA_NINAS;

    const refPeso = tablaPeso[edadRef];
    const refTalla = tablaTalla[edadRef];

    if (!refPeso || !refTalla) return;

    const percentilPeso = calcularPercentil(pesoNum, refPeso);
    const percentilTalla = calcularPercentil(tallaNum, refTalla);

    setResultado({
      percentilPeso,
      percentilTalla,
      interpretacionPeso: obtenerInterpretacion(percentilPeso),
      interpretacionTalla: obtenerInterpretacion(percentilTalla),
    });
  };

  const limpiar = () => {
    setEdadMeses('');
    setPeso('');
    setTalla('');
    setResultado(null);
  };

  const getColorPercentil = (percentil: string): string => {
    if (percentil === '< 3' || percentil === '> 97') return styles.alerta;
    if (percentil === '3-15' || percentil === '85-97') return styles.atencion;
    return styles.normal;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Percentiles Infantiles</h1>
        <p className={styles.subtitle}>
          Compara el peso y talla de tu hijo con las tablas de la OMS
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Datos del niño/a</h2>

          {/* Selector de sexo */}
          <div className={styles.sexoSelector}>
            <button
              className={`${styles.sexoBtn} ${sexo === 'nino' ? styles.active : ''}`}
              onClick={() => setSexo('nino')}
            >
              👦 Niño
            </button>
            <button
              className={`${styles.sexoBtn} ${sexo === 'nina' ? styles.active : ''}`}
              onClick={() => setSexo('nina')}
            >
              👧 Niña
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label>Edad (meses)</label>
            <div className={styles.inputConUnidad}>
              <input
                type="number"
                value={edadMeses}
                onChange={(e) => setEdadMeses(e.target.value)}
                placeholder="12"
                min="0"
                max="60"
                className={styles.input}
              />
              <span className={styles.unidad}>meses</span>
            </div>
            <span className={styles.hint}>De 0 a 60 meses (5 años)</span>
          </div>

          <div className={styles.inputGroup}>
            <label>Peso</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="10,5"
                className={styles.input}
              />
              <span className={styles.unidad}>kg</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Talla / Altura</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
                placeholder="75"
                className={styles.input}
              />
              <span className={styles.unidad}>cm</span>
            </div>
          </div>

          <div className={styles.botones}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular Percentiles
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Percentil de Peso */}
              <div className={`${styles.resultadoCard} ${getColorPercentil(resultado.percentilPeso)}`}>
                <div className={styles.resultadoHeader}>
                  <span className={styles.resultadoIcon}>⚖️</span>
                  <span className={styles.resultadoTipo}>Percentil de Peso</span>
                </div>
                <div className={styles.resultadoValor}>
                  P{resultado.percentilPeso}
                </div>
                <div className={styles.resultadoInterpretacion}>
                  {resultado.interpretacionPeso}
                </div>
              </div>

              {/* Percentil de Talla */}
              <div className={`${styles.resultadoCard} ${getColorPercentil(resultado.percentilTalla)}`}>
                <div className={styles.resultadoHeader}>
                  <span className={styles.resultadoIcon}>📏</span>
                  <span className={styles.resultadoTipo}>Percentil de Talla</span>
                </div>
                <div className={styles.resultadoValor}>
                  P{resultado.percentilTalla}
                </div>
                <div className={styles.resultadoInterpretacion}>
                  {resultado.interpretacionTalla}
                </div>
              </div>

              {/* Escala visual */}
              <div className={styles.escalaVisual}>
                <h4>Escala de Percentiles</h4>
                <div className={styles.escala}>
                  <div className={styles.escalaBarra}>
                    <span className={styles.escalaMarca} style={{ left: '3%' }}>P3</span>
                    <span className={styles.escalaMarca} style={{ left: '15%' }}>P15</span>
                    <span className={styles.escalaMarca} style={{ left: '50%' }}>P50</span>
                    <span className={styles.escalaMarca} style={{ left: '85%' }}>P85</span>
                    <span className={styles.escalaMarca} style={{ left: '97%' }}>P97</span>
                  </div>
                  <div className={styles.escalaLabels}>
                    <span>Bajo</span>
                    <span>Normal</span>
                    <span>Alto</span>
                  </div>
                </div>
              </div>

              {/* Info percentiles */}
              <div className={styles.infoPercentiles}>
                <h4>¿Qué significa el percentil?</h4>
                <p>
                  El percentil indica la posición de tu hijo comparado con otros niños de su misma
                  edad y sexo. Por ejemplo, un percentil 50 significa que está en la media: el 50%
                  de los niños pesan/miden menos y el 50% más.
                </p>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>👶</span>
              <p>Introduce los datos para calcular los percentiles</p>
            </div>
          )}
        </div>
      </div>

      {/* Enlace relacionado */}
      <div className={styles.enlaceRelacionado}>
        <p>🤰 <strong>¿Esperando un bebé?</strong> Planifica todo con el{' '}
          <a href="/planificador-embarazo/">Planificador de Embarazo y Bebé</a>
          {' '}(calculadora FPP, checklist, lista de compras y vacunas)
        </p>
      </div>

      {/* Última Actualización */}
      

      {/* DISCLAIMER PEDIÁTRICO - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="medical"
        severity="critical"
        collapsible={false}
        context="calculadora-percentiles"
      >
        <p>
          Esta calculadora utiliza <strong>tablas simplificadas de la OMS</strong> para crecimiento infantil (0-5 años).
          Es fundamental que entiendas las siguientes limitaciones:
        </p>

        <ul className={styles.disclaimerList}>
          <li><strong>UN SOLO VALOR NO INDICA NADA</strong>: El pediatra debe evaluar la CURVA DE CRECIMIENTO a lo largo del tiempo, no un punto aislado. Un bebé puede estar en P10 y estar perfectamente sano si crece de forma constante</li>
          <li><strong>La genética familiar es clave</strong>: Hijos de padres bajos tenderán a percentiles bajos. Hijos de padres altos tenderán a percentiles altos. Esto es NORMAL</li>
          <li><strong>No detecta todos los problemas de salud</strong>: Hay enfermedades que no afectan al peso/talla inicialmente (cardiopatías, problemas metabólicos, etc.). El pediatra debe hacer un examen clínico completo</li>
          <li><strong>Percentiles extremos requieren valoración médica</strong>: Estar por debajo de P3 o por encima de P97 no es automáticamente malo, pero sí requiere seguimiento pediátrico estrecho</li>
          <li><strong>Los bebés prematuros necesitan corrección de edad</strong>: Hasta los 2 años, se debe usar la edad corregida (restando semanas de prematuridad)</li>
        </ul>

        <p className={styles.highlight}>
          <strong>⚕️ Esta herramienta NO sustituye las revisiones del niño sano con tu pediatra.</strong>
          El crecimiento infantil se evalúa en conjunto con desarrollo psicomotor, alimentación, vacunas y exploración física.
          Nunca tomes decisiones sobre la alimentación de tu bebé sin consultar con el pediatra.
        </p>

        <p className={styles.emergency}>
          🚨 <strong>Si tu bebé/niño presenta pérdida de peso, rechazo del alimento, vómitos persistentes,
          diarrea grave o decaimiento importante, acude a urgencias pediátricas inmediatamente.</strong>
        </p>
      </DisclaimerCard>

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection title="📊 Guía completa para entender los percentiles infantiles" subtitle="Todo lo que necesitas saber sobre el crecimiento infantil y cómo interpretar las gráficas de tu pediatra">

        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2>📈 Qué significa cada percentil: guía de interpretación</h2>
          <p className={styles.eduIntro}>
            Los percentiles comparan a tu hijo con 100 niños de su misma edad y sexo. Un percentil 75 significa que tu hijo supera en peso o talla al 75% de sus iguales. Esta tabla te ayuda a interpretar cada rango.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Percentil</th>
                  <th>Interpretación</th>
                  <th>¿Es normal?</th>
                  <th>Acción recomendada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Menor de P3</strong></td>
                  <td>Por debajo del 97% de niños de su edad</td>
                  <td>⚠️ Requiere valoración</td>
                  <td>Comentar en la próxima revisión pediátrica. Puede ser constitucional (padres bajos/delgados) o requerir estudio.</td>
                </tr>
                <tr>
                  <td><strong>P3 - P15</strong></td>
                  <td>Rango bajo-normal</td>
                  <td>✅ Generalmente normal</td>
                  <td>Normal si los padres tienen talla/peso similar. Seguimiento en revisiones habituales del niño sano.</td>
                </tr>
                <tr>
                  <td><strong>P15 - P50</strong></td>
                  <td>Rango normal-medio</td>
                  <td>✅ Normal</td>
                  <td>Ninguna. Revisiones periódicas del niño sano según calendario.</td>
                </tr>
                <tr>
                  <td><strong>P50 - P85</strong></td>
                  <td>Rango medio-alto normal</td>
                  <td>✅ Normal</td>
                  <td>Ninguna. Revisiones periódicas del niño sano según calendario.</td>
                </tr>
                <tr>
                  <td><strong>P85 - P97</strong></td>
                  <td>Rango alto-normal</td>
                  <td>✅ Generalmente normal</td>
                  <td>Normal si los padres tienen talla/peso similar. Para peso, vigilar tendencia al alza entre revisiones.</td>
                </tr>
                <tr>
                  <td><strong>Mayor de P97</strong></td>
                  <td>Por encima del 97% de niños de su edad</td>
                  <td>⚠️ Requiere valoración</td>
                  <td>Comentar en la próxima revisión. Para talla puede ser constitucional; para peso puede indicar sobrepeso que conviene monitorizar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.eduEscenarios}>
          <h2>💼 Situaciones frecuentes y cómo interpretar los resultados</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📋</span>
                <h3>Revisión rutinaria del niño sano</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`Niño 18 meses\nPeso: 10,8 kg → P50\nTalla: 83 cm → P60\nTendencia: estable desde los 12 meses`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Interpretación correcta:</strong> Un solo punto en la gráfica no dice mucho. Lo importante es la tendencia de los últimos 3-4 controles. Si el niño siempre ha estado en P50 y sigue ahí, está creciendo perfectamente. El pediatra evaluará la curva completa, no el percentil aislado.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🍼</span>
                <h3>Bebé prematuro (edad corregida)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`Bebé nacido a 32 semanas\nEdad real: 4 meses\nEdad corregida: 4 - 2 = 2 meses\n→ Usar tablas de 2 meses`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Interpretación correcta:</strong> Los bebés prematuros deben valorarse con su <strong>edad corregida</strong> (edad real - semanas de prematuridad) hasta los 2 años. Un prematuro de 4 meses puede parecer por debajo de los percentiles, pero si usamos los 2 meses corregidos, su desarrollo puede ser completamente normal. Esta herramienta usa la edad real introducida, así que tú debes calcular la edad corregida.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📉</span>
                <h3>Caída de percentil entre revisiones</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`12 meses: Peso P60\n18 meses: Peso P35\n24 meses: Peso P20\n→ Caída de 2 canales percentiles`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Interpretación correcta:</strong> Una caída de más de 2 &quot;canales percentiles&quot; (ejemplo: pasar de P50-75 a P15-25) en un período corto es más relevante que el percentil absoluto. Esta tendencia descendente, aunque el niño esté en rango &quot;normal&quot;, merece ser comentada con el pediatra. Puede tener causa simple (cambio de alimentación, enfermedad) o requerir estudio.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
                <h3>Comparar con hermanos mayores</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`Padre: 1,68m (percentil bajo)\nMadre: 1,60m (percentil bajo)\nHijo 2 años: Talla P10 → Normal\n(Herencia familiar)`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Interpretación correcta:</strong> La genética familiar es el factor más determinante del crecimiento infantil. Hijos de padres de talla baja tendrán percentiles de talla bajos sin que sea patológico. El pediatra calcula la &quot;talla diana&quot; familiar (media de padres corregida) para contextualizar si el percentil es adecuado para esa familia concreta.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
                <h3>Diferencia grande entre talla y peso</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`Niña 36 meses\nTalla: P75 (alta para su edad)\nPeso: P30 (bajo para su talla)\n→ IMC bajo`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Interpretación correcta:</strong> Cuando la diferencia entre percentil de talla y peso es mayor de 2 canales (ejemplo: talla P75 y peso P25), el pediatra evaluará el &quot;peso para la talla&quot; o IMC-para-edad. En este caso, una niña alta con peso bajo puede estar adelgazando o ser simplemente estilizada según su genética. Esta herramienta no calcula el IMC pediátrico, que es diferente al del adulto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏥</span>
                <h3>Seguimiento tras enfermedad</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>{`Bebé 9 meses: Peso P50\nGastroenteritis severa (2 semanas)\n12 meses: Peso P30\n→ Pérdida transitoria esperada`}</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Interpretación correcta:</strong> Tras una enfermedad aguda (gastroenteritis, infección respiratoria), es normal que el peso baje 1-2 canales percentiles temporalmente. El &quot;crecimiento de recuperación&quot; (catch-up growth) ocurre en las semanas siguientes. Si a los 2-3 meses de recuperarse el peso no ha vuelto al canal habitual, sí es motivo de consulta al pediatra.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>❓ Preguntas frecuentes sobre percentiles</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ Mi hijo está en el percentil 10 de peso. ¿Es demasiado bajo?</h4>
              <p>
                No necesariamente. El percentil 10 significa que tu hijo tiene más peso que el 10% de los niños de su edad y sexo. El rango considerado normal va de P3 a P97. Si siempre ha estado en P10 y su curva es estable, es simplemente un niño &quot;pequeño de constitución&quot;. Si hay una caída reciente de percentil, sí merece atención pediátrica. Recuerda que la genética familiar es el factor más importante: padres delgados/bajos suelen tener hijos en percentiles bajos y es completamente normal.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Lo más importante es la tendencia (que la curva sea estable), no el percentil absoluto. Un niño en P10 que siempre ha estado en P10 está perfectamente.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué son las tablas de la OMS y por qué usamos esas?</h4>
              <p>
                La Organización Mundial de la Salud desarrolló sus tablas de crecimiento entre 2003-2006 con datos de 8.500 niños de 6 países (Brasil, Ghana, India, Noruega, Omán y EEUU) en condiciones óptimas de salud (lactancia materna, sin tabaco, entorno socioeconómico favorable). Estas tablas representan cómo <strong>deberían crecer</strong> los niños en condiciones ideales, no cómo crecen de media. España adoptó las tablas OMS como referencia oficial en 2010. Esta herramienta usa datos OMS simplificados para edades clave de 0 a 60 meses.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Para una valoración precisa, tu pediatra usará las tablas OMS completas con curvas de crecimiento continuas, no solo los percentiles de edades clave como esta herramienta.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo afecta la lactancia materna vs artificial al crecimiento?</h4>
              <p>
                Los bebés con lactancia materna exclusiva suelen crecer más rápido los primeros 3-4 meses y después más despacio que los de lactancia artificial. Esto es completamente normal. Las tablas OMS se diseñaron precisamente con bebés de lactancia materna porque es el patrón de crecimiento saludable de referencia. Si tu bebé tiene lactancia artificial y está en percentiles más altos, puede ser normal también; el pediatra evaluará la velocidad de ganancia de peso.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> No cambies el tipo de alimentación de tu bebé basándote en los percentiles. Esta decisión debe tomarse siempre con el pediatra o enfermera pediátrica.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ Mi hijo pasó de P60 a P30 en 3 meses. ¿Es preocupante?</h4>
              <p>
                Una caída de 2 o más canales percentiles (especialmente si es rápida) merece atención, aunque el niño siga en rango &quot;normal&quot;. Las causas más frecuentes son: enfermedad reciente, cambio de alimentación, periodo de menor ingesta (destete, introducción de sólidos), o simplemente que el punto anterior fue medido en un mal momento (enfermo, recién comido). Si la caída se confirma en dos mediciones consecutivas sin causa aparente, consúltalo con el pediatra.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Anota siempre el contexto de cada medición (¿estaba enfermo?, ¿recién comido?, ¿con ropa?). Un solo dato sin contexto tiene poco valor diagnóstico.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo usar esta herramienta para niños mayores de 5 años?</h4>
              <p>
                Esta calculadora está diseñada para el rango de edad de 0 a 60 meses (5 años), que corresponde a las tablas OMS de crecimiento infantil. Para niños mayores (5-18 años), se usan otras referencias (OMS para 5-19 años, o tablas de la Fundación Orbegozo en España). Las herramientas de percentil para escolares y adolescentes incluyen también el IMC-para-edad, que es diferente al IMC del adulto.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Para niños mayores de 5 años, consulta directamente con el pediatra o enfermera pediátrica, que tienen acceso a las tablas adecuadas para esa edad.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cada cuánto tiempo debo pesar y medir a mi bebé en casa?</h4>
              <p>
                Las revisiones del pediatra ya incluyen peso y talla en los momentos clave (1, 2, 4, 6, 9, 12, 15, 18, 24 meses y luego anuales). No es necesario pesar al bebé en casa con más frecuencia, salvo indicación del pediatra. El peso excesivamente frecuente genera ansiedad en los padres y la variación diaria (por agua, deposiciones, alimentación) no tiene significado clínico. En caso de preocupación, una báscula de farmacia da mediciones más fiables que las domésticas.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Si tu bebé está ganando peso adecuadamente, el pediatra te lo dirá en cada revisión. No necesitas controles domésticos frecuentes salvo indicación médica.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿La talla de los percentiles determina la altura de adulto?</h4>
              <p>
                Tiene correlación pero no es determinista. La <strong>talla diana familiar</strong> (calculada como la media de la talla de los padres ± 6,5cm según el sexo) predice mejor la talla adulta que los percentiles infantiles. Los niños en P5 de talla no necesariamente serán adultos bajos si sus padres son de talla media. El crecimiento acelerado en la pubertad puede cambiar significativamente el percentil. El período crítico de mayor influencia sobre la talla adulta es entre 0-3 años y la pubertad.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> La fórmula aproximada de talla diana: Para niños: (talla papá + talla mamá + 13cm) ÷ 2 ± 8,5cm. Para niñas: (talla papá + talla mamá - 13cm) ÷ 2 ± 8,5cm.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué esta herramienta solo tiene percentiles P3, P15, P50, P85 y P97?</h4>
              <p>
                Las tablas completas de la OMS incluyen hasta 9 líneas de percentiles (P3, P5, P10, P15, P25, P50, P75, P85, P90, P97). Esta herramienta usa 5 puntos de referencia, lo que permite calcular el rango percentil de forma simplificada. Para una valoración precisa, el pediatra utiliza las tablas gráficas completas donde se puede ver exactamente en qué percentil está el niño con mayor resolución. Esta herramienta es una orientación, no un diagnóstico.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Si quieres ver la curva completa, pide a tu pediatra que te muestre la gráfica de crecimiento de tu hijo en cada revisión. Es tu derecho y ayuda a entender la evolución.
              </p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2>📋 Cómo hacer un seguimiento del crecimiento en casa</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Anota los datos en cada revisión pediátrica</h4>
                <p>
                  En cada revisión del niño sano, el pediatra mide peso y talla. Anota estos datos con la fecha exacta en un registro propio (libreta, app o hoja de cálculo). Incluye también si el niño estaba enfermo esa semana, ya que puede afectar el resultado puntualmente.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Calcula la edad correcta en meses</h4>
                <p>
                  La edad se calcula en meses completos (no décimas). Si tu hijo nació el 15 de enero de 2024 y hoy es 20 de julio de 2025, tiene 18 meses completos. Para bebés prematuros, resta las semanas de prematuridad a la edad real hasta los 2 años de edad corregida.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Usa pesos y tallas medidos correctamente</h4>
                <p>
                  El peso debe medirse en báscula calibrada, con el bebé sin ropa ni pañal, preferiblemente a la misma hora del día. La talla en menores de 2 años se mide tumbado (longitud), no de pie. A partir de los 2 años se mide de pie (estatura). Esta diferencia puede ser de 0,5-1 cm y las tablas lo tienen en cuenta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Busca la tendencia, no el dato puntual</h4>
                <p>
                  Compara los últimos 3-4 registros. Si el percentil es estable (±10 puntos en el mismo canal), el crecimiento es adecuado independientemente del percentil absoluto. Si hay una caída o subida brusca entre dos mediciones, puede ser normal (enfermedad, estirón) o merecer valoración médica.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Contextualiza con la genética familiar</h4>
                <p>
                  Anota la talla y complexión de ambos padres. Si los dos son de talla baja, percentiles de talla bajos en el niño son esperables y normales. Calcula la talla diana: para niños: (talla padre + talla madre + 13cm) ÷ 2; para niñas: (talla padre + talla madre - 13cm) ÷ 2. El resultado es ±8,5cm del rango esperado.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Lleva el registro a las revisiones</h4>
                <p>
                  Comparte tu registro con el pediatra en cada visita. El tener los datos propios permite al médico ver patrones que podrían no aparecer en el historial clínico informatizado. Pregunta en cada revisión: &quot;¿La curva de crecimiento de mi hijo es adecuada?&quot; y pide que te expliquen lo que ven en la gráfica.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.eduTips}>
          <h2>✅ 6 claves para interpretar correctamente los percentiles</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>La curva importa más que el punto</h4>
              <p>Un niño en P5 estable es más sano que uno que baja de P60 a P20. La tendencia es el indicador clave, no el percentil absoluto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Corrige la edad en prematuros</h4>
              <p>Hasta los 2 años, los prematuros deben compararse con su edad corregida. No hacerlo genera alarma innecesaria en padres y falsos positivos de retraso.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Un dato no hace diagnóstico</h4>
              <p>El percentil es una fotografía. El diagnóstico de alteración del crecimiento requiere al menos 3-4 mediciones en el tiempo más valoración clínica completa del pediatra.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>La genética familiar es determinante</h4>
              <p>El 80% de la variación de talla entre individuos tiene base genética. Contextualizar el percentil del niño con la talla de los padres es fundamental para una interpretación correcta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Mide siempre en las mismas condiciones</h4>
              <p>Sin ropa, misma báscula, misma hora del día. Las variaciones por ropa (hasta 1 kg) y hidratación pueden cambiar el percentil calculado sin que haya ningún cambio real en el niño.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Consulta ante la duda, no ante el número</h4>
              <p>Si el percentil te preocupa pero tu hijo come bien, tiene energía y está activo, probablemente esté perfectamente. Consulta al pediatra si hay cambios en comportamiento o alimentación, no solo por el número.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.eduWarning}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores de interpretación frecuentes que generan ansiedad innecesaria</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Comparar a tu hijo con otros niños en lugar de con su propia curva:</strong> &quot;El hijo de mi vecina ya pesa 12 kg y el mío solo 10&quot; es la comparación más frecuente y menos útil. Cada niño tiene su propia curva de crecimiento determinada por la genética. Dos niños del mismo mes pueden tener 3-4 kg de diferencia sin que ninguno tenga ningún problema.
              </li>
              <li>
                <strong>❌ Pesarle en casa muy frecuentemente:</strong> El peso de un bebé varía 200-500g en el mismo día según las tomas, el estado de hidratación y las deposiciones. Pesarle cada día o varias veces por semana genera ansiedad sin aportar información clínica útil. Las básculas domésticas tienen además un margen de error que puede ser relevante en bebés pequeños.
              </li>
              <li>
                <strong>❌ Cambiar la alimentación sin consultar al pediatra basándose en el percentil:</strong> Aumentar la cantidad de biberón, añadir leche de fórmula si hay lactancia materna, o cambiar la alimentación complementaria por un percentil bajo puede ser contraproducente. Solo el pediatra puede indicar cambios en la alimentación de tu bebé.
              </li>
              <li>
                <strong>❌ No usar la edad corregida en prematuros:</strong> Un prematuro de 30 semanas que tiene 3 meses de edad real debería compararse con tablas de 3 meses menos las 10 semanas de prematuridad = 0 meses/recién nacido. No corregir la edad hace que parezca que el bebé &quot;está por debajo&quot; cuando en realidad está creciendo perfectamente para su edad corregida.
              </li>
              <li>
                <strong>❌ Dar importancia excesiva a una medición tras una enfermedad:</strong> Un bebé que ha tenido gastroenteritis, bronquiolitis u otra enfermedad aguda puede perder 300-600g en pocos días. Esto es esperable y se recupera. Medir el percentil justo al salir de una enfermedad da una foto distorsionada de la realidad.
              </li>
              <li>
                <strong>❌ Asumir que un percentil alto de peso es siempre positivo:</strong> Los percentiles muy altos de peso (especialmente P85-P97) en bebés de lactancia artificial o en niños que ya comen sólidos sí merecen atención. El exceso de peso en la infancia tiene factores de riesgo que el pediatra debe valorar, aunque siempre de forma individual y sin alarmar innecesariamente.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-percentiles')} />

      <ShareCard appName="calculadora-percentiles" />
      <Footer appName="calculadora-percentiles" />
    </div>
  );
}
