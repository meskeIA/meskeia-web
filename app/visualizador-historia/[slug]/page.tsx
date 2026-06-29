import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHistoria, getAllHistoriaSlugs } from '@/data/historias/index';
import HistoriaInteractivo from './HistoriaInteractivo';

interface Props {
  params: Promise<{ slug: string }>;
}

// Catálogo cerrado: solo slugs prerenderizados; cualquier otro → 404.
// dynamicParams=false elimina la lambda de reserva (necesario para `vercel build` prebuilt).
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllHistoriaSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getHistoria(slug);
  if (!data) return {};

  // Canonical cross-domain → Cronicum es el hogar canónico de las cronologías.
  // Esta copia en meskeIA sigue sirviéndose con estado 200 (no se rompe nada para
  // el usuario), pero le indica a Google que indexe la versión de cronicum.com y
  // así no competir consigo misma por el mismo contenido durante la ventana de
  // primera indexación de Cronicum. Es el paso previo (señal blanda, reversible)
  // al 301 definitivo, que se hará cuando cronicum.com esté plenamente indexado.
  const canonicalUrl = `https://cronicum.com/${slug}/`;

  return {
    title: `${data.titulo} | meskeIA`,
    description: data.descripcionSEO,
    keywords: data.keywords.join(', '),
    openGraph: {
      title: data.titulo,
      description: data.descripcionSEO,
      url: canonicalUrl,
      siteName: 'Cronicum',
      type: 'website',
      locale: 'es_ES',
      images: [{
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.titulo,
      description: data.descripcionSEO,
      images: ['https://meskeia.com/og-image.png'],
    },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const data = getHistoria(slug);
  if (!data) notFound();
  return <HistoriaInteractivo data={data} />;
}
