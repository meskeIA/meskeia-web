'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './ChecklistTramitesDependencia.module.css';
import {
  MeskeiaLogo,
  Footer,
  RelatedApps,
  LegalNotice,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ──────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────
interface ChecklistItem {
  id: string;
  texto: string;
  nota?: string;
  critico?: boolean;
}

interface FaseConfig {
  id: string;
  titulo: string;
  icono: string;
  plazo: string;
  items: ChecklistItem[];
}

// ──────────────────────────────────────────
// DATOS — FASES DEL PROCESO
// ──────────────────────────────────────────
const FASES: FaseConfig[] = [
  {
    id: 'fase-1',
    titulo: 'Preparación previa',
    icono: '📋',
    plazo: '1-2 semanas',
    items: [
      { id: 'f1-dni', texto: 'Recopilar DNI/NIE de la persona dependiente' },
      { id: 'f1-informe', texto: 'Solicitar informe médico actualizado al médico de cabecera', nota: 'Debe describir limitaciones funcionales concretas, no solo el diagnóstico' },
      { id: 'f1-empadronamiento', texto: 'Obtener certificado de empadronamiento' },
      { id: 'f1-discapacidad', texto: 'Si existe, recopilar certificado de discapacidad' },
      { id: 'f1-cuidador', texto: 'Anotar datos de contacto del cuidador principal' },
    ],
  },
  {
    id: 'fase-2',
    titulo: 'Solicitud formal',
    icono: '📝',
    plazo: '1-2 semanas',
    items: [
      { id: 'f2-formulario', texto: 'Descargar formulario de solicitud de la CCAA', nota: 'Disponible en la web de Servicios Sociales autonómicos' },
      { id: 'f2-rellenar', texto: 'Rellenar formulario con datos del solicitante y representante' },
      { id: 'f2-adjuntar', texto: 'Adjuntar toda la documentación preparada' },
      { id: 'f2-presentar', texto: 'Presentar la solicitud (presencial, correo certificado u online según CCAA)' },
      { id: 'f2-copia', texto: 'Guardar copia sellada con fecha de registro', nota: 'CRÍTICO: los derechos económicos cuentan desde esta fecha', critico: true },
    ],
  },
  {
    id: 'fase-3',
    titulo: 'Valoración presencial',
    icono: '🏠',
    plazo: '1-6 meses tras la solicitud',
    items: [
      { id: 'f3-citacion', texto: 'Recibir citación para la visita del valorador' },
      { id: 'f3-domicilio', texto: 'Preparar el domicilio para la visita', nota: 'Que la persona esté en condiciones habituales, no en su mejor momento' },
      { id: 'f3-medicacion', texto: 'Tener disponible la medicación y documentación médica' },
      { id: 'f3-cuidador', texto: 'Asegurar que el cuidador principal esté presente' },
      { id: 'f3-describir', texto: 'Describir al valorador la situación del día a día', nota: 'Describir los peores momentos, no los mejores — es el error más frecuente' },
    ],
  },
  {
    id: 'fase-4',
    titulo: 'Resolución del grado',
    icono: '📄',
    plazo: 'Plazo legal: 6 meses desde la solicitud',
    items: [
      { id: 'f4-resolucion', texto: 'Recibir la resolución de grado' },
      { id: 'f4-grado', texto: 'Revisar el grado reconocido (Grado I, II o III)' },
      { id: 'f4-recurso', texto: 'Si no se está de acuerdo: presentar recurso de alzada en 1 mes', nota: 'Acompañar de informes médicos adicionales que justifiquen un grado mayor' },
    ],
  },
  {
    id: 'fase-5',
    titulo: 'Plan Individualizado de Atención (PIA)',
    icono: '🤝',
    plazo: 'Variable según CCAA',
    items: [
      { id: 'f5-reunion', texto: 'Reunión con trabajador social para elaborar el PIA' },
      { id: 'f5-modalidad', texto: 'Elegir modalidad de prestación/servicio', nota: 'Opciones: PEVS, PECEF, SAD, teleasistencia, centro de día, residencia...' },
      { id: 'f5-firmar', texto: 'Firmar el PIA acordado' },
    ],
  },
  {
    id: 'fase-6',
    titulo: 'Inicio de la prestación',
    icono: '✅',
    plazo: 'Variable',
    items: [
      { id: 'f6-confirmar', texto: 'Confirmar inicio del servicio o cobro de la prestación' },
      { id: 'f6-importe', texto: 'Verificar el importe', nota: 'Incluye retroactivo desde la fecha de solicitud (por eso guardar la copia sellada es crítico)' },
      { id: 'f6-documentacion', texto: 'Guardar toda la documentación para futuras revisiones' },
      { id: 'f6-cambios', texto: 'Comunicar cualquier cambio de situación', nota: 'Mudanza, mejora, empeoramiento, cambio de cuidador, fallecimiento...' },
    ],
  },
];

const STORAGE_KEY = 'meskeia-checklist-dependencia';
const EXPANDED_KEY = 'meskeia-checklist-dependencia-expanded';

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────
function getAllItemIds(): string[] {
  return FASES.flatMap(fase => fase.items.map(item => item.id));
}

function loadCheckedState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch { /* ignorar */ }
  return {};
}

