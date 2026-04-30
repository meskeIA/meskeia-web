'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './HistoriaEpidemias.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Epidemia {
  id: string;
  nombre: string;
  anio: number;
  duracion: number;
  muertos: number;
  patogeno: 'bacteria' | 'virus' | 'parasito' | 'prion';
  region: 'global' | 'europa' | 'asia' | 'america' | 'africa';
  legado: string;
  descripcion: string;
}

type TabActiva = 'timeline' | 'mortalidad' | 'factores' | 'patogenos';
type OrdenBarras = 'mortalidad' | 'anio' | 'patogeno';

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const EPIDEMIAS: Epidemia[] = [
  { id: 'plaga-atenas', nombre: 'Plaga de Atenas', anio: -430, duracion: 4, muertos: 0.075, patogeno: 'bacteria', region: 'europa', legado: 'Primera descripción clínica detallada de una epidemia (Tucídides)', descripcion: 'Pandemia durante la guerra del Peloponeso que mató a ~75.000 atenienses incluyendo a Pericles. Patógeno exacto aún debatido.' },
  { id: 'plaga-antonina', nombre: 'Plaga Antonina', anio: 165, duracion: 15, muertos: 5, patogeno: 'virus', region: 'europa', legado: 'Primer gran uso de cuarentena militar en el ejército romano', descripcion: 'Pandemia (posiblemente viruela) que devastó el Imperio Romano y mató a varios emperadores.' },
  { id: 'peste-justiniano', nombre: 'Peste de Justiniano', anio: 541, duracion: 200, muertos: 25, patogeno: 'bacteria', region: 'europa', legado: 'Primera pandemia de peste bubónica documentada; colapso del Imperio Bizantino', descripcion: 'Primera gran pandemia de Yersinia pestis. Llegó a matar 5.000 personas/día en Constantinopla.' },
  { id: 'muerte-negra', nombre: 'Muerte Negra', anio: 1347, duracion: 7, muertos: 75, patogeno: 'bacteria', region: 'europa', legado: 'Inventó la cuarentena moderna (quarantina: 40 días en Venecia)', descripcion: 'La mayor pandemia de la historia. Mató entre 1/3 y 1/2 de la población europea. Causada por Yersinia pestis.' },
  { id: 'viruela-america', nombre: 'Viruela en América', anio: 1519, duracion: 30, muertos: 56, patogeno: 'virus', region: 'america', legado: 'Demostró el impacto devastador de patógenos nuevos en poblaciones sin inmunidad previa', descripcion: 'La viruela y otras enfermedades europeas diezmaron hasta el 90% de la población indígena americana.' },
  { id: 'colera-1831', nombre: 'Cólera Asiático (1831)', anio: 1831, duracion: 20, muertos: 1, patogeno: 'bacteria', region: 'global', legado: 'John Snow mapeó el brote de Londres (1854) fundando la epidemiología moderna', descripcion: 'Primera pandemia de cólera que llegó a Europa. Causó reformas sanitarias masivas en ciudades industriales.' },
  { id: 'gripe-espaniola', nombre: 'Gripe Española', anio: 1918, duracion: 2, muertos: 50, patogeno: 'virus', region: 'global', legado: 'Impulsó la creación de la OMS y los sistemas de vigilancia epidemiológica globales', descripcion: 'La pandemia de gripe más letal de la historia moderna. Mató más personas que la Primera Guerra Mundial.' },
  { id: 'polio', nombre: 'Epidemias de Polio', anio: 1916, duracion: 40, muertos: 0.5, patogeno: 'virus', region: 'america', legado: 'Desarrollo de la vacuna Salk (1955) y Sabin (1961) — modelo de vacunación masiva', descripcion: 'Epidemias recurrentes de poliomielitis en EE.UU. y Europa en la primera mitad del siglo XX.' },
  { id: 'vih-sida', nombre: 'VIH/SIDA', anio: 1981, duracion: 999, muertos: 40, patogeno: 'virus', region: 'global', legado: 'Impulsó la investigación de antivirales y la medicina de enfermedades infecciosas crónicas', descripcion: 'Pandemia en curso. Causada por el VIH. Los antiretrovirales modernos permiten una vida normal pero no hay cura.' },
  { id: 'covid19', nombre: 'COVID-19', anio: 2019, duracion: 3, muertos: 7, patogeno: 'virus', region: 'global', legado: 'Aceleró el desarrollo de vacunas ARNm y las plataformas de vigilancia genómica global', descripcion: 'Pandemia causada por SARS-CoV-2. Primera pandemia gestionada con vacunas desarrolladas en menos de 1 año.' },
];

