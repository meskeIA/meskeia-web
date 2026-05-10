import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Conservación de la Energía Mecánica | meskeIA',
  description: 'Visualiza el intercambio entre energía cinética y potencial en una pista interactiva. 4 perfiles, fricción ajustable, animación en tiempo real con barras de energía.',
  keywords: 'conservación de la energía, energía cinética, energía potencial, energía mecánica, principio de conservación, fricción, gravedad, física, EBAU, Bachillerato, simulador',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-conservacion-energia/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Conservación de la Energía | meskeIA',
    description: 'Suelta una pelota en distintas pistas y observa cómo se intercambian la energía cinética y potencial. Activa la fricción para ver disipación.',
    url: 'https://meskeia.com/simulador-conservacion-energia/',
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
    title: 'Simulador de Conservación de la Energía | meskeIA',
    description: 'Visualiza E_c + E_p = constante en una montaña rusa interactiva. Compara con y sin fricción.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Conservación de la Energía Mecánica',
  description: 'Simulador interactivo de la conservación de la energía mecánica. Selecciona entre 4 perfiles de pista (rampa, valle, montaña rusa, looping suave), ajusta masa, altura inicial, gravedad y coeficiente de fricción, y observa la animación en tiempo real con barras de energía cinética y potencial. Si la fricción es cero, la suma E_c + E_p permanece constante (conservación); si es positiva, la energía mecánica disminuye y se transforma en calor. Ideal para EBAU de Física, Bachillerato y primero de Universidad.',
  url: 'https://meskeia.com/simulador-conservacion-energia/',
  category: 'EducationalApplication',
  features: [
    '4 perfiles de pista (rampa, valle parabólico, montaña rusa, looping suave)',
    'Animación en tiempo real con integración numérica (Verlet)',
    'Barras de energía cinética y potencial cambiando dinámicamente',
    'Controles de masa, altura inicial, gravedad y fricción',
    'Visualización de v, h, E_c, E_p y E_total en cualquier instante',
    'Comparación con la energía total inicial (línea de referencia)',
    'Botones de play/pausa/reset y velocidad de simulación',
    'Funciona 100% en el navegador, gratuito y en español',
  ],
  keywords: ['conservación de la energía', 'energía mecánica', 'cinética', 'potencial', 'fricción', 'EBAU', 'Bachillerato', 'física'],
});
