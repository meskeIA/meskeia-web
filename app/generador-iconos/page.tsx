'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './GeneradorIconos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface GeneratedIcon {
  size: number;
  blob: Blob;
  url: string;
  fileName: string;
  sizeKB: string;
  pngData?: Uint8Array; // Para generar ICO
}

interface IconPreset {
  name: string;
  sizes: number[];
  description: string;
  icon: string;
}

const ICON_PRESETS: IconPreset[] = [
  {
    name: 'PWA Completo',
    sizes: [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 384, 512],
    description: 'Todos los tamaños para manifest.json',
    icon: '📱'
  },
  {
    name: 'Favicon',
    sizes: [16, 32, 48, 64, 128, 256],
    description: 'Iconos para navegadores',
    icon: '🌐'
  },
  {
    name: 'Favicon ICO',
    sizes: [16, 32, 48],
    description: 'Multi-resolución en .ico',
    icon: '🎯'
  },
  {
    name: 'Apple Touch',
    sizes: [57, 60, 72, 76, 114, 120, 144, 152, 180],
    description: 'iOS home screen icons',
    icon: '🍎'
  },
  {
    name: 'Android Chrome',
    sizes: [36, 48, 72, 96, 144, 192, 512],
    description: 'Android PWA icons',
    icon: '🤖'
  },
  {
    name: 'Windows Tiles',
    sizes: [70, 150, 310],
    description: 'Windows 10/11 tiles',
    icon: '🪟'
  },
  {
    name: 'Mínimo',
    sizes: [16, 32, 192, 512],
    description: 'Solo los esenciales',
    icon: '✨'
  }
];

/**
 * Genera un archivo ICO multi-resolución a partir de imágenes PNG
 * Formato ICO: https://en.wikipedia.org/wiki/ICO_(file_format)
 */
const generateIcoFile = async (icons: GeneratedIcon[]): Promise<Blob> => {
  // Filtrar solo tamaños válidos para ICO (máx 256px)
  const validIcons = icons.filter(icon => icon.size <= 256 && icon.pngData);

  if (validIcons.length === 0) {
    throw new Error('No hay iconos válidos para generar ICO (máx 256px)');
  }

  const numImages = validIcons.length;

  // Calcular tamaños
  // Header: 6 bytes
  // Directory entries: 16 bytes cada uno
  const headerSize = 6;
  const directorySize = 16 * numImages;
  let dataOffset = headerSize + directorySize;

  // Preparar datos de cada imagen
  const imageEntries: { size: number; data: Uint8Array; offset: number }[] = [];

  for (const icon of validIcons) {
    if (!icon.pngData) continue;
    imageEntries.push({
      size: icon.size,
      data: icon.pngData,
      offset: dataOffset
    });
    dataOffset += icon.pngData.length;
  }

  // Calcular tamaño total del archivo
  const totalSize = dataOffset;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // Escribir header ICO
  view.setUint16(0, 0, true);       // Reserved (0)
  view.setUint16(2, 1, true);       // Type (1 = ICO)
  view.setUint16(4, numImages, true); // Number of images

  // Escribir directory entries
  let entryOffset = 6;
  for (const entry of imageEntries) {
    // Width (0 = 256)
    view.setUint8(entryOffset, entry.size === 256 ? 0 : entry.size);
    // Height (0 = 256)
    view.setUint8(entryOffset + 1, entry.size === 256 ? 0 : entry.size);
    // Color palette (0 = no palette)
    view.setUint8(entryOffset + 2, 0);
    // Reserved
    view.setUint8(entryOffset + 3, 0);
    // Color planes (1 para ICO)
    view.setUint16(entryOffset + 4, 1, true);
    // Bits per pixel (32 para RGBA)
    view.setUint16(entryOffset + 6, 32, true);
    // Size of image data
    view.setUint32(entryOffset + 8, entry.data.length, true);
    // Offset to image data
    view.setUint32(entryOffset + 12, entry.offset, true);

    entryOffset += 16;
  }

  // Escribir datos de imágenes PNG
  for (const entry of imageEntries) {
    uint8.set(entry.data, entry.offset);
  }

  return new Blob([buffer], { type: 'image/x-icon' });
};

type OutputFormat = 'png' | 'webp' | 'jpeg';
type PreviewShape = 'square' | 'rounded' | 'circle';