// ─────────────────────────────────────────────
// Datos de patógenos
// ─────────────────────────────────────────────

const DATOS_PATOGENOS: Record<string, { titulo: string; descripcion: string; tratamiento: string; ejemplo: string; color: string }> = {
  bacteria: {
    titulo: 'Bacterias',
    descripcion: 'Microorganismos unicelulares procariotas. Pueden reproducirse de forma independiente. Algunas producen toxinas mortales y pueden evolucionar resistencia a antibióticos.',
    tratamiento: 'Antibióticos (penicilina, cefalosporinas, fluoroquinolonas). La resistencia antimicrobiana es una amenaza creciente.',
    ejemplo: 'Yersinia pestis (Muerte Negra), Vibrio cholerae (cólera)',
    color: '#e53e3e',
  },
  virus: {
    titulo: 'Virus',
    descripcion: 'Agentes acelulares que necesitan una célula huésped para replicarse. Alta tasa de mutación que dificulta el desarrollo de vacunas duraderas.',
    tratamiento: 'Antivirales (oseltamivir, antiretrovirales), vacunas. Sin tratamiento específico para muchos virus.',
    ejemplo: 'Influenza H1N1 (Gripe Española), SARS-CoV-2 (COVID-19), VIH',
    color: '#dd6b20',
  },
  parasito: {
    titulo: 'Parásitos',
    descripcion: 'Organismos que viven a expensas de un huésped. Pueden ser protozoos (unicelulares) o helmintos (multicelulares). Ciclos de vida complejos con vectores intermediarios.',
    tratamiento: 'Antiparasitarios (cloroquina, artemisinina para malaria, albendazol). Lucha vectorial contra mosquitos y otros vectores.',
    ejemplo: 'Plasmodium (malaria), Trypanosoma (enfermedad del sueño)',
    color: '#38a169',
  },
  prion: {
    titulo: 'Priones',
    descripcion: 'Proteínas mal plegadas que inducen el plegamiento incorrecto en otras proteínas normales. No contienen material genético. Resistentes a todos los tratamientos conocidos.',
    tratamiento: 'Sin tratamiento efectivo actualmente. Siempre fatal. Investigación activa en proteínas chaperona y anticuerpos.',
    ejemplo: 'Enfermedad de Creutzfeldt-Jakob (ECJ), kuru, "vacas locas" (BSE)',
    color: '#805ad5',
  },
};

// Datos de factores por epidemia
const FACTORES: Record<string, { r0: number; cfr: string; medidas: string[]; legadoMedico: string }> = {
  'plaga-atenas': { r0: 1.5, cfr: '20-25%', medidas: ['Aislamiento de enfermos', 'Cremación de cadáveres'], legadoMedico: 'Primera descripción clínica sistemática de síntomas infecciosos' },
  'plaga-antonina': { r0: 2.0, cfr: '7-10%', medidas: ['Cuarentena militar', 'Aislamiento territorial'], legadoMedico: 'Galeno documentó síntomas y tratamientos — base de la medicina occidental medieval' },
  'peste-justiniano': { r0: 2.5, cfr: '30-50%', medidas: ['Aislamiento de enfermos', 'Cierre de fronteras', 'Enterramientos masivos'], legadoMedico: 'Identificación de bubones como signo diagnóstico; primeros intentos de trazabilidad geográfica' },
  'muerte-negra': { r0: 3.5, cfr: '30-60%', medidas: ['Cuarentena de 40 días (Venecia)', 'Expulsión de enfermos', 'Quema de ropa y objetos'], legadoMedico: 'Invención de la cuarentena formal; primeras autopsias para identificar causas de muerte' },
  'viruela-america': { r0: 5.0, cfr: '30-90%', medidas: ['Ninguna efectiva (población sin inmunidad)', 'Aislamiento tardío'], legadoMedico: 'Llevó al desarrollo posterior de la vacuna de la viruela (Jenner, 1796) — primera vacuna de la historia' },
  'colera-1831': { r0: 2.0, cfr: '25-50%', medidas: ['Cuarentena portuaria', 'Aislamiento hospitalario', 'Mejoras en agua potable'], legadoMedico: 'John Snow y la epidemiología moderna; germ theory; reforma sanitaria urbana' },
  'gripe-espaniola': { r0: 2.8, cfr: '2-3%', medidas: ['Cierre de escuelas y teatros', 'Uso de mascarillas', 'Cancelación de eventos'], legadoMedico: 'Creación de la OMS; sistemas globales de vigilancia de gripe; desarrollo de vacunas de gripe' },
  'polio': { r0: 4.0, cfr: '0.5-5%', medidas: ['Cierre de piscinas y parques', 'Aislamiento de enfermos', 'Vacunación masiva (desde 1955)'], legadoMedico: 'Vacuna Salk (1955) y Sabin (1961); modelo de campañas de vacunación masiva global' },
  'vih-sida': { r0: 2.0, cfr: '90%+ sin tratamiento', medidas: ['Educación sexual', 'Uso de preservativos', 'Terapia antiretroviral (desde 1996)'], legadoMedico: 'Revolución en antivirales; concepto de carga viral; medicina de enfermedades infecciosas crónicas' },
  'covid19': { r0: 3.3, cfr: '1-3%', medidas: ['Confinamiento', 'Uso de mascarillas', 'Distanciamiento social', 'Vacunación ARNm'], legadoMedico: 'Vacunas ARNm en tiempo récord (<1 año); secuenciación genómica masiva; teleasistencia médica' },
};

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

