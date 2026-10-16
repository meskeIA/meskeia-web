'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-estequiometria` (semilla S0199).
 *
 * Toda la química vive en `./casos.ts`, que a su vez la toma de `./motor.ts`, el MISMO módulo
 * con que el simulador calcula su panel y sus barras: aquí no se calcula NADA, solo se pinta y
 * se corrige llamando a `comprobarRespuesta`.
 *
 * ⚠️ El acta del Inspector (`tests/apps/simulador-estequiometria.spec.ts`) localiza por clase
 * parcial `resultadoCard`, `resultadoPanel`, `barGroup`, `tabla`, `faqList`, `tipCard` y
 * `limitanteBadge`, cuenta los `role="progressbar"` y busca en todo el contenedor una cifra
 * con el % pegado. Esta sección no usa ninguna de esas clases ni ese role, y todo % va con
 * espacio duro.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorEstequiometria.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  configuracionDe,
  generarEjercicioAleatorio,
  textoRespuesta,
  decimalesDe,
  type ConfiguracionSimulador,
  type DatosCaso,
  type Ejercicio,
} from './casos';

export type { ConfiguracionSimulador } from './casos';

interface Props {
  /** Pone en el simulador la reacción, los gramos y el rendimiento del caso. */
  onCargarEnSimulador?: (configuracion: ConfiguracionSimulador) => void;
}

export default function CasosAula({ onCargarEnSimulador }: Props) {
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
  const unidad = practica ? practica.unidad : caso.unidad;
  const pasos = practica ? practica.pasos : caso.pasos;
  const datos: DatosCaso = practica ? practica.datos : caso.datos;
  const configuracion = configuracionDe(datos);
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);

  /** Al cambiar de caso se limpia todo: si no, el veredicto del anterior se queda pegado. */
  function irA(i: number) {
    setIndice(i);
    setPractica(null);
    setRespuesta('');
    setVeredicto(null);
    setVerSolucion(false);
    setVerPista(false);
  }

  function nuevaPractica() {
    setPractica(generarEjercicioAleatorio());
    setRespuesta('');
    setVeredicto(null);
    setVerSolucion(false);
    setVerPista(false);
  }

  function comprobar() {
    // parseSpanishNumber devuelve NaN con lo que no es un número, y de ese NaN se encarga
    // comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = parseSpanishNumber(respuesta);
    const r = comprobarRespuesta(valor, esperado, datos);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad.
        </p>
        <p className={styles.casosIntro}>
          El simulador usa las masas molares de la IUPAC (H = 1,008; O = 15,999…). Si haces las
          cuentas con las redondeadas de tu libro (H = 1, C = 12, O = 16, Na = 23, Cl = 35,5,
          Fe = 56), el resultado también se da por bueno: se acepta una desviación del 1&nbsp;%.
          «Cargar en el simulador» pone la reacción y los gramos del caso para que compruebes la
          respuesta en el panel.
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
        {/* aria-live para que quien usa lector de pantalla se entere de que el enunciado ha
            cambiado al pasar de caso o al pedir otro ejercicio. */}
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        {onCargarEnSimulador && configuracion && (
          <div className={styles.casoCargar}>
            <button
              type="button"
              className={styles.casoAyudaBoton}
              onClick={() => onCargarEnSimulador(configuracion)}
            >
              Cargar en el simulador
            </button>
          </div>
        )}

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="decimal": ninguna respuesta de esta app es negativa. */}
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
          {hayPista && (
            <button
              type="button"
              className={styles.casoAyudaBoton}
              aria-expanded={verPista}
              onClick={() => setVerPista(!verPista)}
            >
              <span aria-hidden="true">💡</span> <span>{verPista ? 'Ocultar pista' : 'Ver pista'}</span>
            </button>
          )}
          <button
            type="button"
            className={styles.casoAyudaBoton}
            aria-expanded={verSolucion}
            onClick={() => setVerSolucion(!verSolucion)}
          >
            <span aria-hidden="true">🔑</span> <span>{verSolucion ? 'Ocultar solución' : 'Ver solución'}</span>
          </button>
        </div>

        {verPista && hayPista && <p className={styles.casoPista}>{caso.pista}</p>}

        {verSolucion && (
          <div className={styles.casoSolucion}>
            <ol className={styles.casoPasos}>
              {pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <p className={styles.casoRespuestaFinal}>
              Respuesta: <strong>{textoRespuesta(esperado, unidad, decimalesDe(datos.pregunta))}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
