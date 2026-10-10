'use client';
// @disclaimer: exempt — calculadora genérica: aplica la escala que escribe el usuario, sin tablas oficiales precargadas

import { useMemo, useState } from 'react';
import styles from './CalculadoraTramos.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, formatPercentage, parseSpanishNumber } from '@/lib';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  calcularEscalonado,
  calcularProgresivo,
  calcularUmbrales,
  curvaProgresiva,
  segmentosEscalonados,
  validarTramos,
  type ModoTipo,
  type Tramo,
  type Umbral,
} from './motor';

// ─── Estado editable ──────────────────────────────────────────────────────

interface FilaEditable {
  /** Límite superior escrito por el usuario; en la última fila se ignora (sin límite). */
  hasta: string;
  tipo: string;
}

interface Ejemplo {
  id: string;
  nombre: string;
  icono: string;
  modo: ModoTipo;
  simbolo: string;
  unidad: string;
  base: string;
  filas: FilaEditable[];
}

const EJEMPLOS: Ejemplo[] = [
  {
    id: 'impuesto',
    nombre: 'Impuesto progresivo',
    icono: '🏛️',
    modo: 'porcentaje',
    simbolo: '€',
    unidad: '',
    base: '33.000',
    filas: [
      { hasta: '10.000', tipo: '0' },
      { hasta: '30.000', tipo: '15' },
      { hasta: '60.000', tipo: '25' },
      { hasta: '', tipo: '35' },
    ],
  },
  {
    id: 'comision',
    nombre: 'Comisión por ventas',
    icono: '🤝',
    modo: 'porcentaje',
    simbolo: '€',
    unidad: '',
    base: '26.000',
    filas: [
      { hasta: '10.000', tipo: '2' },
      { hasta: '25.000', tipo: '4' },
      { hasta: '', tipo: '6' },
    ],
  },
  {
    id: 'agua',
    nombre: 'Tarifa por bloques',
    icono: '💧',
    modo: 'precio',
    simbolo: '€',
    unidad: 'm³',
    base: '18',
    filas: [
      { hasta: '10', tipo: '0,50' },
      { hasta: '20', tipo: '1,00' },
      { hasta: '', tipo: '2,00' },
    ],
  },
  {
    id: 'volumen',
    nombre: 'Descuento por volumen',
    icono: '📦',
    modo: 'precio',
    simbolo: '€',
    unidad: 'ud.',
    base: '120',
    filas: [
      { hasta: '100', tipo: '10' },
      { hasta: '500', tipo: '8' },
      { hasta: '', tipo: '6' },
    ],
  },
];

// ─── Formato ──────────────────────────────────────────────────────────────

const NBSP = ' ';

/** Decimales que de verdad tiene un número escrito por el usuario (0 a 4). */
function decimalesDe(n: number): number {
  for (let d = 0; d < 4; d++) {
    if (Math.abs(n * 10 ** d - Math.round(n * 10 ** d)) < 1e-9) return d;
  }
  return 4;
}

const fmtValor = (n: number) => formatNumber(n, decimalesDe(n));

// ─── Gráfica ──────────────────────────────────────────────────────────────

/** Paso «redondo» (1, 2, 2,5 o 5 por potencia de 10) para unos 4-5 ticks. */
function pasoRedondo(max: number): number {
  if (max <= 0) return 1;
  const bruto = max / 4;
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const r = bruto / pot;
  const m = r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10;
  return m * pot;
}

const ANCHO = 640;
const ALTO = 320;
const M = { izq: 64, der: 16, sup: 16, inf: 40 };

