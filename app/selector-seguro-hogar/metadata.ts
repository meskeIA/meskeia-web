import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { VEREDICTOS, type VeredictoKey } from './motor';

/** Las funciones reales de la app: alimentan la meta schema:WebApplication y el JSON-LD (§1.ter;
 *  el JSON-LD salía con "featureList": [], hallazgo 1523). */
const FUNCIONES = [
  'Test de 10 preguntas sobre la vivienda, la zona y lo que quieres proteger',
  'Orientación entre cobertura básica, multirriesgo estándar o multirriesgo completa',
  'Distingue propietario con o sin hipoteca, inquilino y vivienda alquilada a otros',
  'Contempla segundas residencias y viviendas vacías',
  'Coberturas incluidas y recomendadas según lo que declaras',
  'Avisa cuando lo declarado (precio, objetos de valor) no encaja con la cobertura',
  'Explica la regla proporcional del infraseguro con un ejemplo',
  '100% en el navegador, sin registro',
];

/** El FAQPage describe los MISMOS niveles y precios que la pantalla (hallazgo 1516, forma h). */
const enumerar = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
const incluye = (k: VeredictoKey) =>
  enumerar(VEREDICTOS[k].coberturaIncluida.filter((i) => !i.texto.startsWith('Todo lo de')).map((i) => i.texto.charAt(0).toLowerCase() + i.texto.slice(1)));
const RESPUESTA_NIVELES =
  `En este test, la cobertura básica incluye ${incluye('basica')}. La multirriesgo estándar añade ${incluye('estandar')}. ` +
  `La completa, además, ${incluye('completa')}. Como horquilla orientativa (estimación de meskeIA para una vivienda media en España): ` +
  `${VEREDICTOS.basica.precioOrientativo} la básica, ${VEREDICTOS.estandar.precioOrientativo} la estándar y ${VEREDICTOS.completa.precioOrientativo} la completa; ` +
  'el precio real depende del capital asegurado, la zona, la vivienda y la aseguradora. Quien vive de alquiler no asegura el continente, que es del propietario: le basta el contenido y la responsabilidad civil.';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Hogar — ¿Qué cobertura necesitas? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de seguro de hogar te conviene: cobertura básica, multirriesgo estándar o completa. Según vivienda, zona, contenido y prioridades. Útil seas propietario o estés de alquiler (arriendo).',
  keywords: [
    'qué seguro de hogar contratar',
    'selector seguro hogar',
    'seguro hogar básico o completo',
    'multirriesgo hogar España',
    'cobertura seguro vivienda',
    'seguro hogar propietario inquilino',
    'seguro hogar alquiler arriendo',
    'qué cubre el seguro de hogar',
    'seguro hogar piso',
    'contratar seguro hogar España',
    'cobertura mínima seguro hogar',
  ],
  openGraph: {
    title: '¿Qué seguro de hogar necesitas? Test en 10 preguntas | meskeIA',
    description: 'Básico, multirriesgo o completo: descubre la cobertura adecuada para tu vivienda, zona y situación personal en 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-seguro-hogar/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué seguro de hogar te conviene? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para saber si necesitas cobertura básica, multirriesgo o completa para tu vivienda.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-seguro-hogar/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Seguro de Hogar',
      description: 'Test orientativo para determinar qué tipo de seguro de hogar conviene según tipo de vivienda, régimen de tenencia, zona geográfica, valor del contenido y prioridades del usuario.',
      url: 'https://meskeia.com/selector-seguro-hogar/',
      features: FUNCIONES,
    })),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Seguro de Hogar",
  description: "Test de 10 preguntas para saber qué tipo de seguro de hogar te conviene: cobertura básica, multirriesgo estándar o completa. Según vivienda, zona, contenido y prioridades.",
  url: "https://meskeia.com/selector-seguro-hogar/",
  category: 'FinanceApplication',
  features: FUNCIONES,
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué cubre un seguro de hogar básico y en qué se diferencia de un multirriesgo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_NIVELES,
      },
    },
    {
      '@type': 'Question',
      name: '¿El seguro de hogar es obligatorio si vivo de alquiler (arriendo)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No es legalmente obligatorio para el inquilino en España, aunque muchos contratos de arrendamiento (arriendo) lo exigen. El propietario suele tener su propio seguro de continente; el inquilino es responsable del contenido de la vivienda y de su responsabilidad civil frente a terceros. Contratar un seguro de hogar para inquilinos (que cubre contenido + RC) es muy recomendable porque protege los bienes propios y cubre daños accidentales a la vivienda o a vecinos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el valor del continente y del contenido para asegurar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El continente se asegura por el coste de reconstrucción de la vivienda (no el valor de mercado ni el precio de compra). Se estima multiplicando los metros cuadrados construidos por el módulo de construcción de la zona, que en España oscila entre 700 y 1.200 €/m² según la comunidad autónoma. El contenido se valora sumando el precio de reposición de muebles, electrodomésticos y objetos personales; muchas aseguradoras ofrecen tablas orientativas basadas en las habitaciones y metros cuadrados del hogar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores hacen que el seguro de hogar sea más caro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores que más encarecen la prima son: vivienda en zona de riesgo (inundación, terremoto o alta criminalidad), valor alto de continente o contenido, vivienda vacacional o no habitual, edificios antiguos sin reformar y solicitar capital asegurado elevado en joyas u objetos de valor. Por el contrario, la instalación de alarma conectada a central, medidas antirrobo y la contratación combinada con otros seguros de la misma compañía suelen generar descuentos del 10-20%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Vale la pena pagar más por la cobertura de responsabilidad civil en el seguro de hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí; la cobertura de responsabilidad civil es una de las más valiosas en el seguro de hogar y su coste marginal es bajo. Cubre los daños que tú o tu familia podáis causar accidentalmente a terceros dentro y fuera del hogar (un escape de agua que inunda al vecino, una rotura en una instalación comunitaria, etc.). Una indemnización por daños a terceros puede superar fácilmente los 30.000 €, mientras que el sobrecoste de incluir RC en la póliza suele ser inferior a 30 € anuales.',
      },
    },
  ],
};
