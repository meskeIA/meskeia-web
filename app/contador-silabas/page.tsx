'use client';

import { useState } from 'react';
import styles from './ContadorSilabas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Algoritmo de silabeo en español
const separarSilabas = (palabra: string): string[] => {
  const vocales = 'aeiouáéíóúü';
  const vocalesFuertes = 'aeoáéó';
  const vocalesDebiles = 'iuíúü';
  const consonantes = 'bcdfghjklmnñpqrstvwxyz';

  palabra = palabra.toLowerCase().trim();
  if (!palabra) return [];

  const silabas: string[] = [];
  let silabaActual = '';

  const esVocal = (c: string) => vocales.includes(c);
  const esConsonante = (c: string) => consonantes.includes(c);
  const esVocalFuerte = (c: string) => vocalesFuertes.includes(c);
  const esVocalDebil = (c: string) => vocalesDebiles.includes(c);

  // Grupos consonánticos inseparables
  const gruposInseparables = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr'];

  for (let i = 0; i < palabra.length; i++) {
    const char = palabra[i];
    const siguiente = palabra[i + 1] || '';
    const siguiente2 = palabra[i + 2] || '';

    silabaActual += char;

    // Si es vocal, verificamos si debemos cortar
    if (esVocal(char)) {
      // Si la siguiente es consonante
      if (esConsonante(siguiente)) {
        // Ver si hay grupo consonántico
        const grupo = siguiente + siguiente2;
        const esGrupoInseparable = gruposInseparables.includes(grupo.toLowerCase());

        // Si hay dos consonantes seguidas
        if (esConsonante(siguiente2)) {
          if (esGrupoInseparable) {
            // El grupo va con la siguiente sílaba
            silabas.push(silabaActual);
            silabaActual = '';
          } else {
            // Primera consonante va con esta sílaba, segunda con la siguiente
            silabaActual += siguiente;
            silabas.push(silabaActual);
            silabaActual = '';
            i++; // Saltamos la consonante que ya añadimos
          }
        } else if (esVocal(siguiente2) || !siguiente2) {
          // Consonante simple entre vocales: va con la siguiente
          silabas.push(silabaActual);
          silabaActual = '';
        }
      }
      // Si la siguiente es vocal
      else if (esVocal(siguiente)) {
        // Verificar diptongos e hiatos
        const esDiptongo =
          (esVocalDebil(char) && esVocalFuerte(siguiente)) ||
          (esVocalFuerte(char) && esVocalDebil(siguiente)) ||
          (esVocalDebil(char) && esVocalDebil(siguiente));

        // Las vocales acentuadas en débiles rompen el diptongo (hiato)
        const tieneAcentoDebil = 'íú'.includes(char) || 'íú'.includes(siguiente);

        if (!esDiptongo || tieneAcentoDebil) {
          // Hiato: cortar aquí
          silabas.push(silabaActual);
          silabaActual = '';
        }
        // Si es diptongo, continúan juntas
      }
    }
  }

  // Añadir última sílaba si queda algo
  if (silabaActual) {
    silabas.push(silabaActual);
  }

  return silabas;
};

const contarSilabasTexto = (texto: string): { palabra: string; silabas: string[]; total: number }[] => {
  // Extraer solo palabras (ignorar números y símbolos)
  const palabras = texto.match(/[a-záéíóúüñ]+/gi) || [];

  return palabras.map(palabra => {
    const silabas = separarSilabas(palabra);
    return {
      palabra,
      silabas,
      total: silabas.length,
    };
  });
};

