'use client';
// @disclaimer: exempt

import { useCallback, useMemo, useRef, useState } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import styles from './SimuladorTangenciasPotencia.module.css';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  construirEjeRadical,
  construirPPC,
  construirPPR,
  construirPotencia,
  construirTangentesComunes,
  construirTangentesDesdePunto,
  type Circunferencia,
  type Construccion,
  type FamiliaTangentes,
  type Medida,
  type Punto,
  type Trazo,
} from './motor';
import {
  CASOS,
  TEXTO_MOTIVO,
  TOTAL_CASOS,
  cifra,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  type CasoTangencias,
  type EjercicioAleatorio,
  type Veredicto,
} from './casos';

// ============== LIENZO: medidas en cm (1 unidad = 1 cm de la cuadrícula) ==============

const ANCHO = 24;
const ALTO = 15;
const MARGEN = 0.5;
const REJILLA = 0.5;
const PASO_TECLADO = 0.5;
const LARGO_RECTA = 80;

type Pestana = 'potencia' | 'eje' | 'punto' | 'comunes' | 'apolonio' | 'casos';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'potencia', etiqueta: 'Potencia' },
  { id: 'eje', etiqueta: 'Eje radical' },
  { id: 'punto', etiqueta: 'Tangentes desde un punto' },
  { id: 'comunes', etiqueta: 'Tangentes comunes' },
  { id: 'apolonio', etiqueta: 'Circunferencias tangentes' },
  { id: 'casos', etiqueta: 'Casos para clase' },
];

type IdPunto =
  | 'potO'
  | 'potP'
  | 'potQ'
  | 'ejeO1'
  | 'ejeO2'
  | 'ejeO3'
  | 'tpO'
  | 'tpP'
  | 'tcO1'
  | 'tcO2'
  | 'apA'
  | 'apB'
  | 'apL1'
  | 'apL2'
  | 'apO';

type IdRadio = 'potR' | 'ejeR1' | 'ejeR2' | 'ejeR3' | 'tpR' | 'tcR1' | 'tcR2' | 'apR';

const PUNTOS_INICIALES: Record<IdPunto, Punto> = {
  potO: { x: 8, y: 7.5 },
  potP: { x: 17, y: 4 },
  potQ: { x: 3, y: 10.5 },
  ejeO1: { x: 6, y: 8 },
  ejeO2: { x: 16, y: 7.5 },
  ejeO3: { x: 11.5, y: 2.5 },
  tpO: { x: 8, y: 7.5 },
  tpP: { x: 19, y: 5 },
  tcO1: { x: 7, y: 7.5 },
  tcO2: { x: 17, y: 8 },
  apA: { x: 9, y: 4.5 },
  apB: { x: 12, y: 8.5 },
  apL1: { x: 1, y: 12.5 },
  apL2: { x: 23, y: 12.5 },
  apO: { x: 16.5, y: 8 },
};

const RADIOS_INICIALES: Record<IdRadio, number> = {
  potR: 4,
  ejeR1: 3.5,
  ejeR2: 2.5,
  ejeR3: 1.5,
  tpR: 4,
  tcR1: 4,
  tcR2: 2,
  apR: 2.5,
};

/** Qué datos se recolocan al pulsar «Recolocar» en cada pestaña. */
const PUNTOS_DE: Record<Exclude<Pestana, 'casos'>, IdPunto[]> = {
  potencia: ['potO', 'potP', 'potQ'],
  eje: ['ejeO1', 'ejeO2', 'ejeO3'],
  punto: ['tpO', 'tpP'],
  comunes: ['tcO1', 'tcO2'],
  apolonio: ['apA', 'apB', 'apL1', 'apL2', 'apO'],
};
const RADIOS_DE: Record<Exclude<Pestana, 'casos'>, IdRadio[]> = {
  potencia: ['potR'],
  eje: ['ejeR1', 'ejeR2', 'ejeR3'],
  punto: ['tpR'],
  comunes: ['tcR1', 'tcR2'],
  apolonio: ['apR'],
};

interface Arrastrable {
  id: IdPunto;
  etiqueta: string;
  descripcion: string;
  centro?: boolean;
}

interface Escena {
  arrastrables: Arrastrable[];
  circulos: { c: Circunferencia; etiqueta: string }[];
  rectas: { a: Punto; b: Punto; etiqueta: string }[];
  construccion: Construccion;
  descripcion: string;
}

function limitar(p: Punto): Punto {
  return {
    x: Math.max(MARGEN, Math.min(ANCHO - MARGEN, p.x)),
    y: Math.max(MARGEN, Math.min(ALTO - MARGEN, p.y)),
  };
}

function ajustar(p: Punto): Punto {
  return { x: Math.round(p.x / REJILLA) * REJILLA, y: Math.round(p.y / REJILLA) * REJILLA };
}

function textoMedida(m: Medida): string {
  if (!Number.isFinite(m.valor)) return 'no existe';
  const valor = formatNumber(m.valor, m.decimales ?? 2);
  if (!m.unidad) return valor;
  // El grado de ángulo va pegado a la cifra; el resto de unidades, con espacio duro.
  return m.unidad === '°' ? `${valor}°` : `${valor} ${m.unidad}`;
}

// ============== LIENZO ==============

