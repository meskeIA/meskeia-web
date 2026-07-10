'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo } from 'react';
import styles from './GeneradorCurriculum.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  CV_VACIO,
  habilidadesLista,
  construirHTML,
  construirMarkdown,
  construirTextoPlano,
  type CVData,
  type Experiencia,
  type Formacion,
  type Idioma,
  type Certificacion,
  type Proyecto,
} from './cvExport';

const STORAGE_KEY = 'meskeia-cv-data';

const ACENTOS = [
  { nombre: 'Azul', hex: '#2E86AB' },
  { nombre: 'Teal', hex: '#48A9A6' },
  { nombre: 'Grafito', hex: '#374151' },
  { nombre: 'Burdeos', hex: '#8E2C48' },
  { nombre: 'Verde', hex: '#2E7D32' },
];

const NIVELES_IDIOMA = ['Nativo', 'Avanzado', 'Intermedio', 'Básico'];

function nuevoId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

// Helpers de array (tipados por el punto de llamada, sin any)
function arrDel<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((x) => x.id !== id);
}
function arrUpd<T extends { id: string }>(arr: T[], id: string, patch: Partial<T>): T[] {
  return arr.map((x) => (x.id === id ? { ...x, ...patch } : x));
}
function arrMove<T extends { id: string }>(arr: T[], id: string, dir: -1 | 1): T[] {
  const a = [...arr];
  const i = a.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= a.length) return a;
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}

const EJEMPLO: CVData = {
  nombre: 'Lucía Martín Reyes',
  titular: 'Graduada en Administración · Marketing Digital',
  email: 'lucia.martin@email.com',
  telefono: '+34 600 123 456',
  ubicacion: 'Valencia',
  linkedin: 'linkedin.com/in/luciamartin',
  web: '',
  resumen:
    'Recién graduada en Administración con especialización en marketing digital. Durante las prácticas aumenté el alcance de redes sociales un 40% en 3 meses. Busco mi primer empleo en un equipo de marketing donde aportar analítica y creatividad.',
  habilidadesText: 'Marketing digital\nGoogle Analytics\nExcel avanzado\nGestión de redes sociales\nRedacción SEO\nCanva',
  experiencia: [
    {
      id: 'ej1',
      puesto: 'Prácticas de Marketing',
      empresa: 'Agencia Nova',
      ubicacion: 'Valencia',
      inicio: '02/2026',
      fin: '06/2026',
      actual: false,
      descripcion:
        'Gestioné las redes sociales de 3 clientes y aumenté su alcance un 40% en 3 meses. Elaboré informes mensuales de analítica que redujeron el tiempo de reporte a la mitad.',
    },
  ],
  formacion: [
    {
      id: 'ej2',
      titulo: 'Grado en Administración y Dirección de Empresas',
      centro: 'Universidad de Valencia',
      ubicacion: 'Valencia',
      inicio: '2022',
      fin: '2026',
      actual: false,
      detalle: 'Especialización en marketing digital. Trabajo de fin de grado con calificación 9,2.',
    },
  ],
  idiomas: [
    { id: 'ej3', idioma: 'Español', nivel: 'Nativo' },
    { id: 'ej4', idioma: 'Inglés', nivel: 'Avanzado' },
  ],
  certificaciones: [
    { id: 'ej5', nombre: 'Google Analytics Certification', entidad: 'Google', anio: '2025' },
  ],
  proyectos: [],
  acento: '#2E86AB',
};

