'use client';

import { useState, useEffect, useRef } from 'react';
import type { TooltipItem } from 'chart.js';
import styles from './VisualizadorAntibioticos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Mecanismo {
  id: string;
  icono: string;
  titulo: string;
  diana: string;
  antibioticos: string[];
  espectro: string;
  tipo: 'bactericida' | 'bacteriostático';
  descripcion: string;
  detalle: string;
  colorZona: string;
}

interface ResistenciaCard {
  icono: string;
  nombre: string;
  descripcion: string;
  ejemplo: string;
}

interface ComparativaItem {
  aspecto: string;
  bacteria: string;
  virus: string;
  iconoBacteria: string;
  iconoVirus: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MECANISMOS: Mecanismo[] = [
  {
    id: 'pared',
    icono: '🧱',
    titulo: 'Pared celular',
    diana: 'Peptidoglucano',
    antibioticos: ['Penicilinas', 'Cefalosporinas', 'Carbapenems', 'Vancomicina'],
    espectro: 'Grampositivas y Gramnegativas',
    tipo: 'bactericida',
    descripcion:
      'β-lactámicos y glucopéptidos inhiben la síntesis de peptidoglucano. Sin pared, la bacteria explota por presión osmótica.',
    detalle:
      'Las células humanas NO tienen pared celular de peptidoglucano → alta selectividad y bajo perfil de toxicidad. Las β-lactamasas (enzimas bacterianas) pueden destruir el anillo β-lactámico, mecanismo de resistencia más extendido.',
    colorZona: '#2E86AB',
  },
  {
    id: 'r30s',
    icono: '🔵',
    titulo: 'Ribosoma 30S',
    diana: 'Subunidad 30S del ribosoma 70S',
    antibioticos: ['Aminoglucósidos (gentamicina)', 'Tetraciclinas'],
    espectro: 'Amplio espectro (ambas)',
    tipo: 'bactericida',
    descripcion:
      'El ribosoma bacteriano (70S = 30S + 50S) es diferente del humano (80S) → alta selectividad. Causan errores en la traducción proteica o bloquean la entrada de ARNt.',
    detalle:
      'Los aminoglucósidos producen lecturas erróneas del ARNm → proteínas malformadas → muerte celular (bactericida). Las tetraciclinas bloquean la unión del ARNt al sitio A → detención de la síntesis (bacteriostático). Ambos requieren transporte activo al interior bacteriano.',
    colorZona: '#4A90D9',
  },
  {
    id: 'r50s',
    icono: '🔴',
    titulo: 'Ribosoma 50S',
    diana: 'Subunidad 50S del ribosoma 70S',
    antibioticos: ['Azitromicina', 'Eritromicina', 'Cloranfenicol', 'Clindamicina'],
    espectro: 'Grampositivas principalmente',
    tipo: 'bacteriostático',
    descripcion:
      'Macrólidos y cloranfenicol bloquean la translocación del ribosoma bacteriano → cesa la síntesis proteica → bacteriostático.',
    detalle:
      'Los macrólidos se unen al ARNr 23S de la subunidad 50S, impidiendo que el ribosoma avance a lo largo del ARNm. El cloranfenicol inhibe la peptidil-transferasa. Son bacteriostáticos: necesitan que el sistema inmune del paciente elimine las bacterias detenidas.',
    colorZona: '#E05A5A',
  },
  {
    id: 'adn',
    icono: '🧬',
    titulo: 'ADN / Topoisomerasas',
    diana: 'ADN girasa y topoisomerasa IV',
    antibioticos: ['Ciprofloxacino', 'Levofloxacino', 'Moxifloxacino'],
    espectro: 'Amplio espectro (gramnegativas > grampositivas)',
    tipo: 'bactericida',
    descripcion:
      'Las fluoroquinolonas inhiben las topoisomerasas bacterianas → el ADN no puede replicarse ni repararse → rotura del cromosoma → muerte celular.',
    detalle:
      'La ADN girasa y la topoisomerasa IV son esenciales para el superenrollamiento y la separación del ADN durante la replicación. Las quinolonas forman un complejo estable enzima-ADN-fármaco que bloquea todo el proceso. Alta eficacia pero riesgo de tendinopatías y prolongación del QT en altas dosis.',
    colorZona: '#7B5EA7',
  },
  {
    id: 'membrana',
    icono: '🔶',
    titulo: 'Membrana celular',
    diana: 'Membrana plasmática bacteriana',
    antibioticos: ['Colistina', 'Polimixina B'],
    espectro: 'Gramnegativas multirresistentes',
    tipo: 'bactericida',
    descripcion:
      'Las polimixinas actúan como detergentes catiónicos en la membrana de bacterias gramnegativas → desintegración de la membrana → lisis celular inmediata.',
    detalle:
      'Último recurso frente a "superbacterias" gramnegativas multirresistentes (Acinetobacter, Klebsiella BLEE, Pseudomonas). Alta toxicidad renal y nerviosa. El auge de colistina es consecuencia directa de haber agotado otras opciones terapéuticas.',
    colorZona: '#D4820A',
  },
];

const RESISTENCIAS: ResistenciaCard[] = [
  {
    icono: '🛡️',
    nombre: 'β-lactamasas',
    descripcion:
      'Enzimas que degradan el anillo β-lactámico (la parte activa de penicilinas y cefalosporinas). Las BLEE (β-lactamasas de espectro extendido) destruyen casi todos los β-lactámicos.',
    ejemplo:
      'Solución parcial: inhibidores de β-lactamasas (ácido clavulánico en Augmentine, tazobactam en Tazocin). Las bacterias han respondido evolucionando BLEE que resisten también a los inhibidores.',
  },
  {
    icono: '🚪',
    nombre: 'Bombas de expulsión',
    descripcion:
      'La bacteria usa proteínas de membrana (bombas de eflujo) para expulsar activamente el antibiótico antes de que alcance su diana intracelular. Un único gen puede conferir resistencia a múltiples familias de antibióticos.',
    ejemplo:
      'Las bombas MexAB-OprM de Pseudomonas aeruginosa expulsan fluoroquinolonas, β-lactámicos y tetraciclinas simultáneamente. Una mutación, múltiple resistencia.',
  },
  {
    icono: '🔄',
    nombre: 'Mutación del blanco',
    descripcion:
      'El sitio donde actúa el antibiótico muta y deja de ser reconocido por el fármaco. La bacteria mantiene la función pero el antibiótico ya no puede unirse.',
    ejemplo:
      'SARM (S. aureus resistente a meticilina): la proteína PBP2a tiene tan baja afinidad por los β-lactámicos que la pared celular se sigue sintetizando aunque el antibiótico esté presente.',
  },
];

const COMPARATIVA: ComparativaItem[] = [
  {
    aspecto: 'Estructura',
    bacteria: 'Célula procariota completa con metabolismo propio',
    virus: 'Material genético + cápside (sin membrana propia)',
    iconoBacteria: '🦠',
    iconoVirus: '🔬',
  },
  {
    aspecto: 'Pared celular',
    bacteria: 'Peptidoglucano (diana de β-lactámicos)',
    virus: 'Sin pared celular. Los β-lactámicos no tienen diana.',
    iconoBacteria: '🧱',
    iconoVirus: '❌',
  },
  {
    aspecto: 'Ribosomas',
    bacteria: 'Ribosomas propios (70S). Diana de macrólidos y aminoglucósidos.',
    virus: 'Usa los ribosomas del huésped (80S). Sin diana.',
    iconoBacteria: '⚙️',
    iconoVirus: '❌',
  },
  {
    aspecto: 'Metabolismo',
    bacteria: 'Síntesis proteica y replicación propias',
    virus: 'Parásito intracelular: usa toda la maquinaria del huésped',
    iconoBacteria: '🔬',
    iconoVirus: '🧬',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAntibioticos() {
  const [mecanismoActivo, setMecanismoActivo] = useState<number>(0);
  const [resistenciasAbiertas, setResistenciasAbiertas] = useState<boolean[]>([false, false, false]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstance = useRef<any>(null);

  const relatedApps = getRelatedApps('visualizador-antibioticos');

  // Gráfico bacteriostático vs bactericida
  useEffect(() => {
    let mounted = true;

    const cargarChart = async () => {
      if (!chartRef.current || !mounted) return;

      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (!chartRef.current || !mounted) return;

      const labels = ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '24h'];

      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Sin antibiótico',
              data: [100, 180, 320, 580, 1050, 1900, 3400, 6100, 11000, 19800, 35600, 115000],
              borderColor: '#E05A5A',
              backgroundColor: 'rgba(224,90,90,0.08)',
              tension: 0.4,
              pointRadius: 3,
              fill: true,
            },
            {
              label: 'Bacteriostático (ej: azitromicina)',
              data: [100, 105, 108, 110, 112, 110, 108, 100, 90, 80, 65, 40],
              borderColor: '#D4820A',
              backgroundColor: 'rgba(212,130,10,0.07)',
              tension: 0.4,
              pointRadius: 3,
              borderDash: [5, 3],
              fill: true,
            },
            {
              label: 'Bactericida (ej: amoxicilina)',
              data: [100, 75, 55, 38, 25, 15, 8, 4, 1, 0.5, 0.1, 0],
              borderColor: '#48A9A6',
              backgroundColor: 'rgba(72,169,166,0.09)',
              tension: 0.4,
              pointRadius: 3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx: TooltipItem<'line'>) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString('es-ES')} UFC/mL`,
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Tiempo (horas)' },
            },
            y: {
              type: 'logarithmic',
              title: { display: true, text: 'Carga bacteriana (UFC/mL, escala log)' },
              ticks: {
                callback: (value: string | number) =>
                  Number(value) >= 1000
                    ? `${(Number(value) / 1000).toLocaleString('es-ES')}k`
                    : String(value),
              },
            },
          },
        } as never,
      });
    };

    cargarChart();

    return () => {
      mounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  const toggleResistencia = (index: number) => {
    setResistenciasAbiertas((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const mecanismo = MECANISMOS[mecanismoActivo];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FARMACOLOGÍA</span>
          <h1 className={styles.heroTitle}>Antibióticos: Cómo Matan Bacterias (y Por Qué Fallan)</h1>
          <p className={styles.heroSubtitle}>5 mecanismos de acción y la crisis de la resistencia antibiótica</p>
          <p className={styles.heroDesc}>
            Los antibióticos atacan estructuras que las bacterias tienen y nosotros no: pared celular, ribosomas
            bacterianos, ADN girasas. Pero las bacterias evolucionan. La resistencia antimicrobiana se asoció a{' '}
            <strong>~4,95 millones de muertes en 2019</strong> (Murray et al., Lancet 2022), de las cuales 1,27 M
            atribuibles directamente. Las proyecciones a 2050 (hasta 10 millones, informe O&apos;Neill 2016) varían según el modelo.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" />

      {/* ── SECCIÓN 1: 5 mecanismos de acción ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Los 5 Mecanismos de Acción</h2>
        <p className={styles.sectionDesc}>
          Selecciona cada mecanismo para ver qué estructura bacteriana atacan y qué antibióticos lo usan.
        </p>

        {/* Nav de mecanismos */}
        <nav className={styles.mecanismosNav} aria-label="Seleccionar mecanismo de acción">
          {MECANISMOS.map((m, i) => (
            <button
              key={m.id}
              className={`${styles.mecanismoBtn} ${mecanismoActivo === i ? styles.mecanismoBtnActivo : ''}`}
              onClick={() => setMecanismoActivo(i)}
              aria-pressed={mecanismoActivo === i}
              aria-label={`Ver mecanismo: ${m.titulo}`}
            >
              <span aria-hidden="true">{m.icono}</span>
              <span>{m.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Panel del mecanismo activo */}
        <div className={styles.mecanismoPanel} aria-live="polite">
          <div className={styles.bacteriaVista} style={{ '--zona-color': mecanismo.colorZona } as React.CSSProperties}>
            {/* Representación esquemática de la bacteria */}
            <div className={styles.bacteriaCuerpo}>
              <div
                className={`${styles.bacteriaZona} ${
                  mecanismo.id === 'pared' ? styles.zonaActiva : ''
                }`}
                title="Pared celular (peptidoglucano)"
              >
                Pared celular
              </div>
              <div className={styles.bacteriaInterior}>
                <div
                  className={`${styles.bacteriaZona} ${
                    mecanismo.id === 'membrana' ? styles.zonaActiva : ''
                  }`}
                  title="Membrana plasmática"
                >
                  Membrana
                </div>
                <div className={styles.bacteriaCore}>
                  <div
                    className={`${styles.bacteriaZona} ${
                      mecanismo.id === 'r30s' || mecanismo.id === 'r50s' ? styles.zonaActiva : ''
                    }`}
                    title="Ribosomas bacterianos (70S)"
                  >
                    {mecanismo.id === 'r30s' ? 'Ribosoma 30S ←' : mecanismo.id === 'r50s' ? 'Ribosoma 50S ←' : 'Ribosomas 70S'}
                  </div>
                  <div
                    className={`${styles.bacteriaZona} ${
                      mecanismo.id === 'adn' ? styles.zonaActiva : ''
                    }`}
                    title="ADN cromosómico y topoisomerasas"
                  >
                    ADN / Topoisomerasas
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.mecanismoPanelInfo}>
            <div className={styles.mecanismoPanelHeader}>
              <span className={styles.mecanismoPanelIcono} aria-hidden="true">{mecanismo.icono}</span>
              <div>
                <h3 className={styles.mecanismoPanelTitulo}>{mecanismo.titulo}</h3>
                <p className={styles.mecanismoPanelDiana}>Diana: <strong>{mecanismo.diana}</strong></p>
              </div>
            </div>

            <p className={styles.mecanismoPanelDesc}>{mecanismo.descripcion}</p>
            <p className={styles.mecanismoPanelDetalle}>{mecanismo.detalle}</p>

            <div className={styles.mecanismoPanelMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Antibióticos ejemplo</span>
                <span className={styles.metaValor}>{mecanismo.antibioticos.join(', ')}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Espectro</span>
                <span className={styles.metaValor}>{mecanismo.espectro}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Efecto</span>
                <span
                  className={`${styles.metaValor} ${
                    mecanismo.tipo === 'bactericida' ? styles.metaBactericida : styles.metaBacteriostático
                  }`}
                >
                  {mecanismo.tipo === 'bactericida' ? '☠️ Bactericida' : '⏸️ Bacteriostático'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 2: Bacteriostático vs Bactericida ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Bacteriostático vs Bactericida</h2>
        <p className={styles.sectionDesc}>
          Curvas de crecimiento bacteriano en presencia de distintos tipos de antibiótico (escala logarítmica).
        </p>

        <div className={styles.curvasChart}>
          <canvas ref={chartRef} />
        </div>

        <div className={styles.insightBox}>
          <p>
            <strong>Clave:</strong> En ambos casos, el sistema inmune del paciente hace el trabajo final. Por eso
            los antibióticos son mucho menos efectivos en pacientes{' '}
            <strong>inmunocomprometidos</strong> (trasplantados, quimioterapia, VIH avanzado) — el bacteriostático
            detiene el crecimiento pero sin sistema inmune no hay eliminación.
          </p>
        </div>

        <div className={styles.resistenciaGrid} style={{ marginTop: '1.5rem' }}>
          <div className={styles.resistenciaCard} style={{ borderTop: '4px solid #E05A5A' }}>
            <h4>☠️ Bactericida</h4>
            <p>Mata activamente las bacterias. No necesita sistema inmune. Preferible en infecciones graves, endocarditis, meningitis.</p>
            <p className={styles.resistenciaEjemplos}>β-lactámicos, fluoroquinolonas, aminoglucósidos, polimixinas</p>
          </div>
          <div className={styles.resistenciaCard} style={{ borderTop: '4px solid #D4820A' }}>
            <h4>⏸️ Bacteriostático</h4>
            <p>Detiene el crecimiento. El sistema inmune del paciente elimina las bacterias. Suficiente en infecciones leves-moderadas en pacientes inmunocompetentes.</p>
            <p className={styles.resistenciaEjemplos}>Macrólidos, tetraciclinas, cloranfenicol, linezolid</p>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: La crisis de la resistencia ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>La Crisis de la Resistencia Antibiótica</h2>
        <p className={styles.sectionDesc}>
          Las bacterias evolucionan. Tres grandes mecanismos de resistencia amenaza la era antibiótica.
        </p>

        <div className={styles.resistenciaExpandGrid}>
          {RESISTENCIAS.map((r, i) => (
            <div key={r.nombre} className={styles.resistenciaExpandCard}>
              <button
                className={styles.resistenciaCardToggle}
                onClick={() => toggleResistencia(i)}
                aria-expanded={resistenciasAbiertas[i]}
                aria-label={`${resistenciasAbiertas[i] ? 'Ocultar' : 'Ver'} detalles de ${r.nombre}`}
              >
                <span className={styles.resistenciaCardIcono} aria-hidden="true">{r.icono}</span>
                <span className={styles.resistenciaCardNombre}>{r.nombre}</span>
                <span className={styles.resistenciaCardChevron} aria-hidden="true">
                  {resistenciasAbiertas[i] ? '▲' : '▼'}
                </span>
              </button>
              {resistenciasAbiertas[i] && (
                <div className={styles.resistenciaCardBody}>
                  <p>{r.descripcion}</p>
                  <p className={styles.resistenciaEjemplo}><strong>Detalle:</strong> {r.ejemplo}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cifras OMS */}
        <div className={styles.cifrasGrid}>
          <div className={styles.cifraBox}>
            <span className={styles.cifraNumero}>~4,95 M</span>
            <span className={styles.cifraEtiqueta}>muertes asociadas a resistencia antimicrobiana en 2019 (Murray et al., Lancet 2022); 1,27 M atribuibles directamente</span>
          </div>
          <div className={styles.cifraBox}>
            <span className={styles.cifraNumero}>Hasta 10 M</span>
            <span className={styles.cifraEtiqueta}>muertes proyectadas en 2050 según el informe O&apos;Neill (2016); las proyecciones varían según el modelo</span>
          </div>
          <div className={styles.cifraBox}>
            <span className={styles.cifraNumero}>80%</span>
            <span className={styles.cifraEtiqueta}>~70% del uso mundial total de antimicrobianos se destina a animales (FAO/OMS); en EE. UU. la cifra ha llegado al 80%</span>
          </div>
          <div className={styles.cifraBox}>
            <span className={styles.cifraNumero}>50%</span>
            <span className={styles.cifraEtiqueta}>Hasta el 50% de las prescripciones ambulatorias podrían ser innecesarias o subóptimas (CDC, 2016; estimaciones similares de la OMS para varios países)</span>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 4: Por qué no funcionan en virus ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Por Qué los Antibióticos No Funcionan en Virus</h2>
        <p className={styles.sectionDesc}>
          Los virus no tienen las estructuras que atacan los antibióticos. Usarlos ante infecciones víricas no tiene efecto terapéutico pero sí favorece la resistencia.
        </p>

        <div className={styles.comparativaGrid}>
          {COMPARATIVA.map((item) => (
            <div key={item.aspecto} className={styles.comparativaCard}>
              <h4 className={styles.comparativaAspecto}>{item.aspecto}</h4>
              <div className={styles.comparativaFila}>
                <div className={styles.comparativaColumna}>
                  <span className={styles.comparativaBadge} style={{ background: 'rgba(46,134,171,0.12)', color: '#2E86AB' }}>
                    {item.iconoBacteria} Bacteria
                  </span>
                  <p>{item.bacteria}</p>
                </div>
                <div className={styles.comparativaColumna}>
                  <span className={styles.comparativaBadge} style={{ background: 'rgba(224,90,90,0.1)', color: '#c0392b' }}>
                    {item.iconoVirus} Virus
                  </span>
                  <p>{item.virus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.insightBox} style={{ marginTop: '1.5rem' }}>
          <p>
            <strong>Mensaje clave:</strong> Un resfriado o una gripe son infecciones víricas. Tomar antibióticos
            no acorta la duración, no reduce los síntomas, pero sí elimina bacterias comensales beneficiosas y
            favorece la aparición de cepas resistentes en tu microbioma.
          </p>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Profundiza en la resistencia antibiótica"
        subtitle="Mecanismos moleculares, crisis global y soluciones emergentes"
      >
        <div className={styles.educativo}>
          <h3>Cómo se transmite la resistencia entre bacterias</h3>
          <p>
            Las bacterias comparten genes de resistencia mediante <strong>transferencia horizontal de genes</strong>:
            plásmidos (pequeños círculos de ADN) que pasan de una bacteria a otra, incluso entre especies distintas.
            Una bacteria que desarrolla resistencia puede &ldquo;enseñarle&rdquo; a miles de otras en horas. Por eso
            la resistencia se propaga tan rápido y cruzando barreras de especie.
          </p>

          <h3>Bacterias ESKAPE: los 6 patógenos más peligrosos</h3>
          <p>
            La OMS designa a seis géneros como prioritarios por su multirresistencia:
          </p>
          <ul>
            <li><strong>E</strong>nterococcus faecium — resistente a vancomicina (VRE)</li>
            <li><strong>S</strong>taphylococcus aureus — resistente a meticilina (SARM)</li>
            <li><strong>K</strong>lebsiella pneumoniae — BLEE y carbapenemasas (KPC)</li>
            <li><strong>A</strong>cinetobacter baumannii — último recurso: solo colistina</li>
            <li><strong>P</strong>seudomonas aeruginosa — bombas de eflujo múltiples</li>
            <li><strong>E</strong>nterobacter spp. — AmpC β-lactamasas inducibles</li>
          </ul>

          <h3>Bacteriófagos: virus que matan bacterias</h3>
          <p>
            Los fagos son virus que infectan exclusivamente bacterias. La <strong>terapia fágica</strong> tiene
            resultados prometedores en pacientes con infecciones resistentes donde todos los antibióticos han
            fallado. Ya existen casos documentados de éxito en Europa y EE.UU. con infecciones por SARM y
            Acinetobacter. El desafío: los fagos son altamente específicos de cepa → necesitas un fago para cada
            bacteria concreta.
          </p>

          <h3>El pipeline vacío: ningún nuevo mecanismo desde los años 80</h3>
          <p>
            El último antibiótico con un <strong>mecanismo de acción completamente nuevo</strong> fue la
            daptomicina (2003, pero descubierta en los 80s). Todos los antibióticos aprobados en las últimas
            décadas son variaciones de mecanismos conocidos. El sector farmacéutico no invierte en antibióticos:
            un tratamiento de 7 días tiene mucho menos retorno que un fármaco crónico. La OMS ha propuesto
            modelos de financiación pública desvinculados del volumen de ventas.
          </p>

          <div className={styles.warningBox}>
            Este visualizador explica mecanismos de acción con fines educativos. El uso de antibióticos
            requiere prescripción médica. <strong>Completar siempre el tratamiento prescrito</strong> para no
            favorecer la aparición de resistencias. Nunca guardar antibióticos sobrantes para &ldquo;otra vez&rdquo;.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-antibioticos" />
      <Footer appName="visualizador-antibioticos" />
    </div>
  );
}
