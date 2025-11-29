'use client';

import { useState, useCallback } from 'react';
import styles from './GeneradorHashes.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';

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

  const copiarHash = async (hashToCopy: string) => {
    if (hashToCopy) {
      await navigator.clipboard.writeText(hashToCopy);
    }
  };

  const limpiar = () => {
    setTexto('');
    setHash('');
    setHashArchivo('');
    setNombreArchivo('');
    setHashComparar('');
    setResultadoComparacion(null);
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
            📁 Archivo
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'comparar' ? styles.active : ''}`}
            onClick={() => setModo('comparar')}
          >
            🔍 Comparar
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
                {procesando ? '⏳ Procesando...' : '🔐 Generar Hash'}
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
              🔍 Comparar Hashes
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
                onClick={() => copiarHash(hashActual)}
                className={styles.btnCopy}
              >
                📋 Copiar
              </button>
            </div>
            <div className={styles.resultBox}>
              {hashActual}
            </div>
            <div className={styles.hashInfo}>
              <span>🔢 {hashActual.length} caracteres hexadecimales</span>
              <span>📊 {algoritmosInfo[algoritmo].bits} bits de seguridad</span>
            </div>
          </div>
        )}
      </div>

      {/* Sección educativa colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre funciones hash?"
        subtitle="Qué son, para qué sirven y cómo protegen la integridad de tus datos"
      >
        <section className={styles.infoSection}>
          <h2>¿Qué es un Hash?</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>🔐 Definición</h3>
              <p>
                Un hash es una &quot;huella digital&quot; única de cualquier dato. Es una
                función matemática que convierte cualquier cantidad de datos en una
                cadena de longitud fija. El mismo input siempre produce el mismo hash.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🎯 Propiedades</h3>
              <p>
                <strong>Determinista:</strong> mismo input = mismo output<br />
                <strong>Unidireccional:</strong> no se puede revertir<br />
                <strong>Resistente a colisiones:</strong> casi imposible encontrar dos inputs con el mismo hash
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>💡 Usos comunes</h3>
              <p>
                • Verificar descargas (checksums)<br />
                • Almacenar contraseñas de forma segura<br />
                • Firmas digitales<br />
                • Blockchain y criptomonedas<br />
                • Detectar cambios en archivos
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚠️ MD5 y SHA-1 vs SHA-2</h3>
              <p>
                <strong>MD5</strong> (128 bits) está roto - solo usar para checksums no críticos.<br />
                <strong>SHA-1</strong> (160 bits) está obsoleto desde 2017.<br />
                <strong>SHA-256/512</strong> son seguros para uso actual.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.ejemplosSection}>
          <h2>Ejemplo Práctico</h2>
          <div className={styles.ejemplo}>
            <p>Si hasheas &quot;Hola&quot; con SHA-256:</p>
            <code className={styles.ejemploHash}>
              d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5
            </code>
            <p>Si cambias una sola letra a &quot;hola&quot; (minúscula):</p>
            <code className={styles.ejemploHash}>
              b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79
            </code>
            <p className={styles.ejemploNota}>
              ¡El hash cambia completamente! Esto se llama &quot;efecto avalancha&quot;.
            </p>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="generador-hashes" />
    </div>
  );
}
