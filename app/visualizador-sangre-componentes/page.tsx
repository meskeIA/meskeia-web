'use client';

import { useState, type KeyboardEvent } from 'react';
import styles from './SangreComponentes.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

/**
 * Un <rect>/<circle> con role="button" se enfoca con Tab, pero Enter y Espacio no hacen nada
 * si no se programan (hallazgo 1975): el navegador solo los da gratis a un <button> real.
 */
function alPulsarTecla(accion: () => void) {
  return (e: KeyboardEvent<SVGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      accion();
    }
  };
}

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'composicion' | 'grupos' | 'coagulacion' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'composicion', titulo: 'Composición', icono: '🩸', subtitulo: 'Qué hay en tu sangre' },
  { id: 'grupos', titulo: 'Grupos sanguíneos', icono: '🅰️', subtitulo: 'ABO y factor Rh' },
  { id: 'coagulacion', titulo: 'Coagulación', icono: '🩹', subtitulo: 'Cómo se cierra una herida' },
  { id: 'datos', titulo: 'Datos y análisis', icono: '🔬', subtitulo: 'Valores normales' },
];

// ─────────────────────────────────────────────
// Datos: composición de la sangre
// ─────────────────────────────────────────────

interface ComponenteSangre {
  nombre: string;
  nombreCientifico: string;
  icono: string;
  porcentaje: string;
  color: string;
  cantidad: string;
  vida: string;
  funcion: string;
  detalles: string[];
}

