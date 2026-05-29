import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador Lorem Ipsum - Texto de Prueba Online | meskeIA',
  description: 'Genera texto Lorem Ipsum de 1 a 10 párrafos. Ideal para diseño, maquetación y desarrollo web. Texto de relleno profesional, gratis y sin registro.',
  keywords: 'lorem ipsum, generador lorem ipsum, texto de prueba, texto de relleno, placeholder text, dummy text, maquetacion, diseño web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador Lorem Ipsum Online | meskeIA',
    description: 'Genera texto Lorem Ipsum para diseño y desarrollo web.',
    url: 'https://meskeia.com/generador-lorem-ipsum/',
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
    title: 'Generador Lorem Ipsum | meskeIA',
    description: 'Genera texto de prueba Lorem Ipsum para tus proyectos de diseño',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador Lorem Ipsum",
  description: "Genera texto Lorem Ipsum de 1 a 10 párrafos. Ideal para diseño, maquetación y desarrollo web. Texto de relleno profesional, gratis y sin registro.",
  url: "https://meskeia.com/generador-lorem-ipsum/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es Lorem Ipsum y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lorem Ipsum es un texto de relleno estándar utilizado en diseño gráfico, maquetación editorial y desarrollo web desde los años 60. Su función es simular texto real en una maqueta sin que el contenido distraiga al observador del diseño visual. Aunque parece latín, es en realidad una versión alterada de un pasaje del tratado filosófico "De Finibus Bonorum et Malorum" de Cicerón (45 a.C.).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los diseñadores usan Lorem Ipsum en lugar de texto real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El texto de relleno permite evaluar la composición tipográfica, el espaciado y el ritmo visual de una maqueta sin que el cerebro se "distraiga" leyendo el contenido. Si se usa texto real con significado, los revisores tienden a comentar el mensaje en lugar del diseño. El Lorem Ipsum tiene una distribución de letras y longitudes de palabras similar al inglés o al latín, lo que lo hace visualmente equilibrado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos párrafos de Lorem Ipsum necesito para una maqueta web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del tipo de página. Para una tarjeta de presentación o un componente de card suele bastar con 1 párrafo (2-4 líneas). Para una página de artículo o landing page se usan habitualmente entre 3 y 5 párrafos. Para simular una página de texto largo (política de privacidad, artículo de blog) se recomienda entre 5 y 10 párrafos. Lo importante es que el bloque de texto tenga una extensión similar al contenido final previsto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe alguna alternativa moderna al Lorem Ipsum?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Existen alternativas temáticas como Cupcake Ipsum (texto sobre postres), Hipster Ipsum (jerga hipster), Samuel L. Ipsum (citas de películas) o Bacon Ipsum. Para proyectos en español hay generadores de texto de relleno en castellano, útiles cuando el cliente necesita revisar la tipografía en su propio idioma. Algunos equipos prefieren usar texto real del cliente desde las primeras fases del diseño para evitar sorpresas tipográficas en idiomas con caracteres especiales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Lorem Ipsum tiene algún significado en latín?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Lorem Ipsum estándar comienza con "Lorem ipsum dolor sit amet, consectetur adipiscing elit..." y es una versión deliberadamente alterada de un texto de Cicerón, con palabras cambiadas para que no tenga un sentido completo y no distraiga. El fragmento original latino, con sentido filosófico, proviene del libro "De Finibus Bonorum et Malorum" y habla sobre el placer y el dolor como criterios del bien y el mal.',
      },
    },
  ],
};
