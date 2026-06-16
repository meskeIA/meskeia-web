'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './BaseDatosRelacional.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabId = 'tablas' | 'joins' | 'indices' | 'acid';
type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
type NFilas = 10_000 | 100_000 | 1_000_000 | 10_000_000;

interface Cliente {
  id_cliente: number;
  nombre: string;
  email: string;
  ciudad: string;
}

interface Pedido {
  id_pedido: number;
  id_cliente: number;
  fecha: string;
  total: string;
}

interface Producto {
  id_producto: number;
  nombre: string;
  precio: string;
  categoria: string;
}

interface JoinRow {
  nombre: string;
  total: string | null;
}

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────

const CLIENTES: Cliente[] = [
  { id_cliente: 1, nombre: 'Ana García', email: 'ana@email.com', ciudad: 'Madrid' },
  { id_cliente: 2, nombre: 'Carlos López', email: 'carlos@email.com', ciudad: 'Barcelona' },
  { id_cliente: 3, nombre: 'María Ruiz', email: 'maria@email.com', ciudad: 'Valencia' },
];

const PEDIDOS: Pedido[] = [
  { id_pedido: 101, id_cliente: 1, fecha: '2024-01-15', total: '250,00 €' },
  { id_pedido: 102, id_cliente: 1, fecha: '2024-02-03', total: '85,50 €' },
  { id_pedido: 103, id_cliente: 2, fecha: '2024-01-20', total: '420,00 €' },
];

const PRODUCTOS: Producto[] = [
  { id_producto: 1, nombre: 'Laptop', precio: '999 €', categoria: 'Electrónica' },
  { id_producto: 2, nombre: 'Teclado', precio: '79 €', categoria: 'Electrónica' },
  { id_producto: 3, nombre: 'Mesa', precio: '250 €', categoria: 'Muebles' },
];

// ─── Resultados de JOIN ────────────────────────────────────────────────────────

const JOIN_RESULTS: Record<JoinType, JoinRow[]> = {
  INNER: [
    { nombre: 'Ana García', total: '250,00 €' },
    { nombre: 'Ana García', total: '85,50 €' },
    { nombre: 'Carlos López', total: '420,00 €' },
  ],
  LEFT: [
    { nombre: 'Ana García', total: '250,00 €' },
    { nombre: 'Ana García', total: '85,50 €' },
    { nombre: 'Carlos López', total: '420,00 €' },
    { nombre: 'María Ruiz', total: null },
  ],
  RIGHT: [
    { nombre: 'Ana García', total: '250,00 €' },
    { nombre: 'Ana García', total: '85,50 €' },
    { nombre: 'Carlos López', total: '420,00 €' },
  ],
  FULL: [
    { nombre: 'Ana García', total: '250,00 €' },
    { nombre: 'Ana García', total: '85,50 €' },
    { nombre: 'Carlos López', total: '420,00 €' },
    { nombre: 'María Ruiz', total: null },
  ],
};

const JOIN_SQL: Record<JoinType, string> = {
  INNER: `SELECT clientes.nombre, pedidos.total\nFROM clientes\nINNER JOIN pedidos\n  ON clientes.id_cliente = pedidos.id_cliente`,
  LEFT: `SELECT clientes.nombre, pedidos.total\nFROM clientes\nLEFT JOIN pedidos\n  ON clientes.id_cliente = pedidos.id_cliente`,
  RIGHT: `SELECT clientes.nombre, pedidos.total\nFROM clientes\nRIGHT JOIN pedidos\n  ON clientes.id_cliente = pedidos.id_cliente`,
  FULL: `SELECT clientes.nombre, pedidos.total\nFROM clientes\nFULL OUTER JOIN pedidos\n  ON clientes.id_cliente = pedidos.id_cliente`,
};

