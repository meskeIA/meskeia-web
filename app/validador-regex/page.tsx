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

        {/* SECCIÓN 1: Tabla Comparativa de Metacaracteres */}
        <section>
          <h4>Tabla Comparativa: Metacaracteres Esenciales</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Metacarácter</th>
                  <th>Significado</th>
                  <th>Ejemplo de patrón</th>
                  <th>Caso de uso típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={3}><strong>Anchors</strong></td>
                  <td><code>^</code></td>
                  <td>Inicio de cadena / línea</td>
                  <td><code>^\d+</code></td>
                  <td>Validar que la cadena empieza con dígitos</td>
                </tr>
                <tr>
                  <td><code>$</code></td>
                  <td>Final de cadena / línea</td>
                  <td><code>\d+$</code></td>
                  <td>Validar que la cadena termina con dígitos</td>
                </tr>
                <tr>
                  <td><code>\b</code></td>
                  <td>Límite de palabra</td>
                  <td><code>\bcat\b</code></td>
                  <td>Buscar palabra exacta sin substring parcial</td>
                </tr>
                <tr>
                  <td rowSpan={5}><strong>Cuantificadores</strong></td>
                  <td><code>*</code></td>
                  <td>0 o más repeticiones (greedy)</td>
                  <td><code>ab*c</code></td>
                  <td>Campos opcionales de longitud variable</td>
                </tr>
                <tr>
                  <td><code>+</code></td>
                  <td>1 o más repeticiones (greedy)</td>
                  <td><code>\w+</code></td>
                  <td>Palabras que deben tener al menos un carácter</td>
                </tr>
                <tr>
                  <td><code>?</code></td>
                  <td>0 o 1 repetición (opcional)</td>
                  <td><code>colou?r</code></td>
                  <td>Aceptar variantes ortográficas (color / colour)</td>
                </tr>
                <tr>
                  <td><code>{'{n}'}</code></td>
                  <td>Exactamente n repeticiones</td>
                  <td><code>\d{'{5}'}</code></td>
                  <td>Código postal español de 5 dígitos exactos</td>
                </tr>
                <tr>
                  <td><code>{'{n,m}'}</code></td>
                  <td>Entre n y m repeticiones</td>
                  <td><code>[a-z]{'{2,4}'}</code></td>
                  <td>Extensiones de dominio (es, com, info)</td>
                </tr>
                <tr>
                  <td rowSpan={4}><strong>Clases</strong></td>
                  <td><code>\d</code></td>
                  <td>Dígito (equivale a [0-9])</td>
                  <td><code>\d{'{2}'}/\d{'{2}'}/\d{'{4}'}</code></td>
                  <td>Validar fecha en formato DD/MM/YYYY</td>
                </tr>
                <tr>
                  <td><code>\w</code></td>
                  <td>Alfanumérico + guión bajo</td>
                  <td><code>\w+@\w+\.\w+</code></td>
                  <td>Estructura básica de email</td>
                </tr>
                <tr>
                  <td><code>\s</code></td>
                  <td>Espacio en blanco (espacio, tab, salto)</td>
                  <td><code>\s+</code></td>
                  <td>Normalizar espacios múltiples en texto</td>
                </tr>
                <tr>
                  <td><code>[abc]</code></td>
                  <td>Clase de caracteres personalizada</td>
                  <td><code>[aeiou]</code></td>
                  <td>Encontrar todas las vocales en un texto</td>
                </tr>
                <tr>
                  <td rowSpan={3}><strong>Grupos</strong></td>
                  <td><code>(...)</code></td>
                  <td>Grupo de captura</td>
                  <td><code>(\d{'{4}'}-\d{'{2}'}-\d{'{2}'})</code></td>
                  <td>Extraer fechas para procesarlas por partes</td>
                </tr>
                <tr>
                  <td><code>(?:...)</code></td>
                  <td>Grupo de no captura</td>
                  <td><code>(?:https?://)\w+</code></td>
                  <td>Agrupar sin crear referencia de captura</td>
                </tr>
                <tr>
                  <td><code>(?=...)</code></td>
                  <td>Lookahead positivo</td>
                  <td><code>\d+(?= €)</code></td>
                  <td>Capturar precio sin incluir el símbolo</td>
                </tr>
                <tr>
                  <td><strong>Alternación</strong></td>
                  <td><code>a|b</code></td>
                  <td>Coincide con a o con b</td>
                  <td><code>cat|dog</code></td>
                  <td>Validar múltiples valores permitidos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso por Perfil */}
        <section>
          <h4>Casos de Uso por Perfil Profesional</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <strong>Desarrollador Web</strong>
              </div>
              <p>Validación de formularios de usuario en el frontend y backend.</p>
              <div className={styles.escenarioExample}>
                <code>/^[\w.-]+@[\w.-]+\.[a-zA-Z]{'{2,}'}$/</code>
                <span>Email</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>/^(\+34)?[6789]\d{'{8}'}$/</code>
                <span>Teléfono España</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>/^[0-9XYZ]\d{'{7}'}[A-Z]$/</code>
                <span>DNI/NIE</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>/^\d{'{5}'}$/</code>
                <span>Código Postal</span>
              </div>
              <p className={styles.escenarioTip}>Tip: Combina regex con validación semántica (verificar dominio del email) para mayor fiabilidad.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📊</span>
                <strong>Data Scientist</strong>
              </div>
              <p>Extracción de datos estructurados desde texto no estructurado (logs, documentos, scraping).</p>
              <div className={styles.escenarioExample}>
                <code>/\d{'{1,3}'}\.\d{'{1,3}'}\.\d{'{1,3}'}\.\d{'{1,3}'}/g</code>
                <span>IPs en logs</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>/\d{'{4}'}-\d{'{2}'}-\d{'{2}'}T\d{'{2}'}:\d{'{2}'}/g</code>
                <span>Timestamps ISO</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>/\d+[.,]\d{'{2}'}\s*€/g</code>
                <span>Precios en euros</span>
              </div>
              <p className={styles.escenarioTip}>Tip: Usa grupos de captura nombrados <code>(?&lt;nombre&gt;...)</code> para acceder a los datos extraídos por clave en lugar de por índice.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🖥️</span>
                <strong>SysAdmin</strong>
              </div>
              <p>Filtrado y análisis de logs del sistema con herramientas de línea de comandos.</p>
              <div className={styles.escenarioExample}>
                <code>grep -E &apos;ERROR|WARN&apos; app.log</code>
                <span>Filtrar por nivel</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>grep -P &apos;\[5\d{'{2}'}\]&apos; access.log</code>
                <span>Errores 5xx HTTP</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>sed -E &apos;s/(\d+\.\d+\.\d+\.\d+)/[IP]/g&apos;</code>
                <span>Anonimizar IPs</span>
              </div>
              <p className={styles.escenarioTip}>Tip: En POSIX (grep básico, sed sin -E) usa [0-9] en lugar de \d y [a-zA-Z0-9_] en lugar de \w.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧪</span>
                <strong>QA Tester</strong>
              </div>
              <p>Verificación automatizada de formatos en salidas de la aplicación y APIs.</p>
              <div className={styles.escenarioExample}>
                <code>/^[0-9a-f]{'{8}'}-([0-9a-f]{'{4}'}-){'{3}'}[0-9a-f]{'{12}'}$/i</code>
                <span>UUID v4</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>/^\d{'{4}'}-\d{'{2}'}-\d{'{2}'}$/</code>
                <span>Fecha ISO 8601</span>
              </div>
              <div className={styles.escenarioExample}>
                <code>/^https?:\/\/.+\..+/</code>
                <span>URLs en respuestas</span>
              </div>
              <p className={styles.escenarioTip}>Tip: Escribe siempre casos negativos: cadenas vacías, longitudes límite y caracteres especiales como ñ, tildes o emojis.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section>
          <h4>Preguntas Frecuentes sobre Expresiones Regulares</h4>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre regex greedy y lazy?</strong>
              <p>Los cuantificadores <em>greedy</em> (voraces) como <code>*</code>, <code>+</code> y <code>?</code> capturan la mayor cantidad de texto posible. Los <em>lazy</em> (perezosos) como <code>*?</code>, <code>+?</code> capturan la mínima cantidad. Ejemplo: ante <code>&lt;b&gt;texto&lt;/b&gt;</code>, el patrón <code>&lt;.*&gt;</code> (greedy) captura todo, mientras que <code>&lt;.*?&gt;</code> (lazy) captura solo <code>&lt;b&gt;</code>.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo hacer una regex para validar email?</strong>
              <p>Un patrón práctico es <code>/^[\w.-]+@[\w.-]+\.[a-zA-Z]{'{2,}'}$/</code>. No existe una regex perfecta para email (la especificación RFC 5322 es muy compleja). Para producción, lo más fiable es validar el formato básico con regex y luego enviar un email de confirmación para verificar que el buzón existe.</p>
              <p className={styles.faqTip}>El estándar permite caracteres como +, comillas y paréntesis en el usuario del email, que muchas regex descartan. Decide el nivel de permisividad según tu caso de uso.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué son los grupos de captura?</strong>
              <p>Los paréntesis <code>(...)</code> crean un grupo de captura: la parte del texto que coincide queda almacenada para usarla después. En JavaScript, <code>match[1]</code> devuelve el primer grupo. Con grupos nombrados <code>(?&lt;año&gt;\d{'{4}'})</code>, accedes por <code>match.groups.año</code>. Los grupos de no captura <code>(?:...)</code> agrupan sin almacenar.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Diferencia entre \d y [0-9]?</strong>
              <p>En la mayoría de motores modernos (JavaScript, Python, PCRE) son equivalentes para el ASCII básico. Sin embargo, <code>\d</code> en algunos motores puede incluir dígitos Unicode (como dígitos árabes ٠١٢ o dígitos de escrituras asiáticas). Si necesitas estrictamente dígitos ASCII, usa <code>[0-9]</code>. En POSIX (grep sin -P) <code>\d</code> no está disponible, debes usar <code>[0-9]</code>.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo hacer que la regex sea case-insensitive?</strong>
              <p>Añade el flag <code>i</code> al patrón. En JavaScript: <code>/patrón/i</code> o <code>new RegExp(&apos;patrón&apos;, &apos;i&apos;)</code>. En Python: <code>re.compile(&apos;patrón&apos;, re.IGNORECASE)</code>. En grep: <code>grep -i</code>. En esta herramienta, activa el botón <strong>i (insensible)</strong> en la sección de flags.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el lookahead y lookbehind?</strong>
              <p>Son aserciones de posición que comprueban qué hay delante o detrás sin incluirlo en la coincidencia. <strong>Lookahead positivo</strong> <code>(?=...)</code>: el texto debe ir seguido de algo. <strong>Lookahead negativo</strong> <code>(?!...)</code>: el texto NO debe ir seguido de algo. <strong>Lookbehind positivo</strong> <code>(?&lt;=...)</code>: el texto debe ir precedido de algo. <strong>Lookbehind negativo</strong> <code>(?&lt;!...)</code>: el texto NO debe ir precedido de algo.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué mi regex funciona en JavaScript pero no en Python?</strong>
              <p>Cada motor tiene pequeñas diferencias. Las más comunes: (1) Python usa <code>(?P&lt;nombre&gt;)</code> para grupos nombrados, JavaScript usa <code>(?&lt;nombre&gt;)</code>. (2) Python no soporta lookbehind de longitud variable en algunos casos. (3) En Python, <code>re.match()</code> ancla al inicio pero no al final (usar <code>re.fullmatch()</code> para anclar ambos). (4) En Python los strings raw <code>r&apos;\d+&apos;</code> evitan problemas con el escape de barras invertidas.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo optimizar una regex lenta (ReDoS)?</strong>
              <p>El ReDoS (Regular Expression Denial of Service) ocurre con patrones que generan backtracking exponencial, como <code>(a+)+</code> ante cadenas largas. Estrategias de mitigación: (1) Evita anidar cuantificadores sobre clases ambiguas. (2) Usa cuantificadores posesivos (<code>a++</code>) o grupos atómicos (<code>(?&gt;a+)</code>) si el motor los soporta. (3) Añade anchors para reducir el espacio de búsqueda. (4) Usa herramientas como <em>safe-regex</em> o <em>rxxr2</em> para detectar patrones vulnerables.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section>
          <h4>Cómo Construir una Regex de Cero: 7 Pasos</h4>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Define el patrón en lenguaje natural</strong>
                <p>Antes de escribir ningún símbolo, describe con palabras qué quieres encontrar. Ejemplo: &ldquo;un número de teléfono español que puede empezar con +34, seguido de 9 dígitos que empiecen por 6, 7, 8 o 9&rdquo;. Esta descripción es tu especificación de requisitos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Identifica los caracteres literales</strong>
                <p>Distingue qué partes son texto fijo (literal) y qué partes varían. En el ejemplo del teléfono, <code>+34</code> es literal, pero los 9 dígitos varían. Los caracteres con significado especial en regex (<code>. * + ? ^ $ { } [ ] | ( ) \</code>) deben escaparse con <code>\</code> cuando los usas como literales.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Añade metacaracteres para las partes variables</strong>
                <p>Reemplaza las descripciones de las partes variables por metacaracteres: <code>\d</code> para dígitos, <code>\w</code> para alfanuméricos, <code>[6789]</code> para una clase de caracteres concreta. Construye el esqueleto del patrón: <code>(\+34)?[6789]\d\d\d\d\d\d\d\d</code>.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Simplifica con cuantificadores</strong>
                <p>Sustituye repeticiones por cuantificadores. <code>\d\d\d\d\d\d\d\d</code> se convierte en <code>\d{'{8}'}</code>. El patrón queda: <code>(\+34)?[6789]\d{'{8}'}</code>. Elige entre greedy (<code>*</code>, <code>+</code>), lazy (<code>*?</code>) o exacto (<code>{'{n}'}</code>) según el caso.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Prueba con casos positivos y negativos</strong>
                <p>Valida el patrón contra ejemplos válidos (<code>+34612345678</code>, <code>912345678</code>) e inválidos (<code>123456789</code>, <code>+34512345678</code>, cadena vacía). Si algún caso no funciona como esperas, ajusta el patrón. Usa esta herramienta para probar en tiempo real.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Añade anchors para validación estricta</strong>
                <p>Si el patrón debe validar toda la cadena (no buscar dentro de ella), añade <code>^</code> al inicio y <code>$</code> al final: <code>^(\+34)?[6789]\d{'{8}'}$</code>. Sin anchors, el patrón encontraría el teléfono aunque la cadena contuviese texto adicional alrededor.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Documenta el patrón</strong>
                <p>Guarda el patrón junto a una descripción, los casos de prueba y la fuente normativa (si valida un formato oficial). En Python puedes usar <code>re.VERBOSE</code> para añadir comentarios dentro del propio patrón. En JavaScript, considera definirlo como constante con nombre descriptivo: <code>const TELEFONO_ESPANOL = /^(\+34)?[6789]\d{'{8}'}$/</code>.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section>
          <h4>Mejores Prácticas al Escribir Regex</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧪</span>
              <strong>Prueba siempre los casos límite</strong>
              <p>Cadena vacía, un solo carácter, el valor mínimo y máximo permitido, caracteres especiales (<code>@</code>, <code>-</code>, <code>_</code>), unicode (tildes, ñ, emojis) y saltos de línea. El 80% de los bugs de regex aparecen en los extremos, no en los casos típicos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <strong>Usa grupos no capturantes cuando sea posible</strong>
              <p>Cuando solo necesitas agrupar para aplicar un cuantificador o alternación, usa <code>(?:...)</code> en lugar de <code>(...)</code>. Los grupos de captura tienen un coste de memoria y hacen el código más difícil de mantener si hay muchos grupos numerados.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <strong>Comenta las regex complejas</strong>
              <p>En Python usa el modo verbose (<code>re.VERBOSE</code>) para añadir comentarios y espacios dentro del patrón. En otros lenguajes, define la regex como constante con nombre descriptivo y añade un comentario explicando su propósito, formato esperado y ejemplos válidos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Prefiere regex específicas sobre genéricas</strong>
              <p>Un patrón demasiado amplio como <code>.*</code> acepta casi cualquier cosa y da falsos positivos. Define exactamente qué caracteres son válidos, sus rangos de longitud y su estructura. Cuanto más específico sea el patrón, menos mantenimiento necesitará en el futuro.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔒</span>
              <strong>Valida también el lado servidor</strong>
              <p>Nunca confíes únicamente en la validación regex del frontend. Un atacante puede saltársela manipulando la petición HTTP. La regex del cliente mejora la experiencia de usuario; la del servidor protege la integridad de los datos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Evita compilar la misma regex en cada iteración</strong>
              <p>Si aplicas el mismo patrón en un bucle de miles de registros, compila la regex una sola vez fuera del bucle. En Python: <code>patrón = re.compile(r&apos;\d+&apos;)</code>. En JavaScript, define el literal de regex fuera de la función. Esto puede mejorar el rendimiento en factores de 10x o más.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — Errores Frecuentes */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Errores frecuentes que causan bugs silenciosos</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Olvidar escapar el punto:</strong> <code>.</code> en regex significa &ldquo;cualquier carácter&rdquo;, no un punto literal. Para buscar un punto real escribe <code>\.</code>. El patrón <code>3.14</code> coincide con <code>3X14</code>, <code>3014</code>, etc. Siempre escapa los metacaracteres cuando los uses como literales.
              </li>
              <li>
                <strong>ReDoS con patrones anidados:</strong> Patrones como <code>(a+)+</code>, <code>(\w+\s?)+</code> o <code>([a-zA-Z]+)*</code> ante entradas largas que no coinciden pueden causar backtracking exponencial y bloquear el hilo de ejecución durante segundos o minutos. Nunca uses estos patrones en código expuesto a datos de usuarios no confiables.
              </li>
              <li>
                <strong>Asumir que \d incluye solo dígitos ASCII:</strong> En motores con soporte Unicode completo, <code>\d</code> puede incluir dígitos de otros sistemas de escritura (٣, ৩, ３...). Si necesitas estrictamente 0-9, usa <code>[0-9]</code>. En JavaScript con flag <code>u</code>, el comportamiento es más predecible.
              </li>
              <li>
                <strong>Olvidar los anchors ^ y $:</strong> Sin <code>^</code> y <code>$</code>, el patrón <code>\d{'{5}'}</code> coincide con cualquier cadena que <em>contenga</em> 5 dígitos consecutivos, incluyendo <code>abc12345xyz</code>. Para validación de formato completo, siempre añade anchors: <code>^\d{'{5}'}$</code>.
              </li>
              <li>
                <strong>Usar regex para parsear HTML o XML:</strong> Las regex no pueden parsear HTML/XML correctamente porque son lenguajes no regulares con anidamiento arbitrario. Usa un parser DOM (<code>DOMParser</code> en JavaScript, <code>BeautifulSoup</code> en Python, <code>SimpleXML</code> en PHP) para trabajar con documentos HTML/XML.
              </li>
              <li>
                <strong>Confundir <code>re.match()</code> con <code>re.fullmatch()</code> en Python:</strong> <code>re.match()</code> ancla al inicio pero no al final, por lo que <code>re.match(r&apos;\d{'{5}'}&apos;, &apos;12345abc&apos;)</code> devuelve coincidencia. Para validar la cadena completa usa <code>re.fullmatch()</code> o añade <code>$</code> al patrón.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('validador-regex')} />

      <ShareCard appName="validador-regex" />
      <Footer appName="validador-regex" />
    </div>
  );
}
