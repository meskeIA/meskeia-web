'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorRinonFiltracion.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'anatomia' | 'nefrona' | 'procesos' | 'regulacion';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'anatomia', titulo: 'Anatomía', icono: '🫘', subtitulo: 'Estructura del riñón y la nefrona' },
  { id: 'nefrona', titulo: 'Nefrona', icono: '🔬', subtitulo: 'Recorrido por los segmentos tubulares' },
  { id: 'procesos', titulo: 'Procesos', icono: '⚗️', subtitulo: 'Filtración, reabsorción y secreción' },
  { id: 'regulacion', titulo: 'Regulación', icono: '⚖️', subtitulo: 'SRAA, ADH y equilibrio hídrico' },
];

// ─────────────────────────────────────────────
// Datos: anatomía renal
// ─────────────────────────────────────────────

interface ZonaRenal {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  dato: string;
  color: string;
}

const ZONAS_RENALES: ZonaRenal[] = [
  {
    id: 'corteza',
    nombre: 'Corteza renal',
    icono: '🟤',
    descripcion: 'Capa externa del riñón. Contiene los corpúsculos renales (glomérulos + cápsula de Bowman), los túbulos contorneados proximales y distales. Es donde ocurre la filtración inicial.',
    dato: 'Contiene ~85% de las nefronas (nefronas corticales). Grosor: ~1 cm.',
    color: '#c0392b',
  },
  {
    id: 'medula',
    nombre: 'Médula renal',
    icono: '🟠',
    descripcion: 'Zona interna formada por las pirámides de Malpighi. Contiene las asas de Henle y los túbulos colectores. Crea el gradiente osmótico necesario para concentrar la orina.',
    dato: 'Contiene pirámides de Malpighi (8-18 por riñón). Osmolalidad: hasta 1.200 mOsm/kg.',
    color: '#e67e22',
  },
  {
    id: 'piramides',
    nombre: 'Pirámides de Malpighi',
    icono: '🔺',
    descripcion: 'Estructuras cónicas en la médula. Su base mira a la corteza y su vértice (papila) se proyecta hacia la pelvis renal. Contienen los túbulos colectores convergentes.',
    dato: 'Cada riñón tiene 8-18 pirámides. La orina sale por las papilas hacia los cálices menores.',
    color: '#d35400',
  },
  {
    id: 'pelvis',
    nombre: 'Pelvis renal',
    icono: '🫙',
    descripcion: 'Espacio en forma de embudo en el centro del riñón. Recoge la orina producida por todos los túbulos colectores y la conduce hacia el uréter.',
    dato: 'Capacidad: 7-8 mL. Conecta con el uréter que lleva la orina a la vejiga.',
    color: '#8e44ad',
  },
  {
    id: 'ureter',
    nombre: 'Uréter',
    icono: '🔌',
    descripcion: 'Tubo muscular que conduce la orina desde la pelvis renal hasta la vejiga urinaria. Sus paredes tienen músculo liso que genera ondas peristálticas.',
    dato: 'Longitud: 25-30 cm. Peristaltismo: 1-5 contracciones por minuto.',
    color: '#2E86AB',
  },
  {
    id: 'nefrona-zona',
    nombre: 'Nefrona (unidad funcional)',
    icono: '⚙️',
    descripcion: 'Unidad anatómica y funcional del riñón. Cada nefrona es capaz por sí sola de producir orina. Se compone del corpúsculo renal y el sistema tubular.',
    dato: 'Cada riñón tiene ~1 millón de nefronas → 2 millones en total. Solo necesitamos el 25% para sobrevivir.',
    color: '#48A9A6',
  },
];

// ─────────────────────────────────────────────
// Datos: segmentos de la nefrona
// ─────────────────────────────────────────────

interface SegmentoNefrona {
  id: string;
  nombre: string;
  sigla: string;
  icono: string;
  funcion: string;
  detalle: string;
  porcentaje?: string;
  color: string;
}

