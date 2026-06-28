'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorColchonEmergenciaFreelance.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// --- Tipos ---

interface GastoInput {
  id: string;
  label: string;
  icono: string;
  placeholder: string;
  max: number;
  grupo: 'fijos' | 'profesionales';
}

interface ProyeccionMes {
  mes: number;
  ahorroRestante: number;
  porcentaje: number;
  nivel: NivelRiesgo;
}

type NivelRiesgo = 'critico' | 'insuficiente' | 'minimo' | 'bueno' | 'excelente';

// --- Constantes ---

const GASTOS_CONFIG: GastoInput[] = [
  { id: 'vivienda', label: 'Vivienda (alquiler/hipoteca)', icono: '🏠', placeholder: '800', max: 3000, grupo: 'fijos' },
  { id: 'reta', label: 'Cuota RETA (Seguridad Social)', icono: '📋', placeholder: '300', max: 1000, grupo: 'fijos' },
  { id: 'suministros', label: 'Suministros (luz, agua, gas, internet, movil)', icono: '💡', placeholder: '150', max: 500, grupo: 'fijos' },
  { id: 'alimentacion', label: 'Alimentacion', icono: '🛒', placeholder: '400', max: 1000, grupo: 'fijos' },
  { id: 'transporte', label: 'Transporte', icono: '🚗', placeholder: '100', max: 500, grupo: 'fijos' },
  { id: 'seguros', label: 'Seguros (salud, hogar, vida, RC profesional)', icono: '🛡️', placeholder: '80', max: 500, grupo: 'fijos' },
  { id: 'otrosFijos', label: 'Otros gastos fijos (suscripciones, deudas...)', icono: '📦', placeholder: '150', max: 2000, grupo: 'fijos' },
  { id: 'herramientas', label: 'Herramientas/software (licencias, hosting...)', icono: '💻', placeholder: '50', max: 500, grupo: 'profesionales' },
  { id: 'coworking', label: 'Coworking/oficina', icono: '🏢', placeholder: '0', max: 500, grupo: 'profesionales' },
  { id: 'otrosPro', label: 'Otros gastos profesionales', icono: '📁', placeholder: '30', max: 500, grupo: 'profesionales' },
];

const COLORES_DONUT = [
  '#2E86AB', '#48A9A6', '#7FB3D3', '#E8A838', '#D35F5F',
  '#8B6FC0', '#5BAE7C', '#C77DBA', '#6B8EC2', '#D4A76A',
];

function getNivel(meses: number): NivelRiesgo {
  if (meses < 2) return 'critico';
  if (meses < 3) return 'insuficiente';
  if (meses < 4) return 'minimo';
  if (meses < 6) return 'bueno';
  return 'excelente';
}

function getNivelInfo(nivel: NivelRiesgo) {
  switch (nivel) {
    case 'critico': return { emoji: '🔴', texto: 'Situacion critica', color: '#D35F5F' };
    case 'insuficiente': return { emoji: '🟠', texto: 'Colchon insuficiente', color: '#E8A838' };
    case 'minimo': return { emoji: '🟡', texto: 'Colchon minimo aceptable', color: '#D4A76A' };
    case 'bueno': return { emoji: '🟢', texto: 'Buen colchon', color: '#5BAE7C' };
    case 'excelente': return { emoji: '💚', texto: 'Colchon excelente', color: '#2E86AB' };
  }
}

function parse(v: string): number {
  return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
}

// --- Componente ---

