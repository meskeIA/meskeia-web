'use client';

import { useState } from 'react';
import styles from './EstimadorCosteVivienda.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

export default function CalculadoraCosteViviendaPage() {
  // Estado para todos los campos (vacío = no introducido)
  const [hipoteca, setHipoteca] = useState('');
  const [ibi, setIbi] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [seguroHogar, setSeguroHogar] = useState('');
  const [seguroVida, setSeguroVida] = useState('');

  const [electricidad, setElectricidad] = useState('');
  const [gas, setGas] = useState('');
  const [agua, setAgua] = useState('');
  const [internet, setInternet] = useState('');

  const [mantenimiento, setMantenimiento] = useState('');
  const [basura, setBasura] = useState('');
  const [alarma, setAlarma] = useState('');
  const [otros, setOtros] = useState('');

  // Estado para mostrar resultados
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Función para calcular
  const calcular = () => {
    setMostrarResultados(true);
  };

  // Función para limpiar
  const limpiar = () => {
    setHipoteca('');
    setIbi('');
    setComunidad('');
    setSeguroHogar('');
    setSeguroVida('');
    setElectricidad('');
    setGas('');
    setAgua('');
    setInternet('');
    setMantenimiento('');
    setBasura('');
    setAlarma('');
    setOtros('');
    setMostrarResultados(false);
  };

  // Calcular totales (campos vacíos = 0)
  const getValor = (campo: string) => campo.trim() === '' ? 0 : parseSpanishNumber(campo);

  // Gastos fijos (mensual)
  const gastosFijos = {
    hipoteca: getValor(hipoteca),
    ibiMensual: getValor(ibi) / 12,
    comunidad: getValor(comunidad),
    seguroHogarMensual: getValor(seguroHogar) / 12,
    seguroVidaMensual: getValor(seguroVida) / 12,
  };

  // Suministros (mensual)
  const suministros = {
    electricidad: getValor(electricidad),
    gas: getValor(gas),
    agua: getValor(agua),
    internet: getValor(internet),
  };

  // Otros gastos (mensual)
  const otrosGastos = {
    mantenimientoMensual: getValor(mantenimiento) / 12,
    basuraMensual: getValor(basura) / 12,
    alarma: getValor(alarma),
    otrosMensual: getValor(otros) / 12,
  };

  // Totales por categoría
  const totalFijos = Object.values(gastosFijos).reduce((a, b) => a + b, 0);
  const totalSuministros = Object.values(suministros).reduce((a, b) => a + b, 0);
  const totalOtros = Object.values(otrosGastos).reduce((a, b) => a + b, 0);

  const totalMensual = totalFijos + totalSuministros + totalOtros;
  const totalAnual = totalMensual * 12;
  const costePorDia = totalAnual / 365;

  // Porcentajes para la barra
  const porcentajes = {
    fijos: totalMensual > 0 ? (totalFijos / totalMensual) * 100 : 0,
    suministros: totalMensual > 0 ? (totalSuministros / totalMensual) * 100 : 0,
    otros: totalMensual > 0 ? (totalOtros / totalMensual) * 100 : 0,
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estimador Coste Real de Vivienda</h1>
        <p className={styles.subtitle}>
          Descubre cuánto cuesta realmente mantener tu vivienda al mes.
          Introduce solo los gastos que tengas.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="coste-vivienda"
      >
        <p>
          Esta calculadora proporciona <strong>estimaciones orientativas</strong> del coste mensual
          de mantener una vivienda.
        </p>
        <ul>
          <li>Los gastos varían significativamente según ubicación, tipo de vivienda y consumo personal</li>
          <li>NO incluye gastos imprevistos (averías, derramas, reformas)</li>
          <li>Úsala como guía para planificar tu presupuesto familiar</li>
        </ul>
      </DisclaimerCard>

      {/* Última actualización */}

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Gastos fijos */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon} aria-hidden="true">📋</span>
              Gastos fijos
            </h2>

            <NumberInput
              value={hipoteca}
              onChange={setHipoteca}
              label="Hipoteca mensual"
              placeholder="Ej: 650"
              helperText="Déjalo vacío si no tienes hipoteca"
            />

            <NumberInput
              value={ibi}
              onChange={setIbi}
              label="IBI anual"
              placeholder="Ej: 500"
              helperText="Impuesto sobre Bienes Inmuebles"
            />

            <NumberInput
              value={comunidad}
              onChange={setComunidad}
              label="Comunidad mensual"
              placeholder="Ej: 80"
            />

            <div className={styles.formRow}>
              <NumberInput
                value={seguroHogar}
                onChange={setSeguroHogar}
                label="Seguro hogar anual"
                placeholder="Ej: 150"
              />
              <NumberInput
                value={seguroVida}
                onChange={setSeguroVida}
                label="Seguro vida anual"
                placeholder="Ej: 200"
                helperText="Si está vinculado a hipoteca"
              />
            </div>
          </div>

          {/* Suministros */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon} aria-hidden="true">💡</span>
              Suministros mensuales
            </h2>

            <div className={styles.formRow}>
              <NumberInput
                value={electricidad}
                onChange={setElectricidad}
                label="Electricidad"
                placeholder="Ej: 80"
              />
              <NumberInput
                value={gas}
                onChange={setGas}
                label="Gas"
                placeholder="Ej: 40"
              />
            </div>

            <div className={styles.formRow}>
              <NumberInput
                value={agua}
                onChange={setAgua}
                label="Agua"
                placeholder="Ej: 30"
              />
              <NumberInput
                value={internet}
                onChange={setInternet}
                label="Internet/TV"
                placeholder="Ej: 50"
              />
            </div>
          </div>

          {/* Otros gastos */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon} aria-hidden="true">🔧</span>
              Otros gastos
            </h2>

            <div className={styles.formRow}>
              <NumberInput
                value={mantenimiento}
                onChange={setMantenimiento}
                label="Mantenimiento anual"
                placeholder="Ej: 600"
                helperText="Reparaciones, revisiones..."
              />
              <NumberInput
                value={basura}
                onChange={setBasura}
                label="Tasa basuras anual"
                placeholder="Ej: 100"
              />
            </div>

            <div className={styles.formRow}>
              <NumberInput
                value={alarma}
                onChange={setAlarma}
                label="Alarma mensual"
                placeholder="Ej: 35"
              />
              <NumberInput
                value={otros}
                onChange={setOtros}
                label="Otros gastos anual"
                placeholder="Ej: 0"
              />
            </div>
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              Calcular coste mensual
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {mostrarResultados && totalMensual > 0 ? (
            <>
              {/* Resultados principales */}
              <div className={styles.resultsGrid}>
                <ResultCard
                  title="Coste mensual total"
                  value={formatNumber(totalMensual, 2)}
                  unit="€"
                  variant="highlight"
                  icon="📊"
                />
                <ResultCard
                  title="Coste anual total"
                  value={formatNumber(totalAnual, 2)}
                  unit="€"
                  variant="info"
                  icon="📅"
                />
                <ResultCard
                  title="Coste por día"
                  value={formatNumber(costePorDia, 2)}
                  unit="€"
                  variant="default"
                  icon="☀️"
                />
              </div>

              {/* Desglose por categorías */}
              <div className={styles.desglose}>
                <h3 className={styles.desgloseTitle}>Desglose mensual</h3>

                {/* Barra visual */}
                <div className={styles.barraContainer}>
                  <div className={styles.barra}>
                    <div
                      className={`${styles.barraSegmento} ${styles.fijos}`}
                      style={{ width: `${porcentajes.fijos}%` }}
                      title={`Gastos fijos: ${formatNumber(porcentajes.fijos, 1)}%`}
                    />
                    <div
                      className={`${styles.barraSegmento} ${styles.suministros}`}
                      style={{ width: `${porcentajes.suministros}%` }}
                      title={`Suministros: ${formatNumber(porcentajes.suministros, 1)}%`}
                    />
                    <div
                      className={`${styles.barraSegmento} ${styles.otros}`}
                      style={{ width: `${porcentajes.otros}%` }}
                      title={`Otros: ${formatNumber(porcentajes.otros, 1)}%`}
                    />
                  </div>
                  <div className={styles.leyenda}>
                    <span className={styles.leyendaItem}>
                      <span className={`${styles.leyendaColor} ${styles.fijos}`}></span> Fijos ({formatNumber(porcentajes.fijos, 0)}%)
                    </span>
                    <span className={styles.leyendaItem}>
                      <span className={`${styles.leyendaColor} ${styles.suministros}`}></span> Suministros ({formatNumber(porcentajes.suministros, 0)}%)
                    </span>
                    <span className={styles.leyendaItem}>
                      <span className={`${styles.leyendaColor} ${styles.otros}`}></span> Otros ({formatNumber(porcentajes.otros, 0)}%)
                    </span>
                  </div>
                </div>

                {/* Gastos fijos */}
                {totalFijos > 0 && (
                  <div className={styles.desgloseSection}>
                    <h4>📋 Gastos fijos: {formatCurrency(totalFijos)}/mes</h4>
                    <div className={styles.desgloseGrid}>
                      {gastosFijos.hipoteca > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Hipoteca</span>
                          <span>{formatCurrency(gastosFijos.hipoteca)}</span>
                        </div>
                      )}
                      {gastosFijos.ibiMensual > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>IBI</span>
                          <span>{formatCurrency(gastosFijos.ibiMensual)}</span>
                        </div>
                      )}
                      {gastosFijos.comunidad > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Comunidad</span>
                          <span>{formatCurrency(gastosFijos.comunidad)}</span>
                        </div>
                      )}
                      {gastosFijos.seguroHogarMensual > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Seguro hogar</span>
                          <span>{formatCurrency(gastosFijos.seguroHogarMensual)}</span>
                        </div>
                      )}
                      {gastosFijos.seguroVidaMensual > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Seguro vida</span>
                          <span>{formatCurrency(gastosFijos.seguroVidaMensual)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Suministros */}
                {totalSuministros > 0 && (
                  <div className={styles.desgloseSection}>
                    <h4>💡 Suministros: {formatCurrency(totalSuministros)}/mes</h4>
                    <div className={styles.desgloseGrid}>
                      {suministros.electricidad > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Electricidad</span>
                          <span>{formatCurrency(suministros.electricidad)}</span>
                        </div>
                      )}
                      {suministros.gas > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Gas</span>
                          <span>{formatCurrency(suministros.gas)}</span>
                        </div>
                      )}
                      {suministros.agua > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Agua</span>
                          <span>{formatCurrency(suministros.agua)}</span>
                        </div>
                      )}
                      {suministros.internet > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Internet/TV</span>
                          <span>{formatCurrency(suministros.internet)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Otros gastos */}
                {totalOtros > 0 && (
                  <div className={styles.desgloseSection}>
                    <h4>🔧 Otros gastos: {formatCurrency(totalOtros)}/mes</h4>
                    <div className={styles.desgloseGrid}>
                      {otrosGastos.mantenimientoMensual > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Mantenimiento</span>
                          <span>{formatCurrency(otrosGastos.mantenimientoMensual)}</span>
                        </div>
                      )}
                      {otrosGastos.basuraMensual > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Tasa basuras</span>
                          <span>{formatCurrency(otrosGastos.basuraMensual)}</span>
                        </div>
                      )}
                      {otrosGastos.alarma > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Alarma</span>
                          <span>{formatCurrency(otrosGastos.alarma)}</span>
                        </div>
                      )}
                      {otrosGastos.otrosMensual > 0 && (
                        <div className={styles.desgloseRow}>
                          <span>Otros</span>
                          <span>{formatCurrency(otrosGastos.otrosMensual)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : mostrarResultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">⚠️</span>
              <p>Introduce al menos un gasto para ver el resultado</p>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🏠</span>
              <p>Introduce los gastos de tu vivienda</p>
              <p className={styles.placeholderHint}>
                Solo necesitas rellenar los campos que te apliquen.
                Los campos vacíos se consideran 0€.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor los costes de tu vivienda?"
        subtitle="Descubre gastos ocultos y cómo reducir costes"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Los costes que muchos olvidan</h2>
          <p className={styles.introParagraph}>
            Cuando compramos una vivienda, solemos pensar solo en la hipoteca. Pero el coste real
            incluye muchos más conceptos que, sumados, pueden suponer un 30-50% adicional sobre la cuota mensual.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>💰 Gastos ineludibles</h4>
              <ul>
                <li><strong>IBI:</strong> Impuesto municipal (0,4%-1,1% del valor catastral)</li>
                <li><strong>Comunidad:</strong> Obligatorio en edificios (50-200€/mes)</li>
                <li><strong>Seguro hogar:</strong> Obligatorio con hipoteca (80-200€/año)</li>
                <li><strong>Tasa de basuras:</strong> Variable por municipio (50-200€/año)</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🔧 Mantenimiento preventivo</h4>
              <ul>
                <li><strong>Revisión caldera:</strong> Obligatoria cada 2 años (80-120€)</li>
                <li><strong>Aire acondicionado:</strong> Revisión anual recomendada (60-100€)</li>
                <li><strong>Pintura:</strong> Cada 5-7 años (1.500-3.000€)</li>
                <li><strong>Electrodomésticos:</strong> Vida útil 10-15 años</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Segundas residencias: el coste real</h2>
          <p>
            Una segunda residencia tiene costes casi iguales que una vivienda habitual, pero la usas
            solo unos meses al año. Esto significa que el <strong>coste por día de uso</strong> puede
            ser muy alto.
          </p>

          <div className={styles.infoBox}>
            <h4>📌 Ejemplo práctico</h4>
            <p>Una segunda residencia con gastos de 400€/mes:</p>
            <ul>
              <li>Coste anual: 4.800€</li>
              <li>Si la usas 30 días/año: <strong>160€/día</strong></li>
              <li>Si la usas 60 días/año: <strong>80€/día</strong></li>
              <li>Si la usas 90 días/año: <strong>53€/día</strong></li>
            </ul>
            <p>
              Compara este coste con alquilar un apartamento vacacional.
            </p>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h4>¿Cuánto debería reservar para mantenimiento?</h4>
            <p>
              La regla general es reservar el <strong>1% del valor del inmueble</strong> anualmente
              para mantenimiento y reparaciones. Para viviendas antiguas (+30 años), sube al 1,5-2%.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Cómo reducir los gastos de una vivienda?</h4>
            <p>
              Las mayores oportunidades de ahorro están en: revisar la potencia eléctrica contratada,
              comparar seguros cada año, mejorar el aislamiento térmico, y negociar servicios como
              alarmas o telecomunicaciones.
            </p>
          </div>
        </section>

        {/* --- SECCIÓN: Tabla Comparativa de Tipos de Vivienda --- */}
        <section className={styles.eduComparativaSection}>
          <h3>🏠 Costes Estimados por Tipo de Vivienda en España</h3>
          <p className={styles.eduComparativaSubtitle}>Rangos orientativos para 2025. Los valores varían según municipio, antigüedad, superficie y consumo personal. No incluyen hipoteca cuando el inmueble está pagado.</p>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTablaComparativa}>
              <thead>
                <tr>
                  <th>Tipo de Vivienda</th>
                  <th>Hipoteca Media</th>
                  <th>IBI Mensual</th>
                  <th>Comunidad</th>
                  <th>Suministros</th>
                  <th>Mantenimiento</th>
                  <th>Total Estimado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🏙️ Piso centro ciudad</td>
                  <td>800–1.200 €</td>
                  <td>50–100 €</td>
                  <td>80–200 €</td>
                  <td>150–250 €</td>
                  <td>50–80 €</td>
                  <td>1.130–1.830 €</td>
                </tr>
                <tr>
                  <td>🏢 Piso periferia/barrio</td>
                  <td>500–800 €</td>
                  <td>30–60 €</td>
                  <td>50–120 €</td>
                  <td>120–200 €</td>
                  <td>40–60 €</td>
                  <td>740–1.240 €</td>
                </tr>
                <tr>
                  <td>🏡 Vivienda unifamiliar</td>
                  <td>700–1.100 €</td>
                  <td>60–150 €</td>
                  <td>0–50 €</td>
                  <td>200–400 €</td>
                  <td>80–150 €</td>
                  <td>1.040–1.850 €</td>
                </tr>
                <tr>
                  <td>🏘️ Adosado / Pareado</td>
                  <td>650–1.000 €</td>
                  <td>50–120 €</td>
                  <td>30–80 €</td>
                  <td>180–350 €</td>
                  <td>70–120 €</td>
                  <td>980–1.670 €</td>
                </tr>
                <tr>
                  <td>🌊 Segunda residencia</td>
                  <td>300–600 €</td>
                  <td>40–100 €</td>
                  <td>50–150 €</td>
                  <td>60–150 €</td>
                  <td>60–100 €</td>
                  <td>510–1.100 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* --- SECCIÓN: Casos de Uso por Perfil de Propietario --- */}
        <section className={styles.eduEscenariosSection}>
          <h3>👤 Casos de Uso: Perfiles de Propietario</h3>
          <p className={styles.eduEscenariosSubtitle}>Ejemplos reales de lo que cuesta mantener una vivienda según tu situación personal en España.</p>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🎓</span>
                <h4>Joven comprador — 30 años</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Piso de 180.000 € (hipoteca 80%, 30 años, euríbor + 0,8%). Hipoteca: 720 €/mes. IBI: 35 €. Comunidad: 80 €. Seguros: 30 €. Suministros: 150 €. Fondo mantenimiento: 50 €. Total: ~1.065 €/mes.
              </p>
              <p className={styles.eduEscenarioTip}>💡 Necesita mínimo 3.550 € netos/mes para cumplir la regla del 30% de salario dedicado a vivienda.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>👨‍👩‍👧</span>
                <h4>Familia — Sin hipoteca</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Unifamiliar de 300.000 € sin hipoteca (pagada o heredada). IBI: 80 €/mes. Comunidad: 0 € (sin zonas comunes). Seguros: 35 €. Suministros: 300 €. Mantenimiento: 120 €. Total: ~535 €/mes.
              </p>
              <p className={styles.eduEscenarioTip}>💡 Sin hipoteca, la vivienda sigue costando más de 500 €/mes. El mantenimiento de una unifamiliar es sensiblemente mayor.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🏖️</span>
                <h4>Segunda residencia — Costa</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Apartamento costero de 150.000 € (hipoteca parcial 350 €/mes). IBI: 55 €. Comunidad: 90 €. Seguros: 25 €. Suministros mínimos: 60 €. Mantenimiento: 60 €. Total: ~640 €/mes.
              </p>
              <p className={styles.eduEscenarioTip}>💡 A solo 30 días de uso al año = 256 €/día. Compara con apartamento vacacional antes de decidir si comprar.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <div className={styles.eduEscenarioHeader}>
                <span className={styles.eduEscenarioIcon}>🏙️</span>
                <h4>Propietario inversor — Alquiler</h4>
              </div>
              <p className={styles.eduEscenarioExample}>
                Piso de 200.000 € en alquiler. Hipoteca: 550 €. Gastos fijos (IBI, comunidad, seguros): 200 €. Alquiler recibido: 950 €. Margen bruto antes de IRPF: 200 €/mes.
              </p>
              <p className={styles.eduEscenarioTip}>💡 Incluye vacíos y derramas en tus cálculos. El 60% de reducción IRPF por alquiler habitual mejora la rentabilidad real.</p>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN: FAQ Avanzado --- */}
        <section className={styles.eduFaqSection}>
          <h3>❓ Preguntas Frecuentes sobre Costes de Vivienda</h3>
          <p className={styles.eduFaqSubtitle}>Respuestas detalladas a las dudas más habituales al planificar el presupuesto de tu hogar.</p>
          <div className={styles.eduFaqList}>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuánto cuesta realmente comprar una vivienda en España?</h4>
              <p>Al precio de compra hay que sumar un 8-13% adicional en gastos: ITP o IVA (10% obra nueva, 6-10% segunda mano según CCAA), notaría (~700-1.200 €), registro (~300-600 €) y gestoría (~300-500 €). Para una vivienda de 200.000 €, calcula entre 16.000 y 26.000 € en gastos adicionales.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué porcentaje del salario debería dedicar a vivienda?</h4>
              <p>La regla del 30%: el total de gastos de vivienda (hipoteca + todos los gastos) no debería superar el 30% de tus ingresos netos. El Banco de España recomienda no superar el 35% incluyendo otras deudas. Con un total de 1.000 €/mes en vivienda, necesitas mínimo 3.333 € netos/mes.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo puedo reducir la factura de electricidad?</h4>
              <p>Las principales palancas son: revisar la potencia contratada (pasar de 5,75 a 3,45 kW ahorra ~15 €/mes en el término fijo), contratar tarifa con discriminación horaria, sustituir bombillas por LED, y mejorar el aislamiento. Un hogar eficientemente aislado puede ahorrar 30-50% en climatización.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Es más barato alquilar o comprar en España?</h4>
              <p>Depende de la ciudad y el ratio precio/alquiler. En Madrid y Barcelona, el ratio supera 25x (precio = 25 años de alquiler), lo que favorece el alquiler financieramente. En ciudades medianas suele estar entre 15-20x. La compra tiene sentido si planeas quedarte más de 7-10 años y tienes estabilidad laboral.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Qué cubre el seguro de hogar obligatorio con hipoteca?</h4>
              <p>El seguro obligatorio solo cubre el continente (estructura del inmueble), no el contenido (muebles, electrodomésticos). El banco exige que la suma asegurada cubra el valor de reconstrucción, no el valor de mercado. Puedes contratarlo libremente con cualquier aseguradora, no solo la del banco, y ahorrar 30-60% en la prima.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo funciona una derrama de comunidad?</h4>
              <p>Las derramas extraordinarias se aprueban en Junta de propietarios para gastos no presupuestados (ascensor, fachada, tejado). Se distribuyen según el coeficiente de participación. Pueden ser de 500 a 10.000 € por propietario. La ley obliga a crear un fondo de reserva del 10% del presupuesto anual.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuánto debo reservar para imprevistos y mantenimiento?</h4>
              <p>La regla del 1%: reserva anualmente el 1% del valor del inmueble para mantenimiento y reparaciones. En viviendas antiguas (+30 años), sube al 1,5-2%. Para un piso de 200.000 €, son 2.000 €/año (167 €/mes). Este fondo cubre desde pequeñas reparaciones hasta averías de caldera o fontanería.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuándo conviene refinanciar la hipoteca?</h4>
              <p>Conviene estudiar la refinanciación cuando el ahorro en cuota supere las comisiones de subrogación o cancelación (máx. 0,25% primer año, 0,15% segundo) más los gastos de notaría y registro. Como regla práctica: si ahorras más de 100 €/mes y te quedan más de 10 años de hipoteca, suele salir rentable en 2-3 años.</p>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN: Guía Paso a Paso --- */}
        <section className={styles.eduStepSection}>
          <h3>🗺️ Guía: Cómo Auditar y Reducir el Coste de tu Vivienda</h3>
          <p className={styles.eduStepSubtitle}>Proceso sistemático para identificar oportunidades de ahorro y optimizar el presupuesto de tu hogar.</p>
          <div className={styles.eduStepGuide}>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>1</span>
              <div className={styles.eduStepContent}>
                <h4>Inventario completo de gastos</h4>
                <p>Usa esta calculadora para registrar todos tus gastos. Revisa los últimos 12 meses de extractos bancarios para no olvidar pagos anuales como IBI, tasas o seguros. Suma también los gastos imprevistos del año anterior.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>2</span>
              <div className={styles.eduStepContent}>
                <h4>Revisa la potencia eléctrica contratada</h4>
                <p>Consulta tu factura: si nunca has tenido un corte por superar la potencia, probablemente tienes contratada más de la necesaria. Reducir de 5,75 a 3,45 kW ahorra ~180 €/año solo en el término de potencia fijo.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>3</span>
              <div className={styles.eduStepContent}>
                <h4>Compara seguros anualmente</h4>
                <p>El seguro de hogar vinculado a la hipoteca del banco suele ser 30-60% más caro que en el mercado libre. Tienes derecho a cambiarlo (Ley Hipotecaria 2019). Usa comparadores y contacta 3 aseguradoras antes de renovar.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>4</span>
              <div className={styles.eduStepContent}>
                <h4>Solicita bonificaciones en el IBI</h4>
                <p>Muchos ayuntamientos ofrecen bonificaciones por: familia numerosa (hasta 90% en algunos municipios), personas con discapacidad, instalación de paneles solares o mejora de eficiencia energética. Consulta en tu ayuntamiento si no las tienes aplicadas.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>5</span>
              <div className={styles.eduStepContent}>
                <h4>Crea un fondo de mantenimiento separado</h4>
                <p>Abre una cuenta de ahorro específica para la vivienda y aporta mensualmente el 1% anual del valor del inmueble dividido entre 12. Este fondo evita el impacto económico de averías inesperadas (caldera, fontanería, electrodomésticos).</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>6</span>
              <div className={styles.eduStepContent}>
                <h4>Negocia los servicios recurrentes</h4>
                <p>Alarma, fibra, gas y telecomunicaciones tienen contratos renovables. Cada 12-18 meses, llama a tu proveedor o busca alternativas: el ahorro puede ser de 15-50 €/mes por servicio. No esperes a que el contrato expire para negociar.</p>
              </div>
            </div>
            <div className={styles.eduStepItem}>
              <span className={styles.eduStepNumber}>7</span>
              <div className={styles.eduStepContent}>
                <h4>Evalúa mejoras de eficiencia energética</h4>
                <p>Una calificación energética A vs D puede suponer 150-300 €/mes de diferencia en climatización. Las subvenciones del Plan de Recuperación cubren hasta el 40-80% del coste de mejoras como bomba de calor, aislamiento o ventanas de alta eficiencia.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN: Mejores Prácticas --- */}
        <section className={styles.eduTipsSection}>
          <h3>⚡ 6 Hábitos del Propietario Inteligente</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🔍</span>
              <h4>Compara seguros cada año</h4>
              <p>Dedica 30 minutos al año a comparar seguros de hogar y vida. El ahorro potencial es de 50-150 €/año sin reducir cobertura.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>💰</span>
              <h4>Fondo de reserva del 1%</h4>
              <p>Aparta mensualmente el 1% anual del valor del inmueble. Una caldera nueva cuesta 2.000-4.000 €. Con el fondo, no te pilla por sorpresa.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>⚡</span>
              <h4>Revisa la potencia eléctrica</h4>
              <p>Si nunca saltan los plomos, tienes potencia de sobra. Reducirla cuesta 0 € y puede ahorrarte 100-200 €/año en el término fijo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🔧</span>
              <h4>Mantenimiento preventivo</h4>
              <p>Revisar la caldera cuesta 80 €. Una avería de caldera sin mantenimiento puede costar 1.500-3.000 €. El mantenimiento preventivo siempre sale más barato.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📞</span>
              <h4>Negocia cada 18 meses</h4>
              <p>Alarma, fibra y gas tienen tarifas para nuevos clientes mejores que las de fidelización. Amenaza con irse o cámbiate realmente: el ahorro acumulado es significativo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌡️</span>
              <h4>Mejora el aislamiento</h4>
              <p>Sellar ventanas con burletes y colocar film solar puede ahorrar 10-15% en climatización sin obras. Las subvenciones del PREE pueden financiar mejoras más profundas.</p>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN: Warning Box --- */}
        <section className={styles.eduWarningBox}>
          <div className={styles.eduWarningHeader}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <h3>Errores que Disparan el Coste Real de tu Vivienda</h3>
          </div>
          <ul className={styles.eduWarningList}>
            <li>
              <span>🔴</span>
              <span><strong>Calcular solo la cuota hipotecaria como coste de vivienda.</strong> La hipoteca suele ser el 60-70% del coste total. IBI, comunidad, seguros, suministros y mantenimiento suman un 30-50% más que no aparece en el simulador del banco.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>No crear un fondo de imprevistos.</strong> Una avería de caldera cuesta 1.500-3.000 €, una gotera 800-2.000 €, una derrama extraordinaria puede ser 5.000-10.000 €. Sin fondo, estas averías desestabilizan la economía familiar.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>Olvidar el IBI al planificar el presupuesto mensual.</strong> El IBI es un pago anual que muchos olvidan incluir en el presupuesto mensual. En ciudades medianas suele ser 400-800 €/año (33-67 €/mes) que hay que provisionar.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>Mantener el seguro vinculado del banco sin revisarlo.</strong> Los seguros de hogar y vida vinculados a hipotecas del banco pueden ser hasta el doble de caros que los del mercado libre. La Ley Hipotecaria de 2019 te permite cambiarlos sin penalización.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>Descuidar el mantenimiento preventivo.</strong> Pequeñas reparaciones de 100-300 € evitadas se convierten en obras de 3.000-15.000 €. La humedad, las fisuras y la corrosión se multiplican exponencialmente si no se tratan a tiempo.</span>
            </li>
            <li>
              <span>🔴</span>
              <span><strong>No valorar el coste real de una segunda residencia.</strong> Una segunda residencia con gastos de 600 €/mes cuesta 7.200 €/año. Si la usas 20 días al año, cada día te cuesta 360 €. Compara con el alquiler vacacional antes de comprar por impulso.</span>
            </li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-coste-vivienda')} />
      <ShareCard appName="estimador-coste-vivienda" />
      <Footer appName="estimador-coste-vivienda" />
    </div>
  );
}