export default function GeneradorCurriculumPage() {
  const [cv, setCv] = useState<CVData>(CV_VACIO);
  const [cargado, setCargado] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setCv({ ...CV_VACIO, ...(parsed as Partial<CVData>) });
        }
      }
    } catch {
      /* datos corruptos: se ignoran */
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [cv, cargado]);

  const setCampo = (patch: Partial<CVData>) => setCv((prev) => ({ ...prev, ...patch }));

  // Completitud (determinista)
  const checks = useMemo(() => {
    const hab = habilidadesLista(cv.habilidadesText);
    const logroCuant = cv.experiencia.some((e) => /\d|%/.test(e.descripcion));
    return [
      { label: 'Nombre y titular profesional', ok: !!cv.nombre.trim() && !!cv.titular.trim() },
      { label: 'Contacto (email o teléfono)', ok: !!(cv.email.trim() || cv.telefono.trim()) },
      { label: 'Resumen profesional (2-4 líneas)', ok: cv.resumen.trim().length >= 40 },
      {
        label: 'Al menos una experiencia o formación',
        ok:
          cv.experiencia.some((e) => e.puesto || e.empresa) ||
          cv.formacion.some((f) => f.titulo || f.centro),
      },
      { label: 'Logros cuantificados en la experiencia', ok: logroCuant },
      { label: 'Al menos 3 habilidades', ok: hab.length >= 3 },
      { label: 'Al menos un idioma', ok: cv.idiomas.some((i) => i.idioma.trim()) },
    ];
  }, [cv]);
  const puntuacion = checks.filter((c) => c.ok).length;

  // Exportación
  const descargar = (contenido: string, nombre: string, tipo: string) => {
    const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const abrirImprimible = () => {
    const html = construirHTML(cv);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      setAviso('Tu navegador bloqueó la pestaña. Descarga el HTML e imprímelo desde ahí.');
    } else {
      setAviso('Abrimos tu CV en una pestaña nueva. Pulsa Ctrl/Cmd+P y elige "Guardar como PDF".');
    }
    setTimeout(() => URL.revokeObjectURL(url), 20000);
  };

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(construirTextoPlano(cv));
      setAviso('Currículum copiado como texto plano (útil para formularios ATS).');
    } catch {
      setAviso('No se pudo copiar. Prueba a descargar el HTML o el Markdown.');
    }
  };

  const cargarEjemplo = () => {
    setCv(EJEMPLO);
    setAviso('Ejemplo cargado. Edítalo con tus datos o vacíalo para empezar de cero.');
  };

  const vaciar = () => {
    setCv({ ...CV_VACIO });
    setAviso('Currículum vaciado.');
  };

  const habilidades = habilidadesLista(cv.habilidadesText);
  const contacto = [cv.email, cv.telefono, cv.ubicacion, cv.linkedin, cv.web].map((s) => s.trim()).filter(Boolean);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📄</span> Crear Currículum (CV / Hoja de Vida)
        </h1>
        <p className={styles.subtitle}>
          Rellena tus datos y ve tu currículum en vivo. Plantilla limpia y{' '}
          <strong>ATS-friendly</strong>, exportable a PDF. Sin registro, todo en tu navegador.
        </p>
      </header>

      <LegalNotice />

      <section className={styles.intro}>
        <p>
          Un buen <strong>currículum</strong> (o <strong>hoja de vida</strong>) es claro, concreto y
          fácil de leer, tanto para una persona como para los filtros automáticos (ATS) que usan
          muchas empresas. Completa las secciones, cuida los <strong>logros con cifras</strong> y
          exporta cuando quieras. ¿Tienes entrevista después? Prepara tus respuestas con el{' '}
          <a href="/preparar-entrevista-competencias/">método STAR</a>.
        </p>
      </section>

      {/* Acciones rápidas */}
      <div className={styles.quickBar}>
        <button type="button" className={styles.btnGhost} onClick={cargarEjemplo}>
          <span aria-hidden="true">✨</span> Cargar ejemplo
        </button>
        <button type="button" className={styles.btnGhostDanger} onClick={vaciar}>
          <span aria-hidden="true">🧹</span> Vaciar
        </button>
      </div>

      <div className={styles.layout}>
        {/* ── Editor ── */}
        <div className={styles.editor}>
          {/* Datos personales */}
          <section className={styles.bloque}>
            <h2 className={styles.bloqueTitulo}>
              <span aria-hidden="true">👤</span> Datos personales
            </h2>
            <div className={styles.grid2}>
              <label className={styles.campo}>
                <span className={styles.label}>Nombre completo</span>
                <input
                  className={styles.input}
                  type="text"
                  value={cv.nombre}
                  onChange={(e) => setCampo({ nombre: e.target.value })}
                  placeholder="Nombre y apellidos"
                  autoComplete="name"
                />
              </label>
              <label className={styles.campo}>
                <span className={styles.label}>Titular profesional</span>
                <input
                  className={styles.input}
                  type="text"
                  value={cv.titular}
                  onChange={(e) => setCampo({ titular: e.target.value })}
                  placeholder="Ej.: Graduada en Administración · Marketing"
                />
              </label>
              <label className={styles.campo}>
                <span className={styles.label}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  value={cv.email}
                  onChange={(e) => setCampo({ email: e.target.value })}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </label>
              <label className={styles.campo}>
                <span className={styles.label}>Teléfono</span>
                <input
                  className={styles.input}
                  type="tel"
                  value={cv.telefono}
                  onChange={(e) => setCampo({ telefono: e.target.value })}
                  placeholder="+34 600 000 000"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
              <label className={styles.campo}>
                <span className={styles.label}>Ubicación</span>
                <input
                  className={styles.input}
                  type="text"
                  value={cv.ubicacion}
                  onChange={(e) => setCampo({ ubicacion: e.target.value })}
                  placeholder="Ciudad, país"
                />
              </label>
              <label className={styles.campo}>
                <span className={styles.label}>LinkedIn</span>
                <input
                  className={styles.input}
                  type="text"
                  value={cv.linkedin}
                  onChange={(e) => setCampo({ linkedin: e.target.value })}
                  placeholder="linkedin.com/in/tuperfil"
                />
              </label>
              <label className={styles.campo}>
                <span className={styles.label}>Web / portafolio</span>
                <input
                  className={styles.input}
                  type="text"
                  value={cv.web}
                  onChange={(e) => setCampo({ web: e.target.value })}
                  placeholder="tuweb.com"
                />
              </label>
            </div>
          </section>

          {/* Resumen */}
          <section className={styles.bloque}>
            <h2 className={styles.bloqueTitulo}>
              <span aria-hidden="true">📝</span> Resumen profesional
            </h2>
            <p className={styles.ayuda}>
              2-4 líneas: quién eres, qué aportas y qué buscas. Incluye un logro con cifras si puedes.
            </p>
            <textarea
              className={styles.textarea}
              value={cv.resumen}
              onChange={(e) => setCampo({ resumen: e.target.value })}
              rows={4}
              placeholder="Ej.: Recién graduada en… Durante las prácticas aumenté… Busco mi primer empleo en…"
            />
          </section>

          {/* Experiencia */}
          <section className={styles.bloque}>
            <div className={styles.bloqueHead}>
              <h2 className={styles.bloqueTitulo}>
                <span aria-hidden="true">💼</span> Experiencia
              </h2>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() =>
                  setCv((p) => ({
                    ...p,
                    experiencia: [
                      ...p.experiencia,
                      {
                        id: nuevoId(),
                        puesto: '',
                        empresa: '',
                        ubicacion: '',
                        inicio: '',
                        fin: '',
                        actual: false,
                        descripcion: '',
                      } as Experiencia,
                    ],
                  }))
                }
              >
                <span aria-hidden="true">＋</span> Añadir
              </button>
            </div>
            {cv.experiencia.length === 0 && (
              <p className={styles.vacio}>Sin experiencia. ¿Es tu primer empleo? Usa formación y proyectos.</p>
            )}
            {cv.experiencia.map((e, i) => (
              <div key={e.id} className={styles.item}>
                <div className={styles.itemBar}>
                  <span className={styles.itemNum}>#{i + 1}</span>
                  <div className={styles.itemBtns}>
                    <button type="button" className={styles.btnIcon} aria-label="Subir" disabled={i === 0} onClick={() => setCv((p) => ({ ...p, experiencia: arrMove(p.experiencia, e.id, -1) }))}>↑</button>
                    <button type="button" className={styles.btnIcon} aria-label="Bajar" disabled={i === cv.experiencia.length - 1} onClick={() => setCv((p) => ({ ...p, experiencia: arrMove(p.experiencia, e.id, 1) }))}>↓</button>
                    <button type="button" className={styles.btnIconDanger} aria-label="Eliminar" onClick={() => setCv((p) => ({ ...p, experiencia: arrDel(p.experiencia, e.id) }))}>✕</button>
                  </div>
                </div>
                <div className={styles.grid2}>
                  <input className={styles.input} type="text" aria-label="Puesto" placeholder="Puesto" value={e.puesto} onChange={(ev) => setCv((p) => ({ ...p, experiencia: arrUpd(p.experiencia, e.id, { puesto: ev.target.value }) }))} />
                  <input className={styles.input} type="text" aria-label="Empresa" placeholder="Empresa" value={e.empresa} onChange={(ev) => setCv((p) => ({ ...p, experiencia: arrUpd(p.experiencia, e.id, { empresa: ev.target.value }) }))} />
                  <input className={styles.input} type="text" aria-label="Ubicación" placeholder="Ubicación" value={e.ubicacion} onChange={(ev) => setCv((p) => ({ ...p, experiencia: arrUpd(p.experiencia, e.id, { ubicacion: ev.target.value }) }))} />
                  <div className={styles.fechas}>
                    <input className={styles.input} type="text" aria-label="Fecha de inicio" placeholder="Inicio (MM/AAAA)" value={e.inicio} onChange={(ev) => setCv((p) => ({ ...p, experiencia: arrUpd(p.experiencia, e.id, { inicio: ev.target.value }) }))} />
                    <input className={styles.input} type="text" aria-label="Fecha de fin" placeholder="Fin" value={e.fin} disabled={e.actual} onChange={(ev) => setCv((p) => ({ ...p, experiencia: arrUpd(p.experiencia, e.id, { fin: ev.target.value }) }))} />
                  </div>
                </div>
                <label className={styles.check}>
                  <input type="checkbox" checked={e.actual} onChange={(ev) => setCv((p) => ({ ...p, experiencia: arrUpd(p.experiencia, e.id, { actual: ev.target.checked }) }))} />
                  <span>Trabajo aquí actualmente</span>
                </label>
                <textarea className={styles.textarea} aria-label="Descripción y logros" rows={3} placeholder="Logros con cifras: 'Aumenté X un 30%…'. Una línea por logro." value={e.descripcion} onChange={(ev) => setCv((p) => ({ ...p, experiencia: arrUpd(p.experiencia, e.id, { descripcion: ev.target.value }) }))} />
              </div>
            ))}
          </section>

          {/* Formación */}
          <section className={styles.bloque}>
            <div className={styles.bloqueHead}>
              <h2 className={styles.bloqueTitulo}>
                <span aria-hidden="true">🎓</span> Formación
              </h2>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() =>
                  setCv((p) => ({
                    ...p,
                    formacion: [
                      ...p.formacion,
                      { id: nuevoId(), titulo: '', centro: '', ubicacion: '', inicio: '', fin: '', actual: false, detalle: '' } as Formacion,
                    ],
                  }))
                }
              >
                <span aria-hidden="true">＋</span> Añadir
              </button>
            </div>
            {cv.formacion.length === 0 && <p className={styles.vacio}>Añade tus estudios, cursos o formación relevante.</p>}
            {cv.formacion.map((f, i) => (
              <div key={f.id} className={styles.item}>
                <div className={styles.itemBar}>
                  <span className={styles.itemNum}>#{i + 1}</span>
                  <div className={styles.itemBtns}>
                    <button type="button" className={styles.btnIcon} aria-label="Subir" disabled={i === 0} onClick={() => setCv((p) => ({ ...p, formacion: arrMove(p.formacion, f.id, -1) }))}>↑</button>
                    <button type="button" className={styles.btnIcon} aria-label="Bajar" disabled={i === cv.formacion.length - 1} onClick={() => setCv((p) => ({ ...p, formacion: arrMove(p.formacion, f.id, 1) }))}>↓</button>
                    <button type="button" className={styles.btnIconDanger} aria-label="Eliminar" onClick={() => setCv((p) => ({ ...p, formacion: arrDel(p.formacion, f.id) }))}>✕</button>
                  </div>
                </div>
                <div className={styles.grid2}>
                  <input className={styles.input} type="text" aria-label="Título" placeholder="Título / estudios" value={f.titulo} onChange={(ev) => setCv((p) => ({ ...p, formacion: arrUpd(p.formacion, f.id, { titulo: ev.target.value }) }))} />
                  <input className={styles.input} type="text" aria-label="Centro" placeholder="Centro / institución" value={f.centro} onChange={(ev) => setCv((p) => ({ ...p, formacion: arrUpd(p.formacion, f.id, { centro: ev.target.value }) }))} />
                  <input className={styles.input} type="text" aria-label="Ubicación" placeholder="Ubicación" value={f.ubicacion} onChange={(ev) => setCv((p) => ({ ...p, formacion: arrUpd(p.formacion, f.id, { ubicacion: ev.target.value }) }))} />
                  <div className={styles.fechas}>
                    <input className={styles.input} type="text" aria-label="Fecha de inicio" placeholder="Inicio" value={f.inicio} onChange={(ev) => setCv((p) => ({ ...p, formacion: arrUpd(p.formacion, f.id, { inicio: ev.target.value }) }))} />
                    <input className={styles.input} type="text" aria-label="Fecha de fin" placeholder="Fin" value={f.fin} disabled={f.actual} onChange={(ev) => setCv((p) => ({ ...p, formacion: arrUpd(p.formacion, f.id, { fin: ev.target.value }) }))} />
                  </div>
                </div>
                <label className={styles.check}>
                  <input type="checkbox" checked={f.actual} onChange={(ev) => setCv((p) => ({ ...p, formacion: arrUpd(p.formacion, f.id, { actual: ev.target.checked }) }))} />
                  <span>En curso</span>
                </label>
                <textarea className={styles.textarea} aria-label="Detalle" rows={2} placeholder="Especialidad, nota, TFG… (opcional)" value={f.detalle} onChange={(ev) => setCv((p) => ({ ...p, formacion: arrUpd(p.formacion, f.id, { detalle: ev.target.value }) }))} />
              </div>
            ))}
          </section>

          {/* Habilidades */}
          <section className={styles.bloque}>
            <h2 className={styles.bloqueTitulo}>
              <span aria-hidden="true">🧩</span> Habilidades
            </h2>
            <p className={styles.ayuda}>
              Una por línea. ¿No sabes tu nivel digital? Descúbrelo con el{' '}
              <a href="/test-competencias-digitales/">test de competencias digitales</a>.
            </p>
            <textarea
              className={styles.textarea}
              value={cv.habilidadesText}
              onChange={(e) => setCampo({ habilidadesText: e.target.value })}
              rows={4}
              placeholder={'Excel avanzado\nGestión de proyectos\nInglés técnico'}
            />
          </section>

          {/* Idiomas */}
          <section className={styles.bloque}>
            <div className={styles.bloqueHead}>
              <h2 className={styles.bloqueTitulo}>
                <span aria-hidden="true">🌐</span> Idiomas
              </h2>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() => setCv((p) => ({ ...p, idiomas: [...p.idiomas, { id: nuevoId(), idioma: '', nivel: 'Intermedio' } as Idioma] }))}
              >
                <span aria-hidden="true">＋</span> Añadir
              </button>
            </div>
            {cv.idiomas.map((idi) => (
              <div key={idi.id} className={styles.itemLinea}>
                <input className={styles.input} type="text" aria-label="Idioma" placeholder="Idioma" value={idi.idioma} onChange={(ev) => setCv((p) => ({ ...p, idiomas: arrUpd(p.idiomas, idi.id, { idioma: ev.target.value }) }))} />
                <select className={styles.input} aria-label="Nivel" value={idi.nivel} onChange={(ev) => setCv((p) => ({ ...p, idiomas: arrUpd(p.idiomas, idi.id, { nivel: ev.target.value }) }))}>
                  {NIVELES_IDIOMA.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button type="button" className={styles.btnIconDanger} aria-label="Eliminar idioma" onClick={() => setCv((p) => ({ ...p, idiomas: arrDel(p.idiomas, idi.id) }))}>✕</button>
              </div>
            ))}
          </section>

          {/* Certificaciones */}
          <section className={styles.bloque}>
            <div className={styles.bloqueHead}>
              <h2 className={styles.bloqueTitulo}>
                <span aria-hidden="true">📜</span> Certificaciones <span className={styles.opcional}>(opcional)</span>
              </h2>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() => setCv((p) => ({ ...p, certificaciones: [...p.certificaciones, { id: nuevoId(), nombre: '', entidad: '', anio: '' } as Certificacion] }))}
              >
                <span aria-hidden="true">＋</span> Añadir
              </button>
            </div>
            {cv.certificaciones.map((c) => (
              <div key={c.id} className={styles.itemLinea}>
                <input className={styles.input} type="text" aria-label="Certificación" placeholder="Certificación" value={c.nombre} onChange={(ev) => setCv((p) => ({ ...p, certificaciones: arrUpd(p.certificaciones, c.id, { nombre: ev.target.value }) }))} />
                <input className={styles.input} type="text" aria-label="Entidad" placeholder="Entidad" value={c.entidad} onChange={(ev) => setCv((p) => ({ ...p, certificaciones: arrUpd(p.certificaciones, c.id, { entidad: ev.target.value }) }))} />
                <input className={`${styles.input} ${styles.inputMini}`} type="text" aria-label="Año" placeholder="Año" value={c.anio} onChange={(ev) => setCv((p) => ({ ...p, certificaciones: arrUpd(p.certificaciones, c.id, { anio: ev.target.value }) }))} />
                <button type="button" className={styles.btnIconDanger} aria-label="Eliminar certificación" onClick={() => setCv((p) => ({ ...p, certificaciones: arrDel(p.certificaciones, c.id) }))}>✕</button>
              </div>
            ))}
          </section>

          {/* Proyectos */}
          <section className={styles.bloque}>
            <div className={styles.bloqueHead}>
              <h2 className={styles.bloqueTitulo}>
                <span aria-hidden="true">🚀</span> Proyectos <span className={styles.opcional}>(opcional)</span>
              </h2>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={() => setCv((p) => ({ ...p, proyectos: [...p.proyectos, { id: nuevoId(), nombre: '', descripcion: '', enlace: '' } as Proyecto] }))}
              >
                <span aria-hidden="true">＋</span> Añadir
              </button>
            </div>
            {cv.proyectos.map((pr) => (
              <div key={pr.id} className={styles.item}>
                <div className={styles.itemBar}>
                  <input className={styles.input} type="text" aria-label="Nombre del proyecto" placeholder="Nombre del proyecto" value={pr.nombre} onChange={(ev) => setCv((p) => ({ ...p, proyectos: arrUpd(p.proyectos, pr.id, { nombre: ev.target.value }) }))} />
                  <button type="button" className={styles.btnIconDanger} aria-label="Eliminar proyecto" onClick={() => setCv((p) => ({ ...p, proyectos: arrDel(p.proyectos, pr.id) }))}>✕</button>
                </div>
                <input className={styles.input} type="text" aria-label="Enlace" placeholder="Enlace (opcional)" value={pr.enlace} onChange={(ev) => setCv((p) => ({ ...p, proyectos: arrUpd(p.proyectos, pr.id, { enlace: ev.target.value }) }))} />
                <textarea className={styles.textarea} aria-label="Descripción del proyecto" rows={2} placeholder="Qué es y qué aportaste" value={pr.descripcion} onChange={(ev) => setCv((p) => ({ ...p, proyectos: arrUpd(p.proyectos, pr.id, { descripcion: ev.target.value }) }))} />
              </div>
            ))}
          </section>

          {/* Color de acento */}
          <section className={styles.bloque}>
            <h2 className={styles.bloqueTitulo}>
              <span aria-hidden="true">🎨</span> Color de acento
            </h2>
            <div className={styles.acentos} role="group" aria-label="Color de acento">
              {ACENTOS.map((a) => (
                <button
                  key={a.hex}
                  type="button"
                  className={`${styles.acentoBtn} ${cv.acento === a.hex ? styles.acentoActivo : ''}`}
                  style={{ background: a.hex }}
                  aria-label={a.nombre}
                  aria-pressed={cv.acento === a.hex}
                  onClick={() => setCampo({ acento: a.hex })}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ── Vista previa + acciones ── */}
        <div className={styles.previewCol}>
          {/* Completitud */}
          <div className={styles.completitud}>
            <div className={styles.completitudHead}>
              <span className={styles.completitudTitulo}>
                <span aria-hidden="true">📊</span> Calidad del CV
              </span>
              <span
                className={`${styles.badge} ${
                  puntuacion >= 6 ? styles.badgeAlta : puntuacion >= 4 ? styles.badgeMedia : styles.badgeBaja
                }`}
              >
                {puntuacion} / {checks.length}
              </span>
            </div>
            <ul className={styles.checkLista}>
              {checks.map((c) => (
                <li key={c.label} className={c.ok ? styles.checkOk : styles.checkPend}>
                  <span aria-hidden="true">{c.ok ? '✅' : '⬜'}</span> {c.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Exportar */}
          <div className={styles.exportar}>
            <button type="button" className={styles.btnPrimary} onClick={abrirImprimible}>
              <span aria-hidden="true">🖨️</span> Abrir versión imprimible (PDF)
            </button>
            <div className={styles.exportRow}>
              <button type="button" className={styles.btnExport} onClick={() => descargar(construirHTML(cv), 'curriculum.html', 'text/html')}>
                <span aria-hidden="true">⬇️</span> HTML
              </button>
              <button type="button" className={styles.btnExport} onClick={() => descargar(construirMarkdown(cv), 'curriculum.md', 'text/markdown')}>
                <span aria-hidden="true">⬇️</span> Markdown
              </button>
              <button type="button" className={styles.btnExport} onClick={copiarTexto}>
                <span aria-hidden="true">📋</span> Texto plano
              </button>
            </div>
          </div>

          {aviso && (
            <p className={styles.aviso} role="status" aria-live="polite">
              {aviso}
            </p>
          )}

          {/* Vista previa */}
          <div className={styles.previewWrap}>
            <span className={styles.previewLabel}>Vista previa</span>
            <div className={styles.preview} style={{ ['--acento' as string]: cv.acento }}>
              <div className={styles.pvHeader}>
                <h3 className={styles.pvNombre}>{cv.nombre || 'Tu nombre'}</h3>
                {cv.titular && <p className={styles.pvTitular}>{cv.titular}</p>}
                {contacto.length > 0 && <p className={styles.pvContacto}>{contacto.join(' · ')}</p>}
              </div>

              {cv.resumen && (
                <div className={styles.pvSeccion}>
                  <h4 className={styles.pvH4}>Resumen profesional</h4>
                  <p className={styles.pvTexto}>{cv.resumen}</p>
                </div>
              )}

              {cv.experiencia.some((e) => e.puesto || e.empresa) && (
                <div className={styles.pvSeccion}>
                  <h4 className={styles.pvH4}>Experiencia</h4>
                  {cv.experiencia.filter((e) => e.puesto || e.empresa).map((e) => (
                    <div key={e.id} className={styles.pvItem}>
                      <div className={styles.pvItemHead}>
                        <strong>{e.puesto}{e.empresa ? ` · ${e.empresa}` : ''}</strong>
                        <span className={styles.pvFecha}>{[e.inicio, e.actual ? 'Actualidad' : e.fin].filter(Boolean).join(' – ')}</span>
                      </div>
                      {e.ubicacion && <div className={styles.pvSub}>{e.ubicacion}</div>}
                      {e.descripcion && <div className={styles.pvTexto}>{e.descripcion}</div>}
                    </div>
                  ))}
                </div>
              )}

              {cv.formacion.some((f) => f.titulo || f.centro) && (
                <div className={styles.pvSeccion}>
                  <h4 className={styles.pvH4}>Formación</h4>
                  {cv.formacion.filter((f) => f.titulo || f.centro).map((f) => (
                    <div key={f.id} className={styles.pvItem}>
                      <div className={styles.pvItemHead}>
                        <strong>{f.titulo}{f.centro ? ` · ${f.centro}` : ''}</strong>
                        <span className={styles.pvFecha}>{[f.inicio, f.actual ? 'En curso' : f.fin].filter(Boolean).join(' – ')}</span>
                      </div>
                      {f.ubicacion && <div className={styles.pvSub}>{f.ubicacion}</div>}
                      {f.detalle && <div className={styles.pvTexto}>{f.detalle}</div>}
                    </div>
                  ))}
                </div>
              )}

              {habilidades.length > 0 && (
                <div className={styles.pvSeccion}>
                  <h4 className={styles.pvH4}>Habilidades</h4>
                  <ul className={styles.pvChips}>
                    {habilidades.map((h, i) => (
                      <li key={`${h}-${i}`}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {cv.idiomas.some((i) => i.idioma) && (
                <div className={styles.pvSeccion}>
                  <h4 className={styles.pvH4}>Idiomas</h4>
                  <ul className={styles.pvChips}>
                    {cv.idiomas.filter((i) => i.idioma).map((i) => (
                      <li key={i.id}>{i.idioma}{i.nivel ? ` — ${i.nivel}` : ''}</li>
                    ))}
                  </ul>
                </div>
              )}

              {cv.certificaciones.some((c) => c.nombre) && (
                <div className={styles.pvSeccion}>
                  <h4 className={styles.pvH4}>Certificaciones</h4>
                  {cv.certificaciones.filter((c) => c.nombre).map((c) => (
                    <div key={c.id} className={styles.pvLinea}>
                      <span>{c.nombre}{c.entidad ? ` · ${c.entidad}` : ''}</span>
                      <span className={styles.pvFecha}>{c.anio}</span>
                    </div>
                  ))}
                </div>
              )}

              {cv.proyectos.some((p) => p.nombre) && (
                <div className={styles.pvSeccion}>
                  <h4 className={styles.pvH4}>Proyectos</h4>
                  {cv.proyectos.filter((p) => p.nombre).map((p) => (
                    <div key={p.id} className={styles.pvItem}>
                      <div className={styles.pvItemHead}>
                        <strong>{p.nombre}</strong>
                        {p.enlace && <span className={styles.pvFecha}>{p.enlace}</span>}
                      </div>
                      {p.descripcion && <div className={styles.pvTexto}>{p.descripcion}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Educativo v2.0 ── */}
      <EducationalSection
        icon="🎓"
        title="Guía completa: cómo hacer un buen currículum"
        subtitle="Estructura, ATS, ejemplos y errores que hacen que descarten tu CV"
      >
        <section className={styles.guideSection}>
          <p>
            El <strong>currículum</strong> (o <strong>hoja de vida</strong>) tiene un único objetivo:
            conseguirte la entrevista. Para lograrlo debe superar dos filtros: el <strong>software
            ATS</strong> que muchas empresas usan para cribar candidaturas, y los pocos segundos que
            una persona dedica a la primera lectura. Un CV claro, concreto y con logros medibles gana
            en ambos.
          </p>

          {/* 1. Tabla comparativa: formatos de CV */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">⚖️</span> Formatos de exportación: cuándo usar cada uno
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Cuándo usarlo</th>
                  <th>Ventaja</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>PDF (imprimir)</strong></td>
                  <td>Enviar por email o subir a un portal</td>
                  <td>Mantiene el diseño en cualquier dispositivo</td>
                </tr>
                <tr>
                  <td><strong>Texto plano</strong></td>
                  <td>Pegar en formularios de candidatura (ATS)</td>
                  <td>El sistema lo lee sin errores de formato</td>
                </tr>
                <tr>
                  <td><strong>HTML</strong></td>
                  <td>Guardar, editar o publicar en web</td>
                  <td>Editable y ligero</td>
                </tr>
                <tr>
                  <td><strong>Markdown</strong></td>
                  <td>Portafolios, GitHub o control de versiones</td>
                  <td>Texto estructurado y reutilizable</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Casos de uso */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">💼</span> Adapta tu CV a tu situación
          </h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h4>Primer empleo</h4>
              </div>
              <p className={styles.escenarioTip}>
                Pon la formación arriba y da peso a proyectos, prácticas y voluntariado. El resumen
                debe dejar claro qué buscas y qué aportas aunque no tengas experiencia laboral.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔄</span>
                <h4>Cambio de sector</h4>
              </div>
              <p className={styles.escenarioTip}>
                Destaca habilidades transversales y traduce tu experiencia al lenguaje del nuevo
                puesto. El resumen es clave para explicar el porqué del cambio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
                <h4>Con experiencia</h4>
              </div>
              <p className={styles.escenarioTip}>
                Prioriza la experiencia reciente y relevante, resume la antigua y cuantifica logros.
                Mantén el CV en 1-2 páginas: la calidad manda sobre la cantidad.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎯</span>
                <h4>Para una oferta concreta</h4>
              </div>
              <p className={styles.escenarioTip}>
                Reordena y reescribe usando palabras clave de la oferta. Un CV a medida supera mejor
                el ATS y demuestra interés real por ese puesto.
              </p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">❓</span> Preguntas frecuentes
          </h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuánto debe medir un currículum?</h4>
              <p>
                Una página si tienes poca experiencia; dos como máximo con trayectoria amplia. Los
                seleccionadores dedican pocos segundos a la primera criba, así que prioriza lo
                relevante y elimina el relleno.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Consejo:</strong> si dudas si algo aporta,
                probablemente sobra. Menos y mejor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo poner foto en el CV?</h4>
              <p>
                Depende del país y del sector. En gran parte de Latinoamérica y de Europa continental
                es habitual; en países anglosajones se evita para prevenir sesgos. Si dudas, un CV sin
                foto es siempre una opción segura y ATS-friendly.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el ATS y cómo lo supero?</h4>
              <p>
                Es el software que lee y clasifica tu CV antes que una persona. Para superarlo: usa una
                sola columna, encabezados estándar (Experiencia, Formación…), texto seleccionable (no
                imágenes de texto) e incluye palabras clave de la oferta. Esta plantilla ya cumple lo
                técnico; las palabras clave las pones tú.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo escribo logros si mi trabajo era rutinario?</h4>
              <p>
                Piensa en resultados, no en tareas: cuánto ahorraste, cuánto mejoraste, a cuántas
                personas atendiste, qué problema resolviste. «Atendí una media de 40 clientes al día
                manteniendo un 95% de satisfacción» dice mucho más que «atención al cliente».
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se guardan mis datos en algún servidor?</h4>
              <p>
                No. Tu currículum se guarda solo en el almacenamiento local de tu navegador. No se
                envía a ningún servidor ni requiere registro. Exporta el PDF o el HTML para
                conservarlo fuera del navegador.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Necesito una carta de presentación además del CV?</h4>
              <p>
                Cuando la oferta lo pide, sí, y ayuda a destacar. Debe ser breve, personalizada y
                complementar el CV, no repetirlo: por qué ese puesto, por qué esa empresa y qué
                aportas tú en concreto.
              </p>
            </div>
          </div>

          {/* 4. Guía paso a paso */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">📋</span> Cómo montar tu CV paso a paso
          </h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Reúne tu información</h4>
                <p>Fechas, puestos, estudios, logros y datos de contacto. Tenerlo a mano agiliza todo lo demás.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Escribe un titular y un resumen</h4>
                <p>El titular sitúa tu perfil de un vistazo; el resumen, en 2-4 líneas, dice qué aportas y qué buscas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Añade experiencia y formación con logros</h4>
                <p>De lo más reciente a lo más antiguo. En cada puesto, prioriza resultados medibles sobre tareas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Completa habilidades e idiomas</h4>
                <p>Incluye las relevantes para la oferta. Si no conoces tu nivel digital, mídelo antes de listarlo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Revisa la calidad y adapta</h4>
                <p>Usa el indicador de calidad, cuida la ortografía y ajusta las palabras clave a cada oferta.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Exporta y prepara la entrevista</h4>
                <p>Guarda el PDF para enviarlo y el texto plano para formularios. Después, prepara tus respuestas STAR.</p>
              </div>
            </div>
          </div>

          {/* 5. Mejores prácticas */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">✅</span> Buenas prácticas
          </h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <h4>Cuantifica</h4>
              <p>Cifras, porcentajes y plazos convencen más que adjetivos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Adapta a la oferta</h4>
              <p>Reescribe y reordena con las palabras clave de cada puesto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✂️</span>
              <h4>Sé breve</h4>
              <p>1-2 páginas. Elimina lo que no aporte a esa candidatura.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <h4>Cuida la forma</h4>
              <p>Sin faltas, tipografía legible y fechas coherentes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤖</span>
              <h4>Piensa en el ATS</h4>
              <p>Una columna, encabezados estándar, texto seleccionable.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <h4>Enlaza tu trabajo</h4>
              <p>LinkedIn, portafolio o proyectos dan pruebas de lo que dices.</p>
            </div>
          </div>

          {/* 6. Warning box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores que hacen que descarten tu CV</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Faltas de ortografía:</strong> transmiten descuido y son de los primeros motivos de descarte. Reléelo o pide a alguien que lo revise.</li>
              <li><strong>❌ Un CV genérico para todo:</strong> el mismo currículum para 50 ofertas rinde poco. Adáptalo a cada una.</li>
              <li><strong>❌ Diseños que el ATS no lee:</strong> columnas múltiples, tablas complejas o texto dentro de imágenes pueden hacer que el sistema no te encuentre.</li>
              <li><strong>❌ Listar tareas en vez de logros:</strong> «responsable de…» aporta poco. Di qué conseguiste y con qué impacto.</li>
              <li><strong>❌ Datos de contacto erróneos:</strong> un email con errata o un teléfono antiguo tiran por tierra todo lo demás.</li>
              <li><strong>❌ Información sensible innecesaria:</strong> evita datos que no aportan y pueden generar sesgos (DNI, estado civil, etc.) salvo que la oferta los pida.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-curriculum')} />
      <ShareCard appName="generador-curriculum" />
      <Footer appName="generador-curriculum" />
    </div>
  );
}
