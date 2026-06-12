'use client';

import { useState, useEffect } from 'react';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatCurrency } from '@/lib/formatters';
import { jsonLd } from './metadata';
import styles from './CalculadoraPropinas.module.css';
import { getRelatedApps } from '@/data/app-relations';
import { SMI_2026 } from '@/data/fiscal';

// Porcentaje de propina habitual por país/contexto
const PORCENTAJE_POR_PAIS: Record<string, number> = {
  'es-10': 10,
  'us-18': 18,
  'mx-12': 12,
  'uk-10': 10,
  'fr-8': 8,
  'de-8': 8,
  'jp-0': 0,
};

export default function CalculadoraPropinas() {
  // Estados
  const [monto, setMonto] = useState<number>(0);
  const [porcentaje, setPorcentaje] = useState<number>(15);
  const [personas, setPersonas] = useState<number>(1);
  const [paisSeleccionado, setPaisSeleccionado] = useState<string>('custom');

  // Cargar preferencias guardadas
  useEffect(() => {
    const prefs = localStorage.getItem('prefs-propinas');
    if (prefs) {
      try {
        const datos = JSON.parse(prefs);
        if (datos.porcentaje) setPorcentaje(datos.porcentaje);
        if (datos.personas) setPersonas(datos.personas);
        if (datos.pais) setPaisSeleccionado(datos.pais);
      } catch (e) {
        console.error('Error al cargar preferencias:', e);
      }
    }
  }, []);

  // Guardar preferencias
  useEffect(() => {
    const prefs = {
      porcentaje,
      personas,
      pais: paisSeleccionado,
    };
    localStorage.setItem('prefs-propinas', JSON.stringify(prefs));
  }, [porcentaje, personas, paisSeleccionado]);

  // Cálculos
  const propina = monto * (porcentaje / 100);
  const total = monto + propina;
  const totalPorPersona = total / personas;

  // Función para establecer porcentaje desde botones
  const establecerPorcentaje = (valor: number) => {
    setPorcentaje(valor);
    setPaisSeleccionado('custom');
  };

  // Función para manejar cambio de país
  const cambiarPais = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    setPaisSeleccionado(valor);

    if (valor in PORCENTAJE_POR_PAIS) {
      setPorcentaje(PORCENTAJE_POR_PAIS[valor]);
    }
  };

  // Función para resetear
  const resetear = () => {
    setMonto(0);
    setPorcentaje(15);
    setPersonas(1);
    setPaisSeleccionado('custom');
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="calculadora-propinas" />

      {/* Logo meskeIA */}
      <MeskeiaLogo />

      <LegalNotice lastUpdated="2026-02-02" />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            💶 Calculadora de Propinas
          </h1>
          <p className={styles.subtitle}>
            Calcula la propina automáticamente según el país y divide la cuenta entre varias personas
          </p>
        </header>

        {/* Formulario */}
        <div className={styles.formSection}>
          {/* Input de monto */}
          <div className={styles.inputGroup}>
            <label htmlFor="monto" className={styles.label}>
              Monto de la cuenta (€)
            </label>
            <input
              type="number"
              id="monto"
              className={styles.input}
              value={monto || ''}
              onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              min={0}
              step={0.01}
            />
          </div>

          {/* Botones de porcentaje */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Selecciona porcentaje:</label>
            <div className={styles.porcentajes}>
              <button
                type="button"
                className={`${styles.btnPorcentaje} ${
                  porcentaje === 10 ? styles.activo : ''
                }`}
                onClick={() => establecerPorcentaje(10)}
              >
                10%
              </button>
              <button
                type="button"
                className={`${styles.btnPorcentaje} ${
                  porcentaje === 15 ? styles.activo : ''
                }`}
                onClick={() => establecerPorcentaje(15)}
              >
                15%
              </button>
              <button
                type="button"
                className={`${styles.btnPorcentaje} ${
                  porcentaje === 20 ? styles.activo : ''
                }`}
                onClick={() => establecerPorcentaje(20)}
              >
                20%
              </button>
            </div>
          </div>

          {/* Porcentaje personalizado */}
          <div className={styles.inputGroup}>
            <label htmlFor="porcentaje" className={styles.label}>
              Porcentaje personalizado (%)
            </label>
            <input
              type="number"
              id="porcentaje"
              className={styles.input}
              value={porcentaje || ''}
              onChange={(e) => {
                setPorcentaje(parseFloat(e.target.value) || 0);
                setPaisSeleccionado('custom');
              }}
              min={0}
              max={100}
              step={0.5}
            />
          </div>

          {/* Selector de país */}
          <div className={styles.inputGroup}>
            <label htmlFor="pais" className={styles.label}>
              País/Contexto de propina
            </label>
            <select
              id="pais"
              className={styles.select}
              value={paisSeleccionado}
              onChange={cambiarPais}
            >
              <option value="es-10">🇪🇸 España (10%)</option>
              <option value="us-18">🇺🇸 Estados Unidos (18%)</option>
              <option value="mx-12">🇲🇽 México (12%)</option>
              <option value="uk-10">🇬🇧 Reino Unido (10%)</option>
              <option value="fr-8">🇫🇷 Francia (8%)</option>
              <option value="de-8">🇩🇪 Alemania (8%)</option>
              <option value="jp-0">🇯🇵 Japón (0% - No propina)</option>
              <option value="custom">✏️ Personalizado</option>
            </select>
          </div>

          {/* División de cuenta */}
          <div className={styles.inputGroup}>
            <label htmlFor="personas" className={styles.label}>
              Número de personas
            </label>
            <input
              type="number"
              id="personas"
              className={styles.input}
              value={personas || ''}
              onChange={(e) => setPersonas(parseInt(e.target.value) || 1)}
              min={1}
              max={50}
              step={1}
            />
          </div>

          {/* Botón Reset */}
          <button
            type="button"
            className={styles.btnReset}
            onClick={resetear}
          >
            🔄 Limpiar
          </button>
        </div>

        {/* Resultados usando ResultCard */}
        <div className={styles.resultsSection}>
          <ResultCard
            title="Monto original"
            value={formatCurrency(monto)}
            variant="default"
          />
          <ResultCard
            title="Propina total"
            value={formatCurrency(propina)}
            description={`${porcentaje}%`}
            variant="info"
          />
          <ResultCard
            title="Total a pagar"
            value={formatCurrency(total)}
            variant="highlight"
          />
          {personas > 1 && (
            <ResultCard
              title="Por persona"
              value={formatCurrency(totalPorPersona)}
              description={`${personas} ${personas === 1 ? 'persona' : 'personas'}`}
              variant="success"
            />
          )}
        </div>

        <DisclaimerCard
          variant="financial"
          severity="high"
          context="calculadora-propinas"
          collapsible={false}
        />

        

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="¿Quieres aprender más sobre Propinas?"
          subtitle="Descubre porcentajes por país, cuándo dejar más y consejos prácticos"
        >
          <section className={styles.guideSection}>
            <h2>Conceptos Clave</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🇪🇸 España: 5-10%</h4>
                <p>
                  Opcional, solo para servicio excepcional. No es obligatorio ni esperado.
                  Redondear al alza es lo más común.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>🇺🇸 Estados Unidos: 15-20%</h4>
                <p>
                  Obligatorio socialmente. Los camareros dependen de propinas ya que el
                  salario base es muy bajo. Menos del 15% es ofensivo.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>🇯🇵 Japón: 0%</h4>
                <p>
                  Dejar propina se considera ofensivo. El buen servicio es parte de la
                  cultura y está incluido en el precio.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>💡 Truco del 10%</h4>
                <p>
                  Mueve el decimal un lugar: 45€ → 4,50€. Para 15% suma la mitad: 4,50€ + 2,25€ = 6,75€.
                  Rápido y sin calculadora.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿Debo dejar propina si el servicio ya está incluido?</summary>
                <p>
                  Si la cuenta ya incluye &quot;servicio&quot; o &quot;service charge&quot;, no es necesario
                  añadir más. Revisa siempre el desglose de la factura antes de calcular.
                  Si el servicio fue excepcional, puedes añadir algo extra.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cuánto dejar en grupos grandes?</summary>
                <p>
                  Para 6 o más personas, 15-18% es apropiado ya que requiere más trabajo
                  del personal. Algunos restaurantes añaden propina automática para grupos.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Es mejor propina en efectivo o tarjeta?</summary>
                <p>
                  Muchos camareros prefieren efectivo porque lo reciben directamente sin
                  esperar al cierre de caja. Sin embargo, tarjeta es perfectamente aceptable.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué hago si el servicio fue malo?</summary>
                <p>
                  Puedes reducir la propina, pero considera hablar con el gerente sobre el
                  problema. Un mal día del camarero no siempre justifica eliminar la propina
                  completamente.
                </p>
              </details>
            </div>
          </section>

          {/* ── SECCIÓN 1: Tabla Comparativa ── */}
          <section className={styles.guideSection}>
            <h2>Propinas habituales por contexto en España</h2>
            <p>
              La propina en España es voluntaria en todos los casos. Estos rangos reflejan
              lo que la mayoría de clientes deja cuando queda satisfecho con el servicio.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Contexto</th>
                    <th>Rango habitual</th>
                    <th>Importe ejemplo (50 €)</th>
                    <th>Forma recomendada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🍽️ Restaurante (cena)</td>
                    <td>5 – 10 %</td>
                    <td>2,50 – 5,00 €</td>
                    <td>Efectivo sobre la mesa</td>
                  </tr>
                  <tr>
                    <td>🍺 Bar / café</td>
                    <td>Redondear al alza</td>
                    <td>0,50 – 1,00 €</td>
                    <td>Dejar cambio en el platillo</td>
                  </tr>
                  <tr>
                    <td>🚕 Taxi</td>
                    <td>Redondear o 5 %</td>
                    <td>0,50 – 2,00 €</td>
                    <td>Decir &quot;quédate el cambio&quot;</td>
                  </tr>
                  <tr>
                    <td>🏨 Hotel (servicio habitaciones)</td>
                    <td>1 – 2 € por servicio</td>
                    <td>1 – 2 €</td>
                    <td>Efectivo en bandeja</td>
                  </tr>
                  <tr>
                    <td>💇 Peluquería / estética</td>
                    <td>5 – 10 %</td>
                    <td>2,50 – 5,00 €</td>
                    <td>Efectivo al profesional</td>
                  </tr>
                  <tr>
                    <td>🛵 Delivery (app)</td>
                    <td>1 – 2 € fijos</td>
                    <td>1 – 2 €</td>
                    <td>En la app o en efectivo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── SECCIÓN 2: Casos de Uso por Perfil ── */}
          <section className={styles.guideSection}>
            <h2>Cómo actúa cada perfil</h2>
            <p>
              La propina adecuada depende del contexto cultural y de las expectativas del
              lugar. Aquí tienes cuatro perfiles reales.
            </p>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
                  <h4>Turista extranjero</h4>
                </div>
                <p className={styles.escenarioExample}>
                  Viene de EEUU y está acostumbrado a dejar 18-20 %. En España puede
                  bajar a 10 % en restaurantes sin que nadie se ofenda.
                </p>
                <p className={styles.escenarioTip}>
                  Consejo: adapta el porcentaje al país donde estés. La calculadora te
                  permite seleccionar el estándar local.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🇪🇸</span>
                  <h4>Español habitual</h4>
                </div>
                <p className={styles.escenarioExample}>
                  Cena de 60 € para dos personas. Deja 5 € en efectivo (≈ 8 %) y divide
                  el resto con tarjeta.
                </p>
                <p className={styles.escenarioTip}>
                  Consejo: el redondeo al alza (63 → 65 €) es la forma más sencilla y
                  cómoda en bares y cafeterías.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💎</span>
                  <h4>Cliente de restaurante de lujo</h4>
                </div>
                <p className={styles.escenarioExample}>
                  Menú degustación de 200 €. Deja 20 € (10 %) al maitre si el servicio
                  fue impecable, o lo incluye en el pago con tarjeta.
                </p>
                <p className={styles.escenarioTip}>
                  Consejo: en restaurantes de alta gama es habitual preguntar si el
                  servicio ya está incluido antes de añadir propina.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🛵</span>
                  <h4>Usuario de apps de delivery</h4>
                </div>
                <p className={styles.escenarioExample}>
                  Pedido de 25 €. Añade 1,50 € de propina desde la app, especialmente
                  si el repartidor llega puntual con mal tiempo.
                </p>
                <p className={styles.escenarioTip}>
                  Consejo: la propina en apps suele llegar íntegra al repartidor. Es
                  la forma más directa de reconocer el esfuerzo.
                </p>
              </div>
            </div>
          </section>

          {/* ── SECCIÓN 3: FAQ Ampliada ── */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes sobre propinas en España</h2>
            <ul className={styles.faqList}>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Es obligatorio dejar propina en España?</summary>
                  <p>
                    No. La propina es completamente voluntaria en España. A diferencia de
                    EEUU o Canadá, el salario de camareros y hosteleros está regulado por
                    convenio colectivo y no depende de las propinas para llegar a un sueldo
                    digno. Dejar propina es un gesto de reconocimiento, no una obligación.
                  </p>
                  <p className={styles.faqTip}>
                    Dato: según estimaciones del sector (Encuesta de Estructura Salarial
                    del INE), el salario medio en hostelería en España suele rondar los
                    1.200-1.400 € brutos/mes sin propinas, aunque varía según convenio
                    provincial y categoría profesional.
                  </p>
                </details>
              </li>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Cuánto dejar de propina en un restaurante español?</summary>
                  <p>
                    El rango habitual es 5-10 % del importe de la cuenta. Para una cena de
                    50 € entre dos personas, entre 2,50 € y 5 € es perfectamente apropiado.
                    Si el servicio fue excepcional o la velada especial, puedes llegar al
                    10-15 %.
                  </p>
                </details>
              </li>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Qué pasa si pago con tarjeta? ¿Puedo dar propina?</summary>
                  <p>
                    Sí. Muchos datáfonos modernos permiten añadir propina al pagar con
                    tarjeta. Si el terminal no lo permite, puedes dejar la propina en
                    efectivo sobre la mesa o en el platillo. El empleado la recibe igual.
                    Algunos prefieren efectivo porque evita la espera del cierre de caja.
                  </p>
                </details>
              </li>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Se deja propina en taxi en España?</summary>
                  <p>
                    No es habitual ni esperado, pero sí apreciado. Lo más común es redondear
                    la tarifa: si el taxímetro marca 8,60 €, dar 9 € y decir &quot;quédate el
                    cambio&quot;. En aeropuertos o trayectos largos con equipaje, un 5 % extra
                    es un gesto valorado.
                  </p>
                </details>
              </li>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Cómo se reparte la propina entre los camareros?</summary>
                  <p>
                    Depende de cada establecimiento. En muchos restaurantes la propina se
                    pone en una caja común y se reparte a partes iguales al final del turno
                    entre el equipo de sala (y a veces cocina). En bares pequeños o cafeterías
                    independientes suele quedarse quien atendió la mesa. Si te interesa que
                    llegue a una persona concreta, dásela en mano.
                  </p>
                </details>
              </li>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Las propinas tributan en el IRPF del hostelero?</summary>
                  <p>
                    Sí. Las propinas son rendimientos del trabajo y deben declararse en el
                    IRPF. El empleado está obligado a comunicarlas a la empresa para su
                    inclusión en nómina, o bien declararlas directamente en la Renta como
                    rendimiento íntegro. En la práctica, las propinas en efectivo pequeñas
                    suelen no declararse, aunque legalmente sí corresponde hacerlo.
                  </p>
                  <p className={styles.faqTip}>
                    Referencia: art. 17 Ley IRPF (Ley 35/2006) y consultas vinculantes DGT.
                  </p>
                </details>
              </li>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Cuándo está justificado no dejar propina?</summary>
                  <p>
                    Cuando el servicio fue manifiestamente deficiente (larga espera sin
                    explicación, errores repetidos en el pedido, trato descortés). También
                    si la cuenta ya incluye un recargo de servicio explícito. En Japón,
                    Corea del Sur o Singapur, dejar propina puede considerarse ofensivo o
                    innecesario culturalmente.
                  </p>
                </details>
              </li>
              <li className={styles.faqItem}>
                <details>
                  <summary>¿Cuáles son las diferencias entre España y EEUU?</summary>
                  <p>
                    En EEUU la propina es prácticamente obligatoria (15-20 %) porque el
                    salario mínimo para camareros puede ser tan bajo como 2,13 $/hora (salario
                    federal con propinas). En España el SMI en 2026 es de{' '}
                    {formatCurrency(SMI_2026.mensual14)}/mes (14 pagas) y aplica a todos los
                    trabajadores. Por eso en España la propina es un extra de reconocimiento,
                    no una necesidad económica estructural.
                  </p>
                </details>
              </li>
            </ul>
          </section>

          {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
          <section className={styles.guideSection}>
            <h2>Cómo calcular y dar la propina: 7 pasos</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <strong>Revisa la factura completa</strong>
                  <p>
                    Antes de calcular, comprueba si ya figura un &quot;recargo de servicio&quot; o
                    &quot;service charge&quot;. Si existe, no añadas propina adicional salvo que
                    quieras.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <strong>Introduce el importe total</strong>
                  <p>
                    Usa el campo &quot;Monto de la cuenta&quot; de esta calculadora. Introduce el
                    subtotal sin propina (el importe antes del IVA si te lo desglosaron).
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <strong>Elige el porcentaje según el contexto</strong>
                  <p>
                    Selecciona el país en el desplegable o ajusta manualmente: 5-10 % para
                    España, 15-20 % para EEUU, redondear al alza para bares y taxis en España.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <strong>Ajusta por calidad del servicio</strong>
                  <p>
                    Servicio correcto → porcentaje estándar. Servicio excelente → sube un
                    3-5 % adicional. Servicio deficiente → reduce o prescinde. Siempre es
                    tu decisión.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <strong>Divide entre comensales si sois varios</strong>
                  <p>
                    Introduce el número de personas. La calculadora te mostrará cuánto
                    corresponde pagar a cada uno (cuenta + propina proporcional).
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">6</span>
                <div className={styles.stepContent}>
                  <strong>Decide el método de pago de la propina</strong>
                  <p>
                    Efectivo: más inmediato para el empleado. Tarjeta: si el datáfono lo
                    permite. App: en servicios de delivery, desde la aplicación antes de cerrar
                    el pedido.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">7</span>
                <div className={styles.stepContent}>
                  <strong>Entrega la propina de forma clara</strong>
                  <p>
                    Deja el efectivo en el platillo o díselo al camarero al devolver el TPV.
                    Evita dejarlo debajo de vasos o donde pueda confundirse con cambio
                    olvidado.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* ── SECCIÓN 5: Mejores Prácticas ── */}
          <section className={styles.guideSection}>
            <h2>6 consejos para dar propina correctamente</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💶</span>
                <h4>Lleva siempre algo de efectivo</h4>
                <p>
                  Aunque pagues con tarjeta, tener 5-10 € en monedas te permite dar
                  propina incluso si el datáfono no lo permite. Es el método más
                  apreciado por el personal.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <h4>Calcula sobre el subtotal, no sobre el IVA</h4>
                <p>
                  Si la factura desglosa el subtotal y el IVA por separado, calcula la
                  propina sobre el subtotal. El IVA no es parte del servicio prestado.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">👥</span>
                <h4>En grupos, acuérdalo antes</h4>
                <p>
                  Antes de pedir la cuenta, decide con tu grupo si vais a dejar propina
                  y a qué porcentaje. Evita la incomodidad de discutirlo al final cuando
                  el camarero está esperando.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌍</span>
                <h4>Infórmate del estándar local al viajar</h4>
                <p>
                  En Japón no se deja propina. En EEUU el 15 % es el mínimo aceptable.
                  En Alemania se redondea. Investiga antes de viajar para no ofender
                  ni quedarte corto.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
                <h4>Da la propina al terminar, no al principio</h4>
                <p>
                  Dar propina al inicio puede malinterpretarse. La propina valora el
                  servicio ya recibido. Deja siempre que el servicio concluya antes de
                  decidir el importe.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🛵</span>
                <h4>En delivery, la propina en la app es la mejor opción</h4>
                <p>
                  Añadir la propina desde la aplicación antes de confirmar el pedido
                  garantiza que el repartidor la recibe. Esperar a dársela en mano no
                  siempre es posible (pedidos en portal, horarios nocturnos, etc.).
                </p>
              </div>
            </div>
          </section>

          {/* ── SECCIÓN 6: Warning Box ── */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h3>6 errores habituales al dar propina</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Confundir propina con IVA.</strong> El IVA ya está incluido en
                  el precio y va al Estado. La propina va íntegra al establecimiento o al
                  empleado. Nunca calcules la propina sobre el IVA por separado.
                </li>
                <li>
                  <strong>Dejar propina en efectivo cuando el ticket incluye &quot;servicio&quot;.</strong>{' '}
                  Algunos restaurantes ya cobran un porcentaje por servicio en la factura.
                  Si no lo lees, puedes estar pagando dos veces.
                </li>
                <li>
                  <strong>Propina por tarjeta sin comprobar si llega al empleado.</strong>{' '}
                  En ciertos establecimientos la propina con tarjeta pasa por caja y puede
                  no distribuirse entre el personal. Pregunta o usa efectivo si tienes dudas.
                </li>
                <li>
                  <strong>Dar el mismo porcentaje en todos los países.</strong> El 10 % que
                  es generoso en España puede ser ofensivamente bajo en EEUU. Consulta
                  siempre el estándar local.
                </li>
                <li>
                  <strong>Dejar la propina debajo de vasos o platos.</strong> El personal
                  puede no identificarlo como propina y dejarlo sin recoger. Colócala
                  visiblemente en el platillo del cambio o entrégala directamente.
                </li>
                <li>
                  <strong>Olvidar la propina en delivery por creer que &quot;ya está incluida&quot;.</strong>{' '}
                  Los cargos de servicio de las apps (Glovo, Uber Eats, Just Eat) van a la
                  plataforma, no al repartidor. La propina es la única compensación directa
                  para quien trae el pedido.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>
      </main>

      {/* Footer meskeIA */}
      <RelatedApps apps={getRelatedApps('calculadora-propinas')} />
      <ShareCard appName="Calculadora de Propinas" />
      <Footer appName="Calculadora de Propinas" />
    </>
  );
}
