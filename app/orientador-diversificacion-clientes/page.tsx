'use client';

import { useState, useMemo, useCallback } from 'react';
import styles from './OrientadorDiversificacionClientes.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

/* ─── Tipos ─── */

interface Cliente {
  id: number;
  nombre: string;
  porcentaje: string;
}

interface EscenarioComparativo {
  nombre: string;
  numClientes: number;
  hhi: number;
  nivel: string;
  color: string;
}

/* ─── Constantes ─── */

const MAX_CLIENTES = 15;
const COLORES_SEGMENTOS = [
  '#2E86AB', '#48A9A6', '#7FB3D3', '#E8A87C', '#D4726A',
  '#C38D9E', '#41B3A3', '#E27D60', '#85DCB0', '#659DBD',
  '#F6D55C', '#3CAEA3', '#ED553B', '#20639B', '#173F5F',
];

let contadorId = 4;

/* ─── Funciones de cálculo ─── */

function calcularHHI(porcentajes: number[]): number {
  return porcentajes.reduce((sum, p) => sum + Math.pow(p, 2), 0);
}

function nivelConcentracion(hhi: number): { texto: string; color: string; emoji: string } {
  if (hhi < 1500) return { texto: 'Diversificado', color: '#28a745', emoji: '🟢' };
  if (hhi < 2500) return { texto: 'Moderadamente concentrado', color: '#ffc107', emoji: '🟡' };
  if (hhi < 5000) return { texto: 'Altamente concentrado', color: '#fd7e14', emoji: '🟠' };
  return { texto: 'Peligrosamente concentrado', color: '#dc3545', emoji: '🔴' };
}

function obtenerEstrategias(hhi: number, clienteDominantePct: number): string[] {
  const estrategias: string[] = [];

  if (hhi >= 5000) {
    estrategias.push(
      'Busca activamente 2-3 clientes nuevos que representen al menos un 15% cada uno de tus ingresos.',
      'Establece un plan de captación con dedicación semanal mínima de 5 horas.',
      'Diversifica por sector: busca clientes en industrias diferentes a tu cliente principal.',
    );
  } else if (hhi >= 2500) {
    estrategias.push(
      'Tu situación es aceptable pero vulnerable. Intenta que ningún cliente supere el 40% de tus ingresos.',
      'Desarrolla al menos un servicio complementario que atraiga a un perfil de cliente diferente.',
      'Negocia contratos de retainer con 2-3 clientes pequeños para estabilizar ingresos.',
    );
  } else if (hhi >= 1500) {
    estrategias.push(
      'Vas por buen camino. Mantén el equilibrio y vigila que ningún cliente crezca desproporcionadamente.',
      'Revisa trimestralmente la distribución de ingresos por cliente.',
      'Fideliza a los clientes medianos: son tu mejor protección contra la concentración.',
    );
  } else {
    estrategias.push(
      'Cartera bien diversificada. Mantén este equilibrio revisando la distribución periódicamente.',
      'Enfócate en la rentabilidad de cada cliente, no solo en la diversificación.',
      'Considera eliminar clientes poco rentables para optimizar tu tiempo.',
    );
  }

  if (clienteDominantePct > 75) {
    estrategias.unshift(
      'URGENTE: Reduce la dependencia de tu cliente principal por debajo del 75% lo antes posible para evitar ser considerado TRADE.',
    );
  } else if (clienteDominantePct > 50) {
    estrategias.unshift(
      'Prioridad: reduce la cuota de tu cliente principal por debajo del 50%. Deriva parte de su trabajo si es posible.',
    );
  }

  return estrategias;
}

/* ─── Componente ─── */

