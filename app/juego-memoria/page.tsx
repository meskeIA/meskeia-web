'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoMemoria.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Dificultad = 'facil' | 'medio' | 'dificil';

interface Carta {
  id: number;
  emoji: string;
  parejaId: number;
  volteada: boolean;
  encontrada: boolean;
}

interface MejorTiempo {
  facil: number | null;
  medio: number | null;
  dificil: number | null;
}

const EMOJIS = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌼', '🪻',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓',
];

const CONFIGURACION: Record<Dificultad, { parejas: number; columnas: number }> = {
  facil: { parejas: 6, columnas: 4 },
  medio: { parejas: 8, columnas: 4 },
  dificil: { parejas: 12, columnas: 6 },
};

// Mezclar array
const mezclar = <T,>(array: T[]): T[] => {
  const mezclado = [...array];
  for (let i = mezclado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
  }
  return mezclado;
};

// Generar cartas
const generarCartas = (dificultad: Dificultad): Carta[] => {
  const { parejas } = CONFIGURACION[dificultad];
  const emojisSeleccionados = mezclar(EMOJIS).slice(0, parejas);

  const cartas: Carta[] = [];
  emojisSeleccionados.forEach((emoji, index) => {
    cartas.push(
      { id: index * 2, emoji, parejaId: index, volteada: false, encontrada: false },
      { id: index * 2 + 1, emoji, parejaId: index, volteada: false, encontrada: false }
    );
  });

  return mezclar(cartas);
};

// Formatear tiempo
const formatearTiempo = (segundos: number): string => {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function JuegoMemoriaPage() {
  const [dificultad, setDificultad] = useState<Dificultad>('facil');
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [movimientos, setMovimientos] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [mejoresTiempos, setMejoresTiempos] = useState<MejorTiempo>({
    facil: null,
    medio: null,
    dificil: null,
  });

  // Cargar mejores tiempos
  useEffect(() => {
    const saved = localStorage.getItem('memory-best');
    if (saved) {
      try {
        setMejoresTiempos(JSON.parse(saved));
      } catch {
        // Ignorar
      }
    }
  }, []);

  // Iniciar juego
  const iniciarJuego = useCallback((dif: Dificultad) => {
    setDificultad(dif);
    setCartas(generarCartas(dif));
    setSeleccionadas([]);
    setMovimientos(0);
    setTiempo(0);
    setJuegoActivo(true);
    setJuegoTerminado(false);
  }, []);

  // Iniciar con dificultad actual al montar
  useEffect(() => {
    iniciarJuego(dificultad);
  }, []);

  // Temporizador
  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (juegoActivo && !juegoTerminado) {
      intervalo = setInterval(() => {
        setTiempo(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [juegoActivo, juegoTerminado]);

  // Verificar si el juego terminó
  useEffect(() => {
    if (cartas.length > 0 && cartas.every(c => c.encontrada)) {
      setJuegoTerminado(true);
      setJuegoActivo(false);

      // Guardar mejor tiempo
      const mejorActual = mejoresTiempos[dificultad];
      if (mejorActual === null || tiempo < mejorActual) {
        const nuevosMejores = { ...mejoresTiempos, [dificultad]: tiempo };
        setMejoresTiempos(nuevosMejores);
        localStorage.setItem('memory-best', JSON.stringify(nuevosMejores));
      }
    }
  }, [cartas, tiempo, dificultad, mejoresTiempos]);

  // Click en carta
  const clickCarta = (id: number) => {
    if (!juegoActivo || juegoTerminado) return;
    if (seleccionadas.length >= 2) return;

    const carta = cartas.find(c => c.id === id);
    if (!carta || carta.volteada || carta.encontrada) return;

    const nuevasCartas = cartas.map(c =>
      c.id === id ? { ...c, volteada: true } : c
    );
    setCartas(nuevasCartas);

    const nuevasSeleccionadas = [...seleccionadas, id];
    setSeleccionadas(nuevasSeleccionadas);

    if (nuevasSeleccionadas.length === 2) {
      setMovimientos(m => m + 1);

      const [id1, id2] = nuevasSeleccionadas;
      const carta1 = nuevasCartas.find(c => c.id === id1)!;
      const carta2 = nuevasCartas.find(c => c.id === id2)!;

      if (carta1.parejaId === carta2.parejaId) {
        // ¡Pareja encontrada!
        setTimeout(() => {
          setCartas(prev => prev.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, encontrada: true } : c
          ));
          setSeleccionadas([]);
        }, 300);
      } else {
        // No son pareja, voltear de nuevo
        setTimeout(() => {
          setCartas(prev => prev.map(c =>
            c.id === id1 || c.id === id2 ? { ...c, volteada: false } : c
          ));
          setSeleccionadas([]);
        }, 1000);
      }
    }
  };

  const { columnas } = CONFIGURACION[dificultad];
  const parejasEncontradas = cartas.filter(c => c.encontrada).length / 2;
  const totalParejas = CONFIGURACION[dificultad].parejas;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Juego de Memoria</h1>
        <p className={styles.subtitle}>
          Encuentra todas las parejas de cartas
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de control */}
        <div className={styles.controlPanel}>
          <div className={styles.dificultadSelector}>
            {(['facil', 'medio', 'dificil'] as Dificultad[]).map((d) => (
              <button
                key={d}
                onClick={() => iniciarJuego(d)}
                className={`${styles.dificultadBtn} ${dificultad === d ? styles.active : ''}`}
              >
                {d === 'facil' && '😊 Fácil (6)'}
                {d === 'medio' && '🤔 Medio (8)'}
                {d === 'dificil' && '🧠 Difícil (12)'}
              </button>
            ))}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statValor}>{formatearTiempo(tiempo)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>👆</span>
              <span className={styles.statValor}>{movimientos}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statValor}>{parejasEncontradas}/{totalParejas}</span>
            </div>
          </div>

          {mejoresTiempos[dificultad] !== null && (
            <div className={styles.mejorTiempo}>
              🏆 Mejor: {formatearTiempo(mejoresTiempos[dificultad]!)}
            </div>
          )}
        </div>

        {/* Tablero */}
        <div
          className={styles.tablero}
          style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}
        >
          {cartas.map((carta) => (
            <button
              key={carta.id}
              onClick={() => clickCarta(carta.id)}
              className={`${styles.carta} ${carta.volteada || carta.encontrada ? styles.volteada : ''} ${carta.encontrada ? styles.encontrada : ''}`}
              disabled={carta.volteada || carta.encontrada}
            >
              <div className={styles.cartaInner}>
                <div className={styles.cartaFront}>❓</div>
                <div className={styles.cartaBack}>{carta.emoji}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Modal de victoria */}
        {juegoTerminado && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>🎉 ¡Felicidades!</h2>
              <p>Encontraste todas las parejas</p>
              <div className={styles.modalStats}>
                <div>⏱️ Tiempo: <strong>{formatearTiempo(tiempo)}</strong></div>
                <div>👆 Movimientos: <strong>{movimientos}</strong></div>
              </div>
              {mejoresTiempos[dificultad] === tiempo && (
                <p className={styles.nuevoRecord}>🏆 ¡Nuevo récord!</p>
              )}
              <button onClick={() => iniciarJuego(dificultad)} className={styles.playAgainBtn}>
                🔄 Jugar de nuevo
              </button>
            </div>
          </div>
        )}
      </div>

      <RelatedApps apps={getRelatedApps('juego-memoria')} />

      <Footer appName="juego-memoria" />
    </div>
  );
}
