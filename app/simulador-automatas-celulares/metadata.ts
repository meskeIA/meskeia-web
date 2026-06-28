import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego de la Vida de Conway y Autómatas Celulares | meskeIA',
  description:
    'Simulador interactivo del Juego de la Vida de Conway (reglas B3/S23) y generación procedimental de cuevas con autómatas celulares. Pinta células vivas con clic o arrastre, reproduce generaciones, carga patrones clásicos (planeador, oscilador, nave LWSS, cañón de planeadores) y observa cómo emergen estructuras complejas a partir de reglas locales simples.',
  keywords:
    'juego de la vida, Conway, autómatas celulares, cellular automata, generación procedimental, cuevas, emergencia, comportamiento emergente, planeador glider, oscilador, cañón de planeadores, procgen, programación de videojuegos, vecindad de Moore, B3/S23',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-automatas-celulares/',
  },
  openGraph: {
    type: 'website',
    title: 'Juego de la Vida de Conway y Autómatas Celulares | meskeIA',
    description:
      'Simula el Juego de la Vida de Conway y genera cuevas procedurales con autómatas celulares: patrones clásicos, reglas locales y comportamiento emergente paso a paso.',
    url: 'https://meskeia.com/simulador-automatas-celulares/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juego de la Vida de Conway y Autómatas Celulares | meskeIA',
    description:
      'Reglas locales simples, comportamiento emergente: el Juego de la Vida de Conway y la generación de cuevas procedurales',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Juego de la Vida de Conway y Autómatas Celulares',
  description:
    'Simulador interactivo del Juego de la Vida de Conway (B3/S23) y de generación procedimental de cuevas con autómatas celulares. Pinta células vivas sobre una rejilla, reproduce generaciones a velocidad ajustable, carga patrones clásicos (planeador, oscilador, nave ligera, cañón de planeadores) y siembra cuevas aleatorias que se suavizan con la regla del autómata. Ideal para entender la emergencia, los sistemas complejos y la generación procedimental en videojuegos.',
  url: 'https://meskeia.com/simulador-automatas-celulares/',
  category: 'EducationalApplication',
  features: [
    'Modo Juego de la Vida de Conway (reglas B3/S23)',
    'Modo generación de cuevas procedurales (suavizado por autómata celular)',
    'Rejilla editable: pinta células con clic o arrastre',
    'Patrones clásicos: planeador, oscilador, nave LWSS, bloque y cañón de planeadores',
    'Reproducir, pausar, paso a paso, limpiar y aleatorio',
    'Sliders de velocidad y densidad inicial',
    'Contadores de generación y células vivas',
    'En español',
  ],
  keywords: [
    'juego de la vida',
    'Conway',
    'autómatas celulares',
    'generación procedimental',
    'comportamiento emergente',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Juego de la Vida de Conway?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Juego de la Vida es un autómata celular ideado por el matemático John Conway en 1970. Sobre una rejilla, cada célula está viva o muerta y evoluciona a la siguiente generación según cuántas de sus 8 vecinas (vecindad de Moore) estén vivas: una célula viva sobrevive con 2 o 3 vecinas, una muerta nace con exactamente 3, y en cualquier otro caso muere o sigue muerta. No tiene jugador: a partir de un estado inicial todo evoluciona solo. Estas reglas se resumen como B3/S23 (nace con 3, sobrevive con 2 o 3).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se dice que el Juego de la Vida tiene comportamiento emergente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque a partir de unas reglas locales muy simples, aplicadas a cada célula mirando solo a sus vecinas, surgen estructuras complejas y globales que nadie programó explícitamente: figuras estables (bloques), osciladores que parpadean, naves que se desplazan por la rejilla (planeadores) e incluso cañones que disparan planeadores sin parar. Esa aparición de orden y estructura a gran escala desde reglas simples es lo que se llama emergencia, un fenómeno clave en el estudio de los sistemas complejos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se generan cuevas con autómatas celulares en videojuegos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se parte de una rejilla rellenada al azar (por ejemplo un 45% de células son roca) y se aplican varias iteraciones de una regla de suavizado: cada celda se convierte en roca si tiene 5 o más vecinas roca, y en hueco si tiene menos. Tras unos pocos pasos, el ruido aleatorio inicial se agrupa en cavernas conectadas con paredes orgánicas. Es una técnica de generación procedimental muy usada para crear mazmorras y cuevas naturales, rápida de implementar y con resultados controlables mediante la densidad inicial y el número de iteraciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un planeador (glider) y un cañón de planeadores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un planeador es un patrón de cinco células que, al aplicar las reglas del Juego de la Vida, reaparece desplazado una casilla en diagonal cada cuatro generaciones: parece deslizarse por la rejilla. El cañón de planeadores de Gosper es una configuración mayor que vuelve a su forma periódicamente y, en cada ciclo, expulsa un nuevo planeador, generando un flujo infinito de ellos. Fue el primer patrón conocido de crecimiento ilimitado y demostró que el Juego de la Vida puede producir poblaciones que crecen sin fin.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Juego de la Vida es realmente un juego?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No en el sentido habitual: no hay jugador, ni objetivos, ni victoria. Es un juego "de cero jugadores": la única decisión es elegir el estado inicial, y a partir de ahí la evolución es totalmente determinista. Su interés es matemático y computacional. De hecho, está demostrado que el Juego de la Vida es Turing-completo, lo que significa que con la configuración adecuada puede simular cualquier cálculo que haga un ordenador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la regla de Conway y la regla de cuevas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas son autómatas celulares con vecindad de Moore, pero usan umbrales distintos. Conway (B3/S23) está afinada para producir vida dinámica: patrones que se mueven, oscilan y mueren, con un equilibrio inestable. La regla de cuevas (un suavizado tipo B5678/S45678) refuerza las mayorías: las zonas densas se vuelven más densas y las dispersas se vacían, de modo que el ruido aleatorio se condensa en masas compactas y huecos limpios. Por eso una sirve para simular vida y la otra para esculpir terreno.',
      },
    },
  ],
};
