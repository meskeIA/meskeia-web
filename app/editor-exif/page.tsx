'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './EditorExif.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection } from '@/components';

// Categorías de metadatos con explicaciones educativas
interface MetadataCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  riskLevel: 'high' | 'medium' | 'low';
  fields: string[];
}

const METADATA_CATEGORIES: MetadataCategory[] = [
  {
    id: 'gps',
    name: 'Ubicación GPS',
    icon: '📍',
    description: 'Revela EXACTAMENTE dónde tomaste la foto. Alguien podría saber dónde vives, trabajas o vacacionas.',
    riskLevel: 'high',
    fields: ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSDateStamp', 'GPSTimeStamp', 'GPSLatitudeRef', 'GPSLongitudeRef']
  },
  {
    id: 'datetime',
    name: 'Fecha y Hora',
    icon: '📅',
    description: 'Indica cuándo se tomó la foto. Puede revelar tus rutinas y horarios.',
    riskLevel: 'medium',
    fields: ['DateTimeOriginal', 'CreateDate', 'ModifyDate', 'DateTimeDigitized']
  },
  {
    id: 'device',
    name: 'Dispositivo',
    icon: '📱',
    description: 'Muestra marca, modelo y número de serie de tu cámara/teléfono. Puede identificarte.',
    riskLevel: 'medium',
    fields: ['Make', 'Model', 'Software', 'SerialNumber', 'LensModel', 'LensSerialNumber', 'BodySerialNumber']
  },
  {
    id: 'camera',
    name: 'Configuración de Cámara',
    icon: '📷',
    description: 'Ajustes técnicos como apertura, ISO, velocidad. Generalmente no es información sensible.',
    riskLevel: 'low',
    fields: ['ExposureTime', 'FNumber', 'ISO', 'FocalLength', 'Flash', 'WhiteBalance', 'ExposureMode', 'MeteringMode']
  },
  {
    id: 'author',
    name: 'Autor y Copyright',
    icon: '©️',
    description: 'Puede contener tu nombre, email o información de contacto.',
    riskLevel: 'medium',
    fields: ['Artist', 'Copyright', 'Creator', 'Author', 'OwnerName', 'XPAuthor']
  },
  {
    id: 'software',
    name: 'Software de Edición',
    icon: '🖥️',
    description: 'Programas usados para editar la imagen. Revela qué herramientas usas.',
    riskLevel: 'low',
    fields: ['Software', 'ProcessingSoftware', 'HistorySoftwareAgent', 'CreatorTool']
  }
];

interface ExifData {
  [key: string]: string | number | undefined;
}

interface ParsedMetadata {
  category: MetadataCategory;
  data: { field: string; value: string | number; explanation: string }[];
}

// Explicaciones amigables para campos EXIF comunes
const FIELD_EXPLANATIONS: { [key: string]: string } = {
  GPSLatitude: 'Coordenada norte-sur de donde tomaste la foto',
  GPSLongitude: 'Coordenada este-oeste de donde tomaste la foto',
  GPSAltitude: 'Altura sobre el nivel del mar donde tomaste la foto',
  DateTimeOriginal: 'Fecha y hora exacta cuando presionaste el botón',
  CreateDate: 'Fecha de creación del archivo',
  ModifyDate: 'Última vez que se modificó la imagen',
  Make: 'Fabricante de tu cámara o teléfono',
  Model: 'Modelo específico de tu dispositivo',
  Software: 'App o programa usado para procesar la imagen',
  SerialNumber: 'Número único que identifica TU dispositivo específico',
  ExposureTime: 'Tiempo que el sensor capturó luz',
  FNumber: 'Apertura del diafragma (afecta desenfoque)',
  ISO: 'Sensibilidad a la luz (mayor ISO = más ruido)',
  FocalLength: 'Distancia focal del lente (afecta zoom)',
  Flash: 'Si se usó flash o no',
  Artist: 'Nombre del fotógrafo configurado en el dispositivo',
  Copyright: 'Información de derechos de autor',
};

