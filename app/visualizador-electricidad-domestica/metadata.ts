import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Electricidad Doméstica - Cuadro Eléctrico, Circuitos y Protecciones | meskeIA',
  description: 'Entiende tu instalación eléctrica: cuadro general, diferencial, magnetotérmicos, circuitos REBT, toma de tierra. Por qué salta el diferencial y qué hacer.',
  keywords: 'electricidad doméstica, cuadro eléctrico, diferencial, magnetotérmico, REBT, circuitos hogar, toma tierra, instalación eléctrica, ICP, protecciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Electricidad Doméstica - Cuadro Eléctrico y Protecciones',
    description: 'Entiende tu instalación eléctrica: cuadro general, diferencial, magnetotérmicos, circuitos obligatorios y protecciones.',
    url: 'https://meskeia.com/visualizador-electricidad-domestica/',
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
    title: 'Electricidad Doméstica - Cuadro Eléctrico y Protecciones',
    description: 'Por qué salta el diferencial, qué hace cada magnetotérmico y cómo funciona tu instalación eléctrica.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Electricidad Doméstica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Electricidad Doméstica - Cuadro Eléctrico y Protecciones',
  description: 'Explicador visual de la instalación eléctrica doméstica: cuadro general con ICP, diferencial y magnetotérmicos, los 5 circuitos obligatorios según REBT, protecciones contra fugas y sobrecargas, y datos curiosos sobre electricidad en España.',
  url: 'https://meskeia.com/visualizador-electricidad-domestica/',
  category: 'EducationalApplication',
  features: [
    'Diagrama SVG interactivo del cuadro eléctrico',
    'Componentes clickables: ICP, diferencial, magnetotérmicos',
    'Los 5 circuitos obligatorios según REBT',
    'Animación simplificada de corriente normal vs fuga a tierra',
    'Colores de cables según normativa (marrón, azul, verde-amarillo)',
    'Datos de consumo y potencia en España',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué salta el diferencial de la luz en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diferencial detecta diferencias entre la corriente que entra y la que sale del circuito, lo que indica una fuga a tierra. Puede saltar por humedad en enchufes o electrodomésticos, un cable pelado que toca la carcasa metálica, un electrodoméstico averiado o el propio diferencial envejecido. Si salta de forma repetida conviene llamar a un electricista autorizado para localizar la fuga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el magnetotérmico y en qué se diferencia del diferencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El magnetotérmico (o PIA) protege frente a sobrecargas y cortocircuitos: corta la corriente cuando pasa más amperaje del que soporta el cable. El diferencial protege a las personas detectando corrientes de fuga. Un hogar bien protegido necesita ambos: el magnetotérmico cuida la instalación y el diferencial cuida tu seguridad física.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos circuitos eléctricos obligatorios tiene una vivienda según el REBT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Reglamento Electrotécnico de Baja Tensión (REBT) establece 5 circuitos mínimos en una vivienda electrificación básica: C1 iluminación general, C2 tomas de corriente de uso general, C3 cocina y horno, C4 lavadora y lavavajillas, y C5 baños y cocina (tomas de corriente). Viviendas de mayor superficie o electrificación elevada añaden circuitos adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la toma de tierra en la instalación eléctrica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La toma de tierra ofrece un camino de baja resistencia para que las corrientes de fuga lleguen al suelo sin pasar por el cuerpo humano. Si la carcasa de un electrodoméstico queda bajo tensión accidentalmente, la corriente fluye por el cable de tierra (verde-amarillo) en lugar de través de ti. Trabaja en conjunto con el diferencial, que detecta esa fuga y corta el circuito.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta potencia eléctrica contrata normalmente una vivienda en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La potencia contratada más habitual en hogares españoles oscila entre 3,3 kW y 5,75 kW para viviendas pequeñas o medianas, y entre 6,9 kW y 9,2 kW para pisos grandes o con cocina eléctrica y bomba de calor. El ICP (interruptor de control de potencia) corta el suministro cuando se supera la potencia contratada, de ahí que al enchufar varios electrodomésticos a la vez salte el "limiter".',
      },
    },
  ],
};
