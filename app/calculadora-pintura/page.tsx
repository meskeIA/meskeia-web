'use client';

import { useState } from 'react';
import styles from './CalculadoraPintura.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { formatNumber } from '@/lib';

type TipoSuperficie = 'lisa' | 'gotele' | 'rugosa' | 'porosa';

interface Resultado {
  metrosCuadrados: number;
  litrosNecesarios: number;
  botesPequenos: number;
  botesGrandes: number;
  costeEstimado: number;
}

const RENDIMIENTOS: Record<TipoSuperficie, number> = {
  lisa: 12,      // m²/litro - pared lisa
  gotele: 8,     // m²/litro - gotelé
  rugosa: 7,     // m²/litro - superficie rugosa
  porosa: 6,     // m²/litro - superficie porosa
};

const DESCRIPCIONES_SUPERFICIE: Record<TipoSuperficie, string> = {
  lisa: 'Pared lisa, yeso o pladur',
  gotele: 'Gotelé o textura media',
  rugosa: 'Ladrillo visto o estuco',
  porosa: 'Hormigón o superficie muy absorbente',
};

export default function CalculadoraPinturaPage() {
  const [modo, setModo] = useState<'metros' | 'habitacion'>('metros');
  const [metrosCuadrados, setMetrosCuadrados] = useState('');
  const [largo, setLargo] = useState('');
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('2.5');
  const [numCapas, setNumCapas] = useState('2');
  const [tipoSuperficie, setTipoSuperficie] = useState<TipoSuperficie>('lisa');
  const [precioPorLitro, setPrecioPorLitro] = useState('8');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcular = () => {
    let m2Total = 0;

    if (modo === 'metros') {
      m2Total = parseFloat(metrosCuadrados.replace(',', '.')) || 0;
    } else {
      const l = parseFloat(largo.replace(',', '.')) || 0;
      const a = parseFloat(ancho.replace(',', '.')) || 0;
      const h = parseFloat(alto.replace(',', '.')) || 0;
      // Perímetro x altura (paredes de una habitación)
      m2Total = 2 * (l + a) * h;
    }

    if (m2Total <= 0) return;

    const capas = parseInt(numCapas) || 2;
    const rendimiento = RENDIMIENTOS[tipoSuperficie];
    const precio = parseFloat(precioPorLitro.replace(',', '.')) || 0;

    // Litros necesarios = m² * capas / rendimiento
    const litros = (m2Total * capas) / rendimiento;

    // Redondear hacia arriba
    const litrosRedondeados = Math.ceil(litros * 10) / 10;

    // Calcular botes (4L y 15L son tamaños estándar)
    const botesPequenos = Math.ceil(litrosRedondeados / 4);
    const botesGrandes = Math.ceil(litrosRedondeados / 15);

    // Coste estimado
    const coste = litrosRedondeados * precio;

    setResultado({
      metrosCuadrados: m2Total,
      litrosNecesarios: litrosRedondeados,
      botesPequenos,
      botesGrandes,
      costeEstimado: coste,
    });
  };

  const limpiar = () => {
    setMetrosCuadrados('');
    setLargo('');
    setAncho('');
    setAlto('2.5');
    setNumCapas('2');
    setTipoSuperficie('lisa');
    setPrecioPorLitro('8');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Pintura</h1>
        <p className={styles.subtitle}>
          Calcula cuántos litros necesitas según superficie, capas y tipo de pared
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Selector de modo */}
          <div className={styles.modoSelector}>
            <button
              className={`${styles.modoBtn} ${modo === 'metros' ? styles.active : ''}`}
              onClick={() => setModo('metros')}
            >
              Por m² directos
            </button>
            <button
              className={`${styles.modoBtn} ${modo === 'habitacion' ? styles.active : ''}`}
              onClick={() => setModo('habitacion')}
            >
              Por habitación
            </button>
          </div>

          {modo === 'metros' ? (
            <div className={styles.inputGroup}>
              <label>Metros cuadrados a pintar</label>
              <input
                type="text"
                inputMode="decimal"
                value={metrosCuadrados}
                onChange={(e) => setMetrosCuadrados(e.target.value)}
                placeholder="Ej: 45"
                className={styles.input}
              />
            </div>
          ) : (
            <div className={styles.habitacionInputs}>
              <div className={styles.inputGroup}>
                <label>Largo (m)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={largo}
                  onChange={(e) => setLargo(e.target.value)}
                  placeholder="4"
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Ancho (m)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={ancho}
                  onChange={(e) => setAncho(e.target.value)}
                  placeholder="3"
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Alto (m)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={alto}
                  onChange={(e) => setAlto(e.target.value)}
                  placeholder="2.5"
                  className={styles.input}
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Número de capas</label>
            <select
              value={numCapas}
              onChange={(e) => setNumCapas(e.target.value)}
              className={styles.select}
            >
              <option value="1">1 capa</option>
              <option value="2">2 capas (recomendado)</option>
              <option value="3">3 capas</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Tipo de superficie</label>
            <select
              value={tipoSuperficie}
              onChange={(e) => setTipoSuperficie(e.target.value as TipoSuperficie)}
              className={styles.select}
            >
              {Object.entries(DESCRIPCIONES_SUPERFICIE).map(([key, desc]) => (
                <option key={key} value={key}>
                  {desc} (~{RENDIMIENTOS[key as TipoSuperficie]} m²/L)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Precio por litro (opcional)</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                inputMode="decimal"
                value={precioPorLitro}
                onChange={(e) => setPrecioPorLitro(e.target.value)}
                placeholder="8"
                className={styles.input}
              />
              <span className={styles.unidad}>€/L</span>
            </div>
          </div>

          <div className={styles.botones}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoIcon}>🎨</span>
                <div className={styles.resultadoValor}>
                  {formatNumber(resultado.litrosNecesarios, 1)} L
                </div>
                <div className={styles.resultadoLabel}>
                  de pintura necesarios
                </div>
              </div>

              <div className={styles.detalles}>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Superficie total</span>
                  <span className={styles.detalleValor}>
                    {formatNumber(resultado.metrosCuadrados, 1)} m²
                  </span>
                </div>

                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Botes de 4L</span>
                  <span className={styles.detalleValor}>
                    {resultado.botesPequenos} {resultado.botesPequenos === 1 ? 'bote' : 'botes'}
                  </span>
                </div>

                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Botes de 15L</span>
                  <span className={styles.detalleValor}>
                    {resultado.botesGrandes} {resultado.botesGrandes === 1 ? 'bote' : 'botes'}
                  </span>
                </div>

                {resultado.costeEstimado > 0 && (
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Coste estimado</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(resultado.costeEstimado, 2)} €
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.consejos}>
                <h4>💡 Consejos</h4>
                <ul>
                  <li>Compra un 10% extra para retoques y reserva</li>
                  <li>El rendimiento real varía según marca y técnica</li>
                  <li>Resta puertas y ventanas si no las vas a pintar</li>
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🖌️</span>
              <p>Introduce los datos para calcular la cantidad de pintura</p>
            </div>
          )}
        </div>
      </div>

      <Footer appName="calculadora-pintura" />
    </div>
  );
}
