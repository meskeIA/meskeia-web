import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de la Curva de Phillips: Inflación y Desempleo | meskeIA',
  description: 'Visualiza el trade-off inflación-desempleo con la curva de Phillips aumentada con expectativas. Ajusta desempleo, inflación esperada y shocks de oferta. Modela estanflación, recesión y equilibrio.',
  keywords: 'curva de Phillips, inflación, desempleo, NAIRU, estanflación, expectativas adaptativas, política monetaria, macroeconomía, Bachillerato, economía, Friedman, Phelps',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-curva-phillips/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de la Curva de Phillips | meskeIA',
    description: 'El trade-off inflación-desempleo en directo. Modela la estanflación de los 70, la Gran Moderación y la inflación post-COVID.',
    url: 'https://meskeia.com/simulador-curva-phillips/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de la Curva de Phillips | meskeIA',
    description: 'Inflación vs desempleo en tiempo real. NAIRU, expectativas de Friedman, shocks de oferta OPEP.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de la Curva de Phillips',
  description: 'Simulador interactivo de la Curva de Phillips aumentada con expectativas (modelo Friedman-Phelps). Permite ajustar la tasa de desempleo, la inflación esperada y el shock de oferta para visualizar el trade-off inflación-desempleo en tiempo real. Muestra la curva de corto plazo, la curva de largo plazo (NAIRU) y clasifica la economía en cuadrantes: recesión, estanflación, sobrecalentamiento o equilibrio ideal. Incluye 4 episodios históricos de referencia: estanflación OPEP 1973, España 2013, EEUU post-COVID 2022 y Eurozona 2019.',
  url: 'https://meskeia.com/simulador-curva-phillips/',
  category: 'EducationalApplication',
  features: [
    'Curva de Phillips a corto y largo plazo (NAIRU) en tiempo real',
    'Sliders de desempleo, inflación esperada y shock de oferta',
    'Clasificación automática del cuadrante económico (recesión, estanflación, equilibrio)',
    'Desplazamiento de la curva por expectativas y shocks de oferta',
    '4 episodios históricos de referencia con coordenadas reales',
    'Zonas sombreadas de estanflación y equilibrio ideal',
    'Toggle corto plazo / largo plazo',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['curva de Phillips', 'inflación', 'desempleo', 'NAIRU', 'estanflación', 'macroeconomía', 'Bachillerato'],
});
