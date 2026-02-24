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
        title="¿Quieres aprender más sobre codificación Base64?"
        subtitle="Qué es, para qué sirve y cómo funciona"
      >
        <section className={styles.infoSection}>
          <h2>Sobre Base64 y otras codificaciones</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>🔐 ¿Qué es Base64?</h3>
              <p>
                Base64 es un sistema de codificación que convierte datos binarios
                en texto ASCII usando 64 caracteres (A-Z, a-z, 0-9, +, /).
                <strong> No es cifrado</strong> - cualquiera puede decodificarlo.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>💡 Usos de Base64</h3>
              <p>
                • Embeber imágenes en HTML/CSS (Data URLs)<br />
                • Enviar archivos binarios en JSON<br />
                • Adjuntos en emails (MIME)<br />
                • Tokens de autenticación (JWT)
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🌐 URL Encoding</h3>
              <p>
                Convierte caracteres especiales a formato seguro para URLs.
                Por ejemplo, espacios se convierten en %20.
                Esencial para parámetros de consulta (query strings).
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚠️ Importante</h3>
              <p>
                Base64 <strong>aumenta el tamaño</strong> en ~33%.
                100 bytes se convierten en ~133 caracteres.
                <strong> No usar para información sensible</strong> sin cifrado adicional.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('codificador-base64')} />

      <ShareCard appName="codificador-base64" />
      <Footer appName="codificador-base64" />
    </div>
  );
}
