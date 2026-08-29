import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const URL_CANONICA = 'https://delegum.com/asistente-ia/';

export const metadata: Metadata = {
  title: 'Asistente IA de Delegum — Servidor MCP fiscal, laboral y financiero | meskeIA',
  description:
    'Conecta Delegum a Claude, ChatGPT o Mistral mediante MCP y resuelve consultas reales de fiscalidad, laboral y finanzas con cálculos normativos de España: autónomos, nóminas, herencias, jubilación, despidos e hipotecas.',
  keywords:
    'delegum, MCP fiscal, asistente IA fiscal, autónomo, IRPF, herencia, jubilación, despido, hipoteca, Model Context Protocol',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'Delegum',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente IA de Delegum — fiscalidad, laboral y finanzas para Claude, ChatGPT o Mistral',
    description:
      'Servidor MCP de fiscalidad, derecho laboral y finanzas para España. Sin registro, sin coste.',
    url: URL_CANONICA,
    siteName: 'Delegum',
    locale: 'es_ES',
    images: [
      {
        url: 'https://delegum.com/delegum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Delegum — el portal de fiscalidad y derecho de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asistente IA de Delegum',
    description:
      'Servidor MCP de fiscalidad, derecho laboral y finanzas para España. Sin registro, sin coste.',
    images: ['https://delegum.com/delegum/og-image.png'],
  },
  alternates: {
    canonical: URL_CANONICA,
  },
};

// Schema.org JSON-LD — WebApplication del servidor MCP
export const jsonLd = generateWebAppSchema({
  name: 'Asistente IA de Delegum',
  description:
    'Servidor MCP (Model Context Protocol) de fiscalidad, derecho laboral y finanzas para España. Orquesta varios cálculos en consultas de escenario (autónomo, nómina, vivienda, herencia, jubilación, despido) y devuelve análisis integrados con normativa 2025.',
  url: URL_CANONICA,
  category: 'FinanceApplication',
  features: [
    'Consultas de escenario que integran varios cálculos en una sola respuesta',
    'Fiscalidad española 2025: IRPF, IVA, Sucesiones, Donaciones, RETA',
    'Laboral: indemnización por despido, finiquito y prestación por desempleo',
    'Finanzas: hipoteca, pensión pública y brecha de jubilación',
    'Compatible con Claude, ChatGPT y Mistral vía Model Context Protocol',
    'Sin registro, sin coste y sin almacenamiento de datos',
  ],
});

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Asistente IA de Delegum?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es un servidor MCP (Model Context Protocol) que conecta un asistente de IA como Claude, ChatGPT o Mistral con la biblioteca de cálculo fiscal, laboral y financiero de meskeIA para España. En lugar de devolver un dato suelto, orquesta varios cálculos a la vez y entrega un análisis integrado que orienta en cuestiones fiscales, laborales y financieras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo conecto Delegum a mi asistente de IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Añade la URL https://delegum.com/api/mcp/ (con barra final) como servidor MCP en tu cliente. En Claude Desktop se hace en Configuración → Desarrollador → Servidores MCP. No requiere instalación, registro ni autenticación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué consultas puede resolver Delegum?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Resuelve seis consultas de escenario: situación de autónomo (cuota, IRPF y autónomo vs SL), nómina (bruto a neto), compra de vivienda (impuestos e hipoteca), herencia (Impuesto de Sucesiones por comunidad), jubilación (pensión y brecha) y despido (indemnización, finiquito y paro), además de catorce herramientas individuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia Delegum del servidor MCP de meskeIA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El MCP de meskeIA es una biblioteca amplia de 185 herramientas de cálculo. Delegum es un servicio enfocado y orquestador: menos herramientas pero mejor descritas y agrupadas en consultas de escenario, lo que mejora la precisión del asistente al elegir qué calcular. Ambos comparten la misma biblioteca de cálculo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los cálculos de Delegum sirven como asesoramiento profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Delegum es un asistente orientativo basado en normativa española del ejercicio 2025. Cada respuesta incluye un aviso legal y la recomendación de consultar a un asesor fiscal colegiado, un graduado social o la Agencia Tributaria antes de tomar decisiones reales.',
      },
    },
  ],
};
