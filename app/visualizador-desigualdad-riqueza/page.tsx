'use client';
// @disclaimer: exempt

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency } from '@/lib/formatters';
import styles from './VisualizadorDesigualdadRiqueza.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PaisData {
  nombre: string;
  gini: number;
  lorenz: number[];
}

const PAISES: Record<string, PaisData> = {
  espana: {
    nombre: 'España',
    gini: 0.34,
    lorenz: [0, 5, 12, 22, 36, 54, 100],
  },
  sudafrica: {
    nombre: 'Sudáfrica',
    gini: 0.63,
    lorenz: [0, 1, 3, 7, 15, 30, 100],
  },
  dinamarca: {
    nombre: 'Dinamarca',
    gini: 0.29,
    lorenz: [0, 8, 18, 30, 45, 62, 100],
  },
  eeuu: {
    nombre: 'EE.UU.',
    gini: 0.41,
    lorenz: [0, 3, 8, 17, 30, 50, 100],
  },
  brasil: {
    nombre: 'Brasil',
    gini: 0.53,
    lorenz: [0, 2, 5, 11, 22, 42, 100],
  },
};

const ETIQUETAS_LORENZ = ['0%', '20%', '40%', '60%', '80%', '100%'];
const IGUALDAD_PERFECTA = [0, 20, 40, 60, 80, 100];

const DATOS_IMPACTANTES = [
  {
    icono: '💰',
    titulo: 'El 1% más rico del mundo posee el',
    valor: '45%',
    subtitulo: 'de toda la riqueza global',
    fuente: 'Oxfam 2024',
  },
  {
    icono: '🌍',
    titulo: 'Las 10 personas más ricas tienen más riqueza que los',
    valor: '4.100 millones',
    subtitulo: 'de personas más pobres juntas',
    fuente: 'Credit Suisse 2024',
  },
  {
    icono: '🇪🇸',
    titulo: 'En España, el 10% más rico posee el',
    valor: '54%',
    subtitulo: 'de la riqueza nacional',
    fuente: 'Banco de España 2024',
  },
  {
    icono: '📈',
    titulo: 'Desde 2020, los multimillonarios han visto su riqueza crecer',
    valor: '3×',
    subtitulo: 'más rápido que la inflación',
    fuente: 'Oxfam 2024',
  },
];

const QUINTILES = [
  { label: 'Quintil 1 (20% más pobre)', porcentaje: 2 },
  { label: 'Quintil 2', porcentaje: 8 },
  { label: 'Quintil 3', porcentaje: 15 },
  { label: 'Quintil 4', porcentaje: 22 },
  { label: 'Quintil 5 (20% más rico)', porcentaje: 53 },
];

const TABLA_POLITICAS = [
  {
    pais: 'Dinamarca',
    medida: 'Impuesto progresivo fuerte + transferencias',
    giniPre: 0.47,
    giniPost: 0.29,
  },
  {
    pais: 'España',
    medida: 'Sistema mixto de impuestos y transferencias',
    giniPre: 0.47,
    giniPost: 0.34,
  },
  {
    pais: 'EE.UU.',
    medida: 'Sistema menos redistributivo',
    giniPre: 0.53,
    giniPost: 0.41,
  },
];

