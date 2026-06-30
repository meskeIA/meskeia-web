import { jsonLd, faqJsonLd } from './metadata';
export { metadata } from './metadata';

// Inyección de JSON-LD a partir de contenido estático del proyecto (sin input de
// usuario, no sanitizable). Patrón idéntico al resto de apps de meskeIA.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
