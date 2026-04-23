'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorCatalasa.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

interface SustanciaExperimento {
  id: string;
  nombre: string;
  emoji: string;
  actividad: number;
  cantidadBurbujas: number;
  descripcion: string;
  explicacion: string;
}

const SUSTANCIAS: SustanciaExperimento[] = [
  {
    id: 'higado-crudo',
    nombre: 'Hígado crudo',
    emoji: '🥩',
    actividad: 100,
    cantidadBurbujas: 12,
    descripcion: 'Alta concentración de catalasa',
    explicacion: 'El hígado tiene una de las mayores concentraciones de catalasa del cuerpo. La reacción con H₂O₂ es vigorosa: se observan burbujas intensas de oxígeno gaseoso.',
  },
  {
    id: 'patata-cruda',
    nombre: 'Patata cruda',
    emoji: '🥔',
    actividad: 40,
    cantidadBurbujas: 5,
    descripcion: 'Catalasa presente, menor concentración',
    explicacion: 'Las patatas también contienen catalasa, aunque en menor concentración que el hígado. Se observan burbujas moderadas. Es una alternativa vegetariana para el experimento escolar.',
  },
  {
    id: 'higado-cocido',
    nombre: 'Hígado cocido',
    emoji: '🍳',
    actividad: 2,
    cantidadBurbujas: 0,
    descripcion: 'Catalasa desnaturalizada por calor',
    explicacion: 'La cocción (>80°C) desnaturaliza la catalasa: las proteínas pierden su estructura tridimensional y ya no pueden unirse al sustrato (H₂O₂). Sin enzima activa, prácticamente no hay reacción.',
  },
  {
    id: 'solo-agua',
    nombre: 'Solo agua',
    emoji: '💧',
    actividad: 0,
    cantidadBurbujas: 0,
    descripcion: 'Control sin enzima',
    explicacion: 'Sin enzima, el H₂O₂ se descompone espontáneamente pero a una velocidad extremadamente lenta — miles de millones de veces más despacio que con catalasa. Control negativo del experimento.',
  },
];

