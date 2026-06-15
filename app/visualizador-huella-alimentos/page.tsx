'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorHuellaAlimentos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Datos: impacto ambiental por kg de alimento
// Fuente: Poore & Nemecek (2018), Science — mayor metaanálisis
// Disponible en Our World in Data
// ─────────────────────────────────────────────

type Metrica = 'co2' | 'agua' | 'suelo';

interface Alimento {
  nombre: string;
  icono: string;
  co2: number;      // kg CO2eq por kg
  agua: number;     // litros por kg
  suelo: number;    // m² por kg por año
}

const ALIMENTOS: Alimento[] = [
  { nombre: 'Ternera', icono: '🥩', co2: 60, agua: 15400, suelo: 164 },
  { nombre: 'Cordero', icono: '🐑', co2: 24, agua: 10400, suelo: 185 },
  { nombre: 'Queso', icono: '🧀', co2: 21, agua: 5060, suelo: 87 },
  { nombre: 'Cerdo', icono: '🥓', co2: 7.6, agua: 5990, suelo: 11 },
  { nombre: 'Pollo', icono: '🍗', co2: 6.9, agua: 4325, suelo: 7.1 },
  { nombre: 'Huevos', icono: '🥚', co2: 4.7, agua: 3265, suelo: 5.7 },
  { nombre: 'Arroz', icono: '🍚', co2: 4.0, agua: 2500, suelo: 2.8 },
  { nombre: 'Leche', icono: '🥛', co2: 3.2, agua: 1020, suelo: 9 },
  { nombre: 'Pescado (acuicultura)', icono: '🐟', co2: 5.1, agua: 3700, suelo: 3.7 },
  { nombre: 'Tofu', icono: '🫘', co2: 3.0, agua: 2520, suelo: 2.2 },
  { nombre: 'Legumbres', icono: '🫘', co2: 0.9, agua: 4055, suelo: 7.4 },
  { nombre: 'Pan de trigo', icono: '🍞', co2: 1.4, agua: 1608, suelo: 3.9 },
  { nombre: 'Tomates', icono: '🍅', co2: 1.4, agua: 214, suelo: 0.8 },
  { nombre: 'Patatas', icono: '🥔', co2: 0.5, agua: 287, suelo: 0.9 },
  { nombre: 'Manzanas', icono: '🍎', co2: 0.4, agua: 822, suelo: 0.5 },
  { nombre: 'Plátanos', icono: '🍌', co2: 0.7, agua: 790, suelo: 1.4 },
];

