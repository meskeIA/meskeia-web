import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Visa Nómada Digital 2025 — ¿Cumples los Requisitos? | meskeIA',
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
  features: [],
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
        text: 'La Visa de Teletrabajo de Carácter Internacional, conocida como visa nómada digital, fue creada por la Ley de Startups 28/2022 y permite a ciudadanos extracomunitarios residir legalmente en España mientras trabajan a distancia para empresas o clientes situados fuera del país. Pueden solicitarla tanto empleados por cuenta ajena (cuya empresa debe estar establecida fuera de España) como freelancers o autónomos con clientes mayoritariamente extranjeros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el ingreso mínimo para obtener la visa nómada digital en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El requisito económico mínimo es acreditar ingresos de al menos el 200 % del Salario Mínimo Interprofesional (SMI) vigente en España. En 2026, con un SMI de 1.221 € mensuales, el umbral se sitúa en aproximadamente 2.442 € netos al mes. Por cada miembro de la unidad familiar se añade un 75 % adicional del SMI. Este importe debe acreditarse con documentación oficial como contratos, nóminas o declaraciones fiscales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en resolverse la solicitud de visa nómada digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según la Ley de Startups, la resolución debe producirse en un plazo máximo de 20 días hábiles desde la presentación completa de la solicitud. Si transcurrido ese plazo no hay respuesta, se considera silencio administrativo positivo (aprobación por silencio). La visa inicial tiene una validez de un año y puede renovarse por periodos de dos años mientras se mantengan los requisitos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja fiscal tiene la visa nómada digital respecto a la residencia fiscal ordinaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los titulares de la visa nómada digital pueden acogerse al régimen especial del artículo 93 de la Ley del IRPF (conocido popularmente como "Ley Beckham"), que permite tributar como no residente durante los primeros 5 años a un tipo fijo del 24 % sobre los rendimientos del trabajo hasta 600.000 €, en lugar de hacerlo con los tramos progresivos del IRPF ordinario (que pueden alcanzar el 47 %). Este régimen es optativo y debe solicitarse expresamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia la visa nómada digital de un permiso de residencia ordinario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia principal es el origen de los ingresos: la visa nómada digital exige que el trabajo se realice exclusivamente para empresas o clientes fuera de España (se permite hasta un 20 % del total de clientes nacionales). El permiso de residencia ordinario no tiene esa restricción de origen de ingresos. Además, la visa nómada digital tiene un proceso de tramitación más ágil y accede a ventajas fiscales específicas no disponibles en la residencia ordinaria.',
      },
    },
  ],
};
