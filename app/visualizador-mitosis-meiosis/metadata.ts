import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mitosis y Meiosis - La Danza de los Cromosomas | meskeIA',
  description: 'Descubre la mitosis y meiosis paso a paso: fases animadas, crossing-over, comparativa visual y datos fascinantes. Explicador visual interactivo de biología.',
  keywords: 'mitosis, meiosis, división celular, cromosomas, profase, metafase, anafase, telofase, crossing-over, gametos, biología visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Mitosis y Meiosis - La Danza de los Cromosomas',
    description: 'División celular explicada visualmente: fases, cromosomas y crossing-over paso a paso.',
    url: 'https://meskeia.com/visualizador-mitosis-meiosis',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mitosis y Meiosis - Explicador Visual',
    description: '3,8 millones de divisiones por segundo en tu cuerpo. ¿Sabes cómo funcionan?',
  },
  other: { 'application-name': 'Mitosis Meiosis meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Mitosis y Meiosis - La Danza de los Cromosomas',
  description: 'Explicador visual interactivo sobre división celular: mitosis (5 fases animadas), meiosis (crossing-over y reducción cromosómica), comparativa y datos fascinantes.',
  url: 'https://meskeia.com/visualizador-mitosis-meiosis/',
  category: 'EducationalApplication',
  features: [
    'Mitosis paso a paso con cromosomas animados',
    'Meiosis I y II con crossing-over visualizado',
    'Comparativa visual mitosis vs meiosis',
    'Datos: 3,8 millones de mitosis por segundo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
