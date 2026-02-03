'use client';

import { useState, useMemo } from 'react';
import styles from './CifradoTransposicion.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type MetodoType = 'columnas' | 'railfence' | 'escitala';
type ModoType = 'cifrar' | 'descifrar';

export default function CifradoTransposicionPage() {
  const [metodo, setMetodo] = useState<MetodoType>('columnas');
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [clave, setClave] = useState('CLAVE');
  const [rieles, setRieles] = useState(3);
  const [diametro, setDiametro] = useState(4);
  const [resultado, setResultado] = useState('');
  const [mostrarVisualizacion, setMostrarVisualizacion] = useState(true);

  // ==================== CIFRADO POR COLUMNAS ====================

  const cifrarColumnas = (texto: string, clave: string): string => {
    if (!texto || !clave) return '';
    const textoLimpio = texto.toUpperCase().replace(/[^A-ZÑ]/g, '');
    const numCols = clave.length;

    // Rellenar con X si es necesario
    const padding = numCols - (textoLimpio.length % numCols);
    const textoRelleno = padding === numCols ? textoLimpio : textoLimpio + 'X'.repeat(padding);

    // Crear matriz por filas
    const filas: string[][] = [];
    for (let i = 0; i < textoRelleno.length; i += numCols) {
      filas.push(textoRelleno.slice(i, i + numCols).split(''));
    }

    // Obtener orden de columnas según clave
    const orden = obtenerOrdenClave(clave);

    // Leer por columnas en orden
    let cifrado = '';
    for (const colIndex of orden) {
      for (const fila of filas) {
        cifrado += fila[colIndex];
      }
    }

    return cifrado;
  };

  const descifrarColumnas = (texto: string, clave: string): string => {
    if (!texto || !clave) return '';
    const textoLimpio = texto.toUpperCase().replace(/[^A-ZÑ]/g, '');
    const numCols = clave.length;
    const numFilas = Math.ceil(textoLimpio.length / numCols);

    // Obtener orden de columnas según clave
    const orden = obtenerOrdenClave(clave);

    // Calcular letras por columna
    const matriz: string[][] = Array(numFilas).fill(null).map(() => Array(numCols).fill(''));

    let pos = 0;
    for (const colIndex of orden) {
      for (let fila = 0; fila < numFilas && pos < textoLimpio.length; fila++) {
        matriz[fila][colIndex] = textoLimpio[pos++];
      }
    }

    // Leer por filas
    return matriz.map(fila => fila.join('')).join('');
  };

  const obtenerOrdenClave = (clave: string): number[] => {
    const claveUpper = clave.toUpperCase();
    const letrasConIndice = claveUpper.split('').map((letra, i) => ({ letra, i }));
    letrasConIndice.sort((a, b) => a.letra.localeCompare(b.letra));
    return letrasConIndice.map(item => item.i);
  };

  // ==================== CIFRADO RAIL FENCE ====================

  const cifrarRailFence = (texto: string, rieles: number): string => {
    if (!texto || rieles < 2) return '';
    const textoLimpio = texto.toUpperCase().replace(/[^A-ZÑ]/g, '');

    // Crear matriz de rieles
    const fence: string[][] = Array(rieles).fill(null).map(() => []);
    let riel = 0;
    let direccion = 1;

    for (const char of textoLimpio) {
      fence[riel].push(char);
      riel += direccion;
      if (riel === 0 || riel === rieles - 1) {
        direccion *= -1;
      }
    }

    return fence.map(r => r.join('')).join('');
  };

  const descifrarRailFence = (texto: string, rieles: number): string => {
    if (!texto || rieles < 2) return '';
    const textoLimpio = texto.toUpperCase().replace(/[^A-ZÑ]/g, '');
    const len = textoLimpio.length;

    // Calcular longitud de cada riel
    const railLens = Array(rieles).fill(0);
    let riel = 0;
    let direccion = 1;

    for (let i = 0; i < len; i++) {
      railLens[riel]++;
      riel += direccion;
      if (riel === 0 || riel === rieles - 1) {
        direccion *= -1;
      }
    }

    // Distribuir letras en rieles
    const rails: string[] = [];
    let pos = 0;
    for (let r = 0; r < rieles; r++) {
      rails.push(textoLimpio.slice(pos, pos + railLens[r]));
      pos += railLens[r];
    }

    // Reconstruir mensaje
    const indices = Array(rieles).fill(0);
    let resultado = '';
    riel = 0;
    direccion = 1;

    for (let i = 0; i < len; i++) {
      resultado += rails[riel][indices[riel]++];
      riel += direccion;
      if (riel === 0 || riel === rieles - 1) {
        direccion *= -1;
      }
    }

    return resultado;
  };

  // ==================== CIFRADO ESCÍTALA ====================

  const cifrarEscitala = (texto: string, diametro: number): string => {
    if (!texto || diametro < 2) return '';
    const textoLimpio = texto.toUpperCase().replace(/[^A-ZÑ]/g, '');

    // Rellenar con X si es necesario
    const padding = diametro - (textoLimpio.length % diametro);
    const textoRelleno = padding === diametro ? textoLimpio : textoLimpio + 'X'.repeat(padding);

    // Leer por columnas
    let cifrado = '';
    for (let col = 0; col < diametro; col++) {
      for (let fila = 0; fila < textoRelleno.length / diametro; fila++) {
        cifrado += textoRelleno[fila * diametro + col];
      }
    }

    return cifrado;
  };

  const descifrarEscitala = (texto: string, diametro: number): string => {
    if (!texto || diametro < 2) return '';
    const textoLimpio = texto.toUpperCase().replace(/[^A-ZÑ]/g, '');
    const numFilas = Math.ceil(textoLimpio.length / diametro);

    // Leer por filas desde columnas
    let descifrado = '';
    for (let fila = 0; fila < numFilas; fila++) {
      for (let col = 0; col < diametro; col++) {
        const pos = col * numFilas + fila;
        if (pos < textoLimpio.length) {
          descifrado += textoLimpio[pos];
        }
      }
    }

    return descifrado;
  };

  // ==================== PROCESAR ====================

  const procesar = () => {
    let res = '';

    if (metodo === 'columnas') {
      res = modo === 'cifrar' ? cifrarColumnas(texto, clave) : descifrarColumnas(texto, clave);
    } else if (metodo === 'railfence') {
      res = modo === 'cifrar' ? cifrarRailFence(texto, rieles) : descifrarRailFence(texto, rieles);
    } else if (metodo === 'escitala') {
      res = modo === 'cifrar' ? cifrarEscitala(texto, diametro) : descifrarEscitala(texto, diametro);
    }

    setResultado(res);
  };

  // ==================== VISUALIZACIÓN ====================

  const visualizacion = useMemo(() => {
    if (!texto || !mostrarVisualizacion) return null;
    const textoLimpio = texto.toUpperCase().replace(/[^A-ZÑ]/g, '');

    if (metodo === 'columnas' && clave) {
      const numCols = clave.length;
      const padding = numCols - (textoLimpio.length % numCols);
      const textoRelleno = padding === numCols ? textoLimpio : textoLimpio + 'X'.repeat(padding);
      const filas: string[][] = [];
      for (let i = 0; i < textoRelleno.length; i += numCols) {
        filas.push(textoRelleno.slice(i, i + numCols).split(''));
      }
      const orden = obtenerOrdenClave(clave);

      return (
        <div className={styles.visualizacion}>
          <h4>Matriz de transposición</h4>
          <table className={styles.matriz}>
            <thead>
              <tr>
                {clave.toUpperCase().split('').map((letra, i) => (
                  <th key={i} className={styles.claveHeader}>
                    {letra}
                    <span className={styles.ordenNumero}>{orden.indexOf(i) + 1}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => (
                <tr key={i}>
                  {fila.map((char, j) => (
                    <td key={j} className={styles.celda}>{char}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.visualHint}>
            Orden de lectura: {orden.map(i => clave[i].toUpperCase()).join(' → ')}
          </p>
        </div>
      );
    }

    if (metodo === 'railfence') {
      const fence: (string | null)[][] = Array(rieles).fill(null).map(() =>
        Array(textoLimpio.length).fill(null)
      );
      let riel = 0;
      let direccion = 1;

      for (let i = 0; i < textoLimpio.length; i++) {
        fence[riel][i] = textoLimpio[i];
        riel += direccion;
        if (riel === 0 || riel === rieles - 1) {
          direccion *= -1;
        }
      }

      return (
        <div className={styles.visualizacion}>
          <h4>Patrón zigzag (Rail Fence)</h4>
          <div className={styles.railFenceGrid}>
            {fence.map((fila, r) => (
              <div key={r} className={styles.railRow}>
                {fila.map((char, c) => (
                  <span
                    key={c}
                    className={`${styles.railCell} ${char ? styles.railFilled : ''}`}
                  >
                    {char || '·'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (metodo === 'escitala') {
      const padding = diametro - (textoLimpio.length % diametro);
      const textoRelleno = padding === diametro ? textoLimpio : textoLimpio + 'X'.repeat(padding);
      const numFilas = textoRelleno.length / diametro;

      return (
        <div className={styles.visualizacion}>
          <h4>Escítala (bastón espartano)</h4>
          <div className={styles.escitalaContainer}>
            <div className={styles.escitalaBarra}>
              {Array.from({ length: numFilas }).map((_, fila) => (
                <div key={fila} className={styles.escitalaFila}>
                  {textoRelleno.slice(fila * diametro, (fila + 1) * diametro).split('').map((char, col) => (
                    <span key={col} className={styles.escitalaLetra}>{char}</span>
                  ))}
                </div>
              ))}
            </div>
            <p className={styles.visualHint}>
              La cinta se enrolla en un bastón de diámetro {diametro}
            </p>
          </div>
        </div>
      );
    }

    return null;
  }, [texto, metodo, clave, rieles, diametro, mostrarVisualizacion]);

  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado);
    }
  };

  const limpiar = () => {
    setTexto('');
    setResultado('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cifrado por Transposición</h1>
        <p className={styles.subtitle}>
          Reordena las letras de tu mensaje con métodos clásicos
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Selector de método */}
        <div className={styles.metodoSelector}>
          <button
            type="button"
            className={`${styles.metodoBtn} ${metodo === 'columnas' ? styles.active : ''}`}
            onClick={() => setMetodo('columnas')}
          >
            📊 Columnas
          </button>
          <button
            type="button"
            className={`${styles.metodoBtn} ${metodo === 'railfence' ? styles.active : ''}`}
            onClick={() => setMetodo('railfence')}
          >
            🚃 Rail Fence
          </button>
          <button
            type="button"
            className={`${styles.metodoBtn} ${metodo === 'escitala' ? styles.active : ''}`}
            onClick={() => setMetodo('escitala')}
          >
            📜 Escítala
          </button>
        </div>

        {/* Descripción del método */}
        <div className={styles.metodoInfo}>
          {metodo === 'columnas' && (
            <p>Escribe el texto en filas y lee por columnas según el orden alfabético de la clave.</p>
          )}
          {metodo === 'railfence' && (
            <p>Escribe el texto en zigzag entre varios &quot;rieles&quot; y lee línea por línea.</p>
          )}
          {metodo === 'escitala' && (
            <p>Método espartano: enrolla una cinta en un bastón y lee las letras alineadas.</p>
          )}
        </div>

        {/* Panel de configuración */}
        <section className={styles.configPanel}>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'cifrar' ? styles.active : ''}`}
              onClick={() => setModo('cifrar')}
            >
              🔒 Cifrar
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'descifrar' ? styles.active : ''}`}
              onClick={() => setModo('descifrar')}
            >
              🔓 Descifrar
            </button>
          </div>

          {/* Configuración específica por método */}
          {metodo === 'columnas' && (
            <div className={styles.configItem}>
              <label className={styles.label}>Palabra clave</label>
              <input
                type="text"
                value={clave}
                onChange={(e) => setClave(e.target.value.toUpperCase())}
                placeholder="Ej: SECRETO"
                className={styles.input}
                maxLength={15}
              />
              <span className={styles.hint}>Define el orden de las columnas</span>
            </div>
          )}

          {metodo === 'railfence' && (
            <div className={styles.configItem}>
              <label className={styles.label}>Número de rieles: {rieles}</label>
              <input
                type="range"
                min={2}
                max={10}
                value={rieles}
                onChange={(e) => setRieles(parseInt(e.target.value))}
                className={styles.slider}
              />
            </div>
          )}

          {metodo === 'escitala' && (
            <div className={styles.configItem}>
              <label className={styles.label}>Diámetro del bastón: {diametro}</label>
              <input
                type="range"
                min={2}
                max={12}
                value={diametro}
                onChange={(e) => setDiametro(parseInt(e.target.value))}
                className={styles.slider}
              />
            </div>
          )}

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={mostrarVisualizacion}
              onChange={(e) => setMostrarVisualizacion(e.target.checked)}
            />
            Mostrar visualización
          </label>
        </section>

        {/* Entrada de texto */}
        <section className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>
              Texto a {modo === 'cifrar' ? 'cifrar' : 'descifrar'}
            </h2>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={modo === 'cifrar'
              ? 'Escribe tu mensaje secreto...'
              : 'Pega el texto cifrado...'}
            className={styles.textArea}
            rows={4}
          />
          <button
            type="button"
            onClick={procesar}
            className={styles.btnPrimary}
            disabled={!texto.trim()}
          >
            {modo === 'cifrar' ? '🔒 Cifrar' : '🔓 Descifrar'}
          </button>
        </section>

        {/* Visualización */}
        {visualizacion}

        {/* Resultado */}
        {resultado && (
          <section className={styles.resultPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Resultado</h2>
              <button type="button" onClick={copiarResultado} className={styles.btnCopy}>
                📋 Copiar
              </button>
            </div>
            <div className={styles.resultBox}>
              {resultado}
            </div>
          </section>
        )}
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre cifrados de transposición?"
        subtitle="Historia y funcionamiento de estos métodos clásicos"
      >
        <section className={styles.infoSection}>
          <h2>Tipos de transposición</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📊 Cifrado Columnar</h3>
              <p>
                Inventado en el siglo XIX, se usó extensamente en la Primera Guerra Mundial.
                El texto se escribe en filas y se lee en columnas según el orden alfabético
                de una palabra clave. <strong>Muy seguro</strong> si se aplica dos veces.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🚃 Rail Fence (Cerca)</h3>
              <p>
                Uno de los cifrados más simples. El texto se escribe en zigzag entre
                varios &quot;rieles&quot; y luego se lee línea por línea. Usado en la
                Guerra Civil estadounidense. Fácil de romper pero didáctico.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>📜 Escítala Espartana</h3>
              <p>
                Usado por los espartanos en el siglo V a.C. Se enrollaba una cinta de
                cuero en un bastón (escítala) para escribir el mensaje. Solo quien tuviera
                un bastón del mismo diámetro podía leerlo.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔐 Sustitución vs Transposición</h3>
              <p>
                A diferencia de César o Vigenère que <strong>reemplazan</strong> letras,
                la transposición las <strong>reordena</strong>. Combinar ambos métodos
                crea cifrados mucho más seguros.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-transposicion')} />

      <Footer appName="cifrado-transposicion" />
    </div>
  );
}