export default function GeneradorIconosPage() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<IconPreset>(ICON_PRESETS[0]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [quality, setQuality] = useState(90);
  const [previewShape, setPreviewShape] = useState<PreviewShape>('square');
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manifestCode, setManifestCode] = useState<string>('');
  const [icoUrl, setIcoUrl] = useState<string>('');
  const [icoSizeKB, setIcoSizeKB] = useState<string>('');
  const [canGenerateIco, setCanGenerateIco] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setPreviewUrl(e.target?.result as string);
        setImageInfo(`${img.width} × ${img.height} píxeles`);
        setGeneratedIcons([]);
        setManifestCode('');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const generateIcons = useCallback(async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    setGeneratedIcons([]);
    setIcoUrl('');
    setIcoSizeKB('');

    const icons: GeneratedIcon[] = [];
    const qualityValue = quality / 100;

    for (const size of selectedPreset.sizes) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = size;
      canvas.height = size;

      // Dibujar imagen redimensionada
      ctx.drawImage(originalImage, 0, 0, size, size);

      // Generar blob
      const mimeType = outputFormat === 'png' ? 'image/png' :
                       outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';

      const blob = await new Promise<Blob>((resolve) => {
        if (outputFormat === 'png') {
          canvas.toBlob((b) => resolve(b!), mimeType);
        } else {
          canvas.toBlob((b) => resolve(b!), mimeType, qualityValue);
        }
      });

      // Siempre generar PNG data para ICO (si el tamaño es válido)
      let pngData: Uint8Array | undefined;
      if (size <= 256) {
        const pngBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        pngData = new Uint8Array(await pngBlob.arrayBuffer());
      }

      const url = URL.createObjectURL(blob);
      const fileName = `icon-${size}x${size}.${outputFormat}`;
      const sizeKB = (blob.size / 1024).toFixed(1);

      icons.push({ size, blob, url, fileName, sizeKB, pngData });
    }

    setGeneratedIcons(icons);
    generateManifestCode(icons);

    // Verificar si se puede generar ICO (al menos un tamaño ≤256px)
    const hasValidIcoSizes = icons.some(icon => icon.size <= 256 && icon.pngData);
    setCanGenerateIco(hasValidIcoSizes);

    // Auto-generar ICO si hay tamaños válidos
    if (hasValidIcoSizes) {
      try {
        const icoBlob = await generateIcoFile(icons);
        const url = URL.createObjectURL(icoBlob);
        setIcoUrl(url);
        setIcoSizeKB((icoBlob.size / 1024).toFixed(1));
      } catch {
        setCanGenerateIco(false);
      }
    }

    setIsGenerating(false);
  }, [originalImage, selectedPreset, outputFormat, quality]);

  const generateManifestCode = (icons: GeneratedIcon[]) => {
    const iconsArray = icons.map(icon => ({
      src: `/icons/${icon.fileName}`,
      sizes: `${icon.size}x${icon.size}`,
      type: `image/${outputFormat}`,
      purpose: 'any maskable'
    }));

    const code = JSON.stringify({ icons: iconsArray }, null, 2);
    setManifestCode(code);
  };

  const downloadIcon = (icon: GeneratedIcon) => {
    const link = document.createElement('a');
    link.href = icon.url;
    link.download = icon.fileName;
    link.click();
  };

  const downloadAllAsZip = async () => {
    if (generatedIcons.length === 0) return;

    // Usamos descarga secuencial ya que JSZip añadiría dependencia
    for (const icon of generatedIcons) {
      await new Promise(resolve => setTimeout(resolve, 100));
      downloadIcon(icon);
    }
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(manifestCode);
  };

  const downloadIco = () => {
    if (!icoUrl) return;
    const link = document.createElement('a');
    link.href = icoUrl;
    link.download = 'favicon.ico';
    link.click();
  };

  const clearImage = () => {
    setOriginalImage(null);
    setPreviewUrl('');
    setImageInfo('');
    setGeneratedIcons([]);
    setManifestCode('');
    setIcoUrl('');
    setIcoSizeKB('');
    setCanGenerateIco(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📱 Generador de Iconos PWA</h1>
        <p className={styles.subtitle}>
          Genera todos los tamaños de iconos para tu PWA, favicon y aplicaciones móviles
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de subida */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Sube tu imagen</h2>

          {!originalImage ? (
            <div
              className={styles.dropZone}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={styles.dropIcon}>🖼️</span>
              <p>Arrastra tu imagen aquí o haz clic para seleccionar</p>
              <span className={styles.dropHint}>Recomendado: 512×512px o superior, formato PNG</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className={styles.fileInput}
              />
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <div className={styles.previewWrapper}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={`${styles.preview} ${styles[previewShape]}`}
                />
              </div>
              <p className={styles.imageInfo}>{imageInfo}</p>

              <div className={styles.previewShapes}>
                <span className={styles.shapeLabel}>Vista previa:</span>
                <button
                  className={`${styles.shapeBtn} ${previewShape === 'square' ? styles.shapeActive : ''}`}
                  onClick={() => setPreviewShape('square')}
                  title="Cuadrado"
                >
                  ⬜
                </button>
                <button
                  className={`${styles.shapeBtn} ${previewShape === 'rounded' ? styles.shapeActive : ''}`}
                  onClick={() => setPreviewShape('rounded')}
                  title="Redondeado"
                >
                  🔲
                </button>
                <button
                  className={`${styles.shapeBtn} ${previewShape === 'circle' ? styles.shapeActive : ''}`}
                  onClick={() => setPreviewShape('circle')}
                  title="Círculo"
                >
                  ⚪
                </button>
              </div>

              <button onClick={clearImage} className={styles.btnSecondary}>
                Cambiar imagen
              </button>
            </div>
          )}
        </div>

        {/* Panel de configuración */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Configura opciones</h2>

          <div className={styles.section}>
            <h3>Preset de tamaños</h3>
            <div className={styles.presetGrid}>
              {ICON_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={`${styles.presetBtn} ${selectedPreset.name === preset.name ? styles.presetActive : ''}`}
                  onClick={() => setSelectedPreset(preset)}
                >
                  <span className={styles.presetIcon}>{preset.icon}</span>
                  <span className={styles.presetName}>{preset.name}</span>
                  <span className={styles.presetDesc}>{preset.sizes.length} tamaños</span>
                </button>
              ))}
            </div>
            <p className={styles.presetInfo}>
              {selectedPreset.description}: {selectedPreset.sizes.join(', ')}px
            </p>
          </div>

          <div className={styles.section}>
            <h3>Formato de salida</h3>
            <div className={styles.formatButtons}>
              {(['png', 'webp', 'jpeg'] as OutputFormat[]).map((format) => (
                <button
                  key={format}
                  className={`${styles.formatBtn} ${outputFormat === format ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat(format)}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {outputFormat !== 'png' && (
            <div className={styles.section}>
              <h3>Calidad: {quality}%</h3>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>Menor tamaño</span>
                <span>Mayor calidad</span>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              onClick={generateIcons}
              disabled={!originalImage || isGenerating}
              className={styles.btnPrimary}
            >
              {isGenerating ? '⏳ Generando...' : '🚀 Generar Iconos'}
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {generatedIcons.length > 0 && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2>Iconos Generados ({generatedIcons.length})</h2>
            <button onClick={downloadAllAsZip} className={styles.btnDownloadAll}>
              📦 Descargar Todos
            </button>
          </div>

          <div className={styles.iconsGrid}>
            {generatedIcons.map((icon) => (
              <div key={icon.size} className={styles.iconCard}>
                <img src={icon.url} alt={`${icon.size}x${icon.size}`} className={styles.iconPreview} />
                <div className={styles.iconInfo}>
                  <span className={styles.iconSize}>{icon.size}×{icon.size}</span>
                  <span className={styles.iconKB}>{icon.sizeKB} KB</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadIcon(icon)}
                  className={styles.btnDownload}
                >
                  📥 {icon.fileName}
                </button>
              </div>
            ))}
          </div>

          {/* Descargar archivo ICO multi-resolución */}
          {canGenerateIco && icoUrl && (
            <div className={styles.icoSection}>
              <div className={styles.icoHeader}>
                <div className={styles.icoInfo}>
                  <span className={styles.icoIcon}>🎯</span>
                  <div>
                    <h3>Archivo favicon.ico</h3>
                    <p>Multi-resolución ({generatedIcons.filter(i => i.size <= 256).map(i => i.size).join(', ')}px) • {icoSizeKB} KB</p>
                  </div>
                </div>
                <button type="button" onClick={downloadIco} className={styles.btnIcoDownload}>
                  📥 Descargar favicon.ico
                </button>
              </div>
              <p className={styles.icoHint}>
                El archivo .ico contiene múltiples resoluciones en un solo archivo, ideal para navegadores legacy.
              </p>
            </div>
          )}

          {/* Código manifest.json */}
          <div className={styles.manifestSection}>
            <div className={styles.manifestHeader}>
              <h3>📋 Código para manifest.json</h3>
              <button onClick={copyManifest} className={styles.btnCopy}>
                📋 Copiar
              </button>
            </div>
            <pre className={styles.manifestCode}>{manifestCode}</pre>
          </div>
        </div>
      )}

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>¿Para qué sirven estos iconos?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📱</span>
            <h4>PWA (Progressive Web App)</h4>
            <p>Los iconos 192px y 512px son obligatorios para manifest.json y permiten instalar tu web como app</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🌐</span>
            <h4>Favicon</h4>
            <p>Iconos de 16px, 32px y 48px se muestran en pestañas del navegador y marcadores</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🍎</span>
            <h4>Apple Touch Icon</h4>
            <p>El tamaño 180px es necesario para iOS cuando añades la web a la pantalla de inicio</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('generador-iconos')} />

      <Footer appName="generador-iconos" />
    </div>
  );
}
