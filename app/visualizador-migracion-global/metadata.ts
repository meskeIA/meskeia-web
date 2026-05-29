import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Flujos Migratorios Globales: Mapa Interactivo 2024 | meskeIA',
  description: 'Visualiza los principales flujos migratorios del mundo en 2024. Refugiados, migrantes económicos, rutas y factores que impulsan la migración global. Datos UNHCR e IOM.',
  keywords: ['migración global', 'refugiados', 'UNHCR', 'flujos migratorios', 'mapa migración', 'migrantes', 'desplazados', 'asilo'],
  openGraph: {
    title: 'Flujos Migratorios Globales: Mapa Interactivo 2024',
    description: '117 millones de personas desplazadas forzosamente en el mundo. Visualiza las principales rutas migratorias globales.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Flujos Migratorios Globales: Mapa 2024",
  description: "Visualiza los principales flujos migratorios del mundo en 2024. Refugiados, migrantes económicos, rutas y factores que impulsan la migración global. Datos UNHCR e IOM.",
  url: "https://meskeia.com/visualizador-migracion-global/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas personas están desplazadas forzosamente en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según UNHCR, a finales de 2023 hay más de 117 millones de personas desplazadas forzosamente en el mundo, el dato más alto registrado. Incluye refugiados, solicitantes de asilo y desplazados internos. Los principales países de origen son Siria, Ucrania, Afganistán y Venezuela.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre refugiado y migrante económico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un refugiado huye de persecución, conflicto o violencia y tiene protección internacional bajo la Convención de Ginebra de 1951. Un migrante económico se desplaza voluntariamente en busca de mejores condiciones laborales o de vida. La distinción es legal y determina el acceso a protección y derechos en el país de destino.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales rutas migratorias hacia Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tres rutas más activas hacia Europa son la del Mediterráneo Central (Libia/Túnez → Italia/Malta), la del Mediterráneo Oriental (Turquía → Grecia) y la del Mediterráneo Occidental (Marruecos → España). La ruta canaria desde África Occidental ha crecido significativamente desde 2020 como alternativa a las rutas con mayor vigilancia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores explican el aumento de la migración global?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales factores de expulsión son conflictos armados, persecución política o étnica, pobreza extrema y cambio climático (sequías, inundaciones). Los factores de atracción incluyen demanda de mano de obra en países envejecidos, reunificación familiar y redes migratorias previas. El cambio climático se proyecta como causa creciente: el Banco Mundial estima hasta 216 millones de migrantes climáticos internos para 2050.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué países acogen más refugiados en el mundo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los países con mayor número absoluto de refugiados acogidos son Turquía (3,6 millones), Irán (3,4 millones), Colombia (2,9 millones) y Alemania (2,1 millones), según datos UNHCR 2023. En proporción a su población, países de ingresos bajos y medios acogen alrededor del 75% del total mundial de refugiados.',
      },
    },
  ],
};
