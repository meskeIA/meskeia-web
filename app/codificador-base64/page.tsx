'use client';

import { useState, useCallback } from 'react';
import styles from './CodificadorBase64.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'texto' | 'archivo';
type FormatoType = 'base64' | 'url' | 'hex';

export default function CodificadorBase64Page() {
  const [modo, setModo] = useState<ModoType>('texto');
  const [formato, setFormato] = useState<FormatoType>('base64');
  const [textoEntrada, setTextoEntrada] = useState('');
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Codificar texto
  const codificar = useCallback(() => {
    if (!textoEntrada.trim()) return;
    setError('');

    try {
      let codificado = '';
      if (formato === 'base64') {
        codificado = btoa(unescape(encodeURIComponent(textoEntrada)));
      } else if (formato === 'url') {
        codificado = encodeURIComponent(textoEntrada);
      } else if (formato === 'hex') {
        codificado = textoEntrada
          .split('')
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(' ');
      }
      setResultado(codificado);
    } catch {
      setError('Error al codificar el texto');
      setResultado('');
    }
  }, [textoEntrada, formato]);

  // Decodificar texto
  const decodificar = useCallback(() => {
    if (!textoEntrada.trim()) return;
    setError('');

    try {
      let decodificado = '';
      if (formato === 'base64') {
        decodificado = decodeURIComponent(escape(atob(textoEntrada)));
      } else if (formato === 'url') {
        decodificado = decodeURIComponent(textoEntrada);
      } else if (formato === 'hex') {
        const hex = textoEntrada.replace(/\s/g, '');
        for (let i = 0; i < hex.length; i += 2) {
          decodificado += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
      }
      setResultado(decodificado);
    } catch {
      setError(`Error: El texto no es ${formato.toUpperCase()} válido`);
      setResultado('');
    }
  }, [textoEntrada, formato]);

  // Procesar archivo
  const procesarArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNombreArchivo(file.name);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Extraer solo la parte Base64 (después de la coma)
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
        setResultado(base64Data);
      };
      reader.onerror = () => {
        setError('Error al leer el archivo');
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Error al procesar el archivo');
    }
  };

  // Copiar resultado
  const copiarResultado = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Silencioso
    }
  };

  // Limpiar
  const limpiar = () => {
    setTextoEntrada('');
    setResultado('');
    setError('');
    setNombreArchivo('');
    setCopiado(false);
  };

  // Intercambiar entrada y salida
  const intercambiar = () => {
    setTextoEntrada(resultado);
    setResultado('');
    setError('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Codificador Base64</h1>
        <p className={styles.subtitle}>
          Codifica y decodifica texto en Base64, URL y Hexadecimal
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Selector de modo */}
        <div className={styles.modeSelector}>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'texto' ? styles.active : ''}`}
            onClick={() => setModo('texto')}
          >
            📝 Texto
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'archivo' ? styles.active : ''}`}
            onClick={() => setModo('archivo')}
          >
            📁 Archivo a Base64
          </button>
        </div>

        {/* Modo Texto */}
        {modo === 'texto' && (
          <>
            {/* Selector de formato */}
            <div className={styles.formatSelector}>
              <label className={styles.label}>Formato de codificación</label>
              <div className={styles.formatButtons}>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${formato === 'base64' ? styles.active : ''}`}
                  onClick={() => setFormato('base64')}
                >
                  Base64
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${formato === 'url' ? styles.active : ''}`}
                  onClick={() => setFormato('url')}
                >
                  URL Encode
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${formato === 'hex' ? styles.active : ''}`}
                  onClick={() => setFormato('hex')}
                >
                  Hexadecimal
                </button>
              </div>
            </div>

            {/* Input de texto */}
            <section className={styles.inputPanel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.sectionTitle}>Texto de entrada</h2>
                <button type="button" onClick={limpiar} className={styles.btnSecondary}>
                  Limpiar
                </button>
              </div>
              <textarea
                value={textoEntrada}
                onChange={(e) => setTextoEntrada(e.target.value)}
                placeholder="Escribe o pega el texto a codificar/decodificar..."
                className={styles.textArea}
                rows={6}
              />
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  onClick={codificar}
                  className={styles.btnPrimary}
                  disabled={!textoEntrada.trim()}
                >
                  🔒 Codificar
                </button>
                <button
                  type="button"
                  onClick={decodificar}
                  className={styles.btnPrimary}
                  disabled={!textoEntrada.trim()}
                >
                  🔓 Decodificar
                </button>
              </div>
            </section>
          </>
        )}

        {/* Modo Archivo */}
        {modo === 'archivo' && (
          <section className={styles.inputPanel}>
            <h2 className={styles.sectionTitle}>Selecciona un archivo</h2>
            <p className={styles.hint}>
              Convierte cualquier archivo (imagen, documento, etc.) a Base64
            </p>
            <div className={styles.fileDropZone}>
              <input
                type="file"
                onChange={procesarArchivo}
                className={styles.fileInput}
                id="fileInput"
              />
              <label htmlFor="fileInput" className={styles.fileLabel}>
                <span className={styles.fileIcon}>📁</span>
                <span className={styles.fileText}>
                  {nombreArchivo || 'Haz clic o arrastra un archivo aquí'}
                </span>
              </label>
            </div>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorBox}>
            ❌ {error}
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <section className={styles.resultPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Resultado</h2>
              <div className={styles.resultActions}>
                {modo === 'texto' && (
                  <button type="button" onClick={intercambiar} className={styles.btnSecondary}>
                    ↕ Usar como entrada
                  </button>
                )}
                <button
                  type="button"
                  onClick={copiarResultado}
                  className={styles.btnCopy}
                >
                  {copiado ? '✅ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>
            <textarea
              value={resultado}
              readOnly
              className={styles.textArea}
              rows={6}
            />
            <div className={styles.stats}>
              <span>📊 {resultado.length} caracteres</span>
            </div>
          </section>
        )}
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Aprende sobre Base64, URL Encoding y Hexadecimal"
        subtitle="Guía completa de los tres formatos de codificación más usados en desarrollo web"
        icon="🔐"
      >
        {/* Tabla Comparativa */}
        <div className="edu-table-wrapper">
          <h3 className="edu-section-title">📊 Comparativa de Formatos de Codificación</h3>
          <div className="edu-table-scroll">
            <table className="edu-table">
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Charset</th>
                  <th>Overhead</th>
                  <th>Ejemplo (&quot;Hola&quot;)</th>
                  <th>Uso principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Base64</strong></td>
                  <td>A–Z, a–z, 0–9, +, /</td>
                  <td>+33%</td>
                  <td>SG9sYQ==</td>
                  <td>MIME, JWT, Data URIs, APIs</td>
                </tr>
                <tr>
                  <td><strong>Base64url</strong></td>
                  <td>A–Z, a–z, 0–9, -, _</td>
                  <td>+33%</td>
                  <td>SG9sYQ</td>
                  <td>URLs, cookies, tokens OAuth</td>
                </tr>
                <tr>
                  <td><strong>URL Encoding</strong></td>
                  <td>ASCII + %XX para el resto</td>
                  <td>Variable</td>
                  <td>Hola (sin cambios)</td>
                  <td>Query strings, form data</td>
                </tr>
                <tr>
                  <td><strong>Hexadecimal</strong></td>
                  <td>0–9, A–F</td>
                  <td>+100%</td>
                  <td>48 6f 6c 61</td>
                  <td>Hashes, colores, depuración</td>
                </tr>
                <tr>
                  <td><strong>Sin codificar</strong></td>
                  <td>Cualquier byte</td>
                  <td>0%</td>
                  <td>Hola</td>
                  <td>Almacenamiento local, binarios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Casos de Uso */}
        <div className="edu-escenarios-section">
          <h3 className="edu-section-title">🎯 ¿Cuándo usarás cada formato?</h3>
          <div className="edu-escenarios-grid">
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🌐</span>
              <h4>APIs REST con imágenes</h4>
              <p>Cuando una API acepta JSON pero necesitas enviar imágenes o archivos binarios, codifica en Base64 e incluye el resultado como string en el payload JSON. Es el estándar para APIs de visión artificial (Google Vision, OpenAI GPT-4V).</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">📝</span>
              <h4>Formularios y URLs web</h4>
              <p>El URL Encoding es imprescindible para parámetros de búsqueda y formularios HTML. Un espacio no codificado puede romper una URL; &apos;á&apos; o &apos;ñ&apos; causan errores en servidores que no esperan UTF-8 sin codificar.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🔍</span>
              <h4>Depuración y criptografía</h4>
              <p>El hexadecimal es el formato estándar para mostrar hashes (SHA-256, MD5), claves criptográficas y contenido binario de archivos. También es cómo se expresan los colores web (#FF5733) y las direcciones MAC de red.</p>
            </div>
            <div className="edu-escenario-card">
              <span className="edu-escenario-icon">🔑</span>
              <h4>Autenticación moderna (JWT)</h4>
              <p>Los JSON Web Tokens usan Base64url (no Base64 estándar) para codificar el header y payload. Al decodificar la segunda parte de un JWT puedes leer los claims del usuario sin necesitar la clave privada.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="edu-faq-section">
          <h3 className="edu-section-title">❓ Preguntas Frecuentes</h3>
          <div className="edu-faq-list">
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Base64 es lo mismo que cifrar datos?</summary>
              <div className="edu-faq-answer">
                <p>No. Base64 es una codificación reversible sin clave: cualquiera puede decodificarlo en segundos. El cifrado (AES, RSA) requiere una clave secreta para revertirlo. Usar Base64 para &quot;ocultar&quot; información es un error de seguridad grave. Para datos sensibles usa cifrado real y, para contraseñas, funciones de hashing como bcrypt o Argon2.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Por qué URL encoding usa %20 para el espacio y no +?</summary>
              <div className="edu-faq-answer">
                <p>Depende del contexto. En query strings de formularios HTML (application/x-www-form-urlencoded), el estándar tradicional usa + para el espacio. En el resto de la URL (ruta, fragmento), se usa %20. JavaScript&apos;s encodeURIComponent() siempre usa %20, que es la forma más segura y compatible. Esta ambigüedad histórica es la razón por la que los servidores suelen aceptar ambos.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuándo usar Base64url en vez de Base64 estándar?</summary>
              <div className="edu-faq-answer">
                <p>Usa Base64url cuando el resultado vaya a aparecer en una URL, nombre de archivo o cookie. Base64 estándar usa + y / que tienen significado especial en URLs (+ = espacio, / = separador de ruta). Base64url los reemplaza por - y _ que son seguros en URLs sin percent-encoding. JWT, OAuth 2.0 y muchas APIs modernas usan exclusivamente Base64url.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Qué es un Data URL y cómo lo uso en HTML/CSS?</summary>
              <div className="edu-faq-answer">
                <p>Un Data URL tiene el formato data:[tipo-MIME];base64,[datos]. Permite embeber archivos directamente en HTML o CSS sin petición HTTP adicional. Ejemplo: &lt;img src=&quot;data:image/png;base64,iVBORw0...&quot;&gt;. Es útil para iconos pequeños (&lt;2KB), pero no para imágenes grandes porque no se cachean por separado y aumentan el tamaño del documento principal.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Por qué hexadecimal usa dos caracteres por cada byte?</summary>
              <div className="edu-faq-answer">
                <p>Un byte tiene 8 bits, que puede representar valores del 0 al 255 (2⁸ = 256 valores). En hexadecimal, cada dígito representa 4 bits (un nibble), por lo que necesitas exactamente 2 dígitos hex para representar los 8 bits de un byte. Por ejemplo, el byte 255 en decimal es FF en hex (F=1111 en binario, FF=11111111). Esto hace el hex compacto y fácilmente convertible a binario.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuál es la diferencia entre encodeURI y encodeURIComponent en JavaScript?</summary>
              <div className="edu-faq-answer">
                <p>encodeURI() codifica una URL completa y deja sin codificar los caracteres con significado especial en URLs (/, :, ?, #, &, =, @). encodeURIComponent() codifica todo excepto letras, dígitos y - _ . ! ~ * &apos; ( ), ideal para valores de parámetros. Regla simple: usa encodeURIComponent() para codificar valores individuales de query string; usa encodeURI() solo si necesitas codificar una URL entera que ya tiene su estructura.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cómo funciona el padding (=) en Base64?</summary>
              <div className="edu-faq-answer">
                <p>Base64 procesa los datos en grupos de 3 bytes (24 bits) y los convierte en 4 caracteres. Si los datos no son múltiplos de 3 bytes, se añaden bytes de relleno y se marca con = al final: un = significa que el último grupo tenía 2 bytes originales; == significa que tenía 1 byte. El receptor usa el padding para saber cuántos bytes reales había. Base64url suele omitir el padding para URLs más limpias.</p>
              </div>
            </details>
            <details className="edu-faq-item">
              <summary className="edu-faq-question">¿Cuándo usar cada formato: Base64, URL Encoding o Hex?</summary>
              <div className="edu-faq-answer">
                <p>Usa <strong>Base64</strong> para transportar datos binarios (imágenes, archivos) por canales de texto como JSON o email. Usa <strong>URL Encoding</strong> para parámetros en URLs y formularios web, especialmente con caracteres especiales y no ASCII. Usa <strong>Hexadecimal</strong> para representar hashes criptográficos, valores de color (#RGB), claves y contenido binario donde necesites legibilidad byte a byte. Cada formato tiene su dominio natural; mezclarlos incorrectamente genera errores difíciles de depurar.</p>
              </div>
            </details>
          </div>
        </div>

        {/* Guía Paso a Paso */}
        <div className="edu-guide-section">
          <h3 className="edu-section-title">📋 Guía: Elige el formato correcto para tu caso</h3>
          <ol className="edu-steps-list">
            <li className="edu-step-item">
              <div className="edu-step-number">1</div>
              <div className="edu-step-content">
                <strong>¿Los datos van en una URL o query string?</strong>
                <span>→ Usa URL Encoding (encodeURIComponent en JS). Nunca pongas caracteres sin codificar en parámetros GET.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">2</div>
              <div className="edu-step-content">
                <strong>¿Los datos son binarios y van dentro de JSON o email?</strong>
                <span>→ Usa Base64 estándar. Es el estándar MIME y el que esperan la mayoría de APIs que aceptan archivos en JSON.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">3</div>
              <div className="edu-step-content">
                <strong>¿El resultado va en una URL, cookie o token?</strong>
                <span>→ Usa Base64url (reemplaza + por - y / por _). JWT y OAuth lo exigen. Omite el padding = para URLs más limpias.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">4</div>
              <div className="edu-step-content">
                <strong>¿Necesitas inspeccionar bytes individuales o representar un hash?</strong>
                <span>→ Usa Hexadecimal. Es el estándar para hashes (SHA-256, MD5), direcciones MAC, colores y depuración de protocolos.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">5</div>
              <div className="edu-step-content">
                <strong>Verifica el resultado con DevTools</strong>
                <span>En Chrome/Firefox, la pestaña Network muestra los payloads reales. Puedes ver Base64 en peticiones, URL encoding en query strings y hex en hashes de recursos.</span>
              </div>
            </li>
            <li className="edu-step-item">
              <div className="edu-step-number">6</div>
              <div className="edu-step-content">
                <strong>Documenta el formato usado en tu API</strong>
                <span>Si tu API devuelve o acepta datos codificados, especifica siempre el formato exacto (Base64, Base64url sin padding, hex lowercase...). La ambigüedad es la fuente principal de bugs de integración.</span>
              </div>
            </li>
          </ol>
        </div>

        {/* Tips Grid */}
        <div className="edu-tips-section">
          <h3 className="edu-section-title">💡 Consejos para Usar Codificaciones Correctamente</h3>
          <div className="edu-tips-grid">
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🔗</span>
              <h4>Base64url para tokens</h4>
              <p>Si generas tokens de sesión, reset de contraseña o CSRF, usa siempre Base64url. Los + y / del Base64 estándar en URLs causan bugs silenciosos difíciles de reproducir.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🔍</span>
              <h4>Inspecciona JWTs en jwt.io</h4>
              <p>Copia cualquier JWT y pégalo en jwt.io para decodificarlo visualmente. El payload (segunda parte) es solo Base64url — cualquiera puede leerlo, nunca pongas secretos ahí.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">⚠️</span>
              <h4>Cuidado con el doble encoding</h4>
              <p>Un error común es codificar en URL algo que ya estaba codificado: %20 se convierte en %2520. Siempre decodifica antes de re-codificar. DevTools muestra los valores reales sin doble encoding.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">📦</span>
              <h4>Tamaño: hex es el más grande</h4>
              <p>Base64 añade 33%. Hex añade 100% (cada byte → 2 chars). URL encoding varía: caracteres ASCII sin cambio, otros hasta +12 chars (%XX%XX). Elige según el canal, no solo la legibilidad.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🎨</span>
              <h4>Hex en CSS: shorthand</h4>
              <p>#RGB es shorthand de #RRGGBB cuando los dígitos se repiten: #F80 equivale a #FF8800. Hex en minúsculas (#ff8800) es más común en código; mayúsculas (#FF8800) en herramientas de diseño.</p>
            </div>
            <div className="edu-tip-card">
              <span className="edu-tip-icon">🛡️</span>
              <h4>Valida el tipo MIME recibido</h4>
              <p>Si recibes Base64 de usuarios y lo conviertes a archivo, valida los magic bytes reales del contenido, no el tipo declarado en el prefijo data URI. Un PNG malicioso puede declararse como imagen/jpeg.</p>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="edu-warning-box">
          <h4 className="edu-warning-title">⚠️ Advertencias importantes sobre codificación</h4>
          <ul className="edu-warning-list">
            <li><strong>Ninguno de estos formatos es cifrado</strong>: Base64, URL Encoding y Hex son completamente reversibles sin clave. No protegen la confidencialidad de los datos.</li>
            <li><strong>No uses Base64 para contraseñas</strong>: Es un error de seguridad muy común. Las contraseñas deben hashearse con bcrypt, Argon2 o PBKDF2. Nunca codificarse.</li>
            <li><strong>Doble encoding silencioso</strong>: Codificar datos ya codificados (ej: URL encoding de Base64 que contiene +) genera errores difíciles de depurar. Verifica siempre el estado de los datos antes de codificar.</li>
            <li><strong>Texto Unicode y btoa()</strong>: La función btoa() del navegador falla con caracteres fuera de Latin-1 (tildes, emojis, caracteres CJK). Esta herramienta usa encodeURIComponent() internamente para manejarlos correctamente.</li>
            <li><strong>El padding &quot;=&quot; no es opcional</strong>: Aunque muchos sistemas toleran Base64 sin padding, el estándar RFC 4648 lo exige. Si recibes un error de &quot;invalid padding&quot;, prueba añadir uno o dos &quot;=&quot; al final antes de asumir que los datos están corruptos.</li>
            <li><strong>No incrustes imágenes grandes en Base64</strong>: Codificar imágenes en Base64 para CSS o HTML aumenta el peso un 33% y elimina el paralelismo del navegador. Solo es eficiente para iconos o imágenes muy pequeñas (&lt;2 KB).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('codificador-base64')} />

      <ShareCard appName="codificador-base64" />
      <Footer appName="codificador-base64" />
    </div>
  );
}
