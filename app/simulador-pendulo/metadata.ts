import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Péndulo y MAS - Movimiento Armónico Simple | meskeIA',
  description: 'Simula un péndulo simple: ajusta longitud, masa, ángulo y gravedad. Calcula período y frecuencia, observa la oscilación y la energía. Física Bachillerato y Universidad.',
  keywords: 'péndulo simple, MAS, movimiento armónico simple, oscilaciones, período péndulo, frecuencia angular, física bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-pendulo/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Péndulo Simple | meskeIA',
    description: 'Péndulo simple y movimiento armónico con animación interactiva',
    url: 'https://meskeia.com/simulador-pendulo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Péndulo Simple | meskeIA',
    description: 'Aprende oscilaciones con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el período de un péndulo simple?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para ángulos pequeños (menores de ~15°), el período se calcula con la fórmula T = 2π√(L/g), donde L es la longitud del hilo en metros y g la aceleración gravitacional (9,8 m/s² en la Tierra). Para ángulos mayores, la aproximación lineal no es válida y el simulador utiliza integración numérica para obtener el período real, que resulta mayor que el estimado por la fórmula.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué parámetros se pueden ajustar en el simulador de péndulo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Puedes modificar la longitud del hilo, la masa del objeto, el ángulo inicial de desplazamiento, la aceleración gravitacional (con presets para Tierra, Luna y Marte) y el coeficiente de amortiguación. La herramienta calcula en tiempo real el período, la frecuencia angular y la energía cinética y potencial en cada instante de la oscilación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Depende el período de un péndulo de la masa del objeto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. En la aproximación de ángulos pequeños, el período T = 2π√(L/g) no depende de la masa. Sí depende de la longitud del hilo y de la gravedad del lugar. Por eso, un péndulo de la misma longitud oscila más lentamente en la Luna (g ≈ 1,62 m/s²) que en la Tierra (g ≈ 9,8 m/s²).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el movimiento armónico simple y el de un péndulo real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El movimiento armónico simple (MAS) es una idealización válida para ángulos pequeños, donde la fuerza restauradora es proporcional al desplazamiento. Un péndulo real con ángulos grandes no cumple esa proporcionalidad: el período aumenta con la amplitud y la trayectoria no es perfectamente sinusoidal. El simulador permite elegir entre el modo lineal (MAS) y el modo de integración numérica para comparar ambos comportamientos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué cursos es útil este simulador de péndulo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para Física de 2.º de Bachillerato (oscilaciones y movimiento armónico) y para preparar problemas de selectividad. También sirve para visualizar conceptos en primero de ingeniería o de física universitaria, así como para prácticas de laboratorio virtual en las que se estudia la relación entre longitud, gravedad y período.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Péndulo Simple y MAS',
  description: 'Simulador interactivo de péndulo simple y movimiento armónico. Ajusta longitud, masa, ángulo inicial, gravedad y amortiguación, observa la oscilación, el período y la energía.',
  url: 'https://meskeia.com/simulador-pendulo/',
  category: 'EducationalApplication',
  features: [
    'Animación 2D del péndulo en tiempo real con control de pausa y reinicio',
    'Cálculo de período T = 2π√(L/g), frecuencia angular ω y frecuencia f',
    'Modos: aproximación de pequeños ángulos y modelo numérico para cualquier ángulo',
    'Visualización de energía cinética y potencial en cada instante de la oscilación',
    'Presets de gravedad: Tierra, Luna y Marte para comparar comportamientos',
    'Comparativa simultánea de dos péndulos con distintas longitudes',
    'Aviso automático cuando el ángulo supera la aproximación de pequeños ángulos',
  ],
  keywords: ['péndulo', 'MAS', 'oscilaciones', 'física bachillerato'],
});
