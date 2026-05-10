'use client';
// @disclaimer: exempt

import { useState, useRef, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorHashingColisiones.module.css';

// ============================================================
// Tipos
// ============================================================

type FuncionHash = 'mod' | 'poli' | 'djb2';
type ResolucionHash = 'encadenamiento' | 'sondeo';
type TamanoTabla = 7 | 11 | 13 | 17;

interface CeldaHash {
  elementos: string[];
}

interface EstadoTabla {
  celdas: CeldaHash[];
  ultimoIndice: number | null;
  ultimoRecorrido: number[];
  colisiones: number;
}

// ============================================================
// Conjuntos de palabras predefinidas
// ============================================================

const SETS_PALABRAS: Record<string, string[]> = {
  nombres: ['Ana', 'Ben', 'Carlos', 'Diana', 'Eva', 'Fran', 'Gloria', 'Hugo', 'Iris', 'Juan'],
  colores: ['rojo', 'azul', 'verde', 'gris', 'rosa', 'negro', 'blanco', 'violeta', 'ocre', 'cyan'],
  frutas: [
    'manzana',
    'pera',
    'uva',
    'kiwi',
    'mango',
    'ciruela',
    'fresa',
    'melon',
    'sandía',
    'higo',
  ],
  ciudades: [
    'Madrid',
    'Lima',
    'Bogotá',
    'Miami',
    'Roma',
    'Oslo',
    'Tokio',
    'Cairo',
    'Hanoi',
    'Quito',
  ],
  codigo: [
    'array',
    'stack',
    'queue',
    'tree',
    'graph',
    'hash',
    'heap',
    'node',
    'link',
    'sort',
  ],
};

// ============================================================
// Funciones hash
// ============================================================

function sumaAscii(clave: string, m: number): { indice: number; calculo: string } {
  const suma = [...clave].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    indice: suma % m,
    calculo: `suma_ascii("${clave}") = ${[...clave]
      .map((c) => c.charCodeAt(0))
      .join('+')} = ${suma} → ${suma} mod ${m} = ${suma % m}`,
  };
}

function hashPolinomica(clave: string, m: number): { indice: number; calculo: string } {
  const BASE = 31;
  let hash = 0;
  for (let i = 0; i < clave.length; i++) {
    hash = (hash * BASE + clave.charCodeAt(i)) % m;
  }
  return {
    indice: hash,
    calculo: `h_poli("${clave}", base=${BASE}) = (acumulado char por char) mod ${m} = ${hash}`,
  };
}

function djb2(clave: string, m: number): { indice: number; calculo: string } {
  let hash = 5381;
  for (let i = 0; i < clave.length; i++) {
    hash = ((hash << 5) + hash + clave.charCodeAt(i)) & 0x7fffffff;
  }
  const indice = hash % m;
  return {
    indice,
    calculo: `djb2("${clave}") = ${hash} → ${hash} mod ${m} = ${indice}`,
  };
}

function calcularHash(
  clave: string,
  fn: FuncionHash,
  m: number,
): { indice: number; calculo: string } {
  switch (fn) {
    case 'mod':
      return sumaAscii(clave, m);
    case 'poli':
      return hashPolinomica(clave, m);
    case 'djb2':
      return djb2(clave, m);
  }
}

// ============================================================
// Lógica de inserción
// ============================================================

