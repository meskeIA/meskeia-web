'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './CondicionalesIngles.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatPercentage, enfocarSinCentrar, traerALaVista } from '@/lib';
import { useGuardaRafaga } from '@/lib/useGuardaRafaga';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  TIPOS, CLASES, REGLAS, REGLA_UNLESS, TOTAL_EJERCICIOS,
  corregir, explicar, fraseCompleta, filtrar, porNumero, parsearNumeros, nombreTipo,
  type Clase, type Correccion, type Ejercicio, type TipoCondicional,
} from './motor';

type Pantalla = 'config' | 'quiz' | 'resultado';
type Modo = 'escribir' | 'elegir';

/** Cómo se eligieron los ejercicios: «Jugar de nuevo» repite lo mismo. */
type Origen =
  | { tipo: 'azar'; tipos: TipoCondicional[]; clases: Clase[]; cuantos: number }
  | { tipo: 'numeros'; numeros: number[] };

interface Opcion {
  /** Lo que se le pasa al corrector. */
  valor: string;
  /** Lo que se ve. */
  etiqueta: string;
  /** Las de completar están en inglés; las de tipo, en español. */
  ingles: boolean;
}

const MODOS: Record<Modo, { label: string; desc: string }> = {
  escribir: { label: 'Escribir la forma', desc: 'Tecleas el verbo del hueco, como en un examen' },
  elegir: { label: 'Elegir entre 4 opciones', desc: 'Eliges la forma correcta del hueco' },
};

const CLASES_TEXTO: Record<Clase, { label: string; desc: string }> = {
  completar: { label: 'Completar el hueco', desc: 'If it ___ (rain) tomorrow…' },
  tipo: { label: '¿Qué tipo es?', desc: 'Frase completa: elige 0, 1, 2 o 3' },
};

const OPCIONES_PREGUNTAS = [10, 15, 20];
const LETRAS = ['A', 'B', 'C', 'D'];

const OPCIONES_TIPO: Opcion[] = TIPOS.map((t) => ({
  valor: String(t),
  etiqueta: `Tipo ${t} · ${REGLAS[t].nombre}`,
  ingles: false,
}));

function barajar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Opciones de una pregunta: en los de tipo, siempre en orden; en los de completar, barajadas. */
function opcionesDe(ej: Ejercicio, modo: Modo): Opcion[] {
  if (ej.clase === 'tipo') return OPCIONES_TIPO;
  if (modo === 'escribir') return [];
  return barajar(ej.opciones).map((o) => ({ valor: o, etiqueta: o, ingles: true }));
}

/** Conmuta un elemento de una selección múltiple, sin dejarla nunca vacía. */
function conmutar<T>(lista: T[], valor: T, orden: T[]): T[] {
  if (lista.includes(valor)) return lista.length > 1 ? lista.filter((v) => v !== valor) : lista;
  return orden.filter((v) => v === valor || lista.includes(v));
}

/** Índice de ejercicios por tipo y clase, para que un profesor sepa qué número asignar. */
const INDICE = TIPOS.map((t) => ({
  tipo: t,
  filas: CLASES.map((c) => ({
    clase: c,
    numeros: filtrar([t], [c]).map((e) => e.numero).join(', '),
  })),
}));

