'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Cronometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ==================== TIPOS ====================

type ModoTipo = 'cronometro' | 'temporizador';

interface Vuelta {
  numero: number;
  tiempo: number;
  diferencia: number;
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

  // Referencias
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleC4SP5DY7752Jg88ntznvnMqFEie2+W3cSkWRqLe5rRsJxZHpODksGknF0em4eGtZiYYSKjh4KtkJhlJqeHfqWMlGkmq4d6nYiUaSqzh3aVhJRtLreHcpGAkG0yu4dulXyQcTa/g26RfIx1OsODapF8jHU6w4NqkXyMdTrDg2qRfIx1OsODapF4jHk+x4NmjXiMeT7Hg2aNeIx5PseA=');
    }
  }, []);

  // ==================== CRONÓMETRO ====================

  const iniciarCronometro = useCallback(() => {
    if (corriendo) return;
    setCorriendo(true);
    const startTime = Date.now() - tiempoCronometro;
    intervalRef.current = setInterval(() => {
      setTiempoCronometro(Date.now() - startTime);
    }, 10);
  }, [corriendo, tiempoCronometro]);

  const pausarCronometro = useCallback(() => {
    setCorriendo(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetearCronometro = useCallback(() => {
    pausarCronometro();
    setTiempoCronometro(0);
    setVueltas([]);
  }, [pausarCronometro]);

  const registrarVuelta = useCallback(() => {
    const ultimaVuelta = vueltas.length > 0 ? vueltas[0].tiempo : 0;
    const nuevaVuelta: Vuelta = {
      numero: vueltas.length + 1,
      tiempo: tiempoCronometro,
      diferencia: tiempoCronometro - ultimaVuelta,
    };
    setVueltas([nuevaVuelta, ...vueltas]);
  }, [tiempoCronometro, vueltas]);

  // ==================== TEMPORIZADOR ====================

  const iniciarTemporizador = useCallback(() => {
    if (corriendo) return;

    let tiempo = tiempoTemporizador;
    if (tiempo === 0) {
      const horas = parseInt(inputHoras) || 0;
      const minutos = parseInt(inputMinutos) || 0;
      const segundos = parseInt(inputSegundos) || 0;
      tiempo = (horas * 3600 + minutos * 60 + segundos) * 1000;
      if (tiempo <= 0) return;
      setTiempoTemporizador(tiempo);
      setTiempoInicial(tiempo);
    }

    setCorriendo(true);
    const endTime = Date.now() + tiempo;

    intervalRef.current = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setTiempoTemporizador(0);
        setCorriendo(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Reproducir alarma
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        alert('¡Tiempo terminado!');
      } else {
        setTiempoTemporizador(remaining);
      }
    }, 100);
  }, [corriendo, tiempoTemporizador, inputHoras, inputMinutos, inputSegundos]);

  const pausarTemporizador = useCallback(() => {
    setCorriendo(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetearTemporizador = useCallback(() => {
    pausarTemporizador();
    setTiempoTemporizador(0);
    setTiempoInicial(0);
  }, [pausarTemporizador]);

  // ==================== UTILIDADES ====================

  const formatearTiempo = (ms: number, mostrarMs: boolean = true): string => {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    const milisegundos = Math.floor((ms % 1000) / 10);

    if (horas > 0) {
      return mostrarMs
        ? `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(2, '0')}`
        : `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
    return mostrarMs
      ? `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(2, '0')}`
      : `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
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
  };

  // Calcular progreso del temporizador
  const progreso = tiempoInicial > 0 ? ((tiempoInicial - tiempoTemporizador) / tiempoInicial) * 100 : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cronómetro y Temporizador</h1>
        <p className={styles.subtitle}>
          Mide el tiempo con precisión
        </p>
      </header>

      <LegalNotice />

      {/* Tabs de modo */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${modo === 'cronometro' ? styles.tabActivo : ''}`}
          onClick={() => cambiarModo('cronometro')}
          disabled={corriendo}
        >
          ⏱️ Cronómetro
        </button>
        <button
          className={`${styles.tab} ${modo === 'temporizador' ? styles.tabActivo : ''}`}
          onClick={() => cambiarModo('temporizador')}
          disabled={corriendo}
        >
          ⏳ Temporizador
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Cronómetro */}
        {modo === 'cronometro' && (
          <>
            <section className={styles.displayPanel}>
              <div className={styles.tiempoDisplay}>
                {formatearTiempo(tiempoCronometro)}
              </div>
              <div className={styles.controles}>
                {!corriendo ? (
                  <button onClick={iniciarCronometro} className={styles.btnPrimario}>
                    ▶ Iniciar
                  </button>
                ) : (
                  <button onClick={pausarCronometro} className={styles.btnPausar}>
                    ⏸ Pausar
                  </button>
                )}
                <button
                  onClick={registrarVuelta}
                  className={styles.btnSecundario}
                  disabled={!corriendo && tiempoCronometro === 0}
                >
                  🏁 Vuelta
                </button>
                <button
                  onClick={resetearCronometro}
                  className={styles.btnSecundario}
                  disabled={tiempoCronometro === 0}
                >
                  ↺ Reiniciar
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
                      <span className={styles.vueltaTiempo}>{formatearTiempo(vuelta.tiempo)}</span>
                      <span className={styles.vueltaDiferencia}>
                        +{formatearTiempo(vuelta.diferencia)}
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
                  {formatearTiempo(tiempoTemporizador, false)}
                </div>
              </div>

              {/* Inputs de tiempo (solo cuando no está corriendo y tiempo es 0) */}
              {!corriendo && tiempoTemporizador === 0 && (
                <div className={styles.inputsTiempo}>
                  <div className={styles.inputGrupo}>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={inputHoras}
                      onChange={(e) => setInputHoras(e.target.value)}
                      className={styles.inputTiempo}
                    />
                    <span className={styles.inputLabel}>horas</span>
                  </div>
                  <span className={styles.inputSeparador}>:</span>
                  <div className={styles.inputGrupo}>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={inputMinutos}
                      onChange={(e) => setInputMinutos(e.target.value)}
                      className={styles.inputTiempo}
                    />
                    <span className={styles.inputLabel}>min</span>
                  </div>
                  <span className={styles.inputSeparador}>:</span>
                  <div className={styles.inputGrupo}>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={inputSegundos}
                      onChange={(e) => setInputSegundos(e.target.value)}
                      className={styles.inputTiempo}
                    />
                    <span className={styles.inputLabel}>seg</span>
                  </div>
                </div>
              )}

              {/* Presets */}
              {!corriendo && tiempoTemporizador === 0 && (
                <div className={styles.presets}>
                  {presets.map((preset) => (
                    <button
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
                  <button onClick={iniciarTemporizador} className={styles.btnPrimario}>
                    ▶ Iniciar
                  </button>
                ) : (
                  <button onClick={pausarTemporizador} className={styles.btnPausar}>
                    ⏸ Pausar
                  </button>
                )}
                <button
                  onClick={resetearTemporizador}
                  className={styles.btnSecundario}
                  disabled={tiempoTemporizador === 0 && !corriendo}
                >
                  ↺ Reiniciar
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⏱️</span>
            <div>
              <strong>Cronómetro</strong>
              <p>Mide tiempo con precisión de centésimas y registra vueltas</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⏳</span>
            <div>
              <strong>Temporizador</strong>
              <p>Cuenta atrás con alarma sonora al finalizar</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🎯</span>
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
                  <td>🏃 Deporte / Running</td>
                  <td>Centésimas de segundo</td>
                  <td>Sí — cada vuelta o km</td>
                  <td>10 min – 4 h</td>
                  <td>Comparar ritmos por intervalo</td>
                </tr>
                <tr>
                  <td>📚 Estudio Pomodoro</td>
                  <td>Segundos</td>
                  <td>No</td>
                  <td>25 min (trabajo) / 5 min (descanso)</td>
                  <td>Mantener el foco y reducir la fatiga</td>
                </tr>
                <tr>
                  <td>🍳 Cocina</td>
                  <td>Segundos</td>
                  <td>Opcional — varios platos</td>
                  <td>1 – 60 min</td>
                  <td>Evitar sobre o infra-cocción</td>
                </tr>
                <tr>
                  <td>💼 Productividad laboral</td>
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
                Repite el ciclo 4 veces y luego descansa 20-30 minutos.
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
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué precisión tiene el cronómetro digital?</summary>
                <p>
                  Este cronómetro usa <code>Date.now()</code>, que en navegadores modernos ofrece
                  precisión de milisegundos (se muestra en centésimas). Es más que suficiente para
                  deportes, cocina o productividad. Para competiciones oficiales se requiere un
                  dispositivo certificado por la federación correspondiente.
                </p>
                <p className={styles.faqTip}>
                  Nota: la precisión real depende también de la carga del dispositivo. En condiciones
                  normales el error es inferior a 10 ms.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo usar vueltas para medir intervalos?</summary>
                <p>
                  Sí. El botón <strong>Vuelta</strong> registra el tiempo acumulado en ese instante
                  y calcula automáticamente la diferencia respecto a la vuelta anterior. Así puedes
                  ver tanto el tiempo total transcurrido como el tiempo de cada intervalo por separado.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Se para si cambio de pestaña?</summary>
                <p>
                  No se detiene, pero algunos navegadores reducen la frecuencia de actualización de
                  pestañas en segundo plano (throttling). El tiempo final sigue siendo correcto porque
                  se basa en <code>Date.now()</code>, no en el número de ticks del intervalo. La
                  pantalla puede dejar de actualizarse, pero el cálculo es preciso al volver.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo uso el cronómetro para la técnica Pomodoro?</summary>
                <p>
                  Inicia el cronómetro al empezar tu bloque de trabajo. Cuando llegues a los 25 minutos,
                  pausa y toma 5 minutos de descanso. Tras el descanso, reinicia y repite. Después de
                  4 ciclos, haz una pausa larga de 20-30 minutos. El historial de vueltas te permite
                  llevar la cuenta de cuántos ciclos has completado.
                </p>
                <p className={styles.faqTip}>
                  Tip: si prefieres que suene una alarma automática, usa el modo <strong>Temporizador</strong>
                  con 25 minutos configurados.
                </p>
              </details>
            </li>
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
                  Haz clic en el botón <strong>▶ Iniciar</strong> en el momento exacto en que
                  arranca la actividad que quieres medir. El cronómetro empieza a contar desde cero.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Usa vueltas para marcar intervalos</strong>
                <p>
                  Pulsa <strong>🏁 Vuelta</strong> cada vez que termines un intervalo (una vuelta en
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
                  Si surge una interrupción, pulsa <strong>⏸ Pausar</strong>. El tiempo se congela
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
                  necesites antes de pulsar <strong>↺ Reiniciar</strong>, ya que al hacerlo se
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

      <RelatedApps apps={getRelatedApps('cronometro')} />

      <ShareCard appName="cronometro" />
      <Footer appName="cronometro" />
    </div>
  );
}
