'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './DensidadLiquidos.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { LIQUIDOS, convertirDensidad, type DireccionDensidad } from '@/lib/calculadoras/densidadLiquidos';
import { formatNumber } from '@/lib/formatters';

export default function DensidadLiquidosPage() {
  const [liquidoId, setLiquidoId] = useState('aceite');
  const [direccion, setDireccion] = useState<DireccionDensidad>('ml-a-g');
  const [cantidad, setCantidad] = useState('250');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(
    () => convertirDensidad(liquidoId, direccion, num(cantidad)),
    [liquidoId, direccion, cantidad],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de líquidos (ml ↔ g)</h1>
        <p className={styles.subtitle}>Cada líquido pesa lo suyo: convierte mililitros y gramos según su densidad</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Conversor">
          <div className={styles.campo}>
            <label htmlFor="liquido" className={styles.label}>Líquido</label>
            <select id="liquido" className={styles.select} value={liquidoId} onChange={(e) => setLiquidoId(e.target.value)}>
              {LIQUIDOS.map((l) => (
                <option key={l.id} value={l.id}>{l.emoji} {l.nombre} ({formatNumber(l.densidad, 2)} g/ml)</option>
              ))}
            </select>
          </div>

          <div className={styles.chipGrid} role="tablist" aria-label="Dirección">
            <button type="button" role="tab" aria-selected={direccion === 'ml-a-g'}
              className={`${styles.chip} ${direccion === 'ml-a-g' ? styles.chipActivo : ''}`}
              onClick={() => setDireccion('ml-a-g')}>Mililitros → gramos</button>
            <button type="button" role="tab" aria-selected={direccion === 'g-a-ml'}
              className={`${styles.chip} ${direccion === 'g-a-ml' ? styles.chipActivo : ''}`}
              onClick={() => setDireccion('g-a-ml')}>Gramos → mililitros</button>
          </div>

          <div className={styles.campo}>
            <label htmlFor="cantidad" className={styles.label}>{direccion === 'ml-a-g' ? 'Mililitros (ml)' : 'Gramos (g)'}</label>
            <input id="cantidad" type="text" inputMode="decimal" className={styles.input}
              value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoBig} role="status" aria-live="polite">
              <span className={styles.resBigValor}>{formatNumber(resultado.valor, resultado.valor % 1 === 0 ? 0 : 1)} {resultado.unidad}</span>
              <span className={styles.resBigTexto}>densidad {formatNumber(resultado.densidad, 2)} g/ml</span>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce una cantidad.</p>
          )}
        </section>

        <EducationalSection title="Por qué cada líquido pesa distinto" subtitle="La densidad y cuándo te cambia una receta">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Mismo volumen, distinto peso</h2>
              <p>
                Solemos dar por hecho que un mililitro es un gramo, pero eso solo es cierto para el
                agua. Cada líquido tiene su densidad: el aceite pesa menos que el agua (por eso flota),
                mientras que la miel o los siropes pesan bastante más, porque son soluciones muy
                concentradas de azúcares. Por eso un litro de aceite no llega al kilo y 100 ml de miel
                pesan casi 145 gramos. En cocina general la diferencia suele dar igual, pero en
                repostería —donde las recetas precisas dan los líquidos en gramos— convertir según la
                densidad evita errores que se notan en el resultado.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Densidades de cocina</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Líquido</th><th scope="col">g/ml</th><th scope="col">1 litro pesa…</th></tr></thead>
                <tbody>
                  <tr><td>Aceite</td><td>0,92</td><td>~920 g</td></tr>
                  <tr><td>Agua</td><td>1,00</td><td>1.000 g</td></tr>
                  <tr><td>Leche</td><td>1,03</td><td>~1.030 g</td></tr>
                  <tr><td>Sirope</td><td>1,33</td><td>~1.330 g</td></tr>
                  <tr><td>Miel</td><td>1,42</td><td>~1.420 g</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">💡</span><strong>A tener en cuenta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>ml = g solo para el agua.</strong> El resto, depende de su densidad.</li>
                <li><strong>Los densos, mejor por peso.</strong> Miel y siropes se miden con más exactitud en gramos.</li>
                <li><strong>El aceite engaña.</strong> Un litro no es un kilo: pesa unos 920 gramos.</li>
                <li><strong>En repostería, precisión.</strong> Ahí es donde más se nota convertir bien.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('densidad-liquidos')} />
      <ShareCard appName="densidad-liquidos" />
      <Footer appName="densidad-liquidos" />
    </div>
  );
}
