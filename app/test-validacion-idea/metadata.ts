import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Validación de Idea - ¿Tu idea resuelve un problema real? | meskeIA',
  description: 'Descubre si tu idea de negocio resuelve un problema real o solo te gusta a ti. Test de 10 preguntas basado en Lean Startup (Eric Ries). Evalúa asunciones y validación. Gratuito.',
  keywords: 'validación idea, Lean Startup, Eric Ries, MVP, problema real, validar negocio, asunciones, product market fit, emprendimiento, startup',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Validación de Idea | meskeIA',
    description: '¿Tu idea resuelve un problema real? Test basado en Lean Startup.',
    url: 'https://meskeia.com/test-validacion-idea',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Validación de Idea | meskeIA',
    description: '¿Tu idea tiene mercado real? Descúbrelo con este test gratuito.',
  },
  other: { 'application-name': 'Test de Validación de Idea meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Validación de Idea',
  description: 'Herramienta interactiva de reflexión para evaluar si tu idea de negocio resuelve un problema real. Basado en Lean Startup de Eric Ries.',
  url: 'https://meskeia.com/test-validacion-idea/',
  features: ['Test de 10 preguntas sobre asunciones y validación', 'Diagnóstico visual con mapa 2D y perfil personalizado', 'Basado en Lean Startup (Eric Ries)', 'Acciones concretas según tu resultado', 'Funciona 100% en el navegador, sin registro ni instalación', 'Gratuito y sin publicidad', 'Disponible en español'],
});
