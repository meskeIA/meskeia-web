'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../SimuladorFisica.module.css';
import { formatNumber } from '@/lib';

interface CaidaLibreProps {
  isPlaying: boolean;
  onReset: () => void;
}

interface Params {
  altura: number;
  masa: number;
  resistenciaAire: boolean;
  coeficienteArrastre: number;
}

const G = 9.81;

export default function CaidaLibre({ isPlaying, onReset }: CaidaLibreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [params, setParams] = useState<Params>({
    altura: 100,
    masa: 1,
    resistenciaAire: false,
    coeficienteArrastre: 0.47,
  });

  const [estado, setEstado] = useState({
    tiempo: 0,
    posicionY: 0,
    velocidad: 0,
    energia: 0,
    haTerminado: false,
  });

  // Resetear simulación
  const resetSimulacion = useCallback(() => {
    startTimeRef.current = 0;
    setEstado({
      tiempo: 0,
      posicionY: 0,
      velocidad: 0,
      energia: params.masa * G * params.altura,
      haTerminado: false,
    });
    onReset();
  }, [params.masa, params.altura, onReset]);

  // Física de caída libre
  const calcularPosicion = useCallback((t: number) => {
    if (params.resistenciaAire) {
      // Con resistencia del aire (simplificado)
      const vTerminal = Math.sqrt((2 * params.masa * G) / (1.225 * params.coeficienteArrastre * 0.1));
      const y = (vTerminal * vTerminal / G) * Math.log(Math.cosh(G * t / vTerminal));
      const v = vTerminal * Math.tanh(G * t / vTerminal);
      return { y: Math.min(y, params.altura), v };
    } else {
      // Sin resistencia del aire
      const y = 0.5 * G * t * t;
      const v = G * t;
      return { y: Math.min(y, params.altura), v };
    }
  }, [params]);

  // Dibujar en el canvas
  const dibujar = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Limpiar
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Escala
    const escalaY = (height - 100) / params.altura;
    const centroX = width / 2;

    // Dibujar regla lateral
    ctx.strokeStyle = '#3a3a5e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, height - 50);
    ctx.stroke();

    // Marcas de altura
    ctx.fillStyle = '#6a6a8e';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let h = 0; h <= params.altura; h += params.altura / 5) {
      const y = 50 + (params.altura - h) * escalaY;
      ctx.beginPath();
      ctx.moveTo(45, y);
      ctx.lineTo(55, y);
      ctx.stroke();
      ctx.fillText(`${Math.round(h)}m`, 40, y + 4);
    }

    // Suelo
    ctx.fillStyle = '#2a5a3a';
    ctx.fillRect(0, height - 50, width, 50);

    // Líneas del suelo
    ctx.strokeStyle = '#3a7a4a';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, height - 50);
      ctx.lineTo(x + 15, height - 35);
      ctx.stroke();
    }

    // Posición del objeto
    const posY = 50 + estado.posicionY * escalaY;
    const radio = 20 + params.masa * 5;

    // Sombra
    if (estado.posicionY < params.altura) {
      const shadowY = height - 50;
      const shadowScale = 1 - (estado.posicionY / params.altura) * 0.5;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(centroX, shadowY - 5, radio * shadowScale, radio * 0.3 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Objeto cayendo
    const gradient = ctx.createRadialGradient(
      centroX - radio * 0.3, posY - radio * 0.3, 0,
      centroX, posY, radio
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#c92a2a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centroX, posY, radio, 0, Math.PI * 2);
    ctx.fill();

    // Brillo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(centroX - radio * 0.3, posY - radio * 0.3, radio * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Vector velocidad
    if (estado.velocidad > 0.5) {
      const vectorLength = Math.min(estado.velocidad * 3, 100);
      ctx.strokeStyle = '#4dabf7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centroX, posY + radio);
      ctx.lineTo(centroX, posY + radio + vectorLength);
      ctx.stroke();

      // Punta de flecha
      ctx.fillStyle = '#4dabf7';
      ctx.beginPath();
      ctx.moveTo(centroX, posY + radio + vectorLength + 10);
      ctx.lineTo(centroX - 8, posY + radio + vectorLength);
      ctx.lineTo(centroX + 8, posY + radio + vectorLength);
      ctx.closePath();
      ctx.fill();

      // Etiqueta velocidad
      ctx.fillStyle = '#4dabf7';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`v = ${formatNumber(estado.velocidad, 1)} m/s`, centroX + 15, posY + radio + vectorLength / 2);
    }

    // Altura actual
    ctx.fillStyle = '#ffd43b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    const alturaActual = params.altura - estado.posicionY;
    ctx.fillText(`h = ${formatNumber(alturaActual, 1)} m`, centroX + radio + 20, posY);

  }, [params.altura, params.masa, estado]);

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
        const { y, v } = calcularPosicion(t);

        const haTerminado = y >= params.altura;
        const energiaCinetica = 0.5 * params.masa * v * v;
        const energiaPotencial = params.masa * G * (params.altura - y);

        setEstado({
          tiempo: t,
          posicionY: y,
          velocidad: v,
          energia: energiaCinetica + energiaPotencial,
          haTerminado,
        });
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
  }, [isPlaying, estado.haTerminado, calcularPosicion, dibujar]);

  // Resetear cuando cambian parámetros
  useEffect(() => {
    resetSimulacion();
  }, [params.altura, params.masa, params.resistenciaAire]);

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
          <span className={styles.infoLabel}>Altura</span>
          <span className={styles.infoValue}>{formatNumber(params.altura - estado.posicionY, 1)}<span className={styles.infoUnit}>m</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Velocidad</span>
          <span className={styles.infoValue}>{formatNumber(estado.velocidad, 2)}<span className={styles.infoUnit}>m/s</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Energía</span>
          <span className={styles.infoValue}>{formatNumber(estado.energia, 0)}<span className={styles.infoUnit}>J</span></span>
        </div>
      </div>

      {/* Controles en panel lateral */}
      <div className={styles.controlsPanel}>
        <h3 className={styles.panelTitle}>Parámetros</h3>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Altura inicial
            <span className={styles.controlValue}>{params.altura} m</span>
          </label>
          <input
            type="range"
            min="10"
            max="500"
            value={params.altura}
            onChange={(e) => setParams({ ...params, altura: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Masa del objeto
            <span className={styles.controlValue}>{params.masa} kg</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={params.masa}
            onChange={(e) => setParams({ ...params, masa: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <label className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={params.resistenciaAire}
            onChange={(e) => setParams({ ...params, resistenciaAire: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.checkboxLabel}>Resistencia del aire</span>
        </label>

        {params.resistenciaAire && (
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Coef. arrastre
              <span className={styles.controlValue}>{params.coeficienteArrastre}</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={params.coeficienteArrastre}
              onChange={(e) => setParams({ ...params, coeficienteArrastre: Number(e.target.value) })}
              className={styles.slider}
            />
          </div>
        )}

        <div className={styles.presetsSection}>
          <h4 className={styles.presetsTitle}>Ejemplos</h4>
          <div className={styles.presetsList}>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, altura: 10, masa: 0.5 })}
            >
              🍎 Manzana (10m)
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, altura: 100, masa: 1 })}
            >
              📦 Caja (100m)
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, altura: 400, masa: 5, resistenciaAire: true })}
            >
              🪂 Paracaidista (400m)
            </button>
          </div>
        </div>

        <div className={styles.formulasSection}>
          <h4 className={styles.formulasTitle}>Fórmulas</h4>
          <div className={styles.formulasList}>
            <div className={styles.formulaItem}>h = ½gt²</div>
            <div className={styles.formulaItem}>v = gt</div>
            <div className={styles.formulaItem}>v² = 2gh</div>
          </div>
        </div>
      </div>
    </>
  );
}
