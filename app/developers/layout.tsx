import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Desarrolladores — Integra meskeIA en tu IA | meskeIA',
  description: '160+ calculadoras fiscales, financieras y de salud disponibles mediante el protocolo MCP. Integra meskeIA en Claude Desktop, Cursor, Windsurf y cualquier agente IA compatible. Gratuito, sin registro.',
  keywords: 'meskeIA MCP, servidor MCP español, calculadoras MCP, integrar IA calculadoras, protocolo MCP fiscal, Claude Desktop herramientas',
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Desarrolladores — Integra meskeIA en tu IA',
    description: '160+ calculadoras fiscales, financieras y de salud vía protocolo MCP. Gratuito, sin registro, sin API key.',
    url: 'https://meskeia.com/developers/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Servidor MCP de meskeIA — 160+ calculadoras para tu IA',
    description: 'Integra calculadoras fiscales, financieras y de salud en tu IA mediante el protocolo MCP.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Servidor MCP de meskeIA — Calculadoras para Integradores',
  description: '160+ calculadoras fiscales, financieras y de salud disponibles mediante el protocolo MCP para desarrolladores e integradores de IA.',
  url: 'https://meskeia.com/developers/',
  category: 'UtilityApplication',
  features: [
    '160+ herramientas disponibles mediante protocolo MCP estándar',
    'Compatible con Claude Desktop, Cursor, Windsurf y clientes MCP',
    'Gratuito, sin registro ni API key',
    'Avisos legales incluidos en cada respuesta',
    'Cálculos fiscales, financieros, laborales y de salud en español',
  ],
});

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
