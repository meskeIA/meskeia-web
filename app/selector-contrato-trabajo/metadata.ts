import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Contrato — ¿Qué modalidad laboral te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué tipo de contrato o modalidad laboral se adapta mejor a tu perfil: indefinido, temporal, autónomo/freelance, prácticas o funcionario. Análisis según estabilidad, ingresos y flexibilidad.',
  keywords: [
    'qué contrato laboral elegir',
    'indefinido o autónomo',
    'trabajo temporal o fijo',
    'hacerse autónomo España',
    'oposiciones o empresa privada',
    'contrato prácticas becario',
    'modalidad laboral España',
    'freelance o empleado',
    'estabilidad laboral vs flexibilidad',
    'qué tipo de trabajo buscar',
  ],
  openGraph: {
    title: '¿Indefinido, autónomo o funcionario? Test laboral | meskeIA',
    description:
      'Descubre qué modalidad laboral se adapta mejor a tus prioridades de estabilidad, ingresos y estilo de vida.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-contrato-trabajo/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué tipo de contrato te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir entre contrato indefinido, temporal, autónomo, prácticas o funcionario.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-contrato-trabajo/' },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Contrato de Trabajo',
        description:
          'Test orientativo para saber qué modalidad laboral (indefinido, temporal, autónomo, prácticas o funcionario) se adapta mejor al perfil y prioridades vitales.',
        url: 'https://meskeia.com/selector-contrato-trabajo/',
        features: [
          'Test de 10 preguntas sobre perfil y prioridades',
          '5 modalidades: indefinido, temporal, autónomo, prácticas, funcionario',
          'Análisis de estabilidad, ingresos y flexibilidad',
          'Consideración de sector y etapa profesional',
          '100% en el navegador, gratuito, en español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Tipo de Contrato",
  description: "Test de 10 preguntas para saber qué tipo de contrato o modalidad laboral se adapta mejor a tu perfil: indefinido, temporal, autónomo/freelance, prácticas o funcionario. Análisis según estabilidad, ing",
  url: "https://meskeia.com/selector-contrato-trabajo/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre contrato indefinido y contrato temporal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El contrato indefinido no tiene fecha de finalización pactada y ofrece mayor estabilidad al trabajador; la indemnización por despido improcedente es de 33 días por año trabajado. El contrato temporal tiene una duración determinada, está justificado por causas concretas (obra, sustitución, circunstancias de la producción) y su indemnización al finalizar es de 12 días por año.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene hacerse autónomo en lugar de buscar empleo por cuenta ajena?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ser autónomo suele convenir cuando tienes varios clientes potenciales, toleras la variabilidad de ingresos y valoras la flexibilidad horaria sobre la seguridad. A partir de ingresos netos estables superiores a unos 1.800-2.000 € mensuales, la carga de cotizaciones a la Seguridad Social puede compensarse con la mayor autonomía y posibilidad de deducir gastos. Para proyectos puntuales o con un único cliente habitual, la empresa puede preferir contratarte como empleado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un contrato en prácticas y quién puede firmarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El contrato formativo en alternancia o en prácticas (regulado tras la reforma laboral de 2022) está destinado a jóvenes de hasta 30 años que hayan terminado recientemente sus estudios. La duración oscila entre 3 meses y 2 años, el salario no puede ser inferior al 60-85 % del convenio según el año, y la cotización es completa desde el inicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué modalidad laboral ofrece mayor estabilidad económica a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El empleo público (funcionario o laboral fijo) suele ofrecer la mayor estabilidad: inamovilidad del puesto, salario garantizado y acceso a una pensión pública completa. Le sigue el contrato indefinido en empresa privada. El trabajo autónomo puede generar mayores ingresos brutos, pero con mayor variabilidad y sin cobertura de desempleo en la mayoría de los casos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre freelance y autónomo en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España, "freelance" es un término anglosajón que describe el trabajo por proyectos o encargos; desde el punto de vista legal, cualquier freelance que ejerza una actividad económica habitual debe darse de alta como autónomo en el RETA (Régimen Especial de Trabajadores Autónomos). Es decir, todo freelance en España es autónomo, aunque no todo autónomo trabaja como freelance (también hay autónomos con empleados o con actividades más estables).',
      },
    },
  ],
};
