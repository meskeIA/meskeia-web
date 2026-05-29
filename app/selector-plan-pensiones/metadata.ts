import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Plan de Pensiones — ¿Te conviene contratar uno? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene un plan de pensiones individual, de empleo, EPSV (País Vasco/Navarra) o si es mejor no contratar ninguno. Análisis según perfil fiscal, horizonte temporal y liquidez.',
  keywords: [
    'plan de pensiones sí o no',
    'conviene plan de pensiones',
    'plan pensiones individual o empleo',
    'EPSV País Vasco',
    'ahorro jubilación España',
    'ventajas fiscales plan pensiones',
    'plan pensiones 2025',
    'alternativas al plan de pensiones',
    'fondo pensiones o indexado',
    'deducción IRPF plan pensiones',
  ],
  openGraph: {
    title: '¿Te conviene un plan de pensiones? Test en 10 preguntas | meskeIA',
    description:
      'Descubre si deberías contratar un plan de pensiones individual, de empleo, EPSV o ninguno, según tu perfil fiscal, horizonte y necesidad de liquidez.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-plan-pensiones/',
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
    title: '¿Plan de pensiones sí o no? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para saber qué opción de ahorro para la jubilación se adapta a tu situación fiscal y vital.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-plan-pensiones/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Plan de Pensiones',
        description:
          'Test orientativo para saber si conviene contratar un plan de pensiones individual, de empleo, EPSV o ninguno según perfil fiscal, horizonte temporal y necesidades de liquidez.',
        url: 'https://meskeia.com/selector-plan-pensiones/',
        features: [
          'Test de 10 preguntas sobre perfil fiscal y vital',
          'Análisis de 5 opciones: individual, empleo, EPSV, diversificar, ninguno',
          'Consideración de ventajas fiscales IRPF',
          'Alertas sobre liquidez y penalizaciones',
          'Comparativa de alternativas al plan tradicional',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Plan de Pensiones",
  description: "Test de 10 preguntas para saber si te conviene un plan de pensiones individual, de empleo, EPSV (País Vasco/Navarra) o si es mejor no contratar ninguno. Análisis según perfil fiscal, horizonte tempora",
  url: "https://meskeia.com/selector-plan-pensiones/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Merece la pena contratar un plan de pensiones en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de tu tipo marginal de IRPF y de tu horizonte hasta la jubilación. Si tributas al 30 % o más, la deducción fiscal puede ser significativa a corto plazo. Sin embargo, en 2022 el límite de aportación individual se redujo a 1.500 € anuales, lo que limita el beneficio para rentas medias. Para la mayoría de ahorradores con tipo marginal bajo o con necesidad de liquidez en menos de 10 años, un fondo indexado suele ser más flexible y puede ofrecer mejor rentabilidad neta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un plan de pensiones individual y uno de empleo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plan de empleo lo promueve la empresa y permite aportar hasta 8.500 € anuales adicionales (suma empresa + trabajador), frente a los 1.500 € del plan individual. Ambos deducen en IRPF, pero el de empleo tiene límites más generosos y suele contar con menores comisiones de gestión. Si tu empresa ofrece un plan de empleo con aportación del empleador, es habitualmente la opción más ventajosa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una EPSV y en qué se diferencia de un plan de pensiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las EPSV (Entidades de Previsión Social Voluntaria) son la figura equivalente al plan de pensiones en el País Vasco y Navarra, reguladas por la normativa foral. Permiten aportaciones más altas (hasta 5.000 € anuales con deducción en la base del IRPF foral) y tienen condiciones de rescate similares. Solo pueden contratarlas residentes en esos territorios forales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo puedo rescatar un plan de pensiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los planes de pensiones tienen liquidez muy limitada: solo se puede rescatar al llegar a la jubilación, en caso de desempleo de larga duración, enfermedad grave, fallecimiento o incapacidad permanente. Desde 2025 también es posible rescatar aportaciones con más de 10 años de antigüedad. El rescate tributa como rendimiento del trabajo en IRPF, por lo que hacerlo en un año con rentas altas puede suponer un coste fiscal elevado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué alternativas existen al plan de pensiones para ahorrar de cara a la jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales alternativas son los fondos de inversión indexados (sin comisiones de rescate, tributación más favorable en plusvalías al 19-28 %), los planes de ahorro a largo plazo (PALP, con exención si se mantienen 5 años), el seguro de vida-ahorro (PIAS) y los depósitos o cuentas remuneradas para perfiles conservadores. La elección óptima depende de tu tipo marginal actual, el tipo marginal previsto en la jubilación, tu horizonte temporal y tu tolerancia a la iliquidez.',
      },
    },
  ],
};
