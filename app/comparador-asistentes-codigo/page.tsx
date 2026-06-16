'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ComparadorAsistentesCodigo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { DataReference } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───

type Privacidad = 'alta' | 'media' | 'baja';
type Tab = 'comparativa' | 'acceso' | 'perfiles' | 'combinaciones';

interface ModoAcceso {
  tipo: 'cli' | 'extension' | 'cloud' | 'web';
  disponible: boolean;
  detalle: string;
}

interface Asistente {
  id: string;
  nombre: string;
  nombreCorto: string;
  empresa: string;
  icono: string;
  color: string;
  modeloBase: string;
  modos: ModoAcceso[];
  idesCompatibles: string[];
  planGratuito: boolean;
  detallePlanGratuito: string;
  detallePlanPago: string;
  precioDesde: string;
  urlPrecios: string;
  privacidad: Privacidad;
  rgpd: boolean;
  agenteAutonomo: boolean;
  completionInline: boolean;
  chat: boolean;
  mejorPara: string[];
  descripcion: string;
  nota?: string;
}

interface PerfilUsuario {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  prioridades: string[];
  recomendado: string;
  alternativa: string;
  razon: string;
}

interface CombinacionIde {
  ide: string;
  icono: string;
  descripcion: string;
  primera: string;
  alternativa: string;
  nota: string;
}

// ─── Datos ───

