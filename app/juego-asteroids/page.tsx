'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './JuegoAsteroids.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Vector {
  x: number;
  y: number;
}

interface Ship {
  x: number;
  y: number;
  radius: number;
  angle: number;
  velocity: Vector;
  thrust: number;
  rotationSpeed: number;
  invulnerable: boolean;
  invulnerableTime: number;
}

interface Asteroid {
  x: number;
  y: number;
  radius: number;
  size: 'large' | 'medium' | 'small';
  points: number;
  velocity: Vector;
  rotation: number;
  angle: number;
  vertices: { angle: number; variance: number }[];
}

interface Bullet {
  x: number;
  y: number;
  velocity: Vector;
  life: number;
  fromUFO?: boolean;
}

interface UFO {
  x: number;
  y: number;
  radius: number;
  velocity: Vector;
  shootTimer: number;
  points: number;
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

type GameState = 'start' | 'playing' | 'paused' | 'gameOver';

// Constantes
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;
const MAX_BULLETS = 5;
const BULLET_SPEED = 8;
const BULLET_LIFE = 60;
const UFO_SPAWN_CHANCE = 0.001;
const UFO_SHOOT_INTERVAL = 120;

export default function JuegoAsteroidsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);

  // Refs para el estado del juego
  const shipRef = useRef<Ship>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: 15,
    angle: -Math.PI / 2,
    velocity: { x: 0, y: 0 },
    thrust: 0.15,
    rotationSpeed: 0.1,
    invulnerable: false,
    invulnerableTime: 0,
  });

  const asteroidsRef = useRef<Asteroid[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ufosRef = useRef<UFO[]>([]);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const gameStateRef = useRef<GameState>('start');

  // Cargar récord
  useEffect(() => {
    const saved = localStorage.getItem('asteroidsHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Sincronizar refs
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Generar forma de asteroide
  const generateAsteroidShape = useCallback(() => {
    const vertices: { angle: number; variance: number }[] = [];
    const numVertices = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const variance = 0.7 + Math.random() * 0.3;
      vertices.push({ angle, variance });
    }
    return vertices;
  }, []);

  // Crear asteroide
  const createAsteroid = useCallback((x: number, y: number, size: 'large' | 'medium' | 'small') => {
    const sizes = {
      large: { radius: 40, points: 20, speed: 0.8 },
      medium: { radius: 25, points: 50, speed: 1.2 },
      small: { radius: 15, points: 100, speed: 1.5 },
    };

    const config = sizes[size];
    const angle = Math.random() * Math.PI * 2;

    const asteroid: Asteroid = {
      x,
      y,
      radius: config.radius,
      size,
      points: config.points,
      velocity: {
        x: Math.cos(angle) * config.speed,
        y: Math.sin(angle) * config.speed,
      },
      rotation: (Math.random() - 0.5) * 0.05,
      angle: 0,
      vertices: generateAsteroidShape(),
    };

    asteroidsRef.current.push(asteroid);
  }, [generateAsteroidShape]);

  // Distancia entre objetos
  const distance = useCallback((obj1: { x: number; y: number }, obj2: { x: number; y: number }) => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Inicializar asteroides
  const initAsteroids = useCallback(() => {
    asteroidsRef.current = [];
    const numAsteroids = 2 + Math.floor(levelRef.current / 2);
    for (let i = 0; i < numAsteroids; i++) {
      let x: number, y: number;
      do {
        x = Math.random() * CANVAS_WIDTH;
        y = Math.random() * CANVAS_HEIGHT;
      } while (distance({ x, y }, shipRef.current) < 200);
      createAsteroid(x, y, 'large');
    }
  }, [createAsteroid, distance]);

  // Crear explosión
  const createExplosion = useCallback((x: number, y: number, count = 20, color = '#FFD700') => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        size: 2 + Math.random() * 3,
        color,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        alpha: 1,
      });
    }
  }, []);

  // Crear partículas de impulso
  const createThrustParticles = useCallback(() => {
    const ship = shipRef.current;
    const backAngle = ship.angle + Math.PI;
    for (let i = 0; i < 3; i++) {
      particlesRef.current.push({
        x: ship.x + Math.cos(backAngle) * ship.radius,
        y: ship.y + Math.sin(backAngle) * ship.radius,
        vx: Math.cos(backAngle + (Math.random() - 0.5) * 0.5) * 2,
        vy: Math.sin(backAngle + (Math.random() - 0.5) * 0.5) * 2,
        size: 2 + Math.random() * 2,
        color: '#FFA500',
        life: 20,
        maxLife: 20,
        alpha: 1,
      });
    }
  }, []);

  // Disparar
  const shootBullet = useCallback(() => {
    if (bulletsRef.current.length >= MAX_BULLETS) return;

    const ship = shipRef.current;
    bulletsRef.current.push({
      x: ship.x + Math.cos(ship.angle) * ship.radius,
      y: ship.y + Math.sin(ship.angle) * ship.radius,
      velocity: {
        x: Math.cos(ship.angle) * BULLET_SPEED + ship.velocity.x,
        y: Math.sin(ship.angle) * BULLET_SPEED + ship.velocity.y,
      },
      life: BULLET_LIFE,
    });
  }, []);

  // Spawn UFO
  const spawnUFO = useCallback(() => {
    const side = Math.random() < 0.5 ? -50 : CANVAS_WIDTH + 50;
    ufosRef.current.push({
      x: side,
      y: 50 + Math.random() * (CANVAS_HEIGHT - 100),
      radius: 20,
      velocity: {
        x: side < 0 ? 2 : -2,
        y: 0,
      },
      shootTimer: 0,
      points: 200,
    });
  }, []);

  // Disparo UFO
  const shootUFOBullet = useCallback((ufo: UFO) => {
    const ship = shipRef.current;
    const angle = Math.atan2(ship.y - ufo.y, ship.x - ufo.x);
    const inaccuracy = (Math.random() - 0.5) * 0.3;

    bulletsRef.current.push({
      x: ufo.x,
      y: ufo.y,
      velocity: {
        x: Math.cos(angle + inaccuracy) * 4,
        y: Math.sin(angle + inaccuracy) * 4,
      },
      life: BULLET_LIFE * 2,
      fromUFO: true,
    });
  }, []);

  // Siguiente nivel
  const nextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    levelRef.current += 1;
    shipRef.current.invulnerable = true;
    shipRef.current.invulnerableTime = 120;
    initAsteroids();
  }, [initAsteroids]);

  // Game Over
  const gameOver = useCallback(() => {
    setGameState('gameOver');
    gameStateRef.current = 'gameOver';

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('asteroidsHighScore', scoreRef.current.toString());
    }
  }, [highScore]);

  // Nave destruida
  const shipDestroyed = useCallback(() => {
    setLives(prev => {
      const newLives = prev - 1;
      livesRef.current = newLives;

      createExplosion(shipRef.current.x, shipRef.current.y, 30, '#00FF88');

      if (newLives <= 0) {
        gameOver();
      } else {
        shipRef.current.x = CANVAS_WIDTH / 2;
        shipRef.current.y = CANVAS_HEIGHT / 2;
        shipRef.current.velocity = { x: 0, y: 0 };
        shipRef.current.angle = -Math.PI / 2;
        shipRef.current.invulnerable = true;
        shipRef.current.invulnerableTime = 120;
      }

      return newLives;
    });
  }, [createExplosion, gameOver]);

  // Game Loop
  const gameLoop = useCallback(() => {
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

    frameCountRef.current++;
    const ship = shipRef.current;

    // Rotación
    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      ship.angle -= ship.rotationSpeed;
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      ship.angle += ship.rotationSpeed;
    }

    // Fricción y movimiento
    ship.velocity.x *= 0.97;
    ship.velocity.y *= 0.97;
    ship.x += ship.velocity.x;
    ship.y += ship.velocity.y;

    // Wrap around
    if (ship.x < 0) ship.x = CANVAS_WIDTH;
    if (ship.x > CANVAS_WIDTH) ship.x = 0;
    if (ship.y < 0) ship.y = CANVAS_HEIGHT;
    if (ship.y > CANVAS_HEIGHT) ship.y = 0;

    // Invulnerabilidad
    if (ship.invulnerable) {
      ship.invulnerableTime--;
      if (ship.invulnerableTime <= 0) {
        ship.invulnerable = false;
      }
    }

    // Actualizar balas
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      bullet.x += bullet.velocity.x;
      bullet.y += bullet.velocity.y;
      bullet.life--;

      if (bullet.x < 0) bullet.x = CANVAS_WIDTH;
      if (bullet.x > CANVAS_WIDTH) bullet.x = 0;
      if (bullet.y < 0) bullet.y = CANVAS_HEIGHT;
      if (bullet.y > CANVAS_HEIGHT) bullet.y = 0;

      return bullet.life > 0;
    });

    // Actualizar asteroides
    asteroidsRef.current.forEach(asteroid => {
      asteroid.x += asteroid.velocity.x;
      asteroid.y += asteroid.velocity.y;
      asteroid.angle += asteroid.rotation;

      if (asteroid.x < -asteroid.radius) asteroid.x = CANVAS_WIDTH + asteroid.radius;
      if (asteroid.x > CANVAS_WIDTH + asteroid.radius) asteroid.x = -asteroid.radius;
      if (asteroid.y < -asteroid.radius) asteroid.y = CANVAS_HEIGHT + asteroid.radius;
      if (asteroid.y > CANVAS_HEIGHT + asteroid.radius) asteroid.y = -asteroid.radius;
    });

    // Spawn UFO
    if (Math.random() < UFO_SPAWN_CHANCE && ufosRef.current.length === 0) {
      spawnUFO();
    }

    // Actualizar UFOs
    ufosRef.current.forEach(ufo => {
      ufo.x += ufo.velocity.x;
      ufo.shootTimer++;

      if (Math.random() < 0.02) {
        ufo.velocity.y = (Math.random() - 0.5) * 2;
      }

      if (ufo.shootTimer > UFO_SHOOT_INTERVAL) {
        shootUFOBullet(ufo);
        ufo.shootTimer = 0;
      }

      if (ufo.x < -50) ufo.x = CANVAS_WIDTH + 50;
      if (ufo.x > CANVAS_WIDTH + 50) ufo.x = -50;
      if (ufo.y < 50) ufo.y = 50;
      if (ufo.y > CANVAS_HEIGHT - 50) ufo.y = CANVAS_HEIGHT - 50;
    });

    // Actualizar partículas
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      return particle.life > 0;
    });

    // Colisiones balas vs asteroides
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      if (bullet.fromUFO) return;

      asteroidsRef.current.forEach((asteroid, asteroidIndex) => {
        if (distance(bullet, asteroid) < asteroid.radius) {
          asteroidsRef.current.splice(asteroidIndex, 1);
          bulletsRef.current.splice(bulletIndex, 1);
          setScore(prev => prev + asteroid.points);
          scoreRef.current += asteroid.points;

          createExplosion(asteroid.x, asteroid.y, 15, '#8B7355');

          if (asteroid.size === 'large') {
            createAsteroid(asteroid.x, asteroid.y, 'medium');
            createAsteroid(asteroid.x, asteroid.y, 'medium');
          } else if (asteroid.size === 'medium') {
            createAsteroid(asteroid.x, asteroid.y, 'small');
            createAsteroid(asteroid.x, asteroid.y, 'small');
          }

          if (asteroidsRef.current.length === 0) {
            nextLevel();
          }
        }
      });
    });

    // Colisiones balas vs UFOs
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      if (bullet.fromUFO) return;

      ufosRef.current.forEach((ufo, ufoIndex) => {
        if (distance(bullet, ufo) < ufo.radius) {
          ufosRef.current.splice(ufoIndex, 1);
          bulletsRef.current.splice(bulletIndex, 1);
          setScore(prev => prev + ufo.points);
          scoreRef.current += ufo.points;
          createExplosion(ufo.x, ufo.y, 20, '#FF3366');
        }
      });
    });

    // Colisiones nave
    if (!ship.invulnerable) {
      asteroidsRef.current.forEach(asteroid => {
        if (distance(ship, asteroid) < ship.radius + asteroid.radius) {
          shipDestroyed();
        }
      });

      bulletsRef.current.forEach((bullet, index) => {
        if (bullet.fromUFO && distance(ship, bullet) < ship.radius) {
          bulletsRef.current.splice(index, 1);
          shipDestroyed();
        }
      });

      ufosRef.current.forEach(ufo => {
        if (distance(ship, ufo) < ship.radius + ufo.radius) {
          shipDestroyed();
        }
      });
    }

    // Renderizado
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Estrellas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 100; i++) {
      const x = (i * 73) % CANVAS_WIDTH;
      const y = (i * 97) % CANVAS_HEIGHT;
      const size = (i % 3) * 0.5;
      ctx.fillRect(x, y, size, size);
    }

    // Dibujar nave
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    if (ship.invulnerable && Math.floor(frameCountRef.current / 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.strokeStyle = '#00FF88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ship.radius, 0);
    ctx.lineTo(-ship.radius, -ship.radius / 2);
    ctx.lineTo(-ship.radius / 2, 0);
    ctx.lineTo(-ship.radius, ship.radius / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Dibujar asteroides
    asteroidsRef.current.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.angle);

      ctx.strokeStyle = '#8B7355';
      ctx.lineWidth = 2;
      ctx.beginPath();

      asteroid.vertices.forEach((vertex, i) => {
        const x = Math.cos(vertex.angle) * asteroid.radius * vertex.variance;
        const y = Math.sin(vertex.angle) * asteroid.radius * vertex.variance;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    // Dibujar balas
    bulletsRef.current.forEach(bullet => {
      ctx.fillStyle = bullet.fromUFO ? '#FF3366' : '#00FFFF';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dibujar UFOs
    ufosRef.current.forEach(ufo => {
      ctx.save();
      ctx.translate(ufo.x, ufo.y);

      ctx.strokeStyle = '#FF3366';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, -5, 10, 0, Math.PI, true);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();

      ctx.restore();
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
  }, [createAsteroid, createExplosion, distance, nextLevel, shipDestroyed, shootUFOBullet, spawnUFO]);

  // Iniciar juego
  const startGame = useCallback(() => {
    setGameState('playing');
    gameStateRef.current = 'playing';
    initAsteroids();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, initAsteroids]);

  // Reiniciar juego
  const restartGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    scoreRef.current = 0;
    levelRef.current = 1;
    livesRef.current = 3;
    frameCountRef.current = 0;

    asteroidsRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    ufosRef.current = [];

    shipRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      radius: 15,
      angle: -Math.PI / 2,
      velocity: { x: 0, y: 0 },
      thrust: 0.15,
      rotationSpeed: 0.1,
      invulnerable: true,
      invulnerableTime: 120,
    };

    keysRef.current = {};
    keysPressedRef.current = {};

    setGameState('playing');
    gameStateRef.current = 'playing';
    initAsteroids();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, initAsteroids]);

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
      keysRef.current[e.key] = true;

      if (gameStateRef.current === 'playing' && !keysPressedRef.current[e.key]) {
        keysPressedRef.current[e.key] = true;

        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          const ship = shipRef.current;
          ship.velocity.x += Math.cos(ship.angle) * 3;
          ship.velocity.y += Math.sin(ship.angle) * 3;
          createThrustParticles();
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
      keysRef.current[e.key] = false;
      keysPressedRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [createThrustParticles, restartGame, shootBullet, togglePause]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🚀 ASTEROIDS</h1>
        <p className={styles.subtitle}>El clásico arcade de destrucción espacial</p>
      </header>

      <LegalNotice />

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
                <h2>ASTEROIDS</h2>
                <p className={styles.instructions}>Destruye los asteroides y esquiva los OVNIs</p>
                <div className={styles.gameRules}>
                  <p>🚀 La nave tiene inercia - controla tu velocidad</p>
                  <p>🪨 Los asteroides grandes se dividen en medianos</p>
                  <p>🪨 Los medianos se dividen en pequeños</p>
                  <p>🛸 Los OVNIs aparecen aleatoriamente y disparan</p>
                  <p>⚠️ Los bordes te teletransportan al lado opuesto</p>
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
                  keysRef.current['ArrowLeft'] = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  keysRef.current['ArrowLeft'] = false;
                }}
              >
                ↺
              </button>
              <button
                type="button"
                className={styles.touchBtn}
                onTouchStart={(e) => {
                  e.preventDefault();
                  keysRef.current['ArrowRight'] = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  keysRef.current['ArrowRight'] = false;
                }}
              >
                ↻
              </button>
            </div>
            <div className={styles.touchControlsCenter}>
              <button
                type="button"
                className={`${styles.touchBtn} ${styles.touchBtnThrust}`}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (gameStateRef.current === 'playing') {
                    const ship = shipRef.current;
                    ship.velocity.x += Math.cos(ship.angle) * 3;
                    ship.velocity.y += Math.sin(ship.angle) * 3;
                    createThrustParticles();
                  }
                }}
                onTouchEnd={(e) => e.preventDefault()}
              >
                🚀
              </button>
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
            </div>
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
              <span className={styles.statValue}>{'🚀'.repeat(Math.max(0, lives))}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Récord:</span>
              <span className={styles.statValue}>{formatNumber(highScore, 0)}</span>
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Controles</h3>
            <div className={styles.controlRow}>
              <span className={styles.keyBtn}>↑</span>
              <span className={styles.controlDesc}>Impulso</span>
            </div>
            <div className={styles.controlRow}>
              <span className={styles.keyBtn}>← →</span>
              <span className={styles.controlDesc}>Rotar</span>
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
            <h3 className={styles.panelTitle}>Puntuación</h3>
            <div className={styles.enemyRow}>
              <span className={styles.asteroidLabel}>Grande 🪨</span>
              <span className={styles.enemyPoints}>20 pts</span>
            </div>
            <div className={styles.enemyRow}>
              <span className={styles.asteroidLabel}>Medio 🪨</span>
              <span className={styles.enemyPoints}>50 pts</span>
            </div>
            <div className={styles.enemyRow}>
              <span className={styles.asteroidLabel}>Pequeño 🪨</span>
              <span className={styles.enemyPoints}>100 pts</span>
            </div>
            <div className={styles.enemyRow}>
              <span className={styles.asteroidLabel}>OVNI 🛸</span>
              <span className={styles.enemyPoints}>200 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres saber más sobre Asteroids y los arcades clásicos?"
        subtitle="Descubre la historia, la física y los secretos del clásico de los 80"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>4 arcades clásicos de los 80: comparativa</h2>
          <p>
            Asteroids no fue el único mito de los salones recreativos. Aquí puedes comparar
            los cuatro títulos que definieron una generación de jugadores.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Juego</th>
                  <th>Año original</th>
                  <th>Mecánica principal</th>
                  <th>Habilidad ejercitada</th>
                  <th>Dificultad progresiva</th>
                  <th>Legado cultural</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🚀 Asteroids</td>
                  <td>1979</td>
                  <td>Destruir rocas espaciales con inercia newtoniana</td>
                  <td>Control de inercia y precisión de disparo</td>
                  <td>Más asteroides y OVNI según nivel</td>
                  <td>Primer juego con puntuación de más de 1 millón de pts</td>
                </tr>
                <tr>
                  <td>👾 Space Invaders</td>
                  <td>1978</td>
                  <td>Disparar oleadas de alienígenas en formación</td>
                  <td>Velocidad de reacción y gestión del tiempo</td>
                  <td>Los invasores aceleran al quedar pocos</td>
                  <td>Primer fenómeno cultural masivo del videojuego</td>
                </tr>
                <tr>
                  <td>👻 Pac-Man</td>
                  <td>1980</td>
                  <td>Recorrer laberintos comiendo puntos y huyendo</td>
                  <td>Memoria espacial y anticipación de patrones</td>
                  <td>Los fantasmas aumentan velocidad y agresividad</td>
                  <td>Primer personaje de videojuego reconocible mundialmente</td>
                </tr>
                <tr>
                  <td>🐝 Galaga</td>
                  <td>1981</td>
                  <td>Disparar oleadas de insectos espaciales en formación</td>
                  <td>Precisión de puntería y multitarea</td>
                  <td>Formaciones más complejas y ataques en picado</td>
                  <td>Referente del género shoot &apos;em up vertical</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Para qué sirve jugar a Asteroids hoy?</h2>
          <p>
            Más allá de la diversión, los arcades clásicos tienen usos prácticos
            y educativos que siguen siendo relevantes décadas después.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🕹️</span>
                <h4>Nostalgia gamer</h4>
              </div>
              <p className={styles.escenarioExample}>
                Si creciste en los 80 o 90, Asteroids es un viaje directo a los
                salones recreativos de barrio. La misma tensión, la misma inercia
                impredecible, el mismo sonido de explosión.
              </p>
              <p className={styles.escenarioTip}>
                Tip: comparte la pantalla con alguien mayor y cuéntale que esto
                costaba 25 pesetas por partida en 1980.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎯</span>
                <h4>Ejercicio de reflejos y coordinación</h4>
              </div>
              <p className={styles.escenarioExample}>
                La inercia newtoniana de la nave obliga al jugador a anticipar
                trayectorias, coordinar rotación con disparo y tomar decisiones
                rápidas bajo presión constante.
              </p>
              <p className={styles.escenarioTip}>
                Tip: 10-15 minutos diarios de Asteroids mejoran la coordinación
                mano-ojo de forma similar a otros juegos de precisión.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
                <h4>Historia de los videojuegos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Asteroids es un documento vivo del estado de la tecnología en 1979.
                Los gráficos vectoriales, la física simplificada y la dificultad
                infinita son soluciones creativas a las limitaciones del hardware.
              </p>
              <p className={styles.escenarioTip}>
                Tip: ideal para introducir a estudiantes de programación en los
                conceptos de bucle de juego, colisiones y física básica.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre Asteroids</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuándo fue creado el Asteroids original?</summary>
                <p>
                  Asteroids fue lanzado por Atari en noviembre de 1979. Fue diseñado
                  por Lyle Rains y Ed Logg, y se convirtió en el juego arcade más
                  vendido de Atari hasta esa fecha. Llegó a España en los salones
                  recreativos a principios de los años 80.
                </p>
                <p className={styles.faqTip}>
                  Dato: Atari vendió más de 70.000 cabinetes arcade de Asteroids
                  en todo el mundo, una cifra récord para la época.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué hace especial la física de Asteroids?</summary>
                <p>
                  A diferencia de la mayoría de arcades de su época, Asteroids
                  implementa inercia newtoniana real: la nave no se detiene al soltar
                  el impulso, sino que sigue moviéndose hasta que otra fuerza la
                  frena. Esto crea una curva de aprendizaje única donde el control
                  del movimiento es tan importante como la puntería.
                </p>
                <p className={styles.faqTip}>
                  Curiosidad: la pantalla envolvente (wrap-around) donde salir por
                  un lado te hace aparecer por el opuesto fue una solución técnica
                  que se convirtió en mecánica de juego icónica.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Los juegos arcade mejoran los reflejos?</summary>
                <p>
                  Varios estudios en neurociencia cognitiva han demostrado que los
                  videojuegos de acción mejoran la velocidad de procesamiento visual
                  y la toma de decisiones bajo presión. Los arcades como Asteroids,
                  con su ritmo rápido y consecuencias inmediatas, son especialmente
                  efectivos para entrenar reflejos y coordinación mano-ojo.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es el récord mundial de Asteroids?</summary>
                <p>
                  El récord oficial del Asteroids original en recreativa fue establecido
                  por Scott Safran en 1982 con una puntuación de 41.336.440 puntos,
                  en una partida que duró más de 58 horas continuas. Este récord fue
                  reconocido por Twin Galaxies, la organización oficial de récords de
                  videojuegos arcade, y se mantuvo durante décadas.
                </p>
                <p className={styles.faqTip}>
                  Referencia: Twin Galaxies Leaderboards, Asteroids Classic Arcade.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Por qué los juegos retro siguen siendo populares?</summary>
                <p>
                  Los juegos retro ofrecen una combinación de nostalgia, accesibilidad
                  inmediata (sin tutoriales largos) y dificultad honesta (el juego no
                  te da ventajas). Además, su mecánica simple pero profunda sigue siendo
                  satisfactoria décadas después, algo que muchos juegos modernos con
                  gráficos complejos no logran. La comunidad retrogamer crece año a año
                  en España y en todo el mundo.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo dominar Asteroids en 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Aprende los controles básicos: girar, impulsar, disparar</strong>
                <p>
                  Usa las flechas izquierda y derecha para rotar la nave, la flecha
                  arriba para aplicar impulso en la dirección que apuntas, y la barra
                  espaciadora para disparar. En móvil, usa los botones táctiles de la
                  parte inferior de la pantalla.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Gestiona la inercia: no hay frenos, hay que anticipar</strong>
                <p>
                  Este es el concepto más importante de Asteroids. La nave no para
                  al soltar el impulso. Para detenerte, debes rotar 180° y aplicar
                  impulso en sentido contrario. Practica moviéndote despacio al
                  principio hasta interiorizar esta mecánica.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Destruye los asteroides grandes primero: dan menos fragmentos</strong>
                <p>
                  Un asteroide grande (20 pts) se divide en 2 medianos (50 pts cada uno).
                  Un mediano se divide en 2 pequeños (100 pts cada uno). Destruir un
                  grande por completo hasta los pequeños te da 520 puntos totales.
                  Prioriza eliminar toda la cadena antes de pasar al siguiente grande.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Cuidado con los fragmentos pequeños: más rápidos y difíciles</strong>
                <p>
                  Los asteroides pequeños se mueven más deprisa que los grandes y
                  tienen trayectorias más impredecibles. No los ignores creyendo que
                  son menos peligrosos: son los que más muertes provocan a jugadores
                  intermedios por exceso de confianza.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Limita tus disparos: solo 5 balas activas a la vez</strong>
                <p>
                  El juego permite un máximo de 5 balas en pantalla simultáneamente.
                  Si disparas sin control, te quedarás sin munición disponible justo
                  cuando más la necesites. Dispara con criterio, deja que las balas
                  antiguas expiren o impacten antes de saturar la pantalla con nuevos disparos.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 estrategias para mejorar tu puntuación</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Mantén el centro del campo libre</h4>
              <p>
                Intenta limpiar el área central del mapa antes que los bordes.
                Estar en el centro te da más tiempo de reacción ante cualquier
                asteroide que se aproxime desde cualquier dirección.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💥</span>
              <h4>Dispara en ráfagas cortas y precisas</h4>
              <p>
                El juego limita a 5 balas en pantalla simultáneamente. Disparar
                sin control malgasta balas y te deja desprotegido. Apunta antes
                de disparar y espera a que las balas impacten o desaparezcan
                antes de volver a disparar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔮</span>
              <h4>Anticipa la trayectoria de los fragmentos</h4>
              <p>
                Al destruir un asteroide, sus fragmentos salen en direcciones
                predecibles basadas en el ángulo de impacto. Con práctica,
                podrás disparar de forma que los fragmentos resultantes queden
                ya en la línea de fuego de tus próximas balas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>Domina la rotación antes que el impulso</h4>
              <p>
                Practica girar la nave con las flechas izquierda/derecha (o A/D)
                sin aplicar impulso. Cuanto más preciso sea tu ángulo de disparo
                antes de acelerar, menos correcciones de inercia necesitarás
                después y menos riesgo de colisión por movimientos descontrolados.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores que acaban con tu partida</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Disparar sin control.</strong> Llenar la pantalla de balas
                parece efectivo pero agota tu límite de 5 proyectiles simultáneos,
                dejándote sin defensa mientras la pantalla se llena de fragmentos
                pequeños más rápidos y difíciles de esquivar.
              </li>
              <li>
                <strong>Quedarse quieto en el centro.</strong> Mantenerse parado
                en el centro del campo creyendo que tienes buena visión general
                te convierte en un blanco estático fácil para los asteroides
                y especialmente para los disparos del OVNI.
              </li>
              <li>
                <strong>No gestionar la inercia.</strong> El error más común de
                jugadores nuevos: aplicar impulso hacia un asteroide sin calcular
                que la nave seguirá moviéndose en esa dirección aunque dejes de
                pulsar. La inercia residual mata más que los propios asteroides.
              </li>
              <li>
                <strong>Vaciar el cargador sin necesidad.</strong> Disparar sin
                parar hasta agotar las 5 balas disponibles te deja sin capacidad
                de respuesta justo cuando aparece una amenaza real, como un
                asteroide cercano o un disparo del OVNI.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-asteroids')} />

      <ShareCard appName="juego-asteroids" />
      <Footer appName="juego-asteroids" />
    </div>
  );
}
