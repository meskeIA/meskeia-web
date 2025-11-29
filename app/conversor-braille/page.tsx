'use client';

import { useState } from 'react';
import styles from './ConversorBraille.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

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

      <div className={styles.infoSection}>
        <h2>Sobre el Sistema Braille</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>Historia</h3>
            <p>
              Louis Braille inventó este sistema en 1824, siendo él mismo ciego.
              Se basa en celdas de 6 puntos que permiten 64 combinaciones.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>Braille Español</h3>
            <p>
              El español añade caracteres especiales: la Ñ (⠻) y las vocales
              acentuadas (á, é, í, ó, ú) tienen símbolos propios.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>Indicadores</h3>
            <p>
              Los números usan el indicador ⠼ antes. Las mayúsculas usan ⠨.
              Esto permite reutilizar los mismos símbolos de las letras.
            </p>
          </div>
        </div>
      </div>

      <Footer appName="conversor-braille" />
    </div>
  );
}
