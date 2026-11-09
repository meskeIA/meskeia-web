'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TemporizadorVisual.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { parseSpanishNumber } from '@/lib';

// Presets de tiempo en minutos
const PRESETS = [1, 2, 5, 10, 15, 20, 30];

// Radio y circunferencia del SVG
const RADIO = 120;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

// Estado del temporizador
type EstadoTimer = 'parado' | 'corriendo' | 'pausado' | 'terminado';

type Tramo = 'verde' | 'amarillo' | 'naranja' | 'rojo';

// Tramo de color según el porcentaje restante. El color lo pone el CSS (.tramoVerde…), con una
// variante oscura del tono en tema claro: los vivos de antes daban 1,92-2,80:1 sobre la tarjeta
// blanca, y las cifras se leen de lejos (hallazgo 4329).
function getTramoTiempo(porcentaje: number): Tramo {
  if (porcentaje > 60) return 'verde';
  if (porcentaje > 40) return 'amarillo';
  if (porcentaje > 20) return 'naranja';
  return 'rojo';
}

/**
 * Lee el campo «Otro tiempo...». Antes era parseInt sobre un type="number": «2,5» llegaba como
 * «2.5» y se cortaba a 2 sin avisar, y fuera de 1-180 no pasaba nada (hallazgos 4326 y 4327).
 * Ahora admite fracciones (2,5 min = 02:30) y nombra lo que no aplica.
 */
function leerMinutos(texto: string): { minutos: number } | { error: string } {
  if (texto.trim() === '') return { error: 'Escribe cuántos minutos quieres, entre 1 y 180.' };
  const n = parseSpanishNumber(texto);
  if (!Number.isFinite(n)) return { error: `No se ha podido leer «${texto}»: escribe los minutos con cifras, por ejemplo 2,5.` };
  if (n < 1 || n > 180) return { error: 'La duración tiene que estar entre 1 y 180 minutos.' };
  return { minutos: n };
}

// Tono de aviso con Web Audio API
function reproducirAlerta() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    // Tres tonos ascendentes
    [0, 0.35, 0.7].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440 + i * 110;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.55);
    });
  } catch { /* ignorar si Web Audio no está disponible */ }
}

