'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './ConversorImagenes.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type OutputFormat = 'jpeg' | 'png' | 'webp';

interface ImageInfo {
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
}

interface Preset {
  name: string;
  width: number;
  height: number;
  icon: string;
}

const PRESETS: Preset[] = [
  { name: 'Instagram Post', width: 1080, height: 1080, icon: '📸' },
  { name: 'Instagram Story', width: 1080, height: 1920, icon: '📱' },
  { name: 'Facebook Post', width: 1200, height: 630, icon: '👍' },
  { name: 'Twitter/X', width: 1200, height: 675, icon: '🐦' },
  { name: 'LinkedIn', width: 1200, height: 627, icon: '💼' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, icon: '▶️' },
  { name: 'WhatsApp', width: 800, height: 800, icon: '💬' },
  { name: 'HD 1080p', width: 1920, height: 1080, icon: '🖥️' },
];

export default function ConversorImagenesPage() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(85);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aspectRatio = useRef<number>(1);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setOriginalFile(file);
    setConvertedUrl(null);
    setConvertedSize(null);

    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      setImageInfo({
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
        type: file.type,
      });
      setWidth(img.width);
      setHeight(img.height);
      aspectRatio.current = img.width / img.height;
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const handleWidthChange = useCallback((newWidth: number | '') => {
    setWidth(newWidth);
    if (maintainAspect && newWidth !== '' && aspectRatio.current) {
      setHeight(Math.round(newWidth / aspectRatio.current));
    }
  }, [maintainAspect]);

  const handleHeightChange = useCallback((newHeight: number | '') => {
    setHeight(newHeight);
    if (maintainAspect && newHeight !== '' && aspectRatio.current) {
      setWidth(Math.round(newHeight * aspectRatio.current));
    }
  }, [maintainAspect]);

  const applyPreset = useCallback((preset: Preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setMaintainAspect(false);
  }, []);

  const convertImage = useCallback(async () => {
    if (!originalImage) return;

    setIsConverting(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetWidth = width || originalImage.width;
    const targetHeight = height || originalImage.height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Fondo blanco para JPEG (no soporta transparencia)
    if (outputFormat === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

    const mimeType = `image/${outputFormat}`;
    const qualityValue = outputFormat === 'png' ? undefined : quality / 100;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setConvertedUrl(url);
          setConvertedSize(blob.size);
        }
        setIsConverting(false);
      },
      mimeType,
      qualityValue
    );
  }, [originalImage, width, height, outputFormat, quality]);

  const downloadImage = useCallback(() => {
    if (!convertedUrl || !originalFile) return;

    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const baseName = originalFile.name.replace(/\.[^.]+$/, '');
    const fileName = `${baseName}_converted.${extension}`;

    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = fileName;
    link.click();
  }, [convertedUrl, originalFile, outputFormat]);

  const handleClear = useCallback(() => {
    setOriginalImage(null);
    setOriginalFile(null);
    setImageInfo(null);
    setConvertedUrl(null);
    setConvertedSize(null);
    setWidth('');
    setHeight('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const reduction = convertedSize && imageInfo
    ? ((1 - convertedSize / imageInfo.size) * 100).toFixed(1)
    : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Imágenes</h1>
        <p className={styles.subtitle}>Convierte, redimensiona y comprime imágenes</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="conversor-imagenes-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Imagen Original</h2>

          <div
            className={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            {originalImage ? (
              <img src={originalImage.src} alt="Original" className={styles.preview} />
            ) : (
              <>
                <span className={styles.dropIcon}>🖼️</span>
                <p>Haz clic o arrastra una imagen</p>
                <span className={styles.dropHint}>JPG, PNG, WebP, GIF</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
          </div>

          {imageInfo && (
            <div className={styles.imageInfo}>
              <span>{imageInfo.name}</span>
              <span>{imageInfo.width} x {imageInfo.height} px</span>
              <span>{formatSize(imageInfo.size)}</span>
            </div>
          )}

          {originalImage && (
            <>
              <div className={styles.section}>
                <h3>Formato de salida</h3>
                <div className={styles.formatButtons}>
                  {(['jpeg', 'png', 'webp'] as OutputFormat[]).map(format => (
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
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>Menor tamaño</span>
                    <span>Mayor calidad</span>
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <h3>Dimensiones</h3>
                <div className={styles.dimensionInputs}>
                  <div className={styles.inputGroup}>
                    <label>Ancho</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(e.target.value ? parseInt(e.target.value) : '')}
                      className={styles.input}
                      placeholder="px"
                    />
                  </div>
                  <span className={styles.dimensionX}>×</span>
                  <div className={styles.inputGroup}>
                    <label>Alto</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value ? parseInt(e.target.value) : '')}
                      className={styles.input}
                      placeholder="px"
                    />
                  </div>
                </div>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                  />
                  Mantener proporción
                </label>
              </div>

              <div className={styles.section}>
                <h3>Presets de redes sociales</h3>
                <div className={styles.presetGrid}>
                  {PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      className={styles.presetBtn}
                      onClick={() => applyPreset(preset)}
                    >
                      <span className={styles.presetIcon}>{preset.icon}</span>
                      <span className={styles.presetName}>{preset.name}</span>
                      <span className={styles.presetSize}>{preset.width}×{preset.height}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <button onClick={convertImage} className={styles.btnPrimary} disabled={isConverting}>
                  {isConverting ? 'Convirtiendo...' : 'Convertir imagen'}
                </button>
                <button onClick={handleClear} className={styles.btnSecondary}>
                  Limpiar
                </button>
              </div>
            </>
          )}
        </div>

        {/* Panel de resultado */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Imagen Convertida</h2>

          {convertedUrl ? (
            <>
              <div className={styles.resultPreview}>
                <img src={convertedUrl} alt="Convertida" className={styles.preview} />
              </div>

              <div className={styles.resultInfo}>
                <div className={styles.resultRow}>
                  <span>Formato:</span>
                  <span className={styles.resultValue}>{outputFormat.toUpperCase()}</span>
                </div>
                <div className={styles.resultRow}>
                  <span>Dimensiones:</span>
                  <span className={styles.resultValue}>{width} × {height} px</span>
                </div>
                <div className={styles.resultRow}>
                  <span>Tamaño:</span>
                  <span className={styles.resultValue}>{convertedSize && formatSize(convertedSize)}</span>
                </div>
                {reduction && parseFloat(reduction) > 0 && (
                  <div className={`${styles.resultRow} ${styles.resultHighlight}`}>
                    <span>Reducción:</span>
                    <span className={styles.resultValue}>-{reduction}%</span>
                  </div>
                )}
              </div>

              <button onClick={downloadImage} className={styles.btnPrimary}>
                Descargar imagen
              </button>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🖼️</span>
              <p>La imagen convertida aparecerá aquí</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className={styles.infoSection}>
        <h3>Formatos soportados</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📷</span>
            <h4>JPEG/JPG</h4>
            <p>Ideal para fotos. Compresión con pérdida, no soporta transparencia</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎨</span>
            <h4>PNG</h4>
            <p>Sin pérdida de calidad. Soporta transparencia. Mayor tamaño</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🌐</span>
            <h4>WebP</h4>
            <p>Formato moderno. Mejor compresión que JPG/PNG. Ideal para web</p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Guía de Formatos de Imagen"
        subtitle="Todo lo que necesitas saber para elegir el formato correcto"
        icon="🖼️"
      >
        {/* Tabla comparativa */}
        <div className={styles.eduTablaWrapper}>
          <table className={styles.eduTabla}>
            <thead>
              <tr>
                <th>Formato</th>
                <th>Compresión</th>
                <th>Transparencia</th>
                <th>Mejor uso</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>JPEG/JPG</strong></td>
                <td>Con pérdida (lossy)</td>
                <td>No</td>
                <td>Fotos, fondos complejos</td>
              </tr>
              <tr>
                <td><strong>PNG</strong></td>
                <td>Sin pérdida (lossless)</td>
                <td>Sí (alpha)</td>
                <td>Logos, capturas, gráficos</td>
              </tr>
              <tr>
                <td><strong>WebP</strong></td>
                <td>Con/sin pérdida</td>
                <td>Sí</td>
                <td>Web moderna (Chrome/Firefox)</td>
              </tr>
              <tr>
                <td><strong>GIF</strong></td>
                <td>Sin pérdida (256 colores)</td>
                <td>Sí (1 bit)</td>
                <td>Animaciones simples</td>
              </tr>
              <tr>
                <td><strong>SVG</strong></td>
                <td>Vectorial</td>
                <td>Sí</td>
                <td>Iconos, ilustraciones escalables</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h3>Casos de uso habituales</h3>
        <div className={styles.eduEscenariosGrid}>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>📱</span>
            <h4>Redes sociales</h4>
            <p>Usa JPEG a 80-85% para fotos. Para Instagram Stories o posts con texto, WebP reduce el tamaño sin pérdida visible.</p>
          </div>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>🌐</span>
            <h4>Web y e-commerce</h4>
            <p>WebP es el estándar actual: hasta 30% más pequeño que JPEG a igual calidad. Mejora Core Web Vitals (LCP).</p>
          </div>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>🎨</span>
            <h4>Diseño gráfico</h4>
            <p>PNG para exportar activos con transparencia. Mantén siempre el original en alta resolución antes de convertir.</p>
          </div>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>📧</span>
            <h4>Email marketing</h4>
            <p>JPEG sigue siendo el más seguro en emails (máxima compatibilidad). Evita WebP en clientes como Outlook.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes</h3>
        <dl className={styles.eduFaqList}>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Qué calidad JPEG debo usar?</dt>
            <dd className={styles.eduFaqRespuesta}>Entre 75-85% es el punto óptimo: reducción de tamaño notable sin degradación apreciable a simple vista. Solo baja del 60% si el tamaño de archivo es crítico.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Cuándo usar PNG en lugar de JPEG?</dt>
            <dd className={styles.eduFaqRespuesta}>Cuando la imagen tiene texto, bordes nítidos, transparencia o es un logo. JPEG genera artefactos de compresión en estos casos. Para fotos, JPEG casi siempre es mejor.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿WebP es compatible con todos los navegadores?</dt>
            <dd className={styles.eduFaqRespuesta}>Sí, desde 2021 todos los navegadores modernos lo soportan (Chrome, Firefox, Safari, Edge). Para sitios que deban soportar IE11 o Safari antiguo, usa JPEG/PNG como fallback.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Qué ocurre con la transparencia al convertir a JPEG?</dt>
            <dd className={styles.eduFaqRespuesta}>JPEG no soporta transparencia. Los píxeles transparentes se rellenan con blanco (fondo por defecto). Si necesitas conservar la transparencia, usa PNG o WebP.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Redimensionar reduce la calidad?</dt>
            <dd className={styles.eduFaqRespuesta}>Reducir resolución (downscale) apenas pierde calidad perceptible. Ampliar (upscale) genera pixelado porque se inventan píxeles. Nunca amplíes más de un 20-30%.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Cuál es la diferencia entre DPI y PPI?</dt>
            <dd className={styles.eduFaqRespuesta}>PPI (píxeles por pulgada) es para pantallas; DPI (puntos por pulgada) es para impresión. Para web, los DPI no importan — solo cuentan las dimensiones en píxeles. Para imprimir, necesitas al menos 300 DPI.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Qué tamaño es «demasiado grande» para una web?</dt>
            <dd className={styles.eduFaqRespuesta}>Google recomienda que cada imagen pese menos de 200 KB para mantener tiempos de carga óptimos. Una foto de producto en e-commerce debería ser de 50-150 KB en formato WebP o JPEG a 80%.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Qué dimensiones usar para miniaturas en YouTube?</dt>
            <dd className={styles.eduFaqRespuesta}>1280×720 píxeles (16:9) es el estándar oficial. El archivo no debe superar 2 MB. Usa JPEG a 90% para máxima calidad visible en pantallas 4K.</dd>
          </div>
        </dl>

        {/* Guía paso a paso */}
        <h3>Cómo elegir el formato correcto en 6 pasos</h3>
        <ol className={styles.eduPasosList}>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>1</span>
            <div><strong>¿Necesitas transparencia?</strong> Sí → PNG o WebP. No → continúa al paso 2.</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>2</span>
            <div><strong>¿Es una fotografía o ilustración con muchos colores?</strong> Sí → JPEG o WebP. No (logos, texto) → PNG.</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>3</span>
            <div><strong>¿Es para web moderna?</strong> Usa WebP siempre que puedas: mejor compresión que JPEG y PNG.</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>4</span>
            <div><strong>Define las dimensiones objetivo</strong> según el destino (ver presets de redes sociales).</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>5</span>
            <div><strong>Ajusta la calidad</strong>: empieza en 85% y baja hasta que el tamaño sea aceptable sin pérdida visible.</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>6</span>
            <div><strong>Compara tamaños</strong>: el indicador de reducción te muestra el ahorro. Un 40-70% es un buen resultado.</div>
          </li>
        </ol>

        {/* Tips */}
        <h3>6 buenas prácticas con imágenes</h3>
        <div className={styles.eduTipsGrid}>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>💾</span><p>Guarda siempre el original sin comprimir antes de convertir.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>📐</span><p>Redimensiona antes de comprimir para mejores resultados.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>🔄</span><p>Convierte lotes de imágenes del mismo tipo con los mismos ajustes.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>🌐</span><p>Para web, activa lazy loading en imágenes below-the-fold.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>📱</span><p>Genera versiones 1x y 2x para pantallas Retina/HiDPI.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>🔍</span><p>Usa Google PageSpeed para auditar el impacto de tus imágenes.</p></div>
        </div>

        {/* Warning */}
        <div className={styles.warningBox}>
          <span className={styles.warningIcono}>⚠️</span>
          <div>
            <strong>Conversión con pérdida</strong>
            <ul>
              <li>Cada conversión JPEG → JPEG acumula pérdida de calidad. Parte siempre del original.</li>
              <li>La reducción de tamaño no implica reducción de dimensiones (y viceversa).</li>
              <li>Ampliar una imagen de baja resolución no la mejora — solo la hace más grande y borrosa.</li>
              <li>El procesado ocurre 100% en tu navegador: ninguna imagen se sube a ningún servidor.</li>
            </ul>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-imagenes')} />

      <ShareCard appName="conversor-imagenes" />
      <Footer appName="conversor-imagenes" />
    </div>
  );
}
