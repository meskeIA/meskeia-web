'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './ContadorManual.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface Contador {
  id: number;
  nombre: string;
  valor: number;
  color: string;
}

const COLORES = ['#2E86AB', '#48A9A6', '#E91E63', '#FF9800', '#4CAF50', '#9C27B0', '#00BCD4', '#795548'];

export default function ContadorManualPage() {
  const [contadores, setContadores] = useState<Contador[]>([
    { id: 1, nombre: 'Contador 1', valor: 0, color: '#2E86AB' }
  ]);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [vibracionActiva, setVibracionActiva] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Inicializar AudioContext
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  // Cargar estado desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('contadorManual_v1');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.contadores) setContadores(data.contadores);
        if (data.sonidoActivo !== undefined) setSonidoActivo(data.sonidoActivo);
        if (data.vibracionActiva !== undefined) setVibracionActiva(data.vibracionActiva);
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Guardar estado en localStorage
  useEffect(() => {
    localStorage.setItem('contadorManual_v1', JSON.stringify({
      contadores,
      sonidoActivo,
      vibracionActiva
    }));
  }, [contadores, sonidoActivo, vibracionActiva]);

  const reproducirSonido = useCallback((frecuencia: number = 800, duracion: number = 50) => {
    if (!sonidoActivo || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frecuencia;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duracion / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duracion / 1000);
  }, [sonidoActivo, audioContext]);

  const vibrar = useCallback((duracion: number = 30) => {
    if (!vibracionActiva || !navigator.vibrate) return;
    navigator.vibrate(duracion);
  }, [vibracionActiva]);

  const incrementar = (id: number) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, valor: c.valor + 1 } : c
    ));
    reproducirSonido(800, 50);
    vibrar(30);
  };

  const decrementar = (id: number) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, valor: Math.max(0, c.valor - 1) } : c
    ));
    reproducirSonido(400, 50);
    vibrar(20);
  };

  const resetear = (id: number) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, valor: 0 } : c
    ));
    reproducirSonido(300, 100);
    vibrar(50);
  };

  const agregarContador = () => {
    const nuevoId = Math.max(...contadores.map(c => c.id), 0) + 1;
    const colorIndex = contadores.length % COLORES.length;
    setContadores(prev => [...prev, {
      id: nuevoId,
      nombre: `Contador ${nuevoId}`,
      valor: 0,
      color: COLORES[colorIndex]
    }]);
  };

  const eliminarContador = (id: number) => {
    if (contadores.length <= 1) return;
    setContadores(prev => prev.filter(c => c.id !== id));
  };

  const cambiarNombre = (id: number, nombre: string) => {
    setContadores(prev => prev.map(c =>
      c.id === id ? { ...c, nombre } : c
    ));
  };

  const cambiarColor = (id: number) => {
    setContadores(prev => prev.map(c => {
      if (c.id !== id) return c;
      const currentIndex = COLORES.indexOf(c.color);
      const nextIndex = (currentIndex + 1) % COLORES.length;
      return { ...c, color: COLORES[nextIndex] };
    }));
  };

  const totalGeneral = contadores.reduce((sum, c) => sum + c.valor, 0);

  const resetearTodos = () => {
    setContadores(prev => prev.map(c => ({ ...c, valor: 0 })));
    reproducirSonido(300, 150);
    vibrar(100);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Contador Manual</h1>
        <p className={styles.subtitle}>
          Tally counter digital - Cuenta cualquier cosa con un clic
        </p>
      </header>

      {/* Configuración */}
      <div className={styles.config}>
        <button
          className={`${styles.configBtn} ${sonidoActivo ? styles.activo : ''}`}
          onClick={() => setSonidoActivo(!sonidoActivo)}
          title={sonidoActivo ? 'Desactivar sonido' : 'Activar sonido'}
        >
          {sonidoActivo ? '🔊' : '🔇'} Sonido
        </button>
        <button
          className={`${styles.configBtn} ${vibracionActiva ? styles.activo : ''}`}
          onClick={() => setVibracionActiva(!vibracionActiva)}
          title={vibracionActiva ? 'Desactivar vibración' : 'Activar vibración'}
        >
          {vibracionActiva ? '📳' : '📴'} Vibración
        </button>
      </div>

      {/* Total general */}
      {contadores.length > 1 && (
        <div className={styles.totalGeneral}>
          <span className={styles.totalLabel}>Total general:</span>
          <span className={styles.totalValor}>{totalGeneral.toLocaleString('es-ES')}</span>
          <button className={styles.btnResetAll} onClick={resetearTodos}>
            Resetear todos
          </button>
        </div>
      )}

      {/* Contadores */}
      <div className={styles.contadoresGrid}>
        {contadores.map(contador => (
          <div
            key={contador.id}
            className={styles.contadorCard}
            style={{ '--contador-color': contador.color } as React.CSSProperties}
          >
            <div className={styles.contadorHeader}>
              <input
                type="text"
                value={contador.nombre}
                onChange={(e) => cambiarNombre(contador.id, e.target.value)}
                className={styles.nombreInput}
                maxLength={20}
              />
              <div className={styles.contadorActions}>
                <button
                  className={styles.btnColor}
                  onClick={() => cambiarColor(contador.id)}
                  title="Cambiar color"
                  style={{ background: contador.color }}
                >
                  🎨
                </button>
                {contadores.length > 1 && (
                  <button
                    className={styles.btnEliminar}
                    onClick={() => eliminarContador(contador.id)}
                    title="Eliminar contador"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className={styles.contadorBody}>
              <button
                className={styles.btnDecrementar}
                onClick={() => decrementar(contador.id)}
                disabled={contador.valor === 0}
              >
                −
              </button>

              <button
                className={styles.valorDisplay}
                onClick={() => incrementar(contador.id)}
                style={{ background: contador.color }}
              >
                <span className={styles.valorNumero}>
                  {contador.valor.toLocaleString('es-ES')}
                </span>
                <span className={styles.valorHint}>Toca para +1</span>
              </button>

              <button
                className={styles.btnIncrementar}
                onClick={() => incrementar(contador.id)}
              >
                +
              </button>
            </div>

            <button
              className={styles.btnReset}
              onClick={() => resetear(contador.id)}
              disabled={contador.valor === 0}
            >
              ↺ Resetear
            </button>
          </div>
        ))}

        {/* Botón agregar contador */}
        <button className={styles.btnAgregar} onClick={agregarContador}>
          <span className={styles.agregarIcon}>+</span>
          <span className={styles.agregarTexto}>Añadir contador</span>
        </button>
      </div>

      {/* Usos sugeridos */}
      <div className={styles.usosSection}>
        <h2 className={styles.usosTitle}>Usos comunes</h2>
        <div className={styles.usosGrid}>
          <div className={styles.usoItem}>👥 Contar personas</div>
          <div className={styles.usoItem}>🏋️ Repeticiones de ejercicio</div>
          <div className={styles.usoItem}>📦 Inventario</div>
          <div className={styles.usoItem}>🎯 Puntuación de juegos</div>
          <div className={styles.usoItem}>📿 Oraciones/mantras</div>
          <div className={styles.usoItem}>🚗 Contar vehículos</div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('contador-manual')} />
      <Footer appName="contador-manual" />
    </div>
  );
}
