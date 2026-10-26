'use client';

/**
 * Pestaña «Desde la ecuación general» (26/10/2026, semilla S0228): el alumno escribe los cinco
 * coeficientes de Ax² + Cy² + Dx + Ey + F = 0 y ve la cónica completada paso a paso, con su
 * tipo, sus elementos y su dibujo.
 *
 * Aquí no se calcula NADA: todo sale de `analizarConica` (./motor.ts), la misma función de la
 * que salen las respuestas de los casos para clase.
 *
 * La gráfica lleva su propia escala, a diferencia de las otras pestañas (fija, de −6 a 6): una
 * ecuación tecleada puede ser la sala elíptica de 13 m de semieje del caso 12.
 */

import { useMemo, useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './GeometriaAnalitica.module.css';
import { analizarConica, cifra, escribirGeneral, type Analisis, type Coeficientes, type Punto } from './motor';

const SVG_SIZE = 350;
const ORIGEN = SVG_SIZE / 2;

type Campo = keyof Coeficientes;

const CAMPOS: readonly { id: Campo; tras: string; nombre: string }[] = [
  { id: 'A', tras: 'x²', nombre: 'Coeficiente A, el de x²' },
  { id: 'C', tras: 'y²', nombre: 'Coeficiente C, el de y²' },
  { id: 'D', tras: 'x', nombre: 'Coeficiente D, el de x' },
  { id: 'E', tras: 'y', nombre: 'Coeficiente E, el de y' },
  { id: 'F', tras: '= 0', nombre: 'Término independiente F' },
];

const EJEMPLOS: readonly { nombre: string; co: Coeficientes }[] = [
  { nombre: 'Circunferencia', co: { A: 1, C: 1, D: -4, E: 6, F: -12 } },
  { nombre: 'Elipse', co: { A: 4, C: 9, D: -16, E: 18, F: -11 } },
  { nombre: 'Parábola', co: { A: 1, C: 0, D: -4, E: -8, F: 28 } },
  { nombre: 'Hipérbola', co: { A: 4, C: -1, D: -8, E: -4, F: -4 } },
];

/** «−16» → «-16», que es lo que lee parseSpanishNumber; vacío cuenta como 0 (el término no está). */
function leer(texto: string): number {
  const limpio = texto.trim().replace(/[−–]/g, '-');
  if (limpio === '') return 0;
  return parseSpanishNumber(limpio);
}

/** El coeficiente como lo escribiría el alumno: «−16», «0,5». */
function comoTexto(n: number): string {
  return cifra(n);
}

function textosDe(co: Coeficientes): Record<Campo, string> {
  return { A: comoTexto(co.A), C: comoTexto(co.C), D: comoTexto(co.D), E: comoTexto(co.E), F: comoTexto(co.F) };
}

/* ─────────────────────────── Gráfica ─────────────────────────── */

/** Los puntos que tienen que caber en la ventana. */
function puntosDeEncuadre(an: Analisis): Punto[] {
  const pts: Punto[] = [...an.focos, ...an.vertices];
  const c = an.centro;
  if (c) {
    pts.push(c);
    if (an.tipo === 'circunferencia') pts.push({ x: c.x + an.radio, y: c.y + an.radio }, { x: c.x - an.radio, y: c.y - an.radio });
    if (an.tipo === 'elipse' || an.tipo === 'hiperbola') {
      const [dx, dy] = an.eje === 'horizontal' ? [an.a, an.b] : [an.b, an.a];
      pts.push({ x: c.x + dx, y: c.y + dy }, { x: c.x - dx, y: c.y - dy });
    }
  }
  if (an.vertice && an.tipo === 'parabola') {
    const v = an.vertice;
    const ancho = 4 * Math.abs(an.p);
    pts.push(an.eje === 'vertical' ? { x: v.x + ancho, y: v.y + 2 * an.p } : { x: v.x + 2 * an.p, y: v.y + ancho });
    pts.push(an.eje === 'vertical' ? { x: v.x - ancho, y: v.y } : { x: v.x, y: v.y - ancho });
  }
  for (const r of an.rectas.paralelas) pts.push(r.eje === 'x' ? { x: r.valor, y: 0 } : { x: 0, y: r.valor });
  return pts;
}

/** Medio ancho de la ventana (en unidades) y separación de la cuadrícula. */
function encuadre(an: Analisis): { rango: number; paso: number } {
  const extension = Math.max(5, ...puntosDeEncuadre(an).map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)) * 1.15));
  const paso = extension <= 8 ? 1 : extension <= 16 ? 2 : extension <= 40 ? 5 : extension <= 80 ? 10 : 50;
  return { rango: Math.ceil(extension / paso) * paso, paso };
}

