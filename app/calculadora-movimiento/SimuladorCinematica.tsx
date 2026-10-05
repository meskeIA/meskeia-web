'use client';

/**
 * Simulador de calculadora-movimiento (S0179): el móvil animado sobre su pista, con los
 * vectores de velocidad y aceleración, y las tres gráficas x(t), v(t) y a(t) recorridas por
 * un cursor sincronizado. Todo sale de motor.ts, igual que las tarjetas de resultado: la
 * cifra y el dibujo no pueden discrepar.
 *
 * Se dibuja en SVG y no en canvas para que el modo oscuro lo resuelvan las variables CSS
 * del módulo sin repintar nada a mano.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './CalculadoraMovimiento.module.css';
import { formatNumber } from '@/lib';
import {
  marcasEje,
  muestrear,
  posicion,
  rangoPosicion,
  velocidad,
  instanteParada,
  type MovimientoRectilineo,
} from './motor';

interface Props {
  modo: 'mru' | 'mrua' | 'caida';
  v0: number;
  a: number;
  /** Duración del movimiento, s */
  T: number;
}

/** Segundos reales que dura la animación completa, sea cual sea T. */
function duracionAnimacion(T: number): number {
  return Math.min(8, Math.max(3, T));
}

/**
 * Paso del deslizador: una potencia de 10 que dé al menos 100 posiciones (0,01 s si T = 6 s).
 * Con T/200 el paso era 0,03 s y el deslizador no podía caer en t = 4 s, justo el instante en
 * que el móvil se para en el ejemplo de frenado.
 */
function pasoDeslizador(T: number): number {
  return Math.pow(10, Math.floor(Math.log10(T / 100)));
}

/** Cifra con 2 decimales y sin «−0,00» cuando el valor es un cero con signo o casi. */
function cifra(valor: number): string {
  return formatNumber(Math.abs(valor) < 0.005 ? 0 : valor, 2);
}

/** Marca del eje: hasta 2 decimales, sin ceros de relleno tras la coma («2,5», no «2,50»). */
function marca(valor: number): string {
  if (Number.isInteger(valor)) return formatNumber(valor, 0);
  return formatNumber(valor, 2).replace(/0+$/, '').replace(/,$/, '');
}

