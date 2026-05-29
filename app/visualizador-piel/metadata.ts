import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de la Piel | Capas, Funciones y Cicatrización | meskeIA',
  description:
    'Explora las capas de la piel (epidermis, dermis, hipodermis), sus funciones de protección, cicatrización y fototipos. Visualizador educativo interactivo.',
  keywords: ['piel', 'epidermis', 'dermis', 'hipodermis', 'cicatrización', 'fototipo', 'melanocitos', 'queratinocitos'],
  openGraph: {
    title: 'Visualizador de la Piel | meskeIA',
    description:
      'Explora la estructura y funciones de la piel: capas, cicatrización, fototipos y mecanismos de protección.',
    url: 'https://meskeia.com/visualizador-piel/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "La Piel - Capas, Funciones y Cicatrización",
  description: "Explora las capas de la piel (epidermis, dermis, hipodermis), sus funciones de protección, cicatrización y fototipos. Visualizador educativo interactivo.",
  url: "https://meskeia.com/visualizador-piel/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las capas de la piel y qué función tiene cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La piel se divide en tres capas principales. La epidermis es la capa más externa; está compuesta principalmente por queratinocitos y actúa como barrera frente a agentes externos, radiación UV y pérdida de agua. La dermis, en el medio, contiene colágeno, elastina, vasos sanguíneos, folículos pilosos y glándulas sudoríparas; proporciona resistencia mecánica y nutrición. La hipodermis o tejido subcutáneo, la más profunda, almacena grasa como aislante térmico y reserva energética, y amortigua impactos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el proceso de cicatrización de la piel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cicatrización se produce en cuatro fases. Primero la hemostasia: los vasos se contraen y las plaquetas forman un coágulo para detener el sangrado. Luego la inflamación: los leucocitos limpian la zona de bacterias y tejido dañado. Después la proliferación: los fibroblastos sintetizan nuevo colágeno y los queratinocitos migran para cubrir la herida. Finalmente la remodelación: el colágeno se reorganiza durante meses o años, reduciendo la cicatriz. La velocidad y calidad de cada fase dependen de la edad, nutrición y vascularización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los fototipos de piel y para qué sirve conocerlos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los fototipos (escala Fitzpatrick I-VI) clasifican la piel según su reacción a la radiación solar: capacidad de broncearse y riesgo de quemarse. El fototipo I (piel muy clara, pelirroja o rubia) se quema siempre y nunca se broncea; el fototipo VI (piel muy oscura) raramente se quema. Conocer el propio fototipo es útil para elegir el SPF adecuado, evaluar el riesgo de cáncer de piel y tomar decisiones informadas ante tratamientos dermatológicos o estéticos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los melanocitos y cuál es su papel en la piel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los melanocitos son células especializadas de la epidermis que producen melanina, el pigmento responsable del color de la piel, el cabello y los ojos. Ante la exposición a la radiación UV, los melanocitos aumentan la producción de melanina como mecanismo de defensa, absorbiendo y dispersando la energía solar para proteger el ADN de las células subyacentes. Las alteraciones en los melanocitos están en el origen de condiciones como el vitíligo (pérdida de melanocitos) o el melanoma (proliferación maligna).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda la epidermis en renovarse completamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La epidermis se renueva aproximadamente cada 28-40 días en adultos jóvenes y sanos. Las células madre basales de la capa más profunda de la epidermis se dividen continuamente; las células hijas migran hacia la superficie, se diferencian en queratinocitos y se van aplastando hasta convertirse en corneocitos muertos que finalmente se desprenden (descamación). Este proceso se ralentiza con la edad (puede llegar a 45-60 días en mayores de 50 años) y se ve afectado por enfermedades como la psoriasis, que lo acelera drásticamente.',
      },
    },
  ],
};
