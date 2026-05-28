import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cortisol - La Hormona del Estrés: Ritmo, Efectos y Hábitos | meskeIA',
  description: 'Entiende el cortisol en profundidad: ritmo circadiano hora a hora, diferencia entre estrés agudo y crónico, efectos en 8 sistemas del cuerpo y qué hábitos lo modulan.',
  keywords: ['cortisol', 'hormona estres', 'ritmo circadiano cortisol', 'estres cronico', 'CAR cortisol awakening response', 'eje HPA', 'hipocortisol', 'hipercortisol', 'manejo estres', 'fisiologia estres'],
  openGraph: {
    title: 'Cortisol - Hormona del Estrés | meskeIA',
    description: 'Ritmo circadiano, estrés agudo vs crónico, efectos en el cuerpo y moduladores',
    url: 'https://meskeia.com/visualizador-cortisol/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Cortisol - La Hormona del Estrés',
  url: 'https://meskeia.com/visualizador-cortisol/',
  description: 'Visualizador interactivo del cortisol: ritmo circadiano, estrés agudo vs crónico, efectos en 8 sistemas corporales y moduladores.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el cortisol y para qué sirve en el organismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cortisol es una hormona esteroide producida por las glándulas suprarrenales en respuesta a señales del eje hipotálamo-hipófisis-suprarrenal (HPA). Regula el metabolismo de glucosa, la respuesta inflamatoria, la presión arterial y el ritmo de vigilia-sueño. En situaciones de estrés prepara al cuerpo para actuar: moviliza energía, agudiza la atención y suprime funciones no urgentes como la digestión o la reproducción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo varía el cortisol a lo largo del día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cortisol sigue un ritmo circadiano muy marcado: alcanza su pico máximo unos 30-45 minutos después de despertar (fenómeno llamado Cortisol Awakening Response o CAR), con niveles entre 15-25 µg/dL, y desciende progresivamente durante el día hasta llegar a sus valores mínimos alrededor de la medianoche (1-5 µg/dL). Factores como la luz artificial nocturna, el trabajo en turnos o el jet lag pueden desincronizar este ritmo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre estrés agudo y estrés crónico en relación al cortisol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el estrés agudo, el cortisol sube puntualmente para ayudar a resolver la amenaza y luego regresa a la normalidad; esta respuesta es adaptativa y protectora. En el estrés crónico, los niveles permanecen elevados durante semanas o meses, lo que deteriora la memoria hipocampal, suprime el sistema inmune, favorece la acumulación de grasa abdominal y aumenta el riesgo cardiovascular. Con el tiempo, el eje HPA puede agotarse y producir hipocortisolismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hábitos elevan o reducen el cortisol de forma natural?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Elevan el cortisol: privación de sueño, cafeína en exceso, ejercicio de muy alta intensidad sin recuperación adecuada, dietas muy restrictivas y el uso prolongado de pantallas antes de dormir. Lo reducen: actividad física moderada regular, meditación y respiración diafragmática, sueño de calidad (7-9 horas), contacto social positivo y técnicas de relajación como el yoga. La alimentación rica en omega-3 y magnesio también muestra evidencia de modulación del eje HPA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué sistemas del cuerpo influye el cortisol elevado de forma sostenida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cortisol crónico elevado afecta al menos ocho sistemas: inmune (inmunosupresión), metabólico (resistencia a la insulina, obesidad central), cardiovascular (hipertensión), nervioso (reducción del volumen del hipocampo, ansiedad, depresión), reproductivo (alteraciones del ciclo menstrual, disfunción eréctil), digestivo (mayor permeabilidad intestinal), musculoesquelético (pérdida de masa muscular y densidad ósea) y dérmico (acné, cicatrización lenta). No sustituye a la valoración médica profesional.',
      },
    },
  ],
};
