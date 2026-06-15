'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './MigracionGlobal.module.css';

// --- Tipos ---
type TipoFlujo = 'refugiados' | 'economica' | 'mixto';

interface Region {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  migrantes: string;
  descripcion: string;
}

interface Flujo {
  id: string;
  path: string;
  volumen: string;
  tipo: TipoFlujo;
  color: string;
  grosor: number;
  label: string;
}

interface FactorCard {
  icono: string;
  titulo: string;
  descripcion: string;
}

// --- Datos ---
const REGIONES: Region[] = [
  {
    id: 'europa',
    label: 'Europa',
    x: 430,
    y: 130,
    color: '#2E86AB',
    migrantes: '87M',
    descripcion:
      'Principal destino de refugiados de Ucrania, Siria y Afganistán. 87 millones de personas nacidas fuera de su país residen en Europa.',
  },
  {
    id: 'africa',
    label: 'África',
    x: 430,
    y: 360,
    color: '#E67E22',
    migrantes: '40M',
    descripcion:
      'Origen de importantes flujos hacia Europa (Mediterráneo) y destino de desplazados internos. 40 millones de migrantes internacionales.',
  },
  {
    id: 'america-norte',
    label: 'América del Norte',
    x: 130,
    y: 130,
    color: '#27AE60',
    migrantes: '59M',
    descripcion:
      'EEUU es el país con más migrantes del mundo (51M). El corredor México-EEUU es la ruta migratoria más transitada del planeta.',
  },
  {
    id: 'america-latina',
    label: 'América Latina',
    x: 150,
    y: 360,
    color: '#8E44AD',
    migrantes: '42M',
    descripcion:
      'Venezuela (7,7M en el exterior) genera la mayor crisis migratoria de América Latina. Colombia, Perú y Chile son principales destinos.',
  },
  {
    id: 'oriente-medio',
    label: 'Oriente Medio',
    x: 620,
    y: 190,
    color: '#C0392B',
    migrantes: '49M',
    descripcion:
      'Origen de 5,5M de refugiados sirios. Afganistán genera 6M de refugiados. Los países del Golfo tienen >70% de población migrante.',
  },
  {
    id: 'asia-pacifico',
    label: 'Asia-Pacífico',
    x: 750,
    y: 340,
    color: '#16A085',
    migrantes: '85M',
    descripcion:
      'India tiene la mayor diáspora del mundo (18M). Bangladesh, Filipinas y Nepal son grandes países de emigración económica.',
  },
];

const FLUJOS: Flujo[] = [
  {
    id: 'ucrania-europa',
    path: 'M 580 170 C 550 120 480 100 430 130',
    volumen: '6,5M',
    tipo: 'refugiados',
    color: '#E74C3C',
    grosor: 8,
    label: 'Ucrania → Europa: 6,5M refugiados (guerra 2022)',
  },
  {
    id: 'siria-europa',
    path: 'M 610 200 C 570 160 500 130 430 135',
    volumen: '5,5M',
    tipo: 'refugiados',
    color: '#E74C3C',
    grosor: 7,
    label: 'Siria → Europa: 5,5M refugiados',
  },
  {
    id: 'venezuela-norte',
    path: 'M 155 345 C 130 280 130 200 130 145',
    volumen: '7,7M',
    tipo: 'mixto',
    color: '#9B59B6',
    grosor: 9,
    label: 'Venezuela → Américas: 7,7M personas',
  },
  {
    id: 'afganistan-europa',
    path: 'M 730 330 C 650 250 550 190 430 140',
    volumen: '6M',
    tipo: 'refugiados',
    color: '#E74C3C',
    grosor: 7,
    label: 'Afganistán → Asia/Europa: 6M refugiados',
  },
  {
    id: 'latam-norteamerica',
    path: 'M 165 355 C 145 290 125 210 130 150',
    volumen: '12M',
    tipo: 'economica',
    color: '#2E86AB',
    grosor: 11,
    label: 'América Latina → Norteamérica: 12M (corredor México-EEUU)',
  },
  {
    id: 'africa-europa',
    path: 'M 440 340 C 440 280 435 200 430 145',
    volumen: '1M/año',
    tipo: 'mixto',
    color: '#F39C12',
    grosor: 4,
    label: 'África → Europa (Mediterráneo): ~1M intentos/año',
  },
  {
    id: 'asia-occidente',
    path: 'M 740 320 C 680 240 570 170 430 135',
    volumen: '8M',
    tipo: 'economica',
    color: '#2E86AB',
    grosor: 6,
    label: 'Asia → Europa+Norteamérica: 8M (migración económica)',
  },
];

