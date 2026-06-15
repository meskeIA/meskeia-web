'use client';

import { useState, useCallback } from 'react';
import styles from './VisualizadorCortisol.module.css';
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

type SeccionId = 'ritmo' | 'estres' | 'sistemas' | 'moduladores';

interface SeccionNav {
  id: SeccionId;
  titulo: string;
  icono: string;
  subtitulo: string;
}

interface PuntoCircadiano {
  hora: number;
  nivel: number;
  nivelMalSueno: number;
  descripcion: string;
  actividades: string;
}

interface SistemaCorporal {
  id: string;
  nombre: string;
  icono: string;
  resumen: string;
  agudo: string;
  cronico: string;
  mecanismo: string;
  dato: string;
  sintoma: string;
}

interface ModuladorItem {
  factor: string;
  icono: string;
  explicacion: string;
  categoria: 'estilo' | 'alimentacion' | 'mental' | 'social';
}

// ─────────────────────────────────────────────
// Constantes de navegación
// ─────────────────────────────────────────────

const SECCIONES: SeccionNav[] = [
  { id: 'ritmo', titulo: 'Ritmo circadiano', icono: '🌅', subtitulo: 'Cómo varía el cortisol cada hora' },
  { id: 'estres', titulo: 'Agudo vs crónico', icono: '⚡', subtitulo: 'Dos respuestas muy distintas' },
  { id: 'sistemas', titulo: '8 sistemas', icono: '🫀', subtitulo: 'Qué afecta en cada parte del cuerpo' },
  { id: 'moduladores', titulo: 'Sube y baja', icono: '🎛️', subtitulo: 'Qué hábitos modulan el cortisol' },
];

// ─────────────────────────────────────────────
// Datos: Curva circadiana del cortisol
// ─────────────────────────────────────────────

const PUNTOS_CIRCADIANOS: PuntoCircadiano[] = [
  { hora: 0, nivel: 8, nivelMalSueno: 22, descripcion: 'Nivel mínimo nocturno. El cuerpo consolida memoria y repara tejidos.', actividades: 'Dormir profundamente (fase REM intensa)' },
  { hora: 1, nivel: 6, nivelMalSueno: 20, descripcion: 'Cortisol casi en suelo. La melatonina está en su punto máximo.', actividades: 'Sueño profundo, consolidación de memoria emocional' },
  { hora: 2, nivel: 5, nivelMalSueno: 18, descripcion: 'Nivel más bajo de las 24 horas. Sistema inmune activo reparando.', actividades: 'Sueño profundo, liberación de hormona del crecimiento (GH)' },
  { hora: 3, nivel: 6, nivelMalSueno: 20, descripcion: 'El reloj circadiano comienza a preparar el despertar.', actividades: 'Últimas fases de sueño profundo' },
  { hora: 4, nivel: 12, nivelMalSueno: 24, descripcion: 'Inicio del ascenso prepareador. El hipotálamo activa el eje HPA.', actividades: 'Transición hacia sueño más ligero' },
  { hora: 5, nivel: 25, nivelMalSueno: 30, descripcion: 'Ascenso pronunciado antes del despertar, incluso con alarma.', actividades: 'Sueño ligero, preparación para la vigilia' },
  { hora: 6, nivel: 40, nivelMalSueno: 35, descripcion: 'El cortisol está subiendo rápidamente, coordinado con el ritmo circadiano.', actividades: 'Despertar natural óptimo en este rango horario' },
  { hora: 7, nivel: 60, nivelMalSueno: 42, descripcion: 'Inicio del CAR (Cortisol Awakening Response). El pico está cerca.', actividades: 'Momento óptimo para levantarse, luz solar matutina' },
  { hora: 8, nivel: 85, nivelMalSueno: 50, descripcion: '⭐ PICO MÁXIMO: CAR completo (30-45 min tras despertar). 50-100% sobre el nivel basal.', actividades: 'Tareas cognitivas complejas, planificación, decisiones importantes' },
  { hora: 9, nivel: 75, nivelMalSueno: 48, descripcion: 'Descenso gradual desde el pico CAR. Energía y alerta todavía altas.', actividades: 'Trabajo profundo, aprendizaje, reuniones importantes' },
  { hora: 10, nivel: 65, nivelMalSueno: 45, descripcion: 'Cortisol alto-medio. Buen momento para trabajo creativo y analítico.', actividades: 'Resolución de problemas, escritura, análisis' },
  { hora: 11, nivel: 58, nivelMalSueno: 42, descripcion: 'Descenso continuo. Alerta sostenida sin el pico inicial.', actividades: 'Reuniones, colaboración, trabajo en equipo' },
  { hora: 12, nivel: 48, nivelMalSueno: 40, descripcion: 'Nivel medio. Pausa para comer; el cortisol gestiona la respuesta metabólica al almuerzo.', actividades: 'Comida, descanso activo, paseo' },
  { hora: 13, nivel: 42, nivelMalSueno: 38, descripcion: 'Descenso hacia la tarde. El cuerpo puede pedir una siesta breve (bajada natural).', actividades: 'Siesta corta (20 min máx) o descanso activo' },
  { hora: 14, nivel: 38, nivelMalSueno: 36, descripcion: 'Nivel medio-bajo. Segundo wind fisiológico si se ha descansado.', actividades: 'Tareas rutinarias, administrativas, gestiones' },
  { hora: 15, nivel: 35, nivelMalSueno: 35, descripcion: 'Nivel equilibrado. La temperatura corporal empieza a subir (segundo pico circadiano secundario).', actividades: 'Ejercicio físico moderado-intenso, tareas manuales' },
  { hora: 16, nivel: 30, nivelMalSueno: 33, descripcion: 'Cortisol bajando. Buen momento para ejercicio: coordinación y fuerza en su pico.', actividades: 'Deporte, ejercicio de fuerza o cardiovascular' },
  { hora: 17, nivel: 25, nivelMalSueno: 30, descripcion: 'Nivel bajo pero no mínimo. Energía que va disminuyendo.', actividades: 'Ejercicio suave, estiramientos, actividades sociales' },
  { hora: 18, nivel: 20, nivelMalSueno: 28, descripcion: 'Descenso hacia la noche. Cenar activa un pequeño pico metabólico.', actividades: 'Cena, actividades de ocio tranquilas, socializar' },
  { hora: 19, nivel: 16, nivelMalSueno: 26, descripcion: 'El cortisol baja, la melatonina empieza a prepararse para subir.', actividades: 'Lectura, actividades relajantes, reducir pantallas' },
  { hora: 20, nivel: 13, nivelMalSueno: 24, descripcion: 'Nivel bajo. La luz azul en este momento puede subir el cortisol e inhibir la melatonina.', actividades: 'Evitar pantallas brillantes, luz tenue, música suave' },
  { hora: 21, nivel: 11, nivelMalSueno: 22, descripcion: 'Cortisol muy bajo. El cuerpo se prepara para el sueño.', actividades: 'Meditación, respiración lenta, rutina de sueño' },
  { hora: 22, nivel: 9, nivelMalSueno: 22, descripcion: 'Nivel casi mínimo. La melatonina empieza a dominar el ciclo hormonal.', actividades: 'Preparar el sueño, oscuridad, temperatura fresca' },
  { hora: 23, nivel: 8, nivelMalSueno: 22, descripcion: 'El cortisol cede el paso a la melatonina. El cuerpo entra en modo reparación.', actividades: 'Dormir (hora ideal para acostarse)' },
];

