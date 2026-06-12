import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Hipoteca - Calcula tu Cuota Mensual | meskeIA',
  description: 'Calcula la cuota mensual de tu hipoteca. Simulador con sistema francés, tabla de amortización completa, comparador de ofertas y análisis de gastos.',
  keywords: 'simulador hipoteca, calculadora hipoteca, cuota mensual, amortización francesa, préstamo hipotecario, TAE, euríbor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Hipoteca | meskeIA',
    description: 'Calcula tu cuota hipotecaria y visualiza la amortización completa.',
    url: 'https://meskeia.com/estimador-hipoteca/',
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
    title: 'Estimador de Hipoteca | meskeIA',
    description: 'Simula tu hipoteca con tabla de amortización y comparador de ofertas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué porcentaje del salario se recomienda destinar a la hipoteca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los organismos reguladores como el Banco de España y la EBA recomiendan que la cuota hipotecaria no supere el 30-35% de los ingresos netos mensuales del hogar. Superar ese umbral se considera sobreendeudamiento. Los bancos generalmente no conceden hipotecas cuando la cuota supera el 35-40% de los ingresos justificados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre hipoteca fija, variable y mixta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hipoteca fija mantiene el mismo tipo de interés durante toda la vida del préstamo; ofrece certeza pero suele tener tipo inicial más alto. La variable referencia el tipo al euríbor más un diferencial fijo, por lo que la cuota cambia en cada revisión. La mixta combina un período fijo inicial (5-15 años) seguido de un tramo variable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos años puede durar una hipoteca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plazo máximo habitual en España es de 30 años, aunque algunos bancos llegan a 40 años. El plazo máximo suele estar condicionado a que el prestatario no supere los 70-75 años al final del préstamo. Hipotecas más largas reducen la cuota mensual pero aumentan considerablemente los intereses totales pagados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el TAE de una hipoteca y cómo interpretarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La TAE (Tasa Anual Equivalente) refleja el coste total del préstamo incluyendo el tipo de interés nominal más comisiones y gastos asociados, expresado como porcentaje anual. Permite comparar distintas ofertas hipotecarias en igualdad de condiciones. Para comparar hipotecas variables es más útil la FEIN (Ficha Europea de Información Normalizada) que calcula la TAE para distintos escenarios de euríbor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero necesito ahorrado para pedir una hipoteca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los bancos financian habitualmente hasta el 80% del valor de tasación para vivienda habitual (70% para segunda residencia). Necesitas aportar al menos el 20% del precio como entrada. Además, debes contar con entre un 10-12% adicional para cubrir los gastos de compraventa: impuesto de transmisiones (ITP) o IVA, notaría, registro y gestoría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga en total de intereses en una hipoteca a 30 años?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del capital, el tipo de interés y el plazo. Una hipoteca de 200.000 € al 3% a 30 años genera unos 103.500 € de intereses totales. Reducir el plazo a 20 años con el mismo tipo bajaría los intereses a unos 66.000 €, aunque con una cuota mensual más alta. El simulador calcula el coste total exacto para cada combinación de capital, tipo y plazo.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Hipoteca",
  description: "Calcula la cuota mensual de tu hipoteca. Simulador con sistema francés, tabla de amortización completa, comparador de ofertas y análisis de gastos.",
  url: "https://meskeia.com/estimador-hipoteca/",
  category: 'FinanceApplication',
  features: [
    'Cálculo de cuota mensual con sistema de amortización francés',
    'Hipoteca fija, variable o mixta',
    'Tabla de amortización mensual y anual completa',
    'Comparador de los tres tipos de hipoteca con los mismos datos',
    'Cálculo del ratio cuota/ingresos y alerta de sobreendeudamiento',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
});
