import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador Autónomo vs SL 2025 - ¿Qué conviene más fiscalmente? | meskeIA',
  description: 'Compara orientativamente la carga fiscal entre ser autónomo (IRPF + RETA) y constituir una Sociedad Limitada (IS 25% + dividendos). Descubre a partir de qué ingresos conviene una SL.',
  keywords: 'autonomo vs sl, autónomo o sociedad limitada, cuándo crear sl, fiscalidad autonomo sl, is 25, irpf autonomo, comparativa fiscal, constituir sl',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador Autónomo vs SL 2025 - Orientación Fiscal',
    description: 'Compara orientativamente la carga fiscal entre autónomo y Sociedad Limitada según tus ingresos.',
    url: 'https://meskeia.com/comparador-autonomo-vs-sl/',
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
    title: 'Comparador Autónomo vs SL 2025 | meskeIA',
    description: '¿Cuándo conviene más una SL que ser autónomo? Compara la carga fiscal',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador Autónomo vs SL meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Comparador Autónomo vs SL",
  description: "Compara orientativamente la carga fiscal entre ser autónomo (IRPF + RETA) y constituir una Sociedad Limitada (IS 25% + dividendos). Descubre a partir de qué ingresos conviene una SL.",
  url: "https://meskeia.com/comparador-autonomo-vs-sl/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo conviene más una Sociedad Limitada que ser autónomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En términos generales, una SL suele ser más ventajosa fiscalmente a partir de beneficios netos de unos 40.000–50.000 € anuales, momento en que el IRPF del autónomo supera el Impuesto sobre Sociedades del 25%. Por debajo de esa cifra, los costes de constitución y gestión de la SL suelen superar el ahorro fiscal. El punto de equilibrio exacto depende de los gastos deducibles, la comunidad autónoma y si se reinvierte el beneficio o se reparte como dividendos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué impuestos paga un autónomo frente a una SL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un autónomo tributa por su rendimiento neto en IRPF (con tramos que van del 19 % al 47 % en España en 2025) y cotiza a la Seguridad Social por la cuota RETA, que varía según sus ingresos reales (sistema de cotización por ingresos reales desde 2023). Una SL paga Impuesto sobre Sociedades al tipo general del 25 % sobre el beneficio; cuando el socio se distribuye dividendos, estos tributan adicionalmente en IRPF como rendimiento del capital mobiliario (entre el 19 % y el 28 %).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué gastos puede deducirse una SL que un autónomo no puede?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una SL puede deducir el salario del socio-administrador como gasto de personal si existe relación laboral o si los estatutos lo contemplan, así como determinados gastos de representación, vehículos y dietas con mayor margen que el autónomo. El autónomo, en cambio, tiene limitaciones en la deducción del vehículo (solo si es uso exclusivo empresarial) y del local doméstico. En ambos casos es esencial contar con asesoría fiscal para maximizar las deducciones aplicables.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta constituir una Sociedad Limitada en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Constituir una SL en España requiere un capital mínimo de 1 € (desde la reforma de 2023, antes eran 3.000 €) y conlleva gastos de notaría, registro mercantil y gestoría que suelen oscilar entre 300 € y 800 € en total si se usa la vía telemática (CIRCE). A eso hay que añadir la gestión contable anual (depósito de cuentas, declaraciones trimestrales, IS anual), que tiene un coste habitual de 1.000–2.500 € al año con una gestoría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Un autónomo tiene responsabilidad ilimitada y una SL no?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, en general el autónomo responde con todo su patrimonio personal ante deudas de la actividad, mientras que en una SL la responsabilidad queda limitada al capital aportado. Sin embargo, esta protección no es absoluta: los administradores de una SL pueden ser declarados responsables en casos de insolvencia culpable, deudas con la Seguridad Social o Hacienda, o incumplimiento de obligaciones contables. La elección entre ambas formas jurídicas debe contemplar tanto el aspecto fiscal como el de responsabilidad.',
      },
    },
  ],
};
