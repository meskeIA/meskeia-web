'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorHigado.module.css';
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

type Seccion = 'anatomia' | 'funciones' | 'detox' | 'metabolismo';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'anatomia', titulo: 'Anatomía', icono: '🫁', subtitulo: 'Estructura y vascularización' },
  { id: 'funciones', titulo: 'Funciones', icono: '⚗️', subtitulo: '5 grupos de funciones vitales' },
  { id: 'detox', titulo: 'Detoxificación', icono: '🧪', subtitulo: 'Fases 1 y 2 de eliminación' },
  { id: 'metabolismo', titulo: 'Metabolismo', icono: '🔄', subtitulo: 'Glucosa, lípidos y proteínas' },
];

// ─────────────────────────────────────────────
// Sección 1: Anatomía
// ─────────────────────────────────────────────

interface ZonaInfo {
  id: string;
  nombre: string;
  color: string;
  descripcion: string;
  dato: string;
}

const ZONAS_HIGADO: ZonaInfo[] = [
  {
    id: 'lobulo-derecho',
    nombre: 'Lóbulo derecho',
    color: '#C0392B',
    descripcion: 'El más grande, representa el 60-70% de la masa hepática. Aloja la mayor parte de los hepatocitos y contiene los segmentos V, VI, VII y VIII de Couinaud.',
    dato: 'Puede regenerarse incluso tras una resección del 70% de su masa.',
  },
  {
    id: 'lobulo-izquierdo',
    nombre: 'Lóbulo izquierdo',
    color: '#E74C3C',
    descripcion: 'Más pequeño que el derecho, comprende los segmentos II, III y IV. Está separado del lóbulo derecho por el ligamento falciforme.',
    dato: 'Es el lóbulo que se desarrolla primero en el feto.',
  },
  {
    id: 'lobulo-caudado',
    nombre: 'Lóbulo caudado',
    color: '#8E44AD',
    descripcion: 'Pequeño lóbulo posterior entre la vena cava inferior y el hilio hepático. Recibe sangre de ambos sistemas portales y drena directamente a la vena cava.',
    dato: 'Tiene una circulación independiente, lo que lo protege en la hipertensión portal.',
  },
  {
    id: 'vesicula',
    nombre: 'Vesícula biliar',
    color: '#27AE60',
    descripcion: 'Saco muscular de 7-10 cm que almacena y concentra la bilis producida por el hígado. Puede concentrar la bilis hasta 10 veces.',
    dato: 'Almacena entre 30 y 60 ml de bilis, que libera al duodeno cuando detecta grasa.',
  },
  {
    id: 'vena-porta',
    nombre: 'Vena porta',
    color: '#2980B9',
    descripcion: 'Aporta el 75% del flujo sanguíneo hepático, rico en nutrientes absorbidos del intestino. Transporta glucosa, aminoácidos, vitaminas y toxinas desde el tracto digestivo.',
    dato: 'Flujo de ~1.100 ml/minuto. La hipertensión portal causa varices esofágicas.',
  },
  {
    id: 'arteria-hepatica',
    nombre: 'Arteria hepática',
    color: '#E67E22',
    descripcion: 'Aporta el 25% restante del flujo, pero suministra el 50% del oxígeno. Se origina en el tronco celíaco y lleva sangre oxigenada desde la aorta.',
    dato: 'Esencial para la función secretora. Su oclusión puede causar necrosis hepática aguda.',
  },
];

// ─────────────────────────────────────────────
// Sección 2: Funciones
// ─────────────────────────────────────────────

interface FuncionGrupo {
  id: string;
  titulo: string;
  icono: string;
  color: string;
  resumen: string;
  procesos: string[];
  curiosidad: string;
}

