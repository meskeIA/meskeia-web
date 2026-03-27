'use client';

import React, { useState } from 'react';
import styles from './AsesorSeguroSalud.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type VeredictoKey = 'publico' | 'complementario' | 'completo';

interface Opcion { valor: string; etiqueta: string; desc: string; }
interface Pregunta { id: number; categoria: string; pregunta: string; icon: string; opciones: Opcion[]; }

interface VeredictoInfo {
  nombre: string;
  icon: string;
  descripcion: string;
  cobertura: string[];
  precioOrientativo: string;
  precioNota: string;
}

interface Resultado {
  veredicto: VeredictoKey;
  puntuacion: number;
  razones: string[];
  consejos: string[];
}

// ─────────────────────────────────────────────
// Datos de veredictos
// ─────────────────────────────────────────────

const VEREDICTOS: Record<VeredictoKey, VeredictoInfo> = {
  publico: {
    nombre: 'Sanidad pública es suficiente',
    icon: '🏥',
    descripcion: 'Según tu perfil, el sistema público de salud cubre bien tus necesidades actuales. Contratar un seguro privado no aportaría valor suficiente para justificar el coste.',
    cobertura: ['Médico de cabecera y especialistas', 'Hospitalización y urgencias', 'Analíticas y pruebas diagnósticas', 'Medicamentos con copago reducido'],
    precioOrientativo: '0 €/mes',
    precioNota: 'La sanidad pública está financiada vía impuestos',
  },
  complementario: {
    nombre: 'Seguro complementario recomendado',
    icon: '🛡️',
    descripcion: 'Tu perfil se beneficiaría de un seguro que complemente la sanidad pública: principalmente para reducir tiempos de espera en especialistas y acceder a segunda opinión médica.',
    cobertura: ['Especialistas sin lista de espera', 'Segunda opinión médica', 'Urgencias privadas', 'Cobertura dental básica (con módulo adicional)'],
    precioOrientativo: '35 – 80 €/mes',
    precioNota: 'Precio orientativo para adulto de 30-50 años. Varía por edad, CCAA y aseguradora.',
  },
  completo: {
    nombre: 'Seguro privado completo recomendado',
    icon: '⭐',
    descripcion: 'Tu situación justifica claramente un seguro de salud privado completo: uso médico frecuente, hijos, residencia en zona con largas esperas o trabajo por cuenta propia sin mutua de empresa.',
    cobertura: ['Médico de cabecera privado', 'Todos los especialistas', 'Hospitalización en clínica privada', 'Urgencias 24h', 'Pruebas diagnósticas (resonancias, TAC…)', 'Ginecología y pediatría completas'],
    precioOrientativo: '60 – 180 €/mes',
    precioNota: 'Precio orientativo para familia de 3 (adultos 30-45 años + 1 niño). Varía mucho por edad y CCAA.',
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1, categoria: 'Tu uso médico', pregunta: '¿Con qué frecuencia vas al médico aproximadamente?', icon: '🩺',
    opciones: [
      { valor: 'raro', etiqueta: 'Casi nunca (1 vez al año o menos)', desc: 'Visitas solo en caso de urgencia clara' },
      { valor: 'normal', etiqueta: 'Ocasional (2-4 veces al año)', desc: 'Revisiones y alguna consulta puntual' },
      { valor: 'frecuente', etiqueta: 'Con frecuencia (5-10 veces al año)', desc: 'Seguimiento de alguna condición' },
      { valor: 'muy_frecuente', etiqueta: 'Muy frecuente (más de 10 veces)', desc: 'Crónico o condición que requiere seguimiento continuo' },
    ],
  },
  {
    id: 2, categoria: 'Tu uso médico', pregunta: '¿Necesitas seguimiento de alguna especialidad médica de forma regular?', icon: '👨‍⚕️',
    opciones: [
      { valor: 'no', etiqueta: 'No, solo médico de cabecera', desc: 'Sin especialistas activos en este momento' },
      { valor: 'uno', etiqueta: 'Sí, un especialista', desc: 'Cardiólogo, dermatólogo, traumatólogo…' },
      { valor: 'varios', etiqueta: 'Sí, varios especialistas', desc: 'Seguimiento en varias especialidades' },
      { valor: 'cronico', etiqueta: 'Tengo una enfermedad crónica', desc: 'Diabetes, HTA, artritis, tiroides…' },
    ],
  },
  {
    id: 3, categoria: 'Tu situación', pregunta: '¿En qué comunidad autónoma resides?', icon: '🗺️',
    opciones: [
      { valor: 'buena', etiqueta: 'Madrid, Navarra o País Vasco', desc: 'Sanidad pública con buen rendimiento relativo' },
      { valor: 'media', etiqueta: 'Cataluña, Galicia, Aragón, Canarias…', desc: 'Sistema público con esperas moderadas' },
      { valor: 'saturada', etiqueta: 'Andalucía, Valencia, Murcia, Castilla-La Mancha…', desc: 'Sistemas con mayor presión asistencial' },
      { valor: 'rural', etiqueta: 'Zona rural o con poca oferta sanitaria', desc: 'Lejanía de centros especializados' },
    ],
  },
  {
    id: 4, categoria: 'Tu situación', pregunta: '¿Tienes hijos menores de 18 años a cargo?', icon: '👨‍👩‍👧',
    opciones: [
      { valor: 'no', etiqueta: 'No tengo hijos', desc: 'Sin menores a cargo' },
      { valor: 'si_1', etiqueta: 'Sí, 1 hijo', desc: 'Un menor en la unidad familiar' },
      { valor: 'si_varios', etiqueta: 'Sí, 2 o más hijos', desc: 'Varios menores a cargo' },
      { valor: 'embarazo', etiqueta: 'Estoy embarazada o planeando estarlo', desc: 'Cobertura maternal importante' },
    ],
  },
  {
    id: 5, categoria: 'Tu situación', pregunta: '¿Cuál es tu situación laboral?', icon: '💼',
    opciones: [
      { valor: 'empresa', etiqueta: 'Empleado/a por cuenta ajena', desc: 'Trabajo para una empresa' },
      { valor: 'autonomo', etiqueta: 'Autónomo/a o freelance', desc: 'Trabajo por cuenta propia' },
      { valor: 'funcionario', etiqueta: 'Funcionario/a (con MUFACE, ISFAS…)', desc: 'Tengo mutualidad de funcionarios' },
      { valor: 'desempleo', etiqueta: 'Desempleo, estudiante o jubilado/a', desc: 'Sin relación laboral activa' },
    ],
  },
  {
    id: 6, categoria: 'Tu uso médico', pregunta: '¿Cuánto valoras el acceso rápido a especialistas (sin esperar meses)?', icon: '⏱️',
    opciones: [
      { valor: 'poco', etiqueta: 'Puedo esperar sin problema', desc: 'Las listas de espera no me afectan mucho' },
      { valor: 'algo', etiqueta: 'Preferiría no esperar, pero lo acepto', desc: 'Me adaptaría aunque no es ideal' },
      { valor: 'mucho', etiqueta: 'Para mí es muy importante ir rápido', desc: 'Las esperas me generan estrés o perjuicio real' },
      { valor: 'critico', etiqueta: 'Es crítico por mi trabajo o condición', desc: 'No puedo permitirme largas bajas o esperas' },
    ],
  },
  {
    id: 7, categoria: 'Tu uso médico', pregunta: '¿Cuál es tu situación de salud dental?', icon: '🦷',
    opciones: [
      { valor: 'bien', etiqueta: 'Bien, solo revisiones anuales', desc: 'Sin tratamientos pendientes' },
      { valor: 'necesito', etiqueta: 'Necesito tratamientos próximamente', desc: 'Empastes, extracciones, ortodoncia…' },
      { valor: 'critico', etiqueta: 'Es un gasto importante para mí cada año', desc: 'Gasto dental recurrente y significativo' },
      { valor: 'indiferente', etiqueta: 'Voy a clínicas privadas de precio económico', desc: 'Ya tengo solución para el dentista' },
    ],
  },
  {
    id: 8, categoria: 'Tu situación', pregunta: '¿Has tenido ya algún seguro de salud privado?', icon: '📋',
    opciones: [
      { valor: 'si_contento', etiqueta: 'Sí y estaba muy satisfecho/a', desc: 'Le saqué partido real' },
      { valor: 'si_neutro', etiqueta: 'Sí pero apenas lo usé', desc: 'No amortizaba el coste mensual' },
      { valor: 'no_interes', etiqueta: 'No, pero me interesa', desc: 'Primera vez que lo considero seriamente' },
      { valor: 'no_duda', etiqueta: 'No, y no estoy seguro/a de si lo necesito', desc: 'Dudas sobre si compensa' },
    ],
  },
  {
    id: 9, categoria: 'Tu presupuesto', pregunta: '¿Cuánto estarías dispuesto/a a pagar mensualmente?', icon: '💶',
    opciones: [
      { valor: 'nada', etiqueta: 'Nada, no quiero gasto extra', desc: 'La sanidad pública debe ser suficiente' },
      { valor: 'poco', etiqueta: 'Hasta 40 €/mes', desc: 'Gasto muy ajustado' },
      { valor: 'medio', etiqueta: '40 – 100 €/mes', desc: 'Inversión razonable en salud' },
      { valor: 'alto', etiqueta: 'Más de 100 €/mes', desc: 'La salud es mi prioridad' },
    ],
  },
  {
    id: 10, categoria: 'Tu presupuesto', pregunta: '¿Tienes actualmente algún seguro de salud por convenio de empresa?', icon: '🏢',
    opciones: [
      { valor: 'si_completo', etiqueta: 'Sí, completo pagado por la empresa', desc: 'Cobertura total sin coste para mí' },
      { valor: 'si_parcial', etiqueta: 'Sí, pero con cobertura limitada', desc: 'Cubre lo básico, quiero ampliar' },
      { valor: 'no', etiqueta: 'No, tendría que contratarlo yo', desc: 'Sin seguro de empresa actualmente' },
      { valor: 'muface', etiqueta: 'Tengo mutualidad de funcionarios (MUFACE/ISFAS)', desc: 'Funcionario con cobertura específica' },
    ],
  },
];

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

