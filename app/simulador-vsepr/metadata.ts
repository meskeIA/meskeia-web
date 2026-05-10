import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador VSEPR - Geometría Molecular 3D | meskeIA',
  description: 'Construye moléculas con la teoría VSEPR: ajusta pares enlazantes y libres del átomo central y observa la geometría 3D rotable. Lineal, tetraédrica, octaédrica y más. Química Bachillerato.',
  keywords: 'VSEPR, geometría molecular, geometría 3D molecular, pares libres, AX2 AX3 AX4 AX5 AX6, hibridación, química bachillerato, ángulo enlace',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-vsepr/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador VSEPR - Geometría Molecular 3D | meskeIA',
    description: 'Geometría molecular 3D rotable según teoría VSEPR',
    url: 'https://meskeia.com/simulador-vsepr/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador VSEPR | meskeIA',
    description: 'Geometría molecular 3D interactiva',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador VSEPR de Geometría Molecular',
  description: 'Simulador interactivo de geometría molecular según la teoría VSEPR. Ajusta pares enlazantes y pares libres del átomo central y observa la geometría 3D resultante con rotación libre.',
  url: 'https://meskeia.com/simulador-vsepr/',
  category: 'EducationalApplication',
  features: [
    'Construcción de moléculas AX_nE_m con pares enlazantes y libres',
    'Geometría 3D rotable con drag & drop',
    'Cálculo de geometría electrónica vs geometría molecular',
    'Ángulos de enlace ideales',
    'Ejemplos famosos para cada geometría (H2O, NH3, CH4, PCl5, SF6, XeF4...)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['VSEPR', 'geometría molecular', 'pares libres', 'química bachillerato'],
});
