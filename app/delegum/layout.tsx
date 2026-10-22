import fuente from './fuentes/sora.module.css';
import DelegumHeader from '@/components/DelegumHeader';
import DelegumFooter from '@/components/DelegumFooter';
import { siteJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Delegum, cargada solo en esta ruta
// Ficheros en ./fuentes/, generados por scripts/fuentes-locales.mjs: el build ya no va a Google.

// JSON-LD de sitio (Organización Delegum) — objeto interno, sin input externo.
// El JSON-LD específico de cada página (WebApplication, Dataset, FAQPage) lo inyecta
// el layout de cada ruta, no este layout compartido.
const siteScript = JSON.stringify(siteJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={fuente.variable}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteScript }} />
      <DelegumHeader />
      {children}
      <DelegumFooter />
    </div>
  );
}
