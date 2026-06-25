import { Fraunces } from 'next/font/google';
import CoquinumHeader from '@/components/CoquinumHeader';
import CoquinumFooter from '@/components/CoquinumFooter';
import { siteJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Coquinum (serif editorial, raíz latina, la misma
// del wordmark), cargada solo en esta ruta.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-coquinum',
  display: 'swap',
});

// JSON-LD de sitio (Organización Coquinum) — objeto interno, sin input externo.
// Se renderiza como texto del <script> (React 19 escapa el contenido de forma segura).
const siteScript = JSON.stringify(siteJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={fraunces.variable}>
      <script type="application/ld+json">{siteScript}</script>
      <CoquinumHeader />
      {children}
      <CoquinumFooter />
    </div>
  );
}
