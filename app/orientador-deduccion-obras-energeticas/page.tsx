'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorDeduccionObrasEnergeticas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ResultCard,
  NumberInput,
  ShareCard, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { jsonLd } from './metadata';

// ──────────────────────────────────────────
// DATOS DE LAS 3 MODALIDADES
// ──────────────────────────────────────────

interface Modalidad {
  id: 'demanda' | 'consumo' | 'edificio';
  porcentaje: number;
  titulo: string;
  descripcion: string;
  requisito: string;
  inmueble: string;
  baseMaximaAnual: number;
  baseMaximaAcumulada: number | null;
  plazoObras: string;
  plazoCertificado: string;
  arrastre: boolean;
}

const MODALIDADES: Modalidad[] = [
  {
    id: 'demanda',
    porcentaje: 20,
    titulo: 'Reducir demanda de calefacción y refrigeración',
    descripcion: 'Obras que reducen la necesidad de calefacción o aire acondicionado (aislamiento, ventanas, etc.)',
    requisito: 'Reducción ≥ 7% en la demanda conjunta de calefacción y refrigeración',
    inmueble: 'Vivienda habitual o arrendada (arrendada antes del 31/12/2026)',
    baseMaximaAnual: 5000,
    baseMaximaAcumulada: null,
    plazoObras: '06/10/2021 — 31/12/2026',
    plazoCertificado: 'Antes del 01/01/2027',
    arrastre: false,
  },
  {
    id: 'consumo',
    porcentaje: 40,
    titulo: 'Reducir consumo de energía primaria no renovable',
    descripcion: 'Obras que reducen significativamente el consumo energético (calderas eficientes, aerotermia, etc.)',
    requisito: 'Reducción ≥ 30% del consumo de energía primaria no renovable O alcanzar letra A o B',
    inmueble: 'Vivienda habitual o arrendada (arrendada antes del 31/12/2027)',
    baseMaximaAnual: 7500,
    baseMaximaAcumulada: null,
    plazoObras: '06/10/2021 — 31/12/2026',
    plazoCertificado: 'Antes del 01/01/2027',
    arrastre: false,
  },
  {
    id: 'edificio',
    porcentaje: 60,
    titulo: 'Rehabilitación energética de edificio completo',
    descripcion: 'Obras en el edificio (fachada, cubierta, instalaciones comunes) aprobadas por la comunidad',
    requisito: 'Reducción ≥ 30% del consumo del edificio O alcanzar letra A o B del edificio',
    inmueble: 'Viviendas + trasteros + garajes en edificio de uso predominantemente residencial',
    baseMaximaAnual: 5000,
    baseMaximaAcumulada: 15000,
    plazoObras: '06/10/2021 — 31/12/2027',
    plazoCertificado: 'Antes del 01/01/2028',
    arrastre: true,
  },
];

// ──────────────────────────────────────────
// COMPONENTE
// ──────────────────────────────────────────