const METRICAS: { id: Metrica; nombre: string; unidad: string; color: string; icono: string }[] = [
  { id: 'co2', nombre: 'Huella de carbono', unidad: 'kg CO₂eq/kg', color: '#e74c3c', icono: '🏭' },
  { id: 'agua', nombre: 'Consumo de agua', unidad: 'litros/kg', color: '#2E86AB', icono: '💧' },
  { id: 'suelo', nombre: 'Uso de suelo', unidad: 'm²/kg·año', color: '#27ae60', icono: '🌍' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHuellaAlimentosPage() {
  const [metricaActiva, setMetricaActiva] = useState<Metrica>('co2');

  const metrica = METRICAS.find(m => m.id === metricaActiva)!;

  const alimentosOrdenados = useMemo(() => {
    return [...ALIMENTOS].sort((a, b) => b[metricaActiva] - a[metricaActiva]);
  }, [metricaActiva]);

  const maxValor = alimentosOrdenados[0]?.[metricaActiva] ?? 1;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Huella de lo que Comes</h1>
          <p className={styles.subtitle}>Compara el impacto ambiental de los alimentos — sin juzgar, solo informar</p>
        </header>

        <LegalNotice />

        {/* Selector de métrica */}
        <div className={styles.metricaNav}>
          {METRICAS.map(m => (
            <button
              key={m.id}
              type="button"
              className={`${styles.metricaBtn} ${metricaActiva === m.id ? styles.metricaActiva : ''}`}
              onClick={() => setMetricaActiva(m.id)}
              style={{ borderColor: metricaActiva === m.id ? m.color : undefined }}
              aria-pressed={metricaActiva === m.id}
            >
              <span aria-hidden="true">{m.icono}</span> {m.nombre}
            </button>
          ))}
        </div>

        <p className={styles.metricaInfo}>
          Ordenado por <strong>{metrica.nombre.toLowerCase()}</strong> ({metrica.unidad}) — de mayor a menor impacto
        </p>

        {/* Lista de alimentos */}
        <div className={styles.alimentosLista}>
          {alimentosOrdenados.map((alimento, i) => {
            const valor = alimento[metricaActiva];
            const pctBarra = (valor / maxValor) * 100;
            return (
              <div key={alimento.nombre} className={styles.alimentoItem}>
                <div className={styles.alimentoTop}>
                  <span className={styles.alimentoRank}>{i + 1}</span>
                  <span className={styles.alimentoIcono} aria-hidden="true">{alimento.icono}</span>
                  <span className={styles.alimentoNombre}>{alimento.nombre}</span>
                  <span className={styles.alimentoValor} style={{ color: metrica.color }}>
                    {formatNumber(valor, valor >= 100 ? 0 : 1)} {metrica.unidad}
                  </span>
                </div>
                <div className={styles.alimentoBarraFondo}>
                  <div
                    className={styles.alimentoBarra}
                    style={{ width: `${pctBarra}%`, backgroundColor: metrica.color }}
                    role="progressbar"
                    aria-valuenow={valor}
                    aria-label={`${alimento.nombre}: ${formatNumber(valor, 1)} ${metrica.unidad}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparaciones rápidas */}
        <div className={styles.comparaciones}>
          <h3 className={styles.compTitulo}>Datos que sorprenden</h3>
          <div className={styles.compGrid}>
            <div className={styles.compCard}>
              <span className={styles.compIcono} aria-hidden="true">🥩→🍗</span>
              <p className={styles.compTexto}>
                1 kg de ternera emite <strong>{formatNumber(ALIMENTOS[0].co2 / ALIMENTOS[4].co2, 0)}× más CO₂</strong> que 1 kg de pollo
              </p>
            </div>
            <div className={styles.compCard}>
              <span className={styles.compIcono} aria-hidden="true">💧</span>
              <p className={styles.compTexto}>
                Producir 1 kg de ternera consume <strong>{formatNumber(ALIMENTOS[0].agua, 0)} litros</strong> de agua — como {formatNumber(ALIMENTOS[0].agua / 200, 0)} duchas
              </p>
            </div>
            <div className={styles.compCard}>
              <span className={styles.compIcono} aria-hidden="true">🥔→🥩</span>
              <p className={styles.compTexto}>
                1 kg de patatas emite <strong>{formatNumber(ALIMENTOS[0].co2 / 0.5, 0)}× menos CO₂</strong> que 1 kg de ternera
              </p>
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            No se trata de eliminar alimentos — se trata de <strong>saber lo que cada elección implica</strong>.
            Sustituir una comida de ternera a la semana por pollo o legumbres tiene un impacto medible.
            Pequeños cambios, multiplicados por millones de personas, generan grandes diferencias.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Cuida tu alimentación → <a href="/calculadora-macros/">Calculadora Macros</a> · <a href="/calculadora-huella-carbono/">Huella de Carbono</a>
        </div>

        <EducationalSection
          title="Lo que tu plato dice del planeta"
          subtitle="Datos que la ciencia tiene claros"
          defaultOpen={false}
        >
          <h3>¿Por qué la ternera es tan intensiva?</h3>
          <p>
            Las vacas son rumiantes: producen metano (CH₄) al digerir, un gas 80× más potente que
            el CO₂ a corto plazo. Además, necesitan grandes extensiones de pasto (o cultivos para
            pienso), agua abundante y años de crianza antes del sacrificio. Es el alimento más
            ineficiente en conversión de recursos a calorías.
          </p>

          <h3>Las legumbres: el superalimento ambiental</h3>
          <p>
            Las legumbres (lentejas, garbanzos, judías) tienen una huella mínima y además
            <strong> fijan nitrógeno en el suelo</strong>, mejorando la tierra para futuros cultivos.
            Son la proteína más eficiente del planeta en términos de impacto ambiental por gramo de proteína.
          </p>

          <h3>No todo es CO₂</h3>
          <p>
            El agua y el suelo son recursos igual de críticos. La agricultura ocupa el 50% de la
            tierra habitable del planeta y consume el 70% del agua dulce. Elegir alimentos con
            menor huella hídrica y de suelo es tan importante como reducir el CO₂.
          </p>

          <h3>Local no siempre es mejor</h3>
          <p>
            Sorprendentemente, el transporte suele representar menos del 10% de la huella total de
            un alimento. Lo que comes importa mucho más que de dónde viene. Un aguacate importado
            tiene menor huella que carne local.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos provienen del metaanálisis de Poore &amp; Nemecek (2018),
            publicado en Science, que analizó ~38.000 granjas en 119 países. Son medias globales — la
            huella real varía según región, método de producción y estación.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-huella-alimentos')} />
        <ShareCard appName="visualizador-huella-alimentos" />
        <Footer appName="visualizador-huella-alimentos" />
    </div>
  );
}
