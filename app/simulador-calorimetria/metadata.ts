import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Calorimetría - Calor Específico y Calor Latente | meskeIA',
  description:
    'Calcula el calor necesario para calentar, fundir o evaporar una sustancia y la temperatura de equilibrio al mezclar dos cuerpos, con el desglose tramo a tramo, la curva de calentamiento dibujada y el tiempo que tarda a una potencia dada.',
  keywords:
    'calorimetría, calor específico, calor latente, calor latente de fusión, calor latente de vaporización, temperatura de equilibrio, equilibrio térmico, curva de calentamiento, Q = m·c·ΔT, cambio de estado, mezclas, calorímetro, ejercicios de calorimetría resueltos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-calorimetria/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Calorimetría - Calor Específico y Latente | meskeIA',
    description:
      'El calor tramo a tramo para calentar, fundir y evaporar, y la temperatura de equilibrio de una mezcla, con la curva de calentamiento dibujada',
    url: 'https://meskeia.com/simulador-calorimetria/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Calorimetría - Calor Específico y Latente | meskeIA',
    description: 'Q = m·c·ΔT y Q = m·L tramo a tramo, con curva de calentamiento y temperatura de equilibrio',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Calorimetría',
  description:
    'Simulador interactivo de calorimetría para resolver los dos problemas clásicos paso a paso. En el modo calentamiento calcula el calor necesario para llevar una masa de cualquier sustancia de una temperatura a otra, separando los tramos sensibles (Q = m·c·ΔT) de las mesetas de cambio de estado (Q = m·L), con la curva de calentamiento dibujada y el tiempo que tardaría un aparato de una potencia dada. En el modo mezcla resuelve el balance energético de dos cuerpos en un calorímetro ideal y da la temperatura de equilibrio, detectando los casos en los que el hielo se funde solo en parte.',
  url: 'https://meskeia.com/simulador-calorimetria/',
  category: 'EducationalApplication',
  features: [
    'Calor sensible tramo a tramo con Q = m·c·ΔT',
    'Calor latente de fusión y de vaporización con Q = m·L',
    'Curva de calentamiento dibujada con sus rampas y mesetas',
    'Temperatura de equilibrio de una mezcla de dos cuerpos',
    'Detección de fusión parcial: cuánto hielo queda sin fundir',
    'Tiempo estimado a una potencia dada (hervidor, placa, resistencia)',
    'Resultado en julios, kilojulios, kilocalorías y vatios-hora',
    'Nueve sustancias con sus calores específicos y latentes',
    'Problemas típicos precargados',
    'En español',
  ],
  keywords: ['calorimetría', 'calor específico', 'calor latente', 'temperatura de equilibrio', 'curva de calentamiento'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre calor específico y calor latente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El calor específico (c) es la energía que hay que dar a un kilogramo de sustancia para subir su temperatura un grado, y se usa con Q = m·c·ΔT mientras la sustancia no cambia de estado. El calor latente (L) es la energía que absorbe un kilogramo al fundirse o al evaporarse, y se usa con Q = m·L a temperatura constante. La diferencia práctica es enorme: calentar un kilo de agua de 0 °C a 100 °C cuesta 418 kJ, pero evaporarlo después cuesta 2.257 kJ, cinco veces más sin que el termómetro se mueva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la temperatura no sube mientras el hielo se funde?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque toda la energía que entra se invierte en romper la estructura del sólido, no en aumentar la energía cinética media de las moléculas, que es lo que mide el termómetro. Hasta que no ha fundido el último gramo, la mezcla de hielo y agua permanece a 0 °C. Por eso la curva de calentamiento tiene mesetas horizontales: son los tramos donde se está pagando el calor latente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la temperatura de equilibrio al mezclar dos cuerpos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Planteando que el calor cedido por el cuerpo caliente es igual al absorbido por el frío: m₁·c₁·(T_eq − T₁) + m₂·c₂·(T_eq − T₂) = 0, de donde T_eq = (m₁·c₁·T₁ + m₂·c₂·T₂)/(m₁·c₁ + m₂·c₂). Esa fórmula solo vale si ninguna de las dos sustancias cambia de estado por el camino. Si hay hielo de por medio hay que comprobar antes si el agua caliente tiene energía suficiente para fundirlo todo, porque si no la tiene el equilibrio se queda clavado en 0 °C.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda un hervidor de 2.000 W en hervir un litro de agua?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Subir un kilogramo de agua de 20 °C a 100 °C necesita Q = 1 · 4.180 · 80 = 334.400 J, así que a 2.000 W el tiempo teórico es 334.400/2.000 = 167 segundos, algo menos de tres minutos. En la práctica tarda más porque parte del calor se pierde por las paredes y se emplea en calentar el propio recipiente: el rendimiento real de un hervidor doméstico ronda el 80-90 %.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el agua necesita tanta energía comparada con los metales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agua tiene un calor específico de 4.180 J/(kg·K), unas diez veces el del hierro (450) y más de treinta veces el del plomo (129). Esto significa que la misma energía que sube un grado a un kilo de agua subiría más de nueve grados a un kilo de hierro. Es una anomalía debida a los puentes de hidrógeno, y es la razón de que el mar modere el clima de la costa y de que el agua sea el refrigerante habitual de motores y calefacciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un calorímetro ideal y por qué el resultado real es distinto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un calorímetro ideal es un recipiente que no intercambia calor con el exterior ni absorbe energía él mismo, de modo que toda la que pierde un cuerpo la gana el otro. En el laboratorio el recipiente sí se calienta, y esa energía se descuenta mediante el equivalente en agua del calorímetro, un dato que se determina con una experiencia previa. Los cálculos de este simulador suponen calorímetro ideal, que es la hipótesis habitual de los problemas de clase.',
      },
    },
  ],
};
