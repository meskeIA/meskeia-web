'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Juego2048.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type Tablero = number[][];
type Direccion = 'up' | 'down' | 'left' | 'right';

// Crear tablero vacío
const crearTablero = (): Tablero => {
  return Array(4).fill(null).map(() => Array(4).fill(0));
};

// Añadir número aleatorio (2 o 4)
const añadirNumero = (tablero: Tablero): Tablero => {
  const nuevo = tablero.map(fila => [...fila]);
  const vacias: [number, number][] = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (nuevo[i][j] === 0) vacias.push([i, j]);
    }
  }

  if (vacias.length > 0) {
    const [fila, col] = vacias[Math.floor(Math.random() * vacias.length)];
    nuevo[fila][col] = Math.random() < 0.9 ? 2 : 4;
  }

  return nuevo;
};

// Rotar tablero 90 grados
const rotar = (tablero: Tablero): Tablero => {
  const nuevo: Tablero = crearTablero();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      nuevo[i][j] = tablero[3 - j][i];
    }
  }
  return nuevo;
};

// Mover fila hacia la izquierda
const moverFilaIzquierda = (fila: number[]): { fila: number[]; puntos: number } => {
  // Filtrar ceros
  let nums = fila.filter(n => n !== 0);
  let puntos = 0;

  // Combinar adyacentes iguales
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] === nums[i + 1]) {
      nums[i] *= 2;
      puntos += nums[i];
      nums.splice(i + 1, 1);
    }
  }

  // Rellenar con ceros
  while (nums.length < 4) nums.push(0);

  return { fila: nums, puntos };
};

// Mover tablero hacia la izquierda
const moverIzquierda = (tablero: Tablero): { tablero: Tablero; puntos: number } => {
  let puntosTotales = 0;
  const nuevo = tablero.map(fila => {
    const { fila: nuevaFila, puntos } = moverFilaIzquierda([...fila]);
    puntosTotales += puntos;
    return nuevaFila;
  });
  return { tablero: nuevo, puntos: puntosTotales };
};

// Mover en cualquier dirección
const mover = (tablero: Tablero, direccion: Direccion): { tablero: Tablero; puntos: number; movido: boolean } => {
  let rotado = tablero.map(fila => [...fila]);
  let rotaciones = 0;

  // Rotar para que la dirección sea siempre "izquierda"
  switch (direccion) {
    case 'up': rotaciones = 1; break;
    case 'right': rotaciones = 2; break;
    case 'down': rotaciones = 3; break;
  }

  for (let i = 0; i < rotaciones; i++) {
    rotado = rotar(rotado);
  }

  const { tablero: movido, puntos } = moverIzquierda(rotado);

  // Rotar de vuelta
  let resultado = movido;
  for (let i = 0; i < (4 - rotaciones) % 4; i++) {
    resultado = rotar(resultado);
  }

  // Verificar si hubo cambio
  const cambio = JSON.stringify(tablero) !== JSON.stringify(resultado);

  return { tablero: resultado, puntos, movido: cambio };
};

// Verificar si hay movimientos posibles
const hayMovimientos = (tablero: Tablero): boolean => {
  // Hay celdas vacías
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (tablero[i][j] === 0) return true;
    }
  }

  // Hay adyacentes iguales
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const val = tablero[i][j];
      if (i < 3 && tablero[i + 1][j] === val) return true;
      if (j < 3 && tablero[i][j + 1] === val) return true;
    }
  }

  return false;
};

// Verificar si hay 2048
const hay2048 = (tablero: Tablero): boolean => {
  return tablero.some(fila => fila.some(n => n >= 2048));
};

