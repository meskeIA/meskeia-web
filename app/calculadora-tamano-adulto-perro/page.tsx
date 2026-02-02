'use client';

import { useState } from 'react';
import styles from './CalculadoraTamanoAdultoPerro.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

type TamanoRaza = 'mini' | 'pequeno' | 'mediano' | 'grande' | 'gigante';

interface RazaReferencia {
  nombre: string;
  tamano: TamanoRaza;
  pesoAdulto: string;
  maduracion: string;
}

const razasReferencia: RazaReferencia[] = [
  // Mini
  { nombre: 'Chihuahua', tamano: 'mini', pesoAdulto: '1,5-3 kg', maduracion: '8-10 meses' },
  { nombre: 'Yorkshire Terrier', tamano: 'mini', pesoAdulto: '2-3,5 kg', maduracion: '8-10 meses' },
  { nombre: 'Pomerania', tamano: 'mini', pesoAdulto: '1,5-3 kg', maduracion: '8-10 meses' },
  { nombre: 'Maltés', tamano: 'mini', pesoAdulto: '3-4 kg', maduracion: '9-12 meses' },
  // Pequeño
  { nombre: 'Bichón Frisé', tamano: 'pequeno', pesoAdulto: '5-10 kg', maduracion: '10-12 meses' },
  { nombre: 'Cavalier King Charles', tamano: 'pequeno', pesoAdulto: '5,5-8 kg', maduracion: '10-12 meses' },
  { nombre: 'Jack Russell', tamano: 'pequeno', pesoAdulto: '6-8 kg', maduracion: '10-12 meses' },
  { nombre: 'Shih Tzu', tamano: 'pequeno', pesoAdulto: '4-7 kg', maduracion: '10-12 meses' },
  { nombre: 'Teckel', tamano: 'pequeno', pesoAdulto: '7-15 kg', maduracion: '10-12 meses' },
  // Mediano
  { nombre: 'Beagle', tamano: 'mediano', pesoAdulto: '9-11 kg', maduracion: '12-15 meses' },
  { nombre: 'Cocker Spaniel', tamano: 'mediano', pesoAdulto: '12-15 kg', maduracion: '12-15 meses' },
  { nombre: 'Bulldog Francés', tamano: 'mediano', pesoAdulto: '8-14 kg', maduracion: '12-14 meses' },
  { nombre: 'Border Collie', tamano: 'mediano', pesoAdulto: '14-20 kg', maduracion: '12-15 meses' },
  { nombre: 'Schnauzer Mediano', tamano: 'mediano', pesoAdulto: '14-20 kg', maduracion: '12-15 meses' },
  // Grande
  { nombre: 'Labrador Retriever', tamano: 'grande', pesoAdulto: '25-36 kg', maduracion: '18-24 meses' },
  { nombre: 'Golden Retriever', tamano: 'grande', pesoAdulto: '25-34 kg', maduracion: '18-24 meses' },
  { nombre: 'Pastor Alemán', tamano: 'grande', pesoAdulto: '22-40 kg', maduracion: '18-24 meses' },
  { nombre: 'Boxer', tamano: 'grande', pesoAdulto: '25-32 kg', maduracion: '18-24 meses' },
  { nombre: 'Husky Siberiano', tamano: 'grande', pesoAdulto: '16-27 kg', maduracion: '15-18 meses' },
  // Gigante
  { nombre: 'Pastor Bernés', tamano: 'gigante', pesoAdulto: '35-55 kg', maduracion: '24-36 meses' },
  { nombre: 'Gran Danés', tamano: 'gigante', pesoAdulto: '45-90 kg', maduracion: '24-36 meses' },
  { nombre: 'San Bernardo', tamano: 'gigante', pesoAdulto: '50-90 kg', maduracion: '24-36 meses' },
  { nombre: 'Mastín', tamano: 'gigante', pesoAdulto: '50-70 kg', maduracion: '24-36 meses' },
  { nombre: 'Terranova', tamano: 'gigante', pesoAdulto: '45-70 kg', maduracion: '24-36 meses' },
  { nombre: 'Rottweiler', tamano: 'gigante', pesoAdulto: '35-60 kg', maduracion: '18-24 meses' },
  { nombre: 'Dogo Alemán', tamano: 'gigante', pesoAdulto: '45-90 kg', maduracion: '24-36 meses' },
  { nombre: 'Leonberger', tamano: 'gigante', pesoAdulto: '45-77 kg', maduracion: '24-36 meses' },
];