const SEGMENTOS_NEFRONA: SegmentoNefrona[] = [
  {
    id: 'glomerulo',
    nombre: 'Corpúsculo renal (glomérulo)',
    sigla: 'Bowman',
    icono: '🫧',
    funcion: 'Filtración de la sangre por presión hidrostática',
    detalle: 'El glomérulo es un ovillo de capilares rodeado por la cápsula de Bowman. La sangre entra por la arteriola aferente y sale por la eferente (más estrecha), creando presión que empuja el líquido al espacio de Bowman. La barrera de filtración tiene 3 capas: endotelio fenestrado + membrana basal + podocitos con diafragmas de hendidura.',
    porcentaje: '180 L/día filtrados',
    color: '#e74c3c',
  },
  {
    id: 'tcp',
    nombre: 'Túbulo Contorneado Proximal',
    sigla: 'TCP',
    icono: '🔄',
    funcion: 'Reabsorción masiva del filtrado (65%)',
    detalle: 'Segmento más activo metabólicamente. Reabsorbe el 65% del Na⁺, Cl⁻, HCO₃⁻, K⁺ filtrado, el 100% de glucosa y aminoácidos (mediante cotransporte con Na⁺), y el 65% del agua (ósmosis). Las células tienen abundantes mitocondrias y borde en cepillo (microvellosidades) que multiplican la superficie de absorción ×20.',
    porcentaje: '65% reabsorbido',
    color: '#e67e22',
  },
  {
    id: 'asa-descendente',
    nombre: 'Asa de Henle descendente',
    sigla: 'Asa ↓',
    icono: '⬇️',
    funcion: 'Permeable al agua, impermeable a solutos',
    detalle: 'El asa desciende hacia la médula, donde la osmolalidad aumenta progresivamente (hasta 1.200 mOsm/kg en la papila). Esta rama es permeable al agua pero impermeable a NaCl. El agua sale por ósmosis, concentrando el líquido tubular a medida que desciende.',
    porcentaje: '~15% agua reabsorbida',
    color: '#f39c12',
  },
  {
    id: 'asa-ascendente',
    nombre: 'Asa de Henle ascendente',
    sigla: 'Asa ↑',
    icono: '⬆️',
    funcion: 'Impermeable al agua, bombea NaCl activamente',
    detalle: 'Rama gruesa ascendente: imperméable al agua pero con cotransportadores NKCC2 que bombean Na⁺/K⁺/2Cl⁻ fuera del túbulo (hacia el intersticio medular). Este mecanismo es clave para crear el gradiente osmótico medular que permite concentrar la orina. El diurético furosemida bloquea este cotransportador.',
    porcentaje: '25% NaCl reabsorbido',
    color: '#27ae60',
  },
  {
    id: 'tcd',
    nombre: 'Túbulo Contorneado Distal',
    sigla: 'TCD',
    icono: '🎚️',
    funcion: 'Regulación fina de Na⁺/K⁺ (aldosterona)',
    detalle: 'Segmento de regulación hormonal. La aldosterona (corteza suprarrenal) estimula la reabsorción de Na⁺ e incrementa la excreción de K⁺ y H⁺. La PTH (paratohormona) estimula la reabsorción de Ca²⁺ aquí. Los diuréticos tiazídicos actúan en el TCD inhibiendo el cotransportador NCC (Na⁺-Cl⁻).',
    porcentaje: 'Regulación de K⁺/Na⁺',
    color: '#2980b9',
  },
  {
    id: 'colector',
    nombre: 'Túbulo Colector',
    sigla: 'TC',
    icono: '💧',
    funcion: 'Regulación del agua final (ADH/vasopresina)',
    detalle: 'Segmento final donde se determina la concentración de la orina. La ADH (hormona antidiurética, vasopresina) actúa aquí insertando acuaporinas-2 en la membrana apical, aumentando la permeabilidad al agua. Sin ADH → orina diluida (diabetes insípida). Con ADH máxima → orina muy concentrada. También regula la excreción final de K⁺ y H⁺.',
    porcentaje: '5-15% agua (variable)',
    color: '#8e44ad',
  },
];

// ─────────────────────────────────────────────
// Datos: 3 procesos de formación de orina
// ─────────────────────────────────────────────

type ProcesoId = 'filtracion' | 'reabsorcion' | 'secrecion';

interface ProcesoOrina {
  id: ProcesoId;
  nombre: string;
  icono: string;
  subtitulo: string;
  descripcion: string;
  mecanismo: string;
  ejemplos: string[];
  dato: string;
  color: string;
}

