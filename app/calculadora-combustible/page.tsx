'use client';

import { useState } from 'react';
import styles from './CalculadoraCombustible.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard } from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type ModoCalculo = 'consumo' | 'viaje';

export default function CalculadoraCombustiblePage() {
  const [modo, setModo] = useState<ModoCalculo>('consumo');

  // Modo consumo
  const [kilometros, setKilometros] = useState('');
  const [litros, setLitros] = useState('');
  const [precioCombustible, setPrecioCombustible] = useState('1,50');

  // Modo viaje
  const [distanciaViaje, setDistanciaViaje] = useState('');
  const [consumoMedio, setConsumoMedio] = useState('');
  const [precioViaje, setPrecioViaje] = useState('1,50');

  const [resultado, setResultado] = useState<{
    consumoL100km?: number;
    costePorKm?: number;
    litrosViaje?: number;
    costeViaje?: number;
    autonomia?: number;
  } | null>(null);

  const parseNum = (val: string): number => {
    return parseFloat(val.replace(',', '.')) || 0;
  };

  const calcularConsumo = () => {
    const km = parseNum(kilometros);
    const lit = parseNum(litros);
    const precio = parseNum(precioCombustible);

    if (km <= 0 || lit <= 0) return;

    const consumoL100km = (lit / km) * 100;
    const costePorKm = (lit * precio) / km;
    const autonomia = precio > 0 ? (50 / precio) / (consumoL100km / 100) : 0; // Con 50€ de combustible

    setResultado({
      consumoL100km,
      costePorKm,
      autonomia,
    });
  };

  const calcularViaje = () => {
    const distancia = parseNum(distanciaViaje);
    const consumo = parseNum(consumoMedio);
    const precio = parseNum(precioViaje);

    if (distancia <= 0 || consumo <= 0) return;

    const litrosViaje = (consumo / 100) * distancia;
    const costeViaje = litrosViaje * precio;

    setResultado({
      litrosViaje,
      costeViaje,
    });
  };

  const calcular = () => {
    if (modo === 'consumo') {
      calcularConsumo();
    } else {
      calcularViaje();
    }
  };

  const limpiar = () => {
    setKilometros('');
    setLitros('');
    setDistanciaViaje('');
    setConsumoMedio('');
    setResultado(null);
  };

  const getEficiencia = (consumo: number): { texto: string; clase: string } => {
    if (consumo < 5) return { texto: 'Excelente', clase: styles.excelente };
    if (consumo < 7) return { texto: 'Muy bueno', clase: styles.muyBueno };
    if (consumo < 9) return { texto: 'Normal', clase: styles.normal };
    if (consumo < 12) return { texto: 'Alto', clase: styles.alto };
    return { texto: 'Muy alto', clase: styles.muyAlto };
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Consumo de Combustible</h1>
        <p className={styles.subtitle}>
          Calcula el consumo de tu vehículo y el coste de tus viajes
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="calculadora-combustible"
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Selector de modo */}
          <div className={styles.modoSelector}>
            <button
              className={`${styles.modoBtn} ${modo === 'consumo' ? styles.active : ''}`}
              onClick={() => { setModo('consumo'); setResultado(null); }}
            >
              ⛽ Calcular Consumo
            </button>
            <button
              className={`${styles.modoBtn} ${modo === 'viaje' ? styles.active : ''}`}
              onClick={() => { setModo('viaje'); setResultado(null); }}
            >
              🚗 Planificar Viaje
            </button>
          </div>

          {modo === 'consumo' ? (
            <>
              <p className={styles.modoDescripcion}>
                Introduce los kilómetros recorridos y litros repostados para calcular tu consumo real.
              </p>

              <div className={styles.inputGroup}>
                <label>Kilómetros recorridos</label>
                <div className={styles.inputConUnidad}>
                  <input
                    type="text"
                    value={kilometros}
                    onChange={(e) => setKilometros(e.target.value)}
                    placeholder="500"
                    className={styles.input}
                  />
                  <span className={styles.unidad}>km</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Litros repostados</label>
                <div className={styles.inputConUnidad}>
                  <input
                    type="text"
                    value={litros}
                    onChange={(e) => setLitros(e.target.value)}
                    placeholder="35"
                    className={styles.input}
                  />
                  <span className={styles.unidad}>L</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Precio del combustible</label>
                <div className={styles.inputConUnidad}>
                  <input
                    type="text"
                    value={precioCombustible}
                    onChange={(e) => setPrecioCombustible(e.target.value)}
                    placeholder="1,50"
                    className={styles.input}
                  />
                  <span className={styles.unidad}>€/L</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className={styles.modoDescripcion}>
                Calcula cuánto combustible necesitarás y cuánto costará tu viaje.
              </p>

              <div className={styles.inputGroup}>
                <label>Distancia del viaje</label>
                <div className={styles.inputConUnidad}>
                  <input
                    type="text"
                    value={distanciaViaje}
                    onChange={(e) => setDistanciaViaje(e.target.value)}
                    placeholder="350"
                    className={styles.input}
                  />
                  <span className={styles.unidad}>km</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Consumo medio del vehículo</label>
                <div className={styles.inputConUnidad}>
                  <input
                    type="text"
                    value={consumoMedio}
                    onChange={(e) => setConsumoMedio(e.target.value)}
                    placeholder="7"
                    className={styles.input}
                  />
                  <span className={styles.unidad}>L/100km</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Precio del combustible</label>
                <div className={styles.inputConUnidad}>
                  <input
                    type="text"
                    value={precioViaje}
                    onChange={(e) => setPrecioViaje(e.target.value)}
                    placeholder="1,50"
                    className={styles.input}
                  />
                  <span className={styles.unidad}>€/L</span>
                </div>
              </div>
            </>
          )}

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
              {modo === 'consumo' && resultado.consumoL100km !== undefined && (
                <>
                  {/* Consumo principal */}
                  <div className={styles.resultadoPrincipal}>
                    <span className={styles.resultadoIcon}>⛽</span>
                    <div className={styles.resultadoValor}>
                      {formatNumber(resultado.consumoL100km, 2)} L/100km
                    </div>
                    <div className={styles.resultadoLabel}>Consumo Medio</div>
                    <div className={`${styles.eficienciaBadge} ${getEficiencia(resultado.consumoL100km).clase}`}>
                      {getEficiencia(resultado.consumoL100km).texto}
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className={styles.detalles}>
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Coste por kilómetro</span>
                      <span className={styles.detalleValor}>
                        {formatNumber(resultado.costePorKm!, 3)} €/km
                      </span>
                    </div>
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Con 50€ recorres aprox.</span>
                      <span className={styles.detalleValor}>
                        {formatNumber(resultado.autonomia!, 0)} km
                      </span>
                    </div>
                  </div>

                  {/* Escala de eficiencia */}
                  <div className={styles.escalaEficiencia}>
                    <h4>Escala de Eficiencia</h4>
                    <div className={styles.escalaBarras}>
                      <div className={`${styles.escalaBarra} ${styles.excelente}`}>
                        <span>&lt;5 L</span>
                        <small>Excelente</small>
                      </div>
                      <div className={`${styles.escalaBarra} ${styles.muyBueno}`}>
                        <span>5-7 L</span>
                        <small>Muy bueno</small>
                      </div>
                      <div className={`${styles.escalaBarra} ${styles.normal}`}>
                        <span>7-9 L</span>
                        <small>Normal</small>
                      </div>
                      <div className={`${styles.escalaBarra} ${styles.alto}`}>
                        <span>9-12 L</span>
                        <small>Alto</small>
                      </div>
                      <div className={`${styles.escalaBarra} ${styles.muyAlto}`}>
                        <span>&gt;12 L</span>
                        <small>Muy alto</small>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {modo === 'viaje' && resultado.litrosViaje !== undefined && (
                <>
                  {/* Coste del viaje */}
                  <div className={styles.resultadoPrincipal}>
                    <span className={styles.resultadoIcon}>🚗</span>
                    <div className={styles.resultadoValor}>
                      {formatCurrency(resultado.costeViaje!)}
                    </div>
                    <div className={styles.resultadoLabel}>Coste Total del Viaje</div>
                  </div>

                  {/* Detalles */}
                  <div className={styles.detalles}>
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Combustible necesario</span>
                      <span className={styles.detalleValor}>
                        {formatNumber(resultado.litrosViaje, 1)} litros
                      </span>
                    </div>
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Ida y vuelta</span>
                      <span className={styles.detalleValor}>
                        {formatCurrency(resultado.costeViaje! * 2)}
                      </span>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className={styles.tip}>
                    <span className={styles.tipIcon}>💡</span>
                    <p>
                      Si viajas con más personas, puedes dividir el coste.
                      Con 4 personas: <strong>{formatCurrency(resultado.costeViaje! / 4)}</strong> por persona.
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🚘</span>
              <p>Introduce los datos para calcular</p>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="Todo sobre el consumo de combustible" subtitle="Aprende a calcular el gasto real de tu vehículo, comparar combustibles y reducir el coste por kilómetro">

        {/* Tabla comparativa combustibles */}
        <h3 className={styles.eduSectionTitle}>⚖️ Gasolina vs Diésel vs GLP vs Eléctrico</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Criterio</th>
                <th>Gasolina</th>
                <th>Diésel</th>
                <th>GLP/GNC</th>
                <th>Eléctrico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Consumo típico</strong></td>
                <td>6–9 L/100km</td>
                <td>4–7 L/100km</td>
                <td>8–11 kg/100km</td>
                <td>15–20 kWh/100km</td>
              </tr>
              <tr>
                <td><strong>Coste por 100 km</strong></td>
                <td>~9–13 €</td>
                <td>~7–11 €</td>
                <td>~5–8 €</td>
                <td>~2–4 € (carga hogar)</td>
              </tr>
              <tr>
                <td><strong>Precio combustible</strong></td>
                <td>~1,50 €/L</td>
                <td>~1,45 €/L</td>
                <td>~0,70 €/kg</td>
                <td>~0,18 €/kWh (hogar)</td>
              </tr>
              <tr>
                <td><strong>Autonomía media</strong></td>
                <td>500–700 km</td>
                <td>700–1.000 km</td>
                <td>300–500 km</td>
                <td>250–600 km</td>
              </tr>
              <tr>
                <td><strong>Emisiones CO₂</strong></td>
                <td>~120–160 g/km</td>
                <td>~100–140 g/km</td>
                <td>~80–120 g/km</td>
                <td>0 g/km (local)</td>
              </tr>
              <tr>
                <td><strong>Ideal para</strong></td>
                <td>Ciudad y carretera mixta</td>
                <td>Carretera larga, +20.000 km/año</td>
                <td>Flotas, autónomos con muchos km</td>
                <td>Ciudad, hasta 80 km/día</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h3 className={styles.eduSectionTitle}>💼 Cuándo usar esta calculadora</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏙️</span>
              <h4>Commuter diario</h4>
            </div>
            <p className={styles.escenarioDesc}>Calculas 30 km diarios × 5 días = 150 km/semana. Con un consumo de 7 L/100km y gasolina a 1,52 €/L, son <strong>15,96 €/semana</strong> o ~830 €/año solo en combustible para ir al trabajo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🛣️</span>
              <h4>Planificar viaje largo</h4>
            </div>
            <p className={styles.escenarioDesc}>Madrid–Barcelona son 620 km. Con 6,5 L/100km y gasolina a 1,50 €/L, el viaje cuesta <strong>60,45 €</strong> en combustible. Divide entre pasajeros para comparar con el tren (AVE ~45–90 €/persona).</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🚗</span>
              <h4>Comparar dos coches</h4>
            </div>
            <p className={styles.escenarioDesc}>Coche A consume 5 L/100km, coche B consume 9 L/100km. Si recorres 15.000 km/año, la diferencia es <strong>600 L × 1,50 € = 900 €/año</strong>. En 5 años, 4.500 € de diferencia solo en combustible.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏢</span>
              <h4>Gestión de flota</h4>
            </div>
            <p className={styles.escenarioDesc}>Registra el consumo real de cada vehículo de empresa. Un camión con consumo de 28 L/100km recorriendo 5.000 km/mes gasta <strong>2.030 €/mes</strong> en combustible. Detectar anomalías del ±2 L puede suponer 145 €/mes de ahorro.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3 className={styles.eduSectionTitle}>❓ Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué es el consumo homologado y por qué difiere del real?</h4>
            <p>El consumo homologado se mide en ciclos de laboratorio WLTP (desde 2018) en condiciones ideales: temperatura controlada, sin carga, sin aire acondicionado. En conducción real el consumo suele ser un <strong>15–25% mayor</strong> por el tráfico, la climatización, el peso de los pasajeros y el estilo de conducción. Usa esta calculadora con tus datos reales para obtener cifras fiables.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿A partir de cuántos kilómetros anuales compensa el diésel sobre la gasolina?</h4>
            <p>El diésel tiene mayor precio de compra (+2.000–5.000 €) y mantenimiento más caro (filtro de partículas, AdBlue), pero consume menos. El punto de equilibrio está entre <strong>20.000–25.000 km/año</strong>. Si haces menos, la gasolina suele ser más rentable. Los GNC/GLP pueden amortizarse antes si existe red de suministro cercana.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuánto ahorra realmente conducir a 110 km/h vs 120 km/h?</h4>
            <p>La resistencia aerodinámica aumenta con el cuadrado de la velocidad. Pasar de 120 a 110 km/h reduce el consumo entre un <strong>10–15%</strong> en autopista. En un coche con 7 L/100km a 1,50 €/L, en un viaje de 500 km: a 120 km/h son 52,50 €; a 110 km/h son ~46,25 €. Ahorras ~6,25 € y tardas solo 5 minutos más.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Compensa usar gasolina de mayor octanaje (95 vs 98)?</h4>
            <p>La gasolina 98 cuesta ~10–15 cts/L más que la 95. En motores modernos con turbo puede mejorar ligeramente el rendimiento, pero el ahorro en consumo rara vez compensa la diferencia de precio. <strong>Solo tiene sentido en coches deportivos</strong> con motor de alta compresión que el fabricante recomiende expresamente. Consulta el manual del vehículo.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo afecta el aire acondicionado al consumo?</h4>
            <p>El A/C aumenta el consumo entre un <strong>5–20%</strong> dependiendo del coche y la temperatura exterior. En ciudad puede suponer +1–2 L/100km. En autopista a velocidades altas, abre las ventanas y el aumento de resistencia aerodinámica puede ser mayor que usar el A/C. Por encima de 80 km/h, el A/C suele ser más eficiente que las ventanillas abiertas.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo merece la pena compartir coche (carpool)?</h4>
            <p>Si 4 personas hacen el mismo trayecto Madrid–Valencia (360 km), el gasto en combustible se divide entre 4: de ~32 € por persona en coche propio a <strong>~8 € por persona</strong> en carpool. Plataformas como BlaBlaCar permiten recuperar el coste del combustible legalmente. Para trayectos diarios de trabajo, el ahorro anual puede superar 1.500 €.</p>
          </div>
        </div>

        {/* Guía paso a paso */}
        <h3 className={styles.eduSectionTitle}>📋 Cómo reducir tu gasto en combustible</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Mide tu consumo real con esta calculadora</h4>
              <p>Llena el depósito a tope, resetea el cuentakilómetros. En el próximo repostaje completo, anota los kilómetros recorridos y los litros repostados. Repite 2–3 veces para obtener una media fiable y eliminar variaciones puntuales.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Revisa la presión de los neumáticos (mensual)</h4>
              <p>Neumáticos con 0,5 bar menos de presión aumentan el consumo un 3%. Consulta la etiqueta de la puerta del conductor (no el máximo grabado en el neumático). Infla en frío, antes de circular. Tarda 5 minutos y puede ahorrarte 50–80 €/año.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Cambia tu estilo de conducción</h4>
              <p>La conducción eficiente puede reducir el consumo un 15–25%: anticipa frenadas y levanta el pie antes, sube de marcha entre 2.000–2.500 rpm, mantén velocidad constante en autopista. El motor apagado en paradas largas (más de 30 segundos) ahorra más que el arranque.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Elimina peso y resistencia innecesarios</h4>
              <p>100 kg extra aumentan el consumo un 3–5%. Vacía el maletero de objetos permanentes. Las barras de techo vacías añaden un 10% de consumo en autopista — retíralas cuando no las uses. Cada 10 kg menos = ~0,5 L/100km menos en ciudad.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Mantén el coche en buen estado</h4>
              <p>Un filtro de aire obstruido puede aumentar el consumo hasta un 10%. El aceite de motor debe cambiarse según el fabricante (no al llegar al negro). Las bujías en mal estado en gasolina pueden suponer +15% de consumo. El mantenimiento preventivo siempre es más barato que el correctivo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h4>Busca el precio más bajo de combustible</h4>
              <p>Apps como Gasolineras España (DGT) muestran los precios en tiempo real. Las gasolineras de supermercados (Repsol en Alcampo, BP en Carrefour) suelen ser 5–12 cts/L más baratas. En 50 litros son hasta 6 € de ahorro por repostaje. Con 12 repostajes al año, 72 € menos.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <h3 className={styles.eduSectionTitle}>✅ 6 hábitos del conductor eficiente</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⛽</span>
            <h4>Repostad con el depósito a un cuarto</h4>
            <p>No esperes al mínimo — la bomba se calienta con el depósito bajo. Tampoco lo llenes siempre a tope: el peso extra del combustible consume más en ciudad.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🌡️</span>
            <h4>Pre-climatiza enchufado (eléctrico/híbrido)</h4>
            <p>Si tienes coche eléctrico o híbrido enchufable, pre-climatiza con el coche conectado a la red antes de salir. Conservas la batería y partes a temperatura ideal sin consumirla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🛣️</span>
            <h4>Usa el modo Eco o similar en trayectos largos</h4>
            <p>La mayoría de coches modernos tienen modo Eco que suaviza la respuesta del acelerador y ajusta el A/C. Actívalo en autopista — puede reducir el consumo un 5–8% sin notar diferencia de conducción.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📱</span>
            <h4>Usa el navegador para evitar retenciones</h4>
            <p>Waze o Google Maps en tiempo real evitan atascos. Circular en ciudad parado consume más que en fluidez. Un desvío de 5 km en fluidez puede ser más eficiente que 2 km en retención.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔧</span>
            <h4>Cambia el aceite por viscosidad adecuada</h4>
            <p>Los aceites de baja viscosidad (5W-30, 0W-20) recomendados por el fabricante reducen la fricción interna. Usar un aceite más espeso del recomendado puede aumentar el consumo un 1–2%.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🚶</span>
            <h4>Evalúa alternativas para trayectos cortos</h4>
            <p>El motor frío (menos de 5 km) consume el doble del normal y genera más emisiones. Considera la bicicleta, el transporte público o ir andando para trayectos de menos de 3 km — además de ahorrar, reduces el desgaste del motor.</p>
          </div>
        </div>

        {/* Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores que disparan tu gasto en combustible</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Conducir con neumáticos bajos de presión:</strong> Cada 0,5 bar menos aumenta el consumo un 3% y reduce la seguridad. Comprueba mensualmente y siempre antes de un viaje largo.</li>
            <li><strong>❌ Acelerar hasta el máximo antes de cambiar de marcha:</strong> En gasolina, subir de marcha a 2.500 rpm en lugar de 3.500 rpm puede reducir el consumo un 10–15%. En diésel, ya a 2.000 rpm.</li>
            <li><strong>❌ Llenar el depósito hasta arriba en verano:</strong> El calor dilata los líquidos. Las gasolineras tienen compartimentos de ventilación; al llenar a tope en verano puedes desperdiciar algunos centilitros y ensuciar el sistema de recuperación de vapores.</li>
            <li><strong>❌ Ignorar la luz de presión de neumáticos (TPMS):</strong> Esa luz anaranjada con el neumático no es decorativa. Conduce con cuidado hasta la gasolinera más próxima e infla. Cada kilómetro con presión baja aumenta el desgaste y el consumo.</li>
            <li><strong>❌ Cambiar a punto muerto en bajadas (coches modernos):</strong> En los coches con inyección electrónica (desde los 90), al soltar el acelerador en marcha el motor NO consume combustible (corte de inyección). En punto muerto, sí consume para mantener el ralentí. Mantén la marcha engranada en bajadas.</li>
            <li><strong>❌ Comparar solo el precio del carburante sin calcular el coste por kilómetro:</strong> Un coche que consume 5 L/100km con gasolina a 1,60 €/L cuesta 0,08 €/km. Uno con 8 L/100km y gasolina a 1,45 €/L cuesta 0,116 €/km. El precio en el surtidor no cuenta la historia completa.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-combustible')} />

      <ShareCard appName="calculadora-combustible" />
      <Footer appName="calculadora-combustible" />
    </div>
  );
}
