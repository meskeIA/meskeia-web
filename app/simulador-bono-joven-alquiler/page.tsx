'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorBonoJovenAlquiler.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  DataReference,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber, parseSpanishNumberOr } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  BONO_ALQUILER_JOVEN_2026,
  UMBRAL_IPREM_VIVIENDA_JOVEN,
  FISCAL_VIVIENDA_JOVEN_META,
  IPREM_2026,
} from '@/data/fiscal';

/**
 * Las cuantías del Real Decreto son importes redondos y en la prosa se leen como tales:
 * «300 €/mes», no «300,00 €/mes». Lo que se CALCULA —la ayuda efectiva, el pago real, el
 * acumulado— sigue con `formatCurrency`, que es lo que pide la regla de formato. Aquí lo
 * que importa es que la cifra salga del módulo en vez de estar tecleada (hallazgo 444).
 */
const eur = (n: number) => `${formatNumber(n, 0)} €`;

/** El umbral de renta se computa sobre 14 pagas (IPREM_2026.anual14), la referencia que
 *  el propio módulo fiscal declara para cálculo de topes (hallazgo 536). */
const topeIngresos = (veces: number) => eur(IPREM_2026.anual14 * veces);

interface Requisito {
  id: string;
  pregunta: string;
  explicacion: string;
  bloqueante: boolean;
}

const REQUISITOS: Requisito[] = [
  {
    id: 'edad',
    pregunta: `Tienes entre ${BONO_ALQUILER_JOVEN_2026.edad.minima} y ${BONO_ALQUILER_JOVEN_2026.edad.maxima} años (inclusive)`,
    explicacion: 'El Bono Joven está destinado exclusivamente a personas de hasta 35 años.',
    bloqueante: true,
  },
  {
    id: 'ingresos',
    pregunta: `Tus rentas anuales no superan ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.general, 0)} veces el IPREM (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.general)}/año)`,
    explicacion: `El RD 326/2026 fija el umbral en ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.general, 0)} veces el IPREM (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.general)}/año), que sube a ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad33, 1)} (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad33)}/año) con una discapacidad reconocida del 33 % o más (y si eres hijo o hija de víctima de violencia de género) y a ${formatNumber(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad65, 0)} (${topeIngresos(UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad65)}/año) con una discapacidad del 65 % o más. Cada Comunidad Autónoma concreta el cómputo en su convocatoria.`,
    bloqueante: true,
  },
  {
    id: 'propietario',
    pregunta: 'No eres propietario de una vivienda en España',
    explicacion: 'No puedes ser titular de un derecho de propiedad o usufructo sobre ninguna vivienda en España.',
    bloqueante: true,
  },
  {
    id: 'habitual',
    pregunta: 'La vivienda es tu residencia habitual y permanente',
    explicacion: 'Debes destinar la vivienda alquilada a tu domicilio habitual y permanente.',
    bloqueante: true,
  },
  {
    id: 'contrato',
    pregunta: 'El contrato de arrendamiento está registrado (o lo estará)',
    explicacion: 'El contrato debe estar formalizado por escrito y depositada la fianza. Las CA pueden pedir su depósito oficial.',
    bloqueante: false,
  },
  // El requisito de renta NO se pregunta: la app tiene el importe tecleado y el límite del
  // RD, así que lo comprueba ella (art. 133.1.e). Preguntarlo era pedirle al usuario que
  // respondiera algo que el simulador sabe, y además con los topes del plan anterior.
  {
    id: 'comunidad',
    pregunta: 'Tu Comunidad Autónoma tiene el Bono Joven activo',
    explicacion: 'La gestión y disponibilidad del Bono Joven depende de cada Comunidad Autónoma, que recibe los fondos del Estado y los tramita.',
    bloqueante: false,
  },
];

type EstadoRequisito = 'si' | 'no' | 'pendiente';
type TipoVivienda = 'vivienda' | 'habitacion';

// Todo lo normativo sale de data/fiscal/vivienda-joven.ts, sellado contra el BOE.
const BONO: Record<TipoVivienda, number> = BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual;
const DURACION_MAX_MESES = BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses; // 2 + prórroga de 2
const LIMITE_SOBRE_RENTA = BONO_ALQUILER_JOVEN_2026.limiteSobreRenta;
const RENTA_MAX = BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual;

