import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Química Orgánica: Grupos Funcionales y Reacciones Interactivas | meskeIA',
  description: 'Explora grupos funcionales, reacciones básicas, aromaticidad e isomería con visualizaciones SVG interactivas. Alcanos, alcoholes, cetonas, ácidos, aminas y ésteres.',
  keywords: 'química orgánica, grupos funcionales, reacciones orgánicas, aromaticidad, isomería, benceno, alcoholes, ácidos carboxílicos, ésteres, aminas, SN2, esterificación, IUPAC',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-quimica-organica/' },
  openGraph: {
    type: 'website',
    title: 'Química Orgánica: Grupos Funcionales y Reacciones',
    description: 'Visualizador interactivo de química orgánica: grupos funcionales con SVG, reacciones básicas (SN2, esterificación, oxidación), aromaticidad e isomería.',
    url: 'https://meskeia.com/visualizador-quimica-organica/',
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
    title: 'Química Orgánica - Grupos Funcionales y Reacciones | meskeIA',
    description: 'Explora grupos funcionales, benceno, SN2, esterificación, isomería cis/trans y óptica con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Química Orgánica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Química Orgánica: Grupos Funcionales y Reacciones Interactivas',
  description: 'Visualizador interactivo de química orgánica: 8 grupos funcionales con SVG y propiedades, 4 reacciones básicas (adición electrófila, SN2, esterificación, oxidación), aromaticidad con regla de Hückel y benceno resonante, isomería estructural/geométrica/óptica con ilustraciones.',
  url: 'https://meskeia.com/visualizador-quimica-organica/',
  category: 'EducationalApplication',
  features: [
    '8 grupos funcionales con fórmulas, ejemplos y representaciones SVG',
    'Panel de propiedades: polaridad, punto de ebullición relativo, aplicaciones reales',
    '4 reacciones orgánicas fundamentales con ecuaciones y mecanismos',
    'Sección de aromaticidad: benceno, regla de Hückel, SEA',
    'Isomería estructural, geométrica (cis/trans) y óptica ilustrada',
    'Visualizaciones SVG de moléculas simplificadas',
    'Ejemplos cotidianos: jabón, aspirina, nylon, vinagre',
    'Gratuito y disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un grupo funcional en química orgánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un grupo funcional es un átomo o conjunto de átomos dentro de una molécula orgánica que determina su reactividad química y muchas de sus propiedades físicas. Por ejemplo, el grupo hidroxilo (–OH) define a los alcoholes, el grupo carbonilo (C=O) a las cetonas y aldehídos, y el grupo carboxilo (–COOH) a los ácidos carboxílicos. Identificar el grupo funcional permite predecir qué reacciones sufrirá la molécula y con qué otras sustancias reaccionará.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona una reacción de esterificación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La esterificación es la reacción entre un ácido carboxílico y un alcohol para formar un éster y agua: R-COOH + R\'-OH → R-COO-R\' + H₂O. Se cataliza con ácido (H₂SO₄ concentrado) y es reversible. Los ésteres tienen aromas fructales característicos —el acetato de etilo huele a acetona, el acetato de isoamilo a plátano— y son la base de perfumes, aromatizantes y disolventes industriales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace especial al benceno y por qué se dice que es aromático?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El benceno (C₆H₆) tiene seis electrones π deslocalizados en un anillo de seis carbonos, lo que le confiere una estabilidad extra llamada aromaticidad. Según la regla de Hückel, una molécula cíclica y plana es aromática si tiene 4n+2 electrones π (n entero), siendo el benceno el caso más sencillo con 6 electrones (n=1). Esta estabilidad hace que el benceno prefiera reacciones de sustitución electrófila aromática (SEA) en lugar de adición, preservando el anillo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre isómeros geométricos y ópticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los isómeros geométricos (cis/trans) aparecen en dobles enlaces o anillos donde hay impedimento a la rotación: en el 2-buteno cis los dos metilos están en el mismo lado del doble enlace y en el trans en lados opuestos. Los isómeros ópticos (enantiómeros) tienen la misma conectividad pero son imágenes especulares no superponibles, normalmente por un carbono quiral con cuatro sustituyentes diferentes. Los enantiómeros tienen propiedades físicas idénticas pero rotan la luz polarizada en direcciones opuestas y pueden tener actividades biológicas muy distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es útil este visualizador de química orgánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado principalmente para estudiantes de Bachillerato (2.º curso, asignatura Química) y primeros cursos universitarios de Química, Farmacia, Biología o Ingeniería Química. También resulta útil para cualquier persona que quiera entender cómo funcionan sustancias cotidianas como el vinagre (ácido acético), el jabón (ésteres y jabones), la aspirina (ácido acetilsalicílico) o el nylon (poliamida). Todo funciona en el navegador sin necesidad de instalación.',
      },
    },
  ],
};
