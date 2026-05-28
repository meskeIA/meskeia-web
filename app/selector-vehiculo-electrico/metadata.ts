import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Vehículo Eléctrico | ¿BEV, PHEV o Híbrido? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de vehículo eléctrico o híbrido se adapta mejor a tu situación: eléctrico puro (BEV), híbrido enchufable (PHEV), híbrido suave (HEV), moto eléctrica o esperar.',
  keywords: [
    'qué vehículo eléctrico comprar',
    'BEV o PHEV',
    'coche eléctrico o híbrido',
    'híbrido enchufable España',
    'autonomía coche eléctrico',
    'cargador en casa eléctrico',
    'moto eléctrica o gasolina',
    'subvenciones vehículo eléctrico España',
    'cuándo comprar coche eléctrico',
    'HEV PHEV BEV diferencias',
  ],
  openGraph: {
    title: 'Selector de Vehículo Eléctrico — ¿BEV, PHEV o Híbrido?',
    description:
      'Descubre qué tipo de vehículo eléctrico o híbrido se adapta mejor a tu situación en 10 preguntas.',
    url: 'https://meskeia.com/selector-vehiculo-electrico/',
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
  name: "Selector de Vehículo Eléctrico",
  description: "Test de 10 preguntas para saber qué tipo de vehículo eléctrico o híbrido se adapta mejor a tu situación: eléctrico puro (BEV), híbrido enchufable (PHEV), híbrido suave (HEV), moto eléctrica o esperar.",
  url: "https://meskeia.com/selector-vehiculo-electrico/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un coche eléctrico puro (BEV) y un híbrido enchufable (PHEV)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un BEV (Battery Electric Vehicle) funciona únicamente con batería eléctrica y debe recargarse en un punto de carga o en casa; no tiene motor de combustión. Un PHEV (Plug-in Hybrid Electric Vehicle) combina motor eléctrico y motor de gasolina: puede circular en modo eléctrico unos 40-80 km y luego continuar con gasolina, lo que elimina la ansiedad por la autonomía. El BEV es más eficiente y barato de mantener; el PHEV es más flexible si no tienes acceso a carga frecuente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito un cargador en casa para tener un coche eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No es estrictamente necesario, pero sí muy recomendable para un uso cómodo. Cargar con un enchufe doméstico convencional (tipo Schuko, 2,3 kW) es lento: reponer 200 km puede llevar 12-15 horas. Un wallbox doméstico (7-11 kW) reduce ese tiempo a 3-6 horas y cuesta entre 600 € y 1.500 € instalado. Si vives en piso sin plaza de garaje propia, la viabilidad depende de si tu comunidad o aparcamiento público cercano dispone de puntos de carga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de vehículo eléctrico conviene más si hago muchos kilómetros fuera de ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para trayectos largos y frecuentes con pocas oportunidades de carga, un PHEV o un HEV (híbrido no enchufable) son opciones más prácticas que un BEV de autonomía media. Si eliges un BEV, opta por uno con más de 400 km de autonomía WLTP y planifica las paradas en cargadores rápidos (DC, 50-150 kW). La red de carga rápida en autovías españolas ha mejorado mucho, pero aún presenta puntos ciegos en zonas rurales y algunas comunidades del interior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ayudas o subvenciones existen para comprar un vehículo eléctrico en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plan MOVES III (prorrogado y ampliado sucesivamente) ofrece ayudas de hasta 7.000 € para particulares que compren un BEV con achatarramiento de un vehículo antiguo, y hasta 4.500 € sin achatarramiento; los importes varían según la renta. Además, varios ayuntamientos y comunidades autónomas tienen sus propias subvenciones adicionales. Es imprescindible consultar la convocatoria vigente en el momento de la compra, ya que los presupuestos se agotan y los plazos cambian cada año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se ahorra en combustible al pasarse a un coche eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un coche de gasolina que consume 6 litros/100 km tiene un coste energético de unos 9-10 €/100 km a precios actuales. Un BEV equivalente consume alrededor de 18 kWh/100 km, lo que supone entre 2,5 € y 4 €/100 km cargando en casa (tarifa nocturna) o hasta 6-8 €/100 km en cargador público rápido. Para 15.000 km anuales, el ahorro puede ser de 750 € a 1.000 € al año cargando mayoritariamente en casa.',
      },
    },
  ],
};
