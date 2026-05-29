import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cadenas de Suministro Globales: Cómo Llega Todo hasta Ti — meskeIA',
  description:
    'Visualizador interactivo de cadenas de suministro globales: el viaje de un smartphone, just-in-time vs just-in-case, grandes disrupciones históricas y reshoring. Logística y economía.',
  keywords: [
    'cadena de suministro global',
    'just-in-time just-in-case',
    'disrupciones suministro semiconductores',
    'reshoring nearshoring friendshoring',
    'logística global smartphone',
    'bullwhip effect cadena suministro',
    'Canal de Suez bloqueo comercio',
    'relocalización producción industrial',
  ],
  openGraph: {
    title: 'Cadenas de Suministro Globales: Cómo Llega Todo hasta Ti — meskeIA',
    description:
      'Just-in-time, disrupciones históricas y relocalización — la logística que mueve la economía global.',
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
  name: "Cadenas de Suministro Globales: JIT, Disrupciones y Reshoring",
  description: "Visualizador interactivo de cadenas de suministro globales: el viaje de un smartphone, just-in-time vs just-in-case, grandes disrupciones históricas y reshoring. Logística y economía.",
  url: "https://meskeia.com/visualizador-cadenas-suministro/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una cadena de suministro global y cuántos países pueden intervenir en un producto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cadena de suministro global es la red de empresas, países y procesos que intervienen desde la extracción de materias primas hasta la entrega del producto final al consumidor. En un smartphone moderno intervienen más de 40 países: el litio puede venir de Chile, los chips de Taiwán, el cristal de EEUU, el ensamblaje de China y la distribución desde Países Bajos. La cadena incluye proveedores de primer, segundo y tercer nivel, transportistas, aduanas y minoristas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el modelo just-in-time y el just-in-case?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo just-in-time (JIT) recibe componentes exactamente cuando se necesitan, eliminando inventarios y reduciendo costes de almacén. El just-in-case (JIC) mantiene grandes stocks de seguridad para absorber interrupciones inesperadas. JIT es más eficiente en costes pero extremadamente vulnerable a disrupciones; JIC es más resiliente pero inmoviliza capital. La crisis de semiconductores de 2021 reveló los límites del JIT y empujó a muchas industrias hacia modelos híbridos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el "efecto látigo" en las cadenas de suministro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto látigo (bullwhip effect) describe cómo una pequeña variación en la demanda del consumidor final se amplifica progresivamente hacia atrás en la cadena: el minorista hace un pedido mayor, el mayorista lo amplifica aún más, y el fabricante recibe una demanda exagerada. La causa es la incertidumbre: cada eslabón acumula stock de precaución. Durante la pandemia de 2020-2021 fue un factor clave en las roturas de stock de productos básicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el reshoring y por qué lo están haciendo grandes empresas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reshoring es el proceso de traer de vuelta la producción al país de origen (o cerca de él), revirtiéndola deslocalización de las décadas pasadas. El nearshoring traslada la producción a países vecinos y el friendshoring a países aliados políticamente. Los motivos son la reducción del riesgo geopolítico, los costes de transporte más altos, las lecciones de la pandemia y las políticas industriales como la Chips Act de EEUU (2022) o la European Chips Act (2023), que destinan miles de millones a fabricación local de semiconductores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles han sido las mayores disrupciones de cadenas de suministro de la historia reciente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre las disrupciones más impactantes destacan: el tsunami de Japón de 2011, que paralizó fábricas de Toyota y autopartes globales durante semanas; el bloqueo del Canal de Suez por el Ever Given en 2021 (6 días, ~9.000 millones de dólares diarios retenidos); la escasez global de semiconductores de 2020-2023, que afectó a la fabricación de coches, consolas y electrónica; y la pandemia de COVID-19, que colapsó simultáneamente la oferta (cierres de fábricas) y la demanda (cambios de consumo), con efectos que duraron hasta 2023.',
      },
    },
  ],
};
