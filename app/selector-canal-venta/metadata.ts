import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Canal de Venta | ¿Marketplace, Tienda Propia o Redes Sociales? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué canal de venta se adapta mejor a tu negocio: marketplace generalista, plataforma sectorial, tienda online propia, venta por redes sociales o venta directa local.',
  keywords: [
    'qué canal de venta elegir',
    'marketplace o tienda propia',
    'vender en redes sociales',
    'plataforma sectorial venta',
    'tienda online o marketplace',
    'venta directa o digital',
    'canal distribución online España',
    'cómo vender por internet',
    'estrategia venta online pequeño negocio',
    'marketplace sectorial España',
  ],
  openGraph: {
    title: 'Selector de Canal de Venta — ¿Marketplace, Tienda Propia o Redes Sociales?',
    description:
      'Descubre qué canal de venta se adapta mejor a tu negocio en 10 preguntas.',
    url: 'https://meskeia.com/selector-canal-venta/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Canal de Venta",
  description: "Test de 10 preguntas para saber qué canal de venta se adapta mejor a tu negocio: marketplace generalista, plataforma sectorial, tienda online propia, venta por redes sociales o venta directa local.",
  url: "https://meskeia.com/selector-canal-venta/",
  category: 'BusinessApplication',
  features: [],
});
