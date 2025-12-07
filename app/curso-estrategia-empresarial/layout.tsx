'use client';

import { CourseProvider } from './CourseContext';

export default function CursoEstrategiaEmpresarialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CourseProvider>{children}</CourseProvider>;
}
