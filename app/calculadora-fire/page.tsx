'use client';

import { useState } from 'react';
import styles from './Fire.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoFIRE = 'lean' | 'normal' | 'fat';

interface Resultado {
  numeroFIRE: number;
  anosParaFIRE: number;
  tasaAhorro: number;
  patrimonioActual: number;
  ahorroAnual: number;
  proyeccion: { ano: number; patrimonio: number }[];
  tipoFIRE: TipoFIRE;
}

export default function CalculadoraFIREPage() {
  const [gastosAnuales, setGastosAnuales] = useState('');
  const [ingresoAnual, setIngresoAnual] = useState('');
  const [patrimonioActual, setPatrimonioActual] = useState('');
  const [rentabilidadEsperada, setRentabilidadEsperada] = useState('7');
  const [tasaRetiro, setTasaRetiro] = useState('4');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcularFIRE = () => {
    const gastos = parseSpanishNumber(gastosAnuales);
    const ingresos = parseSpanishNumber(ingresoAnual);
    const patrimonio = parseSpanishNumber(patrimonioActual);
    const rentabilidad = parseSpanishNumber(rentabilidadEsperada) / 100;
    const tasaRetiroNum = parseSpanishNumber(tasaRetiro) / 100;

    if (gastos <= 0 || ingresos <= 0) return;

    // Número FIRE = Gastos anuales / Tasa de retiro
    const numeroFIRE = gastos / tasaRetiroNum;

    // Ahorro anual
    const ahorroAnual = ingresos - gastos;

    // Tasa de ahorro
    const tasaAhorro = (ahorroAnual / ingresos) * 100;

    if (ahorroAnual <= 0) {
      setResultado({
        numeroFIRE,
        anosParaFIRE: Infinity,
        tasaAhorro,
        patrimonioActual: patrimonio,
        ahorroAnual,
        proyeccion: [],
        tipoFIRE: gastos < 20000 ? 'lean' : gastos > 50000 ? 'fat' : 'normal',
      });
      return;
    }

    // Calcular años hasta FIRE usando la fórmula de interés compuesto
    // FV = PV * (1 + r)^n + PMT * ((1 + r)^n - 1) / r
    // Resolver para n cuando FV = numeroFIRE
    let patrimonioAcumulado = patrimonio;
    let anos = 0;
    const proyeccion: { ano: number; patrimonio: number }[] = [
      { ano: 0, patrimonio: patrimonio }
    ];

    while (patrimonioAcumulado < numeroFIRE && anos < 100) {
      patrimonioAcumulado = patrimonioAcumulado * (1 + rentabilidad) + ahorroAnual;
      anos++;
      proyeccion.push({ ano: anos, patrimonio: patrimonioAcumulado });
    }

    // Determinar tipo de FIRE
    let tipoFIRE: TipoFIRE;
    if (gastos < 20000) {
      tipoFIRE = 'lean';
    } else if (gastos > 50000) {
      tipoFIRE = 'fat';
    } else {
      tipoFIRE = 'normal';
    }

    setResultado({
      numeroFIRE,
      anosParaFIRE: anos,
      tasaAhorro,
      patrimonioActual: patrimonio,
      ahorroAnual,
      proyeccion: proyeccion.slice(0, Math.min(proyeccion.length, 51)),
      tipoFIRE,
    });
  };

  const getTipoFIREInfo = (tipo: TipoFIRE) => {
    switch (tipo) {
      case 'lean':
        return { nombre: 'Lean FIRE', descripcion: 'Estilo de vida frugal (< 20.000 €/año)', icon: '🏕️' };
      case 'normal':
        return { nombre: 'FIRE', descripcion: 'Estilo de vida cómodo (20.000-50.000 €/año)', icon: '🏠' };
      case 'fat':
        return { nombre: 'Fat FIRE', descripcion: 'Estilo de vida holgado (> 50.000 €/año)', icon: '🏰' };
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora FIRE</h1>
        <p className={styles.subtitle}>
          Financial Independence, Retire Early - Calcula tu camino a la independencia financiera
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tu situación financiera</h2>

          <NumberInput
            value={gastosAnuales}
            onChange={setGastosAnuales}
            label="Gastos anuales"
            placeholder="24000"
            helperText="Cuánto gastas al año (el nivel de vida que quieres mantener)"
            min={0}
          />

          <NumberInput
            value={ingresoAnual}
            onChange={setIngresoAnual}
            label="Ingresos anuales netos"
            placeholder="36000"
            helperText="Tus ingresos después de impuestos"
            min={0}
          />

          <NumberInput
            value={patrimonioActual}
            onChange={setPatrimonioActual}
            label="Patrimonio invertido actual"
            placeholder="50000"
            helperText="Dinero que ya tienes invertido (no cuenta el fondo de emergencia)"
            min={0}
          />

          <div className={styles.advancedSettings}>
            <h3 className={styles.advancedTitle}>Parámetros avanzados</h3>

            <NumberInput
              value={rentabilidadEsperada}
              onChange={setRentabilidadEsperada}
              label="Rentabilidad anual esperada (%)"
              placeholder="7"
              helperText="Histórico S&P 500 ajustado inflación: ~7%"
              min={0}
              max={20}
            />

            <NumberInput
              value={tasaRetiro}
              onChange={setTasaRetiro}
              label="Tasa de retiro segura (%)"
              placeholder="4"
              helperText="Regla del 4% (Trinity Study). Conservador: 3,5%"
              min={2}
              max={6}
            />
          </div>

          <button onClick={calcularFIRE} className={styles.btnPrimary}>
            Calcular mi FIRE
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && (
            <>
              <div className={styles.tipoFireBadge}>
                <span className={styles.tipoFireIcon}>{getTipoFIREInfo(resultado.tipoFIRE).icon}</span>
                <div>
                  <span className={styles.tipoFireNombre}>{getTipoFIREInfo(resultado.tipoFIRE).nombre}</span>
                  <span className={styles.tipoFireDesc}>{getTipoFIREInfo(resultado.tipoFIRE).descripcion}</span>
                </div>
              </div>

              <ResultCard
                title="Tu Número FIRE"
                value={formatCurrency(resultado.numeroFIRE)}
                variant="highlight"
                icon="🎯"
                description="El patrimonio que necesitas para vivir de tus inversiones"
              />

              {resultado.anosParaFIRE === Infinity ? (
                <ResultCard
                  title="Años hasta FIRE"
                  value="∞"
                  variant="warning"
                  icon="⚠️"
                  description="Gastas más de lo que ingresas. Necesitas aumentar ingresos o reducir gastos."
                />
              ) : (
                <ResultCard
                  title="Años hasta FIRE"
                  value={`${resultado.anosParaFIRE} años`}
                  variant={resultado.anosParaFIRE <= 10 ? 'success' : resultado.anosParaFIRE <= 20 ? 'info' : 'default'}
                  icon={resultado.anosParaFIRE <= 10 ? '🚀' : resultado.anosParaFIRE <= 20 ? '📈' : '🐢'}
                  description={resultado.anosParaFIRE <= 10 ? '¡Vas muy bien!' : resultado.anosParaFIRE <= 20 ? 'Buen ritmo' : 'Considera aumentar tu tasa de ahorro'}
                />
              )}

              <div className={styles.metricas}>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Tasa de ahorro</span>
                  <span className={`${styles.metricaValor} ${resultado.tasaAhorro >= 50 ? styles.excelente : resultado.tasaAhorro >= 20 ? styles.bueno : styles.mejorable}`}>
                    {formatNumber(resultado.tasaAhorro, 1)}%
                  </span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Ahorro anual</span>
                  <span className={styles.metricaValor}>{formatCurrency(resultado.ahorroAnual)}</span>
                </div>
                <div className={styles.metricaItem}>
                  <span className={styles.metricaLabel}>Progreso actual</span>
                  <span className={styles.metricaValor}>
                    {formatNumber((resultado.patrimonioActual / resultado.numeroFIRE) * 100, 1)}%
                  </span>
                </div>
              </div>

              {resultado.proyeccion.length > 1 && resultado.anosParaFIRE !== Infinity && (
                <div className={styles.proyeccionContainer}>
                  <h4>Proyección de patrimonio</h4>
                  <div className={styles.proyeccionTable}>
                    <div className={styles.proyeccionHeader}>
                      <span>Año</span>
                      <span>Patrimonio</span>
                      <span>% del objetivo</span>
                    </div>
                    {resultado.proyeccion
                      .filter((_, i) => i === 0 || i % 5 === 0 || i === resultado.proyeccion.length - 1)
                      .map((item) => (
                        <div key={item.ano} className={styles.proyeccionRow}>
                          <span>{item.ano}</span>
                          <span>{formatCurrency(item.patrimonio)}</span>
                          <span>{formatNumber((item.patrimonio / resultado.numeroFIRE) * 100, 0)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {resultado.tasaAhorro < 20 && resultado.anosParaFIRE !== Infinity && (
                <div className={styles.consejoCard}>
                  <h4>Consejo</h4>
                  <p>
                    Tu tasa de ahorro es del {formatNumber(resultado.tasaAhorro, 0)}%.
                    Para acelerar tu FIRE, intenta llegar al 50% o más.
                    Cada punto porcentual extra puede ahorrarte años de trabajo.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-fire"
        collapsible={true}
      />


      <EducationalSection
        title="¿Quieres aprender más sobre FIRE?"
        subtitle="Descubre el movimiento de independencia financiera y retiro anticipado"
        icon="📚"
      >
        {/* Tabla comparativa variantes FIRE */}
        <section className={styles.guideSection}>
          <h2>Comparativa de variantes FIRE</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Gastos anuales</th>
                  <th>Capital necesario</th>
                  <th>Estilo de vida</th>
                  <th>Dificultad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lean FIRE</strong></td>
                  <td>&lt; 20.000 €</td>
                  <td>&lt; 500.000 €</td>
                  <td>Frugal, minimalista</td>
                  <td>⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>FIRE estándar</strong></td>
                  <td>20.000–40.000 €</td>
                  <td>500.000–1 M €</td>
                  <td>Cómodo, clase media</td>
                  <td>⭐⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>Fat FIRE</strong></td>
                  <td>&gt; 60.000 €</td>
                  <td>&gt; 1,5 M €</td>
                  <td>Holgado, sin restricciones</td>
                  <td>⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>Barista FIRE</strong></td>
                  <td>Variable</td>
                  <td>Menor capital + ingresos parciales</td>
                  <td>Semi-retiro, trabajo a tiempo parcial</td>
                  <td>⭐⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>Coast FIRE</strong></td>
                  <td>Variable</td>
                  <td>Alcanzado un umbral, el interés compuesto hace el resto</td>
                  <td>Deja de ahorrar agresivamente</td>
                  <td>⭐⭐⭐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Cuándo usar esta calculadora?</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>💼</span>
                <span className={styles.casoNivel}>Empleado con ahorro</span>
              </div>
              <p className={styles.casoTip}>
                Introduce tu sueldo neto, gastos mensuales y rentabilidad esperada (7% histórico de mercado).
                Descubre en cuántos años podrías dejar de trabajar.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🏠</span>
                <span className={styles.casoNivel}>Con patrimonio inicial</span>
              </div>
              <p className={styles.casoTip}>
                Si ya tienes ahorros o inversiones, úsalos como capital inicial. El interés compuesto
                acelera considerablemente la fecha FIRE.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>📉</span>
                <span className={styles.casoNivel}>Simulación de inflación</span>
              </div>
              <p className={styles.casoTip}>
                Ajusta la rentabilidad real restando la inflación (p. ej. 7% – 3% = 4% real).
                Así obtienes un escenario conservador y más realista.
              </p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🎯</span>
                <span className={styles.casoNivel}>Encontrar tu tasa de ahorro</span>
              </div>
              <p className={styles.casoTip}>
                Prueba distintas tasas de ahorro (20%, 40%, 60%) para ver cómo cambian los años.
                Doblar la tasa puede reducir el tiempo a la mitad.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Es realista un 7% de rentabilidad anual?</dt>
              <dd className={styles.faqRespuesta}>
                El S&P 500 ha rentado históricamente ~10% nominal (~7% real descontando inflación).
                Un fondo indexado global como MSCI World ha dado resultados similares en periodos largos.
                Usar 6-7% real es un supuesto conservador y razonable, aunque el pasado no garantiza el futuro.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Qué pasa con los impuestos al retirar?</dt>
              <dd className={styles.faqRespuesta}>
                En España, las plusvalías tributan al 19-28% según tramo. Al calcular tu número FIRE,
                considera retirar un 20-25% más para cubrir la fiscalidad, o usa cuentas de ahorro
                como planes de pensiones con diferimiento fiscal.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿La regla del 4% funciona en España?</dt>
              <dd className={styles.faqRespuesta}>
                La regla del 4% viene del Trinity Study (carteras USA a 30 años). Para Europa y
                horizontes superiores a 30 años, muchos expertos recomiendan usar el 3-3,5%
                para mayor seguridad, lo que implica un número FIRE de 29-33× los gastos anuales.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Qué inversiones usar para FIRE?</dt>
              <dd className={styles.faqRespuesta}>
                La estrategia más popular son los fondos indexados de bajo coste (Vanguard, iShares,
                Amundi). En España, son accesibles a través de brokers como Indexa Capital, MyInvestor
                o DEGIRO. Diversifica entre acciones globales y algo de renta fija según tu horizonte.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqPregunta}>¿Cuánto necesito realmente para FIRE?</dt>
              <dd className={styles.faqRespuesta}>
                Multiplica tus gastos anuales actuales por 25 (regla del 4%) o por 30-33 si quieres
                mayor seguridad. Si gastas 2.000 €/mes (24.000 €/año), tu número FIRE estándar
                es 600.000 €. Usa esta calculadora para personalizar según tu situación real.
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Qué es FIRE?</h2>
          <p className={styles.introParagraph}>
            FIRE (Financial Independence, Retire Early) es un movimiento que busca alcanzar la libertad
            financiera lo antes posible mediante un alto ahorro e inversión inteligente.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>La Regla del 4%</h4>
              <p>
                Basada en el Trinity Study, establece que puedes retirar el 4% de tu cartera
                anualmente con alta probabilidad de que dure 30+ años.
              </p>
              <p>
                <strong>Número FIRE = Gastos anuales × 25</strong>
              </p>
              <p>
                Ejemplo: Si gastas 24.000 €/año, necesitas 600.000 € invertidos.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Tipos de FIRE</h4>
              <ul>
                <li><strong>Lean FIRE:</strong> Vida frugal (&lt; 20.000 €/año)</li>
                <li><strong>FIRE:</strong> Vida cómoda (20.000-50.000 €/año)</li>
                <li><strong>Fat FIRE:</strong> Vida holgada (&gt; 50.000 €/año)</li>
                <li><strong>Barista FIRE:</strong> Semi-retiro con trabajo parcial</li>
                <li><strong>Coast FIRE:</strong> Dejar de ahorrar, dejar que crezca</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>Tasa de ahorro vs Años para FIRE</h4>
              <ul>
                <li><strong>10%:</strong> ~51 años</li>
                <li><strong>25%:</strong> ~32 años</li>
                <li><strong>50%:</strong> ~17 años</li>
                <li><strong>75%:</strong> ~7 años</li>
              </ul>
              <p>La tasa de ahorro es el factor más importante.</p>
            </div>

            <div className={styles.contentCard}>
              <h4>Pasos para FIRE</h4>
              <ol>
                <li>Crear fondo de emergencia (6-12 meses)</li>
                <li>Pagar deudas de alto interés</li>
                <li>Maximizar tasa de ahorro</li>
                <li>Invertir en fondos indexados diversificados</li>
                <li>Mantener costes de inversión bajos</li>
                <li>Ser paciente y consistente</li>
              </ol>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-fire')} />
      <Footer appName="calculadora-fire" />
    </div>
  );
}
