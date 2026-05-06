import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Máquinas Simples - Palanca, Polea, Plano Inclinado y más | meskeIA',
  description: 'Descubre las 6 máquinas simples con simulaciones interactivas: palanca, polea, plano inclinado, rueda y eje, cuña y tornillo. Ventaja mecánica visualizada.',
  keywords: 'máquinas simples, palanca, polea, plano inclinado, rueda y eje, cuña, tornillo, ventaja mecánica, Arquímedes, física, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Máquinas Simples - Palanca, Polea, Plano Inclinado y más',
    description: 'Cómo levantar 100 kg con solo 10 kg de fuerza: las 6 máquinas simples explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-maquinas-simples',
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
    title: 'Máquinas Simples - Explicador Visual',
    description: 'De Arquímedes a las grúas modernas: ventaja mecánica con simulaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Máquinas Simples meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Máquinas Simples - Palanca, Polea, Plano Inclinado y más',
  description: 'Explicador visual interactivo sobre las 6 máquinas simples: palanca, polea, plano inclinado, rueda y eje, cuña y tornillo. Ventaja mecánica con sliders, ejemplos cotidianos y datos históricos.',
  url: 'https://meskeia.com/visualizador-maquinas-simples/',
  category: 'EducationalApplication',
  features: [
    'Las 6 máquinas simples con SVG y descripción detallada',
    'Simulación interactiva de ventaja mecánica para palanca y plano inclinado',
    'Ejemplos cotidianos: tijeras, grúa, rampa, volante, hacha, sacacorchos',
    'Historia: Arquímedes, pirámides de Egipto, Leonardo da Vinci',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
