import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Gas Ideal y Ciclos Termodinámicos | meskeIA',
  description:
    'Simula la ley del gas ideal PV=nRT, los procesos termodinámicos (isotermo, isobárico, adiabático) y los ciclos de Carnot, Otto, Diesel y Stirling. Diagramas PV interactivos.',
  keywords:
    'gas ideal, PV=nRT, ciclos termodinámicos, Carnot, Otto, Diesel, Stirling, diagrama PV, termodinámica, física bachillerato, eficiencia ciclo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gas-ideal/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Gas Ideal y Ciclos Termodinámicos | meskeIA',
    description:
      'Ley de gases, procesos termodinámicos y ciclos de Carnot, Otto, Diesel y Stirling con diagramas PV interactivos',
    url: 'https://meskeia.com/simulador-gas-ideal',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Gas Ideal y Termodinámica | meskeIA',
    description: 'Aprende termodinámica con diagramas PV interactivos',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Gas Ideal y Ciclos Termodinámicos',
  description:
    'Simulador interactivo del gas ideal y la termodinámica. Calcula PV=nRT, simula procesos (isotermo, isobárico, isocórico, adiabático) y compara los ciclos de Carnot, Otto, Diesel y Stirling con sus diagramas PV.',
  url: 'https://meskeia.com/simulador-gas-ideal/',
  category: 'EducationalApplication',
  features: [
    'Ley de gas ideal PV=nRT con cálculo de cualquier variable',
    'Visualización de moléculas con velocidad proporcional a T',
    'Procesos: isotermo, isobárico, isocórico, adiabático',
    'Diagramas PV interactivos con curvas reales',
    'Ciclos de Carnot, Otto, Diesel y Stirling',
    'Cálculo de eficiencia, trabajo y calor intercambiado',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['gas ideal', 'termodinámica', 'PV=nRT', 'Carnot', 'física bachillerato'],
});
