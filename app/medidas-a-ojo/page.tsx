'use client';
// @disclaimer: exempt

import styles from './MedidasAOjo.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { MEDIDAS_OJO } from '@/lib/calculadoras/medidasAOjo';

export default function MedidasAOjoPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Medidas «a ojo»</h1>
        <p className={styles.subtitle}>Cuánto es realmente una pizca, un chorro, un vaso o un puñado</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Tabla de medidas">
          <div className={styles.ingredientesBox}>
            {MEDIDAS_OJO.map((m) => (
              <div key={m.nombre} className={styles.ingRow}>
                <span className={styles.ingNombre}><span aria-hidden="true">{m.emoji}</span> {m.nombre}</span>
                <span className={styles.ingCantidad}>{m.equivalencia}</span>
              </div>
            ))}
          </div>
          <p className={styles.fuenteNota}>Equivalencias orientativas: cada cocina tiene su mano. Para repostería, donde las proporciones importan, mejor pesar.</p>
        </section>

        <EducationalSection title="Traducir las recetas «a ojo»" subtitle="Cuándo basta la mano y cuándo conviene la báscula">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>La cocina de la abuela y la báscula</h2>
              <p>
                Muchas recetas hablan de una pizca de sal, un chorro de aceite o un vaso de leche.
                Son medidas heredadas de una cocina que se hacía con la mano y el gusto, sin báscula,
                y funcionan estupendamente para platos flexibles como un guiso o un sofrito, donde
                un poco más o un poco menos no cambia el resultado. El problema llega en la
                repostería, donde las proporciones entre harina, azúcar, grasa y líquido son
                delicadas: ahí, traducir esas medidas imprecisas a gramos y mililitros es la
                diferencia entre que el bizcocho salga bien una vez o salga bien siempre.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Referencias rápidas</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Medida</th><th scope="col">Aproximadamente</th></tr></thead>
                <tbody>
                  <tr><td>Pizca</td><td>0,3 g</td></tr>
                  <tr><td>Cucharadita</td><td>5 ml</td></tr>
                  <tr><td>Cucharada</td><td>15 ml</td></tr>
                  <tr><td>Vaso de agua</td><td>200–250 ml</td></tr>
                  <tr><td>Puñado</td><td>30 g</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">💡</span><strong>A tener en cuenta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Para guisos, vale la mano.</strong> Un poco más o menos no estropea el plato.</li>
                <li><strong>Para repostería, pesa.</strong> Las proporciones marcan el resultado.</li>
                <li><strong>El vaso varía.</strong> Asegúrate de a qué vaso se refiere la receta.</li>
                <li><strong>Rasa salvo que diga "colmada".</strong> Las cucharadas, al ras por defecto.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('medidas-a-ojo')} />
      <ShareCard appName="medidas-a-ojo" />
      <Footer appName="medidas-a-ojo" />
    </div>
  );
}
