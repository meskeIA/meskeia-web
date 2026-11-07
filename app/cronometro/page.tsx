'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Cronometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { PREGUNTAS_FRECUENTES } from './metadata';

// ==================== TIPOS ====================

type ModoTipo = 'cronometro' | 'temporizador';

interface Vuelta {
  numero: number;
  tiempo: number;
  diferencia: number;
}

// ==================== UTILIDADES PURAS ====================

const dos = (n: number): string => n.toString().padStart(2, '0');

/** Reloj con centésimas y coma decimal (§2 del CLAUDE.md): 65.430 ms → «01:05,43». */
function formatearCronometro(ms: number): string {
  const totalSegundos = Math.floor(ms / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  const centesimas = Math.floor((ms % 1000) / 10);
  return horas > 0
    ? `${horas}:${dos(minutos)}:${dos(segundos)},${dos(centesimas)}`
    : `${dos(minutos)}:${dos(segundos)},${dos(centesimas)}`;
}

/**
 * Cuenta atrás en segundos ENTEROS POR ARRIBA: mientras quede algo de tiempo no marca 00:00
 * (con 0,5 s por delante dice 00:01) y el primer segundo dura un segundo (hallazgo 4154).
 */
function formatearCuentaAtras(ms: number): string {
  const totalSegundos = Math.max(0, Math.ceil(ms / 1000));
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return horas > 0
    ? `${horas}:${dos(minutos)}:${dos(segundos)}`
    : `${dos(minutos)}:${dos(segundos)}`;
}

/** Un campo de tiempo: vacío cuenta como 0; un negativo, un decimal o un texto, NaN. */
function leerEntero(valor: string, maximo: number): number {
  if (valor.trim() === '') return 0;
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 && n <= maximo ? n : NaN;
}

/**
 * Alarma: tres pitidos de 880 Hz (0,15 s cada uno, separados 0,1 s) y medio segundo de silencio,
 * 1 s de WAV de 8 bits a 8.000 Hz que se repite en bucle hasta cerrar el aviso de fin. El WAV
 * anterior estaba truncado: declaraba 0,193 s y traía 0,023 s, un chasquido (hallazgo 4148).
 */
function crearAlarmaWav(): string {
  const muestreo = 8000;
  const n = muestreo; // 1 s
  const bytes = new Uint8Array(44 + n);
  const vista = new DataView(bytes.buffer);
  const texto = (pos: number, t: string) => {
    for (let i = 0; i < t.length; i++) bytes[pos + i] = t.charCodeAt(i);
  };
  texto(0, 'RIFF');
  vista.setUint32(4, 36 + n, true);
  texto(8, 'WAVE');
  texto(12, 'fmt ');
  vista.setUint32(16, 16, true); // tamaño del bloque fmt
  vista.setUint16(20, 1, true); // PCM
  vista.setUint16(22, 1, true); // mono
  vista.setUint32(24, muestreo, true);
  vista.setUint32(28, muestreo, true); // bytes por segundo
  vista.setUint16(32, 1, true); // bytes por muestra
  vista.setUint16(34, 8, true); // bits por muestra
  texto(36, 'data');
  vista.setUint32(40, n, true);
  const inicios = [0, 0.25, 0.5];
  const largo = 0.15;
  const rampa = 0.005; // sin chasquido al abrir y cerrar cada pitido
  for (let i = 0; i < n; i++) {
    const t = i / muestreo;
    const ini = inicios.find((s) => t >= s && t < s + largo);
    const envolvente = ini === undefined ? 0 : Math.min(1, (t - ini) / rampa, (ini + largo - t) / rampa);
    bytes[44 + i] = Math.round(128 + 100 * envolvente * Math.sin(2 * Math.PI * 880 * t));
  }
  let binario = '';
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binario)}`;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function CronometroPage() {
  // Estado del modo
  const [modo, setModo] = useState<ModoTipo>('cronometro');

  // Estado del cronómetro
  const [tiempoCronometro, setTiempoCronometro] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [vueltas, setVueltas] = useState<Vuelta[]>([]);

  // Estado del temporizador
  const [tiempoTemporizador, setTiempoTemporizador] = useState(0);
  const [tiempoInicial, setTiempoInicial] = useState(0);
  const [inputHoras, setInputHoras] = useState('0');
  const [inputMinutos, setInputMinutos] = useState('5');
  const [inputSegundos, setInputSegundos] = useState('0');
  const [avisoTemporizador, setAvisoTemporizador] = useState('');

  // Referencias
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Date.now() menos lo acumulado al arrancar el cronómetro, y la hora de fin de la cuenta atrás:
  // pausar y marcar vuelta leen la hora del clic, no el último tic (hallazgo 4153)
  const inicioCronometroRef = useRef(0);
  const finTemporizadorRef = useRef(0);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Crear audio para alarma (solo en cliente)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(crearAlarmaWav());
      audio.loop = true;
      audioRef.current = audio;
    }
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // ==================== CRONÓMETRO ====================

  const iniciarCronometro = useCallback(() => {
    if (corriendo) return;
    setCorriendo(true);
    inicioCronometroRef.current = Date.now() - tiempoCronometro;
    intervalRef.current = setInterval(() => {
      setTiempoCronometro(Date.now() - inicioCronometroRef.current);
    }, 10);
  }, [corriendo, tiempoCronometro]);

  const pausarCronometro = useCallback(() => {
    setCorriendo(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // Lo marchado desde el último tic también cuenta
      setTiempoCronometro(Date.now() - inicioCronometroRef.current);
    }
  }, []);

  const resetearCronometro = useCallback(() => {
    pausarCronometro();
    setTiempoCronometro(0);
    setVueltas([]);
  }, [pausarCronometro]);

  const registrarVuelta = useCallback(() => {
    const ahora = corriendo ? Date.now() - inicioCronometroRef.current : tiempoCronometro;
    if (corriendo) setTiempoCronometro(ahora);
    const ultimaVuelta = vueltas.length > 0 ? vueltas[0].tiempo : 0;
    const nuevaVuelta: Vuelta = {
      numero: vueltas.length + 1,
      tiempo: ahora,
      diferencia: ahora - ultimaVuelta,
    };
    setVueltas([nuevaVuelta, ...vueltas]);
  }, [corriendo, tiempoCronometro, vueltas]);

  // ==================== TEMPORIZADOR ====================

  const horasElegidas = leerEntero(inputHoras, 23);
  const minutosElegidos = leerEntero(inputMinutos, 59);
  const segundosElegidos = leerEntero(inputSegundos, 59);
  const tiempoElegido = (horasElegidas * 3600 + minutosElegidos * 60 + segundosElegidos) * 1000;
  // En reposo: sin cuenta en marcha, ni en pausa, ni acabando
  const enReposo = !corriendo && tiempoTemporizador === 0 && tiempoInicial === 0;

  const sonarAlarma = useCallback(() => {
    const audio = audioRef.current;
    let avisado = false;
    const avisar = () => {
      if (avisado) return;
      avisado = true;
      // El aviso bloquea la página mientras la alarma suena en bucle; al cerrarlo, se calla y el
      // temporizador vuelve al tiempo elegido, listo para repetir
      alert('¡Tiempo terminado!');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setTiempoInicial(0);
    };
    if (!audio) {
      avisar();
      return;
    }
    audio.currentTime = 0;
    audio.play().then(avisar, avisar);
  }, []);

  const iniciarTemporizador = useCallback(() => {
    if (corriendo) return;

    let tiempo = tiempoTemporizador;
    if (tiempo === 0) {
      if ([horasElegidas, minutosElegidos, segundosElegidos].some(Number.isNaN)) {
        setAvisoTemporizador(
          'Revisa el tiempo: las horas van de 0 a 23, y los minutos y los segundos de 0 a 59, sin decimales ni negativos.',
        );
        return;
      }
      if (tiempoElegido <= 0) {
        setAvisoTemporizador('Elige un tiempo mayor que cero para empezar la cuenta atrás.');
        return;
      }
      tiempo = tiempoElegido;
      setTiempoTemporizador(tiempo);
      setTiempoInicial(tiempo);
    }
    setAvisoTemporizador('');

    setCorriendo(true);
    finTemporizadorRef.current = Date.now() + tiempo;

    intervalRef.current = setInterval(() => {
      const remaining = finTemporizadorRef.current - Date.now();
      if (remaining <= 0) {
        setTiempoTemporizador(0);
        setCorriendo(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        sonarAlarma();
      } else {
        setTiempoTemporizador(remaining);
      }
    }, 100);
  }, [corriendo, tiempoTemporizador, horasElegidas, minutosElegidos, segundosElegidos, tiempoElegido, sonarAlarma]);

  const pausarTemporizador = useCallback(() => {
    setCorriendo(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setTiempoTemporizador(Math.max(1, finTemporizadorRef.current - Date.now()));
    }
  }, []);

  const resetearTemporizador = useCallback(() => {
    pausarTemporizador();
    setTiempoTemporizador(0);
    setTiempoInicial(0);
  }, [pausarTemporizador]);

  const cambiarCampo = (fijar: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    fijar(e.target.value);
    setAvisoTemporizador('');
  };

  // Cambiar de modo
  const cambiarModo = (nuevoModo: ModoTipo) => {
    if (corriendo) return;
    setModo(nuevoModo);
  };

  // Presets de temporizador
  const presets = [
    { label: '1 min', minutos: 1 },
    { label: '5 min', minutos: 5 },
    { label: '10 min', minutos: 10 },
    { label: '15 min', minutos: 15 },
    { label: '30 min', minutos: 30 },
    { label: '1 hora', minutos: 60 },
  ];

  const aplicarPreset = (minutos: number) => {
    if (corriendo) return;
    setInputHoras(Math.floor(minutos / 60).toString());
    setInputMinutos((minutos % 60).toString());
    setInputSegundos('0');
    setTiempoTemporizador(0);
    setTiempoInicial(0);
    setAvisoTemporizador('');
  };

  // Calcular progreso del temporizador
  const progreso = tiempoInicial > 0 ? ((tiempoInicial - tiempoTemporizador) / tiempoInicial) * 100 : 0;
  // En reposo el marcador enseña el tiempo elegido, no un 00:00 (hallazgo 4155)
  const marcadorTemporizador = enReposo
    ? formatearCuentaAtras(Number.isNaN(tiempoElegido) ? 0 : tiempoElegido)
    : formatearCuentaAtras(tiempoTemporizador);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cronómetro y Temporizador</h1>
        <p className={styles.subtitle}>
          Mide el tiempo con precisión desde el móvil (celular), tableta u ordenador
        </p>
      </header>

      <LegalNotice />

      {/* Tabs de modo */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${modo === 'cronometro' ? styles.tabActivo : ''}`}
          onClick={() => cambiarModo('cronometro')}
          disabled={corriendo}
          aria-pressed={modo === 'cronometro'}
        >
          <span aria-hidden="true">⏱️</span> Cronómetro
        </button>
        <button
          type="button"
          className={`${styles.tab} ${modo === 'temporizador' ? styles.tabActivo : ''}`}
          onClick={() => cambiarModo('temporizador')}
          disabled={corriendo}
          aria-pressed={modo === 'temporizador'}
        >
          <span aria-hidden="true">⏳</span> Temporizador
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Cronómetro */}
        {modo === 'cronometro' && (
          <>
            <section className={styles.displayPanel}>
              <div className={styles.tiempoDisplay}>
                {formatearCronometro(tiempoCronometro)}
              </div>
              <div className={styles.controles}>
                {!corriendo ? (
                  <button type="button" onClick={iniciarCronometro} className={styles.btnPrimario}>
                    <span aria-hidden="true">▶</span> Iniciar
                  </button>
                ) : (
                  <button type="button" onClick={pausarCronometro} className={styles.btnPausar}>
                    <span aria-hidden="true">⏸</span> Pausar
                  </button>
                )}
                <button
                  type="button"
                  onClick={registrarVuelta}
                  className={styles.btnSecundario}
                  disabled={!corriendo && tiempoCronometro === 0}
                >
                  <span aria-hidden="true">🏁</span> Vuelta
                </button>
                <button
                  type="button"
                  onClick={resetearCronometro}
                  className={styles.btnSecundario}
                  disabled={tiempoCronometro === 0}
                >
                  <span aria-hidden="true">↺</span> Reiniciar
                </button>
              </div>
            </section>

            {/* Vueltas */}
            {vueltas.length > 0 && (
              <section className={styles.vueltasPanel}>
                <h3>Vueltas ({vueltas.length})</h3>
                <div className={styles.vueltasLista}>
                  {vueltas.map((vuelta) => (
                    <div key={vuelta.numero} className={styles.vueltaItem}>
                      <span className={styles.vueltaNumero}>#{vuelta.numero}</span>
                      <span className={styles.vueltaTiempo}>{formatearCronometro(vuelta.tiempo)}</span>
                      <span className={styles.vueltaDiferencia}>
                        {`+${formatearCronometro(vuelta.diferencia)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Temporizador */}
        {modo === 'temporizador' && (
          <>
            <section className={styles.displayPanel}>
              {/* Círculo de progreso */}
              <div className={styles.circuloProgreso}>
                <svg className={styles.circuloSvg} viewBox="0 0 100 100">
                  <circle
                    className={styles.circuloFondo}
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    className={styles.circuloRelleno}
                    cx="50"
                    cy="50"
                    r="45"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progreso / 100)}`}
                  />
                </svg>
                <div className={styles.tiempoDisplayTemporizador}>
                  {marcadorTemporizador}
                </div>
              </div>

              {/* Inputs de tiempo (solo en reposo) */}
              {enReposo && (
                <div className={styles.inputsTiempo}>
                  <div className={styles.inputGrupo}>
                    <input
                      id="crono-horas"
                      type="number"
                      min="0"
                      max="23"
                      step="1"
                      inputMode="numeric"
                      aria-label="Horas"
                      value={inputHoras}
                      onChange={cambiarCampo(setInputHoras)}
                      className={styles.inputTiempo}
                    />
                    <label htmlFor="crono-horas" className={styles.inputLabel}>horas</label>
                  </div>
                  <span className={styles.inputSeparador} aria-hidden="true">:</span>
                  <div className={styles.inputGrupo}>
                    <input
                      id="crono-minutos"
                      type="number"
                      min="0"
                      max="59"
                      step="1"
                      inputMode="numeric"
                      aria-label="Minutos"
                      value={inputMinutos}
                      onChange={cambiarCampo(setInputMinutos)}
                      className={styles.inputTiempo}
                    />
                    <label htmlFor="crono-minutos" className={styles.inputLabel}>min</label>
                  </div>
                  <span className={styles.inputSeparador} aria-hidden="true">:</span>
                  <div className={styles.inputGrupo}>
                    <input
                      id="crono-segundos"
                      type="number"
                      min="0"
                      max="59"
                      step="1"
                      inputMode="numeric"
                      aria-label="Segundos"
                      value={inputSegundos}
                      onChange={cambiarCampo(setInputSegundos)}
                      className={styles.inputTiempo}
                    />
                    <label htmlFor="crono-segundos" className={styles.inputLabel}>seg</label>
                  </div>
                </div>
              )}

              {/* Siempre montado: el texto cambia dentro y el lector lo anuncia */}
              <p className={styles.avisoTemporizador} role="alert">
                {avisoTemporizador}
              </p>

              {/* Presets */}
              {enReposo && (
                <div className={styles.presets}>
                  {presets.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => aplicarPreset(preset.minutos)}
                      className={styles.presetBtn}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.controles}>
                {!corriendo ? (
                  <button type="button" onClick={iniciarTemporizador} className={styles.btnPrimario}>
                    <span aria-hidden="true">▶</span> Iniciar
                  </button>
                ) : (
                  <button type="button" onClick={pausarTemporizador} className={styles.btnPausar}>
                    <span aria-hidden="true">⏸</span> Pausar
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetearTemporizador}
                  className={styles.btnSecundario}
                  disabled={enReposo}
                >
                  <span aria-hidden="true">↺</span> Reiniciar
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Tras la herramienta y sus resultados (posición 6 de la estructura estándar): delante
          dejaba Vuelta y Reiniciar bajo el pliegue en el móvil (hallazgo 4149) */}
      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="cronometro-disclaimer"
      />

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">⏱️</span>
            <div>
              <strong>Cronómetro</strong>
              <p>Mide tiempo con precisión de centésimas y registra vueltas</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">⏳</span>
            <div>
              <strong>Temporizador</strong>
              <p>Cuenta atrás con alarma sonora al finalizar</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">🎯</span>
            <div>
              <strong>Presets rápidos</strong>
              <p>Tiempos predefinidos para uso inmediato</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre el cronómetro?"
        subtitle="Usos prácticos, casos reales y consejos para medir el tiempo con eficacia"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Usos del cronómetro según actividad</h2>
          <p>
            No todos los usos del cronómetro requieren la misma precisión ni las mismas funciones.
            Esta tabla compara los cuatro contextos más habituales.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Uso</th>
                  <th>Precisión necesaria</th>
                  <th>Uso de vueltas</th>
                  <th>Duración típica</th>
                  <th>Beneficio principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span aria-hidden="true">🏃</span> Deporte / Running</td>
                  <td>Centésimas de segundo</td>
                  <td>Sí — cada vuelta o km</td>
                  <td>10 min – 4 h</td>
                  <td>Comparar ritmos por intervalo</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">📚</span> Estudio Pomodoro</td>
                  <td>Segundos</td>
                  <td>No</td>
                  <td>25 min (trabajo) / 5 min (descanso)</td>
                  <td>Mantener el foco y reducir la fatiga</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🍳</span> Cocina</td>
                  <td>Segundos</td>
                  <td>Opcional — varios platos</td>
                  <td>1 – 60 min</td>
                  <td>Evitar sobre o infra-cocción</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">💼</span> Productividad laboral</td>
                  <td>Minutos</td>
                  <td>Sí — por tarea</td>
                  <td>15 min – 8 h</td>
                  <td>Registrar el tiempo real por proyecto</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales</h2>
          <p>
            Tres perfiles distintos que usan el cronómetro de forma habitual y sacan partido a sus funciones.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏃</span>
                <h4>Corredor en entrenamiento</h4>
              </div>
              <p className={styles.escenarioExample}>
                Entrena intervalos de 400 m en pista. Pulsa <strong>Vuelta</strong> al final de cada serie
                para registrar el tiempo parcial sin detener el cronómetro global.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: al terminar revisa la columna de diferencias entre vueltas para detectar si bajaste el ritmo en los últimos intervalos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
                <h4>Estudiante con técnica Pomodoro</h4>
              </div>
              <p className={styles.escenarioExample}>
                Activa el cronómetro al empezar a estudiar y lo pausa a los 25 minutos para un descanso de 5.
                Repite el ciclo 4 veces y luego descansa 15-30 minutos.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: anota cuántos pomodoros completas al día para ver tu progreso semanal y ajustar la carga de estudio.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍳</span>
                <h4>Cocinero con varios fuegos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Tiene pasta (8 min), huevos (6 min) y salsa (15 min) en marcha a la vez.
                Usa <strong>Vuelta</strong> para marcar el inicio de cada elemento y saber cuánto lleva cada uno.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: ordena los tiempos de cocción de mayor a menor antes de empezar para saber qué poner primero.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <li key={f.question} className={styles.faqItem}>
                <details>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo usar el cronómetro: 4 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Pulsa Iniciar cuando empiece la actividad</strong>
                <p>
                  Haz clic en el botón <strong><span aria-hidden="true">▶</span> Iniciar</strong> en el momento exacto en que
                  arranca la actividad que quieres medir. El cronómetro empieza a contar desde cero.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Usa vueltas para marcar intervalos</strong>
                <p>
                  Pulsa <strong><span aria-hidden="true">🏁</span> Vuelta</strong> cada vez que termines un intervalo (una vuelta en
                  pista, un pomodoro, un plato en cocina). Se guarda el tiempo parcial y la
                  diferencia respecto al intervalo anterior.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Pausa si necesitas interrumpir</strong>
                <p>
                  Si surge una interrupción, pulsa <strong><span aria-hidden="true">⏸</span> Pausar</strong>. El tiempo se congela
                  sin perder la medición. Reanuda cuando estés listo: el cronómetro continúa desde
                  donde lo dejaste.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Copia o anota el tiempo final</strong>
                <p>
                  Al terminar, consulta el tiempo total y la lista de vueltas. Anota los datos que
                  necesites antes de pulsar <strong><span aria-hidden="true">↺</span> Reiniciar</strong>, ya que al hacerlo se
                  borrarán todos los registros.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏁</span>
              <h4>Usa vueltas para comparar intervalos</h4>
              <p>
                El historial de vueltas muestra la diferencia de tiempo entre cada intervalo.
                Es más útil que solo el tiempo total cuando quieres analizar si mantuviste
                el ritmo o bajaste la intensidad.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🖥️</span>
              <h4>Mantén la pestaña activa para mayor precisión</h4>
              <p>
                Aunque el resultado final es correcto, la pantalla se actualiza con más
                fluidez si la pestaña está en primer plano. Para mediciones críticas,
                evita minimizar el navegador.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎵</span>
              <h4>Combina con música o podcast en actividades largas</h4>
              <p>
                Para sesiones de estudio o trabajo prolongado, reproducir audio de fondo
                ayuda a mantener el ritmo. El cronómetro sigue corriendo sin interferir
                con otras apps del navegador.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <h4>Anota los tiempos de vueltas antes de reiniciar</h4>
              <p>
                Al pulsar Reiniciar se borran todas las vueltas. Si necesitas conservar
                los datos para comparar con sesiones futuras, cópialos o haz una captura
                de pantalla antes de resetear.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores habituales al usar el cronómetro</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Cerrar la pestaña accidentalmente.</strong> Si cierras o recargas la
                página, el cronómetro y todas las vueltas se pierden sin posibilidad de
                recuperación. Anota los tiempos importantes antes de cerrar.
              </li>
              <li>
                <strong>Usar el cronómetro del navegador en competiciones oficiales.</strong>{' '}
                Para eventos deportivos con cronometraje oficial se necesita un dispositivo
                certificado (cronómetro homologado). Este cronómetro es válido para uso
                personal y entrenamiento, no para resultados oficiales.
              </li>
              <li>
                <strong>Olvidar pausar en interrupciones.</strong> Si te levantas a atender
                algo sin pausar, el cronómetro sigue contando y el tiempo registrado no
                refleja la actividad real. Pausa siempre antes de alejarte del dispositivo.
              </li>
              <li>
                <strong>No anotar los tiempos parciales antes de reiniciar.</strong> Al pulsar
                Reiniciar se borran todas las vueltas de forma irreversible. Si planeas
                comparar estos datos con futuras sesiones, guárdalos primero.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="cronometro" />
      <Footer appName="cronometro" />
    </div>
  );
}
