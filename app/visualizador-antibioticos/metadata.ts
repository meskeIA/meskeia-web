import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Antibióticos: Cómo Funcionan y la Resistencia | meskeIA',
  description:
    'Visualiza los 5 mecanismos de acción de los antibióticos, bacteriostático vs bactericida, y la crisis de la resistencia. Por qué no funcionan en virus.',
  keywords: [
    'antibioticos como funcionan',
    'resistencia antibiotica',
    'mecanismo antibioticos',
    'bacteriostático bactericida',
    'beta-lactámicos',
    'antibioticos y virus',
    'SARM resistencia',
  ],
  openGraph: {
    title: 'Antibióticos: 5 Mecanismos y la Crisis de la Resistencia',
    description:
      'Por qué atacan bacterias pero no virus, y por qué las bacterias aprenden a sobrevivir.',
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
  name: "Antibióticos: Cómo Matan Bacterias y la Resistencia",
  description: "Visualiza los 5 mecanismos de acción de los antibióticos, bacteriostático vs bactericida, y la crisis de la resistencia. Por qué no funcionan en virus.",
  url: "https://meskeia.com/visualizador-antibioticos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funcionan los antibióticos para matar bacterias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los antibióticos actúan sobre dianas específicas de las bacterias que no están presentes en las células humanas. Los cinco mecanismos principales son: inhibición de la síntesis de la pared celular (beta-lactámicos, glucopéptidos), alteración de la membrana citoplasmática (polimixinas), inhibición de la síntesis proteica (macrólidos, tetraciclinas, aminoglucósidos), inhibición de la síntesis de ácidos nucleicos (fluoroquinolonas) e inhibición de vías metabólicas clave (sulfonamidas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los antibióticos no funcionan contra los virus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los virus no son células: no tienen pared celular, ribosomas propios ni metabolismo independiente. Usan la maquinaria de la célula huésped para replicarse, por lo que las dianas de los antibióticos no existen en ellos. Usar antibióticos contra una infección viral (gripe, resfriado, COVID-19) no tiene efecto terapéutico y contribuye a generar resistencias bacterianas en el microbioma del paciente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un antibiótico bacteriostático y uno bactericida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un antibiótico bacteriostático inhibe el crecimiento y la reproducción de las bacterias sin matarlas directamente; el sistema inmune del paciente se encarga de eliminarlas. Un bactericida mata las bacterias de forma directa. En la práctica clínica, la distinción importa sobre todo en infecciones graves o en pacientes inmunodeprimidos, donde se prefieren bactericidas para garantizar la eliminación completa del patógeno.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo desarrollan las bacterias resistencia a los antibióticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las bacterias desarrollan resistencia por cuatro mecanismos: producción de enzimas que inactivan el antibiótico (ej. beta-lactamasas que destruyen la penicilina), modificación de la diana molecular, reducción de la permeabilidad de la membrana para impedir la entrada del fármaco, y bombas de eflujo que expulsan el antibiótico al exterior. Estos mecanismos se transmiten rápidamente entre bacterias mediante plásmidos (transferencia horizontal de genes), lo que acelera la diseminación de la resistencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es SARM y por qué es peligroso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SARM (Staphylococcus aureus resistente a meticilina) es una cepa de S. aureus que ha desarrollado resistencia a todos los antibióticos beta-lactámicos, incluidas las penicilinas y las cefalosporinas. Es responsable de infecciones graves en hospitales y comunidades, con tasas de mortalidad significativamente más altas que las cepas sensibles. Su tratamiento requiere antibióticos de reserva como la vancomicina o el linezolid, cuyo uso excesivo amenaza con generar nuevas resistencias.',
      },
    },
  ],
};
