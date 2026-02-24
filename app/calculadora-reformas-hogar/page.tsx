'use client';

import { useState } from 'react';
import styles from './CalculadoraReformasHogar.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  EducationalSection,
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
        <h1 className={styles.heroTitulo}>Calculadora de Reformas del Hogar</h1>
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

        <DisclaimerCard variant="financial" severity="medium">
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
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-reformas-hogar')} />
        <Footer appName="calculadora-reformas-hogar" />
      </div>
    </div>
  );
}
