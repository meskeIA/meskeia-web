'use client';

import { useState, useMemo } from 'react';
import styles from './ComparadorTextos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ==================== TIPOS ====================

type TipoDiferencia = 'igual' | 'agregado' | 'eliminado' | 'modificado';

interface LineaDiff {
  numeroIzq: number | null;
  numeroDer: number | null;
  contenidoIzq: string;
  contenidoDer: string;
  tipo: TipoDiferencia;
}

interface EstadisticasDiff {
  lineasIguales: number;
  lineasAgregadas: number;
  lineasEliminadas: number;
  lineasModificadas: number;
  porcentajeSimilitud: number;
}

// ==================== ALGORITMO DIFF ====================

function calcularLCS(arr1: string[], arr2: string[]): number[][] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function generarDiff(texto1: string, texto2: string): LineaDiff[] {
  const lineas1 = texto1.split('\n');
  const lineas2 = texto2.split('\n');
  const dp = calcularLCS(lineas1, lineas2);
  const resultado: LineaDiff[] = [];

  let i = lineas1.length;
  let j = lineas2.length;

  const tempResultado: LineaDiff[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lineas1[i - 1] === lineas2[j - 1]) {
      tempResultado.push({
        numeroIzq: i,
        numeroDer: j,
        contenidoIzq: lineas1[i - 1],
        contenidoDer: lineas2[j - 1],
        tipo: 'igual',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempResultado.push({
        numeroIzq: null,
        numeroDer: j,
        contenidoIzq: '',
        contenidoDer: lineas2[j - 1],
        tipo: 'agregado',
      });
      j--;
    } else {
      tempResultado.push({
        numeroIzq: i,
        numeroDer: null,
        contenidoIzq: lineas1[i - 1],
        contenidoDer: '',
        tipo: 'eliminado',
      });
      i--;
    }
  }

  // Invertir para orden correcto
  for (let k = tempResultado.length - 1; k >= 0; k--) {
    resultado.push(tempResultado[k]);
  }

  return resultado;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function ComparadorTextosPage() {
  const [texto1, setTexto1] = useState('');
  const [texto2, setTexto2] = useState('');
  const [ignorarEspacios, setIgnorarEspacios] = useState(false);
  const [ignorarMayusculas, setIgnorarMayusculas] = useState(false);

  // Calcular diff
  const diff = useMemo(() => {
    let t1 = texto1;
    let t2 = texto2;

    if (ignorarEspacios) {
      t1 = t1.replace(/\s+/g, ' ').trim();
      t2 = t2.replace(/\s+/g, ' ').trim();
    }

    if (ignorarMayusculas) {
      t1 = t1.toLowerCase();
      t2 = t2.toLowerCase();
    }

    return generarDiff(t1, t2);
  }, [texto1, texto2, ignorarEspacios, ignorarMayusculas]);

  // Estadísticas
  const estadisticas = useMemo((): EstadisticasDiff => {
    const lineasIguales = diff.filter(d => d.tipo === 'igual').length;
    const lineasAgregadas = diff.filter(d => d.tipo === 'agregado').length;
    const lineasEliminadas = diff.filter(d => d.tipo === 'eliminado').length;
    const lineasModificadas = 0; // En este algoritmo simple no detectamos modificaciones

    const totalLineas = diff.length;
    const porcentajeSimilitud = totalLineas > 0
      ? (lineasIguales / totalLineas) * 100
      : 100;

    return {
      lineasIguales,
      lineasAgregadas,
      lineasEliminadas,
      lineasModificadas,
      porcentajeSimilitud,
    };
  }, [diff]);

  // Limpiar todo
  const limpiarTodo = () => {
    setTexto1('');
    setTexto2('');
  };

  // Intercambiar textos
  const intercambiarTextos = () => {
    const temp = texto1;
    setTexto1(texto2);
    setTexto2(temp);
  };

  // Cargar ejemplo
  const cargarEjemplo = () => {
    setTexto1(`Hola mundo
Este es un texto de ejemplo
Línea tres del original
Última línea`);
    setTexto2(`Hola mundo
Este es un texto modificado
Nueva línea agregada
Última línea`);
  };

  const hayTexto = texto1.trim() || texto2.trim();
  const hayDiferencias = diff.some(d => d.tipo !== 'igual');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Comparador de Textos</h1>
        <p className={styles.subtitle}>
          Encuentra las diferencias entre dos textos (estilo Diff)
        </p>
      </header>

      <LegalNotice />

      {/* Opciones */}
      <div className={styles.opcionesBar}>
        <div className={styles.opcionesGrupo}>
          <label className={styles.opcionCheck}>
            <input
              type="checkbox"
              checked={ignorarEspacios}
              onChange={(e) => setIgnorarEspacios(e.target.checked)}
            />
            Ignorar espacios extra
          </label>
          <label className={styles.opcionCheck}>
            <input
              type="checkbox"
              checked={ignorarMayusculas}
              onChange={(e) => setIgnorarMayusculas(e.target.checked)}
            />
            Ignorar mayúsculas/minúsculas
          </label>
        </div>
        <div className={styles.opcionesBotones}>
          <button onClick={cargarEjemplo} className={styles.btnSecundario}>
            Cargar ejemplo
          </button>
          <button onClick={intercambiarTextos} className={styles.btnSecundario}>
            ↔ Intercambiar
          </button>
          <button onClick={limpiarTodo} className={styles.btnSecundario}>
            Limpiar
          </button>
        </div>
      </div>

      {/* Paneles de texto */}
      <div className={styles.textosGrid}>
        <section className={styles.textoPanel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.labelOriginal}>Texto original</span>
          </h2>
          <textarea
            value={texto1}
            onChange={(e) => setTexto1(e.target.value)}
            placeholder="Pega o escribe el texto original..."
            className={styles.textArea}
            rows={10}
          />
        </section>

        <section className={styles.textoPanel}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.labelModificado}>Texto modificado</span>
          </h2>
          <textarea
            value={texto2}
            onChange={(e) => setTexto2(e.target.value)}
            placeholder="Pega o escribe el texto modificado..."
            className={styles.textArea}
            rows={10}
          />
        </section>
      </div>

      {/* Estadísticas */}
      {hayTexto && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statDot} data-tipo="igual"></span>
            <span>{formatNumber(estadisticas.lineasIguales, 0)} iguales</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statDot} data-tipo="agregado"></span>
            <span>{formatNumber(estadisticas.lineasAgregadas, 0)} añadidas</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statDot} data-tipo="eliminado"></span>
            <span>{formatNumber(estadisticas.lineasEliminadas, 0)} eliminadas</span>
          </div>
          <div className={styles.statSimilitud}>
            <strong>{formatNumber(estadisticas.porcentajeSimilitud, 1)}%</strong>
            <span>similitud</span>
          </div>
        </div>
      )}

      {/* Resultado Diff */}
      {hayTexto && (
        <section className={styles.diffPanel}>
          <h2 className={styles.sectionTitle}>Comparación línea a línea</h2>

          {!hayDiferencias ? (
            <div className={styles.sinDiferencias}>
              <span className={styles.checkIcon}>✓</span>
              <p>Los textos son idénticos</p>
            </div>
          ) : (
            <div className={styles.diffContainer}>
              <div className={styles.diffHeader}>
                <span className={styles.diffHeaderCol}>#</span>
                <span className={styles.diffHeaderCol}>Original</span>
                <span className={styles.diffHeaderCol}>#</span>
                <span className={styles.diffHeaderCol}>Modificado</span>
              </div>
              <div className={styles.diffBody}>
                {diff.map((linea, index) => (
                  <div
                    key={index}
                    className={`${styles.diffRow} ${styles[`diff${linea.tipo.charAt(0).toUpperCase() + linea.tipo.slice(1)}`]}`}
                  >
                    <span className={styles.diffNum}>
                      {linea.numeroIzq || ''}
                    </span>
                    <span className={styles.diffContent}>
                      {linea.tipo === 'eliminado' && <span className={styles.diffMark}>-</span>}
                      {linea.contenidoIzq || '\u00A0'}
                    </span>
                    <span className={styles.diffNum}>
                      {linea.numeroDer || ''}
                    </span>
                    <span className={styles.diffContent}>
                      {linea.tipo === 'agregado' && <span className={styles.diffMark}>+</span>}
                      {linea.contenidoDer || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Leyenda */}
      {hayTexto && hayDiferencias && (
        <div className={styles.leyenda}>
          <span className={styles.leyendaItem}>
            <span className={styles.leyendaColor} data-tipo="igual"></span>
            Sin cambios
          </span>
          <span className={styles.leyendaItem}>
            <span className={styles.leyendaColor} data-tipo="agregado"></span>
            Línea añadida
          </span>
          <span className={styles.leyendaItem}>
            <span className={styles.leyendaColor} data-tipo="eliminado"></span>
            Línea eliminada
          </span>
        </div>
      )}

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔒</span>
            <div>
              <strong>100% Privado</strong>
              <p>Tu texto nunca sale de tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⚡</span>
            <div>
              <strong>Tiempo real</strong>
              <p>Comparación instantánea mientras escribes</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <strong>Estadísticas</strong>
              <p>Porcentaje de similitud y conteo de cambios</p>
            </div>
          </div>
        </div>
      </section>

      <EducationalSection
        title="Comparación de Textos: Algoritmos y Aplicaciones"
        subtitle="Cómo funcionan las herramientas de diff, similitud textual y detección de cambios"
        icon="🔍"
      >
        <section>
          <h3>📊 Tipos de Comparación Textual y Sus Algoritmos</h3>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Algoritmo base</th>
                  <th>Qué detecta</th>
                  <th>Caso de uso</th>
                  <th>Limitación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Diff de líneas</strong></td>
                  <td>LCS (Longest Common Subsequence)</td>
                  <td>Líneas añadidas, eliminadas o modificadas</td>
                  <td>Control de versiones (Git), revisión de contratos</td>
                  <td>No detecta reordenaciones de párrafos</td>
                </tr>
                <tr>
                  <td><strong>Diff de palabras</strong></td>
                  <td>Variante LCS sobre tokens</td>
                  <td>Palabras concretas cambiadas en cada línea</td>
                  <td>Revisión editorial, cambios sutiles en texto</td>
                  <td>Sensible a puntuación y espaciado</td>
                </tr>
                <tr>
                  <td><strong>Similitud de cadenas</strong></td>
                  <td>Distancia de Levenshtein / Jaro-Winkler</td>
                  <td>Porcentaje de similitud entre textos cortos</td>
                  <td>Deduplicación, corrección ortográfica, fuzzy search</td>
                  <td>Costoso computacionalmente en textos largos</td>
                </tr>
                <tr>
                  <td><strong>Huella digital (hash)</strong></td>
                  <td>Simhash / MinHash</td>
                  <td>Textos casi idénticos en colecciones masivas</td>
                  <td>Detección de plagio a escala web</td>
                  <td>No indica qué parte es igual, solo si son similares</td>
                </tr>
                <tr>
                  <td><strong>Similitud semántica</strong></td>
                  <td>Embeddings (word2vec, BERT)</td>
                  <td>Textos con mismo significado pero palabras distintas</td>
                  <td>Detección de paráfrasis, IA, análisis de contenido</td>
                  <td>Requiere modelos de lenguaje, no funciona offline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 Usos Prácticos de la Comparación de Textos</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>⚖️</span>
              <h4>Revisión Legal y Contractual</h4>
              <p>Abogados y notarios comparan versiones de contratos para identificar exactamente qué cláusulas cambiaron entre borradores. Un cambio aparentemente menor (&quot;podrá&quot; vs &quot;deberá&quot;) puede tener consecuencias legales enormes. El diff de palabras permite ver esos cambios con precisión quirúrgica sin leer dos veces el documento completo.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>✍️</span>
              <h4>Edición y Revisión Académica</h4>
              <p>Editores, correctores y docentes usan comparadores para revisar las correcciones aplicadas entre versiones de un trabajo. En el contexto universitario, también ayuda a detectar si un alumno realmente reescribió una sección o simplemente sustituyó sinónimos. Los trabajos de fin de grado sometidos a dos rondas de revisión se comparan sistemáticamente.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>💻</span>
              <h4>Control de Versiones en Desarrollo</h4>
              <p>Git usa el algoritmo Myers diff (variante de LCS) para mostrar los cambios entre commits. El comando &quot;git diff&quot; es la herramienta de comparación más usada del mundo. Las herramientas de code review (GitHub PR, GitLab MR) presentan estos diffs con coloreado para facilitar la revisión. Entender cómo funciona el diff ayuda a hacer commits más limpios y descriptivos.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>📰</span>
              <h4>Periodismo y Verificación de Hechos</h4>
              <p>Los fact-checkers comparan comunicados oficiales, discursos o páginas web entre versiones para detectar ediciones retroactivas sin aviso. Comparar la caché de Google con la versión actual de una página puede revelar cambios encubiertos en datos, estadísticas o declaraciones. Es una herramienta fundamental del periodismo de datos.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre Comparación de Textos</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cómo funciona el algoritmo LCS que usan los comparadores?</summary>
              <p className={styles.eduFaqRespuesta}>LCS (Longest Common Subsequence) encuentra la secuencia más larga de elementos comunes entre dos textos, en el mismo orden relativo pero no necesariamente consecutivos. Para comparar &quot;ABCDE&quot; y &quot;ACFDE&quot;, el LCS es &quot;ACDE&quot; (longitud 4). Lo que no está en el LCS son las diferencias: &quot;B&quot; fue eliminada, &quot;F&quot; fue añadida. El algoritmo de Myers (1986), usado por Git, es una optimización de LCS que minimiza el número de cambios (ediciones) necesarios para transformar un texto en otro, produciendo diffs más limpios y legibles.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué significa exactamente el porcentaje de similitud?</summary>
              <p className={styles.eduFaqRespuesta}>El porcentaje de similitud mide cuánto de los dos textos es compartido. La fórmula más común es: similitud = (2 × caracteres comunes) / (total caracteres texto A + total caracteres texto B). Un 100% significa textos idénticos; 0% significa ningún carácter en común. En la práctica, un 85-90% puede significar que se cambiaron solo unas pocas palabras. El porcentaje varía según el algoritmo: similitud de caracteres, de palabras o de n-gramas da valores distintos para el mismo par de textos.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Puede detectar plagio esta herramienta?</summary>
              <p className={styles.eduFaqRespuesta}>Esta herramienta detecta similitud textual directa (texto copiado o ligeramente modificado), no plagio semántico (paráfrasis, traducción, resumen). Para detección de plagio académico real, las plataformas profesionales como Turnitin, PlagScan o iThenticate comparan contra bases de datos de millones de documentos académicos y la web completa. Esta herramienta es útil para comparar dos textos concretos que tienes en mano: comprobar si una versión revisada realmente cambió, o si dos documentos propios tienen solapamiento excesivo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué Git a veces muestra cambios extraños en el diff?</summary>
              <p className={styles.eduFaqRespuesta}>El algoritmo Myers minimiza el número de líneas cambiadas, pero no siempre elige el diff más &quot;legible&quot; para humanos. Por eso existen variantes como &quot;git diff --patience&quot; (que prioriza líneas únicas como anclas) o &quot;git diff --histogram&quot; (más preciso para código). Además, los cambios de indentación, espaciado o finales de línea (CRLF vs LF) pueden hacer que una línea aparezca como completamente eliminada y recreada aunque solo cambió un espacio invisible. Por eso se usan flags como --ignore-whitespace o --ignore-all-space en Git.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cómo funciona la detección de plagio a escala de Google?</summary>
              <p className={styles.eduFaqRespuesta}>Google y los sistemas anti-plagio a gran escala usan técnicas como <strong>Simhash</strong> (Google, 2007): convierte un documento en una huella digital de 64 bits que preserva la similitud. Dos documentos con Simhash a distancia Hamming de 3 o menos (difieren en 3 bits de 64) son casi idénticos. <strong>MinHash</strong> hace lo mismo con conjuntos de n-gramas. Estas técnicas permiten comparar millones de documentos en segundos con muy poca memoria, algo imposible con LCS directo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Para qué sirve la distancia de Levenshtein?</summary>
              <p className={styles.eduFaqRespuesta}>La <strong>distancia de Levenshtein</strong> (Vladimir Levenshtein, 1965) mide el mínimo de operaciones elementales (inserción, eliminación, sustitución de un carácter) para transformar una cadena en otra. &quot;gato&quot; → &quot;pato&quot;: distancia 1 (sustituir g→p). Se usa en: correctores ortográficos (¿quisiste decir &quot;algoritmo&quot; en lugar de &quot;algorritmo&quot;?), búsqueda aproximada (fuzzy search), reconocimiento de voz (comparar lo dicho con lo esperado), bioinformática (alinear secuencias de ADN). La variante <strong>Jaro-Winkler</strong> da más peso a los caracteres iniciales, ideal para nombres propios.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué herramientas profesionales existen para comparar textos?</summary>
              <p className={styles.eduFaqRespuesta}>Para texto y documentos: <strong>Beyond Compare</strong> y <strong>WinMerge</strong> (escritorio, gratuito) para archivos. <strong>Kaleidoscope</strong> (macOS). <strong>Diffchecker</strong> y <strong>Text Compare</strong> (web). Para código: <strong>VS Code diff</strong> (integrado), <strong>Meld</strong> (Linux). Para documentos Word: la función &quot;Comparar documentos&quot; de Microsoft Word traza cambios con precisión de párrafo. Para PDFs: <strong>Adobe Acrobat Pro</strong> y <strong>Draftable</strong>. Para páginas web: <strong>Versionista</strong> y <strong>ChangeTower</strong> monitorizan cambios en URLs automáticamente.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cómo afectan los saltos de línea y espacios al resultado?</summary>
              <p className={styles.eduFaqRespuesta}>Los espacios en blanco son el mayor causante de confusión en las comparaciones. Un texto copiado desde PDF suele introducir saltos de línea adicionales, espacios dobles o guiones de división silábica que hacen que textos visualmente idénticos aparezcan muy distintos en el diff. Antes de comparar: normaliza los espacios (elimina dobles espacios), unifica los finales de línea (CRLF → LF en Windows) y elimina líneas vacías extras. Esta herramienta compara el texto tal como lo introduces, por lo que una pequeña limpieza previa mejora mucho la calidad del resultado.</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Guía: Cómo Sacar el Máximo al Comparador</h3>
          <ol className={styles.eduPasosList}>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>1</span>
              <div>
                <strong>Limpia los textos antes de comparar</strong>
                <p>Elimina encabezados de página, números de página, cabeceras automáticas y saltos de línea artificiales (los que introduce un PDF al exportar). Dos textos visualmente iguales pueden mostrar cientos de diferencias falsas por espaciado invisible.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>2</span>
              <div>
                <strong>Compara primero a nivel de párrafo</strong>
                <p>Si los textos son largos, divide la comparación por secciones. Compara párrafo a párrafo para aislar exactamente qué sección cambió. Un diff de un documento de 50 páginas completo puede ser difícil de interpretar; el de un párrafo de 5 líneas es inmediato.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>3</span>
              <div>
                <strong>Interpreta correctamente los colores</strong>
                <p>Rojo / tachado: texto que estaba en el original y fue eliminado. Verde / subrayado: texto nuevo añadido. Amarillo / resaltado: texto modificado (combinación de eliminación + adición). Sin color: texto idéntico en ambas versiones.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>4</span>
              <div>
                <strong>Fíjate en el porcentaje de similitud</strong>
                <p>Un 95%+ indica cambios menores (correcciones puntuales). Un 70-90% indica revisión significativa de párrafos. Un 50-70% indica reescritura parcial. Menos del 50% puede indicar que los textos son fundamentalmente distintos o que uno está reorganizado respecto al otro.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>5</span>
              <div>
                <strong>Para contratos: presta atención a los cambios pequeños</strong>
                <p>En textos legales, los cambios más importantes suelen ser los más pequeños: una negación, un verbo modal (&quot;podrá&quot; vs &quot;deberá&quot;), una fecha, una cifra o una excepción entre paréntesis. El diff de palabras es más útil que el de líneas para este caso.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>6</span>
              <div>
                <strong>Guarda el resultado si necesitas auditoría</strong>
                <p>Si la comparación tiene valor probatorio (litigio, auditoría interna, control de versiones de documentos normativos), haz una captura de pantalla fechada o exporta el resultado. El comparador web no guarda historial; cada sesión es temporal y local.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Consejos para Comparaciones más Efectivas</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📋</span>
              <h4>Pega desde texto plano</h4>
              <p>Al copiar desde Word o PDF, el formato puede introducir caracteres invisibles. Pega primero en un editor de texto plano (Bloc de notas, Notepad++) y luego copia desde ahí para evitar sorpresas en el diff.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔢</span>
              <h4>Los números son sensibles</h4>
              <p>El comparador distingue &quot;1.234,56&quot; de &quot;1234.56&quot; como completamente distintos. Normaliza el formato de números antes de comparar documentos de distintas fuentes o idiomas (español vs inglés).</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔤</span>
              <h4>Mayúsculas y tildes importan</h4>
              <p>La comparación distingue mayúsculas de minúsculas y letras con tilde de las que no la tienen. &quot;Esta&quot; y &quot;está&quot; son distintas. Si esto genera ruido, normaliza el texto a minúsculas antes de comparar (útil para análisis de contenido, no para análisis legal).</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>⚡</span>
              <h4>Textos muy largos: divide y vencerás</h4>
              <p>La complejidad del algoritmo LCS es O(n×m), donde n y m son las longitudes de los textos. Para documentos de miles de líneas, los comparadores web pueden volverse lentos. Divide en bloques de 1.000-2.000 palabras para mantener la fluidez.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔒</span>
              <h4>Los textos no salen del navegador</h4>
              <p>Esta herramienta procesa todo localmente en tu navegador: ningún texto se envía a ningún servidor. Puedes comparar documentos confidenciales con total seguridad. Esto también significa que funciona sin conexión a internet una vez cargada la página.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔄</span>
              <h4>Intercambia los textos para otra perspectiva</h4>
              <p>El diff A→B y el diff B→A no son simétricos en la presentación: cambiar qué texto es &quot;original&quot; y cuál es &quot;revisado&quot; cambia qué aparece como añadido y qué como eliminado. Si los colores te confunden, prueba a intercambiar los textos.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono}>⚠️</span>
            <div>
              <strong>Limitaciones importantes del comparador de textos</strong>
              <ul>
                <li><strong>No detecta reordenaciones:</strong> Si un párrafo se movió del final al principio sin cambiar su contenido, el comparador lo mostrará como &quot;eliminado&quot; en un lugar y &quot;añadido&quot; en otro, aunque el texto sea idéntico. Los algoritmos de diff trabajan con la posición, no con la identidad semántica.</li>
                <li><strong>No es un detector de plagio profesional:</strong> Solo compara los dos textos que introduces. No tiene acceso a bases de datos externas, la web o repositorios académicos. Para detección de plagio real usa Turnitin, Copyleaks o Unicheck.</li>
                <li><strong>Textos en distintos idiomas:</strong> La comparación de textos en idiomas distintos (una traducción vs el original) mostrará prácticamente todo como diferente, aunque el contenido sea equivalente. Esta herramienta no entiende significado, solo formas de texto.</li>
                <li><strong>Sensibilidad al formateo:</strong> Cambios solo de formato (negrita, cursiva, tamaño de fuente) no son visibles aquí porque se trabaja con texto plano. Si necesitas comparar formato además de contenido, usa la función de comparación de Microsoft Word o herramientas como Draftable.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-textos')} />

      <ShareCard appName="comparador-textos" />
      <Footer appName="comparador-textos" />
    </div>
  );
}
