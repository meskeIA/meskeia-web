import { CourseProvider } from './CourseContext';
import { jsonLd, faqJsonLd } from './metadata';

export { metadata } from './metadata';

export default function CursoMarketingDigitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <CourseProvider>{children}</CourseProvider>
    </>
  );
}
