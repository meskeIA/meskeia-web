/**
 * Componente RegionBadge meskeIA
 *
 * Señaliza visualmente el ámbito geográfico de una app:
 * - 'es-only': La app aplica únicamente a España (fiscal, legal, normativo)
 * - 'es-data': Los DATOS son de España, pero el cálculo es universal
 * - 'global': App utilizable en cualquier país hispanohablante (no necesita badge,
 *             pero disponible si se quiere reforzar)
 *
 * Ubicación recomendada: justo debajo del hero, antes de LegalNotice.
 */

'use client';

import styles from './RegionBadge.module.css';

export type RegionVariant = 'es-only' | 'es-data' | 'global';

interface RegionBadgeProps {
  variant: RegionVariant;
  /** Texto personalizado opcional. Si no se especifica, usa el por defecto de la variante */
  text?: string;
}

const DEFAULTS: Record<RegionVariant, { icon: string; text: string; aria: string }> = {
  'es-only': {
    icon: '🇪🇸',
    text: 'Solo España: cálculos basados en normativa fiscal y legal española',
    aria: 'Aviso: esta herramienta aplica únicamente a España',
  },
  'es-data': {
    icon: '🇪🇸',
    text: 'Datos de referencia: España. La metodología es universal',
    aria: 'Aviso: los datos de referencia son de España',
  },
  'global': {
    icon: '🌎',
    text: 'Herramienta universal',
    aria: 'Herramienta utilizable en cualquier país hispanohablante',
  },
};

export default function RegionBadge({ variant, text }: RegionBadgeProps) {
  const def = DEFAULTS[variant];
  const finalText = text || def.text;

  return (
    <div
      className={`${styles.badge} ${styles[variant]}`}
      role="note"
      aria-label={def.aria}
    >
      <span className={styles.icon} aria-hidden="true">{def.icon}</span>
      <span className={styles.text}>{finalText}</span>
      {variant === 'es-only' && (
        <a
          href="https://delegum.com/datos-fiscales/"
          className={styles.fuente}
          title="Datos fiscales verificados de España en Delegum"
        >
          Fuente de los datos: Delegum →
        </a>
      )}
    </div>
  );
}
