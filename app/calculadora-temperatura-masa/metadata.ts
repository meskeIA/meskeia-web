import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora DDT — Temperatura del Agua para Pan | meskeIA',
  description: 'Calcula la temperatura exacta del agua para alcanzar la DDT (Desired Dough Temperature) en tu masa de pan. Ajuste por tipo de amasadora y preferment.',
  keywords: 'DDT, desired dough temperature, temperatura masa pan, temperatura agua pan, amasadora, panadería, fermentación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora DDT — Temperatura del Agua para Pan',
    description: 'Calcula la temperatura del agua ideal para que tu masa llegue a la temperatura perfecta de fermentación.',
    url: 'https://meskeia.com/calculadora-temperatura-masa',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora DDT — Temperatura del Agua para Pan',
    description: 'Calcula la temperatura del agua ideal para que tu masa llegue a la temperatura perfecta de fermentación.',
  },
  other: {
    'application-name': 'Calculadora DDT meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora DDT — Temperatura del Agua para Pan (Desired Dough Temperature)',
  description: 'Calcula la temperatura exacta del agua que necesitas para que tu masa de pan llegue a la DDT ideal. Ajusta por tipo de amasadora, temperatura ambiente, harina y preferment.',
  url: 'https://meskeia.com/calculadora-temperatura-masa/',
  features: [
    'Cálculo de temperatura del agua para alcanzar la DDT objetivo',
    'Ajuste por tipo de amasadora: manual, KitchenAid, espiral, Thermomix',
    'Soporte para fórmula con preferment (poolish, levain)',
    'Resultado en °C y °F',
    'Indicador visual de temperatura fría, tibia o caliente',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
