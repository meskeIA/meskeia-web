import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHistoria, getAllHistoriaSlugs } from '@/data/historias/index';
import HistoriaInteractivo from './HistoriaInteractivo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllHistoriaSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getHistoria(slug);
  if (!data) return {};

  const url = `https://meskeia.com/visualizador-historia/${slug}/`;

  return {
    title: `${data.titulo} | meskeIA`,
    description: data.descripcionSEO,
    keywords: data.keywords.join(', '),
    openGraph: {
      title: data.titulo,
      description: data.descripcionSEO,
      url,
      siteName: 'meskeIA',
      type: 'website',
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.titulo,
      description: data.descripcionSEO,
    },
    alternates: { canonical: url },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const data = getHistoria(slug);
  if (!data) notFound();
  return <HistoriaInteractivo data={data} />;
}
