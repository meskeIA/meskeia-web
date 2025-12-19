'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './ConversorFormatos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de formato soportados
type FileFormat = 'json' | 'csv' | 'xlsx' | 'xml' | 'yaml' | 'tsv';

interface ParsedData {
  data: Record<string, unknown>[];
  columns: string[];
  format: FileFormat;
  fileName: string;
  fileSize: number;
}

interface ConversionOptions {
  csvDelimiter: string;
  csvQuote: boolean;
  jsonIndent: number;
  xmlRoot: string;
  includeHeader: boolean;
}

// Detectar formato por extensión
const detectFormat = (fileName: string): FileFormat | null => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json': return 'json';
    case 'csv': return 'csv';
    case 'tsv': return 'tsv';
    case 'xlsx':
    case 'xls': return 'xlsx';
    case 'xml': return 'xml';
    case 'yaml':
    case 'yml': return 'yaml';
    default: return null;
  }
};

// Formatear tamaño de archivo
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Info de formatos
const formatInfo: Record<FileFormat, { name: string; icon: string; ext: string }> = {
  json: { name: 'JSON', icon: '📋', ext: '.json' },
  csv: { name: 'CSV', icon: '📊', ext: '.csv' },
  tsv: { name: 'TSV', icon: '📑', ext: '.tsv' },
  xlsx: { name: 'Excel', icon: '📗', ext: '.xlsx' },
  xml: { name: 'XML', icon: '📄', ext: '.xml' },
  yaml: { name: 'YAML', icon: '⚙️', ext: '.yaml' },
};

