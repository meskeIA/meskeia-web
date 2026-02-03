'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../CursoInversion.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

interface Term {
  term: string;
  letter: string;
  definition: string;
  example?: string;
}

const GLOSSARY_TERMS: Term[] = [
  // A
  { term: 'Acción', letter: 'A', definition: 'Título valor que representa una parte proporcional del capital social de una empresa. Al poseer acciones, te conviertes en copropietario de la compañía con derecho a dividendos y voto.', example: 'Si compras 100 acciones de Telefónica, posees una pequeña fracción de la empresa.' },
  { term: 'Asset Allocation', letter: 'A', definition: 'Estrategia de distribución de inversiones entre diferentes clases de activos (acciones, bonos, efectivo) para optimizar la relación riesgo-rendimiento según el perfil del inversor.', example: 'Una cartera 60/40 tiene 60% en renta variable y 40% en renta fija.' },
  { term: 'Apalancamiento', letter: 'A', definition: 'Uso de deuda para aumentar la capacidad de inversión. Amplifica tanto ganancias como pérdidas potenciales.', example: 'Invertir 10.000€ con un apalancamiento 2x es como invertir 20.000€.' },
  // B
  { term: 'Benchmark', letter: 'B', definition: 'Índice de referencia contra el cual se compara el rendimiento de una inversión o cartera.', example: 'El benchmark típico para renta variable global es el MSCI World.' },
  { term: 'Beta', letter: 'B', definition: 'Medida de la volatilidad de un activo respecto al mercado. Beta=1 significa que se mueve igual que el mercado; >1 es más volátil; <1 es menos volátil.' },
  { term: 'Blue Chip', letter: 'B', definition: 'Acciones de empresas grandes, establecidas y financieramente sólidas con historial de dividendos estables.', example: 'Apple, Microsoft, BBVA son consideradas blue chips.' },
  { term: 'Bono', letter: 'B', definition: 'Instrumento de deuda emitido por gobiernos o empresas. El inversor presta dinero a cambio de intereses periódicos y devolución del principal al vencimiento.' },
  // C
  { term: 'Capitalización bursátil', letter: 'C', definition: 'Valor total de mercado de una empresa, calculado como precio de la acción × número de acciones en circulación.', example: 'Una empresa con 1 millón de acciones a 50€ tiene capitalización de 50 millones €.' },
  { term: 'Comisión de gestión', letter: 'C', definition: 'Porcentaje anual que cobra un fondo por gestionar el dinero de los partícipes. Reduce directamente la rentabilidad.', example: 'Un fondo con comisión 1,5% anual restará ese porcentaje a tu rentabilidad.' },
  { term: 'Correlación', letter: 'C', definition: 'Medida estadística (-1 a +1) que indica cómo se mueven dos activos entre sí. Correlación baja mejora la diversificación.' },
  { term: 'Cupón', letter: 'C', definition: 'Interés periódico que paga un bono, expresado como porcentaje del valor nominal.' },
  // D
  { term: 'DCA (Dollar-Cost Averaging)', letter: 'D', definition: 'Estrategia de invertir cantidades fijas de forma periódica, independientemente del precio, para promediar el coste de compra.' },
  { term: 'Derivado', letter: 'D', definition: 'Instrumento financiero cuyo valor deriva de otro activo subyacente (acciones, índices, materias primas). Incluye opciones, futuros y swaps.' },
  { term: 'Diversificación', letter: 'D', definition: 'Estrategia de distribuir inversiones entre diferentes activos para reducir el riesgo específico sin sacrificar rentabilidad esperada.' },
  { term: 'Dividendo', letter: 'D', definition: 'Parte de los beneficios de una empresa que se distribuye a los accionistas, generalmente de forma trimestral o anual.' },
  { term: 'Drawdown', letter: 'D', definition: 'Caída desde un máximo hasta un mínimo. Mide la pérdida máxima experimentada en un período.', example: 'Un drawdown del 30% significa que la cartera cayó 30% desde su punto más alto.' },
  // E
  { term: 'ETF', letter: 'E', definition: 'Exchange-Traded Fund. Fondo de inversión que cotiza en bolsa como una acción, replicando generalmente un índice con comisiones muy bajas.' },
  { term: 'Efecto compuesto', letter: 'E', definition: 'Crecimiento exponencial que ocurre cuando los rendimientos se reinvierten y generan sus propios rendimientos.', example: '10.000€ al 7% anual durante 30 años = ~76.000€ gracias al efecto compuesto.' },
  // F
  { term: 'FIFO', letter: 'F', definition: 'First In, First Out. Método contable que asume que las primeras acciones compradas son las primeras vendidas. Obligatorio en España para calcular plusvalías.' },
  { term: 'Fondo indexado', letter: 'F', definition: 'Fondo de inversión que replica un índice de referencia de forma pasiva, con comisiones muy bajas.' },
  { term: 'FOGAIN', letter: 'F', definition: 'Fondo de Garantía de Inversiones en España. Protege hasta 100.000€ por titular en caso de quiebra del broker.' },
  // G
  { term: 'Gestión activa', letter: 'G', definition: 'Estrategia donde un gestor selecciona activos intentando batir al mercado. Implica mayores comisiones.' },
  { term: 'Gestión pasiva', letter: 'G', definition: 'Estrategia que replica un índice sin intentar batirlo. Comisiones muy bajas y resultados consistentes a largo plazo.' },
  { term: 'Growth investing', letter: 'G', definition: 'Estrategia de inversión centrada en empresas con alto potencial de crecimiento, aunque coticen a múltiplos elevados.' },
  // H
  { term: 'High Yield', letter: 'H', definition: 'Bonos de alto rendimiento emitidos por empresas con peor calificación crediticia. Mayor rentabilidad pero mayor riesgo de impago.' },
  { term: 'Horizonte temporal', letter: 'H', definition: 'Período de tiempo durante el cual planeas mantener una inversión antes de necesitar el dinero.' },
  // I
  { term: 'ISIN', letter: 'I', definition: 'International Securities Identification Number. Código único de 12 caracteres que identifica un valor a nivel mundial.', example: 'El ETF iShares Core MSCI World tiene ISIN IE00B4L5Y983.' },
  { term: 'Índice bursátil', letter: 'I', definition: 'Indicador que mide el comportamiento de un grupo de acciones representativas de un mercado o sector.', example: 'El IBEX 35 representa las 35 mayores empresas de España.' },
  { term: 'Interés compuesto', letter: 'I', definition: 'Interés calculado sobre el capital inicial más los intereses acumulados de períodos anteriores.' },
  // L
  { term: 'Liquidez', letter: 'L', definition: 'Facilidad con la que un activo puede convertirse en efectivo sin pérdida significativa de valor.' },
  // M
  { term: 'Market timing', letter: 'M', definition: 'Estrategia de intentar predecir los movimientos del mercado para comprar bajo y vender alto. Estudios demuestran que es casi imposible hacerlo consistentemente.' },
  { term: 'MiFID II', letter: 'M', definition: 'Directiva europea que regula los mercados financieros y la protección del inversor, incluyendo transparencia en comisiones.' },
  { term: 'MSCI World', letter: 'M', definition: 'Índice que representa aproximadamente 1.500 empresas de mediana y gran capitalización de 23 países desarrollados.' },
  // P
  { term: 'PER (Price Earnings Ratio)', letter: 'P', definition: 'Ratio precio/beneficio. Indica cuántos años de beneficios actuales estás pagando por una acción.', example: 'PER de 20 significa que pagas 20€ por cada 1€ de beneficio anual.' },
  { term: 'Payout ratio', letter: 'P', definition: 'Porcentaje de beneficios que una empresa distribuye como dividendos. Un payout muy alto puede ser insostenible.' },
  { term: 'Plusvalía', letter: 'P', definition: 'Ganancia obtenida al vender un activo por más de lo que costó comprarlo.' },
  { term: 'Prima de riesgo', letter: 'P', definition: 'Rentabilidad adicional que exigen los inversores por asumir un mayor riesgo respecto a un activo libre de riesgo.' },
  // R
  { term: 'Ratio de Sharpe', letter: 'R', definition: 'Medida de rentabilidad ajustada al riesgo. Cuanto mayor, mejor relación entre rendimiento y volatilidad asumida.' },
  { term: 'Rebalanceo', letter: 'R', definition: 'Proceso de ajustar las proporciones de una cartera para volver a la asignación objetivo cuando se ha desviado.' },
  { term: 'REIT/Socimi', letter: 'R', definition: 'Sociedad que invierte en inmuebles y reparte la mayoría de beneficios como dividendos. Permite invertir en inmobiliario sin comprar propiedades.' },
  { term: 'Renta fija', letter: 'R', definition: 'Activos que ofrecen pagos predeterminados (bonos, letras). Menor riesgo pero también menor rentabilidad esperada que la renta variable.' },
  { term: 'Renta variable', letter: 'R', definition: 'Activos cuyo rendimiento no está garantizado (acciones). Mayor riesgo pero también mayor rentabilidad esperada a largo plazo.' },
  { term: 'ROE (Return on Equity)', letter: 'R', definition: 'Rentabilidad sobre recursos propios. Mide la eficiencia con la que una empresa genera beneficios con el dinero de los accionistas.' },
  // S
  { term: 'Small cap', letter: 'S', definition: 'Empresas de pequeña capitalización bursátil, generalmente por debajo de 2.000 millones €. Mayor potencial de crecimiento pero también más riesgo.' },
  { term: 'Spread', letter: 'S', definition: 'Diferencia entre el precio de compra (ask) y venta (bid) de un activo. Representa un coste implícito de operar.' },
  // T
  { term: 'TER (Total Expense Ratio)', letter: 'T', definition: 'Coste total de un fondo expresado como porcentaje anual. Incluye comisión de gestión, custodia y otros gastos.' },
  { term: 'Traspaso de fondos', letter: 'T', definition: 'En España, cambiar de un fondo a otro sin tributar hasta el reembolso final. Gran ventaja fiscal.' },
  // V
  { term: 'Value investing', letter: 'V', definition: 'Estrategia de inversión que busca comprar empresas infravaloradas por el mercado, con margen de seguridad.' },
  { term: 'Valor liquidativo', letter: 'V', definition: 'Precio de una participación de un fondo de inversión, calculado diariamente dividiendo el patrimonio total entre el número de participaciones.' },
  { term: 'Volatilidad', letter: 'V', definition: 'Medida de la variabilidad de los precios de un activo. Mayor volatilidad implica mayores fluctuaciones (tanto subidas como bajadas).' },
  // Y
  { term: 'Yield', letter: 'Y', definition: 'Rendimiento de una inversión expresado como porcentaje. Puede referirse a dividendos (dividend yield) o cupones de bonos.' },
];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'P', 'R', 'S', 'T', 'V', 'Y'];

