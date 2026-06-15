import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Asistentes de Código IA — Claude Code vs Copilot vs Gemini - meskeIA',
  description: 'Compara Claude Code, GitHub Copilot, Gemini Code Assist y Codex/OpenAI: precios, formas de acceso (CLI, extensión IDE, cloud), perfiles de usuario y combinaciones recomendadas con cada IDE.',
  keywords: 'Claude Code vs Copilot, comparar asistentes código IA, GitHub Copilot precio, Gemini Code Assist, Codex OpenAI programación, herramientas IA programar, asistente código gratis, Claude Code CLI, Copilot VS Code',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Asistentes de Código IA — meskeIA',
    description: 'Claude Code, Copilot, Gemini Code Assist y Codex: cuál usar, cómo acceder y qué combinar con tu IDE.',
    url: 'https://meskeia.com/comparador-asistentes-codigo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparador de Asistentes de Código IA — meskeIA',
    description: 'Claude Code vs GitHub Copilot vs Gemini Code Assist vs Codex — guía comparativa 2026.',
  },
  other: { 'application-name': 'Comparador Asistentes Código meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Comparador de Asistentes de Código IA 2026',
  description: 'Guía comparativa interactiva de los principales asistentes de programación con IA: Claude Code (Anthropic), GitHub Copilot (Microsoft), Gemini Code Assist (Google) y Codex (OpenAI). Incluye tabla de características, formas de acceso CLI/extensión/cloud, recomendaciones por perfil de usuario y combinaciones óptimas con cada IDE.',
  url: 'https://meskeia.com/comparador-asistentes-codigo/',
  category: 'UtilityApplication',
  features: [
    'Comparativa de Claude Code, GitHub Copilot, Gemini Code Assist y Codex/OpenAI',
    'Precios actualizados con enlace de verificación a webs oficiales',
    'Desglose de formas de acceso: CLI, extensión de IDE, agente cloud y chat web',
    'Recomendaciones por perfil: estudiante, desarrollador sin presupuesto, profesional y empresa',
    'Tabla de combinaciones IDE + asistente (VS Code, Cursor, Windsurf, JetBrains)',
    'Nota explicativa sobre la confusión con los distintos significados de "Codex"',
    'Indicadores de privacidad y cumplimiento RGPD por herramienta',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre Claude Code y GitHub Copilot?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Claude Code (Anthropic) es un agente agentic de desarrollo que opera desde la terminal o VS Code, diseñado para tareas complejas multi-archivo como refactoring y análisis de codebases completos. GitHub Copilot (Microsoft/GitHub) está especializado en completions inline en tiempo real mientras escribes y tiene integración nativa con repositorios de GitHub. Copilot tiene un plan gratuito, mientras que Claude Code requiere suscripción. La elección depende de si priorizas completions rápidas (Copilot) o tareas largas autónomas (Claude Code).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe algún asistente de código IA completamente gratuito?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Gemini Code Assist ofrece 6.000 completions de código al día de forma gratuita con una cuenta de Google, sin tarjeta de crédito. GitHub Copilot tiene un plan Free con 2.000 completions mensuales. Ambos incluyen también chat de código gratuito. Para uso profesional intensivo, los planes de pago empiezan desde $10/mes (Copilot Pro) o $20/mes (Claude Code Pro).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es Codex de OpenAI y por qué hay tanta confusión con ese nombre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El término "Codex" ha tenido tres significados distintos en OpenAI: (1) el modelo de código original de 2021-2023, ya retirado; (2) el agente autónomo de codificación cloud lanzado en 2025, disponible en ChatGPT Plus, que puede trabajar en repositorios de forma autónoma; y (3) Codex CLI, herramienta de terminal lanzada en 2025, similar a Claude Code CLI. Nota: GitHub Copilot, aunque usa modelos de OpenAI, es un producto independiente de Microsoft/GitHub y no se llama Codex.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la mejor opción para una empresa que necesita cumplir RGPD?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GitHub Copilot Business/Enterprise es la opción más consolidada para empresas europeas: ofrece procesamiento de datos en servidores de la UE, no usa el código de los usuarios para entrenar modelos por defecto, y tiene contratos DPA específicos para RGPD. Gemini Code Assist Enterprise también tiene opción de región EU para Google Workspace. Claude Code y Codex/OpenAI procesan datos principalmente en servidores de EE.UU., lo que requiere una evaluación legal adicional para uso empresarial con código propietario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar Claude Code con Cursor o Windsurf en lugar de VS Code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Claude Code CLI funciona en cualquier terminal, independientemente del IDE que uses. Puedes tener Cursor o Windsurf abierto como IDE con su propia IA integrada, y simultáneamente usar Claude Code desde la terminal para tareas largas o de refactoring complejo. Esta combinación es popular entre desarrolladores que quieren lo mejor de ambos mundos: el IDE con completions inline de Cursor y la capacidad agentica profunda de Claude Code para tareas estructurales.',
      },
    },
  ],
};
