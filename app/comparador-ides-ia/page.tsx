'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ComparadorIdesIa.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { DataReference } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───

type Tab = 'comparativa' | 'ia' | 'lenguajes' | 'perfiles';
type Disponibilidad = boolean | 'parcial';

interface IDE {
  id: string;
  nombre: string;
  empresa: string;
  icono: string;
  color: string;
  basado: string;
  planGratuito: boolean;
  detallePlanGratuito: string;
  detallePlanPago: string;
  precioDesde: string;
  urlPrecios: string;
  iaNativa: boolean;
  modelosIA: string;
  completionInline: boolean;
  chatIA: boolean;
  agenteAutonomo: Disponibilidad;
  extensionesVSCode: boolean;
  openSource: boolean;
  colaboracion: Disponibilidad;
  os: string[];
  mejorPara: string[];
  descripcion: string;
  nota?: string;
}

interface RecomLenguaje {
  lenguaje: string;
  icono: string;
  primera: string;
  alternativa: string;
  razon: string;
}

interface Perfil {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  prioridades: string[];
  recomendado: string;
  alternativa: string;
  razon: string;
}

// ─── Datos ───

const IDES: IDE[] = [
  {
    id: 'cursor',
    nombre: 'Cursor',
    empresa: 'Anysphere',
    icono: '⚡',
    color: '#7C3AED',
    basado: 'Fork de VS Code',
    planGratuito: true,
    detallePlanGratuito: '500 peticiones IA/mes — sin tarjeta',
    detallePlanPago: 'Pro $20/mes · Business $40/usuario/mes',
    precioDesde: 'Gratis',
    urlPrecios: 'https://www.cursor.com/pricing',
    iaNativa: true,
    modelosIA: 'Claude Sonnet, GPT-4o, Gemini, modelos locales',
    completionInline: true,
    chatIA: true,
    agenteAutonomo: true,
    extensionesVSCode: true,
    openSource: false,
    colaboracion: false,
    os: ['Windows', 'Mac', 'Linux'],
    mejorPara: ['web', 'fullstack', 'IA agentiva', 'refactoring'],
    descripcion: 'El IDE IA más popular del mercado. Fork de VS Code con IA nativa que permite elegir entre Claude, GPT-4o, Gemini y modelos locales. Su modo Composer/Agent realiza ediciones multi-archivo autónomas. Compatible con todas las extensiones de VS Code.',
  },
  {
    id: 'windsurf',
    nombre: 'Windsurf',
    empresa: 'Codeium',
    icono: '🌊',
    color: '#06B6D4',
    basado: 'Fork de VS Code',
    planGratuito: true,
    detallePlanGratuito: 'Plan Free con créditos de IA incluidos',
    detallePlanPago: 'Pro $15/mes · Teams $30/usuario/mes',
    precioDesde: 'Gratis',
    urlPrecios: 'https://codeium.com/windsurf/pricing',
    iaNativa: true,
    modelosIA: 'Windsurf Wave (propio), Claude, GPT-4o',
    completionInline: true,
    chatIA: true,
    agenteAutonomo: true,
    extensionesVSCode: true,
    openSource: false,
    colaboracion: false,
    os: ['Windows', 'Mac', 'Linux'],
    mejorPara: ['web', 'fullstack', 'tareas largas autónomas', 'presupuesto ajustado'],
    descripcion: 'Competidor directo de Cursor con su función Flows para tareas autónomas de largo alcance. Precio ligeramente inferior, con modelo propio (Windsurf Wave) muy eficiente. La elección entre Cursor y Windsurf suele ser de preferencia personal.',
  },
  {
    id: 'vscode',
    nombre: 'VS Code',
    empresa: 'Microsoft',
    icono: '📘',
    color: '#0078D4',
    basado: 'Electron + Monaco (open source)',
    planGratuito: true,
    detallePlanGratuito: '100% gratuito — solo pagas por el asistente IA que añadas',
    detallePlanPago: 'Sin coste base (asistentes IA: desde $0 a $20/mes)',
    precioDesde: 'Gratis',
    urlPrecios: 'https://code.visualstudio.com',
    iaNativa: false,
    modelosIA: 'Depende de la extensión instalada',
    completionInline: true,
    chatIA: true,
    agenteAutonomo: true,
    extensionesVSCode: true,
    openSource: true,
    colaboracion: 'parcial',
    os: ['Windows', 'Mac', 'Linux', 'Web'],
    mejorPara: ['cualquier lenguaje', 'equipos con estándares fijados', 'coste cero', 'ecosistema extensiones'],
    descripcion: 'El IDE más usado del mundo. No es IA-nativo pero añadiendo extensiones (Copilot, Claude Code, Gemini Code Assist) se convierte en un entorno muy potente. Tiene el ecosistema de extensiones más grande, es completamente gratuito y open source.',
    nota: '💡 La IA no viene de serie — necesitas instalar una extensión (Copilot, Claude Code, etc.)',
  },
  {
    id: 'zed',
    nombre: 'Zed',
    empresa: 'Zed Industries',
    icono: '🦀',
    color: '#084C61',
    basado: 'GPUI framework (Rust nativo)',
    planGratuito: true,
    detallePlanGratuito: 'Gratis con créditos de modelos premium incluidos',
    detallePlanPago: '~$20/mes para uso intensivo de modelos premium',
    precioDesde: 'Gratis',
    urlPrecios: 'https://zed.dev/pricing',
    iaNativa: true,
    modelosIA: 'Claude 3.5 Sonnet, GPT-4o, Gemini, Ollama (local)',
    completionInline: true,
    chatIA: true,
    agenteAutonomo: 'parcial',
    extensionesVSCode: false,
    openSource: true,
    colaboracion: true,
    os: ['Mac', 'Linux', 'Windows (beta)'],
    mejorPara: ['rendimiento', 'open source', 'Rust', 'colaboración en tiempo real', 'privacidad (modelos locales)'],
    descripcion: 'IDE escrito en Rust: el más rápido del mercado en proyectos grandes. Open source (GPL-3.0), colaboración en tiempo real nativa y soporte para modelos locales vía Ollama. Su principal limitación es no ser compatible con extensiones de VS Code y que Windows está en beta.',
  },
  {
    id: 'jetbrains',
    nombre: 'JetBrains IDEs',
    empresa: 'JetBrains (Rep. Checa)',
    icono: '🔥',
    color: '#FF318C',
    basado: 'IntelliJ Platform (Java/Kotlin)',
    planGratuito: true,
    detallePlanGratuito: 'Community editions: IntelliJ Community, PyCharm Community (funciones IA limitadas)',
    detallePlanPago: 'Individual desde ~$25/mes · All Products ~$77/mes · AI Assistant incluido en Ultimate',
    precioDesde: 'Gratis (Community)',
    urlPrecios: 'https://www.jetbrains.com/store/',
    iaNativa: true,
    modelosIA: 'JetBrains AI (basado en múltiples modelos)',
    completionInline: true,
    chatIA: true,
    agenteAutonomo: 'parcial',
    extensionesVSCode: false,
    openSource: false,
    colaboracion: false,
    os: ['Windows', 'Mac', 'Linux'],
    mejorPara: ['Java', 'Kotlin', 'Python científico', 'Go', '.NET', 'ecosistema JVM'],
    descripcion: 'La suite de IDEs profesionales por excelencia para ecosistemas específicos. IntelliJ IDEA para Java/Kotlin, PyCharm para Python, WebStorm para JS/TS, GoLand para Go. Herramientas de refactoring y debugging superiores. JetBrains AI Assistant incluido en planes Ultimate.',
  },
];