export default function Juego2048Page() {
  const [tablero, setTablero] = useState<Tablero>(crearTablero());
  const [puntuacion, setPuntuacion] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victoria, setVictoria] = useState(false);
  const [continuarDespuesVictoria, setContinuarDespuesVictoria] = useState(false);

  // Cargar mejor puntuación y iniciar
  useEffect(() => {
    const saved = localStorage.getItem('2048-best');
    if (saved) setMejorPuntuacion(parseInt(saved));

    // Iniciar con 2 números
    let inicial = crearTablero();
    inicial = añadirNumero(inicial);
    inicial = añadirNumero(inicial);
    setTablero(inicial);
  }, []);

  // Guardar mejor puntuación
  useEffect(() => {
    if (puntuacion > mejorPuntuacion) {
      setMejorPuntuacion(puntuacion);
      localStorage.setItem('2048-best', puntuacion.toString());
    }
  }, [puntuacion, mejorPuntuacion]);

  // Manejar movimiento
  const handleMove = useCallback((direccion: Direccion) => {
    if (gameOver) return;

    const { tablero: nuevoTablero, puntos, movido } = mover(tablero, direccion);

    if (movido) {
      const conNuevo = añadirNumero(nuevoTablero);
      setTablero(conNuevo);
      setPuntuacion(p => p + puntos);

      // Verificar victoria
      if (!continuarDespuesVictoria && hay2048(conNuevo)) {
        setVictoria(true);
      }

      // Verificar game over
      if (!hayMovimientos(conNuevo)) {
        setGameOver(true);
      }
    }
  }, [tablero, gameOver, continuarDespuesVictoria]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direccion: Direccion = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right',
        }[e.key] as Direccion;
        handleMove(direccion);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Touch controls
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 30) {
          handleMove(diffX > 0 ? 'right' : 'left');
        }
      } else {
        if (Math.abs(diffY) > 30) {
          handleMove(diffY > 0 ? 'down' : 'up');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMove]);

  // Reiniciar juego
  const reiniciar = () => {
    let nuevo = crearTablero();
    nuevo = añadirNumero(nuevo);
    nuevo = añadirNumero(nuevo);
    setTablero(nuevo);
    setPuntuacion(0);
    setGameOver(false);
    setVictoria(false);
    setContinuarDespuesVictoria(false);
  };

  // Continuar después de victoria
  const continuar = () => {
    setVictoria(false);
    setContinuarDespuesVictoria(true);
  };

  // Colores de las fichas
  const getColorClass = (valor: number): string => {
    if (valor === 0) return '';
    if (valor <= 4) return styles.tile2;
    if (valor <= 8) return styles.tile8;
    if (valor <= 16) return styles.tile16;
    if (valor <= 32) return styles.tile32;
    if (valor <= 64) return styles.tile64;
    if (valor <= 128) return styles.tile128;
    if (valor <= 256) return styles.tile256;
    if (valor <= 512) return styles.tile512;
    if (valor <= 1024) return styles.tile1024;
    return styles.tile2048;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>2048</h1>
        <p className={styles.subtitle}>
          Desliza y combina números para llegar a 2048
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de puntuación */}
        <div className={styles.scorePanel}>
          <div className={styles.scoreBox}>
            <span className={styles.scoreLabel}>Puntuación</span>
            <span className={styles.scoreValue}>{puntuacion}</span>
          </div>
          <div className={styles.scoreBox}>
            <span className={styles.scoreLabel}>Mejor</span>
            <span className={styles.scoreValue}>{mejorPuntuacion}</span>
          </div>
          <button onClick={reiniciar} className={styles.newGameBtn}>
            🔄 Nuevo
          </button>
        </div>

        {/* Tablero */}
        <div className={styles.gameContainer}>
          <div className={styles.tablero}>
            {tablero.map((fila, i) =>
              fila.map((valor, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`${styles.tile} ${getColorClass(valor)}`}
                >
                  {valor > 0 && valor}
                </div>
              ))
            )}
          </div>

          {/* Overlay Game Over */}
          {gameOver && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2>Game Over</h2>
                <p>Puntuación: {puntuacion}</p>
                <button onClick={reiniciar} className={styles.overlayBtn}>
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}

          {/* Overlay Victoria */}
          {victoria && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h2>🎉 ¡Ganaste!</h2>
                <p>¡Llegaste a 2048!</p>
                <div className={styles.overlayBtns}>
                  <button onClick={continuar} className={styles.overlayBtn}>
                    Continuar
                  </button>
                  <button onClick={reiniciar} className={styles.overlayBtnSecondary}>
                    Nuevo juego
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className={styles.instrucciones}>
          <p>⌨️ Usa las <strong>flechas del teclado</strong> para mover</p>
          <p>📱 En móvil, <strong>desliza</strong> en cualquier dirección</p>
        </div>
      </div>

      <Footer appName="juego-2048" />
    </div>
  );
}
