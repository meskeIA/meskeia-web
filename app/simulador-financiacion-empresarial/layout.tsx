import type { ReactNode } from 'react';
import { jsonLd, faqJsonLd } from './metadata';

export { metadata } from './metadata';

// JSON-LD estructurado para SEO. El contenido proviene de generateWebAppSchema (lib/schema-templates.ts)
// y faqJsonLd definidos en metadata.ts. Son objetos estáticos propios, no input de usuario.
const webAppScript = JSON.stringify(jsonLd);
const faqScript = JSON.stringify(faqJsonLd);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webAppScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqScript }} />
      {children}
    </>
  );
}
