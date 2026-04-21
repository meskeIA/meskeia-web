'use client';
// @disclaimer: exempt
import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorEnergiaNuclear.module.css';

type Seccion = 'fision' | 'fusion' | 'reactores' | 'comparativa';
type TipoReactor = 'PWR' | 'BWR' | 'CANDU' | 'GenIV';

interface DatoComparativa {
  fuente: string;
  icono: string;
  co2: number;
  capacidad: number;
  color: string;
}

interface InfoReactor {
  nombre: string;
  descripcion: string;
  moderador: string;
  refrigerante: string;
  combustible: string;
  porcentaje: string;
  ventaja: string;
}

const DATOS_COMPARATIVA: DatoComparativa[] = [
  { fuente: 'Nuclear', icono: '⚛️', co2: 12, capacidad: 93, color: '#2E86AB' },
  { fuente: 'Eólica', icono: '💨', co2: 11, capacidad: 35, color: '#48A9A6' },
  { fuente: 'Solar', icono: '☀️', co2: 41, capacidad: 25, color: '#F5A623' },
  { fuente: 'Hidroeléctrica', icono: '💧', co2: 24, capacidad: 42, color: '#4A90D9' },
  { fuente: 'Gas natural', icono: '🔥', co2: 490, capacidad: 56, color: '#E8834A' },
  { fuente: 'Carbón', icono: '⚫', co2: 820, capacidad: 59, color: '#6B6B6B' },
];

const INFO_REACTORES: Record<TipoReactor, InfoReactor> = {
  PWR: {
    nombre: 'Reactor de Agua a Presión (PWR)',
    descripcion: 'El tipo más extendido del mundo. El agua a alta presión actúa como moderador y refrigerante sin llegar a hervir. Dos circuitos separados evitan que el agua radiactiva contacte con la turbina.',
    moderador: 'Agua ligera a presión',
    refrigerante: 'Agua ligera (circuito primario)',
    combustible: 'Uranio enriquecido 3-5% (UO₂)',
    porcentaje: '~70% del parque mundial',
    ventaja: 'Alta fiabilidad y madurez tecnológica',
  },
  BWR: {
    nombre: 'Reactor de Agua en Ebullición (BWR)',
    descripcion: 'El agua hierve directamente en el núcleo y el vapor producido mueve la turbina. Diseño más simple que el PWR (un solo circuito), pero el vapor es ligeramente radiactivo.',
    moderador: 'Agua ligera',
    refrigerante: 'Agua ligera (ebullición directa)',
    combustible: 'Uranio enriquecido 2-4% (UO₂)',
    porcentaje: '~20% del parque mundial',
    ventaja: 'Diseño más sencillo, presión de operación menor',
  },
  CANDU: {
    nombre: 'Reactor CANDU (Canada Deuterium Uranium)',
    descripcion: 'Utiliza agua pesada (D₂O) como moderador, lo que permite usar uranio natural sin enriquecer. Puede recargarse en caliente sin apagar el reactor.',
    moderador: 'Agua pesada (D₂O)',
    refrigerante: 'Agua pesada',
    combustible: 'Uranio natural (0,7% U-235)',
    porcentaje: '~5% del parque mundial',
    ventaja: 'Sin necesidad de enriquecimiento de uranio',
  },
  GenIV: {
    nombre: 'Reactores de Generación IV',
    descripcion: 'Tecnologías en desarrollo para la próxima generación: reactores de sales fundidas, de neutrones rápidos (sin moderador), refrigerados por gas helio. Objetivo: más seguros, menos residuos, ciclo de combustible cerrado.',
    moderador: 'Variable (algunos sin moderador)',
    refrigerante: 'Sales fundidas / gas He / sodio líquido',
    combustible: 'Uranio/Torio/MOX (ciclo cerrado)',
    porcentaje: 'En desarrollo (2035-2050)',
    ventaja: 'Seguridad pasiva, residuos reducidos',
  },
};

