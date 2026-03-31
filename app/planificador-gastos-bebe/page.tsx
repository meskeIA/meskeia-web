'use client';

import { useState, useMemo } from 'react';
import styles from './PlanificadorGastosBebe.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  LegalNotice,
} from '@/components';
import { GASTOS_PRIMER_ANO_BEBE } from '@/data/fiscal';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

type NivelGasto = 'min' | 'med' | 'alto';

const NIVEL_LABELS: Record<NivelGasto, string> = {
  min: 'Ajustado',
  med: 'Medio',
  alto: 'Confortable',
};

const SALARIO_MEDIO_ESPANA = 26000;

/** Colores para la barra de distribución (10 categorías) */
const CATEGORY_COLORS = [
  '#2E86AB', '#48A9A6', '#7FB3D3', '#F4A261',
  '#E76F51', '#264653', '#2A9D8F', '#E9C46A',
  '#606C38', '#BC6C25',
];

export default function PlanificadorGastosBebePage(): React.JSX.Element {
  // Estado: nivel seleccionado por cada categoría (índice → nivel)
  const [niveles, setNiveles] = useState<NivelGasto[]>(
    () => GASTOS_PRIMER_ANO_BEBE.map(() => 'med' as NivelGasto)
  );

  /** Devuelve el importe según el nivel para una categoría */
  const getImporte = (idx: number, nivel: NivelGasto): number => {
    const cat = GASTOS_PRIMER_ANO_BEBE[idx];
    if (nivel === 'min') return cat.gastoMinimo;
    if (nivel === 'med') return cat.gastoMedio;
    return cat.gastoAlto;
  };

  /** Total anual */
  const totalAnual = useMemo(
    () => niveles.reduce((sum, nivel, idx) => sum + getImporte(idx, nivel), 0),
    [niveles]
  );

  /** Detectar si hay un nivel global uniforme */
  const nivelGlobal = useMemo<NivelGasto | null>(() => {
    const first = niveles[0];
    return niveles.every((n) => n === first) ? first : null;
  }, [niveles]);

  /** Cambiar nivel de una categoría individual */
  const setNivelCategoria = (idx: number, nivel: NivelGasto) => {
    setNiveles((prev) => {
      const next = [...prev];
      next[idx] = nivel;
      return next;
    });
  };

  /** Cambiar todas las categorías al mismo nivel */
  const setNivelGlobal = (nivel: NivelGasto) => {
    setNiveles(GASTOS_PRIMER_ANO_BEBE.map(() => nivel));
  };

  /** Totales por nivel para la tabla comparativa */
  const totalAjustado = GASTOS_PRIMER_ANO_BEBE.reduce((s, c) => s + c.gastoMinimo, 0);
  const totalMedio = GASTOS_PRIMER_ANO_BEBE.reduce((s, c) => s + c.gastoMedio, 0);
  const totalConfortable = GASTOS_PRIMER_ANO_BEBE.reduce((s, c) => s + c.gastoAlto, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🍼</span> Planificador de Gastos del Primer Año del Bebé
          </h1>
          <p className={styles.subtitle}>
            Estima cuánto cuesta el primer año de tu bebé en España con 10 categorías de gasto
          </p>
        </header>

        <LegalNotice />

        {/* Disclaimer */}
        <DisclaimerCard
          variant="general"
          severity="medium"
          context="planificador-gastos-bebe"
          collapsible={true}
        >
          Los importes mostrados son estimaciones medias para España 2025. Los gastos reales
          varían según la zona, estilo de vida y opciones personales. Esta herramienta es una
          ayuda de planificación, no un presupuesto exacto.
        </DisclaimerCard>

        {/* Selector global */}
        <div className={styles.globalSelector}>
          <h2>
            <span aria-hidden="true">🎚️</span> Nivel de gasto global
          </h2>
          <div className={styles.levelButtons} role="group" aria-label="Selector de nivel de gasto global">
            {(['min', 'med', 'alto'] as NivelGasto[]).map((nivel) => (
              <button
                type="button"
                key={nivel}
                className={nivelGlobal === nivel ? styles.levelBtnActive : styles.levelBtn}
                onClick={() => setNivelGlobal(nivel)}
                aria-pressed={nivelGlobal === nivel ? 'true' : 'false'}
              >
                {NIVEL_LABELS[nivel]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de categorías */}
        <div className={styles.categoriesGrid}>
          {GASTOS_PRIMER_ANO_BEBE.map((cat, idx) => {
            const nivelActual = niveles[idx];
            const importe = getImporte(idx, nivelActual);

            return (
              <div key={cat.categoria} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon} aria-hidden="true">
                    {cat.icono}
                  </span>
                  <span className={styles.categoryName}>{cat.categoria}</span>
                </div>

                <div
                  className={styles.categoryLevels}
                  role="group"
                  aria-label={`Nivel de gasto para ${cat.categoria}`}
                >
                  {(['min', 'med', 'alto'] as NivelGasto[]).map((nivel) => (
                    <button
                      type="button"
                      key={nivel}
                      className={
                        nivelActual === nivel
                          ? styles.catLevelBtnActive
                          : styles.catLevelBtn
                      }
                      onClick={() => setNivelCategoria(idx, nivel)}
                      aria-pressed={nivelActual === nivel ? 'true' : 'false'}
                    >
                      {NIVEL_LABELS[nivel]}
                    </button>
                  ))}
                </div>

                <div className={styles.categoryAmount}>{formatCurrency(importe)}</div>
                <p className={styles.categoryNota}>{cat.nota}</p>
              </div>
            );
          })}
        </div>

        {/* Panel resumen */}
        <section className={styles.summaryPanel} aria-label="Resumen de gastos estimados">
          <h2 className={styles.summaryTitle}>
            <span aria-hidden="true">📊</span> Resumen de gastos estimados
          </h2>

          <div className={styles.summaryTotals}>
            <div className={styles.totalItem}>
              <span className={styles.totalLabel}>Total anual estimado</span>
              <span className={styles.totalValue}>{formatCurrency(totalAnual)}</span>
            </div>
            <div className={styles.totalItem}>
              <span className={styles.totalLabel}>Total mensual estimado</span>
              <span className={styles.totalValueSmall}>
                {formatCurrency(totalAnual / 12)}
              </span>
            </div>
          </div>

          {/* Barra de distribución */}
          <h3 className={styles.distributionTitle}>Distribución por categoría</h3>
          <div className={styles.distributionBar} role="img" aria-label="Barra de distribución de gastos por categoría">
            {GASTOS_PRIMER_ANO_BEBE.map((cat, idx) => {
              const importe = getImporte(idx, niveles[idx]);
              const pct = totalAnual > 0 ? (importe / totalAnual) * 100 : 0;
              return (
                <div
                  key={cat.categoria}
                  className={styles.distributionSegment}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: CATEGORY_COLORS[idx],
                  }}
                  title={`${cat.categoria}: ${formatCurrency(importe)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>
          <div className={styles.distributionLegend}>
            {GASTOS_PRIMER_ANO_BEBE.map((cat, idx) => (
              <span key={cat.categoria} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: CATEGORY_COLORS[idx] }}
                />
                {cat.icono} {cat.categoria.split(' ')[0]}
              </span>
            ))}
          </div>

          {/* Comparativa salario medio */}
          <div className={styles.salaryComparison}>
            Esto equivale al{' '}
            <span className={styles.salaryPercent}>
              {((totalAnual / SALARIO_MEDIO_ESPANA) * 100).toFixed(1).replace('.', ',')} %
            </span>{' '}
            del salario medio español ({formatCurrency(SALARIO_MEDIO_ESPANA)}/año)
          </div>
        </section>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre los gastos del primer año"
          subtitle="Consejos prácticos, escenarios y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2>Consejos para reducir gastos sin sacrificar calidad</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <h4><span aria-hidden="true">♻️</span> Segunda mano</h4>
                <p>
                  Cochecitos, cunas y ropa de segunda mano pueden ahorrar entre un 40% y un 70%.
                  Los bebés usan las cosas pocos meses, así que suelen estar en buen estado.
                </p>
              </div>
              <div className={styles.tipCard}>
                <h4><span aria-hidden="true">🤱</span> Lactancia materna</h4>
                <p>
                  La lactancia materna exclusiva los primeros 6 meses puede ahorrar entre 500 € y
                  1.000 € en leche de fórmula. Además, tiene beneficios de salud para madre e hijo.
                </p>
              </div>
              <div className={styles.tipCard}>
                <h4><span aria-hidden="true">🏛️</span> Recursos públicos</h4>
                <p>
                  Varias comunidades autónomas ofrecen guardería pública gratuita (0-3 años),
                  cheque bebé, o ayudas directas. Consulta los servicios sociales de tu municipio.
                </p>
              </div>
              <div className={styles.tipCard}>
                <h4><span aria-hidden="true">🧷</span> Pañales a granel</h4>
                <p>
                  Comprar pañales en packs grandes o marcas blancas reduce el coste entre un 20%
                  y un 40%. Los pañales reutilizables son más económicos a largo plazo.
                </p>
              </div>
            </div>

            <h2>Comparativa por nivel de gasto</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparisonTable}>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Total anual</th>
                    <th>Total mensual</th>
                    <th>% salario medio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ajustado</td>
                    <td>{formatCurrency(totalAjustado)}</td>
                    <td>{formatCurrency(totalAjustado / 12)}</td>
                    <td>
                      {((totalAjustado / SALARIO_MEDIO_ESPANA) * 100)
                        .toFixed(1)
                        .replace('.', ',')} %
                    </td>
                  </tr>
                  <tr>
                    <td>Medio</td>
                    <td>{formatCurrency(totalMedio)}</td>
                    <td>{formatCurrency(totalMedio / 12)}</td>
                    <td>
                      {((totalMedio / SALARIO_MEDIO_ESPANA) * 100)
                        .toFixed(1)
                        .replace('.', ',')} %
                    </td>
                  </tr>
                  <tr>
                    <td>Confortable</td>
                    <td>{formatCurrency(totalConfortable)}</td>
                    <td>{formatCurrency(totalConfortable / 12)}</td>
                    <td>
                      {((totalConfortable / SALARIO_MEDIO_ESPANA) * 100)
                        .toFixed(1)
                        .replace('.', ',')} %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>4 escenarios reales</h2>
            <div className={styles.scenarioGrid}>
              <div className={styles.scenarioCard}>
                <h4><span aria-hidden="true">👶</span> Primer hijo estándar</h4>
                <p>
                  Todo nuevo, guardería privada medio día, pediatra de la SS pública, marca
                  blanca en pañales y alimentación.
                </p>
                <p className={styles.scenarioTotal}>{formatCurrency(totalMedio)}/año</p>
              </div>
              <div className={styles.scenarioCard}>
                <h4><span aria-hidden="true">👯</span> Gemelos</h4>
                <p>
                  Doble en pañales, alimentación y ropa. La cuna y el cochecito pueden ser
                  gemelar (más caro que uno simple, pero menos que dos).
                </p>
                <p className={styles.scenarioTotal}>
                  {formatCurrency(Math.round(totalMedio * 1.7))}/año aprox.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <h4><span aria-hidden="true">♻️</span> Todo segunda mano</h4>
                <p>
                  Ropa heredada, cuna y cochecito de segunda mano, lactancia materna,
                  guardería pública o familiar, sin seguro privado.
                </p>
                <p className={styles.scenarioTotal}>{formatCurrency(totalAjustado)}/año</p>
              </div>
              <div className={styles.scenarioCard}>
                <h4><span aria-hidden="true">💎</span> Premium</h4>
                <p>
                  Marcas premium en todo, guardería bilingüe privada, seguro médico completo,
                  juguetes Montessori, ropa de marca.
                </p>
                <p className={styles.scenarioTotal}>{formatCurrency(totalConfortable)}/año</p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>

            <div className={styles.faqItem}>
              <h4>¿Cuál es la mayor partida de gasto?</h4>
              <p>
                Con diferencia, la guardería o escuela infantil. Si usas guardería privada,
                puede suponer entre el 40% y el 50% del gasto total anual. Si optas por
                guardería pública gratuita o cuidado familiar, el gasto se reduce drásticamente.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo ahorrar en pañales?</h4>
              <p>
                Comprar en grandes cantidades (packs de 150+), elegir marcas blancas de
                supermercados (calidad similar a un tercio del precio), y considerar pañales
                reutilizables modernos que se lavan en lavadora. La inversión inicial se
                amortiza en 3-4 meses.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Es necesaria la guardería el primer año?</h4>
              <p>
                No es obligatoria. Depende de la situación laboral y familiar. Opciones
                alternativas: permisos de paternidad/maternidad (16 semanas cada uno),
                excedencia por cuidado de hijo, abuelos, o combinación de jornada reducida
                y cuidado compartido.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Hay ayudas públicas para familias con bebé?</h4>
              <p>
                Sí: deducción por maternidad IRPF (1.200 €/año), prestaciones por nacimiento
                de la SS, cheques bebé autonómicos y municipales, deducciones por familia
                numerosa, y en algunas CCAA guardería pública gratuita 0-3 años.
              </p>
            </div>

            <div className={styles.warningBox}>
              <h4><span aria-hidden="true">⚠️</span> Gastos ocultos que se suelen olvidar</h4>
              <ul>
                <li>
                  <strong>Adaptación del hogar:</strong> protectores de enchufes, barreras de
                  escalera, cubre esquinas, intercomunicador — entre 100 € y 300 €.
                </li>
                <li>
                  <strong>Aumento del consumo doméstico:</strong> más lavadoras, más
                  calefacción, más agua caliente — entre 30 € y 60 €/mes extra.
                </li>
                <li>
                  <strong>Fotografía profesional:</strong> sesiones de recién nacido, smash
                  cake, etc. — entre 100 € y 400 € por sesión.
                </li>
                <li>
                  <strong>Regalos y celebraciones:</strong> bautizo/presentación, primer
                  cumpleaños — variables pero fácilmente 200-500 €.
                </li>
                <li>
                  <strong>Pérdida de ingresos:</strong> si un progenitor reduce jornada o pide
                  excedencia, el impacto puede superar el coste directo del bebé.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('planificador-gastos-bebe')} />
        <ShareCard appName="planificador-gastos-bebe" />
        <Footer appName="planificador-gastos-bebe" />
      </div>
    </>
  );
}
