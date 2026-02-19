'use client';

import { useState, useEffect, useCallback } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatNumber } from '@/lib/formatters';
import { jsonLd } from './metadata';
import styles from './ConversionDivisas.module.css';
import { getRelatedApps } from '@/data/app-relations';

interface Divisa {
  codigo: string;
  nombre: string;
  tasa: number; // Relativa a EUR
}

interface RespuestaDivisas {
  base: string;
  fecha: string;
  divisas: Divisa[];
}

// Cantidades de referencia para la tabla rápida
const CANTIDADES_REFERENCIA = [1, 5, 10, 20, 50, 100, 200, 500];

export default function ConversionDivisas() {
  const [divisas, setDivisas] = useState<Divisa[]>([]);
  const [fecha, setFecha] = useState<string>('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cantidad, setCantidad] = useState<string>('100');
  const [origen, setOrigen] = useState<string>('EUR');
  const [destino, setDestino] = useState<string>('USD');

  // Carga de tasas de cambio
  useEffect(() => {
    const cargarDivisas = async () => {
      try {
        setCargando(true);
        setError(null);
        const res = await fetch('/api/divisas');
        if (!res.ok) throw new Error('Error al cargar tasas');
        const datos: RespuestaDivisas = await res.json();
        setDivisas(datos.divisas);
        setFecha(datos.fecha);
      } catch {
        setError('No se pudieron cargar los tipos de cambio. Inténtalo más tarde.');
      } finally {
        setCargando(false);
      }
    };

    cargarDivisas();
  }, []);

  // Obtener tasa de una divisa
  const getTasa = useCallback((codigo: string): number => {
    return divisas.find(d => d.codigo === codigo)?.tasa ?? 1;
  }, [divisas]);

  // Calcular resultado de conversión
  const calcularConversion = useCallback((cant: number, desde: string, hacia: string): number => {
    if (divisas.length === 0) return 0;
    const tasaOrigen = getTasa(desde);
    const tasaDestino = getTasa(hacia);
    // Convertir a EUR primero, luego al destino
    const enEuros = cant / tasaOrigen;
    return enEuros * tasaDestino;
  }, [divisas, getTasa]);

  const cantidadNum = parseFloat(cantidad.replace(',', '.')) || 0;
  const resultado = calcularConversion(cantidadNum, origen, destino);

  // Intercambiar divisas
  const intercambiar = () => {
    setOrigen(destino);
    setDestino(origen);
  };

  const getNombreDivisa = (codigo: string): string => {
    return divisas.find(d => d.codigo === codigo)?.nombre ?? codigo;
  };

  const formatearFecha = (fechaStr: string): string => {
    if (!fechaStr) return '';
    const [año, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}/${año}`;
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsTracker appName="conversor-divisas" />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>💱 Conversor de Divisas</h1>
        <p>Tipos de cambio del Banco Central Europeo, actualizados a diario</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Aviso de uso orientativo */}
        <div className={styles.disclaimer} role="note">
          <span aria-hidden="true">⚠️</span>
          <span>
            <strong>Uso orientativo:</strong> Los tipos de cambio son los publicados por el Banco Central Europeo (BCE) y se actualizan una vez al día (días laborables). No son aptos para transacciones financieras ni trading. Para operaciones reales, consulta a tu banco o casa de cambio.
          </span>
        </div>

        {cargando && (
          <div className={styles.cargando} aria-live="polite" aria-busy="true">
            <div className={styles.cargandoSpinner} aria-hidden="true" />
            <p>Cargando tipos de cambio…</p>
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {!cargando && !error && divisas.length > 0 && (
          <>
            <div className={styles.tarjetaConversor}>
              {/* Selector de divisas y cantidad */}
              <div className={styles.filaConversor}>
                <div className={styles.grupoCampo}>
                  <label htmlFor="cantidad">Cantidad</label>
                  <input
                    id="cantidad"
                    type="number"
                    className={styles.inputCantidad}
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                    min="0"
                    step="any"
                    inputMode="decimal"
                    aria-label="Cantidad a convertir"
                  />
                </div>

                <div className={styles.grupoCampo}>
                  <label htmlFor="origen">De</label>
                  <select
                    id="origen"
                    className={styles.selectDivisa}
                    value={origen}
                    onChange={e => setOrigen(e.target.value)}
                    aria-label="Divisa de origen"
                  >
                    {divisas.map(d => (
                      <option key={d.codigo} value={d.codigo}>
                        {d.codigo} — {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.btnIntercambiar}
                  onClick={intercambiar}
                  aria-label="Intercambiar divisas"
                  title="Intercambiar divisas"
                >
                  ⇄
                </button>

                <div className={styles.grupoCampo}>
                  <label htmlFor="destino">A</label>
                  <select
                    id="destino"
                    className={styles.selectDivisa}
                    value={destino}
                    onChange={e => setDestino(e.target.value)}
                    aria-label="Divisa de destino"
                  >
                    {divisas.map(d => (
                      <option key={d.codigo} value={d.codigo}>
                        {d.codigo} — {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resultado */}
              <div className={styles.resultado} aria-live="polite">
                <div className={styles.resultadoValor}>
                  {formatNumber(resultado, 4)} {destino}
                </div>
                <div className={styles.resultadoTexto}>
                  {formatNumber(cantidadNum, 2)} {origen} = {formatNumber(resultado, 4)} {destino}
                </div>
              </div>

              {/* Tabla rápida de conversiones */}
              <div className={styles.tablaRapida}>
                <h3>Conversiones rápidas de {origen} a {destino}</h3>
                <div className={styles.filasTabla} role="list">
                  {CANTIDADES_REFERENCIA.map(cant => (
                    <div key={cant} className={styles.filaTabla} role="listitem">
                      <span className={styles.filaTablaOrigen}>
                        {formatNumber(cant, 0)} {origen}
                      </span>
                      <span className={styles.filaTablaDestino}>
                        {formatNumber(calcularConversion(cant, origen, destino), 2)} {destino}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Información sobre la fuente */}
            <p className={styles.infoFuente}>
              Fuente: Banco Central Europeo (BCE) — Última actualización: {formatearFecha(fecha)} — {divisas.length} divisas disponibles
            </p>
          </>
        )}

        {/* Contenido educativo */}
        <EducationalSection title="¿Cómo funciona el tipo de cambio?" subtitle="Todo lo que necesitas saber sobre divisas y cambio de moneda al viajar">
          <h3>Tipo de cambio: qué es y cómo se usa</h3>
          <p>
            El tipo de cambio indica cuántas unidades de una moneda se necesitan para obtener una unidad de otra.
            Por ejemplo, si el tipo EUR/USD es 1,08, significa que 1 euro equivale a 1,08 dólares.
          </p>

          <h3>¿Por qué varía el tipo de cambio?</h3>
          <p>
            Los tipos de cambio fluctúan constantemente en función de múltiples factores:
            política monetaria de los bancos centrales, inflación, balanza comercial entre países,
            estabilidad política y expectativas del mercado.
          </p>

          <h3>Diferencia entre tipo interbancario y tipo de cambio al público</h3>
          <p>
            El tipo publicado por el BCE es el tipo <em>interbancario</em>, usado entre grandes entidades financieras.
            Cuando cambias dinero en un banco, aeropuerto o casa de cambio, el tipo real suele ser
            menos favorable, con un margen (spread) que varía según el establecimiento.
          </p>

          <h3>Consejos para cambiar dinero en viajes</h3>
          <ul>
            <li><strong>Evita aeropuertos y hoteles:</strong> suelen tener los peores tipos de cambio</li>
            <li><strong>Usa cajeros locales:</strong> generalmente dan tipos más cercanos al oficial</li>
            <li><strong>Tarjetas sin comisión en el extranjero:</strong> muchas fintech ofrecen tipo interbancario</li>
            <li><strong>Revisa siempre el tipo antes de cambiar</strong> y calcula el importe total con comisiones</li>
          </ul>

          <h3>¿Qué divisa llevar a cada destino?</h3>
          <p>
            En muchos países turísticos aceptan euros o dólares, pero siempre es conveniente llevar
            algo de moneda local para pequeños pagos. Investiga antes de viajar si el destino
            tiene restricciones en la importación de divisas.
          </p>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('conversor-divisas')} />
        <Footer appName="conversor-divisas" />
      </main>
    </div>
  );
}
