import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Deducción IRPF por Obras Energéticas — 20%, 40%, 60% | meskeIA',
  description: 'Oriéntate sobre las 3 deducciones IRPF por obras de mejora energética en vivienda: 20% (demanda), 40% (consumo) y 60% (edificio). Plazos, requisitos y bases máximas actualizados a 2026.',
  keywords: 'deducción IRPF obras energéticas, mejora eficiencia energética vivienda, deducción 20 40 60 obras, rehabilitación energética IRPF, certificado energético deducción, DA 50 LIRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Deducción IRPF por obras energéticas — 20%, 40% y 60%',
    description: '3 deducciones por mejora energética en vivienda. Requisitos, plazos y base máxima deducible.',
    url: 'https://meskeia.com/orientador-deduccion-obras-energeticas',
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
    title: 'Deducción IRPF obras energéticas — España 2026',
    description: '20%, 40% y 60% de deducción por mejora energética. Requisitos y plazos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Deducción Obras Energéticas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador Deducción IRPF por Obras Energéticas',
  description: 'Herramienta de orientación sobre las 3 deducciones en IRPF por obras de mejora de eficiencia energética en viviendas (DA 50.ª LIRPF): 20% por reducir demanda de calefacción/refrigeración, 40% por reducir consumo de energía primaria, y 60% por rehabilitación energética de edificio completo. Plazos, requisitos, certificados y bases máximas actualizados a 2026.',
  url: 'https://meskeia.com/orientador-deduccion-obras-energeticas/',
  features: [
    'Orientación sobre las 3 deducciones (20%, 40%, 60%)',
    'Requisitos, plazos y bases máximas deducibles',
    'Estimación del ahorro fiscal por modalidad',
    'Normativa actualizada: DA 50.ª LIRPF + RDL 2/2026',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
