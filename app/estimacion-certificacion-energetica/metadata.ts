import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimacion de Certificacion Energetica - Letra Eficiencia Vivienda | meskeIA',
  description:
    'Estima la letra energetica de tu vivienda (A-G) segun antiguedad, aislamiento, ventanas, calefaccion y zona climatica. Orientativo, no sustituye al certificado oficial.',
  keywords:
    'certificado energetico, letra energetica vivienda, etiqueta energetica casa, certificacion energetica Espana, cuanto consume mi casa, eficiencia energetica hogar, clase energetica piso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimacion de Certificacion Energetica | meskeIA',
    description:
      'Calcula una estimacion orientativa de la letra energetica de tu vivienda segun sus caracteristicas. Gratuito y sin registro.',
    url: 'https://meskeia.com/estimacion-certificacion-energetica/',
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
    title: 'Estimacion de Certificacion Energetica | meskeIA',
    description:
      'Descubre la letra energetica aproximada de tu vivienda (A-G) segun antiguedad, aislamiento y sistemas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimacion Certificacion Energetica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimacion de Certificacion Energetica',
  description:
    'Herramienta orientativa para estimar la letra de eficiencia energetica (A-G) de una vivienda en Espana segun su antiguedad, zona climatica, aislamiento, ventanas, sistema de calefaccion, agua caliente, energias renovables y orientacion.',
  url: 'https://meskeia.com/estimacion-certificacion-energetica/',
  features: [
    'Estimacion de letra energetica A-G segun 8 factores',
    'Consumo estimado en kWh/m2/ano y emisiones CO2',
    'Sugerencias de mejora personalizadas',
    'Barra comparativa visual de todas las letras',
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
      name: '¿Qué es el certificado de eficiencia energética y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El certificado de eficiencia energética es un documento oficial, emitido por un técnico competente, que asigna a una vivienda o edificio una letra de la A (más eficiente) a la G (menos eficiente) en función de su consumo de energía y sus emisiones de CO₂. En España es obligatorio para vender o alquilar cualquier inmueble desde 2013, y su ausencia puede acarrear sanciones de entre 300 y 6.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la letra energética de una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un técnico utiliza software homologado (CE3X, HULC u otros reconocidos por el Ministerio) para modelar la vivienda teniendo en cuenta la zona climática, el año de construcción, el grosor y tipo de aislamiento en fachada y cubierta, el tipo de ventanas, los sistemas de calefacción, refrigeración y agua caliente sanitaria, y la presencia de energías renovables. El resultado es un indicador en kWh/m²·año de energía primaria no renovable y otro de emisiones de CO₂ que se comparan con los rangos de cada letra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta obtener el certificado energético de una vivienda en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El precio varía según la comunidad autónoma, el tamaño del inmueble y el técnico contratado. Para un piso de tamaño medio (70-100 m²) el coste habitual oscila entre 80 € y 200 €, incluyendo la visita del técnico y el registro oficial. Algunos colegios profesionales publican tarifas orientativas. La herramienta de estimación orientativa permite hacerse una idea de la letra probable antes de contratar el certificado oficial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tiene de vigencia el certificado de eficiencia energética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El certificado de eficiencia energética tiene una validez de 10 años desde su fecha de emisión y registro, siempre que no se realicen reformas significativas en el inmueble que alteren sus características energéticas. Si se ejecutan obras de mejora (como sustitución de ventanas, adición de aislamiento o cambio de caldera), conviene renovarlo para reflejar la nueva calificación, ya que podría mejorar la letra y facilitar la venta o alquiler.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué obras mejoran más la letra energética de una vivienda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las medidas con mayor impacto suelen ser el aislamiento de fachada (sistema SATE), la sustitución de ventanas de simple vidrio por doble o triple acristalamiento con rotura de puente térmico, y la instalación de bomba de calor en lugar de caldera de combustible fósil. La instalación de paneles solares fotovoltaicos o térmicos también mejora significativamente la calificación. El peso de cada medida varía según la zona climática y el estado de partida del inmueble.',
      },
    },
  ],
};
