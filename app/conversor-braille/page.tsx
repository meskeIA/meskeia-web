'use client';

import { useState } from 'react';
import styles from './ConversorBraille.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Alfabeto Braille español (Unicode)
const textToBraille: { [key: string]: string } = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
  'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'ñ': '⠻',
  'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎',
  't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
  'y': '⠽', 'z': '⠵',
  // Vocales acentuadas español
  'á': '⠷', 'é': '⠮', 'í': '⠌', 'ó': '⠬', 'ú': '⠾',
  'ü': '⠳',
  // Números (precedidos por indicador numérico ⠼)
  '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙',
  '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊',
  // Puntuación
  ' ': '⠀', '.': '⠲', ',': '⠂', ';': '⠆', ':': '⠒',
  '?': '⠦', '!': '⠖', '"': '⠶', "'": '⠄', '-': '⠤',
  '(': '⠣', ')': '⠜', '/': '⠌', '@': '⠈⠁',
};

// Invertir para Braille a texto
const brailleToText: { [key: string]: string } = {};
Object.entries(textToBraille).forEach(([text, braille]) => {
  if (!brailleToText[braille] || text.length === 1) {
    brailleToText[braille] = text;
  }
});

// Patrón de puntos para visualización
const brailleDots: { [key: string]: number[] } = {
  '⠁': [1], '⠃': [1,2], '⠉': [1,4], '⠙': [1,4,5], '⠑': [1,5],
  '⠋': [1,2,4], '⠛': [1,2,4,5], '⠓': [1,2,5], '⠊': [2,4], '⠚': [2,4,5],
  '⠅': [1,3], '⠇': [1,2,3], '⠍': [1,3,4], '⠝': [1,3,4,5], '⠻': [1,2,4,5,6],
  '⠕': [1,3,5], '⠏': [1,2,3,4], '⠟': [1,2,3,4,5], '⠗': [1,2,3,5], '⠎': [2,3,4],
  '⠞': [2,3,4,5], '⠥': [1,3,6], '⠧': [1,2,3,6], '⠺': [2,4,5,6], '⠭': [1,3,4,6],
  '⠽': [1,3,4,5,6], '⠵': [1,3,5,6],
  '⠷': [1,2,3,5,6], '⠮': [2,3,4,6], '⠌': [3,4], '⠬': [3,4,6], '⠾': [1,2,3,5,6],
  '⠳': [1,2,5,6],
  '⠀': [], '⠲': [2,5,6], '⠂': [2], '⠆': [2,3], '⠒': [2,5],
  '⠦': [2,3,6], '⠖': [2,3,5], '⠶': [2,3,5,6], '⠄': [3], '⠤': [3,6],
  '⠣': [1,2,6], '⠜': [3,4,5], '⠼': [3,4,5,6], '⠈': [4],
};

const NUMBER_INDICATOR = '⠼';
const CAPITAL_INDICATOR = '⠨';

