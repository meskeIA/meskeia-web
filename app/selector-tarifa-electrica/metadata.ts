import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

/**
 * «¿Cómo se cambia de tarifa?», en UN solo sitio (hallazgo 3173, 20/10/2026).
 *
 * La importan las dos bocas que la publican: el FAQPage de abajo y la FAQ VISIBLE de
 * `page.tsx`. Estaban escritas aparte y daban tres plazos para el mismo cambio («inmediato»,
 * «2-3 semanas» y «el siguiente ciclo de facturación», más «entre 1 y 3 semanas» en «Errores
 * comunes»), y el FAQPage, que es lo que citan los asistentes de IA, callaba la permanencia que
 * la tabla de la misma página sí da. El plazo depende de la gestión entre comercializadora y
 * distribuidora, así que la respuesta no fija ninguno.
 */
export const PREGUNTA_CAMBIO_TARIFA = '¿Cómo puedo cambiar de tarifa eléctrica, del PVPC al mercado libre o al revés?';

export const RESPUESTA_CAMBIO_TARIFA = 'Se puede cambiar en cualquier momento y en los dos sentidos. Para pasar al PVPC se contrata con una comercializadora de referencia (la lista oficial está en la web de la CNMC); para pasar al mercado libre, con la comercializadora elegida, tras comparar ofertas en el comparador de la CNMC (comparador.cnmc.gob.es). Solo hace falta el CUPS, que aparece en la factura. El cambio no tiene coste, no corta el suministro ni exige cambiar el contador: lo tramita la nueva comercializadora con la distribuidora, y el plazo depende de esa gestión. Antes, mira si tu contrato del mercado libre tiene permanencia: salir antes de que acabe puede suponer una penalización.';

export const metadata: Metadata = {
  title: 'Selector de Tarifa Eléctrica - PVPC o Mercado Libre España | meskeIA',
  description:
    'Test de 10 preguntas para descubrir si te conviene más la tarifa PVPC regulada o el mercado libre de electricidad en España. Analiza tu patrón de consumo.',
  keywords:
    'PVPC o mercado libre, tarifa eléctrica España, discriminación horaria, 2.0TD, mejor tarifa luz, comparar tarifas electricidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Selector de Tarifa Eléctrica - PVPC o Mercado Libre | meskeIA',
    description:
      'Responde 10 preguntas sobre tus hábitos de consumo y descubre qué tarifa eléctrica te conviene más: PVPC regulada o mercado libre.',
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
    title: 'Selector de Tarifa Eléctrica | meskeIA',
    description:
      'Test rápido para saber si te conviene PVPC o mercado libre de electricidad en España.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Selector de Tarifa Eléctrica meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Selector de Tarifa Eléctrica',
  description:
    'Herramienta interactiva con 10 preguntas para analizar tu patrón de consumo eléctrico y recomendarte la mejor tarifa: PVPC regulada (2.0TD con discriminación horaria) o mercado libre con precio fijo. Incluye los factores de tu perfil y consejos personalizados.',
  url: 'https://meskeia.com/selector-tarifa-electrica/',
  features: [
    'Test de 10 preguntas sobre hábitos de consumo eléctrico',
    'Recomendación personalizada entre PVPC y mercado libre',
    'Factores clave de tu perfil y consejos personalizados',
    'Explicación de franjas horarias 2.0TD (punta, llano, valle)',
    'Disponible en español',
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
      name: PREGUNTA_CAMBIO_TARIFA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_CAMBIO_TARIFA,
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
