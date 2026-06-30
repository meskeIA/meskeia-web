import { jsonLd, faqJsonLd } from './metadata';
export { metadata } from './metadata';

// JSON-LD a partir de contenido estático propio (sin entrada de usuario). Patrón
// de inyección común a todas las apps del catálogo meskeIA.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
