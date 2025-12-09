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

export default function GuiaCuidadoMascotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CourseProvider>{children}</CourseProvider>;
}