interface PropsLienzo {
  escena: Escena;
  pasoVisible: number;
  resaltarActual: boolean;
  puntos: Record<IdPunto, Punto>;
  onMover: (id: IdPunto, p: Punto) => void;
  ajustarRejilla: boolean;
}

function claseTrazo(t: Trazo, actual: boolean): string {
  const base =
    t.estilo === 'resultado' ? styles.trazoResultado : t.estilo === 'auxiliar' ? styles.trazoAuxiliar : styles.trazoConstruccion;
  return actual ? `${base} ${styles.trazoActual}` : base;
}

function DibujoTrazo({ t, actual }: { t: Trazo; actual: boolean }) {
  const clase = claseTrazo(t, actual);
  switch (t.tipo) {
    case 'punto':
      return (
        <g>
          <circle cx={t.p.x} cy={t.p.y} r={0.16} className={`${styles.puntoTrazo} ${clase}`} />
          {t.etiqueta ? (
            <text x={t.p.x + 0.28} y={t.p.y - 0.28} className={styles.etiquetaTrazo}>
              {t.etiqueta}
            </text>
          ) : null}
        </g>
      );
    case 'segmento':
      return <line x1={t.a.x} y1={t.a.y} x2={t.b.x} y2={t.b.y} className={clase} />;
    case 'recta':
      return (
        <g>
          <line
            x1={t.p.x - t.dir.x * LARGO_RECTA}
            y1={t.p.y - t.dir.y * LARGO_RECTA}
            x2={t.p.x + t.dir.x * LARGO_RECTA}
            y2={t.p.y + t.dir.y * LARGO_RECTA}
            className={clase}
          />
          {t.etiqueta ? (
            <text x={t.p.x + t.dir.x * 1.2 + 0.25} y={t.p.y + t.dir.y * 1.2 - 0.25} className={styles.etiquetaTrazo}>
              {t.etiqueta}
            </text>
          ) : null}
        </g>
      );
    case 'circunferencia':
      return <circle cx={t.c.centro.x} cy={t.c.centro.y} r={t.c.radio} className={clase} fill="none" />;
  }
}

