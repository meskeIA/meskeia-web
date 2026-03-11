'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './CifradoTransposicion.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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
  const [copiado, setCopiado] = useState(false);

  // Estados para HTML code generation
  const [htmlCode, setHtmlCode] = useState('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

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
    generarCodigoHTML(res, metodo);
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

  // Generar código HTML exportable
  const generarCodigoHTML = useCallback((res: string, met: MetodoType) => {
    if (!res) { setHtmlCode(''); return; }

    const nombreMetodo = met === 'columnas' ? 'Columnar' : met === 'railfence' ? 'Rail Fence' : 'Escítala';
    let codigo = `<!-- Cifrado por Transposición (${nombreMetodo}) - generado con meskeIA -->\n\n`;
    codigo += `<div class="mensaje-transposicion">\n`;
    codigo += `  <p class="etiqueta">Método: Transposición ${nombreMetodo}</p>\n`;
    codigo += `  <p class="texto-cifrado">${res}</p>\n`;
    codigo += `</div>\n\n`;
    codigo += `<!-- CSS recomendado -->\n`;
    codigo += `<style>\n`;
    codigo += `  .mensaje-transposicion {\n`;
    codigo += `    font-family: 'Courier New', monospace;\n`;
    codigo += `    background: #f0f4f8;\n`;
    codigo += `    border-left: 4px solid #2E86AB;\n`;
    codigo += `    padding: 1rem 1.5rem;\n`;
    codigo += `    border-radius: 8px;\n`;
    codigo += `  }\n`;
    codigo += `  .etiqueta { color: #666; font-size: 0.85rem; margin: 0 0 0.5rem; }\n`;
    codigo += `  .texto-cifrado { color: #1A1A1A; font-size: 1.1rem; margin: 0; letter-spacing: 1px; }\n`;
    codigo += `</style>\n`;

    setHtmlCode(codigo);
  }, []);

  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const copiarCodigoHTML = async () => {
    if (htmlCode) {
      await navigator.clipboard.writeText(htmlCode);
      setHtmlCopiado(true);
      setTimeout(() => setHtmlCopiado(false), 2000);
    }
  };

  const limpiar = () => {
    setTexto('');
    setResultado('');
    setHtmlCode('');
    setHtmlExpanded(false);
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
                {copiado ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div className={styles.resultBox}>
              {resultado}
            </div>
          </section>
        )}

        {/* ========== HTML CODE GENERATION ========== */}
        {htmlCode && (
          <div className={styles.htmlCodeSection}>
            <button
              type="button"
              className={styles.htmlToggleBtn}
              onClick={() => setHtmlExpanded(!htmlExpanded)}

            >
              <span>{htmlExpanded ? '▲' : '▼'} Exportar como código HTML</span>
              <span className={styles.htmlBadge}>Nuevo</span>
            </button>

            {htmlExpanded && (
              <div className={styles.htmlCodeContent}>
                <p className={styles.htmlDescription}>
                  Copia este código HTML para incrustar el mensaje cifrado en cualquier página web:
                </p>
                <pre className={styles.htmlPre}>{htmlCode}</pre>
                <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyHtml}>
                  {htmlCopiado ? '✅ ¡Copiado!' : '📋 Copiar código HTML'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection
        title="¿Quieres aprender más sobre cifrados de transposición?"
        subtitle="Historia, funcionamiento y curiosidades de estos métodos clásicos usados durante siglos"
      >
        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Comparativa de los tres métodos de transposición</h2>
          <p className={styles.comparativaSubtitle}>
            Columnar, Rail Fence y Escítala frente a frente: complejidad, seguridad y uso histórico
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>📊 Columnar</th>
                  <th>🚃 Rail Fence</th>
                  <th>📜 Escítala</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Origen</td>
                  <td>S. XIX (Europa)</td>
                  <td>S. XIX (EE.UU.)</td>
                  <td>~V a.C. (Esparta)</td>
                </tr>
                <tr>
                  <td>Parámetro clave</td>
                  <td>Palabra clave</td>
                  <td>Número de rieles</td>
                  <td>Diámetro del bastón</td>
                </tr>
                <tr>
                  <td>Complejidad</td>
                  <td>Media</td>
                  <td>Baja</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>Claves posibles</td>
                  <td>Muy alta (permutaciones)</td>
                  <td>Baja (2-10 rieles)</td>
                  <td>Baja (diámetro)</td>
                </tr>
                <tr>
                  <td>Doble aplicación</td>
                  <td className={styles.tdPositive}>Muy eficaz</td>
                  <td className={styles.tdWarning}>Limitada</td>
                  <td className={styles.tdWarning}>Limitada</td>
                </tr>
                <tr>
                  <td>Seguridad real</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdNegative}>Nula</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: HISTORIA ========== */}
        <section className={styles.infoSection}>
          <h2>🏛️ Historia de los cifrados de transposición</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📜 Escítala espartana (~500 a.C.)</h3>
              <p>
                Es uno de los dispositivos criptográficos más antiguos conocidos.
                Los espartanos enrollaban una tira de cuero en un bastón (escítala)
                y escribían el mensaje a lo largo. Al desenrollarlo, las letras quedaban
                desordenadas. Solo un bastón del mismo diámetro permitía leerlo.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>📊 Cifrado columnar (s. XIX)</h3>
              <p>
                Popularizado en el siglo XIX, fue extensamente usado en la
                <strong> Primera Guerra Mundial</strong> por Alemania y Francia.
                Aplicado dos veces («doble transposición columnar»), fue uno de los
                cifrados manuales más seguros de la historia, usado hasta mediados del s. XX.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🚃 Rail Fence en la Guerra Civil (1861-1865)</h3>
              <p>
                Utilizado por las tropas de la Unión durante la Guerra Civil estadounidense
                para transmitir mensajes por telégrafo. Era rápido de aplicar pero
                fácil de romper: con solo 2-10 rieles posibles, se puede descifrar por
                fuerza bruta en segundos.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔐 Sustitución vs. Transposición</h3>
              <p>
                Los cifrados de sustitución (César, Vigenère) <strong>reemplazan</strong>
                cada letra por otra. Los de transposición <strong>reordenan</strong>
                las letras del original. Combinar ambos tipos (producto de cifrados)
                fue la base de la criptografía moderna del siglo XX.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ ========== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas frecuentes sobre transposición</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Cómo se rompe el Rail Fence?
              </summary>
              <p className={styles.faqAnswer}>
                Por fuerza bruta: solo hay 2-10 rieles posibles (el número de rieles
                igual al texto en longitud máxima no tiene sentido). Un atacante simplemente
                prueba cada número de rieles y lee cuál produce texto coherente. Con
                un ordenador tarda microsegundos; manualmente, unos minutos.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Por qué el cifrado columnar doble era tan seguro?
              </summary>
              <p className={styles.faqAnswer}>
                Al aplicar la transposición columnar dos veces con claves diferentes,
                el número de permutaciones posibles se multiplica exponencialmente.
                Con claves de 8 letras, hay más de 40.000 combinaciones para cada aplicación,
                y juntas crean más de 1.600 millones de configuraciones. Para la época
                sin ordenadores, era prácticamente irrompible.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Conserva el cifrado de transposición la frecuencia de letras?
              </summary>
              <p className={styles.faqAnswer}>
                Sí, exactamente. Este es el principal punto débil: la frecuencia de
                cada letra en el texto cifrado es idéntica a la del texto original.
                Un atacante puede confirmar que es un texto en español por las frecuencias
                antes de intentar descifrar. El análisis de frecuencias no descifra
                directamente, pero confirma que está «en el camino correcto».
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Qué diferencia hay entre la escítala y el cifrado columnar?
              </summary>
              <p className={styles.faqAnswer}>
                Conceptualmente son similares: ambos reorganizan el texto en una matriz
                y lo leen por columnas. La diferencia es que la escítala usa un parámetro
                numérico simple (diámetro), mientras el columnar usa una palabra clave que
                define el orden de lectura de columnas de forma no secuencial. El columnar
                es significativamente más seguro.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Se usó la transposición en la Segunda Guerra Mundial?
              </summary>
              <p className={styles.faqAnswer}>
                Sí, aunque los cifrados mecánicos (Enigma, Lorenz) dominaban. Algunos
                agentes de campo seguían usando doble transposición columnar como respaldo
                cuando fallaba el equipo mecánico. Los Aliados tenían procedimientos
                para romperlo si se capturaba suficiente texto cifrado con la misma clave.
              </p>
            </details>
          </div>
        </section>

        {/* ========== SECCIÓN 4: CÓMO FUNCIONA PASO A PASO ========== */}
        <section className={styles.pasosSection}>
          <h2>🧮 Cifrado columnar: paso a paso</h2>
          <div className={styles.pasosGrid}>
            <div className={styles.pasoCard}>
              <div className={styles.pasoNum}>1</div>
              <h3>Elegir clave y texto</h3>
              <div className={styles.pasoEjemplo}>
                <p><strong>Clave:</strong> CLAVE</p>
                <p><strong>Texto:</strong> ATAQUEALAMANECER</p>
              </div>
            </div>
            <div className={styles.pasoCard}>
              <div className={styles.pasoNum}>2</div>
              <h3>Escribir en filas bajo la clave</h3>
              <div className={styles.pasoEjemplo}>
                <p className={styles.pasoCode}>C L A V E</p>
                <p className={styles.pasoCode}>A T A Q U</p>
                <p className={styles.pasoCode}>E A L A M</p>
                <p className={styles.pasoCode}>A N E C E</p>
                <p className={styles.pasoCode}>R X X X X</p>
              </div>
            </div>
            <div className={styles.pasoCard}>
              <div className={styles.pasoNum}>3</div>
              <h3>Ordenar columnas alfabéticamente</h3>
              <div className={styles.pasoEjemplo}>
                <p>A(3)→C(1)→E(5)→L(2)→V(4)</p>
                <p className={styles.pasoCode}>Col 3: AALCE</p>
                <p className={styles.pasoCode}>Col 1: AEAR R</p>
                <p className={styles.pasoCode}>Col 5: UMEXX</p>
                <p className={styles.pasoCode}>Col 2: TANX</p>
                <p className={styles.pasoCode}>Col 4: QACX</p>
              </div>
            </div>
            <div className={styles.pasoCard}>
              <div className={styles.pasoNum}>4</div>
              <h3>Leer columnas en ese orden</h3>
              <div className={styles.pasoEjemplo}>
                <p><strong>Resultado:</strong></p>
                <p className={`${styles.pasoCode} ${styles.pasoResultado}`}>AALCEARRUMEXXTANXQACX</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 5: CONSEJOS ========== */}
        <section className={styles.tipsSection}>
          <h2>💡 Consejos para usar transposición</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔑</span>
              <div>
                <strong>Claves largas y sin repetición</strong>
                <p>Para el cifrado columnar, usa claves de 7-12 letras sin letras repetidas. Más letras = más columnas = más combinaciones posibles.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔁</span>
              <div>
                <strong>Doble transposición</strong>
                <p>Aplica el cifrado columnar dos veces con claves diferentes. Esto multiplica exponencialmente la seguridad y hace el ataque por fuerza bruta impracticable sin ordenador.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔀</span>
              <div>
                <strong>Combinar con sustitución</strong>
                <p>Aplica primero un cifrado de sustitución (Vigenère) y luego transposición. Esta combinación oculta tanto el orden como las letras, dificultando el análisis de frecuencias.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <div>
                <strong>Mensajes largos son más seguros</strong>
                <p>Los ataques estadísticos necesitan suficiente texto para funcionar. Mensajes de menos de 50 letras son más difíciles de romper por análisis, aunque no por fuerza bruta.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2>⚠️ Errores frecuentes con cifrados de transposición</h2>
          <ul className={styles.warningList}>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Creer que la transposición oculta las letras</strong>
                <p>Un cifrado de transposición solo reordena las letras — no las cambia. Un análisis de frecuencias confirma inmediatamente el idioma original y las letras usadas. Para ocultar también las letras, combina con sustitución.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Usar Rail Fence o Escítala para datos sensibles</strong>
                <p>Con solo 2-10 rieles posibles (Rail Fence) o unos pocos diámetros (Escítala), un ordenador los rompe en microsegundos. Son métodos puramente educativos, no aptos para proteger información real.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>🚫</span>
              <div>
                <strong>Reutilizar la misma clave para múltiples mensajes</strong>
                <p>Si un atacante captura varios mensajes cifrados con la misma clave columnar, puede usar técnicas de análisis diferencial para deducir la clave. Cambia la clave regularmente.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon}>✅</span>
              <div>
                <strong>Uso correcto: educación y puzzles</strong>
                <p>Los cifrados de transposición son ideales para enseñar conceptos de criptografía, crear juegos de escape, diseñar acertijos, y entender la evolución histórica hacia los cifrados modernos.</p>
              </div>
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-transposicion')} />

      <ShareCard appName="cifrado-transposicion" />
      <Footer appName="cifrado-transposicion" />
    </div>
  );
}
