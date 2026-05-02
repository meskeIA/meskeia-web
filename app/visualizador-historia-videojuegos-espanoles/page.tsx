'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './HistoriaVideojuegosEs.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoVideojuegosEs {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  hito: string;
  estudio: string;
  juego: string;
  impacto: string;
  datos: string;
  categoria:
    | 'pioneros'
    | 'edad_oro'
    | 'clasicos'
    | 'crisis'
    | 'renacimiento'
    | 'mainstream'
    | 'indie_temprano'
    | 'aa_estudios'
    | 'exitos_globales'
    | 'ia_futuro';
}

interface Era {
  nombre: string;
  anios: string;
  descripcion: string;
  hitos: string[];
  color: string;
}

// ─────────────────────────────────────────────
// Colores por categoría
// ─────────────────────────────────────────────

const COLORES_CATEGORIA: Record<PeriodoVideojuegosEs['categoria'], string> = {
  pioneros: '#8B4513',
  edad_oro: '#FFD700',
  clasicos: '#FF8C00',
  crisis: '#DC143C',
  renacimiento: '#228B22',
  mainstream: '#4169E1',
  indie_temprano: '#9370DB',
  aa_estudios: '#2E86AB',
  exitos_globales: '#48A9A6',
  ia_futuro: '#7B68EE',
};

const ETIQUETAS_CATEGORIA: Record<PeriodoVideojuegosEs['categoria'], string> = {
  pioneros: 'Pioneros',
  edad_oro: 'Edad de Oro',
  clasicos: 'Clásicos',
  crisis: 'Crisis',
  renacimiento: 'Renacimiento',
  mainstream: 'Mainstream',
  indie_temprano: 'Indie Temprano',
  aa_estudios: 'AA Estudios',
  exitos_globales: 'Éxitos Globales',
  ia_futuro: 'IA y Futuro',
};

