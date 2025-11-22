import { Metadata } from 'next';
import { generateGuideMetadata } from '@/lib/metadata';
import { guidesByCategory } from '@/data/guides';

// Mapeo de categorías para URLs sin tildes a nombres con tildes
const CATEGORY_URL_TO_NAME: { [key: string]: string } = {
  'calculadoras-y-utilidades': 'Calculadoras y Utilidades',
  'campus-digital': 'Campus Digital',
  'creatividad-y-diseno': 'Creatividad y Diseño',
  'emprendimiento-y-negocios': 'Emprendimiento y Negocios',
  'finanzas-y-fiscalidad': 'Finanzas y Fiscalidad',
  'fisica-y-quimica': 'Física y Química',
  'herramientas-de-productividad': 'Herramientas de Productividad',
  'herramientas-web-y-tecnologia': 'Herramientas Web y Tecnología',
  'juegos-y-entretenimiento': 'Juegos y Entretenimiento',
  'matematicas-y-estadistica': 'Matemáticas y Estadística',
  'salud-y-bienestar': 'Salud & Bienestar',
  'texto-y-documentos': 'Texto y Documentos',
};

type Props = {
  params: { categoria: string; slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, slug } = params;

  // Obtener el nombre de la categoría con tildes
  const categoryName = CATEGORY_URL_TO_NAME[categoria];

  if (!categoryName) {
    return generateGuideMetadata('Guía no encontrada', slug, 'General');
  }

  // Buscar la guía en los datos
  const guides = guidesByCategory[categoryName] || [];
  const guide = guides.find(g => g.slug === slug);

  if (!guide) {
    return generateGuideMetadata('Guía no encontrada', slug, categoryName);
  }

  // Generar metadata específica para esta guía
  return generateGuideMetadata(guide.title, slug, categoryName);
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
