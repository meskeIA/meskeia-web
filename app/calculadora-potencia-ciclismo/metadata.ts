import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Potencia en Ciclismo — FTP, W/kg y VAM | meskeIA',
  description: 'Calcula tu ratio W/kg, zonas de entrenamiento por FTP y VAM en subidas cronometradas. Compara tu nivel de ciclismo y obtén recomendaciones de entrenamiento. Gratis.',
  keywords: 'calculadora potencia ciclismo, FTP vatios, W/kg ciclismo, zonas entrenamiento potencia, VAM ciclismo, nivel ciclista',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Potencia en Ciclismo — FTP, W/kg y VAM',
    description: 'Analiza tu FTP, W/kg y VAM para conocer tu nivel como ciclista. Zonas de entrenamiento por potencia incluidas.',
    url: 'https://meskeia.com/calculadora-potencia-ciclismo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Potencia en Ciclismo | meskeIA',
    description: 'FTP, W/kg, VAM y zonas de entrenamiento para ciclistas.',
  },
  other: {
    'application-name': 'Calculadora Potencia Ciclismo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Potencia en Ciclismo',
  description: 'Calculadora de potencia para ciclistas. Calcula tu ratio W/kg, zonas de entrenamiento por potencia (FTP) y VAM para subidas cronometradas. Conoce tu nivel ciclista.',
  url: 'https://meskeia.com/calculadora-potencia-ciclismo/',
  category: 'UtilityApplication',
  features: [
    'Ratio W/kg con clasificación de nivel de rendimiento ciclista',
    'Zonas de potencia Z1-Z6 basadas en tu FTP',
    'Cálculo de VAM (Velocidad Ascensional Media) para subidas cronometradas',
    'Tabla de zonas con rangos de vatios y porcentajes del FTP',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el FTP en ciclismo y cómo se mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El FTP (Functional Threshold Power, potencia umbral funcional) es la potencia máxima en vatios que un ciclista puede mantener durante aproximadamente una hora. Es el indicador de referencia para estructurar el entrenamiento por zonas de potencia. La forma más habitual de medirlo es mediante un test de 20 minutos a máximo esfuerzo: el FTP equivale aproximadamente al 95% de la potencia media obtenida en ese test.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa el ratio W/kg en ciclismo y qué valores son buenos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio W/kg (vatios por kilogramo de peso corporal) es la métrica más importante para comparar el rendimiento ciclista, especialmente en ascensiones. Un ciclista recreativo medio suele estar entre 2,5 y 3,5 W/kg de FTP; uno amateur competitivo entre 3,5 y 4,5 W/kg; y un profesional de élite supera los 5,5-6 W/kg. A diferencia del FTP absoluto, el W/kg permite comparar ciclistas de distinto peso en rutas con desnivel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven las zonas de entrenamiento por potencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las zonas de potencia (Z1 a Z6) dividen el espectro de intensidad en rangos basados en el FTP y permiten entrenar con objetivos fisiológicos precisos. Z1 y Z2 desarrollan la base aeróbica; Z3 mejora el umbral; Z4 es la zona de trabajo justo en el FTP; Z5 y Z6 trabajan la capacidad anaeróbica y la potencia máxima. Entrenar con zonas evita sesiones demasiado intensas o demasiado suaves, optimizando la adaptación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la VAM y cómo se calcula en una subida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La VAM (Velocidad Ascensional Media) mide cuántos metros de desnivel positivo sube un ciclista por hora. Se calcula dividiendo los metros de desnivel entre el tiempo empleado en superarlos: VAM (m/h) = desnivel (m) / tiempo (h). Un ciclista aficionado suele tener una VAM de 800-1.000 m/h en subidas sostenidas; los profesionales en grandes puertos de montaña superan los 1.600-1.700 m/h.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito un potenciómetro para usar estas métricas de potencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para medir el FTP y las zonas de potencia con precisión durante los entrenamientos reales sí se necesita un potenciómetro (medidor de potencia integrado en el pedal, biela o buje). Sin embargo, la calculadora permite estimar y planificar tus zonas de entrenamiento si ya conoces tu FTP por haber realizado un test o una prueba anterior. La VAM, en cambio, solo requiere conocer el desnivel y el tiempo invertido, datos fácilmente obtenibles sin potenciómetro.',
      },
    },
  ],
};
