'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorEconomiaCircular.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// --- Tipos ---

interface EstrategiaItem {
  id: number;
  nombre: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
  impacto: string;
  legislacion?: string;
}

interface MaterialResiduos {
  nombre: string;
  tasaActual: number;
  objetivoUE: number;
  emoji: string;
}

interface CasoExito {
  id: string;
  empresa: string;
  icono: string;
  pais: string;
  modelo: string;
  resultados: string;
  aplicacionPersonal: string;
}

// --- Datos ---

const ESTRATEGIAS: EstrategiaItem[] = [
  {
    id: 1,
    nombre: 'Rediseñar',
    icono: '🔧',
    descripcion: 'Productos concebidos desde el inicio para durar, ser reparados, actualizados y desmontados al final de su vida. El diseño determina el 80% del impacto ambiental.',
    ejemplo: 'Fairphone (móvil modular y reparable), muebles IKEA con piezas de repuesto disponibles 20 años.',
    impacto: 'Reducción de hasta 90% de residuos al fin de vida si se diseña para el desmontaje.',
    legislacion: 'Reglamento de Ecodiseño UE 2024: obliga a productos con repuestos disponibles mínimo 10 años.',
  },
  {
    id: 2,
    nombre: 'Reducir',
    icono: '⬇️',
    descripcion: 'Consumir menos desde el origen: menos materiales en el producto, menos embalaje, menos energía. La mejor basura es la que no se genera.',
    ejemplo: 'Concentrados de limpieza que reducen el plástico un 75%, packaging mínimo en Apple (cajas cada vez más pequeñas).',
    impacto: 'Cada kg de producto no fabricado ahorra entre 5 y 50 kg de CO₂ según el sector.',
  },
  {
    id: 3,
    nombre: 'Reutilizar',
    icono: '🔄',
    descripcion: 'Usar el mismo producto varias veces sin transformarlo ni procesarlo. Incluye segunda mano, alquiler, préstamo y modelos de suscripción.',
    ejemplo: 'Wallapop, Vinted, sistemas de envases retornables, herramientas compartidas en comunidades de vecinos.',
    impacto: 'Reutilizar una prenda de ropa 9 veces más reduce su huella de carbono un 30%.',
  },
  {
    id: 4,
    nombre: 'Reparar',
    icono: '🛠️',
    descripcion: 'Extender la vida útil del producto arreglando lo que falla. En Europa se han perdido 30 millones de empleos de reparación en 30 años.',
    ejemplo: 'Repair cafés (talleres comunitarios gratuitos), iFixit (guías de reparación), garantías de piezas de repuesto.',
    impacto: 'Reparar un smartphone ahorra ~30 kg de CO₂ frente a comprar uno nuevo.',
    legislacion: 'Derecho a Reparar UE (2024): fabricantes obligados a vender piezas de repuesto a precio razonable.',
  },
  {
    id: 5,
    nombre: 'Renovar / Remanufacturar',
    icono: '♻️',
    descripcion: 'Devolver el producto a condición igual o mejor que el original usando piezas recuperadas. Industria de 30.000 M€ en Europa.',
    ejemplo: 'Caterpillar remanufactura motores con 85% de piezas originales. Renault Flins: 160.000 piezas/año.',
    impacto: 'Ahorra hasta 80% de energía y 88% de agua frente a fabricar desde materias primas.',
  },
  {
    id: 6,
    nombre: 'Reciclar',
    icono: '🗑️',
    descripcion: 'Recuperar los materiales para convertirlos en nuevas materias primas. Es la estrategia más conocida pero la menos eficiente de las 6 superiores.',
    ejemplo: 'Reciclaje de aluminio (ahorra 95% de energía vs bauxita), vidrio reciclado indefinidamente sin perder calidad.',
    impacto: 'Reciclar una tonelada de papel ahorra 17 árboles, 7.000 litros de agua y 4.000 kWh.',
  },
  {
    id: 7,
    nombre: 'Recuperar energía',
    icono: '🔥',
    descripcion: 'Último recurso cuando ninguna opción anterior es viable: incineración con recuperación de calor o electricidad. Solo para residuos no reciclables.',
    ejemplo: 'Plantas de valorización energética de residuos urbanos en Vizcaya, Madrid Sur (Valdemingómez).',
    impacto: 'Mucho mejor que el vertedero, pero recupera solo el 30-35% de la energía del producto original.',
  },
];

