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
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Círculo Trigonométrico | meskeIA',
    description: 'Visualiza el círculo unitario y las razones trigonométricas de forma interactiva y animada.',
    images: ['https://meskeia.com/og-image.png']
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
