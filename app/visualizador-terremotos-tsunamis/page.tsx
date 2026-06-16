'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TerremotosTsunamis.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// --- Datos estáticos ---

interface TipoFalla {
  nombre: string;
  tipo: string;
  color: string;
  descripcion: string;
  mecanismo: string;
  ejemplo: string;
  peligro: string;
}

const TIPOS_FALLA: TipoFalla[] = [
  {
    nombre: 'Falla Normal',
    tipo: 'Extensional',
    color: '#2E86AB',
    descripcion: 'Un bloque desciende respecto al otro por fuerzas de tensión que estiran la corteza.',
    mecanismo: 'La corteza se estira → se adelgaza → un bloque cae respecto al otro siguiendo el plano de falla inclinado.',
    ejemplo: 'Rift del Este de África · Valle de la Muerte (California) · Mar Rojo',
    peligro: 'Moderado — acumulan menos energía elástica que las compresionales',
  },
  {
    nombre: 'Falla Inversa',
    tipo: 'Compresional',
    color: '#D62839',
    descripcion: 'Un bloque asciende por encima del otro por fuerzas compresionales que comprimen la corteza.',
    mecanismo: 'Las placas se comprimen → la corteza se engrosa → un bloque cabalga sobre el otro. En zonas de subducción la falla tiene bajo ángulo (cabalgamiento).',
    ejemplo: 'Himalaya · Andes · Zona de subducción de Cascadia (Pacífico NW)',
    peligro: 'Máximo — acumulan la mayor energía elástica. Generan los terremotos más grandes (Mw 8-9+)',
  },
  {
    nombre: 'Falla en Desgarre',
    tipo: 'Transformante / Cizalla',
    color: '#48A9A6',
    descripcion: 'Dos bloques se deslizan horizontalmente en sentidos opuestos sin componente vertical significativa.',
    mecanismo: 'Las placas se mueven lateralmente entre sí → movimiento horizontal puro → cizalla. No hay creación ni destrucción de corteza.',
    ejemplo: 'Falla de San Andrés (California) · Falla del Norte de Anatolia (Turquía) · Límites transformantes entre placas',
    peligro: 'Alto — terremotos superficiales muy destructivos en zonas densamente pobladas',
  },
];

interface OndaSismica {
  nombre: string;
  sigla: string;
  color: string;
  velocidad: string;
  medios: string;
  movimiento: string;
  destructividad: string;
  curiosidad: string;
}

const ONDAS_SISMICAS: OndaSismica[] = [
  {
    nombre: 'Ondas Primarias',
    sigla: 'P',
    color: '#2E86AB',
    velocidad: '5–8 km/s en corteza',
    medios: 'Sólidos Y líquidos (atraviesan el núcleo externo)',
    movimiento: 'Compresión-expansión paralela a la dirección de propagación',
    destructividad: 'Baja — son las primeras en llegar pero las menos dañinas',
    curiosidad: 'Permiten "ver" el interior de la Tierra: su velocidad cambia según la densidad y estado del material',
  },
  {
    nombre: 'Ondas Secundarias',
    sigla: 'S',
    color: '#D62839',
    velocidad: '3–5 km/s en corteza',
    medios: 'Solo sólidos (NO atraviesan el núcleo externo líquido)',
    movimiento: 'Cizalla perpendicular a la dirección de propagación',
    destructividad: 'Alta — sacuden los edificios lateralmente, causando colapsos estructurales',
    curiosidad: 'Su incapacidad para atravesar el núcleo externo fue la primera prueba de que el núcleo externo es líquido',
  },
  {
    nombre: 'Ondas Superficiales',
    sigla: 'L+R',
    color: '#F59E0B',
    velocidad: '~3 km/s (más lentas)',
    medios: 'Solo la superficie terrestre',
    movimiento: 'Love: horizontal transversal · Rayleigh: elíptico (como el oleaje del mar)',
    destructividad: 'Máxima — viajan más despacio pero con mayor amplitud. Causan la mayor parte de los daños en edificios',
    curiosidad: 'Las ondas Rayleigh fueron predichas matemáticamente por Lord Rayleigh antes de ser detectadas experimentalmente',
  },
];

interface EjemploMagnitud {
  mw: number;
  descripcion: string;
  frecuencia: string;
  efecto: string;
}

const EJEMPLOS_MAGNITUD: EjemploMagnitud[] = [
  { mw: 4, descripcion: 'Sentido por personas', frecuencia: '~13.000/año', efecto: 'Objetos vibran, pocas personas lo notan' },
  { mw: 5, descripcion: 'Daños menores posibles', frecuencia: '~1.300/año', efecto: 'Grietas en paredes, objetos caen' },
  { mw: 6, descripcion: 'Daños serios en zona', frecuencia: '~130/año', efecto: 'Edificios dañados, posibles víctimas' },
  { mw: 7, descripcion: 'Catastrófico a nivel regional', frecuencia: '~13/año', efecto: 'Grandes áreas destruidas, miles de víctimas' },
  { mw: 8, descripcion: 'Catastrófico a nivel nacional', frecuencia: '~1/año', efecto: 'País afectado, centenares de miles de víctimas' },
  { mw: 9, descripcion: 'Histórico — extremo', frecuencia: 'Cada 10-50 años', efecto: 'Devastación masiva + tsunami oceánico (Tohoku 2011, Valdivia 1960)' },
];

