'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorAlquilerHabitaciones.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
  NumberInput,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { jsonLd } from './metadata';

// ──────────────────────────────────────────
// DATOS: MUNICIPIOS ZONA TENSIONADA
// ──────────────────────────────────────────

interface ZonaTensionada {
  ccaa: string;
  municipios: string;
  cantidad: number;
  desde: string;
}

const ZONAS_TENSIONADAS: ZonaTensionada[] = [
  { ccaa: 'Cataluña', municipios: 'Barcelona, Girona, Lleida, Tarragona, Reus, Sitges, Lloret de Mar y 264 más', cantidad: 271, desde: '2024' },
  { ccaa: 'Navarra', municipios: 'Pamplona, Tudela, Burlada, Estella-Lizarra, Ansoáin y 16 más', cantidad: 21, desde: '2025' },
  { ccaa: 'País Vasco', municipios: 'Bilbao, Vitoria-Gasteiz, Donostia-San Sebastián, Barakaldo, Irún, Galdakao y más', cantidad: 14, desde: '2025-2026' },
  { ccaa: 'Galicia', municipios: 'A Coruña', cantidad: 1, desde: '2025' },
];

const TOTAL_MUNICIPIOS = ZONAS_TENSIONADAS.reduce((sum, z) => sum + z.cantidad, 0);

// ──────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────

