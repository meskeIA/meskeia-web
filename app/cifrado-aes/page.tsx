'use client';

import { useState, useCallback } from 'react';
import styles from './CifradoAES.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'cifrar' | 'descifrar';
type AlgoritmoType = 'AES-GCM' | 'AES-CBC';

export default function CifradoAESPage() {
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [algoritmo, setAlgoritmo] = useState<AlgoritmoType>('AES-GCM');
  const [texto, setTexto] = useState('');
  const [clave, setClave] = useState('');
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);

  // Generar clave aleatoria
  const generarClave = useCallback(async () => {
    const array = new Uint8Array(32); // 256 bits
    crypto.getRandomValues(array);
    const claveHex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    setClave(claveHex);
  }, []);

  // Derivar clave desde contraseña usando PBKDF2
  const derivarClave = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: algoritmo, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  // Cifrar texto
  const cifrar = useCallback(async () => {
    if (!texto.trim() || !clave.trim()) return;

    setProcesando(true);
    setError('');

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(texto);

      // Generar salt e IV aleatorios
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(algoritmo === 'AES-GCM' ? 12 : 16));

      // Derivar clave
      const key = await derivarClave(clave, salt);

      // Cifrar
      let encrypted: ArrayBuffer;
      if (algoritmo === 'AES-GCM') {
        encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          data
        );
      } else {
        encrypted = await crypto.subtle.encrypt(
          { name: 'AES-CBC', iv: iv },
          key,
          data
        );
      }

      // Combinar salt + iv + datos cifrados
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Convertir a Base64
      const base64 = btoa(String.fromCharCode(...combined));
      setResultado(base64);

    } catch (err) {
      setError('Error al cifrar: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setResultado('');
    } finally {
      setProcesando(false);
    }
  }, [texto, clave, algoritmo]);

  // Descifrar texto
  const descifrar = useCallback(async () => {
    if (!texto.trim() || !clave.trim()) return;

    setProcesando(true);
    setError('');

    try {
      // Decodificar Base64
      const combined = Uint8Array.from(atob(texto), c => c.charCodeAt(0));

      // Extraer salt, iv y datos cifrados
      const salt = combined.slice(0, 16);
      const ivLength = algoritmo === 'AES-GCM' ? 12 : 16;
      const iv = combined.slice(16, 16 + ivLength);
      const encrypted = combined.slice(16 + ivLength);

      // Derivar clave
      const key = await derivarClave(clave, salt);

      // Descifrar
      let decrypted: ArrayBuffer;
      if (algoritmo === 'AES-GCM') {
        decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          encrypted
        );
      } else {
        decrypted = await crypto.subtle.decrypt(
          { name: 'AES-CBC', iv: iv },
          key,
          encrypted
        );
      }

      // Decodificar texto
      const decoder = new TextDecoder();
      setResultado(decoder.decode(decrypted));

    } catch {
      setError('Error al descifrar. Verifica que la clave y el algoritmo sean correctos.');
      setResultado('');
    } finally {
      setProcesando(false);
    }
  }, [texto, clave, algoritmo]);

  // Procesar según modo
  const procesar = () => {
    if (modo === 'cifrar') {
      cifrar();
    } else {
      descifrar();
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

  // Copiar clave
  const copiarClave = async () => {
    if (!clave) return;
    try {
      await navigator.clipboard.writeText(clave);
    } catch {
      // Silencioso
    }
  };

  // Limpiar
  const limpiar = () => {
    setTexto('');
    setResultado('');
    setError('');
    setCopiado(false);
  };

  // Intercambiar
  const intercambiar = () => {
    setTexto(resultado);
    setResultado('');
    setError('');
    setModo(modo === 'cifrar' ? 'descifrar' : 'cifrar');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cifrado AES</h1>
        <p className={styles.subtitle}>
          Cifrado simétrico moderno AES-256 - El estándar de seguridad mundial
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Selector de modo */}
        <section className={styles.configPanel}>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'cifrar' ? styles.active : ''}`}
              onClick={() => setModo('cifrar')}
            >
              🔒 Cifrar
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'descifrar' ? styles.active : ''}`}
              onClick={() => setModo('descifrar')}
            >
              🔓 Descifrar
            </button>
          </div>

          {/* Selector de algoritmo */}
          <div className={styles.configItem}>
            <label className={styles.label}>Modo de operación</label>
            <div className={styles.algoritmoSelector}>
              <button
                type="button"
                className={`${styles.algoritmoBtn} ${algoritmo === 'AES-GCM' ? styles.active : ''}`}
                onClick={() => setAlgoritmo('AES-GCM')}
              >
                <span className={styles.algoName}>AES-GCM</span>
                <span className={styles.algoDesc}>Recomendado - Con autenticación</span>
              </button>
              <button
                type="button"
                className={`${styles.algoritmoBtn} ${algoritmo === 'AES-CBC' ? styles.active : ''}`}
                onClick={() => setAlgoritmo('AES-CBC')}
              >
                <span className={styles.algoName}>AES-CBC</span>
                <span className={styles.algoDesc}>Clásico - Solo cifrado</span>
              </button>
            </div>
          </div>

          {/* Clave */}
          <div className={styles.configItem}>
            <label className={styles.label}>Clave secreta</label>
            <div className={styles.claveContainer}>
              <input
                type={mostrarClave ? 'text' : 'password'}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Tu contraseña secreta..."
                className={styles.inputClave}
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className={styles.btnToggle}
                title={mostrarClave ? 'Ocultar' : 'Mostrar'}
              >
                {mostrarClave ? '👁️' : '👁️‍🗨️'}
              </button>
              <button
                type="button"
                onClick={copiarClave}
                className={styles.btnToggle}
                title="Copiar clave"
              >
                📋
              </button>
            </div>
            <div className={styles.claveActions}>
              <button type="button" onClick={generarClave} className={styles.btnSecondary}>
                🎲 Generar clave aleatoria
              </button>
            </div>
            <span className={styles.hint}>
              La clave se deriva usando PBKDF2 con 100.000 iteraciones para máxima seguridad
            </span>
          </div>
        </section>

        {/* Entrada de texto */}
        <section className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>
              {modo === 'cifrar' ? 'Texto a cifrar' : 'Texto cifrado (Base64)'}
            </h2>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={modo === 'cifrar'
              ? 'Escribe tu mensaje secreto...'
              : 'Pega el texto cifrado en Base64...'}
            className={styles.textArea}
            rows={5}
          />
          <button
            type="button"
            onClick={procesar}
            className={styles.btnPrimary}
            disabled={!texto.trim() || !clave.trim() || procesando}
          >
            {procesando ? '⏳ Procesando...' : (modo === 'cifrar' ? '🔒 Cifrar con AES' : '🔓 Descifrar')}
          </button>
        </section>

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
              <h2 className={styles.sectionTitle}>
                {modo === 'cifrar' ? 'Texto cifrado (Base64)' : 'Texto descifrado'}
              </h2>
              <div className={styles.resultActions}>
                <button type="button" onClick={intercambiar} className={styles.btnSecondary}>
                  ↕ Intercambiar
                </button>
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
              rows={5}
            />
            <div className={styles.stats}>
              <span>📊 {resultado.length} caracteres</span>
              {modo === 'cifrar' && (
                <span className={styles.warning}>
                  ⚠️ Guarda la clave - Sin ella no podrás descifrar el mensaje
                </span>
              )}
            </div>
          </section>
        )}

        {/* Info de seguridad */}
        <section className={styles.securityInfo}>
          <h3>🛡️ Características de seguridad</h3>
          <div className={styles.securityGrid}>
            <div className={styles.securityItem}>
              <span className={styles.checkIcon}>✓</span>
              <div>
                <strong>AES-256</strong>
                <p>Cifrado de 256 bits, imposible de romper por fuerza bruta</p>
              </div>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.checkIcon}>✓</span>
              <div>
                <strong>PBKDF2</strong>
                <p>100.000 iteraciones para derivar la clave, resistente a ataques de diccionario</p>
              </div>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.checkIcon}>✓</span>
              <div>
                <strong>Salt aleatorio</strong>
                <p>Cada cifrado usa un salt único, misma clave produce resultados diferentes</p>
              </div>
            </div>
            <div className={styles.securityItem}>
              <span className={styles.checkIcon}>✓</span>
              <div>
                <strong>100% local</strong>
                <p>Todo se procesa en tu navegador, nada se envía a ningún servidor</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre el cifrado AES?"
        subtitle="El estándar de cifrado que protege el mundo digital"
      >
        <section className={styles.infoSection}>
          <h2>Sobre el cifrado AES</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>🏛️ Historia</h3>
              <p>
                AES (Advanced Encryption Standard) fue adoptado por el gobierno de EE.UU.
                en 2001 tras un concurso público. El algoritmo ganador fue <strong>Rijndael</strong>,
                creado por los criptógrafos belgas Joan Daemen y Vincent Rijmen.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔐 Cómo funciona</h3>
              <p>
                AES es un cifrado por bloques que procesa datos en bloques de 128 bits.
                Usa una clave de 128, 192 o 256 bits. Cada bloque pasa por múltiples
                rondas de sustitución, permutación y mezcla.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚡ GCM vs CBC</h3>
              <p>
                <strong>GCM</strong> (Galois/Counter Mode) proporciona autenticación además de cifrado,
                detectando si el mensaje fue alterado. <strong>CBC</strong> (Cipher Block Chaining)
                es más antiguo y solo cifra, sin verificar integridad.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🌍 Uso actual</h3>
              <p>
                AES protege: comunicaciones HTTPS/TLS, WiFi WPA2/WPA3, discos cifrados,
                mensajería (WhatsApp, Signal), VPNs, y datos clasificados del gobierno de EE.UU.
                Es el estándar mundial.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-aes')} />

      <Footer appName="cifrado-aes" />
    </div>
  );
}