export default function OrientadorDiversificacionClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, nombre: '', porcentaje: '' },
    { id: 2, nombre: '', porcentaje: '' },
    { id: 3, nombre: '', porcentaje: '' },
  ]);

  const agregarCliente = useCallback(() => {
    if (clientes.length >= MAX_CLIENTES) return;
    setClientes((prev) => [...prev, { id: contadorId++, nombre: '', porcentaje: '' }]);
  }, [clientes.length]);

  const eliminarCliente = useCallback((id: number) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const actualizarCliente = useCallback((id: number, campo: 'nombre' | 'porcentaje', valor: string) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c))
    );
  }, []);

  /* ─── Cálculos derivados ─── */

  const clientesValidos = useMemo(() => {
    return clientes
      .map((c) => ({
        ...c,
        pct: parseFloat(c.porcentaje.replace(',', '.')) || 0,
      }))
      .filter((c) => c.pct > 0);
  }, [clientes]);

  const sumaTotal = useMemo(() => {
    return clientesValidos.reduce((sum, c) => sum + c.pct, 0);
  }, [clientesValidos]);

  const hayDatosSuficientes = clientesValidos.length >= 2 && Math.abs(sumaTotal - 100) < 0.5;

  const hhi = useMemo(() => {
    if (!hayDatosSuficientes) return 0;
    return calcularHHI(clientesValidos.map((c) => c.pct));
  }, [clientesValidos, hayDatosSuficientes]);

  const nivel = useMemo(() => nivelConcentracion(hhi), [hhi]);

  const clienteDominante = useMemo(() => {
    if (clientesValidos.length === 0) return null;
    return clientesValidos.reduce((max, c) => (c.pct > max.pct ? c : max));
  }, [clientesValidos]);

  const riesgoTRADE = clienteDominante ? clienteDominante.pct > 75 : false;

  const escenarios = useMemo((): EscenarioComparativo[] => {
    if (!hayDatosSuficientes || !clienteDominante) return [];

    const porcentajes = clientesValidos.map((c) => c.pct);
    const n = porcentajes.length;

    // Actual
    const hhiActual = calcularHHI(porcentajes);
    const nivelActual = nivelConcentracion(hhiActual);

    // Ideal (equitativa)
    const pctIdeal = 100 / n;
    const hhiIdeal = calcularHHI(Array(n).fill(pctIdeal));
    const nivelIdeal = nivelConcentracion(hhiIdeal);

    // Sin cliente principal
    const sinPrincipal = porcentajes.filter((_, i) => clientesValidos[i].id !== clienteDominante.id);
    let hhiSinPrincipal = 0;
    let nivelSinPrincipal = nivelConcentracion(0);
    if (sinPrincipal.length > 0) {
      const totalSin = sinPrincipal.reduce((a, b) => a + b, 0);
      const reajustadas = sinPrincipal.map((p) => (p / totalSin) * 100);
      hhiSinPrincipal = calcularHHI(reajustadas);
      nivelSinPrincipal = nivelConcentracion(hhiSinPrincipal);
    }

    return [
      {
        nombre: 'Tu cartera actual',
        numClientes: n,
        hhi: hhiActual,
        nivel: nivelActual.texto,
        color: nivelActual.color,
      },
      {
        nombre: `Distribución ideal (${n} clientes equitativos)`,
        numClientes: n,
        hhi: hhiIdeal,
        nivel: nivelIdeal.texto,
        color: nivelIdeal.color,
      },
      {
        nombre: `Sin ${clienteDominante.nombre || 'cliente principal'}`,
        numClientes: n - 1,
        hhi: hhiSinPrincipal,
        nivel: nivelSinPrincipal.texto,
        color: nivelSinPrincipal.color,
      },
    ];
  }, [hayDatosSuficientes, clientesValidos, clienteDominante]);

  /* ─── Donut CSS ─── */

  const donutGradient = useMemo(() => {
    if (!hayDatosSuficientes) return 'conic-gradient(#E5E5E5 0deg, #E5E5E5 360deg)';
    let acumulado = 0;
    const segmentos: string[] = [];
    clientesValidos.forEach((c, i) => {
      const color = COLORES_SEGMENTOS[i % COLORES_SEGMENTOS.length];
      const inicio = acumulado;
      acumulado += (c.pct / 100) * 360;
      segmentos.push(`${color} ${inicio}deg ${acumulado}deg`);
    });
    return `conic-gradient(${segmentos.join(', ')})`;
  }, [clientesValidos, hayDatosSuficientes]);

  /* ─── Espectro HHI ─── */

  const posicionEspectro = useMemo(() => {
    // HHI va de 0 a 10000, mapeamos a 0-100%
    return Math.min((hhi / 10000) * 100, 100);
  }, [hhi]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">📊</span> Orientador de Diversificación de Clientes</h1>
          <p className={styles.subtitle}>
            Analiza la concentración de tu cartera y detecta riesgos de dependencia excesiva
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}><span aria-hidden="true">🔒</span> Todo en tu navegador</span>
            <span className={styles.badge}><span aria-hidden="true">📊</span> Índice HHI</span>
            <span className={styles.badge}><span aria-hidden="true">⚖️</span> Alerta TRADE</span>
          </div>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="financial"
          severity="high"
          context="orientador-diversificacion-clientes"
        />

        {/* ─── Lista de clientes ─── */}
        <section className={styles.inputSection}>
          <h2 className={styles.sectionTitle}>Tus clientes</h2>
          <p className={styles.sectionSubtitle}>
            Introduce un nombre genérico y el porcentaje de ingresos que representa cada cliente.
            Los datos NO salen de tu navegador.
          </p>

          <div className={styles.clientesList}>
            {clientes.map((cliente, index) => (
              <div key={cliente.id} className={styles.clienteRow}>
                <span className={styles.clienteIndex}>{index + 1}</span>
                <input
                  type="text"
                  className={styles.inputNombre}
                  value={cliente.nombre}
                  onChange={(e) => actualizarCliente(cliente.id, 'nombre', e.target.value)}
                  placeholder={`Cliente ${String.fromCharCode(65 + index)}`}
                  maxLength={30}
                  inputMode="text"
                  aria-label={`Nombre del cliente ${index + 1}`}
                />
                <div className={styles.inputPctWrapper}>
                  <input
                    type="text"
                    className={styles.inputPct}
                    value={cliente.porcentaje}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9,.]/g, '');
                      actualizarCliente(cliente.id, 'porcentaje', val);
                    }}
                    placeholder="25"
                    inputMode="decimal"
                    aria-label={`Porcentaje de ingresos del cliente ${index + 1}`}
                  />
                  <span className={styles.pctSymbol}>%</span>
                </div>
                {clientes.length > 2 && (
                  <button
                    type="button"
                    className={styles.btnEliminar}
                    onClick={() => eliminarCliente(cliente.id)}
                    aria-label={`Eliminar cliente ${cliente.nombre || index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.controlsRow}>
            {clientes.length < MAX_CLIENTES && (
              <button type="button" className={styles.btnAgregar} onClick={agregarCliente}>
                + Añadir cliente
              </button>
            )}
            <div
              className={`${styles.sumaBadge} ${
                Math.abs(sumaTotal - 100) < 0.5
                  ? styles.sumaOk
                  : sumaTotal > 0
                    ? styles.sumaError
                    : ''
              }`}
              role="status"
              aria-live="polite"
            >
              Total: {formatNumber(sumaTotal, 1)}%
              {sumaTotal > 0 && Math.abs(sumaTotal - 100) >= 0.5 && (
                <span className={styles.sumaAviso}> (debe sumar 100%)</span>
              )}
            </div>
          </div>
        </section>

        {/* ─── Resultados ─── */}
        {hayDatosSuficientes && (
          <section className={styles.resultSection} aria-live="polite">
            {/* Panel HHI principal */}
            <div className={styles.hhiPanel}>
              <h2 className={styles.sectionTitle}>Índice de Concentración (HHI)</h2>
              <div className={styles.hhiValor} style={{ color: nivel.color }}>
                {formatNumber(hhi, 0)}
              </div>
              <div className={styles.hhiEtiqueta} style={{ color: nivel.color }}>
                <span aria-hidden="true">{nivel.emoji}</span> {nivel.texto}
              </div>

              {/* Espectro HHI */}
              <div className={styles.espectro} aria-label={`Índice HHI: ${formatNumber(hhi, 0)} de 10.000`}>
                <div className={styles.espectroBar}>
                  <div
                    className={styles.espectroMarcador}
                    style={{ left: `${posicionEspectro}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.espectroLabels}>
                  <span>0</span>
                  <span>1.500</span>
                  <span>2.500</span>
                  <span>5.000</span>
                  <span>10.000</span>
                </div>
              </div>
            </div>

            {/* Alerta TRADE */}
            {riesgoTRADE && clienteDominante && (
              <div className={styles.alertaTRADE} role="alert">
                <h3 className={styles.alertaTRADETitulo}>
                  <span aria-hidden="true">⚠️</span> Riesgo de falso autónomo
                </h3>
                <p>
                  El <strong>{formatNumber(clienteDominante.pct, 1)}%</strong> de tus ingresos depende de{' '}
                  <strong>{clienteDominante.nombre || 'tu cliente principal'}</strong>.
                  Si supera el 75%, podrías ser considerado <strong>TRADE</strong> (Trabajador Autónomo
                  Económicamente Dependiente, art. 11 LETA).
                </p>
                <div className={styles.alertaDetalles}>
                  <h4>Implicaciones legales del TRADE:</h4>
                  <ul>
                    <li>Registro obligatorio en el SEPE del contrato de TRADE</li>
                    <li>Contrato escrito obligatorio con el cliente dominante</li>
                    <li>Derecho a indemnización por extinción injustificada del contrato</li>
                    <li>Jornada máxima pactada y derecho a vacaciones (18 días hábiles)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Donut de distribución */}
            <div className={styles.donutSection}>
              <h3 className={styles.subsectionTitle}>Distribución de ingresos</h3>
              <div className={styles.donutContainer}>
                <div
                  className={styles.donut}
                  style={{ background: donutGradient }}
                  aria-label="Gráfico circular de distribución de clientes"
                  role="img"
                >
                  <div className={styles.donutCenter}>
                    <span className={styles.donutCenterNum}>{clientesValidos.length}</span>
                    <span className={styles.donutCenterLabel}>clientes</span>
                  </div>
                </div>
                <ul className={styles.leyenda}>
                  {clientesValidos.map((c, i) => (
                    <li key={c.id} className={styles.leyendaItem}>
                      <span
                        className={styles.leyendaColor}
                        style={{ backgroundColor: COLORES_SEGMENTOS[i % COLORES_SEGMENTOS.length] }}
                        aria-hidden="true"
                      />
                      <span className={styles.leyendaNombre}>
                        {c.nombre || `Cliente ${String.fromCharCode(65 + i)}`}
                      </span>
                      <span className={styles.leyendaPct}>{formatNumber(c.pct, 1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Panel comparativo */}
            {escenarios.length > 0 && (
              <div className={styles.comparativoPanel}>
                <h3 className={styles.subsectionTitle}>Escenarios comparativos</h3>
                <div className={styles.tablaWrapper}>
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th>Escenario</th>
                        <th>Clientes</th>
                        <th>HHI</th>
                        <th>Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escenarios.map((esc, i) => (
                        <tr key={i} className={i === 0 ? styles.filaActual : ''}>
                          <td>{esc.nombre}</td>
                          <td className={styles.tdCenter}>{esc.numClientes}</td>
                          <td className={styles.tdCenter}>{formatNumber(esc.hhi, 0)}</td>
                          <td>
                            <span className={styles.nivelBadge} style={{ backgroundColor: esc.color }}>
                              {esc.nivel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Estrategias */}
            <div className={styles.estrategiasPanel}>
              <h3 className={styles.subsectionTitle}>
                <span aria-hidden="true">🎯</span> Estrategias de diversificación
              </h3>
              <ul className={styles.estrategiasList}>
                {obtenerEstrategias(hhi, clienteDominante?.pct || 0).map((est, i) => (
                  <li key={i} className={styles.estrategiaItem}>{est}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ─── Contenido educativo ─── */}
        <EducationalSection
          title="📚 Concentración de clientes y el índice HHI"
          subtitle="Conceptos clave, legislación TRADE y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el índice HHI?</h2>
            <p>
              El <strong>índice Herfindahl-Hirschman (HHI)</strong> es una medida de concentración
              que se usa habitualmente en economía para evaluar la competencia en un mercado. Se
              calcula sumando los cuadrados de las cuotas de cada participante.
            </p>
            <p>
              Aplicado a tu cartera de clientes: si tienes 4 clientes que representan el 50%, 25%,
              15% y 10% de tus ingresos, tu HHI sería 50² + 25² + 15² + 10² = 2.500 + 625 + 225 + 100
              = <strong>3.450</strong> (altamente concentrado).
            </p>
            <p>
              Si esos mismos 4 clientes estuvieran repartidos al 25% cada uno, el HHI sería
              4 × 25² = 4 × 625 = <strong>2.500</strong> (el mínimo posible para 4 clientes).
            </p>

            <div className={styles.tablaEducativa}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>HHI</th>
                    <th>Nivel</th>
                    <th>Ejemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>&lt; 1.500</td>
                    <td>Diversificado</td>
                    <td>7 clientes al ~14% cada uno</td>
                  </tr>
                  <tr>
                    <td>1.500 - 2.500</td>
                    <td>Moderado</td>
                    <td>4 clientes al 25% cada uno</td>
                  </tr>
                  <tr>
                    <td>2.500 - 5.000</td>
                    <td>Alto</td>
                    <td>1 al 50%, 2 al 25%</td>
                  </tr>
                  <tr>
                    <td>&gt; 5.000</td>
                    <td>Peligroso</td>
                    <td>1 al 70%, 1 al 30%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>¿Qué es un TRADE?</h2>
            <p>
              El <strong>Trabajador Autónomo Económicamente Dependiente (TRADE)</strong> es una
              figura regulada por el <strong>artículo 11 de la Ley 20/2007 del Estatuto del Trabajo
              Autónomo (LETA)</strong>. Se considera TRADE al autónomo que recibe al menos el 75%
              de sus ingresos de un solo cliente.
            </p>
            <p>
              Ser TRADE no es ilegal, pero conlleva obligaciones para ambas partes: contrato
              escrito, registro en el SEPE, jornada pactada, vacaciones mínimas (18 días hábiles)
              y derecho a indemnización por extinción injustificada.
            </p>

            <h2>Preguntas frecuentes</h2>

            <h3>¿Cuántos clientes necesito para estar diversificado?</h3>
            <p>
              No hay un número mágico, pero como referencia: con 5-7 clientes bien repartidos
              (ninguno por encima del 25-30%) tu HHI estará por debajo de 2.500 y tendrás una
              cartera razonablemente diversificada. Más importante que la cantidad es que ninguno
              domine excesivamente.
            </p>

            <h3>¿Es malo tener un cliente grande?</h3>
            <p>
              No necesariamente. Un cliente grande puede ser muy rentable y ofrecer estabilidad.
              El problema aparece cuando ese cliente se convierte en tu <em>única</em> fuente
              relevante de ingresos. La regla práctica: un cliente grande es una ventaja;
              depender de él es un riesgo.
            </p>

            <h3>¿Qué pasa si soy TRADE y no me he registrado?</h3>
            <p>
              Si cumples los requisitos objetivos de TRADE (75% de ingresos de un solo cliente)
              pero no tienes contrato de TRADE registrado, tu cliente podría estar incumpliendo
              la ley. En caso de extinción de la relación, podrías reclamar la indemnización
              prevista en la LETA. Es recomendable regularizar la situación.
            </p>

            <h3>¿Debo registrarme como TRADE?</h3>
            <p>
              Si cumples los requisitos, sí. El registro te protege legalmente: accedes a derechos
              laborales adicionales (vacaciones, jornada, indemnización). No registrarte no te
              exime de la condición de TRADE, pero sí dificulta reclamar tus derechos.
            </p>

            <h2>Consejos prácticos</h2>
            <ul>
              <li>Diversifica canales de captación: no dependas solo de un método (referencias, LinkedIn, etc.).</li>
              <li>No aceptes exclusividad sin compensación económica clara por ello.</li>
              <li>Renegocia anualmente: revisa tarifas y condiciones con cada cliente.</li>
              <li>Crea un fondo de emergencia equivalente a 3-6 meses de gastos fijos.</li>
            </ul>

            <div className={styles.warningBox}>
              <strong>Importante:</strong> No confundas facturación con dependencia real. Un cliente
              puede representar el 40% de tu facturación pero solo el 20% de tu tiempo si es un
              proyecto de alto valor. Considera también el tipo de relación (proyecto puntual vs.
              retainer permanente), la facilidad de sustitución y tu poder de negociación real.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('orientador-diversificacion-clientes')} />
        <ShareCard appName="orientador-diversificacion-clientes" />
        <Footer appName="orientador-diversificacion-clientes" />
    </div>
  );
}
