import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adrenalina: Cómo Funciona | meskeIA',
  description:
    'La doble vida de la adrenalina: neurotransmisor (noradrenalina) y hormona. Cascada lucha-huida, receptores α y β, EpiPen en anafilaxia y estrés crónico.',
  keywords: [
    'adrenalina como funciona',
    'adrenalina epinefrina',
    'receptores adrenergicos',
    'adrenalina anafilaxia',
    'sistema simpatico adrenalina',
    'noradrenalina diferencia',
    'estres adrenalina',
  ],
  openGraph: {
    title: 'Adrenalina: La Hormona de la Supervivencia',
    description:
      'Neurotransmisor en el cerebro, hormona en la sangre. Cascada lucha-huida, receptores α y β y casos donde salva vidas.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Adrenalina: La Hormona de la Supervivencia",
  description: "La doble vida de la adrenalina: neurotransmisor (noradrenalina) y hormona. Cascada lucha-huida, receptores α y β, EpiPen en anafilaxia y estrés crónico.",
  url: "https://meskeia.com/visualizador-adrenalina/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la adrenalina y qué hace en el cuerpo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La adrenalina (epinefrina) es una catecolamina producida principalmente por la médula suprarrenal. Actúa como hormona en el torrente sanguíneo y como neurotransmisor en el sistema nervioso simpático. Prepara al cuerpo para situaciones de emergencia aumentando la frecuencia cardíaca, dilatando bronquios, elevando la glucemia y redistribuyendo el flujo sanguíneo hacia músculos esqueléticos y corazón.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre adrenalina y noradrenalina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Adrenalina y noradrenalina son catecolaminas muy similares estructuralmente. La noradrenalina es el principal neurotransmisor del sistema nervioso simpático (actúa en sinapsis locales) y precursor biosintético de la adrenalina. La adrenalina es la hormona liberada por las glándulas suprarrenales al torrente sanguíneo para efectos sistémicos. La noradrenalina tiene mayor afinidad por receptores α (vasoconstricción); la adrenalina actúa con fuerza en receptores β (corazón, bronquios).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los receptores adrenérgicos α y β?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los receptores adrenérgicos son proteínas de membrana que responden a adrenalina y noradrenalina. Los receptores α (α1, α2) median principalmente vasoconstricción y reducción de la liberación de neurotransmisores. Los receptores β (β1, β2, β3) aumentan la frecuencia cardíaca y la contractilidad (β1), dilatan bronquios y vasos musculares (β2), y movilizan grasa (β3). Los betabloqueantes actúan bloqueando receptores β para reducir la frecuencia cardíaca y la presión arterial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se usa adrenalina en la anafilaxia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la anafilaxia (reacción alérgica grave), el sistema inmune libera masivamente histamina y otras sustancias que causan vasodilatación extrema, broncoespasmo y caída de tensión arterial. La adrenalina revierte estos efectos actuando en receptores α (vasoconstricción, restaura tensión) y β (broncodilatación, estimula el corazón). El autoinyector EpiPen contiene 0,3 mg de adrenalina y debe aplicarse en el muslo externo inmediatamente al aparecer síntomas graves.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué efectos tiene el estrés crónico sobre el sistema adrenérgico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estrés crónico mantiene elevados los niveles de adrenalina y cortisol de forma sostenida. A diferencia del estrés agudo (respuesta adaptativa y breve), la activación crónica del eje simpático-suprarrenal produce hipertensión arterial sostenida, aumento del riesgo cardiovascular, supresión inmunológica, alteraciones del sueño y resistencia a la insulina. También puede reducir la densidad de receptores β (regulación a la baja), disminuyendo la respuesta al propio estrés.',
      },
    },
  ],
};
