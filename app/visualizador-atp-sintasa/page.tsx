'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorAtpSintasa.module.css';

// Tipos para los estados de síntesis de las subunidades beta
type EstadoBeta = 'abierto' | 'cerrado' | 'semiabierto';

interface SubunidadBeta {
  id: number;
  estado: EstadoBeta;
  label: string;
}

// Estado inicial de las 3 subunidades beta
const ESTADOS_INICIALES: SubunidadBeta[] = [
  { id: 0, estado: 'abierto', label: 'β₁' },
  { id: 1, estado: 'cerrado', label: 'β₂' },
  { id: 2, estado: 'semiabierto', label: 'β₃' },
];

// Ciclo de rotación de estados
const CICLO_ESTADOS: Record<EstadoBeta, EstadoBeta> = {
  abierto: 'cerrado',
  cerrado: 'semiabierto',
  semiabierto: 'abierto',
};

const PASO_TEXTOS = [
  {
    titulo: 'Paso 1 — La cadena de transporte bombea H⁺',
    icono: '⚡',
    descripcion: 'NADH y FADH₂ (producidos en la glucólisis y el ciclo de Krebs) entregan electrones a los complejos I–IV de la cadena respiratoria. Estos complejos utilizan esa energía para bombear activamente protones (H⁺) desde la matriz mitocondrial al espacio intermembrana.',
    detalle: 'Resultado: se acumula una alta concentración de H⁺ en el espacio intermembrana, creando un gradiente electroquímico (diferencia de concentración + diferencia de carga eléctrica).',
    color: '#2E86AB',
  },
  {
    titulo: 'Paso 2 — El gradiente es energía potencial',
    icono: '🔋',
    descripcion: 'Los H⁺ acumulados "quieren" volver a la matriz (por gradiente de concentración y por la diferencia de potencial eléctrico). Pero la membrana mitocondrial interna es impermeable a los protones.',
    detalle: 'La única "puerta" disponible es el canal F₀ de la ATP sintasa. Analogía: como el agua retenida por una presa — el gradiente es energía potencial almacenada esperando ser liberada de forma controlada.',
    color: '#48A9A6',
  },
  {
    titulo: 'Paso 3 — Los H⁺ fluyen y el motor gira',
    icono: '🔄',
    descripcion: 'El flujo de H⁺ a través del canal F₀ hace rotar el eje central de la ATP sintasa. Por cada 3–4 protones que pasan, el eje gira 120°. Una vuelta completa (3 × 120°) requiere ~9–12 protones.',
    detalle: 'Premio Nobel de Química 1997 (Paul Boyer y John Walker) por descubrir y confirmar mediante cristalografía de rayos X este mecanismo de catálisis rotante — uno de los más elegantes de la biología molecular.',
    color: '#7FB3D3',
  },
  {
    titulo: 'Paso 4 — ADP + Pi → ATP',
    icono: '🧬',
    descripcion: 'La rotación del eje central fuerza cambios conformacionales cíclicos en las 3 subunidades β de F₁. Cada subunidad alterna entre 3 estados: abierto (capta ADP + Pᵢ), cerrado (sintetiza ATP mediante cambio conformacional) y semiabierto (libera el ATP formado).',
    detalle: 'La energía no se usa para formar el enlace ADP–Pᵢ directamente, sino para liberar el ATP ya formado de la enzima. Es un mecanismo único en bioquímica.',
    color: '#2E86AB',
  },
];