// ─────────────────────────────────────────────
// Datos de períodos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoVideojuegosEs[] = [
  {
    id: 1,
    periodo: '1983–1985',
    anio: 1983,
    anioFin: 1985,
    titulo: 'Los Pioneros Autodidactas',
    descripcion:
      'Primeros programadores españoles en Spectrum y MSX que aprenden copiando código de revistas. Nacen los primeros juegos comerciales hechos en España, sin recursos ni formación oficial.',
    hito: 'Yenght (1983, Grupo de Trabajo Software) — primer juego español con distribución comercial',
    estudio: 'Grupo de Trabajo Software',
    juego: 'Yenght (1983)',
    impacto: 'Inicio de la industria nacional, cultura DIY',
    datos: 'Equipos: Spectrum 48K, MSX; precio: 500–800 pesetas por cinta',
    categoria: 'pioneros',
  },
  {
    id: 2,
    periodo: '1985–1987',
    anio: 1985,
    anioFin: 1987,
    titulo: 'Nace la Edad de Oro',
    descripcion:
      'Dinamic Software y Opera Soft se convierten en los primeros estudios profesionales. Abu Simbel Profanation se vende en el Reino Unido, primer éxito internacional del videojuego español.',
    hito: 'Abu Simbel Profanation (Dinamic, 1985) — distribuido en UK por Gremlin Graphics',
    estudio: 'Dinamic Software',
    juego: 'Abu Simbel Profanation (1985)',
    impacto: 'Primera exportación de videojuego español al mercado anglosajón',
    datos: 'Precio: 495 pesetas; vendido también en UK, Alemania, Francia',
    categoria: 'edad_oro',
  },
  {
    id: 3,
    periodo: '1987–1989',
    anio: 1987,
    anioFin: 1989,
    titulo: 'Cumbre de la Edad de Oro',
    descripcion:
      'La Abadía del Crimen (Opera Soft, 1987), inspirada en El Nombre de la Rosa de Umberto Eco, es considerada la obra cumbre del videojuego español clásico. El sector alcanza su máxima producción y reconocimiento europeo.',
    hito: 'La Abadía del Crimen (Opera Soft, 1987) — elegido mejor juego español del siglo XX',
    estudio: 'Opera Soft',
    juego: 'La Abadía del Crimen (1987)',
    impacto: 'Reconocimiento artístico internacional; referente de diseño narrativo para la época',
    datos: 'Desarrollado por Paco Menéndez y Juan Delcán; para Spectrum y Amstrad',
    categoria: 'clasicos',
  },
  {
    id: 4,
    periodo: '1989–1992',
    anio: 1989,
    anioFin: 1992,
    titulo: 'El Crepúsculo Dorado',
    descripcion:
      'La llegada de Amiga y Atari ST exige mayores capacidades técnicas y económicas. Topo Soft mantiene el pulso con títulos exitosos, pero el cambio tecnológico comienza a presionar a los estudios más pequeños.',
    hito: 'Desperado (Topo Soft, 1989) — millones de copias en España y Europa',
    estudio: 'Topo Soft',
    juego: 'Desperado (1989)',
    impacto: 'Transición tecnológica; mercado europeo más exigente',
    datos: 'Amiga 500 cuesta 100.000 pesetas; barrera de entrada sube drásticamente',
    categoria: 'clasicos',
  },
  {
    id: 5,
    periodo: '1992–1995',
    anio: 1992,
    anioFin: 1995,
    titulo: 'La Gran Crisis',
    descripcion:
      'La era 16-bit y el PC exigen inversiones imposibles para los estudios de la Edad de Oro. Opera Soft cierra. La mayoría de los estudios pioneros desaparecen. España queda fuera del mapa internacional durante años.',
    hito: 'Cierre de Opera Soft (1992) — fin oficial de la Edad de Oro',
    estudio: 'Varios estudios en liquidación',
    juego: '(Sin hito destacado — período de crisis)',
    impacto: 'Destrucción del tejido industrial; pérdida de talento hacia otros sectores',
    datos: 'De ~30 estudios activos en 1989 a menos de 5 en 1994',
    categoria: 'crisis',
  },
  {
    id: 6,
    periodo: '1995–1999',
    anio: 1995,
    anioFin: 1999,
    titulo: 'Renacimiento con PC',
    descripcion:
      'PC Fútbol (Dinamic Multimedia) domina el mercado español con millones de copias. Pyro Studios se funda en 1996 y lanza Commandos: Behind Enemy Lines en 1998, poniendo a España de nuevo en el mapa mundial.',
    hito: 'Commandos: Behind Enemy Lines (Pyro Studios, 1998) — más de 1 millón de copias',
    estudio: 'Pyro Studios',
    juego: 'Commandos: Behind Enemy Lines (1998)',
    impacto: 'Primera vez que un estudio español conquista el mercado PC internacional de forma masiva',
    datos: 'Commandos vendió +1M copias; traducido a 8 idiomas; puntuaciones de 90/100 en prensa especializada',
    categoria: 'renacimiento',
  },
  {
    id: 7,
    periodo: '1999–2003',
    anio: 1999,
    anioFin: 2003,
    titulo: 'La Era Pyro Studios',
    descripcion:
      'Commandos 2: Men of Courage (2001) supera los 2 millones de copias. Pyro Studios se convierte en el primer estudio español con fama global consolidada. España aparece en el mapa de la industria internacional.',
    hito: 'Commandos 2: Men of Courage (2001) — 2 millones de copias, nominado a BAFTA',
    estudio: 'Pyro Studios',
    juego: 'Commandos 2: Men of Courage (2001)',
    impacto: 'Referente mundial del género táctico en tiempo real',
    datos: 'Commandos 2: +2M copias; Commandos 3 (2003) recibimiento más frío',
    categoria: 'mainstream',
  },
  {
    id: 8,
    periodo: '2003–2008',
    anio: 2003,
    anioFin: 2008,
    titulo: 'Diversificación y Nuevos Estudios',
    descripcion:
      'Pyro Studios declina tras Commandos 3. Emergen Virtual Toys, Digital Legends y los primeros juegos para móviles J2ME. La industria se diversifica pero pierde el liderazgo internacional que tuvo con Commandos.',
    hito: 'Digital Legends Entertainment fundada (2003) — primer estudio español enfocado en móvil',
    estudio: 'Digital Legends / Virtual Toys',
    juego: 'Varios títulos J2ME para Nokia y Motorola',
    impacto: 'Pioneros en el desarrollo para móvil en España',
    datos: 'Mercado J2ME: 1.000–3.000€ por título; muy bajos márgenes',
    categoria: 'indie_temprano',
  },
  {
    id: 9,
    periodo: '2008–2012',
    anio: 2008,
    anioFin: 2012,
    titulo: 'Era HD y Nuevas Generaciones',
    descripcion:
      'MercurySteam (fundada en 2002) emerge con fuerza en la era HD con Clive Barker\'s Jericho y co-desarrolla Castlevania: Lords of Shadow con Konami (2010), considerado uno de los mejores juegos de la generación. Tequila Works se funda en 2009.',
    hito: 'Castlevania: Lords of Shadow (MercurySteam/Konami, 2010) — premiado internacionalmente',
    estudio: 'MercurySteam',
    juego: 'Castlevania: Lords of Shadow (2010)',
    impacto: 'Primer estudio español en co-desarrollar un AAA con gran editorial japonesa',
    datos: 'Lords of Shadow: 9/10 en IGN; más de 1M copias; presupuesto ~10M€',
    categoria: 'aa_estudios',
  },
  {
    id: 10,
    periodo: '2012–2016',
    anio: 2012,
    anioFin: 2016,
    titulo: 'Renaissance Indie Española',
    descripcion:
      'Kickstarter y Steam Greenlight democratizan el desarrollo. Nacen Fictiorama Studios y Nomada Studio. MercurySteam co-desarrolla Metroid: Samus Returns con Nintendo (2017). El indie español gana visibilidad internacional.',
    hito: 'Metroid: Samus Returns (MercurySteam/Nintendo, 2017) — primer Metroid en 3DS',
    estudio: 'Fictiorama Studios / Nomada Studio',
    juego: 'Do Not Feed the Monkeys (2018)',
    impacto: 'Relación directa con Nintendo; referente del indie europeo',
    datos: 'Do Not Feed the Monkeys: 4.6/5 en Metacritic (usuarios); Samus Returns: 85/100',
    categoria: 'indie_temprano',
  },
  {
    id: 11,
    periodo: '2016–2019',
    anio: 2016,
    anioFin: 2019,
    titulo: 'Identidad Propia',
    descripcion:
      'Rime (Tequila Works, 2017), Gris (Nomada Studio / Devolver Digital, 2018) y Blasphemous (The Game Kitchen, 2019) consolidan la identidad artística del videojuego español. España se convierte en referente europeo del indie de autor.',
    hito: 'Blasphemous (The Game Kitchen, 2019) — estética sevillana y cultura española, millón de copias',
    estudio: 'The Game Kitchen',
    juego: 'Blasphemous (2019)',
    impacto: 'Identidad cultural española en videojuego reconocida mundialmente',
    datos: 'Blasphemous: +1M copias; Gris: +1M copias, nominado a BAFTA; financiado en Kickstarter con 330K€',
    categoria: 'exitos_globales',
  },
  {
    id: 12,
    periodo: '2019–2022',
    anio: 2019,
    anioFin: 2022,
    titulo: 'Explosión Global',
    descripcion:
      'Metroid Dread (MercurySteam/Nintendo, 2021) se convierte en el primer Metroid mainline en 19 años, GOTY candidato y éxito de ventas masivo. Blasphemous sigue creciendo. España es reconocida en The Game Awards.',
    hito: 'Metroid Dread (MercurySteam/Nintendo, 2021) — nominado a GOTY en The Game Awards',
    estudio: 'MercurySteam',
    juego: 'Metroid Dread (2021)',
    impacto: 'España en la conversación GOTY mundial por primera vez',
    datos: 'Metroid Dread: +2,74M copias; 88/100 Metacritic; GOTY en múltiples publicaciones',
    categoria: 'exitos_globales',
  },
  {
    id: 13,
    periodo: '2022–2024',
    anio: 2022,
    anioFin: 2024,
    titulo: 'Madurez del Sector',
    descripcion:
      'Blasphemous II (The Game Kitchen, 2023) demuestra la madurez de los estudios españoles. España se consolida como hub europeo de videojuegos. DEV y AEVI trabajan para mejorar el ecosistema. Creciente inversión extranjera en estudios españoles.',
    hito: 'Blasphemous II (The Game Kitchen, 2023) — continuación aclamada del original',
    estudio: 'The Game Kitchen',
    juego: 'Blasphemous II (2023)',
    impacto: 'Consolidación del modelo de estudio indie-AA español con IP propia',
    datos: 'Sector videojuegos España: 450M€ en 2023; 850+ empresas; 8.000+ empleados',
    categoria: 'aa_estudios',
  },
  {
    id: 14,
    periodo: '2024–hoy',
    anio: 2024,
    anioFin: 2025,
    titulo: 'IA y Futuro',
    descripcion:
      'Las herramientas de IA (Stable Diffusion para concept art, AI en NPCs) transforman el flujo de trabajo. Estudios españoles desarrollan proyectos ambiciosos. España produce el 4% de los videojuegos europeos con perspectivas de crecimiento.',
    hito: 'España: 4% de la producción europea de videojuegos (AEVI, 2024)',
    estudio: 'Múltiples estudios emergentes',
    juego: 'Proyectos en desarrollo con IA generativa',
    impacto: 'Posicionamiento estratégico en el mercado europeo del futuro',
    datos: '450M€ sector; 850+ empresas; 8.000+ empleados directos; +15% crecimiento anual',
    categoria: 'ia_futuro',
  },
];

