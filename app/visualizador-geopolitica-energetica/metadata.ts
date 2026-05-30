import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geopolítica Energética: Flujos, Dependencias e Infraestructuras | meskeIA',
  description:
    'Visualiza los flujos de energía global: dependencia de la UE en gas y petróleo, mix energético por región, infraestructuras clave (gasoductos, LNG) y transición renovable. Datos IEA, Eurostat, IRENA.',
  keywords: [
    'geopolitica energetica',
    'dependencia energetica UE',
    'gas natural Europa',
    'gasoductos',
    'LNG',
    'transicion energetica',
    'mix energetico',
    'energias renovables',
    'flujos gas natural',
    'infraestructuras energeticas',
    'IEA',
    'Eurostat',
    'seguridad energetica',
  ],
  openGraph: {
    title: 'Geopolítica Energética | meskeIA',
    description:
      'Flujos, dependencias e infraestructuras del sistema energético global. Datos IEA y Eurostat.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Geopolítica Energética: Flujos, Dependencias e Infraestructuras",
  description: "Visualiza los flujos de energía global: dependencia de la UE en gas y petróleo, mix energético por región, infraestructuras clave (gasoductos, LNG) y transición renovable. Datos IEA, Eurostat, IRENA.",
  url: "https://meskeia.com/visualizador-geopolitica-energetica/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿De qué fuentes de energía depende más la Unión Europea y por qué supone un riesgo geopolítico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La UE importa en torno al 55–60% de su energía, con una dependencia histórica del gas natural ruso que llegó al 40% del consumo total antes de 2022. Esta concentración en un único proveedor expone a los países europeos a interrupciones de suministro con consecuencias económicas y políticas inmediatas. La invasión de Ucrania aceleró el proceso de diversificación hacia GNL (gas natural licuado) de EEUU, Qatar y otros proveedores, aunque la transición completa requiere años de inversión en infraestructura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el gas natural convencional y el GNL (Gas Natural Licuado)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El gas natural convencional se transporta por gasoductos fijos que requieren infraestructura permanente entre productor y consumidor. El GNL se enfría a −162 °C para licuarse, reduciendo su volumen 600 veces, lo que permite cargarlo en barcos metaneros y enviarlo a cualquier terminal de regasificación del mundo. El GNL otorga mayor flexibilidad geopolítica, pero su coste de licuefacción, transporte y regasificación lo hace más caro que el gas por tubería cuando ambas opciones están disponibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el mix energético y cómo varía entre regiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mix energético es la combinación de fuentes (carbón, gas, petróleo, nuclear, hidráulica, eólica, solar) que utiliza una región para generar electricidad y cubrir su demanda total de energía. Varía enormemente según recursos naturales, política industrial e inversión en renovables. Francia obtiene más del 70% de su electricidad de fuentes nucleares, mientras que países como Noruega superan el 90% en hidroeléctrica. Los datos del visualizador proceden de IEA, Eurostat e IRENA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de geopolítica energética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado para estudiantes de ciencias políticas, economía, relaciones internacionales y geografía, así como para periodistas, analistas y ciudadanos interesados en entender las dependencias energéticas globales sin necesidad de consultar extensos informes técnicos. Los datos se presentan con gráficos interactivos que facilitan la comparación entre regiones y la comprensión de los flujos de gas, petróleo y renovables.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juegan las energías renovables en la seguridad energética de un país?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las renovables (eólica, solar, hidráulica) reducen la dependencia de importaciones de combustibles fósiles porque se generan localmente. Un país con alta penetración renovable es menos vulnerable a crisis de suministro o a la volatilidad de los precios del gas y el petróleo. Sin embargo, la intermitencia de la solar y la eólica requiere inversión en almacenamiento (baterías, hidrógeno verde) o en interconexiones eléctricas con países vecinos para garantizar el suministro continuo.',
      },
    },
  ],
};
