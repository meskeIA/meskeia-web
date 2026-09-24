import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { orientacionEnFrase, PREGUNTA_ANTIGUEDAD, PREGUNTA_VALOR } from './motor';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Coche, Carro o Auto | ¿Terceros o Todo Riesgo? | meskeIA',
  description: 'Test de 10 preguntas para saber qué modalidad de seguro de coche (carro o auto) necesitas: terceros básico, terceros ampliado, todo riesgo con franquicia o todo riesgo sin franquicia.',
  keywords: ['qué seguro de coche elegir', 'seguro de carro', 'seguro de auto', 'terceros o todo riesgo', 'seguro coche todo riesgo con franquicia', 'terceros ampliado', 'seguro coche según valor', 'modalidad seguro automóvil', 'seguro carro nuevo o usado', 'cuánto vale asegurar el carro', 'cobertura seguro auto', 'seguro coche joven'],
  openGraph: {
    title: 'Selector de Seguro de Coche, Carro o Auto — ¿Terceros o Todo Riesgo?',
    description: 'Descubre qué modalidad de seguro de coche, carro o auto se adapta mejor a tu situación en 10 preguntas.',
    url: 'https://meskeia.com/selector-seguro-coche/',
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
  name: "Selector de Seguro de Coche, Carro o Auto",
  description: "Test de 10 preguntas para saber qué modalidad de seguro de coche (carro o auto) necesitas: terceros básico, terceros ampliado, todo riesgo con franquicia o todo riesgo sin franquicia.",
  url: "https://meskeia.com/selector-seguro-coche/",
  category: 'FinanceApplication',
  // Iba vacío y el WebApplication se servía con "featureList":[] (hallazgo 1485, §1.ter).
  features: [
    'Test de 10 preguntas sobre el coche, su uso y quién lo conduce',
    'Recomienda una de cuatro modalidades: terceros básico, terceros ampliado, todo riesgo con franquicia o sin franquicia',
    'Anuncia los empates y el criterio que los deshace',
    'Avisa cuando lo que declaras choca con la recomendación: financiación, valor del coche, uso profesional o conductores jóvenes',
    'Coberturas habituales de cada modalidad y lo que no cubre',
    'Guía sobre el seguro obligatorio en España, la franquicia y la contratación',
    'Sin registro ni datos personales',
  ],
});

/*
 * El FAQPage es lo que leen buscadores e IA: no puede decir otra cosa que la pantalla. La
 * pregunta de cuándo compensa el todo riesgo sale de los MISMOS pesos que la guía (motor.ts):
 * antes decía «terceros ampliado» para más de diez años donde la guía decía «básico», con otros
 * tramos de edad (hallazgo 1480). Fuera también las cifras sin fuente ni año: «más de 500 €
 * anuales», «8.000-10.000 €» y la franquicia «entre 150 y 600 €» (hallazgo 1483).
 */
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre seguro a terceros y todo riesgo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el seguro de coche (también llamado seguro de carro o seguro de auto según el país), el de terceros cubre los daños que tú causas a otros vehículos o personas, pero no repara tu propio coche. El todo riesgo, además, cubre los daños de tu vehículo independientemente de quién tenga la culpa, incluidos los provocados por ti mismo. En España, lo único que exige la ley es la responsabilidad civil obligatoria, que es lo que cubre el seguro a terceros básico; el todo riesgo es voluntario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo compensa contratar todo riesgo para el coche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `No hay una cifra que valga para todos: depende de lo que cueste la prima frente al valor del coche y de si podrías pagar una reparación de tu bolsillo. Como punto de partida, este test empuja así según la antigüedad: ${orientacionEnFrase(PREGUNTA_ANTIGUEDAD)}; y según el valor de mercado: ${orientacionEnFrase(PREGUNTA_VALOR)}. Si el coche está financiado, revisa el contrato: puede exigir todo riesgo, aunque la ley solo obliga a la responsabilidad civil.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el todo riesgo con franquicia y para quién es recomendable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El todo riesgo con franquicia cubre los daños propios, pero el asegurado paga una cantidad fija (la franquicia, cuyo importe fija cada póliza) en cada siniestro. La prima anual es inferior al todo riesgo sin franquicia, por lo que resulta adecuado para conductores experimentados con bajo historial de siniestros que quieren protección ante daños graves sin pagar la prima más alta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cubre el seguro a terceros ampliado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El terceros ampliado incluye la cobertura básica obligatoria de responsabilidad civil más coberturas adicionales opcionales como robo, incendio, rotura de lunas y, en algunos casos, asistencia en viaje extendida o daños por fenómenos naturales. Es una opción intermedia que ofrece más protección que el mínimo legal sin llegar al coste del todo riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Influye la antigüedad del carné en la modalidad de seguro recomendada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los conductores noveles (con menos de dos años de carné) suelen tener primas más altas en cualquier modalidad, por lo que a veces el sobrecoste del todo riesgo resulta menos proporcionado. Sin embargo, la inexperiencia también implica mayor riesgo de siniestro propio, lo que puede justificar el todo riesgo si el vehículo tiene un valor elevado. La antigüedad del carné es uno de los factores clave en los baremos de las aseguradoras.',
      },
    },
  ],
};
