'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './JuegoPlatformRunner.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { formatNumber } from '@/lib';

// Tipos
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  onGround: boolean;
  color: string;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'platform' | 'flag';
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  onGround: boolean;
}

interface Coin {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
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

type GameState = 'start' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';

// Constantes
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const PLAYER_SPEED = 4;
const ENEMY_SPEED = 2;

export default function JuegoPlatformRunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Refs para el estado del juego
  const playerRef = useRef<Player>({
    x: 50,
    y: 0,
    width: 30,
    height: 30,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    color: '#00FF88',
  });

  const platformsRef = useRef<Platform[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const coinsCollectedRef = useRef(0);
  const gameStateRef = useRef<GameState>('start');

  // Cargar récord
  useEffect(() => {
    const saved = localStorage.getItem('platformRunnerHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Sincronizar refs
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { coinsCollectedRef.current = coinsCollected; }, [coinsCollected]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Inicializar nivel
  const initLevel = useCallback(() => {
    platformsRef.current = [];
    enemiesRef.current = [];
    coinsRef.current = [];
    setCoinsCollected(0);
    coinsCollectedRef.current = 0;

    // Suelo
    platformsRef.current.push({ x: 0, y: 450, width: CANVAS_WIDTH, height: 50, type: 'ground' });

    const currentLevel = levelRef.current;

    if (currentLevel === 1) {
      // Nivel 1 - Tutorial básico
      platformsRef.current.push({ x: 150, y: 380, width: 100, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 300, y: 320, width: 100, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 450, y: 260, width: 100, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 550, y: 200, width: 100, height: 20, type: 'platform' });

      coinsRef.current.push({ x: 180, y: 340, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 330, y: 280, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 480, y: 220, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 580, y: 160, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 200, y: 410, width: 20, height: 20, collected: false });

      enemiesRef.current.push({ x: 250, y: 0, width: 25, height: 25, velocityX: ENEMY_SPEED, velocityY: 0, onGround: false });
      enemiesRef.current.push({ x: 400, y: 0, width: 25, height: 25, velocityX: -ENEMY_SPEED, velocityY: 0, onGround: false });

      platformsRef.current.push({ x: 600, y: 150, width: 40, height: 50, type: 'flag' });
    } else if (currentLevel === 2) {
      // Nivel 2 - Más desafiante
      platformsRef.current.push({ x: 100, y: 380, width: 80, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 220, y: 330, width: 80, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 340, y: 280, width: 80, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 460, y: 230, width: 80, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 580, y: 180, width: 80, height: 20, type: 'platform' });

      coinsRef.current.push({ x: 130, y: 340, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 250, y: 290, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 370, y: 240, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 490, y: 190, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 610, y: 140, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 150, y: 410, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 300, y: 410, width: 20, height: 20, collected: false });

      enemiesRef.current.push({ x: 200, y: 0, width: 25, height: 25, velocityX: ENEMY_SPEED, velocityY: 0, onGround: false });
      enemiesRef.current.push({ x: 350, y: 0, width: 25, height: 25, velocityX: -ENEMY_SPEED, velocityY: 0, onGround: false });
      enemiesRef.current.push({ x: 500, y: 0, width: 25, height: 25, velocityX: ENEMY_SPEED, velocityY: 0, onGround: false });

      platformsRef.current.push({ x: 640, y: 130, width: 40, height: 50, type: 'flag' });
    } else {
      // Nivel 3+ - Avanzado
      platformsRef.current.push({ x: 80, y: 400, width: 70, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 180, y: 350, width: 70, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 280, y: 300, width: 70, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 380, y: 250, width: 70, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 480, y: 200, width: 70, height: 20, type: 'platform' });
      platformsRef.current.push({ x: 580, y: 150, width: 70, height: 20, type: 'platform' });

      coinsRef.current.push({ x: 110, y: 360, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 210, y: 310, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 310, y: 260, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 410, y: 210, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 510, y: 160, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 610, y: 110, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 100, y: 420, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 250, y: 420, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 400, y: 420, width: 20, height: 20, collected: false });
      coinsRef.current.push({ x: 550, y: 420, width: 20, height: 20, collected: false });

      enemiesRef.current.push({ x: 150, y: 0, width: 25, height: 25, velocityX: ENEMY_SPEED, velocityY: 0, onGround: false });
      enemiesRef.current.push({ x: 300, y: 0, width: 25, height: 25, velocityX: -ENEMY_SPEED, velocityY: 0, onGround: false });
      enemiesRef.current.push({ x: 450, y: 0, width: 25, height: 25, velocityX: ENEMY_SPEED, velocityY: 0, onGround: false });
      enemiesRef.current.push({ x: 600, y: 0, width: 25, height: 25, velocityX: -ENEMY_SPEED, velocityY: 0, onGround: false });

      platformsRef.current.push({ x: 640, y: 100, width: 40, height: 50, type: 'flag' });
    }

    setTotalCoins(coinsRef.current.length);
    playerRef.current.x = 50;
    playerRef.current.y = 0;
    playerRef.current.velocityX = 0;
    playerRef.current.velocityY = 0;
    playerRef.current.onGround = false;
  }, []);

  // Colisión AABB
  const checkCollision = useCallback((rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }, []);

  // Crear partículas de moneda
  const createCoinParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        size: 3 + Math.random() * 3,
        color: '#FFD700',
        life: 30,
        maxLife: 30,
        alpha: 1,
      });
    }
  }, []);

  // Crear explosión
  const createExplosion = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        size: 2 + Math.random() * 4,
        color,
        life: 40,
        maxLife: 40,
        alpha: 1,
      });
    }
  }, []);

  // Game Over
  const gameOver = useCallback(() => {
    setGameState('gameOver');
    gameStateRef.current = 'gameOver';

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('platformRunnerHighScore', scoreRef.current.toString());
    }
  }, [highScore]);

  // Nivel completado
  const levelComplete = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    setGameState('levelComplete');
    gameStateRef.current = 'levelComplete';
  }, []);

  // Jugador muere
  const playerDie = useCallback(() => {
    createExplosion(playerRef.current.x + playerRef.current.width / 2, playerRef.current.y + playerRef.current.height / 2, '#00FF88');

    setLives(prev => {
      const newLives = prev - 1;
      livesRef.current = newLives;

      if (newLives <= 0) {
        gameOver();
      } else {
        playerRef.current.x = 50;
        playerRef.current.y = 0;
        playerRef.current.velocityX = 0;
        playerRef.current.velocityY = 0;
        playerRef.current.onGround = false;
      }

      return newLives;
    });
  }, [createExplosion, gameOver]);

  // Siguiente nivel
  const nextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    levelRef.current += 1;
    setGameState('playing');
    gameStateRef.current = 'playing';
    initLevel();
  }, [initLevel]);

  // Game Loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameStateRef.current !== 'playing') {
      if (gameStateRef.current !== 'gameOver' && gameStateRef.current !== 'levelComplete') {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }

    const player = playerRef.current;

    // Movimiento horizontal
    if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
      player.velocityX = -PLAYER_SPEED;
    } else if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
      player.velocityX = PLAYER_SPEED;
    } else {
      player.velocityX = 0;
    }

    // Gravedad
    player.velocityY += GRAVITY;

    // Actualizar posición
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Límites horizontales
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;

    // Colisiones con plataformas
    player.onGround = false;
    platformsRef.current.forEach(platform => {
      if (checkCollision(player, platform)) {
        if (platform.type === 'flag') {
          levelComplete();
          return;
        }

        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.onGround = true;
        } else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        }
      }
    });

    // Caer del mapa
    if (player.y > CANVAS_HEIGHT) {
      playerDie();
    }

    // Actualizar enemigos
    enemiesRef.current.forEach((enemy, index) => {
      enemy.velocityY += GRAVITY;
      enemy.x += enemy.velocityX;
      enemy.y += enemy.velocityY;

      enemy.onGround = false;
      platformsRef.current.forEach(platform => {
        if (platform.type === 'flag') return;

        if (checkCollision(enemy, platform)) {
          if (enemy.velocityY > 0 && enemy.y + enemy.height - enemy.velocityY <= platform.y) {
            enemy.y = platform.y - enemy.height;
            enemy.velocityY = 0;
            enemy.onGround = true;
          }
        }
      });

      // Cambiar dirección en bordes
      if (enemy.x <= 0 || enemy.x + enemy.width >= CANVAS_WIDTH) {
        enemy.velocityX *= -1;
      }

      // Cambiar dirección si no hay suelo
      const nextX = enemy.x + enemy.velocityX * 5;
      let hasGroundAhead = false;
      platformsRef.current.forEach(platform => {
        if (platform.type === 'flag') return;
        const testObj = { x: nextX, y: enemy.y + enemy.height + 5, width: enemy.width, height: 5 };
        if (checkCollision(testObj, platform)) {
          hasGroundAhead = true;
        }
      });
      if (!hasGroundAhead && enemy.onGround) {
        enemy.velocityX *= -1;
      }

      // Eliminar si cae
      if (enemy.y > CANVAS_HEIGHT) {
        enemiesRef.current.splice(index, 1);
      }
    });

    // Recoger monedas
    coinsRef.current.forEach(coin => {
      if (!coin.collected && checkCollision(player, coin)) {
        coin.collected = true;
        setCoinsCollected(prev => prev + 1);
        coinsCollectedRef.current += 1;
        setScore(prev => prev + 10);
        scoreRef.current += 10;
        createCoinParticles(coin.x + coin.width / 2, coin.y + coin.height / 2);
      }
    });

    // Actualizar partículas
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      return particle.life > 0;
    });

    // Colisiones con enemigos
    enemiesRef.current.forEach((enemy, index) => {
      if (checkCollision(player, enemy)) {
        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y + 10) {
          enemiesRef.current.splice(index, 1);
          player.velocityY = JUMP_STRENGTH * 0.7;
          setScore(prev => prev + 50);
          scoreRef.current += 50;
          createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#FF3366');
        } else {
          playerDie();
        }
      }
    });

    // Renderizado
    // Fondo con degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Nubes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(130, 80, 40, 0, Math.PI * 2);
    ctx.arc(160, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(400, 120, 35, 0, Math.PI * 2);
    ctx.arc(435, 120, 45, 0, Math.PI * 2);
    ctx.arc(475, 120, 35, 0, Math.PI * 2);
    ctx.fill();

    // Dibujar plataformas
    platformsRef.current.forEach(platform => {
      if (platform.type === 'flag') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x + 5, platform.y, 5, platform.height);
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(platform.x + 10, platform.y);
        ctx.lineTo(platform.x + 35, platform.y + 15);
        ctx.lineTo(platform.x + 10, platform.y + 30);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = platform.type === 'ground' ? '#8B4513' : '#A0522D';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(platform.x, platform.y);
        ctx.lineTo(platform.x + platform.width, platform.y);
        ctx.stroke();
      }
    });

    // Dibujar monedas
    coinsRef.current.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2 - 3, coin.y + coin.height / 2 - 3, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Dibujar enemigos
    enemiesRef.current.forEach(enemy => {
      ctx.fillStyle = '#FF3366';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(enemy.x + 5, enemy.y + 6, 5, 5);
      ctx.fillRect(enemy.x + 15, enemy.y + 6, 5, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(enemy.x + 7, enemy.y + 8, 2, 2);
      ctx.fillRect(enemy.x + 17, enemy.y + 8, 2, 2);
    });

    // Dibujar jugador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 8, player.y + 8, 5, 5);
    ctx.fillRect(player.x + 17, player.y + 8, 5, 5);

    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 18, 6, 0, Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

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
  }, [checkCollision, createCoinParticles, createExplosion, levelComplete, playerDie]);

  // Iniciar juego
  const startGame = useCallback(() => {
    setGameState('playing');
    gameStateRef.current = 'playing';
    initLevel();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, initLevel]);

  // Reiniciar juego
  const restartGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setCoinsCollected(0);
    scoreRef.current = 0;
    levelRef.current = 1;
    livesRef.current = 3;
    coinsCollectedRef.current = 0;

    platformsRef.current = [];
    enemiesRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];

    playerRef.current = {
      x: 50,
      y: 0,
      width: 30,
      height: 30,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      color: '#00FF88',
    };

    keysRef.current = {};

    setGameState('playing');
    gameStateRef.current = 'playing';
    initLevel();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, initLevel]);

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

      if (e.key === ' ' && gameStateRef.current === 'playing' && playerRef.current.onGround) {
        e.preventDefault();
        playerRef.current.velocityY = JUMP_STRENGTH;
        playerRef.current.onGround = false;
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
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [restartGame, togglePause]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏃 PLATFORM RUNNER</h1>
        <p className={styles.subtitle}>Corre, salta y recolecta monedas</p>
      </header>

      <div className={styles.gameLayout}>
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
                <h2>PLATFORM RUNNER</h2>
                <p className={styles.instructions}>Corre, salta y recolecta monedas</p>
                <div className={styles.gameRules}>
                  <p>🟢 Controla al cubo verde con las flechas</p>
                  <p>🪙 Recolecta monedas para sumar puntos</p>
                  <p>🔴 Salta encima de enemigos para eliminarlos</p>
                  <p>⚠️ Evita tocar enemigos por los lados</p>
                  <p>🚩 Llega a la bandera para completar el nivel</p>
                  <p>❤️ Tienes 3 vidas - ¡úsalas sabiamente!</p>
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

          {/* Pantalla de nivel completado */}
          {gameState === 'levelComplete' && (
            <div className={styles.gameScreen}>
              <div className={styles.screenContent}>
                <h2>¡NIVEL COMPLETADO!</h2>
                <p>Puntuación: {formatNumber(score, 0)}</p>
                <p>Monedas recolectadas: {coinsCollected}/{totalCoins}</p>
                <button onClick={nextLevel} className={styles.gameBtn}>
                  SIGUIENTE NIVEL
                </button>
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
              <span className={styles.statLabel}>Monedas:</span>
              <span className={styles.statValue}>{coinsCollected}/{totalCoins}</span>
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
              <span className={styles.controlDesc}>Saltar</span>
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
            <h3 className={styles.panelTitle}>Elementos</h3>
            <div className={styles.elementRow}>
              <span className={styles.elementIcon}>🟢</span>
              <span className={styles.elementDesc}>Jugador</span>
            </div>
            <div className={styles.elementRow}>
              <span className={styles.elementIcon}>🪙</span>
              <span className={styles.elementDesc}>Moneda: 10 pts</span>
            </div>
            <div className={styles.elementRow}>
              <span className={styles.elementIcon}>🔴</span>
              <span className={styles.elementDesc}>Enemigo: 50 pts</span>
            </div>
            <div className={styles.elementRow}>
              <span className={styles.elementIcon}>🚩</span>
              <span className={styles.elementDesc}>Meta del nivel</span>
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Consejos</h3>
            <p className={styles.tip}>💡 Salta encima de enemigos para eliminarlos</p>
            <p className={styles.tip}>💡 Recoge todas las monedas</p>
            <p className={styles.tip}>💡 Llega a la bandera para avanzar</p>
          </div>
        </div>
      </div>

      <Footer appName="juego-platform-runner" />
    </div>
  );
}
