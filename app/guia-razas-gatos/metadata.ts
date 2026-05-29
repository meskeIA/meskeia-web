import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Directorio de Razas de Gatos - Guía Interactiva | meskeIA',
  description:
    'Explora 35 razas de gatos con filtros por tamaño, pelo, energía y compatibilidad. Encuentra la raza perfecta para tu hogar y estilo de vida.',
  keywords:
    'razas de gatos, directorio gatos, gatos por tamaño, gatos hipoalergénicos, gatos para niños, gatos para pisos, razas felinas, Maine Coon, Persa, Siamés, Bengal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Directorio de Razas de Gatos - Guía Interactiva',
    description:
      'Explora 35 razas de gatos con filtros por tamaño, pelo, energía y compatibilidad. Encuentra la raza perfecta para tu hogar.',
    url: 'https://meskeia.com/guia-razas-gatos/',
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
    title: 'Directorio de Razas de Gatos - meskeIA',
    description:
      'Encuentra tu raza de gato ideal entre 35 razas con filtros interactivos por tamaño, pelo, energía y compatibilidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía Razas de Gatos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Directorio de Razas de Gatos',
  description:
    'Directorio interactivo de 35 razas de gatos con filtros por tipo de pelo, energía, tamaño y compatibilidad con niños, perros y vida en interior. Encuentra la raza ideal para tu hogar.',
  url: 'https://meskeia.com/guia-razas-gatos/',
  features: [
    '35 razas de gatos con fichas detalladas',
    'Filtros por tipo de pelo, energía, tamaño y temperamento',
    'Compatibilidad con niños, perros y vida en interior',
    'Buscador por nombre de raza',
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
      name: '¿Qué raza de gato es más tranquila y adecuada para un piso pequeño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Razas como el Ragdoll, el Persa y el British Shorthair destacan por su temperamento calmado y su escasa necesidad de espacios amplios. El Ragdoll es especialmente conocido por relajarse completamente cuando se le coge en brazos. El Persa prefiere entornos tranquilos y rutinas estables. Todas estas razas se adaptan bien a la vida en interior siempre que dispongan de enriquecimiento ambiental (rascadores, juguetes, zonas elevadas para trepar).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existen razas de gatos hipoalergénicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe ninguna raza de gato completamente hipoalergénica, ya que la alergia se produce principalmente por la proteína Fel d 1 presente en la saliva, la orina y las glándulas sebáceas, no solo en el pelo. Sin embargo, algunas razas producen menos cantidad de esta proteína o mudan menos, lo que reduce la exposición al alérgeno: el Siberiano, el Balinés, el Devon Rex y el Cornish Rex suelen tolerarse mejor por personas con sensibilidad leve. Antes de adoptar se recomienda pasar tiempo con el animal concreto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué razas de gatos se llevan bien con niños y con perros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Maine Coon, el Ragdoll y el Abisinio son conocidos por su sociabilidad y su tolerancia ante otros animales y niños. El Maine Coon, en particular, es considerado el "perro de los gatos" por su carácter juguetón y su facilidad para interactuar con toda la familia, incluidos los perros. La introducción gradual y controlada entre animales es siempre recomendable independientemente de la raza, ya que el temperamento individual varía dentro de cada línea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo viven los gatos domésticos según su raza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La esperanza de vida media de un gato doméstico oscila entre 12 y 18 años, aunque existen diferencias notables por raza y estilo de vida. Las razas de origen natural con menor endogamia, como el Siberiano o el Noruego del Bosque, tienden a ser más longevas. Los gatos que viven exclusivamente en interior suelen superar a los que salen a la calle, cuya vida media se reduce a 5-7 años por accidentes, enfermedades infecciosas y depredadores. Una alimentación adecuada y revisiones veterinarias periódicas son los factores más influyentes en la longevidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un gato de pelo largo y uno de pelo corto en cuanto a mantenimiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los gatos de pelo largo como el Persa, el Maine Coon o el Angora turco requieren cepillado diario para evitar nudos y bolas de pelo, especialmente en épocas de muda. Los de pelo corto (Europeo, Abisinio, Burmés) necesitan solo un cepillado semanal. Los Rex (Devon Rex, Cornish Rex) tienen un pelo rizado muy fino que apenas se enreda pero es más frágil. El tiempo de aseo dedicado al gato impacta directamente en la cantidad de pelo que acaba en los muebles y en la frecuencia de los tricobezares (bolas de pelo digestivas).',
      },
    },
  ],
};
