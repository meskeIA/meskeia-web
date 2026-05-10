import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tendencias de la Tabla Periódica: Heatmap Interactivo | meskeIA',
  description: 'Explora las tendencias periódicas con un heatmap visual: radio atómico, electronegatividad, energía de ionización, afinidad electrónica y punto de fusión para los 118 elementos. Ideal para Bachillerato y EBAU.',
  keywords: 'tabla periódica, electronegatividad, radio atómico, energía de ionización, afinidad electrónica, punto de fusión, tendencias periódicas, Bachillerato, EBAU, química, heatmap, elementos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-tabla-periodica-tendencias/',
  },
  openGraph: {
    type: 'website',
    title: 'Tendencias de la Tabla Periódica: Heatmap Interactivo | meskeIA',
    description: 'Visualiza con colores las tendencias periódicas de los 118 elementos: radio atómico, electronegatividad, energía de ionización, afinidad electrónica y punto de fusión.',
    url: 'https://meskeia.com/simulador-tabla-periodica-tendencias/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA - Tendencias de la Tabla Periódica',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tendencias de la Tabla Periódica: Heatmap Interactivo | meskeIA',
    description: 'Selecciona una propiedad y observa cómo varía el color en los 118 elementos según sus tendencias periódicas.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tendencias de la Tabla Periódica: Heatmap Interactivo',
  description: 'Simulador visual que muestra las tendencias periódicas mediante un mapa de calor (heatmap) sobre los 118 elementos de la tabla periódica. Selecciona entre 5 propiedades: radio atómico (pm), electronegatividad Pauling, primera energía de ionización (kJ/mol), afinidad electrónica (kJ/mol) y punto de fusión (°C). Cada celda se colorea automáticamente de azul frío a rojo caliente según el valor de la propiedad. Incluye flechas de tendencia, leyenda de color, tooltip detallado por elemento y sección educativa con explicaciones de carga nuclear efectiva, apantallamiento y excepciones notables. Ideal para Bachillerato, EBAU y primer año de Universidad.',
  url: 'https://meskeia.com/simulador-tabla-periodica-tendencias/',
  category: 'EducationalApplication',
  features: [
    'Heatmap interactivo de los 118 elementos con 5 propiedades seleccionables',
    'Coloreado automático azul→amarillo→rojo según valor de la propiedad',
    'Flechas de tendencia que muestran la dirección de aumento en grupo y período',
    'Leyenda de color con valores mínimo y máximo de la propiedad',
    'Tooltip flotante al hacer hover con nombre, Z, categoría y valor exacto',
    'Lantánidos y actínidos en filas separadas con posición marcada en tabla principal',
    'Sección educativa v2.0 con FAQ, escenarios reales y errores frecuentes',
    'Compatible con modo oscuro, gratuito y 100% en el navegador',
  ],
  keywords: ['tabla periódica', 'electronegatividad', 'radio atómico', 'energía de ionización', 'afinidad electrónica', 'tendencias periódicas', 'EBAU', 'Bachillerato', 'química'],
});
