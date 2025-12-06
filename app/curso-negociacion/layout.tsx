import { CourseProvider } from './CourseContext';
export { metadata } from './metadata';

export default function CursoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CourseProvider>{children}</CourseProvider>;
}