// ─────────────────────────────────────────────
// Datos: Sistemas corporales
// ─────────────────────────────────────────────

const SISTEMAS_CORPORALES: SistemaCorporal[] = [
  {
    id: 'inmune', nombre: 'Sistema inmune', icono: '🦠',
    resumen: 'Agudo: protector. Crónico: inmunosupresor.',
    agudo: 'El cortisol agudo actúa como antiinflamatorio potente: reduce la hinchazón y regula la respuesta inmune para que no se dispare en exceso.',
    cronico: 'El cortisol crónico suprime los linfocitos T y B. Resultado: más resfriados, infecciones más frecuentes y cicatrización más lenta.',
    mecanismo: 'El cortisol inhibe la síntesis de citocinas proinflamatorias (IL-1, IL-6, TNF-α). A corto plazo es útil; a largo plazo deja el sistema inmune sin recursos.',
    dato: 'Estudios muestran que personas con estrés crónico tienen un 40% más de probabilidad de contraer un resfriado cuando se exponen al virus.',
    sintoma: 'Resfriados frecuentes, heridas que tardan en sanar, reactivación del herpes labial.',
  },
  {
    id: 'metabolismo', nombre: 'Metabolismo', icono: '⚡',
    resumen: 'Moviliza glucosa a corto plazo, acumula grasa visceral a largo plazo.',
    agudo: 'El cortisol aumenta la glucosa en sangre (gluconeogénesis hepática) para dar energía rápida a los músculos en la respuesta de lucha o huida.',
    cronico: 'El cortisol elevado de forma crónica aumenta la resistencia a la insulina y favorece el almacenamiento de grasa en el abdomen (grasa visceral), que es la más peligrosa metabólicamente.',
    mecanismo: 'Las células de grasa visceral tienen una alta densidad de receptores de glucocorticoides. Por eso el estrés engorda "de barriga" específicamente.',
    dato: 'La grasa visceral produce citocinas inflamatorias. El círculo estrés → cortisol → grasa visceral → inflamación → más estrés es uno de los bucles más estudiados en medicina.',
    sintoma: 'Aumento de peso abdominal, glucosa en ayunas elevada, síndrome metabólico.',
  },
  {
    id: 'cerebro', nombre: 'Cerebro y memoria', icono: '🧠',
    resumen: 'Agudo: mejora la memoria a corto plazo. Crónico: encoge el hipocampo.',
    agudo: 'El cortisol agudo mejora la consolidación de recuerdos (por eso los momentos de estrés intenso se recuerdan tan bien). El hipocampo trabaja a pleno rendimiento.',
    cronico: 'El hipocampo tiene una alta densidad de receptores de cortisol y es muy vulnerable. El estrés crónico reduce su volumen, deteriora la memoria episódica y aumenta el riesgo de depresión.',
    mecanismo: 'El cortisol crónico inhibe la neurogénesis (formación de nuevas neuronas) en el hipocampo y daña las dendritas de las neuronas existentes.',
    dato: 'Estudios de neuroimagen muestran que veteranos de guerra con TEPT tienen un hipocampo hasta un 8% más pequeño que los controles.',
    sintoma: 'Problemas de memoria, dificultad de concentración, neblina mental (brain fog), irritabilidad.',
  },
  {
    id: 'sueno', nombre: 'Sueño', icono: '😴',
    resumen: 'El cortisol y la melatonina son antagonistas directos.',
    agudo: 'Un pico de cortisol puntual (estrés en la tarde) puede retrasar la conciliación del sueño esa noche sin efectos duraderos.',
    cronico: 'El cortisol cronicamente alto inhibe la secreción de melatonina. El resultado es insomnio de conciliación, sueño superficial, pocas fases de sueño profundo y no llegar al sueño REM reparador.',
    mecanismo: 'El cortisol activa el sistema noradrenérgico (alerta) y suprime la secreción de melatonina por la glándula pineal. Sin melatonina, el cerebro no recibe la señal de "es de noche, hay que dormir".',
    dato: 'Dormir mal una noche aumenta el cortisol del día siguiente hasta un 37%, creando un ciclo vicioso: mal sueño → más cortisol → peor sueño.',
    sintoma: 'Insomnio, despertares nocturnos, cansancio al levantarse, somnolencia diurna.',
  },
  {
    id: 'cardiovascular', nombre: 'Sistema cardiovascular', icono: '❤️',
    resumen: 'Sube la presión arterial y la frecuencia cardíaca para movilizar recursos.',
    agudo: 'La presión arterial y la frecuencia cardíaca suben para llevar más sangre a los músculos. Respuesta adaptativa y reversible en minutos-horas.',
    cronico: 'La hipertensión crónica daña las paredes arteriales. El cortisol cronicamente alto se asocia con mayor riesgo de infarto, ictus y arteriosclerosis.',
    mecanismo: 'El cortisol retiene sodio y agua (actúa sobre los riñones como un mineralocorticoide suave), aumentando el volumen sanguíneo y la presión arterial. También promueve la inflamación de las paredes arteriales.',
    dato: 'Personas con trabajos de alta presión tienen un riesgo cardiovascular entre un 23% y un 40% mayor que la media según distintos metaanálisis.',
    sintoma: 'Presión arterial elevada, palpitaciones, dolor en el pecho, cefaleas por tensión.',
  },
  {
    id: 'digestion', nombre: 'Digestión', icono: '🫃',
    resumen: 'El estrés detiene la digestión: el cuerpo prioriza los músculos.',
    agudo: 'Durante el estrés agudo, el sistema digestivo se "apaga": se inhibe el peristaltismo, se reduce la secreción de jugos digestivos. La sangre va a los músculos.',
    cronico: 'El cortisol crónico deteriora la mucosa intestinal (intestino permeable), altera la microbiota y exacerba el síndrome de intestino irritable (SII) y la gastritis.',
    mecanismo: 'El sistema nervioso parasimpático (que controla la digestión) y el simpático (que gestiona el estrés) son antagonistas. El cortisol activa el simpático, bloqueando la digestión.',
    dato: 'Más del 70% de los pacientes con SII reportan que el estrés es el desencadenante principal de sus crisis.',
    sintoma: 'Diarrea o estreñimiento en momentos de estrés, ardor estomacal, SII, náuseas.',
  },
  {
    id: 'reproductivo', nombre: 'Sistema reproductivo', icono: '👶',
    resumen: 'El cortisol crónico suprime las hormonas sexuales.',
    agudo: 'Un estrés puntual tiene efectos mínimos en el sistema reproductivo.',
    cronico: 'El cortisol compite con la GnRH (hormona liberadora de gonadotropinas). El resultado es menos testosterona en hombres, ciclos menstruales irregulares en mujeres y reducción de la libido en ambos.',
    mecanismo: 'El hipotálamo prioriza la supervivencia (eje HPA) sobre la reproducción (eje HPG). Con cortisol cronicamente alto, el hipotálamo reduce la señal a la hipófisis para liberar FSH y LH, suprimiendo las hormonas sexuales.',
    dato: 'Mujeres con trabajos altamente estresantes tienen un 40% más de probabilidad de ciclos irregulares según estudios longitudinales.',
    sintoma: 'Libido reducida, disfunción eréctil, ciclos menstruales irregulares, dificultad para concebir.',
  },
  {
    id: 'musculos', nombre: 'Músculos y huesos', icono: '💪',
    resumen: 'A corto plazo moviliza energía muscular; a largo plazo los degrada.',
    agudo: 'El cortisol libera aminoácidos del músculo para convertirlos en glucosa (gluconeogénesis): energía rápida para correr o luchar.',
    cronico: 'El cortisol crónico acelera el catabolismo muscular (pérdida de masa muscular), reduce la absorción de calcio y frena la formación ósea, aumentando el riesgo de osteoporosis.',
    mecanismo: 'El cortisol inhibe directamente a los osteoblastos (células que forman hueso) y activa a los osteoclastos (que lo descomponen). También reduce la absorción intestinal de calcio.',
    dato: 'Personas con síndrome de Cushing (exceso patológico de cortisol) pierden hasta un 30% de densidad ósea en pocos años.',
    sintoma: 'Pérdida de masa muscular, mayor riesgo de fracturas, dolor articular, debilidad generalizada.',
  },
];

