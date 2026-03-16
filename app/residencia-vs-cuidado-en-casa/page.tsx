'use client';

import { useState } from 'react';
import styles from './ResidenciaVsCuidadoCasa.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos y datos ────────────────────────────────────────────────────────────

type GradoDependencia = 'no_valorado' | 'grado1' | 'grado2' | 'grado3';

interface FactorComparacion {
  icono: string;
  texto: string;
}

interface Opcion {
  id: string;
  icono: string;
  nombre: string;
  costeTexto: string;
  costeMin: number;
  costeMax: number;
  factores: FactorComparacion[];
  notaPublica?: string;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularOpciones(horasDia: number, gradoDependencia: GradoDependencia): Opcion[] {
  // Residencia privada: coste relativamente fijo, varía por CCAA
  const residenciaMin = 1600;
  const residenciaMax = 3200;

  // SAD privado: precio/hora × horas × días/mes (~22 laborables, pero SAD es también fines)
  // Usamos 26 días de media para incluir fines de semana parciales
  const precioHoraSAD = 18; // €/hora media nacional SAD privado
  const costeSADMin = Math.round(horasDia * precioHoraSAD * 22);
  const costeSADMax = Math.round(horasDia * 22 * 26);

  // Cuidador en casa: depende de horas
  let cuidadorMin: number;
  let cuidadorMax: number;
  let cuidadorTipo: string;

  if (horasDia <= 4) {
    cuidadorMin = Math.round(horasDia * 15 * 22);
    cuidadorMax = Math.round(horasDia * 22 * 22);
    cuidadorTipo = 'Auxiliar a tiempo parcial';
  } else if (horasDia <= 8) {
    cuidadorMin = 900;
    cuidadorMax = 1400;
    cuidadorTipo = 'Auxiliar a jornada completa';
  } else {
    cuidadorMin = 1100;
    cuidadorMax = 1600;
    cuidadorTipo = 'Cuidador interno (incluye alojamiento)';
  }

  const tienePrestacion = gradoDependencia === 'grado2' || gradoDependencia === 'grado3';
  const notaPublica = gradoDependencia !== 'no_valorado'
    ? `Con ${gradoDependencia.replace('grado', 'Grado ')} reconocido, puedes acceder a prestaciones económicas y SAD público que reducen el coste real.`
    : 'Sin valoración de dependencia, los costes son íntegramente privados. Valorar la dependencia desbloquea ayudas públicas.';

  return [
    {
      id: 'residencia',
      icono: '🏢',
      nombre: 'Residencia privada',
      costeTexto: `${formatCurrency(residenciaMin)} – ${formatCurrency(residenciaMax)}/mes`,
      costeMin: residenciaMin,
      costeMax: residenciaMax,
      factores: [
        { icono: '✅', texto: 'Atención 24 horas garantizada' },
        { icono: '✅', texto: 'Sin carga para la familia' },
        { icono: '✅', texto: 'Socialización y actividades' },
        { icono: '✅', texto: 'Atención sanitaria integrada' },
        { icono: '❌', texto: 'La persona abandona su hogar' },
        { icono: '❌', texto: 'Coste más elevado' },
        { icono: '⚠️', texto: 'Variabilidad de calidad entre centros' },
      ],
    },
    {
      id: 'sad',
      icono: '🏠',
      nombre: `SAD en domicilio (${horasDia}h/día)`,
      costeTexto: `${formatCurrency(costeSADMin)} – ${formatCurrency(costeSADMax)}/mes`,
      costeMin: costeSADMin,
      costeMax: costeSADMax,
      factores: [
        { icono: '✅', texto: 'Permanece en su hogar' },
        { icono: '✅', texto: 'Mayor autonomía y privacidad' },
        { icono: '✅', texto: 'Coste proporcional a las horas' },
        { icono: tienePrestacion ? '✅' : '⚠️', texto: tienePrestacion ? 'SAD público disponible con tu grado' : 'SAD público posible si se valora dependencia' },
        { icono: '❌', texto: 'No cubre las horas fuera del servicio' },
        { icono: '⚠️', texto: 'Requiere apoyo familiar complementario' },
      ],
      notaPublica,
    },
    {
      id: 'cuidador',
      icono: '👤',
      nombre: cuidadorTipo,
      costeTexto: `${formatCurrency(cuidadorMin)} – ${formatCurrency(cuidadorMax)}/mes`,
      costeMin: cuidadorMin,
      costeMax: cuidadorMax,
      factores: [
        { icono: '✅', texto: 'Permanece en su hogar' },
        { icono: '✅', texto: 'Atención personalizada y continua' },
        { icono: horasDia >= 8 ? '✅' : '⚠️', texto: horasDia >= 8 ? 'Cobertura amplia de horas' : 'Cobertura limitada a las horas contratadas' },
        { icono: '⚠️', texto: 'Responsabilidad como empleador (SS y contrato)' },
        { icono: '⚠️', texto: 'Gestión de sustituciones en vacaciones/bajas' },
        { icono: '❌', texto: 'Sin cobertura sanitaria integrada' },
      ],
      notaPublica,
    },
  ];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ResidenciaVsCuidadoCasa() {
  const [horasDia, setHorasDia] = useState('4');
  const [gradoDependencia, setGradoDependencia] = useState<GradoDependencia>('no_valorado');
  const [opciones, setOpciones] = useState<Opcion[] | null>(null);
  const [error, setError] = useState('');

  function comparar() {
    setError('');
    const horas = parseFloat(horasDia.replace(',', '.'));
    if (isNaN(horas) || horas < 1 || horas > 24) {
      setError('Introduce las horas de cuidado al día (entre 1 y 24).');
      return;
    }
    setOpciones(calcularOpciones(horas, gradoDependencia));
  }

  const opcionesSorted = opciones ? [...opciones].sort((a, b) => a.costeMin - b.costeMin) : null;
  const opcionMasBajaId = opcionesSorted?.[0]?.id;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏡</span>
        <h1 className={styles.title}>Residencia vs Cuidado en Casa</h1>
        <p className={styles.subtitle}>Compara costes y factores de las opciones de cuidado para mayores · 2025</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Los costes son <strong>estimaciones orientativas</strong> con medias nacionales 2025. Los precios reales varían significativamente por comunidad autónoma, calidad del servicio y situación personal.
          <br /><strong>No es</strong> asesoramiento financiero ni de servicios sociales personalizado.
          <br />Las prestaciones públicas de dependencia dependen del reconocimiento oficial del grado. Consulta con los Servicios Sociales de tu municipio.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en estas estimaciones.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          <NumberInput
            value={horasDia}
            onChange={setHorasDia}
            label="Horas de cuidado necesarias al día"
            placeholder="4"
            helperText="Horas diarias de ayuda que requiere la persona: aseo, comidas, movilidad, etc."
            min={1}
            max={24}
          />

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="gradoDep">Grado de Dependencia reconocido</label>
            <select
              id="gradoDep"
              className={styles.select}
              value={gradoDependencia}
              onChange={e => setGradoDependencia(e.target.value as GradoDependencia)}
            >
              <option value="no_valorado">No valorado (o en trámite)</option>
              <option value="grado1">Grado I — Dependencia moderada</option>
              <option value="grado2">Grado II — Dependencia severa</option>
              <option value="grado3">Grado III — Gran dependencia</option>
            </select>
            <p className={styles.hint}>
              Si aún no está valorado, solicitar el reconocimiento desbloquea prestaciones y ayudas públicas.
            </p>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={comparar} aria-label="Comparar opciones de cuidado">
            Comparar opciones
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Comparativa de opciones</h2>

          {!opciones ? (
            <p className={styles.placeholder}>
              Indica las horas de cuidado y pulsa el botón para ver la comparativa de las tres opciones.
            </p>
          ) : (
            <div className={styles.opcionesGrid}>
              {opciones.map(opcion => (
                <div
                  key={opcion.id}
                  className={`${styles.opcionCard} ${opcion.id === opcionMasBajaId ? styles.opcionMasBaja : ''}`}
                >
                  <div className={styles.opcionHeader}>
                    <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                    <span className={styles.opcionNombre}>{opcion.nombre}</span>
                    {opcion.id === opcionMasBajaId && (
                      <span className={styles.opcionBadge}>Más económica</span>
                    )}
                  </div>

                  <div className={styles.opcionCoste}>{opcion.costeTexto}</div>

                  <div className={styles.factoresLista}>
                    {opcion.factores.map((f, i) => (
                      <div key={i} className={styles.factorItem}>
                        <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
                        <span>{f.texto}</span>
                      </div>
                    ))}
                  </div>

                  {opcion.notaPublica && (
                    <>
                      <div className={styles.divider} />
                      <p className={styles.notaPublica}>💡 {opcion.notaPublica}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo elegir entre residencia y cuidado en casa?" subtitle="Factores económicos, emocionales y prácticos a considerar">
        <p>No existe una opción universalmente mejor: la decisión depende de la situación médica, la red familiar, el entorno de la vivienda y los recursos económicos. Estos son los factores clave:</p>
        <h3>¿Cuándo puede ser mejor la residencia?</h3>
        <ul>
          <li>Dependencia severa o gran dependencia (Grado II o III) con necesidad de atención 24h.</li>
          <li>Aislamiento social o cuando la persona se beneficia de la vida comunitaria.</li>
          <li>Cuando la vivienda no es adaptable o la familia no puede asumir el rol cuidador.</li>
          <li>Cuando el coste de los cuidados en casa supera al de la residencia.</li>
        </ul>
        <h3>¿Cuándo puede ser mejor el cuidado en casa?</h3>
        <ul>
          <li>Dependencia moderada que no requiere atención médica especializada continua.</li>
          <li>Fuerte vínculo de la persona con su hogar y entorno habitual.</li>
          <li>Red familiar que puede complementar las horas del cuidador o SAD.</li>
          <li>Vivienda adaptable o ya adaptada.</li>
        </ul>
        <h3>El papel de la valoración de dependencia</h3>
        <p>Solicitar el reconocimiento oficial de la dependencia (IMSERSO / CCAA) es el primer paso. Desbloquea prestaciones económicas, plazas en centros de día, SAD público y prioridad en residencias concertadas, reduciendo notablemente el coste real.</p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('residencia-vs-cuidado-en-casa')} />
      <ShareCard appName="residencia-vs-cuidado-en-casa" />
      <Footer appName="residencia-vs-cuidado-en-casa" />
    </div>
  );
}