export default function VisualizadorEnergiaNuclear() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('fision');
  const [factorK, setFactorK] = useState<number>(1.0);
  const [reactorSeleccionado, setReactorSeleccionado] = useState<TipoReactor>('PWR');
  const [metricaComparativa, setMetricaComparativa] = useState<'co2' | 'capacidad'>('co2');

  const secciones: { id: Seccion; label: string; icono: string }[] = [
    { id: 'fision', label: 'Fisión Nuclear', icono: '💥' },
    { id: 'fusion', label: 'Fusión Nuclear', icono: '🌟' },
    { id: 'reactores', label: 'Tipos de Reactor', icono: '🏭' },
    { id: 'comparativa', label: 'Comparativa Energética', icono: '📊' },
  ];

  const estadoReactor =
    factorK < 1 ? 'subcrítico' : factorK === 1 ? 'crítico (estable)' : 'supercrítico';
  const colorEstado =
    factorK < 1 ? '#48A9A6' : factorK === 1.0 ? '#2E86AB' : '#E85D4A';

  const maxComparativa = Math.max(...DATOS_COMPARATIVA.map((d) => d[metricaComparativa]));

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono}>⚛️</div>
        <h1>Visualizador de Energía Nuclear</h1>
        <p>Fisión vs fusión, cadena de reacción y comparativa con fuentes de energía</p>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {secciones.map((s) => (
          <button
            key={s.id}
            className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navBtnActivo : ''}`}
            onClick={() => setSeccionActiva(s.id)}
            aria-pressed={seccionActiva === s.id}
          >
            <span aria-hidden="true">{s.icono}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <main className={styles.contenido}>
        {/* SECCIÓN FISIÓN */}
        {seccionActiva === 'fision' && (
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>💥 Fisión Nuclear</h2>
            <p className={styles.introSeccion}>
              La fisión ocurre cuando un núcleo pesado (U-235 o Pu-239) absorbe un neutrón lento
              y se divide en dos fragmentos más ligeros, liberando energía y más neutrones.
            </p>

            {/* Diagrama de fisión */}
            <div className={styles.diagramaFision}>
              <div className={styles.reaccionFision}>
                <div className={styles.nucleoUranio}>
                  <span className={styles.nucleoLabel}>U-235</span>
                  <span className={styles.neutronEntrante} aria-hidden="true">→ n</span>
                </div>
                <div className={styles.flechaFision} aria-hidden="true">💥</div>
                <div className={styles.productosDiv}>
                  <div className={styles.fragmento} style={{ background: '#2E86AB' }}>
                    <span>Kr-92</span>
                  </div>
                  <div className={styles.fragmento} style={{ background: '#48A9A6' }}>
                    <span>Ba-141</span>
                  </div>
                  <div className={styles.neutronesSalientes}>
                    <span>3 neutrones</span>
                    <span className={styles.energia}>+ ~200 MeV</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cadena de reacción */}
            <div className={styles.cadenaContainer}>
              <h3>Reacción en cadena</h3>
              <div className={styles.cadenaVisual}>
                {[1, 2, 3].map((gen) => (
                  <div key={gen} className={styles.generacion}>
                    <div className={styles.genLabel}>Gen. {gen}</div>
                    {Array.from({ length: Math.pow(3, gen - 1) }).map((_, i) => (
                      <div key={i} className={styles.atomoMini} aria-hidden="true">⚛️</div>
                    ))}
                  </div>
                ))}
              </div>
              <p className={styles.cadenaTexto}>
                Cada fisión produce 3 neutrones → potencial de 3<sup>n</sup> reacciones en la
                generación n. El factor de multiplicación k determina si la reacción se mantiene,
                crece o decrece.
              </p>
            </div>

            {/* Control del factor k */}
            <div className={styles.controlK}>
              <h3>Factor de multiplicación k = {factorK.toFixed(2)}</h3>
              <div
                className={styles.estadoK}
                style={{ borderColor: colorEstado, color: colorEstado }}
              >
                Estado del reactor: <strong>{estadoReactor}</strong>
              </div>
              <label className={styles.sliderLabel} htmlFor="sliderK">
                Ajusta el factor k:
              </label>
              <input
                id="sliderK"
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={factorK}
                onChange={(e) => setFactorK(parseFloat(e.target.value))}
                className={styles.slider}
                aria-valuemin={0.5}
                aria-valuemax={1.5}
                aria-valuenow={factorK}
              />
              <div className={styles.sliderEtiquetas}>
                <span>Subcrítico (k&lt;1)</span>
                <span>Crítico (k=1)</span>
                <span>Supercrítico (k&gt;1)</span>
              </div>
            </div>

            {/* Datos clave */}
            <div className={styles.gridDatos}>
              {[
                { titulo: 'Masa crítica U-235', valor: '~52 kg', desc: 'Esfera de 17 cm de diámetro' },
                { titulo: 'Energía por fisión', valor: '~200 MeV', desc: '3,2 × 10⁻¹¹ julios por átomo' },
                { titulo: 'Densidad energética', valor: '3.900.000 MJ/kg', desc: 'vs 44 MJ/kg del petróleo' },
                { titulo: 'Temperatura núcleo', valor: '~300 °C', desc: 'En reactor PWR con agua a presión' },
              ].map((d) => (
                <div key={d.titulo} className={styles.datoCard}>
                  <div className={styles.datoValor}>{d.valor}</div>
                  <div className={styles.datoTitulo}>{d.titulo}</div>
                  <div className={styles.datoDesc}>{d.desc}</div>
                </div>
              ))}
            </div>

            {/* Escala INES */}
            <div className={styles.inesContainer}>
              <h3>Escala INES de incidentes nucleares</h3>
              <div className={styles.inesGrid}>
                {[
                  { nivel: 1, tipo: 'Anomalía', color: '#7FB3D3', ejemplo: 'Evento sin consecuencias externas' },
                  { nivel: 2, tipo: 'Incidente', color: '#5BA0C4', ejemplo: 'Exposición superior a límites' },
                  { nivel: 3, tipo: 'Incidente grave', color: '#48A9A6', ejemplo: 'Contaminación localizada' },
                  { nivel: 4, tipo: 'Accidente local', color: '#F5A623', ejemplo: 'Exposición letal en instalación' },
                  { nivel: 5, tipo: 'Accidente mayor', color: '#E8834A', ejemplo: 'Three Mile Island (1979)' },
                  { nivel: 6, tipo: 'Accidente grave', color: '#D45B3E', ejemplo: 'Dispersión importante' },
                  { nivel: 7, tipo: 'Accidente mayor', color: '#B03A2E', ejemplo: 'Chernóbil (1986), Fukushima (2011)' },
                ].map((item) => (
                  <div key={item.nivel} className={styles.inesItem} style={{ borderLeftColor: item.color }}>
                    <span className={styles.inesNivel} style={{ background: item.color }}>
                      {item.nivel}
                    </span>
                    <div>
                      <strong>{item.tipo}</strong>
                      <div className={styles.inesEjemplo}>{item.ejemplo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN FUSIÓN */}
        {seccionActiva === 'fusion' && (
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>🌟 Fusión Nuclear</h2>
            <p className={styles.introSeccion}>
              La fusión une dos núcleos ligeros para formar uno más pesado, liberando enormes
              cantidades de energía. Es la fuente de energía del Sol y las estrellas.
            </p>

            {/* Reacción D-T */}
            <div className={styles.diagramaFusion}>
              <h3>Reacción principal: Deuterio + Tritio</h3>
              <div className={styles.reaccionFusion}>
                <div className={styles.nucleoFusion} style={{ background: '#2E86AB' }}>
                  <span>²H</span>
                  <span className={styles.nucleoSubLabel}>Deuterio</span>
                </div>
                <span className={styles.masSymbol} aria-hidden="true">+</span>
                <div className={styles.nucleoFusion} style={{ background: '#48A9A6' }}>
                  <span>³H</span>
                  <span className={styles.nucleoSubLabel}>Tritio</span>
                </div>
                <span className={styles.masSymbol} aria-hidden="true">→</span>
                <div className={styles.nucleoFusion} style={{ background: '#7FB3D3' }}>
                  <span>⁴He</span>
                  <span className={styles.nucleoSubLabel}>Helio-4</span>
                </div>
                <span className={styles.masSymbol} aria-hidden="true">+</span>
                <div className={styles.nucleoFusion} style={{ background: '#F5A623' }}>
                  <span>n</span>
                  <span className={styles.nucleoSubLabel}>Neutrón</span>
                </div>
                <span className={styles.energiaFusion}>17,6 MeV</span>
              </div>
            </div>

            {/* Comparativa D-T vs D-D */}
            <div className={styles.comparativaFusion}>
              <h3>Comparativa de reacciones de fusión</h3>
              <div className={styles.tablaFusion}>
                <div className={styles.tablaHeader}>
                  <span>Reacción</span>
                  <span>Energía</span>
                  <span>Temperatura</span>
                  <span>Dificultad</span>
                </div>
                {[
                  { reaccion: 'D + T → He-4 + n', energia: '17,6 MeV', temp: '100-150 M°C', dificultad: 'Media ★★★', color: '#2E86AB' },
                  { reaccion: 'D + D → He-3 + n', energia: '3,3 MeV', temp: '~300 M°C', dificultad: 'Alta ★★★★', color: '#48A9A6' },
                  { reaccion: 'D + D → T + p', energia: '4,0 MeV', temp: '~300 M°C', dificultad: 'Alta ★★★★', color: '#7FB3D3' },
                  { reaccion: 'p + B-11 → 3 He-4', energia: '8,7 MeV', temp: '~1.000 M°C', dificultad: 'Muy alta ★★★★★', color: '#F5A623' },
                ].map((r) => (
                  <div key={r.reaccion} className={styles.tablaFila} style={{ borderLeftColor: r.color }}>
                    <span className={styles.reaccionLabel}>{r.reaccion}</span>
                    <span>{r.energia}</span>
                    <span>{r.temp}</span>
                    <span>{r.dificultad}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tokamak */}
            <div className={styles.tokamakContainer}>
              <h3>El tokamak: confinamiento magnético</h3>
              <div className={styles.tokamakDiagrama} aria-label="Diagrama esquemático de un tokamak">
                <div className={styles.tokamakAnillo}>
                  <div className={styles.tokamakPlasma}>
                    <span className={styles.tokamakTemp}>100 M°C</span>
                    <span className={styles.tokamakLabel}>Plasma</span>
                  </div>
                  <div className={styles.tokamakCampo} aria-hidden="true">⟳ Campo magnético toroidal</div>
                </div>
              </div>
              <p className={styles.tokamakDesc}>
                El plasma a 100-150 millones de °C (10× más caliente que el núcleo solar) se
                confina mediante campos magnéticos en forma de rosquilla (toroide). Las paredes
                nunca tocan el plasma.
              </p>
            </div>

            {/* ITER */}
            <div className={styles.iterContainer}>
              <h3>ITER: el camino hacia la fusión comercial</h3>
              <div className={styles.iterInfo}>
                <div className={styles.iterDato}>
                  <span className={styles.iterNum}>35</span>
                  <span>países colaborando</span>
                </div>
                <div className={styles.iterDato}>
                  <span className={styles.iterNum}>Q &gt; 10</span>
                  <span>objetivo: 10× más energía que consume</span>
                </div>
                <div className={styles.iterDato}>
                  <span className={styles.iterNum}>500 MW</span>
                  <span>potencia de fusión objetivo</span>
                </div>
              </div>
              <div className={styles.lineaTemporal}>
                {[
                  { año: '1985', evento: 'Acuerdo internacional ITER', estado: 'pasado' },
                  { año: '2020', evento: 'Inicio montaje en Cadarache (Francia)', estado: 'pasado' },
                  { año: '2025', evento: 'Fase de ensamblaje avanzada', estado: 'actual' },
                  { año: '2035', evento: 'Primera operación con plasma', estado: 'futuro' },
                  { año: '2040', evento: 'Experimentos con D-T', estado: 'futuro' },
                  { año: '~2050', evento: 'Primera planta comercial (DEMO)', estado: 'futuro' },
                ].map((e) => (
                  <div key={e.año} className={`${styles.eventoTemporal} ${styles[e.estado]}`}>
                    <span className={styles.eventoAño}>{e.año}</span>
                    <span className={styles.eventoDesc}>{e.evento}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ventajas fusión */}
            <div className={styles.gridDatos}>
              {[
                { titulo: 'Combustible deuterio', valor: '∞ Ilimitado', desc: '33 g por m³ de agua del mar' },
                { titulo: 'Energía por reacción', valor: '17,6 MeV', desc: '4× más que la fisión por masa' },
                { titulo: 'Residuos radiactivos', valor: 'Mínimos', desc: 'Solo estructuras del reactor (decaen en ~100 años)' },
                { titulo: 'Riesgo de accidente', valor: 'Muy bajo', desc: 'El plasma se apaga solo si hay fallo' },
              ].map((d) => (
                <div key={d.titulo} className={styles.datoCard}>
                  <div className={styles.datoValor}>{d.valor}</div>
                  <div className={styles.datoTitulo}>{d.titulo}</div>
                  <div className={styles.datoDesc}>{d.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECCIÓN REACTORES */}
        {seccionActiva === 'reactores' && (
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>🏭 Tipos de Reactor Nuclear</h2>
            <p className={styles.introSeccion}>
              Existen varios diseños de reactores de fisión en operación y desarrollo. Selecciona
              uno para ver sus características y diagrama de funcionamiento.
            </p>

            {/* Selector de reactores */}
            <div className={styles.selectorReactores}>
              {(Object.keys(INFO_REACTORES) as TipoReactor[]).map((tipo) => (
                <button
                  key={tipo}
                  className={`${styles.reactorBtn} ${reactorSeleccionado === tipo ? styles.reactorBtnActivo : ''}`}
                  onClick={() => setReactorSeleccionado(tipo)}
                  aria-pressed={reactorSeleccionado === tipo}
                >
                  {tipo}
                </button>
              ))}
            </div>

            {/* Info del reactor seleccionado */}
            <div className={styles.reactorInfo}>
              <h3>{INFO_REACTORES[reactorSeleccionado].nombre}</h3>
              <p className={styles.reactorDescripcion}>
                {INFO_REACTORES[reactorSeleccionado].descripcion}
              </p>

              {/* Diagrama simplificado */}
              <div className={styles.diagramaReactor} aria-label={`Diagrama de reactor ${reactorSeleccionado}`}>
                <div className={styles.drNucleo}>
                  <span>⚛️ Núcleo</span>
                  <span className={styles.drSubLabel}>Combustible nuclear</span>
                </div>
                <div className={styles.drFlechas} aria-hidden="true">
                  <span>⇅ {INFO_REACTORES[reactorSeleccionado].refrigerante}</span>
                </div>
                <div className={styles.drGenerador}>
                  <span>⚡ Turbina/Generador</span>
                  <span className={styles.drSubLabel}>Electricidad</span>
                </div>
                <div className={styles.drTorre}>
                  <span>🌡️ Torre de refrigeración</span>
                  <span className={styles.drSubLabel}>Disipación calor</span>
                </div>
              </div>

              <div className={styles.reactorCaracteristicas}>
                {[
                  { label: 'Moderador', valor: INFO_REACTORES[reactorSeleccionado].moderador },
                  { label: 'Refrigerante', valor: INFO_REACTORES[reactorSeleccionado].refrigerante },
                  { label: 'Combustible', valor: INFO_REACTORES[reactorSeleccionado].combustible },
                  { label: 'Uso mundial', valor: INFO_REACTORES[reactorSeleccionado].porcentaje },
                  { label: 'Ventaja clave', valor: INFO_REACTORES[reactorSeleccionado].ventaja },
                ].map((c) => (
                  <div key={c.label} className={styles.caracteristicaFila}>
                    <span className={styles.caracLabel}>{c.label}</span>
                    <span className={styles.caracValor}>{c.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reactores en España */}
            <div className={styles.espanaContainer}>
              <h3>Centrales nucleares en España</h3>
              <div className={styles.espanaGrid}>
                {[
                  { central: 'Almaraz I y II', tipo: 'PWR', ubicacion: 'Cáceres', estado: 'Operativa', color: '#2E86AB' },
                  { central: 'Ascó I y II', tipo: 'PWR', ubicacion: 'Tarragona', estado: 'Operativa', color: '#2E86AB' },
                  { central: 'Cofrentes', tipo: 'BWR', ubicacion: 'Valencia', estado: 'Operativa', color: '#48A9A6' },
                  { central: 'Vandellós II', tipo: 'PWR', ubicacion: 'Tarragona', estado: 'Operativa', color: '#2E86AB' },
                  { central: 'Trillo', tipo: 'PWR', ubicacion: 'Guadalajara', estado: 'Operativa', color: '#2E86AB' },
                  { central: 'Garoña', tipo: 'BWR', ubicacion: 'Burgos', estado: 'Cerrada 2021', color: '#999' },
                ].map((c) => (
                  <div key={c.central} className={styles.centralCard} style={{ borderTopColor: c.color }}>
                    <strong>{c.central}</strong>
                    <span className={styles.centralTipo}>{c.tipo}</span>
                    <span className={styles.centralUbicacion}>📍 {c.ubicacion}</span>
                    <span
                      className={styles.centralEstado}
                      style={{ color: c.estado === 'Cerrada 2021' ? '#999' : '#2E86AB' }}
                    >
                      {c.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN COMPARATIVA */}
        {seccionActiva === 'comparativa' && (
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>📊 Comparativa Energética</h2>
            <p className={styles.introSeccion}>
              La energía nuclear destaca por su bajo impacto de CO₂ y su alto factor de capacidad
              (disponibilidad continua), comparables a las renovables pero con producción constante.
            </p>

            {/* Toggle métrica */}
            <div className={styles.toggleMetrica}>
              <button
                className={`${styles.toggleBtn} ${metricaComparativa === 'co2' ? styles.toggleActivo : ''}`}
                onClick={() => setMetricaComparativa('co2')}
                aria-pressed={metricaComparativa === 'co2'}
              >
                CO₂ por kWh (g)
              </button>
              <button
                className={`${styles.toggleBtn} ${metricaComparativa === 'capacidad' ? styles.toggleActivo : ''}`}
                onClick={() => setMetricaComparativa('capacidad')}
                aria-pressed={metricaComparativa === 'capacidad'}
              >
                Factor de capacidad (%)
              </button>
            </div>

            {/* Gráfico de barras CSS */}
            <div className={styles.graficoBarras} role="img" aria-label={`Gráfico comparativo: ${metricaComparativa === 'co2' ? 'emisiones CO₂ por kWh' : 'factor de capacidad'}`}>
              {DATOS_COMPARATIVA.map((dato) => {
                const valor = dato[metricaComparativa];
                const porcentaje = (valor / maxComparativa) * 100;
                return (
                  <div key={dato.fuente} className={styles.barraFila}>
                    <div className={styles.barraLabel}>
                      <span aria-hidden="true">{dato.icono}</span>
                      <span>{dato.fuente}</span>
                    </div>
                    <div className={styles.barraContenedor}>
                      <div
                        className={styles.barraRelleno}
                        style={{
                          width: `${porcentaje}%`,
                          background: dato.color,
                        }}
                        role="presentation"
                      />
                    </div>
                    <div className={styles.barraValor}>
                      {valor}{metricaComparativa === 'co2' ? ' g/kWh' : '%'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Densidad energética */}
            <div className={styles.densidadContainer}>
              <h3>Densidad energética comparada</h3>
              <div className={styles.densidadGrid}>
                {[
                  { fuente: 'Nuclear (fisión)', valor: '3.900.000 MJ/kg', icono: '⚛️', factor: 100 },
                  { fuente: 'Nuclear (fusión, teórica)', valor: '~690.000.000 MJ/kg', icono: '🌟', factor: 100 },
                  { fuente: 'Petróleo', valor: '44 MJ/kg', icono: '🛢️', factor: 8 },
                  { fuente: 'Gas natural', valor: '53 MJ/kg', icono: '🔥', factor: 9 },
                  { fuente: 'Carbón', valor: '24 MJ/kg', icono: '⚫', factor: 6 },
                  { fuente: 'Biomasa', valor: '15 MJ/kg', icono: '🌿', factor: 4 },
                ].map((d) => (
                  <div key={d.fuente} className={styles.densidadCard}>
                    <span className={styles.densidadIcono} aria-hidden="true">{d.icono}</span>
                    <strong className={styles.densidadFuente}>{d.fuente}</strong>
                    <span className={styles.densidadValor}>{d.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Residuos nucleares */}
            <div className={styles.residuosContainer}>
              <h3>Gestión de residuos nucleares</h3>
              <div className={styles.residuosGrid}>
                {[
                  {
                    tipo: 'Alta actividad',
                    porcentaje: '3-5%',
                    descripcion: 'Combustible gastado y líquidos de reprocesamiento',
                    duracion: '10.000-300.000 años',
                    color: '#B03A2E',
                  },
                  {
                    tipo: 'Media actividad',
                    porcentaje: '7%',
                    descripcion: 'Materiales de las instalaciones, filtros, resinas',
                    duracion: '300-10.000 años',
                    color: '#E8834A',
                  },
                  {
                    tipo: 'Baja actividad',
                    porcentaje: '~90%',
                    descripcion: 'Herramientas, ropa, equipos de protección',
                    duracion: '30-300 años',
                    color: '#48A9A6',
                  },
                ].map((r) => (
                  <div key={r.tipo} className={styles.residuoCard} style={{ borderLeftColor: r.color }}>
                    <div className={styles.residuoHeader}>
                      <span className={styles.residuoTipo} style={{ color: r.color }}>
                        {r.tipo}
                      </span>
                      <span className={styles.residuoPorcentaje}>{r.porcentaje} del volumen total</span>
                    </div>
                    <p className={styles.residuoDesc}>{r.descripcion}</p>
                    <span className={styles.residuoDuracion}>⏱ Aislamiento necesario: {r.duracion}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="¿Cómo funciona la energía nuclear?"
        subtitle="Fisión, fusión y comparativa con otras fuentes de energía"
      >
        {/* 1. Tabla comparativa fisión vs fusión */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>Fisión</th>
                <th>Fusión</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Combustible</td>
                <td>Uranio-235, Plutonio-239</td>
                <td>Deuterio (agua del mar), Tritio</td>
              </tr>
              <tr>
                <td>Energía liberada</td>
                <td>~200 MeV/reacción</td>
                <td>~17,6 MeV/reacción (pero 4× más por masa)</td>
              </tr>
              <tr>
                <td>Temperatura necesaria</td>
                <td>Sin umbral de temperatura</td>
                <td>100-150 millones °C</td>
              </tr>
              <tr>
                <td>Residuos</td>
                <td>Sí, de alta actividad (miles de años)</td>
                <td>Mínimos (Helio-4 + neutrón de baja actividad)</td>
              </tr>
              <tr>
                <td>Riesgo de cadena</td>
                <td>Sí (controlado con barras)</td>
                <td>No (sin masa crítica posible)</td>
              </tr>
              <tr>
                <td>Estado comercial</td>
                <td>Operativa (440 reactores en el mundo)</td>
                <td>Experimental (ITER, ~2035-2050)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles de uso */}
        <div className={styles.escenariosGrid}>
          {[
            {
              icono: '🎓',
              titulo: 'Estudiante de física o ingeniería',
              desc: 'Aprende fisión y fusión para el examen o TFG con diagramas y datos exactos.',
            },
            {
              icono: '🌍',
              titulo: 'Ciudadano interesado en energía',
              desc: 'Quiere entender el debate nuclear vs renovables con datos de CO₂ y factor de capacidad.',
            },
            {
              icono: '🏭',
              titulo: 'Ingeniero industrial',
              desc: 'Comprende los tipos de reactor (PWR, BWR, CANDU, Gen IV) y el factor de capacidad del 93%.',
            },
            {
              icono: '📰',
              titulo: 'Persona que sigue la actualidad',
              desc: 'Quiere entender qué es ITER y por qué la fusión comercial tardará tanto en llegar.',
            },
          ].map((p) => (
            <div key={p.titulo} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">{p.icono}</span>
              <strong className={styles.escenarioTitulo}>{p.titulo}</strong>
              <p className={styles.escenarioDesc}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <div className={styles.faqList}>
          {[
            {
              pregunta: '¿Por qué la energía nuclear emite tan poco CO₂ si usa uranio?',
              respuesta: 'El CO₂ no proviene de la operación del reactor, sino de la minería del uranio, la construcción y el desmantelamiento. En el ciclo de vida completo, la nuclear emite solo ~12 g CO₂/kWh, comparable a la eólica y 70 veces menos que el gas natural.',
            },
            {
              pregunta: '¿Qué pasó en Chernóbil y Fukushima?',
              respuesta: 'Chernóbil (1986): reactor RBMK soviético sin cúpula de contención; un test de seguridad fallido provocó una explosión de vapor y un incendio de grafito → nivel 7 INES. Fukushima (2011): un tsunami cortó la refrigeración de emergencia → fusión del núcleo en tres reactores → nivel 7 INES. Ambos son los únicos accidentes de máximo nivel registrados.',
            },
            {
              pregunta: '¿Por qué la fusión lleva 50 años "a 30 años de distancia"?',
              respuesta: 'Los retos de ingeniería son extraordinarios: contener un plasma a 150 millones de °C, desarrollar materiales que soporten el bombardeo de neutrones durante décadas, y conseguir una eficiencia Q > 1 sostenida en el tiempo. Cada avance revela nuevos obstáculos. ITER es el primer experimento diseñado para superar Q = 10.',
            },
            {
              pregunta: '¿Puede explotar una central nuclear como una bomba atómica?',
              respuesta: 'No. Físicamente es imposible. Los reactores comerciales usan uranio enriquecido al 3-5%; las bombas necesitan un 90% o más. Sin la masa supercrítica concentrada y el diseño específico de una bomba, no puede producirse una explosión nuclear. Lo que sí puede ocurrir es una explosión de vapor (Chernóbil) o un incendio de materiales, pero no una explosión atómica.',
            },
            {
              pregunta: '¿Qué se hace con el combustible gastado?',
              respuesta: 'Primero se almacena en piscinas de agua durante 5-10 años para que se enfríe. Luego se traslada a almacenamiento en seco (contenedores metálicos blindados). La solución definitiva es el repositorio geológico profundo (a 500 m bajo tierra), pendiente de implementación definitiva en la mayoría de países, incluida España.',
            },
            {
              pregunta: '¿Cuánto tiempo durarán los combustibles de fisión y fusión?',
              respuesta: 'El uranio conocido, al ritmo actual, duraría ~130 años. Con reactores reproductores (que generan más combustible del que consumen), miles de años. El deuterio del agua del mar —combustible para la fusión— es prácticamente ilimitado: millones de años de suministro energético para toda la humanidad.',
            },
          ].map((item) => (
            <div key={item.pregunta} className={styles.faqItem}>
              <strong className={styles.faqPregunta}>{item.pregunta}</strong>
              <p className={styles.faqRespuesta}>{item.respuesta}</p>
            </div>
          ))}
          <div className={styles.faqTip}>
            💡 <strong>Consejo:</strong> Usa la sección &ldquo;Comparativa Energética&rdquo; para ver los datos de CO₂ y factor de capacidad de cada fuente en perspectiva.
          </div>
        </div>

        {/* 4. Guía paso a paso: cómo genera electricidad una central PWR */}
        <ol className={styles.stepGuide}>
          {[
            { num: 1, titulo: 'Fisión en el núcleo', desc: 'El núcleo de U-235 absorbe un neutrón lento → se fisiona → libera ~200 MeV de energía en forma de calor.' },
            { num: 2, titulo: 'Calentamiento del circuito primario', desc: 'El calor calienta el agua del circuito primario (a alta presión, ~325 °C). La presión impide que hierva.' },
            { num: 3, titulo: 'Intercambiador de calor', desc: 'El circuito primario transfiere su energía al circuito secundario a través de un generador de vapor. El agua secundaria hierve y produce vapor.' },
            { num: 4, titulo: 'La turbina gira', desc: 'El vapor a alta presión hace girar una turbina a ~3.000 rpm. El circuito primario (radiactivo) y el secundario nunca se mezclan.' },
            { num: 5, titulo: 'Generación de electricidad', desc: 'El generador convierte el movimiento rotatorio del eje en electricidad mediante el principio de inducción electromagnética de Faraday.' },
            { num: 6, titulo: 'Condensación y recirculación', desc: 'El condensador enfría el vapor con agua de un río o del mar → vuelve a ser agua líquida → regresa al generador de vapor. Circuito cerrado.' },
            { num: 7, titulo: 'Torres de refrigeración', desc: 'Si las hay, expulsan al aire el calor residual del condensador en forma de vapor de agua visible. No emiten CO₂ ni gases tóxicos.' },
          ].map((paso) => (
            <li key={paso.num} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">{paso.num}</span>
              <div className={styles.stepContent}>
                <strong>{paso.titulo}</strong>
                <p>{paso.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* 5. Datos clave para entender bien la energía nuclear */}
        <div className={styles.tipsGrid}>
          {[
            { icono: '⚡', texto: 'Factor de capacidad del 93%: una central nuclear produce casi al 100% de su potencia los 365 días del año, a diferencia del solar (25%) o eólico (35%).' },
            { icono: '🌍', texto: 'Carbono del ciclo de vida: 12 g CO₂/kWh, comparable a la eólica y 70 veces menos que el gas natural.' },
            { icono: '💧', texto: 'Las torres de refrigeración expulsan vapor de agua puro, no humo ni CO₂. Es una confusión muy habitual en el debate público.' },
            { icono: '🔋', texto: 'Un pellet de uranio de 1 cm³ equivale energéticamente a 3,5 barriles de petróleo o 800 kg de carbón.' },
            { icono: '🚫', texto: 'El 96% del combustible "gastado" es uranio reutilizable. Solo el 4% restante es residuo de alta actividad real.' },
          ].map((tip) => (
            <div key={tip.icono} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
              <p>{tip.texto}</p>
            </div>
          ))}
        </div>

        {/* 6. Warning Box: mitos y confusiones */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Mitos y confusiones habituales sobre la energía nuclear</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ &ldquo;Las torres de refrigeración contaminan&rdquo;</strong> — expulsan vapor de agua puro, no gases tóxicos ni CO₂. Son una imagen icónica pero malinterpretada.</li>
            <li><strong>❌ &ldquo;Chernóbil hizo Europa inhabitable&rdquo;</strong> — la zona de exclusión de 30 km tiene hoy una biodiversidad inusualmente alta precisamente por la ausencia humana.</li>
            <li><strong>❌ &ldquo;La fusión ya produce más energía de la que consume&rdquo;</strong> — el NIF logró Q &gt; 1 en 2022 solo en el plasma; contando toda la energía del láser, el balance energético total sigue siendo negativo.</li>
            <li><strong>❌ &ldquo;Una central nuclear puede explotar como una bomba atómica&rdquo;</strong> — físicamente imposible: el enriquecimiento del combustible (3-5%) es insuficiente para una reacción explosiva supercrítica.</li>
            <li><strong>❌ &ldquo;Los residuos nucleares se pueden tirar al mar&rdquo;</strong> — está prohibido por el Convenio de Londres desde 1993. Los residuos se gestionan en instalaciones terrestres controladas y catalogadas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-energia-nuclear')} />
      <ShareCard appName="visualizador-energia-nuclear" />
      <Footer appName="visualizador-energia-nuclear" />
    </div>
  );
}
