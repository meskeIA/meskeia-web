'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './TestVelocidadEscritura.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

const TEXTOS_ESPANOL = [
  'El sol brillaba sobre las montañas mientras el viento suave acariciaba las hojas de los árboles. Era un día perfecto para caminar por el bosque y disfrutar de la naturaleza.',
  'La tecnología ha transformado nuestra forma de vivir y trabajar. Los ordenadores y teléfonos móviles se han convertido en herramientas esenciales para la comunicación diaria.',
  'España es un país con una rica historia y cultura. Desde las playas del Mediterráneo hasta las cumbres de los Pirineos, ofrece paisajes diversos y espectaculares.',
  'Aprender a escribir rápido es una habilidad muy útil en el mundo actual. La práctica constante y la paciencia son las claves para mejorar tu velocidad de mecanografía.',
  'Los libros son ventanas a otros mundos y épocas. La lectura nos permite viajar sin movernos del sitio y conocer las ideas de grandes pensadores de la historia.',
  'El cambio climático es uno de los mayores desafíos de nuestra generación. Reducir las emisiones de carbono y proteger los ecosistemas son tareas urgentes para todos.',
  'La música tiene el poder de cambiar nuestro estado de ánimo en segundos. Una melodía puede traernos recuerdos del pasado o inspirarnos para el futuro.',
  'El deporte no solo mejora nuestra salud física sino también la mental. El ejercicio regular reduce el estrés y aumenta la sensación de bienestar general.',
];

type GameState = 'idle' | 'playing' | 'finished';

interface Stats {
  ppm: number;
  precision: number;
  correctas: number;
  incorrectas: number;
  tiempo: number;
}

