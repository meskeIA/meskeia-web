'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaSeguridadInternet.module.css';
import { MeskeiaLogo, Footer, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import RelatedApps from '@/components/RelatedApps';

// ─── Herramientas del journey ───

const tools = [
  {
    id: 'evaluador-fortaleza-contrasena',
    name: 'Evaluador de Fortaleza de Contraseñas',
    icon: '🔒',
    url: '/evaluador-fortaleza-contrasena/',
    question: '¿Es segura mi contraseña?',
    description: 'Mide su entropía, cuánto tardaría en descifrarse y qué patrones débiles tiene. Todo en tu navegador.',
    step: 1,
    recomendacion: 'Empieza probando la contraseña de tu correo principal',
  },
  {
    id: 'generador-contrasenas',
    name: 'Generador de Contraseñas',
    icon: '🔑',
    url: '/generador-contrasenas/',
    question: '¿Cómo creo contraseñas fuertes?',
    description: 'Genera claves largas y aleatorias, distintas para cada servicio e imposibles de adivinar.',
    step: 2,
    recomendacion: 'Crea una única por cuenta y guárdala en un gestor',
  },
  {
    id: 'test-phishing',
    name: 'Test ¿Es Phishing?',
    icon: '🎣',
    url: '/test-phishing/',
    question: '¿Sabría reconocer una estafa?',
    description: 'Entrena tu ojo con casos reales de correo, SMS y webs fraudulentas y aprende las señales que los delatan.',
    step: 3,
    recomendacion: 'Haz el test y comparte lo aprendido con tu familia',
  },
  {
    id: 'editor-exif',
    name: 'Editor EXIF',
    icon: '📷',
    url: '/editor-exif/',
    question: '¿Qué datos ocultos revelan mis fotos?',
    description: 'Visualiza y elimina los metadatos (ubicación GPS, dispositivo, fecha) antes de compartir imágenes.',
    step: 4,
    recomendacion: 'Límpialas antes de subirlas a redes o webs',
  },
  {
    id: 'generador-hashes',
    name: 'Generador de Hashes',
    icon: '#️⃣',
    url: '/generador-hashes/',
    question: '¿Esta descarga es la original?',
    description: 'Calcula el hash (SHA-256 y otros) de un archivo para comprobar que no ha sido manipulado.',
    step: 5,
    recomendacion: 'Compáralo con el que publica la fuente oficial',
  },
  {
    id: 'curso-criptografia-seguridad',
    name: 'Curso de Criptografía y Seguridad',
    icon: '🔐',
    url: '/curso-criptografia-seguridad/',
    question: '¿Quiero entenderlo a fondo?',
    description: 'De los cifrados históricos a la seguridad moderna: contraseñas, hashes, doble factor y HTTPS explicados.',
    step: 6,
    recomendacion: 'Para pasar de usuario a entender el porqué',
  },
];

// ─── Pasos del journey ───

const journeySteps = [
  {
    number: 1,
    title: 'Blinda tus contraseñas',
    description:
      'La mayoría de los accesos no autorizados empiezan por una contraseña débil o reutilizada. Usa claves largas (14+ caracteres), únicas para cada servicio, y apóyate en un gestor de contraseñas para no tener que recordarlas. Lo que más suma no es la rareza de los símbolos, sino la longitud.',
    tip: 'Para las pocas claves que sí memorizas (correo, gestor), usa una frase larga de palabras al azar: "trueno-mesa-caballo-limón" es fácil de recordar y muy difícil de adivinar.',
  },
  {
    number: 2,
    title: 'Pon una segunda barrera: la verificación en dos pasos',
    description:
      'El 2FA (o doble factor) exige un segundo código además de la contraseña, así que aunque te la roben no basta para entrar. Actívalo en tus cuentas críticas: correo, banca y redes sociales. Es, probablemente, la medida que más protege por el poco esfuerzo que cuesta.',
    tip: 'Mejor una app de autenticación o una llave física que el SMS: los códigos por mensaje se pueden interceptar o desviar con técnicas de suplantación de la línea.',
  },
  {
    number: 3,
    title: 'Aprende a oler el fraude',
    description:
      'El phishing se cuela por correo, SMS y mensajería haciéndose pasar por tu banco, una empresa de paquetería o una red social. La clave para detectarlo es fijarse siempre en lo mismo: el tono de urgencia, el remitente real y el destino del enlace. Entrenar el ojo con ejemplos reduce muchísimo el riesgo de caer.',
    tip: 'Ante la duda, no pulses el enlace del mensaje: entra tú mismo tecleando la web oficial o usa la app, y verifica por un canal que ya conozcas.',
  },
  {
    number: 4,
    title: 'Cuida tu privacidad y tu huella digital',
    description:
      'Cada foto que compartes puede llevar metadatos con tu ubicación exacta, y cada app pide permisos que no siempre necesita. Comparte los datos mínimos, revisa los permisos de tus aplicaciones y limpia la información oculta de los archivos antes de publicarlos. Menos rastro, menos superficie de ataque.',
    tip: 'Antes de subir una foto hecha con el móvil, elimina sus metadatos EXIF: evitarás revelar dónde vives, trabajas o dónde estaban tus hijos.',
  },
  {
    number: 5,
    title: 'Mantén todo al día y descarga con cabeza',
    description:
      'Buena parte de los ataques aprovechan fallos ya corregidos en versiones antiguas. Mantén actualizados el sistema, el navegador y las apps. Descarga solo desde fuentes oficiales y, cuando el programa sea sensible, comprueba que el archivo no ha sido alterado verificando su hash.',
    tip: 'Activa las actualizaciones automáticas siempre que puedas: la seguridad que no depende de tu memoria es la que de verdad funciona.',
  },
  {
    number: 6,
    title: 'Ten un plan por si algo sale mal',
    description:
      'La seguridad total no existe, así que prepárate para reaccionar. Haz copias de seguridad de lo importante, ten claro cómo recuperar tus cuentas y sabe qué pasos dar si detectas un acceso extraño o caes en una estafa. Actuar rápido limita muchísimo el daño.',
    tip: 'Guarda los códigos de recuperación de tus cuentas en un lugar seguro y offline: son tu salvavidas si pierdes el acceso al segundo factor.',
  },
];

// ─── FAQs ───

const faqData = [
  {
    question: '¿Qué es la verificación en dos pasos (2FA) y por qué es tan importante?',
    answer:
      'Es un segundo requisito para entrar en una cuenta, además de la contraseña: normalmente un código temporal de una app, una llave física o una confirmación en tu móvil. Su valor es enorme porque, aunque un atacante consiga tu contraseña (por una filtración o un phishing), sin ese segundo factor no puede entrar. Actívala al menos en tu correo principal, la banca y tus redes sociales.',
  },
  {
    question: '¿Es realmente seguro usar un gestor de contraseñas?',
    answer:
      'Sí, y para la mayoría de la gente es mucho más seguro que la alternativa (reutilizar claves o usar unas débiles y memorizables). Un buen gestor guarda tus contraseñas cifradas con una contraseña maestra que solo tú conoces. El riesgo real de no usarlo —repetir la misma clave en todos los sitios— es muy superior. Protege el gestor con una contraseña maestra larga y con doble factor.',
  },
  {
    question: '¿Cómo sé si mis datos han aparecido en una filtración?',
    answer:
      'Las grandes filtraciones de datos son frecuentes y no dependen de ti, sino de las empresas donde te registras. Existen servicios que te avisan si tu correo aparece en una fuga conocida. Si te llega un aviso o sospechas de uno, cambia de inmediato la contraseña afectada y la de cualquier sitio donde la reutilizaras, y activa el doble factor.',
  },
  {
    question: '¿Es peligroso conectarse a una wifi pública?',
    answer:
      'Puede serlo si la red no es de confianza. Hoy la mayoría de webs y apps cifran el tráfico (HTTPS), lo que reduce el riesgo, pero conviene ser prudente: evita operaciones sensibles como la banca en redes abiertas, comprueba que el nombre de la red es el legítimo del local y desactiva la conexión automática a redes desconocidas.',
  },
  {
    question: '¿Qué hago si creo que he caído en un phishing o me han hackeado una cuenta?',
    answer:
      'Actúa rápido: cambia la contraseña de la cuenta afectada y de cualquier otra donde la reutilizaras, activa la verificación en dos pasos, cierra las sesiones abiertas desde los ajustes de seguridad y revisa que no hayan cambiado tu correo o teléfono de recuperación. Si compartiste datos bancarios, avisa a tu banco. Conserva los mensajes como prueba y repórtalo.',
  },
  {
    question: '¿Necesito un antivirus o basta con el sentido común?',
    answer:
      'Las dos cosas se complementan. Los sistemas modernos ya incluyen protecciones integradas que, mantenidas al día, cubren a la mayoría de usuarios. Pero ninguna herramienta sustituye a los hábitos: contraseñas únicas, doble factor, desconfiar de enlaces y mantener todo actualizado. La mayor parte de los ataques con éxito explotan al usuario, no al software.',
  },
];

// ─── Checklist esencial (sección integrada) ───

const checklistEsencial = [
  'Activa la verificación en dos pasos (2FA) en tu correo, tu banca y tus redes sociales.',
  'Cambia las contraseñas reutilizadas por otras únicas y largas, empezando por tu correo principal.',
  'Instala y configura un gestor de contraseñas para generarlas y recordarlas por ti.',
  'Comprueba que el sistema, el navegador y las apps tienen las actualizaciones automáticas activadas.',
  'Revisa los permisos de tus apps y retira los que no necesiten (ubicación, micrófono, contactos).',
  'Guarda en un lugar seguro y offline los códigos de recuperación de tus cuentas críticas.',
];

// ─── Primeros auxilios (sección integrada) ───

const primerosAuxilios = [
  { titulo: 'Cambia la contraseña ya', texto: 'De la cuenta afectada y de cualquier otra donde usaras la misma. Hazlo desde un dispositivo de confianza.' },
  { titulo: 'Activa el doble factor', texto: 'Si aún no lo tenías, actívalo ahora para bloquear nuevos accesos aunque conozcan la contraseña.' },
  { titulo: 'Cierra las sesiones abiertas', texto: 'Desde los ajustes de seguridad de la cuenta, expulsa cualquier sesión o dispositivo que no reconozcas.' },
  { titulo: 'Revisa datos de recuperación', texto: 'Comprueba que no hayan cambiado tu correo o teléfono de recuperación ni las reglas de reenvío.' },
  { titulo: 'Avisa y reporta', texto: 'Si diste datos bancarios, avisa a tu banco. Conserva los mensajes y repórtalos al servicio suplantado.' },
];

// ─── Caso de estudio ───

const caseStudy = {
  title: 'Lucía recibe un SMS de "su banco" y se da cuenta a tiempo',
  situation:
    'Lucía, 34 años, recibe un SMS que dice que ha habido un acceso sospechoso a su cuenta y que confirme sus datos en un enlace. Casi pulsa, pero algo no le cuadra. Decide parar y comprobarlo con calma.',
  steps: [
    { tool: 'Test ¿Es Phishing?', result: 'Reconoce las señales que había practicado: urgencia, un enlace acortado y un banco pidiendo datos por SMS. Confirma que es un fraude y no pulsa.' },
    { tool: 'Evaluador de Contraseñas', result: 'Aprovecha para revisar su contraseña del banco: era corta y la reutilizaba. La herramienta le dice que se descifraría en minutos.' },
    { tool: 'Generador de Contraseñas', result: 'Crea una clave nueva, larga y única para el banco, y la guarda en su gestor. Repite el proceso con su correo.' },
    { tool: 'Verificación en dos pasos', result: 'Activa el 2FA en el banco y en el correo. Ahora, aunque alguien consiga una contraseña, no podrá entrar.' },
  ],
  conclusion:
    'Lo que iba a ser un susto se queda en nada. Con quince minutos y unas cuantas herramientas gratuitas, Lucía pasa de una seguridad frágil a una razonablemente sólida.',
};

// ─── Componente ───

export default function GuiaSeguridadInternetPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🛡️</span>
        <h1 className={styles.title}>Seguridad y Privacidad en Internet</h1>
        <p className={styles.subtitle}>
          Proteger tu vida digital no es cuestión de saber mucho, sino de dar unos pocos pasos
          en el orden correcto. Este es el mapa, con herramientas gratuitas.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{tools.length}</span>
            <span className={styles.heroStatLabel}>Herramientas</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{journeySteps.length}</span>
            <span className={styles.heroStatLabel}>Pasos clave</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>Gratis</span>
            <span className={styles.heroStatLabel}>Sin registro</span>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Aviso */}
      <div className={styles.avisoBox} role="note">
        <span aria-hidden="true">💡</span>
        <div>
          <strong>Esta guía es para ti si:</strong> usas internet a diario (correo, banca, redes,
          compras) y quieres protegerte sin necesidad de ser un experto. No hace falta instalar nada
          raro — solo adoptar unos hábitos y unas herramientas sencillas.
        </div>
      </div>

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">🗺️</span>
          El camino paso a paso
        </h2>
        <div className={styles.journeyGrid}>
          {journeySteps.map((step) => (
            <div key={step.number} className={styles.journeyCard}>
              <div className={styles.journeyNumber}>{step.number}</div>
              <h3 className={styles.journeyTitle}>{step.title}</h3>
              <p className={styles.journeyDescription}>{step.description}</p>
              <div className={styles.journeyTip}>
                <span className={styles.tipIcon} aria-hidden="true">💡</span>
                <span>{step.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">🔧</span>
          Las herramientas del journey
        </h2>
        <p className={styles.toolsIntro}>
          Cada herramienta responde a una pregunta concreta del proceso. Úsalas en orden o salta
          directamente a la que necesites.
        </p>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.url} className={styles.toolCard}>
              <div className={styles.toolHeader}>
                <span className={styles.toolStep}>{tool.step}</span>
                <span className={styles.toolIcon} aria-hidden="true">{tool.icon}</span>
              </div>
              <h3 className={styles.toolQuestion}>{tool.question}</h3>
              <p className={styles.toolName}>{tool.name}</p>
              <p className={styles.toolDescription}>{tool.description}</p>
              <div className={styles.toolRecomendacion}>
                <span aria-hidden="true">→</span> {tool.recomendacion}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Checklist esencial (sección integrada, no app) */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">✅</span>
          Tu seguridad esencial en 15 minutos
        </h2>
        <div className={styles.caseStudyCard}>
          <p className={styles.caseStudySituation}>
            Si solo vas a hacer una cosa hoy, que sea esta lista. Son las medidas que más protegen
            con el menor esfuerzo; puedes marcarlas mentalmente una a una:
          </p>
          <div className={styles.caseStudySteps}>
            {checklistEsencial.map((item, i) => (
              <div key={i} className={styles.caseStudyStep}>
                <span className={styles.caseStudyStepNumber} aria-hidden="true">✓</span>
                <div>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Primeros auxilios (sección integrada, no app) */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">🚑</span>
          Si crees que te han hackeado: primeros auxilios
        </h2>
        <div className={styles.caseStudyCard}>
          <p className={styles.caseStudySituation}>
            Detectar un acceso extraño o darte cuenta de que caíste en una estafa da mucho respeto,
            pero actuar rápido y en orden limita casi todo el daño. Estos son los pasos:
          </p>
          <div className={styles.caseStudySteps}>
            {primerosAuxilios.map((paso, i) => (
              <div key={i} className={styles.caseStudyStep}>
                <span className={styles.caseStudyStepNumber}>{i + 1}</span>
                <div>
                  <strong>{paso.titulo}:</strong> {paso.texto}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caso de estudio */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">📖</span>
          Ejemplo real
        </h2>
        <div className={styles.caseStudyCard}>
          <h3 className={styles.caseStudyTitle}>{caseStudy.title}</h3>
          <p className={styles.caseStudySituation}>
            <strong>Situación:</strong> {caseStudy.situation}
          </p>
          <div className={styles.caseStudySteps}>
            {caseStudy.steps.map((s, i) => (
              <div key={i} className={styles.caseStudyStep}>
                <span className={styles.caseStudyStepNumber}>{i + 1}</span>
                <div>
                  <strong>{s.tool}:</strong> {s.result}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.caseStudyConclusion}>
            <span aria-hidden="true">✅</span>
            <span><strong>Resultado:</strong> {caseStudy.conclusion}</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">❓</span>
          Preguntas frecuentes
        </h2>
        <div className={styles.faqList}>
          {faqData.map((faq, i) => (
            <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{faq.question}</span>
                <span className={styles.faqArrow} aria-hidden="true">{openFaq === i ? '▲' : '▼'}</span>
              </button>
              {openFaq === i && <div className={styles.faqAnswer}>{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitulo}>¿Por dónde empiezas?</h2>
        <p className={styles.ctaDesc}>Elige el primer paso según lo que más te preocupe ahora:</p>
        <div className={styles.ctaBotones}>
          <Link href="/evaluador-fortaleza-contrasena/" className={styles.ctaBtn}>
            🔒 Prueba tu contraseña
          </Link>
          <Link href="/test-phishing/" className={styles.ctaBtnSecundario}>
            🎣 Entrena contra el phishing
          </Link>
          <Link href="/generador-contrasenas/" className={styles.ctaBtnSecundario}>
            🔑 Crea claves seguras
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-seguridad-internet')} />
      <ShareCard appName="guia-seguridad-internet" />
      <Footer appName="guia-seguridad-internet" />
    </div>
  );
}
