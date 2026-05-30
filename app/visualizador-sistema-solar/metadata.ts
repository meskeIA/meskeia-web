import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Solar en Números - Planetas, Distancias y Curiosidades | meskeIA',
  description: 'Explora el sistema solar de forma visual: los 8 planetas con datos clave, comparación a escala, velocidad de la luz y curiosidades. Explicador visual interactivo.',
  keywords: 'sistema solar, planetas, distancias planetas, escala sistema solar, velocidad luz, curiosidades planetas, Júpiter, Saturno, Marte, Tierra, astronomía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Solar en Números - Planetas, Distancias y Curiosidades',
    description: 'Los 8 planetas, sus distancias a escala, velocidad de la luz y curiosidades sorprendentes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-sistema-solar/',
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
    title: 'El Sistema Solar en Números - Explicador Visual',
    description: 'Explora los planetas, sus tamaños a escala, distancias y curiosidades del sistema solar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Solar meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Solar en Números - Planetas, Distancias y Curiosidades',
  description: 'Explicador visual interactivo sobre el sistema solar: los 8 planetas con datos clave, comparación de tamaños a escala, velocidad de la luz y tiempos de viaje, y curiosidades sorprendentes.',
  url: 'https://meskeia.com/visualizador-sistema-solar/',
  category: 'EducationalApplication',
  features: [
    'Los 8 planetas con distancia, diámetro, masa, temperatura, lunas y datos curiosos',
    'Comparación a escala: si el Sol fuera un balón, ¿dónde estaría cada planeta?',
    'Tiempos de viaje de la luz y la Voyager 1 por el sistema solar',
    'Curiosidades sorprendentes: Venus gira al revés, Saturno flotaría en agua',
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
      name: '¿Cuántos planetas tiene el sistema solar y cuáles son?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema solar tiene 8 planetas reconocidos por la Unión Astronómica Internacional: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno. Plutón fue reclasificado como planeta enano en 2006. Los cuatro interiores (terrestres) son rocosos y pequeños; los cuatro exteriores son gigantes gaseosos o helados con sistemas de anillos y numerosas lunas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda la luz en cruzar el sistema solar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La luz viaja a 299.792 km/s. Desde el Sol hasta la Tierra tarda unos 8 minutos y 20 segundos. Hasta Neptuno, el planeta más lejano, son aproximadamente 4 horas y 10 minutos. La señal de radio de la sonda Voyager 1, la nave humana más lejana (más de 23.000 millones de km), tarda más de 21 horas en llegar a la Tierra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué Júpiter es tan importante para la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Júpiter actúa como escudo gravitacional del sistema solar interior. Su enorme masa (más de 300 veces la de la Tierra) desvía o captura muchos cometas y asteroides que de otro modo impactarían en los planetas interiores. Se estima que sin Júpiter la Tierra sufriría impactos de gran escala unas 1.000 veces más frecuentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia de tamaño entre el Sol y los planetas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sol concentra el 99,86% de toda la masa del sistema solar. Su diámetro (1.392.700 km) es 109 veces el de la Tierra. Júpiter, el mayor planeta, cabe unas 11 veces en el diámetro solar. Si el Sol fuera un balón de baloncesto de 24 cm, la Tierra sería una pequeña canica de 2 mm a 26 metros de distancia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las curiosidades más sorprendentes de los planetas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunas: Venus gira en sentido contrario al resto de planetas (rotación retrógrada) y sus días duran más que sus años. Saturno tiene una densidad tan baja que flotaría en el agua. Marte alberga el volcán más alto del sistema solar (Olympus Mons, 22 km) y el cañón más extenso (Valles Marineris, 4.000 km). Urano orbita de lado, con una inclinación axial de 98°.',
      },
    },
  ],
};
