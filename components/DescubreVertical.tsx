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
 *  - Stemum   → dos modos: (1) simulador del portal (STEMUM_APP_DISCIPLINA) →
 *               banner con nº de simuladores; (2) app STEM AFÍN no simulador
 *               (quiz/calculadora/tabla/clic-revelar, STEMUM_ADYACENTES) →
 *               banner que enlaza a su disciplina. Lista curada (sin señal
 *               autodeclarada); excluye medicina/fisiología.
 *  - Cronicum → cronologías en /visualizador-historia/<slug>, vía las puertas.
 *  - Delegum  → dos modos:
 *               (1) app curada en una puerta de Soluciones (getPuertaDeApp):
 *                   enlaza al ancla de su categoría.
 *               (2) app fiscal-España NO curada (APPS_REGION_ES, autogenerado
 *                   del marcador RegionBadge es-only/es-data): enlaza a la home
 *                   de Soluciones sin engordar la curaduría (ver
 *                   _private/archivo/DELEGUM-SOLUCIONES.md: fachada mínima, no exhaustiva).
 *
 * Es 100% automático (se apoya en los registros existentes; cubre el catálogo
 * del vertical sin editar página por página) y se inyecta una sola vez desde
 * LegalNotice.
 *
 * NO se muestra:
 *  - en apps que no pertenecen a ningún vertical (la mayoría del catálogo),
 *  - cuando la app ya se ve desde el dominio del vertical, donde el chrome de
 *    marca ya cumple esa función. En Stemum se detecta con useStemumHost y en
 *    Coquinum con useCoquinumHost; en Cronicum no hace falta (LegalNotice solo se
 *    renderiza en la variante meskeIA, marca === 'meskeia'); en Delegum tampoco
 *    (las apps fiscales solo viven en meskeia.com, no hay host-rewrite de la app).
 */

import { usePathname } from 'next/navigation';
import { useStemumHost } from '@/lib/useStemumHost';
import { useCoquinumHost } from '@/lib/useCoquinumHost';
import {
  STEMUM_APP_DISCIPLINA,
  STEMUM_DISCIPLINAS,
  STEMUM_APPS_POR_DISCIPLINA,
  STEMUM_MATERIAL_DISCIPLINA,
} from '@/data/stemum';
import {
  COQUINUM_APP_CATEGORIA,
  COQUINUM_CATEGORIAS,
  COQUINUM_APPS_POR_CATEGORIA,
} from '@/data/coquinum';
import { COQUINUM_ADYACENTES } from '@/data/coquinum-adyacentes';
import { getPuertaDeCronologia } from '@/data/cronicum/puertas';
import { getPuertaDeApp } from '@/data/delegum/soluciones';
import { APPS_REGION_ES } from '@/data/delegum/apps-region-es';
import { STEMUM_ADYACENTES } from '@/data/stemum-adyacentes';
import styles from './DescubreVertical.module.css';

interface Banda {
  vertical: 'stemum' | 'cronicum' | 'delegum' | 'coquinum';
  icono: string;
  intro: string; // "Esta herramienta forma parte de"
  etiqueta?: string; // disciplina o puerta (en negrita). Ausente → banda genérica.
  marca: string; // "Stemum" | "Cronicum" | "Delegum"
  descripcion: string; // "el portal de ciencia interactiva de meskeIA."
  href: string; // URL absoluta al portal
  cta: string; // "Descubre N … más →"
}

