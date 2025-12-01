'use client';

import { useState } from 'react';
import styles from './CalculadoraCombustible.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { formatNumber, formatCurrency } from '@/lib';

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

      {/* Consejos */}
      <div className={styles.consejos}>
        <h3>💡 Consejos para reducir el consumo</h3>
        <div className={styles.consejosGrid}>
          <div className={styles.consejoItem}>
            <strong>Presión de neumáticos</strong>
            <p>Revísala mensualmente. Neumáticos bajos aumentan el consumo hasta un 3%.</p>
          </div>
          <div className={styles.consejoItem}>
            <strong>Conducción suave</strong>
            <p>Evita acelerones y frenazos bruscos. Anticípate al tráfico.</p>
          </div>
          <div className={styles.consejoItem}>
            <strong>Velocidad constante</strong>
            <p>Usa el control de crucero en autopista. A 120 km/h consumes un 20% más que a 100 km/h.</p>
          </div>
          <div className={styles.consejoItem}>
            <strong>Mantenimiento</strong>
            <p>Filtros de aire limpios y aceite en buen estado mejoran la eficiencia.</p>
          </div>
        </div>
      </div>

      <Footer appName="calculadora-combustible" />
    </div>
  );
}
