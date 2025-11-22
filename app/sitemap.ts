import { MetadataRoute } from 'next';
import { applicationsDatabase } from '@/data/applications';
import { guidesByCategory } from '@/data/guides';

// Configuración para static export
export const dynamic = 'force-static';

// Mapeo de categorías para URLs (sin tildes)
const CATEGORY_NAME_TO_URL: { [key: string]: string } = {
  'Calculadoras y Utilidades': 'calculadoras-y-utilidades',
  'Campus Digital': 'campus-digital',
  'Creatividad y Diseño': 'creatividad-y-diseno',
  'Emprendimiento y Negocios': 'emprendimiento-y-negocios',
  'Finanzas y Fiscalidad': 'finanzas-y-fiscalidad',
  'Física y Química': 'fisica-y-quimica',
  'Herramientas de Productividad': 'herramientas-de-productividad',
  'Herramientas Web y Tecnología': 'herramientas-web-y-tecnologia',
  'Juegos y Entretenimiento': 'juegos-y-entretenimiento',
  'Matemáticas y Estadística': 'matematicas-y-estadistica',
  'Salud & Bienestar': 'salud-y-bienestar',
  'Texto y Documentos': 'texto-y-documentos',
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://meskeia.com';

  // Páginas principales
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/herramientas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guias`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/acerca`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Generar entradas para todas las guías
  const guidePages: MetadataRoute.Sitemap = [];

  Object.entries(guidesByCategory).forEach(([categoryName, guides]) => {
    const categorySlug = CATEGORY_NAME_TO_URL[categoryName];

    if (!categorySlug) {
      console.warn(`No se encontró slug para categoría: ${categoryName}`);
      return;
    }

    guides.forEach((guide) => {
      guidePages.push({
        url: `${baseUrl}/guias/${categorySlug}/${guide.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    });
  });

  // 🆕 Generar entradas para todas las aplicaciones (automático)
  const appPages: MetadataRoute.Sitemap = applicationsDatabase.map((app) => ({
    url: `${baseUrl}${app.url}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Combinar todas las páginas: principales + guías + aplicaciones
  return [...mainPages, ...guidePages, ...appPages];
}
