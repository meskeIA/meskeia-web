import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tarifa Electrica - PVPC o Mercado Libre Espana | meskeIA',
  description:
    'Test de 10 preguntas para descubrir si te conviene mas la tarifa PVPC regulada o el mercado libre de electricidad en Espana. Analiza tu patron de consumo.',
  keywords:
    'PVPC o mercado libre, tarifa electrica Espana, discriminacion horaria, 2.0TD, mejor tarifa luz, comparar tarifas electricidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Selector de Tarifa Electrica - PVPC o Mercado Libre | meskeIA',
    description:
      'Responde 10 preguntas sobre tus habitos de consumo y descubre que tarifa electrica te conviene mas: PVPC regulada o mercado libre.',
    url: 'https://meskeia.com/selector-tarifa-electrica/',
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
    title: 'Selector de Tarifa Electrica | meskeIA',
    description:
      'Test rapido para saber si te conviene PVPC o mercado libre de electricidad en Espana.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Selector de Tarifa Electrica meskeIA',
  },
};

// Schema.org JSON-LD para indexacion por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Selector de Tarifa Electrica',
  description:
    'Herramienta interactiva con 10 preguntas para analizar tu patron de consumo electrico y recomendarte la mejor tarifa: PVPC regulada (2.0TD con discriminacion horaria) o mercado libre con precio fijo. Incluye estimacion de coste anual y consejos personalizados.',
  url: 'https://meskeia.com/selector-tarifa-electrica/',
  features: [
    'Test de 10 preguntas sobre habitos de consumo electrico',
    'Recomendacion personalizada entre PVPC y mercado libre',
    'Estimacion de coste anual para cada opcion',
    'Explicacion de franjas horarias 2.0TD (punta, llano, valle)',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el PVPC y en qué se diferencia del mercado libre de electricidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El PVPC (Precio Voluntario para el Pequeño Consumidor) es la tarifa regulada de electricidad en España, cuyo precio varía cada hora en función del mercado mayorista. El mercado libre ofrece precios fijos o indexados pactados entre el consumidor y la comercializadora. El PVPC puede ser más barato en períodos de baja demanda (noches y fines de semana en la tarifa 2.0TD), mientras que el mercado libre aporta predictibilidad en la factura mensual sin importar las fluctuaciones del mercado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la discriminación horaria en la tarifa 2.0TD?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tarifa 2.0TD divide el día en tres franjas horarias con precios distintos: punta (de 10 a 14 h y de 18 a 22 h en días laborables), llano (de 8 a 10 h, de 14 a 18 h y de 22 a 24 h en días laborables) y valle (de 0 a 8 h todos los días y las 24 horas en fines de semana y festivos nacionales). Consumir en horas valle puede costar hasta tres veces menos que en hora punta, por lo que hogares con flexibilidad horaria se benefician significativamente de esta tarifa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Me conviene el PVPC o el mercado libre de la luz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de tu perfil de consumo. El PVPC es ventajoso si puedes desplazar electrodomésticos de alto consumo (lavadora, lavavajillas, carga de vehículo eléctrico) a las horas valle y si tienes un consumo bajo en horas punta. El mercado libre conviene si prefieres una factura estable y predecible, trabajas en casa en horario de punta o no tienes flexibilidad para cambiar tus hábitos de consumo. Comparar con un simulador basado en tus hábitos reales es la forma más fiable de decidir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo cambiar de tarifa eléctrica en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para pasar del mercado libre al PVPC puedes contactar con cualquier comercializadora de referencia (Endesa, Iberdrola, Naturgy, EDP o CHC). Para pasarte al mercado libre, compara ofertas en el comparador de la CNMC (comparador.cnmc.gob.es) y contacta con la comercializadora elegida. El cambio no tiene coste y suele hacerse efectivo en el siguiente ciclo de facturación. Solo necesitas tu número de CUPS (que aparece en tu factura actual).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el CUPS y dónde lo encuentro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El CUPS (Código Universal de Punto de Suministro) es un código de 20-22 caracteres que identifica de forma única el punto de suministro eléctrico de tu vivienda. Comienza siempre por "ES" seguido de números. Lo encontrarás en cualquiera de tus facturas de la luz, habitualmente en un lugar destacado o en los datos del contrato. Es imprescindible para cambiar de comercializadora o tarifa, ya que permite que la nueva empresa localice y active tu suministro sin necesidad de instalar nuevos equipos.',
      },
    },
  ],
};
