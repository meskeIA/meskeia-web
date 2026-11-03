'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './NumerosEnIngles.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatPercentage, parseSpanishNumber, partesNumericas, enfocarSinCentrar, traerALaVista } from '@/lib';
import { useGuardaRafaga } from '@/lib/useGuardaRafaga';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  convertir, cardinal, ordinalPalabras, ordinalAbreviado,
  EJERCICIOS, TOTAL_EJERCICIOS, CATEGORIAS, ORDEN_CATEGORIAS, ejercicioPorNumero,
  enunciadoDe, opcionesDe, respuestaPrincipal, formasCorrectas, corregir, explicar, leerSeleccion,
  type Categoria, type Ejercicio, type Correccion, type ResultadoConversion,
} from './motor';

type Pantalla = 'config' | 'quiz' | 'resultado';
type Modo = 'escribir' | 'elegir';
/** Cómo se eligió la partida: al azar entre unas categorías, o por números de ejercicio. */
type Origen = { tipo: 'azar'; categorias: Categoria[]; cuantos: number } | { tipo: 'numeros'; numeros: number[] };

const MODOS: Record<Modo, { label: string; desc: string }> = {
  escribir: { label: 'Escribir la respuesta', desc: 'Como en un examen: se corrige lo que tecleas' },
  elegir: { label: 'Elegir entre 4 opciones', desc: 'La buena y tres errores típicos' },
};

const OPCIONES_PREGUNTAS = [10, 15, 20];
const LETRAS = ['A', 'B', 'C', 'D'];

/** Tabla de consulta: del 0 al 20 y las decenas hasta el 100, con su ordinal. */
const TABLA_BASICA = [...Array.from({ length: 21 }, (_, i) => i), 30, 40, 50, 60, 70, 80, 90, 100];

const MENSAJE_NO_RECONOCIDA = 'No se reconoce esa cifra. Escribe solo números, con coma decimal (3,5) y, si quieres, punto de millares (1.250).';

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ejercicios de una partida al azar: `cuantos` de las categorías elegidas. */
function sortear(categorias: Categoria[], cuantos: number): Ejercicio[] {
  return mezclar(EJERCICIOS.filter((e) => categorias.includes(e.categoria))).slice(0, cuantos);
}

/** La cifra tecleada, convertida; `null` si no hay nada escrito. */
function leerConversion(entrada: string): ResultadoConversion | null {
  if (entrada.trim() === '') return null;
  const partes = partesNumericas(entrada);
  // parseSpanishNumber valida la cifra entera (NaN si no es un número); partesNumericas conserva
  // los decimales tal como se teclearon, que es lo que se lee cifra a cifra (3,50 → five zero).
  if (!partes || Number.isNaN(parseSpanishNumber(entrada))) return { ok: false, error: MENSAJE_NO_RECONOCIDA };
  return convertir(partes.signo, partes.entera, partes.decimales);
}

