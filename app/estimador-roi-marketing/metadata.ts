import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador ROI Marketing - Analiza tu Inversión Publicitaria | meskeIA',
  description: 'Calcula el ROI de tus campañas de marketing por canal. Analiza Google Ads, Facebook, Instagram, Email y SEO. Métricas CAC, CLV y recomendaciones.',
  keywords: 'roi marketing, retorno inversion, google ads roi, facebook ads, cac, clv, coste adquisicion cliente, marketing digital',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador ROI Marketing | meskeIA',
    description: 'Mide la rentabilidad de tus campañas de marketing digital. Compara canales y optimiza tu inversión publicitaria.',
    url: 'https://meskeia.com/estimador-roi-marketing/',
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
    title: 'Estimador ROI Marketing | meskeIA',
    description: 'Herramienta gratuita para calcular el ROI de tus campañas de marketing digital.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador ROI Marketing",
  description: "Calcula el ROI de tus campañas de marketing por canal. Analiza Google Ads, Facebook, Instagram, Email y SEO. Métricas CAC, CLV y recomendaciones.",
  url: "https://meskeia.com/estimador-roi-marketing/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el ROI de una campaña de marketing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ROI (Return on Investment) se calcula como: ROI = ((Ingresos generados - Inversión total) ÷ Inversión total) × 100. Por ejemplo, si inviertes 500 € en Google Ads y obtienes 1.500 € en ventas atribuidas, el ROI es del 200%. El estimador realiza este cálculo por cada canal de forma separada para facilitar la comparación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué canales de marketing digital permite analizar el estimador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estimador cubre los canales más habituales en marketing digital: Google Ads (SEM), Facebook Ads, Instagram Ads, Email Marketing y SEO orgánico. Para cada canal puedes introducir la inversión, el número de conversiones y el valor medio de cada conversión, obteniendo el ROI y el coste de adquisición de cliente (CAC) de forma individualizada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el CAC y en qué se diferencia del ROI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El CAC (Coste de Adquisición de Cliente) mide cuánto cuesta conseguir un nuevo cliente: CAC = Inversión ÷ Número de clientes nuevos. El ROI mide la rentabilidad global de la inversión. Un CAC bajo con ROI alto indica que el canal es muy eficiente; un CAC elevado puede ser aceptable si el valor de vida del cliente (CLV) es alto y compensa la inversión inicial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve comparar el ROI entre distintos canales de publicidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comparar el ROI por canal permite reasignar el presupuesto hacia los canales más rentables y reducir o pausar los que no generan retorno suficiente. Es frecuente que un mismo presupuesto produzca resultados muy distintos en Google Ads versus redes sociales, dependiendo del sector y el público objetivo. La comparación objetiva evita decisiones basadas solo en preferencias o tendencias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el CLV y por qué importa al calcular el ROI de marketing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El CLV (Customer Lifetime Value o valor de vida del cliente) estima el ingreso total que genera un cliente durante toda su relación con el negocio. Si el CLV es alto, puede ser rentable invertir en un CAC elevado que a primera vista parece inasumible. El estimador incorpora el CLV para ofrecer una visión completa de la rentabilidad a largo plazo, no solo de la campaña concreta.',
      },
    },
  ],
};
