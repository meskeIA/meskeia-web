import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Colisiones — Elásticas e Inelásticas en 1D | meskeIA',
  description:
    'Simula colisiones elásticas e inelásticas en 1D: ajusta masas, velocidades y coeficiente de restitución. Visualiza la conservación del momento lineal y la variación de energía cinética. Para Bachillerato y selectividad.',
  keywords:
    'simulador colisiones, colisión elástica inelástica, momento lineal, coeficiente de restitución, conservación momento, energía cinética colisión, física bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Colisiones — Elásticas e Inelásticas',
    description:
      'Ajusta masas, velocidades y coeficiente de restitución. Ve la animación de la colisión y comprueba la conservación del momento lineal y la variación de energía cinética.',
    url: 'https://meskeia.com/simulador-colisiones',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Colisiones | meskeIA',
    description: 'Colisiones elásticas e inelásticas con animación interactiva. Momento lineal y energía cinética.',
  },
  other: {
    'application-name': 'Simulador Colisiones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Colisiones',
  description:
    'Simulador interactivo de colisiones en 1D: elásticas, inelásticas y perfectamente inelásticas. Ajusta masas (1–20 kg), velocidades iniciales y coeficiente de restitución (0–1). Animación del choque y cálculo de velocidades finales, momento lineal y energía cinética antes y después.',
  url: 'https://meskeia.com/simulador-colisiones/',
  features: [
    'Colisiones elásticas (e=1), inelásticas (0<e<1) y perfectamente inelásticas (e=0)',
    'Sliders de masa (1–20 kg) y velocidad (−10 a +10 m/s) para cada objeto',
    'Coeficiente de restitución ajustable con clasificación automática del tipo de colisión',
    'Animación SVG del choque con fases pre-colisión, impacto y post-colisión',
    'Cálculo de momento lineal total y energía cinética antes y después',
    'Ideal para Bachillerato Física y preparación de selectividad',
    'Gratuito, sin registro, en español',
  ],
});
