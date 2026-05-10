import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transporte en las Plantas - Agua que Sube sin Motor | meskeIA',
  description: 'Descubre cómo las plantas transportan agua y nutrientes sin corazón: xilema, floema, estomas, capilaridad y transpiración. Explicador visual interactivo.',
  keywords: 'transporte plantas, xilema, floema, estomas, capilaridad, transpiración, savia bruta, savia elaborada, biología vegetal, cohesión-tensión',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Transporte en las Plantas - Agua que Sube sin Motor',
    description: 'Cómo las plantas mueven agua y nutrientes sin bombas: xilema, floema, estomas y capilaridad explicados visualmente.',
    url: 'https://meskeia.com/visualizador-transporte-plantas/',
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
    title: 'Transporte en las Plantas - Explicador Visual',
    description: 'El agua sube 100 metros sin motor: descubre el sistema de transporte más eficiente de la naturaleza.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Transporte Plantas Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Transporte en las Plantas - Agua que Sube sin Motor',
  description: 'Explicador visual interactivo sobre el transporte en las plantas: xilema y floema, mecanismos de ascenso del agua, estomas y datos fascinantes. Diagramas animados del sistema vascular vegetal.',
  url: 'https://meskeia.com/visualizador-transporte-plantas/',
  category: 'EducationalApplication',
  features: [
    'Diagrama de xilema y floema con flujos animados',
    'Mecanismos de ascenso del agua: transpiración, capilaridad, presión radicular',
    'Estomas interactivos con toggle día/noche',
    'Datos fascinantes sobre el transporte vegetal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
