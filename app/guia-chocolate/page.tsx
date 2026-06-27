'use client';
// @disclaimer: exempt

import styles from './GuiaCard.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { CHOCOLATES } from '@/lib/guias/chocolate';

export default function GuiaChocolatePage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Guía de chocolate y cacao</h1>
        <p className={styles.subtitle}>Qué significa el porcentaje y qué chocolate usar para cada cosa en repostería</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.grid} style={{ marginTop: '24px' }}>
          {CHOCOLATES.map((c) => (
            <article key={c.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{c.emoji}</span>
                <h2 className={styles.cardNombre}>{c.nombre}</h2>
              </div>
              <div className={styles.cardBadges}>
                <span className={styles.badge}>{c.cacao}</span>
              </div>
              <p className={styles.cardUso}><strong>Uso:</strong> {c.uso}</p>
              <p className={styles.cardNota}>{c.nota}</p>
            </article>
          ))}
        </section>

        <EducationalSection title="Entender el chocolate" subtitle="El porcentaje, los tipos y cómo trabajarlo">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Todo está en el porcentaje</h2>
              <p>
                El número que aparece en una tableta de chocolate es la clave para entenderlo: indica
                cuánto cacao lleva, y por tanto cuánto azúcar. Un chocolate del 70% tiene mucho cacao
                y poco azúcar, así que es intenso y poco dulce; uno con leche, con apenas un 30-40% de
                cacao, es cremoso y dulce. En repostería, elegir el porcentaje adecuado no es solo
                cuestión de gusto: cambia el dulzor final de la receta y la textura de una ganache o
                una mousse. Y aparte del chocolate de comer está el de cobertura, con más manteca de
                cacao, pensado para fundir y bañar con brillo.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Qué usar para qué</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Para…</th><th scope="col">Usa…</th></tr></thead>
                <tbody>
                  <tr><td>Ganache, mousse</td><td>Negro 70%</td></tr>
                  <tr><td>Bombones y baños brillantes</td><td>Cobertura (atemperada)</td></tr>
                  <tr><td>Bizcocho de chocolate</td><td>Cacao en polvo + chocolate</td></tr>
                  <tr><td>Galletas con trozos</td><td>Negro suave o con leche</td></tr>
                  <tr><td>Decoración blanca</td><td>Chocolate blanco</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Al trabajar el chocolate</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Ni una gota de agua.</strong> Lo agarrota; utensilios bien secos.</li>
                <li><strong>Funde con suavidad.</strong> Baño maría o microondas a golpes cortos, removiendo.</li>
                <li><strong>Cacao natural vs. dutch.</strong> Cambian la acidez y el leudante; no siempre se intercambian.</li>
                <li><strong>Atempera para brillo.</strong> Los bombones necesitan atemperado para quedar lustrosos y con "crac".</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('guia-chocolate')} />
      <ShareCard appName="guia-chocolate" />
      <Footer appName="guia-chocolate" />
    </div>
  );
}
