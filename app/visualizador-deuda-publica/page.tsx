'use client';

import { useState } from 'react';
import styles from './VisualizadorDeudaPublica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

type SeccionId = 'bonos' | 'tenedores' | 'prima' | 'sostenibilidad';

interface Tenedor {
  nombre: string;
  porcentaje: number;
  color: string;
  descripcion: string;
}

interface PaisRiesgo {
  pais: string;
  bandera: string;
  prima: number;
  bono10a: number;
  color: string;
}

interface EscenarioSostenibilidad {
  id: string;
  titulo: string;
  icono: string;
  descripcion: string;
  condicion: string;
  ejemplo: string;
  claseCss: string;
}

const TENEDORES: Tenedor[] = [
  {
    nombre: 'BCE / Banco de España',
    porcentaje: 30,
    color: '#2E86AB',
    descripcion:
      'Compras masivas del Banco Central Europeo en programas de Quantitative Easing (QE/PEPP/APP). Ayuda a mantener bajos los tipos de interés en toda la Eurozona.',
  },
  {
    nombre: 'Inversores extranjeros',
    porcentaje: 45,
    color: '#48A9A6',
    descripcion:
      'Fondos de pensiones internacionales, bancos extranjeros, gestoras globales. Son el grupo más sensible a cambios en la prima de riesgo y la calificación crediticia.',
  },
  {
    nombre: 'Bancos nacionales',
    porcentaje: 15,
    color: '#7FB3D3',
    descripcion:
      'Entidades bancarias españolas. Utilizan los bonos soberanos como activos de alta liquidez en sus balances y como garantía (colateral) para obtener financiación del BCE.',
  },
  {
    nombre: 'Fondos de inversión y seguros',
    porcentaje: 7,
    color: '#5BA3C9',
    descripcion:
      'Fondos de inversión, compañías de seguros y fondos de pensiones domésticos. Buscan rentabilidad estable y activos considerados de bajo riesgo dentro de sus carteras.',
  },
  {
    nombre: 'Inversores minoristas',
    porcentaje: 3,
    color: '#A8D5E2',
    descripcion:
      'Ciudadanos que compran directamente a través de tesoro.es. Inversión mínima de 1.000 €. Ha crecido con la subida de tipos desde 2022.',
  },
];

const PAISES_RIESGO: PaisRiesgo[] = [
  { pais: 'Alemania', bandera: '🇩🇪', prima: 0, bono10a: 2.5, color: '#2E86AB' },
  { pais: 'Francia', bandera: '🇫🇷', prima: 65, bono10a: 3.15, color: '#48A9A6' },
  { pais: 'España', bandera: '🇪🇸', prima: 95, bono10a: 3.45, color: '#7FB3D3' },
  { pais: 'Portugal', bandera: '🇵🇹', prima: 60, bono10a: 3.1, color: '#5BA3C9' },
  { pais: 'Italia', bandera: '🇮🇹', prima: 145, bono10a: 3.95, color: '#F4A261' },
  { pais: 'Grecia', bandera: '🇬🇷', prima: 100, bono10a: 3.5, color: '#E76F51' },
];