interface GraficaProps {
  an: Analisis;
}

function GraficaConica({ an }: GraficaProps) {
  const { rango, paso } = encuadre(an);
  const esc = ORIGEN / rango;
  const sx = (x: number) => Math.max(-20, Math.min(SVG_SIZE + 20, ORIGEN + x * esc));
  const sy = (y: number) => Math.max(-20, Math.min(SVG_SIZE + 20, ORIGEN - y * esc));
  const polilinea = (pts: Punto[]) => pts.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ');

  const marcas: number[] = [];
  for (let t = -rango; t <= rango; t += paso) if (t !== 0) marcas.push(t);

  const curvas: { clave: string; puntos: string }[] = [];
  const lineas: { clave: string; x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  const N = 160;
  const c = an.centro;

  if (an.tipo === 'elipse' && c) {
    const [rx, ry] = an.eje === 'horizontal' ? [an.a, an.b] : [an.b, an.a];
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const t = (2 * Math.PI * i) / N;
      return { x: c.x + rx * Math.cos(t), y: c.y + ry * Math.sin(t) };
    });
    curvas.push({ clave: 'elipse', puntos: polilinea(pts) });
  }
  if (an.tipo === 'hiperbola' && c) {
    const lejos = 3 * rango + Math.abs(c.x) + Math.abs(c.y);
    const tMax = Math.acosh(Math.max(1.0001, lejos / an.a));
    for (const signo of [1, -1]) {
      const pts = Array.from({ length: N + 1 }, (_, i) => {
        const t = -tMax + (2 * tMax * i) / N;
        const real = signo * an.a * Math.cosh(t);
        const imag = an.b * Math.sinh(t);
        return an.eje === 'horizontal' ? { x: c.x + real, y: c.y + imag } : { x: c.x + imag, y: c.y + real };
      });
      curvas.push({ clave: `rama${signo}`, puntos: polilinea(pts) });
    }
    for (const m of [an.pendienteAsintota, -an.pendienteAsintota]) {
      const x1 = -2 * rango;
      const x2 = 2 * rango;
      lineas.push({ clave: `asintota${m}`, x1: sx(x1), y1: sy(c.y + m * (x1 - c.x)), x2: sx(x2), y2: sy(c.y + m * (x2 - c.x)), color: '#FF9F43' });
    }
  }
  if (an.tipo === 'parabola' && an.vertice) {
    const v = an.vertice;
    const tMax = 2 * rango + Math.abs(v.x) + Math.abs(v.y);
    const pts = Array.from({ length: N + 1 }, (_, i) => {
      const t = -tMax + (2 * tMax * i) / N;
      const w = (t * t) / (4 * an.p);
      return an.eje === 'vertical' ? { x: v.x + t, y: v.y + w } : { x: v.x + w, y: v.y + t };
    });
    curvas.push({ clave: 'parabola', puntos: polilinea(pts) });
  }
  if (an.directriz) {
    const d = an.directriz;
    lineas.push(
      d.eje === 'y'
        ? { clave: 'directriz', x1: 0, y1: sy(d.valor), x2: SVG_SIZE, y2: sy(d.valor), color: '#FF6B6B' }
        : { clave: 'directriz', x1: sx(d.valor), y1: 0, x2: sx(d.valor), y2: SVG_SIZE, color: '#FF6B6B' },
    );
  }
  if (an.tipo === 'rectas-secantes' && c) {
    for (const m of an.rectas.pendientes) {
      const x1 = -2 * rango;
      const x2 = 2 * rango;
      lineas.push({ clave: `recta${m}`, x1: sx(x1), y1: sy(c.y + m * (x1 - c.x)), x2: sx(x2), y2: sy(c.y + m * (x2 - c.x)), color: '#2E86AB' });
    }
  }
  for (const r of an.rectas.paralelas) {
    lineas.push(
      r.eje === 'x'
        ? { clave: `paralela${r.valor}`, x1: sx(r.valor), y1: 0, x2: sx(r.valor), y2: SVG_SIZE, color: '#2E86AB' }
        : { clave: `paralela${r.valor}`, x1: 0, y1: sy(r.valor), x2: SVG_SIZE, y2: sy(r.valor), color: '#2E86AB' },
    );
  }

  const punto = (p: Punto, color: string, etiqueta: string, clave: string) => (
    <g key={clave}>
      <circle cx={sx(p.x)} cy={sy(p.y)} r={4} fill={color} />
      <text x={sx(p.x) + 6} y={sy(p.y) - 6} fontSize="10" fill={color} fontWeight="600">{etiqueta}</text>
    </g>
  );

  return (
    <svg
      width={SVG_SIZE}
      height={SVG_SIZE}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className={styles.svgCanvas}
      role="img"
      aria-label={`Gráfica de la cónica: ${an.nombre}`}
    >
      <g aria-hidden="true">
        {marcas.map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={0} x2={sx(t)} y2={SVG_SIZE} stroke="#e0e0e0" strokeWidth="0.5" />
            <line x1={0} y1={sy(t)} x2={SVG_SIZE} y2={sy(t)} stroke="#e0e0e0" strokeWidth="0.5" />
          </g>
        ))}
        <line x1={0} y1={ORIGEN} x2={SVG_SIZE} y2={ORIGEN} stroke="#999" strokeWidth="1.2" />
        <line x1={ORIGEN} y1={0} x2={ORIGEN} y2={SVG_SIZE} stroke="#999" strokeWidth="1.2" />
        <text x={SVG_SIZE - 4} y={ORIGEN - 8} fontSize="11" fill="#888" textAnchor="end">x</text>
        <text x={ORIGEN + 6} y={10} fontSize="11" fill="#888">y</text>
        {/* Sin rótulo en los bordes (±rango): se cortaría contra el marco. */}
        {marcas.filter((t) => Math.round(t / paso) % 2 === 0 && Math.abs(t) < rango).map((t) => (
          <g key={`n${t}`}>
            <text x={sx(t)} y={ORIGEN + 14} fontSize="9" fill="#999" textAnchor="middle">{cifra(t)}</text>
            <text x={ORIGEN - 5} y={sy(t) + 3} fontSize="9" fill="#999" textAnchor="end">{cifra(t)}</text>
          </g>
        ))}
      </g>
      {lineas.map((l) => (
        <line key={l.clave} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="1.5" strokeDasharray="6,4" />
      ))}
      {an.tipo === 'circunferencia' && c && (
        <circle cx={sx(c.x)} cy={sy(c.y)} r={an.radio * esc} fill="none" stroke="#2E86AB" strokeWidth="2.5" />
      )}
      {curvas.map((cv) => (
        <polyline key={cv.clave} points={cv.puntos} fill="none" stroke="#2E86AB" strokeWidth="2.5" />
      ))}
      {c && an.tipo !== 'vacia' && punto(c, '#48A9A6', 'C', 'centro')}
      {an.tipo === 'parabola' && an.vertice && punto(an.vertice, '#48A9A6', 'V', 'vertice')}
      {an.tipo !== 'parabola' && an.vertices.map((v, i) => punto(v, '#5B9BC4', '', `v${i}`))}
      {an.focos.map((f, i) => punto(f, '#E84A5F', an.focos.length > 1 ? `F${i === 0 ? '₁' : '₂'}` : 'F', `f${i}`))}
      {an.tipo === 'vacia' && (
        <text x={ORIGEN} y={40} fontSize="12" fill="#888" textAnchor="middle">Ningún punto que dibujar</text>
      )}
    </svg>
  );
}

