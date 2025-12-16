'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './ConversorBase64.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
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

      {/* Info */}
      <div className={styles.infoSection}>
        <h3>¿Qué es Base64?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔤</span>
            <h4>Codificación</h4>
            <p>Base64 convierte datos binarios en texto ASCII, usando 64 caracteres seguros para transmisión</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🌐</span>
            <h4>Data URI</h4>
            <p>Permite incrustar imágenes directamente en HTML/CSS sin archivos externos</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📊</span>
            <h4>Tamaño</h4>
            <p>El texto Base64 es aproximadamente un 33% más grande que el original</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('conversor-base64')} />

      <Footer appName="conversor-base64" />
    </div>
  );
}
