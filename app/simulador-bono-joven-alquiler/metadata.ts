import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatNumber } from '@/lib/formatters';
import { BONO_ALQUILER_JOVEN_2026, UMBRAL_IPREM_VIVIENDA_JOVEN } from '@/data/fiscal';

// Las cifras salen de data/fiscal, nunca tecleadas (hallazgo 489): antes esta metadata tenía
// una segunda copia entera de las cuantías del art. 137 escrita a mano en description,
// twitter, features y tres respuestas del FAQPage, mientras page.tsx ya derivaba las suyas
// del mismo módulo. `eur()` replica el formateador local de page.tsx (sin decimales, como el
// resto de la app): formatCurrency añadiría los céntimos donde la página no los lleva.
const eur = (n: number) => `${formatNumber(n, 0)} €`;
const AYUDA_VIVIENDA = eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda);
const AYUDA_HABITACION = eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion);
const AYUDA_ANUAL_VIVIENDA = eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda * 12);
const AYUDA_ANUAL_HABITACION = eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion * 12);
const LIMITE_PORC = formatNumber(BONO_ALQUILER_JOVEN_2026.limiteSobreRenta * 100, 0);
const DURACION_TOTAL_ANIOS = BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12;
const EDAD_MIN = BONO_ALQUILER_JOVEN_2026.edad.minima;
const EDAD_MAX = BONO_ALQUILER_JOVEN_2026.edad.maxima;
const UMBRAL_IPREM_GENERAL = formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.general, 0);

export const metadata: Metadata = {
  title: 'Simulador Bono Joven Alquiler — Comprueba tu Elegibilidad | meskeIA',
  description:
    `Simulador Bono Joven Alquiler 2026-2030 (RD 326/2026): comprueba elegibilidad y calcula tu ayuda. Hasta ${AYUDA_VIVIENDA}/mes vivienda o ${AYUDA_HABITACION}/mes habitación durante hasta ${DURACION_TOTAL_ANIOS} años. Plan Estatal de Vivienda 2026-2030.`,
  keywords:
    'bono joven alquiler 2026, ayuda alquiler joven plan estatal vivienda 2026-2030, requisitos bono alquiler joven, 300 euros alquiler joven, elegibilidad bono alquiler, real decreto 326/2026, subsidio alquiler joven españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador Bono Joven Alquiler — Comprueba tu Elegibilidad',
    description:
      `¿Tienes entre ${EDAD_MIN} y ${EDAD_MAX} años? Comprueba si cumples los requisitos del Bono Alquiler Joven y cuánto puedes ahorrar.`,
    url: 'https://meskeia.com/simulador-bono-joven-alquiler/',
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
    title: 'Simulador Bono Joven Alquiler',
    description:
      `Comprueba si tienes derecho al Bono Joven Alquiler: hasta ${AYUDA_VIVIENDA}/mes vivienda o ${AYUDA_HABITACION}/mes habitación. Orientador rápido y gratuito.`,
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador Bono Joven Alquiler 2026-2030",
  description: `Simulador del Bono Joven Alquiler (Plan Estatal de Vivienda 2026-2030, RD 326/2026): comprueba si cumples los requisitos y calcula tu ayuda mensual. Hasta ${AYUDA_VIVIENDA}/mes para vivienda completa o ${AYUDA_HABITACION}/mes para habitación en piso compartido, durante hasta ${DURACION_TOTAL_ANIOS} años.`,
  url: "https://meskeia.com/simulador-bono-joven-alquiler/",
  category: 'FinanceApplication',
  features: [
    "Comprueba elegibilidad para el Bono Joven Alquiler 2026-2030 (RD 326/2026) con checklist de requisitos",
    `Calcula la ayuda mensual efectiva: hasta ${AYUDA_VIVIENDA}/mes en vivienda completa o ${AYUDA_HABITACION}/mes en habitación`,
    `Muestra el límite del ${LIMITE_PORC}% de la renta y el ahorro total acumulado en hasta ${DURACION_TOTAL_ANIOS} años`,
    "Diferencia entre requisitos imprescindibles y condicionantes para la aprobación",
    "Guía del proceso de solicitud paso a paso por Comunidad Autónoma",
    "Funciona sin registro, sin enviar datos personales al servidor",
    "RegionBadge: ayuda aplicable exclusivamente en España",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Bono Joven Alquiler 2026 y cuánto dinero da?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El Bono Joven Alquiler es una ayuda directa del Plan Estatal de Vivienda 2026-2030 (Real Decreto 326/2026) para jóvenes de ${EDAD_MIN} a ${EDAD_MAX} años. La cuantía máxima es de ${AYUDA_VIVIENDA}/mes para vivienda completa o ${AYUDA_HABITACION}/mes para habitación en piso compartido, durante hasta ${DURACION_TOTAL_ANIOS} años (2 años renovables por otros 2). El importe no puede superar el ${LIMITE_PORC}% de la renta mensual.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los requisitos de ingresos para pedir el Bono Alquiler Joven 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El RD 326/2026 (art. 133.1.d) fija el umbral en ${UMBRAL_IPREM_GENERAL} veces el IPREM de ingresos anuales, que sube con discapacidad reconocida (5,5 veces con el 33% o más, 6 veces con el 65% o más). Cada Comunidad Autónoma concreta el cómputo exacto en su propia convocatoria. Es imprescindible consultar la convocatoria de la comunidad autónoma donde se ubica la vivienda alquilada para conocer el detalle aplicable.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se solicita el Bono Joven Alquiler y dónde se tramita?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La solicitud se tramita a través de la consejería o agencia de vivienda de la comunidad autónoma donde esté situada la vivienda alquilada, ya que son las CCAA las encargadas de gestionar y conceder las ayudas. Cada comunidad tiene su propio plazo y procedimiento, habitualmente telemático. Es imprescindible tener contrato de alquiler en vigor y estar empadronado en la vivienda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el Bono Joven Alquiler y otras ayudas al alquiler autonómicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Bono Joven Alquiler es una ayuda estatal cofinanciada por las comunidades autónomas, con requisitos de edad e ingresos homogéneos en toda España. Muchas comunidades tienen además sus propias ayudas complementarias al alquiler, con requisitos diferentes (límites de renta distintos, tramos de edad más amplios, cuantías adicionales). No se pueden cobrar las dos a la vez: el art. 136 del Real Decreto 326/2026 declara esta ayuda incompatible con cualquier otra destinada al pago del alquiler o de la cesión de uso de la misma vivienda o habitación. Hay que elegir la que más convenga. Distinto es la deducción autonómica del IRPF por alquiler de vivienda habitual, que no es una ayuda al pago sino un beneficio fiscal y se rige por la normativa de cada región.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Bono Joven Alquiler tributa en el IRPF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Sí, el Bono Joven Alquiler está sujeto al IRPF como ganancia patrimonial no derivada de la transmisión de elementos patrimoniales. Debe declararse en la renta del ejercicio en que se cobra. No obstante, al integrarse en la base general del impuesto y dada su cuantía (máximo ${AYUDA_ANUAL_VIVIENDA} anuales con los ${AYUDA_VIVIENDA}/mes de vivienda completa, o ${AYUDA_ANUAL_HABITACION} con los ${AYUDA_HABITACION}/mes de habitación), el impacto fiscal suele ser moderado. Es recomendable verificar la tributación exacta con un asesor fiscal según el perfil concreto.`,
      },
    },
  ],
};
