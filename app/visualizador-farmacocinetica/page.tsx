'use client';
import { useState, useMemo } from 'react';
import styles from './VisualizadorFarmacocinetica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos ──────────────────────────────────────────────────────────────────
type SeccionAdme = 'A' | 'D' | 'M' | 'E';

interface ViaAdmin {
  nombre: string;
  biodisponibilidad: string;
  inicio: string;
  ejemplo: string;
  icono: string;
}

interface FarmacoVidaMedia {
  nombre: string;
  vidaMedia: string;
  categoria: string;
  nota: string;
  horas: number; // para la calculadora
}

interface CypEjemplo {
  tipo: 'inductor' | 'inhibidor';
  nombre: string;
  fuente: string;
  efecto: string;
  icono: string;
}

// ── Datos educativos ───────────────────────────────────────────────────────
const VIAS_ADMINISTRACION: ViaAdmin[] = [
  {
    nombre: 'Intravenosa (IV)',
    biodisponibilidad: '100%',
    inicio: 'Inmediato (seg)',
    ejemplo: 'Antibióticos hospitalarios, quimioterapia',
    icono: '💉',
  },
  {
    nombre: 'Oral (VO)',
    biodisponibilidad: '30–80% (variable)',
    inicio: '30–90 min',
    ejemplo: 'Paracetamol (~80%), morfina oral (~30%)',
    icono: '💊',
  },
  {
    nombre: 'Sublingual',
    biodisponibilidad: 'Alta (evita 1er paso)',
    inicio: '2–5 min',
    ejemplo: 'Nitroglicerina, buprenorfina',
    icono: '👅',
  },
  {
    nombre: 'Transdérmica',
    biodisponibilidad: 'Variable, lenta',
    inicio: 'Horas',
    ejemplo: 'Fentanilo, nicotina, estrógenos',
    icono: '🩹',
  },
  {
    nombre: 'Intramuscular (IM)',
    biodisponibilidad: '75–100%',
    inicio: '10–30 min',
    ejemplo: 'Vacunas, adrenalina, haloperidol depot',
    icono: '💪',
  },
  {
    nombre: 'Inhalatoria',
    biodisponibilidad: 'Alta en pulmón',
    inicio: 'Minutos',
    ejemplo: 'Salbutamol, anestésicos volátiles, corticoides inhalados',
    icono: '🫁',
  },
];

const VD_EJEMPLOS = [
  { farmaco: 'Heparina', vd: '0,06 L/kg', tipo: 'Muy bajo', descripcion: 'Permanece casi totalmente en plasma', color: '#2E86AB' },
  { farmaco: 'Warfarina', vd: '0,14 L/kg', tipo: 'Bajo', descripcion: 'Unión alta a proteínas plasmáticas (98%)', color: '#2E86AB' },
  { farmaco: 'Paracetamol', vd: '0,9 L/kg', tipo: 'Moderado', descripcion: 'Distribución amplia en tejidos', color: '#48A9A6' },
  { farmaco: 'Diazepam', vd: '1,1 L/kg', tipo: 'Moderado-alto', descripcion: 'Lipofílico, cruza BHE y placenta', color: '#48A9A6' },
  { farmaco: 'Amiodarona', vd: '60 L/kg', tipo: 'Muy alto', descripcion: 'Se acumula en tejido adiposo y pulmón', color: '#7FB3D3' },
  { farmaco: 'Cloroquina', vd: '200–800 L/kg', tipo: 'Extremo', descripcion: 'Acumulación masiva en tejidos profundos', color: '#7FB3D3' },
];

const FARMACOS_VIDA_MEDIA: FarmacoVidaMedia[] = [
  { nombre: 'Ibuprofeno', vidaMedia: '~2 h', categoria: 'AINE', nota: 'Eliminación rápida, dosificación 3-4 veces al día', horas: 2 },
  { nombre: 'Paracetamol', vidaMedia: '2–3 h', categoria: 'Analgésico', nota: 't½ se alarga en insuficiencia hepática', horas: 2.5 },
  { nombre: 'Aspirina', vidaMedia: '15–20 min', categoria: 'AINE / antiagregante', nota: 'Pero efecto antiplaquetario irreversible (7-10 días)', horas: 0.3 },
  { nombre: 'Amoxicilina', vidaMedia: '1–1,5 h', categoria: 'Antibiótico (penicilina)', nota: 'Requiere dosificación frecuente (cada 8h)', horas: 1.2 },
  { nombre: 'Fluoxetina', vidaMedia: '1–4 días', categoria: 'ISRS', nota: 'Metabolito activo (norfluoxetina) dura semanas', horas: 60 },
  { nombre: 'Diazepam', vidaMedia: '20–100 h', categoria: 'Benzodiacepina', nota: 'Muy variable por edad y función hepática', horas: 60 },
  { nombre: 'Metformina', vidaMedia: '~6,5 h', categoria: 'Antidiabético oral', nota: 'Eliminación renal (no hepática)', horas: 6.5 },
  { nombre: 'Amiodarona', vidaMedia: '40–55 días', categoria: 'Antiarrítmico', nota: 'Estado estacionario se alcanza en meses', horas: 1140 },
];