const MATERIALES: MaterialResiduos[] = [
  { nombre: 'Papel/Cartón', tasaActual: 81, objetivoUE: 85, emoji: '📄' },
  { nombre: 'Vidrio', tasaActual: 77, objetivoUE: 80, emoji: '🍶' },
  { nombre: 'Metal', tasaActual: 82, objetivoUE: 85, emoji: '🥫' },
  { nombre: 'Plástico', tasaActual: 28, objetivoUE: 55, emoji: '🧴' },
  { nombre: 'Materia orgánica', tasaActual: 18, objetivoUE: 60, emoji: '🌿' },
];

const CASOS_EXITO: CasoExito[] = [
  {
    id: 'renault',
    empresa: 'Renault Flins',
    icono: '🚗',
    pais: 'Francia',
    modelo: 'Fábrica de remanufactura: toma piezas usadas de vehículos fuera de uso, las desmonta, inspecciona, repara y garantiza igual que las nuevas.',
    resultados: '160.000 piezas remanufacturadas/año. 80% menos energía que fabricar nueva. Precio al consumidor: 30-50% menos que pieza original. 2.500 empleados en el ciclo circular.',
    aplicacionPersonal: 'Cuando tu coche necesite una pieza cara, busca piezas remanufacturadas certificadas. Son legalmente equivalentes a las nuevas con garantía igual.',
  },
  {
    id: 'patagonia',
    empresa: 'Patagonia',
    icono: '🧥',
    pais: 'EE.UU.',
    modelo: 'Programa Worn Wear: reparación gratuita de cualquier prenda Patagonia, compra-venta de segunda mano oficial, garantía de vida del producto. Lema: "No compres esta chaqueta".',
    resultados: 'Más de 100.000 prendas reparadas al año. Mercado Worn Wear mueve millones €/año. Reducción 50% huella carbono por prenda vendida vs modelo tradicional.',
    aplicacionPersonal: 'Invierte en ropa de calidad con política de reparación. Una prenda de 150€ que dura 10 años es más barata que tres de 50€ que duran 3 años cada una.',
  },
  {
    id: 'interface',
    empresa: 'Interface',
    icono: '🏢',
    pais: 'EE.UU./Global',
    modelo: 'Moquetas 100% reciclables diseñadas para ser devueltas al fabricante al final de su vida. Programa ReEntry de recogida gratuita. Materiales reciclados en el 60% de la producción.',
    resultados: 'Carbono neutral desde 2019 (toda la cadena). 500.000 toneladas de residuos evitadas desde 1994. Objetivo: carbono negativo en 2040 (Mission Zero → Climate Take Back).',
    aplicacionPersonal: 'En decisiones de reforma u oficina, busca proveedores con programa take-back. A menudo el coste total de ciclo de vida es menor pese a precio inicial más alto.',
  },
  {
    id: 'ecoembes',
    empresa: 'Ecoembes',
    icono: '♻️',
    pais: 'España',
    modelo: 'Sistema de financiación de reciclaje: las empresas pagan una ecotasa según el envase que ponen en el mercado. Ecoembes financia la recogida selectiva de 63 millones de españoles.',
    resultados: 'Gestiona 1,6 millones de toneladas de envases/año. Financia 8.000+ puntos limpios. Tasa de reciclaje envases 2022: 77% (objetivo UE 2025: 65%).',
    aplicacionPersonal: 'El punto amarillo (plástico/metal/brik), verde (vidrio) y azul (papel) están financiados por las empresas que ponen esos envases en el mercado. Usarlos cuesta €0.',
  },
];

// --- Constantes comparativa ---
const COMPARATIVA_IMPACTO = [
  { categoria: 'CO₂ por kg producto', lineal: '8,2 kg', circular: '1,4 kg', ahorro: '83%' },
  { categoria: 'Agua consumida', lineal: '120 litros', circular: '18 litros', ahorro: '85%' },
  { categoria: 'Materias primas', lineal: '100% vírgenes', circular: '45% vírgenes', ahorro: '55%' },
  { categoria: 'Residuo generado', lineal: '~95% al vertedero', circular: '<5% pérdida', ahorro: '95%' },
];

// --- Componente principal ---

