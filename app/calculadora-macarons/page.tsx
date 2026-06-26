'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraMacarons.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularMacarons, almendraDesdeClaras } from '@/lib/calculadoras/macarons';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraMacaronsPage() {
  const [claras, setClaras] = useState('2');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularMacarons(almendraDesdeClaras(num(claras))), [claras]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de macarons</h1>
        <p className={styles.subtitle}>Almendra, azúcar glas, granulado y claras para tus macarons (método francés)</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <div className={styles.campo}>
            <label htmlFor="claras" className={styles.label}>Número de claras (≈ 33 g cada una)</label>
            <input id="claras" type="text" inputMode="decimal" className={styles.input}
              value={claras} onChange={(e) => setClaras(e.target.value)} />
          </div>

          {resultado ? (
            <>
              <div className={styles.ingredientesBox} role="status" aria-live="polite">
                <div className={styles.ingRow}><span className={styles.ingNombre}>Harina de almendra</span><span className={styles.ingCantidad}>{formatNumber(resultado.almendra_g, 0)} g</span></div>
                <div className={styles.ingRow}><span className={styles.ingNombre}>Azúcar glas</span><span className={styles.ingCantidad}>{formatNumber(resultado.glas_g, 0)} g</span></div>
                <div className={styles.ingRow}><span className={styles.ingNombre}>Claras de huevo</span><span className={styles.ingCantidad}>{formatNumber(resultado.claras_g, 0)} g</span></div>
                <div className={styles.ingRow}><span className={styles.ingNombre}>Azúcar granulado (merengue)</span><span className={styles.ingCantidad}>{formatNumber(resultado.granulado_g, 0)} g</span></div>
              </div>
              <p className={styles.fuenteNota}>Rinde unos {resultado.unidadesAprox} macarons (el doble de conchas). El azúcar glas y la almendra forman el «tant pour tant» a partes iguales.</p>
            </>
          ) : (
            <p className={styles.placeholder}>Introduce el número de claras.</p>
          )}
        </section>

        <EducationalSection title="Macarons sin misterio" subtitle="La proporción TPT, el macaronage y los fallos típicos">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Una base muy precisa</h2>
              <p>
                El macaron es exigente con las proporciones. Su base, el «tant pour tant», es igual
                peso de harina de almendra y azúcar glas, finamente tamizados. A eso se añade un
                merengue de claras y azúcar granulado que aporta el aire y la estructura. Con el
                método francés, el merengue se monta en crudo y se mezcla con el TPT en el paso
                clave, el macaronage. Respetar las cantidades es la mitad del éxito; la otra mitad
                está en la técnica y el horno.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>El proceso, paso a paso</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Paso</th><th scope="col">Clave</th></tr></thead>
                <tbody>
                  <tr><td>Tamizar TPT</td><td>Almendra y glas muy finos, sin grumos</td></tr>
                  <tr><td>Merengue</td><td>Claras a punto firme con el granulado</td></tr>
                  <tr><td>Macaronage</td><td>Mezcla en cinta que se reabsorbe en segundos</td></tr>
                  <tr><td>Secar</td><td>Piel mate al tacto antes de hornear</td></tr>
                  <tr><td>Hornear</td><td>Temperatura estable; aparece el «pie»</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Errores frecuentes</strong></div>
              <ul className={styles.warningList}>
                <li><strong>No secar las conchas.</strong> Sin la piel mate, se agrietan en el horno.</li>
                <li><strong>Macaronage mal medido.</strong> De menos, picos; de más, se desparraman.</li>
                <li><strong>Almendra húmeda o gruesa.</strong> Tamiza y, si hace falta, seca la almendra antes.</li>
                <li><strong>Horno irregular.</strong> Cada horno es un mundo; la primera hornada es de prueba.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-macarons')} />
      <ShareCard appName="calculadora-macarons" />
      <Footer appName="calculadora-macarons" />
    </div>
  );
}
