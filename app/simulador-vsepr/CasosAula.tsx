'use client';

/**
 * Predicciones para clase — la tarea asignable de `simulador-vsepr` (tipo C).
 *
 * El flujo es el que da sentido a la tarea: el alumno ELIGE una predicción, «Comprobar» la
 * BLOQUEA y da el veredicto, y solo entonces aparecen la explicación del mecanismo y el botón
 * para cargar el punto de partida en el simulador, donde hace él mismo el cambio. Si pudiera
 * cargarlo antes, movería el deslizador y contestaría sin haber predicho nada.
 *
 * Aquí no se calcula NADA: la respuesta, el enunciado y la explicación salen de `./casos.ts`,
 * que aplica el cambio con el mismo tope X + E ≤ 6 de los deslizadores y lee la geometría de la
 * misma `TABLA_VSEPR` con la que el simulador pinta su resultado (`./motor.ts`).
 *
 * ⚠️ Esta sección NO pinta los textos «Resultado:», «Combinación poco común» ni «Cargar
 * configuración de…», ni un `svg[role="img"]`: el acta del Inspector
 * (`tests/apps/simulador-vsepr.spec.ts`) localiza con ellos el bloque de resultado, el aviso
 * pedagógico, los presets y la molécula, y un duplicado aquí los volvería ambiguos.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SimuladorVsepr.module.css';
import { MOLECULAS_PRESET, geometriaDe } from './motor';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarPrediccion,
  generarEjercicioAleatorio,
  type CasoAula,
  type Cambio,
  type Comprobacion,
  type DatosCaso,
  type Ejercicio,
  type Respuesta,
} from './casos';

interface Props {
  /** Pone en el simulador el átomo central y los dos deslizadores del punto de partida. */
  onCargarEnSimulador: (atomo: string, enlaces: number, libres: number) => void;
}

function claveDe(caso: CasoAula, practica: Ejercicio | null): string {
  return practica ? `practica-${practica.semilla}` : `caso-${caso.id}`;
}

/** El cambio en pocas palabras, para la ficha del caso. */
function cambioCorto(cambio: Cambio): string {
  if (cambio.tipo === 'molecula') {
    const preset = MOLECULAS_PRESET.find(m => m.formula === cambio.formula);
    return `Cambio: cargar ${preset?.nombre ?? cambio.formula}`;
  }
  const signo = cambio.delta > 0 ? '+1' : '−1';
  return `Cambio: ${signo} ${cambio.tipo === 'enlaces' ? 'par enlazante' : 'par libre'}`;
}