const COMPONENTES: ComponenteSangre[] = [
  {
    nombre: 'Plasma',
    nombreCientifico: 'Plasma sanguíneo',
    icono: '💛',
    porcentaje: '55 %',
    color: '#f0c040',
    cantidad: '~2,75 L',
    vida: 'Se renueva constantemente',
    funcion: 'Transporta células, nutrientes, hormonas, CO₂ disuelto y productos de desecho.',
    detalles: [
      'Agua (92 % del plasma)',
      'Proteínas: albúmina (60 %), inmunoglobulinas (anticuerpos), fibrinógeno (coagulación)',
      'Glucosa, aminoácidos, lípidos',
      'Hormonas (insulina, cortisol, tiroxina...)',
      'CO₂ disuelto y bicarbonato',
      'Electrolitos: Na⁺, K⁺, Ca²⁺, Cl⁻',
    ],
  },
  {
    nombre: 'Glóbulos rojos',
    nombreCientifico: 'Eritrocitos',
    icono: '🔴',
    porcentaje: '~45 %',
    color: '#e74c3c',
    cantidad: '~5 millones/μL',
    vida: '120 días',
    funcion: 'Transportan O₂ desde los pulmones a los tejidos y CO₂ de vuelta.',
    detalles: [
      'Forma bicóncava (disco aplastado) — maximiza superficie de intercambio',
      'Sin núcleo ni orgánulos — más espacio para hemoglobina',
      'Hemoglobina: 4 subunidades, cada una con 1 átomo de hierro (Fe²⁺)',
      'Cada eritrocito contiene ~270 millones de moléculas de hemoglobina',
      'Se producen en la médula ósea (~200.000 millones/día)',
      'Reciclados por el bazo y el hígado al final de su vida',
    ],
  },
  {
    nombre: 'Glóbulos blancos',
    nombreCientifico: 'Leucocitos',
    icono: '⚪',
    porcentaje: '<1 %',
    color: '#95a5a6',
    cantidad: '5.000-10.000/μL',
    vida: 'Horas a años',
    funcion: 'Defensa inmunitaria: detectan y destruyen patógenos, células infectadas y cuerpos extraños.',
    detalles: [
      'Neutrófilos (60 %): fagocitan bacterias, viven horas',
      'Linfocitos (30 %): inmunidad adaptativa (T y B), producen anticuerpos',
      'Monocitos (6 %): se convierten en macrófagos en tejidos',
      'Eosinófilos (3 %): parásitos y reacciones alérgicas',
      'Basófilos (1 %): liberan histamina, inflamación',
    ],
  },
  {
    nombre: 'Plaquetas',
    nombreCientifico: 'Trombocitos',
    icono: '🟠',
    porcentaje: '<1 %',
    color: '#e67e22',
    cantidad: '150.000-400.000/μL',
    vida: '8-10 días',
    funcion: 'Coagulación: forman el tapón plaquetario y activan la cascada de fibrina.',
    detalles: [
      'Fragmentos de megacariocitos (células gigantes de médula ósea)',
      'Sin núcleo — son fragmentos celulares',
      'Se adhieren al colágeno expuesto en la lesión',
      'Liberan factores que atraen más plaquetas (agregación)',
      'Activan la cascada de coagulación (factores I-XIII)',
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: tipos de leucocitos (para gráfico)
// ─────────────────────────────────────────────

interface TipoLeucocito {
  nombre: string;
  porcentaje: number;
  color: string;
  funcion: string;
}

const LEUCOCITOS: TipoLeucocito[] = [
  { nombre: 'Neutrófilos', porcentaje: 60, color: '#3498db', funcion: 'Fagocitan bacterias' },
  { nombre: 'Linfocitos', porcentaje: 30, color: '#27ae60', funcion: 'Inmunidad adaptativa' },
  { nombre: 'Monocitos', porcentaje: 6, color: '#e67e22', funcion: 'Se convierten en macrófagos' },
  { nombre: 'Eosinófilos', porcentaje: 3, color: '#9b59b6', funcion: 'Parásitos y alergias' },
  { nombre: 'Basófilos', porcentaje: 1, color: '#e74c3c', funcion: 'Histamina e inflamación' },
];

// ─────────────────────────────────────────────
// Datos: grupos sanguíneos
// ─────────────────────────────────────────────

interface GrupoSanguineo {
  grupo: string;
  antigenos: string;
  anticuerpos: string;
  donaA: string[];
  recibeDE: string[];
}

const GRUPOS: GrupoSanguineo[] = [
  { grupo: 'O-', antigenos: 'Ninguno', anticuerpos: 'Anti-A, Anti-B', donaA: ['O-','O+','A-','A+','B-','B+','AB-','AB+'], recibeDE: ['O-'] },
  { grupo: 'O+', antigenos: 'D (Rh)', anticuerpos: 'Anti-A, Anti-B', donaA: ['O+','A+','B+','AB+'], recibeDE: ['O-','O+'] },
  { grupo: 'A-', antigenos: 'A', anticuerpos: 'Anti-B', donaA: ['A-','A+','AB-','AB+'], recibeDE: ['O-','A-'] },
  { grupo: 'A+', antigenos: 'A, D (Rh)', anticuerpos: 'Anti-B', donaA: ['A+','AB+'], recibeDE: ['O-','O+','A-','A+'] },
  { grupo: 'B-', antigenos: 'B', anticuerpos: 'Anti-A', donaA: ['B-','B+','AB-','AB+'], recibeDE: ['O-','B-'] },
  { grupo: 'B+', antigenos: 'B, D (Rh)', anticuerpos: 'Anti-A', donaA: ['B+','AB+'], recibeDE: ['O-','O+','B-','B+'] },
  { grupo: 'AB-', antigenos: 'A, B', anticuerpos: 'Ninguno', donaA: ['AB-','AB+'], recibeDE: ['O-','A-','B-','AB-'] },
  { grupo: 'AB+', antigenos: 'A, B, D (Rh)', anticuerpos: 'Ninguno', donaA: ['AB+'], recibeDE: ['O-','O+','A-','A+','B-','B+','AB-','AB+'] },
];

interface DistribucionGrupo {
  grupo: string;
  porcentaje: number;
  color: string;
}

const DISTRIBUCION_ESPANA: DistribucionGrupo[] = [
  { grupo: 'O+', porcentaje: 36, color: '#e74c3c' },
  { grupo: 'A+', porcentaje: 34, color: '#2E86AB' },
  { grupo: 'B+', porcentaje: 8, color: '#27ae60' },
  { grupo: 'AB+', porcentaje: 3, color: '#9b59b6' },
  { grupo: 'O-', porcentaje: 9, color: '#c0392b' },
  { grupo: 'A-', porcentaje: 7, color: '#1a6d8a' },
  { grupo: 'B-', porcentaje: 2, color: '#1e8449' },
  { grupo: 'AB-', porcentaje: 1, color: '#7d3c98' },
];

// ─────────────────────────────────────────────
// Datos: cascada de coagulación
// ─────────────────────────────────────────────

interface PasoCoagulacion {
  numero: number;
  titulo: string;
  icono: string;
  descripcion: string;
  color: string;
}

const PASOS_COAGULACION: PasoCoagulacion[] = [
  { numero: 1, titulo: 'Lesión vascular', icono: '🩸', descripcion: 'Un vaso sanguíneo se rompe. El colágeno subendotelial queda expuesto al torrente sanguíneo.', color: '#e74c3c' },
  { numero: 2, titulo: 'Vasoconstricción', icono: '🔄', descripcion: 'El vaso se contrae para reducir el flujo de sangre a la zona dañada. Respuesta refleja inmediata.', color: '#e67e22' },
  { numero: 3, titulo: 'Adhesión plaquetaria', icono: '🟠', descripcion: 'Las plaquetas se adhieren al colágeno expuesto mediante factor von Willebrand. Se activan y cambian de forma.', color: '#f39c12' },
  { numero: 4, titulo: 'Tapón plaquetario', icono: '🩹', descripcion: 'Las plaquetas liberan ADP y tromboxano A₂, atrayendo más plaquetas. Se forma un tapón primario (hemostasia primaria).', color: '#d4a017' },
  { numero: 5, titulo: 'Cascada de coagulación', icono: '⚙️', descripcion: 'Los factores de coagulación (I-XIII) se activan en cadena. Protrombina → trombina. La vitamina K es esencial para varios factores.', color: '#2E86AB' },
  { numero: 6, titulo: 'Red de fibrina', icono: '🕸️', descripcion: 'La trombina convierte fibrinógeno (soluble) en fibrina (insoluble). La fibrina forma una red que atrapa eritrocitos y plaquetas.', color: '#48A9A6' },
  { numero: 7, titulo: 'Coágulo estable', icono: '🛡️', descripcion: 'El factor XIII estabiliza la red de fibrina (reticulación). El coágulo se contrae y sella la herida completamente.', color: '#27ae60' },
];

// ─────────────────────────────────────────────
// Datos: anticoagulantes
// ─────────────────────────────────────────────

interface Farmaco {
  nombre: string;
  mecanismo: string;
  uso: string;
}

/**
 * Anticoagulantes: actúan sobre la CASCADA (los factores de coagulación).
 *
 * ⚠️ 26/09/2026 (hallazgo 1966) — ponía «Warfarina (Sintrom)», pero Sintrom es ACENOCUMAROL
 * (CIMA-AEMPS, n.º de registro 25670 y 58994); la warfarina se comercializa en España como
 * Aldocumar. Los dos son antivitamina K, pero no son intercambiables.
 */
const ANTICOAGULANTES: Farmaco[] = [
  { nombre: 'Heparina', mecanismo: 'Potencia la antitrombina III, que inactiva la trombina y el factor Xa.', uso: 'Hospitalario, inyectable. Prevención de trombosis.' },
  { nombre: 'Antivitamina K: acenocumarol (Sintrom) o warfarina (Aldocumar)', mecanismo: 'Bloquean la vitamina K, necesaria para fabricar los factores II, VII, IX y X.', uso: 'Oral, a largo plazo. Fibrilación auricular, prótesis valvulares.' },
];

/**
 * Antiagregantes: actúan sobre las PLAQUETAS, no sobre la cascada.
 *
 * ⚠️ 26/09/2026 (hallazgo 1970) — la aspirina figuraba entre los anticoagulantes. Su código
 * ATC es B01AC06, «Platelet aggregation inhibitors excl. heparin» (WHO ATC/DDD).
 */
const ANTIAGREGANTES: Farmaco[] = [
  { nombre: 'Ácido acetilsalicílico (aspirina)', mecanismo: 'Antiagregante plaquetario: inhibe la ciclooxigenasa (COX-1) de las plaquetas y reduce su agregación. No actúa sobre los factores de la cascada.', uso: 'Oral. Prevención secundaria de infarto e ictus.' },
];

// ─────────────────────────────────────────────
// Datos: valores normales de un análisis
// ─────────────────────────────────────────────

/**
 * Valores de referencia ORIENTATIVOS de un adulto.
 *
 * ⚠️ 26/09/2026 (hallazgos 1965 y 1969) — la tabla daba un solo rango para los dos sexos, y
 * el de la hemoglobina (12-16 g/dL) era el de la mujer: un hombre con 12,5 g/dL salía «normal»
 * cuando la OMS lo considera anemia. Y la glucosa daba «70-100» como normal, con lo que 100 era
 * a la vez normal y prediabetes.
 *
 * Solo se escribe como límite lo que tiene fuente verificada:
 *   · Hemoglobina: anemia por debajo de 12 g/dL (mujeres no embarazadas) y 13 g/dL (hombres),
 *     OMS, «Guideline on haemoglobin cutoffs to define anaemia» (2024).
 *   · Hematocrito y eritrocitos: límites de anemia por sexo del Manual MSD (edición para
 *     profesionales, «Evaluation of Anemia»): < 37 % / < 40 % y < 4 / < 4,5 millones/µL.
 *   · Glucosa en ayunas: ADA, Standards of Care in Diabetes—2026, sección 2 (normal < 100;
 *     prediabetes 100-125; diabetes ≥ 126 mg/dL). El suelo de 70 es el umbral de hipoglucemia
 *     de nivel 1 de la misma ADA.
 * El límite superior de hemoglobina, hematocrito y eritrocitos varía entre laboratorios, y por
 * eso no se inventa uno. Nada de esto es un juicio sobre una persona: lo que vale es el
 * intervalo que figura en su propio informe.
 */
interface ValorAnalisis {
  parametro: string;
  /** Texto completo, con unidades y por sexo cuando difiere. */
  referencia: string;
  queMide: string;
  /** Qué puede haber detrás de un valor fuera de rango: posibilidades, no diagnósticos. */
  fueraDeRango: string;
}

/** «15 %» con espacio duro (U+00A0), CLAUDE.md global §2. */
const PCT = '\u00A0%';

const VALORES_ANALISIS: ValorAnalisis[] = [
  { parametro: 'Hemoglobina', referencia: 'Mujeres: 12 g/dL o más · Hombres: 13 g/dL o más (OMS, 2024)', queMide: 'Proteína transportadora de O₂ en eritrocitos', fueraDeRango: 'Por debajo del límite, la OMS habla de anemia. Alta: deshidratación, tabaco, vivir en altitud o policitemia, entre otras' },
  { parametro: 'Hematocrito', referencia: `Mujeres: 37${PCT} o más · Hombres: 40${PCT} o más`, queMide: 'Porcentaje de volumen ocupado por eritrocitos', fueraDeRango: 'Bajo: anemia o pérdida de sangre. Alto: deshidratación o policitemia, entre otras' },
  { parametro: 'Eritrocitos', referencia: 'Mujeres: 4 millones/µL o más · Hombres: 4,5 millones/µL o más', queMide: 'Número de glóbulos rojos', fueraDeRango: 'Bajo: anemia. Alto: deshidratación, altitud o policitemia, entre otras' },
  { parametro: 'Leucocitos', referencia: '4.500-11.000/µL', queMide: 'Número de glóbulos blancos', fueraDeRango: 'Altos (leucocitosis): infección, inflamación, estrés o algunos fármacos. Bajos (leucopenia): infecciones víricas, fármacos o enfermedades de la médula' },
  { parametro: 'Plaquetas', referencia: '150.000-400.000/µL', queMide: 'Número de plaquetas', fueraDeRango: 'Bajas (trombocitopenia): más facilidad para sangrar. Altas (trombocitosis): inflamación, falta de hierro o trastornos de la médula' },
  { parametro: 'Glucosa en ayunas', referencia: '70-99 mg/dL (ADA, 2026)', queMide: 'Nivel de azúcar en sangre tras 8 horas sin comer', fueraDeRango: 'Alta: la ADA considera prediabetes de 100 a 125 mg/dL y diabetes desde 126 mg/dL, confirmado en otra medición. Por debajo de 70: hipoglucemia' },
  { parametro: 'Colesterol total', referencia: 'Menos de 200 mg/dL (deseable)', queMide: 'Colesterol total en sangre', fueraDeRango: 'Alto: es uno de los factores de riesgo cardiovascular, y se valora junto al HDL, el LDL y el resto de factores de cada persona' },
];

// ─────────────────────────────────────────────
// Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '🩸', titulo: '~5 litros de sangre', descripcion: 'Una persona adulta tiene entre 4,5 y 5,5 litros de sangre, el 7-8 % de su peso corporal.' },
  { icono: '🏭', titulo: '200.000 millones de eritrocitos/día', descripcion: 'Tu médula ósea produce unos 200.000 millones de glóbulos rojos cada día para reemplazar los que mueren.' },
  { icono: '🌍', titulo: '96.000 km de vasos', descripcion: 'Si pusieras todos tus vasos sanguíneos en línea, darían 2,5 vueltas a la Tierra.' },
  { icono: '💀', titulo: 'Hemofilia real', descripcion: 'La hemofilia (falta de factor VIII o IX) afectó a la realeza europea. Se conocía como "la enfermedad de los reyes".' },
  { icono: '🔬', titulo: 'La capa fantasma', descripcion: 'La capa leucoplaquetaria (buffy coat) es <1 % del volumen, pero contiene TODOS los leucocitos y plaquetas.' },
  { icono: '⚡', titulo: 'Coagulación en 3-5 minutos', descripcion: 'Desde la lesión hasta el coágulo estable, el proceso completo tarda entre 3 y 5 minutos.' },
  { icono: '🅾️', titulo: 'O- es oro líquido', descripcion: 'Solo el 9 % de los españoles son O-. Sus glóbulos rojos se pueden transfundir a cualquier receptor, y por eso son imprescindibles en emergencias (con el plasma es al revés: el universal es el AB).' },
];

// ─────────────────────────────────────────────
// Sección 1: Composición
// ─────────────────────────────────────────────

function SeccionComposicion() {
  const [componenteActivo, setComponenteActivo] = useState<number | null>(null);
  const alternar = (i: number) => setComponenteActivo((actual) => (actual === i ? null : i));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Si centrifugas un tubo de sangre, se separa en <strong>3 capas</strong> por densidad. Haz clic en cada capa para explorarla.</p>
      </div>

      {/* SVG tubo de ensayo centrifugado */}
      <div className={styles.tuboZona}>
        {/* role="group" y no role="img": los hijos de un img son presentacionales, y las tres
            capas son botones que un lector de pantalla tiene que poder encontrar. */}
        <svg viewBox="0 0 200 340" className={styles.tuboSvg} role="group" aria-label="Tubo de ensayo centrifugado mostrando las 3 capas de la sangre: plasma arriba (amarillo, 55 %), capa leucoplaquetaria en medio (blanca, menos del 1 %) y glóbulos rojos abajo (rojo, 45 %)">
          {/* Tubo - contorno */}
          <rect x="60" y="30" width="80" height="260" rx="6" ry="6" fill="none" stroke="var(--text-muted)" strokeWidth="2" />
          {/* Fondo redondeado del tubo */}
          <ellipse cx="100" cy="286" rx="38" ry="6" fill="none" stroke="var(--text-muted)" strokeWidth="2" />

          {/* Capa 3: Glóbulos rojos (45 %) - abajo */}
          <rect
            x="62" y="170" width="76" height="118" rx="0"
            fill="#c0392b" opacity={componenteActivo === 1 ? 0.6 : 0.85}
            className={styles.tuboCapaClick}
            onClick={() => alternar(1)}
            onKeyDown={alPulsarTecla(() => alternar(1))}
            role="button"
            tabIndex={0}
            aria-pressed={componenteActivo === 1}
            aria-label="Glóbulos rojos: 45 % del volumen"
          />
          <text x="100" y="230" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" pointerEvents="none">Glóbulos rojos</text>
          <text x="100" y="248" textAnchor="middle" fill="#fff" fontSize="10" opacity="0.9" pointerEvents="none">45 %</text>

          {/* Capa 2: Buffy coat (<1 %) - medio */}
          <rect
            x="62" y="164" width="76" height="6"
            fill="#f5f0e1" opacity={componenteActivo === 2 ? 0.6 : 0.95}
            className={styles.tuboCapaClick}
            onClick={() => alternar(2)}
            onKeyDown={alPulsarTecla(() => alternar(2))}
            role="button"
            tabIndex={0}
            aria-pressed={componenteActivo === 2}
            aria-label="Capa leucoplaquetaria: menos del 1 %"
          />

          {/* Capa 1: Plasma (55 %) - arriba */}
          <rect
            x="62" y="32" width="76" height="132" rx="4"
            fill="#f0c040" opacity={componenteActivo === 0 ? 0.5 : 0.7}
            className={styles.tuboCapaClick}
            onClick={() => alternar(0)}
            onKeyDown={alPulsarTecla(() => alternar(0))}
            role="button"
            tabIndex={0}
            aria-pressed={componenteActivo === 0}
            aria-label="Plasma: 55 % del volumen"
          />
          <text x="100" y="90" textAnchor="middle" fill="#333" fontSize="11" fontWeight="700" pointerEvents="none">Plasma</text>
          <text x="100" y="108" textAnchor="middle" fill="#333" fontSize="10" opacity="0.8" pointerEvents="none">55 %</text>

          {/* Etiquetas laterales */}
          {/* En dos líneas: en una sola empezaba en x = 168 y medía ~54, y el viewBox (200 de
              ancho) recortaba justo el «<1 %» (hallazgo 1977). */}
          <line x1="142" y1="167" x2="150" y2="167" stroke="var(--text-muted)" strokeWidth="1" />
          <text x="153" y="165" fill="var(--text-secondary)" fontSize="8">
            <tspan x="153">Buffy coat</tspan>
            <tspan x="153" dy="10">&lt;1 %</tspan>
          </text>

          {/* Tapón del tubo */}
          <rect x="56" y="20" width="88" height="14" rx="4" fill="#e74c3c" opacity="0.9" />
        </svg>

        {/* Hematocrito */}
        <div className={styles.hematocritoBox}>
          <strong>Hematocrito</strong>
          <p>Porcentaje de volumen que ocupan los glóbulos rojos.</p>
          <div className={styles.hematocritoValores}>
            <span>Hombres: ~45 %</span>
            <span>Mujeres: ~40 %</span>
          </div>
        </div>
      </div>

      {/* Cards de componentes */}
      <div className={styles.componentesGrid}>
        {COMPONENTES.map((comp, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.componenteCard} ${componenteActivo === i ? styles.componenteActivo : ''}`}
            style={{ borderLeftColor: comp.color }}
            onClick={() => setComponenteActivo(componenteActivo === i ? null : i)}
            aria-expanded={componenteActivo === i}
            aria-label={`${comp.nombre} (${comp.nombreCientifico}): ${comp.porcentaje} de la sangre`}
          >
            <div className={styles.componenteHeader}>
              <span aria-hidden="true" className={styles.componenteIcono}>{comp.icono}</span>
              <div>
                <strong className={styles.componenteNombre}>{comp.nombre}</strong>
                <span className={styles.componenteCientifico}>{comp.nombreCientifico}</span>
              </div>
              {/* El color del componente vive en el borde izquierdo de la tarjeta: como color del
                  texto, el amarillo del plasma daba 1,70:1 sobre blanco (hallazgo 1968). */}
              <span className={styles.componentePct}>{comp.porcentaje}</span>
            </div>

            {componenteActivo === i && (
              <div className={styles.componenteDetalle}>
                <div className={styles.componenteMeta}>
                  <span><strong>Cantidad:</strong> {comp.cantidad}</span>
                  <span><strong>Vida:</strong> {comp.vida}</span>
                </div>
                <p className={styles.componenteFuncion}>{comp.funcion}</p>
                <ul className={styles.componenteDetalles}>
                  {comp.detalles.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Tipos de leucocitos - barras */}
      <h3 className={styles.subSeccionTitulo}>Tipos de leucocitos (glóbulos blancos)</h3>
      <div className={styles.leucocitosBarras}>
        {LEUCOCITOS.map((l, i) => (
          <div key={i} className={styles.barraGrupo}>
            <div className={styles.barraLabelZona}>
              <span className={styles.barraLabel}>{l.nombre}</span>
              <span className={styles.barraPct}>{l.porcentaje}{PCT}</span>
            </div>
            <div className={styles.barraTrack}>
              <div className={styles.barraFill} style={{ width: `${l.porcentaje}%`, background: l.color }} />
            </div>
            <p className={styles.barraDesc}>{l.funcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>La sangre recorre tu cuerpo entero en apenas <strong>60 segundos</strong>. En cada viaje, entrega oxígeno, recoge CO₂, distribuye nutrientes y patrulla buscando invasores.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Grupos Sanguíneos
// ─────────────────────────────────────────────

function SeccionGrupos() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);
  const todosGrupos = GRUPOS.map(g => g.grupo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu grupo sanguíneo depende de qué <strong>antígenos</strong> tienen tus eritrocitos (A, B, ambos o ninguno) y si tienen el <strong>factor Rh</strong> (antígeno D).</p>
      </div>

      {/* Tabla ABO explicativa */}
      <h3 className={styles.subSeccionTitulo}>Sistema ABO + Rh</h3>
      <div className={styles.tablaABOWrapper}>
        <table className={styles.tablaABO}>
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Antígenos</th>
              <th>Anticuerpos</th>
            </tr>
          </thead>
          <tbody>
            {GRUPOS.map((g, i) => (
              <tr key={i} className={grupoSeleccionado === g.grupo ? styles.filaActiva : ''}>
                <td>
                  <button
                    type="button"
                    className={`${styles.grupoBtn} ${grupoSeleccionado === g.grupo ? styles.grupoBtnActivo : ''}`}
                    onClick={() => setGrupoSeleccionado(grupoSeleccionado === g.grupo ? null : g.grupo)}
                    aria-pressed={grupoSeleccionado === g.grupo}
                  >
                    {g.grupo}
                  </button>
                </td>
                <td>{g.antigenos}</td>
                <td>{g.anticuerpos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compatibilidad visual.
          ⚠️ 26/09/2026 (hallazgo 1964) — la cuadrícula y los destacados valen para GLÓBULOS
          ROJOS (concentrado de hematíes), y no lo decían. Con el plasma es al revés: el plasma O
          lleva anti-A y anti-B y solo sirve a receptores O, y el donante universal de plasma es
          el AB («Plasma group AB is therefore considered universal (as opposed to O negative for
          red cells)», NHS Blood and Transplant, «Universal blood components – the way of the
          future?»).
          ⚠️ (hallazgo 1976) — eran <div>s sin rol: el árbol de accesibilidad daba la cuadrícula
          como UN solo texto y los aria-label de las celdas no llegaban. Los roles de tabla ARIA
          asocian cada celda a su donante (fila) y a su receptor (columna). */}
      <h3 className={styles.subSeccionTitulo} id="compat-titulo">
        Compatibilidad de glóbulos rojos (hematíes): donante → receptor
      </h3>
      <div className={styles.compatGrid} role="table" aria-labelledby="compat-titulo">
        <div className={styles.compatHeader} role="row">
          <div className={styles.compatCorner} role="columnheader">
            <span aria-hidden="true">D↓ / R→</span>
            <span className={styles.srOnly}>Donante / receptor</span>
          </div>
          {todosGrupos.map(g => (
            <div key={g} className={styles.compatColHeader} role="columnheader" aria-label={`Receptor ${g}`}>{g}</div>
          ))}
        </div>
        {GRUPOS.map((donante) => (
          <div key={donante.grupo} className={styles.compatRow} role="row">
            <div className={styles.compatRowHeader} role="rowheader" aria-label={`Donante ${donante.grupo}`}>{donante.grupo}</div>
            {todosGrupos.map(receptor => (
              <div
                key={receptor}
                role="cell"
                className={`${styles.compatCell} ${donante.donaA.includes(receptor) ? styles.compatSi : styles.compatNo}`}
                aria-label={`${donante.grupo} dona a ${receptor}: ${donante.donaA.includes(receptor) ? 'sí' : 'no'}`}
              >
                {donante.donaA.includes(receptor) ? '✅' : '❌'}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.destacados}>
        <div className={styles.destacadoCard} style={{ borderLeftColor: '#e74c3c' }}>
          <span aria-hidden="true">🅾️</span>
          <div>
            <strong>O- → Donante universal de glóbulos rojos</strong>
            <p>Sus hematíes no tienen antígenos A, B ni Rh: se pueden transfundir a cualquier grupo.</p>
          </div>
        </div>
        <div className={styles.destacadoCard} style={{ borderLeftColor: '#2E86AB' }}>
          <span aria-hidden="true">🆎</span>
          <div>
            <strong>AB+ → Receptor universal de glóbulos rojos</strong>
            <p>Sus hematíes tienen A, B y D, así que no fabrica anticuerpos contra ninguno: puede recibir hematíes de cualquier grupo.</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Con el plasma es al revés.</strong> El plasma lleva los anticuerpos del
          donante: el de un O tiene anti-A y anti-B y solo se puede dar a receptores O. Por eso el
          donante universal de plasma es el <strong>AB</strong>, y el receptor universal de
          plasma, el <strong>O</strong>. En la práctica, siempre que se puede se transfunde del
          mismo grupo.
        </p>
      </div>

      {/* Distribución en España */}
      <h3 className={styles.subSeccionTitulo}>Distribución en España</h3>
      <div className={styles.distribucionBarras}>
        {DISTRIBUCION_ESPANA.map((d, i) => (
          <div key={i} className={styles.distGrupo}>
            <div className={styles.distLabel}>
              <span className={styles.distGrupoNombre}>{d.grupo}</span>
              <span className={styles.distPct}>{d.porcentaje}{PCT}</span>
            </div>
            <div className={styles.barraTrack}>
              <div className={styles.barraFill} style={{ width: `${(d.porcentaje / 36) * 100}%`, background: d.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.warningBox}>
        <strong>Incompatibilidad Rh en embarazo</strong>
        <p>Si una madre Rh- lleva un feto Rh+, su sistema inmune puede producir anticuerpos anti-D que atacan los eritrocitos del bebé (enfermedad hemolítica del recién nacido). Se previene con una inyección de inmunoglobulina anti-D.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Coagulación
// ─────────────────────────────────────────────

function SeccionCoagulacion() {
  const [pasoActivo, setPasoActivo] = useState<number>(0);
  const paso = PASOS_COAGULACION[pasoActivo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cuando un vaso se rompe, tu cuerpo activa una cascada de <strong>7 pasos</strong> para sellar la herida. De lesión a coágulo estable en 3-5 minutos.</p>
      </div>

      {/* Cascada visual SVG */}
      <div className={styles.cascadaZona}>
        {/* role="group": dentro de un role="img" los siete botones serían presentacionales. */}
        <svg viewBox="0 0 700 80" className={styles.cascadaSvg} role="group" aria-label="Cascada de coagulación en 7 pasos">
          {PASOS_COAGULACION.map((p, i) => {
            const x = 10 + i * 98;
            const activo = pasoActivo === i;
            return (
              <g key={i}>
                <circle
                  cx={x + 35} cy={40} r={activo ? 28 : 24}
                  fill={activo ? p.color : 'var(--bg-card)'}
                  stroke={p.color} strokeWidth={activo ? 3 : 2}
                  className={styles.cascadaCircle}
                  onClick={() => setPasoActivo(i)}
                  onKeyDown={alPulsarTecla(() => setPasoActivo(i))}
                  role="button"
                  tabIndex={0}
                  aria-label={`Paso ${p.numero}: ${p.titulo}`}
                  aria-pressed={activo}
                />
                <text
                  x={x + 35} y={44} textAnchor="middle"
                  fontSize="18" pointerEvents="none"
                  fill={activo ? '#fff' : 'var(--text-primary)'}
                >
                  {p.icono}
                </text>
                {i < 6 && (
                  <line x1={x + 63} y1={40} x2={x + 75} y2={40} stroke="var(--text-muted)" strokeWidth="2" markerEnd="url(#arrow)" />
                )}
              </g>
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="var(--text-muted)" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Detalle del paso */}
      <div className={styles.pasoDetalle} style={{ borderLeftColor: paso.color }}>
        <div className={styles.pasoHeader}>
          {/* Fondo fijo --primary-boton: con el color de cada paso, el blanco bajaba a 2,19:1
              (hallazgo 1968). El color del paso sigue en el borde izquierdo del recuadro. */}
          <span className={styles.pasoNumero}>Paso {paso.numero}</span>
          <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
        </div>
        <p className={styles.pasoDesc}>{paso.descripcion}</p>
      </div>

      {/* Navegación de pasos */}
      <div className={styles.pasoNav}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => setPasoActivo(Math.max(0, pasoActivo - 1))}
          disabled={pasoActivo === 0}
          aria-label="Paso anterior"
        >
          ← Anterior
        </button>
        <span className={styles.pasoIndicador}>{pasoActivo + 1} / {PASOS_COAGULACION.length}</span>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => setPasoActivo(Math.min(6, pasoActivo + 1))}
          disabled={pasoActivo === 6}
          aria-label="Paso siguiente"
        >
          Siguiente →
        </button>
      </div>

      {/* Anticoagulantes */}
      <h3 className={styles.subSeccionTitulo}>Anticoagulantes: frenando la cascada</h3>
      <div className={styles.anticoagGrid}>
        {ANTICOAGULANTES.map((a, i) => (
          <div key={i} className={styles.anticoagCard}>
            <strong className={styles.anticoagNombre}>{a.nombre}</strong>
            <p className={styles.anticoagMecanismo}>{a.mecanismo}</p>
            <p className={styles.anticoagUso}><em>{a.uso}</em></p>
          </div>
        ))}
      </div>

      <h3 className={styles.subSeccionTitulo}>Antiagregantes: frenando las plaquetas</h3>
      <div className={styles.anticoagGrid}>
        {ANTIAGREGANTES.map((a, i) => (
          <div key={i} className={styles.anticoagCard}>
            <strong className={styles.anticoagNombre}>{a.nombre}</strong>
            <p className={styles.anticoagMecanismo}>{a.mecanismo}</p>
            <p className={styles.anticoagUso}><em>{a.uso}</em></p>
          </div>
        ))}
      </div>

      <div className={styles.warningBox}>
        <strong>Hemofilia</strong>
        <p>Enfermedad genética ligada al cromosoma X. La hemofilia A (falta factor VIII, 80 % de casos) y la hemofilia B (falta factor IX) impiden que la cascada de coagulación se complete normalmente.</p>
      </div>

      <div className={styles.insight}>
        <p>La vitamina K (del alemán <em>Koagulation</em>) es esencial: sin ella, el hígado no puede fabricar los factores II, VII, IX y X. Los recién nacidos reciben una dosis al nacer porque nacen con reservas bajas.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos y Análisis
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un análisis de sangre es una de las pruebas más frecuentes. Estos son <strong>valores de referencia orientativos</strong> en adultos: cada laboratorio fija sus propios intervalos, y el que vale es el que figura en tu informe.</p>
      </div>

      {/* Tabla de valores de referencia */}
      <div className={styles.tablaValoresWrapper}>
        <table className={styles.tablaValores}>
          <caption className={styles.srOnly}>Valores de referencia orientativos de un análisis de sangre en adultos</caption>
          <thead>
            <tr>
              <th>Parámetro</th>
              <th>Referencia orientativa</th>
              <th>Qué mide</th>
              <th>Fuera de rango, puede deberse a…</th>
            </tr>
          </thead>
          <tbody>
            {VALORES_ANALISIS.map((v, i) => (
              <tr key={i}>
                <td><strong>{v.parametro}</strong></td>
                <td className={styles.valorRango}>{v.referencia}</td>
                <td>{v.queMide}</td>
                <td className={styles.valorAlerta}>{v.fueraDeRango}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.fuenteNota}>
        Fuentes: hemoglobina, OMS, <em>Guideline on haemoglobin cutoffs to define anaemia</em>{' '}
        (2024); hematocrito y eritrocitos, Manual MSD (edición para profesionales); glucosa,
        American Diabetes Association, <em>Standards of Care in Diabetes—2026</em>. Leucocitos,
        plaquetas y colesterol: intervalos habituales que cambian de un laboratorio a otro. Un
        valor aislado no es un diagnóstico: lo interpreta un profesional sanitario.
      </p>

      {/* Condiciones comunes */}
      <h3 className={styles.subSeccionTitulo}>Condiciones comunes detectadas en un análisis</h3>
      <div className={styles.condicionesGrid}>
        <div className={styles.condicionCard}>
          <span className={styles.condicionIcono} aria-hidden="true">🔴</span>
          <strong>Anemia</strong>
          <p>Hemoglobina baja. Causas: falta de hierro, vitamina B12, pérdida de sangre, enfermedades crónicas. Síntomas: cansancio, palidez, mareos.</p>
        </div>
        <div className={styles.condicionCard}>
          <span className={styles.condicionIcono} aria-hidden="true">⚪</span>
          <strong>Leucocitosis</strong>
          <p>Leucocitos por encima de {formatNumber(11000, 0)}/µL. Suele acompañar a una infección, una inflamación, el estrés o algunos fármacos; rara vez, a una leucemia.</p>
        </div>
        <div className={styles.condicionCard}>
          <span className={styles.condicionIcono} aria-hidden="true">🟠</span>
          <strong>Trombocitopenia</strong>
          <p>Plaquetas por debajo de {formatNumber(150000, 0)}/µL. Aumenta la facilidad para sangrar. Causas posibles: infecciones víricas, medicamentos, enfermedades autoinmunes.</p>
        </div>
        <div className={styles.condicionCard}>
          <span className={styles.condicionIcono} aria-hidden="true">📊</span>
          <strong>Hiperglucemia</strong>
          {/* Tramos de la ADA (Standards of Care in Diabetes—2026, sección 2). Antes decía
              «diabetes (>126)», con lo que 126 no caía en ningún tramo (hallazgo 1969). */}
          <p>Glucosa en ayunas de 100 mg/dL o más. Según los criterios de la ADA, de 100 a 125 mg/dL es prediabetes, y de 126 mg/dL o más, confirmado en una segunda medición, diabetes. El diagnóstico lo hace un profesional sanitario.</p>
        </div>
      </div>

      {/* Datos fascinantes */}
      <h3 className={styles.subSeccionTitulo}>Datos fascinantes</h3>
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <div>
              <strong>{d.titulo}</strong>
              <p>{d.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        {/* ⚠️ 26/09/2026 (hallazgos 1971 y 1973) — decía «10.000 millones de leucocitos» y
            «400.000 millones de plaquetas», y formatNumber sin decimales explícitos los pintaba
            con «,00». Solo de neutrófilos se producen 5 × 10¹⁰ a 10 × 10¹⁰ al día (Summers et al.,
            «Neutrophil kinetics in health and disease», Trends Immunol 2010;31:318), y del
            conjunto de megacariocitos salen unos 1 × 10¹¹ plaquetas al día. */}
        <p>La médula ósea es la fábrica de tu sangre. En un adulto, pesa unos 2,6 kg (más que el hígado) y produce cada día unos <strong>{formatNumber(200000, 0)} millones</strong> de eritrocitos, entre <strong>{formatNumber(50000, 0)} y {formatNumber(100000, 0)} millones</strong> de neutrófilos (el leucocito más abundante) y unos <strong>{formatNumber(100000, 0)} millones</strong> de plaquetas.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SangreComponentesPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('composicion');

  const seccionInfo = SECCIONES.find(s => s.id === seccionActiva)!;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🩸</span> Componentes de la Sangre</h1>
          <p className={styles.subtitle}>Plasma, eritrocitos, leucocitos y plaquetas — tu sangre bajo el microscopio</p>
        </header>

        <LegalNotice />

        {/* ⚠️ 26/09/2026 (hallazgo 1967) — la app iba marcada `@disclaimer: exempt` estando en
            la suite salud y enseñando valores de un análisis. Nivel 2 de
            _private/DISCLAIMER-POLICY.md (mismo caso que el 1358 de visualizador-ciclo-viral):
            severity="high", nunca colapsable. */}
        <DisclaimerCard variant="medical" severity="high" collapsible={false} title="Aviso sanitario">
          Este visualizador es divulgación de biología y hematología. Los valores de referencia que
          muestra son orientativos: cada laboratorio fija los suyos, y un resultado fuera de rango
          solo lo puede interpretar un profesional sanitario junto a tu historia clínica. No sirve
          para diagnosticar ni para decidir un tratamiento, una transfusión o una donación.
        </DisclaimerCard>

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
              aria-label={`Sección: ${s.titulo}`}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">{seccionInfo.icono}</span> {seccionInfo.titulo}</h2>
          <p className={styles.seccionSubtitulo}>{seccionInfo.subtitulo}</p>
        </div>

        {/* Contenido de sección */}
        {seccionActiva === 'composicion' && <SeccionComposicion />}
        {seccionActiva === 'grupos' && <SeccionGrupos />}
        {seccionActiva === 'coagulacion' && <SeccionCoagulacion />}
        {seccionActiva === 'datos' && <SeccionDatos />}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="¿Quieres aprender más sobre la sangre?"
          subtitle="Conceptos clave de hematología"
        >
          <section className={styles.guideSection}>
            <h2>¿De qué está hecha la sangre?</h2>
            <p>La sangre es un tejido conectivo líquido compuesto por una matriz líquida (plasma) y elementos formes (células y fragmentos celulares). Circula por un sistema cerrado de vasos impulsada por el corazón, realizando funciones de transporte, defensa y regulación.</p>

            <h3>El proceso de hematopoyesis</h3>
            <p>Todas las células sanguíneas provienen de una célula madre hematopoyética pluripotente en la médula ósea roja. Esta célula se diferencia en dos líneas: mieloide (eritrocitos, plaquetas, neutrófilos, monocitos, eosinófilos, basófilos) y linfoide (linfocitos T y B, células NK). En el feto, la hematopoyesis ocurre en el hígado y el bazo; después del nacimiento, en la médula ósea de huesos planos (esternón, costillas, pelvis, vértebras).</p>

            <h3>¿Por qué importan los grupos sanguíneos?</h3>
            <p>Los antígenos A y B son azúcares unidos a la superficie de los eritrocitos. Tu sistema inmune produce anticuerpos contra los antígenos que NO tienes. Si recibes sangre incompatible, los anticuerpos aglutinarán (juntarán en grumos) los eritrocitos del donante, provocando una reacción transfusional potencialmente mortal. Karl Landsteiner descubrió el sistema ABO en 1901, por lo que recibió el Nobel de Medicina en 1930.</p>

            <h3>Donación de sangre en España</h3>
            {/* ⚠️ 26/09/2026 (hallazgo 1972) — decía «España necesita unas 9.000 donaciones
                diarias», sin fuente. Ministerio de Sanidad, nota de prensa del 14/06/2026:
                1.662.035 donaciones de sangre y componentes en 2025 → 1.662.035 / 365 ≈ 4.554.
                Intervalo entre donaciones: RD 1088/2005, anexo (mínimo 2 meses; máximo 4
                al año los hombres y 3 las mujeres). */}
            <p>Cada donación (450 mL) puede salvar hasta 3 vidas al separarse en concentrado de hematíes, plasma y plaquetas. Los requisitos básicos son: 18-65 años, más de 50 kg y buena salud general; entre dos donaciones de sangre total pasan al menos 2 meses, con un máximo de 4 al año los hombres y 3 las mujeres. En 2025 se hicieron en España {formatNumber(1662035, 0)} donaciones de sangre y componentes, unas {formatNumber(4550, 0)} al día (Ministerio de Sanidad, 2026).</p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sangre-componentes')} />
        <ShareCard appName="visualizador-sangre-componentes" />
        <Footer appName="visualizador-sangre-componentes" />
    </div>
  );
}
