import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Estequiometría: Reactivo Limitante | meskeIA',
  description: 'Calcula el reactivo limitante, la masa del producto y el reactivo en exceso para 6 reacciones reales. Visualiza las barras de moles y el efecto del rendimiento. Ideal para Bachillerato y EBAU.',
  keywords: 'estequiometría, reactivo limitante, moles, masa molar, rendimiento, ecuación balanceada, EBAU, Bachillerato, química, cálculo estequiométrico, exceso, producto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-estequiometria/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Estequiometría: Reactivo Limitante | meskeIA',
    description: 'Introduce gramos de cada reactivo y descubre cuál es el limitante, cuánto producto se forma y cuánto exceso sobra.',
    url: 'https://meskeia.com/simulador-estequiometria/',
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
    title: 'Simulador de Estequiometría: Reactivo Limitante | meskeIA',
    description: 'El reactivo limitante, visualizado: barras de moles, masa del producto y exceso al instante.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Estequiometría: Reactivo Limitante',
  description: 'Simulador interactivo de estequiometría que calcula el reactivo limitante, la masa teórica y real del producto principal, y los gramos de reactivo en exceso para 6 reacciones reales: combustión del metano, síntesis del agua, neutralización ácido-base, proceso Haber-Bosch, oxidación del hierro y fermentación alcohólica. Incluye barras de moles comparativas y slider de rendimiento. Pensado para estudiantes de Bachillerato, EBAU y primero de Universidad.',
  url: 'https://meskeia.com/simulador-estequiometria/',
  category: 'EducationalApplication',
  features: [
    '6 reacciones reales predefinidas con contexto industrial o cotidiano',
    'Cálculo automático del reactivo limitante por razón estequiométrica',
    'Barras de moles visuales (disponibles vs necesarios) para cada reactivo',
    'Masa teórica y real del producto principal con slider de rendimiento',
    'Gramos sobrantes del reactivo en exceso',
    'Ecuación balanceada con reactivo limitante resaltado en rojo',
    'Soporte para catalizadores (fermentación alcohólica)',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['estequiometría', 'reactivo limitante', 'moles', 'masa molar', 'rendimiento', 'EBAU', 'Bachillerato', 'química'],
});
