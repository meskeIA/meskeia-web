'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect } from 'react';
import styles from './ArbolDecisionIa.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───

interface Ejemplo {
  id: number;
  features: Record<string, boolean>;
  etiqueta: boolean;
}

interface Nodo {
  id: number;
  feature: string | null;
  izquierda?: Nodo;
  derecha?: Nodo;
  ejemplos: Ejemplo[];
  prediccion: boolean;
  gini: number;
}

interface NodoLayout {
  nodo: Nodo;
  x: number;
  y: number;
  parentX: number | null;
  parentY: number | null;
  esDerecha: boolean | null;
}

interface Dataset {
  nombre: string;
  icono: string;
  pregunta: string;
  features: string[];
  featureLabels: Record<string, string>;
  svgLabels: Record<string, string>;
  etiquetaSi: string;
  etiquetaNo: string;
  colorSi: string;
  colorNo: string;
  ejemplosIniciales: Array<{ features: Record<string, boolean>; etiqueta: boolean }>;
}

// ─── Datasets ───

const DATASETS: Record<string, Dataset> = {
  clima: {
    nombre: 'Clima', icono: '🌤️', pregunta: '¿Salir a jugar?',
    features: ['soleado', 'caluroso', 'humedo', 'ventoso'],
    featureLabels: { soleado: 'Soleado', caluroso: 'Caluroso', humedo: 'Húmedo', ventoso: 'Ventoso' },
    svgLabels:     { soleado: 'Soleado?', caluroso: 'Caluroso?', humedo: 'Húmedo?', ventoso: 'Ventoso?' },
    etiquetaSi: 'Salir', etiquetaNo: 'No salir',
    colorSi: '#27ae60', colorNo: '#c0392b',
    ejemplosIniciales: [
      { features: { soleado: false, caluroso: false, humedo: false, ventoso: false }, etiqueta: true  },
      { features: { soleado: false, caluroso: true,  humedo: false, ventoso: true  }, etiqueta: true  },
      { features: { soleado: false, caluroso: true,  humedo: false, ventoso: false }, etiqueta: true  },
      { features: { soleado: true,  caluroso: true,  humedo: false, ventoso: false }, etiqueta: true  },
      { features: { soleado: true,  caluroso: false, humedo: false, ventoso: false }, etiqueta: true  },
      { features: { soleado: true,  caluroso: false, humedo: false, ventoso: true  }, etiqueta: true  },
      { features: { soleado: false, caluroso: true,  humedo: true,  ventoso: false }, etiqueta: true  },
      { features: { soleado: false, caluroso: false, humedo: true,  ventoso: false }, etiqueta: true  },
      { features: { soleado: true,  caluroso: true,  humedo: true,  ventoso: true  }, etiqueta: false },
      { features: { soleado: false, caluroso: false, humedo: true,  ventoso: true  }, etiqueta: false },
    ],
  },
  spam: {
    nombre: 'Spam', icono: '📧', pregunta: '¿Es correo spam?',
    features: ['enlaces', 'mayusculas', 'dinero', 'desconocido'],
    featureLabels: { enlaces: 'Tiene enlaces', mayusculas: 'TODO MAYÚSCULAS', dinero: 'Menciona dinero', desconocido: 'Remitente desc.' },
    svgLabels:     { enlaces: 'Tiene links?', mayusculas: 'MAYÚSCULAS?', dinero: 'Menciona $?', desconocido: 'Desc.?' },
    etiquetaSi: 'Spam', etiquetaNo: 'No spam',
    colorSi: '#e74c3c', colorNo: '#27ae60',
    ejemplosIniciales: [
      { features: { enlaces: true,  mayusculas: true,  dinero: true,  desconocido: true  }, etiqueta: true  },
      { features: { enlaces: false, mayusculas: true,  dinero: true,  desconocido: false }, etiqueta: true  },
      { features: { enlaces: true,  mayusculas: false, dinero: true,  desconocido: false }, etiqueta: true  },
      { features: { enlaces: false, mayusculas: false, dinero: true,  desconocido: true  }, etiqueta: true  },
      { features: { enlaces: true,  mayusculas: true,  dinero: false, desconocido: true  }, etiqueta: true  },
      { features: { enlaces: false, mayusculas: false, dinero: false, desconocido: false }, etiqueta: false },
      { features: { enlaces: true,  mayusculas: false, dinero: false, desconocido: false }, etiqueta: false },
      { features: { enlaces: true,  mayusculas: false, dinero: false, desconocido: true  }, etiqueta: false },
      { features: { enlaces: false, mayusculas: true,  dinero: false, desconocido: false }, etiqueta: false },
      { features: { enlaces: false, mayusculas: false, dinero: false, desconocido: true  }, etiqueta: false },
    ],
  },
  fruta: {
    nombre: 'Fruta', icono: '🍎', pregunta: '¿Manzana o naranja?',
    features: ['rojo', 'grande', 'dulce', 'redondo'],
    featureLabels: { rojo: 'Rojo', grande: 'Grande', dulce: 'Dulce', redondo: 'Redondo' },
    svgLabels:     { rojo: 'Rojo?', grande: 'Grande?', dulce: 'Dulce?', redondo: 'Redondo?' },
    etiquetaSi: 'Manzana', etiquetaNo: 'Naranja',
    colorSi: '#e74c3c', colorNo: '#e67e22',
    ejemplosIniciales: [
      { features: { rojo: true,  grande: true,  dulce: true,  redondo: true  }, etiqueta: true  },
      { features: { rojo: true,  grande: false, dulce: true,  redondo: true  }, etiqueta: true  },
      { features: { rojo: true,  grande: true,  dulce: false, redondo: true  }, etiqueta: true  },
      { features: { rojo: true,  grande: false, dulce: true,  redondo: false }, etiqueta: true  },
      { features: { rojo: true,  grande: true,  dulce: false, redondo: false }, etiqueta: true  },
      { features: { rojo: false, grande: false, dulce: true,  redondo: true  }, etiqueta: false },
      { features: { rojo: false, grande: false, dulce: false, redondo: true  }, etiqueta: false },
      { features: { rojo: false, grande: true,  dulce: true,  redondo: true  }, etiqueta: false },
      { features: { rojo: false, grande: false, dulce: true,  redondo: false }, etiqueta: false },
      { features: { rojo: false, grande: true,  dulce: false, redondo: true  }, etiqueta: false },
    ],
  },
};

