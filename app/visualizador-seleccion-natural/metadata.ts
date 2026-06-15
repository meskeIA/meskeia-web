import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selección Natural - El Motor de la Evolución | meskeIA',
  description: 'Explora la selección natural de forma visual: variación, herencia, sobreproducción y selección. Ejemplos clásicos, Darwin vs Lamarck y datos fascinantes sobre evolución.',
  keywords: 'selección natural, evolución, Darwin, Lamarck, polilla del abedul, pinzones, resistencia antibióticos, herencia, adaptación, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Selección Natural - El Motor de la Evolución',
    description: 'Los 4 pilares de Darwin, ejemplos clásicos, comparativa Darwin vs Lamarck y datos fascinantes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-seleccion-natural/',
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
    title: 'Selección Natural - Explicador Visual Interactivo',
    description: 'Comprende la evolución por selección natural con simulaciones, ejemplos clásicos y comparativas visuales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Selección Natural meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Selección Natural - El Motor de la Evolución',
  description: 'Explicador visual interactivo sobre la selección natural: los 4 pilares de Darwin, simulación de poblaciones, ejemplos clásicos (polilla del abedul, pinzones, antibióticos), comparativa Darwin vs Lamarck y datos fascinantes sobre evolución.',
  url: 'https://meskeia.com/visualizador-seleccion-natural/',
  category: 'EducationalApplication',
  features: [
    'Simulación visual de selección natural con poblaciones de individuos coloreados',
    'Los 4 pilares de Darwin: variación, herencia, sobreproducción y selección',
    'Ejemplos clásicos: polilla del abedul, pinzones de Galápagos, resistencia a antibióticos',
    'Comparativa visual Darwin vs Lamarck con el ejemplo de la jirafa',
    'Datos fascinantes sobre evolución y selección natural',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la selección natural y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La selección natural es el proceso por el que los individuos con características que les dan ventaja en su entorno sobreviven y se reproducen más que los demás, transmitiendo esos rasgos a la siguiente generación. Se apoya en cuatro pilares: variación (los individuos difieren entre sí), herencia (los rasgos se transmiten), sobreproducción (nacen más individuos de los que sobreviven) y selección (el entorno favorece ciertos rasgos). Descrita por Charles Darwin en "El origen de las especies" (1859), es el principal motor de la evolución biológica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la teoría de Darwin y la de Lamarck?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lamarck propuso que los organismos adquieren características durante su vida por el uso o desuso de órganos, y que esos cambios se heredan (herencia de caracteres adquiridos). Darwin, en cambio, planteó que la variación ya existe en la población y que el entorno simplemente selecciona a los individuos mejor adaptados, sin que el esfuerzo individual cuente. El ejemplo clásico es la jirafa: Lamarck diría que su cuello se alargó por estirarse; Darwin diría que los individuos con cuello más largo ya existían y sobrevivieron mejor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la polilla del abedul es un ejemplo de selección natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la Inglaterra preindustrial, las polillas claras eran mayoritarias porque se camuflaban en cortezas de abedul cubiertas de líquenes. Con la Revolución Industrial, el hollín oscureció los troncos y las polillas oscuras (variante melanística) pasaron a ser las menos visibles para los depredadores. En pocas décadas la proporción se invirtió: las oscuras dominaban en zonas industriales. Cuando se redujo la contaminación en el siglo XX, las claras volvieron a ser más frecuentes. Es uno de los casos de selección natural más documentados en tiempo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se relaciona la resistencia a los antibióticos con la selección natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando usamos antibióticos, eliminamos la mayoría de las bacterias, pero las pocas que por variación genética toleran mejor el fármaco sobreviven y se reproducen. Sus descendientes heredan esa resistencia. El uso excesivo o incompleto de antibióticos actúa como presión selectiva que favorece precisamente a las bacterias más resistentes. Este proceso, que puede ocurrir en días o semanas, es la misma lógica darwiniana actuando a escala microbiana y es una de las principales amenazas de salud pública del siglo XXI.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda la selección natural en producir cambios visibles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la velocidad de reproducción y de la intensidad de la presión selectiva. En bacterias, pueden surgir resistencias en horas o días. En insectos como la polilla del abedul, los cambios de frecuencia poblacional se observaron en pocas décadas. En vertebrados los cambios suelen tardar miles o millones de años para producir nuevas especies, aunque se han documentado adaptaciones morfológicas en aves y lagartijas en 20-40 generaciones bajo presión ambiental fuerte.',
      },
    },
  ],
};
