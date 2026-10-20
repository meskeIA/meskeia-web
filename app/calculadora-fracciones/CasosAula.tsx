'use client';

/**
 * Casos para clase — la tarea asignable de `calculadora-fracciones` (skill /casos-aula-meskeia).
 *
 * Aquí no se calcula NADA: las respuestas y los desarrollos salen de `./casos.ts`, que resuelve
 * con el mismo `evaluarExpresion` de `@/lib/calculadoras/fracciones` que la calculadora de arriba. Esta vista solo pinta
 * y corrige llamando a `comprobarRespuesta`.
 *
 * La casilla es de TEXTO y no numérica: la respuesta es una fracción («7/12», «−7/12», «1 3/4»), y
 * el teclado decimal de iOS no ofrece ni la barra ni el signo menos.
 */

import { useState } from 'react';
import styles from './CalculadoraFracciones.module.css';
import { CASOS, TOTAL_CASOS, comprobarRespuesta, generarEjercicioAleatorio, type Ejercicio } from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [veredicto, setVeredicto] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperado = practica ? practica.respuesta : caso.respuesta;
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  const respuestaTexto = practica ? practica.respuestaTexto : caso.respuestaTexto;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setRespuesta('');
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
    const r = comprobarRespuesta(respuesta, esperado);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section className={styles.casosSection} id="casos-aula" aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden: un profesor puede decir
          «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. La respuesta se escribe como fracción
          irreducible (7/12, −2/5) o como entero si sale exacto; también vale el número mixto (1 3/4). Si escribes
          una fracción equivalente sin simplificar o un decimal, se te avisa.
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
        <p className={styles.casoEnunciado} id="casos-enunciado" aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            <input
              id="casos-respuesta"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              className={styles.casoInput}
              value={respuesta}
              placeholder="Por ejemplo, 7/12"
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

        {veredicto && (
          <div
            role="alert"
            aria-live="polite"
            id="casos-veredicto"
            className={`${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`}
          >
            <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span> <span>{veredicto.motivo}</span>
          </div>
        )}

        <div className={styles.casoAyudas}>
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
            <span aria-hidden="true">🔑</span> <span>{verSolucion ? 'Ocultar solución' : 'Ver solución'}</span>
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
            <p className={styles.casoResultado} id="casos-resultado">
              Respuesta: <strong>{respuestaTexto}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
