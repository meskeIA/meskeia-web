'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-oferta-demanda`.
 *
 * Toda la economía vive en `./casos.ts`, que es también de donde la página importa las curvas y
 * el equilibrio del panel: aquí no se calcula NADA, solo se pinta y se corrige llamando a
 * `comprobarRespuesta`.
 *
 * Dos formas de responder: los casos 1-6 (tipo A) piden un número; los 7-12 (tipo C) piden
 * elegir, ANTES de mover el desplazador, si P* o Q* sube, baja o no cambia. La elección va en
 * radios nativos (ni aria-pressed ni role="radio" a mano), como en simulador-ecosistema-trofico.
 *
 * Sin role="status": el panel de resultados ya es el único role="status" de la página, y el
 * acta del Inspector lo localiza así. Tampoco ningún input de tipo range: el acta cuenta los
 * deslizadores por su posición.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorOfertaDemanda.module.css';
import {
  CASOS,
  OPCIONES_DIRECCION,
  TOTAL_CASOS,
  comprobarRespuesta,
  esPrediccion,
  generarEjercicioAleatorio,
  textoRespuesta,
  type Direccion,
  type Ejercicio,
} from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [eleccion, setEleccion] = useState<Direccion | null>(null);
  const [veredicto, setVeredicto] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);
  /** Cambia con cada caso o ejercicio: da un `name` propio a los radios de cada pregunta. */
  const [ronda, setRonda] = useState(0);

  const caso = CASOS[indice];
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperado = practica ? practica.respuesta : caso.respuesta;
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  const datos = practica ? practica.datos : caso.datos;
  const prediccion = esPrediccion(datos);
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setRespuesta('');
    setEleccion(null);
    setVeredicto(null);
    setVerSolucion(false);
    setVerPista(false);
    setRonda((r) => r + 1);
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
      const r = comprobarRespuesta(eleccion, esperado, datos);
      setVeredicto({ correcto: r.correcto, motivo: r.motivo });
      return;
    }
    // parseSpanishNumber admite «20» y «12,5»; devuelve NaN con cualquier otra cosa, y de ese
    // NaN se encarga comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla). El menos
    // tipográfico (−) pasa a guion, que es el único que lee el parser.
    const valor = parseSpanishNumber(respuesta.trim().replace(/[−–]/g, '-'));
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
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Del 1 al 6 se
          calcula el equilibrio con curvas lineales; del 7 al 12 se predice qué pasará ANTES de
          mover un desplazador, y después se comprueba en el simulador.
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
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        {prediccion ? (
          <fieldset className={styles.casoOpciones}>
            <legend className={styles.casoLabel}>{etiqueta}</legend>
            {OPCIONES_DIRECCION.map((opcion) => (
              <label
                key={opcion.valor}
                className={`${styles.casoOpcion} ${eleccion === opcion.valor ? styles.casoOpcionElegida : ''}`}
              >
                <input
                  type="radio"
                  name={`casos-prediccion-${ronda}`}
                  value={opcion.valor}
                  checked={eleccion === opcion.valor}
                  onChange={() => {
                    setEleccion(opcion.valor);
                    setVeredicto(null);
                  }}
                />
                <span>{opcion.texto}</span>
              </label>
            ))}
            <button type="button" className={styles.casoComprobar} onClick={comprobar}>
              Comprobar
            </button>
          </fieldset>
        ) : (
          <div className={styles.casoRespuesta}>
            <label className={styles.casoLabel} htmlFor="casos-respuesta">
              {etiqueta}
            </label>
            <div className={styles.casoFila}>
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
        )}

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
              región vacía (hallazgos 1208 y 1210 de simulador-conservacion-energia). */}
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
