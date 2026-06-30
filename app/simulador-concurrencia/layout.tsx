import { jsonLd, faqJsonLd } from './metadata';
export { metadata } from './metadata';

// JSON-LD generado a partir de contenido estático propio del proyecto (no hay
// input de usuario). Mismo patrón de inyección que el resto de apps de meskeIA.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
