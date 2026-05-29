import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Alzheimer y Parkinson: Mecanismo Neurobiológico — meskeIA',
  description: 'Visualizador de la neurobiología molecular del Alzheimer y el Parkinson. Placas amiloides (APP/Aβ), ovillos de Tau, α-sinucleína, cuerpos de Lewy y circuito dopaminérgico. Sin síntomas ni diagnóstico.',
  keywords: ['Alzheimer mecanismo molecular beta-amiloide', 'proteína Tau ovillos neurofibrilares', 'APP beta-secretasa cascada amiloide', 'Parkinson alfa-sinucleína cuerpos Lewy', 'sustancia negra dopamina nigroestriada', 'ganglios basales circuito motor dopamina', 'hipótesis cascada amiloide', 'neurobiología enfermedades neurodegenerativas'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Alzheimer y Parkinson: Mecanismo Neurobiológico — meskeIA',
    description: 'Qué ocurre molecularmente en el cerebro en el Alzheimer (Aβ/Tau) y el Parkinson (α-sinucleína/dopamina).',
    type: 'website',
    url: 'https://meskeia.com/visualizador-alzheimer-parkinson/',
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
    title: 'Alzheimer y Parkinson: Mecanismo Neurobiológico',
    description: 'Placas amiloides, ovillos de Tau, α-sinucleína y circuito dopaminérgico — neurobiología molecular explicada.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Alzheimer Parkinson Neurobiología meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Alzheimer y Parkinson: Mecanismo Neurobiológico',
  description: 'Visualizador de la neurobiología molecular del Alzheimer (APP, Aβ, Tau, cascada amiloide) y el Parkinson (α-sinucleína, cuerpos de Lewy, circuito nigroestriado y ganglios basales). Enfoque educativo molecular, sin síntomas ni diagnóstico.',
  url: 'https://meskeia.com/visualizador-alzheimer-parkinson/',
  category: 'EducationalApplication',
  features: [
    'Procesamiento APP: vía normal vs amiloidogénica (SVG interactivo)',
    'Proteína Tau normal vs hiperfosforilada y ovillos neurofibrilares',
    'Hipótesis de la cascada amiloide con diagrama de flujo',
    'Vía nigroestriada y pérdida de dopamina en Parkinson',
    'α-sinucleína y cuerpos de Lewy (SVG)',
    'Circuito de ganglios basales: vía directa vs indirecta',
    'Funciona 100% en el navegador, sin registro',
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
      name: '¿Qué diferencia hay entre el Alzheimer y el Parkinson a nivel molecular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aunque ambas son enfermedades neurodegenerativas, sus mecanismos moleculares son distintos. El Alzheimer se caracteriza por la acumulación de placas de beta-amiloide (Aβ) extracelulares, derivadas del procesamiento anómalo de la proteína APP, y por los ovillos neurofibrilares de proteína Tau hiperfosforilada en el interior neuronal. El Parkinson, en cambio, implica la acumulación de α-sinucleína mal plegada formando los cuerpos de Lewy, con pérdida específica de neuronas dopaminérgicas en la sustancia negra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la hipótesis de la cascada amiloide en el Alzheimer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hipótesis de la cascada amiloide propone que el evento iniciador del Alzheimer es la acumulación anormal de beta-amiloide (Aβ) en el cerebro, resultado del procesamiento de APP por las enzimas beta y gamma-secretasa en lugar de la vía no amiloidogénica (alfa-secretasa). Este Aβ se agrega en oligómeros tóxicos y placas que desencadenan la hiperfosforilación de Tau, disfunción sináptica, neuroinflamación y muerte neuronal progresiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se pierden neuronas dopaminérgicas en el Parkinson?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el Parkinson, la α-sinucleína adopta una conformación mal plegada que se agrega formando estructuras llamadas cuerpos de Lewy dentro de las neuronas. Estas neuronas afectadas son principalmente las dopaminérgicas de la sustancia negra (pars compacta), que proyectan sus axones al estriado formando la vía nigroestriada. Su degeneración reduce drásticamente los niveles de dopamina en el circuito de los ganglios basales, alterando el control del movimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este visualizador de Alzheimer y Parkinson?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está dirigido a estudiantes de Biología, Medicina, Farmacia, Neurociencias y afines que deseen entender los mecanismos moleculares de ambas enfermedades. También es útil para profesionales de la salud que quieran refrescar conceptos de neurobiología molecular o para divulgadores científicos. El contenido es exclusivamente educativo: no incluye información sobre síntomas, diagnóstico ni tratamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el circuito de los ganglios basales y por qué se altera en el Parkinson?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ganglios basales regulan el movimiento voluntario mediante dos vías opuestas: la vía directa (facilitadora del movimiento) y la vía indirecta (inhibidora). La dopamina proveniente de la sustancia negra activa la vía directa (receptores D1) e inhibe la indirecta (receptores D2), favoreciendo el movimiento fluido. En el Parkinson, la pérdida de dopamina desequilibra este circuito: la vía indirecta queda hiperactivada, inhibiendo el tálamo y reduciendo la activación cortical motora, lo que provoca bradicinesia y rigidez.',
      },
    },
  ],
};
