import { jsonLd, faqJsonLd } from './metadata';

export { metadata } from './metadata';

// jsonLd y faqJsonLd son objetos generados internamente — no hay input externo ni usuario
const webAppScript = JSON.stringify(jsonLd);
const faqScript = JSON.stringify(faqJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: contenido JSON-LD generado internamente, sin input de usuario
        dangerouslySetInnerHTML={{ __html: webAppScript }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: contenido JSON-LD generado internamente, sin input de usuario
        dangerouslySetInnerHTML={{ __html: faqScript }}
      />
      {children}
    </>
  );
}
