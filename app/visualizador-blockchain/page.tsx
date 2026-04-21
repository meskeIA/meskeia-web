'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorBlockchain.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type SeccionActiva = 'bloques' | 'consenso' | 'contratos' | 'comparativa';
type ConsensoTipo = 'pow' | 'pos';
type ContratoTipo = 'escrow' | 'seguro' | 'votacion';

interface Bloque {
  id: number;
  datos: string;
  hashAnterior: string;
  nonce: number;
  transacciones: string[];
  timestamp: string;
  hash: string;
}

// ─────────────────────────────────────────────
// Utilidades: hash simulado (no criptográfico)
// ─────────────────────────────────────────────

function simularHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
    h = h >>> 0;
  }
  const hex = h.toString(16).padStart(8, '0');
  // Expandir a 64 chars para realismo
  return (hex + hex + hex + hex + hex + hex + hex + hex).substring(0, 64);
}

function calcularHashBloque(bloque: Bloque): string {
  const contenido = `${bloque.id}${bloque.hashAnterior}${bloque.nonce}${bloque.datos}${bloque.timestamp}`;
  return simularHash(contenido);
}

// ─────────────────────────────────────────────
// Datos iniciales de la cadena
// ─────────────────────────────────────────────

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function crearCadenaInicial(): Bloque[] {
  const bloque0: Bloque = {
    id: 0,
    datos: 'Bloque Génesis',
    hashAnterior: GENESIS_HASH,
    nonce: 83421,
    transacciones: ['Satoshi → Hal Finney: 10 BTC'],
    timestamp: '03/01/2009',
    hash: '',
  };
  bloque0.hash = calcularHashBloque(bloque0);

  const bloque1: Bloque = {
    id: 1,
    datos: 'Primer bloque confirmado',
    hashAnterior: bloque0.hash,
    nonce: 215673,
    transacciones: ['Alice → Bob: 2,5 BTC', 'Carol → Dave: 0,8 BTC'],
    timestamp: '12/01/2009',
    hash: '',
  };
  bloque1.hash = calcularHashBloque(bloque1);

  const bloque2: Bloque = {
    id: 2,
    datos: 'Segundo bloque confirmado',
    hashAnterior: bloque1.hash,
    nonce: 489012,
    transacciones: ['Eve → Frank: 5 BTC', 'Grace → Henry: 1,2 BTC', 'Ivan → Judy: 3 BTC'],
    timestamp: '22/01/2009',
    hash: '',
  };
  bloque2.hash = calcularHashBloque(bloque2);

  const bloque3: Bloque = {
    id: 3,
    datos: 'Tercer bloque confirmado',
    hashAnterior: bloque2.hash,
    nonce: 701834,
    transacciones: ['Kevin → Laura: 0,5 BTC', 'Mike → Nina: 7 BTC'],
    timestamp: '15/03/2009',
    hash: '',
  };
  bloque3.hash = calcularHashBloque(bloque3);

  return [bloque0, bloque1, bloque2, bloque3];
}

// ─────────────────────────────────────────────
// Datos de contratos inteligentes
// ─────────────────────────────────────────────

interface PasoContrato {
  id: number;
  condicion: string;
  verificacion: string;
  accion: string;
  estado: 'pendiente' | 'verificando' | 'ejecutado' | 'rechazado';
}

