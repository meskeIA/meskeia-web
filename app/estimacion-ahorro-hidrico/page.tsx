'use client';

import { useState, useMemo } from 'react';
import styles from './EstimacionAhorroHidrico.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
  NumberInput,
} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// Consumo medio en España: 133 L/persona/día (INE 2023)
const CONSUMO_MEDIO_DIARIO = 133;

// Capacidad de una bañera estándar en litros
const LITROS_BANERA = 150;
// Capacidad de una piscina pequeña (25 m³)
const LITROS_PISCINA = 25000;

interface HabitoAhorro {
  id: string;
  icon: string;
  nombre: string;
  descripcion: string;
  ahorroDiarioBase: number; // Litros por día o por uso
  unidad: string; // "día", "ducha", "uso", "lavado"
  frecuenciaDiaria: number; // Cuántas veces al día se aplica por persona
  multiplicaPorPersonas: boolean;
}

const HABITOS: HabitoAhorro[] = [
  {
    id: 'ducha-corta',
    icon: '🚿',
    nombre: 'Ducha de 5 min en vez de 10',
    descripcion: 'Reducir el tiempo de ducha a la mitad ahorra unos 45 litros cada vez.',
    ahorroDiarioBase: 45,
    unidad: 'ducha',
    frecuenciaDiaria: 1,
    multiplicaPorPersonas: true,
  },
  {
    id: 'grifo-jabon',
    icon: '🧼',
    nombre: 'Cerrar grifo al enjabonarse',
    descripcion: 'Mantener el grifo cerrado mientras te enjabonas ahorra unos 12 litros por ducha.',
    ahorroDiarioBase: 12,
    unidad: 'ducha',
    frecuenciaDiaria: 1,
    multiplicaPorPersonas: true,
  },
  {
    id: 'aireador',
    icon: '💨',
    nombre: 'Instalar grifos aireadores',
    descripcion: 'Un aireador mezcla aire con agua, reduciendo el caudal sin perder presión. Ahorra unos 6 L/día por grifo.',
    ahorroDiarioBase: 6,
    unidad: 'día',
    frecuenciaDiaria: 2, // Cocina + baño
    multiplicaPorPersonas: false,
  },
  {
    id: 'cisterna-doble',
    icon: '🚽',
    nombre: 'Cisterna de doble descarga',
    descripcion: 'Permite elegir descarga parcial (3 L) o completa (6 L), frente a los 9 L de una cisterna convencional.',
    ahorroDiarioBase: 6,
    unidad: 'uso',
    frecuenciaDiaria: 5, // ~5 usos/día por persona
    multiplicaPorPersonas: true,
  },
  {
    id: 'lavadora-llena',
    icon: '👕',
    nombre: 'Lavadora siempre a carga completa',
    descripcion: 'Lavar con carga completa en vez de media carga ahorra unos 30 litros por lavado.',
    ahorroDiarioBase: 30,
    unidad: 'lavado',
    frecuenciaDiaria: 0.43, // ~3 lavados/semana por hogar
    multiplicaPorPersonas: false,
  },
  {
    id: 'lavavajillas',
    icon: '🍽️',
    nombre: 'Lavavajillas en vez de a mano',
    descripcion: 'Un lavavajillas eficiente usa 10-12 L frente a los 40-60 L de lavar a mano.',
    ahorroDiarioBase: 30,
    unidad: 'uso',
    frecuenciaDiaria: 1,
    multiplicaPorPersonas: false,
  },
  {
    id: 'riego-goteo',
    icon: '🌱',
    nombre: 'Riego por goteo en vez de aspersión',
    descripcion: 'El riego por goteo reduce el consumo de agua hasta un 50% respecto a la aspersión.',
    ahorroDiarioBase: 20,
    unidad: 'día',
    frecuenciaDiaria: 1,
    multiplicaPorPersonas: false,
  },
  {
    id: 'dientes',
    icon: '🪥',
    nombre: 'Cerrar grifo al lavarse los dientes',
    descripcion: 'Un grifo abierto gasta unos 8 litros por minuto. Cerrarlo al cepillarse ahorra 8 L cada vez.',
    ahorroDiarioBase: 8,
    unidad: 'vez',
    frecuenciaDiaria: 2, // 2 veces al día
    multiplicaPorPersonas: true,
  },
  {
    id: 'reutilizar-cocina',
    icon: '🫗',
    nombre: 'Reutilizar agua de cocina',
    descripcion: 'El agua de cocer verduras o lavar fruta se puede usar para regar plantas.',
    ahorroDiarioBase: 5,
    unidad: 'día',
    frecuenciaDiaria: 1,
    multiplicaPorPersonas: false,
  },
  {
    id: 'fugas',
    icon: '🔧',
    nombre: 'Detectar y reparar fugas',
    descripcion: 'Un grifo que gotea pierde hasta 30 litros al día. Una fuga en el inodoro puede perder hasta 200 L/día.',
    ahorroDiarioBase: 30,
    unidad: 'día',
    frecuenciaDiaria: 1,
    multiplicaPorPersonas: false,
  },
];

