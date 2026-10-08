import { jsonLd, faqJsonLd } from './metadata';
import ConRelacionadas from '@/components/ConRelacionadas';

export { metadata } from './metadata';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ConRelacionadas slug="guia-cocteles">{children}</ConRelacionadas>
    </>
  );
}
