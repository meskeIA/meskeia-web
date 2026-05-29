import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Gimnasio | ¿Qué Tipo de Entrenamiento te Conviene? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de entrenamiento o gimnasio se adapta mejor a ti: gimnasio tradicional, CrossFit o funcional, yoga o pilates, entrenamiento en casa o al aire libre.',
  keywords: [
    'qué tipo de gimnasio elegir',
    'crossfit o gimnasio tradicional',
    'yoga o pilates',
    'entrenamiento en casa o gimnasio',
    'gimnasio según objetivos',
    'fitness funcional España',
    'entrenamiento al aire libre',
    'cómo elegir gimnasio',
    'pilates o yoga diferencias',
    'tipo entrenamiento según perfil',
  ],
  openGraph: {
    title: 'Selector de Tipo de Gimnasio — ¿Qué Entrenamiento te Conviene?',
    description: 'Descubre qué tipo de entrenamiento o gimnasio se adapta mejor a ti en 10 preguntas.',
    url: 'https://meskeia.com/selector-tipo-gimnasio/',
    siteName: 'meskeIA',
    locale: 'es_ES',
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
  name: "Selector de Tipo de Gimnasio",
  description: "Test de 10 preguntas para saber qué tipo de entrenamiento o gimnasio se adapta mejor a ti: gimnasio tradicional, CrossFit o funcional, yoga o pilates, entrenamiento en casa o al aire libre.",
  url: "https://meskeia.com/selector-tipo-gimnasio/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué tipo de entrenamiento es mejor para perder grasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un único tipo de entrenamiento superior para perder grasa: lo más determinante es el déficit calórico sostenido a través de la dieta. Dicho esto, combinar entrenamiento de fuerza con actividad cardiovascular moderada mejora la composición corporal y preserva la masa muscular durante la pérdida de peso. El entrenamiento funcional de alta intensidad (como el CrossFit) puede ser eficaz, pero requiere una buena base física previa para evitar lesiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre yoga y pilates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El yoga es una práctica con raíces filosóficas y espirituales que combina posturas (asanas), respiración y meditación. Existen muchos estilos, desde el suave (Hatha, Yin) hasta el más intenso (Ashtanga, Vinyasa). El pilates es un sistema de ejercicio desarrollado en el siglo XX que se centra en el fortalecimiento del núcleo (core), la alineación postural y la respiración controlada, sin componente espiritual. Pilates es especialmente recomendado para rehabilitación y problemas de espalda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es efectivo entrenar en casa sin equipamiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El entrenamiento en casa con el peso corporal (calistenia) es perfectamente válido para mejorar la condición física, especialmente para personas principiantes o intermedias. Ejercicios como sentadillas, flexiones, dominadas y planchas permiten trabajar todos los grupos musculares. La principal limitación aparece en etapas avanzadas, donde la progresión de carga se complica sin pesas. La constancia y la planificación de la progresión son más determinantes que el lugar de entrenamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el CrossFit y para quién está recomendado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CrossFit es una metodología de entrenamiento de alta intensidad que combina ejercicios de halterofilia, gimnasia y cardio en sesiones variadas llamadas WOD (Workout of the Day). Está orientado a personas que buscan un reto físico constante, disfrutan del ambiente de grupo y de la competición. Requiere aprender técnica de movimientos olímpicos correctamente para minimizar el riesgo de lesión, por lo que no es la opción más adecuada para personas sedentarias o con lesiones articulares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia semanal hay que ir al gimnasio para ver resultados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recomendación general para obtener mejoras visibles en fuerza y composición corporal es entrenar entre 3 y 5 días a la semana, con al menos un día de descanso entre sesiones de los mismos grupos musculares. Para principiantes, 3 sesiones semanales de cuerpo completo son suficientes para progresar. Los resultados también dependen de la calidad del sueño, la nutrición y la consistencia a lo largo del tiempo, más que de la frecuencia puntual.',
      },
    },
  ],
};
