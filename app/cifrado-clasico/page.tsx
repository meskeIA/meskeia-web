'use client';

import { useState } from 'react';
import styles from './CifradoClasico.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'cifrar' | 'descifrar';
type MetodoType = 'cesar' | 'rot13' | 'atbash';

export default function CifradoClasicoPage() {
  const [metodo, setMetodo] = useState<MetodoType>('cesar');
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [desplazamiento, setDesplazamiento] = useState(3);
  const [resultado, setResultado] = useState('');

  // Cifrado César (desplazamiento configurable)
  const cifrarCesar = (texto: string, desp: number, descifrar: boolean = false): string => {
    const shift = descifrar ? (26 - desp) % 26 : desp % 26;

    return texto
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
  const cifrarAtbash = (texto: string): string => {
    return texto
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          return String.fromCharCode(90 - (char.charCodeAt(0) - 65)); // Z - posición
        }
        if (char >= 'a' && char <= 'z') {
          return String.fromCharCode(122 - (char.charCodeAt(0) - 97)); // z - posición
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
        // ROT13 es simétrico: cifrar = descifrar
        res = cifrarCesar(texto, 13, false);
        break;
      case 'atbash':
        // Atbash es simétrico: cifrar = descifrar
        res = cifrarAtbash(texto);
        break;
    }
    setResultado(res);
  };

  const limpiar = () => {
    setTexto('');
    setResultado('');
  };

  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado);
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

      <div className={styles.mainContent}>
        {/* Selector de método */}
        <div className={styles.methodSelector}>
          <button
            className={`${styles.methodBtn} ${metodo === 'cesar' ? styles.active : ''}`}
            onClick={() => setMetodo('cesar')}
          >
            👑 César
          </button>
          <button
            className={`${styles.methodBtn} ${metodo === 'rot13' ? styles.active : ''}`}
            onClick={() => setMetodo('rot13')}
          >
            🔄 ROT13
          </button>
          <button
            className={`${styles.methodBtn} ${metodo === 'atbash' ? styles.active : ''}`}
            onClick={() => setMetodo('atbash')}
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
              📋 Copiar resultado
            </button>
          </div>
        )}
      </div>

      {/* Sección educativa colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre cifrados clásicos?"
        subtitle="Historia, funcionamiento y curiosidades de los métodos de encriptación más antiguos"
      >
        <section className={styles.infoSection}>
          <h2>Historia y Funcionamiento</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>👑 Cifrado César</h3>
              <p>
                Usado por Julio César hace más de 2000 años para comunicarse
                con sus generales. Desplazaba cada letra 3 posiciones. Es el cifrado
                de sustitución más simple y conocido.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔄 ROT13</h3>
              <p>
                Variante del César con desplazamiento 13. Es especial porque
                cifrar y descifrar usan la misma operación (13+13=26). Popular
                en foros de internet para ocultar spoilers.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔀 Cifrado Atbash</h3>
              <p>
                Origen hebreo, usado en textos bíblicos. Invierte el alfabeto:
                la primera letra se convierte en la última y viceversa. También
                es simétrico como ROT13.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚠️ Seguridad</h3>
              <p>
                Estos cifrados son fáciles de romper hoy en día. César solo tiene
                25 claves posibles, y Atbash/ROT13 tienen una sola. Se usan con
                fines educativos, no para seguridad real.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.examplesSection}>
          <h2>Ejemplos Famosos</h2>
          <div className={styles.examplesList}>
            <div className={styles.exampleItem}>
              <span className={styles.exampleOriginal}>VENI VIDI VICI</span>
              <span className={styles.exampleArrow}>→</span>
              <span className={styles.exampleCifrado}>YHQL YLGL YLFL</span>
              <span className={styles.exampleNote}>(César +3)</span>
            </div>
            <div className={styles.exampleItem}>
              <span className={styles.exampleOriginal}>HELLO WORLD</span>
              <span className={styles.exampleArrow}>→</span>
              <span className={styles.exampleCifrado}>URYYB JBEYQ</span>
              <span className={styles.exampleNote}>(ROT13)</span>
            </div>
            <div className={styles.exampleItem}>
              <span className={styles.exampleOriginal}>ABCXYZ</span>
              <span className={styles.exampleArrow}>→</span>
              <span className={styles.exampleCifrado}>ZYXCBA</span>
              <span className={styles.exampleNote}>(Atbash)</span>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-clasico')} />
      <Footer appName="cifrado-clasico" />
    </div>
  );
}