interface EtapaAlerta {
  paso: number;
  titulo: string;
  descripcion: string;
  tiempo: string;
  icono: string;
}

const ETAPAS_ALERTA: EtapaAlerta[] = [
  {
    paso: 1,
    titulo: 'Terremoto submarino',
    descripcion: 'Una falla inversa submarina se rompe bruscamente. El fondo marino se desplaza verticalmente varios metros en segundos.',
    tiempo: 'T = 0',
    icono: '⚡',
  },
  {
    paso: 2,
    titulo: 'Red sísmica global detecta',
    descripcion: 'Más de 8.000 estaciones sismológicas registran las ondas P. En menos de 3 minutos se localiza el epicentro y se estima la magnitud.',
    tiempo: '< 3 minutos',
    icono: '📡',
  },
  {
    paso: 3,
    titulo: 'Boyas DART confirman',
    descripcion: 'Los sensores de presión del fondo oceánico (BPR) detectan el paso de la ola de tsunami (diferencia de presión en milímetros). La boya transmite por satélite.',
    tiempo: '5–20 minutos',
    icono: '🛰️',
  },
  {
    paso: 4,
    titulo: 'Centros de análisis emiten alerta',
    descripcion: 'PTWC (Honolulú) y NTWC procesan los datos y emiten alertas diferenciadas por zona: vigilancia, amenaza, evacuación.',
    tiempo: '15–30 minutos',
    icono: '🚨',
  },
  {
    paso: 5,
    titulo: 'Autoridades activan evacuación',
    descripcion: 'Sirenas, mensajes de emergencia, cierre de zonas costeras. Para terremotos locales, el tiempo es crítico (5–30 min). Para lejanos, hay horas.',
    tiempo: '30 min – 12 h',
    icono: '🏃',
  },
];

const HIRSOHIMA_J = 6.3e13; // julios de la bomba de Hiroshima

function energiaEnJulios(mw: number): number {
  // Fórmula: log10(E) = 1.5 * Mw + 4.8 (E en Julios)
  return Math.pow(10, 1.5 * mw + 4.8);
}

function formatearEnergia(j: number): string {
  if (j >= 1e18) return `${(j / 1e18).toFixed(1)} × 10¹⁸ J`;
  if (j >= 1e15) return `${(j / 1e15).toFixed(1)} × 10¹⁵ J`;
  if (j >= 1e12) return `${(j / 1e12).toFixed(1)} × 10¹² J`;
  return `${j.toExponential(2)} J`;
}

const TABS = ['Fallas y terremotos', 'Ondas sísmicas y escalas', 'Tsunamis: de la falla al impacto', 'Alerta temprana'] as const;
type Tab = typeof TABS[number];

