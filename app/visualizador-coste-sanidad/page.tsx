'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorCosteSanidad.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'consulta' | 'operaciones' | 'urgencias' | 'sistema';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'consulta', titulo: 'Consulta médica', icono: '🩺', subtitulo: '¿Cuánto cuesta ir al médico de cabecera?' },
  { id: 'operaciones', titulo: 'Operaciones', icono: '🏥', subtitulo: 'Lo que cuestan las cirugías más comunes' },
  { id: 'urgencias', titulo: 'Urgencias', icono: '🚑', subtitulo: 'El coste oculto de una visita a urgencias' },
  { id: 'sistema', titulo: 'Sistema español', icono: '🇪🇸', subtitulo: 'Cómo se financia nuestra sanidad pública' },
];

// ─────────────────────────────────────────────
// Sección 1: Consulta médica
// ─────────────────────────────────────────────

function SeccionConsulta() {
  const paises = [
    {
      bandera: '🇪🇸',
      nombre: 'España',
      publico: 0,
      privado: 40,
      nota: 'La consulta de atención primaria es gratuita en el sistema público (SNS). En privado, entre 30 € y 50 € según la ciudad.',
    },
    {
      bandera: '🇺🇸',
      nombre: 'EE.UU.',
      publico: null,
      privado: 250,
      nota: 'Sin seguro, una consulta básica cuesta 150-300 $. Con seguro, el copago típico es de 20-50 $. Sin sistema público universal.',
    },
    {
      bandera: '🇩🇪',
      nombre: 'Alemania',
      publico: 0,
      privado: 50,
      nota: 'Sistema de seguro obligatorio. La consulta pública es gratuita. El seguro privado cubre visitas con copago reducido (25-50 €).',
    },
    {
      bandera: '🇬🇧',
      nombre: 'Reino Unido',
      publico: 0,
      privado: 70,
      nota: 'El NHS cubre las consultas al 100%. Una consulta privada ronda las 50-100 £. Las listas de espera del NHS son largas.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Ir al médico de cabecera parece &quot;gratis&quot; en España, pero <strong>alguien paga esa consulta</strong>. ¿Cuánto cuesta realmente, y qué pasa en otros países?</p>
      </div>

      <div className={styles.paisesGrid}>
        {paises.map((p, i) => (
          <div key={i} className={styles.paisCard}>
            <div className={styles.paisHeader}>
              <span className={styles.paisBandera} aria-hidden="true">{p.bandera}</span>
              <span className={styles.paisNombre}>{p.nombre}</span>
            </div>
            <div className={styles.paisCostes}>
              <div className={styles.costePublico}>
                <span className={styles.costeLabel}>Público</span>
                <span className={styles.costeValor}>
                  {p.publico !== null ? (p.publico === 0 ? '0 € (gratuito)' : formatCurrency(p.publico)) : 'No existe'}
                </span>
              </div>
              <div className={styles.costePrivado}>
                <span className={styles.costeLabel}>Privado</span>
                <span className={styles.costeValor}>{p.nombre === 'EE.UU.' ? '~250 $' : `~${formatCurrency(p.privado)}`}</span>
              </div>
            </div>
            <p className={styles.paisNota}>{p.nota}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>En España, cada consulta de atención primaria cuesta al sistema unos 40-60 €.</strong> Tú no lo pagas directamente, pero se financia con tus impuestos y cotizaciones sociales. En EE.UU., sin seguro, la misma consulta puede suponer una factura de más de 200 $.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>¿Sabías que el coste de una consulta privada en España ({formatCurrency(40)}) es <strong>6 veces más barato</strong> que en EE.UU.? La diferencia no es solo el sistema público — los costes base son menores por regulación de precios.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Operaciones comunes
// ─────────────────────────────────────────────

function SeccionOperaciones() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const operaciones = [
    { nombre: 'Apendicectomía', espanaPublico: 0, espanaPrivado: 4000, eeuu: 33000, alemania: 3000 },
    { nombre: 'Prótesis rodilla', espanaPublico: 0, espanaPrivado: 12000, eeuu: 50000, alemania: 8000 },
    { nombre: 'Cesárea', espanaPublico: 0, espanaPrivado: 5500, eeuu: 25000, alemania: 4000 },
    { nombre: 'Cataratas', espanaPublico: 0, espanaPrivado: 2000, eeuu: 6000, alemania: 2500 },
  ];

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: operaciones.map(o => o.nombre),
        datasets: [
          {
            label: 'España (privado)',
            data: operaciones.map(o => o.espanaPrivado),
            backgroundColor: '#2E86AB',
            borderRadius: 4,
          },
          {
            label: 'Alemania',
            data: operaciones.map(o => o.alemania),
            backgroundColor: '#48A9A6',
            borderRadius: 4,
          },
          {
            label: 'EE.UU.',
            data: operaciones.map(o => o.eeuu),
            backgroundColor: '#e74c3c',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
                `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v: string | number) => formatCurrency(Number(v)) },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, []);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las operaciones quirúrgicas más comunes tienen costes muy distintos según el país. En España, <strong>la sanidad pública las cubre al 100%</strong>. Pero ¿cuánto cuestan realmente?</p>
      </div>

      {/* Tabla visual de costes */}
      <div className={styles.operacionesGrid}>
        {operaciones.map((op, i) => (
          <div key={i} className={styles.operacionCard}>
            <h4 className={styles.operacionNombre}>{op.nombre}</h4>
            <div className={styles.operacionComparacion}>
              <div className={styles.operacionFila}>
                <span className={styles.operacionPais}>🇪🇸 Público</span>
                <span className={styles.operacionCosteGratis}>Gratuito</span>
              </div>
              <div className={styles.operacionFila}>
                <span className={styles.operacionPais}>🇪🇸 Privado</span>
                <span className={styles.operacionCoste}>{formatCurrency(op.espanaPrivado)}</span>
              </div>
              <div className={styles.operacionFila}>
                <span className={styles.operacionPais}>🇩🇪 Alemania</span>
                <span className={styles.operacionCoste}>{formatCurrency(op.alemania)}</span>
              </div>
              <div className={`${styles.operacionFila} ${styles.operacionFilaRojo}`}>
                <span className={styles.operacionPais}>🇺🇸 EE.UU.</span>
                <span className={styles.operacionCosteAlto}>{formatCurrency(op.eeuu)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico comparativo */}
      <div className={styles.chartContainer}>
        <h4 className={styles.chartTitulo}>Coste de operaciones por país (sanidad privada)</h4>
        <div className={styles.chartWrap}>
          <canvas ref={chartRef} aria-label="Gráfico de barras comparando el coste de operaciones comunes entre España, Alemania y EE.UU." />
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Una prótesis de rodilla en EE.UU. cuesta <strong>{formatCurrency(50000)}</strong> — más de <strong>4 veces</strong> lo que
          cuesta en España por privado ({formatCurrency(12000)}). Y en el sistema público español, esa misma operación tiene coste cero
          directo para el paciente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Urgencias
// ─────────────────────────────────────────────

function SeccionUrgencias() {
  const pasos = [
    { icono: '🚪', paso: 'Llegas a urgencias', descripcion: 'Triaje: una enfermera evalúa la gravedad. Prioridad 1 (riesgo vital) a 5 (no urgente).' },
    { icono: '🔬', paso: 'Pruebas diagnósticas', descripcion: 'Análisis de sangre (~50 €), radiografía (~80 €), TAC (~300 €), ecografía (~120 €). El coste real que asume el sistema.' },
    { icono: '💊', paso: 'Tratamiento', descripcion: 'Medicación, sutura, estabilización. El coste varía enormemente según la patología.' },
    { icono: '📋', paso: 'Alta o ingreso', descripcion: 'Si te vas a casa, el coste medio de la visita es ~200-400 €. Si ingresan, cada día de hospital cuesta ~500-1.200 €.' },
  ];

  const costesOcultos = [
    { pais: '🇺🇸 EE.UU.', coste: 'Factura media de urgencias: 2.200 $', detalle: 'Sin seguro, solo entrar por la puerta puede costar 500-1.000 $. Una ambulancia: 1.000-3.000 $. Radiografía: 300-1.000 $.' },
    { pais: '🇪🇸 España', coste: 'Coste para el paciente: 0 €', detalle: 'Coste real para el sistema: 200-400 € por visita. Financiado por impuestos. Sin copago ni factura sorpresa.' },
    { pais: '🇫🇷 Francia', coste: 'Copago del 20% (media ~80 €)', detalle: 'El sistema francés cubre el 80%. El 20% restante lo paga el paciente o su seguro complementario (mutuelle).' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Ir a urgencias parece sencillo: llegas, te atienden, te vas. Pero detrás hay un proceso con <strong>costes ocultos que varían enormemente</strong> según el país.</p>
      </div>

      {/* Flujo de urgencias */}
      <div className={styles.flujoUrgencias}>
        {pasos.map((p, i) => (
          <div key={i} className={styles.flujoUrgenciaItem}>
            <div className={styles.flujoUrgenciaNum}>{i + 1}</div>
            <div className={styles.flujoUrgenciaContenido}>
              <div className={styles.flujoUrgenciaHeader}>
                <span aria-hidden="true">{p.icono}</span>
                <strong>{p.paso}</strong>
              </div>
              <p className={styles.flujoUrgenciaTexto}>{p.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className={styles.subtituloSecundario}>Lo que pagas según el país</h3>

      <div className={styles.costesGrid}>
        {costesOcultos.map((c, i) => (
          <div key={i} className={`${styles.costeOcultoCard} ${i === 0 ? styles.costeAlto : ''}`}>
            <span className={styles.costePais}>{c.pais}</span>
            <span className={styles.costeResumen}>{c.coste}</span>
            <p className={styles.costeDetalle}>{c.detalle}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>En EE.UU., el miedo a la factura de urgencias hace que muchas personas no vayan al hospital.</strong> Un estudio
          de la Kaiser Family Foundation encontró que el 25% de los adultos estadounidenses han pospuesto tratamiento médico
          por el coste. En España, ese problema no existe: urgencias siempre es gratuito.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">💡</span>
        <p>Una ambulancia en EE.UU. puede costar entre 1.000 $ y 3.000 $. En España, el transporte sanitario de urgencias es <strong>gratuito y universal</strong>.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: El sistema español
// ─────────────────────────────────────────────

function SeccionSistema() {
  const [pibSlider, setPibSlider] = useState(83); // 8.3% de PIB

  const paisesComparacion = [
    { nombre: 'Rumanía', pib: 6.3, perCapita: 1100 },
    { nombre: 'España', pib: 8.3, perCapita: 2500 },
    { nombre: 'Italia', pib: 8.7, perCapita: 2700 },
    { nombre: 'Francia', pib: 12.1, perCapita: 4400 },
    { nombre: 'Alemania', pib: 12.7, perCapita: 5300 },
    { nombre: 'EE.UU.', pib: 17.8, perCapita: 12500 },
  ];

  const financiacion = [
    { fuente: 'Cotizaciones sociales', porcentaje: 38, icono: '💼', detalle: 'Lo que empresa y trabajador pagan a la Seguridad Social cada mes.' },
    { fuente: 'IRPF y otros impuestos', porcentaje: 32, icono: '📋', detalle: 'Parte de tu declaración de la renta financia directamente la sanidad.' },
    { fuente: 'IVA y tasas', porcentaje: 20, icono: '🛒', detalle: 'Parte del IVA de cada compra se destina al sistema sanitario autonómico.' },
    { fuente: 'Copagos farmacéuticos', porcentaje: 7, icono: '💊', detalle: 'Lo que pagas en la farmacia (0-60% según renta). Los pensionistas pagan menos.' },
    { fuente: 'Otros ingresos', porcentaje: 3, icono: '📊', detalle: 'Transferencias europeas, loterías, y otros ingresos menores.' },
  ];

  const costePerCapita = pibSlider * 30; // Aproximación simplificada

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>España gasta unos <strong>{formatCurrency(2500)} al año por habitante</strong> en sanidad. ¿De dónde sale ese dinero y cómo se compara con otros países?</p>
      </div>

      {/* Financiación */}
      <h3 className={styles.subtituloSecundario}>¿De dónde sale el dinero?</h3>
      <div className={styles.financiacionGrid}>
        {financiacion.map((f, i) => (
          <div key={i} className={styles.financiacionCard}>
            <div className={styles.financiacionHeader}>
              <span aria-hidden="true">{f.icono}</span>
              <span className={styles.financiacionFuente}>{f.fuente}</span>
              <span className={styles.financiacionPct}>{f.porcentaje}%</span>
            </div>
            <div className={styles.financiacionBarra}>
              <div className={styles.financiacionProgreso} style={{ width: `${f.porcentaje * 2}%` }} />
            </div>
            <p className={styles.financiacionDetalle}>{f.detalle}</p>
          </div>
        ))}
      </div>

      {/* Slider PIB */}
      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Gasto sanitario (% del PIB)</label>
          <span className={styles.sliderValor}>{formatNumber(pibSlider / 10, 1)}%</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={50}
          max={200}
          value={pibSlider}
          onChange={(e) => setPibSlider(parseInt(e.target.value))}
          aria-label={`Gasto sanitario: ${formatNumber(pibSlider / 10, 1)}% del PIB`}
        />
        <div className={styles.sliderExtremos}>
          <span>5% (bajo)</span>
          <span>20% (muy alto)</span>
        </div>
        <div className={styles.sliderResultado}>
          <span>Coste per cápita estimado: <strong>~{formatCurrency(costePerCapita)}/año</strong></span>
        </div>
      </div>

      {/* Comparación por países */}
      <h3 className={styles.subtituloSecundario}>Comparación entre países</h3>
      <div className={styles.comparacionGrid}>
        {paisesComparacion.map((p, i) => {
          const maxPib = 18;
          const anchura = (p.pib / maxPib) * 100;
          const esEspana = p.nombre === 'España';
          return (
            <div key={i} className={`${styles.comparacionFila} ${esEspana ? styles.comparacionDestacada : ''}`}>
              <span className={styles.comparacionPais}>{p.nombre}</span>
              <div className={styles.comparacionBarraContainer}>
                <div
                  className={`${styles.comparacionBarra} ${esEspana ? styles.comparacionBarraEspana : ''}`}
                  style={{ width: `${anchura}%` }}
                />
              </div>
              <div className={styles.comparacionDatos}>
                <span className={styles.comparacionPib}>{formatNumber(p.pib, 1)}%</span>
                <span className={styles.comparacionPerCapita}>{formatCurrency(p.perCapita)}/hab</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>EE.UU. gasta casi el doble de su PIB en sanidad que España</strong> ({formatNumber(17.8, 1)}% vs {formatNumber(8.3, 1)}%),
          pero no tiene cobertura universal. España consigue cubrir al 100% de la población con la mitad del gasto relativo.
          El sistema español no es perfecto (listas de espera, falta de personal), pero es uno de los más eficientes del mundo
          en relación coste/cobertura.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCosteSanidadPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('consulta');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'consulta': return <SeccionConsulta />;
      case 'operaciones': return <SeccionOperaciones />;
      case 'urgencias': return <SeccionUrgencias />;
      case 'sistema': return <SeccionSistema />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Lo que Cuesta Enfermarse</h1>
          <p className={styles.subtitle}>El coste real de la sanidad — lo que pagas, lo que no ves, y lo que otros países envidian</p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Lo que no te cuentan sobre la sanidad"
          subtitle="Datos clave para entender el sistema sanitario"
          defaultOpen={false}
        >
          <h3>¿Es realmente &quot;gratis&quot; la sanidad pública?</h3>
          <p>
            No, pero funciona como un seguro colectivo. Cada trabajador aporta a través de impuestos
            y cotizaciones sociales. Un asalariado con sueldo medio contribuye unos {formatCurrency(2000)}-{formatCurrency(3000)} anuales
            al sistema sanitario. A cambio, tiene acceso ilimitado a consultas, urgencias, operaciones y medicamentos
            subvencionados, sin importar cuánto use el sistema.
          </p>

          <h3>¿Por qué es tan cara la sanidad en EE.UU.?</h3>
          <p>
            Tres factores principales: falta de regulación de precios (los hospitales cobran lo que quieren),
            intermediarios (las aseguradoras añaden costes administrativos del 15-30%), y el sistema de facturación
            (cada procedimiento se cobra por separado, incentivando más pruebas). El resultado: el país que más
            gasta en sanidad del mundo, pero con peores indicadores que muchos países europeos.
          </p>

          <h3>Las listas de espera: el lado oscuro</h3>
          <p>
            El principal problema de la sanidad pública española son las listas de espera. La espera media
            para una operación quirúrgica es de 121 días (datos 2024). Para una consulta con especialista,
            unos 95 días. Es el precio de un sistema que cubre al 100% de la población con recursos limitados.
          </p>

          <h3>El copago farmacéutico</h3>
          <p>
            En España, los medicamentos recetados tienen un copago según la renta: los activos pagan entre
            el 40% y el 60%, los pensionistas entre el 0% y el 10% (con topes mensuales de 8-18 €). Sin receta,
            los medicamentos se pagan al 100%.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los costes mostrados son aproximaciones basadas en datos públicos
            y estudios comparativos (OCDE, Ministerio de Sanidad, Kaiser Family Foundation). Los costes
            reales varían según la comunidad autónoma, el hospital y el procedimiento específico.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-coste-sanidad')} />
        <ShareCard appName="visualizador-coste-sanidad" />
        <Footer appName="visualizador-coste-sanidad" />
      </div>
    </>
  );
}
