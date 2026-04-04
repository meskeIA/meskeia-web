import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de tus Impuestos - ¿A dónde va tu dinero? | meskeIA',
  description: 'Visualiza cómo se reparten los Presupuestos Generales del Estado. Gráfico interactivo con desglose por partida: pensiones, sanidad, educación, defensa y más.',
  keywords: 'presupuestos generales estado, impuestos españa, gasto público, pensiones, sanidad, educación, deuda pública, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de tus Impuestos - ¿A dónde va tu dinero?',
    description: 'Gráfico interactivo del gasto público en España. Descubre cuánto de tus impuestos va a pensiones, sanidad, educación y más.',
    url: 'https://meskeia.com/visualizador-viaje-impuestos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Viaje de tus Impuestos',
    description: '¿A dónde va tu dinero? Visualiza el gasto público español con gráficos interactivos.',
  },
  other: {
    'application-name': 'Viaje Impuestos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de tus Impuestos',
  description: 'Explicador visual interactivo sobre el destino de los impuestos en España. Gráfico de los Presupuestos Generales del Estado con desglose por partida y cálculo personalizado según tu aportación.',
  url: 'https://meskeia.com/visualizador-viaje-impuestos/',
  features: [
    'Gráfico doughnut interactivo del gasto público español',
    'Desglose de cada partida presupuestaria con explicación',
    'Calculadora: cuánto aportas tú a cada partida según tu IRPF',
    'Datos de los PGE 2025',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
