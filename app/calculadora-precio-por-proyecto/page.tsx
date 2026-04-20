'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './CalculadoraPrecioPorProyecto.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

type NivelComplejidad = 'basico' | 'medio' | 'alto' | 'especialista';
type NivelUrgencia = 'no' | 'algo' | 'muy';

const MULTIPLICADORES_COMPLEJIDAD: Record<NivelComplejidad, { factor: number; label: string; desc: string }> = {
  basico: { factor: 1.0, label: 'Básico', desc: 'Tareas rutinarias que dominas' },
  medio: { factor: 1.15, label: 'Medio', desc: 'Requiere investigación o herramientas específicas' },
  alto: { factor: 1.30, label: 'Alto', desc: 'Tecnología nueva, plazos ajustados o alta responsabilidad' },
  especialista: { factor: 1.50, label: 'Especialista', desc: 'Muy pocos profesionales pueden hacerlo' },
};

const MULTIPLICADORES_URGENCIA: Record<NivelUrgencia, { factor: number; label: string; desc: string }> = {
  no: { factor: 1.0, label: 'No', desc: 'Plazo razonable' },
  algo: { factor: 1.20, label: 'Algo urgente', desc: 'Plazo ajustado' },
  muy: { factor: 1.50, label: 'Muy urgente', desc: 'Necesito esto para ayer' },
};

