import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo se Construye un Edificio - Fases, Oficios y Materiales | meskeIA',
  description: 'Descubre las 7 fases de construcción de un edificio residencial: cimentación, estructura, fachada, instalaciones y acabados. Oficios, materiales y plazos explicados visualmente.',
  keywords: 'construcción edificio, fases construcción, oficios construcción, materiales obra, licencia obra, cimentación, estructura, albañilería, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo se Construye un Edificio - Fases, Oficios y Materiales',
    description: 'Las 7 fases de construcción, 15+ oficios y los números reales de un edificio de 30 viviendas en España.',
    url: 'https://meskeia.com/visualizador-construccion-edificio/',
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
    title: 'Cómo se Construye un Edificio - Fases, Oficios y Materiales',
    description: '7 fases, 15+ oficios, 2.500 toneladas de hormigón: todo lo que hay detrás de un edificio residencial.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Construcción Edificio meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo se Construye un Edificio',
  description: 'Explicador visual interactivo sobre la construcción de un edificio residencial de 30 viviendas en España: fases de obra, oficios involucrados, materiales y cantidades, tiempos y licencias necesarias.',
  url: 'https://meskeia.com/visualizador-construccion-edificio/',
  category: 'EducationalApplication',
  features: [
    'Timeline vertical con las 7 fases de construcción',
    '15+ oficios con su momento de entrada en la obra',
    'Materiales y cantidades reales de un edificio de 30 viviendas',
    'Desglose de tiempos y licencias: de la idea a las llaves',
    'Coste por m² en España',
    'Cronología del proceso administrativo: licencias, visados y plazos',
    'Datos cuantitativos reales de un edificio de 30 viviendas en España',
    'Glosario de términos técnicos y gremios de la construcción',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en construirse un edificio residencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un edificio residencial de entre 20 y 40 viviendas tarda habitualmente entre 24 y 36 meses desde la obtención de la licencia de obras hasta la entrega de llaves. El proceso previo —redacción del proyecto, visados colegiales y tramitación municipal— puede añadir entre 6 y 18 meses adicionales. Los plazos varían considerablemente según el ayuntamiento, la complejidad del terreno y las condiciones climáticas durante la ejecución.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las principales fases de construcción de un edificio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las fases principales son: 1) Trabajo previo y movimiento de tierras; 2) Cimentación (zapatas o pilotes); 3) Estructura (pilares, forjados y muros de carga); 4) Cerramiento y fachada; 5) Instalaciones (electricidad, fontanería, climatización, telecomunicaciones); 6) Acabados interiores (alicatados, solados, carpintería, pintura); 7) Urbanización y entrega. Cada fase requiere oficios distintos y no puede iniciarse hasta completar la anterior.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta construir un edificio de viviendas por metro cuadrado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de construcción de un edificio plurifamiliar en España oscila entre 1.200 y 1.800 €/m² construido, dependiendo de la calidad de los materiales y la ubicación. A eso hay que sumar el suelo (muy variable), honorarios de proyecto (entre el 5 % y el 8 % del presupuesto) y tributos. Un edificio de 30 viviendas de 80 m² puede requerir una inversión total que va de 3 a 6 millones de euros sin contar el precio del solar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué oficios participan en la construcción de un edificio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Intervienen más de 15 oficios distintos a lo largo de la obra: topógrafo, excavador y encofrador en las primeras fases; ferrallista y hormigonero en la estructura; albañil, fontanero, electricista y instalador de climatización en las instalaciones; alicatador, solador, carpintero de madera, carpintero de aluminio y pintor en los acabados. El aparejador o arquitecto técnico supervisa la ejecución y coordina a todos los gremios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué licencias necesita un promotor antes de empezar a construir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El proceso administrativo incluye: aprobación del Plan de Ordenación Urbanística (o uso del suelo), visado del proyecto por el colegio de arquitectos, solicitud y concesión de la licencia de obras municipales, y alta en la Seguridad Social del centro de trabajo (apertura de obra). Una vez finalizado el edificio se requiere la licencia de primera ocupación o cédula de habitabilidad para poder habitarlo o venderlo legalmente.',
      },
    },
  ],
};
