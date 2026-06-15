import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Oferta y Demanda — Equilibrio, Excedente y Controles de Precio | meskeIA',
  description:
    'Visualiza en tiempo real las curvas de oferta y demanda, el punto de equilibrio, el excedente del consumidor y del productor. Experimenta con desplazadores y controles de precio. Ideal para Bachillerato, universitarios y curiosos de la economía.',
  keywords:
    'oferta y demanda, equilibrio de mercado, precio de equilibrio, excedente del consumidor, excedente del productor, desplazadores demanda, precio máximo, precio mínimo, curva de demanda, curva de oferta, economía, Bachillerato, EBAU, bienestar social',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Oferta y Demanda | meskeIA',
    description:
      'Mueve los desplazadores de oferta y demanda para ver el equilibrio en tiempo real. Experimenta con precios máximos y mínimos.',
    url: 'https://meskeia.com/simulador-oferta-demanda/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Oferta y Demanda | meskeIA',
    description:
      'Visualiza curvas de oferta y demanda, equilibrio, excedentes y controles de precio en tiempo real.',
  },
  other: {
    'application-name': 'Simulador de Oferta y Demanda meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Oferta y Demanda',
  description:
    'Simulador interactivo de oferta y demanda para Bachillerato y universidad. Mueve desplazadores (renta, costes, tecnología) y controla precios máximos y mínimos para observar el efecto sobre el equilibrio, el excedente del consumidor y del productor.',
  url: 'https://meskeia.com/simulador-oferta-demanda/',
  category: 'EducationalApplication',
  features: [
    'Visualización en tiempo real de curvas de oferta y demanda en canvas 2D',
    'Cálculo automático del precio y cantidad de equilibrio',
    'Excedente del consumidor, excedente del productor y bienestar total',
    'Desplazadores de demanda: renta, bienes sustitutivos y preferencias',
    'Desplazadores de oferta: costes, tecnología y número de productores',
    'Modos de precio controlado: precio máximo (techo) y precio mínimo (suelo)',
    'Indicador de escasez o excedente bajo control de precios',
  ],
  keywords: [
    'oferta y demanda',
    'equilibrio de mercado',
    'precio de equilibrio',
    'excedente consumidor',
    'economía Bachillerato',
    'EBAU economía',
    'precio máximo',
    'precio mínimo',
    'desplazadores demanda',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el equilibrio de mercado en oferta y demanda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El equilibrio de mercado es el punto en que la cantidad que los compradores quieren adquirir coincide exactamente con la que los vendedores quieren ofrecer a un precio dado. En ese precio de equilibrio no hay ni escasez ni excedente. Si el precio sube por encima del equilibrio aparece un excedente (sobreoferta); si baja, surge escasez.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre cuando se fija un precio máximo por debajo del equilibrio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un precio máximo (techo de precio) por debajo del equilibrio hace que la cantidad demandada supere a la ofrecida, generando escasez. Aunque beneficia a los consumidores que logran comprar, impide que el mercado se vacíe y puede provocar colas, mercados negros o deterioro de la calidad del bien.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta un aumento de la renta a la curva de demanda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para la mayoría de los bienes normales, un aumento de la renta desplaza la curva de demanda hacia la derecha: a cada precio los consumidores quieren comprar más. Esto eleva el precio de equilibrio y la cantidad de equilibrio. Para bienes inferiores (como ciertos alimentos de bajo coste) el efecto es el contrario: la curva se desplaza a la izquierda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide el excedente del consumidor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El excedente del consumidor es la diferencia entre lo que un consumidor estaría dispuesto a pagar por un bien y lo que realmente paga. En el gráfico aparece como el área triangular entre la curva de demanda y la línea horizontal del precio de equilibrio. Cuanto más pronunciada (inelástica) sea la demanda, mayor es ese excedente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo desplaza la curva de oferta una mejora tecnológica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una mejora tecnológica reduce los costes de producción, lo que permite a los productores ofrecer la misma cantidad a un precio menor —o más cantidad al mismo precio—. La curva de oferta se desplaza hacia la derecha, bajando el precio de equilibrio y aumentando la cantidad de equilibrio. Es uno de los principales motores de la deflación de bienes manufacturados a largo plazo.',
      },
    },
  ],
};