const PROCESOS_ORINA: ProcesoOrina[] = [
  {
    id: 'filtracion',
    nombre: 'Filtración glomerular',
    icono: '🫧',
    subtitulo: 'Del capilar al espacio de Bowman',
    descripcion: 'Es el primer paso. La sangre bajo presión hidrostática atraviesa la barrera glomerular. El líquido filtrado (ultrafiltrado = plasma sin proteínas ni células) entra en la cápsula de Bowman.',
    mecanismo: 'Presión neta de filtración ≈ 17 mmHg = Presión hidrostática (55) − Presión oncótica (30) − Presión cápsula Bowman (8).',
    ejemplos: ['Agua → sí filtra', 'Iones (Na⁺, K⁺, Cl⁻) → sí filtran', 'Glucosa, aminoácidos → sí filtran', 'Proteínas grandes → NO filtran', 'Células sanguíneas → NO filtran', 'TFG normal: >90 mL/min/1,73 m²'],
    dato: '180 litros filtrados al día. Solo 1-2 L llegan a ser orina final (99% se reabsorbe).',
    color: '#e74c3c',
  },
  {
    id: 'reabsorcion',
    nombre: 'Reabsorción tubular',
    icono: '♻️',
    subtitulo: 'Del túbulo al capilar peritubular',
    descripcion: 'Las células tubulares recuperan del filtrado las sustancias útiles para el organismo y las devuelven a la sangre. Ocurre principalmente en el TCP, asa de Henle, TCD y colector.',
    mecanismo: 'Activa (Na⁺/K⁺ ATPasa en membrana basolateral) y pasiva (gradiente osmótico). El sodio arrastra glucosa, aminoácidos y agua mediante cotransporte.',
    ejemplos: ['Glucosa → 100% reabsorbida (umbral: 180 mg/dL)', 'Aminoácidos → 100% reabsorbidos', 'Na⁺ → 99% reabsorbido', 'HCO₃⁻ → 85-90% reabsorbido', 'Agua → 99% reabsorbida', 'Urea → 50% reabsorbida (residuo)'],
    dato: 'Si la glucemia supera el umbral renal (180 mg/dL), hay glucosuria (glucosa en orina). Signo clásico de diabetes.',
    color: '#27ae60',
  },
  {
    id: 'secrecion',
    nombre: 'Secreción tubular',
    icono: '🚿',
    subtitulo: 'De la sangre al túbulo (eliminación activa)',
    descripcion: 'Las células tubulares transportan activamente sustancias DESDE la sangre (capilar peritubular) HACIA el interior del túbulo. Permite eliminar sustancias que no se filtran bien o llegan en exceso.',
    mecanismo: 'Transporte activo secundario y terciario. Los transportadores OAT y OCT en las células tubulares secretan ácidos y bases orgánicas respectivamente.',
    ejemplos: ['H⁺ → acidificación de la orina', 'K⁺ → eliminación regulada por aldosterona', 'NH₄⁺ → buffer urinario (exceso de ácido)', 'Creatinina → pequeña fracción secretada', 'Penicilina, diuréticos → eliminación rápida', 'Tóxicos, fármacos → aclaramiento activo'],
    dato: 'La creatinina se filtra y secreta mínimamente, por eso es útil para estimar la TFG (tasa de filtración glomerular).',
    color: '#2E86AB',
  },
];

// ─────────────────────────────────────────────
// Datos: regulación hormonal
// ─────────────────────────────────────────────

interface HormonaRegulacion {
  id: string;
  nombre: string;
  sigla: string;
  icono: string;
  origen: string;
  estimulo: string;
  accion: string;
  efecto: string;
  color: string;
}

