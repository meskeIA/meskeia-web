import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia — meskeIA',
  description: 'Visualizador de la biología molecular del cáncer. Oncogenes vs genes supresores (RAS, TP53, RB1), los 6 Hallmarks de Hanahan & Weinberg, mecanismo PD-1/PD-L1 de inmunoterapia. Sin síntomas ni estadísticas.',
  keywords: ['cáncer biología molecular', 'oncogenes genes supresores tumorales', 'RAS TP53 RB1 mutaciones cáncer', 'hallmarks cáncer Hanahan Weinberg', 'inmunoterapia PD-1 PD-L1 mecanismo', 'angiogénesis VEGF tumor', 'telomerasa cáncer Hayflick', 'apoptosis Bcl-2 evasión cáncer'],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia — meskeIA',
    description: 'Cómo las mutaciones en oncogenes y genes supresores llevan a la división descontrolada. Los 6 hallmarks y la inmunoterapia.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-cancer',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia',
    description: 'Oncogenes, genes supresores, los 6 hallmarks y la inmunoterapia PD-1/PD-L1. Biología molecular pura.',
  },
  other: { 'application-name': 'Cáncer Biología Molecular meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cáncer: Biología Molecular — Oncogenes, Hallmarks e Inmunoterapia',
  description: 'Visualizador interactivo de la biología molecular del cáncer: ciclo celular, oncogenes vs genes supresores (RAS, TP53, RB1), los 6 hallmarks de Hanahan & Weinberg y el mecanismo molecular de la inmunoterapia PD-1/PD-L1.',
  url: 'https://meskeia.com/visualizador-cancer/',
  category: 'EducationalApplication',
  features: [
    'Ciclo celular y checkpoints explicados visualmente',
    'Oncogenes vs genes supresores: RAS, MYC, HER2, TP53, RB1, BRCA',
    'Los 6 hallmarks del cáncer (Hanahan & Weinberg 2000)',
    'Mecanismo PD-1/PD-L1 de inmunoterapia con SVG interactivo',
    'Tipos de cáncer por origen celular (sin estadísticas)',
    'Enfoque exclusivo en biología molecular, sin síntomas ni estadios',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
