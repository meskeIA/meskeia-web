'use client';

/**
 * Casos para clase — la tarea asignable de `calculadora-sistemas-numericos`.
 *
 * Toda la aritmética vive en `./casos.ts`, que calcula SOLO con `./motor.ts`, el mismo módulo
 * con el que los paneles de conversión y de operaciones pintan sus resultados: aquí no se
 * calcula NADA, solo se pinta y se corrige llamando a `comprobarRespuesta`.
 *
 * La casilla NO pasa por `parseSpanishNumber`: la respuesta es un numeral en base 2, 8, 10 o
 * 16 («D7», «1010 1100»), no un número decimal español. La lee `comprobarRespuesta` con
 * `aDecimal` del motor tras validar los dígitos (el porqué, en la cabecera de `casos.ts`).
 *
 * Sin botón «Cargar en la calculadora», a propósito: los paneles guardan su estado dentro y
 * no se toca su lógica. En su lugar, cada caso trae `comoComprobar`, que dice qué teclear y
 * qué cifra imprime el panel. Va en un desplegable porque esa cifra ES la respuesta.
 *
 * ⚠️ Convivencia con el acta del Inspector (`tests/apps/calculadora-sistemas-numericos.spec.ts`):
 *   · el acta cuenta `input[type="text"]` en toda la página y exige exactamente 3: ese recuento
 *     se ACOTÓ con `:not(#casos-respuesta)` (como en simulador-fluidos-bernoulli) en vez de
 *     esconder la casilla quitándole el `type`. Tiene id propio y su `<label>`;
 *   · ningún `<select>`, ningún `role="status"` y ninguna `<table>`;
 *   · el único `role="alert"` (el veredicto) solo existe después de pulsar «Comprobar», y
 *     vive fuera de los paneles, que es donde el acta lo busca;
 *   · ningún botón ni rótulo con «Calcular», «Copiar el valor en…» ni los rótulos de las
 *     tarjetas; las clases CSS no contienen `conversionSection`, `operationsSection`,
 *     `resultCard`, `errorMsg`, `steps…` ni `opResult…`, que el acta busca con `[class*=…]`;
 *   · la sección va DESPUÉS de los paneles, así que no mueve ningún `nth()`.
 */

import { useState } from 'react';
import styles from './CalculadoraSistemasNumericos.module.css';
import { CASOS, TOTAL_CASOS, comprobarRespuesta, generarEjercicioAleatorio, type Ejercicio } from './casos';

export default function CasosAula() {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [veredicto, setVeredicto] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [verComprobar, setVerComprobar] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);

  const caso = CASOS[indice];
  const actual = practica ?? caso;
  const enunciado = actual.enunciado;
  const etiqueta = actual.etiquetaRespuesta;
  const pasos = actual.pasos;
  const textoEsperado = actual.respuestaTexto;
  const comoComprobar = actual.comoComprobar ?? '';
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);
  /** Sin texto no hay botón: un aria-expanded que no despliega nada anuncia una región vacía. */
  const hayComprobar = Boolean(comoComprobar);

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
    const r = comprobarRespuesta(respuesta, actual);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} ejercicios con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Cada caso dice en qué
          sistema hay que responder. La corrección es exacta y compara el número, no cómo se
          escribe: valen los ceros a la izquierda, las minúsculas en hexadecimal, los bits separados
          en grupos («1010 1100») y los prefijos 0b, 0o y 0x.
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
        {/* aria-live + aria-atomic y NO role="status": al cambiar de caso el enunciado cambia y
            hay que anunciarlo, pero un enunciado no es un mensaje de estado. */}
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="text" y autoCapitalize: el hexadecimal lleva letras. */}
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
              placeholder="Tu número"
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
              {verComprobar ? 'Ocultar cómo verlo en la calculadora' : 'Verlo en la calculadora'}
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
            {comoComprobar}
          </p>
        )}

        {verSolucion && (
          <div className={styles.casoSolucion} id="casos-solucion">
            {/* En monoespaciada y respetando los espacios: las columnas de la suma y los grupos
                de bits tienen que quedar alineados. */}
            <div className={styles.casoPasos}>
              {pasos.map((p, i) => (
                <div key={i} className={styles.casoPaso}>
                  {p}
                </div>
              ))}
            </div>
            {/* La misma cadena que cierra el paso a paso. */}
            <p className={styles.casoResultado}>
              Respuesta: <strong className={styles.casoNumeral}>{textoEsperado}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
