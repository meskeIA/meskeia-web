import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Fondo de Emergencia - Cuánto Ahorrar | meskeIA',
  description: 'Calcula cuánto dinero necesitas como fondo de emergencia según tu situación laboral, gastos mensuales y cargas familiares. Colchón de seguridad financiera.',
  keywords: 'fondo emergencia, ahorro, colchon seguridad, finanzas personales, gastos mensuales, reserva, imprevistos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Fondo de Emergencia | meskeIA',
    description: 'Calcula tu fondo de emergencia ideal según tu situación personal y laboral',
    url: 'https://meskeia.com/estimador-fondo-emergencia/',
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
    title: 'Estimador Fondo de Emergencia | meskeIA',
    description: 'Calcula tu fondo de emergencia ideal según tu situación personal y laboral',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Fondo de Emergencia",
  description: "Calcula cuánto dinero necesitas como fondo de emergencia según tu situación laboral, gastos mensuales y cargas familiares. Colchón de seguridad financiera.",
  url: "https://meskeia.com/estimador-fondo-emergencia/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto dinero debo tener en mi fondo de emergencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación general es acumular entre 3 y 6 meses de gastos esenciales (alquiler o hipoteca, alimentación, suministros, transporte). Sin embargo, la cantidad adecuada depende de tu situación concreta: un trabajador por cuenta propia o con contrato temporal debería apuntar a 6-9 meses, mientras que una persona con empleo estable y doble ingreso familiar puede quedarse en 3 meses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un fondo de emergencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un fondo de emergencia es una reserva de dinero líquido destinada exclusivamente a cubrir imprevistos graves: pérdida de empleo, avería importante del coche o del hogar, gasto médico urgente o cualquier situación que interrumpa tus ingresos o genere un gasto inesperado de gran cuantía. Tenerlo evita tener que recurrir a deuda (tarjetas, préstamos personales) en los peores momentos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el fondo de emergencia ideal para mi situación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El punto de partida es calcular tus gastos mensuales imprescindibles (los que no puedes eliminar aunque quieras). A partir de ahí, multiplicas esa cifra por el número de meses recomendado según tu perfil: más meses si eres autónomo, si tienes personas a cargo, si tu sector tiene alta rotación o si no dispones de una red de apoyo familiar. Un estimador digital te hace preguntas sobre estas variables y ajusta automáticamente la recomendación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde debo guardar el fondo de emergencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Debe estar en un producto líquido y seguro: una cuenta corriente separada de la de uso diario, una cuenta de ahorro de alta liquidez o un depósito a plazo muy corto (máximo 1-3 meses). No es recomendable invertirlo en renta variable ni en fondos con posibilidad de pérdida, porque en una emergencia real necesitarás acceder al dinero de inmediato y sin asumir riesgos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo lleva construir un fondo de emergencia desde cero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de tu capacidad de ahorro mensual. Si puedes destinar el 10-15 % de tus ingresos netos al fondo, y tu objetivo son 3 meses de gastos, lo alcanzarás en entre 18 y 24 meses ahorrando de forma constante. Muchos expertos recomiendan automatizar la aportación mensual transfiriéndola justo al cobrar el sueldo, para evitar gastarla sin querer.',
      },
    },
  ],
};