// ─── Algoritmo Gini / ID3 ───

function calcularGini(ejemplos: Ejemplo[]): number {
  if (ejemplos.length === 0) return 0;
  const pos = ejemplos.filter((e) => e.etiqueta).length;
  const p = pos / ejemplos.length;
  return 1 - p * p - (1 - p) * (1 - p);
}

function encontrarMejorSplit(ejemplos: Ejemplo[], features: string[]): string | null {
  const giniBase = calcularGini(ejemplos);
  let mejorGini = giniBase;
  let mejorFeature: string | null = null;
  for (const f of features) {
    const izq = ejemplos.filter((e) => !e.features[f]);
    const der = ejemplos.filter((e) => e.features[f]);
    if (izq.length === 0 || der.length === 0) continue;
    const g = (izq.length / ejemplos.length) * calcularGini(izq)
            + (der.length / ejemplos.length) * calcularGini(der);
    if (g < mejorGini) { mejorGini = g; mejorFeature = f; }
  }
  return mejorFeature;
}

function construirNodo(
  ejemplos: Ejemplo[], features: string[], depth: number, getId: () => number
): Nodo {
  const id = getId();
  const pos = ejemplos.filter((e) => e.etiqueta).length;
  const prediccion = pos >= ejemplos.length - pos;
  const gini = calcularGini(ejemplos);

  if (gini === 0 || features.length === 0 || ejemplos.length < 2 || depth >= 3) {
    return { id, feature: null, ejemplos, prediccion, gini };
  }
  const feature = encontrarMejorSplit(ejemplos, features);
  if (!feature) return { id, feature: null, ejemplos, prediccion, gini };

  const rest = features.filter((f) => f !== feature);
  const izqEjs = ejemplos.filter((e) => !e.features[feature]);
  const derEjs = ejemplos.filter((e) => e.features[feature]);

  return {
    id, feature,
    izquierda: izqEjs.length > 0 ? construirNodo(izqEjs, rest, depth + 1, getId) : undefined,
    derecha:   derEjs.length > 0 ? construirNodo(derEjs, rest, depth + 1, getId) : undefined,
    ejemplos, prediccion, gini,
  };
}

