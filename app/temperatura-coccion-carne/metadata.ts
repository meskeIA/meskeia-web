import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Temperatura interna de cocción de la carne y el pescado | meskeIA',
  description:
    'Consulta la temperatura interna para cada punto de cocción (poco hecho, al punto, hecho) de vacuno, cerdo, pollo, carne picada y pescado, y la temperatura mínima segura del USDA. En °C y °F. Gratis y en español.',
  keywords:
    'temperatura interna carne, a que temperatura esta hecho el pollo, punto de coccion carne temperatura, temperatura segura carne, termometro cocina carne, temperatura interna cerdo pescado, carne al punto grados',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Temperatura interna de cocción de la carne y el pescado',
    description:
      'Cada punto de cocción y su temperatura interna, con el mínimo seguro del USDA, en °C y °F.',
    url: 'https://meskeia.com/temperatura-coccion-carne',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/coquinum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temperatura interna de cocción de la carne',
    description:
      'Puntos de cocción y temperatura mínima segura de vacuno, cerdo, pollo, picada y pescado.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Temperatura de cocción de la carne meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/temperatura-coccion-carne/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Temperatura interna de cocción de la carne y el pescado',
  description:
    'Tabla de temperaturas internas de cocción para vacuno, cordero, cerdo, aves, carne picada y pescado, con cada punto de cocción (de poco hecho a muy hecho) en grados Celsius y Fahrenheit y la temperatura mínima segura recomendada por el USDA para evitar riesgos alimentarios.',
  url: 'https://meskeia.com/temperatura-coccion-carne/',
  features: [
    'Puntos de cocción con su temperatura interna en °C y °F',
    'Temperatura mínima segura del USDA por alimento',
    'Vacuno, cordero, cerdo, aves, carne picada y pescado',
    'Aviso de los puntos por debajo del mínimo seguro',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A qué temperatura interna está hecho el pollo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pollo y el resto de aves deben alcanzar 74 °C (165 °F) en su parte más gruesa para ser seguros. No hay un punto "poco hecho" admisible en las aves: el jugo debe salir transparente y la carne quedar blanca y firme. Conviene medir con termómetro en la zona más gruesa, sin tocar el hueso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la temperatura mínima segura de la carne?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según el USDA, las piezas enteras de vacuno, cordero, cerdo y pescado son seguras a 63 °C (145 °F) con 3 minutos de reposo; la carne picada a 71 °C (160 °F) y las aves a 74 °C (165 °F). Por debajo de esos valores hay riesgo de patógenos, especialmente para embarazadas, niños, mayores e inmunodeprimidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué temperatura tiene un filete al punto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En vacuno, "al punto" (medium) corresponde a unos 63 °C, con la carne de un rosado claro. "Poco hecho" ronda los 52 °C y "muy hecho" los 72 °C o más. Ten en cuenta que los puntos poco hecho y al punto menos quedan por debajo del mínimo seguro del USDA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la carne picada y el pollo no pueden quedar poco hechos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque sus posibles patógenos no están solo en la superficie. En la carne picada, al triturarla, los microorganismos de fuera se reparten por todo el interior, así que debe cocinarse entera al mínimo seguro. En las aves, la contaminación puede estar en toda la pieza. En cambio, un filete entero sellado por fuera tiene el interior más protegido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hace falta dejar reposar la carne tras cocinarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, en piezas enteras conviene un reposo de unos 3 minutos: la temperatura sigue subiendo un poco por inercia (cocción residual) y los jugos se redistribuyen, dejando la carne más jugosa. Ese reposo también forma parte de la recomendación de seguridad del USDA para vacuno, cerdo y cordero.',
      },
    },
  ],
};
