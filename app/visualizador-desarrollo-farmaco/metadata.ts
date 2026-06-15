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
    url: 'https://meskeia.com/visualizador-desarrollo-farmaco/',
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
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en desarrollarse un medicamento nuevo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso completo de desarrollo de un fármaco dura entre 10 y 15 años de media. La fase preclínica (laboratorio y animales) ocupa unos 3-6 años; los ensayos clínicos en humanos (Fases I, II y III) suman otros 6-8 años; y la revisión regulatoria por la EMA o la FDA puede tardar 1-2 años adicionales. Solo 1 de cada 10.000 compuestos candidatos llega finalmente al mercado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencian las fases I, II y III de un ensayo clínico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Fase I evalúa la seguridad y dosis tolerables en 20-100 voluntarios sanos. La Fase II prueba la eficacia inicial y efectos secundarios en 100-300 pacientes con la enfermedad. La Fase III confirma la eficacia en grandes grupos (1.000-5.000 pacientes) comparando con placebo o tratamiento estándar. Solo si las tres fases son satisfactorias se solicita la autorización de comercialización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los medicamentos nuevos son tan caros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de desarrollar un nuevo fármaco se estima entre 1.000 y 2.500 millones de euros, incluyendo el coste de los muchos candidatos que fracasan en el camino. La empresa recupera esa inversión durante el período de patente (20 años desde el registro, de los cuales unos 10-12 ya se han consumido en el desarrollo). Cuando la patente expira, los medicamentos genéricos ofrecen la misma molécula a un precio mucho menor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace la EMA y en qué se diferencia de la FDA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La EMA (Agencia Europea de Medicamentos) evalúa y autoriza fármacos para los 27 países de la UE, además del Espacio Económico Europeo. La FDA (Food and Drug Administration) hace lo mismo para Estados Unidos. Un medicamento necesita la aprobación de cada organismo para comercializarse en su territorio, aunque ambas agencias colaboran cada vez más para acelerar el proceso en enfermedades graves.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la farmacovigilancia y por qué es necesaria tras la aprobación de un fármaco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La farmacovigilancia (Fase IV) es el seguimiento continuo de la seguridad de un medicamento una vez que está en el mercado y lo usan millones de personas. Los ensayos clínicos previos tienen tamaños limitados y duraciones cortas, por lo que efectos adversos raros o a largo plazo solo se detectan con el uso real. Si aparecen señales de riesgo graves, las agencias pueden retirar el medicamento o añadir advertencias en su ficha técnica.',
      },
    },
  ],
};
