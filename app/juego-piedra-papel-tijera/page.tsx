'use client';

import { useState, useEffect } from 'react';
import styles from './JuegoPiedraPapelTijera.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type Opcion = 'piedra' | 'papel' | 'tijera';
type Resultado = 'ganaste' | 'perdiste' | 'empate' | null;

interface Estadisticas {
  victorias: number;
  derrotas: number;
  empates: number;
  rachaActual: number;
  mejorRacha: number;
}

const OPCIONES: { id: Opcion; emoji: string; nombre: string }[] = [
  { id: 'piedra', emoji: '🪨', nombre: 'Piedra' },
  { id: 'papel', emoji: '📄', nombre: 'Papel' },
  { id: 'tijera', emoji: '✂️', nombre: 'Tijera' },
];

// Determinar ganador
const determinarGanador = (jugador: Opcion, computadora: Opcion): Resultado => {
  if (jugador === computadora) return 'empate';

  if (
    (jugador === 'piedra' && computadora === 'tijera') ||
    (jugador === 'papel' && computadora === 'piedra') ||
    (jugador === 'tijera' && computadora === 'papel')
  ) {
    return 'ganaste';
  }

  return 'perdiste';
};

// Obtener elección aleatoria de la computadora
const eleccionComputadora = (): Opcion => {
  const opciones: Opcion[] = ['piedra', 'papel', 'tijera'];
  return opciones[Math.floor(Math.random() * opciones.length)];
};