export default function OrientadorAlquilerHabitacionesPage() {
  const [rentaPisoStr, setRentaPisoStr] = useState('');
  const [numHabitaciones, setNumHabitaciones] = useState('3');
  const [esZonaTensionada, setEsZonaTensionada] = useState(true);
  const [calculado, setCalculado] = useState(false);

  const resultado = useMemo(() => {
    const rentaPiso = parseSpanishNumber(rentaPisoStr);
    const habitaciones = parseInt(numHabitaciones) || 1;

    if (!rentaPiso || rentaPiso <= 0 || !calculado) return null;

    const techoTotal = rentaPiso;
    const mediaPorHabitacion = rentaPiso / habitaciones;
    // Máximo recomendado: la media + 20% para la habitación más grande
    const maxRecomendado = mediaPorHabitacion * 1.2;
    const minRecomendado = mediaPorHabitacion * 0.8;

    return {
      techoTotal,
      habitaciones,
      mediaPorHabitacion,
      maxRecomendado,
      minRecomendado,
      esZonaTensionada,
    };
  }, [rentaPisoStr, numHabitaciones, esZonaTensionada, calculado]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🏠</span> Orientador Alquiler por Habitaciones
          </h1>
          <p className={styles.subtitle}>
            Reglas del alquiler por habitaciones en zona tensionada — España 2026
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard variant="financial" severity="high" context="orientador-alquiler-habitaciones" />

        {/* Regla principal */}
        <div className={styles.tipBox}>
          <p>
            <strong>Regla fundamental (desde enero 2026):</strong> La suma de todas las rentas por
            habitaciones de una vivienda <strong>no puede superar</strong> el precio del alquiler del
            piso completo. En zona tensionada, ese precio está limitado por el contrato anterior o por
            el índice SERPAVI.
          </p>
        </div>

        {/* Orientador */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">🔍</span> Oriéntate sobre el techo de renta
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>¿Tu vivienda está en zona tensionada?</label>
            <select
              className={styles.select}
              value={esZonaTensionada ? 'si' : 'no'}
              onChange={e => { setEsZonaTensionada(e.target.value === 'si'); setCalculado(false); }}
            >
              <option value="si">Sí — Zona de mercado residencial tensionado</option>
              <option value="no">No — Zona no tensionada</option>
            </select>
          </div>

          <NumberInput
            value={rentaPisoStr}
            onChange={v => { setRentaPisoStr(v); setCalculado(false); }}
            label={esZonaTensionada
              ? 'Renta máxima del piso completo (contrato anterior o SERPAVI)'
              : 'Renta mensual del piso completo'
            }
            placeholder="900"
            helperText={esZonaTensionada
              ? 'En zona tensionada: el contrato anterior o el valor SERPAVI (el menor)'
              : 'Precio de mercado que se alquilaría el piso entero'
            }
            min={0}
          />

          <NumberInput
            value={numHabitaciones}
            onChange={v => { setNumHabitaciones(v); setCalculado(false); }}
            label="Número de habitaciones que se alquilan"
            placeholder="3"
            min={1}
            max={10}
          />

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setCalculado(true)}
            disabled={!rentaPisoStr || parseSpanishNumber(rentaPisoStr) <= 0}
          >
            Orientar
          </button>
        </div>

        {/* Resultado */}
        {resultado && (
          <>
            <div className={styles.resultsGrid}>
              <div className={`${styles.resultCard} ${resultado.esZonaTensionada ? styles.resultAlert : ''}`}>
                <h3>Techo total (todas las habitaciones)</h3>
                <p>{formatCurrency(resultado.techoTotal)}<small>/mes</small></p>
                <small>{resultado.esZonaTensionada ? 'Limitado por SERPAVI o contrato anterior' : 'Precio de mercado'}</small>
              </div>
              <div className={styles.resultCard}>
                <h3>Media por habitación</h3>
                <p>{formatCurrency(resultado.mediaPorHabitacion)}<small>/mes</small></p>
                <small>{resultado.habitaciones} habitaciones</small>
              </div>
            </div>

            <div className={styles.desglose}>
              <h3 className={styles.desgloseTitle}>
                <span aria-hidden="true">📋</span> Distribución orientativa
              </h3>
              <div className={styles.desgloseRow}>
                <span>Renta máxima del piso completo</span>
                <span className={styles.desgloseValue}>{formatCurrency(resultado.techoTotal)}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span>Habitaciones alquiladas</span>
                <span className={styles.desgloseValue}>{resultado.habitaciones}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span>Renta media por habitación</span>
                <span className={styles.desgloseValue}>{formatCurrency(resultado.mediaPorHabitacion)}</span>
              </div>
              <div className={styles.desgloseRow}>
                <span>Rango recomendado</span>
                <span className={styles.desgloseValue}>
                  {formatCurrency(resultado.minRecomendado)} — {formatCurrency(resultado.maxRecomendado)}
                </span>
              </div>
              <div className={styles.desgloseRow}>
                <span><strong>Suma máxima legal</strong></span>
                <span className={styles.desgloseValue} style={{ color: '#e74c3c' }}>
                  {formatCurrency(resultado.techoTotal)}
                </span>
              </div>
            </div>

            {resultado.esZonaTensionada && (
              <div className={styles.tipBox}>
                <p>
                  <strong>En zona tensionada:</strong> Si la vivienda estuvo alquilada en los últimos
                  5 años, la renta máxima es la del último contrato (actualizada con el índice legal,
                  máximo 2% hasta fin de 2027). Si no estuvo alquilada, se aplica el valor SERPAVI.
                  Consulta el valor de tu vivienda en{' '}
                  <a href="https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi"
                    target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                    el portal SERPAVI del MIVAU
                  </a>.
                </p>
              </div>
            )}
          </>
        )}

        {/* Municipios zona tensionada */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">📍</span> Municipios en zona tensionada ({TOTAL_MUNICIPIOS}+)
          </h2>
          <table className={styles.municipiosTable}>
            <thead>
              <tr>
                <th>Comunidad</th>
                <th>Municipios principales</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ZONAS_TENSIONADAS.map(z => (
                <tr key={z.ccaa}>
                  <td><strong>{z.ccaa}</strong></td>
                  <td>{z.municipios}</td>
                  <td>{z.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Madrid, Valencia, Andalucía, Murcia y Aragón no han declarado zonas tensionadas a fecha de abril 2026.
            Consulta el{' '}
            <a href="https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi/consultar-zonas-de-mercado-residencial-tensionado"
              target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
              mapa oficial del MIVAU
            </a>{' '}
            para el listado actualizado.
          </p>
        </div>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre el alquiler por habitaciones"
          subtitle="Normativa, derechos y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">📊</span> Tabla resumen de la regulación</h2>
            <table className={styles.municipiosTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Zona tensionada</th>
                  <th>Zona no tensionada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Suma habitaciones {'>'} alquiler piso</td>
                  <td><strong>Prohibido</strong></td>
                  <td><strong>Prohibido</strong></td>
                </tr>
                <tr>
                  <td>Precio máximo del piso</td>
                  <td>Contrato anterior o SERPAVI</td>
                  <td>Libre (mercado)</td>
                </tr>
                <tr>
                  <td>Actualización anual</td>
                  <td>Máximo 2% (hasta dic 2027)</td>
                  <td>Según índice legal</td>
                </tr>
                <tr>
                  <td>Grandes tenedores ({'>'} 10 inmuebles)</td>
                  <td>Obligatorio SERPAVI como techo</td>
                  <td>Sin restricción adicional</td>
                </tr>
                <tr>
                  <td>Registro del contrato</td>
                  <td>Obligatorio (Ventanilla Única)</td>
                  <td>Obligatorio (Ventanilla Única)</td>
                </tr>
                <tr>
                  <td>Sanción máxima estatal</td>
                  <td>150.000 €</td>
                  <td>60.000 €</td>
                </tr>
              </tbody>
            </table>

            <h2><span aria-hidden="true">🎯</span> 4 situaciones frecuentes</h2>

            <h3>1. Soy propietario y quiero alquilar habitaciones en Barcelona</h3>
            <p>Cataluña tiene la regulación más estricta (Ley 11/2025, SERPAVI). La suma de rentas de todas las habitaciones no puede superar el precio SERPAVI del piso completo. Si superas el techo en más del 30%, la multa puede llegar a 900.000 €.</p>

            <h3>2. Soy inquilino y creo que me cobran de más</h3>
            <p>Comprueba si tu municipio es zona tensionada. Si lo es, pide al propietario que acredite el contrato anterior o el valor SERPAVI. Si la suma de rentas de todas las habitaciones supera ese techo, puedes reclamar la devolución del exceso.</p>

            <h3>3. Mi piso no estuvo alquilado antes, ¿qué precio aplico?</h3>
            <p>En zona tensionada, si la vivienda no tuvo contrato en los últimos 5 años, se aplica el valor del índice SERPAVI. Consúltalo en el portal del Ministerio de Vivienda con la referencia catastral de tu inmueble.</p>

            <h3>4. Vivo en Madrid, ¿me afecta?</h3>
            <p>Madrid no ha declarado zonas tensionadas a fecha de abril de 2026. La regla del techo agregado (suma de habitaciones ≤ piso completo) sí aplica, pero sin límite de precio en valor absoluto. El propietario fija libremente la renta del piso.</p>

            <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>

            <h3>¿Qué normativa regula el alquiler por habitaciones?</h3>
            <p>La Ley 12/2023 de Vivienda (zonas tensionadas), la Proposición de Ley de regulación de alquileres temporales y de habitaciones (en vigor desde enero 2026), y el RDL 8/2026 (tope del 2% y prórroga extraordinaria).</p>

            <h3>¿Puedo cobrar más por una habitación grande?</h3>
            <p>Sí, puedes distribuir la renta total entre habitaciones como prefieras (por ejemplo, más por las exteriores o con baño propio). Lo que no puedes es que la suma supere el techo del piso completo.</p>

            <h3>¿El contrato por habitación es un contrato de vivienda?</h3>
            <p>Desde enero de 2026, sí. La nueva regulación equipara los contratos por habitaciones al régimen de la LAU (arrendamiento de vivienda habitual), con las mismas protecciones para el inquilino.</p>

            <h3>¿Debo registrar cada contrato de habitación?</h3>
            <p>Sí. Todos los contratos (incluidos los de habitaciones) deben registrarse en la Ventanilla Única Digital. Es requisito para poder deducirlos en IRPF.</p>

            <h3>¿Qué pasa con los contratos de temporada?</h3>
            <p>Desde enero de 2026, cualquier contrato se presume de residencia habitual salvo que el propietario documente la causa de temporalidad (estudios, trabajo temporal, tratamiento médico). Esto cierra el abuso de los contratos «de temporada» para eludir los topes.</p>

            <h3>¿Hay incentivos fiscales por alquilar barato?</h3>
            <p>Sí. Los propietarios en zona tensionada que bajen la renta al menos un 5% respecto al contrato anterior pueden acceder a una deducción de hasta el 90% en IRPF sobre los rendimientos del alquiler.</p>

            <h3>¿Qué es el SERPAVI?</h3>
            <p>El Sistema Estatal de Referencia de Precios del Alquiler de Vivienda. Publica el precio de referencia por vivienda (por referencia catastral) en zonas tensionadas. Consulta gratuita en la web del Ministerio de Vivienda (MIVAU).</p>

            <h3>¿Y si no sé si mi zona es tensionada?</h3>
            <p>Consulta el mapa oficial en el portal del MIVAU. Si tu municipio no aparece, no es zona tensionada y los topes de precio no aplican (pero sí la regla del techo agregado por habitaciones).</p>

            <h2><span aria-hidden="true">📝</span> Pasos para alquilar habitaciones legalmente</h2>
            <ol>
              <li><strong>Comprueba si tu municipio es zona tensionada</strong> en el portal SERPAVI del MIVAU.</li>
              <li><strong>Determina el techo de renta</strong>: contrato anterior o valor SERPAVI (en zona tensionada) o precio de mercado (fuera).</li>
              <li><strong>Distribuye la renta</strong> entre las habitaciones. La suma no puede superar el techo.</li>
              <li><strong>Redacta contratos individuales</strong> por cada habitación, especificando zonas comunes compartidas.</li>
              <li><strong>Registra cada contrato</strong> en la Ventanilla Única Digital.</li>
              <li><strong>Incluye el certificado energético</strong> de la vivienda (obligatorio, RD 390/2021).</li>
            </ol>

            <h2><span aria-hidden="true">💡</span> Consejos prácticos</h2>
            <ul>
              <li>Si bajas la renta un 5% en zona tensionada, puedes acceder a la deducción del 90% en IRPF.</li>
              <li>Guarda el contrato anterior o el certificado SERPAVI como justificante del precio fijado.</li>
              <li>Redacta normas de convivencia como anexo al contrato para evitar conflictos.</li>
              <li>Indica en cada contrato el uso de zonas comunes (cocina, baño, salón) y el porcentaje de gastos compartidos.</li>
              <li>El inquilino tiene los mismos derechos que en un alquiler de vivienda completa (duración mínima, prórroga, etc.).</li>
              <li>Mantén al día el registro en la Ventanilla Única para evitar sanciones.</li>
            </ul>

            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Errores frecuentes</h3>
              <ul>
                <li>Creer que por alquilar habitaciones se evitan los topes de zona tensionada</li>
                <li>No registrar los contratos de habitación en la Ventanilla Única Digital</li>
                <li>Cobrar más en total por habitaciones que el alquiler del piso completo</li>
                <li>Usar contratos «de temporada» sin causa justificada documentada</li>
                <li>No incluir el certificado energético al firmar el contrato</li>
                <li>No declarar los ingresos por habitaciones en la renta (obligatorio)</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('orientador-alquiler-habitaciones')} />
        <ShareCard appName="orientador-alquiler-habitaciones" />
        <Footer appName="orientador-alquiler-habitaciones" />
      </div>
    </>
  );
}
