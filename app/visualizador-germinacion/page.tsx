'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Germinacion.module.css';
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

type Seccion = 'anatomia' | 'proceso' | 'factores' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'anatomia', titulo: 'Anatomía', icono: '🫘', subtitulo: 'Partes de la semilla' },
  { id: 'proceso', titulo: 'El Proceso', icono: '🌱', subtitulo: 'Fases de germinación' },
  { id: 'factores', titulo: 'Factores', icono: '🌡️', subtitulo: 'Condiciones necesarias' },
  { id: 'datos', titulo: 'Datos', icono: '🤯', subtitulo: 'Curiosidades fascinantes' },
];

// ─────────────────────────────────────────────
// Datos: Anatomía de la semilla
// ─────────────────────────────────────────────

interface ParteSemilla {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  colorDark: string;
  funcion: string;
  detalle: string;
}

const PARTES_SEMILLA: ParteSemilla[] = [
  {
    id: 'testa',
    nombre: 'Testa',
    icono: '🛡️',
    color: '#92400E',
    colorDark: '#FDE68A',
    funcion: 'Cubierta exterior protectora',
    detalle: 'Capa dura e impermeable que protege al embrión de daños mecánicos, deshidratación y patógenos. Debe reblandecerse con agua para que la germinación comience.',
  },
  {
    id: 'cotiledones',
    nombre: 'Cotiledones',
    icono: '🍃',
    color: '#065F46',
    colorDark: '#6EE7B7',
    funcion: 'Almacén de nutrientes',
    detalle: 'Las primeras hojas embrionarias, ricas en almidón, proteínas y lípidos. Alimentan al embrión hasta que las hojas verdaderas pueden hacer fotosíntesis. Las dicotiledóneas tienen 2 y las monocotiledóneas 1.',
  },
  {
    id: 'radicula',
    nombre: 'Radícula',
    icono: '🌿',
    color: '#7C2D12',
    colorDark: '#FDBA74',
    funcion: 'Futura raíz principal',
    detalle: 'La primera estructura que emerge durante la germinación. Crece hacia abajo por geotropismo positivo, anclando la planta y absorbiendo agua y minerales del suelo.',
  },
  {
    id: 'plumula',
    nombre: 'Plúmula',
    icono: '🌿',
    color: '#166534',
    colorDark: '#86EFAC',
    funcion: 'Futuro tallo y hojas',
    detalle: 'Yema apical del embrión que dará lugar al tallo y las primeras hojas verdaderas. Crece hacia arriba por fototropismo positivo, buscando la luz para realizar la fotosíntesis.',
  },
  {
    id: 'hipocotilo',
    nombre: 'Hipocótilo',
    icono: '📏',
    color: '#4338CA',
    colorDark: '#A5B4FC',
    funcion: 'Eje embrionario',
    detalle: 'Conecta la radícula con la plúmula. En muchas plantas, se alarga durante la germinación empujando los cotiledones y la plúmula hacia la superficie (germinación epigea).',
  },
  {
    id: 'micropilo',
    nombre: 'Micrópilo',
    icono: '💧',
    color: '#1E40AF',
    colorDark: '#93C5FD',
    funcion: 'Poro de entrada de agua',
    detalle: 'Pequeña abertura en la testa por donde penetra el agua durante la imbibición, activando las enzimas que inician la germinación. También fue la entrada del tubo polínico durante la fecundación.',
  },
];

// ─────────────────────────────────────────────
// Datos: Fases de germinación
// ─────────────────────────────────────────────

interface FaseGerminacion {
  id: number;
  nombre: string;
  icono: string;
  descripcion: string;
  detalle: string;
  duracion: string;
  colorBorde: string;
}

