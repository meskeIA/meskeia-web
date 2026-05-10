import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Perfil Inversor - Descubre tu Tolerancia al Riesgo | meskeIA',
  description: 'Test gratuito de perfil de inversor. Responde 10 preguntas y descubre si eres conservador, moderado o agresivo. Recomendaciones personalizadas de inversión.',
  keywords: 'test perfil inversor, tolerancia riesgo, perfil riesgo inversión, test inversión, conservador moderado agresivo, cuestionario inversor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/test-perfil-inversor/',
  },
  openGraph: {
    type: 'website',
    title: 'Test de Perfil Inversor - Descubre tu Tolerancia al Riesgo',
    description: 'Test gratuito de perfil de inversor. Responde 10 preguntas y descubre si eres conservador, moderado o agresivo.',
    url: 'https://meskeia.com/test-perfil-inversor/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test de Perfil Inversor - meskeIA',
    description: 'Descubre tu tolerancia al riesgo con nuestro test gratuito de 10 preguntas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Perfil Inversor',
  description: 'Test gratuito que evalúa tu tolerancia al riesgo financiero mediante 10 preguntas. Identifica si tu perfil es conservador, moderado o agresivo y orienta tu estrategia de inversión.',
  url: 'https://meskeia.com/test-perfil-inversor/',
  category: 'FinanceApplication',
  features: [
    '10 preguntas validadas para evaluar tolerancia al riesgo',
    'Resultado: perfil conservador, moderado o agresivo',
    'Recomendaciones orientativas según el perfil obtenido',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['perfil inversor', 'tolerancia riesgo', 'test inversión', 'finanzas personales'],
});
