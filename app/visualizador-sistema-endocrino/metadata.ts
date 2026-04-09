import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Endocrino - Glándulas, Hormonas y Feedback | meskeIA',
  description: 'Glándulas endocrinas clickables, 10 hormonas clave, feedback negativo interactivo y el eje del estrés HPA. Explicador visual.',
  keywords: 'sistema endocrino, hormonas, glandulas, insulina, cortisol, tiroides, feedback negativo, hipofisis, pancreas, suprarrenales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Endocrino - Glándulas, Hormonas y Feedback',
    description: 'Glándulas, hormonas y feedback negativo explicados visualmente.',
    url: 'https://meskeia.com/visualizador-sistema-endocrino',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Sistema Endocrino - Explicador Visual',
    description: 'De la insulina al cortisol: el sistema endocrino paso a paso.',
  },
  other: { 'application-name': 'Sistema Endocrino meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Endocrino - Glándulas, Hormonas y Feedback',
  description: 'Explicador visual interactivo del sistema endocrino: silueta SVG con glándulas clickables, 10 hormonas clave, feedback negativo con slider de glucosa y eje HPA del estrés.',
  url: 'https://meskeia.com/visualizador-sistema-endocrino/',
  category: 'EducationalApplication',
  features: [
    'Silueta SVG con glándulas clickables en posición anatómica',
    '10 hormonas clave con función y datos curiosos',
    'Feedback negativo interactivo (tiroides, glucosa)',
    'Eje HPA del estrés explicado visualmente',
    'Slider de glucosa con respuesta insulina/glucagón',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
