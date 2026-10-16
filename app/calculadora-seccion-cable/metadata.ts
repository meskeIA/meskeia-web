import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Sección de Cable y Caída de Tensión - Monofásico y Trifásico | meskeIA',
  description:
    'Calcula la sección de cable necesaria en mm² por caída de tensión y por intensidad admisible (ITC-BT-19) de una línea monofásica o trifásica, con la longitud, la potencia o la corriente y el método de instalación.',
  keywords:
    'sección de cable, caída de tensión, intensidad admisible, ITC-BT-19, calcular sección cable, mm2 cable, monofásico, trifásico, cobre, aluminio, conductividad, sección normalizada, pérdidas en el conductor, instalación eléctrica, densidad de corriente',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-seccion-cable/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Sección de Cable y Caída de Tensión | meskeIA',
    description:
      'Sección en mm² y caída de tensión de una línea monofásica o trifásica, en cobre o aluminio',
    url: 'https://meskeia.com/calculadora-seccion-cable/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Sección de Cable y Caída de Tensión | meskeIA',
    description: 'Cuántos mm² necesita tu línea y cuánta tensión pierde por el camino',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Sección de Cable y Caída de Tensión',
  description:
    'Calculadora de líneas eléctricas de baja tensión. Obtén la sección de conductor en mm² como la mayor de dos comprobaciones, la caída de tensión y la intensidad máxima admisible de la Tabla 1 de la ITC-BT-19 según el método de instalación y el aislamiento, o comprueba una sección concreta, en instalaciones monofásicas y trifásicas, indicando longitud, potencia o corriente y factor de potencia. Devuelve además la tensión que llega al receptor, la densidad de corriente y las pérdidas por efecto Joule.',
  url: 'https://meskeia.com/calculadora-seccion-cable/',
  category: 'UtilityApplication',
  features: [
    'Sección recomendada como la mayor entre caída de tensión e intensidad admisible',
    'Intensidad admisible del cobre según la Tabla 1 de la ITC-BT-19 y el método de instalación',
    'Caída de tensión en voltios y en porcentaje para una sección dada',
    'Monofásico y trifásico con tensión configurable',
    'Cobre y aluminio con la conductividad a la temperatura de servicio del aislamiento',
    'Entrada por potencia en vatios o por corriente en amperios',
    'Pérdidas por efecto Joule y densidad de corriente del conductor',
    'Límites de caída habituales: alumbrado, fuerza y derivación individual',
    'En español',
  ],
  keywords: ['sección de cable', 'caída de tensión', 'monofásico', 'trifásico', 'instalación eléctrica'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la sección de un cable por caída de tensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En monofásico, S = 2·L·I·cos φ/(γ·ΔV); en trifásico, S = √3·L·I·cos φ/(γ·ΔV). L es la longitud de la línea en metros, I la corriente en amperios, γ la conductividad del material y ΔV la caída de tensión admisible en voltios. El 2 del monofásico aparece porque la corriente recorre el conductor de ida y el de vuelta; en trifásico equilibrado ese factor se sustituye por √3.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta caída de tensión se admite en una instalación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España el REBT fija, para instalaciones alimentadas desde una estación transformadora de abonado, un máximo del 3 % en circuitos de alumbrado y del 5 % en los demás usos, medidos desde el origen de la instalación interior. La derivación individual tiene su propio límite, del orden del 1 % al 1,5 % según cómo estén dispuestos los contadores. Fuera de España el criterio de cálculo es idéntico, pero los porcentajes los fija la normativa local.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué conductividad hay que usar, la de 20 °C o la de 70 °C?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La de la temperatura de servicio prevista, porque la resistencia del metal aumenta al calentarse y con ella la caída de tensión. El cobre pasa de 56 m/(Ω·mm²) a 20 °C a unos 48 a 70 °C, y el aluminio de 35 a unos 30. Calcular con el valor de 20 °C cuando el cable va a trabajar caliente subestima la caída en torno a un 15 %, así que lo prudente es usar la temperatura máxima del aislamiento: 70 °C en PVC y 90 °C en XLPE o EPR.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo cobre que aluminio a igualdad de sección?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El aluminio conduce alrededor de un 62 % de lo que conduce el cobre, así que para la misma caída de tensión necesita aproximadamente 1,6 veces más sección. A cambio pesa mucho menos y es más barato, por lo que se impone en líneas largas y secciones grandes. En instalaciones interiores de vivienda el cobre sigue siendo lo habitual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Basta con calcular la sección por caída de tensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La sección definitiva es la mayor de las que resultan de tres comprobaciones: la caída de tensión, la intensidad máxima admisible del conductor según su método de instalación, agrupamiento y temperatura ambiente, y la resistencia al cortocircuito. En líneas largas suele mandar la caída de tensión; en tramos cortos con mucha corriente manda el calentamiento: 40 A en 5 metros apenas pierden tensión con 1,5 mm², pero ese cable admite unos 15 A en tubo empotrado. Esta calculadora aplica las dos primeras, con la Tabla 1 de la ITC-BT-19 para el cobre.',
      },
    },
  ],
};
