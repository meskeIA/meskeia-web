import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FAQ_FRECUENCIA } from './faq';

export const metadata: Metadata = {
  title: 'Test de Tolerancia al Riesgo Detallado | meskeIA',
  description: 'Evaluación profunda de tu perfil inversor en 5 dimensiones: horizonte temporal, capacidad financiera, reacción emocional, experiencia y objetivos. 20 preguntas, 5 perfiles con asignación de activos recomendada.',
  keywords: [
    'test tolerancia al riesgo inversor',
    'perfil de riesgo inversión',
    'cuestionario inversor',
    'horizonte temporal inversión',
    'perfil conservador moderado agresivo',
    'asignación activos cartera',
    'renta fija renta variable',
    'psicología del inversor',
    'test finanzas personales',
    'finanzas conductuales',
  ],
  openGraph: {
    title: 'Test de Tolerancia al Riesgo Detallado | meskeIA',
    description: '20 preguntas en 5 dimensiones para conocer tu perfil inversor real: capacidad financiera, reacción emocional, experiencia y objetivos.',
    url: 'https://meskeia.com/test-tolerancia-riesgo-detallado/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/test-tolerancia-riesgo-detallado/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Test de Tolerancia al Riesgo Detallado",
  description: "Evaluación profunda de tu perfil inversor en 5 dimensiones: horizonte temporal, capacidad financiera, reacción emocional, experiencia y objetivos. 20 preguntas, 5 perfiles con asignación de activos re",
  url: "https://meskeia.com/test-tolerancia-riesgo-detallado/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la tolerancia al riesgo en inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tolerancia al riesgo es la capacidad y disposición de un inversor para asumir pérdidas temporales en su cartera a cambio de obtener rentabilidades potencialmente mayores. Se compone de dos factores: la capacidad financiera real de asumir pérdidas sin comprometer tus objetivos vitales, y la reacción emocional ante caídas del mercado. Conocerla es clave para elegir entre renta fija, renta variable o carteras mixtas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos perfiles de inversor existen y cuáles son?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los perfiles inversores más habituales son cinco: conservador (prioriza preservar capital, mayoría en renta fija), moderado-conservador (pequeña exposición a renta variable), moderado (equilibrio 40-60% entre renta fija y variable), moderado-agresivo (mayor peso en renta variable) y agresivo (cartera casi íntegramente en renta variable, acepta volatilidad alta a cambio de mayor rentabilidad a largo plazo).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un test de perfil inversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un test de perfil inversor ayuda a determinar qué distribución de activos se adapta mejor a tu situación antes de invertir. Evalúa tu horizonte temporal (cuándo necesitarás el dinero), tu situación financiera, tu experiencia previa y tu reacción psicológica ante pérdidas. Evita decisiones impulsivas como vender en pánico durante caídas del mercado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia este test de otros cuestionarios de perfil inversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Bajado a lo que la app hace (hallazgo 5208): el perfil sale de la suma de las 20
        // respuestas, la pantalla no avisa de contradicciones y la cifra de los bancos no tenía fuente
        text: 'Este test hace 20 preguntas agrupadas en cinco bloques (horizonte temporal, capacidad financiera, reacción emocional, experiencia inversora y objetivos). El perfil sale de la puntuación total, y además enseña el desglose por bloque, para que veas en cuál puntúas más bajo: por ejemplo, si toleras el riesgo emocionalmente pero tu capacidad financiera es baja.',
      },
    },
    {
      '@type': 'Question',
      name: FAQ_FRECUENCIA.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: FAQ_FRECUENCIA.respuesta,
      },
    },
  ],
};
