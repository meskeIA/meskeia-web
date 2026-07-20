import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Unidades del SI — Básicas, Derivadas y Prefijos | meskeIA',
  description:
    'Tabla del Sistema Internacional con buscador: las 7 unidades básicas y sus definiciones por constantes, las 22 unidades derivadas con nombre propio descompuestas paso a paso, los 24 prefijos de quecto a quetta y las unidades aceptadas con el SI.',
  keywords:
    'unidades del SI, sistema internacional de unidades, unidades básicas, unidades derivadas, prefijos del SI, quetta ronna ronto quecto, newton pascal julio vatio, redefinición del kilogramo, constante de Planck, tabla de unidades, magnitudes y unidades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-unidades-si/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Unidades del SI con buscador | meskeIA',
    description:
      'Escribe «voltio», «tesla» o «nano» y obtén el símbolo, la expresión en unidades básicas, la descomposición paso a paso y un ejemplo de orden de magnitud.',
    url: 'https://meskeia.com/tabla-unidades-si/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Unidades del SI con buscador | meskeIA',
    description:
      'Unidades básicas, derivadas, prefijos de quecto a quetta y unidades aceptadas, con descomposición hasta unidades básicas y ejemplos reales.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Unidades del SI meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Unidades del SI',
  description:
    'Tabla de consulta del Sistema Internacional de Unidades: las 7 unidades básicas con su definición actual a partir de constantes fijadas, las 22 unidades derivadas con nombre propio, los 24 prefijos de quecto a quetta y las unidades aceptadas para uso con el SI. Cada unidad derivada incluye su descomposición paso a paso hasta unidades básicas y un ejemplo de orden de magnitud.',
  url: 'https://meskeia.com/tabla-unidades-si/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo tolerante a acentos y con sinónimos en español, inglés y variantes latinoamericanas',
    'Las 7 unidades básicas con la definición vigente basada en constantes fijadas (redefinición de 2019)',
    'Las 22 unidades derivadas con nombre propio y su expresión en unidades básicas',
    'Descomposición paso a paso de cada unidad derivada hasta metro, kilogramo, segundo y amperio',
    'Los 24 prefijos del SI, incluidos ronna, quetta, ronto y quecto (2022)',
    'Ejemplo de orden de magnitud en cada unidad y en cada prefijo',
    'Unidades aceptadas para uso con el SI: hora, litro, tonelada, electronvoltio, hectárea y más',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
  keywords: [
    'unidades del SI',
    'sistema internacional de unidades',
    'unidades derivadas',
    'prefijos del SI',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 7 unidades básicas del Sistema Internacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son el segundo (s) para el tiempo, el metro (m) para la longitud, el kilogramo (kg) para la masa, el amperio (A) para la corriente eléctrica, el kelvin (K) para la temperatura termodinámica, el mol (mol) para la cantidad de sustancia y la candela (cd) para la intensidad luminosa. Todas las demás unidades del SI se construyen como productos de potencias de estas siete. Desde 2019 cada una queda definida fijando el valor numérico de una constante de la naturaleza.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se redefinió el kilogramo en 2019?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hasta 2019 el kilogramo era la masa de un cilindro de platino e iridio guardado cerca de París, y ese objeto había derivado unas decenas de microgramos respecto de sus copias. Desde el 20 de mayo de 2019 el kilogramo se define fijando la constante de Planck en h = 6,626 070 15 × 10⁻³⁴ J·s, medida con la balanza de Kibble. La ventaja es que la definición no depende de ningún objeto: cualquier laboratorio con el equipo adecuado puede realizarla.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos prefijos tiene el SI y cuáles son los últimos añadidos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El SI tiene 24 prefijos, doce multiplicadores y doce submúltiplos, que van de 10⁻³⁰ a 10³⁰. Los cuatro últimos se aprobaron en la 27ª Conferencia General de Pesas y Medidas en noviembre de 2022: ronna (R, 10²⁷), quetta (Q, 10³⁰), ronto (r, 10⁻²⁷) y quecto (q, 10⁻³⁰). Se añadieron porque el volumen mundial de datos se acercaba a agotar el prefijo yotta y porque la escala de las masas subatómicas necesitaba nombres propios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el gray y el sievert si ambos son J/kg?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dimensionalmente son idénticos, pero miden cosas distintas. El gray (Gy) mide la dosis absorbida: cuánta energía deposita la radiación por kilogramo de materia, sin importar de qué radiación se trate. El sievert (Sv) mide la dosis equivalente y efectiva: pondera esa energía por el daño biológico, de modo que un gray de partículas alfa cuenta mucho más que un gray de rayos X. Por eso el SI les da nombres distintos aunque compartan unidades básicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se escribe 5 Kg o 5 kg? ¿Y 20 grados C o 20 °C?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se escribe 5 kg: el prefijo kilo se abrevia con k minúscula, porque la K mayúscula es el símbolo del kelvin. Los símbolos no llevan punto final salvo al terminar una frase ni forman plural (5 kg, nunca 5 kgs), y siempre va un espacio entre el número y el símbolo. En el grado Celsius el espacio va antes del signo: 20 °C, no 20°C. Los nombres de las unidades se escriben en minúscula aunque procedan de un apellido: newton, pascal, kelvin.',
      },
    },
  ],
};
