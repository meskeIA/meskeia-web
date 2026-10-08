import { jsonLd } from './metadata';
import ConRelacionadas from '@/components/ConRelacionadas';
export { metadata } from './metadata';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ConRelacionadas slug="calculadora-receta-pan">{children}</ConRelacionadas>
    </>
  );
}