// Factores de crecimiento por edad (semanas) y tamaño
const curvasCrecimiento: Record<TamanoRaza, Record<number, number>> = {
  mini: {
    8: 0.35, 12: 0.50, 16: 0.65, 20: 0.80, 24: 0.90, 28: 0.95, 32: 0.98, 40: 1.0,
  },
  pequeno: {
    8: 0.30, 12: 0.45, 16: 0.58, 20: 0.70, 24: 0.80, 28: 0.88, 32: 0.94, 40: 0.98, 48: 1.0,
  },
  mediano: {
    8: 0.25, 12: 0.38, 16: 0.50, 20: 0.60, 24: 0.70, 28: 0.78, 32: 0.85, 40: 0.92, 52: 0.98, 60: 1.0,
  },
  grande: {
    8: 0.20, 12: 0.30, 16: 0.40, 20: 0.48, 24: 0.55, 28: 0.62, 32: 0.68, 40: 0.78, 52: 0.88, 72: 0.96, 96: 1.0,
  },
  gigante: {
    8: 0.15, 12: 0.22, 16: 0.30, 20: 0.37, 24: 0.43, 28: 0.50, 32: 0.55, 40: 0.65, 52: 0.75, 72: 0.85, 96: 0.95, 144: 1.0,
  },
};

