import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Respiratorio - Del Aire al Oxígeno | meskeIA',
  description: 'Entiende cómo funcionan tus pulmones: anatomía del aparato respiratorio, intercambio gaseoso en los alvéolos, volúmenes pulmonares y espirometría visual.',
  keywords: 'sistema respiratorio, pulmones, alvéolos, diafragma, intercambio gaseoso, espirometría, volúmenes pulmonares, O2, CO2, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Respiratorio - Del Aire al Oxígeno',
    description: 'Anatomía pulmonar, intercambio O₂/CO₂, espirometría y enfermedades respiratorias explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-sistema-respiratorio/',
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
    title: 'El Sistema Respiratorio - Del Aire al Oxígeno',
    description: 'Pulmones, alvéolos, diafragma, intercambio gaseoso y espirometría visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Respiratorio meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Respiratorio - Del Aire al Oxígeno',
  description: 'Explicador visual interactivo del aparato respiratorio humano: anatomía pulmonar, intercambio gaseoso O₂/CO₂ en los alvéolos, volúmenes pulmonares con espirometría visual, y datos sobre enfermedades respiratorias.',
  url: 'https://meskeia.com/visualizador-sistema-respiratorio/',
  category: 'EducationalApplication',
  features: [
    'Anatomía interactiva del aparato respiratorio',
    'Intercambio gaseoso O₂/CO₂ en alvéolos con diagrama SVG',
    'Espirometría visual con volúmenes pulmonares',
    'Enfermedades respiratorias: asma, EPOC, neumotórax',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el sistema respiratorio paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El aire entra por la nariz o la boca, pasa por la faringe y la laringe, desciende por la tráquea y se ramifica en los dos bronquios principales. Estos se subdividen en bronquiolos hasta llegar a los alvéolos pulmonares, donde se produce el intercambio gaseoso: el oxígeno pasa a la sangre y el dióxido de carbono pasa desde la sangre al aire para ser exhalado. El diafragma es el músculo principal que impulsa este ciclo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el intercambio gaseoso y dónde ocurre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El intercambio gaseoso es el proceso por el que el oxígeno del aire inspirado pasa a la sangre y el dióxido de carbono de la sangre pasa al aire para ser exhalado. Ocurre en los alvéolos pulmonares, pequeños sacos de paredes muy finas (0,2 μm) rodeados de capilares. La superficie total de alvéolos en un adulto equivale aproximadamente a una pista de tenis (70-80 m²), lo que maximiza la eficiencia del intercambio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide una espirometría y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La espirometría mide los volúmenes y flujos de aire que el pulmón puede movilizar. Los parámetros clave son la capacidad vital forzada (CVF), el volumen espiratorio forzado en el primer segundo (FEV1) y la relación FEV1/CVF. Sirve para diagnosticar y clasificar enfermedades como el asma (patrón obstructivo reversible) y la EPOC (patrón obstructivo irreversible), y para monitorizar su evolución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre asma, EPOC y neumotórax?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El asma es una inflamación crónica de las vías aéreas con obstrucción reversible, habitualmente desencadenada por alérgenos o ejercicio. La EPOC (enfermedad pulmonar obstructiva crónica) causa obstrucción progresiva e irreversible, relacionada principalmente con el tabaquismo. El neumotórax es la presencia de aire entre el pulmón y la pared torácica que provoca el colapso parcial o total del pulmón, y es una urgencia médica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas veces respira una persona en un día y qué volumen de aire mueve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En reposo, una persona adulta respira entre 12 y 20 veces por minuto, lo que supone entre 17.000 y 28.000 respiraciones al día. Cada respiración normal mueve unos 500 ml de aire (volumen corriente), por lo que el volumen respiratorio diario en reposo ronda los 8.000-12.000 litros. Durante el ejercicio intenso, la frecuencia y el volumen por respiración pueden multiplicarse por cinco o más.',
      },
    },
  ],
};
