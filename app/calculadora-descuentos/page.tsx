'use client';

import { useState } from 'react';
import styles from './CalculadoraDescuentos.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface DiscountResult {
  precioOriginal: number;
  descuentoTotal: number;
  ahorro: number;
  precioFinal: number;
}

const QUICK_DISCOUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 70];

export default function CalculadoraDescuentosPage() {
  const [precio, setPrecio] = useState('');
  const [descuento1, setDescuento1] = useState('');
  const [descuento2, setDescuento2] = useState('');
  const [resultado, setResultado] = useState<DiscountResult | null>(null);

  const calcular = () => {
    const precioOriginal = parseSpanishNumber(precio);
    const desc1 = parseSpanishNumber(descuento1) || 0;
    const desc2 = parseSpanishNumber(descuento2) || 0;

    if (isNaN(precioOriginal) || precioOriginal <= 0) {
      setResultado(null);
      return;
    }

    // Calcular descuentos encadenados (no sumados)
    let precioFinal = precioOriginal;

    if (desc1 > 0 && desc1 <= 100) {
      precioFinal = precioFinal * (1 - desc1 / 100);
    }

    if (desc2 > 0 && desc2 <= 100) {
      precioFinal = precioFinal * (1 - desc2 / 100);
    }

    const ahorro = precioOriginal - precioFinal;
    const descuentoTotal = (ahorro / precioOriginal) * 100;

    setResultado({
      precioOriginal,
      descuentoTotal,
      ahorro,
      precioFinal,
    });
  };

  const setQuickDiscount = (value: number) => {
    setDescuento1(value.toString());
  };

  const limpiar = () => {
    setPrecio('');
    setDescuento1('');
    setDescuento2('');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Descuentos</h1>
        <p className={styles.subtitle}>
          Calcula el precio final con descuento y cuánto ahorras. Soporta descuentos encadenados.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <NumberInput
            value={precio}
            onChange={setPrecio}
            label="Precio original"
            placeholder="99,99"
            helperText="Precio antes del descuento"
            min={0}
          />

          <div className={styles.discountSection}>
            <NumberInput
              value={descuento1}
              onChange={setDescuento1}
              label="Descuento principal (%)"
              placeholder="20"
              helperText="Porcentaje de descuento"
              min={0}
            />

            <div className={styles.quickDiscounts}>
              <span className={styles.quickLabel}>Rápido:</span>
              {QUICK_DISCOUNTS.map((d) => (
                <button
                  key={d}
                  className={`${styles.quickBtn} ${descuento1 === d.toString() ? styles.active : ''}`}
                  onClick={() => setQuickDiscount(d)}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>

          <div className={styles.extraDiscount}>
            <NumberInput
              value={descuento2}
              onChange={setDescuento2}
              label="Descuento adicional (%) - Opcional"
              placeholder="0"
              helperText="Para cupones o descuentos extra"
              min={0}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular Descuento
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.priceComparison}>
                <div className={styles.originalPrice}>
                  <span className={styles.priceLabel}>Precio original</span>
                  <span className={styles.priceValue}>{formatCurrency(resultado.precioOriginal)}</span>
                </div>
                <div className={styles.arrow}>→</div>
                <div className={styles.finalPrice}>
                  <span className={styles.priceLabel}>Precio final</span>
                  <span className={styles.priceValue}>{formatCurrency(resultado.precioFinal)}</span>
                </div>
              </div>

              <ResultCard
                title="Te ahorras"
                value={formatCurrency(resultado.ahorro)}
                variant="success"
                icon="💰"
                description={`${formatNumber(resultado.descuentoTotal, 1)}% de descuento total`}
              />

              {parseSpanishNumber(descuento2) > 0 && (
                <div className={styles.chainedNote}>
                  <span className={styles.noteIcon}>ℹ️</span>
                  <p>
                    Los descuentos se aplican de forma encadenada: primero el {descuento1}%
                    y sobre el resultado el {descuento2}% adicional.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🏷️</span>
              <p>Introduce el precio y el descuento para calcular</p>
            </div>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-descuentos"
        collapsible={false}
      />


      <section className={styles.tipsSection}>
        <h2>Consejos para aprovechar descuentos</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔗</span>
            <h3>Descuentos encadenados</h3>
            <p>Un 20% + 10% adicional NO es un 30%. El segundo descuento se aplica sobre el precio ya rebajado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📅</span>
            <h3>Mejores épocas</h3>
            <p>Black Friday, Rebajas de enero/julio y Cyber Monday suelen tener los mejores descuentos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧮</span>
            <h3>Compara siempre</h3>
            <p>Antes de comprar, verifica que el precio &quot;original&quot; no esté inflado artificialmente.</p>
          </div>
        </div>
      </section>

      <EducationalSection
        title="Guía de compras inteligentes con descuentos"
        subtitle="Entiende cómo funcionan los descuentos reales, detecta precios inflados y aprovecha mejor las rebajas y promociones"
      >
        <h3 className={styles.eduTitle}>📊 Tipos de descuento y cómo funcionan</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Ejemplo práctico</th>
                <th>Cuándo se usa</th>
                <th>Truco a conocer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>% Simple</td>
                <td>20% de 100 € = 80 €</td>
                <td>Rebajas, tiendas online</td>
                <td>El más honesto y directo</td>
              </tr>
              <tr>
                <td>Encadenado</td>
                <td>20% + 10% = 28% real (no 30%)</td>
                <td>Cupones sobre rebajas</td>
                <td>¡La suma no es correcta!</td>
              </tr>
              <tr>
                <td>2x1 o 3x2</td>
                <td>Compras 2, pagas 1 = 50%</td>
                <td>Supermercados, perfumerías</td>
                <td>Solo si necesitas 2 unidades</td>
              </tr>
              <tr>
                <td>Precio fijo</td>
                <td>-15 € en compras de más de 50 €</td>
                <td>Cupones de descuento</td>
                <td>Mejor rentable en ticket bajo</td>
              </tr>
              <tr>
                <td>Relámpago/Flash</td>
                <td>70% en 24 horas</td>
                <td>Black Friday, Prime Day</td>
                <td>Urgencia artificial: no precipites</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className={styles.eduTitle}>🛍️ Situaciones habituales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🗓️</span>
              <h4>Rebajas de temporada</h4>
            </div>
            <p className={styles.escenarioDesc}>Enero y julio. Ideal para ropa, electrónica y hogar. Verifica que el precio base no subió antes de las rebajas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🖤</span>
              <h4>Black Friday</h4>
            </div>
            <p className={styles.escenarioDesc}>Los mejores descuentos reales suelen ser del 20-40%, no del 70%. Compara precios desde semanas antes.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏷️</span>
              <h4>Cupones de descuento</h4>
            </div>
            <p className={styles.escenarioDesc}>Aplican sobre el precio ya rebajado (encadenados). Usa esta calculadora para saber el ahorro real exacto.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏪</span>
              <h4>Liquidación / Outlet</h4>
            </div>
            <p className={styles.escenarioDesc}>Descuentos del 50-80% en excedentes de temporada. Sin devoluciones habitualmente. Revisa el estado del producto.</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>❓ Preguntas frecuentes sobre descuentos</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Un 20% + 10% equivale a un 30% de descuento?</strong>
            <p>No. Los descuentos encadenados no suman: aplicar primero 20% y luego 10% al precio resultante equivale solo al 28% total. Esta calculadora lo calcula correctamente.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿El descuento incluye IVA?</strong>
            <p>Depende del establecimiento. En España, los precios al público ya incluyen IVA por ley, por lo que el descuento se aplica sobre el precio con IVA incluido.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo detectar si el precio original está inflado?</strong>
            <p>Busca el historial de precios con extensiones como Keepa (Amazon) o CamelCamelCamel. Muchos comercios suben el precio días antes de las rebajas.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es el precio psicológico?</strong>
            <p>Técnica de fijación de precios como 9,99 € en lugar de 10 €. Hace que el precio parezca mucho menor aunque la diferencia sea mínima.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puedo acumular mi descuento de socio con una oferta?</strong>
            <p>Depende de la política de cada tienda. Lo más habitual es que no se acumulen. Léete los términos de cada promoción antes de comprar.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Son reales los descuentos del 70% o 80%?</strong>
            <p>A veces sí (liquidaciones reales), pero muchas veces el precio de referencia está inflado. Contrasta siempre con el precio habitual en otras tiendas.</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>📋 Cómo usar esta calculadora paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Introduce el precio original</strong>
              <p>El precio antes del descuento, con IVA incluido. Usa siempre el precio real habitual, no el precio inflado de la etiqueta de oferta.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Añade el descuento principal</strong>
              <p>El porcentaje más grande o usa los botones rápidos (5%, 10%, 20%...) para los descuentos más comunes.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Añade descuento adicional si tienes cupón</strong>
              <p>Opcional. Si tienes un cupón extra, añádelo aquí. Se calcula de forma encadenada sobre el precio ya rebajado.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Consulta el precio final y el ahorro real</strong>
              <p>Verás el precio final y exactamente cuánto ahorras en euros, incluyendo el porcentaje total real de descuento.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Compara antes de comprar</strong>
              <p>Usa el precio final para comparar en otras tiendas. A veces sin descuento es más barato en otro sitio.</p>
            </div>
          </div>
        </div>

        <h3 className={styles.eduTitle}>💡 Consejos para comprar con cabeza</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔗</span>
            <p>Los descuentos encadenados no se suman; se multiplican. Calcula siempre el % real total.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📉</span>
            <p>Comprueba el precio histórico antes de comprar. Las rebajas a veces ocultan subidas previas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧮</span>
            <p>Calcula el coste por uso. ¿Merece la pena aunque esté rebajado si no lo necesitas?</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔍</span>
            <p>Busca el mismo producto en Google Shopping antes de confirmar la compra.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🚚</span>
            <p>No olvides los gastos de envío. Pueden superar el ahorro del descuento.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📅</span>
            <p>Black Friday se convierte en &quot;Black November&quot;. Las ofertas suelen durar semanas.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes al calcular descuentos</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Sumar porcentajes de descuentos encadenados en lugar de aplicarlos uno a uno.</li>
            <li>No verificar que el precio &quot;original&quot; sea el precio real habitual y no uno inflado artificialmente.</li>
            <li>Comprar algo innecesario solo por el porcentaje de descuento (&quot;si no lo compro, pierdo dinero&quot;).</li>
            <li>Ignorar los gastos de envío, devolución o instalación que pueden anular el ahorro.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-descuentos')} />

      <ShareCard appName="calculadora-descuentos" />
      <Footer appName="calculadora-descuentos" />
    </div>
  );
}
