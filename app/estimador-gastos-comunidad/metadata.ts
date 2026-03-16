import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador Gastos de Comunidad - Reparto por Cuotas | meskeIA',
  description: 'Calcula y reparte los gastos de la comunidad de propietarios: cuota mensual, derramas, reparto por coeficiente o partes iguales. Gestiona los presupuestos de tu comunidad.',
  keywords: 'gastos comunidad, cuota comunidad, derrama comunidad, comunidad propietarios, reparto gastos, coeficiente participacion, presupuesto comunidad, vecinos gastos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Gastos de Comunidad - meskeIA',
    description: 'Reparte los gastos de tu comunidad de propietarios de forma justa y transparente',
    url: 'https://meskeia.com/estimador-gastos-comunidad/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Gastos de Comunidad - meskeIA',
    description: 'Calcula cuánto paga cada vecino según coeficiente o partes iguales',
  },
};
