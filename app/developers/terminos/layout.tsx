import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos de Uso del Servidor MCP | Desarrolladores | meskeIA',
  description: 'Condiciones de uso del servidor MCP de meskeIA para desarrolladores e integradores. 160+ calculadoras disponibles mediante el protocolo Model Context Protocol.',
  keywords: 'meskeIA MCP, términos de uso API, servidor MCP desarrolladores, calculadoras MCP, protocolo MCP español',
  authors: [{ name: 'meskeIA' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Términos de Uso del Servidor MCP | meskeIA',
    description: 'Condiciones de uso del servidor MCP de meskeIA para desarrolladores e integradores.',
    url: 'https://meskeia.com/developers/terminos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