const FUNCIONES_GRUPOS: FuncionGrupo[] = [
  {
    id: 'detox',
    titulo: 'Detoxificación',
    icono: '🧪',
    color: '#8E44AD',
    resumen: 'Filtra y elimina toxinas, fármacos y metabolitos del torrente sanguíneo',
    procesos: [
      'Fase 1: Oxidación vía enzimas CYP450 (citocromo P450)',
      'Fase 2: Conjugación con glutatión, ácido glucurónico o sulfato',
      'Metabolismo del alcohol: 0,1 g/kg/h mediante alcohol deshidrogenasa (ADH)',
      'Eliminación de amoniaco → síntesis de urea (ciclo de la urea)',
      'Degradación de bilirrubina indirecta a bilirrubina directa',
    ],
    curiosidad: 'El hígado puede metabolizar un "chupito" de alcohol cada hora aproximadamente.',
  },
  {
    id: 'carbohidratos',
    titulo: 'Metabolismo de carbohidratos',
    icono: '🍬',
    color: '#F39C12',
    resumen: 'Regula la glucemia almacenando y liberando glucosa según las necesidades del organismo',
    procesos: [
      'Glucogenogénesis: convierte glucosa → glucógeno (almacenamiento)',
      'Glucogenólisis: rompe glucógeno → glucosa en ayuno',
      'Gluconeogénesis: fabrica glucosa desde lactato, aminoácidos y glicerol',
      'Almacena hasta 100 g de glucógeno hepático',
      'El músculo almacena 300-400 g adicionales pero no puede exportar glucosa',
    ],
    curiosidad: 'El hígado actúa como el "banco de glucosa" del cuerpo: deposita y retira según el nivel de insulina/glucagón.',
  },
  {
    id: 'lipidos',
    titulo: 'Metabolismo de lípidos',
    icono: '🧈',
    color: '#E74C3C',
    resumen: 'Sintetiza y distribuye colesterol, lipoproteínas y ácidos grasos a todos los tejidos',
    procesos: [
      'Síntesis de colesterol (vía HMG-CoA reductasa)',
      'Producción de lipoproteínas: VLDL, LDL, HDL',
      'Beta-oxidación: descompone ácidos grasos para obtener energía',
      'Síntesis de cuerpos cetónicos en ayuno prolongado',
      'Almacenamiento de vitaminas liposolubles A, D, E, K y B12',
    ],
    curiosidad: 'El hígado produce el 80% del colesterol del cuerpo. Las estatinas actúan bloqueando la HMG-CoA reductasa hepática.',
  },
  {
    id: 'proteinas',
    titulo: 'Síntesis de proteínas',
    icono: '🧬',
    color: '#27AE60',
    resumen: 'Fabrica proteínas plasmáticas esenciales para la coagulación, inmunidad y presión oncótica',
    procesos: [
      'Albúmina: 10-15 g/día → mantiene presión oncótica plasmática',
      'Factores de coagulación II (protrombina), VII, IX, X (vitamina K-dependientes)',
      'Proteína C reactiva (PCR): marcador de inflamación sistémica',
      'Fibrinógeno, protrombina y antitrombina III',
      'Síntesis de globulinas de transporte (transferrina, ceruloplasmina)',
    ],
    curiosidad: 'En hepatitis grave o cirrosis, la caída de albúmina causa ascitis: líquido acumulado en el abdomen por baja presión oncótica.',
  },
  {
    id: 'bilis',
    titulo: 'Producción de bilis',
    icono: '💛',
    color: '#F1C40F',
    resumen: 'Produce 600-1.200 ml de bilis al día para emulsionar y absorber las grasas de la dieta',
    procesos: [
      'Síntesis de sales biliares primarias desde colesterol',
      'Excreción de bilirrubina (producto de degradación del hemo)',
      'Emulsificación de lípidos en el duodeno',
      'Circulación enterohepática: el 95% de las sales biliares se reutilizan',
      'Eliminación de colesterol excedente y metabolitos de fármacos',
    ],
    curiosidad: 'La ictericia (piel amarilla) ocurre cuando la bilirrubina supera ~2 mg/dL en sangre, señal de sobrecarga hepática.',
  },
];

// ─────────────────────────────────────────────
// Sección 3: Detoxificación
// ─────────────────────────────────────────────

interface SustanciaDetox {
  nombre: string;
  tipo: string;
  fase1: string;
  fase2: string;
  resultado: string;
}

const SUSTANCIAS_DETOX: SustanciaDetox[] = [
  {
    nombre: 'Alcohol etílico',
    tipo: 'Tóxico exógeno',
    fase1: 'ADH oxida etanol → acetaldehído (tóxico)',
    fase2: 'ALDH2 convierte acetaldehído → acetato (no tóxico)',
    resultado: 'Acetato → ciclo de Krebs o síntesis de ácidos grasos',
  },
  {
    nombre: 'Paracetamol',
    tipo: 'Fármaco',
    fase1: 'CYP2E1 genera NAPQI (tóxico en dosis altas)',
    fase2: 'Conjugación con glutatión → mercaptúrico (eliminable)',
    resultado: 'Sobredosis agota glutatión → necrosis hepática',
  },
  {
    nombre: 'Amoniaco (NH₃)',
    tipo: 'Metabolito endógeno',
    fase1: 'Producido por bacterias intestinales y catabolismo proteico',
    fase2: 'Ciclo de la urea: NH₃ + CO₂ → urea',
    resultado: 'Urea eliminada por riñones. En cirrosis → encefalopatía',
  },
  {
    nombre: 'Bilirrubina indirecta',
    tipo: 'Metabolito del hemo',
    fase1: 'Bilirrubina libre (liposoluble, tóxica para el cerebro)',
    fase2: 'Conjugación con ácido glucurónico (UDP-glucuronosiltransferasa)',
    resultado: 'Bilirrubina directa → excretada por bilis',
  },
];

