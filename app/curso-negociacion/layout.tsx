import { CourseProvider } from './CourseContext';
import { jsonLd, faqJsonLd } from './metadata';
import ConRelacionadas from '@/components/ConRelacionadas';

export { metadata } from './metadata';

export default function CursoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <CourseProvider><ConRelacionadas slug="curso-negociacion">{children}</ConRelacionadas></CourseProvider>
    </>
  );
}
