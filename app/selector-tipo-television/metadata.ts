import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Televisión — ¿OLED, QLED o LED? ¿Qué tecnología te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tecnología de pantalla te conviene: OLED, QLED/Mini-LED, LED LCD IPS o LED LCD VA. Análisis según uso, habitación, presupuesto y distancia de visión.',
  keywords: [
    'OLED o QLED',
    'qué televisión comprar',
    'diferencia OLED QLED LED',
    'mejor tecnología TV 2025',
    'televisión para gaming',
    'televisión para cine en casa',
    'tamaño TV según distancia',
    'Mini-LED vs OLED',
    'LED IPS o VA',
    'qué panel TV elegir',
  ],
  openGraph: {
    title: '¿OLED, QLED o LED? Test de tecnología de TV | meskeIA',
    description:
      'Descubre qué tecnología de pantalla se adapta mejor a tu habitación, uso y presupuesto con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-television/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿OLED, QLED o LED? Elige la tecnología TV ideal | meskeIA',
    description:
      'Test de 10 preguntas para saber qué tipo de panel de TV te conviene según uso, habitación y presupuesto.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-tipo-television/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Televisión',
        description:
          'Test orientativo para descubrir qué tecnología de panel (OLED, QLED/Mini-LED, LED IPS o LED VA) se adapta mejor al uso, habitación y presupuesto.',
        url: 'https://meskeia.com/selector-tipo-television/',
        features: [
          'Test de 10 preguntas sobre uso y entorno',
          '4 tecnologías analizadas: OLED, QLED/Mini-LED, LED IPS, LED VA',
          'Análisis de iluminación ambiental y ángulos de visión',
          'Orientación de tamaño según distancia de visión',
          'Consideración de gaming, cine, deportes y uso general',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Televisión",
  description: "Test de 10 preguntas para saber qué tecnología de pantalla te conviene: OLED, QLED/Mini-LED, LED LCD IPS o LED LCD VA. Análisis según uso, habitación, presupuesto y distancia de visión.",
  url: "https://meskeia.com/selector-tipo-television/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre OLED y QLED?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'OLED (Organic Light-Emitting Diode) usa píxeles que emiten su propia luz y pueden apagarse por completo, logrando negros perfectos y contraste infinito. QLED (Quantum Light-Emitting Diode) es una tecnología de retroiluminación LED mejorada con una capa de puntos cuánticos que amplía el espectro de color y el brillo máximo. En términos prácticos, OLED destaca en habitaciones oscuras y para cine; QLED brilla más en salones con mucha luz ambiental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué televisión es mejor para gaming?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para gaming competitivo lo más importante es la latencia de entrada (input lag) y la tasa de refresco (Hz). Los paneles OLED ofrecen tiempos de respuesta de 0,1-0,2 ms y son excelentes para juegos de acción rápida, aunque su precio es mayor. Los paneles QLED/Mini-LED modernos ofrecen mayor brillo y son una opción sólida a precio más ajustado. Ambas tecnologías suelen incluir HDMI 2.1 con 4K/120 Hz en los modelos actuales orientados a consolas de nueva generación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tamaño de televisión necesito según mi distancia de visión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación habitual para 4K es que la distancia de visión sea entre 1,5 y 2,5 veces la diagonal de la pantalla. Por ejemplo, para un televisor de 55 pulgadas (139 cm) la distancia óptima es de unos 2 a 3,5 metros. A distancias cortas (menos de 2 m) un televisor de 65" o más puede resultar incómodo; a más de 4 m conviene considerar al menos 65-75 pulgadas para aprovechar la resolución 4K.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los televisores OLED tienen riesgo de burn-in (quemado de pantalla)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El burn-in o retención de imagen puede ocurrir en pantallas OLED si se muestran elementos estáticos de alto contraste de forma continuada durante muchas horas (HUDs de videojuegos, logos de canales, barras de noticias). Los modelos actuales incorporan medidas de mitigación como pixel shift, screen saver automático y ciclos de compensación. Para un uso variado (películas, series, juegos con sesiones normales) el riesgo es bajo; el problema es más relevante en instalaciones comerciales con imagen fija permanente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre LED IPS y LED VA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IPS (In-Plane Switching) ofrece ángulos de visión amplios (hasta 178°) y colores consistentes incluso viendo la pantalla desde un lado, pero su contraste nativo es inferior al de VA. VA (Vertical Alignment) tiene un contraste nativo mucho más alto (2.000:1 o más frente a 1.000:1 de IPS), lo que se traduce en negros más profundos; sin embargo, los ángulos de visión son más limitados y pueden aparecer zonas oscuras al ver la pantalla en diagonal. IPS es mejor para habitaciones donde varias personas ven desde distintos ángulos; VA es preferible para una sola persona en sala oscura.',
      },
    },
  ],
};
