'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { ArrayBar, BAR_COLORS } from './types';
import styles from './SortingCanvas.module.css';

interface SortingCanvasProps {
  bars: ArrayBar[];
  maxValue: number;
}

export default function SortingCanvas({ bars, maxValue }: SortingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // El array por defecto es aleatorio: el del HTML prerenderizado no es el del navegador, así
  // que la etiqueta con los valores se escribe tras montar (si no, React no puede hidratar).
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Obtener dimensiones reales del canvas
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Configurar tamaño del canvas para alta resolución
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 20;
    const barWidth = (width - padding * 2) / bars.length;
    const maxBarHeight = height - padding * 2;

    // Limpiar canvas con fondo oscuro
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Dibujar barras
    bars.forEach((bar, index) => {
      const barHeight = (bar.value / maxValue) * maxBarHeight;
      const x = padding + index * barWidth;
      const y = height - padding - barHeight;

      // Color según estado
      const color = BAR_COLORS[bar.state];

      // Efecto de brillo para barras activas
      if (bar.state === 'comparing' || bar.state === 'swapping' || bar.state === 'pivot') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
      } else {
        ctx.shadowBlur = 0;
      }

      // Dibujar barra con bordes redondeados en la parte superior
      const barX = x + 1;
      const barW = barWidth - 2;
      const radius = Math.min(4, barW / 4);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(barX + radius, y);
      ctx.lineTo(barX + barW - radius, y);
      ctx.quadraticCurveTo(barX + barW, y, barX + barW, y + radius);
      ctx.lineTo(barX + barW, height - padding);
      ctx.lineTo(barX, height - padding);
      ctx.lineTo(barX, y + radius);
      ctx.quadraticCurveTo(barX, y, barX + radius, y);
      ctx.closePath();
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Mostrar valor si hay suficiente espacio
      if (barWidth > 25 && bars.length <= 30) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.min(12, barWidth / 2)}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(bar.value.toString(), x + barWidth / 2, y - 4);
      }
    });

    // Dibujar línea base
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

  }, [bars, maxValue]);

  useEffect(() => {
    draw();

    // Redibujar en resize
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // El array es el resultado de la app y solo existe dibujado: el lector de pantalla lo recibe
  // como texto (hallazgo 1299).
  const ordenado = bars.length > 0 && bars.every((b) => b.state === 'sorted');
  const etiqueta = montado
    ? `Array de ${bars.length} valores${ordenado ? ', ya ordenado' : ''}: ${bars.map((b) => b.value).join(', ')}`
    : `Array de ${bars.length} valores`;

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={etiqueta}>
        {etiqueta}
      </canvas>
    </div>
  );
}
