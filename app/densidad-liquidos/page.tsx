'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './DensidadLiquidos.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { LIQUIDOS, convertirDensidad, type DireccionDensidad } from '@/lib/calculadoras/densidadLiquidos';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { PREGUNTAS_FRECUENTES } from './metadata';

export default function DensidadLiquidosPage() {
  const [liquidoId, setLiquidoId] = useState('aceite');
  const [direccion, setDireccion] = useState<DireccionDensidad>('ml-a-g');
  const [cantidad, setCantidad] = useState('250');

  // parseSpanishNumber y no el parseFloat casero, que leía «1.000» como 1 y aceptaba «12abc» y
  // «1e3» (hallazgo 5011). NaN no pasa el «> 0» de convertirDensidad: sale «Introduce una cantidad».
  const resultado = useMemo(
    () => convertirDensidad(liquidoId, direccion, parseSpanishNumber(cantidad)),
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
                // Sin el emoji: un <option> no admite aria-hidden y el lector lo leía pegado al nombre (5016)
                <option key={l.id} value={l.id}>{l.nombre} ({formatNumber(l.densidad, 2)} g/ml)</option>
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

          {/* La región viva queda SIEMPRE montada y cambia solo su contenido: antes se desmontaba
              con una cantidad no válida y el aviso no se anunciaba (hallazgo 5015) */}
          <div className={resultado ? styles.resultadoBig : undefined} role="status" aria-live="polite">
            {resultado ? (
              <span key="resultado">
                <span className={styles.resBigValor}>{formatNumber(resultado.valor, resultado.valor % 1 === 0 ? 0 : 1)} {resultado.unidad}</span>
                <span className={styles.resBigTexto}>densidad {formatNumber(resultado.densidad, 2)} g/ml</span>
              </span>
            ) : (
              <span key="vacio" className={styles.placeholder}>Introduce una cantidad.</span>
            )}
          </div>
          <p className={styles.fuenteNota}>
            Densidades aproximadas a temperatura ambiente (unos 20 °C): varían un poco con la
            temperatura, la marca y la composición de cada producto.
          </p>
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
                pesan unos 142 gramos. En cocina general la diferencia suele dar igual, pero en
                repostería —donde las recetas precisas dan los líquidos en gramos— convertir según la
                densidad evita errores que se notan en el resultado.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Densidades de cocina (a unos 20 °C)</h2>
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
            {/* La FAQ visible y el FAQPage salen de la misma constante (§1.ter, hallazgo 5014): hasta
                el 18/11/2026 el FAQPage preguntaba cinco cosas que la página no mostraba */}
            <div className={styles.conceptoSection}>
              <h2>Preguntas frecuentes</h2>
              {PREGUNTAS_FRECUENTES.map((f) => (
                <div key={f.question} className={styles.faqItem}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps />
      <ShareCard appName="densidad-liquidos" />
      <Footer appName="densidad-liquidos" />
    </div>
  );
}
