import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Sustitución de Levadura por Masa Madre | meskeIA',
  description: 'Calcula cuánta masa madre necesitas para sustituir levadura fresca, seca o instantánea en cualquier receta. Ajuste automático de harina y agua.',
  keywords: 'masa madre, levadura, sustitución, calculadora pan, hidratación masa madre, pan artesano, fermentación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Sustitución de Levadura por Masa Madre',
    description: 'Convierte cualquier receta de levadura comercial a masa madre con ajuste automático de harina y agua.',
    url: 'https://meskeia.com/calculadora-masa-madre',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Sustitución de Levadura por Masa Madre',
    description: 'Convierte cualquier receta de levadura comercial a masa madre con ajuste automático de harina y agua.',
  },
  other: {
    'application-name': 'Calculadora Masa Madre meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Sustitución de Levadura por Masa Madre',
  description: 'Calcula cuánta masa madre necesitas para sustituir levadura fresca, seca o instantánea en cualquier receta de pan, con ajuste automático de harina y agua.',
  url: 'https://meskeia.com/calculadora-masa-madre/',
  features: [
    'Conversión de levadura fresca, seca e instantánea a masa madre',
    'Ajuste automático de harina y agua por hidratación de la masa madre',
    'Compatible con cualquier hidratación de masa madre (50–150%)',
    'Tiempo de fermentación orientativo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánta masa madre se necesita para sustituir levadura fresca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La equivalencia habitual es usar entre 15% y 20% del peso de la harina en masa madre activa (al 100% de hidratación). Es decir, para 500 g de harina necesitarías entre 75 g y 100 g de masa madre. Esta cantidad puede variar según la actividad de tu fermento, la temperatura ambiente y el tiempo de fermentación que prefieras: más masa madre acelera el proceso, menos la ralentiza.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se convierte levadura seca a masa madre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La conversión más sencilla es: 1 g de levadura seca activa equivale aproximadamente a 3 g de levadura fresca, y esta cantidad se puede sustituir por unos 20–25 g de masa madre activa al 100% de hidratación. Al sustituir levadura por masa madre hay que ajustar la receta restando a la harina y al agua los que ya aporta la propia masa madre para mantener la hidratación total correcta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué hay que ajustar la harina y el agua al usar masa madre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La masa madre está compuesta de harina y agua. Si la añades a la receta sin ajustar, estarás añadiendo más harina y agua de las previstas, alterando la hidratación y la consistencia de la masa. Para mantener la receta original hay que restar de la harina y del agua totales las cantidades que ya aporta la masa madre según su hidratación (normalmente 50% de harina y 50% de agua en una masa madre al 100%).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tarda en fermentar una masa con masa madre en lugar de levadura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fermentación con masa madre es significativamente más lenta que con levadura comercial. A temperatura ambiente (20–22 °C), una fermentación en bloque típica dura entre 4 y 8 horas, seguida de una fermentación en frío en nevera de 8 a 16 horas. Con levadura fresca en las mismas condiciones, el proceso se completa en 1–2 horas. La fermentación larga con masa madre mejora el sabor, la digestibilidad y la conservación del pan.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el pan de masa madre y el pan con levadura comercial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pan de masa madre usa un fermento natural con bacterias lácticas y levaduras silvestres, lo que le aporta sabor ácido característico, mejor conservación y mayor digestibilidad gracias a la degradación parcial del gluten y el ácido fítico. El pan con levadura comercial (Saccharomyces cerevisiae) fermenta más rápido y tiene sabor más neutro. Ambos son válidos; la elección depende del tiempo disponible y el perfil de sabor deseado.',
      },
    },
  ],
};
