import { CourseProvider } from './CourseContext';
import { jsonLd } from './metadata';
import ConRelacionadas from '@/components/ConRelacionadas';

export { metadata } from './metadata';

// jsonLd es un objeto interno generado por el propio código — no hay input externo
const webAppScript = JSON.stringify(jsonLd);

export default function CursoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CourseProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webAppScript }} />
      <ConRelacionadas slug="curso-emprendimiento">{children}</ConRelacionadas>
    </CourseProvider>
  );
}
