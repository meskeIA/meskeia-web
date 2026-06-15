import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de IDEs con IA 2026 — Cursor vs Windsurf vs VS Code vs Zed - meskeIA',
  description: 'Compara los mejores IDEs con inteligencia artificial integrada: Cursor, Windsurf, VS Code, Zed y JetBrains. Precios, modelos de IA, compatibilidad y recomendaciones por lenguaje de programación.',
  keywords: 'Cursor vs Windsurf, mejores IDEs IA 2026, VS Code vs Cursor, Zed IDE, JetBrains AI, IDE inteligencia artificial, editor código IA, Cursor precio, Windsurf gratis, IDE programar con IA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de IDEs con IA 2026 — meskeIA',
    description: 'Cursor, Windsurf, VS Code, Zed y JetBrains: cuál usar según tu lenguaje, presupuesto y flujo de trabajo.',
    url: 'https://meskeia.com/comparador-ides-ia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparador de IDEs con IA 2026 — meskeIA',
    description: 'Cursor vs Windsurf vs VS Code vs Zed vs JetBrains — guía comparativa completa.',
  },
  other: { 'application-name': 'Comparador IDEs IA meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Comparador de IDEs con IA 2026',
  description: 'Guía comparativa interactiva de los principales entornos de desarrollo con inteligencia artificial integrada: Cursor, Windsurf, VS Code, Zed y JetBrains. Incluye tabla de características, análisis de la integración de IA, recomendaciones por lenguaje de programación y perfiles de usuario.',
  url: 'https://meskeia.com/comparador-ides-ia/',
  category: 'UtilityApplication',
  features: [
    'Comparativa de Cursor, Windsurf, VS Code, Zed y JetBrains IDEs',
    'Tabla de características: IA nativa, completions, agente autónomo, extensiones, open source',
    'Análisis detallado de la integración de IA en cada entorno',
    'Recomendaciones por lenguaje: JavaScript/TypeScript, Python, Java/Kotlin, Rust/Go',
    'Recomendaciones por perfil: principiante, web developer, JVM backend, open source',
    'Precios actualizados con enlaces a páginas oficiales de cada herramienta',
    'Nota sobre combinaciones IDE + asistente externo (Claude Code, Copilot, etc.)',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre Cursor y Windsurf?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cursor (Anysphere) y Windsurf (Codeium) son ambos IDEs basados en VS Code con IA nativa integrada. Cursor es el más popular y tiene una comunidad más grande; destaca por su modo Composer/Agent para ediciones multi-archivo. Windsurf es conocido por su función Flows, considerada más autónoma en tareas largas, y tiene un precio base ligeramente inferior ($15/mes vs $20/mes en sus planes Pro). Ambos son compatibles con las mismas extensiones de VS Code. La elección entre ellos depende de preferencias personales, ya que en funcionalidad son muy similares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué seguir usando VS Code si Cursor y Windsurf son mejores para IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VS Code tiene ventajas que Cursor y Windsurf no reemplazan completamente: es completamente gratuito, open source, tiene el ecosistema de extensiones más grande del mundo, y es el estándar de facto en muchos equipos. Si tu prioridad es la IA agentiva, Cursor o Windsurf ganan; si priorizas estabilidad, control y coste cero para la base del IDE, VS Code añadiendo un asistente de código sigue siendo muy competitivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace especial a Zed frente a los demás?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zed destaca en dos aspectos únicos: rendimiento y colaboración. Al estar escrito en Rust en lugar de Electron, es notablemente más rápido que VS Code, Cursor o Windsurf en proyectos grandes. Y su sistema de colaboración en tiempo real es nativo (no requiere una extensión como Live Share), permitiendo que múltiples desarrolladores editen el mismo archivo simultáneamente. Es open source (GPL-3.0) y soporta modelos de IA locales vía Ollama. Su principal limitación es que no es compatible con extensiones de VS Code y en Windows aún está en versión beta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué lenguajes es mejor JetBrains que VS Code o Cursor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JetBrains domina claramente en el ecosistema JVM: IntelliJ IDEA para Java y Kotlin es muy superior a cualquier alternativa gracias a su motor de análisis semántico profundo, refactoring inteligente, y herramientas de debugging avanzadas. También destaca PyCharm para Python científico/profesional, GoLand para Go, y Rider para .NET. Para JavaScript/TypeScript, Rust o desarrollo web general, VS Code, Cursor y Windsurf son alternativas más ligeras y económicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar Claude Code o GitHub Copilot dentro de Cursor o Windsurf?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, con matices. Cursor y Windsurf ya incluyen su propia IA nativa. Además, al ser compatibles con extensiones de VS Code, puedes instalar la extensión de Claude Code o GitHub Copilot dentro de ellos. Sin embargo, pueden surgir conflictos entre las sugerencias de la IA nativa y las de la extensión adicional. La combinación más popular es usar el IDE nativo para completions en tiempo real y Claude Code CLI en la terminal del mismo IDE para tareas largas de refactoring o análisis estructural.',
      },
    },
  ],
};
