'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCerebroEmociones.module.css';
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

type Seccion = 'estructuras' | 'neurotransmisores' | 'circuitos' | 'regulacion';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const SECCIONES: SeccionInfo[] = [
  { id: 'estructuras', titulo: 'Estructuras', icono: '🧠', subtitulo: 'Sistema límbico' },
  { id: 'neurotransmisores', titulo: 'Neurotransmisores', icono: '⚗️', subtitulo: 'Moléculas emocionales' },
  { id: 'circuitos', titulo: 'Circuitos', icono: '⚡', subtitulo: 'Miedo y recompensa' },
  { id: 'regulacion', titulo: 'Regulación', icono: '🎛️', subtitulo: '4 estrategias' },
];

interface EstructuraInfo {
  id: string;
  nombre: string;
  icono: string;
  emocionAsociada: string;
  funcion: string;
  datoClave: string;
  color: string;
}

const ESTRUCTURAS: EstructuraInfo[] = [
  {
    id: 'amigdala',
    nombre: 'Amígdala',
    icono: '🔴',
    emocionAsociada: 'Miedo · Amenaza',
    funcion:
      'Detecta amenazas en menos de 100 ms, antes de que seas consciente. Dos almendras de tejido en el lóbulo temporal medial que procesan el miedo y activan la respuesta de emergencia.',
    datoClave:
      'El "secuestro amigdalar" ocurre cuando la amígdala anula el control prefrontal → reacción emocional explosiva sin pensamiento racional.',
    color: '#e74c3c',
  },
  {
    id: 'hipocampo',
    nombre: 'Hipocampo',
    icono: '🟠',
    emocionAsociada: 'Memoria emocional',
    funcion:
      'Consolida recuerdos explícitos y da contexto espacial y temporal a las experiencias emocionales. Trabaja con la amígdala para crear memorias con carga afectiva.',
    datoClave:
      'En el PTSD, la amígdala hiperactivada graba recuerdos traumáticos con intensidad patológica mientras el hipocampo pierde capacidad de contextualizarlos.',
    color: '#e67e22',
  },
  {
    id: 'hipotalamo',
    nombre: 'Hipotálamo',
    icono: '🟡',
    emocionAsociada: 'Reacción física',
    funcion:
      'Recibe señales de la amígdala y activa el sistema nervioso autónomo: taquicardia, sudoración, tensión muscular. Es el puente entre emoción y respuesta corporal.',
    datoClave:
      'El hipotálamo activa el eje HPA (hipotálamo-hipófisis-adrenal) liberando cortisol, la hormona del estrés crónico.',
    color: '#f1c40f',
  },
  {
    id: 'cingulada',
    nombre: 'Corteza cingulada anterior',
    icono: '🟢',
    emocionAsociada: 'Conflicto · Dolor social',
    funcion:
      'Detecta conflictos entre emociones y razón, regula el dolor emocional. Se activa tanto ante dolor físico como ante rechazo social (ambos "duelen" de verdad).',
    datoClave:
      'El paracetamol reduce la activación de la cingulada ante el dolor social, igual que ante el dolor físico.',
    color: '#27ae60',
  },
  {
    id: 'insula',
    nombre: 'Ínsula',
    icono: '🔵',
    emocionAsociada: 'Asco · Interoception',
    funcion:
      'Procesa señales del cuerpo (latidos, respiración, sensaciones viscerales) y las traduce en sentimientos subjetivos. Base de la "intuición visceral" y el asco moral.',
    datoClave:
      'Las personas con mayor activación de la ínsula tienen más empatía y son mejores detectando sus propias emociones.',
    color: '#2980b9',
  },
];

interface NeurotransmisorInfo {
  id: string;
  nombre: string;
  icono: string;
  emocionPrincipal: string;
  queLoActiva: string;
  deficit: string;
  exceso: string;
  modulador: string;
  color: string;
}

