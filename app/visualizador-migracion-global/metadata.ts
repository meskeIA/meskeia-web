import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Flujos Migratorios Globales: Mapa Interactivo 2024 | meskeIA',
  description: 'Visualiza los principales flujos migratorios del mundo en 2024. Refugiados, migrantes económicos, rutas y factores que impulsan la migración global. Datos UNHCR e IOM.',
  keywords: ['migración global', 'refugiados', 'UNHCR', 'flujos migratorios', 'mapa migración', 'migrantes', 'desplazados', 'asilo'],
  openGraph: {
    title: 'Flujos Migratorios Globales: Mapa Interactivo 2024',
    description: '117 millones de personas desplazadas forzosamente en el mundo. Visualiza las principales rutas migratorias globales.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Flujos Migratorios Globales: Mapa 2024",
  description: "Visualiza los principales flujos migratorios del mundo en 2024. Refugiados, migrantes económicos, rutas y factores que impulsan la migración global. Datos UNHCR e IOM.",
  url: "https://meskeia.com/visualizador-migracion-global/",
  category: 'EducationalApplication',
  features: [],
});