/* ─────────────────────────── Pestaña ─────────────────────────── */

/** Los elementos que se enseñan bajo la ecuación reducida, según la cónica. */
function elementos(an: Analisis): string[] {
  const p = (q: Punto) => `(${cifra(q.x)}, ${cifra(q.y)})`;
  const filas: string[] = [];
  if (an.centro && an.tipo !== 'vacia') filas.push(`${an.tipo === 'punto' ? 'Punto' : 'Centro'}: ${p(an.centro)}`);
  if (an.tipo === 'circunferencia') filas.push(`Radio: ${cifra(an.radio)}`);
  if (an.tipo === 'elipse' || an.tipo === 'hiperbola') {
    filas.push(`Eje ${an.tipo === 'elipse' ? 'mayor' : 'real'}: ${an.eje}`);
    filas.push(`a = ${cifra(an.a)}`, `b = ${cifra(an.b)}`, `c = ${cifra(an.c)}`);
    filas.push(`Vértices: ${an.vertices.map(p).join(' y ')}`);
    filas.push(`Focos: ${an.focos.map(p).join(' y ')}`);
    filas.push(`Distancia entre focos: ${cifra(2 * an.c)}`);
  }
  if (an.tipo === 'hiperbola') filas.push(`Asíntotas: pendiente ± ${cifra(an.pendienteAsintota)}`);
  if (an.tipo === 'parabola' && an.vertice && an.directriz) {
    filas.push(`Vértice: ${p(an.vertice)}`, `Eje: ${an.eje}`, `Foco: ${p(an.focos[0])}`);
    filas.push(`Directriz: ${an.directriz.eje} = ${cifra(an.directriz.valor)}`, `Vértice–foco: ${cifra(Math.abs(an.p))}`);
  }
  if (Number.isFinite(an.excentricidad)) filas.push(`Excentricidad: ${cifra(an.excentricidad)}`);
  return filas;
}

