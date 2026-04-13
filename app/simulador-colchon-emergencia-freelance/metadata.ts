import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Colchon de Emergencia Freelance | meskeIA',
  description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual. Proyeccion mes a mes con semaforo de riesgo para autonomos en Espana.',
  keywords: 'colchon emergencia, fondo emergencia freelance, ahorro autonomo, meses sin ingresos, supervivencia financiera, RETA',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Colchon de Emergencia Freelance | meskeIA',
    description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual. Semaforo de riesgo y objetivos de ahorro.',
    url: 'https://meskeia.com/simulador-colchon-emergencia-freelance',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Colchon de Emergencia Freelance | meskeIA',
    description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual.',
  },
  other: {
    'application-name': 'Colchon Emergencia Freelance meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Colchon de Emergencia Freelance',
  description: 'Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual. Introduce tus gastos fijos, cuota RETA, gastos profesionales y ahorro disponible para ver una proyeccion mes a mes con semaforo de riesgo.',
  url: 'https://meskeia.com/simulador-colchon-emergencia-freelance/',
  category: 'FinanceApplication',
  features: [
    'Calculo de meses de supervivencia sin ingresos',
    'Semaforo de riesgo con 5 niveles',
    'Proyeccion mes a mes con barras visuales',
    'Desglose porcentual de gastos con donut CSS',
    'Objetivos de ahorro a 3 y 6 meses',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
