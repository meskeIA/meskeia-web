'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CalculadoraPintura.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoSuperficie = 'lisa' | 'gotele' | 'rugosa' | 'porosa';

interface Resultado {
  metrosCuadrados: number;
  litrosNecesarios: number;
  botesPequenos: number;
  botesGrandes: number;
  costeEstimado: number;
}

const RENDIMIENTOS: Record<TipoSuperficie, number> = {
  lisa: 12,      // m²/litro - pared lisa
  gotele: 8,     // m²/litro - gotelé
  rugosa: 7,     // m²/litro - superficie rugosa
  porosa: 6,     // m²/litro - superficie porosa
};

const DESCRIPCIONES_SUPERFICIE: Record<TipoSuperficie, string> = {
  lisa: 'Pared lisa, yeso o pladur',
  gotele: 'Gotelé o textura media',
  rugosa: 'Ladrillo visto o estuco',
  porosa: 'Hormigón o superficie muy absorbente',
};

export default function CalculadoraPinturaPage() {
  const [modo, setModo] = useState<'metros' | 'habitacion'>('metros');
  const [metrosCuadrados, setMetrosCuadrados] = useState('');
  const [largo, setLargo] = useState('');
  const [ancho, setAncho] = useState('');
  const [alto, setAlto] = useState('2.5');
  const [numCapas, setNumCapas] = useState('2');
  const [tipoSuperficie, setTipoSuperficie] = useState<TipoSuperficie>('lisa');
  const [precioPorLitro, setPrecioPorLitro] = useState('8');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const calcular = () => {
    let m2Total = 0;

    if (modo === 'metros') {
      m2Total = parseFloat(metrosCuadrados.replace(',', '.')) || 0;
    } else {
      const l = parseFloat(largo.replace(',', '.')) || 0;
      const a = parseFloat(ancho.replace(',', '.')) || 0;
      const h = parseFloat(alto.replace(',', '.')) || 0;
      // Perímetro x altura (paredes de una habitación)
      m2Total = 2 * (l + a) * h;
    }

    if (m2Total <= 0) return;

    const capas = parseInt(numCapas) || 2;
    const rendimiento = RENDIMIENTOS[tipoSuperficie];
    const precio = parseFloat(precioPorLitro.replace(',', '.')) || 0;

    // Litros necesarios = m² * capas / rendimiento
    const litros = (m2Total * capas) / rendimiento;

    // Redondear hacia arriba
    const litrosRedondeados = Math.ceil(litros * 10) / 10;

    // Calcular botes (4L y 15L son tamaños estándar)
    const botesPequenos = Math.ceil(litrosRedondeados / 4);
    const botesGrandes = Math.ceil(litrosRedondeados / 15);

    // Coste estimado
    const coste = litrosRedondeados * precio;

    setResultado({
      metrosCuadrados: m2Total,
      litrosNecesarios: litrosRedondeados,
      botesPequenos,
      botesGrandes,
      costeEstimado: coste,
    });
  };

  const limpiar = () => {
    setMetrosCuadrados('');
    setLargo('');
    setAncho('');
    setAlto('2.5');
    setNumCapas('2');
    setTipoSuperficie('lisa');
    setPrecioPorLitro('8');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Pintura</h1>
        <p className={styles.subtitle}>
          Calcula cuántos litros necesitas según superficie, capas y tipo de pared
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Selector de modo */}
          <div className={styles.modoSelector}>
            <button
              className={`${styles.modoBtn} ${modo === 'metros' ? styles.active : ''}`}
              onClick={() => setModo('metros')}
            >
              Por m² directos
            </button>
            <button
              className={`${styles.modoBtn} ${modo === 'habitacion' ? styles.active : ''}`}
              onClick={() => setModo('habitacion')}
            >
              Por habitación
            </button>
          </div>

          {modo === 'metros' ? (
            <div className={styles.inputGroup}>
              <label>Metros cuadrados a pintar</label>
              <input
                type="text"
                inputMode="decimal"
                value={metrosCuadrados}
                onChange={(e) => setMetrosCuadrados(e.target.value)}
                placeholder="Ej: 45"
                className={styles.input}
              />
            </div>
          ) : (
            <div className={styles.habitacionInputs}>
              <div className={styles.inputGroup}>
                <label>Largo (m)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={largo}
                  onChange={(e) => setLargo(e.target.value)}
                  placeholder="4"
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Ancho (m)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={ancho}
                  onChange={(e) => setAncho(e.target.value)}
                  placeholder="3"
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Alto (m)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={alto}
                  onChange={(e) => setAlto(e.target.value)}
                  placeholder="2.5"
                  className={styles.input}
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Número de capas</label>
            <select
              value={numCapas}
              onChange={(e) => setNumCapas(e.target.value)}
              className={styles.select}
            >
              <option value="1">1 capa</option>
              <option value="2">2 capas (recomendado)</option>
              <option value="3">3 capas</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Tipo de superficie</label>
            <select
              value={tipoSuperficie}
              onChange={(e) => setTipoSuperficie(e.target.value as TipoSuperficie)}
              className={styles.select}
            >
              {Object.entries(DESCRIPCIONES_SUPERFICIE).map(([key, desc]) => (
                <option key={key} value={key}>
                  {desc} (~{RENDIMIENTOS[key as TipoSuperficie]} m²/L)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Precio por litro (opcional)</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                inputMode="decimal"
                value={precioPorLitro}
                onChange={(e) => setPrecioPorLitro(e.target.value)}
                placeholder="8"
                className={styles.input}
              />
              <span className={styles.unidad}>€/L</span>
            </div>
          </div>

          <div className={styles.botones}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoIcon}>🎨</span>
                <div className={styles.resultadoValor}>
                  {formatNumber(resultado.litrosNecesarios, 1)} L
                </div>
                <div className={styles.resultadoLabel}>
                  de pintura necesarios
                </div>
              </div>

              <div className={styles.detalles}>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Superficie total</span>
                  <span className={styles.detalleValor}>
                    {formatNumber(resultado.metrosCuadrados, 1)} m²
                  </span>
                </div>

                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Botes de 4L</span>
                  <span className={styles.detalleValor}>
                    {resultado.botesPequenos} {resultado.botesPequenos === 1 ? 'bote' : 'botes'}
                  </span>
                </div>

                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Botes de 15L</span>
                  <span className={styles.detalleValor}>
                    {resultado.botesGrandes} {resultado.botesGrandes === 1 ? 'bote' : 'botes'}
                  </span>
                </div>

                {resultado.costeEstimado > 0 && (
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Coste estimado</span>
                    <span className={styles.detalleValor}>
                      {formatNumber(resultado.costeEstimado, 2)} €
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.consejos}>
                <h4>💡 Consejos</h4>
                <ul>
                  <li>Compra un 10% extra para retoques y reserva</li>
                  <li>El rendimiento real varía según marca y técnica</li>
                  <li>Resta puertas y ventanas si no las vas a pintar</li>
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🖌️</span>
              <p>Introduce los datos para calcular la cantidad de pintura</p>
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="Guía de pintura interior y exterior"
        subtitle="Qué tipo de pintura elegir según la estancia, cómo preparar la superficie correctamente y cuándo necesitas imprimación"
      >
        <h3 className={styles.eduTitle}>🎨 Tipos de pintura y sus usos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Acabado</th>
                <th>Ideal para</th>
                <th>Rendimiento aprox.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Plástica mate</td>
                <td>Mate suave</td>
                <td>Dormitorios, salones</td>
                <td>10–12 m²/L</td>
              </tr>
              <tr>
                <td>Plástica satinada</td>
                <td>Ligero brillo</td>
                <td>Cocinas, zonas de paso</td>
                <td>8–10 m²/L</td>
              </tr>
              <tr>
                <td>Esmalte al agua</td>
                <td>Brillante, lavable</td>
                <td>Puertas, muebles, rodapiés</td>
                <td>12–14 m²/L</td>
              </tr>
              <tr>
                <td>Esmalte al aceite</td>
                <td>Muy brillante</td>
                <td>Exteriores, hierro, madera</td>
                <td>14–16 m²/L</td>
              </tr>
              <tr>
                <td>Imprimación</td>
                <td>Sin acabado visual</td>
                <td>Preparación de superficies</td>
                <td>6–8 m²/L</td>
              </tr>
              <tr>
                <td>Temple</td>
                <td>Mate calcáreo</td>
                <td>Techos, zonas con humedad</td>
                <td>8–10 m²/L</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className={styles.eduTitle}>🏠 Situaciones habituales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🛏️</span>
              <h4>Dormitorio o salón</h4>
            </div>
            <p className={styles.escenarioDesc}>Plástica mate en paredes lisas, 2 manos. Si cambias de color oscuro a claro, puede hacer falta una tercera mano.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🍳</span>
              <h4>Cocina o baño</h4>
            </div>
            <p className={styles.escenarioDesc}>Plástica satinada o esmalte lavable. Resisten la humedad y se limpian fácilmente. Evita la pintura mate en estas zonas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🚪</span>
              <h4>Puertas y carpintería</h4>
            </div>
            <p className={styles.escenarioDesc}>Esmalte al agua (secado rápido, menos olor) o al aceite (más durable). Requiere lijar y limpiar antes de aplicar.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🌧️</span>
              <h4>Exterior o fachada</h4>
            </div>
            <p className={styles.escenarioDesc}>Pintura para fachadas con agentes antihumedad y flexibilidad. Verifica temperatura mínima de aplicación (más de 5 °C).</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>❓ Preguntas frecuentes sobre pintura</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Cuántas manos de pintura necesito?</strong>
            <p>Lo habitual son 2 manos. Si cubres un color muy oscuro con uno claro, puede ser necesaria una tercera. La imprimación puede reducir el número de manos en superficies nuevas.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Necesito imprimación siempre?</strong>
            <p>No siempre. Es necesaria en superficies nuevas (pladur, yeso), porosas (cemento), con manchas de humedad o cuando el cambio de color es muy drástico.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo calculo el gotelé correctamente?</strong>
            <p>El gotelé aumenta la superficie real entre un 20% y 40% según su grosor. Usa el tipo de superficie &quot;gotelé&quot; en la calculadora para aplicar automáticamente el factor corrector.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué comprar un 10% extra?</strong>
            <p>Para retoques futuros y zonas que necesitan una tercera mano. Es fundamental que sea de la misma partida (mismo número de lote) para garantizar igual tono de color.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Hay que lijar antes de pintar?</strong>
            <p>Sí, si hay irregularidades, burbujas o pintura antigua en mal estado. En paredes en buen estado basta con limpiar el polvo y desengrasarlas.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pintura usar en baños con humedad?</strong>
            <p>Las pinturas específicas anti-hongos contienen agentes fungicidas. Busca pinturas &quot;anti-moho&quot; o &quot;para zonas húmedas&quot;. También ayuda mejorar la ventilación del baño.</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>📋 Cómo usar esta calculadora paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Elige el modo de cálculo</strong>
              <p>Por metros cuadrados directos si ya sabes la superficie, o por habitación para que la calculadora la estime por ti.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Selecciona el tipo de superficie</strong>
              <p>Lisa, gotelé, rugosa o porosa. El rendimiento varía notablemente: una pared de gotelé consume hasta el doble de pintura que una lisa.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Indica el número de capas</strong>
              <p>Normalmente 2 manos. Para cambios de color muy drásticos o superficies muy absorbentes, considera 3 manos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Introduce el precio por litro (opcional)</strong>
              <p>Añade el precio del litro de la pintura que vas a comprar para calcular el coste total estimado del proyecto.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Compra el resultado más un 10% de margen</strong>
              <p>Asegúrate de que sea el mismo número de lote para garantizar uniformidad de color en toda la superficie.</p>
            </div>
          </div>
        </div>

        <h3 className={styles.eduTitle}>💡 Consejos para pintar mejor</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎨</span>
            <p>Compra toda la pintura del mismo lote. Pequeñas diferencias de tono entre lotes son visibles en la pared.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⬇️</span>
            <p>Pinta siempre de arriba abajo: primero el techo, luego las paredes y por último los rodapiés.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⏱️</span>
            <p>Deja secar completamente entre capas (mínimo 2–4 horas). No apliques la segunda mano con la primera aún húmeda.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💧</span>
            <p>Humedece ligeramente el rodillo antes de empezar. Evitará que absorba demasiada pintura al inicio.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📏</span>
            <p>Cubre rodapiés, marcos y enchufes con cinta de carrocero. Es mucho más rápido que intentar limpiar después.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🫙</span>
            <p>Guarda el sobrante en un tarro hermético bien cerrado. Aguanta meses para pequeños retoques futuros.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes al calcular pintura</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No restar puertas y ventanas: pueden representar el 10–15% de la superficie total de la pared.</li>
            <li>Mezclar pintura de distintos lotes: aunque sean el mismo color, pueden mostrar diferencia de tono visible.</li>
            <li>Pintar sin preparar la superficie: la pintura no adherirá bien sobre polvo, grasa o pintura antigua suelta.</li>
            <li>No proteger el suelo y los muebles: las salpicaduras de pintura en madera o telas son muy difíciles de eliminar.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-pintura')} />

      <ShareCard appName="calculadora-pintura" />
      <Footer appName="calculadora-pintura" />
    </div>
  );
}
