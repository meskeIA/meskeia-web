import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Inflación: Por Qué Suben los Precios | meskeIA',
  description: 'Las 3 causas mecánicas de la inflación (demanda, costes, monetaria), la espiral salarios-precios, los sesgos del IPC y cómo el BCE la controla. Educativo sobre macroeconomía, no calculadora.',
  keywords: ['por qué sube la inflación', 'inflación de demanda', 'inflación de costes', 'teoría cuantitativa dinero', 'espiral salarios precios', 'IPC sesgos', 'BCE tipos de interés inflación', 'hiperinflación causas'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Inflación: Por Qué Suben los Precios | meskeIA',
    description: 'La inflación tiene 3 causas distintas — y el BCE solo puede atacar una de ellas directamente.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-inflacion/',
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
    title: 'Inflación: Por Qué Suben los Precios | meskeIA',
    description: 'Las 3 causas de la inflación, la espiral salarios-precios y los sesgos del IPC explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Visualizador Inflación meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Inflación: Por Qué Suben los Precios',
  description: 'Explicador visual interactivo sobre los mecanismos de la inflación: causas (demanda, costes, monetaria), espiral salarios-precios, sesgos del IPC y política monetaria del BCE.',
  url: 'https://meskeia.com/visualizador-inflacion/',
  category: 'EducationalApplication',
  features: [
    'Las 3 causas mecánicas de la inflación con ejemplos históricos',
    'Diagrama de la espiral salarios-precios',
    'Sesgos del IPC y por qué puede no reflejar tu inflación real',
    'Tipos de inflación: deflación, moderada, hiperinflación',
    'Mecanismo de transmisión de la política monetaria del BCE',
    'Slider interactivo de tipos de interés',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
