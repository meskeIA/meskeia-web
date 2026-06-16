'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GeneradorAvatares.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de estilos de avatar disponibles
type AvatarStyle =
  | 'geometric'
  | 'initials'
  | 'pixels'
  | 'rings'
  | 'gradient'
  | 'abstract'
  | 'robot'
  | 'monster';

interface AvatarStyleOption {
  id: AvatarStyle;
  name: string;
  description: string;
  icon: string;
}

const avatarStyles: AvatarStyleOption[] = [
  { id: 'geometric', name: 'Geométrico', description: 'Formas geométricas simétricas', icon: '🔷' },
  { id: 'initials', name: 'Iniciales', description: 'Letras con fondo colorido', icon: '🔤' },
  { id: 'pixels', name: 'Pixel Art', description: 'Estilo retro pixelado', icon: '👾' },
  { id: 'rings', name: 'Anillos', description: 'Círculos concéntricos', icon: '🎯' },
  { id: 'gradient', name: 'Gradiente', description: 'Degradados suaves', icon: '🌈' },
  { id: 'abstract', name: 'Abstracto', description: 'Formas orgánicas', icon: '🎨' },
  { id: 'robot', name: 'Robot', description: 'Caras de robot simpáticas', icon: '🤖' },
  { id: 'monster', name: 'Monstruo', description: 'Criaturas amigables', icon: '👻' },
];

const sizes = [64, 128, 256, 512];

// Función hash simple para generar valores deterministas desde un string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Genera un array de colores basado en el hash
function generateColors(seed: string, count: number): string[] {
  const hash = hashString(seed);
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = (hash * (i + 1) * 137) % 360;
    const saturation = 60 + (hash * (i + 2)) % 30;
    const lightness = 45 + (hash * (i + 3)) % 20;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}

