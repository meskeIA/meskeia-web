'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorSqlJoin.module.css';

// ============================================
// TIPOS
// ============================================
type TipoJoin = 'inner' | 'left' | 'right' | 'full' | 'cross';

interface Fila {
  id: string;
  key: string;
  valor: string;
}

interface FilaResultado {
  aId: string | null;
  bId: string | null;
  aKey: string | null;
  aValor: string | null;
  bKey: string | null;
  bValor: string | null;
  matched: boolean;
}

interface EjemploPreset {
  id: string;
  nombre: string;
  tablaAName: string;
  tablaBName: string;
  filasA: Fila[];
  filasB: Fila[];
  keyA: string;
  valorA: string;
  keyB: string;
  valorB: string;
}

// ============================================
// METADATOS DE TIPOS DE JOIN
// ============================================
const JOIN_INFO: Record<TipoJoin, { etiqueta: string; descripcion: string; sql: string }> = {
  inner: {
    etiqueta: 'INNER JOIN',
    descripcion: 'Solo devuelve filas con coincidencia en ambas tablas. Las filas sin pareja se descartan.',
    sql: 'INNER JOIN',
  },
  left: {
    etiqueta: 'LEFT OUTER JOIN',
    descripcion: 'Devuelve TODAS las filas de la tabla izquierda. Si no hay coincidencia, las columnas de la derecha aparecen como NULL.',
    sql: 'LEFT OUTER JOIN',
  },
  right: {
    etiqueta: 'RIGHT OUTER JOIN',
    descripcion: 'Devuelve TODAS las filas de la tabla derecha. Si no hay coincidencia, las columnas de la izquierda aparecen como NULL.',
    sql: 'RIGHT OUTER JOIN',
  },
  full: {
    etiqueta: 'FULL OUTER JOIN',
    descripcion: 'Devuelve TODAS las filas de ambas tablas. Las filas sin pareja muestran NULL en el lado contrario.',
    sql: 'FULL OUTER JOIN',
  },
  cross: {
    etiqueta: 'CROSS JOIN',
    descripcion: 'Producto cartesiano: cada fila de la izquierda se combina con cada fila de la derecha. Sin condición ON.',
    sql: 'CROSS JOIN',
  },
};

// ============================================
// EJEMPLOS PRECONFIGURADOS
// ============================================
const EJEMPLOS: EjemploPreset[] = [
  {
    id: 'empleados',
    nombre: 'Empleados–Departamentos',
    tablaAName: 'empleados',
    tablaBName: 'departamentos',
    keyA: 'id_dept',
    valorA: 'nombre',
    keyB: 'id',
    valorB: 'departamento',
    filasA: [
      { id: 'a1', key: '10', valor: 'Ana López' },
      { id: 'a2', key: '20', valor: 'Bruno Pérez' },
      { id: 'a3', key: '30', valor: 'Carla Ruiz' },
      { id: 'a4', key: '99', valor: 'Diego Soto' },
    ],
    filasB: [
      { id: 'b1', key: '10', valor: 'Ventas' },
      { id: 'b2', key: '20', valor: 'IT' },
      { id: 'b3', key: '40', valor: 'Marketing' },
    ],
  },
  {
    id: 'pedidos',
    nombre: 'Pedidos–Clientes',
    tablaAName: 'pedidos',
    tablaBName: 'clientes',
    keyA: 'id_cliente',
    valorA: 'producto',
    keyB: 'id',
    valorB: 'cliente',
    filasA: [
      { id: 'a1', key: '1', valor: 'Laptop' },
      { id: 'a2', key: '2', valor: 'Auriculares' },
      { id: 'a3', key: '', valor: 'Teclado' },
      { id: 'a4', key: '1', valor: 'Monitor' },
    ],
    filasB: [
      { id: 'b1', key: '1', valor: 'María' },
      { id: 'b2', key: '2', valor: 'José' },
      { id: 'b3', key: '3', valor: 'Lucía' },
    ],
  },
  {
    id: 'productos',
    nombre: 'Productos–Categorías',
    tablaAName: 'productos',
    tablaBName: 'categorias',
    keyA: 'cat_id',
    valorA: 'producto',
    keyB: 'id',
    valorB: 'categoria',
    filasA: [
      { id: 'a1', key: '1', valor: 'Manzana' },
      { id: 'a2', key: '1', valor: 'Pera' },
      { id: 'a3', key: '2', valor: 'Camiseta' },
      { id: 'a4', key: '3', valor: 'Libro' },
    ],
    filasB: [
      { id: 'b1', key: '1', valor: 'Frutas' },
      { id: 'b2', key: '2', valor: 'Ropa' },
      { id: 'b3', key: '4', valor: 'Hogar' },
    ],
  },
  {
    id: 'estudiantes',
    nombre: 'Estudiantes–Cursos',
    tablaAName: 'inscripciones',
    tablaBName: 'cursos',
    keyA: 'curso_id',
    valorA: 'estudiante',
    keyB: 'id',
    valorB: 'curso',
    filasA: [
      { id: 'a1', key: 'A1', valor: 'Sofía' },
      { id: 'a2', key: 'B2', valor: 'Mateo' },
      { id: 'a3', key: 'A1', valor: 'Valentina' },
      { id: 'a4', key: 'C3', valor: 'Lucas' },
    ],
    filasB: [
      { id: 'b1', key: 'A1', valor: 'Álgebra' },
      { id: 'b2', key: 'B2', valor: 'Biología' },
      { id: 'b3', key: 'D4', valor: 'Diseño' },
    ],
  },
];

