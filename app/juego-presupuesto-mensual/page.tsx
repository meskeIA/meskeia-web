'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './JuegoPresupuestoMensual.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Datos del juego ──────────────────────────────────────────────────────────

interface Perfil {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  ingresos: number;
  gastosFijos: { nombre: string; importe: number }[];
}

interface Evento {
  texto: string;
  opciones: { texto: string; coste: number; leccion: string }[];
}

const PERFILES: Perfil[] = [
  {
    id: 'estudiante',
    nombre: 'Estudiante universitario',
    icono: '🎓',
    descripcion: 'Vives en piso compartido con una beca y un trabajo a tiempo parcial',
    ingresos: 850,
    gastosFijos: [
      { nombre: 'Alquiler (habitación)', importe: 350 },
      { nombre: 'Suministros (parte)', importe: 45 },
      { nombre: 'Transporte (abono)', importe: 20 },
      { nombre: 'Móvil', importe: 15 },
    ],
  },
  {
    id: 'primer_empleo',
    nombre: 'Primer empleo (1.200 € netos)',
    icono: '💼',
    descripcion: 'Tu primer trabajo a jornada completa, vives de alquiler',
    ingresos: 1200,
    gastosFijos: [
      { nombre: 'Alquiler (estudio)', importe: 550 },
      { nombre: 'Suministros', importe: 80 },
      { nombre: 'Transporte', importe: 45 },
      { nombre: 'Móvil + internet', importe: 35 },
      { nombre: 'Seguro médico', importe: 30 },
    ],
  },
  {
    id: 'autonomo',
    nombre: 'Autónomo principiante',
    icono: '🚀',
    descripcion: 'Acabas de hacerte autónomo, ingresos variables',
    ingresos: 1500,
    gastosFijos: [
      { nombre: 'Alquiler', importe: 600 },
      { nombre: 'Cuota autónomos', importe: 230 },
      { nombre: 'Suministros', importe: 90 },
      { nombre: 'Transporte', importe: 50 },
      { nombre: 'Móvil + internet', importe: 40 },
    ],
  },
];

