'use client';
// @disclaimer: exempt
import React, { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorReinoFungi.module.css';

// ============================================================================
// TIPOS
// ============================================================================

interface DivisionFungi {
  id: string;
  nombre: string;
  nombreCientifico: string;
  emoji: string;
  colorHex: string;
  tipoEspora: string;
  reproduccion: string;
  especiesAprox: string;
  caracteristicas: string[];
  ejemplos: { comun: string; cientifico: string; uso: string }[];
  curiosidad: string;
  artificial?: boolean;
}

interface FilaComparativa {
  caracteristica: string;
  plantas: string;
  hongos: string;
}

interface PasosCiclo {
  paso: number;
  titulo: string;
  descripcion: string;
  emoji: string;
}

interface RolEcologico {
  id: string;
  titulo: string;
  emoji: string;
  colorHex: string;
  descripcion: string;
  ejemplos: string[];
}

// ============================================================================
// DATOS: 4 divisiones del reino Fungi
// ============================================================================

const DIVISIONES: DivisionFungi[] = [
  {
    id: 'ascomycota',
    nombre: 'Ascomicetos',
    nombreCientifico: 'Ascomycota',
    emoji: '🍄',
    colorHex: '#2E86AB',
    tipoEspora: 'Ascosporas (en sacos llamados ascos)',
    reproduccion: 'Sexual mediante ascos con 8 ascosporas; asexual por conidios',
    especiesAprox: '~75.000',
    caracteristicas: [
      'El filo más grande del reino Fungi',
      'Producen esporas en estructuras en forma de saco (ascos)',
      'Hifas tabicadas (septos con poros)',
      'Incluyen levaduras unicelulares y formas filamentosas',
      'Algunos forman líquenes (simbiontes con algas)',
    ],
    ejemplos: [
      { comun: 'Levadura del pan/cerveza', cientifico: 'Saccharomyces cerevisiae', uso: 'Fermentación de pan, cerveza y vino' },
      { comun: 'Trufa negra', cientifico: 'Tuber melanosporum', uso: 'Gastronomía de lujo' },
      { comun: 'Moho azul del queso', cientifico: 'Penicillium roqueforti', uso: 'Quesos Roquefort y Cabrales' },
      { comun: 'Moho verde', cientifico: 'Penicillium chrysogenum', uso: 'Fuente original de la penicilina' },
    ],
    curiosidad: 'Saccharomyces cerevisiae fue el primer organismo eucariota cuyo genoma se secuenció completamente (1996).',
  },
  {
    id: 'basidiomycota',
    nombre: 'Basidiomicetos',
    nombreCientifico: 'Basidiomycota',
    emoji: '🍄',
    colorHex: '#48A9A6',
    tipoEspora: 'Basidiosporas (en células llamadas basidios)',
    reproduccion: 'Sexual mediante basidios con 4 basidiosporas; asexual muy reducida',
    especiesAprox: '~30.000',
    caracteristicas: [
      'Incluyen la mayoría de las setas macroscópicas comestibles y tóxicas',
      'Basidio: célula especializada que produce exactamente 4 esporas',
      'Hifas tabicadas con fíbula (gancho característico)',
      'Micelio dikaryótico (n+n) dominante en su ciclo de vida',
      'Algunos son parásitos de plantas (royas, carbones)',
    ],
    ejemplos: [
      { comun: 'Champiñón', cientifico: 'Agaricus bisporus', uso: 'Alimento universal, cultivado industrialmente' },
      { comun: 'Seta de ostra', cientifico: 'Pleurotus ostreatus', uso: 'Gastronomía y biorremedación' },
      { comun: 'Amanita', cientifico: 'Amanita muscaria', uso: 'Tóxico (histórico cultural)' },
      { comun: 'Roya del trigo', cientifico: 'Puccinia graminis', uso: 'Parásito devastador de cereales' },
    ],
    curiosidad: 'El micelio de Armillaria ostoyae en Oregón (EEUU) cubre más de 9 km² y podría tener más de 8.000 años — es uno de los organismos más grandes y longevos conocidos.',
  },
  {
    id: 'zygomycota',
    nombre: 'Cigomicetos',
    nombreCientifico: 'Zygomycota',
    emoji: '🍄',
    colorHex: '#E07B39',
    tipoEspora: 'Cigosporas (por fusión de dos gametangios)',
    reproduccion: 'Sexual por cigosporas (resistentes); asexual por esporangiosporas',
    especiesAprox: '~1.000',
    caracteristicas: [
      'Hifas cenocíticas (sin septos o con pocos)',
      'El grupo más primitivo de los hongos terrestres',
      'Forman cigosporas de pared gruesa resistentes al ambiente',
      'Muchos son saprófitos de materia orgánica en descomposición',
      'Algunos son parásitos de insectos y artrópodos',
    ],
    ejemplos: [
      { comun: 'Moho del pan', cientifico: 'Rhizopus stolonifer', uso: 'Descomponedor; causa pérdidas en panadería' },
      { comun: 'Mucor', cientifico: 'Mucor mucedo', uso: 'Saprófito; algunas especies en maduración de quesos' },
      { comun: 'Rhizopus', cientifico: 'Rhizopus oryzae', uso: 'Fermentación de tempeh y sake' },
    ],
    curiosidad: 'Rhizopus oryzae se usa en Asia desde hace siglos para fermentar el tempeh de soja y el sake japonés, aunque los productores no sabían que era un hongo hasta el siglo XIX.',
  },
  {
    id: 'deuteromycota',
    nombre: 'Hongos imperfectos',
    nombreCientifico: 'Deuteromycota',
    emoji: '🍄',
    colorHex: '#8E8E93',
    tipoEspora: 'Solo reproducción asexual por conidios (no se conoce fase sexual)',
    reproduccion: 'Exclusivamente asexual por conidios; no se ha observado fase sexual',
    especiesAprox: '~25.000',
    caracteristicas: [
      'Grupo artificial (polifiético): no comparten un ancestro común exclusivo',
      'Se clasifican aquí cuando NO se conoce su reproducción sexual',
      'Muchos son en realidad ascomicetos cuya fase sexual no se ha descrito',
      'Incluyen patógenos importantes de animales y plantas',
      'Con la filogenia molecular, muchos se reasignan a otros filos',
    ],
    artificial: true,
    ejemplos: [
      { comun: 'Aspergillus negro', cientifico: 'Aspergillus niger', uso: 'Producción de ácido cítrico; deterioro de alimentos' },
      { comun: 'Candida', cientifico: 'Candida albicans', uso: 'Patógeno oportunista humano (candidiasis)' },
      { comun: 'Pie de atleta', cientifico: 'Tinea pedis (Trichophyton)', uso: 'Infección cutánea fúngica común' },
      { comun: 'Botrytis', cientifico: 'Botrytis cinerea', uso: 'Patógeno de uvas; también crea vinos de podredumbre noble' },
    ],
    curiosidad: 'Botrytis cinerea es simultáneamente el enemigo número uno de los viticultores y el responsable de los famosos vinos de podredumbre noble (Sauternes, Tokaji) cuando las condiciones son las adecuadas.',
  },
];

// ============================================================================
// DATOS: comparativa planta vs hongo
// ============================================================================

const COMPARATIVA: FilaComparativa[] = [
  { caracteristica: 'Nutrición', plantas: 'Autótrofos (fabrican su propio alimento mediante fotosíntesis)', hongos: 'Heterótrofos (absorben materia orgánica del exterior mediante enzimas)' },
  { caracteristica: 'Pared celular', plantas: 'Celulosa (polisacárido de glucosa)', hongos: 'Quitina (polisacárido de N-acetilglucosamina, igual que el exoesqueleto de insectos)' },
  { caracteristica: 'Fotosíntesis', plantas: 'Sí — cloroplastos con clorofila a y b', hongos: 'No — ningún hongo realiza fotosíntesis' },
  { caracteristica: 'Reserva energética', plantas: 'Almidón (amilosa + amilopectina)', hongos: 'Glucógeno (igual que los animales)' },
  { caracteristica: 'Modo de digestión', plantas: 'Interna (en cloroplastos y vacuolas)', hongos: 'Externa (secretan enzimas al sustrato y absorben los productos)' },
  { caracteristica: 'Reino', plantas: 'Plantae', hongos: 'Fungi (separado de Plantae desde 1969)' },
];

// ============================================================================
// DATOS: ciclo de vida del hongo
// ============================================================================

const CICLO_PASOS: PasosCiclo[] = [
  {
    paso: 1,
    titulo: 'Espora en el ambiente',
    descripcion: 'Las esporas (haploides, n) son liberadas por millones. Son resistentes a la desecación y pueden viajar por el aire kilómetros.',
    emoji: '💨',
  },
  {
    paso: 2,
    titulo: 'Germinación',
    descripcion: 'En condiciones favorables (humedad, temperatura, sustrato adecuado), la espora germina y emite hifas de crecimiento apical.',
    emoji: '🌱',
  },
  {
    paso: 3,
    titulo: 'Micelio primario (monocariótico)',
    descripcion: 'Red de hifas haploides (n). Crece en el sustrato, secretando enzimas que descomponen materia orgánica y absorben los nutrientes.',
    emoji: '🕸️',
  },
  {
    paso: 4,
    titulo: 'Fusión de micelios (plasmogamia)',
    descripcion: 'Dos micelios compatibles se fusionan. Sus citoplasmas se unen pero los núcleos NO — nace el micelio dikaryótico (n+n).',
    emoji: '🔗',
  },
  {
    paso: 5,
    titulo: 'Micelio secundario (dikaryótico)',
    descripcion: 'Estado dominante en basidiomicetos y muchos ascomicetos. Las hifas contienen dos núcleos por célula (n+n). Es la fase de mayor crecimiento.',
    emoji: '🕸️',
  },
  {
    paso: 6,
    titulo: 'Cuerpo fructífero',
    descripcion: 'Cuando las condiciones son óptimas, el micelio forma un cuerpo fructífero (seta, trufas, etc.). Es solo el "fruto" — el organismo real está en el suelo.',
    emoji: '🍄',
  },
  {
    paso: 7,
    titulo: 'Cariogamia y meiosis',
    descripcion: 'En las estructuras reproductivas, los dos núcleos se fusionan (cariogamia, 2n) y sufren meiosis inmediata produciendo esporas haploides (n) que se liberan.',
    emoji: '🔄',
  },
];

// ============================================================================
// DATOS: importancia ecológica
// ============================================================================

const ROLES_ECOLOGICOS: RolEcologico[] = [
  {
    id: 'descomponedores',
    titulo: 'Descomponedores',
    emoji: '♻️',
    colorHex: '#2E86AB',
    descripcion: 'Los hongos son los principales descomponedores de lignina y celulosa — materiales que las bacterias no pueden degradar eficientemente. Sin ellos, el ciclo del carbono se detendría.',
    ejemplos: ['Trametes versicolor (yesca): descompone madera muerta en bosques', 'Pleurotus ostreatus: biorremedación de suelos contaminados con hidrocarburos', 'Rhizopus: descompone materia orgánica en suelos agrícolas'],
  },
  {
    id: 'micorrizas',
    titulo: 'Micorrizas',
    emoji: '🌳',
    colorHex: '#48A9A6',
    descripcion: 'El 90% de las plantas terrestres forma asociaciones simbióticas con hongos (micorrizas). El hongo amplía hasta 100 veces la superficie de absorción de la raíz; la planta aporta azúcares.',
    ejemplos: ['Boletus: micorrizas con pinos y abetos — muy valorado gastronómicamente', 'Trufas (Tuber): micorrizas con robles y avellanos', 'Glomus: micorrizas arbusculares en el 80% de plantas agrícolas'],
  },
  {
    id: 'antibioticos',
    titulo: 'Antibióticos',
    emoji: '💊',
    colorHex: '#E07B39',
    descripcion: 'Fleming descubrió la penicilina en 1928 observando que Penicillium chrysogenum inhibía el crecimiento bacteriano. Desde entonces, los hongos han sido fuente de muchos antibióticos y fármacos.',
    ejemplos: ['Penicillium chrysogenum → penicilina (1928, Fleming)', 'Cephalosporium acremonium → cefalosporinas', 'Tolypocladium inflatum → ciclosporina (inmunosupresor para trasplantes)'],
  },
  {
    id: 'fermentacion',
    titulo: 'Fermentación',
    emoji: '🍞',
    colorHex: '#8E8E93',
    descripcion: 'Las levaduras (principalmente ascomicetos) llevan miles de años transformando azúcares en alcohol y CO₂. Esta biotecnología ancestral produce alimentos y bebidas consumidos a diario.',
    ejemplos: ['Pan: Saccharomyces cerevisiae produce CO₂ que esponja la masa', 'Cerveza y vino: fermentación alcohólica de azúcares de malta y uva', 'Queso: Penicillium roqueforti (Roquefort), P. camemberti (Camembert)'],
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function VisualizadorReinoFungi() {
  const [tabActivo, setTabActivo] = useState(0);
  const [divisionActiva, setDivisionActiva] = useState<string>('ascomycota');

  const tabs = ['Clasificación', '¿Por qué no son plantas?', 'Ciclo de Vida', 'Importancia Ecológica'];

  const divisionSeleccionada = DIVISIONES.find(d => d.id === divisionActiva) ?? DIVISIONES[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcono} aria-hidden="true">🍄</span>
          <h1 className={styles.heroTitulo}>El Reino Fungi</h1>
          <p className={styles.heroSubtitulo}>
            Clasificación y Biología de los Hongos
          </p>
          <p className={styles.heroDesc}>
            4 divisiones principales · Diferencias con las plantas · Ciclo de vida · Rol ecológico
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* Tabs de navegación */}
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador de hongos">
          {tabs.map((tab, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={tabActivo === i}
              className={`${styles.tabBtn} ${tabActivo === i ? styles.tabBtnActive : ''}`}
              onClick={() => setTabActivo(i)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* ------------------------------------------------------------------ */}
        {/* Tab 1: Clasificación */}
        {/* ------------------------------------------------------------------ */}
        {tabActivo === 0 && (
          <section className={styles.tabContent} aria-label="Clasificación del reino Fungi">
            <div className={styles.divisionGrid}>
              {DIVISIONES.map(div => (
                <button
                  key={div.id}
                  type="button"
                  className={`${styles.divisionCard} ${divisionActiva === div.id ? styles.divisionCardActive : ''}`}
                  style={{ borderTopColor: div.colorHex }}
                  onClick={() => setDivisionActiva(div.id)}
                  aria-pressed={divisionActiva === div.id}
                >
                  <span className={styles.divisionIcon} aria-hidden="true">{div.emoji}</span>
                  <span className={styles.divisionNombre}>{div.nombre}</span>
                  <span className={styles.divisionCientifico}><em>{div.nombreCientifico}</em></span>
                  <span className={styles.divisionEspecies}>{div.especiesAprox} sp.</span>
                  {div.artificial && (
                    <span className={styles.badgeArtificial}>Grupo artificial</span>
                  )}
                </button>
              ))}
            </div>

            {/* Panel de detalle de la división seleccionada */}
            <div className={styles.divisionDetalle} style={{ borderLeftColor: divisionSeleccionada.colorHex }}>
              <div className={styles.divisionDetalleHeader}>
                <span aria-hidden="true" style={{ fontSize: '2rem' }}>{divisionSeleccionada.emoji}</span>
                <div>
                  <h2 className={styles.divisionDetalleNombre}>{divisionSeleccionada.nombre}</h2>
                  <p className={styles.divisionDetalleCientifico}><em>{divisionSeleccionada.nombreCientifico}</em></p>
                </div>
              </div>

              <div className={styles.divisionDetalleGrid}>
                <div className={styles.divisionDetalleBloque}>
                  <h3 className={styles.detalleSectionTitle}>Tipo de espora</h3>
                  <p className={styles.detalleParrafo}>{divisionSeleccionada.tipoEspora}</p>

                  <h3 className={styles.detalleSectionTitle}>Reproducción</h3>
                  <p className={styles.detalleParrafo}>{divisionSeleccionada.reproduccion}</p>

                  <h3 className={styles.detalleSectionTitle}>Características</h3>
                  <ul className={styles.detalleList}>
                    {divisionSeleccionada.caracteristicas.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.divisionDetalleBloque}>
                  <h3 className={styles.detalleSectionTitle}>Ejemplos cotidianos</h3>
                  <div className={styles.ejemplosGrid}>
                    {divisionSeleccionada.ejemplos.map((e, i) => (
                      <div key={i} className={styles.ejemploCard}>
                        <span className={styles.ejemploComun}>{e.comun}</span>
                        <span className={styles.ejemploCientifico}><em>{e.cientifico}</em></span>
                        <span className={styles.ejemploUso}>{e.uso}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.curiosidadBox} style={{ borderLeftColor: divisionSeleccionada.colorHex }}>
                <strong>Dato curioso:</strong> {divisionSeleccionada.curiosidad}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Tab 2: ¿Por qué no son plantas? */}
        {/* ------------------------------------------------------------------ */}
        {tabActivo === 1 && (
          <section className={styles.tabContent} aria-label="Diferencias entre hongos y plantas">
            <div className={styles.comparativaWrapper}>
              <p className={styles.comparativaIntro}>
                Hasta 1969, los hongos se clasificaban dentro del reino vegetal. Hoy sabemos que son más
                cercanos evolutivamente a los animales que a las plantas. Estas son las diferencias clave:
              </p>

              <div className={styles.tableWrapper}>
                <table className={styles.comparativaTable}>
                  <caption className={styles.tableCaption}>
                    Comparativa reino Plantae vs reino Fungi
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Característica</th>
                      <th scope="col" className={styles.thPlantas}><span aria-hidden="true">🌿</span> Plantas</th>
                      <th scope="col" className={styles.thHongos}><span aria-hidden="true">🍄</span> Hongos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARATIVA.map((fila, i) => (
                      <tr key={i} className={styles.tableRow}>
                        <td className={styles.tdCaracteristica}><strong>{fila.caracteristica}</strong></td>
                        <td className={styles.tdPlantas}>{fila.plantas}</td>
                        <td className={styles.tdHongos}>{fila.hongos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.warningBox}>
                <strong>Dato filogenético:</strong> El análisis de ARN ribosomal demostró en la década de 1990
                que los hongos comparten con los animales un ancestro más reciente que con las plantas.
                Ambos almacenan glucógeno y tienen quitina como material estructural — no es coincidencia.
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Tab 3: Ciclo de Vida */}
        {/* ------------------------------------------------------------------ */}
        {tabActivo === 2 && (
          <section className={styles.tabContent} aria-label="Ciclo de vida del hongo">
            <p className={styles.cicloIntro}>
              El ciclo de vida de los hongos tiene una característica única: la <strong>plasmogamia</strong> (fusión
              de citoplasmas) y la <strong>cariogamia</strong> (fusión de núcleos) están separadas en el tiempo.
              Entre medias existe una fase dikaryótica (n+n) que puede durar años.
            </p>
            <div className={styles.cicloGrid}>
              {CICLO_PASOS.map((paso, idx) => (
                <div key={paso.paso} className={styles.cicloStep}>
                  <div className={styles.cicloStepHeader}>
                    <span className={styles.cicloStepNum} aria-hidden="true">{paso.paso}</span>
                    <span className={styles.cicloStepEmoji} aria-hidden="true">{paso.emoji}</span>
                    <h3 className={styles.cicloStepTitulo}>{paso.titulo}</h3>
                  </div>
                  <p className={styles.cicloStepDesc}>{paso.descripcion}</p>
                  {idx < CICLO_PASOS.length - 1 && (
                    <div className={styles.cicloFlecha} aria-hidden="true">↓</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Tab 4: Importancia Ecológica */}
        {/* ------------------------------------------------------------------ */}
        {tabActivo === 3 && (
          <section className={styles.tabContent} aria-label="Importancia ecológica de los hongos">
            <p className={styles.ecologiaIntro}>
              Los hongos son fundamentales para la vida en la Tierra. Sin ellos, los bosques morirían,
              el ciclo del carbono se detendría y no tendríamos pan, cerveza, queso ni penicilina.
            </p>
            <div className={styles.ecologiaGrid}>
              {ROLES_ECOLOGICOS.map(rol => (
                <div key={rol.id} className={styles.ecologiaCard} style={{ borderTopColor: rol.colorHex }}>
                  <div className={styles.ecologiaCardHeader}>
                    <span className={styles.ecologiaEmoji} aria-hidden="true">{rol.emoji}</span>
                    <h3 className={styles.ecologiaTitulo}>{rol.titulo}</h3>
                  </div>
                  <p className={styles.ecologiaDesc}>{rol.descripcion}</p>
                  <ul className={styles.ecologiaEjemplos}>
                    {rol.ejemplos.map((ej, i) => (
                      <li key={i}>{ej}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección educativa */}
        <EducationalSection
          title="Guía del Reino Fungi"
          subtitle="Todo lo que necesitas saber sobre los hongos"
          icon="🍄"
        >
          {/* 1. Tabla Comparativa de las 4 Divisiones */}
          <section className={styles.guideSection}>
            <h2>Comparativa de las 4 Divisiones</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>División</th>
                    <th>Tipo de espora</th>
                    <th>~Especies</th>
                    <th>Ejemplos</th>
                    <th>Importancia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ascomycota</td>
                    <td>Ascosporas (sacos)</td>
                    <td>75.000</td>
                    <td>Levaduras, trufas, Penicillium</td>
                    <td>✅ Antibióticos, fermentación</td>
                  </tr>
                  <tr>
                    <td>Basidiomycota</td>
                    <td>Basidiosporas (pedúnculos)</td>
                    <td>30.000</td>
                    <td>Setas, champiñones, roya</td>
                    <td>✅ Alimentación, ectomicorrizas</td>
                  </tr>
                  <tr>
                    <td>Zygomycota</td>
                    <td>Zigosporas (fusión)</td>
                    <td>1.000</td>
                    <td>Rhizopus (moho pan), Mucor</td>
                    <td>⚠️ Patógenos en fruta</td>
                  </tr>
                  <tr>
                    <td>Deuteromycota</td>
                    <td>Sin fase sexual conocida</td>
                    <td>~17.000</td>
                    <td>Aspergillus, Candida, Tinea</td>
                    <td>⚠️ Patógenos humanos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de Uso */}
          <section className={styles.guideSection}>
            <h2>Hongos en tu Vida Cotidiana</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍞</span>
                  <h3>Panadería y Fermentación</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <em>Saccharomyces cerevisiae</em> fermenta azúcares → CO₂ + etanol
                </div>
                <p className={styles.escenarioTip}>Sin levadura, el pan no sube. Esta levadura se usa desde hace más de 5.000 años en Egipto.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💊</span>
                  <h3>Medicina</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <em>Penicillium notatum</em> → penicilina (1928, Alexander Fleming)
                </div>
                <p className={styles.escenarioTip}>Los hongos han salvado millones de vidas. También producen ciclosporina (inmunosupresor para trasplantes).</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🌱</span>
                  <h3>Agricultura y Forestal</h3>
                </div>
                <div className={styles.escenarioExample}>
                  Micorrizas arbusculares con el 90% de plantas terrestres
                </div>
                <p className={styles.escenarioTip}>Sin hongos micorrícicos, el fósforo no llega eficientemente a la raíz. Son clave en la productividad agrícola.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🫀</span>
                  <h3>Infecciones Fúngicas</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <em>Candida, Aspergillus</em> y <em>Tinea</em> afectan a millones anualmente
                </div>
                <p className={styles.escenarioTip}>Los antifúngicos son escasos porque el hongo es eucariota como nosotros — difícil atacarlo sin dañar al huésped.</p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Los hongos son más parecidos a plantas o a animales?</h4>
                <p>Más a animales. Comparten glucógeno como reserva energética y quitina como material estructural (el mismo que el exoesqueleto de insectos). Divergieron de los animales hace aproximadamente 900 millones de años.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Dato:</strong> Esta es la razón por la que los antifúngicos son más difíciles de desarrollar que los antibióticos.</p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Todas las setas son comestibles?</h4>
                <p>No. La <em>Amanita phalloides</em> ("oronja verde") puede matar con tan solo 30g de ingesta. Provoca fallo hepático y no tiene antídoto eficaz. Nunca consumas setas sin identificación experta al 100%.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Regla de seguridad:</strong> Sombrero verde-amarillento + láminas blancas + anillo + volva en la base = sospecha inmediata de Amanita.</p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Por qué el moho del pan es peligroso aunque solo cubra una parte?</h4>
                <p>Algunos mohos como <em>Aspergillus flavus</em> producen aflatoxinas, micotoxinas que son carcinógenos clasificados en el Grupo 1 por la IARC. Estas toxinas se difunden por todo el alimento y no son visibles. Retirar solo la parte visible no es suficiente.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Consejo:</strong> Desecha el alimento completo si tiene moho visible, especialmente pan, frutos secos y maíz.</p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Qué es un hongo simbiótico?</h4>
                <p>Las micorrizas son una simbiosis mutualista entre hongos y raíces vegetales. El hongo obtiene azúcares (carbono) de la planta; la planta obtiene fósforo, nitrógeno y agua del hongo. La red micelial puede extenderse metros más allá de las raíces.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Ejemplo:</strong> El famoso "Wood Wide Web" de los bosques es en gran parte una red de micorrizas que conecta árboles entre sí.</p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Son los líquenes hongos?</h4>
                <p>Los líquenes son organismos compuestos: un hongo (mayoritariamente ascomiceto) asociado con un alga verde o una cianobacteria. El hongo aporta la estructura y protección; el alga aporta la fotosíntesis. El "organismo" visible es principalmente el hongo.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Dato:</strong> Los líquenes pueden colonizar rocas desnudas y son pioneros en la sucesión ecológica de los ecosistemas.</p>
              </div>
            </div>
          </section>

          {/* 4. Guía Paso a Paso */}
          <section className={styles.guideSection}>
            <h2>Cómo Explorar el Reino Fungi con Seguridad</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Observa el hábitat</h4>
                  <p>¿Dónde crece el hongo? Madera muerta, suelo del bosque, raíces de árboles específicos, otro organismo vivo... El hábitat ya limita drásticamente las especies posibles.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Analiza el cuerpo fructífero completo</h4>
                  <p>Examina el sombrero (forma, color, superficie), el pie (sólido, hueco, fibras), las láminas o poros de la cara inferior, el anillo (restos del velo parcial) y la volva en la base (restos del velo universal).</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Haz una esporada</h4>
                  <p>Coloca el sombrero (sin pie) boca abajo sobre papel blanco y negro durante 1-2 horas. El color de las esporas depositadas es uno de los datos más fiables para la identificación.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Huele y toca con precaución</h4>
                  <p>El olor puede ser harinoso, anisado, afrutado, terroso o desagradable. Observa si el pie exuda látex (blanco o coloreado) al cortarlo. No te toques los ojos ni la boca mientras manipulas setas desconocidas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Consulta a un experto antes de consumir</h4>
                  <p>Usa guías micológicas de tu región y contrasta con varias fuentes. Las sociedades micológicas locales suelen organizar jornadas de identificación. Nunca consumas una seta que no puedas identificar al 100%.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Mejores Prácticas */}
          <section className={styles.guideSection}>
            <h2>Mejores Prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🍄</span>
                <h4>Nunca consumas sin identificar al 100%</h4>
                <p>La <em>Amanita phalloides</em> no tiene antídoto eficaz. La incertidumbre en la identificación de setas no es aceptable si se van a consumir.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧪</span>
                <h4>Láminas blancas + anillo + volva = alta alerta</h4>
                <p>Este patrón morfológico es característico del género <em>Amanita</em>, que incluye algunas de las setas más tóxicas conocidas.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌱</span>
                <h4>Favorece los hongos beneficiosos en el jardín</h4>
                <p>Evita fungicidas innecesarios. Las micorrizas que rodean las raíces de tus plantas son aliadas fundamentales para su nutrición y resistencia a la sequía.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💊</span>
                <h4>Usa antifúngicos solo con prescripción</h4>
                <p>Los antifúngicos son escasos y las resistencias crecen. Usar <em>Candida</em> o <em>Tinea</em> sin diagnóstico confirmado puede generar cepas resistentes de difícil tratamiento.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning Box v2.0 */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Comunes sobre los Hongos</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong><span aria-hidden="true">❌</span> &quot;Si no se parece a las fotos del veneno, es seguro comer&quot;:</strong> Los hongos tóxicos varían enormemente de aspecto según la edad, la humedad y el sustrato. Solo la identificación experta al 100% es segura.</li>
              <li><strong><span aria-hidden="true">❌</span> &quot;Retirar la parte con moho es suficiente&quot;:</strong> Las micotoxinas (como las aflatoxinas) se difunden microscópicamente por todo el alimento. Desecha el alimento completo.</li>
              <li><strong><span aria-hidden="true">❌</span> &quot;Los hongos son plantas lentas&quot;:</strong> No son plantas. Son más cercanos evolutivamente a los animales que a las plantas, con metabolismo, reservas y pared celular completamente distintos.</li>
              <li><strong><span aria-hidden="true">❌</span> &quot;Todos los mohos son iguales&quot;:</strong> Hay miles de especies de mohos. Algunos producen antibióticos vitales (<em>Penicillium</em>), otros producen carcinógenos potentes (<em>Aspergillus flavus</em>).</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-reino-fungi')} />
        <ShareCard appName="visualizador-reino-fungi" />
      </main>

      <Footer appName="visualizador-reino-fungi" />
    </div>
  );
}
