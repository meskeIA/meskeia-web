import { Metadata } from 'next';
import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Plazos Legales España - Guía de Prescripción y Caducidad | meskeIA',
  description: 'Consulta los plazos legales más importantes en España: garantías, prescripción de deudas, reclamaciones, devoluciones y más. Información actualizada con referencias legales.',
  keywords: 'plazos legales España, prescripción deudas, garantía productos, caducidad reclamaciones, derecho desistimiento, plazos consumidor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Plazos Legales España - Guía de Prescripción y Caducidad',
    description: 'Consulta los plazos legales más importantes en España: garantías, deudas, reclamaciones y más.',
    url: 'https://meskeia.com/plazos-legales/',
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
    title: 'Plazos Legales España',
    description: 'Guía de plazos de prescripción y caducidad en España',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Plazos Legales España - Guía de Prescripción y Caducidad',
  description: 'Consulta los plazos legales más importantes en España: garantías, prescripción de deudas, reclamaciones, devoluciones y más. Información actualizada con referencias legales.',
  url: 'https://meskeia.com/plazos-legales/',
  category: 'EducationalApplication',
  features: [
    'Plazos de garantía de productos y servicios según normativa española',
    'Prescripción de deudas por tipo (civil, mercantil, hipotecaria)',
    'Plazos de reclamación laboral al finalizar contratos',
    'Devoluciones en comercio electrónico y tienda física',
    'Referencias a normativa española vigente (Código Civil, TRLGDCU, ET)',
  ],
});

export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/plazos-legales/',
  mainEntity: [
    {
      question: '¿Cuánto dura la garantía de un producto en España?',
      answer: 'En España, el plazo de garantía legal de los bienes de consumo es de tres años para productos adquiridos a partir del 1 de enero de 2022, gracias a la transposición de la Directiva Europea 2019/771 mediante el Real Decreto Legislativo 1/2007 (TRLGDCU), reformado por la Ley 3/2023. Para productos comprados antes de esa fecha, el plazo era de dos años. Durante los primeros dos años se presume que el defecto existía desde el momento de la entrega, por lo que el vendedor debe demostrar lo contrario. En el tercer año es el consumidor quien debe acreditar que el defecto es de origen. Para bienes digitales (software, contenidos, servicios digitales), el plazo también es de dos o tres años dependiendo de si el suministro es puntual o continuo.',
    },
    {
      question: '¿Cuándo prescribe una deuda en España?',
      answer: 'El plazo de prescripción de las deudas en España varía según su naturaleza. Tras la reforma del Código Civil de 2015, la prescripción general de las acciones personales se redujo a cinco años (artículo 1964 CC), aplicable a la mayoría de deudas civiles como préstamos personales o facturas impagadas. Las deudas con la Seguridad Social prescriben a los cuatro años. Las deudas tributarias con Hacienda también prescriben a los cuatro años desde que se pudo exigir su pago. Las hipotecas tienen un plazo de prescripción de veinte años. Las deudas derivadas de responsabilidad extracontractual (por ejemplo, accidentes) prescriben al año. Es importante recordar que cualquier acto de reclamación fehaciente interrumpe el plazo de prescripción y este vuelve a empezar desde cero.',
    },
    {
      question: '¿Cuáles son los plazos para devolver una compra online o en tienda física?',
      answer: 'En España, para las compras realizadas por internet, teléfono o fuera del establecimiento comercial, el consumidor tiene un derecho de desistimiento de 14 días naturales desde la recepción del producto, sin necesidad de justificación (artículo 102 TRLGDCU). Si el vendedor no informó correctamente sobre este derecho, el plazo se amplía a 12 meses. En tienda física, no existe una obligación legal general de aceptar devoluciones salvo que el producto esté defectuoso; las políticas de devolución son una decisión comercial voluntaria de cada establecimiento. Sin embargo, si el artículo tiene un defecto o no se ajusta a lo pactado, el consumidor puede exigir la reparación, sustitución, reducción de precio o resolución del contrato dentro del plazo de garantía legal de tres años.',
    },
    {
      question: '¿Qué plazos hay que respetar al finalizar un contrato de trabajo?',
      answer: 'Al finalizar un contrato laboral en España existen varios plazos clave regulados por el Estatuto de los Trabajadores (ET) y convenios colectivos. La reclamación por despido improcedente debe presentarse en el plazo de 20 días hábiles desde la fecha del despido (artículo 59.3 ET), acudiendo primero a conciliación ante el SMAC. La reclamación de cantidades salariales pendientes (nóminas, pagas extras, finiquito) prescribe a un año desde que se debieron abonar. El plazo de preaviso en caso de dimisión del trabajador lo fija el convenio colectivo (habitualmente 15 días). Para solicitar la prestación por desempleo, el plazo es de 15 días hábiles desde la situación legal de desempleo; si se supera, se pierde el tiempo transcurrido de prestación.',
    },
    {
      question: '¿Cuánto tiempo tiene un consumidor para reclamar un servicio defectuoso?',
      answer: 'En España, el plazo para reclamar por un servicio defectuoso depende de la vía elegida y del tipo de servicio. Para servicios contratados por internet o fuera del establecimiento, el derecho de desistimiento es de 14 días naturales desde la firma del contrato (sin necesidad de alegar motivo). Si el servicio se ha prestado de forma defectuosa o incompleta, la acción de reclamación civil por incumplimiento contractual prescribe a los cinco años según el artículo 1964 del Código Civil. Para servicios financieros (seguros, préstamos, inversiones), el organismo supervisor es el Banco de España, la CNMV o la DGSFP, y los plazos para presentar reclamaciones suelen ser de uno a dos años. Antes de acudir a la vía judicial, es recomendable agotar la vía extrajudicial: reclamación al servicio de atención al cliente, a organismos de consumo o a OMIC.',
    },
  ],
});
