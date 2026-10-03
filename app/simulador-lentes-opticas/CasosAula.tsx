'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-lentes-opticas`.
 *
 * Toda la óptica vive en `./casos.ts`, que calcula SOLO con `./motor.ts`, el mismo módulo con
 * el que el panel de resultados pinta sus cifras: aquí no se calcula NADA, solo se pinta y se
 * corrige llamando a `comprobarRespuesta`.
 *
 * Sin botón «Cargar en el simulador», a propósito: no se toca la lógica de los deslizadores. En
 * su lugar, cada caso reproducible trae `comoComprobar`, que dice dónde poner cada deslizador y
 * qué tarjeta mirar. Va en un desplegable porque en varios casos la cifra que imprime el panel
 * ES la respuesta, y a la vista estropearía la tarea.
 *
 * ⚠️ El acta del Inspector (`tests/apps/simulador-lentes-opticas.spec.ts`) localiza:
 *   · la clasificación por `[role="status"]` → esta sección NO usa role="status" (el enunciado
 *     va con aria-live, y el veredicto con role="alert");
 *   · las tarjetas por su etiqueta EXACTA («Distancia imagen (s')», «Aumento (M = −s'/s)»,
 *     «Altura imagen (h')», «Potencia P = 1/f», «Distancia focal f») → ningún elemento de esta
 *     sección tiene uno de esos textos como texto completo;
 *   · el botón de la lente por `getByRole('button', { name: /Divergente/ })`, que distingue
 *     mayúsculas → ningún botón de aquí lleva «Divergente» con mayúscula en su nombre;
 *   · el panel por `[class*="resultsPanel"]` y el lienzo por `document.querySelector('canvas')`
 *     → ninguna clase de aquí contiene «resultsPanel» y no hay ningún <canvas>.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorLentesOpticas.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  textoRespuesta,
  type Ejercicio,
} from './casos';

/**
 * El signo menos tipográfico (U+2212) es el que imprime el panel, y un alumno que copia de él
 * lo pega; `parseSpanishNumber` solo entiende el guion ASCII, así que se normaliza antes.
 */
function normalizarSigno(texto: string): string {
  return texto.replace(/−/g, '-');
}

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
  const decimales = (practica ? practica.datos : caso.datos).decimales ?? 2;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);
  /** Y solo los que se pueden montar con los deslizadores: sin texto no hay botón. */
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
    // parseSpanishNumber admite «−12», «-12», «2,5» y «2.5»; devuelve NaN con cualquier otra
    // cosa, y de ese NaN se encarga comprobarRespuesta con un mensaje propio (nunca «NaN»).
    const valor = parseSpanishNumber(normalizarSigno(respuesta));
    // Se corrige con los DATOS, no con la clave: la tolerancia la da la pregunta y la
    // distancia se mide contra el valor exacto (ver `comprobarRespuesta`).
    const r = comprobarRespuesta(valor, practica ? practica.datos : caso.datos);
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
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Las distancias van en
          centímetros; las posiciones, alturas y aumentos, con su signo (negativo si la imagen es
          virtual o sale invertida). Solo se pregunta lo que da el mismo número con los dos convenios
          de signos que se enseñan, así que da igual cuál use tu libro. Los datos son exactos, así
          que no hay margen: vale la cifra exacta o, si no sale exacta, la redondeada a los
          decimales que pide el enunciado (si cae justo en la mitad, como −9,375, valen −9,38 y
          −9,37). Redondea solo al final, nunca un resultado intermedio.
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
        {/* aria-live + aria-atomic y NO role="status": el acta localiza la clasificación de la
            imagen con `[role="status"]`, y un enunciado no es un mensaje de estado. */}
        <p className={styles.casoEnunciado} id="casos-enunciado" aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="text", no "decimal": hay respuestas negativas y el teclado decimal
                de iOS no tiene signo menos. */}
            <input
              id="casos-respuesta"
              type="text"
              inputMode="text"
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
                el caso y el signo «−» que imprime el panel. */}
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
