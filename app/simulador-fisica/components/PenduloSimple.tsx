'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from '../SimuladorFisica.module.css';
import { formatNumber } from '@/lib';

interface PenduloSimpleProps {
  isPlaying: boolean;
  onReset: () => void;
}

interface Params {
  longitud: number;
  anguloInicial: number;
  masa: number;
  amortiguamiento: number;
  mostrarEstela: boolean;
}

const G = 9.81;

export default function PenduloSimple({ isPlaying, onReset }: PenduloSimpleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const estelaRef = useRef<{x: number, y: number}[]>([]);

  const [params, setParams] = useState<Params>({
    longitud: 2,
    anguloInicial: 45,
    masa: 1,
    amortiguamiento: 0,
    mostrarEstela: true,
  });

  const [estado, setEstado] = useState({
    tiempo: 0,
    angulo: 45,
    velocidadAngular: 0,
    energiaCinetica: 0,
    energiaPotencial: 0,
    periodo: 0,
  });

  // Calcular período
  const calcularPeriodo = useCallback(() => {
    return 2 * Math.PI * Math.sqrt(params.longitud / G);
  }, [params.longitud]);

  // Resetear simulación
  const resetSimulacion = useCallback(() => {
    startTimeRef.current = 0;
    estelaRef.current = [];
    const periodo = calcularPeriodo();
    const anguloRad = params.anguloInicial * Math.PI / 180;
    const altura = params.longitud * (1 - Math.cos(anguloRad));

    setEstado({
      tiempo: 0,
      angulo: params.anguloInicial,
      velocidadAngular: 0,
      energiaCinetica: 0,
      energiaPotencial: params.masa * G * altura,
      periodo,
    });
    onReset();
  }, [params, calcularPeriodo, onReset]);

  // Física del péndulo (aproximación para ángulos pequeños con corrección)
  const calcularAngulo = useCallback((t: number) => {
    const omega = Math.sqrt(G / params.longitud);
    const theta0 = params.anguloInicial * Math.PI / 180;
    const gamma = params.amortiguamiento;

    if (gamma > 0) {
      // Con amortiguamiento
      const omegaAmort = Math.sqrt(omega * omega - gamma * gamma / 4);
      const theta = theta0 * Math.exp(-gamma * t / 2) * Math.cos(omegaAmort * t);
      const thetaDot = -theta0 * Math.exp(-gamma * t / 2) * (
        gamma / 2 * Math.cos(omegaAmort * t) + omegaAmort * Math.sin(omegaAmort * t)
      );
      return { theta, thetaDot };
    } else {
      // Sin amortiguamiento
      const theta = theta0 * Math.cos(omega * t);
      const thetaDot = -theta0 * omega * Math.sin(omega * t);
      return { theta, thetaDot };
    }
  }, [params]);

  // Dibujar en el canvas
  const dibujar = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Limpiar
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Punto de pivote
    const pivotX = width / 2;
    const pivotY = 80;
    const escala = Math.min(width, height - 150) / (params.longitud * 2.5);
    const longitudPixels = params.longitud * escala;

    // Ángulo actual en radianes
    const anguloRad = estado.angulo * Math.PI / 180;

    // Posición de la masa
    const masaX = pivotX + longitudPixels * Math.sin(anguloRad);
    const masaY = pivotY + longitudPixels * Math.cos(anguloRad);

    // Dibujar estela
    if (params.mostrarEstela && estelaRef.current.length > 1) {
      ctx.beginPath();
      ctx.moveTo(estelaRef.current[0].x, estelaRef.current[0].y);
      for (let i = 1; i < estelaRef.current.length; i++) {
        ctx.lineTo(estelaRef.current[i].x, estelaRef.current[i].y);
      }
      ctx.strokeStyle = 'rgba(77, 171, 247, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Soporte superior
    ctx.fillStyle = '#4a4a6e';
    ctx.fillRect(pivotX - 60, 20, 120, 20);

    // Punto de pivote decorado
    ctx.fillStyle = '#6a6a8e';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Cuerda
    ctx.strokeStyle = '#8a8aae';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(masaX, masaY);
    ctx.stroke();

    // Masa (péndulo)
    const radio = 15 + params.masa * 8;
    const gradient = ctx.createRadialGradient(
      masaX - radio * 0.3, masaY - radio * 0.3, 0,
      masaX, masaY, radio
    );
    gradient.addColorStop(0, '#ffd43b');
    gradient.addColorStop(1, '#fab005');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(masaX, masaY, radio, 0, Math.PI * 2);
    ctx.fill();

    // Brillo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(masaX - radio * 0.3, masaY - radio * 0.3, radio * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Arco del ángulo
    if (Math.abs(estado.angulo) > 1) {
      ctx.strokeStyle = 'rgba(255, 212, 59, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const arcRadius = 50;
      const startAngle = Math.PI / 2;
      const endAngle = Math.PI / 2 - anguloRad;
      ctx.arc(pivotX, pivotY, arcRadius, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
      ctx.stroke();

      // Etiqueta del ángulo
      ctx.fillStyle = '#ffd43b';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`θ = ${formatNumber(estado.angulo, 1)}°`, pivotX + 80, pivotY + 30);
    }

    // Línea vertical de referencia
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + longitudPixels + 50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Barras de energía
    const energiaTotal = estado.energiaCinetica + estado.energiaPotencial;
    if (energiaTotal > 0) {
      const barWidth = 20;
      const barHeight = 150;
      const barX = width - 80;
      const barY = height - 180;

      // Fondo de la barra
      ctx.fillStyle = '#2a2a4e';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Energía potencial (arriba)
      const epHeight = (estado.energiaPotencial / energiaTotal) * barHeight;
      ctx.fillStyle = '#4dabf7';
      ctx.fillRect(barX, barY + barHeight - epHeight, barWidth, epHeight);

      // Energía cinética (encima)
      const ecHeight = (estado.energiaCinetica / energiaTotal) * barHeight;
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(barX, barY + barHeight - epHeight - ecHeight, barWidth, ecHeight);

      // Leyenda
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4dabf7';
      ctx.fillText('Ep', barX + barWidth + 5, barY + barHeight);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('Ec', barX + barWidth + 5, barY + 15);
    }

    // Guardar posición para estela
    if (isPlaying && params.mostrarEstela) {
      estelaRef.current.push({ x: masaX, y: masaY });
      if (estelaRef.current.length > 200) {
        estelaRef.current.shift();
      }
    }

  }, [params, estado, isPlaying]);

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
        const { theta, thetaDot } = calcularAngulo(t);
        const anguloGrados = theta * 180 / Math.PI;

        // Calcular energías
        const altura = params.longitud * (1 - Math.cos(theta));
        const velocidadLineal = params.longitud * Math.abs(thetaDot);
        const energiaCinetica = 0.5 * params.masa * velocidadLineal * velocidadLineal;
        const energiaPotencial = params.masa * G * altura;

        setEstado(prev => ({
          ...prev,
          tiempo: t,
          angulo: anguloGrados,
          velocidadAngular: thetaDot * 180 / Math.PI,
          energiaCinetica,
          energiaPotencial,
        }));
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
  }, [isPlaying, calcularAngulo, dibujar]);

  // Resetear cuando cambian parámetros
  useEffect(() => {
    resetSimulacion();
  }, [params.longitud, params.anguloInicial, params.masa, params.amortiguamiento]);

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
          <span className={styles.infoLabel}>Ángulo</span>
          <span className={styles.infoValue}>{formatNumber(estado.angulo, 1)}<span className={styles.infoUnit}>°</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Período</span>
          <span className={styles.infoValue}>{formatNumber(estado.periodo, 2)}<span className={styles.infoUnit}>s</span></span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Energía Total</span>
          <span className={styles.infoValue}>{formatNumber(estado.energiaCinetica + estado.energiaPotencial, 2)}<span className={styles.infoUnit}>J</span></span>
        </div>
      </div>

      {/* Controles en panel lateral */}
      <div className={styles.controlsPanel}>
        <h3 className={styles.panelTitle}>Parámetros</h3>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Longitud
            <span className={styles.controlValue}>{params.longitud} m</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={params.longitud}
            onChange={(e) => setParams({ ...params, longitud: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Ángulo inicial
            <span className={styles.controlValue}>{params.anguloInicial}°</span>
          </label>
          <input
            type="range"
            min="5"
            max="85"
            value={params.anguloInicial}
            onChange={(e) => setParams({ ...params, anguloInicial: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

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
            Amortiguamiento
            <span className={styles.controlValue}>{params.amortiguamiento}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={params.amortiguamiento}
            onChange={(e) => setParams({ ...params, amortiguamiento: Number(e.target.value) })}
            className={styles.slider}
          />
        </div>

        <label className={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={params.mostrarEstela}
            onChange={(e) => setParams({ ...params, mostrarEstela: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.checkboxLabel}>Mostrar estela</span>
        </label>

        <div className={styles.presetsSection}>
          <h4 className={styles.presetsTitle}>Ejemplos</h4>
          <div className={styles.presetsList}>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, longitud: 1, anguloInicial: 15 })}
            >
              🕐 Reloj (1m, 15°)
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, longitud: 2.5, anguloInicial: 45 })}
            >
              🎢 Columpio (2.5m, 45°)
            </button>
            <button
              className={styles.presetBtn}
              onClick={() => setParams({ ...params, longitud: 0.5, anguloInicial: 30, amortiguamiento: 0.5 })}
            >
              🔔 Campana amortiguada
            </button>
          </div>
        </div>

        <div className={styles.formulasSection}>
          <h4 className={styles.formulasTitle}>Fórmulas</h4>
          <div className={styles.formulasList}>
            <div className={styles.formulaItem}>T = 2π√(L/g)</div>
            <div className={styles.formulaItem}>θ(t) = θ₀cos(ωt)</div>
            <div className={styles.formulaItem}>ω = √(g/L)</div>
          </div>
        </div>
      </div>
    </>
  );
}
