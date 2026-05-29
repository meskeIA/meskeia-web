import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el WiFi - De las Ondas a tu Pantalla | meskeIA',
  description: 'Descubre cómo funciona el WiFi: ondas electromagnéticas, frecuencias 2.4 vs 5 GHz, propagación por el hogar, obstáculos y consejos. Explicador visual interactivo.',
  keywords: 'como funciona wifi, ondas electromagnéticas, 2.4 GHz, 5 GHz, señal wifi, router, canales wifi, propagación, WiFi 6, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el WiFi - De las Ondas a tu Pantalla',
    description: 'Ondas, frecuencias, obstáculos y canales: todo sobre el WiFi explicado visualmente.',
    url: 'https://meskeia.com/visualizador-como-funciona-wifi/',
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
    title: 'Cómo Funciona el WiFi - Explicador Visual',
    description: 'De las ondas electromagnéticas a tu pantalla: WiFi explicado paso a paso.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'WiFi Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el WiFi - De las Ondas a tu Pantalla',
  description: 'Explicador visual interactivo sobre el funcionamiento del WiFi: ondas electromagnéticas, frecuencias 2.4 y 5 GHz, propagación en el hogar, canales y evolución tecnológica.',
  url: 'https://meskeia.com/visualizador-como-funciona-wifi/',
  category: 'EducationalApplication',
  features: [
    'Comparativa visual 2.4 GHz vs 5 GHz',
    'Plano interactivo de propagación WiFi en el hogar',
    'Canales WiFi y solapamiento explicados visualmente',
    'Timeline de evolución WiFi hasta WiFi 7',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el WiFi exactamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El WiFi transmite datos mediante ondas electromagnéticas en las bandas de radiofrecuencia de 2,4 GHz y 5 GHz (y 6 GHz en WiFi 6E). El router convierte los datos en señales de radio, los dispositivos los reciben con sus antenas y los reconvierten en información digital. La comunicación es bidireccional y se organiza en tramas según el estándar IEEE 802.11, negociando velocidad y canal en función de la calidad de la señal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre WiFi de 2,4 GHz y 5 GHz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La banda de 2,4 GHz tiene mayor alcance y penetra mejor los obstáculos (paredes, suelos), pero ofrece velocidades más bajas y está más congestionada porque la comparten otros dispositivos como micrófonos inalámbricos o monitores de bebé. La banda de 5 GHz ofrece velocidades más altas y menos interferencias, pero su alcance es menor y atenúa más al atravesar paredes. Para dispositivos cercanos al router conviene usar 5 GHz; para los más alejados, 2,4 GHz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el WiFi pierde señal al alejarse del router o al atravesar paredes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La señal WiFi se atenúa con la distancia según la ley del cuadrado inverso: al duplicar la distancia, la potencia se divide por cuatro. Además, los materiales absorben y reflejan las ondas en distinto grado: el hormigón armado, los espejos y los electrodomésticos metálicos son los obstáculos más perjudiciales. El agua también absorbe la señal, por lo que las peceras o las tuberías pueden afectar la cobertura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mejoras aporta WiFi 6 respecto a versiones anteriores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WiFi 6 (802.11ax, 2019) introdujo tecnologías como OFDMA (permite servir a varios dispositivos simultáneamente en el mismo canal), MU-MIMO mejorado (hasta 8 flujos simultáneos) y TWT (Target Wake Time, que reduce el consumo energético de los dispositivos conectados). El resultado es mayor eficiencia en entornos con muchos dispositivos conectados, como hogares con decenas de gadgets, aunque la velocidad máxima teórica solo se alcanza en condiciones ideales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los canales WiFi y por qué pueden causar interferencias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los canales WiFi son subdivisiones del espectro de frecuencias disponible. En 2,4 GHz existen 13 canales en Europa, pero solo los canales 1, 6 y 11 no se solapan entre sí. Si varios routers cercanos usan el mismo canal o canales adyacentes, compiten por el mismo espectro y se generan interferencias que reducen la velocidad y la estabilidad de la conexión. Usar un analizador WiFi y elegir el canal menos congestionado mejora significativamente el rendimiento.',
      },
    },
  ],
};
