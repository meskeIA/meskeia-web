'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './ComparadorElectrico.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  DataReference,
  RegionBadge,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  AYUDA_AUTO_PLUS_2026,
  FISCAL_AYUDAS_VEHICULO_META,
  MOVES_III_HISTORICO,
} from '@/data/fiscal';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  parseISODateLocal,
  parseSpanishNumber,
} from '@/lib';
import {
  calcularComparador,
  type DatosComparador,
  type ResultadoComparador,
} from './motor';

// ─────────────────────────────────────────────
// Formulario: lo tecleado se guarda como TEXTO y se lee con parseSpanishNumber
// ─────────────────────────────────────────────
//
// Hallazgo 2000 (26/09/2026): con inputs type="number", un parseo casero (cambiar la coma por
// punto y pasar a parseFloat) y NaN → 0, en es-ES el punto de millar dejaba el valor vacío, la app escribía «0» y lo que
// se seguía tecleando iba detrás: «1.500» acababa en 500. Ahora el campo guarda lo que el
// usuario escribe y la cifra se lee con el parser canónico, que entiende «1.500» y «0,18».

type CampoNumerico = Exclude<keyof DatosComparador, 'anios'>;

type Formulario = Record<CampoNumerico, string> & { anios: number };

const FORM_INICIAL: Formulario = {
  precioElectrico: '35.000',
  precioGasolina: '25.000',
  ayuda: '0',
  kmAnuales: '15.000',
  consumoElectrico: '16',
  consumoGasolina: '7',
  precioLuz: '0,18',
  precioGasolinaLitro: '1,65',
  cargador: '800',
  mantElectrico: '800',
  mantGasolina: '1.000',
  anios: 10,
};

const HORIZONTES = [5, 8, 10, 15] as const;

interface Lectura {
  datos: DatosComparador;
  errores: Partial<Record<CampoNumerico, string>>;
}

const NOMBRE_CAMPO: Record<CampoNumerico, string> = {
  precioElectrico: 'Precio del eléctrico',
  precioGasolina: 'Precio del gasolina equivalente',
  ayuda: 'Ayuda pública a la compra',
  kmAnuales: 'Kilómetros anuales',
  consumoElectrico: 'Consumo eléctrico',
  consumoGasolina: 'Consumo gasolina',
  precioLuz: 'Precio de la electricidad',
  precioGasolinaLitro: 'Precio gasolina',
  cargador: 'Cargador doméstico',
  mantElectrico: 'Mantenimiento del eléctrico',
  mantGasolina: 'Mantenimiento del gasolina',
};

/** Campos que deben ser mayores que 0; el resto admite 0 pero no negativos. */
const POSITIVOS: readonly CampoNumerico[] = [
  'precioElectrico',
  'precioGasolina',
  'kmAnuales',
  'consumoElectrico',
  'consumoGasolina',
  'precioLuz',
  'precioGasolinaLitro',
];

function leerFormulario(form: Formulario): Lectura {
  const errores: Partial<Record<CampoNumerico, string>> = {};
  const valores = {} as Record<CampoNumerico, number>;

  (Object.keys(NOMBRE_CAMPO) as CampoNumerico[]).forEach((campo) => {
    const n = parseSpanishNumber(form[campo]);
    valores[campo] = n;
    if (Number.isNaN(n)) {
      errores[campo] = 'Escribe un número (por ejemplo, 1.500 o 0,18).';
    } else if (POSITIVOS.includes(campo) && n <= 0) {
      errores[campo] =
        campo === 'kmAnuales'
          ? 'Sin kilómetros no hay ahorro de uso que recupere la diferencia de precio: pon los que recorres al año.'
          : 'Tiene que ser mayor que 0.';
    } else if (n < 0) {
      errores[campo] = 'No puede ser negativo.';
    }
  });

  if (!errores.ayuda && !errores.precioElectrico && valores.ayuda > valores.precioElectrico) {
    errores.ayuda = 'La ayuda no puede ser mayor que el precio del eléctrico.';
  }

  return { datos: { ...valores, anios: form.anios }, errores };
}

