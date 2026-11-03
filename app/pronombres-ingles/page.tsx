'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './PronombresIngles.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatPercentage, enfocarSinCentrar, traerALaVista } from '@/lib';
import { useGuardaRafaga } from '@/lib/useGuardaRafaga';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  PRONOMBRES, TIPOS, NOMBRE_TIPO, USO_TIPO, EJERCICIOS, CATEGORIAS, NOMBRE_CATEGORIA, EJEMPLO_CATEGORIA,
  corregir, explicacion, fraseResuelta, partesDelEnunciado, opcionesDe, buscarEjercicio, ejerciciosDe, leerNumeros,
  type Persona, type Tipo, type Categoria, type Ejercicio, type FilaPronombres, type Celda,
} from './motor';

type Pantalla = 'config' | 'quiz' | 'resultado';
type Modo = 'elegir' | 'escribir';
/** De dónde salen los ejercicios de la partida: al azar de unas categorías, o por número. */
type Origen = { tipo: 'azar'; categorias: Categoria[]; cuantos: number } | { tipo: 'numeros'; numeros: number[] };

const TOTAL_EJERCICIOS = EJERCICIOS.length;
const OPCIONES_PREGUNTAS = [10, 15, 20];
const LETRAS = ['A', 'B', 'C', 'D'];

const MODOS: Record<Modo, { label: string; desc: string }> = {
  elegir: { label: 'Elegir entre 4 opciones', desc: 'Pulsa la forma que completa la frase' },
  escribir: { label: 'Escribir la respuesta', desc: 'Teclea el pronombre, como en un examen' },
};

/** Una celda de la tabla con su fila y su tipo, para la ficha de ejemplos. */
interface CeldaFicha {
  fila: FilaPronombres;
  tipo: Tipo;
  celda: Celda;
}

