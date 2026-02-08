'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './ConversorFormatos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
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
        complete: (results: { data: Record<string, unknown>[] }) => {
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

      <LegalNotice />

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

      {/* Contenido educativo profesional */}
      <EducationalSection
        title="📚 ¿Quieres dominar la conversión de formatos de datos?"
        subtitle="Descubre cuándo usar cada formato, casos de uso reales y mejores prácticas profesionales"
        icon="📚"
      >
        {/* Introducción */}
        <section className={styles.guideSection}>
          <h2>¿Por qué convertir entre formatos de datos?</h2>
          <p className={styles.introParagraph}>
            En el mundo profesional, los datos viajan entre sistemas, equipos y herramientas. Un mismo
            dataset puede originarse en Excel (marketing), procesarse en Python (data science), enviarse
            via API REST (JSON) y finalmente consumirse en Tableau (CSV). Dominar la conversión de formatos
            elimina cuellos de botella, reduce errores manuales y hace tu workflow más eficiente.
          </p>
        </section>

        {/* Tabla Comparativa de 6 Formatos */}
        <section className={styles.comparativaSection}>
          <h2>Tabla Comparativa: Los 6 Formatos Esenciales</h2>
          <p className={styles.comparativaSubtitle}>
            ¿Cuál usar en cada contexto? Compara ventajas y limitaciones técnicas.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>JSON</th>
                  <th>CSV</th>
                  <th>Excel</th>
                  <th>XML</th>
                  <th>YAML</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Legibilidad humana</strong></td>
                  <td>Alta (sintaxis limpia)</td>
                  <td>Alta (simple)</td>
                  <td>Media (requiere software)</td>
                  <td>Baja (verbose)</td>
                  <td>Muy alta (indentación)</td>
                </tr>
                <tr>
                  <td><strong>Uso principal</strong></td>
                  <td>APIs REST, configs web</td>
                  <td>Excel, análisis, bases datos</td>
                  <td>Informes, presentaciones</td>
                  <td>SOAP, sistemas legacy</td>
                  <td>DevOps (Docker, K8s, CI/CD)</td>
                </tr>
                <tr>
                  <td><strong>Datos anidados</strong></td>
                  <td>✅ Nativo</td>
                  <td>❌ Se aplanan</td>
                  <td>⚠️ Limitado (múltiples hojas)</td>
                  <td>✅ Nativo</td>
                  <td>✅ Nativo</td>
                </tr>
                <tr>
                  <td><strong>Tamaño archivo</strong></td>
                  <td>Compacto (~100 KB)</td>
                  <td>Muy compacto (~50 KB)</td>
                  <td>Pesado (~200 KB+)</td>
                  <td>Pesado (~150 KB)</td>
                  <td>Compacto (~80 KB)</td>
                </tr>
                <tr>
                  <td><strong>Compatibilidad</strong></td>
                  <td>Universal (web, móvil, APIs)</td>
                  <td>Universal (Excel, Sheets, BD)</td>
                  <td>Excel, LibreOffice, Google Sheets</td>
                  <td>Sistemas enterprise, SOAP</td>
                  <td>DevOps, programación</td>
                </tr>
                <tr>
                  <td><strong>Validación</strong></td>
                  <td>JSON Schema</td>
                  <td>❌ Sin estándar</td>
                  <td>Validación de celdas</td>
                  <td>XSD, DTD</td>
                  <td>❌ Sin estándar oficial</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso Reales */}
        <section className={styles.escenariosSection}>
          <h2>Casos de Uso Profesionales</h2>
          <p className={styles.escenariosSubtitle}>
            Escenarios reales donde convertir formatos resuelve problemas críticos
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📊</span>
                <h3>JSON → CSV: Análisis en Excel/Google Sheets</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Escenario:</strong></p>
                <code>Tu API devuelve JSON con ventas mensuales. Marketing necesita visualizarlo en Excel.</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> CSV es el formato universal para hojas de cálculo.
                Excel/Sheets importan CSV sin configuración. Los stakeholders no técnicos pueden analizar
                datos con tablas dinámicas, gráficos y fórmulas. <strong>Tip:</strong> Si tu JSON tiene
                objetos anidados, aplánalo primero o perderás datos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔌</span>
                <h3>CSV → JSON: Alimentar APIs y Apps Web</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Escenario:</strong></p>
                <code>Tienes un CSV con productos. Necesitas exponerlos via API REST para tu e-commerce.</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> JSON es el estándar de facto para APIs modernas (REST, GraphQL).
                Frontend frameworks (React, Vue) parsean JSON nativamente. Convertir CSV → JSON permite
                automatizar la carga de datos a tu API. <strong>Cuidado:</strong> Valida tipos de datos
                (números, fechas) tras conversión - CSV guarda todo como texto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚙️</span>
                <h3>Excel → JSON: Procesamiento Automatizado</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Escenario:</strong></p>
                <code>Recibes Excel con inventario semanal. Necesitas procesarlo con Python/Node.js.</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Lenguajes de programación (Python, JavaScript) trabajan
                mejor con JSON que con Excel binario. Convertir Excel → JSON permite scripts automatizados
                sin dependencias de librerías pesadas (openpyxl, pandas). <strong>Limitación:</strong>
                Se pierden fórmulas, formatos y gráficos - solo se extraen valores.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🐳</span>
                <h3>JSON → YAML: Configs DevOps (Docker, K8s)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Escenario:</strong></p>
                <code>Generas configuraciones en JSON. Tu equipo usa Docker Compose (requiere YAML).</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> YAML es el formato estándar para DevOps (Docker Compose,
                Kubernetes, GitHub Actions, Ansible). Es más legible que JSON para configs grandes porque
                evita llaves y comas. <strong>Ventaja extra:</strong> YAML soporta comentarios - documenta
                tus configs inline sin romper la sintaxis.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📈</span>
                <h3>CSV → Excel: Informes con Formato Profesional</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Escenario:</strong></p>
                <code>Exportas datos crudos a CSV. Necesitas entregarlos con formato a dirección.</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Excel permite aplicar formatos (colores, bordes, negritas),
                fórmulas automáticas (SUM, AVERAGE) y gráficos. Un informe CSV raw es difícil de leer;
                en Excel puedes resaltar KPIs, añadir totales y crear dashboards. <strong>Workflow:</strong>
                Convierte CSV → Excel, aplica formato manualmente, guarda como template para futuros informes.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔄</span>
                <h3>XML → JSON: Modernizar APIs Legacy</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Escenario:</strong></p>
                <code>Tu backend legacy devuelve SOAP/XML. Tu frontend React necesita JSON.</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> XML (SOAP) se usa en sistemas antiguos (bancos, gobierno,
                SAP). Convertir XML → JSON en un middleware permite que frontends modernos consuman datos
                sin reescribir todo el backend. <strong>Arquitectura:</strong> API Gateway convierte
                XML legacy → JSON → Frontend. Migración gradual sin downtime.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Ampliado */}
        <section className={styles.faqSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Se pierden datos al convertir entre formatos?</h4>
              <p>
                Depende de la conversión. <strong>Conversiones sin pérdida:</strong> JSON ↔ XML ↔ YAML
                (todos soportan estructuras anidadas). <strong>Conversiones con pérdida potencial:</strong>
                Cualquier formato → CSV (se aplanan objetos anidados), Excel → JSON (se pierden fórmulas,
                formatos, gráficos - solo valores).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla práctica:</strong> Si tu formato destino es menos expresivo que el origen,
                habrá pérdida. CSV es el menos expresivo (solo tablas planas). JSON/XML/YAML preservan
                estructuras complejas. Siempre guarda backup del archivo original antes de convertir.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué pasa con los datos anidados al convertir a CSV?</h4>
              <p>
                CSV NO soporta anidación. Los objetos anidados se <strong>aplanan</strong> o <strong>serializan
                como strings</strong>. Ejemplo: un JSON con <code>{`{usuario: {nombre: "Ana", edad: 30}}`}</code>
                puede aplanarse a columnas <code>usuario_nombre</code>, <code>usuario_edad</code> o convertirse
                a string <code>{`{nombre:Ana,edad:30}`}</code>.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Solución:</strong> Esta herramienta aplana automáticamente al convertir a CSV.
                Si necesitas preservar estructura anidada, usa JSON, XML o YAML. Para análisis en Excel
                de datos complejos, considera aplanar manualmente en JSON primero para controlar cómo se
                estructuran las columnas.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo convertir archivos Excel con fórmulas?</h4>
              <p>
                Sí, pero <strong>solo se convierten los valores calculados</strong>, NO las fórmulas.
                Si tu Excel tiene <code>=SUMA(A1:A10)</code>, el resultado (ej: 150) se convierte, pero
                la fórmula se pierde. Esto aplica a todos los formatos destino (JSON, CSV, XML, YAML).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Workaround:</strong> Si necesitas las fórmulas, NO uses conversión automatizada.
                Para datos calculados (subtotales, KPIs), esto es exactamente lo que quieres - los valores
                finales. Para preservar lógica de cálculo, documenta fórmulas en otra hoja/archivo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo manejar caracteres especiales (ñ, á, €) correctamente?</h4>
              <p>
                Usa <strong>UTF-8 encoding</strong> siempre. Problema común: abrir CSV en Excel con
                caracteres raros (�, Ã±). Causa: Excel asume Latin-1 (ISO-8859-1) por defecto en Windows.
                Esta herramienta genera UTF-8 correctamente, pero Excel puede malinterpretarlo.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Solución Excel:</strong> No abrir CSV con doble clic. Ir a Datos → Desde texto/CSV
                → Seleccionar archivo → Elegir encoding UTF-8 → Cargar. Alternativa: Guarda directamente
                como Excel (.xlsx) desde esta herramienta - el encoding se preserva automáticamente.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Hay límite de tamaño en las conversiones?</h4>
              <p>
                No hay límite fijo impuesto por la herramienta. El límite es tu navegador (RAM disponible).
                <strong>Archivos típicos:</strong> Hasta 50 MB funcionan bien (~500k filas CSV). <strong>Archivos
                grandes:</strong> 50-200 MB pueden ralentizarse. <strong>Archivos enormes:</strong> Más de 200 MB
                pueden causar out of memory.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Para archivos gigantes:</strong> Usa herramientas de línea de comandos (Python
                pandas, <code>jq</code> para JSON, <code>csvkit</code> para CSV). También considera si
                realmente necesitas procesar TODO el archivo - puedes dividirlo en chunks más pequeños
                o filtrar datos innecesarios antes de convertir.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Mis datos son 100% privados? ¿Se envían a un servidor?</h4>
              <p>
                <strong>100% privado, garantizado.</strong> Todo el procesamiento ocurre en tu navegador
                usando JavaScript (librerías: PapaParse para CSV, SheetJS para Excel, js-yaml para YAML).
                Tus archivos NUNCA salen de tu dispositivo. No tenemos servidor backend que procese datos -
                es técnicamente imposible que veamos tu información.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Ventaja adicional:</strong> Funciona offline después de cargar la página (service
                workers). Puedes procesar datos confidenciales (nóminas, contratos, datos médicos) sin
                preocuparte por seguridad. Para paranoia máxima: desconecta WiFi y verifica que sigue
                funcionando.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo automatizar conversiones en mi flujo de trabajo?</h4>
              <p>
                Esta herramienta es manual (UI web). Para automatización, necesitas scripts. <strong>Opciones
                profesionales:</strong> (1) Python con pandas: <code>df.to_csv()</code>, <code>df.to_json()</code>,
                (2) Node.js con PapaParse/SheetJS, (3) Bash con <code>jq</code> (JSON) y <code>csvkit</code> (CSV).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Cuando automatizar:</strong> Si conviertes el mismo tipo de archivo más de 5 veces
                al mes, escribe un script. Ejemplo: cron job que convierte Excel semanal → JSON → API.
                Para conversiones one-off o poco frecuentes, esta herramienta web es más rápida que escribir
                código.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué formato debo elegir para mi proyecto?</h4>
              <p>
                <strong>Depende de tu audiencia y caso de uso:</strong> Usa <strong>JSON</strong> para APIs
                y desarrollo web. Usa <strong>CSV</strong> para análisis en Excel/Sheets y bases de datos.
                Usa <strong>Excel</strong> para informes a stakeholders no técnicos. Usa <strong>XML</strong>
                solo si integras con sistemas legacy (SOAP) o necesitas validación estricta. Usa <strong>YAML</strong>
                para configuraciones DevOps.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla de oro:</strong> Elige el formato que tu audiencia/sistema CONSUME, no el
                que tú prefieres. Si entregas a marketing: Excel. Si alimentas una API: JSON. Si despliegas
                en Kubernetes: YAML. Si importas a base de datos: CSV. El formato es un medio, no un fin.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Conversión Profesional</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Carga tu archivo (drag & drop o clic)</h4>
                <p>
                  Arrastra tu archivo JSON, CSV, Excel, XML o YAML a la zona de carga, o haz clic para
                  seleccionar. <strong>Formatos aceptados:</strong> .json, .csv, .tsv, .xlsx, .xls, .xml,
                  .yaml, .yml. <strong>No necesitas preparar el archivo</strong> - la herramienta detecta
                  formato automáticamente por la extensión.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Verifica la vista previa de datos</h4>
                <p>
                  Tras cargar, aparece una tabla con las primeras 5 filas y hasta 8 columnas. <strong>Revisa
                  que los datos se parsearon correctamente:</strong> Nombres de columnas, tipos de valores,
                  estructura general. Si ves errores o datos raros, tu archivo original puede tener problemas
                  de encoding o formato - corrígelo antes de convertir.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Selecciona el formato de destino</h4>
                <p>
                  Haz clic en uno de los 6 formatos disponibles (JSON, CSV, TSV, Excel, XML, YAML). El formato
                  origen aparece deshabilitado (no puedes convertir JSON → JSON). <strong>La herramienta
                  auto-selecciona un destino inteligente</strong> (ej: JSON → CSV) pero puedes cambiarlo.
                  Considera tu caso de uso (ver tabla comparativa arriba).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Configura opciones avanzadas (opcional)</h4>
                <p>
                  Según el formato destino, aparecen opciones configurables: <strong>CSV/TSV:</strong>
                  Incluir encabezados, entrecomillar valores. <strong>JSON:</strong> Indentación (compacto,
                  2 espacios, 4 espacios). <strong>XML:</strong> Nombre del elemento raíz. <strong>Default
                  settings son óptimas</strong> para el 90% de casos - solo ajusta si tienes requisitos específicos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Ejecuta la conversión</h4>
                <p>
                  Haz clic en el botón grande <strong>&quot;Convertir a [Formato]&quot;</strong>. El proceso es
                  instantáneo para archivos típicos (menos de 10 MB). <strong>Si hay error</strong>, verás
                  mensaje específico - problema común: datos corruptos o encoding incorrecto. Para archivos
                  grandes (más de 50 MB) puede tardar 5-10 segundos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Descarga o copia el resultado</h4>
                <p>
                  Tras conversión exitosa, aparecen dos botones: <strong>Copiar</strong> (portapapeles,
                  solo formatos texto) y <strong>Descargar</strong> (archivo con nombre auto-generado
                  <code>original_converted.ext</code>). Para Excel (.xlsx), solo descarga está disponible
                  (es binario). <strong>Verifica el archivo descargado</strong> antes de usarlo en producción.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Integra en tu flujo de trabajo</h4>
                <p>
                  <strong>Workflow recomendado para conversiones recurrentes:</strong> (1) Convierte un
                  archivo de ejemplo para validar formato, (2) Documenta pasos y opciones usadas, (3) Si
                  se repite más de 5 veces/mes, automatiza con script (Python/Node.js), (4) Para conversiones
                  one-off, usa esta herramienta directamente. <strong>Guarda templates</strong> de archivos
                  destino exitosos para referencia futura.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.tipsSection}>
          <h2>Mejores Prácticas Profesionales</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Valida datos ANTES de convertir</h4>
              <p>
                Usa herramientas como Validador JSON (meskeIA) o linters para verificar que tu archivo
                origen es sintácticamente correcto. Un JSON inválido produce CSV corrupto.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Backup obligatorio antes de conversiones masivas</h4>
              <p>
                Siempre guarda una copia del archivo original antes de convertir. Las conversiones
                con pérdida (Excel → CSV) son irreversibles sin el backup.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Usa UTF-8 para internacionalización</h4>
              <p>
                Siempre trabaja en UTF-8 encoding. Evita problemas con caracteres especiales (ñ, á, €).
                Esta herramienta genera UTF-8 por defecto - verifica que tu software destino lo respeta.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Elige formato según audiencia, no preferencia</h4>
              <p>
                Stakeholders no técnicos: Excel. Desarrolladores: JSON. Data analysts: CSV. DevOps: YAML.
                El formato es para quien LO CONSUME, no para ti.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Automatiza conversiones recurrentes con scripts</h4>
              <p>
                Si conviertes el mismo archivo más de 5 veces/mes, escribe un script (Python pandas, Node.js).
                Ahorra tiempo y reduce errores manuales. Esta herramienta es para one-off.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Mantén formatos fuente editables</h4>
              <p>
                Nunca edites archivos convertidos como fuente de verdad. Edita en el formato original
                (ej: Excel) y reconvierte. Evita pérdida de datos y confusión de versiones.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores Comunes que Rompen Conversiones</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ Perder datos anidados al convertir a CSV:</strong> CSV es plano (2D). Convertir
              JSON/XML con objetos anidados a CSV aplana estructura - puedes perder jerarquía. Ejemplo:
              <code>{`{usuario: {nombre: "Ana"}}`}</code> se convierte a <code>usuario_nombre: Ana</code>.
              <br/>
              <strong>Solución:</strong> Si necesitas preservar anidación, usa JSON, XML o YAML. Para CSV,
              aplana manualmente en origen antes de convertir para controlar cómo se estructuran columnas.
            </li>

            <li>
              <strong>❌ Encoding incorrecto causa mojibake (caracteres raros):</strong> Abrir CSV UTF-8
              en Excel con doble clic asume Latin-1 → <code>España</code> se ve como <code>EspaÃ±a</code>.
              Problema común en Windows.
              <br/>
              <strong>Solución:</strong> En Excel, usa Datos → Desde texto/CSV → Seleccionar UTF-8 manualmente.
              O convierte a .xlsx directamente (el encoding binario se preserva). NUNCA guardes CSV en Excel
              sin verificar encoding - puede romper datos.
            </li>

            <li>
              <strong>❌ Formato de fechas inconsistente entre sistemas:</strong> Excel interpreta
              <code>01/02/2023</code> como 1 Feb (UK) o 2 Ene (US) según locale. JSON no tiene tipo fecha
              nativo - se usa string ISO <code>2023-02-01T00:00:00Z</code>.
              <br/>
              <strong>Solución:</strong> Siempre usa formato ISO 8601 (<code>YYYY-MM-DD</code>) en CSV/JSON.
              En Excel, formatea celdas como texto para evitar conversiones automáticas. Documenta formato
              de fecha en README si compartes archivos.
            </li>

            <li>
              <strong>❌ Comas dentro de valores CSV sin entrecomillar:</strong> Si tu CSV tiene valores
              como <code>Madrid, España</code> sin comillas, el parser interpreta como dos columnas separadas.
              Rompe la estructura.
              <br/>
              <strong>Solución:</strong> Esta herramienta entrecomilla automáticamente valores con comas,
              saltos de línea o comillas (configurable). Si parseas CSV manualmente, activa opción
              <code>quotes: true</code>. Para datos con comas frecuentes, considera TSV (tab-separated).
            </li>

            <li>
              <strong>❌ Caracteres especiales XML sin escapar:</strong> XML requiere escapar <code>&lt;</code>
              <code>&gt;</code> <code>&amp;</code> <code>&quot;</code> <code>&apos;</code>. Si tu JSON tiene
              <code>{`{msg: "5 < 10"}`}</code> y conviertes a XML sin escapar, el parser falla.
              <br/>
              <strong>Solución:</strong> Esta herramienta escapa automáticamente. Si generas XML manualmente,
              usa funciones escape de tu lenguaje o librerías (xml2js, lxml). NUNCA concatenes strings
              para formar XML - siempre usa builders.
            </li>

            <li>
              <strong>❌ Fórmulas Excel se convierten a valores estáticos:</strong> Si tu Excel tiene
              <code>=SUMA(A1:A10)</code> con resultado 150, al convertir a JSON/CSV solo obtienes <code>150</code>.
              La fórmula se pierde PERMANENTEMENTE.
              <br/>
              <strong>Solución:</strong> Si necesitas preservar fórmulas, NO conviertas - trabaja en Excel
              nativo. Para datos calculados (totales, KPIs), esto es exactamente lo esperado. Documenta
              fórmulas críticas en otra hoja antes de convertir.
            </li>

            <li>
              <strong>❌ Headers duplicados en CSV causan sobrescritura:</strong> Si tu CSV tiene dos
              columnas llamadas <code>nombre</code>, el parser JSON solo guarda la última. Pierdes datos
              silenciosamente.
              <br/>
              <strong>Solución:</strong> Renombra columnas duplicadas en origen antes de convertir (ej:
              <code>nombre_1</code>, <code>nombre_2</code>). O verifica que tu herramienta auto-renombra
              duplicados. Esta herramienta preserva todas las columnas pero puede haber conflictos.
            </li>

            <li>
              <strong>❌ XML sin declaración UTF-8 rompe caracteres especiales:</strong> Si omites
              <code>&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</code> y tienes ñ, á, €,
              parsers antiguos asumen ASCII → text corruption.
              <br/>
              <strong>Solución:</strong> Esta herramienta añade la declaración automáticamente. Si generas
              XML manualmente, SIEMPRE incluye encoding UTF-8 en primera línea. Es obligatorio para
              compatibilidad internacional y previene bugs difíciles de rastrear.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-formatos')} />

      <Footer appName="conversor-formatos" />
    </div>
  );
}
