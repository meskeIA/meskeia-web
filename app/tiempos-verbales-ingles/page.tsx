'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef, type FormEvent } from 'react';
import styles from './TiemposVerbalesIngles.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatPercentage, enfocarSinCentrar, traerALaVista } from '@/lib';
import { useGuardaRafaga } from '@/lib/useGuardaRafaga';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  CATEGORIAS, INFO_CATEGORIA, TOTAL_EJERCICIOS, VERBOS, TIEMPOS, NOMBRE_TIEMPO, FORMAS, SUJETOS,
  conjugar, ejerciciosDe, ejercicioDe, opcionesDe, esRespuestaCorrecta, formasDelHueco, normalizar,
  huecoMostrado, partesEnunciado, enunciadoTexto, fraseCompleta, explicarConstruccion, leerNumeros,
  verboDe, terceraPersona, formasIng, pasados, participios,
  type Categoria, type Ejercicio, type Tiempo, type Forma,
} from './motor';

type Pantalla = 'config' | 'quiz' | 'resultado';
type Modo = 'escribir' | 'elegir';
/** De dónde salen los ejercicios de la partida: al azar de las categorías, o por número. */
type Origen = 'azar' | 'numeros';

const MODOS: Record<Modo, { label: string; desc: string }> = {
  escribir: { label: 'Escribir la forma', desc: 'Tecleas lo que va en el hueco' },
  elegir: { label: 'Elegir entre 4 opciones', desc: 'Pulsas la forma correcta' },
};

const OPCIONES_PREGUNTAS = [10, 15, 20];
const LETRAS = ['A', 'B', 'C', 'D'];

const NOMBRE_FORMA: Record<Forma, string> = {
  afirmativa: 'Afirmativa',
  negativa: 'Negativa',
  interrogativa: 'Interrogativa',
};

/** Números de cada categoría («del 1 al 16»): el profesor los ve antes de asignar. */
const RANGO_CATEGORIA: Record<Categoria, string> = Object.fromEntries(
  CATEGORIAS.map((c) => {
    const nums = ejerciciosDe([c]).map((e) => e.numero);
    return [c, `${nums.length} ejercicios · del ${Math.min(...nums)} al ${Math.max(...nums)}`];
  }),
) as Record<Categoria, string>;

const VERBOS_ORDENADOS = [...VERBOS].sort((a, b) => a.infinitivo.localeCompare(b.infinitivo));

const CONTINUOS = new Set<Tiempo>(['present-continuous', 'past-continuous']);

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const mayuscula = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t);

/** Una forma del conjugador como se escribe en una frase: las preguntas con mayúscula y signo. */
function formaParaTabla(f: string, forma: Forma): string {
  return forma === 'interrogativa' ? `${mayuscula(f)}?` : f;
}

function tituloResultado(pct: number): string {
  if (pct >= 0.9) return '¡Excelente!';
  if (pct >= 0.7) return '¡Muy bien!';
  if (pct >= 0.5) return 'Buen intento';
  return 'Sigue practicando';
}

