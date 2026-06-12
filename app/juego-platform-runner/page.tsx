'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './JuegoPlatformRunner.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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
                ←
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
                className={`${styles.touchBtn} ${styles.touchBtnJump}`}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (gameStateRef.current === 'playing' && playerRef.current.onGround) {
                    playerRef.current.velocityY = JUMP_STRENGTH;
                    playerRef.current.onGround = false;
                  }
                }}
                onTouchEnd={(e) => e.preventDefault()}
              >
                ⬆
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

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres saber más sobre juegos de plataformas?"
        subtitle="Descubre los tipos de runner, cómo mejorar tus reflejos y los secretos del género"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Tipos de juegos de plataformas</h2>
          <p>
            Los juegos de plataformas y runner abarcan subgéneros muy distintos, cada uno
            con su propia mecánica y curva de aprendizaje. Aquí tienes una comparativa.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Mecánica principal</th>
                  <th>Habilidad requerida</th>
                  <th>Curva de dificultad</th>
                  <th>Tiempo de sesión típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🏃 Runner infinito</td>
                  <td>Correr y esquivar obstáculos generados aleatoriamente</td>
                  <td>Reflejos rápidos y anticipación</td>
                  <td>Progresiva (velocidad creciente)</td>
                  <td>2 – 10 minutos</td>
                </tr>
                <tr>
                  <td>🍄 Plataformas clásico</td>
                  <td>Navegar niveles con saltos precisos y eliminar enemigos</td>
                  <td>Precisión y memoria espacial</td>
                  <td>Escalonada por niveles</td>
                  <td>15 – 45 minutos</td>
                </tr>
                <tr>
                  <td>🎵 Runner rítmico</td>
                  <td>Sincronizar saltos y acciones con la música</td>
                  <td>Sentido del ritmo y coordinación</td>
                  <td>Alta desde el principio</td>
                  <td>3 – 15 minutos</td>
                </tr>
                <tr>
                  <td>🧩 Plataformas puzzle</td>
                  <td>Resolver puzles usando mecánicas de salto y gravedad</td>
                  <td>Pensamiento lógico y paciencia</td>
                  <td>Variable según puzle</td>
                  <td>20 – 60 minutos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Cuándo jugar a un platform runner?</h2>
          <p>
            Los juegos de plataformas se adaptan perfectamente a distintos momentos del día
            según lo que busques.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⏱️</span>
                <h4>Juego rápido en pausas cortas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Tienes 5 – 10 minutos libres entre reuniones o mientras esperas. Un runner
                infinito es perfecto: una partida rápida, sin necesidad de guardar progreso
                ni recordar dónde estabas.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: los runners infinitos están diseñados para sesiones cortas. No hace
                falta completar nada para sentir satisfacción.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚡</span>
                <h4>Entrenamiento de reflejos y coordinación</h4>
              </div>
              <p className={styles.escenarioExample}>
                Jugar a plataformas de forma regular entrena la coordinación ojo-mano y los
                tiempos de reacción. Útil para mantener agilidad mental en todas las edades.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: aumenta gradualmente la dificultad. El progreso en juegos de
                reflejos es fácilmente medible comparando tus puntuaciones.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
                <h4>Entretenimiento casual sin compromisos</h4>
              </div>
              <p className={styles.escenarioExample}>
                A diferencia de los RPGs o los juegos de estrategia, los runners no exigen
                horas de dedicación ni seguir una historia. Puedes empezar y parar cuando
                quieras sin perder nada importante.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: ideales para personas que quieren disfrutar de videojuegos sin
                compromisos de tiempo o sin tener que aprender mecánicas complejas.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre plataformas y runners</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué es un endless runner?</summary>
                <p>
                  Un endless runner (runner infinito) es un género de videojuego en el que
                  el personaje se mueve automáticamente hacia adelante sin detenerse. El
                  jugador solo controla saltos, deslizamientos u otras acciones para esquivar
                  obstáculos generados de forma procedural. El objetivo es sobrevivir el mayor
                  tiempo o distancia posible. Temple Run y Subway Surfers son ejemplos icónicos.
                </p>
                <p className={styles.faqTip}>
                  Curiosidad: el género despegó en dispositivos móviles gracias a que su
                  mecánica de un solo botón es perfecta para pantallas táctiles.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Los juegos de plataformas mejoran los reflejos?</summary>
                <p>
                  Algunos estudios de psicología cognitiva sugieren que los juegos
                  de acción y plataformas podrían mejorar el tiempo de reacción visual, la atención
                  dividida y la coordinación ojo-mano, aunque los resultados varían según el estudio. El efecto, cuando se observa, parece más pronunciado con
                  práctica regular de 20 – 30 minutos diarios. En cualquier caso, no sustituyen el ejercicio
                  físico.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál fue el primer juego de plataformas?</summary>
                <p>
                  Donkey Kong (Nintendo, 1981) se considera el primer juego de plataformas
                  tal como los conocemos hoy, con saltos sobre obstáculos en un entorno
                  vertical. Sin embargo, Space Panic (1980) ya usaba plataformas sin saltos.
                  El género se popularizó masivamente con Super Mario Bros. (1985), que
                  definió los estándares del scrolling lateral.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Por qué son tan adictivos los runners infinitos?</summary>
                <p>
                  Los runners infinitos usan varios mecanismos psicológicos de refuerzo:
                  la generación aleatoria de obstáculos mantiene la novedad constante, las
                  partidas cortas eliminan la barrera de entrada, y el marcador de récord
                  activa el deseo de superación personal. Cada muerte es seguida de un
                  &quot;casi lo consigo&quot; que motiva a intentarlo de nuevo inmediatamente.
                </p>
                <p className={styles.faqTip}>
                  Consejo: establece un límite de partidas para evitar el bucle de
                  &quot;una más&quot; en momentos de poco tiempo disponible.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo mejoro mi puntuación récord?</summary>
                <p>
                  La clave es la anticipación, no la reacción. Mira siempre unos pasos
                  por delante del personaje, no solo donde está en ese momento. Identifica
                  patrones de obstáculos repetidos (muchos juegos los tienen aunque parezcan
                  aleatorios) y practica en sesiones cortas y concentradas en lugar de largas
                  y agotadas. El cansancio es el mayor enemigo de los buenos reflejos.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo dominar un platform runner: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Familiarízate con el timing de salto</strong>
                <p>
                  Cada juego tiene su propia &quot;física&quot; de salto: altura, gravedad y tiempo
                  de caída. Dedica las primeras partidas a interiorizar cuándo y cuánto
                  debes pulsar el botón antes de tocar el obstáculo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Aprende los patrones de obstáculos</strong>
                <p>
                  Aunque parezca aleatorio, la mayoría de runners usa un conjunto limitado
                  de combinaciones de obstáculos. Con la práctica reconocerás visualmente
                  las formaciones antes de que lleguen y sabrás cómo reaccionar.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Anticipa en lugar de reaccionar</strong>
                <p>
                  El gran salto de nivel viene cuando dejas de reaccionar a lo que ya
                  está delante tuya y empiezas a leer el juego varios pasos por adelante.
                  Entrena la vista para explorar el espacio que está por venir, no solo
                  el obstáculo inmediato.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Mantén el ritmo y no te precipites</strong>
                <p>
                  La precipitación es la principal causa de errores. Cuando el juego
                  acelera, tu tendencia será a tensar los músculos y pulsar antes de
                  tiempo. Respira y confía en el timing que ya has interiorizado.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Bate tu récord propio como objetivo gradual</strong>
                <p>
                  Compararte con otros jugadores puede ser desmotivador al principio.
                  Fija como objetivo superar tu propia mejor marca en pequeños pasos:
                  si tu récord es 500 puntos, apunta a 550. Este enfoque genera progreso
                  continuo y sostenible.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 consejos para jugar mejor</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👁️</span>
              <h4>Anticipa, no reacciones en el último momento</h4>
              <p>
                La diferencia entre un jugador principiante y uno avanzado es la
                anticipación. Los jugadores expertos leen el escenario con varios
                fotogramas de antelación, dando tiempo a preparar la acción correcta.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧘</span>
              <h4>Mantén el estado de flow sin distracciones</h4>
              <p>
                Los mejores resultados llegan cuando estás completamente concentrado.
                Silencia notificaciones, busca un entorno tranquilo y deja que el
                juego ocupe toda tu atención. La distracción rompe el ritmo y causa
                errores evitables.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>Sesiones cortas y frecuentes para mejorar</h4>
              <p>
                Treinta minutos diarios durante una semana son más efectivos que
                tres horas de una sola vez. Las habilidades motoras y los reflejos
                se consolidan durante el descanso entre sesiones, no durante el juego.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Aprende de cada fallo identificando el obstáculo</h4>
              <p>
                Cuando mueras, identifica mentalmente qué obstáculo causó el error
                y por qué fallaste (reacción tardía, salto demasiado pronto, etc.).
                Este análisis consciente acelera la curva de aprendizaje mucho más
                que simplemente repetir la partida sin reflexionar.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores habituales al jugar a runners</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Reaccionar tardíamente:</strong> el juego requiere anticipación,
                no reacción. Si esperas a ver el obstáculo para decidir, ya es demasiado
                tarde. Entrena la vista para leer el escenario por adelantado.
              </li>
              <li>
                <strong>Perder la concentración buscando récords por encima de tus posibilidades:</strong>{' '}
                la obsesión por superar marcas inalcanzables en el momento genera ansiedad
                y empeora el rendimiento. El progreso gradual y la paciencia son más
                efectivos que la presión extrema.
              </li>
              <li>
                <strong>Jugar con cansancio extremo:</strong> los reflejos disminuyen
                significativamente con el cansancio físico y mental. Una sesión agotada
                produce más frustración que aprendizaje. Si llevas mucho tiempo jugando
                sin mejorar, es la señal de que debes parar y descansar.
              </li>
              <li>
                <strong>Sesiones demasiado largas sin descanso:</strong> la fatiga visual
                y cognitiva se acumula rápidamente en juegos de alta intensidad de reflejos.
                Descansa al menos 5 minutos por cada 30 – 40 minutos de juego para mantener
                el rendimiento y cuidar la vista.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-platform-runner')} />

      <ShareCard appName="juego-platform-runner" />
      <Footer appName="juego-platform-runner" />
    </div>
  );
}
