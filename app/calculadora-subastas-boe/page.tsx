'use client';
// @disclaimer: NO — DisclaimerCard severity="critical" (fiscal España: ITP)

import { useMemo, useState } from 'react';
import styles from './CalculadoraSubastasBoe.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  ResultCard,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  ShareCard,
  RegionBadge,
} from '@/components';
import { formatCurrency, formatNumber, formatPercentage, parseSpanishNumber } from '@/lib';
import {
  FISCAL_SUBASTAS_META,
  DEPOSITO_SUBASTA,
  PLAZO_PAGO_SUBASTA,
  UMBRALES_REMATE_JUDICIAL,
  PUJA_MINIMA_AEAT,
  POSTURA_VERBAL_MINIMA_SS,
  AFECCION_COMUNIDAD_ANIOS_ANTERIORES,
  PLAZO_ITP,
} from '@/data/fiscal';
import { ENLACE_CATASTRO, nombreEnFrase, superaElTope, type ComunidadAutonoma, type PerfilComprador } from '@/data/itp-ccaa';
import {
  calcularSubasta,
  rigeReforma,
  TERRITORIOS_FORALES_ITP,
  type InicioProcedimiento,
  type ModalidadSeguridadSocial,
  type PartidaPendiente,
  type RegimenSubasta,
  type ResultadoSubasta,
  type TipoDeudor,
} from './motor';
import { PREGUNTAS_FRECUENTES } from './metadata';

const REGIMENES: { value: RegimenSubasta; label: string; detalle: string }[] = [
  { value: 'judicial', label: 'Judicial', detalle: 'La convoca un juzgado' },
  { value: 'aeat', label: 'Agencia Tributaria', detalle: 'Embargo de Hacienda' },
  { value: 'seguridad-social', label: 'Seguridad Social', detalle: 'Embargo a un deudor' },
];

const COMUNIDADES: { value: ComunidadAutonoma; label: string }[] = [
  { value: 'andalucia', label: 'Andalucía' },
  { value: 'aragon', label: 'Aragón' },
  { value: 'asturias', label: 'Asturias' },
  { value: 'baleares', label: 'Islas Baleares' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'cantabria', label: 'Cantabria' },
  { value: 'castilla-leon', label: 'Castilla y León' },
  { value: 'castilla-mancha', label: 'Castilla-La Mancha' },
  { value: 'cataluna', label: 'Cataluña' },
  { value: 'valencia', label: 'Comunidad Valenciana' },
  { value: 'extremadura', label: 'Extremadura' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'madrid', label: 'Comunidad de Madrid' },
  { value: 'murcia', label: 'Región de Murcia' },
  { value: 'navarra', label: 'Navarra' },
  { value: 'pais-vasco', label: 'País Vasco' },
  { value: 'rioja', label: 'La Rioja' },
  { value: 'ceuta', label: 'Ceuta' },
  { value: 'melilla', label: 'Melilla' },
];

const PERFILES_COMPRADOR: { value: PerfilComprador; label: string }[] = [
  { value: 'general', label: 'General (sin bonificaciones)' },
  { value: 'joven', label: 'Joven (la edad límite depende de la comunidad)' },
  { value: 'familia-numerosa', label: 'Familia numerosa' },
  { value: 'discapacidad', label: 'Persona con discapacidad' },
];

const pct = (n: number, decimales = 0): string => formatPercentage(n / 100, decimales);
/** Los textos de los tipos reducidos llegan de data/ con el `%` pegado o con espacio normal: se
 * separa con espacio duro al pintarlos (CLAUDE.md global §2), sin tocar los datos compartidos. */
const separarPorcentajes = (texto: string): string => texto.replace(/(\d)[  ]?%/g, '$1 %');

/**
 * Un importe opcional: vacío es «no lo sé» (null), y lo que no se lee es un error que se dice en
 * el campo y tampoco entra en el total. Escribir 0 es «no hay».
 */
interface Importe {
  valor: number | null;
  error: boolean;
}
function leerImporte(texto: string): Importe {
  if (texto.trim() === '') return { valor: null, error: false };
  const n = parseSpanishNumber(texto);
  if (!Number.isFinite(n) || n < 0) return { valor: null, error: true };
  return { valor: n, error: false };
}
const ERROR_IMPORTE = 'No se entiende ese importe: escribe una cifra como 1.500 o 1500,50.';

