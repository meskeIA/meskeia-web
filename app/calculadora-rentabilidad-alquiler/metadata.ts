import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Rentabilidad de Alquiler - ROI Inversión Inmobiliaria | meskeIA',
  description: 'Calcula la rentabilidad bruta y neta de una inversión inmobiliaria en alquiler. ROI, cash flow mensual, payback y análisis completo de gastos: IBI, comunidad, seguro, reparaciones.',
  keywords: 'rentabilidad alquiler, roi inmobiliario, inversion inmobiliaria, comprar para alquilar, yield alquiler, cash flow alquiler, rentabilidad piso, inversion vivienda, roi vivienda, retorno inversion inmueble',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Rentabilidad Alquiler - meskeIA',
    description: 'Calcula el ROI real de tu inversión inmobiliaria: bruto, neto y cash flow mensual',
    url: 'https://meskeia.com/calculadora-rentabilidad-alquiler/',
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
    title: 'Calculadora Rentabilidad Alquiler - meskeIA',
    description: '¿Es rentable comprar un piso para alquilar? Calcula el ROI real',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Rentabilidad de Inversión en Alquiler",
  description: "Calcula la rentabilidad bruta y neta de una inversión inmobiliaria en alquiler. ROI, cash flow mensual, payback y análisis completo de gastos: IBI, comunidad, seguro, reparaciones.",
  url: "https://meskeia.com/calculadora-rentabilidad-alquiler/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre rentabilidad bruta y rentabilidad neta en alquiler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La rentabilidad bruta se calcula dividiendo los ingresos anuales de alquiler entre el precio de compra, sin descontar ningún gasto. La rentabilidad neta descuenta todos los gastos asociados al inmueble: IBI, comunidad de propietarios, seguro del hogar, reparaciones y vacíos. La diferencia puede ser de 2 a 4 puntos porcentuales, por lo que la rentabilidad neta es el indicador que realmente importa al inversor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es una buena rentabilidad para un piso en alquiler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En términos generales, una rentabilidad neta superior al 4-5% anual se considera aceptable en mercados urbanos de países hispanohablantes, aunque este umbral varía mucho según la ciudad y el tipo de inmueble. Ciudades con precios de compra muy elevados suelen ofrecer rentabilidades netas del 3-4%, mientras que zonas con menor demanda pueden superar el 7%. Lo importante es comparar con alternativas de inversión de riesgo similar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el cash flow mensual en una inversión inmobiliaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cash flow mensual es el dinero real que queda en el bolsillo del propietario cada mes, tras descontar todos los gastos del inmueble (IBI prorrateado, comunidad, seguro, reparaciones estimadas) de los ingresos de alquiler. Si el piso está financiado con hipoteca, también se resta la cuota mensual. Un cash flow positivo significa que el alquiler cubre todos los costes y genera beneficio mensual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos debo incluir al calcular la rentabilidad real de un alquiler?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los gastos más habituales que reducen la rentabilidad bruta son: IBI (impuesto municipal sobre bienes inmuebles), cuota de comunidad de propietarios, seguro del hogar, mantenimiento y reparaciones (se suele estimar entre el 0,5% y el 1% del valor del inmueble al año), posibles períodos sin inquilino (vacancy) y, si aplica, la cuota hipotecaria. No incluirlos todos lleva a sobrestimar el rendimiento real de la inversión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el payback en una inversión inmobiliaria y cómo se calcula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El payback o período de recuperación es el número de años necesarios para recuperar la inversión inicial únicamente con los ingresos netos del alquiler. Se calcula dividiendo el precio total de compra (incluidos impuestos y gastos de escritura) entre el beneficio neto anual. Un payback de 20 años equivale a una rentabilidad neta del 5%. Este indicador no tiene en cuenta la posible revalorización del inmueble ni la inflación.',
      },
    },
  ],
};
