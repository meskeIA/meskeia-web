'use client';

import { useState } from 'react';
import styles from './Luxometro.module.css';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { ANGULOS_TIPICOS, desdeLumenes, desdeLux } from '@/lib/calculadoras/luxLumenes';

/**
 * «De lux a lúmenes y candelas» (S0270, 12/11/2026). Atiende las consultas de lúmenes que
 * llegaban al luxómetro sin respuesta, empezando por decir lo que el móvil NO hace: medir
 * lúmenes. Lo que sí hace es pasar de una lectura en lux a la luz total de la fuente, y al
 * revés, con la distancia, el ángulo del haz y el modelo a la vista. El cálculo vive en
 * `lib/calculadoras/luxLumenes.ts`, con sus casos a mano.
 *
 * No depende de la cámara: los lux se teclean (de un luxómetro, o de la lectura calibrada del
 * medidor con el botón). Con la cámara sin calibrar no hay lux que convertir, y la calibración
 * solo vale para la escena en que se hizo, así que el medidor no se enchufa aquí solo.
 */

type Modo = 'desde-lux' | 'desde-lumenes';

interface Props {
  /** Lectura del medidor en lux, solo si está calibrado. `null` si no hay lux que ofrecer. */
  luxMedidor: number | null;
}

/** Decimales según el tamaño, para no escribir «0 cd» de una vela ni «25.464,79 lm». */
function cifra(n: number): string {
  const decimales = n >= 100 ? 0 : n >= 10 ? 1 : 2;
  return formatNumber(n, decimales);
}