// ─────────────────────────────────────────────
// Datos de eras (Tab 4)
// ─────────────────────────────────────────────

const ERAS: Era[] = [
  {
    nombre: 'Era Pionera',
    anios: '1983–1988',
    descripcion:
      'La Edad de Oro española del videojuego. Autodidactas con Spectrum y MSX crean los primeros juegos comerciales. Dinamic Software y Opera Soft lideran la escena europea.',
    hitos: [
      'Yenght (1983) — primer juego español con distribución comercial',
      'Abu Simbel Profanation (1985) — primer éxito de exportación',
      'La Abadía del Crimen (1987) — obra cumbre del período',
    ],
    color: '#8B4513',
  },
  {
    nombre: 'Era Amiga y Crisis',
    anios: '1989–1994',
    descripcion:
      'La transición tecnológica hacia Amiga, Atari ST y PC eleva la barrera de entrada. La mayoría de los estudios de la Edad de Oro cierran. Opera Soft desaparece en 1992.',
    hitos: [
      'Desperado (1989) — uno de los últimos grandes éxitos de Topo Soft',
      'Cierre de Opera Soft (1992) — fin de la Edad de Oro',
      'De ~30 estudios activos a menos de 5 en pocos años',
    ],
    color: '#DC143C',
  },
  {
    nombre: 'Era Pyro',
    anios: '1995–2007',
    descripcion:
      'El PC relanza la industria española. PC Fútbol domina el mercado local. Pyro Studios conquista el mundo con Commandos, el primer estudio español de fama global.',
    hitos: [
      'Commandos: Behind Enemy Lines (1998) — +1M de copias',
      'Commandos 2 (2001) — +2M copias, nominado a BAFTA',
      'PC Fútbol — millones de copias en España',
    ],
    color: '#228B22',
  },
  {
    nombre: 'Era HD y Nuevas Generaciones',
    anios: '2008–2015',
    descripcion:
      'MercurySteam y Tequila Works emergen con fuerza en la era de Xbox 360 y PS3. Co-desarrollo con grandes editoriales internacionales. Primeros pasos en desarrollo para móvil moderno.',
    hitos: [
      'Castlevania: Lords of Shadow (2010) — co-desarrollo con Konami',
      'Tequila Works fundada (2009)',
      'Primeros juegos para App Store y Google Play',
    ],
    color: '#4169E1',
  },
  {
    nombre: 'Era Indie y Reconocimiento',
    anios: '2016–2021',
    descripcion:
      'España se convierte en referente europeo del videojuego indie de autor. Blasphemous, Gris, Rime y Metroid Dread ponen al país en el mapa mundial. Candidaturas a GOTY en The Game Awards.',
    hitos: [
      'Blasphemous (2019) — identidad cultural española, +1M copias',
      'Gris (2018) — nominado a BAFTA, aclamado artísticamente',
      'Metroid Dread (2021) — nominado GOTY, +2,74M copias',
    ],
    color: '#48A9A6',
  },
  {
    nombre: 'Era Madurez',
    anios: '2022–hoy',
    descripcion:
      'El sector alcanza 450M€ en 2023. España es hub europeo con 850+ empresas. La IA generativa transforma el flujo de trabajo. Proyectos AAA en desarrollo por estudios españoles.',
    hitos: [
      'Blasphemous II (2023) — consolidación de IP española de éxito',
      '450M€ y 8.000+ empleados directos en el sector',
      'España: 4% de la producción europea de videojuegos',
    ],
    color: '#7B68EE',
  },
];

