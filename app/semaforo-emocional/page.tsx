'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './SemaforoEmocional.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// Tipos y constantes
// ============================================

type EstadoId = 'rojo' | 'amarillo' | 'verde';

interface Estrategia {
  emoji: string;
  texto: string;
}

interface EstadoConfig {
  id: EstadoId;
  emoji: string;
  etiqueta: string;
  descripcion: string;
  color: string;
  colorClaro: string;
  colorBorde: string;
  estrategias: Estrategia[];
}

interface RegistroHistorial {
  estado: EstadoId;
  hora: string;
  timestamp: number;
}

const ESTADOS: EstadoConfig[] = [
  {
    id: 'rojo',
    emoji: '🔴',
    etiqueta: 'MUY ACTIVADO',
    descripcion: 'Me siento desbordado, enfadado o muy nervioso',
    color: '#DC2626',
    colorClaro: '#FEF2F2',
    colorBorde: '#FECACA',
    estrategias: [
      { emoji: '🤲', texto: 'Para. Respira hondo despacio' },
      { emoji: '💧', texto: 'Bebe agua con calma' },
      { emoji: '🚶', texto: 'Camina o muévete un poco' },
      { emoji: '🎵', texto: 'Escucha música suave' },
      { emoji: '🧊', texto: 'Sostén algo frío en las manos' },
    ],
  },
  {
    id: 'amarillo',
    emoji: '🟡',
    etiqueta: 'ACTIVADO',
    descripcion: 'Estoy nervioso, inquieto o me cuesta concentrarme',
    color: '#D97706',
    colorClaro: '#FFFBEB',
    colorBorde: '#FDE68A',
    estrategias: [
      { emoji: '🫁', texto: 'Respira profundo tres veces' },
      { emoji: '🧘', texto: 'Siéntate y para un momento' },
      { emoji: '✏️', texto: 'Escribe cómo te sientes' },
      { emoji: '🗣️', texto: 'Cuéntaselo a alguien de confianza' },
      { emoji: '🌿', texto: 'Mira por la ventana un instante' },
    ],
  },
  {
    id: 'verde',
    emoji: '🟢',
    etiqueta: 'TRANQUILO',
    descripcion: 'Me siento bien, calmado y listo',
    color: '#16A34A',
    colorClaro: '#F0FDF4',
    colorBorde: '#BBF7D0',
    estrategias: [
      { emoji: '😊', texto: '¡Estás en un buen momento!' },
      { emoji: '📚', texto: 'Buen momento para aprender' },
      { emoji: '🤝', texto: 'Conéctate con otras personas' },
      { emoji: '🎯', texto: 'Puedes abordar tareas importantes' },
      { emoji: '💪', texto: 'Recuerda cómo te sientes ahora' },
    ],
  },
];

const HISTORIAL_KEY = 'meskeia-semaforo-historial';

// ============================================
// Componente principal
// ============================================

