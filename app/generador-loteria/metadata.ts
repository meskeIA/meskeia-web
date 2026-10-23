import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { EXENCION_PREMIO_LOTERIA, TIPO_GRAVAMEN_PREMIO_LOTERIA, gravamenPremio } from '@/data/fiscal';
import { formatNumber, formatPercentage } from '@/lib';

/*
 * Las dos preguntas que la página publicaba dos veces, en UN solo sitio (hallazgo 3237).
 *
 * El FAQPage de abajo y la FAQ visible de `page.tsx` las redactaban aparte: «¿Usar un generador
 * aleatorio mejora mis probabilidades…?» frente a «¿Los números generados aleatoriamente tienen
 * más probabilidad de ganar?», y «¿Cómo se reparte un premio… en una peña…?» frente a «¿Cuánto se
 * lleva Hacienda…?», con ejemplos distintos y sin decir en el FAQPage que con la retención no hay
 * autoliquidación. No se contradecían, pero dos redacciones divergen en cuanto se toca una (como
 * en app/simulador-gastos-compraventa-garaje). Ahora las dos bocas importan estas constantes, en
 * texto plano: la respuesta de Hacienda es una lista de párrafos que el FAQPage une con espacios.
 *
 * Las cifras salen de data/fiscal/premios-loterias.ts (DA 33.ª de la Ley 35/2006).
 */
const eur = (n: number) => `${formatNumber(n, 0)} €`;
const TIPO = formatPercentage(TIPO_GRAVAMEN_PREMIO_LOTERIA, 0);
// Ejemplo de un premio grande jugado por una sola persona, con un décimo de 20 €
const EJ_PREMIO = 1_000_000;
const EJ_GRAVAMEN = gravamenPremio(EJ_PREMIO, 20);
// Ejemplo del reparto de una peña (S0180): 125.000 € entre tres que ponen 10, 5 y 5 €
const EJ_PENA_PREMIO = 125_000;
const EJ_PENA = gravamenPremio(EJ_PENA_PREMIO, 20);

export const PREGUNTA_ALEATORIO = '¿Usar un generador aleatorio mejora mis probabilidades en la lotería?';
export const RESPUESTA_ALEATORIO = 'No. Cada combinación posible tiene exactamente la misma probabilidad de salir premiada, la elijas tú, la genere un ordenador o la elija la máquina del sorteo. Un generador aleatorio no la mejora ni la empeora: sirve para ahorrar tiempo y evitar sesgos inconscientes al elegir los números. En La Primitiva, por ejemplo, hay 13.983.816 combinaciones posibles de 6 números, y cada una tiene la misma probabilidad de salir: 1 entre 13.983.816.';

export const PREGUNTA_HACIENDA = '¿Cuánto se lleva Hacienda de un premio de lotería en España y cómo se reparte en una peña?';
export const RESPUESTA_HACIENDA: readonly string[] = [
  `Los premios de las loterías del Estado tienen un gravamen especial del ${TIPO} sobre lo que pasa de ${eur(EXENCION_PREMIO_LOTERIA)}; hasta esa cifra están exentos. Por ejemplo, de un premio de ${eur(EJ_PREMIO)} tributan los ${eur(EJ_GRAVAMEN.base)} del exceso: ${eur(EJ_GRAVAMEN.retencion)} de impuesto. El tipo es fijo, no progresivo como el IRPF general, y la exención se cuenta por cada décimo o apuesta premiados, no una vez sobre el total.`,
  `Lo descuenta quien paga el premio: se cobra ya con la retención del ${TIPO}, y entonces no hay que presentar autoliquidación del gravamen. El premio tampoco se suma a la base del IRPF, así que no cambia el tipo del resto de tus ingresos.`,
  `En una peña, la exención y la retención de cada décimo se reparten según lo que puso cada uno. Por ejemplo, un décimo de ${eur(EJ_PENA_PREMIO)} jugado entre tres que ponen 10, 5 y 5 € deja ${eur(EJ_PENA.retencion)} de retención y ${eur(EJ_PENA.neto)} netos: ${eur(EJ_PENA.neto / 2)} para quien puso 10 € y ${eur(EJ_PENA.neto / 4)} para cada uno de los otros. El reparto de la peña de esta página lo calcula con lo que puso cada persona.`,
  `Referencia legal: disposición adicional 33.ª de la Ley 35/2006 del IRPF; el exento de ${eur(EXENCION_PREMIO_LOTERIA)} lo fijó la Ley 6/2018. Incluye también los premios de la ONCE, los sorteos de Cruz Roja y las loterías de las comunidades autónomas.`,
];

