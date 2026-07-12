'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TestPhishing.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────────────────
// Banco de casos. Nombres de entidades genéricos (no imitan marcas reales).
// Ejemplos universales para todo el público hispanohablante.
// ─────────────────────────────────────────────────────────────────────────

type TipoCaso = 'email' | 'sms' | 'web';

interface Caso {
  id: string;
  tipo: TipoCaso;
  de?: string;
  extra?: string; // dirección/número mostrado
  asunto?: string;
  cuerpo: string;
  url?: string;
  esPhishing: boolean;
  senales: string[];
}

const CASOS: Caso[] = [
  {
    id: 'banco-bloqueo',
    tipo: 'email',
    de: 'Seguridad BancoUnión',
    extra: 'seguridad@bancounion-alertas-verificar.com',
    asunto: 'Su cuenta será bloqueada en 24 horas',
    cuerpo: 'Estimado cliente, hemos detectado un acceso inusual. Debe verificar su identidad inmediatamente o su cuenta será suspendida. Confirme sus datos en el siguiente enlace.',
    url: 'http://verificar-bancounion.secure-login.com',
    esPhishing: true,
    senales: [
      'El dominio del remitente no es el oficial del banco: añade palabras como "alertas-verificar".',
      'Crea urgencia y miedo ("bloqueada en 24 horas") para que actúes sin pensar.',
      'El enlace apunta a un dominio distinto del banco; un banco nunca pide verificar datos así.',
    ],
  },
  {
    id: 'paqueteria-aduana',
    tipo: 'sms',
    extra: '+34 611 22 33 44',
    cuerpo: 'Su paquete está retenido en aduana. Abone la tasa de 1,99 € para la entrega: http://envios-rapido.info/pago',
    esPhishing: true,
    senales: [
      'Una tasa pequeña (1,99 €) busca que no te lo pienses y pagues rápido.',
      'El enlace usa un dominio extraño (.info) que no es el de ninguna empresa de paquetería real.',
      'Piden pago por SMS con enlace: las entregas legítimas no cobran aduanas así.',
    ],
  },
  {
    id: 'streaming-recibo',
    tipo: 'email',
    de: 'Streaming+',
    extra: 'no-reply@streamingplus.com',
    asunto: 'Tu recibo de febrero',
    cuerpo: 'Gracias por seguir con nosotros. Te adjuntamos el recibo de tu suscripción mensual. Puedes consultar tu historial de pagos desde tu cuenta cuando quieras. No hace falta que hagas nada.',
    esPhishing: false,
    senales: [
      'No pide contraseñas ni datos bancarios ni mete prisa.',
      'El dominio del remitente es coherente con el servicio.',
      'Es una simple confirmación informativa: no te obliga a hacer clic en nada.',
    ],
  },
  {
    id: 'web-typosquat',
    tipo: 'web',
    cuerpo: 'Página de inicio de sesión de una red social a la que llegas desde un enlace de un mensaje. Fíjate en la barra de direcciones antes de escribir tu usuario y contraseña.',
    url: 'http://faceb00k-login-seguro.com',
    esPhishing: true,
    senales: [
      'El dominio imita al real cambiando letras por números (faceb00k con ceros).',
      'La conexión no es segura: la dirección empieza por http:// sin candado.',
      'Añade palabras tranquilizadoras ("login-seguro") que las webs reales no necesitan.',
    ],
  },
  {
    id: 'soporte-password',
    tipo: 'email',
    de: 'Soporte Técnico',
    extra: 'soporte@micuenta-ayuda.net',
    asunto: 'Actividad sospechosa detectada',
    cuerpo: 'Para proteger su cuenta, responda a este correo indicando su usuario y su contraseña actual para que podamos verificar su identidad.',
    esPhishing: true,
    senales: [
      'Ningún servicio legítimo te pide la contraseña por correo: es la señal más clara de fraude.',
      'El dominio del remitente no corresponde a ninguna empresa reconocible.',
      'Mezcla una excusa de seguridad con una petición que, precisamente, es insegura.',
    ],
  },
  {
    id: 'codigo-2fa',
    tipo: 'sms',
    extra: 'VERIFICA',
    cuerpo: 'Tu código de verificación es 483920. No lo compartas con nadie. Si no has solicitado este código, ignora este mensaje.',
    esPhishing: false,
    senales: [
      'No contiene enlaces ni pide que respondas con datos.',
      'Te avisa expresamente de no compartir el código: es el comportamiento correcto.',
      'Es un mensaje informativo que tú mismo has provocado al iniciar sesión.',
    ],
  },
  {
    id: 'premio-movil',
    tipo: 'email',
    de: 'Sorteos Premium',
    extra: 'ganador@promo-regalos-2026.com',
    asunto: '🎉 ¡Has sido seleccionado para un premio!',
    cuerpo: 'Enhorabuena, tu dirección ha resultado ganadora del sorteo de un teléfono de última generación. Reclama tu premio en las próximas 2 horas rellenando tus datos.',
    url: 'http://reclama-tu-premio.online',
    esPhishing: true,
    senales: [
      'Un premio que no has solicitado: si es demasiado bueno para ser verdad, no lo es.',
      'Cuenta atrás ("2 horas") para presionarte a actuar sin comprobar nada.',
      'Pide tus datos personales en un dominio desconocido.',
    ],
  },
  {
    id: 'compra-confirmacion',
    tipo: 'email',
    de: 'Tienda Central',
    extra: 'pedidos@tiendacentral.com',
    asunto: 'Confirmación de tu pedido #48213',
    cuerpo: 'Hemos recibido tu pedido de unos auriculares que hiciste esta mañana. Te avisaremos cuando salga del almacén. Si no reconoces esta compra, contáctanos desde la sección de ayuda de nuestra web.',
    esPhishing: false,
    senales: [
      'Corresponde a una compra que realmente has hecho, con número de pedido.',
      'No pide credenciales ni pagos adicionales.',
      'Te remite a la sección de ayuda de la web oficial en lugar de a un enlace externo.',
    ],
  },
  {
    id: 'banco-dispositivo',
    tipo: 'sms',
    extra: 'BancoUnión',
    cuerpo: 'BancoUnión: acceso desde un nuevo dispositivo. Si no fue usted, cancele la operación aquí: bit.ly/3xK9pQ',
    esPhishing: true,
    senales: [
      'Usa un enlace acortado (bit.ly) que oculta el destino real.',
      'Combina alarma ("si no fue usted") con un clic inmediato.',
      'Un banco no gestiona la seguridad de tu cuenta mediante enlaces por SMS.',
    ],
  },
  {
    id: 'jefe-transferencia',
    tipo: 'email',
    de: 'Dirección',
    extra: 'director.general@empresa-externo-mail.com',
    asunto: 'Encargo urgente y confidencial',
    cuerpo: 'Estoy en una reunión y no puedo hablar. Necesito que hagas una transferencia urgente a un proveedor. Es confidencial, no comentes con nadie y respóndeme solo por aquí.',
    esPhishing: true,
    senales: [
      'Suplantación de un superior (fraude del CEO) para saltarse los controles.',
      'La dirección real no es la corporativa habitual, aunque el nombre coincida.',
      'Urgencia + confidencialidad + cambio de canal: el patrón clásico de este fraude.',
    ],
  },
  {
    id: 'web-banco-legit',
    tipo: 'web',
    cuerpo: 'Accedes a la banca online tecleando tú mismo la dirección en el navegador (no desde un enlace). Compruebas la barra de direcciones antes de introducir tus claves.',
    url: 'https://www.bancounion.es',
    esPhishing: false,
    senales: [
      'La conexión es segura (https:// con candado).',
      'El dominio está bien escrito y es el oficial del banco, sin palabras añadidas.',
      'Has llegado escribiendo tú la dirección, no siguiendo un enlace de un mensaje.',
    ],
  },
  {
    id: 'devolucion-impuestos',
    tipo: 'email',
    de: 'Agencia de Recaudación',
    extra: 'devoluciones@tributos-reembolso.org',
    asunto: 'Tiene una devolución pendiente de 327,50 €',
    cuerpo: 'Le corresponde una devolución de impuestos. Para recibirla, introduzca los datos de su tarjeta bancaria en el formulario seguro antes de que caduque.',
    url: 'http://tributos-reembolso.org/cobro',
    esPhishing: true,
    senales: [
      'Las administraciones no piden los datos de tu tarjeta por correo con un enlace.',
      'Un reembolso concreto y una caducidad buscan que actúes por codicia y prisa.',
      'El dominio no es una sede oficial del organismo público.',
    ],
  },
  {
    id: 'cita-salud',
    tipo: 'sms',
    extra: 'CentroSalud',
    cuerpo: 'Recordatorio: tiene cita el 14/03 a las 10:00 en su centro de salud. Para anularla responda ANULAR.',
    esPhishing: false,
    senales: [
      'No incluye ningún enlace ni pide datos personales o bancarios.',
      'La acción que propone (responder ANULAR) no compromete tu seguridad.',
      'Es un recordatorio informativo coherente con un servicio que ya usas.',
    ],
  },
];

