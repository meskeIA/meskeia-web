import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo se Construye un Edificio - Fases, Oficios y Materiales | meskeIA',
  description: 'Descubre las 7 fases de construcción de un edificio residencial: cimentación, estructura, fachada, instalaciones y acabados. Oficios, materiales y plazos explicados visualmente.',
  keywords: 'construcción edificio, fases construcción, oficios construcción, materiales obra, licencia obra, cimentación, estructura, albañilería, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo se Construye un Edificio - Fases, Oficios y Materiales',
    description: 'Las 7 fases de construcción, 15+ oficios y los números reales de un edificio de 30 viviendas en España.',
    url: 'https://meskeia.com/visualizador-construccion-edificio',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cómo se Construye un Edificio - Fases, Oficios y Materiales',
    description: '7 fases, 15+ oficios, 2.500 toneladas de hormigón: todo lo que hay detrás de un edificio residencial.',
  },
  other: { 'application-name': 'Construcción Edificio meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo se Construye un Edificio',
  description: 'Explicador visual interactivo sobre la construcción de un edificio residencial de 30 viviendas en España: fases de obra, oficios involucrados, materiales y cantidades, tiempos y licencias necesarias.',
  url: 'https://meskeia.com/visualizador-construccion-edificio/',
  category: 'EducationalApplication',
  features: [
    'Timeline vertical con las 7 fases de construcción',
    '15+ oficios con su momento de entrada en la obra',
    'Materiales y cantidades reales de un edificio de 30 viviendas',
    'Desglose de tiempos y licencias: de la idea a las llaves',
    'Coste por m² en España',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