export default function TestVelocidadEscrituraPage() {
  const [texto, setTexto] = useState('');
  const [input, setInput] = useState('');
  const [estado, setEstado] = useState<GameState>('idle');
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [duracion, setDuracion] = useState(60);
  const [stats, setStats] = useState<Stats | null>(null);
  const [charIndex, setCharIndex] = useState(0);
  const [erroresActuales, setErroresActuales] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const seleccionarTexto = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TEXTOS_ESPANOL.length);
    setTexto(TEXTOS_ESPANOL[randomIndex]);
  }, []);

  const iniciar = () => {
    seleccionarTexto();
    setInput('');
    setCharIndex(0);
    setErroresActuales(new Set());
    setEstado('playing');
    setTiempoRestante(duracion);
    setStats(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const calcularEstadisticas = useCallback(() => {
    const tiempoTranscurrido = duracion - tiempoRestante;
    const palabrasEscritas = input.trim().split(/\s+/).filter(Boolean).length;
    const minutosTranscurridos = tiempoTranscurrido / 60;
    const ppm = minutosTranscurridos > 0 ? Math.round(palabrasEscritas / minutosTranscurridos) : 0;

    let correctas = 0;
    let incorrectas = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === texto[i]) {
        correctas++;
      } else {
        incorrectas++;
      }
    }

    const precision = correctas + incorrectas > 0
      ? Math.round((correctas / (correctas + incorrectas)) * 100)
      : 100;

    return {
      ppm,
      precision,
      correctas,
      incorrectas,
      tiempo: tiempoTranscurrido,
    };
  }, [duracion, tiempoRestante, input, texto]);

  const finalizar = useCallback(() => {
    setEstado('finished');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStats(calcularEstadisticas());
  }, [calcularEstadisticas]);

  useEffect(() => {
    if (estado === 'playing' && tiempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            finalizar();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [estado, tiempoRestante, finalizar]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (estado !== 'playing') return;

    const value = e.target.value;
    setInput(value);
    setCharIndex(value.length);

    // Detectar errores
    const nuevosErrores = new Set<number>();
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== texto[i]) {
        nuevosErrores.add(i);
      }
    }
    setErroresActuales(nuevosErrores);

    // Si completó el texto
    if (value.length >= texto.length) {
      finalizar();
    }
  };

  const renderTexto = () => {
    return texto.split('').map((char, index) => {
      let className = styles.char;

      if (index < charIndex) {
        if (erroresActuales.has(index)) {
          className += ` ${styles.error}`;
        } else {
          className += ` ${styles.correct}`;
        }
      } else if (index === charIndex) {
        className += ` ${styles.current}`;
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const getPPMLevel = (ppm: number): { label: string; color: string } => {
    if (ppm < 20) return { label: 'Principiante', color: '#EF4444' };
    if (ppm < 40) return { label: 'Básico', color: '#F59E0B' };
    if (ppm < 60) return { label: 'Intermedio', color: '#10B981' };
    if (ppm < 80) return { label: 'Avanzado', color: '#3B82F6' };
    return { label: 'Experto', color: '#8B5CF6' };
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Test de Velocidad de Escritura</h1>
        <p className={styles.subtitle}>
          Mide tu velocidad en palabras por minuto (PPM) y mejora tu mecanografía
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="test-velocidad-escritura-disclaimer"
      />

      {estado === 'idle' && (
        <div className={styles.setupPanel}>
          <h2>Configuración</h2>
          <div className={styles.durationSelector}>
            <span className={styles.label}>Duración del test:</span>
            <div className={styles.durationButtons}>
              {[30, 60, 120].map((d) => (
                <button
                  key={d}
                  className={`${styles.durationBtn} ${duracion === d ? styles.active : ''}`}
                  onClick={() => setDuracion(d)}
                >
                  {d} seg
                </button>
              ))}
            </div>
          </div>
          <button onClick={iniciar} className={styles.btnStart}>
            Comenzar Test
          </button>
        </div>
      )}

      {estado === 'playing' && (
        <div className={styles.gamePanel}>
          <div className={styles.timerBar}>
            <div className={styles.timer}>
              <span className={styles.timerIcon}>⏱️</span>
              <span className={styles.timerValue}>{tiempoRestante}s</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(charIndex / texto.length) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.textDisplay}>{renderTexto()}</div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            className={styles.inputField}
            placeholder="Empieza a escribir aquí..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <button onClick={finalizar} className={styles.btnStop}>
            Terminar
          </button>
        </div>
      )}

      {estado === 'finished' && stats && (
        <div className={styles.resultsPanel}>
          <h2>Resultados</h2>

          <div className={styles.mainStat}>
            <span className={styles.ppmValue}>{stats.ppm}</span>
            <span className={styles.ppmLabel}>PPM</span>
            <span
              className={styles.ppmLevel}
              style={{ color: getPPMLevel(stats.ppm).color }}
            >
              {getPPMLevel(stats.ppm).label}
            </span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🎯</span>
              <span className={styles.statValue}>{stats.precision}%</span>
              <span className={styles.statLabel}>Precisión</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statValue}>{stats.correctas}</span>
              <span className={styles.statLabel}>Correctas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>❌</span>
              <span className={styles.statValue}>{stats.incorrectas}</span>
              <span className={styles.statLabel}>Errores</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statValue}>{stats.tiempo}s</span>
              <span className={styles.statLabel}>Tiempo</span>
            </div>
          </div>

          <div className={styles.ppmScale}>
            <h4>Escala de velocidad (PPM)</h4>
            <div className={styles.scaleBar}>
              <div className={styles.scaleSegment} style={{ background: '#EF4444' }}>
                <span>0-20</span>
                <small>Principiante</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#F59E0B' }}>
                <span>20-40</span>
                <small>Básico</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#10B981' }}>
                <span>40-60</span>
                <small>Intermedio</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#3B82F6' }}>
                <span>60-80</span>
                <small>Avanzado</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#8B5CF6' }}>
                <span>80+</span>
                <small>Experto</small>
              </div>
            </div>
          </div>

          <button onClick={iniciar} className={styles.btnStart}>
            Intentar de nuevo
          </button>
        </div>
      )}

      <EducationalSection
        title="Mecanografía, Productividad y Velocidad de Escritura"
        subtitle="Entiende qué significa tu velocidad, cómo mejorarla y por qué importa"
        icon="⌨️"
      >
        <section>
          <h3>📊 Velocidades de Escritura por Nivel y Profesión</h3>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>PPM (palabras/min)</th>
                  <th>CPM (caracteres/min)</th>
                  <th>Perfil típico</th>
                  <th>Objetivo recomendado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Principiante</strong></td>
                  <td>0 – 20 PPM</td>
                  <td>0 – 100 CPM</td>
                  <td>Usuario ocasional, método caza-teclas</td>
                  <td>Aprender mecanografía táctil</td>
                </tr>
                <tr>
                  <td><strong>Básico</strong></td>
                  <td>20 – 40 PPM</td>
                  <td>100 – 200 CPM</td>
                  <td>Estudiante, uso cotidiano</td>
                  <td>Alcanzar los 40 PPM con precisión</td>
                </tr>
                <tr>
                  <td><strong>Intermedio</strong></td>
                  <td>40 – 60 PPM</td>
                  <td>200 – 300 CPM</td>
                  <td>Oficinista, profesional general</td>
                  <td>Mecanografía táctil consolidada</td>
                </tr>
                <tr>
                  <td><strong>Avanzado</strong></td>
                  <td>60 – 80 PPM</td>
                  <td>300 – 400 CPM</td>
                  <td>Secretario/a, periodista, programador</td>
                  <td>Velocidad no limita el pensamiento</td>
                </tr>
                <tr>
                  <td><strong>Experto</strong></td>
                  <td>80 – 100 PPM</td>
                  <td>400 – 500 CPM</td>
                  <td>Transcriptor profesional, redactor</td>
                  <td>Mantener alta precisión (&gt;97%)</td>
                </tr>
                <tr>
                  <td><strong>Élite</strong></td>
                  <td>&gt; 100 PPM</td>
                  <td>&gt; 500 CPM</td>
                  <td>Campeones de mecanografía</td>
                  <td>Récord mundial: ~316 PPM (Barbara Blackburn)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 ¿Para Qué Importa la Velocidad de Escritura?</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>💼</span>
              <h4>Productividad Laboral</h4>
              <p>Un profesional que escribe 60 PPM en lugar de 30 PPM produce el doble de texto en el mismo tiempo. Para roles como redactor, analista, consultor o administrativo, la velocidad de escritura impacta directamente en cuánto trabajo puedes completar. Muchas empresas exigen mínimo 40-50 PPM como requisito para puestos de backoffice.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎓</span>
              <h4>Oposiciones y Exámenes</h4>
              <p>Muchos exámenes de acceso a la administración pública incluyen una prueba de mecanografía con un mínimo de pulsaciones por minuto exigido, que varía según el país y el tipo de plaza. En exámenes universitarios con entrega digital, una mayor velocidad permite dedicar más tiempo a pensar y menos a teclear.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>💻</span>
              <h4>Programación y Desarrollo</h4>
              <p>Los programadores no solo escriben código: también documentan, responden issues, hacen code review y comunican en Slack/email. Aunque la velocidad de escritura no es la limitación principal en programación (lo es el pensamiento), pasar de 30 a 60 PPM reduce la fricción mental y permite mantener mejor el flujo (estado &quot;flow&quot;) mientras se programa.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎤</span>
              <h4>Transcripción y Periodismo</h4>
              <p>Los transcriptores profesionales y periodistas necesitan 80+ PPM para transcribir audio en tiempo real o tomar notas de rueda de prensa. La estenografía digital (taquigrafía con teclado) puede alcanzar 200+ PPM. Aplicaciones como el subtitulado en directo para televisión requieren velocidades de 300+ PPM con precisión casi perfecta.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre Velocidad de Escritura</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué diferencia hay entre PPM y CPM?</summary>
              <p className={styles.eduFaqRespuesta}><strong>PPM (palabras por minuto)</strong>: se calcula dividiendo los caracteres escritos entre 5 (longitud media de palabra en inglés) y entre los minutos. Es la medida más usada internacionalmente. <strong>CPM (caracteres por minuto)</strong>: cuenta directamente cada carácter, incluyendo espacios. En español, las palabras son más largas que en inglés (media ~5,5 caracteres vs ~4,5), por lo que un test en español con 40 PPM equivale a más CPM que el mismo test en inglés. Algunas herramientas también calculan las llamadas <strong>PPM netas</strong> (PPM brutas menos una penalización por errores); esta herramienta muestra por separado las <strong>PPM brutas</strong> y la <strong>precisión (%)</strong>, lo que te da la misma información y te permite calcular tú mismo las PPM netas si lo necesitas.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuál es la velocidad media de un adulto al escribir?</summary>
              <p className={styles.eduFaqRespuesta}>Según datos agregados de plataformas de práctica de mecanografía como Keybr y TypeRacer (sin desglose oficial por país), la media global se sitúa en torno a 40-50 PPM. Los trabajadores de oficina sin formación específica suelen rondar 35-45 PPM. Los jóvenes que han crecido con smartphones tienden a ser más rápidos en móvil pero más variables en teclado físico. Los &quot;nativos digitales&quot; con formación en mecanografía táctil suelen superar los 60 PPM con facilidad.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué es la mecanografía táctil y por qué es importante?</summary>
              <p className={styles.eduFaqRespuesta}>La <strong>mecanografía táctil</strong> (touch typing) es la técnica de escribir sin mirar el teclado, usando todos los dedos con posición fija de partida (manos en &quot;ASDF JKL;&quot;, dedos índice en F y J que tienen marcas táctiles). Sus ventajas: velocidad 2-3 veces mayor que el método &quot;caza-teclas&quot;, menos fatiga visual (no hay que alternar vista entre pantalla y teclado), menor carga cognitiva. Aprenderla lleva 20-40 horas de práctica pero los beneficios duran toda la vida laboral.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Importa más la velocidad o la precisión?</summary>
              <p className={styles.eduFaqRespuesta}>La <strong>precisión siempre primero</strong>. Una precisión baja genera errores que hay que corregir, lo que en la práctica reduce la velocidad neta. Los expertos en mecanografía recomiendan: mantener siempre por encima del 95-97% de precisión y solo entonces intentar aumentar la velocidad. El cerebro aprende los patrones motores de los errores igual que los correctos; si practicas rápido y con errores, estás aprendiendo también los errores. &quot;Slow is smooth, smooth is fast&quot; es el principio: la fluidez sin errores acaba siendo más rápida que la velocidad con correcciones.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué teclado es mejor para mejorar la velocidad?</summary>
              <p className={styles.eduFaqRespuesta}>Para empezar: cualquier teclado físico de tamaño completo es válido. Para optimizar: los <strong>teclados mecánicos</strong> con switches de tacto claro (Cherry MX Brown, Blue) dan retroalimentación táctil que facilita saber cuándo se ha registrado la pulsación, reduciendo errores. Los teclados <strong>compactos TKL</strong> (sin numpad) reducen el desplazamiento del ratón. El layout <strong>Colemak</strong> es alternativo al QWERTY y potencialmente más eficiente para el español, pero la curva de aprendizaje es alta. Para la mayoría: un buen teclado mecánico QWERTY es suficiente para superar los 80 PPM.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuánto tiempo se tarda en mejorar significativamente?</summary>
              <p className={styles.eduFaqRespuesta}>Con <strong>15-20 minutos de práctica diaria deliberada</strong> (no escritura casual, sino ejercicios estructurados), los estudios muestran: semanas 1-2: dominar la posición de los dedos y alcanzar 20 PPM táctil (más lento que antes). Semana 3-4: 30-35 PPM, empezando a ser cómodo. Mes 2-3: 40-50 PPM, ya comparable con el método antiguo pero con más precisión. Mes 4-6: 60+ PPM. El umbral de 80 PPM generalmente requiere 6-12 meses de práctica consistente. La clave es la práctica <strong>deliberada</strong> (con dificultad, corrigiendo errores) vs la práctica casual (solo escribir lo que ya sabes).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Hay riesgo de lesiones por escribir rápido?</summary>
              <p className={styles.eduFaqRespuesta}>Sí. Las lesiones más comunes son el <strong>síndrome del túnel carpiano</strong> (compresión del nervio mediano en la muñeca), la <strong>tendinitis</strong> (inflamación de tendones de los dedos) y el <strong>síndrome del dolor cervical</strong> por mala postura. La prevención incluye: muñecas rectas al escribir (no doblarlas), descansos de 5 minutos cada hora (regla 20-20-20 extendida), ratón y teclado a la misma altura que los codos, pantalla a nivel de los ojos. La velocidad alta con mala ergonomía aumenta el riesgo; la velocidad alta con buena ergonomía puede mantenerse durante décadas.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Los jóvenes que escriben mucho en móvil son más rápidos en teclado?</summary>
              <p className={styles.eduFaqRespuesta}>No necesariamente. Escribir en móvil usa principalmente los pulgares y desarrolla un patrón motor completamente distinto al del teclado físico. Algunos estudios muestran que usuarios intensivos de smartphone pueden alcanzar 85-100 CPM en móvil (equivalente a ~30-35 PPM), comparable con usuarios de teclado básico pero lejos de los expertos en mecanografía táctil. El aprendizaje de un tipo de escritura no transfiere automáticamente al otro; son habilidades distintas que se desarrollan por separado.</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Cómo Mejorar tu Velocidad de Escritura: Plan de 6 Semanas</h3>
          <ol className={styles.eduPasosList}>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>1</span>
              <div>
                <strong>Semana 1: Aprende la posición base</strong>
                <p>Coloca los dedos índice en las teclas F y J (tienen una pequeña marca táctil). Dedos restantes de la mano izquierda en A-S-D; de la derecha en K-L-Ñ. Pulgares en la barra espaciadora. No mires el teclado. Empieza solo con las teclas centrales. Usa plataformas como Typingclub, Keybr o Typeracer en modo aprendizaje.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>2</span>
              <div>
                <strong>Semana 2-3: Amplía al teclado completo</strong>
                <p>Aprende gradualmente la fila superior (QWERTY) y la inferior (ZXCVB). Dedica cada sesión a un grupo de teclas nuevas. Acepta que irás más lento que antes — es normal y temporal. El objetivo es consolidar la posición correcta de los dedos, no la velocidad.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>3</span>
              <div>
                <strong>Semana 4: Practica palabras comunes</strong>
                <p>El 200 palabras más frecuentes del español forman el 50% del texto que escribes. Practicar esas palabras específicas (de, que, en, la, el, una...) te da el mayor retorno de inversión. Usa Keybr en modo &quot;palabras frecuentes en español&quot;. Objetivo: 30-35 PPM con precisión &gt;95%.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>4</span>
              <div>
                <strong>Semana 5: Textos completos</strong>
                <p>Empieza a escribir textos continuos (noticias, artículos, emails). La escritura de textos reales activa patrones de palabras que los ejercicios aislados no trabajan. Usa TypeRacer o MonkeyType en español. Anota tu velocidad neta al final de cada sesión para ver la progresión.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>5</span>
              <div>
                <strong>Semana 6+: Identifica y trabaja tus teclas débiles</strong>
                <p>Plataformas como Keybr analizan qué teclas cometes más errores o tardas más. Dedica las sesiones siguientes específicamente a esas teclas. Los &quot;cuellos de botella&quot; individuales (la ñ, las tildes, el guión) son los que más fácil se mejoran con práctica dirigida.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>6</span>
              <div>
                <strong>Mantenimiento: 10 minutos diarios indefinidamente</strong>
                <p>La mecanografía táctil es una habilidad motora que se deteriora sin práctica. Una vez alcanzado tu objetivo, mantén la habilidad con 10 minutos diarios de escritura en TypeRacer o simplemente siendo consciente de tu postura cuando escribes emails y documentos reales.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Consejos para Mejorar Más Rápido</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🎯</span>
              <h4>Precisión antes que velocidad</h4>
              <p>Si cometes más del 5% de errores, reduce la velocidad. Los errores refuerzan los patrones incorrectos. Configura tu herramienta de práctica para que no te permita continuar si hay errores sin corregir.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>⏱️</span>
              <h4>15 minutos diarios &gt; 2 horas semanales</h4>
              <p>La memoria muscular se consolida mejor con práctica distribuida. 15 minutos cada día durante 30 días supera enormemente a una sesión de 2 horas el fin de semana. La consistencia es más importante que la intensidad.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🚫</span>
              <h4>Nunca mires el teclado</h4>
              <p>Tapar el teclado con un trapo o usar una cubierta ciega acelera el aprendizaje táctil. Mirar las teclas es un hábito que frena el automatismo. El dolor de ir lento sin mirar es temporal; el beneficio de no mirar es permanente.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>💆</span>
              <h4>Postura y ergonomía desde el día 1</h4>
              <p>Espalda recta, pies apoyados en el suelo, codos a 90°, muñecas rectas (no dobladas hacia arriba). Una postura correcta desde el principio evita lesiones y también mejora la velocidad: la tensión corporal ralentiza los dedos.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📊</span>
              <h4>Haz tests regulares para ver el progreso</h4>
              <p>Usa este test una vez por semana, siempre bajo las mismas condiciones (misma hora, mismo estado de ánimo, teclado habitual). Ver el progreso en una gráfica es motivador. La velocidad crece lentamente pero de forma constante con práctica diaria.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔧</span>
              <h4>Usa aceleradores de texto (snippets)</h4>
              <p>Herramientas como TextExpander, AutoHotkey o el autocompletado del IDE expanden abreviaturas en texto completo. Escribir &quot;dir&quot; y obtener &quot;Estimado/a Sr./Sra.&quot; automáticamente multiplica tu velocidad efectiva. Combina buena mecanografía con automatización para productividad máxima.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono}>⚠️</span>
            <div>
              <strong>Precauciones importantes sobre velocidad de escritura</strong>
              <ul>
                <li><strong>No fuerces la velocidad si hay dolor:</strong> El dolor en muñecas, dedos o antebrazos durante o después de escribir es una señal de alarma. Para inmediatamente y revisa tu postura y ergonomía antes de continuar. El síndrome del túnel carpiano puede volverse crónico si se ignoran los síntomas tempranos.</li>
                <li><strong>Los tests en esta herramienta son orientativos:</strong> La velocidad real en trabajo cotidiano incluye pensar, editar y formatear, por lo que siempre es inferior a la velocidad en un test de copia. Tu velocidad &quot;real&quot; de trabajo es aproximadamente el 60-70% de tu velocidad en test.</li>
                <li><strong>El calentamiento importa:</strong> Como cualquier habilidad motora fina, escribir en frío (primera hora de la mañana, tras una pausa larga) es más lento y con más errores. No te alarmes si tu primer test del día es significativamente peor que los siguientes.</li>
                <li><strong>Velocidad alta con mala postura es contraproducente:</strong> Mejorar la velocidad con mala ergonomía aumenta el riesgo de lesiones por esfuerzo repetitivo (LER). Siempre prioriza la postura correcta aunque ello suponga escribir más despacio temporalmente.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-velocidad-escritura')} />

      <ShareCard appName="test-velocidad-escritura" />
      <Footer appName="test-velocidad-escritura" />
    </div>
  );
}