const FASES_GERMINACION: FaseGerminacion[] = [
  {
    id: 1,
    nombre: 'Imbibición',
    icono: '💧',
    descripcion: 'La semilla absorbe agua y se hincha',
    detalle: 'El agua penetra por el micrópilo y la testa se ablanda. La semilla puede duplicar su tamaño. La hidratación activa el metabolismo celular latente.',
    duracion: '12-24 horas',
    colorBorde: '#3B82F6',
  },
  {
    id: 2,
    nombre: 'Activación enzimática',
    icono: '⚗️',
    descripcion: 'Las enzimas descomponen las reservas',
    detalle: 'Las giberelinas (hormonas) activan enzimas como la amilasa, que convierte el almidón de los cotiledones en azúcares simples. Estos nutrientes alimentan el crecimiento del embrión.',
    duracion: '24-48 horas',
    colorBorde: '#8B5CF6',
  },
  {
    id: 3,
    nombre: 'Emergencia de radícula',
    icono: '⬇️',
    descripcion: 'La raíz rompe la testa y crece hacia abajo',
    detalle: 'La radícula es la primera estructura que emerge, guiada por el geotropismo positivo (gravedad). Se ancla al suelo y empieza a absorber agua y minerales.',
    duracion: '2-5 días',
    colorBorde: '#EF4444',
  },
  {
    id: 4,
    nombre: 'Emergencia del tallo',
    icono: '⬆️',
    descripcion: 'El hipocótilo crece hacia la superficie',
    detalle: 'El hipocótilo o epicótilo se alarga, empujando la plúmula hacia arriba. En la germinación epigea, arrastra los cotiledones a la superficie. En la hipogea, los cotiledones quedan enterrados.',
    duracion: '3-7 días',
    colorBorde: '#10B981',
  },
  {
    id: 5,
    nombre: 'Primeras hojas',
    icono: '🍃',
    descripcion: 'Los cotiledones se abren, aparecen hojas verdaderas',
    detalle: 'Los cotiledones se abren a la luz y pueden hacer fotosíntesis temporal. Las hojas verdaderas se despliegan desde la plúmula, con forma y estructura definitiva de la especie.',
    duracion: '5-10 días',
    colorBorde: '#059669',
  },
  {
    id: 6,
    nombre: 'Plántula autónoma',
    icono: '🌿',
    descripcion: 'La planta ya no depende de la semilla',
    detalle: 'Las hojas verdaderas realizan fotosíntesis suficiente para alimentar a toda la planta. Los cotiledones se marchitan y caen. La plántula es independiente.',
    duracion: '10-21 días',
    colorBorde: '#047857',
  },
];

// ─────────────────────────────────────────────
// Datos: Factores
// ─────────────────────────────────────────────

interface EspecieCondiciones {
  especie: string;
  icono: string;
  tempOptima: string;
  diasGerminacion: string;
  necesitaLuz: string;
}

const CONDICIONES_ESPECIES: EspecieCondiciones[] = [
  { especie: 'Judía', icono: '🫘', tempOptima: '20-25°C', diasGerminacion: '5-7', necesitaLuz: 'No' },
  { especie: 'Maíz', icono: '🌽', tempOptima: '25-30°C', diasGerminacion: '7-10', necesitaLuz: 'No' },
  { especie: 'Lechuga', icono: '🥬', tempOptima: '15-20°C', diasGerminacion: '3-7', necesitaLuz: 'Sí' },
  { especie: 'Tomate', icono: '🍅', tempOptima: '20-30°C', diasGerminacion: '6-14', necesitaLuz: 'No' },
  { especie: 'Girasol', icono: '🌻', tempOptima: '20-25°C', diasGerminacion: '7-10', necesitaLuz: 'No' },
];

