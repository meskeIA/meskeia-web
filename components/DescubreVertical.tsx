'use client';

/**
 * DescubreVertical — banda de descubrimiento cruzado meskeIA → portal vertical.
 *
 * Cuando una app del catálogo pertenece a un portal vertical (de momento solo
 * Stemum) y se está sirviendo desde meskeia.com, muestra una banda bajo el
 * bloque legal que invita a descubrir la disciplina correspondiente en el
 * portal especializado. Objetivo: captar al visitante que aterriza por Google
 * en una app suelta y llevarlo al vertical, donde hallará más apps del tema.
 *
 * Es 100% automático: se apoya en STEMUM_APP_DISCIPLINA, así que cubre todas
 * las apps del vertical sin editar página por página y se actualiza solo al
 * añadir apps a una disciplina.
 *
 * NO se muestra:
 *  - en apps que no pertenecen a ningún vertical (la mayoría del catálogo),
 *  - cuando la app ya se ve desde el propio dominio del vertical (stemum.com),
 *    donde el breadcrumb de MeskeiaLogo ya cumple esa función.
 *
 * Pendiente (siguiente iteración): generalizar a Cronicum y Gastronomía.
 */

import { usePathname } from 'next/navigation';
import { useStemumHost } from '@/lib/useStemumHost';
import {
  STEMUM_APP_DISCIPLINA,
  STEMUM_DISCIPLINAS,
  STEMUM_APPS_POR_DISCIPLINA,
} from '@/data/stemum';
import styles from './DescubreVertical.module.css';

export default function DescubreVertical() {
  const pathname = usePathname();
  const isStemum = useStemumHost();

  // En el propio portal el breadcrumb ya enlaza a la disciplina: no duplicar.
  if (isStemum) return null;

  const slug = (pathname ?? '').split('/').filter(Boolean)[0] ?? '';
  const disciplina = STEMUM_APP_DISCIPLINA[slug];
  if (!disciplina) return null; // la app no pertenece a Stemum

  const etiqueta = STEMUM_DISCIPLINAS[disciplina] ?? '';
  const otras = (STEMUM_APPS_POR_DISCIPLINA[disciplina] ?? 1) - 1;
  const cta =
    otras >= 1
      ? `Descubre ${otras} ${otras === 1 ? 'simulador' : 'simuladores'} más →`
      : 'Explora la disciplina →';

  return (
    <aside className={styles.banda} aria-label={`Descubre ${etiqueta} en Stemum`}>
      <a href={`https://stemum.com/${disciplina}/`} className={styles.enlace}>
        <span className={styles.icono} aria-hidden="true">🔬</span>
        <span className={styles.texto}>
          Esta herramienta forma parte de <strong>{etiqueta}</strong> en{' '}
          <strong>Stemum</strong>, el portal de ciencia interactiva de meskeIA.{' '}
          <span className={styles.cta}>{cta}</span>
        </span>
      </a>
    </aside>
  );
}
