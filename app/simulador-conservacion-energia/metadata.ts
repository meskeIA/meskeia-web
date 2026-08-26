import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Conservación de la Energía Mecánica | meskeIA',
  description: 'Visualiza el intercambio entre energía cinética y potencial en una pista interactiva. 4 perfiles, fricción ajustable, animación en tiempo real con barras de energía.',
  keywords: 'conservación de la energía, energía cinética, energía potencial, energía mecánica, principio de conservación, fricción, gravedad, física, EBAU, Bachillerato, preparatoria, secundaria, educación media, simulador',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-conservacion-energia/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Conservación de la Energía | meskeIA',
    description: 'Suelta una pelota en distintas pistas y observa cómo se intercambian la energía cinética y potencial. Activa la fricción para ver disipación.',
    url: 'https://meskeia.com/simulador-conservacion-energia/',
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
    title: 'Simulador de Conservación de la Energía | meskeIA',
    description: 'Visualiza E_c + E_p = constante en una montaña rusa interactiva. Compara con y sin fricción.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Conservación de la Energía Mecánica',
  description: 'Simulador interactivo de la conservación de la energía mecánica. Selecciona entre 4 perfiles de pista (rampa, valle, montaña rusa, looping suave), ajusta masa, altura inicial, gravedad y coeficiente de fricción, y observa la animación en tiempo real con barras de energía cinética y potencial. Si la fricción es cero, la suma E_c + E_p permanece constante (conservación); si es positiva, la energía mecánica disminuye y se transforma en calor. Ideal para Física de Bachillerato y EBAU (España), preparatoria y secundaria (Latinoamérica), y primero de Universidad.',
  url: 'https://meskeia.com/simulador-conservacion-energia/',
  category: 'EducationalApplication',
  features: [
    '4 perfiles de pista (rampa, valle parabólico, montaña rusa, looping suave)',
    'Animación en tiempo real con integración numérica (Euler semi-implícito)',
    'Barras de energía cinética y potencial cambiando dinámicamente',
    'Controles de masa, altura inicial, gravedad y fricción',
    'Visualización de v, h, E_c, E_p y E_total en cualquier instante',
    'Comparación con la energía total inicial (línea de referencia)',
    'Botones de iniciar, pausar y reiniciar la simulación',
  ],
  keywords: ['conservación de la energía', 'energía mecánica', 'cinética', 'potencial', 'fricción', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria', 'física'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué dice el principio de conservación de la energía mecánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El principio establece que, en ausencia de fuerzas disipativas (como la fricción), la energía mecánica total de un sistema —suma de la energía cinética E_c y la energía potencial gravitatoria E_p— permanece constante a lo largo del movimiento. Cuando el objeto sube, E_c se convierte en E_p; cuando baja, E_p se convierte en E_c, pero la suma E_c + E_p no cambia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre con la energía mecánica cuando hay fricción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con fricción, la energía mecánica no se conserva: parte de ella se transforma en calor (energía térmica) y la suma E_c + E_p decrece progresivamente. La energía total del universo sigue conservándose, pero la porción que permanece como energía mecánica útil disminuye. En el simulador puedes ajustar el coeficiente de rozamiento y observar cómo la barra de energía total cae con el tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los perfiles de pista disponibles en el simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador incluye cuatro perfiles: una rampa inclinada simple, un valle parabólico donde la pelota oscila de lado a lado, una pista de montaña rusa con subidas y bajadas, y una pista de doble joroba con dos cimas separadas por un valle. Cada perfil permite observar el intercambio energético en geometrías distintas y comprobar si la pelota llega o no a la segunda cima con energía suficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué nivel educativo se estudia la conservación de la energía mecánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un contenido central de la Física de 2.º de Bachillerato (preparatoria o educación media en Latinoamérica) y aparece habitualmente en el bloque de mecánica de la EBAU. También se trata en primero de carrera en asignaturas de Mecánica o Física General. El concepto de trabajo, energía cinética y potencial suele introducirse antes, en 4.º de ESO o en los últimos cursos de secundaria, como base para el desarrollo posterior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la velocidad de un objeto en el fondo de un valle usando conservación de energía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si no hay fricción, en el fondo del valle toda la energía potencial inicial se ha convertido en cinética: m·g·h = ½·m·v², lo que simplifica a v = √(2·g·h). La masa se cancela, de modo que la velocidad en el punto más bajo depende únicamente de la altura inicial h y de g (9,8 m/s² en la Tierra). El simulador calcula y muestra este valor en tiempo real.',
      },
    },
  ],
};
