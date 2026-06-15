import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora DDT — Temperatura del Agua para Pan | meskeIA',
  description: 'Calcula la temperatura exacta del agua para alcanzar la DDT (Desired Dough Temperature) en tu masa de pan. Ajuste por tipo de amasadora y preferment.',
  keywords: 'DDT, desired dough temperature, temperatura masa pan, temperatura agua pan, amasadora, panadería, fermentación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora DDT — Temperatura del Agua para Pan',
    description: 'Calcula la temperatura del agua ideal para que tu masa llegue a la temperatura perfecta de fermentación.',
    url: 'https://meskeia.com/calculadora-temperatura-masa',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora DDT — Temperatura del Agua para Pan',
    description: 'Calcula la temperatura del agua ideal para que tu masa llegue a la temperatura perfecta de fermentación.',
  },
  other: {
    'application-name': 'Calculadora DDT meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora DDT — Temperatura del Agua para Pan (Desired Dough Temperature)',
  description: 'Calcula la temperatura exacta del agua que necesitas para que tu masa de pan llegue a la DDT ideal. Ajusta por tipo de amasadora, temperatura ambiente, harina y preferment.',
  url: 'https://meskeia.com/calculadora-temperatura-masa/',
  features: [
    'Cálculo de temperatura del agua para alcanzar la DDT objetivo',
    'Ajuste por tipo de amasadora: manual, KitchenAid, espiral, Thermomix',
    'Soporte para fórmula con preferment (poolish, levain)',
    'Resultado en °C y °F',
    'Indicador visual de temperatura fría, tibia o caliente',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la DDT o Desired Dough Temperature?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La DDT (Desired Dough Temperature) es la temperatura objetivo que debe alcanzar la masa al terminar el amasado, normalmente entre 23 °C y 26 °C para panes de fermentación lenta. Controlarla es fundamental porque la fermentación de la levadura depende directamente de la temperatura: unos pocos grados de diferencia pueden doblar o reducir a la mitad el tiempo de fermentación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la temperatura del agua para el pan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula básica es: T_agua = (DDT × factor) − T_ambiente − T_harina − T_amasadora. El factor depende del tipo de amasado: 3 para amasado manual, 4 si se incluye preferment. La calculadora realiza este cálculo automáticamente en función de los valores que introduces.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el tipo de amasadora influye en el cálculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada amasadora genera una cantidad diferente de calor por fricción durante el amasado. Una amasadora espiral industrial puede aumentar la masa entre 4 °C y 6 °C, mientras que el amasado a mano aporta muy poco calor. Si no se compensa este factor, la masa llegará a la DDT por encima o por debajo de lo previsto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un preferment y cómo afecta al cálculo de temperatura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un preferment (poolish, biga, levain) es una porción de la masa fermentada con antelación que se añade a la mezcla principal. Al incorporarlo, su temperatura suma a la masa final, por lo que debe tenerse en cuenta en el cálculo de la DDT para ajustar correctamente la temperatura del agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipos de masa es útil controlar la DDT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La DDT es especialmente relevante en panes de masa madre, baguettes de larga fermentación y cualquier receta donde la temperatura de fermentación sea crítica. Para masas de fermentación rápida con levadura comercial a temperatura ambiente, el impacto es menor, aunque seguir la DDT siempre mejora la consistencia del resultado.',
      },
    },
  ],
};
