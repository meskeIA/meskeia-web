'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './PreposicionesIngles.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatPercentage, enfocarSinCentrar, traerALaVista } from '@/lib';
import { useGuardaRafaga } from '@/lib/useGuardaRafaga';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  CATEGORIAS, PREPOSICIONES, HUECO, TOTAL_EJERCICIOS, ejerciciosDe, ejercicioPorNumero, corregir,
  explicacion, formaCorrecta, leerSeleccion, etiqueta, rangoDe,
  type Categoria, type Correccion, type Ejercicio, type Preposicion,
} from './motor';

type Pantalla = 'config' | 'quiz' | 'resultado';
type Modo = 'elegir' | 'escribir';
/** De dónde salen los ejercicios de la partida: al azar de las categorías, o una lista de números. */
type Origen = 'azar' | 'numeros';

// Emoji y rótulo separados: el emoji va con aria-hidden (§5 de accesibilidad)
const CATEGORIA_CONFIG: Record<Categoria, { emoji: string; label: string; ejemplos: string }> = {
  tiempo: { emoji: '🕐', label: 'Tiempo', ejemplos: "at 8 o'clock · on Monday · in July" },
  lugar: { emoji: '📍', label: 'Lugar', ejemplos: 'at the bus stop · on the table · in Peru' },
  sin: { emoji: '🚫', label: 'Sin preposición', ejemplos: 'next week · every day · go home' },
};

const MODOS: Record<Modo, { label: string; desc: string }> = {
  elegir: { label: 'Elegir', desc: 'in, on, at o ninguna' },
  escribir: { label: 'Escribir', desc: 'Teclea la preposición, o un guion si no lleva' },
};

const OPCIONES_PREGUNTAS = [10, 15, 20];
const LETRAS = ['A', 'B', 'C', 'D'];

/** Lo que el botón de cada opción manda al corrector. */
const RESPUESTA_OPCION: Record<Preposicion, string> = { in: 'in', on: 'on', at: 'at', ninguna: '—' };
/** Lo que se ve en el botón de cada opción. */
const TEXTO_OPCION: Record<Preposicion, string> = { in: 'in', on: 'on', at: 'at', ninguna: '— (ninguna)' };

