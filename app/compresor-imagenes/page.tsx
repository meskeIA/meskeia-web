'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './CompresorImagenes.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';

// Tipo para formato de salida
type OutputFormat = 'original' | 'webp' | 'jpeg';

// Tipo para preset de calidad
type QualityPreset = 'max' | 'balanced' | 'high';

// Interface para imagen procesada
interface ProcessedImage {
  id: string;
  file: File;
  originalSize: number;
  compressedSize: number | null;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

// Función para generar ID único
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Función para formatear tamaño de archivo
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function CompresorImagenesPage() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Presets de calidad
  const applyPreset = (preset: QualityPreset) => {
    switch (preset) {
      case 'max':
        setQuality(60);
        break;
      case 'balanced':
        setQuality(80);
        break;
      case 'high':
        setQuality(90);
        break;
    }
  };

  // Manejar selección de archivos
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ProcessedImage[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push({
          id: generateId(),
          file,
          originalSize: file.size,
          compressedSize: null,
          compressedBlob: null,
          compressedUrl: null,
          status: 'pending',
        });
      }
    });

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // Evento de input file
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Comprimir una imagen
  const compressImage = async (image: ProcessedImage): Promise<ProcessedImage> => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ ...image, status: 'error', error: 'Error de contexto canvas' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Determinar formato de salida
        let mimeType: string;
        if (outputFormat === 'original') {
          // Mantener formato original, pero usar jpeg para gif (no soporta compresión)
          if (image.file.type === 'image/gif') {
            mimeType = 'image/jpeg';
          } else if (image.file.type === 'image/png') {
            mimeType = 'image/png';
          } else if (image.file.type === 'image/webp') {
            mimeType = 'image/webp';
          } else {
            mimeType = 'image/jpeg';
          }
        } else if (outputFormat === 'webp') {
          mimeType = 'image/webp';
        } else {
          mimeType = 'image/jpeg';
        }

        // Fondo blanco para JPEG (no soporta transparencia)
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        // Calidad solo aplica a JPEG y WebP
        const qualityValue = mimeType === 'image/png' ? undefined : quality / 100;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                ...image,
                compressedSize: blob.size,
                compressedBlob: blob,
                compressedUrl: url,
                status: 'done',
              });
            } else {
              resolve({ ...image, status: 'error', error: 'Error al comprimir' });
            }
          },
          mimeType,
          qualityValue
        );
      };

      img.onerror = () => {
        resolve({ ...image, status: 'error', error: 'Error al cargar imagen' });
      };

      img.src = URL.createObjectURL(image.file);
    });
  };

  // Comprimir todas las imágenes
  const compressAll = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    // Marcar todas como procesando
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        status: img.status === 'done' ? 'done' : 'processing',
        compressedSize: img.status === 'done' ? img.compressedSize : null,
        compressedBlob: img.status === 'done' ? img.compressedBlob : null,
        compressedUrl: img.status === 'done' ? img.compressedUrl : null,
      }))
    );

    // Procesar imágenes pendientes
    const pendingImages = images.filter((img) => img.status !== 'done');

    for (const image of pendingImages) {
      const compressed = await compressImage(image);
      setImages((prev) =>
        prev.map((img) => (img.id === compressed.id ? compressed : img))
      );
    }

    setIsProcessing(false);
  };

  // Descargar una imagen individual
  const downloadSingle = (image: ProcessedImage) => {
    if (!image.compressedUrl || !image.compressedBlob) return;

    const extension = outputFormat === 'original'
      ? image.file.name.split('.').pop()
      : outputFormat === 'webp' ? 'webp' : 'jpg';

    const baseName = image.file.name.replace(/\.[^.]+$/, '');
    const fileName = `${baseName}_compressed.${extension}`;

    const link = document.createElement('a');
    link.href = image.compressedUrl;
    link.download = fileName;
    link.click();
  };

  // Descargar todas como ZIP
  const downloadAllAsZip = async () => {
    const completedImages = images.filter((img) => img.status === 'done' && img.compressedBlob);
    if (completedImages.length === 0) return;

    // Importar JSZip dinámicamente
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    completedImages.forEach((image) => {
      if (image.compressedBlob) {
        const extension = outputFormat === 'original'
          ? image.file.name.split('.').pop()
          : outputFormat === 'webp' ? 'webp' : 'jpg';

        const baseName = image.file.name.replace(/\.[^.]+$/, '');
        const fileName = `${baseName}_compressed.${extension}`;

        zip.file(fileName, image.compressedBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'imagenes_comprimidas.zip';
    link.click();

    URL.revokeObjectURL(url);
  };

  // Eliminar una imagen
  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image?.compressedUrl) {
        URL.revokeObjectURL(image.compressedUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Limpiar todo
  const clearAll = () => {
    images.forEach((img) => {
      if (img.compressedUrl) {
        URL.revokeObjectURL(img.compressedUrl);
      }
    });
    setImages([]);
  };

  // Calcular estadísticas
  const stats = {
    total: images.length,
    completed: images.filter((img) => img.status === 'done').length,
    originalSize: images.reduce((acc, img) => acc + img.originalSize, 0),
    compressedSize: images.reduce((acc, img) => acc + (img.compressedSize || 0), 0),
  };

  const savedSize = stats.originalSize - stats.compressedSize;
  const savedPercentage = stats.originalSize > 0
    ? ((savedSize / stats.originalSize) * 100).toFixed(1)
    : '0';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🗜️</span>
        <h1 className={styles.title}>Compresor de Imágenes por Lotes</h1>
        <p className={styles.subtitle}>
          Comprime múltiples imágenes sin límites ni marcas de agua
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Zona de carga */}
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className={styles.dropIcon}>📁</span>
          <p className={styles.dropText}>Arrastra imágenes aquí o haz clic para seleccionar</p>
          <span className={styles.dropHint}>JPG, PNG, WebP, GIF • Sin límite de cantidad</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className={styles.fileInput}
          />
        </div>

        {/* Controles */}
        <div className={styles.controls}>
          <div className={styles.controlSection}>
            <h3 className={styles.controlTitle}>Calidad: {quality}%</h3>
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

          <div className={styles.controlSection}>
            <h3 className={styles.controlTitle}>Presets</h3>
            <div className={styles.presetButtons}>
              <button
                className={`${styles.presetBtn} ${quality === 60 ? styles.presetActive : ''}`}
                onClick={() => applyPreset('max')}
              >
                🚀 Máxima compresión
              </button>
              <button
                className={`${styles.presetBtn} ${quality === 80 ? styles.presetActive : ''}`}
                onClick={() => applyPreset('balanced')}
              >
                ⚖️ Equilibrado
              </button>
              <button
                className={`${styles.presetBtn} ${quality === 90 ? styles.presetActive : ''}`}
                onClick={() => applyPreset('high')}
              >
                💎 Alta calidad
              </button>
            </div>
          </div>

          <div className={styles.controlSection}>
            <h3 className={styles.controlTitle}>Formato de salida</h3>
            <div className={styles.formatButtons}>
              <button
                className={`${styles.formatBtn} ${outputFormat === 'original' ? styles.formatActive : ''}`}
                onClick={() => setOutputFormat('original')}
              >
                Original
              </button>
              <button
                className={`${styles.formatBtn} ${outputFormat === 'webp' ? styles.formatActive : ''}`}
                onClick={() => setOutputFormat('webp')}
              >
                WebP
              </button>
              <button
                className={`${styles.formatBtn} ${outputFormat === 'jpeg' ? styles.formatActive : ''}`}
                onClick={() => setOutputFormat('jpeg')}
              >
                JPG
              </button>
            </div>
          </div>
        </div>

        {/* Lista de imágenes */}
        {images.length > 0 && (
          <div className={styles.imageList}>
            <div className={styles.listHeader}>
              <h3>Imágenes ({stats.total})</h3>
              <button onClick={clearAll} className={styles.clearBtn}>
                Limpiar todo
              </button>
            </div>

            <div className={styles.listTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colName}>Archivo</span>
                <span className={styles.colSize}>Original</span>
                <span className={styles.colSize}>Comprimido</span>
                <span className={styles.colReduction}>Reducción</span>
                <span className={styles.colActions}>Acciones</span>
              </div>

              {images.map((image) => (
                <div key={image.id} className={styles.tableRow}>
                  <span className={styles.colName} title={image.file.name}>
                    {image.file.name.length > 25
                      ? image.file.name.substring(0, 22) + '...'
                      : image.file.name}
                  </span>
                  <span className={styles.colSize}>{formatSize(image.originalSize)}</span>
                  <span className={styles.colSize}>
                    {image.status === 'processing' && '⏳'}
                    {image.status === 'done' && image.compressedSize && formatSize(image.compressedSize)}
                    {image.status === 'error' && '❌'}
                    {image.status === 'pending' && '-'}
                  </span>
                  <span className={`${styles.colReduction} ${image.status === 'done' ? styles.reductionSuccess : ''}`}>
                    {image.status === 'done' && image.compressedSize && (
                      <>-{formatNumber(((image.originalSize - image.compressedSize) / image.originalSize) * 100, 1)}%</>
                    )}
                  </span>
                  <span className={styles.colActions}>
                    {image.status === 'done' && (
                      <button
                        className={styles.downloadBtn}
                        onClick={() => downloadSingle(image)}
                        title="Descargar"
                      >
                        ⬇️
                      </button>
                    )}
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeImage(image.id)}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {/* Estadísticas */}
            {stats.completed > 0 && (
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total original</span>
                  <span className={styles.statValue}>{formatSize(stats.originalSize)}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total comprimido</span>
                  <span className={styles.statValue}>{formatSize(stats.compressedSize)}</span>
                </div>
                <div className={`${styles.statItem} ${styles.statHighlight}`}>
                  <span className={styles.statLabel}>Ahorro total</span>
                  <span className={styles.statValue}>
                    {formatSize(savedSize)} (-{savedPercentage}%)
                  </span>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className={styles.actions}>
              <button
                onClick={compressAll}
                className={styles.btnPrimary}
                disabled={isProcessing || images.length === 0}
              >
                {isProcessing ? 'Comprimiendo...' : `Comprimir ${images.filter(i => i.status !== 'done').length > 0 ? `(${images.filter(i => i.status !== 'done').length})` : 'todo'}`}
              </button>
              {stats.completed > 0 && (
                <button onClick={downloadAllAsZip} className={styles.btnSecondary}>
                  📥 Descargar todo (ZIP)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Características */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>♾️</span>
            <h4>Sin límites</h4>
            <p>Comprime tantas imágenes como quieras, sin restricciones de cantidad ni tamaño</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔒</span>
            <h4>100% Privado</h4>
            <p>Tus imágenes se procesan en tu navegador, nunca se suben a ningún servidor</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚡</span>
            <h4>Rápido</h4>
            <p>Procesamiento instantáneo usando la potencia de tu dispositivo</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🚫</span>
            <h4>Sin marca de agua</h4>
            <p>Descarga tus imágenes limpias, sin logos ni marcas añadidas</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre compresión de imágenes?"
        subtitle="Descubre cómo optimizar tus fotos y los mejores formatos para cada uso"
      >
        <section className={styles.guideSection}>
          <h2>¿Por qué comprimir imágenes?</h2>
          <p className={styles.introParagraph}>
            La compresión de imágenes reduce el tamaño de archivo sin perder calidad visible.
            Esto es esencial para webs más rápidas, emails que no reboten y almacenamiento optimizado.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🌐 Para páginas web</h4>
              <p>
                Imágenes pesadas ralentizan tu web. Google penaliza sitios lentos en SEO.
                Una imagen de 5 MB puede reducirse a 500 KB sin pérdida visible.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📧 Para email</h4>
              <p>
                Muchos servidores rechazan adjuntos grandes. Comprimir fotos evita
                que tus emails reboten y mejora la velocidad de envío.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💾 Para almacenamiento</h4>
              <p>
                Ahorra espacio en tu disco, nube o dispositivo móvil.
                Una carpeta de 1 GB de fotos puede reducirse a 200 MB.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📱 Para redes sociales</h4>
              <p>
                Subidas más rápidas y menor consumo de datos móviles.
                Las plataformas recomprimen tus fotos, mejor hazlo tú primero con control.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Formatos de imagen: ¿Cuál elegir?</h2>

          <div className={styles.formatComparison}>
            <div className={styles.formatCard}>
              <h4>📷 JPEG/JPG</h4>
              <ul>
                <li>✅ Mejor para fotografías</li>
                <li>✅ Gran compresión</li>
                <li>❌ No soporta transparencia</li>
                <li>❌ Pierde calidad cada vez que se guarda</li>
              </ul>
              <p className={styles.formatUse}>Ideal para: fotos, imágenes con muchos colores</p>
            </div>
            <div className={styles.formatCard}>
              <h4>🎨 PNG</h4>
              <ul>
                <li>✅ Soporta transparencia</li>
                <li>✅ Sin pérdida de calidad</li>
                <li>❌ Archivos más grandes</li>
                <li>❌ No ideal para fotografías</li>
              </ul>
              <p className={styles.formatUse}>Ideal para: logos, iconos, gráficos con texto</p>
            </div>
            <div className={styles.formatCard}>
              <h4>🌐 WebP</h4>
              <ul>
                <li>✅ Mejor compresión que JPG y PNG</li>
                <li>✅ Soporta transparencia</li>
                <li>✅ Ideal para web moderna</li>
                <li>⚠️ No compatible con software antiguo</li>
              </ul>
              <p className={styles.formatUse}>Ideal para: webs, apps modernas</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Se pierde calidad al comprimir?</h4>
              <p>
                Depende del nivel de compresión. Con calidad al 80% la pérdida es imperceptible
                para el ojo humano. Por debajo del 60% puede notarse en fotos detalladas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Mis imágenes son seguras?</h4>
              <p>
                Sí, 100%. Todo el procesamiento ocurre en tu navegador. Tus imágenes nunca
                salen de tu dispositivo ni se envían a ningún servidor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Hay límite de imágenes o tamaño?</h4>
              <p>
                No hay límites artificiales. Puedes comprimir tantas imágenes como tu navegador
                pueda manejar. Para lotes muy grandes (+100 imágenes), recomendamos procesarlas
                en grupos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué calidad debo usar?</h4>
              <p>
                Para web: 70-80%. Para redes sociales: 80-85%. Para impresión o archivo: 90-95%.
                Usa el preset &quot;Equilibrado&quot; (80%) si no estás seguro.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="compresor-imagenes" />
    </div>
  );
}
