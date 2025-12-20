'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../SimuladorFisica.module.css';
import { formatNumber } from '@/lib';

interface OndasProps {
  isPlaying: boolean;
  onReset: () => void;
}

type TipoOnda = 'viajera' | 'estacionaria' | 'interferencia';

interface Params {
  tipo: TipoOnda;
  amplitud: number;
  frecuencia: number;
  longitudOnda: number;
  fase: number;
  // Para interferencia
  amplitud2: number;
  frecuencia2: number;
}

export default function Ondas({ isPlaying, onReset }: OndasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [params, setParams] = useState<Params>({
    tipo: 'viajera',
    amplitud: 50,
    frecuencia: 1,
    longitudOnda: 200,
    fase: 0,
    amplitud2: 50,
    frecuencia2: 1.5,
  });

  const [estado, setEstado] = useState({
    tiempo: 0,
    velocidad: 0,
    periodo: 0,
  });

  // Calcular velocidad de onda
  const calcularVelocidad = useCallback(() => {
    return params.frecuencia * params.longitudOnda;
  }, [params.frecuencia, params.longitudOnda]);

  // Resetear simulación
  const resetSimulacion = useCallback(() => {
    startTimeRef.current = 0;
    setEstado({
      tiempo: 0,
      velocidad: calcularVelocidad(),
      periodo: 1 / params.frecuencia,
    });
    onReset();
  }, [calcularVelocidad, params.frecuencia, onReset]);

  // Función de onda
  const calcularY = useCallback((x: number, t: number, params: Params): number => {
    const omega = 2 * Math.PI * params.frecuencia;
    const k = 2 * Math.PI / params.longitudOnda;

    switch (params.tipo) {
      case 'viajera':
        return params.amplitud * Math.sin(k * x - omega * t + params.fase);

      case 'estacionaria': {
        // Onda estacionaria = superposición de dos ondas viajeras opuestas
        const y1 = params.amplitud * Math.sin(k * x - omega * t);
        const y2 = params.amplitud * Math.sin(k * x + omega * t);
        return (y1 + y2) / 2;
      }

      case 'interferencia': {
        // Interferencia de dos ondas con diferentes frecuencias
        const omega2 = 2 * Math.PI * params.frecuencia2;
        const y1 = params.amplitud * Math.sin(k * x - omega * t);
        const y2 = params.amplitud2 * Math.sin(k * x - omega2 * t);
        return y1 + y2;
      }

      default:
        return 0;
    }
  }, []);

  // Dibujar en el canvas
  const dibujar = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
    // Limpiar
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const centroY = height / 2;
    const margenX = 40;

    // Cuadrícula
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 1;

    // Líneas horizontales
    for (let y = -2; y <= 2; y++) {
      const py = centroY - y * params.amplitud;
      ctx.beginPath();
      ctx.moveTo(margenX, py);
      ctx.lineTo(width - margenX, py);
      ctx.stroke();

      if (y !== 0) {
        ctx.fillStyle = '#6a6a8e';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${y > 0 ? '+' : ''}${y}A`, margenX - 5, py + 4);
      }
    }

    // Eje X (equilibrio)
    ctx.strokeStyle = '#4a4a6e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margenX, centroY);
    ctx.lineTo(width - margenX, centroY);
    ctx.stroke();

    // Etiqueta eje
    ctx.fillStyle = '#8a8aae';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Posición x', width / 2, height - 10);

    // Marcas de longitud de onda
    const numOndas = Math.floor((width - 2 * margenX) / params.longitudOnda);
    for (let i = 0; i <= numOndas; i++) {
      const x = margenX + i * params.longitudOnda;
      if (x < width - margenX) {
        ctx.strokeStyle = '#3a3a5e';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, centroY - params.amplitud * 1.5);
        ctx.lineTo(x, centroY + params.amplitud * 1.5);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#6a6a8e';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${i}λ`, x, centroY + params.amplitud * 1.8);
      }
    }

    // Dibujar onda principal
    ctx.beginPath();
    ctx.strokeStyle = '#4dabf7';
    ctx.lineWidth = 3;

    for (let x = margenX; x < width - margenX; x++) {
      const y = calcularY(x - margenX, t, params);
      const py = centroY - y;

      if (x === margenX) {
        ctx.moveTo(x, py);
      } else {
        ctx.lineTo(x, py);
      }
    }
    ctx.stroke();

    // Para interferencia, mostrar las ondas individuales
    if (params.tipo === 'interferencia') {
      // Onda 1
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
      ctx.lineWidth = 2;

      const omega1 = 2 * Math.PI * params.frecuencia;
      const k = 2 * Math.PI / params.longitudOnda;

      for (let x = margenX; x < width - margenX; x++) {
        const y = params.amplitud * Math.sin(k * (x - margenX) - omega1 * t);
        const py = centroY - y;

        if (x === margenX) {
          ctx.moveTo(x, py);
        } else {
          ctx.lineTo(x, py);
        }
      }
      ctx.stroke();

      // Onda 2
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(105, 219, 124, 0.5)';
      ctx.lineWidth = 2;

      const omega2 = 2 * Math.PI * params.frecuencia2;

      for (let x = margenX; x < width - margenX; x++) {
        const y = params.amplitud2 * Math.sin(k * (x - margenX) - omega2 * t);
        const py = centroY - y;

        if (x === margenX) {
          ctx.moveTo(x, py);
        } else {
          ctx.lineTo(x, py);
        }
      }
      ctx.stroke();

      // Leyenda
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(width - 120, 20, 15, 15);
      ctx.fillStyle = '#aaa';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`f₁ = ${params.frecuencia} Hz`, width - 100, 32);

      ctx.fillStyle = '#69db7c';
      ctx.fillRect(width - 120, 40, 15, 15);
      ctx.fillStyle = '#aaa';
      ctx.fillText(`f₂ = ${params.frecuencia2} Hz`, width - 100, 52);

      ctx.fillStyle = '#4dabf7';
      ctx.fillRect(width - 120, 60, 15, 15);
      ctx.fillStyle = '#aaa';
      ctx.fillText('Suma', width - 100, 72);
    }

    // Para onda estacionaria, marcar nodos y antinodos
    if (params.tipo === 'estacionaria') {
      const k = 2 * Math.PI / params.longitudOnda;

      // Nodos (donde sin(kx) = 0)
      for (let n = 0; n <= numOndas * 2; n++) {
        const xNodo = (n * Math.PI) / k;
        const px = margenX + xNodo;

        if (px < width - margenX && px > margenX) {
          ctx.fillStyle = '#ff6b6b';
          ctx.beginPath();
          ctx.arc(px, centroY, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ff6b6b';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('N', px, centroY - 15);
        }
      }

      // Antinodos (donde sin(kx) = ±1)
      for (let n = 0; n <= numOndas * 2; n++) {
        const xAnti = ((2 * n + 1) * Math.PI / 2) / k;
        const px = margenX + xAnti;

        if (px < width - margenX && px > margenX) {
          ctx.fillStyle = '#69db7c';
          ctx.beginPath();
          ctx.arc(px, centroY, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#69db7c';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('A', px, centroY - 15);
        }
      }

      // Leyenda
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(width - 110, 27, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aaa';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Nodo', width - 100, 32);

      ctx.fillStyle = '#69db7c';
      ctx.beginPath();
      ctx.arc(width - 110, 47, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aaa';
      ctx.fillText('Antinodo', width - 100, 52);
    }

    // Flecha de dirección para onda viajera
    if (params.tipo === 'viajera') {
      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('→ Dirección de propagación', width / 2, 30);
    }

    // Indicador de longitud de onda
    const lambdaX = margenX + params.longitudOnda / 2;
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margenX, centroY - params.amplitud - 20);
    ctx.lineTo(margenX, centroY - params.amplitud - 30);
    ctx.moveTo(margenX, centroY - params.amplitud - 25);
    ctx.lineTo(margenX + params.longitudOnda, centroY - params.amplitud - 25);
    ctx.moveTo(margenX + params.longitudOnda, centroY - params.amplitud - 20);
    ctx.lineTo(margenX + params.longitudOnda, centroY - params.amplitud - 30);
    ctx.stroke();

    ctx.fillStyle = '#ffd43b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`λ = ${params.longitudOnda} px`, lambdaX, centroY - params.amplitud - 35);

  }, [params, calcularY]);

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
      let t = 0;

      if (isPlaying) {
        t = (timestamp - startTimeRef.current) / 1000;
        setEstado(prev => ({
          ...prev,
          tiempo: t,
          velocidad: calcularVelocidad(),
          periodo: 1 / params.frecuencia,
        }));
      }

      dibujar(ctx, rect.width, rect.height, t);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, calcularVelocidad, params.frecuencia, dibujar]);

  // Resetear cuando cambian parámetros clave
  useEffect(() => {
    resetSimulacion();
  }, [params.tipo]);

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
          <span className={styles.infoLabel}>Frecuencia</span>
          <span className={styles.infoValue}>{formatNumber(params.frecuencia, 2)}<span className={styles.infoUnit}>Hz</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Período</span>
          <span className={styles.infoValue}>{formatNumber(estado.periodo, 2)}<span className={styles.infoUnit}>s</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Velocidad</span>
          <span className={styles.infoValue}>{formatNumber(estado.velocidad, 0)}<span className={styles.infoUnit}>px/s</span></span>
        </div>
      </div>

      {/* Controles en panel lateral */}
      <div className={styles.controlsPanel}>
        <h3 className={styles.panelTitle}>Parámetros</h3>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Tipo de onda</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`${styles.presetBtn} ${params.tipo === 'viajera' ? styles.active : ''}`}
              onClick={() => setParams({ ...params, tipo: 'viajera' })}
              style={params.tipo === 'viajera' ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
            >
              Viajera
            </button>
            <button
              className={`${styles.presetBtn} ${params.tipo === 'estacionaria' ? styles.active : ''}`}
              onClick={() => setParams({ ...params, tipo: 'estacionaria' })}
              style={params.tipo === 'estacionaria' ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
            >
              Estacionaria
            </button>
            <button
              className={`${styles.presetBtn} ${params.tipo === 'interferencia' ? styles.active : ''}`}
              onClick={() => setParams({ ...params, tipo: 'interferencia' })}
              style={params.tipo === 'interferencia' ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
            >
              Interferencia
            </button>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Amplitud
            <span className={styles.controlValue}>{params.amplitud} px</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={params.amplitud}
            onChange={(e) => setParams({ ...params, amplitud: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Frecuencia
            <span className={styles.controlValue}>{params.frecuencia} Hz</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={params.frecuencia}
            onChange={(e) => setParams({ ...params, frecuencia: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Longitud de onda (λ)
            <span className={styles.controlValue}>{params.longitudOnda} px</span>
          </label>
          <input
            type="range"
            min="50"
            max="400"
            step="10"
            value={params.longitudOnda}
            onChange={(e) => setParams({ ...params, longitudOnda: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        {params.tipo === 'interferencia' && (
          <>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Amplitud onda 2
                <span className={styles.controlValue}>{params.amplitud2} px</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={params.amplitud2}
                onChange={(e) => setParams({ ...params, amplitud2: Number(e.target.value) })}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Frecuencia onda 2
                <span className={styles.controlValue}>{params.frecuencia2} Hz</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={params.frecuencia2}
                onChange={(e) => setParams({ ...params, frecuencia2: Number(e.target.value) })}
                className={styles.slider}
              />
            </div>
          </>
        )}

        <div className={styles.formulasSection}>
          <h4 className={styles.formulasTitle}>Fórmulas</h4>
          <div className={styles.formulasList}>
            <div className={styles.formulaItem}>y = A·sin(kx - ωt)</div>
            <div className={styles.formulaItem}>v = λ·f</div>
            <div className={styles.formulaItem}>T = 1/f</div>
            <div className={styles.formulaItem}>k = 2π/λ</div>
          </div>
        </div>
      </div>
    </>
  );
}
