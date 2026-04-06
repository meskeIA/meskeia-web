'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CifradoClasico.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'cifrar' | 'descifrar';
type MetodoType = 'cesar' | 'rot13' | 'atbash';

export default function CifradoClasicoPage() {
  const [metodo, setMetodo] = useState<MetodoType>('cesar');
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [desplazamiento, setDesplazamiento] = useState(3);
  const [resultado, setResultado] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Estados para HTML code generation
  const [htmlCode, setHtmlCode] = useState('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

  // Cifrado César (desplazamiento configurable)
  const cifrarCesar = (txt: string, desp: number, descifrar: boolean = false): string => {
    const shift = descifrar ? (26 - desp) % 26 : desp % 26;
    return txt
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
        }
        if (char >= 'a' && char <= 'z') {
          return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
        }
        return char;
      })
      .join('');
  };

  // Cifrado Atbash (inversión del alfabeto: A↔Z, B↔Y, etc.)
  const cifrarAtbash = (txt: string): string => {
    return txt
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
        }
        if (char >= 'a' && char <= 'z') {
          return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
        }
        return char;
      })
      .join('');
  };

  const procesar = () => {
    if (!texto.trim()) return;

    let res = '';
    switch (metodo) {
      case 'cesar':
        res = cifrarCesar(texto, desplazamiento, modo === 'descifrar');
        break;
      case 'rot13':
        res = cifrarCesar(texto, 13, false);
        break;
      case 'atbash':
        res = cifrarAtbash(texto);
        break;
    }
    setResultado(res);
    generarCodigoHTML(res, metodo, desplazamiento);
  };

  const limpiar = () => {
    setTexto('');
    setResultado('');
    setHtmlCode('');
    setHtmlExpanded(false);
  };

  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Generar código HTML exportable
  const generarCodigoHTML = useCallback((res: string, met: MetodoType, desp: number) => {
    if (!res) { setHtmlCode(''); return; }

    const nombreMetodo = met === 'cesar' ? `César (+${desp})` : met === 'rot13' ? 'ROT13' : 'Atbash';
    let codigo = `<!-- Cifrado Clásico - generado con meskeIA -->\n\n`;
    codigo += `<!-- Mensaje cifrado con ${nombreMetodo} -->\n`;
    codigo += `<div class="mensaje-cifrado">\n`;
    codigo += `  <p class="etiqueta">Método: ${nombreMetodo}</p>\n`;
    codigo += `  <p class="texto-cifrado">${res}</p>\n`;
    codigo += `</div>\n\n`;
    codigo += `<!-- CSS recomendado -->\n`;
    codigo += `<style>\n`;
    codigo += `  .mensaje-cifrado {\n`;
    codigo += `    font-family: 'Courier New', monospace;\n`;
    codigo += `    background: #f0f4f8;\n`;
    codigo += `    border-left: 4px solid #2E86AB;\n`;
    codigo += `    padding: 1rem 1.5rem;\n`;
    codigo += `    border-radius: 8px;\n`;
    codigo += `  }\n`;
    codigo += `  .etiqueta { color: #666; font-size: 0.85rem; margin: 0 0 0.5rem; }\n`;
    codigo += `  .texto-cifrado { color: #1A1A1A; font-size: 1.1rem; margin: 0; letter-spacing: 1px; }\n`;
    codigo += `</style>\n`;

    setHtmlCode(codigo);
  }, []);

  const copiarCodigoHTML = async () => {
    if (htmlCode) {
      await navigator.clipboard.writeText(htmlCode);
      setHtmlCopiado(true);
      setTimeout(() => setHtmlCopiado(false), 2000);
    }
  };

  // Generar alfabeto visual según método
  const alfabetoOriginal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getAlfabetoCifrado = () => {
    switch (metodo) {
      case 'cesar':
        return alfabetoOriginal.map((_, i) =>
          String.fromCharCode(((i + desplazamiento) % 26) + 65)
        );
      case 'rot13':
        return alfabetoOriginal.map((_, i) =>
          String.fromCharCode(((i + 13) % 26) + 65)
        );
      case 'atbash':
        return alfabetoOriginal.map((_, i) =>
          String.fromCharCode(90 - i)
        );
      default:
        return alfabetoOriginal;
    }
  };

  const alfabetoCifrado = getAlfabetoCifrado();

  // Información por método
  const metodosInfo = {
    cesar: {
      nombre: 'Cifrado César',
      descripcion: 'Desplaza cada letra un número fijo de posiciones en el alfabeto.',
      emoji: '👑'
    },
    rot13: {
      nombre: 'ROT13',
      descripcion: 'Caso especial de César con desplazamiento 13. Cifrar = Descifrar.',
      emoji: '🔄'
    },
    atbash: {
      nombre: 'Cifrado Atbash',
      descripcion: 'Invierte el alfabeto: A↔Z, B↔Y, C↔X... Cifrar = Descifrar.',
      emoji: '🔀'
    }
  };

  const esMetodoSimetrico = metodo === 'rot13' || metodo === 'atbash';
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cifrado Clásico</h1>
        <p className={styles.subtitle}>
          Métodos de encriptación históricos: César, ROT13 y Atbash
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Selector de método */}
        <div className={styles.methodSelector}>
          <button
            className={`${styles.methodBtn} ${metodo === 'cesar' ? styles.active : ''}`}
            onClick={() => { setMetodo('cesar'); setResultado(''); setHtmlCode(''); }}
          >
            👑 César
          </button>
          <button
            className={`${styles.methodBtn} ${metodo === 'rot13' ? styles.active : ''}`}
            onClick={() => { setMetodo('rot13'); setResultado(''); setHtmlCode(''); }}
          >
            🔄 ROT13
          </button>
          <button
            className={`${styles.methodBtn} ${metodo === 'atbash' ? styles.active : ''}`}
            onClick={() => { setMetodo('atbash'); setResultado(''); setHtmlCode(''); }}
          >
            🔀 Atbash
          </button>
        </div>

        {/* Descripción del método */}
        <div className={styles.methodInfo}>
          <span className={styles.methodEmoji}>{metodosInfo[metodo].emoji}</span>
          <div>
            <strong>{metodosInfo[metodo].nombre}</strong>
            <p>{metodosInfo[metodo].descripcion}</p>
          </div>
        </div>

        {/* Selector de modo (solo para César) */}
        {!esMetodoSimetrico && (
          <div className={styles.modeSelector}>
            <button
              className={`${styles.modeBtn} ${modo === 'cifrar' ? styles.active : ''}`}
              onClick={() => setModo('cifrar')}
            >
              🔒 Cifrar
            </button>
            <button
              className={`${styles.modeBtn} ${modo === 'descifrar' ? styles.active : ''}`}
              onClick={() => setModo('descifrar')}
            >
              🔓 Descifrar
            </button>
          </div>
        )}

        {/* Control de desplazamiento (solo César) */}
        {metodo === 'cesar' && (
          <div className={styles.shiftSection}>
            <label className={styles.label}>Desplazamiento: {desplazamiento}</label>
            <input
              type="range"
              min="1"
              max="25"
              value={desplazamiento}
              onChange={(e) => setDesplazamiento(parseInt(e.target.value))}
              className={styles.slider}
              title="Desplazamiento del cifrado"
              aria-label="Desplazamiento del cifrado"
            />
            <div className={styles.presets}>
              <span className={styles.presetLabel}>Presets:</span>
              <button type="button" onClick={() => setDesplazamiento(3)} className={styles.presetBtn}>César (3)</button>
              <button type="button" onClick={() => setDesplazamiento(1)} className={styles.presetBtn}>+1</button>
              <button type="button" onClick={() => setDesplazamiento(7)} className={styles.presetBtn}>+7</button>
              <button type="button" onClick={() => setDesplazamiento(19)} className={styles.presetBtn}>+19</button>
            </div>
          </div>
        )}

        {/* Visualización del alfabeto */}
        <div className={styles.alphabetPreview}>
          <div className={styles.alphabetRow}>
            <span className={styles.alphabetLabel}>Original:</span>
            {alfabetoOriginal.map((letra, i) => (
              <span key={`o-${i}`} className={styles.alphabetLetter}>{letra}</span>
            ))}
          </div>
          <div className={styles.alphabetRow}>
            <span className={styles.alphabetLabel}>Cifrado:</span>
            {alfabetoCifrado.map((letra, i) => (
              <span key={`c-${i}`} className={`${styles.alphabetLetter} ${styles.cifrado}`}>{letra}</span>
            ))}
          </div>
        </div>

        {/* Input de texto */}
        <div className={styles.inputSection}>
          <label className={styles.label}>
            {esMetodoSimetrico
              ? 'Texto a procesar'
              : modo === 'cifrar' ? 'Mensaje a cifrar' : 'Mensaje a descifrar'}
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={esMetodoSimetrico
              ? 'Escribe o pega tu texto aquí...'
              : modo === 'cifrar'
                ? 'Escribe tu mensaje secreto aquí...'
                : 'Pega el mensaje cifrado aquí...'}
            className={styles.textarea}
            rows={4}
          />
        </div>

        {/* Botones de acción */}
        <div className={styles.buttonRow}>
          <button onClick={procesar} className={styles.btnPrimary} disabled={!texto.trim()}>
            {esMetodoSimetrico
              ? '🔐 Procesar texto'
              : modo === 'cifrar' ? '🔒 Cifrar mensaje' : '🔓 Descifrar mensaje'}
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className={styles.resultSection}>
            <label className={styles.label}>Resultado:</label>
            <div className={styles.resultBox}>{resultado}</div>
            <button onClick={copiarResultado} className={styles.btnCopy}>
              {copiado ? '✅ Copiado' : '📋 Copiar resultado'}
            </button>
          </div>
        )}

        {/* ========== HTML CODE GENERATION ========== */}
        {htmlCode && (
          <div className={styles.htmlCodeSection}>
            <button
              className={styles.htmlToggleBtn}
              type="button"
              onClick={() => setHtmlExpanded(!htmlExpanded)}

            >
              <span>{htmlExpanded ? '▲' : '▼'} Exportar como código HTML</span>
              <span className={styles.htmlBadge}>Nuevo</span>
            </button>

            {htmlExpanded && (
              <div className={styles.htmlCodeContent}>
                <p className={styles.htmlDescription}>
                  Copia este código HTML para incrustar el mensaje cifrado en cualquier página web:
                </p>
                <pre className={styles.htmlPre}>{htmlCode}</pre>
                <button onClick={copiarCodigoHTML} className={styles.btnCopyHtml}>
                  {htmlCopiado ? '✅ ¡Copiado!' : '📋 Copiar código HTML'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection
        title="¿Quieres aprender más sobre cifrados clásicos?"
        subtitle="Historia, funcionamiento, análisis y curiosidades de los métodos de encriptación más antiguos"
      >
        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Comparativa de los tres cifrados</h2>
          <p className={styles.comparativaSubtitle}>
            César, ROT13 y Atbash frente a frente: tipo, claves posibles, simetría, origen histórico y uso actual
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>👑 César</th>
                  <th>🔄 ROT13</th>
                  <th>🔀 Atbash</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tipo</td>
                  <td>Sustitución monoalfabética</td>
                  <td>Sustitución monoalfabética</td>
                  <td>Sustitución monoalfabética inversa</td>
                </tr>
                <tr>
                  <td>Claves posibles</td>
                  <td>25</td>
                  <td>1 (fija)</td>
                  <td>1 (fija)</td>
                </tr>
                <tr>
                  <td>Simétrico</td>
                  <td>No (necesita descifrar)</td>
                  <td>Sí (cifrar = descifrar)</td>
                  <td>Sí (cifrar = descifrar)</td>
                </tr>
                <tr>
                  <td>Origen</td>
                  <td>Roma, ~50 a.C.</td>
                  <td>Internet, ~1980</td>
                  <td>Hebreo antiguo, ~600 a.C.</td>
                </tr>
                <tr>
                  <td>Uso actual</td>
                  <td>Educativo, juegos</td>
                  <td>Foros, spoilers</td>
                  <td>Educativo, curiosidad</td>
                </tr>
                <tr>
                  <td>Seguridad real</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdNegative}>Nula</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: HISTORIA ========== */}
        <section className={styles.infoSection}>
          <h2>🏛️ Historia y origen de cada cifrado</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>👑 Cifrado César (~50 a.C.)</h3>
              <p>
                Julio César lo usó para comunicarse con sus generales durante las
                Guerras de las Galias. El desplazamiento habitual era de 3 posiciones:
                la A se convertía en D, la B en E, etc. Suetonio lo documenta en
                <em> De Vita Caesarum</em>.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔄 ROT13 (~1980, Usenet)</h3>
              <p>
                Surgió en los grupos de noticias de Usenet a principios de los
                años 80. Se usaba para ocultar respuestas a acertijos, spoilers de
                películas y contenido potencialmente ofensivo. Es el caso especial
                de César con desplazamiento 13, el único que permite que cifrar
                y descifrar sean la misma operación.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔀 Cifrado Atbash (~600 a.C.)</h3>
              <p>
                De origen hebreo, su nombre proviene de las primeras y últimas
                letras del alfabeto hebreo: Alef-Tav-Bet-Shin. Aparece en el
                Libro de Jeremías del Antiguo Testamento: «Babel» se escribe
                como «Sheshach» usando Atbash. Es el cifrado más antiguo
                documentado de la historia.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>📖 Análisis de frecuencias (~850 d.C.)</h3>
              <p>
                El matemático árabe Al-Kindi desarrolló la técnica del análisis
                de frecuencias, que rompe cualquier cifrado de sustitución
                monoalfabética. En español, las letras más frecuentes son
                E, A, O, S, R, N. Si aparecen mucho en el texto cifrado, se
                puede deducir la clave.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ ========== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas frecuentes sobre cifrados clásicos</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Pueden estos cifrados proteger información real hoy en día?
              </summary>
              <p className={styles.faqAnswer}>
                No. Los cifrados clásicos (César, ROT13, Atbash) son completamente
                inseguros para uso real. Cualquier ordenador moderno puede romperlos
                en microsegundos mediante fuerza bruta o análisis de frecuencias.
                Para proteger información usa AES-256 o algoritmos modernos estándar.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Por qué ROT13 y Atbash son simétricos?
              </summary>
              <p className={styles.faqAnswer}>
                Porque al aplicarlos dos veces se recupera el texto original. En ROT13,
                desplazar 13 posiciones dos veces equivale a desplazar 26 (= vuelta completa
                al alfabeto). En Atbash, invertir el alfabeto dos veces devuelve el orden
                original. César solo es simétrico cuando el desplazamiento es 13 (ROT13).
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué es un cifrado de sustitución monoalfabética?
              </summary>
              <p className={styles.faqAnswer}>
                Es un cifrado donde cada letra del alfabeto siempre se sustituye por
                la misma letra cifrada. Si A→D, en todo el mensaje A siempre será D.
                Esto lo hace vulnerable al análisis de frecuencias: si en el texto
                cifrado aparece mucho la letra D, probablemente es una A cifrada.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Cómo se rompe el cifrado César por fuerza bruta?
              </summary>
              <p className={styles.faqAnswer}>
                Solo hay 25 claves posibles. Un atacante simplemente prueba los 25
                desplazamientos y lee cuál produce texto coherente. Esto puede hacerse
                manualmente en minutos o con un ordenador en microsegundos. El cifrado
                de Vigenère surgió precisamente para superar esta debilidad.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué diferencia hay entre cifrar y codificar?
              </summary>
              <p className={styles.faqAnswer}>
                Cifrar implica ocultar el significado con una clave secreta; sin la
                clave no se puede leer. Codificar solo cambia la representación (por
                ejemplo, Base64 o Morse) pero cualquiera que conozca el sistema puede
                decodificarlo sin clave. ROT13 está en la frontera: es técnicamente
                un cifrado, pero sin secreto real porque la «clave» es conocida por todos.
              </p>
            </details>
          </div>
        </section>

        {/* ========== SECCIÓN 4: EJEMPLOS FAMOSOS ========== */}
        <section className={styles.examplesSection}>
          <h2>📜 Ejemplos históricos y famosos</h2>
          <div className={styles.examplesList}>
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleTag}>👑 César +3</span>
                <span className={styles.exampleNote}>Julio César, ~50 a.C.</span>
              </div>
              <div className={styles.exampleRow}>
                <span className={styles.exampleOriginal}>VENI VIDI VICI</span>
                <span className={styles.exampleArrow}>→</span>
                <span className={styles.exampleCifrado}>YHQL YLGL YLFL</span>
              </div>
            </div>
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleTag}>🔄 ROT13</span>
                <span className={styles.exampleNote}>Uso habitual en foros y Usenet</span>
              </div>
              <div className={styles.exampleRow}>
                <span className={styles.exampleOriginal}>SPOILER ALERT</span>
                <span className={styles.exampleArrow}>→</span>
                <span className={styles.exampleCifrado}>FCBVYRE NYREG</span>
              </div>
            </div>
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleTag}>🔀 Atbash hebreo</span>
                <span className={styles.exampleNote}>Libro de Jeremías, ~600 a.C.</span>
              </div>
              <div className={styles.exampleRow}>
                <span className={styles.exampleOriginal}>BABEL</span>
                <span className={styles.exampleArrow}>→</span>
                <span className={styles.exampleCifrado}>YZOVY (lat.) / שֵׁשַׁך (heb.)</span>
              </div>
            </div>
            <div className={styles.exampleItem}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleTag}>👑 Augusto +1</span>
                <span className={styles.exampleNote}>Emperador Augusto usaba desplazamiento 1</span>
              </div>
              <div className={styles.exampleRow}>
                <span className={styles.exampleOriginal}>ROMA</span>
                <span className={styles.exampleArrow}>→</span>
                <span className={styles.exampleCifrado}>SPNB</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 5: ANÁLISIS DE FRECUENCIAS ========== */}
        <section className={styles.frecuenciasSection}>
          <h2>📈 Análisis de frecuencias: cómo romper estos cifrados</h2>
          <p className={styles.frecuenciasIntro}>
            Al-Kindi (~850 d.C.) descubrió que las letras en cualquier idioma aparecen con
            frecuencias predecibles. Esto hace vulnerables a todos los cifrados de sustitución monoalfabética.
          </p>
          <div className={styles.frecuenciasGrid}>
            <div className={styles.frecuenciasCard}>
              <h3>🇪🇸 Frecuencias en español</h3>
              <div className={styles.frecuenciasBars}>
                {[
                  { letra: 'E', pct: 13.7 }, { letra: 'A', pct: 12.2 },
                  { letra: 'O', pct: 8.7 }, { letra: 'S', pct: 7.9 },
                  { letra: 'R', pct: 6.9 }, { letra: 'N', pct: 6.8 },
                  { letra: 'I', pct: 6.3 }, { letra: 'D', pct: 5.9 },
                ].map(({ letra, pct }) => (
                  <div key={letra} className={styles.barItem}>
                    <span className={styles.barLetra}>{letra}</span>
                    <div className={styles.barFill} style={{ '--bar-width': `${pct * 5}px` } as React.CSSProperties} />
                    <span className={styles.barPct}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.frecuenciasCard}>
              <h3>🔍 Pasos para romper el César</h3>
              <ol className={styles.pasosList}>
                <li>Contar la frecuencia de cada letra en el texto cifrado</li>
                <li>La letra más frecuente probablemente es la <strong>E</strong> cifrada</li>
                <li>Calcular el desplazamiento: letra cifrada − E = clave</li>
                <li>Aplicar el descifrado con esa clave y verificar</li>
                <li>Si no funciona, probar con la segunda letra más frecuente</li>
              </ol>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2>⚠️ Errores frecuentes al usar cifrados clásicos</h2>
          <ul className={styles.warningList}>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Usarlos para proteger datos reales</strong>
                <p>César, ROT13 y Atbash son solo herramientas educativas. Para cifrado real usa AES-256, que es el estándar actual. Nunca uses cifrados clásicos para contraseñas, mensajes privados o datos sensibles.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Confundir codificación con cifrado</strong>
                <p>ROT13 suele llamarse «cifrado», pero en realidad es una transformación pública sin secreto: cualquiera que sepa que es ROT13 puede revertirlo instantáneamente. Un cifrado seguro requiere una clave secreta.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Creer que combinar varios cifrados da seguridad</strong>
                <p>Aplicar César sobre Atbash sobre ROT13 sigue siendo un cifrado de sustitución monoalfabética. Un análisis de frecuencias lo rompe igualmente. La complejidad no implica seguridad en criptografía clásica.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>✅</span>
              <div>
                <strong>Uso correcto: aprendizaje y juegos</strong>
                <p>Estos cifrados son perfectos para enseñar los fundamentos de la criptografía, crear actividades lúdicas, diseñar puzzles o escapadas temáticas, y entender la historia de la seguridad informática.</p>
              </div>
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-clasico')} />
      <ShareCard appName="cifrado-clasico" />
      <Footer appName="cifrado-clasico" />
    </div>
  );
}
