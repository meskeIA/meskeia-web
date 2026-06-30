import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Cuenta Bancaria | ¿Qué Tipo de Cuenta Necesitas? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de cuenta bancaria se adapta mejor a tu situación: cuenta corriente estándar, cuenta nómina (cuenta para domiciliar tu sueldo o planilla), cuenta joven, cuenta de ahorro remunerada o mantener la actual.',
  keywords: ['qué cuenta bancaria elegir', 'cuenta nómina o corriente', 'cuenta para domiciliar el sueldo', 'cuenta para depositar el salario', 'cuenta para recibir la planilla', 'cuenta joven banco', 'cuenta ahorro remunerada', 'cambiar de banco', 'cuenta sin comisiones', 'mejor tipo de cuenta bancaria', 'cuenta bancaria según perfil', 'banco digital o tradicional'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Selector de Cuenta Bancaria — ¿Qué Tipo de Cuenta Necesitas?',
    description: 'Descubre qué tipo de cuenta bancaria se adapta mejor a tu situación en 10 preguntas.',
    url: 'https://meskeia.com/selector-cuenta-bancaria/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selector de Cuenta Bancaria — ¿Qué Tipo de Cuenta Necesitas?',
    description: 'Test de 10 preguntas para saber qué tipo de cuenta bancaria se adapta mejor a tu perfil.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Cuenta Bancaria",
  description: "Test de 10 preguntas para saber qué tipo de cuenta bancaria se adapta mejor a tu situación: cuenta corriente estándar, cuenta nómina, cuenta joven, cuenta de ahorro remunerada o mantener la actual.",
  url: "https://meskeia.com/selector-cuenta-bancaria/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una cuenta corriente y una cuenta nómina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cuenta corriente estándar permite domiciliar pagos y realizar transferencias sin condiciones. Una cuenta nómina exige domiciliar los ingresos del trabajo —el sueldo, salario o planilla, según el país— habitualmente a partir de 600-1.000 € mensuales, y a cambio ofrece ventajas como ausencia de comisiones, tarjeta gratuita o incluso remuneración por el saldo. Si recibes un ingreso regular por tu trabajo, la cuenta nómina suele ser más rentable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una cuenta de ahorro remunerada y cuándo conviene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una cuenta que paga intereses por el saldo mantenido, generalmente entre un 2% y un 4% TAE en el contexto actual europeo, aunque los tipos varían con la política del BCE. Conviene cuando tienes un fondo de emergencia o ahorro acumulado que no vas a tocar en el corto plazo, ya que genera rentabilidad sin riesgo ni plazo fijo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué requisitos tiene una cuenta joven y hasta qué edad se puede tener?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los requisitos varían por entidad, pero en general se dirigen a personas de entre 14 y 30 años. Suelen ofrecer cero comisiones, tarjeta de débito gratuita y acceso a condiciones preferentes en préstamos o seguros. Algunos bancos exigen que sea la cuenta principal o que se domicilie algún ingreso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi cuenta actual me está cobrando comisiones innecesarias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Revisa los movimientos del último año y busca cargos etiquetados como "comisión de mantenimiento", "comisión de administración" o "comisión por no uso". Los bancos están obligados a informar de estas comisiones en el contrato, pero muchos clientes no las detectan. Si encuentras cobros superiores a 30-50 € anuales y no obtienes ninguna ventaja a cambio, merece la pena comparar alternativas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro tener toda la nómina en un banco digital sin oficinas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, siempre que la entidad esté adherida al Fondo de Garantía de Depósitos (FGD) europeo, que cubre hasta 100.000 € por titular y entidad. Todos los bancos digitales operativos en España y la UE están supervisados por el BCE o el Banco de España. La ausencia de oficinas no implica menor seguridad jurídica para los depósitos.',
      },
    },
  ],
};
