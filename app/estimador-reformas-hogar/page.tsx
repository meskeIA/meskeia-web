'use client';

import { useState } from 'react';
import styles from './EstimadorReformasHogar.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency } from '@/lib';

type CalidadReforma = 'basica' | 'estandar' | 'premium';
type UnidadMedida = 'm2' | 'unidad';

interface TipoReforma {
  id: string;
  nombre: string;
  icono: string;
  unidad: UnidadMedida;
  labelUnidad: string;
  preciosPorCalidad: Record<CalidadReforma, [number, number]>;
  descripcion: string;
}

const TIPOS_REFORMA: TipoReforma[] = [
  {
    id: 'integral',
    nombre: 'Reforma integral',
    icono: '🏠',
    unidad: 'm2',
    labelUnidad: 'm² de vivienda',
    preciosPorCalidad: { basica: [400, 700], estandar: [700, 1200], premium: [1200, 2500] },
    descripcion: 'Reforma completa: suelos, pintura, baños, cocina e instalaciones',
  },
  {
    id: 'cocina',
    nombre: 'Cocina completa',
    icono: '🍳',
    unidad: 'm2',
    labelUnidad: 'm² de cocina',
    preciosPorCalidad: { basica: [300, 600], estandar: [600, 1200], premium: [1200, 2500] },
    descripcion: 'Muebles, encimera, electrodomésticos y alicatado incluidos',
  },
  {
    id: 'bano',
    nombre: 'Baño completo',
    icono: '🚿',
    unidad: 'm2',
    labelUnidad: 'm² de baño',
    preciosPorCalidad: { basica: [400, 700], estandar: [700, 1500], premium: [1500, 3000] },
    descripcion: 'Sanitarios, alicatado, fontanería y electricidad incluidos',
  },
  {
    id: 'pintura',
    nombre: 'Pintura interior',
    icono: '🎨',
    unidad: 'm2',
    labelUnidad: 'm² (paredes + techo)',
    preciosPorCalidad: { basica: [8, 12], estandar: [12, 18], premium: [18, 35] },
    descripcion: 'Mano de obra y material. Mide: perímetro × altura + superficie techo',
  },
  {
    id: 'suelos',
    nombre: 'Suelos',
    icono: '🪵',
    unidad: 'm2',
    labelUnidad: 'm²',
    preciosPorCalidad: { basica: [20, 40], estandar: [40, 80], premium: [80, 200] },
    descripcion: 'Laminado, parquet o porcelánico. Incluye colocación y material',
  },
  {
    id: 'alicatado',
    nombre: 'Alicatado / Azulejos',
    icono: '🧱',
    unidad: 'm2',
    labelUnidad: 'm²',
    preciosPorCalidad: { basica: [30, 60], estandar: [60, 120], premium: [120, 300] },
    descripcion: 'Cerámica, porcelánico o azulejo. Material y colocación incluidos',
  },
  {
    id: 'electrica',
    nombre: 'Instalación eléctrica',
    icono: '🔌',
    unidad: 'm2',
    labelUnidad: 'm² de vivienda',
    preciosPorCalidad: { basica: [30, 50], estandar: [50, 80], premium: [80, 150] },
    descripcion: 'Cuadro eléctrico, cableado y puntos de luz. Por m² de vivienda',
  },
  {
    id: 'fontaneria',
    nombre: 'Fontanería',
    icono: '🔧',
    unidad: 'm2',
    labelUnidad: 'm² de vivienda',
    preciosPorCalidad: { basica: [60, 100], estandar: [100, 180], premium: [180, 350] },
    descripcion: 'Tuberías, grifería y desagües. Por m² de vivienda',
  },
  {
    id: 'ventanas',
    nombre: 'Ventanas',
    icono: '🪟',
    unidad: 'unidad',
    labelUnidad: 'ventanas',
    preciosPorCalidad: { basica: [400, 700], estandar: [700, 1500], premium: [1500, 3500] },
    descripcion: 'PVC o aluminio con doble acristalamiento. Precio por ventana instalada',
  },
  {
    id: 'aireacondicionado',
    nombre: 'Aire acondicionado',
    icono: '❄️',
    unidad: 'unidad',
    labelUnidad: 'equipos split',
    preciosPorCalidad: { basica: [800, 1200], estandar: [1200, 2000], premium: [2000, 4500] },
    descripcion: 'Split inverter con instalación incluida. Precio por equipo',
  },
];

