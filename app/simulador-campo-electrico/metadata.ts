import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Campo Eléctrico - Cargas y Líneas de Campo | meskeIA',
  description: 'Simula el campo eléctrico de cargas puntuales: coloca cargas, observa vectores, líneas de campo y equipotenciales. Calcula E, V, F y U sobre una carga de prueba. Física Bachillerato.',
  keywords: 'campo eléctrico, líneas de campo, equipotenciales, ley de Coulomb, cargas puntuales, dipolo eléctrico, potencial eléctrico, física bachillerato, electrostática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-campo-electrico/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Campo Eléctrico | meskeIA',
    description: 'Coloca cargas puntuales y observa vectores, líneas de campo y equipotenciales en tiempo real',
    url: 'https://meskeia.com/simulador-campo-electrico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Campo Eléctrico | meskeIA',
    description: 'Aprende electrostática con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Campo Eléctrico',
  description:
    'Simulador interactivo de campos eléctricos y potenciales. Coloca cargas puntuales con clic, observa líneas de campo, equipotenciales, vectores de E y mide fuerza/energía sobre una carga de prueba arrastrable.',
  url: 'https://meskeia.com/simulador-campo-electrico/',
  category: 'EducationalApplication',
  features: [
    'Editor visual de cargas puntuales con clic y arrastre',
    'Líneas de campo, vectores y equipotenciales',
    'Mapa de intensidad |E| con escala de color',
    '4 configuraciones predefinidas (dipolo, cuadrupolo, etc.)',
    'Carga de prueba con cálculo de F, U, E, V',
    'En español',
  ],
  keywords: ['campo eléctrico', 'electrostática', 'Coulomb', 'física bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el campo eléctrico y cómo se mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El campo eléctrico E es una magnitud vectorial que describe la fuerza que experimentaría una carga de prueba positiva por unidad de carga en cada punto del espacio. Se mide en voltios por metro (V/m) o, equivalentemente, en newtons por culombio (N/C). Una carga puntual Q genera un campo E = kQ/r², donde k es la constante de Coulomb (≈ 8,99 × 10⁹ N·m²/C²) y r es la distancia al punto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las líneas de campo eléctrico y qué información dan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las líneas de campo eléctrico son curvas imaginarias cuya tangente en cada punto indica la dirección del vector E. Parten de cargas positivas y terminan en cargas negativas (o en el infinito). La densidad de líneas es proporcional a la intensidad del campo: cuanto más juntas, mayor es el campo en esa zona. Nunca se cruzan entre sí, ya que el campo tiene una dirección única en cada punto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las superficies equipotenciales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las superficies equipotenciales son el conjunto de puntos donde el potencial eléctrico V tiene el mismo valor. Son siempre perpendiculares a las líneas de campo. Mover una carga a lo largo de una equipotencial no requiere trabajo (ΔW = 0), ya que el potencial no varía. Para una carga puntual, las equipotenciales son esferas concéntricas; para un dipolo, tienen una geometría más compleja que el simulador muestra de forma interactiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la fuerza entre dos cargas eléctricas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fuerza entre dos cargas puntuales se calcula con la ley de Coulomb: F = k·|q₁·q₂|/r², donde k ≈ 8,99 × 10⁹ N·m²/C², q₁ y q₂ son los valores de las cargas y r la distancia entre ellas. Si las cargas tienen el mismo signo, la fuerza es repulsiva; si tienen signos contrarios, es atractiva. La dirección es siempre la línea que une las dos cargas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este simulador de campo eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador cubre los contenidos de electrostática de segundo curso de física de educación secundaria superior (bachillerato o equivalente) y es también útil para primeros cursos universitarios de física general. Permite visualizar conceptos abstractos como líneas de campo, equipotenciales y la superposición de campos de múltiples cargas, que son difíciles de intuir sin una herramienta gráfica interactiva.',
      },
    },
  ],
};