// ─────────────────────────────────────────────
// Datos: Curiosidades
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  cifra: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  {
    icono: '🌴',
    titulo: 'Semilla más antigua germinada',
    cifra: '2.000 años',
    detalle: 'Una palmera datilera (Phoenix dactylifera) de Masada, Israel, germinó con éxito a partir de semillas halladas en excavaciones arqueológicas.',
  },
  {
    icono: '🥥',
    titulo: 'Semilla más grande',
    cifra: 'Hasta 25 kg',
    detalle: 'El coco de mar (Lodoicea maldivica) de las islas Seychelles produce la semilla más grande del mundo vegetal.',
  },
  {
    icono: '🌺',
    titulo: 'Semilla más pequeña',
    cifra: '~0,001 mg',
    detalle: 'Las semillas de orquídea son tan diminutas como polvo. Son tan ligeras que se dispersan con el viento a grandes distancias.',
  },
  {
    icono: '🔥',
    titulo: 'Germinación por fuego',
    cifra: 'Pirófitas',
    detalle: 'Algunas semillas necesitan fuego para germinar: piñas de Banksia, eucalipto y ciertas pinos liberan sus semillas solo tras un incendio forestal.',
  },
  {
    icono: '🏔️',
    titulo: 'Bóveda de Svalbard',
    cifra: '1,1 M muestras',
    detalle: 'La Bóveda Global de Semillas de Svalbard (Noruega) almacena 1,1 millones de muestras de semillas a -18°C como seguro contra catástrofes.',
  },
  {
    icono: '🌻',
    titulo: 'Semillas por girasol',
    cifra: '1.000-2.000',
    detalle: 'Un solo capítulo de girasol puede producir entre 1.000 y 2.000 semillas, cada una con potencial para convertirse en una nueva planta.',
  },
  {
    icono: '⏱️',
    titulo: 'Velocidades extremas',
    cifra: '5 días vs meses',
    detalle: 'Una judía puede germinar en 5-7 días, pero un roble puede tardar meses. Las secuoyas necesitan frío previo (estratificación) para germinar.',
  },
  {
    icono: '🦕',
    titulo: 'Dispersión animal',
    cifra: 'Endozoocoria',
    detalle: 'Algunas semillas necesitan pasar por el estómago de un animal para germinar. Los ácidos gástricos debilitan la testa y facilitan la imbibición.',
  },
];

// ─────────────────────────────────────────────
// Datos: Mono vs Dicotiledóneas
// ─────────────────────────────────────────────

interface Comparativa {
  caracteristica: string;
  monocotiledonea: string;
  dicotiledonea: string;
}

