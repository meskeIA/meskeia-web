'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraMerma.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularMerma, REFERENCIAS_MERMA } from '@/lib/calculadoras/merma';
import { formatNumber, formatCurrency } from '@/lib/formatters';

export default function CalculadoraMermaPage() {
  const [pesoBruto, setPesoBruto] = useState('1000');
  const [mermaLimpieza, setMermaLimpieza] = useState('20');
  const [mermaCoccion, setMermaCoccion] = useState('0');
  const [precio, setPrecio] = useState('');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;

  const resultado = useMemo(
    () =>
      calcularMerma(
        num(pesoBruto),
        num(mermaLimpieza),
        num(mermaCoccion),
        precio.trim() ? num(precio) : null,
      ),
    [pesoBruto, mermaLimpieza, mermaCoccion, precio],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de merma</h1>
        <p className={styles.subtitle}>
          Cuánto pierde un alimento al limpiarlo y cocinarlo, su rendimiento real y cuánto cuesta
          de verdad el producto útil
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Datos del alimento">
          <div className={styles.paramsGrid}>
            <div className={styles.campo}>
              <label htmlFor="pesoBruto" className={styles.label}>Peso bruto (g)</label>
              <input id="pesoBruto" type="text" inputMode="numeric" className={styles.input}
                value={pesoBruto} onChange={(e) => setPesoBruto(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="mermaLimpieza" className={styles.label}>Merma de limpieza (%)</label>
              <input id="mermaLimpieza" type="text" inputMode="decimal" className={styles.input}
                value={mermaLimpieza} onChange={(e) => setMermaLimpieza(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="mermaCoccion" className={styles.label}>Merma de cocción (%)</label>
              <input id="mermaCoccion" type="text" inputMode="decimal" className={styles.input}
                value={mermaCoccion} onChange={(e) => setMermaCoccion(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="precio" className={styles.label}>Precio de compra (€/kg, opcional)</label>
              <input id="precio" type="text" inputMode="decimal" className={styles.input}
                value={precio} placeholder="—" onChange={(e) => setPrecio(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Resultado */}
        {resultado ? (
          <section className={styles.resultadoGrid} aria-live="polite">
            <div className={styles.resCard}>
              <span className={styles.resValor}>{formatNumber(resultado.pesoNeto, 0)} g</span>
              <span className={styles.resLabel}>peso neto aprovechable</span>
            </div>
            <div className={`${styles.resCard} ${styles.resCardDestacado}`}>
              <span className={styles.resValor}>{formatNumber(resultado.rendimientoPct, 1)}%</span>
              <span className={styles.resLabel}>rendimiento ({formatNumber(resultado.mermaTotalPct, 1)}% de merma)</span>
            </div>
            <div className={styles.resCard}>
              <span className={styles.resValor}>×{formatNumber(resultado.factorCorreccion, 2)}</span>
              <span className={styles.resLabel}>factor de corrección (bruto / neto)</span>
            </div>
            {resultado.costeRealPorKg !== null && (
              <div className={styles.resCard}>
                <span className={styles.resValor}>{formatCurrency(resultado.costeRealPorKg)}</span>
                <span className={styles.resLabel}>coste real por kilo útil</span>
              </div>
            )}
          </section>
        ) : (
          <p className={styles.placeholder}>Introduce un peso bruto para calcular la merma.</p>
        )}

        {/* Referencias */}
        <section className={styles.refSection} aria-labelledby="ref-titulo">
          <h2 id="ref-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">📋</span> Mermas de limpieza orientativas
          </h2>
          <div className={styles.refGrid}>
            {REFERENCIAS_MERMA.map((r) => (
              <div key={r.alimento} className={styles.refCard}>
                <div className={styles.refHead}>
                  <span className={styles.refEmoji} aria-hidden="true">{r.emoji}</span>
                  <span className={styles.refRango}>{r.mermaLimpieza}</span>
                </div>
                <span className={styles.refAlimento}>{r.alimento}</span>
                <span className={styles.refNota}>{r.nota}</span>
              </div>
            ))}
          </div>
        </section>

        <p className={styles.fuenteNota}>
          Las mermas varían según el producto, la temporada y la técnica. Estos valores son
          orientativos: lo ideal es pesar antes y después en tu propia cocina para tener tus datos.
        </p>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Merma y rendimiento, explicados"
          subtitle="Por qué el precio de compra no es el coste real y cómo calcularlo"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Lo que compras no es lo que sirves</h2>
              <p>
                Casi ningún alimento se aprovecha al 100%. Al limpiarlo se pierde lo no comestible
                —piel, hueso, espina, grasa, hojas exteriores— y al cocinarlo se pierde agua y
                volumen. Ese desperdicio se llama merma, y lo que de verdad llega al plato es el
                peso neto. La diferencia importa porque el precio de compra se paga por el peso
                bruto, pero el coste real hay que repartirlo entre lo que se aprovecha. Un alimento
                que rinde poco cuesta, por kilo útil, mucho más de lo que pone la etiqueta.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>El factor de corrección</h2>
              <p>
                Es la herramienta que traduce la merma en dinero. Se calcula dividiendo el peso
                bruto entre el peso neto: un factor de 2 significa que por cada kilo aprovechable
                necesitas comprar dos. Multiplicando ese factor por el precio de compra obtienes el
                coste real por kilo útil, que es el dato que debes llevar al escandallo de tus
                platos. Sin ese ajuste, los precios de la carta se quedan cortos y el margen se
                evapora.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Cómo reducir la merma</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🔪</span>
                  <h4>Mejor técnica de corte</h4>
                  <p>Un buen despiece y afilado aprovecha más producto. Practica los cortes que más merma generan.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">♻️</span>
                  <h4>Aprovecha los recortes</h4>
                  <p>Espinas para fondos, recortes de verdura para caldos, huesos para salsas: lo que era merma puede dar valor.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🛒</span>
                  <h4>Compara formatos</h4>
                  <p>A veces el producto ya limpio compensa pese a costar más por kilo, si tu merma sería alta.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">📏</span>
                  <h4>Mide tu propia merma</h4>
                  <p>Pesa antes y después unas cuantas veces: tendrás datos reales de tu cocina, más fiables que cualquier tabla.</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>A tener en cuenta</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>La merma varía.</strong> El mismo producto rinde distinto según temporada, calibre y proveedor; revisa tus datos cada cierto tiempo.</li>
                <li><strong>No olvides la cocción.</strong> En carnes y pescados la pérdida al cocinar puede ser tan grande como la de limpieza.</li>
                <li><strong>El precio limpio engaña.</strong> Un filete ya limpio parece caro, pero puede salir más a cuenta que el entero si tu merma sería alta.</li>
                <li><strong>Lleva la merma al escandallo.</strong> Calcular el coste con el precio de compra sin corregir infravalora el coste real del plato.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-merma')} />
      <ShareCard appName="calculadora-merma" />
      <Footer appName="calculadora-merma" />
    </div>
  );
}
