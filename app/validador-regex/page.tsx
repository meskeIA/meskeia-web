'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './ValidadorRegex.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface Match {
  text: string;
  index: number;
  groups?: { [key: string]: string };
}

interface PatternExample {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

const PATTERN_LIBRARY: PatternExample[] = [
  { name: 'Email', pattern: '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$', description: 'Valida direcciones de email', example: 'usuario@ejemplo.com' },
  { name: 'Teléfono España', pattern: '^(\\+34)?[6789]\\d{8}$', description: 'Móviles y fijos españoles', example: '+34612345678' },
  { name: 'URL', pattern: '^https?:\\/\\/[\\w.-]+\\.[a-zA-Z]{2,}.*$', description: 'URLs con http/https', example: 'https://ejemplo.com/pagina' },
  { name: 'DNI/NIE', pattern: '^[0-9XYZ]\\d{7}[A-Z]$', description: 'DNI o NIE español', example: '12345678A' },
  { name: 'Código Postal', pattern: '^\\d{5}$', description: 'Código postal español (5 dígitos)', example: '28001' },
  { name: 'IBAN España', pattern: '^ES\\d{22}$', description: 'IBAN español', example: 'ES9121000418450200051332' },
  { name: 'Fecha DD/MM/YYYY', pattern: '^\\d{2}\\/\\d{2}\\/\\d{4}$', description: 'Formato de fecha español', example: '25/12/2024' },
  { name: 'Hora HH:MM', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', description: 'Hora en formato 24h', example: '14:30' },
  { name: 'IPv4', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', description: 'Dirección IP v4', example: '192.168.1.1' },
  { name: 'Hexadecimal', pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', description: 'Color hexadecimal', example: '#FF5733' },
  { name: 'Solo letras', pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$', description: 'Solo letras y espacios', example: 'Juan García' },
  { name: 'Solo números', pattern: '^\\d+$', description: 'Solo dígitos', example: '12345' },
];

export default function ValidadorRegexPage() {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [error, setError] = useState('');

  const toggleFlag = useCallback((flag: 'g' | 'i' | 'm') => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const loadPattern = useCallback((example: PatternExample) => {
    setPattern(example.pattern);
    setTestText(example.example);
    setError('');
  }, []);

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
      .join('');
  }, [flags]);

  const { matches, highlightedText, isValid } = useMemo(() => {
    if (!pattern) {
      return { matches: [], highlightedText: testText, isValid: true };
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const foundMatches: Match[] = [];

      if (flags.g) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.groups,
          });
          if (!match[0]) break; // Evitar loops infinitos con patrones vacíos
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.groups,
          });
        }
      }

      // Generar texto resaltado
      let highlighted = testText;
      if (foundMatches.length > 0 && testText) {
        // Reemplazar de atrás hacia adelante para no afectar los índices
        const sortedMatches = [...foundMatches].sort((a, b) => b.index - a.index);
        for (const m of sortedMatches) {
          const before = highlighted.slice(0, m.index);
          const match = highlighted.slice(m.index, m.index + m.text.length);
          const after = highlighted.slice(m.index + m.text.length);
          highlighted = before + `<mark>${match}</mark>` + after;
        }
      }

      setError('');
      return { matches: foundMatches, highlightedText: highlighted, isValid: true };
    } catch (e) {
      setError((e as Error).message);
      return { matches: [], highlightedText: testText, isValid: false };
    }
  }, [pattern, testText, flagString, flags.g]);

  const handleClear = useCallback(() => {
    setPattern('');
    setTestText('');
    setError('');
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Validador de Expresiones Regulares</h1>
        <p className={styles.subtitle}>Testa y valida regex con resaltado de coincidencias</p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Expresión Regular</h2>

          <div className={styles.patternInput}>
            <span className={styles.patternPrefix}>/</span>
            <input
              type="text"
              className={`${styles.patternField} ${error ? styles.patternError : ''}`}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Escribe tu patrón regex..."
            />
            <span className={styles.patternSuffix}>/{flagString}</span>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className={styles.flagsSection}>
            <span className={styles.flagsLabel}>Flags:</span>
            <div className={styles.flagsButtons}>
              <button
                className={`${styles.flagBtn} ${flags.g ? styles.flagActive : ''}`}
                onClick={() => toggleFlag('g')}
                title="Global - Buscar todas las coincidencias"
              >
                g <span className={styles.flagDesc}>global</span>
              </button>
              <button
                className={`${styles.flagBtn} ${flags.i ? styles.flagActive : ''}`}
                onClick={() => toggleFlag('i')}
                title="Case Insensitive - Ignorar mayúsculas/minúsculas"
              >
                i <span className={styles.flagDesc}>insensible</span>
              </button>
              <button
                className={`${styles.flagBtn} ${flags.m ? styles.flagActive : ''}`}
                onClick={() => toggleFlag('m')}
                title="Multiline - ^ y $ aplican a cada línea"
              >
                m <span className={styles.flagDesc}>multilínea</span>
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Texto de prueba</label>
            <textarea
              className={styles.textarea}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Escribe el texto donde buscar coincidencias..."
            />
          </div>

          <button onClick={handleClear} className={styles.btnSecondary}>
            Limpiar todo
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Resultados</h2>

          {testText && pattern && isValid ? (
            <>
              <div className={styles.matchCount}>
                <span className={styles.matchNumber}>{matches.length}</span>
                <span className={styles.matchLabel}>
                  {matches.length === 1 ? 'coincidencia' : 'coincidencias'}
                </span>
              </div>

              <div className={styles.highlightBox}>
                <h4>Texto con coincidencias resaltadas:</h4>
                <div
                  className={styles.highlightedText}
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>

              {matches.length > 0 && (
                <div className={styles.matchList}>
                  <h4>Detalle de coincidencias:</h4>
                  {matches.map((match, index) => (
                    <div key={index} className={styles.matchItem}>
                      <span className={styles.matchIndex}>#{index + 1}</span>
                      <code className={styles.matchText}>&quot;{match.text}&quot;</code>
                      <span className={styles.matchPosition}>posición {match.index}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔍</span>
              <p>Escribe un patrón y texto para ver las coincidencias</p>
            </div>
          )}
        </div>
      </div>

      {/* Biblioteca de patrones */}
      <div className={styles.librarySection}>
        <h3>Biblioteca de Patrones Comunes</h3>
        <div className={styles.libraryGrid}>
          {PATTERN_LIBRARY.map((item, index) => (
            <button
              key={index}
              className={styles.libraryCard}
              onClick={() => loadPattern(item)}
            >
              <span className={styles.libraryName}>{item.name}</span>
              <code className={styles.libraryPattern}>{item.pattern}</code>
              <span className={styles.libraryDesc}>{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cheatsheet */}
      <div className={styles.cheatsheet}>
        <h3>Referencia Rápida</h3>
        <div className={styles.cheatGrid}>
          <div className={styles.cheatGroup}>
            <h4>Caracteres</h4>
            <div className={styles.cheatItem}><code>.</code> Cualquier carácter</div>
            <div className={styles.cheatItem}><code>\d</code> Dígito (0-9)</div>
            <div className={styles.cheatItem}><code>\w</code> Alfanumérico</div>
            <div className={styles.cheatItem}><code>\s</code> Espacio en blanco</div>
          </div>
          <div className={styles.cheatGroup}>
            <h4>Cuantificadores</h4>
            <div className={styles.cheatItem}><code>*</code> 0 o más</div>
            <div className={styles.cheatItem}><code>+</code> 1 o más</div>
            <div className={styles.cheatItem}><code>?</code> 0 o 1</div>
            <div className={styles.cheatItem}><code>{'{n}'}</code> Exactamente n</div>
          </div>
          <div className={styles.cheatGroup}>
            <h4>Anclas</h4>
            <div className={styles.cheatItem}><code>^</code> Inicio</div>
            <div className={styles.cheatItem}><code>$</code> Final</div>
            <div className={styles.cheatItem}><code>\b</code> Límite de palabra</div>
          </div>
          <div className={styles.cheatGroup}>
            <h4>Grupos</h4>
            <div className={styles.cheatItem}><code>(abc)</code> Grupo de captura</div>
            <div className={styles.cheatItem}><code>[abc]</code> Clase de caracteres</div>
            <div className={styles.cheatItem}><code>a|b</code> Alternancia</div>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Guía de Expresiones Regulares"
        subtitle="Sintaxis avanzada, diferencias entre motores (JS, Python, PCRE) y patrones para casos comunes"
        icon="🔍"
      >
        <section>
          <h4>¿Qué son las expresiones regulares?</h4>
          <p>Las expresiones regulares (regex o regexp) son secuencias de caracteres que definen un patrón de búsqueda. Desarrolladas en los años 50 por el matemático Stephen Kleene, hoy son omnipresentes en programación, validación de formularios, procesamiento de texto y herramientas de línea de comandos.</p>
          <ul>
            <li><strong>Validación de formularios</strong>: Email, teléfono, código postal, DNI.</li>
            <li><strong>Búsqueda y reemplazo avanzado</strong>: En editores de código, procesadores de texto, scripts.</li>
            <li><strong>Extracción de datos (scraping)</strong>: Capturar fechas, precios o URLs de texto no estructurado.</li>
            <li><strong>Procesamiento de logs</strong>: Filtrar y analizar millones de líneas de log de servidores.</li>
          </ul>
        </section>

        <section>
          <h4>Sintaxis avanzada: más allá del cheatsheet</h4>
          <ul>
            <li><strong>Grupos de captura nombrados</strong>: <code>(?&lt;nombre&gt;patrón)</code> — en lugar de referirse al grupo por número (<code>\1</code>), usa el nombre (<code>\k&lt;nombre&gt;</code>). Más legible y mantenible.</li>
            <li><strong>Grupos de no captura</strong>: <code>(?:patrón)</code> — agrupa sin crear un grupo de captura. Útil cuando necesitas alternancia pero no quieres el overhead de captura.</li>
            <li><strong>Lookahead positivo</strong>: <code>(?=patrón)</code> — asegura que el texto va seguido de algo, sin incluirlo en la coincidencia. Ej: <code>\d+(?= €)</code> captura el número antes del símbolo del euro.</li>
            <li><strong>Lookahead negativo</strong>: <code>(?!patrón)</code> — asegura que el texto NO va seguido de algo. Ej: <code>foo(?!bar)</code> captura &quot;foo&quot; solo cuando no va seguido de &quot;bar&quot;.</li>
            <li><strong>Lookbehind positivo</strong>: <code>(?&lt;=patrón)</code> — asegura que el texto va precedido de algo. Ej: <code>(?&lt;=€)\d+</code> captura el número después del euro.</li>
            <li><strong>Cuantificadores perezosos</strong>: <code>*?</code>, <code>+?</code>, <code>??</code> — por defecto los cuantificadores son «voraces» (greedy) y capturan lo máximo posible. El <code>?</code> los hace «perezosos» y capturan lo mínimo posible.</li>
          </ul>
        </section>

        <section>
          <h4>Diferencias entre motores de regex</h4>
          <ul>
            <li><strong>JavaScript</strong>: Motor ECMA. Soporta lookahead/lookbehind (ES2018+), grupos nombrados (ES2018+), flag <code>s</code> (dotAll, ES2018+), flag <code>d</code> (indices, ES2022+). <strong>No soporta</strong>: lookbehind de longitud variable en motores antiguos.</li>
            <li><strong>Python (re)</strong>: Motor similar a PCRE. Soporta lookbehind de longitud variable limitada (<code>re.fullmatch</code>), <code>re.VERBOSE</code> para comentarios en el patrón. Sintaxis de grupos: <code>(?P&lt;nombre&gt;)</code>.</li>
            <li><strong>PCRE (PHP, Nginx, grep -P)</strong>: El más completo. Soporta lookbehind variable, recursión (<code>(?R)</code>), condicionales, posesivos (<code>a++</code>), atómicos.</li>
            <li><strong>POSIX (grep básico, sed)</strong>: El más limitado. No soporta <code>\d</code>, <code>\w</code>. Usa <code>[0-9]</code>, <code>[a-zA-Z0-9_]</code>. No tiene grupos de no captura ni lookaheads.</li>
          </ul>
          <p><strong>Nota</strong>: Esta herramienta usa el motor de JavaScript (navegador).</p>
        </section>

        <section>
          <h4>Errores comunes y cómo evitarlos</h4>
          <ul>
            <li><strong>Catastrophic backtracking</strong>: Patrones como <code>(a+)+</code> con texto largo pueden bloquear el navegador. Ocurre cuando el motor explora exponencialmente todas las combinaciones posibles. Evita anidar cuantificadores sobre clases ambiguas.</li>
            <li><strong>Olvidar escapar metacaracteres</strong>: Los caracteres <code>. * + ? ^ $ { } [ ] | ( ) \</code> tienen significado especial. Para buscarlos literalmente, escápalos con <code>\</code>.</li>
            <li><strong>Anclas incorrectas</strong>: Sin <code>^</code> y <code>$</code>, el patrón puede coincidir en cualquier parte del texto. Para validación, siempre ancla: <code>^\d{5}$</code> valida exactamente 5 dígitos.</li>
            <li><strong>Flag global con exec() en bucle</strong>: En JavaScript, <code>regex.exec()</code> con flag <code>g</code> mantiene estado. Si reseteas el texto sin resetear el regex, el índice queda desalineado. Usa <code>regex.lastIndex = 0</code> o crea una nueva instancia.</li>
            <li><strong>Asumir que regex valida semántica</strong>: Un regex puede validar que un email tiene el formato correcto, pero no que el dominio existe o que el buzón acepta correo. La validación completa requiere envío de email de confirmación.</li>
          </ul>
        </section>

        <section>
          <h4>Patrones avanzados de uso frecuente</h4>
          <ul>
            <li><strong>Contraseña segura</strong>: <code>^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&amp;])[A-Za-z\d@$!%*?&amp;]{'{8,}'}$</code> — al menos 8 caracteres con minúscula, mayúscula, número y símbolo.</li>
            <li><strong>Slug de URL</strong>: <code>^[a-z0-9]+(?:-[a-z0-9]+)*$</code> — solo minúsculas, números y guiones intermedios.</li>
            <li><strong>Dirección MAC</strong>: <code>^([0-9A-Fa-f]{'{2}'}[:-]){'{5}'}[0-9A-Fa-f]{'{2}'}$</code></li>
            <li><strong>Número decimal con coma</strong>: <code>^\d+([.,]\d{'{1,2}'})?$</code> — admite tanto punto como coma decimal.</li>
            <li><strong>Hashtag</strong>: <code>#[a-zA-ZÀ-ÿ\w]+</code> — incluye caracteres acentuados.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('validador-regex')} />

      <ShareCard appName="validador-regex" />
      <Footer appName="validador-regex" />
    </div>
  );
}
