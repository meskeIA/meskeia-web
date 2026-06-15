import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '¿Qué vino elegir? Asistente situacional de vinos | meskeIA',
  description: 'Asistente para elegir el vino adecuado según tu situación: cena, regalo, restaurante, ocasión especial. Recomendaciones por plato, comensales y presupuesto. Incluye uvas LATAM.',
  keywords: 'qué vino elegir, recomendador vino, maridaje vino, vino para cena, vino regalo, qué vino pedir restaurante, simulador vino, asistente vino, vino para carne, vino para pescado',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Qué vino elegir? | meskeIA',
    description: 'Asistente situacional de vinos: te ayuda a decidir según plato, ocasión, regalo o restaurante. Recomendaciones razonadas con alternativas.',
    url: 'https://meskeia.com/que-vino-elegir/',
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
    title: '¿Qué vino elegir? | meskeIA',
    description: 'Asistente situacional de vinos: cena, regalo, restaurante u ocasión. Recomendaciones razonadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Qué vino elegir meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: '¿Qué vino elegir?',
  description: 'Asistente situacional para elegir el vino adecuado según el contexto: cena con plato concreto, regalo, restaurante, ocasión especial o exploración. Devuelve 3 recomendaciones razonadas más una alternativa para salir de la zona de confort. Cobertura amplia: tintos, blancos, espumosos y generosos del mundo, incluyendo varietales LATAM (Malbec, Torrontés, Carménère).',
  url: 'https://meskeia.com/que-vino-elegir/',
  category: 'EducationalApplication',
  features: [
    'Asistente situacional: 5 escenarios (cena, regalo, restaurante, ocasión, probar)',
    'Recomendaciones razonadas con porcentaje de afinidad',
    'Cobertura amplia: tintos, blancos, espumosos y generosos del mundo',
    'Uvas LATAM incluidas: Malbec, Torrontés, Carménère, País',
    'Alternativa "fuera de zona de confort" para explorar',
    'Tips de servicio: temperatura y maridaje',
    'Catálogo de 24 varietales: tintos, blancos, espumosos y generosos de España, Francia, Italia, Argentina y Chile',
    'Motor de scoring por tags: plato, presupuesto y ocasión calculan el porcentaje de afinidad de cada vino',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué vino va mejor con carne roja a la parrilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los vinos tintos con buena estructura tánica son los compañeros clásicos de la carne roja a la parrilla: Cabernet Sauvignon, Malbec, Tempranillo con crianza o Syrah/Shiraz. Los taninos interaccionan con las proteínas de la carne y suavizan la astringencia del vino, mientras que la potencia frutal complementa el sabor ahumado. Para cortes muy grasos como el chuletón, un vino con buena acidez ayuda a limpiar el paladar entre bocados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué vino regalar a alguien que no sabe de vinos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para un regalo seguro a alguien sin experiencia en vinos, las mejores opciones son vinos con perfil frutal y sin exceso de taninos o acidez: un Pinot Noir suave, un Albariño o Verdejo fresco, un Rosado de calidad o un espumoso como el Cava brut. Evitar vinos muy tánicos, muy minerales o con crianzas largas que pueden resultar difíciles si el destinatario no tiene experiencia. El precio entre 12 y 20 euros suele ofrecer muy buena relación calidad-precio sin resultar pretencioso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la temperatura correcta para servir el vino tinto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temperatura de servicio óptima del vino tinto varía según el tipo: vinos ligeros como el Pinot Noir se sirven entre 14-16 °C, mientras que tintos con crianza como Rioja Reserva o Ribera del Duero se disfrutan mejor entre 16-18 °C. Los tintos muy estructurados como un Cabernet Sauvignon de guarda pueden llegar a 18-20 °C. Servir el tinto demasiado caliente (por encima de 20 °C) potencia el alcohol y aplana los aromas; demasiado frío reduce la expresividad frutal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el maridaje y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El maridaje es la combinación de vino y alimento buscando que ambos se realcen mutuamente. Los principios básicos son: la acidez del vino complementa platos grasos o con salsas cremosas; los taninos se equilibran con proteínas de la carne; los vinos dulces armonizan con postres o quesos curados; la intensidad del vino debe ser proporcional a la del plato. Existen dos enfoques: maridaje por analogía (sabores similares) y por contraste (sabores opuestos que se equilibran). No hay reglas absolutas; el gusto personal siempre tiene la última palabra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un vino joven y un vino con crianza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la normativa española, un vino joven no tiene envejecimiento reglamentado en barrica o tiene menos de 6 meses. La Crianza requiere mínimo 2 años de envejecimiento (6 meses en barrica para blancos y rosados, 12 meses para tintos). La Reserva exige 3 años en total (al menos 12 meses en barrica para tintos). El Gran Reserva necesita 5 años con al menos 18 meses en barrica. A mayor crianza, el vino desarrolla aromas más complejos (vainilla, cuero, tabaco) y los taninos se suavizan, aunque puede perder frescura frutal.',
      },
    },
  ],
};