// ─────────────────────────────────────────────
// Sección 4: Metabolismo
// ─────────────────────────────────────────────

type MetaSelector = 'glucosa' | 'lipidos' | 'proteinas';

interface MetaCiclo {
  id: MetaSelector;
  titulo: string;
  icono: string;
  color: string;
  estadoAyuno: { titulo: string; pasos: string[] };
  estadoPostprandial: { titulo: string; pasos: string[] };
  hormona: string;
  organos: string;
}

const META_CICLOS: MetaCiclo[] = [
  {
    id: 'glucosa',
    titulo: 'Glucosa',
    icono: '🍬',
    color: '#F39C12',
    estadoPostprandial: {
      titulo: 'Tras la comida (insulina alta)',
      pasos: [
        'La glucosa portal llega al hígado vía vena porta',
        'La insulina activa glucocinasa → captura glucosa',
        'Glucogenogénesis: glucosa → glucógeno (almacenamiento)',
        'Exceso → glucólisis → acetil-CoA → síntesis de ácidos grasos',
        'Glucemia plasmática: 80-120 mg/dL',
      ],
    },
    estadoAyuno: {
      titulo: 'En ayuno (glucagón alto)',
      pasos: [
        'El glucagón activa la glucógeno fosforilasa',
        'Glucogenólisis: glucógeno → glucosa-1-fosfato → glucosa',
        'Gluconeogénesis: lactato + aminoácidos + glicerol → glucosa',
        'El hígado exporta glucosa al torrente sanguíneo',
        'Mantiene glucemia > 60 mg/dL para el cerebro',
      ],
    },
    hormona: 'Insulina / Glucagón',
    organos: 'Hígado → Músculo, cerebro, eritrocitos',
  },
  {
    id: 'lipidos',
    titulo: 'Lípidos',
    icono: '🧈',
    color: '#E74C3C',
    estadoPostprandial: {
      titulo: 'Tras la comida (lipogénesis)',
      pasos: [
        'Quilomicrones llegan vía linfa tras absorción intestinal',
        'Lipasa hepática libera ácidos grasos para captación',
        'Síntesis de VLDL: triglicéridos + apolipoproteínas',
        'Exportación de VLDL al plasma → entrega a tejidos',
        'LDL (de VLDL degradado) → captación celular por receptor LDL',
      ],
    },
    estadoAyuno: {
      titulo: 'En ayuno prolongado (cetogénesis)',
      pasos: [
        'Movilización de ácidos grasos desde tejido adiposo',
        'Beta-oxidación mitocondrial → acetil-CoA',
        'Exceso de acetil-CoA → síntesis de cuerpos cetónicos',
        'Cetona (β-hidroxibutirato) exportada como combustible',
        'Cerebro adapta su uso de cetona tras 48h de ayuno',
      ],
    },
    hormona: 'Insulina / Adrenalina + glucagón',
    organos: 'Hígado → Tejido adiposo, músculo, corazón, cerebro',
  },
  {
    id: 'proteinas',
    titulo: 'Proteínas',
    icono: '🧬',
    color: '#27AE60',
    estadoPostprandial: {
      titulo: 'Síntesis proteica activa',
      pasos: [
        'Aminoácidos absorbidos llegan vía vena porta',
        'Síntesis de albúmina: 10-15 g/día en ribosomas del RE rugoso',
        'Síntesis de factores de coagulación vitamina K-dependientes',
        'Gluconeogénesis a partir de aminoácidos glucogénicos',
        'Transaminasas (AST/ALT) catalizan interconversión de aminoácidos',
      ],
    },
    estadoAyuno: {
      titulo: 'Catabolismo proteico / gluconeogénesis',
      pasos: [
        'Proteólisis muscular libera aminoácidos (alanina, glutamina)',
        'Ciclo alanina-glucosa: músculo → hígado → músculo',
        'Transaminación → esqueletos carbonados → glucosa',
        'Deaminación → amoniaco → ciclo de la urea → urea',
        'Urea excretada por orina (fracción nitrogenada)',
      ],
    },
    hormona: 'GH / Cortisol + glucagón',
    organos: 'Hígado ↔ Músculo, riñón, intestino',
  },
];

// ─────────────────────────────────────────────
// Componentes de sección
// ─────────────────────────────────────────────