export default function JuegoPiedraPapelTijeraPage() {
  const [eleccionJugador, setEleccionJugador] = useState<Opcion | null>(null);
  const [eleccionPC, setEleccionPC] = useState<Opcion | null>(null);
  const [resultado, setResultado] = useState<Resultado>(null);
  const [animando, setAnimando] = useState(false);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    victorias: 0,
    derrotas: 0,
    empates: 0,
    rachaActual: 0,
    mejorRacha: 0,
  });

  // Cargar estadísticas
  useEffect(() => {
    const saved = localStorage.getItem('rps-stats');
    if (saved) {
      try {
        setEstadisticas(JSON.parse(saved));
      } catch {
        // Ignorar
      }
    }
  }, []);

  // Guardar estadísticas
  useEffect(() => {
    if (estadisticas.victorias > 0 || estadisticas.derrotas > 0 || estadisticas.empates > 0) {
      localStorage.setItem('rps-stats', JSON.stringify(estadisticas));
    }
  }, [estadisticas]);

  // Jugar
  const jugar = (opcion: Opcion) => {
    if (animando) return;

    setAnimando(true);
    setEleccionJugador(opcion);
    setEleccionPC(null);
    setResultado(null);

    // Animación de "pensando"
    setTimeout(() => {
      const pc = eleccionComputadora();
      setEleccionPC(pc);

      const res = determinarGanador(opcion, pc);
      setResultado(res);

      // Actualizar estadísticas
      setEstadisticas(prev => {
        const nuevaRacha = res === 'ganaste' ? prev.rachaActual + 1 : 0;
        return {
          victorias: prev.victorias + (res === 'ganaste' ? 1 : 0),
          derrotas: prev.derrotas + (res === 'perdiste' ? 1 : 0),
          empates: prev.empates + (res === 'empate' ? 1 : 0),
          rachaActual: nuevaRacha,
          mejorRacha: Math.max(prev.mejorRacha, nuevaRacha),
        };
      });

      setAnimando(false);
    }, 800);
  };

  // Reiniciar estadísticas
  const reiniciarStats = () => {
    if (confirm('¿Reiniciar todas las estadísticas?')) {
      const nuevasStats = {
        victorias: 0,
        derrotas: 0,
        empates: 0,
        rachaActual: 0,
        mejorRacha: 0,
      };
      setEstadisticas(nuevasStats);
      localStorage.removeItem('rps-stats');
      setEleccionJugador(null);
      setEleccionPC(null);
      setResultado(null);
    }
  };

  const totalPartidas = estadisticas.victorias + estadisticas.derrotas + estadisticas.empates;
  const porcentajeVictorias = totalPartidas > 0
    ? Math.round((estadisticas.victorias / totalPartidas) * 100)
    : 0;

  const getOpcionInfo = (opcion: Opcion | null) => {
    return OPCIONES.find(o => o.id === opcion) || null;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Piedra, Papel o Tijera</h1>
        <p className={styles.subtitle}>
          El clásico juego contra la computadora
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de juego */}
        <div className={styles.gamePanel}>
          <h2 className={styles.panelTitle}>Elige tu jugada</h2>

          <div className={styles.opciones}>
            {OPCIONES.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => jugar(opcion.id)}
                className={`${styles.opcionBtn} ${eleccionJugador === opcion.id ? styles.selected : ''}`}
                disabled={animando}
              >
                <span className={styles.opcionEmoji}>{opcion.emoji}</span>
                <span className={styles.opcionNombre}>{opcion.nombre}</span>
              </button>
            ))}
          </div>

          {/* Arena de batalla */}
          <div className={styles.arena}>
            <div className={styles.jugador}>
              <span className={styles.jugadorLabel}>Tú</span>
              <div className={`${styles.eleccion} ${eleccionJugador ? styles.mostrar : ''}`}>
                {eleccionJugador ? (
                  <span className={styles.eleccionEmoji}>
                    {getOpcionInfo(eleccionJugador)?.emoji}
                  </span>
                ) : (
                  <span className={styles.esperando}>❓</span>
                )}
              </div>
            </div>

            <div className={styles.vs}>
              {animando ? (
                <div className={styles.pensando}>🤔</div>
              ) : resultado ? (
                <div className={`${styles.resultadoIcono} ${styles[resultado]}`}>
                  {resultado === 'ganaste' && '🎉'}
                  {resultado === 'perdiste' && '😢'}
                  {resultado === 'empate' && '🤝'}
                </div>
              ) : (
                <span>VS</span>
              )}
            </div>

            <div className={styles.computadora}>
              <span className={styles.jugadorLabel}>PC</span>
              <div className={`${styles.eleccion} ${eleccionPC ? styles.mostrar : ''}`}>
                {animando ? (
                  <span className={styles.animandoEleccion}>🎲</span>
                ) : eleccionPC ? (
                  <span className={styles.eleccionEmoji}>
                    {getOpcionInfo(eleccionPC)?.emoji}
                  </span>
                ) : (
                  <span className={styles.esperando}>❓</span>
                )}
              </div>
            </div>
          </div>

          {/* Resultado */}
          {resultado && !animando && (
            <div className={`${styles.resultadoPanel} ${styles[resultado]}`}>
              <span className={styles.resultadoTexto}>
                {resultado === 'ganaste' && '¡Ganaste! 🎊'}
                {resultado === 'perdiste' && 'Perdiste 😔'}
                {resultado === 'empate' && '¡Empate! 🤝'}
              </span>
              <span className={styles.resultadoDetalle}>
                {getOpcionInfo(eleccionJugador)?.nombre} vs {getOpcionInfo(eleccionPC)?.nombre}
              </span>
            </div>
          )}
        </div>

        {/* Panel de estadísticas */}
        <div className={styles.statsPanel}>
          <div className={styles.statsHeader}>
            <h2 className={styles.panelTitle}>Estadísticas</h2>
            <button onClick={reiniciarStats} className={styles.resetBtn}>
              🔄 Reiniciar
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.victorias}`}>
              <span className={styles.statValor}>{estadisticas.victorias}</span>
              <span className={styles.statLabel}>Victorias</span>
            </div>
            <div className={`${styles.statCard} ${styles.derrotas}`}>
              <span className={styles.statValor}>{estadisticas.derrotas}</span>
              <span className={styles.statLabel}>Derrotas</span>
            </div>
            <div className={`${styles.statCard} ${styles.empates}`}>
              <span className={styles.statValor}>{estadisticas.empates}</span>
              <span className={styles.statLabel}>Empates</span>
            </div>
          </div>

          <div className={styles.statsExtra}>
            <div className={styles.statRow}>
              <span>Total partidas:</span>
              <strong>{totalPartidas}</strong>
            </div>
            <div className={styles.statRow}>
              <span>% Victorias:</span>
              <strong>{porcentajeVictorias}%</strong>
            </div>
            <div className={styles.statRow}>
              <span>Racha actual:</span>
              <strong>{estadisticas.rachaActual} 🔥</strong>
            </div>
            <div className={styles.statRow}>
              <span>Mejor racha:</span>
              <strong>{estadisticas.mejorRacha} 🏆</strong>
            </div>
          </div>

          {/* Barra de progreso */}
          {totalPartidas > 0 && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressVictorias}
                style={{ width: `${(estadisticas.victorias / totalPartidas) * 100}%` }}
              />
              <div
                className={styles.progressEmpates}
                style={{ width: `${(estadisticas.empates / totalPartidas) * 100}%` }}
              />
              <div
                className={styles.progressDerrotas}
                style={{ width: `${(estadisticas.derrotas / totalPartidas) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Reglas */}
      <div className={styles.infoPanel}>
        <h3>Reglas del juego</h3>
        <div className={styles.reglas}>
          <div className={styles.regla}>
            <span>🪨 → ✂️</span>
            <p>Piedra aplasta Tijera</p>
          </div>
          <div className={styles.regla}>
            <span>✂️ → 📄</span>
            <p>Tijera corta Papel</p>
          </div>
          <div className={styles.regla}>
            <span>📄 → 🪨</span>
            <p>Papel envuelve Piedra</p>
          </div>
        </div>
      </div>

      <Footer appName="juego-piedra-papel-tijera" />
    </div>
  );
}
