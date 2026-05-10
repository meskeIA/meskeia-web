import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Masa-Resorte (MAS) - Movimiento Armónico Simple con Amortiguamiento | meskeIA',
  description: 'Simula el movimiento armónico simple masa-resorte: ajusta masa, constante del resorte, amplitud y amortiguamiento. Calcula período, frecuencia, energías y observa la oscilación en tiempo real.',
  keywords: 'masa-resorte, MAS, movimiento armónico simple, período, frecuencia angular, amortiguamiento, energía cinética, energía potencial, EBAU, Bachillerato, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-mas-resorte/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Masa-Resorte (MAS) | meskeIA',
    description: 'Simulador interactivo del movimiento armónico simple con animación del resorte, gráfica x(t) y barras de energía en tiempo real.',
    url: 'https://meskeia.com/simulador-mas-resorte/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Masa-Resorte | meskeIA',
    description: 'Aprende el MAS con simulación interactiva del resorte y gráfica de posición',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Masa-Resorte — Movimiento Armónico Simple',
  description: 'Simulador interactivo del sistema masa-resorte y movimiento armónico simple. Ajusta masa, constante del resorte, amplitud y coeficiente de amortiguamiento. Observa la animación del resorte, la gráfica x(t) y la evolución de las energías cinética y potencial en tiempo real.',
  url: 'https://meskeia.com/simulador-mas-resorte/',
  category: 'EducationalApplication',
  features: [
    'Animación 2D del resorte con zigzag y bloque masa',
    'Gráfica x(t) en tiempo real con decaimiento exponencial',
    'Barras de energía cinética, potencial y total actualizadas a 60 fps',
    'Control de amortiguamiento viscoso (0 → sobreamortiguado)',
    'Cálculo instantáneo de ω₀, T, f, x, v, a y energías',
    'Botón pausar/reanudar y reiniciar',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['masa-resorte', 'MAS', 'movimiento armónico simple', 'física bachillerato', 'amortiguamiento', 'período'],
});
