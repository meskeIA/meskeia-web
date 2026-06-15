'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SegurosRiesgo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabId = 'tipos' | 'prima' | 'pool' | 'conceptos';

interface TipoSeguro {
  id: string;
  icono: string;
  nombre: string;
  queCubre: string;
  quienLoUsa: string;
  obligatorio: boolean;
  primaOrientativa: string;
  descripcionDetallada: string;
}

interface ConceptoClave {
  termino: string;
  definicion: string;
  ejemplo: string;
  ampliado: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const TIPOS_SEGURO: TipoSeguro[] = [
  {
    id: 'vida',
    icono: '❤️',
    nombre: 'Seguro de Vida',
    queCubre: 'Fallecimiento o invalidez del asegurado',
    quienLoUsa: 'Personas con dependientes económicos, hipotecados',
    obligatorio: false,
    primaOrientativa: '15 – 60 € / mes',
    descripcionDetallada:
      'Garantiza un capital a los beneficiarios en caso de fallecimiento o invalidez permanente. Muy frecuente vinculado a hipotecas. La prima depende de la edad, el capital asegurado y las coberturas adicionales (invalidez, enfermedades graves).',
  },
  {
    id: 'salud',
    icono: '🏥',
    nombre: 'Seguro de Salud',
    queCubre: 'Gastos médicos, hospitalización, especialistas',
    quienLoUsa: 'Particulares que buscan atención privada rápida',
    obligatorio: false,
    primaOrientativa: '40 – 150 € / mes',
    descripcionDetallada:
      'Cubre consultas, pruebas diagnósticas, hospitalización y cirugías en centros privados. En España el sistema público es universal, pero el seguro privado reduce listas de espera. Coexisten franquicias (copago por acto médico) y pólizas sin franquicia.',
  },
  {
    id: 'auto',
    icono: '🚗',
    nombre: 'Seguro de Auto',
    queCubre: 'Daños a terceros; opcionalmente daños propios',
    quienLoUsa: 'Todo conductor con vehículo a motor',
    obligatorio: true,
    primaOrientativa: '30 – 120 € / mes',
    descripcionDetallada:
      'La responsabilidad civil es OBLIGATORIA en España (RDL 8/2004). Cubre los daños que el conductor cause a terceros. Las modalidades a todo riesgo añaden cobertura de daños propios, robo e incendio. El bonus-malus ajusta la prima según el historial de siniestros.',
  },
  {
    id: 'hogar',
    icono: '🏠',
    nombre: 'Seguro de Hogar',
    queCubre: 'Daños al continente (estructura) y contenido (bienes)',
    quienLoUsa: 'Propietarios e inquilinos',
    obligatorio: false,
    primaOrientativa: '15 – 50 € / mes',
    descripcionDetallada:
      'Protege la vivienda frente a incendio, inundación, robo y daños estéticos. El "continente" es la estructura; el "contenido" son los muebles y objetos. Los bancos suelen exigirlo al conceder hipotecas, aunque no está legalmente obligado para inquilinos.',
  },
  {
    id: 'rc',
    icono: '⚖️',
    nombre: 'Responsabilidad Civil',
    queCubre: 'Daños causados involuntariamente a terceros',
    quienLoUsa: 'Profesionales, empresas, familias con mascotas',
    obligatorio: false,
    primaOrientativa: '5 – 40 € / mes',
    descripcionDetallada:
      'Cubre la indemnización que el asegurado debe pagar si causa daños a terceras personas o sus bienes de forma accidental. Existe en modalidad personal, familiar, profesional y empresarial. Muchos seguros de hogar la incluyen como cobertura adicional.',
  },
  {
    id: 'desempleo',
    icono: '💼',
    nombre: 'Seguro de Desempleo',
    queCubre: 'Ingresos durante un período de desempleo involuntario',
    quienLoUsa: 'Trabajadores autónomos, directivos, hipotecados',
    obligatorio: false,
    primaOrientativa: '20 – 80 € / mes',
    descripcionDetallada:
      'Complementa la prestación pública por desempleo o la reemplaza para autónomos. Cubre un número limitado de meses y exige período de carencia. Muy útil para autónomos que no cotizan por desempleo en el RETA estándar.',
  },
];

const CONCEPTOS: ConceptoClave[] = [
  {
    termino: 'Prima',
    definicion: 'Precio que paga el asegurado por la cobertura del seguro.',
    ejemplo: 'Pagas 50 € / mes por tu seguro de salud.',
    ampliado:
      'La prima se descompone en: prima pura (coste esperado del riesgo), recargo de gastos (administración, comercialización) y margen de beneficio. Los actuarios la calculan usando tablas de mortalidad, frecuencia de siniestros y estadísticas históricas.',
  },
  {
    termino: 'Siniestro',
    definicion: 'Materialización del riesgo cubierto por la póliza.',
    ejemplo: 'Un accidente de tráfico que activa el seguro de auto.',
    ampliado:
      'Cuando ocurre un siniestro, el asegurado debe notificarlo a la aseguradora en el plazo fijado en la póliza (habitualmente 7 días). La aseguradora envía un perito para valorar los daños antes de indemnizar.',
  },
  {
    termino: 'Franquicia',
    definicion: 'Cantidad que el asegurado asume antes de que pague el seguro.',
    ejemplo: 'Con franquicia de 300 €, si el daño es 1.000 €, el seguro paga 700 €.',
    ampliado:
      'Existen dos tipos: franquicia absoluta (siempre se descuenta del pago) y franquicia relativa (si el daño supera el umbral, el seguro paga TODO). La franquicia reduce la prima y desincentiva siniestros pequeños.',
  },
  {
    termino: 'Coaseguro',
    definicion: 'El asegurado asume un porcentaje fijo del siniestro.',
    ejemplo: 'Coaseguro 20 %: en un daño de 1.000 €, el asegurado paga 200 € siempre.',
    ampliado:
      'Diferente a la franquicia: el coaseguro es proporcional. Se usa mucho en seguros de salud. Su efecto económico es similar: reduce la prima y alinea los incentivos del asegurado para no sobrevalorar siniestros.',
  },
  {
    termino: 'Reaseguro',
    definicion: 'Las aseguradoras también se aseguran entre sí.',
    ejemplo: 'Una catástrofe natural puede superar la capacidad de una sola aseguradora.',
    ampliado:
      'El reaseguro permite a las aseguradoras primarias ceder parte del riesgo a reaseguradoras (ej: Munich Re, Swiss Re). Existen dos modalidades: proporcional (se comparte prima y siniestros en proporción) y no proporcional (el reasegurador solo actúa si el siniestro supera un umbral).',
  },
  {
    termino: 'Actuario',
    definicion: 'Profesional que calcula primas y reservas usando matemáticas y estadística.',
    ejemplo: 'El actuario calcula cuánto debe cobrar un seguro de vida para una persona de 40 años.',
    ampliado:
      'Los actuarios usan tablas de mortalidad, modelos de supervivencia, teoría de la ruina y estadística bayesiana. En España están regulados por el Colegio de Actuarios. Su trabajo garantiza que las aseguradoras tengan reservas suficientes para pagar siniestros futuros.',
  },
  {
    termino: 'Riesgo moral',
    definicion: 'Cuando el asegurado se comporta con menos cuidado por tener seguro.',
    ejemplo: 'Conducir más arriesgado porque "ya está asegurado".',
    ampliado:
      'El riesgo moral (moral hazard) es un problema clásico de información asimétrica. Las aseguradoras lo mitigan con franquicias, coaseguros y límites de cobertura, que hacen que el asegurado siempre asuma parte del coste del siniestro.',
  },
  {
    termino: 'Selección adversa',
    definicion: 'Las personas con más riesgo tienden a contratar más seguros.',
    ejemplo: 'Si no hay revisión médica, solo los enfermos contratan seguro de salud.',
    ampliado:
      'La selección adversa (adverse selection) surge porque el asegurado conoce su propio riesgo mejor que la aseguradora. Para mitigarla, las aseguradoras hacen cuestionarios de salud, períodos de carencia y excluyen enfermedades preexistentes.',
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatEur(value: number): string {
  return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// Curva normal simplificada para el SVG del pool
function normalPdf(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

// ─────────────────────────────────────────────
// Sub-componentes de tabs
// ─────────────────────────────────────────────

function TabTipos(): React.ReactNode {
  const [activo, setActivo] = useState<string>('auto');
  const detalle = TIPOS_SEGURO.find((t) => t.id === activo) ?? TIPOS_SEGURO[0];

  return (
    <div>
      <div className={styles.tiposGrid}>
        {TIPOS_SEGURO.map((tipo) => (
          <button
            key={tipo.id}
            className={`${styles.tipoCard} ${activo === tipo.id ? styles.tipoCardActivo : ''}`}
            onClick={() => setActivo(tipo.id)}
            aria-pressed={activo === tipo.id}
          >
            <span className={styles.tipoIcon} aria-hidden="true">{tipo.icono}</span>
            <span className={styles.tipoNombre}>{tipo.nombre}</span>
            {tipo.obligatorio && (
              <span className={`${styles.obligatorioBadge} ${styles.obligatorioSi}`}>Obligatorio</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.detallePanel} role="region" aria-label={`Detalle de ${detalle.nombre}`}>
        <div className={styles.detalleCabecera}>
          <span className={styles.detalleIcono} aria-hidden="true">{detalle.icono}</span>
          <div>
            <h3 className={styles.detalleTitulo}>{detalle.nombre}</h3>
            {detalle.obligatorio ? (
              <span className={`${styles.obligatorioBadge} ${styles.obligatorioSi}`}>Obligatorio en España</span>
            ) : (
              <span className={`${styles.obligatorioBadge} ${styles.obligatorioNo}`}>Voluntario</span>
            )}
          </div>
        </div>
        <dl className={styles.detalleGrid}>
          <dt>Qué cubre</dt>
          <dd>{detalle.queCubre}</dd>
          <dt>Quién lo usa</dt>
          <dd>{detalle.quienLoUsa}</dd>
          <dt>Prima orientativa</dt>
          <dd className={styles.primaDestacada}>{detalle.primaOrientativa}</dd>
        </dl>
        <p className={styles.detalleDesc}>{detalle.descripcionDetallada}</p>
      </div>
    </div>
  );
}

function TabPrima(): React.ReactNode {
  const [probabilidad, setProbabilidad] = useState<number>(2.0); // %
  const [costeMedio, setCosteMedio] = useState<number>(10000); // €
  const [gastos, setGastos] = useState<number>(20); // %
  const [margen, setMargen] = useState<number>(10); // %

  const { primaPura, totalAnual, totalMensual, costoGastos, costoMargen } = useMemo(() => {
    const prob = probabilidad / 100;
    const primaPura = prob * costeMedio;
    const costoGastos = primaPura * (gastos / 100);
    const costoMargen = primaPura * (margen / 100);
    const totalAnual = primaPura + costoGastos + costoMargen;
    const totalMensual = totalAnual / 12;
    return { primaPura, totalAnual, totalMensual, costoGastos, costoMargen };
  }, [probabilidad, costeMedio, gastos, margen]);

  // Proporciones para barra SVG
  const total = primaPura + costoGastos + costoMargen || 1;
  const anchoSvg = 300;
  const pPura = (primaPura / total) * anchoSvg;
  const pGastos = (costoGastos / total) * anchoSvg;
  const pMargen = (costoMargen / total) * anchoSvg;

  return (
    <div>
      <div className={styles.sectionCard}>
        <p className={styles.formulaTexto}>
          Prima = <strong>(Probabilidad × Coste esperado)</strong> + Gastos + Margen
        </p>
      </div>

      <div className={styles.slidersWrap}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Probabilidad de siniestro
            <span className={styles.sliderValue}>{probabilidad.toFixed(1)} %</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={probabilidad}
            onChange={(e) => setProbabilidad(parseFloat(e.target.value))}
            aria-label="Probabilidad de siniestro"
          />
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Coste medio del siniestro
            <span className={styles.sliderValue}>{formatEur(costeMedio)}</span>
          </label>
          <input
            type="range"
            min={1000}
            max={50000}
            step={500}
            value={costeMedio}
            onChange={(e) => setCosteMedio(parseFloat(e.target.value))}
            aria-label="Coste medio del siniestro"
          />
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Gastos administrativos
            <span className={styles.sliderValue}>{gastos} %</span>
          </label>
          <input
            type="range"
            min={10}
            max={30}
            step={1}
            value={gastos}
            onChange={(e) => setGastos(parseInt(e.target.value))}
            aria-label="Porcentaje de gastos"
          />
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Margen de beneficio
            <span className={styles.sliderValue}>{margen} %</span>
          </label>
          <input
            type="range"
            min={5}
            max={20}
            step={1}
            value={margen}
            onChange={(e) => setMargen(parseInt(e.target.value))}
            aria-label="Margen de beneficio"
          />
        </div>
      </div>

      <div className={styles.resultadoBox}>
        <div className={styles.resultadoFila}>
          <span className={styles.resultadoLabel}>Prima pura (riesgo)</span>
          <span className={styles.resultadoValor}>{formatEur(primaPura)}</span>
        </div>
        <div className={styles.resultadoFila}>
          <span className={styles.resultadoLabel}>Gastos</span>
          <span className={styles.resultadoValor}>{formatEur(costoGastos)}</span>
        </div>
        <div className={styles.resultadoFila}>
          <span className={styles.resultadoLabel}>Margen</span>
          <span className={styles.resultadoValor}>{formatEur(costoMargen)}</span>
        </div>
        <div className={`${styles.resultadoFila} ${styles.resultadoTotal}`}>
          <span className={styles.resultadoLabel}>Prima total anual</span>
          <span className={styles.resultadoValor}>{formatEur(totalAnual)}</span>
        </div>
        <div className={`${styles.resultadoFila} ${styles.resultadoMensual}`}>
          <span className={styles.resultadoLabel}>Prima mensual</span>
          <span className={styles.resultadoValorGrande}>{formatEur(totalMensual)}</span>
        </div>
      </div>

      {/* Barra de desglose SVG */}
      <div className={styles.barraWrap}>
        <p className={styles.barraTitle}>Desglose de la prima</p>
        <svg width={anchoSvg} height={40} role="img" aria-label="Desglose de la prima en barras">
          <rect x={0} y={8} width={pPura} height={24} fill="#2E86AB" rx={3} />
          <rect x={pPura} y={8} width={pGastos} height={24} fill="#48A9A6" rx={3} />
          <rect x={pPura + pGastos} y={8} width={pMargen} height={24} fill="#7FB3D3" rx={3} />
        </svg>
        <div className={styles.barraLeyenda}>
          <span><span className={styles.leyendaDot} style={{ background: '#2E86AB' }} />Riesgo puro</span>
          <span><span className={styles.leyendaDot} style={{ background: '#48A9A6' }} />Gastos</span>
          <span><span className={styles.leyendaDot} style={{ background: '#7FB3D3' }} />Margen</span>
        </div>
      </div>
    </div>
  );
}

function TabPool(): React.ReactNode {
  const [asegurados, setAsegurados] = useState<number>(500);

  const { variabilidad, curvaPoints } = useMemo(() => {
    // Simulación: cada asegurado tiene coste esperado 500 €, desviación 2.000 €
    const costePorAsegurado = 500;
    const desvIndividual = 2000;
    // Por ley de los grandes números, la desv del promedio = desvIndividual / sqrt(N)
    const sigma = desvIndividual / Math.sqrt(asegurados);
    const variabilidad = sigma;

    // Generar puntos para curva normal SVG
    const mu = costePorAsegurado;
    const svgW = 400;
    const svgH = 160;
    const xMin = mu - 4 * sigma;
    const xMax = mu + 4 * sigma;
    const pdfMax = normalPdf(mu, mu, sigma);

    const puntos: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = xMin + (i / 80) * (xMax - xMin);
      const y = normalPdf(x, mu, sigma);
      const svgX = (i / 80) * svgW;
      const svgY = svgH - (y / pdfMax) * (svgH - 20);
      puntos.push(`${svgX},${svgY}`);
    }
    const curvaPoints = puntos.join(' ');

    return { variabilidad, curvaPoints };
  }, [asegurados]);

  const colorCurva = asegurados < 500 ? '#E74C3C' : asegurados < 3000 ? '#F39C12' : '#27AE60';

  return (
    <div>
      <div className={styles.sectionCard}>
        <p className={styles.poolIntro}>
          La <strong>Ley de los Grandes Números</strong> garantiza que, cuantos más asegurados haya en el pool,
          más predecible es el coste promedio — y más viable es el seguro.
        </p>
      </div>

      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          Asegurados en el pool
          <span className={styles.sliderValue}>{asegurados.toLocaleString('es-ES')}</span>
        </label>
        <input
          type="range"
          min={10}
          max={10000}
          step={10}
          value={asegurados}
          onChange={(e) => setAsegurados(parseInt(e.target.value))}
          aria-label="Número de asegurados"
        />
      </div>

      <div className={styles.variabilidadBadge} style={{ borderColor: colorCurva, color: colorCurva }}>
        Variabilidad por asegurado: <strong>{formatEur(variabilidad)}</strong>
        {asegurados < 500 && <span className={styles.badgeAlerta}> ⚠ Pool inestable</span>}
        {asegurados >= 500 && asegurados < 3000 && <span className={styles.badgeOk}> Pool aceptable</span>}
        {asegurados >= 3000 && <span className={styles.badgeExcelente}> Pool estable</span>}
      </div>

      <div className={styles.poolSvgWrapper} role="img" aria-label={`Distribución del coste con ${asegurados} asegurados`}>
        <svg width="100%" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
          {/* Eje X */}
          <line x1={0} y1={160} x2={400} y2={160} stroke="var(--text-muted)" strokeWidth={1} />
          {/* Área bajo la curva */}
          <polyline
            points={`0,160 ${curvaPoints} 400,160`}
            fill={colorCurva}
            fillOpacity={0.15}
            stroke={colorCurva}
            strokeWidth={2}
          />
          {/* Línea central */}
          <line x1={200} y1={20} x2={200} y2={160} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="4,3" />
          <text x={200} y={175} textAnchor="middle" fontSize={11} fill="var(--text-secondary)">
            Coste promedio: 500 €
          </text>
        </svg>
      </div>

      <p className={styles.poolExplicacion}>
        Con <strong>{asegurados.toLocaleString('es-ES')} asegurados</strong>, la desviación esperada del coste promedio
        es <strong>{formatEur(variabilidad)}</strong>. Cuantos más asegurados, más estrecha y predecible es la distribución,
        y menor es el margen de seguridad que necesita la aseguradora.
      </p>
    </div>
  );
}

function TabConceptos(): React.ReactNode {
  const [expandido, setExpandido] = useState<string | null>(null);

  return (
    <div className={styles.conceptosGrid}>
      {CONCEPTOS.map((c) => {
        const estaExpandido = expandido === c.termino;
        return (
          <button
            key={c.termino}
            className={`${styles.conceptoCard} ${estaExpandido ? styles.conceptoCardExpanded : ''}`}
            onClick={() => setExpandido(estaExpandido ? null : c.termino)}
            aria-expanded={estaExpandido}
          >
            <h3 className={styles.conceptoTermino}>{c.termino}</h3>
            <p className={styles.conceptoDefinicion}>{c.definicion}</p>
            <p className={styles.conceptoEjemplo}><em>Ej: {c.ejemplo}</em></p>
            {estaExpandido && (
              <p className={styles.conceptoAmpliado}>{c.ampliado}</p>
            )}
            <span className={styles.conceptoToggle} aria-hidden="true">
              {estaExpandido ? '▲ Cerrar' : '▼ Más info'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'tipos', label: '🛡️ Tipos de seguro' },
  { id: 'prima', label: '🧮 Cálculo de prima' },
  { id: 'pool', label: '👥 Pool de riesgo' },
  { id: 'conceptos', label: '📖 Conceptos clave' },
];

export default function VisualizadorSegurosRiesgo(): React.ReactNode {
  const [tabActiva, setTabActiva] = useState<TabId>('tipos');

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Seguros y Gestión del Riesgo</h1>
        <p className={styles.heroSubtitle}>
          Cómo funcionan los seguros: tipos, prima actuarial, mutualización y conceptos clave
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Navegación de tabs */}
        <nav className={styles.tabNav} aria-label="Secciones del visualizador">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
              aria-current={tabActiva === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Contenido de tab */}
        <div className={styles.tabContent}>
          {tabActiva === 'tipos' && <TabTipos />}
          {tabActiva === 'prima' && <TabPrima />}
          {tabActiva === 'pool' && <TabPool />}
          {tabActiva === 'conceptos' && <TabConceptos />}
        </div>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Fundamentos de seguros y gestión del riesgo"
          subtitle="Cómo los seguros transforman la incertidumbre en certeza económica"
        >
          {/* Sección 1 — Tabla Comparativa */}
          <h3>Comparativa de seguros principales en España</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de seguro</th>
                  <th>Qué cubre</th>
                  <th>Obligatorio</th>
                  <th>Prima media anual</th>
                  <th>Regulador España</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vida</td>
                  <td>Fallecimiento o invalidez permanente</td>
                  <td>No (vinculado si hay hipoteca)</td>
                  <td>180 – 720 €</td>
                  <td>DGSFP / Ministerio de Economía</td>
                </tr>
                <tr>
                  <td>Salud</td>
                  <td>Asistencia médica privada, hospitalización, especialistas</td>
                  <td>No (sistema público universal)</td>
                  <td>480 – 1.800 €</td>
                  <td>DGSFP</td>
                </tr>
                <tr>
                  <td>Auto (RC)</td>
                  <td>Daños a terceros causados por el vehículo</td>
                  <td>Sí — RDL 8/2004</td>
                  <td>360 – 1.440 €</td>
                  <td>DGSFP / DGT</td>
                </tr>
                <tr>
                  <td>Hogar</td>
                  <td>Daños a estructura y contenido de la vivienda</td>
                  <td>No (exigido por bancos en hipotecas)</td>
                  <td>180 – 600 €</td>
                  <td>DGSFP</td>
                </tr>
                <tr>
                  <td>RC (general)</td>
                  <td>Daños causados involuntariamente a terceros</td>
                  <td>No (obligatorio en algunas profesiones)</td>
                  <td>60 – 480 €</td>
                  <td>DGSFP</td>
                </tr>
                <tr>
                  <td>Desempleo</td>
                  <td>Ingresos durante paro involuntario</td>
                  <td>No</td>
                  <td>240 – 960 €</td>
                  <td>DGSFP</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sección 2 — Casos de Uso */}
          <h3>¿Quién necesita qué seguro? Cuatro perfiles reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <h4>Estudiante universitario</h4>
              <p>
                Contrata un seguro de responsabilidad civil para prácticas en empresa. Si durante las prácticas
                causa daños a equipos o a terceros, la RC profesional cubre la indemnización. Muchas universidades
                lo exigen como requisito para la matrícula de prácticas externas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
              <h4>Familia con hipoteca</h4>
              <p>
                Necesita seguro de vida vinculado al préstamo (el banco lo suele exigir) y seguro de hogar
                obligatorio con la entidad financiera. El seguro de vida garantiza que si fallece el titular,
                la deuda queda saldada y la familia no pierde la vivienda.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
              <h4>Autónomo</h4>
              <p>
                Necesita RC profesional para cubrir errores en su trabajo (un diseñador web cuyo código provoca
                pérdidas al cliente, por ejemplo) y seguro de accidentes si no tiene empleados. Los autónomos
                no tienen cobertura automática de accidente laboral del RETA estándar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🚗</span>
              <h4>Conductor novel</h4>
              <p>
                Calcula cuánto sube la prima si añade conductores ocasionales a su póliza de auto. En España,
                añadir un conductor menor de 25 años puede incrementar la prima un 30-60 %. La comparación de
                al menos 3 aseguradoras puede ahorrar cientos de euros al año.
              </p>
            </div>
          </div>

          {/* Sección 3 — FAQ */}
          <h3>Preguntas frecuentes sobre seguros</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Por qué sube mi prima si no he tenido siniestros?</strong>
              <p>
                Las primas se fijan en base a estadísticas del colectivo, no solo de tu historial individual.
                Si aumenta la siniestralidad media del grupo al que perteneces (tu edad, zona geográfica, tipo
                de vehículo), tu prima sube aunque nunca hayas declarado un siniestro.
              </p>
              <span className={styles.faqTip}>Consejo: negocia un bonus-malus explícito en la póliza.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la selección adversa y por qué me piden tantos datos médicos?</strong>
              <p>
                La selección adversa ocurre porque quien más necesita el seguro (mayor riesgo real) es quien
                más lo contrata. Para equilibrar el pool, las aseguradoras piden cuestionarios de salud,
                períodos de carencia y excluyen enfermedades preexistentes.
              </p>
              <span className={styles.faqTip}>Declara siempre tu estado de salud verazmente: ocultar enfermedades puede anular la cobertura.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Para qué sirve el reaseguro si ya existe el seguro?</strong>
              <p>
                El reaseguro permite a las aseguradoras primarias transferir parte del riesgo a reaseguradoras
                globales (Munich Re, Swiss Re). Sin reaseguro, una catástrofe natural podría arruinar a una
                aseguradora entera. Es el «seguro del seguro».
              </p>
              <span className={styles.faqTip}>El reaseguro es invisible para el asegurado pero garantiza la solvencia del sistema.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo funciona la franquicia: siempre es mejor elegirla más alta?</strong>
              <p>
                La franquicia más alta reduce la prima pero aumenta tu exposición económica en cada siniestro.
                Es mejor elegir una franquicia alta si tienes un fondo de emergencia suficiente para absorberla.
                Si no, una franquicia baja te protege mejor aunque la prima sea mayor.
              </p>
              <span className={styles.faqTip}>Regla práctica: la franquicia no debería superar el 10-15 % de tus ahorros líquidos.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué protección tengo si la aseguradora quiebra?</strong>
              <p>
                En España, el Consorcio de Compensación de Seguros actúa como fondo de garantía. Cubre seguros
                obligatorios (auto RC) si la aseguradora quiebra. Para seguros voluntarios la protección es más
                limitada, aunque los procedimientos de liquidación ordenada protegen parcialmente a los asegurados.
              </p>
              <span className={styles.faqTip}>Verifica siempre que tu aseguradora esté inscrita en el Registro de la DGSFP.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Puedo tener dos seguros del mismo tipo y cobrar dos veces?</strong>
              <p>
                No. El principio de indemnización impide el enriquecimiento injusto: cobrarás la indemnización
                real del daño, repartida entre las dos aseguradoras. Tener duplicado solo genera costes extra
                sin beneficio adicional. La excepción son seguros de suma fija (vida, accidentes).
              </p>
              <span className={styles.faqTip}>Revisa si tu seguro de hogar ya incluye RC personal antes de contratar una póliza RC separada.</span>
            </li>
          </ul>

          {/* Sección 4 — Guía Paso a Paso */}
          <h3>Cómo elegir un seguro sin pagar de más</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica el riesgo que quieres cubrir y su probabilidad estimada.</strong>
                <p>
                  Pregúntate: ¿qué pasaría si ocurriese? ¿Podría asumirlo económicamente sin seguro?
                  Solo asegura riesgos que no podrías absorber tú mismo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Calcula el coste que asumiría sin seguro (peor caso).</strong>
                <p>
                  Si el peor caso es un daño de 500 € y tienes ahorros suficientes, quizás no necesitas
                  seguro. Si el peor caso es 50.000 €, el seguro es indispensable.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Compara al menos 3 presupuestos con las mismas coberturas.</strong>
                <p>
                  Usa comparadores online y llama directamente a aseguradoras. Exige que los presupuestos
                  incluyan las mismas coberturas, franquicias y límites para comparar en igualdad de condiciones.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Lee la letra pequeña: exclusiones, franquicias, carencias y topes de indemnización.</strong>
                <p>
                  Las exclusiones son lo más importante de la póliza. Un seguro barato con muchas exclusiones
                  puede dejarte sin cobertura justo cuando más la necesitas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Revisa la póliza anualmente y actualiza el capital asegurado.</strong>
                <p>
                  La inflación erosiona el valor del capital asegurado. Un hogar asegurado por 100.000 €
                  hace 10 años puede estar infraasegurado hoy. Revisa y actualiza cada año.
                </p>
              </div>
            </li>
          </ol>

          {/* Sección 5 — Mejores Prácticas */}
          <h3>Mejores prácticas para gestionar tus seguros</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <p>
                <strong>La franquicia reduce la prima pero aumenta tu riesgo real</strong> — calcula el equilibrio
                entre el ahorro en prima y tu capacidad de absorber la franquicia en caso de siniestro.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <p>
                <strong>Agrupa los seguros en una sola aseguradora</strong>: los descuentos por multiproducto
                suelen superar el 15 %. Hogar + auto + vida con la misma compañía puede ahorrar
                cientos de euros al año.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
              <p>
                <strong>Declara siempre toda la información verazmente</strong>: el riesgo moral se penaliza
                con anulación de cobertura. Una declaración inexacta puede invalidar toda la póliza.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <p>
                <strong>Conserva siempre copia de la póliza en papel y digital</strong> — la aseguradora puede
                cambiar condiciones en cada renovación. Guarda las versiones anteriores para comparar.
              </p>
            </div>
          </div>

          {/* Sección 6 — Warning Box */}
          <div className={styles.warningBox}>
            <strong>Errores frecuentes al contratar seguros:</strong>
            <ul>
              <li>
                <strong>Asegurar por encima del valor real del bien:</strong> cobrarás solo el valor de mercado,
                no el capital asegurado — estás pagando de más sin beneficio adicional.
              </li>
              <li>
                <strong>Ignorar las carencias:</strong> los seguros de salud tienen períodos sin cobertura de
                3-12 meses para enfermedades preexistentes. Contratar ante una enfermedad ya diagnosticada
                no tiene efecto inmediato.
              </li>
              <li>
                <strong>No revisar la póliza al renovar:</strong> las aseguradoras pueden cambiar condiciones
                en la renovación anual. Lee siempre el nuevo condicionado antes de aceptar.
              </li>
              <li>
                <strong>Confundir seguro de vida con seguro de decesos:</strong> el seguro de vida paga un
                capital a los beneficiarios; el seguro de decesos cubre los gastos del funeral. Son productos
                completamente distintos.
              </li>
              <li>
                <strong>No contratar RC como autónomo:</strong> la responsabilidad civil profesional no tiene
                límite económico sin seguro — un solo error puede suponer una reclamación de cientos de miles
                de euros.
              </li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('visualizador-seguros-riesgo')} />
      <ShareCard appName="visualizador-seguros-riesgo" />
      <Footer appName="visualizador-seguros-riesgo" />
    </div>
  );
}