/** Qué falta para que el total sea completo, y dónde se mira. */
function textoPendiente(p: PartidaPendiente, r: ResultadoSubasta, ccaa: ComunidadAutonoma): React.ReactNode {
  switch (p) {
    case 'cargas':
      return (
        <>
          <strong>Cargas anteriores.</strong> Las que estén inscritas antes de la que se ejecuta siguen sobre
          la vivienda y las asumes (art. 670.5 LEC). Vienen en la certificación de cargas que acompaña al anuncio.
        </>
      );
    case 'comunidad':
      return (
        <>
          <strong>Deudas con la comunidad.</strong> La vivienda responde de las cuotas impagadas del año de la
          compra y los {AFECCION_COMUNIDAD_ANIOS_ANTERIORES} años anteriores (art. 9 de la Ley de Propiedad
          Horizontal). Pregunta el importe a la administración de la finca.
        </>
      );
    case 'ibi':
      return (
        <>
          <strong>IBI pendiente.</strong> La vivienda queda afecta al impuesto que dejó sin pagar el anterior
          titular (art. 64 de la Ley de Haciendas Locales). Lo informa el ayuntamiento.
        </>
      );
    case 'valor-referencia':
      return (
        <>
          <strong>Valor de referencia.</strong> Sin él no se puede calcular el ITP, porque es su base mínima.
          Consúltalo en la{' '}
          <a href={ENLACE_CATASTRO} target="_blank" rel="noopener noreferrer">
            Sede Electrónica del Catastro
          </a>{' '}
          con la referencia catastral que figura en el anuncio.
        </>
      );
    case 'impuesto-deudor':
      return (
        <>
          <strong>El impuesto de la compra.</strong> Si el deudor es una empresa y la vivienda formaba parte de
          su actividad, la venta puede llevar IVA en lugar de ITP, con reglas que dependen de si es nueva o no.
          Este caso lo debe mirar un asesor fiscal antes de pujar.
          {r.itpSiParticular !== null && (
            <span key="itp-particular">
              {' '}
              Si el deudor resulta ser un particular, el ITP sería de {formatCurrency(r.itpSiParticular)}.
            </span>
          )}
        </>
      );
    case 'impuesto-foral':
      return (
        <>
          <strong>ITP en {nombreEnFrase(ccaa)}.</strong> La base del impuesto la fija su norma foral, no el valor de
          referencia del Catastro estatal, y no la tenemos verificada para las subastas. Pregunta a la hacienda
          foral o a un asesor.
        </>
      );
  }
}

