'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './CalculadoraSubredes.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface SubnetInfo {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  ipType: string;
  wildcardMask: string;
  binaryMask: string;
  binaryNetwork: string;
  binaryBroadcast: string;
}

// Funciones de cálculo
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

function cidrToMask(cidr: number): string {
  const mask = cidr === 0 ? 0 : ~((1 << (32 - cidr)) - 1) >>> 0;
  return numberToIp(mask);
}

function maskToBinary(mask: string): string {
  return mask
    .split('.')
    .map((octet) => parseInt(octet).toString(2).padStart(8, '0'))
    .join('.');
}

function getIpClass(ip: string): string {
  const firstOctet = parseInt(ip.split('.')[0]);
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reservada)';
  return 'Especial';
}

function getIpType(ip: string): string {
  const parts = ip.split('.').map(Number);
  // Privadas
  if (parts[0] === 10) return 'Privada (Clase A)';
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return 'Privada (Clase B)';
  if (parts[0] === 192 && parts[1] === 168) return 'Privada (Clase C)';
  // Loopback
  if (parts[0] === 127) return 'Loopback';
  // Link-local
  if (parts[0] === 169 && parts[1] === 254) return 'Link-Local (APIPA)';
  // Multicast
  if (parts[0] >= 224 && parts[0] <= 239) return 'Multicast';
  return 'Pública';
}

function calculateSubnet(ip: string, cidr: number): SubnetInfo {
  const ipNum = ipToNumber(ip);
  const maskNum = cidr === 0 ? 0 : ~((1 << (32 - cidr)) - 1) >>> 0;
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalHosts - 2;

  const subnetMask = numberToIp(maskNum);
  const networkAddress = numberToIp(networkNum);
  const broadcastAddress = numberToIp(broadcastNum);

  let firstHost: string;
  let lastHost: string;

  if (cidr === 32) {
    firstHost = ip;
    lastHost = ip;
  } else if (cidr === 31) {
    // Point-to-point link (RFC 3021)
    firstHost = networkAddress;
    lastHost = broadcastAddress;
  } else {
    firstHost = numberToIp(networkNum + 1);
    lastHost = numberToIp(broadcastNum - 1);
  }

  return {
    ipAddress: ip,
    cidr,
    subnetMask,
    networkAddress,
    broadcastAddress,
    firstHost,
    lastHost,
    totalHosts,
    usableHosts,
    ipClass: getIpClass(ip),
    ipType: getIpType(ip),
    wildcardMask: numberToIp(~maskNum >>> 0),
    binaryMask: maskToBinary(subnetMask),
    binaryNetwork: maskToBinary(networkAddress),
    binaryBroadcast: maskToBinary(broadcastAddress),
  };
}

function isValidIp(ip: string): boolean {
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!regex.test(ip)) return false;
  const parts = ip.split('.').map(Number);
  return parts.every((part) => part >= 0 && part <= 255);
}

// Tabla de máscaras comunes
const COMMON_MASKS = [
  { cidr: 8, mask: '255.0.0.0', hosts: '16.777.214', use: 'Clase A' },
  { cidr: 16, mask: '255.255.0.0', hosts: '65.534', use: 'Clase B' },
  { cidr: 24, mask: '255.255.255.0', hosts: '254', use: 'Clase C' },
  { cidr: 25, mask: '255.255.255.128', hosts: '126', use: '2 subredes' },
  { cidr: 26, mask: '255.255.255.192', hosts: '62', use: '4 subredes' },
  { cidr: 27, mask: '255.255.255.224', hosts: '30', use: '8 subredes' },
  { cidr: 28, mask: '255.255.255.240', hosts: '14', use: '16 subredes' },
  { cidr: 29, mask: '255.255.255.248', hosts: '6', use: '32 subredes' },
  { cidr: 30, mask: '255.255.255.252', hosts: '2', use: 'Point-to-point' },
  { cidr: 31, mask: '255.255.255.254', hosts: '2*', use: 'RFC 3021' },
  { cidr: 32, mask: '255.255.255.255', hosts: '1', use: 'Host único' },
];

