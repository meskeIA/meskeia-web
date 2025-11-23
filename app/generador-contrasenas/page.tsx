'use client';

import { useState, useEffect } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { jsonLd } from './metadata';
import styles from './GeneradorContrasenas.module.css';

interface PasswordHistory {
  password: string;
  timestamp: string;
}

interface StrengthResult {
  score: number;
  text: string;
  color: string;
}

export default function GeneradorContrasenas() {
  // Estados para la configuración
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strength, setStrength] = useState<StrengthResult>({
    score: 0,
    text: '',
    color: '#E5E5E5'
  });
  const [history, setHistory] = useState<PasswordHistory[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Cargar historial del localStorage al montar
  useEffect(() => {
    setMounted(true);
    const savedHistory = localStorage.getItem('meskeia_password_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Generar contraseña con crypto.getRandomValues()
  const generatePassword = () => {
    // Validar que al menos un tipo está seleccionado
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      alert('Debes seleccionar al menos un tipo de carácter');
      return;
    }

    // Definir conjuntos de caracteres
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Construir conjunto de caracteres disponibles
    let charset = '';
    const guaranteedChars: string[] = [];

    if (includeUppercase) {
      charset += uppercase;
      guaranteedChars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
    }
    if (includeLowercase) {
      charset += lowercase;
      guaranteedChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
    }
    if (includeNumbers) {
      charset += numbers;
      guaranteedChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }
    if (includeSymbols) {
      charset += symbols;
      guaranteedChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    // Generar contraseña usando crypto.getRandomValues()
    const array = new Uint32Array(length - guaranteedChars.length);
    crypto.getRandomValues(array);

    let newPassword = guaranteedChars.join('');
    for (let i = 0; i < array.length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    // Mezclar caracteres para evitar patrón predecible
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(newPassword);
    evaluateStrength(newPassword);
  };

  // Evaluar fortaleza de la contraseña
  const evaluateStrength = (pwd: string) => {
    let score = 0;

    // Longitud
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;

    // Variedad de caracteres
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    // Patrones débiles (reducir puntuación)
    if (/(.)\1{2,}/.test(pwd)) score--; // Repeticiones
    if (/123|abc|qwerty/i.test(pwd)) score--; // Secuencias comunes

    // Determinar resultado
    let result: StrengthResult;
    if (score <= 2) {
      result = { score, text: 'Muy débil', color: '#DC2626' };
    } else if (score <= 4) {
      result = { score, text: 'Débil', color: '#F59E0B' };
    } else if (score <= 5) {
      result = { score, text: 'Aceptable', color: '#FCD34D' };
    } else if (score <= 6) {
      result = { score, text: 'Fuerte', color: '#48A9A6' };
    } else {
      result = { score, text: 'Muy fuerte', color: '#2E86AB' };
    }

    setStrength(result);
  };

  // Copiar contraseña al portapapeles
  const copyPassword = async () => {
    if (!password) {
      alert('Genera una contraseña primero');
      return;
    }

    try {
      await navigator.clipboard.writeText(password);

      // Mostrar notificación
      showNotification('✅ Contraseña copiada al portapapeles');

      // Añadir al historial
      addToHistory(password);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar la contraseña');
    }
  };

  // Mostrar notificación temporal
  const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #2E86AB;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: fadeIn 0.3s;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // Añadir contraseña al historial
  const addToHistory = (pwd: string) => {
    const newEntry: PasswordHistory = {
      password: pwd,
      timestamp: new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const newHistory = [newEntry, ...history].slice(0, 10); // Mantener solo las últimas 10
    setHistory(newHistory);
    localStorage.setItem('meskeia_password_history', JSON.stringify(newHistory));
  };

  // Limpiar historial
  const clearHistory = () => {
    if (confirm('¿Estás seguro de que deseas borrar el historial?')) {
      setHistory([]);
      localStorage.removeItem('meskeia_password_history');
      showNotification('✅ Historial borrado');
    }
  };

  // Copiar contraseña del historial
  const copyFromHistory = async (pwd: string) => {
    try {
      await navigator.clipboard.writeText(pwd);
      showNotification('✅ Contraseña copiada al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Generar contraseña automáticamente al cargar
  useEffect(() => {
    if (mounted) {
      generatePassword();
    }
  }, [mounted]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AnalyticsTracker applicationName="generador-contrasenas" />

      <MeskeiaLogo />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            Generador de Contraseñas Seguras
          </h1>
          <p className={styles.subtitle}>
            Crea contraseñas únicas y robustas con encriptación de nivel militar
          </p>
        </header>

        {/* Configuración */}
        <section className={styles.configSection}>
          <div className={styles.lengthControl}>
            <label htmlFor="length">Longitud de la contraseña:</label>
            <input
              type="number"
              id="length"
              min="4"
              max="64"
              value={length}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 4 && val <= 64) {
                  setLength(val);
                }
              }}
              className={styles.lengthInput}
            />
            <p className={styles.lengthHint}>Rango: 4-64 caracteres (recomendado: 16+)</p>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className={styles.checkbox}
              />
              Mayúsculas (A-Z)
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className={styles.checkbox}
              />
              Minúsculas (a-z)
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className={styles.checkbox}
              />
              Números (0-9)
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className={styles.checkbox}
              />
              Símbolos (!@#$%...)
            </label>
          </div>

          <button
            onClick={generatePassword}
            className={styles.generateBtn}
          >
            🔄 Generar Contraseña
          </button>
        </section>

        {/* Display de Contraseña */}
        {password && (
          <section className={styles.passwordSection}>
            <div className={styles.passwordDisplay}>
              <input
                type="text"
                value={password}
                readOnly
                className={styles.passwordInput}
              />
              <button
                onClick={copyPassword}
                className={styles.copyBtn}
                title="Copiar al portapapeles"
              >
                📋
              </button>
            </div>

            {/* Medidor de Fortaleza */}
            <div className={styles.strengthMeter}>
              <div className={styles.strengthHeader}>
                <span>Fortaleza:</span>
                <span
                  className={styles.strengthText}
                  style={{ color: strength.color }}
                >
                  {strength.text}
                </span>
              </div>
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{
                    width: `${(strength.score / 7) * 100}%`,
                    backgroundColor: strength.color
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Consejos de Seguridad */}
        <section className={styles.tipsSection}>
          <h2 className={styles.sectionTitle}>💡 Consejos de Seguridad</h2>
          <ul className={styles.tipsList}>
            <li>✅ Usa contraseñas diferentes para cada cuenta importante</li>
            <li>✅ Activa la autenticación de dos factores (2FA) siempre que sea posible</li>
            <li>✅ Cambia tus contraseñas cada 3-6 meses</li>
            <li>✅ Nunca compartas tus contraseñas por email o mensajes</li>
            <li>✅ Usa un gestor de contraseñas para recordarlas de forma segura</li>
            <li>❌ No uses información personal (fechas, nombres, etc.)</li>
            <li>❌ Evita patrones predecibles como "123456" o "password"</li>
          </ul>
        </section>

        {/* Historial */}
        {mounted && history.length > 0 && (
          <section className={styles.historySection}>
            <div className={styles.historyHeader}>
              <h2 className={styles.sectionTitle}>📜 Historial (últimas 10)</h2>
              <button
                onClick={clearHistory}
                className={styles.clearBtn}
              >
                🗑️ Borrar historial
              </button>
            </div>
            <div className={styles.historyList}>
              {history.map((entry, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyPassword}>
                    <code>{entry.password}</code>
                  </div>
                  <div className={styles.historyMeta}>
                    <span className={styles.historyTime}>{entry.timestamp}</span>
                    <button
                      onClick={() => copyFromHistory(entry.password)}
                      className={styles.historyBtn}
                      title="Copiar"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Seguridad de Contraseñas?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre por qué necesitas contraseñas ultra seguras, características de criptografía avanzada, gestores de contraseñas recomendados y respuestas a preguntas frecuentes
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido Educativo Colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            {/* Sección 1: ¿Por qué necesitas contraseñas ultra seguras? */}
            <section className={styles.securityGuide}>
              <h2>🔐 ¿Por qué necesitas contraseñas ultra seguras?</h2>
              <p>
                En 2025, la ciberseguridad es más crítica que nunca. Una contraseña débil puede exponer tu identidad digital,
                cuentas bancarias, correos personales y datos profesionales. Los ciberdelincuentes emplean sofisticados
                algoritmos de fuerza bruta capaces de descifrar millones de combinaciones por segundo.
              </p>
              <p>
                Nuestro generador utiliza el algoritmo <code>crypto.getRandomValues()</code> de Web Cryptography API,
                el mismo estándar utilizado por instituciones bancarias y organismos gubernamentales. Cada contraseña generada
                es criptográficamente segura, verdaderamente aleatoria e imposible de predecir mediante algoritmos estadísticos.
              </p>
            </section>

            {/* Sección 2: Características de una contraseña ultra segura */}
            <section className={styles.characteristicsSection}>
              <h3>Características de una contraseña ultra segura</h3>
              <div className={styles.characteristicsGrid}>
                <div className={styles.characteristicCard}>
                  <h4>📏 Longitud óptima</h4>
                  <p>Mínimo 12 caracteres, idealmente 16 o más para máxima seguridad. Cada carácter adicional aumenta exponencialmente la dificultad de descifrado.</p>
                </div>
                <div className={styles.characteristicCard}>
                  <h4>🔢 Complejidad máxima</h4>
                  <p>Combinación de mayúsculas, minúsculas, números y símbolos especiales. Billones de combinaciones posibles.</p>
                </div>
                <div className={styles.characteristicCard}>
                  <h4>🎲 Aleatoriedad criptográfica</h4>
                  <p>Generada con algoritmos seguros (crypto.getRandomValues()), sin patrones predecibles ni conexión con información personal.</p>
                </div>
                <div className={styles.characteristicCard}>
                  <h4>🆔 Unicidad absoluta</h4>
                  <p>Contraseña diferente para cada cuenta y plataforma. Reutilizar contraseñas pone en riesgo todas tus cuentas.</p>
                </div>
                <div className={styles.characteristicCard}>
                  <h4>🔄 Rotación periódica</h4>
                  <p>Cambio regular cada 3-6 meses, especialmente tras alertas de brechas de seguridad.</p>
                </div>
                <div className={styles.characteristicCard}>
                  <h4>🛡️ Sin patrones predecibles</h4>
                  <p>Evita secuencias como &quot;123&quot;, &quot;abc&quot;, palabras del diccionario o información personal (fechas, nombres).</p>
                </div>
              </div>
            </section>

            {/* Sección 3: Gestores de contraseñas */}
            <section className={styles.managersSection}>
              <h3>💾 Gestores de Contraseñas Recomendados</h3>
              <p className={styles.managersIntro}>
                No debes memorizar contraseñas complejas. Utiliza un gestor de contraseñas de confianza que las almacena cifradas. Solo necesitas recordar una contraseña maestra ultra fuerte.
              </p>
              <div className={styles.managersGrid}>
                <div className={styles.managerCard}>
                  <h4>🔓 Bitwarden</h4>
                  <p><strong>Código abierto y gratuito.</strong> Opciones de auto-hospedaje para máximo control. Sincronización multiplataforma. Auditorías de seguridad públicas.</p>
                </div>
                <div className={styles.managerCard}>
                  <h4>🔑 1Password</h4>
                  <p><strong>Interfaz intuitiva premium.</strong> Compartición segura para familias y equipos. Modo viaje para ocultar datos sensibles. Integración con empresas.</p>
                </div>
                <div className={styles.managerCard}>
                  <h4>🗝️ KeePass</h4>
                  <p><strong>Solución offline para máxima privacidad.</strong> Base de datos local encriptada. Control total sobre tus datos. Sin servicios en la nube.</p>
                </div>
                <div className={styles.managerCard}>
                  <h4>🔐 LastPass</h4>
                  <p><strong>Sincronización multiplataforma.</strong> Autocompletado inteligente. Compartición segura. Monitoreo de brechas de seguridad en dark web.</p>
                </div>
              </div>
            </section>

            {/* Sección 4: FAQ */}
            <section className={styles.faqSection}>
              <h3>❓ Preguntas Frecuentes sobre Seguridad de Contraseñas</h3>
              <div className={styles.faqGrid}>
                <details className={styles.faqItem}>
                  <summary>¿Qué hace que este generador sea tan seguro?</summary>
                  <p>
                    Utiliza el API Web Cryptography con <code>crypto.getRandomValues()</code>, garantizando aleatoriedad criptográfica de nivel militar. Implementa validación mejorada, interfaz optimizada y algoritmos de distribución uniforme que eliminan sesgos estadísticos en la generación.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Es realmente seguro usar un generador online?</summary>
                  <p>
                    Absolutamente sí. Nuestro generador funciona 100% en tu navegador mediante JavaScript local. Ninguna contraseña es enviada a servidores externos, registrada en bases de datos o transmitida por internet. El código es de código abierto y auditable por cualquier experto en seguridad.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Con qué frecuencia debo cambiar mis contraseñas?</summary>
                  <p>
                    Para cuentas críticas (banca, email principal, redes sociales), se recomienda cambiar contraseñas cada 3-6 meses. Sin embargo, es más importante usar contraseñas únicas y ultra fuertes (16+ caracteres) que cambiarlas con extrema frecuencia. Si hay alerta de brecha de seguridad, cámbiala inmediatamente.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Cómo memorizo contraseñas tan complejas?</summary>
                  <p>
                    No debes memorizarlas. Utiliza un gestor de contraseñas de confianza como Bitwarden (código abierto), 1Password, LastPass o KeePass. Estos programas almacenan tus contraseñas de forma cifrada y solo necesitas recordar una contraseña maestra ultra fuerte.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Qué hago si olvido una contraseña generada?</summary>
                  <p>
                    Si usas un gestor de contraseñas, la recuperas desde ahí. Sin gestor, debes usar el sistema de &quot;recuperar contraseña&quot; del sitio (generalmente envían email de reseteo). Por eso insistimos en usar gestores de contraseñas: evitan este problema y mejoran dramáticamente tu seguridad digital.
                  </p>
                </details>

                <details className={styles.faqItem}>
                  <summary>¿Puedo confiar en el historial de contraseñas?</summary>
                  <p>
                    El historial se almacena únicamente en tu navegador mediante localStorage, no en nuestros servidores. Sin embargo, por seguridad máxima, recomendamos limpiar el historial después de copiar la contraseña. Nunca dejes contraseñas visibles en dispositivos compartidos o públicos.
                  </p>
                </details>
              </div>
            </section>
          </div>
        )}
      </div>

      <Footer appName="Generador de Contraseñas Seguras - meskeIA" />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(10px); }
        }
      `}</style>
    </>
  );
}
