'use client';

/**
 * Casos para clase — la tarea asignable de simulador-genetica.
 *
 * Toda la genética vive en `../casos.ts`, que a su vez reutiliza el motor de la app: aquí
 * no se calcula NADA, solo se pinta y se corrige llamando a `comprobarRespuesta`.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from '../SimuladorGenetica.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  type Ejercicio,
} from '../casos';

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
    // parseSpanishNumber admite «56,25» y «56.25»; devuelve NaN con cualquier otra cosa, y
    // de ese NaN se encarga comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = parseSpanishNumber(respuesta);
    const r = comprobarRespuesta(valor, esperado);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  return (
    <div className={styles.casosSection}>
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo}>
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} cruces con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Resuélvelos con
          el cuadro de Punnett de arriba.
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
        <p className={styles.casoEnunciado}>{enunciado}</p>

        <div className={styles.casoRespuesta}>
          <label className={styles.casoLabel} htmlFor="casos-respuesta">
            {etiqueta}
          </label>
          <div className={styles.casoFila}>
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
          <button
            type="button"
            className={styles.casoAyudaBoton}
            aria-expanded={verPista}
            onClick={() => setVerPista(!verPista)}
          >
            <span aria-hidden="true">💡</span> {verPista ? 'Ocultar pista' : 'Ver pista'}
          </button>
          <button
            type="button"
            className={styles.casoAyudaBoton}
            aria-expanded={verSolucion}
            onClick={() => setVerSolucion(!verSolucion)}
          >
            <span aria-hidden="true">🔑</span> {verSolucion ? 'Ocultar solución' : 'Ver solución'}
          </button>
        </div>

        {verPista && !practica && <p className={styles.casoPista}>{caso.pista}</p>}

        {verSolucion && (
          <div className={styles.casoSolucion}>
            <ol className={styles.casoPasos}>
              {pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
            <p className={styles.casoResultado}>
              Respuesta: <strong>{esperado.toLocaleString('es-ES', { maximumFractionDigits: 2 })}</strong>{' '}
              {etiqueta.replace(/^%\s*/, '').trim() ? etiqueta.replace(/^%\s*/, '') : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
