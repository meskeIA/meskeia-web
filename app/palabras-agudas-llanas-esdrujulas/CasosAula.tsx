'use client';

/**
 * Casos para clase — la tarea asignable de `palabras-agudas-llanas-esdrujulas`.
 *
 * Aquí no se clasifica NADA: los casos y su corrección salen de `./casos.ts`, que llama al mismo
 * motor (`./motor.ts`) con el que la herramienta de arriba pinta su resultado.
 *
 * Dos formas de respuesta: 'clasificar' se contesta con cuatro botones (aguda, llana (grave),
 * esdrújula, sobresdrújula), que marcan la elección con `aria-pressed` y se corrigen con
 * «Comprobar»; 'tildar' se contesta escribiendo la palabra. El nombre de cada botón de caso es
 * «Caso N: título».
 */

import { useState } from 'react';
import styles from './PalabrasAgudasLlanasEsdrujulas.module.css';
import { NOMBRE_TIPO } from './motor';
import {
  CASOS,
  CLASES,
  NOTA_CONVENIO,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  type Clase,
  type Ejercicio,
  type Veredicto,
} from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [clase, setClase] = useState<Clase | null>(null);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const actual = practica ?? caso;
  const esClasificar = actual.datos.forma === 'clasificar';
  const hayPista = !practica;

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setRespuesta('');
    setClase(null);
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
    // La semilla se toma al pulsar, nunca en el render (candado del reloj y el azar)
    setPractica(generarEjercicioAleatorio(Date.now()));
    limpiar();
  }

  function comprobar() {
    const entrada = esClasificar ? (clase ?? '') : respuesta;
    setVeredicto(comprobarRespuesta(entrada, actual.datos));
  }

  const claseVeredicto = veredicto
    ? `${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`
    : `${styles.casoVeredicto} ${styles.casoVeredictoVacio}`;

  return (
    <section className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} ejercicios con solución, siempre los mismos y en el mismo orden. Un profesor
          puede pedir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. {NOTA_CONVENIO}
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
        {/* a11y-ok: acción que genera otro ejercicio, no conmutador (hallazgo 2579) */}
        <button
          type="button"
          className={`${styles.casoBoton} ${styles.casoBotonPractica} ${practica ? styles.casoBotonActivo : ''}`}
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
          {actual.enunciado}
        </p>

        {esClasificar ? (
          <div className={styles.casoRespuesta} key="clasificar">
            <p className={styles.casoLabel} id="casos-etiqueta-clase">
              {actual.etiquetaRespuesta}
            </p>
            <div className={styles.casoOpciones} role="group" aria-labelledby="casos-etiqueta-clase">
              {CLASES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.casoOpcion} ${clase === c ? styles.casoOpcionActiva : ''}`}
                  aria-pressed={clase === c}
                  onClick={() => {
                    setClase(c);
                    setVeredicto(null);
                  }}
                >
                  {NOMBRE_TIPO[c]}
                </button>
              ))}
            </div>
            <button type="button" className={styles.casoComprobar} onClick={comprobar}>
              Comprobar
            </button>
          </div>
        ) : (
          <div className={styles.casoRespuesta} key="tildar">
            <label className={styles.casoLabel} htmlFor="casos-respuesta">
              {actual.etiquetaRespuesta}
            </label>
            <div className={styles.casoFila}>
              <input
                type="text"
                id="casos-respuesta"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className={styles.casoInput}
                value={respuesta}
                placeholder="La palabra, con tilde o sin ella"
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

        {/* Siempre montado, con el texto en el mismo nodo: una región viva que aparece de golpe
            no siempre se anuncia, y con la página traducida un nodo de texto que se retira
            tumba la app (candado del ternario traducido). Vacío no ocupa sitio. */}
        <div role="alert" aria-live="polite" className={claseVeredicto}>
          <span aria-hidden="true">{veredicto ? (veredicto.correcto ? '✅ ' : '❌ ') : ''}</span>
          <span>{veredicto ? veredicto.motivo : ''}</span>
        </div>

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
              {actual.pasos.map((p, i) => (
                <li key={i} className={styles.casoPaso}>
                  {p}
                </li>
              ))}
            </ol>
            <p className={styles.casoResultado}>
              Respuesta: <strong>{actual.respuestaTexto}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
