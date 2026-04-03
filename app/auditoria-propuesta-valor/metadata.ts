import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Auditoría de Propuesta de Valor - ¿Lo que ofreces encaja con lo que necesitan? | meskeIA',
  description: 'Descubre si tu propuesta de valor encaja con las necesidades reales de tu cliente. Test de 10 preguntas basado en el Value Proposition Canvas de Osterwalder. Gratuito y sin registro.',
  keywords: 'propuesta de valor, Value Proposition Canvas, Osterwalder, encaje producto mercado, product market fit, cliente necesidad, oferta valor, emprendimiento, negocio, comunicación valor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Auditoría de Propuesta de Valor | meskeIA',
    description: '¿Lo que ofreces encaja con lo que necesitan? Test basado en Osterwalder.',
    url: 'https://meskeia.com/auditoria-propuesta-valor',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auditoría de Propuesta de Valor | meskeIA',
    description: '¿Tu oferta encaja con tu cliente? Descúbrelo con este test gratuito.',
  },
  other: { 'application-name': 'Auditoría de Propuesta de Valor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Auditoría de Propuesta de Valor',
  description: 'Herramienta interactiva de reflexión para evaluar si tu propuesta de valor encaja con las necesidades reales de tu cliente. Basado en el Value Proposition Canvas de Osterwalder.',
  url: 'https://meskeia.com/auditoria-propuesta-valor/',
  features: ['Test de 10 preguntas sobre encaje y comunicación', 'Diagnóstico visual con mapa 2D y perfil personalizado', 'Basado en el Value Proposition Canvas', 'Acciones concretas según tu resultado', 'Funciona 100% en el navegador, sin registro ni instalación', 'Gratuito y sin publicidad', 'Disponible en español'],
});
