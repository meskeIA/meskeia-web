import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Quesos - Variedades del mundo, maridaje y D.O. | meskeIA',
  description: '55 quesos del mundo: tipo de leche, maduración, notas de sabor, maridaje y denominación de origen. España, Francia, Italia, Reino Unido y más. Filtros por país, leche y tipo.',
  keywords: 'guia quesos mundo, manchego, camembert, parmigiano, cheddar, quesos espana, denominacion origen queso, maridaje queso vino, tipos queso, quesos azules, quesos curados',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Quesos | meskeIA',
    description: '55 quesos del mundo: tipo de leche, maduración, notas de sabor, maridaje y denominación de origen.',
    url: 'https://meskeia.com/guia-quesos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Quesos | meskeIA',
    description: '55 quesos del mundo: tipo de leche, maduración, notas de sabor y maridaje.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  other: {
    'application-name': 'Guía de Quesos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Quesos',
  description: 'Directorio de 55 quesos del mundo con tipo de leche, maduración, textura, corteza, notas de sabor, maridaje y denominación de origen. Incluye quesos de España, Francia, Italia, Reino Unido, Resto de Europa y América. Filtros por continente/país, tipo de leche y tipo de queso.',
  url: 'https://meskeia.com/guia-quesos/',
  features: [
    '55 quesos con perfil completo',
    'Filtros por país/región, tipo de leche y tipo de queso',
    'Búsqueda por nombre, país, región, notas o descripción',
    'Maridaje con vinos y acompañamientos específicos',
    'Denominaciones de origen (D.O./IGP)',
    'Curiosidades históricas y culturales',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un queso con D.O. y uno sin denominación de origen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un queso con Denominación de Origen Protegida (D.O.P. o D.O.) garantiza que se ha elaborado en una zona geográfica concreta, con leche de razas específicas y siguiendo un proceso tradicional regulado. Esto asegura características organolépticas consistentes. Los quesos sin D.O. pueden tener calidad excelente, pero no están sujetos a ese control de origen ni proceso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de leche afecta más al sabor del queso: vaca, oveja o cabra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La leche de oveja produce quesos con mayor contenido graso y proteico, resultando en sabores más intensos, grasos y complejos (Manchego, Pecorino Romano). La leche de cabra da quesos ácidos, con notas herbáceas y un punto lácteo característico (Chèvre, Garrotxa). La leche de vaca ofrece el mayor espectro de sabores, desde suaves y butirosos (Brie) hasta robustos y picantes (Cheddar curado), dependiendo de la maduración.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué vino marida mejor un queso azul como el Roquefort o el Gorgonzola?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los quesos azules intensos maridan excepcionalmente con vinos dulces: el Sauternes francés es el maridaje clásico del Roquefort, mientras que el Oporto Tawny combina bien con Gorgonzola. La razón es que el dulzor del vino equilibra la salinidad y el picante del moho. También funcionan cervezas de trigo belgas y cervezas de abadía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se conserva correctamente el queso en casa para que no se seque ni se enmohez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo ideal es envolver el queso en papel encerado o de horno (no film transparente, que asfixia el queso), guardarlo en el cajón de verduras de la nevera donde la temperatura es más estable (entre 4 °C y 8 °C). Los quesos frescos deben consumirse en pocos días; los curados aguantan semanas. Si aparece moho superficial en quesos curados (no azules), se puede retirar con un cuchillo limpio y seguir consumiéndolo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el Parmigiano-Reggiano y el Grana Padano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambos son quesos italianos de pasta dura y larga maduración, pero tienen diferencias relevantes. El Parmigiano-Reggiano tiene una zona de producción más restringida (Parma, Reggio Emilia, Módena...) y normas más estrictas: las vacas solo pueden comer heno y forraje natural. El Grana Padano permite una zona más amplia (Llanura Padana) y ciertos ensilados en la alimentación del ganado. Resultado: el Parmigiano tiende a ser más complejo y caro; el Grana Padano más accesible y ligeramente más suave.',
      },
    },
  ],
};
