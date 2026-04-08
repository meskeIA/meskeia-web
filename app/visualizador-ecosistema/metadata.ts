import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ecosistemas - El Flujo de Energía que Sostiene la Vida | meskeIA',
  description: 'Entiende los ecosistemas: pirámide trófica, regla del 10%, ciclos del carbono y nitrógeno, redes tróficas y datos fascinantes sobre la naturaleza. Explicador visual interactivo.',
  keywords: 'ecosistema, pirámide trófica, cadena trófica, regla del 10 por ciento, ciclo carbono, ciclo nitrógeno, flujo energía, red trófica, productores, consumidores, descomponedores, ecología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ecosistemas - El Flujo de Energía que Sostiene la Vida',
    description: 'Pirámide trófica, regla del 10%, ciclos biogeoquímicos y datos fascinantes sobre ecología explicados visualmente.',
    url: 'https://meskeia.com/visualizador-ecosistema',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecosistemas - Explicador Visual Interactivo',
    description: 'Pirámide trófica, flujo de energía, ciclos biogeoquímicos y redes tróficas explicados de forma visual.',
  },
  other: { 'application-name': 'Ecosistemas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Ecosistemas - El Flujo de Energía que Sostiene la Vida',
  description: 'Explicador visual interactivo sobre ecosistemas: pirámide trófica con 4 niveles, regla del 10% del flujo de energía, ciclos biogeoquímicos del carbono y nitrógeno, redes tróficas y datos fascinantes sobre ecología y naturaleza.',
  url: 'https://meskeia.com/visualizador-ecosistema/',
  category: 'EducationalApplication',
  features: [
    'Pirámide trófica interactiva con 4 niveles y descomponedores',
    'Regla del 10%: flujo de energía entre niveles tróficos',
    'Ciclos biogeoquímicos del carbono y nitrógeno con diagramas circulares',
    'Datos fascinantes sobre ecología y naturaleza',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
