import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Roommates - Divide Gastos de Piso Compartido | meskeIA',
  description: 'Divide los gastos del piso entre compañeros de forma justa. Luz, internet, compras comunes. Calcula quién debe a quién y simplifica las cuentas.',
  keywords: 'roommates, compañeros piso, dividir gastos, piso compartido, luz, internet, gastos comunes, quien debe a quien',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Roommates - meskeIA',
    description: 'Divide los gastos del piso compartido de forma justa entre todos los compañeros',
    url: 'https://meskeia.com/calculadora-roommates/',
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
    title: 'Calculadora Roommates - meskeIA',
    description: 'Divide gastos del piso compartido sin conflictos',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Roommates",
  description: "Divide los gastos del piso entre compañeros de forma justa. Luz, internet, compras comunes. Calcula quién debe a quién y simplifica las cuentas.",
  url: "https://meskeia.com/calculadora-roommates/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se dividen los gastos de forma justa en un piso compartido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma más habitual es dividir los gastos fijos (alquiler, suministros, internet) a partes iguales entre todos los convivientes. Para compras variables o esporádicas, cada persona anota lo que paga y al final del mes se calcula quién debe a quién para minimizar las transferencias. Existen distintos criterios de reparto: por habitaciones, por ingresos o por consumo estimado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una calculadora de roommates y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una herramienta que registra todos los gastos compartidos de un piso (luz, agua, internet, compras comunes) y calcula automáticamente cuánto debe cada persona al resto. El objetivo es simplificar las liquidaciones: en lugar de múltiples transferencias cruzadas, la calculadora indica el número mínimo de pagos necesarios para saldar todas las cuentas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los gastos más comunes que se comparten en un piso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los más frecuentes son la factura de electricidad, el agua, el gas, el internet, la cuota de la comunidad de propietarios y las compras de productos de limpieza e higiene del hogar. Algunos pisos también comparten la compra de alimentos básicos (aceite, sal, detergente) y gastos puntuales como reparaciones domésticas o utensilios de cocina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre dividir gastos a partes iguales o proporcionalmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reparto a partes iguales es el más sencillo y evita discusiones, pero puede ser injusto si las habitaciones tienen tamaños muy distintos o si las personas tienen hábitos de consumo diferentes (por ejemplo, una persona pasa mucho tiempo en casa y otra casi no está). El reparto proporcional puede tener en cuenta el tamaño de la habitación, el tiempo de uso o los ingresos de cada persona, aunque requiere acordar los criterios de antemano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con cuántos compañeros de piso funciona este tipo de calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este tipo de herramientas funciona para cualquier número de convivientes, desde dos personas hasta pisos grandes con seis o más personas. El algoritmo calcula las deudas netas de cada participante y minimiza el número de transferencias necesarias para saldar las cuentas, independientemente de cuántos gastos se hayan registrado o de quién los haya pagado.',
      },
    },
  ],
};
