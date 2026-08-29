import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cálculo Visual: Límites, Derivadas e Integrales | meskeIA',
  description: 'Visualiza los conceptos del cálculo en tiempo real. Límites, derivadas (tangente deslizante) e integrales (área de Riemann) animados con sliders interactivos.',
  keywords: ['cálculo diferencial', 'derivadas visualizador', 'integrales gráfico', 'límites matemáticas', 'teorema fundamental cálculo', 'tangente curva', 'area riemann', 'cálculo animado'],
  openGraph: {
    title: 'Cálculo Visual: Límites, Derivadas e Integrales',
    description: 'El teorema fundamental que une derivadas e integrales, animado para que lo entiendas de verdad.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cálculo Visual: Límites, Derivadas e Integrales',
    description: 'El teorema fundamental que une derivadas e integrales, animado para que lo entiendas de verdad.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cálculo Visual: Límites, Derivadas e Integrales",
  description: "Visualiza los conceptos del cálculo en tiempo real. Límites, derivadas (tangente deslizante) e integrales (área de Riemann) animados con sliders interactivos.",
  url: "https://meskeia.com/visualizador-calculo-visual/",
  category: 'EducationalApplication',
  features: [
    'Visualización de límites: animación del proceso de aproximación desde ambos lados con slider interactivo',
    'Derivada animada: recta tangente deslizante que muestra la pendiente instantánea en cada punto',
    'Integral de Riemann: sumas con n rectángulos ajustable de 1 a 100 con área coloreada positiva/negativa',
    'Tres funciones predefinidas: cuadrática, seno y cúbica con comportamientos distintos',
    'Tres secciones independientes: límites, derivadas e integrales en pestañas separadas',
    'Cálculo simbólico exacto de la derivada y la integral para comparar con la aproximación visual',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un límite en cálculo y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un límite describe el valor al que se aproxima una función cuando su variable independiente se acerca a un punto determinado, sin necesariamente alcanzarlo. Es la base conceptual de todo el cálculo: permite definir la derivada (como límite de una razón de cambio) y la integral (como límite de una suma). Sin la noción de límite no existirían conceptos rigurosos como continuidad, derivabilidad o convergencia de series.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mide una derivada y cómo se interpreta geométricamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La derivada de una función en un punto mide la tasa instantánea de cambio de esa función en ese punto. Geométricamente corresponde a la pendiente de la recta tangente a la curva en ese punto exacto. Si la derivada es positiva, la función crece; si es negativa, decrece; si es cero, hay un posible máximo, mínimo o punto de inflexión. Se usa en física (velocidad, aceleración), economía (coste marginal) e ingeniería, entre muchos otros campos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una integral de Riemann y cómo se calcula el área bajo una curva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La integral de Riemann aproxima el área entre una curva y el eje horizontal dividiendo el intervalo en n rectángulos de igual anchura y sumando sus áreas. Cuantos más rectángulos se usan (n → ∞), más precisa es la aproximación hasta converger en el valor exacto del área. Este proceso es la base de la integración definida y el teorema fundamental del cálculo lo conecta directamente con la derivada: integrar y derivar son operaciones inversas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué establece el teorema fundamental del cálculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El teorema fundamental del cálculo tiene dos partes. La primera afirma que si F es la integral acumulada de una función continua f, entonces F es derivable y su derivada es f. La segunda parte proporciona el método práctico de cálculo: el área bajo f entre a y b es igual a F(b) − F(a), donde F es cualquier antiderivada de f. Este teorema unifica el cálculo diferencial e integral, que fueron desarrollados de forma independiente por Newton y Leibniz en el siglo XVII.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es útil visualizar el cálculo interactivamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los visualizadores interactivos son especialmente útiles para estudiantes de bachillerato (segundo de bachillerato científico-tecnológico), primeros cursos de grado en matemáticas, física, ingeniería o economía, y para cualquier persona que quiera comprender intuitivamente los conceptos antes de formalizar las demostraciones. Ver cómo la recta tangente se desliza sobre la curva o cómo los rectángulos de Riemann convergen permite construir una intuición geométrica que facilita el trabajo algebraico posterior.',
      },
    },
  ],
};
