import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test de Perfil Inversor - Descubre tu Tolerancia al Riesgo | meskeIA',
  description: 'Test gratuito de perfil de inversor. Responde 10 preguntas y descubre cuál de los cinco perfiles te corresponde: conservador, moderado, equilibrado, dinámico o agresivo, con ejemplos ilustrativos de lo que suele asociarse a cada uno.',
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

/**
 * Hallazgo 3230 (20/10/2026): la FAQ visible y el FAQPage hacían la misma pregunta con dos listas
 * de cambios vitales, y solo la visible hablaba de la deriva de la cartera. UNA constante que
 * importan las dos bocas (como app/simulador-gastos-compraventa-garaje), con la unión de las dos.
 */
export const PREGUNTA_REVISAR_PERFIL = '¿Cada cuánto tiempo se debe revisar el perfil inversor?';
export const RESPUESTA_REVISAR_PERFIL =
  'Se recomienda revisar el perfil al menos una vez al año y siempre que ocurra un cambio significativo en tu situación: nuevo trabajo o pérdida de empleo, matrimonio o divorcio, nacimiento de hijos, herencia, compra de vivienda, proximidad a la jubilación o un cambio en tus objetivos financieros. Los mercados también cambian tu exposición real: si la bolsa sube mucho, tu porcentaje en renta variable aumenta sin que hagas nada.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipos de perfil inversor existen?',
      acceptedAnswer: {
        '@type': 'Answer',
        // 3312 (15/10/2026): el horizonte de la primera pregunta fija el perfil máximo.
        text: 'Este test distingue cinco perfiles según la puntuación obtenida: conservador (prioriza la seguridad y acepta menor rentabilidad), moderado, equilibrado (reparto similar entre renta fija y variable), dinámico y agresivo (acepta alta volatilidad buscando mayor rentabilidad a largo plazo). El horizonte temporal pone un tope: si el dinero se va a necesitar en menos de 2 años, el perfil no pasa de conservador; entre 2 y 5 años, de moderado, y entre 5 y 10, de equilibrado. Cada perfil tiene asociada una distribución orientativa de activos (renta variable, renta fija, liquidez y alternativos).',
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
        // 3231 (20/10/2026): nombraba acciones individuales y ETFs sectoriales, que son
        // concentración, cuando la página le asocia renta variable global diversificada, y lo
        // afirmaba como un hecho cuando la página da ejemplos ilustrativos.
        text: 'Este test asocia al perfil agresivo, como ejemplos ilustrativos y no como recomendación, una cartera casi toda en renta variable global diversificada (por ejemplo, fondos o ETFs de renta variable global), con exposición a mercados emergentes y, a veces, estrategias que sobreponderan algún factor como el tamaño o el valor. Acepta fluctuaciones elevadas —incluyendo pérdidas temporales del 30-50\u00A0%— a cambio de mayor potencial de rentabilidad a largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_REVISAR_PERFIL,
      acceptedAnswer: {
        '@type': 'Answer',
        // 1216: decía «cada 1-2 años» mientras la página dice dos veces «al menos una vez al
        // año» y «anualmente». Se unifica con lo que la página afirma. 3230: una sola constante.
        text: RESPUESTA_REVISAR_PERFIL,
      },
    },
  ],
};

export const jsonLd = generateWebAppSchema({
  name: 'Test de Perfil Inversor',
  // 3300 — terminaba en «y orienta tu estrategia de inversión»: el resultado da un perfil y
  // ejemplos ilustrativos, y dice expresamente que no son una recomendación.
  description: 'Test gratuito que evalúa tu tolerancia al riesgo financiero mediante 10 preguntas. Sitúa tu perfil en una escala de cinco tramos —conservador, moderado, equilibrado, dinámico y agresivo— con ejemplos ilustrativos de lo que suele asociarse a cada uno.',
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
    /*
      15/10/2026 (hallazgo 3300) — decía «Recomendaciones orientativas según el perfil obtenido»,
      que el resultado niega («Son ejemplos ilustrativos, no una recomendación de inversión ni de
      producto»), y «En español», que no es una función. La lista es ahora lo que la app hace.
    */
    '10 preguntas sobre horizonte, reacción ante caídas, experiencia, ingresos y objetivos',
    'Puntuación de 10 a 40 con su tramo y aviso cuando cae en el borde entre dos perfiles',
    'Tope del perfil según el horizonte temporal, explicado en el resultado cuando actúa',
    'Uno de cinco perfiles con nivel de riesgo, horizonte, volatilidad y objetivo orientativos',
    'Distribución de activos de ejemplo para cada perfil',
    'Ejemplos ilustrativos de lo que suele asociarse a cada perfil, sin aconsejar productos',
    'Revisar y cambiar respuestas desde el resultado sin repetir el test',
    'Recupera el test a medias, y el resultado, tras recargar o volver atrás en la misma pestaña',
    'Enlace para simular la cartera del perfil en el estimador de carteras',
  ],
  keywords: ['perfil inversor', 'tolerancia riesgo', 'test inversión', 'finanzas personales'],
});
