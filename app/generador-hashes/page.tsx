'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorHashes.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type AlgoritmoType = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type ModoType = 'texto' | 'archivo' | 'comparar';

// Implementación MD5 en JavaScript puro (Web Crypto API no soporta MD5)
function md5(input: string | ArrayBuffer): string {
  // Convertir ArrayBuffer a Uint8Array si es necesario
  let bytes: Uint8Array;
  if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    // Convertir string a UTF-8 bytes
    const encoder = new TextEncoder();
    bytes = encoder.encode(input);
  }

  // Constantes MD5
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]);

  // Padding
  const originalLength = bytes.length;
  const bitLength = BigInt(originalLength * 8);

  // Calcular padding necesario
  let paddingLength = 64 - ((originalLength + 9) % 64);
  if (paddingLength === 64) paddingLength = 0;

  const paddedLength = originalLength + 1 + paddingLength + 8;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[originalLength] = 0x80;

  // Añadir longitud en bits (little-endian)
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Number(bitLength & BigInt(0xFFFFFFFF)), true);
  view.setUint32(paddedLength - 4, Number(bitLength >> BigInt(32)), true);

  // Valores iniciales
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  // Procesar bloques de 64 bytes
  for (let i = 0; i < paddedLength; i += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(i + j * 4, true);
    }

    let A = a0, B = b0, C = c0, D = d0;

    for (let j = 0; j < 64; j++) {
      let F: number, g: number;
      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }

      F = (F + A + K[j] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << S[j]) | (F >>> (32 - S[j])))) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  // Convertir a hexadecimal (little-endian)
  const toHex = (n: number) => {
    const bytes = [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

export default function GeneradorHashesPage() {
  const [modo, setModo] = useState<ModoType>('texto');
  const [algoritmo, setAlgoritmo] = useState<AlgoritmoType>('SHA-256');
  const [texto, setTexto] = useState('');
  const [hash, setHash] = useState('');
  const [hashArchivo, setHashArchivo] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [hashComparar, setHashComparar] = useState('');
  const [resultadoComparacion, setResultadoComparacion] = useState<boolean | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [copiado, setCopiado] = useState('');

  // Estados para HTML code generation
  const [htmlCode, setHtmlCode] = useState('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

  // Generar hash usando Web Crypto API (o MD5 puro para ese algoritmo)
  const generarHash = useCallback(async (data: ArrayBuffer, algo: AlgoritmoType): Promise<string> => {
    // MD5 usa implementación JavaScript pura (Web Crypto no lo soporta)
    if (algo === 'MD5') {
      return md5(data);
    }
    // SHA usa Web Crypto API nativa
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // Hash de texto
  const procesarTexto = async () => {
    if (!texto.trim()) return;
    setProcesando(true);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(texto);
      const resultado = await generarHash(data.buffer, algoritmo);
      setHash(resultado);
      setResultadoComparacion(null);
      generarCodigoHTML(resultado, algoritmo, texto.slice(0, 40) + (texto.length > 40 ? '...' : ''));
    } catch (error) {
      console.error('Error generando hash:', error);
    }
    setProcesando(false);
  };

  // Hash de archivo
  const procesarArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNombreArchivo(file.name);
    setProcesando(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const resultado = await generarHash(arrayBuffer, algoritmo);
      setHashArchivo(resultado);
      setResultadoComparacion(null);
      generarCodigoHTML(resultado, algoritmo, file.name);
    } catch (error) {
      console.error('Error procesando archivo:', error);
    }
    setProcesando(false);
  };

  // Comparar hashes
  const compararHashes = () => {
    const hashActual = modo === 'texto' ? hash : hashArchivo;
    if (!hashActual || !hashComparar.trim()) return;

    const hashNormalizado = hashComparar.toLowerCase().replace(/\s/g, '');
    setResultadoComparacion(hashActual === hashNormalizado);
  };

  // Generar código HTML exportable
  const generarCodigoHTML = useCallback((hashVal: string, algo: AlgoritmoType, fuente: string) => {
    if (!hashVal) { setHtmlCode(''); return; }

    let codigo = `<!-- Hash ${algo} - generado con meskeIA -->\n\n`;
    codigo += `<div class="hash-verificacion">\n`;
    codigo += `  <p class="etiqueta">Hash ${algo} de: <em>${fuente}</em></p>\n`;
    codigo += `  <code class="hash-valor">${hashVal}</code>\n`;
    codigo += `  <p class="hash-meta">${hashVal.length} caracteres · ${algo}</p>\n`;
    codigo += `</div>\n\n`;
    codigo += `<!-- CSS recomendado -->\n`;
    codigo += `<style>\n`;
    codigo += `  .hash-verificacion {\n`;
    codigo += `    font-family: 'Courier New', monospace;\n`;
    codigo += `    background: #f0f4f8;\n`;
    codigo += `    border-left: 4px solid #2E86AB;\n`;
    codigo += `    padding: 1rem 1.5rem;\n`;
    codigo += `    border-radius: 8px;\n`;
    codigo += `  }\n`;
    codigo += `  .etiqueta { color: #666; font-size: 0.85rem; margin: 0 0 0.5rem; font-family: sans-serif; }\n`;
    codigo += `  .hash-valor { display: block; color: #1A1A1A; font-size: 0.9rem; word-break: break-all; margin: 0 0 0.5rem; }\n`;
    codigo += `  .hash-meta { color: #666; font-size: 0.75rem; margin: 0; font-family: sans-serif; }\n`;
    codigo += `</style>\n`;

    setHtmlCode(codigo);
  }, []);

  const copiarHash = async (hashToCopy: string, id: string = 'default') => {
    if (hashToCopy) {
      await navigator.clipboard.writeText(hashToCopy);
      setCopiado(id);
      setTimeout(() => setCopiado(''), 2000);
    }
  };

  const copiarCodigoHTML = async () => {
    if (htmlCode) {
      await navigator.clipboard.writeText(htmlCode);
      setHtmlCopiado(true);
      setTimeout(() => setHtmlCopiado(false), 2000);
    }
  };

  const limpiar = () => {
    setTexto('');
    setHash('');
    setHashArchivo('');
    setNombreArchivo('');
    setHashComparar('');
    setResultadoComparacion(null);
    setHtmlCode('');
    setHtmlExpanded(false);
  };

  const hashActual = modo === 'texto' ? hash : hashArchivo;

  // Info de algoritmos
  const algoritmosInfo: Record<AlgoritmoType, { bits: number; longitud: number; seguridad: string }> = {
    'MD5': { bits: 128, longitud: 32, seguridad: '❌ Inseguro' },
    'SHA-1': { bits: 160, longitud: 40, seguridad: '⚠️ Obsoleto' },
    'SHA-256': { bits: 256, longitud: 64, seguridad: '✅ Recomendado' },
    'SHA-384': { bits: 384, longitud: 96, seguridad: '✅ Muy seguro' },
    'SHA-512': { bits: 512, longitud: 128, seguridad: '✅ Máxima seguridad' },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Hashes</h1>
        <p className={styles.subtitle}>
          MD5, SHA-256, SHA-512 y más - Verifica integridad de datos
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
            aria-pressed={modo === 'texto'}
          >
            <span aria-hidden="true">📝</span> Texto
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'archivo' ? styles.active : ''}`}
            onClick={() => setModo('archivo')}
            aria-pressed={modo === 'archivo'}
          >
            <span aria-hidden="true">📁</span> Archivo
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'comparar' ? styles.active : ''}`}
            onClick={() => setModo('comparar')}
            aria-pressed={modo === 'comparar'}
          >
            <span aria-hidden="true">🔍</span> Comparar
          </button>
        </div>

        {/* Selector de algoritmo */}
        <div className={styles.algoritmoSection}>
          <label className={styles.label}>Algoritmo de hash</label>
          <div className={styles.algoritmoGrid}>
            {(Object.keys(algoritmosInfo) as AlgoritmoType[]).map((algo) => (
              <button
                key={algo}
                type="button"
                className={`${styles.algoritmoBtn} ${algoritmo === algo ? styles.active : ''}`}
                onClick={() => setAlgoritmo(algo)}
                aria-pressed={algoritmo === algo}
              >
                <span className={styles.algoritmoNombre}>{algo}</span>
                <span className={styles.algoritmoBits}>{algoritmosInfo[algo].bits} bits</span>
                <span className={styles.algoritmoSeguridad}>{algoritmosInfo[algo].seguridad}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modo Texto */}
        {modo === 'texto' && (
          <div className={styles.inputSection}>
            <label className={styles.label}>Texto a hashear</label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe o pega el texto aquí..."
              className={styles.textarea}
              rows={5}
            />
            <div className={styles.buttonRow}>
              <button
                type="button"
                onClick={procesarTexto}
                className={styles.btnPrimary}
                disabled={!texto.trim() || procesando}
              >
                {procesando ? <><span aria-hidden="true">⏳</span> Procesando...</> : <><span aria-hidden="true">🔐</span> Generar Hash</>}
              </button>
              <button type="button" onClick={limpiar} className={styles.btnSecondary}>
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Modo Archivo */}
        {modo === 'archivo' && (
          <div className={styles.inputSection}>
            <label className={styles.label}>Selecciona un archivo</label>
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
                {nombreArchivo && <span className={styles.fileName}>{nombreArchivo}</span>}
              </label>
            </div>
            {procesando && (
              <div className={styles.procesando}>
                ⏳ Procesando archivo...
              </div>
            )}
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        )}

        {/* Modo Comparar */}
        {modo === 'comparar' && (
          <div className={styles.inputSection}>
            <p className={styles.instrucciones}>
              Primero genera un hash en la pestaña Texto o Archivo, luego compáralo aquí.
            </p>
            <label className={styles.label}>Hash a comparar</label>
            <input
              type="text"
              value={hashComparar}
              onChange={(e) => setHashComparar(e.target.value)}
              placeholder="Pega el hash que quieres comparar..."
              className={styles.input}
            />
            <button
              type="button"
              onClick={compararHashes}
              className={styles.btnPrimary}
              disabled={!hashActual || !hashComparar.trim()}
            >
              <span aria-hidden="true">🔍</span> Comparar Hashes
            </button>

            {resultadoComparacion !== null && (
              <div className={`${styles.comparacionResultado} ${resultadoComparacion ? styles.exito : styles.error}`}>
                {resultadoComparacion ? (
                  <>
                    <span className={styles.resultadoIcon}>✅</span>
                    <span>Los hashes coinciden - El contenido es idéntico</span>
                  </>
                ) : (
                  <>
                    <span className={styles.resultadoIcon}>❌</span>
                    <span>Los hashes NO coinciden - El contenido es diferente</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resultado del hash */}
        {hashActual && (
          <div className={styles.resultSection}>
            <div className={styles.resultHeader}>
              <label className={styles.label}>
                Hash {algoritmo} ({algoritmosInfo[algoritmo].longitud} caracteres)
              </label>
              <button
                type="button"
                onClick={() => copiarHash(hashActual, 'hash')}
                className={styles.btnCopy}
              >
                {copiado === 'hash' ? <><span aria-hidden="true">✅</span> Copiado</> : <><span aria-hidden="true">📋</span> Copiar</>}
              </button>
            </div>
            <div className={styles.resultBox}>
              {hashActual}
            </div>
            <div className={styles.hashInfo}>
              <span><span aria-hidden="true">🔢</span> {hashActual.length} caracteres hexadecimales</span>
              <span><span aria-hidden="true">📊</span> {algoritmosInfo[algoritmo].bits} bits de seguridad</span>
            </div>
          </div>
        )}

        {/* ========== HTML CODE GENERATION ========== */}
        {htmlCode && (
          <div className={styles.htmlCodeSection}>
            <button
              type="button"
              className={styles.htmlToggleBtn}
              onClick={() => setHtmlExpanded(!htmlExpanded)}
            >
              <span>{htmlExpanded ? '▲' : '▼'} Exportar hash como código HTML</span>
              <span className={styles.htmlBadge}>Nuevo</span>
            </button>

            {htmlExpanded && (
              <div className={styles.htmlCodeContent}>
                <p className={styles.htmlDescription}>
                  Copia este código para publicar el hash de verificación en tu web o documentación:
                </p>
                <pre className={styles.htmlPre}>{htmlCode}</pre>
                <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyHtml}>
                  {htmlCopiado ? <><span aria-hidden="true">✅</span> ¡Copiado!</> : <><span aria-hidden="true">📋</span> Copiar código HTML</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection
        title="¿Quieres aprender más sobre funciones hash?"
        subtitle="Qué son, para qué sirven, historia y cómo protegen la integridad de tus datos"
      >
        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Comparativa de algoritmos de hash</h2>
          <p className={styles.comparativaSubtitle}>
            MD5, SHA-1, SHA-256, SHA-384 y SHA-512: bits, longitud, velocidad y estado de seguridad actual
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Algoritmo</th>
                  <th>Bits</th>
                  <th>Longitud (hex)</th>
                  <th>Año</th>
                  <th>Estado actual</th>
                  <th>Uso recomendado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MD5</td>
                  <td>128</td>
                  <td>32 chars</td>
                  <td>1992</td>
                  <td className={styles.tdNegative}>Roto (2004)</td>
                  <td>Solo checksums no críticos</td>
                </tr>
                <tr>
                  <td>SHA-1</td>
                  <td>160</td>
                  <td>40 chars</td>
                  <td>1995</td>
                  <td className={styles.tdNegative}>Obsoleto (2017)</td>
                  <td>No recomendado</td>
                </tr>
                <tr>
                  <td>SHA-256</td>
                  <td>256</td>
                  <td>64 chars</td>
                  <td>2001</td>
                  <td className={styles.tdPositive}>Seguro ✅</td>
                  <td>Uso general, contraseñas, TLS</td>
                </tr>
                <tr>
                  <td>SHA-384</td>
                  <td>384</td>
                  <td>96 chars</td>
                  <td>2001</td>
                  <td className={styles.tdPositive}>Muy seguro ✅</td>
                  <td>Seguridad alta, certificados</td>
                </tr>
                <tr>
                  <td>SHA-512</td>
                  <td>512</td>
                  <td>128 chars</td>
                  <td>2001</td>
                  <td className={styles.tdPositive}>Máxima seguridad ✅</td>
                  <td>Datos críticos, firmas digitales</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: QUÉ ES UN HASH ========== */}
        <section className={styles.infoSection}>
          <h2>🔐 ¿Qué son las funciones hash criptográficas?</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📖 Definición</h3>
              <p>
                Una función hash convierte cualquier cantidad de datos (texto, archivo, imagen)
                en una cadena de longitud fija llamada «digest» o «hash». El mismo input
                siempre produce exactamente el mismo hash. Funcionan como una
                <strong> huella digital única</strong> de los datos.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🎯 Tres propiedades fundamentales</h3>
              <p>
                <strong>Determinista:</strong> mismo input → mismo output siempre<br />
                <strong>Unidireccional:</strong> imposible calcular el input desde el hash<br />
                <strong>Resistente a colisiones:</strong> prácticamente imposible que dos inputs distintos produzcan el mismo hash
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>💡 Usos en el mundo real</h3>
              <p>
                • Verificar descargas con checksums<br />
                • Almacenar contraseñas (con salt)<br />
                • Firmas digitales y certificados SSL<br />
                • Blockchain y criptomonedas (Bitcoin usa SHA-256)<br />
                • Control de versiones (Git usa SHA-1 y SHA-256)<br />
                • Detección de malware por hash de archivos
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>📅 Historia del SHA</h3>
              <p>
                SHA (Secure Hash Algorithm) fue diseñado por la NSA y estandarizado
                por el NIST. SHA-1 (1995) → SHA-2 (2001, incluye SHA-256/512) →
                SHA-3 (2015, basado en Keccak). SHA-256 y SHA-512 siguen siendo los
                estándares de facto para seguridad en 2024.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ ========== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas frecuentes sobre hashes</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Por qué MD5 está &quot;roto&quot; si sigue generando hashes?
              </summary>
              <p className={styles.faqAnswer}>
                MD5 funciona perfectamente para generar hashes, pero ha sido demostrado
                que es posible crear colisiones intencionadas (dos archivos diferentes con
                el mismo hash MD5) en minutos con equipos actuales. Esto lo hace
                inaceptable para seguridad, pero válido para checksums donde no hay
                un atacante intentando manipular los datos.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Se pueden almacenar contraseñas directamente con SHA-256?
              </summary>
              <p className={styles.faqAnswer}>
                No directamente. SHA-256 es demasiado rápido: un atacante puede probar
                billones de contraseñas por segundo con GPU. Para contraseñas se usan
                funciones específicamente lentas como <strong>bcrypt</strong>, <strong>Argon2</strong>
                o <strong>PBKDF2</strong>, que añaden un «salt» y son deliberadamente costosas computacionalmente.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué es el «efecto avalancha»?
              </summary>
              <p className={styles.faqAnswer}>
                Es una propiedad donde cambiar un solo bit del input cambia
                aproximadamente el 50% de los bits del hash de salida. Por ejemplo,
                hashear «Hola» vs «hola» (solo cambia mayúscula/minúscula) produce
                hashes SHA-256 completamente diferentes. Esta propiedad es fundamental
                para que los hashes sean seguros.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué es un hash con salt?
              </summary>
              <p className={styles.faqAnswer}>
                Un salt es un valor aleatorio único que se añade al input antes de
                hashear. Sirve para prevenir ataques con «rainbow tables» (bases de datos
                pre-calculadas de hashes de contraseñas comunes). Con salt, dos usuarios
                con la misma contraseña tendrán hashes diferentes.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Cómo verifica Bitcoin la integridad de las transacciones?
              </summary>
              <p className={styles.faqAnswer}>
                Bitcoin usa SHA-256 de forma doble (SHA-256 aplicado dos veces al resultado).
                Cada bloque contiene el hash del bloque anterior, formando una cadena.
                Modificar cualquier transacción pasada cambiaría su hash, que cambiaría
                el hash del siguiente bloque, y así sucesivamente — requiriendo recalcular
                toda la cadena, lo que es computacionalmente inviable.
              </p>
            </details>
          </div>
        </section>

        {/* ========== SECCIÓN 4: EFECTO AVALANCHA ========== */}
        <section className={styles.ejemplosSection}>
          <h2>⚡ El efecto avalancha en acción</h2>
          <div className={styles.ejemploGrid}>
            <div className={styles.ejemploCard}>
              <p className={styles.ejemploLabel}>Input: <code>&quot;Hola&quot;</code></p>
              <code className={styles.ejemploHash}>
                d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5
              </code>
              <p className={styles.ejemploAlgo}>SHA-256</p>
            </div>
            <div className={styles.ejemploCard}>
              <p className={styles.ejemploLabel}>Input: <code>&quot;hola&quot;</code> (solo minúscula)</p>
              <code className={styles.ejemploHash}>
                b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79
              </code>
              <p className={styles.ejemploAlgo}>SHA-256</p>
            </div>
          </div>
          <p className={styles.ejemploNota}>
            Solo cambió una letra (H→h) pero el hash es completamente diferente.
            Eso es el <strong>efecto avalancha</strong>: un cambio mínimo en el input genera un hash totalmente distinto.
          </p>
        </section>

        {/* ========== SECCIÓN 5: USOS PRÁCTICOS ========== */}
        <section className={styles.tipsSection}>
          <h2>💡 Cuándo usar cada algoritmo</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📦</span>
              <div>
                <strong>SHA-256 para verificación de descargas</strong>
                <p>Cuando descargas software, compara el SHA-256 publicado en la web oficial con el hash del archivo descargado. Si coinciden, el archivo no ha sido modificado.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔒</span>
              <div>
                <strong>SHA-512 para datos muy sensibles</strong>
                <p>Documentos legales, datos médicos o claves criptográficas merecen el mayor nivel de seguridad disponible. SHA-512 ofrece 512 bits de resistencia a colisiones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <div>
                <strong>MD5 solo para checksums rápidos</strong>
                <p>Si simplemente necesitas detectar corrupción accidental de archivos (no ataques intencionados), MD5 sigue siendo útil por su velocidad y amplia compatibilidad.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔏</span>
              <div>
                <strong>Git usa SHA-1 (migra a SHA-256)</strong>
                <p>Los repositorios Git identifican cada commit por su SHA-1. GitHub y Git 2.29+ ya soportan SHA-256. Si trabajas en proyectos de seguridad, considera migrar a SHA-256.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2>⚠️ Errores frecuentes con funciones hash</h2>
          <ul className={styles.warningList}>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Hashear contraseñas directamente con SHA-256</strong>
                <p>SHA-256 es demasiado rápido para proteger contraseñas. Un atacante con GPU puede probar 10.000 millones de hashes por segundo. Usa siempre bcrypt, Argon2 o PBKDF2 para contraseñas.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Usar MD5 o SHA-1 para seguridad real</strong>
                <p>MD5 tiene colisiones documentadas desde 2004. SHA-1 fue retirado en 2017 cuando Google demostró una colisión (ataque SHAttered). Para cualquier uso de seguridad, usa SHA-256 como mínimo.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Creer que un hash es cifrado</strong>
                <p>Los hashes son unidireccionales: no se pueden revertir al input original. No son cifrado — no tienen clave y no pueden descifrarse. Son herramientas de verificación de integridad, no de confidencialidad.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>✅</span>
              <div>
                <strong>Uso correcto: verificación e integridad</strong>
                <p>Los hashes brillan para verificar integridad de archivos, detectar cambios, crear identificadores únicos de contenido, firmas digitales (combinados con cifrado asimétrico) y como componente de otros sistemas de seguridad.</p>
              </div>
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-hashes')} />

      <ShareCard appName="generador-hashes" />
      <Footer appName="generador-hashes" />
    </div>
  );
}
