import { Metadata } from 'next';
import Link from 'next/link';
import { GLOSARIO, TERMINOS_PLANOS } from './glosario';
import { getFicha } from '../datos-fiscales/fichas';
import styles from './Glosario.module.css';

const URL_CANONICA = 'https://delegum.com/glosario/';

export const metadata: Metadata = {
  title: 'Glosario fiscal, laboral y financiero | Delegum',
  description:
    'Definiciones claras de los términos fiscales, laborales y financieros que más confunden: base imponible, base reguladora, IPREM, plusvalía, TAE, devengo y muchos más.',
  alternates: { canonical: URL_CANONICA },
};

// DefinedTermSet JSON-LD — schema propio de glosarios; señal para Google y las IAs.
// Objeto interno generado por el propio código (sin input externo).
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'Glosario fiscal, laboral y financiero de España',
  description:
    'Términos fiscales, laborales y financieros de España definidos de forma clara y orientativa, agrupados por categoría.',
  url: URL_CANONICA,
  publisher: { '@type': 'Organization', name: 'Delegum', url: 'https://delegum.com/' },
  hasDefinedTerm: TERMINOS_PLANOS.map((t) => ({
    '@type': 'DefinedTerm',
    name: t.termino,
    description: t.definicion,
    url: `${URL_CANONICA}#${t.id}`,
  })),
};

const jsonLdScript = JSON.stringify(jsonLd);

export default function GlosarioPage() {
  return (
    <main className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript }} />

      <header className={styles.hero}>
        <p className={styles.kicker}>Delegum · Glosario</p>
        <h1 className={styles.title}>Glosario fiscal, laboral y financiero</h1>
        <p className={styles.subtitle}>
          La terminología que más confunde, explicada en lenguaje claro. Lo que el gremio da por
          sabido, definido para todos.
        </p>
      </header>

      <p className={styles.nota}>
        Definiciones orientativas para entender la terminología. No sustituyen el texto legal ni el
        criterio de un profesional; ante un caso concreto, acude a la fuente oficial.
      </p>

      <nav className={styles.jumpNav} aria-label="Categorías del glosario">
        {GLOSARIO.map((cat) => (
          <a key={cat.id} href={`#${cat.id}`} className={styles.jumpLink}>
            {cat.nombre}
          </a>
        ))}
      </nav>

      {GLOSARIO.map((cat) => (
        <section key={cat.id} id={cat.id} className={styles.categoria}>
          <h2 className={styles.categoriaTitulo}>{cat.nombre}</h2>
          <div className={styles.terminosGrid}>
            {cat.terminos.map((t) => {
              const ficha = t.fichaSlug ? getFicha(t.fichaSlug) : undefined;
              return (
                <article key={t.id} id={t.id} className={styles.terminoCard}>
                  <h3 className={styles.terminoNombre}>{t.termino}</h3>
                  <p className={styles.terminoDef}>{t.definicion}</p>
                  {ficha && (
                    <Link href={`/datos-fiscales/${ficha.slug}`} className={styles.fichaLink}>
                      Ver ficha: {ficha.titulo} →
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <p className={styles.foot}>
        ¿Buscas un dato, un cálculo o un proceso completo?{' '}
        <Link href="/datos-fiscales" className={styles.link}>Datos fiscales</Link>
        {' · '}
        <Link href="/calculadoras" className={styles.link}>Calculadoras</Link>
        {' · '}
        <Link href="/guias" className={styles.link}>Guías</Link>
      </p>
    </main>
  );
}
