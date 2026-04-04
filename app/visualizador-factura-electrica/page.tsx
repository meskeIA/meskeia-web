'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorFacturaElectrica.module.css';
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
import { jsonLd } from './metadata';
import Chart from 'chart.js/auto';

// ─────────────────────────────────────────────
// Datos de la factura ficticia
// ─────────────────────────────────────────────

interface ConceptoFactura {
  id: string;
  concepto: string;
  importe: number;
  categoria: 'energia' | 'potencia' | 'impuestos';
  icono: string;
  explicacion: string;
  detalle: string;
}

const CONCEPTOS: ConceptoFactura[] = [
  {
    id: 'energia-punta',
    concepto: 'Energía consumida — Punta (P1)',
    importe: 18.45,
    categoria: 'energia',
    icono: '⚡',
    explicacion: 'Lo que pagas por los kWh consumidos en horario punta (10-14h y 18-22h, laborables). Es el tramo más caro del día.',
    detalle: 'Ejemplo: 85 kWh × 0,217 €/kWh = 18,45 €. En PVPC el precio varía cada hora. En mercado libre, el precio es fijo pero suele ser más alto que la media PVPC.',
  },
  {
    id: 'energia-llano',
    concepto: 'Energía consumida — Llano (P2)',
    importe: 12.30,
    categoria: 'energia',
    icono: '⚡',
    explicacion: 'Consumo en horario llano (8-10h, 14-18h y 22-24h, laborables). Precio intermedio.',
    detalle: 'Ejemplo: 95 kWh × 0,1295 €/kWh = 12,30 €. Incluye las primeras y últimas horas del día laboral.',
  },
  {
    id: 'energia-valle',
    concepto: 'Energía consumida — Valle (P3)',
    importe: 7.80,
    categoria: 'energia',
    icono: '🌙',
    explicacion: 'Consumo en horario valle (0-8h laborables y todo el fin de semana/festivos). El tramo más barato.',
    detalle: 'Ejemplo: 120 kWh × 0,065 €/kWh = 7,80 €. Poner la lavadora, el lavavajillas y cargar el coche eléctrico de noche ahorra dinero real.',
  },
  {
    id: 'peaje-energia',
    concepto: 'Peaje de acceso — Energía',
    importe: 5.20,
    categoria: 'energia',
    icono: '🛤️',
    explicacion: 'Lo que pagas por usar la red de transporte y distribución eléctrica. Va a las empresas que mantienen las torres, cables y transformadores.',
    detalle: 'Lo fija el Gobierno, no tu comercializadora. Es igual para todos los consumidores del mismo tipo. Es como el "peaje de la autopista" del sistema eléctrico.',
  },
  {
    id: 'cargos-energia',
    concepto: 'Cargos del sistema — Energía',
    importe: 3.15,
    categoria: 'energia',
    icono: '🏛️',
    explicacion: 'Costes regulados del sistema eléctrico: primas a renovables, compensaciones a islas, anualidades del déficit de tarifa histórico.',
    detalle: 'Son costes "políticos" que el sistema arrastra. Incluyen subvenciones a energías renovables, costes extra de generar electricidad en Canarias/Baleares, y la deuda del déficit de tarifa acumulado hasta 2013.',
  },
  {
    id: 'potencia-punta',
    concepto: 'Potencia contratada — Punta (P1-P2)',
    importe: 8.40,
    categoria: 'potencia',
    icono: '🔌',
    explicacion: 'Pagas por tener disponible una potencia máxima, aunque no la uses. Es como el "alquiler" de la conexión eléctrica.',
    detalle: 'Ejemplo: 4,6 kW × 30 días × 0,0609 €/kW/día = 8,40 €. Si nunca enciendes nada, sigues pagando este concepto. Es fijo cada mes.',
  },
  {
    id: 'potencia-valle',
    concepto: 'Potencia contratada — Valle (P3)',
    importe: 2.10,
    categoria: 'potencia',
    icono: '🔌',
    explicacion: 'Potencia contratada para el periodo valle. Desde 2021 puedes contratar potencias diferentes para punta y valle.',
    detalle: 'Ejemplo: 4,6 kW × 30 días × 0,0152 €/kW/día = 2,10 €. Si tienes coche eléctrico, puedes contratar más potencia en valle sin encarecer la punta.',
  },
  {
    id: 'peaje-potencia',
    concepto: 'Peaje de acceso — Potencia',
    importe: 3.85,
    categoria: 'potencia',
    icono: '🛤️',
    explicacion: 'Peaje regulado por la potencia contratada. Parte fija del coste de mantener la red.',
    detalle: 'Igual que el peaje de energía, pero calculado sobre la potencia, no sobre el consumo. Lo pagas aunque no consumas nada.',
  },
  {
    id: 'impuesto-electrico',
    concepto: 'Impuesto sobre la electricidad (3,8%)',
    importe: 2.32,
    categoria: 'impuestos',
    icono: '🏛️',
    explicacion: 'Impuesto especial sobre la electricidad. Se aplica sobre el total de energía + potencia antes de IVA.',
    detalle: 'Históricamente era del 5,1127%. Se redujo al 0,5% durante la crisis energética (2022-2023) y actualmente está en el 3,8% (2025). Se aplica sobre la suma de todos los conceptos anteriores.',
  },
  {
    id: 'alquiler-contador',
    concepto: 'Alquiler del contador',
    importe: 0.81,
    categoria: 'impuestos',
    icono: '📟',
    explicacion: 'Si no eres propietario del contador, pagas un alquiler mensual a la distribuidora (~0,81 €/mes).',
    detalle: 'Puedes comprar tu propio contador homologado y dejar de pagar este concepto, pero el ahorro es mínimo (~10 €/año) y la gestión engorrosa.',
  },
  {
    id: 'iva',
    concepto: 'IVA (21%)',
    importe: 13.51,
    categoria: 'impuestos',
    icono: '💶',
    explicacion: 'Impuesto sobre el Valor Añadido. Se aplica sobre TODO lo anterior: energía, potencia, peajes, cargos, impuesto eléctrico y alquiler.',
    detalle: 'El IVA eléctrico fue reducido al 5% y 10% durante la crisis energética (2022-2024). En 2025 ha vuelto al 21% general. Se aplica sobre la suma total incluyendo el impuesto eléctrico (impuesto sobre impuesto).',
  },
];

