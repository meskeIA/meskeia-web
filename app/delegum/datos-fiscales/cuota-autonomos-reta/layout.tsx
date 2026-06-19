import { jsonLd, faqJsonLd } from './metadata';

export { metadata } from './metadata';

// jsonLd (Dataset) y faqJsonLd son objetos internos generados por el propio código — no hay input externo.
const datasetScript = JSON.stringify(jsonLd);
const faqScript = JSON.stringify(faqJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: datasetScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqScript }} />
      {children}
    </>
  );
}