export default function ConversorLumenes({ luxMedidor }: Props) {
  const [modo, setModo] = useState<Modo>('desde-lux');
  const [luxTexto, setLuxTexto] = useState('');
  const [lumenesTexto, setLumenesTexto] = useState('');
  const [distanciaTexto, setDistanciaTexto] = useState('1');
  const [anguloTexto, setAnguloTexto] = useState('60');

  const distancia = parseSpanishNumber(distanciaTexto);
  const angulo = parseSpanishNumber(anguloTexto);
  const textoFuente = modo === 'desde-lux' ? luxTexto : lumenesTexto;
  const valorFuente = parseSpanishNumber(textoFuente);

  const vacio = textoFuente.trim() === '' || distanciaTexto.trim() === '' || anguloTexto.trim() === '';
  const resultado = vacio
    ? null
    : modo === 'desde-lux'
      ? desdeLux(valorFuente, distancia, angulo)
      : desdeLumenes(valorFuente, distancia, angulo);

  return (
    <section className={styles.lumenesPanel} aria-labelledby="titulo-lumenes">
      <h2 id="titulo-lumenes" className={styles.sectionTitle}>
        <span aria-hidden="true">🔦</span> De lux a lúmenes y candelas
      </h2>
      <p className={styles.lumenesIntro}>
        <strong>El móvil no mide lúmenes</strong>, ni con la cámara ni con el sensor: el lumen es
        la luz <em>total</em> que emite una bombilla o una linterna, y un luxómetro solo ve la que
        cae en un punto. Lo que sí se puede hacer es pasar de una cosa a la otra sabiendo la
        distancia y el ángulo del haz. Funciona con los lux de cualquier luxómetro, o con los de
        este si lo has calibrado.
      </p>

      <div className={styles.lumenesModos} role="group" aria-label="Qué dato tienes">
        <button
          type="button"
          className={`${styles.lumenesModo} ${modo === 'desde-lux' ? styles.lumenesModoActivo : ''}`}
          aria-pressed={modo === 'desde-lux'}
          onClick={() => setModo('desde-lux')}
        >
          Tengo los lux, quiero los lúmenes
        </button>
        <button
          type="button"
          className={`${styles.lumenesModo} ${modo === 'desde-lumenes' ? styles.lumenesModoActivo : ''}`}
          aria-pressed={modo === 'desde-lumenes'}
          onClick={() => setModo('desde-lumenes')}
        >
          Tengo los lúmenes, quiero los lux
        </button>
      </div>

      <div className={styles.lumenesCampos}>
        {modo === 'desde-lux' ? (
          <div className={styles.lumenesCampo} key="campo-lux">
            <label htmlFor="lumenes-lux" className={styles.calibrationLabel}>
              Lux medidos en el centro del haz
            </label>
            {/* type="text" + inputMode: en type="number" el navegador normaliza «1,5» a «1.5». */}
            <input
              id="lumenes-lux"
              type="text"
              inputMode="decimal"
              className={styles.calibrationInput}
              value={luxTexto}
              onChange={(e) => setLuxTexto(e.target.value)}
              placeholder="Por ejemplo, 250"
            />
            {luxMedidor !== null && (
              <button
                type="button"
                className={styles.lumenesUsarLectura}
                onClick={() => setLuxTexto(String(luxMedidor))}
              >
                Usar la lectura del medidor ({formatNumber(luxMedidor, 0)} lux)
              </button>
            )}
          </div>
        ) : (
          <div className={styles.lumenesCampo} key="campo-lumenes">
            <label htmlFor="lumenes-lm" className={styles.calibrationLabel}>
              Lúmenes de la fuente (vienen en el envase)
            </label>
            <input
              id="lumenes-lm"
              type="text"
              inputMode="decimal"
              className={styles.calibrationInput}
              value={lumenesTexto}
              onChange={(e) => setLumenesTexto(e.target.value)}
              placeholder="Por ejemplo, 800"
            />
          </div>
        )}

        <div className={styles.lumenesCampo}>
          <label htmlFor="lumenes-distancia" className={styles.calibrationLabel}>
            Distancia entre la fuente y el punto (metros)
          </label>
          <input
            id="lumenes-distancia"
            type="text"
            inputMode="decimal"
            className={styles.calibrationInput}
            value={distanciaTexto}
            onChange={(e) => setDistanciaTexto(e.target.value)}
          />
        </div>

        <div className={styles.lumenesCampo}>
          <label htmlFor="lumenes-angulo" className={styles.calibrationLabel}>
            Ángulo del haz (grados, el total de lado a lado)
          </label>
          <input
            id="lumenes-angulo"
            type="text"
            inputMode="decimal"
            className={styles.calibrationInput}
            value={anguloTexto}
            onChange={(e) => setAnguloTexto(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.lumenesAngulos} role="group" aria-label="Ángulos de haz típicos">
        {ANGULOS_TIPICOS.map((a) => (
          <button
            type="button"
            key={a.grados}
            className={`${styles.lumenesAngulo} ${angulo === a.grados ? styles.lumenesAnguloActivo : ''}`}
            aria-pressed={angulo === a.grados}
            onClick={() => setAnguloTexto(String(a.grados))}
          >
            {a.etiqueta}
          </button>
        ))}
      </div>

      <div className={styles.lumenesResultado} role="status" aria-live="polite" aria-atomic="true">
        {resultado === null && (
          <p className={styles.lumenesEspera} key="espera">
            Escribe {modo === 'desde-lux' ? <span key="t-lux">los lux</span> : <span key="t-lm">los lúmenes</span>} para ver el resultado.
          </p>
        )}
        {resultado !== null && !resultado.ok && (
          <p className={styles.lumenesError} key="error">
            {resultado.error}
          </p>
        )}
        {resultado !== null && resultado.ok && (
          <div className={styles.lumenesTarjetas} key="tarjetas">
            <div className={styles.lumenesTarjeta}>
              <span className={styles.lumenesEtiqueta}>Intensidad en el eje</span>
              <span className={styles.lumenesValor}>{cifra(resultado.candelas)} cd</span>
            </div>
            {modo === 'desde-lux' ? (
              <div className={styles.lumenesTarjeta} key="r-lm">
                <span className={styles.lumenesEtiqueta}>Luz total de la fuente</span>
                <span className={styles.lumenesValor}>≈ {cifra(resultado.lumenes)} lm</span>
              </div>
            ) : (
              <div className={styles.lumenesTarjeta} key="r-lx">
                <span className={styles.lumenesEtiqueta}>Lux en el centro, a esa distancia</span>
                <span className={styles.lumenesValor}>≈ {cifra(resultado.lux)} lx</span>
              </div>
            )}
            <div className={styles.lumenesTarjeta}>
              <span className={styles.lumenesEtiqueta}>Alcance tipo linterna (hasta 0,25 lx)</span>
              <span className={styles.lumenesValor}>{cifra(resultado.alcanceFl1)} m</span>
            </div>
          </div>
        )}
      </div>

      {/*
        El modelo va a la vista y no plegado: es lo que separa una aproximación honesta de una
        cifra que parece medida. Los dos supuestos que más mueven el resultado son el reparto
        dentro del haz y la distancia mínima.
      */}
      <div className={styles.avisoEscala} role="note">
        <strong><span aria-hidden="true">📐</span> Es una aproximación, no una medida.</strong>{' '}
        Intensidad = lux × distancia²; lúmenes = intensidad × ángulo sólido del haz. Supone que
        la luz se reparte igual dentro del haz y que fuera no hay nada. Un haz real se difumina
        en el borde y deja luz fuera, así que los lúmenes reales suelen salir algo más altos (en
        un haz estrecho, hasta un 40 % más). Mide en el centro del haz y a una distancia de al
        menos cinco veces el tamaño de la fuente; más cerca, la bombilla no se comporta como un
        punto. El alcance es el del estándar de linternas ANSI/PLATO FL1: dónde la luz cae a la
        de una noche de luna llena.
      </div>
    </section>
  );
}
