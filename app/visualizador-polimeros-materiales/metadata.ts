import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-polimeros-materiales';
const TITLE = 'Polímeros y Materiales: Plásticos, Propiedades y Reciclaje - meskeIA';
const DESCRIPTION = 'Visualiza la polimerización por adición y condensación, propiedades de termoplásticos y termoestables, clasificación de plásticos y su ciclo de vida medioambiental.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Polimerización por adición y condensación con animación interactiva',
      'Comparativa de propiedades de 6 polímeros comunes',
      'Clasificación de termoplásticos, termoestables y elastómeros',
      'Ciclo de vida del plástico y biodegradabilidad',
      'Biopolímeros y economía circular',
      '7 códigos de reciclaje de plásticos',
    ],
  });
}

export const jsonLd = generateWebAppSchema({
  name: "Polímeros y Materiales: Plásticos, Propiedades y Reciclaje",
  description: "Visualizador interactivo de polímeros. Polimerización por adición (PE, PVC, PS) vs condensación (nylon, PET, policarbonato), propiedades Tm/Tg/densidad de 6 polímeros comunes, clasificación termoplást",
  url: "https://meskeia.com/visualizador-polimeros-materiales/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un polímero y cómo se forma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un polímero es una macromolécula formada por la repetición de unidades más pequeñas llamadas monómeros, unidas mediante enlaces covalentes. Se forman en reacciones de polimerización: por adición (como el polietileno, donde los monómeros se unen sin perder átomos) o por condensación (como el nylon, donde se libera agua u otra molécula pequeña en cada paso de unión).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre termoplásticos y termoestables?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los termoplásticos (PE, PET, PVC, poliestireno) se ablandan al calentar y solidifican al enfriar, lo que permite moldearlos y reciclarlos varias veces. Los termoestables (resinas epoxi, baquelita, melamina) forman redes tridimensionales irreversibles al curar; una vez endurecidos no pueden fundirse de nuevo, lo que los hace más resistentes al calor pero imposibles de reciclar por fusión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significan los códigos de reciclaje del 1 al 7 en los envases de plástico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los 7 códigos identifican el tipo de resina: 1-PET (botellas de agua), 2-HDPE (garrafas de leche), 3-PVC (tuberías), 4-LDPE (bolsas), 5-PP (tapones, fiambreras), 6-PS (poliestireno expandido), 7-otros (PC, PLA, mezclas). Los números 1, 2 y 5 son los más aceptados en los sistemas municipales de reciclaje de la mayoría de países.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la temperatura de transición vítrea (Tg) de un polímero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temperatura de transición vítrea (Tg) es el punto por debajo del cual un polímero amorfo se vuelve rígido y frágil, como un cristal. Por encima de la Tg, las cadenas tienen movilidad y el material es más flexible o elástico. Por ejemplo, el PVC tiene Tg ≈ 87 °C; el poliestireno ≈ 100 °C. Esta propiedad determina el rango de temperaturas de uso de cada plástico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los biopolímeros y en qué se diferencian de los plásticos convencionales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los biopolímeros son polímeros de origen biológico o biodegradable, como el PLA (ácido poliláctico, fabricado de almidón de maíz) o el PHA (polihidroxialcanoatos, producido por bacterias). A diferencia de los plásticos derivados del petróleo, pueden biodegradarse en condiciones específicas. Sin embargo, muchos requieren compostaje industrial a alta temperatura, no se degradan en el entorno natural como suele creerse.',
      },
    },
  ],
};
