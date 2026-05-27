import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';

export const jsonLd = generateWebAppSchema({
  name: 'Recordatorio Visual de Medicación',
  description: 'Organiza y recuerda tus medicamentos con pictogramas visuales. Configura horarios, dosis y recibe alertas. Para personas con discapacidad cognitiva, autismo, TDAH o mayores. Sin registro, 100% local.',
  url: 'https://meskeia.com/recordatorio-medicacion/',
  category: 'UtilityApplication',
  features: [
    'Gestión de medicamentos con pictogramas visuales',
    'Configuración de horarios y dosis personalizados',
    'Alertas recordatorio para cada toma',
    'Funciona sin conexión a internet ni registro',
    'Datos almacenados únicamente en el dispositivo del usuario',
  ],
});

export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/recordatorio-medicacion/',
  mainEntity: [
    {
      question: '¿Por qué es tan importante no olvidar la medicación y cuáles son los riesgos?',
      answer: 'Olvidar la medicación es uno de los problemas de salud más frecuentes y con mayores consecuencias en la práctica clínica. Según la Organización Mundial de la Salud, la falta de adherencia al tratamiento farmacológico es una de las principales causas de hospitalizaciones evitables y de empeoramiento de enfermedades crónicas. En condiciones como la epilepsia, la hipertensión, la diabetes o la esquizofrenia, una sola dosis olvidada puede desencadenar una crisis o una descompensación grave. En personas mayores, que suelen tomar varios medicamentos a la vez (polifarmacia), la complejidad de los horarios aumenta el riesgo de omisiones o de tomas dobles accidentales. Las personas con deterioro cognitivo, discapacidad intelectual o dificultades de atención son especialmente vulnerables a este problema, lo que hace imprescindible contar con sistemas de apoyo visual y recordatorio.',
    },
    {
      question: '¿Cómo ayuda esta herramienta a personas mayores con problemas de memoria?',
      answer: 'Las personas mayores enfrentan con frecuencia dos dificultades simultáneas: la disminución de la memoria a corto plazo y la gestión de múltiples medicamentos con horarios distintos. Esta herramienta aborda ambos problemas mediante una interfaz sencilla que no requiere conocimientos tecnológicos avanzados. Cada medicamento se representa con un pictograma visual que facilita el reconocimiento inmediato sin necesidad de leer etiquetas o nombres complejos. Los recordatorios sonoros y visuales actúan como señales externas que suplen la memoria interna cuando esta falla. Además, el registro de tomas completadas permite que tanto la persona como sus cuidadores o familiares comprueben si se ha seguido correctamente la pauta médica, reduciendo la ansiedad asociada a la duda de si se ha tomado o no el medicamento.',
    },
    {
      question: '¿Qué ventaja tienen los pictogramas frente al texto para personas con dificultades cognitivas?',
      answer: 'Los pictogramas son representaciones gráficas estandarizadas que transmiten información de forma universal, sin depender de la capacidad lectora ni del dominio del idioma. Para personas con discapacidad intelectual, autismo o baja alfabetización, el texto escrito puede resultar una barrera significativa que impide la comprensión autónoma de las instrucciones médicas. Los pictogramas, en cambio, se procesan de forma más rápida e intuitiva por el cerebro y generan una asociación directa entre la imagen y la acción requerida. En el contexto de la medicación, un pictograma claro del medicamento junto a un icono del sol (mañana) o la luna (noche) transmite de manera inequívoca cuándo debe tomarse cada pastilla. Esto promueve la autonomía, reduce la dependencia de terceros y disminuye los errores de administración causados por malentendidos del lenguaje escrito.',
    },
    {
      question: '¿En qué se diferencia esta herramienta de una app de pastillero tradicional?',
      answer: 'Las aplicaciones de pastillero tradicionales están diseñadas principalmente para usuarios sin dificultades cognitivas o de accesibilidad. Suelen requerir registro con correo electrónico, sincronización en la nube, configuraciones técnicas complejas o interfaces sobrecargadas de opciones que pueden resultar confusas. Esta herramienta se diferencia en varios aspectos clave: no requiere registro ni cuenta de usuario, funciona completamente sin conexión a internet, utiliza pictogramas como elemento central de la interfaz para maximizar la accesibilidad visual, y está optimizada para perfiles con necesidades especiales como autismo, TDAH o discapacidad cognitiva. La simplicidad y la accesibilidad son los principios de diseño prioritarios, por encima de la cantidad de funcionalidades.',
    },
    {
      question: '¿Son privados mis datos de medicación? ¿Se envían a algún servidor?',
      answer: 'Todos los datos introducidos en esta herramienta se almacenan exclusivamente en el dispositivo del propio usuario, utilizando el almacenamiento local del navegador (localStorage). No se transmite ningún dato a servidores externos ni a la plataforma meskeIA. Esto significa que la información sobre los medicamentos, horarios y dosis es completamente privada y solo accesible desde el dispositivo en el que se configuró. Al no requerir registro ni cuenta de usuario, no existe ninguna base de datos remota que pueda ser comprometida. Como consecuencia de este diseño orientado a la privacidad, los datos no están disponibles en otros dispositivos ni se recuperan si se borra el almacenamiento del navegador, por lo que se recomienda no depender exclusivamente de esta herramienta para tratamientos críticos sin una copia de respaldo de la pauta médica.',
    },
  ],
});

export const metadata: Metadata = {
  title: 'Recordatorio Visual de Medicación - Gestión de Pastillas | meskeIA',
  description: 'Organiza y recuerda tus medicamentos con pictogramas visuales. Configura horarios, dosis y recibe alertas. Para personas con discapacidad cognitiva, autismo, TDAH o mayores. Sin registro, 100% local.',
  keywords: 'recordatorio medicacion, pastillero visual, gestión medicamentos, autismo medicacion, discapacidad cognitiva pastillas, TDAH medicacion, pictogramas medicamentos, alertas medicacion, mayores medicacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Recordatorio Visual de Medicación | meskeIA',
    description: 'Gestiona tus medicamentos con pictogramas y alertas visuales. Para personas con autismo, TDAH, discapacidad cognitiva y mayores.',
    url: 'https://meskeia.com/recordatorio-medicacion/',
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
    title: 'Recordatorio Visual de Medicación | meskeIA',
    description: 'Gestiona tus medicamentos con pictogramas y alertas visuales. Para personas con autismo, TDAH, discapacidad cognitiva y mayores.',
    images: ['https://meskeia.com/og-image.png']
  },
};
