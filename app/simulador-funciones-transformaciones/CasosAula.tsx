'use client';

/**
 * Predicciones para clase — la tarea asignable de `simulador-funciones-transformaciones`
 * (tipo C: predicción antes de mover).
 *
 * El flujo es el que da sentido a la tarea: el alumno ELIGE una predicción, «Comprobar» la
 * BLOQUEA y da el veredicto con la explicación del mecanismo, y solo entonces aparece el botón
 * para cargar la partida en el simulador y mover él mismo el deslizador. Si pudiera cargarla
 * antes, movería el deslizador y contestaría sin haber predicho nada.
 *
 * Aquí no se calcula NADA: la respuesta, el enunciado y la explicación salen de `./casos.ts`,
 * que mide cada rasgo con la misma `evaluarTransformada` con la que el lienzo pinta la curva.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SimuladorFuncionesTransformaciones.module.css';
import { FUNCIONES_BASE, type FuncionBase } from './motor';
import {
  CASOS,
  TOTAL_CASOS,
  cifra,
  comprobarPrediccion,
  etiquetaRespuesta,
  generarEjercicioAleatorio,
  opcionesDe,
  type Comprobacion,
  type DatosCaso,
  type Ejercicio,
  type Rasgo,
  type Respuesta,
} from './casos';

export interface EscenarioSimulador {
  funcion: FuncionBase;
  a: number;
  b: number;
  c: number;
  d: number;
}

interface Props {
  /** Pone en el simulador la función base y los cuatro parámetros de la PARTIDA del caso. */
  onCargar: (escenario: EscenarioSimulador) => void;
}

/** Qué tiene que mirar el alumno mientras mueve el deslizador. */
function queObservar(rasgo: Rasgo, x0?: number): string {
  switch (rasgo) {
    case 'x-vertice':
      return 'hacia dónde va el vértice';
    case 'y-vertice':
      return 'la altura del vértice';
    case 'x-inicio':
      return 'dónde empieza la gráfica';
    case 'maximo':
      return 'la altura del punto más alto';
    case 'crestas':
      return 'cuántas crestas caben entre x = −10 y x = 10';
    case 'valor-en':
      return `la altura de la curva azul justo encima de x = ${cifra(x0 ?? 0)}`;
  }
}

function nombreFuncion(funcion: FuncionBase): string {
  return FUNCIONES_BASE.find(f => f.id === funcion)?.etiqueta ?? funcion;
}

