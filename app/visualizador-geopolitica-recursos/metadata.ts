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
  features: [
    'Cinco primeros productores de petróleo, gas, litio, tierras raras y cobre, con fuente y año',
    'Reservas separadas de recursos, según el USGS (Mineral Commodity Summaries 2026) y la OPEP',
    'Dependencia de importaciones de la UE y principales proveedores (Eurostat y Comisión Europea)',
    'Lugar de cada recurso en la Ley de Materias Primas Críticas de la UE (Reglamento (UE) 2024/1252)',
    'Cinco conflictos y tensiones por recursos, del Golfo al Triángulo del Litio',
    'Proyección de demanda de minerales a 2040 de la AIE, con tabla de datos accesible',
  ],
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
        text: 'El litio es el componente clave de las baterías de ion-litio de los vehículos eléctricos y del almacenamiento de energía renovable. Según el USGS (Mineral Commodity Summaries 2026), Chile y Argentina reúnen el 37 % de las reservas mundiales; Bolivia, el tercer país del llamado Triángulo del Litio, no declara reservas pero sí 23 millones de toneladas de recursos, y contando los recursos los tres suman en torno al 43 %. En producción minera de 2025 lideran Australia, China y Chile, mientras que el refinado y la fabricación de baterías se concentran en China.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las tierras raras y dónde se producen principalmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tierras raras son un grupo de 17 elementos metálicos (como el neodimio, el disprosio o el cerio) esenciales para fabricar imanes permanentes, pantallas, catalizadores y equipos de defensa. China produjo en 2025 el 69 % de la minería mundial (USGS, Mineral Commodity Summaries 2026) y, según la Comisión Europea (2023), procesa el 85 % de las tierras raras ligeras y la totalidad de las pesadas. Esta concentración ha llevado a la UE, EE. UU. y Japón a impulsar proyectos de diversificación de suministro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la dependencia energética de Europa respecto a recursos importados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según Eurostat, la UE cubrió con importaciones netas el 57 % de su energía en 2024; en 2023 importó el 90 % del gas natural y el 94,9 % del petróleo que consumió. Rusia aportaba en 2021 el 45 % del gas importado por la UE, y en 2025 el 12 % (Comisión Europea, REPowerEU); el hueco lo cubrieron sobre todo el gas noruego y el GNL de EE. UU. En materias primas para la transición energética, la Comisión Europea (2023) cifra en el 100 % la dependencia de importaciones de la UE en tierras raras y en litio refinado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afectan los conflictos por recursos al precio del petróleo y a los consumidores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tensiones geopolíticas en regiones productoras (Oriente Medio, el estrecho de Ormuz, el Golfo de Guinea) generan incertidumbre en los mercados y pueden elevar el precio del barril en pocas horas. Dado que el petróleo cotiza en dólares en mercados globales, cualquier conflicto o recorte de producción de la OPEP+ se traslada al precio de la gasolina, la electricidad y los bienes transportados en todo el mundo. Como un barril tiene 159 litros, cada dólar de subida del barril encarece el crudo en unos 0,6 céntimos de dólar por litro; lo que llega a la gasolinera depende además del tipo de cambio, los márgenes de refino y los impuestos.',
      },
    },
  ],
};
