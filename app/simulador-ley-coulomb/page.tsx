'use client';
// @disclaimer: exempt

import { useMemo, useState, type ReactNode } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorLeyCoulomb.module.css';
import {
  MEDIOS,
  UNIDADES_CARGA,
  UNIDADES_DISTANCIA,
  UNIDADES_FUERZA,
  cargaParaFuerza,
  distanciaParaFuerza,
  fuerzaCoulomb,
  masaConElMismoPeso,
  type ResultadoCoulomb,
  type Unidad,
  type UnidadCarga,
  type UnidadDistancia,
  type UnidadFuerza,
} from './motor';
import { cientifica, cifraCorta, cifraLegible, cifraParaCampo, textoMasa } from './formato';
import CasosAula from './CasosAula';
import { PREGUNTAS_FRECUENTES } from './metadata';

// ============================================================
// Tipos y constantes de la vista
// ============================================================

type Incognita = 'fuerza' | 'distancia' | 'carga';
type Sentido = 'atraccion' | 'repulsion';

const ID_PERSONAL = 'personal';

/** Orden de las unidades de mayor a menor, para elegir la que deja la cifra entre 1 y 1000. */
const ORDEN_CARGA: readonly UnidadCarga[] = ['C', 'mC', 'uC', 'nC'];
const ORDEN_DISTANCIA: readonly UnidadDistancia[] = ['m', 'cm', 'mm', 'nm', 'pm'];
const ORDEN_FUERZA: readonly UnidadFuerza[] = ['kN', 'N', 'mN', 'uN', 'nN'];

/** Pasos del deslizador: de r/4 a 3r de la distancia de referencia, que es la que abarca la gráfica. */
const PASOS_DESLIZADOR = 200;
const DESLIZADOR_MIN = 0.25;
const DESLIZADOR_MAX = 3;

/** Geometría de la gráfica F frente a r. */
const G_ANCHO = 600;
const G_ALTO = 320;
const G_IZQ = 78;
const G_DER = 24;
const G_ARR = 22;
const G_ABA = 52;
const G_W = G_ANCHO - G_IZQ - G_DER;
const G_H = G_ALTO - G_ARR - G_ABA;

/** Coordenada de SVG con dos decimales: lo que pinta el servidor y lo que hidrata el cliente, igual. */
const px = (v: number) => Math.round(v * 100) / 100;

/** Lee un campo de texto como número, admitiendo el menos tipográfico que pegan algunos teclados. */
function leer(texto: string): number {
  return parseSpanishNumber(texto.replace(/[−–]/g, '-'));
}

/** La unidad de la lista con la que `valorSI` queda ≥ 1 (la mayor posible); si ninguna, la última. */
function unidadQueEncaja<K extends string>(valorSI: number, orden: readonly K[], tabla: Record<K, Unidad>): K {
  const abs = Math.abs(valorSI);
  for (const clave of orden) {
    if (abs / tabla[clave].factor >= 1) return clave;
  }
  return orden[orden.length - 1];
}

interface Ejemplo {
  id: string;
  etiqueta: string;
  q1: string;
  q1U: UnidadCarga;
  q2: string;
  q2U: UnidadCarga;
  r: string;
  rU: UnidadDistancia;
  medio: string;
}

const EJEMPLOS: readonly Ejemplo[] = [
  { id: 'microc', etiqueta: 'Dos cargas de 1 µC a 1 m', q1: '1', q1U: 'uC', q2: '1', q2U: 'uC', r: '1', rU: 'm', medio: 'vacio' },
  { id: 'hidrogeno', etiqueta: 'Protón y electrón (hidrógeno)', q1: '1', q1U: 'e', q2: '-1', q2U: 'e', r: '52,9', rU: 'pm', medio: 'vacio' },
  { id: 'sal', etiqueta: 'Iones de sal en agua', q1: '1', q1U: 'e', q2: '-1', q2U: 'e', r: '0,5', rU: 'nm', medio: 'agua' },
  { id: 'frotadas', etiqueta: 'Dos esferas frotadas', q1: '-40', q1U: 'nC', q2: '-40', q2U: 'nC', r: '2', rU: 'cm', medio: 'aire' },
];

interface Calculo {
  ok: boolean;
  error: string;
  q1: number;
  q2: number;
  r: number;
  epsR: number;
  res: ResultadoCoulomb | null;
}

const SIN_CALCULO: Calculo = { ok: false, error: '', q1: NaN, q2: NaN, r: NaN, epsR: 1, res: null };

// ============================================================
// Página
// ============================================================

