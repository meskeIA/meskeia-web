'use client';

/**
 * Casos para clase — la tarea asignable de `diptongos-e-hiatos`.
 *
 * Aquí no se clasifica NADA: los casos y su corrección salen de `./casos.ts`, que llama al mismo
 * motor (`./motor.ts`) con el que la herramienta de arriba pinta su resultado.
 *
 * Tres formas de respuesta: 'identificar' (diptongo, triptongo, hiato) y 'subtipo' (creciente,
 * decreciente, homogéneo; o simple, acentual) se contestan con botones que marcan la elección
 * con `aria-pressed` y se corrigen con «Comprobar»; 'separar' se contesta escribiendo las
 * sílabas. El nombre de cada botón de caso es «Caso N: título».
 */

import { useState } from 'react';
import styles from './DiptongosHiatos.module.css';
import {
  CASOS,
  NOTA_CONVENIO,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  nombreOpcion,
  type Ejercicio,
  type Veredicto,
} from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [opcion, setOpcion] = useState<string | null>(null);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const actual = practica ?? caso;
  const conBotones = actual.datos.forma !== 'separar';
  const hayPista = !practica;

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setRespuesta('');
    setOpcion(null);
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
    const entrada = conBotones ? (opcion ?? '') : respuesta;
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

        {conBotones ? (
          <div className={styles.casoRespuesta} key="botones">
            <p className={styles.casoLabel} id="casos-etiqueta-opcion">
              {actual.etiquetaRespuesta}
            </p>
            <div className={styles.casoOpciones} role="group" aria-labelledby="casos-etiqueta-opcion">
              {actual.opciones.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`${styles.casoOpcion} ${opcion === o ? styles.casoOpcionActiva : ''}`}
                  aria-pressed={opcion === o}
                  onClick={() => {
                    setOpcion(o);
                    setVeredicto(null);
                  }}
                >
                  {nombreOpcion(actual.datos, o)}
                </button>
              ))}
            </div>
            <button type="button" className={styles.casoComprobar} onClick={comprobar}>
              Comprobar
            </button>
          </div>
        ) : (
          <div className={styles.casoRespuesta} key="separar">
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
                placeholder="Por ejemplo: ca-sa"
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
