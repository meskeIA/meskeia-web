import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Elasticidad-Precio de la Demanda | meskeIA',
  description:
    'Simula la elasticidad-precio de la demanda para 6 bienes reales. Visualiza los rectángulos de ingreso total, clasifica la demanda y aprende cómo el precio afecta a los ingresos empresariales.',
  keywords:
    'elasticidad precio demanda, Ed, inelástica, elástica, ingreso total, excedente, bien de primera necesidad, Bachillerato, economía, EBAU, elasticidad oferta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Elasticidad-Precio de la Demanda',
    description:
      'Visualiza en tiempo real cómo la elasticidad-precio determina el efecto de un cambio de precio sobre el ingreso total.',
    url: 'https://meskeia.com/simulador-elasticidad-precio',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Elasticidad-Precio de la Demanda',
    description:
      'Simula bienes inelásticos (insulina, sal) y elásticos (smartphone, vuelo). Aprende economía con gráficos interactivos.',
  },
  other: {
    'application-name': 'Simulador Elasticidad-Precio meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Elasticidad-Precio de la Demanda',
  description:
    'Simulador interactivo que visualiza la elasticidad-precio de la demanda para 6 bienes reales (insulina, sal, gasolina, café, smartphone, vuelo). Permite cambiar el precio y observar el efecto sobre la cantidad demandada y el ingreso total mediante rectángulos de ingreso superpuestos.',
  url: 'https://meskeia.com/simulador-elasticidad-precio/',
  category: 'EducationalApplication',
  features: [
    '6 bienes predefinidos con elasticidades reales (|Ed| de 0,1 a 2,4)',
    'Slider de variación de precio (−50% a +50%) con respuesta en tiempo real',
    'Visualización canvas de rectángulos de ingreso total base y nuevo',
    'Clasificación automática: perfectamente inelástica, inelástica, unitaria, elástica',
    'Toggle demanda / oferta con lógica diferenciada',
    'Panel de interpretación: por qué sube o baja el ingreso total',
    'Bloque educativo v2.0 con tabla comparativa, escenarios, FAQ y errores frecuentes',
    'Gratuito, sin registro, funciona 100% en el navegador',
  ],
  keywords: [
    'elasticidad precio demanda',
    'Ed coeficiente elasticidad',
    'inelástica elástica',
    'ingreso total precio',
    'economía Bachillerato EBAU',
    'simulador economía',
  ],
});
