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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ángulo de campo (FOV) en vídeo y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ángulo de campo (Field of View, FOV) es el área de la escena que capta el sensor con una focal determinada. Se calcula con la fórmula: FOV = 2 × arctan(dimensión del sensor / (2 × focal)). Una focal de 24 mm en Full Frame da un FOV horizontal de unos 74°, considerado gran angular, mientras que 85 mm produce unos 24°, típico de retrato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre Full Frame, APS-C y Micro 4/3 respecto al FOV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada formato de sensor tiene dimensiones físicas distintas: Full Frame mide 36×24 mm, APS-C Canon 22,3×14,9 mm (factor de recorte 1,6×), APS-C Nikon/Sony 23,5×15,6 mm (factor 1,5×) y Micro 4/3 17,3×13 mm (factor 2×). Con la misma focal, un sensor más pequeño captura un ángulo menor, equivalente a usar una focal más larga en Full Frame.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer la focal equivalente en Full Frame?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La focal equivalente permite comparar objetivos entre distintos formatos usando una referencia común. Por ejemplo, un objetivo de 25 mm en Micro 4/3 equivale a 50 mm en Full Frame, el ángulo de visión clásico "normal". Conocer la equivalencia es esencial al cambiar de sistema de cámara o al elegir objetivos para diferentes sensores en producción de vídeo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de plano corresponde a cada ángulo de campo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Convencionalmente, un FOV horizontal superior a 65° corresponde a plano gran angular (focales cortas), entre 40° y 65° a plano normal o medio, y por debajo de 40° a teleobjetivo. En cine y televisión se usa como referencia la focal equivalente en Full Frame: <24 mm gran angular extremo, 24-35 mm gran angular, 35-70 mm normal, 70-135 mm teleobjetivo moderado, >135 mm teleobjetivo largo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el crop factor a la profundidad de campo además del FOV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El factor de recorte no solo reduce el ángulo de campo sino que también afecta a la profundidad de campo efectiva. Para obtener el mismo encuadre y la misma profundidad de campo en APS-C que en Full Frame, habría que usar una apertura proporcionalmente menor. Por ejemplo, f/2.8 en APS-C (factor 1,5×) equivale aproximadamente a f/4.2 en Full Frame en términos de desenfoque de fondo.',
      },
    },
  ],
};
