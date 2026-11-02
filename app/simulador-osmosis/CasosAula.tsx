'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-osmosis`.
 *
 * Toda la química vive en `./casos.ts`, que calcula con el mismo `./motor.ts` que pinta los dos
 * paneles: aquí no se calcula NADA, solo se pinta y se corrige llamando a `comprobarRespuesta`.
 *
 * Dos formas de responder: los casos de predicción (tipo C) se responden eligiendo una opción
 * ANTES de comprobarlo en el simulador; los numéricos (tipo A), tecleando la cifra.
 *
 * Lo que NO lleva, a propósito, por el acta de la app (tests/apps/simulador-osmosis.spec.ts):
 * ni role="status" (cada sección del simulador tiene el suyo y el acta lo localiza así), ni un
 * role="group" llamado «Lado A», «Lado B», «Medios de referencia» o «Tipo de célula», ni una
 * casilla llamada «Concentración» o «Temperatura de las disoluciones», ni un h2 que empiece por
 * «1.» o «2.».
 */

import { useState } from 'react';
import { leerRespuestaAula } from '@/lib/calculadoras/correctorCasosAula';
import styles from './SimuladorOsmosis.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  esPrediccion,
  generarEjercicioAleatorio,
  opcionesDe,
  textoRespuesta,
  type Ejercicio,
  type OpcionPrediccion,
  type Veredicto,
} from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [eleccion, setEleccion] = useState<OpcionPrediccion | null>(null);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperado = practica ? practica.respuesta : caso.respuesta;
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  const datos = practica ? practica.datos : caso.datos;
  const prediccion = esPrediccion(datos);
  const opciones = opcionesDe(datos);
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);
  const tarea = practica ? (prediccion ? 'Predicción' : 'Cálculo') : caso.tarea === 'C' ? 'Predicción' : 'Cálculo';

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setRespuesta('');
    setEleccion(null);
    setVeredicto(null);
    setVerSolucion(false);
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
    if (prediccion) {
      setVeredicto(comprobarRespuesta(eleccion, esperado, datos));
      return;
    }
    // El menos tipográfico (−) pasa a guion, que es el único que lee el parser. «0.154» es 0,154
    // o 154: leerRespuestaAula se queda con la más cercana a la respuesta (C0558). Un NaN lo
    // traduce comprobarRespuesta a un mensaje propio: nunca «NaN» en pantalla.
    const valor = leerRespuestaAula(respuesta.trim().replace(/[−–]/g, '-'), typeof esperado === 'number' ? esperado : NaN);
    setVeredicto(comprobarRespuesta(valor, esperado, datos));
  }

  return (
    <section className={styles.casosSection} id="casos-aula" aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Del 1 al 8 son de
          secundaria: hacia dónde pasa el agua, qué le pasa a una célula y cuántas partículas hay
          por litro; en los de predicción, decide tu respuesta ANTES de comprobarla arriba. Del 9
          al 12 se calcula la presión osmótica con π = i·M·R·T: con R = 0,082 atm·L/(mol·K) y T =
          t + 273, como en clase, la cifra cambia menos de un 0,2&nbsp;% y también vale.
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
          id="casos-practicar"
          className={`${styles.casoBoton} ${styles.casoBotonPractica} ${practica ? styles.casoBotonActivo : ''}`}
          aria-pressed={practica !== null}
          onClick={nuevaPractica}
        >
          <span aria-hidden="true">🎲</span> Practicar
        </button>
      </div>

      <div className={styles.casoCuerpo}>
        <h3 className={styles.casoTitulo} id="casos-titulo-caso">
          {practica ? 'Ejercicio de práctica' : `Caso ${caso.id} · ${caso.titulo}`}
        </h3>
        <p className={styles.casoTarea}>{tarea}</p>
        {/* aria-live + aria-atomic y NO role="status" (hallazgo 1212 de
            simulador-movimiento-circular): el enunciado cambia y hay que anunciarlo, pero no es
            un mensaje de estado y el role competiría con los del simulador. */}
        <p className={styles.casoEnunciado} id="casos-enunciado" aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        {prediccion ? (
          <div key="prediccion" className={styles.casoRespuesta}>
            <p className={styles.casoLabel} id="casos-etiqueta">
              {etiqueta}
            </p>
            <div className={styles.casoOpciones} role="group" aria-labelledby="casos-etiqueta">
              {opciones.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  className={styles.casoOpcion}
                  aria-pressed={eleccion === o.valor}
                  onClick={() => {
                    setEleccion(o.valor);
                    setVeredicto(null);
                  }}
                >
                  {o.texto}
                </button>
              ))}
            </div>
            <button type="button" id="casos-comprobar" className={styles.casoComprobar} onClick={comprobar}>
              Comprobar
            </button>
          </div>
        ) : (
          <div key="numero" className={styles.casoRespuesta}>
            <label className={styles.casoLabel} htmlFor="casos-respuesta">
              {etiqueta}
            </label>
            <div className={styles.casoFila}>
              {/* inputMode="decimal": ninguna respuesta es negativa (osmolaridad, molaridad, π,
                  Δπ y altura de la columna). */}
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
              <button type="button" id="casos-comprobar" className={styles.casoComprobar} onClick={comprobar}>
                Comprobar
              </button>
            </div>
          </div>
        )}

        {/* El veredicto, SIEMPRE montado y en el mismo nodo: con la página traducida, un texto que
            aparece y desaparece tumba la app (check:ternario-traducido). Vacío no ocupa sitio. */}
        <div
          role="alert"
          aria-live="polite"
          id="casos-veredicto"
          className={
            veredicto
              ? `${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`
              : styles.casoVeredictoVacio
          }
        >
          <span aria-hidden="true">{veredicto ? (veredicto.correcto ? '✅' : '❌') : ''}</span>
          <span>{veredicto ? veredicto.motivo : ''}</span>
        </div>

        <div className={styles.casoAyudas}>
          {/* Sin pista no hay botón de pista: un aria-expanded que no despliega nada anuncia una
              región vacía (hallazgos 1208 y 1210 de simulador-conservacion-energia). */}
          {hayPista && (
            <button
              type="button"
              className={styles.casoAyudaBoton}
              aria-expanded={verPista}
              aria-controls="casos-pista"
              onClick={() => setVerPista(!verPista)}
            >
              <span aria-hidden="true">💡</span> <span>{verPista ? 'Ocultar pista' : 'Ver pista'}</span>
            </button>
          )}
          <button
            type="button"
            className={styles.casoAyudaBoton}
            aria-expanded={verSolucion}
            aria-controls="casos-solucion"
            onClick={() => setVerSolucion(!verSolucion)}
          >
            <span aria-hidden="true">🔑</span>{' '}
            <span>{verSolucion ? 'Ocultar solución' : prediccion ? 'Ver por qué' : 'Ver solución'}</span>
          </button>
        </div>

        {verPista && hayPista && (
          <p className={styles.casoPista} id="casos-pista">
            {caso.pista}
          </p>
        )}

        {verSolucion && (
          <div className={styles.casoSolucion} id="casos-solucion">
            <ol className={styles.casoPasos}>
              {pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <p className={styles.casoResultado}>
              Respuesta: <strong>{textoRespuesta(esperado, datos)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