const ASISTENTES: Asistente[] = [
  {
    id: 'claude-code',
    nombre: 'Claude Code',
    nombreCorto: 'Claude Code',
    empresa: 'Anthropic',
    icono: '🧠',
    color: '#CC785C',
    modeloBase: 'Claude Sonnet 4.6 / Haiku 4.5',
    modos: [
      { tipo: 'cli',       disponible: true,  detalle: 'Claude Code CLI — terminal, instalación vía npm' },
      { tipo: 'extension', disponible: true,  detalle: 'Extensión para VS Code y JetBrains' },
      { tipo: 'cloud',     disponible: false, detalle: 'No tiene agente cloud independiente; opera en tu máquina' },
      { tipo: 'web',       disponible: true,  detalle: 'Claude.ai web para tareas puntuales de código' },
    ],
    idesCompatibles: ['VS Code', 'JetBrains', 'Cursor', 'Windsurf', 'Terminal'],
    planGratuito: false,
    detallePlanGratuito: 'Acceso muy limitado con Claude.ai Free',
    detallePlanPago: 'Pro $20/mes · Max $100/mes · API por uso',
    precioDesde: '$20/mes',
    urlPrecios: 'https://www.anthropic.com/pricing',
    privacidad: 'media',
    rgpd: false,
    agenteAutonomo: true,
    completionInline: true,
    chat: true,
    mejorPara: ['refactoring', 'multi-archivo', 'análisis codebase', 'proyectos complejos'],
    descripcion: 'Agente de desarrollo agentic diseñado para operar en la terminal o IDE con capacidad de leer, editar y navegar proyectos completos. Destaca en tareas largas que requieren entender el contexto de todo el repositorio.',
  },
  {
    id: 'copilot',
    nombre: 'GitHub Copilot',
    nombreCorto: 'Copilot',
    empresa: 'GitHub / Microsoft',
    icono: '🪟',
    color: '#0078D4',
    modeloBase: 'GPT-4o / Claude Sonnet (seleccionable)',
    modos: [
      { tipo: 'cli',       disponible: true,  detalle: 'gh-extension para terminal + Copilot Coding Agent' },
      { tipo: 'extension', disponible: true,  detalle: 'VS Code, JetBrains, Neovim, Xcode, Visual Studio' },
      { tipo: 'cloud',     disponible: true,  detalle: 'Copilot Workspace — agente autónomo en GitHub.com' },
      { tipo: 'web',       disponible: true,  detalle: 'GitHub.com + copilot.github.com' },
    ],
    idesCompatibles: ['VS Code', 'JetBrains', 'Neovim', 'Xcode', 'Visual Studio'],
    planGratuito: true,
    detallePlanGratuito: '2.000 completions/mes + 50 chats/mes — sin tarjeta',
    detallePlanPago: 'Pro $10/mes · Business $19/usuario · Enterprise $39/usuario',
    precioDesde: 'Gratis',
    urlPrecios: 'https://github.com/features/copilot',
    privacidad: 'alta',
    rgpd: true,
    agenteAutonomo: true,
    completionInline: true,
    chat: true,
    mejorPara: ['completions rápidas', 'integración GitHub', 'ecosistema Microsoft', 'equipos'],
    descripcion: 'El asistente de código más extendido del mundo. Su fortaleza es la autocompletación inline en tiempo real. Integración nativa con GitHub para gestión de issues, pull requests y revisiones de código. Plan gratuito generoso.',
  },
  {
    id: 'gemini-code',
    nombre: 'Gemini Code Assist',
    nombreCorto: 'Gemini Code',
    empresa: 'Google',
    icono: '✨',
    color: '#4285F4',
    modeloBase: 'Gemini 2.0 Flash / Gemini 2.5 Pro',
    modos: [
      { tipo: 'cli',       disponible: false, detalle: 'No tiene CLI propia de desarrollo local' },
      { tipo: 'extension', disponible: true,  detalle: 'VS Code, JetBrains, Cloud Shell, Firebase Studio' },
      { tipo: 'cloud',     disponible: true,  detalle: 'Jules — agente experimental para issues de GitHub' },
      { tipo: 'web',       disponible: true,  detalle: 'Gemini.google.com para tareas de código' },
    ],
    idesCompatibles: ['VS Code', 'JetBrains', 'Cloud Shell', 'Firebase Studio'],
    planGratuito: true,
    detallePlanGratuito: '6.000 completions/día — el más generoso del mercado',
    detallePlanPago: 'Enterprise ~$19/usuario/mes (Google Workspace)',
    precioDesde: 'Gratis',
    urlPrecios: 'https://cloud.google.com/products/gemini/code-assist',
    privacidad: 'media',
    rgpd: false,
    agenteAutonomo: true,
    completionInline: true,
    chat: true,
    mejorPara: ['presupuesto cero', 'contexto largo', 'Google Workspace', 'Firebase', 'Android'],
    descripcion: 'La opción gratuita más generosa del mercado. Con 6.000 completions diarias sin coste ni tarjeta, es ideal para estudiantes y desarrolladores con presupuesto ajustado. Aprovecha el contexto largo de los modelos Gemini.',
  },
  {
    id: 'codex',
    nombre: 'Codex / OpenAI',
    nombreCorto: 'Codex',
    empresa: 'OpenAI',
    icono: '⚡',
    color: '#10A37F',
    modeloBase: 'GPT-4o / o3 / o4-mini',
    modos: [
      { tipo: 'cli',       disponible: true,  detalle: 'Codex CLI — herramienta de terminal (2025), similar a Claude Code CLI' },
      { tipo: 'extension', disponible: false, detalle: 'Sin extensión IDE propia (usar Copilot para VS Code con modelos OpenAI)' },
      { tipo: 'cloud',     disponible: true,  detalle: 'Codex (cloud agent) en ChatGPT Plus — trabaja autónomamente en repositorios' },
      { tipo: 'web',       disponible: true,  detalle: 'ChatGPT web/app — para tareas de código puntuales' },
    ],
    idesCompatibles: ['Terminal (Codex CLI)', 'Cualquier IDE (vía ChatGPT web)'],
    planGratuito: false,
    detallePlanGratuito: 'ChatGPT Free muy limitado para código',
    detallePlanPago: 'ChatGPT Plus $20/mes · Pro $200/mes · API por uso',
    precioDesde: '$20/mes',
    urlPrecios: 'https://openai.com/chatgpt',
    privacidad: 'media',
    rgpd: false,
    agenteAutonomo: true,
    completionInline: false,
    chat: true,
    mejorPara: ['razonamiento complejo', 'tareas largas en cloud', 'o3/o4-mini para lógica', 'integración API'],
    descripcion: 'La suite de programación de OpenAI. Codex (cloud agent) destaca por su capacidad de razonamiento complejo con modelos o3/o4-mini. Codex CLI es la alternativa de terminal. No tiene extensión IDE propia.',
    nota: '⚠️ "Codex" tiene 3 significados distintos — ver nota explicativa',
  },
];

