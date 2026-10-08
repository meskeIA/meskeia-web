'use client';

import styles from './RelatedApps.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { withFrom } from '@/lib/trackingFrom';
import { useRelacionadas } from './RelacionadasContexto';

/**
 * Interfaz para una app relacionada
 */
export interface RelatedApp {
  url: string;
  icon: string;
  name: string;
  description: string;
}

/**
 * Props del componente RelatedApps
 */
interface RelatedAppsProps {
  /** Título de la sección (ej: "Más herramientas para estudiantes") */
  title?: string;
  /** Lista de apps relacionadas (máximo 4). Sin ella, las que pasa `ConRelacionadas` desde el layout */
  apps?: RelatedApp[];
  /** Icono del título (opcional) */
  icon?: string;
}

/**
 * Componente RelatedApps
 *
 * Muestra una sección con apps relacionadas al final de cada página.
 * Diseñado para ser discreto y no invasivo.
 *
 * @example
 * ```tsx
 * // Opción 1 (la de todas las apps): el layout.tsx envuelve {children} en
 * // <ConRelacionadas slug="calculadora-notas"> y la página pinta, sin prop:
 * <RelatedApps />
 * // ⚠️ Nunca getRelatedApps() en una página 'use client': manda al navegador el mapa
 * // de relacionadas de todo el catálogo (733 KB). Lo impide check:catalogo-cliente.
 *
 * // Opción 2: Definir manualmente
 * <RelatedApps
 *   title="Más herramientas financieras"
 *   icon="💰"
 *   apps={[
 *     { url: '/interes-compuesto/', icon: '📈', name: 'Interés Compuesto', description: 'Calcula el crecimiento de tu inversión' }
 *   ]}
 * />
 * ```
 */
export default function RelatedApps({ title = 'Apps relacionadas', apps: appsProp, icon = '🔗' }: RelatedAppsProps) {
  const pathname = usePathname();
  // Sin prop, las del contexto que rellena `ConRelacionadas` en el layout de la app
  const appsContexto = useRelacionadas();
  const apps = appsProp ?? appsContexto;

  // No renderizar si no hay apps o hay más de 4 (limitar a 4 máximo)
  if (!apps || apps.length === 0) return null;

  const displayApps = apps.slice(0, 4); // Máximo 4 apps

  // Slug de la app de origen para tracking de embudo.
  // Normaliza barras internas a guiones para que rutas dinámicas
  // (/visualizador-historia/historia-turismo/) coincidan con el formato
  // del campo `aplicacion` (visualizador-historia-historia-turismo).
  const originSlug =
    (pathname || '')
      .replace(/^\/|\/$/g, '')
      .split('?')[0]
      .replace(/\//g, '-') || 'home';

  /**
   * Añade #from=related-{origen} al href para medir el embudo de descubrimiento.
   * El AnalyticsTracker lee esta marca y la guarda en datos_adicionales.from.
   *
   * Va en el FRAGMENTO, no en un parámetro: así el enlace que ve Googlebot es la
   * URL limpia y puede seguirlo. Con `?from=` estos ~3.900 enlaces internos
   * apuntaban a URLs prohibidas en robots.txt. Ver lib/trackingFrom.ts.
   */
  const buildHref = (url: string): string => {
    if (url.includes('#')) return url;
    // Familias migradas a un dominio vertical (cronologías → cronicum.com): se
    // delega en withFrom, que las resuelve al dominio final con ?from=meskeia-*.
    // Sin esto, el enlace interno muere en el fetch RSC contra la CSP. Ver
    // lib/trackingFrom.ts.
    return withFrom(url, `related-${originSlug}`);
  };

  return (
    // data-hide-in-vertical: bajo un dominio vertical (html[data-brand], p.ej.
    // stemum.com o coquinum.com) esta sección se oculta por CSS. Las relaciones
    // están curadas para el contexto meskeIA y muchas apuntan fuera del catálogo
    // del portal; el descubrimiento dentro del vertical se hace por sus páginas de
    // categoría/disciplina. En meskeia.com se muestra con normalidad.
    <section className={styles.relatedApps} aria-label="Aplicaciones relacionadas" data-hide-in-vertical="">
      <h3 className={styles.title}>
        {/* Decorativo: el título va justo al lado y dice lo mismo. */}
        <span className={styles.titleIcon} aria-hidden="true">{icon}</span>
        {title}
      </h3>
      <div className={styles.grid}>
        {displayApps.map((app) => (
          <Link
            key={app.url}
            href={buildHref(app.url)}
            className={styles.card}
            aria-label={`Ir a ${app.name}`}
          >
            {/* El enlace ya se nombra con `aria-label={`Ir a ${app.name}`}`, así que el icono
                de la app es decoración. Con cuatro tarjetas por app y 1.152 apps, es el emoji
                suelto que más veces se leía en todo el catálogo. */}
            <span className={styles.cardIcon} aria-hidden="true">{app.icon}</span>
            <span className={styles.cardName}>{app.name}</span>
            <span className={styles.cardDesc}>{app.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
