'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './RecordatorioMedicacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
interface Medicamento {
  id: string;
  nombre: string;
  emoji: string;
  dosis: string;
  horarios: string[];
  color: string;
  tomados: Record<string, boolean>; // clave: "YYYY-MM-DD_HH:MM"
}

const EMOJIS_MEDICAMENTO = ['💊', '💉', '🩺', '🧴', '🌡️', '💧', '🍃', '🫁', '🩹', '🧪'];
const COLORES_MEDICAMENTO = [
  '#2E86AB', '#48A9A6', '#E74C3C', '#F39C12',
  '#27AE60', '#8E44AD', '#E67E22', '#16A085',
];
const HORARIOS_PRESET = ['08:00', '09:00', '12:00', '14:00', '20:00', '21:00', '22:00'];

const STORAGE_KEY = 'meskeia_medicamentos_v1';

function hoyISO(): string {
  return new Date().toISOString().split('T')[0];
}

function horaActual(): string {
  return new Date().toTimeString().slice(0, 5);
}

function claveRegistro(fecha: string, hora: string): string {
  return `${fecha}_${hora}`;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function RecordatorioMedicacionPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [vista, setVista] = useState<'hoy' | 'lista' | 'nuevo'>('hoy');
  const [editando, setEditando] = useState<Medicamento | null>(null);

  // Formulario nuevo/editar medicamento
  const [formNombre, setFormNombre] = useState('');
  const [formEmoji, setFormEmoji] = useState('💊');
  const [formDosis, setFormDosis] = useState('');
  const [formHorarios, setFormHorarios] = useState<string[]>(['08:00']);
  const [formColor, setFormColor] = useState(COLORES_MEDICAMENTO[0]);

  // Cargar desde localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setMedicamentos(JSON.parse(raw));
      } catch {
        setMedicamentos([]);
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicamentos));
  }, [medicamentos]);

  const resetForm = useCallback(() => {
    setFormNombre('');
    setFormEmoji('💊');
    setFormDosis('');
    setFormHorarios(['08:00']);
    setFormColor(COLORES_MEDICAMENTO[0]);
    setEditando(null);
  }, []);

  const abrirNuevo = () => {
    resetForm();
    setVista('nuevo');
  };

  const abrirEditar = (med: Medicamento) => {
    setEditando(med);
    setFormNombre(med.nombre);
    setFormEmoji(med.emoji);
    setFormDosis(med.dosis);
    setFormHorarios([...med.horarios]);
    setFormColor(med.color);
    setVista('nuevo');
  };

  const guardarMedicamento = () => {
    if (!formNombre.trim() || formHorarios.length === 0) return;

    const nuevo: Medicamento = {
      id: editando?.id ?? Date.now().toString(),
      nombre: formNombre.trim(),
      emoji: formEmoji,
      dosis: formDosis.trim(),
      horarios: [...formHorarios].sort(),
      color: formColor,
      tomados: editando?.tomados ?? {},
    };

    setMedicamentos(prev =>
      editando
        ? prev.map(m => m.id === editando.id ? nuevo : m)
        : [...prev, nuevo]
    );
    resetForm();
    setVista('lista');
  };

  const eliminarMedicamento = (id: string) => {
    setMedicamentos(prev => prev.filter(m => m.id !== id));
  };

  const marcarTomado = (medId: string, hora: string) => {
    const clave = claveRegistro(hoyISO(), hora);
    setMedicamentos(prev =>
      prev.map(m =>
        m.id === medId
          ? { ...m, tomados: { ...m.tomados, [clave]: !m.tomados[clave] } }
          : m
      )
    );
  };

  const esTomado = (med: Medicamento, hora: string): boolean => {
    return !!med.tomados[claveRegistro(hoyISO(), hora)];
  };

  const toggleHorario = (hora: string) => {
    setFormHorarios(prev =>
      prev.includes(hora)
        ? prev.filter(h => h !== hora)
        : [...prev, hora].sort()
    );
  };

  // Calcular progreso del día
  const horasHoy = Array.from(
    new Set(medicamentos.flatMap(m => m.horarios))
  ).sort();

  const totalTomas = medicamentos.reduce((acc, m) => acc + m.horarios.length, 0);
  const tomasDone = medicamentos.reduce((acc, m) =>
    acc + m.horarios.filter(h => esTomado(m, h)).length, 0
  );
  const progresoPct = totalTomas > 0 ? Math.round((tomasDone / totalTomas) * 100) : 0;

  // Próxima toma
  const horaActual5 = horaActual();
  const todasLasTomasHoy = horasHoy
    .filter(h => h >= horaActual5)
    .filter(h => medicamentos.some(m => m.horarios.includes(h) && !esTomado(m, h)));
  const proximaHora = todasLasTomasHoy[0] ?? null;

  // ============================================
  // VISTA: HOY
  // ============================================
  if (vista === 'hoy') {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">💊</span> Recordatorio de Medicación</h1>
          <p className={styles.subtitle}>
            Gestiona tus medicamentos con pictogramas y horarios visuales
          </p>
        </header>

        <LegalNotice />

        {/* Progreso del día */}
        {totalTomas > 0 && (
          <div className={styles.progresoCard} role="status" aria-live="polite">
            <div className={styles.progresoHeader}>
              <span className={styles.progresoTitulo}><span aria-hidden="true">📅</span> Hoy</span>
              <span className={styles.progresoNum}>{tomasDone}/{totalTomas} tomas</span>
            </div>
            <div className={styles.progresoBar} role="progressbar" aria-valuenow={progresoPct} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progresoFill} style={{ width: `${progresoPct}%` }} />
            </div>
            {proximaHora && (
              <p className={styles.proximaToma}><span aria-hidden="true">⏰</span> Próxima toma: <strong>{proximaHora}</strong></p>
            )}
            {progresoPct === 100 && (
              <p className={styles.completado}><span aria-hidden="true">✅</span> ¡Todas las tomas del día completadas!</p>
            )}
          </div>
        )}

        {/* Medicamentos vacío */}
        {medicamentos.length === 0 && (
          <div className={styles.vacio}>
            <span className={styles.vacioEmoji} aria-hidden="true">💊</span>
            <p>Aún no tienes medicamentos configurados</p>
            <button type="button" onClick={abrirNuevo} className={styles.btnPrimary}>
              + Añadir primer medicamento
            </button>
          </div>
        )}

        {/* Lista de tomas por horario */}
        {medicamentos.length > 0 && (
          <div className={styles.tomasContainer}>
            {horasHoy.map(hora => {
              const medsEstaHora = medicamentos.filter(m => m.horarios.includes(hora));
              const todasTomadas = medsEstaHora.every(m => esTomado(m, hora));
              return (
                <div key={hora} className={`${styles.bloqueHora} ${todasTomadas ? styles.bloqueHoraCompleto : ''}`}>
                  <div className={styles.horaLabel}>
                    <span className={styles.horaTexto}>{hora}</span>
                    {todasTomadas && <span className={styles.horaCheck} aria-hidden="true">✓</span>}
                  </div>
                  <div className={styles.medsBloqueGrid}>
                    {medsEstaHora.map(med => {
                      const tomado = esTomado(med, hora);
                      return (
                        <button
                          key={med.id}
                          className={`${styles.medBtn} ${tomado ? styles.medBtnTomado : ''}`}
                          style={{ borderColor: med.color, '--med-color': med.color } as React.CSSProperties}
                          onClick={() => marcarTomado(med.id, hora)}
                          aria-pressed={tomado}
                          aria-label={`${med.nombre}${tomado ? ' - tomado' : ' - pendiente'}`}
                        >
                          <span className={styles.medEmoji} aria-hidden="true">{med.emoji}</span>
                          <span className={styles.medNombre}>{med.nombre}</span>
                          {med.dosis && <span className={styles.medDosis}>{med.dosis}</span>}
                          <span className={styles.medEstado} aria-hidden="true">{tomado ? '✅' : '⭕'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botones de acción */}
        <div className={styles.acciones}>
          <button type="button" onClick={() => setVista('lista')} className={styles.btnSecondary}>
            <span aria-hidden="true">📋</span> Mis medicamentos
          </button>
          <button type="button" onClick={abrirNuevo} className={styles.btnPrimary}>
            + Añadir
          </button>
        </div>

        {/* Aviso médico */}
        <DisclaimerCard
          variant="medical"
          severity="critical"
          context="recordatorio-medicacion"
        />

        {/* Sección educativa */}
        <EducationalSection
          title="📚 Guía para familias y cuidadores"
          subtitle="Aprende a sacar el máximo partido al recordatorio visual"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.guiaSeccion}>
            <h2>Comparativa: métodos de gestión de medicación</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Método</th>
                    <th>Accesibilidad</th>
                    <th>Sin registro</th>
                    <th>Visual/Pictogramas</th>
                    <th>Ideal para</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.celdaDestacada}>meskeIA Recordatorio</td>
                    <td>Alta</td>
                    <td>✅ Sí</td>
                    <td>✅ Emojis + colores</td>
                    <td>Autismo, TDAH, mayores</td>
                  </tr>
                  <tr>
                    <td>Pastillero físico</td>
                    <td>Media</td>
                    <td>✅ Sí</td>
                    <td>❌ Solo días</td>
                    <td>Uso general</td>
                  </tr>
                  <tr>
                    <td>Apps de alarma</td>
                    <td>Media-Baja</td>
                    <td>Varía</td>
                    <td>❌ Texto solo</td>
                    <td>Adultos sin dificultades cognitivas</td>
                  </tr>
                  <tr>
                    <td>Sin herramienta</td>
                    <td>Baja</td>
                    <td>✅ Sí</td>
                    <td>❌ No</td>
                    <td>Muy baja complejidad</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guiaSeccion}>
            <h2>¿Quién se beneficia de esta herramienta?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div aria-hidden="true" className={styles.escenarioIcono}>🧩</div>
                <h3>Persona con autismo</h3>
                <p>Los pictogramas y colores reducen la ansiedad asociada a rutinas de medicación poco predecibles. El refuerzo visual ("✅ tomado") proporciona certeza inmediata.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div aria-hidden="true" className={styles.escenarioIcono}>⚡</div>
                <h3>Adolescente con TDAH</h3>
                <p>Ayuda a establecer hábitos de medicación autónomos sin depender del adulto. La marca de "tomado" da sensación de logro y refuerza el cumplimiento.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div aria-hidden="true" className={styles.escenarioIcono}>👴</div>
                <h3>Mayor con polimedicación</h3>
                <p>Interfaz simple con botones grandes. Sin formularios ni contraseñas. El progreso del día visible reduce el olvido, especialmente en personas con deterioro cognitivo leve.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div aria-hidden="true" className={styles.escenarioIcono}>👩‍⚕️</div>
                <h3>Cuidador o familiar</h3>
                <p>Configura los medicamentos una vez y la persona a su cargo puede marcarlos de forma autónoma. Reduce la carga de supervisión constante del cuidador.</p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guiaSeccion}>
            <h2>Preguntas frecuentes</h2>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt>¿Los datos se comparten con meskeIA o terceros?</dt>
                <dd>No. Todo se almacena únicamente en tu dispositivo (localStorage del navegador). meskeIA no tiene acceso a ningún dato de medicación.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Funciona sin conexión a internet?</dt>
                <dd>Sí. Una vez cargada la página, funciona completamente offline. Los datos se guardan en el navegador, no en la nube.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Se pierden los datos si cierro el navegador?</dt>
                <dd>No, los medicamentos quedan guardados en el navegador indefinidamente. Solo se borran si limpias los datos del navegador o usas modo incógnito.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Puedo añadir medicamentos sin nombre técnico?</dt>
                <dd>Sí. Puedes usar nombres simplificados o descriptivos como "pastilla azul mañana" o "jarabe tos". Lo importante es que sea reconocible para el usuario.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Hay recordatorios sonoros o notificaciones?</dt>
                <dd>Actualmente no hay notificaciones push. La herramienta es visual y requiere que el usuario la abra activamente. Para notificaciones, combínala con la alarma del teléfono.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué pasa si el historial de "tomados" ocupa mucho espacio?</dt>
                <dd>El almacenamiento es muy eficiente. Incluso con 10 medicamentos durante años, el espacio ocupado es mínimo (menos de 1 MB). No hay límite práctico.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Se puede usar con niños pequeños?</dt>
                <dd>Sí, pero siempre bajo supervisión de un adulto. Para niños menores de 12 años, recomendamos que sea el cuidador quien marque los medicamentos como tomados.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Puedo usar esta herramienta para varios pacientes?</dt>
                <dd>Actualmente está diseñada para un perfil por dispositivo. Para varios usuarios, lo más sencillo es usar dispositivos o perfiles de navegador distintos.</dd>
              </div>
            </dl>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.guiaSeccion}>
            <h2>Cómo configurar el recordatorio en 7 pasos</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div>
                  <strong>Reúne la lista de medicamentos</strong>
                  <p>Prepara el nombre, dosis y horarios de cada medicamento. Puedes consultarlos con el médico o farmacéutico.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div>
                  <strong>Añade cada medicamento</strong>
                  <p>Pulsa "Añadir" y rellena: nombre simplificado, pictograma (emoji), dosis y horarios.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div>
                  <strong>Elige colores distintos</strong>
                  <p>Asigna un color diferente a cada medicamento para facilitar la identificación visual rápida.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div>
                  <strong>Configura los horarios exactos</strong>
                  <p>Usa los horarios predefinidos o escribe horarios personalizados. Selecciona todos los que correspondan a ese medicamento.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div>
                  <strong>Practica juntos la primera vez</strong>
                  <p>El primer día, acompaña a la persona mientras marca los medicamentos como tomados. Explica qué significa el ✅ verde.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>6</span>
                <div>
                  <strong>Añade una alarma de respaldo</strong>
                  <p>Configura alarmas en el teléfono a los mismos horarios para recordar abrir la app. La herramienta visual y la alarma se complementan.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>7</span>
                <div>
                  <strong>Revisa semanalmente</strong>
                  <p>Comprueba que los horarios y dosis siguen siendo correctos. Actualiza si el médico cambia algún medicamento.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* 5. Mejores prácticas */}
          <section className={styles.guiaSeccion}>
            <h2>Mejores prácticas para cuidadores y familias</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <div aria-hidden="true" className={styles.tipIcono}>🎨</div>
                <h3>Usa un emoji reconocible</h3>
                <p>Elige el emoji que la persona ya asocie con ese medicamento. Si la pastilla es redonda y blanca, quizás 💊. Si es jarabe, quizás 🥄 o 💧.</p>
              </div>
              <div className={styles.tipCard}>
                <div aria-hidden="true" className={styles.tipIcono}>🌈</div>
                <h3>Un color por medicamento</h3>
                <p>Asocia el color digital al color real del blíster o frasco. Ayuda enormemente a personas con dificultades de lectura.</p>
              </div>
              <div className={styles.tipCard}>
                <div aria-hidden="true" className={styles.tipIcono}>📱</div>
                <h3>Añade al escritorio del móvil</h3>
                <p>En iOS y Android puedes añadir la página web al escritorio como acceso directo. Así la persona la encuentra fácilmente sin buscar.</p>
              </div>
              <div className={styles.tipCard}>
                <div aria-hidden="true" className={styles.tipIcono}>🔔</div>
                <h3>Combina con alarmas físicas</h3>
                <p>Las alarmas del teléfono actúan como señal de inicio; la app, como confirmación visual. Juntas forman un sistema robusto.</p>
              </div>
              <div className={styles.tipCard}>
                <div aria-hidden="true" className={styles.tipIcono}>✅</div>
                <h3>Celebra el progreso</h3>
                <p>Cuando la barra de progreso llega al 100%, señálalo positivamente. El refuerzo positivo ayuda a consolidar el hábito de seguimiento.</p>
              </div>
              <div className={styles.tipCard}>
                <div aria-hidden="true" className={styles.tipIcono}>👨‍⚕️</div>
                <h3>Muestra el historial al médico</h3>
                <p>Aunque simple, el registro de "tomados" puede ser útil en consulta para verificar el cumplimiento real del tratamiento.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning box */}
          <section className={styles.guiaSeccion}>
            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Precauciones importantes</h3>
              <ul>
                <li><strong>No es sustituto de supervisión médica</strong>: Esta herramienta apoya la gestión, pero no reemplaza a un profesional sanitario ni a un cuidador responsable.</li>
                <li><strong>No guardes contraindicaciones aquí</strong>: No uses esta app para registrar alergias, interacciones o información crítica de seguridad. Esa información debe estar en sistemas médicos adecuados.</li>
                <li><strong>Revisa los cambios de pauta</strong>: Si el médico cambia dosis u horarios, actualiza la app inmediatamente. Una configuración desfasada puede llevar a errores.</li>
                <li><strong>Cuidado con el modo incógnito</strong>: Los datos no se guardan entre sesiones en modo incógnito o privado. Usa el navegador normal.</li>
                <li><strong>No compartas el dispositivo sin aviso</strong>: Si varias personas usan el mismo navegador, los datos de medicación se mezclarán. Usa perfiles de navegador separados.</li>
                <li><strong>En caso de duda sobre una toma</strong>: Si no sabes si se tomó un medicamento, consulta con el médico o farmacéutico antes de repetir la dosis. Nunca duplicar sin supervisión.</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('recordatorio-medicacion')} />
        <ShareCard appName="recordatorio-medicacion" />
        <Footer appName="recordatorio-medicacion" />
      </div>
    );
  }

  // ============================================
  // VISTA: LISTA DE MEDICAMENTOS
  // ============================================
  if (vista === 'lista') {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">💊</span> Mis Medicamentos</h1>
          <p className={styles.subtitle}>Gestiona tu lista de medicamentos</p>
        </header>

        <div className={styles.listaAcciones}>
          <button type="button" onClick={() => setVista('hoy')} className={styles.btnSecondary}>
            ← Vista del día
          </button>
          <button type="button" onClick={abrirNuevo} className={styles.btnPrimary}>
            + Añadir medicamento
          </button>
        </div>

        {medicamentos.length === 0 && (
          <div className={styles.vacio}>
            <span className={styles.vacioEmoji} aria-hidden="true">💊</span>
            <p>No hay medicamentos configurados aún</p>
          </div>
        )}

        <div className={styles.medicamentosLista}>
          {medicamentos.map(med => (
            <div key={med.id} className={styles.medCard} style={{ borderLeftColor: med.color } as React.CSSProperties}>
              <div className={styles.medCardHeader}>
                <span className={styles.medCardEmoji} aria-hidden="true">{med.emoji}</span>
                <div className={styles.medCardInfo}>
                  <span className={styles.medCardNombre}>{med.nombre}</span>
                  {med.dosis && <span className={styles.medCardDosis}>{med.dosis}</span>}
                  <span className={styles.medCardHorarios}>
                    {med.horarios.join(' · ')}
                  </span>
                </div>
                <div className={styles.medCardAcciones}>
                  <button
                    type="button"
                    onClick={() => abrirEditar(med)}
                    className={styles.btnEditar}
                    aria-label={`Editar ${med.nombre}`}
                  >
                    <span aria-hidden="true">✏️</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarMedicamento(med.id)}
                    className={styles.btnEliminar}
                    aria-label={`Eliminar ${med.nombre}`}
                  >
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Footer appName="recordatorio-medicacion" />
      </div>
    );
  }

  // ============================================
  // VISTA: NUEVO / EDITAR MEDICAMENTO
  // ============================================
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>{editando ? <><span aria-hidden="true">✏️</span> Editar medicamento</> : '+ Nuevo medicamento'}</h1>
        <p className={styles.subtitle}>Configura el nombre, pictograma y horarios</p>
      </header>

      <div className={styles.formCard}>
        {/* Nombre */}
        <div className={styles.formGrupo}>
          <label className={styles.formLabel} htmlFor="med-nombre">Nombre del medicamento</label>
          <input
            id="med-nombre"
            type="text"
            value={formNombre}
            onChange={e => setFormNombre(e.target.value)}
            placeholder="Ej: Pastilla azul mañana"
            className={styles.formInput}
            autoComplete="off"
          />
        </div>

        {/* Dosis */}
        <div className={styles.formGrupo}>
          <label className={styles.formLabel} htmlFor="med-dosis">Dosis (opcional)</label>
          <input
            id="med-dosis"
            type="text"
            value={formDosis}
            onChange={e => setFormDosis(e.target.value)}
            placeholder="Ej: 1 comprimido, 5ml, 20mg"
            className={styles.formInput}
            autoComplete="off"
          />
        </div>

        {/* Emoji */}
        <div className={styles.formGrupo}>
          <span className={styles.formLabel}>Pictograma</span>
          <div className={styles.emojiSelector}>
            {EMOJIS_MEDICAMENTO.map(e => (
              <button
                key={e}
                type="button"
                className={`${styles.emojiBtn} ${formEmoji === e ? styles.emojiBtnActivo : ''}`}
                onClick={() => setFormEmoji(e)}
                aria-pressed={formEmoji === e}
                aria-label={`Emoji ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className={styles.formGrupo}>
          <span className={styles.formLabel}>Color identificador</span>
          <div className={styles.colorSelector}>
            {COLORES_MEDICAMENTO.map(c => (
              <button
                key={c}
                type="button"
                className={`${styles.colorBtn} ${formColor === c ? styles.colorBtnActivo : ''}`}
                style={{ background: c } as React.CSSProperties}
                onClick={() => setFormColor(c)}
                aria-pressed={formColor === c}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div className={styles.formGrupo}>
          <span className={styles.formLabel}>Horarios de toma</span>
          <div className={styles.horariosGrid}>
            {HORARIOS_PRESET.map(h => (
              <button
                key={h}
                type="button"
                className={`${styles.horarioBtn} ${formHorarios.includes(h) ? styles.horarioBtnActivo : ''}`}
                onClick={() => toggleHorario(h)}
                aria-pressed={formHorarios.includes(h)}
              >
                {h}
              </button>
            ))}
          </div>
          <p className={styles.horarioSeleccionados}>
            {formHorarios.length === 0
              ? 'Selecciona al menos un horario'
              : `Seleccionados: ${formHorarios.join(', ')}`
            }
          </p>
        </div>

        {/* Acciones */}
        <div className={styles.formAcciones}>
          <button
            type="button"
            onClick={() => { resetForm(); setVista(medicamentos.length > 0 ? 'lista' : 'hoy'); }}
            className={styles.btnSecondary}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardarMedicamento}
            className={styles.btnPrimary}
            disabled={!formNombre.trim() || formHorarios.length === 0}
          >
            {editando ? 'Guardar cambios' : 'Añadir medicamento'}
          </button>
        </div>
      </div>

      <Footer appName="recordatorio-medicacion" />
    </div>
  );
}