export default function CasosAula({ onCargarEnSimulador }: Props) {
  const [indice, setIndice] = useState(0);
  const [practica, setPractica] = useState<Ejercicio | null>(null);
  const [elecciones, setElecciones] = useState<Record<string, Respuesta>>({});
  const [veredictos, setVeredictos] = useState<Record<string, Comprobacion>>({});
  const [verExplicacion, setVerExplicacion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [avisoCarga, setAvisoCarga] = useState('');

  const caso = CASOS[indice] ?? CASOS[0];
  const clave = claveDe(caso, practica);
  const pregunta = practica ?? caso;
  const datos: DatosCaso = practica ? practica.datos : caso.datos;
  const inicio = datos.inicio;
  const geometriaInicio = geometriaDe(inicio.enlaces, inicio.libres);

  const eleccion = elecciones[clave] ?? null;
  const veredicto = veredictos[clave];
  /** Una predicción comprobada queda fijada: es el compromiso previo que da sentido a la tarea. */
  const bloqueada = veredicto !== undefined && veredicto.motivo !== 'vacia';
  const hayPista = !practica && caso.pista.length > 0;

  const aciertos = useMemo(
    () => CASOS.filter(c => veredictos[`caso-${c.id}`]?.correcto === true).length,
    [veredictos]
  );
  const comprobados = useMemo(
    () =>
      CASOS.filter(c => {
        const v = veredictos[`caso-${c.id}`];
        return v !== undefined && v.motivo !== 'vacia';
      }).length,
    [veredictos]
  );

  /** Al cambiar de pregunta se pliegan las ayudas; las predicciones de cada caso se conservan. */
  function limpiarVista() {
    setVerExplicacion(false);
    setVerPista(false);
    setAvisoCarga('');
  }

  function irA(i: number) {
    setIndice(i);
    setPractica(null);
    limpiarVista();
  }

  function nuevaPractica() {
    setPractica(generarEjercicioAleatorio());
    limpiarVista();
  }

  function elegir(valor: Respuesta) {
    if (bloqueada) return;
    setElecciones(previas => ({ ...previas, [clave]: valor }));
    // Si antes pulsó «Comprobar» sin elegir, el aviso de «elige una opción» ya no aplica.
    setVeredictos(previos => {
      if (previos[clave]?.motivo !== 'vacia') return previos;
      const resto = { ...previos };
      delete resto[clave];
      return resto;
    });
  }

  /**
   * Foco tras «Comprobar». Al bloquear la predicción, el botón «Comprobar» se desmonta y el foco
   * caería al <body>: se lleva a «Cargar el punto de partida», la acción siguiente. El veredicto
   * lo anuncia su `role="alert"`. Solo tras comprobar: al volver a un caso ya comprobado desde la
   * botonera, el foco se queda en la botonera.
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
    const resultado = comprobarPrediccion(eleccion, pregunta.respuesta);
    enfocarCargar.current = resultado.motivo !== 'vacia';
    setVeredictos(previos => ({ ...previos, [clave]: resultado }));
  }

  function cargar() {
    onCargarEnSimulador(inicio.atomo, inicio.enlaces, inicio.libres);
    setAvisoCarga(
      `Cargado en el simulador: ${inicio.molecula} (X = ${inicio.enlaces}, E = ${inicio.libres}). Ahora ${pregunta.instruccion} y mira la fila ${pregunta.filaQueMirar}.`
    );
  }

  function empezarDeNuevo() {
    setElecciones({});
    setVeredictos({});
    setPractica(null);
    setIndice(0);
    limpiarVista();
  }

  const textoElegido = pregunta.opciones.find(o => o.valor === eleccion)?.texto ?? '';
  const idExplicacion = `aula-explicacion-${clave}`;
  const idPista = `aula-pista-${clave}`;

  return (
    <section className={styles.aulaSeccion} aria-labelledby="aula-titulo">
      <div className={styles.aulaCabecera}>
        <h2 id="aula-titulo" className={styles.aulaTitulo}>
          <span aria-hidden="true">📝</span> Predicciones para clase
        </h2>
        <p className={styles.aulaIntro}>
          {TOTAL_CASOS} casos, siempre los mismos y en el mismo orden: un profesor puede decir
          «haz los casos 3, 7 y 11». En cada uno, <strong>predice antes de tocar el
          simulador</strong>. Al comprobar, tu predicción queda fijada y se abre el botón para
          cargar el punto de partida arriba y hacer tú mismo el cambio.
        </p>
      </div>

      <div className={styles.aulaNav} role="group" aria-label="Elegir caso">
        {CASOS.map((c, i) => {
          const v = veredictos[`caso-${c.id}`];
          const estado =
            v === undefined || v.motivo === 'vacia' ? '' : v.correcto ? ' (acertado)' : ' (fallado)';
          const claseEstado =
            v === undefined || v.motivo === 'vacia'
              ? ''
              : v.correcto
                ? styles.aulaNavBotonOk
                : styles.aulaNavBotonKo;
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
          <span className={styles.aulaFichaDato}>Parte de: {inicio.molecula}</span>
          <span className={styles.aulaFichaDato}>
            X = {inicio.enlaces} · E = {inicio.libres}
          </span>
          <span className={styles.aulaFichaDato}>{cambioCorto(datos.cambio)}</span>
        </p>

        {/* `aria-live` y NO `role="status"`: un enunciado no es un mensaje de estado. */}
        <p className={styles.aulaEnunciado} aria-live="polite" aria-atomic="true">
          {pregunta.enunciado}
        </p>

        {geometriaInicio && (
          <p className={styles.aulaPartida}>
            Punto de partida: {geometriaInicio.notacion} · geometría electrónica{' '}
            {geometriaInicio.geomElectronica.toLowerCase()} · geometría molecular{' '}
            {geometriaInicio.geomMolecular.toLowerCase()}
          </p>
        )}

        <fieldset className={styles.aulaOpciones} disabled={bloqueada}>
          <legend className={styles.aulaLeyenda}>{pregunta.etiquetaRespuesta}</legend>
          {pregunta.opciones.map(opcion => (
            <label
              key={opcion.valor}
              className={`${styles.aulaOpcion} ${eleccion === opcion.valor ? styles.aulaOpcionElegida : ''}`}
            >
              <input
                type="radio"
                name={`prediccion-${clave}`}
                value={opcion.valor}
                checked={eleccion === opcion.valor}
                onChange={() => elegir(opcion.valor)}
              />
              <span>{opcion.texto}</span>
            </label>
          ))}
        </fieldset>

        <div className={styles.aulaAcciones}>
          {!bloqueada && (
            <button type="button" className={styles.aulaBtnPrimario} onClick={comprobar}>
              Comprobar
            </button>
          )}
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
          {bloqueada && (
            <>
              <button ref={refCargar} type="button" className={styles.aulaBtnPrimario} onClick={cargar}>
                <span aria-hidden="true">⬆️</span> Cargar el punto de partida
              </button>
              <button
                type="button"
                className={styles.aulaBtnSecundario}
                aria-expanded={verExplicacion}
                aria-controls={idExplicacion}
                onClick={() => setVerExplicacion(!verExplicacion)}
              >
                <span aria-hidden="true">🔎</span>{' '}
                {verExplicacion ? 'Ocultar la explicación' : 'Ver por qué pasa'}
              </button>
            </>
          )}
        </div>

        {hayPista && !bloqueada && (
          <p id={idPista} className={styles.aulaPista} hidden={!verPista}>
            {caso.pista}
          </p>
        )}

        {veredicto !== undefined && (
          <p
            className={`${styles.aulaVeredicto} ${veredicto.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
            role="alert"
            aria-live="polite"
          >
            <span aria-hidden="true">
              {veredicto.correcto ? '✅' : veredicto.motivo === 'vacia' ? '✏️' : '❌'}
            </span>{' '}
            {veredicto.correcto
              ? `¡Correcto! La respuesta es «${pregunta.respuestaTexto}».`
              : veredicto.motivo === 'vacia'
                ? 'Elige una de las opciones antes de comprobar.'
                : veredicto.motivo === 'no-disponible'
                  ? 'Este caso no está disponible.'
                  : `No. Predijiste «${textoElegido}» y la respuesta es «${pregunta.respuestaTexto}». Carga el punto de partida, haz el cambio y mira por qué.`}
          </p>
        )}

        {avisoCarga !== '' && (
          <p className={styles.aulaAvisoCarga} aria-live="polite">
            {avisoCarga}
          </p>
        )}

        {bloqueada && (
          <div id={idExplicacion} className={styles.aulaExplicacion} hidden={!verExplicacion}>
            <ol className={styles.aulaPasos}>
              {pregunta.pasos.map((paso, i) => (
                <li key={i}>{paso}</li>
              ))}
            </ol>
          </div>
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
