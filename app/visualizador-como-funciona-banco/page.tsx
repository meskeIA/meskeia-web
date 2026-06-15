'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './VisualizadorComoFuncionaBanco.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'deposito' | 'multiplicador' | 'bce' | 'panico';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'deposito', titulo: 'Tu depósito', icono: '🏦', subtitulo: '¿Qué hace el banco con tu dinero?' },
  { id: 'multiplicador', titulo: 'El multiplicador', icono: '🔄', subtitulo: 'Cómo 1.000 € se convierten en 10.000 €' },
  { id: 'bce', titulo: 'El banco central', icono: '🏛️', subtitulo: 'Quién controla las reglas del juego' },
  { id: 'panico', titulo: '¿Y si todos retiran?', icono: '😰', subtitulo: 'El talón de Aquiles del sistema' },
];

// ─────────────────────────────────────────────
// Sección 1: Tu depósito
// ─────────────────────────────────────────────

function SeccionDeposito() {
  const deposito = 1000;
  const reserva = 0.10; // 10%

  const enReserva = deposito * reserva;
  const prestado = deposito - enReserva;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Imagina que depositas <strong>{formatCurrency(deposito)}</strong> en tu cuenta bancaria. ¿Qué pasa con ese dinero?</p>
      </div>

      <div className={styles.flujoVisual}>
        <div className={styles.flujoItem}>
          <span className={styles.flujoIcono} aria-hidden="true">👤</span>
          <span className={styles.flujoLabel}>Tú depositas</span>
          <span className={styles.flujoValor}>{formatCurrency(deposito)}</span>
        </div>
        <div className={styles.flujoFlecha} aria-hidden="true">→</div>
        <div className={styles.flujoItem}>
          <span className={styles.flujoIcono} aria-hidden="true">🏦</span>
          <span className={styles.flujoLabel}>El banco recibe</span>
          <span className={styles.flujoValor}>{formatCurrency(deposito)}</span>
        </div>
      </div>

      <div className={styles.splitVisual}>
        <div className={styles.splitCard} style={{ flex: reserva }}>
          <span className={styles.splitIcono} aria-hidden="true">🔒</span>
          <span className={styles.splitLabel}>Guarda en reserva</span>
          <span className={styles.splitValor}>{formatCurrency(enReserva)}</span>
          <span className={styles.splitPct}>{formatNumber(reserva * 100, 0)}%</span>
        </div>
        <div className={`${styles.splitCard} ${styles.splitPrestamo}`} style={{ flex: 1 - reserva }}>
          <span className={styles.splitIcono} aria-hidden="true">💸</span>
          <span className={styles.splitLabel}>Presta a otros</span>
          <span className={styles.splitValor}>{formatCurrency(prestado)}</span>
          <span className={styles.splitPct}>{formatNumber((1 - reserva) * 100, 0)}%</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>El banco no guarda tu dinero en una caja fuerte.</strong> Solo retiene una pequeña parte
          (la reserva) y presta el resto a otras personas: hipotecas, préstamos personales, créditos a
          empresas. Gana dinero cobrando intereses sobre esos préstamos.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>Pero espera... si el banco ha prestado {formatCurrency(prestado)} de tus {formatCurrency(deposito)},
        ¿qué pasa si quieres sacar tu dinero? El banco confía en que <strong>no todos los clientes
        retirarán su dinero al mismo tiempo</strong>. Y normalmente tiene razón.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: El multiplicador bancario
// ─────────────────────────────────────────────

function SeccionMultiplicador() {
  const [coefReserva, setCoefReserva] = useState(10);
  const depositoInicial = 1000;

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const ciclos = useMemo(() => {
    const resultado: { ciclo: number; deposito: number; reserva: number; prestamo: number; totalCreado: number }[] = [];
    let deposito = depositoInicial;
    let totalCreado = 0;
    const r = coefReserva / 100;

    for (let i = 1; i <= 10; i++) {
      const reserva = deposito * r;
      const prestamo = deposito - reserva;
      totalCreado += deposito;
      resultado.push({ ciclo: i, deposito, reserva, prestamo, totalCreado });
      deposito = prestamo; // El préstamo se deposita en otro banco
    }
    return resultado;
  }, [coefReserva]);

  const multiplicador = 1 / (coefReserva / 100);
  const dineroTotal = depositoInicial * multiplicador;

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ciclos.map(c => `Ciclo ${c.ciclo}`),
        datasets: [
          {
            label: 'Reserva',
            data: ciclos.map(c => c.reserva),
            backgroundColor: '#e74c3c',
            borderRadius: 2,
          },
          {
            label: 'Préstamo',
            data: ciclos.map(c => c.prestamo),
            backgroundColor: '#2E86AB',
            borderRadius: 2,
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
          x: { stacked: true },
          y: {
            stacked: true,
            ticks: { callback: (v: string | number) => formatCurrency(Number(v)) },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [ciclos]);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El dinero prestado no desaparece: <strong>se deposita en otro banco</strong>, que a su vez guarda la reserva y presta el resto. Y así sucesivamente...</p>
      </div>

      {/* Slider de coeficiente de reserva */}
      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Coeficiente de reserva</label>
          <span className={styles.sliderValor}>{coefReserva}%</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={1}
          max={50}
          value={coefReserva}
          onChange={(e) => setCoefReserva(parseInt(e.target.value))}
          aria-label={`Coeficiente de reserva: ${coefReserva}%`}
        />
        <div className={styles.sliderExtremos}>
          <span>1% (máxima creación)</span>
          <span>50% (muy conservador)</span>
        </div>
      </div>

      {/* Ciclos visuales */}
      <div className={styles.ciclosLista}>
        {ciclos.slice(0, 6).map(c => (
          <div key={c.ciclo} className={styles.cicloItem}>
            <span className={styles.cicloNum}>Ciclo {c.ciclo}</span>
            <div className={styles.cicloBarra}>
              <div className={styles.cicloReserva} style={{ width: `${coefReserva}%` }}>
                <span className={styles.cicloBarraTexto}>{formatCurrency(c.reserva)}</span>
              </div>
              <div className={styles.cicloPrestamo} style={{ width: `${100 - coefReserva}%` }}>
                <span className={styles.cicloBarraTexto}>{formatCurrency(c.prestamo)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resultado del multiplicador */}
      <div className={styles.resultadoMultiplicador}>
        <div className={styles.multCard}>
          <span className={styles.multLabel}>Depósito inicial</span>
          <span className={styles.multValor}>{formatCurrency(depositoInicial)}</span>
        </div>
        <div className={styles.multSigno} aria-hidden="true">×</div>
        <div className={styles.multCard}>
          <span className={styles.multLabel}>Multiplicador</span>
          <span className={styles.multValor} style={{ color: '#2E86AB' }}>{formatNumber(multiplicador, 1)}×</span>
        </div>
        <div className={styles.multSigno} aria-hidden="true">=</div>
        <div className={`${styles.multCard} ${styles.multCardDestacado}`}>
          <span className={styles.multLabel}>Dinero total creado</span>
          <span className={styles.multValor} style={{ color: '#27ae60' }}>{formatCurrency(dineroTotal)}</span>
        </div>
      </div>

      {/* Gráfico */}
      <div className={styles.chartContainer}>
        <h4 className={styles.chartTitulo}>Reserva vs préstamo en cada ciclo</h4>
        <div className={styles.chartWrap}>
          <canvas ref={chartRef} aria-label="Gráfico de barras: reserva y préstamo por ciclo del multiplicador bancario" />
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Con un coeficiente de reserva del {coefReserva}%, cada {formatCurrency(depositoInicial)} depositado
          genera hasta <strong>{formatCurrency(dineroTotal)} en el sistema</strong>. El banco no &quot;inventa&quot;
          dinero — lo multiplica a través de ciclos sucesivos de préstamo y depósito.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: El banco central (BCE)
// ─────────────────────────────────────────────

function SeccionBCE() {
  const herramientas = [
    {
      icono: '📊',
      nombre: 'Tipo de interés oficial',
      valor: '4,50% → 2,65% (2024-2025)',
      explicacion: 'Es el precio al que el BCE presta dinero a los bancos. Si sube, los bancos cobran más por las hipotecas. Si baja, el crédito se abarata.',
      efecto: 'Sube → hipotecas más caras → la gente compra menos → la inflación baja. Baja → crédito barato → más consumo → riesgo de inflación.',
    },
    {
      icono: '🏦',
      nombre: 'Coeficiente de reserva',
      valor: '1% en la zona euro',
      explicacion: 'El porcentaje mínimo que los bancos deben guardar de cada depósito. En Europa es solo el 1% — muy bajo comparado con otros países.',
      efecto: 'Si sube → los bancos pueden prestar menos → menos dinero en circulación. Si baja → más préstamos posibles → más dinero circulando.',
    },
    {
      icono: '🖨️',
      nombre: 'Compra de deuda (QE)',
      valor: 'Billones de € desde 2015',
      explicacion: 'Compra masiva de bonos públicos en el mercado secundario (Quantitative Easing). Aumenta la base monetaria sin emitir billetes físicos.',
      efecto: 'Se usó en la crisis de 2012, la pandemia (2020) y la crisis energética para abaratar el crédito. Su efecto sobre la inflación depende de si el dinero creado llega a la economía real o se mantiene como reservas bancarias (debate académico abierto).',
    },
    {
      icono: '💶',
      nombre: 'Facilidad de depósito',
      valor: '2,50% (2025)',
      explicacion: 'El interés que el BCE paga a los bancos por dejar su dinero "aparcado" en el banco central. Si es alto, los bancos prefieren aparcar que prestar.',
      efecto: 'Es la herramienta más usada actualmente. Subió del 0% al 4% en 2022-2023 para frenar la inflación, y está bajando gradualmente.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El <strong>Banco Central Europeo (BCE)</strong> no presta dinero a personas — presta a los bancos. Es el &quot;banco de los bancos&quot; y controla las reglas del sistema.</p>
      </div>

      <div className={styles.herramientasGrid}>
        {herramientas.map((h, i) => (
          <div key={i} className={styles.herramientaCard}>
            <div className={styles.herramientaHeader}>
              <span className={styles.herramientaIcono} aria-hidden="true">{h.icono}</span>
              <div>
                <span className={styles.herramientaNombre}>{h.nombre}</span>
                <span className={styles.herramientaValor}>{h.valor}</span>
              </div>
            </div>
            <p className={styles.herramientaExplicacion}>{h.explicacion}</p>
            <p className={styles.herramientaEfecto}><strong>Efecto:</strong> {h.efecto}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Cuando el BCE sube los tipos, tu hipoteca variable sube. Cuando los baja, baja. No es magia ni
          capricho — es el mecanismo con el que el BCE intenta <strong>controlar la inflación sin frenar la
          economía</strong>. Un equilibrio difícil que afecta a millones de personas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: ¿Y si todos retiran?
// ─────────────────────────────────────────────

function SeccionPanico() {
  const datos = [
    { evento: 'Northern Rock (2007)', pais: '🇬🇧 Reino Unido', que: 'Colas kilométricas para sacar dinero. El gobierno tuvo que nacionalizar el banco.', leccion: 'Fue el primer "bank run" europeo en 150 años y el preludio de la crisis financiera de 2008.' },
    { evento: 'Corralito argentino (2001)', pais: '🇦🇷 Argentina', que: 'El gobierno congeló todas las cuentas bancarias. La gente no podía sacar su propio dinero.', leccion: 'Duró un año. Destruyó la confianza en el sistema bancario argentino durante una generación.' },
    { evento: 'Grecia (2015)', pais: '🇬🇷 Grecia', que: 'Límite de retirada de 60 €/día durante semanas. Los bancos cerraron.', leccion: 'La crisis de deuda griega demostró que incluso en la zona euro un "corralito" era posible.' },
    { evento: 'Silicon Valley Bank (2023)', pais: '🇺🇸 EE.UU.', que: 'Los clientes retiraron 42.000 millones de dólares en 24 horas vía app. El banco colapsó en 2 días.', leccion: 'El primer "bank run digital" de la historia. Las redes sociales y la banca móvil aceleraron el pánico a velocidad nunca vista.' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Si el banco solo guarda el 1-10% de tu depósito y presta el resto... <strong>¿qué pasa si todos los clientes quieren su dinero a la vez?</strong></p>
      </div>

      <div className={styles.panicoExplicacion}>
        <div className={styles.panicoCard}>
          <span className={styles.panicoIcono} aria-hidden="true">🏦</span>
          <p>El banco tiene <strong>{formatCurrency(100)}</strong> en reserva de cada <strong>{formatCurrency(1000)}</strong> depositados</p>
        </div>
        <div className={styles.panicoFlecha} aria-hidden="true">↓</div>
        <div className={styles.panicoCard}>
          <span className={styles.panicoIcono} aria-hidden="true">👥</span>
          <p>Si más del <strong>10%</strong> de los clientes retiran su dinero a la vez, <strong>el banco no tiene suficiente</strong></p>
        </div>
        <div className={styles.panicoFlecha} aria-hidden="true">↓</div>
        <div className={`${styles.panicoCard} ${styles.panicoAlerta}`}>
          <span className={styles.panicoIcono} aria-hidden="true">😰</span>
          <p>Esto genera <strong>pánico bancario</strong>: cuanta más gente retira, más gente quiere retirar</p>
        </div>
      </div>

      <h3 className={styles.seccionSubtitulo}>Casos reales</h3>
      <div className={styles.casosGrid}>
        {datos.map((d, i) => (
          <div key={i} className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span>{d.pais}</span>
              <strong>{d.evento}</strong>
            </div>
            <p className={styles.casoQue}>{d.que}</p>
            <p className={styles.casoLeccion}>{d.leccion}</p>
          </div>
        ))}
      </div>

      {/* Fondo de Garantía */}
      <div className={styles.garantiaCard}>
        <span className={styles.garantiaIcono} aria-hidden="true">🛡️</span>
        <div>
          <h4 className={styles.garantiaTitulo}>El Fondo de Garantía de Depósitos (FGD)</h4>
          <p className={styles.garantiaTexto}>
            En la UE, tus depósitos están garantizados hasta <strong>100.000 € por titular y banco</strong>.
            Si tu banco quiebra, el FGD te devuelve tu dinero en un máximo de 7 días laborables.
            Es la red de seguridad que evita el pánico — mientras la gente confíe en ella, funciona.
          </p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El sistema bancario funciona porque se basa en la <strong>confianza</strong>. Cuando la confianza
          desaparece, el sistema colapsa — no porque no haya dinero, sino porque no hay suficiente
          dinero <em>al mismo tiempo para todos</em>. El FGD existe precisamente para mantener esa confianza.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorComoFuncionaBancoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('deposito');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'deposito': return <SeccionDeposito />;
      case 'multiplicador': return <SeccionMultiplicador />;
      case 'bce': return <SeccionBCE />;
      case 'panico': return <SeccionPanico />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Funciona un Banco</h1>
          <p className={styles.subtitle}>Cómo funciona realmente: del depósito al multiplicador, del BCE al pánico bancario</p>
        </header>

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
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más finanzas → <a href="/visualizador-dinero-y-tiempo/">El Dinero y el Tiempo</a> · <a href="/visualizador-sueldo-neto/">Tu Sueldo al Desnudo</a> · <a href="/estimador-hipoteca/">Estimador Hipoteca</a>
        </div>

        <EducationalSection
          title="Conceptos clave del sistema bancario"
          subtitle="Conceptos clave para entender tu dinero en el banco"
          defaultOpen={false}
        >
          <h3>¿Los bancos &quot;crean&quot; dinero?</h3>
          <p>
            Sí, en sentido económico. Cuando un banco presta 900 € de tu depósito de 1.000 €,
            tú sigues viendo 1.000 € en tu cuenta y otra persona recibe 900 €. En el sistema
            ahora hay 1.900 € donde antes había 1.000 €. Esto se llama <strong>creación de dinero
            bancario</strong> — no es dinero físico nuevo, sino promesas de pago cruzadas.
          </p>

          <h3>¿Por qué el coeficiente de reserva es tan bajo (1%)?</h3>
          <p>
            El BCE confía en que los bancos gestionan su liquidez de forma prudente y tienen acceso
            a préstamos interbancarios si necesitan más efectivo. Un coeficiente más alto significaría
            menos préstamos disponibles para hipotecas, empresas y consumo — lo que frenaría la economía.
          </p>

          <h3>El Euríbor: el termómetro del sistema</h3>
          <p>
            El Euríbor es el tipo de interés al que los bancos europeos se prestan dinero entre sí.
            Cuando el BCE sube sus tipos, el Euríbor sube. Y cuando el Euríbor sube, tu hipoteca
            variable sube. Es la cadena: <strong>BCE → Euríbor → tu cuota</strong>.
          </p>

          <h3>¿Es seguro tener dinero en el banco?</h3>
          <p>
            En la UE, sí — hasta 100.000 € por titular y banco. Si tienes más, distribúyelo entre
            varios bancos. Desde la crisis de 2008, la regulación bancaria (Basilea III) obliga a
            los bancos a mantener mucho más capital propio como colchón.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica el sistema bancario con fines educativos.
            La banca real incluye regulación compleja (Basilea III/IV), mercados interbancarios,
            derivados financieros y mecanismos de supervisión (BCE, EBA, FROB en España).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-como-funciona-banco')} />
        <ShareCard appName="visualizador-como-funciona-banco" />
        <Footer appName="visualizador-como-funciona-banco" />
    </div>
  );
}
