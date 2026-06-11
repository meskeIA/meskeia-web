'use client';
// @disclaimer: exempt

import React, { useState, useMemo } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { getRelatedApps } from '@/data/app-relations';
import styles from './ComparadorTransporte.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type MedioId = 'avion' | 'tren' | 'autobus' | 'coche';

interface ResultadoMedio {
  id: MedioId;
  icono: string;
  nombre: string;
  costeTotal: number;
  costePorPersona: number;
  tiempoHoras: number;
  co2KgTotal: number;
  co2KgPorPersona: number;
  equipaje: string;
  disponible: boolean;
  motivoNoDisponible?: string;
  pros: string[];
  contras: string[];
}

interface BadgesResultado {
  masBarato: MedioId | null;
  masRapido: MedioId | null;
  masSostenible: MedioId | null;
  masFlexible: MedioId;
}

// ─────────────────────────────────────────────
// Presets de rutas españolas
// ─────────────────────────────────────────────

const RUTAS_PRESET = [
  { label: 'Madrid – Barcelona', distancia: 621 },
  { label: 'Madrid – Sevilla', distancia: 534 },
  { label: 'Madrid – Valencia', distancia: 357 },
  { label: 'Madrid – Málaga', distancia: 528 },
  { label: 'Barcelona – Valencia', distancia: 349 },
  { label: 'Madrid – Bilbao', distancia: 395 },
  { label: 'Sevilla – Granada', distancia: 256 },
  { label: 'Madrid – Santiago', distancia: 609 },
];

// ─────────────────────────────────────────────
// Lógica de cálculo
// ─────────────────────────────────────────────

function calcularResultados(
  distanciaKm: number,
  personas: number,
  equipajeGrande: boolean
): ResultadoMedio[] {
  const n = Math.max(1, personas);

  // AVIÓN
  const avionDisponible = distanciaKm >= 150;
  const avionBasePP = avionDisponible ? Math.max(45, 35 + distanciaKm * 0.038) : 0;
  const avionEquipajePP = equipajeGrande ? 30 : 0;
  const avionCostePP = avionBasePP + avionEquipajePP;
  const avionTiempo = avionDisponible ? 2.5 + distanciaKm / 850 : 0;
  const avionCO2PP = Math.round(distanciaKm * 0.255);

  // TREN
  const esTrenRapido = distanciaKm > 200;
  const trenVelocidad = esTrenRapido ? 280 : 110;
  const trenCostePP = Math.max(12, distanciaKm * (esTrenRapido ? 0.095 : 0.07));
  const trenTiempo = distanciaKm / trenVelocidad + 0.5;
  const trenCO2PP = Math.round(distanciaKm * 0.014);

  // AUTOBÚS
  const autobusCostePP = Math.max(7, distanciaKm * 0.044);
  const autobusTiempo = distanciaKm / 82 + 0.3;
  const autobusCO2PP = Math.round(distanciaKm * 0.068);

  // COCHE
  const cocheCostePorKm = 0.085; // combustible + amortización
  const cochePeajes = distanciaKm > 100 ? distanciaKm * 0.011 : 0;
  const cocheCosteTotal = distanciaKm * cocheCostePorKm + cochePeajes;
  const cocheCostePP = cocheCosteTotal / n;
  const cocheVelocidad = distanciaKm > 250 ? 108 : 88;
  const cocheTiempo = distanciaKm / cocheVelocidad + (distanciaKm > 400 ? 0.75 : 0.25);
  const cocheCO2PP = Math.round((distanciaKm * 0.18) / n);

  return [
    {
      id: 'avion',
      icono: '✈️',
      nombre: 'Avión',
      costeTotal: avionCostePP * n,
      costePorPersona: avionCostePP,
      tiempoHoras: avionTiempo,
      co2KgTotal: avionCO2PP * n,
      co2KgPorPersona: avionCO2PP,
      equipaje: equipajeGrande
        ? 'Facturación (23 kg): +30 €/persona'
        : 'Solo equipaje de cabina (gratuito)',
      disponible: avionDisponible,
      motivoNoDisponible: !avionDisponible ? 'No práctico en distancias menores de 150 km' : undefined,
      pros: [
        'Más rápido en larga distancia (>500 km)',
        'Conecta casi cualquier ciudad',
        'Vuelos lowcost frecuentes',
      ],
      contras: [
        'Traslados al aeropuerto (+1-2 h en total)',
        'Facturar equipaje tiene coste extra',
        'Alto impacto ambiental (CO₂)',
        'Sin flexibilidad de horario post-reserva',
      ],
    },
    {
      id: 'tren',
      icono: '🚄',
      nombre: esTrenRapido ? 'Tren (AVE/Alvia)' : 'Tren (Regional)',
      costeTotal: trenCostePP * n,
      costePorPersona: trenCostePP,
      tiempoHoras: trenTiempo,
      co2KgTotal: trenCO2PP * n,
      co2KgPorPersona: trenCO2PP,
      equipaje: '2 bultos hasta 25 kg (gratuito, sin límite conjunto)',
      disponible: true,
      pros: [
        'Salida y llegada en el centro de la ciudad',
        'Equipaje generoso y gratuito',
        'El más sostenible: 18× menos CO₂ que el avión',
        'Alta puntualidad y confort en AVE',
      ],
      contras: [
        'Precio puede ser elevado sin antelación',
        'No llega a todas las ciudades directamente',
        'Recomendable reservar con días de antelación',
      ],
    },
    {
      id: 'autobus',
      icono: '🚌',
      nombre: 'Autobús interurbano',
      costeTotal: autobusCostePP * n,
      costePorPersona: autobusCostePP,
      tiempoHoras: autobusTiempo,
      co2KgTotal: autobusCO2PP * n,
      co2KgPorPersona: autobusCO2PP,
      equipaje: '1 maleta en bodega + equipaje de mano (gratuito)',
      disponible: true,
      pros: [
        'El más económico en la mayoría de rutas',
        '1 maleta en bodega incluida',
        'Muchas frecuencias y horarios',
        'Sin necesidad de reserva anticipada obligatoria',
      ],
      contras: [
        'El más lento por carretera con paradas',
        'Confort más limitado en rutas largas',
        'Las paradas intermedias pueden alargar el viaje',
      ],
    },
    {
      id: 'coche',
      icono: '🚗',
      nombre: 'Coche propio',
      costeTotal: cocheCosteTotal,
      costePorPersona: cocheCostePP,
      tiempoHoras: cocheTiempo,
      co2KgTotal: Math.round(distanciaKm * 0.18),
      co2KgPorPersona: cocheCO2PP,
      equipaje: 'Ilimitado (maletero)',
      disponible: true,
      pros: [
        'Máxima flexibilidad: salida, paradas y destino a tu ritmo',
        'Equipaje completamente ilimitado',
        'Económico con 3-4 personas',
        'Acceso a destinos sin transporte público',
      ],
      contras: [
        'Costoso en solitario vs. opciones colectivas',
        'Fatiga del conductor en rutas largas (>400 km)',
        'Peajes y aparcamiento en destino',
        'Sujeto a tráfico e imprevistos en carretera',
      ],
    },
  ];
}