const TIPO_INFO: Record<TipoCaso, { icono: string; etiqueta: string }> = {
  email: { icono: '📧', etiqueta: 'Correo electrónico' },
  sms: { icono: '💬', etiqueta: 'SMS / Mensaje' },
  web: { icono: '🌐', etiqueta: 'Página web' },
};

function perfilPorPorcentaje(pct: number): { titulo: string; texto: string; emoji: string } {
  if (pct >= 90) return { titulo: 'Detector experto', emoji: '🕵️', texto: 'Tienes un ojo entrenadísimo. Reconoces las señales del fraude casi sin esfuerzo. ¡Ayuda a tu entorno a hacer lo mismo!' };
  if (pct >= 75) return { titulo: 'Buen ojo', emoji: '👀', texto: 'Detectas la mayoría de los engaños. Repasa los casos que fallaste para afinar aún más.' };
  if (pct >= 50) return { titulo: 'Vas por buen camino', emoji: '🧭', texto: 'Aciertas más de la mitad, pero algunos fraudes te pillan. Fíjate siempre en el dominio y en el tono de urgencia.' };
  return { titulo: 'Ojo por entrenar', emoji: '📚', texto: 'Cuidado: varios engaños te habrían colado. Repasa el resumen de señales y vuelve a intentarlo: se aprende rápido.' };
}

