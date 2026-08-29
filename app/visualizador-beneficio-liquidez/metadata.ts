import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Beneficio vs Liquidez: Por qué una empresa rentable puede cerrar - meskeIA',
  description: 'Visualiza la diferencia entre beneficio contable y caja real. Simula 12 meses y descubre por qué una empresa puede tener beneficios y quedarse sin dinero en el banco.',
  keywords: 'beneficio vs liquidez, flujo de caja empresa, problema liquidez pyme, cobros pagos empresa, gestión tesorería, por qué empresa quiebra con beneficios, PMC PMP liquidez',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Beneficio vs Liquidez — meskeIA',
    description: 'Simula 12 meses de actividad empresarial y descubre la diferencia entre beneficio contable y caja real. Visualiza cómo el cobro tardío, el stock y las inversiones vacían la caja.',
    url: 'https://meskeia.com/visualizador-beneficio-liquidez/',
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
    title: 'Beneficio vs Liquidez — meskeIA',
    description: 'Configura tu empresa y ve en un gráfico por qué el beneficio contable y la caja real no son lo mismo.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Visualizador Beneficio vs Liquidez meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador Beneficio vs Liquidez',
  description: 'Simulador interactivo que muestra la diferencia entre beneficio contable y caja real en una empresa. Configura ventas, costos, plazo de cobro a clientes, plazo de pago a proveedores, stock inicial e inversiones para ver en un gráfico de 12 meses cómo divergen el beneficio acumulado y la caja disponible.',
  url: 'https://meskeia.com/visualizador-beneficio-liquidez/',
  category: 'FinanceApplication',
  features: [
    'Simulación de 12 meses de actividad empresarial',
    'Gráfico comparativo: beneficio acumulado vs caja acumulada',
    'Configuración de PMC, PMP, stock inicial y capex',
    'Tres escenarios predefinidos: saludable, en riesgo y crisis de caja',
    'Tabla mensual con cobros, pagos y saldo de caja',
    'Alerta automática cuando la caja entra en negativo',
    'Métricas clave: brecha máxima y meses con caja negativa',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué una empresa con beneficios puede quedarse sin dinero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el beneficio contable reconoce ingresos cuando se facturan, no cuando se cobran. Si una empresa factura 100.000 € pero el cliente paga en 90 días, ese dinero no está disponible en caja. Al mismo tiempo puede estar pagando a sus proveedores en 30 días. Esta diferencia entre cuándo se reconoce el beneficio y cuándo fluye el dinero genera la brecha entre beneficio y liquidez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el PMC y cómo afecta a la liquidez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El PMC (Período Medio de Cobro) es el tiempo promedio en días que tarda una empresa en cobrar a sus clientes. Un PMC de 90 días significa que la empresa financia a sus clientes durante tres meses: factura en enero pero no recibe el dinero hasta abril. Cuanto mayor sea el PMC, más capital queda atrapado en cuentas a cobrar y menos caja disponible tiene la empresa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre flujo de caja y beneficio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El beneficio (o resultado contable) mide la diferencia entre ingresos devengados y gastos devengados, independientemente de cuándo se cobra o se paga. El flujo de caja mide los movimientos reales de dinero: entradas y salidas de la cuenta bancaria. Una venta facturada suma al beneficio pero solo suma al flujo de caja cuando se cobra. Una compra de maquinaria resta caja inmediatamente pero en la cuenta de resultados solo reduce el beneficio mediante amortizaciones anuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puede mejorar su liquidez una empresa sin reducir los beneficios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay varias palancas: negociar cobros más rápidos a clientes (mediante descuentos por pronto pago, factoring o confirming), negociar plazos de pago más largos con proveedores, reducir el nivel de stock al mínimo necesario, y planificar las inversiones en momentos de mayor caja. Cobrar 15 días antes equivale en liquidez a una reducción significativa del coste de financiación externa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un presupuesto de tesorería y por qué es imprescindible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un presupuesto de tesorería es una proyección mensual de los cobros y pagos reales esperados. A diferencia del presupuesto de resultados (que trabaja con devengos), el de tesorería muestra cuándo llegará el dinero y cuándo habrá que pagarlo. Con él, el responsable financiero detecta con semanas de antelación los meses de tensión de caja y puede tomar medidas: pedir un préstamo de campaña, acelerar cobros o retrasar inversiones.',
      },
    },
  ],
};
