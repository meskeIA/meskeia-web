import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Lógica Secuencial: Biestables, Contadores y Registros | meskeIA',
  description: 'Simula biestables (flip-flops) D, JK, T y SR ciclo a ciclo, contadores binarios, registros de desplazamiento y una máquina de estados, con cronograma de señales en tiempo real. Para Bachillerato, FP, preparatoria y primeros cursos de universidad.',
  keywords: 'lógica secuencial, biestable, flip-flop, biestable JK, biestable tipo D, biestable T, biestable SR, contador binario, registro de desplazamiento, máquina de estados, cronograma, diagrama de tiempos, electrónica digital, compuertas lógicas, puertas lógicas, sistemas digitales, Bachillerato, preparatoria, FP informática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-logica-secuencial/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Lógica Secuencial: Biestables, Contadores y Registros | meskeIA',
    description: 'Dale al reloj y observa cómo evoluciona el circuito: biestables D, JK, T y SR, contador binario, registro de desplazamiento y máquina de estados, con cronograma en vivo.',
    url: 'https://meskeia.com/simulador-logica-secuencial/',
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
    title: 'Simulador de Lógica Secuencial: Biestables, Contadores y Registros | meskeIA',
    description: 'Biestables, contadores y registros ciclo a ciclo, con cronograma de señales generado en vivo.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Lógica Secuencial: Biestables, Contadores y Registros',
  description: 'Simulador interactivo de circuitos secuenciales síncronos. Permite avanzar el reloj pulso a pulso o en modo automático y observar la evolución de siete circuitos: biestables (flip-flops) tipo D, JK, T y SR, un contador binario de 4 bits con módulo y sentido configurables, un registro de desplazamiento de 4 bits y una máquina de estados detectora de la secuencia 101. Genera un cronograma (diagrama de tiempos) en vivo con todas las señales, muestra la tabla característica del circuito con la transición actual resaltada y avisa del estado prohibido del biestable SR. Pensado para estudiantes de electrónica digital y sistemas digitales de Bachillerato, FP, preparatoria y primeros cursos de universidad.',
  url: 'https://meskeia.com/simulador-logica-secuencial/',
  category: 'EducationalApplication',
  features: [
    'Cuatro biestables (flip-flops): D, JK, T y SR con su ecuación característica',
    'Contador binario de 4 bits con módulo (2-16) y sentido ascendente o descendente',
    'Registro de desplazamiento de 4 bits a derecha o izquierda con entrada serie',
    'Máquina de estados de Moore detectora de la secuencia 101 con solapamiento',
    'Reloj manual pulso a pulso o automático con velocidad regulable',
    'Cronograma (diagrama de tiempos) generado en vivo con los últimos 12 ciclos',
    'Tabla característica con la transición actual resaltada',
    'Aviso del estado prohibido S=1, R=1 en el biestable SR',
  ],
  keywords: ['lógica secuencial', 'biestable', 'flip-flop', 'contador binario', 'registro de desplazamiento', 'máquina de estados', 'cronograma', 'electrónica digital', 'sistemas digitales'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre lógica combinacional y lógica secuencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la lógica combinacional la salida depende únicamente de las entradas presentes: las mismas entradas dan siempre la misma salida, como en una puerta AND o en un sumador. En la lógica secuencial la salida depende de las entradas y del estado interno almacenado, es decir, de lo que ha pasado antes. Esa memoria la aportan los biestables, y por eso un contador puede responder de forma distinta al mismo pulso de reloj según el valor que guarde en ese momento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la ecuación característica de cada biestable (flip-flop)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El biestable D cumple Q(t+1) = D: copia la entrada en cada flanco activo. El biestable T cumple Q(t+1) = T ⊕ Q: conmuta cuando T=1 y mantiene el valor cuando T=0. El biestable JK cumple Q(t+1) = J·Q̄ + K̄·Q, lo que incluye los cuatro comportamientos posibles: mantener, poner a 0, poner a 1 y conmutar. El biestable SR cumple Q(t+1) = S + R̄·Q con la restricción S·R = 0, porque la combinación S=1 y R=1 es un estado prohibido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué S=1 y R=1 es un estado prohibido en el biestable SR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque S=1 ordena poner la salida a 1 y R=1 ordena ponerla a 0 al mismo tiempo, dos órdenes contradictorias. En la implementación con puertas NOR ambas salidas Q y Q̄ valdrían 0, rompiendo la relación de complementariedad que define el biestable, y al retirar las entradas el circuito evoluciona a un valor impredecible que depende de retardos físicos. El biestable JK resuelve exactamente ese hueco: la combinación J=1, K=1 no está prohibida, sino que hace conmutar la salida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un cronograma o diagrama de tiempos y cómo se lee?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cronograma representa el valor de cada señal digital a lo largo del tiempo como una onda cuadrada: nivel alto para el 1 lógico y nivel bajo para el 0. Se lee de izquierda a derecha, alineando verticalmente todas las señales sobre el mismo eje de tiempo. En un circuito síncrono la clave está en los flancos activos del reloj: en cada flanco se toman los valores que tienen las entradas justo en ese instante y se determina el estado siguiente, por lo que las salidas cambian escalonadamente ciclo a ciclo, no de forma continua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el módulo de un contador binario y cuántos biestables necesita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El módulo es el número de estados distintos por los que pasa el contador antes de repetirse: un contador módulo 10 recorre del 0 al 9 y vuelve al 0. El número de biestables necesarios es el menor n que cumple 2^n ≥ módulo, de modo que un contador módulo 10 necesita 4 biestables (2^4 = 16 ≥ 10) y desperdicia 6 combinaciones, que deben forzarse al valor inicial mediante detección y borrado. Con 4 biestables el módulo máximo es 16.',
      },
    },
  ],
};