function insertarEnTabla(
  estado: EstadoTabla,
  clave: string,
  fn: FuncionHash,
  m: number,
  resolucion: ResolucionHash,
): { nuevoEstado: EstadoTabla; calculo: string; colision: boolean } {
  const { indice, calculo } = calcularHash(clave, fn, m);
  const nuevasCeldas: CeldaHash[] = estado.celdas.map((c) => ({
    elementos: [...c.elementos],
  }));

  if (resolucion === 'encadenamiento') {
    const yaExiste = nuevasCeldas[indice].elementos.includes(clave);
    const colision = nuevasCeldas[indice].elementos.length > 0 && !yaExiste;
    if (!yaExiste) {
      nuevasCeldas[indice].elementos.push(clave);
    }
    return {
      nuevoEstado: {
        celdas: nuevasCeldas,
        ultimoIndice: indice,
        ultimoRecorrido: [indice],
        colisiones: estado.colisiones + (colision ? 1 : 0),
      },
      calculo,
      colision,
    };
  }

  // Sondeo lineal
  const recorrido: number[] = [];
  let pos = indice;
  let colision = false;

  for (let i = 0; i < m; i++) {
    const intento = (indice + i) % m;
    recorrido.push(intento);
    if (i > 0) colision = true;
    const celda = nuevasCeldas[intento];
    if (celda.elementos.length === 0) {
      celda.elementos.push(clave);
      pos = intento;
      break;
    }
    if (celda.elementos[0] === clave) {
      pos = intento;
      colision = false;
      break;
    }
  }

  return {
    nuevoEstado: {
      celdas: nuevasCeldas,
      ultimoIndice: pos,
      ultimoRecorrido: recorrido,
      colisiones: estado.colisiones + (colision ? 1 : 0),
    },
    calculo,
    colision,
  };
}

function crearTablaVacia(m: number): EstadoTabla {
  return {
    celdas: Array.from({ length: m }, () => ({ elementos: [] })),
    ultimoIndice: null,
    ultimoRecorrido: [],
    colisiones: 0,
  };
}

// ============================================================
// Componente principal
// ============================================================

