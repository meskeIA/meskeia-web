import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Árbol de la Vida Animal - De las Esponjas a los Mamíferos | meskeIA',
  description: 'Explora el árbol filogenético del reino animal: 12 grandes grupos, características evolutivas, números de especies y una línea temporal de 540 millones de años. Explicador visual interactivo.',
  keywords: 'árbol filogenético, reino animal, evolución, vertebrados, invertebrados, filogenia, clasificación animales, especies, explosión cámbrica, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Árbol de la Vida Animal - De las Esponjas a los Mamíferos',
    description: 'Explora los 12 grandes grupos del reino animal, sus características evolutivas y 540 millones de años de historia.',
    url: 'https://meskeia.com/visualizador-arbol-vida/',
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
    title: 'El Árbol de la Vida Animal - Explicador Visual',
    description: 'De las esponjas a los mamíferos: el árbol filogenético del reino animal explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Árbol de la Vida meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Árbol de la Vida Animal - De las Esponjas a los Mamíferos',
  description: 'Explicador visual interactivo sobre el árbol filogenético del reino animal. Desde el ancestro común eucariota hasta los mamíferos, pasando por 12 grandes grupos, características evolutivas clave, números de especies y una línea temporal de 540 millones de años.',
  url: 'https://meskeia.com/visualizador-arbol-vida/',
  category: 'EducationalApplication',
  features: [
    'Árbol filogenético interactivo con 12 grandes grupos animales',
    'Tabla visual de características evolutivas por grupo',
    'Gráfico de número de especies con datos reales',
    'Timeline de 540 millones de años de evolución animal',
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
      name: '¿Qué es el árbol filogenético del reino animal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El árbol filogenético del reino animal es un diagrama que representa las relaciones evolutivas entre los distintos grupos de animales. Muestra cómo todos los animales descienden de un ancestro común y se han ido diversificando a lo largo de más de 540 millones de años, desde la explosión cámbrica hasta la actualidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los 12 grandes grupos del reino animal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los 12 grandes grupos del reino animal incluyen poríferos (esponjas), cnidarios (medusas y corales), platelmintos (gusanos planos), anélidos (lombrices), moluscos (pulpos y caracoles), artrópodos (insectos y arácnidos), equinodermos (estrellas de mar), cefalocordados, urocordados, peces, anfibios y amniotes (reptiles, aves y mamíferos). Cada grupo comparte características evolutivas únicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas especies animales existen en la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se estima que existen entre 8 y 10 millones de especies animales en la Tierra, aunque solo se han descrito científicamente alrededor de 1,5 millones. Los artrópodos son el grupo más diverso, con más de un millón de especies conocidas, siendo los insectos el grupo más numeroso con unas 900.000 especies descritas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo aparecieron los primeros animales en la historia de la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los primeros animales multicelulares aparecieron hace unos 600-700 millones de años, pero fue la llamada explosión cámbrica, hace aproximadamente 540 millones de años, cuando surgió la mayoría de los grandes grupos animales en un período geológico relativamente corto. Este evento representa uno de los momentos más importantes en la historia de la vida en la Tierra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia a los vertebrados del resto de animales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los vertebrados se distinguen por poseer una columna vertebral (espina dorsal) formada por vértebras óseas o cartilaginosas que protege la médula espinal. Además presentan un cráneo que encierra el cerebro, un sistema nervioso central bien desarrollado y, en la mayoría de los casos, un esqueleto interno. A pesar de su complejidad, los vertebrados representan solo el 3-5% de todas las especies animales conocidas.',
      },
    },
  ],
};
