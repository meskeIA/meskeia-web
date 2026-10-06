'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-efecto-fotoelectrico`.
 *
 * Toda la física vive en `./casos.ts`, que calcula con `./motor.ts`, el mismo módulo con el que
 * las tarjetas, el dibujo de la placa y la gráfica E_c–f pintan sus cifras: aquí no se calcula
 * NADA, solo se pinta y se corrige llamando a `comprobarRespuesta`.
 *
 * Sin botón «Cargar en el simulador», a propósito: no se toca la lógica del simulador. En su
 * lugar, cada caso que se puede ver con los controles trae `comoComprobar`, que dice qué poner.
 * Va en un desplegable porque en varios casos la cifra de la tarjeta ES la respuesta.
 *
 * ⚠️ Convivencia con el acta del Inspector (`tests/apps/simulador-efecto-fotoelectrico.spec.ts`):
 * aquí no hay ninguna clase que contenga «valueCard» ni «electron» (localiza tarjetas y
 * electrones con `[class*=…]`), ningún `svg`, ningún `fieldset` (cuenta los botones de metal con
 * `fieldset button[aria-pressed]`), ningún `input[type="range"]` y ningún botón cuyo nombre
 * empiece por un metal o por «Otro φ»: los de caso se llaman «Caso N: título». Tampoco se usan en
 * la sección las frases que el acta busca con `getByText` («Se emiten electrones», «Con
 * intensidad 0 no llega ningún fotón», «no se emiten electrones aunque aumentes la intensidad»).
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorEfectoFotoelectrico.module.css';
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
  /** La tolerancia sale de la pregunta (sus datos y el redondeo pedido), no de la cifra: 2626. */
  const datos = practica ? practica.datos : caso.datos;
  const decimales = datos.decimales ?? 2;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene (1208). */
  const hayPista = !practica && Boolean(caso.pista);
  /** Y solo algunos se pueden ver con los controles: sin texto no hay botón. */
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
    // parseSpanishNumber admite «0,92» y «0.92»; devuelve NaN con cualquier otra cosa, y de
    // ese NaN se encarga comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = parseSpanishNumber(respuesta);
    const r = comprobarRespuesta(valor, esperado, datos);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section className={styles.casosSection} id="casos-aula" aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Se corrigen con el
          mismo modelo que calcula las tarjetas: E<sub>c,máx</sub> = h·f − φ, el potencial de
          frenado en voltios es el mismo número que E<sub>c,máx</sub> en eV y la velocidad se calcula
          sin relatividad. Cada enunciado dice qué constantes usar (h·c = 1240 eV·nm o, para
          frecuencias y velocidades, h = 6,63 × 10⁻³⁴ J·s, e = 1,60 × 10⁻¹⁹ C y
          mₑ = 9,11 × 10⁻³¹ kg). El simulador usa los valores exactos de CODATA 2018, y los datos
          están elegidos para que, redondeando como pide el enunciado, las dos cuentas den la misma
          cifra. Vale la cifra exacta o la redondeada como se pide; redondea solo al final, nunca un
          resultado intermedio.
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
            enunciado cambia y hay que anunciarlo, pero un enunciado no es un mensaje de estado y
            el role compite con el role="status" de los resultados de la app. */}
        <p className={styles.casoEnunciado} id="casos-enunciado" aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="decimal": ninguna respuesta de estos casos es negativa (lo que le falta
                al fotón se pide como cantidad positiva, no como E_c negativa). */}
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

        {veredicto && (
          <div
            role="alert"
            aria-live="polite"
            id="casos-veredicto"
            className={`${styles.casoVeredicto} ${veredicto.correcto ? styles.casoOk : styles.casoKo}`}
          >
            <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span> {veredicto.motivo}
          </div>
        )}

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
                el caso: un número suelto junto a media etiqueta se lee mal (hallazgo 830 de
                simulador-genetica). */}
            <p className={styles.casoResultado} id="casos-resultado">
              Respuesta: <strong>{textoRespuesta(esperado, etiqueta, decimales)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
