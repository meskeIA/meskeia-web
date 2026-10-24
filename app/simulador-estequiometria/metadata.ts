import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Estequiometría: Reactivo Limitante | meskeIA',
  description: 'Calcula el reactivo limitante, la masa del producto y el reactivo en exceso para 6 reacciones reales. Visualiza las barras de moles y el efecto del rendimiento. Ideal para Bachillerato y EBAU (España), preparatoria y secundaria (Latinoamérica).',
  keywords: 'estequiometría, reactivo limitante, moles, masa molar, rendimiento, ecuación balanceada, EBAU, Bachillerato, preparatoria, secundaria, química, cálculo estequiométrico, exceso, producto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-estequiometria/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Estequiometría: Reactivo Limitante | meskeIA',
    description: 'Introduce gramos de cada reactivo y descubre cuál es el limitante, cuánto producto se forma y cuánto exceso sobra.',
    url: 'https://meskeia.com/simulador-estequiometria/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Estequiometría: Reactivo Limitante | meskeIA',
    description: 'El reactivo limitante, visualizado: barras de moles, masa del producto y exceso al instante.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Estequiometría: Reactivo Limitante',
  description: 'Simulador interactivo de estequiometría que calcula el reactivo limitante, la masa teórica y real del producto principal, y los gramos de reactivo en exceso para 6 reacciones reales: combustión del metano, síntesis del agua, neutralización ácido-base, proceso Haber-Bosch, oxidación del hierro y fermentación alcohólica. Incluye barras de moles comparativas y slider de rendimiento. Pensado para estudiantes de Bachillerato y EBAU (España), preparatoria, secundaria y educación media (Latinoamérica), y primero de Universidad.',
  url: 'https://meskeia.com/simulador-estequiometria/',
  category: 'EducationalApplication',
  features: [
    '6 reacciones reales predefinidas con contexto industrial o cotidiano',
    'Cálculo automático del reactivo limitante por razón estequiométrica',
    'Barras de moles visuales (disponibles vs necesarios) para cada reactivo',
    'Masa teórica y real del producto principal con slider de rendimiento',
    'Gramos sobrantes del reactivo en exceso',
    'Ecuación balanceada con reactivo limitante resaltado en rojo',
    'Soporte para catalizadores (fermentación alcohólica)',
  ],
  keywords: ['estequiometría', 'reactivo limitante', 'moles', 'masa molar', 'rendimiento', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria', 'química'],
});

/**
 * Las dos preguntas que están a la vez en la FAQ visible y en el FAQPage, con UNA respuesta que
 * importan las dos bocas (hallazgo 3455, 24/10/2026). Iban escritas dos veces y cada una callaba lo
 * que daba la otra: la visible avisaba de que el limitante no es el de menor masa y la del FAQPage
 * daba el método del cociente. Texto plano: el énfasis se pierde, pero no vuelven a divergir.
 */
export const RESPUESTA_REACTIVO_LIMITANTE =
  'El reactivo limitante es el que se agota primero en la reacción y, por tanto, determina la cantidad máxima de producto que puede formarse. Para identificarlo se compara, en cada reactivo, la razón moles disponibles / coeficiente estequiométrico: el de cociente más pequeño es el limitante. No es necesariamente el que se añade en menor masa, porque depende también de su masa molar y de su coeficiente. El reactivo que no se agota se llama reactivo en exceso.';

/** 12,011 + 4 × 1,008 = 16,043 g/mol; 32 / 16,043 = 1,99464 → «≈ 1,995 mol». */
export const RESPUESTA_MOLES_DESDE_GRAMOS =
  'Los moles se calculan dividiendo la masa en gramos entre la masa molar del compuesto: n = m / M. La masa molar (g/mol) es la suma de las masas atómicas de todos los átomos de la fórmula. Por ejemplo, el CH₄ tiene M = 12,011 + 4 × 1,008 = 16,043 g/mol, así que 32 g de CH₄ son 32 / 16,043 ≈ 1,995 mol.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el reactivo limitante en una reacción química?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_REACTIVO_LIMITANTE,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calculan los moles a partir de gramos en estequiometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_MOLES_DESDE_GRAMOS,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre rendimiento teórico y rendimiento real en una reacción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rendimiento teórico es la masa máxima de producto calculada asumiendo que la reacción llega al 100 % de conversión. El rendimiento real es la masa obtenida experimentalmente, siempre menor o igual al teórico debido a pérdidas, reacciones secundarias o equilibrios incompletos. El rendimiento porcentual = (masa real / masa teórica) × 100.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los pasos para resolver un problema de estequiometría en el examen de selectividad o de admisión universitaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El procedimiento estándar, válido tanto para la EBAU/selectividad (España) como para los exámenes de admisión universitaria de preparatoria y educación media (Latinoamérica), es: 1) ajustar la ecuación balanceada con sus coeficientes estequiométricos; 2) convertir los gramos de cada reactivo a moles (n = m/M); 3) identificar el reactivo limitante comparando n/coeficiente para cada reactivo; 4) calcular los moles de producto usando la proporción estequiométrica del limitante; 5) convertir moles de producto a gramos con su masa molar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve visualizar las barras de moles en un simulador de estequiometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las barras de moles muestran gráficamente cuántos moles están disponibles de cada reactivo frente a los que se necesitarían para consumir todo el otro reactivo. Esta representación visual permite identificar de inmediato cuál queda corto (reactivo limitante) y cuánto sobra del otro (exceso), sin necesidad de hacer los cálculos de cabeza. Es especialmente útil para afianzar la comprensión conceptual antes de los exámenes.',
      },
    },
  ],
};