export default function CondicionalesInglesPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [tiposSel, setTiposSel] = useState<TipoCondicional[]>([0, 1, 2, 3]);
  const [clasesSel, setClasesSel] = useState<Clase[]>(['completar', 'tipo']);
  const [modo, setModo] = useState<Modo>('escribir');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [textoNumeros, setTextoNumeros] = useState('');
  const [errorNumeros, setErrorNumeros] = useState<string | null>(null);

  const [origen, setOrigen] = useState<Origen | null>(null);
  const [modoPartida, setModoPartida] = useState<Modo>('escribir');
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [opciones, setOpciones] = useState<Opcion[][]>([]);
  const [actual, setActual] = useState(0);
  const [escrito, setEscrito] = useState('');
  const [correccion, setCorreccion] = useState<Correccion | null>(null);
  /** La respuesta tal como se ve (el texto escrito o la etiqueta de la opción). */
  const [respuestaDada, setRespuestaDada] = useState('');
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fallados, setFallados] = useState<number[]>([]);

  const ej = ejercicios[actual];
  const total = ejercicios.length;
  const esUltima = actual === total - 1;
  const respondida = correccion !== null;
  const opcionesActuales = opciones[actual] ?? [];
  const seEscribe = ej !== undefined && ej.clase === 'completar' && modoPartida === 'escribir';

  const disponibles = useMemo(() => filtrar(tiposSel, clasesSel), [tiposSel, clasesSel]);
  const preguntasAzar = Math.min(numPreguntas, disponibles.length);

  // ── Foco y vista: la receta de los quizzes (hallazgos 1834, 1835 y 3770) ──
  const quizRef = useRef<HTMLDivElement>(null);
  const enunciadoRef = useRef<HTMLDivElement>(null);
  const siguienteRef = useRef<HTMLButtonElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const tituloConfigRef = useRef<HTMLHeadingElement>(null);
  const vieneDelResultado = useRef(false);

  useEffect(() => {
    if (pantalla === 'quiz') {
      if (respondida) {
        enfocarSinCentrar(siguienteRef.current);
      } else {
        traerALaVista(quizRef.current, enunciadoRef.current);
        enunciadoRef.current?.focus({ preventScroll: true });
      }
    } else if (pantalla === 'resultado') {
      traerALaVista(resultadoRef.current, resultadoRef.current);
      resultadoRef.current?.focus({ preventScroll: true });
    } else if (vieneDelResultado.current) {
      vieneDelResultado.current = false;
      tituloConfigRef.current?.focus();
    }
  }, [pantalla, actual, respondida]);

  // Doble toque: la receta de la familia (lib/useGuardaRafaga.ts, hallazgo 3615).
  const marcarCambioPantalla = useGuardaRafaga();

  const arrancar = useCallback((lista: Ejercicio[], nuevoOrigen: Origen, modoNuevo: Modo) => {
    marcarCambioPantalla();
    setEjercicios(lista);
    setOpciones(lista.map((e) => opcionesDe(e, modoNuevo)));
    setModoPartida(modoNuevo);
    setOrigen(nuevoOrigen);
    setActual(0);
    setEscrito('');
    setCorreccion(null);
    setRespuestaDada('');
    setElegida(null);
    setAciertos(0);
    setFallados([]);
    setPantalla('quiz');
  }, [marcarCambioPantalla]);

  const jugarOrigen = useCallback((o: Origen, modoNuevo: Modo) => {
    if (o.tipo === 'azar') {
      arrancar(barajar(filtrar(o.tipos, o.clases)).slice(0, o.cuantos), o, modoNuevo);
    } else {
      const lista = o.numeros.map(porNumero).filter((e): e is Ejercicio => e !== undefined);
      arrancar(lista, o, modoNuevo);
    }
  }, [arrancar]);

  const empezarAzar = useCallback(() => {
    if (disponibles.length === 0) return;
    jugarOrigen({ tipo: 'azar', tipos: tiposSel, clases: clasesSel, cuantos: preguntasAzar }, modo);
  }, [disponibles, jugarOrigen, tiposSel, clasesSel, preguntasAzar, modo]);

  const empezarNumeros = useCallback(() => {
    const leido = parsearNumeros(textoNumeros);
    if (!leido.ok) {
      setErrorNumeros(leido.error);
      return;
    }
    setErrorNumeros(null);
    jugarOrigen({ tipo: 'numeros', numeros: leido.numeros }, modo);
  }, [textoNumeros, jugarOrigen, modo]);

  const responder = useCallback((valor: string, mostrado: string) => {
    if (respondida || !ej) return;
    // El foco a «Siguiente» sube la página y puede dejar el botón bajo el dedo (3679 en la familia)
    marcarCambioPantalla({ soloMismoPunto: true });
    const c = corregir(ej, valor);
    setCorreccion(c);
    setRespuestaDada(mostrado);
    if (c.correcta) setAciertos((n) => n + 1);
    else setFallados((prev) => (prev.includes(ej.numero) ? prev : [...prev, ej.numero]));
  }, [respondida, ej, marcarCambioPantalla]);

  const elegir = useCallback((op: Opcion) => {
    if (respondida) return;
    setElegida(op.valor);
    responder(op.valor, op.etiqueta);
  }, [respondida, responder]);

  const siguiente = useCallback(() => {
    marcarCambioPantalla();
    if (esUltima) {
      setPantalla('resultado');
    } else {
      setActual((n) => n + 1);
      setEscrito('');
      setCorreccion(null);
      setRespuestaDada('');
      setElegida(null);
    }
  }, [esUltima, marcarCambioPantalla]);

  const jugarDeNuevo = useCallback(() => {
    if (origen) jugarOrigen(origen, modoPartida);
  }, [origen, jugarOrigen, modoPartida]);

  const repetirFallados = useCallback(() => {
    if (fallados.length > 0) jugarOrigen({ tipo: 'numeros', numeros: fallados }, modoPartida);
  }, [fallados, jugarOrigen, modoPartida]);

  const volverConfig = useCallback(() => {
    marcarCambioPantalla();
    vieneDelResultado.current = true;
    setPantalla('config');
  }, [marcarCambioPantalla]);

  const alternativas = ej && ej.clase === 'completar' ? ej.admitidas.slice(1) : [];
  const acierto = correccion?.correcta === true;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Condicionales en inglés <span aria-hidden="true">🔀</span></h1>
        <p className={styles.subtitle}>
          Zero, first, second y third conditional: ejercicios numerados con corrección al momento y la regla de cada caso
        </p>
      </header>

      <LegalNotice />

      {/* ── CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.panel}>
          <h2 className={styles.panelTitulo} ref={tituloConfigRef} tabIndex={-1}>Elige qué practicar</h2>

          <h3 className={styles.grupoTitulo}>Tipo de condicional</h3>
          <div className={styles.filaBotones} role="group" aria-label="Tipo de condicional">
            {TIPOS.map((t) => (
              <button
                type="button"
                key={t}
                className={`${styles.botonEleccion} ${tiposSel.includes(t) ? styles.activo : ''}`}
                onClick={() => setTiposSel((prev) => conmutar(prev, t, TIPOS))}
                aria-pressed={tiposSel.includes(t)}
              >
                <span className={styles.eleccionNombre}>{`Tipo ${t}`}</span>
                <span className={styles.eleccionDesc} lang="en">{REGLAS[t].nombre}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.grupoTitulo}>Clase de ejercicio</h3>
          <div className={styles.filaBotones} role="group" aria-label="Clase de ejercicio">
            {CLASES.map((c) => (
              <button
                type="button"
                key={c}
                className={`${styles.botonEleccion} ${clasesSel.includes(c) ? styles.activo : ''}`}
                onClick={() => setClasesSel((prev) => conmutar(prev, c, CLASES))}
                aria-pressed={clasesSel.includes(c)}
              >
                <span className={styles.eleccionNombre}>{CLASES_TEXTO[c].label}</span>
                <span className={styles.eleccionDesc}>{CLASES_TEXTO[c].desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.grupoTitulo}>Cómo responder</h3>
          <div className={styles.filaBotones} role="group" aria-label="Cómo responder">
            {(Object.entries(MODOS) as [Modo, typeof MODOS[Modo]][]).map(([clave, cfg]) => (
              <button
                type="button"
                key={clave}
                className={`${styles.botonEleccion} ${modo === clave ? styles.activo : ''}`}
                onClick={() => setModo(clave)}
                aria-pressed={modo === clave}
              >
                <span className={styles.eleccionNombre}>{cfg.label}</span>
                <span className={styles.eleccionDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>
          <p className={styles.nota}>Los ejercicios de «¿Qué tipo es?» se responden siempre eligiendo el tipo.</p>

          <h3 className={styles.grupoTitulo}>Número de preguntas</h3>
          <div className={styles.filaBotones} role="group" aria-label="Número de preguntas">
            {OPCIONES_PREGUNTAS.map((n) => (
              <button
                type="button"
                key={n}
                className={`${styles.botonCantidad} ${numPreguntas === n ? styles.activo : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {`${n} preguntas`}
              </button>
            ))}
          </div>

          {disponibles.length < numPreguntas && (
            <p className={styles.aviso} role="status">
              {`Con esta selección hay ${disponibles.length} ejercicios, así que la partida será de ${disponibles.length} preguntas.`}
            </p>
          )}

          <button type="button" className={styles.btnPrincipal} onClick={empezarAzar}>
            {`Empezar — ${preguntasAzar} preguntas al azar`}
          </button>

          {/* Selección por número: un profesor asigna «haz el 3, el 7 y el 11» */}
          <form
            className={styles.cajaNumeros}
            onSubmit={(e) => { e.preventDefault(); empezarNumeros(); }}
            noValidate
          >
            <label htmlFor="ejercicios-numeros" className={styles.grupoTitulo}>Ejercicios por número</label>
            <p id="ayuda-numeros" className={styles.nota}>
              {`Escribe números del 1 al ${TOTAL_EJERCICIOS} separados por comas (3, 7, 11) o un intervalo (5-9). Se juegan esos, en ese orden.`}
            </p>
            <div className={styles.filaNumeros}>
              <input
                id="ejercicios-numeros"
                type="text"
                className={styles.campoTexto}
                value={textoNumeros}
                onChange={(e) => { setTextoNumeros(e.target.value); setErrorNumeros(null); }}
                placeholder="3, 7, 11"
                autoComplete="off"
                aria-invalid={errorNumeros ? true : undefined}
                aria-describedby={errorNumeros ? 'ayuda-numeros error-numeros' : 'ayuda-numeros'}
              />
              <button type="submit" className={styles.btnSecundario}>Jugar estos ejercicios</button>
            </div>
            {errorNumeros && (
              <p id="error-numeros" className={styles.error} role="alert">{errorNumeros}</p>
            )}
            <details className={styles.indice}>
              <summary>Índice de ejercicios por tipo</summary>
              <ul className={styles.indiceLista}>
                {INDICE.map(({ tipo, filas }) => (
                  <li key={tipo}>
                    <strong>{`Tipo ${tipo} (${REGLAS[tipo].nombre})`}</strong>
                    {filas.map((f) => (
                      <span key={f.clase} className={styles.indiceFila}>{`${CLASES_TEXTO[f.clase].label}: ${f.numeros}`}</span>
                    ))}
                  </li>
                ))}
              </ul>
            </details>
          </form>
        </div>
      )}

      {/* ── PRÁCTICA ── */}
      {pantalla === 'quiz' && ej && (
        <div className={styles.panel} ref={quizRef}>
          <p className={styles.marcador}>
            <span>{`Pregunta ${actual + 1} de ${total}`}</span>
            <span>{`Aciertos: ${aciertos}`}</span>
          </p>
          <div className={styles.progresoBar}>
            <div
              className={styles.progresoFill}
              style={{ width: `${(actual / total) * 100}%` }}
              role="progressbar"
              aria-label="Preguntas respondidas"
              aria-valuetext={`${actual} de ${total}`}
              aria-valuenow={actual}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          </div>

          <div className={styles.enunciado} ref={enunciadoRef} tabIndex={-1}>
            <p className={styles.enunciadoNumero}>{`Ejercicio ${ej.numero}`}</p>
            <p className={styles.enunciadoConsigna}>
              {ej.clase === 'completar' ? 'Completa el hueco con la forma correcta del verbo' : '¿Qué tipo de condicional es?'}
            </p>
            {ej.clase === 'completar' ? (
              <p className={styles.frase} lang="en" key={`c${ej.numero}`}>
                <span>{ej.antes}</span>
                <span className={styles.hueco} aria-hidden="true">_____</span>
                <span className={styles.srOnly} lang="es">(hueco)</span>
                <span className={styles.pista}>{` (${ej.verbo})`}</span>
                <span>{ej.despues}</span>
              </p>
            ) : (
              <p className={styles.frase} lang="en" key={`t${ej.numero}`}>{ej.frase}</p>
            )}
          </div>

          {seEscribe && (
            <form
              className={styles.formEscribir}
              onSubmit={(e) => { e.preventDefault(); responder(escrito, escrito.trim()); }}
              noValidate
            >
              <label htmlFor="respuesta-hueco" className={styles.etiqueta}>Tu respuesta para el hueco</label>
              <div className={styles.filaNumeros}>
                <input
                  id="respuesta-hueco"
                  type="text"
                  lang="en"
                  className={`${styles.campoTexto} ${correccion?.correcta === true ? styles.campoBien : ''} ${correccion?.correcta === false ? styles.campoMal : ''}`}
                  value={escrito}
                  onChange={(e) => setEscrito(e.target.value)}
                  readOnly={respondida}
                  aria-invalid={correccion?.correcta === false ? true : undefined}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                />
                {!respondida && (
                  <button type="submit" className={styles.btnPrincipalCorto}>Comprobar</button>
                )}
              </div>
            </form>
          )}

          {!seEscribe && (
            <div className={styles.opcionesGrid}>
              {opcionesActuales.map((op, i) => {
                const esBuena = respondida && corregir(ej, op.valor).correcta;
                const esFallada = respondida && op.valor === elegida && !esBuena;
                const marca = esBuena ? ' (respuesta correcta)' : esFallada ? ' (tu respuesta, incorrecta)' : '';
                const clase = !respondida ? '' : esBuena ? styles.opcionBuena : esFallada ? styles.opcionMala : styles.opcionApagada;
                return (
                  <button
                    type="button"
                    key={op.valor}
                    className={`${styles.opcion} ${clase}`}
                    onClick={() => elegir(op)}
                    disabled={respondida}
                    aria-label={`Opción ${LETRAS[i]}: ${op.etiqueta}${marca}`}
                  >
                    <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                    <span className={styles.opcionTexto} lang={op.ingles ? 'en' : undefined}>{op.etiqueta}</span>
                    {esBuena && <span className={styles.opcionMarca} aria-hidden="true">✓</span>}
                    {esFallada && <span className={styles.opcionMarca} aria-hidden="true">✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {respondida && correccion && (
            <>
              <div
                className={`${styles.veredicto} ${acierto ? styles.veredictoBien : styles.veredictoMal}`}
                role="alert"
                aria-live="polite"
              >
                <p className={styles.veredictoTitulo}>
                  {acierto
                    ? <span key="bien"><span aria-hidden="true">✅</span> ¡Correcto!</span>
                    : <span key="mal"><span aria-hidden="true">❌</span> No es correcto</span>}
                </p>
                {!acierto && (
                  <p className={styles.veredictoDetalle}>
                    {respuestaDada ? `Tu respuesta: «${respuestaDada}».` : 'No has escrito nada.'}
                  </p>
                )}
                {correccion.aviso && <p className={styles.veredictoAviso}>{correccion.aviso}</p>}
                <p className={styles.veredictoFrase} lang="en">{fraseCompleta(ej)}</p>
                {alternativas.length > 0 && (
                  <p className={styles.veredictoDetalle}>{`También vale: ${alternativas.join(' · ')}`}</p>
                )}
                <p className={styles.veredictoRegla}>{explicar(ej)}</p>
                {ej.nota && <p className={styles.veredictoNota}>{ej.nota}</p>}
              </div>
              <button type="button" ref={siguienteRef} className={styles.btnPrincipal} onClick={siguiente}>
                {esUltima ? 'Ver resultados' : 'Siguiente →'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.panel} ref={resultadoRef} tabIndex={-1}>
          <h2 className={styles.panelTitulo}>Resultado</h2>
          <p className={styles.resultadoCifra}>{`${aciertos} de ${total}`}</p>
          <p className={styles.resultadoPct}>{`${formatPercentage(total > 0 ? aciertos / total : 0, 0)} de acierto`}</p>

          {fallados.length > 0 ? (
            <div className={styles.resultadoFallados} key="fallos">
              <p>{`Ejercicios fallados: ${fallados.join(', ')}`}</p>
              <ul className={styles.listaFallados}>
                {fallados.map((n) => {
                  const e = porNumero(n);
                  return e ? <li key={n}>{`Ejercicio ${n} · ${nombreTipo(e.tipo)}`}</li> : null;
                })}
              </ul>
            </div>
          ) : (
            <p className={styles.resultadoFallados} key="sinfallos">Ningún fallo en esta partida.</p>
          )}

          <div className={styles.filaBotones}>
            <button type="button" className={styles.btnPrincipalCorto} onClick={jugarDeNuevo}>
              <span aria-hidden="true">🔄</span> Jugar de nuevo
            </button>
            {fallados.length > 0 && (
              <button type="button" className={styles.btnSecundario} onClick={repetirFallados}>
                Repetir los fallados
              </button>
            )}
            <button type="button" className={styles.btnSecundario} onClick={volverConfig}>
              Cambiar ejercicios
            </button>
          </div>
        </div>
      )}

      {/* ── LAS CUATRO ESTRUCTURAS (siempre a la vista) ── */}
      <section className={styles.panel} aria-labelledby="titulo-estructuras">
        <h2 id="titulo-estructuras" className={styles.panelTitulo}>Las cuatro estructuras</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Estructura</th>
                <th scope="col">Uso</th>
                <th scope="col">Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              {TIPOS.map((t) => (
                <tr key={t}>
                  <td>
                    <strong>{`Tipo ${t}`}</strong>
                    <span className={styles.tablaNombre} lang="en">{REGLAS[t].nombre}</span>
                  </td>
                  <td>{REGLAS[t].estructura}</td>
                  <td>{REGLAS[t].uso}</td>
                  <td><em lang="en">{REGLAS[t].ejemplo}</em></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.nota}>{REGLA_UNLESS}</p>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía de los condicionales en inglés"
        subtitle="Cómo reconocer cada tipo, cómo se dice en español y los errores que más se repiten"
        icon="📖"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Los condicionales en inglés y en español</h4>
          <p className={styles.eduIntro}>
            Los cuatro tipos tienen equivalente en español, pero los tiempos no coinciden uno a uno: el
            español usa el subjuntivo donde el inglés usa el past simple o el past perfect.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Tipo</th>
                  <th scope="col">Inglés</th>
                  <th scope="col">Español</th>
                  <th scope="col">Qué cambia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>0</strong></td>
                  <td><em lang="en">If you heat ice, it melts.</em></td>
                  <td>Si calientas hielo, se derrite.</td>
                  <td>Nada: presente y presente en los dos idiomas.</td>
                </tr>
                <tr>
                  <td><strong>1</strong></td>
                  <td><em lang="en">If it rains, we will stay at home.</em></td>
                  <td>Si llueve, nos quedaremos en casa.</td>
                  <td>Igual que en español: tras «si» va el presente, nunca el futuro.</td>
                </tr>
                <tr>
                  <td><strong>2</strong></td>
                  <td><em lang="en">If I had time, I would travel.</em></td>
                  <td>Si tuviera tiempo, viajaría.</td>
                  <td>El imperfecto de subjuntivo («tuviera») es past simple en inglés («had»).</td>
                </tr>
                <tr>
                  <td><strong>3</strong></td>
                  <td><em lang="en">If I had known, I would have come.</em></td>
                  <td>Si lo hubiera sabido, habría venido.</td>
                  <td>«Hubiera sabido» es past perfect («had known»); «habría venido», would have + participio.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>¿Para quién es útil?</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <strong>Estudiante de secundaria o preparatoria</strong>
              </div>
              <p className={styles.escenarioExample}>
                El examen del trimestre pone frases con hueco de first y second conditional.
              </p>
              <p className={styles.escenarioTip}>
                Elige «Completar el hueco» y «Escribir la forma»: es el formato del examen. Lee siempre la
                regla del veredicto aunque aciertes.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <strong>Profesor que asigna ejercicios</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres que la clase practique el tipo 3 y luego compare el 2 con el 3.
              </p>
              <p className={styles.escenarioTip}>
                Abre el índice de ejercicios, copia los números y pide «haz los ejercicios 27-34». El
                resultado de cada alumno lista los fallados por número.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Adulto que prepara un B1 o un B2</strong>
              </div>
              <p className={styles.escenarioExample}>
                Los condicionales salen en la parte de gramática y en la de transformación de frases.
              </p>
              <p className={styles.escenarioTip}>
                Practica los cuatro tipos mezclados con 20 preguntas: en el examen no te dicen cuál toca.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💬</span>
                <strong>Quien aprende por su cuenta</strong>
              </div>
              <p className={styles.escenarioExample}>
                Entiendes los condicionales al leer, pero al hablar se te escapa «If I will…».
              </p>
              <p className={styles.escenarioTip}>
                Juega «Repetir los fallados» al terminar cada partida hasta que salga sin errores.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ: del mismo array que el FAQPage JSON-LD (metadata.ts) */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Preguntas frecuentes</h4>
          <ul className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <li key={f.question} className={styles.faqItem}>
                <strong>{f.question}</strong>
                <p>{f.answer}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Cómo resolver un ejercicio de condicionales, paso a paso</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Localiza las dos cláusulas</strong>
                <p>La que empieza por <em lang="en">if</em> o <em lang="en">unless</em> es la condición; la otra
                es la principal. Pueden ir en cualquier orden.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Mira el verbo de la cláusula que NO tiene hueco</strong>
                <p>Es la pista: <em lang="en">will</em> apunta al tipo 1, <em lang="en">would</em> al 2,
                <em lang="en"> would have</em> al 3 y un presente sin modal, al 0.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Decide el tipo y su pareja de tiempos</strong>
                <p>Cada tipo tiene su pareja fija: present + will, past simple + would, past perfect +
                would have. Consulta la tabla de las cuatro estructuras si dudas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Escribe la forma del verbo entre paréntesis</strong>
                <p>Recuerda la -s de la tercera persona en el present simple (<em lang="en">she feels</em>) y el
                participio en el tipo 3 (<em lang="en">had known</em>). Tras <em lang="en">if</em>, nunca will ni would.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Lee la regla del veredicto</strong>
                <p>Aunque aciertes, la explicación dice qué cláusula decidía el tipo. Es lo que se aplica al
                siguiente ejercicio.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Consejos */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Consejos para dominar los condicionales</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <strong>Busca la pista en la otra cláusula</strong>
              <p>El tipo no se adivina por el significado: lo marcan los tiempos verbales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✍️</span>
              <strong>La coma depende del orden</strong>
              <p>Si la cláusula con if va primero, lleva coma (<em lang="en">If it rains, we stay</em>); si va
              detrás, normalmente no (<em lang="en">We stay if it rains</em>).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗣️</span>
              <strong>Practica las contracciones</strong>
              <p>En el habla se oyen <em lang="en">I&apos;ll</em>, <em lang="en">I&apos;d</em> y
              <em lang="en"> would&apos;ve</em>. Ojo: <em lang="en">&apos;d</em> puede ser would o had; lo decide lo que sigue.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <strong>Apóyate en el español</strong>
              <p>«Si tuviera» es <em lang="en">If I had</em> y «si hubiera tenido», <em lang="en">If I had had</em>:
              el subjuntivo español avisa del tipo 2 y del 3.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <strong>Repite los fallados</strong>
              <p>Al terminar, «Repetir los fallados» vuelve a poner solo los ejercicios en los que fallaste.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores típicos */}
        <section className={styles.eduBloque}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores típicos</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Will después de if:</strong> <em lang="en">If it will rain</em> → <em lang="en">If it rains</em>.
                El futuro lo lleva la otra cláusula.
              </li>
              <li>
                <strong>Would después de if:</strong> <em lang="en">If I would have money</em> → <em lang="en">If I had money</em>.
              </li>
              <li>
                <strong>Would have en la condición del tipo 3:</strong> <em lang="en">If I would have known</em> →
                <em lang="en"> If I had known</em>.
              </li>
              <li>
                <strong>Mezclar tipos sin querer:</strong> <em lang="en">If I had time, I will help you</em> mezcla el
                past simple del tipo 2 con el will del tipo 1: <em lang="en">I would help you</em>.
              </li>
              <li>
                <strong>Negativa después de unless:</strong> <em lang="en">Unless you don&apos;t study</em> →
                <em lang="en"> Unless you study</em>. Unless ya es «if… not».
              </li>
              <li>
                <strong>Participio o -s olvidados:</strong> <em lang="en">If she study</em> → <em lang="en">If she studies</em>;
                <em lang="en"> If I had know</em> → <em lang="en">If I had known</em>.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="condicionales-ingles" />
      <Footer appName="condicionales-ingles" />
    </div>
  );
}