const AÑO_MIN = -500;
const AÑO_MAX = 2025;
const RANGO = AÑO_MAX - AÑO_MIN;
const SVG_WIDTH = 900;
const SVG_HEIGHT = 180;
const MARGEN_X = 40;
const AREA_X = SVG_WIDTH - MARGEN_X * 2;

function xParaAnio(anio: number): number {
  return MARGEN_X + ((anio - AÑO_MIN) / RANGO) * AREA_X;
}

function radioParaMuertos(muertos: number): number {
  const base = Math.log10(muertos + 0.01) + 2;
  return Math.max(5, Math.min(22, base * 5));
}

function claseCirculo(patogeno: Epidemia['patogeno']): string {
  const mapa: Record<Epidemia['patogeno'], string> = {
    bacteria: styles.circuloBacteria,
    virus: styles.circuloVirus,
    parasito: styles.circuloParasito,
    prion: styles.circuloPrion,
  };
  return mapa[patogeno];
}

function colorPatogeno(patogeno: Epidemia['patogeno']): string {
  return DATOS_PATOGENOS[patogeno]?.color ?? '#888';
}

function formatMuertos(m: number): string {
  if (m < 1) return `${(m * 1000).toFixed(0)}K`;
  return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline({ epidemias, seleccionada, onSeleccionar }: {
  epidemias: Epidemia[];
  seleccionada: Epidemia | null;
  onSeleccionar: (e: Epidemia | null) => void;
}) {
  const marcas: number[] = [];
  for (let a = -400; a <= 2000; a += 200) marcas.push(a);

  return (
    <div className={styles.tabContent}>
      <div className={styles.timelineSvgWrapper} role="img" aria-label="Línea temporal de epidemias históricas">
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" style={{ minWidth: '600px', display: 'block' }}>
          {/* Eje X */}
          <line x1={MARGEN_X} y1={110} x2={SVG_WIDTH - MARGEN_X} y2={110} stroke="var(--text-muted)" strokeWidth={1.5} />

          {/* Marcas de año */}
          {marcas.map(a => (
            <g key={a}>
              <line x1={xParaAnio(a)} y1={106} x2={xParaAnio(a)} y2={114} stroke="var(--text-muted)" strokeWidth={1} />
              <text x={xParaAnio(a)} y={128} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
                {a < 0 ? `${Math.abs(a)} a.C.` : a}
              </text>
            </g>
          ))}

          {/* Epidemias */}
          {epidemias.map((ep, idx) => {
            const cx = xParaAnio(ep.anio);
            const radio = radioParaMuertos(ep.muertos);
            // Alternar arriba/abajo para evitar solapamiento
            const cy = idx % 2 === 0 ? 85 : 60;
            const selec = seleccionada?.id === ep.id;
            return (
              <g key={ep.id} style={{ cursor: 'pointer' }} onClick={() => onSeleccionar(selec ? null : ep)} role="button" aria-label={`${ep.nombre} (${ep.anio < 0 ? Math.abs(ep.anio) + ' a.C.' : ep.anio})`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={radio}
                  fill={colorPatogeno(ep.patogeno)}
                  opacity={selec ? 1 : 0.72}
                  stroke={selec ? '#fff' : 'transparent'}
                  strokeWidth={selec ? 2.5 : 0}
                />
                {radio > 12 && (
                  <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={7} fill="#fff" fontWeight="600" pointerEvents="none">
                    {ep.nombre.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda */}
      <div className={styles.leyenda}>
        {(['bacteria', 'virus', 'parasito', 'prion'] as const).map(p => (
          <span key={p} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: colorPatogeno(p) }} aria-hidden="true" />
            {DATOS_PATOGENOS[p].titulo}
          </span>
        ))}
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaColor} style={{ background: 'var(--text-muted)', borderRadius: '50%', width: '10px', height: '10px', display: 'inline-block' }} aria-hidden="true" />
          Tamaño = mortalidad
        </span>
      </div>

      {/* Panel de detalle */}
      {seleccionada && (
        <div className={styles.detallePanel} role="region" aria-label={`Detalle de ${seleccionada.nombre}`}>
          <button className={styles.cerrarDetalle} onClick={() => onSeleccionar(null)} aria-label="Cerrar detalle">✕</button>
          <h3 className={styles.detalleTitulo}>{seleccionada.nombre}</h3>
          <p className={styles.detalleAnio}>
            <strong>Año:</strong> {seleccionada.anio < 0 ? `${Math.abs(seleccionada.anio)} a.C.` : seleccionada.anio}
            {' · '}
            <strong>Duración:</strong> {seleccionada.duracion === 999 ? 'En curso' : `${seleccionada.duracion} años`}
          </p>
          <p className={styles.detalleMuertos}>
            <span aria-hidden="true">💀</span> <strong>Mortalidad estimada:</strong> {formatMuertos(seleccionada.muertos)} muertos
          </p>
          <p className={styles.detalleDescripcion}>{seleccionada.descripcion}</p>
          <div className={styles.detalleLegado}>
            <strong>Legado médico:</strong> {seleccionada.legado}
          </div>
        </div>
      )}

      <p className={styles.instruccionTimeline}>Haz clic en un círculo para ver los detalles de esa epidemia.</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Comparativa de Mortalidad
// ─────────────────────────────────────────────

function TabMortalidad({ epidemias }: { epidemias: Epidemia[] }) {
  const [orden, setOrden] = useState<OrdenBarras>('mortalidad');

  const ordenadas = [...epidemias].sort((a, b) => {
    if (orden === 'mortalidad') return b.muertos - a.muertos;
    if (orden === 'anio') return a.anio - b.anio;
    return a.patogeno.localeCompare(b.patogeno);
  });

  const maxMuertos = Math.max(...epidemias.map(e => e.muertos));

  return (
    <div className={styles.tabContent}>
      <div className={styles.ordenControles}>
        <span>Ordenar por:</span>
        {([['mortalidad', 'Mortalidad'], ['anio', 'Año'], ['patogeno', 'Patógeno']] as [OrdenBarras, string][]).map(([val, label]) => (
          <button
            key={val}
            className={`${styles.ordenBtn} ${orden === val ? styles.ordenBtnActivo : ''}`}
            onClick={() => setOrden(val)}
            aria-pressed={orden === val}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.barrasWrapper} role="list" aria-label="Comparativa de mortalidad de epidemias">
        {ordenadas.map(ep => {
          const pct = (ep.muertos / maxMuertos) * 100;
          return (
            <div key={ep.id} className={styles.barraHorizontal} role="listitem">
              <span className={styles.barraLabel}>{ep.nombre}</span>
              <div className={styles.barraTrack}>
                <div
                  className={styles.barraFill}
                  style={{ width: `${pct}%`, background: colorPatogeno(ep.patogeno) }}
                  role="progressbar"
                  aria-valuenow={ep.muertos}
                  aria-valuemin={0}
                  aria-valuemax={maxMuertos}
                  aria-label={`${ep.nombre}: ${formatMuertos(ep.muertos)}`}
                />
              </div>
              <span className={styles.barraValor}>{formatMuertos(ep.muertos)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Factores y Respuestas
// ─────────────────────────────────────────────

function TabFactores({ epidemias }: { epidemias: Epidemia[] }) {
  const [epId, setEpId] = useState<string>('muerte-negra');
  const ep = epidemias.find(e => e.id === epId);
  const factores = ep ? FACTORES[ep.id] : null;

  return (
    <div className={styles.tabContent}>
      <div className={styles.selectorRow}>
        <label htmlFor="selectEpidemiaFactores" className={styles.selectorLabel}>Selecciona una epidemia:</label>
        <select
          id="selectEpidemiaFactores"
          className={styles.selectEpidemia}
          value={epId}
          onChange={e => setEpId(e.target.value)}
        >
          {epidemias.map(e => (
            <option key={e.id} value={e.id}>{e.nombre} ({e.anio < 0 ? `${Math.abs(e.anio)} a.C.` : e.anio})</option>
          ))}
        </select>
      </div>

      {ep && factores && (
        <div className={styles.factoresGrid}>
          {/* Transmisibilidad R0 */}
          <div className={styles.factorCard}>
            <h4 className={styles.factorTitulo}>Transmisibilidad (R0)</h4>
            <div className={styles.r0Badge}>{factores.r0.toFixed(1)}</div>
            <p className={styles.factorDesc}>
              Cada persona infectada contagia a <strong>{factores.r0.toFixed(1)}</strong> personas de media.
              {factores.r0 >= 4 ? ' Muy alto: difusión explosiva.' : factores.r0 >= 2.5 ? ' Alto: epidemia sostenida.' : ' Moderado: controlable con medidas básicas.'}
            </p>
            <div className={styles.r0Barra}>
              <div className={styles.r0Relleno} style={{ width: `${Math.min(100, (factores.r0 / 6) * 100)}%` }} />
            </div>
            <span className={styles.r0Escala}>0 ——— 6</span>
          </div>

          {/* Mortalidad CFR */}
          <div className={styles.factorCard}>
            <h4 className={styles.factorTitulo}>Mortalidad (CFR)</h4>
            <div className={styles.cfrBadge}>{factores.cfr}</div>
            <p className={styles.factorDesc}>
              Case Fatality Rate: porcentaje de infectados que fallecen. Sin tratamiento y en condiciones históricas.
            </p>
            <p className={styles.factorSubdato}>
              <strong>Total estimado:</strong> {formatMuertos(ep.muertos)} muertos
            </p>
          </div>

          {/* Respuesta Social */}
          <div className={styles.factorCard}>
            <h4 className={styles.factorTitulo}>Respuesta Social</h4>
            <ul className={styles.medidasLista}>
              {factores.medidas.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Legado Médico */}
          <div className={styles.factorCard}>
            <h4 className={styles.factorTitulo}>Legado Médico</h4>
            <p className={styles.factorLegado}>{factores.legadoMedico}</p>
            <p className={styles.factorLegadoOriginal}><em>{ep.legado}</em></p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Patógenos
// ─────────────────────────────────────────────

function TabPatogenos({ epidemias }: { epidemias: Epidemia[] }) {
  const tipos = ['bacteria', 'virus', 'parasito', 'prion'] as const;

  return (
    <div className={styles.tabContent}>
      <div className={styles.patogenosGrid}>
        {tipos.map(tipo => {
          const datos = DATOS_PATOGENOS[tipo];
          const epsDeEseTipo = epidemias.filter(e => e.patogeno === tipo);
          return (
            <div key={tipo} className={styles.patogenoCard}>
              <h3 className={styles.patogenoTitulo} style={{ color: datos.color }}>{datos.titulo}</h3>
              <p className={styles.patogenoDesc}>{datos.descripcion}</p>
              <div className={styles.patogenoSeccion}>
                <strong>Tratamiento:</strong>
                <p>{datos.tratamiento}</p>
              </div>
              <div className={styles.patogenoSeccion}>
                <strong>Ejemplos históricos:</strong>
                <ul className={styles.patogenoLista}>
                  {epsDeEseTipo.map(e => (
                    <li key={e.id}>{e.nombre} ({e.anio < 0 ? `${Math.abs(e.anio)} a.C.` : e.anio})</li>
                  ))}
                  {epsDeEseTipo.length === 0 && <li>Sin ejemplos en este conjunto</li>}
                </ul>
              </div>
              <div className={styles.patogenoEjemplo}>
                <strong>Referente clave:</strong> {datos.ejemplo}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function HistoriaEpidemias() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');
  const [epidemiaSeleccionada, setEpidemiaSeleccionada] = useState<Epidemia | null>(null);

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'mortalidad', label: 'Mortalidad' },
    { id: 'factores', label: 'Factores y Respuestas' },
    { id: 'patogenos', label: 'Patógenos' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de las Epidemias</h1>
        <p className={styles.heroSubtitle}>
          Cronología interactiva de las grandes pandemias — mortalidad, patógenos y legado médico
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Navegación de tabs */}
        <nav className={styles.tabNav} aria-label="Secciones del visualizador">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
              aria-pressed={tabActiva === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Contenido de tabs */}
        <div className={styles.sectionCard}>
          {tabActiva === 'timeline' && (
            <TabTimeline
              epidemias={EPIDEMIAS}
              seleccionada={epidemiaSeleccionada}
              onSeleccionar={setEpidemiaSeleccionada}
            />
          )}
          {tabActiva === 'mortalidad' && (
            <TabMortalidad epidemias={EPIDEMIAS} />
          )}
          {tabActiva === 'factores' && (
            <TabFactores epidemias={EPIDEMIAS} />
          )}
          {tabActiva === 'patogenos' && (
            <TabPatogenos epidemias={EPIDEMIAS} />
          )}
        </div>
      </main>

      <EducationalSection
        title="Historia de las grandes pandemias"
        subtitle="Cómo las enfermedades infecciosas moldearon la historia y la medicina"
      >
        {/* Sección 1: Tabla Comparativa */}
        <h3>Comparativa de epidemias históricas</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Epidemia</th>
                <th>Año</th>
                <th>Agente</th>
                <th>Muertos estimados</th>
                <th>R0 aprox.</th>
                <th>CFR aprox.</th>
                <th>Legado médico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Muerte Negra</td>
                <td>1347</td>
                <td>Bacteria (<em>Yersinia pestis</em>)</td>
                <td>75 millones</td>
                <td>3,5</td>
                <td>30–60%</td>
                <td>Inventó la cuarentena formal moderna (40 días en Venecia)</td>
              </tr>
              <tr>
                <td>Viruela en América</td>
                <td>1519</td>
                <td>Virus (Variola)</td>
                <td>56 millones</td>
                <td>5,0</td>
                <td>30–90%</td>
                <td>Llevó al desarrollo de la primera vacuna (Jenner, 1796)</td>
              </tr>
              <tr>
                <td>Gripe Española</td>
                <td>1918</td>
                <td>Virus (Influenza H1N1)</td>
                <td>50 millones</td>
                <td>2,8</td>
                <td>2–3%</td>
                <td>Creación de la OMS y sistemas globales de vigilancia epidemiológica</td>
              </tr>
              <tr>
                <td>Epidemias de Polio</td>
                <td>1916</td>
                <td>Virus (Poliovirus)</td>
                <td>500.000</td>
                <td>4,0</td>
                <td>0,5–5%</td>
                <td>Vacunas Salk y Sabin — modelo de vacunación masiva global</td>
              </tr>
              <tr>
                <td>VIH/SIDA</td>
                <td>1981</td>
                <td>Virus (VIH)</td>
                <td>40 millones (en curso)</td>
                <td>2,0</td>
                <td>90%+ sin tratamiento</td>
                <td>Revolución en antivirales y medicina de enfermedades crónicas</td>
              </tr>
              <tr>
                <td>COVID-19</td>
                <td>2019</td>
                <td>Virus (SARS-CoV-2)</td>
                <td>7 millones</td>
                <td>3,3</td>
                <td>1–3%</td>
                <td>Vacunas ARNm en tiempo récord; secuenciación genómica masiva</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2: Casos de Uso */}
        <h3>¿Quién usa este visualizador y para qué?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <strong>Estudiante de medicina</strong>
            <p>Usa la cronología para contextualizar el desarrollo de la epidemiología como disciplina, conectando cada pandemia con los avances diagnósticos y terapéuticos que originó.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🦠</span>
            <strong>Epidemiólogo en formación</strong>
            <p>Compara el R0 y el CFR de distintas epidemias para calibrar modelos matemáticos SIR y entender cómo las condiciones sociales modulan la transmisibilidad real.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📰</span>
            <strong>Periodista de salud</strong>
            <p>Busca contexto histórico para informar sobre brotes actuales sin alarmar innecesariamente, poniendo los datos en perspectiva con precedentes bien documentados.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <strong>Gestor de salud pública</strong>
            <p>Extrae lecciones de la respuesta social a cada epidemia — qué medidas funcionaron y cuáles fracasaron — para preparar planes de contingencia proporcionales al riesgo.</p>
          </div>
        </div>

        {/* Sección 3: FAQ */}
        <h3>Preguntas frecuentes sobre epidemias históricas</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué la Gripe Española mató a jóvenes sanos y no solo a ancianos?</strong>
            <p>La hipótesis más aceptada es la del «imprinting inmunológico»: los adultos mayores habían sido expuestos a cepas de gripe similares en su infancia y tenían cierta inmunidad cruzada. Los jóvenes de 20 a 40 años, en cambio, sufrieron una respuesta inmune hiperactiva (tormenta de citocinas) que dañaba sus propios pulmones, siendo el origen de la alta mortalidad en ese grupo.</p>
            <p className={styles.faqTip}>Contexto: el 99% de las muertes por Gripe Española ocurrió en menores de 65 años, un patrón inverso al de la gripe estacional actual.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el R0 y por qué el SARS-CoV-2 se propagó tan rápido?</strong>
            <p>El R0 (número reproductivo básico) indica cuántas personas contagia de media cada infectado en una población sin inmunidad. El SARS-CoV-2 original tenía un R0 de ~3,3, que con la variante Ómicron alcanzó 8-15. Además, el período preinfeccioso (contagio antes de síntomas) era de 2-3 días, lo que dificultó el aislamiento antes de que los sistemas de salud reaccionaran.</p>
            <p className={styles.faqTip}>El sarampión tiene el R0 más alto conocido (~15-18), pero existen vacunas muy eficaces que lo controlan.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿La Muerte Negra fue solo peste bubónica?</strong>
            <p>Probablemente no. El análisis genético de dientes medievales confirmó <em>Yersinia pestis</em> como agente principal, pero la velocidad de expansión sugiere que también circularon formas neumónica y septicémica (transmisión persona a persona sin pulga vectora). Algunos historiadores proponen una coinfección con ántrax o con un virus hemorrágico no identificado, aunque esta hipótesis es minoritaria.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la viruela se erradicó pero no el VIH?</strong>
            <p>La viruela tenía un reservorio exclusivamente humano: sin humano infectado, el virus no sobrevive. La vacuna de Jenner generaba inmunidad esterilizante (impedía la infección), y la OMS coordinó una campaña de vacunación anillo a nivel global. El VIH, en cambio, integra su genoma en el ADN del huésped (reservorios latentes), muta constantemente, y aún no existe vacuna eficaz ni terapia que elimine el reservorio.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Las epidemias influyeron en la historia política?</strong>
            <p>De forma decisiva. La Muerte Negra aceleró el fin del feudalismo: al morir tantos siervos, la mano de obra escaseó y los supervivientes pudieron negociar mejores condiciones. La Gripe Española ocultada por la censura bélica minó la confianza en los gobiernos. El SIDA cambió la política de ensayos clínicos (los colectivos afectados presionaron para acelerar aprobaciones). Y el COVID-19 impulsó debates sobre soberanía sanitaria, geopolítica de vacunas y derechos digitales.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Estamos más preparados hoy para una pandemia que en 1918?</strong>
            <p>En herramientas científicas, sí: secuenciación genómica en horas, plataformas ARNm en meses, vigilancia epidemiológica global (GOARN-OMS). En coordinación política, menos de lo que parece: el COVID-19 mostró fallos en la gestión de stocks de EPI, en la comunicación de riesgos y en la cooperación internacional. Los sistemas de salud de muchos países estaban operando al límite antes de la pandemia.</p>
            <p className={styles.faqTip}>El Reglamento Sanitario Internacional (RSI 2005) obliga a los países a notificar brotes en 24-48 horas, pero el cumplimiento es desigual.</p>
          </li>
        </ul>

        {/* Sección 4: Guía Paso a Paso */}
        <h3>Cómo evaluar el riesgo de una epidemia emergente</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el agente causal y su modo de transmisión</strong>
              <p>Determina si es bacteria, virus o parásito, y si se transmite por vía aérea, fecal-oral, contacto directo o vector. La vía aérea con partículas finas (aerosoles) es la más difícil de controlar y la que genera pandemias más rápidas.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">2</span>
            <div className={styles.stepContent}>
              <strong>Estima el R0 inicial a partir de los primeros datos de contagio</strong>
              <p>Observa el tiempo de duplicación de casos en los primeros 14-21 días. Un tiempo de duplicación de 3-4 días indica un R0 muy alto (&gt;3). Si los casos se duplican cada 7+ días, el brote es más manejable con medidas estándar.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">3</span>
            <div className={styles.stepContent}>
              <strong>Calcula el CFR inicial con cautela: siempre estará sesgado hacia arriba</strong>
              <p>Los primeros casos confirmados son los más graves (los leves no se detectan). El CFR real suele ser 5-20 veces menor que el CFR inicial. Espera datos de estudios de seroprevalencia para tener la cifra correcta.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">4</span>
            <div className={styles.stepContent}>
              <strong>Evalúa la capacidad de respuesta sanitaria del país afectado</strong>
              <p>UCI por 100.000 hab., disponibilidad de antivirales o vacunas existentes, robustez del sistema de trazabilidad de contactos y capacidad de diagnóstico rápido. Un brote idéntico puede ser catástrofe o incidente controlado según este factor.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">5</span>
            <div className={styles.stepContent}>
              <strong>Aplica medidas proporcionales al riesgo real, no al miedo percibido</strong>
              <p>No todas las epidemias requieren confinamiento global. La respuesta debe escalar desde vigilancia activa → cuarentena de contactos → restricciones focalizadas → medidas masivas, solo cuando los datos lo justifican. La sobrerreacción también tiene costes sanitarios y sociales.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5: Mejores Prácticas */}
        <h3>Claves para interpretar datos epidemiológicos correctamente</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p><strong>Distingue entre epidemia, endemia y pandemia.</strong> Epidemia: brote localizado que supera la incidencia esperada. Endemia: presencia permanente en una zona geográfica (malaria en zonas tropicales). Pandemia: propagación geográfica global que afecta a múltiples continentes simultáneamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p><strong>El CFR inicial siempre sobrestima la mortalidad real.</strong> Al inicio de un brote solo se detectan los casos que llegan al hospital. Los estudios de seroprevalencia (quién tiene anticuerpos) revelan que la mortalidad real puede ser 10-50 veces menor que la inicial.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p><strong>La mortalidad no depende solo del patógeno.</strong> Las condiciones sanitarias previas, la desnutrición, el hacinamiento y el acceso a atención médica importan tanto como la virulencia del agente. La misma epidemia de cólera mató al 50% en ciudades sin saneamiento y al 1% en ciudades con agua potable.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p><strong>Las vacunas reducen el R0 efectivo por debajo de 1 — la clave del control.</strong> No eliminan el riesgo individual (breakthrough infections), pero bajan la transmisión a nivel poblacional. Cuando el R0 efectivo cae por debajo de 1, el brote se extingue de forma natural aunque haya casos individuales.</p>
          </div>
        </div>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox} role="alert">
          <strong>Errores frecuentes al interpretar datos epidémicos:</strong>
          <ul>
            <li><strong>Confundir mortalidad con CFR:</strong> mortalidad es el % de muertos sobre la población total; CFR (Case Fatality Rate) es el % de muertos sobre los casos confirmados — son métricas muy diferentes.</li>
            <li><strong>Usar el R0 como predictor absoluto:</strong> el R0 depende del comportamiento social, la densidad poblacional y las medidas adoptadas, no solo de la biología del virus. El mismo patógeno puede tener R0 muy distintos en diferentes contextos.</li>
            <li><strong>Ignorar las muertes indirectas:</strong> en las grandes epidemias, el colapso sanitario (pacientes cardíacos o quirúrgicos sin atención) puede generar tanta o más mortalidad que el patógeno directo.</li>
            <li><strong>Asumir que los antibióticos funcionan contra los virus:</strong> la Gripe Española, el COVID-19 y el VIH son enfermedades víricas. Los antibióticos no tienen efecto sobre ellas (solo sobre sobreinfecciones bacterianas secundarias).</li>
            <li><strong>Olvidar la variabilidad genética humana:</strong> grupos con variantes en receptores ACE2, CCR5 u otros tuvieron susceptibilidades distintas al COVID-19 y al VIH. La genómica poblacional es un factor creciente en la epidemiología moderna.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-epidemias')} />
      <ShareCard appName="visualizador-historia-epidemias" />
      <Footer appName="visualizador-historia-epidemias" />
    </div>
  );
}
