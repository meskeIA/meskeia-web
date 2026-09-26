import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Etiqueta DGT de tu Coche — ¿Puedes entrar en las ZBE? | meskeIA',
  description:
    'Descubre la etiqueta medioambiental DGT de tu vehículo y si puedes circular por las Zonas de Bajas Emisiones de Madrid, Barcelona, Valencia y otras ciudades españolas.',
  keywords: [
    'etiqueta DGT coche',
    'zona de bajas emisiones España',
    'ZBE Madrid Barcelona',
    'etiqueta CERO ECO C B DGT',
    'puedo entrar en ZBE',
    'restricciones tráfico contaminación',
    'etiqueta ambiental vehículo',
    'circular Madrid centro',
  ],
  openGraph: {
    title: '¿Qué etiqueta DGT tiene tu coche? ¿Puedes entrar en las ZBE? | meskeIA',
    description:
      'Comprueba la etiqueta medioambiental de tu vehículo y accede a la información de circulación en las ZBE de las principales ciudades de España.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/etiqueta-dgt/',
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
    title: 'Etiqueta DGT y ZBE — ¿Puedes circular? | meskeIA',
    description:
      'Introduce el combustible y año de tu coche para conocer tu etiqueta DGT y si puedes entrar en las zonas de bajas emisiones.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/etiqueta-dgt/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Etiqueta DGT y Zonas de Bajas Emisiones',
        description:
          'Consulta la etiqueta medioambiental DGT de tu vehículo y comprueba si puedes circular por las Zonas de Bajas Emisiones de Madrid, Barcelona, Valencia, Sevilla, Zaragoza, Valladolid y Bilbao.',
        url: 'https://meskeia.com/etiqueta-dgt/',
        features: [
          'Cálculo de etiqueta DGT (CERO, ECO, C, B o sin etiqueta)',
          'Consulta de acceso a 7 ZBE principales de España',
          'Información sobre restricciones por nivel de contaminación',
          'Recomendaciones según etiqueta y ciudad',
          '100% en el navegador, sin registro',
          'Datos actualizados a 2025',
          'Gratuito y en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Etiqueta DGT y Zonas de Bajas Emisiones",
  description: "Descubre la etiqueta medioambiental DGT de tu vehículo y si puedes circular por las Zonas de Bajas Emisiones de Madrid, Barcelona, Valencia y otras ciudades españolas.",
  url: "https://meskeia.com/etiqueta-dgt/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué etiqueta medioambiental DGT tiene mi coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La etiqueta DGT depende del tipo de motor y de su norma Euro, que la DGT aproxima por la fecha de matriculación. Los eléctricos de batería, los de pila de combustible y los híbridos enchufables con 40 km o más de autonomía eléctrica llevan la CERO (azul). Los híbridos no enchufables, los enchufables con menos de 40 km y los vehículos de gas (GNC, GNL o GLP) que cumplan los criterios de la C llevan la ECO. Los gasolina matriculados a partir de enero de 2006 y los diésel a partir de septiembre de 2015 llevan la C (verde). Los gasolina desde el 1 de enero de 2001 y los diésel a partir de 2006 llevan la B (amarilla). Los anteriores no tienen etiqueta. La etiqueta oficial se consulta por matrícula en la sede electrónica de la DGT.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las Zonas de Bajas Emisiones (ZBE) en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las Zonas de Bajas Emisiones (ZBE) son áreas urbanas delimitadas donde se restringen o prohíben determinados vehículos en función de su etiqueta medioambiental DGT, con el objetivo de mejorar la calidad del aire. La Ley 7/2021, de cambio climático y transición energética (art. 14.3), obliga a los municipios de más de 50.000 habitantes y a los territorios insulares a establecerlas, y a los de más de 20.000 cuando superan los límites de contaminación. Las principales ciudades con ZBE operativas son Madrid (Madrid Central y Madrid 360), Barcelona (ZBE Rondes) y Valencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo circular por Madrid Central sin etiqueta DGT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general, los vehículos sin etiqueta DGT tienen restringido el acceso a Madrid Central y Madrid 360 durante los días laborables. Existen excepciones para residentes en la zona, vehículos de carga y descarga, personas con movilidad reducida y algunos servicios esenciales. Las restricciones pueden variar en episodios de alta contaminación, cuando también se limitan los vehículos con etiqueta B.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se obtiene la etiqueta medioambiental de la DGT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La etiqueta medioambiental DGT se solicita en las Jefaturas Provinciales de Tráfico, en puntos de expedición autorizados o a través de la sede electrónica de la DGT. Para obtenerla es necesario presentar la documentación del vehículo (permiso de circulación) y pagar una tasa. La categoría de la etiqueta está predeterminada según el tipo de motor y la fecha de matriculación, por lo que no se puede elegir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La etiqueta DGT es obligatoria para circular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La etiqueta medioambiental DGT no es obligatoria para circular en general, pero sí es imprescindible para acceder a las Zonas de Bajas Emisiones si el vehículo tiene derecho a etiqueta. Sin ella visible en el parabrisas, los agentes o cámaras de control pueden multar al vehículo incluso si técnicamente le corresponde una categoría que permite el acceso. Se recomienda tenerla siempre colocada en el lado inferior derecho del parabrisas.',
      },
    },
  ],
};
