import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo se Descubre un Medicamento - Del Laboratorio a la Farmacia | meskeIA',
  description: 'Entiende el proceso completo de desarrollo de un fármaco: descubrimiento de moléculas, ensayos clínicos (fases I, II, III), aprobación regulatoria (EMA/FDA) y vigilancia post-comercialización. 10-15 años y hasta 2.500 millones de euros.',
  keywords: 'desarrollo farmaco, ensayos clinicos, fases clinicas, aprobacion medicamento, EMA, FDA, farmaceutica, medicamento, investigacion farmacologica, fase clínica, genéricos, farmacovigilancia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo se Descubre un Medicamento - Del Laboratorio a la Farmacia',
    description: 'El viaje de un fármaco: de 10.000 candidatos a 1 medicamento aprobado. Ensayos clínicos, aprobación regulatoria y por qué los medicamentos son caros.',
    url: 'https://meskeia.com/visualizador-desarrollo-farmaco',
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
    title: 'Cómo se Descubre un Medicamento - Explicador Visual',
    description: 'De 10.000 moléculas candidatas a 1 medicamento aprobado: el pipeline farmacéutico explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Desarrollo Fármaco meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo se Descubre un Medicamento - Del Laboratorio a la Farmacia',
  description: 'Explicador visual interactivo sobre el proceso de desarrollo farmacéutico: desde el descubrimiento de moléculas candidatas hasta la aprobación regulatoria, pasando por las 3 fases de ensayos clínicos. Incluye costes, tiempos y vigilancia post-comercialización.',
  url: 'https://meskeia.com/visualizador-desarrollo-farmaco/',
  category: 'EducationalApplication',
  features: [
    'Embudo de descubrimiento: de 10.000 compuestos a 1 fármaco aprobado',
    'Fases de ensayos clínicos (I, II, III) con participantes, duración y coste',
    'Línea temporal completa: 10-15 años de desarrollo',
    'Aprobación regulatoria EMA/FDA y fabricación a escala',
    'Vigilancia post-comercialización (Fase IV) y genéricos',
    'Negociación de precios en el SNS español',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
