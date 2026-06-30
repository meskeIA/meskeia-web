import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist de Coberturas de Seguros por Perfil | meskeIA',
  description: 'Descubre qué seguros necesitas según tu perfil: autónomo, familia, jubilado, propietario o inquilino. Incluye seguro de coche (carro/auto), hogar, vida y salud. Coberturas obligatorias vs recomendables.',
  keywords: 'checklist seguros, coberturas recomendadas, seguros obligatorios, seguros familia, seguros autónomo, seguros jubilado, qué seguros contratar, seguro de coche, seguro de carro, seguro de auto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist de Coberturas de Seguros por Perfil | meskeIA',
    description: 'Descubre qué seguros necesitas según tu perfil: coche (carro/auto), hogar, vida y salud. Coberturas obligatorias y recomendables.',
    url: 'https://meskeia.com/checklist-coberturas-seguros/',
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
    title: 'Checklist de Coberturas de Seguros - meskeIA',
    description: 'Descubre qué seguros necesitas según tu perfil personal y familiar.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/checklist-coberturas-seguros/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Checklist Coberturas de Seguros",
  description: "Descubre qué seguros necesitas según tu perfil: autónomo, familia, jubilado, propietario o inquilino. Coberturas obligatorias vs recomendables en España.",
  url: "https://meskeia.com/checklist-coberturas-seguros/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué seguros son obligatorios en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En España son legalmente obligatorios el seguro de responsabilidad civil de vehículos a motor, el seguro decenal de daños en edificación nueva y el seguro de responsabilidad civil obligatorio para ciertas actividades profesionales. El seguro del hogar solo es obligatorio si lo exige la hipoteca, pero no por ley general. Conocer esta distinción evita contratar coberturas innecesarias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué coberturas necesita un autónomo para estar bien protegido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un trabajador por cuenta propia debería considerar al menos tres coberturas: responsabilidad civil profesional (para daños a clientes por errores u omisiones), seguro de accidentes o invalidez (porque la baja laboral en el RETA tiene carencias de 3 días) y seguro de salud privado si trabaja desde casa y quiere agilizar asistencia médica. La necesidad de cobertura de local o equipos depende de si tiene sede física.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre seguro a todo riesgo y terceros ampliado en el coche (carro o auto)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el seguro de coche (también llamado seguro de carro o de auto en Latinoamérica), el seguro a terceros básico solo cubre los daños que causes a otros; el terceros ampliado añade coberturas como robo, incendio, cristales y asistencia en carretera. El todo riesgo incluye además los daños propios del vehículo aunque el accidente sea culpa tuya. Para coches de más de 8-10 años con valor de mercado bajo, el todo riesgo suele ser menos rentable que terceros ampliado bien configurado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene sentido contratar seguro de vida si ya cotizo a la Seguridad Social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La prestación por fallecimiento de la Seguridad Social es una cantidad fija y reducida (actualmente 2.500 €), no una renta continua para los dependientes. El seguro de vida privado cubre el capital que necesita tu familia para mantener su nivel de vida si tú faltas: hipoteca pendiente, gastos de hijos a cargo, pérdida del segundo salario. Es especialmente relevante para familias con hipoteca elevada o con hijos menores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia debo revisar mis pólizas de seguros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo recomendable es revisar todas las pólizas al menos una vez al año, coincidiendo con la renovación anual. Además, cualquier cambio vital relevante (nacimiento de un hijo, compra de vivienda, cambio de empleo, inicio de actividad como autónomo) es motivo para una revisión inmediata. Los capitales asegurados en hogar y vida deberían actualizarse con la inflación para evitar infraseguros silenciosos.',
      },
    },
  ],
};
