'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-titulacion`.
 *
 * Toda la química vive en `./casos.ts`, que a su vez la toma de `./motor.ts`, el MISMO módulo
 * con que el simulador calcula su panel y su curva: aquí no se calcula NADA, solo se pinta y
 * se corrige llamando a `comprobarRespuesta`.
 *
 * ⚠️ El acta del Inspector (`tests/apps/simulador-titulacion.spec.ts`) localiza por nombre
 * parcial los botones «Ir a equivalencia», «Reiniciar», «Fenolftaleína», «Naranja de metilo» y
 * «Ácido débil + Base fuerte», y cuenta los `div[role="status"]` y los `button small`. Esta
 * sección no repite ninguno de esos nombres en un botón, no usa `role="status"` ni `<small>`.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorTitulacion.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  configuracionDe,
  generarEjercicioAleatorio,
  textoRespuesta,
  type ConfiguracionSimulador,
  type DatosCaso,
  type Ejercicio,
  type Magnitud,
} from './casos';

export type { ConfiguracionSimulador } from './casos';

interface Props {
  /** Pone en el simulador el tipo y los deslizadores del caso, con la bureta a 0. */
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
  const magnitud: Magnitud = practica ? practica.magnitud : caso.magnitud;
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
    const r = comprobarRespuesta(valor, esperado, magnitud);
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
          profesor puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. En
          todos se titula un ácido (en el matraz) con una base (en la bureta); los volúmenes van
          en mL y las concentraciones en mol/L.
        </p>
        <p className={styles.casosIntro}>
          «Cargar en el simulador» pone el tipo de titulación y los deslizadores del caso y deja
          la bureta vacía: añade tú la base con «+ 1 mL» y «+ Gota (0,1 mL)» hasta el volumen del
          enunciado y lee el pH en el panel. Un pH se da por bueno con un margen de ±0,02.
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
            «Estado actual» ya lo es, y el acta del Inspector lo localiza por ese role. */}
        <p className={styles.casoEnunciado} aria-live="polite" aria-atomic="true">
          {enunciado}
        </p>

        {onCargarEnSimulador && (
          <div className={styles.casoCargar}>
            {configuracion ? (
              <button
                type="button"
                className={styles.casoAyudaBoton}
                onClick={() => onCargarEnSimulador(configuracion)}
              >
                Cargar en el simulador
              </button>
            ) : (
              <span className={styles.casoCargarNota}>
                Aquí la concentración del ácido es la incógnita, así que no se carga: cuando la
                tengas, ponla en el deslizador [Analito] y comprueba que el V_eq del panel
                coincide con el del enunciado.
              </span>
            )}
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
              Respuesta: <strong>{magnitud === 'pH' ? 'pH = ' : ''}{textoRespuesta(esperado, unidad)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
