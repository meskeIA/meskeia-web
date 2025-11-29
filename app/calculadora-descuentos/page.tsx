'use client';

import { useState } from 'react';
import styles from './CalculadoraDescuentos.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

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

      <Footer appName="calculadora-descuentos" />
    </div>
  );
}
