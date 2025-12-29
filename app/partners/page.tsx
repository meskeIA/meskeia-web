'use client';

import { useState } from 'react';
import styles from './Partners.module.css';
import { MeskeiaLogo, Footer } from '@/components';

type SectorType = 'gestorias' | 'autonomos' | 'inmobiliarias' | 'educacion';

// Datos de las Guías disponibles para badges
const GUIAS_DATA = [
  {
    id: 'comprar-casa',
    name: 'Guía Comprar Casa',
    icon: '🏠',
    url: '/guia/comprar-casa/',
    badgeUrl: '/badge-guia-comprar-casa.svg',
    tools: 5,
    sector: 'Inmobiliarias',
    description: 'Hipoteca, gastos, comparativa alquiler vs compra'
  },
  {
    id: 'emprendedor',
    name: 'Guía Emprendedor',
    icon: '🚀',
    url: '/guia/emprendedor/',
    badgeUrl: '/badge-guia-emprendedor.svg',
    tools: 7,
    sector: 'Incubadoras, Cámaras de Comercio',
    description: 'Formas jurídicas, costes, fiscalidad inicial'
  },
  {
    id: 'freelance',
    name: 'Guía Freelance',
    icon: '💼',
    url: '/guia/freelance/',
    badgeUrl: '/badge-guia-freelance.svg',
    tools: 6,
    sector: 'Asociaciones de Autónomos',
    description: 'Cuotas, IRPF, IVA, tarifas, facturas'
  },
  {
    id: 'invertir',
    name: 'Guía para Invertir',
    icon: '📈',
    url: '/guia/invertir/',
    badgeUrl: '/badge-guia-invertir.svg',
    tools: 5,
    sector: 'Banca, Asesores financieros',
    description: 'Perfil inversor, interés compuesto, cartera'
  },
  {
    id: 'herencias',
    name: 'Guía Herencias',
    icon: '📜',
    url: '/guia-tramitacion-herencias/',
    badgeUrl: '/badge-guia-herencias.svg',
    tools: 2,
    sector: 'Gestorías, Notarías',
    description: 'Checklist paso a paso, plazos, documentos'
  },
];

interface ToolLink {
  name: string;
  url: string;
  description: string;
}

const SECTOR_DATA: Record<SectorType, {
  title: string;
  icon: string;
  description: string;
  tools: ToolLink[];
}> = {
  gestorias: {
    title: 'Gestorías y Asesorías Fiscales',
    icon: '🏛️',
    description: 'Herramientas fiscales para ofrecer a tus clientes',
    tools: [
      { name: 'Calculadora de IVA', url: '/calculadora-iva/', description: 'Añade o quita IVA al 21%, 10% o 4%' },
      { name: 'Simulador IRPF', url: '/simulador-irpf/', description: 'Calcula retenciones según normativa actual' },
      { name: 'Gastos Deducibles', url: '/simulador-gastos-deducibles/', description: 'Optimiza IRPF e IVA con deducciones' },
      { name: 'Calculadora Plusvalías', url: '/calculadora-plusvalias-irpf/', description: 'IRPF de acciones, fondos y cripto' },
      { name: 'Impuesto Sucesiones', url: '/calculadora-sucesiones-nacional/', description: 'Herencias por comunidad autónoma' },
      { name: 'Impuesto Donaciones', url: '/calculadora-donaciones-nacional/', description: 'Donaciones con bonificaciones 2025' },
      { name: 'Guía Herencias', url: '/guia-tramitacion-herencias/', description: 'Paso a paso con checklist y plazos' },
      { name: 'Compraventa Inmuebles', url: '/simulador-compraventa-inmueble/', description: 'ITP, notaría, registro por CCAA' },
    ]
  },
  autonomos: {
    title: 'Asociaciones de Autónomos',
    icon: '💼',
    description: 'Herramientas de gestión para profesionales independientes',
    tools: [
      { name: 'Cuota de Autónomo', url: '/calculadora-cuota-autonomo/', description: 'Calcula tu cuota según ingresos' },
      { name: 'Autónomo vs SL', url: '/simulador-autonomo-vs-sl/', description: 'Compara fiscalidad y costes' },
      { name: 'Tarifa Freelance', url: '/calculadora-tarifa-freelance/', description: 'Calcula tu tarifa por hora ideal' },
      { name: 'Generador Facturas', url: '/generador-facturas/', description: 'Facturas con IVA y retención IRPF' },
      { name: 'Punto de Equilibrio', url: '/calculadora-break-even/', description: 'Break-even y rentabilidad' },
      { name: 'Planificador Cash Flow', url: '/planificador-cashflow/', description: 'Proyección a 12 meses' },
      { name: 'Time Tracker', url: '/time-tracker/', description: 'Registra horas por proyecto' },
      { name: 'ROI Marketing', url: '/calculadora-roi-marketing/', description: 'Analiza retorno por canal' },
    ]
  },
  inmobiliarias: {
    title: 'Inmobiliarias y Agencias',
    icon: '🏘️',
    description: 'Calculadoras para compradores, vendedores e inquilinos',
    tools: [
      { name: 'Simulador Hipoteca', url: '/simulador-hipoteca/', description: 'Cuota y cuadro de amortización' },
      { name: 'Amortización Anticipada', url: '/amortizacion-hipoteca/', description: 'Reducir cuota vs reducir plazo' },
      { name: 'Gastos Compraventa', url: '/simulador-compraventa-inmueble/', description: 'ITP, notaría, registro, plusvalía' },
      { name: 'Alquiler vs Compra', url: '/calculadora-alquiler-vs-compra/', description: 'Análisis financiero completo' },
      { name: 'Simulador Préstamos', url: '/simulador-prestamos/', description: 'Francés, alemán, americano' },
      { name: 'Gasto Energético', url: '/calculadora-gasto-energetico/', description: 'Consumo y coste eléctrico' },
      { name: 'División Gastos', url: '/calculadora-roommates/', description: 'Divide gastos entre inquilinos' },
      { name: 'Planificador Mudanza', url: '/planificador-mudanzas/', description: 'Checklist e inventario' },
    ]
  },
  educacion: {
    title: 'Centros Educativos',
    icon: '🎓',
    description: 'Herramientas de matemáticas, ciencias y estudio',
    tools: [
      { name: 'Calculadora Porcentajes', url: '/calculadora-porcentajes/', description: 'Todo tipo de operaciones con %' },
      { name: 'Regla de Tres', url: '/calculadora-regla-de-tres/', description: 'Simple y compuesta con ejemplos' },
      { name: 'Tabla Periódica', url: '/tabla-periodica/', description: '118 elementos interactivos' },
      { name: 'Calculadora Notas', url: '/calculadora-notas/', description: 'Media ponderada académica' },
      { name: 'Ecuaciones', url: '/algebra-ecuaciones/', description: 'Lineales, cuadráticas y sistemas' },
      { name: 'Física Cinemática', url: '/calculadora-movimiento/', description: 'MRU, MRUA con gráficos' },
      { name: 'Simulador Física', url: '/simulador-fisica/', description: 'Animaciones de fenómenos' },
      { name: 'Genética Mendeliana', url: '/simulador-genetica-mendeliana/', description: 'Cruces y cuadros Punnett' },
    ]
  }
};

