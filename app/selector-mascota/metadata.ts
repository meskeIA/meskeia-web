import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Mascota — ¿Qué animal se adapta a mí? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué mascota te conviene según tu estilo de vida, vivienda, tiempo disponible y presupuesto. Perro, gato, pequeño mamífero, pez, pájaro o reptil.',
  keywords: [
    'qué mascota tener',
    'selector mascota',
    'qué perro elegir',
    'mejor mascota para piso',
    'mascota para niños',
    'mascota fácil de cuidar',
    'perro o gato',
    'mascota sin jardín',
    'primera mascota',
    'qué animal se adapta a mí',
  ],
  openGraph: {
    title: '¿Qué mascota te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre qué animal se adapta a tu estilo de vida, espacio disponible, tiempo libre y presupuesto. Sin romanticismos, con información real.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-mascota/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Perro, gato o algo más? Descubre tu mascota ideal | meskeIA',
    description:
      'Test de 10 preguntas para encontrar la mascota que mejor encaja con tu vida real.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-mascota/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Mascota',
        description:
          'Test orientativo de 10 preguntas para descubrir qué tipo de mascota (perro, gato, pequeño mamífero, pez, pájaro o reptil) se adapta mejor a tu estilo de vida, espacio, tiempo disponible y presupuesto.',
        url: 'https://meskeia.com/selector-mascota/',
        features: [
          'Test de 10 preguntas sobre estilo de vida y situación',
          'Recomendación de tipo de mascota y perfil concreto',
          'Coste mensual estimado de mantenimiento',
          'Pros y contras adaptados a tu situación',
          'Consejos antes de adoptar o comprar',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Mascota",
  description: "Test de 10 preguntas para saber qué mascota te conviene según tu estilo de vida, vivienda, tiempo disponible y presupuesto. Perro, gato, pequeño mamífero, pez, pájaro o reptil.",
  url: "https://meskeia.com/selector-mascota/",
  category: 'UtilityApplication',
  features: [
    'Test de 10 preguntas sobre estilo de vida y situación',
    'Recomendación de tipo de mascota y perfil concreto',
    'Coste mensual orientativo de mantenimiento',
    'La alergia, los niños menores de 5 años y el presupuesto acotan la recomendación',
    'Empates entre candidatas explicados',
    'Pros y contras adaptados a tus respuestas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué mascota se adapta mejor a un piso pequeño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En pisos pequeños, los gatos y los roedores (como hámsters o cobayas) suelen adaptarse bien porque no necesitan salir a la calle diariamente y ocupan poco espacio. Los peces y los pájaros son también buenas opciones si el espacio es muy reducido. Los perros de razas grandes o muy activas, en cambio, suelen sufrir en espacios pequeños sin acceso a zonas de ejercicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mascota es más fácil de cuidar para alguien que trabaja muchas horas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los peces son la opción más autónoma: con una alimentación diaria y limpieza semanal del acuario es suficiente. Los gatos toleran bien la soledad durante la jornada laboral. Los reptiles y los roedores también requieren poca atención diaria. Los perros, en cambio, necesitan salir y hacer ejercicio a diario, y asociaciones británicas de bienestar animal como la RSPCA y la PDSA recomiendan no dejarlos solos de forma habitual más de cuatro horas seguidas: con jornadas largas fuera hace falta un paseador, una guardería canina o alguien que los atienda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta mantener una mascota al mes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste varía mucho según la especie, el tamaño, la ciudad y la clínica. Como referencia en España, la encuesta de la OCU de 2022 midió un gasto medio de 1.131 € al año por perro (unos 94 € al mes, entre alimentación, higiene y veterinario) y de 986 € por gato (unos 82 € al mes). Un perro grande cuesta más que uno pequeño, y los pequeños mamíferos, los peces y los pájaros de jaula cuestan bastante menos una vez hecha la instalación. A estos importes hay que sumar los gastos veterinarios imprevistos. En otros países, compáralos con los precios locales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué mascota es mejor si hay niños pequeños en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los perros de temperamento tranquilo y razas sociables (como el Golden Retriever o el Labrador) son excelentes con niños, aunque requieren supervisión. Los gatos también pueden convivir bien con niños, dependiendo del carácter del animal. Los pequeños mamíferos como las cobayas o los conejos enanos (el conejo es un lagomorfo, no un roedor) encajan mejor con niños de 5 años o más que ya pueden manipularlos con cuidado. Con menores de 5 años, los CDC de Estados Unidos no recomiendan reptiles ni anfibios en casa, por el riesgo de salmonela, y recomiendan que eviten el contacto con roedores (hámster, rata, cobaya…); además cuentan a los menores de 5 años entre quienes más riesgo de infección tienen con cualquier pequeño mamífero, conejo incluido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor adoptar o comprar una mascota?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Adoptar en protectoras y refugios permite dar un hogar a animales que lo necesitan y suele ser gratuito o tener un coste simbólico. Además, muchos animales en adopción ya están esterilizados y vacunados. Comprar a un criador acreditado puede tener sentido si se busca un perfil muy concreto de temperamento o tamaño. En cualquier caso, conviene evitar tiendas de animales que no acrediten la procedencia de sus ejemplares.',
      },
    },
  ],
};
