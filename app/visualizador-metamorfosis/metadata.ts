import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Metamorfosis - La Transformación más Radical de la Naturaleza | meskeIA',
  description: 'Descubre la metamorfosis animal paso a paso: completa (mariposa), incompleta (saltamontes) y anfibio (rana). Explicador visual interactivo con animaciones.',
  keywords: 'metamorfosis, mariposa, rana, saltamontes, holometábola, hemimetábola, larva, pupa, crisálida, renacuajo, biología, ciclo vida',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Metamorfosis - La Transformación más Radical de la Naturaleza',
    description: 'De oruga a mariposa, de renacuajo a rana: la metamorfosis animal como nunca la habías visto.',
    url: 'https://meskeia.com/visualizador-metamorfosis/',
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
    title: 'Metamorfosis Animal - Explicador Visual',
    description: 'Tres tipos de metamorfosis animal explicados con animaciones paso a paso.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Metamorfosis Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Metamorfosis - La Transformación más Radical de la Naturaleza',
  description: 'Explicador visual interactivo sobre la metamorfosis animal: completa (mariposa), incompleta (saltamontes) y anfibio (rana). Animaciones de transformación, datos por fase y curiosidades.',
  url: 'https://meskeia.com/visualizador-metamorfosis/',
  category: 'EducationalApplication',
  features: [
    'Metamorfosis completa: mariposa monarca paso a paso',
    'Metamorfosis incompleta: saltamontes y libélula',
    'Metamorfosis anfibio: de renacuajo a rana',
    'Datos fascinantes sobre transformación animal',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la metamorfosis animal y cuántos tipos existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La metamorfosis es el proceso de transformación morfológica y fisiológica que experimentan algunos animales durante su desarrollo. Existen tres grandes tipos: la metamorfosis completa (holometábola), propia de mariposas, moscas y escarabajos, que pasa por huevo, larva, pupa e imago; la metamorfosis incompleta (hemimetábola), de saltamontes y libélulas, con etapas de huevo, ninfa y adulto; y la metamorfosis de anfibios, como la rana, que transita de renacuajo acuático a adulto terrestre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre dentro de la crisálida de una mariposa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dentro de la crisálida tienen lugar cambios radicales: casi todos los tejidos de la oruga se disuelven en una especie de "sopa celular" gracias a enzimas digestivas. Solo sobreviven grupos de células llamados discos imaginales, que sirven de plantilla para reconstruir los órganos del adulto. Este proceso de reorganización completa dura entre 10 días y varios meses según la especie, y está controlado por hormonas como la ecdisona y la hormona juvenil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las ranas tienen renacuajos en lugar de nacer ya con forma adulta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los renacuajos son una adaptación evolutiva que permite aprovechar dos nichos ecológicos distintos: el acuático (renacuajo herbívoro) y el terrestre (rana adulta carnívora). Esto reduce la competencia por recursos entre adultos y jóvenes de la misma especie. Además, el ambiente acuático protege los huevos y las larvas en sus etapas más vulnerables. La transición implica reabsorber la cola, desarrollar pulmones y patas, y reestructurar el sistema digestivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la metamorfosis completa e incompleta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la metamorfosis completa (holometábola) la larva tiene un aspecto completamente diferente al adulto y existe una fase de pupa en la que ocurre la reorganización total del cuerpo. En la incompleta (hemimetábola) no existe fase de pupa: las ninfas se parecen ya al adulto, solo que sin alas ni madurez sexual, y van creciendo mediante mudas sucesivas hasta alcanzar la forma definitiva. La metamorfosis completa afecta al 80% de los insectos conocidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos animales en el mundo experimentan metamorfosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que más de un millón de especies animales conocidas experimentan algún tipo de metamorfosis, lo que representa cerca del 65% del total de especies animales descritas. El grupo más numeroso son los insectos holometábolos (órdenes como Lepidoptera, Diptera, Coleoptera e Hymenoptera), que suman más de 800.000 especies. También experimentan metamorfosis los anfibios (~8.000 especies), algunos peces marinos y numerosos invertebrados marinos.',
      },
    },
  ],
};
