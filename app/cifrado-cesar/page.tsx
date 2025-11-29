'use client';

import { useState } from 'react';
import styles from './CifradoCesar.module.css';
import { MeskeiaLogo, Footer } from '@/components';

type ModoType = 'cifrar' | 'descifrar';

export default function CifradoCesarPage() {
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [desplazamiento, setDesplazamiento] = useState(3);
  const [resultado, setResultado] = useState('');

  const cifrarCesar = (texto: string, desp: number, descifrar: boolean = false): string => {
    const shift = descifrar ? (26 - desp) % 26 : desp % 26;

    return texto
      .split('')
      .map(char => {
        // Mayúsculas
        if (char >= 'A' && char <= 'Z') {
          return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
        }
        // Minúsculas
        if (char >= 'a' && char <= 'z') {
          return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
        }
        // Otros caracteres sin cambio
        return char;
      })
      .join('');
  };

  const procesar = () => {
    if (!texto.trim()) return;
    const res = cifrarCesar(texto, desplazamiento, modo === 'descifrar');
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

  const aplicarPreset = (valor: number) => {
    setDesplazamiento(valor);
  };

  // Generar alfabeto visual
  const alfabetoOriginal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const alfabetoCifrado = alfabetoOriginal.map((_, i) =>
    String.fromCharCode(((i + desplazamiento) % 26) + 65)
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cifrado César</h1>
        <p className={styles.subtitle}>
          El método de encriptación clásico usado por Julio César
        </p>
      </header>

      <div className={styles.mainContent}>
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

        <div className={styles.shiftSection}>
          <label className={styles.label}>Desplazamiento: {desplazamiento}</label>
          <input
            type="range"
            min="1"
            max="25"
            value={desplazamiento}
            onChange={(e) => setDesplazamiento(parseInt(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.presets}>
            <span className={styles.presetLabel}>Presets:</span>
            <button onClick={() => aplicarPreset(3)} className={styles.presetBtn}>César (3)</button>
            <button onClick={() => aplicarPreset(13)} className={styles.presetBtn}>ROT13</button>
            <button onClick={() => aplicarPreset(1)} className={styles.presetBtn}>+1</button>
            <button onClick={() => aplicarPreset(7)} className={styles.presetBtn}>+7</button>
          </div>
        </div>

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

        <div className={styles.inputSection}>
          <label className={styles.label}>
            {modo === 'cifrar' ? 'Mensaje a cifrar' : 'Mensaje a descifrar'}
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

        <div className={styles.buttonRow}>
          <button onClick={procesar} className={styles.btnPrimary} disabled={!texto.trim()}>
            {modo === 'cifrar' ? '🔒 Cifrar mensaje' : '🔓 Descifrar mensaje'}
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

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

      <section className={styles.infoSection}>
        <h2>¿Qué es el Cifrado César?</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>📜 Historia</h3>
            <p>
              Usado por Julio César hace más de 2000 años para comunicarse
              con sus generales. Desplazaba cada letra 3 posiciones en el alfabeto.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>🔄 Cómo funciona</h3>
            <p>
              Cada letra se sustituye por otra que está un número fijo de
              posiciones más adelante en el alfabeto. A→D, B→E, C→F...
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>🔢 ROT13</h3>
            <p>
              Variante popular con desplazamiento 13. Es especial porque
              cifrar y descifrar usan la misma operación (13+13=26).
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>⚠️ Seguridad</h3>
            <p>
              Hoy es fácil de romper (solo hay 25 claves posibles).
              Se usa con fines educativos, no para seguridad real.
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
        </div>
      </section>

      <Footer appName="cifrado-cesar" />
    </div>
  );
}
