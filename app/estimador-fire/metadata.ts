import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador FIRE - Independencia Financiera | meskeIA',
  description: 'Calcula cuánto necesitas para alcanzar la independencia financiera (FIRE). Usa la regla del 4% y proyecta cuántos años te faltan para retirarte anticipadamente.',
  keywords: 'fire, independencia financiera, retiro anticipado, regla 4%, libertad financiera, jubilacion anticipada, ahorro, inversion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador FIRE - Independencia Financiera | meskeIA',
    description: 'Calcula cuántos años te faltan para alcanzar la independencia financiera',
    url: 'https://meskeia.com/estimador-fire/',
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
    title: 'Estimador FIRE - Independencia Financiera | meskeIA',
    description: 'Calcula cuántos años te faltan para alcanzar la independencia financiera',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador FIRE",
  description: "Calcula cuánto necesitas para alcanzar la independencia financiera (FIRE). Usa la regla del 4% y proyecta cuántos años te faltan para retirarte anticipadamente.",
  url: "https://meskeia.com/estimador-fire/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es FIRE y cómo funciona la independencia financiera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FIRE (Financial Independence, Retire Early) es una estrategia que busca acumular suficiente patrimonio para vivir de las rentas sin necesitar un trabajo activo. El principio central es la regla del 4%: si retiras anualmente el 4% de tu cartera, esta puede mantenerse indefinidamente en la mayoría de escenarios históricos. Para ello necesitas ahorrar 25 veces tus gastos anuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dinero necesito para alcanzar la independencia financiera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El número FIRE es 25 veces tus gastos anuales. Si gastas 20.000 € al año, necesitas un patrimonio de 500.000 €. Si gastas 30.000 €, necesitas 750.000 €. Este cálculo asume una tasa de retirada del 4% anual y una cartera diversificada en renta variable y fija.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos años tarda en lograrse la independencia financiera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende principalmente de tu tasa de ahorro. Con una tasa del 10% puede tardar 40 años; con el 50% puede lograrse en unos 17 años; con el 75% en menos de 10. La rentabilidad esperada de la inversión (habitualmente 6-7% anual real histórico) también influye de forma significativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es segura la regla del 4% para jubilarse anticipadamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla del 4% se basa en el estudio Trinity de 1998, que analizó carteras históricas de EEUU durante períodos de 30 años. Para retiros muy anticipados (de 40 o más años) muchos expertos recomiendan usar una tasa más conservadora del 3-3,5% para reducir el riesgo de agotar el patrimonio en el largo plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre FIRE, Lean FIRE y Fat FIRE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lean FIRE es la variante de bajo coste: vivir con gastos reducidos, habitualmente menos de 25.000 € anuales. Fat FIRE apunta a mantener un nivel de vida cómodo con gastos por encima de 60.000-80.000 € anuales, lo que requiere un patrimonio considerablemente mayor. El FIRE estándar se sitúa en un punto intermedio adaptado a tus gastos reales.',
      },
    },
  ],
};
