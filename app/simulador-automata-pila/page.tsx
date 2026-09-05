'use client';
// @disclaimer: exempt

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  simular,
  revisarAutomata,
  EPSILON,
  FONDO,
  type AutomataPila,
  type Configuracion,
  type CriterioAceptacion,
  type EstadoPila,
  type ResultadoSimulacion,
  type TransicionPila,
} from './motor';
import styles from './SimuladorAutomataPila.module.css';

/** Campos de una transición que el usuario puede editar (el id lo gestiona la app). */
type CampoTransicion = 'desde' | 'entrada' | 'cima' | 'hasta' | 'apila';

interface Ejemplo {
  clave: string;
  titulo: string;
  descripcion: string;
  criterio: CriterioAceptacion;
  cadena: string;
  estados: EstadoPila[];
  transiciones: TransicionPila[];
}

/**
 * Los tres autómatas vienen trazados a mano en tests/automata-pila-motor.spec.ts:
 * se copian de ahí para que lo que se carga en pantalla sea exactamente lo probado.
 */
const EJEMPLOS: Ejemplo[] = [
  {
    clave: 'an-bn',
    titulo: 'aⁿbⁿ — por estado final',
    descripcion:
      'Tantas «a» como «b», y en ese orden. Apila una A por cada «a» y desapila una por cada «b».',
    criterio: 'estado-final',
    cadena: 'aabb',
    estados: [
      { id: 'q0', esInicial: true, esFinal: false },
      { id: 'q1', esInicial: false, esFinal: false },
      { id: 'q2', esInicial: false, esFinal: true },
    ],
    transiciones: [
      { id: 't1', desde: 'q0', entrada: 'a', cima: FONDO, hasta: 'q0', apila: `A${FONDO}` },
      { id: 't2', desde: 'q0', entrada: 'a', cima: 'A', hasta: 'q0', apila: 'AA' },
      { id: 't3', desde: 'q0', entrada: EPSILON, cima: 'A', hasta: 'q1', apila: 'A' },
      { id: 't4', desde: 'q1', entrada: 'b', cima: 'A', hasta: 'q1', apila: EPSILON },
      { id: 't5', desde: 'q1', entrada: EPSILON, cima: FONDO, hasta: 'q2', apila: FONDO },
    ],
  },
  {
    clave: 'an-bn-pila',
    titulo: 'aⁿbⁿ — por pila vacía',
    descripcion:
      'El mismo lenguaje sin ningún estado final: al terminar también se desapila el fondo y la pila queda vacía.',
    criterio: 'pila-vacia',
    cadena: 'aabb',
    estados: [
      { id: 'q0', esInicial: true, esFinal: false },
      { id: 'q1', esInicial: false, esFinal: false },
    ],
    transiciones: [
      { id: 't1', desde: 'q0', entrada: 'a', cima: FONDO, hasta: 'q0', apila: `A${FONDO}` },
      { id: 't2', desde: 'q0', entrada: 'a', cima: 'A', hasta: 'q0', apila: 'AA' },
      { id: 't3', desde: 'q0', entrada: EPSILON, cima: 'A', hasta: 'q1', apila: 'A' },
      { id: 't4', desde: 'q1', entrada: 'b', cima: 'A', hasta: 'q1', apila: EPSILON },
      { id: 't5', desde: 'q1', entrada: EPSILON, cima: FONDO, hasta: 'q1', apila: EPSILON },
    ],
  },
  {
    clave: 'palindromos',
    titulo: 'Palíndromos pares (ww^R)',
    descripcion:
      'Apila la primera mitad y la compara con la segunda. Dónde está la mitad hay que adivinarlo: exige no determinismo.',
    criterio: 'estado-final',
    cadena: 'abba',
    estados: [
      { id: 'p', esInicial: true, esFinal: false },
      { id: 'q', esInicial: false, esFinal: false },
      { id: 'f', esInicial: false, esFinal: true },
    ],
    transiciones: [
      { id: 'a1', desde: 'p', entrada: 'a', cima: EPSILON, hasta: 'p', apila: 'A' },
      { id: 'a2', desde: 'p', entrada: 'b', cima: EPSILON, hasta: 'p', apila: 'B' },
      { id: 'a3', desde: 'p', entrada: EPSILON, cima: EPSILON, hasta: 'q', apila: '' },
      { id: 'a4', desde: 'q', entrada: 'a', cima: 'A', hasta: 'q', apila: EPSILON },
      { id: 'a5', desde: 'q', entrada: 'b', cima: 'B', hasta: 'q', apila: EPSILON },
      { id: 'a6', desde: 'q', entrada: EPSILON, cima: FONDO, hasta: 'f', apila: FONDO },
    ],
  },
];

const EJEMPLO_INICIAL = EJEMPLOS[0];

interface Simulacion {
  res: ResultadoSimulacion;
  cadena: string;
  criterio: CriterioAceptacion;
}

/** La pila se guarda con la cima a la izquierda; en pantalla se dibuja de arriba abajo. */
function celdasDePila(pila: string): string[] {
  return pila === '' ? [] : pila.split('');
}

