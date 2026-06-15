'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Osteoporosis.module.css';
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

type SeccionId = 'ciclo' | 'balance' | 'riesgo' | 'curva';

interface SeccionInfo {
  id: SeccionId;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'ciclo', titulo: 'Ciclo de Remodelado', icono: '🔄', subtitulo: 'Las 4 fases del hueso vivo' },
  { id: 'balance', titulo: 'Balance Celular', icono: '⚖️', subtitulo: 'Osteoblastos vs osteoclastos' },
  { id: 'riesgo', titulo: 'Factores de Riesgo', icono: '⚠️', subtitulo: 'Modificables y no modificables' },
  { id: 'curva', titulo: 'Densidad Ósea', icono: '📈', subtitulo: 'Evolución a lo largo de la vida' },
];

// ─────────────────────────────────────────────
// Datos del ciclo
// ─────────────────────────────────────────────

interface FaseCiclo {
  id: number;
  nombre: string;
  icono: string;
  dias: string;
  descripcion: string;
  detalles: string[];
  colorClass: string;
  color: string;
}

const FASES_CICLO: FaseCiclo[] = [
  {
    id: 1,
    nombre: 'Activación',
    icono: '📡',
    dias: 'Días 1-3',
    descripcion: 'Los osteocitos (células sensoras del hueso) detectan microfracturas o zonas desgastadas y envían señales para reclutar osteoclastos.',
    detalles: [
      'Los osteocitos representan el 90-95% de todas las células óseas',
      'Mediadores clave: RANKL, PTH (parathormona), vitamina D activa',
      'Las microfracturas son invisibles en radiografías pero el hueso las detecta',
      'Sin activación no hay renovación: el hueso envejecido no se repara',
    ],
    colorClass: 'faseActivacion',
    color: '#F59E0B',
  },
  {
    id: 2,
    nombre: 'Resorción',
    icono: '🔴',
    dias: 'Días 3-21',
    descripcion: 'Los osteoclastos disuelven el hueso viejo secretando ácido (HCl) y enzimas como la colagenasa, creando lagunas de Howship.',
    detalles: [
      'Un osteoclasto puede disolver ~200.000 µm³ de hueso al día',
      'El ácido secretado (pH ~4,5) disuelve los cristales de hidroxiapatita',
      'La colagenasa fragmenta el colágeno tipo I de la matriz ósea',
      'Al destruir el hueso viejo se liberan factores de crecimiento (IGF-1, TGF-β)',
    ],
    colorClass: 'faseResorcion',
    color: '#EF4444',
  },
  {
    id: 3,
    nombre: 'Transición',
    icono: '🔀',
    dias: 'Días 21-28',
    descripcion: 'Los osteoclastos mueren por apoptosis o migran. Células de reversa preparan la superficie ósea y reclutan osteoblastos.',
    detalles: [
      'Las células de reversa limpian restos de colágeno no digerido',
      'Señales de acoplamiento conectan resorción con formación: Sema3A, Wnt',
      'Sin transición correcta el ciclo queda truncado (problema en osteoporosis)',
      'La duración varía según zona del esqueleto y edad del paciente',
    ],
    colorClass: 'faseTransicion',
    color: '#EAB308',
  },
  {
    id: 4,
    nombre: 'Formación',
    icono: '🟢',
    dias: 'Días 28-150',
    descripcion: 'Los osteoblastos depositan nuevo osteoide (colágeno tipo I) que se mineraliza con calcio y fósforo convirtiéndose en hueso maduro.',
    detalles: [
      'La mineralización completa del osteoide tarda 3-6 meses',
      'El 10-20% de los osteoblastos quedan atrapados y se convierten en osteocitos',
      'La calcificación requiere calcio, fósforo, vitamina K2 y fosfatasa alcalina',
      'El ciclo completo dura 3-6 meses en adultos (más lento con la edad)',
    ],
    colorClass: 'faseFormacion',
    color: '#10B981',
  },
];

// ─────────────────────────────────────────────
// Datos del balance
// ─────────────────────────────────────────────

interface EstadioBalance {
  id: string;
  etiqueta: string;
  icono: string;
  edad: string;
  descripcion: string;
  formacion: number;
  resorcion: number;
  perdidaAnual: string;
  nota: string;
}

