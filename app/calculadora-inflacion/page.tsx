'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraInflacion.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Datos IPC España (INE) - Base 2021 = 100
// Fuente: Instituto Nacional de Estadística (INE)
const IPC_DATA: Record<number, number> = {
  1961: 3.42, 1962: 3.62, 1963: 3.94, 1964: 4.22, 1965: 4.78,
  1966: 5.07, 1967: 5.40, 1968: 5.66, 1969: 5.78, 1970: 6.11,
  1971: 6.61, 1972: 7.16, 1973: 7.98, 1974: 9.24, 1975: 10.80,
  1976: 12.71, 1977: 15.83, 1978: 18.96, 1979: 21.93, 1980: 25.30,
  1981: 28.96, 1982: 33.13, 1983: 37.17, 1984: 41.36, 1985: 44.99,
  1986: 48.96, 1987: 51.53, 1988: 54.02, 1989: 57.69, 1990: 61.57,
  1991: 65.21, 1992: 69.06, 1993: 72.21, 1994: 75.61, 1995: 79.14,
  1996: 81.94, 1997: 83.56, 1998: 85.03, 1999: 87.00, 2000: 90.00,
  2001: 92.52, 2002: 95.77, 2003: 98.58, 2004: 101.55, 2005: 104.99,
  2006: 108.66, 2007: 111.71, 2008: 116.28, 2009: 116.05, 2010: 117.93,
  2011: 121.57, 2012: 124.52, 2013: 124.72, 2014: 124.50, 2015: 123.87,
  2016: 123.47, 2017: 125.94, 2018: 128.11, 2019: 129.02, 2020: 128.61,
  2021: 132.63, 2022: 143.55, 2023: 148.40, 2024: 152.50, 2025: 155.00,
};

const YEARS = Object.keys(IPC_DATA).map(Number).sort((a, b) => a - b);
const MIN_YEAR = YEARS[0];
const MAX_YEAR = YEARS[YEARS.length - 1];

