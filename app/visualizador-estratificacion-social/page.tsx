'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './EstrategicacionSocial.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabId = 'modelos' | 'gini' | 'movilidad' | 'teorias';
type ModeloId = 'piramide' | 'diamante' | 'gbcs';
type EscenarioId = 'dinamarca' | 'usa';

interface NivelPiramide {
  nombre: string;
  porcentaje: number;
  color: string;
  desc: string;
  economia: string;
  cultura: string;
  social: string;
}

interface ClaseGbcs {
  nombre: string;
  porcentaje: number;
  color: string;
  economia: string;
  cultura: string;
  social: string;
}

interface PaisGini {
  pais: string;
  gini: number;
  region: string;
}

interface FilaMovilidad {
  clase: string;
  alta: number;
  mediaAlta: number;
  mediaBaja: number;
  baja: number;
}

interface Escenario {
  nombre: string;
  ascensor: string;
  ascensorNivel: 'grande' | 'moderado' | 'limitado' | 'bloqueado';
  filas: FilaMovilidad[];
}

interface Teoria {
  autor: string;
  anio: string;
  icono: string;
  concepto: string;
  critica: string;
  vigencia: string;
}

// ─────────────────────────────────────────────
// Datos: Pirámide Clásica
// ─────────────────────────────────────────────

const PIRAMIDE: NivelPiramide[] = [
  {
    nombre: 'Élite',
    porcentaje: 1,
    color: '#1a1a2e',
    desc: 'Propietarios de grandes fortunas, directivos top, familias de poder histórico.',
    economia: 'Patrimonio diversificado: inmuebles, acciones, capital privado. Ingresos pasivos dominantes.',
    cultura: 'Acceso a bienes de lujo, viajes internacionales, redes exclusivas.',
    social: 'Capital social heredado, matrimonios estratégicos, acceso a esferas de poder.',
  },
  {
    nombre: 'Clase Alta',
    porcentaje: 4,
    color: '#16213e',
    desc: 'Altos ejecutivos, profesionales liberales de éxito, empresarios establecidos.',
    economia: 'Salarios muy elevados + inversiones. Patrimonio sólido.',
    cultura: 'Educación en centros privados de élite, viajes frecuentes, consumo cultural intenso.',
    social: 'Redes profesionales fuertes, asociaciones gremiales, influencia local y sectorial.',
  },
  {
    nombre: 'Clase Media-Alta',
    porcentaje: 15,
    color: '#0f3460',
    desc: 'Profesionales con titulación universitaria: médicos, abogados, ingenieros, profesores universitarios.',
    economia: 'Salarios medios-altos, vivienda en propiedad, ahorro sistemático.',
    cultura: 'Capital cultural elevado, consumo de bienes culturales variados.',
    social: 'Redes profesionales amplias, asociacionismo activo.',
  },
  {
    nombre: 'Clase Media',
    porcentaje: 50,
    color: '#2E86AB',
    desc: 'Empleados de cuello blanco, autónomos, técnicos, pequeños empresarios.',
    economia: 'Salarios medios, hipoteca o alquiler, ahorro limitado.',
    cultura: 'Consumo cultural moderado, educación obligatoria + algo de formación.',
    social: 'Redes vecinales y laborales. Participación política ocasional.',
  },
  {
    nombre: 'Clase Baja',
    porcentaje: 30,
    color: '#48A9A6',
    desc: 'Trabajadores manuales, empleos precarios, desempleados estructurales.',
    economia: 'Ingresos bajos e inestables, dependencia de prestaciones, sin ahorro.',
    cultura: 'Capital cultural escaso, abandono escolar frecuente.',
    social: 'Redes reducidas, vulnerabilidad ante crisis, menor participación institucional.',
  },
];

// ─────────────────────────────────────────────
// Datos: Great British Class Survey (7 clases)
// ─────────────────────────────────────────────

