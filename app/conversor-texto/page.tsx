'use client';

import { useState } from 'react';
import styles from './ConversorTexto.module.css';
import { MeskeiaLogo, Footer } from '@/components';

// ==================== TIPOS ====================

type TabType = 'convertir' | 'codificar' | 'lorem';

// ==================== DATOS ====================

const loremIpsumParrafos = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
  'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
  'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function ConversorTextoPage() {
  const [tabActual, setTabActual] = useState<TabType>('convertir');
  const [textoEntrada, setTextoEntrada] = useState('');
  const [textoSalida, setTextoSalida] = useState('');
  const [loremParrafos, setLoremParrafos] = useState(3);

  // ==================== FUNCIONES DE CONVERSIÓN ====================

  const convertirMayusculas = () => setTextoSalida(textoEntrada.toUpperCase());
  const convertirMinusculas = () => setTextoSalida(textoEntrada.toLowerCase());

  const convertirCapitalizar = () => {
    setTextoSalida(
      textoEntrada
        .toLowerCase()
        .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase())
    );
  };

  const convertirTitulo = () => {
    // Capitaliza cada palabra excepto artículos y preposiciones cortas
    const excepciones = ['de', 'del', 'la', 'el', 'las', 'los', 'en', 'y', 'a', 'con', 'por', 'para'];
    setTextoSalida(
      textoEntrada
        .toLowerCase()
        .split(' ')
        .map((palabra, index) => {
          if (index === 0 || !excepciones.includes(palabra)) {
            return palabra.charAt(0).toUpperCase() + palabra.slice(1);
          }
          return palabra;
        })
        .join(' ')
    );
  };

  const convertirOracion = () => {
    // Primera letra de cada oración en mayúscula
    setTextoSalida(
      textoEntrada
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (letra) => letra.toUpperCase())
    );
  };

  const convertirAlternar = () => {
    setTextoSalida(
      textoEntrada
        .split('')
        .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
        .join('')
    );
  };

  const convertirInvertir = () => {
    setTextoSalida(textoEntrada.split('').reverse().join(''));
  };

  const convertirInvertirPalabras = () => {
    setTextoSalida(textoEntrada.split(' ').reverse().join(' '));
  };

  const eliminarAcentos = () => {
    setTextoSalida(
      textoEntrada.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );
  };

  // ==================== FUNCIONES DE CODIFICACIÓN ====================

  const codificarBase64 = () => {
    try {
      setTextoSalida(btoa(unescape(encodeURIComponent(textoEntrada))));
    } catch {
      setTextoSalida('Error: No se pudo codificar el texto');
    }
  };

  const decodificarBase64 = () => {
    try {
      setTextoSalida(decodeURIComponent(escape(atob(textoEntrada))));
    } catch {
      setTextoSalida('Error: El texto no es Base64 válido');
    }
  };

  const codificarURL = () => {
    setTextoSalida(encodeURIComponent(textoEntrada));
  };

  const decodificarURL = () => {
    try {
      setTextoSalida(decodeURIComponent(textoEntrada));
    } catch {
      setTextoSalida('Error: El texto no está codificado correctamente');
    }
  };

  const textoAHex = () => {
    setTextoSalida(
      textoEntrada
        .split('')
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ')
    );
  };

  const hexATexto = () => {
    try {
      const hex = textoEntrada.replace(/\s/g, '');
      let resultado = '';
      for (let i = 0; i < hex.length; i += 2) {
        resultado += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      setTextoSalida(resultado);
    } catch {
      setTextoSalida('Error: El texto no es hexadecimal válido');
    }
  };

  // ==================== FUNCIONES LOREM IPSUM ====================

  const generarLoremIpsum = () => {
    const parrafos = loremIpsumParrafos.slice(0, loremParrafos);
    setTextoSalida(parrafos.join('\n\n'));
  };

  // ==================== FUNCIONES AUXILIARES ====================

  const copiarResultado = async () => {
    if (!textoSalida) return;
    try {
      await navigator.clipboard.writeText(textoSalida);
      alert('Texto copiado al portapapeles');
    } catch {
      alert('No se pudo copiar el texto');
    }
  };

  const limpiarTodo = () => {
    setTextoEntrada('');
    setTextoSalida('');
  };

  const intercambiarTextos = () => {
    const temp = textoEntrada;
    setTextoEntrada(textoSalida);
    setTextoSalida(temp);
  };

  // ==================== RENDER ====================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Texto</h1>
        <p className={styles.subtitle}>
          Transforma tu texto: mayúsculas, minúsculas, codificación y más
        </p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tabActual === 'convertir' ? styles.tabActivo : ''}`}
          onClick={() => setTabActual('convertir')}
        >
          Aa Convertir
        </button>
        <button
          className={`${styles.tab} ${tabActual === 'codificar' ? styles.tabActivo : ''}`}
          onClick={() => setTabActual('codificar')}
        >
          {'<>'} Codificar
        </button>
        <button
          className={`${styles.tab} ${tabActual === 'lorem' ? styles.tabActivo : ''}`}
          onClick={() => setTabActual('lorem')}
        >
          Lorem Ipsum
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de entrada (oculto en Lorem Ipsum) */}
        {tabActual !== 'lorem' && (
          <section className={styles.inputPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Texto de entrada</h2>
              <button onClick={limpiarTodo} className={styles.btnSecundario}>
                Limpiar
              </button>
            </div>
            <textarea
              value={textoEntrada}
              onChange={(e) => setTextoEntrada(e.target.value)}
              placeholder="Escribe o pega tu texto aquí..."
              className={styles.textArea}
              rows={8}
            />
          </section>
        )}

        {/* Botones de acción */}
        <section className={styles.accionesPanel}>
          {tabActual === 'convertir' && (
            <>
              <h3 className={styles.accionesTitle}>Conversiones de texto</h3>
              <div className={styles.botonesGrid}>
                <button onClick={convertirMayusculas} className={styles.btnAccion}>
                  MAYÚSCULAS
                </button>
                <button onClick={convertirMinusculas} className={styles.btnAccion}>
                  minúsculas
                </button>
                <button onClick={convertirCapitalizar} className={styles.btnAccion}>
                  Capitalizar Palabras
                </button>
                <button onClick={convertirTitulo} className={styles.btnAccion}>
                  Formato Título
                </button>
                <button onClick={convertirOracion} className={styles.btnAccion}>
                  Formato oración
                </button>
                <button onClick={convertirAlternar} className={styles.btnAccion}>
                  aLtErNaR
                </button>
                <button onClick={convertirInvertir} className={styles.btnAccion}>
                  Invertir ↔
                </button>
                <button onClick={convertirInvertirPalabras} className={styles.btnAccion}>
                  Invertir palabras
                </button>
                <button onClick={eliminarAcentos} className={styles.btnAccion}>
                  Sin acentos
                </button>
              </div>
            </>
          )}

          {tabActual === 'codificar' && (
            <>
              <h3 className={styles.accionesTitle}>Codificación / Decodificación</h3>
              <div className={styles.botonesGrid}>
                <button onClick={codificarBase64} className={styles.btnAccion}>
                  Codificar Base64
                </button>
                <button onClick={decodificarBase64} className={styles.btnAccion}>
                  Decodificar Base64
                </button>
                <button onClick={codificarURL} className={styles.btnAccion}>
                  Codificar URL
                </button>
                <button onClick={decodificarURL} className={styles.btnAccion}>
                  Decodificar URL
                </button>
                <button onClick={textoAHex} className={styles.btnAccion}>
                  Texto → Hex
                </button>
                <button onClick={hexATexto} className={styles.btnAccion}>
                  Hex → Texto
                </button>
              </div>
            </>
          )}

          {tabActual === 'lorem' && (
            <>
              <h3 className={styles.accionesTitle}>Generador Lorem Ipsum</h3>
              <div className={styles.loremConfig}>
                <label className={styles.loremLabel}>
                  Número de párrafos:
                  <select
                    value={loremParrafos}
                    onChange={(e) => setLoremParrafos(parseInt(e.target.value))}
                    className={styles.loremSelect}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'párrafo' : 'párrafos'}
                      </option>
                    ))}
                  </select>
                </label>
                <button onClick={generarLoremIpsum} className={styles.btnPrimario}>
                  Generar Lorem Ipsum
                </button>
              </div>
            </>
          )}

          {/* Botón intercambiar (solo en convertir/codificar) */}
          {tabActual !== 'lorem' && textoSalida && (
            <button onClick={intercambiarTextos} className={styles.btnIntercambiar}>
              ↕ Usar resultado como entrada
            </button>
          )}
        </section>

        {/* Panel de salida */}
        <section className={styles.outputPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>Resultado</h2>
            <button
              onClick={copiarResultado}
              className={styles.btnSecundario}
              disabled={!textoSalida}
            >
              Copiar
            </button>
          </div>
          <textarea
            value={textoSalida}
            readOnly
            placeholder="El resultado aparecerá aquí..."
            className={styles.textArea}
            rows={8}
          />
        </section>
      </div>

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
              <strong>Instantáneo</strong>
              <p>Conversiones en tiempo real</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🛠️</span>
            <div>
              <strong>Múltiples formatos</strong>
              <p>Texto, Base64, URL, Hexadecimal</p>
            </div>
          </div>
        </div>
      </section>

      <Footer appName="conversor-texto" />
    </div>
  );
}