const INHIBIDORES = [
  {
    icono: '🟡',
    nombre: 'Oligomicina',
    tipo: 'Antibiótico de investigación',
    mecanismo: 'Bloquea específicamente el canal F₀, impidiendo el flujo de protones a través de la ATP sintasa.',
    efecto: 'Sin flujo de H⁺ → sin rotación → sin síntesis de ATP. La cadena respiratoria se ralentiza porque el gradiente ya no puede disminuir.',
    contexto: 'Herramienta fundamental en investigación para estudiar el acoplamiento entre la cadena de transporte y la ATP sintasa.',
    severidad: 'investigacion',
  },
  {
    icono: '💀',
    nombre: 'Cianuro (CN⁻)',
    tipo: 'Veneno clásico',
    mecanismo: 'Bloquea el Complejo IV (citocromo c oxidasa), impidiendo la transferencia final de electrones al oxígeno.',
    efecto: 'Sin consumo de O₂ → sin bombeo de H⁺ → sin gradiente → sin ATP. Las células mueren por fallo energético agudo en minutos.',
    contexto: 'Explica el mecanismo del envenenamiento por cianuro: los tejidos no pueden utilizar el oxígeno disponible, produciendo "asfixia celular interna".',
    severidad: 'peligroso',
  },
  {
    icono: '🔓',
    nombre: 'Desacopladores (DNP)',
    tipo: '2,4-Dinitrofenol — histórico',
    mecanismo: 'Moléculas lipofílicas que transportan H⁺ a través de la membrana mitocondrial sin pasar por la ATP sintasa, creando un "atajo" para los protones.',
    efecto: 'El gradiente se disipa como calor. La cadena respiratoria funciona a máxima velocidad (quemando glucosa y grasas) pero sin producir ATP útil.',
    contexto: 'El DNP fue comercializado como adelgazante en los años 1930, con resultados fatales (hipertermia, fallo multiorgánico). Prohibido desde 1938, pero sigue apareciendo en mercados ilegales.',
    severidad: 'peligroso',
  },
  {
    icono: '🌿',
    nombre: 'Termogenina (UCP1)',
    tipo: 'Desacoplador natural',
    mecanismo: 'Proteína del tejido adiposo marrón (BAT) que permite que los H⁺ pasen a través de la membrana sin producir ATP — el mismo principio que el DNP, pero controlado por el organismo.',
    efecto: 'El gradiente se convierte en calor en lugar de ATP. Es el mecanismo de la termogénesis no tiritante.',
    contexto: 'Fundamental en recién nacidos (que tienen mucho BAT) y en animales que hibernan. Actualmente investigado como diana terapéutica para la obesidad.',
    severidad: 'natural',
  },
];

