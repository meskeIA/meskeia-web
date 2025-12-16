'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './JuegoSpaceInvaders.module.css';
import { MeskeiaLogo, Footer, RelatedApps} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  gridStep: number;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: number;
  points: number;
  emoji: string;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
}

interface EnemyConfig {
  rows: number;
  cols: number;
  width: number;
  height: number;
  spacing: number;
  speed: number;
  direction: number;
  dropDistance: number;
}

type GameState = 'start' | 'playing' | 'paused' | 'gameOver';

// Constantes
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;

export default function JuegoSpaceInvadersPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);

  // Refs para el estado del juego
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - 25,
    y: CANVAS_HEIGHT - 80,
    width: 50,
    height: 30,
    gridStep: 50,
    color: '#00FF88',
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const enemyConfigRef = useRef<EnemyConfig>({
    rows: 4,
    cols: 8,
    width: 40,
    height: 30,
    spacing: 10,
    speed: 1,
    direction: 1,
    dropDistance: 20,
  });

  const lastEnemyMoveTimeRef = useRef(0);
  const enemyMoveIntervalRef = useRef(1000);
  const lastEnemyShootTimeRef = useRef(0);
  const enemyShootIntervalRef = useRef(2000);

  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const gameStateRef = useRef<GameState>('start');

  // Cargar récord
  useEffect(() => {
    const saved = localStorage.getItem('spaceInvadersHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Sincronizar refs
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Inicializar enemigos
  const initEnemies = useCallback(() => {
    enemiesRef.current = [];
    const config = enemyConfigRef.current;
    const startX = 80;
    const startY = 60;

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        let type: number;
        let points: number;
        let emoji: string;

        if (row === 0) {
          type = 1;
          points = 30;
          emoji = '👾';
        } else if (row === 1) {
          type = 2;
          points = 20;
          emoji = '👽';
        } else {
          type = 3;
          points = 10;
          emoji = '🛸';
        }

        enemiesRef.current.push({
          x: startX + col * (config.width + config.spacing),
          y: startY + row * (config.height + config.spacing),
          width: config.width,
          height: config.height,
          type,
          points,
          emoji,
          alive: true,
        });
      }
    }
  }, []);

  // Crear explosión
  const createExplosion = useCallback((x: number, y: number) => {
    const particleCount = 15;
    const colors = ['#FFD700', '#FF6B35', '#FF3366', '#00FFFF'];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 30,
        maxLife: 30,
        alpha: 1,
      });
    }
  }, []);

  // Disparar bala jugador
  const shootBullet = useCallback(() => {
    const player = playerRef.current;
    bulletsRef.current.push({
      x: player.x + player.width / 2 - 4,
      y: player.y,
      width: 8,
      height: 15,
      speed: 7,
      color: '#00FFFF',
    });
  }, []);

  // Disparo enemigo
  const enemyShoot = useCallback(() => {
    const aliveEnemies = enemiesRef.current.filter(e => e.alive);
    if (aliveEnemies.length === 0) return;

    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    enemyBulletsRef.current.push({
      x: shooter.x + shooter.width / 2 - 2,
      y: shooter.y + shooter.height,
      width: 4,
      height: 15,
      speed: 4,
      color: '#FF0055',
    });
  }, []);

  // Game Over
  const gameOver = useCallback(() => {
    setGameState('gameOver');
    gameStateRef.current = 'gameOver';

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('spaceInvadersHighScore', scoreRef.current.toString());
    }
  }, [highScore]);

  // Siguiente nivel
  const nextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    levelRef.current += 1;
    enemyMoveIntervalRef.current = Math.max(200, enemyMoveIntervalRef.current - 100);
    enemyShootIntervalRef.current = Math.max(1000, enemyShootIntervalRef.current - 200);
    initEnemies();
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
  }, [initEnemies]);

  // Colisión AABB
  const checkCollision = useCallback((rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }, []);

  // Game Loop
  const gameLoop = useCallback((currentTime: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameStateRef.current !== 'playing') {
      if (gameStateRef.current !== 'gameOver') {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }

    const player = playerRef.current;
    const config = enemyConfigRef.current;

    // Actualizar balas jugador
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      bullet.y -= bullet.speed;
      return bullet.y > 0;
    });

    // Actualizar balas enemigo
    enemyBulletsRef.current = enemyBulletsRef.current.filter(bullet => {
      bullet.y += bullet.speed;
      return bullet.y < CANVAS_HEIGHT;
    });

    // Movimiento enemigos
    if (currentTime - lastEnemyMoveTimeRef.current > enemyMoveIntervalRef.current) {
      let shouldDrop = false;
      const aliveEnemies = enemiesRef.current.filter(e => e.alive);

      for (const enemy of aliveEnemies) {
        if ((enemy.x <= 0 && config.direction === -1) ||
            (enemy.x + enemy.width >= CANVAS_WIDTH && config.direction === 1)) {
          shouldDrop = true;
          break;
        }
      }

      if (shouldDrop) {
        config.direction *= -1;
        enemiesRef.current.forEach(enemy => {
          if (enemy.alive) {
            enemy.y += config.dropDistance;
          }
        });
      }

      enemiesRef.current.forEach(enemy => {
        if (enemy.alive) {
          enemy.x += config.speed * config.direction;
        }
      });

      lastEnemyMoveTimeRef.current = currentTime;
    }

    // Disparo enemigo
    if (currentTime - lastEnemyShootTimeRef.current > enemyShootIntervalRef.current) {
      enemyShoot();
      lastEnemyShootTimeRef.current = currentTime;
    }

    // Actualizar partículas
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      return particle.life > 0;
    });

    // Colisiones balas jugador vs enemigos
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      enemiesRef.current.forEach((enemy) => {
        if (enemy.alive) {
          const hitboxPadding = 3;
          const enemyHitbox = {
            x: enemy.x - hitboxPadding,
            y: enemy.y,
            width: enemy.width + hitboxPadding * 2,
            height: enemy.height,
          };

          if (checkCollision(bullet, enemyHitbox)) {
            enemy.alive = false;
            bulletsRef.current.splice(bulletIndex, 1);
            setScore(prev => prev + enemy.points);
            scoreRef.current += enemy.points;
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

            if (enemiesRef.current.every(e => !e.alive)) {
              nextLevel();
            }
          }
        }
      });
    });

    // Colisiones balas enemigo vs jugador
    enemyBulletsRef.current.forEach((bullet, bulletIndex) => {
      if (checkCollision(bullet, player)) {
        enemyBulletsRef.current.splice(bulletIndex, 1);
        createExplosion(player.x + player.width / 2, player.y + player.height / 2);

        setLives(prev => {
          const newLives = prev - 1;
          livesRef.current = newLives;
          if (newLives <= 0) {
            gameOver();
          }
          return newLives;
        });
      }
    });

    // Enemigos alcanzan al jugador
    enemiesRef.current.forEach(enemy => {
      if (enemy.alive && enemy.y + enemy.height >= player.y) {
        gameOver();
      }
    });

    // Renderizado
    ctx.fillStyle = '#0A0E27';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Estrellas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % CANVAS_WIDTH;
      const y = (i * 97) % CANVAS_HEIGHT;
      const size = Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }

    // Dibujar jugador
    ctx.save();
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#00DDFF';
    ctx.fillRect(player.x + player.width / 2 - 3, player.y + 10, 6, 8);

    ctx.fillStyle = '#FF6600';
    ctx.fillRect(player.x + 5, player.y + player.height - 8, 6, 8);
    ctx.fillRect(player.x + player.width - 11, player.y + player.height - 8, 6, 8);
    ctx.restore();

    // Dibujar balas
    bulletsRef.current.forEach(bullet => {
      ctx.fillStyle = bullet.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    });

    enemyBulletsRef.current.forEach(bullet => {
      ctx.fillStyle = bullet.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    });

    // Dibujar enemigos
    enemiesRef.current.forEach(enemy => {
      if (enemy.alive) {
        ctx.font = `${enemy.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.emoji, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      }
    });

    // Dibujar partículas
    particlesRef.current.forEach(particle => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [checkCollision, createExplosion, enemyShoot, gameOver, nextLevel]);

  // Iniciar juego
  const startGame = useCallback(() => {
    setGameState('playing');
    gameStateRef.current = 'playing';
    initEnemies();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, initEnemies]);

  // Reiniciar juego
  const restartGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    scoreRef.current = 0;
    levelRef.current = 1;
    livesRef.current = 3;

    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];

    lastEnemyMoveTimeRef.current = 0;
    lastEnemyShootTimeRef.current = 0;
    enemyMoveIntervalRef.current = 1000;
    enemyShootIntervalRef.current = 2000;

    enemyConfigRef.current.direction = 1;
    enemyConfigRef.current.speed = 1;

    playerRef.current.x = CANVAS_WIDTH / 2 - 25;
    playerRef.current.y = CANVAS_HEIGHT - 80;

    keysPressedRef.current = {};

    setGameState('playing');
    gameStateRef.current = 'playing';
    initEnemies();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, initEnemies]);

  // Toggle pausa
  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      setGameState('paused');
      gameStateRef.current = 'paused';
    } else if (gameStateRef.current === 'paused') {
      setGameState('playing');
      gameStateRef.current = 'playing';
    }
  }, []);

  // Event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'playing' && !keysPressedRef.current[e.key]) {
        keysPressedRef.current[e.key] = true;
        const player = playerRef.current;

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          player.x -= player.gridStep;
          player.x = Math.max(0, player.x);
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          player.x += player.gridStep;
          player.x = Math.min(CANVAS_WIDTH - player.width, player.x);
        }
      }

      if (e.key === ' ' && gameStateRef.current === 'playing') {
        e.preventDefault();
        shootBullet();
      }

      if (e.key === 'p' || e.key === 'P') {
        togglePause();
      }

      if ((e.key === 'r' || e.key === 'R') && gameStateRef.current === 'gameOver') {
        restartGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [restartGame, shootBullet, togglePause]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>👾 SPACE INVADERS</h1>
        <p className={styles.subtitle}>Defiende la Tierra de la invasión alienígena</p>
      </header>

      <div className={styles.gameLayout}>
        <div className={styles.gameColumn}>
          <div className={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className={styles.canvas}
            />

          {/* Pantalla de inicio */}
          {gameState === 'start' && (
            <div className={styles.gameScreen}>
              <div className={styles.screenContent}>
                <h2>SPACE INVADERS</h2>
                <p className={styles.instructions}>Defiende la Tierra de la invasión alienígena</p>
                <div className={styles.enemyPreview}>
                  <div className={styles.previewItem}>
                    <span className={styles.enemyIcon}>👾</span>
                    <span className={styles.points}>= 30 puntos</span>
                  </div>
                  <div className={styles.previewItem}>
                    <span className={styles.enemyIcon}>👽</span>
                    <span className={styles.points}>= 20 puntos</span>
                  </div>
                  <div className={styles.previewItem}>
                    <span className={styles.enemyIcon}>🛸</span>
                    <span className={styles.points}>= 10 puntos</span>
                  </div>
                </div>
                <button onClick={startGame} className={styles.gameBtn}>
                  INICIAR JUEGO
                </button>
              </div>
            </div>
          )}

          {/* Pantalla de pausa */}
          {gameState === 'paused' && (
            <div className={styles.gameScreen}>
              <div className={styles.screenContent}>
                <h2>PAUSA</h2>
                <p>Presiona P para continuar</p>
              </div>
            </div>
          )}

          {/* Pantalla de Game Over */}
          {gameState === 'gameOver' && (
            <div className={styles.gameScreen}>
              <div className={styles.screenContent}>
                <h2>GAME OVER</h2>
                <p>Puntuación final: {formatNumber(score, 0)}</p>
                <p>Mejor puntuación: {formatNumber(highScore, 0)}</p>
                <button onClick={restartGame} className={styles.gameBtn}>
                  JUGAR DE NUEVO
                </button>
              </div>
            </div>
          )}
          </div>

          {/* Controles táctiles para móvil */}
          <div className={styles.touchControls}>
            <div className={styles.touchControlsLeft}>
              <button
                type="button"
                className={styles.touchBtn}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (gameStateRef.current === 'playing') {
                    const player = playerRef.current;
                    player.x -= player.gridStep;
                    player.x = Math.max(0, player.x);
                  }
                }}
                onTouchEnd={(e) => e.preventDefault()}
              >
                ←
              </button>
              <button
                type="button"
                className={styles.touchBtn}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (gameStateRef.current === 'playing') {
                    const player = playerRef.current;
                    player.x += player.gridStep;
                    player.x = Math.min(CANVAS_WIDTH - player.width, player.x);
                  }
                }}
                onTouchEnd={(e) => e.preventDefault()}
              >
                →
              </button>
            </div>
            <button
              type="button"
              className={`${styles.touchBtn} ${styles.touchBtnPause}`}
              onTouchStart={(e) => {
                e.preventDefault();
                togglePause();
              }}
            >
              ⏸
            </button>
            <div className={styles.touchControlsRight}>
              <button
                type="button"
                className={`${styles.touchBtn} ${styles.touchBtnFire}`}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (gameStateRef.current === 'playing') {
                    shootBullet();
                  }
                }}
                onTouchEnd={(e) => e.preventDefault()}
              >
                🔥
              </button>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Estadísticas</h3>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Puntuación:</span>
              <span className={styles.statValue}>{formatNumber(score, 0)}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Nivel:</span>
              <span className={styles.statValue}>{level}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Vidas:</span>
              <span className={styles.statValue}>{'❤️'.repeat(Math.max(0, lives))}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Récord:</span>
              <span className={styles.statValue}>{formatNumber(highScore, 0)}</span>
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Controles</h3>
            <div className={styles.controlRow}>
              <span className={styles.keyBtn}>← →</span>
              <span className={styles.controlDesc}>Mover</span>
            </div>
            <div className={styles.controlRow}>
              <span className={styles.keyBtn}>ESPACIO</span>
              <span className={styles.controlDesc}>Disparar</span>
            </div>
            <div className={styles.controlRow}>
              <span className={styles.keyBtn}>P</span>
              <span className={styles.controlDesc}>Pausa</span>
            </div>
            <div className={styles.controlRow}>
              <span className={styles.keyBtn}>R</span>
              <span className={styles.controlDesc}>Reiniciar</span>
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Enemigos</h3>
            <div className={styles.enemyRow}>
              <span className={styles.enemyEmoji}>👾</span>
              <span className={styles.enemyPoints}>30 pts</span>
            </div>
            <div className={styles.enemyRow}>
              <span className={styles.enemyEmoji}>👽</span>
              <span className={styles.enemyPoints}>20 pts</span>
            </div>
            <div className={styles.enemyRow}>
              <span className={styles.enemyEmoji}>🛸</span>
              <span className={styles.enemyPoints}>10 pts</span>
            </div>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('juego-space-invaders')} />

      <Footer appName="juego-space-invaders" />
    </div>
  );
}
