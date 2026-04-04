import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Mundo en 100 Personas - Estadísticas Globales Visuales | meskeIA',
  description: 'Si el mundo fuera un pueblo de 100 habitantes: cuántos tendrían agua potable, smartphone, educación universitaria. Visualización interactiva con datos reales.',
  keywords: 'mundo 100 personas, estadísticas globales, desigualdad mundial, agua potable, acceso internet, educación mundial, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Mundo en 100 Personas',
    description: 'Si el mundo fuera un pueblo de 100 habitantes. Estadísticas que sorprenden.',
    url: 'https://meskeia.com/visualizador-mundo-100-personas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Mundo en 100 Personas',
    description: 'El planeta reducido a 100 personas. ¿Cuántas tendrían agua potable?',
  },
  other: { 'application-name': 'Mundo 100 Personas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Mundo en 100 Personas',
  description: 'Explicador visual que reduce la población mundial a 100 personas para hacer comprensibles las estadísticas globales: acceso a agua, educación, tecnología, riqueza, salud y más.',
  url: 'https://meskeia.com/visualizador-mundo-100-personas/',
  features: [
    'Mundo reducido a 100 personas con datos reales',
    '8 categorías: geografía, idiomas, agua, educación, tecnología, riqueza, salud, alimentación',
    'Barras de personas visuales e interactivas',
    'Fuentes: ONU, Banco Mundial, UNESCO, OMS',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
