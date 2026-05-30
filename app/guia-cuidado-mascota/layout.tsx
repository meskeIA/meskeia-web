import { Metadata } from 'next';
import { CourseProvider } from './CourseContext';

export const metadata: Metadata = {
  title: 'Guía para el Cuidado de tu Mascota | meskeIA',
  description: 'Guía práctica y cercana para cuidar a tu perro o gato. Aprende sobre alimentación, salud, crecimiento, emergencias y más. Con herramientas interactivas.',
  keywords: 'cuidado mascotas, perros, gatos, alimentación mascotas, salud mascotas, veterinario, cachorros, antiparasitarios, guía mascotas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía para el Cuidado de tu Mascota | meskeIA',
    description: 'Todo lo que necesitas saber para cuidar a tu perro o gato. Consejos prácticos y herramientas interactivas.',
    url: 'https://meskeia.com/guia-cuidado-mascota/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía para el Cuidado de tu Mascota',
    description: 'Aprende a cuidar a tu perro o gato con esta guía práctica y cercana.',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué vacunas necesita un perro o gato y cada cuánto tiempo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cachorros reciben su primera pauta vacunal entre las 6 y 8 semanas de vida, con refuerzos cada 3-4 semanas hasta las 16 semanas. Las vacunas esenciales para perros incluyen moquillo, parvovirus, hepatitis y rabia; para gatos, panleucopenia, calicivirus y rinotraqueítis. Después, se aplican recuerdos anuales o trienales según el tipo de vacuna y el criterio veterinario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas veces al día hay que alimentar a un perro adulto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo habitual para un perro adulto son dos comidas al día, mañana y tarde, con raciones adaptadas a su peso, raza y nivel de actividad. Los cachorros de menos de 6 meses necesitan tres o cuatro tomas diarias para mantener niveles de glucosa estables. El veterinario puede ajustar la frecuencia y cantidad según el estado de salud individual del animal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cada cuánto tiempo hay que desparasitar a una mascota?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La desparasitación interna (gusanos intestinales) se recomienda cada 1-3 meses en cachorros y cada 3-6 meses en adultos según su estilo de vida. La desparasitación externa (pulgas, garrapatas) depende del producto utilizado: pipetas mensuales, collares de 3-8 meses o comprimidos trimestrales. Las mascotas que salen al exterior o conviven con niños pequeños requieren una pauta más frecuente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé si mi mascota está enferma y necesita ir al veterinario urgentemente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales de alarma que requieren atención veterinaria inmediata son: dificultad respiratoria, abdomen muy hinchado, vómitos o diarrea con sangre, convulsiones, pérdida repentina del equilibrio, incapacidad para orinar y traumatismos o hemorragias. Síntomas más leves como pérdida de apetito o letargia durante más de 24-48 horas también merecen consulta, aunque sin urgencia extrema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre esterilizar y castrar a un animal de compañía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la práctica veterinaria cotidiana ambos términos se usan indistintamente para referirse a la eliminación quirúrgica de los órganos reproductores: ovariohisterectomía en hembras y orquiectomía en machos. La esterilización reduce el riesgo de tumores mamarios, piometra e infecciones uterinas en hembras, y de problemas prostáticos en machos. La mayoría de asociaciones protectoras y veterinarios la recomiendan entre los 6 y 12 meses de edad.',
      },
    },
  ],
};

export default function GuiaCuidadoMascotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <CourseProvider>{children}</CourseProvider>
    </>
  );
}
