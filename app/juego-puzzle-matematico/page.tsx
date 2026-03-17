'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './JuegoPuzzleMatematico.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Modo = 'suma' | 'resta' | 'multiplicacion' | 'division' | 'mixto';
type Pantalla = 'inicio' | 'juego' | 'resultado';

interface Problema {
  num1: number;
  num2: number;
  operador: string;
  respuesta: number;
  tipoNombre: string;
}

interface Estadisticas {
  partidasTotales: number;
  mejorPuntuacion: number;
  totalCorrectas: number;
  mejorRacha: number;
}

const TIEMPO_POR_RONDA = 60; // segundos
const PROBLEMAS_POR_RONDA = 20;

const MODOS: { id: Modo; nombre: string; descripcion: string }[] = [
  { id: 'suma', nombre: '➕ Suma', descripcion: 'Operaciones de adición' },
  { id: 'resta', nombre: '➖ Resta', descripcion: 'Operaciones de sustracción' },
  { id: 'multiplicacion', nombre: '✖️ Multiplicación', descripcion: 'Tablas de multiplicar' },
  { id: 'division', nombre: '➗ División', descripcion: 'Divisiones exactas' },
  { id: 'mixto', nombre: '🎲 Mixto', descripcion: 'Todas las operaciones' },
];

export default function JuegoPuzzleMatematicoPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [modo, setModo] = useState<Modo>('suma');
  const [problema, setProblema] = useState<Problema | null>(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [tiempo, setTiempo] = useState(TIEMPO_POR_RONDA);
  const [puntuacion, setPuntuacion] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [incorrectas, setIncorrectas] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRachaPartida, setMejorRachaPartida] = useState(0);
  const [estadoRespuesta, setEstadoRespuesta] = useState<'normal' | 'correcto' | 'incorrecto'>('normal');
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    partidasTotales: 0,
    mejorPuntuacion: 0,
    totalCorrectas: 0,
    mejorRacha: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar estadísticas
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-puzzle-matematico-stats');
    if (saved) {
      setEstadisticas(JSON.parse(saved));
    }
  }, []);

  // Guardar estadísticas
  const guardarEstadisticas = useCallback((newStats: Estadisticas) => {
    setEstadisticas(newStats);
    localStorage.setItem('meskeia-puzzle-matematico-stats', JSON.stringify(newStats));
  }, []);

  // Generar problema
  const generarProblema = useCallback((modoActual: Modo): Problema => {
    let tipoOperacion = modoActual;

    if (modoActual === 'mixto') {
      const tipos: Modo[] = ['suma', 'resta', 'multiplicacion', 'division'];
      tipoOperacion = tipos[Math.floor(Math.random() * tipos.length)];
    }

    let num1: number, num2: number, respuesta: number, operador: string, tipoNombre: string;

    switch (tipoOperacion) {
      case 'suma':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        respuesta = num1 + num2;
        operador = '+';
        tipoNombre = 'Suma';
        break;

      case 'resta':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * Math.min(num1, 30)) + 1;
        respuesta = num1 - num2;
        operador = '−';
        tipoNombre = 'Resta';
        break;

      case 'multiplicacion':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        respuesta = num1 * num2;
        operador = '×';
        tipoNombre = 'Multiplicación';
        break;

      case 'division':
        num2 = Math.floor(Math.random() * 10) + 2;
        respuesta = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * respuesta;
        operador = '÷';
        tipoNombre = 'División';
        break;

      default:
        num1 = 1;
        num2 = 1;
        respuesta = 2;
        operador = '+';
        tipoNombre = 'Suma';
    }

    return { num1, num2, operador, respuesta, tipoNombre };
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pantalla === 'juego' && tiempo > 0) {
      interval = setInterval(() => {
        setTiempo(t => {
          if (t <= 1) {
            finalizarJuego();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantalla, tiempo]);

  // Iniciar juego
  const iniciarJuego = useCallback(() => {
    setPantalla('juego');
    setTiempo(TIEMPO_POR_RONDA);
    setPuntuacion(0);
    setCorrectas(0);
    setIncorrectas(0);
    setRacha(0);
    setMejorRachaPartida(0);
    setRespuestaUsuario('');
    setEstadoRespuesta('normal');
    setProblema(generarProblema(modo));

    // Focus en input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [modo, generarProblema]);

  // Verificar respuesta
  const verificarRespuesta = useCallback(() => {
    if (!problema || respuestaUsuario === '') return;

    const respuestaNum = parseInt(respuestaUsuario);
    const esCorrecta = respuestaNum === problema.respuesta;

    if (esCorrecta) {
      setEstadoRespuesta('correcto');
      setCorrectas(c => c + 1);

      // Calcular puntos (más puntos por racha)
      const puntos = 10 + Math.floor(racha / 3) * 5;
      setPuntuacion(p => p + puntos);

      const nuevaRacha = racha + 1;
      setRacha(nuevaRacha);
      if (nuevaRacha > mejorRachaPartida) {
        setMejorRachaPartida(nuevaRacha);
      }
    } else {
      setEstadoRespuesta('incorrecto');
      setIncorrectas(i => i + 1);
      setRacha(0);
    }

    // Siguiente problema después de breve delay
    setTimeout(() => {
      setRespuestaUsuario('');
      setEstadoRespuesta('normal');
      setProblema(generarProblema(modo));
      inputRef.current?.focus();
    }, 300);
  }, [problema, respuestaUsuario, racha, mejorRachaPartida, modo, generarProblema]);

  // Finalizar juego
  const finalizarJuego = useCallback(() => {
    setPantalla('resultado');

    // Actualizar estadísticas
    const newStats = {
      ...estadisticas,
      partidasTotales: estadisticas.partidasTotales + 1,
      mejorPuntuacion: Math.max(estadisticas.mejorPuntuacion, puntuacion),
      totalCorrectas: estadisticas.totalCorrectas + correctas,
      mejorRacha: Math.max(estadisticas.mejorRacha, mejorRachaPartida),
    };
    guardarEstadisticas(newStats);
  }, [estadisticas, puntuacion, correctas, mejorRachaPartida, guardarEstadisticas]);

  // Manejar teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pantalla !== 'juego') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        verificarRespuesta();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pantalla, verificarRespuesta]);

  // Agregar dígito
  const agregarDigito = (digito: string) => {
    if (respuestaUsuario.length < 5) {
      setRespuestaUsuario(r => r + digito);
    }
  };

  // Borrar último dígito
  const borrar = () => {
    setRespuestaUsuario(r => r.slice(0, -1));
  };

  // Toggle signo negativo
  const toggleNegativo = () => {
    if (respuestaUsuario.startsWith('-')) {
      setRespuestaUsuario(r => r.slice(1));
    } else if (respuestaUsuario !== '') {
      setRespuestaUsuario(r => '-' + r);
    } else {
      setRespuestaUsuario('-');
    }
  };

  // Calcular calificación
  const getCalificacion = (): { emoji: string; titulo: string; subtitulo: string } => {
    const total = correctas + incorrectas;
    const porcentaje = total > 0 ? (correctas / total) * 100 : 0;

    if (porcentaje >= 90) return { emoji: '🏆', titulo: '¡Excelente!', subtitulo: 'Eres un genio matemático' };
    if (porcentaje >= 70) return { emoji: '🌟', titulo: '¡Muy bien!', subtitulo: 'Gran desempeño' };
    if (porcentaje >= 50) return { emoji: '👍', titulo: '¡Bien!', subtitulo: 'Sigue practicando' };
    return { emoji: '💪', titulo: '¡Sigue intentando!', subtitulo: 'La práctica hace al maestro' };
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🧮 Puzzle Matemático</h1>
        <p className={styles.subtitle}>Resuelve operaciones contrarreloj</p>
      </header>

      <LegalNotice />

      {/* Pantalla de inicio */}
      {pantalla === 'inicio' && (
        <div className={styles.pantallaInicio}>
          <h2>Selecciona un modo</h2>
          <p>Tienes {TIEMPO_POR_RONDA} segundos para resolver tantas operaciones como puedas.</p>

          <div className={styles.modoSelector}>
            {MODOS.map((m) => (
              <button
                key={m.id}
                className={`${styles.modoBtn} ${modo === m.id ? styles.active : ''}`}
                onClick={() => setModo(m.id)}
              >
                {m.nombre}
                <span>{m.descripcion}</span>
              </button>
            ))}
          </div>

          <button className={styles.btnComenzar} onClick={iniciarJuego}>
            ▶️ Comenzar
          </button>
        </div>
      )}

      {/* Pantalla de juego */}
      {pantalla === 'juego' && problema && (
        <div className={styles.pantallaJuego}>
          {/* Barra superior */}
          <div className={styles.barraSuperior}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Puntos</div>
              <div className={styles.statValue}>{puntuacion}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Tiempo</div>
              <div className={`${styles.statValue} ${styles.tiempo}`}>{tiempo}s</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Racha</div>
              <div className={styles.statValue}>🔥 {racha}</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className={styles.barraProgreso}>
            <div
              className={styles.progresoFill}
              style={{ width: `${(tiempo / TIEMPO_POR_RONDA) * 100}%` }}
            />
          </div>

          {/* Problema */}
          <div className={styles.problema}>
            <div className={styles.ecuacion}>
              {problema.num1} {problema.operador} {problema.num2} = ?
            </div>
            <span className={styles.tipoOperacion}>{problema.tipoNombre}</span>
          </div>

          {/* Input respuesta */}
          <div className={styles.respuestaContainer}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              className={`${styles.inputRespuesta} ${
                estadoRespuesta === 'correcto' ? styles.correcto :
                estadoRespuesta === 'incorrecto' ? styles.incorrecto : ''
              }`}
              value={respuestaUsuario}
              onChange={(e) => setRespuestaUsuario(e.target.value.replace(/[^0-9-]/g, ''))}
              placeholder="?"
              autoComplete="off"
            />
          </div>

          {/* Teclado numérico */}
          <div className={styles.teclado}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button
                key={n}
                className={styles.tecla}
                onClick={() => agregarDigito(n.toString())}
              >
                {n}
              </button>
            ))}
            <button className={`${styles.tecla} ${styles.especial}`} onClick={toggleNegativo}>
              ±
            </button>
            <button className={styles.tecla} onClick={() => agregarDigito('0')}>
              0
            </button>
            <button className={`${styles.tecla} ${styles.especial}`} onClick={borrar}>
              ⌫
            </button>
          </div>

          <button
            className={`${styles.tecla} ${styles.enviar}`}
            onClick={verificarRespuesta}
            style={{ width: '100%' }}
          >
            Enviar ↵
          </button>

          {/* Acciones */}
          <div className={styles.acciones} style={{ marginTop: '15px' }}>
            <button className={styles.btnAccion} onClick={() => setPantalla('inicio')}>
              ✖ Salir
            </button>
          </div>
        </div>
      )}

      {/* Pantalla de resultados */}
      {pantalla === 'resultado' && (
        <div className={styles.pantallaResultados}>
          <div className={styles.resultadoHeader}>
            <div className={styles.resultadoEmoji}>{getCalificacion().emoji}</div>
            <h2 className={styles.resultadoTitulo}>{getCalificacion().titulo}</h2>
            <p className={styles.resultadoSubtitulo}>{getCalificacion().subtitulo}</p>
          </div>

          <div className={styles.statsFinales}>
            <div className={styles.statFinal}>
              <div className={styles.valor}>{puntuacion}</div>
              <div className={styles.label}>Puntos</div>
            </div>
            <div className={styles.statFinal}>
              <div className={styles.valor}>{correctas}</div>
              <div className={styles.label}>Correctas</div>
            </div>
            <div className={styles.statFinal}>
              <div className={styles.valor}>{incorrectas}</div>
              <div className={styles.label}>Incorrectas</div>
            </div>
            <div className={styles.statFinal}>
              <div className={styles.valor}>{mejorRachaPartida}</div>
              <div className={styles.label}>Mejor racha</div>
            </div>
          </div>

          <div className={styles.botonesResultado}>
            <button className={styles.btnReintentar} onClick={iniciarJuego}>
              🔄 Jugar de nuevo
            </button>
            <button className={styles.btnVolver} onClick={() => setPantalla('inicio')}>
              ← Cambiar modo
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas generales */}
      <div className={styles.estadisticas}>
        <h3>📊 Estadísticas Globales</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.valor}>{estadisticas.partidasTotales}</div>
            <div className={styles.label}>Partidas</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.valor}>{estadisticas.mejorPuntuacion}</div>
            <div className={styles.label}>Récord</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.valor}>{estadisticas.mejorRacha}</div>
            <div className={styles.label}>Mejor racha</div>
          </div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre Puzzles Matemáticos?"
        subtitle="Tipos de puzzle, estrategias, consejos y preguntas frecuentes"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section>
          <h2>Tipos de puzzle matemático</h2>
          <p>Cada tipo entrena habilidades cognitivas distintas. Conocer sus diferencias ayuda a elegir el ejercicio más adecuado para tu objetivo.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de puzzle</th>
                  <th>Habilidad ejercitada</th>
                  <th>Dificultad</th>
                  <th>Tiempo resolución</th>
                  <th>Nivel educativo recomendado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🧮 Cálculo mental</td>
                  <td>Aritmética rápida, memoria de trabajo</td>
                  <td>Baja–Media</td>
                  <td>5–30 segundos</td>
                  <td>Primaria (8+)</td>
                </tr>
                <tr>
                  <td>🔢 Secuencias numéricas</td>
                  <td>Reconocimiento de patrones, inducción</td>
                  <td>Media</td>
                  <td>30 seg–2 min</td>
                  <td>Secundaria (12+)</td>
                </tr>
                <tr>
                  <td>📐 Geometría</td>
                  <td>Visualización espacial, razonamiento deductivo</td>
                  <td>Media–Alta</td>
                  <td>1–5 minutos</td>
                  <td>Secundaria/Bachillerato (14+)</td>
                </tr>
                <tr>
                  <td>🔣 Lógica numérica</td>
                  <td>Razonamiento abstracto, álgebra básica</td>
                  <td>Alta</td>
                  <td>2–10 minutos</td>
                  <td>Bachillerato/Adultos (16+)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section>
          <h2>¿Quién se beneficia de practicar puzzles matemáticos?</h2>
          <p>Desde estudiantes hasta profesionales, los puzzles matemáticos se adaptan a distintos objetivos y momentos vitales.</p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <h4>Estudiante de primaria o secundaria</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un alumno de 10 años practica sumas y restas contrarreloj para mejorar su velocidad en los exámenes. Con 10 minutos diarios nota diferencia en pocas semanas.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: empieza por el modo Suma hasta encadenar 10 correctas seguidas antes de subir a Mixto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
                <h4>Adulto manteniendo agilidad mental</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una persona de 45 años usa puzzles matemáticos como «gimnasia mental» diaria, igual que haría sudokus, para mantener activa la capacidad de cálculo y concentración.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: varía el modo cada día (lunes suma, martes multiplicación…) para estimular diferentes circuitos cognitivos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📋</span>
                <h4>Preparación de pruebas de aptitud numérica</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un opositor o candidato en proceso de selección con pruebas psicotécnicas entrena velocidad y precisión en operaciones básicas para mejorar su rendimiento bajo presión de tiempo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: el modo Mixto simula la variedad de operaciones que suelen aparecer en tests de aptitud numérica. Practica en sesiones de 2–3 rondas.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section>
          <h2>Preguntas frecuentes sobre puzzles matemáticos</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Los puzzles matemáticos mejoran la inteligencia?</summary>
                <p>
                  Los puzzles matemáticos no elevan el cociente intelectual de forma directa, pero sí mejoran habilidades concretas: velocidad de cálculo, memoria de trabajo, capacidad de concentración y resolución de problemas. Estas habilidades tienen un impacto práctico medible en el rendimiento académico y laboral.
                </p>
                <p className={styles.faqTip}>
                  Referencia: estudios de neurociencia cognitiva señalan que la práctica de aritmética mental activa las regiones prefrontal y parietal del cerebro, asociadas a la función ejecutiva.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuánto tiempo al día es óptimo practicar?</summary>
                <p>
                  Entre 10 y 20 minutos diarios es suficiente para obtener mejoras perceptibles. Sesiones más largas no producen beneficios adicionales significativos y pueden causar fatiga cognitiva. La constancia diaria supera en eficacia a sesiones esporádicas de mayor duración.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué diferencia hay entre cálculo mental y razonamiento lógico?</summary>
                <p>
                  El cálculo mental implica ejecutar operaciones aritméticas con rapidez (sumar, restar, multiplicar, dividir). El razonamiento lógico-numérico implica identificar reglas, patrones o relaciones entre números sin necesariamente operar con ellos. Ambos son complementarios y se entrenan de forma diferente.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Los puzzles matemáticos ayudan en las matemáticas escolares?</summary>
                <p>
                  Sí, especialmente en lo que respecta a la automatización de operaciones básicas. Un alumno que no necesita pensar conscientemente en cuánto es 7×8 puede dedicar más capacidad cognitiva a resolver problemas de mayor complejidad. Es el mismo principio que aprender a leer con fluidez para poder entender textos.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿A qué edad es mejor empezar a practicar puzzles matemáticos?</summary>
                <p>
                  Los puzzles de cálculo mental básico son apropiados desde los 6–7 años, cuando los niños ya dominan la suma simple. Los de multiplicación y división a partir de los 8–9 años. Los adultos también se benefician en cualquier etapa de la vida; no existe una edad límite para mejorar la agilidad numérica.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section>
          <h2>Cómo afrontar un puzzle matemático: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Lee el problema completo antes de resolver</strong>
                <p>
                  Antes de escribir nada, asegúrate de entender qué pide el enunciado. En puzzles contrarreloj, la precipitación lleva a errores evitables que rompen la racha.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Identifica qué operación o patrón se pide</strong>
                <p>
                  ¿Es suma, resta, multiplicación, división? ¿Hay un patrón de secuencia? Reconocer el tipo de operación en un vistazo te ahorra tiempo y reduce errores.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Descompón en pasos simples</strong>
                <p>
                  Para operaciones complejas, divide el cálculo. Ejemplo: 47 × 8 = (40 × 8) + (7 × 8) = 320 + 56 = 376. Esta técnica de descomposición es clave en el cálculo mental avanzado.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Verifica el resultado con la operación inversa</strong>
                <p>
                  Si tienes tiempo, comprueba: si 47 × 8 = 376, entonces 376 ÷ 8 debería dar 47. Esta verificación rápida previene errores en exámenes y tests de aptitud.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Aumenta la dificultad progresivamente</strong>
                <p>
                  Una vez que domines un modo con más de un 85 % de aciertos, sube al siguiente nivel o activa el modo Mixto. La sobrecarga progresiva es el principio que garantiza la mejora continua.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section>
          <h2>4 claves para sacar el máximo partido</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>Practica 10–15 minutos diarios</h4>
              <p>
                La consistencia supera a la intensidad. Diez minutos cada día producen más mejora que una sesión de una hora a la semana. Hazlo un hábito, no un esfuerzo puntual.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪜</span>
              <h4>Empieza por el nivel más bajo hasta dominarlo</h4>
              <p>
                Muchos usuarios saltan al modo Mixto antes de tener automatizadas las operaciones básicas. Domina Suma y Resta al 90 %+ antes de introducir Multiplicación.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <h4>No uses calculadora</h4>
              <p>
                El objetivo es precisamente forzar al cerebro a calcular. Usar una calculadora elimina el estímulo cognitivo y hace el ejercicio inútil para mejorar el cálculo mental.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Revisa los errores para aprender el patrón</h4>
              <p>
                Si te equivocas repetidamente en las divisiones por 7, eso revela un punto débil concreto. Identificar el patrón de error te permite dirigir la práctica donde más la necesitas.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores frecuentes al practicar puzzles matemáticos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Saltar a dificultades altas sin base sólida.</strong> Intentar el modo Mixto sin dominar primero las operaciones individuales genera frustración y no produce mejora real. Consolida cada nivel antes de avanzar.
              </li>
              <li>
                <strong>Usar calculadora en puzzles de cálculo mental.</strong> Si recurres a la calculadora para verificar antes de responder, el ejercicio pierde todo su valor. El error y la autocorrección forman parte del aprendizaje.
              </li>
              <li>
                <strong>Rendirse al primer bloqueo sin intentar estrategias distintas.</strong> Cuando una operación no sale de inmediato, prueba descomponer los números, estimar primero el orden de magnitud o usar la operación inversa como pista.
              </li>
              <li>
                <strong>No revisar los errores (se repiten los mismos patrones).</strong> Los errores sistemáticos (siempre en multiplicaciones de 8, siempre en divisiones con resultado impar) indican un patrón que no se corregirá solo con más práctica sin reflexión consciente.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-puzzle-matematico')} />

      <ShareCard appName="juego-puzzle-matematico" />
      <Footer appName="juego-puzzle-matematico" />
    </div>
  );
}
