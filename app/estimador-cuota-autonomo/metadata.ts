import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador Cuota de Autónomo 2025 - Orientación RETA | meskeIA',
  description: 'Estima tu cuota de autónomo según tus ingresos reales. Sistema de cotización por tramos 2025, tarifa plana, bonificaciones y orientación sobre pagos mensuales.',
  keywords: 'cuota autonomo, estimador reta, cotizacion autonomos, tarifa plana autonomos, cuota seguridad social, autonomo ingresos reales, tramos cotizacion, base cotizacion, cuota minima autonomo 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Cuota de Autónomo 2025 - Orientación RETA',
    description: 'Estima tu cuota de autónomo según tus ingresos reales. Tramos 2025, tarifa plana y bonificaciones.',
    url: 'https://meskeia.com/estimador-cuota-autonomo/',
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
    title: 'Estimador Cuota de Autónomo 2025',
    description: 'Estima tu cuota de autónomo según el sistema de cotización por ingresos reales',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Cuota Autónomo meskeIA',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto se paga de cuota de autónomo en 2025 según los ingresos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En 2025 la cuota de autónomo depende de los ingresos netos reales. El sistema tiene 15 tramos: la cuota mínima (ingresos hasta 670 €/mes) es de 200 € al mes, y la máxima (ingresos superiores a 6.000 €/mes) es de 590 € mensuales. Para ingresos entre 1.700 y 1.850 €/mes, la cuota es de 291 € al mes. Los autónomos societarios tienen cuotas distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la tarifa plana para nuevos autónomos en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los autónomos que se dan de alta por primera vez (o reincorporados tras más de 2 años de baja) pueden acogerse a la cuota reducida de 80 € al mes durante los primeros 12 meses, independientemente de sus ingresos. Este período puede prorrogarse otros 12 meses adicionales si los ingresos no superan el SMI (1.134 € en 2025). El sistema anterior de tarifa plana de 60 € se eliminó con la reforma del RETA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los ingresos netos en el sistema de cotización de autónomos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el sistema de cotización por ingresos reales, los ingresos netos son la diferencia entre los ingresos íntegros de la actividad y los gastos deducibles como materiales, alquiler, suministros, cuotas de colegios profesionales o parte del teléfono, sin incluir el propio importe de la cuota de autónomo pagada. Sobre esa cantidad neta se determina el tramo de cotización aplicable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede el autónomo cambiar su cuota durante el año?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El sistema permite actualizar la base de cotización hasta 6 veces al año para ajustarla a la evolución prevista de los ingresos: en enero, marzo, mayo, julio, septiembre y noviembre. El ajuste final se hace en la declaración del año siguiente: si los ingresos reales fueron superiores a lo cotizado, hay que pagar la diferencia; si fueron inferiores, la Seguridad Social devuelve el exceso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cubre la cuota de autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota de autónomo incluye la cobertura de: contingencias comunes (enfermedad común, accidente no laboral y baja médica), jubilación, incapacidad permanente, muerte y supervivencia. Opcionalmente se puede incluir la cobertura de contingencias profesionales (accidente de trabajo y enfermedad profesional) y la prestación por cese de actividad, equivalente al paro para trabajadores por cuenta ajena, que es voluntaria para autónomos personas físicas.',
      },
    },
  ],
};