// ─────────────────────────────────────────────
// Datos: Moduladores
// ─────────────────────────────────────────────

const SUBE_CORTISOL: ModuladorItem[] = [
  { factor: 'Falta de sueño (< 6h)', icono: '🌙', explicacion: 'Una sola noche de < 6h aumenta el cortisol del día siguiente hasta un 37%. El ciclo vicioso: mal sueño → más cortisol → peor sueño.', categoria: 'estilo' },
  { factor: 'Cafeína en exceso', icono: '☕', explicacion: 'La cafeína estimula la liberación de cortisol, especialmente en ayunas. Más de 400 mg/día o café antes de comer dispara el pico matutino.', categoria: 'alimentacion' },
  { factor: 'Ejercicio muy intenso', icono: '🏋️', explicacion: 'Más de 90 minutos de ejercicio intenso sin nutrición adecuada activa el cortisol como respuesta al esfuerzo. El sobreentrenamiento crónico lo mantiene elevado.', categoria: 'estilo' },
  { factor: 'Estrés laboral crónico', icono: '💼', explicacion: 'La sensación de falta de control, plazos constantes e incertidumbre laboral activa el eje HPA de forma sostenida.', categoria: 'mental' },
  { factor: 'Dieta alta en azúcar', icono: '🍭', explicacion: 'Los picos de glucosa provocan picos de insulina y cortisol como respuesta contrarreguladora. La montaña rusa glucémica estresa el sistema endocrino.', categoria: 'alimentacion' },
  { factor: 'Pantallas antes de dormir', icono: '📱', explicacion: 'La luz azul inhibe la melatonina y mantiene el sistema de alerta activo, elevando el cortisol nocturno cuando debería estar en su mínimo.', categoria: 'estilo' },
  { factor: 'Aislamiento social', icono: '🚪', explicacion: 'La soledad crónica activa el sistema de amenaza del cerebro. Personas solas tienen niveles de cortisol vespertino más elevados que las bien conectadas socialmente.', categoria: 'social' },
  { factor: 'Ayuno prolongado (> 16h)', icono: '⏱️', explicacion: 'En personas ya bajo estrés, el ayuno prolongado activa el cortisol para mantener la glucosa. No aplica igual a todos: depende del contexto metabólico.', categoria: 'alimentacion' },
  { factor: 'Alcohol', icono: '🍷', explicacion: 'El alcohol desregula el ritmo circadiano y altera el eje HPA. Aunque inicialmente relaja, la resaca implica cortisol elevado y sueño fragmentado.', categoria: 'estilo' },
  { factor: 'Ruido crónico', icono: '🔊', explicacion: 'El ruido ambiental constante (tráfico, oficinas ruidosas) activa la respuesta de alerta de forma continua, manteniendo el cortisol elevado.', categoria: 'mental' },
];

