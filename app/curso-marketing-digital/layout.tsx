'use client';

import { CourseProvider } from './CourseContext';
import { jsonLd } from './metadata';

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
      <CourseProvider>{children}</CourseProvider>
    </>
  );
}
