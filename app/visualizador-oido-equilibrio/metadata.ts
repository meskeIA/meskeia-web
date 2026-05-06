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
    url: 'https://meskeia.com/visualizador-oido-equilibrio',
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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
