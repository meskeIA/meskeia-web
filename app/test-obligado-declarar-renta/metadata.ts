import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test: ¿Estoy obligado a declarar la Renta 2025? | meskeIA',
  description: 'Descubre en 2 minutos si estás obligado a presentar la declaración de la Renta 2025-2026. Umbrales actualizados: 22.000 €, 15.876 €, varios pagadores, desempleo, IMV.',
  keywords: 'obligado declarar renta 2025, declaración renta obligatoria, límite renta 2025, varios pagadores IRPF, campaña renta 2026, AEAT',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Estoy obligado a declarar la Renta 2025? — Test rápido',
    description: 'Test interactivo para saber si debes presentar la declaración de IRPF 2025. Umbrales actualizados, desempleo, IMV y más.',
    url: 'https://meskeia.com/test-obligado-declarar-renta',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Estoy obligado a declarar la Renta 2025?',
    description: 'Test rápido con los umbrales actualizados de la campaña 2026.',
  },
  other: {
    'application-name': 'Test Obligación Declarar Renta meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test: ¿Estoy obligado a declarar la Renta 2025?',
  description: 'Test interactivo que evalúa tu situación fiscal para determinar si estás obligado a presentar la declaración de la Renta 2025 en la campaña 2026. Incluye umbrales por rendimientos del trabajo, capital mobiliario, varios pagadores, desempleo, IMV y deducciones.',
  url: 'https://meskeia.com/test-obligado-declarar-renta/',
  features: [
    'Evaluación personalizada en 7 preguntas',
    'Umbrales IRPF 2025 actualizados (22.000 € / 15.876 €)',
    'Contempla desempleo, IMV, varios pagadores y deducciones',
    'Resultado inmediato con explicación detallada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
