import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cronómetro y Temporizador Online | meskeIA',
  description: 'Cronómetro online con vueltas, temporizador de cuenta atrás y alarma. Herramienta gratuita para medir tiempo en el móvil (celular), tableta u ordenador: entrenamientos, cocina y productividad.',
  keywords: 'cronometro online, temporizador, cuenta atras, stopwatch, timer, alarma, vueltas, laps, reloj, medidor tiempo, cronometro movil, cronometro celular',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cronómetro y Temporizador Online',
    description: 'Mide el tiempo con precisión. Cronómetro con vueltas y temporizador con alarma.',
    url: 'https://meskeia.com/cronometro/',
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
    title: 'Cronómetro y Temporizador | meskeIA',
    description: 'Cronómetro con vueltas y temporizador de cuenta atrás',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Cronómetro meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Cronómetro y Temporizador",
  description: "Cronómetro online con vueltas, temporizador de cuenta atrás y alarma. Herramienta gratuita para medir tiempo desde el móvil (celular), tableta u ordenador: entrenamientos, cocina y productividad.",
  url: "https://meskeia.com/cronometro/",
  category: 'UtilityApplication',
  features: [
    'Cronómetro con centésimas de segundo y horas a partir de 60 minutos',
    'Registro de vueltas con el tiempo acumulado y el parcial respecto a la anterior',
    'Pausa y reanudación sin perder la medición',
    'Mide bien aunque la pestaña quede en segundo plano',
    'Temporizador de cuenta atrás en horas, minutos y segundos',
    'Atajos de 1, 5, 10, 15 y 30 minutos y de 1 hora',
    'Círculo de progreso de la cuenta atrás',
    'Alarma sonora que se repite hasta cerrar el aviso de fin',
  ],
});

// FUENTE ÚNICA de la FAQ visible (page.tsx) y del FAQPage JSON-LD de abajo: hasta el 07/11/2026
// eran dos textos y se contradecían (Date.now() frente a performance.now(); pausa larga del
// Pomodoro de 20-30 frente a 15-30 minutos). Hallazgo 4152.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Qué diferencia hay entre un cronómetro y un temporizador?',
    answer:
      'Un cronómetro mide el tiempo transcurrido desde que pulsas Iniciar, útil para saber cuánto dura una actividad. Un temporizador cuenta hacia atrás desde un tiempo fijado y hace sonar una alarma al llegar a cero. El cronómetro sirve para entrenamientos o carreras; el temporizador, para la cocina o la técnica Pomodoro.',
  },
  {
    question: '¿Qué precisión tiene el cronómetro?',
    answer:
      'Calcula el tiempo con Date.now(), el reloj del sistema, que da milisegundos; en pantalla se muestran centésimas. Las pausas y las vueltas toman la hora exacta del clic, así que pausar varias veces no acumula error. La precisión real depende también de la carga del dispositivo. Para competiciones oficiales hace falta un cronómetro homologado por la federación correspondiente.',
  },
  {
    question: '¿Para qué sirven las vueltas?',
    answer:
      'El botón Vuelta guarda el tiempo acumulado en ese instante sin detener el cronómetro y calcula la diferencia con la vuelta anterior. Así ves a la vez el tiempo total y el de cada intervalo: cada vuelta en la pista, cada largo en la piscina o cada tarea de una sesión de trabajo.',
  },
  {
    question: '¿Se para si cambio de pestaña o bloqueo el móvil?',
    answer:
      'El cronómetro no pierde tiempo: los navegadores reducen la frecuencia de actualización de las pestañas en segundo plano, pero el tiempo se calcula con Date.now() y no contando ticks, así que al volver la cifra es la correcta. En el temporizador, en cambio, la alarma puede no sonar hasta que vuelvas a la página si el móvil ha suspendido el navegador: en una cuenta atrás, mantén la pantalla encendida.',
  },
  {
    question: '¿Cómo uso el cronómetro o el temporizador para la técnica Pomodoro?',
    answer:
      'La técnica Pomodoro alterna 25 minutos de trabajo con 5 de descanso, y tras cuatro ciclos hace una pausa larga de 15-30 minutos. Con el temporizador, ponlo en 25 minutos y descansa cuando suene la alarma. Con el cronómetro, pulsa Vuelta al terminar cada bloque de trabajo y Pausar durante el descanso; para seguir, pulsa Iniciar, no Reiniciar, que borra las vueltas: así el historial lleva la cuenta de los ciclos completados.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
