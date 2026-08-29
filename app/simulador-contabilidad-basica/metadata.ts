import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Contabilidad Básica - Partida Doble, Diario y Mayor - meskeIA',
  description: 'Aprende contabilidad básica con ejemplos interactivos: partida doble, asientos contables en el libro diario y visualización del libro mayor en cuentas T.',
  keywords: 'contabilidad basica, partida doble, libro diario, libro mayor, asientos contables, cuentas T, debe haber, contabilidad para principiantes, aprender contabilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Contabilidad Básica - Partida Doble y Asientos',
    description: 'Aprende partida doble, registra asientos en el libro diario y visualiza el libro mayor con cuentas T. Educación contable gratuita.',
    url: 'https://meskeia.com/simulador-contabilidad-basica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Contabilidad Básica - meskeIA',
    description: 'Partida doble, libro diario y libro mayor con cuentas T. Aprende contabilidad desde cero.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Simulador Contabilidad Básica meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Contabilidad Básica',
  description: 'Herramienta educativa para aprender contabilidad básica: registra asientos contables con partida doble, visualiza el libro diario y el libro mayor en formato de cuentas T.',
  url: 'https://meskeia.com/simulador-contabilidad-basica/',
  category: 'EducationalApplication',
  features: [
    'Registro de asientos contables con validación de partida doble (debe = haber)',
    'Libro diario interactivo con múltiples apuntes',
    'Libro mayor automático en formato de cuentas T',
    'Ejemplos precargados de asientos típicos',
    'Saldo acreedor y deudor calculado automáticamente por cuenta',
    'Gratuito y sin registro, funciona 100% en el navegador',
    'Disponible en español con terminología contable estándar',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la partida doble en contabilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La partida doble es el principio fundamental de la contabilidad moderna, enunciado por Luca Pacioli en 1494. Establece que toda operación económica afecta a al menos dos cuentas: una en el Debe y otra en el Haber, de forma que la suma total del Debe siempre es igual a la suma total del Haber. Esto garantiza el equilibrio del sistema contable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se registra un asiento contable en el libro diario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un asiento contable se registra indicando la fecha, las cuentas afectadas, el importe en el Debe o en el Haber, y una descripción del concepto. La suma de los importes del Debe debe ser igual a la suma de los importes del Haber. Por ejemplo, si compras material de oficina por 500 € al contado: cargo (Debe) la cuenta "Material de Oficina" por 500 € y abona (Haber) la cuenta "Banco" por 500 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el libro mayor en contabilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El libro mayor recoge todos los movimientos de cada cuenta de forma individual. Para cada cuenta muestra los apuntes al Debe (entradas o cargos) y al Haber (salidas o abonos), y calcula el saldo resultante. Permite saber en todo momento el estado de cada cuenta: cuánto dinero hay en caja, cuánto se debe a proveedores, etc. Se representa visualmente como una cuenta en T.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este simulador de contabilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es ideal para estudiantes de secundaria, bachillerato, formación profesional o grados universitarios que se inician en contabilidad, para autónomos y pequeños empresarios que quieren entender sus registros contables, y para cualquier persona que quiera comprender los fundamentos de la contabilidad sin necesidad de software de pago ni conocimientos previos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el Debe y el Haber?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Debe y el Haber son las dos columnas de cada cuenta contable. En el Debe se registran las entradas de activo (dinero en caja, bienes), los gastos y las disminuciones de pasivo. En el Haber se registran las salidas de activo, los ingresos y los aumentos de pasivo o patrimonio. Recordar cuándo cargar o abonar una cuenta es la clave del sistema de partida doble.',
      },
    },
  ],
};