const BAJA_CORTISOL: ModuladorItem[] = [
  { factor: 'Sueño reparador (7-9h)', icono: '🌿', explicacion: 'Un sueño regular y suficiente es el regulador más potente del cortisol. Restaura el ritmo circadiano y reduce el cortisol vespertino a sus niveles normales.', categoria: 'estilo' },
  { factor: 'Ejercicio moderado', icono: '🚶', explicacion: '30 minutos de ejercicio aeróbico moderado reduce el cortisol a largo plazo y mejora la sensibilidad a glucocorticoides. El ejercicio suave es antiinflamatorio.', categoria: 'estilo' },
  { factor: 'Meditación y respiración lenta', icono: '🧘', explicacion: 'Respirar a 5-6 respiraciones por minuto activa el nervio vago y el sistema parasimpático, reduciendo el cortisol salival de forma medible en 20 minutos.', categoria: 'mental' },
  { factor: 'Contacto social positivo', icono: '🤗', explicacion: 'La oxitocina (liberada al abrazar, conectar con amigos, reír juntos) antagoniza directamente al cortisol. Las redes sociales sólidas son protectoras del estrés.', categoria: 'social' },
  { factor: 'Naturaleza y luz solar matutina', icono: '☀️', explicacion: 'La luz solar matutina sincroniza el ritmo circadiano y favorece un CAR saludable. Pasear por la naturaleza reduce el cortisol salival en 20-30 minutos.', categoria: 'estilo' },
  { factor: 'Risas y humor', icono: '😄', explicacion: 'La risa genuina reduce el cortisol salival de forma estadísticamente significativa. El humor activa el sistema parasimpático y libera endorfinas.', categoria: 'mental' },
  { factor: 'Dieta rica en magnesio', icono: '🥜', explicacion: 'El magnesio regula los receptores de glucocorticoides. Deficiencia de magnesio (muy común) se asocia con cortisol más alto. Fuentes: frutos secos, legumbres, chocolate negro.', categoria: 'alimentacion' },
  { factor: 'Adaptógenos (con evidencia moderada)', icono: '🌿', explicacion: 'La ashwagandha y la rhodiola tienen evidencia moderada de reducción de cortisol en ensayos clínicos. No son magia, pero pueden apoyar junto a otros hábitos.', categoria: 'alimentacion' },
  { factor: 'Reducir cafeína después de las 14h', icono: '🍵', explicacion: 'La cafeína tiene una vida media de 5-7 horas. Un café a las 15h todavía bloquea la adenosina (somnolencia) a las 21h, interfiriendo con el sueño y el cortisol nocturno.', categoria: 'alimentacion' },
  { factor: 'Rutinas predecibles', icono: '📅', explicacion: 'El cerebro predice constantemente el entorno. Las rutinas reducen la incertidumbre, lo que reduce la activación del sistema de alerta y baja el cortisol basal.', categoria: 'mental' },
];

// ─────────────────────────────────────────────
// Sección 1: Ritmo circadiano
// ─────────────────────────────────────────────