export default function CasosAula({ onCargar }: Props) {
  const [indice, setIndice] = useState(0);
  const [practica, setPractica] = useState<Ejercicio | null>(null);
  const [eleccion, setEleccion] = useState<Respuesta | null>(null);
  const [veredicto, setVeredicto] = useState<Comprobacion | null>(null);
  const [verPista, setVerPista] = useState(false);
  const [avisoCarga, setAvisoCarga] = useState('');
  /** Resultado de cada caso numerado ya comprobado (id → acertado), para la botonera. */
  const [resultados, setResultados] = useState<Record<number, boolean>>({});

  const caso = CASOS[indice] ?? CASOS[0];
  const datos: DatosCaso = practica ? practica.datos : caso.datos;
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperada: Respuesta = practica ? practica.respuesta : caso.respuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  const opciones = opcionesDe(datos.rasgo);
  const clave = practica ? `practica-${practica.semilla}` : `caso-${caso.id}`;
  /** Una predicción comprobada queda fijada: es el compromiso previo que da sentido a la tarea. */
  const bloqueada = veredicto !== null && veredicto.motivo !== 'vacia';
  const hayPista = !practica && caso.pista.length > 0;

  const aciertos = useMemo(() => Object.values(resultados).filter(Boolean).length, [resultados]);
  const comprobados = Object.keys(resultados).length;

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setEleccion(null);
    setVeredicto(null);
    setVerPista(false);
    setAvisoCarga('');
  }

  function irA(i: number) {
    setIndice(i);
    setPractica(null);
    limpiar();
  }

  function nuevaPractica() {
    setPractica(generarEjercicioAleatorio());
    limpiar();
  }

  /**
   * Foco tras «Comprobar»: el botón se desactiva al bloquear la predicción y el foco se
   * perdería; se lleva a «Cargar el escenario», que es la acción siguiente. El veredicto lo
   * anuncia su `role="alert"`.
   */
  const refCargar = useRef<HTMLButtonElement>(null);
  const enfocarCargar = useRef(false);
  useEffect(() => {
    if (bloqueada && enfocarCargar.current) {
      enfocarCargar.current = false;
      refCargar.current?.focus();
    }
  }, [bloqueada]);

  function comprobar() {
    if (bloqueada) return;
    const resultado = comprobarPrediccion(eleccion, esperada);
    enfocarCargar.current = resultado.motivo !== 'vacia';
    setVeredicto(resultado);
    if (!practica && resultado.motivo !== 'vacia') {
      setResultados(previos => ({ ...previos, [caso.id]: resultado.correcto }));
    }
  }

  function cargar() {
    const { funcion, antes } = datos;
    onCargar({ funcion, a: antes.a, b: antes.b, c: antes.c, d: antes.d });
    setAvisoCarga(
      `Cargado en el simulador: ${nombreFuncion(funcion)} con a = ${cifra(antes.a)}, b = ${cifra(antes.b)}, ` +
        `c = ${cifra(antes.c)}, d = ${cifra(antes.d)}. Ahora mueve el deslizador ${datos.parametro} hasta ` +
        `${cifra(datos.nuevoValor)} y observa ${queObservar(datos.rasgo, datos.x0)}.`
    );
  }

  function empezarDeNuevo() {
    setResultados({});
    setIndice(0);
    setPractica(null);
    limpiar();
  }

  const textoElegido = opciones.find(o => o.valor === eleccion)?.etiqueta ?? '';
  const textoCorrecto = etiquetaRespuesta(datos.rasgo, esperada);
  const idPista = `casos-aula-pista-${clave}`;

  return (
    <section className={styles.aulaSeccion} aria-labelledby="casos-aula-titulo">
      <div className={styles.aulaCabecera}>
        <h2 id="casos-aula-titulo" className={styles.aulaTitulo}>
          <span aria-hidden="true">📝</span> Predicciones para clase
        </h2>
        <p className={styles.aulaIntro}>
          {TOTAL_CASOS} casos, siempre los mismos y en el mismo orden: un profesor puede decir
          «haz los casos 3, 7 y 11». En cada uno, <strong>predice antes de tocar los
          deslizadores</strong>. Al comprobar, tu predicción queda fijada y se abre el botón para
          cargar la partida arriba y mover tú mismo el deslizador.
        </p>
      </div>

      <div className={styles.aulaNav} role="group" aria-label="Elegir caso">
        {CASOS.map((c, i) => {
          const resultado = resultados[c.id];
          const estado = resultado === undefined ? '' : resultado ? ' (acertado)' : ' (fallado)';
          const claseEstado =
            resultado === undefined ? '' : resultado ? styles.aulaNavBotonOk : styles.aulaNavBotonKo;
          const activo = !practica && i === indice;
          return (
            <button
              key={c.id}
              type="button"
              className={`${styles.aulaNavBoton} ${claseEstado} ${activo ? styles.aulaNavBotonActivo : ''}`}
              aria-pressed={activo}
              aria-label={`Caso ${c.id}: ${c.titulo}${estado}`}
              onClick={() => irA(i)}
            >
              {c.id}
            </button>
          );
        })}
        <button
          type="button"
          className={`${styles.aulaNavBoton} ${styles.aulaNavPractica} ${practica ? styles.aulaNavBotonActivo : ''}`}
          aria-pressed={practica !== null}
          onClick={nuevaPractica}
        >
          <span aria-hidden="true">🎲</span> Practicar
        </button>
      </div>

      <p className={styles.aulaMarcador}>
        Casos comprobados: <strong>{comprobados}</strong> de {TOTAL_CASOS} · aciertos:{' '}
        <strong>{aciertos}</strong>
      </p>

      <article className={styles.aulaCaso}>
        <h3 className={styles.aulaCasoTitulo}>
          {practica ? 'Ejercicio de práctica' : `Caso ${caso.id} · ${caso.titulo}`}
        </h3>

        <p className={styles.aulaFicha}>
          <span className={styles.aulaFichaDato}>Función base: {nombreFuncion(datos.funcion)}</span>
          <span className={styles.aulaFichaDato}>Deslizador: {datos.parametro}</span>
          <span className={styles.aulaFichaDato}>
            De {cifra(datos.antes[datos.parametro])} a {cifra(datos.nuevoValor)}
          </span>
        </p>

        {/* `aria-live` y NO `role="status"`: un enunciado no es un mensaje de estado. */}
        <p className={styles.aulaEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        <fieldset className={styles.aulaOpciones} disabled={bloqueada}>
          <legend className={styles.aulaLeyenda}>Tu predicción</legend>
          {opciones.map(opcion => (
            <label
              key={opcion.valor}
              className={`${styles.aulaOpcion} ${eleccion === opcion.valor ? styles.aulaOpcionElegida : ''}`}
            >
              <input
                type="radio"
                name={`prediccion-${clave}`}
                value={opcion.valor}
                checked={eleccion === opcion.valor}
                onChange={() => {
                  if (!bloqueada) setEleccion(opcion.valor);
                }}
              />
              <span>{opcion.etiqueta}</span>
            </label>
          ))}
        </fieldset>

        <div className={styles.aulaAcciones}>
          <button
            type="button"
            className={styles.aulaBtnPrimario}
            onClick={comprobar}
            disabled={eleccion === null || bloqueada}
          >
            Comprobar
          </button>
          {hayPista && !bloqueada && (
            <button
              type="button"
              className={styles.aulaBtnSecundario}
              aria-expanded={verPista}
              aria-controls={idPista}
              onClick={() => setVerPista(!verPista)}
            >
              <span aria-hidden="true">💡</span> {verPista ? 'Ocultar pista' : 'Ver pista'}
            </button>
          )}
        </div>

        {hayPista && !bloqueada && (
          <p id={idPista} className={styles.aulaPista} hidden={!verPista}>
            {caso.pista}
          </p>
        )}

        {veredicto !== null && (
          <p
            className={`${styles.aulaVeredicto} ${veredicto.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
            role="alert"
            aria-live="polite"
          >
            <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span>{' '}
            {veredicto.correcto
              ? `¡Correcto! La respuesta es «${textoCorrecto}».`
              : veredicto.motivo === 'vacia'
                ? 'Elige una de las tres opciones antes de comprobar.'
                : veredicto.motivo === 'no-disponible'
                  ? 'Este caso no está disponible.'
                  : `No. Predijiste «${textoElegido}» y la respuesta es «${textoCorrecto}». Lee por qué y compruébalo en el simulador.`}
          </p>
        )}

        {bloqueada && (
          <>
            <div className={styles.aulaExplicacion}>
              <h4 className={styles.aulaExplicacionTitulo}>Por qué pasa</h4>
              <ol className={styles.aulaPasos}>
                {pasos.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>
            </div>

            <div className={styles.aulaAcciones}>
              <button ref={refCargar} type="button" className={styles.aulaBtnPrimario} onClick={cargar}>
                <span aria-hidden="true">⬆️</span> Cargar el escenario en el simulador
              </button>
            </div>

            {avisoCarga !== '' && (
              <p className={styles.aulaAvisoCarga} aria-live="polite">
                {avisoCarga}
              </p>
            )}
          </>
        )}
      </article>

      <div className={styles.aulaPie}>
        <button type="button" className={styles.aulaBtnSecundario} onClick={empezarDeNuevo}>
          Empezar de nuevo
        </button>
      </div>
    </section>
  );
}
