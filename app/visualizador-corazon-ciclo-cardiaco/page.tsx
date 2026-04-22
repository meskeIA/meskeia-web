'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorCorazonCicloCardiaco.module.css';
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

type FaseCardiaca = 'sistole' | 'diastole';
type RitmoECG = 'normal' | 'taquicardia' | 'bradicardia';
type OndaECG = 'P' | 'QRS' | 'T' | null;
type ValvulaId = 'mitral' | 'tricuspide' | 'aortica' | 'pulmonar';

interface DatosValvula {
  icono: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  cuando: string;
  fallo: string;
}

// ─────────────────────────────────────────────
// Datos de válvulas
// ─────────────────────────────────────────────

const VALVULAS: Record<ValvulaId, DatosValvula> = {
  mitral: {
    icono: '🔴',
    nombre: 'Válvula Mitral',
    tipo: 'Aurículo-ventricular izquierda',
    ubicacion: 'Entre la aurícula izquierda y el ventrículo izquierdo (lado sistémico).',
    cuando: 'Se abre durante la diástole para llenar el ventrículo izquierdo de sangre oxigenada. Se cierra en la sístole para evitar el reflujo hacia los pulmones.',
    fallo: 'La estenosis mitral dificulta el llenado ventricular. La insuficiencia mitral causa regurgitación de sangre a los pulmones, produciendo el soplo cardíaco más frecuente.',
  },
  tricuspide: {
    icono: '🔵',
    nombre: 'Válvula Tricúspide',
    tipo: 'Aurículo-ventricular derecha',
    ubicacion: 'Entre la aurícula derecha y el ventrículo derecho (lado pulmonar).',
    cuando: 'Se abre en diástole para llenar el ventrículo derecho con sangre desoxigenada. Se cierra en sístole para dirigir la sangre hacia los pulmones.',
    fallo: 'La insuficiencia tricuspídea genera congestión venosa y edema (hinchazón de piernas y abdomen). Frecuente en hipertensión pulmonar severa.',
  },
  aortica: {
    icono: '🟠',
    nombre: 'Válvula Aórtica',
    tipo: 'Semilular (salida izquierda)',
    ubicacion: 'Entre el ventrículo izquierdo y la aorta — la arteria más grande del cuerpo.',
    cuando: 'Se abre en sístole cuando la presión ventricular supera 80 mmHg, expulsando sangre a todo el organismo. Se cierra en diástole para mantener la presión de perfusión.',
    fallo: 'La estenosis aórtica es la valvulopatía más común en mayores de 65 años: el corazón debe trabajar mucho más. La insuficiencia aórtica sobrecarga el ventrículo izquierdo.',
  },
  pulmonar: {
    icono: '🟢',
    nombre: 'Válvula Pulmonar',
    tipo: 'Semilunares (salida derecha)',
    ubicacion: 'Entre el ventrículo derecho y la arteria pulmonar, hacia los pulmones.',
    cuando: 'Se abre en sístole para enviar la sangre desoxigenada a los pulmones. La presión requerida es menor (25 mmHg) que en la aórtica (80 mmHg).',
    fallo: 'La estenosis pulmonar es frecuente en cardiopatías congénitas. La insuficiencia pulmonar suele ser bien tolerada porque el circuito pulmonar trabaja a baja presión.',
  },
};

// ─────────────────────────────────────────────
// Datos ECG
// ─────────────────────────────────────────────

const ONDAS_ECG: Record<Exclude<OndaECG, null>, { nombre: string; desc: string }> = {
  P: {
    nombre: 'Onda P',
    desc: 'Despolarización auricular: el impulso eléctrico del nodo sinusal se propaga por las aurículas, provocando su contracción y el llenado ventricular.',
  },
  QRS: {
    nombre: 'Complejo QRS',
    desc: 'Despolarización ventricular: los ventrículos se contraen (sístole) para expulsar la sangre. Es la señal eléctrica más amplia del ECG.',
  },
  T: {
    nombre: 'Onda T',
    desc: 'Repolarización ventricular: los ventrículos se recuperan eléctricamente antes del siguiente latido. El corazón se relaja (diástole).',
  },
};

