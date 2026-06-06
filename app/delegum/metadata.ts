import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Delegum — Asesoría digital fiscal, laboral y financiera para IA | meskeIA',
  description:
    'Delegum es un servidor MCP que convierte tu asistente de IA en una gestoría: autónomos, nóminas, herencias, jubilación, despidos e hipotecas con normativa española 2025.',
  keywords:
    'delegum, MCP fiscal, asesoría IA, autónomo, IRPF, herencia, jubilación, despido, hipoteca, gestoría digital, Model Context Protocol',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Delegum — Tu asesoría fiscal, laboral y financiera para asistentes de IA',
    description:
      'Conecta Delegum a Claude, ChatGPT o Mistral y resuelve consultas reales de fiscalidad, laboral y finanzas con cálculos normativos de España (2025).',
    url: 'https://delegum.com/',
    siteName: 'Delegum',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delegum — Asesoría digital para IA',
    description:
      'Servidor MCP de asesoría fiscal, laboral y financiera para España. Sin registro, sin coste.',
  },
  other: {
    'application-name': 'Delegum',
  },
  alternates: {
    canonical: 'https://delegum.com/',
  },
  // Favicon/app-icon propios de Delegum, solo en esta ruta (no afectan al resto de meskeia.com)
  icons: {
    icon: [
      { url: '/delegum/favicon.svg', type: 'image/svg+xml' },
      { url: '/delegum/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/delegum/app-icon-180.png',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Delegum',
  description:
    'Servidor MCP (Model Context Protocol) que actúa como asesoría digital fiscal, laboral y financiera para España. Orquesta varios cálculos en consultas de escenario (autónomo, nómina, vivienda, herencia, jubilación, despido) y devuelve análisis integrados con normativa 2025.',
  url: 'https://delegum.com/',
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
      name: '¿Qué es Delegum?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Delegum es un servidor MCP (Model Context Protocol) que convierte un asistente de IA como Claude, ChatGPT o Mistral en una asesoría digital fiscal, laboral y financiera para España. En lugar de devolver un dato suelto, orquesta varios cálculos a la vez y entrega un análisis integrado, como haría una gestoría.',
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