export default function OrientadorDeduccionObrasEnergeticasPage() {
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState<Modalidad['id']>('consumo');
  const [importeObrasStr, setImporteObrasStr] = useState('');

  const modalidad = MODALIDADES.find(m => m.id === modalidadSeleccionada)!;

  const estimacion = useMemo(() => {
    const importe = parseSpanishNumber(importeObrasStr);
    if (!importe || importe <= 0) return null;

    const baseDeducible = Math.min(importe, modalidad.baseMaximaAnual);
    const ahorro = baseDeducible * (modalidad.porcentaje / 100);

    return {
      importeTotal: importe,
      baseDeducible,
      exceso: Math.max(0, importe - modalidad.baseMaximaAnual),
      ahorro,
      porcentaje: modalidad.porcentaje,
    };
  }, [importeObrasStr, modalidad]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🏗️</span> Deducción IRPF por Obras Energéticas
          </h1>
          <p className={styles.subtitle}>
            Oriéntate sobre las 3 deducciones por mejora de eficiencia energética en vivienda
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical" context="orientador-deduccion-obras-energeticas">
          <span>
            Esta herramienta es <strong>orientativa</strong>. Las deducciones por obras energéticas
            (DA 50.ª LIRPF) requieren certificados energéticos oficiales antes y después de las obras.
            La normativa ha sido prorrogada varias veces y puede cambiar. Consulta siempre con un
            asesor fiscal y con la{' '}
            <a href="https://sede.agenciatributaria.gob.es/Sede/vivienda-otros-inmuebles/deducciones-obras-mejora-eficiencia-energetica-viviendas.html"
              target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
              página oficial de la AEAT
            </a>{' '}
            antes de aplicar estas deducciones. <em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
          </span>
        </DisclaimerCard>

        {/* Las 3 modalidades */}
        <div className={styles.modalidades}>
          {MODALIDADES.map(m => (
            <div key={m.id} className={styles.modalidad}>
              <div className={styles.modalidadHeader}>
                <span className={styles.modalidadPct}>{m.porcentaje}%</span>
                <div className={styles.modalidadInfo}>
                  <h3>{m.titulo}</h3>
                  <p>{m.descripcion}</p>
                </div>
              </div>

              <div className={styles.detallesGrid}>
                <dl className={styles.detalle}>
                  <dt>Requisito</dt>
                  <dd>{m.requisito}</dd>
                </dl>
                <dl className={styles.detalle}>
                  <dt>Inmueble</dt>
                  <dd>{m.inmueble}</dd>
                </dl>
                <dl className={styles.detalle}>
                  <dt>Base máxima anual</dt>
                  <dd>{formatCurrency(m.baseMaximaAnual)}{m.baseMaximaAcumulada ? ` (acumulada: ${formatCurrency(m.baseMaximaAcumulada)})` : ''}</dd>
                </dl>
                <dl className={styles.detalle}>
                  <dt>Plazo obras</dt>
                  <dd>{m.plazoObras}</dd>
                </dl>
              </div>
            </div>
          ))}
        </div>

        {/* Estimador rápido */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">🔢</span> Estimación rápida del ahorro fiscal
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modalidad">Modalidad de deducción</label>
            <select
              id="modalidad"
              className={styles.select}
              value={modalidadSeleccionada}
              onChange={e => setModalidadSeleccionada(e.target.value as Modalidad['id'])}
            >
              <option value="demanda">20% — Reducir demanda calefacción/refrigeración</option>
              <option value="consumo">40% — Reducir consumo energía primaria</option>
              <option value="edificio">60% — Rehabilitación energética de edificio</option>
            </select>
          </div>

          <NumberInput
            value={importeObrasStr}
            onChange={setImporteObrasStr}
            label="Importe total de las obras (€)"
            placeholder="6000"
            helperText="Incluye materiales, mano de obra, proyecto técnico y certificados"
            min={0}
          />
        </div>

        {estimacion && (
          <>
            <div className={styles.resultsGrid}>
              <ResultCard
                title="Ahorro en IRPF"
                value={formatCurrency(estimacion.ahorro).replace(',00', '')}
                variant="highlight"
                icon="💶"
                description={`${estimacion.porcentaje}% de ${formatCurrency(estimacion.baseDeducible)}`}
              />
              <ResultCard
                title="Base deducible"
                value={formatCurrency(estimacion.baseDeducible).replace(',00', '')}
                variant="info"
                icon="📋"
                description={`Máximo: ${formatCurrency(modalidad.baseMaximaAnual)}/año`}
              />
            </div>

            {estimacion.exceso > 0 && (
              <div className={styles.tipBox}>
                <p>
                  <strong>Exceso no deducible:</strong> {formatCurrency(estimacion.exceso)} superan la base
                  máxima anual de {formatCurrency(modalidad.baseMaximaAnual)}.
                  {modalidad.arrastre
                    ? ' En la modalidad del 60%, el exceso puede trasladarse a los 4 ejercicios siguientes (máximo acumulado: 15.000 €).'
                    : ' Este exceso no es deducible.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Certificados */}
        <div className={styles.tipBox}>
          <p>
            <strong>Certificados obligatorios:</strong> Para aplicar cualquiera de las 3 deducciones
            necesitas un certificado energético <strong>anterior</strong> a las obras (máximo 2 años
            de antigüedad) y otro <strong>posterior</strong> que acredite la mejora. Ambos deben estar
            expedidos por técnico competente y registrados en el registro autonómico correspondiente
            (RD 390/2021).
          </p>
        </div>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre las deducciones por obras energéticas"
          subtitle="Normativa, requisitos y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">📊</span> Tabla comparativa de las 3 modalidades</h2>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>20% Demanda</th>
                  <th>40% Consumo</th>
                  <th>60% Edificio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Porcentaje deducción</td>
                  <td>20%</td>
                  <td>40%</td>
                  <td>60%</td>
                </tr>
                <tr>
                  <td>Mejora requerida</td>
                  <td>≥ 7% demanda</td>
                  <td>≥ 30% consumo o letra A/B</td>
                  <td>≥ 30% consumo o letra A/B</td>
                </tr>
                <tr>
                  <td>Base máxima/año</td>
                  <td>5.000 €</td>
                  <td>7.500 €</td>
                  <td>5.000 € (15.000 € acum.)</td>
                </tr>
                <tr>
                  <td>Ahorro máximo/año</td>
                  <td>1.000 €</td>
                  <td>3.000 €</td>
                  <td>3.000 € (9.000 € acum.)</td>
                </tr>
                <tr>
                  <td>Plazo obras</td>
                  <td>Hasta 31/12/2026</td>
                  <td>Hasta 31/12/2026</td>
                  <td>Hasta 31/12/2027</td>
                </tr>
                <tr>
                  <td>Inmueble</td>
                  <td>Vivienda propia</td>
                  <td>Vivienda propia</td>
                  <td>Edificio completo</td>
                </tr>
                <tr>
                  <td>Arrastre exceso</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Sí (4 ejercicios)</td>
                </tr>
                <tr>
                  <td>¿Vivienda arrendada?</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí (edificio)</td>
                </tr>
              </tbody>
            </table>

            <h2><span aria-hidden="true">🎯</span> 4 situaciones frecuentes</h2>

            <h3>1. Cambio de ventanas en vivienda habitual</h3>
            <p>Si las nuevas ventanas reducen la demanda de calefacción/refrigeración al menos un 7% (lo habitual al pasar de vidrio simple a doble con rotura de puente térmico), aplica la deducción del 20%. Necesitas certificado energético antes y después.</p>

            <h3>2. Instalación de aerotermia</h3>
            <p>Sustituir una caldera de gasóleo por aerotermia suele reducir el consumo de energía primaria más del 30%. Aplica la deducción del 40%. Si además mejoras a letra A o B, también cualifica.</p>

            <h3>3. La comunidad rehabilita la fachada</h3>
            <p>Si tu comunidad de propietarios aprueba un aislamiento de fachada que reduce el consumo del edificio ≥ 30%, aplica la deducción del 60%. Tu base deducible se calcula con tu coeficiente de participación sobre el total pagado por la comunidad.</p>

            <h3>4. He hecho varias obras en años distintos</h3>
            <p>Puedes aplicar diferentes modalidades en años distintos por actuaciones diferentes, siempre que no sean las mismas obras. No puedes aplicar dos deducciones a las mismas cantidades.</p>

            <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>

            <h3>¿Puedo combinar las 3 deducciones?</h3>
            <p>No sobre las mismas obras. Son incompatibles entre sí para las mismas cantidades. Pero puedes aplicar una deducción por unas obras y otra diferente por obras distintas en otro ejercicio.</p>

            <h3>¿Cuándo se aplica la deducción, al pagar o al certificar?</h3>
            <p>En el ejercicio en que se expide el certificado posterior a las obras, no cuando se pagan. Si pagas en 2025 pero el certificado se expide en 2026, la deducción va en la renta de 2026.</p>

            <h3>¿Vale pagar en efectivo?</h3>
            <p>No. Es obligatorio pagar por tarjeta, transferencia bancaria o cheque nominativo. Los pagos en metálico no dan derecho a deducción.</p>

            <h3>¿Sirve para segunda vivienda?</h3>
            <p>Sí, las deducciones del 20% y 40% aplican también a viviendas arrendadas o en expectativa de arrendamiento. La del 60% aplica al edificio completo (incluidas todas las viviendas del propietario en él).</p>

            <h3>¿Qué pasa si no alcanzo la mejora del 7% o 30%?</h3>
            <p>No puedes aplicar la deducción. El certificado posterior debe acreditar que se ha alcanzado el umbral mínimo. Sin mejora suficiente, no hay deducción.</p>

            <h3>¿Cuántas veces se han prorrogado?</h3>
            <p>Creadas en octubre 2021 (RDL 19/2021), prorrogadas 4 veces: RDL 8/2023, RDL 9/2024, RDL 16/2025 (derogado) y RDL 2/2026 (vigente). Las obras de 2025 y 2026 están cubiertas.</p>

            <h3>¿Qué es la DA 50.ª de la LIRPF?</h3>
            <p>La Disposición Adicional Quincuagésima de la Ley del IRPF (Ley 35/2006). Es donde se regulan estas 3 deducciones. No están en el artículo 68 (que es la deducción por vivienda habitual pre-2013).</p>

            <h3>¿Qué gastos son deducibles?</h3>
            <p>Materiales, mano de obra, proyecto técnico, dirección de obra, instalaciones, equipos y los propios certificados energéticos. Todo con factura y pago no en metálico.</p>

            <h2><span aria-hidden="true">📝</span> Pasos para aplicar la deducción</h2>
            <ol>
              <li><strong>Obtén el certificado previo:</strong> Contrata un técnico competente para que certifique la eficiencia energética actual de tu vivienda o edificio.</li>
              <li><strong>Planifica las obras:</strong> Asegúrate de que la mejora prevista alcanzará el umbral requerido (7%, 30% o letra A/B).</li>
              <li><strong>Ejecuta las obras:</strong> Guarda todas las facturas. Paga siempre por transferencia, tarjeta o cheque nominativo.</li>
              <li><strong>Obtén el certificado posterior:</strong> El mismo técnico (u otro) certifica la mejora alcanzada. Registra ambos certificados.</li>
              <li><strong>Incluye la deducción en la renta:</strong> En la declaración del ejercicio en que se expida el certificado posterior.</li>
              <li><strong>Conserva la documentación:</strong> Certificados, facturas y justificantes de pago durante al menos 4 años (prescripción).</li>
            </ol>

            <h2><span aria-hidden="true">💡</span> Consejos prácticos</h2>
            <ul>
              <li>Si la obra puede cumplir tanto el 7% (demanda) como el 30% (consumo), aplica la del 40% — mayor ahorro fiscal.</li>
              <li>El certificado previo no puede tener más de 2 años de antigüedad al inicio de las obras.</li>
              <li>Para obras comunitarias (60%), pide al administrador que detalle tu cuota de participación en las derramas.</li>
              <li>Si el importe supera la base máxima del 60%, el exceso se traslada a los 4 ejercicios siguientes.</li>
              <li>Estas deducciones son compatibles con las subvenciones Next Generation EU (pero solo deduces lo que tú pagas, no la subvención).</li>
              <li>Consulta la página de la AEAT para la última versión de los plazos — cambian con cada prórroga legislativa.</li>
            </ul>

            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Errores frecuentes</h3>
              <ul>
                <li>No obtener el certificado previo ANTES de iniciar las obras (invalida la deducción)</li>
                <li>Pagar en metálico (las obras pagadas en efectivo no son deducibles)</li>
                <li>Confundir estas deducciones con la de vivienda habitual (art. 68 LIRPF, régimen transitorio pre-2013)</li>
                <li>Intentar deducir el importe de una subvención recibida (solo se deduce lo pagado de tu bolsillo)</li>
                <li>No registrar los certificados en el registro autonómico (requisito obligatorio)</li>
                <li>Aplicar la deducción en el año del pago en lugar del año del certificado posterior</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('orientador-deduccion-obras-energeticas')} />
        <ShareCard appName="orientador-deduccion-obras-energeticas" />
        <Footer appName="orientador-deduccion-obras-energeticas" />
      </div>
    </>
  );
}
