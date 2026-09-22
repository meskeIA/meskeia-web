'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-teorema-central-limite`.
 *
 * Es el primer caso de aula del catálogo del TIPO C: el alumno no teclea un número, sino que
 * **se compromete con una predicción antes de tocar el deslizador**. Ese compromiso previo es
 * todo el valor pedagógico: mover un parámetro y mirar la gráfica no enseña nada si antes no
 * había una hipótesis que confirmar o romper.
 *
 * Aquí no se calcula NADA: las leyes del teorema central del límite viven en `./casos.ts`, que
 * es también de donde el panel del simulador toma μ y σ de cada población. Así la app no puede
 * suspender una respuesta que ella misma acaba de imprimir en pantalla.
 */

import { useState } from 'react';
import styles from './SimuladorTeoremaCentralLimite.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  type Ejercicio,
  type Opcion,
} from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [elegido, setElegido] = useState<number | null>(null);
  const [veredicto, setVeredicto] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [verMecanismo, setVerMecanismo] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperado = practica ? practica.respuesta : caso.respuesta;
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const opciones: readonly Opcion[] = practica ? practica.opciones : caso.opciones;
  const pasos = practica ? practica.pasos : caso.pasos;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene (1208). */
  const hayPista = !practica && Boolean(caso.pista);

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setElegido(null);
    setVeredicto(null);
    setVerMecanismo(false);
    setVerPista(false);
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

  function comprobar() {
    // `elegido` es null mientras no se haya marcado ninguna opción; comprobarRespuesta lo
    // rechaza con un mensaje propio en vez de dar por buena una predicción que nadie hizo.
    const r = comprobarRespuesta(elegido ?? -1, esperado, opciones);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
    // El mecanismo se revela solo al comprobar: enseñarlo antes destruiría el compromiso.
    if (r.correcto || elegido !== null) setVerMecanismo(true);
  }

  return (
    <div className={styles.casosSection}>
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo}>
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} predicciones con solución, siempre las mismas y en el mismo orden. Un
          profesor puede decir «haz los casos 3, 7 y 11» y corregir sin ambigüedad.
        </p>
        <p className={styles.casosIntro}>
          <strong>Primero predice, después mueve.</strong> Marca tu respuesta antes de tocar el
          simulador de arriba: si mueves el deslizador primero, verás qué pasa pero no habrás
          puesto a prueba lo que creías. Al comprobar se explica el mecanismo.
        </p>
      </div>

      <div className={styles.casosNav} role="group" aria-label="Elegir caso">
        {CASOS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.casoBoton} ${!practica && i === indice ? styles.casoBotonActivo : ''}`}
            aria-pressed={!practica && i === indice}
            aria-label={`Caso ${c.id}: ${c.titulo}`}
            onClick={() => irA(i)}
          >
            {c.id}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.casoBoton} ${styles.casoBotonPractica} ${practica ? styles.casoBotonActivo : ''}`}
          aria-pressed={practica !== null}
          onClick={nuevaPractica}
        >
          <span aria-hidden="true">🎲</span> Practicar
        </button>
      </div>

      <div className={styles.casoCuerpo}>
        <h3 className={styles.casoTitulo}>
          {practica ? 'Predicción de práctica' : `Caso ${caso.id} · ${caso.titulo}`}
        </h3>
        {/*
          ⚠️ 22/09/2026 (hallazgo 1212) — volver a pulsar «Practicar» genera otro ejercicio y
          nada lo anunciaba: el botón lleva `aria-pressed`, que ya valía true y sigue valiendo
          true, y la sección no tenía ninguna región viva salvo el veredicto, que solo existe
          después de comprobar. Quien usa lector de pantalla no se enteraba de que el enunciado
          había cambiado. Vale igual al cambiar de caso numerado, que tenía el mismo silencio.
        */}
        <p className={styles.casoEnunciado} role="status" aria-live="polite">
          {enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <p className={styles.casoLabel} id="casos-etiqueta">
            {etiqueta}
          </p>
          {/* role="radiogroup" + aria-checked: es una elección entre opciones excluyentes, y
              está exento de aria-pressed (CLAUDE.md §5). */}
          <div className={styles.casoOpciones} role="radiogroup" aria-labelledby="casos-etiqueta">
            {opciones.map((o, i) => (
              <button
                key={o.clave}
                type="button"
                role="radio"
                aria-checked={elegido === i}
                className={`${styles.casoOpcion} ${elegido === i ? styles.casoOpcionActiva : ''}`}
                onClick={() => {
                  setElegido(i);
                  setVeredicto(null);
                }}
              >
                {o.texto}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.casoComprobar}
            onClick={comprobar}
            disabled={elegido === null}
          >
            Comprobar predicción
          </button>
        </div>

        {veredicto && (
          <div
            role="alert"
            aria-live="polite"
            className={`${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`}
          >
            <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span> {veredicto.motivo}
          </div>
        )}

        <div className={styles.casoAyudas}>
          {/*
            ⚠️ 22/09/2026 (hallazgos 1208 y 1210) — el botón se pintaba siempre, también en el
            modo «Practicar», donde el ejercicio aleatorio NO trae pista: al pulsarlo el rótulo
            pasaba a «Ocultar pista» y `aria-expanded` a true sin que apareciera nada en el DOM,
            así que un lector de pantalla anunciaba una región expandida vacía y quien ve la
            pantalla pulsaba dos veces sin entender qué había hecho. Un control de despliegue no
            puede ofrecerse cuando no hay nada que desplegar.
          */}
          {hayPista && (
            <button
              type="button"
              className={styles.casoAyudaBoton}
              aria-expanded={verPista}
              onClick={() => setVerPista(!verPista)}
            >
              <span aria-hidden="true">💡</span> {verPista ? 'Ocultar pista' : 'Ver pista'}
            </button>
          )}
          <button
            type="button"
            className={styles.casoAyudaBoton}
            aria-expanded={verMecanismo}
            onClick={() => setVerMecanismo(!verMecanismo)}
          >
            <span aria-hidden="true">🔑</span>{' '}
            {verMecanismo ? 'Ocultar explicación' : 'Ver por qué'}
          </button>
        </div>

        {verPista && hayPista && <p className={styles.casoPista}>{caso.pista}</p>}

        {verMecanismo && (
          <div className={styles.casoSolucion}>
            {/* En el tipo C no hay «desarrollo paso a paso» sino la explicación del mecanismo:
                saber que has fallado sin saber qué ocurre de verdad no enseña nada. */}
            <ol className={styles.casoPasos}>
              {pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <p className={styles.casoResultado}>
              Respuesta:{' '}
              <strong>{esperado >= 0 ? opciones[esperado].texto : 'sin resolver'}</strong>
            </p>
            <p className={styles.casoComprobacion}>
              <span aria-hidden="true">🔬</span> Ahora compruébalo en el simulador de arriba:
              mueve el deslizador y mira si ocurre lo que acabas de leer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