function buildTree(ejemplos: Ejemplo[], features: string[]): Nodo | null {
  if (ejemplos.length === 0) return null;
  let c = 0;
  return construirNodo(ejemplos, features, 0, () => c++);
}

// ─── SVG layout ───

const SVG_W = 600;
const SVG_NIVEL_H = 115;
const SVG_Y0 = 55;
const NODO_W = 112;
const NODO_H = 46;

function buildLayout(
  nodo: Nodo | undefined, xMin: number, xMax: number, nivel: number,
  pX: number | null, pY: number | null, esDer: boolean | null, out: NodoLayout[]
): void {
  if (!nodo) return;
  const x = (xMin + xMax) / 2;
  const y = SVG_Y0 + nivel * SVG_NIVEL_H;
  out.push({ nodo, x, y, parentX: pX, parentY: pY, esDerecha: esDer });
  buildLayout(nodo.izquierda, xMin, x, nivel + 1, x, y, false, out);
  buildLayout(nodo.derecha, x, xMax, nivel + 1, x, y, true,  out);
}

function getLayout(raiz: Nodo): NodoLayout[] {
  const out: NodoLayout[] = [];
  buildLayout(raiz, 0, SVG_W, 0, null, null, null, out);
  return out;
}

// ─── Clasificación ───

function clasificar(
  feats: Record<string, boolean>, nodo: Nodo
): { prediccion: boolean; camino: number[] } {
  const camino: number[] = [nodo.id];
  let actual = nodo;
  while (actual.feature) {
    const sig = feats[actual.feature] ? actual.derecha : actual.izquierda;
    if (!sig) break;
    actual = sig;
    camino.push(actual.id);
  }
  return { prediccion: actual.prediccion, camino };
}

// ─── Componente ───

