'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-orbitas-kepler`.
 *
 * Toda la física vive en `./casos.ts`, que calcula con `./motor.ts`, el mismo módulo con el que
 * la página pinta su panel de resultados: aquí no se calcula NADA, solo se pinta y se corrige
 * llamando a `comprobarRespuesta`.
 *
 * ⚠️ Sin `role="status"` en ningún sitio: la página ya tiene uno (el veredicto de la órbita,
 * arriba del todo), y un segundo nodo con ese rol volvería ambiguo cualquier localizador que lo
 * busque. Los anuncios de esta sección van con `aria-live` a secas, y el veredicto de la
 * respuesta con `role="alert"`.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorOrbitasKepler.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  configuracionSimulador,
  describirConfiguracion,
  generarEjercicioAleatorio,
  textoRespuesta,
  type ConfiguracionSimulador,
  type Ejercicio,
} from './casos';

interface Props {
  /** Pone la configuración del caso en los controles del simulador (lo implementa page.tsx). */
  onCargar?: (configuracion: ConfiguracionSimulador) => void;
}

export default function CasosAula({ onCargar }: Props) {
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [veredicto, setVeredicto] = useState<{ correcto: boolean; motivo: string } | null>(null);
  const [verSolucion, setVerSolucion] = useState(false);
  const [verPista, setVerPista] = useState(false);
  const [practica, setPractica] = useState<Ejercicio | null>(null);
  const [avisoCarga, setAvisoCarga] = useState('');

  const caso = CASOS[indice];
  const enunciado = practica ? practica.enunciado : caso.enunciado;
  const esperado = practica ? practica.respuesta : caso.respuesta;
  const etiqueta = practica ? practica.etiquetaRespuesta : caso.etiquetaRespuesta;
  const pasos = practica ? practica.pasos : caso.pasos;
  const datos = practica ? practica.datos : caso.datos;
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene (1208). */
  const hayPista = !practica && Boolean(caso.pista);
  /** `null` si el caso no cabe exacto en los controles: entonces el botón no se ofrece. */
  const configuracion = onCargar ? configuracionSimulador(datos) : null;

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function limpiar() {
    setRespuesta('');
    setVeredicto(null);
    setVerSolucion(false);
    setVerPista(false);
    setAvisoCarga('');
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
    // parseSpanishNumber admite «11,97» y «11.97»; devuelve NaN con cualquier otra cosa, y de
    // ese NaN se encarga comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = parseSpanishNumber(respuesta);
    const r = comprobarRespuesta(valor, esperado);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  function cargar() {
    if (!configuracion || !onCargar) return;
    onCargar(configuracion);
    const quien = practica ? 'El ejercicio de práctica' : `El caso ${caso.id}`;
    const donde = !practica && caso.comoComprobar ? ` Para comprobarlo, ${caso.comoComprobar}` : '';
    setAvisoCarga(`${quien} está cargado en el simulador: ${describirConfiguracion(configuracion)}.${donde}`);
  }

  return (
    <section className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Las distancias se
          miden desde el CENTRO del cuerpo, salvo donde el enunciado dice «altura», y cada
          enunciado da las constantes que necesita. Los casos que caben en los controles se pueden
          cargar en el simulador para comprobar el resultado.
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
        {/* aria-live + aria-atomic y NO role="status": al cambiar de caso o pulsar otra vez
            «Practicar» el enunciado cambia y hay que anunciarlo (hallazgo 1212), pero un
            segundo role="status" competiría con el veredicto de la órbita. */}
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        {configuracion && (
          <div className={styles.casoCargarFila}>
            <button type="button" className={styles.casoCargar} onClick={cargar}>
              <span aria-hidden="true">🔧</span> Cargar en el simulador
            </button>
          </div>
        )}
        <p className={styles.casoCargado} aria-live="polite">
          {avisoCarga}
        </p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="decimal": ninguna respuesta es negativa, así que el teclado decimal
                de iOS, sin signo menos, basta. */}
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
          {/* Sin pista no hay botón de pista: un aria-expanded que no despliega nada anuncia una
              región vacía (hallazgos 1208 y 1210 de simulador-conservacion-energia). */}
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

        {verSolucion && (
          <div className={styles.casoSolucion} id="casos-solucion">
            <ol className={styles.casoPasos}>
              {pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            {/* La unidad la pone `textoRespuesta` desde los datos del caso, no un recorte de la
                etiqueta (hallazgo 830 de simulador-genetica). */}
            <p className={styles.casoResultado}>
              Respuesta: <strong>{textoRespuesta(esperado, datos)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
