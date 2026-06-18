import { jsonLd, faqJsonLd } from './metadata';

export { metadata } from './metadata';

const webAppScript = JSON.stringify(jsonLd);
const faqScript = JSON.stringify(faqJsonLd);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webAppScript }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqScript }} />
      {children}
    </>
  );
}
