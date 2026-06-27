'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './FermentadosVegetales.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { METODOS_FERMENTO, METODO_FERMENTO_POR_ID, calcularFermento } from '@/lib/calculadoras/fermentadosVegetales';
import { formatNumber } from '@/lib/formatters';

export default function FermentadosVegetalesPage() {
  const [metodoId, setMetodoId] = useState('seco');
  const [peso, setPeso] = useState('1000');

  const metodo = METODO_FERMENTO_POR_ID[metodoId];
  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularFermento(metodoId, num(peso)), [metodoId, peso]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Fermentados vegetales</h1>
        <p className={styles.subtitle}>La sal exacta para fermentar verduras: chucrut, kimchi y fermentados en salmuera</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Método</p>
          <div className={styles.tipoBtns} role="group" aria-label="Método de fermentación">
            {METODOS_FERMENTO.map((m) => (
              <button key={m.id} type="button" aria-pressed={metodoId === m.id}
                className={`${styles.tipoBtn} ${metodoId === m.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setMetodoId(m.id)}>
                <span className={styles.tipoBtnNombre}><span aria-hidden="true">{m.emoji}</span> {m.nombre} · {m.porcentaje}%</span>
                <span className={styles.tipoBtnNota}>{m.ejemplo}. {m.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="peso" className={styles.label}>
              {metodo.sobre === 'verdura' ? 'Peso de la verdura (g)' : 'Peso del agua (g/ml)'}
            </label>
            <input id="peso" type="text" inputMode="numeric" className={styles.input}
              value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoBig} role="status" aria-live="polite">
              <span className={styles.resBigValor}>{formatNumber(resultado.sal_g, 1)} g de sal</span>
              <span className={styles.resBigTexto}>{resultado.porcentaje}% sobre {resultado.sobre === 'verdura' ? 'la verdura' : 'el agua'}</span>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce el peso.</p>
          )}
        </section>

        <EducationalSection title="Fermentar verduras en casa" subtitle="Por qué la sal manda y cómo hacerlo seguro">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>La sal es la guardiana</h2>
              <p>
                En la lacto-fermentación no se añade ningún fermento: las propias bacterias de la
                verdura hacen el trabajo, transformando los azúcares en ácido láctico, que conserva y
                da ese sabor ácido característico del chucrut o el kimchi. La sal es la pieza clave de
                seguridad: en la concentración correcta crea un entorno donde prosperan las bacterias
                buenas y se frenan las dañinas. Por eso conviene pesarla y no echarla a ojo. Hay dos
                formas de aplicarla: en seco, mezclada con la verdura rallada, o en salmuera, disuelta
                en el agua que cubre la verdura.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Los dos métodos</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Método</th><th scope="col">Sal</th><th scope="col">Ejemplos</th></tr></thead>
                <tbody>
                  <tr><td>En seco</td><td>2% de la verdura</td><td>Chucrut, kimchi de col rallada</td></tr>
                  <tr><td>En salmuera</td><td>3% del agua</td><td>Pepinillos, zanahoria, judía verde</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para fermentar seguro</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Pesa la sal.</strong> Es la clave de la seguridad; ni poca (arriesgado) ni mucha (no fermenta).</li>
                <li><strong>Verdura bajo el líquido.</strong> Lo que asoma cría moho; usa un peso para sumergirla.</li>
                <li><strong>Utensilios limpios.</strong> Higiene básica para evitar contaminaciones.</li>
                <li><strong>Confía en tus sentidos.</strong> Debe oler ácido y agradable; ante moho, mal olor o colores raros, deséchalo.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('fermentados-vegetales')} />
      <ShareCard appName="fermentados-vegetales" />
      <Footer appName="fermentados-vegetales" />
    </div>
  );
}