function loadExpandedState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch { /* ignorar */ }
  // Por defecto, todas las fases expandidas
  const defaults: Record<string, boolean> = {};
  FASES.forEach(f => { defaults[f.id] = true; });
  return defaults;
}

// ──────────────────────────────────────────
// COMPONENTE
// ──────────────────────────────────────────
export default function ChecklistTramitesDependenciaPage() {
  const [itemsChecked, setItemsChecked] = useState<Record<string, boolean>>({});
  const [expandedFases, setExpandedFases] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Hidratar estado desde localStorage
  useEffect(() => {
    setItemsChecked(loadCheckedState());
    setExpandedFases(loadExpandedState());
    setHydrated(true);
  }, []);

  // Guardar estado en localStorage cuando cambia
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsChecked));
    } catch { /* storage lleno */ }
  }, [itemsChecked, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(EXPANDED_KEY, JSON.stringify(expandedFases));
    } catch { /* storage lleno */ }
  }, [expandedFases, hydrated]);

  const allIds = getAllItemIds();
  const totalItems = allIds.length;
  const itemsCompletados = allIds.filter(id => itemsChecked[id]).length;
  const porcentaje = totalItems > 0 ? Math.round((itemsCompletados / totalItems) * 100) : 0;
  const todoCompleto = itemsCompletados === totalItems && totalItems > 0;

  const toggleItem = useCallback((id: string) => {
    setItemsChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleFase = useCallback((faseId: string) => {
    setExpandedFases(prev => ({ ...prev, [faseId]: !prev[faseId] }));
  }, []);

  const reiniciar = () => {
    if (window.confirm('¿Reiniciar toda la checklist? Se perderá el progreso actual.')) {
      setItemsChecked({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const faseCompletada = (fase: FaseConfig): boolean => {
    return fase.items.every(item => itemsChecked[item.id]);
  };

  const faseProgreso = (fase: FaseConfig): { completados: number; total: number } => {
    const completados = fase.items.filter(item => itemsChecked[item.id]).length;
    return { completados, total: fase.items.length };
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">✅</span> Checklist de Trámites de Dependencia
          </h1>
          <p className={styles.subtitle}>
            Guía paso a paso para solicitar la valoración de dependencia en España
          </p>
        </header>

        <LegalNotice />

        {/* Disclaimer */}
        <DisclaimerCard variant="general" severity="critical">
          Esta guía es <strong>orientativa</strong> y refleja el proceso general en España.
          Los requisitos, plazos y formularios específicos varían según la Comunidad Autónoma.
          Consulta siempre con los <strong>Servicios Sociales de tu municipio</strong> para
          confirmar los pasos exactos en tu localidad.
        </DisclaimerCard>

        {/* Barra de progreso global */}
        <div className={`${styles.progresoWrapper} ${todoCompleto ? styles.progresoCompleto : ''}`}>
          <div className={styles.progresoHeader}>
            <span className={styles.progresoTexto}>
              {todoCompleto
                ? '🎉 ¡Has completado todos los pasos!'
                : `${itemsCompletados} de ${totalItems} pasos completados`}
            </span>
            <span className={styles.progresoPorcentaje}>{porcentaje}%</span>
          </div>
          <div
            className={styles.progresoBar}
            role="progressbar"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso: ${porcentaje}%`}
          >
            <div className={styles.progresoFill} style={{ width: `${porcentaje}%` }} />
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.acciones}>
          <button
            type="button"
            onClick={reiniciar}
            className={styles.btnAccion}
            disabled={itemsCompletados === 0}
          >
            ↺ Reiniciar checklist
          </button>
        </div>

        {/* Checklist por fases */}
        <div className={styles.checklist}>
          {FASES.map(fase => {
            const { completados, total } = faseProgreso(fase);
            const completa = faseCompletada(fase);
            const expanded = expandedFases[fase.id] !== false;

            return (
              <div
                key={fase.id}
                className={`${styles.faseBloque} ${completa ? styles.faseCompleta : ''}`}
              >
                <button
                  type="button"
                  className={styles.faseHeader}
                  onClick={() => toggleFase(fase.id)}
                  aria-expanded={expanded}
                  aria-controls={`items-${fase.id}`}
                >
                  <span className={styles.faseIcono} aria-hidden="true">
                    {completa ? '✅' : fase.icono}
                  </span>
                  <div className={styles.faseInfo}>
                    <h2 className={styles.faseTitulo}>{fase.titulo}</h2>
                    <span className={styles.fasePlazo}>{fase.plazo}</span>
                  </div>
                  <span className={styles.faseProgreso}>
                    {completados}/{total}
                  </span>
                  <span
                    className={`${styles.faseChevron} ${expanded ? styles.chevronOpen : ''}`}
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                </button>

                {expanded && (
                  <ul id={`items-${fase.id}`} className={styles.itemsLista}>
                    {fase.items.map(item => (
                      <li
                        key={item.id}
                        className={`${styles.item} ${itemsChecked[item.id] ? styles.itemChecked : ''}`}
                        onClick={() => toggleItem(item.id)}
                        role="checkbox"
                        aria-checked={!!itemsChecked[item.id]}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleItem(item.id);
                          }
                        }}
                      >
                        <span className={styles.checkbox} aria-hidden="true">
                          {itemsChecked[item.id] ? '✓' : ''}
                        </span>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemNombre}>
                            {item.texto}
                            {item.critico && (
                              <span className={styles.badgeCritico}>Crítico</span>
                            )}
                          </span>
                          {item.nota && <p className={styles.itemNota}>{item.nota}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensaje completado */}
        {todoCompleto && (
          <div className={styles.mensajeCompleto} role="alert" aria-live="polite">
            <h2>🎉 ¡Todos los pasos completados!</h2>
            <p>
              Has marcado todos los pasos del proceso de solicitud de dependencia.
              Recuerda que los plazos reales dependen de tu Comunidad Autónoma.
            </p>
          </div>
        )}

        {/* Nota de privacidad */}
        <p className={styles.privacidadNota}>
          <span aria-hidden="true">🔒</span> Tu progreso se guarda en este navegador.
          No se envía ningún dato a ningún servidor.
        </p>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía completa del proceso de dependencia"
          subtitle="Todo lo que necesitas saber sobre la solicitud de dependencia en España"
          icon="📖"
        >
          {/* 1. Tabla comparativa: fases vs plazos */}
          <section className={styles.eduSection}>
            <h4 className={styles.eduSectionTitle}>Resumen de fases y plazos orientativos</h4>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Fase</th>
                    <th>Descripción</th>
                    <th>Plazo orientativo</th>
                    <th>Quién actúa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1. Preparación</td>
                    <td>Reunir documentos (DNI, informe médico, empadronamiento)</td>
                    <td>1-2 semanas</td>
                    <td>Familia</td>
                  </tr>
                  <tr>
                    <td>2. Solicitud</td>
                    <td>Presentar formulario oficial en la CCAA</td>
                    <td>1-2 semanas</td>
                    <td>Familia / representante</td>
                  </tr>
                  <tr>
                    <td>3. Valoración</td>
                    <td>Visita del valorador al domicilio</td>
                    <td>1-6 meses tras solicitud</td>
                    <td>Equipo valoración CCAA</td>
                  </tr>
                  <tr>
                    <td>4. Resolución</td>
                    <td>Notificación del grado reconocido</td>
                    <td>Plazo legal: 6 meses</td>
                    <td>Administración autonómica</td>
                  </tr>
                  <tr>
                    <td>5. PIA</td>
                    <td>Elaborar el Plan Individualizado de Atención</td>
                    <td>Variable (semanas-meses)</td>
                    <td>Trabajador social + familia</td>
                  </tr>
                  <tr>
                    <td>6. Prestación</td>
                    <td>Inicio del servicio o prestación económica</td>
                    <td>Variable</td>
                    <td>CCAA + familia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Explicación detallada de cada fase */}
          <section className={styles.eduSection}>
            <h4 className={styles.eduSectionTitle}>Detalle de cada fase del proceso</h4>
            <div className={styles.fasesDetalle}>
              <div className={styles.faseDetalleCard}>
                <div className={styles.faseDetalleHeader}>
                  <span aria-hidden="true">📋</span>
                  <strong>Fase 1: Preparación previa</strong>
                </div>
                <p>
                  Lo más importante es el <strong>informe médico del médico de cabecera</strong>.
                  Debe detallar las limitaciones funcionales concretas (no puede vestirse solo,
                  necesita ayuda para comer, se desorienta al salir de casa...), no solo el
                  diagnóstico. Un informe que solo diga &ldquo;Alzheimer&rdquo; sin describir cómo
                  afecta al día a día es insuficiente para que el valorador determine el grado.
                </p>
              </div>
              <div className={styles.faseDetalleCard}>
                <div className={styles.faseDetalleHeader}>
                  <span aria-hidden="true">📝</span>
                  <strong>Fase 2: Solicitud formal</strong>
                </div>
                <p>
                  El formulario varía según la CCAA. En algunas se puede presentar online
                  (sede electrónica), en otras es presencial (Servicios Sociales municipales
                  o autonómicos). <strong>Guarda siempre la copia sellada con fecha</strong>:
                  es tu prueba de cuándo empezaron a contar los derechos económicos.
                </p>
              </div>
              <div className={styles.faseDetalleCard}>
                <div className={styles.faseDetalleHeader}>
                  <span aria-hidden="true">🏠</span>
                  <strong>Fase 3: Valoración presencial</strong>
                </div>
                <p>
                  Un equipo de valoración (normalmente un profesional sanitario y un trabajador
                  social) visitará el domicilio. Evaluarán la capacidad de la persona para
                  realizar actividades básicas e instrumentales de la vida diaria. El error
                  más frecuente: la familia presenta a la persona en su mejor momento. Deben
                  describir cómo son los <strong>peores momentos</strong> del día a día.
                </p>
              </div>
              <div className={styles.faseDetalleCard}>
                <div className={styles.faseDetalleHeader}>
                  <span aria-hidden="true">📄</span>
                  <strong>Fase 4: Resolución del grado</strong>
                </div>
                <p>
                  Los grados son: <strong>Grado I</strong> (dependencia moderada),
                  <strong> Grado II</strong> (dependencia severa) y <strong>Grado III</strong>
                  (gran dependencia). El plazo legal para resolver es de 6 meses, aunque en
                  la práctica muchas CCAA tardan más. Si no estás de acuerdo con el grado,
                  tienes <strong>1 mes</strong> para presentar un recurso de alzada con
                  informes médicos adicionales.
                </p>
              </div>
              <div className={styles.faseDetalleCard}>
                <div className={styles.faseDetalleHeader}>
                  <span aria-hidden="true">🤝</span>
                  <strong>Fase 5: Plan Individualizado de Atención (PIA)</strong>
                </div>
                <p>
                  Un trabajador social elaborará contigo el PIA, que define qué tipo de
                  prestación o servicio recibirá la persona. Las opciones incluyen:
                  prestación económica vinculada al servicio (PEVS), prestación económica
                  para cuidados en el entorno familiar (PECEF), servicio de ayuda a domicilio
                  (SAD), teleasistencia, centro de día o residencia.
                </p>
              </div>
              <div className={styles.faseDetalleCard}>
                <div className={styles.faseDetalleHeader}>
                  <span aria-hidden="true">✅</span>
                  <strong>Fase 6: Inicio de la prestación</strong>
                </div>
                <p>
                  Una vez aprobado el PIA, se activa el servicio o prestación económica.
                  <strong> Los derechos económicos son retroactivos</strong> desde la fecha
                  de solicitud (fase 2), por lo que el primer pago puede incluir los meses
                  de espera acumulados. Ante cualquier cambio relevante (mudanza, cambio de
                  cuidador, empeoramiento), hay que comunicarlo a los Servicios Sociales.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Diferencias por CCAA */}
          <section className={styles.eduSection}>
            <h4 className={styles.eduSectionTitle}>Diferencias entre Comunidades Autónomas</h4>
            <p className={styles.eduParrafo}>
              La Ley 39/2006 (Ley de Dependencia) establece el marco general, pero
              cada CCAA gestiona el proceso con sus propios plazos, formularios y
              prestaciones. Algunas diferencias relevantes:
            </p>
            <ul className={styles.eduLista}>
              <li><strong>Plazos reales</strong>: Mientras el plazo legal es de 6 meses, algunas CCAA tardan más de un año en resolver. Consulta los datos publicados por el IMSERSO para tu comunidad.</li>
              <li><strong>Formularios</strong>: Cada CCAA tiene su propio formulario de solicitud. No uses el de otra comunidad.</li>
              <li><strong>Prestaciones económicas</strong>: Las cuantías varían. La PECEF (cuidados en entorno familiar) puede ser complementada por algunas CCAA.</li>
              <li><strong>Copago</strong>: Las CCAA aplican copagos diferentes en función de la renta y patrimonio del beneficiario.</li>
              <li><strong>Presentación online</strong>: No todas las CCAA permiten presentar la solicitud telemáticamente. Consulta antes de intentarlo.</li>
            </ul>
          </section>

          {/* 4. Cuándo buscar asesoría legal */}
          <section className={styles.eduSection}>
            <h4 className={styles.eduSectionTitle}>Cuándo buscar asesoría legal</h4>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚖️</span>
                <div>
                  <strong>Recurso de alzada denegado</strong>
                  <p>Si presentaste recurso de alzada y fue rechazado, un abogado especializado en dependencia puede valorar la vía contencioso-administrativa.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⏰</span>
                <div>
                  <strong>La administración no responde en plazo</strong>
                  <p>Si han pasado más de 6 meses sin resolución, hay silencio administrativo positivo. Un profesional puede ayudarte a reclamarlo.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📉</span>
                <div>
                  <strong>El grado reconocido parece insuficiente</strong>
                  <p>Si crees que el grado no refleja la situación real, un informe pericial independiente puede reforzar tu recurso.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>💰</span>
                <div>
                  <strong>Problemas con la prestación económica</strong>
                  <p>Si no recibes el retroactivo desde la fecha de solicitud o el importe no es correcto, busca asesoría especializada.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. FAQ */}
          <section className={styles.eduSection}>
            <h4 className={styles.eduSectionTitle}>Preguntas frecuentes</h4>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt>¿Quién puede solicitar la valoración de dependencia?</dt>
                <dd>
                  Cualquier persona de nacionalidad española (o con residencia legal en España
                  durante al menos 5 años) que necesite ayuda para realizar actividades básicas
                  de la vida diaria. No hay edad mínima: se puede solicitar para personas
                  mayores, para personas con discapacidad o para menores de 3 años con
                  limitaciones funcionales graves.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cuánto tarda el proceso completo?</dt>
                <dd>
                  El plazo legal máximo para la resolución es de <strong>6 meses</strong> desde
                  la solicitud. En la práctica, muchas CCAA tardan entre 6 y 18 meses. Tras la
                  resolución, el PIA se elabora en semanas o meses adicionales. Los derechos
                  económicos son retroactivos desde la fecha de solicitud, lo que compensa parte
                  de la espera.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué es el baremo BVD y cómo funciona?</dt>
                <dd>
                  El BVD (Baremo de Valoración de la Dependencia) evalúa la capacidad de la persona
                  para realizar 47 tareas agrupadas en 10 actividades de la vida diaria: comer y
                  beber, higiene personal, vestirse, mantenimiento de la salud, movilidad,
                  desplazarse fuera del hogar, entre otras. Se puntúa de 0 a 100: de 25 a 49
                  puntos es Grado I, de 50 a 74 es Grado II, y 75 o más es Grado III.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué diferencia hay entre las prestaciones económicas?</dt>
                <dd>
                  La <strong>PEVS</strong> (vinculada al servicio) financia un servicio
                  profesional privado cuando no hay plaza pública disponible. La
                  <strong> PECEF</strong> (cuidados en entorno familiar) compensa al
                  cuidador familiar no profesional. El <strong>SAD</strong> (servicio de
                  ayuda a domicilio) proporciona auxiliares que acuden al hogar. La elección
                  depende de la situación, las preferencias y la disponibilidad en tu CCAA.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Se puede solicitar una revisión del grado?</dt>
                <dd>
                  Sí. Si la situación de la persona empeora (o mejora), se puede solicitar una
                  revisión del grado en cualquier momento. También se revisa de oficio cuando
                  la resolución incluye una fecha de revisión. Para la revisión hay que aportar
                  nueva documentación médica que justifique el cambio.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿La persona dependiente tiene que pagar algo?</dt>
                <dd>
                  Depende del servicio y de la CCAA. Las prestaciones económicas no tienen copago,
                  pero los servicios (residencia, centro de día, SAD) sí pueden tenerlo, calculado
                  en función de la <strong>capacidad económica</strong> del beneficiario (renta +
                  patrimonio). Cada CCAA aplica su propio baremo de copago.
                </dd>
              </div>
            </dl>
          </section>

          {/* 6. Consejos por fase */}
          <section className={styles.eduSection}>
            <h4 className={styles.eduSectionTitle}>Consejos prácticos para cada fase</h4>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📋</span>
                <div>
                  <strong>Fase 1: Informe médico detallado</strong>
                  <p>Pide al médico de cabecera que describa concretamente qué no puede hacer la persona, no solo el diagnóstico. Ejemplo: &ldquo;No puede vestirse sin ayuda, se desorienta al salir de casa&rdquo;.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📝</span>
                <div>
                  <strong>Fase 2: Fecha de registro</strong>
                  <p>La fecha de la solicitud sellada es el inicio de tus derechos económicos. Presenta cuanto antes, incluso si te falta algún documento menor que puedas aportar después.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🏠</span>
                <div>
                  <strong>Fase 3: No disimular la situación</strong>
                  <p>El mayor error es presentar a la persona en su mejor momento. El valorador necesita ver la realidad del día a día, incluidos los peores momentos.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>📄</span>
                <div>
                  <strong>Fase 4: Recurrir si no estás de acuerdo</strong>
                  <p>Tienes 1 mes para recurrir. Prepara informes médicos adicionales y describe las situaciones concretas que el valorador pudo no observar durante la visita.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🤝</span>
                <div>
                  <strong>Fase 5: Informarse sobre opciones</strong>
                  <p>Antes de la reunión del PIA, infórmate sobre todas las modalidades disponibles en tu CCAA. No aceptes la primera opción sin entender las alternativas.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>✅</span>
                <div>
                  <strong>Fase 6: Verificar el retroactivo</strong>
                  <p>La prestación económica debe incluir los meses desde la solicitud. Si el importe no cuadra, reclama por escrito ante los Servicios Sociales.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Warning box — errores críticos */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>⚠️</span>
                <strong>Errores frecuentes que pueden retrasar o perjudicar tu solicitud</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>No guardar la copia sellada de la solicitud.</strong> Sin
                  fecha de registro no podrás reclamar los derechos económicos retroactivos.
                  Es el documento más importante del proceso.
                </li>
                <li>
                  <strong>Presentar un informe médico genérico.</strong> Un informe que
                  solo dice &ldquo;demencia tipo Alzheimer&rdquo; sin describir las
                  limitaciones funcionales concretas hará que el valorador no tenga información
                  suficiente para asignar un grado alto.
                </li>
                <li>
                  <strong>Mostrar a la persona en su mejor momento durante la valoración.</strong> Las
                  familias tienden a preparar a la persona para la visita. El valorador
                  necesita ver la realidad: si normalmente no puede vestirse sola, que no
                  esté vestida y arreglada cuando llegue.
                </li>
                <li>
                  <strong>Dejar pasar el plazo de recurso.</strong> Solo tienes 1 mes
                  desde la notificación del grado para presentar recurso de alzada. Si lo
                  dejas pasar, tendrás que esperar a solicitar una revisión del grado con
                  nueva documentación, lo que alarga el proceso considerablemente.
                </li>
                <li>
                  <strong>No comunicar cambios de situación.</strong> Si la persona empeora,
                  cambia de domicilio o cambia el cuidador principal, hay que comunicarlo.
                  No hacerlo puede afectar al tipo de prestación e incluso suspenderla.
                </li>
                <li>
                  <strong>Usar el formulario de otra Comunidad Autónoma.</strong> Cada
                  CCAA tiene sus propios formularios y procedimientos. Usar el formulario
                  incorrecto puede retrasar semanas la tramitación.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('checklist-tramites-dependencia')} />
        <ShareCard appName="checklist-tramites-dependencia" />
        <Footer appName="checklist-tramites-dependencia" />
      </div>
    </>
  );
}
