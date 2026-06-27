'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraEncurtidos.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { ESTILOS_ENCURTIDO, calcularEncurtido } from '@/lib/calculadoras/encurtidos';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraEncurtidosPage() {
  const [estiloId, setEstiloId] = useState('agridulce');
  const [total, setTotal] = useState('500');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularEncurtido(estiloId, num(total)), [estiloId, total]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de encurtidos</h1>
        <p className={styles.subtitle}>El vinagre, el agua, la sal y el azúcar para tu líquido de encurtido</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Estilo</p>
          <div className={styles.tipoBtns} role="group" aria-label="Estilo de encurtido">
            {ESTILOS_ENCURTIDO.map((e) => (
              <button key={e.id} type="button" aria-pressed={estiloId === e.id}
                className={`${styles.tipoBtn} ${estiloId === e.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setEstiloId(e.id)}>
                <span className={styles.tipoBtnNombre}>{e.nombre}</span>
                <span className={styles.tipoBtnNota}>{e.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="total" className={styles.label}>Líquido total a preparar (ml)</label>
            <input id="total" type="text" inputMode="numeric" className={styles.input}
              value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.resultadoGrid} role="status" aria-live="polite">
              <div className={`${styles.resCard} ${styles.resCardDestacado}`}><span className={styles.resValor}>{formatNumber(resultado.vinagre_ml, 0)} ml</span><span className={styles.resLabel}>vinagre (≥ 5% acidez)</span></div>
              <div className={`${styles.resCard} ${styles.resCardDestacado}`}><span className={styles.resValor}>{formatNumber(resultado.agua_ml, 0)} ml</span><span className={styles.resLabel}>agua</span></div>
              <div className={styles.resCard}><span className={styles.resValor}>{formatNumber(resultado.sal_g, 0)} g</span><span className={styles.resLabel}>sal</span></div>
              <div className={styles.resCard}><span className={styles.resValor}>{formatNumber(resultado.azucar_g, 0)} g</span><span className={styles.resLabel}>azúcar</span></div>
            </div>
          ) : (
            <p className={styles.placeholder}>Introduce el líquido total a preparar.</p>
          )}
          <p className={styles.fuenteNota}>Calienta el líquido hasta disolver la sal y el azúcar, viértelo sobre la verdura en un tarro limpio y guárdalo en la nevera. Es un encurtido rápido, no una conserva esterilizada de larga duración.</p>
        </section>

        <EducationalSection title="Encurtir en casa" subtitle="El equilibrio del líquido y los tiempos">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Vinagre que conserva y da sabor</h2>
              <p>
                Encurtir es sumergir la verdura en un líquido ácido que la conserva y la transforma.
                El vinagre, con su acidez, frena los microorganismos y aporta ese punto punzante; la
                sal y el azúcar equilibran y redondean el sabor. Jugando con la proporción de vinagre
                y agua decides cuán ácido queda, y con la sal y el azúcar, si tira más a salado o a
                dulce. Estos encurtidos rápidos se guardan en la nevera y están listos en horas, a
                diferencia de las conservas tradicionales, que requieren esterilizado.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Estilos de encurtido</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Estilo</th><th scope="col">Vinagre:agua</th><th scope="col">Carácter</th></tr></thead>
                <tbody>
                  <tr><td>Agridulce clásico</td><td>1:1</td><td>Equilibrado, de uso general</td></tr>
                  <tr><td>Ácido</td><td>2:1</td><td>Punzante, conserva más</td></tr>
                  <tr><td>Dulce</td><td>1:1 + más azúcar</td><td>Muy dulce, estilo americano</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para que salgan bien y duren</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Vinagre de al menos 5% de acidez.</strong> Es lo que garantiza la conservación en frío.</li>
                <li><strong>Verdura siempre cubierta.</strong> Lo que asoma del líquido se estropea antes.</li>
                <li><strong>Tarro limpio.</strong> Higiene básica para que no aparezcan mohos.</li>
                <li><strong>Guárdalo en la nevera.</strong> Es un encurtido rápido, no una conserva de despensa.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-encurtidos')} />
      <ShareCard appName="calculadora-encurtidos" />
      <Footer appName="calculadora-encurtidos" />
    </div>
  );
}