// ─────────────────────────────────────────────
// Constantes SVG
// ─────────────────────────────────────────────

const ANIO_MIN = 1983;
const ANIO_MAX = 2025;
const SVG_PADDING_LEFT = 60;
const SVG_PADDING_RIGHT = 40;
const SVG_ANCHO_POR_PERIODO = 120;
const SVG_ALTO = 220;

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function HistoriaVideojuegosEspanoles() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoVideojuegosEs | null>(null);

  const svgAncho = PERIODOS.length * SVG_ANCHO_POR_PERIODO + SVG_PADDING_LEFT + SVG_PADDING_RIGHT;

  const lineaY = SVG_ALTO / 2;

  function xParaAnio(anio: number): number {
    const rango = ANIO_MAX - ANIO_MIN;
    return SVG_PADDING_LEFT + ((anio - ANIO_MIN) / rango) * (svgAncho - SVG_PADDING_LEFT - SVG_PADDING_RIGHT);
  }

  function handlePeriodoClick(p: PeriodoVideojuegosEs) {
    setPeriodoSeleccionado(p);
    setTabActiva('detalle');
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de los Videojuegos Españoles</h1>
        <p className={styles.heroSubtitle}>
          Desde la Edad de Oro del Spectrum hasta Metroid Dread y Blasphemous
        </p>
      </header>

      <div className={styles.legalWrapper}>
        <LegalNotice />
      </div>

      {/* ── Pestañas ── */}
      <div className={styles.tabs} role="tablist" aria-label="Secciones de la cronología">
        {(
          [
            { id: 'timeline', label: 'Línea Temporal' },
            { id: 'detalle', label: 'Detalle' },
            { id: 'comparativa', label: 'Comparativa' },
            { id: 'contexto', label: 'Contexto Histórico' },
          ] as { id: TabActiva; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tabActiva === t.id}
            className={`${styles.tab} ${tabActiva === t.id ? styles.tabActive : ''}`}
            onClick={() => setTabActiva(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Timeline SVG ── */}
      {tabActiva === 'timeline' && (
        <section className={styles.timelineContainer} aria-label="Línea temporal">
          <div className={styles.timelineWrapper}>
            <svg
              className={styles.timelineSvg}
              width={svgAncho}
              height={SVG_ALTO}
              viewBox={`0 0 ${svgAncho} ${SVG_ALTO}`}
              aria-label="Cronología de los videojuegos españoles"
            >
              {/* Línea base */}
              <line
                x1={SVG_PADDING_LEFT}
                y1={lineaY}
                x2={svgAncho - SVG_PADDING_RIGHT}
                y2={lineaY}
                stroke="#ccc"
                strokeWidth={2}
              />

              {/* Marcas de años */}
              {[1983, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025].map((anio) => {
                const x = xParaAnio(anio);
                return (
                  <g key={anio}>
                    <line x1={x} y1={lineaY - 6} x2={x} y2={lineaY + 6} stroke="#999" strokeWidth={1} />
                    <text
                      x={x}
                      y={lineaY + 22}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#999"
                    >
                      {anio}
                    </text>
                  </g>
                );
              })}

              {/* Períodos */}
              {PERIODOS.map((p, idx) => {
                const xCentro = xParaAnio(p.anio + (p.anioFin - p.anio) / 2);
                const arriba = idx % 2 === 0;
                const circleY = lineaY;
                const textoY = arriba ? lineaY - 50 : lineaY + 55;
                const lineaTextoY1 = arriba ? lineaY - 12 : lineaY + 12;
                const lineaTextoY2 = arriba ? lineaY - 40 : lineaY + 45;
                const color = COLORES_CATEGORIA[p.categoria];

                return (
                  <g
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handlePeriodoClick(p)}
                    role="button"
                    aria-label={`${p.titulo} (${p.periodo})`}
                  >
                    {/* Línea al texto */}
                    <line
                      x1={xCentro}
                      y1={lineaTextoY1}
                      x2={xCentro}
                      y2={lineaTextoY2}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeDasharray="3,2"
                    />
                    {/* Círculo */}
                    <circle
                      cx={xCentro}
                      cy={circleY}
                      r={9}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    {/* Etiqueta */}
                    <text
                      x={xCentro}
                      y={textoY}
                      textAnchor="middle"
                      fontSize={9}
                      fill={color}
                      fontWeight="600"
                    >
                      {p.anio}
                    </text>
                    <text
                      x={xCentro}
                      y={textoY + 12}
                      textAnchor="middle"
                      fontSize={8}
                      fill="#666"
                    >
                      {p.titulo.split(' ').slice(0, 3).join(' ')}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Leyenda */}
          <div className={styles.timelineLeyenda} role="list" aria-label="Leyenda de categorías">
            {(Object.entries(COLORES_CATEGORIA) as [PeriodoVideojuegosEs['categoria'], string][]).map(
              ([cat, color]) => (
                <div key={cat} className={styles.leyendaItem} role="listitem">
                  <span
                    className={styles.leyendaDot}
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  {ETIQUETAS_CATEGORIA[cat]}
                </div>
              )
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Haz clic en cualquier período para ver el detalle completo.
          </p>
        </section>
      )}

      {/* ── Tab 2: Detalle ── */}
      {tabActiva === 'detalle' && (
        <section className={styles.detalleContainer} aria-label="Detalle del período">
          {!periodoSeleccionado ? (
            <p className={styles.detalleVacio}>
              Selecciona un período en la línea temporal para ver su detalle.
            </p>
          ) : (
            <div className={styles.detalleCard}>
              <div className={styles.detalleHeader}>
                <span
                  className={styles.detalleBadge}
                  style={{ background: COLORES_CATEGORIA[periodoSeleccionado.categoria] }}
                >
                  {ETIQUETAS_CATEGORIA[periodoSeleccionado.categoria]}
                </span>
                <div>
                  <h2 className={styles.detalleTitulo}>{periodoSeleccionado.titulo}</h2>
                  <p className={styles.detalleAnios}>{periodoSeleccionado.periodo}</p>
                </div>
              </div>

              <div className={styles.detalleGrid}>
                <div className={styles.detalleItem}>
                  <p className={styles.detalleItemLabel}>Estudio clave</p>
                  <p className={styles.detalleItemValue}>{periodoSeleccionado.estudio}</p>
                </div>
                <div className={styles.detalleItem}>
                  <p className={styles.detalleItemLabel}>Juego emblemático</p>
                  <p className={styles.detalleItemValue}>{periodoSeleccionado.juego}</p>
                </div>
                <div className={styles.detalleItem}>
                  <p className={styles.detalleItemLabel}>Impacto</p>
                  <p className={styles.detalleItemValue}>{periodoSeleccionado.impacto}</p>
                </div>
                <div className={styles.detalleItem}>
                  <p className={styles.detalleItemLabel}>Datos</p>
                  <p className={styles.detalleItemValue}>{periodoSeleccionado.datos}</p>
                </div>
              </div>

              <p className={styles.detalleDescripcion}>{periodoSeleccionado.descripcion}</p>

              <div className={styles.detalleHito}>
                <strong>Hito:</strong> {periodoSeleccionado.hito}
              </div>
            </div>
          )}

          {/* Lista de períodos seleccionables */}
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Selecciona otro período:
            </p>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
              role="list"
            >
              {PERIODOS.map((p) => (
                <button
                  key={p.id}
                  role="listitem"
                  onClick={() => setPeriodoSeleccionado(p)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    border: `2px solid ${COLORES_CATEGORIA[p.categoria]}`,
                    background:
                      periodoSeleccionado?.id === p.id ? COLORES_CATEGORIA[p.categoria] : 'transparent',
                    color:
                      periodoSeleccionado?.id === p.id ? '#fff' : COLORES_CATEGORIA[p.categoria],
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {p.anio}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tab 3: Comparativa ── */}
      {tabActiva === 'comparativa' && (
        <section className={styles.comparativaContainer} aria-label="Comparativa de períodos">
          <div className={styles.comparativaGrid}>
            {PERIODOS.map((p) => (
              <article
                key={p.id}
                className={styles.comparativaCard}
                style={{ borderTopColor: COLORES_CATEGORIA[p.categoria] }}
                onClick={() => {
                  setPeriodoSeleccionado(p);
                  setTabActiva('detalle');
                }}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalle de ${p.titulo}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setPeriodoSeleccionado(p);
                    setTabActiva('detalle');
                  }
                }}
              >
                <p className={styles.comparativaNombre}>{p.titulo}</p>
                <p className={styles.comparativaAnios}>{p.periodo}</p>
                <p className={styles.comparativaJuego}>
                  <strong>Juego:</strong> {p.juego}
                </p>
                <p className={styles.comparativaEstudio}>{p.estudio}</p>
                <p className={styles.comparativaImpacto}>{p.impacto}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Tab 4: Contexto Histórico (eras) ── */}
      {tabActiva === 'contexto' && (
        <section className={styles.erasContainer} aria-label="Contexto histórico por eras">
          <p className={styles.erasIntro}>
            La historia del videojuego español se articula en seis grandes eras, cada una marcada por un
            cambio tecnológico, económico o cultural que transformó el sector.
          </p>
          <div className={styles.erasGrid}>
            {ERAS.map((era) => (
              <article
                key={era.nombre}
                className={styles.eraCard}
                style={{ borderLeftColor: era.color }}
              >
                <h3 className={styles.eraNombre} style={{ color: era.color }}>
                  {era.nombre}
                </h3>
                <p className={styles.eraAnios}>{era.anios}</p>
                <p className={styles.eraDescripcion}>{era.descripcion}</p>
                <ul className={styles.eraHitos} aria-label={`Hitos de ${era.nombre}`}>
                  {era.hitos.map((h) => (
                    <li key={h} className={styles.eraHito}>
                      <span className={styles.eraHitoDot} aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Sección Educativa ── */}
      <div className={styles.educationalWrapper}>
        <EducationalSection title="Todo sobre los Videojuegos Españoles" subtitle="Historia, estudios, juegos icónicos y datos del sector">
          {/* 1. Tabla comparativa */}
          <h3 className={styles.sectionHeading}>Resumen por era</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Era</th>
                  <th>Plataforma</th>
                  <th>Estudios clave</th>
                  <th>Juegos icónicos</th>
                  <th>Impacto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Edad de Oro (1983–1992)</td>
                  <td>Spectrum, MSX, Amstrad</td>
                  <td>Dinamic, Opera Soft, Topo Soft</td>
                  <td>Abu Simbel, La Abadía del Crimen</td>
                  <td>Primera exportación internacional</td>
                </tr>
                <tr>
                  <td>Crisis (1992–1995)</td>
                  <td>PC, Amiga</td>
                  <td>Restos de Dinamic</td>
                  <td>Sin hitos</td>
                  <td>Destrucción del tejido industrial</td>
                </tr>
                <tr>
                  <td>Era Pyro (1995–2007)</td>
                  <td>PC (Windows)</td>
                  <td>Pyro Studios, Dinamic Multimedia</td>
                  <td>Commandos, PC Fútbol</td>
                  <td>+2M copias; fama mundial</td>
                </tr>
                <tr>
                  <td>Era HD (2008–2015)</td>
                  <td>PS3, Xbox 360, PC</td>
                  <td>MercurySteam, Tequila Works</td>
                  <td>Castlevania: Lords of Shadow</td>
                  <td>Co-desarrollo AAA con grandes editoriales</td>
                </tr>
                <tr>
                  <td>Era Indie (2016–2021)</td>
                  <td>PC, PS4/5, Switch</td>
                  <td>The Game Kitchen, Nomada, MercurySteam</td>
                  <td>Blasphemous, Gris, Metroid Dread</td>
                  <td>Candidatura GOTY; identidad española</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Escenarios de impacto */}
          <h3 className={styles.sectionHeading}>Dimensiones del impacto</h3>
          <div className={styles.escenarioGrid}>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Cultural</p>
              <p className={styles.escenarioTexto}>
                Blasphemous lleva la Semana Santa sevillana y la iconografía española al videojuego.
                La Abadía del Crimen adaptó una novela de Umberto Eco en 1987. Los videojuegos españoles
                exportan cultura, no solo entretenimiento.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Económico</p>
              <p className={styles.escenarioTexto}>
                El sector alcanzó 450 millones de euros en 2023, con 850+ empresas y más de 8.000
                empleados directos. Crecimiento anual superior al 15%, por encima de la media europea.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Tecnológico</p>
              <p className={styles.escenarioTexto}>
                De programar en ensamblador para el Spectrum a co-desarrollar juegos AAA con Unreal
                Engine 5. Los estudios españoles dominan tecnologías de vanguardia: IA, motion capture,
                ray tracing.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Internacional</p>
              <p className={styles.escenarioTexto}>
                De vender Abu Simbel en el Reino Unido en 1985 a co-producir Metroid Dread con Nintendo
                en 2021. Un recorrido de 40 años de aprendizaje, fracasos y resurgimientos.
              </p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h3 className={styles.sectionHeading}>Preguntas frecuentes</h3>
          <div className={styles.faqLista}>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué es la Edad de Oro del videojuego español?</p>
              <p className={styles.faqRespuesta}>
                El período 1983–1992 en el que España produjo videojuegos exitosos para Spectrum, MSX
                y Amstrad que se vendieron en toda Europa. Estudios como Dinamic Software y Opera Soft
                lideraron este boom, con juegos reconocidos internacionalmente como Abu Simbel
                Profanation y La Abadía del Crimen.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Por qué desapareció la Edad de Oro?</p>
              <p className={styles.faqRespuesta}>
                La transición tecnológica hacia Amiga, Atari ST y PC elevó el coste de desarrollo muy
                por encima de lo que los pequeños estudios podían afrontar. Sin financiación ni
                inversores, la mayoría cerró entre 1991 y 1995. Opera Soft cerró en 1992.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Qué distingue a los videojuegos españoles actuales?</p>
              <p className={styles.faqRespuesta}>
                Una fuerte identidad artística y cultural. Blasphemous incorpora la iconografía
                católica andaluza; Gris explore el duelo a través del arte; Rime tiene una estética
                mediterránea inconfundible. Los juegos españoles no imitan — proponen una voz propia.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Por qué Blasphemous es representativo de España?</p>
              <p className={styles.faqRespuesta}>
                Porque nació en Sevilla, refleja la Semana Santa española, usa términos religiosos
                castellanos y referencias a la inquisición. No es solo un videojuego — es una exportación
                de la identidad cultural española a un público global que no conocía esa iconografía.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuánto vale el sector de videojuegos en España hoy?</p>
              <p className={styles.faqRespuesta}>
                Según AEVI y DEV, el sector alcanzó 450 millones de euros en 2023, con más de 850
                empresas activas y 8.000 empleados directos. España produce aproximadamente el 4%
                de los videojuegos europeos, con un crecimiento anual superior al 15%.
              </p>
            </div>
          </div>

          {/* 4. Guía en 5 pasos */}
          <h3 className={styles.sectionHeading}>Cómo explorar la historia del videojuego español</h3>
          <div className={styles.guiaPasos}>
            {[
              'Visita el Museo del Videojuego de Zamora o el Retrogame Festival para ver hardware original de la Edad de Oro.',
              'Asiste a Gamelab (Barcelona) o GameOn, los eventos de referencia de la industria española del videojuego.',
              'Juega a La Abadía del Crimen (disponible en remakes modernos) para entender la cumbre técnica de 1987.',
              'Sigue a DEV (Desarrollo de Videojuegos) y AEVI para noticias del sector y estadísticas actualizadas.',
              'Explora el Archivo del Videojuego Español (AVE) para preservación digital de juegos históricos.',
            ].map((paso, i) => (
              <div key={i} className={styles.guiaPaso}>
                <span className={styles.guiaPasoNum} aria-hidden="true">{i + 1}</span>
                <p className={styles.guiaPasoTexto}>{paso}</p>
              </div>
            ))}
          </div>

          {/* 5. Tips de experto */}
          <h3 className={styles.sectionHeading}>Tips de experto</h3>
          <div className={styles.tipsLista}>
            <div className={styles.tipItem}>
              La Edad de Oro española fue contemporánea a la era Spectrum en el Reino Unido — pero
              España tuvo que reinventarse mientras UK evolucionó de forma más continua hacia el PC.
            </div>
            <div className={styles.tipItem}>
              Commandos inventó el género táctico en tiempo real antes que la mayoría de los grandes
              estudios. Pyro Studios fue pionera, no seguidor.
            </div>
            <div className={styles.tipItem}>
              MercurySteam es el único estudio español que ha co-desarrollado dos franquicias
              principales de Nintendo: Castlevania y Metroid.
            </div>
            <div className={styles.tipItem}>
              El crowdfunding fue clave para el indie español: Blasphemous recaudó 330.000€ en
              Kickstarter en 2017, triplicando su objetivo inicial.
            </div>
          </div>

          {/* Warning box obligatorio v2.0 */}
          <div className={styles.warningBox} role="note">
            <strong>Nota sobre los datos:</strong> Las cifras del sector son estimaciones de AEVI
            (Asociación Española de Videojuegos) y DEV (Desarrollo de Videojuegos en España).
            Las cifras exactas de ventas históricas, especialmente de la Edad de Oro (1983–1992),
            son aproximadas por falta de registros oficiales de la época. Los datos de ventas
            actuales son los más recientes disponibles en el momento de publicación.
          </div>
        </EducationalSection>
      </div>

      <RelatedApps apps={getRelatedApps('visualizador-historia-videojuegos-espanoles')} />
      <ShareCard appName="visualizador-historia-videojuegos-espanoles" />
      <Footer appName="visualizador-historia-videojuegos-espanoles" />
    </div>
  );
}
