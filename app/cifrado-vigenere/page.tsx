'use client';

import { useState, useMemo } from 'react';
import styles from './CifradoVigenere.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'cifrar' | 'descifrar';

export default function CifradoVigenerePage() {
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [clave, setClave] = useState('');
  const [resultado, setResultado] = useState('');
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // Normalizar clave (solo letras, mayúsculas)
  const claveNormalizada = clave.toUpperCase().replace(/[^A-Z]/g, '');

  // Cifrado Vigenère
  const cifrarVigenere = (texto: string, clave: string, descifrar: boolean = false): string => {
    if (!clave) return texto;

    const claveUpper = clave.toUpperCase();
    let claveIndex = 0;

    return texto
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

  const procesar = () => {
    if (!texto.trim() || !claveNormalizada) return;
    const res = cifrarVigenere(texto, claveNormalizada, modo === 'descifrar');
    setResultado(res);
  };

  const limpiar = () => {
    setTexto('');
    setClave('');
    setResultado('');
  };

  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado);
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
          Cifrado polialfabético con palabra clave - Más seguro que César
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
              📋 Copiar resultado
            </button>
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

      {/* Sección educativa colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre el Cifrado Vigenère?"
        subtitle="Historia, funcionamiento matemático y por qué fue considerado 'indescifrable' durante 300 años"
      >
        <section className={styles.infoSection}>
          <h2>Historia y Funcionamiento</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📜 Historia</h3>
              <p>
                Descrito por primera vez por Giovan Battista Bellaso en 1553 y
                popularizado por Blaise de Vigenère en el siglo XVI. Fue considerado
                &quot;indescifrable&quot; durante 300 años hasta que Charles Babbage
                y Friedrich Kasiski lo rompieron en el siglo XIX.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔄 Cómo funciona</h3>
              <p>
                A diferencia del cifrado César (un solo desplazamiento), Vigenère usa
                múltiples desplazamientos determinados por una palabra clave. Cada letra
                de la clave indica cuántas posiciones desplazar la letra correspondiente
                del mensaje.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🧮 Ejemplo paso a paso</h3>
              <p>
                Mensaje: HOLA, Clave: ABC<br />
                H + A (0) = H<br />
                O + B (1) = P<br />
                L + C (2) = N<br />
                A + A (0) = A<br />
                Resultado: HPNA
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚠️ Seguridad</h3>
              <p>
                Aunque más seguro que César, hoy es vulnerable al análisis de frecuencias
                y al método Kasiski. Se usa con fines educativos. Para seguridad real,
                usa AES u otros cifrados modernos.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.tipsSection}>
          <h2>Consejos para claves seguras</h2>
          <ul className={styles.tipsList}>
            <li>🔑 Usa claves largas (mínimo 8 caracteres)</li>
            <li>🚫 Evita palabras del diccionario</li>
            <li>🔀 Mezcla letras sin patrón reconocible</li>
            <li>📏 La clave ideal es tan larga como el mensaje (one-time pad)</li>
            <li>🔄 No reutilices claves para diferentes mensajes</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-vigenere')} />

      <Footer appName="cifrado-vigenere" />
    </div>
  );
}
