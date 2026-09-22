import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Perfil Inversor - Descubre tu Tolerancia al Riesgo | meskeIA',
  description: 'Test gratuito de perfil de inversor. Responde 10 preguntas y descubre cuál de los cinco perfiles te corresponde: conservador, moderado, equilibrado, dinámico o agresivo. Recomendaciones personalizadas de inversión.',
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
    description: 'Test gratuito de perfil de inversor. Responde 10 preguntas y descubre cuál de los cinco perfiles te corresponde: conservador, moderado, equilibrado, dinámico o agresivo.',
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
        text: 'Este test distingue cinco perfiles según la puntuación obtenida: conservador (prioriza la seguridad y acepta menor rentabilidad), moderado, equilibrado (reparto similar entre renta fija y variable), dinámico y agresivo (acepta alta volatilidad buscando mayor rentabilidad a largo plazo). Cada perfil tiene asociada una distribución orientativa de activos (renta variable, renta fija, liquidez y alternativos).',
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
        // 1217: «letras del Tesoro» nombra un instrumento del Tesoro español en un canal que
        // se sirve a todo el público hispanohablante; la categoría universal es la deuda
        // pública a corto plazo, que en cada país tiene su nombre.
        text: 'Un inversor conservador suele optar por depósitos bancarios, deuda pública a corto plazo (las letras del Tesoro, en España), bonos gubernamentales y fondos de renta fija a corto plazo. Prioriza la preservación del capital frente a la rentabilidad, aceptando rendimientos menores a cambio de mayor estabilidad.',
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
        // 1216: decía «cada 1-2 años» mientras la página dice dos veces «al menos una vez al
        // año» y «anualmente». Se unifica con lo que la página afirma.
        text: 'Se recomienda revisar el perfil inversor al menos una vez al año, y además ante cambios significativos en la situación personal: proximidad a la jubilación, cambio de empleo, herencia, matrimonio, divorcio o cambio en los objetivos financieros. El perfil puede evolucionar a lo largo de la vida.',
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Perfil Inversor',
  description: 'Test gratuito que evalúa tu tolerancia al riesgo financiero mediante 10 preguntas. Sitúa tu perfil en una escala de cinco tramos —conservador, moderado, equilibrado, dinámico y agresivo— y orienta tu estrategia de inversión.',
  url: 'https://meskeia.com/test-perfil-inversor/',
  category: 'FinanceApplication',
  features: [
    /*
      ⚠️ 22/09/2026 (hallazgo 1216) — decía «10 preguntas validadas». No hay validación de
      ninguna clase: el cuestionario, los pesos de 1 a 4 y los cinco tramos están escritos en
      `page.tsx`, sin fuente, sin referencia y sin metodología declarada. En una app de riesgo 2
      financiero, «validadas» es una credencial que la app no tiene, y este es el texto que
      leen los asistentes de IA sin el disclaimer al lado.
    */
    '10 preguntas sobre horizonte temporal, experiencia y tolerancia al riesgo',
    'Resultado: uno de los cinco perfiles (conservador, moderado, equilibrado, dinámico o agresivo)',
    'Recomendaciones orientativas según el perfil obtenido',
    'En español',
  ],
  keywords: ['perfil inversor', 'tolerancia riesgo', 'test inversión', 'finanzas personales'],
});