function SeccionRitmo() {
  const [horaSeleccionada, setHoraSeleccionada] = useState(8);
  const [mostrarMalSueno, setMostrarMalSueno] = useState(false);

  const puntoActual = PUNTOS_CIRCADIANOS[horaSeleccionada] ?? PUNTOS_CIRCADIANOS[0];
  if (!puntoActual) return null;

  const nivelActual = mostrarMalSueno ? puntoActual.nivelMalSueno : puntoActual.nivel;

  // Generar puntos SVG de la curva
  const anchoSvg = 560;
  const altoSvg = 200;
  const margenX = 40;
  const margenY = 20;
  const anchoGrafico = anchoSvg - margenX * 2;
  const altoGrafico = altoSvg - margenY * 2;

  const xParaHora = (hora: number) => margenX + (hora / 23) * anchoGrafico;
  const yParaNivel = (nivel: number) => margenY + altoGrafico - (nivel / 100) * altoGrafico;

  const generarPath = (malSueno: boolean) => {
    const pts = PUNTOS_CIRCADIANOS.map((p, i) => {
      const x = xParaHora(i);
      const y = yParaNivel(malSueno ? p.nivelMalSueno : p.nivel);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return pts.join(' ');
  };

  const xActual = xParaHora(horaSeleccionada);
  const yActual = yParaNivel(nivelActual);

  const etiquetaNivel = nivelActual >= 70 ? 'Muy alto' : nivelActual >= 45 ? 'Alto' : nivelActual >= 25 ? 'Medio' : nivelActual >= 12 ? 'Bajo' : 'Muy bajo';

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El cortisol sigue un <strong>ritmo circadiano preciso</strong> controlado por el reloj biológico del hipotálamo. No es aleatorio: sube al despertar, baja durante el día y llega a su mínimo por la noche. Perturbarlo tiene consecuencias en cadena.</p>
      </div>

      <div className={styles.curvaZona}>
        <svg
          viewBox={`0 0 ${anchoSvg} ${altoSvg}`}
          className={styles.curvaCortisolSvg}
          role="img"
          aria-label="Gráfico de curva de cortisol a lo largo de las 24 horas"
        >
          {/* Zonas de fondo */}
          <rect x={margenX} y={margenY} width={anchoGrafico} height={altoGrafico} fill="currentColor" opacity="0.03" rx="4" />

          {/* Líneas guía horizontales */}
          {[25, 50, 75].map(n => (
            <line
              key={n}
              x1={margenX}
              y1={yParaNivel(n)}
              x2={anchoSvg - margenX}
              y2={yParaNivel(n)}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.15"
              strokeDasharray="4 4"
            />
          ))}

          {/* Etiquetas eje Y */}
          {[0, 25, 50, 75, 100].map(n => (
            <text key={n} x={margenX - 5} y={yParaNivel(n) + 4} textAnchor="end" fontSize="8" fill="currentColor" opacity="0.5">{n}%</text>
          ))}

          {/* Etiquetas eje X (horas) */}
          {[0, 6, 8, 12, 17, 22].map(h => (
            <text key={h} x={xParaHora(h)} y={altoSvg - 4} textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">{h}h</text>
          ))}

          {/* Zona CAR destacada */}
          <rect
            x={xParaHora(7)}
            y={margenY}
            width={xParaHora(9) - xParaHora(7)}
            height={altoGrafico}
            fill="#2E86AB"
            opacity="0.07"
          />
          <text x={(xParaHora(7) + xParaHora(9)) / 2} y={margenY + 12} textAnchor="middle" fontSize="7" fill="#2E86AB" fontWeight="600" opacity="0.8">CAR</text>

          {/* Curva con mal sueño (si activa) */}
          {mostrarMalSueno && (
            <path
              d={generarPath(true)}
              fill="none"
              stroke="#e74c3c"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.6"
            />
          )}

          {/* Curva normal */}
          <path
            d={generarPath(false)}
            fill="none"
            stroke="#2E86AB"
            strokeWidth="2.5"
            opacity="0.85"
          />

          {/* Área bajo la curva */}
          <path
            d={`${generarPath(false)} L ${xParaHora(23)} ${margenY + altoGrafico} L ${margenX} ${margenY + altoGrafico} Z`}
            fill="#2E86AB"
            opacity="0.08"
          />

          {/* Punto activo */}
          <circle cx={xActual} cy={yActual} r="6" fill="#2E86AB" />
          <circle cx={xActual} cy={yActual} r="10" fill="#2E86AB" opacity="0.2" />
        </svg>

        <div className={styles.curvaLeyenda}>
          <span className={styles.leyendaNormal}><span className={styles.leyendaLinea} style={{ background: '#2E86AB' }} /> Cortisol normal</span>
          {mostrarMalSueno && (
            <span className={styles.leyendaMalSueno}><span className={styles.leyendaLinea} style={{ background: '#e74c3c' }} /> Con privación de sueño</span>
          )}
          <span className={styles.leyendaCar}><span className={styles.leyendaRect} /> CAR (pico despertar)</span>
        </div>
      </div>

      <div className={styles.sliderZona}>
        <div className={styles.sliderLabel}>
          <span>Hora del día</span>
          <span className={styles.sliderValor}>{horaSeleccionada.toString().padStart(2, '0')}:00 h — Nivel: <strong>{etiquetaNivel}</strong> ({nivelActual}%)</span>
        </div>
        <input
          type="range"
          min="0"
          max="23"
          value={horaSeleccionada}
          onChange={(e) => setHoraSeleccionada(Number(e.target.value))}
          className={styles.slider}
          aria-label="Seleccionar hora del día"
        />
        <div className={styles.sliderValores}>
          <span>0h</span>
          <span>6h</span>
          <span>12h</span>
          <span>18h</span>
          <span>23h</span>
        </div>
      </div>

      <div className={styles.horarioCard}>
        <div className={styles.horarioHeader}>
          <span className={styles.horarioHora}>{horaSeleccionada.toString().padStart(2, '0')}:00 h</span>
          <div className={styles.horarioNivelBarra}>
            <div className={styles.horarioNivelFill} style={{ width: `${nivelActual}%` }} />
          </div>
          <span className={styles.horarioNivelTexto}>{nivelActual}%</span>
        </div>
        <p className={styles.horarioDesc}>{puntoActual.descripcion}</p>
        <div className={styles.horarioActividades}>
          <span className={styles.horarioActividadesLabel}>Actividades óptimas:</span>
          <span>{puntoActual.actividades}</span>
        </div>
      </div>

      <div className={styles.toggleZona}>
        <button
          type="button"
          className={`${styles.btnSecundario} ${mostrarMalSueno ? styles.btnActivo : ''}`}
          onClick={() => setMostrarMalSueno(!mostrarMalSueno)}
          aria-pressed={mostrarMalSueno}
        >
          {mostrarMalSueno ? '✅' : '👁️'} Ver con privación de sueño
        </button>
        {mostrarMalSueno && (
          <div className={styles.alerta}>
            <strong>Con privación de sueño crónica:</strong> el ritmo se aplana y desregula. El cortisol nocturno no baja lo suficiente (insomnio) y el pico matutino no alcanza la altura normal, creando un estado de fatiga-alerta constante que el cuerpo percibe como estrés continuo.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Estrés agudo vs crónico
// ─────────────────────────────────────────────

function SeccionEstres() {
  const [simulacion, setSimulacion] = useState<'ninguna' | 'agudo' | 'cronico'>('ninguna');
  const [nivelAnimado, setNivelAnimado] = useState(30);

  const simularAgudo = useCallback(() => {
    setSimulacion('agudo');
    setNivelAnimado(30);
    let t = 0;
    const intervalo = setInterval(() => {
      t++;
      if (t <= 5) {
        setNivelAnimado(30 + t * 14);
      } else if (t <= 15) {
        setNivelAnimado(Math.max(30, 100 - (t - 5) * 7));
      } else {
        setNivelAnimado(30);
        clearInterval(intervalo);
      }
    }, 200);
  }, []);

  const simularCronico = useCallback(() => {
    setSimulacion('cronico');
    setNivelAnimado(30);
    let t = 0;
    const intervalo = setInterval(() => {
      t++;
      if (t <= 8) {
        setNivelAnimado(30 + t * 6);
      } else if (t <= 20) {
        setNivelAnimado(72 + Math.sin(t) * 4);
      } else {
        clearInterval(intervalo);
      }
    }, 200);
  }, []);

  const colorNivel = nivelAnimado > 65 ? '#e74c3c' : nivelAnimado > 45 ? '#e67e22' : '#27ae60';
  const etiquetaNivel = nivelAnimado > 65 ? 'Alto' : nivelAnimado > 45 ? 'Medio-alto' : 'Normal';

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El cortisol no es malo por sí mismo. Su <strong>duración y contexto</strong> determinan si es adaptativo o dañino. El mismo mecanismo que te salva la vida en un momento de peligro puede destruir tu salud si se activa todos los días.</p>
      </div>

      {/* Simulador */}
      <div className={styles.simuladorZona}>
        <div className={styles.simuladorBarrometro}>
          <div className={styles.simuladorLabel}>Nivel de cortisol</div>
          <div className={styles.simuladorBarra}>
            <div
              className={styles.simuladorBarraFill}
              style={{ height: `${nivelAnimado}%`, background: colorNivel, transition: 'all 0.2s ease' }}
            />
          </div>
          <div className={styles.simuladorNivel} style={{ color: colorNivel }}>{etiquetaNivel}</div>
        </div>

        <div className={styles.simuladorBotones}>
          <button
            type="button"
            className={`${styles.btnPrimario} ${simulacion === 'agudo' ? styles.btnActivo : ''}`}
            onClick={simularAgudo}
            aria-label="Simular respuesta de estrés agudo"
          >
            🟢 Simular estrés agudo
          </button>
          <button
            type="button"
            className={`${styles.btnSecundario} ${simulacion === 'cronico' ? styles.btnActivo : ''}`}
            onClick={simularCronico}
            aria-label="Simular estrés crónico"
          >
            🔴 Simular estrés crónico
          </button>
        </div>
      </div>

      {/* Paneles comparativos */}
      <div className={styles.estresComparacion}>
        <div className={styles.estresPanel}>
          <div className={styles.estresPanelHeader} style={{ background: 'rgba(39,174,96,0.12)', borderColor: '#27ae60' }}>
            <span className={styles.estresPanelIcono} aria-hidden="true">🟢</span>
            <h3 className={styles.estresPanelTitulo}>Estrés agudo (adaptativo)</h3>
          </div>
          <dl className={styles.estresPanelLista}>
            <div className={styles.estresItem}><dt>Duración</dt><dd>Minutos a horas</dd></div>
            <div className={styles.estresItem}><dt>Desencadenante</dt><dd>Amenaza real, examen, competición, emergencia</dd></div>
            <div className={styles.estresItem}><dt>Efectos inmediatos</dt><dd>↑ glucosa, ↑ frecuencia cardíaca, ↑ atención, ↑ inmunidad a corto plazo</dd></div>
            <div className={styles.estresItem}><dt>Recuperación</dt><dd>El cortisol vuelve a basal en 1-2 horas</dd></div>
            <div className={styles.estresItem}><dt>Función evolutiva</dt><dd>Fight-or-flight ante un depredador o emergencia vital</dd></div>
            <div className={styles.estresItem}><dt>Consecuencias</dt><dd className={styles.itemVerde}>Ninguna si la recuperación es completa. Puede mejorar el rendimiento.</dd></div>
          </dl>
        </div>

        <div className={styles.estresPanel}>
          <div className={styles.estresPanelHeader} style={{ background: 'rgba(231,76,60,0.1)', borderColor: '#e74c3c' }}>
            <span className={styles.estresPanelIcono} aria-hidden="true">🔴</span>
            <h3 className={styles.estresPanelTitulo}>Estrés crónico (dañino)</h3>
          </div>
          <dl className={styles.estresPanelLista}>
            <div className={styles.estresItem}><dt>Duración</dt><dd>Semanas a meses (o años)</dd></div>
            <div className={styles.estresItem}><dt>Desencadenante</dt><dd>Trabajo, deudas, relaciones, pantallas, falta de sueño crónica</dd></div>
            <div className={styles.estresItem}><dt>Efectos acumulativos</dt><dd>↓ inmunidad, ↑ inflamación, ↑ tensión arterial, ↑ grasa abdominal, ↓ memoria</dd></div>
            <div className={styles.estresItem}><dt>Recuperación</dt><dd>No hay: el cortisol nunca vuelve a basal</dd></div>
            <div className={styles.estresItem}><dt>Origen moderno</dt><dd>El cerebro no distingue un correo amenazante de un depredador real</dd></div>
            <div className={styles.estresItem}><dt>Consecuencias</dt><dd className={styles.itemRojo}>↓ libido, ↓ sueño profundo, encogimiento del hipocampo, burnout</dd></div>
          </dl>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El problema del estrés crónico moderno es que <strong>el cerebro no distingue</strong> un correo agresivo del jefe de un depredador. Para el hipotálamo, ambos son amenazas que activan el mismo eje HPA. La diferencia es que el depredador desaparecía; el correo vuelve mañana.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: 8 sistemas del cuerpo
// ─────────────────────────────────────────────

function SeccionSistemas() {
  const [sistemaActivo, setSistemaActivo] = useState<string | null>(null);
  const seleccionado = SISTEMAS_CORPORALES.find(s => s.id === sistemaActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El cortisol tiene receptores en <strong>prácticamente todos los tejidos del cuerpo</strong>. Por eso el estrés crónico afecta a tantos sistemas a la vez. Haz clic en cada sistema para ver el mecanismo detallado.</p>
      </div>

      <div className={styles.sistemasGrid}>
        {SISTEMAS_CORPORALES.map(s => (
          <button
            key={s.id}
            type="button"
            className={`${styles.efectoCard} ${sistemaActivo === s.id ? styles.efectoCardActiva : ''}`}
            onClick={() => setSistemaActivo(sistemaActivo === s.id ? null : s.id)}
            aria-expanded={sistemaActivo === s.id}
            aria-label={`Ver detalles de ${s.nombre}`}
          >
            <span className={styles.efectoIcono} aria-hidden="true">{s.icono}</span>
            <h4 className={styles.efectoNombre}>{s.nombre}</h4>
            <p className={styles.efectoResumen}>{s.resumen}</p>
          </button>
        ))}
      </div>

      {seleccionado && (
        <div className={styles.sistemaDetalle}>
          <div className={styles.sistemaDetalleHeader}>
            <span aria-hidden="true">{seleccionado.icono}</span>
            <h3>{seleccionado.nombre}</h3>
          </div>

          <div className={styles.sistemaDetalleGrid}>
            <div className={styles.sistemaDetalleBloque} style={{ borderLeftColor: '#27ae60' }}>
              <h4>Estrés agudo</h4>
              <p>{seleccionado.agudo}</p>
            </div>
            <div className={styles.sistemaDetalleBloque} style={{ borderLeftColor: '#e74c3c' }}>
              <h4>Estrés crónico</h4>
              <p>{seleccionado.cronico}</p>
            </div>
          </div>

          <div className={styles.sistemaDetalleMecanismo}>
            <strong>Mecanismo:</strong> {seleccionado.mecanismo}
          </div>
          <div className={styles.sistemaDetalleDato}>
            <span aria-hidden="true">🔬</span> <strong>Dato científico:</strong> {seleccionado.dato}
          </div>
          <div className={styles.sistemaDetalleSintoma}>
            <span aria-hidden="true">⚠️</span> <strong>Síntomas posibles:</strong> {seleccionado.sintoma}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Moduladores
// ─────────────────────────────────────────────

type CategoriaFiltro = 'todos' | 'estilo' | 'alimentacion' | 'mental' | 'social';

const CATEGORIAS: { id: CategoriaFiltro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'estilo', label: 'Estilo de vida' },
  { id: 'alimentacion', label: 'Alimentación' },
  { id: 'mental', label: 'Mental' },
  { id: 'social', label: 'Social' },
];

function SeccionModuladores() {
  const [filtro, setFiltro] = useState<CategoriaFiltro>('todos');

  const filtrar = (items: ModuladorItem[]) =>
    filtro === 'todos' ? items : items.filter(i => i.categoria === filtro);

  const subesFiltrados = filtrar(SUBE_CORTISOL);
  const bajasFiltradas = filtrar(BAJA_CORTISOL);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>No podemos eliminar el cortisol (ni queremos: sin él moriríamos). Pero sí podemos <strong>modular sus niveles</strong> con hábitos cotidianos. Aquí los factores con más evidencia científica.</p>
      </div>

      <div className={styles.filtrosZona}>
        {CATEGORIAS.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.filtroBtn} ${filtro === c.id ? styles.filtroActivo : ''}`}
            onClick={() => setFiltro(c.id)}
            aria-pressed={filtro === c.id}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.moduladoresGrid}>
        <div className={styles.moduladoresColumna}>
          <div className={styles.moduladoresColumnaTitulo} style={{ color: '#e74c3c' }}>
            <span aria-hidden="true">🔴</span> Sube el cortisol
          </div>
          {subesFiltrados.length === 0 && (
            <p className={styles.sinResultados}>Sin factores en esta categoría</p>
          )}
          {subesFiltrados.map((m, i) => (
            <ModuladorCard key={i} item={m} tipo="sube" />
          ))}
        </div>

        <div className={styles.moduladoresColumna}>
          <div className={styles.moduladoresColumnaTitulo} style={{ color: '#27ae60' }}>
            <span aria-hidden="true">🟢</span> Baja el cortisol
          </div>
          {bajasFiltradas.length === 0 && (
            <p className={styles.sinResultados}>Sin factores en esta categoría</p>
          )}
          {bajasFiltradas.map((m, i) => (
            <ModuladorCard key={i} item={m} tipo="baja" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuladorCard({ item, tipo }: { item: ModuladorItem; tipo: 'sube' | 'baja' }) {
  const [expandido, setExpandido] = useState(false);
  const color = tipo === 'sube' ? '#e74c3c' : '#27ae60';

  return (
    <div
      className={styles.moduladorCard}
      style={{ borderLeftColor: color }}
      onClick={() => setExpandido(!expandido)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandido(!expandido); } }}
      tabIndex={0}
      role="button"
      aria-expanded={expandido}
      aria-label={`${item.factor}: ${expandido ? 'cerrar' : 'ver explicación'}`}
    >
      <div className={styles.moduladorCardHeader}>
        <span className={styles.moduladorIcono} aria-hidden="true">{item.icono}</span>
        <span className={styles.moduladorFactor}>{item.factor}</span>
        <span className={styles.moduladorChevron} aria-hidden="true">{expandido ? '▲' : '▼'}</span>
      </div>
      {expandido && (
        <p className={styles.moduladorExplicacion}>{item.explicacion}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCortisolPage() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('ritmo');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'ritmo': return <SeccionRitmo />;
      case 'estres': return <SeccionEstres />;
      case 'sistemas': return <SeccionSistemas />;
      case 'moduladores': return <SeccionModuladores />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Fisiología del estrés</span>
            <h1 className={styles.heroTitle}>El Cortisol</h1>
            <p className={styles.heroSubtitle}>La hormona del estrés en profundidad</p>
            <p className={styles.heroDesc}>Ritmo circadiano hora a hora, diferencia entre estrés agudo y crónico, efectos en 8 sistemas del cuerpo y qué hábitos lo modulan.</p>
          </div>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="medical"
          severity="high"
        />

        {/* Navegación de secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
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

        {/* Cabecera de sección */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.sectionSubtitle}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el cortisol"
          subtitle="El eje HPA, paradojas y enfermedades relacionadas"
          defaultOpen={false}
        >
          <h3>El eje HPA: hipotálamo → hipófisis → suprarrenales</h3>
          <p>
            Cuando el cerebro detecta una amenaza, el <strong>hipotálamo</strong> libera CRH (hormona liberadora de corticotropina).
            La CRH viaja a la <strong>hipófisis anterior</strong>, que libera ACTH (hormona adrenocorticotropa).
            La ACTH llega por sangre a la <strong>corteza suprarrenal</strong>, que produce cortisol.
            El cortisol actúa sobre todo el cuerpo y, cuando sube lo suficiente, <strong>frena al hipotálamo</strong> (feedback negativo).
            En estrés crónico, este freno no funciona correctamente.
          </p>

          <h3>Por qué el cortisol es indispensable</h3>
          <p>
            Sin cortisol, el cuerpo no puede responder al estrés mínimo ni mantener la presión arterial.
            La <strong>enfermedad de Addison</strong> (insuficiencia suprarrenal) es potencialmente fatal:
            una infección leve puede desencadenar una crisis addisoniana. Las personas con Addison deben llevar cortisol inyectable de emergencia.
            El cortisol también regula la glucosa en ayunas, la tensión arterial basal y el sistema inmune.
          </p>

          <h3>Síndrome de Cushing: el exceso patológico</h3>
          <p>
            El <strong>síndrome de Cushing</strong> ocurre cuando el cortisol está crónicamente elevado por causas patológicas
            (tumor en hipófisis o suprarrenales, o uso prolongado de corticoides). Los síntomas son
            obesidad central, cara &ldquo;de luna llena&rdquo;, estrías moradas, osteoporosis, hipertensión y diabetes.
            Es el caso extremo de lo que el estrés crónico produce de forma más suave.
          </p>

          <h3>Cortisol y memoria: el efecto de consolidación</h3>
          <p>
            El cortisol agudo <strong>mejora la consolidación de la memoria a corto plazo</strong>. Por eso los momentos emocionalmente intensos (accidentes, noticias impactantes, exámenes) se recuerdan con más detalle.
            El hipocampo tiene receptores de glucocorticoides en alta densidad y trabaja mejor con un pico de cortisol puntual.
            Pero el cortisol crónico hace lo contrario: daña las neuronas del hipocampo y reduce su volumen.
          </p>

          <h3>La paradoja del CAR matutino</h3>
          <p>
            El <strong>Cortisol Awakening Response (CAR)</strong> puede parecer un problema (cortisol alto al despertar),
            pero es en realidad una preparación sana: el cuerpo activa los sistemas metabólico, inmune y cognitivo para afrontar el día.
            Un CAR bien definido (pico pronunciado seguido de descenso) es signo de salud del eje HPA.
            Un CAR aplanado (poco pico) se asocia con burnout, fatiga crónica y depresión.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota importante:</strong> este visualizador tiene fines educativos. Los niveles de cortisol son relativos y varían enormemente entre personas según edad, sexo, ciclo menstrual, medicamentos y estado de salud. Si sospechas de una alteración del cortisol (síntomas de Cushing o Addison), consulta a un médico endocrinólogo. No te autodiagnostiques basándote en síntomas aislados.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cortisol')} />
        <ShareCard appName="visualizador-cortisol" />
        <Footer appName="visualizador-cortisol" />
    </div>
  );
}
