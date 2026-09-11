import { jsonLd } from './metadata';

export { metadata } from './metadata';

// `jsonLd` ya combina el WebApplication y el FAQPage en un único `@graph` (combineSchemas),
// así que aquí basta con un script: no hay un `faqJsonLd` suelto que inyectar.
//
// El contenido es un objeto literal definido en `./metadata` y serializado aquí: no hay input
// del usuario ni dato remoto en ninguna parte de la cadena, que es la condición bajo la que
// este patrón es seguro. Es el mismo de `templates/app-base/layout.template.ts`.
const schemaScript = JSON.stringify(jsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaScript }} />
      {children}
    </>
  );
}
