import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de Coordenadas Geográficas: UTM, MGRS y Grados Minutos Segundos - meskeIA',
  description: 'Convierte coordenadas entre grados decimales, grados minutos segundos (GMS), UTM y MGRS. Pega el formato que tengas y obtén todos los demás, con distancia y rumbo entre dos puntos.',
  keywords: 'conversor coordenadas, coordenadas utm, utm a geograficas, grados minutos segundos, gms a decimal, coordenadas mgrs, latitud longitud, husos utm, coordenadas gps, wgs84, etrs89, distancia entre coordenadas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/conversor-coordenadas/',
  },
  openGraph: {
    type: 'website',
    title: 'Conversor de Coordenadas: UTM, MGRS y Grados Minutos Segundos',
    description: 'Pega una coordenada en cualquier formato y obtén todos los demás: decimal, GMS, UTM y MGRS. Con distancia y rumbo entre dos puntos.',
    url: 'https://meskeia.com/conversor-coordenadas/',
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
    title: 'Conversor de Coordenadas: UTM, MGRS y GMS',
    description: 'Pega cualquier formato y obtén todos los demás. Con distancia y rumbo entre dos puntos.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de Coordenadas Geográficas',
  description: 'Convierte coordenadas geográficas entre grados decimales, grados minutos segundos, grados y minutos decimales, UTM y MGRS. Detecta automáticamente el formato pegado y calcula distancia y rumbo entre dos puntos sobre el elipsoide WGS84.',
  url: 'https://meskeia.com/conversor-coordenadas/',
  category: 'UtilityApplication',
  features: [
    'Detección automática del formato pegado (decimal, GMS, UTM o MGRS)',
    'Conversión simultánea a los cinco formatos con un solo clic para copiar',
    'Proyección UTM con series de Krüger, precisión submilimétrica',
    'Referencia MGRS con precisión ajustable de 1 km a 1 m',
    'Distancia y rumbo entre dos puntos por la fórmula de Vincenty',
    'Excepciones de zona de Noruega y Svalbard contempladas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se pasa de coordenadas UTM a latitud y longitud?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hace falta la zona (1 a 60), el hemisferio o la banda de latitud, y los valores de este y norte en metros. Con esos cuatro datos se deshace la proyección transversa de Mercator y se obtiene la latitud y la longitud en grados. Sin la zona no se puede: los mismos metros de este y norte existen en las 60 zonas del planeta y señalan 60 puntos distintos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre grados decimales y grados minutos segundos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son la misma coordenada escrita de dos maneras. En grados decimales la parte fraccionaria va en base 10 (40,416775°); en grados minutos segundos se reparte en base 60 (40°25’00,4"). Un minuto es 1/60 de grado y un segundo 1/60 de minuto, así que un segundo de latitud equivale a unos 31 metros sobre el terreno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es MGRS y en qué se diferencia de UTM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MGRS es la cuadrícula que usan los servicios de rescate, el excursionismo y el ámbito militar. Parte de las mismas coordenadas UTM, pero sustituye los dígitos de más peso por letras: 30T VK 40291 74254 en vez de 30 T 440291 4474255. Es más corto de dictar por radio y admite recortar dígitos para dar menos precisión: con dos dígitos por eje se señala un cuadro de un kilómetro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué mis coordenadas antiguas no coinciden con las del GPS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Casi siempre es un cambio de datum. La cartografía española anterior a 2007 usa ED50 y la actual usa ETRS89, compatible con el WGS84 de los GPS. El mismo punto tiene coordenadas distintas en cada sistema: la diferencia ronda los 200 metros en la Península. Antes de convertir conviene mirar en la leyenda del mapa qué datum emplea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hasta dónde llega la proyección UTM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De 80°S a 84°N. Más allá la deformación se dispara y se usan las cuadrículas polares UPS. El planeta se divide en 60 husos de 6° de longitud, con dos excepciones: el huso 32 se ensancha frente al suroeste de Noruega y en Svalbard solo se usan husos impares, cambios adoptados para no partir esos territorios entre dos zonas.',
      },
    },
  ],
};
