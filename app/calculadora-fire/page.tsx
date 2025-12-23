'use client';

import { useState } from 'react';
import styles from './Fire.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
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

      <div className={styles.disclaimer}>
        <h3>Aviso importante</h3>
        <p>
          Esta calculadora proporciona estimaciones basadas en la regla del 4% (Trinity Study) y rentabilidades históricas.
          Los mercados son impredecibles y los resultados reales pueden variar significativamente.
          NO constituye asesoramiento financiero profesional. Consulta con un asesor antes de tomar decisiones importantes.
        </p>
      </div>

      <EducationalSection
        title="¿Quieres aprender más sobre FIRE?"
        subtitle="Descubre el movimiento de independencia financiera y retiro anticipado"
        icon="📚"
      >
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
