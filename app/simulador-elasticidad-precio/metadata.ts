import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Elasticidad-Precio de la Demanda | meskeIA',
  description:
    'Simula la elasticidad-precio de la demanda para 6 bienes reales. Visualiza los rectángulos de ingreso total, clasifica la demanda y aprende cómo el precio afecta a los ingresos empresariales.',
  keywords:
    'elasticidad precio demanda, Ed, inelástica, elástica, ingreso total, excedente, bien de primera necesidad, economía, elasticidad oferta, Bachillerato, EBAU, preparatoria, secundaria, examen de admisión universitaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Elasticidad-Precio de la Demanda',
    description:
      'Visualiza en tiempo real cómo la elasticidad-precio determina el efecto de un cambio de precio sobre el ingreso total.',
    url: 'https://meskeia.com/simulador-elasticidad-precio',
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
    title: 'Simulador de Elasticidad-Precio de la Demanda',
    description:
      'Simula bienes inelásticos (insulina, sal) y elásticos (smartphone, vuelo). Aprende economía con gráficos interactivos.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Simulador Elasticidad-Precio meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Elasticidad-Precio de la Demanda',
  description:
    'Simulador interactivo que visualiza la elasticidad-precio de la demanda para 6 bienes reales (insulina, sal, gasolina, café, smartphone, vuelo). Permite cambiar el precio y observar el efecto sobre la cantidad demandada y el ingreso total mediante rectángulos de ingreso superpuestos.',
  url: 'https://meskeia.com/simulador-elasticidad-precio/',
  category: 'EducationalApplication',
  features: [
    '6 bienes predefinidos con elasticidades reales (|Ed| de 0,1 a 2,4)',
    'Slider de variación de precio (−50% a +50%) con respuesta en tiempo real',
    'Visualización canvas de rectángulos de ingreso total base y nuevo',
    'Clasificación automática: perfectamente inelástica, inelástica, unitaria, elástica',
    'Toggle demanda / oferta con lógica diferenciada',
    'Panel de interpretación: por qué sube o baja el ingreso total',
    'Bloque educativo v2.0 con tabla comparativa, escenarios, FAQ y errores frecuentes',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
  keywords: [
    'elasticidad precio demanda',
    'Ed coeficiente elasticidad',
    'inelástica elástica',
    'ingreso total precio',
    'economía Bachillerato EBAU España',
    'economía preparatoria secundaria Latinoamérica',
    'simulador economía',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la elasticidad-precio de la demanda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La elasticidad-precio de la demanda (Ed) mide cuánto varía porcentualmente la cantidad demandada de un bien ante un cambio del 1% en su precio. Un valor |Ed| > 1 indica demanda elástica (los consumidores son muy sensibles al precio); |Ed| < 1 indica demanda inelástica (poco sensibles). El coeficiente se calcula como: Ed = (Δ%cantidad) / (Δ%precio).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene subir el precio para aumentar los ingresos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solo conviene subir el precio cuando la demanda es inelástica (|Ed| < 1), porque la pérdida de ventas es proporcionalmente menor que el aumento del precio, resultando en mayor ingreso total. Con demanda elástica ocurre lo contrario: la subida de precio provoca una caída de ventas tan grande que el ingreso total baja.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la insulina tiene elasticidad casi cero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La insulina es un medicamento imprescindible para las personas con diabetes: no existen sustitutos directos y no consumirla pone en riesgo la vida. Esto hace que la demanda sea casi perfectamente inelástica (|Ed| ≈ 0,1): aunque el precio suba drásticamente, los pacientes seguirán comprando prácticamente la misma cantidad. Es el ejemplo más extremo de inelasticidad en consumo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre elasticidad de demanda y elasticidad de oferta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La elasticidad de demanda mide la respuesta de los compradores ante un cambio de precio; la de oferta mide la respuesta de los productores. Una oferta inelástica (difícil de ampliar a corto plazo, como el suelo urbano) hace que subidas de demanda se traduzcan principalmente en subidas de precio. Una oferta elástica (fácil de escalar, como la manufactura) absorbe el aumento de demanda con más cantidad y poco cambio de precio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores hacen que una demanda sea más elástica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuatro factores aumentan la elasticidad: 1) Existencia de sustitutos cercanos (si hay alternativas, los consumidores las usan al subir el precio). 2) El bien representa un gasto alto sobre la renta (más incentivo para buscar alternativas). 3) Se trata de un bien de lujo, no de primera necesidad. 4) El horizonte temporal es largo (a largo plazo siempre hay más alternativas disponibles).',
      },
    },
  ],
};
