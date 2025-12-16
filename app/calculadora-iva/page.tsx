'use client';

import { useState } from 'react';
import styles from './CalculadoraIva.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, RelatedApps} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type OperationType = 'add' | 'remove';

interface IvaResult {
  baseImponible: number;
  cuotaIva: number;
  total: number;
}

const IVA_RATES = [
  { value: 21, label: 'General (21%)', description: 'Tipo general' },
  { value: 10, label: 'Reducido (10%)', description: 'Alimentación, transporte, hostelería' },
  { value: 4, label: 'Superreducido (4%)', description: 'Pan, leche, libros, medicamentos' },
];

export default function CalculadoraIvaPage() {
  const [cantidad, setCantidad] = useState('');
  const [tipoIva, setTipoIva] = useState(21);
  const [operacion, setOperacion] = useState<OperationType>('add');
  const [resultado, setResultado] = useState<IvaResult | null>(null);

  const calcular = () => {
    const valor = parseSpanishNumber(cantidad);
    if (isNaN(valor) || valor <= 0) {
      setResultado(null);
      return;
    }

    let baseImponible: number;
    let cuotaIva: number;
    let total: number;

    if (operacion === 'add') {
      // Añadir IVA: el valor es la base imponible
      baseImponible = valor;
      cuotaIva = valor * (tipoIva / 100);
      total = baseImponible + cuotaIva;
    } else {
      // Quitar IVA: el valor es el total con IVA
      total = valor;
      baseImponible = valor / (1 + tipoIva / 100);
      cuotaIva = total - baseImponible;
    }

    setResultado({ baseImponible, cuotaIva, total });
  };

  const limpiar = () => {
    setCantidad('');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de IVA</h1>
        <p className={styles.subtitle}>
          Calcula el IVA español al 21%, 10% o 4%. Añade o quita IVA al instante.
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <div className={styles.operationToggle}>
            <button
              className={`${styles.toggleBtn} ${operacion === 'add' ? styles.active : ''}`}
              onClick={() => setOperacion('add')}
            >
              + Añadir IVA
            </button>
            <button
              className={`${styles.toggleBtn} ${operacion === 'remove' ? styles.active : ''}`}
              onClick={() => setOperacion('remove')}
            >
              − Quitar IVA
            </button>
          </div>

          <NumberInput
            value={cantidad}
            onChange={setCantidad}
            label={operacion === 'add' ? 'Base imponible (sin IVA)' : 'Precio con IVA incluido'}
            placeholder="100"
            helperText="Introduce el importe en euros"
            min={0}
          />

          <div className={styles.ivaSelector}>
            <label className={styles.label}>Tipo de IVA</label>
            <div className={styles.ivaOptions}>
              {IVA_RATES.map((rate) => (
                <button
                  key={rate.value}
                  className={`${styles.ivaBtn} ${tipoIva === rate.value ? styles.active : ''}`}
                  onClick={() => setTipoIva(rate.value)}
                >
                  <span className={styles.ivaPercent}>{rate.value}%</span>
                  <span className={styles.ivaDesc}>{rate.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular IVA
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <ResultCard
                title="Base imponible"
                value={formatCurrency(resultado.baseImponible)}
                variant="default"
                icon="📋"
                description="Importe sin IVA"
              />
              <ResultCard
                title={`Cuota IVA (${tipoIva}%)`}
                value={formatCurrency(resultado.cuotaIva)}
                variant="info"
                icon="📊"
                description="Impuesto a pagar"
              />
              <ResultCard
                title="Total con IVA"
                value={formatCurrency(resultado.total)}
                variant="highlight"
                icon="💶"
                description="Precio final"
              />
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🧮</span>
              <p>Introduce un importe y pulsa &quot;Calcular IVA&quot;</p>
            </div>
          )}
        </div>
      </div>

      <section className={styles.infoSection}>
        <h2>Tipos de IVA en España (2025)</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>21% - General</h3>
            <p>Electrónica, ropa, servicios profesionales, combustible, automóviles...</p>
          </div>
          <div className={styles.infoCard}>
            <h3>10% - Reducido</h3>
            <p>Alimentación (excepto básicos), transporte, hostelería, espectáculos, vivienda nueva...</p>
          </div>
          <div className={styles.infoCard}>
            <h3>4% - Superreducido</h3>
            <p>Pan, leche, huevos, frutas, verduras, libros, medicamentos, prótesis...</p>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('calculadora-iva')} />

      <Footer appName="calculadora-iva" />
    </div>
  );
}
