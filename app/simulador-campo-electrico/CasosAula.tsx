'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-campo-electrico`.
 *
 * Toda la física vive en `./casos.ts`, que a su vez la toma de `./motor.ts`, el MISMO módulo
 * con que el panel de la sonda calcula sus cifras: aquí no se calcula NADA, solo se pinta y se
 * corrige llamando a `comprobarRespuesta`.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorCampoElectrico.module.css';
import type { CargaPuntual } from './motor';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  textoRespuesta,
  type DatosCaso,
  type Ejercicio,
  type PuntoPlano,
} from './casos';

interface Props {
  /** Coloca en el lienzo las cargas del caso y, si lo hay, lleva la sonda al punto pedido. */
  onCargarEnSimulador?: (cargas: readonly CargaPuntual[], punto?: PuntoPlano) => void;
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
    // El menos tipográfico (−) y la raya corta (–) que pegan algunos teclados se leen como
    // signo menos; parseSpanishNumber devuelve NaN con cualquier otra cosa, y de ese NaN se
    // encarga comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = parseSpanishNumber(respuesta.replace(/[−–]/g, '-'));
    const r = comprobarRespuesta(valor, esperado);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <section className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un
          profesor puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Los
          casos usan k = 8,99·10⁹ N·m²/C², el valor del simulador; si tu libro usa 9·10⁹, la
          diferencia es del 0,11 % y la corrección la admite.
        </p>
        <p className={styles.casosIntro}>
          «Cargar en el simulador» coloca las cargas del caso en el lienzo y lleva la sonda al
          punto que se pregunta. El panel mide siempre con q₀ = +1 nC: su |E|, sus componentes
          y su V se comparan tal cual, pero su fuerza y su energía son las de 1 nC, así que para
          otra carga de prueba hay que multiplicarlas por ella.
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
            cambiado al pasar de caso o al pedir otro ejercicio. NO role="status": el panel
            de la sonda ya lo es, y el acta del Inspector lo localiza por ese role. */}
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        {onCargarEnSimulador && (
          <div className={styles.casoCargar}>
            <button
              type="button"
              className={styles.casoAyudaBoton}
              onClick={() => onCargarEnSimulador(datos.cargas, datos.punto)}
            >
              Cargar en el simulador
            </button>
            {!datos.punto && (
              <span className={styles.casoCargarNota}>
                Este caso no fija la sonda: búscalo tú arrastrándola o escribiendo su posición.
              </span>
            )}
          </div>
        )}

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
            {/* inputMode="text": varias respuestas son negativas y el teclado decimal de
                iOS no ofrece el signo menos. */}
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
          {/* Un control de despliegue no se ofrece cuando no hay nada que desplegar: el
              ejercicio aleatorio no trae pista. */}
          {hayPista && (
            <button
              type="button"
              className={styles.casoAyudaBoton}
              aria-expanded={verPista}
              onClick={() => setVerPista(!verPista)}
            >
              <span aria-hidden="true">💡</span> {verPista ? 'Ocultar pista' : 'Ver pista'}
            </button>
          )}
          <button
            type="button"
            className={styles.casoAyudaBoton}
            aria-expanded={verSolucion}
            onClick={() => setVerSolucion(!verSolucion)}
          >
            <span aria-hidden="true">🔑</span> {verSolucion ? 'Ocultar solución' : 'Ver solución'}
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
            {/* Mismos decimales que el último paso: `textoRespuesta` con 2, que es lo que
                pide cada enunciado. */}
            <p className={styles.casoResultado}>
              Respuesta: <strong>{textoRespuesta(esperado, unidad)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