export default function TiemposVerbalesInglesPage() {
  // ── Configuración ──
  const [categorias, setCategorias] = useState<Categoria[]>([...CATEGORIAS]);
  const [modo, setModo] = useState<Modo>('escribir');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [textoNumeros, setTextoNumeros] = useState('');
  const [errorNumeros, setErrorNumeros] = useState('');

  // ── Partida ──
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  /** Opciones barajadas de cada ejercicio, fijadas al empezar para que no cambien al pintar. */
  const [opciones, setOpciones] = useState<string[][]>([]);
  const [origen, setOrigen] = useState<Origen>('azar');
  /** Modo de la partida EN CURSO: cambiar el selector en la configuración no la altera. */
  const [modoPartida, setModoPartida] = useState<Modo>('escribir');
  const [actual, setActual] = useState(0);
  const [entrada, setEntrada] = useState('');
  const [elegida, setElegida] = useState<string | null>(null);
  /** Veredicto del ejercicio actual: null mientras no se ha respondido. */
  const [veredicto, setVeredicto] = useState<boolean | null>(null);
  const [aciertos, setAciertos] = useState(0);
  /** Números de los ejercicios fallados en la partida. */
  const [fallados, setFallados] = useState<number[]>([]);

  // ── Conjugador ──
  const [verboConj, setVerboConj] = useState('work');
  const [tiempoConj, setTiempoConj] = useState<Tiempo>('present-simple');

  const ej = ejercicios[actual];
  const total = ejercicios.length;
  const esUltimo = actual === total - 1;
  const respondido = veredicto !== null;
  const disponibles = useMemo(() => ejerciciosDe(categorias).length, [categorias]);
  const falladosOrdenados = useMemo(() => [...fallados].sort((a, b) => a - b), [fallados]);

  const quizPanelRef = useRef<HTMLDivElement>(null);
  const enunciadoRef = useRef<HTMLDivElement>(null);
  const siguienteRef = useRef<HTMLButtonElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const tituloConfigRef = useRef<HTMLHeadingElement>(null);
  const vieneDelResultado = useRef(false);

  /**
   * Foco y vista, la receta del quiz de verbos irregulares (hallazgos 1834, 1835 y 3770): al
   * responder, a «Siguiente», sin centrarlo para que el veredicto siga a la vista; en cada
   * ejercicio nuevo, al enunciado (tabIndex -1), que el lector lee entero con su número; en el
   * resultado, al propio resultado; y al volver a la configuración, a su título.
   */
  useEffect(() => {
    if (pantalla === 'quiz') {
      if (respondido) {
        enfocarSinCentrar(siguienteRef.current);
      } else {
        traerALaVista(quizPanelRef.current, enunciadoRef.current);
        enunciadoRef.current?.focus({ preventScroll: true });
      }
    } else if (pantalla === 'resultado') {
      traerALaVista(resultadoRef.current, resultadoRef.current);
      resultadoRef.current?.focus({ preventScroll: true });
    } else if (vieneDelResultado.current) {
      vieneDelResultado.current = false;
      tituloConfigRef.current?.focus();
    }
  }, [pantalla, actual, respondido]);

  // Doble toque: la receta de la familia de quizzes (lib/useGuardaRafaga.ts, hallazgo 3615).
  const marcarCambioPantalla = useGuardaRafaga();

  const alternarCategoria = useCallback((c: Categoria) => {
    setCategorias((prev) => {
      if (prev.includes(c)) return prev.length === 1 ? prev : prev.filter((x) => x !== c);
      return CATEGORIAS.filter((x) => prev.includes(x) || x === c);
    });
  }, []);

  const arrancar = useCallback((lista: Ejercicio[], nuevoOrigen: Origen) => {
    marcarCambioPantalla();
    setEjercicios(lista);
    setOpciones(lista.map((e) => mezclar(opcionesDe(e))));
    setActual(0);
    setEntrada('');
    setElegida(null);
    setVeredicto(null);
    setAciertos(0);
    setFallados([]);
    setModoPartida(modo);
    setOrigen(nuevoOrigen);
    setPantalla('quiz');
  }, [marcarCambioPantalla, modo]);

  const iniciarAzar = useCallback(() => {
    arrancar(mezclar(ejerciciosDe(categorias)).slice(0, numPreguntas), 'azar');
  }, [arrancar, categorias, numPreguntas]);

  const jugarNumeros = useCallback((numeros: number[]) => {
    const lista = numeros.flatMap((n) => {
      const e = ejercicioDe(n);
      return e ? [e] : [];
    });
    if (lista.length > 0) arrancar(lista, 'numeros');
  }, [arrancar]);

  const iniciarNumeros = useCallback((ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const lectura = leerNumeros(textoNumeros, TOTAL_EJERCICIOS);
    if (!lectura.ok) {
      setErrorNumeros(lectura.error);
      return;
    }
    setErrorNumeros('');
    jugarNumeros(lectura.numeros);
  }, [textoNumeros, jugarNumeros]);

  const anotar = useCallback((ok: boolean) => {
    setVeredicto(ok);
    if (ok) setAciertos((n) => n + 1);
    else setFallados((prev) => (prev.includes(ej.numero) ? prev : [...prev, ej.numero]));
  }, [ej]);

  const comprobar = useCallback((ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (respondido) return;
    // El foco a «Siguiente» sube la página y puede dejar el botón bajo el dedo (3679 en la familia)
    marcarCambioPantalla({ soloMismoPunto: true });
    anotar(esRespuestaCorrecta(ej, entrada));
  }, [respondido, marcarCambioPantalla, anotar, ej, entrada]);

  const elegir = useCallback((opcion: string) => {
    if (respondido) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    setElegida(opcion);
    anotar(esRespuestaCorrecta(ej, opcion));
  }, [respondido, marcarCambioPantalla, anotar, ej]);

  const siguiente = useCallback(() => {
    marcarCambioPantalla();
    if (esUltimo) {
      setPantalla('resultado');
    } else {
      setActual((n) => n + 1);
      setEntrada('');
      setElegida(null);
      setVeredicto(null);
    }
  }, [marcarCambioPantalla, esUltimo]);

  /** «Jugar de nuevo» repite el mismo tipo de partida: los mismos números, o otro sorteo. */
  const jugarDeNuevo = useCallback(() => {
    if (origen === 'numeros') arrancar(ejercicios, 'numeros');
    else iniciarAzar();
  }, [origen, arrancar, ejercicios, iniciarAzar]);

  const repetirFallados = useCallback(() => {
    setTextoNumeros(falladosOrdenados.join(', '));
    setErrorNumeros('');
    jugarNumeros(falladosOrdenados);
  }, [falladosOrdenados, jugarNumeros]);

  const volverConfig = useCallback(() => {
    marcarCambioPantalla();
    vieneDelResultado.current = true;
    setPantalla('config');
  }, [marcarCambioPantalla]);

  // ── Datos derivados del ejercicio actual ──
  const partes = ej ? partesEnunciado(ej) : null;
  const otrasValidas = ej
    ? formasDelHueco(ej).filter((f) => normalizar(f) !== normalizar(ej.respuesta)).map((f) => huecoMostrado(ej, f))
    : [];
  const detalleFallo = veredicto === false && ej
    ? modoPartida === 'elegir'
      ? `Has elegido «${huecoMostrado(ej, elegida ?? '')}».`
      : entrada.trim() ? `Has escrito «${entrada.trim()}».` : 'Has dejado el hueco vacío.'
    : '';

  // ── Conjugador ──
  const verboElegido = verboDe(verboConj);
  const tablaConj = useMemo(
    () => SUJETOS.map((s) => ({ sujeto: s, celdas: FORMAS.map((f) => conjugar(verboConj, tiempoConj, s, f)) })),
    [verboConj, tiempoConj],
  );
  const notaEstado = CONTINUOS.has(tiempoConj) ? verboElegido.estado ?? '' : '';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Tiempos verbales en inglés <span aria-hidden="true">⏳</span></h1>
        <p className={styles.subtitle}>
          {`${TOTAL_EJERCICIOS} ejercicios numerados con corrección y la regla de cada caso · Present simple y continuous, past, present perfect, will y going to · Y un conjugador`}
        </p>
      </header>

      <LegalNotice />

      {/* ── CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <section className={styles.panel} aria-labelledby="titulo-practica">
          <h2 id="titulo-practica" className={styles.panelTitulo} ref={tituloConfigRef} tabIndex={-1}>
            Practica los tiempos verbales
          </h2>

          <h3 className={styles.subtitulo}>Qué practicar</h3>
          <div className={styles.categoriasGrid} role="group" aria-label="Qué practicar">
            {CATEGORIAS.map((c) => (
              <button
                type="button"
                key={c}
                className={`${styles.eleccion} ${categorias.includes(c) ? styles.activo : ''}`}
                onClick={() => alternarCategoria(c)}
                aria-pressed={categorias.includes(c)}
              >
                <span className={styles.eleccionNombre}>{INFO_CATEGORIA[c].nombre}</span>
                <span className={styles.eleccionDesc}>{RANGO_CATEGORIA[c]}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.subtitulo}>Cómo quieres responder</h3>
          <div className={styles.modoGrid} role="group" aria-label="Cómo quieres responder">
            {(Object.entries(MODOS) as [Modo, typeof MODOS[Modo]][]).map(([clave, cfg]) => (
              <button
                type="button"
                key={clave}
                className={`${styles.eleccion} ${modo === clave ? styles.activo : ''}`}
                onClick={() => setModo(clave)}
                aria-pressed={modo === clave}
              >
                <span className={styles.eleccionNombre}>{cfg.label}</span>
                <span className={styles.eleccionDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.subtitulo}>Cuántos ejercicios al azar</h3>
          <div className={styles.filaBotones} role="group" aria-label="Cuántos ejercicios al azar">
            {OPCIONES_PREGUNTAS.map((n) => (
              <button
                type="button"
                key={n}
                className={`${styles.pastilla} ${numPreguntas === n ? styles.activo : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {`${n} ejercicios`}
              </button>
            ))}
          </div>

          {disponibles < numPreguntas && (
            <p className={styles.aviso} role="status">
              {`Lo que has elegido tiene ${disponibles} ejercicios, así que la partida será de ${disponibles}.`}
            </p>
          )}

          <button type="button" className={styles.btnPrincipal} onClick={iniciarAzar}>
            {`Empezar — ${Math.min(numPreguntas, disponibles)} ejercicios al azar`}
          </button>

          {/* Selección por número: lo que asigna un profesor («haz los ejercicios 3, 7 y 11»). */}
          <form className={styles.numerosCaja} onSubmit={iniciarNumeros} noValidate>
            <label htmlFor="ejercicios-numero" className={styles.numerosLabel}>Ejercicios por número</label>
            <p id="ayuda-numeros" className={styles.numerosAyuda}>
              {`Escribe números sueltos o intervalos, como «3, 7, 11» o «5-9», y se juegan en ese orden. Hay del 1 al ${TOTAL_EJERCICIOS}.`}
            </p>
            <div className={styles.numerosFila}>
              <input
                id="ejercicios-numero"
                type="text"
                inputMode="text"
                className={styles.numerosInput}
                value={textoNumeros}
                onChange={(e) => {
                  setTextoNumeros(e.target.value);
                  if (errorNumeros) setErrorNumeros('');
                }}
                aria-invalid={errorNumeros ? true : undefined}
                aria-describedby={errorNumeros ? 'ayuda-numeros error-numeros' : 'ayuda-numeros'}
                autoComplete="off"
                placeholder="3, 7, 11"
              />
              <button type="submit" className={styles.btnSecundario}>Hacer estos ejercicios</button>
            </div>
            {errorNumeros && (
              <p id="error-numeros" className={styles.numerosError} role="alert">{errorNumeros}</p>
            )}
          </form>

          <details className={styles.lista}>
            <summary className={styles.listaResumen}>{`Ver los ${TOTAL_EJERCICIOS} ejercicios con su número`}</summary>
            {CATEGORIAS.map((c) => (
              <div key={c} className={styles.listaGrupo}>
                <h4 className={styles.listaTitulo}>{INFO_CATEGORIA[c].nombre}</h4>
                <ul className={styles.listaItems}>
                  {ejerciciosDe([c]).map((e) => (
                    <li key={e.numero} className={styles.listaItem}>
                      <span className={styles.listaNumero}>{`${e.numero}.`}</span>
                      <span lang="en">{enunciadoTexto(e)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        </section>
      )}

      {/* ── EJERCICIOS ── */}
      {pantalla === 'quiz' && ej && partes && (
        <section className={styles.panel} ref={quizPanelRef} aria-label="Ejercicios">
          <div className={styles.hud}>
            <span className={styles.hudDato}>{`Pregunta ${actual + 1} de ${total}`}</span>
            <span className={styles.hudDato}>{`Aciertos: ${aciertos}`}</span>
          </div>
          <div className={styles.progreso}>
            <div
              className={styles.progresoRelleno}
              style={{ width: `${(actual / total) * 100}%` }}
              role="progressbar"
              aria-label="Ejercicios respondidos"
              aria-valuetext={`${actual} de ${total}`}
              aria-valuenow={actual}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          </div>

          <div className={styles.enunciado} ref={enunciadoRef} tabIndex={-1}>
            <p className={styles.enunciadoNumero}>{`Ejercicio ${ej.numero}`}</p>
            <p className={styles.enunciadoCategoria}>{INFO_CATEGORIA[ej.categoria].nombre}</p>
            <p className={styles.frase} lang="en">
              <span>{partes.antes}</span>
              <span className={styles.hueco} aria-hidden="true">______</span>
              <span className={styles.soloLector} lang="es">(hueco)</span>
              <span className={styles.pista}>{partes.pista}</span>
              <span>{partes.despues}</span>
            </p>
          </div>

          {modoPartida === 'escribir' && (
            <form className={styles.respuestaForm} onSubmit={comprobar} noValidate>
              <label htmlFor="respuesta-hueco" className={styles.respuestaLabel}>Lo que va en el hueco</label>
              <input
                id="respuesta-hueco"
                type="text"
                lang="en"
                className={`${styles.respuestaInput} ${veredicto === true ? styles.inputBien : ''} ${veredicto === false ? styles.inputMal : ''}`}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                readOnly={respondido}
                aria-invalid={veredicto === false ? true : undefined}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
              />
              {!respondido && (
                <button type="submit" className={styles.btnPrincipal}>Comprobar</button>
              )}
            </form>
          )}

          {modoPartida === 'elegir' && (
            <div className={styles.opcionesGrid}>
              {(opciones[actual] ?? []).map((opcion, i) => {
                const buena = respondido && esRespuestaCorrecta(ej, opcion);
                const fallada = respondido && opcion === elegida && !buena;
                const marca = buena ? ' (respuesta correcta)' : fallada ? ' (tu respuesta, incorrecta)' : '';
                const texto = huecoMostrado(ej, opcion);
                // Elegir respuesta es una ACCIÓN, no un conmutador: sin aria-pressed (testigo de la familia)
                return ( // a11y-ok: opción de respuesta, tests/familias/quizzes.spec.ts exige que no lo lleve
                  <button
                    type="button"
                    key={opcion}
                    className={`${styles.opcion} ${buena ? styles.opcionBuena : ''} ${fallada ? styles.opcionMala : ''} ${respondido && !buena && !fallada ? styles.opcionApagada : ''}`}
                    onClick={() => elegir(opcion)}
                    disabled={respondido}
                    aria-label={`Opción ${LETRAS[i]}: ${texto}${marca}`}
                  >
                    <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                    <span className={styles.opcionTexto} lang="en">{texto}</span>
                    {buena && <span className={styles.opcionMarca} aria-hidden="true">✓</span>}
                    {fallada && <span className={styles.opcionMarca} aria-hidden="true">✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {respondido && (
            <>
              <div
                className={`${styles.veredicto} ${veredicto ? styles.veredictoBien : styles.veredictoMal}`}
                role="alert"
                aria-live="polite"
              >
                <p className={styles.veredictoTitulo}>
                  {veredicto
                    ? <span key="bien"><span aria-hidden="true">✅</span> ¡Correcto!</span>
                    : <span key="mal"><span aria-hidden="true">❌</span> No es correcto</span>}
                </p>
                {veredicto === false && <p className={styles.veredictoDetalle}>{detalleFallo}</p>}
                <p className={styles.veredictoFrase} lang="en">{fraseCompleta(ej)}</p>
                {otrasValidas.length > 0 && (
                  <p className={styles.veredictoDetalle}>{`También vale: ${otrasValidas.join(' · ')}.`}</p>
                )}
                <p className={styles.veredictoRegla}>{ej.regla}</p>
                <p className={styles.veredictoConstruccion}>{explicarConstruccion(ej)}</p>
              </div>
              <button type="button" ref={siguienteRef} className={styles.btnPrincipal} onClick={siguiente}>
                {esUltimo ? 'Ver el resultado' : 'Siguiente ejercicio →'}
              </button>
            </>
          )}
        </section>
      )}

      {/* ── RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.panel} ref={resultadoRef} tabIndex={-1}>
          <h2 className={styles.resultadoTitulo}>{tituloResultado(total > 0 ? aciertos / total : 0)}</h2>
          <p className={styles.resultadoCifra}>{`${aciertos} de ${total}`}</p>
          <p className={styles.resultadoPorcentaje}>{`${formatPercentage(total > 0 ? aciertos / total : 0, 0)} de aciertos`}</p>
          {falladosOrdenados.length > 0
            ? <p key="fallados" className={styles.resultadoFallados}>{`Ejercicios fallados: ${falladosOrdenados.join(', ')}.`}</p>
            : <p key="ninguno" className={styles.resultadoFallados}>No has fallado ningún ejercicio.</p>}
          <div className={styles.filaBotones}>
            {falladosOrdenados.length > 0 && (
              <button type="button" className={styles.btnSecundario} onClick={repetirFallados}>
                Repetir los fallados
              </button>
            )}
            <button type="button" className={styles.btnPrincipalAuto} onClick={jugarDeNuevo}>
              <span aria-hidden="true">🔄</span> Jugar de nuevo
            </button>
            <button type="button" className={styles.btnSecundario} onClick={volverConfig}>
              <span aria-hidden="true">⚙️</span> Cambiar ejercicios
            </button>
          </div>
        </div>
      )}

      {/* ── CONJUGADOR ── */}
      <section className={styles.panel} aria-labelledby="titulo-conjugador">
        <h2 id="titulo-conjugador" className={styles.panelTitulo}>Conjugador de tiempos verbales</h2>
        <p className={styles.panelIntro}>
          Elige un verbo y un tiempo: la tabla da las tres formas con los siete sujetos, completas y contraídas.
        </p>

        <div className={styles.conjControles}>
          <label htmlFor="verbo-conjugador" className={styles.respuestaLabel}>Verbo</label>
          <select
            id="verbo-conjugador"
            className={styles.select}
            value={verboConj}
            onChange={(e) => setVerboConj(e.target.value)}
          >
            {VERBOS_ORDENADOS.map((v) => (
              <option key={v.infinitivo} value={v.infinitivo}>{`${v.infinitivo} — ${v.espanol}`}</option>
            ))}
          </select>
        </div>

        <h3 className={styles.subtitulo}>Tiempo</h3>
        <div className={styles.filaBotones} role="group" aria-label="Tiempo del conjugador">
          {TIEMPOS.map((t) => (
            <button
              type="button"
              key={t}
              className={`${styles.pastilla} ${tiempoConj === t ? styles.activo : ''}`}
              onClick={() => setTiempoConj(t)}
              aria-pressed={tiempoConj === t}
              lang="en"
            >
              {NOMBRE_TIEMPO[t]}
            </button>
          ))}
        </div>

        <dl className={styles.formasVerbo}>
          <div className={styles.formaDato}>
            <dt>Base</dt>
            <dd lang="en">{verboElegido.infinitivo}</dd>
          </div>
          <div className={styles.formaDato}>
            <dt>Con he, she, it</dt>
            <dd lang="en">{terceraPersona(verboElegido)}</dd>
          </div>
          <div className={styles.formaDato}>
            <dt>Forma en -ing</dt>
            <dd lang="en">{formasIng(verboElegido).join(' / ')}</dd>
          </div>
          <div className={styles.formaDato}>
            <dt>Past simple</dt>
            <dd lang="en">{pasados(verboElegido).join(' / ')}</dd>
          </div>
          <div className={styles.formaDato}>
            <dt>Participio</dt>
            <dd lang="en">{participios(verboElegido).join(' / ')}</dd>
          </div>
        </dl>

        {notaEstado && <p className={styles.aviso}>{notaEstado}</p>}

        <div className={styles.tableWrapper}>
          <table className={styles.conjTabla}>
            <caption className={styles.conjCaption}>{`${verboElegido.infinitivo} · ${NOMBRE_TIEMPO[tiempoConj]}`}</caption>
            <thead>
              <tr>
                <th scope="col">Sujeto</th>
                {FORMAS.map((f) => <th key={f} scope="col">{NOMBRE_FORMA[f]}</th>)}
              </tr>
            </thead>
            <tbody>
              {tablaConj.map((fila) => (
                <tr key={fila.sujeto}>
                  <th scope="row" lang="en">{fila.sujeto}</th>
                  {fila.celdas.map((formas, i) => (
                    <td key={FORMAS[i]} lang="en">
                      <span className={styles.conjPrincipal}>{formaParaTabla(formas[0] ?? '', FORMAS[i])}</span>
                      <span className={styles.conjVariantes}>
                        {formas.slice(1).map((f) => formaParaTabla(f, FORMAS[i])).join(' · ')}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía de los tiempos verbales en inglés"
        subtitle="Cuándo se usa cada tiempo, cómo se forma y los errores más frecuentes"
        icon="📖"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Los siete tiempos de un vistazo</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Tiempo</th>
                  <th scope="col">Cómo se forma</th>
                  <th scope="col">Para qué</th>
                  <th scope="col">Marcadores</th>
                  <th scope="col">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Present simple</strong></td>
                  <td>verbo (+ -s con he, she, it)</td>
                  <td>Costumbres, hechos, horarios, estados</td>
                  <td lang="en"><em>usually, every day, always</em></td>
                  <td lang="en"><em>She works in a bank.</em></td>
                </tr>
                <tr>
                  <td><strong>Present continuous</strong></td>
                  <td>am / is / are + -ing</td>
                  <td>Lo que pasa ahora o en esta temporada</td>
                  <td lang="en"><em>now, at the moment, Look!</em></td>
                  <td lang="en"><em>She is working now.</em></td>
                </tr>
                <tr>
                  <td><strong>Past simple</strong></td>
                  <td>verbo + -ed o forma irregular</td>
                  <td>Acción terminada en un momento concreto</td>
                  <td lang="en"><em>yesterday, last week, ago, in 2010</em></td>
                  <td lang="en"><em>She worked there in 2010.</em></td>
                </tr>
                <tr>
                  <td><strong>Past continuous</strong></td>
                  <td>was / were + -ing</td>
                  <td>Acción en curso en un momento del pasado</td>
                  <td lang="en"><em>while, when, at 8 o&apos;clock</em></td>
                  <td lang="en"><em>She was working when I called.</em></td>
                </tr>
                <tr>
                  <td><strong>Present perfect</strong></td>
                  <td>have / has + participio</td>
                  <td>Pasado unido al presente, sin fecha</td>
                  <td lang="en"><em>ever, never, since, for, so far</em></td>
                  <td lang="en"><em>She has worked here since May.</em></td>
                </tr>
                <tr>
                  <td><strong>Will</strong></td>
                  <td>will + verbo</td>
                  <td>Decisiones al momento, ofrecimientos, promesas</td>
                  <td lang="en"><em>I promise, I think, OK</em></td>
                  <td lang="en"><em>I&apos;ll help you.</em></td>
                </tr>
                <tr>
                  <td><strong>Be going to</strong></td>
                  <td>am / is / are + going to + verbo</td>
                  <td>Planes decididos antes, predicciones con pruebas</td>
                  <td lang="en"><em>Look!, I&apos;ve decided</em></td>
                  <td lang="en"><em>It&apos;s going to rain.</em></td>
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
                Tienes examen de inglés y te van a pedir completar frases eligiendo entre present simple y continuous, o entre past simple y present perfect.
              </p>
              <p className={styles.escenarioTip}>
                Elige solo la pareja que entra en el examen y juega en el modo escribir: es lo que pide el papel.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <strong>Profesor o profesora de inglés</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres mandar una tarea concreta: «haz los ejercicios 3, 7 y 11» o «del 17 al 28».
              </p>
              <p className={styles.escenarioTip}>
                Los números no cambian. Despliega la lista de ejercicios para elegirlos, y pide al alumnado que te enseñe los fallados del resultado.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Adulto que prepara un examen oficial</strong>
              </div>
              <p className={styles.escenarioExample}>
                Preparas un B1 o un B2 y se te siguen escapando el present perfect y los verbos de estado.
              </p>
              <p className={styles.escenarioTip}>
                Lee la explicación de cada fallo: dice qué marcador temporal decide el tiempo en esa frase.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Quien escribe en inglés en el trabajo</strong>
              </div>
              <p className={styles.escenarioExample}>
                Redactas un correo y dudas de cómo queda la negativa o la pregunta de un verbo en un tiempo.
              </p>
              <p className={styles.escenarioTip}>
                Usa el conjugador: verbo y tiempo, y tienes las tres formas con cada sujeto, completas y contraídas.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ: se pinta del mismo array que el FAQPage JSON-LD (metadata.ts) */}
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
          <h4 className={styles.eduTitulo}>Cómo elegir el tiempo correcto, paso a paso</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Busca el marcador temporal</strong>
                <p>Palabras como <em lang="en">every day</em>, <em lang="en">now</em>, <em lang="en">yesterday</em>, <em lang="en">since</em> o <em lang="en">Look!</em> deciden casi siempre el tiempo. Subráyalas antes de pensar en el verbo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Pregúntate si la acción está terminada</strong>
                <p>Si ocurrió en un momento concreto que ya pasó, past simple. Si llega hasta hoy o no dice cuándo, present perfect.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Comprueba si el verbo es de estado</strong>
                <p><em lang="en">Know, like, want, need</em> y <em lang="en">have</em> (poseer) no van en continuo aunque la frase diga <em lang="en">now</em>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Mira el sujeto</strong>
                <p>He, she, it (o un nombre en singular) cambian el auxiliar y la terminación: <em lang="en">does, is, has, was</em> y la -s del present simple.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Construye la forma y revisa la ortografía</strong>
                <p>Negativas y preguntas con <em lang="en">do, does, did</em> llevan el verbo en forma base. En la -ing, la e muda se pierde y a veces se dobla la consonante: <em lang="en">making, swimming</em>.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Consejos */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Consejos para no fallar</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <strong>Lee la frase entera</strong>
              <p>El marcador puede estar al final (<em lang="en">…since March</em>) o en otra frase (<em lang="en">Look at those clouds!</em>).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧩</span>
              <strong>Practica por parejas</strong>
              <p>Los errores salen al elegir entre dos tiempos parecidos. Practica una pareja hasta acertarla y luego mézclalas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✍️</span>
              <strong>Escribe en lugar de elegir</strong>
              <p>Elegir entre cuatro opciones es más fácil que escribir. Cuando aciertes eligiendo, pasa al modo escribir.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <strong>Repite los fallados</strong>
              <p>Al terminar, el botón «Repetir los fallados» vuelve a ponerte solo los ejercicios que has fallado, por su número.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗣️</span>
              <strong>Dilo en voz alta</strong>
              <p>Leer la frase completa con la respuesta ayuda a fijar la estructura, sobre todo las contracciones: <em lang="en">she&apos;s, won&apos;t, I&apos;ve</em>.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores típicos */}
        <section className={styles.eduBloque}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores típicos que debes evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Olvidar la -s de he, she, it:</strong> <em lang="en">She visit</em> en lugar de <em lang="en">She visits</em>.
              </li>
              <li>
                <strong>Poner -s después de does o did:</strong> <em lang="en">She doesn&apos;t likes</em> o <em lang="en">I didn&apos;t went</em>. Tras el auxiliar, el verbo va en forma base.
              </li>
              <li>
                <strong>Usar verbos de estado en continuo:</strong> <em lang="en">I am knowing</em> o <em lang="en">She is needing</em>. Se dice <em lang="en">I know</em> y <em lang="en">She needs</em>.
              </li>
              <li>
                <strong>Present perfect con un momento terminado:</strong> <em lang="en">I have seen it last week</em>. Con <em lang="en">last week, yesterday, ago</em>, past simple: <em lang="en">I saw it last week</em>.
              </li>
              <li>
                <strong>Inventar «amn&apos;t»:</strong> la negativa de <em lang="en">I am</em> es <em lang="en">I&apos;m not</em> o <em lang="en">I am not</em>.
              </li>
              <li>
                <strong>Errores de ortografía en la -ing:</strong> <em lang="en">swiming, makeing, lieing</em>. Lo correcto es <em lang="en">swimming, making, lying</em>.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="tiempos-verbales-ingles" />
      <Footer appName="tiempos-verbales-ingles" />
    </div>
  );
}
