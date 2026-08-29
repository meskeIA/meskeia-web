import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Valoración de Empresa - Métodos M&A - meskeIA',
  description: 'Calcula el valor orientativo de tu empresa con 4 métodos: múltiplo de EBITDA, múltiplo de ventas, capitalización de beneficios y valor contable. Rangos por sector y zona de consenso.',
  keywords: 'valoracion empresa, multiplo ebitda, valoracion pyme, precio empresa, calculo valor negocio, multiplo ventas, capitalizacion beneficios, valor contable empresa, fusion adquisicion, due diligence',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Valoración de Empresa - meskeIA',
    description: 'Obtén el rango de valoración de tu empresa con 4 métodos: múltiplo EBITDA/ventas, capitalización de beneficios y valor contable. Múltiplos por sector incluidos.',
    url: 'https://meskeia.com/calculadora-valoracion-empresa/',
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
    title: 'Calculadora de Valoración de Empresa - meskeIA',
    description: 'Introduce EBITDA, ventas y resultado neto de tu empresa. Obtén valoración con 4 métodos y zona de consenso entre múltiplos sectoriales.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Valoración de Empresa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Valoración de Empresa',
  description: 'Herramienta para calcular el valor orientativo de una empresa mediante cuatro métodos de valoración: múltiplo de EBITDA, múltiplo de ventas, capitalización de beneficios y valor contable. Incluye múltiplos sectoriales para 8 sectores, zona de consenso entre métodos y gráfico visual de comparación de rangos.',
  url: 'https://meskeia.com/calculadora-valoracion-empresa/',
  category: 'FinanceApplication',
  features: [
    '4 métodos de valoración: EBITDA, ventas, capitalización y valor contable',
    'Múltiplos sectoriales para 8 sectores (tecnología, industrial, retail, salud y más)',
    'Zona de consenso calculada automáticamente con los métodos válidos',
    'Gráfico de barras de rango CSS para comparar métodos visualmente',
    'Datos de empresa de ejemplo precargados para ver resultados al instante',
    'Tasa de capitalización configurable (por defecto 15%)',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se valora una empresa pequeña o pyme?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para valorar una pyme se usan principalmente dos métodos: el múltiplo de EBITDA (resultado antes de intereses, impuestos y amortizaciones multiplicado por un factor sectorial de 3x a 15x según el sector) y el múltiplo de ventas. En operaciones de compraventa de pymes en España, el múltiplo de EBITDA es el más utilizado. El resultado contable entre la tasa de capitalización (habitualmente entre 10% y 20%) complementa el análisis. El valor contable del patrimonio neto actúa como suelo de referencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el múltiplo de EBITDA y por qué varía entre sectores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El múltiplo de EBITDA es el número de veces el EBITDA anual que un comprador está dispuesto a pagar por la empresa. Varía entre sectores porque refleja las expectativas de crecimiento y el riesgo del negocio. Una empresa de software puede valer 8-15x su EBITDA por su alto margen y escalabilidad, mientras que un negocio de hostelería suele valorarse en 3-6x por los riesgos de gestión y los activos físicos intensivos. En la práctica, los múltiplos se negocian caso a caso en función de crecimiento, dependencia del fundador y diversificación de clientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la tasa de capitalización en la valoración de empresas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tasa de capitalización (o tasa de descuento simplificada) representa el rendimiento anual que exige el inversor por el riesgo asumido. En el método de capitalización de beneficios, el valor de la empresa es el resultado neto dividido entre esta tasa: si la empresa gana 180.000 € y la tasa es del 15%, su valor orientativo es 1.200.000 €. Una tasa más alta implica mayor riesgo percibido y por tanto menor valoración. Para pymes españolas suele usarse entre el 12% y el 20%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el valor contable y el valor real de una empresa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El valor contable (patrimonio neto del balance) refleja lo que los propietarios han aportado más los beneficios acumulados, valorados al coste histórico. El valor real o de mercado suele ser superior porque incorpora la capacidad de generar beneficios futuros, la cartera de clientes, la marca, el equipo y los activos intangibles. El valor contable actúa como suelo mínimo de referencia: una empresa raramente se vende por debajo de su patrimonio neto salvo en situaciones de liquidación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo preparo mi empresa para venderla al mejor precio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para maximizar la valoración conviene: documentar correctamente las cuentas de los últimos 3 años y ajustar el EBITDA eliminando gastos no recurrentes; reducir la dependencia del fundador distribuyendo funciones clave en el equipo directivo; diversificar la cartera de clientes para que ninguno represente más del 15-20% de la facturación; resolver contingencias legales y fiscales pendientes; y presentar un plan de negocio creíble. Cada punto de EBITDA adicional puede multiplicarse 5-10 veces en el precio de venta.',
      },
    },
  ],
};
