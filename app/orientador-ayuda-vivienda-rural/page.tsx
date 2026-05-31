'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorAyudaViviendaRural.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  RegionBadge,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type SiNo = 'si' | 'no' | 'pendiente';
type TipoMunicipio = 'pequeno' | 'despoblacion' | 'grande' | 'pendiente';

const AYUDA_MAX = 15000;
const PORCENTAJE = 0.20;
const PRECIO_TOPE = AYUDA_MAX / PORCENTAJE; // 75.000€

export default function OrientadorAyudaViviendaRural() {
  const [edad, setEdad] = useState<SiNo>('pendiente');
  const [primeraVivienda, setPrimeraVivienda] = useState<SiNo>('pendiente');
  const [residenciaHabitual, setResidenciaHabitual] = useState<SiNo>('pendiente');
  const [municipio, setMunicipio] = useState<TipoMunicipio>('pendiente');
  const [precioStr, setPrecioStr] = useState('');

  const precio = parseFloat(precioStr.replace(',', '.')) || 0;
  const ayudaOrientativa = precio > 0 ? Math.min(precio * PORCENTAJE, AYUDA_MAX) : AYUDA_MAX;
  const bajaTope = precio > 0 && precio < PRECIO_TOPE;

  const municipioApto = municipio === 'pequeno' || municipio === 'despoblacion';
  const bloqueante =
    edad === 'no' || primeraVivienda === 'no' || residenciaHabitual === 'no' || municipio === 'grande';
  const todosConfirmados =
    edad === 'si' && primeraVivienda === 'si' && residenciaHabitual === 'si' && municipioApto;
  const pendientes =
    edad === 'pendiente' || primeraVivienda === 'pendiente' ||
    residenciaHabitual === 'pendiente' || municipio === 'pendiente';

  const estado = useMemo(() => {
    if (bloqueante) return 'no-apto';
    if (todosConfirmados) return 'apto';
    if (!pendientes) return 'probable';
    return 'pendiente';
  }, [bloqueante, todosConfirmados, pendientes]);

  function RadioSiNo({ valor, setValor, id }: { valor: SiNo; setValor: (v: SiNo) => void; id: string }) {
    return (
      <div className={styles.radioGroup} role="group" aria-label="Respuesta">
        <button
          className={`${styles.radioBtn} ${valor === 'si' ? styles.radioBtnSi : ''}`}
          onClick={() => setValor(valor === 'si' ? 'pendiente' : 'si')}
          aria-pressed={valor === 'si'}
          id={`${id}-si`}
        >
          Sí
        </button>
        <button
          className={`${styles.radioBtn} ${valor === 'no' ? styles.radioBtnNo : ''}`}
          onClick={() => setValor(valor === 'no' ? 'pendiente' : 'no')}
          aria-pressed={valor === 'no'}
          id={`${id}-no`}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏡</div>
        <h1>Orientador Ayudas Primera Vivienda en Zona Rural</h1>
        <p className={styles.heroSub}>Plan Estatal de Vivienda 2026-2030 · Real Decreto 326/2026</p>
        <p className={styles.heroBadge}>Hasta <strong>15.000 €</strong> o el 20 % del precio · Municipios ≤ 10.000 hab</p>
      </header>

      <RegionBadge variant="es-only" />
      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="medium"
        collapsible={false}
        context="Este orientador es informativo y no vinculante. El Plan Estatal 2026-2030 (RD 326/2026) establece el marco general, pero cada Comunidad Autónoma define sus propios requisitos, importes concretos y plazos en su convocatoria. Consulta siempre la convocatoria de tu CA antes de tomar decisiones de compra."
      />

      {/* Banner convocatorias pendientes */}
      <div className={styles.bannnerPendiente} role="alert">
        <span className={styles.bannerIcon} aria-hidden="true">⏳</span>
        <div>
          <strong>Convocatorias de CCAA previstas para el 2.º semestre de 2026</strong>
          <p>El Real Decreto 326/2026 está en vigor desde el 23 de abril de 2026, pero las Comunidades Autónomas aún no han abierto sus convocatorias. Este orientador te prepara para cuando lo hagan.</p>
        </div>
      </div>

      {/* PRECIO */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>💶 Precio orientativo de la vivienda</h2>
        <div className={styles.precioField}>
          <label htmlFor="precio" className={styles.label}>Precio de compra (estimado)</label>
          <div className={styles.inputEuro}>
            <span aria-hidden="true">€</span>
            <input
              id="precio"
              type="number"
              min={0}
              step={1000}
              value={precioStr}
              onChange={e => setPrecioStr(e.target.value)}
              placeholder="80.000"
              aria-label="Precio de compra en euros"
            />
          </div>
          <span className={styles.helperText}>Introduce el precio de compra o tu estimación actual</span>
        </div>

        {precio > 0 && (
          <div className={styles.estimaPanel}>
            <div className={styles.estimaCard}>
              <span className={styles.estimaValor}>{formatCurrency(ayudaOrientativa)}</span>
              <span className={styles.estimaLabel}>Ayuda orientativa</span>
              {bajaTope && (
                <span className={styles.estimaNota}>
                  {Math.round(PORCENTAJE * 100)}% de {formatCurrency(precio)}
                  {' '}— por debajo del tope de {formatCurrency(AYUDA_MAX)}
                </span>
              )}
              {!bajaTope && precio > 0 && (
                <span className={styles.estimaNota}>Tope máximo aplicado</span>
              )}
            </div>
            <div className={styles.estimaCard}>
              <span className={styles.estimaValor}>{formatCurrency(precio - ayudaOrientativa)}</span>
              <span className={styles.estimaLabel}>Tu aportación estimada</span>
            </div>
            <div className={styles.estimaCard}>
              <span className={styles.estimaValor}>{Math.round((ayudaOrientativa / precio) * 100)} %</span>
              <span className={styles.estimaLabel}>% cubierto por la ayuda</span>
            </div>
          </div>
        )}
      </section>

      {/* REQUISITOS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>✅ Comprueba tus requisitos</h2>

        {/* Edad */}
        <div className={`${styles.reqCard} ${edad === 'si' ? styles.reqOk : edad === 'no' ? styles.reqFail : ''}`}>
          <div className={styles.reqInfo}>
            <p className={styles.reqPregunta}>Tienes 35 años o menos</p>
            <p className={styles.reqExplicacion}>El Plan 2026-2030 limita esta ayuda a jóvenes de hasta 35 años. Requisito imprescindible.</p>
          </div>
          <span className={styles.badgeReq}>IMPRESCINDIBLE</span>
          <RadioSiNo valor={edad} setValor={setEdad} id="edad" />
        </div>

        {/* Primera vivienda */}
        <div className={`${styles.reqCard} ${primeraVivienda === 'si' ? styles.reqOk : primeraVivienda === 'no' ? styles.reqFail : ''}`}>
          <div className={styles.reqInfo}>
            <p className={styles.reqPregunta}>Es tu primera vivienda en propiedad</p>
            <p className={styles.reqExplicacion}>No puedes ser titular de ninguna otra vivienda en España. La ayuda está diseñada para facilitar el acceso a la primera vivienda.</p>
          </div>
          <span className={styles.badgeReq}>IMPRESCINDIBLE</span>
          <RadioSiNo valor={primeraVivienda} setValor={setPrimeraVivienda} id="primera" />
        </div>

        {/* Municipio */}
        <div className={`${styles.reqCard} ${municipioApto ? styles.reqOk : municipio === 'grande' ? styles.reqFail : ''}`}>
          <div className={styles.reqInfo}>
            <p className={styles.reqPregunta}>El municipio tiene el tamaño requerido</p>
            <p className={styles.reqExplicacion}>Solo aplica en municipios pequeños o en proceso de despoblación. Selecciona la opción que corresponde a tu caso.</p>
          </div>
          <span className={styles.badgeReq}>IMPRESCINDIBLE</span>
          <div className={styles.municipioOpciones} role="group" aria-label="Tamaño del municipio">
            <button
              className={`${styles.municipioBtn} ${municipio === 'pequeno' ? styles.municipioBtnActivo : ''}`}
              onClick={() => setMunicipio(municipio === 'pequeno' ? 'pendiente' : 'pequeno')}
              aria-pressed={municipio === 'pequeno'}
            >
              <span className={styles.municipioBtnIcon}>🏘️</span>
              <span className={styles.municipioBtnTexto}>≤ 10.000 habitantes</span>
              <span className={styles.municipioBtnSub}>Elegible directamente</span>
            </button>
            <button
              className={`${styles.municipioBtn} ${municipio === 'despoblacion' ? styles.municipioBtnActivo : ''}`}
              onClick={() => setMunicipio(municipio === 'despoblacion' ? 'pendiente' : 'despoblacion')}
              aria-pressed={municipio === 'despoblacion'}
            >
              <span className={styles.municipioBtnIcon}>📉</span>
              <span className={styles.municipioBtnTexto}>10.001 – 20.000 hab</span>
              <span className={styles.municipioBtnSub}>Con pérdida de población (verifica en tu CA)</span>
            </button>
            <button
              className={`${styles.municipioBtn} ${municipio === 'grande' ? styles.municipioBtnGrande : ''}`}
              onClick={() => setMunicipio(municipio === 'grande' ? 'pendiente' : 'grande')}
              aria-pressed={municipio === 'grande'}
            >
              <span className={styles.municipioBtnIcon}>🏙️</span>
              <span className={styles.municipioBtnTexto}>&gt; 20.000 habitantes</span>
              <span className={styles.municipioBtnSub}>No aplica esta ayuda</span>
            </button>
          </div>
          {municipio === 'despoblacion' && (
            <p className={styles.municipioAviso}>
              ⚠️ Para municipios de 10.001-20.000 habitantes la elegibilidad depende de que tu CA lo haya incluido en la lista de municipios con pérdida de población. Verifica con tu Comunidad Autónoma.
            </p>
          )}
        </div>

        {/* Residencia habitual */}
        <div className={`${styles.reqCard} ${residenciaHabitual === 'si' ? styles.reqOk : residenciaHabitual === 'no' ? styles.reqFail : ''}`}>
          <div className={styles.reqInfo}>
            <p className={styles.reqPregunta}>Será tu residencia habitual y permanente</p>
            <p className={styles.reqExplicacion}>La vivienda debe ser tu domicilio principal. No aplica para segundas residencias, viviendas de inversión ni uso vacacional.</p>
          </div>
          <span className={styles.badgeReq}>IMPRESCINDIBLE</span>
          <RadioSiNo valor={residenciaHabitual} setValor={setResidenciaHabitual} id="residencia" />
        </div>
      </section>

      {/* RESULTADO */}
      {estado !== 'pendiente' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 Orientación sobre tu situación</h2>

          {estado === 'apto' && (
            <div className={`${styles.resultadoCard} ${styles.resultadoApto}`} role="alert" aria-live="polite">
              <div className={styles.resultadoIcon} aria-hidden="true">✅</div>
              <h3>En principio reúnes los requisitos básicos</h3>
              <p>
                Según los criterios del Plan Estatal 2026-2030, podrías optar a una ayuda orientativa de{' '}
                <strong>{formatCurrency(precio > 0 ? ayudaOrientativa : AYUDA_MAX)}</strong>
                {precio > 0 && bajaTope && ` (el 20% de ${formatCurrency(precio)})`}
                {precio > 0 && !bajaTope && ` (tope máximo)`}
                {precio === 0 && ` (hasta el 20% del precio, con tope de 15.000 €)`}.
                {' '}Recuerda: esta ayuda no es tramitable hasta que tu Comunidad Autónoma abra su convocatoria (previsto 2.º semestre 2026).
              </p>
            </div>
          )}

          {estado === 'probable' && (
            <div className={`${styles.resultadoCard} ${styles.resultadoProbable}`} role="alert" aria-live="polite">
              <div className={styles.resultadoIcon} aria-hidden="true">⚠️</div>
              <h3>Cumples los requisitos obligatorios</h3>
              <p>
                Los requisitos imprescindibles están cubiertos. Consulta la convocatoria de tu Comunidad Autónoma cuando se abra (previsto 2.º semestre 2026) para conocer los requisitos y documentación específicos.
              </p>
            </div>
          )}

          {estado === 'no-apto' && (
            <div className={`${styles.resultadoCard} ${styles.resultadoNoApto}`} role="alert" aria-live="polite">
              <div className={styles.resultadoIcon} aria-hidden="true">❌</div>
              <h3>No reunirías los requisitos para esta ayuda específica</h3>
              <p>
                Hay al menos un requisito imprescindible que no se cumple para esta ayuda concreta. Consulta el simulador del Bono Joven al Alquiler u otras ayudas al acceso a la vivienda de tu Comunidad Autónoma.
              </p>
            </div>
          )}
        </section>
      )}

      {/* PRÓXIMOS PASOS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📋 ¿Qué puedo hacer ahora?</h2>
        <div className={styles.pasosGrid}>
          {[
            { num: '1', titulo: 'Guarda esta orientación', desc: 'Anota los requisitos que cumples y la estimación de ayuda. Te será útil cuando tu CA abra la convocatoria.' },
            { num: '2', titulo: 'Suscríbete al portal de vivienda de tu CA', desc: 'Activa alertas o notificaciones en la web de la consejería de vivienda de tu Comunidad Autónoma para saber cuándo se abre la convocatoria.' },
            { num: '3', titulo: 'Prepara la documentación con antelación', desc: 'DNI/NIE, certificado de empadronamiento, declaración de la renta, nota simple del Registro de la Propiedad que acredite que no eres propietario.' },
            { num: '4', titulo: 'Cuando se abra: solicita cuanto antes', desc: 'Los fondos son limitados. Las primeras convocatorias suelen agotarse. Tener la documentación lista permite presentar la solicitud el primer día.' },
          ].map(paso => (
            <div key={paso.num} className={styles.pasoCard}>
              <div className={styles.pasoNum} aria-hidden="true">{paso.num}</div>
              <div>
                <h3>{paso.titulo}</h3>
                <p>{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection title="Ayudas a la primera vivienda rural: contexto y claves del Plan 2026-2030">
        <p>
          El Plan Estatal de Vivienda 2026-2030 (Real Decreto 326/2026, de 22 de abril) introduce por primera vez
          una línea de ayudas específica para la compra o autoconstrucción de primera vivienda en municipios pequeños.
          La medida responde a la presión inmobiliaria en las grandes ciudades y al proceso de despoblación rural
          que afecta a miles de municipios españoles.
        </p>
        <p>
          La fórmula de la ayuda es sencilla: hasta el 20 % del precio de compra, con un tope máximo de 15.000 €.
          Esto significa que solo a partir de un precio de 75.000 € se alcanza el tope; para viviendas más económicas
          (muy habituales en la España rural), el importe será el 20 % del precio real.
        </p>

        {/* TABLA COMPARATIVA */}
        <h3>Ejemplos orientativos según el precio de compra</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Precio de compra</th>
                <th>20 % del precio</th>
                <th>Ayuda orientativa</th>
                <th>Tu aportación estimada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>30.000 €</td>
                <td>6.000 €</td>
                <td><strong>6.000 €</strong></td>
                <td>24.000 €</td>
              </tr>
              <tr>
                <td>50.000 €</td>
                <td>10.000 €</td>
                <td><strong>10.000 €</strong></td>
                <td>40.000 €</td>
              </tr>
              <tr>
                <td>75.000 €</td>
                <td>15.000 €</td>
                <td><strong>15.000 €</strong> ← tope exacto</td>
                <td>60.000 €</td>
              </tr>
              <tr>
                <td>100.000 €</td>
                <td>20.000 € → tope</td>
                <td><strong>15.000 €</strong></td>
                <td>85.000 €</td>
              </tr>
              <tr>
                <td>150.000 €</td>
                <td>30.000 € → tope</td>
                <td><strong>15.000 €</strong></td>
                <td>135.000 €</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ESCENARIOS */}
        <h3>Perfiles que pueden beneficiarse</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>👩‍💻</span>
            <h4>Teletrabajador/a, 29 años</h4>
            <p>Trabaja 100% remoto desde Madrid. Quiere mudarse a un pueblo de 3.000 habitantes. Vivienda de 80.000 €: ayuda orientativa de 15.000 € + puede conservar el salario urbano.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>👨‍🌾</span>
            <h4>Joven retornando al pueblo, 32 años</h4>
            <p>Vuelve al municipio de sus padres (8.000 hab) para trabajar en el sector agrario. Vivienda de 45.000 €: ayuda orientativa de 9.000 € (el 20%).</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>👫</span>
            <h4>Pareja joven, ambos ≤ 35</h4>
            <p>Solo uno de los titulares puede solicitar la ayuda por vivienda. Conviene analizar quién presenta mejor perfil para la solicitud ante la CA.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span style={{ fontSize: '1.5rem' }}>🏗️</span>
            <h4>Autoconstrucción o rehabilitación</h4>
            <p>El Plan también contempla autopromoción (construcción propia). Si el precio del proyecto es de 60.000 €: ayuda orientativa de 12.000 €. Consultar los detalles en la convocatoria de tu CA.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cómo sé si mi municipio entra en la zona de 10.001-20.000 habitantes con pérdida de población?</h4>
            <p>El criterio de "pérdida de población" se determina comparando el padrón municipal actual con el de años anteriores (normalmente usando las cifras del INE). Cada Comunidad Autónoma elaborará su propia lista de municipios elegibles en esta franja. Cuando tu CA publique la convocatoria, incluirá el listado concreto o los criterios exactos.</p>
            <div className={styles.faqTip}>Puedes consultar la evolución de población de cualquier municipio en el INE: ine.es/dyngs/INEbase → Demografía y población → Padrón municipal.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Es compatible esta ayuda con una hipoteca?</h4>
            <p>En principio sí: la ayuda reduce el precio efectivo de la vivienda y puede complementarse con financiación hipotecaria. De hecho, para la mayoría de compradores la hipoteca cubrirá el resto del precio tras la ayuda. Las CCAA pueden establecer condiciones específicas sobre compatibilidad en sus convocatorias.</p>
            <div className={styles.faqTip}>Una ayuda de 15.000 € puede suponer que la hipoteca se contraiga por un importe 15.000 € menor, ahorrando también los intereses sobre esa cantidad durante toda la vida del préstamo.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Hay un límite máximo de precio de la vivienda para acceder a la ayuda?</h4>
            <p>El Plan Estatal 2026-2030 no establece un precio máximo general en las fuentes disponibles. Sin embargo, las CCAA pueden introducir un precio máximo de compra en sus convocatorias. Este es uno de los parámetros que habrá que verificar cuando se publiquen las convocatorias autonómicas.</p>
            <div className={styles.faqTip}>En zonas rurales, los precios de vivienda suelen estar muy por debajo de los de las grandes ciudades, por lo que la mayoría de las operaciones probablemente estén dentro de los rangos que fijen las CCAA.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Hay límite de ingresos para pedir la ayuda?</h4>
            <p>Las fuentes disponibles no especifican un límite de ingresos general para esta ayuda específica (a diferencia del Bono Joven de Alquiler, que sí tiene límite de ingresos). Es posible que cada CA establezca sus propios umbrales de ingresos en sus convocatorias. Habrá que verificarlo cuando se publiquen.</p>
            <div className={styles.faqTip}>La ausencia de límite de ingresos en el marco estatal no garantiza que las CCAA no lo introduzcan. Es uno de los aspectos más importantes a verificar en la convocatoria autonómica.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa si ya tengo contrato de arras pero la convocatoria no ha abierto?</h4>
            <p>El momento de referencia para la elegibilidad suele ser la fecha de firma de la escritura pública de compraventa, no el contrato de arras. Cuando la CA abra su convocatoria, indicará el período de operaciones elegibles. Conviene no cerrar la operación antes de conocer los requisitos exactos si el calendario lo permite.</p>
            <div className={styles.faqTip}>Consulta con un asesor inmobiliario o jurídico si ya tienes arras firmadas y necesitas sincronizar el calendario de compra con la apertura de la convocatoria.</div>
          </div>
        </div>

        {/* PASOS */}
        <h3>Preparación antes de que abran las convocatorias</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Verifica el tamaño de tu municipio objetivo</h4>
              <p>Consulta la cifra oficial del padrón municipal en el INE (ine.es). Si tiene entre 10.001 y 20.000 habitantes, localiza si aparece en las estadísticas de pérdida de población y anota el dato.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Obtén una nota simple del Registro de la Propiedad</h4>
              <p>Acredita que no eres titular de ninguna vivienda en España. Puedes pedirla telemáticamente en registradores.org. Es válida durante meses y será necesaria en la solicitud.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Activa alertas en el portal de vivienda de tu CA</h4>
              <p>Suscríbete a las notificaciones de la consejería de vivienda de tu Comunidad Autónoma. También puedes seguir el BOE autonómico (BOCA, DOGC, BOCM, etc.) para detectar la publicación de la convocatoria.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Prepara la última declaración de la renta</h4>
              <p>Aunque el límite de ingresos no está definido aún a nivel estatal, la mayoría de convocatorias de ayudas de vivienda requieren justificar ingresos mediante el IRPF. Tenla a mano.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Negocia con el vendedor teniendo en cuenta la ayuda</h4>
              <p>Si la ayuda puede cubrir hasta 15.000 € del precio, puedes estructurar la operación con una entrada menor mientras llega la resolución. Algunos propietarios en zonas rurales son flexibles con los plazos.</p>
            </div>
          </div>
        </div>

        {/* TIPS */}
        <h3>Lo que conviene saber</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📐</span>
            <p>El punto de inflexión es <strong>75.000 €</strong>: por encima de ese precio, la ayuda siempre es 15.000 € (el tope). Por debajo, es el 20% del precio. Muchas viviendas rurales están por debajo de ese umbral.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔗</span>
            <p>Esta ayuda es <strong>compatible con el Bono Joven de Alquiler</strong> si primero alquilas mientras buscas vivienda para comprar. Son programas independientes del mismo Plan Estatal.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💡</span>
            <p>Aparte de esta ayuda estatal, muchas <strong>CCAA y Diputaciones</strong> tienen programas propios de ayuda a la compra en zonas rurales: Aragón, Castilla y León, Extremadura o Castilla-La Mancha son especialmente activas en este ámbito.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📅</span>
            <p>Los fondos estatales se transfieren a las CCAA, que los gestionan de forma independiente. <strong>No todas abrirán convocatoria al mismo tiempo</strong> ni con los mismos importes. Verifica el estado de tu CA específica.</p>
          </div>
        </div>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            Aspectos críticos que no debes pasar por alto
          </div>
          <ul className={styles.warningList}>
            <li><strong>No es tramitable todavía en la mayoría de CCAA:</strong> el RD 326/2026 establece el marco, pero las convocatorias autonómicas — donde se presentan las solicitudes — están previstas para el 2.º semestre de 2026. Espera a que tu CA la publique.</li>
            <li><strong>Los fondos son limitados:</strong> como en todos los planes estatales de vivienda, los fondos se agotan por orden de solicitud. Cuando abra la convocatoria de tu CA, solicita cuanto antes.</li>
            <li><strong>Municipios 10.001-20.000 hab: verifica antes de decidir:</strong> si tu municipio está en esta franja, no asumas que está incluido. Necesitas confirmación expresa de tu CA antes de dar por buena la elegibilidad.</li>
            <li><strong>El importe es orientativo hasta la resolución:</strong> los 15.000 € (o el 20%) son el marco estatal; cada CA puede concretar importes distintos dentro de ese límite. La resolución de tu solicitud determinará el importe final.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-ayuda-vivienda-rural')} />
      <ShareCard appName="orientador-ayuda-vivienda-rural" />
      <Footer appName="orientador-ayuda-vivienda-rural" />
    </div>
  );
}