export default function EcuacionGeneral() {
  const [textos, setTextos] = useState<Record<Campo, string>>(() => textosDe(EJEMPLOS[1].co));

  const coeficientes = useMemo(() => {
    const co: Coeficientes = { A: leer(textos.A), C: leer(textos.C), D: leer(textos.D), E: leer(textos.E), F: leer(textos.F) };
    const malos = CAMPOS.filter((c) => !Number.isFinite(co[c.id])).map((c) => c.id);
    return { co, malos };
  }, [textos]);

  const an = useMemo<Analisis | null>(
    () => (coeficientes.malos.length === 0 ? analizarConica(coeficientes.co) : null),
    [coeficientes],
  );

  return (
    <div className={styles.visorWrapper}>
      <div className={styles.ecuacionEditor}>
        <p className={styles.ecuacionAyuda}>
          Escribe los coeficientes de tu ecuación. Deja en blanco (o en 0) los términos que no
          aparecen; para restar, escribe el coeficiente con signo menos.
        </p>
        <div className={styles.ecuacionCampos}>
          {CAMPOS.map((c, i) => (
            <span key={c.id} className={styles.coefGrupo}>
              {i > 0 && <span className={styles.coefSigno} aria-hidden="true">+</span>}
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                id={`coef-${c.id}`}
                className={styles.coefInput}
                aria-label={c.nombre}
                aria-invalid={coeficientes.malos.includes(c.id)}
                value={textos[c.id]}
                onChange={(e) => setTextos({ ...textos, [c.id]: e.target.value })}
              />
              <span className={styles.coefLiteral} aria-hidden="true">{c.tras}</span>
            </span>
          ))}
        </div>
        <div className={styles.ejemplosFila}>
          <span className={styles.ejemplosLabel}>Ejemplos:</span>
          {EJEMPLOS.map((ej) => (
            <button
              key={ej.nombre}
              type="button"
              className={styles.ejemploBtn}
              aria-label={`Ejemplo: ${ej.nombre}`}
              onClick={() => setTextos(textosDe(ej.co))}
            >
              {ej.nombre}
            </button>
          ))}
        </div>
      </div>

      {coeficientes.malos.length > 0 && (
        <p className={styles.ecuacionAviso} role="alert">
          {coeficientes.malos.length === 1 ? 'El coeficiente' : 'Los coeficientes'} {coeficientes.malos.join(', ')}{' '}
          {coeficientes.malos.length === 1 ? 'no es un número' : 'no son números'}. Usa la coma decimal, por ejemplo −2,5.
        </p>
      )}

      {an && !an.ok && (
        <p className={styles.ecuacionAviso} role="alert">{an.error}</p>
      )}

      {an && an.ok && (
        <>
          <GraficaConica an={an} />
          <div className={styles.panelEcuacion} aria-live="polite">
            <div className={styles.ecuacionTitulo}>Ecuación general</div>
            <div className={styles.ecuacion}>{escribirGeneral(coeficientes.co)}</div>
            <div className={styles.ecuacionTitulo}>Qué es</div>
            <div className={styles.tipoConica} id="ecuacion-tipo">{an.nombre}</div>
            {an.reducida && (
              <>
                <div className={styles.ecuacionTitulo}>Ecuación reducida</div>
                <div className={styles.ecuacion} id="ecuacion-reducida">{an.reducida}</div>
              </>
            )}
            <div className={styles.infoNotables}>
              {elementos(an).map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </div>
          <div className={styles.pasosPanel}>
            <h3 className={styles.pasosTitulo}>Paso a paso</h3>
            <ol className={styles.pasosLista}>
              {an.pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
