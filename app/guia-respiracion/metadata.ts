import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Respiración Consciente - Técnicas de relajación | meskeIA',
  description: 'Aprende técnicas de respiración consciente con guía visual animada. Respiración 4-7-8, cuadrada, diafragmática y coherente. Ideal para ansiedad, autismo, EPOC y gestión del estrés.',
  keywords: 'respiración consciente, técnicas respiración, respiración 4-7-8, respiración cuadrada, respiración diafragmática, ansiedad, relajación, mindfulness, autismo, EPOC, estrés',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Respiración Consciente | meskeIA',
    description: 'Técnicas de respiración con guía visual animada. 4-7-8, cuadrada, diafragmática y coherente. Gratis y sin registro.',
    url: 'https://meskeia.com/guia-respiracion/',
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
    title: 'Guía de Respiración Consciente | meskeIA',
    description: 'Aprende a respirar mejor con guía visual animada. Reduce el estrés y la ansiedad.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Respiración Consciente',
  description: 'Aprende técnicas de respiración consciente con guía visual animada. Respiración 4-7-8, cuadrada, diafragmática y coherente. Ideal para ansiedad, autismo, EPOC y gestión del estrés.',
  url: 'https://meskeia.com/guia-respiracion/',
  category: 'EducationalApplication',
  features: [
    'Técnica de respiración 4-7-8 con guía animada',
    'Respiración cuadrada (box breathing) para concentración',
    'Respiración diafragmática para relajación profunda',
    'Respiración coherente para equilibrio del sistema nervioso',
    'Indicaciones para ansiedad, autismo y EPOC',
    'Guía visual con animación sincronizada',
    'Sin registro ni instalación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la técnica de respiración 4-7-8 y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La técnica de respiración 4-7-8 fue popularizada por el médico Andrew Weil y consiste en inhalar durante 4 segundos, retener el aire durante 7 segundos y exhalar lentamente durante 8 segundos. Este patrón activa el sistema nervioso parasimpático, que es la respuesta de relajación del cuerpo. Se utiliza para reducir la ansiedad aguda, facilitar la conciliación del sueño, controlar reacciones emocionales intensas y bajar la frecuencia cardíaca en momentos de tensión. Con práctica regular puede convertirse en una herramienta rápida para gestionar el estrés en situaciones cotidianas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la respiración torácica y la respiración diafragmática?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La respiración torácica utiliza principalmente los músculos del pecho y los intercostales, resultando en respiraciones cortas y superficiales que activan la respuesta de estrés del sistema nervioso simpático. Es la forma de respirar habitual cuando estamos bajo tensión. La respiración diafragmática, en cambio, implica el movimiento del diafragma hacia abajo al inhalar, lo que expande la cavidad abdominal y permite que los pulmones se llenen completamente. Este tipo de respiración es más eficiente en el intercambio de gases, reduce la frecuencia respiratoria, disminuye la tensión muscular del cuello y los hombros, y activa el sistema nervioso parasimpático, promoviendo un estado de calma y bienestar sostenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué técnica de respiración es más eficaz para calmar la ansiedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para la ansiedad aguda, la respiración diafragmática lenta (inhalar 4 segundos, exhalar 6-8 segundos) es una de las más eficaces porque activa directamente el nervio vago y el sistema nervioso parasimpático. La técnica 4-7-8 también es muy útil para cortar episodios de ansiedad rápidamente. Para ansiedad crónica o mantenida, la respiración coherente (aproximadamente 5-6 respiraciones por minuto) ha mostrado resultados consistentes en estudios clínicos al sincronizar los ritmos cardíacos y respiratorios. La clave es practicar estas técnicas en momentos de calma para que el cuerpo las automatice y pueda aplicarlas eficazmente cuando aparece la ansiedad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La respiración cuadrada es adecuada para personas con autismo o TDAH?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la respiración cuadrada (box breathing) es especialmente útil para personas con autismo o TDAH porque ofrece una estructura clara, predecible y visual: inhalar 4 segundos, retener 4, exhalar 4, retener 4. Esta regularidad reduce la incertidumbre sensorial y proporciona un anclaje cognitivo que ayuda a redirigir la atención durante momentos de sobreestimulación o desregulación emocional. Muchas intervenciones de regulación sensorial para autismo incluyen técnicas de respiración rítmica como complemento a otras estrategias. En el caso del TDAH, el foco en contar y en el ritmo funciona como ancla atencional. Se recomienda practicarla acompañada de una guía visual animada, como la disponible en esta app, para facilitar la adherencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los beneficios generales de practicar respiración consciente con regularidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La práctica regular de respiración consciente produce beneficios documentados en múltiples sistemas del organismo. A nivel cardiovascular, puede reducir la presión arterial y la frecuencia cardíaca en reposo. A nivel neurológico, favorece la producción de ondas cerebrales alfa asociadas a la calma y la atención focalizada. A nivel emocional, mejora la regulación del estrés y puede reducir síntomas de ansiedad y depresión leve. A nivel pulmonar, aumenta la capacidad respiratoria y es especialmente beneficiosa para personas con asma o EPOC bajo supervisión médica. También mejora la calidad del sueño y puede potenciar la concentración y el rendimiento cognitivo. Basta con 5-10 minutos diarios para comenzar a notar cambios en pocas semanas.',
      },
    },
  ],
};
