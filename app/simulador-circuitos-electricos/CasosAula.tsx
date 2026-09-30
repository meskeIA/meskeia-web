'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-circuitos-electricos`.
 *
 * Toda la física vive en `./casos.ts`, que calcula SOLO con `./motor.ts`, el mismo módulo con
 * el que las cuatro pestañas pintan sus resultados: aquí no se calcula NADA, solo se pinta y se
 * corrige llamando a `comprobarRespuesta`.
 *
 * Sin botón «Cargar en el simulador», a propósito: cada pestaña guarda su estado dentro y no se
 * toca su lógica. En su lugar, cada caso trae `comoComprobar`, que dice qué teclear y en qué
 * pestaña. Va en un desplegable porque la cifra que imprime el panel ES la respuesta, y a la
 * vista estropearía la tarea.
 *
 * ⚠️ Convivencia con el acta del Inspector (`tests/apps/simulador-circuitos-electricos.spec.ts`),
 * que localiza los controles de la app por posición y por nombre PARCIAL:
 *   · ningún `role="status"`: el acta hace `div[role="status"]` en modo estricto;
 *   · ninguna `<table>`: el acta cuenta las `th` de toda la página;
 *   · el único `role="alert"` (el veredicto) solo existe después de pulsar «Comprobar»;
 *   · ningún botón ni etiqueta con «Calcular», «Aumentar», «Reducir» ni las etiquetas de los
 *     campos de las pestañas; la casilla va con id propio (`casos-respuesta`) y un placeholder
 *     que no es «0», «Ω» ni «voltios»;
 *   · la sección va DESPUÉS de las pestañas, así que su casilla no mueve ningún `nth()`.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorCircuitosElectricos.module.css';
import { CASOS, TOTAL_CASOS, comprobarRespuesta, generarEjercicioAleatorio, type Ejercicio } from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [veredicto, setVeredicto] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [verComprobar, setVerComprobar] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperado = practica ? practica.respuesta : caso.respuesta;
  /** La tolerancia sale de la pregunta (sus datos y el redondeo pedido), no de la cifra: 2518. */
  const datos = practica ? practica.datos : caso.datos;
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  const textoEsperado = practica ? practica.respuestaTexto : caso.respuestaTexto;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene (1208). */
  const hayPista = !practica && Boolean(caso.pista);
  /** Y solo los que se pueden ver en el panel tal como está: sin texto no hay botón. */
  const hayComprobar = !practica && Boolean(caso.comoComprobar);

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setRespuesta('');
    setVeredicto(null);
    setVerSolucion(false);
    setVerPista(false);
    setVerComprobar(false);
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
    // parseSpanishNumber admite «5,62» y «5.62»; devuelve NaN con cualquier otra cosa, y de
    // ese NaN se encarga comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = parseSpanishNumber(respuesta);
    const r = comprobarRespuesta(valor, esperado, datos);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Se corrigen como
          calcula el simulador: en serie las resistencias se suman, en paralelo se suman sus
          inversos, P = V·I, y la energía en kWh es la potencia en kilovatios por las horas de uso.
          Escribe la respuesta en la unidad que pide la casilla (A o mA, V, Ω…). Los datos son
          exactos, así que no hay margen: vale la cifra exacta o, si el enunciado pide redondear,
          la redondeada como pide. Redondea solo al final, nunca un resultado intermedio.
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
          {practica ? 'Ejercicio de práctica' : `Caso ${caso.id} · ${caso.titulo}`}
        </h3>
        {/* aria-live + aria-atomic y NO role="status" (hallazgo 1212 de
            simulador-movimiento-circular): al cambiar de caso o pulsar otra vez «Practicar» el
            enunciado cambia y hay que anunciarlo, pero un enunciado no es un mensaje de estado, y
            aquí además el acta localiza el panel de resultados con `div[role="status"]`. */}
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="decimal": ninguna respuesta de estos casos es negativa. */}
            <input
              id="casos-respuesta"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className={styles.casoInput}
              value={respuesta}
              placeholder="Tu respuesta"
              onChange={(e) => {
                setRespuesta(e.target.value);
                setVeredicto(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') comprobar();
              }}
            />
            <button type="button" className={styles.casoComprobar} onClick={comprobar}>
              Comprobar
            </button>
          </div>
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
          {/* Sin pista no hay botón de pista: un aria-expanded que no despliega nada anuncia una
              región vacía (hallazgos 1208 y 1210 de simulador-conservacion-energia). Lo mismo
              vale para «Verlo en el simulador». */}
          {hayPista && (
            <button
              type="button"
              className={styles.casoAyudaBoton}
              aria-expanded={verPista}
              aria-controls="casos-pista"
              onClick={() => setVerPista(!verPista)}
            >
              <span aria-hidden="true">💡</span> {verPista ? 'Ocultar pista' : 'Ver pista'}
            </button>
          )}
          {hayComprobar && (
            <button
              type="button"
              className={styles.casoAyudaBoton}
              aria-expanded={verComprobar}
              aria-controls="casos-como-comprobar"
              onClick={() => setVerComprobar(!verComprobar)}
            >
              <span aria-hidden="true">🔬</span>{' '}
              {verComprobar ? 'Ocultar cómo verlo en el simulador' : 'Verlo en el simulador'}
            </button>
          )}
          <button
            type="button"
            className={styles.casoAyudaBoton}
            aria-expanded={verSolucion}
            aria-controls="casos-solucion"
            onClick={() => setVerSolucion(!verSolucion)}
          >
            <span aria-hidden="true">🔑</span> {verSolucion ? 'Ocultar solución' : 'Ver solución'}
          </button>
        </div>

        {verPista && hayPista && (
          <p className={styles.casoPista} id="casos-pista">
            {caso.pista}
          </p>
        )}

        {verComprobar && hayComprobar && (
          <p className={styles.casoComoComprobar} id="casos-como-comprobar">
            {caso.comoComprobar}
          </p>
        )}

        {verSolucion && (
          <div className={styles.casoSolucion} id="casos-solucion">
            <ol className={styles.casoPasos}>
              {pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            {/* La cifra con su unidad y con los decimales que pide el caso: la misma cadena que
                cierra el paso a paso (invariante 5.bis). */}
            <p className={styles.casoResultado}>
              Respuesta: <strong>{textoEsperado}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