const ESTADIOS_BALANCE: EstadioBalance[] = [
  {
    id: 'joven',
    etiqueta: 'Edad joven',
    icono: '🧑',
    edad: '20-35 años',
    descripcion: 'Formación mayor o igual a la resorción. Se alcanza el pico de masa ósea (PMO) entre los 25 y 30 años.',
    formacion: 52,
    resorcion: 48,
    perdidaAnual: '~0%',
    nota: 'El 90% de la masa ósea máxima ya está formada a los 18 años',
  },
  {
    id: 'media',
    etiqueta: 'Mediana edad',
    icono: '🧑‍💼',
    edad: '35-50 años',
    descripcion: 'Ligero desequilibrio: la resorción comienza a superar a la formación. Pérdida lenta y continua.',
    formacion: 44,
    resorcion: 56,
    perdidaAnual: '~0,5%/año',
    nota: 'El déficit de calcio activa la PTH, que aumenta la resorción para mantener la calcemia',
  },
  {
    id: 'vejez',
    etiqueta: 'Post-menopausia / Vejez',
    icono: '👴',
    edad: '50+ años',
    descripcion: 'La caída de estrógenos elimina el freno natural sobre los osteoclastos. Pérdida acelerada especialmente en los 5-10 años post-menopausia.',
    formacion: 28,
    resorcion: 72,
    perdidaAnual: '-1 a -3%/año',
    nota: 'Los estrógenos inhiben el RANKL e inducen apoptosis de osteoclastos: sin ellos, los osteoclastos proliferan',
  },
];

// ─────────────────────────────────────────────
// Datos de factores de riesgo
// ─────────────────────────────────────────────

interface FactorRiesgo {
  icono: string;
  nombre: string;
  mecanismo: string;
}

const FACTORES_NO_MODIFICABLES: FactorRiesgo[] = [
  {
    icono: '♀️',
    nombre: 'Sexo femenino',
    mecanismo: 'Pelvis más ancha (mayor superficie de pérdida) y menopausia (caída brusca de estrógenos que activan los osteoclastos)',
  },
  {
    icono: '🎂',
    nombre: 'Edad avanzada',
    mecanismo: 'Remodelado más lento, absorción intestinal de calcio reducida, menor actividad de osteoblastos y menor síntesis de vitamina D cutánea',
  },
  {
    icono: '🧬',
    nombre: 'Herencia genética',
    mecanismo: 'La genética explica el 60-80% de la variación en masa ósea pico. Historial familiar de fracturas es un factor de riesgo independiente',
  },
  {
    icono: '🌍',
    nombre: 'Raza/etnia',
    mecanismo: 'Personas caucásicas y asiáticas tienen mayor riesgo que afrodescendientes, posiblemente por diferencias en arquitectura ósea y metabolismo de vitamina D',
  },
  {
    icono: '🪶',
    nombre: 'Complexión delgada',
    mecanismo: 'Menor masa corporal significa menos carga mecánica sobre el hueso y menor reserva de masa ósea de partida',
  },
];

