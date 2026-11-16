import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatCurrency } from '@/lib/formatters';
import { MINIMOS_IRPF_2025 } from '@/data/fiscal/irpf';
import { calcularDeduccionDiscapacidadIRPF } from '@/lib/calculadoras/deduccionDiscapacidadIRPF';

// Hallazgo 4780 (15/11/2026): la respuesta del ahorro sale del motor, no de un tipo marginal.
const MAXIMO = calcularDeduccionDiscapacidadIRPF({ titular: 'contribuyente', grado: '65oMas' });
const BASE_MINIMA = MINIMOS_IRPF_2025.personal + MAXIMO.totalMinimo;
// Hallazgo 4786: el trabajador activo suma el art. 19.2.f (28.000 € brutos, grado 40 %).
const TRABAJADOR = calcularDeduccionDiscapacidadIRPF({
  titular: 'contribuyente', grado: '33a65', salarioBrutoTrabajadorActivo: 28000,
}).trabajoActivo;

export const metadata: Metadata = {
  title: 'Estimación de Deducción IRPF por Discapacidad - Mínimos Personales | meskeIA',
  description: 'Estima el ahorro fiscal en IRPF por mínimos de discapacidad del contribuyente, ascendientes o descendientes, y por el incremento de gastos del trabajador activo. Incluye gastos de asistencia y requisitos 2025.',
  keywords: 'deduccion IRPF discapacidad, minimo discapacidad IRPF, ahorro fiscal discapacidad, IRPF dependencia, minimo ascendiente discapacidad, gastos asistencia IRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de Deducción IRPF por Discapacidad | meskeIA',
    description: 'Calcula el ahorro fiscal por los mínimos de discapacidad en la declaración de la renta.',
    url: 'https://meskeia.com/estimacion-deduccion-discapacidad/',
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
    title: 'Estimación de Deducción IRPF por Discapacidad | meskeIA',
    description: 'Ahorro fiscal por discapacidad: mínimos personales y familiares en IRPF',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estimación Deducción Discapacidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimación de Deducción IRPF por Discapacidad',
  description: 'Herramienta orientativa para estimar el ahorro fiscal en IRPF por los mínimos de discapacidad. Contribuyente, ascendientes y descendientes con discapacidad reconocida.',
  url: 'https://meskeia.com/estimacion-deduccion-discapacidad/',
  features: [
    'Mínimos por discapacidad del contribuyente',
    'Mínimos por discapacidad de ascendientes y descendientes',
    'Gastos de asistencia adicionales',
    'Ahorro en cuota con el mínimo gravado a tipo cero (art. 63.1.2.º LIRPF)',
    'Incremento por asistencia automático con grado igual o superior al 65 %',
    'Incremento de gastos del trabajo para trabajadores activos (art. 19.2.f LIRPF) calculado con el salario',
    'Datos actualizados IRPF 2025',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el mínimo por discapacidad en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mínimo por discapacidad es una cantidad que el IRPF deja sin gravar para reconocer los gastos adicionales que conlleva la discapacidad. No se resta de la base imponible: forma parte de la base liquidable general y se grava a tipo cero (art. 63.1.2º LIRPF), aplicando la escala a la base completa y restando de la cuota la misma escala aplicada al mínimo, de modo que se valora a los tipos bajos de la escala y no al tipo marginal de quien declara. En 2025, el mínimo general es de 3.000 € anuales para discapacidades del 33 % al 64 %, y de 9.000 € para discapacidades del 65 % o superior. A eso se suma un complemento de 3.000 € por gastos de asistencia ante cualquiera de tres supuestos alternativos: acreditar ayuda de terceras personas, acreditar movilidad reducida, o tener un grado igual o superior al 65 %. Con un grado del 65 % o más el complemento se aplica por el propio grado, sin acreditar nada más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué grado de discapacidad reconocida es necesario para aplicar la deducción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es necesario tener un grado de discapacidad reconocido oficialmente de al menos el 33 %. Este reconocimiento debe constar en resolución del Instituto Nacional de Servicios Sociales (IMSERSO) o del organismo autonómico competente. Las pensiones de incapacidad permanente total, absoluta o gran invalidez de la Seguridad Social también dan derecho al mínimo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede aplicar el mínimo por discapacidad de un familiar a cargo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La deducción se puede aplicar también por ascendientes (padres, abuelos) o descendientes (hijos, nietos) con discapacidad reconocida que convivan con el contribuyente y no tengan rentas anuales superiores a 8.000 €, y siempre que no presenten declaración con rentas de más de 1.800 € (art. 61.2.ª LIRPF). No es una deducción en la cuota sino un mínimo, que se grava a tipo cero. Los importes son los mismos que para el contribuyente: 3.000 € con un grado del 33 % al 64 %, o 9.000 € con un grado del 65 % o más; a eso se suman 3.000 € por gastos de asistencia si acreditan ayuda de terceras personas o movilidad reducida, y siempre con un grado del 65 % o más, que da derecho por sí solo (art. 60.2).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero me puedo ahorrar en la declaración de la renta por discapacidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El ahorro no depende de tu tipo marginal: el mínimo se grava a tipo cero (art. 63.1.2.º LIRPF) y se valora en los tramos bajos de la escala, encima del mínimo personal. Con un grado del 65 % o más, el mínimo total es de ${formatCurrency(MAXIMO.totalMinimo)} (incluidos los gastos de asistencia) y ahorra ${formatCurrency(MAXIMO.ahorroEstimado)} en la cuota, siempre que tu base liquidable general llegue al menos a ${formatCurrency(BASE_MINIMA)}; con menos base el ahorro es menor. Si además trabajas por cuenta ajena, el art. 19.2.f sube tus gastos deducibles en 3.500 € (7.750 € con ayuda de terceros, movilidad reducida o grado del 65 % o más), y ese incremento sí reduce la base: con 28.000 € brutos y un grado del 40 %, el ahorro total es de ${formatCurrency(TRABAJADOR?.ahorroTotal ?? 0)} (${formatCurrency(TRABAJADOR?.ahorroMinimo ?? 0)} del mínimo y ${formatCurrency(TRABAJADOR?.ahorroIncrementoGastos ?? 0)} de los gastos). La herramienta calcula el ahorro de tu caso según el grado, quién tiene la discapacidad y, si trabajas, tu salario.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Son compatibles el mínimo por discapacidad y las prestaciones de dependencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general sí son compatibles. Las prestaciones del Sistema para la Autonomía y Atención a la Dependencia (SAAD) están exentas de IRPF, por lo que no afectan a la aplicación del mínimo por discapacidad. No obstante, conviene revisar cada situación particular con un asesor fiscal, ya que la combinación de prestaciones y circunstancias personales puede variar el resultado.',
      },
    },
  ],
};
