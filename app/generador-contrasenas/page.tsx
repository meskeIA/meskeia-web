'use client';
// @disclaimer: exempt

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

  // Guardar/limpiar historial en localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('password-history', JSON.stringify(history));
    } else {
      localStorage.removeItem('password-history');
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
   * Borrar historial de contraseñas del estado y localStorage
   */
  const clearHistory = () => {
    setHistory([]);
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
            <div className={styles.historySectionHeader}>
              <h3 className={styles.sectionTitle}>📜 Historial (últimas 10)</h3>
              <button
                type="button"
                onClick={clearHistory}
                className={styles.btnClearHistory}
                aria-label="Borrar historial de contraseñas almacenado"
              >
                🗑️ Borrar historial
              </button>
            </div>
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
          title="🔐 Guía completa de seguridad digital: contraseñas y autenticación"
          subtitle="Aprende sobre entropía, ataques de fuerza bruta, gestores de contraseñas y mejores prácticas para proteger tus cuentas"
          icon="🔐"
        >
          {/* TABLA COMPARATIVA */}
          <section className={styles.eduComparativa}>
            <h2>⚖️ Tipos de contraseña: seguridad vs. memorabilidad</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Ejemplo</th>
                    <th>Entropía</th>
                    <th>Tiempo descifrado</th>
                    <th>Memorabilidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>8 chars, solo letras</strong></td>
                    <td>contraseñ</td>
                    <td>~38 bits</td>
                    <td>Minutos</td>
                    <td>Alta</td>
                  </tr>
                  <tr>
                    <td><strong>8 chars, mixto</strong></td>
                    <td>C0ntr4s3!</td>
                    <td>~52 bits</td>
                    <td>Horas-días</td>
                    <td>Media</td>
                  </tr>
                  <tr>
                    <td><strong>12 chars, mixto</strong></td>
                    <td>X#9mK$pL2&amp;qR</td>
                    <td>~78 bits</td>
                    <td>Siglos</td>
                    <td>Baja</td>
                  </tr>
                  <tr>
                    <td><strong>16 chars, mixto</strong></td>
                    <td>4@Tz!9xPmL#2vQ&amp;k</td>
                    <td>~104 bits</td>
                    <td>Inviable</td>
                    <td>Ninguna (gestor)</td>
                  </tr>
                  <tr>
                    <td><strong>Frase de paso (4 palabras)</strong></td>
                    <td>Caballo-Batería-Rosa-7</td>
                    <td>~70 bits</td>
                    <td>Cientos de años</td>
                    <td>Muy alta</td>
                  </tr>
                  <tr>
                    <td><strong>Frase de paso (5+ palabras)</strong></td>
                    <td>Lluvia-Mesa-Cohete-Azul-42</td>
                    <td>~90 bits</td>
                    <td>Inviable</td>
                    <td>Alta</td>
                  </tr>
                  <tr>
                    <td><strong>PIN de 6 dígitos</strong></td>
                    <td>482901</td>
                    <td>~20 bits</td>
                    <td>Segundos</td>
                    <td>Alta</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ESCENARIOS */}
          <section className={styles.eduEscenarios}>
            <h2>🎯 Situaciones reales de seguridad de contraseñas</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏦</span>
                  <h3>Cuenta bancaria online</h3>
                </div>
                <p className={styles.escenarioExample}>
                  Riesgo: máximo. Un atacante con tu contraseña bancaria puede vaciar tu cuenta en minutos. El banco puede no reembolsar si hay &quot;negligencia&quot; (contraseña débil o reutilizada).
                  <br /><strong>Recomendación: 16+ chars únicos + 2FA con app (no SMS). Guardar en gestor.</strong>
                </p>
                <p className={styles.escenarioTip}>💡 Activa siempre las notificaciones de transacción por email/SMS como segunda capa de alerta.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📧</span>
                  <h3>Email principal (cuenta maestra)</h3>
                </div>
                <p className={styles.escenarioExample}>
                  Riesgo: crítico. Tu email es la llave de todo: quien controla tu email puede resetear TODAS tus otras contraseñas. Es la cuenta más importante de proteger.
                  <br /><strong>Recomendación: contraseña única de 20+ chars, 2FA con YubiKey o app TOTP, nunca SMS.</strong>
                </p>
                <p className={styles.escenarioTip}>💡 El email es la &quot;cuenta madre&quot;. Si cae, caen todas. Prioriza su seguridad sobre cualquier otra.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎮</span>
                  <h3>Cuenta de videojuegos / streaming</h3>
                </div>
                <p className={styles.escenarioExample}>
                  Riesgo: medio. Las cuentas gaming con skins o ítems de valor real son objetivo frecuente. Las cuentas de streaming se revenden en mercados negros cuando se reutiliza la contraseña de otra filtración.
                  <br /><strong>Recomendación: contraseña única de 12+ chars. 2FA si la plataforma lo permite.</strong>
                </p>
                <p className={styles.escenarioTip}>💡 La reutilización de contraseñas es el vector más común de robo de cuentas gaming. Una filtración en un sitio menor compromete todas.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>💼</span>
                  <h3>Acceso VPN / cuentas corporativas</h3>
                </div>
                <p className={styles.escenarioExample}>
                  Riesgo: muy alto para tu empresa. Un empleado con contraseña corporativa débil o reutilizada puede ser el punto de entrada de un ransomware que paralice toda la organización.
                  <br /><strong>Recomendación: gestor corporativo (1Password Teams, Bitwarden Enterprise), política de rotación + 2FA obligatorio.</strong>
                </p>
                <p className={styles.escenarioTip}>💡 El 95% de los ataques de ransomware comienzan por credenciales robadas o débiles. La inversión en un gestor corporativo es la mejor ROI en ciberseguridad.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>☁️</span>
                  <h3>Servicios cloud (AWS, Google Cloud)</h3>
                </div>
                <p className={styles.escenarioExample}>
                  Riesgo: extremo. Credenciales de AWS expuestas accidentalmente (en GitHub, por ejemplo) pueden generar facturas de miles de euros en horas por mineros de criptomonedas.
                  <br /><strong>Recomendación: NUNCA contraseñas en código. Usar IAM roles, MFA obligatorio para root, alertas de billing.</strong>
                </p>
                <p className={styles.escenarioTip}>💡 Activa alertas de facturación en AWS/GCP con umbral de 10€. Si aparecen cargos inesperados, actúa en minutos.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏠</span>
                  <h3>WiFi doméstica y router</h3>
                </div>
                <p className={styles.escenarioExample}>
                  Riesgo: frecuentemente ignorado. Un router con contraseña por defecto o débil permite a vecinos o atacantes acceder a tu red, interceptar tráfico, y comprometer todos los dispositivos conectados.
                  <br /><strong>Recomendación: WPA3 o WPA2, contraseña de 20+ chars aleatoria, cambiar usuario admin del router.</strong>
                </p>
                <p className={styles.escenarioTip}>💡 Cambia siempre las credenciales por defecto del router (usuario &quot;admin&quot; + contraseña &quot;admin&quot; o &quot;1234&quot;). Es el primer paso de cualquier auditoría de seguridad doméstica.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.eduFaq}>
            <h2>❓ Preguntas frecuentes sobre contraseñas y seguridad digital</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Es seguro usar un generador de contraseñas online?</h4>
                <p>
                  Depende de cómo funcione. Esta herramienta usa <code>crypto.getRandomValues()</code>, la API criptográfica del navegador, que genera números verdaderamente aleatorios usando el hardware del dispositivo. La generación ocurre 100% en tu dispositivo, sin enviar ningún dato a servidores. Para verificar: abre DevTools → Network y comprueba que no hay requests al generar. Los generadores que generan en el servidor (con seed predecible o sin HTTPS) sí son peligrosos.
                </p>
                <p className={styles.faqTip}>💡 <strong>Cómo verificar:</strong> Busca que el generador use <code>crypto.getRandomValues()</code> (JavaScript) o equivalente. Si envía datos a un servidor para generar, no lo uses.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Debo cambiar mis contraseñas regularmente?</h4>
                <p>
                  La recomendación moderna (NIST 2023) es NO cambiar contraseñas regularmente si son únicas y fuertes. El cambio periódico obligatorio lleva a los usuarios a crear contraseñas débiles con pequeñas variaciones (Contraseña1 → Contraseña2). Sí debes cambiarlas cuando: hay sospecha de compromiso, el servicio anuncia una brecha, o aparece tu email en haveibeenpwned.com. Para cuentas críticas (banco, email), cambia cada 12-18 meses como buena práctica.
                </p>
                <p className={styles.faqTip}>💡 <strong>Comprueba hoy:</strong> Ve a haveibeenpwned.com e introduce tu email para ver si aparece en filtraciones conocidas. Es gratuito y muy revelador.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Los gestores de contraseñas son seguros? ¿Qué pasa si los hackean?</h4>
                <p>
                  Los gestores de contraseñas de referencia (Bitwarden, 1Password, KeePassXC) usan arquitectura zero-knowledge: ni la empresa puede ver tus contraseñas. Todo se cifra localmente con AES-256 antes de enviarse al servidor. Si hackean el servidor, solo obtienen datos cifrados ilegibles. El riesgo real es tu contraseña maestra: si es débil o la pierdes, pierdes el acceso. 1Password sufrió un incidente en 2022 y solo se expusieron metadatos cifrados, no contraseñas.
                </p>
                <p className={styles.faqTip}>💡 <strong>Recomendación:</strong> Bitwarden (open-source, auditable, gratuito) o 1Password. Usa una contraseña maestra de 5+ palabras aleatorias y guarda una copia física en lugar seguro.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué es la autenticación de dos factores (2FA) y cuál es mejor?</h4>
                <p>
                  El 2FA añade un segundo factor de verificación: algo que sabes (contraseña) + algo que tienes (código temporal). Opciones ordenadas de menor a mayor seguridad: SMS (vulnerable a SIM swapping) &lt; Email OTP &lt; App TOTP (Google Authenticator, Authy) &lt; Passkeys &lt; Llaves físicas (YubiKey). El SMS 2FA es 99% mejor que nada, pero puede vulnerarse mediante intercambio de SIM (llamar al operador haciéndose pasar por ti). Las apps TOTP son seguras y gratuitas.
                </p>
                <p className={styles.faqTip}>💡 <strong>Empieza aquí:</strong> Activa 2FA con app TOTP (Authy, Google Authenticator) en email, banco y redes sociales. Es el mayor impacto en seguridad por el menor esfuerzo.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué es el SIM swapping y cómo protegerse?</h4>
                <p>
                  El SIM swapping es un ataque donde el atacante llama a tu operador móvil, se hace pasar por ti y transfiere tu número a una nueva SIM que él controla. A partir de ese momento, recibe todos tus SMS, incluyendo los códigos 2FA por SMS. Para protegerte: usa 2FA por app (no SMS) en cuentas críticas, activa un PIN de seguridad con tu operador para cambios de SIM, y usa contraseñas fuertes y únicas para la cuenta del operador.
                </p>
                <p className={styles.faqTip}>💡 <strong>Acción inmediata:</strong> Llama a tu operador y pide activar &quot;bloqueo de portabilidad&quot; o &quot;PIN de seguridad de SIM&quot;. Muchos operadores ofrecen esta protección adicional gratuita.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué son las passkeys y van a reemplazar las contraseñas?</h4>
                <p>
                  Las passkeys son el futuro de la autenticación. Funcionan con criptografía de clave pública: tu dispositivo guarda la clave privada (protegida por biometría o PIN local) y el servidor guarda solo la clave pública. No hay contraseña que robar. No son vulnerables a phishing (la autenticación está vinculada al dominio específico). Apple, Google y Microsoft ya las soportan. Se estima que en 5-7 años substituirán las contraseñas en la mayoría de servicios.
                </p>
                <p className={styles.faqTip}>💡 <strong>Empieza ya:</strong> Servicios como Google, Apple, Microsoft, GitHub, PayPal y Amazon ya ofrecen passkeys. Actívalas donde estén disponibles para máxima seguridad sin fricción.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo sé si mi contraseña ha sido filtrada en una brecha de datos?</h4>
                <p>
                  haveibeenpwned.com (de Troy Hunt, experto en seguridad) es el servicio de referencia. Busca tu email y comprueba si aparece en las bases de datos de filtraciones conocidas. Para contraseñas, usa el servicio de contraseñas de HIBP: aplica k-anonymity (solo envía los primeros 5 caracteres del hash SHA-1 de tu contraseña, nunca la contraseña completa). Firefox Monitor y Google Password Checkup hacen lo mismo de forma integrada.
                </p>
                <p className={styles.faqTip}>💡 <strong>Acción:</strong> Comprueba tu email en haveibeenpwned.com ahora mismo. Si aparece en alguna filtración, cambia la contraseña de ese servicio y de cualquier otro donde la hayas reutilizado.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Frase de paso vs. contraseña aleatoria: cuál es mejor para la contraseña maestra del gestor?</h4>
                <p>
                  Para la contraseña maestra del gestor (la única que debes recordar): una frase de 4-5 palabras aleatorias es mejor porque tiene suficiente entropía (~70-90 bits), es memorizable y resistente a ataques de diccionario si las palabras son realmente aleatorias (usa dados o un generador). Para el resto de contraseñas (guardadas en el gestor): usa caracteres aleatorios de 16+ caracteres generados por esta herramienta, ya que no necesitas recordarlas.
                </p>
                <p className={styles.faqTip}>💡 <strong>Método Diceware:</strong> Tira 5 dados 5 veces y busca las palabras correspondientes en una lista Diceware. El resultado es una frase verdaderamente aleatoria con ~65 bits de entropía. Muy segura y recordable.</p>
              </div>
            </div>
          </section>

          {/* GUÍA PASO A PASO */}
          <section className={styles.eduGuia}>
            <h2>📋 Cómo proteger tus cuentas digitales paso a paso</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Instala un gestor de contraseñas hoy mismo</h4>
                  <p>Bitwarden (gratuito, open-source) o 1Password (de pago, interfaz superior). Instala la extensión de navegador y la app móvil. Crea una contraseña maestra fuerte con una frase de 4-5 palabras aleatorias. Guarda esta contraseña maestra en papel físico en un lugar seguro (no en el móvil ni en otro servicio digital).</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Cambia primero las contraseñas de tus cuentas críticas</h4>
                  <p>Prioridad: email principal → banco → otras cuentas financieras → redes sociales → resto. Genera una contraseña nueva de 16+ caracteres con esta herramienta, guárdala en el gestor y úsala en el servicio. Haz esto para las 5-10 cuentas más importantes antes de hacer nada más.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Activa 2FA en email y banco</h4>
                  <p>Instala Authy o Google Authenticator. Activa 2FA en tu email primero (es la cuenta más crítica), luego en el banco, y después en el resto de cuentas donde sea posible. Prefiere siempre app TOTP sobre SMS. Guarda los códigos de recuperación del 2FA en tu gestor de contraseñas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Comprueba si tus cuentas han sido filtradas</h4>
                  <p>Ve a haveibeenpwned.com e introduce tus emails. Para cada cuenta que aparezca en una filtración, cambia la contraseña inmediatamente (aunque ya lo hayas hecho, por si la antigua está en la lista). Si el gestor de contraseñas lo permite (Bitwarden, 1Password), usa su función de monitoreo de brechas integrado.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Migra gradualmente el resto de cuentas al gestor</h4>
                  <p>No intentes cambiar todo de golpe. Cada vez que uses un servicio, si la contraseña no está en el gestor o es débil/reutilizada, cámbiala en ese momento. En 1-2 meses, la mayoría de tus cuentas activas tendrán contraseñas únicas y fuertes sin esfuerzo adicional concentrado.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <h4>Protege el dispositivo y la red</h4>
                  <p>PIN o biometría en el móvil (sin él, quien lo tenga tiene acceso a tu gestor). Contraseña WiFi fuerte en casa (WPA2/WPA3, 20+ chars). Cambia las credenciales por defecto del router. Usa HTTPS siempre (el candado verde en la URL). En WiFi públicas, usa VPN antes de acceder a cuentas sensibles.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <h4>Mantén el sistema y revisa anualmente</h4>
                  <p>Actualiza el gestor de contraseñas y las apps 2FA regularmente. Una vez al año: revisa en haveibeenpwned.com si aparecen nuevas filtraciones, cambia contraseñas de cuentas críticas como precaución, y desactiva cuentas en servicios que ya no uses (cuentas abandonadas con tu contraseña reutilizada son vectores de ataque).</p>
                </div>
              </div>
            </div>
          </section>

          {/* TIPS */}
          <section className={styles.eduTips}>
            <h2>✅ Mejores prácticas de seguridad digital</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔑</span>
                <h4>Una contraseña por servicio</h4>
                <p>Nunca reutilices. Si un sitio sufre una brecha, solo esa cuenta se ve comprometida. Con un gestor, reutilizar no tiene ningún sentido ni ventaja.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📱</span>
                <h4>2FA siempre que sea posible</h4>
                <p>Actívalo en cada servicio que lo ofrezca. Incluso un 2FA por SMS es infinitamente mejor que ninguno. La app TOTP (Authy) es la mejor opción gratuita.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🎯</span>
                <h4>Longitud &gt; Complejidad</h4>
                <p>&quot;x#Km!&quot; (5 chars) es infinitamente más débil que &quot;correctocaballobateria&quot; (21 chars). La longitud es el factor más importante en la entropía de una contraseña.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🚨</span>
                <h4>Desconfía del phishing</h4>
                <p>El 80% de robos de cuentas son por phishing, no por fuerza bruta. Verifica siempre la URL antes de introducir credenciales. Los gestores no autocompletarán en dominios falsos.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📋</span>
                <h4>Backup de los códigos 2FA</h4>
                <p>Guarda los códigos de recuperación de cada servicio 2FA en el gestor de contraseñas. Si pierdes el móvil sin estos códigos, perderás acceso permanente a esas cuentas.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔍</span>
                <h4>Monitorea las filtraciones</h4>
                <p>Comprueba haveibeenpwned.com mensualmente o activa las alertas de Firefox Monitor. Actuar rápido tras una filtración limita el daño al mínimo.</p>
              </div>
            </div>
          </section>

          {/* WARNING BOX */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores críticos de seguridad que debes evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Reutilizar contraseñas entre servicios:</strong> Es el error más común y peligroso. Si un servicio sufre una brecha (y ocurren miles al año), los atacantes prueban las credenciales en todos los sitios importantes (credential stuffing). Una filtración de un foro de videojuegos puede comprometer tu banco si usas la misma contraseña.</li>
              <li><strong>❌ Guardar contraseñas en el navegador sin protección:</strong> Las contraseñas guardadas en Chrome o Firefox sin contraseña maestra configurada se almacenan en texto plano (o con cifrado débil) en el disco. Cualquier malware con acceso al sistema puede extraerlas en segundos. Usa un gestor dedicado con cifrado AES-256.</li>
              <li><strong>❌ Usar información personal como contraseña:</strong> Nombre + año de nacimiento, apellidos, fecha de aniversario, nombre de mascota. Todo esto es predecible mediante ingeniería social o búsquedas en redes sociales. Los atacantes prueban primero las contraseñas basadas en información pública de la víctima.</li>
              <li><strong>❌ Confiar en el 2FA por SMS como única protección:</strong> El SIM swapping permite a un atacante recibir tus SMS en su propia SIM. Para cuentas críticas (banco, email), usa siempre 2FA por app TOTP o llave física, nunca solo SMS.</li>
              <li><strong>❌ No configurar respuestas de seguridad con información real:</strong> Las preguntas de seguridad (&quot;¿Cuál es el apellido de tu madre?&quot;) son vectores de ataque. Responde con respuestas inventadas y aleatorias que guardes en el gestor. &quot;¿Ciudad de nacimiento?&quot; → &quot;K#9xP!mL&quot; (guardado en el gestor).</li>
              <li><strong>❌ Introducir contraseñas en WiFi públicas sin VPN:</strong> Las redes WiFi abiertas (cafeterías, aeropuertos) pueden ser monitoreadas o falsificadas. Sin VPN, el tráfico puede interceptarse. Usa siempre VPN en WiFi pública antes de acceder a cualquier cuenta sensible.</li>
              <li><strong>❌ Perder acceso al gestor de contraseñas sin backup:</strong> Si olvidas la contraseña maestra y no tienes backup, pierdes acceso a TODAS tus cuentas. Guarda la contraseña maestra en papel físico en lugar seguro (caja fuerte, banco). Configura un método de recuperación de emergencia.</li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      {/* Footer meskeIA */}
      <RelatedApps apps={getRelatedApps('Generador de Contraseñas Seguras')} />
      <ShareCard appName="Generador de Contraseñas Seguras" />
      <Footer appName="Generador de Contraseñas Seguras" />
    </>
  );
}
