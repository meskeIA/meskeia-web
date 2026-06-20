import { Metadata } from 'next';
import Link from 'next/link';
import { getPostsOrdenados } from './posts';
import { formatDate } from '@/lib';
import styles from './Blog.module.css';

const URL_CANONICA = 'https://delegum.com/blog/';

export const metadata: Metadata = {
  title: 'Blog de actualidad fiscal, laboral y financiera | Delegum',
  description:
    'Cada quincena, una novedad fiscal, laboral o financiera de España explicada en pocas líneas: qué cambia, a quién afecta y dónde calcularlo, con su fuente.',
  alternates: { canonical: URL_CANONICA },
};

// Blog JSON-LD — listado de publicaciones (objeto interno generado por el código).
const posts = getPostsOrdenados();
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Blog de Delegum',
  description:
    'Actualidad fiscal, laboral y financiera de España, en resúmenes breves y claros.',
  url: URL_CANONICA,
  publisher: { '@type': 'Organization', name: 'Delegum', url: 'https://delegum.com/' },
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.titulo,
    datePublished: p.fecha,
    description: p.resumen,
    url: `${URL_CANONICA}${p.slug}/`,
  })),
};

const jsonLdScript = JSON.stringify(jsonLd);

export default function BlogIndexPage() {
  return (
    <main className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />

      <header className={styles.hero}>
        <p className={styles.kicker}>Delegum · Blog</p>
        <h1 className={styles.title}>Actualidad fiscal, laboral y financiera</h1>
        <p className={styles.subtitle}>
          Cada quincena, una novedad explicada en pocas líneas: qué cambia, a quién afecta y dónde
          calcularlo o consultarlo. Con su fuente, sin tecnicismos.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className={styles.empty}>Próximamente publicaremos aquí la primera entrada.</p>
      ) : (
        <section className={styles.postList}>
          {posts.map((p) => {
            let fecha = p.fecha;
            try {
              fecha = formatDate(new Date(p.fecha));
            } catch {
              /* se mantiene el valor ISO si la fecha no es válida */
            }
            return (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.postCard}>
                <span className={styles.postCardFecha}>{fecha}</span>
                <h2 className={styles.postCardTitulo}>{p.titulo}</h2>
                <p className={styles.postCardResumen}>{p.resumen}</p>
              </Link>
            );
          })}
        </section>
      )}

      <p className={styles.foot}>
        ¿Buscas un dato, un cálculo, un proceso o un término?{' '}
        <Link href="/datos-fiscales" className={styles.link}>Datos fiscales</Link>
        {' · '}
        <Link href="/calculadoras" className={styles.link}>Calculadoras</Link>
        {' · '}
        <Link href="/guias" className={styles.link}>Guías</Link>
        {' · '}
        <Link href="/glosario" className={styles.link}>Glosario</Link>
      </p>
    </main>
  );
}
