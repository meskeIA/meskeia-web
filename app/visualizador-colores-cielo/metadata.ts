import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Colores del Cielo en 24 Horas — Golden Hour, Hora Azul, Física Atmosférica - meskeIA',
  description: 'Explora cómo cambia el color del cielo a lo largo del día: noche, hora azul, amanecer, golden hour y atardecer. Paleta HEX por fase y física de dispersión de Rayleigh para fotógrafos y diseñadores.',
  keywords: 'colores del cielo, golden hour, hora azul, amanecer, atardecer, dispersión Rayleigh, paleta colores fotografía, HEX cielo, turbidez atmosférica, Mie scattering',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Colores del Cielo — Visualizador 24h con Física Atmosférica',
    description: 'Descubre la física del cielo: cómo la dispersión de Rayleigh crea el azul del mediodía, el dorado del amanecer y el añil de la hora azul. Paleta HEX copiable por fase.',
    url: 'https://meskeia.com/visualizador-colores-cielo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colores del Cielo — 24h con Física Atmosférica',
    description: 'Golden hour, hora azul, mediodía: física real de la atmósfera + paleta HEX para fotógrafos y diseñadores.',
  },
  other: {
    'application-name': 'Visualizador Colores del Cielo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Colores del Cielo',
  description: 'Herramienta interactiva que muestra la evolución del color del cielo en 12 fases de 24 horas, con paleta HEX por fase, slider de turbidez atmosférica (calima/polvo) y explicación de la física de dispersión de Rayleigh y Mie. Útil para fotógrafos, diseñadores y estudiantes de física.',
  url: 'https://meskeia.com/visualizador-colores-cielo/',
  features: [
    'Línea de tiempo con 12 fases del cielo: noche, hora azul, amanecer, golden hour, mediodía y atardecer',
    'Gradientes de cielo calculados con física real de dispersión de Rayleigh',
    'Slider de turbidez atmosférica: de aire limpio de montaña a calima sahariana',
    'Paleta de colores HEX copiable para cada fase: cénit, punto medio y horizonte',
    'Indicador visual de elevación solar con ángulo exacto por fase',
    'Consejos de fotografía específicos por cada fase del día',
    'Explicación de la física atmosférica: Rayleigh, Mie, capa de ozono',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué el cielo es azul durante el día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El azul del cielo se debe a la dispersión de Rayleigh: las moléculas de nitrógeno y oxígeno dispersan la luz solar de forma inversamente proporcional a la cuarta potencia de la longitud de onda (λ⁻⁴). Esto significa que el azul (~450 nm) se dispersa aproximadamente 5,5 veces más que el rojo (~700 nm), llenando el cielo de luz azul difusa. En el cénit la longitud del camino óptico es mínima, por eso el azul es más puro e intenso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la golden hour y por qué los colores del cielo son tan cálidos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La golden hour ocurre cuando el Sol está entre 0° y 6° sobre el horizonte, justo después del amanecer y antes del atardecer. La luz recorre el máximo camino posible dentro de la atmósfera, haciendo que todos los tonos azules y verdes se dispersen completamente. Solo sobreviven las longitudes de onda largas —rojo, naranja y amarillo— tiñendo el cielo de dorado. En latitudes medias como España dura entre 20 y 60 minutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la hora azul y en qué se diferencia de la hora dorada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hora azul ocurre justo antes del amanecer y justo después del atardecer, cuando el Sol está entre -4° y -6° bajo el horizonte. El cielo adquiere un azul profundo y homogéneo porque la capa de ozono absorbe los rojos residuales, dejando un espectro dominado por el azul y el ciano. A diferencia de la hora dorada —cálida y contrastada—, la hora azul ofrece luz fría y uniforme, muy apreciada en arquitectura y cityscapes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué efecto tiene la calima o el polvo en el color del cielo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las partículas en suspensión —polvo sahariano, humedad, humo— producen dispersión de Mie, que a diferencia de Rayleigh afecta por igual a todas las longitudes de onda. El resultado es un cielo más blanquecino al mediodía y amaneceres/atardeceres más intensos y rojizos: las partículas extienden el rojo sobre un área mayor del horizonte. La turbidez óptica se mide como coeficiente τ (Ångström) y puede llegar a τ ≈ 1,0 durante episodios de calima sahariana sobre España.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué usan diseñadores y fotógrafos los colores del cielo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los fotógrafos planifican sesiones según las fases del cielo: la golden hour para retratos y paisajes (luz cálida y suave), la hora azul para arquitectura (cielo uniforme que equilibra la iluminación artificial). Los diseñadores extraen paletas de los cielos para crear degradados, fondos web, identidades de marca y UI con armonía natural. Los tonos de cielo tienen propiedades psicológicas bien documentadas: los azules profundos transmiten calma, los dorados calidez y energía.',
      },
    },
  ],
};