export default function SimuladorBonoJovenAlquilerPage() {
  const [alquilMensual, setAlquilMensual] = useState('');
  const [tipoVivienda, setTipoVivienda] = useState<TipoVivienda>('vivienda');
  const [municipioPequeno, setMunicipioPequeno] = useState(false);
  const [estados, setEstados] = useState<Record<string, EstadoRequisito>>(
    Object.fromEntries(REQUISITOS.map(r => [r.id, 'pendiente']))
  );

  const toggleEstado = (id: string, valor: EstadoRequisito) => {
    setEstados(prev => ({ ...prev, [id]: prev[id] === valor ? 'pendiente' : valor }));
  };

  // `parseSpanishNumberOr` y no el parseo casero de antes, que convertía la coma en punto y
  // se lo daba a parseFloat: así «1.500» se leía 1,5 —el punto del millar español pasaba a
  // decimal— y con ello la app CONCEDÍA la ayuda a quien cobra por encima del tope del
  // art. 133.1.e sin ningún aviso, porque 1,50 € queda muy por debajo de los 1.000 €. El
  // navegador además normaliza la coma del teclado español al punto, así que tecleando
  // «1,500» ocurría lo mismo. Es justo el patrón que persigue `npm run check:parser`
  // (hallazgo 440).
  const alquilerCrudo = parseSpanishNumber(alquilMensual);
  /** Un negativo tecleado no es un campo vacío: hay que avisar, no pedir rellenarlo de nuevo (hallazgo 538) */
  const alquilerInvalido = Number.isFinite(alquilerCrudo) && alquilerCrudo < 0;
  const alquilerNum = Math.max(0, parseSpanishNumberOr(alquilMensual));
  const bonificacionMaxima = BONO[tipoVivienda];
  // El bono no puede superar el 60% de la renta mensual (RD 326/2026, art. 137)
  const bonificacionEfectiva = alquilerNum > 0
    ? Math.min(bonificacionMaxima, alquilerNum * LIMITE_SOBRE_RENTA)
    : bonificacionMaxima;
  // El acumulado se calcula sobre la ayuda EFECTIVA: con el tope del 60% mordiendo, el
  // total del programa es un número que este caso concreto no puede llegar a cobrar.
  const totalAyudaMax = bonificacionEfectiva * DURACION_MAX_MESES;
  const alquilerConBono = Math.max(0, alquilerNum - bonificacionEfectiva);

  /** Renta máxima del contrato para poder acceder a la ayuda (art. 133.1.e) */
  const rentaMaxima = municipioPequeno
    ? RENTA_MAX.municipioPequeno[tipoVivienda]
    : RENTA_MAX[tipoVivienda];
  /** `null` mientras no haya renta tecleada: no se puede juzgar lo que no se sabe */
  const rentaDentroDelLimite = alquilerNum > 0 ? alquilerNum <= rentaMaxima : null;

  const resultado = useMemo(() => {
    const bloqueantes = REQUISITOS.filter(r => r.bloqueante);
    const algunBloqueanteFalla = bloqueantes.some(r => estados[r.id] === 'no');
    const algunBloqueantePendiente = bloqueantes.some(r => estados[r.id] === 'pendiente');
    const todosConfirmados = REQUISITOS.every(r => estados[r.id] === 'si');
    const algunNoRecomendado = REQUISITOS.filter(r => !r.bloqueante).some(r => estados[r.id] === 'no');

    // La renta por encima del tope excluye igual que cualquier requisito imprescindible:
    // es una condición del propio RD, no un aspecto que la CA pueda matizar.
    if (rentaDentroDelLimite === false) return 'no-apto';
    if (algunBloqueanteFalla) return 'no-apto';
    if (todosConfirmados && !algunNoRecomendado && rentaDentroDelLimite === true) return 'apto';
    if (!algunBloqueantePendiente && !algunBloqueanteFalla) return 'casi';
    return 'pendiente';
  }, [estados, rentaDentroDelLimite]);

  const iconoEstado = (estado: EstadoRequisito) => {
    if (estado === 'si') return '✅';
    if (estado === 'no') return '❌';
    return '⬜';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏠</div>
        <h1 className={styles.title}>Simulador Bono Joven Alquiler</h1>
        <p className={styles.subtitle}>
          Comprueba si puedes recibir hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes
          (vivienda) o {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes (habitación) durante
          hasta {BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años
        </p>
        <p className={styles.heroLaw}>Real Decreto 326/2026, de 22 de abril · Plan Estatal de Vivienda 2026-2030</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="Bono Joven al Alquiler 2026-2030 (RD 326/2026): las cuantías son orientativas. Los requisitos concretos, límite de ingresos y condiciones específicas los fija cada Comunidad Autónoma en su convocatoria. Consulta siempre con tu CA antes de tomar decisiones económicas."
      />

      <DataReference
        normativa="Plan Estatal de Vivienda 2026-2030 · ayuda al alquiler joven"
        fuente={FISCAL_VIVIENDA_JOVEN_META.fuente}
        verificado={FISCAL_VIVIENDA_JOVEN_META.verificado}
        urlOficial={FISCAL_VIVIENDA_JOVEN_META.urlOficial}
      />

      {/* Sección de tu alquiler */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">💶</span> Tu alquiler actual</h2>

        <div className={styles.field}>
          <span className={styles.label}>¿Alquilas una vivienda completa o una habitación?</span>
          <div className={styles.tipoSelector}>
            <button
              className={`${styles.tipoBtn} ${tipoVivienda === 'vivienda' ? styles.tipoBtnActivo : ''}`}
              type="button"
              onClick={() => setTipoVivienda('vivienda')}
              aria-pressed={tipoVivienda === 'vivienda'}
            >
              <span aria-hidden="true">🏠</span> Vivienda completa{' '}
              <span className={styles.tipoBono}>hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoVivienda === 'habitacion' ? styles.tipoBtnActivo : ''}`}
              type="button"
              onClick={() => setTipoVivienda('habitacion')}
              aria-pressed={tipoVivienda === 'habitacion'}
            >
              <span aria-hidden="true">🛏️</span> Habitación (piso compartido){' '}
              <span className={styles.tipoBono}>hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes</span>
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="alquiler">Renta mensual del alquiler</label>
          <div className={styles.inputEuro}>
            <span aria-hidden="true">€</span>
            <input
              id="alquiler"
              type="number"
              inputMode="decimal"
              min={0}
              step={10}
              value={alquilMensual}
              onChange={e => setAlquilMensual(e.target.value)}
              placeholder="550"
              aria-label="Renta mensual en euros"
              aria-invalid={alquilerInvalido}
              aria-describedby={alquilerInvalido ? 'alquiler-error' : undefined}
            />
            <span>/mes</span>
          </div>
          {alquilerInvalido ? (
            <p className={styles.errorText} id="alquiler-error" role="alert">
              La renta no puede ser un importe negativo.
            </p>
          ) : (
            <span className={styles.helperText}>Introduce lo que pagas actualmente o lo que pagarás</span>
          )}
        </div>

        <div className={styles.field}>
          <button
            type="button"
            className={`${styles.tipoBtn} ${municipioPequeno ? styles.tipoBtnActivo : ''}`}
            onClick={() => setMunicipioPequeno(v => !v)}
            aria-pressed={municipioPequeno}
          >
            <span aria-hidden="true">🏘️</span> El municipio tiene 10.000 habitantes o menos
            <span className={styles.tipoBono}>renta máxima {formatCurrency(RENTA_MAX.municipioPequeno[tipoVivienda])}/mes</span>
          </button>
          <span className={styles.helperText}>
            En municipios y núcleos pequeños el Real Decreto rebaja la renta máxima que da derecho a la ayuda.
          </span>
        </div>

        {rentaDentroDelLimite === false && (
          <div className={styles.avisoRenta} role="alert">
            <span aria-hidden="true">⚠️</span>{' '}
            <strong>La renta supera el máximo que da derecho a la ayuda.</strong> Para{' '}
            {tipoVivienda === 'vivienda' ? 'una vivienda completa' : 'una habitación'}
            {municipioPequeno ? ' en un municipio de 10.000 habitantes o menos' : ''} el tope es{' '}
            {formatCurrency(rentaMaxima)}/mes (RD 326/2026, art. 133.1.e) y has introducido{' '}
            {formatCurrency(alquilerNum)}/mes. Tu comunidad autónoma puede elevar ese máximo, pero
            solo con acuerdo previo del Ministerio: compruébalo en su convocatoria.
          </div>
        )}

        {alquilerNum > 0 && resultado !== 'no-apto' && (
          <div className={styles.ahorroPanel}>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(bonificacionEfectiva)}</span>
              <span className={styles.ahorroLabel}>Ayuda mensual</span>
              {bonificacionEfectiva < bonificacionMaxima && (
                <span className={styles.ahorroNota}>Límite: 60% de la renta</span>
              )}
            </div>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(alquilerConBono)}</span>
              <span className={styles.ahorroLabel}>Tu pago real</span>
            </div>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(totalAyudaMax)}</span>
              <span className={styles.ahorroLabel}>Máximo en 4 años</span>
            </div>
          </div>
        )}
      </section>

      {/* Checklist de requisitos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">✅</span> Comprueba tus requisitos</h2>

        <div className={styles.checkGrid} role="list">
          {REQUISITOS.map(req => {
            const estado = estados[req.id];
            return (
              <div
                key={req.id}
                className={`${styles.checkCard} ${estado === 'si' ? styles.checkCardOk : estado === 'no' ? styles.checkCardFail : ''}`}
                role="listitem"
              >
                <span className={styles.checkEstado} aria-hidden="true">{iconoEstado(estado)}</span>
                <div className={styles.checkInfo}>
                  <p className={styles.checkPregunta}>{req.pregunta}</p>
                  <p className={styles.checkExplicacion}>{req.explicacion}</p>
                </div>
                {req.bloqueante && (
                  <span className={styles.badgeImprescindible} aria-label="Requisito imprescindible">IMPRESCINDIBLE</span>
                )}
                <div className={styles.radioGroup} role="group" aria-label={`Respuesta para: ${req.pregunta}`}>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${estado === 'si' ? styles.radioBtnActive : ''}`}
                    onClick={() => toggleEstado(req.id, 'si')}
                    aria-pressed={estado === 'si'}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    className={`${styles.radioBtn} ${estado === 'no' ? styles.radioBtnActive : ''}`}
                    onClick={() => toggleEstado(req.id, 'no')}
                    aria-pressed={estado === 'no'}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resultado */}
      {resultado !== 'pendiente' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Tu resultado</h2>
          {resultado === 'apto' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-apto']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">🎉</div>
              <h3 className={styles.resultadoTitulo}>¡Cumples todos los requisitos!</h3>
              <p className={styles.resultadoTexto}>
                En principio puedes solicitar el Bono Joven al Alquiler y recibir hasta <strong>{formatCurrency(bonificacionEfectiva)}/mes durante hasta {BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años</strong> ({BONO_ALQUILER_JOVEN_2026.plazo.inicialMeses / 12} años prorrogables otros {BONO_ALQUILER_JOVEN_2026.plazo.prorrogaMaximaMeses / 12}, art. 134 RD 326/2026).
                El siguiente paso es contactar con la oficina de vivienda de tu Comunidad Autónoma para tramitar la solicitud.
              </p>
            </div>
          )}
          {resultado === 'casi' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-casi']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">⚠️</div>
              <h3 className={styles.resultadoTitulo}>Cumples los requisitos básicos</h3>
              <p className={styles.resultadoTexto}>
                Cumples los requisitos obligatorios, aunque algunos aspectos adicionales (contrato registrado,
                documentación completa, disponibilidad de fondos en tu CA) pueden condicionar la aprobación final.{' '}
                {alquilerInvalido ? (
                  <>La renta que has introducido no es válida: corrígela aquí arriba para poder comprobarla contra el tope del art. 133.1.e.</>
                ) : rentaDentroDelLimite === true ? (
                  <>La renta ya está comprobada aquí arriba contra el tope del art. 133.1.e.</>
                ) : (
                  <>Falta comprobar la renta: introdúcela aquí arriba para verificarla contra el tope del art. 133.1.e.</>
                )}{' '}
                Consulta con tu Comunidad Autónoma.
              </p>
              {estados.comunidad === 'no' && (
                <p className={styles.resultadoTexto}>
                  <strong>Tu Comunidad Autónoma no tiene el Bono Joven activo ahora mismo</strong>: aunque
                  cumplas el resto de requisitos, hoy no puedes solicitarlo hasta que abra su convocatoria.
                  Los fondos y plazos varían cada año — vuelve a comprobarlo más adelante.
                </p>
              )}
            </div>
          )}
          {resultado === 'no-apto' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-no-apto']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">❌</div>
              <h3 className={styles.resultadoTitulo}>No cumples los requisitos obligatorios</h3>
              <p className={styles.resultadoTexto}>
                {rentaDentroDelLimite === false ? (
                  <>
                    La renta que has introducido ({formatCurrency(alquilerNum)}/mes) supera el máximo
                    de {formatCurrency(rentaMaxima)}/mes que da derecho a esta ayuda.
                  </>
                ) : (
                  <>Existe al menos un requisito imprescindible que no cumples.</>
                )}{' '}
                El Bono Joven al Alquiler no estaría disponible para tu situación actual.
                Consulta otras ayudas al alquiler disponibles en tu Comunidad Autónoma.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Próximos pasos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Proceso de solicitud</h2>
        <div className={styles.pasosGrid}>
          {[
            { num: '1', titulo: 'Verifica disponibilidad en tu CA', desc: 'Cada Comunidad Autónoma gestiona su propia convocatoria. Algunas están activas todo el año, otras tienen plazos específicos.' },
            { num: '2', titulo: 'Reúne la documentación', desc: 'DNI/NIE, declaración de la renta, contrato de alquiler, certificado de empadronamiento y justificante de ingresos.' },
            { num: '3', titulo: 'Presenta la solicitud', desc: 'Normalmente se tramita online a través del portal de vivienda de tu CA o presencialmente en las oficinas de vivienda.' },
            { num: '4', titulo: 'Resolución y cobro', desc: 'El plazo de resolución lo fija cada comunidad autónoma en su convocatoria: el RD 326/2026 no lo regula. Una vez aprobado, la ayuda se abona mensualmente o de forma retroactiva.' },
          ].map(paso => (
            <div key={paso.num} className={styles.pasoCard}>
              <div className={styles.pasoNum} aria-hidden="true">{paso.num}</div>
              <div className={styles.pasoInfo}>
                <h3>{paso.titulo}</h3>
                <p>{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="Guía completa del Bono Joven al Alquiler"
        subtitle="Todo lo que necesitas saber sobre esta ayuda estatal"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa: Bono Joven vs otras ayudas al alquiler</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Ayuda</th>
                  <th>Cuantía</th>
                  <th>Duración</th>
                  <th>Edad límite</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bono Joven al Alquiler 2026-2030 (estatal)</td>
                  <td>Hasta {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes (vivienda) · {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes (habitación)</td>
                  <td>Hasta {BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años ({BONO_ALQUILER_JOVEN_2026.plazo.inicialMeses / 12}+{BONO_ALQUILER_JOVEN_2026.plazo.prorrogaMaximaMeses / 12})</td>
                  <td>≤{BONO_ALQUILER_JOVEN_2026.edad.maxima} años</td>
                </tr>
                <tr>
                  <td>Ayudas al alquiler de la CA</td>
                  {/* Sin cifra: las convocatorias autonómicas fijan cuantías y duraciones
                      distintas cada año, y el «30-40 % de la renta / 1-3 años» que había aquí
                      no salía de ninguna norma ni de data/fiscal (hallazgo 598). */}
                  <td>La fija cada convocatoria autonómica</td>
                  <td>La fija cada convocatoria autonómica</td>
                  <td>Sin límite (en general)</td>
                </tr>
                <tr>
                  <td>Renta Básica de Emancipación (derogada)</td>
                  <td>210 €/mes</td>
                  <td>4 años</td>
                  <td>22-30 años</td>
                </tr>
                <tr>
                  <td>Deducción IRPF por alquiler (estatal)</td>
                  <td>Derogada (solo CCAA)</td>
                  <td>Anual</td>
                  <td>Sin límite general</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>Casos prácticos: ¿cuánto ahorras?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👩‍🎓</span>
              <h3>Recién graduada, 23 años</h3>
              <p>Alquiler de 600 €/mes (vivienda). Bono de {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes (el 50%, por debajo del límite del {BONO_ALQUILER_JOVEN_2026.limiteSobreRenta * 100}%). Paga {eur(600 - BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes real. En {BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años ahorra {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda * BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses)}.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👨‍💼</span>
              <h3>Trabajador de 32 años</h3>
              <p>Alquiler de 800 €/mes. El bono máximo es {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes (el 37,5% de la renta, dentro del límite del {BONO_ALQUILER_JOVEN_2026.limiteSobreRenta * 100}%). Paga {eur(800 - BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda)}/mes reales.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👫</span>
              <h3>Pareja joven, ambos ≤35</h3>
              <p>Solo uno de los titulares puede beneficiarse del bono. Si ambos cumplen, el bono se asigna a uno. Conviene revisar quién tiene mejor perfil para la solicitud.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏙️</span>
              <h3>Habitación en piso compartido</h3>
              <p>
                El Plan 2026-2030 incluye expresamente la modalidad de habitación: hasta{' '}
                {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes. Alquiler de 350 €/mes por
                habitación → bono de {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes
                ({formatNumber((BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion / 350) * 100, 0)}%, dentro del
                límite del {formatNumber(BONO_ALQUILER_JOVEN_2026.limiteSobreRenta * 100, 0)}%).
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Bono Joven</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Se puede pedir el bono si ya tengo contrato firmado?</h3>
              <p>Sí, en la mayoría de las CCAA puedes solicitar el Bono Joven aunque el contrato ya esté vigente. La ayuda suele ser retroactiva desde la fecha de solicitud.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si cumplo 36 años mientras cobro el bono?</h3>
              <p>El RD 326/2026 exige la edad para <strong>acceder</strong> a la ayuda (art. 133.1.b: menos de {BONO_ALQUILER_JOVEN_2026.edad.maxima} años, incluida esa edad), pero no dice qué ocurre si se cumplen {BONO_ALQUILER_JOVEN_2026.edad.maxima + 1} durante el cobro: esa es una cuestión que resuelve la convocatoria de cada comunidad autónoma, y por eso aquí no se afirma ninguna regla general. Pregúntalo en tu CA antes de contar con la prórroga, porque la renovación tras los {BONO_ALQUILER_JOVEN_2026.plazo.inicialMeses / 12} primeros años puede requerir una nueva evaluación de los requisitos.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Es compatible el bono con otras ayudas?</h3>
              <p>
                Con otras ayudas al pago del alquiler, <strong>no</strong>: el art. 136 del RD 326/2026 declara esta
                ayuda incompatible con cualquier otra destinada al pago del alquiler o de la cesión de uso de la misma
                vivienda o habitación, venga de donde venga. No es algo que decida cada comunidad. Lo que sí es otra
                cosa es la deducción autonómica del IRPF por alquiler de vivienda habitual, que no es una ayuda al
                pago sino un beneficio fiscal, y se rige por la normativa de cada región.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ocurre si cambio de piso durante el periodo de cobro?</h3>
              <p>Generalmente debes comunicarlo a la CA. Según los casos, la ayuda puede mantenerse si el nuevo piso también cumple los requisitos, o es necesario iniciar una nueva solicitud.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El propietario del piso debe cumplir algún requisito?</h3>
              <p>El RD 326/2026 no fija a nivel estatal ninguna condición sobre el propietario: solo exige que el contrato de arrendamiento esté formalizado por escrito y con la fianza depositada (art. 133.1.e). Cada Comunidad Autónoma puede añadir condiciones adicionales en su convocatoria — comprueba si la tuya restringe el parentesco entre propietario e inquilino.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tarda en resolverse la solicitud?</h3>
              <p>Depende de tu comunidad autónoma: el RD 326/2026 no fija ningún plazo de resolución, así que lo marca cada convocatoria autonómica, y conviene mirarlo en la suya. Es recomendable solicitarlo cuanto antes, porque las CCAA resuelven por orden de entrada hasta agotar los fondos asignados.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Se puede pedir si tengo contrato de habitación?</h3>
              <p>
                Sí. El Plan 2026-2030 la incluye expresamente: el art. 137 asigna a la habitación hasta{' '}
                {eur(BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.habitacion)}/mes y el art. 133.1.e le pone
                su propio tope de renta, {eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.habitacion)}/mes
                ({eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.habitacion)} en municipios
                de 10.000 habitantes o menos). Con el Plan anterior sí quedaba a criterio de cada convocatoria
                autonómica; con este ya no. El selector de arriba lo calcula.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si mis ingresos suben durante el cobro?</h3>
              <p>Algunas CCAA realizan comprobaciones periódicas de ingresos. Si superas el límite de ingresos establecido por tu CA durante el cobro, podrías perder la ayuda. Informa siempre a tu CA de cualquier cambio relevante en tu situación económica.</p>
            </div>
          </div>
        </section>

        {/* Guía pasos */}
        <section className={styles.guideSection}>
          <h2>Documentación que necesitarás</h2>
          <div className={styles.stepsGrid}>
            {[
              { n: '1', titulo: 'DNI o NIE vigente', desc: 'Documento de identidad en vigor. Si eres extranjero comunitario, también sirve el certificado de registro.' },
              { n: '2', titulo: 'Última declaración de IRPF', desc: 'O certificado de imputaciones de IRPF si no estás obligado a declarar. Justifica tus ingresos.' },
              { n: '3', titulo: 'Contrato de arrendamiento', desc: 'Copia del contrato vigente con fecha, partes, renta mensual y duración. Debe estar firmado por ambas partes.' },
              { n: '4', titulo: 'Certificado de empadronamiento', desc: 'Que acredite que el piso alquilado es tu residencia habitual. Reciente (no más de 3 meses).' },
              { n: '5', titulo: 'Datos bancarios', desc: 'Número de cuenta (IBAN) donde quieres recibir la ayuda, de titularidad del solicitante.' },
              { n: '6', titulo: 'Declaración responsable', desc: 'Formulario propio de la CA donde declaras que cumples los requisitos. Suele incluirse en el formulario de solicitud.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
                <h3>{s.titulo}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 consejos para maximizar tus posibilidades</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '⚡', titulo: 'Solicita cuanto antes', desc: 'Muchas CCAA agotan los fondos. No esperes: solicita el bono en cuanto tengas el contrato firmado.' },
              { icon: '📋', titulo: 'Prepara la documentación completa', desc: 'Una solicitud incompleta genera retrasos. Revisa la lista de documentos de tu CA antes de presentar.' },
              { icon: '🔍', titulo: 'Consulta el límite de renta de tu CA', desc: `El Real Decreto fija ${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.vivienda)}/mes para vivienda completa y ${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.habitacion)}/mes para habitación (${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.vivienda)} y ${eur(BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno.habitacion)} en municipios de 10.000 habitantes o menos). Tu CA puede elevarlo, pero solo con acuerdo previo del Ministerio.` },
              { icon: '💡', titulo: 'Comprueba la deducción autonómica IRPF', desc: 'Aparte del bono, muchas CCAA tienen deducción en el IRPF por alquiler de vivienda habitual. Esa sí es compatible, porque es un beneficio fiscal y no una ayuda al pago del alquiler, que el art. 136 declara incompatible.' },
              { icon: '📱', titulo: 'Activa notificaciones en la sede electrónica', desc: 'La CA puede pedir documentación adicional. Deja activadas las notificaciones para no perder plazos de respuesta.' },
              { icon: '🤝', titulo: 'Involucra al propietario', desc: 'El propietario puede necesitar aportar documentación (datos catastrales, etc.). Informa al arrendador con antelación.' },
            ].map(t => (
              <div key={t.icon} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Advertencias importantes</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'Los fondos son limitados y se agotan', desc: 'El Estado transfiere fondos a las CCAA, pero estos son finitos. Cada año puede haber convocatorias distintas o sin fondos disponibles.' },
              { titulo: 'Cada CA tiene sus propias condiciones', desc: 'Los requisitos, límites de renta, duración y documentación varían significativamente según tu Comunidad Autónoma. Consulta siempre la normativa específica.' },
              { titulo: 'El fraude puede conllevar devolución + sanción', desc: 'Si se detecta que no cumplías los requisitos, deberás devolver todo lo cobrado más posibles sanciones. Declara siempre tu situación real.' },
              { titulo: 'La retroactividad no está garantizada en todas las CCAA', desc: 'Algunas CCAA pagan desde la fecha de solicitud, no desde el inicio del contrato. Solicita cuanto antes para no perder mensualidades.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-bono-joven-alquiler')} />
      <ShareCard appName="simulador-bono-joven-alquiler" />
      <Footer appName="simulador-bono-joven-alquiler" />
    </div>
  );
}
