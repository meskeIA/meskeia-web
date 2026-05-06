'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './ChecklistCambioRegimen.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import RegionBadge from '@/components/RegionBadge';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ──────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────
interface ItemChecklist {
  id: string;
  titulo: string;
  info: string;
}

interface ItemOrientador {
  id: string;
  titulo: string;
  descripcion: string;
  recomendacion: 'cambiar' | 'quedarse' | 'consultar';
}

interface FaseChecklist {
  id: string;
  numero: number;
  titulo: string;
  icono: string;
  colorVar: string;
  items: ItemChecklist[];
}

// ──────────────────────────────────────────
// ORIENTADOR — cuándo conviene el cambio
// ──────────────────────────────────────────
const ORIENTADOR: ItemOrientador[] = [
  {
    id: 'gastos-reales',
    titulo: 'Tus gastos reales son superiores al módulo asignado',
    descripcion: 'En estimación directa tributa sobre el beneficio neto real (ingresos − gastos). Si tienes altos gastos deducibles (personal, alquileres, materiales), puede resultar más barato que el módulo fijo.',
    recomendacion: 'cambiar',
  },
  {
    id: 'clientes-empresa',
    titulo: 'La mayoría de tus clientes son empresas o profesionales',
    descripcion: 'Las empresas necesitan facturas con IVA desglosado para deducirlo. En módulos, el IVA se calcula como cuota fija; en estimación directa puedes repercutir y deducir el IVA real. Si tus clientes son empresas, la directa facilita la operativa.',
    recomendacion: 'cambiar',
  },
  {
    id: 'ingresos-bajos',
    titulo: 'Tus ingresos han caído notablemente respecto a años anteriores',
    descripcion: 'El módulo se calcula sobre parámetros fijos (personal, superficie, potencia…), no sobre ingresos reales. Si tu facturación ha bajado mucho, puede que estés tributando de más con los módulos.',
    recomendacion: 'cambiar',
  },
  {
    id: 'carga-administrativa',
    titulo: 'Puedes asumir la gestión contable adicional o tienes gestoría',
    descripcion: 'La estimación directa obliga a llevar libros registro (ventas, gastos, inversiones) y presentar el modelo 130 trimestral de IRPF. Si ya tienes gestoría o software de facturación, la carga extra es menor.',
    recomendacion: 'consultar',
  },
  {
    id: 'exclusion-automatica',
    titulo: 'Tus ingresos o compras superan 250.000 €/año',
    descripcion: 'Si superas los umbrales de exclusión (ingresos >250.000 € o compras >250.000 €), la ley te excluye automáticamente de módulos, sin necesidad de renunciar. Comprueba tus cifras de los dos ejercicios anteriores.',
    recomendacion: 'consultar',
  },
];