export default function VisualizadorDesigualdadRiqueza() {
  const [paisSeleccionado, setPaisSeleccionado] = useState<string>('espana');
  const [rentabilidad, setRentabilidad] = useState<number>(7);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const paisActual = PAISES[paisSeleccionado];

  // Calculos simulador acumulación
  const anios = 30;
  const capitalPobre = 10_000 * Math.pow(1 + rentabilidad / 100, anios);
  const capitalRico = 1_000_000 * Math.pow(1 + rentabilidad / 100, anios);
  const ratio = capitalRico / capitalPobre;
  const diferencia = capitalRico - capitalPobre;

  // Datos Chart.js Lorenz
  const datosLorenz = {
    labels: ETIQUETAS_LORENZ,
    datasets: [
      {
        label: 'Igualdad perfecta',
        data: IGUALDAD_PERFECTA,
        borderColor: '#48A9A6',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: `Curva de Lorenz — ${paisActual.nombre}`,
        data: paisActual.lorenz,
        borderColor: '#2E86AB',
        backgroundColor: 'rgba(46, 134, 171, 0.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#2E86AB',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const opcionesLorenz = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { datasetIndex: number; dataIndex: number; formattedValue: string }) => {
            if (ctx.datasetIndex === 1) {
              const pct = ETIQUETAS_LORENZ[ctx.dataIndex];
              return `El ${pct} más pobre posee el ${ctx.formattedValue}% de la riqueza`;
            }
            return `Igualdad perfecta: ${ctx.formattedValue}%`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: '% de población (de más pobre a más rico)' } },
      y: { title: { display: true, text: '% de riqueza acumulada' }, min: 0, max: 100 },
    },
  };

  // Datos Chart.js barras quintiles
  const datosQuintiles = {
    labels: QUINTILES.map((q) => q.label),
    datasets: [
      {
        label: '% de riqueza en España',
        data: QUINTILES.map((q) => q.porcentaje),
        backgroundColor: [
          'rgba(46, 134, 171, 0.5)',
          'rgba(46, 134, 171, 0.6)',
          'rgba(46, 134, 171, 0.7)',
          'rgba(46, 134, 171, 0.8)',
          'rgba(46, 134, 171, 1.0)',
        ],
        borderColor: '#2E86AB',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const opcionesQuintiles = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { formattedValue: string }) => `${ctx.formattedValue}% de la riqueza`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: '% de riqueza' }, max: 60 },
    },
  };

  if (!montado) return null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Desigualdad de la Riqueza</h1>
        <p>Curva de Lorenz, coeficiente Gini y la distribución de la riqueza global visualizada</p>
      </header>

      <LegalNotice />

      {/* Bloque 1: Curva de Lorenz */}
      <section className={styles.section}>
        <h2>Curva de Lorenz interactiva</h2>
        <p className={styles.descripcion}>
          La curva de Lorenz muestra cuánta riqueza acumulan los grupos más pobres de la
          población. Cuanto más alejada de la diagonal, mayor la desigualdad.
        </p>

        <div className={styles.selectorRow}>
          <label htmlFor="selectorPais" className={styles.selectorLabel}>
            Selecciona un país:
          </label>
          <select
            id="selectorPais"
            className={styles.selectorPais}
            value={paisSeleccionado}
            onChange={(e) => setPaisSeleccionado(e.target.value)}
          >
            {Object.entries(PAISES).map(([key, data]) => (
              <option key={key} value={key}>
                {data.nombre}
              </option>
            ))}
          </select>

          <div className={styles.giniBadge} aria-label={`Coeficiente Gini de ${paisActual.nombre}`}>
            <span className={styles.giniBadgeLabel}>Coeficiente Gini</span>
            <span className={styles.giniBadgeValor}>{paisActual.gini.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.chartWrapper}>
          <Line data={datosLorenz} options={opcionesLorenz} />
        </div>
        <p className={styles.notaGrafico}>
          <strong>Cómo leer:</strong> Un punto en (40%, 12%) significa que el 40% más pobre de la
          población posee solo el 12% de la riqueza total.
        </p>
      </section>

      {/* Bloque 2: El 1% */}
      <section className={styles.section}>
        <h2>El 1% y la concentración extrema de riqueza</h2>

        <div className={styles.gridTarjetas}>
          {DATOS_IMPACTANTES.map((dato, i) => (
            <div key={i} className={styles.tarjetaDato}>
              <span className={styles.tarjetaIcono} aria-hidden="true">{dato.icono}</span>
              <p className={styles.tarjetaTitulo}>{dato.titulo}</p>
              <p className={styles.tarjetaValor}>{dato.valor}</p>
              <p className={styles.tarjetaSubtitulo}>{dato.subtitulo}</p>
              <p className={styles.tarjetaFuente}>Fuente: {dato.fuente}</p>
            </div>
          ))}
        </div>

        <h3 className={styles.subtitulo}>Distribución por quintiles en España</h3>
        <p className={styles.descripcion}>
          Cuánta riqueza nacional posee cada 20% de la población (ordenada de más pobre a más rica).
        </p>
        <div className={styles.chartWrapper}>
          <Bar data={datosQuintiles} options={opcionesQuintiles} />
        </div>
      </section>

      {/* Bloque 3: Efecto Acumulación */}
      <section className={styles.section}>
        <h2>Efecto Acumulación: la ventaja acumulativa</h2>
        <p className={styles.descripcion}>
          Ajusta la rentabilidad anual del capital y observa cómo evoluciona la brecha entre una
          persona con poco capital inicial y otra con mucho, a lo largo de 30 años.
        </p>

        <div className={styles.sliderContainer}>
          <label htmlFor="sliderRentabilidad" className={styles.sliderLabel}>
            Rentabilidad anual del capital:{' '}
            <strong className={styles.sliderValor}>{rentabilidad}%</strong>
          </label>
          <input
            id="sliderRentabilidad"
            type="range"
            min={1}
            max={15}
            value={rentabilidad}
            onChange={(e) => setRentabilidad(Number(e.target.value))}
            className={styles.slider}
            aria-label="Rentabilidad anual del capital"
          />
          <div className={styles.sliderTicks}>
            <span>1%</span>
            <span>5%</span>
            <span>10%</span>
            <span>15%</span>
          </div>
        </div>

        <div className={styles.resultadoAcumulacion}>
          <div className={styles.tarjetaAcumulacion}>
            <p className={styles.tarjetaAcuTitulo}>Persona A — Capital inicial: 10.000 €</p>
            <p className={styles.tarjetaAcuValor}>{formatCurrency(capitalPobre)}</p>
            <p className={styles.tarjetaAcuSub}>tras {anios} años al {rentabilidad}% anual</p>
          </div>
          <div className={styles.tarjetaAcumulacion + ' ' + styles.tarjetaRica}>
            <p className={styles.tarjetaAcuTitulo}>Persona B — Capital inicial: 1.000.000 €</p>
            <p className={styles.tarjetaAcuValor}>{formatCurrency(capitalRico)}</p>
            <p className={styles.tarjetaAcuSub}>tras {anios} años al {rentabilidad}% anual</p>
          </div>
        </div>

        <div className={styles.resultadoBrecha}>
          <div className={styles.brechaItem}>
            <span className={styles.brechaLabel}>Ratio B/A</span>
            <span className={styles.brechaValor}>{formatNumber(ratio, 0)} veces más</span>
          </div>
          <div className={styles.brechaItem}>
            <span className={styles.brechaLabel}>Diferencia absoluta</span>
            <span className={styles.brechaValor}>{formatCurrency(diferencia)}</span>
          </div>
        </div>

        <div className={styles.warningBox}>
          <strong>Efecto r &gt; g (Thomas Piketty):</strong> Cuando la rentabilidad del capital (r)
          supera el crecimiento económico (g), los propietarios de capital ven crecer su riqueza más
          rápido que el resto de la economía, aumentando la desigualdad de forma estructural.
        </div>
      </section>

      {/* Bloque 4: Políticas redistributivas */}
      <section className={styles.section}>
        <h2>¿Cómo se mide y qué hacemos?</h2>
        <p className={styles.descripcion}>
          La desigualdad de mercado (antes de impuestos) es similar en muchos países. Las
          diferencias reales provienen de los sistemas fiscales y de transferencias sociales.
        </p>

        <div className={styles.tablaWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>País</th>
                <th>Medida redistributiva</th>
                <th>Gini pre-impuestos</th>
                <th>Gini post-impuestos</th>
                <th>Reducción</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_POLITICAS.map((fila) => (
                <tr key={fila.pais}>
                  <td><strong>{fila.pais}</strong></td>
                  <td>{fila.medida}</td>
                  <td className={styles.celdaNumero}>{fila.giniPre.toFixed(2)}</td>
                  <td className={styles.celdaNumero}>{fila.giniPost.toFixed(2)}</td>
                  <td className={styles.celdaReduccion}>
                    -{((fila.giniPre - fila.giniPost) / fila.giniPre * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.mensajeClave}>
          <strong>Conclusión clave:</strong> La desigualdad de mercado es similar en muchos países;
          las diferencias provienen de impuestos y transferencias sociales.
        </p>
      </section>

      <EducationalSection title="¿Qué es la desigualdad de la riqueza y cómo se mide?" subtitle="Conceptos clave: Gini, Lorenz, r > g y políticas redistributivas">
        <div className={styles.eduBloque}>
          <h3>El coeficiente de Gini</h3>
          <p>
            El coeficiente de Gini es el indicador más usado para medir desigualdad. Va de 0
            (igualdad perfecta: todos tienen lo mismo) a 1 (desigualdad máxima: una persona tiene
            todo). Un Gini de 0.30 se considera bajo; de 0.50 o más, muy alto.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3>Cómo leer la curva de Lorenz</h3>
          <p>
            La curva de Lorenz ordena a la población de más pobre a más rica y muestra qué
            porcentaje de la riqueza acumula cada porcentaje de la población. La diagonal (línea de
            45°) representa la igualdad perfecta. El área entre la diagonal y la curva real es
            proporcional al coeficiente de Gini.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3>Riqueza vs ingresos: no es lo mismo</h3>
          <p>
            La riqueza (patrimonio neto: activos menos deudas) es mucho más desigual que los
            ingresos (salarios y rentas). Una persona puede tener ingresos medios pero acumular
            riqueza durante décadas. El Gini de riqueza suele ser 0.10-0.20 puntos mayor que el
            Gini de ingresos en el mismo país.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3>El debate r &gt; g de Thomas Piketty</h3>
          <p>
            En su obra <em>El Capital en el Siglo XXI</em> (2013), Piketty demuestra que
            históricamente la tasa de rentabilidad del capital (r) ha superado el crecimiento
            económico (g). Cuando r &gt; g, los dueños del capital ven crecer su riqueza más rápido
            que el conjunto de la economía, generando una concentración creciente. La única
            excepción histórica fueron las guerras mundiales y la posguerra (1914-1975).
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3>Desigualdad de oportunidades vs desigualdad de resultados</h3>
          <p>
            La desigualdad de <strong>resultados</strong> mide las diferencias en riqueza o ingresos
            actuales. La desigualdad de <strong>oportunidades</strong> mide si el punto de partida
            (familia, educación, código postal) determina el destino económico. Muchos economistas
            argumentan que reducir la segunda es más importante para la movilidad social.
          </p>
        </div>

        <div className={styles.warningBox}>
          <strong>Nota sobre los datos:</strong> Los datos de riqueza son aproximaciones basadas en
          encuestas y registros financieros. La riqueza oculta en paraísos fiscales hace que la
          desigualdad real sea significativamente mayor que las estadísticas oficiales. Estudios
          como los de Gabriel Zucman estiman que entre el 8% y el 10% de la riqueza global está
          offshore y no aparece en las estadísticas nacionales.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-desigualdad-riqueza')} />
      <ShareCard appName="visualizador-desigualdad-riqueza" />
      <Footer appName="visualizador-desigualdad-riqueza" />
    </div>
  );
}
