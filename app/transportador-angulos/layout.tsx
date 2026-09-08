import { jsonLd } from './metadata';

export { metadata } from './metadata';

// jsonLd es un objeto interno generado por el propio código — no hay input externo.
// Lleva ya el @graph con WebApplication y FAQPage combinados (combineSchemas).
const schemaScript = JSON.stringify(jsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaScript }} />
      {children}
    </>
  );
}
