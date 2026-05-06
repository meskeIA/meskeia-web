import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sistemas Circulatorios - Del Corazón de 2 al de 4 Cámaras | meskeIA',
  description: 'Evolución del sistema circulatorio en el reino animal: de organismos sin sistema hasta el doble circuito de mamíferos. Corazones de 2, 3 y 4 cámaras, sangre fría vs caliente. Explicador visual.',
  keywords: 'sistema circulatorio, evolución corazón, sangre fría, sangre caliente, ectotermia, endotermia, corazón cámaras, circulación abierta, circulación cerrada, biología animal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sistemas Circulatorios - Del Corazón de 2 al de 4 Cámaras',
    description: 'Evolución del sistema circulatorio animal: circulación abierta, cerrada, corazones y termorregulación explicados visualmente.',
    url: 'https://meskeia.com/visualizador-sistemas-circulatorios',
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
    title: 'Sistemas Circulatorios - Explicador Visual',
    description: 'Del corazón de 2 cámaras al de 4: evolución circulatoria, sangre fría vs caliente y datos fascinantes.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistemas Circulatorios meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sistemas Circulatorios - Del Corazón de 2 al de 4 Cámaras',
  description: 'Explicador visual interactivo sobre la evolución del sistema circulatorio en el reino animal: desde organismos sin sistema hasta el doble circuito de mamíferos, corazones de 2 a 4 cámaras, ectotermia vs endotermia y datos fascinantes del mundo animal.',
  url: 'https://meskeia.com/visualizador-sistemas-circulatorios/',
  category: 'EducationalApplication',
  features: [
    'Evolución de 4 tipos de sistema circulatorio con diagramas animados',
    'Comparativa de corazones de 2, 3 y 4 cámaras con flujo de sangre',
    'Sangre fría vs sangre caliente: relación con el sistema circulatorio',
    'Datos fascinantes: ballena azul, colibrí, pulpo, jirafa y más',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
