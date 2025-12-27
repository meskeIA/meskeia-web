'use client';

import { useState } from 'react';
import styles from './CalculadoraCosteVivienda.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
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
        <h1 className={styles.title}>Calculadora Coste Real de Vivienda</h1>
        <p className={styles.subtitle}>
          Descubre cuánto cuesta realmente mantener tu vivienda al mes.
          Introduce solo los gastos que tengas.
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Gastos fijos */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardIcon}>📋</span>
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
              <span className={styles.cardIcon}>💡</span>
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
              <span className={styles.cardIcon}>🔧</span>
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
              <span className={styles.placeholderIcon}>⚠️</span>
              <p>Introduce al menos un gasto para ver el resultado</p>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🏠</span>
              <p>Introduce los gastos de tu vivienda</p>
              <p className={styles.placeholderHint}>
                Solo necesitas rellenar los campos que te apliquen.
                Los campos vacíos se consideran 0€.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>estimación orientativa</strong> del coste
          de mantenimiento de una vivienda. Los valores reales pueden variar según tu municipio,
          la antigüedad del inmueble y el consumo real de suministros.
        </p>
        <p>
          <strong>NO constituye asesoramiento financiero.</strong> Consulta con un profesional
          para decisiones importantes sobre compra o mantenimiento de inmuebles.
        </p>
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-coste-vivienda')} />
      <Footer appName="calculadora-coste-vivienda" />
    </div>
  );
}
