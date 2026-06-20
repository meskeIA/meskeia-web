import Link from 'next/link';
import { getRelacionadas } from './fichas';
import styles from './Ficha.module.css';

/**
 * Bloque de enlazado interno al pie de cada ficha de Datos Fiscales:
 *  - 2-4 fichas relacionadas del mismo clúster temático.
 *  - vuelta al índice de datos fiscales + cruce a Calculadoras.
 *
 * Convierte las fichas (antes hojas sueltas que solo enlazaban a meskeIA) en un
 * clúster temático enlazado, reforzando rastreo, autoridad temática y descubrimiento.
 */
export default function FichasRelacionadas({ slug }: { slug: string }) {
  const relacionadas = getRelacionadas(slug);
  if (relacionadas.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Fichas relacionadas</h2>
      <div className={styles.relacionadasGrid}>
        {relacionadas.map((f) => (
          <Link key={f.slug} href={`/datos-fiscales/${f.slug}`} className={styles.relacionadaCard}>
            <span className={styles.relacionadaIcon} aria-hidden="true">{f.icon}</span>
            <span className={styles.relacionadaTitulo}>{f.titulo}</span>
          </Link>
        ))}
      </div>
      <p className={styles.volverIndice}>
        <Link href="/datos-fiscales" className={styles.link}>← Todas las fichas de datos fiscales</Link>
        {' · '}
        <Link href="/calculadoras" className={styles.link}>Ir a las calculadoras →</Link>
      </p>
    </section>
  );
}
