import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Ruido Blanco, Rosa y Marrón - Sonido para Dormir y Concentrarse - meskeIA',
  description:
    'Genera ruido blanco, rosa, marrón, azul y violeta sintetizado en tu navegador. Temporizador de apagado con fundido, control de tono y ambientes de lluvia, oleaje y ventilador. Sin descargas ni registro.',
  keywords:
    'ruido blanco, ruido rosa, ruido marrón, ruido browniano, sonido para dormir, generador ruido blanco online, enmascaramiento acústico, sonido para concentrarse, ruido para estudiar, temporizador sonido, sonido lluvia, ruido azul, ruido violeta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Ruido Blanco, Rosa y Marrón',
    description:
      'Cinco tipos de ruido sintetizados en tiempo real, con temporizador de apagado, fundido de salida y ambientes de lluvia, oleaje y ventilador. Todo en el navegador.',
    url: 'https://meskeia.com/generador-ruido-blanco/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Ruido Blanco, Rosa y Marrón',
    description:
      'Ruido blanco, rosa, marrón, azul y violeta sintetizados en el navegador, con temporizador y fundido de salida.',
  },
  other: {
    'application-name': 'Generador de Ruido Blanco meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Ruido Blanco, Rosa y Marrón',
  description:
    'Generador de ruido de banda ancha sintetizado en el navegador: blanco (espectro plano), rosa (−3 dB por octava), marrón (−6 dB por octava), azul (+3 dB por octava) y violeta (+6 dB por octava). Incluye temporizador de apagado con fundido de salida, control de tono y ambientes de lluvia, oleaje y ventilador. Útil para enmascarar ruido de fondo al dormir, estudiar o trabajar.',
  url: 'https://meskeia.com/generador-ruido-blanco/',
  category: 'UtilityApplication',
  features: [
    'Cinco tipos de ruido: blanco, rosa, marrón, azul y violeta',
    'Síntesis en tiempo real con Web Audio: no descarga ningún archivo de sonido',
    'Temporizador de apagado con fundido de salida configurable',
    'Ambientes derivados por filtrado: lluvia, oleaje, ventilador y cascada',
    'Control de tono continuo mediante filtro paso bajo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el ruido blanco, el rosa y el marrón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia está en cómo reparten la energía entre frecuencias. El blanco tiene la misma energía por hercio, así que se percibe agudo y siseante, parecido a una radio sin sintonizar. El rosa pierde 3 decibelios por octava y suena equilibrado, similar a la lluvia constante. El marrón o browniano pierde 6 decibelios por octava y se percibe grave y profundo, como un oleaje lejano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un generador de ruido blanco online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Esta herramienta no reproduce un archivo de audio grabado: sintetiza el ruido en tu propio dispositivo con la API Web Audio, generando muestras aleatorias y filtrándolas para conseguir cada pendiente espectral. Por eso no hay descarga previa, no se repite un bucle reconocible y funciona sin conexión una vez cargada la página.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué volumen conviene usar ruido blanco para dormir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo justo para tapar el ruido que molesta, sin más. Las guías de ruido nocturno de la OMS para Europa (2009) sitúan en torno a 30 dB(A) el nivel recomendable dentro del dormitorio. Un estudio de Hugh y colaboradores publicado en Pediatrics (2014) midió máquinas comerciales de ruido para bebés que superaban los 85 dB(A) a 30 cm en su volumen máximo, un nivel que no es seguro para una exposición de horas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El ruido blanco sirve realmente para dormir mejor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo que hace es enmascarar: sube el suelo de ruido de la habitación de forma constante, de modo que los sonidos bruscos (un portazo, tráfico, un vecino) destacan menos y despiertan menos. No es un tratamiento del insomnio. Las revisiones sistemáticas disponibles califican la evidencia sobre sueño como escasa y de baja calidad, con estudios pequeños y muy heterogéneos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son el ruido azul y el ruido violeta y para qué se usan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son los espejos del rosa y del marrón: en lugar de perder energía hacia los agudos, la ganan. El azul sube 3 decibelios por octava y el violeta 6, así que ambos suenan claramente sibilantes. Se emplean sobre todo en audio técnico, en el diseño de tramado o dithering y en pruebas de altavoces, no como sonido de fondo prolongado.',
      },
    },
  ],
};
