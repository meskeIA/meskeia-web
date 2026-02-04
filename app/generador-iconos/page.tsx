'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './GeneradorIconos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection } from '@/components';
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
  const [htmlCode, setHtmlCode] = useState<string>('');
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
    generateHtmlCode(icons);

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

  const generateHtmlCode = (icons: GeneratedIcon[]) => {
    const favicon16 = icons.find(i => i.size === 16);
    const favicon32 = icons.find(i => i.size === 32);
    const appleTouch180 = icons.find(i => i.size === 180);
    const icon192 = icons.find(i => i.size === 192);
    const icon512 = icons.find(i => i.size === 512);

    let html = '<!-- Favicon para navegadores -->\n';

    if (favicon16) {
      html += `<link rel="icon" type="image/${outputFormat}" sizes="16x16" href="/icons/${favicon16.fileName}">\n`;
    }
    if (favicon32) {
      html += `<link rel="icon" type="image/${outputFormat}" sizes="32x32" href="/icons/${favicon32.fileName}">\n`;
    }

    html += '\n<!-- Apple Touch Icon (iOS) -->\n';
    if (appleTouch180) {
      html += `<link rel="apple-touch-icon" href="/icons/${appleTouch180.fileName}">\n`;
    }

    html += '\n<!-- PWA Icons (Android/Chrome) -->\n';
    if (icon192) {
      html += `<link rel="icon" type="image/${outputFormat}" sizes="192x192" href="/icons/${icon192.fileName}">\n`;
    }
    if (icon512) {
      html += `<link rel="icon" type="image/${outputFormat}" sizes="512x512" href="/icons/${icon512.fileName}">\n`;
    }

    html += '\n<!-- Manifest.json -->\n';
    html += '<link rel="manifest" href="/manifest.json">\n';

    html += '\n<!-- Theme Color (opcional, personaliza con tu color) -->\n';
    html += '<meta name="theme-color" content="#2E86AB">';

    setHtmlCode(html);
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

      <LegalNotice />

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

          {/* Preview en navbar simulada */}
          {generatedIcons.find(i => i.size === 32) && (
            <div className={styles.faviconPreviewSection}>
              <h3>👀 Vista previa en navegador</h3>
              <div className={styles.browserMockup}>
                <div className={styles.browserHeader}>
                  <div className={styles.browserButtons}>
                    <span className={styles.browserBtn}></span>
                    <span className={styles.browserBtn}></span>
                    <span className={styles.browserBtn}></span>
                  </div>
                  <div className={styles.browserTab}>
                    <img
                      src={generatedIcons.find(i => i.size === 32)?.url}
                      alt="Favicon"
                      className={styles.faviconInTab}
                    />
                    <span>Mi Sitio Web</span>
                  </div>
                </div>
                <div className={styles.browserContent}>
                  <p className={styles.browserUrl}>🔒 https://misitio.com</p>
                </div>
              </div>
            </div>
          )}

          {/* Código HTML */}
          <div className={styles.manifestSection}>
            <div className={styles.manifestHeader}>
              <h3>🌐 Código HTML para tu &lt;head&gt;</h3>
              <button onClick={() => navigator.clipboard.writeText(htmlCode)} className={styles.btnCopy}>
                📋 Copiar
              </button>
            </div>
            <pre className={styles.manifestCode}>{htmlCode}</pre>
          </div>

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

      {/* Tabla de compatibilidad */}
      <div className={styles.compatibilitySection}>
        <h3>🌍 Compatibilidad de navegadores y plataformas</h3>
        <div className={styles.compatibilityTable}>
          <div className={styles.compatRow}>
            <div className={styles.compatPlatform}>
              <span className={styles.compatIcon}>🌐</span>
              <div>
                <strong>Chrome / Edge / Firefox</strong>
                <p>Favicon 16px, 32px, 48px</p>
              </div>
            </div>
            <div className={styles.compatStatus}>✅ Totalmente compatible</div>
          </div>
          <div className={styles.compatRow}>
            <div className={styles.compatPlatform}>
              <span className={styles.compatIcon}>🍎</span>
              <div>
                <strong>Safari / iOS</strong>
                <p>Apple Touch Icon 180px</p>
              </div>
            </div>
            <div className={styles.compatStatus}>✅ Totalmente compatible</div>
          </div>
          <div className={styles.compatRow}>
            <div className={styles.compatPlatform}>
              <span className={styles.compatIcon}>🤖</span>
              <div>
                <strong>Android Chrome</strong>
                <p>PWA Icons 192px, 512px</p>
              </div>
            </div>
            <div className={styles.compatStatus}>✅ Totalmente compatible</div>
          </div>
          <div className={styles.compatRow}>
            <div className={styles.compatPlatform}>
              <span className={styles.compatIcon}>🪟</span>
              <div>
                <strong>Windows 10/11</strong>
                <p>Tiles 70px, 150px, 310px</p>
              </div>
            </div>
            <div className={styles.compatStatus}>✅ Totalmente compatible</div>
          </div>
        </div>
        <p className={styles.compatNote}>
          💡 <strong>Recomendación:</strong> Usa el preset "PWA Completo" para máxima compatibilidad en todas las plataformas.
        </p>
      </div>

      {/* FAQ y guía */}
      <EducationalSection
        title="📚 ¿Tienes dudas sobre iconos PWA y favicons?"
        subtitle="Respuestas a las preguntas más frecuentes y guía completa de implementación"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>

          <div className={styles.faqItem}>
            <h4>❓ ¿Qué tamaños son realmente obligatorios?</h4>
            <p>
              <strong>Mínimo indispensable:</strong> 16px, 32px (favicon navegador), 180px (Apple iOS), 192px y 512px (PWA Android).
              Con estos 5 tamaños cubrirás el 90% de casos.
            </p>
            <p>
              <strong>Recomendado completo:</strong> Usa el preset "PWA Completo" con 12 tamaños para cubrir todos los navegadores,
              dispositivos y versiones antiguas.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>❓ ¿Qué formato debo usar: PNG, WebP o JPEG?</h4>
            <p>
              <strong>PNG</strong> (recomendado): Soporta transparencia, calidad perfecta, compatible con todos los navegadores.
              Es el estándar para iconos.
            </p>
            <p>
              <strong>WebP</strong>: Archivos más pequeños (30-50% menos peso), pero no todos los navegadores antiguos lo soportan.
              Úsalo solo si tu audiencia usa navegadores modernos.
            </p>
            <p>
              <strong>JPEG</strong>: No soporta transparencia, evítalo para iconos (el fondo siempre será blanco o de color).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>❓ ¿Dónde subo los iconos en mi sitio web?</h4>
            <p>
              <strong>Opción 1 (raíz):</strong> Sube todos los iconos a la carpeta raíz de tu sitio (ejemplo: <code>https://misitio.com/icon-192x192.png</code>).
              En el código HTML usa rutas absolutas: <code>/icon-192x192.png</code>
            </p>
            <p>
              <strong>Opción 2 (carpeta /icons/):</strong> Crea una carpeta <code>/icons/</code> y sube todos los archivos ahí.
              En el código HTML usa: <code>/icons/icon-192x192.png</code>
            </p>
            <p>
              <strong>⚠️ Importante:</strong> El archivo <code>manifest.json</code> debe estar en la raíz (<code>/manifest.json</code>).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>❓ ¿Qué es el archivo favicon.ico y lo necesito?</h4>
            <p>
              El archivo <code>.ico</code> es un formato antiguo que soportan todos los navegadores (incluso Internet Explorer).
              Contiene múltiples resoluciones (16px, 32px, 48px) en un solo archivo.
            </p>
            <p>
              <strong>¿Lo necesitas?</strong> Ya no es obligatorio si usas PNG modernos con las etiquetas <code>&lt;link rel="icon"&gt;</code>,
              pero es buena práctica incluirlo para compatibilidad con navegadores muy antiguos.
            </p>
            <p>
              Simplemente descarga el <code>favicon.ico</code> generado y súbelo a la raíz de tu sitio.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>❓ ¿Cómo pruebo que los iconos funcionan correctamente?</h4>
            <p><strong>Método 1 - Navegador:</strong></p>
            <ul>
              <li>Abre tu sitio en Chrome/Firefox/Safari</li>
              <li>Mira la pestaña del navegador → Debe aparecer tu favicon (16px o 32px)</li>
              <li>Añade la página a marcadores → Verifica que aparece el icono</li>
            </ul>
            <p><strong>Método 2 - PWA en móvil:</strong></p>
            <ul>
              <li>Abre tu sitio en Chrome Android o Safari iOS</li>
              <li>Menú → "Añadir a pantalla de inicio"</li>
              <li>Verifica que el icono 192px (Android) o 180px (iOS) aparece correctamente</li>
            </ul>
            <p><strong>Método 3 - Herramienta online:</strong></p>
            <ul>
              <li>Usa <a href="https://realfavicongenerator.net/favicon_checker" target="_blank" rel="noopener">Favicon Checker</a></li>
              <li>Introduce tu URL y verifica todos los iconos</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4>❓ ¿Puedo usar un logo con texto o debe ser solo un icono?</h4>
            <p>
              <strong>Para tamaños pequeños (16-48px):</strong> Usa solo un icono/símbolo simple sin texto.
              El texto es ilegible a esos tamaños y se verá borroso.
            </p>
            <p>
              <strong>Para tamaños grandes (180-512px):</strong> Puedes usar logo con texto, ya que hay suficiente espacio.
              Pero asegúrate de que el texto sea legible incluso a 180px.
            </p>
            <p>
              <strong>Consejo:</strong> Si tu logo tiene texto, crea dos versiones: una solo con el símbolo (para tamaños pequeños)
              y otra con logo completo (para tamaños grandes). Luego genera los iconos de cada versión por separado.
            </p>
          </div>

          <h2>Guía de Implementación Paso a Paso</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Prepara tu imagen original</h4>
                <p>Usa una imagen cuadrada (512×512px o superior) en formato PNG con fondo transparente. Si tu logo no es cuadrado, añade espacio transparente alrededor para hacerlo cuadrado.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Genera los iconos</h4>
                <p>Sube tu imagen, selecciona el preset "PWA Completo", elige formato PNG y haz clic en "Generar Iconos". Descarga todos los archivos (botón "Descargar Todos").</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Sube los archivos a tu servidor</h4>
                <p>Crea una carpeta <code>/icons/</code> en la raíz de tu sitio web y sube todos los archivos .png generados. Sube también el <code>favicon.ico</code> a la raíz.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Añade el código HTML</h4>
                <p>Copia el código HTML generado y pégalo en el <code>&lt;head&gt;</code> de tu archivo HTML principal. Asegúrate de que las rutas coincidan con dónde subiste los archivos.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Crea el manifest.json</h4>
                <p>Crea un archivo <code>manifest.json</code> en la raíz de tu sitio, copia el código JSON generado y personaliza los campos <code>name</code>, <code>short_name</code>, <code>theme_color</code> con tu información.</p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Prueba y verifica</h4>
                <p>Abre tu sitio en diferentes navegadores, verifica el favicon, y prueba instalar como PWA en móvil. Limpia la caché del navegador si no ves cambios inmediatos.</p>
              </div>
            </div>
          </div>

          <h2>Recursos Adicionales</h2>
          <div className={styles.resourcesList}>
            <p>📖 <a href="https://web.dev/add-manifest/" target="_blank" rel="noopener">Web.dev - Guía completa de manifest.json</a></p>
            <p>🔍 <a href="https://realfavicongenerator.net/favicon_checker" target="_blank" rel="noopener">Favicon Checker - Verifica tus iconos</a></p>
            <p>🍎 <a href="https://developer.apple.com/design/human-interface-guidelines/app-icons" target="_blank" rel="noopener">Apple - Guía de iconos iOS</a></p>
            <p>🤖 <a href="https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide" target="_blank" rel="noopener">Google - PWA en Android</a></p>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-iconos')} />

      <Footer appName="generador-iconos" />
    </div>
  );
}