function SeccionAnatomia() {
  const [zonaActiva, setZonaActiva] = useState<string>('lobulo-derecho');
  const zona = ZONAS_HIGADO.find(z => z.id === zonaActiva) ?? ZONAS_HIGADO[0];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        El hígado pesa ~<strong>1,5 kg</strong> y recibe <strong>1,5 L de sangre por minuto</strong> mediante una irrigación dual única: vena porta (75%) y arteria hepática (25%).
      </div>

      {/* Cifras clave */}
      <div className={styles.cifrasGrid}>
        {[
          { icono: '⚖️', valor: '1,5', unidad: 'kg', label: 'Peso medio' },
          { icono: '🩸', valor: '1,5 L', unidad: '/min', label: 'Flujo sanguíneo' },
          { icono: '🔢', valor: '500+', unidad: 'funciones', label: 'Vitales' },
          { icono: '🔄', valor: '6-8', unidad: 'semanas', label: 'Regeneración' },
        ].map(c => (
          <div key={c.label} className={styles.cifraCard}>
            <span className={styles.cifraIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.cifraValor}>{c.valor}</span>
            <span className={styles.cifraUnidad}>{c.unidad}</span>
            <span className={styles.cifraLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Mapa hepático */}
      <div className={styles.mapaHigado}>
        <h3 className={styles.subSeccionTitulo}>Selecciona una zona para explorar</h3>
        <div className={styles.mapaGrid}>
          {/* Diagrama SVG simplificado del hígado */}
          <div className={styles.higadoVisual}>
            <svg viewBox="0 0 320 200" className={styles.higadoSvg} role="img" aria-label="Diagrama anatómico del hígado">
              {/* Lóbulo derecho */}
              <ellipse cx="115" cy="95" rx="95" ry="75" fill={zonaActiva === 'lobulo-derecho' ? '#C0392B' : '#E8B4B0'} opacity="0.85" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} onClick={() => setZonaActiva('lobulo-derecho')} />
              <text x="95" y="90" fontSize="10" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>Lóbulo</text>
              <text x="95" y="103" fontSize="10" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>derecho</text>

              {/* Lóbulo izquierdo */}
              <ellipse cx="235" cy="85" rx="65" ry="55" fill={zonaActiva === 'lobulo-izquierdo' ? '#C0392B' : '#F1948A'} opacity="0.85" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} onClick={() => setZonaActiva('lobulo-izquierdo')} />
              <text x="235" y="82" fontSize="10" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>Lóbulo</text>
              <text x="235" y="95" fontSize="10" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>izquierdo</text>

              {/* Lóbulo caudado */}
              <ellipse cx="160" cy="155" rx="30" ry="20" fill={zonaActiva === 'lobulo-caudado' ? '#7D3C98' : '#C39BD3'} opacity="0.9" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} onClick={() => setZonaActiva('lobulo-caudado')} />
              <text x="160" y="159" fontSize="9" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>Caudado</text>

              {/* Vesícula biliar */}
              <ellipse cx="80" cy="158" rx="22" ry="14" fill={zonaActiva === 'vesicula' ? '#1E8449' : '#82E0AA'} opacity="0.9" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }} onClick={() => setZonaActiva('vesicula')} />
              <text x="80" y="162" fontSize="8" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>Vesícula</text>

              {/* Vena porta */}
              <rect x="10" y="88" width="25" height="30" rx="4" fill={zonaActiva === 'vena-porta' ? '#1A5276' : '#5DADE2'} opacity="0.9" style={{ cursor: 'pointer' }} onClick={() => setZonaActiva('vena-porta')} />
              <text x="22" y="100" fontSize="7" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>Vena</text>
              <text x="22" y="110" fontSize="7" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>porta</text>

              {/* Arteria hepática */}
              <rect x="10" y="128" width="25" height="25" rx="4" fill={zonaActiva === 'arteria-hepatica' ? '#A04000' : '#F0B27A'} opacity="0.9" style={{ cursor: 'pointer' }} onClick={() => setZonaActiva('arteria-hepatica')} />
              <text x="22" y="138" fontSize="7" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>Art.</text>
              <text x="22" y="148" fontSize="7" fill="white" fontWeight="700" textAnchor="middle" style={{ pointerEvents: 'none' }}>hep.</text>
            </svg>
          </div>

          {/* Detalle zona */}
          <div className={styles.zonaDetalle} style={{ borderLeftColor: zona.color }}>
            <h4 className={styles.zonaDetalleTitulo} style={{ color: zona.color }}>{zona.nombre}</h4>
            <p className={styles.zonaDescripcion}>{zona.descripcion}</p>
            <p className={styles.zonaDato}>💡 {zona.dato}</p>
          </div>
        </div>

        {/* Botones zona */}
        <div className={styles.zonaBotonesGrid}>
          {ZONAS_HIGADO.map(z => (
            <button
              key={z.id}
              className={`${styles.zonaBtn} ${zonaActiva === z.id ? styles.zonaBtnActivo : ''}`}
              style={zonaActiva === z.id ? { borderColor: z.color, background: z.color } : {}}
              onClick={() => setZonaActiva(z.id)}
              aria-pressed={zonaActiva === z.id}
            >
              {z.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Irrigación dual */}
      <div className={styles.irrigacionCard}>
        <h3 className={styles.subSeccionTitulo}>Irrigación dual: el secreto del hígado</h3>
        <div className={styles.irrigacionGrid}>
          <div className={styles.irrigacionItem} style={{ borderColor: '#2980B9' }}>
            <span className={styles.irrigacionIcono} aria-hidden="true">🔵</span>
            <div>
              <strong>Vena porta</strong>
              <p>75% del flujo total</p>
              <p>Nutrientes del intestino</p>
              <p>~1.100 ml/min</p>
            </div>
          </div>
          <div className={styles.irrigacionItem} style={{ borderColor: '#E67E22' }}>
            <span className={styles.irrigacionIcono} aria-hidden="true">🔴</span>
            <div>
              <strong>Arteria hepática</strong>
              <p>25% del flujo total</p>
              <p>50% del oxígeno</p>
              <p>~400 ml/min</p>
            </div>
          </div>
        </div>
        <p className={styles.irrigacionNota}>
          Esta irrigación dual permite al hígado procesar simultáneamente los nutrientes absorbidos en el intestino (vena porta) y recibir suficiente oxígeno para su alto metabolismo (arteria hepática).
        </p>
      </div>
    </div>
  );
}

function SeccionFunciones() {
  const [grupoActivo, setGrupoActivo] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        El hígado realiza más de <strong>500 funciones vitales</strong>. Aquí agrupamos las principales en 5 categorías. Haz clic en cada una para explorar sus procesos fisiológicos.
      </div>
      <div className={styles.funcionesGrid}>
        {FUNCIONES_GRUPOS.map(grupo => {
          const activo = grupoActivo === grupo.id;
          return (
            <div key={grupo.id} className={`${styles.funcionCard} ${activo ? styles.funcionCardActiva : ''}`}>
              <button
                className={styles.funcionBtn}
                style={{ borderColor: grupo.color }}
                onClick={() => setGrupoActivo(activo ? null : grupo.id)}
                aria-expanded={activo}
              >
                <span className={styles.funcionIcono} aria-hidden="true">{grupo.icono}</span>
                <span className={styles.funcionTitulo} style={{ color: activo ? grupo.color : undefined }}>
                  {grupo.titulo}
                </span>
                <span className={styles.funcionResumen}>{grupo.resumen}</span>
                <span className={styles.funcionFlecha} aria-hidden="true">{activo ? '▲' : '▼'}</span>
              </button>
              {activo && (
                <div className={styles.funcionDetalle} style={{ borderColor: grupo.color }}>
                  <ul className={styles.funcionProcesos}>
                    {grupo.procesos.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                  <p className={styles.funcionCuriosidad}>💡 {grupo.curiosidad}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeccionDetox() {
  const [sustanciaActiva, setSustanciaActiva] = useState<number>(0);
  const sustancia = SUSTANCIAS_DETOX[sustanciaActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        La detoxificación ocurre en <strong>dos fases</strong>: la fase 1 activa la sustancia (a veces haciéndola más tóxica temporalmente) y la fase 2 la hace hidrosoluble para su excreción.
      </div>

      {/* Diagrama de fases */}
      <div className={styles.detoxDiagrama}>
        <div className={styles.detoxFase} style={{ background: 'rgba(142,68,173,0.08)', borderColor: '#8E44AD' }}>
          <h3 className={styles.detoxFaseTitulo} style={{ color: '#8E44AD' }}>FASE 1 — Bioactivación</h3>
          <p className={styles.detoxFaseSubtitulo}>Enzimas CYP450 (citocromo P450)</p>
          <ul className={styles.detoxFaseLista}>
            <li>Oxidación, reducción, hidrólisis</li>
            <li>Genera metabolitos reactivos</li>
            <li>Puede producir intermediarios tóxicos</li>
            <li>~50 isoformas de CYP450</li>
          </ul>
        </div>
        <div className={styles.detoxFlecha} aria-hidden="true">→</div>
        <div className={styles.detoxFase} style={{ background: 'rgba(39,174,96,0.08)', borderColor: '#27AE60' }}>
          <h3 className={styles.detoxFaseTitulo} style={{ color: '#27AE60' }}>FASE 2 — Conjugación</h3>
          <p className={styles.detoxFaseSubtitulo}>Transferasas (glutatión, UGT, SULT)</p>
          <ul className={styles.detoxFaseLista}>
            <li>Unión con moléculas polares</li>
            <li>Aumenta hidrosolubilidad</li>
            <li>Facilita excreción urinaria/biliar</li>
            <li>Requiere glutatión (antioxidante clave)</li>
          </ul>
        </div>
      </div>

      {/* Ejemplos de sustancias */}
      <h3 className={styles.subSeccionTitulo}>Ejemplos: ¿qué hace el hígado con...?</h3>
      <div className={styles.detoxBotones}>
        {SUSTANCIAS_DETOX.map((s, i) => (
          <button
            key={i}
            className={`${styles.detoxBtn} ${sustanciaActiva === i ? styles.detoxBtnActivo : ''}`}
            onClick={() => setSustanciaActiva(i)}
            aria-pressed={sustanciaActiva === i}
          >
            {s.nombre}
          </button>
        ))}
      </div>
      <div className={styles.detoxCard}>
        <div className={styles.detoxCardHeader}>
          <span className={styles.detoxCardTipo}>{sustancia.tipo}</span>
          <strong className={styles.detoxCardNombre}>{sustancia.nombre}</strong>
        </div>
        <div className={styles.detoxCardFases}>
          <div className={styles.detoxCardFase}>
            <span className={styles.detoxCardFaseLabel} style={{ color: '#8E44AD' }}>FASE 1</span>
            <p>{sustancia.fase1}</p>
          </div>
          <div className={styles.detoxCardFlechaInline} aria-hidden="true">↓</div>
          <div className={styles.detoxCardFase}>
            <span className={styles.detoxCardFaseLabel} style={{ color: '#27AE60' }}>FASE 2</span>
            <p>{sustancia.fase2}</p>
          </div>
          <div className={styles.detoxCardFlechaInline} aria-hidden="true">↓</div>
          <div className={styles.detoxCardFase}>
            <span className={styles.detoxCardFaseLabel} style={{ color: '#2E86AB' }}>RESULTADO</span>
            <p>{sustancia.resultado}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeccionMetabolismo() {
  const [selector, setSelector] = useState<MetaSelector>('glucosa');
  const [estado, setEstado] = useState<'postprandial' | 'ayuno'>('postprandial');
  const ciclo = META_CICLOS.find(c => c.id === selector) ?? META_CICLOS[0];
  const cicloEstado = estado === 'postprandial' ? ciclo.estadoPostprandial : ciclo.estadoAyuno;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        El hígado adapta su metabolismo según el estado nutricional: tras las comidas <strong>almacena y sintetiza</strong>; en ayuno <strong>exporta y degrada</strong> para mantener la energía del organismo.
      </div>

      {/* Selector de macronutriente */}
      <div className={styles.metaSelectorGrid}>
        {META_CICLOS.map(c => (
          <button
            key={c.id}
            className={`${styles.metaSelectorBtn} ${selector === c.id ? styles.metaSelectorActivo : ''}`}
            style={selector === c.id ? { borderColor: c.color, background: c.color } : {}}
            onClick={() => setSelector(c.id)}
            aria-pressed={selector === c.id}
          >
            <span aria-hidden="true">{c.icono}</span>
            {c.titulo}
          </button>
        ))}
      </div>

      {/* Toggle estado nutricional */}
      <div className={styles.metaEstadoToggle}>
        <button
          className={`${styles.metaEstadoBtn} ${estado === 'postprandial' ? styles.metaEstadoActivo : ''}`}
          onClick={() => setEstado('postprandial')}
          aria-pressed={estado === 'postprandial'}
        >
          🍽️ Tras la comida
        </button>
        <button
          className={`${styles.metaEstadoBtn} ${estado === 'ayuno' ? styles.metaEstadoActivo : ''}`}
          onClick={() => setEstado('ayuno')}
          aria-pressed={estado === 'ayuno'}
        >
          ⏱️ En ayuno
        </button>
      </div>

      {/* Ciclo metabólico */}
      <div className={styles.metaCicloCard} style={{ borderColor: ciclo.color }}>
        <h3 className={styles.metaCicloTitulo} style={{ color: ciclo.color }}>
          {ciclo.icono} {cicloEstado.titulo}
        </h3>
        <ol className={styles.metaCicloPasos}>
          {cicloEstado.pasos.map((paso, i) => (
            <li key={i} className={styles.metaCicloPaso}>
              <span className={styles.metaCicloPasoNum} style={{ background: ciclo.color }}>{i + 1}</span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
        <div className={styles.metaCicloMeta}>
          <span><strong>Reguladores:</strong> {ciclo.hormona}</span>
          <span><strong>Flujo:</strong> {ciclo.organos}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHigado() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('anatomia');

  const seccionActual = SECCIONES.find(s => s.id === seccionActiva) ?? SECCIONES[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🫀 Visualizador del Hígado</h1>
        <p className={styles.subtitle}>El laboratorio del cuerpo: detoxificación, metabolismo y síntesis</p>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
            onClick={() => setSeccionActiva(s.id)}
            aria-pressed={seccionActiva === s.id}
          >
            <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
            <span className={styles.navTexto}>{s.titulo}</span>
          </button>
        ))}
      </nav>

      {/* Cabecera de sección activa */}
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>{seccionActual.titulo}</h2>
        <p className={styles.seccionSubtitulo}>{seccionActual.subtitulo}</p>
      </div>

      {/* Contenido dinámico */}
      {seccionActiva === 'anatomia' && <SeccionAnatomia />}
      {seccionActiva === 'funciones' && <SeccionFunciones />}
      {seccionActiva === 'detox' && <SeccionDetox />}
      {seccionActiva === 'metabolismo' && <SeccionMetabolismo />}

      {/* Bloque educativo */}
      <EducationalSection title="¿Cómo funciona el hígado?" subtitle="El laboratorio del cuerpo: más de 500 funciones vitales">

        {/* 1. Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Función</th>
                <th>Proceso clave</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Detoxificación</td>
                <td>CYP450 (Fase 1) + conjugación (Fase 2)</td>
                <td>Eliminación de tóxicos por bilis u orina</td>
              </tr>
              <tr>
                <td>Metabolismo carbohidratos</td>
                <td>Glucogenogénesis / glucogenólisis</td>
                <td>Regulación glucemia (80-100 mg/dL)</td>
              </tr>
              <tr>
                <td>Metabolismo lípidos</td>
                <td>Síntesis VLDL/HDL, beta-oxidación</td>
                <td>Control colesterol y energía</td>
              </tr>
              <tr>
                <td>Síntesis proteínas</td>
                <td>Albúmina, factores II/VII/IX/X</td>
                <td>Presión oncótica y coagulación</td>
              </tr>
              <tr>
                <td>Producción bilis</td>
                <td>600-1200 mL/día, sales biliares</td>
                <td>Digestión de grasas en intestino</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles / casos de uso */}
        <div className={styles.escenariosGrid}>
          {[
            { icono: '🎓', titulo: 'Estudiante de biología o medicina', descripcion: 'Entiende las fases de detoxificación (CYP450 Fase 1, conjugación Fase 2) para el examen de bioquímica o fisiología.' },
            { icono: '🍺', titulo: 'Persona con hábito de alcohol', descripcion: 'Comprende por qué el hígado metaboliza solo 0,1 g/kg/h y qué ocurre cuando se supera esa capacidad.' },
            { icono: '💊', titulo: 'Paciente con medicación habitual', descripcion: 'Entiende las interacciones farmacológicas: fármacos que compiten por las mismas enzimas CYP450 pueden potenciarse o inhibirse.' },
            { icono: '🏥', titulo: 'Familiar de paciente con hepatitis', descripcion: 'Aprende sobre la regeneración hepática: el hígado puede recuperar su masa completa en 6-8 semanas si el 30% del tejido permanece sano.' },
          ].map((perfil) => (
            <div key={perfil.titulo} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">{perfil.icono}</span>
              <div>
                <strong>{perfil.titulo}</strong>
                <p>{perfil.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <div className={styles.faqList}>
          {[
            {
              q: '¿Puede el hígado regenerarse si se extirpa una parte?',
              a: 'Sí. Es el único órgano sólido capaz de hacerlo. Puede regenerarse incluso si solo queda el 30% del tejido original, recuperando su masa completa en 6-8 semanas mediante hiperplasia de hepatocitos.',
              tip: 'Esto hace posibles los trasplantes de donante vivo, donde el donante conserva una fracción que se regenera completamente.',
            },
            {
              q: '¿Por qué la ictericia pone la piel amarilla?',
              a: 'La ictericia ocurre cuando la bilirrubina no conjugada (liposoluble) se acumula en sangre por encima de ~2 mg/dL. Se deposita en la piel y la esclerótica, dándoles un color amarillo.',
              tip: null,
            },
            {
              q: '¿Qué es el hígado graso (esteatosis hepática)?',
              a: 'Es la acumulación de triglicéridos en los hepatocitos que supera el 5% del peso hepático. Puede ser alcohólica o no alcohólica (NASH). En fases iniciales es reversible con cambios de hábitos.',
              tip: 'El ejercicio aeróbico reduce la esteatosis en un 40% incluso sin cambios en el peso corporal.',
            },
            {
              q: '¿Por qué el hígado procesa tanto el alcohol?',
              a: 'El hígado concentra la enzima alcohol deshidrogenasa (ADH), que convierte el etanol en acetaldehído (tóxico) y luego en acetato (inocuo). Pero su capacidad es limitada: 0,1 g/kg/h.',
              tip: null,
            },
            {
              q: '¿Qué análisis miden la salud del hígado?',
              a: 'Los principales marcadores son: ALT y AST (daño hepatocelular), GGT (colestasis y alcohol), bilirrubina (función excretora), albúmina (síntesis proteica) y tiempo de protrombina (síntesis de factores de coagulación).',
              tip: 'ALT es el marcador más específico de daño hepático. Valores >3 veces el límite normal requieren evaluación.',
            },
            {
              q: '¿Por qué los fármacos tienen interacciones?',
              a: 'Porque compiten por las mismas enzimas CYP450. Un fármaco puede inhibir una isoforma (CYP3A4, CYP2D6...) y elevar la concentración de otro que depende de esa misma enzima, aumentando su efecto o toxicidad.',
              tip: null,
            },
          ].map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <strong className={styles.faqPregunta}>{item.q}</strong>
              <p className={styles.faqRespuesta}>{item.a}</p>
              {item.tip && <p className={styles.faqTip}>💡 {item.tip}</p>}
            </div>
          ))}
        </div>

        {/* 4. Guía paso a paso */}
        <div className={styles.stepGuide}>
          <h3 className={styles.stepGuideTitle}>Cómo el hígado procesa un medicamento</h3>
          {[
            { num: 1, texto: 'El fármaco llega al intestino delgado y se absorbe a través de la mucosa intestinal.' },
            { num: 2, texto: 'La sangre portal lo transporta directamente al hígado (efecto de primer paso): antes de llegar a la circulación general, ya pasa por el filtro hepático.' },
            { num: 3, texto: 'Las enzimas CYP450 lo oxidan (Fase 1). El metabolito resultante puede ser más activo, menos activo o igualmente activo que el fármaco original.' },
            { num: 4, texto: 'La Fase 2 conjuga el metabolito con glucurónido, sulfato o glutatión, haciéndolo hidrosoluble y excretable.' },
            { num: 5, texto: 'El metabolito conjugado se excreta por bilis hacia el intestino o por orina a través del riñón.' },
            { num: 6, texto: 'El efecto clínico del fármaco depende del porcentaje que sobrevive al primer paso hepático. Algunos (nitroglicerina, morfina) pierden el 90% en este proceso.' },
          ].map((paso) => (
            <div key={paso.num} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">{paso.num}</span>
              <p className={styles.stepContent}>{paso.texto}</p>
            </div>
          ))}
        </div>

        {/* 5. Mejores prácticas */}
        <div className={styles.tipsGrid}>
          {[
            { icono: '🚫', titulo: 'Límite de alcohol', descripcion: 'La OMS recomienda menos de 14 unidades/semana (≈2 cervezas/día como máximo). Cada unidad son ~10 g de etanol puro.' },
            { icono: '💊', titulo: 'Paracetamol y ayuno', descripcion: 'Tomar paracetamol con el estómago vacío o junto con alcohol aumenta el riesgo hepatotóxico porque se agota el glutatión protector.' },
            { icono: '🥦', titulo: 'Crucíferas y detoxificación', descripcion: 'Brócoli, coles y berros contienen sulforafano, que induce las enzimas de la Fase 2 de detoxificación, potenciando la eliminación de tóxicos.' },
            { icono: '🏃', titulo: 'Ejercicio contra la esteatosis', descripcion: 'El ejercicio aeróbico regular reduce la esteatosis hepática en un 40% incluso sin cambiar el peso corporal, al mejorar la sensibilidad a la insulina.' },
            { icono: '🩺', titulo: 'Analítica anual', descripcion: 'ALT y AST son los mejores marcadores de daño hepatocelular temprano. Incluirlos en la analítica anual permite detectar problemas antes de que den síntomas.' },
          ].map((tip) => (
            <div key={tip.titulo} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
              <div>
                <strong>{tip.titulo}</strong>
                <p>{tip.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 6. Warning box — mitos y errores comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Mitos y errores comunes sobre el hígado</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>«Los suplementos naturales son inocuos para el hígado»</strong> — la cava, el kava y algunos hongos medicinales son hepatotóxicos documentados. &quot;Natural&quot; no significa seguro.</li>
            <li><strong>«Si no duele, el hígado está bien»</strong> — el hígado no tiene receptores del dolor propios; los síntomas (fatiga, ictericia, ascitis) aparecen cuando el daño es ya avanzado.</li>
            <li><strong>«El café es malo para el hígado»</strong> — al contrario, 2-3 tazas/día de café se asocian a menor riesgo de cirrosis, hepatocarcinoma y progresión de la esteatosis.</li>
            <li><strong>«El ayuno intermitente daña el hígado»</strong> — en ausencia de patología hepática previa, el ayuno activa la autofagia hepática, un proceso de limpieza celular considerado beneficioso.</li>
            <li><strong>«Solo el alcohol causa daño hepático»</strong> — la esteatohepatitis no alcohólica (NASH) afecta al 25% de la población mundial y está impulsada principalmente por obesidad, diabetes tipo 2 y sedentarismo.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-higado')} />
      <ShareCard appName="visualizador-higado" />
      <Footer appName="visualizador-higado" />
    </div>
  );
}
