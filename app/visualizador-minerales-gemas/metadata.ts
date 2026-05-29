import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Minerales y Gemas - Escala de Mohs y Piedras Preciosas | meskeIA',
  description: 'Explora la escala de Mohs con los 10 minerales de referencia, las gemas preciosas (diamante, rubí, zafiro, esmeralda), cómo se forman y sus usos industriales vs joyería.',
  keywords: 'minerales, gemas, escala Mohs, diamante, rubí, zafiro, esmeralda, dureza, cristalografía, piedras preciosas, corindón, cuarzo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Minerales y Gemas - Escala de Mohs y Piedras Preciosas',
    description: 'Los 10 minerales de Mohs, gemas cardinales, formación de diamantes y rubíes, y usos industriales vs joyería. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-minerales-gemas/',
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
    title: 'Minerales y Gemas - Explicador Visual',
    description: 'Del talco al diamante: la escala de Mohs, gemas preciosas y cómo se forman a miles de metros bajo tierra.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Minerales y Gemas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Minerales y Gemas - Escala de Mohs y Piedras Preciosas',
  description: 'Explicador visual interactivo sobre la escala de Mohs, gemas preciosas, formación de diamantes y rubíes, y usos industriales vs joyería.',
  url: 'https://meskeia.com/visualizador-minerales-gemas/',
  category: 'EducationalApplication',
  features: [
    'Escala de Mohs completa con 10 minerales y comparaciones prácticas',
    'Gemas preciosas: diamante, rubí, zafiro, esmeralda y más',
    'Formación: ígnea, sedimentaria y metamórfica con timeline',
    'Usos industriales vs joyería con datos curiosos',
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
      name: '¿Qué es la escala de Mohs y cómo se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La escala de Mohs es una escala de referencia de 1 a 10 que mide la dureza relativa de los minerales según su resistencia al rayado. Fue creada por Friedrich Mohs en 1812. El talco (1) es el más blando y el diamante (10) el más duro de los minerales naturales. Para medir la dureza de un mineral desconocido se intenta rayarlo con minerales de dureza conocida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un mineral, una roca y una gema?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un mineral es una sustancia sólida natural con composición química definida y estructura cristalina ordenada, como el cuarzo o la halita. Una roca es una mezcla de varios minerales, como el granito. Una gema es un mineral (o roca, en el caso del lapislázuli) que, por su belleza, dureza y rareza, se considera de valor para joyería u ornamentación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se forman los diamantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los diamantes se forman a una profundidad de 150-200 km bajo la corteza terrestre, donde las presiones superan los 45 kilobares y las temperaturas alcanzan los 900-1.300 °C. En esas condiciones el carbono cristaliza en estructura cúbica. Los diamantes llegan a la superficie transportados por erupciones volcánicas en rocas llamadas kimberlitas. Su formación puede tardar entre 1.000 millones y 3.300 millones de años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia un rubí de un zafiro si ambos son corindón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tanto el rubí como el zafiro son variedades del mineral corindón (Al₂O₃) con dureza 9 en la escala de Mohs. La diferencia es el elemento traza que les da color: el cromo produce el rojo característico del rubí, mientras que el hierro y el titanio dan el azul del zafiro. Los zafiros también pueden ser amarillos, verdes o rosas según las impurezas presentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usan los minerales industrialmente además de en joyería?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diamante, pese a ser la gema más valorada, tiene su mayor uso en industria: discos de corte, brocas de perforación y abrasivos. El cuarzo es la base de la industria electrónica (chips de silicio, osciladores). El talco se usa en cosmética, papelería y plásticos. La halita (sal) es fundamental en química industrial y alimentación. Más del 90% de los minerales extraídos mundialmente tienen destino industrial.',
      },
    },
  ],
};
