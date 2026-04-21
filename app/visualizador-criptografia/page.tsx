'use client';
// @disclaimer: exempt
import { useState, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorCriptografia.module.css';

type SeccionActiva = 'simetrico' | 'hash' | 'firma' | 'tls';

interface AlgoritmoInfo {
  nombre: string;
  tipo: string;
  longitud: string;
  velocidad: string;
  uso: string;
  descripcion: string;
}

const ALGORITMOS: Record<string, AlgoritmoInfo> = {
  AES: {
    nombre: 'AES-256',
    tipo: 'Simétrico',
    longitud: '256 bits',
    velocidad: '~1 GB/s',
    uso: 'Cifrado de datos en tránsito y en reposo',
    descripcion: 'Advanced Encryption Standard. Estándar desde 2001. Opera en bloques de 128 bits con 14 rondas de transformación.',
  },
  RSA: {
    nombre: 'RSA-2048',
    tipo: 'Asimétrico',
    longitud: '2048 bits',
    velocidad: '~1 MB/s',
    uso: 'Intercambio de claves, firma digital, TLS',
    descripcion: 'Basado en la dificultad de factorizar el producto de dos primos grandes. Clave pública y privada matemáticamente relacionadas.',
  },
  ECDSA: {
    nombre: 'ECDSA P-256',
    tipo: 'Asimétrico (curvas elípticas)',
    longitud: '256 bits',
    velocidad: '~5 MB/s',
    uso: 'Firma digital, TLS moderno, criptomonedas',
    descripcion: 'Misma seguridad que RSA-3072 con claves 12x más cortas. Basado en el problema del logaritmo discreto en curvas elípticas.',
  },
};

const PASOS_TLS = [
  {
    paso: 1,
    titulo: 'ClientHello',
    desde: 'Navegador',
    hacia: 'Servidor',
    descripcion: 'El navegador envía versiones TLS soportadas, algoritmos disponibles y un número aleatorio.',
    cifrado: false,
    icono: '👋',
  },
  {
    paso: 2,
    titulo: 'ServerHello + Certificado',
    desde: 'Servidor',
    hacia: 'Navegador',
    descripcion: 'El servidor responde con el algoritmo elegido, su certificado X.509 (con clave pública) y otro número aleatorio.',
    cifrado: false,
    icono: '📜',
  },
  {
    paso: 3,
    titulo: 'Verificación de Certificado',
    desde: 'Navegador',
    hacia: 'CA',
    descripcion: 'El navegador verifica la firma del certificado con la clave pública de la CA (autoridad de certificación). Valida dominio, fecha y cadena de confianza.',
    cifrado: false,
    icono: '✅',
  },
  {
    paso: 4,
    titulo: 'Intercambio Diffie-Hellman',
    desde: 'Navegador ↔ Servidor',
    hacia: '',
    descripcion: 'Se deriva una clave de sesión compartida sin transmitirla. Ambas partes calculan el mismo secreto de forma independiente.',
    cifrado: false,
    icono: '🔑',
  },
  {
    paso: 5,
    titulo: 'Comunicación Cifrada (AES)',
    desde: 'Navegador',
    hacia: 'Servidor',
    descripcion: 'A partir de aquí todo el tráfico va cifrado con AES usando la clave de sesión. El asimétrico resolvió el intercambio; el simétrico cifra los datos (más rápido).',
    cifrado: true,
    icono: '🔒',
  },
];

// Simulación visual de SHA-256 (no criptográficamente real, solo ilustrativa)
function simularHash(texto: string): string {
  if (!texto) return '—'.repeat(64);
  // Usamos un hash determinista simple para efecto visual
  let h = 0x6a09e667;
  let h2 = 0xbb67ae85;
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    h = Math.imul(h ^ c, 0x9e3779b9 + (h << 6) + (h >> 2)) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x517cc1b7 + (h2 << 4) + (h2 >> 3)) >>> 0;
  }
  // Generar 64 caracteres hex a partir de los valores
  const seed1 = h >>> 0;
  const seed2 = h2 >>> 0;
  let result = '';
  let s1 = seed1;
  let s2 = seed2;
  for (let i = 0; i < 8; i++) {
    s1 = Math.imul(s1 ^ (s1 >>> 16), 0x45d9f3b) >>> 0;
    s1 = Math.imul(s1 ^ (s1 >>> 16), 0x45d9f3b) >>> 0;
    s2 = Math.imul(s2 ^ (s2 >>> 19), 0x119de1f3) >>> 0;
    s2 = Math.imul(s2 ^ (s2 >>> 19), 0x119de1f3) >>> 0;
    result += (s1 >>> 0).toString(16).padStart(8, '0');
    result += (s2 >>> 0).toString(16).padStart(8, '0');
  }
  return result.slice(0, 64);
}