export const metadata: Metadata = {
  title: 'Generador Lotería: Primitiva, Euromillones, Bonoloto | meskeIA',
  description: 'Genera números aleatorios para Primitiva, Euromillones, Bonoloto, El Gordo de la Primitiva y Lototurf, guárdalos en tu navegador y compruébalos después con el resultado del sorteo y reparte el premio de una peña con la retención de Hacienda. Gratis y sin registro.',
  keywords: 'generador loteria, numeros primitiva, euromillones, bonoloto, el gordo, lototurf, numeros aleatorios, combinaciones loteria, numeros suerte, comprobar combinaciones, categorias de premio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-loteria/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Números de Lotería - Primitiva, Euromillones, Bonoloto',
    description: 'Genera combinaciones aleatorias para las principales loterías españolas. Gratis y sin registro.',
    url: 'https://meskeia.com/generador-loteria/',
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
    title: 'Generador de Números de Lotería',
    description: 'Genera números para Primitiva, Euromillones, Bonoloto y más',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Números de Lotería',
  description: 'Generador de combinaciones aleatorias para loterías españolas: Primitiva, Euromillones, Bonoloto, El Gordo de la Primitiva y Lototurf. Genera números al azar, con historial de la sesión, las combinaciones que quieras guardadas en el navegador y su comprobación frente al resultado del sorteo.',
  url: 'https://meskeia.com/generador-loteria/',
  category: 'UtilityApplication',
  features: [
    'Generador de números aleatorios para 5 loterías españolas',
    'Primitiva, Euromillones, Bonoloto, El Gordo de la Primitiva, Lototurf',
    'Múltiples combinaciones por sorteo',
    'Historial de combinaciones generadas',
    'Combinaciones guardadas en el navegador, sin cuenta ni registro',
    'Copiar cualquier combinación al portapapeles',
    'Comprobar las combinaciones guardadas con el resultado del sorteo: aciertos marcados y categoría de premio',
    'Reparto del premio de una peña según lo que puso cada persona, con la exención y la retención del gravamen especial por décimo',
  ],
  keywords: ['lotería', 'números aleatorios', 'Primitiva', 'Euromillones', 'Bonoloto'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos números hay que elegir en la Primitiva y en el Euromillones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la Primitiva se eligen 6 números del 1 al 49 y el Reintegro, un número del 0 al 9. El número complementario no lo elige el jugador: lo determina el propio sorteo entre las bolas no premiadas. En el Euromillones se eligen 5 números del 1 al 50 y 2 estrellas del 1 al 12. El generador produce automáticamente combinaciones válidas para cada modalidad respetando estos rangos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Genera números realmente aleatorios o usa algún patrón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los números se generan mediante algoritmos pseudoaleatorios del navegador, sin ningún patrón predefinido. Cada combinación es independiente de las anteriores. Ningún método de generación aleatoria puede predecir ni influir en los sorteos oficiales, que son completamente independientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve guardar el historial de combinaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El historial permite ver todas las combinaciones generadas en la sesión actual y evitar repetirlas si juegas varias apuestas distintas. El historial se borra al cerrar o recargar la página; las combinaciones que marques con la estrella sí se quedan guardadas en ese navegador, hasta 20.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo compruebo si mis combinaciones guardadas tienen premio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Debajo de las combinaciones guardadas hay un comprobador: se escribe la combinación ganadora que publica el sorteo (con el complementario y el reintegro en La Primitiva y la Bonoloto, las estrellas en Euromillones, la clave en El Gordo o el caballo en Lototurf) y cada combinación guardada de esa lotería sale con sus aciertos marcados y su categoría de premio. No muestra importes, porque dependen de lo recaudado y del número de acertantes, y es orientativo: lo que vale es el escrutinio oficial y el resguardo.',
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_ALEATORIO,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_ALEATORIO,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se genera una combinación de Euromillones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una combinación de Euromillones son 5 números del 1 al 50 más 2 estrellas del 1 al 12, y los dos bloques se sortean por separado. El generador produce ambos a la vez sin repetir números dentro de cada bloque. Acertar los 5 números y las 2 estrellas tiene una probabilidad de 1 entre 139.838.160, la misma que el bote de La Primitiva (los 6 números y el reintegro): son los dos botes más difíciles de las cinco loterías disponibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencian Bonoloto y La Primitiva al generar números?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En nada desde el punto de vista de la combinación: ambas son 6 números del 1 al 49 más el Reintegro, con la misma probabilidad de acertar los 6 (1 entre 13.983.816). Solo cambia el bote: el de La Primitiva exige además el reintegro (1 entre 139.838.160), y el de la Bonoloto, los 6 números. El resto de diferencias está fuera del bombo: la Bonoloto se sortea todos los días, de lunes a domingo, y la apuesta cuesta 0,50 €, mientras que La Primitiva se sortea los lunes, jueves y sábados a 1,00 € la apuesta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo generar combinaciones para Lototurf con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El generador incluye Lototurf, que consiste en 6 números del 1 al 31 más un caballo ganador del 1 al 12. Selecciona esta modalidad en el listado de loterías y genera tantas combinaciones aleatorias como necesites, igual que con el resto de loterías disponibles.',
      },
    },
    {
      '@type': 'Question',
      name: PREGUNTA_HACIENDA,
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_HACIENDA.join(' '),
      },
    },
  ],
};