const JOIN_DESC: Record<JoinType, { titulo: string; descripcion: string; uso: string; color: string }> = {
  INNER: {
    titulo: 'INNER JOIN',
    descripcion: 'Solo devuelve filas con coincidencia en AMBAS tablas.',
    uso: '"Dame clientes que hayan hecho algún pedido."',
    color: '#2E86AB',
  },
  LEFT: {
    titulo: 'LEFT JOIN',
    descripcion: 'Devuelve TODAS las filas de la tabla izquierda. NULL donde no hay coincidencia derecha.',
    uso: '"Dame TODOS los clientes, y sus pedidos si existen."',
    color: '#48A9A6',
  },
  RIGHT: {
    titulo: 'RIGHT JOIN',
    descripcion: 'Devuelve TODAS las filas de la tabla derecha. NULL donde no hay coincidencia izquierda.',
    uso: '"Dame TODOS los pedidos aunque el cliente no esté registrado."',
    color: '#7FB3D3',
  },
  FULL: {
    titulo: 'FULL OUTER JOIN',
    descripcion: 'Todas las filas de AMBAS tablas con NULL donde no haya coincidencia.',
    uso: '"Dame todo, de ambas tablas, emparejado donde sea posible."',
    color: '#5B9E9C',
  },
};

// ─── Calcular tiempos de búsqueda ─────────────────────────────────────────────

function calcularTiempos(n: NFilas): { sinIndice: string; conIndice: string; comparaciones: number } {
  const tiempoBase = n / 1_000_000; // segundos aprox para full scan
  const comparaciones = Math.ceil(Math.log2(n));
  const tiempoIndice = comparaciones * 0.000_001; // microsegundos por comparación
  return {
    sinIndice: tiempoBase >= 1 ? `~${tiempoBase.toFixed(1)} s` : `~${(tiempoBase * 1000).toFixed(0)} ms`,
    conIndice: tiempoIndice < 0.001 ? `~${(tiempoIndice * 1_000_000).toFixed(0)} µs` : `~${(tiempoIndice * 1000).toFixed(2)} ms`,
    comparaciones,
  };
}

const N_OPCIONES: NFilas[] = [10_000, 100_000, 1_000_000, 10_000_000];
const N_LABELS: Record<NFilas, string> = {
  10_000: '10 000',
  100_000: '100 000',
  1_000_000: '1 000 000',
  10_000_000: '10 000 000',
};

// ─── Diagrama de Venn SVG ─────────────────────────────────────────────────────

function VennDiagram({ tipo }: { tipo: JoinType }) {
  const leftFill =
    tipo === 'LEFT' || tipo === 'FULL' ? 'rgba(46,134,171,0.45)' : 'rgba(46,134,171,0.15)';
  const rightFill =
    tipo === 'RIGHT' || tipo === 'FULL' ? 'rgba(72,169,166,0.45)' : 'rgba(72,169,166,0.15)';
  const interFill =
    tipo === 'INNER' || tipo === 'LEFT' || tipo === 'RIGHT' || tipo === 'FULL'
      ? 'rgba(255,180,50,0.65)'
      : 'rgba(200,200,200,0.15)';

  const noInter = tipo === 'RIGHT' ? 'rgba(72,169,166,0.45)' : tipo === 'FULL' ? 'rgba(72,169,166,0.45)' : rightFill;

  return (
    <svg
      viewBox="0 0 220 110"
      className={styles.vennDiagram}
      aria-label={`Diagrama de Venn para ${tipo} JOIN`}
      role="img"
    >
      {/* Círculo izquierdo */}
      <circle cx="80" cy="55" r="42" fill={leftFill} stroke="var(--primary)" strokeWidth="1.5" />
      {/* Círculo derecho */}
      <circle cx="140" cy="55" r="42" fill={noInter} stroke="var(--secondary)" strokeWidth="1.5" />
      {/* Intersección resaltada */}
      <clipPath id={`clip-left-${tipo}`}>
        <circle cx="80" cy="55" r="42" />
      </clipPath>
      <circle
        cx="140"
        cy="55"
        r="42"
        fill={interFill}
        clipPath={`url(#clip-left-${tipo})`}
      />
      {/* Etiquetas */}
      <text x="60" y="55" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontWeight="600">
        clientes
      </text>
      <text x="160" y="55" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontWeight="600">
        pedidos
      </text>
    </svg>
  );
}

// ─── B-Tree SVG ───────────────────────────────────────────────────────────────

