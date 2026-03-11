'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './CifradoVigenere.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'cifrar' | 'descifrar';

export default function CifradoVigenerePage() {
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [clave, setClave] = useState('');
  const [resultado, setResultado] = useState('');
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Estados para HTML code generation
  const [htmlCode, setHtmlCode] = useState('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

  // Normalizar clave (solo letras, mayúsculas)
  const claveNormalizada = clave.toUpperCase().replace(/[^A-Z]/g, '');

  // Cifrado Vigenère
  const cifrarVigenere = (txt: string, clv: string, descifrar: boolean = false): string => {
    if (!clv) return txt;

    const claveUpper = clv.toUpperCase();
    let claveIndex = 0;

    return txt
      .split('')
      .map(char => {
        const esLetra = /[a-zA-Z]/.test(char);
        if (!esLetra) return char;

        const esMayuscula = char >= 'A' && char <= 'Z';
        const charUpper = char.toUpperCase();
        const charCode = charUpper.charCodeAt(0) - 65;
        const claveChar = claveUpper[claveIndex % claveUpper.length];
        const claveCode = claveChar.charCodeAt(0) - 65;

        let nuevoCode: number;
        if (descifrar) {
          nuevoCode = (charCode - claveCode + 26) % 26;
        } else {
          nuevoCode = (charCode + claveCode) % 26;
        }

        claveIndex++;
        const nuevoChar = String.fromCharCode(nuevoCode + 65);
        return esMayuscula ? nuevoChar : nuevoChar.toLowerCase();
      })
      .join('');
  };

  // Generar código HTML exportable
  const generarCodigoHTML = useCallback((res: string, clv: string) => {
    if (!res) { setHtmlCode(''); return; }

    let codigo = `<!-- Cifrado Vigenère - generado con meskeIA -->\n\n`;
    codigo += `<!-- Clave usada: ${clv} -->\n`;
    codigo += `<div class="mensaje-vigenere">\n`;
    codigo += `  <p class="etiqueta">Cifrado Vigenère · Clave: <strong>${clv}</strong></p>\n`;
    codigo += `  <p class="texto-cifrado">${res}</p>\n`;
    codigo += `</div>\n\n`;
    codigo += `<!-- CSS recomendado -->\n`;
    codigo += `<style>\n`;
    codigo += `  .mensaje-vigenere {\n`;
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

  const procesar = () => {
    if (!texto.trim() || !claveNormalizada) return;
    const res = cifrarVigenere(texto, claveNormalizada, modo === 'descifrar');
    setResultado(res);
    generarCodigoHTML(res, claveNormalizada);
  };

  const limpiar = () => {
    setTexto('');
    setClave('');
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

  const copiarCodigoHTML = async () => {
    if (htmlCode) {
      await navigator.clipboard.writeText(htmlCode);
      setHtmlCopiado(true);
      setTimeout(() => setHtmlCopiado(false), 2000);
    }
  };

  // Generar tabla Vigenère (26x26)
  const tablaVigenere = useMemo(() => {
    const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alfabeto.split('').map((_, fila) =>
      alfabeto.split('').map((_, col) =>
        String.fromCharCode(((fila + col) % 26) + 65)
      )
    );
  }, []);

  // Determinar qué celdas resaltar basado en el texto y clave
  const getCeldasResaltadas = () => {
    if (!texto || !claveNormalizada) return new Set<string>();

    const resaltadas = new Set<string>();
    let claveIndex = 0;

    texto.split('').forEach(char => {
      if (/[a-zA-Z]/.test(char)) {
        const fila = claveNormalizada.charCodeAt(claveIndex % claveNormalizada.length) - 65;
        const col = char.toUpperCase().charCodeAt(0) - 65;
        resaltadas.add(`${fila}-${col}`);
        claveIndex++;
      }
    });

    return resaltadas;
  };

  const celdasResaltadas = getCeldasResaltadas();
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cifrado Vigenère</h1>
        <p className={styles.subtitle}>
          Cifrado polialfabético con palabra clave — &quot;indescifrable&quot; durante 300 años
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Selector de modo */}
        <div className={styles.modeSelector}>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'cifrar' ? styles.active : ''}`}
            onClick={() => setModo('cifrar')}
          >
            🔒 Cifrar
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${modo === 'descifrar' ? styles.active : ''}`}
            onClick={() => setModo('descifrar')}
          >
            🔓 Descifrar
          </button>
        </div>

        {/* Input de clave */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            🔑 Palabra clave
            {claveNormalizada && (
              <span className={styles.clavePreview}> → {claveNormalizada}</span>
            )}
          </label>
          <input
            type="text"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Introduce tu palabra clave secreta..."
            className={styles.input}
          />
          {clave && !claveNormalizada && (
            <span className={styles.errorText}>La clave debe contener al menos una letra</span>
          )}
        </div>

        {/* Visualización de la clave expandida */}
        {claveNormalizada && texto && (
          <div className={styles.claveExpandida}>
            <span className={styles.claveLabel}>Clave repetida:</span>
            <div className={styles.claveVisual}>
              {texto.split('').map((char, i) => {
                const esLetra = /[a-zA-Z]/.test(char);
                const letrasClave = texto.slice(0, i + 1).replace(/[^a-zA-Z]/g, '').length;
                const claveChar = esLetra
                  ? claveNormalizada[(letrasClave - 1) % claveNormalizada.length]
                  : ' ';
                return (
                  <span key={i} className={styles.claveChar}>
                    {claveChar}
                  </span>
                );
              })}
            </div>
            <div className={styles.textoVisual}>
              {texto.split('').map((char, i) => (
                <span key={i} className={styles.textoChar}>
                  {char === ' ' ? '\u00A0' : char.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input de texto */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {modo === 'cifrar' ? '📝 Mensaje a cifrar' : '📝 Mensaje a descifrar'}
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={modo === 'cifrar'
              ? 'Escribe tu mensaje secreto aquí...'
              : 'Pega el mensaje cifrado aquí...'}
            className={styles.textarea}
            rows={4}
          />
        </div>

        {/* Botones de acción */}
        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={procesar}
            className={styles.btnPrimary}
            disabled={!texto.trim() || !claveNormalizada}
          >
            {modo === 'cifrar' ? '🔒 Cifrar mensaje' : '🔓 Descifrar mensaje'}
          </button>
          <button type="button" onClick={limpiar} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className={styles.resultSection}>
            <label className={styles.label}>Resultado:</label>
            <div className={styles.resultBox}>{resultado}</div>
            <button type="button" onClick={copiarResultado} className={styles.btnCopy}>
              {copiado ? '✅ Copiado' : '📋 Copiar resultado'}
            </button>
          </div>
        )}

        {/* ========== HTML CODE GENERATION ========== */}
        {htmlCode && (
          <div className={styles.htmlCodeSection}>
            <button
              type="button"
              className={styles.htmlToggleBtn}
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
                <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyHtml}>
                  {htmlCopiado ? '✅ ¡Copiado!' : '📋 Copiar código HTML'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Toggle tabla Vigenère */}
        <div className={styles.tablaToggle}>
          <button
            type="button"
            onClick={() => setMostrarTabla(!mostrarTabla)}
            className={styles.btnTabla}
          >
            {mostrarTabla ? '📊 Ocultar tabla Vigenère' : '📊 Mostrar tabla Vigenère'}
          </button>
        </div>

        {/* Tabla Vigenère */}
        {mostrarTabla && (
          <div className={styles.tablaContainer}>
            <h3>Tabla de Vigenère</h3>
            <p className={styles.tablaInstrucciones}>
              Fila = letra de la clave, Columna = letra del mensaje → Intersección = letra cifrada
            </p>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th></th>
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letra => (
                      <th key={letra}>{letra}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tablaVigenere.map((fila, i) => (
                    <tr key={i}>
                      <th>{String.fromCharCode(65 + i)}</th>
                      {fila.map((celda, j) => (
                        <td
                          key={j}
                          className={celdasResaltadas.has(`${i}-${j}`) ? styles.celdaResaltada : ''}
                        >
                          {celda}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection
        title="¿Quieres aprender más sobre el Cifrado Vigenère?"
        subtitle="Historia, funcionamiento matemático, análisis de Kasiski y por qué fue considerado indescifrable 300 años"
      >
        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Vigenère vs César: ¿por qué es más seguro?</h2>
          <p className={styles.comparativaSubtitle}>
            Comparativa entre el cifrado César (monoalfabético) y Vigenère (polialfabético)
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>👑 César</th>
                  <th>🌊 Vigenère</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tipo</td>
                  <td>Monoalfabético</td>
                  <td>Polialfabético</td>
                </tr>
                <tr>
                  <td>Número de desplazamientos</td>
                  <td>1 (fijo)</td>
                  <td>Variable (longitud de clave)</td>
                </tr>
                <tr>
                  <td>Claves posibles</td>
                  <td>25</td>
                  <td>Billones (según longitud)</td>
                </tr>
                <tr>
                  <td>Vulnerable a frecuencias</td>
                  <td className={styles.tdNegative}>Sí (fácilmente)</td>
                  <td className={styles.tdWarning}>Sí (con Kasiski)</td>
                </tr>
                <tr>
                  <td>Misma letra cifrada siempre igual</td>
                  <td className={styles.tdNegative}>Sí</td>
                  <td className={styles.tdPositive}>No</td>
                </tr>
                <tr>
                  <td>Años considerado seguro</td>
                  <td>~1.800 años</td>
                  <td>~300 años</td>
                </tr>
                <tr>
                  <td>Seguridad real actual</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdNegative}>Nula</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: HISTORIA ========== */}
        <section className={styles.infoSection}>
          <h2>🏛️ Historia del Cifrado Vigenère</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📜 Origen (1553)</h3>
              <p>
                Descrito por primera vez por <strong>Giovan Battista Bellaso</strong> en su
                libro <em>La cifra del Sig.</em> en 1553. Fue erróneamente atribuido a
                Blaise de Vigenère, diplomático francés que lo describió décadas después.
                El nombre de Vigenère quedó en la historia por error histórico.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔒 &quot;Le chiffre indéchiffrable&quot;</h3>
              <p>
                Durante los siglos XVI al XIX fue conocido como el cifrado indescifrable.
                Fue usado por ejércitos, diplomáticos y espías europeos. La Confederación
                americana lo usó durante la Guerra Civil americana (1861-1865) con la
                clave «Manchester Bluff» y «Complete Victory».
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔓 Ruptura por Babbage/Kasiski (1846-1863)</h3>
              <p>
                <strong>Charles Babbage</strong> lo rompió hacia 1846, pero no publicó
                el método. <strong>Friedrich Kasiski</strong> lo redescubrió y publicó
                en 1863. Su método busca secuencias repetidas en el texto cifrado
                para deducir la longitud de la clave y luego aplicar análisis de frecuencias.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>💡 One-Time Pad (1882)</h3>
              <p>
                Frank Miller propuso en 1882 que si la clave es tan larga como el
                mensaje, aleatoria y de un solo uso, el cifrado es matemáticamente
                irrompible. Esta idea, formalizada por Claude Shannon en 1949 como
                <em> one-time pad</em>, es la evolución directa de Vigenère.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ ========== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas frecuentes sobre Vigenère</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Por qué Vigenère es más difícil de romper que César?
              </summary>
              <p className={styles.faqAnswer}>
                Porque una misma letra del mensaje se cifra de forma diferente según su posición.
                Por ejemplo, con la clave «SOL», la primera A se convierte en S, la cuarta A en O,
                la séptima en L. El análisis de frecuencias simple no funciona porque las frecuencias
                quedan «mezcladas» entre múltiples alfabetos.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué es el test de Kasiski y cómo funciona?
              </summary>
              <p className={styles.faqAnswer}>
                El test de Kasiski busca secuencias de 3+ letras repetidas en el texto cifrado.
                Si la misma secuencia aparece varias veces, probablemente es porque la misma parte
                del texto se cifró con la misma parte de la clave. La distancia entre repeticiones
                es un múltiplo de la longitud de la clave. Conociendo la longitud, el cifrado
                se reduce a varios César paralelos.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué longitud de clave es segura para Vigenère?
              </summary>
              <p className={styles.faqAnswer}>
                Ninguna longitud hace a Vigenère seguro hoy en día. Sin embargo, claves largas
                y sin repetición de secuencias son más difíciles de atacar. Si la clave fuera
                tan larga como el mensaje y completamente aleatoria (one-time pad), el cifrado
                sería matemáticamente irrompible. Para uso real moderno, usa AES-256.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Se puede descifrar sin conocer la clave?
              </summary>
              <p className={styles.faqAnswer}>
                Sí, usando el método de Kasiski o el índice de coincidencia. Primero se determina
                la longitud probable de la clave, luego se divide el texto cifrado en grupos
                separados por esa distancia, y cada grupo se analiza como un César independiente
                usando análisis de frecuencias. Con suficiente texto (~200 caracteres), el ataque
                es factible.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué diferencia hay entre Vigenère y el cifrado XOR moderno?
              </summary>
              <p className={styles.faqAnswer}>
                Ambos aplican una operación repetida con una clave. XOR opera a nivel de bits
                (0 y 1) en lugar de letras (A-Z). Si la clave de XOR es aleatoria y tan larga
                como el mensaje, se convierte en el one-time pad teóricamente irrompible.
                AES y otros cifrados modernos combinan XOR con otras operaciones más complejas
                para mayor seguridad.
              </p>
            </details>
          </div>
        </section>

        {/* ========== SECCIÓN 4: EJEMPLO PASO A PASO ========== */}
        <section className={styles.ejemploSection}>
          <h2>🧮 Cómo funciona: ejemplo paso a paso</h2>
          <div className={styles.ejemploGrid}>
            <div className={styles.ejemploCard}>
              <div className={styles.ejemploStep}>1</div>
              <h3>Elegir mensaje y clave</h3>
              <div className={styles.ejemploCode}>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>Mensaje:</span>
                  <span className={styles.ejemploValue}>HOLAMUNDO</span>
                </div>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>Clave:</span>
                  <span className={styles.ejemploValue}>SOL</span>
                </div>
              </div>
            </div>
            <div className={styles.ejemploCard}>
              <div className={styles.ejemploStep}>2</div>
              <h3>Repetir la clave</h3>
              <div className={styles.ejemploCode}>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>Mensaje:</span>
                  <span className={styles.ejemploValue}>H O L A M U N D O</span>
                </div>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>Clave:</span>
                  <span className={styles.ejemploValue}>S O L S O L S O L</span>
                </div>
              </div>
            </div>
            <div className={styles.ejemploCard}>
              <div className={styles.ejemploStep}>3</div>
              <h3>Sumar posiciones (A=0...Z=25)</h3>
              <div className={styles.ejemploCode}>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>H(7)+S(18)=Z(25)</span>
                  <span className={styles.ejemploValue}>→ Z</span>
                </div>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>O(14)+O(14)=C(2)</span>
                  <span className={styles.ejemploValue}>→ C</span>
                </div>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>L(11)+L(11)=X(23)</span>
                  <span className={styles.ejemploValue}>→ X</span>
                </div>
              </div>
            </div>
            <div className={styles.ejemploCard}>
              <div className={styles.ejemploStep}>4</div>
              <h3>Resultado final</h3>
              <div className={styles.ejemploCode}>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>Original:</span>
                  <span className={styles.ejemploValue}>HOLAMUNDO</span>
                </div>
                <div className={styles.ejemploArrow}>↓</div>
                <div className={styles.ejemploRow}>
                  <span className={styles.ejemploLabel}>Cifrado:</span>
                  <span className={`${styles.ejemploValue} ${styles.ejemploResultado}`}>ZCXSAFFY C</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 5: CONSEJOS ========== */}
        <section className={styles.tipsSection}>
          <h2>💡 Consejos para claves seguras</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <div>
                <strong>Longitud mínima recomendada</strong>
                <p>Usa claves de al menos 8 caracteres. Cuanto más larga, más repeticiones diferentes del cifrado, y más difícil el análisis de Kasiski.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🚫</span>
              <div>
                <strong>Evita palabras del diccionario</strong>
                <p>Claves como «AMOR», «CLAVE» o «SECRET» son las primeras que prueban los atacantes. Usa frases o combinaciones sin sentido.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔀</span>
              <div>
                <strong>Sin patrones reconocibles</strong>
                <p>Evita claves como «ABCABC» o «AAABBB». Los patrones repetidos facilitan el análisis. Mejor: «XKQZMVP».</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <div>
                <strong>No reutilices claves</strong>
                <p>Usar la misma clave para múltiples mensajes facilita el criptoanálisis comparando los textos cifrados. Cada mensaje debería tener su propia clave.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2>⚠️ Errores frecuentes con el Cifrado Vigenère</h2>
          <ul className={styles.warningList}>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Usarlo para proteger información real</strong>
                <p>Vigenère es vulnerable al test de Kasiski y al índice de coincidencia. Con ~200 caracteres de texto cifrado cualquier herramienta online puede romperlo. Para datos reales usa AES-256 con una contraseña robusta.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Confundir clave corta con seguridad suficiente</strong>
                <p>Una clave de 3 letras (como «SOL») significa que el texto se divide en grupos de 3 y cada grupo es un César independiente. Con frecuencias de texto en español se rompe en minutos.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Creer que es igual al one-time pad</strong>
                <p>El one-time pad (Vigenère con clave aleatoria tan larga como el mensaje, usada una sola vez) sí es irrompible. Pero si reutilizas la clave o si no es verdaderamente aleatoria, la seguridad desaparece.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>✅</span>
              <div>
                <strong>Uso correcto: educación y juegos</strong>
                <p>Vigenère es ideal para aprender los fundamentos de la criptografía polialfabética, diseñar puzzles, escapadas temáticas y comprender la evolución histórica hacia los cifrados modernos.</p>
              </div>
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-vigenere')} />
      <ShareCard appName="cifrado-vigenere" />
      <Footer appName="cifrado-vigenere" />
    </div>
  );
}
