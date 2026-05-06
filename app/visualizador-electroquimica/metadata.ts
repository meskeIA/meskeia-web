import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Electroquímica: Pilas, Electrólisis y Baterías | meskeIA',
  description: 'Visualizador interactivo de electroquímica: pila galvánica de Daniell, serie electroquímica, electrólisis del agua y baterías Li-ion. Reacciones redox animadas.',
  keywords: 'electroquímica, pila galvánica, daniell, electrólisis, batería litio, reacciones redox, oxidación reducción, serie electroquímica, potencial estándar, FEM',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Electroquímica: Pilas, Electrólisis y Baterías',
    description: 'Cómo la química genera electricidad y viceversa — pilas galvánicas, electrólisis y baterías Li-ion con animaciones interactivas.',
    url: 'https://meskeia.com/visualizador-electroquimica',
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
    title: 'Electroquímica - Explicador Visual',
    description: 'Pilas, electrólisis y baterías: la química que mueve el mundo moderno, con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Electroquímica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Electroquímica: Pilas, Electrólisis y Baterías',
  description: 'Visualizador interactivo de electroquímica: pila galvánica de Daniell animada, serie electroquímica con calculadora de FEM, electrólisis del agua y mecanismo de baterías Li-ion.',
  url: 'https://meskeia.com/visualizador-electroquimica/',
  category: 'EducationalApplication',
  features: [
    'Pila galvánica de Daniell con animación de electrones e iones',
    'Serie electroquímica con 12 pares redox y calculadora de FEM',
    'Electrólisis del agua: burbujas animadas y relación 2:1 H₂/O₂',
    'Mecanismo de batería Li-ion con toggle carga/descarga',
    'Comparativa de tecnologías de baterías',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
