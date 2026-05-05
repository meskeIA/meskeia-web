import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Insectos del Jardín - Identifica plagas y aliados del huerto | meskeIA',
  description: '35 insectos del jardín y huerto: beneficiosos, polinizadores, perjudiciales y neutros. Identifica plagas, actúa con control biológico y protege tus aliados. Gratis y sin registro.',
  keywords: 'insectos jardín, plagas jardín, mariquita, pulgón, control biológico, insectos beneficiosos, polinizadores jardín, mosca blanca, crisopa, abeja, huerto ecológico, identificar insectos, insectos huerto España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Insectos del Jardín - Identifica plagas y aliados del huerto',
    description: '35 insectos del jardín: beneficiosos, polinizadores y perjudiciales. Ficha completa con qué hacer ante cada uno. Control biológico y jardinería ecológica.',
    url: 'https://meskeia.com/guia-insectos-jardin/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Insectos del Jardín - Plagas y aliados',
    description: '35 insectos del jardín: identifica si son beneficiosos o perjudiciales y qué hacer con cada uno. Jardinería ecológica y control biológico.',
  },
  other: { 'application-name': 'Guía de Insectos del Jardín meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Insectos del Jardín',
  description: 'Directorio interactivo de 35 insectos comunes del jardín y huerto: mariquitas, pulgones, crisopas, mariposas, trips, moscas blancas, abejorros y más. Incluye rol (beneficioso, perjudicial, polinizador, neutro), zonas del jardín donde aparecen, dieta, cómo identificarlos y qué acción tomar. Enfocado en jardinería ecológica y control biológico.',
  url: 'https://meskeia.com/guia-insectos-jardin/',
  category: 'EducationalApplication',
  features: [
    '35 insectos con ficha completa: rol, orden, tamaño, zona, actividad y dieta',
    'Filtro por rol: beneficioso, perjudicial, polinizador, neutro',
    'Filtro por zona del jardín: suelo, plantas, flores, frutos, madera, raíces',
    'Buscador por nombre común y nombre científico',
    'Acción recomendada para cada insecto (qué hacer como jardinero)',
    'Curiosidad entomológica por especie',
    'Enfoque en control biológico y jardinería ecológica',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
