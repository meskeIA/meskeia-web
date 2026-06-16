'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef } from 'react';
import styles from './ConversorBase64.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TabType = 'texto' | 'imagen' | 'archivo';

export default function ConversorBase64Page() {
  const [activeTab, setActiveTab] = useState<TabType>('texto');
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageInfo, setImageInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [fileBase64, setFileBase64] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Texto
  const encodeText = useCallback(() => {
    setError('');
    if (!textInput.trim()) {
      setError('Introduce texto para codificar');
      return;
    }
    try {
      const encoded = btoa(unescape(encodeURIComponent(textInput)));
      setTextOutput(encoded);
    } catch {
      setError('Error al codificar el texto');
    }
  }, [textInput]);

  const decodeText = useCallback(() => {
    setError('');
    if (!textInput.trim()) {
      setError('Introduce texto Base64 para decodificar');
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(textInput)));
      setTextOutput(decoded);
    } catch {
      setError('El texto no es Base64 válido');
    }
  }, [textInput]);

  // Imagen
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen');
      return;
    }

    setImageInfo({ name: file.name, size: file.size, type: file.type });

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Archivo
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 5MB)');
      return;
    }

    setFileInfo({ name: file.name, size: file.size, type: file.type });

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleClear = useCallback(() => {
    setTextInput('');
    setTextOutput('');
    setImageBase64('');
    setImagePreview('');
    setImageInfo(null);
    setFileBase64('');
    setFileInfo(null);
    setError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCurrentOutput = (): string => {
    switch (activeTab) {
      case 'texto': return textOutput;
      case 'imagen': return imageBase64;
      case 'archivo': return fileBase64;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor Base64</h1>
        <p className={styles.subtitle}>Codifica y decodifica texto, imágenes y archivos</p>
      </header>

      <LegalNotice />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'texto' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('texto')}
          aria-pressed={activeTab === 'texto'}
        >
          <span className={styles.tabIcon}>Aa</span>
          Texto
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'imagen' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('imagen')}
          aria-pressed={activeTab === 'imagen'}
        >
          <span className={styles.tabIcon} aria-hidden="true">🖼️</span>
          Imagen
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'archivo' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('archivo')}
          aria-pressed={activeTab === 'archivo'}
        >
          <span className={styles.tabIcon} aria-hidden="true">📄</span>
          Archivo
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Tab Texto */}
        {activeTab === 'texto' && (
          <>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Texto de entrada</h2>
              <textarea
                className={styles.textarea}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Escribe o pega el texto aquí..."
              />
              <div className={styles.actions}>
                <button type="button" onClick={encodeText} className={styles.btnPrimary}>
                  Codificar a Base64
                </button>
                <button type="button" onClick={decodeText} className={styles.btnSecondary}>
                  Decodificar Base64
                </button>
                <button type="button" onClick={handleClear} className={styles.btnSecondary}>
                  Limpiar
                </button>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Resultado</h2>
                <button
                  type="button"
                  onClick={() => handleCopy(textOutput)}
                  className={styles.copyBtn}
                  disabled={!textOutput}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <textarea
                className={styles.textarea}
                value={textOutput}
                readOnly
                placeholder="El resultado aparecerá aquí..."
              />
              {textOutput && (
                <div className={styles.stats}>
                  <span>Entrada: {textInput.length} caracteres</span>
                  <span>Salida: {textOutput.length} caracteres</span>
                  <span>
                    {textOutput.length > textInput.length ? '+' : ''}
                    {((textOutput.length / textInput.length - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab Imagen */}
        {activeTab === 'imagen' && (
          <>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Subir imagen</h2>
              <div
                className={styles.dropZone}
                onClick={() => imageInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                ) : (
                  <>
                    <span className={styles.dropIcon}>🖼️</span>
                    <p>Haz clic o arrastra una imagen aquí</p>
                    <span className={styles.dropHint}>PNG, JPG, GIF, WebP, SVG</span>
                  </>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                />
              </div>
              {imageInfo && (
                <div className={styles.fileInfo}>
                  <span>{imageInfo.name}</span>
                  <span>{formatSize(imageInfo.size)}</span>
                  <span>{imageInfo.type}</span>
                </div>
              )}
              <button type="button" onClick={handleClear} className={styles.btnSecondary} style={{ marginTop: '1rem' }}>
                Limpiar
              </button>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Base64 / Data URI</h2>
                <button
                  type="button"
                  onClick={() => handleCopy(imageBase64)}
                  className={styles.copyBtn}
                  disabled={!imageBase64}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <textarea
                className={styles.textarea}
                value={imageBase64}
                readOnly
                placeholder="El código Base64 aparecerá aquí..."
              />
              {imageBase64 && imageInfo && (
                <div className={styles.stats}>
                  <span>Original: {formatSize(imageInfo.size)}</span>
                  <span>Base64: {formatSize(imageBase64.length)}</span>
                  <span>+{((imageBase64.length / imageInfo.size - 1) * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab Archivo */}
        {activeTab === 'archivo' && (
          <>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Subir archivo</h2>
              <div
                className={styles.dropZone}
                onClick={() => fileInputRef.current?.click()}
              >
                {fileInfo ? (
                  <div className={styles.fileUploaded}>
                    <span className={styles.dropIcon}>📄</span>
                    <p>{fileInfo.name}</p>
                  </div>
                ) : (
                  <>
                    <span className={styles.dropIcon}>📁</span>
                    <p>Haz clic o arrastra un archivo aquí</p>
                    <span className={styles.dropHint}>Máximo 5MB</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                />
              </div>
              {fileInfo && (
                <div className={styles.fileInfo}>
                  <span>{fileInfo.name}</span>
                  <span>{formatSize(fileInfo.size)}</span>
                  <span>{fileInfo.type || 'Desconocido'}</span>
                </div>
              )}
              <button type="button" onClick={handleClear} className={styles.btnSecondary} style={{ marginTop: '1rem' }}>
                Limpiar
              </button>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Base64 / Data URI</h2>
                <button
                  type="button"
                  onClick={() => handleCopy(fileBase64)}
                  className={styles.copyBtn}
                  disabled={!fileBase64}
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <textarea
                className={styles.textarea}
                value={fileBase64}
                readOnly
                placeholder="El código Base64 aparecerá aquí..."
              />
              {fileBase64 && fileInfo && (
                <div className={styles.stats}>
                  <span>Original: {formatSize(fileInfo.size)}</span>
                  <span>Base64: {formatSize(fileBase64.length)}</span>
                  <span>+{((fileBase64.length / fileInfo.size - 1) * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <EducationalSection
        title="Aprende sobre Base64 y Codificación de Datos"
        subtitle="Historia, estándares y aplicaciones prácticas de la codificación Base64 en desarrollo web"
        icon="🔐"
      >
        {/* 1. Tabla Comparativa */}
        <div className={styles.tableWrapper}>
          <h3 className={styles.eduSectionTitle}>📊 Comparativa de Variantes de Base64 y Esquemas Relacionados</h3>
          <div className={styles.comparativaTable}>
            <table>
              <thead>
                <tr>
                  <th>Esquema</th>
                  <th>Caracteres usados</th>
                  <th>Overhead</th>
                  <th>Casos de uso</th>
                  <th>Padding</th>
                  <th>Limitaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Base64 estándar (RFC 4648)</strong></td>
                  <td>A–Z, a–z, 0–9, +, /</td>
                  <td>+33%</td>
                  <td>Email MIME, adjuntos, datos binarios generales</td>
                  <td>= (obligatorio)</td>
                  <td>+ y / rompen URLs; no válido en nombres de archivo</td>
                </tr>
                <tr>
                  <td><strong>Base64 URL-safe</strong></td>
                  <td>A–Z, a–z, 0–9, -, _</td>
                  <td>+33%</td>
                  <td>JWT, parámetros URL, cookies, OAuth tokens</td>
                  <td>= (opcional, suele omitirse)</td>
                  <td>Incompatible con decodificadores estándar sin conversión previa</td>
                </tr>
                <tr>
                  <td><strong>Base64 MIME/email</strong></td>
                  <td>A–Z, a–z, 0–9, +, /</td>
                  <td>+33%</td>
                  <td>Adjuntos de correo, Content-Transfer-Encoding</td>
                  <td>= (obligatorio) + saltos de línea cada 76 chars</td>
                  <td>Saltos de línea obligatorios; mayor tamaño real en email</td>
                </tr>
                <tr>
                  <td><strong>Base32</strong></td>
                  <td>A–Z, 2–7 (32 caracteres)</td>
                  <td>+60%</td>
                  <td>TOTP/2FA, códigos que el usuario transcribe en voz alta</td>
                  <td>= (obligatorio)</td>
                  <td>Overhead muy alto; solo útil cuando la legibilidad humana importa</td>
                </tr>
                <tr>
                  <td><strong>Base58 (Bitcoin)</strong></td>
                  <td>Sin 0, O, I, l (para evitar confusiones)</td>
                  <td>+37%</td>
                  <td>Direcciones Bitcoin, hashes IPFS, identificadores legibles</td>
                  <td>No tiene</td>
                  <td>No estándar RFC; implementaciones propietarias; sin padding</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Casos de Uso — 4 perfiles */}
        <div className={styles.escenariosGrid}>
          <h3 className={styles.eduSectionTitle}>🎯 ¿Quién usa Base64 y para qué?</h3>
          <div className={styles.escenariosGridInner}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌐</span>
                <h4>Desarrollador web — Data URLs</h4>
              </div>
              <p>Incrusta iconos pequeños (&lt;5 KB) directamente en CSS/HTML como Data URLs para eliminar peticiones HTTP adicionales. Ideal para el logo del favicon o iconos SVG críticos above-the-fold.</p>
              <p className={styles.escenarioExample}><code>background: url(&apos;data:image/svg+xml;base64,...&apos;)</code></p>
              <p className={styles.escenarioTip}>Tip: Por encima de 5 KB, un archivo externo cacheado siempre será más eficiente.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔑</span>
                <h4>Backend — Tokens JWT para APIs</h4>
              </div>
              <p>Codifica el header y el payload de los JWT en Base64url para que puedan viajar de forma segura en cabeceras HTTP Authorization, parámetros de URL y cookies sin necesidad de percent-encoding.</p>
              <p className={styles.escenarioExample}><code>Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...</code></p>
              <p className={styles.escenarioTip}>Recuerda: Base64url NO es cifrado. Cualquiera puede decodificar el payload; la seguridad la da la firma HMAC.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🖥️</span>
                <h4>Sysadmin — Transferencia de binarios</h4>
              </div>
              <p>Transfiere archivos binarios (certificados, claves, configuraciones) a través de protocolos que solo aceptan texto (SMTP, XML, variables de entorno en CI/CD, secretos de Kubernetes).</p>
              <p className={styles.escenarioExample}><code>base64 certificado.pem | kubectl create secret generic...</code></p>
              <p className={styles.escenarioTip}>En pipelines CI/CD, los secretos binarios como certificados TLS se almacenan habitualmente como Base64 en variables de entorno.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
                <h4>Móvil — Serialización para APIs REST</h4>
              </div>
              <p>Serializa imágenes de perfil, firmas digitales o documentos escaneados dentro de payloads JSON para APIs REST que no admiten multipart. Habitual en apps de banca móvil y OCR.</p>
              <p className={styles.escenarioExample}><code>{`{ "foto": "data:image/jpeg;base64,/9j/4AAQ..." }`}</code></p>
              <p className={styles.escenarioTip}>Para imágenes grandes (&gt;100 KB), valora subir el archivo a un bucket (S3/R2) y enviar solo la URL en el JSON.</p>
            </div>
          </div>
        </div>

        {/* 3. FAQ — 8 preguntas */}
        <div className={styles.faqList}>
          <h3 className={styles.eduSectionTitle}>❓ Preguntas Frecuentes sobre Base64</h3>
          <div className={styles.faqListInner}>
            <details className={styles.faqItem}>
              <summary>¿Qué es Base64 y para qué sirve exactamente?</summary>
              <div>
                <p>Base64 es un sistema de codificación que convierte datos binarios arbitrarios en una cadena de caracteres ASCII imprimibles. Su utilidad principal es permitir que datos binarios (imágenes, PDFs, claves) puedan viajar por canales que solo admiten texto, como el protocolo SMTP del correo electrónico, atributos HTML o cuerpos JSON.</p>
                <p className={styles.faqTip}>Creado en los años 80 para el protocolo MIME, sigue siendo el estándar universal para incrustar binarios en texto.</p>
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Base64 es cifrado? ¿Protege mis datos?</summary>
              <div>
                <p>No. Base64 es una codificación reversible que cualquiera puede deshacer en milisegundos sin necesitar ninguna clave. No añade ninguna capa de seguridad o privacidad. Para proteger datos usa cifrado real (AES-256, RSA) o hashing con sal (bcrypt, Argon2) según el caso.</p>
                <p className={styles.faqTip}>Un error muy frecuente: ocultar datos sensibles en Base64 creyendo que están &quot;codificados&quot;. No lo están; solo están ofuscados.</p>
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuánto aumenta el tamaño al codificar en Base64?</summary>
              <div>
                <p>Exactamente un 33,33%. Base64 convierte cada 3 bytes originales en 4 caracteres ASCII (cada carácter representa 6 bits, no 8). Además, puede añadir 1 o 2 caracteres = de padding si los datos no son múltiplos de 3 bytes. En archivos reales el overhead real es siempre entre 33% y 37%.</p>
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuándo usar Base64 vs URL encoding (%20, %2F...)?</summary>
              <div>
                <p>Usa <strong>Base64url</strong> cuando necesites codificar datos binarios (como un hash o un token de 32 bytes) en una URL. Usa <strong>URL encoding</strong> cuando necesites escapar texto plano con caracteres especiales (espacios, tildes) en una URL. Son herramientas para propósitos distintos: Base64 convierte binario a texto; URL encoding escapa caracteres especiales en texto ya legible.</p>
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué es un JWT y cómo usa Base64?</summary>
              <div>
                <p>Un JSON Web Token (JWT) tiene tres partes separadas por puntos: <code>header.payload.signature</code>. Tanto el header como el payload son objetos JSON codificados en Base64url (no cifrados). La firma es un HMAC o RSA calculado sobre las dos primeras partes. Puedes decodificar el payload sin clave —es público— pero solo el servidor con la clave secreta puede generar y verificar la firma.</p>
                <p className={styles.faqTip}>Decodifica el payload de un JWT con esta misma herramienta: copia la segunda parte (entre los dos puntos) y haz clic en &quot;Decodificar Base64&quot;.</p>
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Por qué Base64 URL-safe elimina los caracteres + y /?</summary>
              <div>
                <p>En las URLs, el carácter + se interpreta como espacio y el / como separador de segmentos de ruta. Si un token Base64 estándar contiene estos caracteres y se incluye en una URL sin escapar, el servidor lo interpretará incorrectamente. Base64url los reemplaza por - y _ respectivamente, que no tienen significado especial en URLs y no necesitan percent-encoding.</p>
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Se puede usar Base64 para almacenar passwords?</summary>
              <div>
                <p>Nunca. Almacenar contraseñas en Base64 es un error de seguridad gravísimo. Como Base64 es 100% reversible, cualquier atacante que acceda a tu base de datos obtendrá las contraseñas en texto plano al instante. Las contraseñas deben procesarse con funciones de hashing específicas y lentas: bcrypt, Argon2id o PBKDF2 con un número de iteraciones alto y un salt único por usuario.</p>
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuándo NO usar Base64?</summary>
              <div>
                <p>Evita Base64 cuando: (1) el archivo supera 10–20 KB (usa multipart/form-data o URLs de objeto en almacenamiento en la nube), (2) los datos ya son texto legible (codificar UTF-8 normal en Base64 es redundante y ocupa más), (3) necesitas caching eficiente (un Data URI no se puede cachear por separado del documento), (4) el rendimiento es crítico (codificar/decodificar Base64 consume CPU adicional), (5) los datos son contraseñas o secretos (ver pregunta anterior).</p>
              </div>
            </details>
          </div>
        </div>

        {/* 4. Guía Paso a Paso — 7 pasos */}
        <div className={styles.stepGuide}>
          <h3 className={styles.eduSectionTitle}>📋 Guía: Cómo usar Base64 correctamente en una aplicación web</h3>
          <ol>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <strong>Evalúa si Base64 es realmente necesario</strong>
                <span>Úsalo solo cuando el canal de destino no admita datos binarios: JSON, XML, atributos HTML, variables de entorno o email SMTP. Si puedes enviar el archivo directamente (formulario multipart, almacenamiento en la nube), es una mejor opción.</span>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <strong>Elige la variante correcta según el destino</strong>
                <span>Base64 estándar para MIME/email. Base64url (sin + ni /) para JWT y parámetros de URL. Base32 para códigos OTP que el usuario transcribirá. La elección incorrecta provoca errores difíciles de depurar.</span>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <strong>Codifica los datos con la API adecuada</strong>
                <span>En el navegador: <code>btoa(texto)</code> para texto Latin-1. Para texto Unicode (tildes, emojis): <code>btoa(unescape(encodeURIComponent(texto)))</code>. En Node.js: <code>Buffer.from(datos).toString(&apos;base64&apos;)</code> para cualquier tipo de dato.</span>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <strong>Para imágenes, usa FileReader.readAsDataURL()</strong>
                <span>Este método devuelve directamente el Data URI completo con el prefijo MIME correcto: <code>data:image/png;base64,iVBORw0KGgo...</code>. Puedes asignarlo directamente a <code>src</code> de una imagen o a <code>background-image</code> en CSS.</span>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <strong>Incluye siempre el prefijo MIME en Data URIs</strong>
                <span>El formato completo es <code>data:[tipo-mime];base64,[datos]</code>. Si omites el prefijo, el navegador no sabrá cómo interpretar los datos. El tipo MIME correcto es esencial para imágenes, PDFs y cualquier otro tipo de archivo.</span>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <strong>Valida y sanitiza antes de decodificar en el servidor</strong>
                <span>Nunca decodifiques Base64 de usuarios sin validar primero: verifica que la cadena tenga caracteres válidos del alfabeto Base64, comprueba los magic bytes del archivo decodificado para confirmar el tipo MIME real, y aplica un límite de tamaño máximo para prevenir ataques de denegación de servicio.</span>
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">7</div>
              <div className={styles.stepContent}>
                <strong>Verifica el resultado con DevTools</strong>
                <span>En Chrome/Firefox, la pestaña Network muestra los payloads Base64 en las peticiones. En la pestaña Sources puedes inspeccionar Data URIs. Para depurar JWTs, copia el payload (segunda sección entre puntos) y decodifícalo directamente en esta herramienta.</span>
              </div>
            </li>
          </ol>
        </div>

        {/* 5. Mejores Prácticas — 6 tips */}
        <div className={styles.tipsGrid}>
          <h3 className={styles.eduSectionTitle}>💡 Mejores Prácticas para Usar Base64</h3>
          <div className={styles.tipsGridInner}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <h4>Usa siempre Base64url en URLs</h4>
              <p>El + y / del Base64 estándar se interpretan como espacio y separador de ruta en URLs. Para tokens, hashes o cualquier dato en parámetros de URL, cookies o cabeceras HTTP usa la variante url-safe (- y _) para evitar errores silenciosos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h4>Limita Data URLs a imágenes menores de 5 KB</h4>
              <p>Por debajo de 5 KB, un Data URI puede ahorrar una petición HTTP. Por encima, el incremento del 33% de tamaño, la imposibilidad de cachear el recurso por separado y el impacto en el parsing del HTML hacen que un archivo estático servido por CDN sea siempre más eficiente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <h4>Documenta explícitamente las cadenas Base64</h4>
              <p>Una cadena Base64 en el código fuente sin comentario es indistinguible de texto aleatorio. Añade siempre un comentario indicando qué tipo de dato contiene, cuándo se generó y con qué variante. Esto ahorra horas de depuración a futuros colaboradores.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <h4>Verifica magic bytes, no solo el tipo MIME declarado</h4>
              <p>El tipo MIME en un Data URI es declarativo: cualquier usuario puede poner <code>data:image/png;base64,</code> seguido de un ejecutable. Tras decodificar en el servidor, verifica los primeros bytes del archivo para confirmar el tipo real antes de procesarlo o almacenarlo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>Prefiere archivos estáticos para imágenes con caché</h4>
              <p>Un archivo <code>.png</code> externo se cachea en el navegador con su propio TTL y se reutiliza en múltiples páginas. Un Data URI se descarga de nuevo con cada documento que lo incluye. Para imágenes que aparecen en varias páginas, el archivo externo es siempre la mejor opción.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <h4>Nunca uses Base64 como sustituto de cifrado</h4>
              <p>Base64 no oculta, no protege ni asegura nada. Si un dato es sensible (contraseñas, claves API, datos personales), aplica cifrado real (AES-256-GCM) o hashing seguro (bcrypt, Argon2id). Base64 es transporte, no seguridad.</p>
            </div>
          </div>
        </div>

        {/* 6. Warning Box — 6 errores críticos */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h4>Errores críticos que debes evitar con Base64</h4>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir Base64 con cifrado o seguridad:</strong> Es el error más peligroso y el más común. Base64 es completamente reversible sin clave. Nunca lo uses para &quot;proteger&quot; datos; usa AES-256, RSA o bcrypt según el caso.</li>
            <li><strong>Usar Base64 estándar en URLs sin escapar:</strong> Los caracteres + y / del Base64 estándar tienen significado especial en URLs. Si incluyes un token Base64 estándar en una URL sin convertirlo a Base64url, obtendrás errores intermitentes difíciles de reproducir.</li>
            <li><strong>Intentar comprimir datos antes de codificar esperando menos tamaño:</strong> La compresión (gzip, deflate) produce datos binarios con alta entropía que Base64 codifica sin reducción alguna. Base64 de datos comprimidos sigue siendo un 33% más grande que los datos originales comprimidos.</li>
            <li><strong>Decodificar Base64 de usuarios sin validar el contenido:</strong> Siempre valida el alfabeto, aplica un límite de tamaño y verifica los magic bytes del resultado. Un payload malformado o malicioso puede causar errores en el servidor o explotar vulnerabilidades en bibliotecas de procesamiento de imágenes.</li>
            <li><strong>Almacenar contraseñas o claves en Base64:</strong> Una base de datos comprometida con contraseñas en Base64 expone todas las contraseñas en texto plano. Usa bcrypt (factor 12+), Argon2id o PBKDF2 con mínimo 600.000 iteraciones para contraseñas.</li>
            <li><strong>Usar Data URIs para imágenes grandes en producción:</strong> Un Data URI de 200 KB incrustado en el CSS bloquea el rendering de la página entera hasta que se descarga el CSS. Además no puede cachearse por separado. Por encima de 5 KB, usa siempre un archivo externo servido desde CDN.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-base64')} />

      <ShareCard appName="conversor-base64" />
      <Footer appName="conversor-base64" />
    </div>
  );
}
