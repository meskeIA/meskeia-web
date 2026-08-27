import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Bono Joven Alquiler — Comprueba tu Elegibilidad | meskeIA',
  description:
    'Simulador Bono Joven Alquiler 2026-2030 (RD 326/2026): comprueba elegibilidad y calcula tu ayuda. Hasta 300 €/mes vivienda o 200 €/mes habitación durante hasta 4 años. Plan Estatal de Vivienda 2026-2030.',
  keywords:
    'bono joven alquiler 2026, ayuda alquiler joven plan estatal vivienda 2026-2030, requisitos bono alquiler joven, 300 euros alquiler joven, elegibilidad bono alquiler, real decreto 326/2026, subsidio alquiler joven españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador Bono Joven Alquiler — Comprueba tu Elegibilidad',
    description:
      '¿Tienes entre 18 y 35 años? Comprueba si cumples los requisitos del Bono Alquiler Joven y cuánto puedes ahorrar.',
    url: 'https://meskeia.com/simulador-bono-joven-alquiler/',
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
    title: 'Simulador Bono Joven Alquiler',
    description:
      'Comprueba si tienes derecho al Bono Joven Alquiler: hasta 300 €/mes vivienda o 200 €/mes habitación. Orientador rápido y gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador Bono Joven Alquiler 2026-2030",
  description: "Simulador del Bono Joven Alquiler (Plan Estatal de Vivienda 2026-2030, RD 326/2026): comprueba si cumples los requisitos y calcula tu ayuda mensual. Hasta 300 €/mes para vivienda completa o 200 €/mes para habitación en piso compartido, durante hasta 4 años.",
  url: "https://meskeia.com/simulador-bono-joven-alquiler/",
  category: 'FinanceApplication',
  features: [
    "Comprueba elegibilidad para el Bono Joven Alquiler 2026-2030 (RD 326/2026) con checklist de requisitos",
    "Calcula la ayuda mensual efectiva: hasta 300 €/mes en vivienda completa o 200 €/mes en habitación",
    "Muestra el límite del 60% de la renta y el ahorro total acumulado en hasta 4 años",
    "Diferencia entre requisitos imprescindibles y condicionantes para la aprobación",
    "Guía del proceso de solicitud paso a paso por Comunidad Autónoma",
    "Funciona sin registro, sin enviar datos personales al servidor",
    "RegionBadge: ayuda aplicable exclusivamente en España",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Bono Joven Alquiler 2026 y cuánto dinero da?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Bono Joven Alquiler es una ayuda directa del Plan Estatal de Vivienda 2026-2030 (Real Decreto 326/2026) para jóvenes de 18 a 35 años. La cuantía máxima es de 300 €/mes para vivienda completa o 200 €/mes para habitación en piso compartido, durante hasta 4 años (2 años renovables por otros 2). El importe no puede superar el 60% de la renta mensual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos de ingresos para pedir el Bono Alquiler Joven 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Plan Estatal de Vivienda 2026-2030 establece un límite de ingresos máximos, pero cada Comunidad Autónoma concreta ese umbral en su propia convocatoria. Los requisitos exactos pueden variar según la CA. Es imprescindible consultar la convocatoria de la comunidad autónoma donde se ubica la vivienda alquilada para conocer el límite de ingresos aplicable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se solicita el Bono Joven Alquiler y dónde se tramita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La solicitud se tramita a través de la consejería o agencia de vivienda de la comunidad autónoma donde esté situada la vivienda alquilada, ya que son las CCAA las encargadas de gestionar y conceder las ayudas. Cada comunidad tiene su propio plazo y procedimiento, habitualmente telemático. Es imprescindible tener contrato de alquiler en vigor y estar empadronado en la vivienda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el Bono Joven Alquiler y otras ayudas al alquiler autonómicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Bono Joven Alquiler es una ayuda estatal cofinanciada por las comunidades autónomas, con requisitos de edad e ingresos homogéneos en toda España. Muchas comunidades tienen además sus propias ayudas complementarias al alquiler, con requisitos diferentes (límites de renta distintos, tramos de edad más amplios, cuantías adicionales). No se pueden cobrar las dos a la vez: el art. 136 del Real Decreto 326/2026 declara esta ayuda incompatible con cualquier otra destinada al pago del alquiler o de la cesión de uso de la misma vivienda o habitación. Hay que elegir la que más convenga. Distinto es la deducción autonómica del IRPF por alquiler de vivienda habitual, que no es una ayuda al pago sino un beneficio fiscal y se rige por la normativa de cada región.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Bono Joven Alquiler tributa en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el Bono Joven Alquiler está sujeto al IRPF como ganancia patrimonial no derivada de la transmisión de elementos patrimoniales. Debe declararse en la renta del ejercicio en que se cobra. No obstante, al integrarse en la base general del impuesto y dada su cuantía (máximo 3.600 € anuales con los 300 €/mes de vivienda completa, o 2.400 € con los 200 €/mes de habitación), el impacto fiscal suele ser moderado. Es recomendable verificar la tributación exacta con un asesor fiscal según el perfil concreto.',
      },
    },
  ],
};
