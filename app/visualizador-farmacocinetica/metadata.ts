import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Farmacocinética | ADME — Cómo Viaja un Fármaco | meskeIA',
  description: 'Aprende cómo viaja un fármaco por el cuerpo: absorción (biodisponibilidad, primer paso), distribución (Vd), metabolismo (CYP450, vida media) y excreción. Curva concentración-tiempo explicada.',
  keywords: ['farmacocinetica', 'ADME', 'absorcion farmaco', 'distribucion farmaco', 'metabolismo CYP450', 'vida media farmaco', 'biodisponibilidad', 'excrecion renal'],
  openGraph: {
    title: 'Visualizador de Farmacocinética | meskeIA',
    description: 'Cómo viaja un fármaco: ADME, curva concentración-tiempo, vida media y CYP450 explicados de forma visual.',
    url: 'https://meskeia.com/visualizador-farmacocinetica/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Farmacocinética - Cómo Viaja un Fármaco por el Cuerpo",
  description: "Aprende cómo viaja un fármaco por el cuerpo: absorción (biodisponibilidad, primer paso), distribución (Vd), metabolismo (CYP450, vida media) y excreción. Curva concentración-tiempo explicada.",
  url: "https://meskeia.com/visualizador-farmacocinetica/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué significa ADME en farmacocinética?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ADME son las siglas de Absorción, Distribución, Metabolismo y Excreción, las cuatro etapas que recorre un fármaco desde que entra al organismo hasta que es eliminado. La absorción determina cuánto del fármaco llega a la sangre (biodisponibilidad); la distribución, cómo se reparte por los tejidos; el metabolismo, cómo se transforma principalmente en el hígado; y la excreción, cómo se elimina, principalmente por el riñón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la biodisponibilidad de un fármaco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La biodisponibilidad es el porcentaje de la dosis administrada que llega inalterada a la circulación sistémica. Un fármaco intravenoso tiene biodisponibilidad del 100% porque va directo a la sangre. Los fármacos orales suelen tener biodisponibilidad menor debido al efecto de primer paso hepático, donde el hígado metaboliza parte del fármaco antes de que llegue a la circulación general.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la vida media de un fármaco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La vida media (t½) es el tiempo que tarda la concentración plasmática de un fármaco en reducirse a la mitad. Determina con qué frecuencia hay que tomar la medicación: un fármaco con vida media de 24 horas se puede tomar una vez al día. Después de aproximadamente 4-5 vidas medias, un fármaco se considera prácticamente eliminado del organismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las enzimas CYP450 y cómo afectan a los medicamentos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las enzimas del citocromo P450 (CYP450) son las principales responsables del metabolismo hepático de fármacos. Existen varias isoformas (CYP3A4, CYP2D6, CYP2C9, entre otras) que procesan más del 70% de los medicamentos. Algunos fármacos o alimentos (como el zumo de pomelo) inhiben o inducen estas enzimas, lo que puede elevar o reducir las concentraciones de otros medicamentos y generar interacciones clínicamente relevantes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el volumen de distribución de un fármaco?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El volumen de distribución (Vd) es un valor teórico que indica cuánto se distribuye un fármaco fuera del plasma hacia los tejidos. Un Vd alto (por ejemplo, >500 L) significa que el fármaco se acumula mucho en tejidos y es difícil de eliminar con diálisis. Un Vd bajo (parecido al volumen plasmático, ~3-5 L) indica que el fármaco permanece principalmente en la sangre. Este parámetro es clave para calcular la dosis de carga.',
      },
    },
  ],
};