const FACTORES_MODIFICABLES: FactorRiesgo[] = [
  {
    icono: '🥛',
    nombre: 'Calcio insuficiente',
    mecanismo: 'Menos de 1000 mg/día en adultos eleva la PTH, que aumenta la resorción ósea para mantener los niveles de calcio en sangre',
  },
  {
    icono: '☀️',
    nombre: 'Déficit de vitamina D',
    mecanismo: 'Esencial para absorber calcio en el intestino. Muy prevalente en latitudes >40°N en invierno. Sin vitamina D, solo se absorbe el 10-15% del calcio ingerido',
  },
  {
    icono: '🛋️',
    nombre: 'Sedentarismo',
    mecanismo: 'La carga mecánica (ejercicio de impacto, musculación) es el estímulo más potente para la formación ósea. Sin estímulo, el hueso se atrofia',
  },
  {
    icono: '🚬',
    nombre: 'Tabaco',
    mecanismo: 'Reduce la absorción intestinal de calcio, acelera el metabolismo de los estrógenos y tiene toxicidad directa sobre los osteoblastos',
  },
  {
    icono: '🍷',
    nombre: 'Alcohol excesivo',
    mecanismo: 'El alcohol es tóxico directo para los osteoblastos, altera la absorción de calcio y vitamina D, y aumenta el riesgo de caídas',
  },
  {
    icono: '💊',
    nombre: 'Corticoides crónicos',
    mecanismo: 'Suprimen directamente la formación ósea e inhiben la absorción intestinal de calcio. Es la causa más frecuente de osteoporosis secundaria',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Ciclo de remodelado
// ─────────────────────────────────────────────

function SeccionCiclo() {
  const [faseActiva, setFaseActiva] = useState<number>(1);

  const fase = FASES_CICLO.find(f => f.id === faseActiva)!;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El hueso no es estático: se renueva constantemente. Cada año se reemplaza aproximadamente el <strong>10% del esqueleto adulto</strong>. Este proceso se llama remodelado óseo y tiene 4 fases.</p>
      </div>

      {/* Stepper de fases */}
      <div className={styles.stepperContainer}>
        {FASES_CICLO.map((f, i) => (
          <div key={f.id} className={styles.stepperItem}>
            <button
              type="button"
              className={`${styles.stepperBtn} ${faseActiva === f.id ? styles.stepperActivo : ''} ${styles[f.colorClass + 'Btn']}`}
              onClick={() => setFaseActiva(f.id)}
              aria-pressed={faseActiva === f.id}
              style={faseActiva === f.id ? { borderColor: f.color, backgroundColor: f.color + '18' } : undefined}
            >
              <span className={styles.stepperIcono} aria-hidden="true">{f.icono}</span>
              <span className={styles.stepperNombre}>{f.nombre}</span>
              <span className={styles.stepperDias}>{f.dias}</span>
            </button>
            {i < FASES_CICLO.length - 1 && (
              <div className={styles.stepperFlecha} aria-hidden="true">→</div>
            )}
          </div>
        ))}
      </div>

      {/* Detalle de la fase activa */}
      <div className={styles.faseDetalleCard} style={{ borderColor: fase.color }}>
        <div className={styles.faseDetalleHeader}>
          <span
            className={styles.faseDetalleNumero}
            style={{ background: fase.color }}
          >
            {fase.id}
          </span>
          <div>
            <h3 className={styles.faseDetalleTitulo} style={{ color: fase.color }}>
              {fase.icono} {fase.nombre}
            </h3>
            <span className={styles.faseDetalleDias}>{fase.dias}</span>
          </div>
        </div>

        <p className={styles.faseDetalleDesc}>{fase.descripcion}</p>

        <ul className={styles.faseDetalleList}>
          {fase.detalles.map((d, i) => (
            <li key={i} className={styles.faseDetalleListItem}>
              <span className={styles.faseDetalleBullet} style={{ background: fase.color }} aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Barra de progreso del ciclo */}
      <div className={styles.cicloBarraCard}>
        <h3 className={styles.cicloBarraTitulo}>Duración del ciclo completo: 3 a 6 meses</h3>
        <div className={styles.cicloBarraContainer} role="img" aria-label="Barra de proporciones del ciclo de remodelado óseo">
          {FASES_CICLO.map(f => (
            <div
              key={f.id}
              className={`${styles.cicloBarraSegmento} ${faseActiva === f.id ? styles.cicloBarraActivo : ''}`}
              style={{
                flex: f.id === 4 ? 5 : f.id === 2 ? 2.5 : 1,
                background: f.color,
                opacity: faseActiva === f.id ? 1 : 0.45,
              }}
              title={`${f.nombre}: ${f.dias}`}
            >
              <span className={styles.cicloBarraLabel}>{f.nombre}</span>
            </div>
          ))}
        </div>
        <p className={styles.cicloBarraNota}>La fase de formación es la más larga: depositar y mineralizar el nuevo hueso lleva meses</p>
      </div>

      <div className={styles.insight}>
        <p>
          El remodelado óseo no ocurre de forma continua: se organiza en unidades discretas llamadas
          <strong> BMUs (Basic Multicellular Units)</strong>. En un esqueleto adulto hay unas
          <strong> 1-2 millones de BMUs activas simultáneamente</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Balance celular
// ─────────────────────────────────────────────

function SeccionBalance() {
  const [estadioActivo, setEstadioActivo] = useState<string>('joven');

  const estadio = ESTADIOS_BALANCE.find(e => e.id === estadioActivo)!;

  const formacionPct = estadio.formacion;
  const resorcionPct = estadio.resorcion;
  const esDeficit = resorcionPct > formacionPct;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La densidad ósea depende del <strong>equilibrio entre formación y resorción</strong>. Cuando la resorción supera a la formación, el hueso pierde masa año a año.</p>
      </div>

      {/* Selector de estadio */}
      <div className={styles.estadioSelector}>
        {ESTADIOS_BALANCE.map(e => (
          <button
            key={e.id}
            type="button"
            className={`${styles.estadioBtn} ${estadioActivo === e.id ? styles.estadioBtnActivo : ''}`}
            onClick={() => setEstadioActivo(e.id)}
            aria-pressed={estadioActivo === e.id}
          >
            <span className={styles.estadioIcono} aria-hidden="true">{e.icono}</span>
            <span className={styles.estadioNombre}>{e.etiqueta}</span>
            <span className={styles.estadioEdad}>{e.edad}</span>
          </button>
        ))}
      </div>

      {/* Visualización del balance */}
      <div className={styles.balanceCard}>
        <h3 className={styles.balanceTitulo}>
          {estadio.icono} {estadio.etiqueta} ({estadio.edad})
        </h3>
        <p className={styles.balanceDesc}>{estadio.descripcion}</p>

        {/* Barra de balance */}
        <div className={styles.balanceBarra} role="img" aria-label={`Balance: ${formacionPct}% formación, ${resorcionPct}% resorción`}>
          <div className={styles.balanceBarraFormacion} style={{ flex: formacionPct }}>
            <span className={styles.balanceBarraLabel}>Formación</span>
            <span className={styles.balanceBarraPct}>{formacionPct}%</span>
          </div>
          <div className={styles.balanceBarraResorcion} style={{ flex: resorcionPct }}>
            <span className={styles.balanceBarraLabel}>Resorción</span>
            <span className={styles.balanceBarraPct}>{resorcionPct}%</span>
          </div>
        </div>

        {/* Indicador de resultado */}
        <div className={`${styles.balanceResultado} ${esDeficit ? styles.balanceDeficit : styles.balanceEquilibrio}`}>
          <span className={styles.balanceResultadoIcono} aria-hidden="true">
            {esDeficit ? '📉' : '✅'}
          </span>
          <div>
            <span className={styles.balanceResultadoTitulo}>
              {esDeficit ? `Pérdida de masa ósea: ${estadio.perdidaAnual}` : 'Balance equilibrado o positivo'}
            </span>
            <span className={styles.balanceResultadoNota}>{estadio.nota}</span>
          </div>
        </div>

        {/* Células protagonistas */}
        <div className={styles.celulasGrid}>
          <div className={styles.celulaCard}>
            <span className={styles.celulaIcono} aria-hidden="true">🟢</span>
            <span className={styles.celulaNombre}>Osteoblasto</span>
            <span className={styles.celulaFuncion}>Forma hueso nuevo</span>
            <span className={styles.celulaBarra} style={{ width: `${formacionPct}%`, background: '#10B981' }} aria-label={`Actividad: ${formacionPct}%`} />
          </div>
          <div className={styles.celulaVs} aria-hidden="true">vs</div>
          <div className={styles.celulaCard}>
            <span className={styles.celulaIcono} aria-hidden="true">🔴</span>
            <span className={styles.celulaNombre}>Osteoclasto</span>
            <span className={styles.celulaFuncion}>Destruye hueso viejo</span>
            <span className={styles.celulaBarra} style={{ width: `${resorcionPct}%`, background: '#EF4444' }} aria-label={`Actividad: ${resorcionPct}%`} />
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Los estrógenos son el <strong>freno natural de los osteoclastos</strong>: inducen su apoptosis e inhiben la producción de RANKL.
          Al caer el estrógeno en la menopausia, los osteoclastos proliferan sin control y la resorción se dispara.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Factores de riesgo
// ─────────────────────────────────────────────

function SeccionRiesgo() {
  const [grupo, setGrupo] = useState<'no-modificables' | 'modificables'>('no-modificables');
  const [factorActivo, setFactorActivo] = useState<number | null>(null);

  const factores = grupo === 'no-modificables' ? FACTORES_NO_MODIFICABLES : FACTORES_MODIFICABLES;

  const handleGrupo = (g: 'no-modificables' | 'modificables') => {
    setGrupo(g);
    setFactorActivo(null);
  };

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Algunos factores no pueden cambiarse, pero conocerlos permite <strong>vigilancia y prevención precoz</strong>. Los modificables están en tu mano.</p>
      </div>

      {/* Toggle de grupos */}
      <div className={styles.grupoToggle} role="group" aria-label="Seleccionar grupo de factores de riesgo">
        <button
          type="button"
          className={`${styles.grupoBtn} ${grupo === 'no-modificables' ? styles.grupoBtnActivo : ''}`}
          onClick={() => handleGrupo('no-modificables')}
          aria-pressed={grupo === 'no-modificables'}
        >
          <span aria-hidden="true">🔒</span> No modificables ({FACTORES_NO_MODIFICABLES.length})
        </button>
        <button
          type="button"
          className={`${styles.grupoBtn} ${grupo === 'modificables' ? styles.grupoBtnActivo : ''}`}
          onClick={() => handleGrupo('modificables')}
          aria-pressed={grupo === 'modificables'}
        >
          <span aria-hidden="true">✅</span> Modificables ({FACTORES_MODIFICABLES.length})
        </button>
      </div>

      {/* Lista de factores */}
      <div className={styles.factoresList}>
        {factores.map((f, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.factorCard} ${factorActivo === i ? styles.factorCardActivo : ''} ${grupo === 'modificables' ? styles.factorModificable : styles.factorNoModificable}`}
            onClick={() => setFactorActivo(factorActivo === i ? null : i)}
            aria-expanded={factorActivo === i}
          >
            <div className={styles.factorHeader}>
              <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
              <span className={styles.factorNombre}>{f.nombre}</span>
              <span className={styles.factorChevron} aria-hidden="true">{factorActivo === i ? '▲' : '▼'}</span>
            </div>
            {factorActivo === i && (
              <p className={styles.factorMecanismo}>{f.mecanismo}</p>
            )}
          </button>
        ))}
      </div>

      {/* Recuadro de acción */}
      {grupo === 'modificables' && (
        <div className={styles.accionCard}>
          <h3 className={styles.accionTitulo}>
            <span aria-hidden="true">💪</span> Tres acciones de mayor impacto
          </h3>
          <div className={styles.accionGrid}>
            <div className={styles.accionItem}>
              <span className={styles.accionNum} aria-hidden="true">1</span>
              <span className={styles.accionTexto}><strong>Ejercicio de impacto</strong>: caminar, correr, saltar, pesas. El estímulo mecánico activa los osteoblastos</span>
            </div>
            <div className={styles.accionItem}>
              <span className={styles.accionNum} aria-hidden="true">2</span>
              <span className={styles.accionTexto}><strong>Calcio + Vitamina D</strong>: 1000-1200 mg/día de calcio y niveles séricos de vitamina D {'>'} 30 ng/mL</span>
            </div>
            <div className={styles.accionItem}>
              <span className={styles.accionNum} aria-hidden="true">3</span>
              <span className={styles.accionTexto}><strong>No fumar ni abusar del alcohol</strong>: tóxicos directos para los osteoblastos con efecto acumulativo</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          La osteoporosis es <strong>&quot;la epidemia silenciosa&quot;</strong>: no duele mientras avanza.
          La primera señal suele ser una fractura — de cadera, columna o muñeca — cuando la densidad ya ha caído significativamente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Curva de densidad ósea
// ─────────────────────────────────────────────

function SeccionCurva() {
  const [sexo, setSexo] = useState<'femenino' | 'masculino'>('femenino');

  // Puntos de la curva normalizada (0-100) para edades 0-80
  const puntosF = [
    { edad: 0, den: 5 }, { edad: 10, den: 45 }, { edad: 18, den: 85 },
    { edad: 25, den: 100 }, { edad: 35, den: 97 }, { edad: 45, den: 90 },
    { edad: 50, den: 82 }, { edad: 55, den: 68 }, { edad: 60, den: 60 },
    { edad: 70, den: 50 }, { edad: 80, den: 40 },
  ];
  const puntosM = [
    { edad: 0, den: 5 }, { edad: 10, den: 42 }, { edad: 18, den: 80 },
    { edad: 25, den: 100 }, { edad: 35, den: 98 }, { edad: 45, den: 92 },
    { edad: 55, den: 85 }, { edad: 65, den: 76 }, { edad: 70, den: 70 },
    { edad: 80, den: 60 },
  ];

  const puntos = sexo === 'femenino' ? puntosF : puntosM;

  // Convertir puntos a coordenadas SVG (viewBox 0 0 400 200)
  const W = 400;
  const H = 180;
  const PAD_L = 40;
  const PAD_B = 30;
  const PAD_T = 15;
  const edadMin = 0;
  const edadMax = 80;

  const toX = (edad: number) => PAD_L + ((edad - edadMin) / (edadMax - edadMin)) * (W - PAD_L - 10);
  const toY = (den: number) => PAD_T + ((100 - den) / 100) * (H - PAD_T - PAD_B);

  const pathData = puntos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.edad)} ${toY(p.den)}`)
    .join(' ');

  // Umbrales T-score -1 (osteopenia) y -2.5 (osteoporosis)
  // Pico = 100%, T-1 ≈ 85%, T-2.5 ≈ 73%
  const yOsteopenia = toY(85);
  const yOsteoporosis = toY(73);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La masa ósea crece rápidamente hasta los <strong>25-30 años</strong> (pico de masa ósea) y después declina. El ritmo de pérdida depende del sexo y factores individuales.</p>
      </div>

      {/* Toggle femenino / masculino */}
      <div className={styles.sexoToggle} role="group" aria-label="Seleccionar sexo para la curva de densidad ósea">
        <button
          type="button"
          className={`${styles.sexoBtn} ${sexo === 'femenino' ? styles.sexoBtnActivo : ''}`}
          onClick={() => setSexo('femenino')}
          aria-pressed={sexo === 'femenino'}
        >
          <span aria-hidden="true">♀</span> Curva femenina
        </button>
        <button
          type="button"
          className={`${styles.sexoBtn} ${sexo === 'masculino' ? styles.sexoBtnActivo : ''}`}
          onClick={() => setSexo('masculino')}
          aria-pressed={sexo === 'masculino'}
        >
          <span aria-hidden="true">♂</span> Curva masculina
        </button>
      </div>

      {/* Gráfico SVG */}
      <div className={styles.graficaCard}>
        <h3 className={styles.graficaTitulo}>Densidad ósea a lo largo de la vida</h3>
        <div className={styles.graficaWrapper}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className={styles.graficaSvg}
            role="img"
            aria-label={`Curva de densidad ósea ${sexo}: crece hasta los 25-30 años, meseta y luego declive${sexo === 'femenino' ? ' acelerado tras la menopausia' : ' gradual'}`}
          >
            {/* Fondo zonas */}
            <rect x={PAD_L} y={PAD_T} width={W - PAD_L - 10} height={yOsteopenia - PAD_T} fill="#D1FAE5" opacity="0.4" />
            <rect x={PAD_L} y={yOsteopenia} width={W - PAD_L - 10} height={yOsteoporosis - yOsteopenia} fill="#FEF3C7" opacity="0.5" />
            <rect x={PAD_L} y={yOsteoporosis} width={W - PAD_L - 10} height={H - PAD_B - yOsteoporosis} fill="#FEE2E2" opacity="0.5" />

            {/* Líneas de umbral */}
            <line x1={PAD_L} y1={yOsteopenia} x2={W - 10} y2={yOsteopenia} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5,3" />
            <line x1={PAD_L} y1={yOsteoporosis} x2={W - 10} y2={yOsteoporosis} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5,3" />

            {/* Etiquetas de umbrales */}
            <text x={W - 8} y={yOsteopenia - 3} fontSize="8" fill="#B45309" textAnchor="end">Osteopenia</text>
            <text x={W - 8} y={yOsteoporosis + 10} fontSize="8" fill="#B91C1C" textAnchor="end">Osteoporosis</text>

            {/* Eje X (edad) */}
            <line x1={PAD_L} y1={H - PAD_B} x2={W - 10} y2={H - PAD_B} stroke="#9CA3AF" strokeWidth="1" />
            {[0, 10, 20, 30, 40, 50, 60, 70, 80].map(edad => (
              <g key={edad}>
                <line x1={toX(edad)} y1={H - PAD_B} x2={toX(edad)} y2={H - PAD_B + 4} stroke="#9CA3AF" strokeWidth="1" />
                <text x={toX(edad)} y={H - PAD_B + 13} fontSize="8" fill="#9CA3AF" textAnchor="middle">{edad}</text>
              </g>
            ))}
            <text x={(PAD_L + W - 10) / 2} y={H - 2} fontSize="9" fill="#6B7280" textAnchor="middle">Edad (años)</text>

            {/* Eje Y (densidad %) */}
            <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="#9CA3AF" strokeWidth="1" />
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1={PAD_L - 3} y1={toY(v)} x2={PAD_L} y2={toY(v)} stroke="#9CA3AF" strokeWidth="1" />
                <text x={PAD_L - 5} y={toY(v) + 3} fontSize="8" fill="#9CA3AF" textAnchor="end">{v}%</text>
              </g>
            ))}

            {/* Curva principal */}
            <path
              d={pathData}
              fill="none"
              stroke={sexo === 'femenino' ? '#E91E8C' : '#2E86AB'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Puntos clave */}
            {puntos.map((p, i) => (
              <circle
                key={i}
                cx={toX(p.edad)}
                cy={toY(p.den)}
                r="3"
                fill={sexo === 'femenino' ? '#E91E8C' : '#2E86AB'}
              />
            ))}

            {/* Marcador pico de masa ósea */}
            <line x1={toX(25)} y1={PAD_T} x2={toX(25)} y2={H - PAD_B} stroke="#10B981" strokeWidth="1" strokeDasharray="3,2" opacity="0.7" />
            <text x={toX(25) + 3} y={PAD_T + 10} fontSize="8" fill="#059669">Pico ~25 años</text>
          </svg>
        </div>

        {/* Leyenda de umbrales */}
        <div className={styles.graficaLeyenda}>
          <div className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: '#D1FAE5', border: '1px solid #10B981' }} aria-hidden="true" />
            <span className={styles.leyendaTexto}><strong>Normal</strong>: densidad &gt; -1 desviación estándar del pico</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }} aria-hidden="true" />
            <span className={styles.leyendaTexto}><strong>Osteopenia</strong>: entre -1 y -2,5 DE (riesgo aumentado)</span>
          </div>
          <div className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: '#FEE2E2', border: '1px solid #EF4444' }} aria-hidden="true" />
            <span className={styles.leyendaTexto}><strong>Osteoporosis</strong>: por debajo de -2,5 DE (diagnóstico clínico)</span>
          </div>
        </div>
        <p className={styles.graficaNota}>
          Solo con fines educativos. La densidad ósea real se mide mediante densitometría (DEXA). Los umbrales T-score de la OMS son para mujeres postmenopáusicas; en hombres se aplican criterios ajustados.
        </p>
      </div>

      {/* Diferencias entre sexos */}
      <div className={styles.sexoComparativaCard}>
        <h3 className={styles.sexoComparativaTitulo}>¿Por qué las mujeres son más vulnerables?</h3>
        <div className={styles.sexoComparativaGrid}>
          <div className={styles.sexoComparativaCol}>
            <span className={styles.sexoComparativaColTitulo}>♀ Mujer</span>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Pico de masa ósea</span>
              <span className={styles.sexoComparativaValor}>~85% del hombre</span>
            </div>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Pérdida post-menopausia</span>
              <span className={styles.sexoComparativaValor} style={{ color: '#EF4444' }}>-1 a -3%/año</span>
            </div>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Riesgo fractura de cadera</span>
              <span className={styles.sexoComparativaValor}>2-3× mayor</span>
            </div>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Prevalencia osteoporosis</span>
              <span className={styles.sexoComparativaValor}>~30% (mujeres &gt;50)</span>
            </div>
          </div>
          <div className={styles.sexoComparativaCol}>
            <span className={styles.sexoComparativaColTitulo}>♂ Hombre</span>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Pico de masa ósea</span>
              <span className={styles.sexoComparativaValor}>Base de referencia</span>
            </div>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Pérdida gradual</span>
              <span className={styles.sexoComparativaValor} style={{ color: '#F59E0B' }}>-0,5 a -1%/año</span>
            </div>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Riesgo fractura de cadera</span>
              <span className={styles.sexoComparativaLabel}>—</span>
            </div>
            <div className={styles.sexoComparativaFila}>
              <span className={styles.sexoComparativaLabel}>Prevalencia osteoporosis</span>
              <span className={styles.sexoComparativaValor}>~8% (hombres &gt;50)</span>
            </div>
          </div>
        </div>
        <p className={styles.sexoComparativaNota}>
          Los hombres pierden testosterona de forma gradual (no abrupta), lo que modera la aceleración de la resorción.
          Aun así, 1 de cada 3 fracturas osteoporóticas ocurre en hombres.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>El 90% de la masa ósea máxima se alcanza a los 18 años.</strong> La infancia y adolescencia son
          la ventana crítica de prevención: ejercicio de impacto, calcio y vitamina D forman el &quot;banco óseo&quot; que
          protegerá el hueso durante toda la vida adulta.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorOsteoporosisPage() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('ciclo');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'ciclo': return <SeccionCiclo />;
      case 'balance': return <SeccionBalance />;
      case 'riesgo': return <SeccionRiesgo />;
      case 'curva': return <SeccionCurva />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Osteoporosis</h1>
          <p className={styles.subtitle}>El hueso que se renueva (y cómo pierde la batalla)</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador de osteoporosis">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}
          </p>
        </div>

        {renderSeccion()}

        {/* warningBox standalone */}
        <div className={styles.warningBox}>
          <strong>🦴 Prevención antes de los 30:</strong> el 90% de la masa ósea máxima se alcanza a los 18 años.
          La infancia y adolescencia son la ventana más importante para la prevención: ejercicio de impacto, calcio
          y vitamina D forman la reserva que protegerá el hueso durante toda la vida adulta.
        </div>

        <EducationalSection
          title="Más sobre el remodelado óseo y la osteoporosis"
          subtitle="Conceptos clave de fisiología ósea"
          defaultOpen={false}
        >
          {/* Tabla de fases */}
          <h3>El ciclo de remodelado: resumen por fases</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ background: 'rgba(46,134,171,0.1)' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #e5e5e5' }}>Fase</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #e5e5e5' }}>Célula protagonista</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #e5e5e5' }}>Duración</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #e5e5e5' }}>Marcador bioquímico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Activación</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Osteocito (sensor)</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>~3 días</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>RANKL, PTH</td>
                </tr>
                <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Resorción</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Osteoclasto</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>~18 días</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>CTX, NTX (fragmentos colágeno)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Transición / Reversa</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Células de reversa</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>~7 días</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Sema3A, Wnt (señales)</td>
                </tr>
                <tr style={{ background: 'rgba(16,185,129,0.04)' }}>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Formación</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>Osteoblasto</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>~4-5 meses</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #e5e5e5' }}>FAO, PINP (formación colágeno)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>¿Quién usa este visualizador?</h3>
          <ul>
            <li><strong>Estudiantes de biología y medicina</strong>: el remodelado óseo es contenido de selectividad (Biología) y del grado de Medicina (Fisiología, Reumatología)</li>
            <li><strong>Mujeres en perimenopausia</strong>: entender por qué el estrógeno importa tanto para el hueso ayuda a tomar decisiones informadas sobre prevención</li>
            <li><strong>Cuidadores de personas mayores</strong>: conocer los factores modificables permite actuar (calcio, vitamina D, ejercicio adaptado) incluso en edades avanzadas</li>
          </ul>

          <h3>5 hitos del ciclo de remodelado</h3>
          <ol>
            <li><strong>Día 0 — Detección:</strong> un osteocito detecta una microlesión y activa la señal RANKL</li>
            <li><strong>Día 3 — Llegada de los osteoclastos:</strong> se forman sobre la superficie ósea y comienzan a secretar ácido</li>
            <li><strong>Día 21 — Lagunas de Howship:</strong> las cavidades de resorción alcanzan su máxima profundidad (~50 µm)</li>
            <li><strong>Día 28 — Relevo:</strong> los osteoblastos ocupan las lagunas y empiezan a depositar osteoide</li>
            <li><strong>Mes 3-6 — Mineralización completa:</strong> el nuevo hueso ha alcanzado su densidad definitiva</li>
          </ol>

          <h3>Preguntas frecuentes</h3>

          <p><strong>¿El hueso duele cuando pierde densidad?</strong><br />
          No: la osteoporosis es asintomática. El hueso no tiene receptores de dolor para detectar pérdida de densidad.
          La primera señal suele ser una fractura &quot;de fragilidad&quot; (producida por un traumatismo mínimo que en hueso normal no habría causado lesión).</p>

          <p><strong>¿Tomar calcio es suficiente sin vitamina D?</strong><br />
          No. La vitamina D es imprescindible para que el intestino absorba el calcio: sin ella solo se absorbe el 10-15% del calcio ingerido.
          La suplementación efectiva siempre combina calcio y vitamina D. Los niveles séricos recomendados de 25-OH vitamina D son superiores a 30 ng/mL.</p>

          <p><strong>¿El ejercicio de impacto es peligroso con osteoporosis?</strong><br />
          Depende del grado. Con osteoporosis severa (T-score muy bajo, fracturas previas), los ejercicios de alto impacto pueden ser arriesgados.
          Sin embargo, el ejercicio adaptado (caminar, natación, pilates, pesas ligeras) es beneficioso incluso en osteoporosis establecida. Siempre bajo supervisión médica.</p>

          <p><strong>¿Los hombres también tienen osteoporosis?</strong><br />
          Sí, aunque con menor frecuencia. Aproximadamente 1 de cada 3 fracturas osteoporóticas ocurre en hombres.
          La osteoporosis masculina está infra-diagnosticada porque históricamente se ha considerado una enfermedad femenina.
          Los factores principales en hombres son: déficit de testosterona, corticoides, alcoholismo e inmovilización.</p>

          <p><strong>¿A partir de qué edad se hace la densitometría?</strong><br />
          Las guías clínicas recomiendan densitometría (DXA) a partir de los <strong>65 años en mujeres</strong> (o antes si hay factores de riesgo).
          En hombres, a partir de los 70 años o antes si hay factores de riesgo. La indicación siempre la establece el médico.</p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este visualizador tiene finalidad exclusivamente educativa. Los valores de densidad ósea y umbrales mostrados
            son aproximaciones esquemáticas para facilitar la comprensión del concepto. El diagnóstico de osteoporosis y osteopenia
            requiere densitometría clínica (DXA) e interpretación por un profesional de la salud.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-osteoporosis')} />
        <ShareCard appName="visualizador-osteoporosis" />
        <Footer appName="visualizador-osteoporosis" />
    </div>
  );
}
