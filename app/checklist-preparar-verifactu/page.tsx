'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback } from 'react';
import styles from './ChecklistPrepararVerifactu.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ──────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────
interface ChecklistItem {
  id: string;
  titulo: string;
  info: string;
}

interface Seccion {
  id: string;
  titulo: string;
  icono: string;
  items: ChecklistItem[];
}

// ──────────────────────────────────────────
// DATOS DEL CHECKLIST
// ──────────────────────────────────────────
const SECCIONES: Seccion[] = [
  {
    id: 'entender',
    titulo: 'Entender VeriFactu',
    icono: '📋',
    items: [
      {
        id: 'que-es',
        titulo: 'Sé qué es VeriFactu y cómo me afecta como autónomo/empresa',
        info: 'Sistema de facturación electrónica regulado por el RD 1007/2023. Obliga a que el software de facturación envíe registros de facturación a la AEAT en tiempo real (o casi real).',
      },
      {
        id: 'fecha-limite',
        titulo: 'Conozco la fecha límite de entrada en vigor',
        info: '1 de enero de 2027 (aplazado desde julio 2025). Aplica a todos los empresarios y profesionales obligados a emitir factura.',
      },
      {
        id: 'obligado',
        titulo: 'Sé si estoy obligado a cumplir VeriFactu',
        info: 'Obligados: todos los autónomos y empresas que facturen en territorio español (excepto quienes tributen en SII — grandes empresas, IGIC Canarias tiene normativa propia). Si usas el SII de la AEAT, ya cumples un sistema similar.',
      },
    ],
  },
  {
    id: 'software',
    titulo: 'Software y Tecnología',
    icono: '💻',
    items: [
      {
        id: 'software-certificado',
        titulo: 'Mi software de facturación actual está certificado VeriFactu (o tiene plan de serlo)',
        info: 'El software debe estar homologado y enviar registros con firma electrónica. Consulta con tu proveedor si ya tiene certificación o fecha prevista. Programas populares: Holded, Billin, Quipu, Contasol, A3.',
      },
      {
        id: 'certificado-digital',
        titulo: 'Tengo certificado digital vigente (persona física o entidad)',
        info: 'Necesario para la firma electrónica de los registros. Obtenerlo en la FNMT (sede.fnmt.gob.es) o con DNIe. Renovar antes de caducidad.',
      },
      {
        id: 'sandbox-aeat',
        titulo: 'He probado el entorno de pruebas de la AEAT',
        info: 'La AEAT ofrecerá un sandbox para probar antes de la entrada en vigor. Recomendable probarlo con tu software en cuanto esté disponible.',
      },
      {
        id: 'plan-contingencia',
        titulo: 'Tengo plan de contingencia si mi software no está listo a tiempo',
        info: 'Si tu proveedor no llega, opciones: cambiar de software, usar la herramienta gratuita de la AEAT (prevista), o contratar asesor para la transición.',
      },
    ],
  },
  {
    id: 'facturacion',
    titulo: 'Facturación',
    icono: '📄',
    items: [
      {
        id: 'campos-obligatorios',
        titulo: 'Mis facturas incluyen todos los campos obligatorios',
        info: 'NIF emisor/receptor, fecha, número correlativo, descripción, base imponible, tipo IVA, cuota IVA. VeriFactu añade: código QR verificable y enlace al registro en la AEAT.',
      },
      {
        id: 'numeracion-correlativa',
        titulo: 'Tengo numeración correlativa sin saltos',
        info: 'VeriFactu detectará huecos en la numeración. Es fundamental tener series correlativas sin saltos ni duplicados.',
      },
      {
        id: 'facturas-simplificadas',
        titulo: 'He revisado que no emito facturas simplificadas cuando no corresponde',
        info: 'Factura simplificada (ticket): solo permitida para importes < 400 \u20AC (o < 3.000 \u20AC en ciertos sectores). VeriFactu también aplica a simplificadas.',
      },
      {
        id: 'copias-seguridad',
        titulo: 'Tengo copia de seguridad de todas mis facturas emitidas y recibidas',
        info: 'Conservar 4 años (obligación fiscal general). VeriFactu no te exime de guardar tus propias copias.',
      },
    ],
  },
  {
    id: 'sanciones',
    titulo: 'Sanciones y Riesgos',
    icono: '⚠️',
    items: [
      {
        id: 'conocer-sanciones',
        titulo: 'Conozco las sanciones por incumplimiento',
        info: 'Usar software no certificado: hasta 50.000 \u20AC por ejercicio. No enviar registros: sanción por cada factura no reportada. Facturación fraudulenta: sanción agravada + posible delito fiscal.',
      },
      {
        id: 'fechas-calendario',
        titulo: 'He marcado en mi calendario las fechas clave',
        info: 'Fecha entrada en vigor: 1 enero 2027. Recomendación: tener software listo 3 meses antes (octubre 2026) para pruebas.',
      },
      {
        id: 'asesor-fiscal',
        titulo: 'He consultado con mi asesor fiscal sobre cómo me afecta',
        info: 'Aunque puedes prepararte solo, un asesor puede detectar particularidades de tu actividad (sectores especiales, operaciones intracomunitarias, recargo de equivalencia).',
      },
    ],
  },
];

