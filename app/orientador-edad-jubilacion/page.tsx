'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorEdadJubilacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  NumberInput,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { FISCAL_PENSIONES_META, TABLA_EDAD_JUBILACION, getEdadJubilacion } from '@/data/fiscal';
import { jsonLd } from './metadata';

// ──────────────────────────────────────────
// LÓGICA
// ──────────────────────────────────────────

function calcularEdadJubilacion(anioNacimiento: number, anosCotizados: number) {
  // Probar todos los años posibles de jubilación (desde que cumple 65 hasta 70)
  for (let anioJub = anioNacimiento + 65; anioJub <= anioNacimiento + 70; anioJub++) {
    const datos = getEdadJubilacion(anioJub);
    const cotMin = datos.cotizacionPara65.anios * 12 + datos.cotizacionPara65.meses;
    const mesesCotizados = Math.round(anosCotizados * 12);

    if (mesesCotizados >= cotMin) {
      // Puede jubilarse a los 65 en este año
      return {
        edadAnios: 65,
        edadMeses: 0,
        anioJubilacion: anioNacimiento + 65,
        cotizacionSuficiente: true,
        cotizacionNecesaria: datos.cotizacionPara65,
        edadAlternativa: datos.edadSinCotizacion,
        anioAlternativo: anioNacimiento + datos.edadSinCotizacion.anios + (datos.edadSinCotizacion.meses > 0 ? 1 : 0),
      };
    }

    // Sin cotización suficiente: edad ordinaria según el año en que cumpla esa edad
    const edadOrd = datos.edadSinCotizacion;
    const anioEdadOrd = anioNacimiento + edadOrd.anios + (edadOrd.meses > 0 ? 1 : 0);

    if (anioJub >= anioEdadOrd) {
      return {
        edadAnios: edadOrd.anios,
        edadMeses: edadOrd.meses,
        anioJubilacion: anioNacimiento + edadOrd.anios,
        cotizacionSuficiente: false,
        cotizacionNecesaria: datos.cotizacionPara65,
        edadAlternativa: edadOrd,
        anioAlternativo: anioNacimiento + edadOrd.anios,
      };
    }
  }

  // Fallback: 67 años
  return {
    edadAnios: 67,
    edadMeses: 0,
    anioJubilacion: anioNacimiento + 67,
    cotizacionSuficiente: false,
    cotizacionNecesaria: { anios: 38, meses: 6 },
    edadAlternativa: { anios: 67, meses: 0 },
    anioAlternativo: anioNacimiento + 67,
  };
}

// ──────────────────────────────────────────
// COMPONENTE
// ──────────────────────────────────────────

