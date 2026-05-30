import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tectónica de Placas - La Tierra que se Mueve Bajo tus Pies | meskeIA',
  description: 'Descubre las placas tectónicas, tipos de bordes, terremotos y volcanes. Escala Richter visualizada y datos fascinantes. Explicador visual interactivo.',
  keywords: 'tectónica de placas, placas tectónicas, terremotos, volcanes, Pangea, escala Richter, subducción, falla, bordes divergentes, convergentes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tectónica de Placas - La Tierra que se Mueve Bajo tus Pies',
    description: 'Placas, bordes, terremotos y volcanes: la geología del planeta explicada visualmente.',
    url: 'https://meskeia.com/visualizador-tectonica-placas/',
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
    title: 'Tectónica de Placas - Explicador Visual',
    description: 'De Pangea al Himalaya: por qué la Tierra tiembla, con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Tectónica Placas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tectónica de Placas - La Tierra que se Mueve Bajo tus Pies',
  description: 'Explicador visual interactivo sobre tectónica de placas: 15 placas, 3 tipos de bordes, escala Richter, Cinturón de Fuego y datos geológicos fascinantes.',
  url: 'https://meskeia.com/visualizador-tectonica-placas/',
  category: 'EducationalApplication',
  features: [
    '7 placas principales con dirección de movimiento',
    '3 tipos de bordes con diagramas animados',
    'Escala Richter visualizada con energía equivalente',
    'Timeline de Pangea a la tectónica moderna',
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
      name: '¿Qué es la tectónica de placas y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tectónica de placas es la teoría que explica cómo la litosfera terrestre está dividida en grandes fragmentos rígidos llamados placas que flotan sobre el manto y se mueven entre 1 y 10 cm al año. Este movimiento, impulsado por corrientes de convección en el manto, crea montañas, fosas oceánicas, volcanes y terremotos en los bordes donde las placas interactúan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los tres tipos de bordes de placas tectónicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres tipos son: bordes divergentes, donde las placas se separan y surge nuevo material del manto (como la Dorsal Mesoatlántica); bordes convergentes, donde una placa se hunde bajo otra en un proceso llamado subducción (generando volcanes y cordilleras como los Andes); y bordes transformantes, donde las placas se deslizan lateralmente una respecto a la otra, como la falla de San Andrés en California.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Cinturón de Fuego del Pacífico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Cinturón de Fuego es una zona que rodea el océano Pacífico, de unos 40.000 km de longitud, donde se concentra el 90% de los terremotos mundiales y el 75% de los volcanes activos del planeta. Es el resultado de la intensa actividad de subducción de la placa del Pacífico bajo las placas continentales circundantes. Países como Japón, Indonesia, Chile y México se encuentran dentro de esta zona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la escala Richter para medir terremotos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala de Richter mide la magnitud de un terremoto en función de la amplitud máxima de las ondas sísmicas registradas. Es una escala logarítmica: cada unidad representa 10 veces más amplitud y unas 31,6 veces más energía liberada. Un sismo de magnitud 6 libera aproximadamente 1.000 veces más energía que uno de magnitud 4. Los terremotos superiores a 7 se consideran mayores y pueden causar daños graves.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué fue Pangea y cuándo se fragmentó?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pangea fue el supercontinente que reunía casi toda la masa terrestre del planeta hace unos 335 millones de años. Comenzó a fragmentarse hace unos 175 millones de años durante el Jurásico, primero separándose en Laurasia (norte) y Gondwana (sur), y después dividiéndose progresivamente hasta configurar los continentes actuales. El movimiento continúa hoy: el Atlántico se ensancha ~2,5 cm al año.',
      },
    },
  ],
};
