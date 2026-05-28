import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Asistente Constitución Sociedad (SL, SLU, SA) - Checklist y Costes | meskeIA',
  description: 'Guía paso a paso para constituir una Sociedad Limitada, Sociedad Limitada Unipersonal o Sociedad Anónima en España. Checklist de 20 trámites, estimación de costes y formulario de datos sociales.',
  keywords: 'constituir sociedad limitada, crear SL, alta sociedad limitada, costes constitucion sl, registrar empresa, asistente sl españa, crear sociedad anonima',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente Constitución Sociedad - meskeIA',
    description: 'Checklist de trámites, costes estimados y formulario de datos para constituir una SL, SLU o SA en España.',
    url: 'https://meskeia.com/asistente-constitucion-sociedad/',
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
    title: 'Asistente Constitución Sociedad | meskeIA',
    description: 'Guía completa para crear una SL, SLU o SA: trámites, costes y documentación necesaria.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Asistente Constitución Sociedad",
  description: "Guía paso a paso para constituir una Sociedad Limitada, Sociedad Limitada Unipersonal o Sociedad Anónima en España. Checklist de 20 trámites, estimación de costes y formulario de datos sociales.",
  url: "https://meskeia.com/asistente-constitucion-sociedad/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta constituir una Sociedad Limitada en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste orientativo de constituir una SL en 2025 oscila entre 400 € y 1.000 € en función del método. Por el procedimiento telemático rápido del CIRCE (Centro de Información y Red de Creación de Empresas) los costes notariales son reducidos (unos 60-120 €) y el registro mercantil puede rondar los 40-60 €. El método tradicional con escritura notarial completa añade honorarios notariales y registrales que pueden superar los 600-800 €. A eso se suman gastos de asesoría si se contratan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el capital mínimo para crear una Sociedad Limitada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde la reforma de la Ley de Startups (Ley 28/2022) la SL puede constituirse con tan solo 1 € de capital social mínimo, siempre que se destine el 20% de los beneficios a una reserva legal hasta alcanzar el capital mínimo tradicional de 3.000 €. Este régimen especial facilita la creación de empresas a emprendedores con poco capital inicial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en constituirse una Sociedad Limitada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con el procedimiento telemático (PAE/CIRCE) el plazo puede ser de 6 a 10 días hábiles desde que se firman todos los documentos. Con el procedimiento notarial tradicional el proceso suele durar entre 15 y 30 días hábiles, dependiendo de los plazos del Registro Mercantil provincial. La denominación social debe reservarse previamente en el Registro Mercantil Central, lo que puede tardar 1-3 días hábiles adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una SL, una SLU y una SA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La SL (Sociedad Limitada) tiene uno o varios socios y capital mínimo desde 1 €; es la forma más habitual para pymes y autónomos que se asocian. La SLU (Sociedad Limitada Unipersonal) es una SL con un único socio, que puede ser persona física o jurídica. La SA (Sociedad Anónima) requiere un capital mínimo de 60.000 € y permite transmitir acciones libremente; se usa en empresas cotizadas o con muchos inversores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué trámites hay que hacer para constituir una sociedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los pasos principales son: (1) solicitar el nombre en el Registro Mercantil Central; (2) obtener el NIF provisional en la Agencia Tributaria; (3) abrir cuenta bancaria e ingresar el capital social; (4) firmar la escritura de constitución ante notario; (5) inscribir la sociedad en el Registro Mercantil; (6) obtener el NIF definitivo; (7) darse de alta en el IAE y en la Agencia Tributaria; y (8) los socios que trabajen deben darse de alta como autónomos o en el Régimen General de la Seguridad Social.',
      },
    },
  ],
};
