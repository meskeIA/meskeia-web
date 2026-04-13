import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Ciclo de Vida de un Proyecto Freelance - Explicador Visual | meskeIA',
  description: 'Visualiza las 7 fases de un proyecto freelance: captacion, propuesta, negociacion, ejecucion, entrega, facturacion y cobro. Tiempos reales, tiempo no facturable y cuellos de botella.',
  keywords: 'freelance, proyecto freelance, fases proyecto, tiempo facturable, gestion proyectos, autonomo, ciclo vida, cobro freelance, propuesta freelance',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Ciclo de Vida de un Proyecto Freelance - Explicador Visual',
    description: 'Las 7 fases de un proyecto freelance explicadas visualmente: donde se pierde dinero, cuellos de botella y tiempos reales.',
    url: 'https://meskeia.com/visualizador-ciclo-vida-freelance',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciclo de Vida de un Proyecto Freelance - Explicador Visual',
    description: 'Solo el 40-60% del tiempo de un freelance es facturable. Descubre donde se pierde el resto.',
  },
  other: { 'application-name': 'Ciclo Vida Freelance meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Ciclo de Vida de un Proyecto Freelance',
  description: 'Explicador visual interactivo sobre las 7 fases de un proyecto freelance: captacion, propuesta, negociacion, ejecucion, entrega, facturacion y cobro. Incluye tiempos medios, tiempo no facturable, cuellos de botella y calculo del coste real por hora.',
  url: 'https://meskeia.com/visualizador-ciclo-vida-freelance/',
  category: 'EducationalApplication',
  features: [
    'Timeline visual de las 7 fases con duracion proporcional',
    'Codigo de colores: facturable vs no facturable',
    'Cuellos de botella y tips para cada fase',
    'Calculo del coste real por hora contando tiempo no facturable',
    'Estadisticas de morosidad en Espana (plazo medio 82 dias)',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
  ],
});
