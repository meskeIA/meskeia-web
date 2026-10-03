import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Vatios en Ciclismo — Watts, FTP y W/kg | meskeIA',
  description: 'Calcula tus vatios (watts) en ciclismo: ratio W/kg, zonas de entrenamiento por FTP y VAM en subidas cronometradas. Compara tu nivel y obtén recomendaciones de entrenamiento. Gratis.',
  keywords: 'calculadora vatios ciclismo, calculadora watts ciclismo, calcular vatios bicicleta, calculadora potencia ciclismo, FTP vatios, W/kg ciclismo, zonas entrenamiento potencia, VAM ciclismo, nivel ciclista',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Vatios en Ciclismo — Watts, FTP y W/kg',
    description: 'Calcula tus vatios en ciclismo y analiza tu FTP, W/kg y VAM para conocer tu nivel. Zonas de entrenamiento por potencia incluidas.',
    url: 'https://meskeia.com/calculadora-potencia-ciclismo/',
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
    title: 'Calculadora de Vatios en Ciclismo | meskeIA',
    description: 'Vatios, FTP, W/kg, VAM y zonas de entrenamiento para ciclistas.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora Vatios Ciclismo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Vatios en Ciclismo (Watts)',
  description: 'Calculadora de vatios (watts) para ciclistas. Calcula tu ratio W/kg, zonas de entrenamiento por potencia (FTP) y VAM para subidas cronometradas. Conoce tu nivel ciclista.',
  url: 'https://meskeia.com/calculadora-potencia-ciclismo/',
  category: 'UtilityApplication',
  features: [
    'Ratio W/kg con clasificación de nivel de rendimiento ciclista',
    'Las siete zonas de potencia de Coggan (Z1-Z7) basadas en tu FTP',
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
      name: '¿Vatios y potencia son lo mismo en ciclismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí: el vatio (W, o watt en inglés) es la unidad en la que se mide la potencia, de modo que «cuántos vatios muevo» y «cuánta potencia genero» son la misma pregunta. En ciclismo la cifra suelta importa poco sin dos contextos: cuánto tiempo puedes sostenerla —de ahí el FTP, la potencia que aguantas alrededor de una hora— y cuánto pesas, porque en subida lo que manda es la relación vatios por kilo (W/kg). Un ciclista de 60 kg a 240 W sube más rápido que uno de 85 kg a 280 W, pese a mover menos vatios en términos absolutos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el FTP en ciclismo y cómo se mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El FTP (Functional Threshold Power, potencia umbral funcional) es la potencia máxima en vatios que un ciclista puede mantener durante aproximadamente una hora. Es el indicador de referencia para estructurar el entrenamiento por zonas de potencia. La forma más habitual de medirlo es mediante un test de 20 minutos a máximo esfuerzo: el FTP equivale aproximadamente al 95\u00A0% de la potencia media obtenida en ese test, según el protocolo que propusieron Hunter Allen y Andrew Coggan en su libro «Training and Racing with a Power Meter».',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa el ratio W/kg en ciclismo y qué valores son buenos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio W/kg (vatios por kilogramo de peso corporal) es la métrica más importante para comparar el rendimiento ciclista, especialmente en ascensiones. La calculadora usa esta escala de W/kg de FTP: por debajo de 1,5, principiante; de 1,5 a 2,5, cicloturista con salidas recreativas regulares; de 2,5 a 3,5, amateur con entrenamiento estructurado; de 3,5 a 4,5, amateur competitivo; de 4,5 a 5,5, semiprofesional; y por encima de 5,5, profesional o élite. Es una escala orientativa de la propia calculadora: no existe una clasificación por W/kg aceptada por todos. A diferencia del FTP absoluto, el W/kg permite comparar ciclistas de distinto peso en rutas con desnivel.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven las zonas de entrenamiento por potencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las zonas de potencia que usa la calculadora son los siete niveles que propuso Andrew Coggan (Z1 a Z7), definidos como porcentajes del FTP: Z1 recuperación activa (hasta el 55 %), Z2 resistencia, Z3 tempo, Z4 umbral (90-105 %), Z5 VO2max, Z6 capacidad anaeróbica y Z7 potencia neuromuscular, que son sprints de pocos segundos sin porcentaje fijo. Sirven para dar a cada sesión una intensidad concreta y evitar que todas acaben siendo de intensidad media.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la VAM y cómo se calcula en una subida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La VAM (Velocidad Ascensional Media) mide cuántos metros de desnivel positivo sube un ciclista por hora. Se calcula dividiendo los metros de desnivel entre el tiempo empleado en superarlos: VAM (m/h) = desnivel (m) / tiempo (h). En la escala de la calculadora, por debajo de 800 m/h es nivel principiante; de 800 a 1.000, cicloturista; de 1.000 a 1.200, amateur; de 1.200 a 1.400, amateur fuerte; de 1.400 a 1.600, semiprofesional; y por encima de 1.600 m/h, élite. Es una escala orientativa de la propia calculadora, sin fuente oficial, y la VAM depende mucho de la pendiente y de la duración de la subida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito un potenciómetro para usar estas métricas de potencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para medir el FTP con precisión durante los entrenamientos reales sí se necesita un potenciómetro (medidor de potencia integrado en el pedal, biela o buje), pero la calculadora no lo exige: estima los vatios a partir del peso, la velocidad sostenida y la pendiente, aplicando el modelo de fuerzas (gravedad, rodadura y resistencia del aire). Esa cifra es la potencia que exige la velocidad indicada, no el FTP: solo se le aproxima si corresponde a un esfuerzo máximo sostenido durante alrededor de una hora, y en ese caso puede usarse como FTP para calcular el ratio W/kg y las zonas de entrenamiento. La VAM, por su parte, solo requiere el desnivel y el tiempo invertido.',
      },
    },
  ],
};
