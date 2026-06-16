'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorLactasa.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Datos de prevalencia de intolerancia a la lactosa por región
const regionesLactosa = [
  { region: 'Europa del Norte', porcentaje: 5 },
  { region: 'España/Europa del Sur', porcentaje: 35 },
  { region: 'Norteamérica (blancos)', porcentaje: 15 },
  { region: 'Latinoamérica', porcentaje: 65 },
  { region: 'África Subsahariana', porcentaje: 75 },
  { region: 'Oriente Medio', porcentaje: 70 },
  { region: 'Asia Oriental', porcentaje: 90 },
  { region: 'África Oriental (pastores)', porcentaje: 20 },
];

// Pasos del mecanismo de digestión de lactosa
const PASOS = [
  {
    titulo: 'Paso 1: La Lactosa llega al Intestino Delgado',
    descripcion:
      'Al consumir leche u otros productos lácteos, la lactosa (un disacárido formado por dos azúcares unidos) llega intacta al intestino delgado.',
    fase: 'entrada',
  },
  {
    titulo: 'Paso 2: La Lactasa se Une a la Lactosa',
    descripcion:
      'La lactasa, una enzima anclada en el borde en cepillo de las células intestinales (enterocitos), reconoce y se une a la molécula de lactosa mediante su sitio activo.',
    fase: 'union',
  },
  {
    titulo: 'Paso 3: Ruptura en Glucosa + Galactosa',
    descripcion:
      'La lactasa cataliza la hidrólisis del enlace glucosídico, rompiendo la lactosa en glucosa y galactosa. Ambos monosacáridos son absorbidos directamente al torrente sanguíneo y sirven como fuente de energía.',
    fase: 'ruptura',
  },
];

// Etapas del flujo de intolerancia sin lactasa
const FLUJO_INTOLERANCIA = [
  {
    icono: '🥛',
    titulo: 'Lactosa no digerida',
    descripcion: 'Sin lactasa, la lactosa llega intacta al intestino grueso.',
  },
  {
    icono: '🦠',
    titulo: 'Fermentación bacteriana',
    descripcion: 'Las bacterias del colon fermentan la lactosa produciendo gases (H₂, CO₂, metano) y ácidos grasos de cadena corta.',
  },
  {
    icono: '💧',
    titulo: 'Efecto osmótico',
    descripcion: 'La lactosa no digerida atrae agua al intestino por ósmosis, aumentando el volumen intestinal.',
  },
  {
    icono: '😣',
    titulo: 'Resultado fisiológico',
    descripcion: 'La combinación de gas y agua en el colon produce los síntomas digestivos característicos de la intolerancia.',
  },
];

// Hitos evolutivos de la persistencia de lactasa
const TIMELINE = [
  {
    anio: '~10.000 a.C.',
    evento: 'Todos los humanos adultos pierden lactasa (estado ancestral, igual que el resto de mamíferos)',
    destacado: false,
  },
  {
    anio: '~7.500 a.C.',
    evento: 'Mutación de persistencia en Europa del Norte — pastores neolíticos con ventaja nutricional',
    destacado: true,
  },
  {
    anio: '~3.000 a.C.',
    evento: 'Mutación independiente en África Oriental — pueblos pastores (fulani, masái)',
    destacado: true,
  },
  {
    anio: '~2.000 a.C.',
    evento: 'Mutación independiente en Arabia — otra aparición convergente',
    destacado: true,
  },
  {
    anio: 'Hoy',
    evento: '~35% de la humanidad tiene persistencia de lactasa — una de las adaptaciones evolutivas más recientes y documentadas',
    destacado: false,
  },
];

function getColorBarra(porcentaje: number): string {
  if (porcentaje < 30) return '#48A9A6';
  if (porcentaje <= 60) return '#F59E0B';
  return '#EF4444';
}