const RECOM_LENGUAJES: RecomLenguaje[] = [
  {
    lenguaje: 'JavaScript / TypeScript',
    icono: '🟨',
    primera: 'cursor',
    alternativa: 'vscode',
    razon: 'Cursor destaca en proyectos JS/TS con su modo agente para refactoring. VS Code con Copilot es la alternativa establecida con el ecosistema de extensiones más rico (ESLint, Prettier, Jest, etc.).',
  },
  {
    lenguaje: 'Python',
    icono: '🐍',
    primera: 'jetbrains',
    alternativa: 'cursor',
    razon: 'PyCharm (JetBrains) es superior para Python profesional y ciencia de datos: análisis de tipos avanzado, debugging de Jupyter, soporte Django/FastAPI. Cursor es la alternativa si priorizas la IA agentiva sobre las herramientas especializadas.',
  },
  {
    lenguaje: 'Java / Kotlin',
    icono: '☕',
    primera: 'jetbrains',
    alternativa: 'vscode',
    razon: 'IntelliJ IDEA es sin competencia para Java y Kotlin: refactoring semántico profundo, análisis de null-safety, soporte Spring/Android/Maven/Gradle. VS Code con extensión Java es una alternativa ligera y gratuita pero menos potente.',
  },
  {
    lenguaje: 'Rust / Go / C++',
    icono: '🦀',
    primera: 'zed',
    alternativa: 'vscode',
    razon: 'Zed (escrito en Rust) ofrece soporte excelente para Rust y una velocidad de respuesta superior en proyectos de sistemas. VS Code con rust-analyzer o go-plugin es la alternativa más flexible y con más extensiones.',
  },
];

