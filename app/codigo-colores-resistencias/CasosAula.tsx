'use client';

/**
 * Casos para clase — la tarea asignable de `codigo-colores-resistencias`.
 *
 * Toda la cuenta vive en `./casos.ts`, que calcula con el mismo motor que la calculadora
 * (`lib/calculadoras/codigoColoresResistencias.ts`): aquí no se calcula NADA, solo se pinta y
 * se corrige con `comprobarRespuesta`.
 *
 * ⚠️ Convivencia con `tests/apps/codigo-colores-resistencias.spec.ts`: aquí no hay ningún
 * `fieldset`, ninguna tabla ni ningún botón cuyo nombre sea «N bandas» o contenga «Del valor a
 * los colores»: los de caso se llaman «Caso N: título». La lista de pasos (`ol`) solo se monta
 * al abrir la solución.
 */

import { useState } from 'react';
import { leerRespuestaAula } from '@/lib/calculadoras/correctorCasosAula';
import styles from './CodigoColoresResistencias.module.css';
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
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperado = practica ? practica.respuesta : caso.respuesta;
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  const datos = practica ? practica.datos : caso.datos;
  const hayPista = !practica && Boolean(caso.pista);

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
    // «±20» o «20 %» para una tolerancia: el ± no es parte del número.
    const limpio = respuesta.replace(/±/g, '');
    // «4.700» es 4,7 o 4700: leerRespuestaAula se queda con la más cercana a la respuesta (C0558).
    const valor = leerRespuestaAula(limpio, esperado);
    const r = comprobarRespuesta(valor, esperado, datos);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section className={styles.casosSection} id="casos-aula" aria-labelledby="casos-aula-titulo">
      <h2 className={styles.casosTitulo} id="casos-aula-titulo">
        <span aria-hidden="true">📝</span> Casos para clase
      </h2>
      <p className={styles.casosIntro}>
        {`${TOTAL_CASOS} ejercicios con solución, siempre los mismos y en el mismo orden: un profesor puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Se corrigen con el mismo cálculo que la herramienta de arriba. Escribe solo el número, en la unidad que pide cada caso.`}
      </p>

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
          <label className={styles.etiqueta} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="decimal": ninguna respuesta de estos casos es negativa. */}
            <input
              id="casos-respuesta"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className={styles.entrada}
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

        <div role="alert" aria-live="polite" id="casos-veredicto-zona">
          {veredicto && (
            <p
              id="casos-veredicto"
              className={`${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`}
            >
              <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span>
              <span>{` ${veredicto.motivo}`}</span>
            </p>
          )}
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
              {pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <p className={styles.casoResultado} id="casos-resultado">
              <span>Respuesta: </span>
              <strong>{textoRespuesta(esperado, datos)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
