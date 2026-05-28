import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Movilidad Urbana | ¿Coche, Transporte Público o Bici? | meskeIA',
  description: 'Test de 10 preguntas para saber qué medio de transporte se adapta mejor a tu estilo de vida: coche propio, transporte público, moto o escúter, bicicleta o patinete eléctrico, o una combinación.',
  keywords: [
    'qué transporte usar en ciudad',
    'coche o transporte público',
    'bicicleta o moto ciudad',
    'movilidad urbana sostenible',
    'patinete eléctrico o bici',
    'coste transporte urbano España',
    'moto o coche ciudad',
    'dejar el coche ciudad',
    'movilidad sostenible España',
    'qué medio de transporte elegir',
  ],
  openGraph: {
    title: 'Selector de Movilidad Urbana — ¿Coche, Transporte Público o Bici?',
    description: 'Descubre qué medio de transporte urbano se adapta mejor a tu estilo de vida en 10 preguntas.',
    url: 'https://meskeia.com/selector-movilidad-urbana/',
    siteName: 'meskeIA',
    locale: 'es_ES',
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
  name: "Selector de Movilidad Urbana",
  description: "Test de 10 preguntas para saber qué medio de transporte se adapta mejor a tu estilo de vida: coche propio, transporte público, moto o escúter, bicicleta o patinete eléctrico, o una combinación.",
  url: "https://meskeia.com/selector-movilidad-urbana/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué medio de transporte urbano es más barato: coche, moto o transporte público?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El transporte público suele ser la opción más económica en ciudades con red bien desarrollada, con costes medios de 400-700 € al año en abono. El coche propio puede superar los 5.000-8.000 € anuales sumando seguro, combustible, mantenimiento y aparcamiento. La bicicleta y el patinete eléctrico tienen los costes más bajos a largo plazo, aunque requieren una inversión inicial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si debería dejar el coche y usar el transporte público?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de factores como la frecuencia de los servicios en tu zona, la distancia a las paradas, si tienes cargas que transportar o niños, y el tiempo que tardas en cada trayecto. Si la ciudad tiene metro, bus o tren con cobertura cercana a tu origen y destino, el transporte público suele ser más eficiente y económico. El test de movilidad urbana ayuda a ponderar estas variables según tu situación concreta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el medio de transporte más sostenible en ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La bicicleta y los desplazamientos a pie tienen las emisiones más bajas, prácticamente nulas. El patinete o bicicleta eléctrica tienen una huella muy reducida si la electricidad es de fuente renovable. El transporte público eléctrico (metro, tranvía) también es muy eficiente en términos de emisiones por viajero. El coche de combustión interna es la opción con mayor impacto ambiental por kilómetro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena tener moto o escúter en lugar de coche en ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La moto o escúter ofrece ventajas claras en ciudades con tráfico denso: mayor velocidad media, facilidad de aparcamiento y menor coste que el coche (seguros más baratos, menor consumo). Son ideales para trayectos de 5-30 km en entornos urbanos. Su principal inconveniente es la exposición a la intemperie y un nivel de seguridad inferior al coche.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Pueden combinarse varios medios de transporte para desplazarse por ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la intermodalidad es una estrategia habitual y eficiente: combinar bicicleta o patinete con tren o metro permite cubrir la "última milla" sin depender del coche. Muchas ciudades tienen aparcamientos de bicicletas en estaciones y sistemas de alquiler público. Esta combinación suele reducir costes y tiempos en trayectos de más de 10 km con cambio de modo de transporte.',
      },
    },
  ],
};
