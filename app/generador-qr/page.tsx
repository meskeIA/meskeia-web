'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './GeneradorQR.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TipoQR = 'texto' | 'url' | 'wifi' | 'contacto' | 'email' | 'telefono';

interface ConfigWifi {
  ssid: string;
  password: string;
  seguridad: 'WPA' | 'WEP' | 'nopass';
  oculta: boolean;
}

interface ConfigContacto {
  nombre: string;
  telefono: string;
  email: string;
  empresa: string;
  cargo: string;
  direccion: string;
  web: string;
}

interface ConfigEmail {
  destinatario: string;
  asunto: string;
  cuerpo: string;
}

export default function GeneradorQRPage() {
  const [tipoQR, setTipoQR] = useState<TipoQR>('url');
  const [texto, setTexto] = useState('');
  const [urlInput, setUrlInput] = useState('https://');
  const [telefonoInput, setTelefonoInput] = useState('');
  const [configWifi, setConfigWifi] = useState<ConfigWifi>({
    ssid: '',
    password: '',
    seguridad: 'WPA',
    oculta: false,
  });
  const [configContacto, setConfigContacto] = useState<ConfigContacto>({
    nombre: '',
    telefono: '',
    email: '',
    empresa: '',
    cargo: '',
    direccion: '',
    web: '',
  });
  const [configEmail, setConfigEmail] = useState<ConfigEmail>({
    destinatario: '',
    asunto: '',
    cuerpo: '',
  });
  const [tamano, setTamano] = useState(200);
  const [colorFrente, setColorFrente] = useState('#000000');
  const [colorFondo, setColorFondo] = useState('#FFFFFF');
  const [qrGenerado, setQrGenerado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generar el contenido del QR según el tipo
  const generarContenidoQR = (): string => {
    switch (tipoQR) {
      case 'texto':
        return texto;
      case 'url':
        return urlInput;
      case 'telefono':
        return `tel:${telefonoInput}`;
      case 'wifi':
        // Formato WiFi estándar: WIFI:T:WPA;S:SSID;P:password;H:true;;
        const { ssid, password, seguridad, oculta } = configWifi;
        return `WIFI:T:${seguridad};S:${ssid};P:${password};H:${oculta};;`;
      case 'contacto':
        // Formato vCard
        const { nombre, telefono, email, empresa, cargo, direccion, web } = configContacto;
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (nombre) vcard += `FN:${nombre}\n`;
        if (telefono) vcard += `TEL:${telefono}\n`;
        if (email) vcard += `EMAIL:${email}\n`;
        if (empresa) vcard += `ORG:${empresa}\n`;
        if (cargo) vcard += `TITLE:${cargo}\n`;
        if (direccion) vcard += `ADR:;;${direccion};;;;\n`;
        if (web) vcard += `URL:${web}\n`;
        vcard += 'END:VCARD';
        return vcard;
      case 'email':
        const { destinatario, asunto, cuerpo } = configEmail;
        let mailto = `mailto:${destinatario}`;
        const params: string[] = [];
        if (asunto) params.push(`subject=${encodeURIComponent(asunto)}`);
        if (cuerpo) params.push(`body=${encodeURIComponent(cuerpo)}`);
        if (params.length > 0) mailto += `?${params.join('&')}`;
        return mailto;
      default:
        return '';
    }
  };

  // Verificar si hay contenido válido
  const tieneContenido = (): boolean => {
    switch (tipoQR) {
      case 'texto':
        return texto.trim().length > 0;
      case 'url':
        return urlInput.length > 8;
      case 'telefono':
        return telefonoInput.trim().length > 0;
      case 'wifi':
        return configWifi.ssid.trim().length > 0;
      case 'contacto':
        return configContacto.nombre.trim().length > 0 || configContacto.telefono.trim().length > 0;
      case 'email':
        return configEmail.destinatario.trim().length > 0;
      default:
        return false;
    }
  };

  // Generar QR usando API de Google Charts (gratuita y confiable)
  const generarQR = () => {
    const contenido = generarContenidoQR();
    if (!contenido || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Usar API de Google Charts para generar el QR
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Construir URL con colores personalizados
    const colorFrenteHex = colorFrente.replace('#', '');
    const colorFondoHex = colorFondo.replace('#', '');
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${tamano}x${tamano}&chl=${encodeURIComponent(contenido)}&chco=${colorFrenteHex}&chf=bg,s,${colorFondoHex}`;

    img.onload = () => {
      canvas.width = tamano;
      canvas.height = tamano;
      ctx.drawImage(img, 0, 0);
      setQrGenerado(true);
    };

    img.onerror = () => {
      // Fallback: dibujar placeholder si falla
      canvas.width = tamano;
      canvas.height = tamano;
      ctx.fillStyle = colorFondo;
      ctx.fillRect(0, 0, tamano, tamano);
      ctx.fillStyle = colorFrente;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Error al generar QR', tamano / 2, tamano / 2);
      setQrGenerado(false);
    };

    img.src = qrUrl;
  };

  // Descargar QR como PNG
  const descargarQR = () => {
    if (!canvasRef.current || !qrGenerado) return;

    const link = document.createElement('a');
    link.download = `qr-meskeia-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Copiar QR al portapapeles
  const copiarQR = async () => {
    if (!canvasRef.current || !qrGenerado) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback para navegadores sin soporte
      alert('Tu navegador no soporta copiar imágenes al portapapeles');
    }
  };

  // Regenerar QR automáticamente cuando cambia el contenido
  useEffect(() => {
    if (tieneContenido()) {
      const timer = setTimeout(generarQR, 300);
      return () => clearTimeout(timer);
    } else {
      setQrGenerado(false);
    }
  }, [tipoQR, texto, urlInput, telefonoInput, configWifi, configContacto, configEmail, tamano, colorFrente, colorFondo]);

  const tiposQR = [
    { id: 'url', nombre: 'URL', emoji: '🔗' },
    { id: 'texto', nombre: 'Texto', emoji: '📝' },
    { id: 'wifi', nombre: 'WiFi', emoji: '📶' },
    { id: 'contacto', nombre: 'Contacto', emoji: '👤' },
    { id: 'email', nombre: 'Email', emoji: '📧' },
    { id: 'telefono', nombre: 'Teléfono', emoji: '📞' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Códigos QR</h1>
        <p className={styles.subtitle}>
          Crea códigos QR para URLs, texto, WiFi, contactos y más
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de QR</h2>

          <div className={styles.tiposGrid}>
            {tiposQR.map((tipo) => (
              <button
                key={tipo.id}
                className={`${styles.tipoBtn} ${tipoQR === tipo.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setTipoQR(tipo.id as TipoQR)}
              >
                <span className={styles.tipoEmoji}>{tipo.emoji}</span>
                <span className={styles.tipoNombre}>{tipo.nombre}</span>
              </button>
            ))}
          </div>

          {/* Formularios según tipo */}
          <div className={styles.formulario}>
            {tipoQR === 'url' && (
              <div className={styles.formGroup}>
                <label>URL del sitio web</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com"
                  className={styles.input}
                />
              </div>
            )}

            {tipoQR === 'texto' && (
              <div className={styles.formGroup}>
                <label>Texto libre</label>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribe cualquier texto..."
                  className={styles.textarea}
                  rows={4}
                />
                <span className={styles.contador}>{texto.length} caracteres</span>
              </div>
            )}

            {tipoQR === 'telefono' && (
              <div className={styles.formGroup}>
                <label>Número de teléfono</label>
                <input
                  type="tel"
                  value={telefonoInput}
                  onChange={(e) => setTelefonoInput(e.target.value)}
                  placeholder="+34 600 123 456"
                  className={styles.input}
                />
              </div>
            )}

            {tipoQR === 'wifi' && (
              <>
                <div className={styles.formGroup}>
                  <label>Nombre de la red (SSID)</label>
                  <input
                    type="text"
                    value={configWifi.ssid}
                    onChange={(e) => setConfigWifi({ ...configWifi, ssid: e.target.value })}
                    placeholder="Mi WiFi"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Contraseña</label>
                  <input
                    type="text"
                    value={configWifi.password}
                    onChange={(e) => setConfigWifi({ ...configWifi, password: e.target.value })}
                    placeholder="contraseña123"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Seguridad</label>
                    <select
                      value={configWifi.seguridad}
                      onChange={(e) => setConfigWifi({ ...configWifi, seguridad: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                      className={styles.select}
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Sin contraseña</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={configWifi.oculta}
                        onChange={(e) => setConfigWifi({ ...configWifi, oculta: e.target.checked })}
                      />
                      Red oculta
                    </label>
                  </div>
                </div>
              </>
            )}

            {tipoQR === 'contacto' && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      value={configContacto.nombre}
                      onChange={(e) => setConfigContacto({ ...configContacto, nombre: e.target.value })}
                      placeholder="Juan García"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={configContacto.telefono}
                      onChange={(e) => setConfigContacto({ ...configContacto, telefono: e.target.value })}
                      placeholder="+34 600 123 456"
                      className={styles.input}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={configContacto.email}
                    onChange={(e) => setConfigContacto({ ...configContacto, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Empresa</label>
                    <input
                      type="text"
                      value={configContacto.empresa}
                      onChange={(e) => setConfigContacto({ ...configContacto, empresa: e.target.value })}
                      placeholder="Mi Empresa S.L."
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Cargo</label>
                    <input
                      type="text"
                      value={configContacto.cargo}
                      onChange={(e) => setConfigContacto({ ...configContacto, cargo: e.target.value })}
                      placeholder="Director"
                      className={styles.input}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={configContacto.direccion}
                    onChange={(e) => setConfigContacto({ ...configContacto, direccion: e.target.value })}
                    placeholder="Calle Mayor 1, Madrid"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Página web</label>
                  <input
                    type="url"
                    value={configContacto.web}
                    onChange={(e) => setConfigContacto({ ...configContacto, web: e.target.value })}
                    placeholder="https://ejemplo.com"
                    className={styles.input}
                  />
                </div>
              </>
            )}

            {tipoQR === 'email' && (
              <>
                <div className={styles.formGroup}>
                  <label>Destinatario</label>
                  <input
                    type="email"
                    value={configEmail.destinatario}
                    onChange={(e) => setConfigEmail({ ...configEmail, destinatario: e.target.value })}
                    placeholder="email@ejemplo.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Asunto</label>
                  <input
                    type="text"
                    value={configEmail.asunto}
                    onChange={(e) => setConfigEmail({ ...configEmail, asunto: e.target.value })}
                    placeholder="Asunto del email"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mensaje (opcional)</label>
                  <textarea
                    value={configEmail.cuerpo}
                    onChange={(e) => setConfigEmail({ ...configEmail, cuerpo: e.target.value })}
                    placeholder="Contenido del email..."
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          {/* Opciones de personalización */}
          <div className={styles.personalizacion}>
            <h3 className={styles.sectionTitleSmall}>Personalización</h3>

            <div className={styles.opcionesGrid}>
              <div className={styles.formGroup}>
                <label>Tamaño</label>
                <select
                  value={tamano}
                  onChange={(e) => setTamano(Number(e.target.value))}
                  className={styles.select}
                >
                  <option value={150}>Pequeño (150px)</option>
                  <option value={200}>Mediano (200px)</option>
                  <option value={300}>Grande (300px)</option>
                  <option value={400}>Extra grande (400px)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Color QR</label>
                <div className={styles.colorPicker}>
                  <input
                    type="color"
                    value={colorFrente}
                    onChange={(e) => setColorFrente(e.target.value)}
                    className={styles.inputColor}
                  />
                  <span>{colorFrente}</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Color fondo</label>
                <div className={styles.colorPicker}>
                  <input
                    type="color"
                    value={colorFondo}
                    onChange={(e) => setColorFondo(e.target.value)}
                    className={styles.inputColor}
                  />
                  <span>{colorFondo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de vista previa */}
        <div className={styles.previewPanel}>
          <h2 className={styles.sectionTitle}>Vista previa</h2>

          <div className={styles.qrContainer}>
            <canvas
              ref={canvasRef}
              className={styles.qrCanvas}
              style={{
                width: tamano,
                height: tamano,
                display: qrGenerado ? 'block' : 'none'
              }}
            />

            {!qrGenerado && (
              <div className={styles.placeholder} style={{ width: tamano, height: tamano }}>
                <span className={styles.placeholderIcon}>📱</span>
                <p>Introduce contenido para generar el código QR</p>
              </div>
            )}
          </div>

          {qrGenerado && (
            <div className={styles.acciones}>
              <button onClick={descargarQR} className={styles.btnPrimario}>
                📥 Descargar PNG
              </button>
              <button onClick={copiarQR} className={styles.btnSecundario}>
                {copiado ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          )}

          <div className={styles.infoCard}>
            <h4>💡 Consejos</h4>
            <ul>
              <li>El código QR se genera automáticamente al escribir</li>
              <li>Usa colores con buen contraste para mejor lectura</li>
              <li>Para WiFi, los invitados podrán conectarse al escanear</li>
              <li>Los contactos se guardan en formato vCard universal</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Panel informativo */}
      <div className={styles.infoPanel}>
        <h3>¿Cómo funciona?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔗</span>
            <div>
              <strong>URL</strong>
              <p>Comparte enlaces a sitios web, redes sociales o cualquier página</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📶</span>
            <div>
              <strong>WiFi</strong>
              <p>Genera QR para que tus invitados se conecten automáticamente</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>👤</span>
            <div>
              <strong>Contacto</strong>
              <p>Crea tarjetas de visita digitales en formato vCard</p>
            </div>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('generador-qr')} />

      <Footer appName="generador-qr" />
    </div>
  );
}