const FACTORES_PUSH: FactorCard[] = [
  {
    icono: '🔴',
    titulo: 'Conflicto y violencia',
    descripcion: 'Guerras, persecución política y violencia sistemática obligan a millones a abandonar sus hogares.',
  },
  {
    icono: '📉',
    titulo: 'Pobreza y desigualdad',
    descripcion: 'La falta de oportunidades económicas y la brecha de ingresos entre países impulsa la migración laboral.',
  },
  {
    icono: '🌡️',
    titulo: 'Cambio climático y desastres',
    descripcion: 'Sequías, inundaciones y pérdida de tierras cultivables generan desplazamientos masivos.',
  },
  {
    icono: '🚫',
    titulo: 'Persecución y discriminación',
    descripcion: 'Minorías étnicas, religiosas o LGBTQ+ huyen de países con legislación o violencia en su contra.',
  },
];

const FACTORES_PULL: FactorCard[] = [
  {
    icono: '💼',
    titulo: 'Oportunidades de empleo',
    descripcion: 'Mercados laborales con demanda de trabajadores en sectores como sanidad, construcción o tecnología.',
  },
  {
    icono: '🏥',
    titulo: 'Acceso a servicios',
    descripcion: 'Países con sistemas de salud, educación y protección social más desarrollados atraen a familias.',
  },
  {
    icono: '👨‍👩‍👧',
    titulo: 'Redes familiares y comunidades',
    descripcion: 'La presencia de familiares o compatriotas en el destino facilita la integración y reduce el riesgo.',
  },
  {
    icono: '🕊️',
    titulo: 'Seguridad y estado de derecho',
    descripcion: 'Sistemas jurídicos estables, democracia y respeto de los DDHH como garantías de vida digna.',
  },
];

// Colores de marker por tipo
const MARKER_COLORS: Record<TipoFlujo, string> = {
  refugiados: '#E74C3C',
  economica: '#2E86AB',
  mixto: '#9B59B6',
};

