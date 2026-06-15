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
import { getRelatedApps } from '@/data/app-relations';

// Presets de tiempo en minutos
const PRESETS = [1, 2, 5, 10, 15, 20, 30];

// Radio y circunferencia del SVG
const RADIO = 120;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

// Estado del temporizador
type EstadoTimer = 'parado' | 'corriendo' | 'pausado' | 'terminado';

// Colores según porcentaje restante
function getColorTiempo(porcentaje: number): string {
  if (porcentaje > 60) return '#22C55E';   // Verde
  if (porcentaje > 40) return '#EAB308';   // Amarillo
  if (porcentaje > 20) return '#F97316';   // Naranja
  return '#EF4444';                        // Rojo
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
  const [segundosRestantes, setSegundosRestantes] = useState(5 * 60);
  const [estado, setEstado] = useState<EstadoTimer>('parado');
  const [sonidoActivo, setSonidoActivo] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const segundosTotales = duracionMin * 60;
  const porcentajeRestante = segundosTotales > 0 ? (segundosRestantes / segundosTotales) * 100 : 0;
  const strokeOffset = CIRCUNFERENCIA * (1 - porcentajeRestante / 100);
  const colorActual = getColorTiempo(porcentajeRestante);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Tick del temporizador
  useEffect(() => {
    if (estado === 'corriendo') {
      intervalRef.current = setInterval(() => {
        setSegundosRestantes(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setEstado('terminado');
            if (sonidoActivo) reproducirAlerta();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [estado, sonidoActivo]);

  const seleccionarPreset = useCallback((min: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDuracionMin(min);
    setSegundosRestantes(min * 60);
    setEstado('parado');
    setInputPersonalizado('');
  }, []);

  const aplicarPersonalizado = () => {
    const min = parseInt(inputPersonalizado, 10);
    if (!isNaN(min) && min >= 1 && min <= 180) {
      seleccionarPreset(min);
    }
  };

  const iniciarPausar = () => {
    if (estado === 'terminado') return;
    if (estado === 'corriendo') {
      setEstado('pausado');
    } else {
      setEstado('corriendo');
    }
  };

  const resetear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSegundosRestantes(duracionMin * 60);
    setEstado('parado');
  };

  // Etiqueta del botón principal
  const etiquetaBotonPrincipal = (): string => {
    if (estado === 'corriendo') return '⏸ Pausar';
    if (estado === 'pausado') return '▶ Continuar';
    if (estado === 'terminado') return '✅ Terminado';
    return '▶ Iniciar';
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
              key={min}
              className={`${styles.presetBtn} ${duracionMin === min && inputPersonalizado === '' ? styles.presetActivo : ''}`}
              onClick={() => seleccionarPreset(min)}
              aria-pressed={duracionMin === min && inputPersonalizado === ''}
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
            type="number"
            inputMode="numeric"
            className={styles.inputPersonalizado}
            value={inputPersonalizado}
            onChange={e => setInputPersonalizado(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && aplicarPersonalizado()}
            placeholder="Otro tiempo..."
            min={1}
            max={180}
            aria-label="Tiempo personalizado en minutos"
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
      </section>

      {/* Círculo temporizador */}
      <section className={styles.timerSection} aria-label="Temporizador">
        <div
          className={`${styles.timerContainer} ${estado === 'terminado' ? styles.terminado : ''}`}
          role="timer"
          aria-live="polite"
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
              stroke={colorActual}
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
              className={styles.svgTiempo}
              fill={colorActual}
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

        {/* Botones de control */}
        <div className={styles.controles}>
          <button
            type="button"
            className={`${styles.btnControl} ${styles.btnPrincipal} ${estado === 'terminado' ? styles.btnTerminado : ''}`}
            onClick={iniciarPausar}
            disabled={estado === 'terminado'}
            aria-label={etiquetaBotonPrincipal()}
          >
            {etiquetaBotonPrincipal()}
          </button>

          <button
            type="button"
            className={`${styles.btnControl} ${styles.btnReset}`}
            onClick={resetear}
            aria-label="Reiniciar temporizador"
          >
            <span aria-hidden="true">🔄</span> Reiniciar
          </button>
        </div>

        {/* Toggle sonido */}
        <div className={styles.sonidoToggle}>
          <button
            type="button"
            className={`${styles.btnSonido} ${sonidoActivo ? styles.sonidoOn : styles.sonidoOff}`}
            onClick={() => setSonidoActivo(prev => !prev)}
            aria-pressed={sonidoActivo}
            aria-label={sonidoActivo ? 'Sonido activado, pulsar para desactivar' : 'Sonido desactivado, pulsar para activar'}
          >
            {sonidoActivo ? <><span aria-hidden="true">🔔</span> Sonido activado</> : <><span aria-hidden="true">🔕</span> Sonido desactivado</>}
          </button>
        </div>
      </section>

      <EducationalSection
        title="⏱️ Todo sobre el Temporizador Visual"
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
          <div className={styles.faqItem}>
            <strong>¿Funciona en modo pantalla completa?</strong>
            <p>Sí. Puedes usar el modo pantalla completa del navegador (F11) para que el círculo ocupe toda la pantalla y sea visible desde lejos.</p>
            <span className={styles.faqTip}>Ideal para proyectarlo en clase o colocarlo en la pared.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa cuando suena la alarma?</strong>
            <p>Suena una secuencia de tres tonos ascendentes y el círculo queda en estado &quot;Terminado&quot;. Debes pulsar Reiniciar para volver a usarlo.</p>
            <span className={styles.faqTip}>Puedes desactivar el sonido si resulta molesto o perturbador.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo usar tiempos distintos a los predefinidos?</strong>
            <p>Sí. Usa el campo &quot;Otro tiempo...&quot; para introducir cualquier duración entre 1 y 180 minutos y pulsa Aplicar.</p>
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
            <p>En móvil, usa orientación vertical. En tablet o proyector, horizontal para mayor tamaño.</p>
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

      <RelatedApps apps={getRelatedApps('temporizador-visual')} />
      <ShareCard appName="temporizador-visual" />
      <Footer appName="temporizador-visual" />
    </div>
  );
}
