'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../SimuladorFisica.module.css';
import { formatNumber } from '@/lib';

interface ResorteProps {
  isPlaying: boolean;
  onReset: () => void;
}

interface Params {
  masa: number;
  constanteK: number;
  amplitud: number;
  amortiguamiento: number;
  mostrarGrafica: boolean;
}

export default function Resorte({ isPlaying, onReset }: ResorteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const historialRef = useRef<{t: number, x: number, v: number, ec: number, ep: number}[]>([]);

  const [params, setParams] = useState<Params>({
    masa: 1,
    constanteK: 10,
    amplitud: 80,
    amortiguamiento: 0,
    mostrarGrafica: true,
  });

  const [estado, setEstado] = useState({
    tiempo: 0,
    posicion: 0,
    velocidad: 0,
    energiaCinetica: 0,
    energiaPotencial: 0,
    frecuencia: 0,
    periodo: 0,
  });

  // Calcular frecuencia angular y período
  const calcularFrecuencia = useCallback(() => {
    const omega = Math.sqrt(params.constanteK / params.masa);
    const f = omega / (2 * Math.PI);
    const T = 1 / f;
    return { omega, f, T };
  }, [params.constanteK, params.masa]);

  // Resetear simulación
  const resetSimulacion = useCallback(() => {
    startTimeRef.current = 0;
    historialRef.current = [];
    const { f, T } = calcularFrecuencia();

    setEstado({
      tiempo: 0,
      posicion: params.amplitud,
      velocidad: 0,
      energiaCinetica: 0,
      energiaPotencial: 0.5 * params.constanteK * params.amplitud * params.amplitud / 10000,
      frecuencia: f,
      periodo: T,
    });
    onReset();
  }, [params.amplitud, params.constanteK, calcularFrecuencia, onReset]);

  // Calcular posición en tiempo t (MAS)
  const calcularPosicion = useCallback((t: number) => {
    const { omega } = calcularFrecuencia();
    const gamma = params.amortiguamiento;

    if (gamma > 0) {
      // Con amortiguamiento
      const omegaAmort = Math.sqrt(Math.max(0, omega * omega - gamma * gamma / 4));
      const x = params.amplitud * Math.exp(-gamma * t / 2) * Math.cos(omegaAmort * t);
      const v = -params.amplitud * Math.exp(-gamma * t / 2) * (
        gamma / 2 * Math.cos(omegaAmort * t) + omegaAmort * Math.sin(omegaAmort * t)
      );
      return { x, v };
    } else {
      // Sin amortiguamiento
      const x = params.amplitud * Math.cos(omega * t);
      const v = -params.amplitud * omega * Math.sin(omega * t);
      return { x, v };
    }
  }, [params.amplitud, params.amortiguamiento, calcularFrecuencia]);

  // Dibujar resorte en espiral
  const dibujarResorte = useCallback((
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    coils: number = 10,
    width: number = 20
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 0);

    const coilLength = (length - 20) / coils;

    for (let i = 0; i < coils; i++) {
      const startX = 10 + i * coilLength;
      ctx.lineTo(startX + coilLength * 0.25, -width);
      ctx.lineTo(startX + coilLength * 0.75, width);
      ctx.lineTo(startX + coilLength, 0);
    }

    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.restore();
  }, []);

  // Dibujar en el canvas
  const dibujar = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Limpiar
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const centroX = width / 2;
    const centroY = height * 0.4;
    const escala = 2;

    // Área de gráfica si está activa
    const graficaHeight = params.mostrarGrafica ? 150 : 0;
    const simHeight = height - graficaHeight - 40;

    // Pared
    ctx.fillStyle = '#4a4a6e';
    ctx.fillRect(0, centroY - 60, 30, 120);

    // Patrón de pared
    ctx.strokeStyle = '#5a5a7e';
    ctx.lineWidth = 2;
    for (let y = centroY - 55; y < centroY + 55; y += 15) {
      ctx.beginPath();
      ctx.moveTo(5, y);
      ctx.lineTo(25, y + 10);
      ctx.stroke();
    }

    // Posición actual
    const posActual = estado.posicion * escala;
    const masaX = centroX + posActual;

    // Línea de equilibrio
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centroX, centroY - 80);
    ctx.lineTo(centroX, centroY + 80);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#6a6a8e';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x = 0', centroX, centroY + 95);

    // Marcas de amplitud
    ctx.strokeStyle = 'rgba(255, 212, 59, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centroX + params.amplitud * escala, centroY - 60);
    ctx.lineTo(centroX + params.amplitud * escala, centroY + 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centroX - params.amplitud * escala, centroY - 60);
    ctx.lineTo(centroX - params.amplitud * escala, centroY + 60);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffd43b';
    ctx.font = '10px sans-serif';
    ctx.fillText('+A', centroX + params.amplitud * escala, centroY + 75);
    ctx.fillText('-A', centroX - params.amplitud * escala, centroY + 75);

    // Resorte
    ctx.strokeStyle = '#8a8aae';
    ctx.lineWidth = 3;
    dibujarResorte(ctx, 30, centroY, masaX - 30, centroY, 12, 15);

    // Masa (bloque)
    const masaSize = 40 + params.masa * 10;
    const gradient = ctx.createLinearGradient(
      masaX - masaSize / 2, centroY - masaSize / 2,
      masaX + masaSize / 2, centroY + masaSize / 2
    );
    gradient.addColorStop(0, '#69db7c');
    gradient.addColorStop(1, '#40c057');

    ctx.fillStyle = gradient;
    ctx.fillRect(masaX - masaSize / 2, centroY - masaSize / 2, masaSize, masaSize);

    // Borde de la masa
    ctx.strokeStyle = '#2f9e44';
    ctx.lineWidth = 2;
    ctx.strokeRect(masaX - masaSize / 2, centroY - masaSize / 2, masaSize, masaSize);

    // Etiqueta de masa
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${params.masa}kg`, masaX, centroY + 5);

    // Vector velocidad
    if (Math.abs(estado.velocidad) > 1) {
      const vectorScale = 0.5;
      const vectorLength = estado.velocidad * vectorScale;

      ctx.strokeStyle = '#4dabf7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(masaX, centroY - masaSize / 2 - 10);
      ctx.lineTo(masaX + vectorLength, centroY - masaSize / 2 - 10);
      ctx.stroke();

      // Punta
      const dir = estado.velocidad > 0 ? 1 : -1;
      ctx.fillStyle = '#4dabf7';
      ctx.beginPath();
      ctx.moveTo(masaX + vectorLength + 8 * dir, centroY - masaSize / 2 - 10);
      ctx.lineTo(masaX + vectorLength, centroY - masaSize / 2 - 15);
      ctx.lineTo(masaX + vectorLength, centroY - masaSize / 2 - 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4dabf7';
      ctx.font = '11px sans-serif';
      ctx.fillText('v', masaX + vectorLength / 2, centroY - masaSize / 2 - 20);
    }

    // Vector fuerza del resorte
    const fuerzaResorte = -params.constanteK * estado.posicion / 100;
    if (Math.abs(fuerzaResorte) > 0.1) {
      const fScale = 10;
      const fLength = fuerzaResorte * fScale;

      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(masaX, centroY + masaSize / 2 + 10);
      ctx.lineTo(masaX + fLength, centroY + masaSize / 2 + 10);
      ctx.stroke();

      // Punta
      const dir = fuerzaResorte > 0 ? 1 : -1;
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(masaX + fLength + 8 * dir, centroY + masaSize / 2 + 10);
      ctx.lineTo(masaX + fLength, centroY + masaSize / 2 + 5);
      ctx.lineTo(masaX + fLength, centroY + masaSize / 2 + 15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff6b6b';
      ctx.font = '11px sans-serif';
      ctx.fillText('F', masaX + fLength / 2, centroY + masaSize / 2 + 25);
    }

    // Gráfica de posición vs tiempo
    if (params.mostrarGrafica && historialRef.current.length > 1) {
      const grafY = height - graficaHeight - 20;
      const grafHeight = graficaHeight - 20;
      const grafWidth = width - 80;
      const grafX = 50;

      // Fondo de gráfica
      ctx.fillStyle = '#2a2a4e';
      ctx.fillRect(grafX, grafY, grafWidth, grafHeight);

      // Ejes
      ctx.strokeStyle = '#4a4a6e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(grafX, grafY + grafHeight / 2);
      ctx.lineTo(grafX + grafWidth, grafY + grafHeight / 2);
      ctx.stroke();

      // Etiquetas
      ctx.fillStyle = '#6a6a8e';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('x', grafX - 5, grafY + grafHeight / 2 + 4);
      ctx.fillText('+A', grafX - 5, grafY + 15);
      ctx.fillText('-A', grafX - 5, grafY + grafHeight - 5);

      // Gráfica de posición
      ctx.beginPath();
      ctx.strokeStyle = '#4dabf7';
      ctx.lineWidth = 2;

      const maxTime = 10; // Mostrar últimos 10 segundos
      const hist = historialRef.current;

      for (let i = 0; i < hist.length; i++) {
        const point = hist[i];
        const relTime = hist[hist.length - 1].t - point.t;

        if (relTime <= maxTime) {
          const px = grafX + grafWidth - (relTime / maxTime) * grafWidth;
          const py = grafY + grafHeight / 2 - (point.x / params.amplitud) * (grafHeight / 2 - 10);

          if (i === 0 || hist[i - 1].t < hist[hist.length - 1].t - maxTime) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      // Gráfica de energías
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
      ctx.lineWidth = 1;

      const maxEnergy = 0.5 * params.constanteK * params.amplitud * params.amplitud / 10000;

      for (let i = 0; i < hist.length; i++) {
        const point = hist[i];
        const relTime = hist[hist.length - 1].t - point.t;

        if (relTime <= maxTime) {
          const px = grafX + grafWidth - (relTime / maxTime) * grafWidth;
          const py = grafY + grafHeight - (point.ec / maxEnergy) * (grafHeight / 2 - 10);

          if (i === 0 || hist[i - 1].t < hist[hist.length - 1].t - maxTime) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      // Leyenda
      ctx.fillStyle = '#4dabf7';
      ctx.fillRect(grafX + grafWidth - 80, grafY + 5, 10, 10);
      ctx.fillStyle = '#aaa';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Posición', grafX + grafWidth - 65, grafY + 14);
    }

    // Barras de energía
    const barX = width - 50;
    const barY = 50;
    const barWidth = 25;
    const barHeight = 120;
    const energiaTotal = estado.energiaCinetica + estado.energiaPotencial;

    if (energiaTotal > 0) {
      // Fondo
      ctx.fillStyle = '#2a2a4e';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Ep (potencial elástica)
      const epHeight = (estado.energiaPotencial / energiaTotal) * barHeight;
      ctx.fillStyle = '#ffd43b';
      ctx.fillRect(barX, barY + barHeight - epHeight, barWidth, epHeight);

      // Ec (cinética)
      const ecHeight = (estado.energiaCinetica / energiaTotal) * barHeight;
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(barX, barY + barHeight - epHeight - ecHeight, barWidth, ecHeight);

      // Leyenda
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffd43b';
      ctx.fillText('Ep', barX + barWidth + 5, barY + barHeight);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('Ec', barX + barWidth + 5, barY + 15);
    }

  }, [params, estado, dibujarResorte]);

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

      if (isPlaying) {
        const t = (timestamp - startTimeRef.current) / 1000;
        const { x, v } = calcularPosicion(t);
        const { f, T } = calcularFrecuencia();

        // Energías (x en metros para el cálculo)
        const xMetros = x / 100;
        const vMetros = v / 100;
        const ec = 0.5 * params.masa * vMetros * vMetros;
        const ep = 0.5 * params.constanteK * xMetros * xMetros;

        // Guardar en historial
        historialRef.current.push({ t, x, v, ec, ep });
        if (historialRef.current.length > 1000) {
          historialRef.current.shift();
        }

        setEstado({
          tiempo: t,
          posicion: x,
          velocidad: v,
          energiaCinetica: ec,
          energiaPotencial: ep,
          frecuencia: f,
          periodo: T,
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
  }, [isPlaying, calcularPosicion, calcularFrecuencia, dibujar, params.masa, params.constanteK]);

  // Resetear cuando cambian parámetros clave
  useEffect(() => {
    resetSimulacion();
  }, [params.masa, params.constanteK, params.amplitud, params.amortiguamiento]);

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
          <span className={styles.infoLabel}>Posición</span>
          <span className={styles.infoValue}>{formatNumber(estado.posicion, 1)}<span className={styles.infoUnit}>cm</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Período</span>
          <span className={styles.infoValue}>{formatNumber(estado.periodo, 2)}<span className={styles.infoUnit}>s</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Frecuencia</span>
          <span className={styles.infoValue}>{formatNumber(estado.frecuencia, 2)}<span className={styles.infoUnit}>Hz</span></span>
        </div>
      </div>

      {/* Controles en panel lateral */}
      <div className={styles.controlsPanel}>
        <h3 className={styles.panelTitle}>Parámetros</h3>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Masa
            <span className={styles.controlValue}>{params.masa} kg</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={params.masa}
            onChange={(e) => setParams({ ...params, masa: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Constante k
            <span className={styles.controlValue}>{params.constanteK} N/m</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={params.constanteK}
            onChange={(e) => setParams({ ...params, constanteK: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Amplitud
            <span className={styles.controlValue}>{params.amplitud} cm</span>
          </label>
          <input
            type="range"
            min="20"
            max="120"
            step="10"
            value={params.amplitud}
            onChange={(e) => setParams({ ...params, amplitud: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Amortiguamiento
            <span className={styles.controlValue}>{params.amortiguamiento}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={params.amortiguamiento}
            onChange={(e) => setParams({ ...params, amortiguamiento: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <label className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={params.mostrarGrafica}
            onChange={(e) => setParams({ ...params, mostrarGrafica: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.checkboxLabel}>Mostrar gráfica x(t)</span>
        </label>

        <div className={styles.presetsSection}>
          <h4 className={styles.presetsTitle}>Ejemplos</h4>
          <div className={styles.presetsList}>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, masa: 1, constanteK: 10, amplitud: 50 })}
            >
              🔧 Resorte suave
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, masa: 2, constanteK: 40, amplitud: 80 })}
            >
              🏋️ Resorte rígido
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, masa: 1, constanteK: 20, amortiguamiento: 0.5 })}
            >
              🛑 Con amortiguamiento
            </button>
          </div>
        </div>

        <div className={styles.formulasSection}>
          <h4 className={styles.formulasTitle}>Fórmulas</h4>
          <div className={styles.formulasList}>
            <div className={styles.formulaItem}>F = -kx</div>
            <div className={styles.formulaItem}>x(t) = A·cos(ωt)</div>
            <div className={styles.formulaItem}>ω = √(k/m)</div>
            <div className={styles.formulaItem}>T = 2π√(m/k)</div>
          </div>
        </div>
      </div>
    </>
  );
}