function mezclar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function textoResultado(pct: number): { emoji: string; titulo: string } {
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Dominas in, on y at!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy bien!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

/** La frase partida por el hueco, para pintar el hueco aparte. */
function partesDeFrase(frase: string): [string, string] {
  const i = frase.indexOf(HUECO);
  return [frase.slice(0, i), frase.slice(i + HUECO.length)];
}

export default function PreposicionesInglesPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [categorias, setCategorias] = useState<Categoria[]>(['tiempo', 'lugar', 'sin']);
  const [modo, setModo] = useState<Modo>('elegir');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [textoNumeros, setTextoNumeros] = useState('');
  const [errorNumeros, setErrorNumeros] = useState<string | null>(null);

  const [partida, setPartida] = useState<Ejercicio[]>([]);
  const [actual, setActual] = useState(0);
  const [modoPartida, setModoPartida] = useState<Modo>('elegir');
  const [origen, setOrigen] = useState<Origen>('azar');
  const [elegida, setElegida] = useState<Preposicion | null>(null);
  const [escrito, setEscrito] = useState('');
  const [avisoVacio, setAvisoVacio] = useState(false);
  const [correccion, setCorreccion] = useState<Correccion | null>(null);
  const [correctas, setCorrectas] = useState(0);
  /** Números de los ejercicios fallados en la partida, en el orden en que se fallaron. */
  const [fallados, setFallados] = useState<number[]>([]);

  const ejercicio = partida[actual];
  const total = partida.length;
  const esUltimo = actual === total - 1;
  const respondida = correccion !== null;
  const respondidas = actual + (respondida ? 1 : 0);

  const disponibles = useMemo(() => ejerciciosDe(categorias), [categorias]);
  const preguntasPartida = Math.min(numPreguntas, disponibles.length);

  // ── Foco y vista: la receta del quiz de verbos irregulares (hallazgos 1834, 1835 y 3770) ──
  const quizPanelRef = useRef<HTMLDivElement>(null);
  const preguntaRef = useRef<HTMLDivElement>(null);
  const botonSiguienteRef = useRef<HTMLButtonElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const tituloConfigRef = useRef<HTMLHeadingElement>(null);
  const inputRespuestaRef = useRef<HTMLInputElement>(null);
  const inputNumerosRef = useRef<HTMLInputElement>(null);
  const vieneDelResultado = useRef(false);

  useEffect(() => {
    if (pantalla === 'quiz') {
      if (respondida) {
        enfocarSinCentrar(botonSiguienteRef.current);
      } else {
        traerALaVista(quizPanelRef.current, preguntaRef.current);
        if (modoPartida === 'escribir') inputRespuestaRef.current?.focus({ preventScroll: true });
        else preguntaRef.current?.focus({ preventScroll: true });
      }
    } else if (pantalla === 'resultado') {
      traerALaVista(resultadoRef.current, resultadoRef.current);
      resultadoRef.current?.focus({ preventScroll: true });
    } else if (pantalla === 'config' && vieneDelResultado.current) {
      vieneDelResultado.current = false;
      tituloConfigRef.current?.focus();
    }
  }, [pantalla, actual, respondida, modoPartida]);

  // Doble toque: la receta de la familia de quizzes (lib/useGuardaRafaga.ts, hallazgo 3615)
  const marcarCambioPantalla = useGuardaRafaga();

  const alternarCategoria = useCallback((c: Categoria) => {
    setCategorias((prev) => {
      if (prev.includes(c)) return prev.length > 1 ? prev.filter((x) => x !== c) : prev;
      return CATEGORIAS.filter((x) => x === c || prev.includes(x));
    });
  }, []);

  const arrancar = useCallback((ejercicios: Ejercicio[], nuevoOrigen: Origen) => {
    marcarCambioPantalla();
    setPartida(ejercicios);
    setActual(0);
    setElegida(null);
    setEscrito('');
    setAvisoVacio(false);
    setCorreccion(null);
    setCorrectas(0);
    setFallados([]);
    setModoPartida(modo);
    setOrigen(nuevoOrigen);
    setPantalla('quiz');
  }, [marcarCambioPantalla, modo]);

  const jugarAlAzar = useCallback(() => {
    arrancar(mezclar(disponibles).slice(0, numPreguntas), 'azar');
  }, [arrancar, disponibles, numPreguntas]);

  /** Juega los números escritos, en ese orden. Devuelve false si hay un error. */
  const jugarNumeros = useCallback((): boolean => {
    const seleccion = leerSeleccion(textoNumeros);
    if (!seleccion.ok) {
      setErrorNumeros(seleccion.error);
      inputNumerosRef.current?.focus();
      return false;
    }
    setErrorNumeros(null);
    const ejercicios = seleccion.numeros
      .map((n) => ejercicioPorNumero(n))
      .filter((e): e is Ejercicio => e !== undefined);
    arrancar(ejercicios, 'numeros');
    return true;
  }, [textoNumeros, arrancar]);

  const anotar = useCallback((c: Correccion) => {
    setCorreccion(c);
    if (c.correcta) setCorrectas((n) => n + 1);
    else setFallados((prev) => (prev.includes(ejercicio.numero) ? prev : [...prev, ejercicio.numero]));
  }, [ejercicio]);

  const responder = useCallback((p: Preposicion) => {
    if (respondida) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    setElegida(p);
    anotar(corregir(ejercicio, RESPUESTA_OPCION[p]));
  }, [respondida, marcarCambioPantalla, anotar, ejercicio]);

  const comprobarEscrito = useCallback(() => {
    if (respondida) return;
    if (escrito.trim() === '') {
      setAvisoVacio(true);
      inputRespuestaRef.current?.focus();
      return;
    }
    marcarCambioPantalla({ soloMismoPunto: true });
    setAvisoVacio(false);
    anotar(corregir(ejercicio, escrito));
  }, [respondida, escrito, marcarCambioPantalla, anotar, ejercicio]);

  const siguiente = useCallback(() => {
    marcarCambioPantalla();
    if (esUltimo) {
      setPantalla('resultado');
    } else {
      setActual((n) => n + 1);
      setElegida(null);
      setEscrito('');
      setAvisoVacio(false);
      setCorreccion(null);
    }
  }, [marcarCambioPantalla, esUltimo]);

  /** «Jugar de nuevo»: los mismos números en el mismo orden, o un sorteo nuevo con la misma configuración. */
  const jugarDeNuevo = useCallback(() => {
    if (origen === 'numeros') arrancar(partida, 'numeros');
    else jugarAlAzar();
  }, [origen, partida, arrancar, jugarAlAzar]);

  const volverConfig = useCallback(() => {
    marcarCambioPantalla();
    vieneDelResultado.current = true;
    setPantalla('config');
  }, [marcarCambioPantalla]);

  /** Qué se ha respondido, para que el veredicto diga dónde está el error. */
  const detalleFallo = useMemo(() => {
    if (!correccion || correccion.correcta) return '';
    if (modoPartida === 'elegir') return elegida ? `Has elegido «${etiqueta(elegida)}».` : '';
    const texto = escrito.trim();
    return correccion.formas === null
      ? `Has escrito «${texto}», que no es in, on, at ni un guion (sin preposición).`
      : `Has escrito «${texto}».`;
  }, [correccion, modoPartida, elegida, escrito]);

  const resultado = textoResultado(total > 0 ? correctas / total : 0);
  const [antes, despues] = ejercicio ? partesDeFrase(ejercicio.frase) : ['', ''];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Preposiciones en inglés: in, on, at <span aria-hidden="true">📍</span></h1>
        <p className={styles.subtitle}>
          Ejercicios numerados de tiempo y lugar, y los casos sin preposición · Elige o escribe la
          respuesta y lee la regla que la explica
        </p>
      </header>

      <LegalNotice />

      {/* ── CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.configPanel}>
          <h2 className={styles.configTitle} ref={tituloConfigRef} tabIndex={-1}>Qué quieres practicar</h2>

          <div className={styles.categoriaGrid} role="group" aria-label="Qué quieres practicar">
            {CATEGORIAS.map((c) => {
              const cfg = CATEGORIA_CONFIG[c];
              return (
                <button
                  type="button"
                  key={c}
                  className={`${styles.categoriaBtn} ${categorias.includes(c) ? styles.active : ''}`}
                  onClick={() => alternarCategoria(c)}
                  aria-pressed={categorias.includes(c)}
                >
                  <span className={styles.categoriaLabel}>
                    <span aria-hidden="true">{cfg.emoji}</span> {cfg.label}
                  </span>
                  <span className={styles.categoriaEjemplos} lang="en">{cfg.ejemplos}</span>
                  <span className={styles.categoriaCuenta}>{`${ejerciciosDe([c]).length} ejercicios`}</span>
                </button>
              );
            })}
          </div>

          <h3 className={styles.configSubtitle}>Cómo quieres responder</h3>
          <div className={styles.modoRow} role="group" aria-label="Cómo quieres responder">
            {(Object.keys(MODOS) as Modo[]).map((m) => (
              <button
                type="button"
                key={m}
                className={`${styles.modoBtn} ${modo === m ? styles.active : ''}`}
                onClick={() => setModo(m)}
                aria-pressed={modo === m}
              >
                <span className={styles.modoLabel}>{MODOS[m].label}</span>
                <span className={styles.modoDesc}>{MODOS[m].desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitle}>Número de preguntas</h3>
          <div className={styles.preguntasRow} role="group" aria-label="Número de preguntas">
            {OPCIONES_PREGUNTAS.map((n) => (
              <button
                type="button"
                key={n}
                className={`${styles.pregBtn} ${numPreguntas === n ? styles.active : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {`${n} preguntas`}
              </button>
            ))}
          </div>

          {disponibles.length < numPreguntas && (
            <p className={styles.avisoCantidad} role="status">
              {`Con lo elegido hay ${disponibles.length} ejercicios, así que la partida será de ${disponibles.length} preguntas.`}
            </p>
          )}

          <button type="button" className={styles.btnIniciar} onClick={jugarAlAzar}>
            {`Empezar — ${preguntasPartida} ejercicios al azar`}
          </button>

          {/* Un <form> para que Enter juegue desde el campo: por eso el botón es de tipo submit. */}
          <form
            className={styles.numerosCaja}
            onSubmit={(e) => { e.preventDefault(); jugarNumeros(); }}
            noValidate
          >
            <label htmlFor="ejercicios-por-numero" className={styles.numerosTitulo}>Ejercicios por número</label>
            <p id="ayuda-numeros" className={styles.numerosAyuda}>
              {`Cada ejercicio tiene un número fijo, del 1 al ${TOTAL_EJERCICIOS}: tiempo ${rangoDe('tiempo')}, lugar ${rangoDe('lugar')} y sin preposición ${rangoDe('sin')}. Escribe «3, 7, 11» o «5-9» y se juegan esos, en ese orden.`}
            </p>
            <div className={styles.numerosFila}>
              <input
                id="ejercicios-por-numero"
                ref={inputNumerosRef}
                type="text"
                className={styles.numerosInput}
                value={textoNumeros}
                onChange={(e) => { setTextoNumeros(e.target.value); setErrorNumeros(null); }}
                placeholder="3, 7, 11"
                autoComplete="off"
                aria-invalid={errorNumeros ? true : undefined}
                aria-describedby={errorNumeros ? 'ayuda-numeros error-numeros' : 'ayuda-numeros'}
              />
              <button type="submit" className={styles.btnNumeros}>Jugar estos ejercicios</button>
            </div>
            {errorNumeros && (
              <p id="error-numeros" className={styles.numerosError} role="alert">{errorNumeros}</p>
            )}
          </form>
        </div>
      )}

      {/* ── QUIZ ── */}
      {pantalla === 'quiz' && ejercicio && (
        <div className={styles.quizPanel} ref={quizPanelRef}>
          <div className={styles.hudBar}>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{`${actual + 1}/${total}`}</span>
              <span className={styles.hudLabel}>Pregunta</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{correctas}</span>
              <span className={styles.hudLabel}>Correctas</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>
                {formatPercentage(respondidas > 0 ? correctas / respondidas : 0, 0)}
              </span>
              <span className={styles.hudLabel}>Precisión</span>
            </div>
          </div>

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

          <div className={styles.preguntaCard} ref={preguntaRef} tabIndex={-1} data-numero={ejercicio.numero}>
            <p className={styles.preguntaMeta}>
              <span className={styles.numeroEjercicio}>{`Ejercicio ${ejercicio.numero}`}</span>
              <span className={styles.categoriaEtiqueta}>{CATEGORIA_CONFIG[ejercicio.categoria].label}</span>
            </p>
            <p className={styles.preguntaEnunciado}>
              {modoPartida === 'escribir'
                ? 'Escribe la preposición que falta (o un guion si no lleva):'
                : '¿Qué preposición falta?'}
            </p>
            <p className={styles.frase} lang="en">
              <span>{antes}</span>
              <span className={styles.hueco} aria-hidden="true">{HUECO}</span>
              <span className={styles.srOnly} lang="es">(hueco)</span>
              <span>{despues}</span>
            </p>
            <p className={styles.traduccion}>{`«${ejercicio.traduccion}»`}</p>
          </div>

          {modoPartida === 'elegir' && (
            <div className={styles.opcionesGrid}>
              {PREPOSICIONES.map((p, i) => {
                const esBuena = respondida && ejercicio.admitidas.includes(p);
                const esFallada = respondida && p === elegida && !esBuena;
                let claseExtra = '';
                if (respondida) claseExtra = esBuena ? styles.opcionCorrecta : esFallada ? styles.opcionIncorrecta : styles.opcionNeutral;
                const marca = esBuena ? ' (respuesta correcta)' : esFallada ? ' (tu respuesta, incorrecta)' : '';
                const nombre = p === 'ninguna' ? 'ninguna preposición' : p;
                // Elegir respuesta es una ACCIÓN, no un conmutador: sin aria-pressed (testigo de la familia de quizzes)
                return ( // a11y-ok: opción de respuesta, no un conmutador
                  <button
                    type="button"
                    key={p}
                    className={`${styles.opcion} ${claseExtra}`}
                    onClick={() => responder(p)}
                    disabled={respondida}
                    aria-label={`Opción ${LETRAS[i]}: ${nombre}${marca}`}
                  >
                    <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                    <span lang={p === 'ninguna' ? 'es' : 'en'}>{TEXTO_OPCION[p]}</span>
                    {esBuena && <span className={styles.opcionMarca} aria-hidden="true">✓</span>}
                    {esFallada && <span className={styles.opcionMarca} aria-hidden="true">✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Un <form> para que Enter compruebe: por eso «Comprobar» es de tipo submit, a propósito. */}
          {modoPartida === 'escribir' && (
            <form
              className={styles.escrituraForm}
              onSubmit={(e) => { e.preventDefault(); comprobarEscrito(); }}
              noValidate
            >
              <label htmlFor="respuesta-preposicion" className={styles.escrituraLabel}>
                Tu respuesta: in, on, at o un guion (-) si no lleva preposición
              </label>
              <div className={styles.escrituraFila}>
                <input
                  id="respuesta-preposicion"
                  ref={inputRespuestaRef}
                  type="text"
                  lang="en"
                  className={`${styles.escrituraInput} ${correccion?.correcta === true ? styles.escrituraOk : ''} ${correccion?.correcta === false ? styles.escrituraMal : ''}`}
                  value={escrito}
                  onChange={(e) => { setEscrito(e.target.value); setAvisoVacio(false); }}
                  readOnly={respondida}
                  aria-invalid={correccion?.correcta === false || avisoVacio ? true : undefined}
                  aria-describedby={avisoVacio ? 'aviso-vacio' : undefined}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                />
                {!respondida && (
                  <button type="submit" className={styles.btnComprobar}>Comprobar</button>
                )}
              </div>
              {avisoVacio && !respondida && (
                <p id="aviso-vacio" className={styles.avisoVacio} role="alert">
                  Escribe in, on, at, o un guion (-) si la frase no lleva preposición.
                </p>
              )}
            </form>
          )}

          {respondida && correccion && (
            <>
              <div
                className={`${styles.feedbackBanner} ${correccion.correcta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
                aria-live="polite"
              >
                <p className={styles.feedbackTitulo}>
                  {correccion.correcta
                    ? <><span aria-hidden="true">✅</span> ¡Correcto!</>
                    : <><span aria-hidden="true">❌</span> Incorrecto</>}
                </p>
                {detalleFallo && <p className={styles.feedbackDetalle}>{detalleFallo}</p>}
                <p className={styles.feedbackForma} lang="en">{formaCorrecta(ejercicio)}</p>
                <p className={styles.feedbackRegla}>{explicacion(ejercicio)}</p>
              </div>
              <button type="button" ref={botonSiguienteRef} className={styles.btnSiguiente} onClick={siguiente}>
                {esUltimo ? 'Ver resultados' : 'Siguiente pregunta →'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.resultadoPanel} ref={resultadoRef} tabIndex={-1}>
          <span className={styles.resultadoEmoji} aria-hidden="true">{resultado.emoji}</span>
          <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
          <p className={styles.resultadoPuntos}>{`${correctas} de ${total}`}</p>
          <p className={styles.resultadoSubtitulo}>
            {`${formatPercentage(total > 0 ? correctas / total : 0, 0)} de acierto`}
          </p>
          {fallados.length > 0 ? (
            <p className={styles.resultadoFallados}>
              {`Ejercicios fallados: ${fallados.join(', ')}. Escríbelos en «Ejercicios por número» para repetirlos.`}
            </p>
          ) : (
            <p className={styles.resultadoFallados}>No has fallado ningún ejercicio.</p>
          )}
          <div className={styles.botonesResultado}>
            <button type="button" className={styles.btnRejugar} onClick={jugarDeNuevo}>
              <span aria-hidden="true">🔄</span> Jugar de nuevo
            </button>
            <button type="button" className={styles.btnConfig} onClick={volverConfig}>
              <span aria-hidden="true">⚙️</span> Cambiar ejercicios
            </button>
          </div>
        </div>
      )}

      {/* ── TABLA DE REGLAS (siempre a la vista) ── */}
      <section className={styles.reglasPanel} aria-labelledby="titulo-reglas">
        <h2 id="titulo-reglas" className={styles.reglasTitulo}>Las reglas de in, on y at</h2>
        <p className={styles.reglasIntro}>
          De lo más amplio a lo más concreto: <strong lang="en">in</strong> para periodos y espacios,{' '}
          <strong lang="en">on</strong> para días y superficies, <strong lang="en">at</strong> para puntos exactos.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Preposición</th>
                <th scope="col">Tiempo</th>
                <th scope="col">Lugar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" lang="en">at</th>
                <td>
                  Horas: <em lang="en">at 8 o&apos;clock, at half past six</em>. Momentos puntuales:{' '}
                  <em lang="en">at night, at noon, at midnight, at lunchtime</em>. Fin de semana en
                  británico: <em lang="en">at the weekend</em>.
                </td>
                <td>
                  Un punto: <em lang="en">at the bus stop, at the door, at the traffic lights</em>. Sitios
                  donde se hace algo: <em lang="en">at home, at work, at school, at a party</em>. Dirección con
                  número: <em lang="en">at 42 Elm Street</em>.
                </td>
              </tr>
              <tr>
                <th scope="row" lang="en">on</th>
                <td>
                  Días y fechas: <em lang="en">on Monday, on 2 September, on my birthday, on Christmas Day</em>.
                  Día con su parte: <em lang="en">on Monday morning</em>. Fin de semana en americano:{' '}
                  <em lang="en">on the weekend</em>.
                </td>
                <td>
                  Superficies: <em lang="en">on the table, on the wall</em>. Transporte en el que se va de
                  pie: <em lang="en">on the bus, on the train, on the plane</em>, y <em lang="en">on a bike</em>.
                  Plantas, lados y medios: <em lang="en">on the second floor, on the left, on TV</em>. Calles:{' '}
                  <em lang="en">on Main Street</em>.
                </td>
              </tr>
              <tr>
                <th scope="row" lang="en">in</th>
                <td>
                  Meses, años, estaciones, décadas y siglos: <em lang="en">in July, in 2026, in summer, in the
                  1990s, in the 21st century</em>. Partes del día: <em lang="en">in the morning, in the
                  afternoon, in the evening</em>. Plazos: <em lang="en">in ten minutes</em> (dentro de).
                </td>
                <td>
                  Espacios cerrados: <em lang="en">in the box, in the kitchen, in a car, in a taxi</em>.
                  Ciudades, países y zonas: <em lang="en">in Peru, in a small town</em>. La calle en
                  británico: <em lang="en">in the street</em> (en americano, <em lang="en">on the street</em>).
                </td>
              </tr>
              <tr>
                <th scope="row">Sin preposición</th>
                <td>
                  Con <em lang="en">next, last, this, every</em>: <em lang="en">next week, last year, this
                  morning, every day</em>. Y <em lang="en">today, tomorrow, yesterday, tonight</em>.
                </td>
                <td>
                  <em lang="en">home</em> con verbos de movimiento: <em lang="en">go home, come home, get home</em>{' '}
                  (pero estar en casa es <em lang="en">at home</em>).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía de las preposiciones in, on y at"
        subtitle="Del «en» del español a las tres preposiciones del inglés, con los errores más frecuentes"
        icon="📖"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Un «en» del español, tres preposiciones en inglés</h4>
          <p className={styles.eduIntro}>
            El español dice «en» casi siempre; el inglés elige según cómo ve el sitio o el momento. Lo
            que decide es la palabra de después, no el verbo:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">En español</th>
                  <th scope="col">En inglés</th>
                  <th scope="col">Por qué</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>en la cocina</td><td><em lang="en">in the kitchen</em></td><td>Espacio cerrado: dentro</td></tr>
                <tr><td>en la mesa</td><td><em lang="en">on the table</em></td><td>Superficie: encima</td></tr>
                <tr><td>en la parada</td><td><em lang="en">at the bus stop</em></td><td>Un punto donde se espera</td></tr>
                <tr><td>en el bus / en el coche (carro, auto)</td><td><em lang="en">on the bus / in the car</em></td><td>En el bus se va de pie; en el coche, no</td></tr>
                <tr><td>en casa</td><td><em lang="en">at home</em></td><td>Sitio donde se hace algo</td></tr>
                <tr><td>en julio / en 2026</td><td><em lang="en">in July / in 2026</em></td><td>Periodo largo</td></tr>
                <tr><td>el lunes</td><td><em lang="en">on Monday</em></td><td>Día: on, aunque el español no lleve preposición</td></tr>
                <tr><td>a las 8</td><td><em lang="en">at 8 o&apos;clock</em></td><td>Hora exacta</td></tr>
                <tr><td>la semana que viene</td><td><em lang="en">next week</em></td><td>Con next, last, this, every: nada</td></tr>
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
                Tienes examen de inglés y entran las preposiciones de tiempo y lugar.
              </p>
              <p className={styles.escenarioTip}>
                Empieza por Tiempo en modo Elegir y, cuando aciertes casi todas, pasa a Escribir: es
                lo que piden los ejercicios de huecos de un examen.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <strong>Docente de inglés</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres mandar práctica concreta: «haz los ejercicios 3, 7 y 11» o «del 21 al 30».
              </p>
              <p className={styles.escenarioTip}>
                Los números no cambian. Tus alumnos los escriben en «Ejercicios por número» y te dicen
                al final qué números fallaron.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Adulto preparando un examen oficial</strong>
              </div>
              <p className={styles.escenarioExample}>
                Preparas un A2, un B1 o el certificado de idiomas de tu país, y las preposiciones te
                restan puntos en la redacción.
              </p>
              <p className={styles.escenarioTip}>
                Juega las tres categorías mezcladas: en un texto real nadie te avisa de si toca tiempo
                o lugar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
                <strong>Quien viaja o trabaja en inglés</strong>
              </div>
              <p className={styles.escenarioExample}>
                Escribes correos para quedar («see you on Friday at 10») o das indicaciones.
              </p>
              <p className={styles.escenarioTip}>
                Repasa sobre todo Sin preposición: «on next Monday» es de los errores que más se notan.
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
          <h4 className={styles.eduTitulo}>Cómo decidir la preposición, paso a paso</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Mira la palabra de después del hueco</strong>
                <p>Es la que decide: <em lang="en">Monday</em>, <em lang="en">July</em>, <em lang="en">the table</em>. El verbo casi nunca cambia la preposición.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>¿Lleva next, last, this o every?</strong>
                <p>Entonces no hay preposición: <em lang="en">next week, every day</em>. Lo mismo con <em lang="en">today, tomorrow, tonight</em>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Si es tiempo, mide su tamaño</strong>
                <p>Hora o momento puntual: <em lang="en">at</em>. Día o fecha: <em lang="en">on</em>. Mes, año, estación, siglo o parte del día: <em lang="en">in</em>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Si es lugar, imagina dónde está la cosa</strong>
                <p>Dentro de algo o en una zona: <em lang="en">in</em>. Encima de una superficie: <em lang="en">on</em>. En un punto o en un sitio de actividad: <em lang="en">at</em>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Repasa las expresiones fijas</strong>
                <p><em lang="en">at night, at home, at work, on the bus, in the car, on TV</em>: se aprenden en bloque, como una palabra.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Consejos */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Consejos para no fallar</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔻</span>
              <strong>De lo grande a lo pequeño</strong>
              <p>Piensa en un embudo: <em lang="en">in</em> 2026 → <em lang="en">in</em> July → <em lang="en">on</em> Monday → <em lang="en">at</em> 8 o&apos;clock.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧱</span>
              <strong>Aprende bloques, no palabras sueltas</strong>
              <p>Memorizar <em lang="en">at night</em> entero evita dudar entre <em lang="en">in</em> y <em lang="en">at</em> cada vez.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚌</span>
              <strong>¿Puedes ir de pie?</strong>
              <p>Si sí, es <em lang="en">on</em> (bus, tren, avión); si no, <em lang="en">in</em> (coche o carro, taxi).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <strong>Repite tus fallados por número</strong>
              <p>Al terminar, copia los números fallados en «Ejercicios por número» y vuelve a jugarlos al día siguiente.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores típicos */}
        <section className={styles.eduBloque}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores típicos de hispanohablantes</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>«in Monday»:</strong> los días van con on: <em lang="en">on Monday</em>.</li>
              <li><strong>«in the night»:</strong> para la noche en general es <em lang="en">at night</em>, sin artículo.</li>
              <li><strong>«on the morning»:</strong> las partes del día van con in: <em lang="en">in the morning</em> (salvo con el día delante: <em lang="en">on Monday morning</em>).</li>
              <li><strong>«at 2026» o «in the weekend»:</strong> los años van con in (<em lang="en">in 2026</em>); el fin de semana, con at u on.</li>
              <li><strong>«in the bus»:</strong> en el bus, el tren o el avión se va <em lang="en">on</em>: <em lang="en">on the bus</em>.</li>
              <li><strong>«on next week»:</strong> con next, last, this y every no hay preposición: <em lang="en">next week</em>.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="preposiciones-ingles" />
      <Footer appName="preposiciones-ingles" />
    </div>
  );
}
