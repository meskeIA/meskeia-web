import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, getPost } from '../posts';
import { getFicha } from '../../datos-fiscales/fichas';
import { formatDate } from '@/lib';
import styles from '../Blog.module.css';

const BASE = 'https://delegum.com/blog/';

// Catálogo cerrado: solo slugs prerenderizados; cualquier otro → 404.
// dynamicParams=false elimina la lambda de reserva (necesario para `vercel build` prebuilt).
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.titulo} | Blog de Delegum`,
    description: post.resumen,
    alternates: { canonical: `${BASE}${slug}/` },
    openGraph: {
      type: 'article',
      title: post.titulo,
      description: post.resumen,
      url: `${BASE}${slug}/`,
      siteName: 'Delegum',
      locale: 'es_ES',
      publishedTime: post.fecha,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  let fecha = post.fecha;
  try {
    fecha = formatDate(new Date(post.fecha));
  } catch {
    /* se mantiene el valor ISO si la fecha no es válida */
  }

  const ficha = post.fichaSlug ? getFicha(post.fichaSlug) : undefined;

  // BlogPosting JSON-LD (objeto interno generado por el código).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.resumen,
    datePublished: post.fecha,
    url: `${BASE}${slug}/`,
    mainEntityOfPage: `${BASE}${slug}/`,
    inLanguage: 'es-ES',
    author: { '@type': 'Organization', name: 'Delegum', url: 'https://delegum.com/' },
    publisher: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com/' },
  };
  const jsonLdScript = JSON.stringify(jsonLd);

  return (
    <main className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />

      <article className={styles.article}>
        <header className={styles.postHeader}>
          <p className={styles.postFecha}>{fecha}</p>
          <h1 className={styles.postTitulo}>{post.titulo}</h1>
        </header>

        <div className={styles.postCuerpo}>
          {post.cuerpo.map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </div>

        {(post.fuente || post.fuenteUrl) && (
          <p className={styles.fuenteBox}>
            Fuente:{' '}
            {post.fuenteUrl ? (
              <a href={post.fuenteUrl} className={styles.link} rel="nofollow noopener" target="_blank">
                {post.fuente ?? post.fuenteUrl}
              </a>
            ) : (
              post.fuente
            )}
          </p>
        )}

        {ficha && (
          <p className={styles.fichaBox}>
            Dato relacionado:{' '}
            <Link href={`/datos-fiscales/${ficha.slug}`} className={styles.link}>
              {ficha.titulo} →
            </Link>
          </p>
        )}

        {post.visualizadorUrl && (
          <p className={styles.profundizaBox}>
            <span aria-hidden="true">🔎</span> Para profundizar:{' '}
            <a href={post.visualizadorUrl} className={styles.link}>
              {post.visualizadorTitulo ?? 'Ver el visualizador interactivo'} →
            </a>
          </p>
        )}
      </article>

      <p className={styles.volver}>
        <Link href="/blog" className={styles.link}>← Volver al blog</Link>
      </p>
    </main>
  );
}
