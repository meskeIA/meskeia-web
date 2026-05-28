import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Estimador de Cartera de Inversión - Monte Carlo | meskeIA',
  description: 'Simula la evolución de tu cartera de inversión con Monte Carlo. Visualiza escenarios, calcula Sharpe, volatilidad y probabilidad de alcanzar tus objetivos financieros.',
  keywords: 'simulador cartera, monte carlo inversión, backtesting, sharpe ratio, volatilidad, simulador inversiones, cartera indexada, proyección patrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Cartera de Inversión | meskeIA',
    description: 'Simula 1000 escenarios para tu cartera. Visualiza la evolución probable de tu patrimonio con análisis Monte Carlo.',
    url: 'https://meskeia.com/estimador-cartera-inversion/',
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
    title: 'Estimador de Cartera de Inversión | meskeIA',
    description: 'Proyecta tu cartera con simulación Monte Carlo. Sharpe, volatilidad y escenarios.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Cartera de Inversión - Monte Carlo",
  description: "Simula la evolución de tu cartera de inversión con Monte Carlo. Visualiza escenarios, calcula Sharpe, volatilidad y probabilidad de alcanzar tus objetivos financieros.",
  url: 'https://meskeia.com/estimador-cartera-inversion/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la simulación Monte Carlo aplicada a inversiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La simulación Monte Carlo es un método estadístico que genera miles de escenarios posibles para la evolución de una cartera, usando distribuciones de rentabilidad y volatilidad históricas o estimadas. El resultado no es una predicción única, sino un abanico de trayectorias que permite ver el rango probable de resultados y la probabilidad de alcanzar un objetivo concreto de patrimonio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ratio de Sharpe y para qué sirve en una cartera de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio de Sharpe mide la rentabilidad extra que obtiene una cartera por cada unidad de riesgo asumido (volatilidad). Se calcula como (rentabilidad cartera − tasa libre de riesgo) / desviación estándar. Un Sharpe superior a 1 se considera bueno; por encima de 2, excelente. Permite comparar carteras distintas ajustando por el riesgo que cada una asume.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería ser la rentabilidad anual esperada de una cartera indexada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Históricamente, una cartera global diversificada (acciones mundiales + renta fija) ha generado rentabilidades medias anuales del 6-9% nominal antes de inflación, dependiendo del periodo y la composición. Una cartera 100% renta variable ha promediado cerca del 9-10% anual en el último siglo, aunque con años de caídas superiores al 40%. Las rentabilidades pasadas no garantizan resultados futuros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de inversor es útil un estimador de cartera con Monte Carlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para inversores que ya tienen una cartera formada o están planificando construirla y quieren cuantificar el riesgo de no alcanzar su objetivo de patrimonio. También ayuda a comparar asignaciones de activos distintas (más o menos renta variable) y a entender cómo la volatilidad y las aportaciones periódicas afectan al resultado final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre volatilidad y riesgo en una cartera de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La volatilidad mide las oscilaciones del valor de la cartera (desviación estándar de los rendimientos); el riesgo en sentido amplio incluye también el riesgo de crédito, de liquidez o de no alcanzar el objetivo financiero en el plazo previsto. Una cartera de renta fija a corto plazo tiene baja volatilidad pero puede tener alto riesgo de no batir la inflación a largo plazo.',
      },
    },
  ],
};