const CYP_EJEMPLOS: CypEjemplo[] = [
  { tipo: 'inhibidor', nombre: 'Zumo de pomelo', fuente: 'Alimento', efecto: 'Inhibe CYP3A4 intestinal → aumenta niveles de estatinas, ciclosporina, antihistamínicos', icono: '🍊' },
  { tipo: 'inhibidor', nombre: 'Ketoconazol', fuente: 'Antifúngico', efecto: 'Potente inhibidor CYP3A4 → interacciona con docenas de fármacos', icono: '🔬' },
  { tipo: 'inhibidor', nombre: 'Fluoxetina', fuente: 'ISRS', efecto: 'Inhibe CYP2D6 → aumenta niveles de tamoxifeno, tramadol, antipsicóticos', icono: '💊' },
  { tipo: 'inhibidor', nombre: 'Ciprofloxacino', fuente: 'Antibiótico', efecto: 'Inhibe CYP1A2 → aumenta niveles de teofilina, warfarina, clozapina', icono: '💉' },
  { tipo: 'inductor', nombre: 'Rifampicina', fuente: 'Antibiótico antituberculoso', efecto: 'Potente inductor CYP3A4/CYP2C → reduce niveles de anticonceptivos, antivirales, anticoagulantes', icono: '⚡' },
  { tipo: 'inductor', nombre: 'Carbamazepina', fuente: 'Antiepiléptico', efecto: 'Inductor CYP3A4 → autoinducción propia + reduce eficacia de muchos fármacos', icono: '🧠' },
  { tipo: 'inductor', nombre: 'Hierba de San Juan', fuente: 'Fitoterapia', efecto: 'Induce CYP3A4 → reduce anticonceptivos orales, antivirales, ciclosporina', icono: '🌿' },
  { tipo: 'inductor', nombre: 'Alcohol crónico', fuente: 'Sustancia', efecto: 'Induce CYP2E1 → aumenta toxicidad de paracetamol y solventes', icono: '🍺' },
];

const SECCIONES_ADME = [
  { id: 'A' as SeccionAdme, label: 'A — Absorción', icono: '📥' },
  { id: 'D' as SeccionAdme, label: 'D — Distribución', icono: '🔀' },
  { id: 'M' as SeccionAdme, label: 'M — Metabolismo', icono: '⚗️' },
  { id: 'E' as SeccionAdme, label: 'E — Excreción', icono: '♻️' },
];

