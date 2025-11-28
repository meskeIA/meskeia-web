import { CourseProvider } from './CourseContext';
export { metadata } from './metadata';

export default function CursoNutrisaludLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CourseProvider>{children}</CourseProvider>;
}
