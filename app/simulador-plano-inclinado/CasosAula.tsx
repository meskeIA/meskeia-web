'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-plano-inclinado`.
 *
 * Toda la física vive en `./casos.ts`, que calcula SOLO con `./motor.ts`, el mismo módulo con
 * el que el panel «Análisis de fuerzas» pinta sus cifras: aquí no se calcula NADA, solo se pinta
 * y se corrige llamando a `comprobarRespuesta`.
 *
 * Sin botón «Cargar en el simulador», a propósito: no se toca la lógica de los deslizadores. En
 * su lugar, cada caso trae `comoComprobar`, que dice dónde poner cada deslizador y qué fila
 * mirar. Va en un desplegable porque en varios casos la cifra que imprime el panel ES la
 * respuesta, y a la vista estropearía la tarea.
 *
 * ⚠️ El acta del Inspector (`tests/apps/simulador-plano-inclinado.spec.ts`) localiza por texto
 * y por rol: el aviso del simulador es `main section[role="status"] strong`, las filas del panel
 * son `div` con exactamente dos `span`, y los botones se buscan por /Soltar el bloque|Pausar/,
 * /Sin rozamiento/ y /Caucho sobre hormigón/. Esta sección no usa `role="status"`, no tiene
 * ningún `div` con dos `span` hijos, y ninguno de sus botones ni títulos repite esos textos.
 */

import { useState } from 'react';
import styles from './SimuladorPlanoInclinado.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  leerRespuesta,
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
  /** La tolerancia sale de la pregunta (sus datos y el redondeo pedido), no de la cifra: 2783. */
  const datos = practica ? practica.datos : caso.datos;
  const decimales = datos.decimales ?? 2;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
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
    // leerRespuesta admite «84,96», «84.96» y «4.905» (punto decimal: ninguna respuesta llega a
    // mil, hallazgo 2784); devuelve NaN con cualquier otra cosa, y de ese NaN se encarga
    // comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = leerRespuesta(respuesta);
    const r = comprobarRespuesta(valor, datos);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section id="casos-aula" className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Se corrigen como
          calcula el simulador: g = 9,81 m/s², fuerza aplicada paralela al plano y normal
          m·g·cos θ. Los datos son exactos, así que no hay margen: vale la cifra exacta o, si el
          enunciado pide redondear, la redondeada como pide (con otra g, como 9,8 o 10, casi
          siempre cambia). Usa los senos y cosenos de la calculadora y redondea solo al final,
          nunca un resultado intermedio. Si un bloque no se mueve, su aceleración es 0.
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
        {/* aria-live + aria-atomic y NO role="status": el acta localiza el aviso del simulador
            con `main section[role="status"]`, y un enunciado no es un mensaje de estado. */}
        <p className={styles.casoEnunciado} id="casos-enunciado" aria-live="polite" aria-atomic="true">
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
            <button
              type="button"
              id="casos-comprobar"
              className={styles.casoComprobar}
              onClick={comprobar}
            >
              Comprobar
            </button>
          </div>
        </div>

        {veredicto && (
          <div
            id="casos-veredicto"
            role="alert"
            aria-live="polite"
            className={`${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`}
          >
            <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span> {veredicto.motivo}
          </div>
        )}

        <div className={styles.casoAyudas}>
          {/* Sin pista no hay botón de pista: un aria-expanded que no despliega nada anuncia una
              región vacía. Lo mismo vale para «Verlo en el simulador». */}
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
            {/* La unidad la pone `textoRespuesta` desde la etiqueta, con los decimales que pide
                el caso. Sin <strong>: el acta busca el aviso del simulador por `strong` dentro
                de una sección con role="status", y esta no lo tiene, pero así no hay ni duda. */}
            <p className={styles.casoResultado} id="casos-resultado">
              Respuesta:{' '}
              <span className={styles.casoResultadoCifra}>
                {textoRespuesta(esperado, etiqueta, decimales)}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