// ============================================
// ALGORITMOS DE JOIN
// ============================================
function calcularJoin(
  filasA: Fila[],
  filasB: Fila[],
  tipo: TipoJoin
): FilaResultado[] {
  const resultado: FilaResultado[] = [];

  if (tipo === 'cross') {
    for (const a of filasA) {
      for (const b of filasB) {
        resultado.push({
          aId: a.id, bId: b.id,
          aKey: a.key, aValor: a.valor,
          bKey: b.key, bValor: b.valor,
          matched: true,
        });
      }
    }
    return resultado;
  }

  const matchA = new Set<string>();
  const matchB = new Set<string>();

  // INNER part — filas que coinciden
  for (const a of filasA) {
    for (const b of filasB) {
      if (a.key !== '' && b.key !== '' && a.key === b.key) {
        resultado.push({
          aId: a.id, bId: b.id,
          aKey: a.key, aValor: a.valor,
          bKey: b.key, bValor: b.valor,
          matched: true,
        });
        matchA.add(a.id);
        matchB.add(b.id);
      }
    }
  }

  // LEFT — añadir filas A sin pareja
  if (tipo === 'left' || tipo === 'full') {
    for (const a of filasA) {
      if (!matchA.has(a.id)) {
        resultado.push({
          aId: a.id, bId: null,
          aKey: a.key, aValor: a.valor,
          bKey: null, bValor: null,
          matched: false,
        });
      }
    }
  }

  // RIGHT — añadir filas B sin pareja
  if (tipo === 'right' || tipo === 'full') {
    for (const b of filasB) {
      if (!matchB.has(b.id)) {
        resultado.push({
          aId: null, bId: b.id,
          aKey: null, aValor: null,
          bKey: b.key, bValor: b.valor,
          matched: false,
        });
      }
    }
  }

  return resultado;
}

