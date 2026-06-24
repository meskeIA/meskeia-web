import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHistoria, getAllHistoriaSlugs } from '@/data/historias/index';
import { getPuerta, getAllPuertaSlugs, getPuertaDeCronologia } from '@/data/cronicum/puertas';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import HistoriaInteractivo from '../../visualizador-historia/[slug]/HistoriaInteractivo';
import PuertaView, { type CronologiaItem } from './PuertaView';
import Migas from './Migas';

interface Props {
  params: Promise<{ slug: string }>;
}

// Catálogo cerrado: solo existen los slugs prerenderizados; cualquier otro → 404.
// dynamicParams=false elimina la lambda de reserva (necesario para `vercel build`
// prebuilt, que no la empaqueta correctamente para rutas dinámicas).
export const dynamicParams = false;

// Prerendera tanto las 12 puertas como las 142 cronologías bajo /cronicum/[slug].
export async function generateStaticParams() {
  const puertas = getAllPuertaSlugs();
  const cronologias = getAllHistoriaSlugs();
  return [...puertas, ...cronologias].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const url = `https://cronicum.com/${slug}/`;

  const puerta = getPuerta(slug);
  if (puerta) {
    const title = `${puerta.titulo} — Cronicum`;
    return {
      title,
      description: puerta.descripcion,
      alternates: { canonical: url },
      openGraph: {
        title,
        description: puerta.descripcion,
        url,
        siteName: 'Cronicum',
        type: 'website',
        locale: 'es_ES',
      },
    };
  }

  const data = getHistoria(slug);
  if (!data) return {};
  return {
    title: `${data.titulo} | Cronicum`,
    description: data.descripcionSEO,
    keywords: data.keywords.join(', '),
    alternates: { canonical: url },
    openGraph: {
      title: data.titulo,
      description: data.descripcionSEO,
      url,
      siteName: 'Cronicum',
      type: 'website',
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.titulo,
      description: data.descripcionSEO,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  // 1) ¿Es una puerta? → vista de puerta con sus cronologías.
  const puerta = getPuerta(slug);
  if (puerta) {
    const items: CronologiaItem[] = puerta.slugs
      .map((s) => {
        const d = getHistoria(s);
        return d ? { slug: s, titulo: d.titulo, subtitulo: d.subtitulo } : null;
      })
      .filter((x): x is CronologiaItem => x !== null);
    return <PuertaView puerta={puerta} items={items} />;
  }

  // 2) ¿Es una cronología? → mismo visualizador interactivo, bajo la marca Cronicum
  //    (sin chrome de meskeIA) + migas de pan Cronicum / Puerta / Cronología.
  const data = getHistoria(slug);
  if (!data) notFound();
  const puertaDe = getPuertaDeCronologia(slug);
  return (
    <>
      <AnalyticsTracker appName={`cronicum-${slug}`} />
      <HistoriaInteractivo
        data={data}
        marca="cronicum"
        topSlot={<Migas puerta={puertaDe} titulo={data.titulo} />}
      />
    </>
  );
}