export default function CalculadoraSubastasBoePage() {
  const [regimen, setRegimen] = useState<RegimenSubasta>('judicial');
  const [inicio, setInicio] = useState<InicioProcedimiento>('desde-reforma');
  const [modalidadSS, setModalidadSS] = useState<ModalidadSeguridadSocial>('sobre');
  const [valorSubastaTxt, setValorSubastaTxt] = useState('200000');
  const [pujaTxt, setPujaTxt] = useState('150000');
  const [ccaa, setCcaa] = useState<ComunidadAutonoma>('madrid');
  const [perfil, setPerfil] = useState<PerfilComprador>('general');
  const [viviendaHabitual, setViviendaHabitual] = useState(false);
  const [valorReferenciaTxt, setValorReferenciaTxt] = useState('');
  const [deudor, setDeudor] = useState<TipoDeudor>('particular');
  const [cargasTxt, setCargasTxt] = useState('');
  const [comunidadTxt, setComunidadTxt] = useState('');
  const [ibiTxt, setIbiTxt] = useState('');
  const [otrosTxt, setOtrosTxt] = useState('');

  const valorSubasta = leerImporte(valorSubastaTxt);
  const puja = leerImporte(pujaTxt);
  const valorReferencia = leerImporte(valorReferenciaTxt);
  const cargas = leerImporte(cargasTxt);
  const comunidad = leerImporte(comunidadTxt);
  const ibi = leerImporte(ibiTxt);
  const otros = leerImporte(otrosTxt);
  const esForal = TERRITORIOS_FORALES_ITP.includes(ccaa);

  const faltaBase =
    valorSubasta.valor === null || valorSubasta.valor <= 0 || puja.valor === null || puja.valor <= 0;

  const resultado = useMemo<ResultadoSubasta | null>(() => {
    if (valorSubasta.valor === null || valorSubasta.valor <= 0 || puja.valor === null || puja.valor <= 0) return null;
    return calcularSubasta({
      regimen,
      inicio,
      modalidadSS,
      valorSubasta: valorSubasta.valor,
      puja: puja.valor,
      ccaa,
      perfil,
      viviendaHabitual,
      valorReferencia: valorReferencia.valor,
      deudor,
      cargasAnteriores: cargas.valor,
      deudaComunidad: comunidad.valor,
      deudaIbi: ibi.valor,
      otrosGastos: otros.valor ?? 0,
    });
  }, [regimen, inicio, modalidadSS, valorSubasta.valor, puja.valor, ccaa, perfil, viviendaHabitual, valorReferencia.valor, deudor, cargas.valor, comunidad.valor, ibi.valor, otros.valor]);

  const etiquetaValor = regimen === 'judicial' ? 'Valor de subasta' : 'Tipo de subasta';
  const reformaRige = rigeReforma(inicio);

  return (
    <>
      {/* El JSON-LD (WebApplication + FAQPage) lo inyecta layout.tsx: no repetirlo aquí. */}
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🔨</span> Calculadora de Subastas del BOE
          </h1>
          <p className={styles.subtitle}>
            Depósito para pujar, plazo para pagar el resto y coste total de comprar una vivienda en subasta
            judicial, de Hacienda o de la Seguridad Social
          </p>
        </header>

        <RegionBadge variant="es-only" />

        <LegalNotice />

        <div className={styles.mainContent}>
          <section className={styles.inputPanel} aria-labelledby="titulo-datos">
            <h2 id="titulo-datos" className={styles.panelTitle}>Datos de la subasta</h2>

            <fieldset className={styles.fieldset}>
              <legend className={styles.label}>¿Quién subasta la vivienda?</legend>
              <div className={styles.regimenGrid}>
                {REGIMENES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    aria-pressed={regimen === r.value}
                    className={`${styles.regimenBtn} ${regimen === r.value ? styles.regimenBtnActivo : ''}`}
                    onClick={() => setRegimen(r.value)}
                  >
                    <span className={styles.regimenNombre}>{r.label}</span>
                    <span className={styles.regimenDetalle}>{r.detalle}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {regimen === 'judicial' && (
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="select-inicio">
                  ¿Cuándo empezó el procedimiento judicial?
                </label>
                <select
                  id="select-inicio"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value as InicioProcedimiento)}
                  className={styles.select}
                >
                  <option value="desde-reforma">El 3 de abril de 2025 o después</option>
                  <option value="antes-reforma">Antes del 3 de abril de 2025</option>
                  <option value="no-lo-se">No lo sé</option>
                </select>
                <p className={styles.ayuda}>
                  La reforma de la LO 1/2025 solo rige en los procedimientos iniciados desde esa fecha. El anuncio del
                  Portal de Subastas indica el importe del depósito: si es el {pct(DEPOSITO_SUBASTA.judicial.porcentaje)} del
                  valor, se aplican las reglas nuevas.
                </p>
              </div>
            )}

            {regimen === 'seguridad-social' && (
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="select-modalidad">
                  ¿Cómo vas a pujar?
                </label>
                <select
                  id="select-modalidad"
                  value={modalidadSS}
                  onChange={(e) => setModalidadSS(e.target.value as ModalidadSeguridadSocial)}
                  className={styles.select}
                >
                  <option value="sobre">Oferta en sobre cerrado, antes del acto</option>
                  <option value="en-el-acto">De viva voz, en el acto de la subasta</option>
                </select>
              </div>
            )}

            <NumberInput
              value={valorSubastaTxt}
              onChange={setValorSubastaTxt}
              label={`${etiquetaValor} (€)`}
              placeholder="200.000"
              helperText={
                regimen === 'judicial'
                  ? 'Figura en el anuncio como «Valor subasta».'
                  : 'Figura en el anuncio como «Tipo de subasta».'
              }
              error={valorSubasta.error ? ERROR_IMPORTE : undefined}
            />

            <NumberInput
              value={pujaTxt}
              onChange={setPujaTxt}
              label="Lo que piensas pujar (€)"
              placeholder="150.000"
              error={puja.error ? ERROR_IMPORTE : undefined}
            />

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="select-ccaa">
                Comunidad autónoma de la vivienda
              </label>
              <select
                id="select-ccaa"
                value={ccaa}
                onChange={(e) => setCcaa(e.target.value as ComunidadAutonoma)}
                className={styles.select}
              >
                {COMUNIDADES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {!esForal && (
              <NumberInput
                value={valorReferenciaTxt}
                onChange={setValorReferenciaTxt}
                label="Valor de referencia del Catastro (€)"
                placeholder="Déjalo vacío si no lo sabes"
                helperText="Es la base mínima del ITP. Se consulta en la Sede Electrónica del Catastro con la referencia catastral del anuncio."
                error={valorReferencia.error ? ERROR_IMPORTE : undefined}
              />
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="select-deudor">
                ¿El deudor es un particular o una empresa?
              </label>
              <select
                id="select-deudor"
                value={deudor}
                onChange={(e) => setDeudor(e.target.value as TipoDeudor)}
                className={styles.select}
              >
                <option value="particular">Un particular</option>
                <option value="empresa">Una empresa o profesional</option>
                <option value="no-lo-se">No lo sé</option>
              </select>
              <p className={styles.ayuda}>Si es una empresa, la compra puede llevar IVA en vez de ITP.</p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="select-perfil">
                Tu perfil como comprador (para el ITP)
              </label>
              <select
                id="select-perfil"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as PerfilComprador)}
                className={styles.select}
              >
                {PERFILES_COMPRADOR.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={viviendaHabitual}
                  onChange={(e) => setViviendaHabitual(e.target.checked)}
                />
                Será mi vivienda habitual
              </label>
            </div>

            <h3 className={styles.subTitle}>Lo que arrastra la vivienda</h3>
            <p className={styles.ayuda}>
              Deja el campo vacío si no lo sabes y escribe 0 si no hay. Lo que dejes vacío no entra en el total, y
              el total te dirá que está incompleto.
            </p>

            <NumberInput
              value={cargasTxt}
              onChange={setCargasTxt}
              label="Cargas anteriores que asumes (€)"
              placeholder="Vacío si no lo sabes"
              helperText="Hipotecas o embargos inscritos antes del que se ejecuta: certificación de cargas del anuncio."
              error={cargas.error ? ERROR_IMPORTE : undefined}
            />
            <NumberInput
              value={comunidadTxt}
              onChange={setComunidadTxt}
              label="Deudas con la comunidad de propietarios (€)"
              placeholder="Vacío si no lo sabes"
              error={comunidad.error ? ERROR_IMPORTE : undefined}
            />
            <NumberInput
              value={ibiTxt}
              onChange={setIbiTxt}
              label="IBI pendiente (€)"
              placeholder="Vacío si no lo sabes"
              error={ibi.error ? ERROR_IMPORTE : undefined}
            />
            <NumberInput
              value={otrosTxt}
              onChange={setOtrosTxt}
              label="Otros gastos que prevés (€, opcional)"
              placeholder="Abogado, cerrajero, reformas…"
              error={otros.error ? ERROR_IMPORTE : undefined}
            />
          </section>

          <section className={styles.resultsPanel} aria-labelledby="titulo-resultados" aria-live="polite">
            <h2 id="titulo-resultados" className={styles.panelTitle}>Resultado</h2>

            {faltaBase || !resultado ? (
              <p className={styles.vacio}>
                Escribe el {etiquetaValor.toLowerCase()} y lo que piensas pujar para ver el depósito, el plazo y el
                coste.
              </p>
            ) : (
              <Resultados resultado={resultado} regimen={regimen} reformaRige={reformaRige} ccaa={ccaa} />
            )}
          </section>
        </div>

        <DisclaimerCard variant="financial" severity="critical" collapsible={false} context="calculadora-subastas-boe" />
        <DataReference
          normativa="Subastas judiciales, de Hacienda y de la Seguridad Social"
          fuente={FISCAL_SUBASTAS_META.fuente}
          verificado={FISCAL_SUBASTAS_META.verificado}
          urlOficial={FISCAL_SUBASTAS_META.urlOficial}
          nota={FISCAL_SUBASTAS_META.nota}
        />

        <EducationalSection
          icon="📚"
          title="Cómo funcionan las subastas de vivienda"
          subtitle="Reglas de cada subasta, procedimiento paso a paso y errores frecuentes"
        >
          <section className={styles.guideSection}>
            <h2>Las tres subastas, comparadas</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Subasta</th>
                    <th scope="col">Dónde se anuncia</th>
                    <th scope="col">Depósito</th>
                    <th scope="col">Plazo para pagar el resto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Judicial desde el 03/04/2025</th>
                    <td>Portal de Subastas del BOE</td>
                    <td>
                      {pct(DEPOSITO_SUBASTA.judicial.porcentaje)} del valor, mínimo{' '}
                      {formatCurrency(DEPOSITO_SUBASTA.judicial.minimo)}
                    </td>
                    <td>
                      {PLAZO_PAGO_SUBASTA.judicial.dias} días {PLAZO_PAGO_SUBASTA.judicial.computo}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Judicial anterior</th>
                    <td>Portal de Subastas del BOE</td>
                    <td>{pct(DEPOSITO_SUBASTA.judicialAnterior.porcentaje)} del valor</td>
                    <td>
                      {PLAZO_PAGO_SUBASTA.judicialAnterior.dias} días {PLAZO_PAGO_SUBASTA.judicialAnterior.computo}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Agencia Tributaria</th>
                    <td>Portal de Subastas del BOE</td>
                    <td>{pct(DEPOSITO_SUBASTA.aeat.porcentaje)} del tipo</td>
                    <td>
                      {PLAZO_PAGO_SUBASTA.aeat.dias} días {PLAZO_PAGO_SUBASTA.aeat.computo}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Seguridad Social (embargo)</th>
                    <td>Tablón de anuncios de la Seguridad Social</td>
                    <td>
                      {pct(DEPOSITO_SUBASTA.seguridadSocialSobre.porcentaje)} del tipo en sobre cerrado,{' '}
                      {pct(DEPOSITO_SUBASTA.seguridadSocialEnElActo.porcentaje)} en el acto
                    </td>
                    <td>
                      {PLAZO_PAGO_SUBASTA.seguridadSocial.dias} días {PLAZO_PAGO_SUBASTA.seguridadSocial.computo}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              En todas, quien no paga el resto a tiempo pierde el depósito. La subasta notarial y la de inmuebles
              propios de la Tesorería de la Seguridad Social no están aquí: cada una se rige por su pliego de
              condiciones.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Qué asumes al comprar en subasta</h2>
            <p>
              Por el mero hecho de pujar aceptas la titulación que consta en el procedimiento y te subrogas en las
              cargas anteriores a la que se ejecuta (art. 669.2 LEC). La que se ejecuta y las posteriores se
              cancelan; las anteriores siguen. Por eso una hipoteca anterior de 50.000 € convierte una puja de
              100.000 € en una compra de 150.000 €.
            </p>
            <p>
              Además, la vivienda responde de las cuotas de comunidad impagadas del año de la compra y los{' '}
              {AFECCION_COMUNIDAD_ANIOS_ANTERIORES} anteriores (art. 9 de la Ley de Propiedad Horizontal) y del IBI
              que quedó sin pagar.
            </p>
            <p>
              El ITP no se paga sobre lo que pujas, sino sobre el valor de referencia del Catastro cuando tu puja
              queda por debajo (art. 10.2 de la ley del impuesto; Dirección General de Tributos, consulta V0453-22).
              Su plazo general es de {PLAZO_ITP.dias} {PLAZO_ITP.unidad} ({PLAZO_ITP.baseNormativa}), aunque algunas
              comunidades fijan el suyo.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Si la vivienda está ocupada</h2>
            <p>
              Si no está ocupada, el juzgado te pone en posesión si lo pides. Si lo está, puedes pedir al juzgado el
              lanzamiento de los ocupantes sin título suficiente en el plazo de un año desde la adquisición; pasado
              ese año, tendrás que acudir al juicio que corresponda (art. 675 LEC). Cuánto tarda y cuánto cuesta
              depende de cada caso: ninguna calculadora puede ponerle cifra, y es la parte en la que más conviene
              un abogado.
            </p>
          </section>

          <section className={styles.guideSection}>
            <h2>Quién suele usar esta calculadora</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🏠</span> Quien busca su vivienda
                </h3>
                <p>
                  Quiere saber cuánto dinero ha de tener listo antes de pujar y en las semanas siguientes, y si el
                  ITP sobre el valor de referencia se come el descuento de la subasta.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">📊</span> Quien compara varias subastas
                </h3>
                <p>
                  Pasa por la calculadora cada anuncio con su valor, sus cargas y sus deudas para ver cuál sale de
                  verdad más barato.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">⚖️</span> Una subasta de un procedimiento antiguo
                </h3>
                <p>
                  Un procedimiento iniciado antes del 3 de abril de 2025 sigue con el depósito del{' '}
                  {pct(DEPOSITO_SUBASTA.judicialAnterior.porcentaje)} y {PLAZO_PAGO_SUBASTA.judicialAnterior.dias} días
                  para pagar, aunque la subasta se celebre hoy.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🎓</span> Quien aprende cómo funciona
                </h3>
                <p>
                  Prueba distintas pujas para ver en qué porcentaje del valor se aprueba el remate y qué puede pasar
                  por debajo.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Paso a paso</h2>
            <ol className={styles.stepGuide}>
              {[
                ['Localiza el anuncio', 'Las judiciales y las de Hacienda están en el Portal de Subastas del BOE; las de la Seguridad Social por embargo, en su tablón de anuncios.'],
                ['Lee la certificación de cargas y el edicto', 'Ahí están las cargas anteriores que asumirás, la situación posesoria si consta y las condiciones particulares.'],
                ['Averigua lo que no dice el anuncio', 'El valor de referencia en el Catastro, las deudas con la comunidad y el IBI pendiente.'],
                ['Calcula aquí', 'Con tu puja, mira el depósito, el resto y su plazo, y el coste total con lo que hayas podido averiguar.'],
                ['Constituye el depósito y puja', 'El depósito se hace antes de pujar. Si no ganas, se devuelve; si te reservas la postura, queda retenido hasta que pague el ganador.'],
                ['Paga el resto en plazo', 'Si vas a financiar con hipoteca, en la judicial puedes pedir el testimonio del decreto de aprobación del remate para constituirla: esa petición suspende el plazo de pago (art. 670.6 LEC).'],
                ['Liquida el ITP e inscribe', 'Con el decreto o la certificación de adjudicación se paga el ITP y se inscribe la vivienda en el Registro de la Propiedad.'],
              ].map(([titulo, texto], i) => (
                <li key={titulo} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className={styles.stepContent}>
                    <h3>{titulo}</h3>
                    <p>{texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.guideSection}>
            <h2>Buenas prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💶</span>
                <p>Ten el dinero del resto disponible antes de pujar: el plazo puede ser de solo 5 días hábiles.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📄</span>
                <p>Pide nota simple actualizada al Registro: la certificación de cargas puede tener meses.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">👀</span>
                <p>
                  Durante la licitación puedes pedir al juzgado inspeccionar el inmueble; el poseedor tiene que
                  consentirlo (art. 669.3 LEC).
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧮</span>
                <p>Fija tu puja máxima con el coste total, no con el valor de subasta.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <p>Si hay ocupantes, cargas dudosas o el deudor es una empresa, consulta a un abogado o asesor antes de pujar.</p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <h2 className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span> Errores frecuentes
              </h2>
              <ul className={styles.warningList}>
                <li>Calcular el ITP sobre la puja cuando el valor de referencia es mayor.</li>
                <li>
                  Contar con el depósito del {pct(DEPOSITO_SUBASTA.judicialAnterior.porcentaje)} en una subasta judicial
                  nueva, donde es del {pct(DEPOSITO_SUBASTA.judicial.porcentaje)}.
                </li>
                <li>Olvidar las cargas anteriores, que siguen sobre la vivienda después de comprarla.</li>
                <li>Pujar sin haber comprobado si la vivienda está ocupada.</li>
                <li>No tener el resto del precio a tiempo y perder el depósito.</li>
                <li>
                  Pujar en una subasta de la Agencia Tributaria por menos del{' '}
                  {pct(PUJA_MINIMA_AEAT.porcentaje)} del tipo, la puja mínima salvo cargas importantes.
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              {PREGUNTAS_FRECUENTES.map((f) => (
                <div key={f.question} className={styles.faqItem}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </EducationalSection>

        <RelatedApps />

        <ShareCard appName="calculadora-subastas-boe" />

        <Footer appName="calculadora-subastas-boe" />
      </div>
    </>
  );
}

interface ResultadosProps {
  resultado: ResultadoSubasta;
  regimen: RegimenSubasta;
  reformaRige: boolean;
  ccaa: ComunidadAutonoma;
}

function Resultados({ resultado: r, regimen, reformaRige, ccaa }: ResultadosProps) {
  const baseNombre = regimen === 'judicial' ? 'valor de subasta' : 'tipo de subasta';
  const itp = r.itp;

  return (
    <div className={styles.resultados}>
      <ResultCard
        title="Depósito para pujar"
        value={formatCurrency(r.deposito.importe)}
        variant="highlight"
        icon="🔒"
        description={
          r.deposito.minimoAplicado
            ? `El ${pct(r.deposito.regla.porcentaje)} del ${baseNombre} no llega al mínimo de ${formatCurrency(r.deposito.regla.minimo ?? 0)} (${r.deposito.regla.norma}).`
            : `El ${pct(r.deposito.regla.porcentaje)} del ${baseNombre} (${r.deposito.regla.norma}).`
        }
      />
      {regimen === 'judicial' && reformaRige && (
        <p className={styles.nota}>
          El letrado de la Administración de Justicia puede subir o bajar el porcentaje: el anuncio dice el importe
          exacto.
        </p>
      )}
      {r.supuestoReforma && (
        <p className={styles.nota}>
          Como no sabes cuándo empezó el procedimiento, calculamos con las reglas de 2025, que piden más depósito y
          dan menos plazo. Si empezó antes, el depósito sería del {pct(DEPOSITO_SUBASTA.judicialAnterior.porcentaje)}{' '}
          y el plazo de {PLAZO_PAGO_SUBASTA.judicialAnterior.dias} días.
        </p>
      )}

      <ResultCard
        title="Resto a pagar si ganas"
        value={formatCurrency(r.resto)}
        icon="⏱️"
        description={`En ${r.plazo.dias} días ${r.plazo.computo} (${r.plazo.norma}). Si no pagas, pierdes el depósito.`}
      />

      {r.avisos.map((a) => (
        <div key={a.tipo} className={styles.alerta} role="alert">
          {a.tipo === 'puja-bajo-deposito' && <span key="bajo">Tu puja es menor que el depósito que hay que constituir para pujar.</span>}
          {a.tipo === 'puja-minima-aeat' && (
            <span key="aeat">
              En las subastas de la Agencia Tributaria la puja mínima es el {pct(PUJA_MINIMA_AEAT.porcentaje)} del tipo (
              {formatCurrency(a.minimo)}), salvo que las cargas lleguen al {pct(PUJA_MINIMA_AEAT.salvoCargasDesde)} de la
              valoración (art. 104.3 del Reglamento General de Recaudación).
            </span>
          )}
          {a.tipo === 'postura-verbal-ss' && (
            <span key="ss">
              De viva voz solo se admiten posturas de al menos el {pct(POSTURA_VERBAL_MINIMA_SS)} del tipo (
              {formatCurrency(a.minimo)}), según el art. 120.3 del Reglamento de Recaudación de la Seguridad Social.
            </span>
          )}
        </div>
      ))}

      {r.tramoJudicial && <TramoJudicial tramo={r.tramoJudicial} porcentaje={r.porcentajePuja} reformaRige={reformaRige} />}

      {itp.estado === 'calculado' && (
        <ResultCard
          title={`ITP en ${nombreEnFrase(ccaa)}`}
          value={formatCurrency(itp.importe)}
          icon="🧾"
          description={
            itp.baseEsValorReferencia
              ? `Sobre el valor de referencia (${formatCurrency(itp.base)}), porque tu puja queda por debajo (art. 10.2 TRLITPAJD). Tipo efectivo: ${pct((itp.importe / itp.base) * 100, 2)}.`
              : `Sobre tu puja, que supera el valor de referencia. Tipo efectivo: ${pct((itp.importe / itp.base) * 100, 2)}.`
          }
        />
      )}
      {itp.estado === 'calculado' && itp.elegido.noComprobables.length > 0 && (
        <div className={styles.avisoReducidos} role="note">
          <p className={styles.avisoTitulo}>
            <span aria-hidden="true">💡</span> Podrías pagar menos ITP, pero depende de requisitos que no preguntamos
          </p>
          <ul className={styles.listaSimple}>
            {itp.elegido.noComprobables.map((red) => (
              <li key={red.nombre}>
                <strong>
                  {formatNumber(red.tipo, 2)}&nbsp;% — {separarPorcentajes(red.nombre)}
                </strong>
                . Requisitos: {separarPorcentajes(red.condiciones.join(' · '))}
                {red.valorMaximo ? ` · Valor máximo ${formatCurrency(red.valorMaximo)}` : ''}
                {superaElTope(red, itp.base) && <span key="tope"> · la base supera ese límite</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ResultCard
        title="Inscripción en el Registro"
        value={formatCurrency(r.registro)}
        icon="📚"
        description="Arancel registral aproximado sobre el precio de adjudicación. La cancelación de las cargas posteriores lo sube un poco. No hay notaría: se inscribe con el decreto o la certificación de adjudicación."
      />

      <div className={r.completo ? styles.totalCompleto : styles.totalIncompleto}>
        <p className={styles.totalTitulo}>
          {r.completo ? (
            <span key="completo">Coste total de la compra</span>
          ) : (
            <span key="incompleto">Coste total: incompleto</span>
          )}
        </p>
        <p className={styles.totalValor}>
          {r.completo ? (
            <span key="v-completo">{formatCurrency(r.totalConocido)}</span>
          ) : (
            <span key="v-incompleto">Al menos {formatCurrency(r.totalConocido)}</span>
          )}
        </p>
        <p className={styles.totalDetalle}>
          Puja, ITP, Registro, las partidas que has escrito y otros gastos.
          {!r.completo && (
            <span key="falta"> Falta lo que no sabemos, y todo ello suma: el coste real será mayor.</span>
          )}
        </p>
      </div>

      {r.pendientes.length > 0 && (
        <div className={styles.pendientes}>
          <h3 className={styles.subTitle}>Lo que falta en el total y dónde mirarlo</h3>
          <ul className={styles.listaSimple}>
            {r.pendientes.map((p) => (
              <li key={p}>{textoPendiente(p, r, ccaa)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.sinCifra}>
        <h3 className={styles.subTitle}>
          <span aria-hidden="true">⚖️</span> Lo que ninguna calculadora puede poner en cifras
        </h3>
        <ul className={styles.listaSimple}>
          <li>
            <strong>Si la vivienda está ocupada</strong>: recuperar la posesión puede llevar meses y costes de
            abogado y procurador (art. 675 LEC).
          </li>
          <li>
            <strong>El estado del interior</strong>: casi nunca se puede visitar antes de pujar.
          </li>
        </ul>
        <p className={styles.nota}>
          En estos dos puntos, y en las cargas que no entiendas, consulta a un abogado antes de pujar.
        </p>
      </div>
    </div>
  );
}

interface TramoJudicialProps {
  tramo: NonNullable<ResultadoSubasta['tramoJudicial']>;
  porcentaje: number;
  reformaRige: boolean;
}

function TramoJudicial({ tramo, porcentaje, reformaRige }: TramoJudicialProps) {
  const U = UMBRALES_REMATE_JUDICIAL;
  const tuPuja = `Tu puja es el ${pct(porcentaje, 1)} del valor de subasta.`;

  if (tramo === 'aprobacion-directa') {
    return (
      <div className={styles.tramoOk} role="note">
        <p>
          <strong>{tuPuja}</strong> Al llegar al {pct(U.aprobacionDirecta)}, si es la mejor, el remate se aprueba
          {reformaRige ? ' al día siguiente del cierre' : ' sin más trámite'} (art. 670.1 LEC).
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tramoAviso} role="note">
      <p>
        <strong>{tuPuja}</strong> Por debajo del {pct(U.aprobacionDirecta)}, aunque sea la mejor puja no tienes la
        vivienda asegurada:
      </p>
      {reformaRige ? (
        <ul key="reforma" className={styles.listaSimple}>
          <li>
            El deudor tiene {U.diasMejora} días para presentar a otra persona que ofrezca al menos el{' '}
            {pct(U.mejoraTercero)}, o lo bastante para pagar toda la deuda.
          </li>
          <li>
            Si no lo hace, se aprueba tu puja si llega al {pct(U.remateMinimo)}, o al{' '}
            {pct(U.remateMinimoSiCubreCredito)} si cubre todo lo que se le debe al acreedor. Si no, decide el letrado
            según las circunstancias.
          </li>
          <li>
            Si es la vivienda habitual del deudor, no se aprueba por menos del {pct(U.viviendaHabitual)}, o del{' '}
            {pct(U.viviendaHabitualSiCubreDeuda)} si cubre lo que se debe.
          </li>
        </ul>
      ) : (
        <ul key="anterior" className={styles.listaSimple}>
          <li>
            El deudor tiene {U.diasMejora} días para presentar a otra persona que ofrezca más del{' '}
            {pct(U.mejoraTerceroAnterior)}, o lo bastante para pagar toda la deuda.
          </li>
          <li>
            Después, el acreedor puede pedir que se le adjudique a él por el {pct(U.aprobacionDirecta)} o por lo que se
            le deba, si supera el {pct(U.adjudicacionEjecutanteAnterior)}.
          </li>
          <li>
            Si no lo pide, se aprueba tu puja si supera el {pct(U.remateMinimo)} o cubre la cantidad reclamada. Si no,
            decide el letrado.
          </li>
        </ul>
      )}
      <p className={styles.nota}>
        {reformaRige ? 'Art. 670.3 LEC, en la redacción de la LO 1/2025.' : 'Art. 670.4 LEC, en la redacción anterior a la LO 1/2025.'}
        {reformaRige && tramo === 'bajo-minimo' && (
          <span key="bajo-minimo"> Por debajo del {pct(U.remateMinimoSiCubreCredito)} es muy probable que no se apruebe.</span>
        )}
      </p>
    </div>
  );
}
