import { Sora } from 'next/font/google';
import DelegumHeader from '@/components/DelegumHeader';
import DelegumFooter from '@/components/DelegumFooter';
import { siteJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Delegum, cargada solo en esta ruta
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

// JSON-LD de sitio (Organización Delegum) — objeto interno, sin input externo.
// El JSON-LD específico de cada página (WebApplication, Dataset, FAQPage) lo inyecta
// el layout de cada ruta, no este layout compartido.
const siteScript = JSON.stringify(siteJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={sora.variable}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteScript }} />
      <DelegumHeader />
      {children}
      <DelegumFooter />
    </div>
  );
}