export default function SimuladorAutomataPila() {
  const [estados, setEstados] = useState<EstadoPila[]>(EJEMPLO_INICIAL.estados);
  const [transiciones, setTransiciones] = useState<TransicionPila[]>(EJEMPLO_INICIAL.transiciones);
  const [criterio, setCriterio] = useState<CriterioAceptacion>(EJEMPLO_INICIAL.criterio);
  const [cadena, setCadena] = useState<string>(EJEMPLO_INICIAL.cadena);
  const [ejemploActivo, setEjemploActivo] = useState<string | null>(EJEMPLO_INICIAL.clave);
  const [simulacion, setSimulacion] = useState<Simulacion | null>(null);
  const [paso, setPaso] = useState<number>(0);

  const contadorRef = useRef<number>(0);

  /** Cualquier edición manual deja de ser «el ejemplo cargado». */
  const marcarEditado = useCallback(() => setEjemploActivo(null), []);

  const automata: AutomataPila = useMemo(() => ({ estados, transiciones }), [estados, transiciones]);

  const idsEstados = useMemo(() => estados.map((e) => e.id), [estados]);

  const avisos = useMemo(() => {
    const lista = revisarAutomata(automata);
    const vistos = new Set<string>();
    const duplicados = new Set<string>();
    let hayVacios = false;
    for (const e of estados) {
      if (e.id.trim() === '') hayVacios = true;
      if (vistos.has(e.id)) duplicados.add(e.id);
      vistos.add(e.id);
    }
    if (hayVacios) lista.push('Hay algún estado sin nombre: ponle uno para poder referenciarlo.');
    for (const d of duplicados) {
      lista.push(`El nombre de estado «${d}» está repetido; los nombres deben ser únicos.`);
    }
    return lista;
  }, [automata, estados]);

  // ---------------------------------------------------------------- Estados

  const cargarEjemplo = useCallback((ej: Ejemplo) => {
    setEstados(ej.estados.map((e) => ({ ...e })));
    setTransiciones(ej.transiciones.map((t) => ({ ...t })));
    setCriterio(ej.criterio);
    setCadena(ej.cadena);
    setEjemploActivo(ej.clave);
    setSimulacion(null);
    setPaso(0);
  }, []);

  const anadirEstado = useCallback(() => {
    setEstados((prev) => {
      const usados = new Set(prev.map((e) => e.id));
      let n = 0;
      while (usados.has(`q${n}`)) n++;
      return [...prev, { id: `q${n}`, esInicial: prev.length === 0, esFinal: false }];
    });
    marcarEditado();
  }, [marcarEditado]);

  const renombrarEstado = useCallback(
    (anterior: string, nuevo: string) => {
      setEstados((prev) => prev.map((e) => (e.id === anterior ? { ...e, id: nuevo } : e)));
      setTransiciones((prev) =>
        prev.map((t) => ({
          ...t,
          desde: t.desde === anterior ? nuevo : t.desde,
          hasta: t.hasta === anterior ? nuevo : t.hasta,
        })),
      );
      marcarEditado();
    },
    [marcarEditado],
  );

  const marcarInicial = useCallback(
    (id: string) => {
      setEstados((prev) => prev.map((e) => ({ ...e, esInicial: e.id === id })));
      marcarEditado();
    },
    [marcarEditado],
  );

  const alternarFinal = useCallback(
    (id: string) => {
      setEstados((prev) => prev.map((e) => (e.id === id ? { ...e, esFinal: !e.esFinal } : e)));
      marcarEditado();
    },
    [marcarEditado],
  );

  const borrarEstado = useCallback(
    (id: string) => {
      setEstados((prev) => prev.filter((e) => e.id !== id));
      setTransiciones((prev) => prev.filter((t) => t.desde !== id && t.hasta !== id));
      marcarEditado();
    },
    [marcarEditado],
  );

  // ----------------------------------------------------------- Transiciones

  const anadirTransicion = useCallback(() => {
    contadorRef.current += 1;
    const primero = estados[0]?.id ?? '';
    setTransiciones((prev) => [
      ...prev,
      {
        id: `nueva-${contadorRef.current}`,
        desde: primero,
        entrada: EPSILON,
        cima: FONDO,
        hasta: primero,
        apila: FONDO,
      },
    ]);
    marcarEditado();
  }, [estados, marcarEditado]);

  const actualizarTransicion = useCallback(
    (id: string, campo: CampoTransicion, valor: string) => {
      setTransiciones((prev) => prev.map((t) => (t.id === id ? { ...t, [campo]: valor } : t)));
      marcarEditado();
    },
    [marcarEditado],
  );

  const borrarTransicion = useCallback(
    (id: string) => {
      setTransiciones((prev) => prev.filter((t) => t.id !== id));
      marcarEditado();
    },
    [marcarEditado],
  );

  // -------------------------------------------------------------- Simulación

  const ejecutar = useCallback(() => {
    const limpia = cadena.replace(/\s+/g, '');
    const res = simular(automata, limpia, criterio);
    setSimulacion({ res, cadena: limpia, criterio });
    setPaso(0);
  }, [automata, cadena, criterio]);

  const camino: Configuracion[] = simulacion?.res.camino ?? [];
  const totalPasos = camino.length;
  const pasoSeguro = totalPasos === 0 ? 0 : Math.min(paso, totalPasos - 1);
  const configActual: Configuracion | null = totalPasos === 0 ? null : camino[pasoSeguro];

  const consumido =
    simulacion && configActual ? simulacion.cadena.length - configActual.resto.length : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Autómata a Pila</h1>
        <p className={styles.subtitle}>
          AFP / PDA — el autómata finito con una pila detrás, capaz de reconocer aⁿbⁿ y palíndromos
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ------------------------------------------------ Ejemplos */}
        <section className={styles.panel} aria-labelledby="tit-ejemplos">
          <h2 className={styles.panelTitle} id="tit-ejemplos">
            Ejemplos clásicos
          </h2>
          <p className={styles.panelDesc}>
            Cárgalos para ver un autómata correcto y editarlo desde ahí.
          </p>
          <div className={styles.ejemplosGrid}>
            {EJEMPLOS.map((ej) => (
              <button
                key={ej.clave}
                type="button"
                className={`${styles.ejemploBtn} ${ejemploActivo === ej.clave ? styles.ejemploActivo : ''}`}
                onClick={() => cargarEjemplo(ej)}
                aria-pressed={ejemploActivo === ej.clave}
              >
                <span className={styles.ejemploTitulo}>{ej.titulo}</span>
                <span className={styles.ejemploDesc}>{ej.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ Estados */}
        <section className={styles.panel} aria-labelledby="tit-estados">
          <h2 className={styles.panelTitle} id="tit-estados">
            Estados
          </h2>
          <p className={styles.panelDesc}>
            Un solo estado inicial. Los estados finales solo cuentan si aceptas por estado final.
          </p>
          <ul className={styles.estadosLista}>
            {estados.map((e, i) => (
              <li key={`${e.id}-${i}`} className={styles.estadoFila}>
                <label className={styles.etiquetaOculta} htmlFor={`estado-${i}`}>
                  Nombre del estado {i + 1}
                </label>
                <input
                  id={`estado-${i}`}
                  type="text"
                  className={styles.estadoInput}
                  value={e.id}
                  maxLength={8}
                  onChange={(ev) => renombrarEstado(e.id, ev.target.value)}
                />
                <button
                  type="button"
                  className={`${styles.chipBtn} ${e.esInicial ? styles.chipActivo : ''}`}
                  onClick={() => marcarInicial(e.id)}
                  aria-pressed={e.esInicial}
                >
                  Inicial
                </button>
                <button
                  type="button"
                  className={`${styles.chipBtn} ${e.esFinal ? styles.chipActivo : ''}`}
                  onClick={() => alternarFinal(e.id)}
                  aria-pressed={e.esFinal}
                >
                  Final
                </button>
                <button
                  type="button"
                  className={styles.btnBorrar}
                  onClick={() => borrarEstado(e.id)}
                  disabled={estados.length <= 1}
                  aria-label={`Borrar el estado ${e.id} y sus transiciones`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.btnAdd} onClick={anadirEstado}>
            <span aria-hidden="true">➕</span> Añadir estado
          </button>
        </section>

        {/* ------------------------------------------------ Transiciones */}
        <section className={styles.panel} aria-labelledby="tit-transiciones">
          <h2 className={styles.panelTitle} id="tit-transiciones">
            Tabla de transiciones
          </h2>
          <p className={styles.panelDesc}>
            Cada fila se lee <strong>δ(desde, entrada, cima) = (hasta, apila)</strong>. La pila
            arranca con el símbolo de fondo <code className={styles.codigoInline}>{FONDO}</code>.
          </p>

          <div className={styles.tablaWrapper}>
            <table className={styles.tablaTrans}>
              <thead>
                <tr>
                  <th scope="col">Desde</th>
                  <th scope="col">Entrada</th>
                  <th scope="col">Cima</th>
                  <th scope="col">Hasta</th>
                  <th scope="col">Apila</th>
                  <th scope="col">
                    <span className={styles.etiquetaOculta}>Borrar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transiciones.map((t, i) => (
                  <tr key={t.id}>
                    <td>
                      <label className={styles.etiquetaOculta} htmlFor={`desde-${t.id}`}>
                        Estado de partida de la transición {i + 1}
                      </label>
                      <select
                        id={`desde-${t.id}`}
                        className={styles.selectEstado}
                        value={t.desde}
                        onChange={(ev) => actualizarTransicion(t.id, 'desde', ev.target.value)}
                      >
                        {!idsEstados.includes(t.desde) && <option value={t.desde}>{t.desde || '—'}</option>}
                        {estados.map((e, j) => (
                          <option key={`${e.id}-${j}`} value={e.id}>
                            {e.id}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className={styles.celdaCampo}>
                        <label className={styles.etiquetaOculta} htmlFor={`entrada-${t.id}`}>
                          Símbolo de entrada de la transición {i + 1}
                        </label>
                        <input
                          id={`entrada-${t.id}`}
                          type="text"
                          className={styles.campoInput}
                          value={t.entrada}
                          maxLength={1}
                          onChange={(ev) => actualizarTransicion(t.id, 'entrada', ev.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.btnEpsilon}
                          onClick={() => actualizarTransicion(t.id, 'entrada', EPSILON)}
                          aria-label={`Poner ε en la entrada de la transición ${i + 1}`}
                        >
                          ε
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.celdaCampo}>
                        <label className={styles.etiquetaOculta} htmlFor={`cima-${t.id}`}>
                          Símbolo de la cima de la transición {i + 1}
                        </label>
                        <input
                          id={`cima-${t.id}`}
                          type="text"
                          className={styles.campoInput}
                          value={t.cima}
                          maxLength={1}
                          onChange={(ev) => actualizarTransicion(t.id, 'cima', ev.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.btnEpsilon}
                          onClick={() => actualizarTransicion(t.id, 'cima', EPSILON)}
                          aria-label={`Poner ε en la cima de la transición ${i + 1}`}
                        >
                          ε
                        </button>
                      </div>
                    </td>
                    <td>
                      <label className={styles.etiquetaOculta} htmlFor={`hasta-${t.id}`}>
                        Estado de destino de la transición {i + 1}
                      </label>
                      <select
                        id={`hasta-${t.id}`}
                        className={styles.selectEstado}
                        value={t.hasta}
                        onChange={(ev) => actualizarTransicion(t.id, 'hasta', ev.target.value)}
                      >
                        {!idsEstados.includes(t.hasta) && <option value={t.hasta}>{t.hasta || '—'}</option>}
                        {estados.map((e, j) => (
                          <option key={`${e.id}-${j}`} value={e.id}>
                            {e.id}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className={styles.celdaCampo}>
                        <label className={styles.etiquetaOculta} htmlFor={`apila-${t.id}`}>
                          Lo que se apila en la transición {i + 1}
                        </label>
                        <input
                          id={`apila-${t.id}`}
                          type="text"
                          className={styles.campoInput}
                          value={t.apila}
                          maxLength={6}
                          onChange={(ev) => actualizarTransicion(t.id, 'apila', ev.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.btnEpsilon}
                          onClick={() => actualizarTransicion(t.id, 'apila', EPSILON)}
                          aria-label={`Poner ε en lo que apila la transición ${i + 1}`}
                        >
                          ε
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.btnBorrar}
                        onClick={() => borrarTransicion(t.id)}
                        aria-label={`Borrar la transición ${i + 1}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {transiciones.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.tablaVacia}>
                      Todavía no hay ninguna transición.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button type="button" className={styles.btnAdd} onClick={anadirTransicion}>
            <span aria-hidden="true">➕</span> Añadir transición
          </button>

          <ul className={styles.leyenda}>
            <li>
              <strong>Entrada ε</strong>: la transición se toma <em>sin consumir</em> ningún símbolo
              de la cadena.
            </li>
            <li>
              <strong>Cima ε</strong>: la transición no mira la pila y tampoco la altera.
            </li>
            <li>
              <strong>Apila ε</strong> (o el campo vacío): desapila la cima sin poner nada en su
              lugar.
            </li>
            <li>
              <strong>Apila con varios símbolos</strong>: el <em>primero</em> queda como nueva cima.
              Escribir <code className={styles.codigoInline}>A{FONDO}</code> deja la A encima de la{' '}
              {FONDO}.
            </li>
          </ul>
        </section>

        {/* ------------------------------------------------ Criterio */}
        <section className={styles.panel} aria-labelledby="tit-criterio">
          <h2 className={styles.panelTitle} id="tit-criterio">
            Criterio de aceptación
          </h2>
          <div className={styles.criterioGrid}>
            <button
              type="button"
              className={`${styles.criterioBtn} ${criterio === 'estado-final' ? styles.criterioActivo : ''}`}
              onClick={() => setCriterio('estado-final')}
              aria-pressed={criterio === 'estado-final'}
            >
              <span className={styles.criterioNombre}>Por estado final</span>
              <span className={styles.criterioDesc}>
                Se acepta si al acabar la entrada el estado está marcado como final, quede lo que
                quede en la pila.
              </span>
            </button>
            <button
              type="button"
              className={`${styles.criterioBtn} ${criterio === 'pila-vacia' ? styles.criterioActivo : ''}`}
              onClick={() => setCriterio('pila-vacia')}
              aria-pressed={criterio === 'pila-vacia'}
            >
              <span className={styles.criterioNombre}>Por pila vacía</span>
              <span className={styles.criterioDesc}>
                Se acepta si al acabar la entrada la pila queda vacía, incluido el fondo. Los estados
                finales no cuentan.
              </span>
            </button>
          </div>
        </section>

        {/* ------------------------------------------------ Cadena */}
        <section className={styles.panel} aria-labelledby="tit-cadena">
          <h2 className={styles.panelTitle} id="tit-cadena">
            Cadena a probar
          </h2>
          <div className={styles.cadenaFila}>
            <label className={styles.etiquetaOculta} htmlFor="cadena">
              Cadena que se va a simular
            </label>
            <input
              id="cadena"
              type="text"
              className={styles.cadenaInput}
              value={cadena}
              maxLength={40}
              placeholder="aabb"
              autoComplete="off"
              spellCheck={false}
              onChange={(ev) => setCadena(ev.target.value)}
            />
            <button type="button" className={styles.btnPrimary} onClick={ejecutar}>
              <span aria-hidden="true">▶️</span> Simular
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setCadena('');
                setSimulacion(null);
                setPaso(0);
              }}
            >
              Limpiar
            </button>
          </div>
          <p className={styles.panelDesc}>
            Deja el campo vacío para probar la cadena vacía (ε). Los espacios se ignoran.
          </p>

          {avisos.length > 0 && (
            <div className={styles.avisosBox} role="status">
              <strong>
                <span aria-hidden="true">⚠️</span> Revisa el autómata
              </strong>
              <ul className={styles.avisosLista}>
                {avisos.map((a, i) => (
                  <li key={`aviso-${i}`}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ------------------------------------------------ Resultados */}
        {simulacion && (
          <section className={styles.panel} aria-labelledby="tit-resultado">
            <h2 className={styles.panelTitle} id="tit-resultado">
              Resultado
            </h2>

            {!simulacion.res.ok ? (
              <div className={`${styles.resultadoCard} ${styles.resultadoError}`} role="alert">
                <p className={styles.resultadoTitulo}>
                  <span aria-hidden="true">🚫</span> No se ha podido simular
                </p>
                <p className={styles.resultadoMotivo}>
                  {simulacion.res.error ?? 'Revisa la definición del autómata antes de simular.'}
                </p>
              </div>
            ) : (
              <div
                className={`${styles.resultadoCard} ${
                  simulacion.res.aceptada ? styles.resultadoAceptada : styles.resultadoRechazada
                }`}
                role="status"
              >
                <p className={styles.resultadoTitulo}>
                  <span aria-hidden="true">{simulacion.res.aceptada ? '✅' : '❌'}</span>{' '}
                  {simulacion.res.aceptada ? 'Cadena aceptada' : 'Cadena rechazada'}
                  {': '}
                  <code className={styles.codigoInline}>
                    {simulacion.cadena === '' ? EPSILON : simulacion.cadena}
                  </code>
                </p>
                <p className={styles.resultadoMotivo}>{simulacion.res.motivo}</p>
                <div className={styles.resultadoMetricas}>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{simulacion.res.visitadas}</span>
                    <span className={styles.metricaEtiqueta}>configuraciones exploradas</span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{totalPasos}</span>
                    <span className={styles.metricaEtiqueta}>
                      pasos del camino {simulacion.res.aceptada ? 'aceptante' : 'más largo'}
                    </span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>
                      {simulacion.criterio === 'pila-vacia' ? 'Pila vacía' : 'Estado final'}
                    </span>
                    <span className={styles.metricaEtiqueta}>criterio aplicado</span>
                  </div>
                </div>
              </div>
            )}

            {simulacion.res.truncada && (
              <div className={styles.truncadaBox} role="alert">
                <strong>
                  <span aria-hidden="true">⚠️</span> Respuesta NO concluyente
                </strong>
                <p>
                  La exploración se ha detenido al llegar al tope de configuraciones, así que este
                  &laquo;rechazada&raquo; no demuestra nada: puede haber un ciclo de transiciones ε
                  que apila sin consumir entrada y nunca termina. Revisa si alguna transición con
                  entrada ε puede repetirse indefinidamente.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------ Traza */}
        {simulacion && simulacion.res.ok && configActual && (
          <section className={styles.panel} aria-labelledby="tit-traza">
            <h2 className={styles.panelTitle} id="tit-traza">
              Traza paso a paso
            </h2>
            <p className={styles.panelDesc}>
              {simulacion.res.aceptada
                ? 'Este es el camino aceptante más corto de todos los que existen.'
                : 'Ningún camino acepta la cadena; aquí se muestra el más largo que se llegó a explorar.'}
            </p>

            <div className={styles.trazaControles}>
              <button
                type="button"
                className={styles.trazaBtn}
                onClick={() => setPaso(0)}
                disabled={pasoSeguro === 0}
                aria-label="Ir al primer paso"
              >
                <span aria-hidden="true">⏮</span>
              </button>
              <button
                type="button"
                className={styles.trazaBtn}
                onClick={() => setPaso(Math.max(0, pasoSeguro - 1))}
                disabled={pasoSeguro === 0}
              >
                Anterior
              </button>
              <span className={styles.trazaContador}>
                Paso {pasoSeguro + 1} de {totalPasos}
              </span>
              <button
                type="button"
                className={styles.trazaBtn}
                onClick={() => setPaso(Math.min(totalPasos - 1, pasoSeguro + 1))}
                disabled={pasoSeguro >= totalPasos - 1}
              >
                Siguiente
              </button>
              <button
                type="button"
                className={styles.trazaBtn}
                onClick={() => setPaso(totalPasos - 1)}
                disabled={pasoSeguro >= totalPasos - 1}
                aria-label="Ir al último paso"
              >
                <span aria-hidden="true">⏭</span>
              </button>
            </div>

            <label className={styles.etiquetaOculta} htmlFor="rango-paso">
              Elegir el paso de la traza
            </label>
            <input
              id="rango-paso"
              type="range"
              className={styles.trazaRango}
              min={0}
              max={Math.max(0, totalPasos - 1)}
              step={1}
              value={pasoSeguro}
              onChange={(ev) => setPaso(Number(ev.target.value))}
            />

            <div className={styles.configGrid}>
              <div className={styles.configBloque}>
                <span className={styles.configEtiqueta}>Estado</span>
                <span className={styles.configEstado}>{configActual.estado}</span>
              </div>

              <div className={styles.configBloque}>
                <span className={styles.configEtiqueta}>Entrada</span>
                {simulacion.cadena === '' ? (
                  <span className={styles.cintaVacia}>ε (cadena vacía)</span>
                ) : (
                  <span className={styles.cintaEntrada}>
                    {simulacion.cadena.split('').map((s, i) => (
                      <span
                        key={`${s}-${i}`}
                        className={`${styles.cintaSimbolo} ${
                          i < consumido ? styles.cintaLeida : styles.cintaPendiente
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </span>
                )}
                <span className={styles.configNota}>
                  Queda por leer:{' '}
                  <code className={styles.codigoInline}>
                    {configActual.resto === '' ? EPSILON : configActual.resto}
                  </code>
                </span>
              </div>

              <div className={styles.configBloque}>
                <span className={styles.configEtiqueta}>Pila</span>
                {celdasDePila(configActual.pila).length === 0 ? (
                  <span className={styles.pilaVacia}>Pila vacía</span>
                ) : (
                  <div className={styles.pilaColumna}>
                    <span className={styles.pilaCimaEtiqueta}>
                      cima <span aria-hidden="true">↓</span>
                    </span>
                    {celdasDePila(configActual.pila).map((s, i) => (
                      <span
                        key={`${s}-${i}`}
                        className={`${styles.pilaCelda} ${i === 0 ? styles.pilaCima : ''}`}
                      >
                        {s}
                      </span>
                    ))}
                    <span className={styles.pilaFondoEtiqueta}>
                      fondo <span aria-hidden="true">↑</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className={styles.descripcionPaso}>{configActual.descripcion}</p>

            <ol className={styles.pasosLista}>
              {camino.map((c, i) => (
                <li key={`paso-${i}`}>
                  {/* a11y-ok: navegador de pasos, no un conmutador — el estado lo dice aria-current="step" */}
                  <button
                    type="button"
                    className={`${styles.pasoBtn} ${i === pasoSeguro ? styles.pasoActual : ''}`}
                    onClick={() => setPaso(i)}
                    aria-current={i === pasoSeguro ? 'step' : undefined}
                  >
                    <span className={styles.pasoIndice}>{i + 1}</span>
                    <span className={styles.pasoEstado}>{c.estado}</span>
                    <span className={styles.pasoResto}>{c.resto === '' ? EPSILON : c.resto}</span>
                    <span className={styles.pasoPila}>{c.pila === '' ? '∅' : c.pila}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>

      <EducationalSection
        title="Guía del autómata a pila"
        subtitle="Qué añade la pila, la jerarquía de Chomsky y los dos criterios de aceptación"
      >
        <h3>Qué añade la pila a un autómata finito</h3>
        <p>
          Un autómata finito solo recuerda una cosa: en qué estado está. Con k estados distingue como
          mucho k situaciones, y eso basta para muchísimas tareas —validar un formato, tokenizar
          código, buscar un patrón— pero no para nada que exija <em>contar sin límite</em>. Un
          autómata a pila (AFP, o PDA por <em>pushdown automaton</em>) le añade una memoria auxiliar
          con forma de pila: en cada transición mira el símbolo de entrada <strong>y</strong> el
          símbolo que hay en la cima, y decide a la vez a qué estado va y qué deja en la pila.
        </p>
        <p>
          La pila es memoria ilimitada, pero de <strong>acceso restringido</strong>: solo se ve la
          cima. Esa restricción es la que separa a un autómata a pila de una máquina de Turing, que
          puede leer y escribir en cualquier punto de su cinta.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Característica</th>
                <th scope="col">Autómata finito (AF)</th>
                <th scope="col">Autómata a pila (AFP)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Memoria</strong>
                </td>
                <td>Solo el estado actual (finita)</td>
                <td>El estado más una pila ilimitada</td>
              </tr>
              <tr>
                <td>
                  <strong>Qué mira para decidir</strong>
                </td>
                <td>Estado y símbolo de entrada</td>
                <td>Estado, símbolo de entrada y símbolo de la cima</td>
              </tr>
              <tr>
                <td>
                  <strong>Lenguajes que reconoce</strong>
                </td>
                <td>Regulares (tipo 3)</td>
                <td>Independientes del contexto (tipo 2)</td>
              </tr>
              <tr>
                <td>
                  <strong>Gramática equivalente</strong>
                </td>
                <td>Regular / expresión regular</td>
                <td>Gramática independiente del contexto (GIC)</td>
              </tr>
              <tr>
                <td>
                  <strong>¿Reconoce aⁿbⁿ?</strong>
                </td>
                <td>No (lema del bombeo)</td>
                <td>Sí, con una A apilada por cada «a»</td>
              </tr>
              <tr>
                <td>
                  <strong>¿Reconoce aⁿbⁿcⁿ?</strong>
                </td>
                <td>No</td>
                <td>Tampoco: una sola pila no lleva dos cuentas a la vez</td>
              </tr>
              <tr>
                <td>
                  <strong>¿El no determinismo añade potencia?</strong>
                </td>
                <td>No: todo AFND tiene un AFD equivalente</td>
                <td>Sí: hay lenguajes que ningún AFP determinista reconoce</td>
              </tr>
              <tr>
                <td>
                  <strong>Uso típico en un compilador</strong>
                </td>
                <td>Análisis léxico (tokens)</td>
                <td>Análisis sintáctico (árbol de derivación)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Por qué aⁿbⁿ no es regular — el lema del bombeo</h3>
        <p>
          El lema del bombeo dice que si un lenguaje es regular existe una longitud <em>p</em> tal que
          toda cadena del lenguaje de longitud al menos <em>p</em> puede partirse en tres trozos{' '}
          <code className={styles.codigoInline}>xyz</code>, con <code className={styles.codigoInline}>y</code>{' '}
          no vacía y <code className={styles.codigoInline}>xy</code> de longitud como mucho <em>p</em>,
          de forma que <code className={styles.codigoInline}>xy&#8305;z</code> sigue en el lenguaje para
          cualquier i ≥ 0.
        </p>
        <p>
          Aplicado a aⁿbⁿ: toma la cadena{' '}
          <code className={styles.codigoInline}>a&#7510;b&#7510;</code>. Como{' '}
          <code className={styles.codigoInline}>xy</code> mide como mucho <em>p</em>, el trozo{' '}
          <code className={styles.codigoInline}>y</code> cae entero dentro del bloque de aes.
          Repetirlo dos veces produce más aes que bes, una cadena que ya no pertenece al lenguaje. La
          suposición era falsa: aⁿbⁿ no es regular. La intuición detrás del formalismo es simple —
          para comprobar que las cuentas cuadran hay que <em>haberlas llevado</em>, y un autómata
          finito no tiene dónde.
        </p>
        <p>
          Con una pila el problema se desmonta en cinco transiciones: apila una A por cada «a»,
          desapila una A por cada «b», y comprueba al final que solo queda el fondo. Es exactamente el
          primer ejemplo de esta página.
        </p>

        <h3>La jerarquía de Chomsky</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Lenguajes</th>
                <th scope="col">Máquina que los reconoce</th>
                <th scope="col">Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tipo 3</td>
                <td>Regulares</td>
                <td>Autómata finito</td>
                <td>
                  <code className={styles.codigoInline}>a*b*</code>
                </td>
              </tr>
              <tr>
                <td>Tipo 2</td>
                <td>Independientes del contexto</td>
                <td>Autómata a pila</td>
                <td>
                  <code className={styles.codigoInline}>aⁿbⁿ</code>, palíndromos, paréntesis
                  equilibrados
                </td>
              </tr>
              <tr>
                <td>Tipo 1</td>
                <td>Dependientes del contexto</td>
                <td>Autómata linealmente acotado</td>
                <td>
                  <code className={styles.codigoInline}>aⁿbⁿcⁿ</code>
                </td>
              </tr>
              <tr>
                <td>Tipo 0</td>
                <td>Recursivamente enumerables</td>
                <td>Máquina de Turing</td>
                <td>El problema de la parada</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Cada nivel contiene estrictamente al anterior: todo lenguaje regular es independiente del
          contexto, pero no al revés. Los autómatas a pila ocupan el escalón intermedio, y de ahí que
          sean el paso natural después de los autómatas finitos en cualquier asignatura de teoría de
          la computación.
        </p>

        <h3>Los dos criterios de aceptación</h3>
        <p>
          <strong>Por estado final</strong>: se acepta si al terminar de leer la entrada el autómata
          está en un estado marcado como final, sin importar qué haya quedado en la pila.{' '}
          <strong>Por pila vacía</strong>: se acepta si al terminar de leer la entrada la pila ha
          quedado completamente vacía —fondo incluido—, y entonces los estados finales son
          irrelevantes; de hecho el autómata puede no tener ninguno.
        </p>
        <p>
          Los dos criterios tienen <strong>la misma potencia</strong>, y se demuestra construyendo uno
          a partir del otro. Para pasar de pila vacía a estado final se añade un símbolo de fondo
          nuevo por debajo del original y un estado final al que se llega justo cuando ese símbolo
          nuevo aparece en la cima. Para el camino contrario se añade un estado que, desde cualquier
          estado final, vacía la pila con transiciones ε. El fondo nuevo hace falta para que el
          autómata no se quede sin pila a mitad de camino por accidente y acepte de más.
        </p>
        <p>
          El segundo y el primer ejemplo de esta página son ese par: el mismo lenguaje aⁿbⁿ escrito de
          las dos maneras. Cárgalos y compara sus tablas — la única diferencia real está en la última
          transición.
        </p>

        <h3>Gramáticas independientes del contexto y compiladores</h3>
        <p>
          Un autómata a pila y una gramática independiente del contexto son dos formas de decir lo
          mismo: para toda GIC existe un AFP que reconoce su lenguaje, y viceversa. La gramática de
          aⁿbⁿ cabe en dos reglas:{' '}
          <code className={styles.codigoInline}>S → aSb | ab</code>, y la de los palíndromos pares
          sobre {'{a,b}'} en tres: <code className={styles.codigoInline}>S → aSa | bSb | ε</code>. La
          recursión de la gramática es lo que en el autómata hace la pila.
        </p>
        <p>
          De ahí sale el reparto de tareas de un compilador. El <strong>análisis léxico</strong>{' '}
          —partir el texto en identificadores, números y operadores— se hace con autómatas finitos,
          porque un token no anida. El <strong>análisis sintáctico</strong> sí necesita anidamiento:
          paréntesis dentro de paréntesis, bloques dentro de funciones, expresiones dentro de
          expresiones. Los analizadores LL(1) y LR(1) que generan herramientas como Yacc, Bison o
          ANTLR son autómatas a pila deterministas, y su pila es literalmente la que en tiempo de
          ejecución acaba llamándose <em>pila de llamadas</em>.
        </p>
        <p>
          Hay un límite que conviene tener presente: comprobar que una variable está declarada antes
          de usarse <em>no</em> es independiente del contexto. Por eso ningún compilador se queda en
          la gramática: después del árbol sintáctico viene el análisis semántico, con su tabla de
          símbolos.
        </p>

        <h3>Casos de uso reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🎓
              </span>
              <strong>Estudiante de teoría de la computación</strong>
            </div>
            <p className={styles.escenarioExample}>
              El ejercicio pide diseñar un AFP para un lenguaje y justificar por qué no es regular.
              Diseñar es fácil; comprobar que la tabla hace lo que crees, no tanto.
            </p>
            <div className={styles.escenarioTip}>
              Escribe tu tabla, prueba tres cadenas del lenguaje y tres de fuera. Si acepta alguna que
              no debería, la traza te enseña por qué camino se coló.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🧪
              </span>
              <strong>Preparando un examen de lenguajes formales</strong>
            </div>
            <p className={styles.escenarioExample}>
              Las preguntas clásicas son siempre las mismas: convertir entre los dos criterios de
              aceptación, o explicar por qué el no determinismo aquí sí añade potencia.
            </p>
            <div className={styles.escenarioTip}>
              Carga los dos ejemplos de aⁿbⁿ y compáralos fila a fila: es la conversión entre
              criterios en su versión más pequeña posible.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                💻
              </span>
              <strong>Quien escribe un parser a mano</strong>
            </div>
            <p className={styles.escenarioExample}>
              Estás implementando un analizador de expresiones o un validador de estructuras anidadas
              y quieres entender qué modelo hay debajo de tu bucle con una pila.
            </p>
            <div className={styles.escenarioTip}>
              Un validador de paréntesis equilibrados es un AFP de un solo estado: apila al abrir,
              desapila al cerrar, acepta con la pila vacía.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                👨‍🏫
              </span>
              <strong>Docencia en clase</strong>
            </div>
            <p className={styles.escenarioExample}>
              Explicar el no determinismo en la pizarra cuesta: hay que dibujar varias ramas a la vez
              y borrar las que mueren.
            </p>
            <div className={styles.escenarioTip}>
              Con el ejemplo de palíndromos, prueba «abba» y luego «abab»: el primero acepta y el
              segundo agota todas las ramas. Ahí se ve que rechazar es más caro que aceptar.
            </div>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué un AFP no determinista es más potente que uno determinista?</h4>
            <p>
              Porque hay lenguajes independientes del contexto que ningún AFP determinista reconoce, y
              el ejemplo canónico son los palíndromos pares ww^R: el autómata tiene que adivinar dónde
              acaba la primera mitad, y esa decisión no se puede tomar mirando solo el símbolo actual
              y la cima. Esto rompe la analogía con los autómatas finitos, donde AFD y AFND reconocen
              exactamente lo mismo.
            </p>
            <p className={styles.faqTip}>
              Los lenguajes que sí reconoce un AFP determinista se llaman <em>deterministas
              independientes del contexto</em>, y son precisamente los que los generadores de parsers
              saben tratar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es exactamente el símbolo de fondo Z?</h4>
            <p>
              Es una marca que se coloca en la pila antes de empezar, y que en los libros suele
              llamarse Z&#8320;. Sirve para dos cosas: saber que la pila está &laquo;vacía de
              contenido útil&raquo; sin quedarse de verdad sin nada que mirar, y tener una condición
              clara para la transición de cierre. Aquí la pila arranca siempre con{' '}
              <code className={styles.codigoInline}>{FONDO}</code>.
            </p>
            <p className={styles.faqTip}>
              En el ejemplo por pila vacía, la última transición desapila también el fondo: ahí es
              donde la pila queda literalmente en cero.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué significa que se apile «AZ» en una sola transición?</h4>
            <p>
              Que la cima se sustituye por esa cadena, con el <strong>primer carácter como nueva
              cima</strong>. Apilar <code className={styles.codigoInline}>A{FONDO}</code> sobre una
              cima <code className={styles.codigoInline}>{FONDO}</code> deja la pila con A arriba y{' '}
              {FONDO} debajo: es la forma habitual de decir &laquo;apila una A y conserva lo que
              había&raquo;. Apilar solo <code className={styles.codigoInline}>{FONDO}</code> deja la
              pila como estaba.
            </p>
            <p className={styles.faqTip}>
              Escribir ε en ese campo (o dejarlo vacío) significa desapilar la cima sin poner nada en
              su lugar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué rechazar tarda más que aceptar?</h4>
            <p>
              Porque en un autómata no determinista aceptar solo exige encontrar <em>un</em> camino
              que funcione, y en cuanto aparece se puede parar. Rechazar exige demostrar que{' '}
              <strong>ningún</strong> camino funciona, o sea agotar el árbol entero de
              configuraciones. El contador de &laquo;configuraciones exploradas&raquo; del resultado
              enseña esa diferencia con números.
            </p>
            <p className={styles.faqTip}>
              La exploración es en anchura, no en profundidad: con transiciones ε la profundidad se
              iría por una rama infinita, y además la anchura devuelve el camino aceptante más corto,
              que es el que interesa enseñar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué quiere decir que la respuesta «no es concluyente»?</h4>
            <p>
              Que la exploración llegó al tope de configuraciones antes de agotar el árbol. Eso pasa
              cuando el autómata tiene un ciclo de transiciones ε que apila sin consumir entrada: la
              pila crece indefinidamente y siempre hay configuraciones nuevas. En ese caso el
              simulador se detiene y lo dice, en lugar de colgar el navegador o —peor— responder
              &laquo;rechazada&raquo; como si lo hubiera comprobado.
            </p>
            <p className={styles.faqTip}>
              Si te sale ese aviso, busca transiciones con entrada ε que puedan repetirse sobre sí
              mismas y añade alguna condición sobre la cima que las corte.
            </p>
          </div>
        </div>

        <h3>Cómo diseñar un autómata a pila — paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Pregúntate qué hay que recordar</strong>
              <p>
                Si basta con una propiedad acumulada de lo leído (paridad, último símbolo, si ya vi un
                patrón), no necesitas pila: es un lenguaje regular y un autómata finito basta. La pila
                solo hace falta cuando hay que recordar una cantidad o una secuencia sin límite.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Decide qué representa cada símbolo de la pila</strong>
              <p>
                En aⁿbⁿ, cada A es &laquo;una b pendiente&raquo;. En los paréntesis equilibrados, cada
                símbolo es un cierre pendiente. Si no sabes decir en una frase qué significa un símbolo
                de tu pila, el diseño todavía no está claro.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Separa las fases con transiciones ε</strong>
              <p>
                La mayoría de estos autómatas tienen una fase de &laquo;llenado&raquo; y otra de
                &laquo;vaciado&raquo;. El paso de una a otra suele ser una transición ε que no consume
                entrada, y es justo donde se concentra el no determinismo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Elige el criterio de aceptación y sé coherente</strong>
              <p>
                Si aceptas por estado final, marca el estado final y no te preocupes por lo que quede
                en la pila. Si aceptas por pila vacía, asegúrate de desapilar también el fondo — es el
                fallo más común.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Prueba dentro y fuera del lenguaje</strong>
              <p>
                Tres cadenas que deben aceptarse (incluida la más corta) y tres que no: una demasiado
                larga por un lado, una con el orden cambiado y la cadena vacía. Un autómata que acepta
                de más falla en silencio, y solo se ve probando lo que <em>no</em> pertenece.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos rápidos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🧱
            </span>
            <strong>Conserva lo que había</strong>
            <p>
              Para apilar sin destruir la cima, escribe en &laquo;apila&raquo; el símbolo nuevo
              seguido del que estaba: <code className={styles.codigoInline}>A{FONDO}</code>,{' '}
              <code className={styles.codigoInline}>AA</code>. Olvidar el segundo símbolo borra la
              pila poco a poco sin que se note.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🔍
            </span>
            <strong>Cima ε no es lo mismo que cima Z</strong>
            <p>
              Con cima ε la transición no mira la pila y tampoco la altera. Con cima{' '}
              <code className={styles.codigoInline}>{FONDO}</code> exige que el fondo esté justo
              arriba, o sea que la pila esté vacía de contenido.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🪞
            </span>
            <strong>La pila invierte por naturaleza</strong>
            <p>
              Lo último que entra es lo primero que sale, así que una pila compara una secuencia con su
              reflejo sin esfuerzo. Por eso los palíndromos son el ejemplo favorito de todos los
              libros.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🧭
            </span>
            <strong>Empieza por un ejemplo que funcione</strong>
            <p>
              Carga aⁿbⁿ y cámbialo hasta tu lenguaje en vez de partir de una tabla en blanco. Ver qué
              rompe cada edición enseña más que acertar a la primera.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ⏱️
            </span>
            <strong>Cadenas cortas para trazar</strong>
            <p>
              Para seguir la traza paso a paso, usa la cadena más corta del lenguaje. Con «ab» el
              camino aceptante son cinco configuraciones; con «aaaabbbb» son diecisiete y se pierde el
              hilo.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🚦
            </span>
            <strong>Un solo estado inicial</strong>
            <p>
              Si marcas varios, el simulador usa el primero y avisa. Es un despiste habitual al editar
              la lista de estados después de haber cargado un ejemplo.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">
              ⚠️
            </span>
            <strong>Errores frecuentes a evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Aceptar por pila vacía y olvidar desapilar el símbolo de fondo: la cadena correcta se
              rechaza y la tabla parece bien escrita.
            </li>
            <li>
              Suponer que un AFP determinista basta. En autómatas finitos el no determinismo es una
              comodidad; aquí es potencia real, y los palíndromos lo demuestran.
            </li>
            <li>
              Creer que la pila permite contar dos cosas a la vez: aⁿbⁿcⁿ <em>no</em> es independiente
              del contexto, hace falta subir un escalón más en la jerarquía.
            </li>
            <li>
              Confundir «apila ε» con «cima ε». El primero desapila; el segundo ni mira ni toca la
              pila.
            </li>
            <li>
              Olvidar la cadena vacía. En el ejemplo de aⁿbⁿ de esta página <strong>no</strong> se
              acepta, porque para cambiar de fase hace falta una A en la cima; si quieres que
              pertenezca al lenguaje, hay que añadir una transición explícita.
            </li>
            <li>
              Dar por firme un &laquo;rechazada&raquo; que vino con el aviso de exploración truncada:
              ahí el simulador no ha terminado de mirar, y decirlo es parte de la respuesta.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-automata-pila')} />
      <ShareCard appName="simulador-automata-pila" />
      <Footer appName="simulador-automata-pila" />
    </div>
  );
}
