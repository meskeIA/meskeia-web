import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Desarrolladores — Integra meskeIA en tu IA | meskeIA',
  description: 'Calculadoras del día a día en español (porcentajes, fechas, deporte, coche, foto y vídeo, cocina) mediante el protocolo MCP. Integra meskeIA en Claude Desktop, Cursor, Windsurf y cualquier agente IA compatible. Gratuito, sin registro.',
  keywords: 'meskeIA MCP, servidor MCP español, calculadoras MCP, integrar IA calculadoras, protocolo MCP en español, Claude Desktop herramientas',
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Desarrolladores — Integra meskeIA en tu IA',
    description: 'Calculadoras del día a día en español vía protocolo MCP. Gratuito, sin registro, sin API key.',
    url: 'https://meskeia.com/developers/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Servidor MCP de meskeIA — calculadoras para tu IA',
    description: 'Integra calculadoras de fechas, porcentajes, deporte, coche, foto y vídeo y cocina en tu IA mediante el protocolo MCP.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Servidor MCP de meskeIA — Calculadoras para Integradores',
  description: 'Calculadoras deterministas del día a día en español disponibles mediante el protocolo MCP para desarrolladores e integradores de IA.',
  url: 'https://meskeia.com/developers/',
  category: 'UtilityApplication',
  features: [
    'Calculadoras disponibles mediante protocolo MCP estándar',
    'Compatible con Claude Desktop, Cursor, Windsurf y clientes MCP',
    'Gratuito, sin registro ni API key',
    'Avisos legales incluidos en cada respuesta',
    'Fechas, porcentajes, deporte y salud, coche, foto y vídeo, panadería y repostería en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el protocolo MCP y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MCP (Model Context Protocol) es un estándar abierto que permite a los agentes de inteligencia artificial conectarse con servicios externos y llamar a herramientas de cálculo en tiempo real. Al integrar un servidor MCP en tu cliente de IA, el modelo puede responder preguntas complejas consultando automáticamente calculadoras especializadas sin necesidad de que el usuario cambie de aplicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué clientes de IA son compatibles con el servidor MCP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cualquier cliente que implemente el protocolo MCP estándar puede conectarse. Los más habituales son Claude Desktop (Anthropic), Cursor y Windsurf. La configuración consiste en añadir la URL del servidor al archivo de configuración del cliente; el procedimiento exacto varía según la aplicación pero normalmente requiere dos minutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipo de cálculos están disponibles a través del servidor MCP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El servidor agrupa sus herramientas en seis bloques: cálculo cotidiano (porcentajes, regla de tres, unidades, estadística, inflación), fechas (días entre fechas, plazos, edad), deporte y salud (IMC, macros, running, ciclismo, natación, gimnasio), coche y movilidad (combustible, etiqueta DGT, coche eléctrico), foto y vídeo (profundidad de campo, exposición, bitrate) y panadería y repostería (porcentaje del panadero, masa madre, escalado de recetas). Los cálculos fiscales, laborales e inmobiliarios de España están en un servidor aparte, el MCP de Delegum.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es necesario registrarse o tener una API key para usar el servidor MCP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El servidor MCP es de acceso gratuito y no requiere registro, cuenta de usuario ni API key. Solo necesitas la URL del servidor y añadirla a la configuración de tu cliente MCP compatible. Los resultados incluyen avisos legales automáticos que recuerdan el carácter orientativo de las estimaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué responsabilidades tiene el integrador al usar el servidor MCP en su aplicación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al integrar el servidor MCP en una aplicación o agente propio, el integrador asume la responsabilidad de informar adecuadamente a sus usuarios finales de que los resultados son estimaciones orientativas y no constituyen asesoramiento fiscal, financiero, jurídico ni médico. El servidor incluye avisos legales en cada respuesta, pero es responsabilidad del integrador asegurar que lleguen al usuario final.',
      },
    },
  ],
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