export default function OrientadorEdadJubilacionPage() {
  const [anioNacimiento, setAnioNacimiento] = useState('');
  const [anosCotizados, setAnosCotizados] = useState('');

  const resultado = useMemo(() => {
    const anio = parseInt(anioNacimiento);
    const anos = parseFloat(anosCotizados?.replace(',', '.') || '0');
    if (!anio || anio < 1940 || anio > 2000) return null;
    return calcularEdadJubilacion(anio, anos);
  }, [anioNacimiento, anosCotizados]);

  const edadTexto = (anios: number, meses: number) =>
    meses > 0 ? `${anios} años y ${meses} meses` : `${anios} años`;

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
            <span aria-hidden="true">📅</span> ¿Cuándo me jubilo?
          </h1>
          <p className={styles.subtitle}>
            Descubre tu edad de jubilación según tu año de nacimiento y cotización
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard variant="financial" severity="high" context="orientador-edad-jubilacion" />
        <DataReference
          normativa="Edad de jubilación — Ley 27/2011 + Ley 21/2021"
          fuente={FISCAL_PENSIONES_META.fuente}
          verificado={FISCAL_PENSIONES_META.verificado}
          urlOficial={FISCAL_PENSIONES_META.urlOficial}
        />

        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">👤</span> Tus datos
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="anioNacimiento">Año de nacimiento</label>
            <select
              id="anioNacimiento"
              className={styles.select}
              value={anioNacimiento}
              onChange={e => setAnioNacimiento(e.target.value)}
            >
              <option value="">Selecciona tu año de nacimiento</option>
              {Array.from({ length: 41 }, (_, i) => 1955 + i).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <NumberInput
            value={anosCotizados}
            onChange={setAnosCotizados}
            label="Años cotizados (estimados al jubilarte)"
            placeholder="35"
            helperText="Incluye los años que te quedan por cotizar hasta la jubilación"
            min={0}
            max={50}
          />
        </div>

        {/* Resultado */}
        {resultado && (
          <>
            <div className={styles.resultCard} role="status" aria-live="polite">
              <div className={styles.resultAge}>
                {edadTexto(resultado.edadAnios, resultado.edadMeses)}
              </div>
              <div className={styles.resultYear}>
                Te jubilarías en {resultado.anioJubilacion}
              </div>
              <p className={styles.resultDetail}>
                {resultado.cotizacionSuficiente ? (
                  <>
                    Con {anosCotizados} años cotizados, superas el umbral de{' '}
                    {edadTexto(resultado.cotizacionNecesaria.anios, resultado.cotizacionNecesaria.meses)}{' '}
                    necesarios para jubilarte a los <strong>65 años</strong>.
                  </>
                ) : (
                  <>
                    Con {anosCotizados || '0'} años cotizados, no alcanzas el umbral de{' '}
                    {edadTexto(resultado.cotizacionNecesaria.anios, resultado.cotizacionNecesaria.meses)}{' '}
                    necesarios para jubilarte a los 65. Tu edad ordinaria es{' '}
                    <strong>{edadTexto(resultado.edadAlternativa.anios, resultado.edadAlternativa.meses)}</strong>.
                  </>
                )}
              </p>

              {resultado.cotizacionSuficiente && (
                <div className={styles.resultAlt}>
                  Sin cotización suficiente, la edad sería{' '}
                  <strong>{edadTexto(resultado.edadAlternativa.anios, resultado.edadAlternativa.meses)}</strong>{' '}
                  (año ~{resultado.anioAlternativo}).
                </div>
              )}
            </div>

            <div className={styles.tipBox}>
              <p>
                <strong>Desde 2026</strong> se aplica el <strong>sistema dual</strong> de cálculo de
                pensiones. La Seguridad Social calcula tu pensión con la fórmula clásica (25 años) y
                la ampliada (25 años y 4 meses en 2026, hasta 29 años en 2037), y aplica
                automáticamente la más favorable. Consulta tu estimación en el{' '}
                <a href="https://meskeia.com/estimador-pension-publica/" style={{ color: 'var(--primary)' }}>
                  Estimador de Pensión Pública
                </a>.
              </p>
            </div>
          </>
        )}

        {/* Tabla completa */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">📊</span> Tabla de edad de jubilación 2024-2027
          </h2>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Año</th>
                <th>Edad ordinaria</th>
                <th>Cotización para jubilarse a los 65</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_EDAD_JUBILACION.map(row => (
                <tr key={row.anio} className={row.anio === 2026 ? styles.tablaHighlight : ''}>
                  <td>{row.anio}{row.anio === 2026 ? ' ←' : ''}</td>
                  <td>{edadTexto(row.edadSinCotizacion.anios, row.edadSinCotizacion.meses)}</td>
                  <td>{edadTexto(row.cotizacionPara65.anios, row.cotizacionPara65.meses)} cotizados</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Desde 2027 la edad ordinaria se estabiliza en 67 años (o 65 con 38 años y 6 meses cotizados).
          </p>
        </div>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre la edad de jubilación"
          subtitle="Normativa, excepciones y preguntas frecuentes"
        >
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">🎯</span> 4 situaciones frecuentes</h2>

            <h3>1. Nací en 1961 y he cotizado 40 años</h3>
            <p>Cumples 65 en 2026. Con 40 años cotizados superas ampliamente los 38 años y 3 meses necesarios. Puedes jubilarte a los 65 años en 2026.</p>

            <h3>2. Nací en 1960 y he cotizado 30 años</h3>
            <p>No alcanzas los 38 años y 3 meses para jubilarte a los 65. Tu edad ordinaria en 2026 es 66 años y 10 meses, por lo que podrías jubilarte a finales de 2026 o principios de 2027.</p>

            <h3>3. Nací en 1962 y quiero jubilarme a los 65</h3>
            <p>Cumplirías 65 en 2027, cuando la edad definitiva es 67 (o 65 con 38 años y 6 meses cotizados). Si llegas a esa cotización, puedes jubilarte a los 65.</p>

            <h3>4. Soy autónomo con lagunas de cotización</h3>
            <p>La cotización requerida es la misma para asalariados y autónomos. Si tienes períodos sin cotizar, tu edad ordinaria será la más alta del año de jubilación correspondiente.</p>

            <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>

            <h3>¿Puedo jubilarme antes de la edad ordinaria?</h3>
            <p>Sí, existe la jubilación anticipada voluntaria (hasta 2 años antes, con 35+ años cotizados) e involuntaria (hasta 4 años antes, con 33+ años). Ambas implican coeficientes reductores que reducen la pensión.</p>

            <h3>¿Qué es la jubilación parcial?</h3>
            <p>Permite reducir la jornada entre un 25% y un 75% a partir de los 60 años, combinando salario y pensión parcial. Requiere un contrato de relevo.</p>

            <h3>¿Puedo trabajar y cobrar pensión a la vez?</h3>
            <p>Sí, mediante la jubilación activa. Cobras el 50% de la pensión (100% si eres autónomo con un empleado) mientras sigues trabajando.</p>

            <h3>¿Qué pasa si cotizo más de 38 años y 6 meses?</h3>
            <p>Puedes jubilarte a los 65, pero cotizar más allá de lo necesario para el 100% no aumenta la pensión (hay un tope máximo). Sí puede mejorar tu base reguladora si los últimos años son de cotización alta.</p>

            <h3>¿Afecta el año de nacimiento o el año de jubilación?</h3>
            <p>Lo que importa es el año en que solicitas la jubilación, no tu año de nacimiento. La tabla se organiza por año de jubilación. Si naciste en 1961 y te jubilas a los 65, cuenta la tabla de 2026.</p>

            <h3>¿Cómo consulto mis años cotizados?</h3>
            <p>En la Sede Electrónica de la Seguridad Social (importass.seg-social.es) puedes descargar tu informe de vida laboral con el detalle de todos los períodos cotizados.</p>

            <h3>¿Qué es el sistema dual de pensiones 2026?</h3>
            <p>Desde enero de 2026, la SS calcula tu pensión con dos fórmulas (clásica de 25 años y ampliada) y aplica automáticamente la más favorable. Esto beneficia especialmente a trabajadores con lagunas o salarios variables.</p>

            <h3>¿Cuándo será definitiva la edad de 67 años?</h3>
            <p>En 2027. Desde ese año, la edad ordinaria es 67 años (o 65 con 38 años y 6 meses cotizados). No hay más escalones previstos.</p>

            <h2><span aria-hidden="true">📝</span> Cómo preparar tu jubilación</h2>
            <ol>
              <li><strong>Consulta tu vida laboral</strong> en importass.seg-social.es para saber tus años exactos de cotización.</li>
              <li><strong>Calcula tu edad de jubilación</strong> con esta herramienta según tus años cotizados.</li>
              <li><strong>Estima tu pensión</strong> con el Estimador de Pensión Pública de meskeIA (incluye sistema dual 2026).</li>
              <li><strong>Calcula la brecha</strong> entre tu sueldo actual y tu pensión estimada con el Estimador de Brecha de Jubilación.</li>
              <li><strong>Complementa con ahorro privado</strong> si la brecha es significativa: planes de pensiones, fondos indexados, etc.</li>
              <li><strong>Solicita cita previa</strong> en la SS 6 meses antes de la fecha prevista de jubilación.</li>
            </ol>

            <h2><span aria-hidden="true">💡</span> Datos clave</h2>
            <ul>
              <li>La edad de jubilación sube progresivamente hasta 67 años en 2027 (último escalón).</li>
              <li>Con cotización larga (38a 6m en 2027), la jubilación a los 65 se mantiene.</li>
              <li>El sistema dual de 2026 nunca perjudica: solo puede mejorar o mantener tu pensión.</li>
              <li>La pensión mínima en 2026 es de 888,70 €/mes (sin cónyuge a cargo) y la máxima de 3.359,60 €/mes.</li>
              <li>Consulta siempre el simulador oficial de la SS para un cálculo con tu historial real.</li>
              <li>La jubilación anticipada reduce la pensión entre 1,2% y 2,04% por trimestre de anticipación.</li>
            </ul>

            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Errores frecuentes</h3>
              <ul>
                <li>Creer que la edad de jubilación es siempre 65 años (es 66 años y 10 meses en 2026 sin cotización suficiente)</li>
                <li>No contar el desempleo como período cotizado (sí cuenta, reduce la edad necesaria)</li>
                <li>Confundir años cotizados con años trabajados (pueden no coincidir si hubo lagunas)</li>
                <li>No solicitar la jubilación con antelación (iniciar trámites 3-6 meses antes)</li>
                <li>Desconocer la jubilación parcial como alternativa a la anticipada (menor penalización)</li>
                <li>No consultar la vida laboral antes de hacer planes — puede haber sorpresas</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('orientador-edad-jubilacion')} />
        <ShareCard appName="orientador-edad-jubilacion" />
        <Footer appName="orientador-edad-jubilacion" />
      </div>
    </>
  );
}
