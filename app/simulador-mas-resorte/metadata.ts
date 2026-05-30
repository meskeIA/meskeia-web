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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el movimiento armónico simple (MAS) en un sistema masa-resorte?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El movimiento armónico simple es una oscilación periódica en la que la fuerza restauradora es proporcional al desplazamiento respecto al equilibrio y opuesta a él (ley de Hooke: F = -k·x). En un sistema masa-resorte sin rozamiento, la masa oscila indefinidamente con amplitud constante alrededor de la posición de equilibrio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la constante del resorte al período de oscilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El período del MAS es T = 2π·√(m/k), donde m es la masa y k la constante del resorte. Un resorte más rígido (mayor k) reduce el período y aumenta la frecuencia de oscilación. Duplicar k disminuye T en un factor √2 ≈ 1,41. Por tanto, resortes más duros producen oscilaciones más rápidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el amortiguamiento en un sistema masa-resorte?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El amortiguamiento es la disipación de energía mecánica por rozamiento viscoso u otras fuerzas resistivas. Se caracteriza por el coeficiente de amortiguamiento b (N·s/m). Con amortiguamiento subcrítico la amplitud decae exponencialmente; con amortiguamiento crítico el sistema regresa al equilibrio sin oscilar en el menor tiempo posible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se distribuye la energía entre cinética y potencial en el MAS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La energía total E = ½·k·A² se conserva en el MAS ideal. En el extremo de la oscilación toda la energía es potencial elástica (½·k·x²), y en la posición de equilibrio toda es cinética (½·m·v²). A cualquier posición intermedia la suma de ambas permanece constante, aunque varíen individualmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve simular el sistema masa-resorte frente a resolver las ecuaciones a mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La simulación permite cambiar parámetros (masa, k, amplitud, amortiguamiento) y ver al instante cómo varía la gráfica x(t) y las barras de energía, lo que facilita desarrollar la intuición física antes de los exámenes de selectividad (EBAU/EVAU). Además permite explorar casos límite como el sobreamortiguamiento o la resonancia que son difíciles de visualizar con cálculo manual.',
      },
    },
  ],
};
