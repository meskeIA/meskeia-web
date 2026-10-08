/**
 * Barrel export para componentes meskeIA
 *
 * Permite importar múltiples componentes desde un solo archivo:
 * import { NumberInput, ResultCard, EducationalSection } from '@/components';
 */

export { default as MeskeiaLogo } from './MeskeiaLogo';
export { default as Footer } from './Footer';
export { default as ThemeToggle } from './ThemeToggle';
export { default as AnalyticsTracker } from './AnalyticsTracker';
export { default as NumberInput } from './NumberInput';
export { default as ResultCard } from './ResultCard';
export { default as EducationalSection } from './EducationalSection';
export { default as TextToSpeech } from './TextToSpeech';
export { default as RelatedApps } from './RelatedApps';
export type { RelatedApp } from './RelatedApps';

// Componente de disclaimer legal
export { default as DisclaimerCard } from './DisclaimerCard';
export type { DisclaimerVariant, DisclaimerSeverity } from './DisclaimerCard';

// Referencia de datos normativos (complementa DisclaimerCard)
export { default as DataReference } from './DataReference';
export { default as AvisoTerritorioSinIva } from './AvisoTerritorioSinIva';

// Componente de última actualización
export { default as LastUpdated } from './LastUpdated';

// Componente de aviso legal (términos, privacidad, fecha, copyright)
export { default as LegalNotice } from './LegalNotice';

// ⚠️ Sidebar, SidebarMobile y DailyApps NO van en este barrel: importan el catálogo
// entero (`data/applications.ts`), y Turbopack funde el barrel en UN módulo, así que
// cualquier app que importara de aquí un NumberInput descargaba también el catálogo
// (692.214 B en 925 de 1.021 páginas, 08/10/2026). Solo los usa la portada, que los
// importa por su ruta.

// Banner de transparencia (localStorage)
export { default as TransparencyBanner } from './TransparencyBanner';

// Tarjeta de compartir slide-up (crecimiento orgánico)
export { default as ShareCard } from './ShareCard';

// Eco de cómo se ha leído una serie numérica pegada por el usuario
export { default as LecturaSerie } from './LecturaSerie';

// Badge geográfico (señaliza ámbito España-only / España-data / global)
export { default as RegionBadge } from './RegionBadge';
export type { RegionVariant } from './RegionBadge';
