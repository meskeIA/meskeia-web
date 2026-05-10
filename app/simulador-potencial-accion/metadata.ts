import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Potencial de Acción Neuronal | meskeIA',
  description: 'Visualiza el disparo de una neurona: despolarización, repolarización, hiperpolarización y periodos refractarios. Estímulo configurable y umbral ajustable.',
  keywords: 'potencial de acción, neurona, fisiología, despolarización, repolarización, periodo refractario, canales sodio potasio, todo o nada, EBAU, Bachillerato, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-potencial-accion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Potencial de Acción Neuronal | meskeIA',
    description: 'La ley del "todo o nada" en directo: estímulo subumbral nada pasa, supraumbral dispara potencial completo.',
    url: 'https://meskeia.com/simulador-potencial-accion/',
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
    title: 'Simulador del Potencial de Acción | meskeIA',
    description: 'Lanza estímulos a una neurona y observa el disparo (o no) según la regla "todo o nada".',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Potencial de Acción Neuronal',
  description: 'Simulador interactivo del potencial de acción de una neurona basado en una versión simplificada del modelo de Hodgkin-Huxley. Visualiza la evolución del potencial de membrana V_m a lo largo del tiempo: potencial de reposo, respuesta subumbral o supraumbral, despolarización rápida (canales Na⁺), repolarización (canales K⁺), hiperpolarización post-disparo y periodo refractario. Permite ajustar la intensidad y duración del estímulo, el umbral y las conductancias relativas. Demuestra la ley del &quot;todo o nada&quot; y por qué un estímulo subumbral no produce disparo. Ideal para EBAU de Biología, Bachillerato y fisiología universitaria.',
  url: 'https://meskeia.com/simulador-potencial-accion/',
  category: 'EducationalApplication',
  features: [
    'Animación V_m(t) en tiempo real con las 5 fases del potencial de acción',
    'Estímulo de intensidad y duración configurables',
    'Umbral y conductancias relativas ajustables',
    'Ley del "todo o nada" demostrada visualmente',
    'Estímulo sostenido: produce trenes de PA con frecuencia variable',
    'Detección de periodos refractarios absoluto y relativo',
    'Estadísticos: latencia, frecuencia, altura del pico',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['potencial de acción', 'neurona', 'despolarización', 'todo o nada', 'EBAU', 'Bachillerato', 'biología'],
});