export default function SimuladorCinematica({ modo, v0, a, T }: Props) {
  const mov: MovimientoRectilineo = useMemo(() => ({ v0, a }), [v0, a]);
  const vertical = modo === 'caida';

  // Arranca en el estado FINAL: es el que describen las tarjetas de resultado de arriba
  const [t, setTEstado] = useState(T);
  const [reproduciendo, setReproduciendo] = useState(false);
  const rafRef = useRef<number | null>(null);
  const previoRef = useRef<number | null>(null);
  // Copia síncrona del instante: el bucle de animación decide si ha llegado al final con
  // ella, no con un updater de setState, que React puede ejecutar más tarde.
  const tRef = useRef(T);
  const setT = (valor: number) => {
    tRef.current = valor;
    setTEstado(valor);
  };

  // Al cambiar cualquier dato se para la animación y se vuelve al estado final
  useEffect(() => {
    setReproduciendo(false);
    tRef.current = T;
    setTEstado(T);
  }, [modo, v0, a, T]);

  useEffect(() => {
    if (!reproduciendo) return;
    const ritmo = T / duracionAnimacion(T); // segundos simulados por segundo real
    previoRef.current = null;
    const paso = (ahora: number) => {
      const dt = previoRef.current === null ? 0 : (ahora - previoRef.current) / 1000;
      previoRef.current = ahora;
      const siguiente = tRef.current + dt * ritmo;
      if (siguiente >= T) {
        tRef.current = T;
        setTEstado(T);
        setReproduciendo(false);
        return;
      }
      tRef.current = siguiente;
      setTEstado(siguiente);
      rafRef.current = requestAnimationFrame(paso);
    };
    rafRef.current = requestAnimationFrame(paso);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reproduciendo, T]);

  const alternar = () => {
    if (reproduciendo) {
      setReproduciendo(false);
      return;
    }
    // Si está al final, vuelve a empezar desde t = 0
    if (t >= T) setT(0);
    setReproduciendo(true);
  };

  const reiniciar = () => {
    setReproduciendo(false);
    setT(0);
  };

  const muestras = useMemo(() => muestrear(mov, T), [mov, T]);
  const xActual = posicion(mov, t);
  const vActual = velocidad(mov, t);
  const tParada = instanteParada(mov);
  const paradaDentro = tParada !== null && tParada < T;

  const nombreX = vertical ? 'y' : 'x';
  const etiquetaMovil = vertical ? 'objeto' : 'móvil';

  return (
    <section className={styles.simPanel} aria-labelledby="titulo-simulador">
      <h2 id="titulo-simulador" className={styles.sectionTitle}>
        <span aria-hidden="true">🎬</span> Simulación del movimiento
      </h2>
      <p className={styles.simIntro}>
        {vertical
          ? 'El eje y apunta hacia abajo, en el sentido de la gravedad: una velocidad inicial negativa es un lanzamiento hacia arriba.'
          : 'Pulsa reproducir para ver el móvil recorrer el trayecto, o arrastra el tiempo para ir a cualquier instante. Las tres gráficas marcan el mismo instante.'}
      </p>

      <div className={styles.simControles}>
        <button type="button" className={styles.simBoton} onClick={alternar}>
          {reproduciendo ? (
            <><span aria-hidden="true">⏸</span> Pausa</>
          ) : (
            <><span aria-hidden="true">▶</span> {t >= T ? 'Reproducir de nuevo' : 'Reproducir'}</>
          )}
        </button>
        <button type="button" className={styles.simBotonSecundario} onClick={reiniciar}>
          <span aria-hidden="true">⏮</span> Al inicio
        </button>
        <label className={styles.simDeslizador}>
          <span className={styles.simDeslizadorTexto}>Instante</span>
          <input
            type="range"
            min={0}
            max={T}
            step={pasoDeslizador(T)}
            value={t}
            onChange={e => {
              setReproduciendo(false);
              setT(Number(e.target.value));
            }}
            aria-valuetext={`t = ${cifra(t)} s`}
          />
        </label>
      </div>

      <p className={styles.simLectura}>
        <span>t = <strong>{cifra(t)} s</strong></span>
        <span>{nombreX} = <strong>{cifra(xActual)} m</strong></span>
        <span>v = <strong>{cifra(vActual)} m/s</strong></span>
        <span>a = <strong>{cifra(a)} m/s²</strong></span>
      </p>

      <Pista
        mov={mov}
        T={T}
        x={xActual}
        v={vActual}
        vertical={vertical}
        etiquetaMovil={etiquetaMovil}
        xParada={paradaDentro && tParada !== null ? posicion(mov, tParada) : null}
      />

      {paradaDentro && tParada !== null && (
        <p className={styles.simAviso}>
          <span aria-hidden="true">↩️</span> El {etiquetaMovil} se detiene en t = {cifra(tParada)} s,
          a {cifra(posicion(mov, tParada))} m del origen, y después se mueve en sentido contrario.
          Por eso la distancia recorrida es mayor que el desplazamiento.
        </p>
      )}

      <div className={styles.simGraficas}>
        <Grafica
          titulo={`Posición–tiempo (${nombreX}-t)`}
          eje={`${nombreX} (m)`}
          clase={styles.curvaX}
          T={T}
          t={t}
          puntos={muestras.map(m => ({ t: m.t, y: m.x }))}
          yActual={xActual}
          descripcion={`${nombreX} pasa de 0 m en t = 0 a ${cifra(posicion(mov, T))} m en t = ${cifra(T)} s${
            a === 0 ? ', en línea recta' : ', siguiendo una parábola'
          }.`}
        />
        <Grafica
          titulo="Velocidad–tiempo (v-t)"
          eje="v (m/s)"
          clase={styles.curvaV}
          T={T}
          t={t}
          puntos={muestras.map(m => ({ t: m.t, y: m.v }))}
          yActual={vActual}
          descripcion={`v pasa de ${cifra(v0)} m/s a ${cifra(velocidad(mov, T))} m/s${
            a === 0 ? ': recta horizontal, velocidad constante' : ': recta inclinada, cuya pendiente es la aceleración'
          }.`}
        />
        <Grafica
          titulo="Aceleración–tiempo (a-t)"
          eje="a (m/s²)"
          clase={styles.curvaA}
          T={T}
          t={t}
          puntos={[{ t: 0, y: a }, { t: T, y: a }]}
          yActual={a}
          descripcion={`a vale ${cifra(a)} m/s² durante todo el movimiento: recta horizontal.`}
        />
      </div>
    </section>
  );
}

