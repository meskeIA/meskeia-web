import fuente from './fuentes/lora.module.css';
import CronicumHeader from '@/components/CronicumHeader';
import CronicumFooter from '@/components/CronicumFooter';
import { siteJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Cronicum (serif, evoca crónica/archivo),
// cargada solo en esta ruta.
// Ficheros en ./fuentes/, generados por scripts/fuentes-locales.mjs: el build ya no va a Google.

// JSON-LD de sitio (Organización Cronicum) — objeto interno, sin input externo.
// Se renderiza como texto del <script> (React 19), evitando dangerouslySetInnerHTML.
// El JSON-LD específico de cada página (WebApplication, FAQPage) lo inyecta
// el layout de cada ruta, no este layout compartido.
const siteScript = JSON.stringify(siteJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={fuente.variable}>
      <script type="application/ld+json">{siteScript}</script>
      <CronicumHeader />
      {children}
      <CronicumFooter />
    </div>
  );
}
