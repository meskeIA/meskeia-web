import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transporte en las Plantas - Agua que Sube sin Motor | meskeIA',
  description: 'Descubre cómo las plantas transportan agua y nutrientes sin corazón: xilema, floema, estomas, capilaridad y transpiración. Explicador visual interactivo.',
  keywords: 'transporte plantas, xilema, floema, estomas, capilaridad, transpiración, savia bruta, savia elaborada, biología vegetal, cohesión-tensión',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Transporte en las Plantas - Agua que Sube sin Motor',
    description: 'Cómo las plantas mueven agua y nutrientes sin bombas: xilema, floema, estomas y capilaridad explicados visualmente.',
    url: 'https://meskeia.com/visualizador-transporte-plantas/',
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
    title: 'Transporte en las Plantas - Explicador Visual',
    description: 'El agua sube 100 metros sin motor: descubre el sistema de transporte más eficiente de la naturaleza.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Transporte Plantas Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Transporte en las Plantas - Agua que Sube sin Motor',
  description: 'Explicador visual interactivo sobre el transporte en las plantas: xilema y floema, mecanismos de ascenso del agua, estomas y datos fascinantes. Diagramas animados del sistema vascular vegetal.',
  url: 'https://meskeia.com/visualizador-transporte-plantas/',
  category: 'EducationalApplication',
  features: [
    'Diagrama de xilema y floema con flujos animados',
    'Mecanismos de ascenso del agua: transpiración, capilaridad, presión radicular',
    'Estomas interactivos con toggle día/noche',
    'Datos fascinantes sobre el transporte vegetal',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo sube el agua por las plantas sin una bomba?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agua asciende por las plantas gracias a tres fuerzas combinadas. La transpiración en las hojas genera una tensión que "tira" del agua hacia arriba (teoría de la cohesión-tensión). La cohesión entre moléculas de agua dentro del xilema mantiene la columna continua sin romperse. Finalmente, la presión radicular en las raíces empuja el agua hacia el tronco. En árboles altos como las secuoyas, este sistema puede elevar agua más de 100 metros sin ninguna bomba activa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el xilema y el floema en las plantas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El xilema y el floema son los dos tejidos vasculares de las plantas. El xilema transporta agua y minerales disueltos desde las raíces hacia arriba (savia bruta), y está formado principalmente por células muertas llamadas traqueidas y elementos de vaso. El floema, en cambio, transporta los azúcares producidos en la fotosíntesis desde las hojas hacia el resto de la planta (savia elaborada), y está formado por células vivas denominadas tubos cribosos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven los estomas en las plantas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estomas son pequeños poros en la superficie de las hojas que cumplen dos funciones clave: permiten el intercambio gaseoso (entrada de CO₂ para la fotosíntesis y salida de O₂) y regulan la transpiración del agua. Cada estoma está rodeado por dos células oclusivas que se hinchan de agua para abrirlo y se contraen para cerrarlo. De noche, o cuando hay estrés hídrico, los estomas se cierran para reducir la pérdida de agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta agua puede transpirar un árbol en un día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un árbol adulto puede transpirar entre 200 y 400 litros de agua al día en condiciones cálidas y soleadas, aunque grandes ejemplares como el roble o el eucalipto pueden superar los 600 litros. A escala global, la transpiración de la vegetación terrestre representa alrededor del 10% del agua que entra en la atmósfera, siendo un factor clave del ciclo hidrológico y del clima regional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre savia bruta y savia elaborada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La savia bruta es la solución de agua y sales minerales que viaja por el xilema desde las raíces hacia las hojas; su composición es principalmente inorgánica. La savia elaborada circula por el floema desde las hojas (donde se fabrica el azúcar mediante fotosíntesis) hacia todos los órganos que la necesitan; es rica en sacarosa, aminoácidos y otras moléculas orgánicas. El flujo de la savia elaborada puede ir tanto hacia arriba como hacia abajo, según las necesidades de cada parte de la planta.',
      },
    },
  ],
};
