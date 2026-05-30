import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Efecto Invernadero - Mecanismo, Gases y Cambio Climático | meskeIA',
  description: 'Entiende el efecto invernadero paso a paso: radiación solar, gases (CO₂, metano, N₂O), diferencia entre efecto natural y antropogénico, datos históricos de CO₂ (280→425 ppm) y soluciones. Explicador visual interactivo.',
  keywords: 'efecto invernadero, CO2, metano, cambio climatico, calentamiento global, gases, radiacion infrarroja, GWP, Acuerdo de Paris, huella de carbono',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Efecto Invernadero - Mecanismo, Gases y Cambio Climático',
    description: 'El mecanismo del efecto invernadero explicado visualmente: radiación solar e infrarroja, los 4 gases principales, natural vs antropogénico, y soluciones.',
    url: 'https://meskeia.com/visualizador-efecto-invernadero/',
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
    title: 'El Efecto Invernadero - Explicador Visual Interactivo',
    description: 'CO₂, metano, vapor de agua: cómo funcionan los gases de efecto invernadero y por qué el exceso es el problema.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Efecto Invernadero meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Efecto Invernadero - Mecanismo, Gases y Cambio Climático',
  description: 'Explicador visual interactivo sobre el efecto invernadero: cómo la radiación solar entra, la superficie la reemite como infrarrojo y los gases la atrapan. Comparativa de gases (CO₂, metano, N₂O, vapor de agua), evolución histórica del CO₂, escenarios de calentamiento y soluciones.',
  url: 'https://meskeia.com/visualizador-efecto-invernadero/',
  category: 'EducationalApplication',
  features: [
    'Diagrama SVG del mecanismo: radiación solar → superficie → infrarrojo → gases',
    'Los 4 principales gases: CO₂, metano, N₂O y vapor de agua con GWP comparativo',
    'Evolución histórica del CO₂: de 280 ppm preindustrial a 425 ppm actual',
    'Escenarios de calentamiento: +1,5°C, +2°C y +4°C con consecuencias',
    'Fuentes antropogénicas desglosadas por sector',
    'Huella de carbono media en España (~6 t CO₂/año)',
    'Feedback loops y soluciones (renovables, captura de carbono, reforestación)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el efecto invernadero y por qué es necesario para la vida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto invernadero es un proceso natural por el que ciertos gases de la atmósfera (principalmente vapor de agua, CO₂ y metano) absorben la radiación infrarroja que emite la superficie terrestre y la reemiten hacia abajo, manteniendo el planeta más cálido. Sin este efecto, la temperatura media de la Tierra sería de unos -18 °C en lugar de los +15 °C actuales, haciendo imposible la vida tal como la conocemos. El problema no es el efecto invernadero en sí, sino su intensificación por las emisiones humanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales gases de efecto invernadero y cuál tiene más impacto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales gases son el vapor de agua (el más abundante de forma natural), el dióxido de carbono (CO₂), el metano (CH₄) y el óxido nitroso (N₂O). El CO₂ es el más relevante desde el punto de vista antropogénico porque persiste siglos en la atmósfera y su concentración ha pasado de 280 ppm antes de la industrialización a más de 425 ppm en la actualidad. El metano tiene un Potencial de Calentamiento Global (GWP) unas 80 veces mayor que el CO₂ a 20 años, pero permanece menos tiempo en la atmósfera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto ha aumentado el CO₂ atmosférico y qué consecuencias tiene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La concentración de CO₂ en la atmósfera ha pasado de aproximadamente 280 ppm (partes por millón) en la era preindustrial a más de 425 ppm en 2024, el nivel más alto en al menos 800.000 años según registros de núcleos de hielo. Este aumento se correlaciona con un calentamiento global de aproximadamente 1,2 °C respecto a niveles preindustriales, lo que ya está provocando el deshielo de glaciares, el aumento del nivel del mar, episodios meteorológicos más extremos y alteraciones en los ecosistemas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el efecto invernadero natural y el antropogénico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto invernadero natural es el que mantiene la temperatura terrestre habitable gracias a gases presentes en la atmósfera por procesos geológicos y biológicos. El efecto invernadero antropogénico se refiere al reforzamiento artificial de ese efecto por las emisiones humanas: la quema de combustibles fósiles, la deforestación, la agricultura intensiva y la industria han añadido una cantidad extraordinaria de GEI a la atmósfera en poco más de 200 años, acelerando el calentamiento a un ritmo que los ecosistemas y las sociedades tienen dificultades para absorber.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los "bucles de retroalimentación" climáticos y por qué son importantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los bucles de retroalimentación (feedback loops) son mecanismos que amplifican o amortiguan el calentamiento inicial. Un ejemplo clave: al derretirse el hielo ártico, desaparece su superficie blanca reflectante y queda expuesto el océano oscuro, que absorbe más calor, acelerando el deshielo. Otro: al calentarse las regiones árticas, el permafrost libera metano atrapado, que intensifica el efecto invernadero. Estos bucles positivos son una de las razones por las que limitar el calentamiento a 1,5 °C es tan urgente: más allá de ciertos umbrales los procesos pueden volverse difíciles de detener.',
      },
    },
  ],
};
