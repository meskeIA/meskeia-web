'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './SangreComponentes.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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
    porcentaje: '55%',
    color: '#f0c040',
    cantidad: '~2,75 L',
    vida: 'Se renueva constantemente',
    funcion: 'Transporta células, nutrientes, hormonas, CO₂ disuelto y productos de desecho.',
    detalles: [
      'Agua (92% del plasma)',
      'Proteínas: albúmina (60%), inmunoglobulinas (anticuerpos), fibrinógeno (coagulación)',
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
    porcentaje: '~45%',
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
    porcentaje: '<1%',
    color: '#95a5a6',
    cantidad: '5.000-10.000/μL',
    vida: 'Horas a años',
    funcion: 'Defensa inmunitaria: detectan y destruyen patógenos, células infectadas y cuerpos extraños.',
    detalles: [
      'Neutrófilos (60%): fagocitan bacterias, viven horas',
      'Linfocitos (30%): inmunidad adaptativa (T y B), producen anticuerpos',
      'Monocitos (6%): se convierten en macrófagos en tejidos',
      'Eosinófilos (3%): parásitos y reacciones alérgicas',
      'Basófilos (1%): liberan histamina, inflamación',
    ],
  },
  {
    nombre: 'Plaquetas',
    nombreCientifico: 'Trombocitos',
    icono: '🟠',
    porcentaje: '<1%',
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

interface Anticoagulante {
  nombre: string;
  mecanismo: string;
  uso: string;
}

const ANTICOAGULANTES: Anticoagulante[] = [
  { nombre: 'Heparina', mecanismo: 'Potencia la antitrombina III, que inactiva la trombina y el factor Xa.', uso: 'Hospitalario, inyectable. Prevención de trombosis.' },
  { nombre: 'Warfarina (Sintrom)', mecanismo: 'Bloquea la vitamina K, necesaria para fabricar factores II, VII, IX y X.', uso: 'Oral, a largo plazo. Fibrilación auricular, prótesis valvulares.' },
  { nombre: 'Aspirina (AAS)', mecanismo: 'Inhibe la ciclooxigenasa (COX-1) de las plaquetas. Reduce la agregación plaquetaria.', uso: 'Oral. Prevención secundaria de infarto e ictus.' },
];

// ─────────────────────────────────────────────
// Datos: valores normales de un análisis
// ─────────────────────────────────────────────

interface ValorAnalisis {
  parametro: string;
  rango: string;
  unidad: string;
  queMide: string;
  alerta: string;
}

const VALORES_ANALISIS: ValorAnalisis[] = [
  { parametro: 'Hemoglobina', rango: '12-16', unidad: 'g/dL', queMide: 'Proteína transportadora de O₂ en eritrocitos', alerta: 'Baja → anemia; Alta → policitemia' },
  { parametro: 'Hematocrito', rango: '36-48', unidad: '%', queMide: 'Porcentaje de volumen ocupado por eritrocitos', alerta: 'Bajo → anemia, hemorragia; Alto → deshidratación' },
  { parametro: 'Eritrocitos', rango: '4,5-5,5', unidad: 'millones/μL', queMide: 'Número de glóbulos rojos', alerta: 'Bajo → anemia; Alto → policitemia vera' },
  { parametro: 'Leucocitos', rango: '4.500-11.000', unidad: '/μL', queMide: 'Número de glóbulos blancos', alerta: 'Altos (leucocitosis) → infección; Bajos (leucopenia) → inmunosupresión' },
  { parametro: 'Plaquetas', rango: '150.000-400.000', unidad: '/μL', queMide: 'Número de plaquetas', alerta: 'Bajas (trombocitopenia) → sangrado; Altas (trombocitosis) → trombosis' },
  { parametro: 'Glucosa', rango: '70-100', unidad: 'mg/dL', queMide: 'Nivel de azúcar en sangre en ayunas', alerta: 'Alta → diabetes; Baja → hipoglucemia' },
  { parametro: 'Colesterol total', rango: '<200', unidad: 'mg/dL', queMide: 'Colesterol total en sangre', alerta: 'Alto → riesgo cardiovascular' },
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
  { icono: '🩸', titulo: '~5 litros de sangre', descripcion: 'Una persona adulta tiene entre 4,5 y 5,5 litros de sangre, el 7-8% de su peso corporal.' },
  { icono: '🏭', titulo: '200.000 millones de eritrocitos/día', descripcion: 'Tu médula ósea produce unos 200.000 millones de glóbulos rojos cada día para reemplazar los que mueren.' },
  { icono: '🌍', titulo: '96.000 km de vasos', descripcion: 'Si pusieras todos tus vasos sanguíneos en línea, darían 2,5 vueltas a la Tierra.' },
  { icono: '💀', titulo: 'Hemofilia real', descripcion: 'La hemofilia (falta de factor VIII o IX) afectó a la realeza europea. Se conocía como "la enfermedad de los reyes".' },
  { icono: '🔬', titulo: 'La capa fantasma', descripcion: 'La capa leucoplaquetaria (buffy coat) es <1% del volumen, pero contiene TODOS los leucocitos y plaquetas.' },
  { icono: '⚡', titulo: 'Coagulación en 3-5 minutos', descripcion: 'Desde la lesión hasta el coágulo estable, el proceso completo tarda entre 3 y 5 minutos.' },
  { icono: '🅾️', titulo: 'O- es oro líquido', descripcion: 'Solo el 9% de los españoles son O-. Es el único grupo compatible con TODOS — imprescindible en emergencias.' },
];

// ─────────────────────────────────────────────
// Sección 1: Composición
// ─────────────────────────────────────────────

function SeccionComposicion() {
  const [componenteActivo, setComponenteActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Si centrifugas un tubo de sangre, se separa en <strong>3 capas</strong> por densidad. Haz clic en cada capa para explorarla.</p>
      </div>

      {/* SVG tubo de ensayo centrifugado */}
      <div className={styles.tuboZona}>
        <svg viewBox="0 0 200 340" className={styles.tuboSvg} role="img" aria-label="Tubo de ensayo centrifugado mostrando las 3 capas de la sangre: plasma arriba (amarillo, 55%), capa leucoplaquetaria en medio (blanca, menos del 1%) y glóbulos rojos abajo (rojo, 45%)">
          {/* Tubo - contorno */}
          <rect x="60" y="30" width="80" height="260" rx="6" ry="6" fill="none" stroke="var(--text-muted)" strokeWidth="2" />
          {/* Fondo redondeado del tubo */}
          <ellipse cx="100" cy="286" rx="38" ry="6" fill="none" stroke="var(--text-muted)" strokeWidth="2" />

          {/* Capa 3: Glóbulos rojos (45%) - abajo */}
          <rect
            x="62" y="170" width="76" height="118" rx="0"
            fill="#c0392b" opacity={componenteActivo === 1 ? 0.6 : 0.85}
            className={styles.tuboCapaClick}
            onClick={() => setComponenteActivo(componenteActivo === 1 ? null : 1)}
            role="button"
            tabIndex={0}
            aria-label="Glóbulos rojos: 45% del volumen"
          />
          <text x="100" y="230" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" pointerEvents="none">Glóbulos rojos</text>
          <text x="100" y="248" textAnchor="middle" fill="#fff" fontSize="10" opacity="0.9" pointerEvents="none">45%</text>

          {/* Capa 2: Buffy coat (<1%) - medio */}
          <rect
            x="62" y="164" width="76" height="6"
            fill="#f5f0e1" opacity={componenteActivo === 2 ? 0.6 : 0.95}
            className={styles.tuboCapaClick}
            onClick={() => setComponenteActivo(componenteActivo === 2 ? null : 2)}
            role="button"
            tabIndex={0}
            aria-label="Capa leucoplaquetaria: menos del 1%"
          />

          {/* Capa 1: Plasma (55%) - arriba */}
          <rect
            x="62" y="32" width="76" height="132" rx="4"
            fill="#f0c040" opacity={componenteActivo === 0 ? 0.5 : 0.7}
            className={styles.tuboCapaClick}
            onClick={() => setComponenteActivo(componenteActivo === 0 ? null : 0)}
            role="button"
            tabIndex={0}
            aria-label="Plasma: 55% del volumen"
          />
          <text x="100" y="90" textAnchor="middle" fill="#333" fontSize="11" fontWeight="700" pointerEvents="none">Plasma</text>
          <text x="100" y="108" textAnchor="middle" fill="#333" fontSize="10" opacity="0.8" pointerEvents="none">55%</text>

          {/* Etiquetas laterales */}
          <line x1="142" y1="167" x2="165" y2="167" stroke="var(--text-muted)" strokeWidth="1" />
          <text x="168" y="170" fill="var(--text-secondary)" fontSize="8">Buffy coat &lt;1%</text>

          {/* Tapón del tubo */}
          <rect x="56" y="20" width="88" height="14" rx="4" fill="#e74c3c" opacity="0.9" />
        </svg>

        {/* Hematocrito */}
        <div className={styles.hematocritoBox}>
          <strong>Hematocrito</strong>
          <p>Porcentaje de volumen que ocupan los glóbulos rojos.</p>
          <div className={styles.hematocritoValores}>
            <span>Hombres: ~45%</span>
            <span>Mujeres: ~40%</span>
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
              <span className={styles.componentePct} style={{ color: comp.color }}>{comp.porcentaje}</span>
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
              <span className={styles.barraPct}>{l.porcentaje}%</span>
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

      {/* Compatibilidad visual */}
      <h3 className={styles.subSeccionTitulo}>Compatibilidad donante → receptor</h3>
      <div className={styles.compatGrid}>
        <div className={styles.compatHeader}>
          <div className={styles.compatCorner}>D↓ / R→</div>
          {todosGrupos.map(g => (
            <div key={g} className={styles.compatColHeader}>{g}</div>
          ))}
        </div>
        {GRUPOS.map((donante) => (
          <div key={donante.grupo} className={styles.compatRow}>
            <div className={styles.compatRowHeader}>{donante.grupo}</div>
            {todosGrupos.map(receptor => (
              <div
                key={receptor}
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
            <strong>O- → Donante universal</strong>
            <p>Sin antígenos A, B ni Rh. Compatible con TODOS los grupos.</p>
          </div>
        </div>
        <div className={styles.destacadoCard} style={{ borderLeftColor: '#2E86AB' }}>
          <span aria-hidden="true">🆎</span>
          <div>
            <strong>AB+ → Receptor universal</strong>
            <p>Sin anticuerpos Anti-A ni Anti-B. Puede recibir de TODOS.</p>
          </div>
        </div>
      </div>

      {/* Distribución en España */}
      <h3 className={styles.subSeccionTitulo}>Distribución en España</h3>
      <div className={styles.distribucionBarras}>
        {DISTRIBUCION_ESPANA.map((d, i) => (
          <div key={i} className={styles.distGrupo}>
            <div className={styles.distLabel}>
              <span className={styles.distGrupoNombre}>{d.grupo}</span>
              <span className={styles.distPct}>{d.porcentaje}%</span>
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
        <svg viewBox="0 0 700 80" className={styles.cascadaSvg} role="img" aria-label="Cascada de coagulación en 7 pasos">
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
          <span className={styles.pasoNumero} style={{ background: paso.color }}>Paso {paso.numero}</span>
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

      <div className={styles.warningBox}>
        <strong>Hemofilia</strong>
        <p>Enfermedad genética ligada al cromosoma X. La hemofilia A (falta factor VIII, 80% de casos) y la hemofilia B (falta factor IX) impiden que la cascada de coagulación se complete normalmente.</p>
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
        <p>Un análisis de sangre es la prueba diagnóstica más frecuente. Estos son los <strong>valores normales</strong> de referencia en adultos.</p>
      </div>

      {/* Tabla de valores normales */}
      <div className={styles.tablaValoresWrapper}>
        <table className={styles.tablaValores}>
          <thead>
            <tr>
              <th>Parámetro</th>
              <th>Rango normal</th>
              <th>Qué mide</th>
              <th>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {VALORES_ANALISIS.map((v, i) => (
              <tr key={i}>
                <td><strong>{v.parametro}</strong></td>
                <td className={styles.valorRango}>{v.rango} {v.unidad}</td>
                <td>{v.queMide}</td>
                <td className={styles.valorAlerta}>{v.alerta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <p>Leucocitos por encima de {formatNumber(11000)}. Indica infección activa, inflamación, estrés o, raramente, leucemia.</p>
        </div>
        <div className={styles.condicionCard}>
          <span className={styles.condicionIcono} aria-hidden="true">🟠</span>
          <strong>Trombocitopenia</strong>
          <p>Plaquetas por debajo de {formatNumber(150000)}. Riesgo de sangrado excesivo. Causas: infecciones virales, medicamentos, enfermedades autoinmunes.</p>
        </div>
        <div className={styles.condicionCard}>
          <span className={styles.condicionIcono} aria-hidden="true">📊</span>
          <strong>Hiperglucemia</strong>
          <p>Glucosa en ayunas por encima de 100 mg/dL. Puede indicar prediabetes (100-125) o diabetes (&gt;126 en dos mediciones).</p>
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
        <p>La médula ósea es la fábrica de tu sangre. En un adulto, pesa unos 2,6 kg (más que el hígado) y produce <strong>{formatNumber(200000)} millones</strong> de eritrocitos, <strong>{formatNumber(10000)} millones</strong> de leucocitos y <strong>{formatNumber(400000)} millones</strong> de plaquetas cada día.</p>
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
          <h2 className={styles.seccionTitulo}>{seccionInfo.icono} {seccionInfo.titulo}</h2>
          <p className={styles.seccionSubtitulo}>{seccionInfo.subtitulo}</p>
        </div>

        {/* Contenido de sección */}
        {seccionActiva === 'composicion' && <SeccionComposicion />}
        {seccionActiva === 'grupos' && <SeccionGrupos />}
        {seccionActiva === 'coagulacion' && <SeccionCoagulacion />}
        {seccionActiva === 'datos' && <SeccionDatos />}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 ¿Quieres aprender más sobre la sangre?"
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
            <p>Cada donación (450 mL) puede salvar hasta 3 vidas al separarse en concentrado de hematíes, plasma y plaquetas. Los requisitos básicos son: 18-65 años, más de 50 kg, buena salud general y no haber donado en los últimos 2 meses (hombres) o 3 meses (mujeres). España necesita unas 9.000 donaciones diarias.</p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sangre-componentes')} />
        <ShareCard appName="visualizador-sangre-componentes" />
        <Footer appName="visualizador-sangre-componentes" />
    </div>
  );
}
