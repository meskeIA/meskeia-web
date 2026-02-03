'use client';

import { useState } from 'react';
import styles from './CalculadoraAlimentacionMascotas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

type TabType = 'calculadora' | 'toxicos' | 'transicion';
type TipoMascota = 'perro' | 'gato';
type EdadMascota = 'cachorro' | 'adulto' | 'senior';
type ActividadMascota = 'baja' | 'normal' | 'alta' | 'muy_alta';
type TamanoPerro = 'mini' | 'pequeno' | 'mediano' | 'grande' | 'gigante';

interface AlimentoToxico {
  nombre: string;
  emoji: string;
  peligro: 'alto' | 'medio';
  sintomas: string;
  descripcion: string;
}

const alimentosToxicos: AlimentoToxico[] = [
  { nombre: 'Chocolate', emoji: '🍫', peligro: 'alto', sintomas: 'Vómitos, diarrea, convulsiones', descripcion: 'Contiene teobromina, muy tóxico especialmente el negro' },
  { nombre: 'Uvas y pasas', emoji: '🍇', peligro: 'alto', sintomas: 'Insuficiencia renal aguda', descripcion: 'Incluso pequeñas cantidades pueden ser letales' },
  { nombre: 'Cebolla y ajo', emoji: '🧅', peligro: 'alto', sintomas: 'Anemia hemolítica', descripcion: 'Destruyen los glóbulos rojos, crudo o cocido' },
  { nombre: 'Xilitol', emoji: '🍬', peligro: 'alto', sintomas: 'Hipoglucemia, fallo hepático', descripcion: 'Presente en chicles, caramelos sin azúcar, pasta de dientes' },
  { nombre: 'Aguacate', emoji: '🥑', peligro: 'medio', sintomas: 'Vómitos, diarrea', descripcion: 'La persina es tóxica, especialmente hueso y piel' },
  { nombre: 'Café y cafeína', emoji: '☕', peligro: 'alto', sintomas: 'Hiperactividad, arritmias, convulsiones', descripcion: 'Incluye té, bebidas energéticas, cola' },
  { nombre: 'Alcohol', emoji: '🍺', peligro: 'alto', sintomas: 'Vómitos, desorientación, coma', descripcion: 'El hígado de las mascotas no procesa el alcohol' },
  { nombre: 'Nueces de macadamia', emoji: '🥜', peligro: 'medio', sintomas: 'Debilidad, vómitos, temblores', descripcion: 'Especialmente tóxicas para perros' },
  { nombre: 'Huesos cocidos', emoji: '🦴', peligro: 'alto', sintomas: 'Perforación intestinal, asfixia', descripcion: 'Se astillan fácilmente, pueden perforar órganos' },
  { nombre: 'Lácteos', emoji: '🥛', peligro: 'medio', sintomas: 'Diarrea, gases, malestar', descripcion: 'Muchas mascotas son intolerantes a la lactosa' },
  { nombre: 'Sal en exceso', emoji: '🧂', peligro: 'medio', sintomas: 'Sed excesiva, intoxicación por sodio', descripcion: 'Evitar snacks salados humanos' },
  { nombre: 'Masa cruda', emoji: '🍞', peligro: 'medio', sintomas: 'Hinchazón, intoxicación etílica', descripcion: 'La levadura fermenta en el estómago' },
];

