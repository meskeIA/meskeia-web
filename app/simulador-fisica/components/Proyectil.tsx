'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../SimuladorFisica.module.css';
import { formatNumber } from '@/lib';

interface ProyectilProps {
  isPlaying: boolean;
  onReset: () => void;
}

interface Params {
  velocidadInicial: number;
  angulo: number;
  alturaInicial: number;
  mostrarTrayectoria: boolean;
  mostrarVectores: boolean;
}

const G = 9.81;

export default function Proyectil({ isPlaying, onReset }: ProyectilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const trayectoriaRef = useRef<{x: number, y: number}[]>([]);

  const [params, setParams] = useState<Params>({
    velocidadInicial: 30,
    angulo: 45,
    alturaInicial: 0,
    mostrarTrayectoria: true,
    mostrarVectores: true,
  });

  const [estado, setEstado] = useState({
    tiempo: 0,
    posX: 0,
    posY: 0,
    velX: 0,
    velY: 0,
    alturaMaxima: 0,
    alcance: 0,
    tiempoVuelo: 0,
    haTerminado: false,
  });

  // Calcular parámetros teóricos
  const calcularTeoria = useCallback(() => {
    const anguloRad = params.angulo * Math.PI / 180;
    const v0x = params.velocidadInicial * Math.cos(anguloRad);
    const v0y = params.velocidadInicial * Math.sin(anguloRad);

    // Con altura inicial
    const discriminante = v0y * v0y + 2 * G * params.alturaInicial;
    const tiempoVuelo = (v0y + Math.sqrt(discriminante)) / G;
    const alcance = v0x * tiempoVuelo;
    const alturaMaxima = params.alturaInicial + (v0y * v0y) / (2 * G);

    return { v0x, v0y, tiempoVuelo, alcance, alturaMaxima };
  }, [params]);

  // Resetear simulación
  const resetSimulacion = useCallback(() => {
    startTimeRef.current = 0;
    trayectoriaRef.current = [];
    const { v0x, v0y, tiempoVuelo, alcance, alturaMaxima } = calcularTeoria();

    setEstado({
      tiempo: 0,
      posX: 0,
      posY: params.alturaInicial,
      velX: v0x,
      velY: v0y,
      alturaMaxima,
      alcance,
      tiempoVuelo,
      haTerminado: false,
    });
    onReset();
  }, [params.alturaInicial, calcularTeoria, onReset]);

  // Calcular posición en tiempo t
  const calcularPosicion = useCallback((t: number) => {
    const anguloRad = params.angulo * Math.PI / 180;
    const v0x = params.velocidadInicial * Math.cos(anguloRad);
    const v0y = params.velocidadInicial * Math.sin(anguloRad);

    const x = v0x * t;
    const y = params.alturaInicial + v0y * t - 0.5 * G * t * t;
    const vy = v0y - G * t;

    return { x, y, vx: v0x, vy };
  }, [params]);

  // Dibujar en el canvas
  const dibujar = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Limpiar
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const { alcance, alturaMaxima } = calcularTeoria();

    // Escalas dinámicas
    const margen = 60;
    const escalaX = (width - margen * 2) / Math.max(alcance * 1.1, 100);
    const escalaY = (height - margen * 2) / Math.max(alturaMaxima * 1.3, 50);
    const escala = Math.min(escalaX, escalaY);

    const origenX = margen;
    const origenY = height - margen;

    // Dibujar cuadrícula
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 1;

    // Líneas verticales
    const stepX = Math.ceil(alcance / 10) || 10;
    for (let x = 0; x <= alcance * 1.1; x += stepX) {
      const px = origenX + x * escala;
      ctx.beginPath();
      ctx.moveTo(px, origenY);
      ctx.lineTo(px, margen);
      ctx.stroke();

      ctx.fillStyle = '#6a6a8e';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(x)}m`, px, origenY + 15);
    }

    // Líneas horizontales
    const stepY = Math.ceil(alturaMaxima / 5) || 10;
    for (let y = 0; y <= alturaMaxima * 1.3; y += stepY) {
      const py = origenY - y * escala;
      ctx.beginPath();
      ctx.moveTo(origenX, py);
      ctx.lineTo(width - margen, py);
      ctx.stroke();

      if (y > 0) {
        ctx.fillStyle = '#6a6a8e';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(y)}m`, origenX - 5, py + 4);
      }
    }

    // Suelo
    ctx.fillStyle = '#2a5a3a';
    ctx.fillRect(0, origenY, width, height - origenY);

    // Césped
    ctx.strokeStyle = '#3a7a4a';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, origenY);
      ctx.lineTo(x + 5, origenY - 8);
      ctx.stroke();
    }

    // Cañón/lanzador
    const cannonX = origenX;
    const cannonY = origenY - params.alturaInicial * escala;
    const anguloRad = params.angulo * Math.PI / 180;

    ctx.save();
    ctx.translate(cannonX, cannonY);
    ctx.rotate(-anguloRad);

    // Base del cañón
    ctx.fillStyle = '#5a5a7e';
    ctx.fillRect(-10, -8, 50, 16);

    // Punta del cañón
    ctx.fillStyle = '#4a4a6e';
    ctx.beginPath();
    ctx.moveTo(40, -10);
    ctx.lineTo(55, 0);
    ctx.lineTo(40, 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Ruedas del cañón
    ctx.fillStyle = '#3a3a5e';
    ctx.beginPath();
    ctx.arc(cannonX - 5, cannonY + 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Trayectoria teórica (parábola)
    if (params.mostrarTrayectoria) {
      ctx.strokeStyle = 'rgba(77, 171, 247, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      const { tiempoVuelo } = calcularTeoria();
      for (let t = 0; t <= tiempoVuelo; t += tiempoVuelo / 100) {
        const { x, y } = calcularPosicion(t);
        const px = origenX + x * escala;
        const py = origenY - y * escala;
        if (t === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Trayectoria real (estela)
    if (trayectoriaRef.current.length > 1) {
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(trayectoriaRef.current[0].x, trayectoriaRef.current[0].y);
      for (let i = 1; i < trayectoriaRef.current.length; i++) {
        ctx.lineTo(trayectoriaRef.current[i].x, trayectoriaRef.current[i].y);
      }
      ctx.stroke();
    }

    // Proyectil
    if (!estado.haTerminado || trayectoriaRef.current.length > 0) {
      const proyX = origenX + estado.posX * escala;
      const proyY = origenY - estado.posY * escala;

      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(proyX, origenY - 3, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Proyectil
      const gradient = ctx.createRadialGradient(
        proyX - 4, proyY - 4, 0,
        proyX, proyY, 12
      );
      gradient.addColorStop(0, '#ff8787');
      gradient.addColorStop(1, '#c92a2a');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(proyX, proyY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Vectores de velocidad
      if (params.mostrarVectores && !estado.haTerminado) {
        const vectorScale = 2;

        // Vector Vx
        if (Math.abs(estado.velX) > 0.5) {
          ctx.strokeStyle = '#4dabf7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(proyX, proyY);
          ctx.lineTo(proyX + estado.velX * vectorScale, proyY);
          ctx.stroke();

          // Punta
          ctx.fillStyle = '#4dabf7';
          ctx.beginPath();
          ctx.moveTo(proyX + estado.velX * vectorScale + 8, proyY);
          ctx.lineTo(proyX + estado.velX * vectorScale, proyY - 5);
          ctx.lineTo(proyX + estado.velX * vectorScale, proyY + 5);
          ctx.closePath();
          ctx.fill();

          ctx.font = '11px sans-serif';
          ctx.fillText(`Vx`, proyX + estado.velX * vectorScale / 2, proyY - 8);
        }

        // Vector Vy
        ctx.strokeStyle = '#69db7c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(proyX, proyY);
        ctx.lineTo(proyX, proyY - estado.velY * vectorScale);
        ctx.stroke();

        // Punta
        ctx.fillStyle = '#69db7c';
        const vyDir = estado.velY >= 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(proyX, proyY - estado.velY * vectorScale - 8 * vyDir);
        ctx.lineTo(proyX - 5, proyY - estado.velY * vectorScale);
        ctx.lineTo(proyX + 5, proyY - estado.velY * vectorScale);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#69db7c';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Vy`, proyX + 10, proyY - estado.velY * vectorScale / 2);
      }

      // Guardar posición para estela
      if (isPlaying && !estado.haTerminado) {
        trayectoriaRef.current.push({ x: proyX, y: proyY });
      }
    }

    // Punto de altura máxima
    const { v0y } = calcularTeoria();
    const tMax = v0y / G;
    const { x: xMax, y: yMax } = calcularPosicion(tMax);
    const pxMax = origenX + xMax * escala;
    const pyMax = origenY - yMax * escala;

    ctx.strokeStyle = 'rgba(255, 212, 59, 0.5)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pxMax, pyMax);
    ctx.lineTo(pxMax, origenY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffd43b';
    ctx.beginPath();
    ctx.arc(pxMax, pyMax, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '11px sans-serif';
    ctx.fillText(`H_max = ${formatNumber(yMax, 1)}m`, pxMax + 10, pyMax - 5);

    // Alcance
    if (estado.haTerminado) {
      const pxAlcance = origenX + estado.alcance * escala;
      ctx.fillStyle = '#4dabf7';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Alcance = ${formatNumber(estado.alcance, 1)}m`, pxAlcance, origenY + 30);
    }

  }, [params, estado, isPlaying, calcularTeoria, calcularPosicion]);

  // Loop de animación
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const rect = canvas.getBoundingClientRect();

      if (isPlaying && !estado.haTerminado) {
        const t = (timestamp - startTimeRef.current) / 1000;
        const { x, y, vx, vy } = calcularPosicion(t);

        if (y <= 0) {
          // Ha tocado el suelo
          const { tiempoVuelo, alcance, alturaMaxima } = calcularTeoria();
          setEstado(prev => ({
            ...prev,
            tiempo: tiempoVuelo,
            posX: alcance,
            posY: 0,
            velX: vx,
            velY: 0,
            alturaMaxima,
            alcance,
            haTerminado: true,
          }));
        } else {
          setEstado(prev => ({
            ...prev,
            tiempo: t,
            posX: x,
            posY: y,
            velX: vx,
            velY: vy,
          }));
        }
      }

      dibujar(ctx, rect.width, rect.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, estado.haTerminado, calcularPosicion, calcularTeoria, dibujar]);

  // Resetear cuando cambian parámetros
  useEffect(() => {
    resetSimulacion();
  }, [params.velocidadInicial, params.angulo, params.alturaInicial]);

  return (
    <>
      {/* Canvas */}
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {/* Info */}
      <div className={styles.canvasInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Tiempo</span>
          <span className={styles.infoValue}>{formatNumber(estado.tiempo, 2)}<span className={styles.infoUnit}>s</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Altura máx</span>
          <span className={styles.infoValue}>{formatNumber(estado.alturaMaxima, 1)}<span className={styles.infoUnit}>m</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Alcance</span>
          <span className={styles.infoValue}>{formatNumber(estado.alcance, 1)}<span className={styles.infoUnit}>m</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>T. vuelo</span>
          <span className={styles.infoValue}>{formatNumber(estado.tiempoVuelo, 2)}<span className={styles.infoUnit}>s</span></span>
        </div>
      </div>

      {/* Controles en panel lateral */}
      <div className={styles.controlsPanel}>
        <h3 className={styles.panelTitle}>Parámetros</h3>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Velocidad inicial
            <span className={styles.controlValue}>{params.velocidadInicial} m/s</span>
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={params.velocidadInicial}
            onChange={(e) => setParams({ ...params, velocidadInicial: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Ángulo de lanzamiento
            <span className={styles.controlValue}>{params.angulo}°</span>
          </label>
          <input
            type="range"
            min="5"
            max="85"
            value={params.angulo}
            onChange={(e) => setParams({ ...params, angulo: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Altura inicial
            <span className={styles.controlValue}>{params.alturaInicial} m</span>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={params.alturaInicial}
            onChange={(e) => setParams({ ...params, alturaInicial: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <label className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={params.mostrarTrayectoria}
            onChange={(e) => setParams({ ...params, mostrarTrayectoria: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.checkboxLabel}>Mostrar trayectoria teórica</span>
        </label>

        <label className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={params.mostrarVectores}
            onChange={(e) => setParams({ ...params, mostrarVectores: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.checkboxLabel}>Mostrar vectores velocidad</span>
        </label>

        <div className={styles.presetsSection}>
          <h4 className={styles.presetsTitle}>Ejemplos</h4>
          <div className={styles.presetsList}>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, velocidadInicial: 20, angulo: 45, alturaInicial: 0 })}
            >
              ⚽ Pelota de fútbol
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, velocidadInicial: 50, angulo: 30, alturaInicial: 0 })}
            >
              🏌️ Golpe de golf
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, velocidadInicial: 15, angulo: 60, alturaInicial: 20 })}
            >
              🏀 Tiro libre
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, velocidadInicial: 80, angulo: 45, alturaInicial: 0 })}
            >
              💣 Cañón (alcance máx)
            </button>
          </div>
        </div>

        <div className={styles.formulasSection}>
          <h4 className={styles.formulasTitle}>Fórmulas</h4>
          <div className={styles.formulasList}>
            <div className={styles.formulaItem}>x = v₀·cos(θ)·t</div>
            <div className={styles.formulaItem}>y = v₀·sin(θ)·t - ½gt²</div>
            <div className={styles.formulaItem}>R = v₀²·sin(2θ)/g</div>
          </div>
        </div>
      </div>
    </>
  );
}
