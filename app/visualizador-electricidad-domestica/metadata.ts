import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Electricidad Doméstica - Cuadro Eléctrico, Circuitos y Protecciones | meskeIA',
  description: 'Entiende tu instalación eléctrica: cuadro general, diferencial, magnetotérmicos, circuitos REBT, toma de tierra. Por qué salta el diferencial y qué hacer.',
  keywords: 'electricidad doméstica, cuadro eléctrico, diferencial, magnetotérmico, REBT, circuitos hogar, toma tierra, instalación eléctrica, ICP, protecciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Electricidad Doméstica - Cuadro Eléctrico y Protecciones',
    description: 'Entiende tu instalación eléctrica: cuadro general, diferencial, magnetotérmicos, circuitos obligatorios y protecciones.',
    url: 'https://meskeia.com/visualizador-electricidad-domestica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electricidad Doméstica - Cuadro Eléctrico y Protecciones',
    description: 'Por qué salta el diferencial, qué hace cada magnetotérmico y cómo funciona tu instalación eléctrica.',
  },
  other: { 'application-name': 'Electricidad Doméstica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Electricidad Doméstica - Cuadro Eléctrico y Protecciones',
  description: 'Explicador visual de la instalación eléctrica doméstica: cuadro general con ICP, diferencial y magnetotérmicos, los 5 circuitos obligatorios según REBT, protecciones contra fugas y sobrecargas, y datos curiosos sobre electricidad en España.',
  url: 'https://meskeia.com/visualizador-electricidad-domestica/',
  category: 'EducationalApplication',
  features: [
    'Diagrama SVG interactivo del cuadro eléctrico',
    'Componentes clickables: ICP, diferencial, magnetotérmicos',
    'Los 5 circuitos obligatorios según REBT',
    'Animación simplificada de corriente normal vs fuga a tierra',
    'Colores de cables según normativa (marrón, azul, verde-amarillo)',
    'Datos de consumo y potencia en España',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
