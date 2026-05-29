import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimacion de Deduccion por Maternidad IRPF - 1.200 por Hijo | meskeIA',
  description: 'Estima la deduccion por maternidad en IRPF: 1.200 euros/ano por hijo menor de 3 anos mas hasta 1.000 euros por guarderia. Cobro anticipado mensual via Modelo 140. Requisitos y simulador.',
  keywords: 'deduccion maternidad IRPF, 1200 euros hijo, deduccion guarderia IRPF, modelo 140, cobro anticipado maternidad, madres trabajadoras deduccion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimacion de Deduccion por Maternidad IRPF | meskeIA',
    description: 'Calcula la deduccion por maternidad: 1.200 euros/ano por hijo menor de 3 anos + incremento por guarderia.',
    url: 'https://meskeia.com/estimacion-deduccion-maternidad/',
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
    title: 'Estimacion de Deduccion por Maternidad IRPF | meskeIA',
    description: 'Deduccion maternidad IRPF: 1.200 euros/ano + 1.000 euros guarderia por hijo menor de 3 anos',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estimacion Deduccion Maternidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimacion de Deduccion por Maternidad IRPF',
  description: 'Herramienta orientativa para estimar la deduccion por maternidad en IRPF (art. 81 Ley 35/2006). Calcula el importe anual por hijos menores de 3 anos, incremento por guarderia y opcion de cobro anticipado mensual.',
  url: 'https://meskeia.com/estimacion-deduccion-maternidad/',
  features: [
    'Deduccion base: 1.200 euros/ano por hijo menor de 3 anos',
    'Incremento guarderia: hasta 1.000 euros/ano por hijo',
    'Simulacion de cobro anticipado mensual (Modelo 140)',
    'Verificacion de requisitos de elegibilidad',
    'Datos actualizados IRPF 2025',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Quién tiene derecho a la deducción por maternidad en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pueden aplicar la deducción por maternidad las mujeres con hijos menores de 3 años que realicen una actividad por cuenta propia o ajena y estén dadas de alta en la Seguridad Social o en una mutualidad. El importe máximo es de 1.200 euros anuales por cada hijo menor de 3 años. Tras la reforma de 2023, también pueden aplicarla el otro progenitor o adoptante en determinadas situaciones (fallecimiento de la madre, guarda o custodia exclusiva).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el incremento por gastos de guardería en la deducción de maternidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Además de los 1.200 euros base, las madres pueden deducirse hasta 1.000 euros anuales adicionales por los gastos de preinscripción y matriculación en centros de educación infantil de primer ciclo (guarderías y centros de 0-3 años) autorizados. Este incremento es compatible con la deducción base y también puede cobrarse de forma anticipada mediante el Modelo 140. El límite conjunto es de 2.200 euros por hijo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se cobra la deducción por maternidad de forma anticipada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se puede solicitar el cobro mensual anticipado de 100 euros por hijo menor de 3 años (12 × 100 € = 1.200 € anuales) mediante la presentación del Modelo 140 en la Agencia Tributaria (AEAT). Es un pago a cuenta de la deducción en la declaración de la renta: si luego resulta que tienes derecho a menos importe, deberás devolver la diferencia. Si prefieres, puedes esperar a aplicarla directamente en la declaración del IRPF.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pierde la deducción por maternidad si la madre está de baja o en excedencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Durante el permiso de maternidad/nacimiento retribuido por la Seguridad Social, la madre sigue en situación de alta y mantiene el derecho a la deducción. Sin embargo, en una excedencia no retribuida por cuidado de hijos, la madre deja de estar en alta en la Seguridad Social, por lo que no puede aplicar la deducción durante los meses en excedencia. Solo se computan los meses con cotización efectiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La deducción por maternidad es compatible con otras deducciones por hijos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La deducción por maternidad (art. 81 LIRPF) es compatible con el mínimo por descendientes que se aplica en la base imponible del IRPF, con la deducción por familia numerosa o discapacidad (art. 81 bis) y con las deducciones autonómicas por nacimiento o adopción que tenga reconocidas tu comunidad autónoma. Son conceptos distintos que pueden acumularse si se cumplen los requisitos de cada uno.',
      },
    },
  ],
};