const NEUROTRANSMISORES: NeurotransmisorInfo[] = [
  {
    id: 'dopamina',
    nombre: 'Dopamina',
    icono: '🎯',
    emocionPrincipal: 'Anticipación · Motivación',
    queLoActiva: 'Recompensas inesperadas, logros, novedad. Sistema mesolímbico: área tegmental ventral → núcleo accumbens.',
    deficit: 'Anhedonia (incapacidad de sentir placer), depresión, falta de motivación, Parkinson.',
    exceso: 'Esquizofrenia, comportamientos compulsivos, adicción (la dopamina se activa con la anticipación, no con el placer).',
    modulador: 'Ejercicio, logros pequeños, alimentos ricos en tirosina. Fármacos: L-DOPA, metilfenidato.',
    color: '#9b59b6',
  },
  {
    id: 'serotonina',
    nombre: 'Serotonina',
    icono: '☀️',
    emocionPrincipal: 'Estado de ánimo · Calma',
    queLoActiva: 'Luz solar, ejercicio, contacto social, alimentos con triptófano (pavo, plátano, nueces).',
    deficit: 'Depresión, ansiedad, trastornos del sueño, irritabilidad. El 90% se produce en el intestino.',
    exceso: 'Síndrome serotoninérgico (agitación, confusión, fiebre) — raro, solo con combinación de fármacos.',
    modulador: 'SSRIs (fluoxetina, sertralina): bloquean la recaptación → más serotonina disponible.',
    color: '#f39c12',
  },
  {
    id: 'noradrenalina',
    nombre: 'Noradrenalina',
    icono: '⚡',
    emocionPrincipal: 'Alerta · Estrés',
    queLoActiva: 'Situaciones de amenaza o novedad. Junto con adrenalina, activa la respuesta fight-or-flight.',
    deficit: 'Fatiga, falta de atención, depresión (especialmente anhedonia y pérdida de energía).',
    exceso: 'Ansiedad, hipertensión, insomnio, PTSD (sistema de alarma siempre activo).',
    modulador: 'Beta-bloqueantes reducen efectos físicos. SNRIs actúan sobre serotonina + noradrenalina.',
    color: '#e74c3c',
  },
  {
    id: 'oxitocina',
    nombre: 'Oxitocina',
    icono: '💛',
    emocionPrincipal: 'Vínculo · Confianza',
    queLoActiva: 'Contacto físico, abrazos, parto, lactancia, interacción social positiva.',
    deficit: 'Dificultades para crear vínculos, mayor desconfianza, menor empatía.',
    exceso: 'En exceso puede aumentar el favoritismo por el endogrupo y la desconfianza hacia extraños.',
    modulador: 'Mascotas, música, contacto físico, yoga. Investigación activa sobre spray nasal (resultados mixtos).',
    color: '#e91e63',
  },
  {
    id: 'endorfinas',
    nombre: 'Endorfinas',
    icono: '🏃',
    emocionPrincipal: 'Euforia · Analgesia',
    queLoActiva: 'Ejercicio intenso, risa, música, picante (capsaicina). El "runner\'s high" combina endorfinas + endocannabinoides.',
    deficit: 'Mayor sensibilidad al dolor, humor bajo, menos resiliencia al estrés.',
    exceso: 'Prácticamente imposible por vías naturales. Los opioides sintéticos imitan su acción y causan adicción.',
    modulador: 'Ejercicio aeróbico sostenido (>20 min), risa genuina, chocolate oscuro.',
    color: '#27ae60',
  },
  {
    id: 'gaba',
    nombre: 'GABA',
    icono: '🛡️',
    emocionPrincipal: 'Calma · Inhibición',
    queLoActiva: 'Es el principal neurotransmisor inhibidor. Reduce la actividad neuronal excesiva y la ansiedad.',
    deficit: 'Ansiedad, convulsiones, insomnio, irritabilidad. Muchos trastornos de ansiedad implican déficit de GABA.',
    exceso: 'Sedación excesiva, problemas de memoria, en extremo: coma (sobredosis de benzodiacepinas).',
    modulador: 'Benzodiacepinas (diazepam) y zolpidem potencian el GABA. Té verde (L-teanina) tiene efecto suave.',
    color: '#2e86ab',
  },
];

type CircuitoId = 'miedo' | 'recompensa';

interface CircuitoInfo {
  id: CircuitoId;
  nombre: string;
  icono: string;
  descripcion: string;
  viaRapida: string[];
  viaLenta: string[];
  viaRapidaLabel: string;
  viaLentaLabel: string;
  aprendizaje: string;
}

