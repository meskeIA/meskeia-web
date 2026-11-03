'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './PracticaRegulares.module.css';
import { formatPercentage, enfocarSinCentrar, traerALaVista } from '@/lib';
import { useGuardaRafaga } from '@/lib/useGuardaRafaga';
import {
  VERBOS_REGULARES, TERMINACIONES, IPA_TERMINACION, pasadosRegulares, terminacionDe,
  pasadoRegularCorrecto, explicarOrtografia, explicarPronunciacion,
  type Terminacion, type VerboRegular,
} from './regulares';

/**
 * Práctica de VERBOS REGULARES dentro de quiz-verbos-irregulares (S0246): escribir el pasado en
 * -ed y decir cómo suena esa -ed. Vive en su propia sección, con su estado, para no tocar el quiz
 * de irregulares, que tiene detrás un spec de casi 3.000 líneas y el testigo de la familia de
 * quizzes.
 *
 * ⚠️ Los rótulos y las clases están escogidos para no chocar con los selectores de esos tests
 * (`[class*="resultadoPuntos"]`, `getByRole('button', { name: '20 preguntas' })`, la opción que
 * empieza por «A», «Siguiente pregunta», «Comprobar»…): si esta sección repitiera alguno, el
 * localizador encontraría dos elementos y el test fallaría por la sección equivocada.
 */

type Practica = 'escribir' | 'pronunciar';
type Fase = 'inicio' | 'pregunta' | 'nota';

const PRACTICAS: Record<Practica, { label: string; desc: string }> = {
  escribir:   { label: 'Escribir el pasado',  desc: 'study → studied · stop → stopped' },
  pronunciar: { label: 'Cómo suena la -ed',   desc: '/t/, /d/ o /ɪd/' },
};

const TANDAS = [10, 15, 20];

/** Nombre para el lector de pantalla: «/ɪd/» en AFI se lee mal letra a letra. */
const NOMBRE_TERMINACION: Record<Terminacion, string> = {
  t: 'Suena t',
  d: 'Suena d',
  id: 'Suena id, una sílaba más',
};

