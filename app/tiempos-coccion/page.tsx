'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './TiemposCoccion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  TIEMPOS_COCCION,
  CATEGORIAS_COCCION,
  type CategoriaCoccion,
} from '@/lib/calculadoras/tiemposCoccion';

const CATEGORIAS = Object.keys(CATEGORIAS_COCCION) as CategoriaCoccion[];

export default function TiemposCoccionPage() {
  const [filtro, setFiltro] = useState<CategoriaCoccion | null>(null);

  const lista = useMemo(
    () => (filtro ? TIEMPOS_COCCION.filter((t) => t.categoria === filtro) : TIEMPOS_COCCION),
    [filtro],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Tiempos de cocción</h1>
        <p className={styles.subtitle}>
          Cuánto cocer cada alimento en agua: huevos, arroz, pasta, legumbres y verduras, con
          notas prácticas
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Filtro */}
        <div className={styles.filtroBtns} role="group" aria-label="Filtrar por tipo de alimento">
          <button
            type="button"
            aria-pressed={filtro === null}
            className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltro(null)}
          >
            Todos
          </button>
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filtro === c}
              className={`${styles.filtroBtn} ${filtro === c ? styles.filtroBtnActivo : ''}`}
              onClick={() => setFiltro(c)}
            >
              {CATEGORIAS_COCCION[c]}
            </button>
          ))}
        </div>

        {/* Lista */}
        <section className={styles.grid} aria-live="polite">
          {lista.map((t) => (
            <article key={t.nombre} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardEmoji} aria-hidden="true">{t.emoji}</span>
                <span className={styles.cardTiempo}>{t.tiempo}</span>
              </div>
              <h2 className={styles.cardNombre}>{t.nombre}</h2>
              <p className={styles.cardNota}>{t.nota}</p>
            </article>
          ))}
        </section>

        <div className={styles.altitudBox}>
          <span aria-hidden="true">⛰️</span>
          <p>
            En altura el agua hierve más fría y los tiempos se alargan, sobre todo en legumbres.
            Calcula el efecto en{' '}
            <Link href="/ajuste-recetas-altitud/" className={styles.altitudLink}>
              ajuste de recetas por altitud
            </Link>
            .
          </p>
        </div>

        <p className={styles.fuenteNota}>
          Tiempos orientativos en agua hirviendo a nivel del mar. Los huevos se cuentan desde que el
          agua hierve; las legumbres, con remojo previo salvo las lentejas. Ajusta a tu gusto de punto.
        </p>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Cocer en agua, sin pasarse ni quedarse corto"
          subtitle="De qué dependen los tiempos y los trucos para acertar el punto"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El tiempo es una guía, el punto lo decides tú</h2>
              <p>
                Los tiempos de cocción son orientativos: dependen del tamaño del corte, de la
                cantidad de alimento, de lo fuerte que hierva el agua y de tu gusto. Un arroz puede
                quedar al dente o suelto según un par de minutos, y unas verduras pierden color y
                textura si se pasan. Lo práctico es usar el tiempo como referencia y comprobar el
                punto al final: pinchar la patata, probar la pasta, ver si la legumbre está tierna.
                Y recuerda que muchos alimentos siguen cociéndose un poco por el calor residual una
                vez escurridos.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Trucos por familia</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🥚</span>
                    <strong>Huevos</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Cuenta el tiempo desde que el agua hierve, no desde que enciendes el fuego.
                    Enfría en agua fría al sacarlos para cortar la cocción y pelarlos mejor.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍚</span>
                    <strong>Arroz y cereales</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Respeta la proporción de agua y deja reposar tapado al final. Enjuagar el
                    basmati o la quinoa antes mejora la textura y el sabor.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🫘</span>
                    <strong>Legumbres</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Remoja la víspera (salvo las lentejas) y cuece a fuego suave para que no se
                    rompan. La olla a presión reduce el tiempo a un tercio.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🥦</span>
                    <strong>Verduras</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Cuécelas justas y, si quieres que mantengan el color, pásalas a agua con hielo.
                    Al vapor conservan más nutrientes que hervidas.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>A tener en cuenta</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Alubias rojas.</strong> Crudas o poco cocidas contienen una lectina que sienta mal; remójalas, tira el agua y hiérvelas fuerte 10 minutos al inicio.</li>
                <li><strong>La sal en las legumbres.</strong> Añadir la sal muy al principio puede endurecer la piel; mejor hacia el final de la cocción.</li>
                <li><strong>En altura, más tiempo.</strong> Con el agua hirviendo a menos temperatura, todo tarda más; cuenta con ello y usa olla a presión.</li>
                <li><strong>No te fíes solo del reloj.</strong> Comprueba el punto pinchando o probando; el tamaño del corte cambia mucho el tiempo.</li>
                <li><strong>Calor residual.</strong> La pasta y las verduras siguen ablandándose tras escurrir; sácalas un punto antes de lo que quieres.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('tiempos-coccion')} />
      <ShareCard appName="tiempos-coccion" />
      <Footer appName="tiempos-coccion" />
    </div>
  );
}
