'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback } from 'react';
import styles from './Juego2048.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice />

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

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres dominar el 2048?"
        subtitle="Estrategias, conceptos matemáticos y guía paso a paso para alcanzar la ficha dorada"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Variantes del juego 2048</h2>
          <p>
            Aunque la versión clásica es 4×4, existen variantes con distinto nivel de dificultad
            y objetivos. Aquí tienes las más conocidas comparadas.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Tablero</th>
                  <th>Casilla objetivo</th>
                  <th>Movimientos promedio</th>
                  <th>Dificultad</th>
                  <th>Estrategia principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Clásico</td>
                  <td>4 × 4</td>
                  <td>2048</td>
                  <td>~800 – 1.000</td>
                  <td>Media</td>
                  <td>Esquina fija + cadena descendente</td>
                </tr>
                <tr>
                  <td>Fácil</td>
                  <td>5 × 5</td>
                  <td>2048</td>
                  <td>~500 – 700</td>
                  <td>Baja</td>
                  <td>Más espacio, mismo principio de esquina</td>
                </tr>
                <tr>
                  <td>Difícil</td>
                  <td>3 × 3</td>
                  <td>512</td>
                  <td>~200 – 350</td>
                  <td>Alta</td>
                  <td>Control estricto de una sola fila</td>
                </tr>
                <tr>
                  <td>Modo infinito</td>
                  <td>4 × 4</td>
                  <td>Sin límite</td>
                  <td>2.000+</td>
                  <td>Muy alta</td>
                  <td>Maximizar cadena de fichas sin bloqueo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Para qué sirve jugar al 2048?</h2>
          <p>
            Más allá del entretenimiento, el 2048 desarrolla habilidades cognitivas concretas.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">☕</span>
                <h4>Entretenimiento mental en pausas cortas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una partida completa dura entre 5 y 15 minutos. Es ideal para la pausa
                del café, el transporte o cualquier momento de espera corta.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: activa el modo silencioso del móvil y aprovecha la pausa sin
                distracciones. El juego no requiere conexión a internet.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔢</span>
                <h4>Introducción a potencias de 2 y binario</h4>
              </div>
              <p className={styles.escenarioExample}>
                Cada ficha es exactamente una potencia de 2: 2¹, 2², 2³… hasta 2¹¹ = 2048.
                Jugar es una forma intuitiva de familiarizarse con la progresión binaria.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: si estudias informática o electrónica, usar el 2048 como
                referencia mental para potencias de 2 acelera cálculos mentales.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
                <h4>Desarrollo de pensamiento estratégico</h4>
              </div>
              <p className={styles.escenarioExample}>
                Cada movimiento afecta a todo el tablero. El jugador debe anticipar
                2-3 movimientos, evaluar consecuencias y adaptar el plan si aparece
                una ficha en mala posición.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: trata cada partida como un ejercicio de toma de decisiones
                bajo restricciones. El objetivo no es siempre ganar, sino mejorar
                la consistencia de tus decisiones.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el 2048</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la estrategia más efectiva para llegar a 2048?</summary>
                <p>
                  La estrategia de la &quot;esquina fija&quot; es la más fiable: elige una esquina
                  (por ejemplo, inferior izquierda) y nunca muevas la ficha mayor fuera de
                  ella. Desde esa esquina construye una cadena descendente de fichas a lo
                  largo del borde: 1024 → 512 → 256 → 128 → 64 → … Evita mover hacia la
                  dirección que saca la ficha mayor de su esquina.
                </p>
                <p className={styles.faqTip}>
                  Dato: dentro de la comunidad de jugadores se considera la estrategia
                  más fiable para alcanzar 2048 en la variante 4×4 clásica.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Es posible siempre llegar a 2048 o puede bloquearse el tablero?</summary>
                <p>
                  El tablero puede bloquearse en cualquier momento si todas las celdas
                  están llenas y ninguna ficha adyacente es igual. No hay garantía matemática
                  de victoria: depende de la secuencia aleatoria de fichas nuevas y de las
                  decisiones del jugador. Una mala serie de fichas en posiciones inconvenientes
                  puede hacer irrecuperable la partida incluso con buena estrategia.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántos movimientos hacen falta de media para ganar?</summary>
                <p>
                  En la variante clásica 4×4, una partida ganadora requiere entre 800 y
                  1.000 movimientos con estrategia eficiente. Sin estrategia, los jugadores
                  suelen bloquearse antes de alcanzar 512 o 1024. La variación es alta:
                  una partida afortunada puede concluir en 700 movimientos; una difícil,
                  en más de 1.200.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué representa matemáticamente cada número del tablero?</summary>
                <p>
                  Cada ficha es una potencia de 2: 2 = 2¹, 4 = 2², 8 = 2³, 16 = 2⁴,
                  32 = 2⁵, 64 = 2⁶, 128 = 2⁷, 256 = 2⁸, 512 = 2⁹, 1024 = 2¹⁰,
                  2048 = 2¹¹. Fusionar dos fichas iguales equivale a sumar un exponente:
                  2⁵ + 2⁵ = 2⁶. Esta progresión es idéntica al sistema binario usado
                  en informática y electrónica digital.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Existe una puntuación máxima posible?</summary>
                <p>
                  En teoría sí. La puntuación se obtiene sumando el valor de cada fusión.
                  La ficha máxima alcanzable en un tablero 4×4 es 131.072 (2¹⁷), que
                  requeriría que todas las celdas se fusionaran perfectamente. La puntuación
                  máxima teórica ronda los 3,9 millones de puntos, aunque en la práctica
                  nadie ha llegado a ese límite en condiciones normales de juego.
                </p>
                <p className={styles.faqTip}>
                  Curiosidad: la ficha 65.536 (2¹⁶) ha sido alcanzada por jugadores
                  con herramientas de IA, pero no en juego humano manual.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo dominar el 2048: 5 pasos clave</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Fija la ficha mayor en una esquina</strong>
                <p>
                  Elige una esquina (inferior izquierda es la más habitual) y dirige
                  siempre los movimientos para que la ficha de mayor valor permanezca
                  ahí. Nunca la muevas hacia el centro del tablero.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Mantén las fichas grandes alineadas en un borde</strong>
                <p>
                  Construye una fila o columna entera con fichas en orden descendente
                  desde la esquina elegida: 1024 → 512 → 256 → 128 → … Esto maximiza
                  el espacio disponible y prepara las fusiones siguientes.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Nunca muevas hacia la esquina donde está la ficha mayor</strong>
                <p>
                  Si la ficha mayor está abajo a la izquierda, evita mover hacia arriba
                  o hacia la derecha salvo que sea absolutamente necesario. Cada movimiento
                  en esa dirección arriesga sacar la ficha mayor de su posición anclada.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Construye cadenas descendentes hacia la esquina</strong>
                <p>
                  Trabaja siempre de mayor a menor hacia la esquina. La siguiente ficha
                  a fusionar debe estar adyacente a la que la dobla. Si rompes el orden
                  de la cadena, recuperarlo requiere muchos movimientos extra.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Prioriza fusiones que no desorganicen la esquina</strong>
                <p>
                  Antes de fusionar dos fichas, visualiza dónde quedará el resultado y
                  si eso interrumpe la cadena. A veces es mejor dejar fichas sin fusionar
                  durante varios turnos hasta que la posición sea favorable.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 consejos avanzados para mejorar tus partidas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Estrategia &quot;esquina&quot;: la más efectiva</h4>
              <p>
                Es la técnica más recomendada por jugadores experimentados para
                mantener el control del tablero. Elige siempre la misma esquina
                en cada partida para automatizar el hábito y reducir errores por indecisión.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <h4>Evita mover hacia arriba si la mayor está abajo</h4>
              <p>
                Mover hacia arriba cuando la ficha mayor está en la fila inferior
                es el error más frecuente. Reserva ese movimiento para situaciones
                de emergencia donde no haya alternativa.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔭</span>
              <h4>Piensa 2-3 movimientos por adelantado</h4>
              <p>
                Antes de cada movimiento, anticipa qué posiciones quedarán disponibles
                y dónde aparecerá la nueva ficha (siempre en una celda vacía aleatoria).
                El pensamiento secuencial reduce bloqueos imprevistos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏸️</span>
              <h4>No fusiones impulsivamente sin ver el resultado</h4>
              <p>
                Una fusión apresurada puede colocar una ficha grande en el centro
                del tablero, bloqueando el acceso a la esquina y destruyendo la
                cadena construida en los últimos 50 movimientos.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores que arruinan tu partida</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Mover sin pensar el resultado.</strong> Cada movimiento desplaza
                todas las fichas del tablero a la vez. Un movimiento irreflexivo puede
                llenar el tablero en 3-4 turnos y provocar un bloqueo irreversible.
              </li>
              <li>
                <strong>Fusionar fichas lejos de la esquina elegida.</strong> Si construyes
                una ficha grande en el centro o en la esquina opuesta, perderás el control
                de la cadena principal y necesitarás muchos movimientos para recuperarla.
              </li>
              <li>
                <strong>Cambiar de estrategia a mitad de partida.</strong> Si llevas 400
                movimientos con la esquina inferior izquierda y cambias a la superior
                derecha, la cadena se rompe y el tablero se desorganiza rápidamente.
                Mantén siempre la misma esquina hasta el final.
              </li>
              <li>
                <strong>Ignorar las fichas nuevas que aparecen en posiciones inconvenientes.</strong>{' '}
                Una ficha &quot;4&quot; en la esquina contraria a tu estrategia puede parecer
                inofensiva, pero si no la integras en la cadena pronto, bloqueará
                el espacio disponible cuando más lo necesites.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-2048')} />

      <ShareCard appName="juego-2048" />
      <Footer appName="juego-2048" />
    </div>
  );
}