const CIRCUITOS: CircuitoInfo[] = [
  {
    id: 'miedo',
    nombre: 'Circuito del Miedo',
    icono: '😰',
    descripcion:
      'El cerebro tiene dos rutas para procesar el miedo: una rápida e imprecisa y una lenta pero precisa. Joseph LeDoux las llamó "low road" y "high road".',
    viaRapida: ['Estímulo sensorial', 'Tálamo', 'Amígdala', 'Respuesta inmediata'],
    viaLenta: ['Estímulo sensorial', 'Tálamo', 'Corteza sensorial', 'Amígdala', 'Respuesta precisa'],
    viaRapidaLabel: 'Vía rápida — "¿Es una serpiente?" (<100 ms, imprecisa)',
    viaLentaLabel: 'Vía lenta — "Es una rama" (~200 ms, precisa)',
    aprendizaje:
      'La terapia de exposición aprovecha la extinción del miedo: exposición repetida sin consecuencias crea nuevas sinapsis en la vmPFC que inhiben la amígdala.',
  },
  {
    id: 'recompensa',
    nombre: 'Circuito de Recompensa',
    icono: '🏆',
    descripcion:
      'El sistema mesolímbico libera dopamina en respuesta a recompensas y, sobre todo, a la anticipación de recompensas. Es la base de la motivación y la adicción.',
    viaRapida: ['Recompensa inesperada', 'Área tegmental ventral (VTA)', 'Núcleo accumbens', 'Motivación · Placer'],
    viaLenta: ['Estímulo predictor', 'VTA (dopamina predictiva)', 'Corteza prefrontal', 'Planificación · Decisión'],
    viaRapidaLabel: 'Señal de recompensa inesperada (pico de dopamina)',
    viaLentaLabel: 'Señal predictiva — dopamina se adelanta al estímulo',
    aprendizaje:
      'La adicción secuestra este circuito: las drogas liberan 2-10 veces más dopamina que las recompensas naturales, remodelando el núcleo accumbens para que solo responda a la droga.',
  },
];

interface EstrategiaInfo {
  id: string;
  nombre: string;
  icono: string;
  zonaActiva: string;
  eficaciaCorto: number;
  eficaciaLargo: number;
  descripcion: string;
  ejemplo: string;
  colorEficacia: string;
}

const ESTRATEGIAS: EstrategiaInfo[] = [
  {
    id: 'reevaluacion',
    nombre: 'Reevaluación cognitiva',
    icono: '🔄',
    zonaActiva: 'Corteza prefrontal dorsolateral (dlPFC)',
    eficaciaCorto: 70,
    eficaciaLargo: 90,
    descripcion:
      'Reinterpretar el significado de una situación para cambiar su impacto emocional. El PFC inhibe la amígdala al cambiar la narrativa interna.',
    ejemplo: '"Perder este trabajo es una oportunidad para encontrar algo mejor" en lugar de "mi carrera ha terminado".',
    colorEficacia: '#27ae60',
  },
  {
    id: 'aceptacion',
    nombre: 'Aceptación',
    icono: '🌊',
    zonaActiva: 'Corteza prefrontal ventromedial (vmPFC) + ínsula',
    eficaciaCorto: 60,
    eficaciaLargo: 85,
    descripcion:
      'Observar la emoción sin intentar cambiarla ni suprimirla. Base del mindfulness. Activa la vmPFC que modula la amígdala sin luchar contra ella.',
    ejemplo: '"Noto que estoy ansioso. Es una sensación, no una verdad sobre el futuro. Puedo observarla."',
    colorEficacia: '#2e86ab',
  },
  {
    id: 'supresion',
    nombre: 'Supresión expresiva',
    icono: '🚫',
    zonaActiva: 'PFC lateral (control) — amígdala sigue activa internamente',
    eficaciaCorto: 75,
    eficaciaLargo: 25,
    descripcion:
      'Inhibir la expresión externa de la emoción. Funciona a corto plazo pero la amígdala sigue activada internamente, aumentando el estrés fisiológico con el tiempo.',
    ejemplo: '"Trago" la rabia en una reunión de trabajo. Eficaz en el momento, pero el cuerpo paga el precio.',
    colorEficacia: '#e74c3c',
  },
  {
    id: 'distraccion',
    nombre: 'Distracción',
    icono: '🎮',
    zonaActiva: 'Red frontoparietal (atención) — redirige recursos cognitivos',
    eficaciaCorto: 80,
    eficaciaLargo: 40,
    descripcion:
      'Desviar la atención hacia estímulos neutros o positivos. Muy eficaz a corto plazo pero no procesa la emoción, solo la aplaza.',
    ejemplo: 'Poner música, salir a caminar o hablar con alguien para cortar el ciclo de rumia.',
    colorEficacia: '#f39c12',
  },
];

// ─────────────────────────────────────────────
// Componentes de sección
// ─────────────────────────────────────────────

