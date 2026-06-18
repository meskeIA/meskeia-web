import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de tipos de renta en el IRPF: cómo tributa cada ingreso - meskeIA',
  description:
    'Descubre cómo tributa cada ingreso en el IRPF: nómina, alquiler, dividendos, criptomonedas, venta de acciones o vivienda. Clasifica tu renta y conoce la base, la escala y la retención que le corresponde.',
  keywords:
    'irpf, tipos de renta, cómo tributa, rendimientos del trabajo, actividades económicas, capital mobiliario, capital inmobiliario, ganancias patrimoniales, base del ahorro, base general, dividendos, criptomonedas, alquiler, declaración de la renta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de tipos de renta en el IRPF — cómo tributa cada ingreso',
    description:
      'Clasifica cualquier ingreso (nómina, alquiler, dividendos, criptos, venta de acciones…) y descubre en qué base tributa, con qué escala y qué retención lleva.',
    url: 'https://meskeia.com/orientador-tipos-renta-irpf/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orientador de tipos de renta en el IRPF',
    description:
      'Cómo tributa cada ingreso en el IRPF: base general o del ahorro, escala de tipos y retención aplicable.',
  },
  other: {
    'application-name': 'Orientador de tipos de renta IRPF meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Orientador de tipos de renta en el IRPF',
  description:
    'Herramienta de orientación que clasifica cualquier ingreso en su categoría del IRPF (rendimientos del trabajo, actividades económicas, capital mobiliario, capital inmobiliario o ganancias patrimoniales) e indica en qué base tributa, con qué escala de tipos y qué retención le corresponde.',
  url: 'https://meskeia.com/orientador-tipos-renta-irpf/',
  category: 'FinanceApplication',
  features: [
    'Clasifica ingresos reales: nómina, alquiler, dividendos, criptomonedas, venta de acciones o vivienda',
    'Indica si tributa en la base general o en la base del ahorro',
    'Muestra la escala de tipos aplicable a cada renta',
    'Explica la retención habitual de cada tipo de ingreso',
    'Señala reducciones y particularidades por categoría',
    'Tabla comparativa de las cinco categorías de renta del IRPF',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la base general y la base del ahorro del IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base general agrupa rendimientos del trabajo, actividades económicas, capital inmobiliario (alquileres) e imputaciones, y tributa a la escala progresiva (del 19% al 47% en 2025). La base del ahorro agrupa la mayoría de rendimientos del capital mobiliario (dividendos, intereses) y las ganancias patrimoniales por transmisiones, y tributa a una escala propia más baja (del 19% al 28%).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo tributan las criptomonedas en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La venta o permuta de criptomonedas genera una ganancia o pérdida patrimonial que tributa en la base del ahorro (19% a 28% en 2025). En cambio, las recompensas por staking o por prestar criptoactivos se consideran rendimientos del capital mobiliario, también en la base del ahorro. Minar de forma habitual se considera actividad económica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué categoría del IRPF entra el alquiler de un piso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El alquiler de un inmueble es un rendimiento del capital inmobiliario y tributa en la base general. El alquiler de vivienda habitual permite una reducción del 50% al 90% del rendimiento neto según la zona y el tipo de contrato. Si el inquilino es una empresa, suele practicar una retención del 19%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas categorías de renta existen en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IRPF distingue cinco grandes categorías: rendimientos del trabajo, rendimientos de actividades económicas, rendimientos del capital inmobiliario, rendimientos del capital mobiliario y ganancias y pérdidas patrimoniales. A ellas se suman las imputaciones de renta, como la renta imputada por una segunda vivienda vacía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tengo que declarar lo que vendo en Wallapop?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vender objetos usados de segunda mano por debajo de su precio de compra genera una pérdida patrimonial que no se computa, así que normalmente no hay que declararlo. Solo si vendes algo por más de lo que te costó (por ejemplo, un objeto de colección revalorizado) se genera una ganancia patrimonial que tributa en la base del ahorro.',
      },
    },
  ],
};