export default function PartnersPage() {
  const [selectedSector, setSelectedSector] = useState<SectorType>('gestorias');
  const [copied, setCopied] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);

  const currentSector = SECTOR_DATA[selectedSector];

  const generateBadgeHTML = (guia: typeof GUIAS_DATA[0]) => {
    return `<!-- Badge meskeIA: ${guia.name} -->
<a href="https://meskeia.com${guia.url}" target="_blank" rel="noopener" title="${guia.name} - meskeIA">
  <img src="https://meskeia.com${guia.badgeUrl}" alt="${guia.name}" width="220" height="60" style="border-radius: 8px;">
</a>`;
  };

  const copyBadgeToClipboard = (guia: typeof GUIAS_DATA[0]) => {
    navigator.clipboard.writeText(generateBadgeHTML(guia));
    setCopiedBadge(guia.id);
    setTimeout(() => setCopiedBadge(null), 2000);
  };

  const generateHTML = () => {
    const tools = currentSector.tools;
    return `<!-- Kit meskeIA para ${currentSector.title} -->
<div style="background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%); border-radius: 12px; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
    <span style="font-size: 28px;">${currentSector.icon}</span>
    <div>
      <div style="color: white; font-size: 18px; font-weight: 600;">Herramientas gratuitas</div>
      <div style="color: rgba(255,255,255,0.8); font-size: 14px;">powered by meskeIA</div>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
${tools.map(tool => `    <a href="https://meskeia.com${tool.url}" target="_blank" rel="noopener" style="background: rgba(255,255,255,0.15); color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-size: 14px; transition: background 0.2s;">${tool.name}</a>`).join('\n')}
  </div>
  <div style="text-align: center; margin-top: 16px;">
    <a href="https://meskeia.com" target="_blank" rel="noopener" style="color: rgba(255,255,255,0.7); font-size: 12px; text-decoration: none;">meskeia.com</a>
  </div>
</div>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateHTML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🤝</span>
        <h1 className={styles.title}>Programa Partners</h1>
        <p className={styles.subtitle}>
          Ofrece herramientas gratuitas a tus clientes. Integración en minutos.
        </p>
      </header>

      {/* Beneficios */}
      <section className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>¿Por qué integrar meskeIA?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>🎁</span>
            <h3>100% Gratuito</h3>
            <p>Sin coste para ti ni para tus usuarios. Sin límites de uso.</p>
          </div>
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>⚡</span>
            <h3>5 minutos</h3>
            <p>Copia y pega el código HTML. Sin desarrollo necesario.</p>
          </div>
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>🔄</span>
            <h3>Siempre actualizado</h3>
            <p>Normativa fiscal y cálculos actualizados automáticamente.</p>
          </div>
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>📱</span>
            <h3>Responsive</h3>
            <p>Funciona perfectamente en móvil, tablet y escritorio.</p>
          </div>
        </div>
      </section>

      {/* Opción 1: Badges con Guías */}
      <section className={styles.guidesSection}>
        <h2 className={styles.sectionTitle}>📘 Opción 1: Badge con Guía</h2>
        <p className={styles.sectionSubtitle}>
          Un badge compacto que enlaza a una guía completa. Ideal para sidebars, footers o artículos.
        </p>
        <div className={styles.guidesGrid}>
          {GUIAS_DATA.map((guia) => (
            <div key={guia.id} className={styles.guideCard}>
              <div className={styles.guideHeader}>
                <span className={styles.guideIcon}>{guia.icon}</span>
                <div>
                  <h3 className={styles.guideName}>{guia.name}</h3>
                  <p className={styles.guideSector}>{guia.sector}</p>
                </div>
              </div>
              <p className={styles.guideDescription}>{guia.description}</p>
              <div className={styles.guideTools}>{guia.tools} herramientas incluidas</div>
              <div className={styles.guideBadgePreview}>
                <a href={`https://meskeia.com${guia.url}`} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guia.badgeUrl}
                    alt={guia.name}
                    className={styles.badgeImage}
                  />
                </a>
              </div>
              <button
                onClick={() => copyBadgeToClipboard(guia)}
                className={styles.copyBadgeButton}
              >
                {copiedBadge === guia.id ? '✓ Copiado' : '📋 Copiar código'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Opción 2: Bloque completo - Selector de sector */}
      <section className={styles.selectorSection}>
        <h2 className={styles.sectionTitle}>📦 Opción 2: Bloque completo</h2>
        <p className={styles.sectionSubtitle}>
          Un widget con múltiples herramientas. Ideal para secciones destacadas o páginas de recursos.
        </p>
        <h3 className={styles.selectorLabel}>Elige tu sector:</h3>
        <div className={styles.sectorButtons}>
          {(Object.keys(SECTOR_DATA) as SectorType[]).map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`${styles.sectorButton} ${selectedSector === sector ? styles.sectorButtonActive : ''}`}
            >
              <span className={styles.sectorIcon}>{SECTOR_DATA[sector].icon}</span>
              <span className={styles.sectorName}>{SECTOR_DATA[sector].title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Preview y código */}
      <section className={styles.previewSection}>
        <div className={styles.previewContainer}>
          {/* Preview visual */}
          <div className={styles.previewPanel}>
            <h3 className={styles.panelTitle}>Vista previa</h3>
            <div className={styles.previewBox}>
              <div className={styles.widgetPreview}>
                <div className={styles.widgetHeader}>
                  <span className={styles.widgetIcon}>{currentSector.icon}</span>
                  <div>
                    <div className={styles.widgetTitle}>Herramientas gratuitas</div>
                    <div className={styles.widgetSubtitle}>powered by meskeIA</div>
                  </div>
                </div>
                <div className={styles.widgetGrid}>
                  {currentSector.tools.map((tool, index) => (
                    <a
                      key={index}
                      href={`https://meskeia.com${tool.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.widgetLink}
                    >
                      {tool.name}
                    </a>
                  ))}
                </div>
                <div className={styles.widgetFooter}>meskeia.com</div>
              </div>
            </div>
          </div>

          {/* Código HTML */}
          <div className={styles.codePanel}>
            <div className={styles.codePanelHeader}>
              <h3 className={styles.panelTitle}>Código HTML</h3>
              <button onClick={copyToClipboard} className={styles.copyButton}>
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <pre className={styles.codeBox}>
              <code>{generateHTML()}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Lista de herramientas del sector */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          {currentSector.icon} Herramientas incluidas
        </h2>
        <div className={styles.toolsGrid}>
          {currentSector.tools.map((tool, index) => (
            <a
              key={index}
              href={`https://meskeia.com${tool.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.toolCard}
            >
              <h4 className={styles.toolName}>{tool.name}</h4>
              <p className={styles.toolDescription}>{tool.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3>Elige tu sector</h3>
            <p>Selecciona el kit que mejor se adapte a tu negocio y clientes.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3>Copia el código</h3>
            <p>Haz clic en &quot;Copiar&quot; para obtener el HTML listo.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3>Pega en tu web</h3>
            <p>Añade el código donde quieras mostrar las herramientas.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>4</div>
            <h3>¡Listo!</h3>
            <p>Tus clientes ya pueden usar las herramientas de meskeIA.</p>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className={styles.contactSection}>
        <div className={styles.contactCard}>
          <h2>¿Necesitas un kit personalizado?</h2>
          <p>
            Si tu organización necesita herramientas específicas o una integración
            más profunda, podemos crear un kit a medida para ti.
          </p>
          <a href="mailto:meskeia24@gmail.com" className={styles.contactButton}>
            📧 Contactar: meskeia24@gmail.com
          </a>
        </div>
      </section>

      <Footer appName="partners" />
    </div>
  );
}
