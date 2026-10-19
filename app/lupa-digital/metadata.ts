import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lupa Digital Online - Amplía con tu Móvil o Celular Gratis | meskeIA',
  description: 'Lupa digital gratuita que usa la cámara de tu móvil o celular para ampliar texto, objetos pequeños y detalles. Congela la imagen para leer sin pulso, con filtros de contraste. Ideal para leer letra pequeña y accesibilidad.',
  keywords: 'lupa digital, lupa online, lupa celular, lupa móvil, ampliar cámara, lupa gratis, magnificador, zoom cámara, congelar imagen, accesibilidad, leer letra pequeña, baja visión',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lupa Digital Online - Amplía con tu Móvil o Celular',
    description: 'Lupa digital gratuita que usa la cámara de tu móvil o celular para ampliar texto y objetos pequeños.',
    url: 'https://meskeia.com/lupa-digital/',
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
    title: 'Lupa Digital Online - Amplía con tu Móvil o Celular',
    description: 'Lupa digital gratuita que usa la cámara de tu móvil o celular para ampliar texto y objetos pequeños.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Lupa Digital con Cámara",
  description: "Lupa digital gratuita que usa la cámara de tu móvil o celular para ampliar texto, objetos pequeños y detalles. Funciona también en ordenador o computadora. Ideal para leer letra pequeña y accesibilidad.",
  url: "https://meskeia.com/lupa-digital/",
  category: 'UtilityApplication',
  features: [
    'Ampliación de 1× a 5× con la cámara del móvil o celular, usando el zoom de la propia cámara cuando el navegador lo permite',
    'Congelar la imagen para leerla sin sostener el teléfono, recorriéndola con el dedo o el teclado',
    'Filtros de accesibilidad: alto contraste, inversión, escala de grises y sepia',
    'Ajuste independiente de brillo y contraste en tiempo real',
    'Restablecer todos los ajustes de un toque',
    'Compatibilidad con cámara frontal y trasera',
    'Activación de linterna integrada en dispositivos compatibles',
    'Procesado 100 % local en el navegador, sin envío de imágenes',
  ],
});

/**
 * Hallazgo 3276 (19/10/2026): la pregunta de la imagen fija se respondía dos veces con textos
 * escritos a mano por separado —la FAQ visible de page.tsx y este FAQPage—, y cada uno añadía
 * algo distinto. Ahora las dos bocas leen estas constantes (CLAUDE.md §1.ter).
 */
export const PREGUNTA_IMAGEN_FIJA = '¿Puedo dejar la imagen fija para leerla con calma?';
export const RESPUESTA_IMAGEN_FIJA =
  'Sí. El botón «Congelar» detiene la imagen en el fotograma que estés viendo y a partir de ahí puedes apoyar o soltar el teléfono. Sobre la imagen quieta siguen funcionando el zoom, los filtros de contraste y el brillo, y se recorre arrastrándola con el dedo o con las flechas del teclado. La captura se hace a la resolución de la cámara y no a la de la pantalla, así que ampliar después de congelar conserva el detalle. Es la forma más cómoda de leer un prospecto entero, porque con mucho aumento cualquier temblor de la mano mueve la imagen. Si además quieres guardarla, haz una captura de pantalla.';

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona la lupa digital online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lupa digital accede a la cámara de tu dispositivo (móvil o celular, tablet, u ordenador o computadora con webcam) y muestra la imagen en pantalla con el nivel de ampliación que elijas. Si el navegador deja controlar el zoom de la cámara, como hacen muchos móviles Android con Chrome, se lo pide primero a ella, que amplía sobre la imagen completa del sensor y pierde menos nitidez; el resto del zoom se aplica en pantalla, en tiempo real, permitiendo ver con mayor detalle textos pequeños, etiquetas, componentes electrónicos o cualquier objeto que coloquen frente al objetivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué casos es útil la lupa digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para leer letra pequeña en prospectos de medicamentos, contratos, facturas o etiquetas de productos. También para personas con baja visión que necesitan apoyo de magnificación, para inspeccionar detalles de joyería, electrónica o piezas pequeñas, o simplemente cuando no se tiene a mano gafas de lectura y se necesita ampliar algo rápidamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo en mi móvil, celular u ordenador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No requiere instalación. Funciona directamente desde el navegador web en cualquier dispositivo con cámara. Solo tienes que abrir la herramienta y aceptar el permiso de acceso a la cámara. Es compatible con Chrome, Firefox, Safari y Edge en versiones recientes, tanto en Android e iOS como en ordenadores o computadoras de escritorio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia de la lupa de accesibilidad del sistema operativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lupa del sistema operativo (como la lupa de Windows o la función de accesibilidad de iOS/Android) amplía el contenido de la pantalla, no lo que hay físicamente frente a la cámara. Esta lupa digital amplía el mundo real a través de la cámara, lo que la hace útil para documentos físicos, objetos y entornos, no para contenido digital que ya está en pantalla.',
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_IMAGEN_FIJA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_IMAGEN_FIJA,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué filtro se lee mejor con letra muy pequeña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del papel y de la luz, así que conviene probar los cuatro. El de alto contraste ayuda con impresiones desvaídas, como los prospectos de medicamentos; el invertido (texto claro sobre fondo oscuro) descansa la vista cuando el papel es muy brillante y refleja; la escala de grises quita el color que distrae en etiquetas muy recargadas. Si la imagen se mueve, sube el zoom por pasos y quédate en el menor que te permita leer.',
      },
    },
  ],
};
