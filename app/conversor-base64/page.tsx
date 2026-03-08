'use client';

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
          className={`${styles.tab} ${activeTab === 'texto' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('texto')}
        >
          <span className={styles.tabIcon}>Aa</span>
          Texto
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'imagen' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('imagen')}
        >
          <span className={styles.tabIcon}>🖼️</span>
          Imagen
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'archivo' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('archivo')}
        >
          <span className={styles.tabIcon}>📄</span>
          Archivo
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span> {error}
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
                <button onClick={encodeText} className={styles.btnPrimary}>
                  Codificar a Base64
                </button>
                <button onClick={decodeText} className={styles.btnSecondary}>
                  Decodificar Base64
                </button>
                <button onClick={handleClear} className={styles.btnSecondary}>
                  Limpiar
                </button>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Resultado</h2>
                <button
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
              <button onClick={handleClear} className={styles.btnSecondary} style={{ marginTop: '1rem' }}>
                Limpiar
              </button>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Base64 / Data URI</h2>
                <button
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
              <button onClick={handleClear} className={styles.btnSecondary} style={{ marginTop: '1rem' }}>
                Limpiar
              </button>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Base64 / Data URI</h2>
                <button
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
        {/* Tabla Comparativa */}
        <div className="edu-table-wrapper">
          <h3 className="edu-section-title">📊 Comparativa de Esquemas de Codificación</h3>
          <div className="edu-table-scroll">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Esquema</th>
                  <th>Alfabeto</th>
                  <th>Overhead</th>
                  <th>Uso principal</th>
                  <th>Padding</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Base64</strong></td>
                  <td>A–Z, a–z, 0–9, +, /</td>
                  <td>+33%</td>
                  <td>Email (MIME), datos generales</td>
                  <td>= (obligatorio)</td>
                </tr>
                <tr>
                  <td><strong>Base64url</strong></td>
                  <td>A–Z, a–z, 0–9, -, _</td>
                  <td>+33%</td>
                  <td>JWT, URLs, cookies</td>
                  <td>= (opcional)</td>
                </tr>
                <tr>
                  <td><strong>Base32</strong></td>
                  <td>A–Z, 2–7</td>
                  <td>+60%</td>
                  <td>TOTP (2FA), códigos legibles</td>
                  <td>= (obligatorio)</td>
                </tr>
                <tr>
                  <td><strong>Base58</strong></td>
                  <td>Sin 0, O, I, l</td>
                  <td>+37%</td>
                  <td>Bitcoin, IPFS</td>
                  <td>No tiene</td>
                </tr>
                <tr>
                  <td><strong>Hexadecimal</strong></td>
                  <td>0–9, A–F</td>
                  <td>+100%</td>
                  <td>Hashes, colores, depuración</td>
                  <td>No tiene</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Casos de Uso */}
        <div className="edu-escenarios-section">
          <h3 className="edu-section-title">🎯 ¿Cuándo usarás Base64?</h3>
          <div className="edu-escenarios-grid">
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🔑</span>
              <h4>JWT Tokens</h4>
              <p>Los JSON Web Tokens usan Base64url para codificar header y payload. Al decodificar un JWT puedes ver los datos del usuario sin necesidad de clave privada (¡recuerda que NO es cifrado!).</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🖼️</span>
              <h4>Imágenes inline en CSS</h4>
              <p>Los Data URIs (data:image/png;base64,...) permiten incrustar iconos pequeños directamente en CSS o HTML, eliminando una petición HTTP. Ideal para iconos SVG y sprites pequeños.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">📧</span>
              <h4>Adjuntos de email (MIME)</h4>
              <p>El estándar MIME usa Base64 para enviar archivos binarios por email. Los PDFs, imágenes y documentos adjuntos en tu correo viajan como texto Base64 dentro del protocolo SMTP.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🌐</span>
              <h4>APIs REST con archivos</h4>
              <p>Cuando una API necesita enviar o recibir archivos en JSON (que solo acepta texto), Base64 es la solución estándar. Por ejemplo, APIs de visión artificial que aceptan imágenes en base64.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="edu-faq-section">
          <h3 className="edu-section-title">❓ Preguntas Frecuentes</h3>
          <div className="edu-faq-list">
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Base64 es cifrado? ¿Es seguro para contraseñas?</summary>
              <div className="edu-faq-answer">
                <p>NO. Base64 es una codificación, no cifrado. Cualquiera puede decodificarlo instantáneamente sin necesitar clave. Nunca almacenes contraseñas en Base64; usa bcrypt, Argon2 o PBKDF2. Base64 solo garantiza que los datos viajen correctamente como texto ASCII, no que sean privados.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Por qué Base64 aumenta el tamaño en un 33%?</summary>
              <div className="edu-faq-answer">
                <p>Base64 agrupa los bytes de 3 en 3 (24 bits) y los convierte en 4 caracteres ASCII de 6 bits cada uno. Por tanto, 3 bytes originales se convierten en 4 caracteres: 3→4, es decir, un incremento del 33,3%. Además, puede haber hasta 2 caracteres de padding (=) para completar grupos de 4.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es el padding y qué significa el signo igual (=)?</summary>
              <div className="edu-faq-answer">
                <p>Base64 necesita grupos de 3 bytes. Si los datos no son múltiplos de 3, se añaden bytes nulos y se indica con = al final. Un = significa que el último grupo tenía 2 bytes originales; == significa que tenía solo 1 byte. El padding permite al decodificador saber exactamente cuántos bytes originales había.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuál es la diferencia entre Base64 estándar y Base64url?</summary>
              <div className="edu-faq-answer">
                <p>Base64 estándar usa + y / en su alfabeto, que tienen significados especiales en URLs. Base64url los reemplaza por - y _ para que el resultado sea seguro en URLs y nombres de archivo sin necesidad de percent-encoding. JWT y muchas APIs modernas usan Base64url. El padding (=) suele omitirse en Base64url.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es un Data URI y cuándo debo usarlo?</summary>
              <div className="edu-faq-answer">
                <p>Un Data URI tiene el formato data:[mediatype];base64,[datos]. Permite incrustar archivos directamente en HTML/CSS. Úsalo para iconos pequeños (&lt;2KB) donde quieras evitar peticiones HTTP. No lo uses para imágenes grandes: aumenta el tamaño del HTML/CSS, no se puede cachear por separado y ralentiza el parsing inicial de la página.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuándo NO debería usar Base64?</summary>
              <div className="edu-faq-answer">
                <p>Evita Base64 cuando: (1) el archivo sea grande (usa multipart/form-data en formularios), (2) necesites caching eficiente de imágenes (mejor servir archivos estáticos), (3) los datos ya son texto (codificar texto UTF-8 en Base64 es redundante y más grande), (4) el rendimiento es crítico (parsear Base64 consume CPU).</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es MIME y cómo se relaciona con Base64?</summary>
              <div className="edu-faq-answer">
                <p>MIME (Multipurpose Internet Mail Extensions) es el estándar que permite enviar contenido no-ASCII por protocolos de texto como SMTP (email) y HTTP. Define tipos de contenido (text/html, image/png, application/pdf) y usa Base64 como mecanismo de transferencia para datos binarios. Los &quot;Content-Type&quot; y &quot;Content-Transfer-Encoding: base64&quot; que ves en emails crudos son MIME.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuál es la diferencia entre btoa/atob y Buffer en Node.js?</summary>
              <div className="edu-faq-answer">
                <p>btoa() y atob() son funciones del navegador (y Node.js 16+) que solo manejan strings de caracteres Latin-1 (0-255). Para texto Unicode o datos binarios arbitrarios en Node.js, usa Buffer.from(data).toString(&apos;base64&apos;) para codificar y Buffer.from(b64, &apos;base64&apos;) para decodificar. Buffer es más robusto y maneja cualquier tipo de dato.</p>
              </div>
            </details>
          </div>
        </div>

        {/* Guía Paso a Paso */}
        <div className="edu-guide-section">
          <h3 className="edu-section-title">📋 Guía: Cuándo y cómo usar Base64 en desarrollo web</h3>
          <ol className="edu-steps-list">
            <li className="edu-step-item">
              <div className="edu-step-number">1</div>
              <div className="edu-step-content">
                <strong>Evalúa si Base64 es necesario</strong>
                <span>Solo úsalo cuando necesites transportar datos binarios por un canal que solo acepta texto (JSON, HTML, email SMTP). Si puedes enviar el archivo directamente, es mejor.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">2</div>
              <div className="edu-step-content">
                <strong>Elige el variant correcto</strong>
                <span>Base64 estándar para MIME/email. Base64url para JWT y URLs. Base32 para códigos 2FA que el usuario leerá en voz alta. El variant importa para interoperabilidad.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">3</div>
              <div className="edu-step-content">
                <strong>Codifica los datos</strong>
                <span>En el navegador: btoa(texto) para texto simple. Para imágenes: usa FileReader.readAsDataURL() que ya devuelve el Data URI completo con el prefijo correcto.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">4</div>
              <div className="edu-step-content">
                <strong>Incluye el tipo MIME si es Data URI</strong>
                <span>El formato completo es data:image/png;base64,iVBORw0... No olvides el prefijo o el navegador no sabrá cómo interpretar los datos.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">5</div>
              <div className="edu-step-content">
                <strong>Verifica con DevTools</strong>
                <span>En Chrome/Firefox, en la pestaña Network puedes ver los payloads Base64 en las peticiones. En Sources puedes inspeccionar Data URIs de imágenes directamente.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">6</div>
              <div className="edu-step-content">
                <strong>Considera alternativas para archivos grandes</strong>
                <span>Para formularios con archivos: multipart/form-data. Para APIs: Blob Storage (S3, R2) y URLs firmadas. Para imágenes en web: &lt;img src=&quot;/ruta/imagen.png&quot;&gt; con CDN es siempre más eficiente.</span>
              </div>
            </li>
          </ol>
        </div>

        {/* Tips Grid */}
        <div className="edu-tips-section">
          <h3 className="edu-section-title">💡 Consejos para Usar Base64 Eficientemente</h3>
          <div className="edu-tips-grid">
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🔗</span>
              <h4>URLs: usa Base64url</h4>
              <p>El + y / del Base64 estándar se codifican como %2B y %2F en URLs, rompen rutas. Usa siempre la variante url-safe (- y _) para tokens en URLs.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">📦</span>
              <h4>Evita Base64 para datos grandes</h4>
              <p>Por encima de 10KB, considera multipart/form-data o URLs de objeto (URL.createObjectURL). El 33% de overhead más el CPU de codificación/decodificación impacta el rendimiento.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🔍</span>
              <h4>Inspecciona JWTs fácilmente</h4>
              <p>Un JWT es header.payload.firma en Base64url. Decodifica solo el payload (segunda parte) para ver los claims. Nunca confíes en el payload sin verificar la firma.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🎨</span>
              <h4>SVGs inline: mejor sin Base64</h4>
              <p>Los SVGs son XML (texto), por lo que pueden incluirse directamente en HTML/CSS con URL encoding (%3C, %3E...) sin Base64. Es más compacto y legible para SVGs simples.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">⚡</span>
              <h4>Cache: archivos externos ganan</h4>
              <p>Un Data URI no puede cachearse separadamente del documento HTML/CSS. Un archivo externo se cachea en el navegador y se reutiliza en múltiples páginas. Prefiere archivos estáticos.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🛡️</span>
              <h4>Sanitiza antes de usar</h4>
              <p>Si recibes Base64 de usuarios, valida el tipo MIME antes de usarlo. No confíes en el prefijo declarado; verifica los magic bytes reales para evitar ataques de tipo MIME sniffing.</p>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="edu-warning-box">
          <h4 className="edu-warning-title">⚠️ Advertencias importantes sobre Base64</h4>
          <ul className="edu-warning-list">
            <li><strong>Base64 NO es seguridad</strong>: Codificar datos en Base64 no los protege. Cualquiera puede decodificarlos al instante. Para seguridad real usa cifrado (AES, RSA) o hashing (bcrypt).</li>
            <li><strong>Incremento de tamaño obligatorio</strong>: Siempre aumenta el peso un ~33%. En producción, evalúa si el coste en bytes justifica la comodidad de transporte en texto.</li>
            <li><strong>No uses Base64 para contraseñas</strong>: Es un error de seguridad grave muy común. Las contraseñas deben hashearse con algoritmos específicos (bcrypt, Argon2, PBKDF2), nunca codificarse.</li>
            <li><strong>Texto Unicode y btoa()</strong>: btoa() falla con caracteres fuera del rango Latin-1 (tildes, chino, emojis). Usa encodeURIComponent() + btoa() o Buffer en Node.js para texto Unicode.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-base64')} />

      <ShareCard appName="conversor-base64" />
      <Footer appName="conversor-base64" />
    </div>
  );
}
