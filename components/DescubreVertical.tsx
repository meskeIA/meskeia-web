'use client';

/**
 * DescubreVertical — banda de descubrimiento cruzado meskeIA → portal vertical.
 *
 * Cuando una app del catálogo pertenece a un portal vertical y se está sirviendo
 * desde meskeia.com, muestra bajo el bloque legal una banda que invita a
 * descubrir la sección correspondiente en el portal especializado. Objetivo:
 * captar al visitante que aterriza por Google en una app/cronología suelta y
 * llevarlo al vertical, donde hallará más contenido del mismo tema.
 *
 * Verticales soportados:
 *  - Stemum   → apps STEM de primer nivel, vía STEMUM_APP_DISCIPLINA.
 *  - Cronicum → cronologías en /visualizador-historia/<slug>, vía las puertas.
 *  - Delegum  → apps fiscales/laborales incluidas en las puertas de Soluciones,
 *               vía getPuertaDeApp. Enlaza al ancla de la categoría.
 *
 * Es 100% automático (se apoya en los registros existentes; cubre el catálogo
 * del vertical sin editar página por página) y se inyecta una sola vez desde
 * LegalNotice.
 *
 * NO se muestra:
 *  - en apps que no pertenecen a ningún vertical (la mayoría del catálogo),
 *  - cuando la app ya se ve desde el dominio del vertical, donde el chrome de
 *    marca ya cumple esa función. En Stemum se detecta con useStemumHost; en
 *    Cronicum no hace falta (LegalNotice solo se renderiza en la variante
 *    meskeIA, marca === 'meskeia'); en Delegum tampoco (las apps fiscales solo
 *    viven en meskeia.com, no hay host-rewrite de la app).
 *
 * Pendiente (siguiente iteración): añadir Gastronomía cuando exista el portal.
 */

import { usePathname } from 'next/navigation';
import { useStemumHost } from '@/lib/useStemumHost';
import {
  STEMUM_APP_DISCIPLINA,
  STEMUM_DISCIPLINAS,
  STEMUM_APPS_POR_DISCIPLINA,
} from '@/data/stemum';
import { getPuertaDeCronologia } from '@/data/cronicum/puertas';
import { getPuertaDeApp } from '@/data/delegum/soluciones';
import styles from './DescubreVertical.module.css';

interface Banda {
  vertical: 'stemum' | 'cronicum' | 'delegum';
  icono: string;
  intro: string; // "Esta herramienta forma parte de"
  etiqueta: string; // disciplina o puerta (en negrita)
  marca: string; // "Stemum" | "Cronicum"
  descripcion: string; // "el portal de ciencia interactiva de meskeIA."
  href: string; // URL absoluta al portal
  cta: string; // "Descubre N … más →"
}

/** Pluraliza un sustantivo según el número de elementos restantes. */
function plural(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

/** Decide qué banda (si alguna) corresponde a la ruta actual. */
function resolverBanda(pathname: string, isStemum: boolean): Banda | null {
  const segs = pathname.split('/').filter(Boolean);

  // ── Stemum ── app STEM de primer nivel mapeada a una disciplina.
  const disciplina = STEMUM_APP_DISCIPLINA[segs[0] ?? ''];
  if (disciplina && !isStemum) {
    const otras = (STEMUM_APPS_POR_DISCIPLINA[disciplina] ?? 1) - 1;
    return {
      vertical: 'stemum',
      icono: '🔬',
      intro: 'Esta herramienta forma parte de',
      etiqueta: STEMUM_DISCIPLINAS[disciplina] ?? '',
      marca: 'Stemum',
      descripcion: 'el portal de ciencia interactiva de meskeIA.',
      href: `https://stemum.com/${disciplina}/`,
      cta:
        otras >= 1
          ? `Descubre ${otras} ${plural(otras, 'simulador', 'simuladores')} más →`
          : 'Explora la disciplina →',
    };
  }

  // ── Cronicum ── cronología servida en /visualizador-historia/<slug>.
  if (segs[0] === 'visualizador-historia' && segs[1]) {
    const puerta = getPuertaDeCronologia(segs[1]);
    if (puerta) {
      const otras = puerta.slugs.length - 1;
      return {
        vertical: 'cronicum',
        icono: '📜',
        intro: 'Esta cronología forma parte de',
        etiqueta: puerta.titulo,
        marca: 'Cronicum',
        descripcion: 'el portal de historia interactiva de meskeIA.',
        href: `https://cronicum.com/${puerta.slug}/`,
        cta:
          otras >= 1
            ? `Descubre ${otras} ${plural(otras, 'cronología', 'cronologías')} más →`
            : 'Explora esta sección →',
      };
    }
  }

  // ── Delegum ── app fiscal/laboral incluida en alguna puerta de Soluciones.
  // Las apps fiscales viven solo en meskeia.com (Delegum enlaza en absoluto con
  // ?from=delegum), así que no hay caso "vista desde delegum.com": sin hook de
  // host. Enlazamos al ancla de su categoría en la página Soluciones.
  const puertaDelegum = getPuertaDeApp(segs[0] ?? '');
  if (puertaDelegum) {
    const otras = puertaDelegum.apps.length - 1;
    return {
      vertical: 'delegum',
      icono: '⚖️',
      intro: 'Esta herramienta forma parte de',
      etiqueta: puertaDelegum.titulo,
      marca: 'Delegum',
      descripcion: 'el portal de fiscalidad, derecho laboral y finanzas de meskeIA.',
      href: `https://delegum.com/soluciones/?from=meskeia#${puertaDelegum.id}`,
      cta:
        otras >= 1
          ? `Descubre ${otras} ${plural(otras, 'herramienta', 'herramientas')} más →`
          : 'Explora esta categoría →',
    };
  }

  return null;
}

export default function DescubreVertical() {
  const pathname = usePathname();
  const isStemum = useStemumHost();

  const banda = resolverBanda(pathname ?? '', isStemum);
  if (!banda) return null;

  return (
    <aside
      className={`${styles.banda} ${styles[banda.vertical]}`}
      aria-label={`Descubre ${banda.etiqueta} en ${banda.marca}`}
    >
      <a href={banda.href} className={styles.enlace}>
        <span className={styles.icono} aria-hidden="true">{banda.icono}</span>
        <span className={styles.texto}>
          {banda.intro} <strong>{banda.etiqueta}</strong> en{' '}
          <strong>{banda.marca}</strong>, {banda.descripcion}{' '}
          <span className={styles.cta}>{banda.cta}</span>
        </span>
      </a>
    </aside>
  );
}
