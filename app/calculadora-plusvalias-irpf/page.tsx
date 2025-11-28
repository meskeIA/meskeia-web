'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraPlusvalias.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';

// Componente Input reutilizable - FUERA del componente principal para evitar re-renders
interface InputCampoProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: string;
  helperText?: string;
}

function InputCampo({ label, value, onChange, placeholder = '0,00', icon, helperText }: InputCampoProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>{icon}</span>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        inputMode="decimal"
      />
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

// Tramos del ahorro IRPF 2025
const TRAMOS_AHORRO = [
  { limite: 6000, tipo: 0.19, nombre: 'Hasta 6.000 €' },
  { limite: 50000, tipo: 0.21, nombre: '6.000 € - 50.000 €' },
  { limite: 200000, tipo: 0.23, nombre: '50.000 € - 200.000 €' },
  { limite: 300000, tipo: 0.26, nombre: '200.000 € - 300.000 €' },
  { limite: Infinity, tipo: 0.30, nombre: 'Más de 300.000 €' },
];

interface TramoResultado {
  nombre: string;
  tipo: number;
  baseGravable: number;
  impuesto: number;
}

export default function CalculadoraPlusvaliasIrpfPage() {
  // Estados para los inputs
  const [intereses, setIntereses] = useState('');
  const [dividendos, setDividendos] = useState('');
  const [ventaDerechos, setVentaDerechos] = useState('');
  const [plusvaliasFondos, setPlusvaliasFondos] = useState('');
  const [plusvaliasAcciones, setPlusvaliasAcciones] = useState('');
  const [plusvaliasCripto, setPlusvaliasCripto] = useState('');
  const [retenciones, setRetenciones] = useState('');

  // Calcular resultados
  const resultado = useMemo(() => {
    const valores = {
      intereses: parseSpanishNumber(intereses) || 0,
      dividendos: parseSpanishNumber(dividendos) || 0,
      ventaDerechos: parseSpanishNumber(ventaDerechos) || 0,
      plusvaliasFondos: parseSpanishNumber(plusvaliasFondos) || 0,
      plusvaliasAcciones: parseSpanishNumber(plusvaliasAcciones) || 0,
      plusvaliasCripto: parseSpanishNumber(plusvaliasCripto) || 0,
      retenciones: parseSpanishNumber(retenciones) || 0,
    };

    // Base imponible del ahorro (puede ser negativa si hay minusvalías)
    const baseImponible =
      valores.intereses +
      valores.dividendos +
      valores.ventaDerechos +
      valores.plusvaliasFondos +
      valores.plusvaliasAcciones +
      valores.plusvaliasCripto;

    // Calcular impuesto por tramos (solo si base > 0)
    const tramos: TramoResultado[] = [];
    let totalImpuesto = 0;

    if (baseImponible > 0) {
      let baseRestante = baseImponible;
      let limiteAnterior = 0;

      for (const tramo of TRAMOS_AHORRO) {
        const amplitudTramo = tramo.limite - limiteAnterior;
        const baseGravable = Math.min(baseRestante, amplitudTramo);
        const impuesto = baseGravable > 0 ? baseGravable * tramo.tipo : 0;

        tramos.push({
          nombre: tramo.nombre,
          tipo: tramo.tipo,
          baseGravable: baseGravable > 0 ? baseGravable : 0,
          impuesto,
        });

        totalImpuesto += impuesto;
        baseRestante -= baseGravable;
        limiteAnterior = tramo.limite;

        if (baseRestante <= 0) break;
      }

      // Añadir tramos vacíos restantes
      const tramosUsados = tramos.length;
      for (let i = tramosUsados; i < TRAMOS_AHORRO.length; i++) {
        tramos.push({
          nombre: TRAMOS_AHORRO[i].nombre,
          tipo: TRAMOS_AHORRO[i].tipo,
          baseGravable: 0,
          impuesto: 0,
        });
      }
    } else {
      // Base negativa o cero: mostrar todos los tramos vacíos
      for (const tramo of TRAMOS_AHORRO) {
        tramos.push({
          nombre: tramo.nombre,
          tipo: tramo.tipo,
          baseGravable: 0,
          impuesto: 0,
        });
      }
    }

    // Resultado neto (impuesto - retenciones)
    const resultadoNeto = totalImpuesto - valores.retenciones;

    return {
      baseImponible,
      tramos,
      totalImpuesto,
      retenciones: valores.retenciones,
      resultadoNeto,
      tipoEfectivo: baseImponible > 0 ? (totalImpuesto / baseImponible) * 100 : 0,
    };
  }, [intereses, dividendos, ventaDerechos, plusvaliasFondos, plusvaliasAcciones, plusvaliasCripto, retenciones]);

  // Limpiar todos los campos
  const limpiarCampos = () => {
    setIntereses('');
    setDividendos('');
    setVentaDerechos('');
    setPlusvaliasFondos('');
    setPlusvaliasAcciones('');
    setPlusvaliasCripto('');
    setRetenciones('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Calculadora Plusvalías IRPF 2025</h1>
        <p className={styles.subtitle}>
          Calcula el impuesto sobre tus inversiones: acciones, fondos, criptomonedas, dividendos e intereses
        </p>
      </header>

      {/* Aviso legal - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Cálculo estimativo basado en la normativa general del IRPF 2025 para rendimientos del capital mobiliario.
          Los resultados son orientativos. Consulta con un asesor fiscal para tu situación específica.
        </p>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>📋 Rendimientos del Capital</h2>

          {/* Rendimientos */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>Rendimientos</h3>
            <InputCampo
              label="Intereses"
              value={intereses}
              onChange={setIntereses}
              icon="💰"
              helperText="Depósitos, bonos, letras del tesoro"
            />
            <InputCampo
              label="Dividendos"
              value={dividendos}
              onChange={setDividendos}
              icon="📈"
              helperText="Acciones nacionales e internacionales"
            />
            <InputCampo
              label="Venta de Derechos"
              value={ventaDerechos}
              onChange={setVentaDerechos}
              icon="🎫"
              helperText="Derechos de suscripción"
            />
          </div>

          {/* Plusvalías/Minusvalías */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>Plusvalías / Minusvalías</h3>
            <p className={styles.seccionNota}>Introduce valores negativos para minusvalías</p>
            <InputCampo
              label="Fondos de Inversión"
              value={plusvaliasFondos}
              onChange={setPlusvaliasFondos}
              icon="🏦"
              helperText="Fondos, ETFs, SICAVs"
            />
            <InputCampo
              label="Acciones"
              value={plusvaliasAcciones}
              onChange={setPlusvaliasAcciones}
              icon="📊"
              helperText="Compra-venta de acciones"
            />
            <InputCampo
              label="Criptomonedas"
              value={plusvaliasCripto}
              onChange={setPlusvaliasCripto}
              icon="₿"
              helperText="Bitcoin, Ethereum, otros criptoactivos"
            />
          </div>

          {/* Retenciones */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>Retenciones Aplicadas</h3>
            <InputCampo
              label="Retenciones ya pagadas"
              value={retenciones}
              onChange={setRetenciones}
              icon="🏛️"
              helperText="Retenciones aplicadas por bancos/brokers"
            />
          </div>

          <button onClick={limpiarCampos} className={styles.btnSecondary}>
            🗑️ Limpiar campos
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>🎯 Resultado del Cálculo</h2>

          {/* Base imponible */}
          <div className={`${styles.resultadoDestacado} ${resultado.baseImponible < 0 ? styles.negativo : ''}`}>
            <span className={styles.resultadoLabel}>Base Imponible del Ahorro</span>
            <span className={styles.resultadoValor}>
              {formatCurrency(resultado.baseImponible)}
            </span>
            {resultado.baseImponible < 0 && (
              <span className={styles.resultadoNota}>
                Base negativa - No hay impuesto a pagar. Las pérdidas se pueden compensar en los 4 años siguientes.
              </span>
            )}
          </div>

          {/* Tabla de tramos */}
          <div className={styles.tablaContainer}>
            <table className={styles.tablaTramos}>
              <thead>
                <tr>
                  <th>Tramo</th>
                  <th>Tipo</th>
                  <th>Base Gravable</th>
                  <th>Impuesto</th>
                </tr>
              </thead>
              <tbody>
                {resultado.tramos.map((tramo, idx) => (
                  <tr key={idx} className={tramo.baseGravable === 0 ? styles.tramoVacio : ''}>
                    <td>{tramo.nombre}</td>
                    <td>{(tramo.tipo * 100).toFixed(0)}%</td>
                    <td className={styles.alignRight}>{formatCurrency(tramo.baseGravable)}</td>
                    <td className={styles.alignRight}>{formatCurrency(tramo.impuesto)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.filaTotal}>
                  <td colSpan={3}><strong>Total Impuesto Bruto</strong></td>
                  <td className={styles.alignRight}><strong>{formatCurrency(resultado.totalImpuesto)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cálculo neto */}
          <div className={styles.calculoNeto}>
            <div className={styles.lineaCalculo}>
              <span>Impuesto bruto:</span>
              <span>{formatCurrency(resultado.totalImpuesto)}</span>
            </div>
            <div className={styles.lineaCalculo}>
              <span>Retenciones aplicadas:</span>
              <span className={styles.retencion}>- {formatCurrency(resultado.retenciones)}</span>
            </div>
            <div className={styles.lineaSeparador}></div>
            <div className={`${styles.lineaResultado} ${resultado.resultadoNeto < 0 ? styles.devolver : styles.pagar}`}>
              <span>{resultado.resultadoNeto >= 0 ? 'A PAGAR:' : 'A DEVOLVER:'}</span>
              <span className={styles.resultadoFinal}>
                {formatCurrency(Math.abs(resultado.resultadoNeto))}
              </span>
            </div>
          </div>

          {/* Tipo efectivo */}
          {resultado.baseImponible > 0 && (
            <div className={styles.tipoEfectivo}>
              <span>Tipo efectivo:</span>
              <strong>{formatNumber(resultado.tipoEfectivo, 2)}%</strong>
            </div>
          )}

          {/* Info adicional */}
          <div className={styles.infoAdicional}>
            <h4>💡 Información Importante</h4>
            <ul>
              <li>Los tramos son progresivos: cada tramo se aplica solo a la parte correspondiente</li>
              <li>Las minusvalías pueden compensar plusvalías del mismo ejercicio</li>
              <li>Las pérdidas no compensadas se pueden aplicar en los 4 años siguientes</li>
              <li>La retención estándar de bancos/brokers es del 19%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre el IRPF del Ahorro?"
        subtitle="Descubre cómo funcionan los tramos, estrategias de optimización fiscal y casos prácticos"
      >
        <section className={styles.guideSection}>
          <h2>Guía Completa del IRPF para Inversores</h2>
          <p className={styles.introParagraph}>
            Los rendimientos del capital mobiliario y las ganancias patrimoniales tributan en la base del ahorro
            del IRPF con tipos progresivos del 19% al 30%. Entender cómo funciona este sistema te permite
            optimizar tu fiscalidad legalmente.
          </p>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>📊 Tramos del Ahorro 2025</h4>
              <ul>
                <li><strong>19%</strong>: Primeros 6.000 €</li>
                <li><strong>21%</strong>: De 6.000 € a 50.000 €</li>
                <li><strong>23%</strong>: De 50.000 € a 200.000 €</li>
                <li><strong>26%</strong>: De 200.000 € a 300.000 €</li>
                <li><strong>30%</strong>: Más de 300.000 €</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>💰 ¿Qué se incluye?</h4>
              <ul>
                <li><strong>Rendimientos</strong>: Intereses, dividendos, venta de derechos</li>
                <li><strong>Plusvalías</strong>: Acciones, fondos, ETFs, criptomonedas</li>
                <li><strong>Otros</strong>: Bonos, letras del tesoro, SICAVs</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>📉 Compensación de Pérdidas</h4>
              <ul>
                <li>Las minusvalías compensan plusvalías del mismo año</li>
                <li>El exceso se puede aplicar en los 4 años siguientes</li>
                <li>Rendimientos y ganancias se compensan por separado (con límites)</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>💡 Estrategias de Optimización</h4>
              <ul>
                <li><strong>Timing</strong>: Distribuir realizaciones entre ejercicios</li>
                <li><strong>Traspasos</strong>: Entre fondos sin tributar</li>
                <li><strong>Compensación</strong>: Materializar pérdidas antes de fin de año</li>
              </ul>
            </div>
          </div>

          <h3>Ejemplos Prácticos</h3>
          <div className={styles.ejemplosGrid}>
            <div className={styles.ejemploCard}>
              <h4>Ejemplo 1: Inversor Moderado</h4>
              <p>
                <strong>Ingresos:</strong> 3.000 € dividendos + 2.000 € intereses = 5.000 €<br />
                <strong>Impuesto:</strong> 5.000 € × 19% = 950 €<br />
                <strong>Retención aplicada:</strong> 950 € (19%)<br />
                <strong>Resultado:</strong> 0 € (ya pagado vía retención)
              </p>
            </div>

            <div className={styles.ejemploCard}>
              <h4>Ejemplo 2: Plusvalías Altas</h4>
              <p>
                <strong>Plusvalía acciones:</strong> 60.000 €<br />
                <strong>Impuesto:</strong><br />
                - 6.000 € × 19% = 1.140 €<br />
                - 44.000 € × 21% = 9.240 €<br />
                - 10.000 € × 23% = 2.300 €<br />
                <strong>Total:</strong> 12.680 € (tipo efectivo: 21,13%)
              </p>
            </div>

            <div className={styles.ejemploCard}>
              <h4>Ejemplo 3: Con Minusvalías</h4>
              <p>
                <strong>Plusvalía fondos:</strong> 8.000 €<br />
                <strong>Minusvalía cripto:</strong> -3.000 €<br />
                <strong>Base neta:</strong> 5.000 €<br />
                <strong>Impuesto:</strong> 5.000 € × 19% = 950 €
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Cuándo debo declarar mis inversiones?</summary>
              <p>
                Debes incluir los rendimientos del capital mobiliario en tu declaración anual si superas
                1.600 € anuales o tienes obligación de declarar por otros conceptos. Los bancos retienen
                a cuenta, pero la liquidación final se hace en la declaración.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Las criptomonedas tributan igual que las acciones?</summary>
              <p>
                Sí, las plusvalías por venta de criptomonedas se consideran ganancias patrimoniales
                y tributan con los mismos tramos (19%-30%). Cada intercambio entre criptos también
                es un hecho imponible.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué pasa si tengo más pérdidas que ganancias?</summary>
              <p>
                Las pérdidas netas no generan devolución directa, pero se pueden compensar con
                ganancias de los 4 ejercicios siguientes. Es importante declararlas para no perder
                este derecho.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Los traspasos entre fondos tributan?</summary>
              <p>
                No, los traspasos entre fondos de inversión tienen diferimiento fiscal. Solo tributas
                cuando haces un reembolso definitivo. Esto permite rebalancear tu cartera sin
                consecuencias fiscales inmediatas.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-plusvalias-irpf" />
    </div>
  );
}