export default function CalculadoraSubredesPage() {
  const [ipInput, setIpInput] = useState('192.168.1.100');
  const [cidr, setCidr] = useState(24);
  const [showBinary, setShowBinary] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const isValid = useMemo(() => isValidIp(ipInput), [ipInput]);

  const subnetInfo = useMemo(() => {
    if (!isValid) return null;
    return calculateSubnet(ipInput, cidr);
  }, [ipInput, cidr, isValid]);

  const handleCopy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setIpInput(value);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🌐</span>
        <h1 className={styles.title}>Calculadora de Subredes IP</h1>
        <p className={styles.subtitle}>
          Calcula máscaras de red, rangos de hosts, broadcast y más. Ideal para estudiantes y administradores de redes.
        </p>
      </header>

      <LegalNotice />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <section className={styles.inputSection}>
          <h2 className={styles.sectionTitle}>Dirección IP y CIDR</h2>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Dirección IP</label>
              <input
                type="text"
                value={ipInput}
                onChange={handleIpChange}
                className={`${styles.input} ${!isValid && ipInput ? styles.inputError : ''}`}
                placeholder="192.168.1.100"
                maxLength={15}
              />
              {!isValid && ipInput && (
                <span className={styles.errorMsg}>IP inválida</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Prefijo CIDR (/{cidr})</label>
              <input
                type="range"
                min="0"
                max="32"
                value={cidr}
                onChange={(e) => setCidr(parseInt(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>/0</span>
                <span>/8</span>
                <span>/16</span>
                <span>/24</span>
                <span>/32</span>
              </div>
            </div>
          </div>

          <div className={styles.notation}>
            <span className={styles.notationLabel}>Notación CIDR:</span>
            <code className={styles.notationValue}>
              {ipInput}/{cidr}
            </code>
          </div>
        </section>

        {/* Panel de resultados */}
        {subnetInfo && (
          <section className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>Resultados del Cálculo</h2>

            <div className={styles.resultsGrid}>
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Máscara de Red</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(subnetInfo.subnetMask, 'mask')}
                    title="Copiar"
                  >
                    {copied === 'mask' ? '✓' : '📋'}
                  </button>
                </div>
                <div className={styles.resultValue}>{subnetInfo.subnetMask}</div>
                {showBinary && (
                  <div className={styles.binaryValue}>{subnetInfo.binaryMask}</div>
                )}
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Dirección de Red</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(subnetInfo.networkAddress, 'network')}
                    title="Copiar"
                  >
                    {copied === 'network' ? '✓' : '📋'}
                  </button>
                </div>
                <div className={styles.resultValue}>{subnetInfo.networkAddress}</div>
                {showBinary && (
                  <div className={styles.binaryValue}>{subnetInfo.binaryNetwork}</div>
                )}
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Dirección Broadcast</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(subnetInfo.broadcastAddress, 'broadcast')}
                    title="Copiar"
                  >
                    {copied === 'broadcast' ? '✓' : '📋'}
                  </button>
                </div>
                <div className={styles.resultValue}>{subnetInfo.broadcastAddress}</div>
                {showBinary && (
                  <div className={styles.binaryValue}>{subnetInfo.binaryBroadcast}</div>
                )}
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Máscara Wildcard</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(subnetInfo.wildcardMask, 'wildcard')}
                    title="Copiar"
                  >
                    {copied === 'wildcard' ? '✓' : '📋'}
                  </button>
                </div>
                <div className={styles.resultValue}>{subnetInfo.wildcardMask}</div>
              </div>
            </div>

            <div className={styles.rangeSection}>
              <h3 className={styles.rangeTitle}>Rango de Hosts Utilizables</h3>
              <div className={styles.rangeRow}>
                <div className={styles.rangeItem}>
                  <span className={styles.rangeLabel}>Primer Host</span>
                  <code className={styles.rangeValue}>{subnetInfo.firstHost}</code>
                </div>
                <span className={styles.rangeSeparator}>→</span>
                <div className={styles.rangeItem}>
                  <span className={styles.rangeLabel}>Último Host</span>
                  <code className={styles.rangeValue}>{subnetInfo.lastHost}</code>
                </div>
              </div>
              <div className={styles.hostCount}>
                <span className={styles.hostNumber}>
                  {subnetInfo.usableHosts.toLocaleString('es-ES')}
                </span>
                <span className={styles.hostLabel}>hosts utilizables</span>
                <span className={styles.hostTotal}>
                  (de {subnetInfo.totalHosts.toLocaleString('es-ES')} direcciones totales)
                </span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Clase IP</span>
                <span className={styles.infoValue}>{subnetInfo.ipClass}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tipo</span>
                <span className={styles.infoValue}>{subnetInfo.ipType}</span>
              </div>
            </div>

            <button
              className={styles.binaryToggle}
              onClick={() => setShowBinary(!showBinary)}
            >
              {showBinary ? '🔢 Ocultar binario' : '🔢 Mostrar en binario'}
            </button>
          </section>
        )}
      </div>

      {/* Tabla de máscaras comunes */}
      <section className={styles.referenceSection}>
        <h2 className={styles.sectionTitle}>Máscaras de Subred Comunes</h2>
        <div className={styles.referenceTable}>
          <table>
            <thead>
              <tr>
                <th>CIDR</th>
                <th>Máscara</th>
                <th>Hosts</th>
                <th>Uso típico</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_MASKS.map((mask) => (
                <tr
                  key={mask.cidr}
                  className={mask.cidr === cidr ? styles.activeRow : ''}
                  onClick={() => setCidr(mask.cidr)}
                >
                  <td>/{mask.cidr}</td>
                  <td>{mask.mask}</td>
                  <td>{mask.hosts}</td>
                  <td>{mask.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          * RFC 3021 permite /31 para enlaces punto a punto sin desperdiciar IPs
        </p>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre Subredes IP?"
        subtitle="Conceptos fundamentales de networking y direccionamiento"
        icon="📚"
      >
        {/* Sección 1: Tabla Comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Prefijo CIDR</th>
                <th>Máscara de subred</th>
                <th>Hosts utilizables</th>
                <th>Uso típico</th>
                <th>Clase IP</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>/8</td><td>255.0.0.0</td><td>16.777.214</td><td>Grandes corporaciones, ISPs</td><td>A</td></tr>
              <tr><td>/16</td><td>255.255.0.0</td><td>65.534</td><td>Empresas medianas, universidades</td><td>B</td></tr>
              <tr><td>/24</td><td>255.255.255.0</td><td>254</td><td>Redes de oficina, domésticas</td><td>C</td></tr>
              <tr><td>/25</td><td>255.255.255.128</td><td>126</td><td>Dos departamentos en una red C</td><td>C</td></tr>
              <tr><td>/26</td><td>255.255.255.192</td><td>62</td><td>Cuatro grupos pequeños</td><td>C</td></tr>
              <tr><td>/27</td><td>255.255.255.224</td><td>30</td><td>VLANs pequeñas, plantas de edificio</td><td>C</td></tr>
              <tr><td>/30</td><td>255.255.255.252</td><td>2</td><td>Enlace punto a punto entre routers</td><td>C</td></tr>
              <tr><td>/32</td><td>255.255.255.255</td><td>1 (host)</td><td>Rutas de host único, loopback</td><td>Host</td></tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2: Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🏠 Red doméstica con router</h3>
            <p>Un router doméstico usa típicamente 192.168.1.0/24, proporcionando 254 IPs. Calcula las IPs disponibles y verifica que tu dispositivo está en la subred correcta.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🏢 Segmentación de VLANs empresariales</h3>
            <p>Divide una red corporativa en VLANs por departamento: Ventas /26 (62 hosts), IT /27 (30 hosts), Dirección /28 (14 hosts). Optimiza el espacio de IPs disponible.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🔧 Configuración de ACLs en Cisco</h3>
            <p>Las ACLs de IOS usan máscara wildcard (inversa de la subred). Calcula automáticamente la wildcard mask para configurar reglas de firewall en routers Cisco.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>☁️ Planificación de VPCs en cloud</h3>
            <p>AWS VPC, Azure VNet y GCP VPC requieren definir rangos CIDR. Usa /16 para el VPC raíz y divide en /24 por zona de disponibilidad y servicio.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🔍 Diagnóstico de conflictos de IP</h3>
            <p>Verifica si dos IPs están en la misma subred comparando sus direcciones de red. Si comparten red y máscara, deben comunicarse sin router.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>📚 Preparación para CCNA / Network+</h3>
            <p>Las certificaciones de red (CCNA, CompTIA Network+) exigen dominar el subnetting. Practica calculando máscaras y rangos hasta automatizarlo mentalmente.</p>
          </div>
        </div>

        {/* Sección 3: FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>¿Por qué se restan 2 hosts al calcular IPs utilizables?</h3>
            <p>Porque la primera dirección es la dirección de red (identifica la subred) y la última es el broadcast (para enviar a todos los hosts). Ninguna de las dos se asigna a dispositivos individuales.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué significa la notación CIDR como /24?</h3>
            <p>CIDR indica cuántos bits de la izquierda son la parte de red. /24 significa 24 bits de red y 8 bits de host. Con 8 bits de host: 2⁸ = 256 direcciones (254 utilizables).</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Cuándo usar /31 en lugar de /30 para enlaces punto a punto?</h3>
            <p>El RFC 3021 permite usar /31 en enlaces punto a punto, eliminando la necesidad de reservar broadcast y red. Ahorra 2 IPs por enlace, lo que es significativo en redes con muchos routers.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Cuáles son los rangos de IP privadas?</h3>
            <p>RFC 1918 define tres rangos privados: 10.0.0.0/8 (Clase A, ~16M IPs), 172.16.0.0/12 (Clase B, ~1M IPs) y 192.168.0.0/16 (Clase C, 65.534 IPs). No se enrutan en Internet.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Para qué sirve la máscara wildcard?</h3>
            <p>Es el complemento binario de la máscara de subred. Se usa en ACLs de Cisco IOS y OSPF para indicar qué bits deben coincidir. /24 (255.255.255.0) tiene wildcard 0.0.0.255.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué es la dirección broadcast y para qué sirve?</h3>
            <p>Es la última IP de la subred. Un paquete enviado al broadcast llega a todos los hosts de la subred simultáneamente. Útil para descubrimiento de dispositivos (ARP, DHCP Discovery).</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué diferencia hay entre subred y VLAN?</h3>
            <p>Una subred es un concepto de Capa 3 (IP). Una VLAN es un concepto de Capa 2 (Ethernet) que segmenta el tráfico en un switch. Normalmente cada VLAN tiene su propia subred IP asignada.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Por qué IPv4 e IPv6 coexisten si IPv6 es superior?</h3>
            <p>La transición lleva décadas por la enorme infraestructura IPv4 existente. Los dispositivos actuales implementan dual-stack (IPv4 + IPv6) hasta que IPv6 sea mayoritario, lo que puede tomar años más.</p>
          </div>
        </div>

        {/* Sección 4: Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Determina cuántos hosts necesitas</h3>
              <p>Cuenta los dispositivos que conectarás (PCs, servidores, impresoras, teléfonos IP) y añade un margen de crecimiento del 20-30%.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Elige el prefijo CIDR mínimo</h3>
              <p>Selecciona el prefijo que cubra tus hosts: para 50 hosts necesitas /26 (62 hosts), para 100 necesitas /25 (126 hosts).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Introduce la IP base</h3>
              <p>Escribe la dirección IP base (ej: 192.168.10.0). Asegúrate de que sea una IP privada de los rangos RFC 1918 para redes internas.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Ajusta el slider CIDR</h3>
              <p>Mueve el slider hasta el prefijo seleccionado. Observa cómo cambian en tiempo real la máscara, el rango de hosts y la dirección de broadcast.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Verifica el rango de hosts</h3>
              <p>Confirma que el primer y último host cubren todos tus dispositivos. Recuerda que la primera IP suele asignarse al gateway (router).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Anota dirección de red y broadcast</h3>
              <p>Copia estos valores con el botón 📋. Los necesitarás para configurar el router, el servidor DHCP y las reglas de firewall.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Documenta la configuración</h3>
              <p>Registra la subred, máscara, gateway y rango DHCP en un documento de red. Una buena documentación evita conflictos de IP futuros.</p>
            </div>
          </div>
        </div>

        {/* Sección 5: Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>📏 Deja margen de hosts</h3>
            <p>No uses el prefijo justo. Si necesitas 50 hosts, elige /26 (62) en lugar de /27 (30). Prever crecimiento evita reconfigurar la red en el futuro.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📄 Documenta siempre</h3>
            <p>Registra el propósito de cada subred: &quot;192.168.10.0/24 - Planta 1 - WiFi empleados&quot;. La documentación es esencial para el mantenimiento.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔒 Usa rangos privados internamente</h3>
            <p>Utiliza siempre rangos RFC 1918 (10.x, 172.16-31.x, 192.168.x) en redes internas. Las IPs públicas son para interfaces externas de routers.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🌐 Reserva IPs para infraestructura</h3>
            <p>Asigna las primeras IPs de cada subred a routers, switches y servidores. Usa DHCP solo para el rango restante para facilitar la gestión.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔗 Usa /30 para enlaces entre routers</h3>
            <p>Los enlaces WAN entre routers solo necesitan 2 IPs. Un /30 es suficiente y no desperdicia espacio. Considera /31 (RFC 3021) para ahorrar aún más.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🚀 Planifica pensando en el futuro</h3>
            <p>Diseña el esquema de subredes con espacio para crecer. Usa un bloque padre grande (ej: 10.0.0.0/8) y subdivídelo en subredes más pequeñas según necesidad.</p>
          </div>
        </div>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox}>
          <h3>⚠️ Importante para entornos de producción</h3>
          <ul className={styles.warningList}>
            <li>Esta calculadora trabaja exclusivamente con IPv4 (32 bits). IPv6 usa un esquema diferente con 128 bits.</li>
            <li>Para entornos de producción, valida siempre la configuración de red con un administrador de sistemas.</li>
            <li>Los cambios en subredes activas pueden interrumpir el servicio. Planifica una ventana de mantenimiento.</li>
            <li>En redes cloud (AWS, Azure, GCP), algunos rangos están reservados por el proveedor y no son utilizables.</li>
          </ul>
        </div>

        {/* Contenido original */}
        <section className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>🌐 ¿Qué es una Subred?</h3>
              <p>
                Una subred es una división lógica de una red IP. Permite segmentar
                una red grande en redes más pequeñas y manejables, mejorando la
                seguridad y el rendimiento.
              </p>
              <code>Red original: 192.168.0.0/16 → Subredes: 192.168.1.0/24, 192.168.2.0/24...</code>
            </div>

            <div className={styles.infoCard}>
              <h3>📐 Notación CIDR</h3>
              <p>
                CIDR (Classless Inter-Domain Routing) indica cuántos bits de la
                dirección IP pertenecen a la red. Por ejemplo, /24 significa que
                los primeros 24 bits son la red y los últimos 8 son para hosts.
              </p>
              <code>/24 = 255.255.255.0 = 254 hosts</code>
            </div>

            <div className={styles.infoCard}>
              <h3>🏠 Direcciones Privadas (RFC 1918)</h3>
              <p>
                Rangos reservados para redes internas que no se enrutan en Internet:
              </p>
              <code>
                10.0.0.0/8 (Clase A)<br />
                172.16.0.0/12 (Clase B)<br />
                192.168.0.0/16 (Clase C)
              </code>
            </div>

            <div className={styles.infoCard}>
              <h3>📡 Broadcast vs Gateway</h3>
              <p>
                <strong>Broadcast:</strong> Última IP de la subred, envía a todos los hosts.<br />
                <strong>Gateway:</strong> Típicamente la primera IP usable, conecta con otras redes.
              </p>
              <code>
                Red: 192.168.1.0/24<br />
                Gateway: 192.168.1.1<br />
                Broadcast: 192.168.1.255
              </code>
            </div>

            <div className={styles.infoCard}>
              <h3>🔢 Cálculo de Hosts</h3>
              <p>
                Fórmula: 2^(32-CIDR) - 2<br />
                Se restan 2 porque la dirección de red y broadcast no son asignables a hosts.
              </p>
              <code>
                /24 = 2^8 - 2 = 254 hosts<br />
                /25 = 2^7 - 2 = 126 hosts<br />
                /30 = 2^2 - 2 = 2 hosts
              </code>
            </div>

            <div className={styles.infoCard}>
              <h3>🎭 Máscara Wildcard</h3>
              <p>
                Es el inverso de la máscara de subred. Se usa en ACLs de routers
                Cisco y otros dispositivos de red.
              </p>
              <code>
                Máscara: 255.255.255.0<br />
                Wildcard: 0.0.0.255
              </code>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-subredes')} />
      <ShareCard appName="calculadora-subredes" />
      <Footer appName="calculadora-subredes" />
    </div>
  );
}