const EVENTOS: Evento[] = [
  {
    texto: '🎂 Es el cumpleaños de tu mejor amigo/a. ¿Qué haces?',
    opciones: [
      { texto: 'Regalo caro y cena fuera', coste: 80, leccion: 'Los detalles no tienen que ser caros para ser significativos.' },
      { texto: 'Regalo modesto y plan casero', coste: 25, leccion: '¡Buena decisión! Un plan casero puede ser igual de especial.' },
      { texto: 'Solo una tarjeta hecha a mano', coste: 2, leccion: 'Lo importante es el gesto. Pero si puedes, un pequeño detalle siempre alegra.' },
    ],
  },
  {
    texto: '🔧 Se te ha roto el móvil. ¿Qué haces?',
    opciones: [
      { texto: 'Comprar el último modelo', coste: 300, leccion: 'Un móvil caro puede hipotecar tu mes. ¿Realmente necesitas el último modelo?' },
      { texto: 'Reparar la pantalla', coste: 80, leccion: 'Reparar es casi siempre más inteligente que reemplazar.' },
      { texto: 'Comprar uno reacondicionado', coste: 150, leccion: 'Los reacondicionados son una opción inteligente: calidad a menor precio.' },
    ],
  },
  {
    texto: '🛒 Ofertas de temporada: ropa, electrónica, todo rebajado. ¿Qué haces?',
    opciones: [
      { texto: 'Comprar todo lo que me gusta', coste: 200, leccion: 'Las ofertas solo son ahorro si compras lo que realmente necesitas.' },
      { texto: 'Solo lo que necesito de verdad', coste: 60, leccion: '¡Bien! Comprar con lista es la mejor defensa contra el impulso.' },
      { texto: 'No comprar nada', coste: 0, leccion: 'Autocontrol máximo. Pero si necesitabas algo, las rebajas eran buen momento.' },
    ],
  },
  {
    texto: '🍕 Es viernes noche. Tus amigos quieren salir a cenar. ¿Qué haces?',
    opciones: [
      { texto: 'Restaurante y copas después', coste: 45, leccion: 'Una noche puede costar lo mismo que la comida de una semana.' },
      { texto: 'Cena de pizzas en casa y peli', coste: 10, leccion: '¡Gran plan! Socializar no tiene que ser caro.' },
      { texto: 'Me quedo en casa ahorrando', coste: 0, leccion: 'Ahorrar está bien, pero la vida social también es importante. Busca el equilibrio.' },
    ],
  },
  {
    texto: '🏥 Te duele una muela. No tienes seguro dental. ¿Qué haces?',
    opciones: [
      { texto: 'Dentista privado urgente', coste: 120, leccion: 'La salud es prioritaria, pero un fondo de emergencia habría cubierto esto sin estrés.' },
      { texto: 'Esperar a cita en la SS (2 semanas)', coste: 15, leccion: 'La sanidad pública es un recurso valioso, pero a veces la espera duele (literalmente).' },
      { texto: 'Ignorarlo y esperar', coste: 0, leccion: 'Mala idea: los problemas de salud no desaparecen solos y a menudo empeoran.' },
    ],
  },
  {
    texto: '🎮 Sale el videojuego/serie/libro que llevas meses esperando.',
    opciones: [
      { texto: 'Comprarlo el día de lanzamiento', coste: 70, leccion: 'Esperar unas semanas suele traer descuentos. La paciencia también es una habilidad financiera.' },
      { texto: 'Esperar a que baje de precio', coste: 0, leccion: '¡Estrategia inteligente! El mismo producto, menos dinero.' },
      { texto: 'Compartir cuenta/costo con amigos', coste: 20, leccion: 'Compartir gastos es una de las mejores estrategias financieras que existen.' },
    ],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function JuegoPresupuestoMensualPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [eventoActual, setEventoActual] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [gastosVariables, setGastosVariables] = useState(0);
  const [decisiones, setDecisiones] = useState<{ evento: string; opcion: string; coste: number; leccion: string }[]>([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const iniciar = useCallback((p: Perfil) => {
    const totalFijos = p.gastosFijos.reduce((sum, g) => sum + g.importe, 0);
    setPerfil(p);
    setSaldo(p.ingresos - totalFijos);
    setGastosVariables(0);
    setDecisiones([]);
    setEventoActual(0);
    setJuegoTerminado(false);
  }, []);

  const elegir = (opcionIdx: number) => {
    const evento = EVENTOS[eventoActual];
    const opcion = evento.opciones[opcionIdx];
    setSaldo(prev => prev - opcion.coste);
    setGastosVariables(prev => prev + opcion.coste);
    setDecisiones(prev => [...prev, {
      evento: evento.texto,
      opcion: opcion.texto,
      coste: opcion.coste,
      leccion: opcion.leccion,
    }]);
    if (eventoActual < EVENTOS.length - 1) {
      setEventoActual(eventoActual + 1);
    } else {
      setJuegoTerminado(true);
    }
  };

  const reiniciar = () => {
    setPerfil(null);
    setDecisiones([]);
    setJuegoTerminado(false);
  };

  const saldoFinal = perfil ? saldo : 0;
  const nota = saldoFinal >= 200 ? 'A' : saldoFinal >= 100 ? 'B' : saldoFinal >= 0 ? 'C' : 'D';

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🎮</span>
          <h1 className={styles.title}>Juego de Presupuesto Mensual</h1>
          <p className={styles.subtitle}>
            Elige un perfil, toma decisiones financieras y descubre si llegas a fin de mes
          </p>
        </header>

        <LegalNotice />

        {/* ── Selección de perfil ── */}
        {!perfil && (
          <div className={styles.perfilSection}>
            <h2 className={styles.seccionTitulo}>Elige tu perfil</h2>
            <div className={styles.perfilGrid}>
              {PERFILES.map(p => {
                const totalFijos = p.gastosFijos.reduce((sum, g) => sum + g.importe, 0);
                return (
                  <button key={p.id} type="button" className={styles.perfilCard} onClick={() => iniciar(p)}>
                    <span className={styles.perfilIcono} aria-hidden="true">{p.icono}</span>
                    <strong>{p.nombre}</strong>
                    <p className={styles.perfilDesc}>{p.descripcion}</p>
                    <div className={styles.perfilDatos}>
                      <span>Ingresos: {formatCurrency(p.ingresos)}</span>
                      <span>Fijos: {formatCurrency(totalFijos)}</span>
                      <span className={styles.perfilDisponible}>Disponible: {formatCurrency(p.ingresos - totalFijos)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Juego en curso ── */}
        {perfil && !juegoTerminado && (
          <div className={styles.juegoSection}>
            {/* Saldo */}
            <div className={styles.saldoBar}>
              <div className={styles.saldoInfo}>
                <span>Saldo disponible</span>
                <strong className={saldo >= 0 ? styles.positivo : styles.negativo}>
                  {formatCurrency(saldo)}
                </strong>
              </div>
              <div className={styles.saldoBarra}>
                <div
                  className={styles.saldoFill}
                  style={{ width: `${Math.max(0, Math.min((saldo / (perfil.ingresos - perfil.gastosFijos.reduce((s, g) => s + g.importe, 0))) * 100, 100))}%` }}
                />
              </div>
              <span className={styles.eventoCounter}>Decisión {eventoActual + 1} de {EVENTOS.length}</span>
            </div>

            {/* Evento */}
            <div className={styles.eventoCard}>
              <p className={styles.eventoTexto}>{EVENTOS[eventoActual].texto}</p>
              <div className={styles.opcionesGrid}>
                {EVENTOS[eventoActual].opciones.map((op, i) => (
                  <button key={i} type="button" className={styles.opcionBtn} onClick={() => elegir(i)}>
                    <span className={styles.opcionTexto}>{op.texto}</span>
                    <span className={`${styles.opcionCoste} ${op.coste === 0 ? styles.gratis : ''}`}>
                      {op.coste === 0 ? 'Gratis' : `-${formatCurrency(op.coste)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Resultado final ── */}
        {juegoTerminado && perfil && (
          <div className={styles.resultadoSection}>
            <div className={styles.resultadoHero} data-nota={nota}>
              <div className={styles.notaBadge}>{nota}</div>
              <h2>
                {nota === 'A' && '¡Excelente gestión!'}
                {nota === 'B' && 'Buena gestión'}
                {nota === 'C' && 'Has llegado justo'}
                {nota === 'D' && 'Te has pasado del presupuesto'}
              </h2>
              <p className={styles.resultadoSaldo}>
                Saldo final: <strong className={saldoFinal >= 0 ? styles.positivo : styles.negativo}>{formatCurrency(saldoFinal)}</strong>
              </p>
              <p className={styles.resultadoDetalle}>
                Gastaste {formatCurrency(gastosVariables)} en decisiones variables sobre {formatCurrency(perfil.ingresos - perfil.gastosFijos.reduce((s, g) => s + g.importe, 0))} disponibles
              </p>
            </div>

            {/* Repaso de decisiones */}
            <div className={styles.decisionesCard}>
              <h3 className={styles.desgloseTitle}>Tus decisiones y lecciones</h3>
              {decisiones.map((d, i) => (
                <div key={i} className={styles.decisionItem}>
                  <div className={styles.decisionHeader}>
                    <span className={styles.decisionNum}>{i + 1}</span>
                    <div>
                      <p className={styles.decisionEvento}>{d.evento.replace(/^[^\s]+\s/, '')}</p>
                      <p className={styles.decisionOpcion}>
                        Elegiste: <strong>{d.opcion}</strong> ({d.coste === 0 ? 'gratis' : `-${formatCurrency(d.coste)}`})
                      </p>
                    </div>
                  </div>
                  <p className={styles.decisionLeccion}><span aria-hidden="true">💡</span> {d.leccion}</p>
                </div>
              ))}
            </div>

            <button type="button" className={styles.btn} onClick={reiniciar}>
              Jugar de nuevo con otro perfil
            </button>
          </div>
        )}

        <EducationalSection
          title="📚 Lecciones de presupuesto"
          subtitle="Lo que este juego te enseña sobre el dinero real"
        >
          <section className={styles.guideSection}>
            <h2>Las 5 reglas de oro del presupuesto</h2>
            <div className={styles.reglasGrid}>
              <div className={styles.reglaCard}><strong>1. Conoce tus gastos fijos</strong><p>Son lo primero que sale de tu sueldo. No negociables.</p></div>
              <div className={styles.reglaCard}><strong>2. Ten un fondo de emergencia</strong><p>Al menos 3 meses de gastos para imprevistos.</p></div>
              <div className={styles.reglaCard}><strong>3. Distingue necesidad de deseo</strong><p>Antes de comprar: ¿lo necesito o lo quiero?</p></div>
              <div className={styles.reglaCard}><strong>4. Espera 24 horas</strong><p>Ante compras impulsivas, espera un día. Si sigues queriéndolo, adelante.</p></div>
              <div className={styles.reglaCard}><strong>5. Págate a ti primero</strong><p>Ahorra al principio del mes, no al final.</p></div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">🎯</span>
                <strong>Recuerda</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Este juego simplifica la realidad: en la vida real hay más variables e imprevistos</li>
                <li>No existe una respuesta &laquo;correcta&raquo; — se trata de ser consciente del impacto de cada decisión</li>
                <li>La clave no es no gastar nunca, sino gastar de forma consciente</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('juego-presupuesto-mensual')} />
        <ShareCard appName="juego-presupuesto-mensual" />
        <Footer appName="juego-presupuesto-mensual" />
    </div>
  );
}
