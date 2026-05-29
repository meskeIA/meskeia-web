import { Metadata } from 'next';

const title = 'Selector de Actividades según Movilidad — Envejecimiento Activo | meskeIA';
const description = 'Descubre actividades físicas, sociales y cognitivas adaptadas a tu nivel de movilidad. Test de 8 preguntas con recomendaciones personalizadas para un envejecimiento activo y saludable.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'actividades personas mayores, envejecimiento activo, ejercicio mayores movilidad reducida, actividades tercera edad, gimnasia mayores, actividades cognitivas mayores, actividades sociales jubilados',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Selector de Actividades según Movilidad | meskeIA',
    description,
    url: 'https://meskeia.com/selector-actividades-movilidad/',
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
    title: 'Selector de Actividades según Movilidad | meskeIA',
    description: 'Actividades adaptadas a tu movilidad: físicas, sociales y cognitivas para un envejecimiento activo',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Selector Actividades Movilidad meskeIA',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Selector de Actividades según Movilidad',
  description,
  url: 'https://meskeia.com/selector-actividades-movilidad/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué actividades físicas son seguras para personas mayores con movilidad reducida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las actividades más recomendadas para personas con movilidad reducida incluyen ejercicios en silla, yoga adaptado, natación o hidrogimnasia y paseos cortos a ritmo suave. Estas actividades mejoran la circulación, la flexibilidad y el equilibrio sin someter las articulaciones a impacto excesivo. El punto de partida adecuado depende del nivel de movilidad concreto de cada persona, por lo que un test personalizado permite ajustar las sugerencias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el selector de actividades según nivel de movilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El selector hace 8 preguntas sobre capacidad de desplazamiento, resistencia, equilibrio y preferencias personales. A partir de las respuestas clasifica el perfil en uno de tres niveles de movilidad y genera recomendaciones concretas en tres categorías: actividades físicas, sociales y cognitivas. Todo el proceso ocurre en el navegador, sin registro ni envío de datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué actividades cognitivas benefician el envejecimiento activo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los juegos de memoria, puzzles, lectura activa, aprendizaje de idiomas y talleres de escritura creativa son algunos de los recursos más respaldados para mantener la agilidad mental. La estimulación cognitiva regular se asocia con un menor riesgo de deterioro cognitivo, aunque no garantiza resultados concretos para cada persona. Combinadas con actividad física y social, ofrecen el mayor beneficio global.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este selector de actividades?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado a personas mayores de 60 años, familiares que les cuidan y profesionales de atención a la tercera edad que buscan ideas prácticas adaptadas a distintos grados de movilidad. También puede servir a personas con condiciones que limitan el movimiento a cualquier edad. No sustituye la valoración de un médico o fisioterapeuta, sino que ofrece un punto de partida para explorar opciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas actividades recomienda el selector y en qué categorías?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El selector proporciona recomendaciones en tres categorías: físicas, sociales y cognitivas. El número de sugerencias varía según el perfil resultante, pero en todos los casos cubre los tres ámbitos para promover un envejecimiento activo integral. Las actividades sociales incluyen desde grupos de voluntariado hasta talleres presenciales o virtuales.',
      },
    },
  ],
};
