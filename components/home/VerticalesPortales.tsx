'use client';

/**
 * VerticalesPortales — "constelación" de portales de marca propia en la home.
 *
 * Segunda fila de cards bajo "Apps del día": presenta los 4 verticales
 * (Delegum, Cronicum, Stemum, Coquinum) como portales especializados que forman
 * parte de meskeIA. Construye top-of-mind de marca-paraguas y da equity de enlace
 * interno a las homes de los portales (señal de "puerta de entrada" para GSC).
 *
 * Cards más bajas que las de "Apps del día": favicon + marca + descripción breve.
 * Cada una con la paleta de su marca. Clic → dominio del portal (con ?from).
 */

import { VERTICALES } from '@/data/verticales';
import styles from './VerticalesPortales.module.css';

export default function VerticalesPortales() {
  return (
    <section className={styles.section} aria-labelledby="portales-titulo">
      <div className={styles.header}>
        <h2 id="portales-titulo" className={styles.title}>
          <span aria-hidden="true">🛰️</span> Portales especializados de meskeIA
        </h2>
        <span className={styles.caption}>4 webs de marca propia</span>
      </div>

      <div className={styles.grid}>
        {VERTICALES.map((v) => (
          <a
            key={v.id}
            href={v.url}
            className={`${styles.card} ${styles[v.id]}`}
            aria-label={`${v.marca} — ${v.descripcion}`}
          >
            <img
              src={v.favicon}
              alt=""
              width={36}
              height={36}
              className={styles.favicon}
              loading="lazy"
            />
            <span className={styles.cardText}>
              <span className={styles.marca}>{v.marca}</span>
              <span className={styles.desc}>{v.descripcion}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
