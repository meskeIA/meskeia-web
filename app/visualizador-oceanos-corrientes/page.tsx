'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorOceanosCorreintes.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'conveyor' | 'golfo' | 'acidificacion' | 'zonas';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'conveyor', titulo: 'Conveyor Belt', icono: '🌊', subtitulo: 'Circulación termohalina global' },
  { id: 'golfo', titulo: 'Corriente del Golfo', icono: '🌡️', subtitulo: 'AMOC y Europa' },
  { id: 'acidificacion', titulo: 'Acidificación', icono: '🧪', subtitulo: 'pH oceánico 1750–2100' },
  { id: 'zonas', titulo: 'Zonas Muertas', icono: '💀', subtitulo: 'Hipoxia marina global' },
];

interface ZonaHipoxica {
  id: string;
  nombre: string;
  cx: number;
  cy: number;
  extension: string;
  causa: string;
  evolucion: string;
}

const ZONAS_HIPOXICAS: ZonaHipoxica[] = [
  {
    id: 'golfo-mexico',
    nombre: 'Zona muerta del Golfo de México',
    cx: 205,
    cy: 148,
    extension: '~14.000 km² (promedio anual, máximo 22.000 km²)',
    causa: 'Nitratos y fosfatos del Mississippi (agricultura del Corn Belt)',
    evolucion: 'Aparece cada verano desde los años 70; se ha duplicado desde 1985',
  },
  {
    id: 'baltico',
    nombre: 'Mar Báltico',
    cx: 478,
    cy: 72,
    extension: '~70.000 km² (la mayor zona hipóxica permanente del mundo)',
    causa: 'Agricultura intensiva de los países bálticos, aguas semicerradas',
    evolucion: 'Crónica desde el siglo XX; ha empeorado con el calentamiento',
  },
  {
    id: 'mar-negro',
    nombre: 'Mar Negro',
    cx: 510,
    cy: 105,
    extension: '~166.000 km² (zona anóxica profunda natural)',
    causa: 'Cuenca cerrada con estratificación: las aguas profundas no reciben O₂',
    evolucion: 'Zona anóxica natural, agravada por eutrofización desde los 60',
  },
  {
    id: 'chesapeake',
    nombre: 'Estuario de Chesapeake (EE. UU.)',
    cx: 220,
    cy: 120,
    extension: '~8.500 km²',
    causa: 'Escorrentía agrícola y aguas residuales urbanas',
    evolucion: 'Hipoxia estacional grave desde los años 50; mejora lenta tras regulación',
  },
  {
    id: 'golfo-oman',
    nombre: 'Golfo de Omán / Mar Arábigo',
    cx: 570,
    cy: 152,
    extension: '~165.000 km² (en expansión)',
    causa: 'Afloramientos naturales + calentamiento que reduce mezcla oceánica',
    evolucion: 'Se ha expandido 5 veces desde los años 90 según estudios recientes',
  },
];

interface EspecieMarina {
  id: string;
  nombre: string;
  icono: string;
  phOk: string;
  phEstrés: string;
  phCritico: string;
  descripcion: string;
}

const ESPECIES_MARINAS: EspecieMarina[] = [
  {
    id: 'corales',
    nombre: 'Corales',
    icono: '🪸',
    phOk: 'pH > 8,1: esqueletos de aragonito sanos',
    phEstrés: 'pH 8,0–8,1: blanqueamiento bajo estrés térmico + químico',
    phCritico: 'pH < 8,0: disolución activa del esqueleto calcáreo',
    descripcion: 'Los arrecifes de coral albergan el 25% de todas las especies marinas. Son extremadamente sensibles a la acidificación porque sus esqueletos de CaCO₃ se disuelven a pH bajo.',
  },
  {
    id: 'moluscos',
    nombre: 'Moluscos',
    icono: '🦪',
    phOk: 'pH > 8,1: concha normal, calcificación eficiente',
    phEstrés: 'pH 8,0–8,1: conchas más delgadas, mayor mortalidad larvaria',
    phCritico: 'pH < 8,0: conchas se disuelven activamente',
    descripcion: 'Ostras, mejillones y almejas son los primeros en sufrir la acidificación. Las larvas son 10 veces más sensibles que los adultos. Industria acuícola valorada en miles de millones de euros.',
  },
  {
    id: 'pteropodos',
    nombre: 'Pterópodos',
    icono: '🐚',
    phOk: 'pH > 8,1: concha de aragonito intacta',
    phEstrés: 'pH 8,0–8,1: erosión visible en la concha en 48h',
    phCritico: 'pH < 8,0: disolución completa de la concha en días',
    descripcion: 'Los caracoles de mar (pterópodos) son clave en la cadena trófica oceánica. Son la base alimentaria de bacalaos, ballenas y muchas aves marinas. Su colapso afectaría a toda la red trófica.',
  },
];

// ─────────────────────────────────────────────
// Datos de temperatura según debilitamiento AMOC
// ─────────────────────────────────────────────

interface CiudadTemp {
  ciudad: string;
  latitud: string;
  pais: string;
  tempNormal: number;
  tempSinAmoc: number;
}

const CIUDADES_TEMP: CiudadTemp[] = [
  { ciudad: 'Londres', latitud: '51°N', pais: '🇬🇧', tempNormal: 12, tempSinAmoc: 5 },
  { ciudad: 'París', latitud: '49°N', pais: '🇫🇷', tempNormal: 12, tempSinAmoc: 4 },
  { ciudad: 'Berlín', latitud: '52°N', pais: '🇩🇪', tempNormal: 10, tempSinAmoc: 1 },
  { ciudad: 'Bergen (Noruega)', latitud: '60°N', pais: '🇳🇴', tempNormal: 8, tempSinAmoc: -3 },
];

// ─────────────────────────────────────────────
// Cálculo de pH según año
// ─────────────────────────────────────────────