const totalFactura = CONCEPTOS.reduce((s, c) => s + c.importe, 0);
const totalEnergia = CONCEPTOS.filter(c => c.categoria === 'energia').reduce((s, c) => s + c.importe, 0);
const totalPotencia = CONCEPTOS.filter(c => c.categoria === 'potencia').reduce((s, c) => s + c.importe, 0);
const totalImpuestos = CONCEPTOS.filter(c => c.categoria === 'impuestos').reduce((s, c) => s + c.importe, 0);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFacturaElectricaPage() {
  const [conceptoActivo, setConceptoActivo] = useState<string | null>(null);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Energía consumida', 'Potencia contratada', 'Impuestos y otros'],
        datasets: [{
          data: [totalEnergia, totalPotencia, totalImpuestos],
          backgroundColor: ['#2E86AB', '#48A9A6', '#e67e22'],
          borderWidth: 2,
          borderColor: 'white',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx: { label?: string; parsed: number }) => {
                const pct = ((ctx.parsed / totalFactura) * 100).toFixed(1);
                return `${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
              },
            },
          },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, []);

  const conceptoSeleccionado = CONCEPTOS.find(c => c.id === conceptoActivo);

  const categoriaColor = (cat: string) => {
    if (cat === 'energia') return '#2E86AB';
    if (cat === 'potencia') return '#48A9A6';
    return '#e67e22';
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
          <h1 className={styles.title}>Tu Electricidad al Desnudo</h1>
          <p className={styles.subtitle}>Cada línea de tu factura de la luz, explicada — pulsa para descubrir qué pagas y por qué</p>
        </header>

        <LegalNotice />

        <p className={styles.instruccion}>
          <span aria-hidden="true">👆</span> Factura ficticia de ejemplo (piso 80m², PVPC, enero 2025). Haz clic en cada concepto.
        </p>

        {/* Gráfico doughnut */}
        <div className={styles.chartContainer}>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label="Gráfico circular: energía, potencia e impuestos en la factura" />
          </div>
          <div className={styles.chartCentro}>
            <span className={styles.chartTotal}>{formatCurrency(totalFactura)}</span>
            <span className={styles.chartLabel}>Total factura</span>
          </div>
        </div>

        {/* Resumen por categoría */}
        <div className={styles.resumenCats}>
          <div className={styles.catCard} style={{ borderTopColor: '#2E86AB' }}>
            <span className={styles.catNombre}>Energía</span>
            <span className={styles.catValor} style={{ color: '#2E86AB' }}>{formatCurrency(totalEnergia)}</span>
            <span className={styles.catPct}>{formatNumber((totalEnergia / totalFactura) * 100, 0)}%</span>
          </div>
          <div className={styles.catCard} style={{ borderTopColor: '#48A9A6' }}>
            <span className={styles.catNombre}>Potencia</span>
            <span className={styles.catValor} style={{ color: '#48A9A6' }}>{formatCurrency(totalPotencia)}</span>
            <span className={styles.catPct}>{formatNumber((totalPotencia / totalFactura) * 100, 0)}%</span>
          </div>
          <div className={styles.catCard} style={{ borderTopColor: '#e67e22' }}>
            <span className={styles.catNombre}>Impuestos</span>
            <span className={styles.catValor} style={{ color: '#e67e22' }}>{formatCurrency(totalImpuestos)}</span>
            <span className={styles.catPct}>{formatNumber((totalImpuestos / totalFactura) * 100, 0)}%</span>
          </div>
        </div>

        {/* Lista de conceptos */}
        <div className={styles.conceptosLista}>
          {CONCEPTOS.map(c => (
            <div key={c.id} className={styles.conceptoWrapper}>
              <button
                type="button"
                className={`${styles.conceptoBtn} ${conceptoActivo === c.id ? styles.conceptoActivo : ''}`}
                onClick={() => setConceptoActivo(prev => prev === c.id ? null : c.id)}
                aria-expanded={conceptoActivo === c.id}
                style={{ borderLeftColor: categoriaColor(c.categoria) }}
              >
                <span className={styles.conceptoIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.conceptoNombre}>{c.concepto}</span>
                <span className={styles.conceptoImporte}>{formatCurrency(c.importe)}</span>
                <span className={`${styles.conceptoChevron} ${conceptoActivo === c.id ? styles.chevronAbierto : ''}`} aria-hidden="true">▼</span>
              </button>
              {conceptoActivo === c.id && (
                <div className={styles.explicacion}>
                  <p className={styles.explicacionTexto}>{c.explicacion}</p>
                  <p className={styles.explicacionDetalle}>{c.detalle}</p>
                </div>
              )}
            </div>
          ))}
          <div className={styles.totalLinea}>
            <span>Total factura</span>
            <span>{formatCurrency(totalFactura)}</span>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            Lo que realmente controlas (el consumo de energía) es solo el <strong>{formatNumber((totalEnergia / totalFactura) * 100, 0)}% de la factura</strong>.
            El resto son costes fijos (potencia), peajes regulados e impuestos. Por eso ahorrar energía ayuda, pero nunca eliminará la factura.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más ahorro → <a href="/calculadora-suscripciones/">Control Suscripciones</a> · <a href="/visualizador-precio-real-cosas/">El Precio Real de las Cosas</a>
        </div>

        <EducationalSection
          title="Lo que tu factura de la luz no te dice"
          subtitle="Claves para entender (y reducir) lo que pagas"
          defaultOpen={false}
        >
          <h3>PVPC vs mercado libre: ¿cuál es mejor?</h3>
          <p>
            El PVPC (Precio Voluntario al Pequeño Consumidor) tiene un precio que varía cada hora
            según el mercado mayorista. El mercado libre ofrece precio fijo pero suele ser más caro
            de media. Si puedes concentrar consumo en horas baratas (noche, fines de semana), el PVPC
            suele salir mejor. Si prefieres predictibilidad, el mercado libre da tranquilidad.
          </p>

          <h3>Los tramos horarios: punta, llano y valle</h3>
          <p>
            Desde junio 2021, la factura tiene 3 tramos: punta (caro, mediodía y tarde), llano
            (intermedio) y valle (barato, noche y fines de semana). Mover el consumo a valle
            (lavadora, lavavajillas, horno) puede ahorrar un 10-20% en la parte de energía.
          </p>

          <h3>La potencia: lo que pagas por existir</h3>
          <p>
            Aunque no enciendas nada, pagas potencia. Si tienes 5,75 kW contratados pero nunca
            superas los 3,45 kW, estás pagando de más. Revisa tu maxímetro o pide a tu distribuidora
            el registro de potencias máximas. Bajar la potencia puede ahorrar 5-10 €/mes.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> esta factura es ficticia y simplificada con fines educativos. Las
            facturas reales incluyen más conceptos (bono social, compensación excedentes, etc.) y los
            importes varían según comercializadora, potencia contratada, consumo y periodo.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-factura-electrica')} />
        <ShareCard appName="visualizador-factura-electrica" />
        <Footer appName="visualizador-factura-electrica" />
      </div>
    </>
  );
}