const PERFILES: Perfil[] = [
  {
    id: 'principiante',
    icono: '🎓',
    nombre: 'Principiante o estudiante',
    descripcion: 'Aprende a programar. Quiere un entorno familiar con muchos tutoriales.',
    prioridades: ['Sin coste', 'Fácil de aprender', 'Muchos tutoriales disponibles'],
    recomendado: 'vscode',
    alternativa: 'cursor',
    razon: 'VS Code es el estándar en bootcamps, cursos y tutoriales. Todos los recursos online lo usan. Es gratuito y puedes añadir Copilot Free o Gemini Code Assist gratis. Cursor Free es la alternativa si quieres empezar directamente con IA nativa.',
  },
  {
    id: 'web-dev',
    icono: '🌐',
    nombre: 'Desarrollador web / full-stack',
    descripcion: 'Trabaja principalmente en JS/TS, React, Node.js, Python. Quiere IA agentiva.',
    prioridades: ['IA agentiva potente', 'Compatibilidad con extensiones', 'Productividad en proyectos medianos-grandes'],
    recomendado: 'cursor',
    alternativa: 'windsurf',
    razon: 'Cursor Pro ($20/mes) es la elección dominante para web. Compatibilidad total con VS Code + IA nativa con Claude/GPT-4o + modo agente para refactoring. Windsurf es alternativa casi idéntica a $5 menos.',
  },
  {
    id: 'jvm-backend',
    icono: '☕',
    nombre: 'Backend JVM (Java/Kotlin)',
    descripcion: 'Trabaja en ecosistemas Java, Kotlin, Spring, Micronaut, Gradle.',
    prioridades: ['Herramientas de refactoring avanzadas', 'Debugging profundo', 'Soporte frameworks Java'],
    recomendado: 'jetbrains',
    alternativa: 'cursor',
    razon: 'IntelliJ IDEA Ultimate ($25-40/mes) es sin alternativa real para Java profesional. Cursor es usable para Java pero pierde frente a IntelliJ en herramientas semánticas. Si ya tienes IntelliJ, añadir Claude Code CLI en la terminal potencia aún más el flujo.',
  },
  {
    id: 'open-source',
    icono: '🔓',
    nombre: 'Open source / privacidad',
    descripcion: 'Valora el control del código, evita herramientas propietarias, puede usar modelos locales.',
    prioridades: ['Open source', 'Privacidad del código', 'Soporte modelos locales'],
    recomendado: 'zed',
    alternativa: 'vscode',
    razon: 'Zed (GPL-3.0) es open source, más rápido que VS Code y soporta modelos locales vía Ollama (sin enviar código a servidores externos). VS Code (MIT) es la alternativa si necesitas el ecosistema de extensiones completo.',
  },
];

// ─── Helpers ───

function dispIcon(d: Disponibilidad): string {
  if (d === true) return '✅';
  if (d === 'parcial') return '🟡';
  return '❌';
}

