'use client';
// @disclaimer: NOT APPLICABLE — usar DisclaimerCard variant="financial" severity="medium" collapsible={true}

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import ShareCard from '@/components/ShareCard';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorTiposInteresBce.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos e interfaces
// ─────────────────────────────────────────────────────────────────────────────

interface CanalTransmision {
  id: string;
  titulo: string;
  icono: string;
  descripcionCorta: string;
  explicacion: string;
  ejemploNumerico: string;
  impactoAlto: string; // cuando tipos son altos
  impactoBajo: string; // cuando tipos son bajos
}

interface CicloHistorico {
  periodo: string;
  contexto: string;
  decisionBce: string;
  euribor: string;
  hipotecas: string;
  colorClase: 'expansion' | 'crisis' | 'zeroBound' | 'subida';
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos estáticos
// ─────────────────────────────────────────────────────────────────────────────

const CANALES_TRANSMISION: CanalTransmision[] = [
  {
    id: 'hipotecas',
    titulo: 'Hipotecas Variables',
    icono: '🏠',
    descripcionCorta: 'El Euríbor sube → cuota mensual sube',
    explicacion:
      'Cuando el BCE sube tipos, los bancos comerciales suben el Euríbor (tipo interbancario de referencia). Las hipotecas a tipo variable están indexadas al Euríbor, por lo que la cuota mensual aumenta en la siguiente revisión anual.',
    ejemploNumerico:
      'Hipoteca de 200.000 € a 25 años: con Euríbor al 0% la cuota es ~850 €/mes; con Euríbor al 4% sube a ~1.100 €/mes. Diferencia: +250 €/mes o +3.000 €/año.',
    impactoAlto: 'Cuotas más altas, menor capacidad de consumo de los hipotecados',
    impactoBajo: 'Cuotas más baratas, más dinero disponible para gastar',
  },
  {
    id: 'credito',
    titulo: 'Crédito Empresarial',
    icono: '🏭',
    descripcionCorta: 'Préstamos más caros → menos inversión',
    explicacion:
      'Las empresas financian expansiones, maquinaria y proyectos con crédito bancario. Cuando los tipos suben, el coste de financiarse aumenta. Solo los proyectos con rentabilidad superior al coste del crédito siguen adelante, lo que reduce la inversión total.',
    ejemploNumerico:
      'Un préstamo empresarial de 500.000 € a 5 años: al 2% cuesta ~26.000 €/año en intereses; al 6% cuesta ~80.000 €/año. Un proyecto que renta un 4% deja de ser viable cuando el crédito cuesta un 5%.',
    impactoAlto: 'Menor inversión empresarial, menos contratación, menor crecimiento del PIB',
    impactoBajo: 'Más inversión, más empleo, mayor crecimiento económico',
  },
  {
    id: 'bolsa',
    titulo: 'Bolsa y Valoraciones',
    icono: '📈',
    descripcionCorta: 'Descuento de flujos → valoraciones bajan',
    explicacion:
      'El valor de una empresa en bolsa es el descuento de sus beneficios futuros al tipo de interés actual. Cuando los tipos suben, la tasa de descuento aumenta y los flujos futuros valen menos hoy. Además, la renta fija (bonos, depósitos) compite mejor con la bolsa.',
    ejemploNumerico:
      'Una empresa que genera 10.000 €/año indefinidamente vale 500.000 € con una tasa del 2% (modelo de descuento); con una tasa del 5% su valor cae a 200.000 €. Una subida de tipos puede reducir valoraciones un 30-60% en sectores de crecimiento.',
    impactoAlto: 'Valoraciones bursátiles a la baja, rotación hacia renta fija',
    impactoBajo: 'Bolsas al alza, especialmente sectores de crecimiento (tecnología, energía)',
  },
  {
    id: 'ahorro',
    titulo: 'Ahorro y Renta Fija',
    icono: '🏦',
    descripcionCorta: 'Depósitos y letras más rentables',
    explicacion:
      'El lado positivo de subir tipos: los ahorradores obtienen más rentabilidad en depósitos bancarios, cuentas remuneradas, Letras del Tesoro y bonos. El ahorro conservador recupera atractivo frente a activos de más riesgo.',
    ejemploNumerico:
      'Con tipos al 0%: 10.000 € en un depósito generan 0 € al año. Con tipos al 4%: los mismos 10.000 € pueden generar 300-400 €/año en Letras del Tesoro a 12 meses o cuentas remuneradas de banca online.',
    impactoAlto: 'Ahorradores beneficiados, renta fija competitiva, menos apetito por riesgo',
    impactoBajo: 'Ahorradores penalizados (tipos 0% o negativos), incentivo a invertir en bolsa',
  },
];

const CICLOS_HISTORICOS: CicloHistorico[] = [
  {
    periodo: '2008–2011',
    contexto: 'Crisis financiera global. Lehman Brothers colapsa. Recesión económica profunda en Europa.',
    decisionBce: 'Bajada agresiva: del 4,25% al 1% entre oct. 2008 y may. 2009 para estimular la economía.',
    euribor: 'Cayó del 5,4% (oct. 2008) al 1,2% (oct. 2010)',
    hipotecas: 'Alivio significativo para hipotecados variables. Las cuotas bajaron cientos de euros al mes.',
    colorClase: 'crisis',
  },
  {
    periodo: '2011–2014',
    contexto: 'Crisis de deuda soberana europea. España, Italia, Grecia en el foco. Prima de riesgo histórica.',
    decisionBce: 'Subida al 1,5% en abril-julio 2011, considerada en retrospectiva por gran parte de los economistas (incluido el propio BCE en revisiones posteriores) como prematura ante una recuperación frágil. Corrección rápida: vuelta al 0,25% en nov. 2013.',
    euribor: 'Subió brevemente al 2,1% en 2011, luego cayó al 0,5% en 2014',
    hipotecas: 'Volatilidad: cuotas subieron con la subida de 2011, luego bajaron gradualmente desde 2012.',
    colorClase: 'crisis',
  },
  {
    periodo: '2014–2022',
    contexto: 'Recuperación lenta, baja inflación (deflación puntual). El BCE lucha contra el estancamiento con tipos cero y compras de activos (QE).',
    decisionBce: 'Tipos en el 0% (desde 2016). Tipos de depósito negativos (–0,5%). QE: compra masiva de deuda pública.',
    euribor: 'En negativo desde 2015 hasta 2021 (llegó al –0,5%). Mínimos históricos absolutos.',
    hipotecas: 'Las hipotecas variables llegaron a tener cuotas mínimas históricas. Paradoja: el Euríbor negativo no reducía la cuota más (suelo en 0%).',
    colorClase: 'zeroBound',
  },
  {
    periodo: '2022–2024',
    contexto: 'Inflación disparada por pandemia + guerra Ucrania. IPC europeo llegó al 10,6% en oct. 2022. El BCE actúa.',
    decisionBce: 'La subida más rápida de la historia del BCE: de 0% a 4,5% en 14 meses (jul. 2022 – sep. 2023). A partir de jun. 2024 inicio de bajadas graduales.',
    euribor: 'Pasó del –0,5% (dic. 2021) al 4,16% (oct. 2023). Hipotecados variables: impacto brutal.',
    hipotecas: 'Una hipoteca media de 150.000 € a 25 años subió su cuota ~400 €/mes respecto a los mínimos de 2021.',
    colorClase: 'subida',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function clasificarPolitica(tipo: number): { etiqueta: string; clase: string; descripcion: string } {
  if (tipo <= 1) {
    return {
      etiqueta: 'Política muy expansiva',
      clase: styles.politicaExpansiva,
      descripcion:
        'El BCE estimula la economía activamente. Crédito barato, incentivo al gasto e inversión. Riesgo: puede generar burbujas o inflación si se mantiene demasiado tiempo.',
    };
  } else if (tipo <= 2.5) {
    return {
      etiqueta: 'Política expansiva',
      clase: styles.politicaExpansiva,
      descripcion:
        'El BCE apoya el crecimiento con tipos por debajo de la "tasa neutral" estimada (~2–2,5% para la zona euro). El crédito sigue siendo accesible.',
    };
  } else if (tipo <= 3.5) {
    return {
      etiqueta: 'Política neutral',
      clase: styles.politicaNeutral,
      descripcion:
        'El BCE está en zona neutra: ni estimula ni frena la economía. Es el objetivo a largo plazo cuando la inflación está controlada.',
    };
  } else if (tipo <= 4.5) {
    return {
      etiqueta: 'Política restrictiva',
      clase: styles.politicaRestrictiva,
      descripcion:
        'El BCE frena la economía para controlar la inflación. El crédito se encarece, el consumo cae. Nivel típico de lucha antiinflacionaria, como en 2022-2023.',
    };
  } else {
    return {
      etiqueta: 'Política muy restrictiva',
      clase: styles.politicaRestrictiva,
      descripcion:
        'Nivel históricamente alto en la zona euro. El BCE frena con fuerza la economía para doblegar una inflación muy elevada. Riesgo de recesión si se mantiene demasiado.',
    };
  }
}

function contextoHistorico(tipo: number): string {
  if (tipo === 0) return 'Mínimos históricos absolutos (2016-2022). Tipos de depósito llegaron a ser negativos.';
  if (tipo <= 0.5) return 'Nivel de emergencia económica. Similar al BCE en 2020-2021 (pandemia).';
  if (tipo <= 1) return 'Política ultra-expansiva. Similar al BCE en 2013-2015 (recuperación post-crisis).';
  if (tipo <= 2) return 'Política expansiva. Nivel habitual en períodos de bajo crecimiento con inflación controlada.';
  if (tipo <= 3) return 'Zona neutral. Nivel objetivo del BCE cuando la inflación ronda el 2%.';
  if (tipo <= 4) return 'Política restrictiva activa. Similar al BCE en 2023 para combatir la inflación.';
  if (tipo <= 4.5) return 'Máximo del ciclo 2022-2023. El BCE alcanzó el 4,5% en septiembre de 2023.';
  return 'Por encima del máximo del BCE. Nivel teórico — no se ha alcanzado en la historia del euro.';
}

function euriborEstimado(tipo: number): number {
  // El Euríbor 12m suele estar ~0,1-0,3% por encima del tipo de refinanciación
  return Math.max(0, tipo + 0.15);
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function VisualizadorTiposInteresBce() {
  const [tipoBce, setTipoBce] = useState<number>(4.0);
  const [canalSeleccionado, setCanalSeleccionado] = useState<string | null>(null);

  const politica = clasificarPolitica(tipoBce);
  const contexto = contextoHistorico(tipoBce);
  const euribor = euriborEstimado(tipoBce);
  const canalActivo = CANALES_TRANSMISION.find((c) => c.id === canalSeleccionado);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}><span aria-hidden="true">🏛️</span> Banco Central Europeo</div>
          <h1 className={styles.heroTitle}>Tipos de Interés (Tasas de Interés) del BCE</h1>
          <p className={styles.heroSubtitle}>
            Cómo una decisión sobre los tipos de interés (tasas de interés) en Fráncfort se transmite a tu hipoteca, tu crédito, tu bolsa y tu cuenta de ahorro
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ── Sección 1: Panel de control del BCE ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>01</span>
          <div>
            <h2 className={styles.sectionTitle}>El Panel de Control del BCE</h2>
            <p className={styles.sectionSubtitle}>Mueve el slider y observa cómo cambia la política monetaria</p>
          </div>
        </div>

        <div className={styles.sliderCard}>
          <div className={styles.sliderLabelRow}>
            <span className={styles.sliderLabel}>Tipo de refinanciación BCE</span>
            <span className={styles.sliderValue}>{tipoBce.toFixed(2)}%</span>
          </div>

          <input
            type="range"
            min={0}
            max={5}
            step={0.25}
            value={tipoBce}
            onChange={(e) => setTipoBce(parseFloat(e.target.value))}
            className={styles.slider}
            style={{ '--val': `${(tipoBce / 5) * 100}%` } as React.CSSProperties}
            aria-label="Tipo de interés del BCE"
          />

          <div className={styles.sliderTicks}>
            <span>0%</span>
            <span>1%</span>
            <span>2%</span>
            <span>3%</span>
            <span>4%</span>
            <span>5%</span>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardLabel}>Tipo de refinanciación</div>
            <div className={styles.infoCardValue}>{tipoBce.toFixed(2)}%</div>
            <div className={styles.infoCardNote}>Principal instrumento del BCE</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardLabel}>Tipo de depósito</div>
            <div className={styles.infoCardValue}>{Math.max(0, tipoBce - 0.5).toFixed(2)}%</div>
            <div className={styles.infoCardNote}>Lo que cobra el BCE por guardar dinero de bancos</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardLabel}>Euríbor 12m estimado</div>
            <div className={styles.infoCardValue}>{euribor.toFixed(2)}%</div>
            <div className={styles.infoCardNote}>Referencia para hipotecas variables</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardLabel}>Préstamo marginal</div>
            <div className={styles.infoCardValue}>{(tipoBce + 0.25).toFixed(2)}%</div>
            <div className={styles.infoCardNote}>Crédito de emergencia a bancos</div>
          </div>
        </div>

        <div className={`${styles.politicaBadge} ${politica.clase}`}>
          <div className={styles.politicaEtiqueta}>{politica.etiqueta}</div>
          <p className={styles.politicaDesc}>{politica.descripcion}</p>
          <p className={styles.contextoHistorico}>{contexto}</p>
        </div>

        <div className={styles.comparativaRow}>
          <div className={styles.comparativaItem}>
            <span className={styles.comparativaFlag}>🇪🇺</span>
            <div>
              <div className={styles.comparativaLabel}>BCE (zona euro)</div>
              <div className={styles.comparativaValor}>{tipoBce.toFixed(2)}%</div>
            </div>
          </div>
          <div className={styles.comparativaItem}>
            <span className={styles.comparativaFlag}>🇺🇸</span>
            <div>
              <div className={styles.comparativaLabel}>Fed (EE.UU.) — referencia</div>
              <div className={styles.comparativaValor}>4,25–4,50%</div>
            </div>
          </div>
          <div className={styles.comparativaItem}>
            <span className={styles.comparativaFlag}>🇬🇧</span>
            <div>
              <div className={styles.comparativaLabel}>Banco de Inglaterra</div>
              <div className={styles.comparativaValor}>4,25%</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 2: Cadena de transmisión ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>02</span>
          <div>
            <h2 className={styles.sectionTitle}>La Cadena de Transmisión Monetaria</h2>
            <p className={styles.sectionSubtitle}>Haz clic en cada canal para ver el detalle y ejemplos numéricos</p>
          </div>
        </div>

        {/* Diagrama de flujo */}
        <div className={styles.flujoContainer}>
          <div className={styles.flujoNodoBce}>
            <div className={styles.flujoNodoIcono}>🏛️</div>
            <div className={styles.flujoNodoTitulo}>BCE</div>
            <div className={styles.flujoNodoSubtitulo}>
              Fija tipos al {tipoBce.toFixed(2)}%
            </div>
          </div>

          <div className={styles.flujoFlecha}>
            <span aria-hidden="true">↓</span>
            <span className={styles.flujoFlechaLabel}>comunica tipos a</span>
          </div>

          <div className={styles.flujoNodoBancos}>
            <div className={styles.flujoNodoIcono}>🏦</div>
            <div className={styles.flujoNodoTitulo}>Bancos Comerciales</div>
            <div className={styles.flujoNodoSubtitulo}>
              Adaptan Euríbor, tipos de préstamos y depósitos
            </div>
          </div>

          <div className={styles.flujoFlecha}>
            <span aria-hidden="true">↓</span>
            <span className={styles.flujoFlechaLabel}>afecta a través de 4 canales</span>
          </div>

          <div className={styles.canalesGrid}>
            {CANALES_TRANSMISION.map((canal) => (
              <button
                key={canal.id}
                type="button"
                className={`${styles.canalBtn} ${canalSeleccionado === canal.id ? styles.canalBtnActivo : ''}`}
                onClick={() => setCanalSeleccionado(canalSeleccionado === canal.id ? null : canal.id)}
                aria-expanded={canalSeleccionado === canal.id}
                aria-controls={`canal-detalle-${canal.id}`}
              >
                <span className={styles.canalIcono} aria-hidden="true">{canal.icono}</span>
                <span className={styles.canalTitulo}>{canal.titulo}</span>
                <span className={styles.canalDesc}>{canal.descripcionCorta}</span>
                <span className={styles.canalChevron} aria-hidden="true">
                  {canalSeleccionado === canal.id ? '▲' : '▼'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle del canal seleccionado */}
        {canalActivo && (
          <div
            id={`canal-detalle-${canalActivo.id}`}
            className={styles.canalDetalle}
            role="region"
            aria-label={`Detalle: ${canalActivo.titulo}`}
          >
            <h3 className={styles.canalDetalleTitulo}>
              <span aria-hidden="true">{canalActivo.icono}</span> {canalActivo.titulo}
            </h3>
            <p className={styles.canalDetalleTexto}>{canalActivo.explicacion}</p>
            <div className={styles.ejemploBox}>
              <div className={styles.ejemploLabel}><span aria-hidden="true">📊</span> Ejemplo numérico</div>
              <p className={styles.ejemploTexto}>{canalActivo.ejemploNumerico}</p>
            </div>
            <div className={styles.impactoRow}>
              <div className={styles.impactoAlto}>
                <span className={styles.impactoIcono} aria-hidden="true">📈</span>
                <div>
                  <div className={styles.impactoLabel}>Tipos altos</div>
                  <div className={styles.impactoTexto}>{canalActivo.impactoAlto}</div>
                </div>
              </div>
              <div className={styles.impactoBajo}>
                <span className={styles.impactoIcono} aria-hidden="true">📉</span>
                <div>
                  <div className={styles.impactoLabel}>Tipos bajos</div>
                  <div className={styles.impactoTexto}>{canalActivo.impactoBajo}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Sección 3: Ganadores y perdedores ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>03</span>
          <div>
            <h2 className={styles.sectionTitle}>Ganadores y Perdedores según el Ciclo</h2>
            <p className={styles.sectionSubtitle}>
              La política monetaria no es neutral: redistribuye riqueza entre distintos perfiles
            </p>
          </div>
        </div>

        <div className={styles.gpGrid}>
          {/* Tipos ALTOS */}
          <div className={styles.gpColumna}>
            <div className={styles.gpColumnaHeader}>
              <span aria-hidden="true">📈</span>
              <h3>Tipos Altos ({'>'}3,5%)</h3>
            </div>

            <div className={styles.gpSubheader}>
              <span className={styles.gpGanaLabel}><span aria-hidden="true">✅</span> Ganan</span>
            </div>
            <ul className={styles.gpLista}>
              <li className={styles.gpGana}>
                <span aria-hidden="true">💰</span>
                <div>
                  <strong>Ahorradores conservadores</strong>
                  <p>Depósitos y Letras del Tesoro ofrecen rentabilidad real positiva por primera vez en años</p>
                </div>
              </li>
              <li className={styles.gpGana}>
                <span aria-hidden="true">👴</span>
                <div>
                  <strong>Pensionistas con renta fija</strong>
                  <p>Sus ahorros acumulados generan intereses. Los bonos del Estado se revalorizan a largo plazo</p>
                </div>
              </li>
              <li className={styles.gpGana}>
                <span aria-hidden="true">🏦</span>
                <div>
                  <strong>Banca tradicional</strong>
                  <p>Mayor margen de intermediación: presta más caro de lo que paga en depósitos</p>
                </div>
              </li>
              <li className={styles.gpGana}>
                <span aria-hidden="true">💱</span>
                <div>
                  <strong>Exportadores (si el euro se aprecia)</strong>
                  <p>Los tipos altos atraen capital extranjero, fortaleciendo el euro. Beneficia a importadores</p>
                </div>
              </li>
            </ul>

            <div className={styles.gpSubheader}>
              <span className={styles.gpPierdeLabel}><span aria-hidden="true">❌</span> Pierden</span>
            </div>
            <ul className={styles.gpLista}>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">🏠</span>
                <div>
                  <strong>Hipotecados a tipo variable</strong>
                  <p>Su cuota sube automáticamente en la revisión anual. Mayor esfuerzo financiero mensual</p>
                </div>
              </li>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">🏭</span>
                <div>
                  <strong>Empresas muy endeudadas</strong>
                  <p>Su deuda corporativa se encarece. Menor capacidad de inversión y contratación</p>
                </div>
              </li>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">🚀</span>
                <div>
                  <strong>Startups y tecnología</strong>
                  <p>Su valoración cae (descuento de flujos futuros) y el capital riesgo es más caro</p>
                </div>
              </li>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">🌍</span>
                <div>
                  <strong>Exportadores (euro fuerte)</strong>
                  <p>Sus productos se encarecen en mercados extranjeros, perdiendo competitividad</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Tipos BAJOS */}
          <div className={styles.gpColumna}>
            <div className={`${styles.gpColumnaHeader} ${styles.gpColumnaHeaderBajo}`}>
              <span aria-hidden="true">📉</span>
              <h3>Tipos Bajos ({'<'}1,5%)</h3>
            </div>

            <div className={styles.gpSubheader}>
              <span className={styles.gpGanaLabel}><span aria-hidden="true">✅</span> Ganan</span>
            </div>
            <ul className={styles.gpLista}>
              <li className={styles.gpGana}>
                <span aria-hidden="true">🏠</span>
                <div>
                  <strong>Hipotecados a tipo variable</strong>
                  <p>Cuotas mínimas históricas. El Euríbor llegó al –0,5%, reduciendo drásticamente las cuotas</p>
                </div>
              </li>
              <li className={styles.gpGana}>
                <span aria-hidden="true">🏭</span>
                <div>
                  <strong>Empresas que invierten</strong>
                  <p>Financiación barata para expansión, I+D y contratación. Mayor crecimiento económico</p>
                </div>
              </li>
              <li className={styles.gpGana}>
                <span aria-hidden="true">🚀</span>
                <div>
                  <strong>Startups y growth stocks</strong>
                  <p>Valoraciones altas, capital riesgo abundante y barato. Período 2010-2021 fue el ideal</p>
                </div>
              </li>
              <li className={styles.gpGana}>
                <span aria-hidden="true">🌍</span>
                <div>
                  <strong>Exportadores (euro débil)</strong>
                  <p>Sus productos son más competitivos en precio en mercados internacionales</p>
                </div>
              </li>
            </ul>

            <div className={styles.gpSubheader}>
              <span className={styles.gpPierdeLabel}><span aria-hidden="true">❌</span> Pierden</span>
            </div>
            <ul className={styles.gpLista}>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">💰</span>
                <div>
                  <strong>Ahorradores conservadores</strong>
                  <p>Depósitos al 0% (o negativo). La inflación erosiona el poder adquisitivo de los ahorros</p>
                </div>
              </li>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">👴</span>
                <div>
                  <strong>Pensionistas y rentistas</strong>
                  <p>Sin rendimiento del ahorro, deben asumir más riesgo (bolsa) para obtener rentabilidad</p>
                </div>
              </li>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">🏦</span>
                <div>
                  <strong>Banca tradicional</strong>
                  <p>Margen de intermediación comprimido. Tipos negativos significaron pagar al BCE por guardar reservas</p>
                </div>
              </li>
              <li className={styles.gpPierde}>
                <span aria-hidden="true">📊</span>
                <div>
                  <strong>Renta fija existente</strong>
                  <p>Los bonos emitidos previamente a tipos más altos pierden valor de mercado cuando los tipos bajan</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Sección 4: Histórico de ciclos ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>04</span>
          <div>
            <h2 className={styles.sectionTitle}>Los Grandes Ciclos del BCE</h2>
            <p className={styles.sectionSubtitle}>
              Cada crisis tuvo su respuesta. Cada subida de tipos, sus consecuencias
            </p>
          </div>
        </div>

        <div className={styles.ciclosList}>
          {CICLOS_HISTORICOS.map((ciclo) => (
            <div key={ciclo.periodo} className={`${styles.cicloCard} ${styles[ciclo.colorClase]}`}>
              <div className={styles.cicloHeader}>
                <span className={styles.cicloPeriodo}>{ciclo.periodo}</span>
              </div>
              <div className={styles.cicloBody}>
                <div className={styles.cicloItem}>
                  <span className={styles.cicloItemLabel}><span aria-hidden="true">📌</span> Contexto</span>
                  <p>{ciclo.contexto}</p>
                </div>
                <div className={styles.cicloItem}>
                  <span className={styles.cicloItemLabel}><span aria-hidden="true">🏛️</span> Decisión BCE</span>
                  <p>{ciclo.decisionBce}</p>
                </div>
                <div className={styles.cicloGrid2}>
                  <div className={styles.cicloItem}>
                    <span className={styles.cicloItemLabel}><span aria-hidden="true">📊</span> Euríbor</span>
                    <p>{ciclo.euribor}</p>
                  </div>
                  <div className={styles.cicloItem}>
                    <span className={styles.cicloItemLabel}><span aria-hidden="true">🏠</span> Hipotecas</span>
                    <p>{ciclo.hipotecas}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <DisclaimerCard variant="financial" severity="high" context="visualizador-tipos-interes-bce">
        <p>
          Este visualizador tiene finalidad <strong>exclusivamente educativa</strong>. Los datos históricos y cifras
          de ejemplo son aproximaciones ilustrativas. Los tipos de interés del BCE cambian periódicamente; consulta{' '}
          <a href="https://www.ecb.europa.eu" target="_blank" rel="noopener noreferrer">
            ecb.europa.eu
          </a>{' '}
          para datos oficiales actualizados.
        </p>
        <p>
          Ningún contenido de esta página constituye asesoramiento financiero, de inversión o hipotecario.
          Para decisiones sobre hipotecas, inversiones o ahorro, consulta siempre a un profesional cualificado.
        </p>
      </DisclaimerCard>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Cómo Funciona la Política Monetaria"
        subtitle="Los mecanismos por los que el BCE influye en la economía real"
      >
        <h3>¿Qué es el BCE y qué controla?</h3>
        <p>
          El Banco Central Europeo (BCE) es la institución que gestiona la política monetaria de los 20 países
          de la zona euro. Su mandato principal es mantener la inflación cerca del 2% a medio plazo. Para ello,
          su principal herramienta es el tipo de interés de referencia (lo que en Latinoamérica se conoce como
          tasa de interés de referencia).
        </p>

        <h3>Los tres tipos de interés del BCE</h3>
        <p>El BCE fija tres tipos distintos, que forman una banda:</p>
        <ul>
          <li>
            <strong>Tipo de refinanciación (principal):</strong> el que se muestra en este visualizador. Es el
            coste al que los bancos comerciales pueden pedir prestado dinero al BCE durante una semana.
          </li>
          <li>
            <strong>Tipo de depósito:</strong> lo que el BCE paga (o cobra, si es negativo) a los bancos por
            guardar su dinero. Suele estar 0,5% por debajo del tipo principal.
          </li>
          <li>
            <strong>Tipo de préstamo marginal:</strong> crédito de emergencia a un día. Suele estar 0,25% por
            encima del tipo principal.
          </li>
        </ul>

        <h3>¿Por qué afecta el BCE a tu hipoteca?</h3>
        <p>
          Los bancos comerciales se financian en parte con dinero del BCE o entre ellos. El Euríbor
          (Euro Interbank Offered Rate) es el tipo al que los bancos europeos se prestan dinero entre sí a
          distintos plazos. Al estar condicionado por los tipos del BCE, sube cuando el BCE sube tipos y baja
          cuando baja. La mayoría de las hipotecas variables en España están referenciadas al Euríbor a 12 meses.
        </p>

        <h3>¿Por qué tarda en notarse el efecto?</h3>
        <p>
          Los economistas hablan de "retardos de transmisión": las subidas de tipos tardan entre 12 y 24 meses
          en tener pleno efecto en la economía real. Las hipotecas variables se revisan anualmente; las empresas
          renegocian créditos en plazos más largos; y la inversión empresarial responde con lag. Por eso el BCE
          actúa con anticipación, intentando prever la inflación futura.
        </p>

        <div className={styles.warningBox}>
          <strong>⚡ Dato clave:</strong> El BCE es independiente de los gobiernos nacionales. Sus decisiones
          las toma el Consejo de Gobierno (los gobernadores de los bancos centrales nacionales + el Comité
          Ejecutivo). Ningún gobierno puede ordenarle subir o bajar tipos.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-tipos-interes-bce')} />
      <ShareCard appName="visualizador-tipos-interes-bce" />
      <Footer appName="visualizador-tipos-interes-bce" />
    </div>
  );
}