export default function EditorExifPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<ParsedMetadata[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [privacyScore, setPrivacyScore] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parsear EXIF manualmente desde los bytes de la imagen
  const parseExifFromArrayBuffer = async (buffer: ArrayBuffer): Promise<ExifData> => {
    const data: ExifData = {};
    const view = new DataView(buffer);

    // Verificar que es JPEG (SOI marker)
    if (view.getUint16(0) !== 0xFFD8) {
      return data;
    }

    let offset = 2;
    while (offset < buffer.byteLength) {
      const marker = view.getUint16(offset);

      // APP1 marker (EXIF)
      if (marker === 0xFFE1) {
        const length = view.getUint16(offset + 2);
        const exifOffset = offset + 4;

        // Verificar "Exif\0\0"
        const exifHeader = new Uint8Array(buffer, exifOffset, 6);
        if (String.fromCharCode(...exifHeader) === 'Exif\0\0') {
          const tiffOffset = exifOffset + 6;

          // Determinar endianness
          const endian = view.getUint16(tiffOffset);
          const littleEndian = endian === 0x4949; // "II"

          // IFD0 offset
          const ifd0Offset = view.getUint32(tiffOffset + 4, littleEndian);
          const ifd0Start = tiffOffset + ifd0Offset;

          // Leer entradas IFD0
          const numEntries = view.getUint16(ifd0Start, littleEndian);

          for (let i = 0; i < numEntries; i++) {
            const entryOffset = ifd0Start + 2 + i * 12;
            const tag = view.getUint16(entryOffset, littleEndian);
            const type = view.getUint16(entryOffset + 2, littleEndian);
            const count = view.getUint32(entryOffset + 4, littleEndian);

            // Tags comunes
            switch (tag) {
              case 0x010F: // Make
                data.Make = readExifString(buffer, view, entryOffset, tiffOffset, count, littleEndian);
                break;
              case 0x0110: // Model
                data.Model = readExifString(buffer, view, entryOffset, tiffOffset, count, littleEndian);
                break;
              case 0x0131: // Software
                data.Software = readExifString(buffer, view, entryOffset, tiffOffset, count, littleEndian);
                break;
              case 0x8769: // ExifIFD pointer
                const exifIfdOffset = view.getUint32(entryOffset + 8, littleEndian);
                parseExifIfd(buffer, view, tiffOffset + exifIfdOffset, tiffOffset, littleEndian, data);
                break;
              case 0x8825: // GPS IFD pointer
                const gpsIfdOffset = view.getUint32(entryOffset + 8, littleEndian);
                parseGpsIfd(buffer, view, tiffOffset + gpsIfdOffset, tiffOffset, littleEndian, data);
                break;
            }
          }
        }
        break;
      }

      // Siguiente marcador
      if ((marker & 0xFF00) === 0xFF00) {
        const segmentLength = view.getUint16(offset + 2);
        offset += 2 + segmentLength;
      } else {
        offset++;
      }
    }

    return data;
  };

  const readExifString = (
    buffer: ArrayBuffer,
    view: DataView,
    entryOffset: number,
    tiffOffset: number,
    count: number,
    littleEndian: boolean
  ): string => {
    let stringOffset: number;
    if (count <= 4) {
      stringOffset = entryOffset + 8;
    } else {
      stringOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
    }
    const bytes = new Uint8Array(buffer, stringOffset, count - 1);
    return String.fromCharCode(...bytes);
  };

  const parseExifIfd = (
    buffer: ArrayBuffer,
    view: DataView,
    ifdStart: number,
    tiffOffset: number,
    littleEndian: boolean,
    data: ExifData
  ) => {
    try {
      const numEntries = view.getUint16(ifdStart, littleEndian);

      for (let i = 0; i < numEntries; i++) {
        const entryOffset = ifdStart + 2 + i * 12;
        const tag = view.getUint16(entryOffset, littleEndian);
        const type = view.getUint16(entryOffset + 2, littleEndian);
        const count = view.getUint32(entryOffset + 4, littleEndian);

        switch (tag) {
          case 0x9003: // DateTimeOriginal
            data.DateTimeOriginal = readExifString(buffer, view, entryOffset, tiffOffset, count, littleEndian);
            break;
          case 0x9004: // DateTimeDigitized
            data.DateTimeDigitized = readExifString(buffer, view, entryOffset, tiffOffset, count, littleEndian);
            break;
          case 0x829A: // ExposureTime
            if (type === 5) { // RATIONAL
              const valueOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
              const num = view.getUint32(valueOffset, littleEndian);
              const den = view.getUint32(valueOffset + 4, littleEndian);
              data.ExposureTime = `1/${Math.round(den / num)}s`;
            }
            break;
          case 0x829D: // FNumber
            if (type === 5) {
              const valueOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
              const num = view.getUint32(valueOffset, littleEndian);
              const den = view.getUint32(valueOffset + 4, littleEndian);
              data.FNumber = `f/${(num / den).toFixed(1)}`;
            }
            break;
          case 0x8827: // ISO
            data.ISO = view.getUint16(entryOffset + 8, littleEndian);
            break;
          case 0x920A: // FocalLength
            if (type === 5) {
              const valueOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
              const num = view.getUint32(valueOffset, littleEndian);
              const den = view.getUint32(valueOffset + 4, littleEndian);
              data.FocalLength = `${(num / den).toFixed(0)}mm`;
            }
            break;
          case 0x9209: // Flash
            const flashValue = view.getUint16(entryOffset + 8, littleEndian);
            data.Flash = flashValue & 1 ? 'Sí' : 'No';
            break;
        }
      }
    } catch {
      // Error parsing EXIF IFD
    }
  };

  const parseGpsIfd = (
    buffer: ArrayBuffer,
    view: DataView,
    ifdStart: number,
    tiffOffset: number,
    littleEndian: boolean,
    data: ExifData
  ) => {
    try {
      const numEntries = view.getUint16(ifdStart, littleEndian);
      let latRef = 'N', lngRef = 'E';
      let lat = 0, lng = 0;

      for (let i = 0; i < numEntries; i++) {
        const entryOffset = ifdStart + 2 + i * 12;
        const tag = view.getUint16(entryOffset, littleEndian);
        const type = view.getUint16(entryOffset + 2, littleEndian);

        switch (tag) {
          case 0x0001: // GPSLatitudeRef
            latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
            break;
          case 0x0002: // GPSLatitude
            if (type === 5) {
              const valueOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
              const deg = view.getUint32(valueOffset, littleEndian) / view.getUint32(valueOffset + 4, littleEndian);
              const min = view.getUint32(valueOffset + 8, littleEndian) / view.getUint32(valueOffset + 12, littleEndian);
              const sec = view.getUint32(valueOffset + 16, littleEndian) / view.getUint32(valueOffset + 20, littleEndian);
              lat = deg + min / 60 + sec / 3600;
            }
            break;
          case 0x0003: // GPSLongitudeRef
            lngRef = String.fromCharCode(view.getUint8(entryOffset + 8));
            break;
          case 0x0004: // GPSLongitude
            if (type === 5) {
              const valueOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
              const deg = view.getUint32(valueOffset, littleEndian) / view.getUint32(valueOffset + 4, littleEndian);
              const min = view.getUint32(valueOffset + 8, littleEndian) / view.getUint32(valueOffset + 12, littleEndian);
              const sec = view.getUint32(valueOffset + 16, littleEndian) / view.getUint32(valueOffset + 20, littleEndian);
              lng = deg + min / 60 + sec / 3600;
            }
            break;
          case 0x0006: // GPSAltitude
            if (type === 5) {
              const valueOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
              const num = view.getUint32(valueOffset, littleEndian);
              const den = view.getUint32(valueOffset + 4, littleEndian);
              data.GPSAltitude = `${(num / den).toFixed(1)}m`;
            }
            break;
        }
      }

      if (lat !== 0 && lng !== 0) {
        if (latRef === 'S') lat = -lat;
        if (lngRef === 'W') lng = -lng;
        data.GPSLatitude = lat.toFixed(6);
        data.GPSLongitude = lng.toFixed(6);
      }
    } catch {
      // Error parsing GPS IFD
    }
  };

  const analyzeImage = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setExifData(null);
    setParsedMetadata([]);
    setGpsCoords(null);
    setPrivacyScore(100);

    try {
      const buffer = await file.arrayBuffer();
      const data = await parseExifFromArrayBuffer(buffer);

      setExifData(data);

      // Parsear metadatos por categoría
      const parsed: ParsedMetadata[] = [];
      let riskScore = 0;

      for (const category of METADATA_CATEGORIES) {
        const categoryData: { field: string; value: string | number; explanation: string }[] = [];

        for (const field of category.fields) {
          if (data[field] !== undefined) {
            categoryData.push({
              field,
              value: data[field] as string | number,
              explanation: FIELD_EXPLANATIONS[field] || 'Metadato técnico de la imagen'
            });
          }
        }

        if (categoryData.length > 0) {
          parsed.push({ category, data: categoryData });

          // Calcular riesgo
          if (category.riskLevel === 'high') riskScore += 40;
          else if (category.riskLevel === 'medium') riskScore += 20;
          else riskScore += 5;
        }
      }

      setParsedMetadata(parsed);
      setPrivacyScore(Math.max(0, 100 - riskScore));

      // Extraer coordenadas GPS si existen
      if (data.GPSLatitude && data.GPSLongitude) {
        setGpsCoords({
          lat: parseFloat(data.GPSLatitude as string),
          lng: parseFloat(data.GPSLongitude as string)
        });
      }

      // Pre-seleccionar categorías de alto riesgo
      const highRiskIds = parsed
        .filter(p => p.category.riskLevel === 'high')
        .map(p => p.category.id);
      setSelectedCategories(new Set(highRiskIds));

    } catch (error) {
      console.error('Error analizando imagen:', error);
    }

    setIsAnalyzing(false);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    setImageFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Analizar EXIF
    analyzeImage(file);
  }, [analyzeImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const selectAllCategories = () => {
    const allIds = parsedMetadata.map(p => p.category.id);
    setSelectedCategories(new Set(allIds));
  };

  const deselectAllCategories = () => {
    setSelectedCategories(new Set());
  };

  // Crear imagen limpia sin metadatos EXIF (usando Canvas)
  const removeMetadataAndDownload = async () => {
    if (!imageFile || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = imagePreview;

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Canvas.toBlob() crea una imagen NUEVA sin metadatos EXIF
      const mimeType = imageFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = mimeType === 'image/jpeg' ? 0.95 : undefined;

      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const originalName = imageFile.name.replace(/\.[^/.]+$/, '');
        link.href = url;
        link.download = `${originalName}_sin_metadatos.${mimeType === 'image/png' ? 'png' : 'jpg'}`;
        link.click();
        URL.revokeObjectURL(url);

        setIsProcessing(false);
      }, mimeType, quality);

    } catch (error) {
      console.error('Error procesando imagen:', error);
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExifData(null);
    setParsedMetadata([]);
    setGpsCoords(null);
    setPrivacyScore(0);
    setSelectedCategories(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Verde
    if (score >= 50) return '#F59E0B'; // Amarillo
    return '#EF4444'; // Rojo
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Bajo riesgo';
    if (score >= 50) return 'Riesgo moderado';
    return 'Alto riesgo de privacidad';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔍</span>
        <h1 className={styles.title}>Editor de Metadatos EXIF</h1>
        <p className={styles.subtitle}>
          Descubre qué datos ocultos revelan tus fotos y protege tu privacidad
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de subida */}
        {!imageFile ? (
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className={styles.dropIcon}>📷</span>
            <p className={styles.dropText}>Arrastra una foto aquí o haz clic para seleccionar</p>
            <span className={styles.dropHint}>Soporta JPEG, PNG, WebP • 100% offline, sin subir a servidores</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className={styles.fileInput}
            />
          </div>
        ) : (
          <>
            {/* Panel de imagen */}
            <div className={styles.imagePanel}>
              <div className={styles.imageHeader}>
                <h2>Imagen analizada</h2>
                <button type="button" onClick={clearImage} className={styles.btnClear}>
                  Analizar otra
                </button>
              </div>

              <div className={styles.imagePreviewWrapper}>
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              </div>

              <div className={styles.imageInfo}>
                <span>{imageFile.name}</span>
                <span>{(imageFile.size / 1024).toFixed(1)} KB</span>
              </div>

              {/* Puntuación de privacidad */}
              {exifData && (
                <div className={styles.privacyScore}>
                  <div className={styles.scoreCircle} style={{ borderColor: getScoreColor(privacyScore) }}>
                    <span className={styles.scoreValue} style={{ color: getScoreColor(privacyScore) }}>
                      {privacyScore}
                    </span>
                  </div>
                  <div className={styles.scoreInfo}>
                    <span className={styles.scoreLabel} style={{ color: getScoreColor(privacyScore) }}>
                      {getScoreLabel(privacyScore)}
                    </span>
                    <span className={styles.scoreHint}>
                      {parsedMetadata.length === 0
                        ? 'No se encontraron metadatos EXIF'
                        : `${parsedMetadata.reduce((acc, p) => acc + p.data.length, 0)} datos encontrados en ${parsedMetadata.length} categorías`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Panel de metadatos */}
            <div className={styles.metadataPanel}>
              {isAnalyzing ? (
                <div className={styles.analyzing}>
                  <span className={styles.spinner}>⏳</span>
                  <p>Analizando metadatos...</p>
                </div>
              ) : parsedMetadata.length === 0 ? (
                <div className={styles.noMetadata}>
                  <span className={styles.noMetadataIcon}>✅</span>
                  <h3>¡Excelente!</h3>
                  <p>Esta imagen no contiene metadatos EXIF detectables o ya fueron eliminados.</p>
                </div>
              ) : (
                <>
                  <div className={styles.metadataHeader}>
                    <h2>Metadatos encontrados</h2>
                    <div className={styles.selectionButtons}>
                      <button type="button" onClick={selectAllCategories} className={styles.btnSmall}>
                        Seleccionar todo
                      </button>
                      <button type="button" onClick={deselectAllCategories} className={styles.btnSmall}>
                        Ninguno
                      </button>
                    </div>
                  </div>

                  {/* Mapa GPS */}
                  {gpsCoords && (
                    <div className={styles.gpsSection}>
                      <div className={styles.gpsWarning}>
                        <span className={styles.gpsWarningIcon}>⚠️</span>
                        <div>
                          <strong>¡Ubicación detectada!</strong>
                          <p>Esta foto revela exactamente dónde fue tomada.</p>
                        </div>
                      </div>
                      <div className={styles.mapContainer}>
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${gpsCoords.lng - 0.01},${gpsCoords.lat - 0.01},${gpsCoords.lng + 0.01},${gpsCoords.lat + 0.01}&layer=mapnik&marker=${gpsCoords.lat},${gpsCoords.lng}`}
                          className={styles.map}
                          title="Ubicación GPS de la foto"
                        />
                      </div>
                      <p className={styles.gpsCoords}>
                        📍 {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  {/* Categorías de metadatos */}
                  <div className={styles.categories}>
                    {parsedMetadata.map(({ category, data }) => (
                      <div
                        key={category.id}
                        className={`${styles.categoryCard} ${styles[`risk${category.riskLevel.charAt(0).toUpperCase() + category.riskLevel.slice(1)}`]}`}
                      >
                        <div
                          className={styles.categoryHeader}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className={styles.categoryTitle}>
                            <input
                              type="checkbox"
                              checked={selectedCategories.has(category.id)}
                              onChange={() => toggleCategory(category.id)}
                              className={styles.categoryCheckbox}
                            />
                            <span className={styles.categoryIcon}>{category.icon}</span>
                            <span>{category.name}</span>
                            <span className={styles.categoryCount}>({data.length})</span>
                          </div>
                          <span className={`${styles.riskBadge} ${styles[category.riskLevel]}`}>
                            {category.riskLevel === 'high' ? 'Alto riesgo' :
                             category.riskLevel === 'medium' ? 'Riesgo medio' : 'Bajo riesgo'}
                          </span>
                        </div>

                        <p className={styles.categoryDescription}>{category.description}</p>

                        <div className={styles.fieldsList}>
                          {data.map(({ field, value, explanation }) => (
                            <div key={field} className={styles.fieldItem}>
                              <div className={styles.fieldName}>{field}</div>
                              <div className={styles.fieldValue}>{String(value)}</div>
                              <div className={styles.fieldExplanation}>{explanation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón de descarga */}
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={removeMetadataAndDownload}
                      disabled={isProcessing}
                      className={styles.btnPrimary}
                    >
                      {isProcessing ? '⏳ Procesando...' : '🛡️ Descargar sin metadatos'}
                    </button>
                    <p className={styles.actionHint}>
                      Se creará una copia limpia de la imagen sin NINGÚN metadato EXIF
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Qué son los metadatos EXIF y por qué importan?"
        subtitle="Aprende sobre seguridad digital y protege tu privacidad"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué datos ocultos tienen tus fotos?</h2>
          <p className={styles.introParagraph}>
            Cada vez que tomas una foto con tu móvil o cámara digital, el dispositivo guarda información invisible
            llamada <strong>metadatos EXIF</strong>. Estos datos pueden revelar más de lo que imaginas sobre ti.
          </p>

          <div className={styles.riskGrid}>
            <div className={styles.riskCard}>
              <span className={styles.riskIcon}>📍</span>
              <h4>Tu ubicación exacta</h4>
              <p>Coordenadas GPS que muestran dónde vives, trabajas o vacacionas. Un extraño podría saber tu dirección.</p>
            </div>
            <div className={styles.riskCard}>
              <span className={styles.riskIcon}>📅</span>
              <h4>Tus rutinas</h4>
              <p>Fecha y hora de cada foto revelan tus horarios: cuándo sales de casa, cuándo vuelves, tu agenda.</p>
            </div>
            <div className={styles.riskCard}>
              <span className={styles.riskIcon}>📱</span>
              <h4>Tu dispositivo</h4>
              <p>Marca, modelo y número de serie pueden identificarte específicamente entre millones de usuarios.</p>
            </div>
            <div className={styles.riskCard}>
              <span className={styles.riskIcon}>👤</span>
              <h4>Tu identidad</h4>
              <p>Nombre del fotógrafo, copyright y otros datos personales que hayas configurado.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Cuándo deberías eliminar los metadatos?</h2>
          <div className={styles.useCaseGrid}>
            <div className={styles.useCase}>
              <strong>✅ Antes de publicar en redes sociales</strong>
              <p>Facebook, Instagram y Twitter eliminan algunos metadatos, pero no todos. Mejor prevenir.</p>
            </div>
            <div className={styles.useCase}>
              <strong>✅ Al vender productos online</strong>
              <p>Las fotos de productos pueden revelar tu domicilio si no eliminas el GPS.</p>
            </div>
            <div className={styles.useCase}>
              <strong>✅ Compartir con desconocidos</strong>
              <p>Enviar fotos por email, WhatsApp o foros mantiene todos los metadatos intactos.</p>
            </div>
            <div className={styles.useCase}>
              <strong>✅ Periodismo y activismo</strong>
              <p>Proteger fuentes y ubicaciones sensibles es crítico en contextos de riesgo.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Mis fotos se suben a algún servidor?</h4>
              <p>No. Todo el procesamiento ocurre en tu navegador. Tus imágenes nunca salen de tu dispositivo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se reduce la calidad de la imagen?</h4>
              <p>Mínimamente. Usamos compresión JPEG al 95% para mantener la calidad visual prácticamente idéntica.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Funciona con fotos de WhatsApp?</h4>
              <p>WhatsApp ya elimina metadatos al enviar fotos. Pero si descargas la original del teléfono, sí tendrá EXIF.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo eliminar solo algunos datos?</h4>
              <p>Este editor elimina TODOS los metadatos al crear una copia limpia. Es el método más seguro y simple.</p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="editor-exif" />
    </div>
  );
}
