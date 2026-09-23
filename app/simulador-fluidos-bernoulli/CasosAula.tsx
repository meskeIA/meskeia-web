'use client';

/**
 * Casos para clase — la tarea asignable de `simulador-fluidos-bernoulli`.
 *
 * Toda la física vive en `./casos.ts`, que a su vez monta la tubería con `./motor.ts`, el mismo
 * módulo con el que la página calcula su tabla de secciones: aquí no se calcula NADA, solo se
 * pinta y se corrige llamando a `comprobarRespuesta`.
 *
 * ⚠️ Sin `role="status"` en ningún sitio: el acta del Inspector
 * (`tests/apps/simulador-fluidos-bernoulli.spec.ts`) lee el panel de resultados con
 * `[role="status"]`, y un segundo nodo con ese rol lo volvería ambiguo. Los anuncios de esta
 * sección van con `aria-live` a secas, y el veredicto con `role="alert"`.
 */

import { useState } from 'react';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorFluidosBernoulli.module.css';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  configuracionSimulador,
  generarEjercicioAleatorio,
  textoRespuesta,
  type ConfiguracionSimulador,
  type Ejercicio,
} from './casos';
import { fluidoPorId } from './motor';

interface Props {
  /** Pone la configuración del caso en los controles del simulador (lo implementa page.tsx). */
  onCargar?: (configuracion: ConfiguracionSimulador) => void;
}

const NOMBRE_GEOMETRIA: Record<ConfiguracionSimulador['geometria'], string> = {
  venturi: 'Venturi horizontal',
  desnivel: 'tubería con desnivel',
  estenosis: 'vena con estenosis',
};

/** Resumen legible de lo que se ha cargado, para anunciarlo y para que se vea. */
function describirCarga(c: ConfiguracionSimulador): string {
  const partes = [
    NOMBRE_GEOMETRIA[c.geometria],
    fluidoPorId(c.fluido).nombre.toLowerCase(),
    `${c.caudalLs.toLocaleString('es-ES')} L/s`,
  ];
  if (c.ratio !== undefined) partes.push(`D₂/D₁ = ${c.ratio.toLocaleString('es-ES')}`);
  if (c.desnivel !== undefined) partes.push(`Δh = ${c.desnivel.toLocaleString('es-ES')} m`);
  return partes.join(', ');
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
  /** Solo los casos numerados traen pista: el ejercicio aleatorio no la tiene. */
  const hayPista = !practica && Boolean(caso.pista);
  /** `null` si el caso no cabe en los deslizadores: entonces el botón no se ofrece. */
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
    // El simulador escribe las diferencias con el signo menos tipográfico (−486 Pa) y es fácil
    // copiarlo tal cual: se normaliza al guion antes de leer. parseSpanishNumber admite «70,47»
    // y «70.47» y devuelve NaN con cualquier otra cosa, y de ese NaN se encarga
    // comprobarRespuesta con un mensaje propio (nunca «NaN» en pantalla).
    const valor = parseSpanishNumber(respuesta.replace(/[−‒–]/g, '-'));
    const r = comprobarRespuesta(valor, esperado);
    setVeredicto({ correcto: r.correcto, motivo: r.motivo });
  }

  function cargar() {
    if (!configuracion || !onCargar) return;
    onCargar(configuracion);
    const quien = practica ? 'El ejercicio de práctica' : `El caso ${caso.id}`;
    setAvisoCarga(`${quien} está cargado en el simulador: ${describirCarga(configuracion)}.`);
  }

  return (
    <section className={styles.casosSection} aria-labelledby="casos-aula-titulo">
      <div className={styles.casosHeader}>
        <h2 className={styles.casosTitulo} id="casos-aula-titulo">
          <span aria-hidden="true">📝</span> Casos para clase
        </h2>
        <p className={styles.casosIntro}>
          {TOTAL_CASOS} problemas con solución, siempre los mismos y en el mismo orden. Un profesor
          puede decir «resuelve los casos 3, 7 y 11» y corregir sin ambigüedad. Las presiones que se
          piden son ABSOLUTAS, como las del simulador, y g = 9,81 m/s² donde hay desnivel. La
          estenosis es física de un tubo, no una medida clínica.
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
            «Practicar» el enunciado cambia y hay que anunciarlo, pero un segundo role="status"
            rompería el localizador del panel de resultados en el acta del Inspector. */}
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
            {/* inputMode="text": varias respuestas son NEGATIVAS (P₂ − P₁) y el teclado decimal
                de iOS no trae el signo menos. */}
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