export default function CalculadoraTamanoAdultoPerroPage() {
  const [pesoActual, setPesoActual] = useState('');
  const [edadSemanas, setEdadSemanas] = useState('');
  const [tamanoRaza, setTamanoRaza] = useState<TamanoRaza>('mediano');
  const [filtroRaza, setFiltroRaza] = useState<TamanoRaza | 'todas'>('todas');
  const [resultado, setResultado] = useState<{
    pesoAdultoMin: number;
    pesoAdultoMax: number;
    pesoAdultoEstimado: number;
    porcentajeCrecimiento: number;
    edadMaduracion: string;
  } | null>(null);

  const obtenerPorcentajeCrecimiento = (edad: number, tamano: TamanoRaza): number => {
    const curva = curvasCrecimiento[tamano];
    const edades = Object.keys(curva).map(Number).sort((a, b) => a - b);

    // Si la edad está por debajo del mínimo
    if (edad <= edades[0]) {
      return curva[edades[0]];
    }

    // Si la edad está por encima del máximo
    if (edad >= edades[edades.length - 1]) {
      return 1.0;
    }

    // Interpolación lineal entre los dos puntos más cercanos
    for (let i = 0; i < edades.length - 1; i++) {
      if (edad >= edades[i] && edad < edades[i + 1]) {
        const x0 = edades[i];
        const x1 = edades[i + 1];
        const y0 = curva[x0];
        const y1 = curva[x1];
        return y0 + (y1 - y0) * ((edad - x0) / (x1 - x0));
      }
    }

    return 1.0;
  };

  const calcular = () => {
    const peso = parseFloat(pesoActual.replace(',', '.'));
    const edad = parseFloat(edadSemanas);

    if (isNaN(peso) || peso <= 0 || peso > 50) return;
    if (isNaN(edad) || edad < 4 || edad > 150) return;

    const porcentaje = obtenerPorcentajeCrecimiento(edad, tamanoRaza);

    // Peso adulto estimado
    const pesoEstimado = peso / porcentaje;

    // Rango con margen de error del 15%
    const pesoMin = pesoEstimado * 0.85;
    const pesoMax = pesoEstimado * 1.15;

    // Edad de maduración según tamaño
    const edadesMaduracion: Record<TamanoRaza, string> = {
      mini: '8-10 meses',
      pequeno: '10-12 meses',
      mediano: '12-15 meses',
      grande: '18-24 meses',
      gigante: '24-36 meses',
    };

    setResultado({
      pesoAdultoMin: pesoMin,
      pesoAdultoMax: pesoMax,
      pesoAdultoEstimado: pesoEstimado,
      porcentajeCrecimiento: porcentaje * 100,
      edadMaduracion: edadesMaduracion[tamanoRaza],
    });
  };

  const limpiar = () => {
    setPesoActual('');
    setEdadSemanas('');
    setResultado(null);
  };

  const razasFiltradas = filtroRaza === 'todas'
    ? razasReferencia
    : razasReferencia.filter(r => r.tamano === filtroRaza);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📏 Predictor de Tamaño Adulto</h1>
        <p className={styles.subtitle}>
          Calcula cuánto pesará tu cachorro cuando sea adulto
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h3>Datos de tu cachorro</h3>

          {/* Peso actual */}
          <div className={styles.inputGroup}>
            <label>Peso actual</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                value={pesoActual}
                onChange={(e) => setPesoActual(e.target.value)}
                placeholder="5"
                className={styles.input}
              />
              <span className={styles.unidad}>kg</span>
            </div>
          </div>

          {/* Edad en semanas */}
          <div className={styles.inputGroup}>
            <label>Edad del cachorro</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                value={edadSemanas}
                onChange={(e) => setEdadSemanas(e.target.value)}
                placeholder="16"
                className={styles.input}
              />
              <span className={styles.unidad}>semanas</span>
            </div>
            <span className={styles.hint}>
              {edadSemanas && !isNaN(parseFloat(edadSemanas)) ?
                `≈ ${formatNumber(parseFloat(edadSemanas) / 4.33, 1)} meses` : ''}
            </span>
          </div>

          {/* Tamaño de raza */}
          <div className={styles.inputGroup}>
            <label>Tamaño esperado de la raza</label>
            <div className={styles.tamanoGrid}>
              {[
                { id: 'mini' as TamanoRaza, label: 'Mini', peso: '<5 kg' },
                { id: 'pequeno' as TamanoRaza, label: 'Pequeño', peso: '5-10 kg' },
                { id: 'mediano' as TamanoRaza, label: 'Mediano', peso: '10-25 kg' },
                { id: 'grande' as TamanoRaza, label: 'Grande', peso: '25-45 kg' },
                { id: 'gigante' as TamanoRaza, label: 'Gigante', peso: '>45 kg' },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`${styles.tamanoBtn} ${tamanoRaza === t.id ? styles.active : ''}`}
                  onClick={() => setTamanoRaza(t.id)}
                >
                  <span className={styles.tamanoLabel}>{t.label}</span>
                  <span className={styles.tamanoPeso}>{t.peso}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.botones}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular Peso Adulto
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoIcon}>🐕</span>
                <div className={styles.resultadoValor}>
                  {formatNumber(resultado.pesoAdultoEstimado, 1)} kg
                </div>
                <div className={styles.resultadoLabel}>
                  Peso adulto estimado
                </div>
              </div>

              <div className={styles.rangoBox}>
                <div className={styles.rangoLabel}>Rango probable:</div>
                <div className={styles.rangoValor}>
                  {formatNumber(resultado.pesoAdultoMin, 1)} - {formatNumber(resultado.pesoAdultoMax, 1)} kg
                </div>
              </div>

              <div className={styles.detallesGrid}>
                <div className={styles.detalleCard}>
                  <span className={styles.detalleIcon}>📊</span>
                  <span className={styles.detalleValor}>{formatNumber(resultado.porcentajeCrecimiento, 0)}%</span>
                  <span className={styles.detalleLabel}>Crecimiento actual</span>
                </div>
                <div className={styles.detalleCard}>
                  <span className={styles.detalleIcon}>🎯</span>
                  <span className={styles.detalleValor}>{resultado.edadMaduracion}</span>
                  <span className={styles.detalleLabel}>Maduración</span>
                </div>
              </div>

              <div className={styles.barraProgreso}>
                <div className={styles.barraFondo}>
                  <div
                    className={styles.barraRelleno}
                    style={{ width: `${Math.min(resultado.porcentajeCrecimiento, 100)}%` }}
                  />
                </div>
                <div className={styles.barraLabels}>
                  <span>Nacimiento</span>
                  <span>Tamaño adulto</span>
                </div>
              </div>

              <div className={styles.notaInfo}>
                💡 La precisión es mayor con cachorros de más de 14 semanas.
                Los mestizos pueden variar más que las razas puras.
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🐾</span>
              <p>Introduce los datos de tu cachorro para predecir su tamaño adulto</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de razas */}
      <div className={styles.razasContainer}>
        <h2>📋 Tabla de Razas de Referencia</h2>

        <div className={styles.filtrosRaza}>
          <button
            className={`${styles.filtroBtn} ${filtroRaza === 'todas' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('todas')}
          >
            Todas
          </button>
          <button
            className={`${styles.filtroBtn} ${filtroRaza === 'mini' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('mini')}
          >
            Mini
          </button>
          <button
            className={`${styles.filtroBtn} ${filtroRaza === 'pequeno' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('pequeno')}
          >
            Pequeño
          </button>
          <button
            className={`${styles.filtroBtn} ${filtroRaza === 'mediano' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('mediano')}
          >
            Mediano
          </button>
          <button
            className={`${styles.filtroBtn} ${filtroRaza === 'grande' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('grande')}
          >
            Grande
          </button>
          <button
            className={`${styles.filtroBtn} ${filtroRaza === 'gigante' ? styles.active : ''}`}
            onClick={() => setFiltroRaza('gigante')}
          >
            Gigante
          </button>
        </div>

        <div className={styles.razasGrid}>
          {razasFiltradas.map((raza, index) => (
            <div key={index} className={`${styles.razaCard} ${styles[raza.tamano]}`}>
              <div className={styles.razaNombre}>{raza.nombre}</div>
              <div className={styles.razaInfo}>
                <span className={styles.razaPeso}>⚖️ {raza.pesoAdulto}</span>
                <span className={styles.razaMaduracion}>📅 {raza.maduracion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LastUpdated lastUpdate="2 de febrero de 2026" />

      <DisclaimerCard variant="medical" severity="medium" collapsible={true} context="calculadora-tamano-adulto-perro">
        <p>Esta calculadora usa curvas de crecimiento promedio. <strong>Limitaciones:</strong></p>
        <ul className={styles.disclaimerList}>
          <li><strong>En mestizos la predicción es menos precisa</strong>: Depende de las razas parentales y su proporción genética</li>
          <li><strong>Factores individuales influyen</strong>: Alimentación, esterilización temprana, enfermedades y genética pueden alterar el crecimiento</li>
        </ul>
        <p className={styles.highlight}><strong>🐾 Solo orientativo. Consulta con tu veterinario sobre el desarrollo y peso ideal de tu cachorro.</strong></p>
      </DisclaimerCard>

      <RelatedApps
        apps={getRelatedApps('calculadora-tamano-adulto-perro')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <EducationalSection
        title="📚 ¿Cómo crecen los cachorros?"
        subtitle="Información sobre las fases de crecimiento y factores que influyen"
      >
        <section className={styles.guideSection}>
          <h2>📈 Fases de Crecimiento</h2>
          <div className={styles.fasesGrid}>
            <div className={styles.faseCard}>
              <h4>🍼 Fase neonatal (0-2 semanas)</h4>
              <p>Los cachorros nacen ciegos y sordos. Dependen totalmente de la madre. Duplican su peso en la primera semana.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>👀 Fase de transición (2-4 semanas)</h4>
              <p>Abren los ojos y empiezan a oír. Comienzan a dar sus primeros pasos. Empiezan a interactuar con sus hermanos.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>🐕 Fase de socialización (4-12 semanas)</h4>
              <p>Período crítico para el desarrollo social. Empiezan a comer alimento sólido. Crecimiento muy rápido.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>💪 Fase juvenil (3-6 meses)</h4>
              <p>El crecimiento continúa fuerte. Cambio de dientes de leche a permanentes. Mucha energía y curiosidad.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>🎯 Adolescencia (6-18 meses)</h4>
              <p>El crecimiento se ralentiza gradualmente. Maduración sexual. Los perros grandes aún siguen creciendo.</p>
            </div>
            <div className={styles.faseCard}>
              <h4>✨ Madurez (1-3 años)</h4>
              <p>Alcanzan su tamaño adulto completo. Los gigantes pueden seguir &quot;rellenando&quot; músculo hasta los 3 años.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Es cierto que puedo predecir el tamaño por las patas?</summary>
              <p>Es un mito parcial. Las patas grandes pueden indicar un perro grande, pero no es un método preciso. La genética y la raza son mejores indicadores.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Los mestizos crecen igual que las razas puras?</summary>
              <p>Los mestizos siguen patrones de crecimiento similares, pero con más variabilidad. Si conoces las razas parentales, puedes hacer mejor estimación promediando sus tamaños.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿La esterilización afecta al crecimiento?</summary>
              <p>Puede influir ligeramente. La esterilización temprana puede permitir que los huesos crezcan un poco más, resultando en perros ligeramente más altos pero no más pesados.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cómo sé qué tamaño de raza seleccionar?</summary>
              <p>Si conoces la raza, consulta la tabla. Para mestizos, estima según el tamaño de los padres si los conoces, o consulta con tu veterinario.</p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-tamano-adulto-perro" />
    </div>
  );
}
