'use client';

import { CourseProvider } from './CourseContext';

export default function CursoMarketingDigitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CourseProvider>{children}</CourseProvider>;
}