/** Pluraliza un sustantivo según el número de elementos restantes. */
function plural(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

/** Decide qué banda (si alguna) corresponde a la ruta actual. */
function resolverBanda(pathname: string, isStemum: boolean, isCoquinum: boolean): Banda | null {
  const segs = pathname.split('/').filter(Boolean);

  // ── Coquinum ── app gastro de primer nivel mapeada a una categoría del portal.
  const categoria = COQUINUM_APP_CATEGORIA[segs[0] ?? ''];
  if (categoria && !isCoquinum) {
    const otras = (COQUINUM_APPS_POR_CATEGORIA[categoria] ?? 1) - 1;
    return {
      vertical: 'coquinum',
      icono: '🍳',
      intro: 'Esta herramienta forma parte de',
      etiqueta: COQUINUM_CATEGORIAS[categoria] ?? '',
      marca: 'Coquinum',
      descripcion: 'el portal de cocina y gastronomía de meskeIA.',
      href: `https://coquinum.com/${categoria}/`,
      cta:
        otras >= 1
          ? `Descubre ${otras} ${plural(otras, 'herramienta', 'herramientas')} más →`
          : 'Explora la sección →',
    };
  }

  // ── Coquinum (afín) ── app de comida/nutrición que NO está en el portal pero
  // cuyo público se solapa con cocina y gastronomía. No se mete en Coquinum
  // (curaduría cerrada); solo enlaza a su categoría. Lista curada en
  // data/coquinum-adyacentes.ts (excluye frontera Salud/YMYL).
  const catAfin = COQUINUM_ADYACENTES[segs[0] ?? ''];
  if (catAfin && !isCoquinum) {
    const label = COQUINUM_CATEGORIAS[catAfin] ?? '';
    return {
      vertical: 'coquinum',
      icono: '🍳',
      intro: `Esta herramienta también encaja en ${label}.`,
      marca: 'Coquinum',
      descripcion: ', el portal de cocina y gastronomía de meskeIA.',
      href: `https://coquinum.com/${catAfin}/?from=meskeia`,
      cta: `Explora ${label} →`,
    };
  }

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

  // ── Stemum (material de apoyo) ── tabla de consulta que sí se sirve bajo
  // stemum.com pero no es simulador. Enlaza a su disciplina: quien viene a
  // buscar una fórmula es el público de esos simuladores.
  const discApoyo = STEMUM_MATERIAL_DISCIPLINA[segs[0] ?? ''];
  if (discApoyo && !isStemum) {
    const label = STEMUM_DISCIPLINAS[discApoyo] ?? '';
    return {
      vertical: 'stemum',
      icono: '🔬',
      intro: `Esta tabla es el material de apoyo de ${label} en`,
      marca: 'Stemum',
      descripcion: ', el portal de ciencia interactiva de meskeIA.',
      href: `https://stemum.com/${discApoyo}/?from=meskeia`,
      cta: `Explora ${label} →`,
    };
  }

  // ── Stemum (afín) ── app STEM que NO es simulador del portal (quiz/
  // calculadora/tabla/clic-revelar). No se mete en Stemum (curaduría de
  // simuladores); solo enlaza a su disciplina. Lista curada en
  // data/stemum-adyacentes.ts (sin señal autodeclarada, revisión periódica).
  const discAfin = STEMUM_ADYACENTES[segs[0] ?? ''];
  if (discAfin && !isStemum) {
    const label = STEMUM_DISCIPLINAS[discAfin] ?? '';
    return {
      vertical: 'stemum',
      icono: '🔬',
      intro: `Esta herramienta es de ${label}.`,
      marca: 'Stemum',
      descripcion: ', el portal de ciencia interactiva de meskeIA.',
      href: `https://stemum.com/${discAfin}/?from=meskeia`,
      cta: `Explora ${label} →`,
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

  // ── Delegum (genérico) ── app fiscal-España (RegionBadge es-only/es-data) que
  // NO está en la curaduría de Soluciones. Para no engordar el directorio
  // (decisión cerrada en _private/archivo/DELEGUM-SOLUCIONES.md: fachada mínima, no exhaustiva),
  // estas apps no se añaden a una puerta: solo invitan a descubrir el catálogo,
  // enlazando a la home de Soluciones. APPS_REGION_ES se autogenera en el build.
  if (APPS_REGION_ES.has(segs[0] ?? '')) {
    return {
      vertical: 'delegum',
      icono: '⚖️',
      intro: 'Esta herramienta aplica a España.',
      marca: 'Delegum',
      descripcion: ' reúne más herramientas de fiscalidad, derecho laboral y finanzas.',
      href: 'https://delegum.com/soluciones/?from=meskeia',
      cta: 'Descubre el catálogo →',
    };
  }

  return null;
}

export default function DescubreVertical() {
  const pathname = usePathname();
  const isStemum = useStemumHost();
  const isCoquinum = useCoquinumHost();

  const banda = resolverBanda(pathname ?? '', isStemum, isCoquinum);
  if (!banda) return null;

  return (
    <aside
      className={`${styles.banda} ${styles[banda.vertical]}`}
      aria-label={
        banda.etiqueta
          ? `Descubre ${banda.etiqueta} en ${banda.marca}`
          : `Descubre más herramientas en ${banda.marca}`
      }
    >
      <a href={banda.href} className={styles.enlace}>
        <span className={styles.icono} aria-hidden="true">{banda.icono}</span>
        <span className={styles.texto}>
          {banda.etiqueta ? (
            <>
              {banda.intro} <strong>{banda.etiqueta}</strong> en{' '}
              <strong>{banda.marca}</strong>, {banda.descripcion}{' '}
            </>
          ) : (
            <>
              {banda.intro} <strong>{banda.marca}</strong>{banda.descripcion}{' '}
            </>
          )}
          <span className={styles.cta}>{banda.cta}</span>
        </span>
      </a>
    </aside>
  );
}