const CALIDADES: { id: CalidadReforma; label: string; descripcion: string; icono: string }[] = [
  { id: 'basica', label: 'Básica', descripcion: 'Materiales económicos, acabados funcionales', icono: '🔨' },
  { id: 'estandar', label: 'Estándar', descripcion: 'Buena relación calidad-precio, materiales medios', icono: '⭐' },
  { id: 'premium', label: 'Premium', descripcion: 'Materiales de alta gama, acabados de lujo', icono: '💎' },
];

interface ReformaSeleccionada {
  tipoId: string;
  cantidad: string;
}

export default function CalculadoraReformasHogar() {
  const [calidad, setCalidad] = useState<CalidadReforma>('estandar');
  const [reformas, setReformas] = useState<ReformaSeleccionada[]>([]);

  const estaSeleccionada = (tipoId: string) => reformas.some(r => r.tipoId === tipoId);

  const toggleReforma = (tipoId: string) => {
    setReformas(prev =>
      prev.some(r => r.tipoId === tipoId)
        ? prev.filter(r => r.tipoId !== tipoId)
        : [...prev, { tipoId, cantidad: '' }]
    );
  };

  const updateCantidad = (tipoId: string, valor: string) => {
    const num = valor.replace(/[^0-9]/g, '');
    setReformas(prev =>
      prev.map(r => r.tipoId === tipoId ? { ...r, cantidad: num } : r)
    );
  };

  const resultados = reformas
    .filter(r => {
      const n = parseInt(r.cantidad, 10);
      return !isNaN(n) && n > 0;
    })
    .map(r => {
      const tipo = TIPOS_REFORMA.find(t => t.id === r.tipoId)!;
      const cantidad = parseInt(r.cantidad, 10);
      const [pMin, pMax] = tipo.preciosPorCalidad[calidad];
      return { tipo, cantidad, totalMin: pMin * cantidad, totalMax: pMax * cantidad };
    });

  const totalMin = resultados.reduce((sum, r) => sum + r.totalMin, 0);
  const totalMax = resultados.reduce((sum, r) => sum + r.totalMax, 0);
  const hayResultados = resultados.length > 0;
  const haySeleccionadas = reformas.length > 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitulo}>Estimador Reformas del Hogar</h1>
        <p className={styles.heroSubtitulo}>
          Estima el presupuesto de tus reformas. Precios de referencia España 2026.
        </p>
      </header>

      <div className={styles.wrapper}>
        <LegalNotice />

        {/* 1. Calidad */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>1. Elige el nivel de calidad</h2>
          <div className={styles.calidadGrid}>
            {CALIDADES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCalidad(c.id)}
                className={`${styles.calidadBtn} ${calidad === c.id ? styles.calidadActiva : ''}`}
                aria-pressed={calidad === c.id ? true : false}
              >
                <span className={styles.calidadIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.calidadLabel}>{c.label}</span>
                <span className={styles.calidadDesc}>{c.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 2. Tipos de reforma */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>2. Selecciona qué quieres reformar</h2>
          <p className={styles.seccionSubtitulo}>
            Haz clic para añadir o quitar. Introduce los metros cuadrados o unidades de cada partida.
          </p>
          <div className={styles.reformasGrid}>
            {TIPOS_REFORMA.map(tipo => {
              const seleccionada = estaSeleccionada(tipo.id);
              const reforma = reformas.find(r => r.tipoId === tipo.id);
              const cantidadNum = reforma ? parseInt(reforma.cantidad, 10) : 0;
              const tieneValor = !isNaN(cantidadNum) && cantidadNum > 0;

              return (
                <div
                  key={tipo.id}
                  className={`${styles.reformaCard} ${seleccionada ? styles.reformaSeleccionada : ''}`}
                >
                  <button
                    type="button"
                    className={styles.reformaHead}
                    onClick={() => toggleReforma(tipo.id)}
                    aria-pressed={seleccionada ? true : false}
                  >
                    <span className={styles.reformaIcono} aria-hidden="true">{tipo.icono}</span>
                    <span className={styles.reformaNombre}>{tipo.nombre}</span>
                    <span
                      className={`${styles.reformaToggle} ${seleccionada ? styles.reformaToggleActivo : ''}`}
                      aria-hidden="true"
                    >
                      {seleccionada ? '✓' : '+'}
                    </span>
                  </button>
                  <p className={styles.reformaDesc}>{tipo.descripcion}</p>

                  {seleccionada && (
                    <div className={styles.reformaInput}>
                      <label htmlFor={`cantidad-${tipo.id}`} className={styles.inputLabel}>
                        {tipo.labelUnidad}:
                      </label>
                      <input
                        id={`cantidad-${tipo.id}`}
                        type="text"
                        inputMode="numeric"
                        value={reforma?.cantidad ?? ''}
                        onChange={e => updateCantidad(tipo.id, e.target.value)}
                        placeholder={tipo.unidad === 'm2' ? 'Ej: 15' : 'Ej: 3'}
                        className={styles.inputCantidad}
                        autoComplete="off"
                      />
                      {tieneValor && (
                        <span className={styles.precioInline}>
                          {formatCurrency(tipo.preciosPorCalidad[calidad][0] * cantidadNum)}
                          {' – '}
                          {formatCurrency(tipo.preciosPorCalidad[calidad][1] * cantidadNum)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Resultados */}
        {hayResultados && (
          <section className={styles.resultados}>
            <h2 className={styles.seccionTitulo}>3. Presupuesto estimado</h2>
            <div className={styles.listaResultados}>
              {resultados.map(r => (
                <div key={r.tipo.id} className={styles.lineaResultado}>
                  <span className={styles.lineaIcono} aria-hidden="true">{r.tipo.icono}</span>
                  <span className={styles.lineaNombre}>{r.tipo.nombre}</span>
                  <span className={styles.lineaCantidad}>{r.cantidad} {r.tipo.labelUnidad}</span>
                  <span className={styles.lineaPrecio}>
                    {formatCurrency(r.totalMin)} – {formatCurrency(r.totalMax)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.totalBox}>
              <span className={styles.totalLabel}>Total estimado</span>
              <span className={styles.totalRango}>
                {formatCurrency(totalMin)} – {formatCurrency(totalMax)}
              </span>
              <span className={styles.totalCalidad}>
                Calidad {CALIDADES.find(c => c.id === calidad)?.label} · {resultados.length} partida{resultados.length !== 1 ? 's' : ''}
              </span>
            </div>
          </section>
        )}

        {haySeleccionadas && !hayResultados && (
          <p className={styles.aviso} role="status">
            Introduce la cantidad en al menos una partida para ver el presupuesto estimado.
          </p>
        )}

        <DisclaimerCard variant="financial" severity="critical">
          <p>
            Los precios mostrados son <strong>estimaciones orientativas</strong> basadas en rangos
            de mercado en España 2026. El coste real puede variar significativamente según la
            comunidad autónoma, el estado del inmueble, el contratista elegido y los materiales
            específicos.
          </p>
          <p>
            Esta calculadora no sustituye a un presupuesto profesional. Solicita siempre al menos
            3 presupuestos antes de contratar una obra. meskeIA no asume ninguna responsabilidad
            por decisiones tomadas en base a estos datos.
          </p>
        </DisclaimerCard>

        <EducationalSection title="Guía para planificar tu reforma" subtitle="Calidades, IVA, licencias y consejos para obtener el mejor presupuesto">
          <h3>¿Qué incluye cada nivel de calidad?</h3>
          <p>
            <strong>Básica</strong>: Materiales de precio ajustado (gres económico, pintura vinílica
            estándar, muebles de cocina de bajo coste). Ideal para reformas de viviendas de alquiler
            o cuando el presupuesto es limitado.
          </p>
          <p>
            <strong>Estándar</strong>: Buena relación calidad-precio (porcelánico 30–60 €/m²,
            muebles de cocina de gama media, pintura plástica de calidad). La opción más habitual
            en reformas de primera vivienda.
          </p>
          <p>
            <strong>Premium</strong>: Materiales de alta gama (porcelánico gran formato, encimeras
            de cuarzo o piedra natural, electrodomésticos de primera línea). Para viviendas de
            alto standing o rehabilitaciones con valor patrimonial.
          </p>

          <h3>IVA en reformas del hogar</h3>
          <p>
            Las obras de rehabilitación tributan al <strong>10% de IVA</strong> (en lugar del 21%
            general) si se cumplen ciertos requisitos: que la vivienda lleve al menos 2 años
            construida, que no se afecte a estructura nueva de forma relevante, y que el coste
            de materiales no supere el 40% de la base imponible. Confirma siempre con tu
            contratista y asesórate con un gestor si hay dudas.
          </p>

          <h3>¿Necesito licencia de obras?</h3>
          <ul>
            <li>
              <strong>Obras menores</strong> (pintura, suelos, alicatado sin tocar estructura):
              normalmente basta con comunicación previa al Ayuntamiento.
            </li>
            <li>
              <strong>Obras mayores</strong> (reforma integral, fachada, redistribución de
              espacios): requieren licencia municipal. El trámite suele tardar entre 1 y 3 meses.
            </li>
            <li>
              <strong>Comunidad de vecinos</strong>: consulta los estatutos y, si afecta a
              elementos comunes, necesitarás aprobación en junta.
            </li>
          </ul>

          <h3>Consejos para obtener un buen presupuesto</h3>
          <ul>
            <li>Pide al menos 3 presupuestos a diferentes empresas o autónomos.</li>
            <li>
              Especifica los materiales concretos (marca, referencia) para comparar
              presupuestos equivalentes.
            </li>
            <li>Exige presupuesto cerrado y por escrito con todas las partidas desglosadas.</li>
            <li>
              Reserva un <strong>10–15% adicional</strong> para imprevistos (humedades ocultas,
              cableado antiguo, tabiques que no están donde parecen…).
            </li>
            <li>
              Verifica que la empresa esté dada de alta en la Seguridad Social y pide referencias
              de obras anteriores.
            </li>
          </ul>

          {/* ── Tabla comparativa tipos de reforma ── */}
          <h3>Comparativa de tipos de reforma en España</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de reforma</th>
                  <th>Coste medio/m²</th>
                  <th>Duración obra</th>
                  <th>Requiere licencia</th>
                  <th>Revalorización estimada</th>
                  <th>Impacto en habitabilidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cocina completa</td>
                  <td>600–1.200 €/m²</td>
                  <td>3–6 semanas</td>
                  <td>Normalmente no</td>
                  <td>+5–10 %</td>
                  <td>Alto (sin cocina)</td>
                </tr>
                <tr>
                  <td>Baño completo</td>
                  <td>700–1.500 €/m²</td>
                  <td>2–4 semanas</td>
                  <td>Normalmente no</td>
                  <td>+3–7 %</td>
                  <td>Medio (1 baño inhabilitado)</td>
                </tr>
                <tr>
                  <td>Pintura integral piso</td>
                  <td>12–18 €/m² pared</td>
                  <td>3–7 días</td>
                  <td>No</td>
                  <td>+1–3 %</td>
                  <td>Bajo (polvo temporal)</td>
                </tr>
                <tr>
                  <td>Suelos</td>
                  <td>40–80 €/m²</td>
                  <td>1–2 semanas</td>
                  <td>No</td>
                  <td>+2–5 %</td>
                  <td>Medio (zona inhabilitada)</td>
                </tr>
                <tr>
                  <td>Instalación eléctrica</td>
                  <td>50–80 €/m²</td>
                  <td>1–3 semanas</td>
                  <td>Sí (boletín eléctrico)</td>
                  <td>+2–4 %</td>
                  <td>Alto (cortes de luz)</td>
                </tr>
                <tr>
                  <td>Reforma integral</td>
                  <td>700–1.200 €/m²</td>
                  <td>2–6 meses</td>
                  <td>Sí (obra mayor)</td>
                  <td>+15–30 %</td>
                  <td>Muy alto (no se puede vivir)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Casos de uso ── */}
          <h3>¿Cuál es tu situación?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏷️</span>
                <strong>Propietario que reforma para vender</strong>
              </div>
              <p className={styles.escenarioExample}>
                Objetivo: maximizar la revalorización con la mínima inversión. Prioriza cocina,
                baños y pintura. Evita reformas estructurales que no se amortizan en el precio
                de venta a corto plazo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: calcula el retorno estimado. Si el piso vale 200.000 € y una reforma de
                cocina añade un 7 %, obtienes 14.000 € de revalorización por una inversión de ~8.000 €.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🤝</span>
                <strong>Inquilino que negocia reforma con el propietario</strong>
              </div>
              <p className={styles.escenarioExample}>
                El inquilino puede proponer la reforma a cambio de una reducción temporal del
                alquiler. El propietario se beneficia de la mejora del inmueble sin desembolso
                inmediato.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: cualquier acuerdo debe constar por escrito en un anexo al contrato de
                arrendamiento. Guarda todas las facturas a tu nombre si asumes el coste.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔑</span>
                <strong>Comprador de vivienda de segunda mano para reformar</strong>
              </div>
              <p className={styles.escenarioExample}>
                Usa el estimador para calcular el coste total real (precio de compra + reforma)
                y compara con viviendas ya reformadas en la misma zona. A menudo comprar para
                reformar sale más económico y permite personalizar el resultado.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: pide siempre visita técnica antes de comprar para detectar problemas
                ocultos (humedades, instalaciones obsoletas) que disparan el presupuesto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <strong>Comunidad de propietarios</strong>
              </div>
              <p className={styles.escenarioExample}>
                Obras en elementos comunes (ascensor, fachada, cubierta) requieren acuerdo en
                junta de propietarios. El coste se reparte entre los vecinos según el coeficiente
                de participación fijado en la escritura de división horizontal.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: solicita subvenciones del Plan de Rehabilitación del Gobierno. Las
                comunidades pueden obtener ayudas de hasta el 60 % para mejoras de eficiencia
                energética.
              </p>
            </div>
          </div>

          {/* ── FAQ ── */}
          <h3>Preguntas frecuentes sobre reformas en España</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué reformas necesitan licencia de obras en España?</strong>
              <p>
                Necesitan licencia de obra mayor las reformas que afecten a la estructura del
                edificio, redistribuyan espacios o modifiquen la fachada. Las obras menores
                (pintura, suelos, alicatado sin tocar estructura) solo requieren comunicación
                previa o declaración responsable en la mayoría de ayuntamientos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puedo deducir la reforma en la declaración de IRPF?</strong>
              <p>
                En general, las reformas de vivienda habitual no son deducibles en IRPF desde
                2013. Sin embargo, existen deducciones autonómicas en algunas comunidades y
                deducciones estatales por obras de mejora de eficiencia energética (hasta 60 %
                del gasto en rehabilitación energética). Consulta con tu asesor fiscal.
              </p>
              <p className={styles.faqTip}>
                Conserva siempre las facturas originales con el NIF del contratista: son
                imprescindibles para cualquier deducción futura.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuánto tarda en tramitarse una licencia de obras?</strong>
              <p>
                La licencia de obra menor suele resolverse en 1–4 semanas. La licencia de obra
                mayor puede tardar entre 1 y 6 meses según el ayuntamiento y la complejidad del
                proyecto. Algunos municipios ofrecen tramitación exprés con tasas adicionales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre licencia de obra menor y mayor?</strong>
              <p>
                La <strong>obra menor</strong> incluye trabajos sin afectación estructural:
                pintura, solados, alicatados, carpintería interior. La <strong>obra mayor</strong>{' '}
                implica modificaciones estructurales, cambio de uso, redistribución de espacios o
                intervención en fachada. La obra mayor requiere proyecto firmado por arquitecto.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puedo vivir en casa durante la reforma?</strong>
              <p>
                Depende del alcance. En reformas parciales (un baño, pintura) es posible
                con algunas molestias. En reformas integrales es muy recomendable buscar
                alojamiento alternativo: el polvo, el ruido y los cortes de suministros hacen
                el espacio inhabitable durante semanas o meses.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo afecta una reforma al valor catastral?</strong>
              <p>
                Las reformas relevantes (ampliación, mejora sustancial) pueden incrementar el
                valor catastral y, por tanto, el IBI. Debes declarar las obras al Catastro
                mediante el modelo 902. Si la reforma aumenta la superficie construida, es
                obligatorio actualizar la escritura y la inscripción registral.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Quién paga la reforma si soy inquilino?</strong>
              <p>
                Las reparaciones necesarias para mantener la habitabilidad son obligación del
                propietario (art. 21 LAU). Las mejoras o personalizaciones elegidas por el
                inquilino corren a su cargo. Al final del contrato, el propietario puede exigir
                la reposición al estado original salvo acuerdo en contrario.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuántos presupuestos debo pedir para una reforma?</strong>
              <p>
                Mínimo 3 presupuestos de empresas o profesionales distintos. Compara no solo
                el precio total, sino también los materiales especificados, los plazos de
                ejecución, las garantías ofrecidas y si incluye gestión de licencias y de
                residuos de obra.
              </p>
            </div>
          </div>

          {/* ── Guía paso a paso ── */}
          <h3>Cómo contratar una reforma paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Define el alcance y prioridades</strong>
                <p>
                  Decide qué reformas son imprescindibles, cuáles deseables y cuáles pueden
                  esperar. Establece un presupuesto máximo antes de pedir presupuestos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Consulta si necesita licencia en el Ayuntamiento</strong>
                <p>
                  Antes de contratar nada, comprueba con el departamento de urbanismo de tu
                  ayuntamiento si tu reforma requiere licencia y qué documentación necesitas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Pide mínimo 3 presupuestos detallados</strong>
                <p>
                  Solicita presupuestos desglosados por partidas, con materiales concretos
                  especificados (marca, referencia, calidad). Así podrás comparar realmente
                  lo que te ofrecen.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Verifica la empresa (certificados, seguros, referencias)</strong>
                <p>
                  Comprueba que está dada de alta en la Seguridad Social, que tiene seguro de
                  responsabilidad civil y pide referencias verificables de obras anteriores.
                  Evita empresas que solo aceptan pago en efectivo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Firma contrato con plazos y penalizaciones</strong>
                <p>
                  El contrato debe recoger: descripción detallada de los trabajos, materiales
                  a utilizar, plazos de inicio y fin, forma de pago por fases y penalizaciones
                  por retrasos injustificados.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Gestiona las licencias si aplica</strong>
                <p>
                  Si tu reforma requiere licencia, solicítala antes de que comiencen las obras.
                  Iniciar obras sin licencia cuando es obligatoria puede conllevar multas y
                  obligación de reponer el estado anterior.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Supervisa la obra y haz recepción formal</strong>
                <p>
                  Visita la obra periódicamente y documenta el avance con fotos. Al finalizar,
                  realiza una inspección detallada antes de firmar la recepción y liberar el
                  pago final. Exige el certificado de fin de obra.
                </p>
              </div>
            </div>
          </div>

          {/* ── Mejores prácticas ── */}
          <h3>Buenas prácticas para tu reforma</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <strong>Presupuesto por partidas</strong>
              <p>
                Exige un presupuesto detallado partida a partida, nunca un precio cerrado
                genérico. Así podrás comparar correctamente y detectar omisiones.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪣</span>
              <strong>Reserva para imprevistos</strong>
              <p>
                Añade siempre un 15–20 % del presupuesto como colchón. Las humedades ocultas,
                el cableado antiguo o las sorpresas bajo el alicatado son muy frecuentes.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📄</span>
              <strong>Certificado de fin de obra</strong>
              <p>
                Exige a la empresa un certificado de fin de obra al terminar. Es necesario
                para tramitar garantías, actualizar el catastro y justificar la reforma ante
                tu aseguradora.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <strong>Seguro de responsabilidad civil</strong>
              <p>
                Comprueba que la empresa contratada tiene seguro de responsabilidad civil en
                vigor. Si ocurre un accidente en tu vivienda durante las obras y no tiene
                seguro, podrías responder tú como propietario.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💳</span>
              <strong>Pago por fases según avance</strong>
              <p>
                Nunca pagues el total por adelantado. Estructura los pagos: un anticipo inicial
                (máximo 20–30 %), pagos intermedios según hitos de obra y el resto a la
                recepción satisfactoria.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <strong>Conserva todas las facturas</strong>
              <p>
                Guarda las facturas originales de todos los trabajos y materiales. Son
                imprescindibles para deducciones fiscales, reclamaciones de garantía y para
                justificar el valor de mejora ante Hacienda cuando vendas.
              </p>
            </div>
          </div>

          {/* ── Warning box ── */}
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes que debes evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Iniciar obras sin licencia cuando es obligatoria.</strong> Puede conllevar
                multas económicas significativas e incluso la obligación de demoler lo construido
                y reponer el estado original.
              </li>
              <li>
                <strong>Pagar todo por adelantado sin garantías.</strong> Si la empresa
                desaparece o no termina la obra, recuperar el dinero es muy difícil sin
                contrato ni garantías documentadas.
              </li>
              <li>
                <strong>No firmar contrato escrito.</strong> Un acuerdo solo verbal no te
                protege ante incumplimientos, retrasos o trabajos defectuosos. Siempre
                contrato por escrito y firmado por ambas partes.
              </li>
              <li>
                <strong>Elegir el presupuesto más barato sin comparar materiales.</strong> Un
                precio bajo puede esconder materiales de menor calidad o la omisión de partidas
                necesarias que aparecerán como «extras» durante la obra.
              </li>
              <li>
                <strong>No comprobar que los materiales instalados son los contratados.</strong>{' '}
                Exige albaranes y contrasta las referencias de los materiales entregados con los
                especificados en el presupuesto firmado.
              </li>
              <li>
                <strong>Olvidar actualizar el seguro del hogar tras la reforma.</strong> Si el
                valor de tu vivienda ha aumentado y no actualizas la suma asegurada, en caso de
                siniestro la indemnización podría no cubrir el coste real de reposición.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('estimador-reformas-hogar')} />
        <ShareCard appName="estimador-reformas-hogar" />
      <Footer appName="estimador-reformas-hogar" />
      </div>
    </div>
  );
}