export default function NumerosEnInglesPage() {
  // ── Conversor ──
  const [entrada, setEntrada] = useState('');
  const conversion = useMemo(() => leerConversion(entrada), [entrada]);

  // ── Ejercicios ──
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [categorias, setCategorias] = useState<Categoria[]>(ORDEN_CATEGORIAS);
  const [modo, setModo] = useState<Modo>('escribir');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [textoNumeros, setTextoNumeros] = useState('');
  const [errorNumeros, setErrorNumeros] = useState('');

  const [partida, setPartida] = useState<Ejercicio[]>([]);
  const [opciones, setOpciones] = useState<string[][]>([]);
  const [origen, setOrigen] = useState<Origen>({ tipo: 'azar', categorias: ORDEN_CATEGORIAS, cuantos: 10 });
  /** Modo de la partida EN CURSO: cambiar el selector en la configuración no la altera. */
  const [modoPartida, setModoPartida] = useState<Modo>('escribir');
  const [actual, setActual] = useState(0);
  const [escrito, setEscrito] = useState('');
  const [correccion, setCorreccion] = useState<Correccion | null>(null);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fallados, setFallados] = useState<number[]>([]);

  const ejercicio = partida[actual];
  const total = partida.length;
  const esUltimo = actual === total - 1;
  const respondida = modoPartida === 'escribir' ? correccion !== null : elegida !== null;
  const aciertoActual = ejercicio !== undefined && (modoPartida === 'escribir'
    ? correccion !== null && correccion.ok
    : elegida === respuestaPrincipal(ejercicio));

  const disponibles = useMemo(
    () => EJERCICIOS.filter((e) => categorias.includes(e.categoria)).length,
    [categorias]
  );
  const preguntasAlAzar = Math.min(numPreguntas, disponibles);

  // ── Foco y vista (la receta de quiz-verbos-irregulares, hallazgos 1834, 1835 y 3770) ──
  const panelRef = useRef<HTMLDivElement>(null);
  const enunciadoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const siguienteRef = useRef<HTMLButtonElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const tituloConfigRef = useRef<HTMLHeadingElement>(null);
  const vieneDelResultado = useRef(false);

  useEffect(() => {
    if (pantalla === 'quiz') {
      if (respondida) {
        enfocarSinCentrar(siguienteRef.current);
      } else {
        traerALaVista(panelRef.current, enunciadoRef.current);
        if (modoPartida === 'escribir') inputRef.current?.focus({ preventScroll: true });
        else enunciadoRef.current?.focus({ preventScroll: true });
      }
    } else if (pantalla === 'resultado') {
      traerALaVista(resultadoRef.current, resultadoRef.current);
      resultadoRef.current?.focus({ preventScroll: true });
    } else if (pantalla === 'config' && vieneDelResultado.current) {
      vieneDelResultado.current = false;
      tituloConfigRef.current?.focus();
    }
  }, [pantalla, actual, respondida, modoPartida]);

  // Doble toque: la receta de la familia de quizzes (lib/useGuardaRafaga.ts, hallazgo 3615).
  const marcarCambioPantalla = useGuardaRafaga();

  const arrancar = useCallback((lista: Ejercicio[], nuevoOrigen: Origen) => {
    marcarCambioPantalla();
    setPartida(lista);
    setOpciones(lista.map((e) => mezclar(opcionesDe(e))));
    setOrigen(nuevoOrigen);
    setModoPartida(modo);
    setActual(0);
    setEscrito('');
    setCorreccion(null);
    setElegida(null);
    setAciertos(0);
    setFallados([]);
    setPantalla('quiz');
  }, [marcarCambioPantalla, modo]);

  const empezarAlAzar = useCallback(() => {
    if (categorias.length === 0) return;
    arrancar(sortear(categorias, numPreguntas), { tipo: 'azar', categorias, cuantos: numPreguntas });
  }, [arrancar, categorias, numPreguntas]);

  const jugarNumeros = useCallback((numeros: number[]) => {
    const lista = numeros.map(ejercicioPorNumero).filter((e): e is Ejercicio => e !== undefined);
    if (lista.length === 0) return;
    arrancar(lista, { tipo: 'numeros', numeros });
  }, [arrancar]);

  const empezarPorNumeros = useCallback(() => {
    const sel = leerSeleccion(textoNumeros);
    if (!sel.ok) {
      setErrorNumeros(sel.error);
      return;
    }
    setErrorNumeros('');
    jugarNumeros(sel.numeros);
  }, [textoNumeros, jugarNumeros]);

  const anotar = useCallback((ok: boolean) => {
    if (ok) setAciertos((n) => n + 1);
    else setFallados((prev) => (prev.includes(ejercicio.numero) ? prev : [...prev, ejercicio.numero]));
  }, [ejercicio]);

  const comprobar = useCallback(() => {
    if (correccion !== null || !ejercicio) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    const c = corregir(ejercicio, escrito);
    setCorreccion(c);
    anotar(c.ok);
  }, [correccion, ejercicio, escrito, anotar, marcarCambioPantalla]);

  const responder = useCallback((opcion: string) => {
    if (elegida !== null || !ejercicio) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    setElegida(opcion);
    anotar(opcion === respuestaPrincipal(ejercicio));
  }, [elegida, ejercicio, anotar, marcarCambioPantalla]);

  const siguiente = useCallback(() => {
    marcarCambioPantalla();
    if (esUltimo) {
      setPantalla('resultado');
    } else {
      setActual((n) => n + 1);
      setEscrito('');
      setCorreccion(null);
      setElegida(null);
    }
  }, [esUltimo, marcarCambioPantalla]);

  /** «Jugar de nuevo» repite el mismo tipo de partida: los mismos números, o otro sorteo igual. */
  const jugarDeNuevo = useCallback(() => {
    if (origen.tipo === 'numeros') jugarNumeros(origen.numeros);
    else arrancar(sortear(origen.categorias, origen.cuantos), origen);
  }, [origen, jugarNumeros, arrancar]);

  const volverConfig = useCallback(() => {
    marcarCambioPantalla();
    vieneDelResultado.current = true;
    setPantalla('config');
  }, [marcarCambioPantalla]);

  const alternarCategoria = useCallback((c: Categoria) => {
    setCategorias((prev) => (prev.includes(c)
      ? prev.filter((x) => x !== c)
      : ORDEN_CATEGORIAS.filter((x) => x === c || prev.includes(x))));
  }, []);

  const enunciado = ejercicio ? enunciadoDe(ejercicio) : null;
  const formas = ejercicio ? formasCorrectas(ejercicio) : [];
  const textoEscrito = escrito.trim();
  const detalleFallo = modoPartida === 'escribir' && correccion !== null && !correccion.ok
    ? (textoEscrito ? `Has escrito «${textoEscrito}».` : 'Lo has dejado en blanco.')
    : '';
  const avisoGuion = correccion && correccion.ok && correccion.faltaGuion.length > 0
    ? `Se da por buena, pero se escribe con guion: ${correccion.faltaGuion.join(', ')}.`
    : '';
  const avisoNotacion = correccion && correccion.notacionInglesa && ejercicio
    ? `Esa es la notación inglesa. Aquí se pide la cifra en formato español: ${respuestaPrincipal(ejercicio)}.`
    : '';
  const esCifra = ejercicio !== undefined && ejercicio.sentido === 'a-cifra' && ejercicio.tipo !== 'ordinal-abreviado';
  const r = conversion && conversion.ok ? conversion.conversion : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Números en inglés <span aria-hidden="true">🔢</span></h1>
        <p className={styles.subtitle}>
          Escribe una cifra y mira cómo se dice en inglés americano y británico: en palabras, como
          ordinal, como año y con decimales · Y practica con ejercicios numerados
        </p>
      </header>

      <LegalNotice />

      {/* ── CONVERSOR ── */}
      <section className={styles.conversor} aria-labelledby="titulo-conversor">
        <h2 id="titulo-conversor" className={styles.seccionTitulo}>Conversor de cifras a inglés</h2>
        <label htmlFor="cifra" className={styles.etiqueta}>Escribe una cifra (en formato español)</label>
        <input
          id="cifra"
          type="text"
          inputMode="decimal"
          className={styles.entrada}
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          placeholder="Ej.: 1.234,5"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={conversion !== null && !conversion.ok ? true : undefined}
          aria-describedby="cifra-ayuda cifra-error"
        />
        <p id="cifra-ayuda" className={styles.ayuda}>
          Enteros de 0 a 999.999.999.999 y decimales con coma: 21 · 105 · 1999 · 3,5 · 1.000.000.000
        </p>
        <p id="cifra-error" className={styles.error} aria-live="polite">
          {conversion !== null && !conversion.ok ? conversion.error : ''}
        </p>

        {r && (
          <div className={styles.resultados}>
            <div className={styles.resultadoBloque}>
              <h3 className={styles.bloqueTitulo}>{r.esDecimal ? 'Cómo se lee' : 'En palabras (cardinal)'}</h3>
              {r.us === r.uk ? (
                <div className={styles.lectura}>
                  <span className={styles.lecturaEtiqueta}>Americano y británico</span>
                  <span className={styles.lecturaTexto} lang="en">{r.us}</span>
                </div>
              ) : (
                <>
                  <div className={styles.lectura}>
                    <span className={styles.lecturaEtiqueta}>Americano</span>
                    <span className={styles.lecturaTexto} lang="en">{r.us}</span>
                  </div>
                  <div className={styles.lectura}>
                    <span className={styles.lecturaEtiqueta}>Británico</span>
                    <span className={styles.lecturaTexto} lang="en">{r.uk}</span>
                  </div>
                </>
              )}
              {r.ukAlternativa && (
                <div className={styles.lectura}>
                  <span className={styles.lecturaEtiqueta}>También en británico</span>
                  <span className={styles.lecturaTexto} lang="en">{r.ukAlternativa}</span>
                </div>
              )}
            </div>

            {r.ordinal && (
              <div className={styles.resultadoBloque}>
                <h3 className={styles.bloqueTitulo}>Ordinal</h3>
                <div className={styles.lectura}>
                  <span className={styles.lecturaEtiqueta}>Abreviado</span>
                  <span className={styles.lecturaTexto} lang="en">{r.ordinal.abreviado}</span>
                </div>
                {r.ordinal.us === r.ordinal.uk ? (
                  <div className={styles.lectura}>
                    <span className={styles.lecturaEtiqueta}>En palabras</span>
                    <span className={styles.lecturaTexto} lang="en">{r.ordinal.us}</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.lectura}>
                      <span className={styles.lecturaEtiqueta}>En palabras (americano)</span>
                      <span className={styles.lecturaTexto} lang="en">{r.ordinal.us}</span>
                    </div>
                    <div className={styles.lectura}>
                      <span className={styles.lecturaEtiqueta}>En palabras (británico)</span>
                      <span className={styles.lecturaTexto} lang="en">{r.ordinal.uk}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {r.anio && (
              <div className={styles.resultadoBloque}>
                <h3 className={styles.bloqueTitulo}>Si es un año</h3>
                {r.anio.map((l) => (
                  <div className={styles.lectura} key={l.texto}>
                    <span className={styles.lecturaEtiqueta}>{l.etiqueta}</span>
                    <span className={styles.lecturaTexto} lang="en">{l.texto}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.avisoNotacion}>
              <h3 className={styles.bloqueTitulo}>Cómo se escribe la cifra en inglés</h3>
              <div className={styles.notacionFila}>
                <div className={styles.notacionCelda}>
                  <span className={styles.lecturaEtiqueta}>En español</span>
                  <span className={styles.notacionCifra}>{r.espanol}</span>
                </div>
                <span className={styles.notacionFlecha} aria-hidden="true">→</span>
                <div className={styles.notacionCelda}>
                  <span className={styles.lecturaEtiqueta}>En notación inglesa</span>
                  <span className={styles.notacionCifra} lang="en">{r.notacion}</span>
                </div>
              </div>
              <p className={styles.avisoTexto}>
                El inglés usa la coma para los millares y el punto para los decimales, al revés que el
                español: 1.234,5 se escribe <span lang="en">1,234.5</span>.
              </p>
            </div>

            <div className={`${styles.avisoEscala} ${r.escalaCorta ? styles.avisoEscalaFuerte : ''}`}>
              <p className={styles.avisoTexto}>
                <strong>Billion no es un billón.</strong> En inglés, <span lang="en">a billion</span> son mil
                millones (10⁹) y un billón español (10¹²) es <span lang="en">a trillion</span>.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── EJERCICIOS: CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.panel}>
          <h2 className={styles.seccionTitulo} ref={tituloConfigRef} tabIndex={-1}>Practica con ejercicios</h2>

          <h3 className={styles.configSubtitulo}>Qué practicar</h3>
          <div className={styles.categoriasGrid} role="group" aria-label="Qué practicar">
            {ORDEN_CATEGORIAS.map((c) => (
              <button
                type="button"
                key={c}
                className={`${styles.eleccionBtn} ${categorias.includes(c) ? styles.activo : ''}`}
                onClick={() => alternarCategoria(c)}
                aria-pressed={categorias.includes(c)}
              >
                <span className={styles.eleccionNombre}>{CATEGORIAS[c].nombre}</span>
                <span className={styles.eleccionDesc} lang="en">{CATEGORIAS[c].desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitulo}>Cómo quieres responder</h3>
          <div className={styles.modoGrid} role="group" aria-label="Cómo quieres responder">
            {(Object.entries(MODOS) as [Modo, typeof MODOS[Modo]][]).map(([clave, cfg]) => (
              <button
                type="button"
                key={clave}
                className={`${styles.eleccionBtn} ${modo === clave ? styles.activo : ''}`}
                onClick={() => setModo(clave)}
                aria-pressed={modo === clave}
              >
                <span className={styles.eleccionNombre}>{cfg.label}</span>
                <span className={styles.eleccionDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitulo}>Número de preguntas</h3>
          <div className={styles.filaBotones} role="group" aria-label="Número de preguntas">
            {OPCIONES_PREGUNTAS.map((n) => (
              <button
                type="button"
                key={n}
                className={`${styles.pildora} ${numPreguntas === n ? styles.activo : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {`${n} preguntas`}
              </button>
            ))}
          </div>

          <p className={styles.avisoConfig} role="status">
            {categorias.length === 0
              ? 'Elige al menos una cosa que practicar.'
              : disponibles < numPreguntas
                ? `Lo elegido tiene ${disponibles} ejercicios, así que la partida será de ${disponibles}.`
                : ''}
          </p>

          <button
            type="button"
            className={styles.btnPrincipal}
            onClick={empezarAlAzar}
            disabled={categorias.length === 0}
          >
            {`Empezar — ${preguntasAlAzar} ejercicios al azar`}
          </button>

          <form
            className={styles.porNumeros}
            onSubmit={(e) => { e.preventDefault(); empezarPorNumeros(); }}
            noValidate
          >
            <h3 className={styles.configSubtitulo}>Ejercicios por número</h3>
            <p className={styles.ayuda}>
              {`Si tu profesor te ha mandado unos concretos, escríbelos aquí (del 1 al ${TOTAL_EJERCICIOS}): «3, 7, 11» o «5-9». Se juegan en ese orden, en el modo elegido arriba.`}
            </p>
            <label htmlFor="numeros-ejercicios" className={styles.etiqueta}>Números de los ejercicios</label>
            <div className={styles.filaNumeros}>
              <input
                id="numeros-ejercicios"
                type="text"
                inputMode="text"
                className={styles.entradaNumeros}
                value={textoNumeros}
                onChange={(e) => { setTextoNumeros(e.target.value); setErrorNumeros(''); }}
                placeholder="3, 7, 11"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={errorNumeros ? true : undefined}
                aria-describedby="numeros-error"
              />
              <button type="submit" className={styles.btnSecundario}>Jugar estos ejercicios</button>
            </div>
            <p id="numeros-error" className={styles.error} role="alert">{errorNumeros}</p>
          </form>

          <details className={styles.listaEjercicios}>
            <summary>{`Ver la lista de los ${TOTAL_EJERCICIOS} ejercicios`}</summary>
            <ol className={styles.listaOl}>
              {EJERCICIOS.map((e) => {
                const en = enunciadoDe(e);
                return (
                  <li key={e.numero} className={styles.listaItem}>
                    <span className={styles.listaNumero}>{`Ejercicio ${e.numero}`}</span>
                    <span className={styles.listaCategoria}>{CATEGORIAS[e.categoria].nombre}</span>
                    <span className={styles.listaTexto}>{en.instruccion}</span>
                    <span className={styles.listaMostrado} lang={en.enIngles ? 'en' : undefined}>{en.mostrado}</span>
                  </li>
                );
              })}
            </ol>
          </details>
        </div>
      )}

      {/* ── EJERCICIOS: PREGUNTA ── */}
      {pantalla === 'quiz' && ejercicio && enunciado && (
        <div className={styles.panel} ref={panelRef}>
          <div className={styles.hud}>
            <span className={styles.hudDato}>{`Pregunta ${actual + 1} de ${total}`}</span>
            <span className={styles.hudDato}>{`Aciertos: ${aciertos}`}</span>
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

          <div className={styles.enunciado} ref={enunciadoRef} tabIndex={-1} id="enunciado-ejercicio">
            <p className={styles.numeroEjercicio}>{`Ejercicio ${ejercicio.numero}`}</p>
            <p className={styles.instruccion}>{enunciado.instruccion}</p>
            <p className={styles.mostrado} lang={enunciado.enIngles ? 'en' : undefined}>{enunciado.mostrado}</p>
            <p className={styles.nota}>{enunciado.nota}</p>
          </div>

          {modoPartida === 'escribir' && (
            <form
              className={styles.formRespuesta}
              onSubmit={(e) => { e.preventDefault(); comprobar(); }}
              noValidate
            >
              <label htmlFor="respuesta" className={styles.etiqueta}>Tu respuesta</label>
              <input
                id="respuesta"
                ref={inputRef}
                type="text"
                inputMode={esCifra ? 'decimal' : 'text'}
                lang={esCifra ? undefined : 'en'}
                className={`${styles.entradaRespuesta} ${correccion?.ok === true ? styles.entradaBien : ''} ${correccion?.ok === false ? styles.entradaMal : ''}`}
                value={escrito}
                onChange={(e) => setEscrito(e.target.value)}
                readOnly={correccion !== null}
                aria-invalid={correccion?.ok === false ? true : undefined}
                aria-describedby="enunciado-ejercicio"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
              />
              {correccion === null && (
                <button type="submit" className={styles.btnPrincipal}>Comprobar</button>
              )}
            </form>
          )}

          {modoPartida === 'elegir' && (
            <div className={styles.opcionesGrid}>
              {(opciones[actual] ?? []).map((opcion, i) => {
                const esBuena = elegida !== null && opcion === respuestaPrincipal(ejercicio);
                const esFallada = elegida !== null && opcion === elegida && !esBuena;
                const marca = esBuena ? ' (respuesta correcta)' : esFallada ? ' (tu respuesta, incorrecta)' : '';
                const clase = elegida === null ? '' : esBuena ? styles.opcionBuena : esFallada ? styles.opcionMala : styles.opcionApagada;
                // Elegir respuesta es una ACCIÓN, no un conmutador: sin aria-pressed (testigo de la familia)
                return ( // a11y-ok: opción de respuesta, tests/familias/quizzes.spec.ts exige que no lo lleve
                  <button
                    type="button"
                    key={opcion}
                    className={`${styles.opcion} ${clase}`}
                    onClick={() => responder(opcion)}
                    disabled={elegida !== null}
                    aria-label={`Opción ${LETRAS[i]}: ${opcion}${marca}`}
                  >
                    <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                    <span className={styles.opcionTexto} lang={esCifra ? undefined : 'en'}>{opcion}</span>
                    {esBuena && <span className={styles.opcionMarca} aria-hidden="true">✓</span>}
                    {esFallada && <span className={styles.opcionMarca} aria-hidden="true">✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {respondida && (
            <>
              <div
                className={`${styles.veredicto} ${aciertoActual ? styles.veredictoBien : styles.veredictoMal}`}
                role="alert"
                aria-live="polite"
              >
                <p className={styles.veredictoTitulo}>
                  {aciertoActual
                    ? <><span aria-hidden="true">✅</span> ¡Correcto!</>
                    : <><span aria-hidden="true">❌</span> Incorrecto</>}
                </p>
                {detalleFallo && <p className={styles.veredictoDetalle}>{detalleFallo}</p>}
                {avisoNotacion && <p className={styles.veredictoDetalle}>{avisoNotacion}</p>}
                <p className={styles.veredictoEtiqueta}>{formas.length > 1 ? 'Formas correctas:' : 'Respuesta correcta:'}</p>
                <ul className={styles.formasLista}>
                  {formas.map((f) => (
                    <li key={f.texto} className={styles.formaItem}>
                      <span className={styles.formaTexto} lang={f.enIngles ? 'en' : undefined}>{f.texto}</span>
                      <span className={styles.formaEtiqueta}>{f.etiqueta ? `(${f.etiqueta})` : ''}</span>
                    </li>
                  ))}
                </ul>
                {avisoGuion && <p className={styles.veredictoDetalle}>{avisoGuion}</p>}
                <p className={styles.regla}>{explicar(ejercicio)}</p>
              </div>
              <button type="button" ref={siguienteRef} className={styles.btnPrincipal} onClick={siguiente}>
                {esUltimo ? 'Ver resultados' : 'Siguiente ejercicio →'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── EJERCICIOS: RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={`${styles.panel} ${styles.resultadoPanel}`} ref={resultadoRef} tabIndex={-1}>
          <h2 className={styles.seccionTitulo}>Tu resultado</h2>
          <p className={styles.notaCifra}>{`${aciertos} de ${total}`}</p>
          <p className={styles.notaTexto}>{`${formatPercentage(total > 0 ? aciertos / total : 0, 0)} de aciertos`}</p>
          <p className={styles.notaTexto}>
            {fallados.length === 0
              ? 'No has fallado ninguno.'
              : `${fallados.length === 1 ? 'Ejercicio fallado' : 'Ejercicios fallados'}: ${fallados.join(', ')}.`}
          </p>
          <div className={styles.botonesResultado}>
            {fallados.length > 0 && (
              <button type="button" className={styles.btnSecundario} onClick={() => jugarNumeros(fallados)}>
                {`Repetir los fallados (${fallados.length})`}
              </button>
            )}
            <button type="button" className={styles.btnPrincipal} onClick={jugarDeNuevo}>
              <span aria-hidden="true">🔄</span> Jugar de nuevo
            </button>
            <button type="button" className={styles.btnSecundario} onClick={volverConfig}>
              <span aria-hidden="true">⚙️</span> Cambiar ejercicios
            </button>
          </div>
        </div>
      )}

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía de los números en inglés"
        subtitle="Cardinales, ordinales, años, decimales y las diferencias con el español"
        icon="📖"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Lo que cambia respecto al español</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Caso</th>
                  <th scope="col">Español</th>
                  <th scope="col">Inglés</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Decimales</strong></td>
                  <td>3,5 (tres coma cinco)</td>
                  <td lang="en"><em>3.5 (three point five)</em></td>
                </tr>
                <tr>
                  <td><strong>Millares</strong></td>
                  <td>1.250.000</td>
                  <td lang="en"><em>1,250,000</em></td>
                </tr>
                <tr>
                  <td><strong>Mil millones</strong></td>
                  <td>mil millones (10⁹)</td>
                  <td lang="en"><em>a billion</em></td>
                </tr>
                <tr>
                  <td><strong>Un billón</strong></td>
                  <td>un billón (10¹²)</td>
                  <td lang="en"><em>a trillion</em></td>
                </tr>
                <tr>
                  <td><strong>Del 21 al 99</strong></td>
                  <td>veintiuno, treinta y cinco</td>
                  <td lang="en"><em>twenty-one, thirty-five</em></td>
                </tr>
                <tr>
                  <td><strong>Centenas</strong></td>
                  <td>ciento cinco</td>
                  <td lang="en"><em>one hundred five (US) · one hundred and five (UK)</em></td>
                </tr>
                <tr>
                  <td><strong>Ordinal abreviado</strong></td>
                  <td>1.º, 2.º, 3.º, 21.º</td>
                  <td lang="en"><em>1st, 2nd, 3rd, 21st</em></td>
                </tr>
                <tr>
                  <td><strong>Años</strong></td>
                  <td>mil novecientos noventa y nueve</td>
                  <td lang="en"><em>nineteen ninety-nine</em></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className={`${styles.eduTitulo} ${styles.eduTituloSegundo}`}>Los números en inglés del 0 al 20 y las decenas hasta el 100</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Cifra</th>
                  <th scope="col">Cardinal</th>
                  <th scope="col">Ordinal</th>
                  <th scope="col">Abreviado</th>
                </tr>
              </thead>
              <tbody>
                {TABLA_BASICA.map((n) => (
                  <tr key={n}>
                    <td><strong>{n}</strong></td>
                    <td lang="en"><em>{cardinal(n, 'us')}</em></td>
                    <td lang="en"><em>{n === 0 ? '—' : ordinalPalabras(n, 'us')}</em></td>
                    <td lang="en"><em>{n === 0 ? '—' : ordinalAbreviado(n)}</em></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.eduNota}>
            Para los demás, del 21 al 99: decena + guion + unidad (<span lang="en">forty-two</span>,
            <span lang="en"> forty-second</span>). Cualquier otra cifra, en el conversor de arriba.
          </p>
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
                Tienes examen de los números y te confundes entre <span lang="en">thirteen</span> y{' '}
                <span lang="en">thirty</span>, o escribes <span lang="en">fourty</span>.
              </p>
              <p className={styles.escenarioTip}>
                Juega Cardinales y Ordinales en el modo de escribir: cada fallo te dice la regla que
                lo explica.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <strong>Profesor de inglés</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres mandar una tarea corta y que cada alumno haga los mismos ejercicios.
              </p>
              <p className={styles.escenarioTip}>
                Abre la lista de ejercicios y asigna por número («del 26 al 34», los años). Al
                terminar, cada alumno ve qué números ha fallado.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Trabajo con cifras en inglés</strong>
              </div>
              <p className={styles.escenarioExample}>
                Redactas un informe o una presentación y tienes que escribir 2.500 millones o un
                porcentaje con decimales.
              </p>
              <p className={styles.escenarioTip}>
                El conversor te da la notación inglesa (<span lang="en">2,500,000,000</span>) y la cifra
                en palabras (<span lang="en">two billion five hundred million</span>), y te recuerda que
                billion no es un billón.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
                <strong>Viajes y vida diaria</strong>
              </div>
              <p className={styles.escenarioExample}>
                Fechas, precios, números de teléfono y de habitación: oír «<span lang="en">nineteen oh five</span>» o
                «<span lang="en">the twenty-first</span>» y entenderlo a la primera.
              </p>
              <p className={styles.escenarioTip}>
                Practica Años en el modo de elegir para acostumbrar el oído a la lectura por parejas.
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
          <h4 className={styles.eduTitulo}>Cómo leer cualquier cifra en inglés, paso a paso</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Parte la cifra en grupos de tres</strong>
                <p>Desde la derecha: 2.345.678 son tres grupos, 2 | 345 | 678.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Lee cada grupo como un número del 1 al 999</strong>
                <p>345 es <em lang="en">three hundred forty-five</em>, con guion entre la decena y la unidad.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Añade la escala detrás de cada grupo, sin -s</strong>
                <p><em lang="en">two million three hundred forty-five thousand six hundred seventy-eight</em>. Nunca <em lang="en">millions</em> ni <em lang="en">thousands</em> detrás de un número.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Decide si pones and</strong>
                <p>En británico va delante de las decenas y unidades de cada grupo (<em lang="en">three hundred and forty-five</em>); en americano se omite. Las dos formas son correctas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Si tiene decimales, di point y las cifras una a una</strong>
                <p>2,75 es <em lang="en">two point seven five</em>, y se escribe 2.75.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Si es un año, léelo por parejas</strong>
                <p>1865 es <em lang="en">eighteen sixty-five</em>; 1905, <em lang="en">nineteen oh five</em>; 2024, <em lang="en">twenty twenty-four</em>.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Consejos */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Consejos para no fallar</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👂</span>
              <strong>-teen o -ty: escucha el acento</strong>
              <p>En <em lang="en">thirteen</em> el acento va al final; en <em lang="en">thirty</em>, al principio. Es la pista para distinguirlos de oído.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✂️</span>
              <strong>Cinco raíces que cambian</strong>
              <p><em lang="en">thir-</em> (13, 30), <em lang="en">fif-</em> (15, 50), <em lang="en">eigh-</em> (18, 80, con una t), <em lang="en">for-</em> (40, sin u) y <em lang="en">twelf-</em> (twelfth).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔚</span>
              <strong>En el ordinal, solo cambia la última palabra</strong>
              <p><em lang="en">one hundred twenty-first</em>: todo lo de delante se queda como en el cardinal.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <strong>Practica en los dos sentidos</strong>
              <p>Escribir la cifra que se lee entrena el oído; escribir en palabras, la ortografía. Los ejercicios tienen de los dos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <strong>Cuenta los ceros</strong>
              <p>Million tiene 6, billion 9 y trillion 12. Si traduces una noticia, cuenta los ceros antes de escribir «billón».</p>
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
              <li><strong>Escribir <em lang="en">fourty</em>:</strong> es <em lang="en">forty</em>, aunque <em lang="en">four</em> y <em lang="en">fourteen</em> lleven u.</li>
              <li><strong>Poner -s a hundred, thousand o million:</strong> <em lang="en">two hundred</em>, no <em lang="en">two hundreds</em>. La -s solo va sin número delante (<em lang="en">hundreds of people</em>).</li>
              <li><strong>Traducir billion por billón:</strong> <em lang="en">a billion</em> son mil millones. Un error de mil veces.</li>
              <li><strong>Leer los decimales como un número:</strong> 0.25 es <em lang="en">zero point two five</em>, no <em lang="en">zero point twenty-five</em>.</li>
              <li><strong>Equivocar el sufijo del ordinal abreviado:</strong> <em lang="en">21st</em>, <em lang="en">22nd</em>, <em lang="en">23rd</em>, pero <em lang="en">11th</em>, <em lang="en">12th</em> y <em lang="en">13th</em>.</li>
              <li><strong>Olvidar el oh de los años:</strong> 1905 es <em lang="en">nineteen oh five</em>, no <em lang="en">nineteen five</em>.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="numeros-en-ingles" />
      <Footer appName="numeros-en-ingles" />
    </div>
  );
}
