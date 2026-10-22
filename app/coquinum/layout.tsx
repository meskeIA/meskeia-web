import fuente from './fuentes/fraunces.module.css';
import CoquinumHeader from '@/components/CoquinumHeader';
import CoquinumFooter from '@/components/CoquinumFooter';
import { siteJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Coquinum (serif editorial, raíz latina, la misma
// del wordmark), cargada solo en esta ruta.
// Ficheros en ./fuentes/, generados por scripts/fuentes-locales.mjs: el build ya no va a Google.

// JSON-LD de sitio (Organización Coquinum) — objeto interno, sin input externo.
// Se renderiza como texto del <script> (React 19 escapa el contenido de forma segura).
const siteScript = JSON.stringify(siteJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={fuente.variable}>
      <script type="application/ld+json">{siteScript}</script>
      <CoquinumHeader />
      {children}
      <CoquinumFooter />
    </div>
  );
}