const TOTAL_ITEMS = SECCIONES.reduce((acc, s) => acc + s.items.length, 0);
const STORAGE_KEY = 'meskeia-checklist-verifactu';

// ──────────────────────────────────────────
// COMPONENTE
// ──────────────────────────────────────────
export default function ChecklistPrepararVerifactuPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Cargar progreso de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setChecked(JSON.parse(saved) as Record<string, boolean>);
      }
    } catch {
      // localStorage no disponible
    }
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // localStorage no disponible
    }
  }, [checked]);

  const toggleCheck = useCallback((id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSection = useCallback((id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const resetChecklist = useCallback(() => {
    setChecked({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage no disponible
    }
  }, []);

  const completados = Object.values(checked).filter(Boolean).length;
  const porcentaje = Math.round((completados / TOTAL_ITEMS) * 100);

  const getSeccionEstado = (seccion: Seccion): { label: string; clase: string } => {
    const total = seccion.items.length;
    const hechos = seccion.items.filter(item => checked[item.id]).length;
    if (hechos === total) return { label: '✅ Completada', clase: styles.badgeCompleta };
    if (hechos > 0) return { label: '🔄 En progreso', clase: styles.badgeProgreso };
    return { label: '⬜ Sin empezar', clase: styles.badgePendiente };
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}>📋 Checklist VeriFactu</h1>
          <p className={styles.subtitle}>
            Prepara tu negocio para la facturación electrónica obligatoria (enero 2027)
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        {/* Barra de progreso */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              Progreso: {completados} de {TOTAL_ITEMS} completados
            </span>
            <span className={styles.progressPercent}>{porcentaje}%</span>
          </div>
          <div className={styles.progressBar} role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={styles.progressFill}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          {porcentaje === 100 && (
            <div className={styles.completadoMsg} role="alert" aria-live="polite">
              🎉 ¡Checklist completado! Tu negocio está preparado para VeriFactu.
            </div>
          )}
        </div>

        {/* Secciones del checklist */}
        <div className={styles.secciones}>
          {SECCIONES.map(seccion => {
            const estado = getSeccionEstado(seccion);
            const isCollapsed = collapsedSections[seccion.id] ?? false;

            return (
              <section key={seccion.id} className={styles.seccion}>
                <button
                  className={styles.seccionHeader}
                  onClick={() => toggleSection(seccion.id)}
                  aria-expanded={!isCollapsed}
                  aria-label={`Sección ${seccion.titulo}: ${estado.label}`}
                >
                  <div className={styles.seccionTitulo}>
                    <span className={styles.seccionIcono} aria-hidden="true">{seccion.icono}</span>
                    <h2>{seccion.titulo}</h2>
                  </div>
                  <div className={styles.seccionMeta}>
                    <span className={`${styles.badge} ${estado.clase}`}>{estado.label}</span>
                    <span className={`${styles.chevron} ${isCollapsed ? styles.chevronCollapsed : ''}`} aria-hidden="true">▼</span>
                  </div>
                </button>

                {!isCollapsed && (
                  <ul className={styles.itemList}>
                    {seccion.items.map(item => {
                      const isChecked = checked[item.id] ?? false;
                      const isExpanded = expandedItems[item.id] ?? false;

                      return (
                        <li key={item.id} className={`${styles.item} ${isChecked ? styles.itemChecked : ''}`}>
                          <div className={styles.itemRow}>
                            <label className={styles.checkLabel}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCheck(item.id)}
                                className={styles.checkboxHidden}
                              />
                              <span className={`${styles.checkboxCustom} ${isChecked ? styles.checkboxChecked : ''}`} aria-hidden="true">
                                {isChecked && '✓'}
                              </span>
                              <span className={`${styles.itemText} ${isChecked ? styles.itemTextChecked : ''}`}>
                                {item.titulo}
                              </span>
                            </label>
                            <button
                              className={styles.infoToggle}
                              onClick={() => toggleExpand(item.id)}
                              aria-expanded={isExpanded}
                              aria-label={`Más información sobre: ${item.titulo}`}
                            >
                              {isExpanded ? '−' : '+'}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className={styles.infoPanel}>
                              <p>{item.info}</p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Botón reiniciar */}
        <div className={styles.resetWrapper}>
          <button
            className={styles.btnReset}
            onClick={resetChecklist}
            aria-label="Reiniciar checklist: desmarcar todos los elementos"
          >
            🔄 Reiniciar checklist
          </button>
        </div>

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 Todo sobre VeriFactu"
          subtitle="Guía completa sobre la facturación electrónica en España"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es VeriFactu exactamente?</h2>
            <p>
              VeriFactu es el nombre coloquial del sistema de <strong>Verificación de Facturas</strong> regulado
              por el <strong>Real Decreto 1007/2023</strong>, de 5 de diciembre. Establece que los programas
              de facturación deben generar un registro de cada factura emitida y enviarlo a la Agencia Tributaria
              (AEAT) de forma automática, prácticamente en tiempo real.
            </p>
            <p>
              El objetivo es combatir el fraude fiscal mediante el uso de <strong>software de facturación certificado</strong> que
              garantice la integridad, trazabilidad e inalterabilidad de los registros de facturación.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Diferencia entre VeriFactu y SII</h2>
            <p>
              El <strong>SII</strong> (Suministro Inmediato de Información) ya obliga a grandes empresas
              (facturación &gt; 6 millones €/año) a enviar registros de facturación a la AEAT desde 2017.
            </p>
            <p>
              <strong>VeriFactu</strong> extiende una obligación similar al resto de autónomos y pymes. Las
              principales diferencias:
            </p>
            <ul>
              <li><strong>SII</strong>: envío en 4 días naturales, solo grandes empresas, sin código QR.</li>
              <li><strong>VeriFactu</strong>: envío (casi) inmediato, todos los obligados, incluye código QR verificable.</li>
              <li>Si ya estás en el SII, no necesitas adaptarte a VeriFactu (cumples un estándar equivalente).</li>
            </ul>
          </section>

          <section className={styles.guideSection}>
            <h2>Cronología: del borrador al RD 1007/2023</h2>
            <ul>
              <li><strong>2021</strong>: Ley 11/2021 Antifraude — establece la base legal para prohibir software de doble contabilidad.</li>
              <li><strong>2022</strong>: Borrador del reglamento técnico de facturación electrónica.</li>
              <li><strong>Dic 2023</strong>: Publicación del RD 1007/2023 con los requisitos técnicos.</li>
              <li><strong>Jul 2025</strong>: Fecha original de entrada en vigor (aplazada).</li>
              <li><strong>Ene 2027</strong>: Nueva fecha de entrada en vigor obligatoria.</li>
            </ul>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>

            <h3>¿Afecta a autónomos en módulos (estimación objetiva)?</h3>
            <p>
              Sí. Todos los autónomos que emitan facturas están obligados, independientemente de su régimen
              de tributación (estimación directa u objetiva/módulos).
            </p>

            <h3>¿Y al régimen de recargo de equivalencia?</h3>
            <p>
              Los comerciantes minoristas en recargo de equivalencia normalmente no emiten facturas con IVA
              (sus proveedores les repercuten el recargo). Si no emiten facturas, no les aplica. Pero si
              emiten facturas por cualquier motivo, deben cumplir VeriFactu.
            </p>

            <h3>¿Puedo seguir usando Excel para mis facturas?</h3>
            <p>
              No. VeriFactu exige que el software esté <strong>certificado y homologado</strong>. Excel, Word
              o cualquier herramienta genérica no cumple los requisitos técnicos (firma electrónica, envío
              automático a la AEAT, código QR).
            </p>

            <h3>¿Qué pasa si mi proveedor de software no está listo?</h3>
            <p>
              La AEAT prevé ofrecer una herramienta gratuita básica. Además, puedes cambiar de proveedor.
              Lo importante es no esperar al último momento.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Consejos para prepararte a tiempo</h2>
            <ul>
              <li>
                <strong>No esperes al último mes</strong>: contacta con tu proveedor de software ahora para
                conocer su plan de certificación.
              </li>
              <li>
                <strong>Renueva tu certificado digital</strong>: si caduca antes de enero 2027, renuévalo
                con antelación (FNMT puede tardar semanas).
              </li>
              <li>
                <strong>Revisa tu numeración de facturas</strong>: asegúrate de que no hay saltos ni duplicados
                en tus series actuales.
              </li>
              <li>
                <strong>Haz copias de seguridad</strong>: aunque VeriFactu registre tus facturas en la AEAT,
                la obligación de conservación sigue siendo tuya.
              </li>
              <li>
                <strong>Consulta con tu asesor</strong>: especialmente si tienes operaciones intracomunitarias,
                exportaciones o sectores con regímenes especiales.
              </li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('checklist-preparar-verifactu')} />
        <ShareCard appName="checklist-preparar-verifactu" />
        <Footer appName="checklist-preparar-verifactu" />
    </div>
  );
}