function dispLabel(d: Disponibilidad): string {
  if (d === true) return 'Sí';
  if (d === 'parcial') return 'Parcial';
  return 'No';
}

function getIde(id: string, ides: IDE[]): IDE | undefined {
  return ides.find((i) => i.id === id);
}

// ─── Componente ───

export default function ComparadorIdesIa() {
  const [tab, setTab] = useState<Tab>('comparativa');
  const [expandido, setExpandido] = useState<string | null>(null);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<string | null>(null);

  const perfilActivo = PERFILES.find((p) => p.id === perfilSeleccionado) ?? null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>IDEs con IA 2026</h1>
        <p className={styles.heroSubtitle}>
          Cursor · Windsurf · VS Code · Zed · JetBrains — cuál usar según tu lenguaje, presupuesto y flujo de trabajo
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Nota combinaciones */}
        <div className={styles.combinacionNota} role="note">
          <span aria-hidden="true">💡</span>
          <div>
            <strong>Sobre las combinaciones IDE + asistente:</strong> Cursor y Windsurf ya incluyen IA nativa y no necesitan un asistente adicional. VS Code sí necesita una extensión de IA. Los IDEs con IA nativa pueden usarse también con Claude Code CLI en la terminal para tareas de refactoring profundo.
            {' '}<a href="/comparador-asistentes-codigo/" className={styles.linkInterno}>Ver comparador de asistentes →</a>
          </div>
        </div>

        {/* Tabs */}
        <nav className={styles.tabsNav} role="tablist" aria-label="Secciones del comparador de IDEs">
          {([
            { id: 'comparativa', label: '🗂️ Comparativa' },
            { id: 'ia',          label: '🤖 Integración IA' },
            { id: 'lenguajes',   label: '💻 Por lenguaje' },
            { id: 'perfiles',    label: '👤 Por perfil' },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
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
              📅 Datos verificados en junio 2026. Precios y funcionalidades pueden cambiar — verifica en las webs oficiales.
            </div>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla} aria-label="Comparativa de IDEs con IA">
                <thead>
                  <tr>
                    <th className={styles.th}>IDE</th>
                    <th className={styles.th}>Basado en</th>
                    <th className={styles.th}>Gratis</th>
                    <th className={styles.th}>Desde</th>
                    <th className={styles.th}>IA nativa</th>
                    <th className={styles.th}>Agente</th>
                    <th className={styles.th}>Ext. VS Code</th>
                    <th className={styles.th}>Open source</th>
                  </tr>
                </thead>
                <tbody>
                  {IDES.map((ide) => (
                    <>
                      <tr
                        key={ide.id}
                        className={`${styles.tr} ${expandido === ide.id ? styles.trExpandido : ''}`}
                        onClick={() => setExpandido(expandido === ide.id ? null : ide.id)}
                        role="button"
                        aria-expanded={expandido === ide.id}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandido(expandido === ide.id ? null : ide.id); }}
                        aria-label={`Ver detalle de ${ide.nombre}`}
                      >
                        <td className={styles.td}>
                          <div className={styles.ideCell}>
                            <span className={styles.ideIcono} style={{ color: ide.color }} aria-hidden="true">{ide.icono}</span>
                            <div>
                              <span className={styles.ideNombre}>{ide.nombre}</span>
                              <span className={styles.ideEmpresa}>{ide.empresa}</span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}><span className={styles.basadoLabel}>{ide.basado}</span></td>
                        <td className={styles.td}>{ide.planGratuito ? <span className={styles.siTag}>✅ Sí</span> : <span className={styles.noTag}>❌ No</span>}</td>
                        <td className={styles.td}><span className={styles.precioTag} style={{ borderColor: ide.color, color: ide.color }}>{ide.precioDesde}</span></td>
                        <td className={styles.td}>{dispIcon(ide.iaNativa)}</td>
                        <td className={styles.td}>{dispIcon(ide.agenteAutonomo)} <span className={styles.dispLabel}>{dispLabel(ide.agenteAutonomo)}</span></td>
                        <td className={styles.td}>{dispIcon(ide.extensionesVSCode)}</td>
                        <td className={styles.td}>{dispIcon(ide.openSource)}</td>
                      </tr>
                      {expandido === ide.id && (
                        <tr key={`${ide.id}-det`} className={styles.trDetalle}>
                          <td colSpan={8} className={styles.tdDetalle}>
                            <div className={styles.detalleInner} style={{ borderLeftColor: ide.color }}>
                              <p className={styles.detalleDesc}>{ide.descripcion}</p>
                              {ide.nota && <p className={styles.detalleNota}>{ide.nota}</p>}
                              <div className={styles.detalleGrid}>
                                <div className={styles.detalleFila}>
                                  <span className={styles.detalleEtiqueta}>Modelos IA:</span>
                                  <span>{ide.modelosIA}</span>
                                </div>
                                <div className={styles.detalleFila}>
                                  <span className={styles.detalleEtiqueta}>Plan gratuito:</span>
                                  <span>{ide.detallePlanGratuito}</span>
                                </div>
                                <div className={styles.detalleFila}>
                                  <span className={styles.detalleEtiqueta}>Planes de pago:</span>
                                  <span>{ide.detallePlanPago}</span>
                                </div>
                                <div className={styles.detalleFila}>
                                  <span className={styles.detalleEtiqueta}>Sistemas operativos:</span>
                                  <span>{ide.os.join(' · ')}</span>
                                </div>
                                <div className={styles.detalleFila}>
                                  <span className={styles.detalleEtiqueta}>Colaboración:</span>
                                  <span>{dispIcon(ide.colaboracion)} {dispLabel(ide.colaboracion)}</span>
                                </div>
                              </div>
                              <div className={styles.mejorParaRow}>
                                {ide.mejorPara.map((t) => (
                                  <span key={t} className={styles.mejorTag} style={{ borderColor: ide.color, color: ide.color }}>{t}</span>
                                ))}
                              </div>
                              <a href={ide.urlPrecios} target="_blank" rel="noopener noreferrer" className={styles.enlaceOficial}>
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

        {/* ─── Tab 2: Integración IA ─── */}
        {tab === 'ia' && (
          <div className={styles.tabContent} role="tabpanel">
            <p className={styles.tabIntro}>
              Cómo cada IDE integra la IA en el flujo de trabajo del desarrollador.
            </p>
            <div className={styles.iaGrid}>
              {IDES.map((ide) => (
                <div key={ide.id} className={styles.iaCard} style={{ borderTopColor: ide.color }}>
                  <div className={styles.iaCardHeader}>
                    <span style={{ color: ide.color, fontSize: '1.5rem' }} aria-hidden="true">{ide.icono}</span>
                    <div>
                      <h3 className={styles.iaCardNombre}>{ide.nombre}</h3>
                      <span className={styles.iaCardEmpresa}>{ide.empresa}</span>
                    </div>
                  </div>
                  <div className={styles.iaFeatures}>
                    <div className={styles.iaFeature}>
                      <span>{dispIcon(ide.iaNativa)}</span>
                      <span>IA nativa integrada</span>
                    </div>
                    <div className={styles.iaFeature}>
                      <span>{dispIcon(ide.completionInline)}</span>
                      <span>Completions inline</span>
                    </div>
                    <div className={styles.iaFeature}>
                      <span>{dispIcon(ide.chatIA)}</span>
                      <span>Chat de IA en panel</span>
                    </div>
                    <div className={styles.iaFeature}>
                      <span>{dispIcon(ide.agenteAutonomo)}</span>
                      <span>Agente autónomo</span>
                    </div>
                  </div>
                  <div className={styles.iaModelos}>
                    <span className={styles.iaModelosLabel}>Modelos disponibles:</span>
                    <span className={styles.iaModelosValor}>{ide.modelosIA}</span>
                  </div>
                  {ide.nota && <p className={styles.iaNota}>{ide.nota}</p>}
                </div>
              ))}
            </div>
            <div className={styles.leyendaDisp}>
              <span>✅ Disponible</span>
              <span>🟡 Disponible con limitaciones</span>
              <span>❌ No disponible</span>
            </div>
          </div>
        )}

        {/* ─── Tab 3: Por lenguaje ─── */}
        {tab === 'lenguajes' && (
          <div className={styles.tabContent} role="tabpanel">
            <p className={styles.tabIntro}>
              La elección de IDE cambia según el lenguaje y ecosistema en el que trabajes.
            </p>
            <div className={styles.lenguajesGrid}>
              {RECOM_LENGUAJES.map((r) => {
                const primera = getIde(r.primera, IDES);
                const alt = getIde(r.alternativa, IDES);
                return (
                  <div key={r.lenguaje} className={styles.lenguajeCard}>
                    <div className={styles.lenguajeHeader}>
                      <span className={styles.lenguajeIcono} aria-hidden="true">{r.icono}</span>
                      <h3 className={styles.lenguajeNombre}>{r.lenguaje}</h3>
                    </div>
                    <div className={styles.lenguajeOpciones}>
                      {primera && (
                        <div className={styles.lenguajeOpcion}>
                          <span className={styles.lenguajeOpcionLabel} style={{ background: primera.color }}>1ª opción</span>
                          <span style={{ color: primera.color, fontWeight: 700 }}>{primera.icono} {primera.nombre}</span>
                        </div>
                      )}
                      {alt && (
                        <div className={styles.lenguajeOpcion}>
                          <span className={styles.lenguajeOpcionLabel} style={{ background: '#888' }}>Alternativa</span>
                          <span style={{ color: alt.color, fontWeight: 700 }}>{alt.icono} {alt.nombre}</span>
                        </div>
                      )}
                    </div>
                    <p className={styles.lenguajeRazon}>{r.razon}</p>
                  </div>
                );
              })}
            </div>
            <div className={styles.lenguajesNota} role="note">
              <span aria-hidden="true">ℹ️</span>
              <span>Esta tabla cubre los ecosistemas principales. Para Android/iOS (Kotlin/Swift) considera Android Studio o Xcode; para .NET considera Rider (JetBrains); para PHP, PhpStorm.</span>
            </div>
          </div>
        )}

        {/* ─── Tab 4: Por perfil ─── */}
        {tab === 'perfiles' && (
          <div className={styles.tabContent} role="tabpanel">
            <p className={styles.tabIntro}>Selecciona el perfil que mejor te describe.</p>
            <div className={styles.perfilesGrid}>
              {PERFILES.map((p) => (
                <button
                  key={p.id}
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
              const rec = getIde(perfilActivo.recomendado, IDES);
              const alt = getIde(perfilActivo.alternativa, IDES);
              return (
                <div className={styles.recomPanel} role="region" aria-label={`Recomendación para ${perfilActivo.nombre}`}>
                  <h3 className={styles.recomTitulo}>{perfilActivo.icono} Recomendación para {perfilActivo.nombre}</h3>
                  <div className={styles.recomCards}>
                    {rec && (
                      <div className={styles.recomCard} style={{ borderColor: rec.color }}>
                        <div className={styles.recomBadge} style={{ background: rec.color }}>Primera opción</div>
                        <span style={{ fontSize: '2rem', color: rec.color }}>{rec.icono}</span>
                        <p className={styles.recomNombre}>{rec.nombre}</p>
                        <p className={styles.recomPrecio}>{rec.precioDesde}</p>
                      </div>
                    )}
                    {alt && (
                      <div className={styles.recomCard} style={{ borderColor: '#CCC' }}>
                        <div className={styles.recomBadge} style={{ background: '#888' }}>Alternativa</div>
                        <span style={{ fontSize: '2rem', color: alt.color }}>{alt.icono}</span>
                        <p className={styles.recomNombre}>{alt.nombre}</p>
                        <p className={styles.recomPrecio}>{alt.precioDesde}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.razonBox}>
                    <span aria-hidden="true">💡</span>
                    {perfilActivo.razon}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <DataReference
          normativa="Precios y características de IDEs con IA"
          fuente="Cursor · Codeium/Windsurf · Microsoft VS Code · Zed Industries · JetBrains"
          verificado="2026-06-01"
          nota="Precios verificados en junio 2026. El mercado de IDEs con IA evoluciona rápidamente — verifica siempre en las webs oficiales antes de suscribirte."
        />
      </main>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Cómo elegir el IDE con IA adecuado"
        subtitle="Claves, comparativas y errores frecuentes"
      >
        <p>
          Los IDEs con IA integrada han evolucionado en dos grandes familias: los <strong>IDEs IA-nativos</strong> (Cursor, Windsurf, Zed) donde la IA es parte central del producto desde el diseño, y los <strong>IDEs clásicos con extensiones IA</strong> (VS Code, JetBrains) que han añadido capacidades de IA sobre una base establecida. La diferencia práctica no es solo funcional — también afecta al modelo de negocio, al control del usuario y a la curva de aprendizaje.
        </p>
        <p>
          Un aspecto crítico que suele pasarse por alto: <strong>el IDE y el asistente de IA son capas separables</strong>. Puedes usar Cursor (IDE) con Claude Code CLI (asistente en terminal) simultáneamente. Puedes usar VS Code (IDE) con GitHub Copilot (extensión IA) y también Claude Code (extensión o CLI). Entender esta separación ayuda a construir el flujo de trabajo óptimo para cada situación.
        </p>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Comparativa: IDE nativo IA vs IDE clásico con extensión
        </h4>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr><th>Dimensión</th><th>IDE IA-nativo (Cursor, Windsurf)</th><th>IDE clásico + extensión (VS Code)</th></tr>
            </thead>
            <tbody>
              <tr><td>IA integrada</td><td>✅ De base, sin instalación extra</td><td>🟡 Requiere instalar extensión</td></tr>
              <tr><td>Modelo elegible</td><td>✅ Claude, GPT-4o, Gemini, local</td><td>Depende de la extensión</td></tr>
              <tr><td>Agente autónomo</td><td>✅ Nativo (Composer / Flows)</td><td>🟡 Vía extensión o CLI</td></tr>
              <tr><td>Ecosistema extensiones</td><td>✅ Compatible con VS Code</td><td>✅ El más grande del mercado</td></tr>
              <tr><td>Coste base IDE</td><td>Gratis con límites / $15-20/mes</td><td>✅ Gratuito (+ coste asistente)</td></tr>
              <tr><td>Estabilidad</td><td>🟡 Productos jóvenes, evolución rápida</td><td>✅ Muy estable, actualizado por Microsoft</td></tr>
              <tr><td>Open source</td><td>❌ Propietarios</td><td>✅ VS Code es MIT</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Perfiles y sus IDEs
        </h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🎓 Estudiante</strong>
            <p>VS Code gratis + extensión gratuita (Copilot Free o Gemini Code Assist). Los tutoriales online usan VS Code como referencia universal.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🌐 Web developer</strong>
            <p>Cursor o Windsurf con IA nativa. Para proyectos JS/TS/React/Next.js la IA agentiva es un multiplicador real de productividad.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>☕ Backend JVM</strong>
            <p>IntelliJ IDEA Ultimate es indispensable para Java/Kotlin profesional. Sin competencia real en herramientas de refactoring y análisis semántico.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🔓 Open source / privacidad</strong>
            <p>Zed (GPL-3.0) o VS Code (MIT). Ambos open source. Zed además permite modelos locales vía Ollama sin enviar código a servidores externos.</p>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Preguntas frecuentes
        </h4>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cursor y Windsurf son estables o cambian demasiado rápido?</strong>
            <span>Ambos evolucionan muy rápido — nuevas funciones semanalmente. Eso es positivo (mejoras constantes) pero también implica que la interfaz puede cambiar. Para proyectos de empresa donde la estabilidad es crítica, VS Code o JetBrains son más predecibles. Para freelances o proyectos personales donde valoras innovación, Cursor/Windsurf son excelentes.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué pasa si Cursor o Windsurf quiebran o cierran?</strong>
            <span>Es un riesgo real con startups. Ambos son forks de VS Code, por lo que si desaparecen, tus proyectos y configuraciones son 100% compatibles con VS Code estándar. El riesgo principal es perder las funciones de IA integrada, no tu código. VS Code y JetBrains tienen respaldo corporativo (Microsoft, JetBrains) más estable.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Zed es una alternativa real a VS Code en 2026?</strong>
            <span>Para desarrolladores en Mac o Linux: sí, cada vez más. Su rendimiento es notablemente superior en proyectos grandes (1-2 segundos de apertura vs 5-8s en VS Code) y su soporte para Rust y Go es excelente. Para Windows todavía está en beta. La falta de compatibilidad con extensiones de VS Code es la barrera principal para adopción masiva.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puedo usar Cursor con mi licencia de JetBrains existente?</strong>
            <span>Son productos separados e independientes. Tener IntelliJ no te da acceso a Cursor. Sin embargo, algunos flujos de trabajo híbridos son populares: usar IntelliJ para desarrollo Java en el IDE (refactoring, debugging, testing) y Claude Code CLI en la terminal integrada de IntelliJ para tareas de arquitectura o análisis de codebase.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué IDE consume menos recursos del sistema?</strong>
            <span>Zed es claramente el más ligero (escrito en Rust, sin Electron). VS Code, Cursor y Windsurf usan Electron y consumen más RAM (400-800MB típicamente). JetBrains es el más pesado (JVM, fácilmente 1-2GB de RAM para proyectos grandes). Si tienes un equipo con poca RAM, Zed o un VS Code limpio son las mejores opciones.</span>
          </li>
        </ul>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Cómo evaluar un IDE nuevo antes de adoptarlo
        </h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Pruébalo en un proyecto real tuyo</strong> — no en un proyecto de tutorial. El comportamiento en un repositorio con 50 archivos y dependencias reales es muy distinto al de un proyecto vacío.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Verifica que tus extensiones críticas funcionan</strong> — si dependes de ESLint, Prettier, Jest, Docker Extension, etc., comprueba que estén disponibles antes de comprometerte.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Evalúa el consumo de RAM en tu máquina</strong> — con tu proyecto real abierto. Si ya tienes Docker, un navegador y otras herramientas, un IDE pesado puede hacer que el equipo vaya lento.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Usa el plan gratuito al menos 2 semanas</strong> — antes de pagar cualquier suscripción. Los hábitos de uso real emergen después de los primeros días de &ldquo;efecto novedad&rdquo;.
            </div>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Buenas prácticas
        </h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>No cambies de IDE en medio de un proyecto</strong>
            La curva de aprendizaje y la reconfiguración pueden costar más tiempo del que ahorras. Planifica el cambio para entre proyectos.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📁</span>
            <strong>Mantén tu configuración en un dotfiles repo</strong>
            Guarda settings, keybindings y snippets en Git. Cambiar de máquina o IDE se vuelve trivial.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏢</span>
            <strong>Alinea el IDE con el equipo</strong>
            Usar el mismo IDE que el resto del equipo facilita compartir configuraciones, snippets y atajos. La productividad individual tiene que sopesarse con la fricción de equipo.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💰</span>
            <strong>Calcula el coste real (IDE + asistente)</strong>
            Un IDE IA-nativo puede incluir lo que de otra forma pagarías por separado (IDE gratis + asistente de pago). Compara el coste total, no solo el precio del IDE.
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al elegir IDE</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Elegir el IDE más popular en lugar del más adecuado para tu ecosistema — JetBrains gana claramente en Java/Kotlin aunque tenga menos hype que Cursor.</li>
            <li>Cambiar de IDE buscando más productividad sin dar tiempo suficiente de adaptación — la curva de aprendizaje puede durar semanas.</li>
            <li>Ignorar el coste total (IDE + asistentes IA + plugins de pago) — puede superar fácilmente $50/mes si no se planifica.</li>
            <li>Asumir que el IDE con IA nativa reemplaza completamente a un asistente especializado — en muchos casos la combinación IDE + asistente externo da mejores resultados.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-ides-ia')} />
      <ShareCard appName="comparador-ides-ia" />
      <Footer appName="comparador-ides-ia" />
    </div>
  );
}