export default function VisualizadorTerremotosTsunamis() {
  const [tabActiva, setTabActiva] = useState<Tab>('Fallas y terremotos');
  const [fallaSeleccionada, setFallaSeleccionada] = useState(0);
  const [magnitudSlider, setMagnitudSlider] = useState(6);
  const relatedApps = getRelatedApps('visualizador-terremotos-tsunamis');

  const energiaActual = energiaEnJulios(magnitudSlider);
  const bombas = energiaActual / HIRSOHIMA_J;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🌊</div>
        <h1>Terremotos y Tsunamis: Cómo Funcionan</h1>
        <p>De la falla geológica al tsunami en 800 km/h: todos los principios de la sismología y la alerta temprana</p>
      </header>

      <LegalNotice />

      {/* Tabs de navegación */}
      <nav className={styles.tabs} role="tablist" aria-label="Secciones del visualizador">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={tabActiva === tab}
            className={`${styles.tab} ${tabActiva === tab ? styles.tabActive : ''}`}
            onClick={() => setTabActiva(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* TAB 1: Fallas y terremotos */}
      {tabActiva === 'Fallas y terremotos' && (
        <div className={styles.content} role="tabpanel">
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tipos de Fallas Geológicas</h2>
            <p className={styles.sectionSubtitle}>
              Una falla es una fractura en la corteza terrestre donde los bloques se desplazan relativamente entre sí.
              El tipo de movimiento determina el tipo de terremoto y su peligrosidad.
            </p>

            <div className={styles.fallasGrid}>
              {TIPOS_FALLA.map((falla, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.fallaCard} ${fallaSeleccionada === i ? styles.fallaCardActiva : ''}`}
                  onClick={() => setFallaSeleccionada(i)}
                  style={{ '--falla-color': falla.color } as React.CSSProperties}
                  aria-pressed={fallaSeleccionada === i}
                >
                  <div className={styles.fallaHeader}>
                    <span className={styles.fallaTitle}>{falla.nombre}</span>
                    <span className={styles.fallaTipo}>{falla.tipo}</span>
                  </div>
                  <p className={styles.fallaDescripcionCorta}>{falla.descripcion}</p>
                </button>
              ))}
            </div>

            {/* Diagrama SVG de la falla seleccionada */}
            <div className={styles.fallaDiagramWrapper}>
              <div className={styles.fallaDiagram} aria-label={`Diagrama de ${TIPOS_FALLA[fallaSeleccionada].nombre}`}>
                {/* SVG Falla Normal */}
                {fallaSeleccionada === 0 && (
                  <svg viewBox="0 0 400 220" className={styles.svgFalla} aria-hidden="true">
                    <defs>
                      <pattern id="tierra" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#8B6914" opacity="0.3" />
                        <circle cx="5" cy="5" r="2" fill="#8B6914" opacity="0.4" />
                        <circle cx="15" cy="15" r="2" fill="#8B6914" opacity="0.4" />
                      </pattern>
                    </defs>
                    {/* Bloque izquierdo (se queda) */}
                    <polygon points="20,40 180,40 200,220 20,220" fill="url(#tierra)" stroke="#5D4E37" strokeWidth="2" />
                    <polygon points="20,40 180,40 180,80 20,80" fill="#A0522D" opacity="0.6" />
                    {/* Bloque derecho (baja) */}
                    <polygon points="200,80 380,80 380,220 180,220" fill="url(#tierra)" stroke="#5D4E37" strokeWidth="2" />
                    <polygon points="200,80 380,80 380,120 200,120" fill="#A0522D" opacity="0.4" />
                    {/* Plano de falla */}
                    <line x1="190" y1="30" x2="190" y2="220" stroke="#D62839" strokeWidth="3" strokeDasharray="8,4" />
                    {/* Flechas de movimiento */}
                    <text x="100" y="30" textAnchor="middle" fill="#2E86AB" fontSize="22" fontWeight="bold">→</text>
                    <text x="290" y="75" textAnchor="middle" fill="#D62839" fontSize="22" fontWeight="bold">↓</text>
                    {/* Etiquetas */}
                    <text x="95" y="165" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">Bloque fijo</text>
                    <text x="290" y="165" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">Bloque hundido</text>
                    <text x="230" y="25" fill="#D62839" fontSize="11" fontWeight="bold">Plano de falla</text>
                    <text x="30" y="60" fill="#654321" fontSize="11">Corteza</text>
                  </svg>
                )}
                {/* SVG Falla Inversa */}
                {fallaSeleccionada === 1 && (
                  <svg viewBox="0 0 400 220" className={styles.svgFalla} aria-hidden="true">
                    <defs>
                      <pattern id="tierra2" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#8B6914" opacity="0.3" />
                        <circle cx="10" cy="10" r="2" fill="#8B6914" opacity="0.4" />
                      </pattern>
                    </defs>
                    {/* Bloque que cabalga (sube) */}
                    <polygon points="20,60 210,60 180,220 20,220" fill="url(#tierra2)" stroke="#5D4E37" strokeWidth="2" />
                    <polygon points="20,60 210,60 210,100 20,100" fill="#8B0000" opacity="0.5" />
                    {/* Bloque inferior */}
                    <polygon points="180,100 380,100 380,220 160,220" fill="url(#tierra2)" stroke="#5D4E37" strokeWidth="2" />
                    {/* Plano de falla */}
                    <line x1="200" y1="40" x2="170" y2="220" stroke="#D62839" strokeWidth="3" strokeDasharray="8,4" />
                    {/* Flechas */}
                    <text x="100" y="50" textAnchor="middle" fill="#D62839" fontSize="22" fontWeight="bold">↑</text>
                    <text x="310" y="95" textAnchor="middle" fill="#2E86AB" fontSize="22" fontWeight="bold">→</text>
                    {/* Etiquetas */}
                    <text x="95" y="170" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">Bloque superior</text>
                    <text x="295" y="170" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">Bloque inferior</text>
                    <text x="215" y="35" fill="#D62839" fontSize="11" fontWeight="bold">Plano de falla</text>
                    <text x="30" y="85" fill="#650000" fontSize="11">⚠ Máx. energía</text>
                  </svg>
                )}
                {/* SVG Falla en Desgarre */}
                {fallaSeleccionada === 2 && (
                  <svg viewBox="0 0 400 220" className={styles.svgFalla} aria-hidden="true">
                    <defs>
                      <pattern id="tierra3" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#8B6914" opacity="0.3" />
                        <circle cx="10" cy="10" r="2" fill="#8B6914" opacity="0.4" />
                      </pattern>
                    </defs>
                    {/* Bloque norte (va a la derecha) */}
                    <rect x="20" y="20" width="360" height="90" rx="4" fill="url(#tierra3)" stroke="#5D4E37" strokeWidth="2" />
                    <rect x="20" y="20" width="360" height="30" rx="4" fill="#48A9A6" opacity="0.5" />
                    {/* Bloque sur (va a la izquierda) */}
                    <rect x="20" y="120" width="360" height="80" rx="4" fill="url(#tierra3)" stroke="#5D4E37" strokeWidth="2" />
                    <rect x="20" y="120" width="360" height="30" rx="4" fill="#48A9A6" opacity="0.35" />
                    {/* Línea de falla */}
                    <line x1="20" y1="110" x2="380" y2="110" stroke="#D62839" strokeWidth="3" strokeDasharray="10,5" />
                    {/* Flechas horizontales opuestas */}
                    <text x="320" y="75" textAnchor="middle" fill="#2E86AB" fontSize="24" fontWeight="bold">→</text>
                    <text x="80" y="160" textAnchor="middle" fill="#2E86AB" fontSize="24" fontWeight="bold">←</text>
                    {/* Etiquetas */}
                    <text x="120" y="70" fill="white" fontSize="13" fontWeight="600">Placa Norte</text>
                    <text x="195" y="175" fill="white" fontSize="13" fontWeight="600">Placa Sur</text>
                    <text x="140" y="105" fill="#D62839" fontSize="11" fontWeight="bold">Plano de falla transformante</text>
                  </svg>
                )}
              </div>

              <div className={styles.fallaDetalle}>
                <h3 style={{ color: TIPOS_FALLA[fallaSeleccionada].color }}>{TIPOS_FALLA[fallaSeleccionada].nombre}</h3>
                <div className={styles.fallaDetalleGrid}>
                  <div className={styles.fallaDetalleItem}>
                    <span className={styles.fallaDetalleLabel}>Mecanismo</span>
                    <p>{TIPOS_FALLA[fallaSeleccionada].mecanismo}</p>
                  </div>
                  <div className={styles.fallaDetalleItem}>
                    <span className={styles.fallaDetalleLabel}>Ejemplos reales</span>
                    <p>{TIPOS_FALLA[fallaSeleccionada].ejemplo}</p>
                  </div>
                  <div className={styles.fallaDetalleItem}>
                    <span className={styles.fallaDetalleLabel}>Nivel de peligro</span>
                    <p>{TIPOS_FALLA[fallaSeleccionada].peligro}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conceptos clave: foco, epicentro, subducción */}
            <div className={styles.conceptosGrid}>
              <div className={styles.conceptoCard}>
                <div className={styles.conceptoIcono} aria-hidden="true">📍</div>
                <h3 className={styles.conceptoTitulo}>Foco / Hipocentro</h3>
                <p>Punto <strong>interior</strong> donde se libera la energía elástica acumulada. Puede estar entre 0 y 700 km de profundidad. A menor profundidad, más daños superficiales.</p>
              </div>
              <div className={styles.conceptoCard}>
                <div className={styles.conceptoIcono} aria-hidden="true">⭕</div>
                <h3 className={styles.conceptoTitulo}>Epicentro</h3>
                <p>Proyección vertical del foco en la <strong>superficie terrestre</strong>. Es el punto de referencia geográfico que aparece en los mapas de terremotos.</p>
              </div>
              <div className={styles.conceptoCard}>
                <div className={styles.conceptoIcono} aria-hidden="true">🌋</div>
                <h3 className={styles.conceptoTitulo}>Zonas de Subducción</h3>
                <p>Donde una placa oceánica <strong>se hunde bajo una continental</strong>. Generan los terremotos más grandes del mundo. El 80% de la energía sísmica global se libera aquí.</p>
              </div>
            </div>

            {/* SVG perfil subducción */}
            <div className={styles.svgSubduccionWrapper}>
              <h3 className={styles.svgSubduccionTitulo}>Perfil de una Zona de Subducción</h3>
              <svg viewBox="0 0 500 260" className={styles.svgSubduccion} aria-label="Perfil de zona de subducción con terremoto">
                <defs>
                  <linearGradient id="oceano" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E6E9E" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0A3D5C" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="continente" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8B6914" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#5D4E37" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                {/* Océano */}
                <rect x="0" y="0" width="500" height="60" fill="#1E6E9E" opacity="0.35" />
                <text x="130" y="35" textAnchor="middle" fill="#7FB3D3" fontSize="13" fontWeight="600">Océano</text>
                {/* Placa oceánica (subducta) */}
                <polygon points="0,60 260,60 340,260 0,260" fill="url(#oceano)" />
                <text x="100" y="170" fill="#7FB3D3" fontSize="12">Placa oceánica</text>
                {/* Placa continental */}
                <polygon points="240,60 500,60 500,260 200,260" fill="url(#continente)" />
                <text x="380" y="130" fill="#F5DEB3" fontSize="12">Placa continental</text>
                {/* Zona de contacto (plano de Benioff) */}
                <line x1="250" y1="60" x2="340" y2="260" stroke="#D62839" strokeWidth="3" strokeDasharray="10,5" />
                <text x="295" y="175" fill="#D62839" fontSize="10" fontWeight="bold" transform="rotate(25, 295, 175)">Plano Benioff</text>
                {/* Foco del terremoto */}
                <circle cx="290" cy="155" r="10" fill="#D62839" opacity="0.9" />
                <text x="320" y="155" fill="#D62839" fontSize="11" fontWeight="bold">Foco</text>
                {/* Epicentro */}
                <circle cx="280" cy="60" r="6" fill="#F59E0B" />
                <line x1="280" y1="60" x2="280" y2="145" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5,3" />
                <text x="280" y="50" textAnchor="middle" fill="#F59E0B" fontSize="11" fontWeight="bold">Epicentro</text>
                {/* Olas sísmicas */}
                <text x="200" y="90" fill="#48A9A6" fontSize="20">〜〜〜</text>
                <text x="150" y="38" fill="white" fontSize="13">↑ Ondas sísmicas</text>
                {/* Montaña */}
                <polygon points="420,60 450,15 480,60" fill="#5D4E37" />
                <text x="450" y="12" textAnchor="middle" fill="#F5DEB3" fontSize="10">Cordillera</text>
              </svg>
              <p className={styles.svgNota}>La placa oceánica es más densa y se hunde bajo la continental. La fricción en el plano de contacto acumula energía elástica que se libera bruscamente en un terremoto.</p>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: Ondas sísmicas y escalas */}
      {tabActiva === 'Ondas sísmicas y escalas' && (
        <div className={styles.content} role="tabpanel">
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Los Tres Tipos de Ondas Sísmicas</h2>
            <p className={styles.sectionSubtitle}>
              Un terremoto genera distintos tipos de ondas que viajan a velocidades diferentes y causan daños distintos.
            </p>

            <div className={styles.ondasGrid}>
              {ONDAS_SISMICAS.map((onda, i) => (
                <div key={i} className={styles.ondaCard} style={{ '--onda-color': onda.color } as React.CSSProperties}>
                  <div className={styles.ondaHeader}>
                    <span className={styles.ondaSigla} style={{ background: onda.color }}>{onda.sigla}</span>
                    <h3 className={styles.ondaNombre}>{onda.nombre}</h3>
                  </div>
                  <div className={styles.ondaInfo}>
                    <div className={styles.ondaFila}>
                      <span className={styles.ondaLabel}>Velocidad</span>
                      <span>{onda.velocidad}</span>
                    </div>
                    <div className={styles.ondaFila}>
                      <span className={styles.ondaLabel}>Medios</span>
                      <span>{onda.medios}</span>
                    </div>
                    <div className={styles.ondaFila}>
                      <span className={styles.ondaLabel}>Movimiento</span>
                      <span>{onda.movimiento}</span>
                    </div>
                    <div className={styles.ondaFila}>
                      <span className={styles.ondaLabel}>Destructividad</span>
                      <span>{onda.destructividad}</span>
                    </div>
                  </div>
                  <div className={styles.ondaCuriosidad}>
                    <span aria-hidden="true">💡</span> {onda.curiosidad}
                  </div>

                  {/* Animación CSS del tipo de onda */}
                  <div className={styles.ondaAnimContainer} aria-hidden="true">
                    {i === 0 && (
                      <div className={styles.ondaAnimP}>
                        {[0,1,2,3,4,5,6,7].map((k) => (
                          <div key={k} className={styles.ondaParticula} style={{ animationDelay: `${k * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                    {i === 1 && (
                      <div className={styles.ondaAnimS}>
                        {[0,1,2,3,4,5,6,7].map((k) => (
                          <div key={k} className={styles.ondaParticulaS} style={{ animationDelay: `${k * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                    {i === 2 && (
                      <div className={styles.ondaAnimSup}>
                        <div className={styles.ondaSuperficialSVG}>
                          <svg viewBox="0 0 200 40" style={{ width: '100%', height: '40px' }}>
                            <path d="M 0 20 Q 25 5 50 20 Q 75 35 100 20 Q 125 5 150 20 Q 175 35 200 20" fill="none" stroke={onda.color} strokeWidth="2.5" className={styles.ondaPath} />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Escalas de medición */}
            <div className={styles.escalasSection}>
              <h2 className={styles.sectionTitle}>Escalas de Medición</h2>

              <div className={styles.escalasComparacion}>
                <div className={styles.escalaCard}>
                  <div className={styles.escalaIcono} aria-hidden="true">📏</div>
                  <h3>Escala de Magnitud (Mw)</h3>
                  <p>Mide la energía liberada <strong>en la fuente</strong>. Es un número único para cada terremoto. La escala es <strong>logarítmica</strong>: cada unidad implica 32 veces más energía (no 10 veces).</p>
                  <div className={styles.escalaDato}>
                    <strong>Mw 7 vs Mw 6:</strong> 32× más energía<br />
                    <strong>Mw 9 vs Mw 6:</strong> 32.000× más energía
                  </div>
                </div>
                <div className={styles.escalaCard}>
                  <div className={styles.escalaIcono} aria-hidden="true">🏠</div>
                  <h3>Escala de Mercalli (I–XII)</h3>
                  <p>Mide la <strong>intensidad percibida</strong> en un lugar concreto. No es un valor único: un mismo terremoto tiene intensidad I en un lugar lejano y VIII cerca del epicentro.</p>
                  <div className={styles.escalaDato}>
                    <strong>I:</strong> Imperceptible<br />
                    <strong>VI:</strong> Sentido por todos, daños leves<br />
                    <strong>XII:</strong> Destrucción total
                  </div>
                </div>
              </div>

              {/* Tabla de magnitudes */}
              <div className={styles.tablaMagnitud}>
                <h3 className={styles.tablaTitle}>Escala de Magnitud: Referencia Práctica</h3>
                <div className={styles.tablaWrapper}>
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th>Mw</th>
                        <th>Descripción</th>
                        <th>Frecuencia</th>
                        <th>Efecto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EJEMPLOS_MAGNITUD.map((ej) => (
                        <tr key={ej.mw}>
                          <td className={styles.tdMw}>{ej.mw}</td>
                          <td>{ej.descripcion}</td>
                          <td className={styles.tdFrecuencia}>{ej.frecuencia}</td>
                          <td>{ej.efecto}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slider de energía */}
              <div className={styles.sliderWrapper}>
                <h3 className={styles.sliderTitle}>Compara la Energía: Mueve el Slider</h3>
                <div className={styles.sliderControl}>
                  <label htmlFor="sliderMw" className={styles.sliderLabel}>Magnitud Mw: <strong>{magnitudSlider}</strong></label>
                  <input
                    id="sliderMw"
                    type="range"
                    min={4}
                    max={9}
                    step={0.5}
                    value={magnitudSlider}
                    onChange={(e) => setMagnitudSlider(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label={`Magnitud sísmica: ${magnitudSlider}`}
                  />
                  <div className={styles.sliderMarks}>
                    {[4,5,6,7,8,9].map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.energiaDisplay}>
                  <div className={styles.energiaCifra}>
                    <span className={styles.energiaLabel}>Energía liberada</span>
                    <span className={styles.energiaValor}>{formatearEnergia(energiaActual)}</span>
                  </div>
                  <div className={styles.energiaCifra}>
                    <span className={styles.energiaLabel}>Equivalente en bombas de Hiroshima</span>
                    <span className={styles.energiaValor}>
                      {bombas < 0.01
                        ? `${bombas.toFixed(4)} bombas`
                        : bombas < 1
                        ? `${bombas.toFixed(2)} bombas`
                        : bombas < 1000
                        ? `${bombas.toFixed(0)} bombas`
                        : `${(bombas / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} mil bombas`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: Tsunamis */}
      {tabActiva === 'Tsunamis: de la falla al impacto' && (
        <div className={styles.content} role="tabpanel">
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cómo se Genera un Tsunami</h2>
            <p className={styles.sectionSubtitle}>
              El tsunami no es una sola ola: es una serie de ondas de larguísima longitud que transportan un volumen colosal de agua.
            </p>

            {/* Generación */}
            <div className={styles.tsunamiGeneracion}>
              <h3 className={styles.subTitle}>¿Qué puede generar un tsunami?</h3>
              <div className={styles.tsunamiCausasGrid}>
                <div className={styles.tsunamiCausa}>
                  <div className={styles.causaIcono} aria-hidden="true">⚡</div>
                  <h4>Terremoto submarino</h4>
                  <p>El más común. Requiere una falla con <strong>componente vertical</strong> (falla inversa o normal) que desplace bruscamente el fondo marino varios metros. Necesita Mw {'>'} 7 para generar un tsunami significativo.</p>
                </div>
                <div className={styles.tsunamiCausa}>
                  <div className={styles.causaIcono} aria-hidden="true">🌋</div>
                  <h4>Erupción volcánica submarina</h4>
                  <p>Krakatoa (1883) generó un tsunami de 35 m. El colapso del flanco de un volcán submarino desplaza grandes masas de agua.</p>
                </div>
                <div className={styles.tsunamiCausa}>
                  <div className={styles.causaIcono} aria-hidden="true">🏔️</div>
                  <h4>Deslizamiento submarino</h4>
                  <p>Un derrumbe masivo de sedimentos en el fondo oceánico puede generar tsunamis locales devastadores aunque no haya terremoto.</p>
                </div>
              </div>
            </div>

            {/* Propagación en mar abierto */}
            <div className={styles.tsunamiPropagacion}>
              <h3 className={styles.subTitle}>En Mar Profundo: El Engaño de la Velocidad</h3>
              <div className={styles.propagacionGrid}>
                <div className={styles.propagacionDato}>
                  <span className={styles.propagacionValor}>~700-800 km/h</span>
                  <span className={styles.propagacionDesc}>Velocidad en mar profundo (4.000 m) — como un avión jet</span>
                </div>
                <div className={styles.propagacionDato}>
                  <span className={styles.propagacionValor}>0,5–1 m</span>
                  <span className={styles.propagacionDesc}>Amplitud en mar abierto — casi imperceptible para barcos</span>
                </div>
                <div className={styles.propagacionDato}>
                  <span className={styles.propagacionValor}>100–500 km</span>
                  <span className={styles.propagacionDesc}>Longitud de onda — extremadamente largas</span>
                </div>
                <div className={styles.propagacionDato}>
                  <span className={styles.propagacionValor}>= √(g × h)</span>
                  <span className={styles.propagacionDesc}>Velocidad de onda en aguas poco profundas: proporcional a √(profundidad)</span>
                </div>
              </div>
            </div>

            {/* SVG Perfil tsunami */}
            <div className={styles.tsunamiProfile}>
              <h3 className={styles.subTitle}>El Efecto Shoaling: La Ola que Crece</h3>
              <svg viewBox="0 0 500 200" className={styles.svgTsunami} aria-label="Perfil de propagación de tsunami de mar profundo a costa">
                <defs>
                  <linearGradient id="aguaProfunda" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E6E9E" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0A3D5C" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="aguaCosta" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E6E9E" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#2E86AB" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                {/* Fondo marino */}
                <polygon points="0,190 320,140 500,90 500,200 0,200" fill="#8B6914" opacity="0.6" />
                {/* Agua profunda */}
                <rect x="0" y="80" width="320" height="110" fill="url(#aguaProfunda)" opacity="0.5" />
                {/* Agua costa */}
                <polygon points="320,90 500,90 500,140 320,140" fill="url(#aguaCosta)" opacity="0.55" />
                {/* Ola en mar profundo (baja y larga) */}
                <path d="M 30 75 Q 80 65 130 75 Q 180 85 230 75 Q 280 65 310 75" fill="none" stroke="#7FB3D3" strokeWidth="2.5" />
                {/* Ola en costa (alta y corta) */}
                <path d="M 360 80 Q 380 30 400 80 Q 420 130 440 100" fill="none" stroke="#2E86AB" strokeWidth="3" />
                {/* Flechas de dirección */}
                <text x="155" y="58" textAnchor="middle" fill="#7FB3D3" fontSize="18" fontWeight="bold">→</text>
                {/* Anotaciones */}
                <text x="155" y="38" textAnchor="middle" fill="#7FB3D3" fontSize="11" fontWeight="600">Mar profundo: 700-800 km/h · ola 0,5 m</text>
                <text x="410" y="20" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="600">Costa: 30 km/h · ola 10-40 m</text>
                <line x1="410" y1="23" x2="400" y2="35" stroke="#2E86AB" strokeWidth="1.5" />
                {/* Flecha costa */}
                <text x="340" y="90" fill="#2E86AB" fontSize="18" fontWeight="bold">→</text>
                {/* Etiqueta fondo */}
                <text x="150" y="185" textAnchor="middle" fill="#F5DEB3" fontSize="10">Plataforma continental</text>
                <text x="450" y="185" textAnchor="middle" fill="#F5DEB3" fontSize="10">Costa</text>
              </svg>
              <p className={styles.svgNota}>La energía se conserva. Al disminuir la profundidad, la velocidad cae drásticamente y la energía se "comprime" verticalmente: la amplitud puede multiplicarse por 30-40.</p>
            </div>

            {/* Casos históricos */}
            <div className={styles.casosHistoricos}>
              <h3 className={styles.subTitle}>Tsunamis Históricos de Referencia</h3>
              <div className={styles.casosGrid}>
                <div className={styles.casoCard}>
                  <div className={styles.casoAnio}>2004</div>
                  <h4 className={styles.casoNombre}>Océano Índico</h4>
                  <div className={styles.casoInfo}>
                    <span>Mw 9.1 (Sumatra)</span>
                    <span>230.000 víctimas</span>
                    <span>Propagación en 7 horas por todo el océano</span>
                    <span>No existía sistema de alerta en el Índico</span>
                  </div>
                </div>
                <div className={styles.casoCard}>
                  <div className={styles.casoAnio}>2011</div>
                  <h4 className={styles.casoNombre}>Tōhoku, Japón</h4>
                  <div className={styles.casoInfo}>
                    <span>Mw 9.0</span>
                    <span>~16.000 víctimas</span>
                    <span>Olas hasta 40 m en zonas costeras</span>
                    <span>Sistemas de alerta activados pero muchos no evacuaron</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retirada del mar */}
            <div className={styles.reglaDoro}>
              <div className={styles.reglaIcono} aria-hidden="true">⚠️</div>
              <div>
                <h3 className={styles.reglaTitulo}>La &quot;Retirada del Mar&quot;: Una Advertencia Natural</h3>
                <p>Antes de que llegue la cresta del tsunami, suele llegar primero el <strong>valle</strong> de la onda (período negativo). Esto hace que el mar se retire de la costa, exponiendo el fondo marino. Es una señal de peligro inminente. La gente que fue a recoger peces varados en el Tsunami de 2004 murió al llegar la cresta.</p>
                <p className={styles.reglaDestacado}><strong>Si el mar se retira bruscamente de la costa: aléjate de inmediato sin esperar ninguna alerta.</strong></p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: Alerta temprana */}
      {tabActiva === 'Alerta temprana' && (
        <div className={styles.content} role="tabpanel">
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Sistemas de Alerta Temprana</h2>
            <p className={styles.sectionSubtitle}>
              Cómo la ciencia y la tecnología pueden dar minutos o incluso horas de margen para salvar vidas.
            </p>

            {/* Cadena de alerta */}
            <div className={styles.alertaChain}>
              <h3 className={styles.subTitle}>La Cadena de Alerta: Paso a Paso</h3>
              <div className={styles.alertaGrid}>
                {ETAPAS_ALERTA.map((etapa, i) => (
                  <div key={i} className={styles.alertaCard}>
                    <div className={styles.alertaPaso} aria-hidden="true">{etapa.paso}</div>
                    <div className={styles.alertaCardHeader}>
                      <span className={styles.alertaIcono} aria-hidden="true">{etapa.icono}</span>
                      <div>
                        <h4 className={styles.alertaTitulo}>{etapa.titulo}</h4>
                        <span className={styles.alertaTiempo}>{etapa.tiempo}</span>
                      </div>
                    </div>
                    <p className={styles.alertaDesc}>{etapa.descripcion}</p>
                    {i < ETAPAS_ALERTA.length - 1 && (
                      <div className={styles.alertaConector} aria-hidden="true">↓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Red DART */}
            <div className={styles.dartSection}>
              <h3 className={styles.subTitle}>Las Boyas DART (Deep-ocean Assessment and Reporting of Tsunamis)</h3>
              <div className={styles.dartGrid}>
                <div className={styles.dartCard}>
                  <h4>¿Qué detecta?</h4>
                  <p>Un sensor de presión de fondo (BPR) a 6.000 m de profundidad detecta la variación de presión de la columna de agua cuando pasa el tsunami. La diferencia es de apenas milímetros — pero es suficiente.</p>
                </div>
                <div className={styles.dartCard}>
                  <h4>¿Cómo comunica?</h4>
                  <p>El BPR transmite acústicamente a un módulo flotante en superficie, que a su vez envía los datos por satélite a los centros de análisis en tiempo real.</p>
                </div>
                <div className={styles.dartCard}>
                  <h4>¿Cuántas hay?</h4>
                  <p>La red global cuenta con más de 60 boyas DART distribuidas en el Pacífico, Atlántico y Caribe. Gestionadas por NOAA (EE.UU.) y homólogas internacionales.</p>
                </div>
              </div>
            </div>

            {/* Tiempo disponible */}
            <div className={styles.tiempoGrid}>
              <h3 className={styles.subTitle}>Tiempo Disponible para Evacuar</h3>
              <div className={styles.tiempoCards}>
                <div className={styles.tiempoCard} style={{ borderColor: '#D62839' }}>
                  <div className={styles.tiempoValor} style={{ color: '#D62839' }}>5–30 min</div>
                  <h4>Terremoto local</h4>
                  <p>Epicentro a menos de 100 km de la costa. La única estrategia viable: correr inmediatamente a terreno elevado. No esperes la alerta oficial.</p>
                </div>
                <div className={styles.tiempoCard} style={{ borderColor: '#F59E0B' }}>
                  <div className={styles.tiempoValor} style={{ color: '#F59E0B' }}>30 min – 12 h</div>
                  <h4>Terremoto lejano</h4>
                  <p>Epicentro a más de 500 km. El sistema de alerta tiene tiempo de funcionar. La evacuación ordenada siguiendo las vías señalizadas es posible.</p>
                </div>
                <div className={styles.tiempoCard} style={{ borderColor: '#48A9A6' }}>
                  <div className={styles.tiempoValor} style={{ color: '#48A9A6' }}>Años</div>
                  <h4>Preparación previa</h4>
                  <p>La mejor protección: conocer las vías de evacuación y los puntos de encuentro antes de que ocurra cualquier emergencia.</p>
                </div>
              </div>
            </div>

            {/* Regla de oro */}
            <div className={styles.reglaDoro}>
              <div className={styles.reglaIcono} aria-hidden="true">🛡️</div>
              <div>
                <h3 className={styles.reglaTitulo}>Regla de Oro ante un Terremoto Fuerte en la Costa</h3>
                <p className={styles.reglaDestacado}>&quot;Si el suelo tembló fuerte y estás en la costa → aléjate de inmediato hacia terreno alto sin esperar la alerta oficial.&quot;</p>
                <p>El tiempo entre el terremoto local y la llegada del tsunami puede ser de solo 5-10 minutos. Las alertas oficiales en terremotos locales llegan tarde. El movimiento sísmico intenso ES la alerta.</p>
                <p>2004 Océano Índico: sin sistema de alerta → 230.000 víctimas. 2011 Tōhoku: con sistema de alerta → muchos no lo siguieron → 16.000 víctimas.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Sección educativa */}
      <EducationalSection
        title="Profundiza en sismología y tsunamis"
        subtitle="Conceptos avanzados de geofísica y gestión de emergencias"
      >
        <div className={styles.educSection}>
          <h3>Isostasia: por qué la corteza &quot;flota&quot;</h3>
          <p>
            La corteza terrestre <strong>no descansa sobre el manto de forma rígida</strong>: está en equilibrio isostático, como bloques de madera flotando en agua con diferente densidad. Las montañas tienen &quot;raíces&quot; más profundas. Cuando se erosiona una cadena montañosa, la corteza se eleva lentamente (reajuste isostático). Este principio explica por qué Escandinavia todavía se eleva varios milímetros al año desde la última glaciación.
          </p>

          <h3>Diferencia entre terremoto y temblor</h3>
          <p>
            Coloquialmente, &quot;temblor&quot; suele referirse a sismos de baja intensidad y &quot;terremoto&quot; a los de alta. Técnicamente, la diferencia es de intensidad percibida (escala Mercalli), no de magnitud. Geológicamente, ambos son el mismo fenómeno. Un &quot;temblor&quot; de Mw 4 puede ser el precursor de una serie sísmica mayor o simplemente un evento aislado sin consecuencias.
          </p>

          <h3>El Cinturón de Fuego del Pacífico</h3>
          <p>
            El 90% de los terremotos del mundo y el 75% de los volcanes activos se concentran en el Cinturón de Fuego: un arco de ~40.000 km que rodea el océano Pacífico. Incluye las costas de América del Sur y del Norte, el Arco Aleutiano, Japón, Filipinas, Indonesia y Nueva Zelanda. La razón es que el fondo del Pacífico está rodeado de zonas de subducción activas donde las placas oceánicas se hunden bajo las continentales.
          </p>

          <h3>Licuefacción del suelo</h3>
          <p>
            En suelos saturados de agua (arcillas, arenas de ribera, zonas costeras), las ondas sísmicas pueden hacer que el suelo se comporte momentáneamente como un líquido: el proceso se llama <strong>licuefacción</strong>. Los edificios se hunden o se inclinan aunque estén bien construidos. Fue un factor determinante en el terremoto de Niigata (1964) y es un riesgo significativo en Tokio y muchas ciudades costeras. El ensayo SPT (Standard Penetration Test) evalúa el riesgo de licuefacción en estudios geotécnicos.
          </p>

          <h3>¿Pueden predecirse los terremotos?</h3>
          <p>
            La respuesta honesta es <strong>no, todavía no</strong>. Podemos identificar zonas de alto riesgo, estimar probabilidades a largo plazo (décadas) y detectar el inicio de un terremoto en segundos usando el sistema de alerta temprana sísmica (que da segundos de aviso para paralizar trenes, abrir puertas hospitalarias o parar cirugías). Pero la predicción de fecha, hora y magnitud exactas sigue siendo científicamente imposible. Cada &quot;método de predicción&quot; publicado en medios ha fallado sistemáticamente en las pruebas rigurosas.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota educativa:</strong> Este visualizador explica los principios de la sismología y la gestión de tsunamis con fines educativos. Ante una emergencia real, sigue siempre las instrucciones de las autoridades de protección civil de tu país.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-terremotos-tsunamis" />
      <Footer appName="visualizador-terremotos-tsunamis" />
    </div>
  );
}