export default function CalculadoraInflacionPage() {
  const [cantidad, setCantidad] = useState('1000');
  const [añoOrigen, setAñoOrigen] = useState(2000);
  const [añoDestino, setAñoDestino] = useState(2025);

  const resultado = useMemo(() => {
    const cantidadNum = parseSpanishNumber(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) return null;

    const ipcOrigen = IPC_DATA[añoOrigen];
    const ipcDestino = IPC_DATA[añoDestino];

    if (!ipcOrigen || !ipcDestino) return null;

    // Cálculo del valor equivalente
    const valorEquivalente = (cantidadNum * ipcDestino) / ipcOrigen;

    // Inflación acumulada
    const inflacionAcumulada = ((ipcDestino - ipcOrigen) / ipcOrigen) * 100;

    // Años transcurridos
    const años = Math.abs(añoDestino - añoOrigen);

    // Inflación media anual (si hay más de 0 años)
    const inflacionMediaAnual = años > 0
      ? (Math.pow(ipcDestino / ipcOrigen, 1 / años) - 1) * 100
      : 0;

    // Pérdida/ganancia de poder adquisitivo
    const diferencia = valorEquivalente - cantidadNum;

    return {
      valorEquivalente,
      inflacionAcumulada,
      inflacionMediaAnual,
      diferencia,
      años,
      ipcOrigen,
      ipcDestino,
    };
  }, [cantidad, añoOrigen, añoDestino]);

  const intercambiarAños = () => {
    setAñoOrigen(añoDestino);
    setAñoDestino(añoOrigen);
  };

  // Ejemplos históricos
  const ejemplosHistoricos = [
    { año: 1975, evento: 'Fin del franquismo', ipc: IPC_DATA[1975] },
    { año: 1986, evento: 'España entra en CEE', ipc: IPC_DATA[1986] },
    { año: 2002, evento: 'Llegada del Euro', ipc: IPC_DATA[2002] },
    { año: 2008, evento: 'Crisis financiera', ipc: IPC_DATA[2008] },
    { año: 2020, evento: 'Pandemia COVID-19', ipc: IPC_DATA[2020] },
    { año: 2022, evento: 'Crisis energética', ipc: IPC_DATA[2022] },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📈 Calculadora de Inflación</h1>
        <p className={styles.subtitle}>
          Descubre cómo la inflación afecta tu dinero con datos históricos del INE
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Configura el cálculo</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Cantidad en euros (€)</label>
            <input
              type="text"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className={styles.input}
              placeholder="1000"
            />
          </div>

          <div className={styles.yearSelectors}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Año origen</label>
              <select
                value={añoOrigen}
                onChange={(e) => setAñoOrigen(Number(e.target.value))}
                className={styles.select}
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={intercambiarAños}
              className={styles.swapButton}
              title="Intercambiar años"
            >
              ⇄
            </button>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Año destino</label>
              <select
                value={añoDestino}
                onChange={(e) => setAñoDestino(Number(e.target.value))}
                className={styles.select}
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Presets rápidos */}
          <div className={styles.presets}>
            <span className={styles.presetsLabel}>Comparar con:</span>
            <div className={styles.presetButtons}>
              <button onClick={() => { setAñoOrigen(2000); setAñoDestino(2025); }} className={styles.presetBtn}>
                2000 → Hoy
              </button>
              <button onClick={() => { setAñoOrigen(2010); setAñoDestino(2025); }} className={styles.presetBtn}>
                2010 → Hoy
              </button>
              <button onClick={() => { setAñoOrigen(2020); setAñoDestino(2025); }} className={styles.presetBtn}>
                2020 → Hoy
              </button>
              <button onClick={() => { setAñoOrigen(2002); setAñoDestino(2025); }} className={styles.presetBtn}>
                Euro → Hoy
              </button>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.mainResult}>
                <div className={styles.resultLabel}>
                  {formatCurrency(parseSpanishNumber(cantidad))} de {añoOrigen} equivalen a:
                </div>
                <div className={styles.resultValue}>
                  {formatCurrency(resultado.valorEquivalente)}
                </div>
                <div className={styles.resultSubtext}>en {añoDestino}</div>
              </div>

              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${resultado.inflacionAcumulada >= 0 ? styles.negative : styles.positive}`}>
                  <div className={styles.statIcon}>{resultado.inflacionAcumulada >= 0 ? '📉' : '📈'}</div>
                  <div className={styles.statValue}>
                    {resultado.inflacionAcumulada >= 0 ? '+' : ''}{formatNumber(resultado.inflacionAcumulada, 2)}%
                  </div>
                  <div className={styles.statLabel}>Inflación acumulada</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📊</div>
                  <div className={styles.statValue}>
                    {formatNumber(resultado.inflacionMediaAnual, 2)}%
                  </div>
                  <div className={styles.statLabel}>Media anual</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📅</div>
                  <div className={styles.statValue}>{resultado.años}</div>
                  <div className={styles.statLabel}>Años transcurridos</div>
                </div>

                <div className={`${styles.statCard} ${resultado.diferencia >= 0 ? styles.negative : styles.positive}`}>
                  <div className={styles.statIcon}>💸</div>
                  <div className={styles.statValue}>
                    {resultado.diferencia >= 0 ? '+' : ''}{formatCurrency(resultado.diferencia)}
                  </div>
                  <div className={styles.statLabel}>
                    {resultado.diferencia >= 0 ? 'Necesitas más' : 'Ahorras'}
                  </div>
                </div>
              </div>

              {/* Interpretación */}
              <div className={styles.interpretation}>
                <h3>💡 Interpretación</h3>
                {añoOrigen < añoDestino ? (
                  <p>
                    Si en <strong>{añoOrigen}</strong> tenías <strong>{formatCurrency(parseSpanishNumber(cantidad))}</strong>,
                    necesitarías <strong>{formatCurrency(resultado.valorEquivalente)}</strong> en <strong>{añoDestino}</strong> para
                    mantener el mismo poder adquisitivo. La inflación ha hecho que tu dinero pierda
                    un <strong>{formatNumber(resultado.inflacionAcumulada, 1)}%</strong> de su valor.
                  </p>
                ) : (
                  <p>
                    <strong>{formatCurrency(parseSpanishNumber(cantidad))}</strong> de <strong>{añoOrigen}</strong> tenían
                    el mismo poder adquisitivo que <strong>{formatCurrency(resultado.valorEquivalente)}</strong> en <strong>{añoDestino}</strong>.
                    El dinero valía {resultado.inflacionAcumulada < 0 ? 'más' : 'menos'} en aquel entonces.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>📈</div>
              <p>Introduce una cantidad válida para ver los resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Hitos históricos */}
      <div className={styles.historicalSection}>
        <h2 className={styles.sectionTitle}>📅 Hitos históricos del IPC en España</h2>
        <div className={styles.timelineGrid}>
          {ejemplosHistoricos.map((item) => (
            <button
              key={item.año}
              onClick={() => { setAñoOrigen(item.año); setAñoDestino(2025); }}
              className={styles.timelineCard}
            >
              <div className={styles.timelineYear}>{item.año}</div>
              <div className={styles.timelineEvent}>{item.evento}</div>
              <div className={styles.timelineIpc}>IPC: {formatNumber(item.ipc, 2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Los datos del IPC provienen del Instituto Nacional de Estadística (INE).
          Esta calculadora es orientativa y los resultados son aproximaciones basadas en el índice general.
          La inflación puede variar según el tipo de bienes y servicios considerados.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres entender mejor la inflación?"
        subtitle="Aprende cómo afecta a tu economía personal y estrategias para protegerte"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Qué es la inflación?</h2>
            <p>
              La inflación es el aumento generalizado y sostenido de los precios de bienes y servicios
              en un periodo de tiempo. Se mide principalmente a través del Índice de Precios al Consumo (IPC),
              que en España calcula el INE mensualmente.
            </p>
          </section>

          <section className={styles.eduSection}>
            <h2>¿Cómo afecta a tu dinero?</h2>
            <div className={styles.effectsList}>
              <div className={styles.effectCard}>
                <span className={styles.effectIcon}>💰</span>
                <div>
                  <h4>Pérdida de poder adquisitivo</h4>
                  <p>Con la misma cantidad de dinero puedes comprar menos cosas</p>
                </div>
              </div>
              <div className={styles.effectCard}>
                <span className={styles.effectIcon}>🏦</span>
                <div>
                  <h4>Ahorros que se devalúan</h4>
                  <p>El dinero parado en cuenta pierde valor real cada año</p>
                </div>
              </div>
              <div className={styles.effectCard}>
                <span className={styles.effectIcon}>📊</span>
                <div>
                  <h4>Tipos de interés</h4>
                  <p>El BCE sube tipos para controlar inflación, encareciendo hipotecas</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Estrategias para protegerse</h2>
            <ul className={styles.tipsList}>
              <li><strong>Inversión diversificada:</strong> Fondos indexados, acciones, inmobiliario</li>
              <li><strong>Bonos ligados a inflación:</strong> Letras del Tesoro indexadas al IPC</li>
              <li><strong>Activos reales:</strong> Oro, materias primas, inmuebles</li>
              <li><strong>Negociar salario:</strong> Revisiones anuales al menos iguales al IPC</li>
              <li><strong>Reducir deuda variable:</strong> Hipotecas a tipo fijo protegen de subidas</li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2>Inflación en España: Datos clave</h2>
            <div className={styles.dataGrid}>
              <div className={styles.dataCard}>
                <div className={styles.dataValue}>+{formatNumber(((IPC_DATA[2025] - IPC_DATA[2000]) / IPC_DATA[2000]) * 100, 1)}%</div>
                <div className={styles.dataLabel}>Desde el año 2000</div>
              </div>
              <div className={styles.dataCard}>
                <div className={styles.dataValue}>+{formatNumber(((IPC_DATA[2025] - IPC_DATA[2020]) / IPC_DATA[2020]) * 100, 1)}%</div>
                <div className={styles.dataLabel}>Desde 2020 (COVID)</div>
              </div>
              <div className={styles.dataCard}>
                <div className={styles.dataValue}>~2%</div>
                <div className={styles.dataLabel}>Objetivo del BCE</div>
              </div>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-inflacion')} />

      <Footer appName="calculadora-inflacion" />
    </div>
  );
}