export default function VisualizadorLactasa() {
  const [paso, setPaso] = useState(0);
  const relatedApps = getRelatedApps('visualizador-lactasa');

  const coloresBarra = regionesLactosa.map((r) => getColorBarra(r.porcentaje));

  const datosGrafico = {
    labels: regionesLactosa.map((r) => r.region),
    datasets: [
      {
        label: '% Adultos con deficiencia de lactasa',
        data: regionesLactosa.map((r) => r.porcentaje),
        backgroundColor: coloresBarra,
        borderColor: coloresBarra,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const opcionesGrafico = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { x: number | null } }) => ` ${ctx.parsed.x ?? 0}% con deficiencia`,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: { callback: (val: number | string) => `${val}%` },
        grid: { color: 'rgba(0,0,0,0.07)' },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🥛</div>
        <h1>Lactasa: La Enzima que Digiere la Leche</h1>
        <p>Cómo funciona la lactasa, por qué el 65% de los adultos la pierde y qué ocurre sin ella</p>
      </header>

      <LegalNotice />

      {/* Bloque 1: Mecanismo paso a paso */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>¿Qué Hace la Lactasa?</h2>
        <p className={styles.sectionSubtitle}>La reacción de hidrólisis de la lactosa en tres pasos</p>

        <div className={styles.stepContainer}>
          <div className={styles.stepIndicadores}>
            {PASOS.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.stepIndicador} ${i === paso ? styles.stepIndicadorActivo : ''} ${i < paso ? styles.stepIndicadorCompletado : ''}`}
                onClick={() => setPaso(i)}
                aria-label={`Ir al paso ${i + 1}`}
                aria-pressed={i === paso}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className={styles.stepContenido}>
            <h3 className={styles.stepTitulo}>{PASOS[paso].titulo}</h3>
            <p className={styles.stepDescripcion}>{PASOS[paso].descripcion}</p>

            {/* Visualización SVG del paso */}
            <div className={styles.svgContainer} aria-hidden="true">
              {PASOS[paso].fase === 'entrada' && (
                <div className={styles.moleculaLactosa}>
                  <div className={styles.moleculaCirculo} style={{ background: '#6B7280' }}>
                    <span>G</span>
                  </div>
                  <div className={styles.moleculaEnlace}>—</div>
                  <div className={styles.moleculaCirculo} style={{ background: '#6B7280' }}>
                    <span>G</span>
                  </div>
                  <div className={styles.moleculaEtiqueta}>LACTOSA (disacárido)</div>
                </div>
              )}

              {PASOS[paso].fase === 'union' && (
                <div className={styles.moleculaUnion}>
                  <div className={styles.moleculaLactosa}>
                    <div className={styles.moleculaCirculo} style={{ background: '#6B7280' }}>
                      <span>G</span>
                    </div>
                    <div className={styles.moleculaEnlace}>—</div>
                    <div className={styles.moleculaCirculo} style={{ background: '#6B7280' }}>
                      <span>G</span>
                    </div>
                    <div className={styles.moleculaEtiqueta}>LACTOSA</div>
                  </div>
                  <div className={styles.flechaAbajo} aria-hidden="true">⬇</div>
                  <div className={styles.enzimaCaja}>
                    <span className={styles.enzimaIcono} aria-hidden="true">⚙️</span>
                    <span>LACTASA (anclada en enterocito)</span>
                  </div>
                </div>
              )}

              {PASOS[paso].fase === 'ruptura' && (
                <div className={styles.moleculaProductos}>
                  <div className={styles.moleculaProducto}>
                    <div className={styles.moleculaCirculo} style={{ background: '#2E86AB' }}>
                      <span>G</span>
                    </div>
                    <div className={styles.moleculaEtiqueta} style={{ color: '#2E86AB' }}>GLUCOSA</div>
                  </div>
                  <div className={styles.masSigno} aria-hidden="true">+</div>
                  <div className={styles.moleculaProducto}>
                    <div className={styles.moleculaCirculo} style={{ background: '#48A9A6' }}>
                      <span>G</span>
                    </div>
                    <div className={styles.moleculaEtiqueta} style={{ color: '#48A9A6' }}>GALACTOSA</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.stepControls}>
            <button
              type="button"
              className={styles.btnControl}
              onClick={() => setPaso((p) => Math.max(0, p - 1))}
              disabled={paso === 0}
              aria-label="Paso anterior"
            >
              ← Anterior
            </button>
            <span className={styles.stepCounter}>{paso + 1} / {PASOS.length}</span>
            <button
              type="button"
              className={styles.btnControl}
              onClick={() => setPaso((p) => Math.min(PASOS.length - 1, p + 1))}
              disabled={paso === PASOS.length - 1}
              aria-label="Paso siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* Bloque 2: Prevalencia mundial Chart.js */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Prevalencia Mundial de Intolerancia a la Lactosa</h2>
        <p className={styles.sectionSubtitle}>Porcentaje de adultos con deficiencia de lactasa por región</p>

        <div className={styles.chartWrapper}>
          <Bar data={datosGrafico} options={opcionesGrafico} />
        </div>

        <div className={styles.leyendaColores}>
          <div className={styles.leyendaItem}>
            <div className={styles.leyendaDot} style={{ background: '#48A9A6' }}></div>
            <span>Baja (&lt;30%) — Persistencia de lactasa común</span>
          </div>
          <div className={styles.leyendaItem}>
            <div className={styles.leyendaDot} style={{ background: '#F59E0B' }}></div>
            <span>Media (30–60%) — Presencia mixta</span>
          </div>
          <div className={styles.leyendaItem}>
            <div className={styles.leyendaDot} style={{ background: '#EF4444' }}></div>
            <span>Alta (&gt;60%) — Deficiencia predominante</span>
          </div>
        </div>

        <p className={styles.notaDatos}>
          Datos aproximados de prevalencia poblacional. La intolerancia varía mucho incluso dentro de cada región, dependiendo de la etnia, la historia de domesticación animal y la mezcla genética poblacional.
        </p>
      </section>

      {/* Bloque 3: Mecanismo de la intolerancia */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Qué Ocurre Sin Lactasa: El Mecanismo</h2>
        <p className={styles.sectionSubtitle}>Cuatro etapas fisiológicas desde la lactosa hasta los síntomas</p>

        <div className={styles.flujoIntolerancia}>
          {FLUJO_INTOLERANCIA.map((etapa, i) => (
            <div key={i} className={styles.flujoItem}>
              <div className={styles.tarjetaFlujo}>
                <div className={styles.flujoIcono} aria-hidden="true">{etapa.icono}</div>
                <h3 className={styles.flujoTitulo}>{etapa.titulo}</h3>
                <p className={styles.flujoDescripcion}>{etapa.descripcion}</p>
              </div>
              {i < FLUJO_INTOLERANCIA.length - 1 && (
                <div className={styles.flechaFlujo} aria-hidden="true">→</div>
              )}
            </div>
          ))}
        </div>

        <p className={styles.notaDatos}>
          Este es el mecanismo fisiológico general. Los síntomas y su intensidad varían enormemente entre personas: algunos toleran pequeñas cantidades de lactosa, otros son muy sensibles.
        </p>
      </section>

      {/* Bloque 4: Evolución de la persistencia de lactasa */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>La Evolución de la Persistencia de Lactasa</h2>
        <p className={styles.sectionSubtitle}>Una de las adaptaciones evolutivas humanas más recientes y mejor documentadas</p>

        <div className={styles.tarjetaEvolucion}>
          <p className={styles.evolucionIntro}>
            Hace ~10.000 años, <strong>todos los humanos adultos perdían la lactasa</strong> al terminar la infancia — exactamente igual que el resto de mamíferos. La pérdida de lactasa es el estado ancestral, no la excepción.
          </p>
          <p className={styles.evolucionIntro}>
            La mutación de <strong>"persistencia de lactasa"</strong> (en la región reguladora del gen LCT, no en el gen en sí) apareció de forma <strong>independiente en al menos 3 poblaciones</strong> que domesticaron animales lácteos. Esto es evolución convergente: la misma solución evolucionando por separado.
          </p>
          <p className={styles.evolucionIntro}>
            La <strong>ventaja selectiva</strong> era enorme: en culturas pastoras, poder digerir leche de adulto significaba una fuente calórica fiable durante épocas de escasez, reduciendo la mortalidad.
          </p>
        </div>

        <div className={styles.timelineEvolucion}>
          {TIMELINE.map((hito, i) => (
            <div key={i} className={`${styles.puntoTimeline} ${hito.destacado ? styles.puntoTimelineDestacado : ''}`}>
              <div className={styles.timelineAnio}>{hito.anio}</div>
              <div className={styles.timelineConector} aria-hidden="true">
                <div className={styles.timelineLinea}></div>
                <div className={styles.timelineDot}></div>
              </div>
              <div className={styles.timelineEvento}>{hito.evento}</div>
            </div>
          ))}
        </div>

        <div className={styles.tarjetaDato}>
          <span className={styles.datoCifra}>~35%</span>
          <span className={styles.datoTexto}>de la humanidad actual tiene persistencia de lactasa — la mayoría somos el "estado ancestral"</span>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="Profundiza en la lactasa"
        subtitle="Enzima, evolución y digestión de la lactosa"
      >
        <div className={styles.educSection}>
          <h3>¿Qué es un disacárido?</h3>
          <p>
            Un disacárido es un azúcar formado por dos monosacáridos unidos mediante un enlace glucosídico. La <strong>lactosa</strong> (glucosa + galactosa) es el disacárido de la leche. La <strong>sacarosa</strong> (azúcar de mesa: glucosa + fructosa) y la <strong>maltosa</strong> (glucosa + glucosa, de almidón digerido) son otros ejemplos cotidianos. Cada uno tiene su propia enzima: sacarasa para la sacarosa, maltasa para la maltosa, lactasa para la lactosa.
          </p>

          <h3>El gen LCT y la región reguladora MCM6</h3>
          <p>
            La lactasa está codificada por el gen <em>LCT</em> (Lactase-Phlorizin Hydrolase). Sin embargo, las mutaciones de persistencia de lactasa no están en el gen LCT sino en una región intrónica del gen adyacente <em>MCM6</em>, que actúa como <strong>enhancer regulador</strong> de LCT. La variante europea más común es la SNP rs4988235 (C/T-13910). Esta región regula si el gen LCT sigue activo en la vida adulta o se silencia gradualmente tras el destete.
          </p>

          <h3>Lactasa-florizina hidrolasa: el nombre completo</h3>
          <p>
            El nombre técnico completo de la enzima es <em>Lactase-Phlorizin Hydrolase (LPH)</em>. El "florizina" hace referencia a su segunda actividad enzimática: también hidroliza la florizina (un glucósido del manzano). LPH es una glicoproteína transmembrana de tipo I ubicada en el borde en cepillo del intestino delgado proximal, especialmente en el yeyuno.
          </p>

          <h3>Diferencia entre alergia a la leche e intolerancia a la lactosa</h3>
          <p>
            Son condiciones completamente distintas. La <strong>alergia a la proteína de leche de vaca (APLV)</strong> es una respuesta inmunológica (IgE mediada o no) a proteínas como la caseína o las seroproteínas — puede ser potencialmente grave. La <strong>intolerancia a la lactosa</strong> es un déficit enzimático sin componente inmunológico — causa malestar digestivo pero no es peligrosa. Confundirlas puede llevar a restricciones dietéticas innecesarias o, al contrario, a subestimar una alergia real.
          </p>

          <h3>Productos lácteos y contenido en lactosa</h3>
          <p>
            No todos los lácteos tienen la misma cantidad de lactosa. Leche fresca: ~4,7 g/100 ml. Yogur: ~3–4 g/100 g (las bacterias han fermentado parte). Quesos curados (manchego, parmesano): &lt;0,1 g/100 g (el proceso de maduración elimina casi toda la lactosa). Mantequilla: ~0,1 g/100 g. Los productos "sin lactosa" usan lactasa añadida para predigerir la lactosa antes de su consumo.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota educativa:</strong> Esta app explica el mecanismo bioquímico de la lactasa con fines educativos. La intolerancia a la lactosa tiene presentaciones muy diversas — consulta con tu médico si tienes dudas sobre tu digestión o antes de eliminar grupos alimentarios de tu dieta.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-lactasa" />
      <Footer appName="visualizador-lactasa" />
    </div>
  );
}
