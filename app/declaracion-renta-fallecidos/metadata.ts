import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Declaración de la Renta de Persona Fallecida - Guía para Herederos | meskeIA',
  description: 'Guía interactiva para herederos: cómo presentar la declaración IRPF de una persona fallecida, documentación necesaria, plazos y solicitud de devolución.',
  keywords: 'renta fallecido, IRPF fallecido, declaración renta persona fallecida, herederos renta, modelo H-100, devolución herederos, campaña renta fallecido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Declaración de la Renta de Persona Fallecida | meskeIA',
    description: 'Guía paso a paso para herederos: obligación de declarar, acceso al borrador, documentación y devoluciones.',
    url: 'https://meskeia.com/declaracion-renta-fallecidos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Declaración Renta Fallecidos - Guía Herederos | meskeIA',
    description: 'Todo lo que necesitas saber para presentar la declaración IRPF de una persona fallecida en España.',
  },
  other: {
    'application-name': 'Declaración Renta Fallecidos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Declaración de la Renta de Persona Fallecida',
  description: 'Guía interactiva para herederos que deben presentar la declaración de IRPF de una persona fallecida. Verifica la obligación de declarar, indica la documentación necesaria según el importe de la devolución y guía paso a paso en el proceso completo.',
  url: 'https://meskeia.com/declaracion-renta-fallecidos/',
  features: [
    'Verificador de obligación de declarar del fallecido',
    'Guía paso a paso para acceder al borrador como heredero',
    'Checklist de documentación según importe de devolución',
    'Información sobre Modelo H-100 y procedimiento de devolución',
    'Casos especiales: fallecimiento 31/dic, varios herederos, renuncia',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
