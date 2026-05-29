import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Aspirina: Cómo Funciona | meskeIA',
  description:
    'Visualiza el mecanismo molecular de la aspirina: inhibición COX-1/COX-2, síntesis de prostaglandinas, 4 efectos y su base bioquímica. Historia de 120 años.',
  keywords: [
    'aspirina como funciona',
    'mecanismo aspirina',
    'COX-1 COX-2',
    'prostaglandinas aspirina',
    'aspirina antiagregante',
    'ácido acetilsalicílico',
    'aspirina farmacología',
  ],
  openGraph: {
    title: 'Aspirina: El Mecanismo del Fármaco más Universal',
    description:
      'Del sauce al laboratorio: cómo la aspirina inhibe irreversiblemente COX y bloquea prostaglandinas.',
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
  name: "Aspirina: Cómo Funciona el Fármaco más Universal",
  description: "Visualiza el mecanismo molecular de la aspirina: inhibición COX-1/COX-2, síntesis de prostaglandinas, 4 efectos y su base bioquímica. Historia de 120 años.",
  url: "https://meskeia.com/visualizador-aspirina/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo actúa la aspirina a nivel molecular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aspirina (ácido acetilsalicílico) inhibe de forma irreversible las enzimas COX-1 y COX-2 mediante acetilación covalente. Estas enzimas son necesarias para sintetizar prostaglandinas y tromboxano, mediadores del dolor, la fiebre y la inflamación. Al bloquearse su producción, se reducen estos síntomas. La inhibición es irreversible: la célula debe sintetizar nuevas enzimas para recuperar la función.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la aspirina es anticoagulante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aspirina inhibe la producción de tromboxano A2 en las plaquetas. El tromboxano A2 promueve la agregación plaquetaria (la aglutinación de plaquetas para formar un coágulo). Como las plaquetas no tienen núcleo y no pueden sintetizar nuevas enzimas COX-1, el efecto antiagregante dura toda la vida de la plaqueta, unos 7-10 días. Por eso dosis bajas de aspirina (75-100 mg/día) se usan para prevenir trombos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre COX-1 y COX-2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'COX-1 es una enzima constitutiva, presente siempre en tejidos como el estómago y los riñones, donde cumple funciones protectoras (produce moco gástrico y regula el flujo renal). COX-2 se expresa principalmente ante estímulos inflamatorios. Los AINEs selectivos de COX-2 (coxibs) intentan reducir el dolor sin dañar la mucosa gástrica, pero la aspirina inhibe ambas isoformas de forma no selectiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la aspirina hoy en día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aspirina tiene cuatro usos principales: analgésico (dolores leves-moderados), antipirético (fiebre), antiinflamatorio (dosis altas) y antiagregante plaquetario (dosis bajas para prevención cardiovascular secundaria). También existe investigación sobre su potencial papel en la reducción del riesgo de ciertos cánceres, especialmente colorrectal, aunque no está aprobada para esa indicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué no se recomienda la aspirina en niños con fiebre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En menores de 16 años con infecciones virales (gripe, varicela), la aspirina se asocia al síndrome de Reye, una enfermedad grave que afecta al hígado y al cerebro con una mortalidad de hasta el 30 %. La relación fue identificada en los años 80, lo que llevó a retirar la aspirina de la práctica pediátrica en fiebre infecciosa. El paracetamol o el ibuprofeno son las alternativas recomendadas en niños.',
      },
    },
  ],
};