const RITMOS_ECG: Record<RitmoECG, { label: string; bpm: string; duracion: number }> = {
  normal: { label: 'Normal (60-100 bpm)', bpm: '75 bpm', duracion: 2400 },
  taquicardia: { label: 'Taquicardia (>100 bpm)', bpm: '150 bpm', duracion: 1200 },
  bradicardia: { label: 'Bradicardia (<60 bpm)', bpm: '45 bpm', duracion: 4000 },
};

// ─────────────────────────────────────────────
// Sección 1: Latido cardíaco
// ─────────────────────────────────────────────

function SeccionLatido(): React.ReactNode {
  const [latiendo, setLatiendo] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(75);
  const [fase, setFase] = useState<FaseCardiaca>('diastole');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duracionMs = Math.round((60 / bpm) * 1000);

  useEffect(() => {
    if (latiendo) {
      setFase('sistole');
      intervalRef.current = setInterval(() => {
        setFase((f) => (f === 'sistole' ? 'diastole' : 'sistole'));
      }, duracionMs / 2);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setFase('diastole');
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [latiendo, duracionMs]);

  const duracionCss = `${(duracionMs / 1000).toFixed(2)}s`;

  const FASES = {
    sistole: {
      nombre: 'Sístole (contracción)',
      desc: 'Los ventrículos se contraen. La válvula aórtica y pulmonar se abren para expulsar la sangre. Presión sistólica: ~120 mmHg.',
    },
    diastole: {
      nombre: 'Diástole (relajación)',
      desc: 'Los ventrículos se relajan y se llenan. Las válvulas mitral y tricúspide se abren. Presión diastólica: ~80 mmHg.',
    },
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">❤️</span>
        <div>
          <h2 className={styles.sectionTitle}>El latido del corazón</h2>
          <p className={styles.sectionSubtitle}>Sístole y diástole — las dos fases del ciclo cardíaco</p>
        </div>
      </div>

      <div className={styles.corazonContainer}>
        <span
          className={`${styles.corazonAnimado} ${latiendo ? styles.latiendo : ''}`}
          style={{ '--duracion-latido': duracionCss } as React.CSSProperties}
          aria-label={latiendo ? `Corazón latiendo a ${bpm} latidos por minuto` : 'Corazón en reposo'}
          role="img"
        >
          ❤️
        </span>

        <div className={styles.faseDisplay}>
          <div className={styles.faseNombre}>{FASES[fase].nombre}</div>
          <p className={styles.faseDesc}>{FASES[fase].desc}</p>
        </div>

        <div className={styles.corazonBotones}>
          <button
            className={styles.btnPrimario}
            onClick={() => setLatiendo((v) => !v)}
            aria-label={latiendo ? 'Pausar latido' : 'Iniciar latido'}
          >
            {latiendo ? '⏸ Pausar latido' : '▶ Iniciar latido'}
          </button>
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <label htmlFor="slider-bpm" className={styles.sliderLabel}>
          Frecuencia cardíaca: <strong>{bpm} lpm</strong>
        </label>
        <input
          id="slider-bpm"
          type="range"
          min={40}
          max={200}
          step={1}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className={styles.slider}
          aria-label={`Frecuencia cardíaca: ${bpm} latidos por minuto`}
        />
        <div className={styles.sliderValores}>
          <span>40 lpm (bradicardia)</span>
          <span>75 lpm (reposo)</span>
          <span>200 lpm (máximo)</span>
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>¿Por qué 120/80 mmHg?</strong> La presión sistólica (120) es la fuerza máxima durante la sístole.
        La diastólica (80) es la presión mínima durante la diástole. Una presión arterial elevada (hipertensión) obliga
        al corazón a trabajar más para cada latido, desgastándolo a largo plazo.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Las 4 válvulas
// ─────────────────────────────────────────────

function SeccionValvulas(): React.ReactNode {
  const [activa, setActiva] = useState<ValvulaId | null>(null);

  const orden: ValvulaId[] = ['mitral', 'tricuspide', 'aortica', 'pulmonar'];

  return (
    <section className={styles.sectionAlt}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">🔀</span>
        <div>
          <h2 className={styles.sectionTitle}>Las 4 válvulas cardíacas</h2>
          <p className={styles.sectionSubtitle}>Puertas de sentido único que dirigen el flujo sanguíneo</p>
        </div>
      </div>

      <div className={styles.valvulasGrid}>
        {orden.map((id) => {
          const v = VALVULAS[id];
          return (
            <button
              key={id}
              className={`${styles.valvulaCard} ${activa === id ? styles.valvulaActiva : ''}`}
              onClick={() => setActiva((prev) => (prev === id ? null : id))}
              aria-pressed={activa === id}
              aria-label={`Ver información sobre ${v.nombre}`}
            >
              <span className={styles.valvulaIcono} aria-hidden="true">{v.icono}</span>
              <div className={styles.valvulaNombre}>{v.nombre}</div>
              <div className={styles.valvulaTipo}>{v.tipo}</div>
            </button>
          );
        })}
      </div>

      {activa && (
        <div className={styles.valvulaDetalle} role="region" aria-live="polite" aria-label={`Detalles de ${VALVULAS[activa].nombre}`}>
          <div className={styles.valvulaDetalleHeader}>
            <span className={styles.valvulaDetalleIcono} aria-hidden="true">{VALVULAS[activa].icono}</span>
            <h3 className={styles.valvulaDetalleTitulo}>{VALVULAS[activa].nombre}</h3>
          </div>
          <div className={styles.valvulaDetalleInfo}>
            <div className={styles.valvulaDetalleItem}>
              <span className={styles.valvulaDetalleItemLabel}>Ubicación</span>
              <span className={styles.valvulaDetalleItemText}>{VALVULAS[activa].ubicacion}</span>
            </div>
            <div className={styles.valvulaDetalleItem}>
              <span className={styles.valvulaDetalleItemLabel}>Función</span>
              <span className={styles.valvulaDetalleItemText}>{VALVULAS[activa].cuando}</span>
            </div>
            <div className={styles.valvulaDetalleItem}>
              <span className={styles.valvulaDetalleItemLabel}>Si falla</span>
              <span className={styles.valvulaDetalleItemText}>{VALVULAS[activa].fallo}</span>
            </div>
          </div>
        </div>
      )}

      {!activa && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Haz clic en una válvula para ver sus detalles
        </p>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 3: ECG simplificado
// ─────────────────────────────────────────────

function SeccionECG(): React.ReactNode {
  const [ritmo, setRitmo] = useState<RitmoECG>('normal');
  const [ondaActiva, setOndaActiva] = useState<OndaECG>(null);
  const animRef = useRef<number | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const ritmoData = RITMOS_ECG[ritmo];

  // Animación del trazado ECG con requestAnimationFrame
  useEffect(() => {
    let start: number | null = null;
    const duracion = ritmoData.duracion;

    function tick(ts: number) {
      if (!start) start = ts;
      const elapsed = (ts - start) % duracion;
      setOffset(-(elapsed / duracion) * 600);
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [ritmoData.duracion]);

  // Path SVG de una onda P-QRS-T simplificada (una sola unidad de 200px de ancho)
  // Coordenadas Y: 50 = línea base, mayor número = más abajo
  const ecgPath =
    'M0,50 L30,50 L40,45 L50,50 L60,50 L70,50 L80,15 L85,80 L90,15 L100,50 L120,50 L130,40 L145,50 L160,50 L200,50';

  // Repetimos el path 4 veces para hacer un trazado continuo
  const pathRepetido = [0, 200, 400, 600, 800]
    .map((dx) => ecgPath.replace(/([ML])(\d+)/g, (_m, cmd, x) => `${cmd}${Number(x) + dx}`))
    .join(' ');

  const ondas: Array<{ id: OndaECG; letra: string }> = [
    { id: 'P', letra: 'P' },
    { id: 'QRS', letra: 'QRS' },
    { id: 'T', letra: 'T' },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">📈</span>
        <div>
          <h2 className={styles.sectionTitle}>ECG — Electrocardiograma</h2>
          <p className={styles.sectionSubtitle}>Las ondas eléctricas del corazón y su significado</p>
        </div>
      </div>

      <div className={styles.ecgContainer}>
        {/* Trazado ECG animado */}
        <div className={styles.ecgSvgWrapper} aria-label="Trazado ECG animado" role="img">
          <svg className={styles.ecgSvg} viewBox="0 0 600 100" preserveAspectRatio="none">
            {/* Línea base */}
            <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(72,169,166,0.3)" strokeWidth="0.5" />

            {/* Trazado ECG animado */}
            <g transform={`translate(${offset % 200}, 0)`}>
              <path
                d={pathRepetido}
                fill="none"
                stroke="#48A9A6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Etiquetas de ondas (posición fija, referencial) */}
            <text x="80" y="14" className={styles.ecgOndaLabel} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">QRS</text>
            <text x="42" y="40" className={styles.ecgOndaLabel} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">P</text>
            <text x="133" y="36" className={styles.ecgOndaLabel} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">T</text>
          </svg>
        </div>

        {/* Selector de ritmo */}
        <div className={styles.ecgRitmosBotones} role="group" aria-label="Tipo de ritmo cardíaco">
          {(Object.keys(RITMOS_ECG) as RitmoECG[]).map((r) => (
            <button
              key={r}
              className={`${styles.ecgRitmoBtn} ${ritmo === r ? styles.ecgRitmoActivo : ''}`}
              onClick={() => setRitmo(r)}
              aria-pressed={ritmo === r}
            >
              {RITMOS_ECG[r].label}
            </button>
          ))}
        </div>

        {/* Tarjetas de ondas */}
        <div className={styles.ecgOndasGrid} role="group" aria-label="Ondas del ECG">
          {ondas.map(({ id, letra }) => {
            const data = ONDAS_ECG[id as Exclude<OndaECG, null>];
            return (
              <button
                key={id}
                className={`${styles.ecgOndaCard} ${ondaActiva === id ? styles.ecgOndaActiva : ''}`}
                onClick={() => setOndaActiva((prev) => (prev === id ? null : id))}
                aria-pressed={ondaActiva === id}
                aria-label={`Ver información sobre ${data.nombre}`}
              >
                <div className={styles.ecgOndaLetra}>{letra}</div>
                <div className={styles.ecgOndaNombre}>{data.nombre}</div>
                {ondaActiva === id && (
                  <p className={styles.ecgOndaDesc}>{data.desc}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>¿Para qué sirve un ECG?</strong> El electrocardiograma detecta arritmias (fibrilación auricular, taquicardias),
        infartos (elevación del segmento ST), bloqueos de conducción y problemas de electrolitos. Un ECG en reposo dura
        solo 10 minutos y proporciona información vital del funcionamiento eléctrico del corazón.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Gasto cardíaco
// ─────────────────────────────────────────────

function SeccionGastoCardiaco(): React.ReactNode {
  const [fc, setFc] = useState<number>(75);
  const [vs, setVs] = useState<number>(70);

  // Gasto cardíaco en litros/minuto
  const gc = parseFloat(((fc * vs) / 1000).toFixed(2));

  // Porcentaje respecto al máximo referencial (~25 L/min)
  const maxGc = 25;
  const pct = Math.min((gc / maxGc) * 100, 100);

  const referencias = [
    { icono: '🛏️', valor: '~5 L/min', label: 'Reposo tranquilo' },
    { icono: '🚶', valor: '~8 L/min', label: 'Actividad ligera' },
    { icono: '🏃', valor: '~15 L/min', label: 'Ejercicio moderado' },
    { icono: '🏋️', valor: '~25 L/min', label: 'Esfuerzo máximo' },
  ];

  function getComparacion(): string {
    if (gc < 4) return 'Muy bajo — podría indicar bradicardia severa o insuficiencia cardíaca.';
    if (gc < 6) return 'Rango de reposo normal (4-6 L/min). Típico en adulto sano sentado.';
    if (gc < 10) return 'Actividad moderada — el corazón trabaja más para cubrir la demanda muscular.';
    if (gc < 18) return 'Ejercicio intenso — el corazón de una persona entrenada responde aumentando FC y VS.';
    return '¡Esfuerzo máximo! Solo atletas de élite con corazones muy entrenados alcanzan estos valores.';
  }

  return (
    <section className={styles.sectionAlt}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">💧</span>
        <div>
          <h2 className={styles.sectionTitle}>Gasto cardíaco</h2>
          <p className={styles.sectionSubtitle}>GC = Frecuencia cardíaca × Volumen sistólico</p>
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <label htmlFor="slider-fc" className={styles.sliderLabel}>
          Frecuencia cardíaca (FC): <strong>{fc} lpm</strong>
        </label>
        <input
          id="slider-fc"
          type="range"
          min={40}
          max={200}
          step={1}
          value={fc}
          onChange={(e) => setFc(Number(e.target.value))}
          className={styles.slider}
          aria-label={`Frecuencia cardíaca: ${fc} latidos por minuto`}
        />
        <div className={styles.sliderValores}>
          <span>40 lpm</span>
          <span>120 lpm</span>
          <span>200 lpm</span>
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <label htmlFor="slider-vs" className={styles.sliderLabel}>
          Volumen sistólico (VS): <strong>{vs} ml</strong>
        </label>
        <input
          id="slider-vs"
          type="range"
          min={40}
          max={130}
          step={1}
          value={vs}
          onChange={(e) => setVs(Number(e.target.value))}
          className={styles.slider}
          aria-label={`Volumen sistólico: ${vs} mililitros por latido`}
        />
        <div className={styles.sliderValores}>
          <span>40 ml</span>
          <span>85 ml</span>
          <span>130 ml</span>
        </div>
      </div>

      {/* Resultado */}
      <div className={styles.gastoResultado}>
        <div className={styles.gastoFormula} aria-hidden="true">
          GC = {fc} lpm × {vs} ml = {fc * vs} ml/min
        </div>
        <div className={styles.gastoValor} aria-label={`Gasto cardíaco: ${gc} litros por minuto`}>
          {gc.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
        </div>
        <div className={styles.gastoUnidad}>litros / minuto</div>
      </div>

      {/* Barra de progreso */}
      <div className={styles.gastoBarraContainer}>
        <div className={styles.gastoBarraLabel}>
          <span>0 L/min</span>
          <span aria-hidden="true">{Math.round(pct)}% del máximo referencial</span>
          <span>25 L/min</span>
        </div>
        <div className={styles.gastoBarraTrack} role="progressbar" aria-valuenow={gc} aria-valuemin={0} aria-valuemax={maxGc} aria-label={`Gasto cardíaco: ${gc} de ${maxGc} L/min`}>
          <div className={styles.gastoBarraFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Valores de referencia */}
      <div className={styles.gastoReferencias}>
        {referencias.map((r) => (
          <div key={r.label} className={styles.gastoRefCard}>
            <span className={styles.gastoRefIcono} aria-hidden="true">{r.icono}</span>
            <div className={styles.gastoRefValor}>{r.valor}</div>
            <div className={styles.gastoRefLabel}>{r.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.warningBox}>
        <strong>Interpretación:</strong> {getComparacion()} El entrenamiento físico aumenta el volumen sistólico
        (el corazón bombea más sangre por latido), por eso los atletas tienen frecuencias cardíacas en reposo más bajas
        (bradicardia fisiológica) manteniendo el mismo gasto cardíaco.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCorazonCicloCardiaco() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Salud · Fisiología</span>
          <span className={styles.heroIcono} aria-hidden="true">❤️</span>
          <h1 className={styles.heroTitle}>Ciclo Cardíaco</h1>
          <p className={styles.heroSubtitle}>
            Sístole · Diástole · Válvulas · ECG · Gasto cardíaco
          </p>
          <p className={styles.heroDesc}>
            El corazón late unas 100.000 veces al día sin descanso. Descubre cómo funciona cada fase del ciclo
            cardíaco, para qué sirven las 4 válvulas y qué mide un electrocardiograma.
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <SeccionLatido />
        <SeccionValvulas />
        <SeccionECG />
        <SeccionGastoCardiaco />
      </main>

      <EducationalSection
        title="¿Cómo funciona el corazón?"
        subtitle="El motor que bombea 7.000 litros de sangre al día sin descanso"
      >
        <div className={styles.educacional}>
          <h3>El ciclo cardíaco</h3>
          <p>
            El ciclo cardíaco es la secuencia de eventos mecánicos y eléctricos que ocurren en cada latido. Dura
            aproximadamente 0,8 segundos en reposo (75 lpm) y se divide en dos fases principales:
          </p>
          <ul>
            <li>
              <strong>Sístole</strong> (contracción): los ventrículos se contraen y expulsan la sangre hacia la
              aorta (ventrículo izquierdo) y la arteria pulmonar (ventrículo derecho). Genera la presión sistólica
              (~120 mmHg).
            </li>
            <li>
              <strong>Diástole</strong> (relajación): los ventrículos se relajan y se llenan de sangre
              proveniente de las aurículas. Es la presión mínima del corazón (~80 mmHg).
            </li>
          </ul>

          <h3>Las 4 cámaras y su función</h3>
          <p>
            El corazón humano tiene 4 cámaras que trabajan en paralelo como dos bombas separadas:
          </p>
          <ul>
            <li>
              <strong>Corazón derecho</strong> (aurícula + ventrículo derecho): recibe sangre desoxigenada del
              cuerpo y la envía a los pulmones para oxigenarse (circulación pulmonar o menor).
            </li>
            <li>
              <strong>Corazón izquierdo</strong> (aurícula + ventrículo izquierdo): recibe sangre oxigenada de
              los pulmones y la bombea a todo el organismo (circulación sistémica o mayor). Trabaja a mayor
              presión y tiene paredes más gruesas.
            </li>
          </ul>

          <h3>¿Qué mide un ECG?</h3>
          <p>
            El electrocardiograma registra la actividad eléctrica que coordina el latido. El nodo sinusal
            (el &quot;marcapasos natural&quot; del corazón) genera un impulso eléctrico que se propaga en orden:
          </p>
          <ol>
            <li><strong>Onda P</strong>: el impulso llega a las aurículas, que se contraen para llenar los ventrículos.</li>
            <li><strong>Complejo QRS</strong>: el impulso llega a los ventrículos a través del nodo aurículo-ventricular y el haz de His. Los ventrículos se contraen — sístole ventricular.</li>
            <li><strong>Onda T</strong>: los ventrículos se recuperan eléctricamente (repolarización) antes del siguiente latido.</li>
          </ol>

          <h3>El gasto cardíaco</h3>
          <p>
            El gasto cardíaco (GC) es el volumen de sangre que el corazón bombea por minuto:
          </p>
          <p>
            <em>GC = Frecuencia cardíaca × Volumen sistólico</em>
          </p>
          <p>
            En reposo, el corazón bombea ~5 litros por minuto — prácticamente todo el volumen de sangre del cuerpo.
            Durante el ejercicio máximo puede multiplicar este valor por 5 en atletas de élite.
          </p>

          <h3>Datos curiosos</h3>
          <ul>
            <li>El corazón late unas <strong>100.000 veces al día</strong> y unos <strong>2.500 millones de veces</strong> a lo largo de una vida de 70 años.</li>
            <li>El ventrículo izquierdo es el más potente: soporta presiones 4-5 veces mayores que el derecho.</li>
            <li>El corazón de un feto comienza a latir a las 3-4 semanas de gestación, antes de que la madre sepa que está embarazada.</li>
            <li>Los atletas de resistencia pueden tener frecuencias cardíacas en reposo de 35-40 lpm (bradicardia fisiológica), frente a los ~75 lpm de un adulto sedentario.</li>
            <li>El sonido del latido (&quot;lub-dub&quot;) corresponde al cierre de las válvulas: primero mitral y tricúspide (sístole), luego aórtica y pulmonar (diástole).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-corazon-ciclo-cardiaco')} />
      <ShareCard appName="visualizador-corazon-ciclo-cardiaco" />
      <Footer appName="visualizador-corazon-ciclo-cardiaco" />
    </div>
  );
}
