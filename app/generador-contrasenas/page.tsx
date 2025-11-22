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

        {/* Información SEO */}
        <section className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>¿Por qué usar un generador de contraseñas?</h2>
          <p className={styles.infoParagraph}>
            En la era digital, proteger tus cuentas con <strong>contraseñas seguras</strong> es fundamental.
            Nuestro generador utiliza algoritmos criptográficos avanzados (crypto.getRandomValues()) para crear
            contraseñas verdaderamente aleatorias que son prácticamente imposibles de descifrar mediante ataques
            de fuerza bruta o diccionario.
          </p>
          <p className={styles.infoParagraph}>
            A diferencia de las contraseñas creadas manualmente, que suelen contener patrones predecibles basados
            en información personal, nuestras contraseñas generadas son <strong>100% aleatorias</strong> y no tienen
            conexión con tu identidad, garantizando máxima seguridad para tus datos personales y financieros.
          </p>

          <h3 className={styles.subsectionTitle}>Características de nuestro generador</h3>
          <ul className={styles.featuresList}>
            <li><strong>Seguridad de nivel militar:</strong> Usa crypto.getRandomValues(), el mismo estándar utilizado en aplicaciones bancarias y gubernamentales</li>
            <li><strong>Totalmente personalizable:</strong> Ajusta longitud, tipo de caracteres y complejidad según tus necesidades</li>
            <li><strong>Evaluación en tiempo real:</strong> Medidor visual que muestra la fortaleza de cada contraseña generada</li>
            <li><strong>Historial local:</strong> Guarda tus últimas 10 contraseñas de forma segura en tu navegador (no se envían a ningún servidor)</li>
            <li><strong>Copia rápida:</strong> Un clic para copiar al portapapeles y usar inmediatamente</li>
            <li><strong>100% privado:</strong> Todo el proceso ocurre en tu navegador, sin enviar datos a servidores externos</li>
          </ul>

          <h3 className={styles.subsectionTitle}>¿Qué hace a una contraseña realmente segura?</h3>
          <p className={styles.infoParagraph}>
            Una contraseña fuerte debe cumplir estos criterios:
          </p>
          <ul className={styles.criteriaList}>
            <li><strong>Longitud mínima de 12 caracteres:</strong> Cada carácter adicional aumenta exponencialmente la dificultad de descifrado</li>
            <li><strong>Combinación de tipos de caracteres:</strong> Mayúsculas, minúsculas, números y símbolos crean billones de combinaciones posibles</li>
            <li><strong>Sin patrones predecibles:</strong> Evita secuencias como "123", "abc" o palabras del diccionario</li>
            <li><strong>Única para cada cuenta:</strong> Reutilizar contraseñas pone en riesgo todas tus cuentas si una se ve comprometida</li>
            <li><strong>Actualizada regularmente:</strong> Cambiar contraseñas cada 3-6 meses reduce el riesgo de brechas de seguridad antiguas</li>
          </ul>

          <h3 className={styles.subsectionTitle}>Gestores de contraseñas recomendados</h3>
          <p className={styles.infoParagraph}>
            Para recordar contraseñas complejas sin comprometer la seguridad, considera usar un gestor de contraseñas:
          </p>
          <ul className={styles.managersList}>
            <li><strong>Bitwarden:</strong> Código abierto, gratuito y con opciones de auto-hospedaje</li>
            <li><strong>1Password:</strong> Interfaz intuitiva y compartición segura para familias y equipos</li>
            <li><strong>KeePass:</strong> Solución offline para máxima privacidad y control total</li>
            <li><strong>LastPass:</strong> Sincronización multiplataforma y autocompletado inteligente</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>❓ Preguntas Frecuentes</h2>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Es seguro generar contraseñas en línea?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                <strong>Sí, es completamente seguro.</strong> Nuestra herramienta funciona 100% en tu navegador
                usando JavaScript local. Ninguna contraseña generada se envía a nuestros servidores ni a terceros.
                El proceso utiliza crypto.getRandomValues(), una API criptográfica del navegador que garantiza
                aleatoriedad verdadera sin depender de conexiones externas.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Cuál es la longitud ideal de una contraseña?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                Recomendamos <strong>mínimo 16 caracteres</strong> para cuentas importantes (banca, email, redes sociales).
                Para cuentas menos críticas, 12 caracteres es aceptable. Sin embargo, cuanto más larga sea la contraseña,
                más segura será. Una contraseña de 20+ caracteres con variedad de tipos es virtualmente imposible de descifrar
                con tecnología actual.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Necesito incluir todos los tipos de caracteres?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                <strong>Sí, es altamente recomendable.</strong> Incluir mayúsculas, minúsculas, números y símbolos
                aumenta drásticamente el número de combinaciones posibles, haciendo que ataques de fuerza bruta requieran
                millones de años para descifrarla. Algunos sitios web requieren todos los tipos de caracteres por motivos
                de seguridad.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Cómo puedo recordar contraseñas tan complejas?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                <strong>No necesitas memorizarlas.</strong> Usa un <strong>gestor de contraseñas</strong> como Bitwarden,
                1Password o KeePass. Estos programas guardan todas tus contraseñas de forma encriptada y solo necesitas
                recordar una contraseña maestra. También ofrecen autocompletado y sincronización entre dispositivos.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Con qué frecuencia debo cambiar mis contraseñas?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                La recomendación actual es cambiar contraseñas <strong>cada 3-6 meses</strong>, o inmediatamente si:
              </p>
              <ul>
                <li>Sospechas que tu cuenta ha sido comprometida</li>
                <li>Una empresa anuncia una brecha de seguridad</li>
                <li>Has usado la contraseña en una red pública o compartida</li>
                <li>Alguien no autorizado pudo haberla visto</li>
              </ul>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Qué es la autenticación de dos factores (2FA)?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                La <strong>autenticación de dos factores (2FA)</strong> añade una capa extra de seguridad más allá de la
                contraseña. Requiere un segundo factor de verificación, como:
              </p>
              <ul>
                <li>Código enviado por SMS</li>
                <li>Código generado por app (Google Authenticator, Authy)</li>
                <li>Llave de seguridad física (YubiKey)</li>
                <li>Verificación biométrica (huella, reconocimiento facial)</li>
              </ul>
              <p>
                Incluso si alguien descubre tu contraseña, <strong>no podrá acceder sin el segundo factor</strong>.
                Activa 2FA en todas las cuentas que lo permitan, especialmente email, banca y redes sociales.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Puedo usar la misma contraseña en varias cuentas?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                <strong>Nunca reutilices contraseñas.</strong> Si un servicio sufre una brecha de seguridad y tu contraseña
                se filtra, los atacantes probarán esa misma contraseña en otros sitios (email, banca, redes sociales).
                Usa contraseñas únicas para cada cuenta importante. Los gestores de contraseñas facilitan esto enormemente.
              </p>
            </div>
          </details>
        </section>
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