function mezclar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tituloResultado(pct: number): { emoji: string; titulo: string } {
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Dominas los pronombres!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy bien!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

export default function PronombresInglesPage() {
  // ── Tabla interactiva ──
  const [personaSel, setPersonaSel] = useState<Persona | null>(null);
  const [tipoSel, setTipoSel] = useState<Tipo | null>(null);

  // ── Configuración ──
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS);
  const [modo, setModo] = useState<Modo>('elegir');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [textoNumeros, setTextoNumeros] = useState('');
  const [errorNumeros, setErrorNumeros] = useState('');

  // ── Partida ──
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  /** Opciones barajadas de cada ejercicio de la partida, en el mismo orden. */
  const [opciones, setOpciones] = useState<string[][]>([]);
  const [actual, setActual] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [escrito, setEscrito] = useState('');
  /** Veredicto del modo escribir: null mientras no se ha comprobado. */
  const [correccion, setCorreccion] = useState<boolean | null>(null);
  const [aciertos, setAciertos] = useState(0);
  /** Números de los ejercicios fallados en la partida, en el orden en que se fallaron. */
  const [fallados, setFallados] = useState<number[]>([]);
  const [modoPartida, setModoPartida] = useState<Modo>('elegir');
  const [origen, setOrigen] = useState<Origen>({ tipo: 'azar', categorias: CATEGORIAS, cuantos: 10 });

  const ej = ejercicios[actual];
  const total = ejercicios.length;
  const esUltimo = actual === total - 1;
  const respondida = modoPartida === 'escribir' ? correccion !== null : seleccionada !== null;
  const respondidas = actual + (respondida ? 1 : 0);
  const aciertoActual = modoPartida === 'escribir'
    ? correccion === true
    : ej !== undefined && seleccionada !== null && corregir(ej, seleccionada);
  const respuestaDada = modoPartida === 'escribir' ? escrito.trim() : (seleccionada ?? '');

  const disponibles = useMemo(() => ejerciciosDe(categorias).length, [categorias]);
  const preguntasAlAzar = Math.min(numPreguntas, disponibles);

  // ── Tabla: lo que se ve en la ficha de ejemplos ──
  const celdasFicha = useMemo((): CeldaFicha[] => {
    const filas = personaSel ? PRONOMBRES.filter((f) => f.persona === personaSel) : PRONOMBRES;
    const tipos = tipoSel ? [tipoSel] : TIPOS;
    if (!personaSel && !tipoSel) return [];
    return filas.flatMap((f) => tipos.map((t) => ({ fila: f, tipo: t, celda: f.celdas[t] })));
  }, [personaSel, tipoSel]);

  const tituloFicha = personaSel && tipoSel
    ? `${NOMBRE_TIPO[tipoSel]} de ${personaSel}`
    : personaSel
      ? `Las cinco formas de ${personaSel}`
      : tipoSel
        ? `${NOMBRE_TIPO[tipoSel]}: ${USO_TIPO[tipoSel]}`
        : 'Ejemplos';

  // ── Foco y vista (la receta del quiz de verbos irregulares, hallazgos 1834, 1835 y 3770) ──
  const quizPanelRef = useRef<HTMLDivElement>(null);
  const preguntaRef = useRef<HTMLDivElement>(null);
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
        traerALaVista(quizPanelRef.current, preguntaRef.current);
        if (modoPartida === 'escribir') inputRef.current?.focus({ preventScroll: true });
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

  /** Doble toque: la receta de la familia de quizzes (lib/useGuardaRafaga.ts, hallazgo 3615). */
  const marcarCambioPantalla = useGuardaRafaga();

  const arrancar = useCallback((lista: Ejercicio[], nuevoOrigen: Origen) => {
    marcarCambioPantalla();
    setEjercicios(lista);
    setOpciones(lista.map((e) => mezclar(opcionesDe(e))));
    setActual(0);
    setSeleccionada(null);
    setEscrito('');
    setCorreccion(null);
    setAciertos(0);
    setFallados([]);
    setModoPartida(modo);
    setOrigen(nuevoOrigen);
    setPantalla('quiz');
  }, [marcarCambioPantalla, modo]);

  const jugarAlAzar = useCallback((cats: Categoria[], cuantos: number) => {
    const lista = mezclar(ejerciciosDe(cats)).slice(0, cuantos);
    if (lista.length === 0) return;
    arrancar(lista, { tipo: 'azar', categorias: cats, cuantos });
  }, [arrancar]);

  const jugarNumeros = useCallback((numeros: number[]) => {
    const lista = numeros.map(buscarEjercicio).filter((e): e is Ejercicio => e !== undefined);
    if (lista.length === 0) return;
    arrancar(lista, { tipo: 'numeros', numeros });
  }, [arrancar]);

  const enviarNumeros = useCallback(() => {
    const lectura = leerNumeros(textoNumeros, TOTAL_EJERCICIOS);
    if (!lectura.ok) {
      setErrorNumeros(lectura.error);
      return;
    }
    setErrorNumeros('');
    jugarNumeros(lectura.numeros);
  }, [textoNumeros, jugarNumeros]);

  const alternarCategoria = useCallback((c: Categoria) => {
    setCategorias((prev) => {
      if (prev.includes(c)) return prev.length === 1 ? prev : prev.filter((x) => x !== c);
      return CATEGORIAS.filter((x) => x === c || prev.includes(x));
    });
  }, []);

  const anotar = useCallback((ok: boolean) => {
    if (ok) setAciertos((n) => n + 1);
    else setFallados((prev) => (prev.includes(ej.numero) ? prev : [...prev, ej.numero]));
  }, [ej]);

  const responder = useCallback((opcion: string) => {
    if (seleccionada !== null) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    setSeleccionada(opcion);
    anotar(corregir(ej, opcion));
  }, [seleccionada, marcarCambioPantalla, anotar, ej]);

  const comprobarEscrito = useCallback(() => {
    if (correccion !== null) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    const ok = corregir(ej, escrito);
    setCorreccion(ok);
    anotar(ok);
  }, [correccion, marcarCambioPantalla, ej, escrito, anotar]);

  const siguiente = useCallback(() => {
    marcarCambioPantalla();
    if (esUltimo) {
      setPantalla('resultado');
    } else {
      setActual((n) => n + 1);
      setSeleccionada(null);
      setEscrito('');
      setCorreccion(null);
    }
  }, [marcarCambioPantalla, esUltimo]);

  /** «Jugar de nuevo» repite el mismo tipo de partida: los mismos números, o otro sorteo de las mismas categorías. */
  const jugarDeNuevo = useCallback(() => {
    if (origen.tipo === 'numeros') jugarNumeros(origen.numeros);
    else jugarAlAzar(origen.categorias, origen.cuantos);
  }, [origen, jugarNumeros, jugarAlAzar]);

  const repetirFallados = useCallback(() => {
    jugarNumeros(fallados);
  }, [fallados, jugarNumeros]);

  const volverConfig = useCallback(() => {
    marcarCambioPantalla();
    vieneDelResultado.current = true;
    setPantalla('config');
  }, [marcarCambioPantalla]);

  const resultado = tituloResultado(total > 0 ? aciertos / total : 0);
  const [antes, despues]: [string, string] = ej ? partesDelEnunciado(ej) : ['', ''];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Pronombres en inglés <span aria-hidden="true">🗣️</span></h1>
        <p className={styles.subtitle}>
          {`Personales, posesivos y reflexivos: la tabla con traducción y ejemplos, y ${TOTAL_EJERCICIOS} ejercicios numerados que se corrigen con su regla`}
        </p>
      </header>

      <LegalNotice />

      {/* ── TABLA INTERACTIVA ── */}
      <section className={styles.tablaPanel} aria-labelledby="titulo-tabla">
        <h2 id="titulo-tabla" className={styles.panelTitulo}>Tabla de los pronombres en inglés</h2>
        <p className={styles.panelIntro}>
          Elige una persona o un tipo para resaltar su fila o su columna y ver sus ejemplos. Pulsa otra vez para quitarlo.
        </p>

        <div className={styles.filtroBloque}>
          <p className={styles.filtroEtiqueta} id="etiqueta-personas">Persona</p>
          <div className={styles.filtroFila} role="group" aria-labelledby="etiqueta-personas">
            {PRONOMBRES.map((f) => (
              <button
                type="button"
                key={f.persona}
                lang="en"
                className={`${styles.chip} ${personaSel === f.persona ? styles.chipActivo : ''}`}
                onClick={() => setPersonaSel((p) => (p === f.persona ? null : f.persona))}
                aria-pressed={personaSel === f.persona}
              >
                {f.persona}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtroBloque}>
          <p className={styles.filtroEtiqueta} id="etiqueta-tipos">Tipo de pronombre</p>
          <div className={styles.filtroFila} role="group" aria-labelledby="etiqueta-tipos">
            {TIPOS.map((t) => (
              <button
                type="button"
                key={t}
                className={`${styles.chip} ${tipoSel === t ? styles.chipActivo : ''}`}
                onClick={() => setTipoSel((p) => (p === t ? null : t))}
                aria-pressed={tipoSel === t}
              >
                {NOMBRE_TIPO[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Con tabIndex: en el móvil la tabla se desliza de lado, y una zona que se desliza tiene que poder recibir el foco */}
        <div className={styles.tablaScroll} tabIndex={0} role="region" aria-label="Tabla de pronombres: desliza para ver todas las columnas">
          <table className={styles.tablaPronombres}>
            <caption className="sr-only">Pronombres en inglés por persona y tipo, con su traducción</caption>
            <thead>
              <tr>
                <th scope="col">Persona</th>
                {TIPOS.map((t) => (
                  <th key={t} scope="col" className={tipoSel === t ? styles.colActiva : ''}>{NOMBRE_TIPO[t]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRONOMBRES.map((f) => (
                <tr key={f.persona} className={personaSel === f.persona ? styles.filaActiva : ''}>
                  <th scope="row" className={styles.celdaPersona}>
                    <span className={styles.personaForma} lang="en">{f.persona}</span>
                    <span className={styles.personaDesc}>{f.descripcion}</span>
                  </th>
                  {TIPOS.map((t) => {
                    const c = f.celdas[t];
                    const activa = personaSel === f.persona || tipoSel === t;
                    const cruce = personaSel === f.persona && tipoSel === t;
                    return (
                      <td key={t} className={`${activa ? styles.celdaActiva : ''} ${cruce ? styles.celdaCruce : ''}`}>
                        <span className={styles.celdaForma} lang="en">{c.forma}</span>
                        <span className={styles.celdaTraduccion}>{c.traduccion}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.ficha} aria-live="polite">
          <h3 className={styles.fichaTitulo}>{tituloFicha}</h3>
          {celdasFicha.length === 0 ? (
            <p key="vacia" className={styles.fichaVacia}>
              Elige arriba una persona (por ejemplo, she) o un tipo (por ejemplo, Reflexivo) y aquí verás sus ejemplos con la traducción.
            </p>
          ) : (
            <ul key="lista" className={styles.fichaLista}>
              {celdasFicha.map(({ fila, tipo, celda }) => (
                <li key={`${fila.persona}-${tipo}`} className={styles.fichaItem}>
                  <p className={styles.fichaCabecera}>
                    <span className={styles.fichaForma} lang="en">{celda.forma}</span>
                    <span className={styles.fichaTipo}>
                      {tipoSel && !personaSel ? `${fila.persona} · ${fila.descripcion}` : NOMBRE_TIPO[tipo]}
                    </span>
                  </p>
                  <p className={styles.fichaEjemplo} lang="en">{celda.ejemplo}</p>
                  <p className={styles.fichaTraduccion}>{celda.ejemploEs}</p>
                  {celda.nota && <p className={styles.fichaNota}>{celda.nota}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── EJERCICIOS: CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <section className={styles.configPanel} aria-labelledby="titulo-ejercicios">
          <h2 id="titulo-ejercicios" className={styles.panelTitulo} ref={tituloConfigRef} tabIndex={-1}>
            Ejercicios numerados
          </h2>
          <p className={styles.panelIntro}>
            {`${TOTAL_EJERCICIOS} frases con un hueco, numeradas del 1 al ${TOTAL_EJERCICIOS}. Tras cada respuesta verás la forma correcta y la regla que la explica.`}
          </p>

          <h3 className={styles.configSubtitulo} id="etiqueta-categorias">Qué practicar</h3>
          <div className={styles.categoriasGrid} role="group" aria-labelledby="etiqueta-categorias">
            {CATEGORIAS.map((c) => (
              <button
                type="button"
                key={c}
                className={`${styles.categoriaBtn} ${categorias.includes(c) ? styles.categoriaActiva : ''}`}
                onClick={() => alternarCategoria(c)}
                aria-pressed={categorias.includes(c)}
              >
                <span className={styles.categoriaNombre}>{NOMBRE_CATEGORIA[c]}</span>
                <span className={styles.categoriaDesc}>{`${ejerciciosDe([c]).length} ejercicios`}</span>
                <span className={styles.categoriaEjemplo} lang="en">{EJEMPLO_CATEGORIA[c]}</span>
              </button>
            ))}
          </div>
          <p className={styles.configNota}>Puedes marcar varias; al menos una queda siempre marcada.</p>

          <h3 className={styles.configSubtitulo} id="etiqueta-modo">Cómo responder</h3>
          <div className={styles.modoFila} role="group" aria-labelledby="etiqueta-modo">
            {(Object.entries(MODOS) as [Modo, typeof MODOS[Modo]][]).map(([clave, cfg]) => (
              <button
                type="button"
                key={clave}
                className={`${styles.modoBtn} ${modo === clave ? styles.modoActivo : ''}`}
                onClick={() => setModo(clave)}
                aria-pressed={modo === clave}
              >
                <span className={styles.modoNombre}>{cfg.label}</span>
                <span className={styles.modoDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitulo} id="etiqueta-cuantas">Número de preguntas</h3>
          <div className={styles.cuantasFila} role="group" aria-labelledby="etiqueta-cuantas">
            {OPCIONES_PREGUNTAS.map((n) => (
              <button
                type="button"
                key={n}
                className={`${styles.cuantasBtn} ${numPreguntas === n ? styles.cuantasActivo : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {`${n} preguntas`}
              </button>
            ))}
          </div>

          {disponibles < numPreguntas && (
            <p className={styles.aviso} role="status">
              {`Con lo que has marcado hay ${disponibles} ejercicios, así que la partida será de ${disponibles} preguntas.`}
            </p>
          )}

          <button type="button" className={styles.btnPrincipal} onClick={() => jugarAlAzar(categorias, numPreguntas)}>
            {`Empezar — ${preguntasAlAzar} preguntas al azar`}
          </button>

          <form
            className={styles.numerosForm}
            onSubmit={(e) => { e.preventDefault(); enviarNumeros(); }}
            noValidate
          >
            <h3 className={styles.configSubtitulo}>Ejercicios por número</h3>
            <p className={styles.numerosAyuda} id="ayuda-numeros">
              {`¿Te han asignado unos ejercicios concretos? Escribe sus números (del 1 al ${TOTAL_EJERCICIOS}) separados por comas, como «3, 7, 11», o un rango, como «5-9». Se juegan en ese orden.`}
            </p>
            <label htmlFor="ejercicios-numero" className={styles.numerosLabel}>Números de los ejercicios</label>
            <div className={styles.numerosFila}>
              <input
                id="ejercicios-numero"
                type="text"
                className={styles.numerosInput}
                value={textoNumeros}
                onChange={(e) => { setTextoNumeros(e.target.value); if (errorNumeros) setErrorNumeros(''); }}
                placeholder="3, 7, 11"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={errorNumeros ? true : undefined}
                aria-describedby="ayuda-numeros error-numeros"
              />
              <button type="submit" className={styles.btnSecundario}>Jugar estos ejercicios</button>
            </div>
            <p id="error-numeros" className={styles.numerosError} role="alert">{errorNumeros}</p>
          </form>
        </section>
      )}

      {/* ── EJERCICIOS: PARTIDA ── */}
      {pantalla === 'quiz' && ej && (
        <section className={styles.quizPanel} ref={quizPanelRef} aria-label="Ejercicio en curso">
          <div className={styles.hud}>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{`${actual + 1}/${total}`}</span>
              <span className={styles.hudLabel}>Pregunta</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{aciertos}</span>
              <span className={styles.hudLabel}>Aciertos</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{formatPercentage(respondidas > 0 ? aciertos / respondidas : 0, 0)}</span>
              <span className={styles.hudLabel}>Precisión</span>
            </div>
          </div>

          <div className={styles.progreso}>
            <div
              className={styles.progresoRelleno}
              style={{ width: `${(actual / total) * 100}%` }}
              role="progressbar"
              aria-label="Preguntas respondidas"
              aria-valuetext={`${actual} de ${total}`}
              aria-valuenow={actual}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          </div>

          <div className={styles.preguntaCard} ref={preguntaRef} tabIndex={-1}>
            <p className={styles.preguntaContador}>{`Pregunta ${actual + 1} de ${total}`}</p>
            <p className={styles.ejercicioNumero}>{`Ejercicio ${ej.numero} · ${NOMBRE_CATEGORIA[ej.categoria]}`}</p>
            <p className={styles.enunciado} lang="en">
              <span>{antes}</span>
              <span className={styles.hueco} aria-hidden="true">_____</span>
              <span className="sr-only" lang="es">(hueco)</span>
              <span>{despues}</span>
            </p>
            {ej.pista && <p className={styles.pista}>{`Pista: ${ej.pista}`}</p>}
          </div>

          {modoPartida === 'elegir' && (
            <div className={styles.opcionesGrid}>
              {(opciones[actual] ?? []).map((opcion, i) => {
                const esBuena = seleccionada !== null && corregir(ej, opcion);
                const esFallada = seleccionada !== null && opcion === seleccionada && !esBuena;
                const marca = esBuena ? ' (respuesta correcta)' : esFallada ? ' (tu respuesta, incorrecta)' : '';
                const clase = seleccionada === null
                  ? ''
                  : esBuena ? styles.opcionCorrecta : esFallada ? styles.opcionIncorrecta : styles.opcionNeutra;
                // Elegir respuesta es una ACCIÓN, no un conmutador: sin aria-pressed (testigo de la familia de quizzes)
                return ( // a11y-ok: opción de respuesta, tests/familias/quizzes.spec.ts exige que no lo lleve
                  <button
                    type="button"
                    key={`${ej.numero}-${opcion}`}
                    className={`${styles.opcion} ${clase}`}
                    onClick={() => responder(opcion)}
                    disabled={seleccionada !== null}
                    aria-label={`Opción ${LETRAS[i]}: ${opcion}${marca}`}
                  >
                    <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                    <span className={styles.opcionTexto} lang="en">{opcion}</span>
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
              <label htmlFor="respuesta-pronombre" className={styles.escrituraLabel}>Tu respuesta</label>
              <div className={styles.escrituraFila}>
                <input
                  id="respuesta-pronombre"
                  ref={inputRef}
                  type="text"
                  lang="en"
                  className={`${styles.escrituraInput} ${correccion === true ? styles.escrituraBien : ''} ${correccion === false ? styles.escrituraMal : ''}`}
                  value={escrito}
                  onChange={(e) => setEscrito(e.target.value)}
                  readOnly={correccion !== null}
                  aria-invalid={correccion === false ? true : undefined}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                />
                {correccion === null && (
                  <button type="submit" className={styles.btnPrincipalCorto}>Comprobar</button>
                )}
              </div>
            </form>
          )}

          {respondida && (
            <>
              <div
                className={`${styles.feedback} ${aciertoActual ? styles.feedbackBien : styles.feedbackMal}`}
                role="alert"
                aria-live="polite"
              >
                <p className={styles.feedbackTitulo}>
                  {aciertoActual
                    ? <span key="bien"><span aria-hidden="true">✅</span> ¡Correcto!</span>
                    : <span key="mal"><span aria-hidden="true">❌</span> No es esa</span>}
                </p>
                {!aciertoActual && (
                  <p className={styles.feedbackDetalle}>
                    {respuestaDada ? `Has respondido «${respuestaDada}».` : 'Has dejado la respuesta vacía.'}
                  </p>
                )}
                <p className={styles.feedbackForma}>{`Respuesta correcta: ${ej.admitidas[0]}`}</p>
                {ej.admitidas.length > 1 && (
                  <p className={styles.feedbackDetalle}>{`También vale: ${ej.admitidas.slice(1).join(' · ')}`}</p>
                )}
                <p className={styles.feedbackFrase} lang="en">{fraseResuelta(ej)}</p>
                <p className={styles.feedbackRegla}>{explicacion(ej)}</p>
              </div>
              <button type="button" ref={siguienteRef} className={styles.btnPrincipal} onClick={siguiente}>
                {esUltimo ? 'Ver resultados' : 'Siguiente →'}
              </button>
            </>
          )}
        </section>
      )}

      {/* ── EJERCICIOS: RESULTADO ── */}
      {pantalla === 'resultado' && (
        <section className={styles.resultadoPanel} ref={resultadoRef} tabIndex={-1} aria-labelledby="titulo-resultado">
          <span className={styles.resultadoEmoji} aria-hidden="true">{resultado.emoji}</span>
          <h2 id="titulo-resultado" className={styles.resultadoTitulo}>{resultado.titulo}</h2>
          <p className={styles.resultadoCifra}>{`${aciertos} de ${total} aciertos`}</p>
          <p className={styles.resultadoPorcentaje}>{`${formatPercentage(total > 0 ? aciertos / total : 0, 0)} de acierto`}</p>

          {fallados.length > 0 ? (
            <div key="fallos" className={styles.falladosCaja}>
              <h3 className={styles.falladosTitulo}>{`Ejercicios fallados: ${fallados.join(', ')}`}</h3>
              <ul className={styles.falladosLista}>
                {fallados.map((n) => {
                  const e = buscarEjercicio(n);
                  return e ? (
                    <li key={n}>
                      <span className={styles.falladoNumero}>{`Ejercicio ${n}`}</span>
                      <span className={styles.falladoFrase} lang="en">{fraseResuelta(e)}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          ) : (
            <p key="sin-fallos" className={styles.sinFallos}>No has fallado ningún ejercicio.</p>
          )}

          <div className={styles.botonesResultado}>
            {fallados.length > 0 && (
              <button type="button" className={styles.btnSecundario} onClick={repetirFallados}>
                Repetir los fallados
              </button>
            )}
            <button type="button" className={styles.btnPrincipalCorto} onClick={jugarDeNuevo}>
              <span aria-hidden="true">🔄</span> Jugar de nuevo
            </button>
            <button type="button" className={styles.btnTerciario} onClick={volverConfig}>
              <span aria-hidden="true">⚙️</span> Cambiar ejercicios
            </button>
          </div>
        </section>
      )}

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía de los pronombres en inglés"
        subtitle="Los cinco tipos, cómo elegir la forma y las trampas de quien habla español"
        icon="📖"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Los cinco tipos, de un vistazo</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Tipo</th>
                  <th scope="col">Dónde va</th>
                  <th scope="col">Ejemplo</th>
                  <th scope="col">Pregunta que lo decide</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Personal de sujeto</strong></td>
                  <td>Antes del verbo, haciendo la acción</td>
                  <td><em lang="en">She lives in Montevideo.</em></td>
                  <td>¿Quién hace la acción?</td>
                </tr>
                <tr>
                  <td><strong>Personal de objeto</strong></td>
                  <td>Después del verbo o de una preposición</td>
                  <td><em lang="en">I saw him. · Wait for me.</em></td>
                  <td>¿A quién afecta la acción?</td>
                </tr>
                <tr>
                  <td><strong>Adjetivo posesivo</strong></td>
                  <td>Delante de un sustantivo</td>
                  <td><em lang="en">Her brother is a doctor.</em></td>
                  <td>¿De quién es? Y detrás hay un sustantivo</td>
                </tr>
                <tr>
                  <td><strong>Pronombre posesivo</strong></td>
                  <td>Solo, en lugar del sustantivo</td>
                  <td><em lang="en">The blue bike is mine.</em></td>
                  <td>¿De quién es? Y no hay sustantivo detrás</td>
                </tr>
                <tr>
                  <td><strong>Reflexivo</strong></td>
                  <td>Como objeto, cuando es el mismo sujeto</td>
                  <td><em lang="en">She looked at herself.</em></td>
                  <td>¿El que hace y el que recibe son la misma persona?</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>¿Para quién es útil?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <strong>Estudiante de secundaria o preparatoria</strong>
              </div>
              <p className={styles.escenarioExample}>Tienes examen de inglés y los pronombres entran en la parte de gramática.</p>
              <p className={styles.escenarioTip}>Empieza con la tabla resaltando una columna cada vez, y luego practica categoría por categoría antes de mezclarlas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🏫</span>
                <strong>Profesor de inglés</strong>
              </div>
              <p className={styles.escenarioExample}>Quieres mandar una tarea concreta y que todos hagan los mismos ejercicios.</p>
              <p className={styles.escenarioTip}>Asigna los números («haz el 3, el 7 y del 39 al 44»): el alumno los escribe en «Ejercicios por número» y el resultado le dice por número qué falló.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Adulto que prepara un examen oficial</strong>
              </div>
              <p className={styles.escenarioExample}>Preparas un certificado de inglés (Cambridge, TOEFL o el de tu país) y los errores de its, their o his/her te restan puntos.</p>
              <p className={styles.escenarioTip}>Juega la categoría «Trampas típicas» en modo escribir: es donde se nota si la regla está automatizada.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Profesional que escribe en inglés</strong>
              </div>
              <p className={styles.escenarioExample}>Redactas correos y documentos y quieres evitar el «his» por «her» que delata al hablante de español.</p>
              <p className={styles.escenarioTip}>Repasa los adjetivos posesivos y el they singular (someone left their umbrella), muy usado en textos formales.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ: del mismo array que el FAQPage JSON-LD (metadata.ts) */}
        <section className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Preguntas frecuentes</h3>
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
          <h3 className={styles.eduTitulo}>Cómo elegir el pronombre correcto, paso a paso</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Mira qué hace el hueco en la frase</strong>
                <p>¿Hace la acción (sujeto), la recibe o va tras una preposición (objeto), va delante de un sustantivo (adjetivo posesivo), lo sustituye (pronombre posesivo) o es el mismo que el sujeto (reflexivo)?</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Decide la persona</strong>
                <p>¿Quién es? Para la tercera persona: un hombre es <em lang="en">he</em>, una mujer <em lang="en">she</em>, una cosa o un animal <em lang="en">it</em>, y varios <em lang="en">they</em>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>En los posesivos, mira al dueño</strong>
                <p>El posesivo concuerda con quien posee, no con lo poseído: el hermano de María es <em lang="en">her brother</em>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Cruza fila y columna en la tabla</strong>
                <p>Con la persona y el tipo, la forma sale sola. Resalta los dos en la tabla de arriba y verás su ejemplo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Repasa el apóstrofo antes de dar la respuesta</strong>
                <p>Los posesivos no llevan apóstrofo (<em lang="en">its, hers, ours, theirs</em>). Si lleva apóstrofo, es una contracción con un verbo: <em lang="en">it&apos;s, they&apos;re</em>.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Consejos */}
        <section className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Consejos para no fallar</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <strong>Prueba a sustituir por it is</strong>
              <p>Si «it is» encaja en la frase, se escribe <em lang="en">it&apos;s</em>; si no, es el posesivo <em lang="en">its</em>.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✂️</span>
              <strong>Quita al acompañante</strong>
              <p>En «Sara and ___ went», quita a Sara: <em lang="en">I went</em> suena bien y <em lang="en">me went</em> no. Lo mismo tras una preposición: <em lang="en">for you and me</em>.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👀</span>
              <strong>Mira lo que viene detrás</strong>
              <p>Si detrás hay un sustantivo, adjetivo posesivo (<em lang="en">my book</em>); si no hay nada, pronombre (<em lang="en">mine</em>).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧑‍🤝‍🧑</span>
              <strong>Cuenta las personas en el reflexivo</strong>
              <p>Con <em lang="en">you</em>, el reflexivo cambia: una persona, <em lang="en">yourself</em>; varias, <em lang="en">yourselves</em>.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌧️</span>
              <strong>Nunca un verbo sin sujeto</strong>
              <p>Donde el español no pone sujeto (llueve, es tarde), el inglés pone <em lang="en">it</em>: <em lang="en">it is raining, it is late</em>.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores típicos */}
        <section className={styles.eduBloque}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores típicos de quien habla español</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Its con apóstrofo:</strong> <em lang="en">the dog wagged it&apos;s tail</em> es un error; el posesivo es <em lang="en">its</em>.</li>
              <li><strong>His o her según lo poseído:</strong> <em lang="en">María and his brother</em> por <em lang="en">her brother</em>. Manda quien posee.</li>
              <li><strong>Omitir el sujeto:</strong> <em lang="en">is raining</em> o <em lang="en">is very good</em> en lugar de <em lang="en">it is raining, it is very good</em>.</li>
              <li><strong>Their, there y they&apos;re:</strong> suenan igual, pero son el posesivo, «allí» y «they are».</li>
              <li><strong>Formas que no existen:</strong> <em lang="en">hisself, theirselves, her&apos;s, your&apos;s</em>. Lo correcto: <em lang="en">himself, themselves, hers, yours</em>.</li>
              <li><strong>El artículo con partes del cuerpo:</strong> <em lang="en">I brush the teeth</em> por <em lang="en">I brush my teeth</em>.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="pronombres-ingles" />
      <Footer appName="pronombres-ingles" />
    </div>
  );
}
