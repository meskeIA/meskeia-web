'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-disoluciones` (02/11/2026).
 *
 * Toda la química vive en `./casos.ts`, que calcula SOLO con `./motor.ts`, el mismo módulo con
 * el que los modos «Preparar» y «Diluir» pintan sus resultados: aquí no se calcula NADA, solo
 * se pinta y se corrige llamando a `comprobarRespuesta`.
 *
 * Sin botón «Cargar en el simulador», a propósito: no se toca la lógica de la página. En su
 * lugar, cada caso que se puede ver con los deslizadores trae `comoComprobar`, que dice qué
 * poner. Va en un desplegable porque en varios casos la cifra del panel ES la respuesta.
 *
 * El veredicto vive en un nodo SIEMPRE montado y su texto en un `<span>` que no se desmonta:
 * con la página traducida, retirar o alternar un nodo de texto que el traductor ya cambió por
 * `<font>` tumba la app (candado `check:ternario-traducido`).
 */

import { useState } from 'react';
import { leerRespuestaAula } from '@/lib/calculadoras/correctorCasosAula';
import styles from './SimuladorDisoluciones.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  textoRespuesta,
  type Ejercicio,
} from './casos';

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
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  /** La tolerancia y los errores con nombre salen de la pregunta, no de la cifra. */
  const datos = practica ? practica.datos : caso.datos;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene (1208). */
  const hayPista = !practica && Boolean(caso.pista);
  /** Y solo algunos se pueden ver con los deslizadores: sin texto no hay botón. */
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
    // La semilla sale en el clic, nunca en el render ni en un useState inicial (check:reloj-azar)
    setPractica(generarEjercicioAleatorio(Date.now()));
    limpiar();
  }

  function comprobar() {
    // «2.493» es 2,493 o 2493: leerRespuestaAula se queda con la más cercana a la respuesta
    // (C0558). Con cualquier cosa que no sea un número da NaN, y de ese NaN se encarga
    // comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = leerRespuestaAula(respuesta, esperado);
    const r = comprobarRespuesta(valor, esperado, datos);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  const claseVeredicto = veredicto
    ? `${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`
    : styles.casoVeredictoVacio;

  return (
    <section className={styles.casosSection} id="casos-aula" aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Se corrigen con las
          mismas fórmulas que usa el simulador: la molaridad, los g/L, el %&nbsp;m/v y las ppm van
          por volumen de disolución (enrasada); el % es masa/volumen (gramos en 100&nbsp;mL); las ppm
          son mg/L, válido en disoluciones acuosas diluidas; y al diluir, el disolvente que se añade
          es V₂&nbsp;−&nbsp;V₁. Las masas molares son las de la lista del simulador; si tu libro usa
          otras (NaCl 58,5 o glucosa 180) también vale, porque la diferencia es menor que la
          tolerancia del 1&nbsp;%. Redondea solo al final, nunca un resultado intermedio.
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
        {/* aria-live + aria-atomic y NO role="status" (hallazgo 1212 de
            simulador-movimiento-circular): al cambiar de caso o pulsar otra vez «Practicar» el
            enunciado cambia y hay que anunciarlo, pero un enunciado no es un mensaje de estado. */}
        <p className={styles.casoEnunciado} id="casos-enunciado" aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="decimal": ninguna respuesta de estos casos es negativa (concentraciones,
                masas, volúmenes y un factor de dilución). */}
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

        {/* Siempre montado: el mismo nodo cambia de texto, no aparece ni desaparece. */}
        <div role="alert" aria-live="polite" id="casos-veredicto" className={claseVeredicto}>
          <span aria-hidden="true">{veredicto ? (veredicto.correcto ? '✅' : '❌') : ''}</span>{' '}
          <span>{veredicto ? veredicto.motivo : ''}</span>
        </div>

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
              <span>{verComprobar ? 'Ocultar cómo verlo en el simulador' : 'Verlo en el simulador'}</span>
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
            {/* La unidad la pone `textoRespuesta` desde la ficha de la pregunta, con los
                decimales del panel (hallazgo 830 de simulador-genetica). */}
            <p className={styles.casoResultado} id="casos-resultado">
              Respuesta: <strong>{textoRespuesta(esperado, datos)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