const PERFILES: PerfilUsuario[] = [
  {
    id: 'estudiante',
    icono: '🎓',
    nombre: 'Estudiante o principiante',
    descripcion: 'Aprende a programar o hace proyectos personales. Prioridad: sin coste.',
    prioridades: ['Gratuito o muy barato', 'Fácil de instalar', 'Ayuda a entender el código'],
    recomendado: 'copilot',
    alternativa: 'gemini-code',
    razon: 'GitHub Copilot Free ofrece 2.000 completions y 50 chats al mes sin coste. Gemini Code Assist es aún más generoso (6.000/día) si necesitas más volumen.',
  },
  {
    id: 'dev-gratis',
    icono: '💸',
    nombre: 'Desarrollador con 0€ de presupuesto',
    descripcion: 'Programa profesionalmente pero sin querer pagar por herramientas. Necesita volumen de completions.',
    prioridades: ['Sin coste', 'Completions en cantidad', 'Calidad aceptable'],
    recomendado: 'gemini-code',
    alternativa: 'copilot',
    razon: 'Gemini Code Assist es el más generoso en su plan gratuito: 6.000 completions al día, sin tarjeta. Copilot Free es la alternativa con la mejor integración GitHub.',
  },
  {
    id: 'freelance',
    icono: '💼',
    nombre: 'Freelance / Desarrollador profesional',
    descripcion: 'Trabaja en proyectos de clientes, valora calidad y capacidad para tareas complejas.',
    prioridades: ['Calidad en tareas largas', 'Multi-archivo', 'Buen retorno de inversión'],
    recomendado: 'claude-code',
    alternativa: 'copilot',
    razon: 'Claude Code Pro ($20/mes) es el más capaz para refactoring y análisis de proyectos complejos. Copilot Pro ($10/mes) es la alternativa más económica con excelente relación calidad/precio.',
  },
  {
    id: 'empresa',
    icono: '🏢',
    nombre: 'Empresa con requisitos RGPD',
    descripcion: 'Organización que necesita que el código no salga de Europa ni se use para entrenamiento.',
    prioridades: ['RGPD europeo', 'No entrena con código propio', 'Soporte empresarial'],
    recomendado: 'copilot',
    alternativa: 'gemini-code',
    razon: 'GitHub Copilot Business/Enterprise ($19-39/usuario/mes) ofrece servidores en la UE, DPA específico y garantía de no uso del código para entrenamiento. Gemini Enterprise tiene opción de región EU para Google Workspace.',
  },
];

const COMBINACIONES: CombinacionIde[] = [
  {
    ide: 'VS Code',
    icono: '📘',
    descripcion: 'El IDE más popular. Necesita extensión de asistente.',
    primera: 'copilot',
    alternativa: 'claude-code',
    nota: 'Copilot es el asistente nativo de VS Code. Claude Code extensión + CLI es excelente para proyectos complejos.',
  },
  {
    ide: 'Cursor',
    icono: '⚡',
    descripcion: 'IDE IA-nativo con su propio asistente integrado (usa Claude y GPT).',
    primera: 'claude-code',
    alternativa: 'codex',
    nota: 'Cursor ya viene con IA propia. Añadir Claude Code CLI en la terminal es popular para tareas largas de refactoring. Codex CLI como segunda opción si prefieres modelos OpenAI.',
  },
  {
    ide: 'Windsurf',
    icono: '🌊',
    descripcion: 'IDE IA-nativo de Codeium con Flows (agente autónomo integrado).',
    primera: 'claude-code',
    alternativa: 'codex',
    nota: 'Windsurf tiene su propio agente (Flows). Combinar con Claude Code CLI en terminal aporta capacidad de análisis profundo adicional.',
  },
  {
    ide: 'JetBrains',
    icono: '🔥',
    descripcion: 'IDEs para Java, Kotlin, Python, Go... IntelliJ, PyCharm, WebStorm, etc.',
    primera: 'copilot',
    alternativa: 'gemini-code',
    nota: 'Copilot tiene la mejor integración con JetBrains. Gemini Code Assist es la alternativa gratuita con buena extensión. Claude Code también tiene extensión JetBrains.',
  },
  {
    ide: 'Terminal pura',
    icono: '⌨️',
    descripcion: 'Sin GUI, desarrollo en terminal con Vim, Neovim o similar.',
    primera: 'claude-code',
    alternativa: 'codex',
    nota: 'Claude Code CLI es la opción más madura y capaz para desarrollo en terminal. Codex CLI de OpenAI es la alternativa más reciente.',
  },
];