export default function SimuladorHashingColisiones() {
  const [tamano, setTamano] = useState<TamanoTabla>(11);
  const [funcionHash, setFuncionHash] = useState<FuncionHash>('djb2');
  const [resolucion, setResolucion] = useState<ResolucionHash>('encadenamiento');
  const [setActual, setSetActual] = useState<string>('nombres');
  const [tabla, setTabla] = useState<EstadoTabla>(() => crearTablaVacia(11));
  const [indiceSet, setIndiceSet] = useState<number>(0);
  const [calculoVisible, setCalculoVisible] = useState<string>('');
  const [ultimaColision, setUltimaColision] = useState<boolean>(false);
  const [palabraPropia, setPalabraPropia] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [celdaAnimando, setCeldaAnimando] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalElementos = tabla.celdas.reduce((acc, c) => acc + c.elementos.length, 0);
  const factorCarga = tamano > 0 ? totalElementos / tamano : 0;
  const factorPct = Math.min(factorCarga * 100, 100);

  const animarCelda = useCallback(
    (indice: number) => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      setCeldaAnimando(indice);
      timeoutRef.current = setTimeout(() => {
        setCeldaAnimando(null);
        timeoutRef.current = null;
      }, 900);
    },
    [],
  );

  const resetearTabla = useCallback(
    (nuevoTamano?: TamanoTabla, nuevaFn?: FuncionHash, nuevaRes?: ResolucionHash) => {
      const m = nuevoTamano ?? tamano;
      setTabla(crearTablaVacia(m));
      setIndiceSet(0);
      setCalculoVisible('');
      setUltimaColision(false);
      setCeldaAnimando(null);
      if (nuevoTamano) setTamano(nuevoTamano);
      if (nuevaFn) setFuncionHash(nuevaFn);
      if (nuevaRes) setResolucion(nuevaRes);
    },
    [tamano],
  );

  const insertar = useCallback(
    (clave: string) => {
      if (!clave.trim()) return;
      const { nuevoEstado, calculo, colision } = insertarEnTabla(
        tabla,
        clave.trim(),
        funcionHash,
        tamano,
        resolucion,
      );
      setTabla(nuevoEstado);
      setCalculoVisible(calculo);
      setUltimaColision(colision);
      if (nuevoEstado.ultimoIndice !== null) {
        animarCelda(nuevoEstado.ultimoIndice);
      }
    },
    [tabla, funcionHash, tamano, resolucion, animarCelda],
  );

  const insertarSiguiente = useCallback(() => {
    const palabras = SETS_PALABRAS[setActual] ?? [];
    if (indiceSet >= palabras.length) return;
    const clave = palabras[indiceSet];
    insertar(clave);
    setIndiceSet((i) => i + 1);
  }, [setActual, indiceSet, insertar]);

  const insertarTodas = useCallback(() => {
    const palabras = SETS_PALABRAS[setActual] ?? [];
    let estadoAcum = tabla;
    const pendientes = palabras.slice(indiceSet);
    for (const clave of pendientes) {
      const { nuevoEstado, calculo, colision } = insertarEnTabla(
        estadoAcum,
        clave,
        funcionHash,
        tamano,
        resolucion,
      );
      estadoAcum = nuevoEstado;
      setCalculoVisible(calculo);
      setUltimaColision(colision);
    }
    setTabla(estadoAcum);
    setIndiceSet(palabras.length);
    if (estadoAcum.ultimoIndice !== null) {
      animarCelda(estadoAcum.ultimoIndice);
    }
  }, [setActual, indiceSet, tabla, funcionHash, tamano, resolucion, animarCelda]);

  const insertarPalabra = useCallback(() => {
    const clave = palabraPropia.trim();
    if (!clave) return;
    insertar(clave);
    setPalabraPropia('');
    inputRef.current?.focus();
  }, [palabraPropia, insertar]);

  const palabrasSet = SETS_PALABRAS[setActual] ?? [];
  const quedan = palabrasSet.length - indiceSet;

  const calcularClaseCelda = (idx: number, celda: CeldaHash): string => {
    const clases: string[] = [styles.celdaHash];
    if (celda.elementos.length === 0) {
      clases.push(styles.celdaVacia);
    } else if (
      resolucion === 'encadenamiento' && celda.elementos.length > 1
    ) {
      clases.push(styles.celdaColision);
    } else if (
      resolucion === 'sondeo' &&
      tabla.ultimoRecorrido.length > 1 &&
      tabla.ultimoRecorrido.slice(0, -1).includes(idx) &&
      idx !== tabla.ultimoIndice
    ) {
      clases.push(styles.celdaColision);
    } else {
      clases.push(styles.celdaOcupada);
    }
    if (idx === celdaAnimando) {
      clases.push(styles.insertando);
    }
    return clases.join(' ');
  };

  const TAMANOS: TamanoTabla[] = [7, 11, 13, 17];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.titulo}>Hashing y Colisiones</h1>
        <p className={styles.subtitulo}>
          Visualiza tablas hash, funciones hash y estrategias de resolución de colisiones
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ─── Controles ─── */}
        <section className={styles.controlPanel} aria-label="Parámetros de la tabla hash">
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Tamaño m (primo)</span>
            <div className={styles.botonesGrupo} role="group" aria-label="Tamaño de tabla">
              {TAMANOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.btnOpcion} ${tamano === t ? styles.btnOpcionActivo : ''}`}
                  onClick={() => resetearTabla(t)}
                  aria-pressed={tamano === t}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Función hash</span>
            <div className={styles.botonesGrupo} role="group" aria-label="Función hash">
              {(
                [
                  { id: 'mod' as FuncionHash, label: 'Suma ASCII mod m' },
                  { id: 'poli' as FuncionHash, label: 'Polinómica mod m' },
                  { id: 'djb2' as FuncionHash, label: 'djb2 mod m' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.btnOpcion} ${funcionHash === id ? styles.btnOpcionActivo : ''}`}
                  onClick={() => resetearTabla(undefined, id)}
                  aria-pressed={funcionHash === id}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Resolución de colisiones</span>
            <div className={styles.botonesGrupo} role="group" aria-label="Resolución">
              <button
                type="button"
                className={`${styles.btnOpcion} ${resolucion === 'encadenamiento' ? styles.btnOpcionActivo : ''}`}
                onClick={() => resetearTabla(undefined, undefined, 'encadenamiento')}
                aria-pressed={resolucion === 'encadenamiento'}
              >
                Encadenamiento
              </button>
              <button
                type="button"
                className={`${styles.btnOpcion} ${resolucion === 'sondeo' ? styles.btnOpcionActivo : ''}`}
                onClick={() => resetearTabla(undefined, undefined, 'sondeo')}
                aria-pressed={resolucion === 'sondeo'}
              >
                Sondeo lineal
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="setSelect" className={styles.controlLabel}>
              Conjunto de palabras
            </label>
            <select
              id="setSelect"
              className={styles.selectSet}
              value={setActual}
              onChange={(e) => {
                setSetActual(e.target.value);
                resetearTabla();
              }}
            >
              <option value="nombres">Nombres (Ana, Ben…)</option>
              <option value="colores">Colores (rojo, azul…)</option>
              <option value="frutas">Frutas (manzana, pera…)</option>
              <option value="ciudades">Ciudades (Madrid, Lima…)</option>
              <option value="codigo">Programación (array, stack…)</option>
            </select>
          </div>
        </section>

        {/* ─── Tabla hash visual ─── */}
        <section className={styles.tablaSeccion} aria-label="Tabla hash visual">
          <h2 className={styles.seccionTitulo}>
            Tabla hash — m = {tamano}
          </h2>

          <div
            className={styles.tablaGrid}
            style={{ gridTemplateColumns: `repeat(${tamano}, 1fr)` }}
            role="list"
            aria-label={`Tabla hash de tamaño ${tamano}`}
          >
            {tabla.celdas.map((celda, idx) => (
              <div
                key={idx}
                className={calcularClaseCelda(idx, celda)}
                role="listitem"
                aria-label={`Celda ${idx}: ${celda.elementos.length === 0 ? 'vacía' : celda.elementos.join(', ')}`}
                title={
                  celda.elementos.length > 0
                    ? `Índice ${idx}: ${celda.elementos.join(', ')}`
                    : `Índice ${idx}: vacío`
                }
              >
                <span className={styles.celdaIndice}>{idx}</span>

                {resolucion === 'encadenamiento' && celda.elementos.length > 0 && (
                  <div className={styles.chipZona}>
                    {celda.elementos.map((el, i) => (
                      <span key={i} className={styles.chip}>
                        {el}
                      </span>
                    ))}
                  </div>
                )}

                {resolucion === 'sondeo' && celda.elementos.length > 0 && (
                  <span className={styles.sondeoLabel}>{celda.elementos[0]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Flecha sondeo lineal */}
          {resolucion === 'sondeo' &&
            tabla.ultimoRecorrido.length > 1 &&
            tabla.ultimoIndice !== null && (
              <div className={styles.sondeoInfo} role="status" aria-live="polite">
                <span aria-hidden="true">→</span> Sondeo: probó{' '}
                {tabla.ultimoRecorrido.slice(0, -1).join(' → ')} antes de insertar en{' '}
                <strong>{tabla.ultimoIndice}</strong>
              </div>
            )}
        </section>

        {/* ─── Panel de inserción ─── */}
        <section className={styles.insercionPanel} aria-label="Insertar palabras">
          <div className={styles.botonesInsercion}>
            <button
              type="button"
              className={styles.btnPrimario}
              onClick={insertarSiguiente}
              disabled={quedan === 0}
              aria-label={quedan > 0 ? `Insertar siguiente: ${palabrasSet[indiceSet]}` : 'No quedan palabras'}
            >
              Insertar siguiente{quedan > 0 ? ` (${palabrasSet[indiceSet]})` : ''}
            </button>

            <button
              type="button"
              className={styles.btnSecundario}
              onClick={insertarTodas}
              disabled={quedan === 0}
            >
              Insertar todas ({quedan})
            </button>

            <button
              type="button"
              className={styles.btnLimpiar}
              onClick={() => resetearTabla()}
            >
              Limpiar tabla
            </button>
          </div>

          <div className={styles.inputPropio}>
            <label htmlFor="inputPalabra" className={styles.controlLabel}>
              Escribe una palabra propia
            </label>
            <div className={styles.inputRow}>
              <input
                ref={inputRef}
                id="inputPalabra"
                type="text"
                className={styles.inputTexto}
                value={palabraPropia}
                onChange={(e) => setPalabraPropia(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') insertarPalabra();
                }}
                placeholder="Ej: python, clave123…"
                maxLength={30}
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.btnPrimario}
                onClick={insertarPalabra}
                disabled={!palabraPropia.trim()}
              >
                Insertar
              </button>
            </div>
          </div>
        </section>

        {/* ─── Cálculo hash visible ─── */}
        {calculoVisible && (
          <div
            className={`${styles.calculoPanel} ${ultimaColision ? styles.calculoPanelColision : ''}`}
            role="status"
            aria-live="polite"
          >
            <span className={styles.calculoIcono} aria-hidden="true">
              {ultimaColision ? '🔴' : '🔵'}
            </span>
            <span className={styles.calculoTexto}>{calculoVisible}</span>
            {ultimaColision && (
              <span className={styles.colisionBadge}>¡Colisión!</span>
            )}
          </div>
        )}

        {/* ─── Estadísticas ─── */}
        <section className={styles.statsPanel} aria-label="Estadísticas de la tabla hash">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Elementos (n)</span>
            <span className={styles.statValor}>{totalElementos}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Tamaño (m)</span>
            <span className={styles.statValor}>{tamano}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Colisiones</span>
            <span className={`${styles.statValor} ${tabla.colisiones > 0 ? styles.statValorRojo : ''}`}>
              {tabla.colisiones}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Factor de carga α</span>
            <span
              className={`${styles.statValor} ${factorCarga > 0.75 ? styles.statValorRojo : ''}`}
            >
              {factorCarga.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Barra factor de carga */}
        <div className={styles.factorBarraContenedor} aria-label={`Factor de carga: ${(factorCarga * 100).toFixed(0)}%`}>
          <div className={styles.factorBarraTexto}>
            <span>Factor de carga α = n/m</span>
            <span
              className={factorCarga > 0.75 ? styles.alertaAlta : ''}
            >
              {factorCarga > 0.75 ? '⚠ α > 0,75 — rendimiento degradado' : `α = ${factorCarga.toFixed(2)}`}
            </span>
          </div>
          <div className={styles.factorBarraFondo}>
            <div
              className={`${styles.barraFactorCarga} ${factorCarga > 0.75 ? styles.barraAlta : ''}`}
              style={{ width: `${factorPct}%` }}
              role="progressbar"
              aria-valuenow={Math.round(factorPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Leyenda */}
        <div className={styles.leyenda} aria-label="Leyenda de colores">
          <span className={styles.leyendaItem}>
            <span className={`${styles.leyendaDot} ${styles.dotVacia}`} aria-hidden="true" /> Vacía
          </span>
          <span className={styles.leyendaItem}>
            <span className={`${styles.leyendaDot} ${styles.dotOcupada}`} aria-hidden="true" /> Ocupada
          </span>
          <span className={styles.leyendaItem}>
            <span className={`${styles.leyendaDot} ${styles.dotColision}`} aria-hidden="true" /> Colisión
          </span>
          <span className={styles.leyendaItem}>
            <span className={`${styles.leyendaDot} ${styles.dotInsertando}`} aria-hidden="true" /> Insertando
          </span>
        </div>
      </main>

      {/* ─── Sección educativa v2.0 ─── */}
      <EducationalSection
        title="Guía de Tablas Hash y Colisiones"
        subtitle="Funciones hash, resolución de colisiones y factor de carga"
        icon="🗂️"
      >
        {/* Intro */}
        <p className={styles.introParagraph}>
          Una tabla hash almacena pares clave-valor en posiciones calculadas por una función hash h(k).
          Cuando dos claves producen el mismo índice ocurre una <strong>colisión</strong>, que se resuelve
          con <strong>encadenamiento</strong> (listas enlazadas en cada celda) o{' '}
          <strong>sondeo lineal</strong> (buscar el siguiente hueco disponible). Un buen{' '}
          <strong>factor de carga α &lt; 0,75</strong> garantiza O(1) promedio en búsquedas e inserciones.
        </p>

        {/* Tabla comparativa */}
        <h3>Comparativa de Estrategias</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Resolución</th>
                <th>Ventaja</th>
                <th>Desventaja</th>
                <th>Rendimiento promedio</th>
                <th>Sensible a α</th>
                <th>Uso real</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Encadenamiento separado</strong></td>
                <td>Sin límite de carga</td>
                <td>Memoria extra por punteros</td>
                <td>O(1 + α)</td>
                <td>Moderado</td>
                <td>Java HashMap, Python dict</td>
              </tr>
              <tr>
                <td><strong>Sondeo lineal</strong></td>
                <td>Caché-friendly</td>
                <td>Clustering primario</td>
                <td>O(1/(1-α))</td>
                <td>Alto</td>
                <td>Redis, TablaHash C++</td>
              </tr>
              <tr>
                <td><strong>Sondeo cuadrático</strong></td>
                <td>Menos clustering</td>
                <td>Clustering secundario</td>
                <td>O(1/(1-α))</td>
                <td>Alto</td>
                <td>PostgreSQL</td>
              </tr>
              <tr>
                <td><strong>Doble hashing</strong></td>
                <td>Distribución uniforme</td>
                <td>Más costoso de calcular</td>
                <td>O(1/(1-α))</td>
                <td>Muy alto</td>
                <td>Cuckoo hashing</td>
              </tr>
              <tr>
                <td><strong>Cuckoo hashing</strong></td>
                <td>Worst-case O(1)</td>
                <td>Rehash frecuente</td>
                <td>O(1) garantizado</td>
                <td>Extremo</td>
                <td>Redes (packet lookup)</td>
              </tr>
              <tr>
                <td><strong>Árbol rojo-negro (alternativa)</strong></td>
                <td>O(log n) garantizado</td>
                <td>Más lento en promedio</td>
                <td>O(log n)</td>
                <td>No</td>
                <td>Java TreeMap, std::map</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios */}
        <h3>Escenarios de Uso</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">✅</span>
              <strong>Diccionario sin colisiones</strong>
            </div>
            <p className={styles.escenarioDesc}>
              m = 17, 8 palabras cortas, función djb2 → distribución casi perfecta, 0 colisiones.
              El factor de carga α ≈ 0,47 mantiene O(1) garantizado.
            </p>
            <div className={styles.escenarioTip}>Prueba: set «programación» con m=17 y djb2.</div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">⚠️</span>
              <strong>Alta carga (α &gt; 0,75)</strong>
            </div>
            <p className={styles.escenarioDesc}>
              m = 7, insertar 8 palabras → α ≈ 1,14 con sondeo lineal o cadenas largas.
              Las colisiones crecen exponencialmente y el tiempo de búsqueda se degrada.
            </p>
            <div className={styles.escenarioTip}>Prueba: cualquier set con m=7, insertar todas.</div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔗</span>
              <strong>Clustering en sondeo lineal</strong>
            </div>
            <p className={styles.escenarioDesc}>
              m = 11, palabras con hashes consecutivos → sondeo lineal agrupa elementos
              en bloques («clustering primario»), degradando búsquedas en esa zona.
            </p>
            <div className={styles.escenarioTip}>Prueba: set «nombres» con m=11 y sondeo lineal.</div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📦</span>
              <strong>Ventaja del encadenamiento</strong>
            </div>
            <p className={styles.escenarioDesc}>
              m = 7, insertar 10 palabras → con encadenamiento la tabla funciona aunque α &gt; 1;
              con sondeo lineal se llena y necesitaría rehash para continuar.
            </p>
            <div className={styles.escenarioTip}>Compara encadenamiento vs sondeo con m=7, todas las palabras.</div>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué usar números primos como tamaño de tabla?</h4>
            <p>
              Los tamaños primos reducen la periodicidad de las colisiones al aplicar mod. Si m tiene
              divisores comunes con los hashes generados, ciertos índices nunca se usan y otros se
              sobrecargan. Con m primo, la función mod distribuye los valores más uniformemente.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué ocurre cuando α &gt; 1 con sondeo lineal?</h4>
            <p>
              La tabla está completamente llena: cualquier nueva inserción entraría en bucle infinito
              buscando un hueco que no existe. Por eso, las implementaciones reales hacen{' '}
              <strong>rehashing</strong> automático cuando α supera un umbral (típicamente 0,75),
              creando una tabla mayor y reinsertando todos los elementos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Python usa tablas hash?</h4>
            <p>
              Sí. <code>dict</code> y <code>set</code> en Python son tablas hash con{' '}
              <em>open addressing</em> y sondeo cuadrático modificado. Desde Python 3.6, los dicts
              también preservan el orden de inserción gracias a una estructura auxiliar compacta.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo afecta la función hash a las colisiones?</h4>
            <p>
              Una función hash pobre (como suma de caracteres para cadenas cortas) agrupa muchas claves
              en pocos índices. djb2 aplica multiplicaciones que dispersan mejor los valores. Una buena
              función hash hace que la distribución de índices sea aproximadamente uniforme.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el rehashing?</h4>
            <p>
              Cuando α supera un umbral (0,75 típico), se crea una tabla nueva de tamaño mayor (generalmente
              el siguiente primo después de 2×m) y se reinsertan todos los elementos usando la misma función
              hash con el nuevo m. Esta operación es O(n) pero amortizada resulta O(1) por inserción.
            </p>
          </div>
        </div>

        {/* Pasos */}
        <h3>Cómo Usar el Simulador — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Selecciona tamaño m y función hash</strong>
              <p>Empieza con m = 11 y djb2: es el tamaño y función más equilibrados para ver la distribución.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Elige un conjunto de palabras predefinido</strong>
              <p>El conjunto «nombres» o «programación» dan buen contraste de colisiones según la función elegida.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Pulsa «Insertar siguiente» y observa</strong>
              <p>
                Cada inserción muestra el cálculo paso a paso del índice hash debajo de la tabla.
                Las celdas se colorean según el estado.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Cambia a sondeo lineal y repite</strong>
              <p>Limpiar la tabla, cambiar a sondeo lineal e insertar el mismo conjunto revela diferencias de distribución.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Aumenta la carga hasta α &gt; 0,75</strong>
              <p>Usa m = 7 e inserta todas las palabras para ver cómo crecen las colisiones y se degrada el rendimiento.</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <h3>Consejos Prácticos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <strong>Elige siempre m primo</strong>
            <p>Un tamaño primo reduce colisiones porque ningún divisor común «agrupa» los hashes.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <strong>djb2 es rápido y fiable</strong>
            <p>Función hash simple y veloz usada en compiladores y shells UNIX. Buen equilibrio distribución/coste.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <strong>α es el indicador clave</strong>
            <p>El factor de carga α = n/m es el mejor indicador del rendimiento. Mantén α &lt; 0,75.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Rehash antes de saturar</strong>
            <p>Las implementaciones reales hacen rehash automático al superar α = 0,75 para mantener O(1).</p>
          </div>
        </div>

        {/* Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con tablas hash</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Usar m potencia de 2 con hash mod — aumenta colisiones si la función no distribuye bien
              los bits bajos.
            </li>
            <li>
              Olvidar que sondeo lineal puede quedar en bucle infinito con α = 1: siempre implementar
              un contador de intentos o rehash preventivo.
            </li>
            <li>
              Comparar hashes directamente sin aplicar mod m — los valores raw son enormes y no
              corresponden a índices válidos de la tabla.
            </li>
            <li>
              Asumir O(1) en worst case — solo es O(1) en caso <em>promedio</em>; con mala función hash
              o α elevado degenera a O(n).
            </li>
            <li>
              No hacer rehash cuando α crece — la tabla se degrada progresivamente hasta ser O(n) en
              búsquedas, perdiendo la ventaja de la estructura.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-hashing-colisiones')} />

      <ShareCard appName="simulador-hashing-colisiones" />

      <Footer appName="simulador-hashing-colisiones" />
    </div>
  );
}