// ── Componente principal ───────────────────────────────────────────────────
export default function VisualizadorFarmacocinetica() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionAdme>('A');
  const [seccionInteractiva, setSeccionInteractiva] = useState<'curva' | 'vidamedia' | 'cyp'>('curva');

  // Sliders para la curva C-T (valores genéricos, sin fármacos específicos)
  const [biodisponibilidad, setBiodisponibilidad] = useState(70);
  const [vidaMediaSlider, setVidaMediaSlider] = useState(4);

  // Calculadora de vida media
  const [hFarmaco, setHFarmaco] = useState<number>(2.5);
  const [porcentajeEliminar, setPorcentajeEliminar] = useState<number>(95);

  // Tiempo para eliminar X% del fármaco: t = t½ × log₂(100 / (100 - %))
  const tiempoEliminacion = useMemo(() => {
    if (porcentajeEliminar <= 0 || porcentajeEliminar >= 100) return null;
    const veces = Math.log2(100 / (100 - porcentajeEliminar));
    const horas = veces * hFarmaco;
    if (horas < 1) return `${Math.round(horas * 60)} minutos`;
    if (horas < 24) return `~${horas.toFixed(1)} horas`;
    const dias = horas / 24;
    return `~${dias.toFixed(1)} días`;
  }, [hFarmaco, porcentajeEliminar]);

  // Datos curva concentración-tiempo (simplificada)
  const puntosCtCurva = useMemo(() => {
    const ke = Math.log(2) / vidaMediaSlider;
    const f = biodisponibilidad / 100;
    const puntos: { t: number; c: number }[] = [];
    for (let t = 0; t <= vidaMediaSlider * 6; t += vidaMediaSlider * 0.25) {
      // Modelo bicompartimental simplificado: absorción rápida, eliminación monoexponencial
      const absorcion = 1 - Math.exp(-1.5 * t);
      const eliminacion = Math.exp(-ke * t);
      const c = f * absorcion * eliminacion;
      puntos.push({ t: Math.round(t * 10) / 10, c: Math.round(c * 1000) / 1000 });
    }
    return puntos;
  }, [biodisponibilidad, vidaMediaSlider]);

  const cmaxPunto = useMemo(() => {
    return puntosCtCurva.reduce((max, p) => (p.c > max.c ? p : max), puntosCtCurva[0]);
  }, [puntosCtCurva]);

  // SVG de curva C-T
  const ANCHO_SVG = 360;
  const ALTO_SVG = 180;
  const MARGIN = { top: 16, right: 16, bottom: 36, left: 44 };
  const plotW = ANCHO_SVG - MARGIN.left - MARGIN.right;
  const plotH = ALTO_SVG - MARGIN.top - MARGIN.bottom;

  const maxT = puntosCtCurva[puntosCtCurva.length - 1]?.t ?? 1;
  const maxC = Math.max(...puntosCtCurva.map((p) => p.c));

  const toX = (t: number) => MARGIN.left + (t / maxT) * plotW;
  const toY = (c: number) => MARGIN.top + plotH - (c / (maxC || 1)) * plotH;

  const pathD = puntosCtCurva
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.t).toFixed(1)} ${toY(p.c).toFixed(1)}`)
    .join(' ');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Visualizador de Farmacocinética</h1>
        <p>Cómo viaja un fármaco por el cuerpo: absorción, distribución, metabolismo y excreción (ADME)</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
      >
        Esta herramienta explica principios generales de farmacología y farmacocinética con fines exclusivamente educativos.
        Los ejemplos con fármacos concretos (paracetamol, ibuprofeno, estatinas...) ilustran conceptos científicos y{' '}
        <strong>NO constituyen consejo médico ni farmacéutico</strong>. No utilices esta información para modificar,
        ajustar o combinar medicamentos. Consulta siempre a tu médico o farmacéutico.
      </DisclaimerCard>

      <main className={styles.main}>

        {/* ── Sección ADME interactiva ── */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>El ciclo ADME</h2>
          <p className={styles.subtitulo}>
            Todo fármaco recorre cuatro etapas desde que entra en el organismo hasta que es eliminado. Pulsa cada letra para explorarla.
          </p>

          {/* Diagrama ADME */}
          <div className={styles.admeCirculo} aria-label="Diagrama del ciclo ADME">
            {SECCIONES_ADME.map((s) => (
              <button
                key={s.id}
                className={`${styles.admeBtn} ${seccionActiva === s.id ? styles.admeBtnActivo : ''}`}
                onClick={() => setSeccionActiva(s.id)}
                aria-pressed={seccionActiva === s.id}
              >
                <span className={styles.admeBtnIcono} aria-hidden="true">{s.icono}</span>
                <span className={styles.admeBtnLetra}>{s.id}</span>
                <span className={styles.admeBtnLabel}>{s.label.split('— ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Contenido de cada sección ADME */}
          {seccionActiva === 'A' && (
            <div className={styles.admeContenido}>
              <h3 className={styles.admeH3}>Absorción — ¿Cómo llega el fármaco a la sangre?</h3>
              <p className={styles.admeParagraph}>
                Es el proceso por el que un fármaco pasa desde el lugar de administración a la circulación sistémica.
                La <strong>biodisponibilidad (F)</strong> es el porcentaje del fármaco que efectivamente llega a la sangre.
                La vía intravenosa es la única con F = 100% porque se administra directamente en el torrente sanguíneo.
              </p>
              <p className={styles.admeParagraph}>
                La vía oral está sujeta al <strong>efecto de primer paso hepático</strong>: el fármaco absorbido en el intestino
                pasa por el hígado antes de llegar a la circulación general, donde puede ser parcialmente metabolizado.
                Así, la morfina oral tiene F ≈ 30% frente al 100% de la morfina intravenosa.
              </p>
              <div className={styles.admeTablaWrapper}>
                <table className={styles.admeTabla}>
                  <thead>
                    <tr>
                      <th>Vía</th>
                      <th>Biodisponibilidad</th>
                      <th>Inicio de efecto</th>
                      <th>Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VIAS_ADMINISTRACION.map((v) => (
                      <tr key={v.nombre}>
                        <td>
                          <span aria-hidden="true">{v.icono}</span> {v.nombre}
                        </td>
                        <td>{v.biodisponibilidad}</td>
                        <td>{v.inicio}</td>
                        <td className={styles.tdNota}>{v.ejemplo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {seccionActiva === 'D' && (
            <div className={styles.admeContenido}>
              <h3 className={styles.admeH3}>Distribución — ¿Adónde va el fármaco?</h3>
              <p className={styles.admeParagraph}>
                Una vez en sangre, el fármaco se distribuye por los tejidos. El <strong>volumen de distribución (Vd)</strong> es
                un parámetro matemático que refleja este reparto: no es un volumen real, sino una estimación de qué tan ampliamente
                se distribuye. Un Vd alto indica que el fármaco se acumula en tejidos; uno bajo indica que permanece mayoritariamente en plasma.
              </p>
              <p className={styles.admeParagraph}>
                La <strong>unión a proteínas plasmáticas</strong> (principalmente albúmina) es otro factor clave: solo el fármaco libre
                es farmacológicamente activo. Las barreras fisiológicas como la <strong>barrera hematoencefálica (BHE)</strong>
                o la barrera placentaria limitan la distribución de fármacos hidrofílicos y de gran tamaño.
              </p>
              <div className={styles.vdGrid}>
                {VD_EJEMPLOS.map((v) => (
                  <div key={v.farmaco} className={styles.vdCard} style={{ borderLeftColor: v.color }}>
                    <div className={styles.vdTop}>
                      <span className={styles.vdFarmaco}>{v.farmaco}</span>
                      <span className={styles.vdValor} style={{ color: v.color }}>{v.vd}</span>
                    </div>
                    <span className={styles.vdTipo}>{v.tipo}</span>
                    <p className={styles.vdDesc}>{v.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {seccionActiva === 'M' && (
            <div className={styles.admeContenido}>
              <h3 className={styles.admeH3}>Metabolismo — ¿Cómo se transforma el fármaco?</h3>
              <p className={styles.admeParagraph}>
                El <strong>hígado</strong> es el principal órgano metabolizador. Las enzimas del sistema <strong>CYP450</strong> (citocromo P450)
                catalizan la mayoría de las transformaciones. El CYP3A4 es el más abundante y metaboliza aproximadamente el 50% de los fármacos usados en clínica.
              </p>
              <div className={styles.faseGrid}>
                <div className={styles.faseCard}>
                  <h4 className={styles.faseTitle}>Fase 1 — Funcionalización</h4>
                  <p>Oxidación, reducción o hidrólisis. Introduce o expone grupos funcionales.
                  Puede generar metabolitos activos (como la codeína → morfina vía CYP2D6) o inactivos.</p>
                </div>
                <div className={styles.faseCard}>
                  <h4 className={styles.faseTitle}>Fase 2 — Conjugación</h4>
                  <p>Glucuronidación, sulfatación, acetilación... Une moléculas al fármaco para
                  hacerlo más hidrosoluble y facilitar su excreción renal o biliar.</p>
                </div>
              </div>
              <div className={styles.profarmacoBox}>
                <strong>Profármaco</strong>: fármaco inactivo que se activa por metabolismo. Ejemplo: el enalapril (profármaco oral) se convierte
                en enalaprilat (activo) en el hígado; la codeína se convierte en morfina vía CYP2D6.
                Los pacientes con variantes genéticas en CYP2D6 pueden ser metabolizadores lentos o ultrarrápidos, con
                implicaciones clínicas importantes.
              </div>
            </div>
          )}

          {seccionActiva === 'E' && (
            <div className={styles.admeContenido}>
              <h3 className={styles.admeH3}>Excreción — ¿Cómo abandona el cuerpo el fármaco?</h3>
              <p className={styles.admeParagraph}>
                La ruta principal de excreción es la <strong>renal</strong>: el riñón filtra el fármaco libre (filtración glomerular)
                y puede secretarlo activamente o reabsorberlo en los túbulos. El pH urinario influye en la ionización del fármaco
                y por tanto en su reabsorción (principio relevante en intoxicaciones).
              </p>
              <div className={styles.excrecionGrid}>
                <div className={styles.excrecionCard}>
                  <span className={styles.excrecionIcono} aria-hidden="true">🫘</span>
                  <h4>Vía renal</h4>
                  <p>Principal ruta para la mayoría de fármacos. Depende de la función renal (TFG). Gentamicina: eliminación renal casi pura.</p>
                </div>
                <div className={styles.excrecionCard}>
                  <span className={styles.excrecionIcono} aria-hidden="true">🫀</span>
                  <h4>Vía biliar / fecal</h4>
                  <p>Para fármacos de alto peso molecular. Algunos sufren circulación enterohepática. Rifampicina: excreción biliar predominante.</p>
                </div>
                <div className={styles.excrecionCard}>
                  <span className={styles.excrecionIcono} aria-hidden="true">🫁</span>
                  <h4>Vía pulmonar</h4>
                  <p>Anestésicos volátiles (halotano, sevoflurano). Alcohol: 5–10% se elimina por el aliento (base del etilómetro).</p>
                </div>
                <div className={styles.excrecionCard}>
                  <span className={styles.excrecionIcono} aria-hidden="true">🍼</span>
                  <h4>Otras vías</h4>
                  <p>Leche materna, saliva, sudor. Relevante en lactancia: muchos fármacos pasan a leche en concentraciones variables.</p>
                </div>
              </div>
              <div className={styles.clFormula}>
                <strong>Aclaramiento (Cl)</strong> = Vd × ke | Relaciona el volumen de distribución con la constante de eliminación.
                Determina la dosis de mantenimiento necesaria para mantener concentraciones estables.
              </div>
            </div>
          )}
        </section>

        {/* ── Secciones interactivas ── */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Herramientas de visualización</h2>

          <div className={styles.navSecciones} role="tablist">
            {([
              { id: 'curva', label: 'Curva C-T', icono: '📈' },
              { id: 'vidamedia', label: 'Vida media', icono: '⏱️' },
              { id: 'cyp', label: 'CYP450', icono: '⚗️' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={seccionInteractiva === tab.id}
                className={`${styles.tabBtn} ${seccionInteractiva === tab.id ? styles.tabActivo : ''}`}
                onClick={() => setSeccionInteractiva(tab.id)}
              >
                <span aria-hidden="true">{tab.icono}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Curva concentración-tiempo */}
          {seccionInteractiva === 'curva' && (
            <div className={styles.tabContenido}>
              <p className={styles.subtitulo}>
                La curva concentración-tiempo muestra cómo varía la concentración de un fármaco en plasma a lo largo del tiempo
                tras una dosis oral. Ajusta los parámetros para ver cómo cambia la curva.
              </p>

              <div className={styles.slidersGrid}>
                <div className={styles.sliderGroup}>
                  <label htmlFor="slider-bio" className={styles.sliderLabel}>
                    Biodisponibilidad (F): <strong>{biodisponibilidad}%</strong>
                  </label>
                  <input
                    id="slider-bio"
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={biodisponibilidad}
                    onChange={(e) => setBiodisponibilidad(Number(e.target.value))}
                    className={styles.slider}
                    aria-label={`Biodisponibilidad: ${biodisponibilidad}%`}
                  />
                  <div className={styles.sliderHints}>
                    <span>10% (efecto 1er paso alto)</span>
                    <span>100% (IV)</span>
                  </div>
                </div>
                <div className={styles.sliderGroup}>
                  <label htmlFor="slider-t12" className={styles.sliderLabel}>
                    Vida media (t½): <strong>{vidaMediaSlider} h</strong>
                  </label>
                  <input
                    id="slider-t12"
                    type="range"
                    min={0.5}
                    max={24}
                    step={0.5}
                    value={vidaMediaSlider}
                    onChange={(e) => setVidaMediaSlider(Number(e.target.value))}
                    className={styles.slider}
                    aria-label={`Vida media: ${vidaMediaSlider} horas`}
                  />
                  <div className={styles.sliderHints}>
                    <span>0,5 h (muy corta)</span>
                    <span>24 h (larga)</span>
                  </div>
                </div>
              </div>

              <div className={styles.svgWrapper}>
                <svg
                  viewBox={`0 0 ${ANCHO_SVG} ${ALTO_SVG}`}
                  className={styles.curvaSvg}
                  aria-label="Curva concentración-tiempo"
                  role="img"
                >
                  {/* Ejes */}
                  <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + plotH} stroke="var(--text-muted)" strokeWidth="1" />
                  <line x1={MARGIN.left} y1={MARGIN.top + plotH} x2={MARGIN.left + plotW} y2={MARGIN.top + plotH} stroke="var(--text-muted)" strokeWidth="1" />

                  {/* Etiquetas ejes */}
                  <text x={MARGIN.left - 8} y={MARGIN.top + plotH / 2} textAnchor="middle" fontSize="9" fill="var(--text-secondary)"
                    transform={`rotate(-90, ${MARGIN.left - 8}, ${MARGIN.top + plotH / 2})`}>
                    Concentración
                  </text>
                  <text x={MARGIN.left + plotW / 2} y={ALTO_SVG - 4} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">
                    Tiempo (h)
                  </text>

                  {/* AUC (área bajo la curva) */}
                  <path
                    d={`${pathD} L ${toX(maxT).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`}
                    fill="rgba(46,134,171,0.12)"
                  />

                  {/* Línea de la curva */}
                  <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />

                  {/* Cmax */}
                  <line
                    x1={toX(cmaxPunto.t)}
                    y1={MARGIN.top}
                    x2={toX(cmaxPunto.t)}
                    y2={toY(cmaxPunto.c)}
                    stroke="#48A9A6"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <circle cx={toX(cmaxPunto.t)} cy={toY(cmaxPunto.c)} r="4" fill="#48A9A6" />
                  <text x={toX(cmaxPunto.t) + 5} y={toY(cmaxPunto.c) - 4} fontSize="9" fill="#48A9A6" fontWeight="600">Cmax</text>
                  <text x={toX(cmaxPunto.t) + 5} y={MARGIN.top + plotH + 14} fontSize="9" fill="#48A9A6">Tmax</text>
                </svg>

                <div className={styles.curvaBadges}>
                  <span className={styles.curvaBadge} style={{ background: 'rgba(46,134,171,0.12)', color: 'var(--primary)' }}>
                    AUC — Área bajo la curva (exposición total)
                  </span>
                  <span className={styles.curvaBadge} style={{ background: 'rgba(72,169,166,0.12)', color: '#48A9A6' }}>
                    Cmax — Concentración máxima
                  </span>
                  <span className={styles.curvaBadge} style={{ background: 'rgba(72,169,166,0.12)', color: '#48A9A6' }}>
                    Tmax — Tiempo hasta Cmax
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de vida media + calculadora */}
          {seccionInteractiva === 'vidamedia' && (
            <div className={styles.tabContenido}>
              <p className={styles.subtitulo}>
                La <strong>vida media (t½)</strong> es el tiempo necesario para que la concentración del fármaco en plasma
                se reduzca a la mitad. Determina la frecuencia de dosificación y cuánto tarda en eliminarse el fármaco.
                El <strong>estado estacionario</strong> (concentración estable) se alcanza tras aproximadamente 5 vidas medias.
              </p>

              <div className={styles.admeTablaWrapper}>
                <table className={styles.admeTabla}>
                  <thead>
                    <tr>
                      <th>Fármaco</th>
                      <th>t½</th>
                      <th>Categoría</th>
                      <th>Nota clínica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FARMACOS_VIDA_MEDIA.map((f) => (
                      <tr key={f.nombre}>
                        <td><strong>{f.nombre}</strong></td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{f.vidaMedia}</td>
                        <td>{f.categoria}</td>
                        <td className={styles.tdNota}>{f.nota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.calculadoraBox}>
                <h3 className={styles.calcTitle}>Calculadora de eliminación</h3>
                <p className={styles.subtitulo}>¿Cuánto tarda en eliminarse un porcentaje del fármaco según su vida media? (Solo educativo)</p>
                <div className={styles.calcForm}>
                  <div className={styles.calcField}>
                    <label htmlFor="calc-t12" className={styles.sliderLabel}>
                      Vida media (t½ en horas): <strong>{hFarmaco} h</strong>
                    </label>
                    <input
                      id="calc-t12"
                      type="range"
                      min={0.5}
                      max={200}
                      step={0.5}
                      value={hFarmaco}
                      onChange={(e) => setHFarmaco(Number(e.target.value))}
                      className={styles.slider}
                    />
                    <div className={styles.sliderHints}><span>0,5 h</span><span>200 h</span></div>
                  </div>
                  <div className={styles.calcField}>
                    <label htmlFor="calc-pct" className={styles.sliderLabel}>
                      Porcentaje a eliminar: <strong>{porcentajeEliminar}%</strong>
                    </label>
                    <input
                      id="calc-pct"
                      type="range"
                      min={50}
                      max={99}
                      step={1}
                      value={porcentajeEliminar}
                      onChange={(e) => setPorcentajeEliminar(Number(e.target.value))}
                      className={styles.slider}
                    />
                    <div className={styles.sliderHints}><span>50%</span><span>99%</span></div>
                  </div>
                </div>
                {tiempoEliminacion && (
                  <div className={styles.calcResultado} role="status" aria-live="polite">
                    <span className={styles.calcResultadoLabel}>Tiempo estimado de eliminación:</span>
                    <span className={styles.calcResultadoValor}>{tiempoEliminacion}</span>
                    <span className={styles.calcResultadoSub}>
                      ({porcentajeEliminar}% del fármaco · t½ = {hFarmaco} h)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CYP450 */}
          {seccionInteractiva === 'cyp' && (
            <div className={styles.tabContenido}>
              <p className={styles.subtitulo}>
                El sistema <strong>CYP450</strong> (citocromo P450) es el principal responsable del metabolismo hepático de fármacos.
                Ciertas sustancias pueden <strong>inducir</strong> (acelerar) o <strong>inhibir</strong> (frenar) estas enzimas,
                alterando las concentraciones de los fármacos que metabolizan.
              </p>

              <div className={styles.cypLegenda}>
                <span className={styles.cypBadgeInductor}>⚡ Inductor — acelera el metabolismo → reduce niveles del fármaco</span>
                <span className={styles.cypBadgeInhibidor}>🚫 Inhibidor — frena el metabolismo → aumenta niveles del fármaco</span>
              </div>

              <div className={styles.cypGrid}>
                {CYP_EJEMPLOS.map((c) => (
                  <div
                    key={c.nombre}
                    className={`${styles.cypCard} ${c.tipo === 'inductor' ? styles.cypCardInductor : styles.cypCardInhibidor}`}
                  >
                    <div className={styles.cypCardHeader}>
                      <span className={styles.cypIcono} aria-hidden="true">{c.icono}</span>
                      <div>
                        <strong className={styles.cypNombre}>{c.nombre}</strong>
                        <span className={styles.cypFuente}>{c.fuente}</span>
                      </div>
                      <span className={`${styles.cypTipoBadge} ${c.tipo === 'inductor' ? styles.cypTipoInductor : styles.cypTipoInhibidor}`}>
                        {c.tipo === 'inductor' ? '⚡ Inductor' : '🚫 Inhibidor'}
                      </span>
                    </div>
                    <p className={styles.cypEfecto}>{c.efecto}</p>
                  </div>
                ))}
              </div>

              <div className={styles.pomelloBox}>
                <strong>El caso del zumo de pomelo</strong> — Un ejemplo cotidiano de interacción CYP450: el pomelo contiene
                furanocumarinas que inhiben irreversiblemente el CYP3A4 intestinal. Una sola copa de zumo puede duplicar
                o triplicar los niveles de estatinas (atorvastatina, simvastatina), bloqueantes de calcio (felodipino)
                o inmunosupresores (ciclosporina), aumentando el riesgo de toxicidad. El efecto puede durar 24–72 horas.
              </div>
            </div>
          )}
        </section>

        {/* ── Clave pedagógica ── */}
        <section className={styles.warningBox}>
          <h3>🔑 Índice terapéutico y margen de seguridad</h3>
          <p>
            El <strong>índice terapéutico (IT)</strong> mide el margen entre la dosis eficaz y la dosis tóxica.
            Los fármacos con IT estrecho —warfarina, digoxina, litio, teofilina, ciclosporina— requieren monitorización
            plasmática obligatoria porque pequeñas variaciones en la concentración pueden causar toxicidad grave o pérdida de eficacia.
            La farmacocinética es la base racional para diseñar regímenes de dosificación seguros.
          </p>
          <p>
            El conocimiento del ADME permite a los profesionales sanitarios anticipar interacciones, ajustar dosis en insuficiencia
            renal o hepática, seleccionar la vía de administración óptima y comprender por qué un mismo fármaco puede tener
            efectos muy diferentes en distintos pacientes (variabilidad interindividual).
          </p>
        </section>

        <EducationalSection
          title="¿Qué es la farmacocinética?"
          subtitle="El viaje de un fármaco por el organismo: absorción, distribución, metabolismo y excreción"
        >
          {/* ── 1. Tabla comparativa ADME ── */}
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>Localización principal</th>
                  <th>Parámetro clave</th>
                  <th>Ejemplo ilustrativo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Absorción</strong></td>
                  <td>Intestino delgado</td>
                  <td>Biodisponibilidad (F%)</td>
                  <td>Paracetamol oral F≈80% vs IV F=100%</td>
                </tr>
                <tr>
                  <td><strong>Distribución</strong></td>
                  <td>Plasma + tejidos</td>
                  <td>Volumen distribución (Vd)</td>
                  <td>Diazepam Vd alto (tejidos); heparina Vd bajo (plasma)</td>
                </tr>
                <tr>
                  <td><strong>Metabolismo</strong></td>
                  <td>Hígado (CYP450)</td>
                  <td>Vida media (t½)</td>
                  <td>Ibuprofeno t½≈2h; amiodarona t½≈55 días</td>
                </tr>
                <tr>
                  <td><strong>Excreción</strong></td>
                  <td>Riñón (principal)</td>
                  <td>Aclaramiento (Cl)</td>
                  <td>Gentamicina: excreción renal casi pura</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── 2. Perfiles de uso ── */}
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🎓</span>
              <div>
                <strong>Estudiante de farmacia o medicina</strong>
                <p>Aprende los procesos ADME para el examen de farmacología y comprende los parámetros clave (F, Vd, t½, Cl).</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🧬</span>
              <div>
                <strong>Investigador / científico</strong>
                <p>Comprende por qué un profármaco necesita activación hepática y cómo la genética (CYP450) afecta la respuesta.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">📚</span>
              <div>
                <strong>Curioso general</strong>
                <p>Entiende por qué el zumo de pomelo puede alterar medicamentos y qué significa la vida media en la práctica.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🏥</span>
              <div>
                <strong>Cuidador familiar</strong>
                <p>Comprende por qué algunos medicamentos requieren ajuste de dosis en insuficiencia renal o hepática.</p>
              </div>
            </div>
          </div>

          {/* ── 3. FAQ ── */}
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué algunos medicamentos se toman con el estómago vacío y otros con comida?</strong>
              <p>
                Depende de cómo afectan los alimentos a la absorción. La comida puede ralentizar el vaciado gástrico (retrasando el pico)
                o aumentar la biodisponibilidad de fármacos lipofílicos. Otros se toman con comida porque irritan la mucosa gástrica
                (ibuprofeno, ácido acetilsalicílico). La grasa aumenta la absorción de medicamentos liposolubles como el itraconazol.
              </p>
              <span className={styles.faqTip}>Proceso ADME: Absorción</span>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el efecto de primer paso y por qué hace que la morfina oral sea menos potente que la IV?</strong>
              <p>
                Cuando un fármaco se toma por vía oral, el intestino lo absorbe y la sangre portal lo lleva directamente al hígado
                antes de pasar a la circulación general. El hígado metaboliza una parte de ese fármaco — eso es el efecto de primer paso.
                La morfina oral tiene una biodisponibilidad de solo ~30% porque el hígado destruye el 70% restante antes de que llegue al cerebro.
              </p>
              <span className={styles.faqTip}>Proceso ADME: Absorción y Metabolismo</span>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el zumo de pomelo puede ser peligroso con ciertos medicamentos?</strong>
              <p>
                El pomelo contiene furanocumarinas que inhiben irreversiblemente el CYP3A4 intestinal, la enzima que metaboliza
                el ~50% de los fármacos. Al bloquear esta enzima, medicamentos como estatinas (simvastatina, atorvastatina),
                bloqueantes de calcio (felodipino) o ciclosporina alcanzan concentraciones mucho más altas de lo previsto,
                pudiendo causar toxicidad. El efecto puede durar hasta 72 horas tras una sola copa de zumo.
              </p>
              <span className={styles.faqTip}>Proceso ADME: Metabolismo — CYP3A4</span>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué significa que un medicamento tenga índice terapéutico estrecho?</strong>
              <p>
                El índice terapéutico (IT) es la relación entre la dosis tóxica y la dosis eficaz. Fármacos con IT estrecho
                como la warfarina, la digoxina, el litio o la teofilina tienen muy poco margen: pequeñas variaciones de dosis
                o de parámetros farmacocinéticos pueden llevar de la ineficacia a la toxicidad grave. Por eso requieren
                monitorización periódica de niveles plasmáticos y ajuste individual.
              </p>
              <span className={styles.faqTip}>Concepto clave: Índice Terapéutico</span>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuánto tarda el cuerpo en eliminar un medicamento?</strong>
              <p>
                La regla práctica es que se necesitan aproximadamente <strong>5 vidas medias</strong> para eliminar el 97% del fármaco.
                Un paracetamol con t½ de 2-3h desaparece en ~12 horas. El diazepam, con t½ de hasta 100h, puede tardar hasta 3 semanas.
                La amiodarona, con t½ de 40-55 días, puede permanecer en el organismo durante meses tras su retirada.
              </p>
              <span className={styles.faqTip}>Proceso ADME: Excreción — vida media</span>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué hay que ajustar la dosis en insuficiencia renal o hepática?</strong>
              <p>
                Los riñones y el hígado son los principales órganos de eliminación. Si están dañados, el fármaco se elimina
                más lentamente y se acumula en el organismo, aumentando el riesgo de toxicidad. En insuficiencia renal
                se ajustan especialmente fármacos de excreción renal pura (gentamicina, metformina). En insuficiencia hepática,
                los metabolizados por CYP450 (paracetamol, benzodiacepinas). Siempre bajo supervisión médica.
              </p>
              <span className={styles.faqTip}>Proceso ADME: Excreción y Metabolismo</span>
            </div>
          </div>

          {/* ── 4. Guía paso a paso ── */}
          <div className={styles.stepGuide}>
            <h3 className={styles.stepGuideTitle}>Viaje de una pastilla de paracetamol oral</h3>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Disolución en el estómago</strong> — La pastilla se disuelve en un entorno ácido (pH 1-3).
                Algunos fármacos ya se absorben parcialmente en la mucosa gástrica (ej.: aspirina, etanol).
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Absorción en el intestino delgado</strong> — Los transportadores activos y la difusión pasiva
                permiten que el principio activo cruce la pared intestinal hacia la sangre portal.
                Es el principal lugar de absorción para la mayoría de fármacos orales.
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Efecto de primer paso hepático</strong> — La sangre portal lleva el fármaco directamente al hígado.
                Aproximadamente el 20% del paracetamol se metaboliza aquí antes de llegar a la circulación general
                (biodisponibilidad resultante: ~80%).
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Distribución sistémica</strong> — El 80% restante llega a la circulación general y se distribuye
                por tejidos (Vd ≈ 0,9 L/kg). Cruza con facilidad la barrera hematoencefálica (mecanismo analgésico central)
                y la barrera placentaria.
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Metabolismo hepático</strong> — El hígado metaboliza el paracetamol principalmente por glucuronidación
                (55%) y sulfatación (30%) — Fase 2. Una pequeña fracción va por la vía del CYP2E1 generando NAPQI,
                un metabolito tóxico neutralizado por el glutatión. En sobredosis, el glutatión se agota y el NAPQI causa necrosis hepática.
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Excreción renal</strong> — Los metabolitos hidrosolubles (glucurónidos, sulfatos) se filtran
                en el glomérulo y se excretan en la orina. t½: 2-3 horas en adultos sanos.
                Eliminación completa en aproximadamente 12-15 horas (5 × t½).
              </div>
            </div>
          </div>

          {/* ── 5. Mejores prácticas ── */}
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <div>
                <strong>Leer el prospecto</strong>
                <p>La sección «farmacocinética» incluye los datos reales del medicamento: t½, Vd y Cmax medidos en estudios clínicos.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <div>
                <strong>No ajustar dosis sin consultar</strong>
                <p>Aunque se entienda la t½, factores como edad, peso, función renal y genética (CYP450) modifican el resultado real.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍊</span>
              <div>
                <strong>Alimentos e interacciones</strong>
                <p>Cítricos (CYP3A4), lácteos (quelación de tetraciclinas), alcohol (CYP2E1). Consultar siempre al farmacéutico.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💊</span>
              <div>
                <strong>Genéricos y bioequivalencia</strong>
                <p>Los genéricos deben demostrar bioequivalencia regulada: F dentro del 80-125% del original. No son inferiores.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🩺</span>
              <div>
                <strong>Monitorización de IT estrecho</strong>
                <p>Warfarina, litio, digoxina y ciclosporina requieren análisis periódicos de niveles en sangre para ajustar dosis.</p>
              </div>
            </div>
          </div>

          {/* ── 6. Warning box ── */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores comunes y malentendidos</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>«Si entiendo la farmacocinética puedo calcular mi propia dosis»</strong> — La variabilidad
                interindividual (genética, edad, comorbilidades, interacciones) hace que los cálculos teóricos sean insuficientes
                sin supervisión médica o farmacéutica.
              </li>
              <li>
                <strong>«Los fármacos naturales no tienen farmacocinética»</strong> — Tienen exactamente el mismo ciclo ADME.
                La hierba de San Juan es un potente inductor del CYP3A4 que puede reducir la eficacia de anticonceptivos orales,
                antivirales e inmunosupresores.
              </li>
              <li>
                <strong>«Tomar la dosis doble si me olvidé la anterior»</strong> — Puede superar el índice terapéutico
                y causar toxicidad. La acción correcta está en el prospecto de cada medicamento; en general, se omite la dosis
                olvidada y se sigue con la siguiente.
              </li>
              <li>
                <strong>«El genérico es peor porque tiene menos principio activo»</strong> — La bioequivalencia está
                regulada por la AEMPS: el genérico debe demostrar el mismo AUC y Cmax dentro de márgenes estrictos (80-125%).
              </li>
              <li>
                <strong>«La vida media indica cuándo hay que tomar la siguiente dosis»</strong> — La dosificación depende
                de la curva terapéutica completa y del índice terapéutico, no solo de la t½. Fármacos con t½ corta pueden
                dosificarse una vez al día si tienen formulación de liberación prolongada.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-farmacocinetica')} />
        <ShareCard appName="visualizador-farmacocinetica" />
      </main>

      <Footer appName="visualizador-farmacocinetica" />
    </div>
  );
}