const MODO_LABELS: Record<string, string> = {
  cli: 'CLI / Terminal',
  extension: 'Extensión IDE',
  cloud: 'Agente Cloud',
  web: 'Web / Chat',
};

const MODO_ICONOS: Record<string, string> = {
  cli: '⌨️',
  extension: '🔌',
  cloud: '☁️',
  web: '🌐',
};

function badgePrivacidad(p: Privacidad): string {
  if (p === 'alta') return '🟢 Alta';
  if (p === 'media') return '🟡 Media';
  return '🔴 Baja';
}

// ─── Componente ───

export default function ComparadorAsistentesCodigo() {
  const [tab, setTab] = useState<Tab>('comparativa');
  const [expandido, setExpandido] = useState<string | null>(null);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<string | null>(null);

  const perfilActivo = PERFILES.find((p) => p.id === perfilSeleccionado) ?? null;

  function getAsistente(id: string): Asistente | undefined {
    return ASISTENTES.find((a) => a.id === id);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Asistentes de Código IA 2026</h1>
        <p className={styles.heroSubtitle}>
          Claude Code · GitHub Copilot · Gemini Code Assist · Codex/OpenAI — guía comparativa para elegir el correcto
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Nota Codex */}
        <div className={styles.codexNota} role="note">
          <span className={styles.codexNotaIcono} aria-hidden="true">⚠️</span>
          <div>
            <strong>La confusión con &ldquo;Codex&rdquo;:</strong> El término ha tenido tres significados en OpenAI:
            el modelo de 2021 (ya retirado), el agente cloud de 2025 (disponible en ChatGPT Plus), y Codex CLI
            (herramienta de terminal de 2025). GitHub Copilot, aunque usa modelos de OpenAI, es un producto
            independiente de Microsoft/GitHub. En esta guía &ldquo;Codex&rdquo; se refiere a las herramientas actuales de OpenAI para programación.
          </div>
        </div>

        {/* Tabs */}
        <nav className={styles.tabsNav} role="tablist" aria-label="Secciones del comparador">
          {([
            { id: 'comparativa', label: '🗂️ Comparativa' },
            { id: 'acceso',      label: '🔌 Formas de acceso' },
            { id: 'perfiles',    label: '👤 Por perfil' },
            { id: 'combinaciones', label: '🔗 IDE + Asistente' },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`${styles.tabBtn} ${tab === id ? styles.tabBtnActive : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ─── Tab 1: Comparativa ─── */}
        {tab === 'comparativa' && (
          <div className={styles.tabContent} role="tabpanel">
            <div className={styles.dataNotice} role="note">
              <span aria-hidden="true">📅</span> Datos verificados en junio 2026. Precios y funcionalidades cambian frecuentemente — verifica siempre en las webs oficiales antes de suscribirte.
            </div>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla} aria-label="Comparativa de asistentes de código IA">
                <thead>
                  <tr>
                    <th className={styles.th}>Asistente</th>
                    <th className={styles.th}>Modelo base</th>
                    <th className={styles.th}>Plan gratuito</th>
                    <th className={styles.th}>Desde</th>
                    <th className={styles.th}>Inline</th>
                    <th className={styles.th}>Agente</th>
                    <th className={styles.th}>Privacidad</th>
                    <th className={styles.th}>RGPD</th>
                  </tr>
                </thead>
                <tbody>
                  {ASISTENTES.map((a) => (
                    <>
                      <tr
                        key={a.id}
                        className={`${styles.tr} ${expandido === a.id ? styles.trExpandido : ''}`}
                        onClick={() => setExpandido(expandido === a.id ? null : a.id)}
                        role="button"
                        aria-expanded={expandido === a.id}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandido(expandido === a.id ? null : a.id); }}
                        aria-label={`Ver detalle de ${a.nombre}`}
                      >
                        <td className={styles.td}>
                          <div className={styles.asistenteCell}>
                            <span className={styles.asistenteIcono} style={{ color: a.color }} aria-hidden="true">{a.icono}</span>
                            <div>
                              <span className={styles.asistenteNombre}>{a.nombre}</span>
                              <span className={styles.asistenteEmpresa}>{a.empresa}</span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}><span className={styles.modeloLabel}>{a.modeloBase}</span></td>
                        <td className={styles.td}>{a.planGratuito ? <span className={styles.siTag}>✅ Sí</span> : <span className={styles.noTag}>❌ No</span>}</td>
                        <td className={styles.td}><span className={styles.precioTag} style={{ borderColor: a.color, color: a.color }}>{a.precioDesde}</span></td>
                        <td className={styles.td}>{a.completionInline ? '✅' : '❌'}</td>
                        <td className={styles.td}>{a.agenteAutonomo ? '✅' : '❌'}</td>
                        <td className={styles.td}><span className={styles.privacidadLabel}>{badgePrivacidad(a.privacidad)}</span></td>
                        <td className={styles.td}>{a.rgpd ? '✅' : '❌'}</td>
                      </tr>
                      {expandido === a.id && (
                        <tr key={`${a.id}-det`} className={styles.trDetalle}>
                          <td colSpan={8} className={styles.tdDetalle}>
                            <div className={styles.detalleInner}>
                              <p className={styles.detalleDesc}>{a.descripcion}</p>
                              {a.nota && <p className={styles.detalleNota}>{a.nota}</p>}
                              <div className={styles.detalleFila}>
                                <span className={styles.detalleEtiqueta}>Plan gratuito:</span>
                                <span>{a.detallePlanGratuito}</span>
                              </div>
                              <div className={styles.detalleFila}>
                                <span className={styles.detalleEtiqueta}>Planes de pago:</span>
                                <span>{a.detallePlanPago}</span>
                              </div>
                              <div className={styles.detalleFila}>
                                <span className={styles.detalleEtiqueta}>IDEs compatibles:</span>
                                <span>{a.idesCompatibles.join(' · ')}</span>
                              </div>
                              <div className={styles.detalleMejorPara}>
                                {a.mejorPara.map((t) => (
                                  <span key={t} className={styles.mejorTag}>{t}</span>
                                ))}
                              </div>
                              <a href={a.urlPrecios} target="_blank" rel="noopener noreferrer" className={styles.enlaceOficial}>
                                🔗 Precios oficiales →
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Tab 2: Formas de acceso ─── */}
        {tab === 'acceso' && (
          <div className={styles.tabContent} role="tabpanel">
            <p className={styles.tabIntro}>
              Cada asistente se puede usar de formas distintas. Selecciona el modo que mejor encaja con tu flujo de trabajo.
            </p>
            {(['cli', 'extension', 'cloud', 'web'] as const).map((modo) => (
              <div key={modo} className={styles.modoBloque}>
                <h3 className={styles.modoTitulo}>
                  <span aria-hidden="true">{MODO_ICONOS[modo]}</span>
                  {MODO_LABELS[modo]}
                </h3>
                <div className={styles.modoGrid}>
                  {ASISTENTES.map((a) => {
                    const m = a.modos.find((md) => md.tipo === modo);
                    return (
                      <div
                        key={a.id}
                        className={`${styles.modoCard} ${m?.disponible ? styles.modoCardDisponible : styles.modoCardNoDisponible}`}
                      >
                        <div className={styles.modoCardHeader}>
                          <span className={styles.modoCardIcono} style={{ color: m?.disponible ? a.color : '#999' }} aria-hidden="true">{a.icono}</span>
                          <span className={styles.modoCardNombre}>{a.nombreCorto}</span>
                          <span className={m?.disponible ? styles.badgeSi : styles.badgeNo}>
                            {m?.disponible ? '✅' : '❌'}
                          </span>
                        </div>
                        <p className={styles.modoCardDetalle}>{m?.detalle ?? '—'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Tab 3: Por perfil ─── */}
        {tab === 'perfiles' && (
          <div className={styles.tabContent} role="tabpanel">
            <p className={styles.tabIntro}>Selecciona el perfil que mejor te describe para ver la recomendación.</p>
            <div className={styles.perfilesGrid}>
              {PERFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.perfilCard} ${perfilSeleccionado === p.id ? styles.perfilCardActivo : ''}`}
                  onClick={() => setPerfilSeleccionado(perfilSeleccionado === p.id ? null : p.id)}
                  aria-pressed={perfilSeleccionado === p.id}
                >
                  <span className={styles.perfilIcono} aria-hidden="true">{p.icono}</span>
                  <h3 className={styles.perfilNombre}>{p.nombre}</h3>
                  <p className={styles.perfilDesc}>{p.descripcion}</p>
                  <ul className={styles.perfilPrioridades}>
                    {p.prioridades.map((pr) => <li key={pr}>{pr}</li>)}
                  </ul>
                </button>
              ))}
            </div>

            {perfilActivo && (() => {
              const rec = getAsistente(perfilActivo.recomendado);
              const alt = getAsistente(perfilActivo.alternativa);
              return (
                <div className={styles.recomendacionPanel} role="region" aria-label={`Recomendación para ${perfilActivo.nombre}`}>
                  <h3 className={styles.recomendacionTitulo}>
                    {perfilActivo.icono} Recomendación para {perfilActivo.nombre}
                  </h3>
                  <div className={styles.recomendacionCards}>
                    {rec && (
                      <div className={styles.recomendacionCard} style={{ borderColor: rec.color }}>
                        <div className={styles.recomendacionBadge} style={{ background: rec.color }}>Primera opción</div>
                        <span className={styles.recomendacionIcono} style={{ color: rec.color }} aria-hidden="true">{rec.icono}</span>
                        <p className={styles.recomendacionNombre}>{rec.nombre}</p>
                        <p className={styles.recomendacionPrecio}>{rec.planGratuito ? `Gratis · ${rec.precioDesde} pago` : `Desde ${rec.precioDesde}`}</p>
                      </div>
                    )}
                    {alt && (
                      <div className={styles.recomendacionCard} style={{ borderColor: '#CCCCCC' }}>
                        <div className={styles.recomendacionBadge} style={{ background: '#888' }}>Alternativa</div>
                        <span className={styles.recomendacionIcono} style={{ color: alt.color }} aria-hidden="true">{alt.icono}</span>
                        <p className={styles.recomendacionNombre}>{alt.nombre}</p>
                        <p className={styles.recomendacionPrecio}>{alt.planGratuito ? `Gratis · ${alt.precioDesde} pago` : `Desde ${alt.precioDesde}`}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.razonBox}>
                    <span className={styles.razonIcono} aria-hidden="true">💡</span>
                    {perfilActivo.razon}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ─── Tab 4: Combinaciones ─── */}
        {tab === 'combinaciones' && (
          <div className={styles.tabContent} role="tabpanel">
            <p className={styles.tabIntro}>
              Muchos IDEs con IA integrada (Cursor, Windsurf) <strong>ya incluyen su propio asistente</strong>.
              Añadir un asistente externo es opcional pero puede potenciar tareas largas y complejas.
            </p>
            <div className={styles.combinacionesGrid}>
              {COMBINACIONES.map((c) => {
                const primera = getAsistente(c.primera);
                const alt = getAsistente(c.alternativa);
                return (
                  <div key={c.ide} className={styles.combinacionCard}>
                    <div className={styles.combinacionHeader}>
                      <span className={styles.combinacionIdeIcono} aria-hidden="true">{c.icono}</span>
                      <div>
                        <h3 className={styles.combinacionIdeNombre}>{c.ide}</h3>
                        <p className={styles.combinacionIdeDesc}>{c.descripcion}</p>
                      </div>
                    </div>
                    <div className={styles.combinacionAsistentes}>
                      {primera && (
                        <div className={styles.combinacionAsistente}>
                          <span className={styles.combinacionLabel}>1ª opción</span>
                          <span style={{ color: primera.color }}><span aria-hidden="true">{primera.icono}</span> {primera.nombreCorto}</span>
                        </div>
                      )}
                      {alt && (
                        <div className={styles.combinacionAsistente}>
                          <span className={styles.combinacionLabel}>Alternativa</span>
                          <span style={{ color: alt.color }}><span aria-hidden="true">{alt.icono}</span> {alt.nombreCorto}</span>
                        </div>
                      )}
                    </div>
                    <p className={styles.combinacionNota}>{c.nota}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DataReference
          normativa="Precios y planes de asistentes de código IA"
          fuente="Anthropic · GitHub/Microsoft · Google Cloud · OpenAI — páginas oficiales de precios"
          verificado="2026-06-01"
          nota="Precios en USD verificados en junio 2026. Los planes de IA cambian con frecuencia — verifica siempre en la web oficial antes de suscribirte."
        />
      </main>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Cómo elegir y usar asistentes de código IA"
        subtitle="Conceptos clave, flujos de trabajo y errores frecuentes"
      >
        <p>
          Los asistentes de código IA se pueden clasificar en dos grandes categorías: los que se integran en tu IDE como extensión y te ayudan mientras escribes (completions, chat en panel lateral), y los que actúan como <strong>agentes autónomos</strong> capaces de navegar el repositorio, leer archivos, ejecutar comandos y hacer cambios multi-archivo. La diferencia práctica es enorme: una extensión responde a lo que tú escribes; un agente puede tomar la iniciativa de entender el proyecto y proponer cambios estructurales.
        </p>
        <p>
          Ningún asistente es mejor en todo. Claude Code destaca en tareas complejas de largo recorrido. Copilot destaca en completions rápidas y flujo de trabajo GitHub. Gemini Code es la opción gratuita más generosa. Y los modelos o3/o4-mini de OpenAI destacan en razonamiento lógico complejo. La elección óptima depende de tu flujo de trabajo, presupuesto y si trabajas en empresas con requisitos RGPD.
        </p>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Comparativa de formas de acceso
        </h4>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Forma de acceso</th>
                <th>Claude Code</th>
                <th>Copilot</th>
                <th>Gemini Code</th>
                <th>Codex/OpenAI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>CLI / Terminal</strong></td>
                <td>✅ Claude Code CLI</td>
                <td>✅ gh extension</td>
                <td>❌</td>
                <td>✅ Codex CLI</td>
              </tr>
              <tr>
                <td><strong>Extensión IDE</strong></td>
                <td>✅ VS Code, JetBrains</td>
                <td>✅ VS Code, JetBrains, Neovim, Xcode</td>
                <td>✅ VS Code, JetBrains</td>
                <td>❌ Sin extensión propia</td>
              </tr>
              <tr>
                <td><strong>Agente cloud autónomo</strong></td>
                <td>❌ Opera en tu máquina</td>
                <td>✅ Copilot Workspace</td>
                <td>✅ Jules (experimental)</td>
                <td>✅ Codex (cloud agent)</td>
              </tr>
              <tr>
                <td><strong>Chat web / app</strong></td>
                <td>✅ Claude.ai</td>
                <td>✅ copilot.github.com</td>
                <td>✅ gemini.google.com</td>
                <td>✅ ChatGPT</td>
              </tr>
              <tr>
                <td><strong>Plan gratuito</strong></td>
                <td>❌ Solo muy limitado</td>
                <td>✅ 2.000 comp/mes</td>
                <td>✅ 6.000 comp/día</td>
                <td>❌ Muy limitado</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Perfiles y sus necesidades
        </h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🎓 Estudiante</strong>
            <p>Prioriza el coste cero. GitHub Copilot Free o Gemini Code Assist cubren las necesidades de aprendizaje sin tarjeta de crédito.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>💼 Freelance</strong>
            <p>Claude Code Pro o Copilot Pro a $10-20/mes. El ROI se amortiza en pocas horas de trabajo ahorrado al mes en proyectos de clientes.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🏢 Empresa RGPD</strong>
            <p>GitHub Copilot Business/Enterprise con opción de región EU. Es el único con DPA europeo consolidado y garantía de no uso del código para entrenamiento.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🔬 Proyectos complejos</strong>
            <p>Claude Code para análisis profundo de arquitecturas y refactoring multi-archivo. Combina bien con Cursor o VS Code como IDE principal.</p>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Preguntas frecuentes
        </h4>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Puedo usar dos asistentes a la vez?</strong>
            <span>Sí. Es habitual combinar el asistente nativo del IDE (Cursor, Windsurf) para completions en tiempo real con Claude Code CLI en la terminal para tareas largas de refactoring o análisis de arquitectura. Las dos herramientas no se interfieren entre sí.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Mi código se usa para entrenar los modelos?</strong>
            <span>Depende del plan. Todos los proveedores en planes gratuitos o básicos pueden usar las interacciones para mejorar los modelos (aunque con limitaciones). En planes Business/Enterprise (especialmente Copilot), hay garantías contractuales de no uso del código para entrenamiento. Verifica siempre la política de privacidad del plan que eliges.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Codex de OpenAI es lo mismo que GitHub Copilot?</strong>
            <span>No. GitHub Copilot es un producto de GitHub/Microsoft que usa modelos de OpenAI por debajo, pero es independiente. Codex es el nombre de las herramientas de codificación directas de OpenAI: el agente cloud (disponible en ChatGPT Plus) y Codex CLI (herramienta de terminal). Son productos distintos de empresas distintas aunque relacionadas (Microsoft es accionista de OpenAI).</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué asistente funciona mejor con Cursor o Windsurf?</strong>
            <span>Cursor y Windsurf ya incluyen su propia IA integrada con múltiples modelos (Claude, GPT-4o, etc.). No necesitas añadir un asistente separado para el IDE en sí. Sin embargo, Claude Code CLI en la terminal complementa bien a ambos IDEs para tareas de arquitectura o análisis de código que requieren más contexto del que el IDE proporciona por defecto.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Merece la pena pagar por un asistente de código?</strong>
            <span>Para uso profesional, sí. Un desarrollador que ahorra 1 hora al día con un asistente amortiza una suscripción de $20/mes en menos de una hora de trabajo. La pregunta real es cuál: si priorizas completions rápidas → Copilot; tareas complejas → Claude Code; presupuesto cero → Gemini Code Assist.</span>
          </li>
        </ul>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Cómo empezar con cualquier asistente de código
        </h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Define tu flujo de trabajo</strong> — ¿Usas VS Code, Cursor o JetBrains? ¿Trabajas en terminal? ¿Necesitas agente autónomo o solo completions? La respuesta determina qué tipo de herramienta necesitas antes de mirar marcas.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Prueba el plan gratuito primero</strong> — GitHub Copilot Free y Gemini Code Assist son suficientemente capaces para evaluar si un asistente mejora tu productividad antes de pagar nada.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Instala y configura CLAUDE.md o equivalente</strong> — Los asistentes agenticos (Claude Code, Copilot Workspace) funcionan mucho mejor cuando les das contexto del proyecto: arquitectura, convenciones, qué NO debe tocar.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Revisa siempre el código generado</strong> — Los asistentes cometen errores. Revisa cada cambio como si fuera una Pull Request de un desarrollador junior: puede ser brillante o contener bugs sutiles.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Considera privacidad para código propietario</strong> — Si tu código contiene secretos comerciales o datos de clientes, elige un plan con garantías contractuales o configura el opt-out de entrenamiento.
            </div>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Buenas prácticas
        </h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <strong>Da contexto al asistente</strong>
            Antes de pedir cambios, explica qué hace el proyecto, qué tecnologías usa y cuáles son las convenciones. Un asistente sin contexto genera código genérico.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Verifica los tests</strong>
            Los asistentes pueden generar código que parece correcto pero falla en casos edge. Ejecuta siempre los tests existentes después de aplicar cambios.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📦</span>
            <strong>No instales dependencias sin revisar</strong>
            Si el asistente propone añadir una librería, revisa su mantenimiento, licencia y tamaño antes de incluirla en el proyecto.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔒</span>
            <strong>Nunca pongas secretos en el contexto</strong>
            No compartas tokens de API, contraseñas ni datos de clientes en los prompts. Los asistentes cloud procesan ese texto en servidores externos.
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al usar asistentes de código</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Aceptar los cambios sin revisarlos — los asistentes pueden introducir bugs sutiles o sobreescribir lógica correcta.</li>
            <li>Confiar en el código de tests generado automáticamente — a veces el asistente genera tests que siempre pasan pero no cubren los casos importantes.</li>
            <li>Usar el plan gratuito para código confidencial sin leer la política de privacidad del proveedor.</li>
            <li>Comparar precios sin considerar el plan real que necesitas — el plan Free puede ser suficiente o el plan Enterprise puede ser necesario; el intermedio no siempre es el óptimo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-asistentes-codigo')} />
      <ShareCard appName="comparador-asistentes-codigo" />
      <Footer appName="comparador-asistentes-codigo" />
    </div>
  );
}
