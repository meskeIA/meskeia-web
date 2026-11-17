import type { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Metabolismo del Alcohol: Acetaldehído y Efectos en el Cuerpo | meskeIA',
  description: 'Descubre cómo el cuerpo procesa el alcohol: ADH, acetaldehído, ALDH2 y sus efectos en hígado, boca, estómago y cerebro. Información fisiológica educativa.',
  keywords: ['metabolismo alcohol', 'acetaldehído', 'ADH', 'ALDH2', 'hígado', 'cáncer', 'fisiología', 'alcohol deshidrogenasa'],
  openGraph: {
    title: 'Metabolismo del Alcohol: Acetaldehído y Salud',
    description: 'Cómo el cuerpo metaboliza el alcohol y por qué el acetaldehído es el protagonista perjudicial: hígado, boca, cerebro y estómago.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

// Hallazgo 4922 (17/11/2026): era «EducationalContent» sin url ni características (CLAUDE.md §1.ter).
// Las cinco características son lo que la app hace, visto en sus cuatro pestañas y su guía.
export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Metabolismo del Alcohol',
  description: 'Explicación fisiológica del metabolismo del etanol y los efectos del acetaldehído en múltiples órganos.',
  url: 'https://meskeia.com/visualizador-metabolismo-alcohol/',
  category: 'EducationalApplication',
  features: [
    'Ruta metabólica del etanol en cuatro pasos: ADH, ALDH2, acetil-CoA sintetasa y vía MEOS (CYP2E1)',
    'Selector de cuatro órganos (hígado, boca y esófago, estómago y cerebro) con su mecanismo, el papel del acetaldehído y las consecuencias del consumo crónico',
    'Tarjetas de la variante ALDH2*2 por genotipo (normal, heterocigoto y homocigoto) con su riesgo',
    'Efectos en el cerebro: GABA-A y NMDA, tolerancia, abstinencia, tetrahidroisoquinolinas y Wernicke-Korsakoff',
    'Guía educativa: unidad de bebida estándar, diferencias por sexo, interacción con medicamentos y acetaldehído preformado en bebidas fermentadas',
  ],
});

// Hallazgo 4921 (17/11/2026): el FAQPage traía cinco preguntas que la página no mostraba. Fuente
// única de las dos bocas: page.tsx pinta este array y el FAQPage sale de él (CLAUDE.md §1.ter).
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo metaboliza el cuerpo el alcohol?',
    answer: 'El alcohol (etanol) se absorbe rápidamente en el estómago e intestino delgado y llega al hígado, donde la enzima alcohol deshidrogenasa (ADH) lo convierte en acetaldehído. A continuación, la enzima aldehído deshidrogenasa (ALDH2) transforma el acetaldehído en acetato, una molécula relativamente inofensiva que el organismo puede oxidar para obtener energía. El alcohol pasa a la sangre a medida que se absorbe y se reparte por el agua de todo el cuerpo, cerebro incluido, desde la primera copa. El hígado lo elimina a un ritmo aproximadamente constante, del orden de una unidad por hora: beber más rápido que ese ritmo hace que la concentración en sangre siga subiendo, pero beber a ese ritmo no evita que el alcohol llegue al cerebro.',
  },
  {
    question: '¿Por qué el acetaldehído es el compuesto más peligroso del metabolismo del alcohol?',
    answer: 'El acetaldehído es una molécula altamente reactiva clasificada como carcinógeno del Grupo 1 por la IARC (Agencia Internacional de Investigación sobre el Cáncer). Daña el ADN directamente, forma aductos proteicos que alteran la función celular y genera estrés oxidativo. Se acumula especialmente en el hígado, la mucosa bucal, el esófago y el estómago, lo que explica el mayor riesgo de cánceres en estos órganos en consumidores habituales. El enrojecimiento facial ("flush asiático") que experimenta una parte de la población es precisamente señal de acumulación de acetaldehído por una variante menos activa de ALDH2.',
  },
  {
    question: '¿Por qué algunas personas se ponen rojas al beber alcohol?',
    answer: 'El enrojecimiento facial al beber (conocido como "flush asiático" o síndrome de rubor por alcohol) se produce por una variante genética de la enzima ALDH2 (ALDH2*2) frecuente en personas de ascendencia del este asiático, pero presente también en otras poblaciones. Esta variante hace que ALDH2 sea entre 8 y 40 veces menos eficiente, lo que provoca una acumulación rápida de acetaldehído en sangre. Además del enrojecimiento, se producen náuseas, taquicardia y malestar. Las personas con esta variante tienen un riesgo considerablemente mayor de cáncer esofágico si consumen alcohol con regularidad.',
  },
  {
    question: '¿Qué efectos tiene el alcohol en el cerebro a corto plazo?',
    answer: 'El alcohol actúa principalmente como depresor del sistema nervioso central. Potencia los receptores GABA (inhibitorios) y bloquea los receptores NMDA de glutamato (excitatorios), reduciendo la actividad neuronal general. A bajas concentraciones produce desinhibición, euforia y relajación porque las primeras áreas afectadas son las que regulan el autocontrol (córtex prefrontal). Con el aumento de la concentración, se ven afectados el cerebelo (coordinación), el hipocampo (formación de memoria) y finalmente el tronco encefálico (funciones vitales), lo que a niveles muy altos puede provocar coma o muerte.',
  },
  {
    question: '¿Tiene algún nivel de alcohol un efecto neutro o beneficioso sobre la salud?',
    answer: 'La posición científica actual (OMS 2023, The Lancet 2018) es que no existe ningún nivel de consumo de alcohol que sea seguro para la salud. Estudios anteriores que sugerían beneficio cardiovascular con consumo moderado han sido cuestionados por sesgos metodológicos, incluyendo el "sesgo del abstemio enfermo" (comparar bebedores con personas que dejaron de beber por enfermedad). El alcohol es carcinógeno del Grupo 1 de la IARC y está causalmente vinculado a al menos 7 tipos de cáncer, entre ellos mama, colon, hígado y esófago, sin umbral de riesgo cero identificado.',
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