export default function ConversorFormatosPage() {
  // Estados principales
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [targetFormat, setTargetFormat] = useState<FileFormat>('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [convertedContent, setConvertedContent] = useState<string | Blob | null>(null);

  // Opciones de conversión
  const [options, setOptions] = useState<ConversionOptions>({
    csvDelimiter: ',',
    csvQuote: true,
    jsonIndent: 2,
    xmlRoot: 'root',
    includeHeader: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsear JSON
  const parseJSON = (content: string): Record<string, unknown>[] => {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // Si es objeto, convertir a array
    return [parsed];
  };

  // Parsear CSV/TSV
  const parseCSV = async (content: string, delimiter: string): Promise<Record<string, unknown>[]> => {
    const Papa = (await import('papaparse')).default;
    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        header: true,
        delimiter,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as Record<string, unknown>[]);
        },
        error: (err: Error) => {
          reject(err);
        },
      });
    });
  };

  // Parsear Excel
  const parseExcel = async (buffer: ArrayBuffer): Promise<Record<string, unknown>[]> => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet);
  };

  // Parsear XML
  const parseXML = (content: string): Record<string, unknown>[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');

    const parseNode = (node: Element): Record<string, unknown> => {
      const obj: Record<string, unknown> = {};

      // Atributos
      Array.from(node.attributes).forEach(attr => {
        obj[`@${attr.name}`] = attr.value;
      });

      // Hijos
      Array.from(node.children).forEach(child => {
        const childName = child.tagName;
        const childValue = child.children.length > 0
          ? parseNode(child)
          : child.textContent;

        if (obj[childName]) {
          if (Array.isArray(obj[childName])) {
            (obj[childName] as unknown[]).push(childValue);
          } else {
            obj[childName] = [obj[childName], childValue];
          }
        } else {
          obj[childName] = childValue;
        }
      });

      // Si no tiene hijos ni atributos, devolver texto
      if (Object.keys(obj).length === 0) {
        return { value: node.textContent } as Record<string, unknown>;
      }

      return obj;
    };

    const root = doc.documentElement;
    const items = Array.from(root.children).map(parseNode);
    return items.length > 0 ? items : [parseNode(root)];
  };

  // Parsear YAML
  const parseYAML = async (content: string): Promise<Record<string, unknown>[]> => {
    const yaml = await import('js-yaml');
    const parsed = yaml.load(content);
    if (Array.isArray(parsed)) {
      return parsed as Record<string, unknown>[];
    }
    return [parsed as Record<string, unknown>];
  };

  // Extraer columnas de los datos
  const extractColumns = (data: Record<string, unknown>[]): string[] => {
    const columnsSet = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => columnsSet.add(key));
    });
    return Array.from(columnsSet);
  };

  // Manejar archivo cargado
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);
    setConvertedContent(null);

    try {
      const format = detectFormat(file.name);
      if (!format) {
        throw new Error('Formato no soportado. Usa JSON, CSV, TSV, Excel, XML o YAML.');
      }

      let data: Record<string, unknown>[];

      if (format === 'xlsx') {
        const buffer = await file.arrayBuffer();
        data = await parseExcel(buffer);
      } else {
        const content = await file.text();

        switch (format) {
          case 'json':
            data = parseJSON(content);
            break;
          case 'csv':
            data = await parseCSV(content, ',');
            break;
          case 'tsv':
            data = await parseCSV(content, '\t');
            break;
          case 'xml':
            data = parseXML(content);
            break;
          case 'yaml':
            data = await parseYAML(content);
            break;
          default:
            throw new Error('Formato no soportado');
        }
      }

      if (!data || data.length === 0) {
        throw new Error('El archivo está vacío o no contiene datos válidos.');
      }

      const columns = extractColumns(data);

      setParsedData({
        data,
        columns,
        format,
        fileName: file.name,
        fileSize: file.size,
      });

      // Auto-seleccionar formato de salida diferente
      if (format === 'json') setTargetFormat('csv');
      else if (format === 'csv') setTargetFormat('json');
      else if (format === 'xlsx') setTargetFormat('json');
      else setTargetFormat('json');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Convertir a JSON
  const toJSON = (data: Record<string, unknown>[]): string => {
    return JSON.stringify(data, null, options.jsonIndent);
  };

  // Convertir a CSV/TSV
  const toCSV = async (data: Record<string, unknown>[], delimiter: string): Promise<string> => {
    const Papa = (await import('papaparse')).default;
    return Papa.unparse(data, {
      delimiter,
      quotes: options.csvQuote,
      header: options.includeHeader,
    });
  };

  // Convertir a Excel
  const toExcel = async (data: Record<string, unknown>[]): Promise<Blob> => {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  // Convertir a XML
  const toXML = (data: Record<string, unknown>[]): string => {
    const escapeXML = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const objectToXML = (obj: unknown, tagName: string = 'item'): string => {
      if (obj === null || obj === undefined) return `<${tagName}/>`;
      if (typeof obj !== 'object') return `<${tagName}>${escapeXML(String(obj))}</${tagName}>`;

      const entries = Object.entries(obj as Record<string, unknown>);
      const content = entries.map(([key, value]) => {
        // Saltar atributos (empiezan con @)
        if (key.startsWith('@')) return '';
        if (Array.isArray(value)) {
          return value.map(item => objectToXML(item, key)).join('\n  ');
        }
        return objectToXML(value, key);
      }).filter(Boolean).join('\n  ');

      return `<${tagName}>\n  ${content}\n</${tagName}>`;
    };

    const items = data.map(item => objectToXML(item, 'item')).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${options.xmlRoot}>\n${items}\n</${options.xmlRoot}>`;
  };

  // Convertir a YAML
  const toYAML = async (data: Record<string, unknown>[]): Promise<string> => {
    const yaml = await import('js-yaml');
    return yaml.dump(data, { indent: 2, lineWidth: -1 });
  };

  // Ejecutar conversión
  const convert = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    setError(null);

    try {
      let result: string | Blob;

      switch (targetFormat) {
        case 'json':
          result = toJSON(parsedData.data);
          break;
        case 'csv':
          result = await toCSV(parsedData.data, ',');
          break;
        case 'tsv':
          result = await toCSV(parsedData.data, '\t');
          break;
        case 'xlsx':
          result = await toExcel(parsedData.data);
          break;
        case 'xml':
          result = toXML(parsedData.data);
          break;
        case 'yaml':
          result = await toYAML(parsedData.data);
          break;
        default:
          throw new Error('Formato de salida no soportado');
      }

      setConvertedContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al convertir');
    } finally {
      setIsLoading(false);
    }
  };

  // Descargar archivo convertido
  const download = () => {
    if (!convertedContent || !parsedData) return;

    const baseName = parsedData.fileName.replace(/\.[^.]+$/, '');
    const ext = formatInfo[targetFormat].ext;
    const fileName = `${baseName}_converted${ext}`;

    let blob: Blob;
    if (convertedContent instanceof Blob) {
      blob = convertedContent;
    } else {
      const mimeTypes: Record<FileFormat, string> = {
        json: 'application/json',
        csv: 'text/csv',
        tsv: 'text/tab-separated-values',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xml: 'application/xml',
        yaml: 'text/yaml',
      };
      blob = new Blob([convertedContent], { type: mimeTypes[targetFormat] });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copiar al portapapeles
  const copyToClipboard = async () => {
    if (!convertedContent || convertedContent instanceof Blob) return;

    try {
      await navigator.clipboard.writeText(convertedContent);
      alert('Contenido copiado al portapapeles');
    } catch {
      alert('Error al copiar');
    }
  };

  // Limpiar todo
  const reset = () => {
    setParsedData(null);
    setConvertedContent(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handlers de drag and drop
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
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔄</span>
        <h1 className={styles.title}>Conversor de Formatos de Archivo</h1>
        <p className={styles.subtitle}>
          Convierte entre JSON, CSV, Excel, XML y YAML. 100% privado, todo en tu navegador.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Zona de carga */}
        {!parsedData && (
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className={styles.dropIcon}>📁</span>
            <p className={styles.dropText}>Arrastra un archivo aquí o haz clic para seleccionar</p>
            <div className={styles.formatBadges}>
              {Object.entries(formatInfo).map(([key, info]) => (
                <span key={key} className={styles.formatBadge}>
                  {info.icon} {info.name}
                </span>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.tsv,.xlsx,.xls,.xml,.yaml,.yml"
              onChange={handleInputChange}
              className={styles.fileInput}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorBox}>
            <span>❌</span> {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className={styles.loadingBox}>
            <span className={styles.spinner}></span>
            Procesando...
          </div>
        )}

        {/* Datos cargados */}
        {parsedData && !isLoading && (
          <>
            {/* Info del archivo */}
            <div className={styles.fileInfo}>
              <div className={styles.fileHeader}>
                <div className={styles.fileDetails}>
                  <span className={styles.fileIcon}>{formatInfo[parsedData.format].icon}</span>
                  <div>
                    <h3>{parsedData.fileName}</h3>
                    <span className={styles.fileMeta}>
                      {formatInfo[parsedData.format].name} • {formatSize(parsedData.fileSize)} • {parsedData.data.length} filas • {parsedData.columns.length} columnas
                    </span>
                  </div>
                </div>
                <button type="button" onClick={reset} className={styles.resetBtn}>
                  ✕ Cambiar archivo
                </button>
              </div>
            </div>

            {/* Vista previa de datos */}
            <div className={styles.previewSection}>
              <h3>Vista previa de datos</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      {parsedData.columns.slice(0, 8).map((col, i) => (
                        <th key={i}>{col}</th>
                      ))}
                      {parsedData.columns.length > 8 && <th>...</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.data.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {parsedData.columns.slice(0, 8).map((col, j) => (
                          <td key={j}>
                            {typeof row[col] === 'object'
                              ? JSON.stringify(row[col]).slice(0, 30)
                              : String(row[col] ?? '').slice(0, 30)}
                          </td>
                        ))}
                        {parsedData.columns.length > 8 && <td>...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.data.length > 5 && (
                <p className={styles.previewNote}>
                  Mostrando 5 de {parsedData.data.length} filas
                </p>
              )}
            </div>

            {/* Selector de formato destino */}
            <div className={styles.conversionSection}>
              <h3>Convertir a:</h3>
              <div className={styles.formatGrid}>
                {Object.entries(formatInfo).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.formatOption} ${targetFormat === key ? styles.formatSelected : ''} ${parsedData.format === key ? styles.formatDisabled : ''}`}
                    onClick={() => setTargetFormat(key as FileFormat)}
                    disabled={parsedData.format === key}
                  >
                    <span className={styles.formatOptionIcon}>{info.icon}</span>
                    <span className={styles.formatOptionName}>{info.name}</span>
                    <span className={styles.formatOptionExt}>{info.ext}</span>
                    {parsedData.format === key && <span className={styles.formatCurrent}>Origen</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones de conversión */}
            <div className={styles.optionsSection}>
              <h3>Opciones</h3>
              <div className={styles.optionsGrid}>
                {(targetFormat === 'csv' || targetFormat === 'tsv') && (
                  <>
                    <label className={styles.optionItem}>
                      <span>Incluir encabezados</span>
                      <input
                        type="checkbox"
                        checked={options.includeHeader}
                        onChange={(e) => setOptions({ ...options, includeHeader: e.target.checked })}
                      />
                    </label>
                    <label className={styles.optionItem}>
                      <span>Entrecomillar valores</span>
                      <input
                        type="checkbox"
                        checked={options.csvQuote}
                        onChange={(e) => setOptions({ ...options, csvQuote: e.target.checked })}
                      />
                    </label>
                  </>
                )}
                {targetFormat === 'json' && (
                  <label className={styles.optionItem}>
                    <span>Indentación</span>
                    <select
                      value={options.jsonIndent}
                      onChange={(e) => setOptions({ ...options, jsonIndent: parseInt(e.target.value) })}
                      className={styles.optionSelect}
                    >
                      <option value="0">Compacto</option>
                      <option value="2">2 espacios</option>
                      <option value="4">4 espacios</option>
                    </select>
                  </label>
                )}
                {targetFormat === 'xml' && (
                  <label className={styles.optionItem}>
                    <span>Elemento raíz</span>
                    <input
                      type="text"
                      value={options.xmlRoot}
                      onChange={(e) => setOptions({ ...options, xmlRoot: e.target.value })}
                      className={styles.optionInput}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Botón convertir */}
            <div className={styles.convertActions}>
              <button
                type="button"
                onClick={convert}
                className={styles.btnPrimary}
                disabled={isLoading}
              >
                🔄 Convertir a {formatInfo[targetFormat].name}
              </button>
            </div>

            {/* Resultado */}
            {convertedContent && (
              <div className={styles.resultSection}>
                <div className={styles.resultHeader}>
                  <h3>✅ Conversión completada</h3>
                  <div className={styles.resultActions}>
                    {!(convertedContent instanceof Blob) && (
                      <button type="button" onClick={copyToClipboard} className={styles.btnSecondary}>
                        📋 Copiar
                      </button>
                    )}
                    <button type="button" onClick={download} className={styles.btnPrimary}>
                      ⬇️ Descargar {formatInfo[targetFormat].ext}
                    </button>
                  </div>
                </div>

                {/* Preview del resultado (solo para texto) */}
                {!(convertedContent instanceof Blob) && (
                  <div className={styles.resultPreview}>
                    <pre>{convertedContent.slice(0, 2000)}{convertedContent.length > 2000 ? '\n...(truncado)' : ''}</pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Características */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔒</span>
            <h4>100% Privado</h4>
            <p>Todo se procesa en tu navegador. Tus datos nunca salen de tu dispositivo.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚡</span>
            <h4>Instantáneo</h4>
            <p>Conversión inmediata sin esperas ni límites de tamaño.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔄</span>
            <h4>Bidireccional</h4>
            <p>Convierte en cualquier dirección entre todos los formatos.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📊</span>
            <h4>Vista previa</h4>
            <p>Visualiza tus datos antes y después de la conversión.</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre formatos de datos?"
        subtitle="Descubre cuándo usar cada formato y cómo estructurar tus datos"
      >
        <section className={styles.guideSection}>
          <h2>Guía de formatos de datos</h2>
          <p className={styles.introParagraph}>
            Cada formato tiene sus ventajas. Elegir el correcto puede ahorrarte horas de trabajo
            y evitar problemas de compatibilidad.
          </p>

          <div className={styles.formatGuide}>
            <div className={styles.formatCard}>
              <h4>📋 JSON (JavaScript Object Notation)</h4>
              <p><strong>Mejor para:</strong> APIs, configuraciones, datos anidados</p>
              <p><strong>Ventajas:</strong> Soporta estructuras complejas, muy usado en desarrollo web</p>
              <p><strong>Limitaciones:</strong> No ideal para hojas de cálculo</p>
            </div>

            <div className={styles.formatCard}>
              <h4>📊 CSV (Comma-Separated Values)</h4>
              <p><strong>Mejor para:</strong> Hojas de cálculo, importar a Excel/Sheets, datos tabulares</p>
              <p><strong>Ventajas:</strong> Universal, muy ligero, fácil de editar</p>
              <p><strong>Limitaciones:</strong> Solo datos planos (no anidados)</p>
            </div>

            <div className={styles.formatCard}>
              <h4>📗 Excel (.xlsx)</h4>
              <p><strong>Mejor para:</strong> Informes, compartir con usuarios no técnicos</p>
              <p><strong>Ventajas:</strong> Formatos, fórmulas, múltiples hojas</p>
              <p><strong>Limitaciones:</strong> Archivos más pesados, requiere software</p>
            </div>

            <div className={styles.formatCard}>
              <h4>📄 XML (eXtensible Markup Language)</h4>
              <p><strong>Mejor para:</strong> Configuraciones, intercambio entre sistemas legacy</p>
              <p><strong>Ventajas:</strong> Muy estructurado, validación con esquemas</p>
              <p><strong>Limitaciones:</strong> Verbose, más pesado que JSON</p>
            </div>

            <div className={styles.formatCard}>
              <h4>⚙️ YAML (YAML Ain&apos;t Markup Language)</h4>
              <p><strong>Mejor para:</strong> Configuraciones (Docker, Kubernetes, CI/CD)</p>
              <p><strong>Ventajas:</strong> Muy legible, soporta comentarios</p>
              <p><strong>Limitaciones:</strong> Sensible a indentación</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Mis datos son seguros?</h4>
              <p>
                Sí, 100%. Todo el procesamiento ocurre en tu navegador usando JavaScript.
                Tus archivos nunca se envían a ningún servidor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Hay límite de tamaño?</h4>
              <p>
                No hay límite fijo, pero archivos muy grandes (más de 50 MB) pueden
                ralentizar tu navegador. Para archivos enormes, considera herramientas de línea de comandos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo convertir JSON a Google Sheets?</h4>
              <p>
                Sí. Convierte tu JSON a CSV, descarga el archivo, y en Google Sheets
                usa Archivo → Importar para cargarlo directamente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa con datos anidados?</h4>
              <p>
                Los datos anidados (objetos dentro de objetos) se aplanan al convertir a CSV.
                Para preservar la estructura, usa JSON, XML o YAML.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-formatos')} />

      <Footer appName="conversor-formatos" />
    </div>
  );
}