// Formatear segundos como MM:SS
function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TemporizadorVisualPage() {
  const [duracionMin, setDuracionMin] = useState(5);
  const [inputPersonalizado, setInputPersonalizado] = useState('');
  const [errorPersonalizado, setErrorPersonalizado] = useState('');
  const [segundosRestantes, setSegundosRestantes] = useState(5 * 60);
  const [estado, setEstado] = useState<EstadoTimer>('parado');
  const [sonidoActivo, setSonidoActivo] = useState(true);

  /**
   * La cuenta se mide contra un INSTANTE FINAL (Date.now), no contando tics de setInterval.
   * Hasta el 09/11/2026 restaba 1 por tic: con la pestaña en segundo plano, la pantalla del móvil
   * bloqueada o el portátil suspendido el navegador no dispara el intervalo y la cuenta se paraba;
   * cada Pausar/Continuar y cada toque al sonido tiraba lo marchado desde el último tic
   * (hallazgo 4325). Ahora el intervalo solo repinta, como en cronometro.
   */
  const finRef = useRef<number | null>(null);        // instante final, mientras corre
  const restanteMsRef = useRef(5 * 60 * 1000);       // lo que queda, mientras no corre
  const sonidoRef = useRef(sonidoActivo);
  const btnPrincipalRef = useRef<HTMLButtonElement>(null);
  const btnResetRef = useRef<HTMLButtonElement>(null);

  const segundosTotales = Math.round(duracionMin * 60);
  const porcentajeRestante = segundosTotales > 0 ? (segundosRestantes / segundosTotales) * 100 : 0;
  const strokeOffset = CIRCUNFERENCIA * (1 - porcentajeRestante / 100);
  const tramoActual = getTramoTiempo(porcentajeRestante);
  const claseTramo = {
    verde: styles.tramoVerde,
    amarillo: styles.tramoAmarillo,
    naranja: styles.tramoNaranja,
    rojo: styles.tramoRojo,
  }[tramoActual];

  useEffect(() => {
    sonidoRef.current = sonidoActivo;
  }, [sonidoActivo]);

  // Recalcula lo que queda contra el instante final; al llegar a 0, termina y suena una vez.
  const actualizar = useCallback(() => {
    if (finRef.current === null) return;
    const ms = finRef.current - Date.now();
    if (ms <= 0) {
      finRef.current = null;
      restanteMsRef.current = 0;
      setSegundosRestantes(0);
      setEstado('terminado');
      if (sonidoRef.current) reproducirAlerta();
      return;
    }
    setSegundosRestantes(Math.ceil(ms / 1000));
  }, []);

  // Repintado mientras corre, y al volver a la pestaña (el navegador puede haber parado el intervalo)
  useEffect(() => {
    if (estado !== 'corriendo') return;
    const id = setInterval(actualizar, 250);
    const alVolver = () => {
      if (document.visibilityState === 'visible') actualizar();
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [estado, actualizar]);

  // Pantalla encendida mientras corre (Wake Lock): en el móvil se apagaba por inactividad.
  useEffect(() => {
    if (estado !== 'corriendo' || !('wakeLock' in navigator)) return;
    let cancelado = false;
    let bloqueo: WakeLockSentinel | null = null;
    const pedir = async () => {
      try {
        const s = await navigator.wakeLock.request('screen');
        if (cancelado) void s.release();
        else bloqueo = s;
      } catch {
        /* sin permiso o sin batería: la cuenta sigue igual, solo no se impide el apagado */
      }
    };
    void pedir();
    // El bloqueo se suelta solo al ocultar la pestaña: se vuelve a pedir al volver.
    const alVolver = () => {
      if (document.visibilityState === 'visible') void pedir();
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', alVolver);
      if (bloqueo) void bloqueo.release().catch(() => {});
    };
  }, [estado]);

  // Al terminar, el botón principal pasa a disabled: el foco va a Reiniciar en vez de caer a
  // <body> (hallazgo 4328).
  useEffect(() => {
    if (estado !== 'terminado') return;
    const activo = document.activeElement;
    if (activo === btnPrincipalRef.current || activo === document.body || activo === null) {
      btnResetRef.current?.focus();
    }
  }, [estado]);

  const fijarDuracion = useCallback((min: number) => {
    finRef.current = null;
    restanteMsRef.current = Math.round(min * 60) * 1000;
    setDuracionMin(min);
    setSegundosRestantes(Math.round(min * 60));
    setEstado('parado');
  }, []);

  const seleccionarPreset = useCallback((min: number) => {
    fijarDuracion(min);
    setInputPersonalizado('');
    setErrorPersonalizado('');
  }, [fijarDuracion]);

  const aplicarPersonalizado = () => {
    const lectura = leerMinutos(inputPersonalizado);
    if ('error' in lectura) {
      setErrorPersonalizado(lectura.error);
      return;
    }
    seleccionarPreset(lectura.minutos);
  };

  const iniciarPausar = () => {
    if (estado === 'terminado') return;
    if (estado === 'corriendo') {
      const ms = (finRef.current ?? Date.now()) - Date.now();
      if (ms <= 0) {
        actualizar();
        return;
      }
      finRef.current = null;
      restanteMsRef.current = ms;
      setSegundosRestantes(Math.ceil(ms / 1000));
      setEstado('pausado');
    } else {
      finRef.current = Date.now() + restanteMsRef.current;
      setEstado('corriendo');
    }
  };

  const resetear = () => {
    fijarDuracion(duracionMin);
  };

  // Botón principal: el símbolo va aparte y oculto al lector, que oye solo la palabra (4332)
  const botonPrincipal = (): { icono: string; texto: string } => {
    if (estado === 'corriendo') return { icono: '⏸', texto: 'Pausar' };
    if (estado === 'pausado') return { icono: '▶', texto: 'Continuar' };
    if (estado === 'terminado') return { icono: '✅', texto: 'Terminado' };
    return { icono: '▶', texto: 'Iniciar' };
  };

  // Mensaje de estado
  const mensajeEstado = (): string => {
    if (estado === 'terminado') return '¡Tiempo terminado!';
    if (estado === 'corriendo') return 'Tiempo en marcha...';
    if (estado === 'pausado') return 'En pausa';
    return 'Listo para empezar';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⏱️</span> Temporizador Visual</h1>
        <p className={styles.subtitle}>
          Elige cuánto tiempo quieres y pulsa Iniciar.
          El círculo te muestra cuánto queda.
        </p>
      </header>

      <LegalNotice />

      {/* Presets de tiempo */}
      <section className={styles.presets} aria-label="Tiempos predefinidos">
        <h2 className={styles.seccionTitulo}>¿Cuánto tiempo?</h2>
        <div className={styles.presetBtns} role="group" aria-label="Seleccionar duración">
          {PRESETS.map(min => (
            <button
              type="button"
              key={min}
              className={`${styles.presetBtn} ${duracionMin === min ? styles.presetActivo : ''}`}
              onClick={() => seleccionarPreset(min)}
              aria-pressed={duracionMin === min}
              aria-label={`${min} ${min === 1 ? 'minuto' : 'minutos'}`}
            >
              <span className={styles.presetNum}>{min}</span>
              <span className={styles.presetLabel}>min</span>
            </button>
          ))}
        </div>

        {/* Tiempo personalizado */}
        <div className={styles.personalizado}>
          <input
            type="text"
            inputMode="decimal"
            className={styles.inputPersonalizado}
            value={inputPersonalizado}
            onChange={e => {
              setInputPersonalizado(e.target.value);
              setErrorPersonalizado('');
            }}
            onKeyDown={e => e.key === 'Enter' && aplicarPersonalizado()}
            placeholder="Otro tiempo..."
            aria-label="Tiempo personalizado en minutos"
            aria-invalid={errorPersonalizado !== ''}
            aria-describedby="error-tiempo-personalizado"
          />
          <button
            type="button"
            className={styles.btnPersonalizado}
            onClick={aplicarPersonalizado}
            aria-label="Aplicar tiempo personalizado"
          >
            Aplicar
          </button>
        </div>
        <p id="error-tiempo-personalizado" className={styles.errorPersonalizado} role="alert">
          {errorPersonalizado}
        </p>
      </section>

      {/* Círculo temporizador */}
      <section className={styles.timerSection} aria-label="Temporizador">
        <div
          className={`${styles.timerContainer} ${estado === 'terminado' ? styles.terminado : ''}`}
          role="timer"
          aria-label={`Tiempo restante: ${formatearTiempo(segundosRestantes)}`}
        >
          <svg
            className={styles.timerSvg}
            viewBox="0 0 300 300"
            aria-hidden="true"
          >
            {/* Pista de fondo */}
            <circle
              cx="150"
              cy="150"
              r={RADIO}
              fill="none"
              strokeWidth="18"
              className={styles.svgPista}
            />
            {/* Arco de progreso */}
            <circle
              cx="150"
              cy="150"
              r={RADIO}
              fill="none"
              strokeWidth="18"
              className={`${styles.svgArco} ${claseTramo}`}
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              transform="rotate(-90 150 150)"
              style={{ transition: estado === 'corriendo' ? 'stroke-dashoffset 1s linear, stroke 0.5s ease' : 'none' }}
            />
            {/* Tiempo restante */}
            <text
              x="150"
              y="145"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${styles.svgTiempo} ${claseTramo}`}
              data-tramo={tramoActual}
            >
              {formatearTiempo(segundosRestantes)}
            </text>
            {/* Etiqueta de estado */}
            <text
              x="150"
              y="188"
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.svgEstado}
            >
              {mensajeEstado()}
            </text>
          </svg>
        </div>

        {/* El fin de la cuenta, para el lector de pantalla: la región viva de antes solo contenía
            un <svg aria-hidden> y no anunciaba nada (hallazgo 4328). */}
        <p className="sr-only" role="status">
          {estado === 'terminado' ? '¡Tiempo terminado!' : ''}
        </p>

        {/* Botones de control */}
        <div className={styles.controles}>
          <button
            type="button"
            ref={btnPrincipalRef}
            className={`${styles.btnControl} ${styles.btnPrincipal} ${estado === 'terminado' ? styles.btnTerminado : ''}`}
            onClick={iniciarPausar}
            disabled={estado === 'terminado'}
          >
            <span aria-hidden="true">{botonPrincipal().icono}</span>{' '}
            <span>{botonPrincipal().texto}</span>
          </button>

          <button
            type="button"
            ref={btnResetRef}
            className={`${styles.btnControl} ${styles.btnReset}`}
            onClick={resetear}
            aria-label="Reiniciar temporizador"
          >
            <span aria-hidden="true">🔄</span> Reiniciar
          </button>
        </div>

        {/* Toggle sonido: nombre fijo y el estado en aria-pressed, para no oírlo dos veces (4332) */}
        <div className={styles.sonidoToggle}>
          <button
            type="button"
            className={`${styles.btnSonido} ${sonidoActivo ? styles.sonidoOn : styles.sonidoOff}`}
            onClick={() => setSonidoActivo(prev => !prev)}
            aria-pressed={sonidoActivo}
            aria-label="Sonido"
          >
            <span aria-hidden="true">{sonidoActivo ? '🔔' : '🔕'}</span>{' '}
            <span>{sonidoActivo ? 'Sonido activado' : 'Sonido desactivado'}</span>
          </button>
        </div>
      </section>

      <EducationalSection
        title="Todo sobre el Temporizador Visual"
        subtitle="Cómo usar el tiempo visual para apoyar la autonomía, la concentración y las rutinas"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de temporizador</th>
                <th>Representación del tiempo</th>
                <th>Mejor para</th>
                <th>Limitación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Visual (este)</td>
                <td>Círculo que se vacía + colores</td>
                <td>Autismo, TDAH, niños, mayores</td>
                <td>Requiere pantalla visible</td>
              </tr>
              <tr>
                <td>Reloj de arena físico</td>
                <td>Arena que cae</td>
                <td>Niños pequeños sin tecnología</td>
                <td>Tiempo fijo, no personalizable</td>
              </tr>
              <tr>
                <td>Temporizador de cocina</td>
                <td>Pitido al terminar</td>
                <td>Adultos, uso puntual</td>
                <td>No muestra progreso visual</td>
              </tr>
              <tr>
                <td>Pomodoro</td>
                <td>Ciclos trabajo/descanso</td>
                <td>Productividad laboral</td>
                <td>Estructura rígida de 25 min</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧩</span>
              <strong>Autismo y TEA</strong>
            </div>
            <p>El tiempo abstracto es difícil de comprender. Un círculo que se vacía y cambia de color es concreto e inmediato.</p>
            <div className={styles.escenarioExample}>Ejemplo: 10 min para terminar los deberes antes del recreo</div>
            <div className={styles.escenarioTip}>Empieza con tiempos cortos (2-3 min) hasta que la persona se familiarice</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">⚡</span>
              <strong>TDAH y dificultades de atención</strong>
            </div>
            <p>Ver visualmente cuánto tiempo queda ayuda a mantener el foco y reduce la ansiedad por no saber cuándo termina.</p>
            <div className={styles.escenarioExample}>Ejemplo: 5 min de lectura + 2 min de descanso en ciclos</div>
            <div className={styles.escenarioTip}>El color rojo actúa como aviso natural sin necesidad de interrupciones verbales</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
              <strong>Familias con niños</strong>
            </div>
            <p>Evita discusiones del tipo &quot;¿cuánto falta?&quot;. El niño puede ver por sí mismo el tiempo restante y autorregularse.</p>
            <div className={styles.escenarioExample}>Ejemplo: 15 min de pantalla, cuando se acabe el tiempo se apaga</div>
            <div className={styles.escenarioTip}>Implica al niño en elegir el tiempo para aumentar su compromiso</div>
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Por qué cambia de color el círculo?</strong>
            <p>Verde (más del 60% restante) → Amarillo (40-60%) → Naranja (20-40%) → Rojo (menos del 20%). Es una señal visual progresiva de urgencia.</p>
            <span className={styles.faqTip}>El cambio de color es gradual para evitar sobresaltos.</span>
          </div>
          {/* Hasta el 09/11/2026 prometía que con F11 «el círculo ocupe toda la pantalla», y el
              círculo mide como mucho 320 px (hallazgo 4331): la promesa baja a lo que hace. */}
          <div className={styles.faqItem}>
            <strong>¿Se puede ver desde lejos?</strong>
            <p>El círculo tiene un tamaño fijo, de unos 320 píxeles de ancho como máximo. Para verlo desde más lejos, agranda la página con el zoom del navegador (Ctrl y + en el ordenador, o pellizcando en el móvil): el círculo crece con ella.</p>
            <span className={styles.faqTip}>En una pantalla grande o un proyector, prueba el zoom antes de empezar la actividad.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa cuando suena la alarma?</strong>
            <p>Suena una secuencia de tres tonos ascendentes y el círculo queda en estado &quot;Terminado&quot;. Debes pulsar Reiniciar para volver a usarlo.</p>
            <span className={styles.faqTip}>Puedes desactivar el sonido si resulta molesto o perturbador.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo usar tiempos distintos a los predefinidos?</strong>
            <p>Sí. Usa el campo &quot;Otro tiempo...&quot; para introducir cualquier duración entre 1 y 180 minutos y pulsa Aplicar. Admite decimales: 2,5 son 2 minutos y 30 segundos.</p>
            <span className={styles.faqTip}>Los presets de 1, 2, 5, 10, 15, 20 y 30 minutos cubren la mayoría de situaciones habituales.</span>
          </div>
        </div>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Elige la duración</strong>
              <p>Selecciona uno de los presets o introduce un tiempo personalizado en el campo de texto.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Configura el sonido</strong>
              <p>Activa o desactiva la alarma final según las necesidades de la persona que lo usará.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Pulsa Iniciar</strong>
              <p>El círculo empieza a vaciarse. Puedes pausar y continuar en cualquier momento.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Observa los colores</strong>
              <p>Verde → Amarillo → Naranja → Rojo. Cada color indica cuánto tiempo queda de forma intuitiva.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🕐</span>
            <strong>Empieza con tiempos cortos</strong>
            <p>1-5 minutos para que la persona se familiarice antes de aumentar la duración.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔇</span>
            <strong>Adapta el sonido</strong>
            <p>Desactiva la alarma si resulta molesta. El cambio de color ya avisa visualmente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📱</span>
            <strong>Orienta la pantalla</strong>
            <p>En móvil, usa orientación vertical. En una pantalla grande, agranda el círculo con el zoom del navegador.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Combínalo con rutinas</strong>
            <p>Úsalo junto al Planificador de Rutinas para estructurar toda la jornada con tiempos.</p>
          </div>
        </div>

        {/* Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al usar el temporizador visual</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Tiempo demasiado largo al principio:</strong> Empezar con 30 min puede generar ansiedad. Comienza con 2-5 min.</li>
            <li><strong>Cambiar el tiempo mientras corre:</strong> Reinicia siempre antes de cambiar la duración para que el círculo sea coherente.</li>
            <li><strong>Usar el sonido con personas sensibles:</strong> La alarma puede resultar perturbadora. Prueba sin sonido primero.</li>
            <li><strong>Pantalla no visible:</strong> El efecto visual solo funciona si la persona puede ver el círculo claramente desde donde está.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="temporizador-visual" />
      <Footer appName="temporizador-visual" />
    </div>
  );
}