export default function EstimacionAhorroHidricoPage() {
  const [personas, setPersonas] = useState(2);
  const [precioAgua, setPrecioAgua] = useState('2,10');
  const [habitosActivos, setHabitosActivos] = useState<Set<string>>(new Set());

  const toggleHabito = (id: string) => {
    setHabitosActivos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const precioM3 = parseSpanishNumber(precioAgua) || 2.1;

  // Calcular ahorro diario por hábito
  const calcularAhorroDiario = (habito: HabitoAhorro): number => {
    const base = habito.ahorroDiarioBase * habito.frecuenciaDiaria;
    return habito.multiplicaPorPersonas ? base * personas : base;
  };

  // Cálculos derivados
  const resultados = useMemo(() => {
    const consumoAnual = CONSUMO_MEDIO_DIARIO * personas * 365;

    let ahorroDiarioTotal = 0;
    const detalles: { id: string; ahorroDiario: number; ahorroAnual: number; ahorroEuros: number }[] = [];

    HABITOS.forEach((habito) => {
      const ahorroDiario = calcularAhorroDiario(habito);
      const ahorroAnual = ahorroDiario * 365;
      const ahorroEuros = (ahorroAnual / 1000) * precioM3;
      detalles.push({ id: habito.id, ahorroDiario, ahorroAnual, ahorroEuros });
      if (habitosActivos.has(habito.id)) {
        ahorroDiarioTotal += ahorroDiario;
      }
    });

    const ahorroAnualTotal = ahorroDiarioTotal * 365;
    const ahorroEurosTotal = (ahorroAnualTotal / 1000) * precioM3;
    const porcentajeReduccion = consumoAnual > 0 ? (ahorroAnualTotal / consumoAnual) * 100 : 0;
    const baneras = ahorroAnualTotal / LITROS_BANERA;
    const piscinas = ahorroAnualTotal / LITROS_PISCINA;

    return {
      consumoAnual,
      ahorroAnualTotal,
      ahorroEurosTotal,
      porcentajeReduccion,
      baneras,
      piscinas,
      detalles,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personas, precioM3, habitosActivos]);

  const getDetalle = (id: string) => resultados.detalles.find((d) => d.id === id);

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero Section */}
        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">💧</span> Estimación de Ahorro Hídrico</h1>
          <p className={styles.subtitle}>
            Descubre cuánta agua y dinero puedes ahorrar en casa con hábitos sostenibles
          </p>
        </header>

        {/* RGPD */}
        <LegalNotice />

        {/* Disclaimer */}
        <DisclaimerCard
          variant="general"
          severity="low"
          collapsible={true}
          context="estimacion-ahorro-hidrico"
        >
          Los ahorros son estimaciones basadas en consumos medios en España (INE 2023). El ahorro real
          varía según los hábitos actuales, la presión del agua y las características de cada hogar.
        </DisclaimerCard>

        {/* Configuración */}
        <section className={styles.settingsPanel}>
          <h2 className={styles.settingsTitle}><span aria-hidden="true">⚙️</span> Configuración del hogar</h2>
          <div className={styles.settingsGrid}>
            <div className={styles.settingGroup}>
              <span className={styles.settingLabel}>Personas en el hogar</span>
              <div className={styles.personasSelector}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={personas === n ? styles.personaBtnActive : styles.personaBtn}
                    onClick={() => setPersonas(n)}
                    aria-label={`${n} persona${n > 1 ? 's' : ''}`}
                    aria-pressed={personas === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.settingGroup}>
              <NumberInput
                value={precioAgua}
                onChange={setPrecioAgua}
                label="Precio del agua (€/m³)"
                placeholder="2,10"
                min={0.5}
                max={5}
                step={0.1}
                suffix="€/m³"
                helperText="Media España: 2,10 €/m³ (rango 1,50 - 3,50)"
              />
            </div>
          </div>
        </section>

        {/* Hábitos de ahorro */}
        <section className={styles.habitsSection}>
          <h2 className={styles.habitsTitle}><span aria-hidden="true">✅</span> Selecciona los hábitos que adoptarías</h2>
          <div className={styles.habitsGrid}>
            {HABITOS.map((habito) => {
              const activo = habitosActivos.has(habito.id);
              const detalle = getDetalle(habito.id);
              return (
                <div
                  key={habito.id}
                  className={activo ? styles.habitCardActive : styles.habitCard}
                  onClick={() => toggleHabito(habito.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleHabito(habito.id);
                    }
                  }}
                  role="checkbox"
                  aria-checked={activo}
                  tabIndex={0}
                  aria-label={`${habito.nombre}: ahorro estimado ${formatNumber(detalle?.ahorroDiario ?? 0, 0)} litros al día`}
                >
                  <div className={styles.habitHeader}>
                    <span className={styles.habitIcon} aria-hidden="true">{habito.icon}</span>
                    <div className={styles.habitInfo}>
                      <div className={styles.habitName}>{habito.nombre}</div>
                      <div className={styles.habitDesc}>{habito.descripcion}</div>
                    </div>
                    <div
                      className={activo ? styles.habitToggleOn : styles.habitToggle}
                      aria-hidden="true"
                    />
                  </div>
                  {activo && detalle && (
                    <div className={styles.habitSavings}>
                      <span className={styles.savingBadge}>
                        <span aria-hidden="true">💧</span> {formatNumber(detalle.ahorroAnual, 0)} L/año
                      </span>
                      <span className={styles.savingBadge}>
                        <span aria-hidden="true">💶</span> {formatCurrency(detalle.ahorroEuros)}/año
                      </span>
                      <span className={styles.savingDaily}>
                        {formatNumber(detalle.ahorroDiario, 1)} L/día
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Panel de resumen */}
        <section className={styles.summaryPanel} aria-label="Resumen de ahorro estimado">
          <h2 className={styles.summaryTitle}><span aria-hidden="true">📊</span> Resumen de ahorro estimado</h2>

          {habitosActivos.size === 0 ? (
            <p className={styles.noSelectionMsg}>
              Selecciona al menos un hábito para ver tu ahorro estimado
            </p>
          ) : (
            <>
              <div className={styles.summaryStats}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{formatNumber(resultados.ahorroAnualTotal, 0)}</span>
                  <span className={styles.statLabel}>Litros ahorrados / año</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{formatCurrency(resultados.ahorroEurosTotal)}</span>
                  <span className={styles.statLabel}>Ahorro en euros / año</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{formatNumber(resultados.porcentajeReduccion, 1)}%</span>
                  <span className={styles.statLabel}>Reducción vs consumo medio</span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className={styles.progressSection}>
                <div className={styles.progressLabel}>
                  <span>Consumo estimado actual: {formatNumber(resultados.consumoAnual, 0)} L/año</span>
                  <span>Ahorro: {formatNumber(resultados.porcentajeReduccion, 1)}%</span>
                </div>
                <div className={styles.progressBar} role="progressbar" aria-valuenow={Math.round(resultados.porcentajeReduccion)} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(resultados.porcentajeReduccion, 100)}%` }}
                  />
                </div>
              </div>

              {/* Equivalencias */}
              <div className={styles.equivalencias}>
                <div className={styles.equivalencia}>
                  <span className={styles.equivIcon} aria-hidden="true">🛁</span>
                  <span className={styles.equivText}>
                    Equivale a <strong>{formatNumber(resultados.baneras, 0)} bañeras</strong> llenas al año
                  </span>
                </div>
                <div className={styles.equivalencia}>
                  <span className={styles.equivIcon} aria-hidden="true">🏊</span>
                  <span className={styles.equivText}>
                    Equivale a <strong>{formatNumber(resultados.piscinas, 1)} piscinas</strong> pequeñas (25 m³)
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre el ahorro de agua en España"
          subtitle="Contexto, comparativas, escenarios y consejos prácticos"
        >
          {/* Contexto */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">🌍</span> El agua en España: contexto</h2>
            <p>
              España es uno de los países europeos con mayor estrés hídrico. Según el INE (2023),
              el consumo medio por habitante es de 133 litros al día, sumando usos domésticos como
              ducha, cocina, limpieza y cisternas. Sin embargo, muchos hogares superan los 150 L/día
              por persona por hábitos ineficientes.
            </p>
            <p>
              El precio del agua varía considerablemente entre municipios: desde 1,50 €/m³ en algunas
              zonas del norte hasta 3,50 €/m³ en regiones costeras mediterráneas. La media nacional
              ronda los 2,10 €/m³, aunque la tendencia es al alza por el encarecimiento del tratamiento
              y la escasez creciente.
            </p>
            <p>
              Adoptar hábitos de ahorro no solo reduce la factura, sino que contribuye a la
              sostenibilidad de un recurso cada vez más escaso en el contexto del cambio climático.
            </p>
          </section>

          {/* Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">⚖️</span> Comparativa de hábitos: impacto relativo</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Hábito</th>
                    <th>Ahorro/día (1 pers.)</th>
                    <th>Ahorro/año (1 pers.)</th>
                    <th>Dificultad</th>
                    <th>Inversión</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Ducha de 5 min</strong></td>
                    <td>45 L</td>
                    <td>16.425 L</td>
                    <td>Baja</td>
                    <td>0 €</td>
                  </tr>
                  <tr>
                    <td><strong>Cisterna doble descarga</strong></td>
                    <td>30 L</td>
                    <td>10.950 L</td>
                    <td>Nula (automático)</td>
                    <td>15-40 €</td>
                  </tr>
                  <tr>
                    <td><strong>Cerrar grifo (dientes)</strong></td>
                    <td>16 L</td>
                    <td>5.840 L</td>
                    <td>Baja</td>
                    <td>0 €</td>
                  </tr>
                  <tr>
                    <td><strong>Grifos aireadores</strong></td>
                    <td>12 L</td>
                    <td>4.380 L</td>
                    <td>Nula (automático)</td>
                    <td>5-15 € / grifo</td>
                  </tr>
                  <tr>
                    <td><strong>Reparar fugas</strong></td>
                    <td>hasta 30 L</td>
                    <td>10.950 L</td>
                    <td>Media</td>
                    <td>Variable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">💼</span> Escenarios de ahorro reales</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🧑</span>
                  <h3>Persona sola en piso</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Hábitos:</strong> Ducha corta + grifo dientes + aireadores</p>
                  <p><strong>Ahorro estimado:</strong> ~26.645 L/año = ~56 €/año</p>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Impacto:</strong> Con solo 3 hábitos sencillos y sin inversión, se reduce
                  un 55% el consumo respecto a la media.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧‍👦</span>
                  <h3>Familia de 4 personas</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Hábitos:</strong> Ducha corta + cisterna doble + lavadora llena + dientes</p>
                  <p><strong>Ahorro estimado:</strong> ~108.000 L/año = ~227 €/año</p>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Impacto:</strong> Una familia puede ahorrar más de 200 € al año con hábitos
                  sencillos y una pequeña inversión en cisterna doble descarga.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏡</span>
                  <h3>Casa con jardín</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Hábitos:</strong> Todos los del hogar + riego por goteo + reutilizar agua cocina</p>
                  <p><strong>Ahorro estimado:</strong> ~135.000 L/año = ~284 €/año (2 personas)</p>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Impacto:</strong> El riego por goteo multiplica el ahorro en hogares con
                  jardín o terraza con plantas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                  <h3>Piso compartido (3 personas)</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <p><strong>Hábitos:</strong> Ducha corta + grifo jabón + dientes + lavavajillas</p>
                  <p><strong>Ahorro estimado:</strong> ~85.000 L/año = ~179 €/año</p>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Impacto:</strong> En pisos compartidos, el ahorro individual se multiplica.
                  Acordar hábitos comunes tiene un efecto notable.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cuánta agua gasta realmente una ducha de 10 minutos?</h4>
                <p>
                  Un cabezal de ducha estándar tiene un caudal de 9-12 litros por minuto. Una ducha
                  de 10 minutos consume entre 90 y 120 litros. Reducirla a 5 minutos ahorra
                  aproximadamente 45-60 litros cada vez. Un cabezal de bajo consumo reduce el caudal
                  a 6-8 L/min sin perder confort.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> <strong>Consejo:</strong> Pon un temporizador en el baño.
                  Una canción de 4-5 minutos es un truco popular para controlar el tiempo.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Merece la pena invertir en una cisterna de doble descarga?</h4>
                <p>
                  Absolutamente. Una cisterna convencional gasta 9-12 litros por descarga. La de doble
                  pulsador permite elegir entre 3 y 6 litros. Con 5 usos diarios por persona, una
                  familia de 4 ahorra unos 43.800 litros al año (92 € a precio medio). La inversión
                  se recupera en 2-3 meses.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> <strong>Consejo:</strong> Si no puedes cambiar la cisterna,
                  introduce una botella de 1,5 L llena dentro. Ahorra esa cantidad en cada descarga.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo sé si tengo fugas de agua en casa?</h4>
                <p>
                  Cierra todos los grifos y electrodomésticos que usen agua. Anota la lectura del
                  contador. Espera 2 horas sin usar agua. Si la lectura ha cambiado, tienes una fuga.
                  Los puntos más comunes son: cisterna del inodoro (pon colorante alimentario en la
                  cisterna y espera 15 minutos), grifos que gotean y conexiones de electrodomésticos.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> <strong>Consejo:</strong> Una fuga en el inodoro puede
                  desperdiciar hasta 200 litros diarios. Repararla cuesta menos de 20 € en la mayoría de casos.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Es más eficiente el lavavajillas que fregar a mano?</h4>
                <p>
                  Sí, siempre que se use a carga completa y en modo eco. Un lavavajillas moderno
                  consume 10-12 litros por ciclo, mientras que fregar a mano el equivalente gasta
                  entre 40 y 60 litros. Además, el lavavajillas calienta el agua de forma más eficiente,
                  ahorrando también en energía.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> <strong>Consejo:</strong> No enjuagues los platos antes de
                  meterlos. Los lavavajillas modernos están diseñados para limpiar restos sin pre-enjuague.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cuánto cuesta el agua en España realmente?</h4>
                <p>
                  El precio medio ronda los 2,10 €/m³, pero varía mucho: desde 1,50 € en zonas del
                  norte (Galicia, Asturias) hasta 3,50 € en la costa mediterránea (Murcia, Alicante).
                  Además, muchas tarifas son progresivas: cuanto más consumes, más caro es el m³ siguiente.
                  Ahorrar agua puede significar bajar de tramo tarifario.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> <strong>Consejo:</strong> Consulta tu factura para conocer
                  el precio exacto de tu municipio e introdúcelo en la herramienta para un cálculo más preciso.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué impacto tiene el ahorro de agua en el medio ambiente?</h4>
                <p>
                  Más allá del ahorro económico, reducir el consumo disminuye la energía necesaria para
                  potabilizar, bombear y depurar agua. En España, el ciclo urbano del agua genera unas
                  emisiones de 0,3 kg de CO₂ por m³. Una familia que ahorre 100 m³/año evita unos 30 kg
                  de CO₂, además de reducir la presión sobre ríos, embalses y acuíferos sobreexplotados.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> <strong>Consejo:</strong> En periodos de sequía, muchos
                  municipios imponen restricciones. Tener hábitos de ahorro ya establecidos facilita el cumplimiento.
                </p>
              </div>
            </div>
          </section>

          {/* Tips / Mejores prácticas */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">✅</span> Mejores prácticas de ahorro de agua</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🚿</span>
                <h4>Instala un cabezal de bajo consumo</h4>
                <p>Reduce el caudal de 12 a 6-8 L/min sin perder presión. Inversión: 10-25 €.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌧️</span>
                <h4>Recoge agua de lluvia</h4>
                <p>Un depósito de 200 L en la terraza puede cubrir el riego de macetas todo el verano.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <h4>Revisa la factura mensualmente</h4>
                <p>Un aumento inesperado puede indicar una fuga. Detectar fugas a tiempo ahorra miles de litros.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
                <h4>Ajusta la temperatura al instante</h4>
                <p>Un grifo monomando bien regulado evita desperdiciar agua mientras se espera la temperatura.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🪴</span>
                <h4>Riega al amanecer o anochecer</h4>
                <p>La evaporación se reduce un 60% fuera de las horas de sol. Mismo riego, más eficacia.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
                <h4>Elige electrodomésticos A+++</h4>
                <p>Una lavadora eficiente gasta 40 L/ciclo frente a los 70 L de modelos antiguos.</p>
              </div>
            </div>
          </section>

          {/* Warning box v2.0 */}
          <div className={styles.warningBox}>
            <h4><span aria-hidden="true">⚠️</span> Errores comunes que disparan el consumo de agua</h4>
            <ul>
              <li>
                <strong>❌ Dejar correr el agua &quot;hasta que sale caliente&quot;:</strong> Se desperdician
                2-5 litros cada vez. Recoge esa agua en un cubo para regar o fregar.
              </li>
              <li>
                <strong>❌ Poner la lavadora o lavavajillas a media carga:</strong> Consume casi lo mismo
                que a carga completa. Espera a llenarla o usa el programa de media carga si lo tiene.
              </li>
              <li>
                <strong>❌ Regar el jardín con manguera a chorro:</strong> Una manguera gasta 15-20 L/minuto.
                El riego por goteo usa un 50% menos y es más eficaz para las raíces.
              </li>
              <li>
                <strong>❌ Ignorar un grifo que gotea:</strong> &quot;Son solo gotas&quot; puede significar
                30 litros/día o 10.950 litros/año. Más de 20 € anuales desperdiciados.
              </li>
              <li>
                <strong>❌ Lavar el coche con manguera:</strong> Gasta 200-500 litros por lavado. Un cubo
                y esponja: 30-50 litros. O usa un túnel de lavado que recicla agua.
              </li>
              <li>
                <strong>❌ No revisar la presión del agua:</strong> Una presión excesiva (&gt;4 bar) aumenta
                el consumo un 30%. Un reductor de presión cuesta 15-30 € y se instala fácilmente.
              </li>
            </ul>
          </div>
        </EducationalSection>

        {/* Apps relacionadas */}
        <RelatedApps apps={getRelatedApps('estimacion-ahorro-hidrico')} />

        {/* Tarjeta de compartir */}
        <ShareCard appName="estimacion-ahorro-hidrico" />

        {/* Footer */}
        <Footer appName="estimacion-ahorro-hidrico" />
      </div>
    </>
  );
}
