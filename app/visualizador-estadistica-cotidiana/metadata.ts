import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estadística en la Vida Cotidiana - Probabilidad y Sesgos | meskeIA',
  description: 'Entiende la estadística sin matemáticas: probabilidad condicional, regresión a la media, paradoja de Simpson, sesgo de supervivencia y la ley de los grandes números con ejemplos cotidianos.',
  keywords: ['estadistica cotidiana', 'probabilidad condicional', 'teorema bayes', 'regresion media', 'paradoja simpson', 'sesgo supervivencia', 'ley grandes numeros', 'estadistica ejemplos vida real', 'pensamiento estadistico'],
  openGraph: {
    title: 'Estadística en la Vida Cotidiana | meskeIA',
    description: 'Probabilidad, sesgos estadísticos y paradojas con ejemplos de la vida real.',
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
  name: "Estadística en la Vida Cotidiana - Probabilidad y Sesgos",
  description: "Entiende la estadística sin matemáticas: probabilidad condicional, regresión a la media, paradoja de Simpson, sesgo de supervivencia y la ley de los grandes números con ejemplos cotidianos.",
  url: "https://meskeia.com/visualizador-estadistica-cotidiana/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la regresión a la media y por qué nos confunde en la vida diaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regresión a la media es la tendencia de los valores extremos a acercarse al promedio en mediciones posteriores. Por ejemplo, un estudiante que saca una nota muy alta en un examen probablemente obtendrá una nota más cercana a su promedio habitual en el siguiente, sin que eso signifique que empeoró. Este fenómeno nos lleva a atribuir causalidad (un castigo, una recompensa) a lo que en realidad es variación natural alrededor de la media.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la paradoja de Simpson y cómo puede dar lugar a conclusiones erróneas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La paradoja de Simpson ocurre cuando una tendencia que aparece en grupos de datos separados desaparece o se invierte al combinarlos. Un ejemplo clásico es comparar las tasas de admisión universitaria por género: cada departamento puede mostrar la misma tasa de aceptación, pero los datos agregados parecen indicar discriminación si las mujeres solicitan más plazas en los departamentos más competitivos. Entender esta paradoja es clave para interpretar estadísticas en medicina, economía o ciencias sociales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el sesgo de supervivencia y cómo afecta a la información que recibimos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sesgo de supervivencia consiste en centrar el análisis solo en los casos que "sobrevivieron" o tuvieron éxito, ignorando los que fracasaron. Cuando escuchamos historias de empresas que empezaron en un garaje y llegaron a valer millones, nunca oímos las de los miles que empezaron igual y quebraron. Este sesgo distorsiona nuestra percepción del riesgo y la probabilidad de éxito en muchos ámbitos, desde inversiones hasta dietas y tratamientos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve entender la probabilidad condicional en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La probabilidad condicional mide la probabilidad de un evento dado que ya ha ocurrido otro evento relacionado. En la práctica, permite interpretar correctamente resultados de pruebas médicas: un test positivo con alta sensibilidad no significa que la enfermedad sea probable si la prevalencia es muy baja. El teorema de Bayes formaliza este razonamiento y ayuda a actualizar creencias a medida que llega nueva información, siendo fundamental en diagnóstico médico, filtros de spam y toma de decisiones bajo incertidumbre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos datos hacen falta para que la ley de los grandes números sea fiable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley de los grandes números establece que, al aumentar el número de observaciones, el promedio muestral se acerca al promedio real de la población. No hay un umbral universal: depende de la variabilidad del fenómeno. Para lanzar una moneda y estimar la probabilidad de cara con un margen de error del 5%, se necesitan alrededor de 400 lanzamientos. En fenómenos más variables (por ejemplo, rendimientos de bolsa) hacen falta miles de datos. La intuición de que "con pocos datos ya se ve la tendencia" es uno de los errores estadísticos más comunes.',
      },
    },
  ],
};