function barajar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticaRegulares() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [practica, setPractica] = useState<Practica>('escribir');
  const [tanda, setTanda] = useState(10);
  /** Práctica de la tanda EN CURSO: cambiar el selector no la altera. */
  const [practicaTanda, setPracticaTanda] = useState<Practica>('escribir');
  const [verbos, setVerbos] = useState<VerboRegular[]>([]);
  const [actual, setActual] = useState(0);
  const [escrito, setEscrito] = useState('');
  /** Veredicto de la pregunta actual: null mientras no se ha contestado. */
  const [acierto, setAcierto] = useState<boolean | null>(null);
  const [elegida, setElegida] = useState<Terminacion | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fallados, setFallados] = useState<string[]>([]);

  const verbo = verbos[actual];
  const total = verbos.length;
  const esUltimo = actual === total - 1;
  const respondida = acierto !== null;

  const panelRef = useRef<HTMLDivElement>(null);
  const enunciadoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const siguienteRef = useRef<HTMLButtonElement>(null);
  const notaRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const vieneDeNota = useRef(false);

  // Foco y vista: la receta del quiz de irregulares (hallazgos 1834, 1835 y 3770). Al cargar la
  // página no se toca nada: el efecto solo actúa tras empezar, contestar o salir de la nota.
  useEffect(() => {
    if (fase === 'pregunta') {
      if (respondida) {
        enfocarSinCentrar(siguienteRef.current);
      } else {
        traerALaVista(panelRef.current, enunciadoRef.current);
        if (practicaTanda === 'escribir') inputRef.current?.focus({ preventScroll: true });
        else enunciadoRef.current?.focus({ preventScroll: true });
      }
    } else if (fase === 'nota') {
      traerALaVista(notaRef.current, notaRef.current);
      notaRef.current?.focus({ preventScroll: true });
    } else if (vieneDeNota.current) {
      vieneDeNota.current = false;
      tituloRef.current?.focus();
    }
  }, [fase, actual, respondida, practicaTanda]);

  // Doble toque: la receta de la familia (lib/useGuardaRafaga.ts, hallazgo 3615).
  const marcarCambioPantalla = useGuardaRafaga();

  const empezar = useCallback(() => {
    marcarCambioPantalla();
    setVerbos(barajar(VERBOS_REGULARES).slice(0, tanda));
    setActual(0);
    setEscrito('');
    setAcierto(null);
    setElegida(null);
    setAciertos(0);
    setFallados([]);
    setPracticaTanda(practica);
    setFase('pregunta');
  }, [marcarCambioPantalla, tanda, practica]);

  const anotar = useCallback((ok: boolean) => {
    setAcierto(ok);
    if (ok) setAciertos((n) => n + 1);
    else setFallados((prev) => (prev.includes(verbo.infinitivo) ? prev : [...prev, verbo.infinitivo]));
  }, [verbo]);

  const corregirEscrito = useCallback(() => {
    if (respondida) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    anotar(pasadoRegularCorrecto(verbo, escrito));
  }, [respondida, marcarCambioPantalla, anotar, verbo, escrito]);

  const elegir = useCallback((t: Terminacion) => {
    if (respondida) return;
    marcarCambioPantalla({ soloMismoPunto: true });
    setElegida(t);
    anotar(t === terminacionDe(verbo));
  }, [respondida, marcarCambioPantalla, anotar, verbo]);

  const avanzar = useCallback(() => {
    marcarCambioPantalla();
    if (esUltimo) {
      setFase('nota');
    } else {
      setActual((n) => n + 1);
      setEscrito('');
      setAcierto(null);
      setElegida(null);
    }
  }, [marcarCambioPantalla, esUltimo]);

  const volverAlInicio = useCallback(() => {
    marcarCambioPantalla();
    vieneDeNota.current = true;
    setFase('inicio');
  }, [marcarCambioPantalla]);

  const [pasado, variante] = verbo ? pasadosRegulares(verbo) : ['', undefined];

  return (
    <section id="verbos-regulares" className={styles.regSeccion} aria-labelledby="titulo-regulares">
      <h2 id="titulo-regulares" className={styles.regTitulo} ref={tituloRef} tabIndex={-1}>
        Verbos regulares: el pasado en -ed
      </h2>
      <p className={styles.regIntro}>
        Lo que un examen pregunta de los regulares: cómo se escribe el pasado y cómo suena{' '}
        <span className={styles.regNowrap}>su -ed</span>.
        {` ${VERBOS_REGULARES.length} verbos de uso escolar, corregidos con la regla.`}
      </p>

      {fase === 'inicio' && (
        <div className={styles.regCaja}>
          <h3 className={styles.regSubtitulo}>Qué practicar</h3>
          <div className={styles.regFila} role="group" aria-label="Qué practicar de los verbos regulares">
            {(Object.entries(PRACTICAS) as [Practica, typeof PRACTICAS[Practica]][]).map(([clave, cfg]) => (
              <button
                type="button"
                key={clave}
                className={`${styles.regEleccion} ${practica === clave ? styles.regElegido : ''}`}
                onClick={() => setPractica(clave)}
                aria-pressed={practica === clave}
              >
                <span className={styles.regEleccionNombre}>{cfg.label}</span>
                <span className={styles.regEleccionDesc} lang="en">{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.regSubtitulo}>Cuántos verbos</h3>
          <div className={styles.regFila} role="group" aria-label="Cuántos verbos regulares">
            {TANDAS.map((n) => (
              <button
                type="button"
                key={n}
                className={`${styles.regTanda} ${tanda === n ? styles.regElegido : ''}`}
                onClick={() => setTanda(n)}
                aria-pressed={tanda === n}
              >
                {n} verbos
              </button>
            ))}
          </div>

          <button type="button" className={styles.regBtnPrincipal} onClick={empezar}>
            {`Empezar con los regulares — ${tanda} verbos`}
          </button>

          <div className={styles.regReglas}>
            <p className={styles.regReglasTitulo}>Las reglas, en corto</p>
            <ul className={styles.regReglasLista}>
              <li>
                <strong>Ortografía:</strong> -e → +d (<span lang="en">liked</span>) · consonante + y → -ied
                (<span lang="en">studied</span>) · vocal + y → -ed (<span lang="en">played</span>) ·
                consonante + vocal + consonante con la última sílaba tónica → se dobla
                (<span lang="en">stopped, preferred</span>) · la w y la x no se doblan
                (<span lang="en">fixed</span>).
              </li>
              <li>
                <strong>Pronunciación:</strong> tras /t/ o /d/, la -ed suena /ɪd/ (<span lang="en">wanted</span>);
                tras un sonido sordo, /t/ (<span lang="en">worked</span>); tras uno sonoro, /d/
                (<span lang="en">played</span>). Cuenta el último SONIDO, no la letra:
                {' '}<span lang="en">laughed</span> suena /t/ y <span lang="en">closed</span>, /d/.
              </li>
            </ul>
          </div>
        </div>
      )}

      {fase === 'pregunta' && verbo && (
        <div className={styles.regCaja} ref={panelRef}>
          <p className={styles.regMarcador}>
            <span>{`Verbo ${actual + 1} de ${total}`}</span>
            <span>{`Aciertos: ${aciertos}`}</span>
          </p>

          <div className={styles.regEnunciado} ref={enunciadoRef} tabIndex={-1}>
            <p className={styles.regPregunta}>
              {practicaTanda === 'escribir'
                ? 'Escribe el pasado (Past Simple) de...'
                : '¿Cómo suena la -ed de este pasado?'}
            </p>
            <p className={styles.regVerbo} lang="en">
              {practicaTanda === 'escribir' ? verbo.infinitivo : pasado}
            </p>
            <p className={styles.regSignificado}>{`«${verbo.espanol}»`}</p>
          </div>

          {practicaTanda === 'escribir' && (
            <form
              className={styles.regForm}
              onSubmit={(e) => { e.preventDefault(); corregirEscrito(); }}
              noValidate
            >
              <label htmlFor="pasado-regular" className={styles.regEtiqueta}>Past Simple</label>
              <input
                id="pasado-regular"
                ref={inputRef}
                type="text"
                lang="en"
                className={`${styles.regInput} ${acierto === true ? styles.regInputBien : ''} ${acierto === false ? styles.regInputMal : ''}`}
                value={escrito}
                onChange={(e) => setEscrito(e.target.value)}
                readOnly={respondida}
                aria-invalid={acierto === false ? true : undefined}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
              />
              {!respondida && (
                <button type="submit" className={styles.regBtnPrincipal}>Corregir</button>
              )}
            </form>
          )}

          {practicaTanda === 'pronunciar' && (
            <div className={styles.regTerminaciones}>
              {TERMINACIONES.map((t) => {
                const buena = respondida && t === terminacionDe(verbo);
                const fallada = respondida && t === elegida && !buena;
                const marca = buena ? ' (respuesta correcta)' : fallada ? ' (tu respuesta, incorrecta)' : '';
                // Elegir respuesta es una ACCIÓN, no un conmutador: sin aria-pressed (testigo de la familia)
                return ( // a11y-ok: opción de respuesta, tests/familias/quizzes.spec.ts exige que no lo lleve
                  <button
                    type="button"
                    key={t}
                    className={`${styles.regTerminacion} ${buena ? styles.regTerminacionBuena : ''} ${fallada ? styles.regTerminacionMala : ''} ${respondida && !buena && !fallada ? styles.regTerminacionApagada : ''}`}
                    onClick={() => elegir(t)}
                    disabled={respondida}
                    aria-label={`${NOMBRE_TERMINACION[t]}${marca}`}
                  >
                    {IPA_TERMINACION[t]}
                    {buena && <span className={styles.regMarca} aria-hidden="true">✓</span>}
                    {fallada && <span className={styles.regMarca} aria-hidden="true">✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {respondida && (
            <>
              <div
                className={`${styles.regVeredicto} ${acierto ? styles.regVeredictoBien : styles.regVeredictoMal}`}
                role="alert"
                aria-live="polite"
              >
                <p className={styles.regVeredictoTitulo}>
                  {acierto
                    ? <><span aria-hidden="true">✅</span> ¡Bien!</>
                    : <><span aria-hidden="true">❌</span> No es así</>}
                </p>
                {practicaTanda === 'escribir' && (
                  <p className={styles.regVeredictoForma} lang="en">
                    {`${verbo.infinitivo} → ${[pasado, variante].filter(Boolean).join(' / ')}`}
                  </p>
                )}
                {practicaTanda === 'pronunciar' && (
                  <p className={styles.regVeredictoForma}>
                    <span lang="en">{pasado}</span>
                    <span>{' → la -ed suena '}</span>
                    <span className={styles.regNowrap}>{IPA_TERMINACION[terminacionDe(verbo)]}</span>
                  </p>
                )}
                <p className={styles.regVeredictoRegla}>
                  {practicaTanda === 'escribir' ? explicarOrtografia(verbo) : explicarPronunciacion(verbo)}
                </p>
              </div>
              <button type="button" ref={siguienteRef} className={styles.regBtnPrincipal} onClick={avanzar}>
                {esUltimo ? 'Ver mi nota de regulares' : 'Siguiente verbo →'}
              </button>
            </>
          )}
        </div>
      )}

      {fase === 'nota' && (
        <div className={styles.regCaja} ref={notaRef} tabIndex={-1}>
          <p className={styles.regNotaCifra}>{`${aciertos} de ${total}`}</p>
          <p className={styles.regNotaTexto}>
            {`${formatPercentage(total > 0 ? aciertos / total : 0, 0)} de acierto en «${PRACTICAS[practicaTanda].label}».`}
          </p>
          {fallados.length > 0 && (
            <p className={styles.regNotaTexto}>
              Para repasar: <span lang="en">{fallados.join(', ')}</span>.
            </p>
          )}
          <div className={styles.regFila}>
            <button type="button" className={styles.regBtnPrincipal} onClick={empezar}>
              Otra tanda de regulares
            </button>
            <button type="button" className={styles.regBtnSecundario} onClick={volverAlInicio}>
              Cambiar la práctica
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