export default function VisualizadorAtpSintasa() {
  const [motorActivo, setMotorActivo] = useState(true);
  const [pasoActual, setPasoActual] = useState(0);
  const [peso, setPeso] = useState(70);
  const [subunidades, setSubunidades] = useState<SubunidadBeta[]>(ESTADOS_INICIALES);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cicla los estados de las subunidades beta cuando el motor está activo
  useEffect(() => {
    if (motorActivo) {
      intervalRef.current = setInterval(() => {
        setSubunidades(prev =>
          prev.map(sub => ({ ...sub, estado: CICLO_ESTADOS[sub.estado] }))
        );
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [motorActivo]);

  const atpDiario = Math.round(peso * 0.6);
  const recargas = 500;

  const relatedApps = getRelatedApps('visualizador-atp-sintasa');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Bioquímica Molecular</span>
          <h1>ATP Sintasa</h1>
          <p className={styles.heroSubtitle}>
            El motor molecular rotante que produce la energía de tus células
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>~40 kg</span>
              <span className={styles.heroStatLabel}>ATP reciclado/día (adulto)</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>500×</span>
              <span className={styles.heroStatLabel}>cada molécula se recicla</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>120°</span>
              <span className={styles.heroStatLabel}>por cada 3-4 protones</span>
            </div>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* BLOQUE 1: El Motor Molecular */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>El Motor Molecular: Cómo Funciona</h2>
          <p>La ATP sintasa tiene dos dominios: F₀ (anclado en la membrana, gira) y F₁ (sobresale hacia la matriz, sintetiza ATP)</p>
        </div>

        <div className={styles.motorWrapper}>
          <div className={styles.motorControls}>
            <button
              type="button"
              className={`${styles.btnMotor} ${motorActivo ? styles.btnMotorActivo : ''}`}
              onClick={() => setMotorActivo(prev => !prev)}
              aria-pressed={motorActivo}
            >
              {motorActivo ? '⏸ Pausar motor' : '▶ Activar motor'}
            </button>
            <span className={styles.motorEstado}>
              {motorActivo ? 'Motor en funcionamiento' : 'Motor detenido'}
            </span>
          </div>

          <div className={styles.membranaContainer}>
            {/* Etiquetas de compartimentos */}
            <div className={styles.compartimentoLabel} style={{ top: '5%' }}>
              Espacio intermembrana
              <span className={styles.hPlus}>↓ H⁺ (alta concentración)</span>
            </div>

            {/* Protones bajando */}
            <div className={styles.protonCarril}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`${styles.protonBola} ${motorActivo ? styles.protonAnimado : ''}`}
                  style={{ animationDelay: `${i * 0.6}s` }}
                  aria-hidden="true"
                >
                  H⁺
                </div>
              ))}
            </div>

            {/* Membrana mitocondrial */}
            <div className={styles.membranaLinea}>
              <span className={styles.membranaLabel}>Membrana mitocondrial interna</span>

              {/* F0: cilindro en la membrana */}
              <div className={styles.motorF0Wrapper}>
                <div
                  className={`${styles.motorF0} ${motorActivo ? styles.motorGirando : ''}`}
                  aria-label="Subunidad F0 - gira con el flujo de protones"
                >
                  <span>F₀</span>
                  <div className={styles.f0Anillos}>
                    <div className={styles.f0Anillo} />
                    <div className={styles.f0Anillo} />
                    <div className={styles.f0Anillo} />
                  </div>
                </div>
              </div>
            </div>

            {/* F1: cabeza con subunidades beta */}
            <div className={styles.motorF1Wrapper}>
              <div className={styles.motorF1}>
                <div className={styles.f1Titulo}>F₁</div>
                <div className={styles.subunidadesWrapper}>
                  {subunidades.map(sub => (
                    <div
                      key={sub.id}
                      className={`${styles.subunidadBeta} ${styles[`beta${sub.estado.charAt(0).toUpperCase() + sub.estado.slice(1)}`]}`}
                      title={`Estado: ${sub.estado}`}
                    >
                      <span className={styles.betaLabel}>{sub.label}</span>
                      <span className={styles.betaEstado}>{sub.estado}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.atpFlecha} aria-hidden="true">
                  ADP + Pᵢ → <strong>ATP</strong>
                </div>
              </div>
            </div>

            {/* Etiqueta matriz */}
            <div className={styles.compartimentoLabel} style={{ bottom: '5%' }}>
              Matriz mitocondrial
              <span className={styles.hPlus}>↑ H⁺ (baja concentración)</span>
            </div>
          </div>

          <div className={styles.motorExplicacion}>
            <div className={styles.infoBox}>
              <span className={styles.infoIcono} aria-hidden="true">🔄</span>
              <p>Cada vez que <strong>3–4 protones</strong> pasan a través del F₀, la parte central gira <strong>120°</strong>. Una rotación completa (3 × 120°) produce <strong>3 moléculas de ATP</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE 2: La Quimioósmosis */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionHeader}>
          <h2>La Quimioósmosis: El Gradiente que Mueve Todo</h2>
          <p>El proceso de 4 pasos descrito por Peter Mitchell (Nobel 1978)</p>
        </div>

        <div className={styles.stepContainer}>
          <div className={styles.stepProgress}>
            {PASO_TEXTOS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.stepDot} ${idx === pasoActual ? styles.stepDotActivo : ''} ${idx < pasoActual ? styles.stepDotCompletado : ''}`}
                onClick={() => setPasoActual(idx)}
                aria-label={`Ir al paso ${idx + 1}`}
                aria-pressed={idx === pasoActual}
              />
            ))}
          </div>

          <div className={styles.stepCard} style={{ borderTopColor: PASO_TEXTOS[pasoActual].color }}>
            <div className={styles.stepNumero} style={{ backgroundColor: PASO_TEXTOS[pasoActual].color }}>
              {pasoActual + 1} / 4
            </div>
            <div className={styles.stepIcono} aria-hidden="true">{PASO_TEXTOS[pasoActual].icono}</div>
            <h3 className={styles.stepTitulo}>{PASO_TEXTOS[pasoActual].titulo}</h3>
            <p className={styles.stepDescripcion}>{PASO_TEXTOS[pasoActual].descripcion}</p>
            <div className={styles.stepDetalle}>
              <p>{PASO_TEXTOS[pasoActual].detalle}</p>
            </div>
          </div>

          <div className={styles.stepControls}>
            <button
              type="button"
              className={styles.btnStep}
              onClick={() => setPasoActual(prev => Math.max(0, prev - 1))}
              disabled={pasoActual === 0}
            >
              ← Anterior
            </button>
            <span className={styles.stepIndicador}>Paso {pasoActual + 1} de {PASO_TEXTOS.length}</span>
            <button
              type="button"
              className={styles.btnStep}
              onClick={() => setPasoActual(prev => Math.min(PASO_TEXTOS.length - 1, prev + 1))}
              disabled={pasoActual === PASO_TEXTOS.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* BLOQUE 3: ¿Cuánto ATP Produces? */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>¿Cuánto ATP Produces?</h2>
          <p>Calcula la producción de ATP de tu cuerpo cada día</p>
        </div>

        <div className={styles.atpCalculadora}>
          <div className={styles.sliderWrapper}>
            <label className={styles.sliderLabel} htmlFor="slider-peso">
              Tu peso corporal: <strong>{peso} kg</strong>
            </label>
            <input
              id="slider-peso"
              type="range"
              min={40}
              max={120}
              value={peso}
              onChange={e => setPeso(Number(e.target.value))}
              className={styles.sliderATP}
              aria-label="Peso corporal en kilogramos"
            />
            <div className={styles.sliderRango}>
              <span>40 kg</span>
              <span>120 kg</span>
            </div>
          </div>

          <div className={styles.resultadoATP}>
            <div className={styles.resultadoPrincipal}>
              <span className={styles.resultadoNumero}>{atpDiario} kg</span>
              <span className={styles.resultadoDesc}>de ATP reciclado al día</span>
            </div>
            <p className={styles.resultadoExplicacion}>
              Tu cuerpo recicla aproximadamente <strong>{atpDiario} kg de ATP</strong> cada día.
              Cada molécula de ADP se recarga como ATP unas <strong>{recargas} veces</strong> al día —
              el mismo ATP se reutiliza continuamente.
            </p>
          </div>

          <div className={styles.atpTarjetas}>
            <div className={styles.atpTarjeta}>
              <span className={styles.atpTarjetaIcono} aria-hidden="true">🫀</span>
              <div className={styles.atpTarjetaInfo}>
                <strong>Célula hepática en reposo</strong>
                <span>~2.000 moléculas ATP/segundo</span>
              </div>
            </div>
            <div className={styles.atpTarjeta}>
              <span className={styles.atpTarjetaIcono} aria-hidden="true">💪</span>
              <div className={styles.atpTarjetaInfo}>
                <strong>Célula muscular en ejercicio</strong>
                <span>hasta 500.000 moléculas ATP/segundo</span>
              </div>
            </div>
            <div className={styles.atpTarjeta}>
              <span className={styles.atpTarjetaIcono} aria-hidden="true">🧠</span>
              <div className={styles.atpTarjetaInfo}>
                <strong>Neurona activa</strong>
                <span>El cerebro usa ~20% del ATP total del cuerpo</span>
              </div>
            </div>
          </div>

          <div className={styles.comparativaATP}>
            <h3>Rendimiento energético por sustrato</h3>
            <div className={styles.barrasWrapper}>
              <div className={styles.barraItem}>
                <span className={styles.barraLabel}>Glucólisis sola (sin O₂)</span>
                <div className={styles.barraContainer}>
                  <div className={styles.barraFill} style={{ width: '1.9%', backgroundColor: '#E63946' }} />
                  <span className={styles.barraValor}>2 ATP</span>
                </div>
              </div>
              <div className={styles.barraItem}>
                <span className={styles.barraLabel}>Glucosa completa (con O₂)</span>
                <div className={styles.barraContainer}>
                  <div className={styles.barraFill} style={{ width: '30%', backgroundColor: '#48A9A6' }} />
                  <span className={styles.barraValor}>~30–32 ATP</span>
                </div>
              </div>
              <div className={styles.barraItem}>
                <span className={styles.barraLabel}>Ácido palmítico (grasa C16)</span>
                <div className={styles.barraContainer}>
                  <div className={styles.barraFill} style={{ width: '100%', backgroundColor: '#2E86AB' }} />
                  <span className={styles.barraValor}>~106 ATP</span>
                </div>
              </div>
            </div>
            <p className={styles.comparativaNote}>Las grasas producen más ATP por molécula porque tienen más átomos de hidrógeno disponibles para generar gradiente de protones.</p>
          </div>
        </div>
      </section>

      {/* BLOQUE 4: Inhibidores */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionHeader}>
          <h2>Inhibidores: Cómo Se Puede Parar el Motor</h2>
          <p>Sustancias que bloquean la ATP sintasa o la cadena de transporte — explicación educativa del mecanismo fisiológico</p>
        </div>

        <div className={styles.inhibidoresGrid}>
          {INHIBIDORES.map((inh, idx) => (
            <div key={idx} className={`${styles.tarjetaInhibidor} ${styles[`inhibidor${inh.severidad.charAt(0).toUpperCase() + inh.severidad.slice(1)}`]}`}>
              <div className={styles.inhibidorHeader}>
                <span className={styles.inhibidorIcono} aria-hidden="true">{inh.icono}</span>
                <div>
                  <h3 className={styles.inhibidorNombre}>{inh.nombre}</h3>
                  <span className={styles.inhibidorTipo}>{inh.tipo}</span>
                </div>
              </div>
              <div className={styles.inhibidorCuerpo}>
                <div className={styles.inhibidorItem}>
                  <strong>Mecanismo:</strong>
                  <p>{inh.mecanismo}</p>
                </div>
                <div className={styles.inhibidorItem}>
                  <strong>Efecto celular:</strong>
                  <p>{inh.efecto}</p>
                </div>
                <div className={styles.inhibidorContexto}>
                  <p>{inh.contexto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.warningBox} role="note">
          <span aria-hidden="true">⚠️</span>
          <p>Esta app describe mecanismos bioquímicos con fines educativos. El DNP, el cianuro y otras sustancias mencionadas son peligrosas y/o ilegales — se citan exclusivamente para explicar el mecanismo fisiológico de la ATP sintasa y la cadena de transporte de electrones.</p>
        </div>
      </section>

      <EducationalSection
        title="Profundiza en la ATP sintasa"
        subtitle="Motor molecular, quimioósmosis y energía celular"
      >
        <div className={styles.educContent}>
          <div className={styles.educItem}>
            <h4>Peter Mitchell y la hipótesis quimiosmótica (Nobel 1978)</h4>
            <p>En 1961, Mitchell propuso que el gradiente electroquímico de protones era la "moneda energética" que acoplaba la cadena respiratoria con la síntesis de ATP. Durante 15 años, casi nadie le creyó — se creía que debía existir un intermediario químico de alta energía. La evidencia experimental acumulada le dio finalmente la razón y el Nobel de Química 1978, en solitario.</p>
          </div>

          <div className={styles.educItem}>
            <h4>Paul Boyer y John Walker (Nobel 1997): el mecanismo rotante</h4>
            <p>Boyer propuso el modelo de catálisis alternante (los 3 estados de las subunidades β) basándose en evidencia cinética. Walker resolvió la estructura de la F₁ por cristalografía de rayos X en 1994, confirmando visualmente la asimetría que predicen los 3 estados. Juntos obtuvieron el Nobel de Química 1997 (compartido con Jens Skou por la Na⁺/K⁺-ATPasa).</p>
          </div>

          <div className={styles.educItem}>
            <h4>ATP sintasa en cloroplastos: el mismo motor, otra fuente de energía</h4>
            <p>En los cloroplastos existe la CF₀F₁-ATP sintasa, estructuralmente homóloga a la mitocondrial. La diferencia clave: el gradiente de protones lo genera la fotosíntesis (la luz excita electrones en el fotosistema II, que al circular por la cadena de transporte de electrones del cloroplasto bombean H⁺ al lumen del tilacoide). El motor es el mismo; la fuente de energía es la luz solar.</p>
          </div>

          <div className={styles.educItem}>
            <h4>¿Cuántas ATP sintasas tiene una mitocondria?</h4>
            <p>Una célula cardíaca humana típica contiene ~2.000 mitocondrias. Cada mitocondria tiene en promedio ~15.000 moléculas de ATP sintasa en su membrana interna. Esto significa que una sola célula cardíaca puede tener ~30 millones de motores moleculares funcionando simultáneamente — necesario para soportar las demandas energéticas del músculo cardíaco.</p>
          </div>

          <div className={styles.educItem}>
            <h4>La ATP sintasa puede funcionar en reversa</h4>
            <p>En condiciones de hipoxia (escasez de oxígeno), algunas bacterias y mitocondrias pueden invertir el funcionamiento de la ATP sintasa: en lugar de usar el gradiente para producir ATP, hidrolizan ATP para bombear H⁺ y así mantener un potencial de membrana mínimo. Este mecanismo de "emergencia" es especialmente relevante en bacterias anaerobias y en isquemia miocárdica.</p>
          </div>

          <div className={styles.warningBox} role="note">
            <span aria-hidden="true">⚠️</span>
            <p>Esta app describe mecanismos bioquímicos con fines educativos. La DNP y otras sustancias mencionadas son peligrosas — se citan solo para explicar el mecanismo fisiológico.</p>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-atp-sintasa" />
      <Footer appName="visualizador-atp-sintasa" />
    </div>
  );
}
