'use client';

import { useState, useEffect } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import ResultCard from '@/components/ResultCard';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { jsonLd } from './metadata';
import styles from './GeneradorContrasenas.module.css';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de caracteres para generar contraseñas
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// Presets rápidos
const PRESETS = {
  web: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false },
  banking: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true },
  wifi: { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true },
};

interface PasswordHistoryItem {
  password: string;
  timestamp: number;
  strength: number;
}

export default function GeneradorContrasenas() {
  // Estados principales
  const [length, setLength] = useState<number>(16);
  const [useUppercase, setUseUppercase] = useState<boolean>(true);
  const [useLowercase, setUseLowercase] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [strength, setStrength] = useState<number>(0);
  const [history, setHistory] = useState<PasswordHistoryItem[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Cargar historial desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('password-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (e) {
        console.error('Error al cargar historial:', e);
      }
    }
  }, []);

  // Guardar historial en localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('password-history', JSON.stringify(history));
    }
  }, [history]);

  // Generar contraseña al cargar
  useEffect(() => {
    generatePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Genera un carácter aleatorio usando crypto API (seguro)
   */
  const getRandomChar = (chars: string): string => {
    const array = new Uint8Array(1);
    let randomIndex: number;
    const maxValidValue = chars.length * Math.floor(256 / chars.length);

    do {
      crypto.getRandomValues(array);
      randomIndex = array[0];
    } while (randomIndex >= maxValidValue);

    return chars[randomIndex % chars.length];
  };

  /**
   * Algoritmo Fisher-Yates para mezclar array de forma segura
   */
  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    const randomValues = new Uint8Array(shuffled.length);
    crypto.getRandomValues(randomValues);

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomValues[i] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  };

  /**
   * Calcula la fuerza de la contraseña (0-5)
   */
  const calculateStrength = (pwd: string): number => {
    let score = 0;

    // Longitud
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;

    // Diversidad de caracteres
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    // Normalizar a escala 0-5
    return Math.min(5, Math.floor(score / 1.4));
  };

  /**
   * Genera nueva contraseña
   */
  const generatePassword = () => {
    // Validación: al menos un tipo de carácter seleccionado
    if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
      alert('Selecciona al menos un tipo de carácter');
      return;
    }

    // Construir conjunto de caracteres disponibles
    let availableChars = '';
    const requiredChars: string[] = [];

    if (useUppercase) {
      availableChars += CHAR_SETS.uppercase;
      requiredChars.push(getRandomChar(CHAR_SETS.uppercase));
    }
    if (useLowercase) {
      availableChars += CHAR_SETS.lowercase;
      requiredChars.push(getRandomChar(CHAR_SETS.lowercase));
    }
    if (useNumbers) {
      availableChars += CHAR_SETS.numbers;
      requiredChars.push(getRandomChar(CHAR_SETS.numbers));
    }
    if (useSymbols) {
      availableChars += CHAR_SETS.symbols;
      requiredChars.push(getRandomChar(CHAR_SETS.symbols));
    }

    // Generar el resto de caracteres aleatorios
    const remainingLength = length - requiredChars.length;
    const randomChars: string[] = [];

    for (let i = 0; i < remainingLength; i++) {
      randomChars.push(getRandomChar(availableChars));
    }

    // Combinar y mezclar
    const allChars = [...requiredChars, ...randomChars];
    const shuffled = shuffleArray(allChars);
    const newPassword = shuffled.join('');

    // Calcular fuerza
    const newStrength = calculateStrength(newPassword);

    // Actualizar estado
    setPassword(newPassword);
    setStrength(newStrength);

    // Añadir al historial (máximo 10)
    const newHistoryItem: PasswordHistoryItem = {
      password: newPassword,
      timestamp: Date.now(),
      strength: newStrength,
    };

    setHistory((prev) => {
      const updated = [newHistoryItem, ...prev];
      return updated.slice(0, 10);
    });
  };

  /**
   * Copiar contraseña al portapapeles
   */
  const copyToClipboard = async (pwd: string) => {
    try {
      await navigator.clipboard.writeText(pwd);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar la contraseña');
    }
  };

  /**
   * Aplicar preset rápido
   */
  const applyPreset = (presetName: keyof typeof PRESETS) => {
    const preset = PRESETS[presetName];
    setLength(preset.length);
    setUseUppercase(preset.uppercase);
    setUseLowercase(preset.lowercase);
    setUseNumbers(preset.numbers);
    setUseSymbols(preset.symbols);
    setTimeout(() => generatePassword(), 0);
  };

  /**
   * Obtener texto de fuerza
   */
  const getStrengthText = (): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'Muy débil';
      case 2:
        return 'Débil';
      case 3:
        return 'Media';
      case 4:
        return 'Fuerte';
      case 5:
        return 'Muy fuerte';
      default:
        return '';
    }
  };

  /**
   * Obtener variante de ResultCard según fuerza
   */
  const getStrengthVariant = ():
    | 'default'
    | 'highlight'
    | 'success'
    | 'warning'
    | 'info' => {
    if (strength <= 1) return 'warning';
    if (strength <= 2) return 'info';
    if (strength <= 3) return 'default';
    if (strength === 4) return 'highlight';
    return 'success';
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Analytics */}
      <AnalyticsTracker applicationName="generador-contrasenas" />

      {/* Header meskeIA */}
      <MeskeiaLogo />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>🔐 Generador de Contraseñas Seguras</h1>
          <p className={styles.subtitle}>
            Crea contraseñas criptográficamente seguras con opciones personalizables
          </p>
        </header>

        <LegalNotice />

        {/* Resultado Principal */}
        <div className={styles.resultSection}>
          <ResultCard
            title="Contraseña Generada"
            value={password || 'Generando...'}
            description={`Fuerza: ${getStrengthText()}`}
            variant={getStrengthVariant()}
            icon="🔑"
          >
            <div className={styles.passwordActions}>
              <button
                type="button"
                onClick={() => copyToClipboard(password)}
                className={styles.btnCopy}
                disabled={!password}
              >
                {copyFeedback ? '✅ Copiado' : '📋 Copiar'}
              </button>
              <button
                type="button"
                onClick={generatePassword}
                className={styles.btnGenerate}
              >
                🔄 Generar Nueva
              </button>
            </div>
          </ResultCard>

          {/* Medidor de fuerza visual */}
          <div className={styles.strengthMeter}>
            <div className={styles.strengthLabel}>Nivel de Seguridad:</div>
            <div className={styles.strengthBar}>
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`${styles.strengthSegment} ${
                    level <= strength ? styles[`strength${strength}`] : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Presets Rápidos */}
        <div className={styles.presetsSection}>
          <h3 className={styles.sectionTitle}>⚡ Presets Rápidos</h3>
          <div className={styles.presetButtons}>
            <button
              type="button"
              onClick={() => applyPreset('web')}
              className={styles.btnPreset}
            >
              🌐 Web<span className={styles.presetInfo}>(12 caracteres)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('banking')}
              className={styles.btnPreset}
            >
              🏦 Bancaria<span className={styles.presetInfo}>(16 caracteres)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('wifi')}
              className={styles.btnPreset}
            >
              📡 Wi-Fi<span className={styles.presetInfo}>(20 caracteres)</span>
            </button>
          </div>
        </div>

        {/* Configuración Personalizada */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>⚙️ Personalizar Contraseña</h3>

          {/* Longitud */}
          <div className={styles.inputGroup}>
            <label htmlFor="length" className={styles.label}>
              Longitud: <strong>{length}</strong> caracteres
            </label>
            <input
              type="range"
              id="length"
              className={styles.slider}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              min={4}
              max={64}
              step={1}
            />
            <div className={styles.sliderLabels}>
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          {/* Checkboxes de tipos de caracteres */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useUppercase}
                onChange={(e) => setUseUppercase(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Mayúsculas (A-Z)</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useLowercase}
                onChange={(e) => setUseLowercase(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Minúsculas (a-z)</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Números (0-9)</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Símbolos (!@#$%...)</span>
            </label>
          </div>
        </div>

        {/* Historial */}
        {history.length > 0 && (
          <div className={styles.historySection}>
            <h3 className={styles.sectionTitle}>📜 Historial (últimas 10)</h3>
            <div className={styles.historyList}>
              {history.map((item, index) => (
                <div key={item.timestamp} className={styles.historyItem}>
                  <span className={styles.historyPassword}>{item.password}</span>
                  <div className={styles.historyActions}>
                    <span
                      className={`${styles.historyStrength} ${
                        styles[`historyStrength${item.strength}`]
                      }`}
                    >
                      {['Muy débil', 'Débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'][
                        item.strength
                      ] || 'Media'}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.password)}
                      className={styles.btnHistoryCopy}
                      title="Copiar"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <EducationalSection
          title="Guía de Seguridad Digital: Contraseñas"
          subtitle="Aprende sobre entropía, ataques de fuerza bruta, gestores de contraseñas y mejores prácticas"
          icon="🔐"
        >
          <section>
            <h4>¿Por qué son importantes las contraseñas seguras?</h4>
            <p>Las contraseñas son la primera línea de defensa para proteger tu información personal, cuentas bancarias, correos electrónicos y datos sensibles. Una contraseña débil puede ser descifrada en segundos por herramientas automatizadas.</p>
            <ul>
              <li><strong>🚨 El 81% de las brechas</strong>: Se deben a contraseñas débiles o reutilizadas (Verizon Data Breach Report). Los atacantes usan diccionarios, fuerza bruta y listas de contraseñas filtradas.</li>
              <li><strong>⏱️ Tiempo de descifrado</strong>: Una contraseña de 8 caracteres solo con minúsculas puede descifrarse en minutos. Con mayúsculas, números y símbolos, el tiempo aumenta a años o incluso siglos.</li>
              <li><strong>🔐 Protección multicapa</strong>: Contraseñas fuertes + autenticación de dos factores (2FA) multiplica exponencialmente la seguridad.</li>
              <li><strong>💡 Unicidad es clave</strong>: Reutilizar la misma contraseña es extremadamente peligroso. Si un sitio sufre una brecha, todas tus cuentas quedan comprometidas.</li>
            </ul>
          </section>

          <section>
            <h4>Características de una contraseña fuerte</h4>
            <ul>
              <li><strong>📏 Longitud adecuada</strong>: Mínimo 12 caracteres, idealmente 16 o más. Cada carácter adicional aumenta exponencialmente la dificultad de descifrado.</li>
              <li><strong>🔤 Diversidad de caracteres</strong>: Combina mayúsculas, minúsculas, números y símbolos. Esto multiplica las combinaciones posibles de 26 a más de 90 caracteres disponibles.</li>
              <li><strong>🎲 Aleatoriedad total</strong>: Evita patrones predecibles como &quot;123456&quot;, &quot;qwerty&quot; o fechas de nacimiento. Esta herramienta usa <code>crypto.getRandomValues()</code> (API criptográfica del navegador).</li>
              <li><strong>🚫 Sin información personal</strong>: No incluyas tu nombre, apellidos, fechas importantes o datos obtenibles de redes sociales.</li>
            </ul>
          </section>

          <section>
            <h4>Gestores de Contraseñas: Tu mejor aliado</h4>
            <p>Con contraseñas únicas de 16+ caracteres para cada cuenta, es imposible recordarlas todas. Los <strong>gestores de contraseñas</strong> resuelven este problema de forma segura.</p>
            <ul>
              <li><strong>🗄️ ¿Qué es un gestor?</strong>: Aplicación que almacena todas tus contraseñas en una bóveda cifrada, protegida por una única contraseña maestra. Solo necesitas recordar una.</li>
              <li><strong>🛡️ Seguridad</strong>: Usa cifrado AES-256 (estándar militar). Ni siquiera la empresa del gestor puede acceder a tus contraseñas. Todo se descifra localmente.</li>
              <li><strong>📱 Opciones recomendadas</strong>: <strong>Bitwarden</strong> (open-source, gratuito), <strong>1Password</strong>, <strong>KeePassXC</strong> (local, sin nube), o los gestores integrados en navegadores (con limitaciones).</li>
            </ul>
          </section>

          <section>
            <h4>Mejores prácticas de seguridad</h4>
            <ul>
              <li><strong>Una contraseña por servicio</strong>: Nunca reutilices. Si un sitio sufre una brecha, solo esa cuenta se verá comprometida.</li>
              <li><strong>Contraseña maestra memorable</strong>: Para tu gestor, usa una frase de 4-5 palabras aleatorias (&quot;Caballo-Batería-Grapadora-Correcta&quot;). Fácil de recordar, imposible de adivinar.</li>
              <li><strong>Activa 2FA siempre</strong>: Google Authenticator, Authy o claves físicas (YubiKey). El 2FA protege incluso si la contraseña es robada.</li>
              <li><strong>Cambia contraseñas comprometidas</strong>: Comprueba regularmente en <em>haveibeenpwned.com</em> si tu email aparece en filtraciones.</li>
              <li><strong>Cuidado con el phishing</strong>: Verifica siempre la URL antes de introducir credenciales. Los ataques de phishing son la técnica más común hoy en día.</li>
            </ul>
          </section>

          <section>
            <h4>Preguntas frecuentes</h4>
            <ul>
              <li><strong>¿Es seguro usar un generador online?</strong> Sí, si usa <code>crypto.getRandomValues()</code> como esta herramienta. La generación ocurre 100% en tu dispositivo, sin enviar datos a servidores.</li>
              <li><strong>¿Debo cambiar contraseñas regularmente?</strong> No es necesario si usas contraseñas únicas y fuertes. Solo cámbialas si hay sospecha de compromiso o brecha anunciada.</li>
              <li><strong>¿Qué hago si olvido mi contraseña maestra?</strong> Los gestores no pueden recuperarla por diseño. Escríbela en papel y guárdala en un lugar físico seguro como backup inicial.</li>
              <li><strong>¿Frase o caracteres aleatorios?</strong> Para la contraseña maestra del gestor: frase larga y memorable. Para el resto: caracteres aleatorios de 16+ generados por herramienta (no necesitas recordarlas).</li>
            </ul>
          </section>
        </EducationalSection>
      </main>

      {/* Footer meskeIA */}
      <RelatedApps apps={getRelatedApps('Generador de Contraseñas Seguras')} />
      <ShareCard appName="Generador de Contraseñas Seguras" />
      <Footer appName="Generador de Contraseñas Seguras" />
    </>
  );
}