// ─── Pista con el móvil y sus vectores ───────────────────────────────────────

interface PropsPista {
  mov: MovimientoRectilineo;
  T: number;
  x: number;
  v: number;
  vertical: boolean;
  etiquetaMovil: string;
  xParada: number | null;
}

function Pista({ mov, T, x, v, vertical, etiquetaMovil, xParada }: PropsPista) {
  const [rMin, rMax] = rangoPosicion(mov, T);
  const eje = marcasEje(rMin, rMax, vertical ? 4 : 6);

  // Horizontal: 600 × 130 · vertical: 220 × 380. La coordenada «a lo largo» de la pista
  // va de INI a FIN en ambos casos.
  const ancho = vertical ? 220 : 600;
  const alto = vertical ? 380 : 130;
  const INI = vertical ? 30 : 40;
  const FIN = vertical ? 350 : 560;
  const linea = vertical ? 80 : 70; // coordenada transversal de la pista

  const escala = (valor: number) => INI + ((valor - eje.min) / (eje.max - eje.min)) * (FIN - INI);
  const enPista = (largo: number, trans: number) => (vertical ? { x: trans, y: largo } : { x: largo, y: trans });

  // Vectores: longitud proporcional a la magnitud, con un máximo de 70 px
  const vMax = Math.max(Math.abs(mov.v0), Math.abs(velocidad(mov, T)), 1e-9);
  const largoV = (v / vMax) * 70;
  const largoA = mov.a === 0 ? 0 : Math.sign(mov.a) * 40;

  const pos = escala(x);
  const movil = enPista(pos, linea);
  const p0 = enPista(escala(0), linea);
  const pIni = enPista(INI, linea);
  const pFin = enPista(FIN, linea);

  const flecha = (desde: number, largo: number, trans: number, clase: string, rotulo: string) => {
    if (Math.abs(largo) < 2) return null;
    const a1 = enPista(desde, trans);
    const a2 = enPista(desde + largo, trans);
    const s = Math.sign(largo);
    const p1 = enPista(desde + largo - s * 8, trans - 5);
    const p2 = enPista(desde + largo - s * 8, trans + 5);
    const texto = enPista(desde + largo + s * 6, trans - (vertical ? 0 : 6));
    return (
      <g className={clase}>
        <line x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} strokeWidth={3} />
        <polygon points={`${a2.x},${a2.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} />
        <text
          x={vertical ? texto.x + 10 : texto.x}
          y={vertical ? texto.y + 4 : texto.y}
          textAnchor={vertical ? 'start' : s > 0 ? 'start' : 'end'}
          className={styles.pistaRotulo}
        >
          {rotulo}
        </text>
      </g>
    );
  };

  const descripcion = `Pista del ${etiquetaMovil}, de ${marca(eje.min)} a ${marca(eje.max)} m. Ahora está en ${cifra(x)} m con velocidad ${cifra(v)} m/s.`;

  return (
    <div className={vertical ? styles.pistaVertical : styles.pista}>
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={descripcion}>
        {/* Pista y marcas */}
        <line x1={pIni.x} y1={pIni.y} x2={pFin.x} y2={pFin.y} className={styles.pistaLinea} />
        {eje.marcas.map(m => {
          const c = enPista(escala(m), linea);
          const tx = enPista(escala(m), linea + (vertical ? -14 : 22));
          return (
            <g key={m}>
              <line
                x1={c.x - (vertical ? 6 : 0)}
                y1={c.y - (vertical ? 0 : 6)}
                x2={c.x + (vertical ? 6 : 0)}
                y2={c.y + (vertical ? 0 : 6)}
                className={styles.pistaMarca}
              />
              <text x={tx.x} y={tx.y + (vertical ? 4 : 0)} textAnchor={vertical ? 'end' : 'middle'} className={styles.pistaTexto}>
                {marca(m)}
              </text>
            </g>
          );
        })}
        <text
          x={vertical ? pIni.x - 14 : pFin.x + 22}
          y={vertical ? alto - 6 : pFin.y + 22}
          textAnchor={vertical ? 'end' : 'start'}
          className={styles.pistaTexto}
        >
          m
        </text>

        {/* Origen y punto de vuelta */}
        <circle cx={p0.x} cy={p0.y} r={4} className={styles.pistaOrigen} />
        {xParada !== null && (
          <g className={styles.pistaParada}>
            {(() => {
              const c = enPista(escala(xParada), linea);
              return <line x1={c.x - (vertical ? 18 : 0)} y1={c.y - (vertical ? 0 : 18)} x2={c.x + (vertical ? 18 : 0)} y2={c.y + (vertical ? 0 : 18)} strokeDasharray="4 3" />;
            })()}
          </g>
        )}

        {/* El móvil: carrito en horizontal, bola en vertical */}
        {vertical ? (
          <circle cx={movil.x} cy={movil.y} r={11} className={styles.pistaMovil} />
        ) : (
          <g>
            <rect x={movil.x - 16} y={movil.y - 22} width={32} height={16} rx={4} className={styles.pistaMovil} />
            <circle cx={movil.x - 9} cy={movil.y - 4} r={4} className={styles.pistaRueda} />
            <circle cx={movil.x + 9} cy={movil.y - 4} r={4} className={styles.pistaRueda} />
          </g>
        )}

        {/* Vectores: velocidad por encima/al lado, aceleración por debajo/al otro lado */}
        {flecha(pos, largoV, vertical ? linea + 34 : linea - 38, styles.vectorV, 'v')}
        {flecha(pos, largoA, vertical ? linea - 34 : linea + 40, styles.vectorA, 'a')}
      </svg>
    </div>
  );
}

// ─── Gráfica genérica con cursor ─────────────────────────────────────────────

interface PropsGrafica {
  titulo: string;
  eje: string;
  clase: string;
  T: number;
  t: number;
  puntos: { t: number; y: number }[];
  yActual: number;
  descripcion: string;
}

function Grafica({ titulo, eje, clase, T, t, puntos, yActual, descripcion }: PropsGrafica) {
  const W = 320;
  const H = 204;
  // Margen superior holgado: ahí va el título del eje, que no debe pisar la marca más alta
  const M = { izq: 46, der: 12, arr: 26, aba: 30 };
  const ys = puntos.map(p => p.y);
  const ejeY = marcasEje(Math.min(...ys), Math.max(...ys));
  const ejeT = marcasEje(0, T, 4);

  const px = (tt: number) => M.izq + ((tt - ejeT.min) / (ejeT.max - ejeT.min)) * (W - M.izq - M.der);
  const py = (y: number) => H - M.aba - ((y - ejeY.min) / (ejeY.max - ejeY.min)) * (H - M.arr - M.aba);
  const trazo = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.t).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');

  return (
    <figure className={styles.grafica}>
      <figcaption className={styles.graficaTitulo}>{titulo}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${titulo}. ${descripcion}`}>
        {ejeY.marcas.map(m => (
          <g key={`y${m}`}>
            <line x1={M.izq} x2={W - M.der} y1={py(m)} y2={py(m)} className={m === 0 ? styles.graficaCero : styles.graficaRejilla} />
            <text x={M.izq - 6} y={py(m) + 4} textAnchor="end" className={styles.graficaTexto}>{marca(m)}</text>
          </g>
        ))}
        {ejeT.marcas.map(m => (
          <text key={`t${m}`} x={px(m)} y={H - M.aba + 16} textAnchor="middle" className={styles.graficaTexto}>{marca(m)}</text>
        ))}
        <text x={W - M.der} y={H - 2} textAnchor="end" className={styles.graficaTexto}>t (s)</text>
        <text x={4} y={12} className={styles.graficaTexto}>{eje}</text>

        <path d={trazo} fill="none" strokeWidth={2.5} className={clase} />

        {/* Cursor del instante actual */}
        <line x1={px(t)} x2={px(t)} y1={M.arr} y2={H - M.aba} className={styles.graficaCursor} />
        <circle cx={px(t)} cy={py(yActual)} r={5} className={`${clase} ${styles.graficaPunto}`} />
      </svg>
    </figure>
  );
}
