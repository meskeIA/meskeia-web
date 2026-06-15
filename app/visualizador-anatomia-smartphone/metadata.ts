import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de un Smartphone - Componentes, Minerales, Coste Real | meskeIA',
  description: 'Descubre qué hay dentro de un smartphone: procesador, batería, cámaras, los 30+ minerales de 15 países, el desglose real de costes y la obsolescencia. Explicador visual interactivo.',
  keywords: 'smartphone componentes, minerales smartphone, cobalto congo, litio chile, coste fabricación móvil, obsolescencia programada, basura electrónica, derecho a reparar, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de un Smartphone - Componentes, Minerales y Coste Real',
    description: 'Qué hay dentro de tu móvil, de dónde vienen sus materiales, cuánto cuesta realmente fabricarlo y qué pasa cuando lo tiras.',
    url: 'https://meskeia.com/visualizador-anatomia-smartphone/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anatomía de un Smartphone - Componentes, Minerales y Coste Real',
    description: 'Procesador, batería, 30+ minerales de 15 países, márgenes de beneficio y obsolescencia: todo lo que esconde tu móvil.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Anatomía Smartphone meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de un Smartphone',
  description: 'Explicador visual interactivo sobre la anatomía de un smartphone: componentes internos (pantalla, procesador, batería, cámaras, antenas), minerales y países de origen (litio, cobalto, tierras raras), desglose real de costes de fabricación y el problema de la obsolescencia y los residuos electrónicos.',
  url: 'https://meskeia.com/visualizador-anatomia-smartphone/',
  category: 'EducationalApplication',
  features: [
    'Componentes internos interactivos: pantalla, SoC, RAM, batería, cámaras, antenas',
    'Mapa de minerales: 30+ minerales de 15+ países con cadenas de suministro',
    'Desglose de costes de un móvil de 1.000 €: componentes, ensamblaje, I+D, marketing, margen',
    'Datos de obsolescencia: vida media, residuos electrónicos, tasas de reciclaje',
    'Sección de obsolescencia: vida media, tasa de reciclaje y destino real de los móviles desechados',
    'Comparativa laboral: salario del trabajador de fábrica vs. precio final de venta',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué minerales contiene un smartphone y de dónde vienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un smartphone contiene más de 30 minerales extraídos en unos 15 países. El litio para la batería proviene principalmente de Chile y Argentina, el cobalto del Congo, el tántalo de África Central y las tierras raras (neodimio, disprosio) casi en exclusiva de China. La cadena de suministro abarca extractores, refinadores y fabricantes de componentes en distintos continentes antes de que el dispositivo llegue a la tienda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta realmente fabricar un smartphone de 1.000 euros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de los componentes de un smartphone de gama alta ronda los 300-400 € (pantalla OLED, SoC y memoria son las partidas más caras). A eso se añaden unos 20-30 € de ensamblaje, más los gastos en I+D, marketing, distribución e impuestos. El margen neto del fabricante suele situarse entre el 15 % y el 30 % del precio final de venta al público.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el procesador (SoC) de un móvil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SoC (System on Chip) integra en un único chip la CPU, la GPU, el módem 5G, el procesador de señal de imagen y el motor de IA. Está fabricado con litografías de 3-5 nm, lo que permite incluir miles de millones de transistores en un espacio menor que una uña. Coordina todas las tareas del teléfono y es el componente que más influye en el rendimiento y la autonomía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la obsolescencia programada en los smartphones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La obsolescencia programada es la práctica por la que un dispositivo deja de recibir actualizaciones de software o pierde rendimiento antes de que su hardware lo justifique. La vida media de un smartphone en Europa es de 2,5 a 3 años, aunque la batería empieza a degradarse notablemente a partir de 500 ciclos de carga. El movimiento "Derecho a Reparar" impulsa leyes que obligan a los fabricantes a suministrar piezas y actualizaciones durante más tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos residuos electrónicos generan los teléfonos móviles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se fabrican unos 1.400 millones de smartphones al año en todo el mundo. Solo se recicla correctamente entre el 15 % y el 20 % de los residuos electrónicos globales; el resto acaba en vertederos, muchos en países en desarrollo. Un móvil contiene oro, plata, cobre y otros metales recuperables; reciclar 1.000 kg de placas base puede extraer más oro que toneladas de mineral de mina.',
      },
    },
  ],
};
