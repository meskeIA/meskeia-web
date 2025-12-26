'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraSubredes.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
      <Footer appName="calculadora-subredes" />
    </div>
  );
}
