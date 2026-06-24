import { Space_Grotesk } from 'next/font/google';
import StemumHeader from '@/components/StemumHeader';
import StemumFooter from '@/components/StemumFooter';
import { siteJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Stemum (geométrica, evoca ciencia/tecnología),
// cargada solo en esta ruta.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-stemum',
  display: 'swap',
});

// JSON-LD de sitio (Organización Stemum) — objeto interno, sin input externo.
// Se renderiza como texto del <script> (React 19 escapa el contenido de forma segura).
const siteScript = JSON.stringify(siteJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={spaceGrotesk.variable}>
      <script type="application/ld+json">{siteScript}</script>
      <StemumHeader />
      {children}
      <StemumFooter />
    </div>
  );
}
