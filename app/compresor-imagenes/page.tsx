'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef } from 'react';
import styles from './CompresorImagenes.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type OutputFormat = 'original' | 'webp' | 'jpeg' | 'png';
type QualityPreset = 'smart' | 'max' | 'balanced' | 'high';
type ResizeOption = 'none' | '2048' | '1920' | '1280' | '1024' | '800' | 'custom';

// Interface para imagen procesada
interface ProcessedImage {
  id: string;
  file: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  compressedSize: number | null;
  compressedWidth: number | null;
  compressedHeight: number | null;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  originalUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
  autoQuality?: number;
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

// Función para detectar tipo de imagen y sugerir calidad
const detectImageType = (file: File): 'photo' | 'graphic' | 'screenshot' => {
  const name = file.name.toLowerCase();

  // Screenshots suelen tener estos patrones
  if (name.includes('screenshot') || name.includes('captura') || name.includes('screen')) {
    return 'screenshot';
  }

  // Gráficos/logos suelen ser PNG pequeños
  if (file.type === 'image/png' && file.size < 500 * 1024) {
    return 'graphic';
  }

  // Por defecto, asumir fotografía
  return 'photo';
};

// Calidad sugerida según tipo
const getSuggestedQuality = (type: 'photo' | 'graphic' | 'screenshot'): number => {
  switch (type) {
    case 'photo': return 82;
    case 'graphic': return 92;
    case 'screenshot': return 75;
    default: return 80;
  }
};

export default function CompresorImagenesPage() {
  // Estados principales
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Estados de nuevas funcionalidades
  const [resizeOption, setResizeOption] = useState<ResizeOption>('none');
  const [customWidth, setCustomWidth] = useState('1600');
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('balanced');
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener ancho máximo según opción
  const getMaxWidth = (): number | null => {
    switch (resizeOption) {
      case 'none': return null;
      case 'custom': return parseInt(customWidth) || null;
      default: return parseInt(resizeOption);
    }
  };

  // Aplicar preset de calidad
  const applyPreset = (preset: QualityPreset) => {
    setQualityPreset(preset);
    switch (preset) {
      case 'smart':
        // No cambiar calidad, se calculará por imagen
        break;
      case 'max':
        setQuality(60);
        break;
      case 'balanced':
        setQuality(80);
        break;
      case 'high':
        setQuality(92);
        break;
    }
  };

  // Cargar dimensiones de una imagen
  const loadImageDimensions = (file: File): Promise<{ width: number; height: number; url: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ width: img.width, height: img.height, url });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0, url });
      };
      img.src = url;
    });
  };

  // Manejar selección de archivos
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newImages: ProcessedImage[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const { width, height, url } = await loadImageDimensions(file);
        const imageType = detectImageType(file);

        newImages.push({
          id: generateId(),
          file,
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          compressedSize: null,
          compressedWidth: null,
          compressedHeight: null,
          compressedBlob: null,
          compressedUrl: null,
          originalUrl: url,
          status: 'pending',
          autoQuality: getSuggestedQuality(imageType),
        });
      }
    }

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

        // Calcular dimensiones finales
        let finalWidth = img.width;
        let finalHeight = img.height;
        const maxWidth = getMaxWidth();

        if (maxWidth && img.width > maxWidth) {
          const ratio = maxWidth / img.width;
          finalWidth = maxWidth;
          finalHeight = Math.round(img.height * ratio);
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Determinar formato de salida
        let mimeType: string;
        if (outputFormat === 'original') {
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
        } else if (outputFormat === 'png') {
          mimeType = 'image/png';
        } else {
          mimeType = 'image/jpeg';
        }

        // Fondo blanco para JPEG (no soporta transparencia)
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Usar suavizado de alta calidad para redimensionado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

        // Determinar calidad a usar
        let qualityToUse = quality;
        if (qualityPreset === 'smart' && image.autoQuality) {
          qualityToUse = image.autoQuality;
        }

        // Calidad solo aplica a JPEG y WebP
        const qualityValue = mimeType === 'image/png' ? undefined : qualityToUse / 100;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                ...image,
                compressedSize: blob.size,
                compressedWidth: finalWidth,
                compressedHeight: finalHeight,
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

      img.src = image.originalUrl;
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
      : outputFormat;

    const baseName = image.file.name.replace(/\.[^.]+$/, '');
    const fileName = `${baseName}_compressed.${extension === 'jpeg' ? 'jpg' : extension}`;

    const link = document.createElement('a');
    link.href = image.compressedUrl;
    link.download = fileName;
    link.click();
  };

  // Descargar todas como ZIP
  const downloadAllAsZip = async () => {
    const completedImages = images.filter((img) => img.status === 'done' && img.compressedBlob);
    if (completedImages.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    completedImages.forEach((image) => {
      if (image.compressedBlob) {
        const extension = outputFormat === 'original'
          ? image.file.name.split('.').pop()
          : outputFormat;

        const baseName = image.file.name.replace(/\.[^.]+$/, '');
        const fileName = `${baseName}_compressed.${extension === 'jpeg' ? 'jpg' : extension}`;

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
      if (image?.originalUrl) {
        URL.revokeObjectURL(image.originalUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
    if (selectedImage?.id === id) {
      setSelectedImage(null);
      setShowComparison(false);
    }
  };

  // Limpiar todo
  const clearAll = () => {
    images.forEach((img) => {
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
    });
    setImages([]);
    setSelectedImage(null);
    setShowComparison(false);
  };

  // Abrir comparación
  const openComparison = (image: ProcessedImage) => {
    if (image.status === 'done') {
      setSelectedImage(image);
      setShowComparison(true);
      setComparisonSlider(50);
    }
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
        <span className={styles.heroIcon} aria-hidden="true">🗜️</span>
        <h1 className={styles.title}>Compresor de Imágenes Avanzado</h1>
        <p className={styles.subtitle}>
          Comprime y redimensiona múltiples imágenes con vista previa y comparación
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Zona de carga */}
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className={styles.dropIcon} aria-hidden="true">📁</span>
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
          {/* Fila 1: Calidad y Presets */}
          <div className={styles.controlRow}>
            <div className={styles.controlSection}>
              <h3 className={styles.controlTitle}>
                Calidad: {qualityPreset === 'smart' ? 'Auto' : `${quality}%`}
              </h3>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => {
                  setQuality(parseInt(e.target.value));
                  setQualityPreset('balanced'); // Desactivar smart al mover slider
                }}
                className={styles.slider}
                disabled={qualityPreset === 'smart'}
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
                  type="button"
                  className={`${styles.presetBtn} ${qualityPreset === 'smart' ? styles.presetActive : ''}`}
                  onClick={() => applyPreset('smart')}
                  title="Ajusta automáticamente según el tipo de imagen"
                  aria-pressed={qualityPreset === 'smart'}
                >
                  <span aria-hidden="true">🧠</span> Inteligente
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${qualityPreset === 'max' ? styles.presetActive : ''}`}
                  onClick={() => applyPreset('max')}
                  aria-pressed={qualityPreset === 'max'}
                >
                  <span aria-hidden="true">🚀</span> Máxima
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${qualityPreset === 'balanced' ? styles.presetActive : ''}`}
                  onClick={() => applyPreset('balanced')}
                  aria-pressed={qualityPreset === 'balanced'}
                >
                  <span aria-hidden="true">⚖️</span> Equilibrado
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${qualityPreset === 'high' ? styles.presetActive : ''}`}
                  onClick={() => applyPreset('high')}
                  aria-pressed={qualityPreset === 'high'}
                >
                  <span aria-hidden="true">💎</span> Alta
                </button>
              </div>
            </div>
          </div>

          {/* Fila 2: Formato y Redimensionado */}
          <div className={styles.controlRow}>
            <div className={styles.controlSection}>
              <h3 className={styles.controlTitle}>Formato de salida</h3>
              <div className={styles.formatButtons}>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${outputFormat === 'original' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('original')}
                  aria-pressed={outputFormat === 'original'}
                >
                  Original
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${outputFormat === 'webp' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('webp')}
                  aria-pressed={outputFormat === 'webp'}
                >
                  WebP
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${outputFormat === 'jpeg' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('jpeg')}
                  aria-pressed={outputFormat === 'jpeg'}
                >
                  JPG
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${outputFormat === 'png' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('png')}
                  aria-pressed={outputFormat === 'png'}
                >
                  PNG
                </button>
              </div>
            </div>

            <div className={styles.controlSection}>
              <h3 className={styles.controlTitle}>Redimensionar</h3>
              <div className={styles.resizeOptions}>
                <select
                  value={resizeOption}
                  onChange={(e) => setResizeOption(e.target.value as ResizeOption)}
                  className={styles.resizeSelect}
                  aria-label="Opción de redimensionado"
                >
                  <option value="none">Sin redimensionar</option>
                  <option value="2048">Máx. 2048px (4K)</option>
                  <option value="1920">Máx. 1920px (Full HD)</option>
                  <option value="1280">Máx. 1280px (HD)</option>
                  <option value="1024">Máx. 1024px (Web)</option>
                  <option value="800">Máx. 800px (Email)</option>
                  <option value="custom">Personalizado...</option>
                </select>
                {resizeOption === 'custom' && (
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="Ancho máximo"
                    className={styles.customWidthInput}
                    min="100"
                    max="10000"
                    aria-label="Ancho máximo personalizado"
                  />
                )}
              </div>
              <span className={styles.resizeHint}>
                Solo se redimensionan imágenes más anchas
              </span>
            </div>
          </div>
        </div>

        {/* Lista de imágenes */}
        {images.length > 0 && (
          <div className={styles.imageList}>
            <div className={styles.listHeader}>
              <h3>Imágenes ({stats.total})</h3>
              <button type="button" onClick={clearAll} className={styles.clearBtn}>
                Limpiar todo
              </button>
            </div>

            <div className={styles.listTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colPreview}>Vista</span>
                <span className={styles.colName}>Archivo</span>
                <span className={styles.colDimensions}>Dimensiones</span>
                <span className={styles.colSize}>Original</span>
                <span className={styles.colSize}>Comprimido</span>
                <span className={styles.colReduction}>Reducción</span>
                <span className={styles.colActions}>Acciones</span>
              </div>

              {images.map((image) => (
                <div key={image.id} className={styles.tableRow}>
                  <span className={styles.colPreview}>
                    <img
                      src={image.compressedUrl || image.originalUrl}
                      alt={image.file.name}
                      className={styles.thumbnailImg}
                      onClick={() => image.status === 'done' && openComparison(image)}
                    />
                  </span>
                  <span className={styles.colName} title={image.file.name}>
                    {image.file.name.length > 20
                      ? image.file.name.substring(0, 17) + '...'
                      : image.file.name}
                  </span>
                  <span className={styles.colDimensions}>
                    {image.status === 'done' && image.compressedWidth && image.compressedHeight ? (
                      image.originalWidth !== image.compressedWidth ? (
                        <span className={styles.dimensionsChanged}>
                          {image.originalWidth}×{image.originalHeight} → {image.compressedWidth}×{image.compressedHeight}
                        </span>
                      ) : (
                        <span>{image.originalWidth}×{image.originalHeight}</span>
                      )
                    ) : (
                      <span>{image.originalWidth}×{image.originalHeight}</span>
                    )}
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
                      <>
                        <button
                          type="button"
                          className={styles.compareBtn}
                          onClick={() => openComparison(image)}
                          title="Comparar antes/después"
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          className={styles.downloadBtn}
                          onClick={() => downloadSingle(image)}
                          title="Descargar"
                        >
                          ⬇️
                        </button>
                      </>
                    )}
                    <button
                      type="button"
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
                type="button"
                onClick={compressAll}
                className={styles.btnPrimary}
                disabled={isProcessing || images.length === 0}
              >
                {isProcessing ? 'Comprimiendo...' : `Comprimir ${images.filter(i => i.status !== 'done').length > 0 ? `(${images.filter(i => i.status !== 'done').length})` : 'todo'}`}
              </button>
              {stats.completed > 0 && (
                <button type="button" onClick={downloadAllAsZip} className={styles.btnSecondary}>
                  <span aria-hidden="true">📥</span> Descargar todo (ZIP)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal de comparación */}
        {showComparison && selectedImage && (
          <div className={styles.comparisonOverlay} onClick={() => setShowComparison(false)}>
            <div className={styles.comparisonModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.comparisonHeader}>
                <h3>Comparación: {selectedImage.file.name}</h3>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setShowComparison(false)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.comparisonContent}>
                <div className={styles.comparisonContainer}>
                  {/* Imagen original (fondo) */}
                  <img
                    src={selectedImage.originalUrl}
                    alt="Original"
                    className={styles.comparisonImageBg}
                  />

                  {/* Imagen comprimida (recortada) */}
                  <div
                    className={styles.comparisonImageFg}
                    style={{ width: `${comparisonSlider}%` }}
                  >
                    <img
                      src={selectedImage.compressedUrl || ''}
                      alt="Comprimida"
                    />
                  </div>

                  {/* Slider */}
                  <div
                    className={styles.comparisonSlider}
                    style={{ left: `${comparisonSlider}%` }}
                  >
                    <div className={styles.sliderHandle}>
                      <span>◀ ▶</span>
                    </div>
                  </div>

                  {/* Control del slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparisonSlider}
                    onChange={(e) => setComparisonSlider(parseInt(e.target.value))}
                    className={styles.comparisonRangeInput}
                    aria-label="Comparar original y comprimida"
                  />
                </div>

                {/* Etiquetas */}
                <div className={styles.comparisonLabels}>
                  <span className={styles.labelOriginal}>
                    Original: {formatSize(selectedImage.originalSize)}
                    {selectedImage.originalWidth && ` (${selectedImage.originalWidth}×${selectedImage.originalHeight})`}
                  </span>
                  <span className={styles.labelCompressed}>
                    Comprimida: {formatSize(selectedImage.compressedSize || 0)}
                    {selectedImage.compressedWidth && ` (${selectedImage.compressedWidth}×${selectedImage.compressedHeight})`}
                  </span>
                </div>

                {/* Reducción destacada */}
                {selectedImage.compressedSize && (
                  <div className={styles.comparisonStats}>
                    <span className={styles.comparisonReduction}>
                      Reducción: -{formatNumber(((selectedImage.originalSize - selectedImage.compressedSize) / selectedImage.originalSize) * 100, 1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Características */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">🧠</span>
            <h4>Modo Inteligente</h4>
            <p>Detecta automáticamente el tipo de imagen y aplica la calidad óptima</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">📐</span>
            <h4>Redimensionado</h4>
            <p>Reduce el tamaño de imágenes grandes automáticamente</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">👁️</span>
            <h4>Comparación Visual</h4>
            <p>Compara antes y después con slider interactivo</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">🔒</span>
            <h4>100% Privado</h4>
            <p>Todo se procesa en tu navegador, nada se sube a servidores</p>
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
              <h4>¿Qué es el modo inteligente?</h4>
              <p>
                Analiza cada imagen y detecta si es una fotografía, gráfico o captura de pantalla.
                Aplica automáticamente la calidad óptima: 82% para fotos, 92% para gráficos, 75% para capturas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se pierde calidad al comprimir?</h4>
              <p>
                Depende del nivel de compresión. Con calidad al 80% la pérdida es imperceptible
                para el ojo humano. Por debajo del 60% puede notarse en fotos detalladas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo debo redimensionar?</h4>
              <p>
                Si tus imágenes son para web, raramente necesitas más de 1920px de ancho.
                Una foto de 4000px se puede reducir a 1280px ahorrando mucho espacio sin perder calidad visible.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Mis imágenes son seguras?</h4>
              <p>
                Sí, 100%. Todo el procesamiento ocurre en tu navegador. Tus imágenes nunca
                salen de tu dispositivo ni se envían a ningún servidor.
              </p>
            </div>
          </div>
        </section>

        {/* === SECCIÓN 1 V2.0: TABLA COMPARATIVA === */}
        <section className={styles.guideSection}>
          <h2>Comparativa de formatos de imagen</h2>
          <p className={styles.introParagraph}>
            Cada formato tiene sus puntos fuertes. Elegir el correcto puede marcar la diferencia
            entre una web rápida y una que penaliza tu SEO.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Compresión</th>
                  <th>Soporte navegadores</th>
                  <th>Tamaño relativo</th>
                  <th>Transparencia</th>
                  <th>Animación</th>
                  <th>Mejor caso de uso</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>JPEG</strong></td>
                  <td>Con pérdida</td>
                  <td>Universal (100%)</td>
                  <td>Medio</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Fotografías, imágenes con muchos colores</td>
                </tr>
                <tr>
                  <td><strong>PNG</strong></td>
                  <td>Sin pérdida</td>
                  <td>Universal (100%)</td>
                  <td>Grande</td>
                  <td>Sí</td>
                  <td>No</td>
                  <td>Logos, iconos, gráficos con texto o transparencia</td>
                </tr>
                <tr>
                  <td><strong>WebP</strong></td>
                  <td>Ambas (lossy/lossless)</td>
                  <td>Muy alto (~97%)</td>
                  <td>Pequeño</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Web moderna, sustituto de JPEG y PNG</td>
                </tr>
                <tr>
                  <td><strong>AVIF</strong></td>
                  <td>Ambas (moderno)</td>
                  <td>Alto (~90%)</td>
                  <td>Muy pequeño</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Web de alto rendimiento, Core Web Vitals</td>
                </tr>
                <tr>
                  <td><strong>SVG</strong></td>
                  <td>Vectorial</td>
                  <td>Universal (100%)</td>
                  <td>Muy pequeño (vectores)</td>
                  <td>Sí</td>
                  <td>Sí (CSS)</td>
                  <td>Logos, iconos, ilustraciones escalables</td>
                </tr>
                <tr>
                  <td><strong>GIF</strong></td>
                  <td>Sin pérdida (limitado)</td>
                  <td>Universal (100%)</td>
                  <td>Grande</td>
                  <td>Parcial</td>
                  <td>Sí</td>
                  <td>Animaciones simples (mejor usar WebP o video)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* === SECCIÓN 2 V2.0: CASOS DE USO === */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa esta herramienta y para qué?</h2>
          <p className={styles.introParagraph}>
            La optimización de imágenes importa en contextos muy distintos. Aquí los perfiles más comunes.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍💻</span>
                <h4>Desarrollador web</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Mejorar Core Web Vitals (LCP) para cumplir los estándares de Google PageSpeed.
              </p>
              <p className={styles.escenarioTip}>
                Convierte a WebP, limita ancho a 1920px y aplica calidad 80-85%. Usa srcset para servir
                distintos tamaños según el dispositivo. Una imagen LCP bien optimizada puede mejorar el
                LCP de 4s a menos de 2,5s.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>✍️</span>
                <h4>Blogger / creador de contenido</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Subir fotos al CMS sin conocimientos técnicos y sin que el blog vaya lento.
              </p>
              <p className={styles.escenarioTip}>
                Usa el preset Equilibrado (80%) y redimensiona a 1280px. Una foto de cámara de 8 MB
                pasará a ~300 KB sin diferencia visible. Tu WordPress o Ghost cargará mucho más rápido.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛒</span>
                <h4>E-commerce con 1000+ fotos</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Optimizar todo el catálogo de fotos de producto sin procesar una a una.
              </p>
              <p className={styles.escenarioTip}>
                Arrastra todas las imágenes de golpe, selecciona WebP + redimensionar a 1024px + calidad 82%.
                Un catálogo de 1.000 fotos de 3 MB cada una (3 GB total) puede reducirse a ~150 MB.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎨</span>
                <h4>Diseñador gráfico</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Objetivo:</strong> Preparar assets para entregar al cliente en el formato correcto y peso adecuado.
              </p>
              <p className={styles.escenarioTip}>
                Para pantalla usa WebP o PNG optimizado. Para impresión no comprimas: exporta desde
                tu herramienta de diseño a TIFF o PDF sin pérdida. Esta herramienta es solo para entrega digital.
              </p>
            </div>
          </div>
        </section>

        {/* === SECCIÓN 3 V2.0: FAQ AMPLIADO === */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes (avanzado)</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuánto se puede comprimir una imagen sin perder calidad visible?</h4>
              <p>
                Para fotografías, entre el 70-85% de calidad JPEG o WebP es imperceptible para el ojo humano
                en pantalla. Por debajo del 60% empiezan a verse artefactos. Una foto de 4 MB puede llegar
                a 200-400 KB con calidad 80% sin diferencia visible.
              </p>
              <p className={styles.faqTip}>
                Regla práctica: usa el comparador antes/después con el slider para verificar que la calidad
                es aceptable antes de descargar.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué formato usar para fotos vs ilustraciones?</h4>
              <p>
                <strong>Fotos:</strong> JPEG o WebP con compresión con pérdida (lossy). Son imágenes con
                millones de colores y gradientes donde la pérdida es imperceptible.<br />
                <strong>Ilustraciones, logos, iconos:</strong> PNG o WebP lossless si necesitas transparencia.
                SVG si el original es vectorial: infinitamente escalable y pesa muy poco.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo usar WebP en lugar de JPEG?</h4>
              <p>
                Casi siempre para web: WebP produce archivos un 25-35% más pequeños que JPEG a la misma calidad
                visual. El único caso donde JPEG sigue siendo preferible es cuando necesitas compatibilidad
                con software antiguo (Photoshop pre-2020, clientes de email, impresión).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es la compresión con y sin pérdida?</h4>
              <p>
                <strong>Con pérdida (lossy):</strong> Elimina información que el ojo no suele distinguir.
                Produce archivos mucho más pequeños pero la imagen no puede recuperarse a su estado original.
                Usada en JPEG y WebP lossy.<br />
                <strong>Sin pérdida (lossless):</strong> Comprime sin eliminar ningún dato. Puedes
                descomprimir y obtener exactamente la imagen original. Usada en PNG y WebP lossless.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo afecta el tamaño de imagen al SEO?</h4>
              <p>
                Google usa el LCP (Largest Contentful Paint) como factor de ranking. Si tu imagen principal
                tarda más de 2,5 segundos en cargarse, penaliza tu posición. Una imagen de 5 MB puede tardar
                5-10 segundos en 4G; la misma a 200 KB carga en menos de 0,5 segundos.
              </p>
              <p className={styles.faqTip}>
                Además, el atributo alt bien redactado ayuda a la indexación de imágenes en Google Images.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué resolución usar para web vs impresión?</h4>
              <p>
                <strong>Web:</strong> 72-96 PPI es suficiente. Dimensiones máximas 1920px de ancho para
                imágenes full-width; 1200px para contenido en columna.<br />
                <strong>Impresión:</strong> Mínimo 300 PPI. Una imagen de 10×15 cm necesita al menos
                1.181×1.772 píxeles a 300 PPI. No uses esta herramienta para imágenes de impresión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué WebP no se ve en algunos clientes de email?</h4>
              <p>
                Clientes como Outlook (versiones antiguas), Apple Mail en macOS Monterey o anteriores,
                y algunos clientes corporativos no soportan WebP. Para emails, sigue usando JPEG o PNG.
                La cobertura de WebP en navegadores web es ~97%, pero en email es muy inferior.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el lazy loading y cómo ayuda con imágenes?</h4>
              <p>
                El lazy loading (carga diferida) retrasa la descarga de imágenes hasta que el usuario
                está a punto de verlas en pantalla. Se activa con el atributo HTML{' '}
                <code>loading=&quot;lazy&quot;</code> en la etiqueta <code>&lt;img&gt;</code>.
                Reduce el tiempo de carga inicial y el consumo de datos, especialmente en páginas largas
                con muchas imágenes below-the-fold.
              </p>
            </div>
          </div>
        </section>

        {/* === SECCIÓN 4 V2.0: GUÍA PASO A PASO === */}
        <section className={styles.guideSection}>
          <h2>Flujo completo de optimización de imágenes para web</h2>
          <p className={styles.introParagraph}>
            Sigue estos 7 pasos para garantizar que tus imágenes estén perfectamente optimizadas
            antes de publicarlas.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Elige el formato correcto según el tipo de imagen</h4>
                <p>
                  Fotos y fotografías → WebP (o JPEG como fallback). Logos, iconos y gráficos
                  con transparencia → PNG o WebP lossless. Ilustraciones vectoriales → SVG siempre.
                  GIF animados → sustitúyelos por WebP animado o video MP4.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Redimensiona antes de comprimir</h4>
                <p>
                  No subas una foto de 5.000px si el contenedor máximo es 1.200px. Redimensiona
                  primero: usa 1920px para imágenes hero full-width, 1280px para contenido en columna
                  y 800px para imágenes en grid. Esta herramienta incluye esta opción directamente.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Comprime con la calidad adecuada</h4>
                <p>
                  Para fotos: 75-85% en JPEG/WebP. Para gráficos con texto: 90-95%. Usa el comparador
                  antes/después para verificar que la calidad es aceptable. El objetivo es el archivo
                  más pequeño sin degradación visible.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Implementa lazy loading en el HTML</h4>
                <p>
                  Añade <code>loading=&quot;lazy&quot;</code> a todas las imágenes que estén below-the-fold
                  (fuera del viewport inicial). Las imágenes above-the-fold (hero, LCP) deben cargarse
                  de inmediato: usa <code>loading=&quot;eager&quot;</code> o simplemente no pongas el atributo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Añade siempre el atributo alt descriptivo</h4>
                <p>
                  El atributo <code>alt</code> es obligatorio por accesibilidad (WCAG 2.1) y ayuda al
                  SEO. Describe el contenido real de la imagen, no uses &quot;imagen&quot; o el nombre
                  del archivo. Para imágenes decorativas usa <code>alt=&quot;&quot;</code> para que los
                  lectores de pantalla las ignoren.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h4>Usa srcset para imágenes responsive</h4>
                <p>
                  Con el atributo <code>srcset</code> puedes servir distintos tamaños según la pantalla:
                  300px para móvil, 800px para tablet, 1200px para escritorio. El navegador descarga
                  solo el tamaño necesario, ahorrando ancho de banda al usuario.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <h4>Sirve imágenes desde una CDN</h4>
                <p>
                  Una CDN (Content Delivery Network) sirve las imágenes desde el servidor más cercano
                  al usuario. Servicios como Cloudflare, Cloudinary o el propio Vercel Image Optimization
                  pueden reducir la latencia a la mitad y aplicar optimización automática adicional.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* === SECCIÓN 5 V2.0: MEJORES PRÁCTICAS === */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas de optimización de imágenes</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌐</span>
              <h4>WebP con fallback JPEG/PNG</h4>
              <p>
                Usa el elemento <code>&lt;picture&gt;</code> para servir WebP a navegadores modernos
                y JPEG/PNG como fallback para compatibilidad. Así obtienes lo mejor de ambos mundos
                sin sacrificar la experiencia en ningún navegador.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Calidad 70-85% para fotos</h4>
              <p>
                Para fotografías en web, la calidad 70-85% en JPEG/WebP es el punto óptimo.
                Por encima de 90% el archivo crece enormemente sin mejora apreciable. Por debajo
                del 65% empiezan a verse artefactos de compresión en bordes y detalles finos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <h4>Dimensiones máximas 1920px</h4>
              <p>
                Para imágenes full-width en escritorio, 1920px es suficiente incluso en pantallas 4K
                (que hacen zoom de píxeles). Para imágenes en columna de contenido, 1200px es más
                que suficiente. No hay razón para subir imágenes de 4000px o más.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📱</span>
              <h4>Srcset para imágenes responsive</h4>
              <p>
                Proporciona múltiples versiones de la imagen (300w, 800w, 1200w) con el atributo
                srcset. El navegador selecciona automáticamente la más adecuada según el ancho del
                viewport y la densidad de píxeles del dispositivo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <h4>Nunca subas imágenes sin comprimir</h4>
              <p>
                Establece como norma comprimir siempre antes de subir. Una imagen sin comprimir
                de cámara puede pesar 8-15 MB; la misma optimizada para web debería pesar 100-400 KB.
                Integra esta herramienta en tu flujo de publicación.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <h4>Verifica con PageSpeed Insights</h4>
              <p>
                Después de optimizar, usa Google PageSpeed Insights o Lighthouse para verificar
                que tus imágenes no son el cuello de botella. La sección "Serve images in next-gen
                formats" y "Properly size images" te indicará si hay margen de mejora.
              </p>
            </div>
          </div>
        </section>

        {/* === SECCIÓN 6 V2.0: WARNING BOX === */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores que ralentizan tu web</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Subir imágenes sin comprimir:</strong> Una foto de cámara de 5 MB frente a
                200 KB optimizada supone 25 veces más tiempo de carga. Con una conexión 4G media
                (20 Mbps), la diferencia es 2 segundos vs 0,08 segundos solo para esa imagen.
              </li>
              <li>
                <strong>Usar PNG para fotografías:</strong> PNG no tiene compresión con pérdida.
                Una foto guardada como PNG puede pesar 10-20 MB frente a 300-500 KB en JPEG o WebP.
                Solo usa PNG cuando necesites transparencia o se trate de un gráfico/logo.
              </li>
              <li>
                <strong>No redimensionar imágenes grandes:</strong> Subir una foto de 5000×4000px
                cuando el contenedor tiene 800px de ancho descarga 30 veces más datos de los necesarios.
                El navegador redimensiona visualmente pero el archivo completo ya fue descargado.
              </li>
              <li>
                <strong>Olvidar el atributo alt:</strong> Sin alt, los usuarios con lectores de
                pantalla no saben qué contiene la imagen. Además, Google no puede indexarla
                correctamente. Es un problema de accesibilidad y SEO simultáneamente.
              </li>
              <li>
                <strong>No usar lazy loading en imágenes below-the-fold:</strong> Cargar todas
                las imágenes al abrir la página, incluidas las que el usuario aún no ve, aumenta
                el tiempo de carga inicial innecesariamente. Añade <code>loading=&quot;lazy&quot;</code>.
              </li>
              <li>
                <strong>Recomprimir imágenes JPEG repetidamente:</strong> Cada vez que guardas un
                JPEG ya comprimido vuelves a aplicar la compresión con pérdida, degradando la calidad
                acumulativamente. Guarda siempre el archivo original sin comprimir y genera la versión
                optimizada desde él.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('compresor-imagenes')} />

      <ShareCard appName="compresor-imagenes" />
      <Footer appName="compresor-imagenes" />
    </div>
  );
}
