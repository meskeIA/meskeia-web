import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lector de Texto en Voz Alta - Text to Speech en español | meskeIA',
  description: 'Lee en voz alta cualquier texto en español con resaltado de palabras en tiempo real. Ajusta velocidad, tono y voz. Ideal para personas con discapacidad visual, dislexia o dificultades de lectura.',
  keywords: 'lector texto voz, text to speech, voz alta, leer texto, discapacidad visual, dislexia, accesibilidad, sintetizador voz, resaltado palabras, lectura asistida',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lector de Texto en Voz Alta | meskeIA',
    description: 'Pega cualquier texto y escúchalo en español con resaltado de palabras. Velocidad y tono ajustables. Gratis y sin registro.',
    url: 'https://meskeia.com/lector-texto-voz/',
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
    title: 'Lector de Texto en Voz Alta | meskeIA',
    description: 'Text-to-speech en español con resaltado de palabras en tiempo real. Gratis y sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Lector de Texto en Voz Alta',
  description: 'Lee en voz alta cualquier texto en español con resaltado de palabras en tiempo real. Ajusta velocidad, tono y voz. Ideal para personas con discapacidad visual, dislexia o dificultades de lectura.',
  url: 'https://meskeia.com/lector-texto-voz/',
  category: 'UtilityApplication',
  features: [
    'Lectura en voz alta de texto en español',
    'Resaltado de palabras en tiempo real',
    'Control de velocidad de lectura ajustable',
    'Ajuste de tono y volumen de la voz',
    'Compatible con múltiples voces del sistema',
    'Accesible para personas con discapacidad visual o dislexia',
    'Sin registro ni instalación requerida',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la tecnología text-to-speech (TTS) y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tecnología text-to-speech (TTS), o síntesis de voz a partir de texto, convierte texto escrito en habla audible de forma automática. Los motores modernos de TTS utilizan redes neuronales entrenadas con grandes volúmenes de voz humana grabada para generar audio que suena natural y fluido. El proceso implica analizar el texto (incluyendo puntuación, acentos y contexto), convertirlo en fonemas y finalmente sintetizar el audio correspondiente. Los navegadores web modernos como Chrome, Firefox o Edge incluyen la Web Speech API, que permite implementar TTS directamente en el navegador sin instalar software adicional, con soporte para múltiples idiomas y voces, incluyendo el español.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo ayuda el lector de texto a personas con dislexia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las personas con dislexia experimentan dificultades para decodificar el texto escrito, lo que hace que la lectura sea lenta, cansada o imprecisa. Un lector TTS con resaltado de palabras en tiempo real ofrece dos canales de información simultáneos: el auditivo y el visual, lo que facilita la comprensión lectora al reducir la carga cognitiva necesaria para descifrar las palabras. El resaltado permite seguir el ritmo de la lectura sin perder el hilo, mientras que escuchar la palabra correctamente pronunciada ayuda a reforzar la asociación entre grafemas y fonemas. También se puede reducir la velocidad de lectura para facilitar el seguimiento. Esta combinación convierte el TTS en una herramienta de apoyo educativo y de accesibilidad ampliamente recomendada para personas con dislexia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un lector de pantalla y un lector TTS como este?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un lector de pantalla (como NVDA, JAWS o VoiceOver) es un software de accesibilidad completo que interpreta toda la interfaz del sistema operativo y las aplicaciones: menús, botones, campos de formulario, notificaciones y contenido web. Está diseñado principalmente para personas con ceguera total o baja visión severa y requiere aprendizaje específico. Un lector TTS, en cambio, está orientado a convertir texto introducido o pegado en audio, con control visual sobre la lectura mediante resaltado de palabras. Es más accesible para usuarios con dislexia, TDAH, fatiga visual o dificultades de aprendizaje que ven bien pero necesitan apoyo en la lectura. Son herramientas complementarias, no sustitutivas entre sí.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la velocidad óptima de lectura para comprensión y aprendizaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La velocidad óptima de lectura TTS depende del objetivo y del perfil del usuario. Para comprensión profunda de textos complejos (académicos, técnicos o literarios), se recomienda una velocidad entre el 80% y el 100% de la velocidad normal de habla, equivalente a unas 130-160 palabras por minuto. Para revisión de textos conocidos o escucha de contenido ligero, velocidades del 150% al 200% permiten ahorrar tiempo sin perder comprensión significativa. Las personas con dislexia o dificultades de procesamiento auditivo suelen beneficiarse de velocidades más lentas, entre el 60% y el 80%. La recomendación general es comenzar a velocidad normal e ir ajustando progresivamente hasta encontrar el punto en que la comprensión se mantiene alta y la escucha resulta cómoda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede usar el lector TTS para estudiar y memorizar contenido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el lector TTS es una herramienta de estudio eficaz cuando se combina con otras técnicas de aprendizaje activo. Escuchar el contenido mientras se sigue visualmente el texto refuerza la memoria mediante codificación dual (auditiva y visual simultánea), lo que favorece la retención a largo plazo. Es especialmente útil para repasar apuntes, escuchar resúmenes, estudiar idiomas o revisar textos extensos cuando la fatiga visual impide leer cómodamente. Para maximizar el beneficio, se recomienda hacer pausas frecuentes para reflexionar sobre lo escuchado, tomar notas propias con las ideas clave y alternar la escucha pasiva con la lectura activa. El TTS también es válido para personas que aprenden mejor a través del canal auditivo (aprendices auditivos).',
      },
    },
  ],
};
