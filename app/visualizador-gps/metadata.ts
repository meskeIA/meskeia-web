import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el GPS - Satélites, Trilateración y Relatividad | meskeIA',
  description: 'Descubre cómo el GPS localiza tu posición: 31 satélites, trilateración por señales de radio, la corrección de Einstein y los sistemas de navegación mundial. Explicador visual interactivo.',
  keywords: 'GPS, satélites, trilateración, relatividad, Einstein, navegación, GNSS, Galileo, GLONASS, BeiDou, precisión GPS, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el GPS - Satélites, Trilateración y Relatividad',
    description: '31 satélites, la velocidad de la luz y la relatividad de Einstein: todo lo que hace posible que tu móvil sepa dónde estás.',
    url: 'https://meskeia.com/visualizador-gps/',
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
    title: 'Cómo Funciona el GPS - Satélites y Relatividad',
    description: 'De los satélites a tu bolsillo: trilateración, relojes atómicos y la corrección de Einstein, explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'GPS meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el GPS',
  description: 'Explicador visual interactivo sobre tecnología GPS: constelación de 31 satélites a 20.200 km, trilateración por señales de radio, corrección relativista de Einstein (+38 μs/día) y comparativa de sistemas de navegación global (GPS, Galileo, GLONASS, BeiDou).',
  url: 'https://meskeia.com/visualizador-gps/',
  category: 'EducationalApplication',
  features: [
    'Constelación de 31 satélites GPS con órbitas a 20.200 km',
    'Trilateración interactiva: de 1 círculo a 3 para fijar posición',
    'Corrección relativista de Einstein: +38 μs/día explicada visualmente',
    'Comparativa GPS vs Galileo vs GLONASS vs BeiDou',
    'Niveles de precisión: estándar, diferencial y RTK',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sabe el GPS dónde estoy exactamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tu receptor GPS escucha señales de radio de al menos 4 satélites simultáneamente. Cada señal lleva una marca de tiempo precisa; midiendo el retraso entre el envío y la recepción, el receptor calcula la distancia a cada satélite (la señal viaja a la velocidad de la luz, ~300.000 km/s). Con tres distancias puede fijar una posición en 3D mediante trilateración, y el cuarto satélite corrige el error del reloj interno del dispositivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el GPS necesita corregir la relatividad de Einstein?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los satélites GPS orbitan a 20.200 km de altitud y se mueven a unos 14.000 km/h. La relatividad especial dice que su velocidad hace que sus relojes vayan algo más lentos (-7 μs/día), mientras que la relatividad general dice que la menor gravedad a esa altitud los hace ir más rápido (+45 μs/día). El efecto neto es una ganancia de +38 microsegundos diarios que, sin corregir, acumularía un error de posición de ~10 km al día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre GPS, Galileo, GLONASS y BeiDou?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GPS es el sistema estadounidense (31 satélites), el primero en operar plenamente y el más extendido. GLONASS es el ruso (24 satélites), con cobertura polar más estable. Galileo es el europeo (30 satélites en 2025), con mayor precisión civil garantizada por tratado. BeiDou es el chino (35+ satélites), con cobertura especialmente densa en Asia. Los smartphones modernos usan varios sistemas a la vez para mejorar la precisión y la disponibilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la precisión real del GPS en un teléfono móvil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En condiciones normales, un smartphone consigue una precisión de entre 3 y 5 metros con GPS estándar, que mejora a 1-2 metros cuando combina GPS con Galileo y GLONASS. Bajo árboles, en calles estrechas o en interiores la señal se degrada y el error puede superar los 20 metros. La tecnología GPS diferencial (DGBS) alcanza el metro, y el RTK (Real-Time Kinematic) llega a pocos centímetros, pero requiere receptores profesionales y una estación de referencia cercana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el GPS a veces pierde señal en ciudad o bajo techo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales GPS viajan en línea recta desde órbita y se atenúan o rebotan al atravesar edificios, árboles y superficies metálicas. En interiores o garajes, la señal es demasiado débil para el receptor. En zonas urbanas densas, el "efecto cañón" hace que las señales lleguen reflejadas en fachadas (multipath), introduciendo errores. Para compensarlo, los teléfonos combinan GPS con Wi-Fi, Bluetooth y acelerómetros (fusión de sensores) para mantener un posicionamiento continuo.',
      },
    },
  ],
};
