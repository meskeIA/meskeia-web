import { Sora } from 'next/font/google';
import { jsonLd, faqJsonLd } from './metadata';

export { metadata } from './metadata';

// Tipografía oficial de la marca Delegum, cargada solo en esta ruta
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

// jsonLd (Dataset) y faqJsonLd son objetos internos generados por el propio código — no hay input externo
const datasetScript = JSON.stringify(jsonLd);
const faqScript = JSON.stringify(faqJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={sora.variable}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: datasetScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqScript }} />
      {children}
    </div>
  );
}
