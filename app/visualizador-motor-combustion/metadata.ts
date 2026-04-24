import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Motor de Combustión — Ciclo Otto y Por Qué Solo Aprovecha el 35% | meskeIA',
  description: 'Cómo funciona el motor de combustión interna: ciclo Otto 4 tiempos, eficiencia real del 30-35%, pérdidas de energía y comparativa con el motor eléctrico.',
  keywords: ['motor combustion interna', 'ciclo otto', 'como funciona motor gasolina', 'eficiencia motor termico', 'fisica bachillerato', 'termodinámica motor', 'motor electrico vs gasolina'],
  openGraph: {
    title: 'Motor de Combustión — Ciclo Otto y Por Qué Solo Aprovecha el 35%',
    description: 'El 65% de la energía de la gasolina se pierde en calor y fricción. Entiende por qué y cómo funciona el ciclo de 4 tiempos.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalContent',
  name: 'Visualizador del Motor de Combustión Interna',
  description: 'Funcionamiento del ciclo Otto, eficiencia térmica y comparativa motor térmico vs eléctrico.',
  educationalLevel: 'secondary',
  inLanguage: 'es',
  publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
};
