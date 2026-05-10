import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Alquiler por Habitaciones — Zona Tensionada 2026 | meskeIA',
  description: 'Oriéntate sobre las reglas del alquiler por habitaciones en España 2026. Calcula el techo de renta en zona tensionada: la suma de habitaciones no puede superar el alquiler del piso completo.',
  keywords: 'alquiler habitaciones zona tensionada, alquiler por habitaciones España 2026, ley vivienda habitaciones, tope renta habitaciones, SERPAVI, alquiler compartido regulación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Alquiler por Habitaciones en Zona Tensionada',
    description: 'Reglas del alquiler por habitaciones en zona tensionada: techo de renta, SERPAVI, sanciones y municipios declarados.',
    url: 'https://meskeia.com/orientador-alquiler-habitaciones/',
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
    title: 'Orientador Alquiler por Habitaciones — España 2026',
    description: 'Reglas, topes y sanciones del alquiler por habitaciones en zona tensionada.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Alquiler Habitaciones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Alquiler por Habitaciones',
  description: 'Herramienta de orientación sobre la regulación del alquiler por habitaciones en zonas de mercado residencial tensionado en España (2026). Calcula el techo de renta por habitación, informa sobre la normativa vigente (Ley 12/2023, Proposición de Ley 2025, RDL 8/2026), municipios declarados y sanciones.',
  url: 'https://meskeia.com/orientador-alquiler-habitaciones/',
  features: [
    'Orientación sobre el techo de renta por habitación en zona tensionada',
    'Información sobre +300 municipios declarados zona tensionada',
    'Normativa actualizada: Ley 12/2023 + Prop. Ley habitaciones + RDL 8/2026',
    'Régimen sancionador estatal y autonómico (Cataluña)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