export default function SemaforoEmocionalPage() {
  const [estadoActual, setEstadoActual] = useState<EstadoId | null>(null);
  const [historial, setHistorial] = useState<RegistroHistorial[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Cargar historial de localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORIAL_KEY);
      if (raw) setHistorial(JSON.parse(raw) as RegistroHistorial[]);
    } catch { /* ignorar */ }
  }, []);

  const seleccionarEstado = useCallback((id: EstadoId) => {
    setEstadoActual(id);

    const registro: RegistroHistorial = {
      estado: id,
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };

    setHistorial(prev => {
      const nuevo = [registro, ...prev].slice(0, 8);
      try { localStorage.setItem(HISTORIAL_KEY, JSON.stringify(nuevo)); } catch { /* ignorar */ }
      return nuevo;
    });
  }, []);

  const limpiarHistorial = useCallback(() => {
    setHistorial([]);
    try { localStorage.removeItem(HISTORIAL_KEY); } catch { /* ignorar */ }
  }, []);

  const estadoConfig = ESTADOS.find(e => e.id === estadoActual) ?? null;

  const emojiHistorial: Record<EstadoId, string> = { rojo: '🔴', amarillo: '🟡', verde: '🟢' };
  const etiquetaHistorial: Record<EstadoId, string> = { rojo: 'Muy activado', amarillo: 'Activado', verde: 'Tranquilo' };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🚦 Semáforo Emocional</h1>
        <p className={styles.subtitle}>
          Pulsa cómo te sientes ahora mismo.
          Te mostraremos estrategias para este momento.
        </p>
      </header>

      <LegalNotice />

      {/* ---- SEMÁFORO ---- */}
      <section className={styles.semaforoSection} aria-label="Selector de estado emocional">
        <div className={styles.semaforoGrid}>
          {ESTADOS.map(estado => (
            <button
              key={estado.id}
              type="button"
              className={`${styles.estadoBtn} ${estadoActual === estado.id ? styles.estadoBtnActivo : ''}`}
              onClick={() => seleccionarEstado(estado.id)}
              aria-pressed={estadoActual === estado.id}
              aria-label={`${estado.etiqueta}: ${estado.descripcion}`}
              style={estadoActual === estado.id
                ? { backgroundColor: estado.colorClaro, borderColor: estado.color, boxShadow: `0 0 0 4px ${estado.colorBorde}` }
                : {}}
            >
              <span className={styles.estadoEmoji} aria-hidden="true">{estado.emoji}</span>
              <span className={styles.estadoEtiqueta}>{estado.etiqueta}</span>
              <span className={styles.estadoDesc}>{estado.descripcion}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ---- PANEL DE ESTRATEGIAS ---- */}
      {estadoConfig && (
        <section
          className={styles.estrategiasPanel}
          aria-label={`Estrategias para el estado ${estadoConfig.etiqueta}`}
          style={{ borderColor: estadoConfig.color, backgroundColor: estadoConfig.colorClaro }}
        >
          <h2 className={styles.estrategiasTitulo} style={{ color: estadoConfig.color }}>
            {estadoConfig.emoji} ¿Qué puedes hacer ahora?
          </h2>
          <div className={styles.estrategiasGrid}>
            {estadoConfig.estrategias.map((est, i) => (
              <div key={i} className={styles.estrategiaCard}>
                <span className={styles.estrategiaEmoji} aria-hidden="true">{est.emoji}</span>
                <span className={styles.estrategiaTexto}>{est.texto}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- HISTORIAL ---- */}
      {historial.length > 0 && (
        <section className={styles.historialSeccion} aria-label="Historial del día">
          <div className={styles.historialHeader}>
            <button
              type="button"
              className={styles.historialToggle}
              onClick={() => setMostrarHistorial(p => !p)}
              aria-expanded={mostrarHistorial}
            >
              📋 Historial del día ({historial.length})
              <span className={styles.toggleFlecha} aria-hidden="true">{mostrarHistorial ? '▲' : '▼'}</span>
            </button>
            <button
              type="button"
              className={styles.btnLimpiar}
              onClick={limpiarHistorial}
              aria-label="Limpiar historial"
            >
              🗑️ Limpiar
            </button>
          </div>

          {mostrarHistorial && (
            <div className={styles.historialLista} role="list">
              {historial.map((r, i) => (
                <div key={i} className={styles.historialItem} role="listitem">
                  <span className={styles.historialEmoji} aria-hidden="true">{emojiHistorial[r.estado]}</span>
                  <span className={styles.historialEtiqueta}>{etiquetaHistorial[r.estado]}</span>
                  <span className={styles.historialHora}>{r.hora}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- AVISO ---- */}
      <div className={styles.avisoBox}>
        <h3>⚠️ Aviso importante</h3>
        <p>Esta herramienta es un <strong>apoyo visual para la autogestión emocional</strong>. No es un diagnóstico ni sustituye la atención de un profesional de salud mental. Si las dificultades de regulación emocional son frecuentes o intensas, consulta con un psicólogo, terapeuta o médico especializado.</p>
      </div>

      {/* ---- SECCIÓN EDUCATIVA ---- */}
      <EducationalSection
        title="📚 Guía para familias, educadores y terapeutas"
        subtitle="Cómo usar el semáforo emocional con eficacia"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa de herramientas de regulación emocional</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Semáforo meskeIA</th>
                  <th>Otras opciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Acceso</td>
                  <td className={styles.celdaDestacada}>✅ Digital, siempre disponible</td>
                  <td>Material físico, solo en el aula, o app de pago</td>
                </tr>
                <tr>
                  <td>Estrategias</td>
                  <td className={styles.celdaDestacada}>✅ 5 por estado, integradas</td>
                  <td>Dependen del adulto o requieren formación adicional</td>
                </tr>
                <tr>
                  <td>Historial del día</td>
                  <td className={styles.celdaDestacada}>✅ Hasta 8 registros</td>
                  <td>Manual, de pago o inexistente</td>
                </tr>
                <tr>
                  <td>Coste</td>
                  <td className={styles.celdaDestacada}>✅ Gratis</td>
                  <td>Libro, material o formación (coste variable)</td>
                </tr>
                <tr>
                  <td>Funciona offline</td>
                  <td className={styles.celdaDestacada}>✅ Sí, sin internet</td>
                  <td>Depende del formato (físico sí, apps varía)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.guiaSeccion}>
          <h2>Quién puede beneficiarse y cómo</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>👦</div>
              <h3>Niño con autismo en casa</h3>
              <p>Los padres abren el semáforo antes de actividades potencialmente difíciles (salidas, cambios de rutina). El niño pulsa cómo se siente y la familia adapta la transición según el estado. Reduce crisis porque hay un canal de comunicación claro.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>🎒</div>
              <h3>Adolescente con TDAH en el colegio</h3>
              <p>El tutor o PT tiene el semáforo en una tablet. El alumno lo consulta al llegar al aula o antes de un examen. Sirve como ritual de entrada que activa la consciencia emocional y ayuda al docente a ajustar el nivel de exigencia.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>💼</div>
              <h3>Adulto con ansiedad laboral</h3>
              <p>Lo usa como check-in emocional al llegar al trabajo. Si selecciona amarillo o rojo, aplica las estrategias antes de entrar a una reunión importante. Le da autonomía para gestionar su estado sin depender de otras personas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>🧑‍⚕️</div>
              <h3>Educador o terapeuta en sesión</h3>
              <p>Usa el semáforo al inicio y final de cada sesión para objetivar el estado del usuario. El historial exportable (visualmente) permite identificar patrones a lo largo de días o semanas, muy útil para informes y seguimiento.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué hago si el usuario siempre pulsa el mismo color?</dt>
              <dd>Es información valiosa, no un problema. Si siempre pulsa rojo, puede que tenga dificultades para identificar estados intermedios, o que su entorno genere mucha activación. Trabajar la diferenciación de estados con el terapeuta es el siguiente paso.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es válido para adultos o solo para niños?</dt>
              <dd>Completamente válido para adultos. El formato visual y simple es especialmente útil para adultos con autismo, TDAH o ansiedad que no han desarrollado consciencia emocional verbal. También lo usan adultos neurotípicos como check-in rápido.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo combinarlo con otras técnicas de regulación?</dt>
              <dd>Funciona muy bien junto con la guía de respiración (para el estado rojo), el temporizador visual (para gestionar el tiempo de las estrategias) y el planificador de rutinas (para incluirlo como paso habitual del día).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Funciona sin internet?</dt>
              <dd>Sí. Una vez cargada la página, funciona completamente offline. El historial se guarda en el dispositivo (localStorage), no en ningún servidor externo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Los datos del historial son privados?</dt>
              <dd>Totalmente. El historial solo existe en el navegador del dispositivo. No se envía ningún dato a ningún servidor. Al borrar la caché del navegador o pulsar "Limpiar historial", los datos desaparecen definitivamente.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Desde qué edad se puede usar?</dt>
              <dd>A partir de unos 4-5 años cuando el niño ya puede asociar un color con un estado emocional. La introducción debe hacerse en momentos de calma y con acompañamiento adulto. Los conceptos de "activado" y "tranquilo" son accesibles a edades tempranas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay con la terapia psicológica real?</dt>
              <dd>Esta herramienta es un apoyo para la toma de consciencia y el autorregulación puntual. No evalúa, no diagnostica ni trata ninguna condición. La terapia psicológica trabaja causas profundas, patrones de conducta y estrategias personalizadas. Son complementarios, no sustitutos.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo usar el historial en la consulta del terapeuta?</dt>
              <dd>El historial muestra las últimas 8 selecciones del día con la hora. En sesión, el terapeuta puede preguntar "¿a qué hora estabas en rojo y qué pasó?" para conectar el registro con situaciones concretas y trabajar estrategias específicas.</dd>
            </div>
          </dl>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo introducir el semáforo con un usuario nuevo</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Preséntalo siempre en verde</strong>
                <p>La primera vez que muestres el semáforo, el usuario debe estar tranquilo. Nunca lo introduzcas durante o justo después de una crisis. La calma es el contexto ideal para aprender algo nuevo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Explica los colores con ejemplos concretos y personales</strong>
                <p>Usa situaciones reales del usuario: "El rojo es como cuando pierdes la tablet y te enfadas mucho. El verde es como cuando estás viendo tu serie favorita."</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Practica nombrando el estado actual</strong>
                <p>Pregunta "¿Cómo estás ahora mismo?" y acompáñale a pulsar el color. Al principio el adulto puede modelar pulsando él mismo y verbalizar: "Yo ahora estoy en verde porque..."</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Haz role-playing con situaciones conocidas</strong>
                <p>Propón escenarios: "Si mañana hay una tarea difícil en el cole, ¿en qué color crees que estarás?" Esto trabaja la anticipación emocional, muy útil en autismo y TDAH.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Practica las estrategias de cada color juntos</strong>
                <p>No basta con leer las estrategias: pruébalas físicamente. Haced la respiración del estado amarillo juntos, o sostened un vaso frío para el rojo. El cuerpo aprende haciendo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Coloca un acceso fácil en el dispositivo habitual</strong>
                <p>Crea un acceso directo en la pantalla de inicio del móvil o tablet. El semáforo debe estar a un toque de distancia para ser útil en el momento de necesidad real.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Celebra cada vez que el usuario lo usa de forma autónoma</strong>
                <p>El objetivo final es que el usuario lo use solo, sin que el adulto lo proponga. Cada uso autónomo es un logro de autorregulación que merece reconocimiento explícito.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.guiaSeccion}>
          <h2>Mejores prácticas para familias y educadores</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🌅</div>
              <h3>Úsalo como ritual diario</h3>
              <p>Incorporarlo al inicio del día o de cada actividad importante normaliza la consciencia emocional y reduce la resistencia en momentos de crisis.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🤝</div>
              <h3>Valida siempre la emoción primero</h3>
              <p>Antes de proponer estrategias, di "entiendo que estás en rojo". La validación emocional es más eficaz que pasar directamente a las técnicas de calma.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>📊</div>
              <h3>Revisa el historial sin juicios</h3>
              <p>Usa el historial para identificar patrones ("parece que los lunes hay muchos rojos"). No como control, sino como información compartida entre el usuario y el adulto.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🔗</div>
              <h3>Conecta con estrategias físicas</h3>
              <p>Las estrategias más eficaces combinan movimiento y respiración. Conectar el semáforo con la guía de respiración o salidas breves al exterior multiplica su efectividad.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🌡️</div>
              <h3>Úsalo de forma anticipatoria</h3>
              <p>El mayor valor no es en la crisis, sino antes: "¿Cómo crees que estarás en la excursión de mañana?" prepara al usuario para activar estrategias preventivas.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🎨</div>
              <h3>Adapta el vocabulario a la persona</h3>
              <p>Las etiquetas del semáforo pueden ajustarse verbalmente: "muy activado" puede ser "explosivo" para un adolescente o "muy fuerte" para un niño pequeño. Lo importante es que el usuario lo entienda.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning box */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3>⚠️ Aspectos importantes para usar esta herramienta bien</h3>
            <ul>
              <li><strong>No forzar a cambiar de estado:</strong> si el usuario está en rojo, su emoción es válida. El objetivo es acompañar, no suprimir. Forzar un cambio puede generar más activación y desconfianza en la herramienta.</li>
              <li><strong>No usarlo como sistema de control o castigo:</strong> el semáforo no es un semáforo de comportamiento. No asociarlo con consecuencias negativas ("si estás en rojo no puedes..."). Perderá toda su función reguladora.</li>
              <li><strong>No sustituye la evaluación ni la terapia psicológica:</strong> si las dificultades de regulación emocional son frecuentes o intensas, es necesaria la intervención de un profesional de salud mental o un neuropsicólogo.</li>
              <li><strong>El historial es orientativo, no diagnóstico:</strong> los registros del semáforo reflejan autopercepción en un momento dado, no un estado clínico. No deben usarse como base para diagnósticos o decisiones médicas.</li>
              <li><strong>Introducirlo en entornos tranquilos:</strong> abrir el semáforo en mitad de una crisis severa puede aumentar la activación. Es una herramienta preventiva y de toma de consciencia, no de intervención en crisis aguda.</li>
              <li><strong>Validar siempre la emoción antes de proponer estrategias:</strong> el mensaje "lo que sientes tiene sentido" es más regulador que cualquier técnica. Sin validación, las estrategias se perciben como un intento de ignorar la emoción.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('semaforo-emocional')} />
      <ShareCard appName="semaforo-emocional" />
      <Footer appName="semaforo-emocional" />
    </div>
  );
}