function calcularResultado(r: Record<number, string>): Resultado {
  let puntos = 0; // Más puntos = más justificado el seguro privado
  const razones: string[] = [];
  const consejos: string[] = [];

  // Uso médico
  if (r[1] === 'frecuente') puntos += 2;
  if (r[1] === 'muy_frecuente') puntos += 3;
  if (r[2] === 'uno') puntos += 2;
  if (r[2] === 'varios') puntos += 3;
  if (r[2] === 'cronico') puntos += 2; // Crónico a veces mejor en pública
  if (r[6] === 'mucho') puntos += 2;
  if (r[6] === 'critico') puntos += 3;
  if (r[7] === 'necesito') puntos += 2;
  if (r[7] === 'critico') puntos += 3;

  // Situación
  if (r[3] === 'saturada') puntos += 2;
  if (r[3] === 'rural') puntos += 2;
  if (r[4] === 'si_1') puntos += 2;
  if (r[4] === 'si_varios') puntos += 3;
  if (r[4] === 'embarazo') puntos += 3;
  if (r[5] === 'autonomo') puntos += 2;
  if (r[5] === 'funcionario') puntos -= 3; // MUFACE ya cubre
  if (r[8] === 'si_contento') puntos += 2;

  // Presupuesto
  if (r[9] === 'nada') puntos -= 3;
  if (r[9] === 'poco') puntos -= 1;
  if (r[9] === 'alto') puntos += 1;
  if (r[10] === 'si_completo') puntos -= 5; // Ya lo tiene
  if (r[10] === 'muface') puntos -= 4;

  // Determinar veredicto
  let veredicto: VeredictoKey;
  if (puntos <= 2) veredicto = 'publico';
  else if (puntos <= 7) veredicto = 'complementario';
  else veredicto = 'completo';

  // Override por condición específica
  if (r[10] === 'si_completo') veredicto = 'publico';
  if (r[10] === 'muface') veredicto = 'publico';
  if (r[9] === 'nada') veredicto = 'publico';

  // Razones
  if (veredicto === 'publico') {
    razones.push('Tu uso médico actual no justifica el coste mensual de un seguro privado. La sanidad pública cubre bien tu perfil.');
    if (r[10] === 'si_completo') razones.push('Ya tienes cobertura privada completa a través de tu empresa: aprovéchala al máximo.');
    if (r[10] === 'muface') razones.push('Como funcionario/a con MUFACE o ISFAS ya tienes cobertura privada comparable a un seguro de calidad.');
  }
  if (veredicto === 'complementario') {
    razones.push('Un seguro complementario te aportará principalmente acceso rápido a especialistas sin listas de espera.');
    if (r[3] === 'saturada') razones.push('Las esperas en tu comunidad autónoma hacen que el acceso rápido a especialistas sea especialmente valioso.');
    if (r[7] === 'necesito') razones.push('Un módulo dental puede ahorrarte más que el coste anual del seguro si tienes tratamientos próximos.');
  }
  if (veredicto === 'completo') {
    if (r[4] !== 'no') razones.push('Con hijos a cargo, la pediatría privada y la ausencia de esperas para urgencias infantiles justifica la inversión.');
    if (r[5] === 'autonomo') razones.push('Como autónomo/a, sin baja laboral por enfermedad garantizada, el acceso rápido a atención médica es crítico para tu actividad.');
    if (r[6] === 'critico') razones.push('Dado que el tiempo de acceso médico es crítico para tu trabajo, el seguro privado es una herramienta de productividad real.');
  }

  // Consejos generales
  if (veredicto !== 'publico') {
    consejos.push('🔍 Compara siempre al menos 3 aseguradoras: Sanitas, Adeslas, Asisa, AXA Salud y DKV son las principales en España. Los precios y redes varían mucho por zona.');
    consejos.push('📋 Revisa la red de médicos en tu ciudad antes de contratar: importa más la calidad de la red que el precio.');
    if (r[7] === 'necesito' || r[7] === 'critico') {
      consejos.push('🦷 El dental suele ser módulo aparte. Compara si compensa un seguro dental independiente (desde 8 €/mes) frente al módulo dentro del seguro general.');
    }
    consejos.push('⚠️ Atención a las carencias: la mayoría de seguros tienen periodos sin cobertura para partos (8 meses), operaciones (6-8 meses) y algunas especialidades.');
  }
  if (veredicto === 'publico') {
    consejos.push('💊 Aunque no necesites seguro privado ahora, considera ahorrar el equivalente en un fondo de emergencia sanitaria para imprevistos.');
    consejos.push('📞 Conoce bien los recursos de tu sistema público: muchas CCAA tienen apps para cita online, telemedicina y resultados digitales.');
  }

  return { veredicto, puntuacion: puntos, razones, consejos };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function AsesorSeguroSalud() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) { setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor })); }
  function avanzar() {
    if (paso < totalPreguntas - 1) { setPaso(p => p + 1); }
    else { setResultado(calcularResultado(respuestas)); setPantalla('resultado'); }
  }
  function retroceder() { if (paso > 0) setPaso(p => p - 1); }
  function reiniciar() { setPantalla('intro'); setPaso(0); setRespuestas({}); setResultado(null); }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>🏥 Asesor de Seguro de Salud</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro' ? '10 preguntas para saber si el seguro privado te aporta valor real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu perfil de cobertura sanitaria</h1>
          <p className={styles.heroSubtitleSm}>Resultado orientativo basado en tu situación y uso médico</p>
        </header>
      )}

      <LegalNotice />

      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏥</span>
              <span className={styles.introIcon}>🛡️</span>
              <span className={styles.introIcon}>💊</span>
              <span className={styles.introIcon}>🩺</span>
            </div>
            <h2 className={styles.introTitulo}>¿Sanidad pública o seguro privado?</h2>
            <p className={styles.introDesc}>
              España tiene una de las mejores sanidades públicas del mundo, pero las listas de espera,
              la saturación en algunas comunidades y situaciones personales concretas hacen que un seguro
              privado pueda aportar valor real. Este test analiza tu uso médico, situación y presupuesto
              para orientarte sin sesgos comerciales.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Veredicto claro: público, complementario o completo</li>
              <li><span aria-hidden="true">✅</span> Cobertura recomendada según tu perfil</li>
              <li><span aria-hidden="true">✅</span> Rango de precio orientativo en España</li>
              <li><span aria-hidden="true">✅</span> Consejos para comparar aseguradoras</li>
              <li><span aria-hidden="true">✅</span> Sin publicidad ni aseguradoras patrocinadas</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div className={styles.progresoBar} role="progressbar" aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`} aria-valuenow={paso + 1} aria-valuemin={1} aria-valuemax={totalPreguntas}>
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map(op => (
                <button key={op.valor} type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">← Anterior</button>
            <button type="button" className={styles.btnSiguiente} onClick={avanzar} disabled={!respuestas[preguntaActual.id]} aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}>
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          <DisclaimerCard variant="general" severity="medium" />

          <div className={`${styles.veredictoCard} ${styles[`veredicto_${resultado.veredicto}`]}`}>
            <span className={styles.veredictoIcon} aria-hidden="true">{VEREDICTOS[resultado.veredicto].icon}</span>
            <p className={styles.veredictoLabel}>Orientación para tu perfil</p>
            <p className={styles.veredictoValor}>{VEREDICTOS[resultado.veredicto].nombre}</p>
            <p className={styles.veredictoDesc}>{VEREDICTOS[resultado.veredicto].descripcion}</p>
          </div>

          <div className={styles.coberturaGrid}>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Cobertura recomendada</p>
              {VEREDICTOS[resultado.veredicto].cobertura.map((c, i) => (
                <p key={i} className={styles.coberturaItem}>{c}</p>
              ))}
            </div>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Precio orientativo / mes</p>
              <p className={styles.precioRango}>{VEREDICTOS[resultado.veredicto].precioOrientativo}</p>
              <p className={styles.precioNota}>{VEREDICTOS[resultado.veredicto].precioNota}</p>
            </div>
          </div>

          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta orientación</p>
            {resultado.razones.map((r, i) => <p key={i} className={styles.razonItem}>{r}</p>)}
          </div>

          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de decidirte</p>
            {resultado.consejos.map((c, i) => <p key={i} className={styles.consejoItem}>{c}</p>)}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">← Repetir el test</button>

          <EducationalSection title="Guía completa: seguros de salud en España" subtitle="Sanidad pública, mutualidades, seguros privados y cómo comparar" defaultOpen={false}>
            <h3>El sistema sanitario español en 2025</h3>
            <p>España cuenta con un sistema sanitario público universal financiado por impuestos, considerado uno de los mejores del mundo en ranking de la OMS. Sin embargo, la saturación en ciertas comunidades ha disparado las listas de espera para especialistas: en algunas CCAA la espera para traumatología o dermatología puede superar los 6 meses.</p>

            <h3>¿Cuándo compensa el seguro privado?</h3>
            <p>El seguro privado no es para todo el mundo. Tiene más sentido en estas situaciones concretas:</p>
            <ul>
              <li><strong>Autónomos:</strong> sin baja por enfermedad garantizada, el acceso rápido al médico tiene valor económico directo.</li>
              <li><strong>Familias con hijos:</strong> la pediatría privada evita esperas en urgencias con niños enfermos.</li>
              <li><strong>Residentes en CCAA saturadas:</strong> donde las esperas en especialistas públicos superan los 3-4 meses.</li>
              <li><strong>Uso frecuente de especialistas:</strong> si vas 4-6 veces al año a especialistas, el tiempo ahorrado puede justificar el coste.</li>
              <li><strong>Segunda opinión médica:</strong> para diagnósticos complejos, el acceso rápido a otro especialista puede ser decisivo.</li>
            </ul>

            <h3>MUFACE e ISFAS: la opción de los funcionarios</h3>
            <p>Los funcionarios de la Administración General del Estado tienen acceso a MUFACE (civiles) o ISFAS/MUGEJU (militares y judiciales). Estas mutualidades ofrecen cobertura similar a un seguro privado completo a un coste muy inferior. Si eres funcionario, es casi siempre la mejor opción frente a contratar un seguro privado independiente.</p>

            <h3>Qué mirar al comparar aseguradoras</h3>
            <div className={styles.warningBox}>
              <strong>Atención a las carencias:</strong> casi todos los seguros tienen periodos durante los que no cubren ciertos servicios: partos (8 meses habitualmente), operaciones programadas (6-8 meses), ortodoncia (12 meses) y enfermedades preexistentes (variable). Contrata con suficiente antelación si tienes previsto usarlo pronto.
            </div>
            <ul>
              <li><strong>Red de médicos en tu ciudad:</strong> más importante que el precio. Consulta el cuadro médico de tu zona antes de contratar.</li>
              <li><strong>Copagos:</strong> algunos seguros son más baratos pero tienen copago por visita (3-8 €). Para uso frecuente, un seguro sin copago puede salir más económico.</li>
              <li><strong>Dental:</strong> generalmente es módulo aparte. Compara si te compensa añadirlo al seguro o contratar uno independiente (desde 8 €/mes).</li>
              <li><strong>Reembolso de gastos:</strong> algunos seguros con cuadro médico limitado permiten ir a cualquier médico y te reembolsan un porcentaje. Útil en zonas rurales.</li>
            </ul>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('asesor-seguro-salud')} />
      <ShareCard appName="asesor-seguro-salud" />
      <Footer appName="asesor-seguro-salud" />
    </div>
  );
}
