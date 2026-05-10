import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimacion de Baja Maternal y Paternal - Permiso por Nacimiento Espana | meskeIA',
  description:
    'Calcula la duracion del permiso por nacimiento en Espana: 16 semanas base, semanas obligatorias y voluntarias, ampliaciones por parto multiple, discapacidad u hospitalizacion. Timeline visual.',
  keywords:
    'baja maternidad semanas, permiso paternidad duracion, baja maternal paternal Espana, 16 semanas nacimiento, permiso nacimiento como distribuir, RDL 6/2019, permiso igualitario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimacion de Baja Maternal y Paternal | meskeIA',
    description:
      'Calcula la duracion y distribucion del permiso por nacimiento en Espana. 16 semanas igualitarias, semanas obligatorias, voluntarias y ampliaciones.',
    url: 'https://meskeia.com/estimacion-baja-maternal/',
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
    title: 'Estimacion de Baja Maternal y Paternal | meskeIA',
    description:
      'Calcula la duracion y distribucion del permiso por nacimiento en Espana. Timeline visual con semanas obligatorias, voluntarias y extras.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimacion Baja Maternal meskeIA',
  },
};

// Schema.org JSON-LD para indexacion por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Estimacion de Baja Maternal y Paternal',
  description:
    'Herramienta que calcula la duracion del permiso por nacimiento y cuidado del menor en Espana segun el RDL 6/2019. Muestra semanas obligatorias, voluntarias, ampliaciones por parto multiple, discapacidad u hospitalizacion neonatal, y genera un timeline visual personalizado.',
  url: 'https://meskeia.com/estimacion-baja-maternal/',
  features: [
    'Calculo de 16 semanas base igualitarias para ambos progenitores',
    'Ampliaciones por parto multiple, discapacidad y hospitalizacion',
    'Timeline visual con fechas clave si se indica la fecha de parto',
    'Diferencia entre semanas obligatorias y voluntarias',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