export default function SimuladorLeyCoulombPage() {
  const [incognita, setIncognita] = useState<Incognita>('fuerza');
  const [q1Txt, setQ1Txt] = useState('2');
  const [q1U, setQ1U] = useState<UnidadCarga>('uC');
  const [q2Txt, setQ2Txt] = useState('-3');
  const [q2U, setQ2U] = useState<UnidadCarga>('uC');
  const [rTxt, setRTxt] = useState('30');
  const [rU, setRU] = useState<UnidadDistancia>('cm');
  const [fTxt, setFTxt] = useState('0,6');
  const [fU, setFU] = useState<UnidadFuerza>('N');
  const [sentido, setSentido] = useState<Sentido>('atraccion');
  const [medioId, setMedioId] = useState('vacio');
  const [epsTxt, setEpsTxt] = useState('3');
  /** Distancia (m) que fija la escala de la gráfica y del deslizador. Mover el deslizador NO la cambia. */
  const [rEscala, setREscala] = useState(0.3);

  const medio = MEDIOS.find((m) => m.id === medioId);

  const calculo = useMemo<Calculo>(() => {
    const epsR = medio ? medio.epsR : leer(epsTxt);
    if (!Number.isFinite(epsR)) return { ...SIN_CALCULO, error: 'Escribe la permitividad relativa del medio como número.' };
    if (epsR < 1) return { ...SIN_CALCULO, error: 'La permitividad relativa εr no puede ser menor que 1, que es la del vacío.' };

    const q1Valor = leer(q1Txt);
    if (!Number.isFinite(q1Valor)) return { ...SIN_CALCULO, epsR, error: 'Escribe la carga q₁ como número (con el signo menos si es negativa).' };
    const q1 = q1Valor * UNIDADES_CARGA[q1U].factor;

    if (incognita === 'fuerza') {
      const q2Valor = leer(q2Txt);
      if (!Number.isFinite(q2Valor)) return { ...SIN_CALCULO, epsR, error: 'Escribe la carga q₂ como número (con el signo menos si es negativa).' };
      const rValor = leer(rTxt);
      if (!Number.isFinite(rValor)) return { ...SIN_CALCULO, epsR, error: 'Escribe la distancia como número.' };
      const q2 = q2Valor * UNIDADES_CARGA[q2U].factor;
      const r = rValor * UNIDADES_DISTANCIA[rU].factor;
      const res = fuerzaCoulomb(q1, q2, r, epsR);
      if (!res.ok) return { ...SIN_CALCULO, epsR, error: res.error ?? 'Revisa los datos.' };
      return { ok: true, error: '', q1, q2, r, epsR, res };
    }

    const fValor = leer(fTxt);
    if (!Number.isFinite(fValor)) return { ...SIN_CALCULO, epsR, error: 'Escribe el módulo de la fuerza como número.' };
    if (fValor <= 0) return { ...SIN_CALCULO, epsR, error: 'El módulo de la fuerza tiene que ser mayor que cero.' };
    const F = fValor * UNIDADES_FUERZA[fU].factor;
    if (q1 === 0) return { ...SIN_CALCULO, epsR, error: 'Con q₁ = 0 no hay fuerza a ninguna distancia: no se puede despejar nada.' };

    if (incognita === 'distancia') {
      const q2Valor = leer(q2Txt);
      if (!Number.isFinite(q2Valor)) return { ...SIN_CALCULO, epsR, error: 'Escribe la carga q₂ como número (con el signo menos si es negativa).' };
      const q2 = q2Valor * UNIDADES_CARGA[q2U].factor;
      if (q2 === 0) return { ...SIN_CALCULO, epsR, error: 'Con q₂ = 0 no hay fuerza a ninguna distancia: no se puede despejar r.' };
      const r = distanciaParaFuerza(q1, q2, F, epsR);
      if (!Number.isFinite(r)) return { ...SIN_CALCULO, epsR, error: 'Con esos datos no sale una distancia: revisa las unidades.' };
      const res = fuerzaCoulomb(q1, q2, r, epsR);
      return { ok: res.ok, error: res.error ?? '', q1, q2, r, epsR, res };
    }

    // incognita === 'carga'
    const rValor = leer(rTxt);
    if (!Number.isFinite(rValor)) return { ...SIN_CALCULO, epsR, error: 'Escribe la distancia como número.' };
    const r = rValor * UNIDADES_DISTANCIA[rU].factor;
    if (r <= 0) return { ...SIN_CALCULO, epsR, error: 'La distancia entre las cargas tiene que ser mayor que cero.' };
    const modulo = cargaParaFuerza(q1, F, r, epsR);
    if (!Number.isFinite(modulo)) return { ...SIN_CALCULO, epsR, error: 'Con esos datos no sale una carga: revisa las unidades.' };
    // El signo lo decide si se atraen o se repelen: igual que q₁ si se repelen, contrario si se atraen.
    const q2 = (sentido === 'repulsion' ? Math.sign(q1) : -Math.sign(q1)) * modulo;
    const res = fuerzaCoulomb(q1, q2, r, epsR);
    return { ok: res.ok, error: res.error ?? '', q1, q2, r, epsR, res };
  }, [incognita, q1Txt, q1U, q2Txt, q2U, rTxt, rU, fTxt, fU, sentido, medio, epsTxt]);

  const res = calculo.ok ? calculo.res : null;
  const rAncla = incognita === 'fuerza' && Number.isFinite(rEscala) && rEscala > 0 ? rEscala : calculo.r;

  // ── Manejadores ──────────────────────────────────────────

  function cambiarDistancia(texto: string) {
    setRTxt(texto);
    const v = leer(texto) * UNIDADES_DISTANCIA[rU].factor;
    if (Number.isFinite(v) && v > 0) setREscala(v);
  }

  function cambiarUnidadDistancia(u: UnidadDistancia) {
    setRU(u);
    const v = leer(rTxt) * UNIDADES_DISTANCIA[u].factor;
    if (Number.isFinite(v) && v > 0) setREscala(v);
  }

  /** Al cambiar de incógnita, el dato que pasa a pedirse se rellena con el valor actual: la situación física no cambia. */
  function cambiarIncognita(nueva: Incognita) {
    if (nueva === incognita) return;
    if (calculo.ok && res) {
      if (nueva === 'fuerza' || nueva === 'carga') {
        const u = unidadQueEncaja(calculo.r, ORDEN_DISTANCIA, UNIDADES_DISTANCIA);
        setRU(u);
        setRTxt(cifraParaCampo(calculo.r / UNIDADES_DISTANCIA[u].factor));
        setREscala(calculo.r);
      }
      if (nueva === 'distancia' || nueva === 'carga') {
        const u = unidadQueEncaja(res.modulo, ORDEN_FUERZA, UNIDADES_FUERZA);
        setFU(u);
        setFTxt(cifraParaCampo(res.modulo / UNIDADES_FUERZA[u].factor));
      }
      if (nueva === 'fuerza' || nueva === 'distancia') {
        const u = q2U === 'e' ? 'e' : unidadQueEncaja(calculo.q2, ORDEN_CARGA, UNIDADES_CARGA);
        setQ2U(u);
        setQ2Txt(cifraParaCampo(calculo.q2 / UNIDADES_CARGA[u].factor));
      }
      if (nueva === 'carga' && res.tipo !== 'nula') setSentido(res.tipo);
    }
    setIncognita(nueva);
  }

  function aplicarEjemplo(e: Ejemplo) {
    setIncognita('fuerza');
    setQ1Txt(e.q1);
    setQ1U(e.q1U);
    setQ2Txt(e.q2);
    setQ2U(e.q2U);
    setRTxt(e.r);
    setRU(e.rU);
    setMedioId(e.medio);
    const v = leer(e.r) * UNIDADES_DISTANCIA[e.rU].factor;
    if (Number.isFinite(v) && v > 0) setREscala(v);
  }

  // ── Deslizador (solo cuando la distancia es un dato) ───────

  const indiceDeslizador = (() => {
    if (!Number.isFinite(calculo.r) || !Number.isFinite(rAncla) || rAncla <= 0) return 0;
    const t = (calculo.r / rAncla - DESLIZADOR_MIN) / (DESLIZADOR_MAX - DESLIZADOR_MIN);
    return Math.max(0, Math.min(PASOS_DESLIZADOR, Math.round(t * PASOS_DESLIZADOR)));
  })();

  function moverDeslizador(i: number) {
    if (!Number.isFinite(rAncla) || rAncla <= 0) return;
    const factor = DESLIZADOR_MIN + (i / PASOS_DESLIZADOR) * (DESLIZADOR_MAX - DESLIZADOR_MIN);
    const rNueva = rAncla * factor;
    setRTxt(cifraParaCampo(rNueva / UNIDADES_DISTANCIA[rU].factor));
  }

  // ── Textos de resultado ──────────────────────────────────

  const simR = UNIDADES_DISTANCIA[rU].simbolo;
  const textoQ = (q: number, u: UnidadCarga) => `${q > 0 ? '+' : ''}${cifraLegible(q / UNIDADES_CARGA[u].factor)} ${UNIDADES_CARGA[u].simbolo}`;
  const textoR = (r: number) => `${cifraLegible(r / UNIDADES_DISTANCIA[rU].factor)} ${simR}`;
  const textoF = (F: number) => `${cifraLegible(F)} N`;

  const pasos: string[] = [];
  if (calculo.ok && res) {
    const { q1, q2, r, epsR } = calculo;
    const formula = epsR === 1 ? 'k·|q₁·q₂| / r²' : 'k·|q₁·q₂| / (εr·r²)';
    const datosSI =
      incognita === 'fuerza'
        ? `q₁ = ${cifraLegible(q1)} C · q₂ = ${cifraLegible(q2)} C · r = ${cifraLegible(r)} m`
        : incognita === 'distancia'
          ? `q₁ = ${cifraLegible(q1)} C · q₂ = ${cifraLegible(q2)} C · |F| = ${cifraLegible(res.modulo)} N`
          : `q₁ = ${cifraLegible(q1)} C · r = ${cifraLegible(r)} m · |F| = ${cifraLegible(res.modulo)} N`;
    pasos.push(`Datos en el SI: ${datosSI}${epsR === 1 ? '' : ` · εr = ${cifraCorta(epsR)}`}.`);
    if (incognita === 'fuerza') {
      pasos.push(`F = ${formula} = 8,99 × 10⁹ · ${cifraLegible(Math.abs(q1 * q2))} / ${epsR === 1 ? '' : `(${cifraCorta(epsR)} · `}(${cifraLegible(r)})²${epsR === 1 ? '' : ')'} = ${cifraLegible(res.modulo)} N.`);
    } else if (incognita === 'distancia') {
      pasos.push(`r = √(k·|q₁·q₂| / ${epsR === 1 ? 'F' : '(εr·F)'}) = √(8,99 × 10⁹ · ${cifraLegible(Math.abs(q1 * q2))} / ${cifraLegible(epsR * res.modulo)}) = ${cifraLegible(r)} m.`);
    } else {
      pasos.push(`|q₂| = ${epsR === 1 ? 'F·r²' : 'F·εr·r²'} / (k·|q₁|) = ${cifraLegible(res.modulo * epsR * r * r)} / (8,99 × 10⁹ · ${cifraLegible(Math.abs(q1))}) = ${cifraLegible(Math.abs(q2))} C.`);
    }
    pasos.push(
      res.tipo === 'repulsion'
        ? 'Las cargas tienen el mismo signo: se repelen. Cada una empuja a la otra hacia fuera.'
        : res.tipo === 'atraccion'
          ? 'Las cargas tienen signos contrarios: se atraen. Cada una tira de la otra hacia sí.'
          : 'Una de las cargas es cero: no hay fuerza eléctrica entre ellas.',
    );
  }

  /** Unidades con que se repite el resultado principal, elegidas para que la cifra quede entre 1 y 1000. */
  const uRResultado = unidadQueEncaja(calculo.r, ORDEN_DISTANCIA, UNIDADES_DISTANCIA);
  const uQResultado = unidadQueEncaja(calculo.q2, ORDEN_CARGA, UNIDADES_CARGA);

  const tipoTexto = !res ? '—' : res.tipo === 'repulsion' ? 'Repulsión' : res.tipo === 'atraccion' ? 'Atracción' : 'Sin fuerza';

  // ── Diagrama de las dos cargas ───────────────────────────

  const X1 = 180;
  const X2 = 420;
  const YL = 56;
  const RADIO = 28;
  const LARGO = 78;
  const claseCarga = (q: number) => (q > 0 ? styles.cargaPositiva : q < 0 ? styles.cargaNegativa : styles.cargaNula);
  const signoCarga = (q: number) => (q > 0 ? '+' : q < 0 ? '−' : '0');

  /** Flecha horizontal de x0 a x1 con su punta. */
  function flecha(x0: number, x1: number, y: number, clave: string) {
    const dir = Math.sign(x1 - x0);
    const punta = `${px(x1)},${px(y)} ${px(x1 - dir * 12)},${px(y - 7)} ${px(x1 - dir * 12)},${px(y + 7)}`;
    return (
      <g key={clave}>
        <line x1={px(x0)} y1={y} x2={px(x1 - dir * 10)} y2={y} className={styles.flecha} />
        <polygon points={punta} className={styles.flechaPunta} />
      </g>
    );
  }

  const q1Diagrama = calculo.ok ? calculo.q1 : leer(q1Txt);
  const q2Diagrama = calculo.ok ? calculo.q2 : NaN;
  const flechas: ReactNode[] = [];
  if (res && res.tipo === 'repulsion') {
    flechas.push(flecha(X1 - RADIO - 4, X1 - RADIO - 4 - LARGO, YL, 'f1'));
    flechas.push(flecha(X2 + RADIO + 4, X2 + RADIO + 4 + LARGO, YL, 'f2'));
  } else if (res && res.tipo === 'atraccion') {
    flechas.push(flecha(X1 + RADIO + 4, X1 + RADIO + 4 + LARGO, YL, 'f1'));
    flechas.push(flecha(X2 - RADIO - 4, X2 - RADIO - 4 - LARGO, YL, 'f2'));
  }
  const etiquetaF1X = res && res.tipo === 'repulsion' ? X1 - RADIO - 4 - LARGO / 2 : X1 + RADIO + 4 + LARGO / 2;
  const etiquetaF2X = res && res.tipo === 'repulsion' ? X2 + RADIO + 4 + LARGO / 2 : X2 - RADIO - 4 - LARGO / 2;

  const descripcionDiagrama = res
    ? `Dos cargas separadas ${textoR(calculo.r)}: q₁ = ${textoQ(calculo.q1, q1U)} y q₂ = ${textoQ(calculo.q2, q2U)}. ${tipoTexto}: cada carga sufre una fuerza de ${textoF(res.modulo)}, iguales y de sentidos opuestos.`
    : 'Diagrama de las dos cargas, a la espera de datos válidos.';

  // ── Gráfica F frente a r ─────────────────────────────────

  const grafica = (() => {
    if (!res || res.modulo === 0 || !Number.isFinite(rAncla) || rAncla <= 0) return null;
    const C = res.modulo * calculo.r * calculo.r; // N·m² = k·|q₁q₂|/εr
    const xMax = 3 * rAncla;
    const fRef = C / (rAncla * rAncla);
    const yMax = 4 * fRef;
    const gx = (r: number) => G_IZQ + (r / xMax) * G_W;
    const gy = (F: number) => G_ARR + G_H - (F / yMax) * G_H;
    const puntos: string[] = [];
    const N = 120;
    for (let i = 0; i <= N; i += 1) {
      const r = rAncla / 2 + (i / N) * (xMax - rAncla / 2);
      puntos.push(`${px(gx(r))},${px(gy(C / (r * r)))}`);
    }
    const referencias = [
      { r: rAncla / 2, rotulo: '×4' },
      { r: rAncla, rotulo: 'F' },
      { r: 2 * rAncla, rotulo: '÷4' },
      { r: 3 * rAncla, rotulo: '÷9' },
    ];
    const rActual = calculo.r;
    const fActual = res.modulo;
    const fuera = rActual > xMax ? 'derecha' : fActual > yMax ? 'arriba' : null;
    return { C, xMax, yMax, fRef, gx, gy, puntos: puntos.join(' '), referencias, rActual, fActual, fuera };
  })();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Ley de Coulomb: simulador y calculadora</h1>
        <p className={styles.subtitle}>
          La fuerza entre dos cargas eléctricas, con su sentido, el efecto del medio y la gráfica del
          inverso del cuadrado. Calcula la fuerza o despeja la distancia o una de las cargas.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.incognitaSelector} role="group" aria-label="Qué quieres calcular">
          <button
            type="button"
            className={`${styles.incognitaBtn} ${incognita === 'fuerza' ? styles.incognitaBtnActivo : ''}`}
            aria-pressed={incognita === 'fuerza'}
            onClick={() => cambiarIncognita('fuerza')}
          >
            <span aria-hidden="true">⚡</span> Calcular la fuerza
          </button>
          <button
            type="button"
            className={`${styles.incognitaBtn} ${incognita === 'distancia' ? styles.incognitaBtnActivo : ''}`}
            aria-pressed={incognita === 'distancia'}
            onClick={() => cambiarIncognita('distancia')}
          >
            <span aria-hidden="true">📏</span> Despejar la distancia
          </button>
          <button
            type="button"
            className={`${styles.incognitaBtn} ${incognita === 'carga' ? styles.incognitaBtnActivo : ''}`}
            aria-pressed={incognita === 'carga'}
            onClick={() => cambiarIncognita('carga')}
          >
            <span aria-hidden="true">🔋</span> Despejar una carga
          </button>
        </div>

        <div className={styles.layout}>
          <section className={styles.panel} aria-labelledby="datos-titulo">
            <h2 className={styles.panelTitulo} id="datos-titulo">Datos</h2>

            <div className={styles.campo}>
              <label className={styles.campoLabel} htmlFor="q1-valor">Carga q₁ (con su signo)</label>
              <div className={styles.campoFila}>
                <input
                  id="q1-valor"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  className={styles.input}
                  value={q1Txt}
                  onChange={(e) => setQ1Txt(e.target.value)}
                />
                <select
                  className={styles.select}
                  aria-label="Unidad de q₁"
                  value={q1U}
                  onChange={(e) => setQ1U(e.target.value as UnidadCarga)}
                >
                  {(Object.keys(UNIDADES_CARGA) as UnidadCarga[]).map((u) => (
                    <option key={u} value={u}>{UNIDADES_CARGA[u].nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {incognita !== 'carga' && (
              <div className={styles.campo}>
                <label className={styles.campoLabel} htmlFor="q2-valor">Carga q₂ (con su signo)</label>
                <div className={styles.campoFila}>
                  <input
                    id="q2-valor"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    className={styles.input}
                    value={q2Txt}
                    onChange={(e) => setQ2Txt(e.target.value)}
                  />
                  <select
                    className={styles.select}
                    aria-label="Unidad de q₂"
                    value={q2U}
                    onChange={(e) => setQ2U(e.target.value as UnidadCarga)}
                  >
                    {(Object.keys(UNIDADES_CARGA) as UnidadCarga[]).map((u) => (
                      <option key={u} value={u}>{UNIDADES_CARGA[u].nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {incognita !== 'distancia' && (
              <div className={styles.campo}>
                <label className={styles.campoLabel} htmlFor="r-valor">Distancia entre las cargas</label>
                <div className={styles.campoFila}>
                  <input
                    id="r-valor"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={styles.input}
                    value={rTxt}
                    onChange={(e) => cambiarDistancia(e.target.value)}
                  />
                  <select
                    className={styles.select}
                    aria-label="Unidad de la distancia"
                    value={rU}
                    onChange={(e) => cambiarUnidadDistancia(e.target.value as UnidadDistancia)}
                  >
                    {(Object.keys(UNIDADES_DISTANCIA) as UnidadDistancia[]).map((u) => (
                      <option key={u} value={u}>{UNIDADES_DISTANCIA[u].nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {incognita !== 'fuerza' && (
              <div className={styles.campo}>
                <label className={styles.campoLabel} htmlFor="f-valor">Módulo de la fuerza</label>
                <div className={styles.campoFila}>
                  <input
                    id="f-valor"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={styles.input}
                    value={fTxt}
                    onChange={(e) => setFTxt(e.target.value)}
                  />
                  <select
                    className={styles.select}
                    aria-label="Unidad de la fuerza"
                    value={fU}
                    onChange={(e) => setFU(e.target.value as UnidadFuerza)}
                  >
                    {(Object.keys(UNIDADES_FUERZA) as UnidadFuerza[]).map((u) => (
                      <option key={u} value={u}>{UNIDADES_FUERZA[u].nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {incognita === 'carga' && (
              <div className={styles.campo}>
                <span className={styles.campoLabel} id="sentido-titulo">¿Se atraen o se repelen?</span>
                <div className={styles.sentidoFila} role="group" aria-labelledby="sentido-titulo">
                  <button
                    type="button"
                    className={`${styles.sentidoBtn} ${sentido === 'atraccion' ? styles.sentidoBtnActivo : ''}`}
                    aria-pressed={sentido === 'atraccion'}
                    onClick={() => setSentido('atraccion')}
                  >
                    Se atraen
                  </button>
                  <button
                    type="button"
                    className={`${styles.sentidoBtn} ${sentido === 'repulsion' ? styles.sentidoBtnActivo : ''}`}
                    aria-pressed={sentido === 'repulsion'}
                    onClick={() => setSentido('repulsion')}
                  >
                    Se repelen
                  </button>
                </div>
                <p className={styles.campoAyuda}>Decide el signo de q₂: contrario al de q₁ si se atraen, el mismo si se repelen.</p>
              </div>
            )}

            <div className={styles.campo}>
              <label className={styles.campoLabel} htmlFor="medio">Medio entre las cargas</label>
              <select id="medio" className={styles.selectAncho} value={medioId} onChange={(e) => setMedioId(e.target.value)}>
                {MEDIOS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {`${m.nombre} (εr ≈ ${cifraCorta(m.epsR)})`}
                  </option>
                ))}
                <option value={ID_PERSONAL}>Otro: escribe su εr</option>
              </select>
              {medio ? (
                <p className={styles.campoAyuda}>{medio.nota}</p>
              ) : (
                <div className={styles.campoFila}>
                  <label className={styles.campoLabelCorto} htmlFor="eps-valor">εr =</label>
                  <input
                    id="eps-valor"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={styles.input}
                    value={epsTxt}
                    onChange={(e) => setEpsTxt(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className={styles.ejemplos}>
              <span className={styles.campoLabel} id="ejemplos-titulo">Ejemplos para empezar</span>
              <div className={styles.ejemplosFila} role="group" aria-labelledby="ejemplos-titulo">
                {EJEMPLOS.map((e) => (
                  <button key={e.id} type="button" className={styles.ejemploBtn} onClick={() => aplicarEjemplo(e)}>
                    {e.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="resultado-titulo">
            <h2 className={styles.panelTitulo} id="resultado-titulo">Resultado</h2>

            {calculo.error ? (
              <p className={styles.error} role="alert">{calculo.error}</p>
            ) : (
              <div aria-live="polite" aria-atomic="true" className={styles.resultadoBloque}>
                {res && incognita === 'fuerza' && (
                  <div className={styles.resultadoPrincipal}>
                    <span className={styles.resultadoEtiqueta}>Módulo de la fuerza |F|</span>
                    <span className={styles.resultadoValor}>{textoF(res.modulo)}</span>
                  </div>
                )}
                {res && incognita === 'distancia' && (
                  <div className={styles.resultadoPrincipal}>
                    <span className={styles.resultadoEtiqueta}>Distancia r</span>
                    <span className={styles.resultadoValor}>{`${cifraLegible(calculo.r)} m`}</span>
                    <span className={styles.resultadoSecundario}>{`= ${cifraLegible(calculo.r / UNIDADES_DISTANCIA[uRResultado].factor)} ${UNIDADES_DISTANCIA[uRResultado].simbolo}`}</span>
                  </div>
                )}
                {res && incognita === 'carga' && (
                  <div className={styles.resultadoPrincipal}>
                    <span className={styles.resultadoEtiqueta}>Carga q₂</span>
                    <span className={styles.resultadoValor}>{`${cientifica(calculo.q2)} C`}</span>
                    <span className={styles.resultadoSecundario}>{`= ${textoQ(calculo.q2, uQResultado)}`}</span>
                  </div>
                )}

                {res && (
                  <dl className={styles.resultadoLista}>
                    <div className={styles.resultadoFila}>
                      <dt>Tipo de interacción</dt>
                      <dd>
                        <span className={`${styles.insignia} ${res.tipo === 'atraccion' ? styles.insigniaAtraccion : res.tipo === 'repulsion' ? styles.insigniaRepulsion : styles.insigniaNula}`}>
                          {tipoTexto}
                        </span>
                      </dd>
                    </div>
                    {incognita !== 'fuerza' && (
                      <div className={styles.resultadoFila}>
                        <dt>Módulo de la fuerza</dt>
                        <dd>{textoF(res.modulo)}</dd>
                      </div>
                    )}
                    {calculo.epsR !== 1 && (
                      <div className={styles.resultadoFila}>
                        <dt>En el vacío sería</dt>
                        <dd>{`${textoF(res.modulo * calculo.epsR)} (${cifraCorta(calculo.epsR)} veces más)`}</dd>
                      </div>
                    )}
                    {res.modulo > 0 && (
                      <div className={styles.resultadoFila}>
                        <dt>Igual que el peso de</dt>
                        <dd>{textoMasa(masaConElMismoPeso(res.modulo))}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {pasos.length > 0 && (
                  <div className={styles.pasos}>
                    <h3 className={styles.pasosTitulo}>Cómo se ha calculado</h3>
                    <ol className={styles.pasosLista}>
                      {pasos.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <section className={styles.panel} aria-labelledby="diagrama-titulo">
          <h2 className={styles.panelTitulo} id="diagrama-titulo">Las dos fuerzas</h2>
          <svg viewBox="0 0 600 156" className={styles.diagrama} role="img" aria-label={descripcionDiagrama}>
            <line x1={40} y1={YL} x2={560} y2={YL} className={styles.ejeLinea} />
            {flechas}
            {res && res.tipo !== 'nula' && (
              <>
                <text x={px(etiquetaF1X)} y={YL - 16} textAnchor="middle" className={styles.flechaTexto}>F sobre q₁</text>
                <text x={px(etiquetaF2X)} y={YL - 16} textAnchor="middle" className={styles.flechaTexto}>F sobre q₂</text>
              </>
            )}
            <circle cx={X1} cy={YL} r={RADIO} className={claseCarga(q1Diagrama)} />
            <text x={X1} y={YL + 8} textAnchor="middle" className={styles.cargaSigno}>{signoCarga(q1Diagrama)}</text>
            <circle cx={X2} cy={YL} r={RADIO} className={claseCarga(q2Diagrama)} />
            <text x={X2} y={YL + 8} textAnchor="middle" className={styles.cargaSigno}>{signoCarga(q2Diagrama)}</text>
            <text x={X1} y={YL + 50} textAnchor="middle" className={styles.cargaTexto}>
              {Number.isFinite(q1Diagrama) ? `q₁ = ${textoQ(q1Diagrama, q1U)}` : 'q₁'}
            </text>
            <text x={X2} y={YL + 50} textAnchor="middle" className={styles.cargaTexto}>
              {Number.isFinite(q2Diagrama) ? `q₂ = ${textoQ(q2Diagrama, q2U)}` : 'q₂'}
            </text>
            <line x1={X1} y1={140} x2={X2} y2={140} className={styles.cota} />
            <line x1={X1} y1={134} x2={X1} y2={146} className={styles.cota} />
            <line x1={X2} y1={134} x2={X2} y2={146} className={styles.cota} />
            <text x={(X1 + X2) / 2} y={133} textAnchor="middle" className={styles.cargaTexto}>
              {Number.isFinite(calculo.r) ? `r = ${textoR(calculo.r)}` : 'r'}
            </text>
          </svg>
          <p className={styles.nota}>
            Tercera ley de Newton: las dos fuerzas tienen el mismo módulo aunque las cargas sean
            distintas. La carga pequeña no sufre menos fuerza que la grande. El dibujo no está a escala.
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="grafica-titulo">
          <h2 className={styles.panelTitulo} id="grafica-titulo">Cómo cambia la fuerza con la distancia</h2>
          {grafica ? (
            <>
              <svg
                viewBox={`0 0 ${G_ANCHO} ${G_ALTO}`}
                className={styles.grafica}
                role="img"
                aria-label={`Gráfica de la fuerza frente a la distancia. Con estas cargas, a ${textoR(rAncla)} la fuerza es ${textoF(grafica.fRef)}; a la mitad de distancia sería cuatro veces mayor y al doble, cuatro veces menor.`}
              >
                <defs>
                  <clipPath id="coulomb-area">
                    <rect x={G_IZQ} y={G_ARR} width={G_W} height={G_H} />
                  </clipPath>
                </defs>
                {[1, 2, 3, 4].map((k) => (
                  <g key={`y${k}`}>
                    <line x1={G_IZQ} y1={px(grafica.gy(k * grafica.fRef))} x2={G_IZQ + G_W} y2={px(grafica.gy(k * grafica.fRef))} className={styles.rejilla} />
                    <text x={G_IZQ - 8} y={px(grafica.gy(k * grafica.fRef)) + 4} textAnchor="end" className={styles.ejeTexto}>
                      {cifraLegible(k * grafica.fRef)}
                    </text>
                  </g>
                ))}
                <line x1={G_IZQ} y1={G_ARR} x2={G_IZQ} y2={G_ARR + G_H} className={styles.ejeLinea} />
                <line x1={G_IZQ} y1={G_ARR + G_H} x2={G_IZQ + G_W} y2={G_ARR + G_H} className={styles.ejeLinea} />
                {grafica.referencias.map((ref) => (
                  <g key={ref.rotulo}>
                    <line x1={px(grafica.gx(ref.r))} y1={G_ARR + G_H} x2={px(grafica.gx(ref.r))} y2={G_ARR + G_H + 6} className={styles.ejeLinea} />
                    <text x={px(grafica.gx(ref.r))} y={G_ARR + G_H + 22} textAnchor="middle" className={styles.ejeTexto}>
                      {textoR(ref.r)}
                    </text>
                    <circle cx={px(grafica.gx(ref.r))} cy={px(grafica.gy(grafica.C / (ref.r * ref.r)))} r={4} className={styles.puntoReferencia} />
                    <text x={px(grafica.gx(ref.r)) + 8} y={px(grafica.gy(grafica.C / (ref.r * ref.r))) - 8} className={styles.referenciaTexto}>
                      {ref.rotulo}
                    </text>
                  </g>
                ))}
                <polyline points={grafica.puntos} className={styles.curva} clipPath="url(#coulomb-area)" />
                {!grafica.fuera && (
                  <g>
                    <line x1={px(grafica.gx(grafica.rActual))} y1={px(grafica.gy(grafica.fActual))} x2={px(grafica.gx(grafica.rActual))} y2={G_ARR + G_H} className={styles.guia} />
                    <circle cx={px(grafica.gx(grafica.rActual))} cy={px(grafica.gy(grafica.fActual))} r={7} className={styles.puntoActual} />
                  </g>
                )}
                {grafica.fuera === 'arriba' && (
                  <text x={px(grafica.gx(grafica.rActual))} y={G_ARR + 14} textAnchor="middle" className={styles.referenciaTexto}>↑ más arriba</text>
                )}
                {grafica.fuera === 'derecha' && (
                  <text x={G_IZQ + G_W - 4} y={px(grafica.gy(grafica.fActual)) - 8} textAnchor="end" className={styles.referenciaTexto}>más lejos →</text>
                )}
                <text x={G_IZQ + G_W / 2} y={G_ALTO - 8} textAnchor="middle" className={styles.ejeTitulo}>{`Distancia r (${simR})`}</text>
                <text x={16} y={G_ARR + G_H / 2} textAnchor="middle" transform={`rotate(-90 16 ${G_ARR + G_H / 2})`} className={styles.ejeTitulo}>Fuerza (N)</text>
              </svg>

              {incognita === 'fuerza' && (
                <div className={styles.deslizador}>
                  <label className={styles.campoLabel} htmlFor="deslizador-r">
                    Acerca o aleja las cargas: <strong>{`r = ${textoR(calculo.r)}`}</strong>
                  </label>
                  <input
                    id="deslizador-r"
                    type="range"
                    min={0}
                    max={PASOS_DESLIZADOR}
                    step={1}
                    value={indiceDeslizador}
                    aria-valuetext={`r = ${textoR(calculo.r)}, fuerza ${textoF(res ? res.modulo : NaN)}`}
                    className={styles.range}
                    onChange={(e) => moverDeslizador(Number(e.target.value))}
                  />
                </div>
              )}
              <p className={styles.nota}>
                Los puntos marcan la regla del inverso del cuadrado: a la mitad de distancia la fuerza se
                multiplica por 4; al doble se divide entre 4 y al triple, entre 9. La escala se ajusta a
                la distancia que escribas en los datos; el deslizador mueve el punto por la curva sin
                cambiarla.
              </p>
            </>
          ) : (
            <p className={styles.nota}>La gráfica aparece cuando hay dos cargas distintas de cero y una distancia válida.</p>
          )}
        </section>

        <p className={styles.enlaceHermana}>
          <span aria-hidden="true">🧭</span> ¿Más de dos cargas, o quieres ver el campo que crean a su
          alrededor? Colócalas en el{' '}
          <a href="/simulador-campo-electrico/">simulador de campo eléctrico</a>, que usa la misma
          constante k: la fuerza sobre una carga de prueba sale igual que aquí.
        </p>

        <CasosAula />

        <EducationalSection
          icon="📚"
          title="La ley de Coulomb, explicada"
          subtitle="Fórmula, comparación con la gravedad, errores frecuentes y preguntas"
        >
          <section className={styles.guideSection}>
            <h2>Qué dice la ley</h2>
            <p>
              Dos cargas eléctricas puntuales se ejercen una fuerza que va a lo largo de la línea que
              las une. Su módulo es proporcional al producto de las cargas e inversamente
              proporcional al cuadrado de la distancia:
            </p>
            <p className={styles.formula}>F = k · |q₁ · q₂| / r²</p>
            <p>
              En el vacío, k = 1/(4π·ε₀) ≈ 8,99·10⁹ N·m²/C², donde ε₀ ≈ 8,854·10⁻¹² C²/(N·m²) es la
              permitividad del vacío. Si las cargas tienen el mismo signo, se repelen; si tienen
              signos contrarios, se atraen. Dentro de un medio material la fuerza queda dividida
              entre su permitividad relativa εr.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Coulomb frente a la gravitación de Newton</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Aspecto</th>
                    <th scope="col">Ley de Coulomb</th>
                    <th scope="col">Gravitación universal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Fórmula</th>
                    <td>F = k·|q₁·q₂| / r²</td>
                    <td>F = G·m₁·m₂ / r²</td>
                  </tr>
                  <tr>
                    <th scope="row">Constante</th>
                    <td>k ≈ 8,99·10⁹ N·m²/C²</td>
                    <td>G ≈ 6,67·10⁻¹¹ N·m²/kg²</td>
                  </tr>
                  <tr>
                    <th scope="row">La produce</th>
                    <td>La carga eléctrica</td>
                    <td>La masa</td>
                  </tr>
                  <tr>
                    <th scope="row">Sentido</th>
                    <td>Atrae o repele, según los signos</td>
                    <td>Solo atrae</td>
                  </tr>
                  <tr>
                    <th scope="row">Influye el medio</th>
                    <td>Sí: se divide entre εr</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <th scope="row">Protón y electrón</th>
                    <td>≈ 8,2·10⁻⁸ N</td>
                    <td>≈ 3,6·10⁻⁴⁷ N (unas 10³⁹ veces menor)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Para quién es útil</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h3><span aria-hidden="true">🎒</span> Quien prepara un examen</h3>
                <p>Resuelve el ejercicio a mano y comprueba aquí la cifra y el desarrollo, con las unidades que traiga el enunciado.</p>
              </div>
              <div className={styles.escenarioCard}>
                <h3><span aria-hidden="true">👩‍🏫</span> Quien da clase</h3>
                <p>Asigna los casos numerados («haz el 3, el 7 y el 11») y proyecta la gráfica para enseñar el inverso del cuadrado.</p>
              </div>
              <div className={styles.escenarioCard}>
                <h3><span aria-hidden="true">🧂</span> Quien tiene curiosidad</h3>
                <p>Compara la misma pareja de iones en el vacío y en el agua y entiende por qué la sal se disuelve.</p>
              </div>
              <div className={styles.escenarioCard}>
                <h3><span aria-hidden="true">🎓</span> Quien empieza en la universidad</h3>
                <p>Repasa los órdenes de magnitud: del átomo de hidrógeno (nanonewtons) a dos culombios a un metro (miles de millones de newtons).</p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Cómo usarla, paso a paso</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}><strong>Elige qué calcular.</strong> La fuerza, o despejar la distancia o una de las cargas si la fuerza es un dato.</div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}><strong>Escribe las cargas con su signo.</strong> Elige la unidad en el desplegable: no hace falta pasarlas tú a culombios.</div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}><strong>Escribe la distancia o la fuerza</strong> con su unidad, de metros a picómetros y de kilonewtons a nanonewtons.</div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}><strong>Elige el medio.</strong> Para un ejercicio de libro suele ser el vacío; si es otro material, escribe su εr.</div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}><strong>Lee el resultado y el desarrollo.</strong> El diagrama dice si se atraen o se repelen, y los pasos, cómo sale la cifra.</div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">6</span>
                <div className={styles.stepContent}><strong>Mueve el deslizador</strong> para ver cómo cae la fuerza al alejar las cargas.</div>
              </li>
            </ol>
          </section>

          <section className={styles.guideSection}>
            <h2>Buenas prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📐</span>
                <p>Pasa todo al Sistema Internacional antes de operar: culombios, metros y newtons.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">➕</span>
                <p>Calcula el módulo con las cargas sin signo y decide aparte si se atraen o se repelen.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔍</span>
                <p>Comprueba el orden de magnitud: con microcoulombios a centímetros salen newtons; con cargas elementales a nanómetros, nanonewtons.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <p>En los problemas de «¿qué pasa si…?», usa la proporcionalidad: k y el medio se cancelan y no hace falta calcular la fuerza.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧭</span>
                <p>Con tres o más cargas, la fuerza sobre una es la suma VECTORIAL de las de cada pareja, no la suma de módulos.</p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h2>Errores frecuentes</h2>
              </div>
              <ul className={styles.warningList}>
                <li>Dividir entre r en lugar de entre r²: con el doble de distancia, la fuerza se divide entre 4, no entre 2.</li>
                <li>Dejar los microcoulombios o los nanocoulombios sin convertir: el resultado sale 10¹² o 10¹⁸ veces mayor.</li>
                <li>Dejar la distancia en centímetros: la fuerza sale 10.000 veces menor de lo que toca.</li>
                <li>Meter los signos en el módulo y dar una fuerza negativa: el módulo siempre es positivo.</li>
                <li>Usar la fórmula del vacío cuando las cargas están dentro de un líquido o un aislante.</li>
                <li>Aplicarla a cuerpos grandes y cercanos como si fueran puntuales: la ley vale para cargas cuyo tamaño es pequeño frente a la distancia (o esferas con la carga repartida de forma uniforme).</li>
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

        <ShareCard appName="simulador-ley-coulomb" />
      </main>

      <Footer appName="simulador-ley-coulomb" />
    </div>
  );
}
