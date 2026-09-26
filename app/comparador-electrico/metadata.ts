import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { AYUDA_AUTO_PLUS_2026, MOVES_III_HISTORICO } from '@/data/fiscal';
import { formatDate, formatNumber, parseISODateLocal } from '@/lib';

// Cifras de la ayuda: del módulo de data/fiscal, nunca escritas a mano (hallazgos 1996 y 1997).
const euros = (x: number): string => `${formatNumber(x, 0)} €`;
const MAXIMO_TURISMO = euros(AYUDA_AUTO_PLUS_2026.maximo.turismo);
const FIN_MOVES = formatDate(parseISODateLocal(MOVES_III_HISTORICO.finalizado));
const DESDE_AUTO_PLUS = formatDate(parseISODateLocal(AYUDA_AUTO_PLUS_2026.matriculadosDesde));
const TOPE_PRECIO = euros(AYUDA_AUTO_PLUS_2026.precioMaxTurismoSinImpuestos);

export const metadata: Metadata = {
  title: 'Coche, Carro o Auto Eléctrico vs Gasolina: ¿Cuándo Compensa? Calculadora | meskeIA',
  description: 'Calcula el punto de equilibrio entre un coche (carro o auto) eléctrico y uno de gasolina. Introduce los precios, km anuales, consumos, la ayuda a la compra que te corresponda y el cargador. Muestra el año en que el eléctrico empieza a ser más barato.',
  keywords: [
    'eléctrico vs gasolina',
    'cuando compensa el eléctrico',
    'punto de equilibrio coche eléctrico',
    'carro eléctrico vs gasolina',
    'auto eléctrico vs gasolina',
    'cuando compensa el carro eléctrico',
    'cuando compensa el auto eléctrico',
    'ayuda compra coche eléctrico',
    'Programa Auto+',
    'ahorro coche eléctrico',
    'comparador eléctrico gasolina diesel',
    'coste eléctrico por kilómetro',
    'break even coche eléctrico España',
  ],
  openGraph: {
    title: '¿Cuándo compensa el eléctrico? Calculadora de break-even | meskeIA',
    description: 'Compara el coste total de un eléctrico vs gasolina en tu situación real. Incluye la ayuda a la compra, el cargador doméstico y una proyección de hasta 15 años.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/comparador-electrico/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Cuándo compensa el eléctrico? | meskeIA',
    description: 'Calcula el año exacto en que el coche eléctrico empieza a salirte más barato que la gasolina.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-electrico/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Comparador Eléctrico vs Combustión',
        description: 'Calculadora de punto de equilibrio entre un vehículo (coche, carro o auto) eléctrico y de combustión. Compara costes reales incluyendo precio de compra, ayuda pública a la compra, consumo eléctrico, precio de gasolina, cargador doméstico y proyección a N años.',
        url: 'https://meskeia.com/comparador-electrico/',
        features: [
          'Cálculo del año de break-even (punto de equilibrio)',
          'Proyección de ahorro acumulado a 5, 8, 10 y 15 años',
          'Campo para la ayuda pública a la compra que te corresponda',
          'Coste de instalación de cargador doméstico',
          'Tabla comparativa año a año',
          'Coste por kilómetro de cada opción',
          '100 % en el navegador, sin registro',
          'Gratuito y en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador Eléctrico vs Combustión",
  description: "Calcula el punto de equilibrio entre un coche (carro o auto) eléctrico y uno de gasolina. Introduce los precios, km anuales, consumos, la ayuda a la compra que te corresponda y el cargador. Muestra el año en que el eléctrico empieza a ser más barato",
  url: "https://meskeia.com/comparador-electrico/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo es más barato un coche (carro o auto) eléctrico que uno de gasolina en total?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El punto de equilibrio entre un eléctrico y un equivalente de gasolina depende de la diferencia al comprar (con el cargador doméstico y tras la ayuda que corresponda), de los kilómetros anuales y de lo que cuesta cada kilómetro en energía y mantenimiento. Con los datos de ejemplo de la calculadora (35.000 € frente a 25.000 €, 15.000 km al año, 16 kWh/100 km a 0,18 €/kWh, 7 l/100 km a 1,65 €/l, cargador de 800 €, mantenimiento de 800 € y 1.000 € al año, y sin ayuda), el eléctrico ahorra 1.500,50 € al año y recupera los 10.800 € de diferencia en el año 8. Con más kilómetros o una ayuda a la compra, el plazo se acorta; con electricidad cara, se alarga o no llega.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ayuda hay en España para comprar un coche eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El programa MOVES III terminó el ${FIN_MOVES}. Desde entonces rige el Programa Auto+ (Real Decreto 609/2026), para vehículos matriculados desde el ${DESDE_AUTO_PLUS}. A un turismo le da como máximo ${MAXIMO_TURISMO}, y la cuantía se forma sumando criterios: que sea eléctrico puro o electrificado, su precio sin impuestos (por encima de ${TOPE_PRECIO} no hay ayuda) y su fabricación europea. No tiene tramo por achatarramiento. La calculadora no la estima: pide la ayuda que te corresponda, con 0 por defecto, porque algunas condiciones no caben en un formulario y en otros países los programas son distintos.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta recargar un coche eléctrico en casa comparado con repostar gasolina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende sobre todo del precio del kWh que pagues. Un coche eléctrico que consume 15 kWh/100 km, cargado a 0,18 €/kWh, gasta 2,70 € cada 100 km. Un gasolina que consume 6 l/100 km a 1,60 €/l gasta 9,60 €. La diferencia, 6,90 € cada 100 km, supone unos 1.035 € al año para 15.000 km, solo en energía. En un punto de carga rápida el kWh puede costar varias veces más que en casa, y esa ventaja se reduce o desaparece: conviene hacer la cuenta con tu precio real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los coches eléctricos tienen menos gastos de mantenimiento que los de gasolina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, de forma significativa. Los vehículos eléctricos no requieren cambios de aceite, filtros de aceite ni de combustible, correa de distribución, embrague ni catalizador. Los frenos también duran más tiempo gracias al frenado regenerativo, que recupera energía y reduce el desgaste de pastillas. Cuánto se ahorra depende del modelo y del uso, así que la calculadora no lo da por hecho: pide el mantenimiento anual de cada coche para que pongas tus propias cifras o los presupuestos de tu taller.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Merece la pena instalar un cargador doméstico para el coche eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de dónde vayas a cargar si no lo instalas. Un cargador doméstico de 7,4 kW permite una carga completa durante la noche, frente a las muchas horas que necesita un enchufe convencional. Su coste de instalación se paga al comprar y varía con la distancia al cuadro eléctrico y el tipo de garaje, así que conviene pedir presupuesto. En la calculadora cuenta entero desde el primer año, y puedes comparar dos escenarios: con cargador y electricidad de tarifa doméstica, o sin él y el precio del kWh de la carga pública. Sin plaza de garaje propia, la viabilidad depende del acceso a carga en el trabajo o en la vía pública.',
      },
    },
  ],
};
