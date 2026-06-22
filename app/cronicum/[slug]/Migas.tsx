import Link from 'next/link';
import type { Puerta } from '@/data/cronicum/puertas';
import styles from './Migas.module.css';

interface Props {
  puerta: Puerta | null;
  titulo: string;
}

/**
 * Migas de pan de una cronología: Cronicum / [Puerta] / [Cronología].
 * Se inyecta como `topSlot` en HistoriaInteractivo (marca='cronicum'), en el
 * lugar donde el modo meskeIA pone el logo. Lleva padding-top para librar la
 * cabecera fija de Cronicum (60px).
 */
export default function Migas({ puerta, titulo }: Props) {
  return (
    <nav className={styles.migas} aria-label="Migas de pan">
      <Link href="/" className={styles.link}>Cronicum</Link>
      <span className={styles.sep} aria-hidden="true">/</span>
      {puerta && (
        <>
          <Link href={`/${puerta.slug}`} className={styles.link}>{puerta.titulo}</Link>
          <span className={styles.sep} aria-hidden="true">/</span>
        </>
      )}
      <span className={styles.actual} aria-current="page">{titulo}</span>
    </nav>
  );
}
