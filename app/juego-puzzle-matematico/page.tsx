'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './JuegoPuzzleMatematico.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

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

      <Footer appName="juego-puzzle-matematico" />
    </div>
  );
}
