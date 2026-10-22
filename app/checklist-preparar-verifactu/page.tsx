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
        // C0318 (22/10/2026): no es la factura electrónica entre empresas (Ley Crea y Crece), ni
        // obliga a remitir: remitir es la modalidad VERI*FACTU, voluntaria (FAQ de la AEAT).
        info: 'Reglamento de los sistemas informáticos de facturación (RD 1007/2023); no es la factura electrónica entre empresas de la Ley Crea y Crece. Obliga a que el programa con el que facturas genere un registro de cada factura, encadenado e inalterable. Puedes remitirlos a la AEAT al emitir cada factura (modalidad VERI*FACTU, voluntaria) o conservarlos firmados en tu propio sistema.',
      },
      {
        id: 'fecha-limite',
        titulo: 'Conozco la fecha límite de entrada en vigor',
        info: 'Sociedades (contribuyentes del Impuesto sobre Sociedades): antes del 1 de enero de 2027. Resto de obligados, autónomos incluidos: antes del 1 de julio de 2027 (disposición final 4.ª del RD 1007/2023, en la redacción del RDL 15/2025; la fecha original era julio de 2025).',
      },
      {
        id: 'obligado',
        titulo: 'Sé si estoy obligado a cumplir VeriFactu',
        info: 'Obligados (art. 3.1 del RD 1007/2023): las sociedades y los autónomos que facturen con un programa informático, también en estimación objetiva (módulos). Quedan fuera quienes llevan los libros registro por el SII de la AEAT (art. 3.3), que ya le remiten sus facturas por esa vía (IGIC Canarias tiene normativa propia).',
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
        titulo: 'Mi software de facturación cumple VeriFactu (o tiene fecha para hacerlo)',
        info: 'No hay homologación de la AEAT: es el fabricante quien declara, en una declaración responsable que debe verse en el propio programa, que cumple el reglamento (art. 13 del RD 1007/2023). Pide a tu proveedor esa declaración o la fecha en que la tendrá. Programas populares: Holded, Billin, Quipu, Contasol, A3.',
      },
      {
        id: 'certificado-digital',
        titulo: 'Tengo certificado digital vigente (persona física o entidad)',
        info: 'Con VERI*FACTU los registros no se firman: basta su huella o «hash» (art. 16.3 del RD 1007/2023); la firma electrónica es de la modalidad que no los remite (art. 12). Para remitirlos, el programa usa un certificado cualificado: el tuyo, o el de quien te represente o colabore en tu nombre. Obtenerlo en la FNMT (sede.fnmt.gob.es) o con DNIe, y renovarlo antes de que caduque.',
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
        // C0318 (22/10/2026): art. 201 bis LGT, según la FAQ de la AEAT: multa FIJA, no «hasta»,
        // y no hay una sanción por cada factura.
        info: 'Tener un programa que no cumple el reglamento, o alterado: multa fija de 50.000 € por cada ejercicio (art. 201 bis LGT). A quien lo fabrica o vende: 150.000 € por ejercicio y por cada tipo de programa, y 1.000 € por cada uno vendido sin la certificación exigida. Facturación fraudulenta: además, posible delito fiscal.',
      },
      {
        id: 'fechas-calendario',
        titulo: 'He marcado en mi calendario las fechas clave',
        info: 'Sociedades: antes del 1 de enero de 2027. Autónomos y demás obligados: antes del 1 de julio de 2027. Recomendación: tener el software listo unos meses antes de tu fecha para probarlo.',
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
          <h1 className={styles.title}><span aria-hidden="true">📋</span> Checklist VeriFactu</h1>
          <p className={styles.subtitle}>
            Prepara tu negocio para VeriFactu: sociedades antes de enero de 2027, autónomos antes de julio de 2027
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
              <span aria-hidden="true">🎉</span> ¡Checklist completado! Tu negocio está preparado para VeriFactu.
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
                  type="button"
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
                              type="button"
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
            type="button"
            className={styles.btnReset}
            onClick={resetChecklist}
            aria-label="Reiniciar checklist: desmarcar todos los elementos"
          >
            <span aria-hidden="true">🔄</span> Reiniciar checklist
          </button>
        </div>

        {/* Contenido educativo */}
        <EducationalSection
          title="Todo sobre VeriFactu"
          subtitle="Guía del reglamento de los sistemas informáticos de facturación en España"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es VeriFactu exactamente?</h2>
            <p>
              VeriFactu es el nombre coloquial del sistema de <strong>Verificación de Facturas</strong> regulado
              por el <strong>Real Decreto 1007/2023</strong>, de 5 de diciembre. Establece que los programas
              de facturación deben generar un registro de cada factura emitida, encadenado con el anterior e
              inalterable. Hay dos formas de cumplirlo: remitir cada registro a la Agencia Tributaria (AEAT)
              al emitir la factura —la modalidad <strong>VERI*FACTU</strong>, voluntaria, que no exige firmarlos— o
              conservarlos en el propio sistema firmados electrónicamente (arts. 12 y 16).
            </p>
            <p>
              No es la <strong>factura electrónica</strong> entre empresas que exige la Ley Crea y Crece: esa es
              otra obligación, que puede convivir con esta en el mismo programa.
            </p>
            <p>
              El objetivo es combatir el fraude fiscal mediante <strong>software de facturación que cumpla el reglamento</strong> y
              garantice la integridad, trazabilidad e inalterabilidad de los registros de facturación. No lo
              homologa la AEAT: lo acredita su fabricante con una declaración responsable (art. 13).
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Diferencia entre VeriFactu y SII</h2>
            <p>
              El <strong>SII</strong> (Suministro Inmediato de Información) ya obliga a grandes empresas
              (facturación &gt; 6 millones €/año) a enviar registros de facturación a la AEAT desde 2017.
            </p>
            <p>
              El <strong>RD 1007/2023</strong> exige al resto de sociedades y autónomos que su programa de
              facturación cumpla el reglamento. Las principales diferencias:
            </p>
            <ul>
              <li><strong>SII</strong>: envío en 4 días naturales, solo grandes empresas, sin código QR.</li>
              <li><strong>RD 1007/2023</strong>: registro de cada factura en el programa, remitido al emitirla solo si se elige la modalidad VERI*FACTU; las facturas llevan código QR verificable.</li>
              <li>Si ya estás en el SII, no necesitas adaptarte a VeriFactu (cumples un estándar equivalente).</li>
            </ul>
          </section>

          <section className={styles.guideSection}>
            <h2>Cronología: del borrador al RD 1007/2023</h2>
            <ul>
              <li><strong>2021</strong>: Ley 11/2021 Antifraude — establece la base legal para prohibir software de doble contabilidad.</li>
              <li><strong>2022</strong>: Borrador del reglamento de los sistemas informáticos de facturación.</li>
              <li><strong>Dic 2023</strong>: Publicación del RD 1007/2023 con los requisitos técnicos.</li>
              <li><strong>Jul 2025</strong>: Fecha original de adaptación, aplazada después por el RD 254/2025 y el RDL 15/2025.</li>
              <li><strong>Ene 2027</strong>: Fecha límite para las sociedades (contribuyentes del Impuesto sobre Sociedades).</li>
              <li><strong>Jul 2027</strong>: Fecha límite para el resto de obligados, autónomos incluidos.</li>
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
              No. VeriFactu exige un programa que cumpla el reglamento, y lo acredita la <strong>declaración
              responsable de su fabricante</strong> (no hay homologación de la AEAT). Excel, Word
              o cualquier herramienta genérica no cumple los requisitos técnicos (registros encadenados con su
              huella, registro de eventos, código QR, y la firma o la remisión a la AEAT).
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
                conocer su plan de adaptación y cuándo tendrá su declaración responsable.
              </li>
              <li>
                <strong>Renueva tu certificado digital</strong>: si caduca antes de tu fecha límite, renuévalo
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

        <RelatedApps />
        <ShareCard appName="checklist-preparar-verifactu" />
        <Footer appName="checklist-preparar-verifactu" />
    </div>
  );
}
