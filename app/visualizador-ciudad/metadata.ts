import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de una Ciudad - Infraestructura Urbana | meskeIA',
  description: 'Descubre las capas invisibles de una ciudad: tuberías, alcantarillado, metro, transporte, servicios urbanos y presupuesto municipal. Explicador visual interactivo.',
  keywords: 'infraestructura ciudad, tuberías, alcantarillado, metro, servicios urbanos, presupuesto municipal, transporte urbano, urbanismo, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de una Ciudad - Infraestructura Urbana',
    description: 'Las capas invisibles que hacen funcionar una ciudad: desde las tuberías bajo el suelo hasta el presupuesto municipal.',
    url: 'https://meskeia.com/visualizador-ciudad/',
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
    title: 'Anatomía de una Ciudad - Infraestructura Urbana',
    description: 'Tuberías, metro, servicios y presupuesto: todo lo que hace funcionar una ciudad, explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Anatomía Ciudad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de una Ciudad',
  description: 'Explicador visual interactivo de la infraestructura urbana: capas subterráneas (tuberías, alcantarillado, gas, fibra óptica, metro), transporte, servicios públicos y presupuesto municipal de una ciudad española típica.',
  url: 'https://meskeia.com/visualizador-ciudad/',
  category: 'EducationalApplication',
  features: [
    'Capas subterráneas interactivas con profundidad y antigüedad',
    'Comparativa de transporte urbano: tiempos, CO₂ por modo',
    'Servicios de una ciudad de 1 millón de habitantes',
    'Desglose del presupuesto municipal por partida',
    'Toggle de capas de infraestructura on/off',
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
      name: '¿Qué hay bajo el suelo de una ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bajo las calles de una ciudad conviven múltiples capas de infraestructura a distintas profundidades. A pocos centímetros se encuentran las aceras y el firme; entre 0,5 y 1,5 metros van los cables eléctricos, de telecomunicaciones y fibra óptica; entre 1 y 2 metros las tuberías de agua potable y gas; entre 2 y 3 metros el alcantarillado sanitario y pluvial; y a partir de los 15-30 metros los túneles de metro. En ciudades históricas también pueden encontrarse restos arqueológicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se gasta el presupuesto de un ayuntamiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ayuntamientos españoles destinan aproximadamente un 25-30 % de su presupuesto a servicios sociales y bienestar, un 20-25 % a urbanismo y vivienda, un 15 % a infraestructuras y transporte, un 10-15 % a seguridad (policía local y bomberos), y el resto a administración general, cultura, deporte y medio ambiente. El personal municipal supone entre el 30 y el 40 % del gasto total en la mayoría de ciudades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la red de alcantarillado de una ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alcantarillado recoge las aguas residuales domésticas e industriales y las aguas pluviales a través de una red de tuberías que fluye por gravedad hacia la depuradora. Las redes modernas son separativas: tienen colectores distintos para aguas fecales y pluviales, evitando que la lluvia intensa desborde las depuradoras. Una ciudad de un millón de habitantes puede gestionar 150-200 millones de litros diarios de aguas residuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas personas necesita una ciudad para mantener sus servicios básicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una ciudad de un millón de habitantes requiere aproximadamente entre 15.000 y 25.000 empleados públicos municipales para mantener servicios básicos: recogida de residuos, transporte, policía local, bomberos, mantenimiento de infraestructuras y servicios sociales. A esto se suman los trabajadores de empresas concesionarias (agua, gas, electricidad) y los servicios de salud y educación, que dependen de otras administraciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué modo de transporte urbano emite menos CO₂?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La bicicleta y los desplazamientos a pie son las opciones de movilidad urbana con cero emisiones directas. Entre los motorizados, el metro y el tren urbano eléctrico son los más eficientes: menos de 10 g de CO₂ por pasajero-kilómetro. El autobús eléctrico ronda los 20-40 g; el autobús diésel entre 80 y 100 g. El coche privado con un único ocupante emite entre 120 y 180 g por pasajero-kilómetro, siendo el modo más contaminante en entornos urbanos.',
      },
    },
  ],
};
