import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Roommates - Divide Gastos de Piso Compartido | meskeIA',
  description: 'Divide los gastos del piso entre compañeros de forma justa. Luz, internet, compras comunes. Calcula quién debe a quién y simplifica las cuentas.',
  keywords: 'roommates, compañeros piso, dividir gastos, piso compartido, luz, internet, gastos comunes, quien debe a quien',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Roommates - meskeIA',
    description: 'Divide los gastos del piso compartido de forma justa entre todos los compañeros',
    url: 'https://meskeia.com/calculadora-roommates/',
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
    title: 'Calculadora Roommates - meskeIA',
    description: 'Divide gastos del piso compartido sin conflictos',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Roommates",
  description: "Divide los gastos del piso entre compañeros de forma justa. Luz, internet, compras comunes. Calcula quién debe a quién y simplifica las cuentas.",
  url: "https://meskeia.com/calculadora-roommates/",
  category: 'FinanceApplication',
  features: [],
});
