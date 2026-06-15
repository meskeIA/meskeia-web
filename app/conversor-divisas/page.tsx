'use client';

import { useState, useEffect, useCallback } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatNumber } from '@/lib/formatters';
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
      <AnalyticsTracker appName="conversor-divisas" />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>💱 Conversor de Divisas</h1>
        <p>Tipos de cambio del Banco Central Europeo, actualizados a diario</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="conversor-divisas-disclaimer"
      />

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
        <EducationalSection title="¿Cómo funciona el tipo de cambio?" subtitle="Todo lo que necesitas saber sobre divisas y cambio de moneda al viajar" defaultOpen={false}>

          {/* 1. Tabla comparativa */}
          <div className={styles.eduComparativa}>
            <h2>Métodos para cambiar divisas: costes reales comparados</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr><th>Método</th><th>Spread típico</th><th>Comisión</th><th>Coste total estimado</th><th>Mejor para</th></tr>
                </thead>
                <tbody>
                  <tr><td>Wise (Transferwise)</td><td>0,3–0,6%</td><td>Fija mínima</td><td>0,5–1% total</td><td>Transferencias internacionales, vivir en el extranjero</td></tr>
                  <tr><td>Revolut (plan gratuito)</td><td>0% en horario laboral</td><td>0% hasta límite mensual</td><td>0–1,5% (recargo en fin de semana según plan y divisa)</td><td>Gastos de viaje, compras online internacionales</td></tr>
                  <tr><td>Banco tradicional</td><td>2–4%</td><td>€3–15 por operación</td><td>3–6% total</td><td>Si no tienes alternativa digital</td></tr>
                  <tr><td>Cajero automático en destino</td><td>1,5–3%</td><td>€2–5 por retirada</td><td>3–5% + comisión fija</td><td>Efectivo de emergencia (no recomendado como norma)</td></tr>
                  <tr><td>Casa de cambio en aeropuerto</td><td>5–10%</td><td>Sin comisión aparente</td><td>5–15% total</td><td>Nunca — solo emergencia absoluta</td></tr>
                  <tr><td>Tarjeta de crédito con cambio</td><td>2–3%</td><td>Comisión por divisa extranjera</td><td>2,5–4% total</td><td>Compras puntuales si no tienes Revolut/Wise</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Escenarios */}
          <div className={styles.eduEscenarios}>
            <h2>Cuánto pierdes realmente al cambiar divisas</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>✈️</span><h3>Viaje a EE.UU. (1.500 €)</h3></div>
                <p className={styles.escenarioExample}>Banco tradicional (4% spread + comisión): pierdes ~70 €. Revolut: pierdes ~5 €. Diferencia: 65 € — casi una noche de hotel. Lección: cambia con Revolut o Wise antes del viaje.</p>
                <span className={styles.escenarioTip}>65 € de ahorro = una noche de hotel</span>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏢</span><h3>Freelance con clientes en USD</h3></div>
                <p className={styles.escenarioExample}>Cobrar 3.000 USD/mes por PayPal (spread 3,5% + comisión): pierdes ~120 €/mes = 1.440 €/año. Con Wise: pierdes ~20 €/mes. Diferencia: 1.200 €/año — un mes de salario.</p>
                <span className={styles.escenarioTip}>1.200 €/año de diferencia entre métodos</span>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏠</span><h3>Comprar propiedad en el extranjero</h3></div>
                <p className={styles.escenarioExample}>Transferencia de 200.000 GBP al banco: spread 2% = 4.000 £ perdidas. Con un broker especializado (Moneycorp, OFX): spread 0,3–0,5% = 600–1.000 £. Ahorro: 3.000–3.400 £.</p>
                <span className={styles.escenarioTip}>En cantidades grandes, usa broker especializado</span>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🛒</span><h3>Compras online en tiendas extranjeras</h3></div>
                <p className={styles.escenarioExample}>Amazon UK, tiendas japonesas, etc. Con tarjeta bancaria española (3% cambio): en 200 € de compra, pagas 6 € extra. Con Revolut: 0 €. Si compras habitualmente en el extranjero, Revolut se amortiza rápido.</p>
                <span className={styles.escenarioTip}>Revolut gratuito para compras internacionales</span>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>👨‍🎓</span><h3>Estudiante Erasmus</h3></div>
                <p className={styles.escenarioExample}>9 meses en Praga (CZK). Con banco español: 3–4% en cada transacción. Con Revolut o cuenta local: prácticamente gratis. En 9 meses con 800 €/mes de gastos: ahorro potencial 200–280 €.</p>
                <span className={styles.escenarioTip}>Revolut o cuenta local = esencial en Erasmus</span>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>💰</span><h3>Inversión en acciones USA</h3></div>
                <p className={styles.escenarioExample}>Broker con cambio de divisa propio (2–3%): en 10.000 € invertidos en S&P 500, pagas 200–300 € solo en cambio. Brokers como IBKR o brokers europeos con cambio barato: 10–15 €. El cambio puede destruir parte de la rentabilidad.</p>
                <span className={styles.escenarioTip}>El cambio de divisa es un coste de inversión más</span>
              </div>
            </div>
          </div>

          {/* 3. FAQ */}
          <div className={styles.eduFaq}>
            <h2>Preguntas frecuentes sobre cambio de divisas</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}><h4>¿Qué es el spread y cómo me afecta?</h4><p>El spread es la diferencia entre el tipo de cambio interbancario real (el que ves en Google) y el tipo que te aplican al cambiar. Si el EUR/USD real es 1,10 y te dan 1,065, el spread es ~3,2%. Es el coste oculto más importante del cambio de divisas — más que las comisiones visibles.</p></div>
              <div className={styles.faqItem}><h4>¿Cuál es el tipo de cambio &quot;real&quot;?</h4><p>El tipo de cambio interbancario (midmarket rate) es el que ves en Google, XE.com o Bloomberg. Es el precio al que los bancos se venden divisas entre sí. Ningún servicio te lo da exactamente — siempre hay un spread. Wise es el que más se acerca, con spreads del 0,3–0,6%.</p></div>
              <div className={styles.faqItem}><h4>¿Es mejor cambiar antes del viaje o en destino?</h4><p>Depende del método. Con Revolut o Wise, es indiferente (mismo coste). Con banco tradicional, generalmente es mejor cambiar en España antes de salir (más competencia de proveedores). Nunca cambies en el aeropuerto de destino — es el peor spread posible (5–15%).</p></div>
              <div className={styles.faqItem}><h4>¿PayPal es una buena opción para cobrar en otra divisa?</h4><p>No. PayPal aplica un spread del 3–4% sobre el tipo interbancario, más posibles comisiones de retiro. Para freelances que cobran en USD, GBP o EUR desde el extranjero, Wise es significativamente más barato y transparente en la tasa aplicada.</p></div>
              <div className={styles.faqItem}><h4>¿Qué ocurre cuando el cajero pregunta si quieres pagar en euros?</h4><p>Di siempre NO a &quot;pagar en euros&quot; (DCC — Dynamic Currency Conversion). Si aceptas, el cajero extranjero aplica su propio tipo de cambio, que suele ser 3–5% peor que el de tu banco o tarjeta. Deja que la conversión la haga tu banco o Revolut — será más barata.</p></div>
              <div className={styles.faqItem}><h4>¿Las criptomonedas son una buena alternativa para enviar dinero?</h4><p>Para envíos internacionales, stablecoins como USDT o USDC pueden ser baratas (coste de red ~1–5 €) si el destinatario puede recibirlas fácilmente. Sin embargo, tienen riesgo regulatorio, complejidad técnica y no son adecuadas para todos los casos. Wise sigue siendo más práctico para la mayoría.</p></div>
              <div className={styles.faqItem}><h4>¿Cómo funcionan los tipos de cambio fijos (forward)?</h4><p>Un contrato forward te permite fijar el tipo de cambio actual para una transacción futura (útil si tienes que pagar en divisas en 3–6 meses). Si el euro se deprecia, habrás comprado barato. Si se aprecia, habrás perdido esa ganancia. Útil para empresas con exposición cambiaria, no para turistas.</p></div>
              <div className={styles.faqItem}><h4>¿Puedo predecir cuándo es mejor cambiar divisas?</h4><p>No de forma fiable. El mercado de divisas (Forex) es el más grande del mundo (6 billones de dólares diarios) y es prácticamente imposible de predecir a corto plazo. Si necesitas cambiar divisas para un viaje o pago, hazlo con antelación razonable (2–4 semanas) con un buen proveedor, sin intentar &quot;timing&quot; el mercado.</p></div>
            </div>
          </div>

          {/* 4. Guía paso a paso */}
          <div className={styles.eduGuia}>
            <h2>Cómo cambiar divisas al mejor precio en 7 pasos</h2>
            <div className={styles.stepGuide}>
              <div className={styles.eduStep}><div className={styles.stepNumber}>1</div><div className={styles.stepContent}><strong>Consulta el tipo de cambio real</strong><p>Antes de cambiar, busca el par de divisas en Google (ej: &quot;EUR USD&quot;) o XE.com. Ese es el tipo interbancario real. Cualquier servicio que uses aplicará un spread sobre ese valor — tu objetivo es minimizarlo.</p></div></div>
              <div className={styles.eduStep}><div className={styles.stepNumber}>2</div><div className={styles.stepContent}><strong>Elige el método según el importe y el uso</strong><p>Importes grandes (&gt;5.000 €): Wise o broker especializado. Gastos de viaje: Revolut o N26. Compras online: tarjeta Revolut/Wise. Transferencias internacionales recurrentes: Wise. Efectivo en destino: retira con Revolut en cajero local.</p></div></div>
              <div className={styles.eduStep}><div className={styles.stepNumber}>3</div><div className={styles.stepContent}><strong>Calcula el coste real total</strong><p>Spread (%) + comisión fija = coste total. Usa esta calculadora para comparar: introduce el importe y compara el resultado entre métodos. Una diferencia del 2% en 2.000 € son 40 € — el coste de una cena.</p></div></div>
              <div className={styles.eduStep}><div className={styles.stepNumber}>4</div><div className={styles.stepContent}><strong>Abre Revolut o Wise con antelación</strong><p>Ambos requieren verificación de identidad (1–3 días laborables). No esperes al día antes del viaje. El plan gratuito de Revolut cubre la mayoría de necesidades; Wise es mejor para transferencias bancarias internacionales.</p></div></div>
              <div className={styles.eduStep}><div className={styles.stepNumber}>5</div><div className={styles.stepContent}><strong>En el cajero extranjero, elige siempre la moneda local</strong><p>Cuando el cajero pregunte &quot;¿desea pagar en EUR o en [moneda local]?&quot;, selecciona SIEMPRE la moneda local. El pago en EUR activa el DCC (Dynamic Currency Conversion), que aplica spreads del 3–7% adicionales.</p></div></div>
              <div className={styles.eduStep}><div className={styles.stepNumber}>6</div><div className={styles.stepContent}><strong>Evita los cambios en aeropuertos y hoteles</strong><p>Son los puntos con peores tipos de cambio. Las casas de cambio de aeropuerto aplican spreads del 8–15%. Si necesitas efectivo al llegar, retira del cajero de la ciudad con tu tarjeta Revolut — mucho más barato.</p></div></div>
              <div className={styles.eduStep}><div className={styles.stepNumber}>7</div><div className={styles.stepContent}><strong>Para importes grandes, negocia directamente</strong><p>Para compras inmobiliarias, negocios internacionales o importes superiores a 20.000 €, contacta con brokers de divisas especializados (OFX, Moneycorp, Global Exchange). Pueden ofrecer spreads del 0,1–0,3%, muy por debajo de cualquier banco.</p></div></div>
            </div>
          </div>

          {/* 5. Tips */}
          <div className={styles.eduTips}>
            <h2>Trucos para cambiar divisas sin perder dinero</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}><span className={styles.tipIcon}>📱</span><strong>Revolut gratuito para viajes</strong><p>El plan gratuito de Revolut permite cambio sin comisiones hasta 1.000 €/mes en días laborables. Para viajes habituales, es suficiente y completamente gratuito.</p></div>
              <div className={styles.tipCard}><span className={styles.tipIcon}>⏰</span><strong>Evita cambiar en fin de semana con Revolut</strong><p>El mercado Forex cierra el fin de semana. Revolut aplica un +1% de margen el sábado y domingo para cubrirse. Cambia divisas el viernes por la tarde si puedes.</p></div>
              <div className={styles.tipCard}><span className={styles.tipIcon}>🏧</span><strong>Retira en cajeros locales, no en aeropuertos</strong><p>El cajero del banco local en la ciudad aplica el tipo interbancario. El cajero del aeropuerto aplica su propio tipo (peor). Usa tu tarjeta Revolut en cualquier cajero de la ciudad.</p></div>
              <div className={styles.tipCard}><span className={styles.tipIcon}>💸</span><strong>Para freelances: Wise Cuenta</strong><p>Wise ofrece cuentas bancarias locales en USD, GBP, EUR y otras divisas. Recibe como local, sin conversión hasta que quieras transferir. Ideal para trabajar con clientes internacionales.</p></div>
              <div className={styles.tipCard}><span className={styles.tipIcon}>🔔</span><strong>Alertas de tipo de cambio</strong><p>Wise y XE.com permiten configurar alertas cuando una divisa alcanza un tipo determinado. Útil si tienes una transferencia grande y quieres esperar un momento favorable.</p></div>
              <div className={styles.tipCard}><span className={styles.tipIcon}>📊</span><strong>Compara siempre antes de transferir</strong><p>Wise, Revolut y tu banco muestran el tipo aplicado antes de confirmar. Compara los tres en transferencias importantes. La diferencia puede ser significativa en importes altos.</p></div>
            </div>
          </div>

          {/* 6. Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Errores que te hacen perder dinero al cambiar divisas</strong>
            </div>
            <ul className={styles.warningList}>
              <li>Cambiar en la casa de cambio del aeropuerto — spreads del 8–15%, el método más caro con diferencia</li>
              <li>Aceptar el pago en euros cuando el cajero extranjero lo propone (DCC) — activa un cambio adicional del 3–7%</li>
              <li>Usar PayPal para cobrar en divisas extranjeras — spread del 3–4% más comisiones, muy por encima de Wise</li>
              <li>No verificar el spread antes de confirmar — la comisión visible es solo parte del coste; el spread oculto suele ser mayor</li>
              <li>Cambiar grandes importes con el banco tradicional sin comparar alternativas — puede costar 10–20 veces más que Wise</li>
              <li>Cambiar divisas en Revolut el fin de semana sin saberlo — aplica 1% extra que se puede evitar cambiando el viernes</li>
              <li>Pensar que &quot;es solo una pequeña comisión&quot; en transferencias recurrentes — en pagos mensuales, un 3% de diferencia acumula cientos o miles de euros al año</li>
            </ul>
          </div>

        </EducationalSection>

        <RelatedApps apps={getRelatedApps('conversor-divisas')} />
        <ShareCard appName="conversor-divisas" />
      <Footer appName="conversor-divisas" />
      </main>
    </div>
  );
}
