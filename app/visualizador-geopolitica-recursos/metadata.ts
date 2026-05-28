import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geopolítica de los Recursos - Petróleo, Litio y Tierras Raras | meskeIA',
  description: 'Visualiza la distribución global de recursos estratégicos: petróleo, gas, litio, tierras raras y cobre. Dependencia de Europa, conflictos por recursos y transición energética.',
  keywords: ['geopolitica recursos', 'litio', 'tierras raras', 'petroleo', 'dependencia energetica europa', 'recursos estrategicos', 'conflictos recursos', 'transicion energetica', 'cobre', 'gas natural'],
  openGraph: {
    title: 'Geopolítica de los Recursos | meskeIA',
    description: 'Mapa interactivo de recursos estratégicos globales y la dependencia de Europa.',
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
  name: "Geopolítica de los Recursos - Petróleo, Litio y Tierras Raras",
  description: "Visualiza la distribución global de recursos estratégicos: petróleo, gas, litio, tierras raras y cobre. Dependencia de Europa, conflictos por recursos y transición energética.",
  url: "https://meskeia.com/visualizador-geopolitica-recursos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los recursos estratégicos y por qué son geopolíticamente críticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los recursos estratégicos son materias primas cuya escasez o control por parte de pocos países puede condicionar la economía, la seguridad y la política de otras naciones. Incluyen combustibles fósiles (petróleo, gas), minerales para tecnología verde (litio, cobalto) y tierras raras. Su importancia geopolítica radica en que los países productores pueden usar el suministro como palanca de negociación o de presión en conflictos internacionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué es tan importante el litio en la geopolítica actual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El litio es el componente clave de las baterías de iones de litio usadas en vehículos eléctricos y almacenamiento de energía renovable. Aproximadamente el 60% de las reservas mundiales se concentran en el "triángulo del litio" formado por Chile, Argentina y Bolivia. China controla gran parte de la capacidad de refinado y producción de baterías, lo que le otorga una ventaja estructural en la transición energética global y genera dependencia en Europa y América del Norte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las tierras raras y dónde se producen principalmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tierras raras son un grupo de 17 elementos metálicos (como el neodimio, el disprosio o el cerio) esenciales para fabricar imanes permanentes, pantallas, catalizadores y equipos de defensa. China produce alrededor del 60% de la minería mundial y refina más del 85% de la producción global, lo que la convierte en el proveedor dominante. Esta concentración ha llevado a la UE, EE. UU. y Japón a impulsar proyectos de diversificación de suministro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la dependencia energética de Europa respecto a recursos importados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La UE importa alrededor del 58% de su energía primaria. Antes de 2022, Rusia suministraba el 45% del gas natural y el 27% del petróleo importado por Europa. La invasión de Ucrania aceleró una reorientación del suministro hacia GNL de EE. UU. y Noruega, y reforzó las políticas de eficiencia y renovables. En minerales críticos para la transición energética, la dependencia de China es superior al 90% en tierras raras y al 70% en refinado de litio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afectan los conflictos por recursos al precio del petróleo y a los consumidores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tensiones geopolíticas en regiones productoras (Oriente Medio, el estrecho de Ormuz, el Golfo de Guinea) generan incertidumbre en los mercados y pueden elevar el precio del barril en pocas horas. Dado que el petróleo cotiza en dólares en mercados globales, cualquier conflicto o recorte de producción de la OPEP+ se traslada al precio de la gasolina, la electricidad y los bienes transportados en todo el mundo. Cada dólar de subida en el barril equivale aproximadamente a 0,7-0,9 céntimos de euro por litro en la gasolinera.',
      },
    },
  ],
};
