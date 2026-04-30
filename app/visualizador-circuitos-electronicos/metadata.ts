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
    url: 'https://meskeia.com/visualizador-circuitos-electronicos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Circuitos Electrónicos: de la física al chip',
    description: 'Visualizador interactivo: R/L/C, transistor BJT, puertas lógicas y la jerarquía del transistor al procesador.',
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