export default function GlosarioPage() {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    let terms = GLOSSARY_TERMS;

    if (selectedLetter) {
      terms = terms.filter(t => t.letter === selectedLetter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(searchLower) ||
        t.definition.toLowerCase().includes(searchLower)
      );
    }

    return terms;
  }, [search, selectedLetter]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <LegalNotice />

      <div className={styles.chapterContainer}>
        <header className={styles.chapterHero}>
          <div className={styles.chapterHeroIcon}>📖</div>
          <h1 className={styles.chapterHeroTitle}>Glosario Financiero</h1>
          <p className={styles.chapterHeroSubtitle}>
            Más de 50 términos financieros explicados de forma clara y concisa
          </p>
        </header>

        <nav className={styles.navigation}>
          <Link href="/curso-decisiones-inversion/mantenimiento-cartera" className={styles.navButton}>
            ← Último capítulo
          </Link>
          <div className={styles.navProgress}>
            <div className={styles.navProgressText}>Recursos</div>
            <div className={styles.navProgressLabel}>Material de referencia</div>
          </div>
          <Link href="/curso-decisiones-inversion/recursos/bibliografia" className={styles.navButton}>
            Bibliografía →
          </Link>
        </nav>

        {/* Search */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Buscar término</h2>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Escribe para buscar..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />

          {/* Letter filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={() => setSelectedLetter(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background: selectedLetter === null ? 'var(--primary)' : 'var(--bg-card)',
                color: selectedLetter === null ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              Todos
            </button>
            {LETTERS.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  background: selectedLetter === letter ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedLetter === letter ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </section>

        {/* Terms */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📚</span>
            <h2 className={styles.sectionTitleText}>
              {filteredTerms.length} término{filteredTerms.length !== 1 ? 's' : ''} encontrado{filteredTerms.length !== 1 ? 's' : ''}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredTerms.map((term, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--hover)',
                  borderRadius: 'var(--radius)',
                  padding: '16px 20px',
                  borderLeft: '4px solid var(--primary)',
                }}
              >
                <h3 style={{
                  color: 'var(--primary)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  {term.term}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {term.definition}
                </p>
                {term.example && (
                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    marginTop: '8px',
                    fontStyle: 'italic',
                    margin: '8px 0 0 0'
                  }}>
                    <strong>Ejemplo:</strong> {term.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className={styles.bottomNavigation}>
          <Link href="/curso-decisiones-inversion" className={styles.bottomNavLink}>
            <div className={styles.bottomNavLabel}>← Volver</div>
            <div className={styles.bottomNavTitle}>📊 Inicio del curso</div>
          </Link>
          <Link
            href="/curso-decisiones-inversion/recursos/bibliografia"
            className={`${styles.bottomNavLink} ${styles.next}`}
          >
            <div className={styles.bottomNavLabel}>Siguiente →</div>
            <div className={styles.bottomNavTitle}>📚 Bibliografía</div>
          </Link>
        </div>
      </div>

      <Footer appName="curso-decisiones-inversion" />
    </div>
  );
}