// ──────────────────────────────────────────
// FASES DEL CHECKLIST
// ──────────────────────────────────────────
const FASES: FaseChecklist[] = [
  {
    id: 'renuncia',
    numero: 2,
    titulo: 'Gestionar la renuncia',
    icono: '📋',
    colorVar: '--fase-renuncia',
    items: [
      {
        id: 'decidir-anio',
        titulo: 'He decidido el año de inicio del nuevo régimen (siempre comienza el 1 de enero)',
        info: 'El cambio de régimen solo puede hacerse al inicio del año natural (1 de enero). Si renuncias en noviembre/diciembre de 2025, el nuevo régimen empieza el 1 de enero de 2026.',
      },
      {
        id: 'documentacion',
        titulo: 'Tengo preparada la documentación: NIF, epígrafe IAE de mi actividad',
        info: 'Para el modelo 036/037 necesitarás tu NIF y el epígrafe del Impuesto de Actividades Económicas (IAE) de la actividad que quieres sacar de módulos. Consúltalo en el alta en Hacienda o en tu última declaración censal.',
      },
      {
        id: 'sede-electronica',
        titulo: 'Accedo a la Sede Electrónica de la AEAT (plazo: noviembre-diciembre del año anterior)',
        info: 'La renuncia debe presentarse durante el mes de noviembre o diciembre del año anterior al que se aplica el cambio. Accede a sede.agenciatributaria.gob.es con certificado digital, DNIe o Cl@ve PIN.',
      },
      {
        id: 'modelo-036-037',
        titulo: 'Presento el Modelo 036 o 037 marcando la renuncia al régimen de estimación objetiva',
        info: 'En el modelo 036 (o el simplificado 037), localiza el apartado de IRPF y marca la casilla de renuncia al método de estimación objetiva (módulos). Indica la actividad y el año de aplicación del cambio.',
      },
      {
        id: 'justificante',
        titulo: 'Guardo el justificante de presentación sellado por la AEAT',
        info: 'Una vez enviado telemáticamente, descarga y conserva el justificante con el número de registro. Es tu prueba de que la renuncia fue presentada en plazo. Guárdalo al menos 4 años.',
      },
      {
        id: 'informar-gestoria',
        titulo: 'Informo a mi gestoría o asesor fiscal del cambio de régimen',
        info: 'Si tienes gestoría, comunícales el cambio de inmediato para que adapten la gestión contable, preparen los libros registro y te asesoren sobre la primera liquidación en el nuevo régimen.',
      },
    ],
  },
  {
    id: 'adaptacion',
    numero: 3,
    titulo: 'Adaptarse al nuevo régimen',
    icono: '⚙️',
    colorVar: '--fase-adaptacion',
    items: [
      {
        id: 'software-iva',
        titulo: 'Configuro el software de facturación para emitir facturas con IVA desglosado',
        info: 'En estimación directa, las facturas deben mostrar la base imponible, el tipo de IVA aplicado y la cuota de IVA por separado. En módulos el IVA se calculaba como cuota fija; ahora tributas por el IVA real de cada factura.',
      },
      {
        id: 'libros-registro',
        titulo: 'Habilito los libros registro obligatorios: ventas e ingresos, compras y gastos, bienes de inversión',
        info: 'La estimación directa (simplificada o normal) obliga a llevar tres libros registro: (1) Libro de ventas e ingresos, (2) Libro de compras y gastos, (3) Libro registro de bienes de inversión. Pueden llevarse en soporte informático.',
      },
      {
        id: 'modelo-130',
        titulo: 'Preparo el Modelo 130 (pago fraccionado IRPF trimestral, primer pago en abril)',
        info: 'Con estimación directa simplificada, debes presentar el modelo 130 cada trimestre (abril, julio, octubre y enero). Pagas el 20% del rendimiento neto acumulado del año, descontando los pagos anteriores. El primer pago trimestral vence el 20 de abril.',
      },
      {
        id: 'modelo-303',
        titulo: 'Preparo el Modelo 303 de IVA con deducciones reales (en lugar del módulo de IVA fijo)',
        info: 'Ahora declaras el IVA real: el IVA repercutido en tus facturas menos el IVA soportado en tus gastos. En módulos pagabas una cuota fija trimestral de IVA sin deducir nada. Con la directa puedes deducir el IVA de todos tus gastos de actividad.',
      },
      {
        id: 'retenciones',
        titulo: 'Reviso si debo aplicar retención IRPF en mis facturas (7% primer año o 15% tipo general)',
        info: 'Si aplicas retención IRPF en tus facturas: el tipo general es el 15%. Si inicias actividad o no la has ejercido en los 2 años anteriores, puedes aplicar el 7% reducido durante el año de inicio y los 2 siguientes. Comprueba con tu asesor si corresponde aplicarlo.',
      },
      {
        id: 'facturas-recibidas',
        titulo: 'Actualizo el archivo de facturas recibidas (debo conservarlas para justificar gastos)',
        info: 'Cada gasto deducible debe estar respaldado por una factura completa (no ticket). Establece un sistema de archivo ordenado (físico o digital) para conservar todas las facturas de gastos al menos 4 años. Sin factura, no hay deducción.',
      },
      {
        id: 'revisar-primeros-pagos',
        titulo: 'Reviso con mi asesor los primeros pagos fraccionados para evitar sorpresas de tesorería',
        info: 'El primer año en estimación directa puede generar pagos fraccionados más altos que las cuotas de módulos, especialmente si la actividad va bien. Planifica la tesorería con antelación para no tener tensiones de liquidez en los meses de pago trimestral.',
      },
    ],
  },
];

