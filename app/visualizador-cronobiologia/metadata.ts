import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-cronobiologia';
const TITLE = 'Cronobiología: Ritmos Circadianos, Cronotipos y Cronofarmacología';
const DESCRIPTION = 'Visualiza el reloj molecular CLOCK/BMAL1/PER/CRY, sincronizadores circadianos, cronotipos búho/alondra y el efecto del momento del día en la eficacia de medicamentos.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
    type: 'website',
  },
};

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Reloj molecular CLOCK/BMAL1/PER/CRY interactivo',
      'Slider de hora del día con fase circadiana activa',
      'Zeitgebers y sincronizadores circadianos',
      'Cronotipos alondra, colibrí y búho con curvas de alerta',
      'Tabla de cronofarmacología con horarios óptimos de medicamentos',
    ],
  });
}
