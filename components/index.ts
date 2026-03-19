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

// Componente de última actualización
export { default as LastUpdated } from './LastUpdated';

// Componente de aviso legal (términos, privacidad, fecha, copyright)
export { default as LegalNotice } from './LegalNotice';

// Nuevos componentes de navegación
export { default as Sidebar } from './Sidebar';
export { default as SidebarMobile } from './SidebarMobile';
export { default as DailyApps } from './DailyApps';

// Banner de transparencia (localStorage)
export { default as TransparencyBanner } from './TransparencyBanner';

// Tarjeta de compartir slide-up (crecimiento orgánico)
export { default as ShareCard } from './ShareCard';
