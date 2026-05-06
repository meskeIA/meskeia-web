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
