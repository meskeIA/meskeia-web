import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Ángulo de Campo (FOV) para Vídeo | meskeIA',
  description: 'Calcula el ángulo de campo (FOV) horizontal, vertical y diagonal de cualquier focal y sensor. Comparativa entre Full Frame, APS-C y Micro 4/3 con focal equivalente.',
  keywords: 'calculadora FOV, ángulo de campo, field of view, focal equivalente, crop factor, Full Frame, APS-C, Micro 4/3, vídeo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Ángulo de Campo (FOV) para Vídeo - meskeIA',
    description: 'Descubre el campo de visión de cualquier focal y sensor para vídeo. Comparativa instantánea entre sensores Full Frame, APS-C y Micro 4/3.',
    url: 'https://meskeia.com/calculadora-fov-video/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora FOV para Vídeo - meskeIA',
    description: 'Calcula el ángulo de campo horizontal, vertical y diagonal de cualquier focal y sensor. Comparativa entre sensores.',
  },
  other: {
    'application-name': 'Calculadora FOV Vídeo meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Ángulo de Campo (FOV) para Vídeo',
  description: 'Calculadora de ángulo de campo (FOV) para vídeo. Introduce la focal y el tipo de sensor para obtener los ángulos horizontal, vertical y diagonal, con comparativa entre sensores Full Frame, APS-C y Micro 4/3.',
  url: 'https://meskeia.com/calculadora-fov-video/',
  category: 'UtilityApplication',
  features: [
    'Cálculo de FOV horizontal, vertical y diagonal en grados',
    'Comparativa simultánea entre Full Frame, APS-C Nikon/Sony, APS-C Canon y Micro 4/3',
    'Focal equivalente en Full Frame para cada sensor',
    'Clasificación del tipo de plano (gran angular, normal, teleobjetivo...)',
    'Acceso rápido a focales comunes (14, 24, 35, 50, 85 mm...)',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});