// Obtiene las iniciales de un texto
function getInitials(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function GeneradorAvataresPage() {
  const [nombre, setNombre] = useState('');
  const [estilo, setEstilo] = useState<AvatarStyle>('geometric');
  const [size, setSize] = useState(256);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [autoBackground, setAutoBackground] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Genera el avatar en el canvas
  const generateAvatar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const seed = nombre.toLowerCase().trim() || 'meskeia';
    const hash = hashString(seed);
    const colors = generateColors(seed, 6);

    // Limpiar canvas
    canvas.width = size;
    canvas.height = size;

    // Fondo
    if (autoBackground) {
      const bgHue = hash % 360;
      ctx.fillStyle = `hsl(${bgHue}, 30%, 90%)`;
    } else {
      ctx.fillStyle = backgroundColor;
    }
    ctx.fillRect(0, 0, size, size);

    // Dibujar según estilo
    switch (estilo) {
      case 'geometric':
        drawGeometric(ctx, size, hash, colors);
        break;
      case 'initials':
        drawInitials(ctx, size, seed, colors);
        break;
      case 'pixels':
        drawPixels(ctx, size, hash, colors);
        break;
      case 'rings':
        drawRings(ctx, size, hash, colors);
        break;
      case 'gradient':
        drawGradient(ctx, size, hash, colors);
        break;
      case 'abstract':
        drawAbstract(ctx, size, hash, colors);
        break;
      case 'robot':
        drawRobot(ctx, size, hash, colors);
        break;
      case 'monster':
        drawMonster(ctx, size, hash, colors);
        break;
    }
  }, [nombre, estilo, size, backgroundColor, autoBackground]);

  // Estilo Geométrico: formas simétricas
  function drawGeometric(ctx: CanvasRenderingContext2D, size: number, hash: number, colors: string[]) {
    const cellSize = size / 5;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 5; j++) {
        const filled = ((hash >> (i * 5 + j)) & 1) === 1;
        if (filled) {
          ctx.fillStyle = colors[(i + j) % colors.length];
          // Lado izquierdo
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          // Lado derecho (espejo)
          ctx.fillRect((4 - i) * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Estilo Iniciales: letras con fondo
  function drawInitials(ctx: CanvasRenderingContext2D, size: number, seed: string, colors: string[]) {
    // Fondo circular con gradiente
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Iniciales
    const initials = getInitials(seed);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.4}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size/2, size/2 + size * 0.02);
  }

  // Estilo Pixels: arte pixelado
  function drawPixels(ctx: CanvasRenderingContext2D, size: number, hash: number, colors: string[]) {
    const gridSize = 8;
    const cellSize = size / gridSize;

    for (let i = 0; i < gridSize / 2; i++) {
      for (let j = 0; j < gridSize; j++) {
        const filled = ((hash >> ((i * gridSize + j) % 32)) & 1) === 1;
        if (filled) {
          ctx.fillStyle = colors[(i + j) % colors.length];
          // Lado izquierdo
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          // Lado derecho (espejo)
          ctx.fillRect((gridSize - 1 - i) * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Estilo Anillos: círculos concéntricos
  function drawRings(ctx: CanvasRenderingContext2D, size: number, hash: number, colors: string[]) {
    const rings = 5;
    const maxRadius = size / 2 - 4;

    for (let i = rings; i > 0; i--) {
      const radius = (maxRadius / rings) * i;
      ctx.beginPath();
      ctx.arc(size/2, size/2, radius, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
    }

    // Patrón de líneas basado en hash
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    const numLines = 3 + (hash % 5);
    for (let i = 0; i < numLines; i++) {
      const angle = (Math.PI * 2 * i) / numLines + (hash % 100) / 100;
      ctx.beginPath();
      ctx.moveTo(size/2, size/2);
      ctx.lineTo(
        size/2 + Math.cos(angle) * maxRadius,
        size/2 + Math.sin(angle) * maxRadius
      );
      ctx.stroke();
    }
  }

  // Estilo Gradiente: degradados suaves
  function drawGradient(ctx: CanvasRenderingContext2D, size: number, hash: number, colors: string[]) {
    const angle = (hash % 360) * Math.PI / 180;
    const x1 = size/2 + Math.cos(angle) * size/2;
    const y1 = size/2 + Math.sin(angle) * size/2;
    const x2 = size/2 - Math.cos(angle) * size/2;
    const y2 = size/2 - Math.sin(angle) * size/2;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);

    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Patrón decorativo
    ctx.globalAlpha = 0.15;
    const numCircles = 3 + (hash % 4);
    for (let i = 0; i < numCircles; i++) {
      const cx = (hash * (i + 1)) % size;
      const cy = (hash * (i + 2)) % size;
      const r = 20 + (hash * (i + 3)) % 40;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Estilo Abstracto: formas orgánicas
  function drawAbstract(ctx: CanvasRenderingContext2D, size: number, hash: number, colors: string[]) {
    // Fondo
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Formas blob
    const numBlobs = 3 + (hash % 3);
    for (let i = 0; i < numBlobs; i++) {
      ctx.fillStyle = colors[(i + 1) % colors.length];
      ctx.globalAlpha = 0.7;

      const cx = size * 0.2 + (hash * (i + 1)) % (size * 0.6);
      const cy = size * 0.2 + (hash * (i + 2)) % (size * 0.6);
      const radius = size * 0.15 + (hash * (i + 3)) % (size * 0.2);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Estilo Robot: cara de robot
  function drawRobot(ctx: CanvasRenderingContext2D, size: number, hash: number, colors: string[]) {
    const unit = size / 16;

    // Fondo
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, size, size);

    // Cabeza
    ctx.fillStyle = colors[1];
    ctx.fillRect(unit * 3, unit * 2, unit * 10, unit * 12);

    // Antena
    const antennaType = hash % 3;
    ctx.fillStyle = colors[2];
    if (antennaType === 0) {
      ctx.fillRect(unit * 7, unit * 0.5, unit * 2, unit * 2);
    } else if (antennaType === 1) {
      ctx.beginPath();
      ctx.arc(unit * 8, unit * 1.5, unit, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(unit * 5, unit * 1, unit * 1.5, unit * 1.5);
      ctx.fillRect(unit * 9.5, unit * 1, unit * 1.5, unit * 1.5);
    }

    // Ojos
    const eyeType = hash % 4;
    ctx.fillStyle = '#ffffff';
    if (eyeType === 0) {
      // Ojos redondos
      ctx.beginPath();
      ctx.arc(unit * 5.5, unit * 6, unit * 1.5, 0, Math.PI * 2);
      ctx.arc(unit * 10.5, unit * 6, unit * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors[3];
      ctx.beginPath();
      ctx.arc(unit * 5.5, unit * 6, unit * 0.8, 0, Math.PI * 2);
      ctx.arc(unit * 10.5, unit * 6, unit * 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (eyeType === 1) {
      // Ojos cuadrados
      ctx.fillRect(unit * 4, unit * 5, unit * 3, unit * 2);
      ctx.fillRect(unit * 9, unit * 5, unit * 3, unit * 2);
      ctx.fillStyle = colors[3];
      ctx.fillRect(unit * 5, unit * 5.5, unit * 1, unit * 1);
      ctx.fillRect(unit * 10, unit * 5.5, unit * 1, unit * 1);
    } else if (eyeType === 2) {
      // Ojos de visor
      ctx.fillRect(unit * 4, unit * 5, unit * 8, unit * 2);
      ctx.fillStyle = colors[3];
      ctx.fillRect(unit * 5, unit * 5.5, unit * 2, unit * 1);
      ctx.fillRect(unit * 9, unit * 5.5, unit * 2, unit * 1);
    } else {
      // Ojos LED
      ctx.fillStyle = colors[4] || colors[2];
      ctx.beginPath();
      ctx.arc(unit * 5.5, unit * 6, unit * 1.2, 0, Math.PI * 2);
      ctx.arc(unit * 10.5, unit * 6, unit * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boca
    const mouthType = hash % 5;
    ctx.fillStyle = colors[4] || colors[2];
    if (mouthType === 0) {
      // Sonrisa
      ctx.beginPath();
      ctx.arc(unit * 8, unit * 10, unit * 2, 0, Math.PI);
      ctx.stroke();
    } else if (mouthType === 1) {
      // Rejilla
      ctx.fillRect(unit * 5, unit * 10, unit * 6, unit * 2);
      ctx.fillStyle = colors[1];
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(unit * (5.5 + i * 2), unit * 10, unit * 0.5, unit * 2);
      }
    } else if (mouthType === 2) {
      // Línea
      ctx.fillRect(unit * 5, unit * 10.5, unit * 6, unit * 1);
    } else if (mouthType === 3) {
      // Zigzag
      ctx.strokeStyle = colors[4] || colors[2];
      ctx.lineWidth = unit * 0.5;
      ctx.beginPath();
      ctx.moveTo(unit * 5, unit * 11);
      ctx.lineTo(unit * 6.5, unit * 10);
      ctx.lineTo(unit * 8, unit * 11);
      ctx.lineTo(unit * 9.5, unit * 10);
      ctx.lineTo(unit * 11, unit * 11);
      ctx.stroke();
    } else {
      // Puntos
      ctx.beginPath();
      ctx.arc(unit * 6, unit * 11, unit * 0.5, 0, Math.PI * 2);
      ctx.arc(unit * 8, unit * 11, unit * 0.5, 0, Math.PI * 2);
      ctx.arc(unit * 10, unit * 11, unit * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Estilo Monstruo: criatura amigable
  function drawMonster(ctx: CanvasRenderingContext2D, size: number, hash: number, colors: string[]) {
    const unit = size / 16;

    // Cuerpo (forma redondeada)
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.ellipse(size/2, size/2 + unit, size/2 - unit * 2, size/2 - unit, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuernos/orejas opcionales
    const hasHorns = (hash % 3) !== 0;
    if (hasHorns) {
      ctx.fillStyle = colors[1];
      const hornType = hash % 2;
      if (hornType === 0) {
        // Cuernos triangulares
        ctx.beginPath();
        ctx.moveTo(unit * 3, unit * 4);
        ctx.lineTo(unit * 4.5, unit * 1);
        ctx.lineTo(unit * 6, unit * 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(unit * 10, unit * 4);
        ctx.lineTo(unit * 11.5, unit * 1);
        ctx.lineTo(unit * 13, unit * 4);
        ctx.fill();
      } else {
        // Orejas redondas
        ctx.beginPath();
        ctx.arc(unit * 3.5, unit * 3.5, unit * 1.5, 0, Math.PI * 2);
        ctx.arc(unit * 12.5, unit * 3.5, unit * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ojos
    const numEyes = 1 + (hash % 3); // 1, 2 o 3 ojos
    ctx.fillStyle = '#ffffff';

    if (numEyes === 1) {
      // Un ojo central grande
      ctx.beginPath();
      ctx.arc(size/2, unit * 6, unit * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors[2];
      ctx.beginPath();
      ctx.arc(size/2, unit * 6, unit * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(size/2, unit * 6, unit * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (numEyes === 2) {
      // Dos ojos
      ctx.beginPath();
      ctx.arc(unit * 5.5, unit * 6, unit * 2, 0, Math.PI * 2);
      ctx.arc(unit * 10.5, unit * 6, unit * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors[2];
      ctx.beginPath();
      ctx.arc(unit * 5.5, unit * 6, unit * 1, 0, Math.PI * 2);
      ctx.arc(unit * 10.5, unit * 6, unit * 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(unit * 5.5, unit * 6, unit * 0.5, 0, Math.PI * 2);
      ctx.arc(unit * 10.5, unit * 6, unit * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tres ojos
      const eyePositions = [[size/2, unit * 4], [unit * 5, unit * 7], [unit * 11, unit * 7]];
      eyePositions.forEach(([x, y]) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, unit * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors[2];
        ctx.beginPath();
        ctx.arc(x, y, unit * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Boca
    const mouthType = hash % 4;
    ctx.fillStyle = colors[3] || '#333333';

    if (mouthType === 0) {
      // Sonrisa grande
      ctx.beginPath();
      ctx.arc(size/2, unit * 10, unit * 3, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.fill();
      // Dientes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(unit * 6, unit * 10, unit * 1, unit * 1.5);
      ctx.fillRect(unit * 9, unit * 10, unit * 1, unit * 1.5);
    } else if (mouthType === 1) {
      // Boca abierta redonda
      ctx.beginPath();
      ctx.arc(size/2, unit * 11, unit * 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (mouthType === 2) {
      // Sonrisa con colmillos
      ctx.beginPath();
      ctx.arc(size/2, unit * 10, unit * 2.5, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(unit * 5.5, unit * 10);
      ctx.lineTo(unit * 6.5, unit * 12);
      ctx.lineTo(unit * 7, unit * 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(unit * 9, unit * 10);
      ctx.lineTo(unit * 9.5, unit * 12);
      ctx.lineTo(unit * 10.5, unit * 10);
      ctx.fill();
    } else {
      // Expresión neutral
      ctx.fillRect(unit * 6, unit * 11, unit * 4, unit * 1);
    }

    // Manchas opcionales
    const hasSpots = (hash % 4) === 0;
    if (hasSpots) {
      ctx.fillStyle = colors[4] || colors[1];
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(unit * 4, unit * 9, unit, 0, Math.PI * 2);
      ctx.arc(unit * 12, unit * 8, unit * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Regenerar avatar cuando cambian las opciones
  useEffect(() => {
    generateAvatar();
  }, [generateAvatar]);

  // Descargar avatar
  const downloadAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    const nombreArchivo = nombre.trim() || 'avatar';
    link.download = `avatar-${nombreArchivo.replace(/\s+/g, '-').toLowerCase()}-${size}px.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Copiar al portapapeles
  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('Avatar copiado al portapapeles');
    } catch {
      alert('No se pudo copiar. Usa el botón de descarga.');
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">👤</span>
        <h1 className={styles.title}>Generador de Avatares</h1>
        <p className={styles.subtitle}>
          Crea avatares únicos y personalizados a partir de tu nombre. Sin subir fotos, 100% privado.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <div className={styles.inputGroup}>
            <label htmlFor="nombre" className={styles.label}>
              Nombre o texto semilla
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre..."
              className={styles.input}
            />
            <span className={styles.helperText}>
              El mismo texto siempre genera el mismo avatar
            </span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Estilo de avatar</label>
            <div className={styles.styleGrid}>
              {avatarStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setEstilo(style.id)}
                  className={`${styles.styleButton} ${estilo === style.id ? styles.styleButtonActive : ''}`}
                  title={style.description}
                  aria-pressed={estilo === style.id}
                >
                  <span className={styles.styleIcon} aria-hidden="true">{style.icon}</span>
                  <span className={styles.styleName}>{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Tamaño</label>
            <div className={styles.sizeOptions}>
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`${styles.sizeButton} ${size === s ? styles.sizeButtonActive : ''}`}
                  aria-pressed={size === s}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Fondo</label>
            <div className={styles.backgroundOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoBackground}
                  onChange={(e) => setAutoBackground(e.target.checked)}
                  className={styles.checkbox}
                />
                Automático (basado en nombre)
              </label>
              {!autoBackground && (
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className={styles.colorPicker}
                />
              )}
            </div>
          </div>
        </div>

        {/* Panel de vista previa */}
        <div className={styles.previewPanel}>
          <div className={styles.previewCard}>
            <h3 className={styles.previewTitle}>Vista previa</h3>
            <div className={styles.canvasWrapper}>
              <canvas
                ref={canvasRef}
                width={size}
                height={size}
                className={styles.canvas}
              />
            </div>
            <div className={styles.previewInfo}>
              <span>{size} × {size} píxeles</span>
              <span>PNG transparente</span>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button type="button" onClick={downloadAvatar} className={styles.btnPrimary}>
              <span aria-hidden="true">📥</span> Descargar PNG
            </button>
            <button type="button" onClick={copyToClipboard} className={styles.btnSecondary}>
              <span aria-hidden="true">📋</span> Copiar al portapapeles
            </button>
            <button type="button" onClick={generateAvatar} className={styles.btnSecondary}>
              <span aria-hidden="true">🔄</span> Regenerar
            </button>
          </div>

          {/* Ejemplos en diferentes tamaños */}
          <div className={styles.sizeExamples}>
            <h4 className={styles.examplesTitle}>Vista en diferentes usos</h4>
            <div className={styles.examplesGrid}>
              <div className={styles.exampleItem}>
                <div
                  className={styles.exampleCircle}
                  style={{ width: 32, height: 32 }}
                >
                  <canvas
                    width={32}
                    height={32}
                    ref={(el) => {
                      if (el && canvasRef.current) {
                        const ctx = el.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(canvasRef.current, 0, 0, 32, 32);
                        }
                      }
                    }}
                  />
                </div>
                <span className={styles.exampleLabel}>Chat</span>
              </div>
              <div className={styles.exampleItem}>
                <div
                  className={styles.exampleCircle}
                  style={{ width: 48, height: 48 }}
                >
                  <canvas
                    width={48}
                    height={48}
                    ref={(el) => {
                      if (el && canvasRef.current) {
                        const ctx = el.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(canvasRef.current, 0, 0, 48, 48);
                        }
                      }
                    }}
                  />
                </div>
                <span className={styles.exampleLabel}>Perfil</span>
              </div>
              <div className={styles.exampleItem}>
                <div
                  className={styles.exampleCircle}
                  style={{ width: 80, height: 80 }}
                >
                  <canvas
                    width={80}
                    height={80}
                    ref={(el) => {
                      if (el && canvasRef.current) {
                        const ctx = el.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(canvasRef.current, 0, 0, 80, 80);
                        }
                      }
                    }}
                  />
                </div>
                <span className={styles.exampleLabel}>Avatar grande</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Cómo funcionan los avatares generados?"
        subtitle="Descubre la tecnología detrás de la generación determinista de avatares"
        icon="🎨"
      >
        <div className={styles.educationalContent}>
          <section className={styles.guideSection}>
            <h2>¿Qué es un avatar generado?</h2>
            <p>
              Un avatar generado es una imagen creada algorítmicamente a partir de un texto
              (como tu nombre o email). A diferencia de una foto, no revela tu identidad real
              pero te proporciona una imagen única y consistente.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Ventajas de usar avatares generados</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🔒 Privacidad</h4>
                <p>No necesitas subir fotos personales ni compartir tu imagen real.</p>
              </div>
              <div className={styles.contentCard}>
                <h4>🎯 Consistencia</h4>
                <p>El mismo texto siempre genera exactamente el mismo avatar.</p>
              </div>
              <div className={styles.contentCard}>
                <h4>⚡ Instantáneo</h4>
                <p>Se genera al momento, sin esperas ni procesamientos externos.</p>
              </div>
              <div className={styles.contentCard}>
                <h4>🌐 Universal</h4>
                <p>Funciona offline, sin servidores, todo se procesa en tu navegador.</p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Usos comunes</h2>
            <ul className={styles.usesList}>
              <li>Perfiles en foros y comunidades online</li>
              <li>Aplicaciones de mensajería y chat</li>
              <li>Sistemas internos de empresas</li>
              <li>Prototipos y diseños de interfaz</li>
              <li>Juegos y plataformas de entretenimiento</li>
              <li>Identificación visual en comentarios de blogs</li>
            </ul>
          </section>

          <section className={styles.guideSection}>
            <h2>Tecnología utilizada</h2>
            <p>
              Este generador utiliza funciones hash deterministas y el API Canvas de HTML5.
              El texto de entrada se convierte en un número mediante una función hash, y ese
              número determina los colores, formas y patrones del avatar. Al ser determinista,
              el mismo input siempre produce el mismo output visual.
            </p>
          </section>

          {/* Tabla Comparativa de Estilos */}
          <section className={styles.guideSection}>
            <h2>Comparativa de estilos de avatar</h2>
            <p>Cada estilo tiene sus puntos fuertes según el contexto de uso:</p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Estilo</th>
                    <th>Profesionalidad percibida</th>
                    <th>Plataformas ideales</th>
                    <th>Facilidad de creación</th>
                    <th>Reconocimiento a escala pequeña</th>
                    <th>Coherencia de marca</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Foto real</strong></td>
                    <td>⭐⭐⭐⭐⭐</td>
                    <td>LinkedIn, email profesional</td>
                    <td>Media (requiere buena foto)</td>
                    <td>⭐⭐⭐⭐</td>
                    <td>⭐⭐⭐</td>
                  </tr>
                  <tr>
                    <td><strong>Ilustración / Cartoon</strong></td>
                    <td>⭐⭐⭐⭐</td>
                    <td>Twitter, YouTube, blogs</td>
                    <td>Baja (requiere diseñador)</td>
                    <td>⭐⭐⭐⭐⭐</td>
                    <td>⭐⭐⭐⭐⭐</td>
                  </tr>
                  <tr>
                    <td><strong>Minimalista geométrico</strong></td>
                    <td>⭐⭐⭐⭐</td>
                    <td>GitHub, apps técnicas, portfolios</td>
                    <td>Alta (generadores automáticos)</td>
                    <td>⭐⭐⭐⭐</td>
                    <td>⭐⭐⭐⭐</td>
                  </tr>
                  <tr>
                    <td><strong>Pixel Art</strong></td>
                    <td>⭐⭐</td>
                    <td>Discord, Twitch, gaming, foros</td>
                    <td>Media (editores de pixel)</td>
                    <td>⭐⭐⭐</td>
                    <td>⭐⭐⭐</td>
                  </tr>
                  <tr>
                    <td><strong>3D Render</strong></td>
                    <td>⭐⭐⭐⭐</td>
                    <td>Metaverso, apps 3D, presentaciones</td>
                    <td>Baja (software especializado)</td>
                    <td>⭐⭐⭐</td>
                    <td>⭐⭐⭐⭐</td>
                  </tr>
                  <tr>
                    <td><strong>Abstracto / Inicial</strong></td>
                    <td>⭐⭐⭐</td>
                    <td>Apps empresariales, Slack, Jira</td>
                    <td>Muy alta (automático)</td>
                    <td>⭐⭐⭐⭐⭐</td>
                    <td>⭐⭐⭐⭐</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Casos de Uso */}
          <section className={styles.guideSection}>
            <h2>Casos de uso habituales</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🧑‍💻</span>
                  <h4>Freelance con presencia online</h4>
                </div>
                <p>Un profesional independiente necesita un avatar consistente en LinkedIn, GitHub, Twitter y Behance.</p>
                <p className={styles.escenarioExample}><strong>Ejemplo:</strong> Diseñador que usa el mismo avatar ilustrado en todas sus plataformas para ser reconocible al instante.</p>
                <p className={styles.escenarioTip}>Tip: Elige un estilo que refleje tu sector. Diseño → ilustración. Tecnología → geométrico o iniciales.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏢</span>
                  <h4>Empresa asignando avatares corporativos</h4>
                </div>
                <p>Una empresa quiere que todos sus empleados tengan avatares de perfil coherentes con el branding corporativo.</p>
                <p className={styles.escenarioExample}><strong>Ejemplo:</strong> Generador de iniciales con los colores corporativos para cada empleado, sin necesitar fotos.</p>
                <p className={styles.escenarioTip}>Tip: Usa el nombre completo como semilla para garantizar unicidad. El estilo "Iniciales" es el más corporativo.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🌐</span>
                  <h4>Comunidad online con identidades anónimas</h4>
                </div>
                <p>Foros, comunidades y plataformas donde los usuarios quieren mantener privacidad pero tener identidad visual propia.</p>
                <p className={styles.escenarioExample}><strong>Ejemplo:</strong> Reddit o Hacker News generando avatares únicos a partir del username, sin foto real.</p>
                <p className={styles.escenarioTip}>Tip: El avatar generado desde el username garantiza que dos usuarios nunca tengan el mismo avatar.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>⚙️</span>
                  <h4>Desarrollador creando avatares para su plataforma</h4>
                </div>
                <p>Un desarrollador necesita avatares por defecto para los usuarios de su app que aún no han subido foto de perfil.</p>
                <p className={styles.escenarioExample}><strong>Ejemplo:</strong> GitHub genera un avatar geométrico único para cada cuenta nueva antes de subir foto.</p>
                <p className={styles.escenarioTip}>Tip: Implementa generación determinista desde el email o ID de usuario para consistencia entre sesiones.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes sobre avatares</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Qué tamaño debe tener un avatar para redes sociales?</h4>
                <p>El mínimo recomendado es <strong>400×400 píxeles</strong>. Twitter muestra 400×400, LinkedIn hasta 800×800, Instagram 180×180. Genera siempre en 512×512 como base y escala según necesidad. Un tamaño mayor nunca perjudica; uno menor sí provoca pixelado.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Es mejor foto real o avatar ilustrado para uso profesional?</h4>
                <p>Depende del contexto. Para <strong>LinkedIn y entornos corporativos</strong>, la foto real genera más confianza y clics. Para <strong>desarrolladores, diseñadores y creadores de contenido</strong>, un avatar ilustrado consistente puede ser más memorable y reforzar la marca personal. Muchos profesionales exitosos usan avatar ilustrado en plataformas técnicas.</p>
                <p className={styles.faqTip}>Regla práctica: Si vendes servicios B2B a empresas tradicionales, usa foto real. Si tu audiencia es digital-nativa, el avatar ilustrado funciona igual o mejor.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo genero un avatar coherente con mi marca?</h4>
                <p>Identifica los colores de tu marca (máximo 2-3) y elige un estilo de avatar que los use. Para marcas profesionales: iniciales o geométrico. Para marcas creativas: ilustración o abstracto. Para marcas técnicas: pixel art o geométrico. La consistencia entre plataformas es más importante que el estilo elegido.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué formato es mejor para avatares (PNG, JPG, SVG)?</h4>
                <p><strong>PNG</strong> es el formato ideal: soporte para transparencia, sin pérdida de calidad al comprimir, ampliamente compatible. <strong>JPG</strong> pierde calidad en cada guardado y no soporta transparencia. <strong>SVG</strong> es perfecto si tu avatar es vectorial (no pixel art ni fotos), escala sin límite y pesa poco.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Puedo usar el mismo avatar en todas las redes?</h4>
                <p>Sí, es lo recomendable para la coherencia de marca. Sin embargo, considera que algunas plataformas recortan en <strong>círculo</strong> (Twitter, LinkedIn, Discord) y otras en <strong>cuadrado</strong> (WhatsApp en algunos contextos). Verifica que tu avatar se vea bien en ambos formatos antes de usarlo universalmente.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Los avatares generados por IA tienen derechos de autor?</h4>
                <p>En España y la UE, las obras generadas completamente por IA sin intervención creativa humana <strong>no son protegibles por derechos de autor</strong> según el marco legal actual (Directiva 2019/790). Los avatares generados algorítmicamente (como los de esta herramienta) pueden usarse libremente. Consulta los términos de servicio si usas herramientas de IA generativa externas.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cada cuánto debo actualizar mi avatar?</h4>
                <p>Lo ideal es mantener el mismo avatar entre <strong>6 meses y 2 años</strong>. Cambiar con demasiada frecuencia perjudica el reconocimiento de marca. Actualiza cuando: cambie significativamente tu imagen profesional, el avatar esté muy anticuado, o relances tu marca personal. Si cambias de foto real, mantén el estilo visual similar para facilitar el reconocimiento.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo optimizo un avatar para que se vea bien en tamaño pequeño?</h4>
                <p>Usa <strong>alto contraste</strong> entre el elemento principal y el fondo. Evita detalles finos que desaparecen a 32×32px. Si usas iniciales, prefiere fuentes bold con letra grande. Verifica siempre la versión miniatura antes de publicar. El recorte circular puede cortar bordes importantes: centra el elemento visual en el área segura central (70% del cuadrado).</p>
              </div>
            </div>
          </section>

          {/* Guía Paso a Paso */}
          <section className={styles.guideSection}>
            <h2>Guía paso a paso para crear tu avatar</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Define el uso principal</h4>
                  <p>Decide si tu avatar es para uso <strong>profesional</strong> (LinkedIn, email corporativo), <strong>casual</strong> (redes sociales personales, foros) o <strong>gaming/entretenimiento</strong> (Discord, Twitch). El contexto determina el estilo adecuado.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Elige un estilo coherente con tu marca</h4>
                  <p>Selecciona el estilo que mejor represente tu personalidad o marca. Para profesionales del diseño: ilustración o geométrico. Para desarrolladores: pixel art o iniciales. Para marcas corporativas: iniciales con colores de empresa.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Genera variantes de color y estilo</h4>
                  <p>Prueba varios estilos con tu nombre y compara. Genera también con variaciones del texto (nombre completo, username, nombre + apellido) para ver cuál produce el resultado más atractivo y representativo.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Verifica legibilidad a 32×32px (favicon)</h4>
                  <p>Usa la sección "Vista en diferentes usos" para confirmar que tu avatar sigue siendo reconocible en tamaño miniatura. Si el detalle desaparece a 32px, elige un estilo con menos elementos o mayor contraste.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Exporta en PNG con fondo transparente</h4>
                  <p>Descarga el avatar en formato PNG, que preserva la transparencia. Esto te permite colocarlo sobre cualquier fondo (claro, oscuro, de color) sin que aparezca un recuadro blanco antiestético.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h4>Crea versión circular y cuadrada</h4>
                  <p>Guarda el avatar en ambas variantes. Las plataformas como Twitter y LinkedIn recortan en círculo; otras muestran el cuadrado completo. Comprueba que el recorte circular no elimina elementos importantes del diseño.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <h4>Guarda en alta resolución para usos futuros</h4>
                  <p>Exporta siempre en el tamaño máximo disponible (512×512px o superior). Los usos futuros pueden requerir versiones más grandes (tarjetas de presentación, banners). Es más fácil reducir que ampliar sin perder calidad.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Mejores Prácticas */}
          <section className={styles.guideSection}>
            <h2>Mejores prácticas para avatares efectivos</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📐</span>
                <h4>Tamaño mínimo 400×400px</h4>
                <p>Por debajo de 400×400 píxeles el avatar se pixela en plataformas que lo muestran ampliado. Genera siempre en 512×512 como mínimo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🖼️</span>
                <h4>PNG transparente = máxima versatilidad</h4>
                <p>El fondo transparente permite usar el avatar sobre cualquier color sin crear un recuadro antiestético. Es el estándar para avatares profesionales.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📅</span>
                <h4>Mantén el avatar 6-12 meses mínimo</h4>
                <p>El reconocimiento de marca se construye con consistencia temporal. Cambiar de avatar con frecuencia confunde a tu audiencia y dificulta que te identifiquen.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔄</span>
                <h4>Crea versión con y sin fondo</h4>
                <p>Tener ambas versiones te da flexibilidad para diferentes contextos: fondo blanco para documentos, transparente para redes sociales.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🌓</span>
                <h4>Prueba en fondo claro y oscuro</h4>
                <p>Las plataformas tienen modo claro y oscuro. Verifica que tu avatar tiene suficiente contraste y es visible en ambos fondos antes de publicarlo.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🎭</span>
                <h4>Adapta el estilo al tono de la plataforma</h4>
                <p>LinkedIn requiere un tono profesional (foto real o avatar sobrio). Twitter admite más creatividad. Discord y Twitch premian los avatares llamativos y únicos.</p>
              </div>
            </div>
          </section>

          {/* Warning Box */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>⚠️</span>
                <h3>Errores frecuentes que debes evitar</h3>
              </div>
              <ul className={styles.warningList}>
                <li>Usar una foto de baja resolución que se pixela al ampliarse en pantallas de alta densidad.</li>
                <li>Cambiar de avatar constantemente: daña el reconocimiento de marca y confunde a seguidores y contactos.</li>
                <li>Usar una imagen con derechos de autor sin licencia apropiada, lo que puede generar reclamaciones legales.</li>
                <li>No verificar que el avatar se ve bien en formato circular: LinkedIn y Twitter recortan en círculo y pueden cortar elementos clave del diseño.</li>
                <li>Usar un avatar muy oscuro en plataformas con fondo oscuro (modo noche): el avatar puede volverse invisible o perder contraste.</li>
                <li>No guardar el archivo original en alta resolución: si en el futuro necesitas una versión más grande, perderás calidad al ampliar.</li>
              </ul>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-avatares')} />
      <ShareCard appName="generador-avatares" />
      <Footer appName="generador-avatares" />
    </div>
  );
}
