'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Cronometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps} from '@/components';
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

      <RelatedApps apps={getRelatedApps('cronometro')} />

      <Footer appName="cronometro" />
    </div>
  );
}
