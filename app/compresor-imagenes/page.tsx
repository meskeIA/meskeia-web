'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './CompresorImagenes.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
        <span className={styles.heroIcon}>🗜️</span>
        <h1 className={styles.title}>Compresor de Imágenes Avanzado</h1>
        <p className={styles.subtitle}>
          Comprime y redimensiona múltiples imágenes con vista previa y comparación
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
                >
                  🧠 Inteligente
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${qualityPreset === 'max' ? styles.presetActive : ''}`}
                  onClick={() => applyPreset('max')}
                >
                  🚀 Máxima
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${qualityPreset === 'balanced' ? styles.presetActive : ''}`}
                  onClick={() => applyPreset('balanced')}
                >
                  ⚖️ Equilibrado
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${qualityPreset === 'high' ? styles.presetActive : ''}`}
                  onClick={() => applyPreset('high')}
                >
                  💎 Alta
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
                >
                  Original
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${outputFormat === 'webp' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('webp')}
                >
                  WebP
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${outputFormat === 'jpeg' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('jpeg')}
                >
                  JPG
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${outputFormat === 'png' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('png')}
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
                  📥 Descargar todo (ZIP)
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
            <span className={styles.featureIcon}>🧠</span>
            <h4>Modo Inteligente</h4>
            <p>Detecta automáticamente el tipo de imagen y aplica la calidad óptima</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📐</span>
            <h4>Redimensionado</h4>
            <p>Reduce el tamaño de imágenes grandes automáticamente</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>👁️</span>
            <h4>Comparación Visual</h4>
            <p>Compara antes y después con slider interactivo</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔒</span>
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('compresor-imagenes')} />

      <Footer appName="compresor-imagenes" />
    </div>
  );
}