export default function VisualizadorEconomiaCircular() {
  const [modoLineal, setModoLineal] = useState(true);
  const [estrategiaActiva, setEstrategiaActiva] = useState<number | null>(null);
  const [casoActivo, setCasoActivo] = useState<string | null>(null);
  const [sliderAlemania, setSliderAlemania] = useState(0);

  const relatedApps = getRelatedApps('visualizador-economia-circular');

  const toggleEstrategia = useCallback((id: number) => {
    setEstrategiaActiva(prev => (prev === id ? null : id));
  }, []);

  const toggleCaso = useCallback((id: string) => {
    setCasoActivo(prev => (prev === id ? null : id));
  }, []);

  // Cálculo slider Alemania (tasa reciclaje ~67% vs España 36%)
  const porcentajeAleFactor = sliderAlemania / 100;
  const toneladasCO2Evitadas = Math.round(porcentajeAleFactor * 4200000); // 4,2 Mt CO₂ potencial
  const materiasAhorradas = Math.round(porcentajeAleFactor * 6800000); // 6,8 Mt materias primas

  function getColorMaterial(tasaActual: number, objetivoUE: number): string {
    const ratio = tasaActual / objetivoUE;
    if (ratio >= 0.95) return '#48A9A6'; // verde teal
    if (ratio >= 0.7) return '#F59E0B';  // amarillo
    return '#EF4444';                     // rojo
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Economía y Sostenibilidad</span>
          <h1 className={styles.heroTitle}>Economía Circular</h1>
          <p className={styles.heroSubtitle}>De lo Lineal a los Ciclos Cerrados</p>
          <p className={styles.heroDesc}>
            Del modelo "tomar-fabricar-desechar" a sistemas donde los residuos son recursos.
            Estrategias, datos de España y casos reales que funcionan.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* SECCIÓN 1: Lineal vs Circular */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚡</span>
          <h2 className={styles.sectionTitle}>Lineal vs Circular</h2>
          <p className={styles.sectionSubtitle}>
            Dos modelos económicos: uno que agota, otro que regenera
          </p>
        </div>

        <div className={styles.toggleWrapper}>
          <button
            className={modoLineal ? styles.btnToggleActivo : styles.btnToggle}
            onClick={() => setModoLineal(true)}
            aria-pressed={modoLineal}
          >
            📉 Modelo Lineal
          </button>
          <button
            className={!modoLineal ? styles.btnToggleActivo : styles.btnToggle}
            onClick={() => setModoLineal(false)}
            aria-pressed={!modoLineal}
          >
            🔄 Modelo Circular
          </button>
        </div>

        <div className={styles.comparacionWrapper}>
          {modoLineal ? (
            <div className={styles.diagramaLineal}>
              <h3 className={styles.diagramaTitulo}>Economía Lineal</h3>
              <div className={styles.flujoLineal}>
                {[
                  { etapa: '🌍', nombre: 'Extraer', coste: '+CO₂ extracción' },
                  { etapa: '🏭', nombre: 'Fabricar', coste: '+Energía/agua' },
                  { etapa: '🚛', nombre: 'Distribuir', coste: '+Emisiones transporte' },
                  { etapa: '🛒', nombre: 'Usar', coste: 'Vida útil corta' },
                  { etapa: '🗑️', nombre: 'Desechar', coste: 'Pérdida total de valor' },
                ].map((paso, i) => (
                  <div key={i} className={styles.pasoLineal}>
                    <div className={styles.pasoIcono}>{paso.etapa}</div>
                    <div className={styles.pasoNombre}>{paso.nombre}</div>
                    <div className={styles.pasoCoste}>{paso.coste}</div>
                    {i < 4 && <div className={styles.flechaLineal} aria-hidden="true">→</div>}
                  </div>
                ))}
              </div>
              <div className={styles.warningBox}>
                <strong>Resultado:</strong> 95% de los materiales se pierden tras el primer uso.
                Cada año se extraen 92.000 millones de toneladas de recursos vírgenes a nivel global.
              </div>
            </div>
          ) : (
            <div className={styles.diagramaCircular}>
              <h3 className={styles.diagramaTitulo}>Economía Circular</h3>
              <div className={styles.cicloCircular}>
                {[
                  { etapa: '🔧', estrategia: 'Rediseñar', descripcion: 'Durable, reparable, desmontable' },
                  { etapa: '⬇️', estrategia: 'Reducir', descripcion: 'Menos materiales desde el origen' },
                  { etapa: '🔄', estrategia: 'Reutilizar', descripcion: 'Segunda vida sin transformar' },
                  { etapa: '🛠️', estrategia: 'Reparar', descripcion: 'Extender vida útil' },
                  { etapa: '♻️', estrategia: 'Renovar', descripcion: 'Remanufacturar al estado original' },
                  { etapa: '🗑️', estrategia: 'Reciclar', descripcion: 'Recuperar materiales' },
                ].map((item, i) => (
                  <div key={i} className={styles.pasoCircular}>
                    <div className={styles.pasoIcono}>{item.etapa}</div>
                    <div className={styles.pasoNombre}>{item.estrategia}</div>
                    <div className={styles.pasoCoste}>{item.descripcion}</div>
                  </div>
                ))}
              </div>
              <div className={styles.successBox}>
                <strong>Resultado:</strong> Los residuos de unos son los recursos de otros.
                La economía circular podría eliminar el 45% de las emisiones globales de CO₂.
              </div>
            </div>
          )}
        </div>

        <div className={styles.comparativaTablaWrapper}>
          <h3 className={styles.comparativaTitulo}>Impacto por kg de producto fabricado</h3>
          <div className={styles.comparativaTabla}>
            <div className={styles.tablaHeader}>
              <span>Indicador</span>
              <span>Lineal</span>
              <span>Circular</span>
              <span>Ahorro</span>
            </div>
            {COMPARATIVA_IMPACTO.map((fila, i) => (
              <div key={i} className={styles.tablaFila}>
                <span className={styles.tablaCategoria}>{fila.categoria}</span>
                <span className={styles.tablaLineal}>{fila.lineal}</span>
                <span className={styles.tablaCircular}>{fila.circular}</span>
                <span className={styles.tablaAhorro}>{fila.ahorro}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Las 7 estrategias */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏆</span>
          <h2 className={styles.sectionTitle}>Las 7 Estrategias</h2>
          <p className={styles.sectionSubtitle}>
            Ordenadas de más a menos eficiente — las primeras conservan más valor
          </p>
        </div>

        <div className={styles.estrategiaPiramide}>
          {ESTRATEGIAS.map((estrategia) => {
            const isActiva = estrategiaActiva === estrategia.id;
            return (
              <div key={estrategia.id} className={styles.estrategiaFila}>
                <button
                  className={isActiva ? styles.estrategiaCardActiva : styles.estrategiaCard}
                  onClick={() => toggleEstrategia(estrategia.id)}
                  aria-expanded={isActiva}
                >
                  <span className={styles.estrategiaPosicion}>#{estrategia.id}</span>
                  <span className={styles.estrategiaIcono} aria-hidden="true">{estrategia.icono}</span>
                  <span className={styles.estrategiaNombre}>{estrategia.nombre}</span>
                  <span className={styles.estrategiaChevron} aria-hidden="true">
                    {isActiva ? '▲' : '▼'}
                  </span>
                </button>
                {isActiva && (
                  <div className={styles.estrategiaDetalle} role="region">
                    <p className={styles.estrategiaDescripcion}>{estrategia.descripcion}</p>
                    <div className={styles.estrategiaGrid}>
                      <div className={styles.estrategiaGridItem}>
                        <strong>Ejemplo real:</strong>
                        <span>{estrategia.ejemplo}</span>
                      </div>
                      <div className={styles.estrategiaGridItem}>
                        <strong>Impacto ambiental:</strong>
                        <span>{estrategia.impacto}</span>
                      </div>
                      {estrategia.legislacion && (
                        <div className={styles.estrategiaGridItem}>
                          <strong>Legislación UE:</strong>
                          <span>{estrategia.legislacion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN 3: Flujos de residuos en España */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🇪🇸</span>
          <h2 className={styles.sectionTitle}>Residuos en España</h2>
          <p className={styles.sectionSubtitle}>
            Datos 2022 — España recicla el 36%, la UE hace el 47% de media
          </p>
        </div>

        <div className={styles.datosGenerales}>
          <div className={styles.datoCard}>
            <span className={styles.datoNumero}>23 Mt</span>
            <span className={styles.datoLabel}>Residuos urbanos/año</span>
          </div>
          <div className={styles.datoCard}>
            <span className={styles.datoNumero}>36%</span>
            <span className={styles.datoLabel}>Tasa reciclaje actual</span>
          </div>
          <div className={styles.datoCard}>
            <span className={styles.datoNumero}>52%</span>
            <span className={styles.datoLabel}>Va al vertedero</span>
          </div>
          <div className={styles.datoCard}>
            <span className={styles.datoNumero}>12%</span>
            <span className={styles.datoLabel}>Incineración</span>
          </div>
        </div>

        <div className={styles.materialesWrapper}>
          <h3 className={styles.materialesTitle}>Tasa de reciclaje por material vs objetivo UE 2030</h3>
          {MATERIALES.map((mat) => {
            const color = getColorMaterial(mat.tasaActual, mat.objetivoUE);
            const anchoBarra = `${mat.tasaActual}%`;
            const anchoObjetivo = `${mat.objetivoUE}%`;
            return (
              <div key={mat.nombre} className={styles.materialBarra}>
                <div className={styles.materialNombre}>
                  <span aria-hidden="true">{mat.emoji}</span>
                  <span>{mat.nombre}</span>
                </div>
                <div className={styles.materialBarraWrapper}>
                  <div
                    className={styles.materialBarraActual}
                    style={{ width: anchoBarra, backgroundColor: color }}
                    role="progressbar"
                    aria-valuenow={mat.tasaActual}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${mat.nombre}: ${mat.tasaActual}% de reciclaje actual`}
                  />
                  <div
                    className={styles.materialBarraObjetivo}
                    style={{ width: anchoObjetivo }}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.materialStats}>
                  <span style={{ color }}>
                    {mat.tasaActual}%
                    {mat.tasaActual >= mat.objetivoUE * 0.95 ? ' 🟢' : mat.tasaActual >= mat.objetivoUE * 0.7 ? ' 🟡' : ' 🔴'}
                  </span>
                  <span className={styles.materialObjetivo}>Obj. {mat.objetivoUE}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.sliderAlemaniaWrapper}>
          <h3 className={styles.sliderTitulo}>
            ¿Qué pasaría si España reciclara como Alemania (67%)?
          </h3>
          <label htmlFor="sliderAlemania" className={styles.sliderLabel}>
            Nivel de implementación: <strong>{sliderAlemania}%</strong>
          </label>
          <input
            id="sliderAlemania"
            type="range"
            min={0}
            max={100}
            value={sliderAlemania}
            onChange={(e) => setSliderAlemania(Number(e.target.value))}
            className={styles.sliderInput}
          />
          {sliderAlemania > 0 && (
            <div className={styles.sliderResultados} role="region" aria-live="polite">
              <div className={styles.sliderResultadoCard}>
                <span className={styles.sliderResultadoNumero}>
                  {toneladasCO2Evitadas.toLocaleString('es-ES')} t
                </span>
                <span className={styles.sliderResultadoLabel}>CO₂ evitado al año</span>
              </div>
              <div className={styles.sliderResultadoCard}>
                <span className={styles.sliderResultadoNumero}>
                  {materiasAhorradas.toLocaleString('es-ES')} t
                </span>
                <span className={styles.sliderResultadoLabel}>Materias primas ahorradas</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 4: Casos de éxito */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌟</span>
          <h2 className={styles.sectionTitle}>Casos de Éxito Reales</h2>
          <p className={styles.sectionSubtitle}>
            Empresas que demuestran que la economía circular es rentable
          </p>
        </div>

        <div className={styles.casosGrid}>
          {CASOS_EXITO.map((caso) => {
            const isActivo = casoActivo === caso.id;
            return (
              <div key={caso.id} className={styles.casoCard}>
                <button
                  className={styles.casoHeader}
                  onClick={() => toggleCaso(caso.id)}
                  aria-expanded={isActivo}
                >
                  <span className={styles.casoIcono} aria-hidden="true">{caso.icono}</span>
                  <div className={styles.casoTituloWrapper}>
                    <span className={styles.casoEmpresa}>{caso.empresa}</span>
                    <span className={styles.casoPais}>{caso.pais}</span>
                  </div>
                  <span className={styles.casoChevron} aria-hidden="true">
                    {isActivo ? '▲' : '▼'}
                  </span>
                </button>
                {isActivo && (
                  <div className={styles.casoDetalle} role="region">
                    <div className={styles.casoSeccion}>
                      <strong>Modelo de negocio circular:</strong>
                      <p>{caso.modelo}</p>
                    </div>
                    <div className={styles.casoSeccion}>
                      <strong>Resultados medibles:</strong>
                      <p>{caso.resultados}</p>
                    </div>
                    <div className={styles.casoSeccionDestacada}>
                      <strong>¿Qué puedes aplicar tú?</strong>
                      <p>{caso.aplicacionPersonal}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="Economía Circular: Fundamentos"
        subtitle="Historia, legislación europea y cómo distinguir el greenwashing"
        icon="🌍"
      >
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>📜 Del siglo XX a la crisis de materias primas</h3>
            <p>
              El modelo industrial del siglo XX se construyó sobre recursos aparentemente ilimitados. Tras la Segunda
              Guerra Mundial, el consumo masivo fue diseñado deliberadamente: en 1955, el artículo "The Waste Makers"
              denunciaba la "obsolescencia planificada". Hoy, con 8.000 millones de personas aspirando al mismo estilo
              de vida, los límites planetarios son evidentes: estamos usando 1,7 veces los recursos que la Tierra puede
              regenerar cada año.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>🇪🇺 Reglamento de Ecodiseño UE 2024 y Derecho a Reparar</h3>
            <p>
              La Unión Europea aprobó en 2024 el Reglamento de Ecodiseño para Productos Sostenibles y la Directiva
              de Derecho a Reparar. Estos obligan a los fabricantes a: (1) vender piezas de repuesto durante mínimo
              10 años tras el cese de fabricación, (2) no diseñar software que bloquee la reparación de terceros,
              (3) informar sobre la durabilidad prevista del producto. Es el mayor cambio regulatorio industrial en
              Europa desde el etiquetado energético.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>🚨 Economía Circular vs Greenwashing</h3>
            <p>
              No todo lo que se llama "circular" lo es. Señales de greenwashing: (1) empresa que "recicla" sus
              propios residuos pero sigue produciendo residuos no reciclables, (2) programas de devolución de producto
              que acaban en vertedero, (3) etiqueta "reciclable" en productos que no tienen cadena de reciclaje real.
              Circular de verdad: garantía de reparación, materiales con porcentaje reciclado verificado,
              take-back programs con trazabilidad.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>🏭 Simbiotismo Industrial</h3>
            <p>
              El ejemplo más antiguo: Kalundborg (Dinamarca, desde 1972). Una central eléctrica, una refinería,
              una farmacéutica y una empresa de cartón intercambian residuos como recursos: el vapor sobrante
              de la central calienta la ciudad y la farmacéutica, el azufre va a una empresa de ácido sulfúrico,
              las cenizas al fabricante de cemento. En España, el Polo Petroquímico de Tarragona funciona con
              principios similares desde los años 80.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>🇪🇸 Plan de Economía Circular España 2021-2030</h3>
            <p>
              España aprobó su Plan de Acción de Economía Circular con 3 ejes: (1) producción y consumo sostenible,
              (2) gestión de residuos, (3) sectores prioritarios (alimentación, construcción, plásticos, textil).
              Objetivo 2030: reducir generación de residuos un 15%, alcanzar tasa de reciclaje del 55% (vs 36%
              actual), prohibir vertido de residuos reciclables. La Ley de Residuos de 2022 introduce el Depósito,
              Devolución y Retorno (SDDR) para envases de bebida.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>💡 El potencial: 45% de reducción de CO₂ global</h3>
            <p>
              La Fundación Ellen MacArthur (referencia mundial en economía circular) estima que una transición
              completa eliminaría el 45% de las emisiones globales de CO₂. El 55% restante viene de la energía
              (electricidad, calor, transporte) y requiere renovables. Los sectores con mayor potencial:
              alimentación y uso del suelo (26%), entorno construido (10%), movilidad (9%). En España,
              el potencial económico se estima en 30.000 M€/año y 250.000 empleos adicionales para 2030.
            </p>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-economia-circular" />
      <Footer appName="visualizador-economia-circular" />
    </div>
  );
}
