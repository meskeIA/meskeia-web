import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Árbol de la Vida Animal - De las Esponjas a los Mamíferos | meskeIA',
  description: 'Explora el árbol filogenético del reino animal: 12 grandes grupos, características evolutivas, números de especies y una línea temporal de 540 millones de años. Explicador visual interactivo.',
  keywords: 'árbol filogenético, reino animal, evolución, vertebrados, invertebrados, filogenia, clasificación animales, especies, explosión cámbrica, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Árbol de la Vida Animal - De las Esponjas a los Mamíferos',
    description: 'Explora los 12 grandes grupos del reino animal, sus características evolutivas y 540 millones de años de historia.',
    url: 'https://meskeia.com/visualizador-arbol-vida',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Árbol de la Vida Animal - Explicador Visual',
    description: 'De las esponjas a los mamíferos: el árbol filogenético del reino animal explicado visualmente.',
  },
  other: { 'application-name': 'Árbol de la Vida meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Árbol de la Vida Animal - De las Esponjas a los Mamíferos',
  description: 'Explicador visual interactivo sobre el árbol filogenético del reino animal. Desde el ancestro común eucariota hasta los mamíferos, pasando por 12 grandes grupos, características evolutivas clave, números de especies y una línea temporal de 540 millones de años.',
  url: 'https://meskeia.com/visualizador-arbol-vida/',
  category: 'EducationalApplication',
  features: [
    'Árbol filogenético interactivo con 12 grandes grupos animales',
    'Tabla visual de características evolutivas por grupo',
    'Gráfico de número de especies con datos reales',
    'Timeline de 540 millones de años de evolución animal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
