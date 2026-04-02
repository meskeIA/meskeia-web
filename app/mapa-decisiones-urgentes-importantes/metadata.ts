import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mapa de Decisiones Urgentes vs Importantes - ¿Vives apagando fuegos? | meskeIA',
  description: 'Descubre si vives en modo reactivo o construyes futuro. Test de 10 preguntas basado en la Matriz Eisenhower adaptada. Diagnóstico visual con perfil y acciones concretas. Gratuito y sin registro.',
  keywords: 'matriz eisenhower, urgente vs importante, gestión del tiempo, prioridades, productividad, apagar fuegos, planificación estratégica, Covey, cuadrante 2',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mapa de Decisiones Urgentes vs Importantes | meskeIA',
    description: '¿Vives apagando fuegos o construyendo futuro? Test interactivo basado en la Matriz Eisenhower.',
    url: 'https://meskeia.com/mapa-decisiones-urgentes-importantes',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mapa de Decisiones Urgentes vs Importantes | meskeIA',
    description: '¿Vives en modo urgencia permanente? Descúbrelo con este test gratuito basado en Eisenhower.',
  },
  other: {
    'application-name': 'Mapa de Decisiones Urgentes vs Importantes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mapa de Decisiones Urgentes vs Importantes',
  description: 'Herramienta interactiva de reflexión basada en la Matriz Eisenhower adaptada. 10 preguntas para evaluar si priorizas lo importante o solo reaccionas a lo urgente. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/mapa-decisiones-urgentes-importantes/',
  features: [
    'Test de 10 preguntas sobre cómo gestionas prioridades',
    'Diagnóstico visual con mapa bidimensional',
    'Basado en la Matriz Eisenhower y el Cuadrante 2 de Covey',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para mejorar tu gestión del tiempo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