const GBCS: ClaseGbcs[] = [
  {
    nombre: 'Élite',
    porcentaje: 6,
    color: '#1a1a2e',
    economia: 'Patrimonio muy alto, ingresos pasivos dominantes, inversiones diversificadas.',
    cultura: 'Consumo cultural highbrow: ópera, teatro, artes visuales, viajes de lujo.',
    social: 'Redes sociales muy densas con personas de alto estatus. Capital social heredado.',
  },
  {
    nombre: 'Clase Media Establecida',
    porcentaje: 25,
    color: '#16213e',
    economia: 'Altos ingresos laborales y ahorro significativo.',
    cultura: 'Gran amplitud cultural: de la ópera al deporte de masas. Highbrow + popular.',
    social: 'Redes amplias y diversas. Alta participación cívica.',
  },
  {
    nombre: 'Clase Media Técnica',
    porcentaje: 6,
    color: '#0f3460',
    economia: 'Buenos ingresos pero aislados socialmente.',
    cultura: 'Gustos culturales nicho: sci-fi, música clásica alternativa, juegos de estrategia.',
    social: 'Redes sociales menos diversas, menor participación cultural masiva.',
  },
  {
    nombre: 'Nuevos Trabajadores Prósperos',
    porcentaje: 15,
    color: '#2E86AB',
    economia: 'Ingresos medios en sectores modernos (tecnología, retail, hostelería premium).',
    cultura: 'Cultura popular moderna: música urbana, videojuegos, redes sociales.',
    social: 'Jóvenes con redes emergentes pero capital social aún en construcción.',
  },
  {
    nombre: 'Clase Trabajadora Tradicional',
    porcentaje: 14,
    color: '#48A9A6',
    economia: 'Ingresos medios-bajos pero estables. Vivienda en propiedad (adquirida antes de la crisis).',
    cultura: 'Cultura popular tradicional: fútbol, televisión, música pop clásica.',
    social: 'Redes comunitarias fuertes pero poco diversas.',
  },
  {
    nombre: 'Trabajadores de Servicios Emergentes',
    porcentaje: 19,
    color: '#5BA4A0',
    economia: 'Ingresos bajos, empleos en servicios (hostelería, limpieza, cuidados).',
    cultura: 'Cultura de consumo de masas, uso intensivo de redes sociales.',
    social: 'Jóvenes urbanos con redes sociales activas pero precarias.',
  },
  {
    nombre: 'Precariado',
    porcentaje: 15,
    color: '#7FB3D3',
    economia: 'Ingresos muy bajos, empleo irregular, sin ahorros, dependencia de ayudas.',
    cultura: 'Capital cultural muy bajo, abandono educativo frecuente.',
    social: 'Redes sociales mínimas, alta exclusión social, menor participación política.',
  },
];

// ─────────────────────────────────────────────
// Datos: Coeficiente Gini por países
// ─────────────────────────────────────────────

const PAISES_GINI: PaisGini[] = [
  { pais: 'Eslovenia', gini: 0.24, region: 'europa' },
  { pais: 'Dinamarca', gini: 0.28, region: 'europa' },
  { pais: 'Alemania', gini: 0.31, region: 'europa' },
  { pais: 'España', gini: 0.33, region: 'europa' },
  { pais: 'USA', gini: 0.41, region: 'america' },
  { pais: 'México', gini: 0.45, region: 'america' },
  { pais: 'Brasil', gini: 0.53, region: 'america' },
  { pais: 'Sudáfrica', gini: 0.63, region: 'africa' },
];

// ─────────────────────────────────────────────
// Datos: Movilidad Social — matrices
// ─────────────────────────────────────────────

const ESCENARIOS: Record<EscenarioId, Escenario> = {
  dinamarca: {
    nombre: 'Alta movilidad (Dinamarca)',
    ascensor: 'Grande',
    ascensorNivel: 'grande',
    filas: [
      { clase: 'Alta', alta: 38, mediaAlta: 32, mediaBaja: 20, baja: 10 },
      { clase: 'Media-Alta', alta: 18, mediaAlta: 36, mediaBaja: 30, baja: 16 },
      { clase: 'Media-Baja', alta: 12, mediaAlta: 28, mediaBaja: 38, baja: 22 },
      { clase: 'Baja', alta: 8, mediaAlta: 22, mediaBaja: 32, baja: 38 },
    ],
  },
  usa: {
    nombre: 'Baja movilidad (USA)',
    ascensor: 'Limitado',
    ascensorNivel: 'limitado',
    filas: [
      { clase: 'Alta', alta: 62, mediaAlta: 24, mediaBaja: 10, baja: 4 },
      { clase: 'Media-Alta', alta: 15, mediaAlta: 48, mediaBaja: 28, baja: 9 },
      { clase: 'Media-Baja', alta: 6, mediaAlta: 22, mediaBaja: 48, baja: 24 },
      { clase: 'Baja', alta: 4, mediaAlta: 12, mediaBaja: 28, baja: 56 },
    ],
  },
};

// ─────────────────────────────────────────────
// Datos: Teorías Clásicas
// ─────────────────────────────────────────────

