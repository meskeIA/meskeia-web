'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CifradoAES.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      } as Pbkdf2Params,
      keyMaterial,
      { name: algoritmo, length: 256 } as AesKeyGenParams,
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

      <LegalNotice />

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

        {/* 1. Tabla Comparativa de modos de operación */}
        <section className={styles.infoSection}>
          <h2>Comparativa de modos de operación AES</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>ECB</th>
                  <th>CBC</th>
                  <th>GCM</th>
                  <th>CTR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Seguridad</strong></td>
                  <td className={styles.cellMala}>Muy baja</td>
                  <td className={styles.cellMedia}>Media</td>
                  <td className={styles.cellBuena}>Alta</td>
                  <td className={styles.cellBuena}>Alta</td>
                </tr>
                <tr>
                  <td><strong>Autenticación integrada</strong></td>
                  <td>No</td>
                  <td>No</td>
                  <td className={styles.cellBuena}>Sí (AEAD)</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>Paralelización</strong></td>
                  <td className={styles.cellBuena}>Sí</td>
                  <td className={styles.cellMala}>No (cifrado)</td>
                  <td className={styles.cellBuena}>Sí</td>
                  <td className={styles.cellBuena}>Sí</td>
                </tr>
                <tr>
                  <td><strong>Tamaño IV/Nonce</strong></td>
                  <td>Sin IV</td>
                  <td>128 bits</td>
                  <td>96 bits (recomendado)</td>
                  <td>64–128 bits</td>
                </tr>
                <tr>
                  <td><strong>Vulnerabilidades conocidas</strong></td>
                  <td className={styles.cellMala}>Patrones visibles en bloques idénticos</td>
                  <td className={styles.cellMedia}>Padding oracle (POODLE, BEAST)</td>
                  <td>Nonce reutilizado compromete autenticación</td>
                  <td>Reutilización de nonce compromete confidencialidad</td>
                </tr>
                <tr>
                  <td><strong>Uso recomendado</strong></td>
                  <td className={styles.cellMala}>Nunca usar</td>
                  <td className={styles.cellMedia}>Sistemas legacy</td>
                  <td className={styles.cellBuena}>Producción: TLS 1.3, APIs</td>
                  <td>Streaming sin necesidad de autenticación</td>
                </tr>
                <tr>
                  <td><strong>Estándar que lo avala</strong></td>
                  <td>NIST SP 800-38A</td>
                  <td>NIST SP 800-38A</td>
                  <td className={styles.cellBuena}>NIST SP 800-38D / FIPS 197</td>
                  <td>NIST SP 800-38A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de Uso */}
        <section className={styles.infoSection}>
          <h2>Casos de uso por perfil profesional</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <h3>Desarrollador web</h3>
              </div>
              <p className={styles.escenarioExample}>
                Cifrado de tokens de sesión, cookies sensibles y datos de usuario en tránsito.
              </p>
              <p className={styles.escenarioTip}>
                Usa <strong>AES-256-GCM</strong> con la Web Crypto API del navegador. Genera un nonce de 96 bits por operación y verifica el tag de autenticación antes de procesar los datos descifrados.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏢</span>
                <h3>Empresa con datos RGPD</h3>
              </div>
              <p className={styles.escenarioExample}>
                Cifrado de base de datos de clientes para cumplir el artículo 32 del RGPD y el Esquema Nacional de Seguridad (ENS).
              </p>
              <p className={styles.escenarioTip}>
                El RGPD exige cifrado como medida técnica de seguridad. El ENS (categoría Alta) requiere <strong>AES-256</strong>. Documenta el sistema de gestión de claves en el Registro de Actividades de Tratamiento.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔍</span>
                <h3>Profesional de seguridad</h3>
              </div>
              <p className={styles.escenarioExample}>
                Auditoría de sistemas que implementan cifrado AES para detectar configuraciones inseguras.
              </p>
              <p className={styles.escenarioTip}>
                Busca uso de <strong>ECB o CBC sin MAC</strong>, nonces hardcodeados, claves de baja entropía derivadas sin KDF, y ausencia de rotación de claves. Consulta CWE-326, CWE-327 y OWASP Cryptographic Failures (A02:2021).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h3>Estudiante de criptografía</h3>
              </div>
              <p className={styles.escenarioExample}>
                Aprendizaje práctico del funcionamiento interno de AES y sus modos de operación.
              </p>
              <p className={styles.escenarioTip}>
                Empieza por el ataque visual al modo ECB (cifrar una imagen BMP muestra patrones). Después implementa CBC manualmente para entender el encadenamiento de bloques. La referencia académica es el estándar <strong>FIPS PUB 197</strong> del NIST (2001).
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.infoSection}>
          <h2>Preguntas frecuentes sobre AES</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Qué diferencia hay entre AES-128 y AES-256?</h3>
              <p>
                La diferencia principal es el tamaño de clave: <strong>128 bits</strong> (10 rondas) frente a <strong>256 bits</strong> (14 rondas). AES-128 tiene 2<sup>128</sup> combinaciones posibles de clave; AES-256 tiene 2<sup>256</sup>. Ambos son considerados seguros hoy en día, pero AES-256 es el estándar recomendado por el NIST para información clasificada y es obligatorio en el ENS categoría Alta.
              </p>
              <span className={styles.faqTip}>NIST SP 800-57 recomienda AES-256 para datos con horizonte de protección superior a 30 años.</span>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Por qué GCM es superior a CBC para producción?</h3>
              <p>
                GCM es un modo <strong>AEAD (Authenticated Encryption with Associated Data)</strong>: cifra y autentica en una sola operación. CBC solo cifra; sin un MAC adicional (HMAC-SHA256), un atacante puede modificar el texto cifrado sin detección. Además, CBC es vulnerable a ataques de padding oracle (CVE-2014-8730 / POODLE) que permiten descifrar mensajes sin conocer la clave.
              </p>
              <span className={styles.faqTip}>TLS 1.3 eliminó CBC por completo y solo permite modos AEAD como AES-128-GCM y AES-256-GCM.</span>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué es un IV o nonce y por qué no se puede reutilizar?</h3>
              <p>
                El <strong>IV (Initialization Vector)</strong> o nonce es un valor aleatorio único por operación de cifrado. Su función es garantizar que el mismo texto plano produzca textos cifrados distintos cada vez. En GCM, reutilizar el nonce con la misma clave es catastrófico: permite recuperar la clave de autenticación (keystream reuse attack), comprometiendo tanto la confidencialidad como la integridad de todos los mensajes.
              </p>
              <span className={styles.faqTip}>El nonce en AES-GCM debe ser de 96 bits (12 bytes). Con nonces aleatorios, la probabilidad de colisión es despreciable hasta ~2<sup>32</sup> mensajes (límite recomendado por NIST).</span>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuál es la diferencia entre cifrado simétrico y asimétrico?</h3>
              <p>
                El cifrado <strong>simétrico</strong> (AES) usa la misma clave para cifrar y descifrar. Es muy rápido y adecuado para grandes volúmenes de datos. El cifrado <strong>asimétrico</strong> (RSA, ECC) usa un par de claves: pública para cifrar, privada para descifrar. Es más lento pero resuelve el problema de distribución de claves. En la práctica, TLS combina ambos: asimétrico para intercambiar la clave simétrica AES, y AES para el canal cifrado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo se almacena una clave AES de forma segura?</h3>
              <p>
                Nunca en texto plano en el código fuente o configuración. Las opciones recomendadas son: <strong>HSM (Hardware Security Module)</strong> para entornos enterprise, <strong>AWS KMS / Azure Key Vault / HashiCorp Vault</strong> en la nube, variables de entorno gestionadas por el sistema operativo (no en .env en producción), o derivación en tiempo real mediante PBKDF2/Argon2 desde una contraseña maestra. En España, la AEPD recomienda separar la gestión de claves de los datos cifrados.
              </p>
              <span className={styles.faqTip}>El ENS categoría Media exige que las claves criptográficas no se almacenen junto a los datos que protegen.</span>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué es AEAD?</h3>
              <p>
                <strong>AEAD (Authenticated Encryption with Associated Data)</strong> es un esquema criptográfico que proporciona simultáneamente confidencialidad (nadie puede leer el mensaje), integridad (nadie puede modificarlo sin detección) y autenticidad (se verifica el origen). AES-GCM es el algoritmo AEAD más usado. El "Additional Data" permite autenticar metadatos (como cabeceras) sin cifrarlos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tardaría en romperse AES-256 por fuerza bruta?</h3>
              <p>
                Con todo el poder computacional actual del planeta, romper AES-256 por fuerza bruta requeriría más tiempo que la edad estimada del universo (13.800 millones de años). El espacio de claves es de 2<sup>256</sup> ≈ 1,16 × 10<sup>77</sup> combinaciones. Incluso un hipotético ordenador cuántico con el algoritmo de Grover reduciría la seguridad efectiva a 128 bits, que sigue siendo irrompible en la práctica. El NIST ha ratificado AES-256 como seguro en la era post-cuántica.
              </p>
              <span className={styles.faqTip}>La amenaza real no es la fuerza bruta sobre AES, sino claves débiles, gestión incorrecta o vulnerabilidades en la implementación.</span>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué exige el RGPD sobre el cifrado?</h3>
              <p>
                El artículo 32 del RGPD establece que el cifrado es una medida técnica apropiada para garantizar la seguridad del tratamiento de datos personales. No es obligatorio en sentido estricto, pero su ausencia ante una brecha de seguridad puede considerarse negligencia. El considerando 83 especifica que el cifrado hace que los datos sean ininteligibles para personas no autorizadas. En España, la LOPDGDD complementa el RGPD; el INCIBE y el ENS detallan los requisitos técnicos aplicables al sector público y proveedores críticos.
              </p>
              <span className={styles.faqTip}>El RGPD exige notificar brechas a la AEPD en 72 horas. Si los datos comprometidos estaban cifrados con AES-256, la notificación a los afectados puede no ser obligatoria (art. 34.3.a RGPD).</span>
            </div>
          </div>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section className={styles.infoSection}>
          <h2>Guía: implementar cifrado AES correctamente en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Elige el modo correcto: AES-256-GCM</h3>
                <p>Selecciona AES-256 (clave de 256 bits) con modo GCM para obtener cifrado autenticado (AEAD). Evita ECB en cualquier caso. Usa CBC solo si necesitas compatibilidad con sistemas legacy y añade siempre un HMAC-SHA256 independiente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Genera la clave con una fuente segura</h3>
                <p>Usa <code>crypto.getRandomValues(new Uint8Array(32))</code> en el navegador o <code>crypto.randomBytes(32)</code> en Node.js. Nunca derives la clave directamente de una cadena de texto sin KDF. Una clave de 256 bits debe tener 256 bits de entropía real.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Si usas contraseña, aplica PBKDF2 o Argon2</h3>
                <p>Nunca uses <code>SHA256(contraseña)</code> como clave AES. Usa <strong>PBKDF2</strong> con mínimo 600.000 iteraciones (OWASP 2023) y SHA-256, o preferiblemente <strong>Argon2id</strong>. Genera un salt aleatorio de 128 bits por usuario y almacénalo junto a los datos cifrados.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Genera un nonce único por cada operación de cifrado</h3>
                <p>Para AES-GCM usa un nonce de 96 bits (12 bytes) generado con CSPRNG. Nunca reutilices un nonce con la misma clave. Si cifras muchos mensajes con la misma clave, considera usar nonces secuenciales con un contador criptográficamente seguro.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Cifra y almacena nonce + datos cifrados juntos</h3>
                <p>El nonce no es secreto, pero debe almacenarse con el mensaje cifrado para poder descifrarlo. Formato recomendado: <code>Base64(salt || nonce || ciphertext || authTag)</code>. El authTag en GCM tiene 128 bits y se genera automáticamente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Verifica el tag de autenticación al descifrar</h3>
                <p>En AES-GCM, la operación de descifrado verifica automáticamente el tag de autenticación. Si falla, lanza una excepción antes de devolver ningún dato. Nunca ignores errores de autenticación: indican que el mensaje fue alterado o que la clave es incorrecta.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Gestiona el ciclo de vida de las claves</h3>
                <p>Define una política de rotación de claves (anual o por volumen de datos). Almacena claves en un sistema dedicado (KMS, HSM) separado de los datos. Elimina claves de forma segura (sobreescritura). Registra el uso de claves para auditoría, especialmente en entornos RGPD o ENS.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores Prácticas */}
        <section className={styles.infoSection}>
          <h2>6 mejores prácticas de cifrado AES</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h3>Usa GCM sobre CBC</h3>
              <p>AES-GCM proporciona autenticación integrada (AEAD). TLS 1.3 solo acepta modos AEAD. CBC sin MAC es vulnerable a ataques de padding oracle. Si tu librería ofrece ambas opciones, elige siempre GCM.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔑</span>
              <h3>Nunca reutilices el IV/nonce</h3>
              <p>Genera un nonce aleatorio nuevo para cada operación de cifrado. En AES-GCM, reutilizar el nonce con la misma clave expone el keystream y destruye la autenticación. Almacena el nonce junto al ciphertext; no es secreto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <h3>Longitud de clave: siempre 256 bits</h3>
              <p>AES-128 es seguro hoy, pero AES-256 es el estándar recomendado para datos con largo horizonte temporal y para cumplir ENS categoría Alta y requisitos de defensa nacional. El coste de rendimiento es mínimo (&lt;15%).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <h3>Gestión segura de claves con KMS</h3>
              <p>Usa AWS KMS, Azure Key Vault, Google Cloud KMS o HashiCorp Vault. Separa la clave de los datos que protege. Activa la auditoría de uso de claves. En entornos on-premise, considera un HSM (Hardware Security Module) certificado FIPS 140-2.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧂</span>
              <h3>Derivación de clave: PBKDF2 o Argon2id</h3>
              <p>Si la clave AES se deriva de una contraseña de usuario, usa PBKDF2 con SHA-256 y mínimo 600.000 iteraciones (OWASP 2023), o Argon2id con los parámetros recomendados (m=64MB, t=3, p=4). Siempre con salt aleatorio de 128+ bits.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h3>Rotación periódica de claves</h3>
              <p>Define una política de rotación anual o por volumen (máximo 2<sup>32</sup> bloques por clave en GCM según NIST). La rotación limita el impacto de una clave comprometida. Implementa re-cifrado incremental para no interrumpir el servicio.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box */}
        <section className={styles.infoSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h2>Errores críticos que debes evitar</h2>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Reutilizar el IV/nonce con la misma clave.</strong> En AES-GCM destruye la autenticación y expone el keystream. En AES-CTR permite recuperar el texto plano mediante XOR. Genera siempre un nonce aleatorio nuevo por operación.
              </li>
              <li>
                <strong>Usar el modo ECB (Electronic Codebook).</strong> Bloques de texto plano idénticos producen bloques cifrados idénticos, revelando patrones. La "imagen ECB del pingüino de Linux" es el ejemplo didáctico clásico. ECB no debe usarse jamás para datos reales.
              </li>
              <li>
                <strong>Hardcodear claves en el código fuente.</strong> Las claves embebidas en el código se filtran en repositorios, logs y artefactos de build. Usa variables de entorno gestionadas por el sistema o un KMS. Nunca hagas commit de claves; usa <code>.gitignore</code> y herramientas de detección de secretos como TruffleHog o GitLeaks.
              </li>
              <li>
                <strong>No autenticar el texto cifrado (CBC sin MAC).</strong> Sin autenticación, un atacante puede modificar el ciphertext de forma predecible (bit-flipping). Ataques como POODLE y BEAST explotan CBC sin MAC. Usa AES-GCM (AEAD) o añade HMAC-SHA256 sobre el ciphertext en modo Encrypt-then-MAC.
              </li>
              <li>
                <strong>Claves débiles derivadas de contraseñas sin KDF.</strong> <code>SHA256("miContraseña")</code> como clave AES es vulnerable a ataques de diccionario con GPU. Una contraseña de 8 caracteres puede tener menos de 52 bits de entropía. Usa siempre PBKDF2, bcrypt, scrypt o Argon2id para derivar claves desde contraseñas.
              </li>
              <li>
                <strong>No gestionar correctamente el padding en CBC.</strong> CBC requiere que el texto plano sea múltiplo del tamaño de bloque (128 bits). El padding incorrecto o predecible es el origen de los ataques de padding oracle. Usa siempre PKCS#7 y verifica el padding en tiempo constante para evitar ataques de temporización.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-aes')} />

      <ShareCard appName="cifrado-aes" />
      <Footer appName="cifrado-aes" />
    </div>
  );
}