export default function CalculadoraTramosPage() {
  const [modo, setModo] = useState<ModoTipo>(EJEMPLOS[0].modo);
  const [simbolo, setSimbolo] = useState(EJEMPLOS[0].simbolo);
  const [unidad, setUnidad] = useState(EJEMPLOS[0].unidad);
  const [base, setBase] = useState(EJEMPLOS[0].base);
  const [filas, setFilas] = useState<FilaEditable[]>(EJEMPLOS[0].filas);

  const cargarEjemplo = (e: Ejemplo) => {
    setModo(e.modo);
    setSimbolo(e.simbolo);
    setUnidad(e.unidad);
    setBase(e.base);
    setFilas(e.filas.map((f) => ({ ...f })));
  };

  const editarFila = (i: number, campo: keyof FilaEditable, valor: string) => {
    setFilas((prev) => prev.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));
  };

  const anadirTramo = () => {
    setFilas((prev) => {
      // El tramo nuevo entra justo antes del último (el que no tiene límite), con un límite
      // que duplica el anterior y el mismo tipo que el último, para que se pueda retocar.
      const finitos = prev.slice(0, -1).map((f) => parseSpanishNumber(f.hasta)).filter((n) => Number.isFinite(n));
      const ultimoLimite = finitos.length ? finitos[finitos.length - 1] : 0;
      const nuevoLimite = ultimoLimite > 0 ? ultimoLimite * 2 : 1000;
      const ultima = prev[prev.length - 1];
      const nueva: FilaEditable = { hasta: formatNumber(nuevoLimite, decimalesDe(nuevoLimite)), tipo: ultima.tipo };
      return [...prev.slice(0, -1), nueva, ultima];
    });
  };

  const quitarTramo = (i: number) => {
    setFilas((prev) => (prev.length <= 1 ? prev : prev.filter((_, j) => j !== i)));
  };

  // ─── Cálculo ────────────────────────────────────────────────────────────
  const calculo = useMemo(() => {
    const tramos: Tramo[] = filas.map((f, i) => ({
      hasta: i === filas.length - 1 ? null : parseSpanishNumber(f.hasta),
      tipo: parseSpanishNumber(f.tipo),
    }));
    const error = validarTramos(tramos, modo);
    if (error) return { error } as const;
    const b = parseSpanishNumber(base);
    if (!Number.isFinite(b) || b < 0) return { error: 'Escribe una cantidad mayor o igual que cero.' } as const;
    return {
      error: null,
      tramos,
      base: b,
      prog: calcularProgresivo(b, tramos, modo),
      esc: calcularEscalonado(b, tramos, modo),
      umbrales: calcularUmbrales(tramos, modo),
    } as const;
  }, [filas, modo, base]);

  // Textos que dependen del modo
  const sufijoImporte = simbolo.trim() ? `${NBSP}${simbolo.trim()}` : '';
  const sufijoBase = modo === 'porcentaje' ? sufijoImporte : unidad.trim() ? `${NBSP}${unidad.trim()}` : '';
  const fmtImporte = (n: number) => `${formatNumber(n, 2)}${sufijoImporte}`;
  const fmtBase = (n: number) => `${fmtValor(n)}${sufijoBase}`;
  // Un límite de zona sale de una división (10.000 / 0,85): se redondea a 2 decimales
  const fmtLimiteZona = (n: number) => `${formatNumber(n, Number.isInteger(n) ? 0 : 2)}${sufijoBase}`;
  const fmtTipo = (t: number) =>
    modo === 'porcentaje'
      ? `${fmtValor(t)}${NBSP}%`
      : `${fmtValor(t)}${sufijoImporte}${unidad.trim() ? `/${unidad.trim()}` : ' por unidad'}`;
  const fmtTipoMedio = (t: number | null) => {
    if (t === null) return '—';
    return modo === 'porcentaje'
      ? formatPercentage(t, 2)
      : `${formatNumber(t, 3)}${sufijoImporte}${unidad.trim() ? `/${unidad.trim()}` : ' por unidad'}`;
  };

  // ─── Datos de la gráfica ────────────────────────────────────────────────
  const grafica = useMemo(() => {
    if (calculo.error !== null) return null;
    const { tramos, base: b } = calculo;
    const limites = tramos.map((t) => t.hasta).filter((h): h is number => h !== null);
    const ultimoLimite = limites.length ? limites[limites.length - 1] : 0;
    const crudo = Math.max(b * 1.25, ultimoLimite * 1.2, 1);
    const pasoX = pasoRedondo(crudo);
    const xMax = Math.ceil(crudo / pasoX) * pasoX;
    const prog = curvaProgresiva(tramos, modo, xMax);
    const esc = segmentosEscalonados(tramos, modo, xMax);
    const yCrudo = Math.max(...prog.map((p) => p.y), ...esc.map((s) => Math.max(s.y1, s.y2)), 1e-9);
    const pasoY = pasoRedondo(yCrudo);
    const yMax = Math.ceil(yCrudo / pasoY) * pasoY;
    const ancho = ANCHO - M.izq - M.der;
    const alto = ALTO - M.sup - M.inf;
    const sx = (x: number) => M.izq + (x / xMax) * ancho;
    const sy = (y: number) => M.sup + alto - (y / yMax) * alto;
    const ticksX: number[] = [];
    for (let x = 0; x <= xMax + pasoX / 2; x += pasoX) ticksX.push(x);
    const ticksY: number[] = [];
    for (let y = 0; y <= yMax + pasoY / 2; y += pasoY) ticksY.push(y);
    const zonas = calculo.umbrales
      .filter((u): u is Umbral & { zona: NonNullable<Umbral['zona']> } => u.zona !== null && u.limite < xMax)
      .map((u) => ({ x1: sx(u.limite), x2: sx(Math.min(u.zona.hasta, xMax)) }));
    return { xMax, sx, sy, ticksX, ticksY, prog, esc, zonas, ancho, alto };
  }, [calculo, modo]);

  // Zona en la que cae la base actual (para el aviso de debajo de los resultados)
  const zonaActual =
    calculo.error === null
      ? calculo.umbrales.find((u) => u.zona !== null && calculo.base > u.limite && calculo.base < u.zona.hasta) ?? null
      : null;

  return (
    <>
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">📶</span> Calculadora por Tramos
          </h1>
          <p className={styles.subtitle}>
            Escribe tus tramos y una cantidad: verás lo que sale en cada tramo y el total, calculando por tramos o al
            tramo alcanzado.
          </p>
        </header>

        <LegalNotice />

        {/* ─── Configuración ─── */}
        <section className={styles.panel} aria-labelledby="titulo-escala">
          <h2 id="titulo-escala" className={styles.panelTitulo}>
            1. Tu escala de tramos
          </h2>

          <div className={styles.ejemplos}>
            <span className={styles.etiqueta}>Cargar un ejemplo:</span>
            {EJEMPLOS.map((e) => (
              <button key={e.id} type="button" className={styles.btnEjemplo} onClick={() => cargarEjemplo(e)}>
                <span aria-hidden="true">{e.icono}</span> {e.nombre}
              </button>
            ))}
          </div>

          <div className={styles.opciones}>
            <div className={styles.grupo} role="group" aria-label="Cómo se expresa el tipo de cada tramo">
              <span className={styles.etiqueta}>El tipo de cada tramo es:</span>
              <div className={styles.toggle}>
                <button
                  type="button"
                  aria-pressed={modo === 'porcentaje'}
                  className={modo === 'porcentaje' ? styles.toggleActivo : styles.toggleBoton}
                  onClick={() => setModo('porcentaje')}
                >
                  Un porcentaje (%)
                </button>
                <button
                  type="button"
                  aria-pressed={modo === 'precio'}
                  className={modo === 'precio' ? styles.toggleActivo : styles.toggleBoton}
                  onClick={() => setModo('precio')}
                >
                  Un precio por unidad
                </button>
              </div>
            </div>

            <label className={styles.campoCorto}>
              <span className={styles.etiqueta}>Símbolo de moneda</span>
              <input
                type="text"
                value={simbolo}
                maxLength={4}
                onChange={(e) => setSimbolo(e.target.value)}
                placeholder="€, $, S/…"
                className={styles.input}
              />
            </label>

            {modo === 'precio' && (
              <label className={styles.campoCorto}>
                <span className={styles.etiqueta}>Unidad de la cantidad</span>
                <input
                  type="text"
                  value={unidad}
                  maxLength={12}
                  onChange={(e) => setUnidad(e.target.value)}
                  placeholder="m³, kWh, unidades…"
                  className={styles.input}
                />
              </label>
            )}
          </div>

          <div className={styles.tablaWrapper}>
            <table className={styles.tablaTramos}>
              <caption className={styles.srOnly}>Tramos de la escala: límites y tipo de cada uno</caption>
              <thead>
                <tr>
                  <th scope="col">Tramo</th>
                  <th scope="col">Desde</th>
                  <th scope="col">Hasta (incluido)</th>
                  <th scope="col">{modo === 'porcentaje' ? 'Tipo (%)' : 'Precio por unidad'}</th>
                  <th scope="col">
                    <span className={styles.srOnly}>Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => {
                  const esUltima = i === filas.length - 1;
                  const desdeNum = i === 0 ? 0 : parseSpanishNumber(filas[i - 1].hasta);
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className={styles.celdaDesde}>{Number.isFinite(desdeNum) ? fmtValor(desdeNum) : '—'}</td>
                      <td>
                        {esUltima ? (
                          <span className={styles.sinLimite}>sin límite</span>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            value={f.hasta}
                            onChange={(e) => editarFila(i, 'hasta', e.target.value)}
                            aria-label={`Límite superior del tramo ${i + 1}`}
                            className={styles.inputTabla}
                          />
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={f.tipo}
                          onChange={(e) => editarFila(i, 'tipo', e.target.value)}
                          aria-label={`${modo === 'porcentaje' ? 'Tipo en porcentaje' : 'Precio por unidad'} del tramo ${i + 1}`}
                          className={styles.inputTabla}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.btnQuitar}
                          onClick={() => quitarTramo(i)}
                          disabled={filas.length <= 1}
                          aria-label={`Quitar el tramo ${i + 1}`}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" className={styles.btnSecundario} onClick={anadirTramo}>
            + Añadir tramo
          </button>
          <p className={styles.nota}>
            Cada tramo empieza donde acaba el anterior. Una cantidad justo en el límite cuenta en el tramo de abajo.
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="titulo-cantidad">
          <h2 id="titulo-cantidad" className={styles.panelTitulo}>
            2. La cantidad
          </h2>
          <div className={styles.campoBase}>
            <NumberInput
              value={base}
              onChange={setBase}
              label={modo === 'porcentaje' ? 'Cantidad sobre la que se aplica la escala' : 'Cantidad consumida o comprada'}
              placeholder="0"
              min={0}
              suffix={modo === 'porcentaje' ? simbolo.trim() || undefined : unidad.trim() || undefined}
            />
          </div>
        </section>

        {/* ─── Resultados ─── */}
        <section className={styles.panel} aria-labelledby="titulo-resultado">
          <h2 id="titulo-resultado" className={styles.panelTitulo}>
            3. Resultado
          </h2>

          {calculo.error !== null ? (
            <div role="alert" className={styles.error}>
              {calculo.error}
            </div>
          ) : (
            <>
              <div className={styles.comparativa}>
                <div className={`${styles.tarjeta} ${styles.tarjetaProgresivo}`}>
                  <h3 className={styles.tarjetaTitulo}>Por tramos (progresivo)</h3>
                  <p className={styles.tarjetaTotal}>{fmtImporte(calculo.prog.total)}</p>
                  <dl className={styles.datos}>
                    <div>
                      <dt>Tipo medio</dt>
                      <dd>{fmtTipoMedio(calculo.prog.tipoMedio)}</dd>
                    </div>
                    <div>
                      <dt>Tipo marginal</dt>
                      <dd>
                        {fmtTipo(calculo.prog.tipoMarginal)} (tramo {calculo.prog.indiceMarginal + 1})
                      </dd>
                    </div>
                    {modo === 'porcentaje' && (
                      <div>
                        <dt>Queda (cantidad − importe)</dt>
                        <dd>{fmtImporte(calculo.base - calculo.prog.total)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className={`${styles.tarjeta} ${styles.tarjetaEscalonado}`}>
                  <h3 className={styles.tarjetaTitulo}>Al tramo alcanzado (escalonado)</h3>
                  <p className={styles.tarjetaTotal}>{fmtImporte(calculo.esc.total)}</p>
                  <dl className={styles.datos}>
                    <div>
                      <dt>Tipo aplicado a todo</dt>
                      <dd>
                        {fmtTipo(calculo.esc.tipo)} (tramo {calculo.esc.indiceAlcanzado + 1})
                      </dd>
                    </div>
                    <div>
                      <dt>Diferencia con el progresivo</dt>
                      <dd>
                        {calculo.esc.total - calculo.prog.total >= 0 ? '+' : ''}
                        {fmtImporte(calculo.esc.total - calculo.prog.total)}
                      </dd>
                    </div>
                    {modo === 'porcentaje' && (
                      <div>
                        <dt>Queda (cantidad − importe)</dt>
                        <dd>{fmtImporte(calculo.base - calculo.esc.total)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {zonaActual && zonaActual.zona && (
                <div className={styles.avisoZona}>
                  <strong>
                    <span aria-hidden="true">⚠️</span> Tu cantidad cae en una zona donde, al tramo alcanzado, más es
                    peor.
                  </strong>{' '}
                  {zonaActual.zona.tipo === 'neto' ? (
                    <>
                      Con {fmtBase(calculo.base)} quedan {fmtImporte(calculo.base - calculo.esc.total)}, menos que con
                      solo {fmtBase(zonaActual.limite)} ({fmtImporte(zonaActual.limite * (1 - zonaActual.tipoAntes / 100))}
                      ). Por tramos no ocurre: quedan {fmtImporte(calculo.base - calculo.prog.total)}.
                    </>
                  ) : (
                    <>
                      {fmtBase(calculo.base)} salen por {fmtImporte(calculo.esc.total)}, menos que{' '}
                      {fmtBase(zonaActual.limite)} (
                      {fmtImporte(zonaActual.limite * (modo === 'porcentaje' ? zonaActual.tipoAntes / 100 : zonaActual.tipoAntes))}
                      ).
                    </>
                  )}
                </div>
              )}

              <h3 className={styles.subtitulo}>Desglose tramo a tramo (por tramos)</h3>
              <div className={styles.tablaWrapper}>
                <table className={styles.tablaDesglose}>
                  <caption className={styles.srOnly}>
                    Parte de la cantidad que cae en cada tramo y su importe, calculando por tramos
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Tramo</th>
                      <th scope="col">De</th>
                      <th scope="col">A</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Cantidad en el tramo</th>
                      <th scope="col">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculo.prog.filas.map((f) => (
                      <tr
                        key={f.indice}
                        className={f.indice === calculo.prog.indiceMarginal ? styles.filaMarginal : undefined}
                      >
                        <td>{f.indice + 1}</td>
                        <td>{fmtValor(f.desde)}</td>
                        <td>{f.hasta === null ? 'en adelante' : fmtValor(f.hasta)}</td>
                        <td>{fmtTipo(f.tipo)}</td>
                        <td>{fmtBase(f.baseEnTramo)}</td>
                        <td>{fmtImporte(f.importe)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row" colSpan={4}>
                        Total
                      </th>
                      <td>{fmtBase(calculo.base)}</td>
                      <td>{fmtImporte(calculo.prog.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {grafica && (
                <figure className={styles.figura}>
                  <svg
                    viewBox={`0 0 ${ANCHO} ${ALTO}`}
                    className={styles.svg}
                    role="img"
                    aria-label={`Importe según la cantidad, de 0 a ${fmtValor(grafica.xMax)}. Por tramos sale ${fmtImporte(calculo.prog.total)} y al tramo alcanzado ${fmtImporte(calculo.esc.total)} para ${fmtBase(calculo.base)}.`}
                  >
                    {grafica.zonas.map((z, i) => (
                      <rect
                        key={i}
                        x={z.x1}
                        y={M.sup}
                        width={Math.max(0, z.x2 - z.x1)}
                        height={grafica.alto}
                        className={styles.zona}
                      />
                    ))}
                    {grafica.ticksY.map((y) => (
                      <g key={`y${y}`}>
                        <line x1={M.izq} x2={ANCHO - M.der} y1={grafica.sy(y)} y2={grafica.sy(y)} className={styles.rejilla} />
                        <text x={M.izq - 6} y={grafica.sy(y) + 4} textAnchor="end" className={styles.ejeTexto}>
                          {formatNumber(y, decimalesDe(y))}
                        </text>
                      </g>
                    ))}
                    {grafica.ticksX.map((x) => (
                      <text key={`x${x}`} x={grafica.sx(x)} y={ALTO - M.inf + 18} textAnchor="middle" className={styles.ejeTexto}>
                        {formatNumber(x, decimalesDe(x))}
                      </text>
                    ))}
                    <line x1={M.izq} x2={ANCHO - M.der} y1={M.sup + grafica.alto} y2={M.sup + grafica.alto} className={styles.eje} />
                    <line x1={M.izq} x2={M.izq} y1={M.sup} y2={M.sup + grafica.alto} className={styles.eje} />

                    {/* Al tramo alcanzado: un segmento por tramo, con hueco abierto al empezar y punto cerrado al acabar */}
                    {grafica.esc.map((s, i) => (
                      <g key={`e${i}`}>
                        <line
                          x1={grafica.sx(s.x1)}
                          y1={grafica.sy(s.y1)}
                          x2={grafica.sx(s.x2)}
                          y2={grafica.sy(s.y2)}
                          className={styles.lineaEscalonada}
                        />
                        {s.x1 > 0 && <circle cx={grafica.sx(s.x1)} cy={grafica.sy(s.y1)} r={4} className={styles.puntoAbierto} />}
                        {s.x2 < grafica.xMax && (
                          <circle cx={grafica.sx(s.x2)} cy={grafica.sy(s.y2)} r={4} className={styles.puntoCerrado} />
                        )}
                      </g>
                    ))}

                    {/* Por tramos: continua */}
                    <polyline
                      points={grafica.prog.map((p) => `${grafica.sx(p.x)},${grafica.sy(p.y)}`).join(' ')}
                      className={styles.lineaProgresiva}
                    />

                    {/* La cantidad elegida */}
                    {calculo.base <= grafica.xMax && (
                      <g>
                        <line
                          x1={grafica.sx(calculo.base)}
                          x2={grafica.sx(calculo.base)}
                          y1={M.sup}
                          y2={M.sup + grafica.alto}
                          className={styles.marcaBase}
                        />
                        <circle cx={grafica.sx(calculo.base)} cy={grafica.sy(calculo.prog.total)} r={5} className={styles.puntoProgresivo} />
                        <circle cx={grafica.sx(calculo.base)} cy={grafica.sy(calculo.esc.total)} r={5} className={styles.puntoEscalonado} />
                      </g>
                    )}
                  </svg>
                  <figcaption className={styles.leyenda}>
                    <span>
                      <span className={`${styles.muestra} ${styles.muestraProgresiva}`} aria-hidden="true" /> Por tramos
                    </span>
                    <span>
                      <span className={`${styles.muestra} ${styles.muestraEscalonada}`} aria-hidden="true" /> Al tramo
                      alcanzado
                    </span>
                    <span>
                      <span className={`${styles.muestra} ${styles.muestraBase}`} aria-hidden="true" /> Tu cantidad
                    </span>
                    {grafica.zonas.length > 0 && (
                      <span>
                        <span className={`${styles.muestra} ${styles.muestraZona}`} aria-hidden="true" /> Zona donde, al
                        tramo alcanzado, más es peor
                      </span>
                    )}
                  </figcaption>
                </figure>
              )}

              {calculo.umbrales.length > 0 && (
                <>
                  <h3 className={styles.subtitulo}>Qué pasa en cada límite (al tramo alcanzado)</h3>
                  <ul className={styles.listaUmbrales}>
                    {calculo.umbrales.map((u) => (
                      <li key={u.indice}>
                        <strong>Al pasar de {fmtBase(u.limite)}</strong> ({fmtTipo(u.tipoAntes)} → {fmtTipo(u.tipoDespues)}
                        ): el importe {u.salto > 0 ? 'salta' : u.salto < 0 ? 'cae' : 'no cambia'}
                        {u.salto !== 0 && <> {fmtImporte(Math.abs(u.salto))}</>} de golpe.
                        {u.zona && (
                          <>
                            {' '}
                            {u.zona.tipo === 'neto' ? 'Lo que queda es menor que en el límite' : 'Se paga menos que en el límite'}{' '}
                            {u.zona.infinita ? (
                              <>en adelante: la zona no se cierra.</>
                            ) : (
                              <>
                                hasta {fmtLimiteZona(u.zona.hasta)}
                                {u.zona.recortada
                                  ? ' (como mínimo: ahí acaba el tramo).'
                                  : fmtLimiteZona(u.zona.hasta).endsWith('.')
                                    ? ''
                                    : '.'}
                              </>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className={styles.nota}>Calculando por tramos no hay saltos: el importe crece sin cortes al cruzar cada límite.</p>
                </>
              )}
            </>
          )}
        </section>

        {/* ─── Contenido educativo ─── */}
        <EducationalSection
          icon="📚"
          title="Cómo funcionan las escalas por tramos"
          subtitle="Progresivo frente a escalonado, tipo medio y marginal, y los errores habituales"
        >
          <section className={styles.guideSection}>
            <h2>Dos maneras de aplicar la misma tabla</h2>
            <p>
              Una escala por tramos es una lista de límites con un tipo para cada intervalo. La misma lista se puede
              aplicar de dos maneras, y el resultado cambia mucho. <strong>Por tramos</strong> (también llamado
              progresivo o marginal), cada parte de la cantidad paga el tipo de su intervalo: así se calculan casi
              todos los impuestos sobre la renta. <strong>Al tramo alcanzado</strong> (escalonado), toda la cantidad
              paga el tipo del intervalo al que llega: así funcionan muchas comisiones, rappels y descuentos por
              volumen.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Aspecto</th>
                    <th scope="col">Por tramos (progresivo)</th>
                    <th scope="col">Al tramo alcanzado (escalonado)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A qué se aplica cada tipo</td>
                    <td>Solo a la parte que cae en su tramo</td>
                    <td>A toda la cantidad</td>
                  </tr>
                  <tr>
                    <td>Al cruzar un límite</td>
                    <td>El importe sigue creciendo sin saltos</td>
                    <td>El importe salta de golpe</td>
                  </tr>
                  <tr>
                    <td>¿Puede «más» salir peor?</td>
                    <td>No</td>
                    <td>Sí, justo por encima de cada límite</td>
                  </tr>
                  <tr>
                    <td>Uso típico</td>
                    <td>Impuesto sobre la renta, tarifas de agua por bloques</td>
                    <td>Comisiones por objetivo, descuentos por volumen, rappels</td>
                  </tr>
                  <tr>
                    <td>En matemáticas</td>
                    <td>Función lineal a trozos continua</td>
                    <td>Función lineal a trozos con saltos (discontinua)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Para quién es útil</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🧾</span> Quien quiere entender su impuesto
                </h3>
                <p>
                  Copia la escala de su país y ve qué parte de su ingreso paga cada tipo, cuál es su tipo marginal y
                  cuánto paga de verdad en proporción.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🤝</span> Quien diseña o cobra comisiones
                </h3>
                <p>
                  Compara un plan de comisiones por tramos con uno al tramo alcanzado y ve dónde se crean los saltos
                  que empujan a vender justo por encima del objetivo.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">💧</span> Quien revisa una factura por bloques
                </h3>
                <p>
                  Con el tipo como precio por unidad reproduce una tarifa de agua, gas o electricidad por bloques y
                  comprueba el importe de cada uno.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">📐</span> Quien estudia funciones a trozos
                </h3>
                <p>
                  Las dos curvas de la gráfica son el ejemplo cotidiano de una función continua y otra con saltos,
                  con la pendiente como tipo marginal.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Paso a paso</h2>
            <div className={styles.stepGuide}>
              {[
                ['Elige cómo es el tipo', 'Porcentaje para impuestos y comisiones; precio por unidad para tarifas y descuentos por volumen.'],
                ['Escribe los límites', 'Solo el «hasta» de cada tramo: el «desde» es el límite del anterior y el último no tiene tope.'],
                ['Escribe el tipo de cada tramo', 'Tal como aparece en la tabla que quieres reproducir (15 para un 15 %, 0,50 para 0,50 por m³).'],
                ['Introduce la cantidad', 'Ingreso, ventas, consumo o unidades compradas: el resultado se recalcula al momento.'],
                ['Compara las dos maneras', 'Mira el total de cada una, el desglose por tramos y la gráfica con las zonas marcadas.'],
              ].map(([titulo, texto], i) => (
                <div key={titulo} className={styles.step}>
                  <span className={styles.stepNumber}>{i + 1}</span>
                  <div className={styles.stepContent}>
                    <h3>{titulo}</h3>
                    <p>{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Buenas prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔍</span>
                <p>Comprueba en la fuente si la escala que copias se aplica por tramos o al tramo alcanzado: la tabla sola no lo dice.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎯</span>
                <p>Mira el tipo medio, no el marginal, para saber cuánto pagas en proporción a lo que tienes.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📏</span>
                <p>Revisa a qué tramo va una cantidad justo en el límite: aquí cuenta en el de abajo, que es lo habitual.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧮</span>
                <p>Un mínimo exento es un primer tramo al 0 %: escríbelo así y el resto de la escala sale bien.</p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <h2 className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span> Errores frecuentes
              </h2>
              <ul className={styles.warningList}>
                <li>Aplicar el tipo del último tramo a toda la cantidad cuando la escala es progresiva: sale mucho más de lo real.</li>
                <li>Creer que «subir de tramo» en un impuesto progresivo hace ganar menos: solo encarece la parte que pasa del límite.</li>
                <li>Confundir el tipo marginal con lo que se paga de media.</li>
                <li>Olvidar que deducciones, mínimos o bonificaciones de cada país no están en la escala y cambian el resultado final.</li>
                <li>Mezclar en la misma tabla límites de periodos distintos (mensuales y anuales).</li>
              </ul>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              {PREGUNTAS_FRECUENTES.map((f) => (
                <div key={f.question} className={styles.faqItem}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </EducationalSection>

        <RelatedApps />

        <ShareCard appName="calculadora-tramos" />

        <Footer appName="calculadora-tramos" />
      </div>
    </>
  );
}