function SeccionEstructuras() {
  const [activa, setActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContenido}>
      <p className={styles.introTexto}>
        El <strong>sistema límbico</strong> es el conjunto de estructuras cerebrales que procesan las emociones, la memoria emocional y la motivación. Haz clic en cada estructura para explorarla.
      </p>

      <div className={styles.diagramaCerebro}>
        <div className={styles.cerebroBase}>
          <span className={styles.cerebroLabel}>Sistema límbico</span>
          {ESTRUCTURAS.map((e) => (
            <button
              key={e.id}
              className={`${styles.estructuraBtn} ${activa === e.id ? styles.estructuraBtnActiva : ''}`}
              style={{ '--estructura-color': e.color } as React.CSSProperties}
              onClick={() => setActiva(activa === e.id ? null : e.id)}
              aria-expanded={activa === e.id}
              aria-label={`Ver información sobre ${e.nombre}`}
            >
              <span aria-hidden="true">{e.icono}</span>
              <span>{e.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {activa && (() => {
        const est = ESTRUCTURAS.find((e) => e.id === activa);
        if (!est) return null;
        return (
          <div className={styles.estructuraDetalle} style={{ '--estructura-color': est.color } as React.CSSProperties}>
            <div className={styles.estructuraDetalleHeader}>
              <span aria-hidden="true" className={styles.estructuraDetalleIcono}>{est.icono}</span>
              <div>
                <h3 className={styles.estructuraDetalleTitulo}>{est.nombre}</h3>
                <span className={styles.estructuraDetalleEmocion}>{est.emocionAsociada}</span>
              </div>
            </div>
            <p className={styles.estructuraDetalleFuncion}>{est.funcion}</p>
            <div className={styles.datoClaveBox}>
              <span className={styles.datoClaveLabel}>💡 Dato clave</span>
              <p className={styles.datoClaveTexto}>{est.datoClave}</p>
            </div>
          </div>
        );
      })()}

      <div className={styles.triploModeloBox}>
        <h3 className={styles.triploModeloTitulo}>El modelo del cerebro trino (MacLean)</h3>
        <div className={styles.triploModeloGrid}>
          <div className={styles.triploItem}>
            <span className={styles.triploIcono}>🦎</span>
            <strong>Reptiliano</strong>
            <p>Supervivencia, respiración, ritmo cardíaco. Instintos básicos.</p>
          </div>
          <div className={styles.triploItem}>
            <span className={styles.triploIcono}>🦁</span>
            <strong>Límbico</strong>
            <p>Emociones, vínculos, memoria emocional. Compartido con mamíferos.</p>
          </div>
          <div className={styles.triploItem}>
            <span className={styles.triploIcono}>🧠</span>
            <strong>Neocórtex</strong>
            <p>Razón, lenguaje, planificación. Muy desarrollado en humanos.</p>
          </div>
        </div>
        <p className={styles.triploNota}>⚠️ Simplificación útil pero no anatómicamente precisa — el cerebro real no funciona por capas separadas.</p>
      </div>
    </div>
  );
}

function SeccionNeurotransmisores() {
  const [activo, setActivo] = useState<string | null>(null);

  return (
    <div className={styles.seccionContenido}>
      <p className={styles.introTexto}>
        Las emociones son, en parte, química. Estos 6 neurotransmisores y neuromoduladores son los principales actores del cerebro emocional.
      </p>

      <div className={styles.neuroGrid}>
        {NEUROTRANSMISORES.map((n) => (
          <button
            key={n.id}
            className={`${styles.neuroCard} ${activo === n.id ? styles.neuroCardActiva : ''}`}
            style={{ '--neuro-color': n.color } as React.CSSProperties}
            onClick={() => setActivo(activo === n.id ? null : n.id)}
            aria-expanded={activo === n.id}
          >
            <span className={styles.neuroIcono} aria-hidden="true">{n.icono}</span>
            <span className={styles.neuroNombre}>{n.nombre}</span>
            <span className={styles.neuroEmocion}>{n.emocionPrincipal}</span>
            <span className={styles.neuroToggle} aria-hidden="true">{activo === n.id ? '▲' : '▼'}</span>
          </button>
        ))}
      </div>

      {activo && (() => {
        const n = NEUROTRANSMISORES.find((x) => x.id === activo);
        if (!n) return null;
        return (
          <div className={styles.neuroDetalle} style={{ '--neuro-color': n.color } as React.CSSProperties}>
            <h3 className={styles.neuroDetalleTitulo}>
              <span aria-hidden="true">{n.icono}</span> {n.nombre}
            </h3>
            <div className={styles.neuroDetalleGrid}>
              <div className={styles.neuroDetalleItem}>
                <span className={styles.neuroDetalleLabel}>⚡ Qué lo activa</span>
                <p>{n.queLoActiva}</p>
              </div>
              <div className={styles.neuroDetalleItem}>
                <span className={styles.neuroDetalleLabel}>📉 Déficit</span>
                <p>{n.deficit}</p>
              </div>
              <div className={styles.neuroDetalleItem}>
                <span className={styles.neuroDetalleLabel}>📈 Exceso</span>
                <p>{n.exceso}</p>
              </div>
              <div className={styles.neuroDetalleItem}>
                <span className={styles.neuroDetalleLabel}>💊 Cómo modularlo</span>
                <p>{n.modulador}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function SeccionCircuitos() {
  const [circuito, setCircuito] = useState<CircuitoId>('miedo');
  const info = CIRCUITOS.find((c) => c.id === circuito) ?? CIRCUITOS[0];

  return (
    <div className={styles.seccionContenido}>
      <p className={styles.introTexto}>
        El cerebro emocional opera a través de dos grandes circuitos: el del miedo (detección de amenazas) y el de recompensa (motivación y placer). Selecciona uno para explorar el camino neuronal.
      </p>

      <div className={styles.circuitoSelector}>
        {CIRCUITOS.map((c) => (
          <button
            key={c.id}
            className={`${styles.circuitoSelectorBtn} ${circuito === c.id ? styles.circuitoSelectorBtnActivo : ''}`}
            onClick={() => setCircuito(c.id)}
          >
            <span aria-hidden="true">{c.icono}</span> {c.nombre}
          </button>
        ))}
      </div>

      <p className={styles.circuitoDescripcion}>{info.descripcion}</p>

      <div className={styles.circuitosGrid}>
        <div className={styles.circuitoVia}>
          <h4 className={styles.circuitoViaLabel}>{info.viaRapidaLabel}</h4>
          <div className={styles.circuitoFlujo}>
            {info.viaRapida.map((paso, i) => (
              <div key={i} className={styles.circuitoFlujoItem}>
                <div className={`${styles.circuitoPaso} ${styles.circuitoPasoRapido}`}
                  style={{ animationDelay: `${i * 0.15}s` }}>
                  {paso}
                </div>
                {i < info.viaRapida.length - 1 && (
                  <span className={styles.circuitoFlecha} aria-hidden="true">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.circuitoVia}>
          <h4 className={styles.circuitoViaLabel}>{info.viaLentaLabel}</h4>
          <div className={styles.circuitoFlujo}>
            {info.viaLenta.map((paso, i) => (
              <div key={i} className={styles.circuitoFlujoItem}>
                <div className={`${styles.circuitoPaso} ${styles.circuitoPasoLento}`}
                  style={{ animationDelay: `${i * 0.2}s` }}>
                  {paso}
                </div>
                {i < info.viaLenta.length - 1 && (
                  <span className={styles.circuitoFlecha} aria-hidden="true">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.warningBoxInline}>
        <span aria-hidden="true">🧬</span>
        <p>{info.aprendizaje}</p>
      </div>
    </div>
  );
}

function SeccionRegulacion() {
  const [activa, setActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContenido}>
      <p className={styles.introTexto}>
        La regulación emocional no es "no sentir" — es gestionar cómo las emociones influyen en nuestras acciones. La neurociencia identifica 4 estrategias principales con diferentes perfiles de eficacia.
      </p>

      <div className={styles.regulacionGrid}>
        {ESTRATEGIAS.map((e) => (
          <div key={e.id} className={styles.regulacionCard}>
            <button
              className={styles.regulacionCardHeader}
              onClick={() => setActiva(activa === e.id ? null : e.id)}
              aria-expanded={activa === e.id}
            >
              <span className={styles.regulacionIcono} aria-hidden="true">{e.icono}</span>
              <div className={styles.regulacionHeaderTexto}>
                <strong className={styles.regulacionNombre}>{e.nombre}</strong>
                <span className={styles.regulacionZona}>{e.zonaActiva}</span>
              </div>
              <span className={styles.regulacionToggle} aria-hidden="true">{activa === e.id ? '▲' : '▼'}</span>
            </button>

            <div className={styles.regulacionEficacia}>
              <div className={styles.regulacionBarra}>
                <span className={styles.regulacionBarraLabel}>Corto plazo</span>
                <div className={styles.regulacionBarraFondo}>
                  <div
                    className={styles.regulacionBarraRelleno}
                    style={{ width: `${e.eficaciaCorto}%`, backgroundColor: e.colorEficacia }}
                    role="progressbar"
                    aria-valuenow={e.eficaciaCorto}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Eficacia a corto plazo: ${e.eficaciaCorto}%`}
                  />
                </div>
                <span className={styles.regulacionBarraValor}>{e.eficaciaCorto}%</span>
              </div>
              <div className={styles.regulacionBarra}>
                <span className={styles.regulacionBarraLabel}>Largo plazo</span>
                <div className={styles.regulacionBarraFondo}>
                  <div
                    className={styles.regulacionBarraRelleno}
                    style={{ width: `${e.eficaciaLargo}%`, backgroundColor: e.colorEficacia }}
                    role="progressbar"
                    aria-valuenow={e.eficaciaLargo}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Eficacia a largo plazo: ${e.eficaciaLargo}%`}
                  />
                </div>
                <span className={styles.regulacionBarraValor}>{e.eficaciaLargo}%</span>
              </div>
            </div>

            {activa === e.id && (
              <div className={styles.regulacionDetalle}>
                <p>{e.descripcion}</p>
                <div className={styles.regulacionEjemploBox}>
                  <span className={styles.regulacionEjemploLabel}>💬 Ejemplo</span>
                  <p className={styles.regulacionEjemploTexto}>{e.ejemplo}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCerebroEmociones() {
  const [seccion, setSeccion] = useState<Seccion>('estructuras');

  const renderSeccion = () => {
    switch (seccion) {
      case 'estructuras': return <SeccionEstructuras />;
      case 'neurotransmisores': return <SeccionNeurotransmisores />;
      case 'circuitos': return <SeccionCircuitos />;
      case 'regulacion': return <SeccionRegulacion />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <div className={styles.heroIcono} aria-hidden="true">🧠</div>
          <h1 className={styles.heroTitulo}>El Cerebro Emocional</h1>
          <p className={styles.heroSubtitulo}>
            Amígdala, corteza prefrontal, dopamina y el circuito de las emociones
          </p>
        </header>

        <LegalNotice />

        <main className={styles.main}>
          <nav className={styles.navSecciones} role="tablist" aria-label="Secciones del visualizador">
            {SECCIONES.map((s) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={seccion === s.id}
                aria-controls={`seccion-${s.id}`}
                className={`${styles.navBtn} ${seccion === s.id ? styles.navBtnActivo : ''}`}
                onClick={() => setSeccion(s.id)}
              >
                <span aria-hidden="true">{s.icono}</span>
                <span className={styles.navBtnTitulo}>{s.titulo}</span>
                <span className={styles.navBtnSub}>{s.subtitulo}</span>
              </button>
            ))}
          </nav>

          <div
            id={`seccion-${seccion}`}
            role="tabpanel"
            aria-label={SECCIONES.find((s) => s.id === seccion)?.titulo}
            className={styles.seccionPanel}
          >
            {renderSeccion()}
          </div>
        </main>

        <EducationalSection
          title="¿Cómo procesa el cerebro las emociones?"
          subtitle="Amígdala, dopamina y los circuitos neuronales de la emoción"
        >
          {/* ── 1. Tabla comparativa ── */}
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Neurotransmisor</th>
                  <th>Emoción asociada</th>
                  <th>Dónde actúa</th>
                  <th>Síntoma por déficit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dopamina</strong></td>
                  <td>Motivación · Anticipación</td>
                  <td>Sistema mesolímbico (VTA → núcleo accumbens)</td>
                  <td>Anhedonia, apatía, depresión</td>
                </tr>
                <tr>
                  <td><strong>Serotonina</strong></td>
                  <td>Estado de ánimo · Calma</td>
                  <td>Rafe dorsal → corteza, hipocampo, amígdala</td>
                  <td>Depresión, ansiedad, insomnio</td>
                </tr>
                <tr>
                  <td><strong>Noradrenalina</strong></td>
                  <td>Alerta · Estrés agudo</td>
                  <td>Locus coeruleus → córtex y sistema límbico</td>
                  <td>Fatiga, falta de atención, depresión</td>
                </tr>
                <tr>
                  <td><strong>Oxitocina</strong></td>
                  <td>Vínculo · Confianza</td>
                  <td>Hipotálamo → amígdala, estriado ventral</td>
                  <td>Dificultad para vincularse, desconfianza</td>
                </tr>
                <tr>
                  <td><strong>Endorfinas</strong></td>
                  <td>Euforia · Analgesia</td>
                  <td>Receptores opioides en todo el SNC</td>
                  <td>Mayor sensibilidad al dolor, humor bajo</td>
                </tr>
                <tr>
                  <td><strong>GABA</strong></td>
                  <td>Calma · Inhibición</td>
                  <td>Principal inhibidor del SNC (ubicuo)</td>
                  <td>Ansiedad, convulsiones, insomnio</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── 2. Perfiles de uso ── */}
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
              <h4>Estudiante de psicología</h4>
              <p>Necesita comprender la base neurobiológica de las emociones antes de estudiar psicopatología. El visualizador le permite conectar estructuras, neurotransmisores y circuitos en un solo recorrido interactivo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">😰</span>
              <h4>Persona con ansiedad</h4>
              <p>Quiere entender por qué su amígdala parece siempre activada. Explorar el circuito del miedo y las estrategias de regulación le ayuda a normalizar sus síntomas y valorar herramientas como la reevaluación cognitiva.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">👥</span>
              <h4>Profesional de RR.HH.</h4>
              <p>Aplica regulación emocional en equipos bajo presión. Entiende por qué la supresión expresiva es eficaz a corto plazo pero dañina a largo, y por qué la reevaluación cognitiva es la estrategia más sostenible.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">📖</span>
              <h4>Docente de secundaria</h4>
              <p>Explica inteligencia emocional en el aula. Usa las secciones de estructuras y neurotransmisores para mostrar que las emociones tienen una base biológica real, no son "solo sentimientos".</p>
            </div>
          </div>

          {/* ── 3. FAQ ── */}
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿La amígdala solo procesa el miedo?</h4>
              <p>No. La amígdala procesa <strong>todas las emociones con alta carga afectiva</strong>, incluyendo alegría intensa, ira, asco y sorpresa. Su papel es detectar la relevancia emocional del estímulo, no solo las amenazas.</p>
              <span className={styles.faqTip}>Mito frecuente: "amígdala = miedo". La realidad es más amplia.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre serotonina y dopamina?</h4>
              <p>La <strong>dopamina</strong> regula la <em>anticipación</em> de recompensas y la motivación para buscarlas. La <strong>serotonina</strong> regula el estado de ánimo basal, el sueño y la saciedad. Un error común es llamar a ambas "hormona de la felicidad".</p>
              <span className={styles.faqTip}>La dopamina dispara cuando <em>esperas</em> algo bueno, no solo cuando lo recibes.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué hace exactamente la corteza prefrontal?</h4>
              <p>La corteza prefrontal (CPF) es el "ejecutivo" del cerebro emocional: planifica, evalúa consecuencias e <strong>inhibe respuestas impulsivas</strong>. La CPF ventromedial regula la amígdala; la dorsolateral gestiona la memoria de trabajo emocional. Se desarrolla completamente cerca de los 25 años.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Las emociones son universales en todos los humanos?</h4>
              <p>Paul Ekman identificó 6 emociones básicas con expresiones faciales universales (miedo, ira, asco, sorpresa, alegría, tristeza). Sin embargo, los estudios más recientes de Lisa Feldman Barrett proponen que las emociones son <strong>construcciones cerebrales</strong> influidas por la cultura y la experiencia personal.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se puede entrenar la regulación emocional?</h4>
              <p>Sí. La práctica sostenida de reevaluación cognitiva y mindfulness produce <strong>cambios estructurales</strong> en la CPF y reduce la reactividad de la amígdala. La neuroplasticidad permite reconfigurar los circuitos emocionales a lo largo de toda la vida.</p>
              <span className={styles.faqTip}>8 semanas de mindfulness producen cambios medibles en volumen del hipocampo.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el "secuestro amigdalar"?</h4>
              <p>Término acuñado por Daniel Goleman: la amígdala genera una respuesta de emergencia tan intensa que <strong>supera el control prefrontal</strong>. El resultado es una reacción emocional explosiva antes de que el razonamiento pueda intervenir. Puede durar minutos u horas.</p>
            </div>
          </div>

          {/* ── 4. Guía paso a paso ── */}
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Empieza por la amígdala</h4>
                <p>En la pestaña <em>Estructuras</em>, selecciona la amígdala. Lee su función y el dato clave sobre el secuestro amigdalar. Es el punto de partida de casi todos los circuitos emocionales.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Explora las demás estructuras del sistema límbico</h4>
                <p>Recorre hipocampo, hipotálamo, corteza cingulada e ínsula. Fíjate cómo cada una contribuye a un aspecto diferente de la experiencia emocional.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Pasa a los neurotransmisores</h4>
                <p>En la pestaña <em>Neurotransmisores</em>, haz clic en dopamina y serotonina para comparar déficit y exceso. Verás por qué no son intercambiables.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Analiza los circuitos del miedo y la recompensa</h4>
                <p>En <em>Circuitos</em>, alterna entre los dos para ver la diferencia entre la vía rápida (imprecisa) y la vía lenta (precisa). Relaciona esto con el concepto de secuestro amigdalar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Compara las estrategias de regulación</h4>
                <p>En la pestaña <em>Regulación</em>, observa los gráficos de eficacia a corto y largo plazo. La supresión expresiva puntúa alto a corto plazo pero bajo a largo: entiende por qué antes de usarla como hábito.</p>
              </div>
            </div>
          </div>

          {/* ── 5. Mejores prácticas ── */}
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Distingue emoción de sentimiento</h4>
              <p>La <em>emoción</em> es la respuesta neurobiológica automática (amígdala, hipotálamo). El <em>sentimiento</em> es la experiencia consciente subjetiva (córtex). Son procesos distintos con bases neurales diferentes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚗️</span>
              <h4>No confundas serotonina con "felicidad"</h4>
              <p>La serotonina regula el <em>estado de ánimo basal</em> y la estabilidad emocional, no produce euforia. La oxitocina tampoco es "la hormona del amor" — también puede intensificar el rechazo hacia el exogrupo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <h4>La CPF como herramienta de regulación</h4>
              <p>La corteza prefrontal puede inhibir activamente la amígdala. Técnicas como la reevaluación cognitiva, el mindfulness y la distancia psicológica fortalecen esta conexión con el uso repetido.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h4>Las emociones tienen función adaptativa</h4>
              <p>El miedo, la ira y el asco no son "malas emociones" — son señales evolutivas. El objetivo no es eliminarlas, sino regularlas para que no dominen el comportamiento de forma desadaptativa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌊</span>
              <h4>La supresión tiene un coste fisiológico</h4>
              <p>Suprimir la expresión emocional no desactiva la amígdala — solo oculta la señal al exterior. El cuerpo sigue pagando el precio en forma de mayor activación del sistema nervioso simpático.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💬</span>
              <h4>Nombrar la emoción reduce su intensidad</h4>
              <p>El proceso de "affect labeling" (etiquetar verbalmente una emoción) activa la CPF ventrolateral e inhibe la amígdala. Decir "estoy asustado" literalmente reduce la intensidad del miedo.</p>
            </div>
          </div>

          {/* ── 6. Warning box ── */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h4>Errores conceptuales frecuentes</h4>
            </div>
            <ul className={styles.warningList}>
              <li><strong>"La amígdala solo procesa el miedo"</strong> — También procesa emociones positivas intensas, la ira y el asco. Es un detector de relevancia emocional, no solo de amenazas.</li>
              <li><strong>"Las emociones son irracionales"</strong> — Tienen una base neurobiológica completamente lógica desde la perspectiva evolutiva. El problema no es tenerlas, sino no regularlas.</li>
              <li><strong>"La dopamina es la hormona del placer"</strong> — La dopamina se dispara con la <em>anticipación</em> de la recompensa, no con el placer en sí. Por eso la adicción es tan poderosa: el deseo supera al disfrute.</li>
              <li><strong>"El modelo del cerebro trino es científico"</strong> — El modelo reptiliano/límbico/neocórtex de MacLean es una simplificación didáctica útil pero anatómicamente incorrecta. El cerebro no funciona por capas separadas.</li>
              <li><strong>"La oxitocina es la hormona del amor incondicional"</strong> — En exceso, la oxitocina puede aumentar el favoritismo y la desconfianza hacia quienes percibimos como externos al grupo.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cerebro-emociones')} />
        <ShareCard appName="visualizador-cerebro-emociones" />
        <Footer appName="visualizador-cerebro-emociones" />
      </div>
    </>
  );
}
