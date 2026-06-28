'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './GeneradorQR.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type TipoQR = 'texto' | 'url' | 'wifi' | 'contacto' | 'email' | 'telefono';
type TipoFormaPuntos = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
type TipoFormaEsquinas = 'square' | 'dot' | 'extra-rounded';
type NivelCorreccion = 'L' | 'M' | 'Q' | 'H';
type FormatoExportacion = 'png' | 'svg' | 'jpeg' | 'webp' | 'pdf';

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

interface ConfigEstilo {
  formaPuntos: TipoFormaPuntos;
  formaEsquinas: TipoFormaEsquinas;
  colorPuntos: string;
  colorFondo: string;
  colorEsquinas: string;
  usarGradiente: boolean;
  colorGradiente1: string;
  colorGradiente2: string;
}

// Componente principal
export default function GeneradorQRPage() {
  // Estados del contenido
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

  // Estados de configuración
  const [tamano, setTamano] = useState(300);
  const [nivelCorreccion, setNivelCorreccion] = useState<NivelCorreccion>('H');
  const [configEstilo, setConfigEstilo] = useState<ConfigEstilo>({
    formaPuntos: 'rounded',
    formaEsquinas: 'extra-rounded',
    colorPuntos: '#2E86AB',
    colorFondo: '#FFFFFF',
    colorEsquinas: '#2E86AB',
    usarGradiente: false,
    colorGradiente1: '#2E86AB',
    colorGradiente2: '#48A9A6',
  });

  // Estados del logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [tamanoLogo, setTamanoLogo] = useState(0.3);
  const [margenLogo, setMargenLogo] = useState(5);

  // Estados de UI
  const [qrGenerado, setQrGenerado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [tabActiva, setTabActiva] = useState<'contenido' | 'estilo' | 'logo'>('contenido');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  // Referencias
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<InstanceType<typeof import('qr-code-styling').default> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generar el contenido del QR según el tipo
  const generarContenidoQR = useCallback((): string => {
    switch (tipoQR) {
      case 'texto':
        return texto;
      case 'url':
        return urlInput;
      case 'telefono':
        return `tel:${telefonoInput}`;
      case 'wifi':
        const { ssid, password, seguridad, oculta } = configWifi;
        return `WIFI:T:${seguridad};S:${ssid};P:${password};H:${oculta};;`;
      case 'contacto':
        const c = configContacto;
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (c.nombre) vcard += `FN:${c.nombre}\n`;
        if (c.telefono) vcard += `TEL:${c.telefono}\n`;
        if (c.email) vcard += `EMAIL:${c.email}\n`;
        if (c.empresa) vcard += `ORG:${c.empresa}\n`;
        if (c.cargo) vcard += `TITLE:${c.cargo}\n`;
        if (c.direccion) vcard += `ADR:;;${c.direccion};;;;\n`;
        if (c.web) vcard += `URL:${c.web}\n`;
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
  }, [tipoQR, texto, urlInput, telefonoInput, configWifi, configContacto, configEmail]);

  // Verificar si hay contenido válido
  const tieneContenido = useCallback((): boolean => {
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
  }, [tipoQR, texto, urlInput, telefonoInput, configWifi, configContacto, configEmail]);

  // Generar QR con qr-code-styling
  const generarQR = useCallback(async () => {
    if (!tieneContenido() || !qrRef.current) return;

    setCargando(true);

    try {
      // Importar dinámicamente para evitar SSR
      const QRCodeStyling = (await import('qr-code-styling')).default;

      const contenido = generarContenidoQR();

      // Configurar opciones de color
      let dotsColor: string | { type: string; colorStops: { offset: number; color: string }[] } = configEstilo.colorPuntos;

      if (configEstilo.usarGradiente) {
        dotsColor = {
          type: 'linear',
          colorStops: [
            { offset: 0, color: configEstilo.colorGradiente1 },
            { offset: 1, color: configEstilo.colorGradiente2 },
          ],
        };
      }

      const options = {
        width: tamano,
        height: tamano,
        type: 'canvas' as const,
        data: contenido,
        image: logoUrl || undefined,
        dotsOptions: {
          color: typeof dotsColor === 'string' ? dotsColor : undefined,
          gradient: typeof dotsColor !== 'string' ? dotsColor : undefined,
          type: configEstilo.formaPuntos,
        },
        cornersSquareOptions: {
          color: configEstilo.colorEsquinas,
          type: configEstilo.formaEsquinas,
        },
        cornersDotOptions: {
          color: configEstilo.colorEsquinas,
          type: configEstilo.formaEsquinas === 'dot' ? 'dot' : 'square' as 'dot' | 'square',
        },
        backgroundOptions: {
          color: configEstilo.colorFondo,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: margenLogo,
          imageSize: tamanoLogo,
          hideBackgroundDots: true,
        },
        qrOptions: {
          errorCorrectionLevel: nivelCorreccion,
        },
      };

      // Limpiar QR anterior
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }

      // Crear nueva instancia
      qrCodeInstance.current = new QRCodeStyling(options as never);
      qrCodeInstance.current.append(qrRef.current);

      setQrGenerado(true);
    } catch (error) {
      console.error('Error al generar QR:', error);
      setQrGenerado(false);
    } finally {
      setCargando(false);
    }
  }, [tieneContenido, generarContenidoQR, tamano, nivelCorreccion, configEstilo, logoUrl, tamanoLogo, margenLogo]);

  // Manejar subida de logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El logo debe ser menor a 2MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar logo
  const eliminarLogo = () => {
    setLogoUrl(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Descargar QR
  const descargarQR = async (formato: FormatoExportacion) => {
    if (!qrCodeInstance.current || !qrGenerado) return;

    try {
      if (formato === 'pdf') {
        // Generar PDF con jsPDF
        const { jsPDF } = await import('jspdf');
        const canvas = qrRef.current?.querySelector('canvas');
        if (!canvas) return;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Centrar QR en la página
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const qrSize = 100; // mm
        const x = (pdfWidth - qrSize) / 2;
        const y = 50;

        pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
        pdf.setFontSize(12);
        pdf.text('Generado con meskeIA', pdfWidth / 2, y + qrSize + 15, { align: 'center' });
        pdf.save(`qr-meskeia-${Date.now()}.pdf`);
      } else {
        // Usar método nativo de qr-code-styling
        await qrCodeInstance.current.download({
          name: `qr-meskeia-${Date.now()}`,
          extension: formato,
        });
      }
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el QR');
    }
  };

  // Copiar QR al portapapeles
  const copiarQR = async () => {
    if (!qrRef.current || !qrGenerado) return;

    try {
      const canvas = qrRef.current.querySelector('canvas');
      if (!canvas) return;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert('Tu navegador no soporta copiar imágenes al portapapeles');
    }
  };

  // Generar código HTML de implementación
  const generarCodigoHTML = () => {
    let codigo = '<!-- Código QR generado con meskeIA -->\n';

    switch (tipoQR) {
      case 'url':
        codigo += '<!-- Añade este código donde quieras mostrar el QR -->\n';
        codigo += '<div class="qr-container">\n';
        codigo += '  <img src="/path/to/qr-code.png" alt="Escanea para visitar nuestro sitio" width="300" height="300" />\n';
        codigo += '  <p>Escanea para visitar nuestro sitio</p>\n';
        codigo += '</div>\n\n';
        codigo += '<!-- También puedes añadir un enlace directo -->\n';
        codigo += '<a href="' + urlInput + '" target="_blank">Visitar sitio web</a>';
        break;
      case 'wifi':
        codigo += '<!-- Imprime este QR y colócalo cerca del router -->\n';
        codigo += '<div class="qr-wifi">\n';
        codigo += '  <h3>WiFi gratuito</h3>\n';
        codigo += '  <img src="/path/to/qr-wifi.png" alt="Escanea para conectarte a WiFi" width="300" height="300" />\n';
        codigo += '  <p>Escanea con tu cámara para conectarte automáticamente</p>\n';
        codigo += '  <p class="red-info">Red: ' + configWifi.ssid + '</p>\n';
        codigo += '</div>';
        break;
      case 'contacto':
        codigo += '<!-- Tarjeta de visita digital -->\n';
        codigo += '<div class="qr-vcard">\n';
        codigo += '  <div class="info-contacto">\n';
        codigo += '    <h3>' + configContacto.nombre + '</h3>\n';
        if (configContacto.cargo) codigo += '    <p>' + configContacto.cargo + '</p>\n';
        if (configContacto.empresa) codigo += '    <p>' + configContacto.empresa + '</p>\n';
        codigo += '  </div>\n';
        codigo += '  <img src="/path/to/qr-contacto.png" alt="Escanea para guardar contacto" width="200" height="200" />\n';
        codigo += '  <p class="cta">Escanea para guardar mi contacto</p>\n';
        codigo += '</div>';
        break;
      case 'email':
        codigo += '<!-- Formulario de contacto rápido -->\n';
        codigo += '<div class="qr-email">\n';
        codigo += '  <h3>Contáctanos</h3>\n';
        codigo += '  <img src="/path/to/qr-email.png" alt="Escanea para enviar email" width="250" height="250" />\n';
        codigo += '  <p>Escanea para enviarnos un email directamente</p>\n';
        codigo += '</div>';
        break;
      case 'telefono':
        codigo += '<!-- Botón de llamada rápida -->\n';
        codigo += '<div class="qr-telefono">\n';
        codigo += '  <img src="/path/to/qr-telefono.png" alt="Escanea para llamar" width="200" height="200" />\n';
        codigo += '  <p>Escanea para llamar</p>\n';
        codigo += '  <a href="tel:' + telefonoInput + '" class="boton-llamar">O haz clic aquí</a>\n';
        codigo += '</div>';
        break;
      case 'texto':
        codigo += '<!-- QR con texto personalizado -->\n';
        codigo += '<div class="qr-texto">\n';
        codigo += '  <img src="/path/to/qr-texto.png" alt="Código QR" width="300" height="300" />\n';
        codigo += '  <p>Escanea para ver el contenido</p>\n';
        codigo += '</div>';
        break;
    }

    setHtmlCode(codigo);
  };

  // Copiar código HTML al portapapeles
  const copiarCodigoHTML = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Regenerar QR automáticamente
  useEffect(() => {
    if (tieneContenido()) {
      const timer = setTimeout(() => {
        generarQR();
        generarCodigoHTML();
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setQrGenerado(false);
      setHtmlCode('');
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    }
  }, [tieneContenido, generarQR]);

  // Tipos de QR disponibles
  const tiposQR = [
    { id: 'url', nombre: 'URL', emoji: '🔗' },
    { id: 'texto', nombre: 'Texto', emoji: '📝' },
    { id: 'wifi', nombre: 'WiFi', emoji: '📶' },
    { id: 'contacto', nombre: 'Contacto', emoji: '👤' },
    { id: 'email', nombre: 'Email', emoji: '📧' },
    { id: 'telefono', nombre: 'Teléfono', emoji: '📞' },
  ];

  // Estilos de puntos disponibles
  const estilosPuntos: { id: TipoFormaPuntos; nombre: string }[] = [
    { id: 'square', nombre: 'Cuadrado' },
    { id: 'dots', nombre: 'Puntos' },
    { id: 'rounded', nombre: 'Redondeado' },
    { id: 'extra-rounded', nombre: 'Muy redondeado' },
    { id: 'classy', nombre: 'Elegante' },
    { id: 'classy-rounded', nombre: 'Elegante redondo' },
  ];

  // Estilos de esquinas disponibles
  const estilosEsquinas: { id: TipoFormaEsquinas; nombre: string }[] = [
    { id: 'square', nombre: 'Cuadrado' },
    { id: 'dot', nombre: 'Punto' },
    { id: 'extra-rounded', nombre: 'Redondeado' },
  ];

  // Niveles de corrección de errores
  const nivelesCorreccion: { id: NivelCorreccion; nombre: string; descripcion: string }[] = [
    { id: 'L', nombre: 'Bajo (7%)', descripcion: 'Menor redundancia, QR más pequeño' },
    { id: 'M', nombre: 'Medio (15%)', descripcion: 'Balance entre tamaño y resistencia' },
    { id: 'Q', nombre: 'Alto (25%)', descripcion: 'Buena resistencia a daños' },
    { id: 'H', nombre: 'Máximo (30%)', descripcion: 'Ideal para logos, máxima resistencia' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Códigos QR Avanzado</h1>
        <p className={styles.subtitle}>
          Crea códigos QR personalizados con logos, estilos únicos y múltiples formatos de exportación
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="generador-qr-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          {/* Tabs de navegación */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${tabActiva === 'contenido' ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva('contenido')}
              aria-pressed={tabActiva === 'contenido'}
            >
              <span aria-hidden="true">📝</span> Contenido
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tabActiva === 'estilo' ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva('estilo')}
              aria-pressed={tabActiva === 'estilo'}
            >
              <span aria-hidden="true">🎨</span> Estilo
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tabActiva === 'logo' ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva('logo')}
              aria-pressed={tabActiva === 'logo'}
            >
              <span aria-hidden="true">🖼️</span> Logo
            </button>
          </div>

          {/* Tab: Contenido */}
          {tabActiva === 'contenido' && (
            <>
              <h2 className={styles.sectionTitle}>Tipo de QR</h2>
              <div className={styles.tiposGrid}>
                {tiposQR.map((tipo) => (
                  <button
                    key={tipo.id}
                    type="button"
                    className={`${styles.tipoBtn} ${tipoQR === tipo.id ? styles.tipoBtnActivo : ''}`}
                    onClick={() => setTipoQR(tipo.id as TipoQR)}
                    aria-pressed={tipoQR === tipo.id}
                  >
                    <span className={styles.tipoEmoji} aria-hidden="true">{tipo.emoji}</span>
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
            </>
          )}

          {/* Tab: Estilo */}
          {tabActiva === 'estilo' && (
            <>
              <h2 className={styles.sectionTitle}>Personalización del Estilo</h2>

              {/* Tamaño */}
              <div className={styles.formGroup}>
                <label>Tamaño del QR</label>
                <select
                  value={tamano}
                  onChange={(e) => setTamano(Number(e.target.value))}
                  className={styles.select}
                >
                  <option value={200}>Pequeño (200px)</option>
                  <option value={300}>Mediano (300px)</option>
                  <option value={400}>Grande (400px)</option>
                  <option value={500}>Extra grande (500px)</option>
                </select>
              </div>

              {/* Nivel de corrección */}
              <div className={styles.formGroup}>
                <label>Nivel de corrección de errores</label>
                <select
                  value={nivelCorreccion}
                  onChange={(e) => setNivelCorreccion(e.target.value as NivelCorreccion)}
                  className={styles.select}
                >
                  {nivelesCorreccion.map((nivel) => (
                    <option key={nivel.id} value={nivel.id}>
                      {nivel.nombre} - {nivel.descripcion}
                    </option>
                  ))}
                </select>
                <span className={styles.helperText}>
                  Usa &quot;Máximo&quot; si añades un logo al QR
                </span>
              </div>

              {/* Forma de los puntos */}
              <div className={styles.formGroup}>
                <label>Forma de los puntos</label>
                <div className={styles.estilosGrid}>
                  {estilosPuntos.map((estilo) => (
                    <button
                      key={estilo.id}
                      type="button"
                      className={`${styles.estiloBtn} ${configEstilo.formaPuntos === estilo.id ? styles.estiloBtnActivo : ''}`}
                      onClick={() => setConfigEstilo({ ...configEstilo, formaPuntos: estilo.id })}
                      aria-pressed={configEstilo.formaPuntos === estilo.id}
                    >
                      {estilo.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forma de las esquinas */}
              <div className={styles.formGroup}>
                <label>Forma de las esquinas</label>
                <div className={styles.estilosGrid}>
                  {estilosEsquinas.map((estilo) => (
                    <button
                      key={estilo.id}
                      type="button"
                      className={`${styles.estiloBtn} ${configEstilo.formaEsquinas === estilo.id ? styles.estiloBtnActivo : ''}`}
                      onClick={() => setConfigEstilo({ ...configEstilo, formaEsquinas: estilo.id })}
                      aria-pressed={configEstilo.formaEsquinas === estilo.id}
                    >
                      {estilo.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colores */}
              <div className={styles.coloresSection}>
                <h3 className={styles.sectionTitleSmall}>Colores</h3>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={configEstilo.usarGradiente}
                      onChange={(e) => setConfigEstilo({ ...configEstilo, usarGradiente: e.target.checked })}
                    />
                    Usar degradado
                  </label>
                </div>

                {configEstilo.usarGradiente ? (
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Color inicial</label>
                      <div className={styles.colorPicker}>
                        <input
                          type="color"
                          value={configEstilo.colorGradiente1}
                          onChange={(e) => setConfigEstilo({ ...configEstilo, colorGradiente1: e.target.value })}
                          className={styles.inputColor}
                        />
                        <span>{configEstilo.colorGradiente1}</span>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Color final</label>
                      <div className={styles.colorPicker}>
                        <input
                          type="color"
                          value={configEstilo.colorGradiente2}
                          onChange={(e) => setConfigEstilo({ ...configEstilo, colorGradiente2: e.target.value })}
                          className={styles.inputColor}
                        />
                        <span>{configEstilo.colorGradiente2}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label>Color de los puntos</label>
                    <div className={styles.colorPicker}>
                      <input
                        type="color"
                        value={configEstilo.colorPuntos}
                        onChange={(e) => setConfigEstilo({ ...configEstilo, colorPuntos: e.target.value })}
                        className={styles.inputColor}
                      />
                      <span>{configEstilo.colorPuntos}</span>
                    </div>
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Color de fondo</label>
                    <div className={styles.colorPicker}>
                      <input
                        type="color"
                        value={configEstilo.colorFondo}
                        onChange={(e) => setConfigEstilo({ ...configEstilo, colorFondo: e.target.value })}
                        className={styles.inputColor}
                      />
                      <span>{configEstilo.colorFondo}</span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Color de esquinas</label>
                    <div className={styles.colorPicker}>
                      <input
                        type="color"
                        value={configEstilo.colorEsquinas}
                        onChange={(e) => setConfigEstilo({ ...configEstilo, colorEsquinas: e.target.value })}
                        className={styles.inputColor}
                      />
                      <span>{configEstilo.colorEsquinas}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab: Logo */}
          {tabActiva === 'logo' && (
            <>
              <h2 className={styles.sectionTitle}>Logo Personalizado</h2>

              <div className={styles.logoUploadSection}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className={styles.fileInput}
                  id="logoInput"
                />

                {!logoUrl ? (
                  <label htmlFor="logoInput" className={styles.uploadLabel}>
                    <span className={styles.uploadIcon} aria-hidden="true">📤</span>
                    <span>Seleccionar imagen</span>
                    <span className={styles.uploadHint}>PNG, JPG, SVG o WebP (máx. 2MB)</span>
                  </label>
                ) : (
                  <div className={styles.logoPreview}>
                    <img src={logoUrl} alt="Logo" className={styles.logoImg} />
                    <button type="button" onClick={eliminarLogo} className={styles.btnEliminarLogo}>
                      ✕ Eliminar
                    </button>
                  </div>
                )}
              </div>

              {logoUrl && (
                <>
                  <div className={styles.formGroup}>
                    <label>Tamaño del logo: {Math.round(tamanoLogo * 100)}%</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.5"
                      step="0.05"
                      value={tamanoLogo}
                      onChange={(e) => setTamanoLogo(Number(e.target.value))}
                      className={styles.rangeInput}
                    />
                    <span className={styles.helperText}>
                      Recomendado: 20-40% para mejor legibilidad
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Margen del logo: {margenLogo}px</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={margenLogo}
                      onChange={(e) => setMargenLogo(Number(e.target.value))}
                      className={styles.rangeInput}
                    />
                  </div>
                </>
              )}

              <div className={styles.infoCard}>
                <h4>💡 Consejos para logos</h4>
                <ul>
                  <li>Usa imágenes con <strong>fondo transparente</strong> (PNG)</li>
                  <li>Los logos cuadrados funcionan mejor</li>
                  <li>Mantén el tamaño entre 20-40% para buena legibilidad</li>
                  <li>El nivel de corrección &quot;Máximo&quot; se activa automáticamente</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Panel de vista previa */}
        <div className={styles.previewPanel}>
          <h2 className={styles.sectionTitle}>Vista previa</h2>

          <div className={styles.qrContainer}>
            {cargando && (
              <div className={styles.loader}>
                <span>Generando...</span>
              </div>
            )}

            <div
              ref={qrRef}
              className={styles.qrCanvas}
              style={{
                width: tamano,
                height: tamano,
                display: qrGenerado ? 'flex' : 'none',
              }}
            />

            {!qrGenerado && !cargando && (
              <div className={styles.placeholder} style={{ width: Math.min(tamano, 300), height: Math.min(tamano, 300) }}>
                <span className={styles.placeholderIcon}>📱</span>
                <p>Introduce contenido para generar el código QR</p>
              </div>
            )}
          </div>

          {qrGenerado && (
            <>
              {/* Botones de descarga */}
              <div className={styles.descargaSection}>
                <h3 className={styles.sectionTitleSmall}>Descargar como</h3>
                <div className={styles.botonesDescarga}>
                  <button type="button" onClick={() => descargarQR('png')} className={styles.btnDescarga}>
                    <span aria-hidden="true">📥</span> PNG
                  </button>
                  <button type="button" onClick={() => descargarQR('svg')} className={styles.btnDescarga}>
                    <span aria-hidden="true">📐</span> SVG
                  </button>
                  <button type="button" onClick={() => descargarQR('jpeg')} className={styles.btnDescarga}>
                    <span aria-hidden="true">🖼️</span> JPEG
                  </button>
                  <button type="button" onClick={() => descargarQR('pdf')} className={styles.btnDescarga}>
                    <span aria-hidden="true">📄</span> PDF
                  </button>
                </div>
              </div>

              {/* Copiar */}
              <button type="button" onClick={copiarQR} className={styles.btnCopiar}>
                <span aria-hidden="true">{copiado ? '✅' : '📋'}</span> {copiado ? 'Copiado al portapapeles' : 'Copiar imagen'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Código HTML de implementación - Colapsable */}
      {qrGenerado && htmlCode && (
        <div className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2>💻 Código de implementación</h2>
              <p className={styles.htmlSubtitle}>
                Copia este código HTML para usar tu QR en tu sitio web o aplicación
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHtmlExpanded(!htmlExpanded)}
              className={styles.btnToggleCode}
              aria-label={htmlExpanded ? 'Ocultar código' : 'Mostrar código'}
              aria-pressed={htmlExpanded}
            >
              {htmlExpanded ? '▼ Ocultar código' : '▶ Ver código HTML'}
            </button>
          </div>

          {htmlExpanded && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>
                <code>{htmlCode}</code>
              </pre>
              <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyCode}>
                <span aria-hidden="true">{copiado ? '✅' : '📋'}</span> {copiado ? 'Copiado' : 'Copiar código'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía completa de códigos QR"
        subtitle="Aprende sobre tipos, mejores prácticas, implementación y preguntas frecuentes"
      >
        {/* Tabla de casos de uso */}
        <div className={styles.useCasesSection}>
          <h2>📋 Casos de uso y compatibilidad</h2>
        <p className={styles.useCasesSubtitle}>
          Descubre cómo aprovechar cada tipo de código QR
        </p>

        <div className={styles.useCasesTable}>
          <div className={styles.useCaseRow}>
            <div className={styles.useCaseIcon}>🔗</div>
            <div className={styles.useCaseContent}>
              <h3>QR para URLs</h3>
              <p><strong>Ideal para:</strong> Landing pages, menús digitales, promociones, enlaces a redes sociales</p>
              <p><strong>Compatibilidad:</strong> Todos los smartphones y aplicaciones de cámara nativas (iOS 11+, Android 8+)</p>
              <p><strong>Consejo:</strong> Usa URLs cortas para QR más simples y legibles</p>
            </div>
          </div>

          <div className={styles.useCaseRow}>
            <div className={styles.useCaseIcon}>📶</div>
            <div className={styles.useCaseContent}>
              <h3>QR para WiFi</h3>
              <p><strong>Ideal para:</strong> Cafeterías, hoteles, oficinas, eventos, espacios coworking</p>
              <p><strong>Compatibilidad:</strong> iOS 11+, Android 10+ (cámara nativa), apps como WiFi QR Connect</p>
              <p><strong>Consejo:</strong> Imprime en A4 y plastifica para mayor durabilidad</p>
            </div>
          </div>

          <div className={styles.useCaseRow}>
            <div className={styles.useCaseIcon}>👤</div>
            <div className={styles.useCaseContent}>
              <h3>QR para Contactos (vCard)</h3>
              <p><strong>Ideal para:</strong> Tarjetas de visita, networking, ferias, presentaciones</p>
              <p><strong>Compatibilidad:</strong> Todos los smartphones, se guarda automáticamente en la agenda</p>
              <p><strong>Consejo:</strong> Incluye solo información relevante para mantener el QR simple</p>
            </div>
          </div>

          <div className={styles.useCaseRow}>
            <div className={styles.useCaseIcon}>📧</div>
            <div className={styles.useCaseContent}>
              <h3>QR para Email</h3>
              <p><strong>Ideal para:</strong> Formularios de contacto, soporte técnico, feedback, eventos</p>
              <p><strong>Compatibilidad:</strong> Todos los smartphones, abre la app de email del usuario</p>
              <p><strong>Consejo:</strong> Prepara asunto y cuerpo para facilitar el envío al usuario</p>
            </div>
          </div>

          <div className={styles.useCaseRow}>
            <div className={styles.useCaseIcon}>📞</div>
            <div className={styles.useCaseContent}>
              <h3>QR para Teléfono</h3>
              <p><strong>Ideal para:</strong> Atención al cliente, servicios urgentes, taxis, delivery</p>
              <p><strong>Compatibilidad:</strong> Todos los smartphones, marca automáticamente el número</p>
              <p><strong>Consejo:</strong> Incluye el prefijo internacional (+34) para llamadas globales</p>
            </div>
          </div>

          <div className={styles.useCaseRow}>
            <div className={styles.useCaseIcon}>📝</div>
            <div className={styles.useCaseContent}>
              <h3>QR para Texto</h3>
              <p><strong>Ideal para:</strong> Códigos promocionales, instrucciones, mensajes secretos, juegos</p>
              <p><strong>Compatibilidad:</strong> Todos los smartphones y lectores QR</p>
              <p><strong>Consejo:</strong> Máximo 300 caracteres para QR de tamaño razonable</p>
            </div>
          </div>
        </div>
        </div>

        <section className={styles.guideSection}>
          {/* Conceptos clave */}
          <h2>Conceptos clave</h2>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>🔗 QR para URLs</h4>
              <p>
                Perfecto para compartir enlaces a sitios web, redes sociales,
                landing pages o cualquier recurso online. Los usuarios acceden
                instantáneamente sin escribir URLs largas.
              </p>
            </div>
            <div className={styles.conceptCard}>
              <h4>📶 QR para WiFi</h4>
              <p>
                Tus invitados pueden conectarse a tu red WiFi simplemente
                escaneando el código, sin necesidad de escribir la contraseña.
                Ideal para negocios, hoteles y espacios públicos.
              </p>
            </div>
            <div className={styles.conceptCard}>
              <h4>👤 QR para Contactos</h4>
              <p>
                Crea tarjetas de visita digitales en formato vCard que se
                guardan directamente en el teléfono del receptor. Incluye
                nombre, teléfono, email, empresa y más.
              </p>
            </div>
            <div className={styles.conceptCard}>
              <h4>🎨 Personalización</h4>
              <p>
                Los QR con logo y colores personalizados refuerzan tu marca
                sin perder funcionalidad gracias a la corrección de errores.
                Destaca con diseños únicos.
              </p>
            </div>
          </div>

          {/* Niveles de corrección */}
          <h2>Niveles de corrección de errores</h2>
          <p className={styles.introParagraph}>
            Los códigos QR incluyen redundancia para poder leerse incluso si están parcialmente dañados.
            Mayor nivel = más resistencia pero QR más complejo.
          </p>
          <div className={styles.tablaCorreccion}>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>L (7%)</span>
              <span>Menor redundancia. QR más pequeño pero sensible a daños. Uso: URLs cortas en entornos limpios.</span>
            </div>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>M (15%)</span>
              <span>Balance entre tamaño y resistencia. Uso general para la mayoría de casos.</span>
            </div>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>Q (25%)</span>
              <span>Buena resistencia. Recomendado para impresión y uso en exteriores.</span>
            </div>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>H (30%)</span>
              <span>Máxima redundancia. Obligatorio si usas logo o en ambientes con desgaste.</span>
            </div>
          </div>

          {/* Guía paso a paso */}
          <h2>Cómo crear e implementar tu código QR (paso a paso)</h2>
          <div className={styles.stepGuide}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Selecciona el tipo de QR</h3>
                <p>
                  Elige entre URL, WiFi, Contacto, Email, Teléfono o Texto según tu objetivo.
                  Para negocios, los más usados son URL (web) y WiFi (conectividad).
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Introduce el contenido</h3>
                <p>
                  Completa los campos requeridos: URL completa (con https://), datos de red WiFi,
                  información de contacto, etc. Verifica que todo esté correcto antes de continuar.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Personaliza el diseño</h3>
                <p>
                  Accede a la pestaña &quot;Estilo&quot; y configura colores, forma de puntos y esquinas.
                  Si tu marca tiene colores corporativos, úsalos aquí para reforzar identidad visual.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Añade logo (opcional)</h3>
                <p>
                  En la pestaña &quot;Logo&quot;, sube tu logotipo (PNG con fondo transparente recomendado).
                  Ajusta tamaño entre 20-40% y asegúrate de usar nivel de corrección &quot;Máximo&quot;.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Descarga en el formato adecuado</h3>
                <p>
                  <strong>PNG/JPEG:</strong> Para impresión y uso en redes sociales.<br />
                  <strong>SVG:</strong> Para escalado sin pérdida de calidad (diseño gráfico).<br />
                  <strong>PDF:</strong> Para incluir en documentos o imprimir directamente.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Implementa y prueba</h3>
                <p>
                  Usa el código HTML generado para tu sitio web, o imprime el QR en tamaño mínimo de 3x3cm.
                  Prueba siempre el QR con varios dispositivos antes de la publicación final.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ ampliado */}
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué tamaño debe tener mi código QR para imprimirlo?</h3>
            <p>
              El tamaño mínimo recomendado es <strong>3x3 cm</strong> para garantizar legibilidad en smartphones.
              Para distancias mayores, usa la regla: 1cm de QR por cada 10cm de distancia de escaneo.
              Por ejemplo, si el QR estará a 2 metros, imprime al menos 20x20cm.
            </p>
            <p className={styles.faqExample}>
              <strong>Ejemplos prácticos:</strong><br />
              • Tarjeta de visita: 2x2 cm (mínimo)<br />
              • Folleto A4: 5x5 cm<br />
              • Cartel A3: 10x10 cm<br />
              • Valla publicitaria: 50x50 cm o más
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Los códigos QR personalizados (con logo) funcionan igual que los estándar?</h3>
            <p>
              Sí, siempre que uses el <strong>nivel de corrección &quot;Máximo&quot; (H - 30%)</strong>.
              Este nivel permite que hasta el 30% del QR esté cubierto u dañado y siga siendo legible.
              El logo debe ocupar entre 20-40% del área total para mantener funcionalidad.
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Consejo:</strong> Usa logos con fondo transparente (PNG) y formas simples.
              Los logos muy detallados pueden dificultar el escaneo si son muy grandes.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Puedo editar el contenido de un QR después de imprimirlo?</h3>
            <p>
              No directamente. Los QR estáticos (como los de esta herramienta) codifican el contenido permanentemente.
              <strong>Solución:</strong> Para QR que puedan cambiar, codifica una URL corta que redirija
              al contenido real. Así puedes actualizar el destino sin cambiar el QR físico.
            </p>
            <p className={styles.faqExample}>
              <strong>Ejemplo:</strong> En lugar de codificar &quot;https://misitioweb.com/promo-navidad-2024&quot;,
              usa &quot;https://misitioweb.com/p/1&quot; y actualiza el servidor para que /p/1 redirija
              a la página actual que necesites.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué diferencia hay entre los formatos PNG, SVG y PDF?</h3>
            <p>
              <strong>PNG/JPEG:</strong> Imágenes de píxeles. Ideales para redes sociales, web y impresión en tamaños fijos.
              Si amplías mucho, pueden pixelarse.<br />
              <strong>SVG:</strong> Gráfico vectorial. Escalable sin pérdida de calidad. Perfecto para diseño gráfico
              profesional, logos, carteles grandes.<br />
              <strong>PDF:</strong> Documento imprimible. Incluye el QR centrado en A4. Ideal para enviar a imprenta
              o compartir con terceros.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Los códigos QR para WiFi funcionan en todos los dispositivos?</h3>
            <p>
              La mayoría sí, pero depende del sistema operativo:<br />
              <strong>iOS 11+:</strong> Soporta WiFi QR de forma nativa con la cámara.<br />
              <strong>Android 10+:</strong> Funciona con cámara nativa en la mayoría de fabricantes.<br />
              <strong>Android 9 o inferior:</strong> Puede requerir apps de terceros como &quot;WiFi QR Code Scanner&quot;.
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Recomendación:</strong> Incluye también las credenciales WiFi en texto pequeño
              debajo del QR para usuarios con dispositivos antiguos.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Cuántos caracteres puedo incluir en un código QR de texto?</h3>
            <p>
              Técnicamente, hasta <strong>4.296 caracteres alfanuméricos</strong>, pero no es práctico.
              A más contenido, el QR se vuelve más complejo y difícil de escanear.
              <strong>Recomendación:</strong> Máximo 300 caracteres para mantener legibilidad.
            </p>
            <p className={styles.faqExample}>
              <strong>Uso práctico:</strong><br />
              • Códigos promocionales: 10-20 caracteres ✅<br />
              • Instrucciones breves: 100-150 caracteres ✅<br />
              • Texto largo / manual: Usa URL a documento completo ⚠️
            </p>
          </div>

          {/* Mejores prácticas */}
          <h2>Mejores prácticas y consejos profesionales</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Contraste alto</h4>
              <p>Usa colores oscuros sobre fondo claro (o viceversa). El contraste mínimo debe ser 40:1 para garantizar legibilidad.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Margen blanco</h4>
              <p>Deja al menos 4 módulos (cuadrados del QR) de margen blanco alrededor. Esto mejora el reconocimiento de la cámara.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Superficie plana</h4>
              <p>Evita imprimir QR en superficies curvas o rugosas. Si es inevitable, aumenta el tamaño del QR al menos 30%.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Prueba antes</h4>
              <p>Siempre prueba el QR con múltiples dispositivos (iOS, Android) y en diferentes condiciones de luz antes de producción masiva.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>CTA claro</h4>
              <p>Incluye texto como &quot;Escanea para...&quot; junto al QR. Los usuarios necesitan saber qué esperar al escanear.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>URLs cortas</h4>
              <p>Usa acortadores (bit.ly, QR.io) para URLs largas. Un QR simple es más rápido de escanear y funciona desde mayor distancia.</p>
            </div>
          </div>

          {/* Advertencias */}
          <div className={styles.warningBox}>
            <h3>⚠️ Errores comunes que debes evitar</h3>
            <ul>
              <li><strong>QR demasiado pequeño:</strong> Mínimo 3x3cm. En carteles grandes, escala proporcionalmente.</li>
              <li><strong>Colores de bajo contraste:</strong> Evita amarillo sobre blanco, gris claro sobre blanco, etc.</li>
              <li><strong>URLs con HTTP en lugar de HTTPS:</strong> Los navegadores modernos advierten de seguridad.</li>
              <li><strong>No probar antes de imprimir:</strong> Errores en el contenido pueden inutilizar miles de copias.</li>
              <li><strong>Imprimir en superficies reflectantes:</strong> El brillo impide el escaneo. Usa acabados mates.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-qr')} />

      <ShareCard appName="generador-qr" />
      <Footer appName="generador-qr" />
    </div>
  );
}
