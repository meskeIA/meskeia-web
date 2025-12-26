import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tirador de Dados Online | Dados Virtuales para Rol y Juegos de Mesa | meskeIA',
  description: 'Lanza dados virtuales online: D4, D6, D8, D10, D12, D20 y D100. Perfecto para D&D, Pathfinder, juegos de mesa y rol. Historial, suma automática y múltiples dados.',
  keywords: 'tirador de dados, dados online, dados virtuales, D20, D6, dungeons and dragons, pathfinder, juegos de rol, RPG, dados para juegos de mesa, generador dados aleatorios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tirador de Dados Online - Dados Virtuales',
    description: 'Lanza dados virtuales para juegos de rol y mesa. D4, D6, D8, D10, D12, D20 y D100 con historial y suma automática.',
    url: 'https://meskeia.com/tirador-dados',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tirador de Dados Online',
    description: 'Dados virtuales para D&D, Pathfinder y juegos de mesa. Múltiples tipos de dados con historial.',
  },
  other: {
    'application-name': 'Tirador de Dados meskeIA',
  },
};
