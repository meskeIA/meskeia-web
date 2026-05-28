import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Presupuestos Freelance - Genera Presupuestos Profesionales | meskeIA',
  description: 'Crea presupuestos profesionales para clientes: servicios, horas, materiales, descuentos. Exporta a PDF. Completa el flujo freelance: presupuesto → trabajo → factura. 100% gratis.',
  keywords: 'presupuesto freelance, generador presupuestos, cotización servicios, presupuesto autónomo, calculadora presupuesto, precio proyecto, tarifa freelance, propuesta comercial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Presupuestos Freelance | meskeIA',
    description: 'Crea presupuestos profesionales para tus clientes. Servicios, horas, materiales y descuentos. Exporta a PDF.',
    url: 'https://meskeia.com/calculadora-presupuestos/',
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
    title: 'Calculadora de Presupuestos Freelance | meskeIA',
    description: 'Crea presupuestos profesionales para tus clientes. Servicios, horas, materiales y descuentos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Presupuestos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Presupuestos",
  description: "Crea presupuestos profesionales para clientes: servicios, horas, materiales, descuentos. Exporta a PDF. Completa el flujo freelance: presupuesto → trabajo → factura. 100% gratis.",
  url: "https://meskeia.com/calculadora-presupuestos/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué debe incluir un presupuesto profesional para un cliente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un presupuesto profesional debe incluir los datos del prestador y del cliente, una descripción detallada de cada servicio o partida con su precio unitario, el número de unidades u horas, los descuentos aplicables, los impuestos (IVA) y el total final. También es recomendable indicar la fecha de emisión, el plazo de validez de la oferta (habitualmente 30 días) y las condiciones de pago acordadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo mi tarifa por hora como profesional independiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para calcular una tarifa por hora sostenible, parte de los ingresos anuales que necesitas cubrir tus gastos y beneficio. Divide esa cifra entre las horas facturables reales (no todas las horas trabajadas se cobran al cliente; lo habitual es entre el 50 y el 70 % del tiempo). Añade un margen para vacaciones, impuestos, cotizaciones a la Seguridad Social y gastos de negocio. El resultado es tu tarifa mínima antes de IVA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un presupuesto y una factura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El presupuesto es una propuesta económica previa que no tiene valor fiscal; informa al cliente del coste estimado antes de iniciar el trabajo y puede modificarse por acuerdo entre las partes. La factura, en cambio, se emite una vez entregado el servicio o bien, tiene carácter legal y fiscal obligatorio, y es el documento que registra la deuda y permite la deducción del IVA. El flujo habitual es: presupuesto aceptado → trabajo realizado → factura emitida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo exportar el presupuesto en PDF para enviarlo al cliente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la calculadora permite descargar el presupuesto en formato PDF directamente desde el navegador, sin necesidad de registro ni software adicional. El PDF incluye todos los conceptos, importes, impuestos y datos de contacto que hayas introducido, con un aspecto profesional listo para enviar por correo electrónico o imprimir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Debo aplicar IVA en los presupuestos para clientes particulares y para empresas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general sí, el IVA se aplica tanto a particulares como a empresas en operaciones dentro de España. La diferencia es que las empresas pueden después deducirse ese IVA soportado en sus declaraciones trimestrales, mientras que los particulares no. Existen actividades exentas de IVA (servicios médicos, educación reglada, algunas operaciones financieras), pero la mayoría de servicios freelance tributan al tipo general del 21 %.',
      },
    },
  ],
};
