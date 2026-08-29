import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Modelo de Phong: Iluminación y Sombreado 3D | meskeIA',
  description:
    'Visualiza cómo se ilumina una esfera 3D con el modelo de reflexión de Phong, píxel a píxel. Ajusta las componentes ambiente, difusa y especular, el brillo (shininess) y mueve la luz arrastrándola sobre el lienzo. Aprende cómo los shaders de los videojuegos y el render 3D calculan el color de cada punto a partir de las normales y los vectores de luz, vista y reflejo.',
  keywords:
    'modelo de Phong, iluminación, sombreado, difuso especular ambiente, render 3D, shaders, gráficos, videojuegos, Lambert, Phong shading, reflexión, normales, luz especular, CGI, sombreado por píxel, Blinn-Phong',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-iluminacion-phong/',
  },
  openGraph: {
    type: 'website',
    title: 'Modelo de Phong: Iluminación y Sombreado 3D',
    description:
      'Cómo se ilumina una esfera 3D con el modelo de Phong: ambiente, difuso y especular en tiempo real. Mueve la luz y descubre cómo piensan los shaders.',
    url: 'https://meskeia.com/visualizador-iluminacion-phong/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modelo de Phong',
    description: 'Sombreado 3D en tiempo real: componentes ambiente, difusa y especular sobre una esfera',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Modelo de Phong: Iluminación y Sombreado 3D',
  description:
    'Visualizador interactivo del modelo de reflexión de Phong. Renderiza una esfera sombreada píxel a píxel sumando las componentes ambiente, difusa (ley del coseno de Lambert) y especular. Permite ajustar los coeficientes ka, kd y ks, el exponente de brillo (shininess), la intensidad y el color de la luz y del material, mover la fuente de luz arrastrándola sobre el lienzo y aislar cada componente para entender cómo contribuye al resultado final. Ideal para aprender shaders, gráficos por computador y programación de videojuegos.',
  url: 'https://meskeia.com/visualizador-iluminacion-phong/',
  category: 'EducationalApplication',
  features: [
    'Esfera renderizada píxel a píxel con el modelo de Phong',
    'Componentes ajustables: ambiente (ka), difusa (kd) y especular (ks)',
    'Exponente de brillo (shininess) e intensidad de la luz',
    'Luz arrastrable sobre el lienzo o por ángulos acimut/elevación',
    'Selector de color de material y de luz',
    'Aísla cada componente: solo ambiente, solo difuso, solo especular o combinado',
    'Explicación de las normales y los vectores L, V y R',
    'En español',
  ],
  keywords: ['modelo de Phong', 'iluminación', 'sombreado', 'render 3D', 'shaders', 'Lambert'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el modelo de iluminación de Phong?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo de Phong es un método clásico de cálculo de la iluminación en gráficos por computador, propuesto por Bui Tuong Phong en 1975. Aproxima cómo refleja la luz una superficie sumando tres componentes: la ambiente (luz de relleno constante), la difusa (brillo mate que depende del ángulo entre la normal y la luz, según la ley del coseno de Lambert) y la especular (el destello brillante que depende del ángulo entre el rayo reflejado y el observador). Es barato de calcular y suficientemente realista, por lo que fue el estándar durante décadas en videojuegos y render 3D.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la componente difusa y la especular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La componente difusa modela las superficies mates: la luz que llega se dispersa por igual en todas direcciones, así que el brillo solo depende del ángulo entre la normal de la superficie y la dirección de la luz (N·L), siguiendo la ley del coseno de Lambert. No cambia al mover la cámara. La componente especular modela el reflejo brillante y depende de la dirección de la cámara: aparece un destello donde el rayo reflejado apunta hacia el observador, y su tamaño lo controla el exponente de brillo. Una superficie muy pulida tiene un destello pequeño e intenso; una mate apenas tiene especular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el exponente de brillo o shininess?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El exponente de brillo (shininess, normalmente la letra alfa) controla el tamaño y la nitidez del destello especular. La componente especular se calcula como el coseno del ángulo entre el rayo reflejado y la vista, elevado a ese exponente. Con valores bajos (por ejemplo 2-8) el destello es grande y difuso, típico de plásticos o superficies poco pulidas. Con valores altos (64-128 o más) el destello se concentra en un punto pequeño y muy brillante, propio de metales pulidos o vidrio. Es el parámetro que más cambia la sensación de material.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el modelo de Phong y Blinn-Phong?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambos calculan la componente especular, pero de forma distinta. El Phong original usa el vector de reflexión R y mide su ángulo con la vista V (R·V). Blinn-Phong, propuesto por Jim Blinn en 1977, evita calcular R: usa el vector intermedio H entre la luz y la vista, y mide el ángulo entre H y la normal (N·H). Blinn-Phong es algo más barato, evita un artefacto del Phong clásico cuando el ángulo supera los 90 grados y produce destellos más realistas en ángulos rasantes, por lo que fue el modelo por defecto durante mucho tiempo en OpenGL y en el pipeline fijo de las tarjetas gráficas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve aprender el modelo de Phong si hoy se usa PBR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los motores modernos usan renderizado basado en física (PBR), que parte de leyes físicas reales como la conservación de la energía y el factor de Fresnel. Aun así, el modelo de Phong sigue siendo la mejor puerta de entrada: explica de forma intuitiva qué son las normales, los vectores de luz, vista y reflejo, y por qué una superficie brilla más o menos según el ángulo. Estos conceptos son la base de cualquier shader, incluido el PBR. Entender Phong primero hace que el salto a modelos más avanzados sea mucho más sencillo.',
      },
    },
  ],
};