const COMPARATIVA_MONO_DICO: Comparativa[] = [
  { caracteristica: 'Cotiledones', monocotiledonea: '1', dicotiledonea: '2' },
  { caracteristica: 'Nervadura hojas', monocotiledonea: 'Paralela', dicotiledonea: 'Reticulada' },
  { caracteristica: 'Raíz', monocotiledonea: 'Fasciculada', dicotiledonea: 'Pivotante' },
  { caracteristica: 'Pétalos flores', monocotiledonea: 'Múltiplos de 3', dicotiledonea: 'Múltiplos de 4 o 5' },
  { caracteristica: 'Ejemplos', monocotiledonea: 'Maíz, trigo, arroz', dicotiledonea: 'Judía, girasol, roble' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function GerminacionPage() {
  const [seccion, setSeccion] = useState<Seccion>('anatomia');
  const [parteSeleccionada, setParteSeleccionada] = useState<string | null>(null);
  const [faseActual, setFaseActual] = useState(0);
  const [aguaActiva, setAguaActiva] = useState(true);
  const [temperatura, setTemperatura] = useState(22);
  const [datoSeleccionado, setDatoSeleccionado] = useState<number | null>(null);

  const parteActiva = PARTES_SEMILLA.find(p => p.id === parteSeleccionada);

  // Determinar si la temperatura es óptima (rango general)
  const tempOptima = temperatura >= 15 && temperatura <= 30;
  const germinaOK = aguaActiva && tempOptima;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🌱</span> Germinación</h1>
          <p className={styles.subtitle}>De la semilla a la planta: el viaje más asombroso de la naturaleza</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Título de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccion)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccion)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>
            {SECCIONES.find(s => s.id === seccion)?.subtitulo}
          </p>
        </div>

        <div className={styles.seccionContent}>
          {/* ─── SECCIÓN 1: Anatomía ─── */}
          {seccion === 'anatomia' && (
            <>
              <p className={styles.instruccion}>Pulsa en cada parte de la semilla para descubrir su función</p>

              {/* Diagrama de semilla */}
              <div className={styles.semillaContainer}>
                <div className={styles.semillaDiagrama}>
                  <div className={styles.semillaVisual}>
                    {/* Forma de semilla con partes posicionadas */}
                    <div className={styles.semillaForma}>
                      {PARTES_SEMILLA.map(parte => (
                        <button
                          key={parte.id}
                          type="button"
                          className={`${styles.parteSemilla} ${styles[`parte_${parte.id}`]} ${parteSeleccionada === parte.id ? styles.parteActiva : ''}`}
                          onClick={() => setParteSeleccionada(parteSeleccionada === parte.id ? null : parte.id)}
                          aria-pressed={parteSeleccionada === parte.id}
                          aria-label={`${parte.nombre}: ${parte.funcion}`}
                        >
                          <span className={styles.parteIcono} aria-hidden="true">{parte.icono}</span>
                          <span className={styles.parteNombre}>{parte.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalle de parte seleccionada */}
              {parteActiva && (
                <div className={styles.parteDetalle}>
                  <div className={styles.parteDetalleHeader}>
                    <span className={styles.parteDetalleIcono} aria-hidden="true">{parteActiva.icono}</span>
                    <div>
                      <h3 className={styles.parteDetalleTitulo}>{parteActiva.nombre}</h3>
                      <p className={styles.parteDetalleFuncion}>{parteActiva.funcion}</p>
                    </div>
                  </div>
                  <p className={styles.parteDetalleDesc}>{parteActiva.detalle}</p>
                </div>
              )}

              {/* Insight */}
              <div className={styles.insight}>
                <p><strong><span aria-hidden="true">💡</span> Dato clave:</strong> Una semilla es una planta completa en miniatura con su propia reserva de comida, esperando las condiciones adecuadas para despertar.</p>
              </div>

              {/* Comparativa Mono vs Dicotiledóneas */}
              <div className={styles.comparativaCard}>
                <h3 className={styles.comparativaTitulo}><span aria-hidden="true">🫘</span> Judía vs <span aria-hidden="true">🌽</span> Maíz — ¿Qué diferencia hay?</h3>
                <div className={styles.comparativaGrid}>
                  <div className={styles.comparativaCol}>
                    <span className={styles.comparativaColTitulo}>🌽 Monocotiledónea</span>
                    {COMPARATIVA_MONO_DICO.map(c => (
                      <div key={c.caracteristica} className={styles.comparativaFila}>
                        <span className={styles.comparativaLabel}>{c.caracteristica}</span>
                        <span className={styles.comparativaValor}>{c.monocotiledonea}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.comparativaCol}>
                    <span className={styles.comparativaColTitulo}>🫘 Dicotiledónea</span>
                    {COMPARATIVA_MONO_DICO.map(c => (
                      <div key={c.caracteristica} className={styles.comparativaFila}>
                        <span className={styles.comparativaLabel}>{c.caracteristica}</span>
                        <span className={styles.comparativaValor}>{c.dicotiledonea}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className={styles.comparativaNota}>
                  Las dicotiledóneas tienen 2 cotiledones que suelen emerger a la superficie. Las monocotiledóneas tienen 1 cotiledón que permanece bajo tierra.
                </p>
              </div>
            </>
          )}

          {/* ─── SECCIÓN 2: Proceso ─── */}
          {seccion === 'proceso' && (
            <>
              <p className={styles.instruccion}>Avanza fase por fase para ver el proceso completo</p>

              {/* Controles de fase */}
              <div className={styles.faseControles}>
                <button
                  type="button"
                  className={styles.faseBtn}
                  onClick={() => setFaseActual(Math.max(0, faseActual - 1))}
                  disabled={faseActual === 0}
                  aria-label="Fase anterior"
                >
                  ◀ Anterior
                </button>
                <span className={styles.faseIndicador}>
                  Fase {faseActual + 1} de {FASES_GERMINACION.length}
                </span>
                <button
                  type="button"
                  className={styles.faseBtn}
                  onClick={() => setFaseActual(Math.min(FASES_GERMINACION.length - 1, faseActual + 1))}
                  disabled={faseActual === FASES_GERMINACION.length - 1}
                  aria-label="Fase siguiente"
                >
                  Siguiente ▶
                </button>
              </div>

              {/* Visualización de la fase actual */}
              <div className={styles.faseVisual}>
                {/* Diagrama semilla/plántula */}
                <div className={styles.germinacionDiagrama}>
                  {/* Línea del suelo */}
                  <div className={styles.lineaSuelo} />

                  {/* Semilla subterránea */}
                  <div className={`${styles.semillaGerminando} ${faseActual >= 3 ? styles.semillaOculta : ''}`}>
                    <span aria-hidden="true" className={styles.semillaEmoji}>
                      {faseActual === 0 ? '🟤' : faseActual === 1 ? '🟡' : '🟠'}
                    </span>
                  </div>

                  {/* Raíz */}
                  {faseActual >= 2 && (
                    <div className={`${styles.raiz} ${styles[`raizFase${faseActual}`]}`}>
                      <span aria-hidden="true">🌿</span>
                    </div>
                  )}

                  {/* Tallo */}
                  {faseActual >= 3 && (
                    <div className={`${styles.tallo} ${styles[`talloFase${faseActual}`]}`}>
                      <span aria-hidden="true">
                        {faseActual === 3 ? '🌱' : faseActual === 4 ? '🌿' : '🪴'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tarjeta de la fase actual */}
              {(() => {
                const fase = FASES_GERMINACION[faseActual];
                return (
                  <div
                    className={styles.faseCard}
                    style={{ borderLeftColor: fase.colorBorde }}
                  >
                    <div className={styles.faseCardHeader}>
                      <span className={styles.faseCardIcono} aria-hidden="true">{fase.icono}</span>
                      <div>
                        <h3 className={styles.faseCardTitulo}>
                          Fase {fase.id}: {fase.nombre}
                        </h3>
                        <p className={styles.faseCardDesc}>{fase.descripcion}</p>
                      </div>
                    </div>
                    <p className={styles.faseCardDetalle}>{fase.detalle}</p>
                    <div className={styles.faseCardDuracion}>
                      <span aria-hidden="true">⏱️</span> <span>Duración aproximada: <strong>{fase.duracion}</strong></span>
                    </div>
                  </div>
                );
              })()}

              {/* Timeline */}
              <div className={styles.timelineContainer}>
                <h3 className={styles.timelineTitulo}>Timeline completo</h3>
                <div className={styles.timeline}>
                  {FASES_GERMINACION.map((fase, i) => (
                    <button
                      key={fase.id}
                      type="button"
                      className={`${styles.timelinePunto} ${i === faseActual ? styles.timelinePuntoActivo : ''} ${i < faseActual ? styles.timelinePuntoPasado : ''}`}
                      onClick={() => setFaseActual(i)}
                      style={{ borderColor: fase.colorBorde }}
                      aria-label={`Ir a fase ${fase.id}: ${fase.nombre}`}
                      aria-pressed={i === faseActual}
                    >
                      <span className={styles.timelinePuntoIcono} aria-hidden="true">{fase.icono}</span>
                      <span className={styles.timelinePuntoNombre}>{fase.nombre}</span>
                      <span className={styles.timelinePuntoDuracion}>{fase.duracion}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.insight}>
                <p><strong><span aria-hidden="true">💡</span> Dato clave:</strong> El momento en que la plántula hace su primera fotosíntesis marca su independencia: ya no necesita las reservas de la semilla.</p>
              </div>
            </>
          )}

          {/* ─── SECCIÓN 3: Factores ─── */}
          {seccion === 'factores' && (
            <>
              <p className={styles.instruccion}>Activa o desactiva los factores y observa el resultado</p>

              {/* Controles de factores */}
              <div className={styles.factoresGrid}>
                {/* Agua */}
                <div className={styles.factorCard}>
                  <div className={styles.factorHeader}>
                    <span className={styles.factorIcono} aria-hidden="true">💧</span>
                    <h3 className={styles.factorTitulo}>Agua</h3>
                  </div>
                  <p className={styles.factorDesc}>Sin agua no hay imbibición. Es el disparador de todo el proceso.</p>
                  <button
                    className={`${styles.factorToggle} ${aguaActiva ? styles.factorToggleOn : styles.factorToggleOff}`}
                    type="button"
                    onClick={() => setAguaActiva(!aguaActiva)}
                    aria-pressed={aguaActiva}
                    aria-label={`Agua ${aguaActiva ? 'activada' : 'desactivada'}`}
                  >
                    {aguaActiva ? '✅ Disponible' : '❌ Sin agua'}
                  </button>
                </div>

                {/* Temperatura */}
                <div className={styles.factorCard}>
                  <div className={styles.factorHeader}>
                    <span className={styles.factorIcono} aria-hidden="true">🌡️</span>
                    <h3 className={styles.factorTitulo}>Temperatura</h3>
                  </div>
                  <p className={styles.factorDesc}>Cada especie tiene un rango óptimo. Fuera de él, la germinación se detiene o ralentiza.</p>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      value={temperatura}
                      onChange={e => setTemperatura(Number(e.target.value))}
                      className={styles.slider}
                      aria-label="Temperatura en grados Celsius"
                    />
                    <span className={`${styles.sliderValor} ${tempOptima ? styles.sliderOptimo : styles.sliderFuera}`}>
                      {temperatura}°C {tempOptima ? '✅' : '⚠️'}
                    </span>
                  </div>
                  <p className={styles.factorNota}>Rango óptimo general: 15-30°C</p>
                </div>

                {/* Oxígeno */}
                <div className={styles.factorCard}>
                  <div className={styles.factorHeader}>
                    <span className={styles.factorIcono} aria-hidden="true">💨</span>
                    <h3 className={styles.factorTitulo}>Oxígeno</h3>
                  </div>
                  <p className={styles.factorDesc}>La semilla respira para obtener energía de sus reservas. Sin oxígeno, el embrión no puede crecer.</p>
                  <div className={styles.factorEstado}>
                    <span className={styles.factorEstadoIcono} aria-hidden="true">✅</span> Presente en el suelo
                  </div>
                </div>
              </div>

              {/* Resultado */}
              <div className={`${styles.resultadoGerminacion} ${germinaOK ? styles.resultadoOK : styles.resultadoKO}`} role="alert" aria-live="polite">
                <span className={styles.resultadoIcono} aria-hidden="true">
                  {germinaOK ? '🌱' : '🟤'}
                </span>
                <div>
                  <strong>{germinaOK ? '¡La semilla germina!' : 'La semilla no germina'}</strong>
                  <p className={styles.resultadoDetalle}>
                    {!aguaActiva && 'Sin agua, la testa no se ablanda y el metabolismo no se activa. '}
                    {!tempOptima && `A ${temperatura}°C, las enzimas no funcionan correctamente. `}
                    {germinaOK && 'Las condiciones son adecuadas: agua disponible, temperatura óptima y oxígeno presente.'}
                  </p>
                </div>
              </div>

              {/* Luz (factor opcional) */}
              <div className={styles.factorLuz}>
                <h3 className={styles.factorLuzTitulo}><span aria-hidden="true">💡</span> ¿Y la luz?</h3>
                <p className={styles.factorLuzDesc}>
                  La mayoría de semillas no necesitan luz para germinar (germinan bajo tierra). Sin embargo, algunas semillas pequeñas como la lechuga necesitan luz para activar el fitocromo que desencadena la germinación. Otras, como la cebolla, prefieren oscuridad.
                </p>
              </div>

              {/* Tabla de condiciones por especie */}
              <div className={styles.tablaContainer}>
                <h3 className={styles.tablaTitulo}>Condiciones óptimas por especie</h3>
                <div className={styles.tablaScroll}>
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th>Especie</th>
                        <th>Temp. óptima</th>
                        <th>Días</th>
                        <th>Luz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONDICIONES_ESPECIES.map(esp => (
                        <tr key={esp.especie}>
                          <td><span aria-hidden="true">{esp.icono}</span> {esp.especie}</td>
                          <td>{esp.tempOptima}</td>
                          <td>{esp.diasGerminacion}</td>
                          <td>{esp.necesitaLuz}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dormancia */}
              <div className={styles.insight}>
                <p><strong><span aria-hidden="true">💡</span> Dormancia:</strong> Muchas semillas no germinan aunque las condiciones sean perfectas. La dormancia es un mecanismo de supervivencia: la semilla &quot;espera&quot; a que pase el invierno, un incendio o incluso el tránsito por el sistema digestivo de un animal antes de germinar.</p>
              </div>
            </>
          )}

          {/* ─── SECCIÓN 4: Datos fascinantes ─── */}
          {seccion === 'datos' && (
            <>
              <div className={styles.datosGrid}>
                {DATOS_FASCINANTES.map((dato, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.datoCard} ${datoSeleccionado === i ? styles.datoCardActivo : ''}`}
                    onClick={() => setDatoSeleccionado(datoSeleccionado === i ? null : i)}
                    aria-pressed={datoSeleccionado === i}
                  >
                    <span className={styles.datoIcono} aria-hidden="true">{dato.icono}</span>
                    <span className={styles.datoCifra}>{dato.cifra}</span>
                    <span className={styles.datoEtiqueta}>{dato.titulo}</span>
                    {datoSeleccionado === i && (
                      <span className={styles.datoDetalle}>{dato.detalle}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className={styles.insight}>
                <p><strong><span aria-hidden="true">💡</span> Dato clave:</strong> Algunas semillas necesitan pasar por el estómago de un animal para germinar. Los ácidos gástricos debilitan la testa, facilitando la imbibición.</p>
              </div>

              {/* Comparativa Mono vs Dico resumida */}
              <div className={styles.comparativaCard}>
                <h3 className={styles.comparativaTitulo}>Monocotiledóneas vs Dicotiledóneas</h3>
                <div className={styles.comparativaGrid}>
                  <div className={styles.comparativaCol}>
                    <span className={styles.comparativaColTitulo}>🌽 Monocotiledónea</span>
                    {COMPARATIVA_MONO_DICO.slice(0, 3).map(c => (
                      <div key={c.caracteristica} className={styles.comparativaFila}>
                        <span className={styles.comparativaLabel}>{c.caracteristica}</span>
                        <span className={styles.comparativaValor}>{c.monocotiledonea}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.comparativaCol}>
                    <span className={styles.comparativaColTitulo}>🫘 Dicotiledónea</span>
                    {COMPARATIVA_MONO_DICO.slice(0, 3).map(c => (
                      <div key={c.caracteristica} className={styles.comparativaFila}>
                        <span className={styles.comparativaLabel}>{c.caracteristica}</span>
                        <span className={styles.comparativaValor}>{c.dicotiledonea}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 ¿Quieres saber más sobre germinación?"
          subtitle="Conceptos clave de biología vegetal"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es la germinación?</h2>
            <p>
              La germinación es el proceso por el cual una semilla pasa de un estado de latencia (vida en suspenso) a una plántula activa capaz de alimentarse por sí misma. Es uno de los procesos más fundamentales de la biología vegetal y la base de la agricultura.
            </p>

            <h2>¿Cuánto puede durar una semilla sin germinar?</h2>
            <p>
              La mayoría de semillas mantienen su viabilidad entre 1 y 10 años en condiciones normales. Sin embargo, algunas especies pueden permanecer latentes durante siglos. El récord verificado es una palmera datilera de 2.000 años hallada en Masada (Israel) que germinó con éxito en 2005.
            </p>

            <h2>Germinación epigea vs hipogea</h2>
            <p>
              En la germinación <strong>epigea</strong> (judía, girasol), los cotiledones emergen a la superficie y realizan fotosíntesis temporal. En la <strong>hipogea</strong> (maíz, guisante), los cotiledones permanecen bajo tierra y solo el epicótilo emerge. Ambas estrategias tienen ventajas evolutivas según el entorno.
            </p>

            <h2>¿Por qué importa la germinación?</h2>
            <p>
              Toda la agricultura depende de la germinación. Comprender sus mecanismos permite mejorar las tasas de germinación, conservar semillas en bancos genéticos, restaurar ecosistemas degradados y desarrollar cultivos más resistentes al cambio climático.
            </p>

            <div className={styles.warningBox}>
              <strong><span aria-hidden="true">⚠️</span> Nota educativa:</strong> Este visualizador es una herramienta educativa. Los tiempos y condiciones de germinación son aproximados y varían significativamente entre especies, variedades y condiciones ambientales específicas.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-germinacion')} />
        <ShareCard appName="visualizador-germinacion" />
        <Footer appName="visualizador-germinacion" />
    </div>
  );
}