export default function VisualizadorCriptografia() {
  const [seccion, setSeccion] = useState<SeccionActiva>('simetrico');
  const [algoritmoSel, setAlgoritmoSel] = useState<string>('AES');
  const [modoSim, setModoSim] = useState<'cifrar' | 'descifrar'>('cifrar');
  const [textoHash, setTextoHash] = useState<string>('Hola mundo');
  const [hashActual, setHashActual] = useState<string>('');
  const [hashAnterior, setHashAnterior] = useState<string>('');
  const [pasoTLS, setPasoTLS] = useState<number>(0);
  const [animando, setAnimando] = useState<boolean>(false);
  const [pasoFirma, setPasoFirma] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const nuevo = simularHash(textoHash);
    setHashAnterior(hashActual);
    setHashActual(nuevo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoHash]);

  useEffect(() => {
    setHashActual(simularHash(textoHash));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iniciarAnimacionTLS = () => {
    if (animando) return;
    setPasoTLS(0);
    setAnimando(true);
    let paso = 0;
    intervalRef.current = setInterval(() => {
      paso++;
      setPasoTLS(paso);
      if (paso >= PASOS_TLS.length) {
        clearInterval(intervalRef.current!);
        setAnimando(false);
      }
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const alg = ALGORITMOS[algoritmoSel];
  const esSimetrico = algoritmoSel === 'AES';

  // Diferencias visuales de caracteres en hash
  const getDiferencias = (): number[] => {
    const indices: number[] = [];
    if (hashAnterior.length !== hashActual.length) return [];
    for (let i = 0; i < hashActual.length; i++) {
      if (hashActual[i] !== hashAnterior[i]) indices.push(i);
    }
    return indices;
  };
  const diferencias = getDiferencias();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🔐</div>
        <h1>Visualizador de Criptografía</h1>
        <p>Cifrado simétrico, asimétrico, firma digital y cómo funciona HTTPS</p>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {([
          { id: 'simetrico', label: 'Simétrico vs Asimétrico', icono: '🔑' },
          { id: 'hash', label: 'Funciones Hash', icono: '#️⃣' },
          { id: 'firma', label: 'Firma Digital', icono: '✍️' },
          { id: 'tls', label: 'HTTPS / TLS', icono: '🔒' },
        ] as { id: SeccionActiva; label: string; icono: string }[]).map((s) => (
          <button
            key={s.id}
            className={`${styles.tabBtn} ${seccion === s.id ? styles.tabActivo : ''}`}
            onClick={() => setSeccion(s.id)}
            aria-current={seccion === s.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{s.icono}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <main className={styles.contenido}>

        {/* ═══════════════ SECCIÓN 1: SIMÉTRICO VS ASIMÉTRICO ═══════════════ */}
        {seccion === 'simetrico' && (
          <section className={styles.seccion} aria-label="Cifrado simétrico vs asimétrico">
            <div className={styles.selectorAlgoritmo}>
              {Object.keys(ALGORITMOS).map((key) => (
                <button
                  key={key}
                  className={`${styles.algBtn} ${algoritmoSel === key ? styles.algActivo : ''}`}
                  onClick={() => setAlgoritmoSel(key)}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className={styles.infoAlgoritmo}>
              <div className={styles.infoHeader}>
                <span className={styles.infoNombre}>{alg.nombre}</span>
                <span className={`${styles.infoBadge} ${esSimetrico ? styles.badgeSim : styles.badgeAsim}`}>
                  {alg.tipo}
                </span>
              </div>
              <p className={styles.infoDesc}>{alg.descripcion}</p>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Longitud de clave</span>
                  <span className={styles.infoValor}>{alg.longitud}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Velocidad aprox.</span>
                  <span className={styles.infoValor}>{alg.velocidad}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Uso principal</span>
                  <span className={styles.infoValor}>{alg.uso}</span>
                </div>
              </div>
            </div>

            {/* Diagrama animado */}
            <div className={styles.diagramaWrapper}>
              <h2 className={styles.diagramaTitulo}>
                {esSimetrico ? 'Cifrado Simétrico — Una sola clave compartida' : 'Cifrado Asimétrico — Par de claves pública/privada'}
              </h2>

              <div className={styles.modoSelector}>
                <button
                  className={`${styles.modoBtn} ${modoSim === 'cifrar' ? styles.modoActivo : ''}`}
                  onClick={() => setModoSim('cifrar')}
                >
                  Cifrar
                </button>
                <button
                  className={`${styles.modoBtn} ${modoSim === 'descifrar' ? styles.modoActivo : ''}`}
                  onClick={() => setModoSim('descifrar')}
                >
                  Descifrar
                </button>
              </div>

              <div className={styles.diagrama}>
                {/* Alice */}
                <div className={styles.actor}>
                  <div className={styles.actorAvatar} aria-hidden="true">👩</div>
                  <div className={styles.actorNombre}>Alice</div>
                  {esSimetrico ? (
                    <div className={styles.claveTag} aria-label="Clave secreta compartida">
                      🗝️ Clave secreta
                    </div>
                  ) : (
                    <div className={styles.claveTagDual}>
                      {modoSim === 'cifrar' ? (
                        <>
                          <span className={styles.clavePublica} aria-label="Clave pública de Bob">🔓 Clave pública (Bob)</span>
                        </>
                      ) : (
                        <>
                          <span className={styles.clavePrivada} aria-label="Clave privada de Alice">🔐 Clave privada (Alice)</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Canal de comunicación */}
                <div className={styles.canal}>
                  <div className={styles.canalLinea} aria-hidden="true" />
                  <div className={styles.mensaje} aria-label="Mensaje cifrado en tránsito">
                    {modoSim === 'cifrar' ? (
                      <span>📦 <em>mensaje cifrado</em></span>
                    ) : (
                      <span>📄 <em>mensaje claro</em></span>
                    )}
                  </div>
                  <div className={styles.flecha} aria-hidden="true">→</div>
                </div>

                {/* Bob */}
                <div className={styles.actor}>
                  <div className={styles.actorAvatar} aria-hidden="true">👨</div>
                  <div className={styles.actorNombre}>Bob</div>
                  {esSimetrico ? (
                    <div className={styles.claveTag} aria-label="Clave secreta compartida">
                      🗝️ Clave secreta
                    </div>
                  ) : (
                    <div className={styles.claveTagDual}>
                      {modoSim === 'cifrar' ? (
                        <span className={styles.clavePrivada} aria-label="Clave privada de Bob">🔐 Clave privada (Bob)</span>
                      ) : (
                        <span className={styles.clavePublica} aria-label="Clave pública de Alice">🔓 Clave pública (Alice)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Explicación del modo */}
              <div className={styles.explicacionModo} role="region" aria-live="polite">
                {esSimetrico ? (
                  modoSim === 'cifrar' ? (
                    <p>Alice usa la <strong>clave secreta compartida</strong> para transformar el mensaje legible en datos cifrados. El problema: ¿cómo se comparte esa clave de forma segura?</p>
                  ) : (
                    <p>Bob usa la <strong>misma clave secreta</strong> para revertir el cifrado y recuperar el mensaje original. Ambos deben tener la misma clave.</p>
                  )
                ) : (
                  modoSim === 'cifrar' ? (
                    <p>Alice cifra con la <strong>clave pública de Bob</strong> (la puede saber cualquiera). Solo Bob puede descifrar con su <strong>clave privada</strong> (que solo él conoce). No hace falta canal seguro previo.</p>
                  ) : (
                    <p>Bob descifra con su <strong>clave privada</strong>. Nadie más puede hacerlo aunque intercepten el mensaje. La clave privada nunca sale del dispositivo de Bob.</p>
                  )
                )}
              </div>

              {/* Principio de Kerckhoffs */}
              <div className={styles.kerckhoffs}>
                <span className={styles.kerckhoffsIcon} aria-hidden="true">💡</span>
                <div>
                  <strong>Principio de Kerckhoffs</strong>: La seguridad de un sistema criptográfico debe residir en la <strong>clave</strong>, no en el secreto del algoritmo. AES y RSA son públicos — su fortaleza está en la clave.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ SECCIÓN 2: FUNCIONES HASH ═══════════════ */}
        {seccion === 'hash' && (
          <section className={styles.seccion} aria-label="Funciones hash criptográficas">
            <div className={styles.hashIntro}>
              <h2>El Efecto Avalancha</h2>
              <p>Cambia una sola letra y observa cómo el hash cambia completamente. Esta propiedad es fundamental para la seguridad.</p>
            </div>

            <div className={styles.hashDemo}>
              <div className={styles.hashInputWrapper}>
                <label htmlFor="hash-input" className={styles.hashLabel}>
                  Texto a transformar:
                </label>
                <input
                  id="hash-input"
                  type="text"
                  value={textoHash}
                  onChange={(e) => setTextoHash(e.target.value)}
                  className={styles.hashInput}
                  placeholder="Escribe algo aquí..."
                  maxLength={200}
                  autoComplete="off"
                />
                <span className={styles.hashChars}>{textoHash.length} caracteres → hash de longitud fija</span>
              </div>

              <div className={styles.hashResultado} aria-live="polite" aria-label="Hash SHA-256 del texto">
                <div className={styles.hashTitulo}>
                  <span className={styles.hashAlg}>SHA-256</span>
                  <span className={styles.hashLongitud}>256 bits / 64 hex</span>
                </div>
                <div className={styles.hashValor}>
                  {hashActual.split('').map((char, i) => (
                    <span
                      key={i}
                      className={diferencias.includes(i) ? styles.hashCharCambiado : styles.hashChar}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                {diferencias.length > 0 && (
                  <p className={styles.hashDiff} role="status">
                    <strong>{diferencias.length} de 64 posiciones</strong> cambiaron ({Math.round((diferencias.length / 64) * 100)}%) — efecto avalancha
                  </p>
                )}
              </div>
            </div>

            <div className={styles.hashPropiedades}>
              <h3>Propiedades de las funciones hash criptográficas</h3>
              <div className={styles.propiedadesGrid}>
                {[
                  { icono: '⚡', titulo: 'Eficiencia', desc: 'Cualquier tamaño de entrada → hash de longitud fija en milisegundos' },
                  { icono: '🌊', titulo: 'Efecto avalancha', desc: '1 bit de cambio en la entrada → ~50% de bits diferentes en el hash' },
                  { icono: '🚫', titulo: 'Irreversible (one-way)', desc: 'Imposible recuperar la entrada original a partir del hash' },
                  { icono: '💎', titulo: 'Resistencia a colisiones', desc: 'Computacionalmente inviable encontrar dos entradas con el mismo hash' },
                ].map((prop) => (
                  <div key={prop.titulo} className={styles.propiedadCard}>
                    <span className={styles.propiedadIcono} aria-hidden="true">{prop.icono}</span>
                    <strong>{prop.titulo}</strong>
                    <p>{prop.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.hashComparativa}>
              <h3>Comparativa de algoritmos hash</h3>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla} aria-label="Comparativa de algoritmos hash">
                  <thead>
                    <tr>
                      <th scope="col">Algoritmo</th>
                      <th scope="col">Salida</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Uso recomendado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={styles.rowObsoleto}>
                      <td>MD5</td>
                      <td>128 bits / 32 hex</td>
                      <td><span className={styles.badgePeligro}>Obsoleto</span></td>
                      <td>No usar para seguridad. Solo checksums no críticos</td>
                    </tr>
                    <tr className={styles.rowObsoleto}>
                      <td>SHA-1</td>
                      <td>160 bits / 40 hex</td>
                      <td><span className={styles.badgePeligro}>Obsoleto</span></td>
                      <td>Colisiones demostradas en 2017. No usar</td>
                    </tr>
                    <tr>
                      <td>SHA-256</td>
                      <td>256 bits / 64 hex</td>
                      <td><span className={styles.badgeSeguro}>Seguro</span></td>
                      <td>TLS, Bitcoin, git, verificación de integridad</td>
                    </tr>
                    <tr>
                      <td>SHA-3 (Keccak)</td>
                      <td>256/384/512 bits</td>
                      <td><span className={styles.badgeSeguro}>Seguro</span></td>
                      <td>Alternativa a SHA-2, diseño diferente (mayor resiliencia)</td>
                    </tr>
                    <tr>
                      <td>bcrypt / Argon2</td>
                      <td>Variable</td>
                      <td><span className={styles.badgeSeguro}>Recomendado</span></td>
                      <td>Contraseñas: hash + salt + coste computacional ajustable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ SECCIÓN 3: FIRMA DIGITAL ═══════════════ */}
        {seccion === 'firma' && (
          <section className={styles.seccion} aria-label="Firma digital">
            <div className={styles.firmaTabs}>
              <button
                className={`${styles.firmaTab} ${pasoFirma < 4 ? styles.firmaTabActivo : ''}`}
                onClick={() => setPasoFirma(0)}
              >
                Firmar
              </button>
              <button
                className={`${styles.firmaTab} ${pasoFirma >= 4 ? styles.firmaTabActivo : ''}`}
                onClick={() => setPasoFirma(4)}
              >
                Verificar
              </button>
            </div>

            {pasoFirma < 4 ? (
              <div className={styles.firmaDiagrama} aria-label="Proceso de firma digital">
                <h2>Cómo se crea una firma digital</h2>
                <p className={styles.firmaSubtitulo}>El remitente (Alice) firma el documento con su clave privada</p>
                <div className={styles.firmaSteps}>
                  {[
                    { icono: '📄', titulo: 'Documento original', desc: 'El contenido a firmar: contrato, software, email...', activo: true },
                    { icono: '#️⃣', titulo: 'Hash del documento', desc: 'SHA-256 del contenido → huella digital única de 256 bits', activo: true },
                    { icono: '🔐', titulo: 'Cifrar con clave privada', desc: 'El hash se cifra con la clave privada de Alice → esta es la firma', activo: true },
                    { icono: '📦', titulo: 'Documento + Firma', desc: 'Se envía el documento original junto con la firma digital', activo: true },
                  ].map((step, i) => (
                    <div key={i} className={styles.firmaStep} onClick={() => setPasoFirma(i)}>
                      <div className={`${styles.firmaStepNum} ${pasoFirma >= i ? styles.firmaStepActivo : ''}`}>{i + 1}</div>
                      <div className={styles.firmaStepIcono} aria-hidden="true">{step.icono}</div>
                      <div className={styles.firmaStepInfo}>
                        <strong>{step.titulo}</strong>
                        <p>{step.desc}</p>
                      </div>
                      {i < 3 && <div className={styles.firmaConector} aria-hidden="true">↓</div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.firmaDiagrama} aria-label="Proceso de verificación de firma digital">
                <h2>Cómo se verifica una firma digital</h2>
                <p className={styles.firmaSubtitulo}>El receptor (Bob) verifica con la clave pública de Alice</p>
                <div className={styles.firmaSteps}>
                  {[
                    { icono: '📦', titulo: 'Recibir documento + firma', desc: 'Bob recibe el documento y la firma adjunta de Alice' },
                    { icono: '🔓', titulo: 'Descifrar firma con clave pública', desc: 'Usa la clave pública de Alice para descifrar la firma → obtiene el hash original' },
                    { icono: '#️⃣', titulo: 'Calcular hash del documento', desc: 'Bob calcula el SHA-256 del documento recibido por separado' },
                    { icono: '✅', titulo: '¿Los hashes coinciden?', desc: 'Si hash descifrado = hash calculado → firma válida. El documento no fue alterado y solo Alice pudo firmarlo.' },
                  ].map((step, i) => (
                    <div key={i} className={styles.firmaStep}>
                      <div className={`${styles.firmaStepNum} ${styles.firmaStepVerif}`}>{i + 1}</div>
                      <div className={styles.firmaStepIcono} aria-hidden="true">{step.icono}</div>
                      <div className={styles.firmaStepInfo}>
                        <strong>{step.titulo}</strong>
                        <p>{step.desc}</p>
                      </div>
                      {i < 3 && <div className={styles.firmaConector} aria-hidden="true">↓</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.firmaUsos}>
              <h3>Casos de uso de la firma digital</h3>
              <div className={styles.usosGrid}>
                {[
                  { icono: '💻', titulo: 'Software', desc: 'Los instaladores firmados garantizan que el código no fue modificado por terceros tras su publicación.' },
                  { icono: '📧', titulo: 'Email (S/MIME)', desc: 'Firma de correos electrónicos para verificar identidad del remitente y detectar manipulaciones.' },
                  { icono: '📜', titulo: 'Contratos digitales', desc: 'Documentos PDF firmados con certificado cualificado tienen validez legal en la UE (eIDAS).' },
                  { icono: '🔗', titulo: 'Blockchain', desc: 'Cada transacción Bitcoin está firmada con ECDSA. Sin la clave privada, nadie puede mover los fondos.' },
                ].map((uso) => (
                  <div key={uso.titulo} className={styles.usoCard}>
                    <span className={styles.usoIcono} aria-hidden="true">{uso.icono}</span>
                    <strong>{uso.titulo}</strong>
                    <p>{uso.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.pkiExplicacion}>
              <h3>Certificados digitales y PKI</h3>
              <div className={styles.pkiCadena}>
                <div className={styles.pkiNodo}>
                  <span aria-hidden="true">🏛️</span>
                  <strong>Root CA</strong>
                  <small>Autoridad raíz (DigiCert, Let&apos;s Encrypt)</small>
                </div>
                <div className={styles.pkiFlecha} aria-hidden="true">↓ firma</div>
                <div className={styles.pkiNodo}>
                  <span aria-hidden="true">🏢</span>
                  <strong>Intermediate CA</strong>
                  <small>Autoridad intermedia</small>
                </div>
                <div className={styles.pkiFlecha} aria-hidden="true">↓ firma</div>
                <div className={styles.pkiNodo}>
                  <span aria-hidden="true">🌐</span>
                  <strong>Certificado del servidor</strong>
                  <small>meskeia.com, google.com...</small>
                </div>
              </div>
              <p className={styles.pkiDesc}>Un certificado X.509 vincula una clave pública con una identidad (dominio). La CA firma ese vínculo, y tu navegador confía en las CAs raíz incluidas por defecto.</p>
            </div>
          </section>
        )}

        {/* ═══════════════ SECCIÓN 4: HTTPS / TLS ═══════════════ */}
        {seccion === 'tls' && (
          <section className={styles.seccion} aria-label="HTTPS y TLS handshake">
            <div className={styles.tlsIntro}>
              <h2>El Handshake TLS 1.3</h2>
              <p>TLS combina lo mejor de ambos mundos: asimétrico para el intercambio de claves, simétrico para el tráfico.</p>
              <button
                className={styles.tlsPlayBtn}
                onClick={iniciarAnimacionTLS}
                disabled={animando}
                aria-label={animando ? 'Animación en curso' : 'Iniciar animación del handshake TLS'}
              >
                {animando ? '⏳ Conectando...' : '▶ Simular conexión HTTPS'}
              </button>
            </div>

            <div className={styles.tlsDiagrama}>
              <div className={styles.tlsActores}>
                <div className={styles.tlsActor}>
                  <span aria-hidden="true">🖥️</span>
                  <strong>Navegador</strong>
                </div>
                <div className={styles.tlsLinea} aria-hidden="true" />
                <div className={styles.tlsActor}>
                  <span aria-hidden="true">🗄️</span>
                  <strong>Servidor</strong>
                </div>
              </div>

              <div className={styles.tlsPasos} role="list" aria-label="Pasos del handshake TLS">
                {PASOS_TLS.map((paso, i) => (
                  <div
                    key={paso.paso}
                    className={`${styles.tlsPaso} ${pasoTLS > i ? styles.tlsPasoActivo : ''} ${paso.cifrado ? styles.tlsPasoCifrado : ''}`}
                    role="listitem"
                    aria-label={`Paso ${paso.paso}: ${paso.titulo}`}
                  >
                    <div className={styles.tlsPasoNum} aria-hidden="true">{paso.icono}</div>
                    <div className={styles.tlsPasoInfo}>
                      <strong>{paso.titulo}</strong>
                      {paso.desde && (
                        <span className={styles.tlsDireccion}>
                          {paso.desde}{paso.hacia ? ` → ${paso.hacia}` : ''}
                        </span>
                      )}
                      <p>{paso.descripcion}</p>
                    </div>
                    {paso.cifrado && (
                      <span className={styles.tlsCifradoBadge} aria-label="Datos cifrados">🔒 Cifrado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.tlsDatos}>
              <h3>¿Qué viaja cifrado vs en claro?</h3>
              <div className={styles.tlsClaro}>
                <div className={styles.tlsColumna}>
                  <h4 className={styles.tlsTituloClaro}>
                    <span aria-hidden="true">👁️</span> Visible (en claro)
                  </h4>
                  <ul>
                    <li>IP del servidor (visible en routing)</li>
                    <li>Dominio (SNI en ClientHello)</li>
                    <li>Certificado del servidor</li>
                    <li>Tamaño aproximado de las respuestas</li>
                  </ul>
                </div>
                <div className={styles.tlsColumna}>
                  <h4 className={styles.tlsTituloCifrado}>
                    <span aria-hidden="true">🔒</span> Cifrado (con AES)
                  </h4>
                  <ul>
                    <li>URLs completas y parámetros</li>
                    <li>Contenido de páginas y formularios</li>
                    <li>Cookies y headers HTTP</li>
                    <li>Contraseñas y datos sensibles</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.tlsHsts}>
              <h3>El candado del navegador</h3>
              <div className={styles.candadoGrid}>
                {[
                  { icono: '🔒', titulo: 'Candado verde/cerrado', desc: 'Certificado válido, conexión cifrada con TLS. Tu conexión con el servidor es privada.' },
                  { icono: '⚠️', titulo: 'Sin candado (HTTP)', desc: 'Todo el tráfico viaja en texto plano. Cualquiera en la red puede leerlo o modificarlo.' },
                  { icono: '🚫', titulo: 'Advertencia de certificado', desc: 'Certificado expirado, dominio incorrecto o CA no confiable. No continúes sin verificar.' },
                  { icono: '🛡️', titulo: 'HSTS', desc: 'HTTP Strict Transport Security: el servidor indica que SIEMPRE usar HTTPS. Los navegadores lo precachean.' },
                ].map((item) => (
                  <div key={item.titulo} className={styles.candadoCard}>
                    <span className={styles.candadoIcono} aria-hidden="true">{item.icono}</span>
                    <strong>{item.titulo}</strong>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="¿Cómo funciona la criptografía moderna?"
        subtitle="Del cifrado César a AES, RSA y TLS: los mecanismos que protegen tus datos"
      >
        {/* 1. TABLA COMPARATIVA */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable} aria-label="Comparativa de algoritmos criptográficos">
            <thead>
              <tr>
                <th scope="col">Algoritmo</th>
                <th scope="col">Tipo</th>
                <th scope="col">Velocidad</th>
                <th scope="col">Tamaño de clave</th>
                <th scope="col">Uso principal</th>
                <th scope="col">Seguridad actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>AES-256</strong></td>
                <td>Simétrico</td>
                <td>~1 GB/s</td>
                <td>256 bits</td>
                <td>Cifrado de datos en tránsito y en reposo</td>
                <td><span className={styles.badgeVerde}>Seguro</span></td>
              </tr>
              <tr>
                <td><strong>RSA-2048</strong></td>
                <td>Asimétrico</td>
                <td>~1 MB/s</td>
                <td>2048 bits</td>
                <td>Intercambio de claves, firma digital, TLS legacy</td>
                <td><span className={styles.badgeAmarillo}>Mínimo aceptable</span></td>
              </tr>
              <tr>
                <td><strong>ECDSA P-256</strong></td>
                <td>Asimétrico (curvas elípticas)</td>
                <td>~5 MB/s</td>
                <td>256 bits</td>
                <td>Firma digital, TLS moderno, criptomonedas</td>
                <td><span className={styles.badgeVerde}>Seguro</span></td>
              </tr>
              <tr>
                <td><strong>SHA-256</strong></td>
                <td>Función hash</td>
                <td>~500 MB/s</td>
                <td>Salida: 256 bits</td>
                <td>Integridad de datos, contraseñas, blockchain</td>
                <td><span className={styles.badgeVerde}>Seguro</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO / PERFILES */}
        <div className={styles.escenariosGrid}>
          {[
            {
              icono: '💻',
              titulo: 'Desarrollador web',
              desc: 'Implementa HTTPS con certificados TLS, almacena contraseñas con bcrypt o Argon2, firma tokens JWT con claves HMAC-SHA256. Necesita entender qué algoritmo usar en cada capa de su stack.',
            },
            {
              icono: '🎓',
              titulo: 'Estudiante de ciberseguridad',
              desc: 'Estudia para certificaciones como CompTIA Security+, CEH o CISSP. El visualizador le permite comprender el efecto avalancha, la PKI y el handshake TLS antes de los exámenes prácticos.',
            },
            {
              icono: '🖥️',
              titulo: 'Administrador de sistemas',
              desc: 'Gestiona certificados TLS, renueva CAs internas, configura HSTS y OCSP. Necesita entender la cadena de confianza PKI para mantener la infraestructura sin interrupciones.',
            },
            {
              icono: '📰',
              titulo: 'Periodista o activista',
              desc: 'Necesita comunicaciones seguras con fuentes mediante PGP/GPG. Comprende por qué la clave privada nunca debe salir de su dispositivo y cómo verificar la autenticidad de un mensaje recibido.',
            },
          ].map((p) => (
            <div key={p.titulo} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">{p.icono}</span>
              <strong>{p.titulo}</strong>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <div className={styles.faqList}>
          {[
            {
              q: '¿Qué diferencia hay entre cifrado simétrico y asimétrico?',
              a: 'El cifrado simétrico (AES) usa una sola clave compartida entre emisor y receptor: es muy rápido pero plantea el problema de distribuir esa clave de forma segura. El asimétrico (RSA, ECDSA) usa un par de claves: pública para cifrar y privada para descifrar. Es más lento pero elimina el problema del intercambio seguro de claves.',
              tip: 'Analogía: el simétrico es como un candado con copia de llave; el asimétrico es un buzón con ranura pública y llave privada solo para ti.',
            },
            {
              q: '¿Por qué HTTPS usa RSA al principio pero luego AES?',
              a: 'Durante el handshake TLS, RSA o ECDH se usan para intercambiar una clave de sesión de forma segura (sin transmitirla). Una vez establecida esa clave compartida, todo el tráfico se cifra con AES, que es ~1000 veces más rápido. Es el mejor de los dos mundos: la seguridad del asimétrico y la velocidad del simétrico.',
              tip: null,
            },
            {
              q: '¿Qué es un certificado digital?',
              a: 'Un certificado X.509 es un documento firmado digitalmente por una Autoridad de Certificación (CA) que vincula una clave pública con una identidad (dominio, empresa o persona). Tu navegador confía en las CAs raíz preinstaladas, y si la cadena de firmas es válida, acepta el certificado del servidor.',
              tip: 'El candado del navegador no garantiza que el sitio sea de confianza: solo certifica que la conexión es cifrada y que el dominio coincide con el certificado.',
            },
            {
              q: '¿Cuánto tarda en romperse AES-256 con un ordenador cuántico?',
              a: 'Con el algoritmo de Grover, un ordenador cuántico ideal reduciría la seguridad de AES-256 a la de AES-128 clásico — aún considerado seguro. Para RSA y ECDSA, el algoritmo de Shor sí supondría una amenaza real. Por eso el NIST ya ha estandarizado algoritmos post-cuánticos (CRYSTALS-Kyber, CRYSTALS-Dilithium) para sustituir a RSA/ECDSA.',
              tip: null,
            },
            {
              q: '¿Qué es la criptografía post-cuántica?',
              a: 'Son algoritmos diseñados para resistir ataques de ordenadores cuánticos. El NIST finalizó en 2024 los primeros estándares: ML-KEM (Kyber) para intercambio de claves y ML-DSA (Dilithium) para firmas digitales. Se basan en problemas matemáticos distintos a RSA/ECDSA, como la dificultad de resolver retículos (lattices).',
              tip: 'Horizonte realista: los ordenadores cuánticos capaces de romper RSA-2048 no existirán antes de 2035-2040 según los expertos.',
            },
          ].map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <strong>{item.q}</strong>
              <p>{item.a}</p>
              {item.tip && <p className={styles.faqTip}><span aria-hidden="true">💡</span> {item.tip}</p>}
            </div>
          ))}
        </div>

        {/* 4. GUÍA PASO A PASO */}
        <div className={styles.stepGuide}>
          {[
            {
              num: 1,
              titulo: 'Empieza con AES (cifrado simétrico)',
              desc: 'Ve a la sección "Simétrico vs Asimétrico" y selecciona AES. Observa el diagrama de Alice y Bob compartiendo una clave única. Alterna entre "Cifrar" y "Descifrar" para ver cómo funciona en ambos sentidos.',
            },
            {
              num: 2,
              titulo: 'Explora RSA (cifrado asimétrico)',
              desc: 'Selecciona RSA en el mismo panel. Nota la diferencia: ahora hay clave pública y privada. Compara la velocidad (~1 MB/s vs ~1 GB/s de AES) y entiende por qué solo se usa para el intercambio inicial de claves.',
            },
            {
              num: 3,
              titulo: 'Observa el efecto avalancha (SHA-256)',
              desc: 'Ve a la sección "Funciones Hash". Escribe cualquier texto y cambia una sola letra. Los caracteres en rojo del hash muestran qué posiciones cambiaron. Normalmente cambiarán más del 50% de los 64 caracteres hexadecimales.',
            },
            {
              num: 4,
              titulo: 'Comprende la firma digital',
              desc: 'En la sección "Firma Digital" sigue los 4 pasos del proceso de firma (Alice) y luego los 4 pasos de verificación (Bob). Entiende que la firma = hash cifrado con clave privada, y que cualquiera puede verificarla con la clave pública.',
            },
            {
              num: 5,
              titulo: 'Simula el handshake TLS completo',
              desc: 'Ve a "HTTPS / TLS" y pulsa "Simular conexión HTTPS". Observa los 5 pasos: ClientHello → certificado → verificación CA → Diffie-Hellman → AES cifrado. Comprende por qué solo los últimos pasos van cifrados.',
            },
          ].map((s) => (
            <div key={s.num} className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">{s.num}</div>
              <div className={styles.stepContent}>
                <strong>{s.titulo}</strong>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 5. MEJORES PRÁCTICAS */}
        <div className={styles.tipsGrid}>
          {[
            {
              icono: '🔗',
              titulo: 'Combina simétrico + asimétrico',
              desc: 'En la práctica, nunca se usa solo uno. RSA o ECDH establecen el canal seguro; AES cifra los datos. Es el principio detrás de TLS, PGP y Signal.',
            },
            {
              icono: '📏',
              titulo: 'Longitud de clave: más no siempre es mejor',
              desc: 'RSA-4096 es el doble de seguro que RSA-2048 pero 4-8 veces más lento. ECDSA-256 ofrece seguridad equivalente a RSA-3072 con claves 12 veces más cortas. Elige el algoritmo correcto antes de subir bits.',
            },
            {
              icono: '✍️',
              titulo: 'Cifrar ≠ Firmar',
              desc: 'Cifrar protege la confidencialidad (nadie más puede leerlo). Firmar garantiza autenticidad e integridad (solo tú pudiste crearlo, no fue modificado). Son operaciones distintas con propósitos distintos.',
            },
            {
              icono: '⚡',
              titulo: 'ECDSA como alternativa eficiente a RSA',
              desc: 'ECDSA con curva P-256 o Ed25519 es la elección moderna para firmas. Misma seguridad, clave 10x más corta, operaciones 5x más rápidas. TLS 1.3 y SSH lo usan por defecto.',
            },
            {
              icono: '🔑',
              titulo: 'La clave privada nunca viaja por la red',
              desc: 'En criptografía asimétrica correctamente implementada, la clave privada nunca abandona el dispositivo donde se generó. Si la ves en un email o log, es que algo falló gravemente.',
            },
          ].map((t) => (
            <div key={t.titulo} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{t.icono}</span>
              <strong>{t.titulo}</strong>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* 6. WARNING BOX — errores comunes */}
        <div className={styles.warningBox} role="note" aria-label="Errores comunes sobre criptografía">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes sobre criptografía</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>«MD5 y SHA-1 son seguros»</strong> — Ambos están rotos. Se han demostrado colisiones prácticas. No los uses para seguridad bajo ningún concepto; SHA-256 o SHA-3 son los mínimos aceptables.</li>
            <li><strong>«Más bits siempre significa más seguridad»</strong> — Un RSA-8192 no tiene sentido si usas SHA-1 para firmar. La seguridad del sistema viene determinada por el eslabón más débil, no por el más fuerte.</li>
            <li><strong>«Cifrar y comprimir son lo mismo»</strong> — Son operaciones completamente distintas. La compresión reduce redundancia; el cifrado oculta información. Nunca comprimas después de cifrar (ataque CRIME/BREACH).</li>
            <li><strong>«HTTPS garantiza que el sitio es de confianza»</strong> — Solo garantiza que la conexión entre tu navegador y ese servidor está cifrada. El sitio puede ser perfectamente fraudulento con un certificado HTTPS válido.</li>
            <li><strong>«La computación cuántica ya es una amenaza para AES»</strong> — Para AES-256 no: el algoritmo de Grover lo reduciría a ~128 bits de seguridad, aún seguro. La amenaza real es para RSA y ECDSA (algoritmo de Shor), pero los ordenadores cuánticos capaces de esto están a 10-15 años vista.</li>
            <li><strong>«Puedo inventar mi propio algoritmo de cifrado»</strong> — Los algoritmos criptográficos modernos han sido analizados durante décadas por los mejores matemáticos del mundo. Nunca uses criptografía casera en producción; usa primitivas estándar (AES, ChaCha20, SHA-256).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-criptografia')} />
      <ShareCard appName="visualizador-criptografia" />
      <Footer appName="visualizador-criptografia" />
    </div>
  );
}