export default function SimuladorColchonEmergenciaFreelancePage() {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [ahorro, setAhorro] = useState('');

  const updateValor = (id: string, val: string) => {
    setValores(prev => ({ ...prev, [id]: val }));
  };

  // Calculos principales
  const resultados = useMemo(() => {
    const gastosPorId: Record<string, number> = {};
    let gastosMensualesTotal = 0;

    for (const g of GASTOS_CONFIG) {
      const val = parse(valores[g.id] || '');
      gastosPorId[g.id] = val;
      gastosMensualesTotal += val;
    }

    const ahorroDisponible = parse(ahorro);

    if (gastosMensualesTotal <= 0) return null;

    const mesesSupervivencia = ahorroDisponible / gastosMensualesTotal;
    const nivel = getNivel(mesesSupervivencia);
    const objetivo3meses = gastosMensualesTotal * 3;
    const objetivo6meses = gastosMensualesTotal * 6;
    const deficit3 = Math.max(0, objetivo3meses - ahorroDisponible);
    const deficit6 = Math.max(0, objetivo6meses - ahorroDisponible);
    const ahorroMensualPara3 = deficit3 / 12;
    const ahorroMensualPara6 = deficit6 / 12;

    // Proyeccion mes a mes
    const maxMeses = Math.min(Math.ceil(mesesSupervivencia) + 1, 24);
    const proyeccion: ProyeccionMes[] = [];
    for (let i = 1; i <= maxMeses; i++) {
      const restante = Math.max(0, ahorroDisponible - gastosMensualesTotal * i);
      const pct = ahorroDisponible > 0 ? (restante / ahorroDisponible) * 100 : 0;
      proyeccion.push({
        mes: i,
        ahorroRestante: restante,
        porcentaje: pct,
        nivel: getNivel(restante / gastosMensualesTotal),
      });
    }

    // Desglose para donut
    const desglose = GASTOS_CONFIG
      .filter(g => gastosPorId[g.id] > 0)
      .map((g, i) => ({
        id: g.id,
        label: g.label.split(' (')[0],
        icono: g.icono,
        valor: gastosPorId[g.id],
        porcentaje: (gastosPorId[g.id] / gastosMensualesTotal) * 100,
        color: COLORES_DONUT[i % COLORES_DONUT.length],
      }));

    // Mayor gasto
    const mayorGasto = desglose.length > 0
      ? desglose.reduce((a, b) => a.valor > b.valor ? a : b)
      : null;

    return {
      gastosMensualesTotal,
      ahorroDisponible,
      mesesSupervivencia,
      nivel,
      objetivo3meses,
      objetivo6meses,
      deficit3,
      deficit6,
      ahorroMensualPara3,
      ahorroMensualPara6,
      proyeccion,
      desglose,
      mayorGasto,
    };
  }, [valores, ahorro]);

  const gastosFijos = GASTOS_CONFIG.filter(g => g.grupo === 'fijos');
  const gastosPro = GASTOS_CONFIG.filter(g => g.grupo === 'profesionales');

  // Generar gradiente conico para donut CSS
  const donutGradient = useMemo(() => {
    if (!resultados || resultados.desglose.length === 0) return '';
    let acumulado = 0;
    const stops: string[] = [];
    for (const seg of resultados.desglose) {
      stops.push(`${seg.color} ${acumulado}% ${acumulado + seg.porcentaje}%`);
      acumulado += seg.porcentaje;
    }
    if (acumulado < 100) {
      stops.push(`#E5E5E5 ${acumulado}% 100%`);
    }
    return `conic-gradient(${stops.join(', ')})`;
  }, [resultados]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🛡️</span>
          <h1 className={styles.title}>Simulador de Colchon de Emergencia Freelance</h1>
          <p className={styles.subtitle}>
            Calcula cuantos meses puedes sobrevivir sin ingresos con tu ahorro actual
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <div className={styles.mainContent}>
          {/* --- Panel de entrada --- */}
          <div className={styles.inputPanel}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span aria-hidden="true">🏠</span> Gastos mensuales fijos
              </h2>
              <p className={styles.cardDesc}>Lo que pagas si o si cada mes</p>

              <div className={styles.inputGrid}>
                {gastosFijos.map(g => (
                  <div key={g.id} className={styles.formGroup}>
                    <label className={styles.label} htmlFor={g.id}>
                      <span aria-hidden="true">{g.icono}</span> {g.label}
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        id={g.id}
                        type="text"
                        inputMode="decimal"
                        className={styles.input}
                        placeholder={g.placeholder}
                        value={valores[g.id] || ''}
                        onChange={e => updateValor(g.id, e.target.value)}
                        aria-label={g.label}
                      />
                      <span className={styles.inputSuffix}>&#8364;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span aria-hidden="true">💼</span> Gastos profesionales recurrentes
              </h2>

              <div className={styles.inputGrid}>
                {gastosPro.map(g => (
                  <div key={g.id} className={styles.formGroup}>
                    <label className={styles.label} htmlFor={g.id}>
                      <span aria-hidden="true">{g.icono}</span> {g.label}
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        id={g.id}
                        type="text"
                        inputMode="decimal"
                        className={styles.input}
                        placeholder={g.placeholder}
                        value={valores[g.id] || ''}
                        onChange={e => updateValor(g.id, e.target.value)}
                        aria-label={g.label}
                      />
                      <span className={styles.inputSuffix}>&#8364;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span aria-hidden="true">💰</span> Tu colchon actual
              </h2>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="ahorro">
                  Ahorro disponible (liquido, que puedas usar manana)
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="ahorro"
                    type="text"
                    inputMode="decimal"
                    className={styles.input}
                    placeholder="5.000"
                    value={ahorro}
                    onChange={e => setAhorro(e.target.value)}
                    aria-label="Ahorro disponible"
                  />
                  <span className={styles.inputSuffix}>&#8364;</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Panel de resultados --- */}
          <div className={styles.resultsPanel}>
            {!resultados ? (
              <div className={styles.placeholderCard}>
                <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
                <p>Introduce tus gastos mensuales para ver el analisis</p>
              </div>
            ) : (
              <>
                {/* Semaforo principal */}
                <div className={`${styles.semaforoCard} ${styles[resultados.nivel]}`}>
                  <div className={styles.semaforoEmoji} aria-hidden="true">
                    {getNivelInfo(resultados.nivel).emoji}
                  </div>
                  <div className={styles.semaforoMeses}>
                    {formatNumber(resultados.mesesSupervivencia, 1)}
                  </div>
                  <div className={styles.semaforoLabel}>meses de supervivencia</div>
                  <div className={styles.semaforoTexto}>
                    {getNivelInfo(resultados.nivel).texto}
                  </div>
                  <div className={styles.semaforoDetalle}>
                    Gastos totales: {formatCurrency(resultados.gastosMensualesTotal)}/mes
                  </div>
                </div>

                {/* Consejo segun nivel */}
                <div className={`${styles.consejoCard} ${styles[`consejo_${resultados.nivel}`]}`}>
                  {resultados.nivel === 'critico' && (
                    <p><strong>Prioriza construir tu colchon</strong> antes de cualquier otro gasto. Reduce gastos no esenciales y busca ingresos adicionales.</p>
                  )}
                  {resultados.nivel === 'insuficiente' && (
                    <p><strong>Tu colchon no cubre el minimo.</strong> Establece un ahorro automatico mensual y reduce gastos variables hasta alcanzar 3 meses.</p>
                  )}
                  {resultados.nivel === 'minimo' && (
                    <p><strong>Vas por buen camino.</strong> Automatiza un ahorro mensual fijo para pasar de 3 a 6 meses de cobertura.</p>
                  )}
                  {resultados.nivel === 'bueno' && (
                    <p><strong>Tu colchon es solido.</strong> Mantenerlo y considera invertir el excedente por encima de 6 meses.</p>
                  )}
                  {resultados.nivel === 'excelente' && (
                    <p><strong>Excelente gestion financiera.</strong> Con mas de 6 meses cubiertos, puedes invertir el excedente para hacerlo crecer.</p>
                  )}
                </div>

                {/* Proyeccion mes a mes */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    <span aria-hidden="true">📅</span> Proyeccion mes a mes
                  </h3>
                  <div className={styles.proyeccionLista}>
                    {resultados.proyeccion.map(p => (
                      <div key={p.mes} className={styles.proyeccionItem}>
                        <span className={styles.proyeccionMes}>Mes {p.mes}</span>
                        <div className={styles.proyeccionBarraWrapper}>
                          <div
                            className={`${styles.proyeccionBarra} ${styles[p.nivel]}`}
                            style={{ width: `${Math.max(p.porcentaje, 1)}%` }}
                          />
                        </div>
                        <span className={styles.proyeccionValor}>
                          {formatCurrency(p.ahorroRestante)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desglose de gastos (donut CSS) */}
                {resultados.desglose.length > 0 && (
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                      <span aria-hidden="true">📊</span> Desglose de gastos
                    </h3>

                    <div className={styles.donutContainer}>
                      <div
                        className={styles.donut}
                        style={{ background: donutGradient }}
                        role="img"
                        aria-label={`Grafico circular de gastos: ${resultados.desglose.map(d => `${d.label} ${formatNumber(d.porcentaje, 1)}%`).join(', ')}`}
                      >
                        <div className={styles.donutCenter}>
                          <span className={styles.donutTotal}>{formatCurrency(resultados.gastosMensualesTotal)}</span>
                          <span className={styles.donutLabel}>total/mes</span>
                        </div>
                      </div>

                      <div className={styles.leyenda}>
                        {resultados.desglose.map(d => (
                          <div key={d.id} className={styles.leyendaItem}>
                            <span className={styles.leyendaColor} style={{ background: d.color }} />
                            <span className={styles.leyendaTexto}>
                              <span aria-hidden="true">{d.icono}</span> {d.label}
                            </span>
                            <span className={styles.leyendaPct}>
                              {formatNumber(d.porcentaje, 1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {resultados.mayorGasto && (
                      <p className={styles.mayorGastoTexto}>
                        Tu mayor gasto es: <strong><span aria-hidden="true">{resultados.mayorGasto.icono}</span> {resultados.mayorGasto.label}</strong> ({formatNumber(resultados.mayorGasto.porcentaje, 1)}%)
                      </p>
                    )}
                  </div>
                )}

                {/* Objetivos de ahorro */}
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    <span aria-hidden="true">🎯</span> Objetivos de ahorro
                  </h3>

                  {/* Barra progreso 3 meses */}
                  <div className={styles.objetivoBloque}>
                    <div className={styles.objetivoHeader}>
                      <span>Colchon minimo (3 meses)</span>
                      <span className={styles.objetivoValor}>{formatCurrency(resultados.objetivo3meses)}</span>
                    </div>
                    <div className={styles.objetivoBarraFondo}>
                      <div
                        className={`${styles.objetivoBarra} ${resultados.deficit3 === 0 ? styles.objetivoCompleto : ''}`}
                        style={{ width: `${Math.min((resultados.ahorroDisponible / resultados.objetivo3meses) * 100, 100)}%` }}
                      />
                    </div>
                    {resultados.deficit3 > 0 ? (
                      <p className={styles.objetivoTexto}>
                        Te faltan <strong>{formatCurrency(resultados.deficit3)}</strong> para el colchon minimo.
                        Ahorrando {formatCurrency(resultados.ahorroMensualPara3)}/mes, lo alcanzas en 12 meses.
                      </p>
                    ) : (
                      <p className={`${styles.objetivoTexto} ${styles.objetivoLogrado}`}>
                        Objetivo alcanzado
                      </p>
                    )}
                  </div>

                  {/* Barra progreso 6 meses */}
                  <div className={styles.objetivoBloque}>
                    <div className={styles.objetivoHeader}>
                      <span>Colchon recomendado (6 meses)</span>
                      <span className={styles.objetivoValor}>{formatCurrency(resultados.objetivo6meses)}</span>
                    </div>
                    <div className={styles.objetivoBarraFondo}>
                      <div
                        className={`${styles.objetivoBarra} ${resultados.deficit6 === 0 ? styles.objetivoCompleto : ''}`}
                        style={{ width: `${Math.min((resultados.ahorroDisponible / resultados.objetivo6meses) * 100, 100)}%` }}
                      />
                    </div>
                    {resultados.deficit6 > 0 ? (
                      <p className={styles.objetivoTexto}>
                        Te faltan <strong>{formatCurrency(resultados.deficit6)}</strong> para el colchon recomendado.
                        Ahorrando {formatCurrency(resultados.ahorroMensualPara6)}/mes, lo alcanzas en 12 meses.
                      </p>
                    ) : (
                      <p className={`${styles.objetivoTexto} ${styles.objetivoLogrado}`}>
                        Objetivo alcanzado
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DisclaimerCard
          variant="financial"
          severity="high"
          context="simulador-colchon-emergencia-freelance"
        />

        <EducationalSection
          title="Todo sobre el fondo de emergencia freelance"
          subtitle="Por que es imprescindible y como construirlo"
        >
          <section className={styles.guideSection}>
            <h2>Por que 3-6 meses? La regla de oro adaptada al autonomo</h2>
            <p>
              La recomendacion general de finanzas personales es tener un fondo de emergencia de 3 a 6 meses de gastos.
              Para un freelance o autonomo, esta cifra es aun mas critica porque:
            </p>
            <ul>
              <li><strong>No tienes prestacion por desempleo</strong> al cesar la actividad (salvo la prestacion por cese, con requisitos estrictos).</li>
              <li><strong>Los ingresos son irregulares</strong>: un mes facturas mucho, otro casi nada.</li>
              <li><strong>La cuota RETA no para</strong>: aunque no ingreses, sigues pagando Seguridad Social.</li>
              <li><strong>Los impagos existen</strong>: un cliente puede retrasarse meses en pagarte.</li>
            </ul>

            <h2>Fondo de emergencia vs. ahorro para inversion</h2>
            <p>
              Son dos conceptos distintos que no deben mezclarse:
            </p>
            <div className={styles.comparativaGrid}>
              <div className={styles.comparativaCard}>
                <h3><span aria-hidden="true">🛡️</span> Fondo de emergencia</h3>
                <ul>
                  <li>Liquido e inmediato (disponible manana)</li>
                  <li>No se invierte en productos con riesgo</li>
                  <li>Objetivo: cubrir gastos fijos 3-6 meses</li>
                  <li>Se usa solo para emergencias reales</li>
                </ul>
              </div>
              <div className={styles.comparativaCard}>
                <h3><span aria-hidden="true">📈</span> Ahorro para inversion</h3>
                <ul>
                  <li>Puede no ser inmediato (fondos, ETFs...)</li>
                  <li>Acepta cierto riesgo a cambio de rentabilidad</li>
                  <li>Objetivo: hacer crecer el patrimonio</li>
                  <li>Solo cuando ya tienes el colchon cubierto</li>
                </ul>
              </div>
            </div>

            <h2>Que puede causar meses sin ingresos</h2>
            <div className={styles.riesgosGrid}>
              <div className={styles.riesgoCard}>
                <span aria-hidden="true">🏥</span>
                <strong>Enfermedad o baja</strong>
                <p>Una baja medica puede durar semanas o meses. La prestacion de la SS cubre poco y tarda.</p>
              </div>
              <div className={styles.riesgoCard}>
                <span aria-hidden="true">👤</span>
                <strong>Perdida de cliente clave</strong>
                <p>Si un solo cliente supone mas del 50% de tus ingresos, su perdida es devastadora.</p>
              </div>
              <div className={styles.riesgoCard}>
                <span aria-hidden="true">📉</span>
                <strong>Crisis sectorial</strong>
                <p>Tu sector puede sufrir una contraccion que reduzca la demanda durante meses.</p>
              </div>
              <div className={styles.riesgoCard}>
                <span aria-hidden="true">⏳</span>
                <strong>Impago de clientes</strong>
                <p>Un cliente puede tardar 60-90 dias en pagar (o no pagar nunca).</p>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>Donde guardar el fondo de emergencia?</summary>
                <p>
                  El fondo debe estar en productos <strong>liquidos y sin riesgo</strong>: cuenta corriente remunerada,
                  deposito a la vista, o cuenta ahorro con disponibilidad inmediata. Evita fondos de inversion, acciones
                  o criptomonedas para este dinero: necesitas poder acceder a el manana sin perder valor.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Letra del Tesoro como fondo de emergencia?</summary>
                <p>
                  Las Letras del Tesoro son seguras pero no son inmediatas: tienen vencimiento fijo (3, 6, 9 o 12 meses).
                  Puedes usarlas para la parte que sepas que no vas a necesitar a corto plazo, pero mantiene al menos 1-2
                  meses en una cuenta corriente accesible al instante.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Cuanto debo ahorrar cada mes?</summary>
                <p>
                  La recomendacion es destinar al menos un <strong>10-20% de tus ingresos netos</strong> al fondo de
                  emergencia hasta completarlo. Una vez alcanzado el objetivo, ese dinero puede redirigirse a inversion.
                  La clave es automatizarlo: transferencia automatica el dia que cobras.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>Y si ya tengo deudas?</summary>
                <p>
                  Prioriza un mini-colchon de 1 mes de gastos (para no depender de mas credito ante emergencias),
                  y luego ataca las deudas de mayor interes. Una vez libres de deuda con alto interes, construye el
                  colchon completo.
                </p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores comunes que debes evitar</strong>
              </div>
              <ul className={styles.warningList}>
                <li>No confundas ahorro con inversion: el fondo de emergencia NO se invierte en bolsa</li>
                <li>No toques el fondo para caprichos, oportunidades o compras no urgentes</li>
                <li>No olvides la cuota RETA: aunque dejes de facturar, la Seguridad Social sigue cobrando</li>
                <li>Separa siempre la cuenta personal de la profesional para tener vision clara</li>
                <li>Revisa tu colchon al menos cada trimestre y ajusta si tus gastos han cambiado</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-colchon-emergencia-freelance')} />
        <ShareCard appName="simulador-colchon-emergencia-freelance" />
        <Footer appName="simulador-colchon-emergencia-freelance" />
    </div>
  );
}