const APLICACIONES_INDUSTRIALES = [
  {
    icono: '🧵',
    titulo: 'Industria textil',
    descripcion: 'Elimina el H₂O₂ residual tras el blanqueado de telas. Más eficiente y ecológica que los neutralizantes químicos tradicionales.',
  },
  {
    icono: '🥛',
    titulo: 'Industria alimentaria',
    descripcion: 'Producción de queso (elimina H₂O₂ de la pasteurización en frío) y conservación de alimentos procesados.',
  },
  {
    icono: '🩺',
    titulo: 'Medicina: apósitos',
    descripcion: 'Apósitos con catalasa para heridas, reduciendo el daño oxidativo en tejidos en regeneración activa.',
  },
  {
    icono: '🔬',
    titulo: 'Biosensores',
    descripcion: 'Detección de H₂O₂ en diagnóstico clínico. La catalasa permite biosensores de alta sensibilidad y especificidad.',
  },
  {
    icono: '🌿',
    titulo: 'Medio ambiente',
    descripcion: 'Biorremediación: eliminación de H₂O₂ residual de efluentes industriales sin añadir más compuestos químicos.',
  },
  {
    icono: '💄',
    titulo: 'Cosmética',
    descripcion: 'Productos anti-envejecimiento con enzimas antioxidantes. La catalasa reduce el H₂O₂ que blanquea el cabello con la edad.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCatalasa() {
  // Bloque 1: animación reacción
  const [reaccionActiva, setReaccionActiva] = useState(false);
  const [contador, setContador] = useState(0);
  const contadorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Bloque 3: experimento
  const [sustanciaSeleccionada, setSustanciaSeleccionada] = useState<string>('higado-crudo');

  const sustanciaActual = SUSTANCIAS.find((s) => s.id === sustanciaSeleccionada) ?? SUSTANCIAS[0];

  const activarReaccion = () => {
    setReaccionActiva(true);
    setContador(0);

    if (contadorRef.current) clearInterval(contadorRef.current);

    const objetivo = 40_000_000;
    const duracion = 2000;
    const pasos = 80;
    const incremento = objetivo / pasos;
    let paso = 0;

    contadorRef.current = setInterval(() => {
      paso++;
      setContador(Math.min(Math.round(incremento * paso), objetivo));
      if (paso >= pasos && contadorRef.current) {
        clearInterval(contadorRef.current);
        contadorRef.current = null;
      }
    }, duracion / pasos);
  };

  const reiniciarReaccion = () => {
    setReaccionActiva(false);
    setContador(0);
    if (contadorRef.current) {
      clearInterval(contadorRef.current);
      contadorRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (contadorRef.current) clearInterval(contadorRef.current);
    };
  }, []);

  const formatearContador = (n: number) => n.toLocaleString('es-ES');

  // Generar burbujas para el tubo de ensayo
  const burbujasTubo = Array.from({ length: 8 }, (_, i) => i);

  // Generar burbujas del experimento
  const burbujasExperimento = Array.from(
    { length: sustanciaActual.cantidadBurbujas },
    (_, i) => i
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroEmoji} aria-hidden="true">⚗️</div>
        <h1>Catalasa</h1>
        <p className={styles.heroSubtitulo}>La enzima más rápida del cuerpo humano</p>
        <p className={styles.heroDesc}>
          40 millones de reacciones por segundo · Peroxisomas · Experimento clásico con H₂O₂
        </p>
      </header>

      <LegalNotice />

      {/* ── BLOQUE 1: La reacción ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitulo}>La Reacción: 40 Millones por Segundo</h2>
        <p className={styles.sectionDesc}>
          La catalasa cataliza la descomposición del peróxido de hidrógeno (H₂O₂) en agua y oxígeno.
          Es la enzima con mayor número de recambio conocida en la biología.
        </p>

        <div className={styles.ecuacionContainer}>
          <div className={styles.ecuacionQuimica}>
            <span className={styles.reactivo}>2H₂O₂</span>
            <span className={styles.flecha}>→</span>
            <span className={styles.producto}>2H₂O</span>
            <span className={styles.mas}>+</span>
            <span className={styles.producto}>O₂</span>
          </div>
          <p className={styles.ecuacionLabel}>
            <span className={styles.catalasaLabel}>catalasa</span>
            (enzima)
          </p>
        </div>

        <div className={styles.reaccionDemo}>
          {/* Tubo de ensayo SVG */}
          <div className={styles.tuboWrapper}>
            <svg
              className={styles.tuboEnsayo}
              viewBox="0 0 80 200"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Tubo de ensayo con reacción"
            >
              {/* Tubo */}
              <rect x="15" y="10" width="50" height="160" rx="25" ry="25"
                fill="rgba(126,190,220,0.2)" stroke="#2E86AB" strokeWidth="2.5" />
              {/* Líquido */}
              <rect x="17" y="80" width="46" height="88" rx="22" ry="22"
                fill="rgba(126,190,220,0.35)" />
              {/* Burbujas animadas (solo cuando la reacción está activa) */}
              {reaccionActiva && burbujasTubo.map((i) => (
                <circle
                  key={i}
                  className={styles.burbujaTubo}
                  cx={22 + (i % 4) * 11}
                  cy={160}
                  r={3 + (i % 3)}
                  fill="rgba(255,255,255,0.8)"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              ))}
            </svg>
          </div>

          <div className={styles.reaccionInfo}>
            <div className={styles.contadorReacciones}>
              <span className={styles.contadorLabel}>Reacciones por segundo:</span>
              <span className={styles.contadorNumero} aria-live="polite">
                {formatearContador(contador)}
              </span>
              {reaccionActiva && contador === 40_000_000 && (
                <span className={styles.contadorMax}>¡Velocidad máxima!</span>
              )}
            </div>

            <div className={styles.botonesReaccion}>
              <button
                className={styles.btnActivar}
                onClick={activarReaccion}
                disabled={reaccionActiva}
                aria-label="Activar reacción de la catalasa"
              >
                {reaccionActiva ? '⚗️ Reacción activa' : '▶ Activar reacción'}
              </button>
              {reaccionActiva && (
                <button
                  className={styles.btnReiniciar}
                  onClick={reiniciarReaccion}
                  aria-label="Reiniciar simulación"
                >
                  ↺ Reiniciar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tarjetaComparativa}>
          <p className={styles.tarjetaComparativaTexto}>
            <strong>Para contexto:</strong> una enzima &laquo;normal&raquo; cataliza ~1.000 reacciones/segundo.
            La catalasa: <strong>40.000.000/segundo</strong>.
            Es <strong>~40.000 veces más rápida</strong> que el promedio enzimático.
          </p>
        </div>
      </section>

      {/* ── BLOQUE 2: Por qué el H₂O₂ es peligroso ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitulo}>¿Por Qué el H₂O₂ es Peligroso?</h2>
        <p className={styles.sectionDesc}>
          El peróxido de hidrógeno no es solo agua oxigenada del botiquín.
          En la célula es una amenaza constante que la catalasa debe neutralizar.
        </p>

        <div className={styles.gridDano}>
          <div className={styles.danoCarta}>
            <div className={styles.danoIcono} aria-hidden="true">⚡</div>
            <h3 className={styles.danoTitulo}>Origen del H₂O₂</h3>
            <p className={styles.danoTexto}>
              El metabolismo aeróbico produce H₂O₂ como subproducto inevitable.
              Las mitocondrias, durante la respiración celular, &laquo;filtran&raquo; electrones
              que reaccionan con el oxígeno produciendo superóxido → que se convierte en H₂O₂.
            </p>
          </div>

          <div className={styles.danoCarta}>
            <div className={styles.danoIcono} aria-hidden="true">🔥</div>
            <h3 className={styles.danoTitulo}>El daño del H₂O₂</h3>
            <p className={styles.danoTexto}>
              El H₂O₂ es una especie reactiva de oxígeno (ROS). Puede oxidar proteínas,
              lípidos de membrana y dañar el ADN directamente.
              El daño oxidativo acumulado es uno de los mecanismos moleculares del envejecimiento celular.
            </p>
          </div>

          <div className={styles.danoCarta}>
            <div className={styles.danoIcono} aria-hidden="true">🛡️</div>
            <h3 className={styles.danoTitulo}>La solución: catalasa</h3>
            <p className={styles.danoTexto}>
              Localizada en los peroxisomas (orgánulo especializado en oxidaciones),
              la catalasa convierte el H₂O₂ en agua y oxígeno inofensivos.
              Una sola molécula puede procesar <strong>6 millones de moléculas de H₂O₂ por minuto</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── BLOQUE 3: Experimento clásico ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitulo}>El Experimento Clásico</h2>
        <p className={styles.sectionDesc}>
          El experimento del hígado (o patata) con H₂O₂ es uno de los más famosos de biología escolar.
          Selecciona una sustancia y observa cómo cambia la actividad enzimática.
        </p>

        <div className={styles.selectorSustancia} role="group" aria-label="Seleccionar sustancia para el experimento">
          {SUSTANCIAS.map((s) => (
            <button
              key={s.id}
              className={`${styles.btnSustancia} ${sustanciaSeleccionada === s.id ? styles.btnSustanciaActivo : ''}`}
              onClick={() => setSustanciaSeleccionada(s.id)}
              aria-pressed={sustanciaSeleccionada === s.id}
            >
              <span aria-hidden="true">{s.emoji}</span>
              <span>{s.nombre}</span>
              <span className={styles.btnSustanciaDesc}>{s.descripcion}</span>
            </button>
          ))}
        </div>

        <div className={styles.experimentoVisual}>
          {/* Vaso con burbujas */}
          <div className={styles.vasoContainer}>
            <svg
              className={styles.vasoReaccion}
              viewBox="0 0 120 180"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={`Vaso con ${sustanciaActual.nombre}`}
            >
              {/* Vaso */}
              <path
                d="M20,20 L10,160 Q10,170 20,170 L100,170 Q110,170 110,160 L100,20 Z"
                fill="rgba(126,190,220,0.15)"
                stroke="#2E86AB"
                strokeWidth="2.5"
              />
              {/* Líquido */}
              <path
                d="M22,80 L13,160 Q13,167 22,167 L98,167 Q107,167 107,160 L98,80 Z"
                fill="rgba(72,169,166,0.3)"
              />
              {/* Sustancia */}
              <rect x="35" y="140" width="50" height="20" rx="4"
                fill={sustanciaActual.id === 'solo-agua' ? 'rgba(126,190,220,0.3)' : 'rgba(200,140,100,0.6)'}
              />
              {/* Burbujas */}
              {burbujasExperimento.map((i) => (
                <circle
                  key={i}
                  className={styles.burbujaVaso}
                  cx={30 + (i % 5) * 14}
                  cy={155}
                  r={2.5 + (i % 3) * 0.8}
                  fill="rgba(255,255,255,0.85)"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </svg>
            <p className={styles.vasoLabel}>{sustanciaActual.emoji} {sustanciaActual.nombre}</p>
          </div>

          {/* Información y barra */}
          <div className={styles.experimentoInfo}>
            <div className={styles.barraActividadContainer}>
              <div className={styles.barraActividadLabel}>
                <span>Actividad enzimática</span>
                <strong>{sustanciaActual.actividad}%</strong>
              </div>
              <div
                className={styles.barraActividadFondo}
                role="progressbar"
                aria-valuenow={sustanciaActual.actividad}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Nivel de actividad enzimática"
              >
                <div
                  className={styles.barraActividadRelleno}
                  style={{ width: `${sustanciaActual.actividad}%` }}
                />
              </div>
              <div className={styles.barraActividadEscala}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className={styles.experimentoExplicacion}>
              <p>{sustanciaActual.explicacion}</p>
            </div>
          </div>
        </div>

        <div className={styles.tarjetaTemperatura}>
          <span className={styles.tarjetaTemperaturaIcono} aria-hidden="true">🌡️</span>
          <p>
            <strong>Temperatura crítica:</strong> La catalasa humana pierde actividad por encima de ~55°C.
            La cocción (&gt;80°C) la inactiva completamente al desnaturalizar su estructura proteica.
          </p>
        </div>
      </section>

      {/* ── BLOQUE 4: Usos industriales ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitulo}>Usos Industriales de la Catalasa</h2>
        <p className={styles.sectionDesc}>
          La capacidad de neutralizar H₂O₂ de forma eficiente y ecológica ha convertido a la
          catalasa en una enzima industrial de primer orden.
        </p>

        <div className={styles.gridAplicaciones}>
          {APLICACIONES_INDUSTRIALES.map((app) => (
            <div key={app.titulo} className={styles.aplicacionCard}>
              <div className={styles.aplicacionIcono} aria-hidden="true">{app.icono}</div>
              <h3 className={styles.aplicacionTitulo}>{app.titulo}</h3>
              <p className={styles.aplicacionDesc}>{app.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Profundiza en la catalasa"
        subtitle="Estructura, peroxisomas y química del oxígeno reactivo"
      >
        <div className={styles.educContent}>
          <h3>La estructura tetramérica de la catalasa</h3>
          <p>
            La catalasa es una proteína tetramérica: está formada por 4 subunidades idénticas,
            cada una con un grupo prostético <strong>hemo</strong> (hierro — igual que la hemoglobina).
            El hierro del grupo hemo es el sitio activo que cataliza la reacción con el H₂O₂.
            El peso molecular total es de ~240.000 Da, convirtiéndola en una de las enzimas más grandes conocidas.
          </p>

          <h3>Peroxisomas: el orgánulo especializado</h3>
          <p>
            La catalasa se concentra en los <strong>peroxisomas</strong>, orgánulos con membrana simple
            cuya función principal es realizar reacciones de oxidación — y neutralizar sus subproductos tóxicos.
            Los peroxisomas son especialmente abundantes en el hígado y los riñones, órganos con alta
            actividad metabólica y mayor exposición a tóxicos.
          </p>

          <h3>Superóxido dismutasa (SOD): la enzima compañera</h3>
          <p>
            La catalasa no trabaja sola. La <strong>superóxido dismutasa (SOD)</strong> convierte primero
            el radical superóxido (O₂⁻) en H₂O₂. Luego la catalasa convierte ese H₂O₂ en agua y oxígeno.
            Juntas forman el sistema antioxidante enzimático fundamental de las células aeróbicas.
          </p>

          <h3>Acatalasemia: el déficit de catalasa</h3>
          <p>
            La <strong>acatalasemia</strong> (o acatalasia) es una enfermedad genética rara por mutaciones
            en el gen CAT (cromosoma 11p13). Las personas afectadas tienen muy poca catalasa funcional.
            Curiosamente, muchos no presentan síntomas graves — lo que sugiere que otros sistemas
            antioxidantes pueden compensar parcialmente su ausencia.
          </p>

          <h3>Por qué el pelo se vuelve blanco: la catalasa y el envejecimiento</h3>
          <p>
            Con el envejecimiento, la producción de catalasa en los folículos pilosos disminuye.
            El H₂O₂ se acumula progresivamente en el folículo y oxida la melanina (el pigmento del cabello),
            decolorándolo desde dentro. Un estudio publicado en <em>FASEB Journal</em> (2009)
            demostró que el pelo blanco acumula concentraciones muy superiores de H₂O₂ que el pelo pigmentado.
            Este hallazgo ha impulsado la investigación en tratamientos tópicos con catalasa.
          </p>

          <div className={styles.warningBox} role="note">
            <strong>Nota:</strong> Contenido educativo de bioquímica. La reacción del experimento
            es segura en contexto educativo supervisado — el agua oxigenada doméstica (3-6%)
            es de baja concentración. Para usos de laboratorio, seguir los protocolos de seguridad apropiados.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-catalasa')} />
      <ShareCard appName="visualizador-catalasa" />
      <Footer appName="visualizador-catalasa" />
    </div>
  );
}
