import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Revisor de Lectura Fácil: qué frase falla y por qué | meskeIA',
  description: 'Pega un texto y marca frase a frase qué incumple las pautas de lectura fácil: oraciones largas, voz pasiva, tecnicismos, siglas, cifras complejas y lenguaje figurado, con alternativa concreta.',
  keywords: 'lectura facil, revisor lectura facil, adaptar texto a lectura facil, accesibilidad cognitiva, texto facil de leer, une 153101, lenguaje claro, lenguaje llano, simplificar textos, discapacidad intelectual, comprension lectora, voz pasiva, tecnicismos, siglas, redaccion accesible',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/revisor-lectura-facil/',
  },
  openGraph: {
    type: 'website',
    title: 'Revisor de Lectura Fácil: qué frase falla y por qué | meskeIA',
    description: 'No devuelve una nota: señala la frase concreta, la regla que incumple y por qué alternativa cambiarla. El texto no sale de tu navegador.',
    url: 'https://meskeia.com/revisor-lectura-facil/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revisor de Lectura Fácil: qué frase falla y por qué | meskeIA',
    description: 'Trece comprobaciones sobre tu texto, frase a frase, con la regla citada y una alternativa concreta.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Revisor de Lectura Fácil meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Revisor de Lectura Fácil',
  description: 'Analizador de textos que aplica trece comprobaciones inspiradas en las pautas de lectura fácil (UNE 153101:2018 EX, Inclusion Europe e IFLA): longitud de frase, voz pasiva, tecnicismos, siglas sin explicar, cifras complejas, lenguaje figurado, dobles negaciones y extranjerismos. Señala la frase concreta y propone una alternativa. Todo el análisis ocurre en el navegador.',
  url: 'https://meskeia.com/revisor-lectura-facil/',
  category: 'UtilityApplication',
  features: [
    'Análisis frase a frase con la regla incumplida citada por su nombre',
    'Diccionario de tecnicismos administrativos con su alternativa en lenguaje claro',
    'Detección de voz pasiva, pasiva refleja y dobles negaciones',
    'Aviso de siglas y abreviaturas sin explicar la primera vez',
    'Métricas de legibilidad: frases conformes, media de palabras por frase, palabras largas',
    'Filtro por tipo de aviso para revisar una regla cada vez',
    'Informe de texto copiable para compartir con el equipo de redacción',
    'El texto se analiza en el navegador y no se envía a ningún servidor',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la lectura fácil y en qué se diferencia del lenguaje claro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lectura fácil es un método de redacción y diseño para que un texto sea comprensible por personas con dificultades de comprensión lectora: discapacidad intelectual, deterioro cognitivo, afasia, personas que aprenden el idioma o con baja alfabetización. El lenguaje claro es más amplio y busca que cualquier lector medio entienda un texto a la primera. La lectura fácil es más exigente: limita la longitud de las frases, evita las metáforas, explica cada palabra difícil y exige una maquetación concreta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas palabras debe tener una frase en lectura fácil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La referencia habitual es no pasar de 15 palabras por frase y expresar una sola idea en cada una. No es un límite matemático: una frase de 18 palabras con estructura sencilla puede leerse mejor que una de 12 llena de subordinadas. Por eso esta herramienta avisa a partir de 15 palabras y marca como grave a partir de 25, pero además señala aparte las frases que encadenan varias ideas aunque sean cortas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se desaconseja la voz pasiva en lectura fácil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque invierte el orden natural de la frase y esconde quién hace la acción. «La solicitud será revisada por el departamento» obliga al lector a reconstruir que es el departamento quien revisa. En voz activa —«el departamento revisa tu solicitud»— el sujeto aparece primero y la frase se entiende de una pasada. La pasiva refleja, del tipo «se revisarán las solicitudes», tiene el mismo problema y además borra al responsable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Una herramienta automática puede certificar que un texto es de lectura fácil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La norma UNE 153101:2018 EX establece que la validación la hacen personas con dificultades de comprensión, que leen el texto y confirman si lo entienden. Ningún programa sustituye ese paso. Lo que sí hace un revisor automático es ahorrar la parte mecánica: encontrar las frases largas, los tecnicismos y las siglas antes de llevar el texto a validación, para que la sesión con personas usuarias se dedique a lo que solo ellas pueden decir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué se hace con las cifras y los porcentajes en lectura fácil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se prefieren números redondos y expresiones cotidianas. En lugar de «el 73,5 % de los solicitantes», es preferible «casi todas las personas que lo piden». Los números romanos se sustituyen por arábigos, los decimales se evitan y las cantidades muy grandes se redondean o se comparan con algo conocido. Las fechas se escriben completas y en un solo formato a lo largo de todo el documento.',
      },
    },
  ],
};
