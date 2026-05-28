import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Optimizador de Rentas 60+ — Estrategia IRPF para pensionistas | meskeIA',
  description: 'Planifica el orden óptimo de retirada de fondos (pensión pública, plan de pensiones, ahorro, alquiler) para minimizar el IRPF total. Herramienta de estrategia fiscal para mayores de 60 años.',
  keywords: 'optimizar rentas jubilacion, irpf pensionista plan pensiones, orden retirada fondos jubilacion, estrategia fiscal mayores 60, minimizar impuestos jubilacion, plan pensiones irpf retiro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Optimizador de Rentas 60+ | meskeIA',
    description: 'Estrategia fiscal para pensionistas: qué fondos retirar primero para pagar menos IRPF.',
    url: 'https://meskeia.com/optimizador-rentas-60/',
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
    title: 'Optimizador de Rentas 60+ | meskeIA',
    description: 'Minimiza el IRPF en la jubilación: orden óptimo de retirada de pensión, PP, ahorro y alquiler',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Optimizador Rentas 60 meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Optimizador de Rentas 60+",
  description: "Planifica el orden óptimo de retirada de fondos (pensión pública, plan de pensiones, ahorro, alquiler) para minimizar el IRPF total. Herramienta de estrategia fiscal para mayores de 60 años.",
  url: "https://meskeia.com/optimizador-rentas-60/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿En qué orden conviene retirar los fondos al jubilarse para pagar menos IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estrategia general es retirar primero los fondos que generan menos impacto fiscal. La pensión pública es obligatoria e inflexible, por lo que se toma como punto de partida. A continuación conviene usar el ahorro ordinario (cuentas, depósitos) que ya tributó en su origen antes de rescatar el plan de pensiones, pues este último tributa íntegramente como rendimiento del trabajo a los tipos marginales más elevados. Los rendimientos de alquiler e inversión se añaden al final para no disparar la base imponible general en los primeros años de jubilación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo tributa el rescate de un plan de pensiones en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las prestaciones de los planes de pensiones tributan como rendimientos del trabajo en el IRPF, sumándose a la pensión pública y aplicándose la escala general (desde el 19 % hasta el 47 % en 2025). Existe una reducción del 40 % para las aportaciones realizadas antes del 1 de enero de 2007 si el rescate se hace en forma de capital (pago único), aunque esta ventaja está sujeta a plazos y condiciones. Rescatar en forma de renta mensual suele ser más eficiente fiscalmente que el cobro único.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene rescatar el plan de pensiones anticipadamente (antes de jubilarse)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde 2025 es posible rescatar aportaciones con una antigüedad de al menos 10 años sin necesidad de ninguna contingencia especial. Puede ser ventajoso hacerlo en años de ingresos muy bajos (ERTE, desempleo, inicio de prejubilación) para aprovechar los tramos más bajos del IRPF. No obstante, hay que considerar que el dinero rescatado deja de crecer en el plan y que la reducción del 40 % solo aplica a aportaciones anteriores a 2007.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventajas fiscales tienen los mayores de 65 años al vender activos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los mayores de 65 años están exentos de tributar en el IRPF por la ganancia patrimonial obtenida al transmitir su vivienda habitual, sin necesidad de reinversión. Además, las ganancias derivadas de cualquier activo (fondos, acciones, inmuebles no habituales) están exentas si el importe obtenido se destina en el plazo de seis meses a constituir una renta vitalicia asegurada, con un límite de 240.000 €. Son dos excepciones que pueden suponer un ahorro fiscal muy significativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el alquiler de una vivienda a la tributación de un pensionista?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los ingresos por alquiler tributan como rendimientos del capital inmobiliario en la base general del IRPF, sumándose a la pensión pública. Se puede deducir el IBI, los gastos de comunidad, seguros, reparaciones, amortización del inmueble y los intereses de financiación. Si el inmueble está destinado a vivienda habitual del arrendatario, se aplica una reducción del 60 % sobre el rendimiento neto positivo. Una planificación adecuada del año en que se cobra el alquiler o se venden activos puede reducir considerablemente la factura fiscal.',
      },
    },
  ],
};
