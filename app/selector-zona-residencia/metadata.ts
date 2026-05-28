import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Zona de Residencia — ¿Ciudad, pueblo o costa? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de zona de residencia se adapta mejor a tu estilo de vida: ciudad grande, ciudad media, pueblo o zona rural, o costa. Análisis según trabajo, familia, presupuesto y preferencias.',
  keywords: [
    'vivir en ciudad o pueblo',
    'mudarse a la costa',
    'ciudad grande o pequeña',
    'zona rural o urbana España',
    'dónde vivir mejor España',
    'mudarse al pueblo desde ciudad',
    'teletrabajo y dónde vivir',
    'calidad de vida ciudad vs pueblo',
    'vivir cerca de la naturaleza',
    'precio vivienda ciudad vs pueblo',
  ],
  openGraph: {
    title: '¿Ciudad, pueblo o costa? Test de zona de residencia | meskeIA',
    description:
      'Descubre qué tipo de entorno se adapta mejor a tu trabajo, familia y estilo de vida con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-zona-residencia/',
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
    title: '¿Dónde vivir? Test de zona de residencia | meskeIA',
    description:
      'Test de 10 preguntas para saber si te conviene más la ciudad, un pueblo o la costa según tu perfil.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-zona-residencia/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Zona de Residencia',
        description:
          'Test orientativo para descubrir qué tipo de entorno (ciudad grande, ciudad media, pueblo/rural o costa) se adapta mejor al estilo de vida, trabajo y familia.',
        url: 'https://meskeia.com/selector-zona-residencia/',
        features: [
          'Test de 10 preguntas sobre estilo de vida',
          '4 recomendaciones: ciudad grande, ciudad media, pueblo/rural, costa',
          'Análisis de trabajo, transporte, familia y ocio',
          'Orientación sobre coste de vida por tipo de zona',
          'Consideración del teletrabajo y la conectividad',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Zona de Residencia",
  description: "Test de 10 preguntas para saber qué tipo de zona de residencia se adapta mejor a tu estilo de vida: ciudad grande, ciudad media, pueblo o zona rural, o costa. Análisis según trabajo, familia, presupue",
  url: "https://meskeia.com/selector-zona-residencia/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué factores debo considerar antes de decidir dónde vivir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores más relevantes son: tipo de trabajo (presencial, híbrido o teletrabajo), coste de la vivienda en relación a tus ingresos, necesidades familiares (colegios, dependencia), preferencias de ocio y naturaleza, y conectividad (transporte público, internet). No existe una opción universalmente mejor; depende del equilibrio entre estos factores para cada persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es más barato vivir en un pueblo que en una ciudad grande?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general, sí: el precio de la vivienda en compra o alquiler es significativamente más bajo en pueblos y zonas rurales que en grandes ciudades. Sin embargo, hay que considerar los costes ocultos: necesidad de coche (compra, seguro, combustible), desplazamientos frecuentes si el trabajo es presencial, y menor acceso a servicios como sanidad especializada o centros educativos. El ahorro real depende mucho del perfil de cada persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventajas tiene vivir en la costa frente al interior?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La zona costera combina calidad de vida relacionada con el mar y el clima con precios de vivienda que varían mucho según la provincia. Puede ser adecuada para teletrabajadores, jubilados o quienes valoran el ocio al aire libre. Sus principales inconvenientes son la estacionalidad (masificación en verano), los precios en zonas turísticas consolidadas y una oferta laboral más reducida fuera del sector turístico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una ciudad media y qué ventajas ofrece frente a Madrid o Barcelona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una ciudad media (entre 50.000 y 300.000 habitantes, como Valladolid, Alicante o Málaga) ofrece servicios urbanos completos (sanidad, universidades, transporte) con precios de vivienda considerablemente más bajos que Madrid o Barcelona y menor tiempo de desplazamiento interno. Es una opción equilibrada para familias que necesitan servicios urbanos pero quieren reducir el coste de vida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El teletrabajo cambia qué tipo de zona conviene elegir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, de forma sustancial. El teletrabajo total elimina la dependencia del mercado laboral local, lo que abre la posibilidad de vivir en pueblos, zonas rurales o costeras con menor coste de vida. Sin embargo, conviene verificar la cobertura de fibra óptica, que en algunas zonas rurales todavía es limitada. El teletrabajo parcial (híbrido) mantiene la necesidad de proximidad a transporte o a la ciudad de la empresa, lo que restringe las opciones.',
      },
    },
  ],
};
