'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraMermelada.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { NIVELES_MERMELADA, calcularMermelada } from '@/lib/calculadoras/mermelada';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { PREGUNTAS_FRECUENTES } from './metadata';

export default function CalculadoraMermeladaPage() {
  const [nivelId, setNivelId] = useState('equilibrada');
  const [fruta, setFruta] = useState('1000');

  // parseSpanishNumber (hallazgo 4645): el parseo casero leía «1.500» como 1,5 g y aceptaba
  // «12abc» y «1e3». Lo que no es un número da NaN y el motor no da cifras.
  const resultado = useMemo(() => calcularMermelada(nivelId, parseSpanishNumber(fruta)), [nivelId, fruta]);
  const avisoEntrada = fruta.trim() === ''
    ? 'Introduce el peso de la fruta.'
    : 'Escribe el peso de la fruta en gramos, mayor que cero (por ejemplo, 1.500).';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de mermelada</h1>
        <p className={styles.subtitle}>Azúcar y limón para tu mermelada según el peso de la fruta y el dulzor que quieras</p>
      </header>
      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Nivel de azúcar</p>
          <div className={styles.tipoBtns} role="group" aria-label="Nivel de azúcar">
            {NIVELES_MERMELADA.map((n) => (
              <button key={n.id} type="button" aria-pressed={nivelId === n.id}
                className={`${styles.tipoBtn} ${nivelId === n.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setNivelId(n.id)}>
                <span className={styles.tipoBtnNombre}>{n.nombre}</span>
                <span className={styles.tipoBtnNota}>{n.nota}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="fruta" className={styles.label}>Fruta ya limpia (g)</label>
            <input id="fruta" type="text" inputMode="numeric" className={styles.input}
              value={fruta} onChange={(e) => setFruta(e.target.value)} />
          </div>

          {/* La región viva queda montada siempre y cambia solo su contenido (hallazgo 4649: se
              desmontaba con una entrada no válida y renacía ya con las cifras). */}
          <div role="status" aria-live="polite">
            {resultado ? (
              <div key="cifras">
                <div className={styles.resultadoGrid}>
                  <div className={styles.resCard}><span className={styles.resValor}>{formatNumber(resultado.fruta_g, 0)} g</span><span className={styles.resLabel}>fruta</span></div>
                  <div className={`${styles.resCard} ${styles.resCardDestacado}`}><span className={styles.resValor}>{formatNumber(resultado.azucar_g, 0)} g</span><span className={styles.resLabel}>azúcar</span></div>
                  <div className={styles.resCard}><span className={styles.resValor}>{formatNumber(resultado.limon_ml, 0)} ml</span><span className={styles.resLabel}>zumo de limón</span></div>
                </div>
                {resultado.necesitaPectina && (
                  <p className={styles.notaBox}><span aria-hidden="true">💡</span> Con tan poca azúcar conviene añadir pectina (o usar fruta rica en ella, como manzana o cítricos) para que cuaje, y guardarla en la nevera.</p>
                )}
              </div>
            ) : (
              <p key="aviso" className={styles.placeholder}>{avisoEntrada}</p>
            )}
          </div>
        </section>

        <EducationalSection title="Mermelada casera" subtitle="El papel del azúcar, el limón y el punto de cuajado">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Azúcar, acidez y pectina</h2>
              <p>
                Una mermelada cuaja cuando se juntan tres cosas: azúcar, acidez y pectina. El azúcar
                no solo endulza, también conserva y ayuda a la textura; la acidez (el limón) y la
                pectina (natural de la fruta o añadida) son las que hacen que el conjunto gelifique al
                enfriar. Por eso, cuanto menos azúcar uses, más importante es compensar con pectina y
                acidez, y más corta será la conservación. Encontrar tu proporción favorita es cuestión
                de equilibrar dulzor, sabor de la fruta y textura.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Niveles de azúcar</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Nivel</th><th scope="col">Azúcar</th><th scope="col">Conservación</th></tr></thead>
                <tbody>
                  <tr><td>Tradicional</td><td>100&nbsp;% de la fruta</td><td>Larga; cuaja con facilidad si la fruta tiene pectina</td></tr>
                  <tr><td>Equilibrada</td><td>70&nbsp;%</td><td>Media; sabor a fruta</td></tr>
                  <tr><td>Ligera</td><td>50&nbsp;%</td><td>Corta; necesita pectina</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>Para que salga y se conserve</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Prueba del plato frío.</strong> Si la gota se arruga al empujarla, está en su punto (104-105 °C).</li>
                <li><strong>Esteriliza los tarros.</strong> Para guardarla fuera de la nevera; llénalos en caliente y crea el vacío.</li>
                <li><strong>Poca azúcar, a la nevera.</strong> Las mermeladas ligeras duran menos; refrigéralas o congélalas.</li>
                <li><strong>No la dejes sin remover.</strong> Espesa rápido al final y se pega con facilidad.</li>
              </ul>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Preguntas frecuentes</h2>
              {PREGUNTAS_FRECUENTES.map((p) => (
                <div key={p.pregunta}>
                  <h3>{p.pregunta}</h3>
                  <p>{p.respuesta}</p>
                </div>
              ))}
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps />
      <ShareCard appName="calculadora-mermelada" />
      <Footer appName="calculadora-mermelada" />
    </div>
  );
}