// Items totales checkables (solo fases 2 y 3)
const TOTAL_ITEMS = FASES.reduce((acc, f) => acc + f.items.length, 0);
const STORAGE_KEY = 'meskeia-checklist-cambio-regimen';

// ──────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────
export default function ChecklistCambioRegimenPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [collapsedFases, setCollapsedFases] = useState<Record<string, boolean>>({});
  const [orientadorExpanded, setOrientadorExpanded] = useState<Record<string, boolean>>({});

  // Cargar progreso de sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setChecked(JSON.parse(saved) as Record<string, boolean>);
      }
    } catch {
      // sessionStorage no disponible
    }
  }, []);

  // Guardar progreso en sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      // sessionStorage no disponible
    }
  }, [checked]);

  const toggleCheck = useCallback((id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleFase = useCallback((id: string) => {
    setCollapsedFases(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleOrientador = useCallback((id: string) => {
    setOrientadorExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const resetChecklist = useCallback(() => {
    setChecked({});
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // sessionStorage no disponible
    }
  }, []);

  const completados = Object.values(checked).filter(Boolean).length;
  const porcentaje = Math.round((completados / TOTAL_ITEMS) * 100);

  const getFaseEstado = (fase: FaseChecklist): { label: string; clase: string } => {
    const total = fase.items.length;
    const hechos = fase.items.filter(item => checked[item.id]).length;
    if (hechos === total) return { label: '✅ Completada', clase: styles.badgeCompleta };
    if (hechos > 0) return { label: '🔄 En progreso', clase: styles.badgeProgreso };
    return { label: '⬜ Sin empezar', clase: styles.badgePendiente };
  };

  const getRecomendacionClass = (rec: ItemOrientador['recomendacion']): string => {
    if (rec === 'cambiar') return styles.recCambiar;
    if (rec === 'quedarse') return styles.recQuedarse;
    return styles.recConsultar;
  };

  const getRecomendacionLabel = (rec: ItemOrientador['recomendacion']): string => {
    if (rec === 'cambiar') return '✅ Indica cambiar';
    if (rec === 'quedarse') return '⛔ Indica quedarse';
    return '⚠️ Consultar';
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
          <h1 className={styles.title}>📋 Cambio de Régimen Fiscal del Autónomo</h1>
          <p className={styles.subtitle}>
            De estimación objetiva (módulos) a estimación directa simplificada — Guía y checklist paso a paso
          </p>
        </header>

        <RegionBadge variant="es-only" />

        <LegalNotice />

        <DisclaimerCard variant="financial" severity="high" collapsible={false} />

        {/* ── FASE 1: Orientador ── */}
        <section className={styles.orientadorSection}>
          <div className={styles.faseHeader}>
            <div className={styles.faseTitulo}>
              <span className={styles.faseNumero} aria-hidden="true">1</span>
              <span className={styles.faseIcono} aria-hidden="true">🔍</span>
              <h2 className={styles.faseTituloText}>¿Conviene el cambio?</h2>
            </div>
            <span className={styles.faseSubtitulo}>Criterios orientadores — no checkable</span>
          </div>

          <div className={styles.orientadorAviso} role="note">
            <span aria-hidden="true">💡</span>
            <p>
              Antes de renunciar, evalúa si el cambio es beneficioso para tu situación.
              Estos criterios son orientativos: la decisión final siempre debe tomarse con tu asesor fiscal.
            </p>
          </div>

          <ul className={styles.orientadorList}>
            {ORIENTADOR.map(item => {
              const isExpanded = orientadorExpanded[item.id] ?? false;
              return (
                <li key={item.id} className={styles.orientadorItem}>
                  <div className={styles.orientadorRow}>
                    <span className={`${styles.recBadge} ${getRecomendacionClass(item.recomendacion)}`}>
                      {getRecomendacionLabel(item.recomendacion)}
                    </span>
                    <p className={styles.orientadorTitulo}>{item.titulo}</p>
                    <button
                      className={styles.infoToggle}
                      onClick={() => toggleOrientador(item.id)}
                      aria-expanded={isExpanded}
                      aria-label={`Más información: ${item.titulo}`}
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className={styles.infoPanel}>
                      <p>{item.descripcion}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Barra de progreso ── */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              Progreso pasos checkables: {completados} de {TOTAL_ITEMS} completados
            </span>
            <span className={styles.progressPercent}>{porcentaje}%</span>
          </div>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={styles.progressFill} style={{ width: `${porcentaje}%` }} />
          </div>
          {porcentaje === 100 && (
            <div className={styles.completadoMsg} role="alert" aria-live="polite">
              🎉 ¡Checklist completado! Ya estás listo para operar en el nuevo régimen.
            </div>
          )}
        </div>

        {/* ── Fases checkables (2 y 3) ── */}
        <div className={styles.fases}>
          {FASES.map(fase => {
            const estado = getFaseEstado(fase);
            const isCollapsed = collapsedFases[fase.id] ?? false;

            return (
              <section key={fase.id} className={`${styles.faseCard} ${styles[`fase-${fase.id}`]}`}>
                <button
                  className={styles.faseCardHeader}
                  onClick={() => toggleFase(fase.id)}
                  aria-expanded={!isCollapsed}
                  aria-label={`Fase ${fase.numero}: ${fase.titulo} — ${estado.label}`}
                >
                  <div className={styles.faseTitulo}>
                    <span className={styles.faseNumero} aria-hidden="true">{fase.numero}</span>
                    <span className={styles.faseIcono} aria-hidden="true">{fase.icono}</span>
                    <h2 className={styles.faseTituloText}>{fase.titulo}</h2>
                  </div>
                  <div className={styles.faseMeta}>
                    <span className={`${styles.badge} ${estado.clase}`}>{estado.label}</span>
                    <span
                      className={`${styles.chevron} ${isCollapsed ? styles.chevronCollapsed : ''}`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <ul className={styles.itemList}>
                    {fase.items.map(item => {
                      const isChecked = checked[item.id] ?? false;
                      const isExpanded = expandedItems[item.id] ?? false;

                      return (
                        <li
                          key={item.id}
                          className={`${styles.item} ${isChecked ? styles.itemChecked : ''}`}
                        >
                          <div className={styles.itemRow}>
                            <label className={styles.checkLabel}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCheck(item.id)}
                                className={styles.checkboxHidden}
                              />
                              <span
                                className={`${styles.checkboxCustom} ${isChecked ? styles.checkboxChecked : ''}`}
                                aria-hidden="true"
                              >
                                {isChecked && '✓'}
                              </span>
                              <span
                                className={`${styles.itemText} ${isChecked ? styles.itemTextChecked : ''}`}
                              >
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

        {/* ── Sección educativa v2.0 ── */}
        <EducationalSection
          title="📚 Módulos vs. Estimación Directa — Guía Completa"
          subtitle="Todo lo que necesitas saber antes de cambiar de régimen fiscal"
        >
          {/* Aviso de advertencia — warningBox */}
          <div className={styles.warningBox} role="alert">
            <span aria-hidden="true">⚠️</span>
            <p>
              <strong>Importante:</strong> El cambio de régimen fiscal es irreversible durante al menos 3 años.
              Una vez presentada la renuncia, no podrás volver a módulos hasta haber permanecido un mínimo
              de 3 años en estimación directa. Consulta siempre con un asesor fiscal antes de presentar la renuncia.
            </p>
          </div>

          {/* Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>Comparativa: módulos vs. estimación directa</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Módulos (Est. Objetiva)</th>
                    <th>Est. Directa Simplificada</th>
                    <th>Est. Directa Normal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base de tributación</td>
                    <td>Parámetros fijos (módulos)</td>
                    <td>Rendimiento neto real</td>
                    <td>Rendimiento neto real</td>
                  </tr>
                  <tr>
                    <td>Límite de facturación</td>
                    <td>250.000 €/año</td>
                    <td>600.000 €/año</td>
                    <td>Sin límite</td>
                  </tr>
                  <tr>
                    <td>IVA trimestral</td>
                    <td>Cuota fija por módulo</td>
                    <td>IVA real deducido al 100%</td>
                    <td>IVA real deducido al 100%</td>
                  </tr>
                  <tr>
                    <td>Libros registro</td>
                    <td>Solo ventas e ingresos</td>
                    <td>Ventas, gastos, inversiones</td>
                    <td>Contabilidad completa</td>
                  </tr>
                  <tr>
                    <td>Pago fraccionado IRPF</td>
                    <td>No (o cuota reducida)</td>
                    <td>Modelo 130 (20% del neto)</td>
                    <td>Modelo 130 (20% del neto)</td>
                  </tr>
                  <tr>
                    <td>Carga administrativa</td>
                    <td>Baja</td>
                    <td>Media</td>
                    <td>Alta</td>
                  </tr>
                  <tr>
                    <td>Ideal para</td>
                    <td>Pocos gastos reales, clientes particulares</td>
                    <td>Gastos altos, clientes empresa, facturación creciente</td>
                    <td>Facturación &gt;600.000 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Exclusión automática */}
          <section className={styles.guideSection}>
            <h2>¿Cuándo te excluyen de módulos automáticamente?</h2>
            <p>
              No siempre es necesario renunciar voluntariamente. La ley excluye automáticamente del régimen
              de módulos cuando se superen los siguientes umbrales:
            </p>
            <ul>
              <li>
                <strong>Volumen de ingresos &gt; 250.000 €/año</strong> por actividades empresariales
                (agrícolas y ganaderas tienen el mismo límite desde 2023).
              </li>
              <li>
                <strong>Volumen de compras de bienes y servicios &gt; 250.000 €/año</strong>, excluyendo
                inmovilizado.
              </li>
              <li>
                <strong>Más del 70% de los ingresos</strong> sujetos a retención (por operar principalmente
                con empresas que te retienen el IRPF).
              </li>
              <li>
                Actividades económicas con <strong>clientes mayoritariamente empresas</strong> (ciertas
                actividades están excluidas de módulos por Orden ministerial).
              </li>
            </ul>
            <p>
              Si te han excluido automáticamente, no necesitas presentar el modelo 036/037.
              La exclusión surte efecto el año siguiente al que superas el umbral.
            </p>
          </section>

          {/* Proceso completo */}
          <section className={styles.guideSection}>
            <h2>Proceso completo paso a paso</h2>
            <ol className={styles.stepList}>
              <li>
                <strong>Analiza tu situación fiscal actual</strong> — compara el rendimiento que pagas
                con módulos frente al rendimiento neto real que tendrías en estimación directa. Tu gestoría
                puede hacer este cálculo en menos de una hora.
              </li>
              <li>
                <strong>Decide antes del 31 de diciembre</strong> — la renuncia debe presentarse en
                noviembre o diciembre del año anterior. No hay segunda oportunidad hasta el año siguiente.
              </li>
              <li>
                <strong>Presenta el Modelo 036 o 037</strong> — accede a la sede electrónica de la AEAT,
                localiza el apartado de IRPF y marca la casilla de renuncia al método de estimación
                objetiva. Indica el epígrafe IAE de tu actividad.
              </li>
              <li>
                <strong>Guarda el justificante</strong> — el sistema de la AEAT te proporcionará un número
                de registro. Descárgalo y consérvalo. Es tu prueba de que renunciaste en plazo.
              </li>
              <li>
                <strong>Adapta tu sistema de facturación</strong> — desde el 1 de enero, emite facturas
                con IVA desglosado, habilita los libros registro y prepara el primer modelo 130 de abril.
              </li>
              <li>
                <strong>Planifica los pagos fraccionados</strong> — el modelo 130 se paga en abril, julio,
                octubre y enero. El 20% del rendimiento neto acumulado puede representar un importe notable
                si la actividad va bien.
              </li>
            </ol>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>

            <h3>¿Puedo volver a módulos después de renunciar?</h3>
            <p>
              La renuncia al régimen de módulos es <strong>vinculante durante un mínimo de 3 años</strong>.
              Transcurrido ese período, podrás volver a módulos si cumples los requisitos, presentando la
              revocación de la renuncia en el plazo habitual (noviembre-diciembre). Sin embargo, si durante
              esos 3 años superas los umbrales de exclusión, la exclusión es obligatoria y definitiva
              hasta que regularices las cifras.
            </p>

            <h3>¿Qué pasa si no renuncio a tiempo (se me pasa el plazo)?</h3>
            <p>
              Si no presentas la renuncia en noviembre-diciembre, deberás esperar al año siguiente para
              cambiar de régimen. No existe un plazo extraordinario ni una excepción por olvido.
              La única alternativa es que la ley te excluya automáticamente por superar los umbrales.
            </p>

            <h3>¿Hay penalizaciones por cambiar de régimen?</h3>
            <p>
              No existen penalizaciones por renunciar voluntariamente al régimen de módulos.
              El cambio es un derecho del contribuyente. Lo que sí implica compromisos es el período
              mínimo de 3 años en el nuevo régimen y las obligaciones contables adicionales.
            </p>

            <h3>¿Estimación directa simplificada o normal?</h3>
            <p>
              La <strong>simplificada</strong> se aplica automáticamente si tu facturación no supera
              600.000 €/año y no has estado en estimación directa normal en los 3 años anteriores.
              Las principales diferencias: la simplificada permite amortizar el inmovilizado según
              tablas simplificadas, y las provisiones deducibles son un porcentaje fijo (5%) del
              rendimiento neto; la normal exige contabilidad completa ajustada al Código de Comercio.
              Para la mayoría de autónomos, la simplificada es la opción por defecto al salir de módulos.
            </p>

            <h3>¿Tengo que presentar algo más aparte del 036/037?</h3>
            <p>
              La renuncia se formaliza solo con el modelo 036 o 037. Sin embargo, a partir del primer
              trimestre del nuevo régimen deberás presentar el modelo 130 (IRPF fraccionado) y el
              modelo 303 (IVA trimestral) con las deducciones reales. Si antes presentabas el modelo
              131 (pago fraccionado en módulos), ya no corresponde presentarlo.
            </p>
          </section>

          {/* Plazos clave */}
          <section className={styles.guideSection}>
            <h2>Plazos y fechas clave</h2>
            <div className={styles.plazosGrid}>
              <div className={styles.plazoCard}>
                <span className={styles.plazoIcono} aria-hidden="true">📅</span>
                <strong>Noviembre y diciembre</strong>
                <p>Plazo para presentar la renuncia al régimen de módulos (modelo 036/037). Para cambiar en 2026, renunciar en nov.-dic. 2025.</p>
              </div>
              <div className={styles.plazoCard}>
                <span className={styles.plazoIcono} aria-hidden="true">🗓️</span>
                <strong>1 de enero</strong>
                <p>Fecha de entrada en vigor del nuevo régimen. El cambio siempre es al inicio del año natural.</p>
              </div>
              <div className={styles.plazoCard}>
                <span className={styles.plazoIcono} aria-hidden="true">📊</span>
                <strong>20 de abril (primer año)</strong>
                <p>Primer plazo del modelo 130 (pago fraccionado IRPF). Tributa el 20% del rendimiento neto del primer trimestre.</p>
              </div>
              <div className={styles.plazoCard}>
                <span className={styles.plazoIcono} aria-hidden="true">🔄</span>
                <strong>Mínimo 3 años</strong>
                <p>Período mínimo obligatorio en estimación directa antes de poder volver a solicitar el régimen de módulos.</p>
              </div>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('checklist-cambio-regimen-autonomo')} />
        <ShareCard appName="checklist-cambio-regimen-autonomo" />
        <Footer appName="checklist-cambio-regimen-autonomo" />
      </div>
    </>
  );
}
