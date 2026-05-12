'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TestSindromeImpostor.module.css';
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

/* ─── Tipos ─── */

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'autoexigencia' | 'reconocimiento';
}

interface Perfil {
  nombre: string;
  emoji: string;
  descripcion: string;
  fortalezas: string[];
  riesgos: string[];
  acciones: string[];
}

/* ─── Datos ─── */

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: 'Cuando consigo algo, pienso que he tenido suerte o que las circunstancias me han ayudado', dimension: 'autoexigencia' },
  { id: 6, texto: 'Puedo aceptar un cumplido profesional sin sentir que es inmerecido', dimension: 'reconocimiento' },
  { id: 2, texto: 'Tengo miedo de que descubran que no soy tan competente como creen', dimension: 'autoexigencia' },
  { id: 7, texto: 'Si miro hacia atrás, reconozco que he conseguido cosas difíciles gracias a mi esfuerzo y capacidad', dimension: 'reconocimiento' },
  { id: 3, texto: 'Me comparo con los mejores de mi campo y siento que estoy muy lejos', dimension: 'autoexigencia' },
  { id: 8, texto: 'Cuando cometo un error, lo veo como parte del proceso y no como prueba de incompetencia', dimension: 'reconocimiento' },
  { id: 4, texto: 'Antes de una presentación o entrega importante, me convenzo de que esta vez sí se darán cuenta de mis carencias', dimension: 'autoexigencia' },
  { id: 9, texto: 'Mis compañeros o clientes me valoran, y creo que tienen razones legítimas para hacerlo', dimension: 'reconocimiento' },
  { id: 5, texto: 'Cuando alguien me elogia, pienso que solo están siendo amables o que no conocen mi verdadero nivel', dimension: 'autoexigencia' },
  { id: 10, texto: 'Me siento cómodo diciendo "soy bueno en esto" cuando realmente lo soy', dimension: 'reconocimiento' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(autoexigencia: number, reconocimiento: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (autoexigencia >= umbralAlto && reconocimiento >= umbralAlto) {
    return {
      nombre: 'Perfeccionista Consciente',
      emoji: '🎯',
      descripcion: 'Eres muy exigente contigo mismo PERO también reconoces tus logros. Esta combinación es interesante: la autoexigencia te impulsa a mejorar, y el reconocimiento te impide caer en la espiral del impostor. Es la versión "sana" del perfeccionismo — siempre que la exigencia no se convierta en obsesión.',
      fortalezas: [
        'Autoexigencia como motor de mejora, no como fuente de ansiedad',
        'Capacidad de celebrar logros sin perder las ganas de crecer',
        'Visión realista de tus capacidades y limitaciones',
      ],
      riesgos: [
        'La línea entre perfeccionismo sano y tóxico es fina — vigílala',
        'Puedes normalizar la presión interna y no darte cuenta cuando cruza el límite',
        'Los demás pueden percibir tu exigencia como desmesurada',
      ],
      acciones: [
        'Lleva un registro semanal de logros (incluso pequeños) — la autoexigencia tiende a borrarlos de la memoria',
        'Pregúntate: "¿Mi exigencia me está ayudando a ser mejor o solo me está haciendo sentir mal?" — si es lo segundo, necesita ajuste',
        'Comparte tu proceso con alguien de confianza — verbalizar la autoexigencia ayuda a regularla',
      ],
    };
  }

  if (autoexigencia >= umbralAlto && reconocimiento < umbralBajo) {
    return {
      nombre: 'Síndrome del Impostor Activo',
      emoji: '🎭',
      descripcion: 'Te exiges mucho y no reconoces tus logros. Esta es la combinación clásica del síndrome del impostor, descrita por Pauline Clance en 1978: sensación persistente de fraude a pesar de evidencia objetiva de competencia. No es un trastorno — es un patrón de pensamiento que se puede cambiar.',
      fortalezas: [
        'Tu exigencia demuestra que te importa hacer las cosas bien',
        'En la mayoría de los casos, las personas con este patrón son más competentes de lo que creen — la brecha entre percepción y realidad suele ser el núcleo del impostor. Si tu duda viene de un puesto nuevo o un cambio reciente, también puede ser prudencia legítima mientras te asientas.',
        'Reconocer este patrón es el primer paso para cambiarlo',
      ],
      riesgos: [
        'Estrés crónico por vivir con la sensación de que "te van a pillar"',
        'Autosabotaje: rechazar oportunidades por miedo a no estar a la altura',
        'Burnout por sobrecompensar (trabajar el doble para "merecer" lo que ya tienes)',
      ],
      acciones: [
        'Crea un "archivo de evidencia": una lista de logros concretos con fechas y detalles. Cuando aparezca el impostor, lee la lista.',
        'La próxima vez que pienses "he tenido suerte", reformula: "¿Qué hice yo específicamente para que esto saliera bien?"',
        'Habla de esto con alguien — el 70% de las personas experimentan el síndrome del impostor en algún momento. No estás solo/a.',
      ],
    };
  }

  if (autoexigencia < umbralBajo && reconocimiento >= umbralAlto) {
    return {
      nombre: 'Confianza Estable',
      emoji: '💚',
      descripcion: 'No te machacas en exceso y reconoces lo que vales. Este es el perfil más equilibrado: tienes una autoestima profesional sólida que te permite asumir retos sin paralizarte y aceptar errores sin desmoronarte. No es arrogancia — es una evaluación realista de tus capacidades.',
      fortalezas: [
        'Autoevaluación realista y estable',
        'Capacidad de asumir retos sin que el miedo te paralice',
        'Resiliencia ante el error — lo ves como información, no como identidad',
      ],
      riesgos: [
        'Riesgo de complacencia si no te cuestionas periódicamente',
        'Otros pueden interpretar tu seguridad como falta de humildad (aunque no lo sea)',
        'Si el contexto cambia drásticamente, la confianza puede tardar en ajustarse',
      ],
      acciones: [
        'Aprovecha tu estabilidad para ayudar a otros que sí sufren el síndrome del impostor — tu perspectiva es valiosa',
        'Mantén el hábito de pedir feedback honesto — la confianza no debe convertirse en punto ciego',
        'Busca retos que te saquen ligeramente de tu zona de confort — la confianza se fortalece cuando la pones a prueba',
      ],
    };
  }

  if (autoexigencia < umbralBajo && reconocimiento < umbralBajo) {
    return {
      nombre: 'Desconexión Profesional',
      emoji: '😶',
      descripcion: 'Ni te exiges en exceso ni reconoces especialmente tus logros. Este perfil puede indicar desinterés, cansancio profesional o una etapa de transición donde no te identificas con tu trabajo actual. No es necesariamente negativo, pero sugiere que tu relación con tu carrera necesita atención.',
      fortalezas: [
        'No sufres la presión del impostor — tu problema es diferente',
        'Puedes redirigir tu energía hacia lo que realmente te importa',
        'Es un buen momento para reflexionar sobre qué quieres profesionalmente',
      ],
      riesgos: [
        'Falta de motivación que puede afectar al rendimiento',
        'Riesgo de estancamiento por falta de dirección',
        'Los demás pueden percibir indiferencia donde hay desconexión',
      ],
      acciones: [
        'Pregúntate honestamente: "¿Este trabajo me importa?" — la respuesta orienta las siguientes acciones',
        'Busca UNA cosa en tu trabajo actual que te haga sentir algo (orgullo, curiosidad, satisfacción) y amplíala',
        'Si llevas tiempo en esta situación y te genera malestar, considera hablar con un profesional o coach. A veces la desconexión es señal de que el trabajo no encaja contigo, y otras veces hay algo más que merece atención.',
      ],
    };
  }

  if (autoexigencia >= reconocimiento) {
    return {
      nombre: 'Tendencia al Impostor',
      emoji: '🌀',
      descripcion: 'Tu autoexigencia supera ligeramente a tu capacidad de reconocer logros. No es un síndrome del impostor completo, pero la tendencia está ahí: probablemente minimizas tus éxitos más de lo que deberías y amplificas tus fallos. Corregir esto ahora es más fácil que cuando se cronifica.',
      fortalezas: [
        'Autoexigencia moderada que puede ser productiva',
        'Algo de capacidad de reconocimiento — la base está',
        'Conciencia del patrón, lo que facilita el cambio',
      ],
      riesgos: [
        'La brecha entre exigencia y reconocimiento puede crecer con el tiempo',
        'En momentos de estrés, la tendencia se amplifica',
        'Puedes rechazar oportunidades por subestimarte',
      ],
      acciones: [
        'Al final de cada semana, escribe 3 cosas que hiciste bien — entrena el músculo del reconocimiento',
        'Cuando minimices un logro ("no es para tanto"), pregúntate: "¿Diría lo mismo si un compañero hubiera hecho esto?"',
        'Acepta el siguiente cumplido que recibas con un simple "gracias" — sin añadir "pero", "es que", o "no es nada"',
      ],
    };
  }

  return {
    nombre: 'Autoestima en Construcción',
    emoji: '🌱',
    descripcion: 'Tu reconocimiento de logros supera ligeramente a tu autoexigencia. Estás en proceso de construir una confianza profesional sólida. La dirección es buena: reconoces tu valor sin la presión excesiva que genera el impostor.',
    fortalezas: [
      'Base de autoestima profesional en crecimiento',
      'Presión interna manejable',
      'Capacidad de celebrar progreso',
    ],
    riesgos: [
      'Riesgo de no exigirte lo suficiente en momentos clave',
      'La confianza necesita alimentarse con logros reales, no solo con autoafirmación',
      'En entornos muy competitivos, puede faltar empuje',
    ],
    acciones: [
      'Busca un reto profesional que te obligue a estirarte un poco — la confianza se consolida superando dificultades',
      'Pide feedback constructivo a alguien exigente (pero justo) — te ayudará a calibrar tu autoevaluación',
      'Define qué significa "éxito" para ti en los próximos 6 meses — tenerlo claro evita la complacencia',
    ],
  };
}

/* ─── Componente ─── */

export default function TestSindromeImpostorPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const todasRespondidas = PREGUNTAS.every((p) => respuestas[p.id] !== undefined);

  const handleRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mostrarResultado) setMostrarResultado(false);
  };

  const calcularResultado = () => {
    setMostrarResultado(true);
    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const puntuacionAutoexigencia = PREGUNTAS
    .filter((p) => p.dimension === 'autoexigencia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionReconocimiento = PREGUNTAS
    .filter((p) => p.dimension === 'reconocimiento')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionAutoexigencia, puntuacionReconocimiento);

  const posX = ((puntuacionAutoexigencia - 5) / 20) * 100;
  const posY = 100 - ((puntuacionReconocimiento - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🎭 Test de Síndrome del Impostor</h1>
          <p className={styles.subtitle}>
            ¿Subestimas tu competencia real?
            <br />
            Basado en la Escala de Clance adaptada
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>🕐 3 minutos</span>
            <span className={styles.badge}>📊 10 preguntas</span>
            <span className={styles.badge}>🔒 Sin registro</span>
          </div>
        </header>

        <LegalNotice />


        <section className={styles.contextCard}>
          <p>
            En 1978, las psicólogas <strong>Pauline Clance y Suzanne Imes</strong> describieron un fenómeno
            que afecta a un porcentaje significativo de las personas en algún momento de su vida (las
            estimaciones varían entre el 9% y el 82% según el contexto y la metodología de estudio):
            la sensación persistente de que <strong>tus logros no son merecidos</strong> y de que en
            cualquier momento descubrirán que no eres tan competente como creen.
          </p>
          <p>
            No es un trastorno — es un patrón de pensamiento. Y tiene solución.
            Este test evalúa dos dimensiones: tu nivel de autoexigencia (¿te presionas más de lo razonable?)
            y tu capacidad de reconocer logros (¿aceptas que lo que consigues es mérito tuyo?).
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo te sientes en tu vida profesional
          </h2>
          <p className={styles.sectionSubtitle}>
            Responde con lo que sientes, no con lo que crees que deberías sentir
          </p>

          {PREGUNTAS.map((pregunta, index) => (
            <div key={pregunta.id} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>{index + 1}</span>
              </div>
              <p className={styles.questionText}>{pregunta.texto}</p>
              <div className={styles.scaleContainer} role="radiogroup" aria-label={`Pregunta ${index + 1}: ${pregunta.texto}`}>
                {ESCALA.map((opcion) => (
                  <button
                    key={opcion.valor}
                    className={`${styles.scaleButton} ${respuestas[pregunta.id] === opcion.valor ? styles.scaleButtonActive : ''}`}
                    onClick={() => handleRespuesta(pregunta.id, opcion.valor)}
                    role="radio"
                    aria-checked={respuestas[pregunta.id] === opcion.valor}
                    aria-label={`${opcion.etiqueta} (${opcion.valor} de 5)`}
                  >
                    <span className={styles.scaleValue}>{opcion.valor}</span>
                    <span className={styles.scaleLabel}>{opcion.etiqueta}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.progressInfo}>
            {Object.keys(respuestas).length} de {PREGUNTAS.length} respondidas
          </div>

          <button
            className={styles.btnPrimary}
            onClick={calcularResultado}
            disabled={!todasRespondidas}
            aria-label="Ver mi diagnóstico"
          >
            {todasRespondidas ? 'Ver mi diagnóstico' : `Responde las ${PREGUNTAS.length - Object.keys(respuestas).length} preguntas restantes`}
          </button>
        </section>

        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}>💚 Alto Reconocimiento</span>
                <span className={styles.mapLabelBottom}>Bajo Reconocimiento</span>
                <span className={styles.mapLabelLeft}>Baja Autoexigencia</span>
                <span className={styles.mapLabelRight}>🎭 Alta Autoexigencia</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>💚 Confianza Estable</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🎯 Perfeccionista Consciente</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>😶 Desconexión</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🎭 Impostor Activo</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Autoexigencia ${puntuacionAutoexigencia}/25, Reconocimiento ${puntuacionReconocimiento}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🎭 Autoexigencia</span>
                  <span className={styles.scoreValue}>{puntuacionAutoexigencia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAutoexigencia}`}
                    style={{ width: `${(puntuacionAutoexigencia / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>💚 Reconocimiento</span>
                  <span className={styles.scoreValue}>{puntuacionReconocimiento}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barReconocimiento}`}
                    style={{ width: `${(puntuacionReconocimiento / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <span className={styles.profileEmoji}>{perfil.emoji}</span>
                <h3 className={styles.profileName}>{perfil.nombre}</h3>
              </div>
              <p className={styles.profileDescription}>{perfil.descripcion}</p>

              <div className={styles.profileColumns}>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}>✅ Fortalezas</h4>
                  <ul className={styles.profileList}>
                    {perfil.fortalezas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}>⚠️ Riesgos</h4>
                  <ul className={styles.profileList}>
                    {perfil.riesgos.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <h4 className={styles.actionsTitle}>🎯 Acciones sugeridas</h4>
                <ol className={styles.actionsList}>
                  {perfil.acciones.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className={styles.warningBox}>
              <p>
                <strong>Nota importante:</strong> Este test es una herramienta de reflexión, no un diagnóstico clínico.
                Si sientes que la ansiedad, la inseguridad o la autoexigencia están afectando significativamente
                tu bienestar o tu capacidad de funcionar, considera hablar con un profesional de la salud mental.
                Pedir ayuda es un signo de fortaleza, no de debilidad.
              </p>
            </div>

            <button className={styles.btnSecondary} onClick={reiniciar}>
              Repetir diagnóstico
            </button>
          </section>
        )}

        <EducationalSection
          title="📚 El síndrome del impostor: qué es y qué no es"
          subtitle="La ciencia detrás de sentirse un fraude"
        >
          <section className={styles.guideSection}>
            <h2>Origen del concepto</h2>
            <p>
              En 1978, las psicólogas <strong>Pauline Rose Clance y Suzanne Imes</strong> publicaron
              un artículo titulado <em>&quot;The Impostor Phenomenon in High Achieving Women&quot;</em>,
              donde describieron un patrón que observaban en mujeres profesionales exitosas: a pesar de
              sus logros objetivos, sentían que no merecían su posición y temían ser &quot;descubiertas&quot;.
            </p>
            <p>
              Investigaciones posteriores demostraron que este fenómeno afecta a personas de todos los
              géneros, edades y niveles profesionales. Un metaanálisis de 2020 estimó que entre el
              9% y el 82% de las personas lo experimentan en algún momento (la variabilidad depende
              de cómo se mida y en qué contexto).
            </p>

            <h2>Qué NO es el síndrome del impostor</h2>
            <ul>
              <li><strong>No es un trastorno mental</strong>: No aparece en el DSM-5 ni en la CIE-11. Es un patrón de pensamiento, no una enfermedad.</li>
              <li><strong>No es humildad</strong>: La humildad sana reconoce limitaciones; el impostor niega competencias reales.</li>
              <li><strong>No es falta de preparación</strong>: Suele afectar más a personas competentes que a las incompetentes (efecto Dunning-Kruger inverso).</li>
              <li><strong>No es permanente</strong>: Aparece y desaparece según el contexto — cambios de puesto, nuevos entornos, primera vez en algo.</li>
            </ul>

            <h2>Los 5 tipos de Valerie Young</h2>
            <p>
              La investigadora Valerie Young identificó cinco patrones de comportamiento asociados
              al síndrome del impostor:
            </p>
            <ul>
              <li><strong>El Perfeccionista</strong>: Si no es perfecto, es un fracaso.</li>
              <li><strong>El Experto</strong>: Nunca sabe lo suficiente. Siempre necesita más formación antes de actuar.</li>
              <li><strong>El Genio Natural</strong>: Si no le sale a la primera, es que no es lo suyo.</li>
              <li><strong>El Solista</strong>: Pedir ayuda es señal de debilidad.</li>
              <li><strong>El Superhéroe</strong>: Necesita demostrar que puede con todo para sentirse legítimo.</li>
            </ul>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Clance, P.R. (1985). <em>The Impostor Phenomenon: Overcoming the Fear That Haunts Your Success</em>. Peachtree Publishers.</li>
              <li>Young, V. (2011). <em>The Secret Thoughts of Successful Women</em>. Crown Business.</li>
              <li>Sakulku, J. (2011). &quot;The Impostor Phenomenon&quot;. <em>International Journal of Behavioral Science</em>, 6(1), 73-92.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-sindrome-impostor')} />
        <ShareCard appName="test-sindrome-impostor" />
        <Footer appName="test-sindrome-impostor" />
      </div>
    </>
  );
}
