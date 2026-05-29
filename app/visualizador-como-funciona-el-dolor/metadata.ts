import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el Dolor — Nocicepción y Tipos | meskeIA',
  description: 'Fisiología del dolor: las 4 fases (transducción, transmisión, modulación, percepción), tipos de dolor agudo, crónico y neuropático, y sensibilización central.',
  keywords: 'nocicepción, dolor crónico, dolor neuropático, sensibilización central, fibras A-delta, fibras C, teoría puerta, endorfinas, fisiología dolor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-como-funciona-el-dolor/',
  },
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el Dolor — Nocicepción y Tipos',
    description: 'De la lesión al cerebro: fisiología de la nocicepción, tipos de dolor y sensibilización central. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-como-funciona-el-dolor/',
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
    title: 'Cómo Funciona el Dolor — Explicador Visual',
    description: 'De la lesión al cerebro: las 4 fases del dolor, tipos y sensibilización central explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cómo Funciona el Dolor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el Dolor — Nocicepción y Tipos',
  description: 'Explicador visual interactivo sobre la fisiología del dolor: transducción, transmisión, modulación y percepción. Tipos de dolor agudo, crónico y neuropático. Sensibilización central y teoría de la puerta.',
  url: 'https://meskeia.com/visualizador-como-funciona-el-dolor/',
  category: 'EducationalApplication',
  features: [
    'Las 4 fases de la nocicepción con selector interactivo',
    'Tipos de dolor: agudo, crónico y neuropático',
    'Explicación de la sensibilización central',
    'Teoría de la puerta de Melzack & Wall',
    'Fibras A-delta y fibras C explicadas visualmente',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo viaja la señal de dolor desde una lesión hasta el cerebro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La señal de dolor recorre cuatro fases. Primero, la transducción: los nociceptores (terminaciones nerviosas especializadas) en el tejido lesionado convierten el estímulo dañino en una señal eléctrica. Luego, la transmisión: esa señal viaja por fibras nerviosas (A-delta para dolor agudo rápido; fibras C para dolor sordo y persistente) hasta el asta dorsal de la médula espinal. En la modulación, la médula puede amplificar o atenuar la señal antes de enviarla al cerebro. Finalmente, la percepción ocurre en la corteza cerebral, donde el dolor se vuelve consciente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre dolor agudo y dolor crónico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El dolor agudo es una señal de alarma con función biológica clara: avisa de una lesión o enfermedad y suele desaparecer cuando la causa se resuelve (generalmente en menos de 3 meses). El dolor crónico persiste más de 3 meses, a menudo después de que la lesión original ha sanado, y pierde su función protectora. Implica cambios neuroplásticos en el sistema nervioso central (sensibilización central) que hacen que el sistema de alarma quede "atrapado" en modo activo incluso sin estímulo dañino.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la sensibilización central y por qué ocurre en el dolor crónico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sensibilización central es un estado de hiperexcitabilidad del sistema nervioso central en el que las neuronas de la médula espinal y el cerebro responden de forma exagerada a estímulos que normalmente no serían dolorosos. Ocurre cuando el dolor agudo se mantiene durante mucho tiempo y el sistema nervioso literalmente se "recalibra" hacia una mayor sensibilidad. Se manifiesta como alodinia (dolor ante estímulos inofensivos como el roce) e hiperalgesia (respuesta exagerada a estímulos levemente dolorosos). Es un mecanismo clave en fibromialgia, cefaleas crónicas y dolor lumbar persistente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste la teoría de la puerta del dolor de Melzack y Wall?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Propuesta por Ronald Melzack y Patrick Wall en 1965, la teoría de la compuerta sostiene que en el asta dorsal de la médula espinal existe un mecanismo de "puerta" que puede abrir o cerrar el paso de señales de dolor al cerebro. Las fibras táctiles de gran diámetro (A-beta) pueden cerrar esa puerta e inhibir la transmisión del dolor, lo que explica por qué frotar la zona lesionada alivia el dolor. Esta teoría también explica la analgesia por estimulación eléctrica nerviosa transcutánea (TENS) y sigue siendo la base conceptual de muchas intervenciones analgésicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juegan las endorfinas en el alivio del dolor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las endorfinas son neuropéptidos opioides endógenos producidos por el propio organismo que se unen a los receptores opioides del cerebro y la médula espinal, inhibiendo la transmisión del dolor. Se liberan en respuesta al ejercicio intenso, el estrés, la risa o la acupuntura, entre otros. Los fármacos analgésicos opioides (morfina, codeína) imitan la acción de las endorfinas uniéndose a los mismos receptores. Además de reducir el dolor, las endorfinas producen sensación de bienestar y son parte del sistema de recompensa del cerebro.',
      },
    },
  ],
};