const ESCENARIOS: EscenarioSostenibilidad[] = [
  {
    id: 'estable',
    titulo: 'r < g — Deuda sostenible',
    icono: '✅',
    descripcion:
      'Cuando el tipo de interés real (r) es menor que el crecimiento del PIB (g), la deuda se "diluye" sola. El país puede mantener el mismo ratio deuda/PIB incluso con déficits moderados.',
    condicion: 'Crecimiento nominal > tipo de interés medio',
    ejemplo: 'Japón (260% deuda): a pesar del ratio altísimo, es sostenible porque el 90% la tienen inversores domésticos y los tipos son casi cero.',
    claseCss: 'escenarioVerde',
  },
  {
    id: 'problematico',
    titulo: 'r > g — Presión creciente',
    icono: '⚠️',
    descripcion:
      'Cuando los tipos de interés superan el crecimiento, el ratio deuda/PIB tiende a crecer. El país necesita superávit primario (antes de intereses) para estabilizar la deuda.',
    condicion: 'Tipo de interés medio > crecimiento nominal del PIB',
    ejemplo: 'Muchos países europeos en 2022-2024: la subida de tipos del BCE presionó los costes de refinanciación mientras el crecimiento se moderaba.',
    claseCss: 'escenarioAmbar',
  },
  {
    id: 'espiral',
    titulo: 'Crisis y espiral de deuda',
    icono: '🚨',
    descripcion:
      'Si los mercados pierden confianza, la prima de riesgo se dispara → los tipos suben → el coste de refinanciar la deuda aumenta → el ratio sube → la prima sube más. Un círculo vicioso difícil de romper sin intervención externa.',
    condicion: 'Prima de riesgo muy alta + bajo crecimiento + déficit estructural',
    ejemplo: 'Grecia 2010-2012: prima de riesgo >2.000 pb. Necesitó rescate del FMI/BCE/UE y reestructuración de deuda con quita del 53,5%. Argentina 2001: default soberano.',
    claseCss: 'escenarioRojo',
  },
];

