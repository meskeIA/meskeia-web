import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Circuitos Electrónicos: R, L, C, Transistores y Puertas Lógicas — meskeIA',
  description: 'Visualizador interactivo de circuitos electrónicos. Aprende cómo funcionan resistores, inductores y condensadores, el transistor BJT como interruptor y amplificador, puertas lógicas AND/OR/NOT/NAND y la jerarquía del transistor al chip.',
  keywords: [
    'circuitos electrónicos interactivos',
    'resistor inductor condensador RLC',
    'transistor BJT NPN interruptor amplificador',
    'puertas lógicas AND OR NOT NAND NOR XOR',
    'circuito RC carga descarga',
    'tabla de verdad puertas lógicas',
    'del transistor al chip procesador',
    'half adder suma binaria',
    'ley de Moore transistores',
    'electrónica digital analógica educación',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Circuitos Electrónicos: R, L, C, Transistores y Puertas Lógicas — meskeIA',
    description: 'Explora la electrónica desde sus fundamentos. Visualiza componentes R/L/C, simula un transistor BJT, juega con puertas lógicas y descubre cómo 50.000 millones de transistores forman un procesador moderno.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-circuitos-electronicos/',
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
    title: 'Circuitos Electrónicos: de la física al chip',
    description: 'Visualizador interactivo: R/L/C, transistor BJT, puertas lógicas y la jerarquía del transistor al procesador.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Circuitos Electrónicos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Circuitos Electrónicos: R, L, C, Transistores y Puertas Lógicas',
  description: 'Visualizador interactivo de electrónica: componentes pasivos R/L/C con gráficas de impedancia, circuito RC con curva de carga, transistor BJT en modo interruptor y amplificador, puertas lógicas IEEE con tablas de verdad, y jerarquía del transistor al chip moderno.',
  url: 'https://meskeia.com/visualizador-circuitos-electronicos/',
  category: 'EducationalApplication',
  features: [
    'Componentes R, L, C: símbolos SVG, leyes (V=IR, V=L·dI/dt, I=C·dV/dt) y gráficas de impedancia',
    'Circuito RC: sliders de R y C, cálculo de τ=RC y frecuencia de corte, curva de carga SVG',
    'Transistor BJT NPN: modo interruptor con umbral V_BE=0.7V y modo amplificador con ganancia β',
    'Puertas lógicas AND/OR/NOT/NAND/NOR/XOR/XNOR: símbolos IEEE, tablas de verdad y toggles interactivos',
    'Half adder: suma de 1 bit con XOR+AND, muestra suma y acarreo',
    'Jerarquía del chip: de transistor MOSFET a puerta CMOS a flip-flop a registro de 8 bits',
    'Timeline de densidad de transistores: Intel 4004 (1971) a Apple M2 (2023)',
    'Sin dependencias externas — todo calculado en el navegador',
    'Gratuito, sin registro, disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona un transistor BJT como interruptor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un transistor BJT NPN actúa como interruptor cuando la tensión base-emisor supera aproximadamente 0,7 V: en ese momento la corriente de base satura el transistor y permite que circule corriente entre colector y emisor (estado ON). Por debajo de ese umbral el transistor está en corte y no conduce (estado OFF). Este principio es la base de toda la electrónica digital: miles de millones de transistores conmutando a velocidades de gigahercios forman los procesadores modernos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la constante de tiempo τ en un circuito RC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La constante de tiempo τ = R·C determina la velocidad de carga y descarga de un condensador. Tras un tiempo τ el condensador ha alcanzado el 63,2 % de la tensión final; tras 5τ se considera prácticamente cargado al 99,3 %. Valores altos de R o C producen cargas lentas y se usan en filtros de baja frecuencia; valores bajos permiten respuestas rápidas y filtros de alta frecuencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una puerta NAND y una puerta AND?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La puerta AND produce salida 1 solo cuando todas sus entradas son 1. La puerta NAND es su complementaria: produce 0 solo cuando todas las entradas son 1 y 1 en cualquier otro caso. La NAND es especialmente importante porque es una puerta lógica universal: cualquier función booleana puede implementarse usando únicamente puertas NAND, lo que simplifica el diseño de circuitos integrados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo pasa un transistor a ser un procesador con miles de millones de transistores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La jerarquía va de menor a mayor complejidad: transistores MOSFET forman puertas lógicas CMOS, las puertas forman flip-flops (biestables), los flip-flops forman registros y contadores, y estos se combinan en unidades aritméticas (ALU), cachés y núcleos de procesamiento. Un procesador moderno como el Apple M2 integra más de 20.000 millones de transistores en un chip de apenas 5 nm de proceso litográfico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este visualizador de circuitos electrónicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es ideal para estudiantes de Bachillerato tecnológico, Formación Profesional en electrónica o primeros cursos de ingeniería que quieran entender los fundamentos antes de trabajar con circuitos reales. También sirve a personas curiosas que quieren comprender qué hay dentro de un teléfono o un ordenador. No se necesita instalar ningún software ni tener conocimientos previos de electrónica.',
      },
    },
  ],
};
