import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Visualizador de Estructuras Narrativas — 6 modelos para tu historia | meskeIA',
  description: 'Explora 6 estructuras narrativas: Pirámide de Freytag, 3 Actos, Viaje del Héroe, Kishōtenketsu, Save the Cat y 5 Actos. Diagramas de tensión, etapas detalladas y ejemplos literarios.',
  keywords: ['estructura narrativa', 'pirámide de freytag', 'tres actos', 'viaje del héroe', 'kishotenketsu', 'save the cat', 'arco narrativo', 'escritura creativa', 'modelo narrativo', 'monomito campbell'],
  openGraph: {
    title: 'Visualizador de Estructuras Narrativas | meskeIA',
    description: '6 modelos estructurales con diagramas de tensión y ejemplos: Freytag, 3 Actos, Héroe, Kishōtenketsu, Save the Cat, 5 Actos.',
    url: 'https://meskeia.com/visualizador-estructuras-narrativas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Estructuras Narrativas — 6 modelos para tu historia',
  description: 'Explora y compara 6 modelos de estructura narrativa con diagramas visuales de tensión, etapas detalladas y análisis de obras literarias y cinematográficas.',
  url: 'https://meskeia.com/visualizador-estructuras-narrativas/',
  category: 'EducationalApplication',
  features: [
    'Pirámide de Freytag con 5 etapas y diagrama de tensión',
    'Estructura en 3 Actos con puntos de giro y beats clave',
    'Viaje del Héroe (Campbell) con 10 etapas del monomito',
    'Kishōtenketsu: estructura asiática de 4 partes sin conflicto central',
    'Save the Cat: 11 beats del sistema de Blake Snyder',
    'Estructura en 5 Actos del drama clásico shakespeariano',
    'Diagrama visual del arco de tensión para cada modelo',
    'Ejemplos de obras literarias y cinematográficas en cada estructura',
  ],
});
