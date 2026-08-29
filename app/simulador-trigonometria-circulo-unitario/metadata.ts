import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador del Círculo Trigonométrico — Seno, Coseno y Tangente Interactivos | meskeIA',
  description: 'Visualiza el círculo unitario en tiempo real: mueve el ángulo y observa seno, coseno y tangente con proyecciones geométricas animadas. Con ángulos notables y animación automática.',
  keywords: 'trigonometría, círculo unitario, seno, coseno, tangente, ángulos notables, radián, grados, círculo trigonométrico, Bachillerato, matemáticas, geometría',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-trigonometria-circulo-unitario/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Círculo Trigonométrico | meskeIA',
    description: 'Mueve el ángulo y observa seno, coseno y tangente sobre el círculo unitario en tiempo real. Con animación y ángulos notables.',
    url: 'https://meskeia.com/simulador-trigonometria-circulo-unitario/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Círculo Trigonométrico | meskeIA',
    description: 'Visualiza el círculo unitario y las razones trigonométricas de forma interactiva y animada.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Círculo Trigonométrico',
  description: 'Simulador interactivo del círculo unitario trigonométrico. Mueve el ángulo θ con un slider o activa la animación automática para ver seno, coseno y tangente con proyecciones geométricas en tiempo real. Incluye ángulos notables, cuadrantes, identidad pitagórica y conversión grados/radianes.',
  url: 'https://meskeia.com/simulador-trigonometria-circulo-unitario/',
  category: 'EducationalApplication',
  features: [
    'Visualización del círculo unitario con canvas 2D en tiempo real',
    'Slider interactivo de ángulo θ de 0° a 360° con input numérico directo',
    'Proyecciones geométricas de seno (sin) y coseno (cos) con colores diferenciados',
    'Toggle entre grados y radianes',
    'Animación automática con control de velocidad',
    'Botones de acceso rápido a ángulos notables (0°, 30°, 45°, 60°, 90°...)',
    'Panel de valores numéricos con 4 decimales e identidad sin²+cos²=1',
    'Indicador de cuadrante activo',
    'Soporte completo de dark mode y pantallas Retina/HiDPI',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['trigonometría', 'círculo unitario', 'seno', 'coseno', 'tangente', 'radián', 'Bachillerato', 'matemáticas'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el círculo unitario en trigonometría?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El círculo unitario es una circunferencia de radio 1 centrada en el origen del plano cartesiano. Para cualquier ángulo θ, el punto donde el radio intersecta la circunferencia tiene coordenadas (cos θ, sen θ). Esto permite definir las razones trigonométricas para cualquier ángulo real, no solo los agudos de un triángulo rectángulo, y es la base del análisis de funciones periódicas en matemáticas y física.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los ángulos notables y cuánto miden sus razones trigonométricas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ángulos notables más importantes son 0°, 30°, 45°, 60° y 90°. Sus valores exactos son: sen 30° = cos 60° = 1/2; sen 45° = cos 45° = √2/2 ≈ 0,7071; sen 60° = cos 30° = √3/2 ≈ 0,8660; sen 90° = 1, cos 90° = 0. Conocer estos valores de memoria agiliza mucho la resolución de ejercicios en secundaria, preparatoria y Bachillerato.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierte un ángulo de grados a radianes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula de conversión es: radianes = grados × (π/180). Por ejemplo, 90° = π/2 rad ≈ 1,5708 rad y 180° = π rad. A la inversa, grados = radianes × (180/π). El radián es la unidad natural en cálculo diferencial e integral porque simplifica las derivadas de las funciones trigonométricas (la derivada de sen x es cos x solo cuando x está en radianes).',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué cuadrantes son positivos seno, coseno y tangente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el primer cuadrante (0°-90°) las tres razones son positivas. En el segundo (90°-180°) solo el seno es positivo. En el tercero (180°-270°) solo la tangente es positiva. En el cuarto (270°-360°) solo el coseno es positivo. Esta regla se recuerda con el acrónimo "ACTS" (leído en sentido antihorario: 1.°A todo positivo, 2.°S seno, 3.°T tangente, 4.°C coseno).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la identidad pitagórica sen²θ + cos²θ = 1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La identidad pitagórica es la relación trigonométrica más importante: se cumple para cualquier ángulo θ y se deriva directamente del teorema de Pitágoras aplicado al círculo unitario. Permite despejar sen θ a partir de cos θ o viceversa, simplificar expresiones trigonométricas complejas y demostrar otras identidades. En física es fundamental para calcular componentes de vectores y en ingeniería para el análisis de señales sinusoidales.',
      },
    },
  ],
};
