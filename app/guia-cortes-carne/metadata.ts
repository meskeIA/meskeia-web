import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Cortes de Carne - Vacuno, cerdo, cordero y pollo | meskeIA',
  description: '45 cortes de carne: animal, parte del animal, terneza, método de cocción ideal, temperatura interna y consejos de cocina. Vacuno, cerdo, cordero, pollo y ternera.',
  keywords: 'cortes carne, chuleton, solomillo, secreto iberico, costillas, pierna cordero, pechuga pollo, temperatura carne, metodos coccion carne, guia carniceria, carne vacuno cerdo cordero',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Cortes de Carne | meskeIA',
    description: '45 cortes de carne: animal, terneza, método de cocción ideal y temperatura interna. Vacuno, cerdo, cordero, pollo y ternera.',
    url: 'https://meskeia.com/guia-cortes-carne/',
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
    title: 'Guía de Cortes de Carne | meskeIA',
    description: '45 cortes de carne: terneza, métodos de cocción y temperatura interna ideal.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía de Cortes de Carne meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Cortes de Carne',
  description: 'Directorio de 45 cortes de carne con información sobre el animal, parte del animal, nivel de terneza, grasa, métodos de cocción ideales, temperatura interna, precio aproximado y consejos de cocina. Incluye vacuno, cerdo ibérico, cordero, pollo y ternera.',
  url: 'https://meskeia.com/guia-cortes-carne/',
  features: [
    '45 cortes con perfil completo',
    'Filtros por animal y método de cocción',
    'Búsqueda por nombre, nombre alternativo o parte del animal',
    'Temperatura interna ideal y tiempo de cocción orientativo',
    'Consejos prácticos de cocina para cada corte',
    'Curiosidades históricas y culturales',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la temperatura interna correcta para cocinar carne de vacuno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temperatura interna recomendada varía según el punto de cocción: poco hecho (55-57 °C), al punto (60-63 °C), bien hecho (70 °C o más). Para hamburguesas y carne picada siempre se recomienda alcanzar al menos 71 °C en el centro para eliminar posibles patógenos. Las carnes enteras como el solomillo o el chuletón pueden consumirse en punto sin riesgo si la superficie ha superado los 65 °C.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el solomillo y el lomo de vacuno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El solomillo es el músculo más interno y menos ejercitado del lomo bajo del bovino, lo que lo convierte en el corte más tierno y con menos grasa infiltrada. El lomo, en cambio, hace referencia a la zona dorsal en su conjunto e incluye el lomo alto (entrecot, chuletón con hueso) y el lomo bajo. El lomo alto tiene más marmoleo (grasa intramuscular) que el solomillo, lo que le aporta más sabor aunque ligeramente menos terneza.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el mejor método de cocción para cortes duros como el morcillo o la paleta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cortes duros con mucho tejido conectivo como el morcillo, la paleta, el brazuelo o la carrillera son ideales para cocciones largas a baja temperatura: guisos, estofados, braseados o cocción al vacío (sous vide) a 70-80 °C durante 8-24 horas. El calor prolongado transforma el colágeno en gelatina, lo que produce una textura melosa y jugosa. Estos cortes no son adecuados para plancha o parrilla rápida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el secreto ibérico y cómo se cocina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El secreto ibérico es un corte del cerdo ibérico situado entre la paleta y la cabeza de lomo, con una infiltración de grasa característica que le aporta un sabor y jugosidad excepcionales. Es uno de los cortes más valorados de la cocina española contemporánea. Se cocina mejor a la plancha o parrilla a fuego vivo durante 3-4 minutos por lado, dejando el interior ligeramente rosado (60-65 °C interno); la grasa infiltrada protege la carne de la sobrecocción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo hay que reposar la carne tras la cocción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reposo es un paso clave para obtener una carne jugosa: permite que los jugos internos, que se concentran en el centro durante la cocción, se redistribuyan hacia las fibras musculares. Como regla general, se recomienda reposar la carne entre 5 y 10 minutos para piezas pequeñas (entrecot, solomillo) y hasta 15-20 minutos para piezas grandes. Durante el reposo la temperatura interna sigue subiendo 2-3 °C, lo que debe tenerse en cuenta para retirar la carne del fuego un poco antes del punto deseado.',
      },
    },
  ],
};
