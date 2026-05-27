import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Perfil Inversor - Descubre tu Tolerancia al Riesgo | meskeIA',
  description: 'Test gratuito de perfil de inversor. Responde 10 preguntas y descubre si eres conservador, moderado o agresivo. Recomendaciones personalizadas de inversión.',
  keywords: 'test perfil inversor, tolerancia riesgo, perfil riesgo inversión, test inversión, conservador moderado agresivo, cuestionario inversor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/test-perfil-inversor/',
  },
  openGraph: {
    type: 'website',
    title: 'Test de Perfil Inversor - Descubre tu Tolerancia al Riesgo',
    description: 'Test gratuito de perfil de inversor. Responde 10 preguntas y descubre si eres conservador, moderado o agresivo.',
    url: 'https://meskeia.com/test-perfil-inversor/',
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
    title: 'Test de Perfil Inversor - meskeIA',
    description: 'Descubre tu tolerancia al riesgo con nuestro test gratuito de 10 preguntas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de perfil inversor existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Existen tres perfiles principales: conservador (prioriza seguridad y acepta menor rentabilidad), moderado (equilibra rentabilidad y riesgo) y agresivo (acepta alta volatilidad buscando mayor rentabilidad a largo plazo). Algunos sistemas añaden subperfiles como moderado-conservador o moderado-agresivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la tolerancia al riesgo en inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tolerancia al riesgo es la capacidad de un inversor para soportar pérdidas temporales sin tomar decisiones impulsivas. Depende del horizonte temporal (cuántos años puede mantener la inversión), la situación económica (ingresos estables, deudas) y el perfil psicológico (cómo reacciona ante caídas del mercado).',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué invierte un perfil conservador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un inversor conservador suele optar por depósitos bancarios, letras del Tesoro, bonos gubernamentales y fondos de renta fija a corto plazo. Prioriza la preservación del capital frente a la rentabilidad, aceptando rendimientos menores a cambio de mayor estabilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué invierte un perfil agresivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un perfil agresivo invierte principalmente en renta variable: acciones individuales, fondos de bolsa, ETFs sectoriales y mercados emergentes. Acepta fluctuaciones elevadas —incluyendo pérdidas temporales del 30-50%— a cambio de mayor potencial de rentabilidad a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cada cuánto tiempo se debe revisar el perfil inversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se recomienda revisar el perfil inversor cada 1-2 años o ante cambios significativos en la situación personal: proximidad a la jubilación, cambio de empleo, herencia, matrimonio, divorcio o cambio en los objetivos financieros. El perfil puede evolucionar a lo largo de la vida.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Perfil Inversor',
  description: 'Test gratuito que evalúa tu tolerancia al riesgo financiero mediante 10 preguntas. Identifica si tu perfil es conservador, moderado o agresivo y orienta tu estrategia de inversión.',
  url: 'https://meskeia.com/test-perfil-inversor/',
  category: 'FinanceApplication',
  features: [
    '10 preguntas validadas para evaluar tolerancia al riesgo',
    'Resultado: perfil conservador, moderado o agresivo',
    'Recomendaciones orientativas según el perfil obtenido',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['perfil inversor', 'tolerancia riesgo', 'test inversión', 'finanzas personales'],
});