function calcularPH(anio: number): number {
  if (anio <= 1750) return 8.25;
  if (anio <= 2025) {
    // Lineal de 8.25 (1750) a 8.08 (2025)
    const t = (anio - 1750) / (2025 - 1750);
    return 8.25 - t * (8.25 - 8.08);
  }
  // Proyección RCP 8.5: de 8.08 (2025) a 7.85 (2100)
  const t = (anio - 2025) / (2100 - 2025);
  return 8.08 - t * (8.08 - 7.85);
}

function estadoPHCorales(ph: number): string {
  if (ph > 8.1) return 'ok';
  if (ph >= 8.0) return 'estres';
  return 'critico';
}

function etiquetaEstadoPH(ph: number): string {
  if (ph > 8.1) return 'Condiciones saludables';
  if (ph >= 8.0) return 'Estrés moderado';
  return 'Condiciones críticas';
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorOceanosCorreintes() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('conveyor');

  // Sección 1: Conveyor Belt
  const [conveyorDebilitado, setConveyorDebilitado] = useState(false);

  // Sección 2: Corriente del Golfo
  const [sinCorriente, setSinCorriente] = useState(false);
  const [debilitamientoAmoc, setDebilitamientoAmoc] = useState(30);

  // Sección 3: Acidificación
  const [anioSel, setAnioSel] = useState(2025);
  const [especieSel, setEspecieSel] = useState<string | null>(null);

  // Sección 4: Zonas muertas
  const [zonaSelId, setZonaSelId] = useState<string | null>(null);
  const [nivelNitratos, setNivelNitratos] = useState(50);

  const ph = calcularPH(anioSel);
  const estadoPH = estadoPHCorales(ph);
  const zonaSel = ZONAS_HIPOXICAS.find(z => z.id === zonaSelId);
  const especieDetalle = ESPECIES_MARINAS.find(e => e.id === especieSel);

  const impactoTempAmoc = useCallback((tempNormal: number, tempSinAmoc: number): number => {
    return tempNormal - (debilitamientoAmoc / 100) * (tempNormal - tempSinAmoc);
  }, [debilitamientoAmoc]);

  // Posición del indicador de pH en la barra (7,6 a 8,4 → 0% a 100%)
  const phMin = 7.6;
  const phMax = 8.4;
  const phPct = Math.max(0, Math.min(100, ((ph - phMin) / (phMax - phMin)) * 100));
  // La barra va de ácido (izq) a básico (der), invertida
  const phPctBarraLeft = (100 - phPct);

  const sliderAnioStyle = {
    '--slider-pct': `${((anioSel - 1750) / (2100 - 1750)) * 100}%`,
  } as React.CSSProperties;

  const sliderAmocStyle = {
    '--slider-pct': `${debilitamientoAmoc}%`,
  } as React.CSSProperties;

  const sliderNitratosStyle = {
    '--slider-pct': `${nivelNitratos}%`,
  } as React.CSSProperties;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Visualizador Oceánico</span>
          <h1 className={styles.heroTitle}>Océanos y Corrientes Marinas</h1>
          <p className={styles.heroSubtitle}>
            AMOC, corriente del Golfo, acidificación y zonas muertas — los océanos en crisis
          </p>
          <p className={styles.heroDesc}>
            Los océanos absorben el 30% del CO₂ humano y el 90% del calor extra del sistema climático.
            Explora cómo esto los está transformando.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>30%</span>
              <span className={styles.heroStatLabel}>del CO₂ absorbido</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>~700</span>
              <span className={styles.heroStatLabel}>zonas muertas actuales</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>0,17</span>
              <span className={styles.heroStatLabel}>unidades pH perdidas</span>
            </div>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador oceánico">
        {SECCIONES.map(sec => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setSeccionActiva(sec.id)}
            className={`${styles.navBtn} ${seccionActiva === sec.id ? styles.navBtnActivo : ''}`}
            aria-pressed={seccionActiva === sec.id}
          >
            <span className={styles.navBtnIcono} aria-hidden="true">{sec.icono}</span>
            <span className={styles.navBtnTitulo}>{sec.titulo}</span>
            <span className={styles.navBtnSub}>{sec.subtitulo}</span>
          </button>
        ))}
      </nav>

      <main className={styles.main}>

        {/* ── SECCIÓN 1: CONVEYOR BELT OCEÁNICO ── */}
        {seccionActiva === 'conveyor' && (
          <section className={styles.section} aria-label="Circulación termohalina global">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon} aria-hidden="true">🌊</span>
              <h2 className={styles.sectionTitle}>El Conveyor Belt Oceánico (Circulación Termohalina)</h2>
              <p className={styles.sectionSubtitle}>
                Una cinta transportadora de agua que recorre todos los océanos, movida por diferencias de temperatura y salinidad.
                El agua tarda aproximadamente 1.000 años en completar el circuito completo.
              </p>
            </div>

            {/* Toggle estado AMOC */}
            <div className={styles.toggleGroup}>
              <span className={styles.toggleLabel}>Estado de la circulación:</span>
              <div className={styles.toggleBtns}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${!conveyorDebilitado ? styles.toggleBtnActivo : ''}`}
                  onClick={() => setConveyorDebilitado(false)}
                  aria-pressed={!conveyorDebilitado}
                >
                  Normal
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${conveyorDebilitado ? styles.toggleBtnActivo : ''}`}
                  onClick={() => setConveyorDebilitado(true)}
                  aria-pressed={conveyorDebilitado}
                >
                  Debilitada (AMOC)
                </button>
              </div>
            </div>

            {/* Mapa SVG — Conveyor Belt global */}
            <div className={styles.mapaContenedor}>
              <svg
                className={styles.mapaSvg}
                viewBox="0 0 720 360"
                aria-label="Mapa de la circulación termohalina global"
                role="img"
              >
                {/* Fondo oceánico */}
                <rect width="720" height="360" fill="#c8e4f0" rx="8" />

                {/* Continentes simplificados */}
                {/* América del Norte */}
                <polygon points="140,50 200,45 230,60 240,90 220,130 190,155 160,150 130,120 120,85" fill="#a8c880" />
                {/* América del Sur */}
                <polygon points="175,165 215,165 230,200 225,260 200,300 175,295 160,260 155,210" fill="#a8c880" />
                {/* Europa */}
                <polygon points="400,45 445,42 460,60 450,85 430,95 415,88 405,70" fill="#a8c880" />
                {/* África */}
                <polygon points="415,100 455,95 470,120 465,175 450,230 430,255 410,250 395,215 392,170 400,130" fill="#a8c880" />
                {/* Asia */}
                <polygon points="465,42 580,38 620,55 630,80 610,110 570,120 530,105 490,95 460,75" fill="#a8c880" />
                {/* Oceanía */}
                <polygon points="575,205 625,200 640,225 635,255 615,265 585,255 570,235" fill="#a8c880" />
                {/* Antártida */}
                <rect x="60" y="330" width="600" height="25" rx="4" fill="#e8f4ff" />

                {/* Corrientes superficiales cálidas (rojas) */}
                {/* Atlántico Norte hacia Europa (Corriente del Golfo/AMOC) */}
                <path
                  d="M185,148 Q250,110 350,100 Q390,96 420,80"
                  className={`${styles.corrienteCálida} ${conveyorDebilitado ? styles.corrienteDebilitada : ''}`}
                  strokeLinecap="round"
                />
                {/* Atlántico Sur (superficial cálida) */}
                <path
                  d="M180,270 Q240,250 300,230 Q350,215 380,200 Q410,190 415,155"
                  className={`${styles.corrienteCálida} ${conveyorDebilitado ? styles.corrienteDebilitada : ''}`}
                  strokeLinecap="round"
                />
                {/* Índico hacia Pacífico */}
                <path
                  d="M480,230 Q530,210 575,200 Q620,195 650,180 Q670,165 660,140"
                  className={`${styles.corrienteCálida} ${conveyorDebilitado ? styles.corrienteDebilitada : ''}`}
                  strokeLinecap="round"
                />
                {/* Pacífico Norte */}
                <path
                  d="M650,130 Q680,100 690,70 Q695,50 670,45 Q600,40 560,50"
                  className={`${styles.corrienteCálida} ${conveyorDebilitado ? styles.corrienteDebilitada : ''}`}
                  strokeLinecap="round"
                />

                {/* Corrientes profundas frías (azules) */}
                {/* Atlántico Norte → Sur (profunda) */}
                <path
                  d="M420,90 Q410,150 405,200 Q400,240 395,290 Q390,310 360,320"
                  className={`${styles.corrienteFría} ${conveyorDebilitado ? styles.corrienteDebilitada : ''}`}
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                {/* Sur → Índico (profunda) */}
                <path
                  d="M360,320 Q430,318 500,315 Q550,312 580,310"
                  className={`${styles.corrienteFría} ${conveyorDebilitado ? styles.corrienteDebilitada : ''}`}
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                {/* Índico → Pacífico (profunda) */}
                <path
                  d="M580,310 Q620,305 650,290 Q670,270 665,240"
                  className={`${styles.corrienteFría} ${conveyorDebilitado ? styles.corrienteDebilitada : ''}`}
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  opacity="0.75"
                />

                {/* Puntos de hundimiento */}
                <circle cx="425" cy="78" r="7" fill="#2E86AB" opacity="0.85" />
                <text x="432" y="74" fontSize="9" fill="#1a4a6a" fontWeight="600">Hundimiento</text>
                <text x="432" y="84" fontSize="8" fill="#1a4a6a">Atlántico Norte</text>

                <circle cx="360" cy="322" r="7" fill="#2E86AB" opacity="0.85" />
                <text x="368" y="318" fontSize="9" fill="#1a4a6a" fontWeight="600">Hundimiento</text>
                <text x="368" y="328" fontSize="8" fill="#1a4a6a">Antártida</text>

                {/* Etiqueta tiempo */}
                <rect x="260" y="170" width="200" height="28" rx="6" fill="rgba(255,255,255,0.85)" />
                <text x="360" y="189" fontSize="10" fill="#2E86AB" textAnchor="middle" fontWeight="700">
                  ~1.000 años por circuito completo
                </text>
              </svg>

              <div className={styles.mapaLeyenda}>
                <div className={styles.mapaLeyendaItem}>
                  <div className={styles.mapaLeyendaDot} style={{ backgroundColor: '#e74c3c' }}></div>
                  <span>Corriente superficial cálida</span>
                </div>
                <div className={styles.mapaLeyendaItem}>
                  <div className={styles.mapaLeyendaDot} style={{ backgroundColor: '#2E86AB', opacity: 0.75 }}></div>
                  <span>Corriente profunda fría (punteada)</span>
                </div>
                <div className={styles.mapaLeyendaItem}>
                  <div className={styles.mapaLeyendaDot} style={{ backgroundColor: '#2E86AB', borderRadius: '50%', width: 10, height: 10 }}></div>
                  <span>Punto de hundimiento</span>
                </div>
              </div>
            </div>

            <div className={styles.conveyorInfo}>
              <h3 className={styles.conveyorInfoTitulo}>
                {conveyorDebilitado ? '⚠️ Estado: AMOC Debilitada' : '✅ Estado: Circulación Normal'}
              </h3>
              <p className={styles.conveyorInfoTexto}>
                {conveyorDebilitado
                  ? 'El deshielo de Groenlandia y el Ártico aporta agua dulce al Atlántico Norte, reduciendo su salinidad y densidad. Esto impide el hundimiento de la corriente cálida superficial, debilitando toda la circulación termohalina. Consecuencias: Europa se enfría, los monzones se desplazan, la absorción oceánica de CO₂ se reduce.'
                  : 'La corriente superficial cálida transporta calor de los trópicos hacia los polos. Al llegar al Atlántico Norte, el agua se enfría, se vuelve más densa y salada, y se hunde. Esta agua fría y densa fluye en profundidad de vuelta hacia el sur, cerrando el ciclo. Este mecanismo regula el clima de todo el planeta.'}
              </p>
              <span className={styles.tiempoTag}>
                {conveyorDebilitado
                  ? 'Velocidad reducida hasta un 15% desde el siglo XX'
                  : 'Transporta 1,3 petavatios de calor hacia el norte (equivalente a la producción eléctrica mundial)'}
              </span>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 2: CORRIENTE DEL GOLFO ── */}
        {seccionActiva === 'golfo' && (
          <section className={styles.section} aria-label="Corriente del Golfo e impacto en Europa">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon} aria-hidden="true">🌡️</span>
              <h2 className={styles.sectionTitle}>La Corriente del Golfo y el Clima Europeo</h2>
              <p className={styles.sectionSubtitle}>
                La corriente del Golfo mantiene Europa entre 5 y 10°C más cálida de lo que debería estar a su latitud.
                Su debilitamiento por el AMOC podría revertir este efecto pese al calentamiento global.
              </p>
            </div>

            {/* Toggle con/sin corriente */}
            <div className={styles.toggleGroup}>
              <span className={styles.toggleLabel}>Escenario de temperatura:</span>
              <div className={styles.toggleBtns}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${!sinCorriente ? styles.toggleBtnActivo : ''}`}
                  onClick={() => setSinCorriente(false)}
                  aria-pressed={!sinCorriente}
                >
                  Con Corriente del Golfo
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${sinCorriente ? styles.toggleBtnActivo : ''}`}
                  onClick={() => setSinCorriente(true)}
                  aria-pressed={sinCorriente}
                >
                  Sin Corriente del Golfo
                </button>
              </div>
            </div>

            {/* Mapa Atlántico Norte */}
            <div className={styles.mapaContenedor}>
              <svg
                className={styles.mapaSvg}
                viewBox="0 0 720 360"
                aria-label="Mapa del Atlántico Norte mostrando la corriente del Golfo"
                role="img"
              >
                <rect width="720" height="360" fill="#bce0f0" rx="8" />

                {/* América del Norte */}
                <polygon points="30,30 200,28 220,50 215,90 200,130 175,160 145,155 120,130 95,100 80,65 60,50" fill="#a8c880" />
                {/* Golfo de México */}
                <ellipse cx="175" cy="175" rx="45" ry="30" fill="#7dc8e8" />
                {/* Groenlandia */}
                <polygon points="295,20 365,18 375,40 360,65 330,70 300,55" fill="#e8f4ff" />
                {/* Europa */}
                <polygon points="480,25 580,22 610,50 600,90 570,110 540,115 510,100 485,75 475,50" fill="#a8c880" />
                {/* Islandia */}
                <ellipse cx="420" cy="55" rx="30" ry="15" fill="#a8c880" />
                {/* África (norte) */}
                <polygon points="490,120 590,118 640,140 650,175 620,200 570,210 520,205 490,185 475,155" fill="#c8a878" />

                {/* Corriente del Golfo */}
                <path
                  d="M170,175 Q200,150 240,130 Q290,105 350,90 Q400,78 445,72 Q490,68 530,72 Q560,78 575,90"
                  className={sinCorriente ? `${styles.corrienteGolfo} ${styles.corrienteDebilitada}` : styles.corrienteGolfo}
                  strokeLinecap="round"
                />

                {/* Etiqueta Corriente del Golfo */}
                <text x="340" y="105" fontSize="11" fill="#c0390a" fontWeight="700" textAnchor="middle">
                  Corriente del Golfo
                </text>

                {/* Etiquetas latitudes */}
                <line x1="30" y1="110" x2="690" y2="110" stroke="#999" strokeWidth="0.7" strokeDasharray="4 4" />
                <text x="660" y="106" fontSize="9" fill="#666">51°N</text>
                <line x1="30" y1="70" x2="690" y2="70" stroke="#999" strokeWidth="0.7" strokeDasharray="4 4" />
                <text x="660" y="66" fontSize="9" fill="#666">60°N</text>
                <line x1="30" y1="148" x2="690" y2="148" stroke="#999" strokeWidth="0.7" strokeDasharray="4 4" />
                <text x="660" y="144" fontSize="9" fill="#666">45°N</text>

                {/* Puntos ciudades */}
                <circle cx="490" cy="108" r="5" fill="#e74c3c" />
                <text x="500" y="106" fontSize="9" fill="#333" fontWeight="600">Londres</text>
                <circle cx="490" cy="72" r="5" fill="#e74c3c" />
                <text x="500" y="70" fontSize="9" fill="#333" fontWeight="600">Bergen</text>
                <circle cx="155" cy="108" r="5" fill="#2E86AB" />
                <text x="100" y="106" fontSize="9" fill="#333" fontWeight="600">Quebec</text>

                {sinCorriente && (
                  <rect x="230" y="180" width="260" height="36" rx="6" fill="rgba(192,57,43,0.12)" stroke="#c0392b" strokeWidth="1.5" />
                )}
                {sinCorriente && (
                  <text x="360" y="199" fontSize="10" fill="#c0392b" textAnchor="middle" fontWeight="700">
                    ⚠ Sin corriente: Europa -5 a -10°C
                  </text>
                )}
              </svg>

              <div className={styles.mapaLeyenda}>
                <div className={styles.mapaLeyendaItem}>
                  <div className={styles.mapaLeyendaDot} style={{ backgroundColor: '#e67e22' }}></div>
                  <span>Corriente del Golfo (superficial cálida)</span>
                </div>
              </div>
            </div>

            {/* Comparativa de temperaturas */}
            <div className={styles.tempComparativa}>
              {CIUDADES_TEMP.map(c => {
                const tempMostrada = sinCorriente
                  ? Math.round(c.tempSinAmoc)
                  : Math.round(impactoTempAmoc(c.tempNormal, c.tempSinAmoc));
                const esFria = tempMostrada <= 0;
                return (
                  <div key={c.ciudad} className={styles.tempCard}>
                    <div className={styles.tempCiudad}>{c.pais} {c.ciudad}</div>
                    <div className={styles.tempLatitud}>{c.latitud}</div>
                    <div className={`${styles.tempValor} ${esFria ? styles.tempSinCorriente : ''}`}>
                      {tempMostrada > 0 ? '+' : ''}{tempMostrada}°C
                    </div>
                    <div className={styles.tempDelta}>
                      {sinCorriente
                        ? 'Sin corriente del Golfo'
                        : debilitamientoAmoc > 0
                          ? `Con AMOC al ${100 - debilitamientoAmoc}%`
                          : 'Temperatura media actual'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider debilitamiento AMOC */}
            <div className={styles.amocSlider}>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabel}>
                  <span>Debilitamiento AMOC</span>
                  <span className={styles.sliderValor}>{debilitamientoAmoc}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={debilitamientoAmoc}
                  onChange={e => setDebilitamientoAmoc(Number(e.target.value))}
                  className={styles.slider}
                  style={sliderAmocStyle}
                  aria-label={`Debilitamiento AMOC: ${debilitamientoAmoc}%`}
                />
                <div className={styles.sliderValores}>
                  <span>0% (normal)</span>
                  <span>50% (parcial)</span>
                  <span>100% (colapso)</span>
                </div>
              </div>
              <div className={styles.amocImpacto}>
                <span className={styles.amocImpactoNum}>
                  {debilitamientoAmoc === 0 ? '0' : `-${(debilitamientoAmoc / 100 * 5).toFixed(1)}`}°C
                </span>
                impacto medio estimado en temperatura de Europa del Norte
              </div>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 3: ACIDIFICACIÓN ── */}
        {seccionActiva === 'acidificacion' && (
          <section className={styles.section} aria-label="Acidificación oceánica">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon} aria-hidden="true">🧪</span>
              <h2 className={styles.sectionTitle}>Acidificación del Océano</h2>
              <p className={styles.sectionSubtitle}>
                Los océanos absorben el 30% del CO₂ humano. Al disolverse en agua, forma ácido carbónico,
                reduciendo el pH oceánico. Desde 1750 el pH ha bajado de 8,25 a 8,08 — un 30% más ácido.
              </p>
            </div>

            {/* Slider año */}
            <div className={styles.sliderContainer}>
              <div className={styles.sliderLabel}>
                <span>Año seleccionado</span>
                <span className={styles.sliderValor}>{anioSel}</span>
              </div>
              <input
                type="range"
                min={1750}
                max={2100}
                value={anioSel}
                onChange={e => setAnioSel(Number(e.target.value))}
                className={styles.slider}
                style={sliderAnioStyle}
                aria-label={`Año: ${anioSel}`}
              />
              <div className={styles.sliderValores}>
                <span>1750 (preindustrial)</span>
                <span>2025 (actual)</span>
                <span>2100 (proyección)</span>
              </div>
            </div>

            {/* Escala de pH */}
            <div className={styles.phEscala}>
              <div className={styles.phValorActual}>
                <span className={styles.phNum}>{ph.toFixed(2)}</span>
                <div className={styles.phAnio}>pH oceánico en {anioSel} — {etiquetaEstadoPH(ph)}</div>
              </div>

              <div className={styles.phBarra} role="img" aria-label={`Escala de pH oceánico: valor actual ${ph.toFixed(2)}`}>
                <div
                  className={styles.phIndicador}
                  style={{ left: `${phPctBarraLeft}%` }}
                >
                  <div className={styles.phIndicadorLabel}>{ph.toFixed(2)}</div>
                </div>
              </div>
              <div className={styles.phEtiquetas}>
                <span>7,6 (muy ácido)</span>
                <span>8,0</span>
                <span>8,4 (básico)</span>
              </div>

              {/* Cifras clave */}
              <div className={styles.cifraGrid} style={{ marginTop: '1.5rem' }}>
                <div className={styles.cifraCard}>
                  <span className={styles.cifraNum}>8,25</span>
                  <span className={styles.cifraLabel}>pH preindustrial (1750)</span>
                </div>
                <div className={styles.cifraCard}>
                  <span className={styles.cifraNum}>8,08</span>
                  <span className={styles.cifraLabel}>pH actual (2025)</span>
                </div>
                <div className={styles.cifraCard}>
                  <span className={styles.cifraNum}>7,85</span>
                  <span className={styles.cifraLabel}>pH proyectado 2100 (RCP 8.5)</span>
                </div>
                <div className={styles.cifraCard}>
                  <span className={styles.cifraNum}>30%</span>
                  <span className={styles.cifraLabel}>aumento acidez real (escala logarítmica)</span>
                </div>
              </div>
            </div>

            {/* Impacto en especies */}
            <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              Impacto en especies marinas a pH {ph.toFixed(2)}
            </h3>
            <div className={styles.phEspecies}>
              {ESPECIES_MARINAS.map(esp => (
                <button
                  key={esp.id}
                  type="button"
                  className={`${styles.phEspecieCard} ${especieSel === esp.id ? styles.phEspecieCardActiva : ''}`}
                  onClick={() => setEspecieSel(especieSel === esp.id ? null : esp.id)}
                  aria-expanded={especieSel === esp.id}
                >
                  <span className={styles.phEspecieIcono} aria-hidden="true">{esp.icono}</span>
                  <div className={styles.phEspecieNombre}>{esp.nombre}</div>
                  <div className={`${styles.phEspecieEstado} ${estadoPH === 'ok' ? styles.phEspecieEstadoOk : estadoPH === 'estres' ? styles.phEspecieEstadoMid : styles.phEspecieEstadoBad}`}>
                    {estadoPH === 'ok' ? esp.phOk : estadoPH === 'estres' ? esp.phEstrés : esp.phCritico}
                  </div>
                </button>
              ))}
            </div>

            {especieDetalle && (
              <div className={styles.notaBox}>
                <strong>{especieDetalle.icono} {especieDetalle.nombre}</strong>
                <p style={{ marginTop: '0.4rem' }}>{especieDetalle.descripcion}</p>
              </div>
            )}

            <div className={styles.warningBox}>
              <span aria-hidden="true">⚠️</span>
              <div>
                <strong>El punto crítico de saturación de aragonito</strong>
                <p>
                  A pH 7,9 el agua oceánica deja de estar supersaturada en aragonito (CaCO₃), el mineral
                  con que construyen sus esqueletos corales y moluscos. Por debajo de este umbral, las conchas
                  y esqueletos se disuelven activamente. En el Ártico, este umbral ya se ha cruzado
                  localmente durante ciertos meses del año.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 4: ZONAS MUERTAS ── */}
        {seccionActiva === 'zonas' && (
          <section className={styles.section} aria-label="Zonas muertas hipóxicas">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon} aria-hidden="true">💀</span>
              <h2 className={styles.sectionTitle}>Zonas Muertas (Hipoxia Marina)</h2>
              <p className={styles.sectionSubtitle}>
                Áreas oceánicas con tan poco oxígeno que casi ningún ser vivo puede sobrevivir.
                De ~50 identificadas en 1960, hemos pasado a más de 700 en 2020.
                Haz clic en los puntos del mapa para conocer cada zona.
              </p>
            </div>

            {/* Mapa mundial zonas hipóxicas */}
            <div className={styles.mapaContenedor}>
              <svg
                className={styles.mapaSvg}
                viewBox="0 0 720 360"
                aria-label="Mapa mundial de zonas hipóxicas. Haz clic en los puntos rojos para más información."
                role="img"
              >
                <rect width="720" height="360" fill="#c8e4f0" rx="8" />

                {/* Continentes simplificados */}
                <polygon points="140,50 200,45 230,60 240,90 220,130 190,155 160,150 130,120 120,85" fill="#b8d898" />
                <polygon points="175,165 215,165 230,200 225,260 200,300 175,295 160,260 155,210" fill="#b8d898" />
                <polygon points="400,45 445,42 460,60 450,85 430,95 415,88 405,70" fill="#b8d898" />
                <polygon points="415,100 455,95 470,120 465,175 450,230 430,255 410,250 395,215 392,170 400,130" fill="#c8b888" />
                <polygon points="465,42 580,38 620,55 630,80 610,110 570,120 530,105 490,95 460,75" fill="#b8d898" />
                <polygon points="575,205 625,200 640,225 635,255 615,265 585,255 570,235" fill="#b8d898" />
                <rect x="60" y="330" width="600" height="25" rx="4" fill="#e8f4ff" />

                {/* Puntos de zonas hipóxicas */}
                {ZONAS_HIPOXICAS.map(zona => (
                  <g key={zona.id}>
                    <circle
                      cx={zona.cx}
                      cy={zona.cy}
                      r={zonaSelId === zona.id ? 9 : 7}
                      fill={zonaSelId === zona.id ? '#c0392b' : '#e74c3c'}
                      stroke="#fff"
                      strokeWidth="2"
                      className={`${styles.zonaHipoxica} ${zonaSelId === zona.id ? styles.zonaHipoxicaActiva : ''}`}
                      onClick={() => setZonaSelId(zonaSelId === zona.id ? null : zona.id)}
                      aria-label={`Zona hipóxica: ${zona.nombre}. Haz clic para más información.`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setZonaSelId(zonaSelId === zona.id ? null : zona.id);
                        }
                      }}
                    />
                    {/* Animación pulso para zona seleccionada */}
                    {zonaSelId === zona.id && (
                      <circle
                        cx={zona.cx}
                        cy={zona.cy}
                        r={14}
                        fill="none"
                        stroke="#c0392b"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    )}
                  </g>
                ))}

                {/* Puntos genéricos adicionales para representar las ~700 zonas */}
                {[
                  [330, 85], [350, 100], [280, 155], [320, 145],
                  [530, 95], [545, 110], [385, 165], [400, 140],
                  [620, 180], [600, 160], [490, 155], [500, 175],
                  [240, 110], [195, 130],
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r={3} fill="#e74c3c" opacity={0.45} />
                ))}

                {/* Leyenda */}
                <circle cx="540" cy="310" r="6" fill="#e74c3c" stroke="#fff" strokeWidth="1.5" />
                <text x="552" y="315" fontSize="9" fill="#333">Zona hipóxica identificada</text>
              </svg>

              <div className={styles.mapaLeyenda}>
                <div className={styles.mapaLeyendaItem}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e74c3c', border: '2px solid #fff', flexShrink: 0 }}></div>
                  <span>Zona hipóxica (haz clic para detalles)</span>
                </div>
              </div>
            </div>

            {/* Detalle de zona seleccionada */}
            {zonaSel && (
              <div className={styles.zonaDetalle}>
                <h3 className={styles.zonaDetalleTitulo}>💀 {zonaSel.nombre}</h3>
                <div className={styles.zonaDetalleGrid}>
                  <div className={styles.zonaDetalleItem}>
                    <span className={styles.zonaDetalleItemLabel}>Extensión</span>
                    {zonaSel.extension}
                  </div>
                  <div className={styles.zonaDetalleItem}>
                    <span className={styles.zonaDetalleItemLabel}>Causa principal</span>
                    {zonaSel.causa}
                  </div>
                </div>
                <p className={styles.zonaDetalleDesc}>{zonaSel.evolucion}</p>
              </div>
            )}

            {!zonaSel && (
              <div className={styles.notaBox}>
                <strong>Selecciona un punto en el mapa</strong> para ver los detalles de cada zona hipóxica.
                Los puntos más grandes son zonas especialmente documentadas.
              </div>
            )}

            {/* Slider nivel de nitratos */}
            <div className={styles.eutrofizacion}>
              <h3 className={styles.eutrofizacionTitulo}>El ciclo de eutrofización</h3>

              <div className={styles.sliderContainer}>
                <div className={styles.sliderLabel}>
                  <span>Nivel de nitratos agrícolas</span>
                  <span className={styles.sliderValor}>
                    {nivelNitratos < 33 ? 'Bajo' : nivelNitratos < 66 ? 'Medio' : 'Alto'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={nivelNitratos}
                  onChange={e => setNivelNitratos(Number(e.target.value))}
                  className={styles.slider}
                  style={sliderNitratosStyle}
                  aria-label={`Nivel de nitratos: ${nivelNitratos}%`}
                />
                <div className={styles.sliderValores}>
                  <span>Bajo</span>
                  <span>Medio</span>
                  <span>Alto</span>
                </div>
              </div>

              <div className={styles.eutrofizacionPasos}>
                {[
                  {
                    texto: `Escorrentía agrícola: ${nivelNitratos < 33 ? 'niveles normales' : nivelNitratos < 66 ? 'exceso moderado' : 'exceso crítico'} de nitratos y fosfatos entran en el agua`,
                    activo: true,
                  },
                  {
                    texto: `Florecimiento algal: ${nivelNitratos < 33 ? 'pequeño' : nivelNitratos < 66 ? 'significativo' : 'masivo (marea verde o roja)'} crecimiento de algas y cianobacterias`,
                    activo: nivelNitratos > 20,
                  },
                  {
                    texto: `Las algas mueren y se hunden. Bacterias las descomponen consumiendo ${nivelNitratos < 33 ? 'poco' : nivelNitratos < 66 ? 'mucho' : 'casi todo el'} oxígeno`,
                    activo: nivelNitratos > 35,
                  },
                  {
                    texto: `Hipoxia: O₂ baja de 2 mg/L. ${nivelNitratos > 60 ? 'Peces, crustáceos y moluscos huyen o mueren masivamente. Zona muerta establecida.' : 'Fauna bentónica bajo estrés severo.'}`,
                    activo: nivelNitratos > 50,
                  },
                ].map((paso, i) => (
                  <div
                    key={i}
                    className={styles.eutrofPaso}
                    style={{ opacity: paso.activo ? 1 : 0.35 }}
                  >
                    <span className={styles.eutrofPasoNum} aria-hidden="true">{i + 1}</span>
                    <span className={styles.eutrofPasoTexto}>{paso.texto}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cifras clave */}
            <div className={styles.cifraGrid} style={{ marginTop: '1.5rem' }}>
              <div className={styles.cifraCard}>
                <span className={styles.cifraNum}>~50</span>
                <span className={styles.cifraLabel}>zonas hipóxicas en 1960</span>
              </div>
              <div className={styles.cifraCard}>
                <span className={styles.cifraNum}>~700</span>
                <span className={styles.cifraLabel}>zonas hipóxicas en 2020</span>
              </div>
              <div className={styles.cifraCard}>
                <span className={styles.cifraNum}>245.000</span>
                <span className={styles.cifraLabel}>km² — Mar Báltico hipóxico permanente</span>
              </div>
              <div className={styles.cifraCard}>
                <span className={styles.cifraNum}>14×</span>
                <span className={styles.cifraLabel}>multiplicación en 60 años</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="¿Por qué importan los océanos para el clima?"
        subtitle="La circulación oceánica, la acidificación y la hipoxia en detalle"
        icon="🌊"
      >
        {/* 1. Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption className={styles.comparativaCaption}>Los oceanos en cifras — Funciones, amenazas y datos clave</caption>
            <thead>
              <tr>
                <th scope="col">Función</th>
                <th scope="col">Datos clave</th>
                <th scope="col">Amenaza actual</th>
                <th scope="col">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sumidero de CO₂</td>
                <td>30% del CO₂ humano absorbido</td>
                <td>Acidificación creciente</td>
                <td>Capacidad en declive</td>
              </tr>
              <tr>
                <td>Regulador térmico</td>
                <td>90% del calor extra del planeta</td>
                <td>Calentamiento oceánico</td>
                <td>+0,13°C por década</td>
              </tr>
              <tr>
                <td>Circulación AMOC</td>
                <td>1,3 PW de calor hacia el norte</td>
                <td>Debilitamiento por deshielo</td>
                <td>-15% desde el siglo XX</td>
              </tr>
              <tr>
                <td>Biodiversidad marina</td>
                <td>80% de la vida del planeta</td>
                <td>Hipoxia + acidificación</td>
                <td>700 zonas muertas (2020)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles de uso */}
        <div className={styles.perfilesGrid}>
          {[
            { icono: '🎓', titulo: 'Estudiante de ciencias', desc: 'Comprende la circulación termohalina, el pH oceánico y la hipoxia para el currículo de ciencias ambientales.' },
            { icono: '🌊', titulo: 'Amante de la naturaleza', desc: 'Entiende por qué los mares están en crisis y cómo afecta esto a la vida marina y a nuestro clima.' },
            { icono: '🏛️', titulo: 'Ciudadano informado', desc: 'Comprende el nexo entre agricultura, emisiones de CO₂ y la salud de los océanos.' },
            { icono: '📰', titulo: 'Periodista o divulgador', desc: 'Accede a datos rigurosos sobre AMOC, acidificación y zonas muertas para explicarlos al público.' },
          ].map((perfil, i) => (
            <div key={i} className={styles.perfilCard}>
              <span className={styles.perfilIcono} aria-hidden="true">{perfil.icono}</span>
              <strong className={styles.perfilTitulo}>{perfil.titulo}</strong>
              <p className={styles.perfilDesc}>{perfil.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <dl className={styles.faqList}>
          {[
            {
              q: '¿Qué es la circulación termohalina y por qué importa?',
              a: 'Es una corriente oceánica global impulsada por diferencias de temperatura (termo) y salinidad (halina). Actúa como un termostato planetario: redistribuye el calor de los trópicos hacia los polos. Sin ella, Europa sería entre 5 y 10°C más fría y muchas regiones costeras tendrían climas completamente distintos.',
            },
            {
              q: '¿Qué dice la ciencia sobre el debilitamiento del AMOC?',
              a: 'Estudios de 2021-2024 (Caesar et al., Boers, et al.) basados en datos de temperatura superficial y registros proxy muestran que el AMOC está en su punto más débil en más de 1.000 años. El umbral de colapso aún se debate: algunos modelos lo sitúan en +1,8°C sobre la media preindustrial, otros en +4°C. El consenso actual indica riesgo elevado aunque incierto.',
            },
            {
              q: '¿Si el pH baja 0,17 unidades, es tan grave?',
              a: 'Sí, porque el pH es una escala logarítmica. Una bajada de 0,17 unidades implica un 30% más de concentración de iones de hidrógeno (H⁺), es decir, un 30% más de acidez real. Las últimas veces que el pH oceánico estuvo a estos niveles fue hace 300 millones de años, y fue seguido de extinciones masivas.',
            },
            {
              q: '¿Por qué las zonas muertas se multiplican?',
              a: 'Tres factores: 1) Más nitratos y fosfatos de la agricultura industrial que llegan a ríos y costas. 2) El calentamiento reduce la solubilidad del O₂ en agua y debilita la mezcla vertical. 3) Las costas y estuarios están más estratificados por el calentamiento, impidiendo que el oxígeno superficial llegue al fondo.',
            },
            {
              q: '¿Los océanos seguirán absorbiendo CO₂?',
              a: 'Sí, pero cada vez menos eficientemente. La capacidad de absorción del CO₂ depende del gradiente de concentración entre atmósfera y océano, y de la temperatura: el agua cálida absorbe menos gas. Se estima que para 2100 los océanos podrían absorber entre un 10 y 20% menos de CO₂ que hoy, agravando el calentamiento atmosférico.',
            },
            {
              q: '¿Hay solución para la acidificación?',
              a: 'A corto plazo, muy limitada: solo reducir drásticamente las emisiones de CO₂. Se investigan técnicas como la alcalinización oceánica (añadir minerales básicos) y la reforestación de algas y praderas marinas de posidonia, que absorben CO₂ y producen O₂. Pero ninguna puede compensar el ritmo actual de emisiones.',
            },
          ].map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <dt className={styles.faqPregunta}>{item.q}</dt>
              <dd className={styles.faqRespuesta}>{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className={styles.faqTip}>
          <strong>Fuentes:</strong> IPCC AR6 (2021), Caesar et al. (2021) «Observed fingerprint of a weakening AMOC»,
          Boers (2021) «Observation-based early-warning signals for a collapse of the AMOC»,
          Diaz & Rosenberg (2008) «Spreading Dead Zones», NOAA Ocean Acidification Program,
          datos de pH HOTS/BATS 2024.
        </p>

        {/* 4. Guía paso a paso */}
        <ol className={styles.stepGuide}>
          {[
            'Las emisiones de CO₂ aumentan su concentración en la atmósfera (424 ppm en 2024 vs. 280 ppm preindustrial).',
            'El 30% del CO₂ extra es absorbido por el océano, formando ácido carbónico (H₂CO₃). El pH baja.',
            'El pH bajo disuelve los esqueletos de carbonato cálcico de corales, moluscos y pterópodos.',
            'El 90% del calor extra del sistema climático es absorbido por el océano, calentando sus aguas.',
            'El agua cálida tiene menos oxígeno disuelto. La estratificación térmica impide la mezcla vertical.',
            'Los nitratos agrícolas provocan florecimientos algales; las bacterias consumen el O₂ residual → zonas muertas.',
            'El deshielo de Groenlandia añade agua dulce al Atlántico Norte, debilitando el AMOC y alterando el clima de Europa.',
          ].map((paso, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">{i + 1}</span>
              <span className={styles.stepContent}>{paso}</span>
            </li>
          ))}
        </ol>

        {/* 5. Tips */}
        <div className={styles.tipsGrid}>
          {[
            { icono: '🌡️', texto: 'Los océanos han calentado en promedio 0,13°C por década desde 1971. El calor se acumula principalmente en los primeros 700 m.' },
            { icono: '🐡', texto: 'El 25% de las especies marinas dependen de los arrecifes de coral, pero el 50% de los corales ya han muerto desde 1950.' },
            { icono: '💨', texto: 'El Mar Báltico es la zona muerta permanente más grande del mundo: ~70.000 km² sin oxígeno suficiente para muchas especies.' },
            { icono: '⏱️', texto: 'Si cesasen hoy todas las emisiones, el pH oceánico tardaría entre 50.000 y 100.000 años en volver a niveles preindustriales de forma natural.' },
            { icono: '🔬', texto: 'El término "acidificación" es técnico: el océano sigue siendo ligeramente básico (pH > 7). Pero el descenso es crítico para los organismos calcificadores.' },
          ].map((tip, i) => (
            <div key={i} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
              <p>{tip.texto}</p>
            </div>
          ))}
        </div>

        {/* 6. Warning Box */}
        <div className={styles.warningBox}>
          <span aria-hidden="true">⚠️</span>
          <div>
            <strong>Errores comunes sobre los océanos y el clima</strong>
            <p>
              <strong>«El océano es tan grande que no puede acidificarse significativamente»</strong> — ya ha bajado 0,17 unidades de pH desde 1750, un 30% más ácido. A 8,25 en 1750 y 8,08 hoy, se proyecta 7,85 para 2100 si no actuamos.
              <br /><br />
              <strong>«Las zonas muertas son naturales»</strong> — algunas lo son (como el Mar Negro profundo), pero la gran mayoría de las ~700 actuales son de origen humano y han aparecido desde 1960.
              <br /><br />
              <strong>«El AMOC no puede colapsar, es demasiado estable»</strong> — registros de hielo polar y sedimentos marinos muestran que el AMOC ha colapsado al menos una vez en los últimos 12.000 años (evento de Younger Dryas hace ~12.900 años), provocando una mini-edad de hielo en Europa en pocas décadas.
            </p>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-oceanos-corrientes')} />
      <ShareCard appName="visualizador-oceanos-corrientes" />
      <Footer appName="visualizador-oceanos-corrientes" />
    </div>
  );
}