const TEORIAS: Teoria[] = [
  {
    autor: 'Karl Marx',
    anio: '1848',
    icono: '✊',
    concepto: 'La sociedad se divide en dos clases fundamentales: la burguesía (dueña de los medios de producción) y el proletariado (que solo posee su fuerza de trabajo). La desigualdad emerge de la explotación del trabajo asalariado y la extracción de plusvalía.',
    critica: 'Reduccionismo económico: ignora otras fuentes de identidad y poder (género, etnia, status cultural). La predicción del colapso capitalista no se materializó tal como la formuló.',
    vigencia: 'El concepto de clase económica y la crítica a la concentración de capital siguen siendo herramientas analíticas centrales, especialmente ante el auge de la desigualdad patrimonial (Piketty).',
  },
  {
    autor: 'Max Weber',
    anio: '1922',
    icono: '⚖️',
    concepto: 'La estratificación es multidimensional: la clase (posición económica en el mercado), el estatus (prestigio social y estilo de vida) y el partido (poder político) son dimensiones independientes que se combinan de forma compleja.',
    critica: 'El modelo es descriptivo más que explicativo. La multiplicidad de dimensiones puede dificultar el análisis sistemático.',
    vigencia: 'La distinción entre clase, status y poder sigue siendo el marco de referencia dominante en sociología. Anticipa la sociología de la cultura de Bourdieu.',
  },
  {
    autor: 'Pierre Bourdieu',
    anio: '1984',
    icono: '🎭',
    concepto: 'Las posiciones sociales se determinan por tres tipos de capital: económico (riqueza), cultural (conocimiento, títulos, gustos) y social (redes de relaciones). El habitus (disposiciones incorporadas) y el campo (espacio de lucha) completan el modelo.',
    critica: 'La teoría tiende al determinismo estructural, subestimando la agencia individual. Conceptos como habitus son difíciles de operacionalizar empíricamente.',
    vigencia: 'Altamente influyente en sociología de la educación, cultura y desigualdad. El Great British Class Survey (2013) operacionalizó directamente el modelo de los tres capitales.',
  },
  {
    autor: 'Talcott Parsons',
    anio: '1951',
    icono: '🏛️',
    concepto: 'Desde el funcionalismo, la estratificación social es una necesidad funcional del sistema social: asigna a los individuos más capaces a los roles más importantes, motivando el esfuerzo mediante recompensas diferenciadas.',
    critica: 'Justifica el statu quo e ignora el conflicto, el poder y los mecanismos de reproducción de privilegios. La "capacidad" que se premia está socialmente construida y sesgada por el origen.',
    vigencia: 'Muy cuestionado en la sociología crítica contemporánea. Tiene cierta resonancia en debates sobre meritocracia, aunque esta se reconoce como parcialmente mítica.',
  },
];

// ─────────────────────────────────────────────
// Utilidades SVG: Curva de Lorenz
// ─────────────────────────────────────────────

function generarPuntosLorenz(gini: number): string {
  const puntos: string[] = ['0,0'];
  const pasos = 20;
  for (let i = 1; i <= pasos; i++) {
    const x = i / pasos;
    // Aproximación de la curva de Lorenz: y = x^((1+gini)/(1-gini+0.001))
    const exponente = (1 + gini) / (1 - gini + 0.001);
    const y = Math.pow(x, exponente);
    // Convertir a coordenadas SVG (260x260, origen abajo-izq)
    const svgX = x * 260;
    const svgY = 260 - y * 260;
    puntos.push(`${svgX.toFixed(1)},${svgY.toFixed(1)}`);
  }
  return puntos.join(' ');
}

function generarAreaLorenz(gini: number): string {
  const pasos = 20;
  const puntosLorenz: string[] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = i / pasos;
    const exponente = (1 + gini) / (1 - gini + 0.001);
    const y = Math.pow(x, exponente);
    puntosLorenz.push(`${(x * 260).toFixed(1)},${(260 - y * 260).toFixed(1)}`);
  }
  // Área: diagonal (de 0,260 a 260,0) + vuelta por la curva de Lorenz
  return `0,260 260,0 ${puntosLorenz.reverse().join(' ')}`;
}

function colorGini(gini: number): string {
  if (gini < 0.30) return '#48A9A6';
  if (gini < 0.40) return '#2E86AB';
  if (gini < 0.50) return '#e07b39';
  return '#c0392b';
}

function etiquetaGini(gini: number): string {
  if (gini < 0.30) return 'Muy igualitario';
  if (gini < 0.40) return 'Moderado';
  if (gini < 0.50) return 'Desigual';
  return 'Muy desigual';
}

// ─────────────────────────────────────────────
// Colores de celda de movilidad
// ─────────────────────────────────────────────

