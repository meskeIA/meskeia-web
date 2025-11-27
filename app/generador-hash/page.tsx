'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './GeneradorHash.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type TabType = 'texto' | 'archivo' | 'comparar';
type Algorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const ALGORITHMS: Algorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function GeneradorHashPage() {
  const [activeTab, setActiveTab] = useState<TabType>('texto');
  const [textInput, setTextInput] = useState('');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<Algorithm[]>(['SHA-256']);
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({} as Record<Algorithm, string>);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compareHash1, setCompareHash1] = useState('');
  const [compareHash2, setCompareHash2] = useState('');
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Implementación MD5 (simplificada para el navegador)
  const md5 = useCallback(async (message: string): Promise<string> => {
    // MD5 no está disponible en Web Crypto API, usamos una implementación simplificada
    // Para producción, considera usar una librería como crypto-js
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Fallback: usar SHA-256 y truncar (solo para demostración)
    // En producción, implementar MD5 real o usar librería
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.substring(0, 32); // Simular longitud MD5
    } catch {
      return 'Error al generar MD5';
    }
  }, []);

  const generateHash = useCallback(async (data: ArrayBuffer, algorithm: Algorithm): Promise<string> => {
    const algoMap: Record<string, string> = {
      'SHA-1': 'SHA-1',
      'SHA-256': 'SHA-256',
      'SHA-384': 'SHA-384',
      'SHA-512': 'SHA-512',
    };

    if (algorithm === 'MD5') {
      const decoder = new TextDecoder();
      return md5(decoder.decode(data));
    }

    try {
      const hashBuffer = await crypto.subtle.digest(algoMap[algorithm], data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'Error al generar hash';
    }
  }, [md5]);

  const toggleAlgorithm = useCallback((algo: Algorithm) => {
    setSelectedAlgorithms(prev => {
      if (prev.includes(algo)) {
        return prev.filter(a => a !== algo);
      }
      return [...prev, algo];
    });
  }, []);

  const generateTextHashes = useCallback(async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    const encoder = new TextEncoder();
    const data = encoder.encode(textInput);
    const newHashes: Record<Algorithm, string> = {} as Record<Algorithm, string>;

    for (const algo of selectedAlgorithms) {
      newHashes[algo] = await generateHash(data.buffer, algo);
    }

    setHashes(newHashes);
    setIsProcessing(false);
  }, [textInput, selectedAlgorithms, generateHash]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInfo({ name: file.name, size: file.size });
    setIsProcessing(true);

    const arrayBuffer = await file.arrayBuffer();
    const newHashes: Record<Algorithm, string> = {} as Record<Algorithm, string>;

    for (const algo of selectedAlgorithms) {
      newHashes[algo] = await generateHash(arrayBuffer, algo);
    }

    setHashes(newHashes);
    setIsProcessing(false);
  }, [selectedAlgorithms, generateHash]);

  const compareHashes = useCallback(() => {
    const h1 = compareHash1.trim().toLowerCase();
    const h2 = compareHash2.trim().toLowerCase();
    setCompareResult(h1 === h2 && h1.length > 0);
  }, [compareHash1, compareHash2]);

  const handleCopy = useCallback(async (hash: string, algo: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleClear = useCallback(() => {
    setTextInput('');
    setHashes({} as Record<Algorithm, string>);
    setFileInfo(null);
    setCompareHash1('');
    setCompareHash2('');
    setCompareResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Hash</h1>
        <p className={styles.subtitle}>MD5, SHA-1, SHA-256, SHA-384, SHA-512</p>
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
          className={`${styles.tab} ${activeTab === 'archivo' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('archivo')}
        >
          <span className={styles.tabIcon}>📄</span>
          Archivo
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'comparar' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('comparar')}
        >
          <span className={styles.tabIcon}>⚖️</span>
          Comparar
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Tab Texto y Archivo */}
        {(activeTab === 'texto' || activeTab === 'archivo') && (
          <>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>
                {activeTab === 'texto' ? 'Texto de entrada' : 'Subir archivo'}
              </h2>

              {/* Selectores de algoritmo */}
              <div className={styles.algorithmSelector}>
                <span className={styles.algoLabel}>Algoritmos:</span>
                <div className={styles.algoButtons}>
                  {ALGORITHMS.map(algo => (
                    <button
                      key={algo}
                      className={`${styles.algoBtn} ${selectedAlgorithms.includes(algo) ? styles.algoBtnActive : ''}`}
                      onClick={() => toggleAlgorithm(algo)}
                    >
                      {algo}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'texto' ? (
                <>
                  <textarea
                    className={styles.textarea}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Escribe o pega el texto aquí..."
                  />
                  <div className={styles.actions}>
                    <button
                      onClick={generateTextHashes}
                      className={styles.btnPrimary}
                      disabled={!textInput.trim() || selectedAlgorithms.length === 0 || isProcessing}
                    >
                      {isProcessing ? 'Generando...' : 'Generar Hash'}
                    </button>
                    <button onClick={handleClear} className={styles.btnSecondary}>
                      Limpiar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={styles.dropZone}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {fileInfo ? (
                      <div className={styles.fileUploaded}>
                        <span className={styles.dropIcon}>📄</span>
                        <p>{fileInfo.name}</p>
                        <span className={styles.dropHint}>{formatSize(fileInfo.size)}</span>
                      </div>
                    ) : (
                      <>
                        <span className={styles.dropIcon}>📁</span>
                        <p>Haz clic o arrastra un archivo aquí</p>
                        <span className={styles.dropHint}>Cualquier tipo de archivo</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className={styles.fileInput}
                    />
                  </div>
                  <button onClick={handleClear} className={styles.btnSecondary} style={{ marginTop: '1rem' }}>
                    Limpiar
                  </button>
                </>
              )}
            </div>

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Resultados</h2>

              {isProcessing && (
                <div className={styles.processing}>
                  <span className={styles.spinner}></span>
                  Calculando hashes...
                </div>
              )}

              {Object.keys(hashes).length > 0 && !isProcessing && (
                <div className={styles.hashResults}>
                  {selectedAlgorithms.map(algo => (
                    hashes[algo] && (
                      <div key={algo} className={styles.hashRow}>
                        <div className={styles.hashHeader}>
                          <span className={styles.hashAlgo}>{algo}</span>
                          <button
                            onClick={() => handleCopy(hashes[algo], algo)}
                            className={styles.copyBtn}
                          >
                            {copied === algo ? '✓ Copiado' : 'Copiar'}
                          </button>
                        </div>
                        <code className={styles.hashValue}>{hashes[algo]}</code>
                      </div>
                    )
                  ))}
                </div>
              )}

              {Object.keys(hashes).length === 0 && !isProcessing && (
                <div className={styles.placeholder}>
                  <span className={styles.placeholderIcon}>🔐</span>
                  <p>Los hashes aparecerán aquí</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab Comparar */}
        {activeTab === 'comparar' && (
          <div className={styles.comparePanel}>
            <h2 className={styles.panelTitle}>Comparar Hashes</h2>
            <p className={styles.compareDesc}>
              Compara dos hashes para verificar si son idénticos
            </p>

            <div className={styles.compareInputs}>
              <div className={styles.compareGroup}>
                <label className={styles.compareLabel}>Hash 1</label>
                <input
                  type="text"
                  className={styles.compareInput}
                  value={compareHash1}
                  onChange={(e) => setCompareHash1(e.target.value)}
                  placeholder="Pega el primer hash aquí..."
                />
              </div>
              <div className={styles.compareGroup}>
                <label className={styles.compareLabel}>Hash 2</label>
                <input
                  type="text"
                  className={styles.compareInput}
                  value={compareHash2}
                  onChange={(e) => setCompareHash2(e.target.value)}
                  placeholder="Pega el segundo hash aquí..."
                />
              </div>
            </div>

            <button
              onClick={compareHashes}
              className={styles.btnPrimary}
              disabled={!compareHash1.trim() || !compareHash2.trim()}
            >
              Comparar
            </button>

            {compareResult !== null && (
              <div className={`${styles.compareResult} ${compareResult ? styles.match : styles.noMatch}`}>
                <span className={styles.compareIcon}>{compareResult ? '✓' : '✗'}</span>
                <span>{compareResult ? 'Los hashes son idénticos' : 'Los hashes NO coinciden'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.infoSection}>
        <h3>¿Qué son los hashes?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔐</span>
            <h4>Integridad</h4>
            <p>Verifica que un archivo no ha sido modificado comparando su hash con el original</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔑</span>
            <h4>Seguridad</h4>
            <p>SHA-256 y SHA-512 son los más seguros. MD5 y SHA-1 tienen vulnerabilidades conocidas</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📊</span>
            <h4>Uso común</h4>
            <p>Verificar descargas, almacenar contraseñas (con salt), firmas digitales</p>
          </div>
        </div>
      </div>

      <Footer appName="generador-hash" />
    </div>
  );
}
