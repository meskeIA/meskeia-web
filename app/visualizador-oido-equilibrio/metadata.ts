import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Oído y Equilibrio - Anatomía, Audición y Sistema Vestibular | meskeIA',
  description: 'Explora la anatomía del oído (externo, medio e interno), cómo convertimos vibraciones en sonido, el sistema vestibular del equilibrio, pérdida auditiva y tinnitus.',
  keywords: 'oído, anatomía oído, cóclea, células ciliadas, equilibrio, canales semicirculares, sistema vestibular, pérdida auditiva, tinnitus, acúfenos, implante coclear',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Oído y Equilibrio - Anatomía, Audición y Sistema Vestibular',
    description: 'Anatomía del oído, transducción del sonido, equilibrio vestibular y pérdida auditiva. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-oido-equilibrio/',
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
    title: 'Oído y Equilibrio - Explicador Visual Interactivo',
    description: 'Cóclea, huesecillos, canales semicirculares y pérdida auditiva: el oído explicado visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Oído y Equilibrio meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Oído y Equilibrio - Anatomía, Audición y Sistema Vestibular',
  description: 'Explicador visual interactivo sobre la anatomía del oído humano: oído externo, medio e interno, transducción de vibraciones a señales nerviosas, sistema vestibular del equilibrio, pérdida auditiva y tinnitus.',
  url: 'https://meskeia.com/visualizador-oido-equilibrio/',
  category: 'EducationalApplication',
  features: [
    'SVG interactivo del oído con zonas clickables (externo, medio, interno)',
    'Proceso paso a paso de vibración a señal nerviosa',
    'Sistema vestibular: canales semicirculares y otolitos',
    'Datos sobre pérdida auditiva, tinnitus e implante coclear',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo convierte el oído las vibraciones en sonido que el cerebro entiende?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las ondas sonoras entran por el canal auditivo y hacen vibrar el tímpano. Esa vibración se amplifica a través de tres huesecillos (martillo, yunque y estribo) y llega a la cóclea, donde miles de células ciliadas la convierten en señales eléctricas. El nervio auditivo transmite esas señales al córtex auditivo del cerebro, que las interpreta como sonido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el sistema vestibular y cómo controla el equilibrio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema vestibular está dentro del oído interno e incluye tres canales semicirculares y dos estructuras llamadas sáculo y utrículo. Los canales detectan la rotación de la cabeza en los tres ejes del espacio, mientras que el sáculo y el utrículo perciben la aceleración lineal y la gravedad mediante cristales de carbonato cálcico (otolitos). La información llega al cerebelo, que coordina los movimientos para mantener el equilibrio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las causas más frecuentes de pérdida auditiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La causa más común en adultos es la presbiacusia, deterioro progresivo por envejecimiento de las células ciliadas. Otras causas frecuentes son la exposición prolongada a ruidos intensos (más de 85 dB), infecciones del oído medio, otosclerosis (fusión de los huesecillos), ciertos medicamentos ototóxicos y factores genéticos. La OMS estima que más de 1.500 millones de personas en el mundo tienen algún grado de pérdida auditiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el tinnitus o acúfeno y por qué se produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tinnitus es la percepción de un sonido (pitido, zumbido o silbido) sin que haya fuente sonora externa. Se produce porque el daño en las células ciliadas provoca actividad eléctrica espontánea en el nervio auditivo, que el cerebro interpreta como sonido. Afecta a entre el 10 y el 15 % de la población adulta; en la mayoría de los casos es crónico pero no peligroso, aunque puede afectar la calidad de vida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un implante coclear y en qué se diferencia de un audífono?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un audífono amplifica el sonido para que las células ciliadas residuales lo detecten mejor; es útil en pérdidas auditivas moderadas. El implante coclear, en cambio, sustituye la función de las células ciliadas dañadas: un micrófono externo captura el sonido, un procesador lo convierte en señales eléctricas y un conjunto de electrodos insertados en la cóclea estimulan directamente el nervio auditivo. Está indicado en pérdidas severas o profundas donde los audífonos ya no son eficaces.',
      },
    },
  ],
};
