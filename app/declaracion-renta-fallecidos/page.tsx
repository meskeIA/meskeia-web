'use client';

import { useState } from 'react';
import styles from './DeclaracionRentaFallecidos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  ShareCard,
  LegalNotice,
  DisclaimerCard, RegionBadge
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Paso = 1 | 2 | 3 | 4 | 5;

interface DatosVerificacion {
  rendimientosTrabajo: 'menos-22000' | '22000-mas' | 'multi-pagador-menos-15876' | 'multi-pagador-mas-15876';
  otrasRentas: boolean;
  capitalMobiliario: 'menos-1600' | 'mas-1600';
}

interface DatosAcceso {
  tieneCasilla505: boolean;
  tieneIBAN: boolean;
}

interface DatosSituacion {
  fechaFallecimiento: 'dia-31-dic' | 'otro-dia';
  tipoDeclaracion: 'a-devolver' | 'a-pagar' | 'no-se';
  importeDevolucion: 'hasta-2000' | 'mas-2000';
  variosHerederos: boolean;
  fallecidoAutonomo: boolean;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const LIMITE_TRABAJO_GENERAL = 22000;
const LIMITE_TRABAJO_MULTI = 15876;
const LIMITE_CAPITAL_MOBILIARIO = 1600;
const UMBRAL_DEVOLUCION = 2000;

const PASOS_NOMBRES: Record<Paso, string> = {
  1: 'Obligación de declarar',
  2: 'Forma de tributación',
  3: 'Acceso al borrador',
  4: 'Documentación',
  5: 'Resultado y trámites',
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DeclaracionRentaFallecidosPage() {
  const [pasoActual, setPasoActual] = useState<Paso>(1);
  const [verificacion, setVerificacion] = useState<DatosVerificacion>({
    rendimientosTrabajo: 'menos-22000',
    otrasRentas: false,
    capitalMobiliario: 'menos-1600',
  });
  const [acceso, setAcceso] = useState<DatosAcceso>({
    tieneCasilla505: false,
    tieneIBAN: false,
  });
  const [situacion, setSituacion] = useState<DatosSituacion>({
    fechaFallecimiento: 'otro-dia',
    tipoDeclaracion: 'no-se',
    importeDevolucion: 'hasta-2000',
    variosHerederos: false,
    fallecidoAutonomo: false,
  });

  // ─── Lógica de obligación de declarar ───────────────────────────────────────

  function evaluarObligacion(): { obligado: boolean; motivo: string } {
    // Rendimientos del trabajo >= 22.000€ (un pagador) o >= 15.876€ (multi pagador)
    if (verificacion.rendimientosTrabajo === '22000-mas') {
      return {
        obligado: true,
        motivo: `Los rendimientos del trabajo superan los ${formatCurrency(LIMITE_TRABAJO_GENERAL)} anuales con un solo pagador.`,
      };
    }
    if (verificacion.rendimientosTrabajo === 'multi-pagador-mas-15876') {
      return {
        obligado: true,
        motivo: `Los rendimientos del trabajo con varios pagadores superan los ${formatCurrency(LIMITE_TRABAJO_MULTI)}.`,
      };
    }

    // Capital mobiliario > 1.600€
    if (verificacion.capitalMobiliario === 'mas-1600') {
      return {
        obligado: true,
        motivo: `Los rendimientos del capital mobiliario superan los ${formatCurrency(LIMITE_CAPITAL_MOBILIARIO)} anuales.`,
      };
    }

    // Otras rentas (inmuebles, ganancias patrimoniales, etc.)
    if (verificacion.otrasRentas) {
      return {
        obligado: true,
        motivo: 'Existen otras rentas sujetas a IRPF (inmuebles, ganancias patrimoniales, actividades económicas, etc.).',
      };
    }

    return {
      obligado: false,
      motivo: 'Según los datos indicados, no existiría obligación de presentar la declaración. No obstante, puede interesar presentarla si resulta a devolver.',
    };
  }

  // ─── Determinar vía de acceso al borrador ──────────────────────────────────

  function determinarViaAcceso(): { via: string; instrucciones: string } {
    if (acceso.tieneCasilla505) {
      return {
        via: 'Número de referencia con casilla 505',
        instrucciones: 'Accede al servicio REN0 de la AEAT con el NIF del fallecido y la casilla 505 de su declaración del ejercicio anterior. Se generará un número de referencia para acceder al borrador.',
      };
    }
    if (acceso.tieneIBAN) {
      return {
        via: 'Número de referencia con IBAN',
        instrucciones: 'Accede al servicio REN0 de la AEAT con el NIF del fallecido y el IBAN de una cuenta bancaria a nombre del fallecido. Se generará el número de referencia.',
      };
    }
    return {
      via: 'Presencial en oficinas de la AEAT o Apoderamiento de sucesores',
      instrucciones: 'Solicita cita previa a nombre del fallecido en la AEAT. Deberás acreditar tu condición de heredero con testamento, escritura de adjudicación o acta notarial, además de tu DNI. Como última opción, puedes darte de alta en el Registro de Sucesiones de la AEAT (procedimiento ZZ23).',
    };
  }

  // ─── Generar checklist de documentación ────────────────────────────────────

  function generarDocumentacion(): string[] {
    const docs: string[] = [
      'Certificado de defunción',
      'Libro de Familia completo o Registro Electrónico de situación familiar',
      'Certificado del Registro de Últimas Voluntades',
      'Testamento o Acta Notarial de Declaración de Herederos',
    ];

    if (situacion.tipoDeclaracion === 'a-devolver' || situacion.tipoDeclaracion === 'no-se') {
      docs.push('Certificado bancario de titularidad de la cuenta del heredero autorizado para el cobro');

      if (situacion.variosHerederos) {
        if (situacion.importeDevolucion === 'hasta-2000') {
          docs.push('Autorización escrita y firmada de todos los herederos + fotocopia DNI de cada uno');
        } else {
          docs.push('Poder Notarial autorizando al heredero que cobrará la devolución');
          docs.push('Justificante de haber declarado en el Impuesto sobre Sucesiones y Donaciones el importe de la devolución');
        }
      }

      if (situacion.importeDevolucion === 'mas-2000' && !situacion.variosHerederos) {
        docs.push('Justificante de haber declarado en el Impuesto sobre Sucesiones y Donaciones el importe de la devolución');
      }
    }

    if (situacion.fallecidoAutonomo) {
      docs.push('Modelo 036 (declaración censal de baja) — plazo: 6 meses desde el fallecimiento');
    }

    return docs;
  }

  // ─── Navegación ─────────────────────────────────────────────────────────────

  const avanzar = () => setPasoActual(p => Math.min(p + 1, 5) as Paso);
  const retroceder = () => setPasoActual(p => Math.max(p - 1, 1) as Paso);

  const resultado = evaluarObligacion();
  const viaAcceso = determinarViaAcceso();

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero Section */}
        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">📋</span> Declaración de la Renta de Persona Fallecida</h1>
          <p className={styles.subtitle}>Guía interactiva paso a paso para herederos — Campaña IRPF 2025</p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        {/* Disclaimer fiscal CRÍTICO */}
        <DisclaimerCard
          variant="financial"
          severity="critical"
          context="declaracion-renta-fallecidos"
        />

        {/* Barra de progreso */}
        <div className={styles.progressBar}>
          {([1, 2, 3, 4, 5] as Paso[]).map(paso => (
            <button
              key={paso}
              type="button"
              className={`${styles.progressStep} ${paso === pasoActual ? styles.progressStepActive : ''} ${paso < pasoActual ? styles.progressStepDone : ''}`}
              onClick={() => setPasoActual(paso)}
              aria-label={`Paso ${paso}: ${PASOS_NOMBRES[paso]}`}
              aria-current={paso === pasoActual ? 'step' : undefined}
            >
              <span className={styles.progressNumber}>{paso}</span>
              <span className={styles.progressLabel}>{PASOS_NOMBRES[paso]}</span>
            </button>
          ))}
        </div>

        {/* ═══ PASO 1: Obligación de declarar ═══ */}
        {pasoActual === 1 && (
          <section className={styles.wizardPanel} aria-label="Paso 1: Obligación de declarar">
            <h2 className={styles.panelTitle}><span aria-hidden="true">1️⃣</span> ¿Está obligado a declarar el fallecido?</h2>
            <p className={styles.panelDescription}>
              Los importes que determinan la obligación de declarar se aplican <strong>íntegros</strong>, sin importar
              cuántos días del año vivió el contribuyente.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rendimientos del trabajo del fallecido (hasta la fecha de fallecimiento)</label>
              <select
                className={styles.select}
                value={verificacion.rendimientosTrabajo}
                onChange={e => setVerificacion({ ...verificacion, rendimientosTrabajo: e.target.value as DatosVerificacion['rendimientosTrabajo'] })}
              >
                <option value="menos-22000">Un pagador y menos de {formatCurrency(LIMITE_TRABAJO_GENERAL)}</option>
                <option value="22000-mas">Un pagador y {formatCurrency(LIMITE_TRABAJO_GENERAL)} o más</option>
                <option value="multi-pagador-menos-15876">Varios pagadores y menos de {formatCurrency(LIMITE_TRABAJO_MULTI)}</option>
                <option value="multi-pagador-mas-15876">Varios pagadores y {formatCurrency(LIMITE_TRABAJO_MULTI)} o más</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rendimientos del capital mobiliario (intereses, dividendos...)</label>
              <select
                className={styles.select}
                value={verificacion.capitalMobiliario}
                onChange={e => setVerificacion({ ...verificacion, capitalMobiliario: e.target.value as DatosVerificacion['capitalMobiliario'] })}
              >
                <option value="menos-1600">Menos de {formatCurrency(LIMITE_CAPITAL_MOBILIARIO)}</option>
                <option value="mas-1600">{formatCurrency(LIMITE_CAPITAL_MOBILIARIO)} o más</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={verificacion.otrasRentas}
                  onChange={e => setVerificacion({ ...verificacion, otrasRentas: e.target.checked })}
                />
                <span>Tenía otras rentas: inmuebles alquilados, ganancias patrimoniales, actividades económicas...</span>
              </label>
            </div>

            {/* Resultado */}
            <div className={`${styles.resultBox} ${resultado.obligado ? styles.resultObligado : styles.resultNoObligado}`} role="alert" aria-live="polite">
              <strong>{resultado.obligado ? <><span aria-hidden="true">✅</span> Sí, probablemente esté obligado a declarar</> : <><span aria-hidden="true">🔵</span> Probablemente no esté obligado a declarar</>}</strong>
              <p>{resultado.motivo}</p>
            </div>

            <div className={styles.infoBox}>
              <strong><span aria-hidden="true">💡</span> Importante:</strong> Aunque no haya obligación, puede interesar presentar la declaración
              si resulta a devolver (por retenciones practicadas en nómina o pensión).
            </div>

            <div className={styles.navButtons}>
              <div />
              <button type="button" className={styles.btnPrimary} onClick={avanzar}>Siguiente <span aria-hidden="true">→</span></button>
            </div>
          </section>
        )}

        {/* ═══ PASO 2: Forma de tributación ═══ */}
        {pasoActual === 2 && (
          <section className={styles.wizardPanel} aria-label="Paso 2: Forma de tributación">
            <h2 className={styles.panelTitle}><span aria-hidden="true">2️⃣</span> ¿Individual o conjunta?</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>¿Cuándo se produjo el fallecimiento?</label>
              <select
                className={styles.select}
                value={situacion.fechaFallecimiento}
                onChange={e => setSituacion({ ...situacion, fechaFallecimiento: e.target.value as DatosSituacion['fechaFallecimiento'] })}
              >
                <option value="otro-dia">En cualquier día del año (antes del 31 de diciembre)</option>
                <option value="dia-31-dic">El 31 de diciembre</option>
              </select>
            </div>

            <div className={`${styles.resultBox} ${styles.resultInfo}`} role="alert" aria-live="polite">
              {situacion.fechaFallecimiento === 'otro-dia' ? (
                <>
                  <strong><span aria-hidden="true">📌</span> Tributación individual obligatoria</strong>
                  <p>La declaración del fallecido se presenta <strong>siempre en modalidad individual</strong>.</p>
                  <p>Los miembros supervivientes de la unidad familiar pueden optar entre tributar individual o conjuntamente entre ellos, pero <strong>excluyendo las rentas del fallecido</strong>.</p>
                </>
              ) : (
                <>
                  <strong><span aria-hidden="true">📌</span> Excepción: posible declaración conjunta</strong>
                  <p>Al fallecer el 31 de diciembre (último día del periodo impositivo), <strong>todos los miembros de la unidad familiar, incluido el fallecido, pueden presentar declaración conjunta</strong> si así lo desean.</p>
                </>
              )}
            </div>

            <div className={styles.rulesGrid}>
              <div className={styles.ruleCard}>
                <h3><span aria-hidden="true">📊</span> Mínimos personales y familiares</h3>
                <p>Se aplican <strong>íntegros</strong> (5.550 € de mínimo del contribuyente), sin prorrateo por días. Los incrementos por edad (65 y 75 años) también se aplican completos.</p>
              </div>
              <div className={styles.ruleCard}>
                <h3><span aria-hidden="true">📅</span> Periodo impositivo</h3>
                <p>Va del 1 de enero a la <strong>fecha de fallecimiento</strong> (art. 13 Ley 35/2006). Se devenga el impuesto en esa fecha.</p>
              </div>
              <div className={styles.ruleCard}>
                <h3><span aria-hidden="true">💰</span> Rentas a incluir</h3>
                <p>Solo las devengadas <strong>hasta la fecha del fallecimiento</strong>. Las rentas posteriores corresponden a los herederos en sus propias declaraciones.</p>
              </div>
              <div className={styles.ruleCard}>
                <h3><span aria-hidden="true">⚠️</span> Rentas pendientes de imputación</h3>
                <p>Todas las rentas aplazadas (operaciones a plazos, etc.) se integran en la <strong>última declaración del fallecido</strong> (art. 14.4 Ley 35/2006).</p>
              </div>
            </div>

            <div className={styles.infoBox}>
              <strong><span aria-hidden="true">🏠</span> Excepción — rentas inmobiliarias imputadas:</strong> Son la <strong>única renta que se prorratea</strong> proporcionalmente
              al número de días del periodo impositivo.
            </div>

            <div className={styles.navButtons}>
              <button type="button" className={styles.btnSecondary} onClick={retroceder}><span aria-hidden="true">←</span> Anterior</button>
              <button type="button" className={styles.btnPrimary} onClick={avanzar}>Siguiente <span aria-hidden="true">→</span></button>
            </div>
          </section>
        )}

        {/* ═══ PASO 3: Acceso al borrador ═══ */}
        {pasoActual === 3 && (
          <section className={styles.wizardPanel} aria-label="Paso 3: Acceso al borrador">
            <h2 className={styles.panelTitle}><span aria-hidden="true">3️⃣</span> ¿Cómo acceder al borrador?</h2>

            <div className={styles.warningBox}>
              <strong><span aria-hidden="true">🔒</span> Importante:</strong> Tras el fallecimiento, el certificado digital y la Cl@ve PIN del fallecido quedan <strong>inhabilitados</strong>.
              Solo se puede acceder mediante número de referencia.
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={acceso.tieneCasilla505}
                  onChange={e => setAcceso({ ...acceso, tieneCasilla505: e.target.checked })}
                />
                <span>Dispongo de la declaración de Renta del ejercicio anterior del fallecido (casilla 505)</span>
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={acceso.tieneIBAN}
                  onChange={e => setAcceso({ ...acceso, tieneIBAN: e.target.checked })}
                />
                <span>Conozco el IBAN de una cuenta bancaria a nombre del fallecido</span>
              </label>
            </div>

            <div className={`${styles.resultBox} ${styles.resultInfo}`} role="alert" aria-live="polite">
              <strong><span aria-hidden="true">🔑</span> Tu vía de acceso: {viaAcceso.via}</strong>
              <p>{viaAcceso.instrucciones}</p>
            </div>

            <div className={styles.rulesGrid}>
              <div className={styles.ruleCard}>
                <h3><span aria-hidden="true">📋</span> Plazo de presentación</h3>
                <p>El <strong>mismo que la campaña normal</strong> (abril-junio del año siguiente al fallecimiento). No hay extensión de plazo para herederos.</p>
              </div>
              <div className={styles.ruleCard}>
                <h3><span aria-hidden="true">🏢</span> Cita presencial</h3>
                <p>Si necesitas ir a la oficina de la AEAT, solicita <strong>cita previa a nombre del fallecido</strong>. Lleva testamento o acta notarial y tu DNI.</p>
              </div>
            </div>

            <div className={styles.navButtons}>
              <button type="button" className={styles.btnSecondary} onClick={retroceder}><span aria-hidden="true">←</span> Anterior</button>
              <button type="button" className={styles.btnPrimary} onClick={avanzar}>Siguiente <span aria-hidden="true">→</span></button>
            </div>
          </section>
        )}

        {/* ═══ PASO 4: Documentación necesaria ═══ */}
        {pasoActual === 4 && (
          <section className={styles.wizardPanel} aria-label="Paso 4: Documentación necesaria">
            <h2 className={styles.panelTitle}><span aria-hidden="true">4️⃣</span> Documentación necesaria</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>¿La declaración sale a devolver o a pagar?</label>
              <select
                className={styles.select}
                value={situacion.tipoDeclaracion}
                onChange={e => setSituacion({ ...situacion, tipoDeclaracion: e.target.value as DatosSituacion['tipoDeclaracion'] })}
              >
                <option value="no-se">No lo sé todavía</option>
                <option value="a-devolver">Sale a devolver</option>
                <option value="a-pagar">Sale a pagar</option>
              </select>
            </div>

            {(situacion.tipoDeclaracion === 'a-devolver' || situacion.tipoDeclaracion === 'no-se') && (
              <div className={styles.formGroup}>
                <label className={styles.label}>¿El importe de la devolución supera los {formatCurrency(UMBRAL_DEVOLUCION)}?</label>
                <select
                  className={styles.select}
                  value={situacion.importeDevolucion}
                  onChange={e => setSituacion({ ...situacion, importeDevolucion: e.target.value as DatosSituacion['importeDevolucion'] })}
                >
                  <option value="hasta-2000">Hasta {formatCurrency(UMBRAL_DEVOLUCION)} (inclusive)</option>
                  <option value="mas-2000">Más de {formatCurrency(UMBRAL_DEVOLUCION)}</option>
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={situacion.variosHerederos}
                  onChange={e => setSituacion({ ...situacion, variosHerederos: e.target.checked })}
                />
                <span>Hay varios herederos (y quiere cobrar solo uno)</span>
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={situacion.fallecidoAutonomo}
                  onChange={e => setSituacion({ ...situacion, fallecidoAutonomo: e.target.checked })}
                />
                <span>El fallecido era autónomo o empresario/profesional</span>
              </label>
            </div>

            {/* Checklist de documentación */}
            <div className={styles.checklistBox}>
              <h3><span aria-hidden="true">📄</span> Documentación que necesitarás:</h3>
              <ul className={styles.checklist}>
                {generarDocumentacion().map((doc, i) => (
                  <li key={i} className={styles.checklistItem}>
                    <span className={styles.checkIcon} aria-hidden="true">☐</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {situacion.tipoDeclaracion === 'a-devolver' && (
              <div className={styles.infoBox}>
                <strong><span aria-hidden="true">📝</span> Modelo H-100:</strong> Puedes utilizar la &quot;Solicitud de pago de devolución a herederos&quot;
                (Modelo H-100, procedimiento G612). Es voluntario pero facilita el trámite. Se puede presentar electrónicamente
                o en oficinas de la AEAT.
              </div>
            )}

            <div className={styles.navButtons}>
              <button type="button" className={styles.btnSecondary} onClick={retroceder}><span aria-hidden="true">←</span> Anterior</button>
              <button type="button" className={styles.btnPrimary} onClick={avanzar}>Siguiente <span aria-hidden="true">→</span></button>
            </div>
          </section>
        )}

        {/* ═══ PASO 5: Resultado y trámites adicionales ═══ */}
        {pasoActual === 5 && (
          <section className={styles.wizardPanel} aria-label="Paso 5: Resultado y trámites adicionales">
            <h2 className={styles.panelTitle}><span aria-hidden="true">5️⃣</span> Resultado y trámites adicionales</h2>

            {/* Si sale a pagar */}
            <div className={styles.resultSection}>
              <h3><span aria-hidden="true">💶</span> Si la declaración sale a pagar</h3>
              <ul className={styles.infoList}>
                <li>Los herederos pagan <strong>en proporción a su cuota hereditaria</strong> (art. 39.1 LGT).</li>
                <li>Se puede fraccionar en <strong>dos plazos sin intereses</strong>: 60% al presentar + 40% en noviembre.</li>
                <li>Las <strong>sanciones del fallecido NO se transmiten</strong> a los herederos.</li>
                <li>Si el fallecido tenía rentas pendientes de imputación, los herederos pueden solicitar <strong>fraccionamiento hasta 4 años</strong> (art. 63 Reglamento IRPF, requiere aval bancario).</li>
              </ul>
            </div>

            {/* Si sale a devolver */}
            <div className={styles.resultSection}>
              <h3><span aria-hidden="true">💰</span> Si la declaración sale a devolver</h3>
              <ul className={styles.infoList}>
                <li>Presentar el <strong>Modelo H-100</strong> (Solicitud de pago de devolución a herederos).</li>
                <li>Se puede presentar por <strong>Registro Electrónico</strong> (con CSV de la declaración) o <strong>presencialmente</strong>.</li>
                <li>Adjuntar la documentación del paso anterior según el importe.</li>
                <li>Para devoluciones <strong>{'>'} {formatCurrency(UMBRAL_DEVOLUCION)}</strong>: se necesita justificante de haber declarado la devolución en el Impuesto de Sucesiones.</li>
              </ul>
            </div>

            {/* Casos especiales */}
            <div className={styles.resultSection}>
              <h3><span aria-hidden="true">⚠️</span> Casos especiales</h3>
              <div className={styles.casosGrid}>
                <div className={styles.casoCard}>
                  <h4>Sin testamento (abintestato)</h4>
                  <p>Se sustituye el testamento por un <strong>Acta Notarial de Declaración de Herederos Abintestato</strong>. El resto del procedimiento es idéntico.</p>
                </div>
                <div className={styles.casoCard}>
                  <h4>Herederos menores de edad</h4>
                  <p>Sus <strong>representantes legales</strong> (progenitor superviviente o tutor) actúan en su nombre. Pueden inscribirse en el Registro de Sucesiones de la AEAT.</p>
                </div>
                <div className={styles.casoCard}>
                  <h4>Renuncia a la herencia</h4>
                  <p><strong>Renuncia pura y simple:</strong> el renunciante queda eximido de las obligaciones tributarias. <strong>Renuncia a favor de alguien:</strong> se considera aceptación + donación, con obligaciones fiscales.</p>
                </div>
                <div className={styles.casoCard}>
                  <h4>Ganancias patrimoniales</h4>
                  <p>La transmisión <em>mortis causa</em> <strong>no genera ganancia patrimonial</strong> para el fallecido (art. 33.3.b LIRPF). Los herederos toman el valor del bien a fecha de fallecimiento como valor de adquisición.</p>
                </div>
              </div>
            </div>

            {/* Normativa de referencia */}
            <div className={styles.normativaBox}>
              <h3><span aria-hidden="true">📜</span> Normativa de referencia</h3>
              <ul className={styles.normativaList}>
                <li><strong>Art. 12-13</strong> Ley 35/2006 (LIRPF) — Periodo impositivo y fallecimiento</li>
                <li><strong>Art. 14.4</strong> Ley 35/2006 — Rentas pendientes de imputación</li>
                <li><strong>Art. 33.3.b</strong> Ley 35/2006 — Exención plusvalía del muerto</li>
                <li><strong>Art. 57</strong> Ley 35/2006 — Mínimo del contribuyente (aplicación íntegra)</li>
                <li><strong>Art. 39.1</strong> Ley 58/2003 (LGT) — Sucesores en obligaciones tributarias</li>
                <li><strong>Art. 63</strong> RD 439/2007 (Reglamento IRPF) — Fraccionamiento por fallecimiento</li>
              </ul>
            </div>

            <div className={styles.navButtons}>
              <button type="button" className={styles.btnSecondary} onClick={retroceder}><span aria-hidden="true">←</span> Anterior</button>
              <button type="button" className={styles.btnPrimary} onClick={() => setPasoActual(1)}><span aria-hidden="true">🔄</span> Empezar de nuevo</button>
            </div>
          </section>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 Más sobre la Renta de personas fallecidas"
          subtitle="Preguntas frecuentes y conceptos clave"
        >
          <section className={styles.guideSection}>
            <h2>¿Quién presenta la declaración?</h2>
            <p>
              Los herederos del fallecido son quienes deben presentar la declaración. No es necesario que la presente
              un heredero concreto: cualquiera de ellos puede hacerlo. La obligación nace del hecho de que el fallecido
              fue contribuyente hasta su fecha de defunción.
            </p>

            <h2>¿Se prorratean los mínimos y deducciones?</h2>
            <p>
              No. Los mínimos personales y familiares, las reducciones y los límites de deducciones se aplican
              <strong> íntegros</strong>, sin importar si el fallecido vivió solo unos días del ejercicio. Tampoco
              se elevan al año. La única excepción son las <strong>rentas inmobiliarias imputadas</strong>,
              que sí se prorratean proporcionalmente.
            </p>

            <h2>¿Qué pasa con las rentas generadas después del fallecimiento?</h2>
            <p>
              Los alquileres, dividendos e intereses devengados <strong>a partir del día siguiente al fallecimiento</strong> ya
              no pertenecen al fallecido. Deben declararlos los herederos en sus propias declaraciones de IRPF,
              independientemente de que se haya formalizado la aceptación de herencia.
            </p>

            <h2>¿Y los planes de pensiones?</h2>
            <p>
              Las prestaciones de los planes de pensiones del fallecido las declara el <strong>beneficiario designado</strong> (o
              los herederos si no hay designación) en su propia declaración de IRPF, como rendimiento del trabajo. No se
              incluyen en la declaración del fallecido.
            </p>

            <h2>¿Se heredan las deudas con Hacienda?</h2>
            <p>
              Sí, las obligaciones tributarias pendientes se transmiten a los herederos (art. 39.1 LGT). Sin embargo,
              las <strong>sanciones nunca se transmiten</strong>. Los herederos pueden invocar su derecho a deliberar
              si aceptan o no la herencia, durante cuyo plazo se suspende la recaudación.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('declaracion-renta-fallecidos')} />
        <ShareCard appName="declaracion-renta-fallecidos" />
        <Footer appName="declaracion-renta-fallecidos" />
    </div>
  );
}
