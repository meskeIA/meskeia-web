'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './RuletaAleatoria.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface WheelItem {
  id: string;
  text: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#2E86AB', '#48A9A6', '#E94F37', '#F77F00', '#FCBF49',
  '#7B2CBF', '#3A86FF', '#06D6A0', '#EF476F', '#FFD166'
];

const PRESETS = {
  siNo: ['Sí', 'No'],
  numeros: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  comida: ['Pizza', 'Sushi', 'Hamburguesa', 'Ensalada', 'Pasta', 'Tacos', 'Pollo', 'Paella'],
  colores: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Rosa', 'Negro'],
};

export default function RuletaAleatoriaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', text: 'Opción 1', color: DEFAULT_COLORS[0] },
    { id: '2', text: 'Opción 2', color: DEFAULT_COLORS[1] },
    { id: '3', text: 'Opción 3', color: DEFAULT_COLORS[2] },
    { id: '4', text: 'Opción 4', color: DEFAULT_COLORS[3] },
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dibujar ruleta
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / items.length;

    // Limpiar
    ctx.clearRect(0, 0, size, size);

    // Dibujar segmentos
    items.forEach((item, index) => {
      const startAngle = index * sliceAngle + (rotation * Math.PI) / 180;
      const endAngle = startAngle + sliceAngle;

      // Segmento
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.min(16, 200 / items.length)}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;

      const text = item.text.length > 15 ? item.text.substring(0, 12) + '...' : item.text;
      ctx.fillText(text, radius - 20, 5);
      ctx.restore();
    });

    // Centro
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Borde exterior
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [items, rotation]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Reproducir sonido
  const playSound = useCallback((type: 'spin' | 'win') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'spin') {
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.05);
    } else {
      oscillator.frequency.value = 523.25; // C5
      gainNode.gain.value = 0.2;
      oscillator.start();
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      oscillator.stop(audioContext.currentTime + 0.4);
    }
  }, [soundEnabled]);

  // Girar ruleta
  const spinWheel = useCallback(() => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    // Calcular rotación aleatoria (mínimo 5 vueltas + ángulo aleatorio)
    const spins = 5 + Math.random() * 3;
    const randomAngle = Math.random() * 360;
    const totalRotation = spins * 360 + randomAngle;

    // Animación
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeOut;

      setRotation(currentRotation % 360);

      // Sonido de tick durante el giro
      if (progress < 0.9 && Math.random() > 0.7) {
        playSound('spin');
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determinar ganador
        const finalRotation = (currentRotation % 360 + 360) % 360;
        const sliceAngle = 360 / items.length;
        // El puntero está arriba (270 grados en coordenadas de canvas)
        const adjustedAngle = (270 - finalRotation + 360) % 360;
        const winnerIndex = Math.floor(adjustedAngle / sliceAngle) % items.length;

        const winnerItem = items[winnerIndex];
        setWinner(winnerItem.text);
        setHistory(prev => [winnerItem.text, ...prev].slice(0, 20));
        setIsSpinning(false);
        setShowConfetti(true);
        playSound('win');

        // Ocultar confetti después de 3 segundos
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning, items, rotation, playSound]);

  // Añadir item
  const addItem = useCallback(() => {
    if (!newItemText.trim()) return;

    const newItem: WheelItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      color: DEFAULT_COLORS[items.length % DEFAULT_COLORS.length]
    };

    setItems(prev => [...prev, newItem]);
    setNewItemText('');
  }, [newItemText, items.length]);

  // Eliminar item
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Cargar preset
  const loadPreset = useCallback((preset: string[]) => {
    const newItems = preset.map((text, index) => ({
      id: Date.now().toString() + index,
      text,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));
    setItems(newItems);
    setWinner(null);
  }, []);

  // Limpiar todo
  const clearAll = useCallback(() => {
    setItems([]);
    setWinner(null);
    setHistory([]);
  }, []);

  // Añadir con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  // Eliminar ganador y girar de nuevo
  const removeWinnerAndSpin = useCallback(() => {
    if (!winner) return;
    const winnerItem = items.find(item => item.text === winner);
    if (winnerItem) {
      setItems(prev => prev.filter(item => item.id !== winnerItem.id));
      setWinner(null);
      setTimeout(() => spinWheel(), 300);
    }
  }, [winner, items, spinWheel]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎡</span>
        <h1 className={styles.title}>Ruleta Aleatoria</h1>
        <p className={styles.subtitle}>
          Crea tu ruleta personalizada para sorteos, decisiones o simplemente divertirte. Sin registro, sin límites.
        </p>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.wheelSection}>
          {/* Ruleta */}
          <div className={styles.wheelContainer}>
            {/* Puntero */}
            <div className={styles.pointer}>▼</div>

            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className={`${styles.wheel} ${isSpinning ? styles.spinning : ''}`}
            />

            {/* Confetti */}
            {showConfetti && (
              <div className={styles.confetti}>
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className={styles.confettiPiece}
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length]
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Resultado */}
          {winner && (
            <div className={styles.resultCard}>
              <span className={styles.resultIcon}>🎉</span>
              <h2 className={styles.resultText}>{winner}</h2>
              <div className={styles.resultActions}>
                <button onClick={spinWheel} className={styles.btnPrimary} disabled={isSpinning}>
                  🔄 Girar otra vez
                </button>
                <button onClick={removeWinnerAndSpin} className={styles.btnSecondary} disabled={isSpinning || items.length < 2}>
                  ❌ Eliminar y girar
                </button>
              </div>
            </div>
          )}

          {/* Botón girar */}
          {!winner && (
            <button
              onClick={spinWheel}
              className={styles.spinButton}
              disabled={isSpinning || items.length < 2}
            >
              {isSpinning ? '🎡 Girando...' : '🎯 ¡Girar!'}
            </button>
          )}

          {items.length < 2 && (
            <p className={styles.hint}>Añade al menos 2 opciones para girar</p>
          )}
        </div>

        {/* Panel de opciones */}
        <div className={styles.optionsPanel}>
          <h2 className={styles.panelTitle}>📝 Opciones de la ruleta</h2>

          {/* Añadir nueva opción */}
          <div className={styles.addForm}>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe una opción..."
              className={styles.input}
              maxLength={50}
            />
            <button onClick={addItem} className={styles.btnAdd} disabled={!newItemText.trim()}>
              + Añadir
            </button>
          </div>

          {/* Lista de opciones */}
          <div className={styles.itemsList}>
            {items.map((item, index) => (
              <div key={item.id} className={styles.itemRow}>
                <span
                  className={styles.itemColor}
                  style={{ backgroundColor: item.color }}
                />
                <span className={styles.itemText}>{item.text}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className={styles.btnRemove}
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className={styles.presetsSection}>
            <h3>⚡ Cargar plantilla</h3>
            <div className={styles.presetButtons}>
              <button onClick={() => loadPreset(PRESETS.siNo)} className={styles.btnPreset}>
                Sí/No
              </button>
              <button onClick={() => loadPreset(PRESETS.numeros)} className={styles.btnPreset}>
                Números 1-10
              </button>
              <button onClick={() => loadPreset(PRESETS.diasSemana)} className={styles.btnPreset}>
                Días semana
              </button>
              <button onClick={() => loadPreset(PRESETS.comida)} className={styles.btnPreset}>
                Comida
              </button>
              <button onClick={() => loadPreset(PRESETS.colores)} className={styles.btnPreset}>
                Colores
              </button>
            </div>
          </div>

          {/* Controles */}
          <div className={styles.controlsRow}>
            <button onClick={clearAll} className={styles.btnDanger}>
              🗑️ Limpiar todo
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`${styles.btnToggle} ${soundEnabled ? styles.active : ''}`}
            >
              {soundEnabled ? '🔊 Sonido' : '🔇 Silencio'}
            </button>
          </div>
        </div>
      </main>

      {/* Historial */}
      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3>📜 Historial de resultados</h3>
          <div className={styles.historyList}>
            {history.map((result, index) => (
              <span key={index} className={styles.historyItem}>
                {index === 0 && '🏆'} {result}
              </span>
            ))}
          </div>
          <button onClick={() => setHistory([])} className={styles.btnSmall}>
            Limpiar historial
          </button>
        </div>
      )}

      {/* Usos */}
      <div className={styles.usesSection}>
        <h3>💡 Ideas de uso</h3>
        <div className={styles.usesGrid}>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>👩‍🏫</span>
            <h4>Profesores</h4>
            <p>Selecciona alumnos al azar para participar en clase.</p>
          </div>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>🎁</span>
            <h4>Sorteos</h4>
            <p>Realiza sorteos justos entre participantes.</p>
          </div>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>🤔</span>
            <h4>Decisiones</h4>
            <p>¿No sabes qué cenar? Deja que la ruleta decida.</p>
          </div>
          <div className={styles.useCard}>
            <span className={styles.useIcon}>🎮</span>
            <h4>Juegos</h4>
            <p>Añade retos o pruebas para fiestas y reuniones.</p>
          </div>
        </div>
      </div>

      <Footer appName="ruleta-aleatoria" />
    </div>
  );
}
