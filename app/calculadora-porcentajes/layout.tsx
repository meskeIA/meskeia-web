import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de Porcentajes Avanzada - Cálculos con Visualización | meskeIA',
  description: '¿Necesitas calcular descuentos, IVA o cambios porcentuales? Calculadora de porcentajes con visualizaciones interactivas y ejemplos prácticos. Ideal para compras y finanzas.',
  keywords: 'calculadora porcentajes, descuentos, IVA España, propinas, cambio porcentual, incremento, reducción, cálculo porcentajes, matemáticas básicas, herramientas cálculo, meskeIA',
  authors: [{ name: 'meskeIA', email: 'meskeia24@gmail.com' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Porcentajes Avanzada - meskeIA',
    description: 'Herramienta completa para cálculos de porcentajes con visualizaciones. Descuentos, IVA, propinas y más. Ejemplos españoles incluidos.',
    url: 'https://meskeia.com/calculadora-porcentajes/',
    siteName: 'meskeIA',
    locale: 'es_ES'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Porcentajes Avanzada - meskeIA',
    description: 'Calcula porcentajes, descuentos, IVA y propinas con visualizaciones interactivas y ejemplos españoles'
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-porcentajes/'
  },
  other: {
    'google': 'translate',
    'content-language': 'es'
  }
}

export default function CalculadoraPorcentajesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
