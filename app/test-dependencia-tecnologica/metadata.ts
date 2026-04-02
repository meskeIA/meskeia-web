import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Dependencia Tecnológica - ¿Podrías trabajar sin IA? | meskeIA',
  description: 'Evalúa tu autonomía real frente a la tecnología y tu capacidad de adaptarte cuando las herramientas cambian. Test de 10 preguntas sobre dependencia digital e independencia profesional. Gratuito y sin registro.',
  keywords: 'dependencia tecnológica, autonomía digital, trabajar sin IA, independencia profesional, habilidades sin tecnología, resiliencia digital, adaptabilidad tecnológica, deskilling',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Dependencia Tecnológica | meskeIA',
    description: '¿Podrías hacer tu trabajo si mañana no tuvieras IA? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/test-dependencia-tecnologica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Dependencia Tecnológica | meskeIA',
    description: '¿Cuánto depende tu trabajo de la tecnología? Descúbrelo con este test gratuito.',
  },
  other: {
    'application-name': 'Test de Dependencia Tecnológica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Dependencia Tecnológica',
  description: 'Herramienta interactiva de reflexión sobre dependencia digital. 10 preguntas para evaluar tu autonomía profesional real y tu capacidad de adaptarte cuando las herramientas cambian o fallan.',
  url: 'https://meskeia.com/test-dependencia-tecnologica/',
  features: [
    'Test de 10 preguntas sobre tu relación con la tecnología',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa autonomía real y adaptabilidad tecnológica',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para reducir dependencia sin perder productividad',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
