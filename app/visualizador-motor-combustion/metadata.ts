import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Motor de Combustión — Ciclo Otto y Por Qué Solo Aprovecha el 35% | meskeIA',
  description: 'Cómo funciona el motor de combustión interna: ciclo Otto 4 tiempos, eficiencia real del 30-35%, pérdidas de energía y comparativa con el motor eléctrico.',
  keywords: ['motor combustion interna', 'ciclo otto', 'como funciona motor gasolina', 'eficiencia motor termico', 'fisica bachillerato', 'termodinámica motor', 'motor electrico vs gasolina'],
  openGraph: {
    title: 'Motor de Combustión — Ciclo Otto y Por Qué Solo Aprovecha el 35%',
    description: 'El 65% de la energía de la gasolina se pierde en calor y fricción. Entiende por qué y cómo funciona el ciclo de 4 tiempos.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalContent',
  name: 'Visualizador del Motor de Combustión Interna',
  description: 'Funcionamiento del ciclo Otto, eficiencia térmica y comparativa motor térmico vs eléctrico.',
  educationalLevel: 'secondary',
  inLanguage: 'es',
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el ciclo Otto de 4 tiempos en un motor de gasolina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo Otto consta de cuatro fases: admisión (el pistón desciende aspirando la mezcla aire-combustible), compresión (el pistón sube comprimiendo la mezcla), explosión o trabajo (la bujía provoca la ignición y la expansión empuja el pistón hacia abajo generando potencia) y escape (el pistón sube expulsando los gases quemados). Este ciclo se repite entre 1.000 y 6.000 veces por minuto según las revoluciones del motor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un motor de combustión solo aprovecha el 30-35% de la energía del combustible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las pérdidas se distribuyen en tres grandes bloques: aproximadamente el 35% se disipa como calor a través del sistema de refrigeración, otro 35% se escapa con los gases de escape a alta temperatura, y un 5-10% se pierde por fricción mecánica entre pistones, bielas y cigüeñal. Solo el 30-35% restante se convierte en movimiento útil en las ruedas, lo que explica la baja eficiencia térmica de los motores de ciclo Otto convencionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia de eficiencia entre un motor de gasolina y un motor eléctrico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un motor eléctrico convierte entre el 85% y el 95% de la energía eléctrica en movimiento, frente al 30-35% de un motor de gasolina. Esta diferencia se debe a que el motor eléctrico no tiene pérdidas por calor de combustión ni necesita sistema de refrigeración por agua. Además, el motor eléctrico puede recuperar energía durante el frenado (frenada regenerativa), algo imposible en motores térmicos convencionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve estudiar el motor de combustión interna en Bachillerato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El motor de combustión es la aplicación práctica más directa de la termodinámica clásica: en él confluyen los conceptos de trabajo termodinámico, calor, eficiencia de ciclos (ciclo Otto ideal vs real) y el Segundo Principio de la Termodinámica. También ilustra conceptos de mecánica como conversión de movimiento lineal en rotativo a través de la biela-manivela. Es tema habitual en las pruebas de acceso a la universidad en asignaturas de Física y Tecnología Industrial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el ciclo Otto y el ciclo Diesel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo Otto (gasolina) usa una bujía para provocar la ignición de la mezcla ya comprimida, con una relación de compresión de 8:1 a 12:1. El ciclo Diesel no tiene bujía: el combustible se inyecta directamente sobre el aire ya comprimido a alta temperatura (relación de compresión de 14:1 a 25:1) y se inflama espontáneamente. El ciclo Diesel tiene una eficiencia teórica mayor (40-45%) gracias a la mayor relación de compresión, aunque produce más NOx y partículas finas.',
      },
    },
  ],
};
