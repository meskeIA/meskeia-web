import { jsonLd, faqJsonLd } from './metadata';

export { metadata } from './metadata';

// jsonLd y faqJsonLd son objetos internos generados por el propio código — no hay input externo
const webAppScript = JSON.stringify(jsonLd);
const faqScript = JSON.stringify(faqJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webAppScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqScript }} />
      {children}
    </>
  );
}
