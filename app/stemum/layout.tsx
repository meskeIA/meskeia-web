import fuente from './fuentes/space-grotesk.module.css';
import StemumHeader from '@/components/StemumHeader';
import StemumFooter from '@/components/StemumFooter';
import { siteJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Stemum (geométrica, evoca ciencia/tecnología),
// cargada solo en esta ruta.
// Ficheros en ./fuentes/, generados por scripts/fuentes-locales.mjs: el build ya no va a Google.

// JSON-LD de sitio (Organización Stemum) — objeto interno, sin input externo.
// Se renderiza como texto del <script> (React 19 escapa el contenido de forma segura).
const siteScript = JSON.stringify(siteJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={fuente.variable}>
      <script type="application/ld+json">{siteScript}</script>
      <StemumHeader />
      {children}
      <StemumFooter />
    </div>
  );
}
