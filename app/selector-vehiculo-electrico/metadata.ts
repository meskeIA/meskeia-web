import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { AYUDA_AUTO_PLUS_2026, FISCAL_AYUDAS_VEHICULO_META, MOVES_III_HISTORICO } from '@/data/fiscal';
import { formatDate, formatNumber, parseISODateLocal } from '@/lib';

// La ayuda de la FAQ sale del módulo: el FAQPage daba el MOVES III como vigente, «prorrogado y
// ampliado sucesivamente», cuando terminó el 31/12/2025 (hallazgo 2054).
const AUTO = AYUDA_AUTO_PLUS_2026;
const NORMA_AUTO = FISCAL_AYUDAS_VEHICULO_META.fuente.split(',')[0];
const euros = (n: number): string => `${formatNumber(n, 0)} €`;
const fecha = (iso: string): string => formatDate(parseISODateLocal(iso));

// El JSON-LD salía con `features: []` (hallazgo 2060).
const FEATURES = [
  'Test de 10 preguntas sobre kilómetros, carga en casa, viajes, presupuesto y uso',
  'Recomendación entre eléctrico puro (BEV), híbrido enchufable (PHEV), híbrido convencional (HEV) y moto eléctrica, o esperar',
  'Descarta las opciones incompatibles con tus respuestas y explica por qué',
  'El presupuesto acota la recomendación y se avisa cuando recorta lo que pide tu uso',
  'Avisa de los empates y de lo que implica aparcar en la calle',
  'Guía de las ayudas estatales vigentes y de los impuestos que afectan a la compra en España',
  'Gratis, en el navegador y sin registro',
];

const DESCRIPCION =
  'Test de 10 preguntas para saber qué tipo de vehículo eléctrico o híbrido se adapta mejor a tu situación: eléctrico puro (BEV), híbrido enchufable (PHEV), híbrido convencional (HEV), moto eléctrica o esperar.';

export const metadata: Metadata = {
  title: 'Selector de Vehículo Eléctrico | ¿BEV, PHEV o Híbrido? | meskeIA',
  description: DESCRIPCION,
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
  description: DESCRIPCION,
  url: "https://meskeia.com/selector-vehiculo-electrico/",
  category: 'FinanceApplication',
  features: FEATURES,
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
        text: 'Un BEV (Battery Electric Vehicle) funciona únicamente con batería eléctrica y debe recargarse en un punto de carga o en casa; no tiene motor de combustión. Un PHEV (Plug-in Hybrid Electric Vehicle) combina motor eléctrico y motor de gasolina: puede circular en modo eléctrico una distancia que depende del modelo (su cifra homologada WLTP) y luego continuar con combustión, lo que elimina la ansiedad por la autonomía. El BEV es más eficiente y barato de mantener; el PHEV solo aprovecha su parte eléctrica si se enchufa con regularidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito un cargador en casa para tener un coche eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No es estrictamente necesario, pero sí muy recomendable para un uso cómodo. Cargar con un enchufe doméstico convencional (tipo Schuko, unos 2,3 kW: 230 V por 10 A) es lento, y sirve sobre todo para recargas nocturnas de pocos kilómetros. Un punto de carga dedicado (wallbox) de 7 kW o más carga unas tres veces más rápido. Si aparcas en la calle, dependerás de la recarga pública o en el trabajo: comprueba qué puntos tienes cerca, su disponibilidad y su precio antes de decidir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de vehículo eléctrico conviene más si hago muchos kilómetros fuera de ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para trayectos largos y frecuentes con pocas oportunidades de carga, un PHEV o un HEV (híbrido no enchufable) son opciones más prácticas que un BEV de autonomía media. Si eliges un BEV, busca una autonomía homologada (WLTP) holgada respecto a tus trayectos, ten en cuenta que en autopista y con frío es menor, y planifica las paradas en cargadores rápidos de corriente continua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ayudas o subvenciones existen para comprar un vehículo eléctrico en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La ayuda estatal vigente es el ${AUTO.nombre} (${NORMA_AUTO}), para vehículos matriculados desde el ${fecha(AUTO.matriculadosDesde)} y previsto hasta el ${fecha(AUTO.vigenteHasta)}. Da un máximo de ${euros(AUTO.maximo.turismo)} por turismo y ${euros(AUTO.maximo.motocicleta)} por motocicleta eléctrica. En un turismo, ese máximo se alcanza sumando criterios (ser eléctrico puro o enchufable, el precio y la fabricación en la Unión Europea), y un turismo de más de ${euros(AUTO.precioMaxTurismoSinImpuestos)} sin impuestos no recibe ayuda. El ${MOVES_III_HISTORICO.nombre} terminó el ${fecha(MOVES_III_HISTORICO.finalizado)}. Algunas comunidades autónomas y ayuntamientos tienen además programas propios, y la Agencia Tributaria recoge una deducción en el IRPF por la compra de vehículos eléctricos enchufables nuevos.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se ahorra en combustible al pasarse a un coche eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de dos pares de datos que puedes consultar tú. Para el eléctrico, su consumo homologado (kWh cada 100 km) por el precio del kWh de tu tarifa; para el de combustión, sus litros cada 100 km por el precio del litro. La diferencia, multiplicada por los kilómetros que haces al año, es el ahorro en energía. Cargar sobre todo en casa, con una tarifa con periodo barato, es lo que más lo aumenta; en los cargadores públicos rápidos el kWh suele ser bastante más caro.',
      },
    },
  ],
};
