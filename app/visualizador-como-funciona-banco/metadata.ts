import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona un Banco (de Verdad) - Explicador Visual | meskeIA',
  description: 'Entiende de dónde sale el dinero que presta el banco: depósitos, reserva fraccionaria, multiplicador bancario, tipos de interés BCE. Explicador interactivo.',
  keywords: 'cómo funciona banco, reserva fraccionaria, multiplicador bancario, tipos interés BCE, creación dinero, sistema financiero, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona un Banco (de Verdad)',
    description: 'De dónde sale el dinero que presta el banco. Reserva fraccionaria y multiplicador bancario explicados.',
    url: 'https://meskeia.com/visualizador-como-funciona-banco/',
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
    title: 'Cómo Funciona un Banco (de Verdad)',
    description: 'El sistema bancario explicado de forma visual: depósitos, préstamos y creación de dinero.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cómo Funciona Banco meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona un Banco (de Verdad)',
  description: 'Explicador visual interactivo del sistema bancario: cómo los bancos crean dinero a partir de depósitos, la reserva fraccionaria, el multiplicador bancario, los tipos de interés del BCE y el papel del banco central.',
  url: 'https://meskeia.com/visualizador-como-funciona-banco/',
  features: [
    'Simulación visual del multiplicador bancario',
    'Slider de coeficiente de reserva interactivo',
    'Ciclo depósito → préstamo → nuevo depósito explicado',
    'Papel del BCE y los tipos de interés',
    'Qué pasa cuando todos quieren su dinero a la vez',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
