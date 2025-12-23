'use client';

import { useState } from 'react';
import styles from './FondoEmergencia.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type SituacionLaboral = 'estable' | 'moderada' | 'inestable' | 'autonomo';
type CargasFamiliares = 'sin_cargas' | 'pareja' | 'hijos' | 'dependientes';

interface Resultado {
  mesesRecomendados: number;
  fondoMinimo: number;
  fondoRecomendado: number;
  fondoMaximo: number;
  nivelActual: 'insuficiente' | 'minimo' | 'adecuado' | 'excelente';
  porcentajeCubierto: number;
}

export default function CalculadoraFondoEmergenciaPage() {
  const [gastosMensuales, setGastosMensuales] = useState('');
  const [ahorroActual, setAhorroActual] = useState('');
  const [situacionLaboral, setSituacionLaboral] = useState<SituacionLaboral>('estable');
  const [cargasFamiliares, setCargasFamiliares] = useState<CargasFamiliares>('sin_cargas');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcularFondo = () => {
    const gastos = parseSpanishNumber(gastosMensuales);
    const ahorro = parseSpanishNumber(ahorroActual);

    if (gastos <= 0) return;

    // Calcular meses recomendados según situación
    let mesesBase = 3;

    // Ajuste por situación laboral
    switch (situacionLaboral) {
      case 'estable':
        mesesBase = 3;
        break;
      case 'moderada':
        mesesBase = 6;
        break;
      case 'inestable':
        mesesBase = 9;
        break;
      case 'autonomo':
        mesesBase = 9;
        break;
    }

    // Ajuste por cargas familiares
    switch (cargasFamiliares) {
      case 'sin_cargas':
        // Sin cambio
        break;
      case 'pareja':
        mesesBase += 1;
        break;
      case 'hijos':
        mesesBase += 2;
        break;
      case 'dependientes':
        mesesBase += 3;
        break;
    }

    const mesesRecomendados = mesesBase;
    const fondoMinimo = gastos * 3;
    const fondoRecomendado = gastos * mesesRecomendados;
    const fondoMaximo = gastos * 12;

    // Evaluar nivel actual
    let nivelActual: Resultado['nivelActual'];
    const porcentajeCubierto = (ahorro / fondoRecomendado) * 100;

    if (ahorro < fondoMinimo) {
      nivelActual = 'insuficiente';
    } else if (ahorro < fondoRecomendado) {
      nivelActual = 'minimo';
    } else if (ahorro < fondoMaximo) {
      nivelActual = 'adecuado';
    } else {
      nivelActual = 'excelente';
    }

    setResultado({
      mesesRecomendados,
      fondoMinimo,
      fondoRecomendado,
      fondoMaximo,
      nivelActual,
      porcentajeCubierto: Math.min(porcentajeCubierto, 100),
    });
  };

  const getNivelColor = (nivel: Resultado['nivelActual']) => {
    switch (nivel) {
      case 'insuficiente':
        return 'warning';
      case 'minimo':
        return 'info';
      case 'adecuado':
        return 'success';
      case 'excelente':
        return 'highlight';
    }
  };

  const getNivelTexto = (nivel: Resultado['nivelActual']) => {
    switch (nivel) {
      case 'insuficiente':
        return 'Insuficiente - Prioriza ahorrar';
      case 'minimo':
        return 'Mínimo cubierto - Sigue ahorrando';
      case 'adecuado':
        return 'Adecuado - Buen trabajo';
      case 'excelente':
        return 'Excelente - Puedes invertir el exceso';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora Fondo de Emergencia</h1>
        <p className={styles.subtitle}>
          Calcula cuánto dinero necesitas ahorrar como colchón de seguridad
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tu situación</h2>

          <NumberInput
            value={gastosMensuales}
            onChange={setGastosMensuales}
            label="Gastos mensuales totales"
            placeholder="2000"
            helperText="Incluye alquiler/hipoteca, comida, suministros, transporte..."
            min={0}
          />

          <NumberInput
            value={ahorroActual}
            onChange={setAhorroActual}
            label="Ahorro actual disponible"
            placeholder="5000"
            helperText="Dinero que tienes ahorrado ahora mismo"
            min={0}
          />

          <div className={styles.selectGroup}>
            <label className={styles.label}>Situación laboral</label>
            <select
              value={situacionLaboral}
              onChange={(e) => setSituacionLaboral(e.target.value as SituacionLaboral)}
              className={styles.select}
            >
              <option value="estable">Empleo estable (funcionario, indefinido antiguo)</option>
              <option value="moderada">Moderadamente estable (indefinido reciente)</option>
              <option value="inestable">Inestable (temporal, sector volátil)</option>
              <option value="autonomo">Autónomo / Freelance</option>
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Cargas familiares</label>
            <select
              value={cargasFamiliares}
              onChange={(e) => setCargasFamiliares(e.target.value as CargasFamiliares)}
              className={styles.select}
            >
              <option value="sin_cargas">Sin cargas (vivo solo/a)</option>
              <option value="pareja">Con pareja (sin hijos)</option>
              <option value="hijos">Con hijos</option>
              <option value="dependientes">Con personas dependientes a cargo</option>
            </select>
          </div>

          <button onClick={calcularFondo} className={styles.btnPrimary}>
            Calcular fondo necesario
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && (
            <>
              <ResultCard
                title="Tu nivel actual"
                value={getNivelTexto(resultado.nivelActual)}
                variant={getNivelColor(resultado.nivelActual)}
                icon={resultado.nivelActual === 'excelente' ? '🏆' : resultado.nivelActual === 'adecuado' ? '✅' : resultado.nivelActual === 'minimo' ? '⚠️' : '🚨'}
              />

              <div className={styles.progressContainer}>
                <div className={styles.progressLabel}>
                  <span>Progreso hacia tu objetivo</span>
                  <span>{resultado.porcentajeCubierto.toFixed(0)}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${resultado.porcentajeCubierto}%` }}
                  />
                </div>
              </div>

              <ResultCard
                title="Fondo recomendado"
                value={formatCurrency(resultado.fondoRecomendado)}
                variant="highlight"
                icon="🎯"
                description={`${resultado.mesesRecomendados} meses de gastos cubiertos`}
              />

              <div className={styles.rangoFondos}>
                <div className={styles.rangoItem}>
                  <span className={styles.rangoLabel}>Mínimo (3 meses)</span>
                  <span className={styles.rangoValor}>{formatCurrency(resultado.fondoMinimo)}</span>
                </div>
                <div className={styles.rangoItem}>
                  <span className={styles.rangoLabel}>Máximo (12 meses)</span>
                  <span className={styles.rangoValor}>{formatCurrency(resultado.fondoMaximo)}</span>
                </div>
              </div>

              {resultado.nivelActual === 'insuficiente' && (
                <div className={styles.consejoCard}>
                  <h4>Consejo</h4>
                  <p>
                    Te faltan <strong>{formatCurrency(resultado.fondoRecomendado - parseSpanishNumber(ahorroActual))}</strong> para
                    alcanzar tu objetivo. Intenta ahorrar al menos el 20% de tus ingresos hasta completarlo.
                  </p>
                </div>
              )}

              {resultado.nivelActual === 'excelente' && (
                <div className={styles.consejoCardSuccess}>
                  <h4>Excelente situación</h4>
                  <p>
                    Tienes más de 12 meses cubiertos. El exceso sobre {formatCurrency(resultado.fondoMaximo)} podrías
                    invertirlo para que no pierda valor por la inflación.
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
          Esta calculadora proporciona estimaciones orientativas basadas en reglas generales de finanzas personales.
          Los resultados NO constituyen asesoramiento financiero profesional. Tu situación personal puede requerir
          un fondo mayor o menor según circunstancias específicas.
        </p>
      </div>

      <EducationalSection
        title="¿Quieres aprender más sobre el fondo de emergencia?"
        subtitle="Descubre por qué es el primer paso de cualquier plan financiero"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es un fondo de emergencia?</h2>
          <p className={styles.introParagraph}>
            Un fondo de emergencia es dinero ahorrado específicamente para cubrir gastos inesperados
            o pérdida de ingresos. Es tu red de seguridad financiera.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Para qué sirve</h4>
              <ul>
                <li>Pérdida de empleo</li>
                <li>Averías del coche o electrodomésticos</li>
                <li>Gastos médicos inesperados</li>
                <li>Reparaciones urgentes del hogar</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>Dónde guardarlo</h4>
              <ul>
                <li>Cuenta de ahorro separada</li>
                <li>Depósito a corto plazo</li>
                <li>Fondo monetario (alta liquidez)</li>
                <li>NO en inversiones volátiles</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>Cuánto ahorrar</h4>
              <ul>
                <li><strong>Mínimo:</strong> 3 meses de gastos</li>
                <li><strong>Recomendado:</strong> 6-9 meses</li>
                <li><strong>Máximo práctico:</strong> 12 meses</li>
                <li>Más de 12 meses: mejor invertir</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>Antes de invertir</h4>
              <p>
                Los expertos en finanzas personales recomiendan completar el fondo de emergencia
                ANTES de empezar a invertir. Sin este colchón, una emergencia te obligaría a
                vender inversiones en mal momento.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-fondo-emergencia')} />
      <Footer appName="calculadora-fondo-emergencia" />
    </div>
  );
}