export default function CalculadoraPrecioPorProyectoPage() {
  // Bloque 1: Tiempo estimado
  const [horasTrabajo, setHorasTrabajo] = useState('');
  const [horasGestion, setHorasGestion] = useState('');
  const [horasRevisiones, setHorasRevisiones] = useState('');

  // Bloque 2: Tarifa y complejidad
  const [tarifaHora, setTarifaHora] = useState('');
  const [complejidad, setComplejidad] = useState<NivelComplejidad>('medio');

  // Bloque 3: Costes adicionales
  const [gastosDirectos, setGastosDirectos] = useState('0');
  const [margenImprevistos, setMargenImprevistos] = useState(15);

  // Bloque 4: Urgencia
  const [urgencia, setUrgencia] = useState<NivelUrgencia>('no');

  const parseNum = (val: string): number => {
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const calculos = useMemo(() => {
    const hTrabajo = parseNum(horasTrabajo);
    const hGestion = parseNum(horasGestion);
    const hRevisiones = parseNum(horasRevisiones);
    const tarifa = parseNum(tarifaHora);
    const gastos = parseNum(gastosDirectos);

    const horasTotales = hTrabajo + hGestion + hRevisiones;

    if (horasTotales <= 0 || tarifa <= 0) return null;

    const factorComplejidad = MULTIPLICADORES_COMPLEJIDAD[complejidad].factor;
    const factorUrgencia = MULTIPLICADORES_URGENCIA[urgencia].factor;

    // Costes por tipo de hora
    const costoTrabajo = hTrabajo * tarifa;
    const costoGestion = hGestion * tarifa;
    const costoRevisiones = hRevisiones * tarifa;
    const costoHorasBase = horasTotales * tarifa;

    // Aplicar multiplicadores
    const costoConComplejidad = costoHorasBase * factorComplejidad;
    const incrementoComplejidad = costoConComplejidad - costoHorasBase;

    const costoConUrgencia = costoConComplejidad * factorUrgencia;
    const incrementoUrgencia = costoConUrgencia - costoConComplejidad;

    const costoBase = costoConUrgencia;
    const importeImprevistos = costoBase * (margenImprevistos / 100);
    const subtotal = costoBase + importeImprevistos + gastos;

    // Rango de negociación
    const precioMinimo = subtotal * 0.90;
    const precioRecomendado = subtotal;
    const precioIdeal = subtotal * 1.15;

    // Métricas
    const tarifaEfectiva = precioRecomendado / horasTotales;
    const diasLaborables = horasTotales / 8;
    const porcentajeTrabajo = ((costoTrabajo / precioRecomendado) * 100);
    const porcentajeGestionImprevistos = 100 - porcentajeTrabajo;

    return {
      hTrabajo,
      hGestion,
      hRevisiones,
      horasTotales,
      tarifa,
      costoTrabajo,
      costoGestion,
      costoRevisiones,
      costoHorasBase,
      incrementoComplejidad,
      incrementoUrgencia,
      importeImprevistos,
      gastos,
      precioMinimo,
      precioRecomendado,
      precioIdeal,
      tarifaEfectiva,
      diasLaborables,
      porcentajeTrabajo,
      porcentajeGestionImprevistos,
      factorComplejidad,
      factorUrgencia,
    };
  }, [horasTrabajo, horasGestion, horasRevisiones, tarifaHora, complejidad, gastosDirectos, margenImprevistos, urgencia]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Calculadora de Precio por Proyecto</h1>
          <p className={styles.subtitle}>Estima cuánto cobrar por tu próximo proyecto freelance</p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="financial" severity="high" context="calculadora-precio-por-proyecto" />

        {/* Formulario */}
        <div className={styles.formGrid}>
          {/* Bloque 1: Tiempo estimado */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">⏱️</span> Tiempo estimado
            </h2>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="horas-trabajo">
                Horas de trabajo directo
                <span className={styles.tooltip} title="Solo el trabajo técnico/creativo directo del proyecto">
                  <span aria-hidden="true">ℹ️</span>
                </span>
              </label>
              <input
                id="horas-trabajo"
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={horasTrabajo}
                onChange={(e) => setHorasTrabajo(e.target.value)}
                placeholder="40"
                autoComplete="off"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="horas-gestion">
                Horas de gestión y comunicación
                <span className={styles.tooltip} title="Reuniones, emails, revisiones, presentaciones">
                  <span aria-hidden="true">ℹ️</span>
                </span>
              </label>
              <input
                id="horas-gestion"
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={horasGestion}
                onChange={(e) => setHorasGestion(e.target.value)}
                placeholder="10"
                autoComplete="off"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="horas-revisiones">
                Horas de revisiones
                <span className={styles.tooltip} title="Rondas de cambios y ajustes del cliente">
                  <span aria-hidden="true">ℹ️</span>
                </span>
              </label>
              <input
                id="horas-revisiones"
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={horasRevisiones}
                onChange={(e) => setHorasRevisiones(e.target.value)}
                placeholder="5"
                autoComplete="off"
              />
            </div>
          </section>

          {/* Bloque 2: Tarifa y complejidad */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">💰</span> Tarifa y complejidad
            </h2>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="tarifa-hora">
                Tu tarifa por hora (€)
              </label>
              <input
                id="tarifa-hora"
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={tarifaHora}
                onChange={(e) => setTarifaHora(e.target.value)}
                placeholder="35"
                autoComplete="off"
              />
              <Link href="/orientador-tarifa-freelance/" className={styles.linkHelper}>
                ¿No sabes tu tarifa? Calcúlala aquí
              </Link>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="complejidad">
                Nivel de complejidad
              </label>
              <select
                id="complejidad"
                className={styles.select}
                value={complejidad}
                onChange={(e) => setComplejidad(e.target.value as NivelComplejidad)}
              >
                {Object.entries(MULTIPLICADORES_COMPLEJIDAD).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label} (×{formatNumber(val.factor, 2)}) — {val.desc}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Bloque 3: Costes adicionales */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">📦</span> Costes adicionales
            </h2>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="gastos-directos">
                Gastos directos del proyecto (€)
                <span className={styles.tooltip} title="Software, licencias, stock, hosting, herramientas específicas">
                  <span aria-hidden="true">ℹ️</span>
                </span>
              </label>
              <input
                id="gastos-directos"
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={gastosDirectos}
                onChange={(e) => setGastosDirectos(e.target.value)}
                placeholder="0"
                autoComplete="off"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="margen-imprevistos">
                Margen de imprevistos: {margenImprevistos}%
                <span className={styles.tooltip} title="Scope creep, cambios de última hora, imprevistos técnicos">
                  <span aria-hidden="true">ℹ️</span>
                </span>
              </label>
              <input
                id="margen-imprevistos"
                type="range"
                className={styles.slider}
                min="0"
                max="30"
                step="1"
                value={margenImprevistos}
                onChange={(e) => setMargenImprevistos(Number(e.target.value))}
              />
              <div className={styles.sliderLabels}>
                <span>0%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
            </div>
          </section>

          {/* Bloque 4: Urgencia */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">🚀</span> Urgencia
            </h2>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="urgencia">
                ¿Es urgente?
              </label>
              <select
                id="urgencia"
                className={styles.select}
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as NivelUrgencia)}
              >
                {Object.entries(MULTIPLICADORES_URGENCIA).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label} (×{formatNumber(val.factor, 2)}) — {val.desc}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        {/* Resultados */}
        {calculos && (
          <div className={styles.resultados}>
            {/* Panel principal: Rango de precios */}
            <section className={styles.rangoPanel}>
              <h2 className={styles.rangoTitle}>Rango de precios para tu proyecto</h2>

              <div className={styles.rangoCards}>
                <div className={`${styles.rangoCard} ${styles.rangoMinimo}`}>
                  <span className={styles.rangoLabel}>Precio mínimo</span>
                  <span className={styles.rangoPrecio}>{formatCurrency(calculos.precioMinimo)}</span>
                  <span className={styles.rangoDesc}>No bajes de aquí</span>
                </div>

                <div className={`${styles.rangoCard} ${styles.rangoRecomendado}`}>
                  <span className={styles.rangoLabel}>Precio recomendado</span>
                  <span className={styles.rangoPrecioDestacado}>{formatCurrency(calculos.precioRecomendado)}</span>
                  <span className={styles.rangoDesc}>Tu precio justo</span>
                </div>

                <div className={`${styles.rangoCard} ${styles.rangoIdeal}`}>
                  <span className={styles.rangoLabel}>Precio ideal</span>
                  <span className={styles.rangoPrecio}>{formatCurrency(calculos.precioIdeal)}</span>
                  <span className={styles.rangoDesc}>Empieza pidiendo esto</span>
                </div>
              </div>

              {/* Barra visual del rango */}
              <div className={styles.rangoBarContainer}>
                <div className={styles.rangoBar}>
                  <div className={styles.rangoBarMin} />
                  <div className={styles.rangoBarRec} />
                  <div className={styles.rangoBarIdeal} />
                </div>
                <div className={styles.rangoBarLabels}>
                  <span>{formatCurrency(calculos.precioMinimo)}</span>
                  <span>{formatCurrency(calculos.precioRecomendado)}</span>
                  <span>{formatCurrency(calculos.precioIdeal)}</span>
                </div>
              </div>
            </section>

            {/* Desglose detallado */}
            <section className={styles.desglosePanel}>
              <h2 className={styles.desgloseTitle}>Desglose detallado</h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Horas</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Trabajo directo</td>
                      <td>{formatNumber(calculos.hTrabajo, 1)} h</td>
                      <td>{formatCurrency(calculos.costoTrabajo)}</td>
                    </tr>
                    <tr>
                      <td>Gestión y comunicación</td>
                      <td>{formatNumber(calculos.hGestion, 1)} h</td>
                      <td>{formatCurrency(calculos.costoGestion)}</td>
                    </tr>
                    <tr>
                      <td>Revisiones</td>
                      <td>{formatNumber(calculos.hRevisiones, 1)} h</td>
                      <td>{formatCurrency(calculos.costoRevisiones)}</td>
                    </tr>
                    <tr className={styles.filaSubtotal}>
                      <td><strong>Subtotal horas</strong></td>
                      <td><strong>{formatNumber(calculos.horasTotales, 1)} h</strong></td>
                      <td><strong>{formatCurrency(calculos.costoHorasBase)}</strong></td>
                    </tr>
                    {calculos.incrementoComplejidad > 0 && (
                      <tr>
                        <td>Complejidad (×{formatNumber(calculos.factorComplejidad, 2)})</td>
                        <td>—</td>
                        <td>+{formatCurrency(calculos.incrementoComplejidad)}</td>
                      </tr>
                    )}
                    {calculos.incrementoUrgencia > 0 && (
                      <tr>
                        <td>Urgencia (×{formatNumber(calculos.factorUrgencia, 2)})</td>
                        <td>—</td>
                        <td>+{formatCurrency(calculos.incrementoUrgencia)}</td>
                      </tr>
                    )}
                    {calculos.importeImprevistos > 0 && (
                      <tr>
                        <td>Imprevistos ({margenImprevistos}%)</td>
                        <td>—</td>
                        <td>+{formatCurrency(calculos.importeImprevistos)}</td>
                      </tr>
                    )}
                    {calculos.gastos > 0 && (
                      <tr>
                        <td>Gastos directos</td>
                        <td>—</td>
                        <td>+{formatCurrency(calculos.gastos)}</td>
                      </tr>
                    )}
                    <tr className={styles.filaTotal}>
                      <td><strong>TOTAL RECOMENDADO</strong></td>
                      <td><strong>{formatNumber(calculos.horasTotales, 1)} h</strong></td>
                      <td><strong>{formatCurrency(calculos.precioRecomendado)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Métricas útiles */}
            <section className={styles.metricasPanel}>
              <h2 className={styles.metricasTitle}>
                <span aria-hidden="true">📊</span> Métricas útiles
              </h2>
              <div className={styles.metricasGrid}>
                <div className={styles.metricaCard}>
                  <span className={styles.metricaValor}>{formatCurrency(calculos.tarifaEfectiva)}/h</span>
                  <span className={styles.metricaLabel}>Tarifa efectiva real</span>
                </div>
                <div className={styles.metricaCard}>
                  <span className={styles.metricaValor}>{formatNumber(calculos.diasLaborables, 1)} días</span>
                  <span className={styles.metricaLabel}>Duración estimada (8 h/día)</span>
                </div>
                <div className={styles.metricaCard}>
                  <span className={styles.metricaValor}>{formatNumber(calculos.porcentajeTrabajo, 0)}% / {formatNumber(calculos.porcentajeGestionImprevistos, 0)}%</span>
                  <span className={styles.metricaLabel}>Trabajo directo / Gestión e imprevistos</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Contenido educativo */}
        <EducationalSection
          title="Aprende a poner precio a tus proyectos"
          subtitle="Métodos, casos prácticos y consejos para freelances"
        >
          <section className={styles.guideSection}>
            <h2>Métodos de pricing para freelances</h2>
            <div className={styles.tablaWrapper}>
              <table className={styles.tablaEducativa}>
                <thead>
                  <tr>
                    <th>Método</th>
                    <th>Descripción</th>
                    <th>Cuándo usarlo</th>
                    <th>Riesgo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Por hora</strong></td>
                    <td>Cobras cada hora trabajada</td>
                    <td>Proyectos indefinidos, mantenimiento</td>
                    <td>Penaliza la eficiencia</td>
                  </tr>
                  <tr>
                    <td><strong>Por proyecto (precio cerrado)</strong></td>
                    <td>Precio fijo acordado antes de empezar</td>
                    <td>Alcance claro, experiencia previa</td>
                    <td>Subestimar el alcance</td>
                  </tr>
                  <tr>
                    <td><strong>Por valor (value-based)</strong></td>
                    <td>Precio según el valor para el cliente</td>
                    <td>Alto impacto en negocio del cliente</td>
                    <td>Difícil de cuantificar</td>
                  </tr>
                  <tr>
                    <td><strong>Retainer</strong></td>
                    <td>Cuota mensual por disponibilidad</td>
                    <td>Clientes recurrentes, largo plazo</td>
                    <td>Infrautilización</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Casos de uso prácticos</h2>

            <div className={styles.casoCard}>
              <h3><span aria-hidden="true">🎨</span> Diseñador web: landing page para startup</h3>
              <p>40 h de diseño + 8 h de gestión + 6 h de revisiones = 54 h. Tarifa 40 €/h, complejidad media (×1,15). Con 15% de imprevistos y 200 € en licencias de stock, el precio recomendado ronda los <strong>3.060 €</strong>. Empezar pidiendo 3.520 €.</p>
            </div>

            <div className={styles.casoCard}>
              <h3><span aria-hidden="true">💻</span> Desarrollador: migración de sistema legacy</h3>
              <p>120 h de desarrollo + 20 h de gestión + 15 h de revisiones = 155 h. Tarifa 50 €/h, complejidad alta (×1,30). Con 20% de imprevistos y 500 € en servidores de pruebas, el precio recomendado está en torno a <strong>12.600 €</strong>. Es un proyecto de riesgo técnico alto: nunca aceptar por debajo de 11.400 €.</p>
            </div>

            <div className={styles.casoCard}>
              <h3><span aria-hidden="true">🌐</span> Traductor: manual técnico de 50 páginas</h3>
              <p>30 h de traducción + 5 h de gestión + 3 h de revisiones = 38 h. Tarifa 30 €/h, complejidad básica (×1,0). Con 10% de imprevistos, el precio recomendado es de unos <strong>1.254 €</strong>. Proyecto predecible donde el margen de negociación es menor.</p>
            </div>

            <div className={styles.casoCard}>
              <h3><span aria-hidden="true">📢</span> Consultor de marketing: estrategia trimestral</h3>
              <p>60 h de trabajo estratégico + 15 h de reuniones + 8 h de revisiones = 83 h. Tarifa 55 €/h, complejidad media (×1,15). Con 15% de imprevistos, el precio recomendado se sitúa alrededor de <strong>6.040 €</strong>. El valor percibido suele ser alto: pedir precio ideal de 6.950 €.</p>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>

            <div className={styles.faqItem}>
              <h3>¿Debo incluir el IVA en el precio del proyecto?</h3>
              <p>No. Presenta siempre el precio sin IVA (base imponible) y añade el IVA como línea separada en la factura. Así el cliente sabe exactamente qué paga por tu trabajo y qué corresponde a impuestos. En España, el tipo general es del 21%.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué hago si el cliente pide descuento?</h3>
              <p>Nunca bajes el precio sin reducir el alcance. Si el cliente quiere pagar menos, ofrece quitar funcionalidades o reducir rondas de revisiones. El precio ideal (el +15%) te da margen para negociar sin perder dinero. Si baja del precio mínimo, rechaza educadamente.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuántas rondas de revisión incluir?</h3>
              <p>Lo habitual es incluir 2-3 rondas de revisiones menores en el presupuesto. Defínelo por escrito en la propuesta. Las revisiones adicionales o cambios de alcance se facturan aparte a tu tarifa por hora.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cobro por adelantado?</h3>
              <p>Sí. El estándar profesional es 50% al inicio y 50% a la entrega. Para proyectos largos, fracciona en 3 pagos: 40% al inicio, 30% a mitad y 30% a la entrega. Nunca empieces a trabajar sin un anticipo firmado.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué pasa si el proyecto se alarga más de lo estimado?</h3>
              <p>Para eso está el margen de imprevistos (15-20% recomendado). Si aun así se excede, comunica al cliente cuanto antes. Si los cambios son por decisiones del cliente (scope creep), negocia un anexo al contrato con precio adicional.</p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Precio cerrado o por horas?</h3>
              <p>Precio cerrado cuando el alcance está claro y tienes experiencia similar. Por horas cuando el proyecto es abierto, hay mucha incertidumbre o es un servicio continuado (mantenimiento, consultoría). Esta calculadora te ayuda a definir el precio cerrado de forma profesional.</p>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Errores frecuentes al presupuestar</h2>
            <div className={styles.warningBox}>
              <ul>
                <li><strong>No incluir horas de gestión</strong>: Las reuniones, emails y presentaciones también son trabajo. Si no las cobras, estás regalando entre un 15% y un 25% de tu tiempo.</li>
                <li><strong>Aceptar &ldquo;ajustes rápidos&rdquo; gratis</strong>: Los pequeños cambios fuera del alcance original se acumulan. Defínelo en el contrato: lo que no está en la propuesta, se presupuesta aparte.</li>
                <li><strong>No tener contrato firmado</strong>: Sin propuesta o contrato, no tienes respaldo legal si el cliente no paga o cambia el alcance indefinidamente. Siempre por escrito.</li>
                <li><strong>Facturar todo al final</strong>: Si el cliente desaparece o no paga, pierdes todo. Fracciona los pagos y vincula cada entrega a un hito.</li>
                <li><strong>Copiar precios de otros freelances</strong>: Cada profesional tiene costes, experiencia y velocidad distintos. Calcula TU precio basándote en TUS números.</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-precio-por-proyecto')} />
        <ShareCard appName="calculadora-precio-por-proyecto" />
        <Footer appName="calculadora-precio-por-proyecto" />
      </div>
    </>
  );
}
