import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Mascota - Cachorro y Gatito | meskeIA',
  description: 'Organiza la llegada de tu cachorro o gatito: checklist por etapas, lista de compras esenciales, calendario de vacunas y consejos de cuidado. Herramienta gratuita.',
  keywords: 'planificador mascota, checklist cachorro, lista compras perro, vacunas cachorro, cuidados gatito, preparar llegada cachorro, qué comprar para perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Mascota - Cachorro y Gatito',
    description: 'Checklist completo, lista de compras y calendario de vacunas para preparar la llegada de tu nueva mascota',
    url: 'https://meskeia.com/planificador-mascota/',
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
    title: 'Planificador de Mascota - Cachorro y Gatito',
    description: 'Organiza todo para la llegada de tu nueva mascota: checklist, compras y vacunas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Mascota",
  description: "Organiza la llegada de tu cachorro o gatito: checklist por etapas, lista de compras esenciales, calendario de vacunas y consejos de cuidado. Herramienta gratuita.",
  url: "https://meskeia.com/planificador-mascota/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué necesito comprar antes de que llegue mi cachorro a casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Antes de que llegue el cachorro conviene tener preparados los elementos básicos: cama o transportín, comedero y bebedero, collar con chapa identificativa, correa, juguetes seguros para mordedores y productos de limpieza e higiene. También es recomendable tener localizado un veterinario de confianza y pedir cita para la primera revisión en las primeras 48-72 horas. Esperar a tener todo listo antes de la llegada reduce el estrés tanto del animal como de los dueños.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay que vacunar a un cachorro por primera vez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El calendario vacunal básico del cachorro comienza entre las 6 y 8 semanas de vida con la primera dosis polivalente (moquillo, hepatitis, parvovirus). A las 10-12 semanas se refuerza con una segunda dosis y se añade la rabia si ya tiene edad legal para ello. A las 14-16 semanas suele completarse el ciclo inicial. Después se pauta una vacunación anual o trianual según el tipo de vacuna. El veterinario ajustará el calendario exacto según el historial previo del cachorro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta tener un perro o gato al mes en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste mensual varía mucho según el tamaño del animal y la ciudad, pero como referencia orientativa: alimentación de calidad media para un perro mediano oscila entre 40-80 €/mes; la peluquería canina (según raza) entre 30-80 € cada 6-8 semanas; el seguro veterinario ronda los 20-50 €/mes y los gastos veterinarios anuales (revisiones, desparasitaciones) suman otros 150-300 €/año. Un gato doméstico suele ser más económico. Conviene prever también un fondo de emergencia de 500-1.000 € para imprevistos sanitarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es obligatorio identificar con microchip a los animales de compañía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, en España la identificación con microchip es obligatoria para perros desde el año 2003 (Real Decreto 287/2002). Para los gatos la obligación varía según la comunidad autónoma, aunque la tendencia es a generalizarlo. El microchip debe implantarse antes de que el animal cumpla tres meses, o en el momento de la adquisición si ya los supera. Sin microchip el animal no puede inscribirse en el censo municipal ni viajar legalmente a otros países de la UE.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda un cachorro en adaptarse a su nuevo hogar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El período de adaptación típico es de 2 a 4 semanas, aunque en algunos casos puede extenderse hasta 3 meses. Durante las primeras 72 horas es normal que el cachorro esté asustado, no coma bien o llore por la noche al no tener a su madre ni a sus hermanos. Las claves para facilitar la adaptación son: mantener rutinas fijas de comidas y paseos, ofrecer un espacio seguro y tranquilo, evitar visitas masivas los primeros días y reforzar positivamente cualquier conducta correcta.',
      },
    },
  ],
};
