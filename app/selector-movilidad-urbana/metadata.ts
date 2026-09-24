import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { rangoAnual, rangoMensual } from './motor';

export const metadata: Metadata = {
  title: 'Selector de Movilidad Urbana | ¿Coche, Transporte Público o Bici? | meskeIA',
  description: 'Test de 10 preguntas para saber qué medio de transporte se adapta mejor a tu estilo de vida: coche (carro o auto) propio, transporte público, moto o escúter, bicicleta o patinete eléctrico, o una combinación.',
  keywords: [
    'qué transporte usar en ciudad',
    'coche o transporte público',
    'carro o transporte público',
    'auto o transporte público',
    'bicicleta o moto ciudad',
    'movilidad urbana sostenible',
    'patinete eléctrico o bici',
    'coste transporte urbano',
    'moto o coche ciudad',
    'moto o carro ciudad',
    'dejar el coche ciudad',
    'movilidad sostenible',
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
  description: "Test de 10 preguntas para saber qué medio de transporte se adapta mejor a tu estilo de vida: coche (carro o auto) propio, transporte público, moto o escúter, bicicleta o patinete eléctrico, o una combinación.",
  url: "https://meskeia.com/selector-movilidad-urbana/",
  category: 'UtilityApplication',
  // §1.ter: de 4 a 8 características reales (antes `features: []`, hallazgo 1504)
  features: [
    'Test de 10 preguntas sobre distancia, red de transporte, horarios, coste, clima y movilidad física',
    'Recomienda entre coche propio, transporte público, moto o escúter, bici o patinete eléctrico y combinación multimodal',
    'Descarta lo incompatible con lo que declaras: sin red de transporte público, con limitaciones de movilidad o a más de 40 km',
    'Explica la recomendación con las respuestas que más han sumado',
    'Avisa de lo que juega en contra: carga, coste, seguridad vial, clima o distancia',
    'Anuncia los empates y el criterio que los deshace',
    'Coste mensual orientativo de cada medio',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué medio de transporte urbano es más barato: coche (carro o auto), moto o transporte público?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Derivado de COSTE_MENSUAL (./motor.ts), la misma tabla de la tarjeta y de la guía: antes
        // daba «400-700 € al año» de abono y «5.000-8.000 €» de coche, cifras que no coincidían
        // con las de la pantalla (hallazgo 1496; regla h de la familia de selectores).
        text: `Con las horquillas orientativas del test para una ciudad española, lo más barato de mantener es la bicicleta o el patinete eléctrico (${rangoMensual('bici_patinete')}, sin contar la compra), seguido del transporte público con abono (${rangoMensual('transporte_publico')}). La moto o el escúter cuesta ${rangoMensual('moto_escuter')} y el coche propio (también llamado carro o auto en Latinoamérica) ${rangoMensual('coche_propio')}, unos ${rangoAnual('coche_propio')} al año sumando amortización, seguro, combustible, aparcamiento y mantenimiento. Son estimaciones: cambian mucho con la ciudad, el vehículo y el uso.`,
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