export default function ContadorSilabasPage() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState<{
    palabras: { palabra: string; silabas: string[]; total: number }[];
    totalSilabas: number;
    totalPalabras: number;
  } | null>(null);

  const analizar = () => {
    if (!texto.trim()) return;

    const palabrasAnalizadas = contarSilabasTexto(texto);
    const totalSilabas = palabrasAnalizadas.reduce((acc, p) => acc + p.total, 0);

    setResultado({
      palabras: palabrasAnalizadas,
      totalSilabas,
      totalPalabras: palabrasAnalizadas.length,
    });
  };

  const limpiar = () => {
    setTexto('');
    setResultado(null);
  };

  const ejemplos = [
    'murciélago',
    'electroencefalografista',
    'comunicación',
    'poesía',
    'aeropuerto',
  ];

  const cargarEjemplo = (ejemplo: string) => {
    setTexto(ejemplo);
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Contador de Sílabas</h1>
        <p className={styles.subtitle}>
          Separa y cuenta las sílabas de cualquier texto en español
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Introduce tu texto</h2>

          <div className={styles.inputGroup}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe una palabra, frase o texto completo..."
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.ejemplos}>
            <span className={styles.ejemplosLabel}>Ejemplos:</span>
            {ejemplos.map((ej) => (
              <button
                key={ej}
                onClick={() => cargarEjemplo(ej)}
                className={styles.ejemploBtn}
              >
                {ej}
              </button>
            ))}
          </div>

          <div className={styles.botones}>
            <button onClick={analizar} className={styles.btnPrimary}>
              Analizar Sílabas
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Resumen */}
              <div className={styles.resumen}>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>{resultado.totalSilabas}</span>
                  <span className={styles.resumenLabel}>Sílabas totales</span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>{resultado.totalPalabras}</span>
                  <span className={styles.resumenLabel}>Palabras</span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>
                    {resultado.totalPalabras > 0
                      ? (resultado.totalSilabas / resultado.totalPalabras).toFixed(1)
                      : '0'}
                  </span>
                  <span className={styles.resumenLabel}>Media por palabra</span>
                </div>
              </div>

              {/* Lista de palabras */}
              <div className={styles.palabrasLista}>
                <h3>Análisis detallado</h3>
                <div className={styles.palabrasGrid}>
                  {resultado.palabras.map((p, index) => (
                    <div key={index} className={styles.palabraCard}>
                      <div className={styles.palabraOriginal}>{p.palabra}</div>
                      <div className={styles.palabraSilabas}>
                        {p.silabas.map((s, i) => (
                          <span key={i} className={styles.silaba}>
                            {s}
                            {i < p.silabas.length - 1 && <span className={styles.separador}>-</span>}
                          </span>
                        ))}
                      </div>
                      <div className={styles.palabraTotal}>
                        {p.total} {p.total === 1 ? 'sílaba' : 'sílabas'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📝</span>
              <p>Introduce un texto para analizar sus sílabas</p>
            </div>
          )}
        </div>
      </div>

      {/* Información sobre reglas */}
      <div className={styles.reglas}>
        <h3>📚 Reglas de División Silábica en Español</h3>
        <div className={styles.reglasGrid}>
          <div className={styles.reglaCard}>
            <h4>Diptongos</h4>
            <p>
              Vocal fuerte (a, e, o) + vocal débil (i, u) = misma sílaba.
              <br />
              <em>Ejemplo: ai-re, cau-sa, pei-ne</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Hiatos</h4>
            <p>
              Dos vocales fuertes = sílabas separadas.
              <br />
              <em>Ejemplo: po-e-ta, a-é-re-o</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Consonantes Dobles</h4>
            <p>
              bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr van juntas.
              <br />
              <em>Ejemplo: a-brir, o-tro</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Consonante entre Vocales</h4>
            <p>
              Una consonante entre vocales va con la siguiente sílaba.
              <br />
              <em>Ejemplo: ca-sa, pe-lo</em>
            </p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Métrica, Fonética y Poesía Española"
        subtitle="Domina las reglas de silabeo, diptongos e hiatos del español"
        icon="📝"
      >
        <section>
          <h3>📊 Fenómenos Fonéticos: Diptongos, Hiatos y Sinalefa</h3>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Fenómeno</th>
                  <th>Definición</th>
                  <th>Regla</th>
                  <th>Ejemplos</th>
                  <th>Efecto en sílabas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Diptongo</strong></td>
                  <td>Dos vocales en la misma sílaba</td>
                  <td>Vocal fuerte (a,e,o) + débil (i,u) sin tilde, o dos débiles</td>
                  <td>ai-re, cau-sa, cui-da</td>
                  <td>Reduce el número de sílabas</td>
                </tr>
                <tr>
                  <td><strong>Triptongo</strong></td>
                  <td>Tres vocales en la misma sílaba</td>
                  <td>Débil + fuerte + débil (i/u + a/e/o + i/u)</td>
                  <td>a-pre-ciáis, buey</td>
                  <td>Reduce aún más las sílabas</td>
                </tr>
                <tr>
                  <td><strong>Hiato</strong></td>
                  <td>Dos vocales en sílabas distintas</td>
                  <td>Dos vocales fuertes, o débil tónica con tilde</td>
                  <td>po-e-ta, pa-ís, Ma-rí-a</td>
                  <td>Aumenta el número de sílabas</td>
                </tr>
                <tr>
                  <td><strong>Sinalefa</strong></td>
                  <td>Fusión de sílabas entre dos palabras</td>
                  <td>Vocal final de palabra + vocal inicial de la siguiente</td>
                  <td>&quot;la ena-mo-ra-da&quot; → &quot;lae-na-mo-ra-da&quot;</td>
                  <td>Reduce sílabas en verso</td>
                </tr>
                <tr>
                  <td><strong>Dialefa</strong></td>
                  <td>No se produce sinalefa (pausa)</td>
                  <td>Pausa por puntuación, énfasis o licencia poética</td>
                  <td>Uso estilístico en poesía</td>
                  <td>Mantiene sílabas separadas</td>
                </tr>
                <tr>
                  <td><strong>Sineresis</strong></td>
                  <td>Diptongo forzado en poesía</td>
                  <td>Hiato tratado como diptongo por licencia poética</td>
                  <td>po-eta → poe-ta (verso)</td>
                  <td>Reduce sílabas para la métrica</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 Usos del Contador de Sílabas</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎭</span>
              <h4>Poesía y Métrica Española</h4>
              <p>La métrica española clasifica los versos por número de sílabas: heptasílabo (7), octosílabo (8), endecasílabo (11), alejandrino (14). El soneto usa endecasílabos. El romance usa octosílabos con rima asonante en los pares. Contar sílabas correctamente es fundamental para escribir o analizar poesía con rigor.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>📚</span>
              <h4>Lengua y Literatura (ESO/Bachillerato)</h4>
              <p>El análisis métrico es obligatorio en los exámenes de Lengua Castellana de ESO y Bachillerato. Incluye identificar el número de sílabas, el tipo de verso (tónico), las licencias poéticas (sinalefa, dialefa, sineresis, dieresis) y la rima (consonante o asonante). Esta herramienta ayuda a verificar cuentas antes de entregar trabajos.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎵</span>
              <h4>Composición de Letras Musicales</h4>
              <p>Las letras de canciones en español siguen patrones silábicos para encajar con la melodía. Una sílaba por nota es lo habitual; las melismas (varias notas por sílaba) son la excepción. Contar sílabas de tus letras te ayuda a saber cuándo una línea es demasiado larga o corta para la frase musical que tienes en mente.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🌍</span>
              <h4>Aprendizaje del Español como LE</h4>
              <p>Para hablantes no nativos, el silabeo es uno de los aspectos más difíciles del español. Idiomas como el inglés no distinguen claramente sílabas en la escritura. Usar esta herramienta ayuda a interiorizar los patrones silábicos del español, mejorando la pronunciación, el acento y la comprensión de la acentuación ortográfica.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre Sílabas y Métrica</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cómo se cuenta una sílaba tónica para la métrica?</summary>
              <p className={styles.eduFaqRespuesta}>En métrica española, la última sílaba tónica del verso determina si se suma o resta una sílaba. Verso <strong>agudo</strong> (última palabra aguda, como &quot;café&quot;): se suma +1. Verso <strong>llano</strong> (última palabra llana, como &quot;casa&quot;): no se modifica. Verso <strong>esdrújulo</strong> (última palabra esdrújula, como &quot;pájaro&quot;): se resta -1. Por eso el verso &quot;En el principio era el amor&quot; tiene 11 sílabas métricas aunque tenga 10 fonéticas (última palabra aguda: &quot;amor&quot;).</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuándo se produce hiato y cuándo diptongo?</summary>
              <p className={styles.eduFaqRespuesta}>La regla básica: las vocales <strong>fuertes</strong> son a, e, o; las <strong>débiles</strong> son i, u. Diptongo: fuerte + débil (sin tilde en la débil), débil + fuerte, o débil + débil. Hiato: fuerte + fuerte, o débil TÓNICA (con tilde) + cualquier vocal. Por eso &quot;país&quot; es hiato (i tónica lleva tilde), pero &quot;paisaje&quot; es diptongo (i átona). La tilde sobre la vocal débil siempre rompe el diptongo.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿La sinalefa es siempre obligatoria en poesía?</summary>
              <p className={styles.eduFaqRespuesta}>No. La sinalefa es la norma general —se produce automáticamente cuando vocal final de palabra se encuentra con vocal inicial de la siguiente— pero el poeta puede romperla (dialefa) cuando lo necesita para la métrica o el ritmo. La dialefa suele marcarse con una coma o punto que introduce una pausa, o simplemente como licencia poética declarada. En el análisis de textos ya escritos, hay que intentar primero la sinalefa y solo si no cuadra la métrica considerar la dialefa.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuáles son los tipos de verso más comunes en español?</summary>
              <p className={styles.eduFaqRespuesta}>Por número de sílabas métricas: <strong>octosílabo (8)</strong> — el más tradicional, base del romance y la copla. <strong>Endecasílabo (11)</strong> — el más &quot;culto&quot;, base del soneto y la silva. <strong>Heptasílabo (7)</strong> — combinado con el endecasílabo en la lira. <strong>Alejandrino (14)</strong> — base del mester de clerecía medieval. <strong>Dodecasílabo (12)</strong> — usado en el modernismo. Los versos de menos de 8 sílabas se llaman &quot;de arte menor&quot;; los de 9 o más, &quot;de arte mayor&quot;.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué son las licencias poéticas de dieresis y sineresis?</summary>
              <p className={styles.eduFaqRespuesta}><strong>Sineresis</strong>: unir en una sola sílaba dos vocales que normalmente formarían hiato. Ejemplo: &quot;poeta&quot; normalmente es po-e-ta (3 sílabas), pero en verso puede tratarse como poe-ta (2 sílabas). <strong>Dieresis</strong>: separar en dos sílabas un diptongo que normalmente sería una. Ejemplo: &quot;suave&quot; normalmente es sua-ve, pero en verso puede leerse su-a-ve. Estas licencias permiten al poeta ajustar la métrica cuando necesita más o menos sílabas.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué las palabras esdrújulas llevan tilde siempre?</summary>
              <p className={styles.eduFaqRespuesta}>Las reglas de acentuación ortográfica se basan directamente en la sílaba tónica. Las palabras <strong>agudas</strong> (tónica en la última sílaba) llevan tilde si terminan en vocal, n o s. Las <strong>llanas</strong> (tónica en la penúltima) llevan tilde si NO terminan en vocal, n o s. Las <strong>esdrújulas</strong> (tónica en la antepenúltima) llevan tilde SIEMPRE. Las <strong>sobresdrújulas</strong> (antes de la antepenúltima) también llevan tilde siempre. Entender bien la sílaba tónica es la clave de toda la ortografía de acentuación española.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué los algoritmos de silabeo automático no son perfectos?</summary>
              <p className={styles.eduFaqRespuesta}>El silabeo español tiene excepciones y ambigüedades que requieren contexto. Los principales problemas: (1) palabras compuestas donde el prefijo termina en consonante del segundo elemento (&quot;sub-rayar&quot; vs &quot;su-bra-yar&quot;); (2) grupos consonánticos que pueden dividirse de formas distintas; (3) vocales en hiato vs diptongo cuando no hay tilde explícita (&quot;guion&quot; — la RAE admite ambas pronunciaciones); (4) nombres propios extranjeros. Ningún algoritmo tiene fiabilidad del 100% para todos los casos del español.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuántas sílabas tiene el español en promedio por palabra?</summary>
              <p className={styles.eduFaqRespuesta}>El español tiene una media de aproximadamente 2,3-2,5 sílabas por palabra en textos continuos. Es una lengua de sílabas abiertas (terminadas en vocal) con predominio: estructura preferida CV (consonante-vocal), como &quot;ca-sa&quot;, &quot;me-sa&quot;. El inglés, en contraste, tiene muchas más sílabas cerradas (CVC, CVCC). Esta diferencia explica por qué el español suena más &quot;musical&quot; y abierto al oído, y por qué los hispanohablantes tienen cierta dificultad con los grupos consonánticos del inglés.</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Cómo Analizar Métricamente un Poema: Guía Paso a Paso</h3>
          <ol className={styles.eduPasosList}>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>1</span>
              <div>
                <strong>Lee el poema en voz alta con naturalidad</strong>
                <p>Antes de contar, lee el poema como lo harías normalmente hablado. El ritmo natural del español te dará pistas sobre dónde van las sinalefas y cuáles son las sílabas tónicas. No intentes contar mientras lees; primero siente el ritmo.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>2</span>
              <div>
                <strong>Silabea cada verso por separado</strong>
                <p>Introduce cada verso en el contador y anota las sílabas. Marca con guiones: &quot;En el prin-ci-pio e-ra el a-mor&quot;. Recuerda que la herramienta cuenta sílabas fonéticas; las métricas pueden diferir por sinalefas entre palabras, que ocurren en el verso completo.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>3</span>
              <div>
                <strong>Aplica las sinalefas manualmente</strong>
                <p>Identifica los puntos de contacto vocal-vocal entre palabras consecutivas: &quot;la_era&quot;, &quot;de_amor&quot;. Cada sinalefa resta una sílaba al cómputo del verso. Marca las sinalefas con un arco o subrayado entre las dos vocales que se fusionan.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>4</span>
              <div>
                <strong>Ajusta por la sílaba final tónica</strong>
                <p>Identifica la última palabra del verso e indica si es aguda (+1), llana (±0) o esdrújula (-1). Suma o resta según corresponda al total de sílabas del verso para obtener las sílabas métricas definitivas.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>5</span>
              <div>
                <strong>Identifica el tipo de verso y la estrofa</strong>
                <p>Con el número de sílabas métricas, identifica el tipo de verso. Si todos tienen el mismo número, es un poema isométrico. Analiza también la rima: marca las vocales tónicas finales de cada verso (rima asonante) o la terminación completa (rima consonante).</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>6</span>
              <div>
                <strong>Reconoce la forma estrófica</strong>
                <p>Combina el número de sílabas y el esquema de rima para identificar la forma: soneto (ABBA ABBA CDC DCD, 14 endecasílabos), romance (octosílabos, rima asonante pares), décima espinela (10 octosílabos, ABBAACCDDC), lira (7-11-7-7-11, aBabB). Cada forma tiene sus propias reglas históricas y estéticas.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Consejos para Dominar el Silabeo Español</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🗣️</span>
              <h4>Pronuncia en voz alta siempre</h4>
              <p>El silabeo español es fonético: sigue cómo se pronuncia, no cómo se escribe. Si no estás seguro de dónde cae la división, pronúncialo lentamente golpeando la mesa con cada sílaba. Tu oído y tu boca saben la respuesta.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔤</span>
              <h4>Recuerda las vocales fuertes y débiles</h4>
              <p>Mnemotécnico: &quot;<strong>A</strong>-<strong>E</strong>-IO-U: las <strong>A</strong>plicadas <strong>E</strong>s los fuertes, IO-U los débiles&quot; (a, e, o = fuertes; i, u = débiles). Este es el dato más importante para resolver diptongos e hiatos.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📌</span>
              <h4>La tilde sobre i/u siempre rompe el diptongo</h4>
              <p>Regla sin excepciones: si la i o la u llevan tilde (&iacute;, ú), siempre forman hiato con la vocal adyacente. &quot;Maíz&quot;: ma-íz (hiato porque í lleva tilde). &quot;Maiz&quot; hipotéticamente sería mai-z (diptongo). La tilde &quot;marca&quot; que esa vocal débil es tónica y por tanto autónoma.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>✍️</span>
              <h4>Para poesía: cuenta sílabas métricas, no fonéticas</h4>
              <p>Esta herramienta cuenta sílabas fonéticas (de una palabra aislada). Para la métrica real de un verso necesitas aplicar además las sinalefas entre palabras y el ajuste por acento final. Úsala para contar sílabas de palabras, luego aplica manualmente los fenómenos del verso completo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🎯</span>
              <h4>Los grupos bl, br, cl, cr, dr, fl, fr... van juntos</h4>
              <p>Estos grupos consonánticos (oclusiva + líquida) nunca se separan en el silabeo: a-brir, o-tros, a-gra-dar, a-fli-gir. En cambio, los grupos ns, bs, nst, etc. sí se separan: cons-tar → con-tar histórico. La regla es: si el grupo puede iniciar una sílaba en español, no se divide.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📖</span>
              <h4>Practica con poemas que ya conoces</h4>
              <p>Toma un poema conocido (Lorca, Machado, Neruda, Gustavo Adolfo Bécquer) cuya métrica sea conocida y verifica que tus cuentas coinciden. El Soneto XXIII de Garcilaso (&quot;En tanto que de rosa y azucena&quot;) tiene 11 sílabas por verso: es un banco de pruebas inmejorable.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono}>⚠️</span>
            <div>
              <strong>Limitaciones del algoritmo de silabeo automático</strong>
              <ul>
                <li><strong>Sinalefas entre palabras no se calculan:</strong> Esta herramienta silabea cada palabra de forma aislada. Las sinalefas (fusión vocal final + vocal inicial de la siguiente palabra) ocurren en el verso completo y deben aplicarse manualmente para obtener sílabas métricas correctas.</li>
                <li><strong>Palabras compuestas y prefijadas:</strong> En palabras como &quot;subrayar&quot;, &quot;deshacer&quot; o &quot;transatlántico&quot;, el silabeo puede variar según se considere la morfología o solo la fonética. La RAE y las distintas tradiciones gramaticales no siempre coinciden.</li>
                <li><strong>Nombres propios y extranjerismos:</strong> El algoritmo puede fallar con nombres como &quot;Shakespeare&quot;, &quot;Nietzsche&quot; o topónimos poco frecuentes cuya pronunciación en español no sigue las reglas estándar.</li>
                <li><strong>No es árbitro de exámenes:</strong> Para dudas concretas en contexto académico, consulta la Nueva Gramática de la Lengua Española (RAE/ASALE, 2009) o el Diccionario panhispánico de dudas, que son las referencias normativas oficiales.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('contador-silabas')} />

      <ShareCard appName="contador-silabas" />
      <Footer appName="contador-silabas" />
    </div>
  );
}
