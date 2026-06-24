'use client';

import styles from './RelatedApps.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  /** Lista de apps relacionadas (máximo 4 recomendado) */
  apps: RelatedApp[];
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
 * import { RelatedApps, getRelatedApps } from '@/components';
 *
 * // Opción 1: Usar helper automático
 * const apps = getRelatedApps('calculadora-notas');
 * {apps.length > 0 && <RelatedApps apps={apps} title="Herramientas para estudiantes" />}
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
export default function RelatedApps({ title = 'Apps relacionadas', apps, icon = '🔗' }: RelatedAppsProps) {
  const pathname = usePathname();

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
   * Añade ?from=related-{origen} al href para medir el embudo de descubrimiento.
   * El AnalyticsTracker lee este parámetro y lo guarda en datos_adicionales.from.
   */
  const buildHref = (url: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}from=related-${originSlug}`;
  };

  return (
    // data-hide-on-stemum: bajo stemum.com (html[data-brand=stemum]) esta sección
    // se oculta por CSS. Las relaciones están curadas para el contexto meskeIA y
    // muchas apuntan fuera del catálogo Stemum; el descubrimiento en Stemum se hace
    // por sus páginas de disciplina. En meskeia.com se muestra con normalidad.
    <section className={styles.relatedApps} aria-label="Aplicaciones relacionadas" data-hide-on-stemum="">
      <h3 className={styles.title}>
        <span className={styles.titleIcon}>{icon}</span>
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
            <span className={styles.cardIcon}>{app.icon}</span>
            <span className={styles.cardName}>{app.name}</span>
            <span className={styles.cardDesc}>{app.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
