'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-cifrado-cesar`.
 *
 * Toda la aritmética vive en `./casos.ts`, que cifra SOLO con `./motor.ts`, el mismo módulo con
 * el que la herramienta de arriba pinta su resultado y su ataque: aquí no se calcula NADA, solo
 * se pinta y se corrige llamando a `comprobarRespuesta`.
 *
 * La casilla sirve para las dos formas de respuesta: un mensaje (se corrige normalizado, solo las
 * letras) o una clave (un entero, que se lee con `leerRespuestaAula`, nunca con
 * `parseSpanishNumber`; lo exige `check:respuesta-aula`).
 *
 * Sin botón «Cargar en la rueda», a propósito: no se toca la lógica de la herramienta. Cada caso
 * trae `comoComprobar`, que dice qué hacer arriba para verlo; va en un desplegable porque lo que
 * sale en la herramienta ES la respuesta.
 *
 * ⚠️ Convivencia con el acta del Inspector (`tests/apps/simulador-cifrado-cesar.spec.ts`):
 *   · ningún botón se llama «Cifrar» o «Descifrar» a secas, ni contiene «Ataque automático»,
 *     «Párrafo largo», «Quijote» o «Ver guía educativa» (el acta los busca por nombre, sin `exact`
 *     los cuatro últimos); el nombre de cada botón de caso es «Caso N: título»;
 *   · ningún `canvas`, ningún id de los de la herramienta (`slider-desp`, `texto-original`,
 *     `texto-resultado`) y ninguna clase que contenga `attackResult`, `rot13Badge`,
 *     `histoBarInner`, `histoHint` o `canvasWrap`;
 *   · la sección va dentro de `<main>`, después del histograma y antes de la guía: no mueve
 *     ningún `nth()` ni el `.last()` del acta.
 */

import { useState } from 'react';
import { leerRespuestaAula } from '@/lib/calculadoras/correctorCasosAula';
import styles from './SimuladorCifradoCesar.module.css';
import {
  CASOS,
  NOTA_CONVENIO,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  limpiarClave,
  type Ejercicio,
} from './casos';

interface VeredictoVista {
  correcto: boolean;
  motivo: string;
}

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [veredicto, setVeredicto] = useState<VeredictoVista | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [verComprobar, setVerComprobar] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const actual = practica ?? caso;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);
  /** Sin texto no hay botón: un aria-expanded que no despliega nada anuncia una región vacía. */
  const hayComprobar = Boolean(actual.comoComprobar);

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
    // Una clave se lee como número: «2.493» es 2,493 o 2493 y leerRespuestaAula se queda con la
    // más cercana (C0558); un «k =» delante se quita antes. Un mensaje va tal cual.
    const entrada =
      actual.forma === 'clave' && typeof actual.respuesta === 'number'
        ? leerRespuestaAula(limpiarClave(respuesta), actual.respuesta)
        : respuesta;
    const r = comprobarRespuesta(entrada, actual);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
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
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. {NOTA_CONVENIO}
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
        {/* Acción, no conmutador: cada pulsación genera otro ejercicio, así que no lleva
            aria-pressed (hallazgo 2579 de calculadora-sistemas-numericos). Que se está
            practicando lo dice el <h3> «Ejercicio de práctica»; el resaltado es solo visual.
            a11y-ok: acción que genera otro ejercicio, no conmutador (hallazgo 2579) */}
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
        {/* aria-live + aria-atomic y NO role="status": al cambiar de caso el enunciado cambia y
            hay que anunciarlo, pero un enunciado no es un mensaje de estado. */}
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {actual.enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {actual.etiquetaRespuesta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="text": unas respuestas son letras y otras una clave; autoCapitalize
                porque los mensajes se escriben en mayúsculas (aunque se corrigen igual). */}
            <input
              type="text"
              id="casos-respuesta"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
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
          {hayComprobar && (
            <button
              type="button"
              className={styles.casoAyudaBoton}
              aria-expanded={verComprobar}
              aria-controls="casos-como-comprobar"
              onClick={() => setVerComprobar(!verComprobar)}
            >
              <span aria-hidden="true">🔬</span>{' '}
              <span>{verComprobar ? 'Ocultar cómo verlo en la rueda' : 'Verlo en la rueda'}</span>
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

        {verComprobar && hayComprobar && (
          <p className={styles.casoComoComprobar} id="casos-como-comprobar">
            {actual.comoComprobar}
          </p>
        )}

        {verSolucion && (
          <div className={styles.casoSolucion} id="casos-solucion">
            {/* En monoespaciada y respetando los espacios: las cuentas letra a letra quedan
                alineadas. */}
            <div className={styles.casoPasos}>
              {actual.pasos.map((p, i) => (
                <div key={i} className={styles.casoPaso}>
                  {p}
                </div>
              ))}
            </div>
            <p className={styles.casoResultado}>
              Respuesta: <strong className={styles.casoMensaje}>{actual.respuestaTexto}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