// ─────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────

export default function TestPhishingPage() {
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<boolean | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const caso = CASOS[indice];
  const total = CASOS.length;
  const respondido = seleccion !== null;
  const acerto = respondido && seleccion === caso.esPhishing;

  const responder = (dijoPhishing: boolean) => {
    if (respondido) return;
    setSeleccion(dijoPhishing);
    if (dijoPhishing === caso.esPhishing) setAciertos((a) => a + 1);
  };

  const siguiente = () => {
    if (indice < total - 1) {
      setIndice((i) => i + 1);
      setSeleccion(null);
    } else {
      setTerminado(true);
    }
  };

  const reiniciar = () => {
    setIndice(0);
    setSeleccion(null);
    setAciertos(0);
    setTerminado(false);
  };

  const pct = Math.round((aciertos / total) * 100);
  const perfil = perfilPorPorcentaje(pct);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🎣</span> Test ¿Es Phishing?
        </h1>
        <p className={styles.subtitle}>
          ¿Sabrías distinguir un mensaje legítimo de una estafa? Pon a prueba tu ojo con casos reales.
        </p>
      </header>

      <LegalNotice />

      {/* Quiz */}
      {!terminado && (
        <div className={styles.quiz}>
          {/* Progreso */}
          <div className={styles.progress}>
            <div className={styles.progressText}>
              Caso {indice + 1} de {total} · Aciertos: {aciertos}
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${((indice + (respondido ? 1 : 0)) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Tarjeta del caso */}
          <div className={styles.casoCard}>
            <div className={styles.casoTipo}>
              <span aria-hidden="true">{TIPO_INFO[caso.tipo].icono}</span> {TIPO_INFO[caso.tipo].etiqueta}
            </div>

            {caso.tipo === 'web' ? (
              <div className={styles.casoWeb}>
                <div className={styles.urlBar}>
                  <span className={styles.urlLock} aria-hidden="true">
                    {caso.url?.startsWith('https') ? '🔒' : '⚠️'}
                  </span>
                  <span className={styles.urlText}>{caso.url}</span>
                </div>
                <p className={styles.casoBody}>{caso.cuerpo}</p>
              </div>
            ) : (
              <div className={styles.casoContenido}>
                {caso.tipo === 'email' && (
                  <div className={styles.casoMeta}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>De:</span>
                      <span className={styles.metaValue}>{caso.de} &lt;{caso.extra}&gt;</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Asunto:</span>
                      <span className={styles.metaValue}><strong>{caso.asunto}</strong></span>
                    </div>
                  </div>
                )}
                {caso.tipo === 'sms' && (
                  <div className={styles.casoMeta}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Remitente:</span>
                      <span className={styles.metaValue}>{caso.extra}</span>
                    </div>
                  </div>
                )}
                <p className={styles.casoBody}>{caso.cuerpo}</p>
                {caso.url && <div className={styles.casoEnlace}>🔗 {caso.url}</div>}
              </div>
            )}
          </div>

          {/* Botones de respuesta */}
          {!respondido && (
            <div className={styles.answerButtons}>
              <button type="button" className={styles.btnPhishing} onClick={() => responder(true)}>
                <span aria-hidden="true">🎣</span> Es phishing
              </button>
              <button type="button" className={styles.btnLegit} onClick={() => responder(false)}>
                <span aria-hidden="true">✅</span> Es legítimo
              </button>
            </div>
          )}

          {/* Feedback */}
          {respondido && (
            <div
              className={`${styles.feedback} ${acerto ? styles.feedbackOk : styles.feedbackKo}`}
              role="alert"
            >
              <div className={styles.feedbackTitle}>
                <span aria-hidden="true">{acerto ? '✅' : '❌'}</span>{' '}
                {acerto ? '¡Correcto!' : 'Te habrían engañado.'}{' '}
                <span className={styles.feedbackVeredicto}>
                  Este caso {caso.esPhishing ? 'ERA phishing' : 'era legítimo'}.
                </span>
              </div>
              <p className={styles.feedbackSub}>
                {caso.esPhishing ? 'Señales que lo delataban:' : 'Por qué era de fiar:'}
              </p>
              <ul className={styles.senalesList}>
                {caso.senales.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <button type="button" className={styles.nextBtn} onClick={siguiente}>
                {indice < total - 1 ? 'Siguiente caso →' : 'Ver resultado →'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resultado final */}
      {terminado && (
        <div className={styles.resultsScreen} role="status" aria-live="polite">
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{aciertos}/{total}</span>
            <span className={styles.scoreLabel}>{pct}% de aciertos</span>
          </div>
          <div className={styles.perfil}>
            <h2><span aria-hidden="true">{perfil.emoji}</span> {perfil.titulo}</h2>
            <p>{perfil.texto}</p>
          </div>
          <button type="button" className={styles.restartBtn} onClick={reiniciar}>
            <span aria-hidden="true">🔄</span> Volver a intentarlo
          </button>
        </div>
      )}

      {/* ───────── Contenido educativo v2.0 ───────── */}
      <EducationalSection
        icon="🛡️"
        title="Todo sobre el phishing y cómo protegerte"
        subtitle="Las señales del fraude, tipos de engaño y qué hacer si caes"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Mensaje legítimo frente a phishing: en qué fijarte</h2>
          <p>
            La mayoría de los fraudes se detectan mirando los mismos puntos. Esta tabla resume las
            diferencias típicas entre un mensaje de fiar y uno fraudulento:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Señal</th>
                  <th>Mensaje legítimo</th>
                  <th>Phishing</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Tono</td><td>Informativo y tranquilo</td><td>Urgencia, amenaza o premio</td></tr>
                <tr><td>Remitente</td><td>Dominio oficial y coherente</td><td>Dominio raro o imitado</td></tr>
                <tr><td>Enlaces</td><td>Al sitio oficial (o ninguno)</td><td>Acortados o a dominios extraños</td></tr>
                <tr><td>Datos que pide</td><td>Nada sensible por ese canal</td><td>Contraseñas, tarjeta, códigos</td></tr>
                <tr><td>Saludo</td><td>Personalizado o de tu servicio</td><td>Genérico ("Estimado cliente")</td></tr>
                <tr><td>Redacción</td><td>Correcta</td><td>Faltas o traducción rara</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso / tipos */}
        <section className={styles.eduSection}>
          <h2>Los disfraces más habituales del phishing</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🏦</span> Tu banco</h3>
              <p>Avisos de bloqueo o accesos sospechosos que te empujan a "verificar" tus datos en un enlace falso.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">📦</span> Paquetería (smishing)</h3>
              <p>SMS de entregas retenidas que piden una pequeña tasa. El canal por SMS es hoy uno de los más usados.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">🏛️</span> Administración pública</h3>
              <p>Supuestas devoluciones o multas que piden datos bancarios. Los organismos nunca lo hacen así.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h3><span aria-hidden="true">💼</span> Tu jefe o un proveedor</h3>
              <p>Fraude del CEO: alguien suplanta a un superior y pide una transferencia urgente y confidencial.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Qué es exactamente el phishing?</h3>
              <p>Es un fraude en el que alguien se hace pasar por una entidad de confianza para robarte datos (contraseñas, tarjeta, códigos) o colarte un archivo malicioso. Llega por correo, SMS, llamada o mensajería.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo compruebo si un enlace es seguro sin hacer clic?</h3>
              <p>En un ordenador, pasa el ratón por encima del enlace (sin pulsar) y mira abajo la dirección real. En el móvil, mantén pulsado el enlace para previsualizarla. Desconfía si el dominio no coincide exactamente con el oficial.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El candado (https) garantiza que una web es de fiar?</h3>
              <p>No del todo. El candado solo indica que la conexión está cifrada, pero los estafadores también pueden tener candado. Comprueba además que el dominio esté bien escrito y sea el oficial, no una imitación.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué hago si ya he introducido mis datos?</h3>
              <p>Cambia de inmediato la contraseña afectada y la de cualquier sitio donde la reutilizaras, activa la verificación en dos pasos, avisa a tu banco si diste datos financieros y vigila tus movimientos. Guarda el mensaje y repórtalo.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Los mensajes con mi nombre son más de fiar?</h3>
              <p>No necesariamente. Tras las filtraciones de datos, muchos ataques ya incluyen tu nombre o parte de tu información para parecer creíbles (phishing dirigido o "spear phishing"). Sigue mirando el dominio y lo que te piden.</p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.eduSection}>
          <h2>Cómo analizar un mensaje sospechoso en 5 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Respira: la urgencia es la trampa</h3>
                <p>Si el mensaje mete prisa o miedo, párate. Esa presión es precisamente la herramienta del estafador.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Mira el remitente real</h3>
                <p>No te fíes del nombre mostrado: comprueba la dirección o el dominio completo carácter a carácter.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Examina el enlace antes de pulsar</h3>
                <p>Previsualiza el destino. Si no coincide con el sitio oficial o está acortado, no entres por ahí.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Pregúntate qué te piden</h3>
                <p>Contraseñas, tarjeta o códigos por correo o SMS: ninguna empresa legítima los pide por esos canales.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Verifica por tu cuenta</h3>
                <p>Si dudas, entra tú mismo tecleando la web oficial o llama al teléfono conocido; nunca por los datos del mensaje.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.eduSection}>
          <h2>Buenas prácticas para no morder el anzuelo</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔐</span>
              <p>Activa la verificación en dos pasos: aunque roben tu contraseña, no bastará para entrar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⌨️</span>
              <p>Accede a banca y servicios tecleando tú la dirección, nunca desde enlaces de mensajes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <p>Mantén el sistema y el navegador actualizados: corrigen fallos que el fraude aprovecha.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📢</span>
              <p>Ante la duda, verifica por un canal oficial distinto y avisa a tu entorno del intento.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores frecuentes */}
        <section className={styles.eduSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">🚫</span>
              <h2>Errores que aprovechan los estafadores</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Actuar por impulso</strong> ante la urgencia sin comprobar el remitente ni el enlace.</li>
              <li><strong>Fiarse del nombre mostrado</strong> en vez de la dirección o el dominio real.</li>
              <li><strong>Dar por segura una web solo por el candado</strong> https, sin mirar el dominio.</li>
              <li><strong>Reutilizar contraseñas</strong>: si una se filtra por phishing, caen todas tus cuentas.</li>
              <li><strong>No activar la verificación en dos pasos</strong>, la barrera que frena la mayoría de robos.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-phishing')} />
      <ShareCard appName="test-phishing" />
      <Footer appName="test-phishing" />
    </div>
  );
}