export default function CalculadoraAlimentacionMascotasPage() {
  const [activeTab, setActiveTab] = useState<TabType>('calculadora');
  const [tipoMascota, setTipoMascota] = useState<TipoMascota>('perro');
  const [peso, setPeso] = useState('');
  const [edad, setEdad] = useState<EdadMascota>('adulto');
  const [actividad, setActividad] = useState<ActividadMascota>('normal');
  const [tamanoPerro, setTamanoPerro] = useState<TamanoPerro>('mediano');
  const [esterilizado, setEsterilizado] = useState(false);
  const [resultado, setResultado] = useState<{
    kcalDiarias: number;
    gramosPienso: number;
    gramosPiensoMin: number;
    gramosPiensoMax: number;
    racionesRecomendadas: number;
  } | null>(null);

  // Calcular RER (Resting Energy Requirement)
  const calcularRER = (pesoKg: number): number => {
    return 70 * Math.pow(pesoKg, 0.75);
  };

  // Factores de actividad
  const getFactorActividad = (): number => {
    const factores: Record<ActividadMascota, number> = {
      baja: 1.2,
      normal: 1.4,
      alta: 1.6,
      muy_alta: 2.0,
    };
    return factores[actividad];
  };

  // Factores por edad
  const getFactorEdad = (): number => {
    if (tipoMascota === 'perro') {
      const factoresPerro: Record<EdadMascota, number> = {
        cachorro: 2.0,
        adulto: 1.0,
        senior: 0.8,
      };
      return factoresPerro[edad];
    } else {
      const factoresGato: Record<EdadMascota, number> = {
        cachorro: 2.5,
        adulto: 1.0,
        senior: 0.8,
      };
      return factoresGato[edad];
    }
  };

  const calcular = () => {
    const pesoNum = parseFloat(peso.replace(',', '.'));
    if (isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 100) return;

    const rer = calcularRER(pesoNum);
    let kcal = rer * getFactorActividad() * getFactorEdad();

    // Ajuste por esterilización (-20%)
    if (esterilizado) {
      kcal *= 0.8;
    }

    // Conversión a gramos de pienso (asumiendo 350-400 kcal/100g promedio)
    const kcalPor100g = 375;
    const gramosPienso = (kcal / kcalPor100g) * 100;
    const gramosPiensoMin = (kcal / 400) * 100;
    const gramosPiensoMax = (kcal / 350) * 100;

    // Raciones recomendadas según edad
    let raciones = 2;
    if (edad === 'cachorro') {
      raciones = pesoNum < 5 ? 4 : 3;
    }

    setResultado({
      kcalDiarias: Math.round(kcal),
      gramosPienso: Math.round(gramosPienso),
      gramosPiensoMin: Math.round(gramosPiensoMin),
      gramosPiensoMax: Math.round(gramosPiensoMax),
      racionesRecomendadas: raciones,
    });
  };

  const limpiar = () => {
    setPeso('');
    setResultado(null);
  };

  const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'calculadora', label: 'Calculadora', emoji: '🍖' },
    { id: 'toxicos', label: 'Alimentos Tóxicos', emoji: '⚠️' },
    { id: 'transicion', label: 'Cambio de Pienso', emoji: '🔄' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🍖 Calculadora de Alimentación</h1>
        <p className={styles.subtitle}>
          Calcula la ración diaria ideal para tu perro o gato
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Calculadora */}
      {activeTab === 'calculadora' && (
        <div className={styles.mainContent}>
          <div className={styles.inputPanel}>
            {/* Selector de mascota */}
            <div className={styles.mascotaSelector}>
              <button
                className={`${styles.mascotaBtn} ${tipoMascota === 'perro' ? styles.active : ''}`}
                onClick={() => { setTipoMascota('perro'); setResultado(null); }}
              >
                🐕 Perro
              </button>
              <button
                className={`${styles.mascotaBtn} ${tipoMascota === 'gato' ? styles.active : ''}`}
                onClick={() => { setTipoMascota('gato'); setResultado(null); }}
              >
                🐈 Gato
              </button>
            </div>

            {/* Peso */}
            <div className={styles.inputGroup}>
              <label>Peso de tu {tipoMascota}</label>
              <div className={styles.inputConUnidad}>
                <input
                  type="text"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder={tipoMascota === 'perro' ? '15' : '4'}
                  className={styles.input}
                />
                <span className={styles.unidad}>kg</span>
              </div>
            </div>

            {/* Tamaño (solo perros) */}
            {tipoMascota === 'perro' && (
              <div className={styles.inputGroup}>
                <label>Tamaño de raza</label>
                <div className={styles.tamanoGrid}>
                  {[
                    { id: 'mini', label: 'Mini', peso: '<5 kg' },
                    { id: 'pequeno', label: 'Pequeño', peso: '5-10 kg' },
                    { id: 'mediano', label: 'Mediano', peso: '10-25 kg' },
                    { id: 'grande', label: 'Grande', peso: '25-45 kg' },
                    { id: 'gigante', label: 'Gigante', peso: '>45 kg' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.tamanoBtn} ${tamanoPerro === t.id ? styles.active : ''}`}
                      onClick={() => setTamanoPerro(t.id as TamanoPerro)}
                    >
                      <span className={styles.tamanoLabel}>{t.label}</span>
                      <span className={styles.tamanoPeso}>{t.peso}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Edad */}
            <div className={styles.inputGroup}>
              <label>Etapa de vida</label>
              <div className={styles.opcionesGrid}>
                <button
                  className={`${styles.opcionBtn} ${edad === 'cachorro' ? styles.active : ''}`}
                  onClick={() => setEdad('cachorro')}
                >
                  🍼 Cachorro
                </button>
                <button
                  className={`${styles.opcionBtn} ${edad === 'adulto' ? styles.active : ''}`}
                  onClick={() => setEdad('adulto')}
                >
                  💪 Adulto
                </button>
                <button
                  className={`${styles.opcionBtn} ${edad === 'senior' ? styles.active : ''}`}
                  onClick={() => setEdad('senior')}
                >
                  🧓 Senior
                </button>
              </div>
            </div>

            {/* Actividad */}
            <div className={styles.inputGroup}>
              <label>Nivel de actividad</label>
              <div className={styles.opcionesGrid}>
                <button
                  className={`${styles.opcionBtn} ${actividad === 'baja' ? styles.active : ''}`}
                  onClick={() => setActividad('baja')}
                >
                  🛋️ Baja
                </button>
                <button
                  className={`${styles.opcionBtn} ${actividad === 'normal' ? styles.active : ''}`}
                  onClick={() => setActividad('normal')}
                >
                  🚶 Normal
                </button>
                <button
                  className={`${styles.opcionBtn} ${actividad === 'alta' ? styles.active : ''}`}
                  onClick={() => setActividad('alta')}
                >
                  🏃 Alta
                </button>
                <button
                  className={`${styles.opcionBtn} ${actividad === 'muy_alta' ? styles.active : ''}`}
                  onClick={() => setActividad('muy_alta')}
                >
                  🏋️ Muy alta
                </button>
              </div>
            </div>

            {/* Esterilizado */}
            <div className={styles.inputGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={esterilizado}
                  onChange={(e) => setEsterilizado(e.target.checked)}
                />
                <span>Esterilizado/a</span>
              </label>
            </div>

            <div className={styles.botones}>
              <button onClick={calcular} className={styles.btnPrimary}>
                Calcular Ración
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
                  <span className={styles.resultadoIcon}>🍖</span>
                  <div className={styles.resultadoValor}>
                    {formatNumber(resultado.gramosPienso, 0)} g/día
                  </div>
                  <div className={styles.resultadoLabel}>
                    Ración diaria de pienso
                  </div>
                </div>

                <div className={styles.detallesGrid}>
                  <div className={styles.detalleCard}>
                    <span className={styles.detalleIcon}>🔥</span>
                    <span className={styles.detalleValor}>{formatNumber(resultado.kcalDiarias, 0)}</span>
                    <span className={styles.detalleLabel}>kcal/día</span>
                  </div>
                  <div className={styles.detalleCard}>
                    <span className={styles.detalleIcon}>🍽️</span>
                    <span className={styles.detalleValor}>{resultado.racionesRecomendadas}</span>
                    <span className={styles.detalleLabel}>raciones/día</span>
                  </div>
                  <div className={styles.detalleCard}>
                    <span className={styles.detalleIcon}>⚖️</span>
                    <span className={styles.detalleValor}>{formatNumber(resultado.gramosPienso / resultado.racionesRecomendadas, 0)}</span>
                    <span className={styles.detalleLabel}>g por ración</span>
                  </div>
                </div>

                <div className={styles.rangoInfo}>
                  <h4>📊 Rango según tipo de pienso</h4>
                  <p>
                    <strong>{formatNumber(resultado.gramosPiensoMin, 0)} - {formatNumber(resultado.gramosPiensoMax, 0)} g/día</strong>
                  </p>
                  <p className={styles.rangoNota}>
                    Varía según la densidad calórica del pienso (350-400 kcal/100g)
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.placeholderIcon}>🐾</span>
                <p>Introduce los datos de tu mascota para calcular su ración diaria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Alimentos Tóxicos */}
      {activeTab === 'toxicos' && (
        <div className={styles.toxicosContainer}>
          <div className={styles.toxicosHeader}>
            <h2>⚠️ Alimentos Peligrosos para Mascotas</h2>
            <p>Estos alimentos pueden causar desde malestar hasta la muerte. ¡Evítalos siempre!</p>
          </div>

          <div className={styles.toxicosGrid}>
            {alimentosToxicos.map((alimento, index) => (
              <div
                key={index}
                className={`${styles.toxicoCard} ${alimento.peligro === 'alto' ? styles.peligroAlto : styles.peligroMedio}`}
              >
                <div className={styles.toxicoHeader}>
                  <span className={styles.toxicoEmoji}>{alimento.emoji}</span>
                  <span className={styles.toxicoNombre}>{alimento.nombre}</span>
                  <span className={`${styles.toxicoBadge} ${alimento.peligro === 'alto' ? styles.badgeAlto : styles.badgeMedio}`}>
                    {alimento.peligro === 'alto' ? '🔴 Alto' : '🟡 Medio'}
                  </span>
                </div>
                <p className={styles.toxicoDescripcion}>{alimento.descripcion}</p>
                <p className={styles.toxicoSintomas}>
                  <strong>Síntomas:</strong> {alimento.sintomas}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.emergenciaBox}>
            <h3>🚨 ¿Tu mascota ha ingerido algo tóxico?</h3>
            <p>Llama inmediatamente a tu veterinario o a urgencias veterinarias.</p>
            <p>No intentes provocar el vómito sin indicación profesional.</p>
          </div>
        </div>
      )}

      {/* Tab: Transición de Pienso */}
      {activeTab === 'transicion' && (
        <div className={styles.transicionContainer}>
          <div className={styles.transicionHeader}>
            <h2>🔄 Guía de Cambio de Pienso</h2>
            <p>Cambiar bruscamente de alimentación puede causar problemas digestivos. Sigue esta transición gradual.</p>
          </div>

          <div className={styles.transicionTimeline}>
            <div className={styles.transicionDia}>
              <div className={styles.diaNumero}>Días 1-2</div>
              <div className={styles.diaContenido}>
                <div className={styles.proporcion}>
                  <div className={styles.barraAntiguo} style={{ width: '75%' }}>75% antiguo</div>
                  <div className={styles.barraNuevo} style={{ width: '25%' }}>25% nuevo</div>
                </div>
                <p>Introduce solo una pequeña cantidad del nuevo pienso</p>
              </div>
            </div>

            <div className={styles.transicionDia}>
              <div className={styles.diaNumero}>Días 3-4</div>
              <div className={styles.diaContenido}>
                <div className={styles.proporcion}>
                  <div className={styles.barraAntiguo} style={{ width: '50%' }}>50% antiguo</div>
                  <div className={styles.barraNuevo} style={{ width: '50%' }}>50% nuevo</div>
                </div>
                <p>Mezcla a partes iguales ambos piensos</p>
              </div>
            </div>

            <div className={styles.transicionDia}>
              <div className={styles.diaNumero}>Días 5-6</div>
              <div className={styles.diaContenido}>
                <div className={styles.proporcion}>
                  <div className={styles.barraAntiguo} style={{ width: '25%' }}>25% antiguo</div>
                  <div className={styles.barraNuevo} style={{ width: '75%' }}>75% nuevo</div>
                </div>
                <p>El nuevo pienso ya es la base de la alimentación</p>
              </div>
            </div>

            <div className={styles.transicionDia}>
              <div className={styles.diaNumero}>Día 7+</div>
              <div className={styles.diaContenido}>
                <div className={styles.proporcion}>
                  <div className={styles.barraNuevo} style={{ width: '100%' }}>100% nuevo</div>
                </div>
                <p>Transición completada. Solo el nuevo pienso</p>
              </div>
            </div>
          </div>

          <div className={styles.transicionTips}>
            <h3>💡 Consejos para una transición exitosa</h3>
            <ul>
              <li>Si tu mascota tiene problemas digestivos, alarga la transición a 10-14 días</li>
              <li>Observa las heces: deben mantenerse firmes y sin mucosidad</li>
              <li>Si hay vómitos o diarrea persistente, consulta con tu veterinario</li>
              <li>Mantén horarios de comida regulares durante la transición</li>
              <li>No añadas extras ni premios nuevos durante estos días</li>
            </ul>
          </div>
        </div>
      )}

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="health"
        severity="medium"
        context="calculadora-alimentacion-mascotas"
        collapsible={true}
      />


      <RelatedApps
        apps={getRelatedApps('calculadora-alimentacion-mascotas')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre nutrición de mascotas?"
        subtitle="Consejos de alimentación, errores comunes y preguntas frecuentes"
      >
        <section className={styles.guideSection}>
          <h2>🍽️ Principios de Alimentación Saludable</h2>
          <div className={styles.principiosGrid}>
            <div className={styles.principioCard}>
              <h4>⏰ Horarios Regulares</h4>
              <p>Alimenta a tu mascota a las mismas horas cada día. Esto regula su digestión y metabolismo.</p>
            </div>
            <div className={styles.principioCard}>
              <h4>💧 Agua Fresca</h4>
              <p>El agua debe estar siempre disponible y cambiarse al menos una vez al día.</p>
            </div>
            <div className={styles.principioCard}>
              <h4>🍖 Calidad del Pienso</h4>
              <p>Elige piensos con proteína animal como primer ingrediente. Evita cereales como base.</p>
            </div>
            <div className={styles.principioCard}>
              <h4>📏 Porciones Medidas</h4>
              <p>Usa una taza medidora o báscula. Evita alimentar &quot;a ojo&quot; para prevenir obesidad.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Cuántas veces al día debo alimentar a mi mascota?</summary>
              <p><strong>Cachorros:</strong> 3-4 veces al día hasta los 4 meses, luego 3 veces hasta los 6 meses.<br />
              <strong>Adultos:</strong> 2 veces al día es lo ideal.<br />
              <strong>Seniors:</strong> 2 veces al día, con raciones más pequeñas.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo mezclar pienso con comida húmeda?</summary>
              <p>Sí, es una buena opción para aportar variedad y mayor hidratación. Ajusta las cantidades para no sobrealimentar (resta calorías del pienso según lo que añadas de húmedo).</p>
            </details>
            <details className={styles.faqItem}>
              <summary>Mi mascota no termina su comida, ¿qué hago?</summary>
              <p>Retira el plato después de 15-20 minutos. No dejes comida disponible todo el día. Esto enseña a comer en horarios y evita que el pienso se estropee.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Los perros pueden comer dieta BARF (cruda)?</summary>
              <p>Es controvertido. Puede ser nutricionalmente completa si está bien formulada, pero hay riesgos de bacterias (Salmonella, E. coli) y desequilibrios nutricionales. Consulta con un nutricionista veterinario.</p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-alimentacion-mascotas" />
    </div>
  );
}