// ============================================
// VENN — Sombreado por tipo
// ============================================
function getVennFills(tipo: TipoJoin): {
  aFill: string; aOpacity: number;
  bFill: string; bOpacity: number;
  intersectionFill: string; intersectionOpacity: number;
} {
  const azul = '#2E86AB';
  const teal = '#48A9A6';
  const verde = '#10b981';

  switch (tipo) {
    case 'inner':
      return { aFill: azul, aOpacity: 0.10, bFill: teal, bOpacity: 0.10, intersectionFill: verde, intersectionOpacity: 0.55 };
    case 'left':
      return { aFill: azul, aOpacity: 0.45, bFill: teal, bOpacity: 0.10, intersectionFill: verde, intersectionOpacity: 0.45 };
    case 'right':
      return { aFill: azul, aOpacity: 0.10, bFill: teal, bOpacity: 0.45, intersectionFill: verde, intersectionOpacity: 0.45 };
    case 'full':
      return { aFill: azul, aOpacity: 0.45, bFill: teal, bOpacity: 0.45, intersectionFill: verde, intersectionOpacity: 0.55 };
    case 'cross':
      return { aFill: azul, aOpacity: 0.55, bFill: teal, bOpacity: 0.55, intersectionFill: verde, intersectionOpacity: 0.55 };
    default:
      return { aFill: azul, aOpacity: 0.20, bFill: teal, bOpacity: 0.20, intersectionFill: verde, intersectionOpacity: 0.40 };
  }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function Page() {
  const [tipoJoin, setTipoJoin] = useState<TipoJoin>('inner');
  const [tablaAName, setTablaAName] = useState<string>('empleados');
  const [tablaBName, setTablaBName] = useState<string>('departamentos');
  const [keyA, setKeyA] = useState<string>('id_dept');
  const [valorA, setValorA] = useState<string>('nombre');
  const [keyB, setKeyB] = useState<string>('id');
  const [valorB, setValorB] = useState<string>('departamento');

  const [filasA, setFilasA] = useState<Fila[]>(EJEMPLOS[0].filasA);
  const [filasB, setFilasB] = useState<Fila[]>(EJEMPLOS[0].filasB);

  const [mostrarVenn, setMostrarVenn] = useState<boolean>(true);
  const [mostrarLineas, setMostrarLineas] = useState<boolean>(true);
  const [mostrarSql, setMostrarSql] = useState<boolean>(true);

  // Cálculo del JOIN
  const resultado = useMemo(
    () => calcularJoin(filasA, filasB, tipoJoin),
    [filasA, filasB, tipoJoin]
  );

  const matches = useMemo(
    () => resultado.filter((r) => r.matched).length,
    [resultado]
  );

  const cardinalidad = useMemo(() => {
    const max = Math.max(filasA.length, filasB.length);
    if (max === 0) return 0;
    return (resultado.length / max) * 100;
  }, [resultado.length, filasA.length, filasB.length]);

  // Generación de SQL
  const sqlString = useMemo(() => {
    if (tipoJoin === 'cross') {
      return `SELECT * FROM ${tablaAName} CROSS JOIN ${tablaBName};`;
    }
    return `SELECT * FROM ${tablaAName} ${JOIN_INFO[tipoJoin].sql} ${tablaBName} ON ${tablaAName}.${keyA} = ${tablaBName}.${keyB};`;
  }, [tipoJoin, tablaAName, tablaBName, keyA, keyB]);

  // Resaltado SQL
  const sqlHighlighted = useMemo(() => {
    const tokens: { text: string; cls?: string }[] = [];
    const keywords = ['SELECT', 'FROM', 'INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'JOIN', 'ON'];
    let resto = sqlString;
    while (resto.length > 0) {
      let matched = false;
      for (const kw of keywords) {
        if (resto.toUpperCase().startsWith(kw)) {
          tokens.push({ text: resto.slice(0, kw.length), cls: 'kw' });
          resto = resto.slice(kw.length);
          matched = true;
          break;
        }
      }
      if (matched) continue;
      // Operadores
      if (resto[0] === '=' || resto[0] === ',' || resto[0] === ';') {
        tokens.push({ text: resto[0], cls: 'op' });
        resto = resto.slice(1);
        continue;
      }
      // Espacios
      if (/\s/.test(resto[0])) {
        const m = resto.match(/^\s+/);
        const len = m ? m[0].length : 1;
        tokens.push({ text: resto.slice(0, len) });
        resto = resto.slice(len);
        continue;
      }
      // Identificadores (tabla.campo o palabra)
      const m = resto.match(/^[A-Za-z0-9_*.]+/);
      if (m) {
        const txt = m[0];
        const isTable = txt === tablaAName || txt === tablaBName || txt.startsWith(tablaAName + '.') || txt.startsWith(tablaBName + '.');
        tokens.push({ text: txt, cls: isTable ? 'tbl' : undefined });
        resto = resto.slice(txt.length);
        continue;
      }
      tokens.push({ text: resto[0] });
      resto = resto.slice(1);
    }
    return tokens;
  }, [sqlString, tablaAName, tablaBName]);

  // Cargar ejemplo
  const cargarEjemplo = useCallback((ejemplo: EjemploPreset) => {
    setTablaAName(ejemplo.tablaAName);
    setTablaBName(ejemplo.tablaBName);
    setKeyA(ejemplo.keyA);
    setValorA(ejemplo.valorA);
    setKeyB(ejemplo.keyB);
    setValorB(ejemplo.valorB);
    setFilasA(ejemplo.filasA.map((f) => ({ ...f })));
    setFilasB(ejemplo.filasB.map((f) => ({ ...f })));
  }, []);

  // Edición de filas
  const actualizarFila = useCallback(
    (lado: 'A' | 'B', id: string, campo: 'key' | 'valor', nuevoValor: string) => {
      const setter = lado === 'A' ? setFilasA : setFilasB;
      setter((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: nuevoValor } : f)));
    },
    []
  );

  const eliminarFila = useCallback(
    (lado: 'A' | 'B', id: string) => {
      const setter = lado === 'A' ? setFilasA : setFilasB;
      setter((prev) => prev.filter((f) => f.id !== id));
    },
    []
  );

  const agregarFila = useCallback(
    (lado: 'A' | 'B') => {
      const setter = lado === 'A' ? setFilasA : setFilasB;
      const prefix = lado === 'A' ? 'a' : 'b';
      setter((prev) => {
        if (prev.length >= 6) return prev;
        const nuevoId = `${prefix}${Date.now()}`;
        return [...prev, { id: nuevoId, key: '', valor: '' }];
      });
    },
    []
  );

  const vennFills = getVennFills(tipoJoin);

  // Líneas de conexión: posición Y de cada fila para SVG
  const ROW_HEIGHT = 28;
  const ROW_OFFSET = 14;
  const linePaths = useMemo(() => {
    const paths: { d: string; cls: string; key: string }[] = [];
    if (!mostrarLineas) return paths;
    if (tipoJoin === 'cross') return paths;
    filasA.forEach((a, i) => {
      filasB.forEach((b, j) => {
        if (a.key !== '' && b.key !== '' && a.key === b.key) {
          const yA = ROW_OFFSET + i * ROW_HEIGHT;
          const yB = ROW_OFFSET + j * ROW_HEIGHT;
          const d = `M 0 ${yA} C 80 ${yA}, 80 ${yB}, 160 ${yB}`;
          paths.push({ d, cls: 'connectionMatch', key: `${a.id}-${b.id}` });
        }
      });
    });
    return paths;
  }, [filasA, filasB, mostrarLineas, tipoJoin]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de SQL JOIN Visual</h1>
        <p className={styles.subtitle}>
          Configura dos tablas, elige el tipo de JOIN y observa cómo se combinan las filas con
          diagrama de Venn animado, líneas de coincidencia y consulta SQL generada.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de JOIN */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Tipo de JOIN</h2>
          <div className={styles.joinSelector} role="tablist" aria-label="Tipo de JOIN">
            {(Object.keys(JOIN_INFO) as TipoJoin[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tipoJoin === t}
                className={`${styles.joinBtn} ${tipoJoin === t ? styles.joinActive : ''}`}
                onClick={() => setTipoJoin(t)}
              >
                {JOIN_INFO[t].etiqueta}
              </button>
            ))}
          </div>
          <div className={styles.joinDescription}>{JOIN_INFO[tipoJoin].descripcion}</div>
        </section>

        {/* Ejemplos */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Ejemplos preconfigurados</h2>
          <div className={styles.examplesBar}>
            {EJEMPLOS.map((ej) => (
              <button
                key={ej.id}
                type="button"
                className={styles.exampleBtn}
                onClick={() => cargarEjemplo(ej)}
              >
                {ej.nombre}
              </button>
            ))}
          </div>
          <div className={styles.togglesBar}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={mostrarVenn}
                onChange={(e) => setMostrarVenn(e.target.checked)}
              />
              Mostrar diagrama de Venn
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={mostrarLineas}
                onChange={(e) => setMostrarLineas(e.target.checked)}
              />
              Mostrar líneas de conexión
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={mostrarSql}
                onChange={(e) => setMostrarSql(e.target.checked)}
              />
              Mostrar consulta SQL
            </label>
          </div>
        </section>

        {/* Layout de tablas + venn */}
        <section className={styles.tablesLayout}>
          {/* Tabla A */}
          <div className={styles.tableEditor}>
            <div className={styles.tableTitle}>
              <input
                type="text"
                value={tablaAName}
                onChange={(e) => setTablaAName(e.target.value)}
                aria-label="Nombre tabla A"
              />
            </div>
            <table className={styles.editorTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="text"
                      className={styles.cellInput}
                      value={keyA}
                      onChange={(e) => setKeyA(e.target.value)}
                      aria-label="Columna clave A"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      className={styles.cellInput}
                      value={valorA}
                      onChange={(e) => setValorA(e.target.value)}
                      aria-label="Columna valor A"
                    />
                  </th>
                  <th aria-label="Acción"></th>
                </tr>
              </thead>
              <tbody>
                {filasA.map((fila) => (
                  <tr key={fila.id}>
                    <td>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={fila.key}
                        onChange={(e) => actualizarFila('A', fila.id, 'key', e.target.value)}
                        aria-label={`Clave fila ${fila.id}`}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={fila.valor}
                        onChange={(e) => actualizarFila('A', fila.id, 'valor', e.target.value)}
                        aria-label={`Valor fila ${fila.id}`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.removeRowBtn}
                        onClick={() => eliminarFila('A', fila.id)}
                        aria-label="Eliminar fila"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filasA.length < 6 && (
              <button type="button" className={styles.addRowBtn} onClick={() => agregarFila('A')}>
                + Añadir fila
              </button>
            )}
          </div>

          {/* Centro: Venn + líneas */}
          <div className={styles.vennContainer}>
            {mostrarVenn && (
              <svg
                className={styles.vennSvg}
                viewBox="0 0 400 220"
                role="img"
                aria-label={`Diagrama de Venn para ${JOIN_INFO[tipoJoin].etiqueta}`}
              >
                {/* Círculo A */}
                <circle
                  cx="150"
                  cy="110"
                  r="80"
                  fill={vennFills.aFill}
                  fillOpacity={vennFills.aOpacity}
                  stroke={vennFills.aFill}
                  strokeWidth="2"
                />
                {/* Círculo B */}
                <circle
                  cx="250"
                  cy="110"
                  r="80"
                  fill={vennFills.bFill}
                  fillOpacity={vennFills.bOpacity}
                  stroke={vennFills.bFill}
                  strokeWidth="2"
                />
                {/* Intersección con clip */}
                <defs>
                  <clipPath id="clipA-svg">
                    <circle cx="150" cy="110" r="80" />
                  </clipPath>
                </defs>
                <circle
                  cx="250"
                  cy="110"
                  r="80"
                  fill={vennFills.intersectionFill}
                  fillOpacity={vennFills.intersectionOpacity}
                  clipPath="url(#clipA-svg)"
                />
                <text x="100" y="115" className={styles.vennLabel} textAnchor="middle">
                  A
                </text>
                <text x="300" y="115" className={styles.vennLabel} textAnchor="middle">
                  B
                </text>
                {tipoJoin === 'cross' && (
                  <text x="200" y="210" className={styles.vennLabel} textAnchor="middle" fontSize="12">
                    A × B (producto cartesiano)
                  </text>
                )}
              </svg>
            )}
            <div className={styles.vennCaption}>
              <strong>{JOIN_INFO[tipoJoin].etiqueta}</strong>
            </div>
            {mostrarLineas && tipoJoin !== 'cross' && (
              <svg
                className={styles.connectionLines}
                viewBox={`0 0 160 ${Math.max(filasA.length, filasB.length) * ROW_HEIGHT + 10}`}
                preserveAspectRatio="none"
                role="img"
                aria-label="Líneas de conexión entre filas coincidentes"
              >
                {linePaths.map((p) => (
                  <path key={p.key} d={p.d} className={styles[p.cls]} />
                ))}
              </svg>
            )}
          </div>

          {/* Tabla B */}
          <div className={styles.tableEditor}>
            <div className={styles.tableTitle}>
              <input
                type="text"
                value={tablaBName}
                onChange={(e) => setTablaBName(e.target.value)}
                aria-label="Nombre tabla B"
              />
            </div>
            <table className={styles.editorTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="text"
                      className={styles.cellInput}
                      value={keyB}
                      onChange={(e) => setKeyB(e.target.value)}
                      aria-label="Columna clave B"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      className={styles.cellInput}
                      value={valorB}
                      onChange={(e) => setValorB(e.target.value)}
                      aria-label="Columna valor B"
                    />
                  </th>
                  <th aria-label="Acción"></th>
                </tr>
              </thead>
              <tbody>
                {filasB.map((fila) => (
                  <tr key={fila.id}>
                    <td>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={fila.key}
                        onChange={(e) => actualizarFila('B', fila.id, 'key', e.target.value)}
                        aria-label={`Clave fila ${fila.id}`}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={fila.valor}
                        onChange={(e) => actualizarFila('B', fila.id, 'valor', e.target.value)}
                        aria-label={`Valor fila ${fila.id}`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.removeRowBtn}
                        onClick={() => eliminarFila('B', fila.id)}
                        aria-label="Eliminar fila"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filasB.length < 6 && (
              <button type="button" className={styles.addRowBtn} onClick={() => agregarFila('B')}>
                + Añadir fila
              </button>
            )}
          </div>
        </section>

        {/* SQL */}
        {mostrarSql && (
          <section className={styles.sqlBox} aria-label="Consulta SQL generada">
            {sqlHighlighted.map((tok, idx) => {
              const cls =
                tok.cls === 'kw'
                  ? styles.sqlKeyword
                  : tok.cls === 'tbl'
                    ? styles.sqlTable
                    : tok.cls === 'op'
                      ? styles.sqlOperator
                      : '';
              return (
                <span key={idx} className={cls}>
                  {tok.text}
                </span>
              );
            })}
          </section>
        )}

        {/* Resultado */}
        <section className={styles.resultBlock}>
          <h3>Tabla resultado ({formatNumber(resultado.length, 0)} filas)</h3>
          {resultado.length === 0 ? (
            <div className={styles.emptyResult}>
              No hay filas en el resultado. Prueba con otro tipo de JOIN o añade filas a las tablas.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.resultTable}>
                <thead>
                  <tr>
                    <th>{tablaAName}.{keyA}</th>
                    <th>{tablaAName}.{valorA}</th>
                    <th>{tablaBName}.{keyB}</th>
                    <th>{tablaBName}.{valorB}</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.map((r, idx) => (
                    <tr
                      key={`${r.aId ?? '_'}-${r.bId ?? '_'}-${idx}`}
                      className={r.matched ? styles.matchedRow : ''}
                    >
                      <td className={r.aKey === null ? styles.nullCell : ''}>
                        {r.aKey === null ? 'NULL' : r.aKey}
                      </td>
                      <td className={r.aValor === null ? styles.nullCell : ''}>
                        {r.aValor === null ? 'NULL' : r.aValor}
                      </td>
                      <td className={r.bKey === null ? styles.nullCell : ''}>
                        {r.bKey === null ? 'NULL' : r.bKey}
                      </td>
                      <td className={r.bValor === null ? styles.nullCell : ''}>
                        {r.bValor === null ? 'NULL' : r.bValor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Métricas */}
        <section className={styles.metricsGrid} aria-label="Métricas del JOIN">
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Filas en {tablaAName}</span>
            <span className={styles.resultValue}>{formatNumber(filasA.length, 0)}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Filas en {tablaBName}</span>
            <span className={styles.resultValue}>{formatNumber(filasB.length, 0)}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Coincidencias</span>
            <span className={`${styles.resultValue} ${styles.resultValueAccent}`}>
              {formatNumber(matches, 0)}
            </span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Filas en resultado</span>
            <span className={`${styles.resultValue} ${styles.resultValueAccent}`}>
              {formatNumber(resultado.length, 0)}
            </span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Cardinalidad</span>
            <span className={styles.resultValue}>{formatNumber(cardinalidad, 1)}%</span>
          </div>
        </section>
      </main>

      <EducationalSection
        title="Guía de SQL JOIN"
        subtitle="Operaciones de unión de tablas"
      >
        <h3>Comparativa de los 5 JOIN</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Qué incluye</th>
                <th>NULLs</th>
                <th>Cuándo usar</th>
                <th>Ejemplo casual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>INNER JOIN</strong></td>
                <td>Solo filas con coincidencia en ambas tablas</td>
                <td>Nunca</td>
                <td>Cuando solo importan los registros emparejados</td>
                <td>Personas que tienen pasaporte Y visado vigente</td>
              </tr>
              <tr>
                <td><strong>LEFT OUTER</strong></td>
                <td>Todo A + coincidencias de B</td>
                <td>En columnas de B sin pareja</td>
                <td>Listar todo A, marcando si tiene relación con B</td>
                <td>Todos los empleados, con su departamento si lo tienen</td>
              </tr>
              <tr>
                <td><strong>RIGHT OUTER</strong></td>
                <td>Todo B + coincidencias de A</td>
                <td>En columnas de A sin pareja</td>
                <td>Lo mismo que LEFT pero invertido (poco usado)</td>
                <td>Todos los departamentos, con sus empleados si los tienen</td>
              </tr>
              <tr>
                <td><strong>FULL OUTER</strong></td>
                <td>Todo A + Todo B + coincidencias</td>
                <td>En ambos lados según falte</td>
                <td>Auditoría: detectar registros huérfanos en ambos lados</td>
                <td>Comparar inventario físico vs sistema, ver discrepancias</td>
              </tr>
              <tr>
                <td><strong>CROSS JOIN</strong></td>
                <td>Producto cartesiano (A × B)</td>
                <td>Nunca (no hay condición)</td>
                <td>Generar combinaciones (calendarios, matrices, tests)</td>
                <td>Cada talla con cada color de una camiseta</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧾</span>
              <strong>Facturación</strong>
            </div>
            <p className={styles.escenarioExample}>
              <code>facturas LEFT JOIN clientes</code>: ver todas las facturas, incluso las
              huérfanas con cliente borrado (aparecerán con cliente NULL).
            </p>
            <p className={styles.escenarioTip}>
              💡 LEFT JOIN es ideal para detectar registros huérfanos sin perder ninguna fila.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📦</span>
              <strong>Inventario</strong>
            </div>
            <p className={styles.escenarioExample}>
              <code>productos INNER JOIN stock</code>: solo productos con stock registrado.
              Ignora artículos descatalogados o sin alta en almacén.
            </p>
            <p className={styles.escenarioTip}>
              💡 INNER JOIN garantiza que no aparezcan productos sin información completa.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👥</span>
              <strong>Gestión de equipos</strong>
            </div>
            <p className={styles.escenarioExample}>
              <code>empleados FULL OUTER JOIN departamentos</code>: ver empleados sin departamento
              y departamentos sin empleados de un solo vistazo.
            </p>
            <p className={styles.escenarioTip}>
              💡 FULL OUTER es la herramienta de auditoría por excelencia.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📅</span>
              <strong>Generación de calendarios</strong>
            </div>
            <p className={styles.escenarioExample}>
              <code>fechas CROSS JOIN salas</code>: combinar todos los días del mes con todas
              las salas para crear una matriz de disponibilidad.
            </p>
            <p className={styles.escenarioTip}>
              💡 CROSS JOIN es perfecto para crear todas las combinaciones posibles.
            </p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la diferencia entre INNER y OUTER JOIN?</h4>
            <p>
              INNER JOIN solo devuelve filas que coinciden en ambas tablas. OUTER JOIN (LEFT,
              RIGHT, FULL) además devuelve filas sin pareja, rellenando con NULL las columnas
              del lado contrario.
            </p>
            <p className={styles.faqTip}>
              💡 Regla rápida: si necesitas ver registros huérfanos, usa OUTER. Si solo te
              interesan emparejamientos limpios, usa INNER.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué CROSS JOIN puede ser peligroso?</h4>
            <p>
              Devuelve <strong>filas_A × filas_B</strong>. Si A tiene 1.000 filas y B tiene
              1.000, el resultado son 1.000.000 de filas. En tablas grandes puede colgar el
              servidor o agotar memoria.
            </p>
            <p className={styles.faqTip}>
              💡 Usa CROSS JOIN solo con tablas pequeñas y conscientemente, nunca por
              accidente al olvidar la cláusula ON.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo uso LEFT y cuándo RIGHT?</h4>
            <p>
              Funcionalmente son simétricos: <code>A LEFT JOIN B</code> es equivalente a{' '}
              <code>B RIGHT JOIN A</code>. La convención es escribir siempre LEFT para mantener
              consistencia y leer la consulta de izquierda a derecha.
            </p>
            <p className={styles.faqTip}>
              💡 En la práctica casi nadie usa RIGHT JOIN. Reescribe siempre con LEFT.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa con las filas duplicadas?</h4>
            <p>
              Si la clave del JOIN se repite en alguna tabla, el resultado se multiplica. Por
              ejemplo, si una clave aparece 2 veces en A y 3 veces en B, esa clave generará
              <strong> 6 filas</strong> en el resultado.
            </p>
            <p className={styles.faqTip}>
              💡 Si te aparecen muchas más filas de las esperadas, casi seguro hay duplicados
              en una de las tablas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿FULL OUTER JOIN está soportado en todos los SGBD?</h4>
            <p>
              No. PostgreSQL, SQL Server, Oracle y SQLite (3.39+) lo soportan. <strong>MySQL
              no lo soporta de forma nativa</strong>; hay que simularlo con UNION de un LEFT
              JOIN y un RIGHT JOIN excluyendo la intersección.
            </p>
            <p className={styles.faqTip}>
              💡 Antes de usar FULL OUTER, comprueba la documentación de tu motor.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿NATURAL JOIN es lo mismo que INNER JOIN?</h4>
            <p>
              No exactamente. NATURAL JOIN une automáticamente por <strong>todas las columnas
              con el mismo nombre</strong> en ambas tablas, sin que tú las especifiques. Es
              cómodo pero peligroso: si añaden una columna con el mismo nombre, la consulta
              cambia de significado silenciosamente.
            </p>
            <p className={styles.faqTip}>
              💡 Mejor usa siempre <code>INNER JOIN ... ON</code> explícito. Es más verboso pero
              robusto.
            </p>
          </div>
        </div>

        <h3>Cómo Escribir el JOIN Correcto — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Identifica las tablas y la columna que las relaciona</strong>
              <p>
                Localiza la clave primaria (PK) de una tabla y la clave foránea (FK) que apunta
                a ella en la otra. Ese es el ON de tu JOIN.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Decide qué quieres ver</strong>
              <p>
                ¿Solo coincidencias? INNER. ¿Todo A aunque no haya pareja? LEFT. ¿Todo de ambos
                lados? FULL OUTER. ¿Combinaciones puras? CROSS.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Escribe la consulta con alias claros</strong>
              <p>
                Usa alias cortos (<code>e</code> para empleados, <code>d</code> para
                departamentos) y prefija siempre las columnas: <code>e.nombre</code>,{' '}
                <code>d.nombre</code>. Evita ambigüedad.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Prueba con una muestra pequeña</strong>
              <p>
                Antes de ejecutar sobre millones de filas, prueba con <code>LIMIT 10</code> y
                revisa que el resultado tiene sentido. Si hay 100 filas donde esperabas 10,
                investiga duplicados.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Verifica con conteos</strong>
              <p>
                Compara <code>COUNT(*)</code> antes y después del JOIN. En un INNER JOIN bien
                hecho con FK válida, no debe perderse ni multiplicarse el conteo principal.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Usa siempre ON explícito</strong>
            <p>
              Evita NATURAL JOIN y USING. <code>ON tabla1.id = tabla2.id_externo</code> es
              autoexplicativo y robusto frente a cambios de esquema.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📛</span>
            <strong>Pon alias a las tablas</strong>
            <p>
              <code>FROM empleados e JOIN departamentos d</code> hace consultas largas
              legibles y evita ambigüedad en columnas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Indexa las columnas del ON</strong>
            <p>
              Sin índices en las claves del JOIN, la consulta hará scan completo. Las FKs
              suelen indexarse automáticamente, pero verifícalo.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Filtra en la cláusula ON cuando puedas</strong>
            <p>
              Para LEFT JOIN, filtrar la tabla derecha en el ON conserva las filas huérfanas;
              filtrar en WHERE las elimina. Es un error clásico.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <strong>Verifica con EXPLAIN</strong>
            <p>
              <code>EXPLAIN SELECT ...</code> muestra el plan de ejecución y avisa si el SGBD
              hará un nested loop sobre tablas enormes.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <strong>Cuenta antes y después</strong>
            <p>
              Si esperas N filas y obtienes 10·N, casi seguro hay duplicados. Si obtienes N/3,
              algo se está filtrando que no debería.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes a evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Olvidar la cláusula ON convierte un INNER JOIN en CROSS JOIN: explosión de filas.</li>
            <li>Filtrar columnas de la tabla derecha en WHERE de un LEFT JOIN: anula el OUTER.</li>
            <li>Asumir que NULL = NULL en el ON: NULL nunca es igual a nada, ni a sí mismo.</li>
            <li>Encadenar 5+ JOINs sin verificar duplicados: el resultado puede ser cartesiano oculto.</li>
            <li>Usar SELECT * en JOIN: trae columnas duplicadas y oculta ambigüedad de nombres.</li>
            <li>Confundir LEFT con RIGHT al cambiar el orden de las tablas: lee dos veces antes de ejecutar en producción.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-sql-join')} />
      <ShareCard appName="simulador-sql-join" />
      <Footer appName="simulador-sql-join" />
    </div>
  );
}