const CONTRATOS: Record<ContratoTipo, { titulo: string; descripcion: string; pasos: PasoContrato[] }> = {
  escrow: {
    titulo: 'Escrow Automático',
    descripcion: 'Compraventa de un bien digital: el pago queda bloqueado hasta confirmar la entrega',
    pasos: [
      { id: 1, condicion: 'Comprador deposita 1 ETH en el contrato', verificacion: 'Balance del contrato ≥ 1 ETH', accion: 'Fondos bloqueados. Vendedor notificado', estado: 'pendiente' },
      { id: 2, condicion: 'Vendedor entrega el bien (hash del archivo)', verificacion: 'Hash recibido coincide con el acordado', accion: 'Entrega registrada en blockchain', estado: 'pendiente' },
      { id: 3, condicion: 'Comprador confirma recepción (o pasan 7 días)', verificacion: 'Confirmación OR timeout > 7 días', accion: '1 ETH transferido automáticamente al vendedor', estado: 'pendiente' },
      { id: 4, condicion: 'Disputa: comprador reclama en <7 días', verificacion: 'Árbitro DAO vota (mayoría 2/3)', accion: 'Reembolso al comprador O pago al vendedor', estado: 'pendiente' },
    ],
  },
  seguro: {
    titulo: 'Seguro Paramétrico de Vuelo',
    descripcion: 'Si el vuelo se retrasa más de 3 horas, el reembolso se ejecuta automáticamente',
    pasos: [
      { id: 1, condicion: 'Pasajero compra póliza (50 €, vuelo IB3456)', verificacion: 'Pago recibido + datos del vuelo válidos', accion: 'Contrato activado. Prima depositada', estado: 'pendiente' },
      { id: 2, condicion: 'Oráculo consulta estado del vuelo (API Aeropuerto)', verificacion: 'Fuente: FlightAware + ADS-B Exchange (2/2)', accion: 'Dato on-chain: retraso actual en minutos', estado: 'pendiente' },
      { id: 3, condicion: 'Retraso confirmado > 180 minutos', verificacion: '2 oráculos independientes coinciden', accion: 'Reembolso de 200 € ejecutado en segundos', estado: 'pendiente' },
      { id: 4, condicion: 'Vuelo llega con <180 min de retraso', verificacion: 'Condición no cumplida tras aterrizaje', accion: 'Prima retenida. Contrato cerrado', estado: 'pendiente' },
    ],
  },
  votacion: {
    titulo: 'Votación DAO Descentralizada',
    descripcion: 'Votación transparente donde el resultado se ejecuta automáticamente sin intermediarios',
    pasos: [
      { id: 1, condicion: 'Miembro propone: "Financiar proyecto X con 50.000 DAI"', verificacion: 'Proponente tiene ≥ 1% del token de gobernanza', accion: 'Propuesta registrada on-chain (ID #247)', estado: 'pendiente' },
      { id: 2, condicion: 'Periodo de votación abierto (72 horas)', verificacion: 'Cada token = 1 voto. 1 dirección = 1 voto máx', accion: 'Votos contabilizados en tiempo real, públicos', estado: 'pendiente' },
      { id: 3, condicion: 'Quórum: >40% tokens participan. Mayoría: >60% a favor', verificacion: 'Votos a favor: 65%. Participación: 48%', accion: 'Propuesta APROBADA. Timelock de 48h activado', estado: 'pendiente' },
      { id: 4, condicion: 'Timelock transcurrido (48h de seguridad)', verificacion: 'Sin veto de guardián de seguridad', accion: '50.000 DAI transferidos al proyecto automáticamente', estado: 'pendiente' },
    ],
  },
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorBlockchainPage() {
  const [seccion, setSeccion] = useState<SeccionActiva>('bloques');

  // Estado sección Bloques
  const [cadena, setCadena] = useState<Bloque[]>(() => crearCadenaInicial());
  const [bloqueEditando, setBloqueEditando] = useState<number | null>(null);
  const [datosEditados, setDatosEditados] = useState('');
  const [bloqueExpandido, setBloqueExpandido] = useState<number | null>(null);

  // Estado sección Consenso
  const [consensoTipo, setConsensoTipo] = useState<ConsensoTipo>('pow');
  const [animandoPow, setAnimandoPow] = useState(false);
  const [nonceActual, setNonceActual] = useState(0);
  const [hashEncontrado, setHashEncontrado] = useState(false);
  const [validadorSeleccionado, setValidadorSeleccionado] = useState<number | null>(null);

  // Estado sección Contratos
  const [contratoTipo, setContratoTipo] = useState<ContratoTipo>('escrow');
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);
  const [pasosEjecutados, setPasosEjecutados] = useState<Set<number>>(new Set());

  // ─── Lógica sección Bloques ───

  const iniciarEdicion = (id: number) => {
    setBloqueEditando(id);
    setDatosEditados(cadena[id].datos);
  };

  const aplicarEdicion = () => {
    if (bloqueEditando === null) return;
    // Recalcular cadena desde el bloque editado
    const nuevaCadena = cadena.map((b, idx) => {
      if (idx < bloqueEditando) return b;
      const bloque = { ...b };
      if (idx === bloqueEditando) bloque.datos = datosEditados;
      if (idx > 0) bloque.hashAnterior = nuevaCadena[idx - 1]?.hash ?? b.hashAnterior;
      bloque.hash = calcularHashBloque(bloque);
      return bloque;
    });
    // Segunda pasada para propagar hashes
    for (let i = 1; i < nuevaCadena.length; i++) {
      nuevaCadena[i].hashAnterior = nuevaCadena[i - 1].hash;
      nuevaCadena[i].hash = calcularHashBloque(nuevaCadena[i]);
    }
    setCadena(nuevaCadena);
    setBloqueEditando(null);
  };

  const restaurarCadena = () => {
    setCadena(crearCadenaInicial());
    setBloqueEditando(null);
  };

  // ─── Lógica sección Consenso (PoW) ───

  const animarMinado = () => {
    if (animandoPow) return;
    setAnimandoPow(true);
    setHashEncontrado(false);
    setNonceActual(0);
    let n = 0;
    const intervalo = setInterval(() => {
      n += Math.floor(Math.random() * 1500) + 500;
      setNonceActual(n);
      if (n > 50000) {
        clearInterval(intervalo);
        setHashEncontrado(true);
        setAnimandoPow(false);
      }
    }, 120);
  };

  const seleccionarValidadorPos = () => {
    setValidadorSeleccionado(null);
    setTimeout(() => {
      setValidadorSeleccionado(Math.floor(Math.random() * 5));
    }, 800);
  };

  // ─── Lógica sección Contratos ───

  const ejecutarPaso = (pasoId: number) => {
    setPasoActivo(pasoId);
    setTimeout(() => {
      setPasosEjecutados(prev => new Set([...prev, pasoId]));
      setPasoActivo(null);
    }, 1200);
  };

  const reiniciarContrato = () => {
    setPasosEjecutados(new Set());
    setPasoActivo(null);
  };

  // ─── Datos comparativa ───

  const comparativaFilas = [
    { dimension: 'Lanzamiento', bitcoin: '2009 (Satoshi Nakamoto)', ethereum: '2015 (Vitalik Buterin)' },
    { dimension: 'Propósito', bitcoin: 'Moneda / Reserva de valor', ethereum: 'Plataforma de contratos inteligentes' },
    { dimension: 'Velocidad', bitcoin: '~7 tx/segundo', ethereum: '~15 tx/segundo' },
    { dimension: 'Tiempo de bloque', bitcoin: '~10 minutos', ethereum: '~12 segundos' },
    { dimension: 'Consenso', bitcoin: 'Proof of Work (SHA-256)', ethereum: 'Proof of Stake (desde 2022)' },
    { dimension: 'Oferta máxima', bitcoin: '21 millones BTC (límite fijo)', ethereum: 'Sin límite (EIP-1559 reduce oferta)' },
    { dimension: 'Programabilidad', bitcoin: 'Script limitado (no Turing)', ethereum: 'Solidity / EVM (Turing-completo)' },
    { dimension: 'Consumo energético', bitcoin: '~130 TWh/año (≈ Argentina)', ethereum: '~0,01 TWh/año (−99,95% tras The Merge)' },
  ];

  const ecosistemasEth = ['DeFi (Uniswap, Aave, MakerDAO)', 'NFTs (OpenSea, Blur)', 'Layer 2 (Optimism, Arbitrum, Base)', 'Stablecoins (USDC, DAI, USDT)', 'DAOs (ENS, Compound)', 'Identidad digital (ENS)'];
  const ecosistemasBtc = ['Lightning Network (pagos instantáneos)', 'Taproot / Ordinals', 'Wrapped BTC en Ethereum', 'ETFs de Bitcoin (BlackRock, Fidelity)', 'Custodia institucional', 'Países como moneda legal (El Salvador)'];

  // ─── Detectar si la cadena está rota ───

  const cadenaRota = cadena.some((b, i) => {
    if (i === 0) return false;
    return b.hashAnterior !== cadena[i - 1].hash;
  });

  const validadoresPos = [
    { nombre: 'Validator A', stake: 320, color: '#2E86AB' },
    { nombre: 'Validator B', stake: 180, color: '#48A9A6' },
    { nombre: 'Validator C', stake: 95, color: '#7FB3D3' },
    { nombre: 'Validator D', stake: 450, color: '#E67E22' },
    { nombre: 'Validator E', stake: 210, color: '#9B59B6' },
  ];
  const stakeTotal = validadoresPos.reduce((s, v) => s + v.stake, 0);

  const contrato = CONTRATOS[contratoTipo];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono}>⛓️</div>
        <h1 className={styles.titulo}>Visualizador de Blockchain</h1>
        <p className={styles.subtitulo}>
          Cómo funciona una cadena de bloques: hashing, consenso, contratos inteligentes y más
        </p>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {(['bloques', 'consenso', 'contratos', 'comparativa'] as SeccionActiva[]).map((s) => {
          const labels: Record<SeccionActiva, string> = {
            bloques: '🧱 Bloques',
            consenso: '⚡ Consenso',
            contratos: '📜 Contratos',
            comparativa: '⚖️ BTC vs ETH',
          };
          return (
            <button
              key={s}
              className={`${styles.navBtn} ${seccion === s ? styles.navBtnActivo : ''}`}
              onClick={() => setSeccion(s)}
              aria-pressed={seccion === s}
            >
              {labels[s]}
            </button>
          );
        })}
      </nav>

      {/* ── SECCIÓN: BLOQUES ── */}
      {seccion === 'bloques' && (
        <section className={styles.seccion} aria-label="Visualización de bloques">
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>🧱 Anatomía de una cadena de bloques</h2>
            <p className={styles.seccionDesc}>
              Cada bloque contiene el hash del bloque anterior, creando un enlace criptográfico. Modifica los datos de un bloque y observa cómo se rompe la cadena.
            </p>
          </div>

          {cadenaRota && (
            <div className={styles.alertaRota} role="alert">
              ⚠️ La cadena está <strong>rota</strong>: los hashes ya no coinciden. Un atacante necesitaría recalcular toda la cadena (con más poder de cómputo que el 51% de la red) para falsificarla.
            </div>
          )}

          <div className={styles.cadenaWrapper}>
            {cadena.map((bloque, idx) => {
              const bloqueAnteriorHash = idx === 0 ? GENESIS_HASH : cadena[idx - 1].hash;
              const hashValido = idx === 0 || bloque.hashAnterior === bloqueAnteriorHash;
              const expandido = bloqueExpandido === idx;

              return (
                <div key={bloque.id} className={styles.bloqueWrapper}>
                  {/* Bloque */}
                  <div className={`${styles.bloque} ${!hashValido ? styles.bloqueInvalido : ''}`}>
                    <div className={styles.bloqueCabecera}>
                      <span className={styles.bloqueNum}>Bloque #{bloque.id}</span>
                      <span className={styles.bloqueFecha}>{bloque.timestamp}</span>
                      <span className={`${styles.bloqueEstado} ${hashValido ? styles.valido : styles.invalido}`}>
                        {hashValido ? '✓ Válido' : '✗ Inválido'}
                      </span>
                    </div>

                    {/* Datos editables */}
                    <div className={styles.bloqueCampo}>
                      <span className={styles.campoLabel}>Datos</span>
                      {bloqueEditando === idx ? (
                        <div className={styles.editArea}>
                          <input
                            className={styles.editInput}
                            value={datosEditados}
                            onChange={(e) => setDatosEditados(e.target.value)}
                            aria-label="Editar datos del bloque"
                          />
                          <div className={styles.editBtns}>
                            <button className={styles.btnAplicar} onClick={aplicarEdicion}>Aplicar</button>
                            <button className={styles.btnCancelar} onClick={() => setBloqueEditando(null)}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.editableRow}>
                          <span className={styles.campoValor}>{bloque.datos}</span>
                          <button
                            className={styles.btnEditar}
                            onClick={() => iniciarEdicion(idx)}
                            aria-label={`Editar datos del bloque ${idx}`}
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nonce */}
                    <div className={styles.bloqueCampo}>
                      <span className={styles.campoLabel}>Nonce</span>
                      <span className={`${styles.campoValor} ${styles.monoEspacio}`}>{bloque.nonce.toLocaleString('es-ES')}</span>
                    </div>

                    {/* Hash anterior */}
                    <div className={styles.bloqueCampo}>
                      <span className={styles.campoLabel}>Hash anterior</span>
                      <span className={`${styles.campoValor} ${styles.monoEspacio} ${styles.hashCorto} ${!hashValido ? styles.hashInvalido : ''}`}>
                        {bloque.hashAnterior.substring(0, 16)}…
                      </span>
                    </div>

                    {/* Hash actual */}
                    <div className={styles.bloqueCampo}>
                      <span className={styles.campoLabel}>Hash del bloque</span>
                      <span className={`${styles.campoValor} ${styles.monoEspacio} ${styles.hashCorto}`}>
                        {bloque.hash.substring(0, 16)}…
                      </span>
                    </div>

                    {/* Transacciones (expandibles) */}
                    <button
                      className={styles.btnExpandir}
                      onClick={() => setBloqueExpandido(expandido ? null : idx)}
                      aria-expanded={expandido}
                    >
                      {expandido ? '▲ Ocultar' : '▼ Ver'} transacciones ({bloque.transacciones.length})
                    </button>
                    {expandido && (
                      <ul className={styles.txLista}>
                        {bloque.transacciones.map((tx, i) => (
                          <li key={i} className={styles.txItem}>
                            <span aria-hidden="true">💸</span> {tx}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Flecha entre bloques */}
                  {idx < cadena.length - 1 && (
                    <div className={`${styles.flechaCadena} ${cadenaRota && !hashValido ? styles.flechaRota : ''}`} aria-hidden="true">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.botonesBloque}>
            <button className={styles.btnPrimario} onClick={restaurarCadena}>
              🔄 Restaurar cadena
            </button>
          </div>

          <div className={styles.warningBox}>
            <strong>¿Por qué es inmutable?</strong> Cambiar un bit en un bloque cambia su hash. Como el bloque siguiente almacena ese hash, también se invalida. Y el siguiente. Y el siguiente. Para falsificar la cadena habría que recalcular TODOS los bloques posteriores con más potencia que el 51% de la red entera: computacionalmente imposible.
          </div>
        </section>
      )}

      {/* ── SECCIÓN: CONSENSO ── */}
      {seccion === 'consenso' && (
        <section className={styles.seccion} aria-label="Mecanismos de consenso">
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>⚡ Mecanismos de consenso</h2>
            <p className={styles.seccionDesc}>
              ¿Cómo se ponen de acuerdo miles de nodos sin autoridad central? Dos enfoques dominantes: Proof of Work y Proof of Stake.
            </p>
          </div>

          <div className={styles.consensoSelector}>
            <button
              className={`${styles.consensoBtn} ${consensoTipo === 'pow' ? styles.consensoBtnActivo : ''}`}
              onClick={() => { setConsensoTipo('pow'); setHashEncontrado(false); setNonceActual(0); setAnimandoPow(false); }}
              aria-pressed={consensoTipo === 'pow'}
            >
              ⛏️ Proof of Work
            </button>
            <button
              className={`${styles.consensoBtn} ${consensoTipo === 'pos' ? styles.consensoBtnActivo : ''}`}
              onClick={() => { setConsensoTipo('pos'); setValidadorSeleccionado(null); }}
              aria-pressed={consensoTipo === 'pos'}
            >
              🥩 Proof of Stake
            </button>
          </div>

          {consensoTipo === 'pow' && (
            <div className={styles.consensoPanel}>
              <h3 className={styles.consensoPanelTitulo}>⛏️ Proof of Work — Minería</h3>
              <p className={styles.consensoPanelDesc}>
                Los mineros compiten para encontrar un nonce que haga que el hash del bloque empiece por N ceros. El primero en encontrarlo gana la recompensa de bloque (actualmente 3,125 BTC) y propaga el bloque a la red.
              </p>

              <div className={styles.powDemo}>
                <div className={styles.powProceso}>
                  <div className={styles.powPaso}>
                    <span className={styles.powPasoNum}>1</span>
                    <div>
                      <strong>Recopilar transacciones</strong>
                      <p>El minero selecciona transacciones del mempool y construye el bloque candidato.</p>
                    </div>
                  </div>
                  <div className={styles.powPaso}>
                    <span className={styles.powPasoNum}>2</span>
                    <div>
                      <strong>Encontrar el nonce</strong>
                      <p>SHA-256(SHA-256(cabecera + nonce)) debe empezar por 19 ceros. El minero prueba miles de millones de nonces por segundo.</p>
                    </div>
                  </div>
                  <div className={styles.powPaso}>
                    <span className={styles.powPasoNum}>3</span>
                    <div>
                      <strong>Difundir y confirmar</strong>
                      <p>Al encontrar el nonce válido, difunde el bloque. Los demás nodos verifican en milisegundos. Proceso exitoso → nueva recompensa.</p>
                    </div>
                  </div>
                </div>

                <div className={styles.powSimulacion}>
                  <div className={styles.powSimBox}>
                    <div className={styles.powSimLabel}>Nonces probados:</div>
                    <div className={styles.powSimNonce} aria-live="polite">
                      {nonceActual.toLocaleString('es-ES')}
                    </div>
                    {animandoPow && (
                      <div className={styles.powSimHash} aria-live="polite">
                        SHA-256: <span className={styles.hashAnimado}>1a{simularHash(nonceActual.toString()).substring(0, 20)}…</span>
                      </div>
                    )}
                    {hashEncontrado && (
                      <div className={styles.powSolucion} role="alert">
                        ✅ ¡Nonce encontrado! Hash válido (empieza por 0000…)
                      </div>
                    )}
                  </div>
                  <button
                    className={styles.btnPrimario}
                    onClick={animarMinado}
                    disabled={animandoPow}
                    aria-busy={animandoPow}
                  >
                    {animandoPow ? '⛏️ Minando…' : '⛏️ Simular minado'}
                  </button>
                </div>
              </div>

              <div className={styles.powStats}>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>~130 TWh/año</span>
                  <span className={styles.powStatLabel}>Consumo Bitcoin</span>
                </div>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>≈ Argentina</span>
                  <span className={styles.powStatLabel}>Equivalente país</span>
                </div>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>~10 min</span>
                  <span className={styles.powStatLabel}>Tiempo de bloque</span>
                </div>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>600 EH/s</span>
                  <span className={styles.powStatLabel}>Hash rate total red</span>
                </div>
              </div>
            </div>
          )}

          {consensoTipo === 'pos' && (
            <div className={styles.consensoPanel}>
              <h3 className={styles.consensoPanelTitulo}>🥩 Proof of Stake — Validación</h3>
              <p className={styles.consensoPanelDesc}>
                Los validadores depositan ("apuestan") ETH como garantía. Se selecciona aleatoriamente un validador para proponer el siguiente bloque, ponderado por su stake. Si valida deshonestamente, pierde su depósito (slashing).
              </p>

              <div className={styles.posDemo}>
                <div className={styles.posValidadores}>
                  <h4 className={styles.posSubtitulo}>Validadores en la red (stake en ETH):</h4>
                  {validadoresPos.map((v, i) => (
                    <div
                      key={i}
                      className={`${styles.posValidador} ${validadorSeleccionado === i ? styles.posValidadorElegido : ''}`}
                    >
                      <div className={styles.posValidadorInfo}>
                        <span className={styles.posValidadorNombre}>{v.nombre}</span>
                        <span className={styles.posValidadorStake}>{v.stake} ETH</span>
                        <span className={styles.posValidadorPct}>
                          ({((v.stake / stakeTotal) * 100).toFixed(1)}% probabilidad)
                        </span>
                      </div>
                      <div className={styles.posBarraWrapper}>
                        <div
                          className={styles.posBarraFill}
                          style={{
                            width: `${(v.stake / stakeTotal) * 100}%`,
                            backgroundColor: v.color,
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      {validadorSeleccionado === i && (
                        <div className={styles.posElegidoBadge} role="status">🏆 Seleccionado para proponer bloque</div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className={styles.btnPrimario}
                  onClick={seleccionarValidadorPos}
                  aria-label="Seleccionar validador aleatoriamente ponderado por stake"
                >
                  🎲 Seleccionar validador
                </button>
              </div>

              <div className={styles.powStats}>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>~0,01 TWh/año</span>
                  <span className={styles.powStatLabel}>Consumo Ethereum</span>
                </div>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>−99,95%</span>
                  <span className={styles.powStatLabel}>vs PoW (The Merge)</span>
                </div>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>~12 seg</span>
                  <span className={styles.powStatLabel}>Tiempo de bloque</span>
                </div>
                <div className={styles.powStat}>
                  <span className={styles.powStatVal}>32 ETH</span>
                  <span className={styles.powStatLabel}>Stake mínimo</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.comparativaConsensoCont}>
            <h3 className={styles.comparativaConsensoTitulo}>PoW vs PoS — Comparativa</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla} aria-label="Comparativa PoW vs PoS">
                <thead>
                  <tr>
                    <th>Dimensión</th>
                    <th>⛏️ Proof of Work</th>
                    <th>🥩 Proof of Stake</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Recurso usado</td><td>Electricidad + hardware</td><td>Capital (criptomonedas)</td></tr>
                  <tr><td>Energía</td><td>Alta (≈ país mediano)</td><td>Muy baja (−99,95%)</td></tr>
                  <tr><td>Seguridad</td><td>Ataque 51%: coste hardware + energía</td><td>Ataque 33%: coste capital (slashing)</td></tr>
                  <tr><td>Descentralización</td><td>Tendencia a pools de minería</td><td>Tendencia a grandes stakers</td></tr>
                  <tr><td>Ejemplos</td><td>Bitcoin, Litecoin, Monero</td><td>Ethereum, Solana, Cardano, Polkadot</td></tr>
                  <tr><td>Madurez</td><td>Probado 15+ años</td><td>Ethereum: 2022 (2+ años)</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── SECCIÓN: CONTRATOS INTELIGENTES ── */}
      {seccion === 'contratos' && (
        <section className={styles.seccion} aria-label="Contratos inteligentes">
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>📜 Contratos inteligentes</h2>
            <p className={styles.seccionDesc}>
              Código que se ejecuta automáticamente cuando se cumplen condiciones. Sin intermediarios, sin confianza: la lógica está en la blockchain y todos pueden verificarla.
            </p>
          </div>

          <div className={styles.contratoSelector}>
            {(['escrow', 'seguro', 'votacion'] as ContratoTipo[]).map((c) => {
              const iconos: Record<ContratoTipo, string> = { escrow: '🤝', seguro: '✈️', votacion: '🗳️' };
              return (
                <button
                  key={c}
                  className={`${styles.contratoBtn} ${contratoTipo === c ? styles.contratoBtnActivo : ''}`}
                  onClick={() => { setContratoTipo(c); reiniciarContrato(); }}
                  aria-pressed={contratoTipo === c}
                >
                  {iconos[c]} {CONTRATOS[c].titulo}
                </button>
              );
            })}
          </div>

          <div className={styles.contratoPanel}>
            <div className={styles.contratoCabecera}>
              <h3 className={styles.contratoPanelTitulo}>{contrato.titulo}</h3>
              <p className={styles.contratoPanelDesc}>{contrato.descripcion}</p>
            </div>

            <div className={styles.pasosCont}>
              {contrato.pasos.map((paso) => {
                const ejecutado = pasosEjecutados.has(paso.id);
                const activo = pasoActivo === paso.id;
                return (
                  <div
                    key={paso.id}
                    className={`${styles.paso} ${ejecutado ? styles.pasoEjecutado : ''} ${activo ? styles.pasoActivo : ''}`}
                  >
                    <div className={styles.pasoNumero} aria-hidden="true">
                      {ejecutado ? '✓' : activo ? '⟳' : paso.id}
                    </div>
                    <div className={styles.pasoContenido}>
                      <div className={styles.pasoFila}>
                        <div className={styles.pasoBloque}>
                          <span className={styles.pasoEtiqueta}>📋 Condición</span>
                          <span className={styles.pasoTexto}>{paso.condicion}</span>
                        </div>
                        <div className={styles.pasoFlecha} aria-hidden="true">→</div>
                        <div className={styles.pasoBloque}>
                          <span className={styles.pasoEtiqueta}>🔍 Verificación</span>
                          <span className={styles.pasoTexto}>{paso.verificacion}</span>
                        </div>
                        <div className={styles.pasoFlecha} aria-hidden="true">→</div>
                        <div className={`${styles.pasoBloque} ${styles.pasoAccion}`}>
                          <span className={styles.pasoEtiqueta}>⚡ Ejecución automática</span>
                          <span className={styles.pasoTexto}>{paso.accion}</span>
                        </div>
                      </div>
                      {!ejecutado && (
                        <button
                          className={styles.btnEjecutarPaso}
                          onClick={() => ejecutarPaso(paso.id)}
                          disabled={activo || (paso.id > 1 && !pasosEjecutados.has(paso.id - 1))}
                          aria-label={`Ejecutar paso ${paso.id}`}
                        >
                          {activo ? 'Ejecutando…' : 'Ejecutar paso →'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.contratoBtns}>
              <button className={styles.btnSecundario} onClick={reiniciarContrato}>
                🔄 Reiniciar
              </button>
              {pasosEjecutados.size === contrato.pasos.length && (
                <div className={styles.contratoCompletado} role="status">
                  ✅ Contrato ejecutado completamente. Sin intermediarios, sin confianza, sin posibilidad de manipulación.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── SECCIÓN: BTC VS ETH ── */}
      {seccion === 'comparativa' && (
        <section className={styles.seccion} aria-label="Comparativa Bitcoin vs Ethereum">
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>⚖️ Bitcoin vs Ethereum</h2>
            <p className={styles.seccionDesc}>
              Las dos blockchains más grandes del mundo tienen filosofías y propósitos muy distintos. Ninguna es "mejor": cada una está optimizada para objetivos diferentes.
            </p>
          </div>

          <div className={styles.tablaWrapper}>
            <table className={styles.tabla} aria-label="Comparativa Bitcoin vs Ethereum">
              <thead>
                <tr>
                  <th>Dimensión</th>
                  <th>₿ Bitcoin</th>
                  <th>Ξ Ethereum</th>
                </tr>
              </thead>
              <tbody>
                {comparativaFilas.map((fila, i) => (
                  <tr key={i}>
                    <td><strong>{fila.dimension}</strong></td>
                    <td>{fila.bitcoin}</td>
                    <td>{fila.ethereum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.ecosistemasGrid}>
            <div className={styles.ecosistemaCont}>
              <h3 className={styles.ecosistemaTitle}>₿ Ecosistema Bitcoin</h3>
              <ul className={styles.ecosistemaLista}>
                {ecosistemasBtc.map((item, i) => (
                  <li key={i} className={styles.ecosistemaItem}>
                    <span aria-hidden="true">→</span> {item}
                  </li>
                ))}
              </ul>
              <div className={styles.ecosistemaFrase}>"Digital Gold" — Reserva de valor global, escasa y predecible</div>
            </div>
            <div className={styles.ecosistemaCont}>
              <h3 className={styles.ecosistemaTitle}>Ξ Ecosistema Ethereum</h3>
              <ul className={styles.ecosistemaLista}>
                {ecosistemasEth.map((item, i) => (
                  <li key={i} className={styles.ecosistemaItem}>
                    <span aria-hidden="true">→</span> {item}
                  </li>
                ))}
              </ul>
              <div className={styles.ecosistemaFrase}>"World Computer" — Plataforma de aplicaciones descentralizadas</div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <strong>Escalabilidad: el trilema</strong> — Una blockchain no puede ser simultáneamente descentralizada, segura Y escalable. Bitcoin y Ethereum priorizan seguridad y descentralización, sacrificando velocidad (~7-15 tx/s vs Visa ~24.000 tx/s). Las soluciones Layer 2 (Lightning Network, Optimism, Arbitrum) añaden velocidad manteniendo la seguridad de la cadena principal.
          </div>
        </section>
      )}

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="¿Cómo funciona una blockchain?"
        subtitle="Bloques, hashing, consenso y contratos inteligentes explicados"
      >

        {/* 1. TABLA COMPARATIVA */}
        <h3>Bitcoin vs Ethereum: comparativa técnica</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable} aria-label="Comparativa técnica Bitcoin, Ethereum y otras blockchains">
            <thead>
              <tr>
                <th>Característica</th>
                <th>₿ Bitcoin</th>
                <th>Ξ Ethereum</th>
                <th>Solana / Cardano</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Consenso</strong></td>
                <td>Proof of Work (SHA-256)</td>
                <td>Proof of Stake (desde 2022)</td>
                <td>PoS / Ouroboros PoS</td>
              </tr>
              <tr>
                <td><strong>Velocidad</strong></td>
                <td>~7 tx/s</td>
                <td>~15 tx/s (L1) / miles en L2</td>
                <td>~65.000 tx/s / ~250 tx/s</td>
              </tr>
              <tr>
                <td><strong>Energía</strong></td>
                <td>~130 TWh/año (≈ Argentina)</td>
                <td>~0,01 TWh/año (−99,95%)</td>
                <td>Muy baja (PoS)</td>
              </tr>
              <tr>
                <td><strong>Smart contracts</strong></td>
                <td>Script limitado (no Turing)</td>
                <td>Solidity / EVM completo</td>
                <td>Rust / Haskell (Plutus)</td>
              </tr>
              <tr>
                <td><strong>Usos principales</strong></td>
                <td>Reserva de valor, pagos</td>
                <td>DeFi, NFTs, DAOs, L2</td>
                <td>DeFi alta velocidad / finanzas</td>
              </tr>
              <tr>
                <td><strong>Oferta máxima</strong></td>
                <td>21 M BTC (límite fijo)</td>
                <td>Sin límite (EIP-1559 deflacionario)</td>
                <td>Sin límite / ~45 B ADA</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. PERFILES / CASOS DE USO */}
        <h3>¿Para quién es útil entender blockchain?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">💰</span>
            <strong>Inversor en cripto</strong>
            <p>Conocer el activo subyacente evita decisiones emocionales. Entender PoW vs PoS, oferta máxima y escalabilidad ayuda a evaluar proyectos con criterio propio.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">💻</span>
            <strong>Desarrollador web</strong>
            <p>Para integrar contratos inteligentes (Solidity, Hardhat, Ethers.js) es imprescindible entender cómo funciona la EVM, el gas y la inmutabilidad del código desplegado.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">🎓</span>
            <strong>Estudiante de informática</strong>
            <p>Blockchain combina estructuras de datos (árboles Merkle, listas enlazadas criptográficas), criptografía (SHA-256, curvas elípticas) y sistemas distribuidos en un ejemplo real.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span aria-hidden="true">📰</span>
            <strong>Periodista tecnológico</strong>
            <p>Para explicar blockchain sin tecnicismos innecesarios hay que entender primero el problema que resuelve (doble gasto, confianza sin intermediarios) y sus limitaciones reales.</p>
          </div>
        </div>

        {/* 3. FAQ */}
        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Blockchain y Bitcoin son lo mismo?</strong>
            <p>No. Bitcoin es una criptomoneda que usa una blockchain como registro de transacciones. La blockchain es la tecnología subyacente; existen miles de blockchains distintas (Ethereum, Solana, Polkadot…) con propósitos muy diferentes.</p>
            <span className={styles.faqTip}>Analogía: Bitcoin es a blockchain como Gmail es a Internet.</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué consume tanta energía el Proof of Work?</strong>
            <p>PoW exige a los mineros resolver un problema computacional sin atajo: probar miles de millones de nonces por segundo hasta encontrar un hash válido. Este "gasto" de energía es precisamente lo que garantiza la seguridad: falsificar la cadena requeriría superar ese gasto en tiempo real.</p>
            <span className={styles.faqTip}>Ethereum eliminó el 99,95% de su consumo al pasar a PoS en 2022 (The Merge).</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Se puede hackear una blockchain?</strong>
            <p>Una blockchain establecida es extremadamente difícil de atacar, pero no imposible. El ataque del 51% consiste en controlar más de la mitad del poder de cómputo (PoW) o del stake (PoS) para reescribir bloques recientes. Es viable en blockchains pequeñas; en Bitcoin o Ethereum el coste es prohibitivo.</p>
            <span className={styles.faqTip}>Los contratos inteligentes sí pueden tener vulnerabilidades de código (ej.: TheDAO hack, 2016).</span>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es un fork?</strong>
            <p>Un fork es una modificación del protocolo. <em>Soft fork</em>: cambio compatible hacia atrás (nodos antiguos siguen funcionando). <em>Hard fork</em>: cambio incompatible que divide la cadena si no todos los nodos actualizan (ej.: Bitcoin Cash surgió de un hard fork de Bitcoin en 2017).</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Los contratos inteligentes son legalmente vinculantes?</strong>
            <p>Depende de la jurisdicción. El código se ejecuta automáticamente, pero la validez jurídica requiere que exista un acuerdo de voluntades reconocible. En la UE, el reglamento MiCA y las leyes nacionales están adaptándose progresivamente. Nunca sustituyen al asesoramiento legal para operaciones de impacto.</p>
            <span className={styles.faqTip}>Algunos países (Wyoming, El Salvador) ya reconocen contratos inteligentes en su legislación.</span>
          </div>
        </div>

        {/* 4. GUÍA PASO A PASO */}
        <h3>Cómo aprovechar este visualizador</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Estructura del bloque</strong>
              <p>En la sección <em>Bloques</em>, observa los campos de cada bloque: datos, nonce, hash anterior y hash actual. Edita los datos de un bloque y comprueba cómo se propaga la invalidación a toda la cadena.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Cadena y hashing</strong>
              <p>Fíjate en cómo el hash de cada bloque depende del hash anterior. Restaura la cadena y vuelve a modificarla: verás que no hay forma de "arreglar" un bloque sin romper todos los posteriores.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>PoW vs PoS</strong>
              <p>En la sección <em>Consenso</em>, simula el minado por Proof of Work (observa el nonce que se incrementa hasta encontrar un hash válido) y compáralo con la selección aleatoria ponderada de Proof of Stake.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Contratos inteligentes</strong>
              <p>En la sección <em>Contratos</em>, ejecuta paso a paso tres tipos de contrato: escrow, seguro paramétrico y votación DAO. Observa la lógica condicional: <em>si condición → ejecutar automáticamente</em>.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Comparativa BTC / ETH</strong>
              <p>En la sección <em>BTC vs ETH</em>, revisa las diferencias filosóficas y técnicas: oferta máxima, programabilidad, consumo energético y ecosistema. Ninguna es "mejor": cada una está optimizada para objetivos distintos.</p>
            </div>
          </div>
        </div>

        {/* 5. MEJORES PRÁCTICAS */}
        <h3>Conceptos clave para no confundirse</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <strong>Blockchain pública vs privada</strong>
            <p>Las blockchains públicas (Bitcoin, Ethereum) son abiertas y sin permiso. Las privadas (Hyperledger, Quorum) son controladas por una organización: más veloces, pero menos descentralizadas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🪙</span>
            <strong>Criptomoneda vs token</strong>
            <p>Una criptomoneda (BTC, ETH) es la moneda nativa de su propia blockchain. Un token (USDC, UNI) se emite sobre una blockchain existente mediante un contrato inteligente. Son conceptos distintos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔒</span>
            <strong>La inmutabilidad es una característica</strong>
            <p>No se puede "modificar" o "borrar" datos en una blockchain pública. Esto es una garantía de integridad, no un fallo. Para datos que deben actualizarse, existen patrones de contratos actualizables.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <strong>El trilema de la escalabilidad</strong>
            <p>Una blockchain no puede ser simultáneamente descentralizada, segura Y escalable. Bitcoin y Ethereum priorizan las dos primeras; las soluciones Layer 2 añaden velocidad sin comprometer la seguridad base.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌐</span>
            <strong>Gas y comisiones de red</strong>
            <p>En Ethereum, el gas es la unidad de coste computacional. Cada operación (transferencia, llamada a contrato) consume gas. Las comisiones varían con la congestión de la red; las L2 las reducen drásticamente.</p>
          </div>
        </div>

        {/* 6. WARNING BOX — errores comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes al entender blockchain</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>"Blockchain = Bitcoin"</strong> — Blockchain es la tecnología; Bitcoin es solo una de sus aplicaciones. Existen miles de blockchains con propósitos completamente distintos.</li>
            <li><strong>"Es imposible hackear una blockchain"</strong> — El ataque del 51% es real y se ha ejecutado en redes pequeñas (Ethereum Classic, Bitcoin Gold). La seguridad depende del tamaño de la red.</li>
            <li><strong>"PoS es tan seguro como PoW, sin debate"</strong> — PoS reduce el consumo energético un 99,95%, pero el debate sobre descentralización y resistencia a la censura sigue abierto en la comunidad. No hay consenso académico definitivo.</li>
            <li><strong>"Los contratos inteligentes se ejecutan solos sin fallos"</strong> — TheDAO hack (2016) demostró que un bug en Solidity permitió robar ~60 M$ en ETH. El código es inmutable; un error desplegado es permanente sin un mecanismo de actualización explícito.</li>
            <li><strong>"Transacciones blockchain son anónimas"</strong> — Son <em>seudónimas</em>: cada dirección es pública y todas las transacciones son trazables. Con análisis de cadena (chain analysis) se puede vincular direcciones a identidades reales.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-blockchain')} />
      <ShareCard appName="visualizador-blockchain" />
      <Footer appName="visualizador-blockchain" />
    </div>
  );
}