function Lienzo({ escena, pasoVisible, resaltarActual, puntos, onMover, ajustarRejilla }: PropsLienzo) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const arrastrando = useRef<IdPunto | null>(null);

  const aCoordenadas = useCallback((evt: React.PointerEvent): Punto | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

  const empezar = (id: IdPunto, evt: React.PointerEvent<SVGGElement>) => {
    evt.preventDefault();
    arrastrando.current = id;
    svgRef.current?.setPointerCapture?.(evt.pointerId);
  };

  const mover = (evt: React.PointerEvent<SVGSVGElement>) => {
    const id = arrastrando.current;
    if (!id) return;
    const p = aCoordenadas(evt);
    if (!p) return;
    onMover(id, limitar(ajustarRejilla ? ajustar(p) : p));
  };

  const soltar = (evt: React.PointerEvent<SVGSVGElement>) => {
    arrastrando.current = null;
    if (svgRef.current?.hasPointerCapture?.(evt.pointerId)) svgRef.current.releasePointerCapture(evt.pointerId);
  };

  const teclado = (id: IdPunto, evt: React.KeyboardEvent<SVGGElement>) => {
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    const delta = deltas[evt.key];
    if (!delta) return;
    evt.preventDefault();
    const paso = evt.shiftKey ? PASO_TECLADO * 4 : PASO_TECLADO;
    const actual = puntos[id];
    onMover(id, limitar({ x: actual.x + delta[0] * paso, y: actual.y + delta[1] * paso }));
  };

  const pasos = escena.construccion.pasos.slice(0, pasoVisible);

  const lineasRejilla = useMemo(() => {
    const lineas: { x1: number; y1: number; x2: number; y2: number; fuerte: boolean }[] = [];
    for (let x = 0; x <= ANCHO; x++) lineas.push({ x1: x, y1: 0, x2: x, y2: ALTO, fuerte: x % 5 === 0 });
    for (let y = 0; y <= ALTO; y++) lineas.push({ x1: 0, y1: y, x2: ANCHO, y2: y, fuerte: y % 5 === 0 });
    return lineas;
  }, []);

  return (
    <div className={styles.lienzoMarco}>
      <svg
        ref={svgRef}
        className={styles.lienzo}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        role="group"
        aria-label={escena.descripcion}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
      >
        <rect x={0} y={0} width={ANCHO} height={ALTO} className={styles.fondoLienzo} />
        {lineasRejilla.map(({ x1, y1, x2, y2, fuerte }) => (
          <line
            key={`${x1}-${y1}-${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={fuerte ? styles.rejillaFuerte : styles.rejilla}
          />
        ))}

        {/* Datos del problema */}
        {escena.circulos.map(({ c, etiqueta }) => (
          <g key={`dato-${etiqueta}`}>
            <circle cx={c.centro.x} cy={c.centro.y} r={c.radio} className={styles.trazoDato} fill="none" />
          </g>
        ))}
        {escena.rectas.map(({ a, b, etiqueta }) => {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const m = Math.hypot(dx, dy) || 1;
          return (
            <g key={`recta-${etiqueta}`}>
              <line
                x1={a.x - (dx / m) * LARGO_RECTA}
                y1={a.y - (dy / m) * LARGO_RECTA}
                x2={b.x + (dx / m) * LARGO_RECTA}
                y2={b.y + (dy / m) * LARGO_RECTA}
                className={styles.trazoDato}
              />
              <text x={b.x - 0.9} y={b.y - 0.35} className={styles.etiquetaDato}>
                {etiqueta}
              </text>
            </g>
          );
        })}

        {/* Construcción hasta el paso visible */}
        {pasos.map((paso, i) => (
          <g key={`paso-${i}-${paso.titulo}`}>
            {paso.trazos.map((t, j) => (
              <DibujoTrazo key={`t-${i}-${j}`} t={t} actual={resaltarActual && i === pasoVisible - 1} />
            ))}
          </g>
        ))}

        {/* Datos arrastrables */}
        {escena.arrastrables.map((a) => {
          const p = puntos[a.id];
          return (
            <g
              key={a.id}
              className={styles.asa}
              tabIndex={0}
              role="button"
              aria-label={`${a.descripcion}, en x ${formatNumber(p.x, 1)}, y ${formatNumber(p.y, 1)}. Arrastra o usa las flechas para moverlo.`}
              onPointerDown={(e) => empezar(a.id, e)}
              onKeyDown={(e) => teclado(a.id, e)}
            >
              <circle cx={p.x} cy={p.y} r={0.6} className={styles.asaZona} />
              <circle cx={p.x} cy={p.y} r={a.centro ? 0.18 : 0.24} className={a.centro ? styles.asaCentro : styles.asaPunto} />
              <text x={p.x + 0.32} y={p.y + 0.62} className={styles.etiquetaDato}>
                {a.etiqueta}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============== PANEL DE PASOS ==============

interface PropsPasos {
  construccion: Construccion;
  paso: number | null;
  setPaso: (p: number | null) => void;
}

function PanelPasos({ construccion, paso, setPaso }: PropsPasos) {
  const total = construccion.pasos.length;
  const visible = paso === null ? total : Math.min(Math.max(paso, 1), total);
  if (total === 0) return null;
  return (
    <section className={styles.tarjeta} aria-labelledby="titulo-pasos">
      <h2 id="titulo-pasos" className={styles.tarjetaTitulo}>
        Construcción paso a paso
      </h2>
      <div className={styles.navPasos}>
        <button type="button" className={styles.btnSecundario} onClick={() => setPaso(Math.max(1, visible - 1))} disabled={visible <= 1}>
          <span aria-hidden="true">‹</span> Anterior
        </button>
        <span className={styles.contadorPasos} aria-live="polite">
          Paso {visible} de {total}
        </span>
        <button
          type="button"
          className={styles.btnSecundario}
          onClick={() => setPaso(visible + 1 > total ? null : visible + 1)}
          disabled={paso === null}
        >
          Siguiente <span aria-hidden="true">›</span>
        </button>
      </div>
      <div className={styles.navPasos}>
        <button type="button" className={styles.btnEnlace} onClick={() => setPaso(1)}>
          Empezar desde el paso 1
        </button>
        <button type="button" className={styles.btnEnlace} onClick={() => setPaso(null)} disabled={paso === null}>
          Ver la construcción completa
        </button>
      </div>
      <ol className={styles.listaPasos}>
        {construccion.pasos.map((p, i) => {
          const numero = i + 1;
          const estado = numero > visible ? styles.pasoPendiente : numero === visible && paso !== null ? styles.pasoActual : styles.pasoHecho;
          return (
            <li key={`${numero}-${p.titulo}`} className={estado}>
              <button
                type="button"
                className={styles.pasoBoton}
                aria-current={numero === visible && paso !== null ? 'step' : undefined}
                onClick={() => setPaso(numero)}
              >
                <span className={styles.pasoNumero}>{numero}</span>
                <span>{p.titulo}</span>
              </button>
              {numero <= visible ? <p className={styles.pasoTexto}>{p.texto}</p> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function PanelMedidas({ medidas, soluciones }: { medidas: Medida[]; soluciones: number | null }) {
  return (
    <section className={styles.tarjeta} aria-labelledby="titulo-medidas">
      <h2 id="titulo-medidas" className={styles.tarjetaTitulo}>
        Medidas
      </h2>
      <dl className={styles.listaMedidas}>
        {medidas.map((m) => (
          <div key={m.etiqueta} className={styles.medida}>
            <dt>{m.etiqueta}</dt>
            <dd>{textoMedida(m)}</dd>
          </div>
        ))}
        {soluciones !== null ? (
          <div className={styles.medida}>
            <dt>Soluciones</dt>
            <dd>{soluciones}</dd>
          </div>
        ) : null}
      </dl>
      <p className={styles.nota}>La cuadrícula es de 1 cm. Las medidas se recalculan al mover cualquier dato.</p>
    </section>
  );
}

// ============== CASOS ==============

function normalizarEntrada(texto: string): number {
  // El menos tipográfico (−) no lo lee parseSpanishNumber; la potencia puede ser negativa.
  return parseSpanishNumber(texto.trim().replace(/−/g, '-'));
}

function textoVeredicto(v: Veredicto, caso: CasoTangencias): string {
  if (v.estado === 'acierto') return `¡Correcto! La respuesta es ${cifra(caso.respuesta)}${caso.unidad === '°' ? '°' : ` ${caso.unidad}${caso.datos.tipo === 'potencia' ? '²' : ''}`}.`;
  if (v.estado === 'no-numerico') return 'Escribe un número. Los decimales van con coma: 5,6.';
  if (v.motivo) return TEXTO_MOTIVO[v.motivo];
  return 'No es correcto. Repasa el planteamiento o abre la pista.';
}

interface PropsTarjetaCaso {
  caso: CasoTangencias;
  numero: string;
  idCampo: string;
  respuesta: string;
  onRespuesta: (texto: string) => void;
  veredicto: Veredicto | undefined;
  onComprobar: () => void;
  abierto: boolean;
  onAlternar: () => void;
}

function TarjetaCaso({ caso, numero, idCampo, respuesta, onRespuesta, veredicto, onComprobar, abierto, onAlternar }: PropsTarjetaCaso) {
  const unidadSolucion = caso.unidad === '°' ? '°' : ` ${caso.unidad}${caso.datos.tipo === 'potencia' ? '²' : ''}`;
  return (
    <article className={`${styles.casoTarjeta} ${veredicto?.estado === 'acierto' ? styles.casoResuelto : ''}`}>
      <div className={styles.casoCabecera}>
        <span className={styles.casoNumero}>{numero}</span>
        <h3 className={styles.casoTitulo}>{caso.titulo}</h3>
        <span className={styles.etiquetaCategoria}>{caso.categoria === 'aplicado' ? 'Aplicado' : 'Abstracto'}</span>
      </div>
      <p className={styles.casoEnunciado}>{caso.enunciado}</p>
      <details className={styles.pista}>
        <summary>Pista</summary>
        <p>{caso.pista}</p>
      </details>
      <div className={styles.casoFila}>
        <div className={styles.casoCampo}>
          <label htmlFor={idCampo} className={styles.campoEtiqueta}>
            {caso.etiquetaRespuesta}
          </label>
          <input
            id={idCampo}
            className={styles.campoInput}
            type="text"
            inputMode="text"
            autoComplete="off"
            value={respuesta}
            onChange={(e) => onRespuesta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onComprobar();
            }}
            placeholder="0"
          />
        </div>
        <button type="button" className={styles.btnPrimario} onClick={onComprobar}>
          Comprobar
        </button>
        <button type="button" className={styles.btnSecundario} aria-expanded={abierto} onClick={onAlternar}>
          {abierto ? 'Ocultar solución' : 'Ver solución'}
        </button>
      </div>
      {veredicto ? (
        <p
          className={veredicto.estado === 'acierto' ? styles.mensajeOk : styles.mensajeError}
          role="alert"
          aria-live="polite"
        >
          {textoVeredicto(veredicto, caso)}
        </p>
      ) : null}
      {abierto ? (
        <div className={styles.solucion}>
          <p className={styles.solucionValor}>
            Solución: {cifra(caso.respuesta)}
            {unidadSolucion}
          </p>
          <ol className={styles.solucionPasos}>
            {caso.pasos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}

function PanelCasos() {
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [veredictos, setVeredictos] = useState<Record<number, Veredicto>>({});
  const [abiertos, setAbiertos] = useState<Record<number, boolean>>({});
  const [ejercicio, setEjercicio] = useState<EjercicioAleatorio | null>(null);
  const [respuestaAleatoria, setRespuestaAleatoria] = useState('');
  const [veredictoAleatorio, setVeredictoAleatorio] = useState<Veredicto | undefined>(undefined);
  const [abiertoAleatorio, setAbiertoAleatorio] = useState(false);

  const resueltos = Object.values(veredictos).filter((v) => v.estado === 'acierto').length;

  const nuevoEjercicio = () => {
    setEjercicio(generarEjercicioAleatorio());
    setRespuestaAleatoria('');
    setVeredictoAleatorio(undefined);
    setAbiertoAleatorio(false);
  };

  return (
    <div className={styles.panelCasos}>
      <section className={styles.tarjeta}>
        <div className={styles.casosIntro}>
          <div>
            <h2 className={styles.tarjetaTitulo}>Casos numerados</h2>
            <p className={styles.nota}>
              Los {TOTAL_CASOS} casos son siempre los mismos, en el mismo orden y con los mismos datos: el caso 3 de una persona
              es el caso 3 de cualquier otra, así que se pueden mandar como tarea. Escribe tu resultado, compruébalo y, si falla,
              abre la pista o la solución razonada.
            </p>
          </div>
          <button type="button" className={styles.btnPrimario} onClick={nuevoEjercicio}>
            Ejercicio aleatorio
          </button>
        </div>
        <p className={styles.contadorCasos} aria-live="polite">
          Has resuelto {resueltos} de {TOTAL_CASOS}
        </p>
        <div
          className={styles.barraProgreso}
          role="progressbar"
          aria-valuenow={resueltos}
          aria-valuemin={0}
          aria-valuemax={TOTAL_CASOS}
          aria-label="Casos resueltos"
        >
          <div className={styles.barraRelleno} style={{ width: `${(resueltos / TOTAL_CASOS) * 100}%` }} />
        </div>
        {ejercicio ? (
          <div className={styles.aleatorio}>
            <TarjetaCaso
              caso={ejercicio.caso}
              numero="★"
              idCampo="respuesta-aleatoria"
              respuesta={respuestaAleatoria}
              onRespuesta={setRespuestaAleatoria}
              veredicto={veredictoAleatorio}
              onComprobar={() => setVeredictoAleatorio(comprobarRespuesta(normalizarEntrada(respuestaAleatoria), ejercicio.caso))}
              abierto={abiertoAleatorio}
              onAlternar={() => setAbiertoAleatorio((a) => !a)}
            />
            <p className={styles.nota}>Semilla {ejercicio.semilla}. Pulsa otra vez el botón para generar un enunciado distinto.</p>
          </div>
        ) : null}
      </section>

      <div className={styles.casosRejilla}>
        {CASOS.map((caso) => (
          <TarjetaCaso
            key={caso.id}
            caso={caso}
            numero={String(caso.id)}
            idCampo={`respuesta-${caso.id}`}
            respuesta={respuestas[caso.id] ?? ''}
            onRespuesta={(texto) => setRespuestas((prev) => ({ ...prev, [caso.id]: texto }))}
            veredicto={veredictos[caso.id]}
            onComprobar={() =>
              setVeredictos((prev) => ({ ...prev, [caso.id]: comprobarRespuesta(normalizarEntrada(respuestas[caso.id] ?? ''), caso) }))
            }
            abierto={Boolean(abiertos[caso.id])}
            onAlternar={() => setAbiertos((prev) => ({ ...prev, [caso.id]: !prev[caso.id] }))}
          />
        ))}
      </div>
    </div>
  );
}

// ============== PÁGINA ==============

export default function SimuladorTangenciasPotenciaPage() {
  const [pestana, setPestana] = useState<Pestana>('potencia');
  const [puntos, setPuntos] = useState<Record<IdPunto, Punto>>(PUNTOS_INICIALES);
  const [radios, setRadios] = useState<Record<IdRadio, number>>(RADIOS_INICIALES);
  const [paso, setPaso] = useState<number | null>(null);
  const [ajustarRejilla, setAjustarRejilla] = useState(true);
  const [terceraCircunferencia, setTerceraCircunferencia] = useState(false);
  const [familia, setFamilia] = useState<FamiliaTangentes>('exteriores');
  const [variante, setVariante] = useState<'ppr' | 'ppc'>('ppr');

  const mover = useCallback((id: IdPunto, p: Punto) => {
    setPuntos((prev) => (prev[id].x === p.x && prev[id].y === p.y ? prev : { ...prev, [id]: p }));
  }, []);

  const cambiarPestana = (nueva: Pestana) => {
    setPestana(nueva);
    setPaso(null);
  };

  const recolocar = () => {
    if (pestana === 'casos') return;
    setPuntos((prev) => {
      const copia = { ...prev };
      for (const id of PUNTOS_DE[pestana]) copia[id] = PUNTOS_INICIALES[id];
      return copia;
    });
    setRadios((prev) => {
      const copia = { ...prev };
      for (const id of RADIOS_DE[pestana]) copia[id] = RADIOS_INICIALES[id];
      return copia;
    });
    setPaso(null);
  };

  const escena = useMemo<Escena | null>(() => {
    const circ = (centro: IdPunto, radio: IdRadio): Circunferencia => ({ centro: puntos[centro], radio: radios[radio] });
    switch (pestana) {
      case 'potencia': {
        const c = circ('potO', 'potR');
        return {
          arrastrables: [
            { id: 'potO', etiqueta: 'O', descripcion: 'Centro O de la circunferencia', centro: true },
            { id: 'potP', etiqueta: 'P', descripcion: 'Punto P' },
            { id: 'potQ', etiqueta: 'Q', descripcion: 'Punto Q, que orienta la secante' },
          ],
          circulos: [{ c, etiqueta: 'c' }],
          rectas: [],
          construccion: construirPotencia(c, puntos.potP, puntos.potQ),
          descripcion: 'Potencia de un punto P respecto de una circunferencia, con una secante que pasa por P y por Q',
        };
      }
      case 'eje': {
        const c1 = circ('ejeO1', 'ejeR1');
        const c2 = circ('ejeO2', 'ejeR2');
        const c3 = terceraCircunferencia ? circ('ejeO3', 'ejeR3') : null;
        return {
          arrastrables: [
            { id: 'ejeO1', etiqueta: 'O₁', descripcion: 'Centro de la primera circunferencia', centro: true },
            { id: 'ejeO2', etiqueta: 'O₂', descripcion: 'Centro de la segunda circunferencia', centro: true },
            ...(c3 ? [{ id: 'ejeO3' as const, etiqueta: 'O₃', descripcion: 'Centro de la tercera circunferencia', centro: true }] : []),
          ],
          circulos: [{ c: c1, etiqueta: 'c1' }, { c: c2, etiqueta: 'c2' }, ...(c3 ? [{ c: c3, etiqueta: 'c3' }] : [])],
          rectas: [],
          construccion: construirEjeRadical(c1, c2, c3),
          descripcion: c3 ? 'Centro radical de tres circunferencias' : 'Eje radical de dos circunferencias',
        };
      }
      case 'punto': {
        const c = circ('tpO', 'tpR');
        return {
          arrastrables: [
            { id: 'tpO', etiqueta: 'O', descripcion: 'Centro O de la circunferencia', centro: true },
            { id: 'tpP', etiqueta: 'P', descripcion: 'Punto P desde el que se trazan las tangentes' },
          ],
          circulos: [{ c, etiqueta: 'c' }],
          rectas: [],
          construccion: construirTangentesDesdePunto(c, puntos.tpP),
          descripcion: 'Rectas tangentes a una circunferencia desde un punto P',
        };
      }
      case 'comunes': {
        const c1 = circ('tcO1', 'tcR1');
        const c2 = circ('tcO2', 'tcR2');
        return {
          arrastrables: [
            { id: 'tcO1', etiqueta: 'O₁', descripcion: 'Centro de la primera circunferencia', centro: true },
            { id: 'tcO2', etiqueta: 'O₂', descripcion: 'Centro de la segunda circunferencia', centro: true },
          ],
          circulos: [{ c: c1, etiqueta: 'c1' }, { c: c2, etiqueta: 'c2' }],
          rectas: [],
          construccion: construirTangentesComunes(c1, c2, familia),
          descripcion: `Tangentes comunes ${familia} a dos circunferencias`,
        };
      }
      case 'apolonio': {
        const comunes: Arrastrable[] = [
          { id: 'apA', etiqueta: 'A', descripcion: 'Punto A' },
          { id: 'apB', etiqueta: 'B', descripcion: 'Punto B' },
        ];
        if (variante === 'ppr') {
          return {
            arrastrables: [
              ...comunes,
              { id: 'apL1', etiqueta: '', descripcion: 'Primer punto de la recta r' },
              { id: 'apL2', etiqueta: '', descripcion: 'Segundo punto de la recta r' },
            ],
            circulos: [],
            rectas: [{ a: puntos.apL1, b: puntos.apL2, etiqueta: 'r' }],
            construccion: construirPPR(puntos.apA, puntos.apB, puntos.apL1, puntos.apL2),
            descripcion: 'Circunferencias que pasan por los puntos A y B y son tangentes a la recta r',
          };
        }
        const c = circ('apO', 'apR');
        return {
          arrastrables: [...comunes, { id: 'apO', etiqueta: 'O', descripcion: 'Centro de la circunferencia dada', centro: true }],
          circulos: [{ c, etiqueta: 'c' }],
          rectas: [],
          construccion: construirPPC(puntos.apA, puntos.apB, c),
          descripcion: 'Circunferencias que pasan por los puntos A y B y son tangentes a una circunferencia dada',
        };
      }
      default:
        return null;
    }
  }, [pestana, puntos, radios, terceraCircunferencia, familia, variante]);

  const pasoVisible = escena ? (paso === null ? escena.construccion.pasos.length : Math.min(Math.max(paso, 1), escena.construccion.pasos.length)) : 0;

  const deslizadorRadio = (id: IdRadio, etiqueta: string) => (
    <div className={styles.control} key={id}>
      <label htmlFor={`radio-${id}`} className={styles.campoEtiqueta}>
        {etiqueta}: <strong>{formatNumber(radios[id], 1)}&nbsp;cm</strong>
      </label>
      <input
        id={`radio-${id}`}
        type="range"
        min={0.5}
        max={7}
        step={0.5}
        value={radios[id]}
        onChange={(e) => {
          const valor = Number(e.target.value);
          setRadios((prev) => ({ ...prev, [id]: valor }));
        }}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.titulo}>Tangencias y potencia de un punto</h1>
        <p className={styles.subtitulo}>
          Las construcciones de geometría plana de Dibujo Técnico, con regla y compás y paso a paso: potencia, eje y centro
          radical, rectas tangentes y circunferencias tangentes. Arrastra los datos y mira cómo se rehace todo.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.pestanas} role="tablist" aria-label="Construcciones">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={pestana === p.id}
            aria-controls={`panel-${p.id}`}
            className={`${styles.pestana} ${pestana === p.id ? styles.pestanaActiva : ''}`}
            onClick={() => cambiarPestana(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <main id={`panel-${pestana}`} role="tabpanel" aria-labelledby={`tab-${pestana}`} className={styles.panel}>
        {pestana === 'casos' || !escena ? (
          <PanelCasos />
        ) : (
          <div className={styles.rejillaSimulador}>
            <div className={styles.columnaLienzo}>
              <Lienzo
                escena={escena}
                pasoVisible={pasoVisible}
                resaltarActual={paso !== null}
                puntos={puntos}
                onMover={mover}
                ajustarRejilla={ajustarRejilla}
              />
              <div className={styles.leyenda} aria-hidden="true">
                <span className={styles.leyendaItem}>
                  <span className={`${styles.muestra} ${styles.muestraDato}`} /> Datos
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.muestra} ${styles.muestraAuxiliar}`} /> Arcos auxiliares
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.muestra} ${styles.muestraConstruccion}`} /> Líneas de construcción
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.muestra} ${styles.muestraResultado}`} /> Solución
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.muestra} ${styles.muestraActual}`} /> Paso actual
                </span>
              </div>

              <section className={styles.tarjeta} aria-labelledby="titulo-datos">
                <h2 id="titulo-datos" className={styles.tarjetaTitulo}>
                  Datos
                </h2>
                <p className={styles.nota}>
                  Arrastra los puntos con el ratón o el dedo, o selecciónalos con el tabulador y muévelos con las flechas (Mayús +
                  flecha para pasos de 2 cm).
                </p>

                {pestana === 'potencia' ? deslizadorRadio('potR', 'Radio r') : null}
                {pestana === 'punto' ? deslizadorRadio('tpR', 'Radio r') : null}
                {pestana === 'eje' ? (
                  <>
                    {deslizadorRadio('ejeR1', 'Radio r₁')}
                    {deslizadorRadio('ejeR2', 'Radio r₂')}
                    <label className={styles.casilla}>
                      <input type="checkbox" checked={terceraCircunferencia} onChange={(e) => setTerceraCircunferencia(e.target.checked)} />
                      Añadir una tercera circunferencia (centro radical)
                    </label>
                    {terceraCircunferencia ? deslizadorRadio('ejeR3', 'Radio r₃') : null}
                  </>
                ) : null}
                {pestana === 'comunes' ? (
                  <>
                    {deslizadorRadio('tcR1', 'Radio r₁')}
                    {deslizadorRadio('tcR2', 'Radio r₂')}
                    <div className={styles.selector}>
                      <button
                        type="button"
                        aria-pressed={familia === 'exteriores'}
                        className={`${styles.opcion} ${familia === 'exteriores' ? styles.opcionActiva : ''}`}
                        onClick={() => {
                          setFamilia('exteriores');
                          setPaso(null);
                        }}
                      >
                        Exteriores (correa abierta)
                      </button>
                      <button
                        type="button"
                        aria-pressed={familia === 'interiores'}
                        className={`${styles.opcion} ${familia === 'interiores' ? styles.opcionActiva : ''}`}
                        onClick={() => {
                          setFamilia('interiores');
                          setPaso(null);
                        }}
                      >
                        Interiores (correa cruzada)
                      </button>
                    </div>
                  </>
                ) : null}
                {pestana === 'apolonio' ? (
                  <>
                    <div className={styles.selector}>
                      <button
                        type="button"
                        aria-pressed={variante === 'ppr'}
                        className={`${styles.opcion} ${variante === 'ppr' ? styles.opcionActiva : ''}`}
                        onClick={() => {
                          setVariante('ppr');
                          setPaso(null);
                        }}
                      >
                        Por A y B, tangente a una recta
                      </button>
                      <button
                        type="button"
                        aria-pressed={variante === 'ppc'}
                        className={`${styles.opcion} ${variante === 'ppc' ? styles.opcionActiva : ''}`}
                        onClick={() => {
                          setVariante('ppc');
                          setPaso(null);
                        }}
                      >
                        Por A y B, tangente a una circunferencia
                      </button>
                    </div>
                    {variante === 'ppc' ? deslizadorRadio('apR', 'Radio de la circunferencia dada') : null}
                  </>
                ) : null}

                <label className={styles.casilla}>
                  <input type="checkbox" checked={ajustarRejilla} onChange={(e) => setAjustarRejilla(e.target.checked)} />
                  Ajustar los puntos a la cuadrícula (cada 0,5 cm)
                </label>
                <button type="button" className={styles.btnEnlace} onClick={recolocar}>
                  Recolocar los datos de esta construcción
                </button>
              </section>
            </div>

            <div className={styles.columnaPanel}>
              {escena.construccion.aviso ? (
                <p className={styles.aviso} role="status" aria-live="polite">
                  {escena.construccion.aviso}
                </p>
              ) : null}
              <PanelPasos construccion={escena.construccion} paso={paso} setPaso={setPaso} />
              <PanelMedidas
                medidas={escena.construccion.medidas}
                soluciones={pestana === 'potencia' || pestana === 'eje' ? null : escena.construccion.soluciones}
              />
            </div>
          </div>
        )}
      </main>

      <EducationalSection
        icon="📚"
        title="Potencia y tangencias, de la definición al examen"
        subtitle="Qué es cada lugar geométrico, por qué funcionan las construcciones y en qué se equivoca casi todo el mundo"
      >
        <section className={styles.guideSection}>
          <h2>Una sola idea detrás de todo: la potencia</h2>
          <p>
            Casi todos los problemas de tangencias de Dibujo Técnico se resuelven con el mismo número. Si desde un punto P trazas
            cualquier recta que corte a una circunferencia en A y B, el producto PA · PB no depende de la recta elegida: siempre
            vale d² − r², donde d es la distancia de P al centro y r el radio. A ese número se le llama potencia de P.
          </p>
          <p>
            Si P está fuera, la recta puede girar hasta tocar a la circunferencia en un solo punto T, y entonces PA y PB son el mismo
            segmento: PT² = potencia. Por eso la potencia es «la tangente al cuadrado», y por eso medir potencias equivale a medir
            tangentes. El eje radical es el lugar de los puntos con igual potencia respecto de dos circunferencias, y el centro
            radical, el punto con igual potencia respecto de tres.
          </p>

          <h3>Tabla comparativa: dos circunferencias según su posición</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption className={styles.nota}>d es la distancia entre centros; R y r, los radios (R ≥ r)</caption>
              <thead>
                <tr>
                  <th scope="col">Posición</th>
                  <th scope="col">Condición</th>
                  <th scope="col">Tangentes comunes</th>
                  <th scope="col">Eje radical</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Exteriores</td>
                  <td>d &gt; R + r</td>
                  <td>4 (2 exteriores y 2 interiores)</td>
                  <td>Por el método de la auxiliar</td>
                </tr>
                <tr>
                  <td>Tangentes exteriores</td>
                  <td>d = R + r</td>
                  <td>3 (las interiores se funden en una)</td>
                  <td>La tangente común en el punto de contacto</td>
                </tr>
                <tr>
                  <td>Secantes</td>
                  <td>R − r &lt; d &lt; R + r</td>
                  <td>2 (solo exteriores)</td>
                  <td>La recta que une los dos puntos de corte</td>
                </tr>
                <tr>
                  <td>Tangentes interiores</td>
                  <td>d = R − r</td>
                  <td>1</td>
                  <td>La tangente común en el punto de contacto</td>
                </tr>
                <tr>
                  <td>Una dentro de otra</td>
                  <td>d &lt; R − r</td>
                  <td>0</td>
                  <td>Por el método de la auxiliar (queda fuera de las dos)</td>
                </tr>
                <tr>
                  <td>Concéntricas</td>
                  <td>d = 0</td>
                  <td>0</td>
                  <td>No existe</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Casos de uso</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3>Estudiante de bachillerato o preparatoria</h3>
              <p>
                Antes de trazar en papel, ve la construcción entera y luego paso a paso. Mover un dato y ver que la solución sigue
                funcionando es lo que convierte una receta memorizada en algo entendido.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Docente de Dibujo Técnico o Matemáticas</h3>
              <p>
                Proyecta una construcción y avanza paso a paso en clase. Después, manda los casos numerados: son iguales para todo el
                grupo y corrigen solos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Primeros cursos de arquitectura o ingeniería</h3>
              <p>
                Repasa la geometría plana que dan por sabida la geometría descriptiva y el diseño asistido: el eje radical y las
                tangencias reaparecen en enlaces, perfiles y trazados.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Mecánica, maquetismo y taller</h3>
              <p>
                Una correa entre dos poleas es una tangente común: la abierta es exterior y la cruzada, interior. El tramo recto sale
                de la distancia entre ejes y los radios.
              </p>
            </div>
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

        <section className={styles.guideSection}>
          <h2>Guía paso a paso</h2>
          <div className={styles.stepGuide}>
            {[
              ['Elige la construcción', 'Cada pestaña es un problema: potencia, eje radical, tangentes desde un punto, tangentes comunes o circunferencias tangentes.'],
              ['Coloca los datos', 'Arrastra centros y puntos y ajusta los radios. Con la cuadrícula activada los puntos caen en múltiplos de 0,5 cm, como en un ejercicio con medidas.'],
              ['Recorre los pasos', 'Pulsa «Empezar desde el paso 1» y avanza con «Siguiente». El paso actual se resalta en el dibujo y su explicación dice por qué funciona.'],
              ['Rompe la construcción', 'Mete el punto dentro de la circunferencia, junta los centros o pon A y B a cada lado de la recta: el aviso explica por qué deja de haber solución.'],
              ['Lee las medidas', 'El panel da la potencia, las tangentes y los radios con dos decimales para que puedas comprobar tu trazado en papel.'],
              ['Haz los casos', 'En «Casos para clase» resuelve los 12 ejercicios numerados o pide uno aleatorio para practicar.'],
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
          <h2>Mejores prácticas</h2>
          <div className={styles.tipsGrid}>
            {[
              ['📐', 'Busca siempre la potencia', 'Ante una tangencia nueva, pregúntate qué punto tiene la misma potencia respecto de todo lo que interviene: suele ser el corte de dos ejes radicales.'],
              ['🧭', 'Afina la mediatriz', 'Casi todas las construcciones empiezan por un punto medio. Un error de un milímetro ahí desplaza los puntos de tangencia mucho más.'],
              ['✏️', 'Señala los puntos de tangencia', 'En un examen de Dibujo Técnico un enlace sin su punto de tangencia marcado suele contar como incompleto, aunque se vea bien.'],
              ['🔁', 'Comprueba con la otra solución', 'Muchos problemas tienen dos soluciones simétricas. Si solo encuentras una, revisa si te has dejado la del otro lado.'],
              ['📏', 'Usa la medida para verificar', 'Calcula la tangente con √(d² − r²) y compárala con lo que mide tu trazado: si no coinciden, el error está en el dibujo.'],
            ].map(([icono, titulo, texto]) => (
              <div key={titulo} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">
                  {icono}
                </span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h2>Errores frecuentes</h2>
            </div>
            <ul className={styles.warningList}>
              <li>Dar la potencia cuando se pide la tangente: la potencia es el cuadrado, la tangente es su raíz.</li>
              <li>Olvidar el signo: dentro de la circunferencia la potencia es negativa, y PA · PB también, porque P separa a A de B.</li>
              <li>Confundir las familias de tangentes comunes: las exteriores usan la DIFERENCIA de radios y las interiores la SUMA.</li>
              <li>Trazar el eje radical por el punto medio de los centros: solo pasa por ahí si los radios son iguales.</li>
              <li>Tomar como tangente una recta que solo «parece» tocar: el radio al punto de contacto tiene que ser perpendicular a ella.</li>
              <li>En el caso de dos puntos y una recta, buscar una única solución: casi siempre hay dos, una a cada lado de M.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="simulador-tangencias-potencia" />

      <Footer appName="simulador-tangencias-potencia" />
    </div>
  );
}