function colorMovilidad(valor: number, esDiagonal: boolean): string {
  if (esDiagonal) {
    if (valor >= 50) return '#c0392b';
    if (valor >= 35) return '#e07b39';
    return '#48A9A6';
  }
  if (valor >= 30) return '#27ae60';
  if (valor >= 20) return '#48A9A6';
  if (valor >= 10) return '#7FB3D3';
  return '#ddd';
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEstrategicacionSocial() {
  const [tabActiva, setTabActiva] = useState<TabId>('modelos');
  const [modeloActivo, setModeloActivo] = useState<ModeloId>('piramide');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number | null>(null);
  const [claseGbcsSeleccionada, setClaseGbcsSeleccionada] = useState<number | null>(null);
  const [gini, setGini] = useState<number>(0.33);
  const [paisActivo, setPaisActivo] = useState<string>('España');
  const [escenario, setEscenario] = useState<EscenarioId>('dinamarca');

  const puntosLorenz = useMemo(() => generarPuntosLorenz(gini), [gini]);
  const areaLorenz = useMemo(() => generarAreaLorenz(gini), [gini]);

  const escenarioActual = ESCENARIOS[escenario];

  const TABS: { id: TabId; label: string }[] = [
    { id: 'modelos', label: 'Modelos de Clases' },
    { id: 'gini', label: 'Desigualdad y Gini' },
    { id: 'movilidad', label: 'Movilidad Social' },
    { id: 'teorias', label: 'Teorías Clásicas' },
  ];

  // ── Pirámide SVG ──────────────────────────────

  function renderPiramide() {
    const anchuras = [60, 100, 150, 200, 250];
    const altura = 46;
    const anchoTotal = 260;
    return (
      <div className={styles.piramideSvgWrapper}>
        <svg viewBox="0 0 260 260" className={styles.piramideSvg} role="img" aria-label="Pirámide de clases sociales">
          {PIRAMIDE.map((nivel, i) => {
            const w = anchuras[i];
            const x = (anchoTotal - w) / 2;
            const y = i * altura + 10;
            const isSelected = nivelSeleccionado === i;
            return (
              <g key={nivel.nombre} onClick={() => setNivelSeleccionado(isSelected ? null : i)} style={{ cursor: 'pointer' }}>
                <rect x={x} y={y} width={w} height={altura - 2} fill={nivel.color} rx={3}
                  stroke={isSelected ? '#FFD700' : 'none'} strokeWidth={isSelected ? 2 : 0}
                  opacity={nivelSeleccionado !== null && !isSelected ? 0.5 : 1} />
                <text x={anchoTotal / 2} y={y + altura / 2 + 1} textAnchor="middle" fill="#fff"
                  fontSize={11} fontWeight="600" dominantBaseline="middle">
                  {nivel.nombre} ({nivel.porcentaje}%)
                </text>
              </g>
            );
          })}
        </svg>
        {nivelSeleccionado !== null && (
          <div className={styles.detallePanel}>
            <div className={styles.detalleTitulo}>{PIRAMIDE[nivelSeleccionado].nombre}</div>
            <p className={styles.detalleDesc}>{PIRAMIDE[nivelSeleccionado].desc}</p>
            <div className={styles.detalleGrid}>
              <div><span className={styles.detalleEtiq}>Economía</span> {PIRAMIDE[nivelSeleccionado].economia}</div>
              <div><span className={styles.detalleEtiq}>Cultura</span> {PIRAMIDE[nivelSeleccionado].cultura}</div>
              <div><span className={styles.detalleEtiq}>Social</span> {PIRAMIDE[nivelSeleccionado].social}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Diamante SVG ─────────────────────────────

  function renderDiamante() {
    const niveles = [
      { nombre: 'Clase alta', pct: 5, w: 60 },
      { nombre: 'Media-alta', pct: 20, w: 140 },
      { nombre: 'Clase media', pct: 50, w: 220 },
      { nombre: 'Media-baja', pct: 18, w: 140 },
      { nombre: 'Clase baja', pct: 7, w: 60 },
    ];
    const colores = ['#1a1a2e', '#16213e', '#2E86AB', '#48A9A6', '#7FB3D3'];
    const alturaFila = 42;
    return (
      <div className={styles.piramideSvgWrapper}>
        <svg viewBox="0 0 260 240" className={styles.piramideSvg} role="img" aria-label="Diamante de clase media">
          {niveles.map((n, i) => {
            const x = (260 - n.w) / 2;
            const y = i * alturaFila + 8;
            return (
              <g key={n.nombre}>
                <rect x={x} y={y} width={n.w} height={alturaFila - 2} fill={colores[i]} rx={3} />
                <text x={130} y={y + alturaFila / 2} textAnchor="middle" fill="#fff"
                  fontSize={10} fontWeight="600" dominantBaseline="middle">
                  {n.nombre} ({n.pct}%)
                </text>
              </g>
            );
          })}
        </svg>
        <p className={styles.diamanteNota}>
          Modelo típico de sociedades con clase media fuerte (países nórdicos, Alemania). La clase media concentra el mayor peso demográfico y económico.
        </p>
      </div>
    );
  }

  // ── GBCS ─────────────────────────────────────

  function renderGbcs() {
    return (
      <div className={styles.gbcsWrapper}>
        {GBCS.map((clase, i) => (
          <div
            key={clase.nombre}
            className={`${styles.gbcsClase} ${claseGbcsSeleccionada === i ? styles.gbcsClaseActiva : ''}`}
            onClick={() => setClaseGbcsSeleccionada(claseGbcsSeleccionada === i ? null : i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setClaseGbcsSeleccionada(claseGbcsSeleccionada === i ? null : i)}
            aria-expanded={claseGbcsSeleccionada === i}
          >
            <div className={styles.gbcsBar} style={{ width: `${clase.porcentaje * 3.5}%`, backgroundColor: clase.color }} />
            <div className={styles.gbcsNombre}>{clase.nombre}</div>
            <div className={styles.gbcsPct}>{clase.porcentaje}%</div>
            {claseGbcsSeleccionada === i && (
              <div className={styles.gbcsDetalle}>
                <div><span className={styles.detalleEtiq}>Economía</span> {clase.economia}</div>
                <div><span className={styles.detalleEtiq}>Cultura</span> {clase.cultura}</div>
                <div><span className={styles.detalleEtiq}>Social</span> {clase.social}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Estratificación Social</h1>
        <p className={styles.heroSubtitle}>
          Clases sociales, desigualdad (Gini) y movilidad intergeneracional
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Tabs de navegación */}
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── TAB 1: MODELOS DE CLASES ── */}
        {tabActiva === 'modelos' && (
          <section className={styles.tabContent}>
            <div className={styles.modelosBtns} role="group" aria-label="Seleccionar modelo de clases">
              <button
                className={`${styles.modeloBtn} ${modeloActivo === 'piramide' ? styles.modeloBtnActivo : ''}`}
                onClick={() => { setModeloActivo('piramide'); setNivelSeleccionado(null); }}
              >
                Pirámide Clásica
              </button>
              <button
                className={`${styles.modeloBtn} ${modeloActivo === 'diamante' ? styles.modeloBtnActivo : ''}`}
                onClick={() => { setModeloActivo('diamante'); setNivelSeleccionado(null); }}
              >
                Diamante Clase Media
              </button>
              <button
                className={`${styles.modeloBtn} ${modeloActivo === 'gbcs' ? styles.modeloBtnActivo : ''}`}
                onClick={() => { setModeloActivo('gbcs'); setClaseGbcsSeleccionada(null); }}
              >
                7 Clases (GBCS 2013)
              </button>
            </div>

            <div className={styles.sectionCard}>
              {modeloActivo === 'piramide' && (
                <>
                  <h2 className={styles.sectionTitle}>Pirámide de Clases Clásica</h2>
                  <p className={styles.sectionDesc}>Haz clic en un nivel para ver sus características económicas, culturales y sociales.</p>
                  {renderPiramide()}
                </>
              )}
              {modeloActivo === 'diamante' && (
                <>
                  <h2 className={styles.sectionTitle}>Diamante de la Clase Media</h2>
                  {renderDiamante()}
                </>
              )}
              {modeloActivo === 'gbcs' && (
                <>
                  <h2 className={styles.sectionTitle}>Great British Class Survey (2013)</h2>
                  <p className={styles.sectionDesc}>
                    Modelo de 7 clases basado en capital económico, cultural y social (Bourdieu aplicado). Haz clic en cada clase para ver detalles.
                  </p>
                  {renderGbcs()}
                </>
              )}
            </div>
          </section>
        )}

        {/* ── TAB 2: COEFICIENTE GINI ── */}
        {tabActiva === 'gini' && (
          <section className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Curva de Lorenz y Coeficiente Gini</h2>
              <p className={styles.sectionDesc}>
                El coeficiente Gini mide la desigualdad de ingresos: 0 = igualdad perfecta, 1 = desigualdad total.
                Ajusta el slider o selecciona un país para ver cómo cambia la curva.
              </p>

              <div className={styles.lorenzWrapper}>
                <svg viewBox="0 0 280 280" className={styles.lorenzSvg} role="img" aria-label="Curva de Lorenz">
                  {/* Ejes */}
                  <line x1="10" y1="10" x2="10" y2="270" stroke="var(--text-secondary)" strokeWidth="1.5" />
                  <line x1="10" y1="270" x2="270" y2="270" stroke="var(--text-secondary)" strokeWidth="1.5" />
                  {/* Línea de igualdad perfecta */}
                  <line x1="10" y1="270" x2="270" y2="10" stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="6,4" />
                  {/* Área de desigualdad */}
                  <polygon
                    points={`10,270 270,10 ${areaLorenz}`}
                    fill="rgba(192,57,43,0.15)"
                  />
                  {/* Curva de Lorenz */}
                  <polyline
                    points={puntosLorenz.split(' ').map(p => {
                      const [px, py] = p.split(',').map(Number);
                      return `${px + 10},${py + 10}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#2E86AB"
                    strokeWidth="2.5"
                  />
                  {/* Etiquetas ejes */}
                  <text x="140" y="285" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">% Acumulado de Población</text>
                  <text x="-140" y="6" fontSize="10" fill="var(--text-secondary)" transform="rotate(-90)">% Acumulado de Renta</text>
                </svg>

                <div className={styles.giniBadgeWrapper}>
                  <div className={styles.giniBadge} style={{ backgroundColor: colorGini(gini) }}>
                    {gini.toFixed(2)}
                  </div>
                  <div className={styles.giniEtiqueta}>{etiquetaGini(gini)}</div>
                </div>
              </div>

              <div className={styles.sliderWrapper}>
                <label htmlFor="gini-slider" className={styles.sliderLabel}>
                  Ajustar Gini: <strong>{gini.toFixed(2)}</strong>
                </label>
                <input
                  id="gini-slider"
                  type="range"
                  min={0.20}
                  max={0.70}
                  step={0.01}
                  value={gini}
                  onChange={(e) => { setGini(parseFloat(e.target.value)); setPaisActivo(''); }}
                  className={styles.sliderInput}
                  aria-label="Coeficiente Gini"
                />
                <div className={styles.sliderMarks}>
                  <span>0.20</span><span>0.45</span><span>0.70</span>
                </div>
              </div>

              <div className={styles.paisesGrid} role="group" aria-label="Países para comparar Gini">
                {PAISES_GINI.map((p) => (
                  <button
                    key={p.pais}
                    className={`${styles.paisBtn} ${paisActivo === p.pais ? styles.paisBtnActivo : ''}`}
                    onClick={() => { setGini(p.gini); setPaisActivo(p.pais); }}
                  >
                    <span className={styles.paisNombre}>{p.pais}</span>
                    <span className={styles.paisGiniVal} style={{ color: colorGini(p.gini) }}>{p.gini.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 3: MOVILIDAD SOCIAL ── */}
        {tabActiva === 'movilidad' && (
          <section className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Movilidad Social Intergeneracional</h2>
              <p className={styles.sectionDesc}>
                La tabla muestra la probabilidad (%) de que el hijo de un padre en clase X llegue a clase Y. La diagonal principal indica reproducción de clase.
              </p>

              <div className={styles.escenarioBtns} role="group" aria-label="Seleccionar escenario de movilidad">
                <button
                  className={`${styles.modeloBtn} ${escenario === 'dinamarca' ? styles.modeloBtnActivo : ''}`}
                  onClick={() => setEscenario('dinamarca')}
                >
                  Alta movilidad (Dinamarca)
                </button>
                <button
                  className={`${styles.modeloBtn} ${escenario === 'usa' ? styles.modeloBtnActivo : ''}`}
                  onClick={() => setEscenario('usa')}
                >
                  Baja movilidad (USA)
                </button>
              </div>

              <div className={styles.ascensorWrapper}>
                <span className={styles.ascensorLabel}>Ascensor social:</span>
                <span className={`${styles.ascensorBadge} ${styles['ascensor_' + escenarioActual.ascensorNivel]}`}>
                  {escenarioActual.ascensor}
                </span>
              </div>

              <div className={styles.movilidadTablaWrapper} role="region" aria-label="Matriz de movilidad intergeneracional">
                <table className={styles.movilidadTabla}>
                  <caption className={styles.tablaCaption}>
                    {escenarioActual.nombre} — Probabilidades de clase (% hijo según clase del padre)
                  </caption>
                  <thead>
                    <tr>
                      <th className={styles.thEsquina}>Padre ↓ / Hijo →</th>
                      <th>Alta</th>
                      <th>Media-Alta</th>
                      <th>Media-Baja</th>
                      <th>Baja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escenarioActual.filas.map((fila, fi) => (
                      <tr key={fila.clase}>
                        <th className={styles.thFila}>{fila.clase}</th>
                        {[fila.alta, fila.mediaAlta, fila.mediaBaja, fila.baja].map((val, ci) => (
                          <td
                            key={ci}
                            className={styles.celdaMobility}
                            style={{ backgroundColor: colorMovilidad(val, fi === ci) + (fi === ci ? '' : '33') }}
                          >
                            {val}%
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Diagrama Sankey simplificado */}
              <div className={styles.sankeyWrapper}>
                <h3 className={styles.sankeyTitle}>Flujo intergeneracional simplificado — {escenarioActual.nombre}</h3>
                <svg viewBox="0 0 400 180" className={styles.sankeySvg} role="img" aria-label="Diagrama de flujo de movilidad social">
                  {/* Columna padre */}
                  {['Alta', 'Media-Alta', 'Media-Baja', 'Baja'].map((clase, i) => (
                    <g key={clase}>
                      <rect x={10} y={i * 40 + 10} width={80} height={32} fill={['#1a1a2e', '#16213e', '#2E86AB', '#48A9A6'][i]} rx={4} />
                      <text x={50} y={i * 40 + 30} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="600">{clase}</text>
                    </g>
                  ))}
                  {/* Columna hijo */}
                  {['Alta', 'Media-Alta', 'Media-Baja', 'Baja'].map((clase, i) => (
                    <g key={clase}>
                      <rect x={310} y={i * 40 + 10} width={80} height={32} fill={['#1a1a2e', '#16213e', '#2E86AB', '#48A9A6'][i]} rx={4} />
                      <text x={350} y={i * 40 + 30} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="600">{clase}</text>
                    </g>
                  ))}
                  {/* Flechas de flujo — diagonal principal solo */}
                  {escenarioActual.filas.map((fila, fi) => {
                    const vals = [fila.alta, fila.mediaAlta, fila.mediaBaja, fila.baja];
                    return vals.map((val, ci) => {
                      if (val < 15) return null;
                      const x1 = 90;
                      const y1 = fi * 40 + 26;
                      const x2 = 310;
                      const y2 = ci * 40 + 26;
                      const grosor = Math.max(1, (val / 100) * 12);
                      return (
                        <line key={`${fi}-${ci}`} x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="rgba(46,134,171,0.4)" strokeWidth={grosor} />
                      );
                    });
                  })}
                  <text x={200} y={175} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
                    Grosor de línea proporcional a la probabilidad (≥15%)
                  </text>
                </svg>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 4: TEORÍAS CLÁSICAS ── */}
        {tabActiva === 'teorias' && (
          <section className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Teorías Clásicas de Estratificación</h2>
              <p className={styles.sectionDesc}>
                Las cuatro grandes tradiciones teóricas que explican el origen y reproducción de la desigualdad social.
              </p>
              <div className={styles.teoriasGrid}>
                {TEORIAS.map((teoria) => (
                  <div key={teoria.autor} className={styles.teoriaCard}>
                    <div className={styles.teoriaIcon} aria-hidden="true">{teoria.icono}</div>
                    <div className={styles.teoriaNombre}>
                      {teoria.autor} <span className={styles.teoriaAnio}>({teoria.anio})</span>
                    </div>
                    <div className={styles.teoriaClave}>
                      <span className={styles.teoriaEtiq}>Concepto clave</span>
                      <p>{teoria.concepto}</p>
                    </div>
                    <div className={styles.teoriaCritica}>
                      <span className={styles.teoriaEtiq}>Crítica principal</span>
                      <p>{teoria.critica}</p>
                    </div>
                    <div className={styles.teoriaVigencia}>
                      <span className={styles.teoriaEtiq}>Vigencia actual</span>
                      <p>{teoria.vigencia}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="Estratificación social y desigualdad"
        subtitle="Clases sociales, movilidad y teorías sociológicas"
      >
        {/* ── Sección 1: Tabla Comparativa ── */}
        <h3>Comparativa internacional de desigualdad</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>País</th>
                <th>Coeficiente Gini</th>
                <th>Modelo de clases dominante</th>
                <th>Movilidad social</th>
                <th>Sistema fiscal redistributivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dinamarca</strong></td>
                <td>0,28</td>
                <td>Diamante</td>
                <td>Alta</td>
                <td>Fuerte</td>
              </tr>
              <tr>
                <td><strong>Alemania</strong></td>
                <td>0,31</td>
                <td>Media amplia</td>
                <td>Media-alta</td>
                <td>Fuerte</td>
              </tr>
              <tr>
                <td><strong>España</strong></td>
                <td>0,33</td>
                <td>Pirámide aplastada</td>
                <td>Media</td>
                <td>Moderado</td>
              </tr>
              <tr>
                <td><strong>USA</strong></td>
                <td>0,41</td>
                <td>Reloj de arena</td>
                <td>Media-baja</td>
                <td>Débil</td>
              </tr>
              <tr>
                <td><strong>Brasil</strong></td>
                <td>0,53</td>
                <td>Pirámide</td>
                <td>Baja</td>
                <td>Débil</td>
              </tr>
              <tr>
                <td><strong>Sudáfrica</strong></td>
                <td>0,63</td>
                <td>Pirámide extrema</td>
                <td>Muy baja</td>
                <td>Muy débil</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sección 2: Casos de Uso ── */}
        <h3>¿Quién usa este visualizador y para qué?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🎓</div>
            <strong>Estudiante de sociología</strong>
            <p>Analiza la movilidad intergeneracional para un trabajo sobre igualdad de oportunidades, comparando matrices de movilidad entre países nórdicos y anglosajones.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">📊</div>
            <strong>Economista de política social</strong>
            <p>Usa el índice Gini para justificar una reforma fiscal progresiva ante el parlamento, mostrando cómo países con Gini alto presentan peores indicadores de bienestar general.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🏛️</div>
            <strong>Político de oposición</strong>
            <p>Compara la curva de Lorenz de España con Dinamarca para argumentar la necesidad de más redistribución y políticas de igualación de oportunidades.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcon} aria-hidden="true">🗞️</div>
            <strong>Periodista de datos</strong>
            <p>Explica la «paradoja de Gatsby» (la correlación entre desigualdad y baja movilidad) a su audiencia, desmontando el mito del mérito como único motor del ascenso social.</p>
          </div>
        </div>

        {/* ── Sección 3: FAQ ── */}
        <h3>Preguntas frecuentes sobre estratificación social</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué mide exactamente el coeficiente Gini y cuáles son sus limitaciones?</strong>
            <p>El Gini mide la desigualdad de <em>ingresos</em> entre 0 (igualdad perfecta) y 1 (desigualdad total). Sus limitaciones: no captura la desigualdad de <em>patrimonio</em> (que suele ser mayor), no refleja diferencias regionales dentro de un país y puede ocultar distintas distribuciones con el mismo valor numérico.</p>
            <span className={styles.faqTip}>Consejo: usa el Gini junto con la ratio S80/S20 (ingresos del 20% más rico vs. 20% más pobre) para un análisis más completo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es posible la movilidad social sin políticas redistributivas?</strong>
            <p>Los datos empíricos comparados sugieren que no a gran escala. La movilidad intergeneracional alta se asocia consistentemente con inversión pública en educación universal, sanidad accesible, vivienda asequible y mercados laborales regulados. Sin estas condiciones, el origen familiar determina en gran medida el destino.</p>
            <span className={styles.faqTip}>La «paradoja de Gatsby»: los países con mayor Gini tienden a tener menor movilidad intergeneracional.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué Marx dividía la sociedad en dos clases y Bourdieu en muchas más?</strong>
            <p>Marx simplificó para identificar el conflicto central: burguesía (propietaria de medios de producción) vs. proletariado (que vende su fuerza de trabajo). Bourdieu, un siglo después, observó que las posiciones sociales dependen de tres tipos de capital —económico, cultural y social— que se combinan de infinitas formas, generando un espacio social con múltiples posiciones.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el «precariado» y por qué es un concepto nuevo del siglo XXI?</strong>
            <p>El precariado (Guy Standing, 2011) designa a quienes viven en precariedad estructural: contratos temporales o inexistentes, sin acceso a derechos laborales consolidados, con identidad profesional inestable. Es nuevo porque el capitalismo tardío ha generado una masa de trabajadores que no encajan en la clase obrera tradicional (estable, con derechos) ni en la clase media.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿La desigualdad siempre frena el crecimiento económico?</strong>
            <p>No siempre en el corto plazo, pero los estudios del FMI y la OCDE muestran que la desigualdad extrema reduce el crecimiento sostenido a largo plazo: disminuye el consumo de las clases bajas, reduce la inversión en capital humano, incrementa la inestabilidad política y fomenta la búsqueda de rentas (rent-seeking) en lugar de la innovación productiva.</p>
            <span className={styles.faqTip}>El FMI estimó en 2015 que un aumento de 1 punto en el Gini puede reducir el crecimiento en 0,6-1,1 puntos en el largo plazo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia tiene la estratificación social en una monarquía constitucional vs una república?</strong>
            <p>La forma de gobierno tiene escasa incidencia directa en la estratificación. Lo que importa son las instituciones redistributivas, el sistema fiscal, la cobertura de servicios públicos y el grado de corporativismo laboral. Dinamarca (monarquía) tiene menos desigualdad que USA (república). La variable clave es el modelo de Estado del Bienestar, no el régimen constitucional.</p>
          </li>
        </ul>

        {/* ── Sección 4: Guía Paso a Paso ── */}
        <h3>Cómo analizar la estratificación social de un país</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Obtén el coeficiente Gini de la fuente oficial</strong>
              <p>Consulta Eurostat (para países europeos), el Banco Mundial o la OCDE. Verifica el año de referencia: los datos suelen tener 2-3 años de desfase respecto a la publicación.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Visualiza la curva de Lorenz</strong>
              <p>Cuánto más se aleja la curva real de la diagonal de igualdad perfecta, mayor es la desigualdad. La superficie entre ambas curvas representa el área de concentración de renta.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Analiza la estructura de clases</strong>
              <p>¿Tiene forma de pirámide (alta desigualdad, clase media pequeña) o de diamante (clase media fuerte)? La forma de diamante es característica de sociedades con bajo Gini y alta movilidad.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Mide la movilidad intergeneracional</strong>
              <p>¿El ingreso del hijo depende mucho del ingreso del padre? El coeficiente de elasticidad intergeneracional de ingresos (IGE) es el indicador estándar: cuanto más cercano a 0, mayor movilidad.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Estudia las políticas redistributivas</strong>
              <p>Analiza la progresividad del sistema fiscal (impuestos directos vs. indirectos), las transferencias sociales (pensiones, desempleo, prestaciones familiares) y la cobertura de servicios públicos universales (educación, sanidad).</p>
            </div>
          </li>
        </ol>

        {/* ── Sección 5: Mejores Prácticas ── */}
        <h3>Claves para interpretar la desigualdad correctamente</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p><strong>Gini de renta ≠ Gini de riqueza</strong><br />El Gini mide desigualdad de renta, no de riqueza: dos países con el mismo Gini de ingresos pueden tener distribuciones de patrimonio muy diferentes. La desigualdad de riqueza (activos, inmuebles, herencias) suele ser 2-3 veces mayor que la de ingresos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p><strong>La movilidad se mide en generaciones</strong><br />Los efectos de las políticas de igualdad de oportunidades tardan 20-30 años en verse en los datos de movilidad intergeneracional. No evalúes en ciclos electorales.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p><strong>El capital cultural también reproduce clase</strong><br />Bourdieu advierte: el capital cultural (títulos universitarios, gustos, redes de contactos) es tan importante como el económico. Acceder a la «clase correcta» de educación puede valer más que el nivel educativo en sí.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p><strong>La paradoja de Gatsby</strong><br />Los países más desiguales tienen menos movilidad social, no más (contra el mito del «sueño americano»). La alta desigualdad congela las posiciones de origen porque el punto de partida importa demasiado.</p>
          </div>
        </div>

        {/* ── Sección 6: Warning Box ── */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al analizar la estratificación social:</strong>
          <ul>
            <li><strong>Confundir igualdad de oportunidades con igualdad de resultados</strong>: son dos objetivos políticos distintos con implicaciones normativas muy diferentes.</li>
            <li><strong>Asumir que la clase media siempre es «mayoritaria»</strong>: en sociedades muy desiguales, puede ser una minoría estadística, pese a ser la aspiración cultural dominante.</li>
            <li><strong>Usar solo el PIB per cápita para medir bienestar</strong>: un país rico pero desigual puede tener peores indicadores sociales (esperanza de vida, salud mental, cohesión social) que uno menos rico pero más igualitario.</li>
            <li><strong>Ignorar que el género y la etnia atraviesan la estratificación de clase</strong>: una mujer de clase media puede enfrentar discriminaciones que un hombre de la misma clase no experimenta, lo que produce posiciones sociales cruzadas.</li>
            <li><strong>Confundir movilidad social relativa con absoluta</strong>: en los 30 Gloriosos (1945-1975), toda la pirámide subió (movilidad absoluta). Hoy la movilidad es más relativa: unos suben porque otros bajan, con suma aproximadamente cero.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estratificacion-social')} />
      <ShareCard appName="visualizador-estratificacion-social" />
      <Footer appName="visualizador-estratificacion-social" />
    </div>
  );
}