export default function VisualizadorDeudaPublica() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('bonos');
  const [tenedorSeleccionado, setTenedorSeleccionado] = useState<number | null>(null);
  const [precioSlider, setPrecioSlider] = useState<number>(100);
  const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<string>('estable');

  const relatedApps = getRelatedApps('visualizador-deuda-publica');

  // Cálculo yield a partir del precio (bono 10 años, cupón 3%)
  const cupon = 3;
  const yield10a = ((cupon / precioSlider) * 100).toFixed(2);
  const yieldNumerico = parseFloat(yield10a);

  const seccionEscenario = ESCENARIOS.find((e) => e.id === escenarioSeleccionado) ?? ESCENARIOS[0];

  const SECCIONES: { id: SeccionId; label: string; icono: string }[] = [
    { id: 'bonos', label: 'Bonos soberanos', icono: '📜' },
    { id: 'tenedores', label: 'Quién la tiene', icono: '🥧' },
    { id: 'prima', label: 'Prima de riesgo', icono: '📊' },
    { id: 'sostenibilidad', label: 'Sostenibilidad', icono: '⚖️' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏛️</div>
        <h1>Visualizador de la Deuda Pública</h1>
        <p>Cómo funciona la deuda soberana: bonos, tipos de interés, quién la financia y sostenibilidad</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="medium"
        collapsible={true}
      >
        Esta herramienta explica el funcionamiento de la deuda pública con fines exclusivamente educativos. Los datos macroeconómicos mostrados son orientativos y pueden no reflejar la situación más reciente. No constituye asesoramiento financiero ni fiscal.
      </DisclaimerCard>

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES.map((s) => (
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

      {/* ── SECCIÓN: BONOS ── */}
      {seccionActiva === 'bonos' && (
        <section className={styles.seccion} aria-label="Bonos soberanos">
          <h2 className={styles.seccionTitulo}>📜 Cómo funciona un bono soberano</h2>

          <div className={styles.gridInstrumentos}>
            {[
              {
                nombre: 'Letras del Tesoro',
                plazo: '3 – 12 meses',
                tipo: 'Precio de descuento',
                inversor: 'Empresas, tesorería corporativa',
                color: '#2E86AB',
                desc: 'No pagan cupón periódico. Se emiten por debajo del valor nominal (ej: 980 €) y se cobran a 1.000 € al vencimiento. La diferencia es el rendimiento.',
              },
              {
                nombre: 'Bonos del Estado',
                plazo: '2 y 3 años',
                tipo: 'Cupón anual fijo',
                inversor: 'Fondos a corto-medio plazo',
                color: '#48A9A6',
                desc: 'Pagan un cupón anual fijo (ej: 3% sobre 1.000 € = 30 € al año) más la devolución del principal al vencimiento. Son la referencia para tipos de interés a medio plazo.',
              },
              {
                nombre: 'Obligaciones del Estado',
                plazo: '5, 10, 15, 30, 50 años',
                tipo: 'Cupón anual fijo',
                inversor: 'Fondos de pensiones, BCE',
                color: '#7FB3D3',
                desc: 'El instrumento a largo plazo. Las obligaciones a 10 años son la referencia mundial para comparar el riesgo país. Su yield determina la prima de riesgo.',
              },
            ].map((inst) => (
              <div key={inst.nombre} className={styles.cardInstrumento} style={{ borderTopColor: inst.color }}>
                <h3 style={{ color: inst.color }}>{inst.nombre}</h3>
                <div className={styles.chipGrid}>
                  <span className={styles.chip}>⏱ {inst.plazo}</span>
                  <span className={styles.chip}>💶 {inst.tipo}</span>
                  <span className={styles.chip}>👤 {inst.inversor}</span>
                </div>
                <p className={styles.instDesc}>{inst.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.yieldBox}>
            <h3>📈 Precio vs Rentabilidad (yield)</h3>
            <p className={styles.yieldExplicacion}>
              El precio y la rentabilidad de un bono se mueven en sentido <strong>opuesto</strong>.
              Si el mercado vende bonos (precio cae), la yield sube. Si hay demanda (precio sube), la yield baja.
            </p>
            <div className={styles.sliderArea}>
              <label htmlFor="precioSlider" className={styles.sliderLabel}>
                Precio del bono (valor nominal 100 €, cupón 3%):
              </label>
              <input
                id="precioSlider"
                type="range"
                min={70}
                max={130}
                step={1}
                value={precioSlider}
                onChange={(e) => setPrecioSlider(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderResultados}>
                <div className={styles.sliderVal}>
                  <span className={styles.sliderEtiqueta}>Precio</span>
                  <span className={`${styles.sliderNumero} ${styles.azul}`}>{precioSlider} €</span>
                </div>
                <div className={styles.flecha} aria-hidden="true">↔</div>
                <div className={styles.sliderVal}>
                  <span className={styles.sliderEtiqueta}>Yield</span>
                  <span
                    className={`${styles.sliderNumero} ${
                      yieldNumerico > 3.5 ? styles.rojo : yieldNumerico < 2.5 ? styles.verde : styles.azul
                    }`}
                  >
                    {yield10a}%
                  </span>
                </div>
              </div>
              <p className={styles.yieldInterpretacion}>
                {yieldNumerico > 3.5
                  ? '⚠️ Yield alta: el mercado exige más rentabilidad → menor confianza o tipos de interés generales altos.'
                  : yieldNumerico < 2.5
                  ? '✅ Yield baja: alta demanda del bono → el Estado puede financiarse barato.'
                  : '📊 Yield en rango normal para el entorno actual de tipos europeos.'}
              </p>
            </div>
          </div>

          <div className={styles.curvaTipos}>
            <h3>📉 Curva de tipos (yield curve)</h3>
            <div className={styles.curvaGrid}>
              {[
                { plazo: '3m', tipo: '3.2', desc: 'Corto plazo' },
                { plazo: '6m', tipo: '3.4', desc: '' },
                { plazo: '1a', tipo: '3.5', desc: '' },
                { plazo: '2a', tipo: '3.4', desc: '' },
                { plazo: '5a', tipo: '3.5', desc: 'Medio plazo' },
                { plazo: '10a', tipo: '3.55', desc: 'Referencia' },
                { plazo: '30a', tipo: '3.8', desc: 'Largo plazo' },
              ].map((punto, i) => {
                const altura = Math.max(20, (parseFloat(punto.tipo) - 3.0) * 200);
                return (
                  <div key={i} className={styles.curvaColumna}>
                    <div className={styles.curvaBarraWrap}>
                      <div
                        className={styles.curvaBarra}
                        style={{ height: `${altura}px` }}
                        title={`${punto.plazo}: ${punto.tipo}%`}
                      />
                    </div>
                    <span className={styles.curvaEtiqueta}>{punto.plazo}</span>
                    <span className={styles.curvaTipo}>{punto.tipo}%</span>
                  </div>
                );
              })}
            </div>
            <p className={styles.curvaTexto}>
              Curva normal: los tipos a largo plazo son más altos que los de corto plazo (compensan el riesgo de inflación e incertidumbre). Una curva <strong>invertida</strong> (corto &gt; largo) suele preceder recesiones.
            </p>
          </div>
        </section>
      )}

      {/* ── SECCIÓN: TENEDORES ── */}
      {seccionActiva === 'tenedores' && (
        <section className={styles.seccion} aria-label="Quién tiene la deuda española">
          <h2 className={styles.seccionTitulo}>🥧 Quién tiene la deuda española</h2>
          <p className={styles.seccionSubtitulo}>
            Datos representativos 2024 (~1,6 billones €). Haz clic en cada grupo para ver más detalles.
          </p>

          <div className={styles.tartaContenedor}>
            <div className={styles.tartaGrafico} role="img" aria-label="Gráfico de tenedores de deuda">
              {TENEDORES.map((t, i) => {
                const inicio = TENEDORES.slice(0, i).reduce((acc, x) => acc + x.porcentaje, 0);
                const angulo = (t.porcentaje / 100) * 360;
                const startRad = ((inicio - 90) * Math.PI) / 180;
                const endRad = ((inicio + angulo - 90) * Math.PI) / 180;
                const cx = 100;
                const cy = 100;
                const r = 85;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const largeArc = angulo > 180 ? 1 : 0;
                const path = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
                return (
                  <svg
                    key={i}
                    viewBox="0 0 200 200"
                    className={`${styles.tartaSector} ${tenedorSeleccionado === i ? styles.tartaSectorActivo : ''}`}
                    onClick={() => setTenedorSeleccionado(tenedorSeleccionado === i ? null : i)}
                    aria-label={`${t.nombre}: ${t.porcentaje}%`}
                    role="button"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  >
                    <path d={path} fill={t.color} opacity={tenedorSeleccionado === null || tenedorSeleccionado === i ? 1 : 0.4} />
                  </svg>
                );
              })}
              <div className={styles.tartaEtiqueta}>
                {tenedorSeleccionado !== null ? (
                  <>
                    <span className={styles.tartaPct}>{TENEDORES[tenedorSeleccionado].porcentaje}%</span>
                    <span className={styles.tartaNom}>{TENEDORES[tenedorSeleccionado].nombre.split(' ')[0]}</span>
                  </>
                ) : (
                  <span className={styles.tartaNom}>Toca un sector</span>
                )}
              </div>
            </div>

            <div className={styles.tartaLeyenda}>
              {TENEDORES.map((t, i) => (
                <button
                  key={i}
                  className={`${styles.leyendaItem} ${tenedorSeleccionado === i ? styles.leyendaItemActivo : ''}`}
                  onClick={() => setTenedorSeleccionado(tenedorSeleccionado === i ? null : i)}
                  aria-pressed={tenedorSeleccionado === i}
                >
                  <span className={styles.leyendaColor} style={{ backgroundColor: t.color }} aria-hidden="true" />
                  <span className={styles.leyendaNombre}>{t.nombre}</span>
                  <span className={styles.leyendaPct}>{t.porcentaje}%</span>
                </button>
              ))}
            </div>
          </div>

          {tenedorSeleccionado !== null && (
            <div className={styles.tenedorDetalle} style={{ borderLeftColor: TENEDORES[tenedorSeleccionado].color }}>
              <h3 style={{ color: TENEDORES[tenedorSeleccionado].color }}>
                {TENEDORES[tenedorSeleccionado].nombre}
              </h3>
              <p>{TENEDORES[tenedorSeleccionado].descripcion}</p>
            </div>
          )}

          <div className={styles.infoBox}>
            <p>
              <strong>🔍 Clave para entender la estabilidad:</strong> Cuanto mayor es la participación de inversores domésticos (residentes), más resiliente es la deuda ante turbulencias internacionales.
              Japón (260% PIB) puede mantener esa deuda porque el 90% la tienen ahorradores japoneses que no venden en pánico.
            </p>
          </div>
        </section>
      )}

      {/* ── SECCIÓN: PRIMA DE RIESGO ── */}
      {seccionActiva === 'prima' && (
        <section className={styles.seccion} aria-label="Prima de riesgo">
          <h2 className={styles.seccionTitulo}>📊 Prima de riesgo en Europa</h2>
          <p className={styles.seccionSubtitulo}>
            Diferencial respecto al Bund alemán a 10 años (puntos básicos, pb). Datos representativos 2024.
            1 pb = 0,01 puntos porcentuales.
          </p>

          <div className={styles.primaGrid}>
            {PAISES_RIESGO.map((p) => {
              const maxPrima = 150;
              const anchoPct = p.prima === 0 ? 100 : Math.min(100, (p.prima / maxPrima) * 100);
              return (
                <div key={p.pais} className={styles.primaFila}>
                  <div className={styles.primaPais}>
                    <span className={styles.primaBandera} aria-hidden="true">{p.bandera}</span>
                    <span className={styles.primaNombre}>{p.pais}</span>
                  </div>
                  <div className={styles.primaBarraWrap}>
                    <div
                      className={styles.primaBarra}
                      style={{
                        width: `${anchoPct}%`,
                        backgroundColor: p.pais === 'Alemania' ? '#2E86AB' : p.prima > 130 ? '#E76F51' : p.prima > 80 ? '#F4A261' : '#48A9A6',
                      }}
                      role="meter"
                      aria-label={`${p.pais}: ${p.prima} pb`}
                    />
                  </div>
                  <div className={styles.primaDatos}>
                    <span className={styles.primaPb}>
                      {p.prima === 0 ? 'Referencia' : `${p.prima} pb`}
                    </span>
                    <span className={styles.primaBono}>{p.bono10a}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.primaExplicaciones}>
            <div className={styles.primaCard}>
              <h3>¿Qué es la prima de riesgo?</h3>
              <p>
                Es la diferencia de rentabilidad entre el bono soberano a 10 años de un país y el bono alemán equivalente (Bund).
                Alemania es la referencia porque tiene la mayor solvencia percibida de la Eurozona.
              </p>
            </div>
            <div className={styles.primaCard}>
              <h3>¿Por qué importa?</h3>
              <p>
                Una prima alta significa que los inversores piden más rendimiento para asumir el riesgo de prestar al Estado.
                Eso se traduce directamente en mayor coste de financiación: hipotecas, créditos empresariales y deuda pública más caros.
              </p>
            </div>
            <div className={styles.primaCard}>
              <h3>Hito histórico</h3>
              <p>
                En julio de 2012, la prima española alcanzó <strong>638 puntos básicos</strong> (6,38%) durante la crisis del euro.
                El discurso de Mario Draghi — &quot;whatever it takes&quot; — la redujo drásticamente en pocas semanas.
                Hoy ronda los 90-100 pb.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── SECCIÓN: SOSTENIBILIDAD ── */}
      {seccionActiva === 'sostenibilidad' && (
        <section className={styles.seccion} aria-label="Sostenibilidad de la deuda">
          <h2 className={styles.seccionTitulo}>⚖️ ¿Cuándo es sostenible la deuda?</h2>
          <p className={styles.seccionSubtitulo}>
            La condición de Domar: si el PIB crece más rápido que los intereses, el ratio deuda/PIB se estabiliza solo.
          </p>

          <div className={styles.escenariosSelectorGrid}>
            {ESCENARIOS.map((esc) => (
              <button
                key={esc.id}
                className={`${styles.escenarioBtn} ${escenarioSeleccionado === esc.id ? styles.escenarioBtnActivo : ''}`}
                onClick={() => setEscenarioSeleccionado(esc.id)}
                aria-pressed={escenarioSeleccionado === esc.id}
              >
                <span className={styles.escenarioIcono} aria-hidden="true">{esc.icono}</span>
                <span>{esc.titulo}</span>
              </button>
            ))}
          </div>

          {seccionEscenario && (
            <div className={`${styles.escenarioDetalle} ${styles[seccionEscenario.claseCss]}`}>
              <h3>
                <span aria-hidden="true">{seccionEscenario.icono}</span> {seccionEscenario.titulo}
              </h3>
              <p>{seccionEscenario.descripcion}</p>
              <div className={styles.escenarioCondicion}>
                <strong>Condición:</strong> {seccionEscenario.condicion}
              </div>
              <div className={styles.escenarioEjemplo}>
                <strong>Ejemplo real:</strong> {seccionEscenario.ejemplo}
              </div>
            </div>
          )}

          <div className={styles.mecanismosGrid}>
            <h3 className={styles.mecanismosTitulo}>Mecanismos de ajuste</h3>
            {[
              {
                nombre: 'Austeridad',
                icono: '✂️',
                desc: 'Recortar gasto público o subir impuestos para reducir el déficit. Reduce la deuda pero puede contraer la economía (efecto multiplicador negativo).',
              },
              {
                nombre: 'Inflación',
                icono: '📈',
                desc: 'Si la deuda es en moneda propia, la inflación "licúa" su valor real. Es el mecanismo menos visible políticamente pero muy poderoso históricamente.',
              },
              {
                nombre: 'Reestructuración',
                icono: '🔄',
                desc: 'Renegociar plazos (extensión) y quitas (reducción del principal). Traumático para la reputación crediticia pero a veces inevitable (Grecia 2012, Argentina 2001).',
              },
              {
                nombre: 'Crecimiento',
                icono: '🌱',
                desc: 'El más sostenible a largo plazo. Si el PIB crece, la deuda como porcentaje del PIB cae automáticamente aunque no se amortice deuda nominal.',
              },
            ].map((mec) => (
              <div key={mec.nombre} className={styles.mecanismoCard}>
                <span className={styles.mecanismoIcono} aria-hidden="true">{mec.icono}</span>
                <h4>{mec.nombre}</h4>
                <p>{mec.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.maastrichtBox}>
            <h3>📋 Límites del Pacto de Estabilidad (Maastricht)</h3>
            <div className={styles.maastrichtGrid}>
              <div className={styles.maastrichtItem}>
                <span className={styles.maastrichtValor}>3%</span>
                <span className={styles.maastrichtLabel}>Déficit máximo / PIB</span>
              </div>
              <div className={styles.maastrichtItem}>
                <span className={styles.maastrichtValor}>60%</span>
                <span className={styles.maastrichtLabel}>Deuda máxima / PIB</span>
              </div>
            </div>
            <p className={styles.maastrichtNota}>
              En 2024, más del 60% de los países de la UE superan el límite de deuda del 60%.
              Los propios creadores de las reglas (Alemania, Francia) las han incumplido en múltiples ocasiones.
              El Pacto fue suspendido entre 2020-2024 por la pandemia y se ha reformado con más flexibilidad.
            </p>
          </div>
        </section>
      )}

      <EducationalSection
        title="¿Qué es la deuda pública y cómo funciona?"
        subtitle="Bonos soberanos, prima de riesgo y sostenibilidad explicados"
      >
        {/* 1. Tabla comparativa — Instrumentos de deuda soberana española */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Instrumento</th>
                <th>Plazo</th>
                <th>Cupón</th>
                <th>Inversor típico</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Letra del Tesoro</strong></td>
                <td>3, 6, 9, 12 meses</td>
                <td>Sin cupón (descuento)</td>
                <td>Inversores a corto plazo</td>
                <td>Tipo de descuento</td>
              </tr>
              <tr>
                <td><strong>Bono del Estado</strong></td>
                <td>2 y 3 años</td>
                <td>Anual fijo</td>
                <td>Banca, fondos</td>
                <td>Yield 2-3 años</td>
              </tr>
              <tr>
                <td><strong>Obligación del Estado</strong></td>
                <td>5, 10, 15, 30, 50 años</td>
                <td>Anual fijo</td>
                <td>Fondos pensiones, BCE</td>
                <td>Yield 10 años (referencia)</td>
              </tr>
              <tr>
                <td><strong>Bono indexado a inflación</strong></td>
                <td>5, 10, 15 años</td>
                <td>Variable (ligado al IPC)</td>
                <td>Inversores anti-inflación</td>
                <td>IPC + spread</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles de uso */}
        <div className={styles.escenariosGrid}>
          {[
            {
              icono: '🎓',
              titulo: 'Estudiante de económicas o políticas',
              desc: 'Aprende la diferencia entre déficit y deuda, y el mecanismo de emisión de bonos soberanos.',
            },
            {
              icono: '📰',
              titulo: 'Ciudadano que sigue las noticias',
              desc: 'Entiende qué significa "la prima de riesgo ha subido 20 puntos" y por qué afecta a tu hipoteca.',
            },
            {
              icono: '💰',
              titulo: 'Ahorrador conservador',
              desc: 'Evalúa si comprar Letras del Tesoro directamente en tesoro.es como alternativa a los depósitos bancarios.',
            },
            {
              icono: '🏛️',
              titulo: 'Docente o analista',
              desc: 'Explica la sostenibilidad de la deuda con la regla r vs g de Domar y los casos históricos de Japón y Grecia.',
            },
          ].map((perfil) => (
            <div key={perfil.titulo} className={styles.escenarioCard}>
              <span className={styles.escenarioCardIcono} aria-hidden="true">{perfil.icono}</span>
              <h4>{perfil.titulo}</h4>
              <p>{perfil.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <ul className={styles.faqList}>
          {[
            {
              q: '¿Cuál es la diferencia entre déficit y deuda pública?',
              a: 'El déficit es la diferencia entre gasto e ingresos en un año concreto (el "rojo" de ese año). La deuda pública es la acumulación de todos los déficits pasados que no han sido pagados: es el stock total que el Estado debe a sus acreedores.',
            },
            {
              q: '¿Por qué sube la prima de riesgo?',
              a: 'Los inversores piden más rentabilidad para asumir el riesgo de prestar a un país que perciben menos solvente. Si hay dudas sobre la capacidad de pago (déficit alto, bajo crecimiento, inestabilidad política), la prima sube y el Estado paga más intereses.',
            },
            {
              q: '¿Puede un país "quebrar"?',
              a: 'Sí: Argentina 2001 y Grecia 2012 son los ejemplos más recientes. Sin embargo, un país con moneda propia puede emitir dinero para pagar su deuda, aunque eso genera inflación. Los países del euro no tienen esa opción y dependen del BCE.',
              tip: 'España está en el euro, así que no puede "imprimir euros". La solvencia depende del mercado y del apoyo del BCE.',
            },
            {
              q: '¿Quién decide el tipo de interés de la deuda española?',
              a: 'El mercado, en las subastas del Tesoro. El Tesoro recibe peticiones ordenadas por la rentabilidad exigida y acepta las más baratas hasta cubrir el importe objetivo. El tipo marginal de la última puja aceptada fija el tipo oficial para todos.',
            },
            {
              q: '¿Es mala la deuda pública por encima del 100% del PIB?',
              a: 'Depende de quién la tiene y en qué moneda. Japón tiene el 260% y es estable porque el 90% es interna y en yenes. Grecia tuvo problemas con el 110% porque era en euros y en manos extranjeras. El ratio por sí solo no determina la sostenibilidad.',
            },
            {
              q: '¿Puede el BCE imprimir dinero para pagar la deuda española?',
              a: 'El BCE puede comprar deuda en el mercado secundario (QE, PEPP), pero no directamente al Tesoro en el mercado primario. La prohibición de financiación monetaria directa está recogida en el artículo 123 del Tratado de Funcionamiento de la Unión Europea.',
              tip: '"Whatever it takes" de Draghi (2012) se refería a la compra en mercado secundario, no a financiar directamente al Estado.',
            },
          ].map((item) => (
            <li key={item.q} className={styles.faqItem}>
              <strong>{item.q}</strong>
              <span>{item.a}</span>
              {item.tip && <span className={styles.faqTip}>💡 {item.tip}</span>}
            </li>
          ))}
        </ul>

        {/* 4. Guía paso a paso — Cómo España financia su déficit con bonos */}
        <ol className={styles.stepGuide}>
          {[
            'El Gobierno aprueba unos Presupuestos Generales con un déficit previsto (ej: 3,5% del PIB).',
            'El Tesoro Público calcula cuánto debe emitir en bonos ese año para financiar el déficit más amortizar la deuda que vence.',
            'Publica el calendario de subastas: cada martes para Letras; tercer jueves del mes para bonos y obligaciones.',
            'En la subasta, los inversores (bancos, fondos, BCE) pujan indicando cuánto quieren comprar y a qué tipo de interés.',
            'El Tesoro acepta las pujas más baratas (menor interés exigido) hasta cubrir el importe objetivo de la emisión.',
            'El tipo marginal de la subasta fija el tipo oficial de emisión para todos los adjudicatarios de esa ronda.',
            'Los bonos emitidos cotizan en el mercado secundario (AIAF). Su precio fluctúa con el mercado hasta que llegan a vencimiento.',
          ].map((paso, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <span className={styles.stepContent}>{paso}</span>
            </li>
          ))}
        </ol>

        {/* 5. Tips / datos clave */}
        <div className={styles.tipsGrid}>
          {[
            {
              icono: '📊',
              titulo: 'Deuda/PIB como ratio',
              texto: 'Lo que importa no es la deuda en euros sino su proporción al tamaño de la economía. España: ~108%, Alemania: ~63%, Japón: ~260%. Comparar cifras absolutas entre países no tiene sentido.',
            },
            {
              icono: '💶',
              titulo: 'Coste medio de la deuda española',
              texto: '~2,5-3% anual. El BCE subiendo tipos aumenta el coste de las nuevas emisiones, pero la deuda antigua tiene tipos fijos y no se encarece de inmediato.',
            },
            {
              icono: '🔄',
              titulo: 'Ciclo de refinanciación',
              texto: 'España emite ~250.000 M€/año. La mayor parte es para renovar deuda que vence, no solo para financiar el déficit nuevo. Es un ciclo continuo de vencimientos y nuevas emisiones.',
            },
            {
              icono: '🏦',
              titulo: 'El BCE como comprador',
              texto: 'Durante el QE (2015-2022) y el PEPP (2020-2022), el BCE compró más del 100% de las nuevas emisiones netas de deuda española, manteniendo los tipos artificialmente bajos.',
            },
            {
              icono: '🌍',
              titulo: 'La prima de riesgo en perspectiva',
              texto: 'En 2012 llegó a 638 pb. En 2024 ronda 90-100 pb. El "whatever it takes" de Draghi cambió los mercados europeos para siempre al demostrar que el BCE actuaría como prestamista de última instancia.',
            },
          ].map((tip) => (
            <div key={tip.titulo} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
              <h4>{tip.titulo}</h4>
              <p>{tip.texto}</p>
            </div>
          ))}
        </div>

        {/* 6. Warning Box — errores comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes sobre la deuda pública</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ &quot;La deuda pública es como la deuda de una familia&quot;</strong> — los estados tienen capacidad de crear dinero, emitir más deuda, recaudar impuestos y duran indefinidamente; las familias, no.</li>
            <li><strong>❌ &quot;Reducir el déficit siempre es bueno para la economía&quot;</strong> — en recesión, la austeridad puede reducir el PIB más de lo que reduce el déficit (multiplicador fiscal negativo; caso Grecia 2010-2015).</li>
            <li><strong>❌ &quot;Los bonos son siempre seguros&quot;</strong> — los bonos de países en dificultades (Grecia 2012, Argentina 2001) sufrieron quitas del 50-70%. El &quot;riesgo soberano&quot; es real.</li>
            <li><strong>❌ &quot;El BCE imprime dinero para financiar España&quot;</strong> — el BCE no puede comprar deuda en el mercado primario (primera emisión). Solo puede hacerlo en el secundario, y con límites establecidos por el Tribunal de Justicia de la UE.</li>
            <li><strong>❌ &quot;Una deuda alta siempre lleva al impago&quot;</strong> — Japón lleva décadas con +200% del PIB sin impago. La sostenibilidad depende de quién la tiene, en qué moneda y a qué tipo de interés.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-deuda-publica" />
      <Footer appName="visualizador-deuda-publica" />
    </div>
  );
}
