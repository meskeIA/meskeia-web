import type { Metadata } from 'next';
import { CIUDADES, CESTA, buscarCiudad, cestaMensual, indiceDe, pesoAlquiler, type DatosCosteVida } from './ciudades';

export const metadata: Metadata = {
  title: 'Comparador de Coste de Vida (Costo de Vida) entre Ciudades del Mundo | meskeIA',
  description: 'Compara el coste de vida —o costo de vida— entre más de 55 ciudades: alquiler, restaurantes, supermercado, transporte e internet. Datos de referencia 2025-2026.',
  keywords: [
    'coste de vida',
    'costo de vida',
    'comparar costo de vida ciudades',
    'comparador ciudades',
    'vivir en el extranjero',
    'alquiler ciudad',
    'arriendo ciudad',
    'precio vida mundo',
    'nómada digital',
    'mudarse al extranjero',
    'cities cost of living',
    'presupuesto expatriado',
  ],
  openGraph: {
    title: 'Comparador de Coste de Vida (Costo de Vida) | meskeIA',
    description: 'Alquiler, comida, transporte e internet en 55+ ciudades del mundo. Compara el coste —o costo— de vida y decide dónde vivir.',
    url: 'https://meskeia.com/comparador-coste-vida/',
    siteName: 'meskeIA',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/comparador-coste-vida/',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Comparador de Coste de Vida (Costo de Vida) entre Ciudades',
  description: 'Compara el coste de vida —o costo de vida— entre más de 55 ciudades del mundo: alquiler (arriendo), restaurantes, supermercado, transporte e internet.',
  url: 'https://meskeia.com/comparador-coste-vida/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  provider: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};

// La pregunta que está también en la FAQ visible de page.tsx: una sola respuesta para las dos
// (check:faq-unica, cabo C0570). Decían lo mismo; se quedó la visible, sin el «más de 55 ciudades»
// del JSON-LD: un recuento escrito a mano envejece en cuanto cambia la lista.
export const RESPUESTA_FAQ_COSTE_COSTO =
  'Sí, son lo mismo. «Coste de vida» es la forma habitual en España y «costo de vida» la más usada en Latinoamérica; ambas miden cuánto cuesta cubrir gastos básicos (vivienda o arriendo, alimentación, transporte y servicios) en una ciudad. Este comparador funciona igual escribas coste o costo.';

// Las respuestas del FAQPage salen de los datos del comparador (hallazgo 4506, 16/11/2026): antes
// llamaban nórdica a Suiza, daban a Madrid costes «similares» a Berlín y Ámsterdam (el comparador
// los pone muy por encima), nombraban ciudades que la app no tiene y daban horquillas sin fuente.
const NBSP = ' ';
const eur = (n: number): string => `${new Intl.NumberFormat('es-ES').format(n)}${NBSP}€`;
const conCesta = (c: DatosCosteVida): string => `${c.ciudad} (${eur(cestaMensual(c))})`;
const lista = (xs: string[]): string => `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`;
const DEF_CESTA = `alquiler de 1 habitación en el centro, supermercado, abono de transporte público, internet y ${CESTA.cena} cenas en un restaurante económico`;

const EUROPEAS = CIUDADES.filter((c) => c.continente.startsWith('Europa')).sort(
  (a, b) => cestaMensual(a) - cestaMensual(b),
);
const MAD = buscarCiudad('Madrid');
const I = (n: string): number => indiceDe(buscarCiudad(n));
const PESOS = CIUDADES.map(pesoAlquiler);

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la ciudad más barata para vivir en Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Entre las ciudades europeas del comparador, las de cesta mensual más baja son ${lista(EUROPEAS.slice(0, 3).map(conCesta))}; las más caras, ${lista(EUROPEAS.slice(-3).reverse().map(conCesta))}. La cesta suma ${DEF_CESTA}.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se compara el coste de vida en España con el de otros países?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Con Madrid como referencia (índice 100), Barcelona tiene un índice de ${I('Barcelona')}, por debajo de Berlín (${I('Berlín')}), París (${I('París')}) o Ámsterdam (${I('Ámsterdam')}). Valencia (${I('Valencia')}) y Sevilla (${I('Sevilla')}) quedan por debajo de Madrid, y Lisboa (${I('Lisboa')}) muy cerca. El alquiler de un piso de 1 habitación en el centro va de ${eur(buscarCiudad('Sevilla').alquiler)} en Sevilla a ${eur(buscarCiudad('Barcelona').alquiler)} en Barcelona.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ciudades tienen mejor relación entre salario y coste de vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Depende del sueldo que tengas en cada sitio, y el comparador no recoge salarios: mide lo que cuesta la cesta mensual. Si tus ingresos no dependen de la ciudad (teletrabajo en euros o dólares), una cesta más baja deja más margen: Ciudad de México, Bangkok o Ho Chi Minh tienen índices de ${I('Ciudad de México')}, ${I('Bangkok')} y ${I('Ho Chi Minh')} frente a los 100 de Madrid. Si vas a cobrar un sueldo local, compara ese sueldo con la cesta de la ciudad: en Zúrich (${I('Zúrich')}) u Oslo (${I('Oslo')}) la cesta es mucho más cara.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta vivir en Ciudad de México, Buenos Aires o Bogotá?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Según el comparador, la cesta mensual (${DEF_CESTA}) cuesta unos ${eur(cestaMensual(buscarCiudad('Ciudad de México')))} en Ciudad de México, ${eur(cestaMensual(buscarCiudad('Buenos Aires')))} en Buenos Aires y ${eur(cestaMensual(buscarCiudad('Bogotá')))} en Bogotá, frente a ${eur(cestaMensual(MAD))} en Madrid. En países con inflación alta o devaluación reciente, como Argentina, la cifra en euros puede cambiar en pocos meses.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué partidas pesan más en el coste de vida de una ciudad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `En la cesta del comparador, el alquiler es la partida que más pesa: el ${pesoAlquiler(MAD)}${NBSP}% en Madrid y entre el ${Math.min(...PESOS)}${NBSP}% y el ${Math.max(...PESOS)}${NBSP}% según la ciudad. Le sigue el supermercado; transporte público, internet y cenas fuera pesan menos. El comparador no incluye coche propio, ocio, sanidad ni educación.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo «coste de vida» que «costo de vida»?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_FAQ_COSTE_COSTO,
      },
    },
  ],
};
