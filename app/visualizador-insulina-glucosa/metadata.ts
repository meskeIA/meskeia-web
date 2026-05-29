import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Insulina y Glucosa - Cómo Regula tu Cuerpo el Azúcar | meskeIA',
  description: 'Entiende cómo funciona la insulina: curva de glucosa tras las comidas, mecanismo de acción celular, diferencia entre resistencia insulínica y diabetes tipo 1 vs tipo 2. Solo educativo.',
  keywords: ['insulina glucosa', 'como funciona insulina', 'glucosa sangre', 'resistencia insulinica', 'diabetes tipo 2 mecanismo', 'indice glucemico', 'pico glucemia', 'pancreas insulina', 'metabolismo glucosa'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Insulina y Glucosa | meskeIA',
    description: 'Cómo regula el cuerpo el azúcar en sangre: insulina, glucosa y metabolismo.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-insulina-glucosa/',
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
    title: 'Insulina y Glucosa | meskeIA',
    description: 'Cómo regula el cuerpo el azúcar en sangre: insulina, glucosa y metabolismo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Insulina y Glucosa meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Insulina y Glucosa - Cómo Regula tu Cuerpo el Azúcar",
  description: "Entiende cómo funciona la insulina: curva de glucosa tras las comidas, mecanismo de acción celular, diferencia entre resistencia insulínica y diabetes tipo 1 vs tipo 2. Solo educativo.",
  url: "https://meskeia.com/visualizador-insulina-glucosa/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona la insulina para regular el azúcar en sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La insulina es una hormona producida por las células beta del páncreas que actúa como una "llave" para permitir la entrada de glucosa a las células musculares, hepáticas y adiposas. Cuando la glucosa sube tras una comida, el páncreas libera insulina; esta se une a receptores celulares y activa transportadores (GLUT4) que introducen glucosa en la célula para obtener energía o almacenarla como glucógeno. Sin insulina funcional, la glucosa se acumula en sangre y no puede ser aprovechada por los tejidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre diabetes tipo 1 y tipo 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la diabetes tipo 1, el sistema inmunitario destruye las células beta del páncreas, que dejan de producir insulina; el tratamiento requiere insulina exógena de por vida. En la diabetes tipo 2, el páncreas produce insulina pero las células desarrollan resistencia a ella (resistencia insulínica), lo que obliga al páncreas a producir cada vez más hasta agotarse. La tipo 2 está fuertemente vinculada a factores de estilo de vida y suele desarrollarse en adultos, aunque su incidencia en jóvenes está aumentando.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la resistencia a la insulina y cómo se desarrolla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La resistencia insulínica es una condición en la que las células no responden adecuadamente a la insulina, por lo que el páncreas compensa produciendo más. Se desarrolla gradualmente por una combinación de factores: exceso de tejido adiposo visceral (grasa abdominal), sedentarismo, dieta con alta carga glucémica y predisposición genética. Con el tiempo, si no se corrige, puede derivar en prediabetes y diabetes tipo 2. La actividad física y la pérdida de peso visceral son las intervenciones más eficaces documentadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el pico de glucosa y por qué importa el índice glucémico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pico de glucosa es el aumento brusco de azúcar en sangre que ocurre tras ingerir carbohidratos de rápida absorción. El índice glucémico (IG) mide la velocidad con la que un alimento eleva la glucosa: los alimentos con IG alto (pan blanco, azúcar) provocan picos más intensos; los de IG bajo (legumbres, avena) lo hacen más suave y prolongado. Picos frecuentes y altos se asocian con mayor demanda de insulina y, a largo plazo, con mayor riesgo de resistencia insulínica, independientemente del diagnóstico de diabetes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil entender el mecanismo de la insulina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entender cómo funciona la insulina es relevante para personas con diabetes o prediabetes que quieran comprender su tratamiento, para quienes tienen familiares con diabetes tipo 2 y buscan información preventiva, para estudiantes de biología, nutrición o medicina, y para cualquier persona interesada en cómo los alimentos afectan a su metabolismo. También ayuda a interpretar con criterio información nutricional y a distinguir entre recomendaciones con base fisiológica y mitos populares sobre el azúcar.',
      },
    },
  ],
};
