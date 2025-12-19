'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './GeneradorQR.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps } from '@/components';
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
      qrCodeInstance.current = new QRCodeStyling(options);
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

  // Regenerar QR automáticamente
  useEffect(() => {
    if (tieneContenido()) {
      const timer = setTimeout(generarQR, 400);
      return () => clearTimeout(timer);
    } else {
      setQrGenerado(false);
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

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          {/* Tabs de navegación */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tabActiva === 'contenido' ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva('contenido')}
            >
              📝 Contenido
            </button>
            <button
              className={`${styles.tab} ${tabActiva === 'estilo' ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva('estilo')}
            >
              🎨 Estilo
            </button>
            <button
              className={`${styles.tab} ${tabActiva === 'logo' ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva('logo')}
            >
              🖼️ Logo
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
                      className={`${styles.estiloBtn} ${configEstilo.formaPuntos === estilo.id ? styles.estiloBtnActivo : ''}`}
                      onClick={() => setConfigEstilo({ ...configEstilo, formaPuntos: estilo.id })}
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
                      className={`${styles.estiloBtn} ${configEstilo.formaEsquinas === estilo.id ? styles.estiloBtnActivo : ''}`}
                      onClick={() => setConfigEstilo({ ...configEstilo, formaEsquinas: estilo.id })}
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
                    <span className={styles.uploadIcon}>📤</span>
                    <span>Seleccionar imagen</span>
                    <span className={styles.uploadHint}>PNG, JPG, SVG o WebP (máx. 2MB)</span>
                  </label>
                ) : (
                  <div className={styles.logoPreview}>
                    <img src={logoUrl} alt="Logo" className={styles.logoImg} />
                    <button onClick={eliminarLogo} className={styles.btnEliminarLogo}>
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
                  <button onClick={() => descargarQR('png')} className={styles.btnDescarga}>
                    📥 PNG
                  </button>
                  <button onClick={() => descargarQR('svg')} className={styles.btnDescarga}>
                    📐 SVG
                  </button>
                  <button onClick={() => descargarQR('jpeg')} className={styles.btnDescarga}>
                    🖼️ JPEG
                  </button>
                  <button onClick={() => descargarQR('pdf')} className={styles.btnDescarga}>
                    📄 PDF
                  </button>
                </div>
              </div>

              {/* Copiar */}
              <button onClick={copiarQR} className={styles.btnCopiar}>
                {copiado ? '✅ Copiado al portapapeles' : '📋 Copiar imagen'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo funcionan los códigos QR?"
        subtitle="Aprende sobre tipos, usos y mejores prácticas"
      >
        <section className={styles.guideSection}>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>🔗 QR para URLs</h4>
              <p>
                Perfecto para compartir enlaces a sitios web, redes sociales,
                landing pages o cualquier recurso online.
              </p>
            </div>
            <div className={styles.conceptCard}>
              <h4>📶 QR para WiFi</h4>
              <p>
                Tus invitados pueden conectarse a tu red WiFi simplemente
                escaneando el código, sin necesidad de escribir la contraseña.
              </p>
            </div>
            <div className={styles.conceptCard}>
              <h4>👤 QR para Contactos</h4>
              <p>
                Crea tarjetas de visita digitales en formato vCard que se
                guardan directamente en el teléfono del receptor.
              </p>
            </div>
            <div className={styles.conceptCard}>
              <h4>🎨 Personalización</h4>
              <p>
                Los QR con logo y colores personalizados refuerzan tu marca
                sin perder funcionalidad gracias a la corrección de errores.
              </p>
            </div>
          </div>

          <h3>Niveles de corrección de errores</h3>
          <div className={styles.tablaCorreccion}>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>L (7%)</span>
              <span>Menor redundancia. QR más pequeño pero sensible a daños.</span>
            </div>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>M (15%)</span>
              <span>Balance entre tamaño y resistencia. Uso general.</span>
            </div>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>Q (25%)</span>
              <span>Buena resistencia. Recomendado para impresión.</span>
            </div>
            <div className={styles.filaTabla}>
              <span className={styles.nivelBadge}>H (30%)</span>
              <span>Máxima redundancia. Obligatorio si usas logo.</span>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-qr')} />

      <Footer appName="generador-qr" />
    </div>
  );
}
