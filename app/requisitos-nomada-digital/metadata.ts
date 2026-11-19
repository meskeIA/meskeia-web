import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import {
  NOMADA_DIGITAL_META,
  SMI_MENSUAL_NOMADA,
  MINIMO_INGRESOS_TITULAR_NOMADA,
  MAX_CLIENTES_ESPANA_PORCENTAJE,
} from '@/data/fiscal';
import { FAQ_PLAZO, FAQ_FISCAL } from './faq';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = NOMADA_DIGITAL_META.vigencia;

const euros = (n: number): string => n.toLocaleString('es-ES');

export const metadata: Metadata = {
  title: `Orientador Visa Nómada Digital ${anio} — ¿Cumples los Requisitos? | meskeIA`,
  description:
    'Comprueba en 2 minutos si cumples los requisitos para la Visa Nómada Digital española (Ley de Startups 28/2022). Perfil empleado o freelancer, ingresos mínimos y documentación necesaria.',
  keywords:
    'visa nómada digital, teletrabajo España, ley startups 28/2022, residencia teletrabajo internacional, requisitos nómada digital, SMI nómada digital, documentos visa teletrabajo, freelancer españa visa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Visa Nómada Digital — ¿Cumples los Requisitos?',
    description:
      'Checklist interactivo para comprobar tu elegibilidad para la Visa Nómada Digital (Ley 28/2022). Empleados y freelancers con clientes extranjeros.',
    url: 'https://meskeia.com/requisitos-nomada-digital/',
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
    title: 'Orientador Visa Nómada Digital — ¿Cumples los Requisitos?',
    description:
      'Comprueba en minutos si puedes optar a la Visa Nómada Digital española. Empleado o freelancer, con ingresos mínimos y documentación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Visa Nómada Digital",
  description: "Comprueba en 2 minutos si cumples los requisitos para la Visa Nómada Digital española (Ley de Startups 28/2022). Perfil empleado o freelancer, ingresos mínimos y documentación necesaria.",
  url: "https://meskeia.com/requisitos-nomada-digital/",
  category: 'FinanceApplication',
  // Lo que hace la app, comprobado en la reparación del 19/11/2026 (hallazgo 5178)
  features: [
    'Orientador de elegibilidad con dos perfiles: empleado por cuenta ajena y freelancer',
    'Checklist de 9 requisitos legales por perfil (Ley 14/2013), con respuesta Sí/No y explicación de cada uno',
    'Ingreso mínimo mensual calculado como 200 % del SMI, con incremento por cada familiar dependiente',
    'Veredicto: cumples o no cumples, con aviso si la cifra de ingresos no se puede leer',
    'Documentación necesaria, común y específica de cada perfil',
    'Guía: visado frente a autorización de residencia, plazos y pasos de la solicitud',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la Visa Nómada Digital española y quién puede solicitarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La Visa de Teletrabajo de Carácter Internacional, conocida como visa nómada digital, la creó la Ley de Startups 28/2022 dentro de la Ley 14/2013 y permite a ciudadanos extracomunitarios residir legalmente en España mientras trabajan a distancia. Pueden solicitarla empleados por cuenta ajena de empresas radicadas fuera de España y profesionales por cuenta propia cuyo trabajo para empresas de España no pase del ${MAX_CLIENTES_ESPANA_PORCENTAJE} % de su actividad (art. 74 bis).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el ingreso mínimo para obtener la visa nómada digital en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Cifras desde data/fiscal: escritas a mano se quedarían con el SMI viejo (hallazgo 5177)
        text: `El requisito económico mínimo es acreditar ingresos de al menos el 200 % del Salario Mínimo Interprofesional (SMI) vigente en España. En ${anio}, con un SMI de ${euros(SMI_MENSUAL_NOMADA)} € mensuales, el umbral se sitúa en ${euros(MINIMO_INGRESOS_TITULAR_NOMADA)} € al mes. Por cada miembro de la unidad familiar se añade un 75 % adicional del SMI. Este importe debe acreditarse con documentación oficial como contratos, nóminas o declaraciones fiscales.`,
      },
    },
    {
      '@type': 'Question',
      name: FAQ_PLAZO.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: FAQ_PLAZO.respuesta,
      },
    },
    {
      '@type': 'Question',
      name: FAQ_FISCAL.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: FAQ_FISCAL.respuesta,
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia la visa nómada digital de un permiso de residencia ordinario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La diferencia principal es el origen del trabajo: quien trabaja por cuenta ajena solo puede hacerlo para empresas radicadas fuera de España, y el profesional por cuenta propia puede trabajar para empresas de España hasta el ${MAX_CLIENTES_ESPANA_PORCENTAJE} % de su actividad (Ley 14/2013, art. 74 bis). El permiso de residencia ordinario no tiene esa restricción. Además, la visa nómada digital tiene plazos de resolución cortos (10 días hábiles el visado y veinte días la autorización).`,
      },
    },
  ],
};