function BTreeSVG() {
  const nodos = [
    { x: 200, y: 20, label: 'M', nivel: 0 },
    { x: 100, y: 70, label: 'F', nivel: 1 },
    { x: 300, y: 70, label: 'T', nivel: 1 },
    { x: 50, y: 120, label: 'A', nivel: 2 },
    { x: 150, y: 120, label: 'J', nivel: 2 },
    { x: 250, y: 120, label: 'P', nivel: 2 },
    { x: 350, y: 120, label: 'Z', nivel: 2 },
  ];

  const aristas: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
  ];

  const resaltados = [0, 2, 6]; // camino de búsqueda de ejemplo

  return (
    <svg
      viewBox="0 0 400 160"
      className={styles.arbolBtree}
      aria-label="Árbol B-Tree de índice de base de datos"
      role="img"
    >
      {aristas.map(([a, b], i) => (
        <line
          key={i}
          x1={nodos[a].x}
          y1={nodos[a].y + 14}
          x2={nodos[b].x}
          y2={nodos[b].y - 14}
          stroke={resaltados.includes(a) && resaltados.includes(b) ? 'var(--primary)' : 'var(--text-muted)'}
          strokeWidth={resaltados.includes(a) && resaltados.includes(b) ? '2' : '1'}
          strokeDasharray={resaltados.includes(a) && resaltados.includes(b) ? 'none' : '4 2'}
        />
      ))}
      {nodos.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r="13"
            fill={resaltados.includes(i) ? 'var(--primary)' : 'var(--bg-card)'}
            stroke={resaltados.includes(i) ? 'var(--primary)' : 'var(--text-muted)'}
            strokeWidth="1.5"
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={resaltados.includes(i) ? '#fff' : 'var(--text-primary)'}
          >
            {n.label}
          </text>
        </g>
      ))}
      {/* Leyenda */}
      <circle cx="16" cy="148" r="7" fill="var(--primary)" />
      <text x="28" y="152" fontSize="9" fill="var(--text-secondary)">Camino de búsqueda</text>
      <circle cx="120" cy="148" r="7" fill="var(--bg-card)" stroke="var(--text-muted)" strokeWidth="1.5" />
      <text x="132" y="152" fontSize="9" fill="var(--text-secondary)">Nodo no visitado</text>
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function VisualizadorBaseDatosRelacional() {
  const [tabActivo, setTabActivo] = useState<TabId>('tablas');
  const [joinActivo, setJoinActivo] = useState<JoinType>('INNER');
  const [nFilas, setNFilas] = useState<NFilas>(1_000_000);
  const [fkResaltada, setFkResaltada] = useState<number | null>(null);

  const tiempos = calcularTiempos(nFilas);

  const handleFkClick = useCallback((idCliente: number) => {
    setFkResaltada(prev => (prev === idCliente ? null : idCliente));
  }, []);

  const TABS: { id: TabId; label: string }[] = [
    { id: 'tablas', label: 'Tablas y relaciones' },
    { id: 'joins', label: 'Los 4 tipos de JOIN' },
    { id: 'indices', label: 'Índices y rendimiento' },
    { id: 'acid', label: 'ACID y SQL vs NoSQL' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Base de Datos Relacional</h1>
        <p>Tablas, claves, JOINs, índices y transacciones ACID — explicados visualmente</p>
      </header>

      <LegalNotice />

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="Secciones de la visualización">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${tabActivo === t.id ? styles.tabActive : ''}`}
            onClick={() => setTabActivo(t.id)}
            aria-pressed={tabActivo === t.id}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Tab 1: Tablas y relaciones ── */}
      {tabActivo === 'tablas' && (
        <section className={styles.content}>
          <h2>El modelo relacional (Edgar Codd, 1970)</h2>
          <p className={styles.intro}>
            Los datos se organizan en <strong>tablas</strong> (relaciones). Cada fila es un registro único identificado
            por una <strong className={styles.pkTag}>clave primaria (PK)</strong>. Las tablas se conectan mediante{' '}
            <strong className={styles.fkTag}>claves foráneas (FK)</strong> que referencian la PK de otra tabla.
            Haz clic en una FK para ver la fila relacionada.
          </p>

          <div className={styles.tablasBD}>
            {/* Tabla clientes */}
            <div className={styles.tablaBD}>
              <div className={`${styles.tablaHeader} ${styles.headerClientes}`}>
                <span aria-hidden="true">🧑‍💼</span> clientes
              </div>
              <table aria-label="Tabla clientes">
                <thead>
                  <tr>
                    <th>id_cliente</th>
                    <th>nombre</th>
                    <th>email</th>
                    <th>ciudad</th>
                  </tr>
                </thead>
                <tbody>
                  {CLIENTES.map(c => (
                    <tr
                      key={c.id_cliente}
                      className={fkResaltada === c.id_cliente ? styles.filaResaltada : ''}
                    >
                      <td className={styles.pkCell}>{c.id_cliente}</td>
                      <td>{c.nombre}</td>
                      <td>{c.email}</td>
                      <td>{c.ciudad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conector visual */}
            <div className={styles.conectorFK} aria-hidden="true">
              <span className={styles.flechaFK}>FK →</span>
              <span className={styles.flechaFK}>← PK</span>
            </div>

            {/* Tabla pedidos */}
            <div className={styles.tablaBD}>
              <div className={`${styles.tablaHeader} ${styles.headerPedidos}`}>
                <span aria-hidden="true">📦</span> pedidos
              </div>
              <table aria-label="Tabla pedidos">
                <thead>
                  <tr>
                    <th>id_pedido</th>
                    <th>id_cliente</th>
                    <th>fecha</th>
                    <th>total</th>
                  </tr>
                </thead>
                <tbody>
                  {PEDIDOS.map(p => (
                    <tr key={p.id_pedido}>
                      <td className={styles.pkCell}>{p.id_pedido}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.fkCell}
                          onClick={() => handleFkClick(p.id_cliente)}
                          aria-label={`Resaltar cliente ${p.id_cliente} en tabla clientes`}
                          aria-pressed={fkResaltada === p.id_cliente}
                          title="Haz clic para ver el cliente relacionado"
                        >
                          {p.id_cliente}
                        </button>
                      </td>
                      <td>{p.fecha}</td>
                      <td>{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla productos (independiente, como ejemplo de otra entidad) */}
          <div className={`${styles.tablaBD} ${styles.tablaBDWide}`}>
            <div className={`${styles.tablaHeader} ${styles.headerProductos}`}>
              <span aria-hidden="true">🛒</span> productos
            </div>
            <table aria-label="Tabla productos">
              <thead>
                <tr>
                  <th>id_producto</th>
                  <th>nombre</th>
                  <th>precio</th>
                  <th>categoria</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTOS.map(p => (
                  <tr key={p.id_producto}>
                    <td className={styles.pkCell}>{p.id_producto}</td>
                    <td>{p.nombre}</td>
                    <td>{p.precio}</td>
                    <td>{p.categoria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Conceptos clave */}
          <div className={styles.conceptosGrid}>
            <div className={styles.conceptoCard}>
              <h3>Normalización</h3>
              <p>
                Elimina redundancia dividiendo datos en tablas relacionadas. En lugar de repetir "Ana García" en cada
                pedido, se almacena una única vez en <code>clientes</code> y se referencia por id.
              </p>
            </div>
            <div className={styles.conceptoCard}>
              <h3>Integridad referencial</h3>
              <p>
                La BD garantiza que toda FK apunta a una PK existente. No puedes crear un pedido con{' '}
                <code>id_cliente = 99</code> si ese cliente no existe.
              </p>
            </div>
            <div className={styles.conceptoCard}>
              <h3>1NF → 3NF simplificado</h3>
              <p>
                "Cada dato en un único lugar." Sin grupos repetidos, sin dependencias transitivas. Cada columna tiene un
                valor atómico (indivisible).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Tab 2: JOINs ── */}
      {tabActivo === 'joins' && (
        <section className={styles.content}>
          <h2>El JOIN: unir tablas por condición</h2>
          <p className={styles.intro}>
            Un JOIN combina filas de dos tablas basándose en una condición (normalmente FK = PK). Es la operación
            central de las consultas SQL complejas. Selecciona el tipo para ver el resultado.
          </p>

          <div className={styles.joinSelectorGrid}>
            {(['INNER', 'LEFT', 'RIGHT', 'FULL'] as JoinType[]).map(tipo => (
              <button
                key={tipo}
                type="button"
                className={`${styles.joinBtn} ${joinActivo === tipo ? styles.joinBtnActivo : ''}`}
                onClick={() => setJoinActivo(tipo)}
                aria-pressed={joinActivo === tipo}
              >
                {JOIN_DESC[tipo].titulo}
              </button>
            ))}
          </div>

          <div className={styles.joinDetalle}>
            <div className={styles.joinLeft}>
              <VennDiagram tipo={joinActivo} />
              <p className={styles.joinDescripcion}>{JOIN_DESC[joinActivo].descripcion}</p>
              <p className={styles.joinUso}>
                <strong>Uso típico:</strong> {JOIN_DESC[joinActivo].uso}
              </p>
              <pre className={styles.sqlCode} aria-label="Ejemplo de consulta SQL">
                <code>{JOIN_SQL[joinActivo]}</code>
              </pre>
            </div>

            <div className={styles.joinRight}>
              <h3>Resultado</h3>
              <table className={styles.joinResult} aria-label={`Resultado de ${joinActivo} JOIN`}>
                <thead>
                  <tr>
                    <th>nombre</th>
                    <th>total</th>
                  </tr>
                </thead>
                <tbody>
                  {JOIN_RESULTS[joinActivo].map((row, i) => (
                    <tr key={i} className={row.total === null ? styles.filaNull : ''}>
                      <td>{row.nombre}</td>
                      <td>{row.total ?? <span className={styles.nullTag}>NULL</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.joinCount}>
                {JOIN_RESULTS[joinActivo].length} fila{JOIN_RESULTS[joinActivo].length !== 1 ? 's' : ''} devuelta
                {JOIN_RESULTS[joinActivo].length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <strong>Consejo práctico:</strong> El 95 % de las consultas reales usan INNER JOIN o LEFT JOIN. RIGHT JOIN es
            funcionalmente equivalente a LEFT JOIN con las tablas invertidas. FULL OUTER JOIN es raro en la práctica.
          </div>
        </section>
      )}

      {/* ── Tab 3: Índices ── */}
      {tabActivo === 'indices' && (
        <section className={styles.content}>
          <h2>Índices: de segundos a microsegundos</h2>
          <p className={styles.intro}>
            Un índice es una estructura auxiliar que acelera las búsquedas en una tabla. Sin él, la base de datos revisa
            cada fila (Full Table Scan). Con él, usa búsqueda binaria sobre una estructura B-Tree ordenada.
          </p>

          <div className={styles.sliderSection}>
            <label htmlFor="nFilas-slider" className={styles.sliderLabel}>
              Número de filas en la tabla:
            </label>
            <div className={styles.sliderBtns}>
              {N_OPCIONES.map(n => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.sliderBtn} ${nFilas === n ? styles.sliderBtnActivo : ''}`}
                  onClick={() => setNFilas(n)}
                  aria-pressed={nFilas === n}
                >
                  {N_LABELS[n]}
                </button>
              ))}
            </div>

            <div className={styles.rendimientoDisplay}>
              <div className={styles.rendCard + ' ' + styles.rendLento}>
                <div className={styles.rendLabel}>Sin índice (Full Scan)</div>
                <div className={styles.rendValor}>{tiempos.sinIndice}</div>
                <div className={styles.rendSub}>O(n) — revisa {N_LABELS[nFilas]} filas</div>
              </div>
              <div className={styles.rendVs} aria-hidden="true">vs</div>
              <div className={styles.rendCard + ' ' + styles.rendRapido}>
                <div className={styles.rendLabel}>Con índice B-Tree</div>
                <div className={styles.rendValor}>{tiempos.conIndice}</div>
                <div className={styles.rendSub}>
                  O(log n) — solo {tiempos.comparaciones} comparaciones
                </div>
              </div>
            </div>
          </div>

          <h3 className={styles.subheading}>Árbol B-Tree — estructura del índice</h3>
          <p className={styles.subDesc}>
            El índice organiza los valores en un árbol balanceado. La búsqueda comienza en la raíz y baja por la rama
            correcta según la comparación. El camino resaltado muestra la búsqueda de &quot;Z&quot;: solo 3 comparaciones
            para {N_LABELS[nFilas]} registros.
          </p>

          <BTreeSVG />

          <h3 className={styles.subheading}>Tipos de índices</h3>
          <div className={styles.tiposGrid}>
            <div className={styles.tipoCard}>
              <h4>B-Tree (por defecto)</h4>
              <p>Igualdad y rangos: <code>WHERE email = &apos;x&apos;</code>, <code>WHERE fecha BETWEEN</code>, <code>ORDER BY</code></p>
            </div>
            <div className={styles.tipoCard}>
              <h4>Hash</h4>
              <p>Solo igualdad exacta. Más rápido que B-Tree para este caso, pero no soporta rangos ni ORDER BY.</p>
            </div>
            <div className={styles.tipoCard}>
              <h4>Full-text</h4>
              <p>Para texto libre: <code>WHERE descripcion LIKE &apos;%laptop%&apos;</code> con relevancia y stemming.</p>
            </div>
            <div className={styles.tipoCard}>
              <h4>Compuesto</h4>
              <p>Varias columnas juntas: <code>(ciudad, categoria)</code>. El orden importa — solo aprovecha las columnas de izquierda a derecha.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <strong>El coste de los índices:</strong> escritura más lenta (hay que actualizar el índice) y más espacio
            en disco. Regla práctica: indexa columnas usadas frecuentemente en WHERE, JOIN y ORDER BY. No indexes todo.
          </div>
        </section>
      )}

      {/* ── Tab 4: ACID y SQL vs NoSQL ── */}
      {tabActivo === 'acid' && (
        <section className={styles.content}>
          <h2>Transacciones ACID</h2>
          <p className={styles.intro}>
            ¿Qué ocurre si el servidor se cae en mitad de una transferencia bancaria? ACID es la promesa que garantiza
            que los datos siempre quedan en un estado correcto.
          </p>

          <div className={styles.escenarioBox}>
            <h3>Escenario: transferencia de 100 € de Ana a Carlos</h3>
            <pre className={styles.sqlCode}>
              <code>{`BEGIN TRANSACTION;\n  UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;  -- Ana\n  UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;  -- Carlos\nCOMMIT;  -- solo aquí se hace permanente\n-- Si algo falla → ROLLBACK automático`}</code>
            </pre>
          </div>

          <div className={styles.acidGrid}>
            <div className={styles.acidCard}>
              <div className={styles.acidLetra}>A</div>
              <h3>Atomicidad</h3>
              <p>
                La transacción es <strong>todo o nada</strong>. Si el paso 2 falla, el paso 1 se revierte
                automáticamente. Nunca queda un estado intermedio.
              </p>
            </div>
            <div className={styles.acidCard}>
              <div className={styles.acidLetra}>C</div>
              <h3>Consistencia</h3>
              <p>
                La BD siempre pasa de un <strong>estado válido a otro estado válido</strong>. Las reglas de integridad
                (PK, FK, restricciones) siempre se cumplen.
              </p>
            </div>
            <div className={styles.acidCard}>
              <div className={styles.acidLetra}>I</div>
              <h3>Aislamiento</h3>
              <p>
                Las transacciones concurrentes <strong>no se interfieren</strong> entre sí. El resultado es como si se
                hubieran ejecutado en serie, una detrás de otra.
              </p>
            </div>
            <div className={styles.acidCard}>
              <div className={styles.acidLetra}>D</div>
              <h3>Durabilidad</h3>
              <p>
                Una vez confirmada (COMMIT), la transacción <strong>sobrevive a fallos</strong> del sistema. Los datos se
                escriben en disco antes de confirmar.
              </p>
            </div>
          </div>

          <h2 className={styles.subheadingH2}>SQL vs NoSQL — ¿Cuándo usar cada uno?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable} aria-label="Comparativa SQL vs NoSQL">
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>SQL (Relacional)</th>
                  <th>NoSQL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Estructura de datos</td>
                  <td>Esquema fijo, tablas</td>
                  <td>Flexible, sin esquema fijo</td>
                </tr>
                <tr>
                  <td>Relaciones complejas</td>
                  <td className={styles.celVerde}>Excelente (JOINs)</td>
                  <td className={styles.celAmbar}>Limitado</td>
                </tr>
                <tr>
                  <td>Consistencia</td>
                  <td className={styles.celVerde}>ACID garantizado</td>
                  <td className={styles.celAmbar}>Variable (BASE)</td>
                </tr>
                <tr>
                  <td>Escalabilidad horizontal</td>
                  <td className={styles.celAmbar}>Difícil</td>
                  <td className={styles.celVerde}>Diseñado para ello</td>
                </tr>
                <tr>
                  <td>Consultas ad-hoc</td>
                  <td className={styles.celVerde}>SQL muy potente</td>
                  <td className={styles.celAmbar}>Depende del motor</td>
                </tr>
                <tr>
                  <td>Escritura masiva</td>
                  <td className={styles.celAmbar}>Limitada</td>
                  <td className={styles.celVerde}>Excelente</td>
                </tr>
                <tr>
                  <td>Ejemplos</td>
                  <td>PostgreSQL, MySQL</td>
                  <td>MongoDB, Redis, Cassandra</td>
                </tr>
                <tr>
                  <td>Ideal para</td>
                  <td>Banca, ERP, e-commerce</td>
                  <td>Redes sociales, IoT, caché</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.warningBox}>
            <strong>El mito "NoSQL es más rápido":</strong> depende del caso de uso. Para lecturas simples por clave:
            sí. Para consultas complejas con agregaciones y relaciones: no necesariamente. NoSQL no es incorrecto ni
            mejor — es diferente. Elige según los datos y los patrones de acceso.
          </div>
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection title="Para profundizar: ORM, N+1 y más" subtitle="Conceptos avanzados para entender mejor las bases de datos relacionales">
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h3>¿Qué es un ORM?</h3>
            <p>
              Un ORM (Object-Relational Mapper) es una capa de abstracción que permite interactuar con la base de datos
              usando objetos del lenguaje de programación en lugar de SQL directo. Ejemplos: Hibernate (Java),
              SQLAlchemy (Python), Prisma (JavaScript). Ventaja: menos SQL repetitivo. Inconveniente: puede generar
              consultas ineficientes si no se usa con cuidado.
            </p>
          </div>
          <div className={styles.eduCard}>
            <h3>El problema N+1</h3>
            <p>
              Error clásico con ORMs: primero consultas N registros (1 query), y luego para cada registro haces otra
              consulta adicional (N queries). Total: N+1 queries cuando podría ser 1 con JOIN. La solución es el{' '}
              <em>eager loading</em> (incluir los datos relacionados en la consulta original).
            </p>
          </div>
          <div className={styles.eduCard}>
            <h3>PostgreSQL vs MySQL</h3>
            <p>
              PostgreSQL: más completo (JSON nativo, arrays, extensiones), cumplimiento SQL más estricto, mejor para
              consultas complejas. MySQL: más sencillo, enorme ecosistema, preferido en aplicaciones web tradicionales
              (LAMP stack). Ambos son excelentes opciones para la mayoría de proyectos.
            </p>
          </div>
          <div className={styles.eduCard}>
            <h3>Índice compuesto: el orden importa</h3>
            <p>
              Un índice sobre <code>(ciudad, categoria)</code> aprovecha la búsqueda si filtras por ciudad sola, o por
              ciudad + categoria. Pero NO si filtras solo por categoria. La regla: el índice solo es útil de
              izquierda a derecha, sin saltar columnas.
            </p>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-base-datos-relacional')} />
      <ShareCard appName="visualizador-base-datos-relacional" />
      <Footer appName="visualizador-base-datos-relacional" />
    </div>
  );
}