const HORMONAS_REGULACION: HormonaRegulacion[] = [
  {
    id: 'renina',
    nombre: 'Renina',
    sigla: 'Renina',
    icono: '🔑',
    origen: 'Células yuxtaglomerulares del riñón',
    estimulo: 'Caída de presión arterial, Na⁺ bajo, activación simpática',
    accion: 'Convierte angiotensinógeno → angiotensina I',
    efecto: '↑ PA (vasoconstricción), ↑ reabsorción Na⁺ y agua',
    color: '#c0392b',
  },
  {
    id: 'angiotensina',
    nombre: 'Angiotensina II',
    sigla: 'Ang II',
    icono: '🔗',
    origen: 'Pulmón (ECA convierte Ang I → Ang II)',
    estimulo: 'Producida en cascada SRAA',
    accion: 'Vasoconstricción + estimula aldosterona + estimula ADH + reabsorción directa de Na⁺',
    efecto: '↑ PA, ↑ retención Na⁺/agua, ↓ diuresis',
    color: '#e74c3c',
  },
  {
    id: 'aldosterona',
    nombre: 'Aldosterona',
    sigla: 'Aldost.',
    icono: '🧂',
    origen: 'Corteza suprarrenal (zona glomerulosa)',
    estimulo: 'Angiotensina II, hiperpotasemia (K⁺ elevado)',
    accion: 'Induce síntesis de canales ENaC (Na⁺) y bomba Na⁺/K⁺ ATPasa en TCD y TC',
    efecto: '↑ reabsorción Na⁺, ↑ excreción K⁺ y H⁺, retención de agua',
    color: '#e67e22',
  },
  {
    id: 'adh',
    nombre: 'ADH / Vasopresina',
    sigla: 'ADH',
    icono: '💧',
    origen: 'Hipotálamo (liberada por neurohipófisis)',
    estimulo: 'Hiperosmolalidad plasmática, hipovolemia, angiotensina II',
    accion: 'Inserta acuaporinas-2 en el túbulo colector → ↑ permeabilidad al agua',
    efecto: '↑ reabsorción de agua → orina concentrada, ↓ diuresis',
    color: '#2980b9',
  },
  {
    id: 'pna',
    nombre: 'Péptido Natriurético Auricular',
    sigla: 'PNA',
    icono: '❤️',
    origen: 'Aurículas cardíacas (distensión por sobrecarga de volumen)',
    estimulo: 'Expansión del volumen extracelular, ↑ presión auricular',
    accion: 'Inhibe renina y aldosterona, dilata arteriola aferente, ↑ TFG',
    efecto: '↑ excreción Na⁺ y agua (natriuresis/diuresis) → ↓ PA',
    color: '#27ae60',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorRinonFiltracion() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('anatomia');
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string | null>(null);
  const [segmentoSeleccionado, setSegmentoSeleccionado] = useState<string | null>(null);
  const [procesoActivo, setProcesoActivo] = useState<ProcesoId>('filtracion');
  const [hormonaSeleccionada, setHormonaSeleccionada] = useState<string | null>(null);

  const zonaActual = ZONAS_RENALES.find(z => z.id === zonaSeleccionada) ?? null;
  const segmentoActual = SEGMENTOS_NEFRONA.find(s => s.id === segmentoSeleccionado) ?? null;
  const procesoActual = PROCESOS_ORINA.find(p => p.id === procesoActivo)!;
  const hormonaActual = HORMONAS_REGULACION.find(h => h.id === hormonaSeleccionada) ?? null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🫘 Visualizador del Riñón y Filtración</h1>
        <p className={styles.subtitle}>La nefrona y la formación de orina: filtración glomerular, reabsorción y secreción</p>
      </header>

      <LegalNotice />

      {/* Navegación principal */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES.map(sec => (
          <button
            key={sec.id}
            className={`${styles.navBtn} ${seccionActiva === sec.id ? styles.navActivo : ''}`}
            onClick={() => setSeccionActiva(sec.id)}
            aria-pressed={seccionActiva === sec.id}
          >
            <span className={styles.navIcono} aria-hidden="true">{sec.icono}</span>
            <span className={styles.navTexto}>{sec.titulo}</span>
          </button>
        ))}
      </nav>

      {/* ── Sección Anatomía ── */}
      {seccionActiva === 'anatomia' && (
        <section className={styles.seccionContent}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Anatomía del riñón</h2>
            <p className={styles.seccionSubtitulo}>Selecciona una zona para explorarla en detalle</p>
          </div>

          {/* Diagrama SVG simplificado del riñón */}
          <div className={styles.svgZona}>
            <svg viewBox="0 0 420 320" className={styles.rinonSvg} role="img" aria-label="Diagrama del riñón">
              {/* Silueta exterior del riñón */}
              <ellipse cx="210" cy="160" rx="130" ry="150" fill="#fce4d6" stroke="#c0392b" strokeWidth="2" />
              {/* Muesca medial (hilio) */}
              <path d="M 85 145 Q 70 160 85 175" fill="#fce4d6" stroke="#c0392b" strokeWidth="2" />
              {/* Corteza */}
              <ellipse cx="210" cy="160" rx="115" ry="135" fill="#f5b7b1" stroke="#e74c3c" strokeWidth="1.5" opacity="0.6" />
              {/* Médula / pirámides */}
              <ellipse cx="210" cy="160" rx="80" ry="100" fill="#f0a500" stroke="#e67e22" strokeWidth="1" opacity="0.5" />
              {/* Pelvis renal */}
              <ellipse cx="185" cy="160" rx="38" ry="55" fill="#d7bde2" stroke="#8e44ad" strokeWidth="1.5" />
              {/* Uréter */}
              <path d="M 155 205 Q 140 240 145 280" stroke="#2E86AB" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Pirámides indicativas */}
              <polygon points="210,100 190,135 230,135" fill="#e67e22" opacity="0.6" />
              <polygon points="250,115 230,148 270,148" fill="#e67e22" opacity="0.5" />
              <polygon points="270,155 250,185 290,185" fill="#e67e22" opacity="0.5" />
              <polygon points="250,195 230,225 270,225" fill="#e67e22" opacity="0.5" />
              {/* Etiquetas */}
              <text x="310" y="85" fontSize="11" fill="#c0392b" fontWeight="600">Corteza</text>
              <line x1="300" y1="88" x2="270" y2="108" stroke="#c0392b" strokeWidth="1" strokeDasharray="3,2" />
              <text x="315" y="145" fontSize="11" fill="#d35400" fontWeight="600">Médula</text>
              <line x1="313" y1="148" x2="283" y2="155" stroke="#d35400" strokeWidth="1" strokeDasharray="3,2" />
              <text x="315" y="185" fontSize="11" fill="#8e44ad" fontWeight="600">Pelvis</text>
              <line x1="313" y1="188" x2="222" y2="175" stroke="#8e44ad" strokeWidth="1" strokeDasharray="3,2" />
              <text x="50" y="290" fontSize="11" fill="#2E86AB" fontWeight="600">Uréter</text>
              <line x1="78" y1="285" x2="146" y2="270" stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" />
            </svg>
            <p className={styles.svgHint} aria-hidden="true">Selecciona una zona en la lista de abajo</p>
          </div>

          {/* Grid de zonas clickeables */}
          <div className={styles.zonasGrid}>
            {ZONAS_RENALES.map(zona => (
              <button
                key={zona.id}
                className={`${styles.zonaCard} ${zonaSeleccionada === zona.id ? styles.zonaCardActiva : ''}`}
                style={{ borderLeftColor: zona.color }}
                onClick={() => setZonaSeleccionada(zonaSeleccionada === zona.id ? null : zona.id)}
                aria-pressed={zonaSeleccionada === zona.id}
              >
                <span className={styles.zonaIcono} aria-hidden="true">{zona.icono}</span>
                <span className={styles.zonaNombre}>{zona.nombre}</span>
              </button>
            ))}
          </div>

          {/* Detalle zona seleccionada */}
          {zonaActual && (
            <div className={styles.detalleCard} style={{ borderLeftColor: zonaActual.color }} role="region" aria-live="polite">
              <div className={styles.detalleHeader}>
                <span aria-hidden="true">{zonaActual.icono}</span>
                <h3 className={styles.detalleTitulo}>{zonaActual.nombre}</h3>
              </div>
              <p className={styles.detalleDesc}>{zonaActual.descripcion}</p>
              <p className={styles.detalleDato}>💡 {zonaActual.dato}</p>
            </div>
          )}

          <div className={styles.warningBox}>
            <strong>Dato clave:</strong> Los 2 riñones representan solo el 0,5% de la masa corporal pero reciben el <strong>25% del gasto cardíaco</strong> (~1.700 litros de sangre filtrada al día). Solo necesitamos un 25% de la función renal para sobrevivir.
          </div>
        </section>
      )}

      {/* ── Sección Nefrona ── */}
      {seccionActiva === 'nefrona' && (
        <section className={styles.seccionContent}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Recorrido por la nefrona</h2>
            <p className={styles.seccionSubtitulo}>Selecciona cada segmento para ver su función</p>
          </div>

          <div className={styles.contexto}>
            La nefrona es la <strong>unidad funcional del riñón</strong>. Cada riñón tiene ~1 millón de nefronas. El líquido filtrado (180 L/día) recorre estos 6 segmentos hasta convertirse en orina (1-2 L/día).
          </div>

          {/* Lista de segmentos */}
          <div className={styles.segmentosLista}>
            {SEGMENTOS_NEFRONA.map((seg, idx) => (
              <button
                key={seg.id}
                className={`${styles.segmentoBtn} ${segmentoSeleccionado === seg.id ? styles.segmentoBtnActivo : ''}`}
                style={{ borderLeftColor: seg.color }}
                onClick={() => setSegmentoSeleccionado(segmentoSeleccionado === seg.id ? null : seg.id)}
                aria-pressed={segmentoSeleccionado === seg.id}
              >
                <div className={styles.segmentoBtnHeader}>
                  <span className={styles.segmentoNum} style={{ background: seg.color }}>
                    {idx + 1}
                  </span>
                  <span aria-hidden="true" className={styles.segmentoIcono}>{seg.icono}</span>
                  <div className={styles.segmentoTextos}>
                    <span className={styles.segmentoNombre}>{seg.nombre}</span>
                    <span className={styles.segmentoFuncion}>{seg.funcion}</span>
                  </div>
                  {seg.porcentaje && (
                    <span className={styles.segmentoBadge} style={{ background: seg.color }}>
                      {seg.porcentaje}
                    </span>
                  )}
                  <span className={styles.segmentoChevron} aria-hidden="true">
                    {segmentoSeleccionado === seg.id ? '▲' : '▼'}
                  </span>
                </div>

                {segmentoSeleccionado === seg.id && (
                  <div className={styles.segmentoDetalle}>
                    <p>{seg.detalle}</p>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className={styles.warningBox}>
            <strong>Flujo de orina:</strong> Corpúsculo renal → TCP → Asa de Henle → TCD → Túbulo Colector → Cáliz menor → Pelvis renal → Uréter → Vejiga
          </div>
        </section>
      )}

      {/* ── Sección Procesos ── */}
      {seccionActiva === 'procesos' && (
        <section className={styles.seccionContent}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Los 3 procesos de formación de orina</h2>
            <p className={styles.seccionSubtitulo}>Selecciona un proceso para explorar sus detalles</p>
          </div>

          {/* Selector de proceso */}
          <div className={styles.procesosNav}>
            {PROCESOS_ORINA.map(proc => (
              <button
                key={proc.id}
                className={`${styles.procesoNavBtn} ${procesoActivo === proc.id ? styles.procesoNavActivo : ''}`}
                style={procesoActivo === proc.id ? { borderColor: proc.color, background: proc.color } : { borderColor: proc.color }}
                onClick={() => setProcesoActivo(proc.id)}
                aria-pressed={procesoActivo === proc.id}
              >
                <span aria-hidden="true">{proc.icono}</span>
                <span>{proc.nombre}</span>
              </button>
            ))}
          </div>

          {/* Detalle del proceso activo */}
          <div className={styles.procesoDetalle} style={{ borderTopColor: procesoActual.color }}>
            <h3 className={styles.procesoTitulo}>
              <span aria-hidden="true">{procesoActual.icono}</span> {procesoActual.nombre}
            </h3>
            <p className={styles.procesoSubtitulo}>{procesoActual.subtitulo}</p>
            <p className={styles.procesoDesc}>{procesoActual.descripcion}</p>

            <div className={styles.procesoMecanismo}>
              <strong>Mecanismo:</strong> {procesoActual.mecanismo}
            </div>

            <h4 className={styles.procesoEjemplosTitle}>Ejemplos de sustancias:</h4>
            <ul className={styles.procesoEjemplos}>
              {procesoActual.ejemplos.map((ej, i) => (
                <li key={i}>{ej}</li>
              ))}
            </ul>

            <div className={styles.procesoDato}>
              💡 {procesoActual.dato}
            </div>
          </div>

          {/* Tabla resumen 3 procesos */}
          <div className={styles.tablaResumen}>
            <h3 className={styles.tablaResumenTitulo}>Resumen comparativo</h3>
            <div className={styles.tablaContainer}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Proceso</th>
                    <th>Dirección</th>
                    <th>Dónde ocurre</th>
                    <th>Energía</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🫧 Filtración</td>
                    <td>Capilar → Bowman</td>
                    <td>Glomérulo</td>
                    <td>Pasiva (presión)</td>
                  </tr>
                  <tr>
                    <td>♻️ Reabsorción</td>
                    <td>Túbulo → Capilar</td>
                    <td>TCP, Asa, TCD, TC</td>
                    <td>Activa + pasiva</td>
                  </tr>
                  <tr>
                    <td>🚿 Secreción</td>
                    <td>Capilar → Túbulo</td>
                    <td>TCP, TCD, TC</td>
                    <td>Activa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Sección Regulación ── */}
      {seccionActiva === 'regulacion' && (
        <section className={styles.seccionContent}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Regulación hormonal renal</h2>
            <p className={styles.seccionSubtitulo}>SRAA, ADH y equilibrio hídrico-electrolítico</p>
          </div>

          <div className={styles.contexto}>
            El riñón no actúa solo. Un sistema de señales hormonales ajusta constantemente la cantidad de agua y sodio que se retiene o elimina para mantener la <strong>presión arterial</strong> y la <strong>osmolalidad plasmática</strong> estables.
          </div>

          {/* Flujo SRAA */}
          <div className={styles.sraaCadena}>
            <h3 className={styles.sraaTitulo}>Eje SRAA (Sistema Renina-Angiotensina-Aldosterona)</h3>
            <div className={styles.sraaFlujo}>
              <div className={styles.sraaEslabon}>
                <span aria-hidden="true">📉</span>
                <strong>Caída PA / Na⁺ bajo</strong>
              </div>
              <span className={styles.sraaFlecha} aria-hidden="true">→</span>
              <div className={styles.sraaEslabon}>
                <span aria-hidden="true">🔑</span>
                <strong>Renina</strong>
                <small>Células yuxtaglomerulares</small>
              </div>
              <span className={styles.sraaFlecha} aria-hidden="true">→</span>
              <div className={styles.sraaEslabon}>
                <span aria-hidden="true">🔗</span>
                <strong>Angiotensina II</strong>
                <small>Pulmón (ECA)</small>
              </div>
              <span className={styles.sraaFlecha} aria-hidden="true">→</span>
              <div className={styles.sraaEslabon}>
                <span aria-hidden="true">🧂</span>
                <strong>Aldosterona</strong>
                <small>Suprarrenal</small>
              </div>
              <span className={styles.sraaFlecha} aria-hidden="true">→</span>
              <div className={styles.sraaEslabon}>
                <span aria-hidden="true">📈</span>
                <strong>↑ PA restaurada</strong>
              </div>
            </div>
          </div>

          {/* Tarjetas de hormonas */}
          <div className={styles.hormonasGrid}>
            {HORMONAS_REGULACION.map(hor => (
              <button
                key={hor.id}
                className={`${styles.hormonaCard} ${hormonaSeleccionada === hor.id ? styles.hormonaCardActiva : ''}`}
                style={{ borderTopColor: hor.color }}
                onClick={() => setHormonaSeleccionada(hormonaSeleccionada === hor.id ? null : hor.id)}
                aria-pressed={hormonaSeleccionada === hor.id}
              >
                <div className={styles.hormonaHeader}>
                  <span className={styles.hormonaIcono} aria-hidden="true">{hor.icono}</span>
                  <div>
                    <p className={styles.hormonaNombre}>{hor.nombre}</p>
                    <p className={styles.hormonaSigla}>{hor.sigla}</p>
                  </div>
                  <span className={styles.hormonaChevron} aria-hidden="true">
                    {hormonaSeleccionada === hor.id ? '▲' : '▼'}
                  </span>
                </div>

                {hormonaSeleccionada === hor.id && (
                  <div className={styles.hormonaDetalle} role="region" aria-live="polite">
                    <dl className={styles.hormonaDl}>
                      <dt>Origen:</dt><dd>{hor.origen}</dd>
                      <dt>Estímulo:</dt><dd>{hor.estimulo}</dd>
                      <dt>Acción:</dt><dd>{hor.accion}</dd>
                      <dt>Efecto neto:</dt><dd>{hor.efecto}</dd>
                    </dl>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className={styles.warningBox}>
            <strong>TFG (Tasa de Filtración Glomerular):</strong> El indicador clave de función renal. Normal: &gt;90 mL/min/1,73 m². Estadios de ERC (Enfermedad Renal Crónica) si &lt;60 durante &gt;3 meses. Se estima con la fórmula CKD-EPI usando creatinina sérica, edad y sexo.
          </div>
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection title="¿Cómo filtran los riñones la sangre?" subtitle="La nefrona: filtración, reabsorción y secreción explicadas">

        {/* 1. Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Proceso</th>
                <th>Localización</th>
                <th>Volumen</th>
                <th>Mecanismo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🫧 Filtración glomerular</td>
                <td>Glomérulo (Bowman)</td>
                <td>180 L/día</td>
                <td>Presión hidrostática neta ~17 mmHg</td>
              </tr>
              <tr>
                <td>♻️ Reabsorción tubular</td>
                <td>TCP, Asa Henle, TCD</td>
                <td>~178 L/día recuperados</td>
                <td>Activa (Na/K-ATPasa) y pasiva (ósmosis)</td>
              </tr>
              <tr>
                <td>🚿 Secreción tubular</td>
                <td>TCD y colector</td>
                <td>Pequeñas cantidades</td>
                <td>Activa: H⁺, K⁺, fármacos, tóxicos</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Casos de uso / perfiles */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">🎓</span>
            <div>
              <strong>Estudiante de biología/medicina</strong>
              <p>Aprende la TFG y los segmentos tubulares para el examen: cada segmento tiene un mecanismo y una función concreta que dominar.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">💊</span>
            <div>
              <strong>Paciente con medicación</strong>
              <p>Comprende por qué el riñón elimina fármacos y por qué se ajustan las dosis en insuficiencia renal: la TFG reducida acumula el medicamento.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">🩺</span>
            <div>
              <strong>Persona con diabetes</strong>
              <p>Entiende por qué aparece glucosuria cuando la glucemia supera los 180 mg/dL: el umbral renal se satura y la glucosa no puede ser reabsorbida.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">🧂</span>
            <div>
              <strong>Atleta de resistencia</strong>
              <p>Comprende la regulación de sodio y agua (ADH y aldosterona) durante el ejercicio prolongado para evitar la hiponatremia por sobrehidratación.</p>
            </div>
          </div>
        </div>

        {/* 3. FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Por qué los riñones filtran 180 L pero producen solo 1-2 L de orina?</strong>
            <p>El 99% del ultrafiltrado se reabsorbe a lo largo del sistema tubular. El TCP recupera el 65%, el asa de Henle un 15-25% y el TCD y el túbulo colector ajustan la concentración final bajo control hormonal.</p>
            <span className={styles.faqTip}>Clave: reabsorción del 99% del filtrado</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es la TFG y por qué es importante?</strong>
            <p>La Tasa de Filtración Glomerular indica cuánta sangre filtran los riñones por minuto (normal: &gt;90 mL/min/1,73 m²). Si cae por debajo de 60 durante más de 3 meses, se diagnostica Enfermedad Renal Crónica (ERC).</p>
            <span className={styles.faqTip}>Normal: &gt;90 mL/min — ERC si &lt;60 mL/min más de 3 meses</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué la orina es amarilla?</strong>
            <p>El color proviene de la urobilina, un pigmento resultado del metabolismo de la bilirrubina (de la degradación de hemoglobina). Cuanto más concentrada está la orina, más intensa es la coloración.</p>
            <span className={styles.faqTip}>Orina clara = hidratación adecuada; orina oscura = deshidratación</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué significa tener glucosa en orina (glucosuria)?</strong>
            <p>Significa que la concentración de glucosa en sangre ha superado el umbral renal (~180 mg/dL). El cotransporte Na⁺-glucosa del TCP se satura y no puede reabsorber toda la glucosa filtrada. Es un signo clásico de diabetes mellitus no controlada.</p>
            <span className={styles.faqTip}>Umbral renal de glucosa: ~180 mg/dL</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué los riñones regulan la tensión arterial?</strong>
            <p>A través del eje SRAA: cuando cae la presión, las células yuxtaglomerulares secretan renina, que activa la angiotensina II (vasoconstricción) y la aldosterona (retención de Na⁺ y agua), restaurando el volumen sanguíneo y la presión.</p>
            <span className={styles.faqTip}>SRAA: Renina → Angiotensina I → Angiotensina II → Aldosterona</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es la creatinina y por qué se analiza?</strong>
            <p>La creatinina es un producto del metabolismo muscular que se filtra constantemente en el glomérulo con mínima secreción tubular. Al ser un marcador estable, su concentración en sangre refleja directamente la TFG: a más creatinina, peor función renal.</p>
            <span className={styles.faqTip}>Valores normales: hombres 0,7-1,2 mg/dL; mujeres 0,5-1,0 mg/dL</span>
          </div>
        </div>

        {/* 4. Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Llegada de la sangre</strong>
              <p>El corazón bombea sangre a la arteria renal: 1,2 L/min llegan a los dos riñones, representando el 20-25% del gasto cardíaco total.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Filtración glomerular</strong>
              <p>La presión hidrostática en el glomérulo (~55 mmHg) empuja el plasma a la cápsula de Bowman. La presión neta de filtración es ~17 mmHg. El resultado: 125 mL/min de ultrafiltrado (180 L/día).</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Reabsorción en el TCP</strong>
              <p>El túbulo contorneado proximal reabsorbe activamente el 100% de glucosa y aminoácidos, el 65% del Na⁺ filtrado y el 65% del agua (ósmosis). Las mitocondrias abundantes sustentan esta actividad metabólica intensa.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Gradiente osmótico en el asa de Henle</strong>
              <p>La rama descendente pierde agua por ósmosis hacia la médula hiperosmótica. La rama ascendente gruesa bombea NaCl activamente (NKCC2) sin perder agua, creando el gradiente medular (hasta 1.200 mOsm/kg en la papila).</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Regulación en el TCD</strong>
              <p>El túbulo contorneado distal regula Na⁺/K⁺ bajo control de la aldosterona. La PTH estimula la reabsorción de Ca²⁺. Los diuréticos tiazídicos actúan aquí bloqueando el cotransportador NCC.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>6</span>
            <div className={styles.stepContent}>
              <strong>Concentración final en el túbulo colector</strong>
              <p>La ADH (vasopresina) inserta acuaporinas-2 en la membrana apical aumentando la permeabilidad al agua. Sin ADH → orina diluida (50-100 mOsm/kg). Con ADH máxima → orina muy concentrada (hasta 1.200 mOsm/kg). El resultado: 1-2 L de orina al día.</p>
            </div>
          </div>
        </div>

        {/* 5. Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💧</span>
            <div>
              <strong>Hidratación adecuada</strong>
              <p>2 L de agua al día (más en calor o ejercicio intenso) mantienen una diuresis eficiente y reducen el riesgo de litiasis renal.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧂</span>
            <div>
              <strong>Control del sodio</strong>
              <p>Limitar la sal a &lt;5 g/día reduce la carga del SRAA y la presión arterial, protegiendo a largo plazo la función glomerular.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💊</span>
            <div>
              <strong>AINE con precaución</strong>
              <p>Ibuprofeno y diclofenaco reducen la TFG al inhibir las prostaglandinas vasodilatadoras. Evitar en deshidratación, insuficiencia renal o combinados con diuréticos.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🩺</span>
            <div>
              <strong>Analítica preventiva</strong>
              <p>Creatinina + TFG estimada cada 2 años en adultos mayores de 40 años o con factores de riesgo (diabetes, hipertensión, antecedentes familiares).</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🍎</span>
            <div>
              <strong>Potasio con moderación en ERC</strong>
              <p>El riñón dañado no elimina bien el K⁺ (hipercalemia). En ERC avanzada, limitar alimentos muy ricos en potasio (plátanos, patatas, legumbres) según indicación médica.</p>
            </div>
          </div>
        </div>

        {/* 6. Warning box — errores comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Mitos y errores frecuentes sobre el riñón</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ &quot;Beber mucha agua limpia los riñones&quot;</strong> — el exceso de agua sobrecarga innecesariamente la filtración; 2 L/día es suficiente en condiciones normales.</li>
            <li><strong>❌ &quot;El análisis de orina solo detecta infecciones&quot;</strong> — también revela diabetes, problemas renales, deshidratación y enfermedades sistémicas.</li>
            <li><strong>❌ &quot;Si no duele, el riñón está bien&quot;</strong> — la insuficiencia renal crónica es asintomática hasta estadios avanzados (ERC grados 1-3).</li>
            <li><strong>❌ &quot;Los suplementos de proteínas no afectan al riñón&quot;</strong> — en dosis muy elevadas aumentan la carga de nitrógeno; evitar en ERC sin supervisión médica.</li>
            <li><strong>❌ &quot;El contraste radiológico es inofensivo&quot;</strong> — en pacientes con ERC puede precipitar nefropatía por contraste; comunicar siempre al médico la función renal previa.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-rinon-filtracion')} />
      <ShareCard appName="visualizador-rinon-filtracion" />
      <Footer appName="visualizador-rinon-filtracion" />
    </div>
  );
}
