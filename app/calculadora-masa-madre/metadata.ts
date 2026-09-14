import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Masa Madre y Equivalencias de Levadura: fresca, seca e instantánea | meskeIA',
  description: 'Convierte entre levadura fresca, seca e instantánea, o sustitúyelas por masa madre. Te damos los gramos exactos y el ajuste de harina y agua de la receta.',
  keywords: 'levadura fresca a seca, equivalencia levadura fresca seca, cuantos gramos de levadura seca son 25 de fresca, levadura seca a fresca, masa madre, sustitución levadura por masa madre, cuantos gramos de masa madre por kilo de harina, levadura instantánea equivalencia, calculadora pan, hidratación masa madre',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Masa Madre y Equivalencias de Levadura',
    description: 'Pasa de levadura fresca a seca, o de cualquiera de ellas a masa madre, con los gramos y el ajuste de la receta.',
    url: 'https://meskeia.com/calculadora-masa-madre/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/coquinum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masa Madre y Equivalencias de Levadura',
    description: 'Pasa de levadura fresca a seca, o de cualquiera de ellas a masa madre, con los gramos y el ajuste de la receta.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora Masa Madre meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Masa Madre y Equivalencias de Levadura',
  description: 'Convierte entre levadura fresca, seca e instantánea con la equivalencia 1:3, y calcula cuánta masa madre necesitas para sustituir cualquiera de ellas en una receta de pan, con el ajuste de harina y agua que eso obliga a hacer.',
  url: 'https://meskeia.com/calculadora-masa-madre/',
  features: [
    'Equivalencia entre levadura fresca, seca e instantánea, en gramos',
    'Conversión de levadura fresca, seca e instantánea a masa madre',
    'Ajuste automático de harina y agua por hidratación de la masa madre',
    'Compatible con cualquier hidratación de masa madre (50–150%)',
    'Tiempo de fermentación orientativo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A cuánta levadura seca equivalen 20 gramos de levadura fresca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 6,7 gramos, porque hace falta el triple de levadura fresca que de seca: se divide entre tres. La operación vale para cualquier cantidad, así que 25 g de fresca son 8,3 g de seca y 15 g de fresca son 5 g de seca. Al revés se multiplica por tres: un sobre de 7 g de levadura seca equivale a 21 g de levadura fresca.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La levadura instantánea y la seca se usan en la misma cantidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, se dosifican igual: donde una receta pide 7 g de levadura seca puedes poner 7 g de instantánea. Lo que cambia es cómo se incorporan. La seca conviene hidratarla antes en un poco de líquido templado, mientras que la instantánea se mezcla directamente con la harina. Las dos son el triple de concentradas que la levadura fresca.',
      },
    },
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
