import { CourseProvider } from './CourseContext';
import { metadata as pageMetadata } from './metadata';

export const metadata = pageMetadata;

export default function CursoDecisionesInversionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CourseProvider>
      {children}
    </CourseProvider>
  );
}