export default function ArbolDecisionIa() {
  const [dsKey, setDsKey] = useState('clima');
  const [ejemplos, setEjemplos] = useState<Ejemplo[]>([]);
  const [nextId, setNextId] = useState(10);
  const [nuevoEj, setNuevoEj] = useState<Record<string, boolean>>({});
  const [resultado, setResultado] = useState<{ prediccion: boolean; camino: number[] } | null>(null);

  const ds = DATASETS[dsKey];

  useEffect(() => {
    setEjemplos(ds.ejemplosIniciales.map((e, i) => ({ ...e, id: i })));
    setNextId(ds.ejemplosIniciales.length);
    setNuevoEj(Object.fromEntries(ds.features.map((f) => [f, false])));
    setResultado(null);
  }, [dsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const arbol = useMemo(() => buildTree(ejemplos, ds.features), [ejemplos, ds.features]);
  const layout = useMemo(() => (arbol ? getLayout(arbol) : []), [arbol]);

  const maxNivel = layout.length > 0
    ? Math.max(...layout.map((l) => Math.round((l.y - SVG_Y0) / SVG_NIVEL_H)))
    : 0;
  const svgH = SVG_Y0 + maxNivel * SVG_NIVEL_H + NODO_H + 30;

  function cambiarDs(key: string) { setDsKey(key); }

  function toggleFeature(id: number, f: string) {
    setEjemplos((prev) => prev.map((e) => e.id === id ? { ...e, features: { ...e.features, [f]: !e.features[f] } } : e));
    setResultado(null);
  }

  function toggleEtiqueta(id: number) {
    setEjemplos((prev) => prev.map((e) => e.id === id ? { ...e, etiqueta: !e.etiqueta } : e));
    setResultado(null);
  }

  function eliminar(id: number) {
    setEjemplos((prev) => prev.filter((e) => e.id !== id));
    setResultado(null);
  }

  function añadir() {
    setEjemplos((prev) => [...prev, {
      id: nextId,
      features: Object.fromEntries(ds.features.map((f) => [f, false])),
      etiqueta: true,
    }]);
    setNextId((n) => n + 1);
    setResultado(null);
  }

  function clasificarNuevo() {
    if (arbol) setResultado(clasificar(nuevoEj, arbol));
  }

  function getNodoFill(nodo: Nodo): string {
    if (!nodo.feature) {
      const pos = nodo.ejemplos.filter((e) => e.etiqueta).length;
      if (pos === nodo.ejemplos.length) return ds.colorSi + '33';
      if (pos === 0) return ds.colorNo + '33';
      return '#e67e22' + '33';
    }
    return '#2E86AB22';
  }

  function getNodoBorde(nodo: Nodo): string {
    if (!nodo.feature) {
      const pos = nodo.ejemplos.filter((e) => e.etiqueta).length;
      if (pos === nodo.ejemplos.length) return ds.colorSi;
      if (pos === 0) return ds.colorNo;
      return '#e67e22';
    }
    return '#2E86AB';
  }

  function getCountLabel(nodo: Nodo): string {
    const pos = nodo.ejemplos.filter((e) => e.etiqueta).length;
    const neg = nodo.ejemplos.length - pos;
    return `${pos}✓ ${neg}✗`;
  }

  const giniStr = (g: number) => g.toFixed(2).replace('.', ',');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Árbol de Decisión Interactivo</h1>
        <p className={styles.heroSubtitle}>
          Añade y edita ejemplos — el árbol de clasificación se reconstruye en tiempo real
        </p>
      </header>
      <LegalNotice />

      <main className={styles.main}>
        {/* Dataset selector */}
        <div className={styles.dsRow} role="group" aria-label="Seleccionar dataset">
          {Object.entries(DATASETS).map(([key, d]) => (
            <button
              key={key}
              className={`${styles.dsPill} ${dsKey === key ? styles.dsPillActivo : ''}`}
              onClick={() => cambiarDs(key)}
              aria-pressed={dsKey === key}
            >
              <span aria-hidden="true">{d.icono}</span> {d.nombre}
              <span className={styles.dsPregunta}>{d.pregunta}</span>
            </button>
          ))}
        </div>

        <div className={styles.editorLayout}>
          {/* Tabla de ejemplos */}
          <div className={styles.tablaPanel}>
            <h2 className={styles.panelTitulo}>
              Ejemplos de entrenamiento
              <span className={styles.contadorBadge}>{ejemplos.length} ejemplos</span>
            </h2>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla} aria-label="Tabla de ejemplos">
                <thead>
                  <tr>
                    {ds.features.map((f) => (
                      <th key={f} className={styles.th}>{ds.featureLabels[f]}</th>
                    ))}
                    <th className={styles.th}>Resultado</th>
                    <th className={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {ejemplos.map((ej) => (
                    <tr key={ej.id} className={styles.tr}>
                      {ds.features.map((f) => (
                        <td key={f} className={styles.td}>
                          <button
                            type="button"
                            className={`${styles.featBtn} ${ej.features[f] ? styles.featBtnOn : styles.featBtnOff}`}
                            onClick={() => toggleFeature(ej.id, f)}
                            aria-pressed={ej.features[f]}
                            aria-label={`${ds.featureLabels[f]}: ${ej.features[f] ? 'Sí' : 'No'}`}
                          >
                            {ej.features[f] ? 'Sí' : 'No'}
                          </button>
                        </td>
                      ))}
                      <td className={styles.td}>
                        <button
                          type="button"
                          className={`${styles.etiquetaBtn} ${ej.etiqueta ? styles.etiquetaBtnSi : styles.etiquetaBtnNo}`}
                          onClick={() => toggleEtiqueta(ej.id)}
                          style={{ borderColor: ej.etiqueta ? ds.colorSi : ds.colorNo, color: ej.etiqueta ? ds.colorSi : ds.colorNo }}
                          aria-label={`Resultado: ${ej.etiqueta ? ds.etiquetaSi : ds.etiquetaNo}. Clic para cambiar.`}
                          aria-pressed={ej.etiqueta}
                        >
                          {ej.etiqueta ? `✓ ${ds.etiquetaSi}` : `✗ ${ds.etiquetaNo}`}
                        </button>
                      </td>
                      <td className={styles.td}>
                        <button type="button" className={styles.eliminarBtn} onClick={() => eliminar(ej.id)} aria-label="Eliminar ejemplo">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className={styles.añadirBtn} onClick={añadir}>
              + Añadir ejemplo
            </button>
          </div>

          {/* Árbol SVG */}
          <div className={styles.treePanel}>
            <h2 className={styles.panelTitulo}>
              Árbol de decisión
              {arbol && <span className={styles.contadorBadge}>Gini raíz: {giniStr(arbol.gini)}</span>}
            </h2>
            {!arbol ? (
              <p className={styles.sinDatos}>Añade al menos 2 ejemplos para construir el árbol.</p>
            ) : (
              <div className={styles.svgWrapper}>
                <svg
                  viewBox={`0 0 ${SVG_W} ${svgH}`}
                  className={styles.svgArbol}
                  aria-label="Árbol de decisión visual"
                  role="img"
                >
                  {/* Líneas de conexión */}
                  {layout.map((nl) => {
                    if (nl.parentX === null || nl.parentY === null) return null;
                    const enCamino = resultado?.camino.includes(nl.nodo.id) ?? false;
                    const midX = (nl.parentX + nl.x) / 2;
                    const midY = (nl.parentY + nl.y) / 2;
                    return (
                      <g key={`line-${nl.nodo.id}`}>
                        <line
                          x1={nl.parentX} y1={nl.parentY + NODO_H / 2}
                          x2={nl.x} y2={nl.y - NODO_H / 2}
                          stroke={enCamino ? '#e67e22' : '#CCCCCC'}
                          strokeWidth={enCamino ? 2.5 : 1.5}
                        />
                        <text x={midX} y={midY - 4} textAnchor="middle" fontSize="10" fill={enCamino ? '#e67e22' : '#888888'} fontWeight={enCamino ? 700 : 400}>
                          {nl.esDerecha ? 'Sí' : 'No'}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodos */}
                  {layout.map((nl) => {
                    const { nodo, x, y } = nl;
                    const fill = getNodoFill(nodo);
                    const stroke = getNodoBorde(nodo);
                    const enCamino = resultado?.camino.includes(nodo.id) ?? false;
                    const esFinal = resultado?.camino[resultado.camino.length - 1] === nodo.id;
                    const pos = nodo.ejemplos.filter((e) => e.etiqueta).length;
                    const texto = nodo.feature
                      ? ds.svgLabels[nodo.feature]
                      : (pos === nodo.ejemplos.length ? `✓ ${ds.etiquetaSi}` : pos === 0 ? `✗ ${ds.etiquetaNo}` : pos > nodo.ejemplos.length - pos ? `✓ ${ds.etiquetaSi}` : `✗ ${ds.etiquetaNo}`);
                    return (
                      <g key={`nodo-${nodo.id}`}>
                        <rect
                          x={x - NODO_W / 2} y={y - NODO_H / 2}
                          width={NODO_W} height={NODO_H}
                          rx="8" fill={fill}
                          stroke={enCamino ? (esFinal ? '#e67e22' : stroke) : stroke}
                          strokeWidth={enCamino ? (esFinal ? 3 : 2.5) : 1.5}
                        />
                        <text x={x} y={y - 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={stroke}>
                          {texto}
                        </text>
                        <text x={x} y={y + 10} textAnchor="middle" fontSize="9" fill="#888888">
                          {getCountLabel(nodo)} · Gini {giniStr(nodo.gini)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Clasificador */}
        {arbol && (
          <section className={styles.clasificadorSection} aria-labelledby="clasif-titulo">
            <h2 id="clasif-titulo" className={styles.clasifTitulo}>
              Clasifica un nuevo ejemplo
            </h2>
            <p className={styles.clasifDesc}>
              Configura las características y el árbol mostrará el camino y la predicción.
            </p>
            <div className={styles.clasifGrid}>
              {ds.features.map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`${styles.clasifFeatBtn} ${nuevoEj[f] ? styles.clasifFeatBtnOn : styles.clasifFeatBtnOff}`}
                  onClick={() => { setNuevoEj((prev) => ({ ...prev, [f]: !prev[f] })); setResultado(null); }}
                  aria-pressed={nuevoEj[f]}
                >
                  <span className={styles.clasifFeatLabel}>{ds.featureLabels[f]}</span>
                  <span className={styles.clasifFeatValor}>{nuevoEj[f] ? 'Sí' : 'No'}</span>
                </button>
              ))}
            </div>
            <button type="button" className={styles.clasifBtn} onClick={clasificarNuevo}>
              <span aria-hidden="true">▶</span> Clasificar
            </button>
            {resultado && (
              <div
                className={styles.resultadoBox}
                style={{ borderColor: resultado.prediccion ? ds.colorSi : ds.colorNo }}
                role="status" aria-live="polite"
              >
                <span className={styles.resultadoIcono} style={{ color: resultado.prediccion ? ds.colorSi : ds.colorNo }}>
                  {resultado.prediccion ? '✓' : '✗'}
                </span>
                <div>
                  <p className={styles.resultadoTexto}>
                    Predicción: <strong style={{ color: resultado.prediccion ? ds.colorSi : ds.colorNo }}>
                      {resultado.prediccion ? ds.etiquetaSi : ds.etiquetaNo}
                    </strong>
                  </p>
                  <p className={styles.resultadoCamino}>
                    Ruta: {resultado.camino.length} nodo{resultado.camino.length !== 1 ? 's' : ''} recorrido{resultado.camino.length !== 1 ? 's' : ''}
                    {' '}(trayectoria resaltada en naranja en el árbol)
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Cómo aprende una máquina a clasificar"
        subtitle="Árboles de decisión, impureza Gini y machine learning explicados"
      >
        <p>
          Un <strong>árbol de decisión</strong> es uno de los algoritmos de machine learning más intuitivos. Aprende a clasificar datos tomando una serie de decisiones binarias basadas en las características de cada ejemplo — igual que un diagrama de flujo de diagnóstico. La clave está en cómo decide <em>qué pregunta hacer primero</em>: elige la característica que mejor separa las clases, medida por la <strong>impureza Gini</strong>.
        </p>
        <p>
          Gini mide qué tan mezcladas están las clases en un grupo. Si todos los ejemplos son de la misma clase, Gini = 0 (puro). Si hay un 50/50, Gini = 0,5 (máximo desorden). El algoritmo prueba todas las características disponibles y elige la que más reduce el Gini al dividir los datos. Este proceso se repite recursivamente hasta que los nodos son puros o se alcanza la profundidad máxima.
        </p>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Comparativa de algoritmos de árbol
        </h4>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr><th>Algoritmo</th><th>Criterio de split</th><th>Tipo de árbol</th><th>Uso típico</th></tr>
            </thead>
            <tbody>
              <tr><td>ID3</td><td>Ganancia de información (entropía)</td><td>Múltiples ramas</td><td>Datos categóricos</td></tr>
              <tr><td>CART</td><td>Gini impurity (este visualizador)</td><td>Siempre binario</td><td>Clasificación y regresión</td></tr>
              <tr><td>C4.5</td><td>Ratio de ganancia</td><td>Múltiples ramas</td><td>Mejora de ID3</td></tr>
              <tr><td>Random Forest</td><td>Gini en subconjuntos aleatorios</td><td>Ensemble de árboles</td><td>Alta precisión</td></tr>
              <tr><td>XGBoost / GBM</td><td>Gradient boosting</td><td>Árboles secuenciales</td><td>Competiciones de datos</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Casos de uso reales
        </h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🏥</span> Diagnóstico médico</strong>
            <p>Características: síntomas, edad, historial. Clasifica en grupos de riesgo o posibles diagnósticos. Valorado por su interpretabilidad.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🏦</span> Riesgo crediticio</strong>
            <p>Características: ingresos, historial, deuda. Predice si un préstamo será devuelto. Los bancos prefieren árboles porque pueden explicar la decisión.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">📧</span> Filtro de spam</strong>
            <p>Características: palabras clave, remitente, formato. Uno de los primeros usos del ML. Los filtros modernos usan ensembles de árboles.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🛒</span> Segmentación de clientes</strong>
            <p>Características: historial de compra, demografía. Predice qué clientes comprarán o abandonarán. Base de sistemas de recomendación.</p>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Preguntas frecuentes
        </h4>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué significa que un nodo tenga Gini = 0?</strong>
            <span>Significa que todos los ejemplos en ese nodo pertenecen a la misma clase — el nodo es puro. En el árbol se convierte en una hoja con una predicción con 100% de certeza sobre los datos de entrenamiento.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el árbol puede cambiar completamente al añadir un solo ejemplo?</strong>
            <span>Porque el algoritmo reevalúa qué característica produce la mejor separación desde la raíz. Un ejemplo nuevo puede cambiar las proporciones suficiente para que otra característica pase a ser la mejor opción en el nodo raíz, reorganizando todo el árbol.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el sobreajuste en árboles de decisión?</strong>
            <span>Un árbol muy profundo memoriza los datos de entrenamiento perfectamente (Gini=0 en todas las hojas) pero falla con datos nuevos. Se controla limitando la profundidad máxima, el número mínimo de ejemplos por nodo, o usando poda (pruning). El árbol de este visualizador tiene profundidad máxima 3 para evitarlo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre árbol de decisión y Random Forest?</strong>
            <span>Un Random Forest entrena cientos de árboles, cada uno con un subconjunto aleatorio de características y ejemplos, y combina sus predicciones por votación. Es mucho más preciso que un solo árbol y más resistente al sobreajuste, pero pierde interpretabilidad.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Este árbol puede usarse con datos reales fuera del visualizador?</strong>
            <span>El visualizador usa una implementación simplificada en el navegador para fines educativos. Para producción, usa scikit-learn (Python) con DecisionTreeClassifier, que implementa CART con soporte para datos continuos, poda, y métricas de evaluación completas.</span>
          </li>
        </ul>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Ciclo completo de un árbol de decisión real
        </h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Recoger y limpiar datos</strong> — obtener ejemplos etiquetados (cada fila = un ejemplo con sus características y la clase correcta). Limpiar valores faltantes y codificar categorías.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Dividir en entrenamiento y test</strong> — reservar el 20-30% de los datos para evaluar el árbol al final. Nunca usar datos de test durante el entrenamiento.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Entrenar y ajustar la profundidad</strong> — usar validación cruzada para encontrar la profundidad máxima que minimiza el error sin sobreajustar.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Evaluar con datos de test</strong> — medir precisión, recall, F1-score y matriz de confusión. Si los resultados son insuficientes, considerar Random Forest o Gradient Boosting.
            </div>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Buenas prácticas
        </h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <strong>Balancea las clases</strong>
            Si tienes 95% de ejemplos negativos y 5% positivos, el árbol tenderá a predecir siempre negativo. Usa técnicas como SMOTE o pesos de clase.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✂️</span>
            <strong>Poda el árbol</strong>
            Un árbol con Gini=0 en todas las hojas es sospechoso — está memorizando, no aprendiendo. Limita la profundidad o usa min_samples_leaf.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <strong>Valida con datos nuevos</strong>
            La única forma de saber si el árbol funciona es probarlo con datos que no vio en el entrenamiento.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌲</span>
            <strong>Considera Random Forest</strong>
            Si la precisión del árbol es insuficiente, Random Forest casi siempre mejora los resultados con poco esfuerzo adicional.
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con árboles de decisión</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Usar el árbol sin datos de test — un Gini=0 en entrenamiento no garantiza nada sobre datos nuevos.</li>
            <li>Ignorar el desbalanceo de clases — un árbol entrenado con datos desbalanceados predice casi siempre la clase mayoritaria.</li>
            <li>Mezclar datos de entrenamiento y test — contamina la evaluación y produce métricas falsamente optimistas.</li>
            <li>Asumir que el árbol captura relaciones complejas — los árboles simples funcionan mal con patrones no lineales o de alta dimensión.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('arbol-decision-ia')} />
      <ShareCard appName="arbol-decision-ia" />
      <Footer appName="arbol-decision-ia" />
    </div>
  );
}