// ─────────────────────────────────────────────
// Ejemplos que se citan en el texto: salen del propio motor, no se escriben a mano
// ─────────────────────────────────────────────

const DATOS_EJEMPLO = leerFormulario(FORM_INICIAL).datos;
const EJEMPLO_KM = [8000, 15000, 25000].map((km) => ({
  km,
  resultado: calcularComparador({ ...DATOS_EJEMPLO, kmAnuales: km, anios: 50 }),
}));

const AUTO_PLUS = AYUDA_AUTO_PLUS_2026;
const pct = (x: number): string => formatPercentage(x, 0);
/** Importe entero en euros («4500 €», «35.000 €»): la ayuda y los topes no llevan céntimos. */
const euros = (x: number): string => `${formatNumber(x, 0)} €`;
const fechaISO = (iso: string): string => formatDate(parseISODateLocal(iso));

// ─────────────────────────────────────────────
// Campo numérico con su etiqueta visible como nombre accesible (WCAG 2.5.3)
// ─────────────────────────────────────────────

interface CampoProps {
  campo: CampoNumerico;
  etiqueta: string;
  pista: React.ReactNode;
  valor: string;
  error?: string;
  onChange: (campo: CampoNumerico, valor: string) => void;
  completo?: boolean;
}

function Campo({ campo, etiqueta, pista, valor, error, onChange, completo = false }: CampoProps) {
  const idPista = `${campo}-pista`;
  const idError = `${campo}-error`;
  return (
    <div className={completo ? styles.formGroupFull : styles.formGroup}>
      <label htmlFor={campo} className={styles.label}>
        {etiqueta}
      </label>
      <input
        id={campo}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={valor}
        onChange={(e) => onChange(campo, e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${idError} ${idPista}` : idPista}
      />
      {error && (
        <span id={idError} className={styles.inputErrorText}>
          {error}
        </span>
      )}
      <span id={idPista} className={styles.inputHint}>
        {pista}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Veredicto
// ─────────────────────────────────────────────

function Veredicto({ r }: { r: ResultadoComparador }) {
  const ahorro = formatCurrency(Math.abs(r.ahorroAnual));

  if (r.tipo === 'equilibrio' && r.anioEquilibrio !== null) {
    return (
      <>
        <div className={styles.breakEvenAnio}>Año {r.anioEquilibrio}</div>
        <p className={styles.breakEvenLabel}>
          El eléctrico empieza a ser más barato en el año {r.anioEquilibrio}
        </p>
        <p className={styles.breakEvenSubLabel}>
          Desde ahí la ventaja crece cada año, porque su uso cuesta {ahorro} menos al año.
        </p>
      </>
    );
  }

  if (r.tipo === 'fuera-horizonte' && r.anioEquilibrio !== null) {
    return (
      <>
        <div className={styles.breakEvenNunca}>
          No se alcanza el punto de equilibrio en {r.anios} años
        </div>
        <p className={styles.breakEvenLabel}>
          Con estos datos, el eléctrico recuperaría la diferencia en el año {r.anioEquilibrio}
        </p>
        <p className={styles.breakEvenSubLabel}>
          {r.energiaMasBarataEV
            ? 'Cuantos más kilómetros recorras al año, antes llega; también lo adelantan una ayuda o un precio de compra más bajos.'
            : 'Su energía por kilómetro no es más barata que la gasolina: recorrer más kilómetros no adelanta el equilibrio. Revisa los precios de compra y de la energía.'}
        </p>
      </>
    );
  }

  if (r.tipo === 'desde-compra') {
    return (
      <>
        <div className={styles.breakEvenAnio}>Desde la compra</div>
        <p className={styles.breakEvenLabel}>
          {r.inversionInicialExtra < 0
            ? `El eléctrico cuesta ${formatCurrency(-r.inversionInicialExtra)} menos al comprarlo`
            : 'Los dos cuestan lo mismo al comprarlos'}
        </p>
        <p className={styles.breakEvenSubLabel}>
          {r.ahorroAnual > 0
            ? `Y su uso es ${ahorro} más barato al año: la ventaja crece cada año.`
            : 'Y su uso cuesta lo mismo: la ventaja se mantiene.'}
        </p>
      </>
    );
  }

  if (r.tipo === 'ventaja-se-agota' && r.anioCruce !== null) {
    const dentro = r.anioCruce <= r.anios;
    return (
      <>
        <div className={styles.breakEvenNunca}>
          {dentro ? `Más caro desde el año ${r.anioCruce}` : `Por delante a los ${r.anios} años`}
        </div>
        <p className={styles.breakEvenLabel}>
          El eléctrico es más barato de comprar, pero su uso cuesta {ahorro} más al año: su
          ventaja se reduce cada año
          {dentro
            ? ` y desde el año ${r.anioCruce} sale más caro que la gasolina.`
            : ` y se agotaría en el año ${r.anioCruce}.`}
        </p>
        <p className={styles.breakEvenSubLabel}>
          Cuantos más kilómetros recorras, antes se agota. Si cargas fuera de casa, el precio del
          kWh es lo que más pesa.
        </p>
      </>
    );
  }

  return (
    <>
      <div className={styles.breakEvenNunca}>El eléctrico no compensa con estos datos</div>
      <p className={styles.breakEvenLabel}>
        Cuesta más de comprar y su uso no es más barato que el de la gasolina: la diferencia no se
        recupera con ningún kilometraje.
      </p>
      <p className={styles.breakEvenSubLabel}>Revisa los precios de compra y de la energía.</p>
    </>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function ComparadorElectrico() {
  const [form, setForm] = useState<Formulario>(FORM_INICIAL);
  // Tras el primer «Calcular», el resultado sigue al formulario: se recalcula con cada cambio
  // y desaparece si un dato deja de ser válido (hallazgos 1999 y 2002: antes quedaba en
  // pantalla un veredicto que ya no correspondía a lo escrito).
  const [calculado, setCalculado] = useState(false);

  const lectura = useMemo<Lectura>(() => leerFormulario(form), [form]);
  const listaErrores = (Object.keys(lectura.errores) as CampoNumerico[]).map((campo) => ({
    campo,
    texto: lectura.errores[campo] ?? '',
  }));
  const formularioValido = listaErrores.length === 0;

  const resultado = useMemo<ResultadoComparador | null>(
    () => (formularioValido ? calcularComparador(lectura.datos) : null),
    [formularioValido, lectura],
  );

  function actualizarCampo(campo: CampoNumerico, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  const campo = (c: CampoNumerico) => ({
    campo: c,
    valor: form[c],
    error: lectura.errores[c],
    onChange: actualizarCampo,
  });

  const ejemploMedio = EJEMPLO_KM[1].resultado;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          ¿Cuándo compensa el coche, carro o auto eléctrico?
        </h1>
        <p className={styles.heroSubtitle}>
          Calcula el punto de equilibrio entre un coche (carro o auto) eléctrico y su equivalente
          de gasolina, con la ayuda pública a la compra que te corresponda y el cargador doméstico.
        </p>
      </header>

      <main className={styles.main}>
        <RegionBadge variant="es-data" />

        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical" />
        <DataReference
          normativa="Programa Auto+ (ayuda a la compra en España)"
          fuente={FISCAL_AYUDAS_VEHICULO_META.fuente}
          verificado={FISCAL_AYUDAS_VEHICULO_META.verificado}
          urlOficial={FISCAL_AYUDAS_VEHICULO_META.urlOficial}
          nota="La app no calcula la ayuda: la escribes tú."
        />

        {/* ── Formulario ── */}
        <section className={styles.formSection} aria-label="Datos del comparador">

          {/* Grupo 1: Precios de compra */}
          <h2 className={styles.sectionDivider}>Precios de compra</h2>
          <div className={styles.formGrid}>
            <Campo
              {...campo('precioElectrico')}
              etiqueta="Precio del eléctrico (€)"
              pista="Precio final que pagarías, antes de restar ninguna ayuda"
            />
            <Campo
              {...campo('precioGasolina')}
              etiqueta="Precio del gasolina equivalente (€)"
              pista="Modelo comparable de gasolina"
            />
            <Campo
              {...campo('ayuda')}
              completo
              etiqueta="Ayuda pública a la compra que te corresponda (€)"
              pista="La app no la calcula: escribe la que te hayan concedido o te correspondería. Pon 0 si no hay."
            />
            <div className={styles.notaAyuda}>
              <p>
                <strong>En España</strong>, el {AUTO_PLUS.nombre} (RD 609/2026) da a un turismo como
                máximo <strong>{euros(AUTO_PLUS.maximo.turismo)}</strong>. No es una cantidad
                fija: se suman criterios. Ser eléctrico puro aporta el{' '}
                {pct(AUTO_PLUS.criterioElectrico.puro)} del máximo (híbrido enchufable o de
                autonomía extendida, el {pct(AUTO_PLUS.criterioElectrico.electrificado)}); un
                precio sin impuestos de hasta{' '}
                {euros(AUTO_PLUS.criterioEconomicoTurismo[0].precioMaxSinImpuestos)}, el{' '}
                {pct(AUTO_PLUS.criterioEconomicoTurismo[0].porcentaje)}, o de hasta{' '}
                {euros(AUTO_PLUS.criterioEconomicoTurismo[1].precioMaxSinImpuestos)}, el{' '}
                {pct(AUTO_PLUS.criterioEconomicoTurismo[1].porcentaje)} (por encima, no hay ayuda);
                y la fabricación europea, el {pct(AUTO_PLUS.criterioEuropeo.montajeUE)} por montaje
                en la UE y un {pct(AUTO_PLUS.criterioEuropeo.adicionalPuroBateriaUE)} más para
                eléctricos puros que cumplan otras condiciones, como la batería europea. No hay
                tramo por achatarramiento.
              </p>
              <p>
                Cubre vehículos matriculados desde el {fechaISO(AUTO_PLUS.matriculadosDesde)} y se
                solicita cada año hasta el {AUTO_PLUS.solicitudAnualHasta}. El{' '}
                {MOVES_III_HISTORICO.nombre} terminó el {fechaISO(MOVES_III_HISTORICO.finalizado)}.
                En otros países hay otras ayudas: consulta las del tuyo.
              </p>
            </div>
          </div>

          {/* Grupo 2: Consumos y energía */}
          <h2 className={styles.sectionDivider}>Consumos y energía</h2>
          <div className={styles.formGrid}>
            <Campo
              {...campo('kmAnuales')}
              etiqueta="Kilómetros anuales"
              pista="Mira el cuentakilómetros o compara dos revisiones"
            />
            <Campo
              {...campo('consumoElectrico')}
              etiqueta="Consumo eléctrico (kWh/100 km)"
              pista="Consumo real, no el homologado WLTP"
            />
            <Campo
              {...campo('consumoGasolina')}
              etiqueta="Consumo gasolina (l/100 km)"
              pista="Consumo real en ciudad y carretera"
            />
            <Campo
              {...campo('precioLuz')}
              etiqueta="Precio de la electricidad (€/kWh)"
              pista="Mira tu factura, con impuestos. Si cargas también fuera de casa, pon la media de lo que pagas"
            />
            <Campo
              {...campo('precioGasolinaLitro')}
              etiqueta="Precio gasolina (€/l)"
              pista="Lo que pagas por litro en tu gasolinera habitual"
            />
          </div>

          {/* Grupo 3: Otros costes */}
          <h2 className={styles.sectionDivider}>Otros costes</h2>
          <div className={styles.formGrid}>
            <Campo
              {...campo('cargador')}
              etiqueta="Cargador doméstico (€)"
              pista="Se paga al comprar: pide presupuesto de instalación. Pon 0 si no lo instalas."
            />
            <div className={styles.formGroup}>
              <label htmlFor="anios" className={styles.label}>
                Horizonte de análisis
              </label>
              <select
                id="anios"
                className={styles.select}
                value={form.anios}
                onChange={(e) => setForm((prev) => ({ ...prev, anios: Number(e.target.value) }))}
                aria-describedby="anios-pista"
              >
                {HORIZONTES.map((h) => (
                  <option key={h} value={h}>
                    {h} años
                  </option>
                ))}
              </select>
              <span id="anios-pista" className={styles.inputHint}>
                Cuántos años planeas quedarte el coche
              </span>
            </div>
            <Campo
              {...campo('mantElectrico')}
              etiqueta="Mantenimiento del eléctrico (€/año)"
              pista="Revisiones, neumáticos, frenos… Estimación tuya: ajústala con tus presupuestos de taller"
            />
            <Campo
              {...campo('mantGasolina')}
              etiqueta="Mantenimiento del gasolina (€/año)"
              pista="Suma además aceite, filtros y embrague. También es una estimación tuya"
            />
          </div>

          <button
            type="button"
            className={styles.btnCalcular}
            onClick={() => setCalculado(true)}
            disabled={!formularioValido}
            aria-describedby={formularioValido ? undefined : 'aviso-formulario'}
          >
            Calcular punto de equilibrio
          </button>
          <div id="aviso-formulario" className={styles.avisoFormulario} role="status">
            {!formularioValido && (
              <>
                <p>Para calcular, corrige estos datos:</p>
                <ul>
                  {listaErrores.map((e) => (
                    <li key={e.campo}>
                      <strong>{NOMBRE_CAMPO[e.campo]}</strong>: {e.texto}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* ── Resultados ── */}
        {calculado && resultado !== null && (
          <section className={styles.resultadosSection} aria-label="Resultados del comparador">

            {/* Tarjeta principal: punto de equilibrio */}
            <div className={styles.breakEvenCard} role="status" aria-live="polite">
              <Veredicto r={resultado} />
            </div>

            {/* Métricas secundarias */}
            <div className={styles.statsGrid} role="group" aria-label="Resumen de métricas clave">
              <div className={styles.statCard}>
                <span className={styles.statValor}>
                  {formatCurrency(Math.abs(resultado.ahorroAnual))}
                </span>
                <span className={styles.statLabel}>
                  {resultado.ahorroAnual >= 0
                    ? 'Ahorro de uso al año con el eléctrico (energía y mantenimiento)'
                    : 'Sobrecoste de uso al año del eléctrico (energía y mantenimiento)'}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValor}>
                  {formatCurrency(resultado.inversionInicialExtra)}
                </span>
                <span className={styles.statLabel}>
                  Diferencia al comprar: eléctrico con cargador y tras la ayuda, menos gasolina
                  {resultado.inversionInicialExtra <= 0 ? ' (el eléctrico ya es más barato)' : ''}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValor}>
                  {formatNumber(resultado.costePorKmEV * 100, 1)} ct/km
                </span>
                <span className={styles.statLabel}>
                  Coste de uso por km del eléctrico, frente a{' '}
                  {formatNumber(resultado.costePorKmGas * 100, 1)} ct/km del gasolina
                </span>
              </div>
            </div>

            {/* Tabla año a año */}
            <div className={styles.tablaSection}>
              <h3 className={styles.tablaTitle}>Coste total acumulado año a año</h3>
              <div className={styles.tablaResponsive}>
                <table className={styles.tabla}>
                  <caption className={styles.srOnly}>
                    Coste total acumulado de cada coche (compra más uso) y ventaja del eléctrico, por año
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Año</th>
                      <th scope="col">Coste total eléctrico</th>
                      <th scope="col">Coste total gasolina</th>
                      <th scope="col">Ventaja del eléctrico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.tabla.map((fila) => (
                      <tr
                        key={fila.anio}
                        className={
                          resultado.tipo === 'equilibrio' && fila.anio === resultado.anioEquilibrio
                            ? styles.filaBreakEven
                            : styles.tablaFila
                        }
                      >
                        <td>{fila.anio}</td>
                        <td className={styles.celCosteEV}>{formatCurrency(fila.costeTotalEV)}</td>
                        <td>{formatCurrency(fila.costeTotalGas)}</td>
                        <td className={fila.ventajaEV >= 0 ? styles.celAhorro : undefined}>
                          {fila.ventajaEV >= 0 ? '+' : ''}
                          {formatCurrency(fila.ventajaEV)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.celNota}>
                Coste total = compra (el eléctrico, con el cargador y tras la ayuda) + energía y
                mantenimiento de cada año. Una ventaja negativa significa que, hasta ese año, el
                eléctrico ha costado más. No incluye depreciación, valor de reventa, seguro ni
                financiación.
              </p>
            </div>

            {/* CTA a selector-vehiculo */}
            <div className={styles.ctaBox}>
              <p className={styles.ctaText}>
                ¿Aún no tienes claro qué tipo de coche te conviene? El Selector de Vehículo te
                orienta según tus necesidades reales antes de comparar precios.
              </p>
              <Link href="/selector-vehiculo/" className={styles.ctaLink}>
                Ir al Selector de Vehículo
              </Link>
            </div>
          </section>
        )}

        {/* ── Sección educativa v2.0 ── */}
        <EducationalSection
          title="¿Por qué el eléctrico no siempre compensa?"
          subtitle="Factores clave que determinan el punto de equilibrio real"
        >
          <h3>La trampa del precio de lista</h3>
          <p>
            El precio de compra es solo el punto de partida. Lo que importa es la
            <strong> diferencia al comprar</strong>: el eléctrico con su cargador y tras la ayuda que
            te corresponda, frente al de gasolina. Esa diferencia es la que se recupera, año a año,
            con lo que el eléctrico ahorra en energía y mantenimiento. Además, el valor de reventa
            de uno y otro a 5-8 años puede ser muy distinto, y no aparece en este cálculo.
          </p>

          <h3>Dónde cargas cambia el resultado</h3>
          <p>
            El kWh de casa y el de un punto de carga rápida en carretera pueden costar muy distinto:
            consulta la tarifa del operador que vayas a usar. Si cargas a menudo fuera de casa, pon
            en «Precio de la electricidad» la media de lo que pagas. Con un kWh caro, el eléctrico
            puede ser más barato de comprar y aun así más caro de usar: entonces su ventaja se reduce
            cada año y la app te dice en qué año se agota.
          </p>

          <h3>La ayuda a la compra</h3>
          <p>
            En España, el {MOVES_III_HISTORICO.nombre} estuvo vigente entre {MOVES_III_HISTORICO.vigencia.replace('-', ' y ')} y
            terminó el {fechaISO(MOVES_III_HISTORICO.finalizado)}. Hoy rige el {AUTO_PLUS.nombre}{' '}
            (RD 609/2026), con un máximo de {euros(AUTO_PLUS.maximo.turismo)} por turismo
            que se alcanza sumando criterios: tipo de vehículo, precio sin impuestos y fabricación
            europea. La app no calcula la ayuda, porque algunas condiciones —como el origen de la
            batería— no caben en un formulario: comprueba la tuya en la fuente oficial y escríbela
            en su campo. En otros países hay programas distintos.
          </p>

          <h3>Los km anuales son decisivos</h3>
          <p>
            Cuando el eléctrico gasta menos energía por kilómetro, el ahorro crece con los
            kilómetros recorridos. Con los datos de ejemplo de la app (diferencia al comprar de{' '}
            {formatCurrency(ejemploMedio.inversionInicialExtra)}), el equilibrio llega{' '}
            {EJEMPLO_KM.map(({ km, resultado: r }, i) => (
              <React.Fragment key={km}>
                {i > 0 && (i === EJEMPLO_KM.length - 1 ? ' y ' : ', ')}
                {r.anioEquilibrio !== null ? `en el año ${r.anioEquilibrio}` : 'nunca'} con{' '}
                {formatNumber(km, 0)} km/año
              </React.Fragment>
            ))}
            . Si tus precios son otros, el resultado cambia: por eso conviene hacer el cálculo con
            los tuyos.
          </p>

          <div className={styles.warningBox} role="note">
            Este cálculo es orientativo. No incluye el coste del dinero (financiación), la
            depreciación ni el valor de reventa, el seguro ni los impuestos de circulación. El
            consumo real puede diferir mucho del homologado WLTP. Consulta a un asesor financiero
            para decisiones de compra relevantes.
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('comparador-electrico')} />
      <ShareCard appName="comparador-electrico" />
      <Footer appName="comparador-electrico" />
    </div>
  );
}
