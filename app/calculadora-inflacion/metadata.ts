import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Inflación - Poder Adquisitivo Histórico | meskeIA',
  description: 'Calcula cómo la inflación afecta tu dinero. Datos del IPC del INE desde 1961. Descubre cuánto valían tus euros en el pasado y cuánto necesitas hoy.',
  keywords: 'inflacion, ipc, poder adquisitivo, ine, precios, coste vida, devaluacion, calculadora inflacion, españa, historico',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Inflación - meskeIA',
    description: 'Calcula el impacto de la inflación en tu dinero con datos históricos del INE desde 1961',
    url: 'https://meskeia.com/calculadora-inflacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Inflación - meskeIA',
    description: 'Descubre cómo la inflación afecta tu poder adquisitivo con datos del INE',
  },
  other: {
    'application-name': 'Calculadora Inflación meskeIA',
  },
};