export default function MigracionGlobalPage() {
  const [regionActiva, setRegionActiva] = useState<string | null>(null);
  const [flujoActivo, setFlujoActivo] = useState<string | null>(null);

  const regionDetalle = REGIONES.find((r) => r.id === regionActiva) ?? null;
  const flujoDetalle = FLUJOS.find((f) => f.id === flujoActivo) ?? null;

  const handleRegionClick = (id: string) => {
    setRegionActiva((prev) => (prev === id ? null : id));
    setFlujoActivo(null);
  };

  const handleFlujoClick = (id: string) => {
    setFlujoActivo((prev) => (prev === id ? null : id));
    setRegionActiva(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Flujos Migratorios Globales</h1>
        <p>Principales movimientos de población en el mundo — datos UNHCR/IOM 2024</p>
      </header>

      <LegalNotice />

      {/* Mapa SVG */}
      <section className={styles.mapaSection}>
        <p className={styles.mapaInstrucciones}>
          Haz clic en una región o flujo para ver más información
        </p>

        <div className={styles.mapaWrapper}>
          <svg
            viewBox="0 0 900 500"
            className={styles.mapaSvg}
            role="img"
            aria-label="Mapa de flujos migratorios globales"
          >
            <defs>
              {(['refugiados', 'economica', 'mixto'] as TipoFlujo[]).map((tipo) => (
                <marker
                  key={tipo}
                  id={`flecha-${tipo}`}
                  markerWidth={8}
                  markerHeight={8}
                  refX={6}
                  refY={3}
                  orient="auto"
                >
                  <path d="M 0 0 L 0 6 L 8 3 z" fill={MARKER_COLORS[tipo]} />
                </marker>
              ))}
            </defs>

            {/* Fondo sutil del mapa */}
            <rect x={0} y={0} width={900} height={500} fill="var(--bg-primary)" rx={8} />

            {/* Paths de flujos */}
            {FLUJOS.map((flujo) => (
              <path
                key={flujo.id}
                d={flujo.path}
                stroke={flujo.color}
                strokeWidth={flujo.grosor}
                fill="none"
                strokeOpacity={flujoActivo === flujo.id ? 1 : 0.6}
                markerEnd={`url(#flecha-${flujo.tipo})`}
                className={styles.flujoPath}
                onClick={() => handleFlujoClick(flujo.id)}
                role="button"
                aria-label={flujo.label}
                style={{ cursor: 'pointer' }}
              />
            ))}

            {/* Nodos de regiones */}
            {REGIONES.map((region) => (
              <g
                key={region.id}
                onClick={() => handleRegionClick(region.id)}
                className={styles.regionNodo}
                role="button"
                aria-label={`${region.label}: ${region.migrantes} migrantes internacionales`}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={region.x}
                  cy={region.y}
                  r={40}
                  fill={region.color}
                  opacity={regionActiva === region.id ? 1 : 0.82}
                  stroke={regionActiva === region.id ? '#ffffff' : 'transparent'}
                  strokeWidth={3}
                />
                <text
                  x={region.x}
                  y={region.y - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="700"
                  fill="#ffffff"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {region.label.split(' ').length > 2
                    ? region.label.split(' ').slice(0, 2).join(' ')
                    : region.label}
                </text>
                {region.label.split(' ').length > 2 && (
                  <text
                    x={region.x}
                    y={region.y + 5}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight="700"
                    fill="#ffffff"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {region.label.split(' ').slice(2).join(' ')}
                  </text>
                )}
                <text
                  x={region.x}
                  y={region.y + 18}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="600"
                  fill="#ffffff"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {region.migrantes}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Leyenda del mapa */}
        <div className={styles.leyenda}>
          <div className={styles.leyendaItem}>
            <span className={styles.leyendaLinea} style={{ backgroundColor: '#E74C3C' }} />
            <span>Refugiados / Crisis humanitaria</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={styles.leyendaLinea} style={{ backgroundColor: '#2E86AB' }} />
            <span>Migración económica</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={styles.leyendaLinea} style={{ backgroundColor: '#9B59B6' }} />
            <span>Mixto</span>
          </div>
        </div>
      </section>

      {/* Panel detalle región */}
      {regionDetalle && (
        <div className={styles.panelDetalle} role="region" aria-label={`Detalle de ${regionDetalle.label}`}>
          <button
            type="button"
            onClick={() => setRegionActiva(null)}
            className={styles.btnCerrar}
            aria-label="Cerrar panel de detalle"
          >
            ✕
          </button>
          <h3 style={{ color: regionDetalle.color }}>{regionDetalle.label}</h3>
          <p className={styles.cifraDestacada}>{regionDetalle.migrantes} migrantes internacionales</p>
          <p>{regionDetalle.descripcion}</p>
        </div>
      )}

      {/* Panel detalle flujo */}
      {flujoDetalle && (
        <div className={styles.panelDetalle} role="region" aria-label={`Detalle de flujo migratorio`}>
          <button
            type="button"
            onClick={() => setFlujoActivo(null)}
            className={styles.btnCerrar}
            aria-label="Cerrar panel de flujo"
          >
            ✕
          </button>
          <h3>Flujo migratorio</h3>
          <p className={styles.cifraDestacada}>{flujoDetalle.volumen} personas</p>
          <p>{flujoDetalle.label}</p>
          <span
            className={styles.tipoBadge}
            style={{
              backgroundColor:
                flujoDetalle.tipo === 'refugiados'
                  ? '#fdecea'
                  : flujoDetalle.tipo === 'economica'
                  ? '#e8f4f8'
                  : '#f3e8ff',
              color: MARKER_COLORS[flujoDetalle.tipo],
            }}
          >
            {flujoDetalle.tipo === 'refugiados'
              ? 'Refugiados / Crisis humanitaria'
              : flujoDetalle.tipo === 'economica'
              ? 'Migración económica'
              : 'Flujo mixto'}
          </span>
        </div>
      )}

      {/* Insight box */}
      <div className={styles.insightBox} role="note">
        <p>
          En 2024, más de{' '}
          <strong>117 millones</strong> de personas estaban desplazadas forzosamente en el mundo
          — la cifra más alta jamás registrada.
        </p>
        <p className={styles.insightFuente}>UNHCR Global Trends Report, 2024</p>
      </div>

      {/* Comparativa: Refugiados vs Migrantes Económicos */}
      <section className={styles.comparativaSection}>
        <h2>¿Refugiado o migrante económico?</h2>
        <p className={styles.sectionSubtitulo}>
          Dos realidades distintas con marcos legales y derechos diferentes
        </p>
        <div className={styles.comparativaGrid}>
          {/* Refugiados */}
          <div className={`${styles.comparativaColumna} ${styles.columnaRefugiados}`}>
            <h3 className={styles.comparativaTitulo}>
              <span aria-hidden="true">🔴</span> Refugiados
            </h3>
            <dl className={styles.comparativaLista}>
              <dt>Definición</dt>
              <dd>
                Personas que huyen de conflictos armados, persecución o violaciones graves de
                Derechos Humanos. No pueden regresar a su país de origen con seguridad.
              </dd>
              <dt>Marco legal</dt>
              <dd>Convención de Ginebra 1951 y Protocolo 1967. Derecho de non-refoulement (no devolución).</dd>
              <dt>Origen principal</dt>
              <dd>Siria, Ucrania, Afganistán, Sudán, Myanmar</dd>
              <dt>Cifra 2024</dt>
              <dd className={styles.comparativaCifra}>62,5 millones de refugiados reconocidos</dd>
            </dl>
          </div>

          {/* Migrantes económicos */}
          <div className={`${styles.comparativaColumna} ${styles.columnaEconomica}`}>
            <h3 className={styles.comparativaTitulo}>
              <span aria-hidden="true">🔵</span> Migrantes económicos
            </h3>
            <dl className={styles.comparativaLista}>
              <dt>Definición</dt>
              <dd>
                Personas que se desplazan voluntariamente buscando mejores oportunidades laborales,
                educativas o de calidad de vida.
              </dd>
              <dt>Marco legal</dt>
              <dd>Varía por país — visados de trabajo, permisos de residencia. Sin protección internacional automática.</dd>
              <dt>Origen principal</dt>
              <dd>India, México, Filipinas, Bangladesh, China</dd>
              <dt>Dato clave</dt>
              <dd className={styles.comparativaCifra}>
                860.000 millones $ en remesas enviadas a países de origen en 2023 (Banco Mundial)
              </dd>
            </dl>
          </div>
        </div>
      </section>

      {/* Push/Pull Factors */}
      <section className={styles.factoresSection}>
        <h2>¿Por qué migra la gente?</h2>
        <p className={styles.sectionSubtitulo}>
          Los factores de expulsión (push) y atracción (pull) que explican la migración internacional
        </p>
        <div className={styles.factoresGrid}>
          {/* Push */}
          <div className={styles.factoresGrupo}>
            <h3 className={styles.factoresGrupoTitulo}>
              <span aria-hidden="true">⬆️</span> Factores PUSH — por qué se va la gente
            </h3>
            <div className={styles.tarjetasGrid}>
              {FACTORES_PUSH.map((factor) => (
                <div key={factor.titulo} className={`${styles.tarjeta} ${styles.tarjetaPush}`}>
                  <span className={styles.tarjetaIcono} aria-hidden="true">
                    {factor.icono}
                  </span>
                  <h4 className={styles.tarjetaTitulo}>{factor.titulo}</h4>
                  <p className={styles.tarjetaTexto}>{factor.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pull */}
          <div className={styles.factoresGrupo}>
            <h3 className={styles.factoresGrupoTitulo}>
              <span aria-hidden="true">⬇️</span> Factores PULL — por qué eligen ese destino
            </h3>
            <div className={styles.tarjetasGrid}>
              {FACTORES_PULL.map((factor) => (
                <div key={factor.titulo} className={`${styles.tarjeta} ${styles.tarjetaPull}`}>
                  <span className={styles.tarjetaIcono} aria-hidden="true">
                    {factor.icono}
                  </span>
                  <h4 className={styles.tarjetaTitulo}>{factor.titulo}</h4>
                  <p className={styles.tarjetaTexto}>{factor.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="Migración global: contexto y tendencias"
        subtitle="Historia, derecho internacional y el impacto económico de la migración"
        defaultOpen={false}
      >
        <p>
          La migración internacional es un fenómeno tan antiguo como la humanidad. Sin embargo,
          la escala actual —más de 281 millones de migrantes internacionales (3,6% de la
          población mundial)— es históricamente inédita y refleja tanto la globalización económica
          como el incremento de los conflictos y los efectos del cambio climático.
        </p>

        <h4>El sistema internacional de protección de refugiados</h4>
        <p>
          El sistema moderno de protección nació tras la Segunda Guerra Mundial con la{' '}
          <strong>Convención de Ginebra de 1951</strong>, que definió quién es un refugiado y
          estableció el principio de non-refoulement: ningún país puede devolver a una persona a
          un territorio donde su vida o libertad esté amenazada. El Alto Comisionado de Naciones
          Unidas para los Refugiados (ACNUR/UNHCR) supervisa su aplicación en 135 países.
        </p>

        <h4>Migración y desarrollo: el papel de las remesas</h4>
        <p>
          Las remesas enviadas por migrantes a sus países de origen superan en valor a la
          Ayuda Oficial al Desarrollo. En 2023, los migrantes enviaron{' '}
          <strong>860.000 millones de dólares</strong> a sus familias (Banco Mundial), cifra que
          triplica la AOD total y representa más del 20% del PIB en países como El Salvador,
          Nepal o Tonga. Las remesas son uno de los principales mecanismos de reducción de la
          pobreza a nivel global.
        </p>

        <h4>La crisis venezolana: la mayor diáspora de América Latina</h4>
        <p>
          Con 7,7 millones de personas fuera de su país, Venezuela protagoniza la mayor crisis
          migratoria del hemisferio occidental. A diferencia de los refugiados sirios o
          ucranianos, la mayoría de los venezolanos no tienen reconocimiento formal de refugiado
          pero sí están en situación de protección temporal en países como Colombia (2,9M),
          Perú (1,5M) o Ecuador (0,5M).
        </p>

        <h4>Migración climática: el reto del siglo XXI</h4>
        <p>
          El Banco Mundial estima que el cambio climático podría generar hasta{' '}
          <strong>216 millones de desplazados internos</strong> para 2050 en las regiones más
          vulnerables (África subsahariana, Asia meridional, América Latina). Sin embargo,
          los migrantes climáticos no tienen aún reconocimiento legal bajo el derecho internacional,
          lo que crea una laguna jurídica crítica.
        </p>

        <div className={styles.warningBox}>
          <strong>Fuentes:</strong> UNHCR Global Trends Report 2024, IOM World Migration Report
          2024, Banco Mundial Remittances 2023, OIT Labour Migration Statistics. Los datos son
          estimaciones y pueden variar según metodología y fuente. Las fronteras del mapa son
          esquemáticas y no reflejan posiciones políticas.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-migracion-global')} />
      <ShareCard appName="visualizador-migracion-global" />
      <Footer appName="visualizador-migracion-global" />
    </div>
  );
}
