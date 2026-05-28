import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Retenciones IRPF en Facturas - Autónomos 2025 | meskeIA',
  description:
    'Descubre qué retención de IRPF aplicar en tus facturas como autónomo: 15%, 7% inicio actividad, arrendamientos, administradores. Modelo 111 y 190.',
  keywords:
    'retención IRPF facturas autónomos, cuando aplicar retención factura, 15% retención autónomo, 7% inicio actividad, modelo 111 retenciones, retención arrendamiento local, IRPF factura profesional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Retenciones IRPF en Facturas para Autónomos | meskeIA',
    description:
      'Consulta qué retención aplicar en tus facturas: 15% general, 7% inicio actividad, 19% arrendamiento. Guía completa con modelos 111 y 190.',
    url: 'https://meskeia.com/orientador-facturacion-retencion/',
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
    title: 'Orientador de Retenciones IRPF - Autónomos 2025 | meskeIA',
    description:
      'Descubre qué retención IRPF aplicar en tus facturas como autónomo. 15%, 7% inicio de actividad, arrendamientos y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Facturación Retención meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Retenciones IRPF en Facturas',
  description:
    'Herramienta interactiva que orienta a autónomos y profesionales sobre qué retención de IRPF aplicar en sus facturas según su perfil y situación: profesionales generales (15%), inicio de actividad (7%), arrendamientos de locales (19%), administradores y consejeros (35%), actividades agrícolas y forestales. Incluye guía de declaración con modelos 111 y 190.',
  url: 'https://meskeia.com/orientador-facturacion-retencion/',
  features: [
    'Selector de perfil para determinar la retención aplicable',
    'Tipos actualizados para 2025: 15%, 7%, 19%, 35%, 2%',
    'Explicación de cuándo NO se aplica retención (clientes particulares)',
    'Guía de declaración: modelo 111 trimestral y 190 anual',
    'Errores frecuentes y cómo evitarlos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué retención de IRPF debo aplicar en mis facturas como autónomo en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tipo general para profesionales autónomos es el 15%. Si acabas de iniciar tu actividad y no la has ejercido en los dos años anteriores, puedes aplicar el 7% durante el año de inicio y los dos siguientes. Los arrendamientos de locales de negocio llevan el 19%, y los administradores o consejeros de sociedades, el 35%. Estas retenciones solo se aplican cuando el cliente es una empresa o autónomo obligado a retener, nunca a particulares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo no hay que incluir retención en una factura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No se incluye retención cuando el destinatario de la factura es un particular (persona física sin actividad económica), cuando se emite a un cliente en el extranjero, ni en determinadas actividades clasificadas en epígrafes del IAE que tributan por módulos con reglas especiales. Tampoco llevan retención las facturas de venta de bienes (solo servicios profesionales la requieren habitualmente).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven el modelo 111 y el modelo 190?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo 111 es la declaración trimestral con la que las empresas y autónomos ingresan en Hacienda las retenciones de IRPF practicadas a sus proveedores profesionales y trabajadores. El modelo 190 es el resumen anual informativo de todas esas retenciones, que se presenta en enero del año siguiente. Ambos son obligatorios para quien haya practicado retenciones durante el ejercicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si me olvido de incluir la retención en una factura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si omites la retención por error, el cliente sigue siendo el obligado a ingresar ese importe en Hacienda aunque no se lo hayas retenido. En la práctica, lo habitual es rectificar la factura emitiendo una factura rectificativa. Si la omisión provoca que Hacienda detecte una diferencia en el modelo 111 del cliente, puede iniciarse un procedimiento de comprobación que genere recargos e intereses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La retención reduce lo que cobra el autónomo o es un gasto adicional para el cliente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La retención es un pago a cuenta del IRPF del autónomo que adelanta el cliente en su nombre. El autónomo cobra el importe neto (base imponible + IVA − retención), y el cliente ingresa el porcentaje retenido directamente a Hacienda. No es un gasto extra para el cliente: el coste total de la factura sigue siendo el mismo, solo cambia quién paga qué parte a Hacienda.',
      },
    },
  ],
};
