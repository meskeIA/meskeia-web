import { jsonLd, faqJsonLd } from './metadata';
export { metadata } from './metadata';

// Inyección de JSON-LD desde contenido estático del proyecto (no hay input de
// usuario). Mismo patrón que el resto de apps del catálogo meskeIA.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {children}
    </>
  );
}