function formatTiempo(horas: number): string {
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function ComparadorTransporteViaje() {
  const [distanciaKm, setDistanciaKm] = useState<number>(621);
  const [personas, setPersonas] = useState<number>(2);
  const [equipajeGrande, setEquipajeGrande] = useState<boolean>(false);
  const [rutaLabel, setRutaLabel] = useState<string>('Madrid – Barcelona');
  const [mostrarComparativa, setMostrarComparativa] = useState<boolean>(true);

  const resultados = useMemo(
    () => calcularResultados(distanciaKm, personas, equipajeGrande),
    [distanciaKm, personas, equipajeGrande]
  );

  const disponibles = resultados.filter((r) => r.disponible);

  const badges: BadgesResultado = useMemo(() => {
    const cheapest = disponibles.reduce((min, r) =>
      r.costeTotal < min.costeTotal ? r : min
    );
    const fastest = disponibles.reduce((min, r) =>
      r.tiempoHoras < min.tiempoHoras ? r : min
    );
    const greenest = disponibles.reduce((min, r) =>
      r.co2KgTotal < min.co2KgTotal ? r : min
    );
    return {
      masBarato: cheapest.id,
      masRapido: fastest.id,
      masSostenible: greenest.id,
      masFlexible: 'coche',
    };
  }, [disponibles]);

  const aplicarPreset = (label: string, distancia: number) => {
    setRutaLabel(label);
    setDistanciaKm(distancia);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🚄 Comparador de Transporte</h1>
        <p className={styles.heroSubtitle}>
          Avión, tren, autobús o coche — elige el transporte ideal para tu trayecto
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── Configuración ── */}
        <section className={styles.configuracion} aria-label="Parámetros del trayecto">
          <h2 className={styles.seccionTitulo}>Tu trayecto</h2>

          {/* Presets */}
          <div className={styles.presetsLabel}>Rutas populares</div>
          <div className={styles.presets} role="group" aria-label="Rutas predefinidas">
            {RUTAS_PRESET.map((ruta) => (
              <button
                key={ruta.label}
                type="button"
                className={`${styles.presetBtn} ${rutaLabel === ruta.label ? styles.presetActivo : ''}`}
                onClick={() => aplicarPreset(ruta.label, ruta.distancia)}
                aria-pressed={rutaLabel === ruta.label}
              >
                {ruta.label}
                <span className={styles.presetKm}>{ruta.distancia} km</span>
              </button>
            ))}
          </div>

          {/* Controles */}
          <div className={styles.controlesGrid}>
            <div className={styles.campoGrupo}>
              <label htmlFor="distancia" className={styles.campoLabel}>
                Distancia (km)
              </label>
              <input
                id="distancia"
                type="number"
                className={styles.inputNumero}
                value={distanciaKm}
                min={10}
                max={3000}
                onChange={(e) => {
                  setDistanciaKm(Math.max(10, parseInt(e.target.value) || 10));
                  setRutaLabel('');
                }}
                inputMode="numeric"
                aria-describedby="distancia-hint"
              />
              <span id="distancia-hint" className={styles.campoHint}>Entre 10 y 3.000 km</span>
            </div>

            <div className={styles.campoGrupo}>
              <label htmlFor="personas" className={styles.campoLabel}>
                Número de personas
              </label>
              <input
                id="personas"
                type="number"
                className={styles.inputNumero}
                value={personas}
                min={1}
                max={9}
                onChange={(e) => setPersonas(Math.min(9, Math.max(1, parseInt(e.target.value) || 1)))}
                inputMode="numeric"
              />
            </div>

            <div className={styles.campoGrupo}>
              <span className={styles.campoLabel} id="equipaje-label">Equipaje facturado</span>
              <button
                type="button"
                role="switch"
                aria-checked={equipajeGrande}
                aria-labelledby="equipaje-label"
                className={`${styles.toggle} ${equipajeGrande ? styles.toggleOn : ''}`}
                onClick={() => setEquipajeGrande((v) => !v)}
              >
                <span className={styles.toggleThumb} />
                <span className={styles.toggleLabel}>
                  {equipajeGrande ? 'Sí (maleta > cabina)' : 'No (solo cabina)'}
                </span>
              </button>
              <span className={styles.campoHint}>Afecta al coste del vuelo</span>
            </div>
          </div>
        </section>

        {/* ── Resumen por categoría ── */}
        {distanciaKm > 0 && (
          <section className={styles.resumen} aria-label="Mejor opción por categoría">
            <h2 className={styles.seccionTitulo}>Mejor opción por criterio</h2>
            <div className={styles.resumenGrid}>
              {[
                { etiqueta: '💰 Más económico', medioId: badges.masBarato },
                { etiqueta: '⚡ Más rápido', medioId: badges.masRapido },
                { etiqueta: '🌿 Más sostenible', medioId: badges.masSostenible },
                { etiqueta: '🗺️ Más flexible', medioId: badges.masFlexible },
              ].map(({ etiqueta, medioId }) => {
                const medio = resultados.find((r) => r.id === medioId);
                if (!medio) return null;
                return (
                  <div key={etiqueta} className={styles.resumenCard}>
                    <span className={styles.resumenEtiqueta}>{etiqueta}</span>
                    <span className={styles.resumenMedio}>
                      <span aria-hidden="true">{medio.icono}</span> {medio.nombre}
                    </span>
                    {medioId === badges.masBarato && (
                      <span className={styles.resumenValor}>
                        {formatCurrency(medio.costeTotal)}
                      </span>
                    )}
                    {medioId === badges.masRapido && (
                      <span className={styles.resumenValor}>
                        {formatTiempo(medio.tiempoHoras)}
                      </span>
                    )}
                    {medioId === badges.masSostenible && (
                      <span className={styles.resumenValor}>
                        {formatNumber(medio.co2KgTotal, 0)} kg CO₂
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Tarjetas comparativas ── */}
        <section className={styles.tarjetas} aria-label="Comparativa de medios de transporte">
          <div className={styles.tarjetasHeader}>
            <h2 className={styles.seccionTitulo}>Comparativa detallada</h2>
            <button
              type="button"
              className={styles.btnToggleComparativa}
              onClick={() => setMostrarComparativa((v) => !v)}
              aria-expanded={mostrarComparativa}
            >
              {mostrarComparativa ? 'Ocultar detalle' : 'Ver detalle'}
            </button>
          </div>

          {mostrarComparativa && (
            <div className={styles.tarjetasGrid}>
              {resultados.map((r) => (
                <div
                  key={r.id}
                  className={`${styles.tarjeta} ${!r.disponible ? styles.tarjetaNoDisponible : ''}`}
                  aria-label={`${r.nombre}: ${r.disponible ? 'disponible' : 'no disponible'}`}
                >
                  {/* Badges */}
                  <div className={styles.badgesRow} aria-label="Destacados">
                    {badges.masBarato === r.id && r.disponible && (
                      <span className={`${styles.badge} ${styles.badgeBarato}`}>💰 Más barato</span>
                    )}
                    {badges.masRapido === r.id && r.disponible && (
                      <span className={`${styles.badge} ${styles.badgeRapido}`}>⚡ Más rápido</span>
                    )}
                    {badges.masSostenible === r.id && r.disponible && (
                      <span className={`${styles.badge} ${styles.badgeSostenible}`}>🌿 Más sostenible</span>
                    )}
                    {badges.masFlexible === r.id && r.disponible && (
                      <span className={`${styles.badge} ${styles.badgeFlexible}`}>🗺️ Más flexible</span>
                    )}
                  </div>

                  {/* Cabecera */}
                  <div className={styles.tarjetaCabecera}>
                    <span className={styles.tarjetaIcono} aria-hidden="true">{r.icono}</span>
                    <h3 className={styles.tarjetaNombre}>{r.nombre}</h3>
                  </div>

                  {!r.disponible ? (
                    <p className={styles.noDisponibleMsg} role="note">
                      {r.motivoNoDisponible}
                    </p>
                  ) : (
                    <>
                      {/* Métricas principales */}
                      <div className={styles.metricas}>
                        <div className={styles.metrica}>
                          <span className={styles.metricaLabel}>Coste total</span>
                          <span className={styles.metricaValor}>{formatCurrency(r.costeTotal)}</span>
                        </div>
                        <div className={styles.metrica}>
                          <span className={styles.metricaLabel}>Por persona</span>
                          <span className={styles.metricaValor}>{formatCurrency(r.costePorPersona)}</span>
                        </div>
                        <div className={styles.metrica}>
                          <span className={styles.metricaLabel}>Tiempo estimado</span>
                          <span className={styles.metricaValor}>{formatTiempo(r.tiempoHoras)}</span>
                        </div>
                        <div className={styles.metrica}>
                          <span className={styles.metricaLabel}>CO₂ por persona</span>
                          <span className={styles.metricaValorCo2}>
                            {formatNumber(r.co2KgPorPersona, 0)} kg
                          </span>
                        </div>
                      </div>

                      {/* Equipaje */}
                      <div className={styles.equipaje}>
                        <span className={styles.equipajeIcono} aria-hidden="true">🧳</span>
                        <span>{r.equipaje}</span>
                      </div>

                      {/* Pros y contras */}
                      <div className={styles.prosCons}>
                        <ul className={styles.prosList} aria-label={`Ventajas de ${r.nombre}`}>
                          {r.pros.map((p) => (
                            <li key={p} className={styles.prosItem}>{p}</li>
                          ))}
                        </ul>
                        <ul className={styles.consList} aria-label={`Inconvenientes de ${r.nombre}`}>
                          {r.contras.map((c) => (
                            <li key={c} className={styles.consItem}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Nota metodológica ── */}
        <div className={styles.notaMetodologica} role="note">
          <strong>ℹ️ Nota sobre los datos</strong> — Los costes son estimaciones orientativas basadas en precios medios de mercado en España (2025). El avión incluye traslados al aeropuerto (~1 h + 1 h). El coche incluye combustible (8,5 cts/km) y peajes estimados. Las emisiones de CO₂ siguen valores de referencia del transporte europeo. Los precios reales pueden variar significativamente según fecha, operador y disponibilidad.
        </div>
      </main>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="¿Cómo elegir el mejor transporte para tu viaje?"
        subtitle="Guía práctica con comparativas reales y consejos para cada tipo de trayecto"
        icon="🗺️"
      >
        <h3>Comparativa de medios por distancia</h3>
        <p>La elección del transporte depende mucho de la distancia. Aquí tienes la guía rápida:</p>

        <div className={styles.tableWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Distancia</th>
                <th>✈️ Avión</th>
                <th>🚄 Tren</th>
                <th>🚌 Autobús</th>
                <th>🚗 Coche</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>&lt; 150 km</strong></td>
                <td className={styles.celdaMala}>No recomendable</td>
                <td className={styles.celdaBuena}>✅ Ideal</td>
                <td className={styles.celdaMedia}>Aceptable</td>
                <td className={styles.celdaBuena}>✅ Ideal</td>
              </tr>
              <tr>
                <td><strong>150–400 km</strong></td>
                <td className={styles.celdaMedia}>Posible</td>
                <td className={styles.celdaBuena}>✅ Mejor opción</td>
                <td className={styles.celdaMedia}>Económico</td>
                <td className={styles.celdaBuena}>✅ Bueno en grupo</td>
              </tr>
              <tr>
                <td><strong>400–700 km</strong></td>
                <td className={styles.celdaBuena}>✅ Competitivo</td>
                <td className={styles.celdaBuena}>✅ AVE muy rápido</td>
                <td className={styles.celdaMedia}>Lento pero barato</td>
                <td className={styles.celdaMedia}>Largo pero flexible</td>
              </tr>
              <tr>
                <td><strong>&gt; 700 km</strong></td>
                <td className={styles.celdaBuena}>✅ Más rápido</td>
                <td className={styles.celdaMedia}>Depende de ruta</td>
                <td className={styles.celdaMala}>Muy largo</td>
                <td className={styles.celdaMala}>No recomendable</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Los 4 criterios clave para elegir transporte</h3>
        <div className={styles.criteriosGrid}>
          <div className={styles.criterioCard}>
            <h4>💰 Presupuesto</h4>
            <p>El autobús es invariablemente el más barato. El coche es muy económico cuando viajas con 3-4 personas. El tren puede ser competitivo con antelación. El avión varía mucho según fecha y ruta.</p>
          </div>
          <div className={styles.criterioCard}>
            <h4>⏱️ Tiempo real</h4>
            <p>El avión incluye: llegar al aeropuerto (+45 min), facturación/seguridad (+60 min), espera en puerta (+30 min), vuelo, recogida de equipaje (+20 min), traslado destino (+45 min). En total: 2,5-4 h extra.</p>
          </div>
          <div className={styles.criterioCard}>
            <h4>🌿 Impacto ambiental</h4>
            <p>El tren eléctrico emite 14 g CO₂/km/persona vs. 255 g del avión (18× más). El autobús (68 g) y el coche con varios ocupantes son opciones intermedias. Para viajes nacionales, el tren siempre gana en sostenibilidad.</p>
          </div>
          <div className={styles.criterioCard}>
            <h4>🧳 Equipaje</h4>
            <p>El coche permite equipaje ilimitado. El tren: 2 bultos gratuitos (hasta 25 kg). El autobús: 1 maleta en bodega. El avión: solo cabina gratis; facturar cuesta 25-50 € según aerolínea y maleta.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuándo vale la pena coger el avión sobre el tren?</strong>
            <p>En España, para distancias superiores a 600-700 km o cuando no hay AVE directo. Madrid–Canarias o viajes internacionales son casos claros. Para rutas como Madrid–Barcelona (621 km), el AVE es competitivo en tiempo total (2h30 puerta a puerta vs. 3-3,5h en avión contando esperas y traslados) y más cómodo.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo es más barato el coche que el tren?</strong>
            <p>Con 3 o más personas viajando juntas, el coche suele ser más económico que comprar varios billetes de tren. También cuando el destino no tiene buena conexión ferroviaria o necesitas el coche en destino.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Son fiables las estimaciones de coste?</strong>
            <p>Son orientativas. Los vuelos varían enormemente (desde 19 € en oferta hasta 300 € en temporada alta). El tren también varía por anticipación y tipo de tarifa. El autobús es el más estable en precio. Usa esta herramienta para comparar proporciones, no precios exactos.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué medio es mejor para familias con niños?</strong>
            <p>El tren es ideal para familias: espacio para moverse, sin restricción de líquidos, sin tiempo de espera largo, y llega al centro de la ciudad. El coche también funciona bien si el trayecto es corto (&lt;3 h). El avión puede ser estresante con niños pequeños.</p>
          </li>
        </ul>

        <div className={styles.warningBox} role="note">
          <strong>⚠️ Recuerda incluir los tiempos de traslado</strong>
          El tiempo del avión en este comparador incluye los traslados al aeropuerto de origen (+45 min) y al centro de la ciudad de destino (+45 min), más 60 minutos de facturación y seguridad. Son aproximaciones conservadoras: en aeropuertos grandes como El Prat o Barajas, los tiempos pueden ser mayores. El tren parte y llega al centro de la ciudad, por lo que su ventaja real de tiempo es mayor de lo que indica el reloj de vuelo.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-transporte-viaje')} />
      <ShareCard appName="comparador-transporte-viaje" />
      <Footer appName="comparador-transporte-viaje" />
    </div>
  );
}