export default function ConversorBraillePage() {
  const [mode, setMode] = useState<'textToBraille' | 'brailleToText'>('textToBraille');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [showVisual, setShowVisual] = useState(true);

  const convertTextToBraille = (text: string): string => {
    let result = '';
    let inNumber = false;
    const lowerText = text.toLowerCase();

    for (let i = 0; i < lowerText.length; i++) {
      const char = lowerText[i];
      const originalChar = text[i];

      // Detectar números
      if (/[0-9]/.test(char)) {
        if (!inNumber) {
          result += NUMBER_INDICATOR;
          inNumber = true;
        }
        result += textToBraille[char] || char;
      } else {
        inNumber = false;

        // Detectar mayúsculas
        if (originalChar !== char && /[A-ZÁÉÍÓÚÜÑ]/.test(originalChar)) {
          result += CAPITAL_INDICATOR;
        }

        result += textToBraille[char] || char;
      }
    }

    return result;
  };

  const convertBrailleToText = (braille: string): string => {
    let result = '';
    let nextIsCapital = false;
    let inNumber = false;

    for (const char of braille) {
      if (char === CAPITAL_INDICATOR) {
        nextIsCapital = true;
        continue;
      }

      if (char === NUMBER_INDICATOR) {
        inNumber = true;
        continue;
      }

      if (char === '⠀') { // Espacio Braille
        inNumber = false;
        result += ' ';
        continue;
      }

      let converted = brailleToText[char] || char;

      if (inNumber && /[a-j]/.test(converted)) {
        // Convertir letras a números cuando está activo el indicador
        const numMap: { [key: string]: string } = {
          'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5',
          'f': '6', 'g': '7', 'h': '8', 'i': '9', 'j': '0'
        };
        converted = numMap[converted] || converted;
      }

      if (nextIsCapital) {
        converted = converted.toUpperCase();
        nextIsCapital = false;
      }

      result += converted;
    }

    return result;
  };

  const handleConvert = () => {
    if (mode === 'textToBraille') {
      setResult(convertTextToBraille(input));
    } else {
      setResult(convertBrailleToText(input));
    }
  };

  const handleSwap = () => {
    setMode(mode === 'textToBraille' ? 'brailleToText' : 'textToBraille');
    setInput(result);
    setResult('');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const renderBrailleCell = (char: string) => {
    const dots = brailleDots[char] || [];
    return (
      <div className={styles.brailleCell}>
        <div className={styles.brailleGrid}>
          {[1, 4, 2, 5, 3, 6].map((dot) => (
            <div
              key={dot}
              className={`${styles.brailleDot} ${dots.includes(dot) ? styles.filled : ''}`}
            />
          ))}
        </div>
        <span className={styles.brailleChar}>{char}</span>
      </div>
    );
  };

  // Alfabeto para referencia
  const alphabet = [
    { letter: 'A', braille: '⠁' }, { letter: 'B', braille: '⠃' },
    { letter: 'C', braille: '⠉' }, { letter: 'D', braille: '⠙' },
    { letter: 'E', braille: '⠑' }, { letter: 'F', braille: '⠋' },
    { letter: 'G', braille: '⠛' }, { letter: 'H', braille: '⠓' },
    { letter: 'I', braille: '⠊' }, { letter: 'J', braille: '⠚' },
    { letter: 'K', braille: '⠅' }, { letter: 'L', braille: '⠇' },
    { letter: 'M', braille: '⠍' }, { letter: 'N', braille: '⠝' },
    { letter: 'Ñ', braille: '⠻' }, { letter: 'O', braille: '⠕' },
    { letter: 'P', braille: '⠏' }, { letter: 'Q', braille: '⠟' },
    { letter: 'R', braille: '⠗' }, { letter: 'S', braille: '⠎' },
    { letter: 'T', braille: '⠞' }, { letter: 'U', braille: '⠥' },
    { letter: 'V', braille: '⠧' }, { letter: 'W', braille: '⠺' },
    { letter: 'X', braille: '⠭' }, { letter: 'Y', braille: '⠽' },
    { letter: 'Z', braille: '⠵' },
  ];

  const accents = [
    { letter: 'Á', braille: '⠷' }, { letter: 'É', braille: '⠮' },
    { letter: 'Í', braille: '⠌' }, { letter: 'Ó', braille: '⠬' },
    { letter: 'Ú', braille: '⠾' }, { letter: 'Ü', braille: '⠳' },
  ];

  const numbers = [
    { num: '1', braille: '⠼⠁' }, { num: '2', braille: '⠼⠃' },
    { num: '3', braille: '⠼⠉' }, { num: '4', braille: '⠼⠙' },
    { num: '5', braille: '⠼⠑' }, { num: '6', braille: '⠼⠋' },
    { num: '7', braille: '⠼⠛' }, { num: '8', braille: '⠼⠓' },
    { num: '9', braille: '⠼⠊' }, { num: '0', braille: '⠼⠚' },
  ];

  const examples = [
    { text: 'Hola', label: 'Saludo' },
    { text: 'España', label: 'Con ñ' },
    { text: 'Música', label: 'Con acento' },
    { text: '2024', label: 'Números' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Código Braille</h1>
        <p className={styles.subtitle}>
          Convierte texto a Braille español y viceversa con visualización interactiva
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${mode === 'textToBraille' ? styles.active : ''}`}
            onClick={() => setMode('textToBraille')}
          >
            Texto → Braille
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'brailleToText' ? styles.active : ''}`}
            onClick={() => setMode('brailleToText')}
          >
            Braille → Texto
          </button>
        </div>

        <div className={styles.inputSection}>
          <label className={styles.label}>
            {mode === 'textToBraille' ? 'Texto a convertir:' : 'Braille a convertir:'}
          </label>
          <textarea
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'textToBraille'
              ? 'Escribe el texto aquí...'
              : 'Pega el código Braille aquí (⠁⠃⠉...)'}
            rows={4}
          />
          <div className={styles.examples}>
            <span className={styles.exampleLabel}>Ejemplos:</span>
            {examples.map((ex) => (
              <button
                key={ex.text}
                className={styles.exampleBtn}
                onClick={() => setInput(ex.text)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button onClick={handleConvert} className={styles.btnPrimary}>
            Convertir
          </button>
          <button onClick={handleSwap} className={styles.btnSwap} title="Intercambiar">
            ⇄
          </button>
          <button onClick={handleClear} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {result && (
          <div className={styles.resultSection}>
            <label className={styles.label}>Resultado:</label>
            <div className={styles.resultBox}>
              {result}
            </div>

            {mode === 'textToBraille' && showVisual && (
              <div className={styles.visualSection}>
                <div className={styles.visualHeader}>
                  <span>Vista con celdas Braille:</span>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => setShowVisual(!showVisual)}
                  >
                    {showVisual ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className={styles.visualGrid}>
                  {result.split('').map((char, i) => (
                    <div key={i}>
                      {renderBrailleCell(char)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleCopy} className={styles.btnCopy}>
              Copiar resultado
            </button>
          </div>
        )}
      </div>

      <div className={styles.alphabetSection}>
        <h2>Alfabeto Braille Español</h2>

        <h3 className={styles.sectionSubtitle}>Letras</h3>
        <div className={styles.alphabetGrid}>
          {alphabet.map(({ letter, braille }) => (
            <div key={letter} className={styles.alphabetItem}>
              <span className={styles.alphabetLetter}>{letter}</span>
              <span className={styles.alphabetBraille}>{braille}</span>
              <div className={styles.miniCell}>
                {renderBrailleCell(braille)}
              </div>
            </div>
          ))}
        </div>

        <h3 className={styles.sectionSubtitle}>Vocales Acentuadas</h3>
        <div className={styles.alphabetGrid}>
          {accents.map(({ letter, braille }) => (
            <div key={letter} className={styles.alphabetItem}>
              <span className={styles.alphabetLetter}>{letter}</span>
              <span className={styles.alphabetBraille}>{braille}</span>
            </div>
          ))}
        </div>

        <h3 className={styles.sectionSubtitle}>Números (con indicador ⠼)</h3>
        <div className={styles.alphabetGrid}>
          {numbers.map(({ num, braille }) => (
            <div key={num} className={styles.alphabetItem}>
              <span className={styles.alphabetLetter}>{num}</span>
              <span className={styles.alphabetBraille}>{braille}</span>
            </div>
          ))}
        </div>
      </div>

      <EducationalSection title="Aprende sobre el Sistema Braille" subtitle="Historia, tecnología y uso real del sistema de lectoescritura táctil" defaultOpen={false}>
        <section>
          {/* CONTENIDO EXISTENTE: los 3 infoCard */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>Historia</h3>
              <p>Louis Braille inventó este sistema en 1824, siendo él mismo ciego. Se basa en celdas de 6 puntos que permiten 64 combinaciones.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Braille Español</h3>
              <p>El español añade caracteres especiales: la Ñ (⠻) y las vocales acentuadas (á, é, í, ó, ú) tienen símbolos propios.</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Indicadores</h3>
              <p>Los números usan el indicador ⠼ antes. Las mayúsculas usan ⠨. Esto permite reutilizar los mismos símbolos de las letras.</p>
            </div>
          </div>

          {/* SECCIÓN 1: Tabla Comparativa */}
          <div className={styles.eduComparativaSection}>
            <h3>📊 Comparativa: Grados y Tipos de Braille</h3>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Velocidad</th>
                    <th>Uso principal</th>
                    <th>Estándar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Braille Grado 1</strong></td>
                    <td>Letra por letra, sin contracciones</td>
                    <td>Lenta</td>
                    <td>Aprendizaje, principiantes</td>
                    <td>UEB / Nacional</td>
                  </tr>
                  <tr>
                    <td><strong>Braille Grado 2</strong></td>
                    <td>Con contracciones de palabras comunes</td>
                    <td>25-40% más rápida</td>
                    <td>Lectura diaria, libros</td>
                    <td>UEB / Nacional</td>
                  </tr>
                  <tr>
                    <td>Braille Matemático (Nemeth)</td>
                    <td>Notación matemática y científica</td>
                    <td>Especializada</td>
                    <td>Ciencias, matemáticas</td>
                    <td>Nemeth (EE.UU.)</td>
                  </tr>
                  <tr>
                    <td>Braille Musical</td>
                    <td>Notación para partituras musicales</td>
                    <td>Especializada</td>
                    <td>Música, conservatorio</td>
                    <td>Internacional MBC</td>
                  </tr>
                  <tr>
                    <td>Braille Informático</td>
                    <td>Caracteres ASCII y programación</td>
                    <td>Especializada</td>
                    <td>Código, terminal</td>
                    <td>NABCC / EE.UU.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: Casos de Uso */}
          <div className={styles.eduEscenariosSection}>
            <h3>🎯 El Braille en la Vida Real</h3>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>🎓</div>
                <h4>Educación Inclusiva</h4>
                <p>En España, la ONCE garantiza materiales educativos en Braille para estudiantes con discapacidad visual. Libros de texto, exámenes y apuntes se transcriben mediante embosadoras. El Braille es una herramienta de alfabetización plena, no una alternativa de segunda categoría.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>🏙️</div>
                <h4>Señalización y Entorno</h4>
                <p>El Braille aparece en la vida cotidiana: carteles de ascensores (planta, nombre), envases de medicamentos (nombre y dosis en UE es obligatorio por la Directiva 2004/27/CE), monedas de euro (el 2€ tiene el valor en Braille desde 2022) y tarjetas de visita.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>💻</div>
                <h4>Tecnología Asistiva</h4>
                <p>Las líneas Braille (refreshable Braille displays) son periféricos que traducen texto digital a Braille en tiempo real mediante celdas piezoeléctricas. Tienen 40-80 celdas y se conectan al ordenador o smartphone. Los lectores de pantalla (NVDA, JAWS, VoiceOver) las controlan para permitir el acceso completo al escritorio.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon}>📚</div>
                <h4>Cultura y Literatura</h4>
                <p>La Biblioteca de la ONCE gestiona la mayor colección de libros en Braille en español del mundo, con más de 50.000 títulos. Un libro de 300 páginas en tinta puede ocupar 3-5 volúmenes en Braille. Los libros en relieve se fabrican en papel especial de 150 g/m² para que los puntos mantengan el relieve durante años de uso.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre el Braille</h3>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>¿Cuántas personas en el mundo usan Braille?</h4>
                <p>La OMS estima que 285 millones de personas tienen discapacidad visual en el mundo, de las cuales 39 millones son ciegas. Sin embargo, el porcentaje que utiliza Braille ha disminuido con la proliferación de lectores de pantalla de voz: en EE.UU. se estima que solo el 10% de las personas ciegas son lectoras activas de Braille. En España, la ONCE atiende a unos 70.000 afiliados con discapacidad visual severa. Los expertos señalan que quienes aprenden Braille tienen mayor tasa de empleo y autonomía que quienes solo usan tecnología de voz.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué Louis Braille inventó el sistema con solo 15 años?</h4>
                <p>Louis Braille (1809-1852) perdió la vista a los 3 años por un accidente en el taller de su padre. Ingresó en el Institut National des Jeunes Aveugles de París, donde los libros se hacían con letras en relieve de gran tamaño (sistema Haüy), lentos e ineficientes. A los 12 años conoció el &quot;sonography&quot; del capitán Charles Barbier, un sistema militar de puntos en relieve para leer en la oscuridad. Braille adaptó ese sistema a solo 6 puntos (2×3) y a los 15 años tenía el primer borrador de su sistema, publicado oficialmente en 1829 y perfeccionado en 1837.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Es el Braille igual en todos los idiomas?</h4>
                <p>No exactamente. El sistema de 6 puntos es universal, pero cada idioma adapta los símbolos a sus necesidades. El español tiene símbolos únicos para ñ, á, é, í, ó, ú, ü y ¡¿. El árabe Braille va de derecha a izquierda igual que el árabe impreso. El japonés tiene un Braille basado en silabas (kana) en lugar de letras. El chino Braille tiene variantes por dialectos (mandarín, cantonés). El UEB (Unified English Braille) de 2004 unificó los distintos sistemas del inglés en un estándar global.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué es el Braille Unificado en Español (UEB)?</h4>
                <p>El UEB (Unified English Braille, adaptado al español como UEB-Es) es un estándar internacional que busca unificar las variantes nacionales del Braille. En España, la ONCE utiliza el &quot;Braille español&quot; que ha evolucionado de forma independiente. La transición hacia estándares más unificados facilita el intercambio de materiales entre países hispanohablantes. El Código Braille Español vigente fue aprobado por la ONCE en 2009 e incluye símbolos específicos para el castellano, catalán, gallego, euskera y valenciano.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Se puede escribir Braille con el ordenador o smartphone?</h4>
                <p>Sí, de varias formas. Las líneas Braille (displays de Braille) son periféricos USB/Bluetooth que muestran el texto del ordenador en celdas de Braille refrescables. También existen impresoras Braille (embosadoras) que producen papel en relieve. En smartphones, iOS y Android tienen soporte nativo para líneas Braille. Además, iOS permite escribir Braille directamente en la pantalla táctil activando la opción en VoiceOver, sin hardware adicional.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Cuánto tiempo tarda en aprenderse el Braille?</h4>
                <p>Una persona vidente aprende a reconocer visualmente el alfabeto Braille en pocas horas. Leer Braille táctilmente (con los dedos) requiere mucho más: típicamente 6-12 meses de práctica diaria para alcanzar una velocidad funcional (80-100 palabras por minuto). Un lector experto llega a 200 WPM táctilmente, comparable a la lectura visual normal. Los niños ciegos de nacimiento aprenden más rápido que los adultos que pierden la vista tardíamente, ya que sus yemas de los dedos son más sensibles y su cerebro más plástico.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué diferencia hay entre Braille Grado 1 y Grado 2?</h4>
                <p>El Grado 1 es literal: cada letra se escribe con su celda correspondiente, sin abreviaciones. El Grado 2 incluye contracciones: combinaciones de celdas que representan palabras completas o sílabas frecuentes (en inglés, &quot;the&quot; tiene una sola celda; en español, palabras como &quot;que&quot;, &quot;con&quot;, &quot;para&quot; tienen abreviaturas). El Grado 2 ocupa un 25-30% menos espacio y permite leer más rápido. Este conversor implementa Grado 1 únicamente. Para Grado 2 en español se necesitan tablas de contracciones del Código Braille Español de la ONCE.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué los números Braille usan las mismas celdas que las letras A-J?</h4>
                <p>Con solo 64 combinaciones posibles en 6 puntos, el Braille debe reutilizar símbolos con indicadores de contexto. Los números del 1 al 9 usan los mismos patrones que las letras a-i, y el 0 usa el patrón de la j. El indicador numérico (⠼, puntos 3-4-5-6) activa el &quot;modo número&quot; y le indica al lector que los símbolos siguientes son dígitos, no letras. Este sistema fue diseñado por Braille para maximizar las combinaciones disponibles en una celda de solo 6 puntos.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <div className={styles.eduStepSection}>
            <h3>📚 Cómo Funciona el Sistema Braille: La Lógica Interna</h3>
            <div className={styles.eduStepList}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>La celda básica: 6 puntos, 64 combinaciones</h4>
                  <p>Una celda Braille tiene 2 columnas y 3 filas. Los puntos se numeran: columna izquierda 1-2-3 (de arriba a abajo), columna derecha 4-5-6 (de arriba a abajo). Con 6 posiciones binarias (punto presente o ausente), hay 2⁶ = 64 combinaciones posibles. La celda vacía (sin puntos) es el espacio entre palabras. Esto le da al sistema Braille la misma capacidad de representación que el ASCII de 6 bits.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>La primera década: letras A-J</h4>
                  <p>Las letras a-j usan solo los 4 puntos superiores (1, 2, 4, 5). La &quot;a&quot; es solo el punto 1. La &quot;b&quot; añade el punto 2. La &quot;c&quot; añade el 4. Cada letra añade o quita puntos de la zona superior. Esta primera década es la base de todo el sistema: los demás grupos se derivan añadiendo sistemáticamente los puntos 3 y/o 6 de la zona inferior.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>Segunda y tercera décadas: K-T y U-Z</h4>
                  <p>Las letras k-t son exactamente iguales a a-j pero con el punto 3 añadido. La &quot;k&quot; = &quot;a&quot; + punto 3. La &quot;l&quot; = &quot;b&quot; + punto 3. Las letras u-z añaden el punto 6 a las de k-t (con excepción de la &quot;w&quot;, que es especial porque el francés, idioma de Braille, no tiene &quot;w&quot;). Esta estructura sistemática facilita memorizar el alfabeto completo aprendiendo solo la primera década.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Los indicadores de contexto</h4>
                  <p>El indicador numérico (⠼, puntos 3-4-5-6) activa el modo número: los siguientes símbolos se leen como dígitos en lugar de letras. El indicador de mayúscula (⠨, punto 6) convierte la siguiente celda en mayúscula. El indicador de cursiva señala texto enfatizado. Estos prefijos permiten que el sistema de 64 símbolos represente letras, números, mayúsculas y formatos tipográficos sin ambigüedad.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>La lectura táctil: yemas e índices</h4>
                  <p>El Braille en papel se lee con las yemas de los dedos índice (a veces también el medio). La mano derecha lee el final de la línea mientras la izquierda ya busca el inicio de la siguiente (técnica de &quot;tracking&quot;). La sensibilidad táctil necesaria equivale a detectar relieves de solo 0,5 mm de altura. Los lectores expertos mueven los dedos de izquierda a derecha a la misma velocidad que un lector visual mueve los ojos. La lectura Braille en pantalla (este conversor) es visual y educativa, no táctil.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Del texto digital al Braille físico</h4>
                  <p>Para producir Braille físico se necesita una embosadora (impresora Braille). Las embosadoras de sobremesa (Index, Braillo) cuestan 3.000-8.000 €. El papel especial (150 g/m²) mantiene los relieves durante años. El software de traducción (Braille2000, Duxbury DBT) convierte texto digital a Braille automáticamente, incluyendo Grado 2, tablas matemáticas y partituras. En España, la ONCE tiene un servicio gratuito de trascripción para material educativo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.eduTipsSection}>
            <h3>✅ Claves para Entender y Usar el Braille</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔢</span>
                <h4>Aprende la primera década y el resto fluye</h4>
                <p>Las letras a-j son la clave de todo el sistema. Memorizar esas 10 celdas + la regla de &quot;añadir punto 3 para la segunda década&quot; te da el 90% del alfabeto casi gratis.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📐</span>
                <h4>La orientación de la celda es fija</h4>
                <p>Puntos 1-2-3 siempre en la columna izquierda de arriba a abajo, 4-5-6 en la derecha. Una celda girada 180° es un símbolo completamente diferente. La orientación del papel/línea es crítica para la lectura correcta.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>💡</span>
                <h4>Los caracteres Unicode no son táctiles</h4>
                <p>Los caracteres ⠁⠃⠉ en pantalla son representaciones visuales del Braille. Son útiles para aprendizaje y referencia, pero no activan ninguna celda táctil. Para Braille físico real se necesita hardware específico (embosadora o línea Braille).</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🏛️</span>
                <h4>La ONCE: referencia en España</h4>
                <p>La Organización Nacional de Ciegos Españoles (ONCE) es el organismo de referencia en España para todo lo relacionado con el Braille: transcripción, libros, formación y tecnología asistiva. Sus servicios de transcripción son gratuitos para material educativo.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📱</span>
                <h4>Braille en smartphones sin hardware</h4>
                <p>iOS (VoiceOver) y Android (TalkBack) permiten escribir Braille directamente en la pantalla táctil usando 6 dedos simultáneos como si fueran los 6 puntos de una celda. Esta función, llamada &quot;Braille Screen Input&quot;, no requiere ningún accesorio adicional.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🌍</span>
                <h4>El Braille sobrevive a la tecnología de voz</h4>
                <p>Los estudios muestran que las personas ciegas alfabetizadas en Braille tienen un 44% más de probabilidad de estar empleadas que las que usan solo tecnología de voz. El Braille proporciona acceso a la ortografía, puntuación y formato textual que el audio no transmite.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Limitaciones y Errores Comunes al Usar Braille Digital</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Este conversor es visual/educativo, no táctil:</strong> Los caracteres Braille Unicode en pantalla sirven para aprender y entender el sistema, pero no son equivalentes al Braille real en papel. Para producir Braille físico funcional (que una persona ciega pueda leer con los dedos) se necesita una embosadora Braille, no copiar y pegar caracteres Unicode.</li>
              <li><strong>❌ Solo implementa Grado 1 (sin contracciones):</strong> El uso diario real del Braille utiliza el Grado 2, que incluye contracciones para palabras y sílabas frecuentes. La transcripción literal letra a letra del Grado 1 ocupa un 25-30% más de espacio. Para materiales de lectura real, un software de transcripción profesional (Duxbury DBT, Braille2000) con tablas de Grado 2 es imprescindible.</li>
              <li><strong>❌ Las reglas de puntuación Braille varían por país y normativa:</strong> El Código Braille Español (ONCE, 2009) puede diferir en detalles del sistema usado en México, Argentina u otros países hispanohablantes. La puntuación, indicadores y algunos caracteres especiales no son completamente universales entre las normas nacionales.</li>
              <li><strong>❌ Confundir &quot;leer Braille&quot; con &quot;reconocer caracteres Unicode&quot;:</strong> La habilidad real de leer Braille es táctil y requiere meses de entrenamiento. Reconocer visualmente que ⠁ es &quot;a&quot; es útil para diseñadores y educadores, pero no es leer Braille en el sentido funcional. Son circuitos cerebrales completamente distintos.</li>
              <li><strong>❌ Los números Braille necesitan el indicador ⠼:</strong> Si introduces números sin el indicador numérico, un lector Braille los interpretará como letras (1→a, 2→b, etc.). Este conversor añade automáticamente ⠼ antes de secuencias numéricas, pero al copiar Braille generado hay que asegurarse de no perder el indicador.</li>
              <li><strong>❌ No todos los caracteres especiales tienen equivalente en Braille Español:</strong> Emojis, símbolos matemáticos complejos, caracteres de otros alfabetos (cirílico, árabe, chino) no tienen representación en el Braille español estándar. Para esos contenidos existen sistemas Braille especializados (matemático, musical, informático) con sus propias tablas de conversión.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-braille')} />

      <ShareCard appName="conversor-braille" />
      <Footer appName="conversor-braille" />
    </div>
  );
}
