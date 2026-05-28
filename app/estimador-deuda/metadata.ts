import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Deuda - Método Bola de Nieve y Avalancha | meskeIA',
  description: 'Estrategia para salir de deudas: compara bola de nieve vs avalancha. Calcula cuánto ahorras en intereses y en cuánto tiempo liquidas todo. Planificador gratuito.',
  keywords: 'eliminar deudas, bola de nieve, avalancha, pagar deudas, estrategia deuda, salir de deudas, intereses, prestamos, tarjetas credito',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Deuda - Bola de Nieve vs Avalancha - meskeIA',
    description: 'Compara estrategias para eliminar deudas. Descubre cuál método te ahorra más tiempo y dinero.',
    url: 'https://meskeia.com/estimador-deuda/',
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
    title: 'Estimador de Deuda - meskeIA',
    description: 'Elimina tus deudas con el método bola de nieve o avalancha. Compara y elige el mejor para ti.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Deuda",
  description: "Estrategia para salir de deudas: compara bola de nieve vs avalancha. Calcula cuánto ahorras en intereses y en cuánto tiempo liquidas todo. Planificador gratuito.",
  url: "https://meskeia.com/estimador-deuda/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el método bola de nieve para salir de deudas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método bola de nieve consiste en ordenar las deudas de menor a mayor saldo y destinar el dinero extra a liquidar primero la más pequeña, manteniendo el mínimo en las demás. Al cancelar cada deuda, el importe liberado se acumula sobre la siguiente. Su mayor ventaja es psicológica: ver deudas desaparecer rápidamente mantiene la motivación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el método avalancha y en qué se diferencia de la bola de nieve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método avalancha ordena las deudas de mayor a menor tipo de interés y ataca primero la más cara. Matemáticamente es más eficiente que la bola de nieve: ahorra más dinero en intereses totales y termina la deuda en menos tiempo. La diferencia puede suponer cientos o miles de euros dependiendo del saldo y los tipos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál método es mejor para eliminar deudas: bola de nieve o avalancha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del perfil de cada persona. La avalancha es mejor matemáticamente (ahorra más en intereses), pero la bola de nieve puede ser más efectiva para quienes necesitan victorias rápidas para mantener el compromiso. Ambos métodos son superiores a pagar solo los mínimos, que puede extender las deudas durante décadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo se tarda en salir de deudas con estos métodos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo depende del saldo total, los tipos de interés y el importe mensual extra que puedas destinar. Pagar solo los mínimos en una tarjeta de crédito con saldo de 5.000 € al 20% TAE puede tardar más de 20 años. Añadir 100 € mensuales extras puede reducirlo a 3-4 años y ahorrar miles de euros en intereses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué debo hacer antes de elegir una estrategia para pagar mis deudas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Antes de elegir método, conviene listar todas las deudas con su saldo, tipo de interés y cuota mínima. Si alguna deuda tiene intereses muy altos (tarjetas al 20-25% TAE o más), la avalancha ahorrará más. Si las deudas tienen tipos similares, la bola de nieve puede ser igual de eficiente y más motivadora. Mantener un pequeño fondo de emergencia (1-2 meses de gastos) también ayuda a no generar nueva deuda ante imprevistos.',
      },
    },
  ],
};
