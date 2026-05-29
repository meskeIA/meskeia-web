import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Bono Joven Alquiler — Comprueba tu Elegibilidad | meskeIA',
  description:
    'Comprueba si cumples los requisitos del Bono Joven Alquiler: 18-35 años, ingresos ≤ 3× IPREM. Calcula cuánto puedes ahorrar: hasta €250/mes durante 2 años (€6.000 total).',
  keywords:
    'bono joven alquiler, ayuda alquiler joven, requisitos bono alquiler joven, 250 euros alquiler joven, elegibilidad bono alquiler, plan vivienda jóvenes, subsidio alquiler joven españa 2026',
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
      'Comprueba si tienes derecho al Bono Alquiler Joven: €250/mes durante 2 años. Orientador rápido y gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador Bono Joven Alquiler",
  description: "Comprueba si cumples los requisitos del Bono Joven Alquiler: 18-35 años, ingresos ≤ 3× IPREM. Calcula cuánto puedes ahorrar: hasta €250/mes durante 2 años (€6.000 total).",
  url: "https://meskeia.com/simulador-bono-joven-alquiler/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Bono Joven Alquiler y cuánto dinero da?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Bono Joven Alquiler es una ayuda directa del Gobierno de España destinada a jóvenes de 18 a 35 años para cubrir parte del coste del alquiler de su vivienda habitual. La cuantía máxima es de 250 € al mes durante un máximo de 2 años, lo que supone hasta 6.000 € en total. El importe concreto no puede superar el 50% del alquiler mensual que paga el beneficiario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos de ingresos para pedir el Bono Alquiler Joven?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ingresos anuales del solicitante no pueden superar 3 veces el IPREM (Indicador Público de Renta de Efectos Múltiples), lo que equivale aproximadamente a 24.318 € brutos anuales según el IPREM vigente. En algunos casos, si se tienen hijos a cargo, discapacidad o la vivienda está en zona de mercado tensionado, el límite puede ampliarse hasta 4 o 5 veces el IPREM según la comunidad autónoma.',
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
        text: 'El Bono Joven Alquiler es una ayuda estatal cofinanciada por las comunidades autónomas, con requisitos de edad e ingresos homogéneos en toda España. Muchas comunidades tienen además sus propias ayudas complementarias al alquiler, con requisitos diferentes (límites de renta distintos, tramos de edad más amplios, cuantías adicionales). Ambas ayudas pueden ser compatibles si se cumplen los requisitos de cada programa de forma independiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Bono Joven Alquiler tributa en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el Bono Joven Alquiler está sujeto al IRPF como ganancia patrimonial no derivada de la transmisión de elementos patrimoniales. Debe declararse en la renta del ejercicio en que se cobra. No obstante, al integrarse en la base general del impuesto y dada su cuantía (máximo 3.000 € anuales), el impacto fiscal suele ser moderado. Es recomendable verificar la tributación exacta con un asesor fiscal según el perfil concreto.',
      },
    },
  ],
};
