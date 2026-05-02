'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ComparadorIA.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type NivelEspanol = 'excelente' | 'bueno' | 'básico';
type NivelPrivacidad = 'alta' | 'media' | 'baja';
type RangoPrecio = 'gratuito' | 'freemium' | 'pago' | 'open-source';

interface ModeloIA {
  id: string;
  nombre: string;
  empresa: string;
  icono: string;
  color: string;
  rangoPrecio: RangoPrecio;
  precioDetalle: string;
  contexto: string;
  multimodal: boolean;
  busquedaWeb: boolean;
  calidadEspanol: NivelEspanol;
  privacidad: NivelPrivacidad;
  rgpd: boolean;
  disponibleEspana: boolean;
  mejorPara: string[];
  descripcion: string;
  url: string;
}

interface CasoDeUso {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  modelosRecomendados: string[];
  consejo: string;
}

interface PerfilUsuario {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  prioridades: string[];
  modelosRecomendados: string[];
  razon: string;
}

interface TerminoGlosario {
  termino: string;
  icono: string;
  definicion: string;
  ejemplo: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MODELOS_IA: ModeloIA[] = [
  {
    id: 'chatgpt',
    nombre: 'ChatGPT / GPT-4o',
    empresa: 'OpenAI',
    icono: '🤖',
    color: '#10A37F',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis (GPT-4o mini) / Plus 20$/mes (GPT-4o)',
    contexto: '128K tokens',
    multimodal: true,
    busquedaWeb: true,
    calidadEspanol: 'excelente',
    privacidad: 'media',
    rgpd: false,
    disponibleEspana: true,
    mejorPara: ['redaccion', 'codigo', 'imagen', 'busqueda'],
    descripcion: 'El más popular del mundo. Versátil, con plugins y acceso web. Muy buena calidad en español.',
    url: 'https://chat.openai.com',
  },
  {
    id: 'claude',
    nombre: 'Claude',
    empresa: 'Anthropic',
    icono: '🧠',
    color: '#CC785C',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis (Claude Sonnet) / Pro 18€/mes (Opus)',
    contexto: '200K tokens',
    multimodal: true,
    busquedaWeb: true,
    calidadEspanol: 'excelente',
    privacidad: 'alta',
    rgpd: false,
    disponibleEspana: true,
    mejorPara: ['redaccion', 'analisis', 'codigo', 'empresarial'],
    descripcion: 'Destaca en análisis de documentos largos, redacción matizada y razonamiento complejo. La ventana de contexto más grande.',
    url: 'https://claude.ai',
  },
  {
    id: 'gemini',
    nombre: 'Gemini',
    empresa: 'Google',
    icono: '✨',
    color: '#4285F4',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis (Gemini 1.5 Flash) / Advanced 21,99€/mes',
    contexto: '1M tokens',
    multimodal: true,
    busquedaWeb: true,
    calidadEspanol: 'excelente',
    privacidad: 'media',
    rgpd: false,
    disponibleEspana: true,
    mejorPara: ['busqueda', 'redaccion', 'imagen', 'analisis'],
    descripcion: 'Integrado con Google Search y Drive. La ventana de contexto más grande disponible. Ideal para investigación con datos actualizados.',
    url: 'https://gemini.google.com',
  },
  {
    id: 'copilot',
    nombre: 'Microsoft Copilot',
    empresa: 'Microsoft',
    icono: '🪟',
    color: '#0078D4',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis / Microsoft 365 desde 6€/mes',
    contexto: '128K tokens',
    multimodal: true,
    busquedaWeb: true,
    calidadEspanol: 'bueno',
    privacidad: 'alta',
    rgpd: true,
    disponibleEspana: true,
    mejorPara: ['empresarial', 'redaccion', 'busqueda', 'codigo'],
    descripcion: 'Integrado en Word, Excel y Teams. Mejor opción para empresas con Microsoft 365. Cumple RGPD con opción de región europea.',
    url: 'https://copilot.microsoft.com',
  },
  {
    id: 'mistral',
    nombre: 'Mistral AI',
    empresa: 'Mistral AI (Francia)',
    icono: '🌊',
    color: '#FF7000',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis (Le Chat) / API desde 0,002€/1K tokens',
    contexto: '128K tokens',
    multimodal: false,
    busquedaWeb: true,
    calidadEspanol: 'bueno',
    privacidad: 'alta',
    rgpd: true,
    disponibleEspana: true,
    mejorPara: ['empresarial', 'codigo', 'redaccion'],
    descripcion: 'Empresa europea con servidores en la UE. La opción más RGPD-friendly para empresas españolas. Modelos open-source disponibles.',
    url: 'https://chat.mistral.ai',
  },
  {
    id: 'perplexity',
    nombre: 'Perplexity',
    empresa: 'Perplexity AI',
    icono: '🔍',
    color: '#1FB8CD',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis / Pro 20$/mes',
    contexto: '32K tokens',
    multimodal: false,
    busquedaWeb: true,
    calidadEspanol: 'bueno',
    privacidad: 'media',
    rgpd: false,
    disponibleEspana: true,
    mejorPara: ['busqueda', 'analisis'],
    descripcion: 'Motor de búsqueda con IA. Cita fuentes en cada respuesta. Ideal para investigación y verificación de datos actuales.',
    url: 'https://perplexity.ai',
  },
  {
    id: 'llama',
    nombre: 'Llama (Meta AI)',
    empresa: 'Meta',
    icono: '🦙',
    color: '#0866FF',
    rangoPrecio: 'open-source',
    precioDetalle: 'Open-source gratuito / API desde 0,002$/1K tokens',
    contexto: '128K tokens',
    multimodal: true,
    busquedaWeb: false,
    calidadEspanol: 'bueno',
    privacidad: 'alta',
    rgpd: true,
    disponibleEspana: true,
    mejorPara: ['empresarial', 'codigo'],
    descripcion: 'Open-source: puedes ejecutarlo en tus propios servidores. Máxima privacidad para empresas. Requiere infraestructura técnica.',
    url: 'https://llama.meta.com',
  },
  {
    id: 'grok',
    nombre: 'Grok',
    empresa: 'xAI (Elon Musk)',
    icono: '⚡',
    color: '#1DA1F2',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis con X (Twitter) / Premium 8$/mes',
    contexto: '128K tokens',
    multimodal: true,
    busquedaWeb: true,
    calidadEspanol: 'bueno',
    privacidad: 'baja',
    rgpd: false,
    disponibleEspana: true,
    mejorPara: ['busqueda', 'redaccion'],
    descripcion: 'Integrado en X (Twitter). Acceso a tweets en tiempo real. Tono menos formal. Privacidad cuestionable por sus términos de uso.',
    url: 'https://grok.com',
  },
  {
    id: 'deepseek',
    nombre: 'DeepSeek',
    empresa: 'DeepSeek (China)',
    icono: '🐋',
    color: '#4D6BFE',
    rangoPrecio: 'freemium',
    precioDetalle: 'Gratis / API muy barata (0,001$/1K tokens)',
    contexto: '128K tokens',
    multimodal: false,
    busquedaWeb: false,
    calidadEspanol: 'básico',
    privacidad: 'baja',
    rgpd: false,
    disponibleEspana: true,
    mejorPara: ['codigo'],
    descripcion: 'Muy potente en código y matemáticas. Precio API más bajo del mercado. ATENCIÓN: servidores en China, no recomendado para datos empresariales.',
    url: 'https://chat.deepseek.com',
  },
];

const CASOS_DE_USO: CasoDeUso[] = [
  {
    id: 'redaccion',
    icono: '✍️',
    nombre: 'Redacción y Contenido',
    descripcion: 'Escribir textos, emails, artículos, resúmenes y contenido creativo en español.',
    modelosRecomendados: ['claude', 'chatgpt', 'gemini'],
    consejo: 'Claude destaca en textos largos y matizados. ChatGPT en creatividad y variedad de estilos.',
  },
  {
    id: 'codigo',
    icono: '💻',
    nombre: 'Código y Programación',
    descripcion: 'Escribir, depurar y explicar código en cualquier lenguaje de programación.',
    modelosRecomendados: ['chatgpt', 'claude', 'deepseek'],
    consejo: 'ChatGPT y Claude son excelentes para todos los lenguajes. DeepSeek destaca en código pero evitar para proyectos confidenciales.',
  },
  {
    id: 'analisis',
    icono: '📊',
    nombre: 'Análisis de Documentos',
    descripcion: 'Resumir, analizar y extraer información de PDFs, contratos e informes largos.',
    modelosRecomendados: ['claude', 'gemini', 'perplexity'],
    consejo: 'Claude con 200K tokens de contexto es el mejor para documentos muy largos. Gemini soporta hasta 1M tokens.',
  },
  {
    id: 'busqueda',
    icono: '🔍',
    nombre: 'Búsqueda e Investigación',
    descripcion: 'Buscar información actualizada con fuentes verificadas y datos recientes.',
    modelosRecomendados: ['perplexity', 'gemini', 'copilot'],
    consejo: 'Perplexity siempre cita las fuentes. Gemini integra Google Search. Copilot usa Bing con referencias.',
  },
  {
    id: 'imagen',
    icono: '🎨',
    nombre: 'Generación de Imágenes',
    descripcion: 'Crear imágenes, ilustraciones y diseños a partir de descripciones de texto.',
    modelosRecomendados: ['chatgpt', 'gemini', 'copilot'],
    consejo: 'ChatGPT usa DALL-E 3. Gemini usa Imagen 3. Copilot usa Designer (DALL-E). Midjourney es la alternativa especializada.',
  },
  {
    id: 'empresarial',
    icono: '🏢',
    nombre: 'Uso Empresarial (RGPD)',
    descripcion: 'Uso en empresas con requisitos de privacidad, confidencialidad y cumplimiento europeo.',
    modelosRecomendados: ['copilot', 'mistral', 'llama'],
    consejo: 'Mistral (Francia) y Copilot Enterprise cumplen RGPD con servidores en Europa. Llama para instalación on-premise.',
  },
];

const PERFILES_USUARIO: PerfilUsuario[] = [
  {
    id: 'estudiante',
    icono: '🎓',
    nombre: 'Estudiante',
    descripcion: 'Busca ayuda para estudiar, resumir apuntes, entender conceptos y hacer trabajos.',
    prioridades: ['Gratuito', 'Buena calidad en español', 'Fácil de usar'],
    modelosRecomendados: ['chatgpt', 'claude', 'gemini'],
    razon: 'ChatGPT y Claude ofrecen versiones gratuitas muy capaces. Gemini se integra con Google Docs, muy útil para trabajos.',
  },
  {
    id: 'profesional',
    icono: '💼',
    nombre: 'Profesional Independiente',
    descripcion: 'Freelance o autónomo que necesita ayuda con redacción, análisis y comunicación.',
    prioridades: ['Calidad/precio', 'Español excelente', 'Versatilidad'],
    modelosRecomendados: ['claude', 'chatgpt', 'perplexity'],
    razon: 'Claude Pro o ChatGPT Plus a ~20€/mes son la mejor inversión. Perplexity para investigación con fuentes.',
  },
  {
    id: 'empresa',
    icono: '🏢',
    nombre: 'Empresa',
    descripcion: 'Organización que necesita IA con garantías de privacidad, RGPD y confidencialidad.',
    prioridades: ['RGPD compliance', 'Servidores en Europa', 'Integración empresarial'],
    modelosRecomendados: ['copilot', 'mistral', 'llama'],
    razon: 'Copilot Enterprise con región Europa o Mistral (Francia) son las opciones RGPD. Llama para instalación on-premise.',
  },
  {
    id: 'desarrollador',
    icono: '⚙️',
    nombre: 'Desarrollador / Técnico',
    descripcion: 'Integra IA en aplicaciones propias mediante APIs, con control de costes y rendimiento.',
    prioridades: ['Precio por token', 'API robusta', 'Velocidad y latencia'],
    modelosRecomendados: ['claude', 'chatgpt', 'mistral'],
    razon: 'Anthropic y OpenAI tienen las mejores APIs. Mistral ofrece modelos open-source con precio API muy competitivo.',
  },
];

const GLOSARIO: TerminoGlosario[] = [
  { termino: 'LLM', icono: '🧩', definicion: 'Large Language Model — modelo de lenguaje de gran escala entrenado con enormes cantidades de texto para predecir y generar lenguaje natural.', ejemplo: 'GPT-4, Claude y Gemini son LLMs.' },
  { termino: 'Token', icono: '🔤', definicion: 'Unidad básica de texto que procesa un LLM. Aproximadamente 1 token = 0,75 palabras en inglés, o 1 token ≈ 1 palabra en español.', ejemplo: '"Hola mundo" equivale a unos 2-3 tokens.' },
  { termino: 'Contexto', icono: '📏', definicion: 'Cantidad máxima de tokens que un modelo puede procesar de una vez (conversación + documentos + respuesta). Cuanto mayor, más texto puede analizar.', ejemplo: 'Claude soporta 200K tokens ≈ un libro completo.' },
  { termino: 'Prompt', icono: '💬', definicion: 'Instrucción o pregunta que el usuario escribe para indicar a la IA qué debe hacer. La calidad del prompt influye directamente en la calidad de la respuesta.', ejemplo: '"Resume este contrato en 5 puntos clave."' },
  { termino: 'Alucinación', icono: '🌀', definicion: 'Error en el que la IA genera información falsa pero presentada con confianza. El modelo "inventa" datos, citas o hechos inexistentes.', ejemplo: 'Una IA que cita un artículo científico que no existe.' },
  { termino: 'RAG', icono: '📚', definicion: 'Retrieval-Augmented Generation — técnica que conecta un LLM con una base de conocimiento externa para responder con datos actualizados y verificados.', ejemplo: 'Un chatbot empresarial que responde según el manual de tu empresa.' },
  { termino: 'Multimodal', icono: '🖼️', definicion: 'Capacidad de una IA para procesar y generar distintos tipos de datos: texto, imágenes, audio y vídeo, no solo texto.', ejemplo: 'GPT-4o puede analizar una foto y responder preguntas sobre ella.' },
  { termino: 'Fine-tuning', icono: '🎛️', definicion: 'Proceso de entrenar adicionalmente un modelo preentrenado con datos específicos de un dominio para mejorar su rendimiento en tareas concretas.', ejemplo: 'Un modelo médico entrenado con historiales clínicos.' },
  { termino: 'RGPD', icono: '🔒', definicion: 'Reglamento General de Protección de Datos europeo. Regula cómo las empresas tratan datos personales. Las IAs con servidores en la UE facilitan el cumplimiento.', ejemplo: 'Mistral AI (Francia) cumple RGPD por defecto.' },
  { termino: 'Open-source', icono: '🌐', definicion: 'Modelo cuyo código y pesos están disponibles públicamente. Se puede instalar en servidores propios, garantizando privacidad total.', ejemplo: 'Llama de Meta puede instalarse en servidores de tu empresa.' },
];

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

const ETIQUETAS_CASO: Record<string, string> = {
  redaccion: 'Redacción',
  codigo: 'Código',
  analisis: 'Análisis',
  busqueda: 'Búsqueda',
  imagen: 'Imagen',
  empresarial: 'Empresa',
};

function estrellas(nivel: NivelEspanol): string {
  if (nivel === 'excelente') return '⭐⭐⭐';
  if (nivel === 'bueno') return '⭐⭐';
  return '⭐';
}

function badgePrecioClass(rango: RangoPrecio, s: Record<string, string>): string {
  if (rango === 'gratuito') return s.badgeGratuito;
  if (rango === 'freemium') return s.badgeFreemium;
  if (rango === 'pago') return s.badgePago;
  return s.badgeOpenSource;
}

function badgePrecioLabel(rango: RangoPrecio): string {
  if (rango === 'gratuito') return 'Gratuito';
  if (rango === 'freemium') return 'Freemium';
  if (rango === 'pago') return 'Pago';
  return 'Open-source';
}

function badgePrivacidadClass(nivel: NivelPrivacidad, s: Record<string, string>): string {
  if (nivel === 'alta') return s.badgeAlta;
  if (nivel === 'media') return s.badgeMedia;
  return s.badgeBaja;
}

function iconoPrivacidad(nivel: NivelPrivacidad): string {
  if (nivel === 'alta') return '🟢';
  if (nivel === 'media') return '🟡';
  return '🔴';
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorComparadorIA() {
  const [tabActiva, setTabActiva] = useState<'modelos' | 'casos' | 'perfiles' | 'glosario'>('modelos');
  const [filtroPrecio, setFiltroPrecio] = useState<string>('todos');
  const [modeloExpandido, setModeloExpandido] = useState<string | null>(null);
  const [casoSeleccionado, setCasoSeleccionado] = useState<string | null>(null);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<string | null>(null);

  const modelosFiltrados = filtroPrecio === 'todos'
    ? MODELOS_IA
    : MODELOS_IA.filter((m) => m.rangoPrecio === filtroPrecio);

  function handleFilaClick(id: string) {
    setModeloExpandido(modeloExpandido === id ? null : id);
  }

  function handleCasoClick(id: string) {
    setCasoSeleccionado(casoSeleccionado === id ? null : id);
  }

  function handlePerfilClick(id: string) {
    setPerfilSeleccionado(perfilSeleccionado === id ? null : id);
  }

  const casoActivo = CASOS_DE_USO.find((c) => c.id === casoSeleccionado) ?? null;
  const perfilActivo = PERFILES_USUARIO.find((p) => p.id === perfilSeleccionado) ?? null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Comparador de IAs 2026</h1>
        <p className={styles.heroSubtitle}>
          ChatGPT, Claude, Gemini, Copilot, Mistral y más — guía interactiva para elegir la IA correcta
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Tabs */}
        <nav className={styles.tabsNav} role="tablist" aria-label="Secciones del comparador">
          <button
            role="tab"
            aria-selected={tabActiva === 'modelos'}
            className={`${styles.tabBtn} ${tabActiva === 'modelos' ? styles.tabBtnActive : ''}`}
            onClick={() => setTabActiva('modelos')}
          >
            🗂️ Modelos
          </button>
          <button
            role="tab"
            aria-selected={tabActiva === 'casos'}
            className={`${styles.tabBtn} ${tabActiva === 'casos' ? styles.tabBtnActive : ''}`}
            onClick={() => setTabActiva('casos')}
          >
            🎯 Por caso de uso
          </button>
          <button
            role="tab"
            aria-selected={tabActiva === 'perfiles'}
            className={`${styles.tabBtn} ${tabActiva === 'perfiles' ? styles.tabBtnActive : ''}`}
            onClick={() => setTabActiva('perfiles')}
          >
            👤 Por perfil
          </button>
          <button
            role="tab"
            aria-selected={tabActiva === 'glosario'}
            className={`${styles.tabBtn} ${tabActiva === 'glosario' ? styles.tabBtnActive : ''}`}
            onClick={() => setTabActiva('glosario')}
          >
            📖 Glosario
          </button>
        </nav>

        {/* ─── Tab 1: Modelos ─── */}
        {tabActiva === 'modelos' && (
          <div className={styles.tabContent} role="tabpanel">
            <div className={styles.dataNotice} role="note">
              📅 Datos verificados en mayo de 2026. El ecosistema de IA evoluciona rápidamente — precios, modelos y capacidades pueden cambiar. Verifica en las webs oficiales antes de suscribirte.
            </div>

            {/* Filtros */}
            <div className={styles.filterRow} role="group" aria-label="Filtrar por precio">
              {(['todos', 'gratuito', 'freemium', 'pago', 'open-source'] as const).map((f) => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filtroPrecio === f ? styles.filterBtnActive : ''}`}
                  onClick={() => { setFiltroPrecio(f); setModeloExpandido(null); }}
                  aria-pressed={filtroPrecio === f}
                >
                  {f === 'todos' ? 'Todos' : f === 'gratuito' ? 'Gratuito' : f === 'freemium' ? 'Freemium' : f === 'pago' ? 'Pago' : 'Open-source'}
                </button>
              ))}
            </div>

            {/* Tabla */}
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla} aria-label="Comparativa de modelos de IA">
                <thead className={styles.tablaHead}>
                  <tr>
                    <th className={styles.tablaTh}>Modelo</th>
                    <th className={styles.tablaTh}>Precio</th>
                    <th className={styles.tablaTh}>Contexto</th>
                    <th className={styles.tablaTh}>Multi.</th>
                    <th className={styles.tablaTh}>Web</th>
                    <th className={styles.tablaTh}>Español</th>
                    <th className={styles.tablaTh}>Privacidad</th>
                    <th className={styles.tablaTh}>RGPD</th>
                    <th className={styles.tablaTh}>Mejor para</th>
                  </tr>
                </thead>
                <tbody>
                  {modelosFiltrados.map((modelo) => (
                    <>
                      <tr
                        key={modelo.id}
                        className={`${styles.tablaTr} ${modeloExpandido === modelo.id ? styles.tablaTrActivo : ''}`}
                        onClick={() => handleFilaClick(modelo.id)}
                        aria-expanded={modeloExpandido === modelo.id}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFilaClick(modelo.id); }}
                        role="button"
                        aria-label={`Ver detalle de ${modelo.nombre}`}
                      >
                        <td className={styles.tablaTd}>
                          <div className={styles.modeloCell}>
                            <div className={styles.modeloIconNombre}>
                              <span className={styles.modeloIcono} aria-hidden="true">{modelo.icono}</span>
                              <span className={styles.modeloNombre}>{modelo.nombre}</span>
                            </div>
                            <span className={styles.modeloEmpresa}>{modelo.empresa}</span>
                          </div>
                        </td>
                        <td className={styles.tablaTd}>
                          <span className={`${styles.badgePrecio} ${badgePrecioClass(modelo.rangoPrecio, styles)}`}>
                            {badgePrecioLabel(modelo.rangoPrecio)}
                          </span>
                        </td>
                        <td className={styles.tablaTd}>{modelo.contexto}</td>
                        <td className={styles.tablaTd}>{modelo.multimodal ? '✅' : '❌'}</td>
                        <td className={styles.tablaTd}>{modelo.busquedaWeb ? '✅' : '❌'}</td>
                        <td className={styles.tablaTd}>
                          <span className={styles.estrellas} aria-label={`Calidad español: ${modelo.calidadEspanol}`}>
                            {estrellas(modelo.calidadEspanol)}
                          </span>
                        </td>
                        <td className={styles.tablaTd}>
                          <span className={`${styles.badgePrivacidad} ${badgePrivacidadClass(modelo.privacidad, styles)}`}>
                            <span aria-hidden="true">{iconoPrivacidad(modelo.privacidad)}</span>
                            {modelo.privacidad.charAt(0).toUpperCase() + modelo.privacidad.slice(1)}
                          </span>
                        </td>
                        <td className={styles.tablaTd}>{modelo.rgpd ? '✅' : '❌'}</td>
                        <td className={styles.tablaTd}>
                          <div className={styles.mejorParaBadges}>
                            {modelo.mejorPara.map((caso) => (
                              <span key={caso} className={styles.mejorParaBadge}>
                                {ETIQUETAS_CASO[caso] ?? caso}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {modeloExpandido === modelo.id && (
                        <tr key={`${modelo.id}-expandido`} className={styles.filaExpandida}>
                          <td colSpan={9} className={styles.tablaTd}>
                            <div className={styles.filaExpandidaInner}>
                              <p className={styles.filaDesc}>
                                <strong>{modelo.nombre}</strong> — {modelo.descripcion}
                                <br />
                                <small style={{ color: 'var(--text-muted)' }}>{modelo.precioDetalle}</small>
                              </p>
                              <a
                                href={modelo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.enlaceOficial}
                                onClick={(e) => e.stopPropagation()}
                              >
                                🔗 Ir al sitio oficial
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

        {/* ─── Tab 2: Por caso de uso ─── */}
        {tabActiva === 'casos' && (
          <div className={styles.tabContent} role="tabpanel">
            <div className={styles.casosGrid}>
              {CASOS_DE_USO.map((caso) => (
                <button
                  key={caso.id}
                  className={`${styles.casoCard} ${casoSeleccionado === caso.id ? styles.casoCardActivo : ''}`}
                  onClick={() => handleCasoClick(caso.id)}
                  aria-pressed={casoSeleccionado === caso.id}
                >
                  <span className={styles.casoIcono} aria-hidden="true">{caso.icono}</span>
                  <h3 className={styles.casoNombre}>{caso.nombre}</h3>
                  <p className={styles.casoDesc}>{caso.descripcion}</p>
                </button>
              ))}
            </div>

            {casoActivo && (
              <div className={styles.recomendacionPanel} role="region" aria-label={`Recomendaciones para ${casoActivo.nombre}`}>
                <h3 className={styles.recomendacionTitulo}>
                  {casoActivo.icono} Mejores IAs para {casoActivo.nombre}
                </h3>
                <div className={styles.modelosRecomGrid}>
                  {casoActivo.modelosRecomendados.map((mid) => {
                    const m = MODELOS_IA.find((x) => x.id === mid);
                    if (!m) return null;
                    return (
                      <div key={m.id} className={styles.modeloRecomCard}>
                        <div className={styles.modeloRecomHeader}>
                          <span className={styles.modeloRecomIcono} aria-hidden="true">{m.icono}</span>
                          <div>
                            <p className={styles.modeloRecomNombre}>{m.nombre}</p>
                            <span className={styles.modeloRecomEmpresa}>{m.empresa}</span>
                          </div>
                        </div>
                        <p className={styles.modeloRecomDesc}>{m.descripcion}</p>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.consejoBox}>
                  <span className={styles.consejoLabel}>💡 Consejo</span>
                  {casoActivo.consejo}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 3: Por perfil ─── */}
        {tabActiva === 'perfiles' && (
          <div className={styles.tabContent} role="tabpanel">
            <div className={styles.perfilesGrid}>
              {PERFILES_USUARIO.map((perfil) => (
                <button
                  key={perfil.id}
                  className={`${styles.perfilCard} ${perfilSeleccionado === perfil.id ? styles.perfilCardActivo : ''}`}
                  onClick={() => handlePerfilClick(perfil.id)}
                  aria-pressed={perfilSeleccionado === perfil.id}
                >
                  <div className={styles.perfilHeader}>
                    <span className={styles.perfilIcono} aria-hidden="true">{perfil.icono}</span>
                    <h3 className={styles.perfilNombre}>{perfil.nombre}</h3>
                  </div>
                  <p className={styles.perfilDesc}>{perfil.descripcion}</p>
                  <ul className={styles.prioridadesLista} aria-label={`Prioridades de ${perfil.nombre}`}>
                    {perfil.prioridades.map((p) => (
                      <li key={p} className={styles.prioridadItem}>{p}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {perfilActivo && (
              <div className={styles.recomendacionPanel} role="region" aria-label={`Recomendaciones para ${perfilActivo.nombre}`}>
                <h3 className={styles.recomendacionTitulo}>
                  {perfilActivo.icono} IAs recomendadas para {perfilActivo.nombre}
                </h3>
                <div className={styles.modelosRecomGrid}>
                  {perfilActivo.modelosRecomendados.map((mid) => {
                    const m = MODELOS_IA.find((x) => x.id === mid);
                    if (!m) return null;
                    return (
                      <div key={m.id} className={styles.modeloRecomCard}>
                        <div className={styles.modeloRecomHeader}>
                          <span className={styles.modeloRecomIcono} aria-hidden="true">{m.icono}</span>
                          <div>
                            <p className={styles.modeloRecomNombre}>{m.nombre}</p>
                            <span className={styles.modeloRecomEmpresa}>{m.empresa}</span>
                          </div>
                        </div>
                        <p className={styles.modeloRecomDesc}>{m.descripcion}</p>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.razonBox}>
                  <span className={styles.razonLabel}>📌 Por qué estas IAs</span>
                  {perfilActivo.razon}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 4: Glosario ─── */}
        {tabActiva === 'glosario' && (
          <div className={styles.tabContent} role="tabpanel">
            <div className={styles.glosarioGrid}>
              {GLOSARIO.map((term) => (
                <div key={term.termino} className={styles.glosarioCard}>
                  <div className={styles.glosarioIconoTermino}>
                    <span className={styles.glosarioIcono} aria-hidden="true">{term.icono}</span>
                    <h3 className={styles.glosarioTermino}>{term.termino}</h3>
                  </div>
                  <p className={styles.glosarioDefinicion}>{term.definicion}</p>
                  <p className={styles.glosarioEjemplo}>{term.ejemplo}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Guía completa para entender y elegir IAs"
        subtitle="LLMs, tokens, privacidad y cómo tomar la mejor decisión"
      >
        <p>
          <strong>¿Qué son los LLMs y cómo funcionan?</strong> Los Large Language Models (LLMs) son sistemas
          de inteligencia artificial entrenados con enormes cantidades de texto. No &ldquo;piensan&rdquo; como los humanos:
          predicen la siguiente palabra más probable en función del contexto. Esta predicción, aplicada a miles
          de millones de parámetros, produce respuestas que parecen coherentes y razonadas. Por eso pueden
          cometer errores con confianza — el fenómeno conocido como &ldquo;alucinación&rdquo;.
        </p>
        <p>
          <strong>¿Por qué hay tantos modelos diferentes?</strong> Porque optimizar un LLM implica compromisos.
          Un modelo más grande consume más energía y es más lento, pero puede razonar mejor. Un modelo más
          pequeño es más barato y rápido, pero menos preciso. Empresas distintas priorizan distintos equilibrios:
          Anthropic prioriza seguridad y contexto largo; OpenAI prioriza versatilidad y ecosistema; Mistral
          prioriza eficiencia y cumplimiento europeo.
        </p>
        <p>
          <strong>¿Qué significa el precio por token?</strong> Los tokens son la unidad de procesamiento de los
          LLMs. Aproximadamente 1 token equivale a 0,75 palabras en inglés o 1 palabra en español. Las APIs
          cobran por tokens de entrada (tu prompt) y tokens de salida (la respuesta). Un email de 500 palabras
          genera unos 700 tokens de entrada. Multiplicado por millones de usuarios, eso es mucho cómputo.
        </p>
        <p>
          <strong>¿Cómo elegir la IA correcta?</strong> El error más común es elegir la IA más popular en lugar
          de la más adecuada para el caso de uso. ChatGPT no es necesariamente la mejor para analizar contratos
          largos (Claude tiene más contexto). Perplexity no es la mejor para redacción creativa (no está
          optimizado para eso). La clave es identificar primero qué necesitas hacer y luego buscar qué modelo
          está optimizado para esa tarea específica.
        </p>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Marco de evaluación: 4 preguntas antes de elegir
        </h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>1. ¿Qué necesitas hacer?</strong>
            <p>Define el caso de uso primero, no el modelo. Redacción, análisis, código o búsqueda tienen ganadores distintos.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>2. ¿Qué datos manejarás?</strong>
            <p>Si son confidenciales, elige RGPD (Mistral, Copilot Enterprise). Si son públicos, cualquiera vale.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>3. ¿Cuánto puedes gastar?</strong>
            <p>Gratis para uso personal ocasional. ~20€/mes para profesional intensivo. API para integrar en productos.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>4. ¿Cuánto contexto necesitas?</strong>
            <p>Documentos largos (contratos, informes) requieren Claude (200K) o Gemini (1M). Para conversaciones normales, cualquiera.</p>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Preguntas frecuentes
        </h4>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la mejor IA en español?</strong>
            <span>En 2026 todas las grandes (ChatGPT, Claude, Gemini) tienen nivel excelente en español. La diferencia está en el matiz, el estilo y el contexto, no en la comprensión básica del idioma.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es seguro usar ChatGPT para datos de empresa?</strong>
            <span>No sin el plan Enterprise europeo. Para datos sensibles, usa Mistral AI (Francia), Copilot Enterprise con región Europa, o Llama instalado en tus propios servidores.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es mejor: pagar o usar la versión gratis?</strong>
            <span>Depende del volumen. Si usas la IA varias horas al día para trabajar, los ~20€/mes se amortizan en un día de productividad ganada. Para uso ocasional, las versiones gratuitas son suficientes.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Pueden las IAs acceder a internet?</strong>
            <span>ChatGPT, Gemini, Copilot, Mistral y Perplexity sí tienen acceso web. Claude y DeepSeek no lo tienen por defecto. Perplexity siempre cita las fuentes, lo que lo hace ideal para investigación.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿DeepSeek es de fiar?</strong>
            <span>Técnicamente es muy potente (especialmente en código y matemáticas) y la API más barata del mercado. Pero sus servidores están en China: no usar para datos empresariales, contratos ni información personal.</span>
          </li>
        </ul>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Cómo elegir tu primera IA: 5 pasos
        </h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <p><strong>Prueba la versión gratuita</strong> — ChatGPT, Claude y Gemini ofrecen versiones gratuitas muy capaces. Prueba las tres antes de pagar cualquier suscripción.</p>
          </div>
          <div className={styles.step}>
            <p><strong>Identifica tu caso de uso principal</strong> — ¿Redacción? ¿Código? ¿Búsqueda? ¿Análisis de documentos? El caso de uso determina el modelo óptimo.</p>
          </div>
          <div className={styles.step}>
            <p><strong>Evalúa la privacidad necesaria</strong> — Si manejas datos de clientes, contratos o información sensible, la privacidad no es opcional. Filtra por RGPD desde el inicio.</p>
          </div>
          <div className={styles.step}>
            <p><strong>Compara precios reales</strong> — 20€/mes son ~0,67€/día. Calcula cuántas horas de trabajo ahorras al mes y decide si la inversión merece la pena.</p>
          </div>
          <div className={styles.step}>
            <p><strong>Decide y especializa</strong> — No tienes que usar solo una IA. Combina: Claude para análisis, Perplexity para investigación, ChatGPT para creatividad.</p>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Consejos prácticos
        </h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <strong>Empieza con la versión gratuita</strong>
            No pagues antes de probar. Las versiones free de ChatGPT, Claude y Gemini cubren el 80% de los casos de uso habituales.
          </div>
          <div className={styles.tipCard}>
            <strong>Un buen prompt vale más que un modelo caro</strong>
            La calidad de la instrucción importa más que el modelo. Un prompt detallado en GPT-4o mini supera un prompt vago en GPT-4o.
          </div>
          <div className={styles.tipCard}>
            <strong>Para empresa, prioriza RGPD</strong>
            El coste de una violación de datos supera con creces el coste de un plan empresarial RGPD. No escatimes en privacidad.
          </div>
          <div className={styles.tipCard}>
            <strong>Combina varias IAs según la tarea</strong>
            Los profesionales más eficientes no usan una sola IA: Claude para análisis, Perplexity para hechos, ChatGPT para creatividad.
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <strong>⚠️ Nota importante:</strong> Esta guía es educativa. Los precios, modelos y capacidades cambian constantemente en el ecosistema de IA. Consulta siempre las webs oficiales para datos actualizados antes de contratar cualquier servicio o tomar decisiones empresariales basadas en esta información.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-comparador-ia')} />
      <ShareCard appName="visualizador-comparador-ia" />
      <Footer appName="visualizador-comparador-ia" />
    </div>
  );
}
