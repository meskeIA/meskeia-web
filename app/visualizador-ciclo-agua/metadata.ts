import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Ciclo del Agua - El Viaje Infinito de cada Gota | meskeIA',
  description: 'Explicador visual interactivo del ciclo hidrologico completo: evaporacion, condensacion, precipitacion, escorrentia e infiltracion. Datos de escala y tiempos de residencia.',
  keywords: 'ciclo del agua, ciclo hidrologico, evaporacion, condensacion, precipitacion, escorrentia, infiltracion, agua planeta, acuiferos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Ciclo del Agua - El Viaje Infinito de cada Gota',
    description: 'Descubre como viaja el agua por la Tierra: evaporacion, nubes, lluvia, rios y acuiferos en un ciclo que dura miles de millones de anos.',
    url: 'https://meskeia.com/visualizador-ciclo-agua/',
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
    title: 'El Ciclo del Agua - El Viaje Infinito de cada Gota',
    description: 'El agua que bebes hoy puede haber sido bebida por un dinosaurio. Explicador visual interactivo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Ciclo del Agua meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Ciclo del Agua - El Viaje Infinito de cada Gota',
  description: 'Explicador visual interactivo del ciclo hidrologico: evaporacion, condensacion, precipitacion, escorrentia, infiltracion. Distribucion del agua en la Tierra y tiempos de residencia.',
  url: 'https://meskeia.com/visualizador-ciclo-agua/',
  features: [
    'Diagrama animado del ciclo hidrologico completo',
    'Distribucion del agua en la Tierra con escalas proporcionales',
    'Tiempos de residencia del agua en cada reservorio',
    'Datos fascinantes sobre el agua y cambio climatico',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ciclo del agua y cuáles son sus fases principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo del agua, también llamado ciclo hidrológico, es el proceso continuo por el que el agua circula entre la atmósfera, la superficie terrestre y el subsuelo. Sus fases principales son: evaporación (el agua líquida se convierte en vapor), condensación (el vapor forma nubes), precipitación (lluvia, nieve o granizo), escorrentía (el agua fluye por la superficie hacia ríos y mares) e infiltración (el agua se filtra al subsuelo recargando acuíferos).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta agua dulce hay en la Tierra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agua cubre el 71% de la superficie terrestre, pero el 97,5% de toda esa agua es salada. Del 2,5% restante de agua dulce, aproximadamente el 69% está atrapada en glaciares y casquetes polares, el 30% en acuíferos subterráneos, y solo el 0,3% se encuentra en lagos, ríos y humedales superficiales de acceso más fácil. Esto significa que menos del 1% del agua total del planeta es agua dulce accesible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo puede tardar una gota de agua en completar el ciclo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo de residencia del agua varía enormemente según el reservorio. Una gota de agua en la atmósfera permanece unos 9 días antes de precipitar. En un río puede tardar entre 2 semanas y varios meses. En un lago, de meses a años. En un acuífero profundo, el agua puede permanecer cientos o incluso miles de años. En los casquetes polares, las moléculas de agua pueden haber permanecido inmovilizadas hasta 900.000 años.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la evapotranspiración y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La evapotranspiración es la combinación de la evaporación directa del suelo y las superficies de agua con la transpiración de las plantas. Las plantas absorben agua del suelo a través de las raíces y la liberan en forma de vapor a través de sus hojas (transpiración). Este proceso es fundamental en el ciclo del agua: los bosques tropicales, por ejemplo, generan sus propias lluvias al reciclar localmente grandes cantidades de vapor de agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el cambio climático al ciclo del agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El aumento de la temperatura global intensifica el ciclo del agua: mayor evaporación significa más vapor en la atmósfera, lo que produce precipitaciones más intensas y episodios extremos como inundaciones y sequías. Los glaciares que alimentan ríos y acuíferos se derriten a mayor velocidad, alterando el suministro de agua dulce en muchas regiones. Los patrones de lluvia se desplazan geográficamente, creando escasez en zonas históricamente húmedas y exceso en otras.',
      },
    },
  ],
};
