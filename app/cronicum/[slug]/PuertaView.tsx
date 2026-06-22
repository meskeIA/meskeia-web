import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import type { Puerta } from '@/data/cronicum/puertas';
import styles from './Puerta.module.css';

export interface CronologiaItem {
  slug: string;
  titulo: string;
  subtitulo: string;
}

interface Props {
  puerta: Puerta;
  items: CronologiaItem[];
}

/**
 * Vista de una puerta de Cronicum: cabecera de la puerta + rejilla con las
 * cronologías que contiene. Cada tarjeta enlaza a la cronología limpia
 * (cronicum.com/<slug>). Server component (sin estado de cliente).
 */
export default function PuertaView({ puerta, items }: Props) {
  return (
    <>
      <AnalyticsTracker appName={`cronicum-${puerta.slug}`} />

      <main className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Migas de pan">
          <Link href="/" className={styles.breadcrumbLink}>Cronicum</Link>
          <span aria-hidden="true"> / </span>
          <span>{puerta.titulo}</span>
        </nav>

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">{puerta.icono}</span>
          <h1 className={styles.heroTitle}>{puerta.titulo}</h1>
          <p className={styles.heroDesc}>{puerta.descripcion}</p>
          <p className={styles.heroCount}>
            {items.length} {items.length === 1 ? 'cronología' : 'cronologías'} interactivas
          </p>
        </header>

        <section aria-label={`Cronologías de ${puerta.titulo}`}>
          <div className={styles.grid}>
            {items.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className={styles.card}>
                <h2 className={styles.cardTitulo}>{c.titulo}</h2>
                <p className={styles.cardDesc}>{c.subtitulo}</p>
                <span className={styles.cardCta}>Ver cronología →</span>
              </Link>
            ))}
          </div>
        </section>

        <p className={styles.volver}>
          <Link href="/" className={styles.volverLink}>← Volver a la portada de Cronicum</Link>
        </p>
      </main>
    </>
  );
}
