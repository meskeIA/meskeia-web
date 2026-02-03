'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './GeneradorOGImages.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Constantes del canvas OG estándar
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

// Tipos
type TemplateType = 'blank' | 'article' | 'product' | 'event' | 'announcement' | 'quote' | 'tutorial' | 'podcast';
type BackgroundType = 'color' | 'gradient' | 'image';

interface OGDesign {
  background: {
    type: BackgroundType;
    color: string;
    gradientName: string;
    imageUrl: string;
    overlay: boolean;
    overlayOpacity: number;
  };
  title: {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    y: number;
    shadow: boolean;
  };
  subtitle: {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    visible: boolean;
  };
  branding: {
    text: string;
    fontSize: number;
    color: string;
    position: 'bottom-left' | 'bottom-right' | 'bottom-center';
    visible: boolean;
  };
  badge: {
    text: string;
    bgColor: string;
    textColor: string;
    visible: boolean;
  };
  icon: {
    emoji: string;
    size: number;
    visible: boolean;
  };
  logo: {
    imageUrl: string;
    size: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    visible: boolean;
  };
}

// Gradientes predefinidos
const GRADIENTS: { name: string; colors: string[]; css: string }[] = [
  { name: 'meskeIA', colors: ['#2E86AB', '#48A9A6'], css: 'linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%)' },
  { name: 'Atardecer', colors: ['#FF6B6B', '#FFA07A'], css: 'linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)' },
  { name: 'Noche', colors: ['#1a1a2e', '#16213e'], css: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { name: 'Bosque', colors: ['#2D5A27', '#68A357'], css: 'linear-gradient(135deg, #2D5A27 0%, #68A357 100%)' },
  { name: 'Coral', colors: ['#FF7F50', '#FF6347'], css: 'linear-gradient(135deg, #FF7F50 0%, #FF6347 100%)' },
  { name: 'Océano', colors: ['#006994', '#40A4C8'], css: 'linear-gradient(135deg, #006994 0%, #40A4C8 100%)' },
  { name: 'Lavanda', colors: ['#8E7CC3', '#B4A7D6'], css: 'linear-gradient(135deg, #8E7CC3 0%, #B4A7D6 100%)' },
  { name: 'Midnight', colors: ['#232526', '#414345'], css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Sunrise', colors: ['#F7971E', '#FFD200'], css: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)' },
  { name: 'Berry', colors: ['#8E2DE2', '#4A00E0'], css: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)' },
];

// Fuentes disponibles
const FONTS = [
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
];

// Plantillas predefinidas
const TEMPLATES: { type: TemplateType; name: string; icon: string; design: OGDesign }[] = [
  {
    type: 'blank',
    name: 'En blanco',
    icon: '📄',
    design: {
      background: { type: 'gradient', color: '#FFFFFF', gradientName: 'meskeIA', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: 'Tu título aquí', fontSize: 72, fontFamily: 'Montserrat, sans-serif', color: '#FFFFFF', y: 250, shadow: true },
      subtitle: { text: '', fontSize: 32, fontFamily: 'Open Sans, sans-serif', color: '#FFFFFF', visible: false },
      branding: { text: '', fontSize: 24, color: '#FFFFFF', position: 'bottom-right', visible: false },
      badge: { text: '', bgColor: '#FF6B6B', textColor: '#FFFFFF', visible: false },
      icon: { emoji: '', size: 80, visible: false },
      logo: { imageUrl: '', size: 100, position: 'bottom-right', visible: false },
    },
  },
  {
    type: 'article',
    name: 'Artículo / Blog',
    icon: '📝',
    design: {
      background: { type: 'gradient', color: '#1a1a2e', gradientName: 'Noche', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: 'Título del Artículo', fontSize: 64, fontFamily: 'Montserrat, sans-serif', color: '#FFFFFF', y: 220, shadow: true },
      subtitle: { text: 'Subtítulo o descripción breve del contenido', fontSize: 28, fontFamily: 'Open Sans, sans-serif', color: '#B0B0B0', visible: true },
      branding: { text: 'miblog.com', fontSize: 24, color: '#FFFFFF', position: 'bottom-left', visible: true },
      badge: { text: 'NUEVO', bgColor: '#FF6B6B', textColor: '#FFFFFF', visible: true },
      icon: { emoji: '📰', size: 60, visible: true },
      logo: { imageUrl: '', size: 80, position: 'top-left', visible: false },
    },
  },
  {
    type: 'product',
    name: 'Producto / Servicio',
    icon: '🛍️',
    design: {
      background: { type: 'gradient', color: '#FFFFFF', gradientName: 'meskeIA', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: 'Nombre del Producto', fontSize: 68, fontFamily: 'Poppins, sans-serif', color: '#FFFFFF', y: 200, shadow: true },
      subtitle: { text: 'Descripción breve del producto o servicio', fontSize: 30, fontFamily: 'Open Sans, sans-serif', color: '#E0E0E0', visible: true },
      branding: { text: 'miempresa.com', fontSize: 26, color: '#FFFFFF', position: 'bottom-right', visible: true },
      badge: { text: '-20%', bgColor: '#FFD200', textColor: '#1A1A1A', visible: true },
      icon: { emoji: '🚀', size: 70, visible: true },
      logo: { imageUrl: '', size: 80, position: 'bottom-right', visible: false },
    },
  },
  {
    type: 'event',
    name: 'Evento',
    icon: '🎉',
    design: {
      background: { type: 'gradient', color: '#8E2DE2', gradientName: 'Berry', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: 'Nombre del Evento', fontSize: 70, fontFamily: 'Oswald, sans-serif', color: '#FFFFFF', y: 200, shadow: true },
      subtitle: { text: '📅 15 Enero 2025 • 📍 Madrid, España', fontSize: 32, fontFamily: 'Open Sans, sans-serif', color: '#E0E0E0', visible: true },
      branding: { text: 'Inscríbete ahora', fontSize: 28, color: '#FFD200', position: 'bottom-center', visible: true },
      badge: { text: 'GRATIS', bgColor: '#10B981', textColor: '#FFFFFF', visible: true },
      icon: { emoji: '🎤', size: 70, visible: true },
      logo: { imageUrl: '', size: 80, position: 'top-left', visible: false },
    },
  },
  {
    type: 'announcement',
    name: 'Anuncio',
    icon: '📢',
    design: {
      background: { type: 'gradient', color: '#FF7F50', gradientName: 'Coral', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: '¡Gran Anuncio!', fontSize: 80, fontFamily: 'Montserrat, sans-serif', color: '#FFFFFF', y: 220, shadow: true },
      subtitle: { text: 'Descripción del anuncio importante', fontSize: 34, fontFamily: 'Open Sans, sans-serif', color: '#FFF5EE', visible: true },
      branding: { text: 'Más info →', fontSize: 26, color: '#FFFFFF', position: 'bottom-right', visible: true },
      badge: { text: '🔥 HOT', bgColor: '#1A1A1A', textColor: '#FFFFFF', visible: true },
      icon: { emoji: '📢', size: 80, visible: true },
      logo: { imageUrl: '', size: 80, position: 'bottom-right', visible: false },
    },
  },
  {
    type: 'quote',
    name: 'Cita / Frase',
    icon: '💬',
    design: {
      background: { type: 'gradient', color: '#232526', gradientName: 'Midnight', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: '"La mejor forma de predecir el futuro es creándolo."', fontSize: 52, fontFamily: 'Georgia, serif', color: '#FFFFFF', y: 200, shadow: false },
      subtitle: { text: '— Peter Drucker', fontSize: 28, fontFamily: 'Open Sans, sans-serif', color: '#B0B0B0', visible: true },
      branding: { text: '@tuusuario', fontSize: 24, color: '#808080', position: 'bottom-right', visible: true },
      badge: { text: '', bgColor: '#FF6B6B', textColor: '#FFFFFF', visible: false },
      icon: { emoji: '💡', size: 50, visible: true },
      logo: { imageUrl: '', size: 60, position: 'bottom-right', visible: false },
    },
  },
  {
    type: 'tutorial',
    name: 'Tutorial / Guía',
    icon: '📚',
    design: {
      background: { type: 'gradient', color: '#2D5A27', gradientName: 'Bosque', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: 'Cómo hacer X en 5 pasos', fontSize: 60, fontFamily: 'Montserrat, sans-serif', color: '#FFFFFF', y: 220, shadow: true },
      subtitle: { text: 'Guía paso a paso para principiantes', fontSize: 30, fontFamily: 'Open Sans, sans-serif', color: '#D0D0D0', visible: true },
      branding: { text: 'tutoriales.com', fontSize: 24, color: '#FFFFFF', position: 'bottom-left', visible: true },
      badge: { text: 'GUÍA', bgColor: '#10B981', textColor: '#FFFFFF', visible: true },
      icon: { emoji: '📖', size: 60, visible: true },
      logo: { imageUrl: '', size: 80, position: 'top-left', visible: false },
    },
  },
  {
    type: 'podcast',
    name: 'Podcast / Audio',
    icon: '🎧',
    design: {
      background: { type: 'gradient', color: '#8E7CC3', gradientName: 'Lavanda', imageUrl: '', overlay: false, overlayOpacity: 0.5 },
      title: { text: 'Episodio 42: Tema del podcast', fontSize: 56, fontFamily: 'Poppins, sans-serif', color: '#FFFFFF', y: 220, shadow: true },
      subtitle: { text: 'Con invitado especial • 45 min', fontSize: 28, fontFamily: 'Open Sans, sans-serif', color: '#E0E0E0', visible: true },
      branding: { text: 'Nombre del Podcast', fontSize: 26, color: '#FFFFFF', position: 'bottom-center', visible: true },
      badge: { text: 'EP. 42', bgColor: '#1A1A1A', textColor: '#FFFFFF', visible: true },
      icon: { emoji: '🎙️', size: 70, visible: true },
      logo: { imageUrl: '', size: 80, position: 'top-left', visible: false },
    },
  },
];

// Emojis populares para OG
const POPULAR_EMOJIS = ['🚀', '💡', '📢', '🔥', '⭐', '💰', '📝', '🎯', '✨', '📊', '🎉', '💪', '🏆', '📌', '⚡', '🎓', '💼', '🛒', '❤️', '👉', '📅', '🎤', '🎧', '📖', '🔔', '💎', '🌟', '🎬', '📱', '💻'];

export default function GeneradorOGImagesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Estado del diseño
  const [design, setDesign] = useState<OGDesign>(TEMPLATES[0].design);
  const [activeTab, setActiveTab] = useState<'templates' | 'background' | 'title' | 'subtitle' | 'branding' | 'badge' | 'icon' | 'logo'>('templates');
  const [scale, setScale] = useState(1);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  // Calcular escala para preview responsivo
  useEffect(() => {
    const updateScale = () => {
      const containerWidth = Math.min(window.innerWidth - 40, 900);
      setScale(Math.min(containerWidth / CANVAS_WIDTH, 0.8));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Cargar imagen de fondo cuando cambia
  useEffect(() => {
    if (design.background.type === 'image' && design.background.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setBgImage(img);
      img.src = design.background.imageUrl;
    } else {
      setBgImage(null);
    }
  }, [design.background.imageUrl, design.background.type]);

  // Cargar imagen de logo cuando cambia
  useEffect(() => {
    if (design.logo.visible && design.logo.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setLogoImage(img);
      img.src = design.logo.imageUrl;
    } else {
      setLogoImage(null);
    }
  }, [design.logo.imageUrl, design.logo.visible]);

  // Dibujar canvas
  const drawCanvas = useCallback((ctx: CanvasRenderingContext2D, forExport = false) => {
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;

    // Limpiar
    ctx.clearRect(0, 0, width, height);

    // Dibujar fondo
    if (design.background.type === 'color') {
      ctx.fillStyle = design.background.color;
      ctx.fillRect(0, 0, width, height);
    } else if (design.background.type === 'gradient') {
      const gradient = GRADIENTS.find(g => g.name === design.background.gradientName);
      if (gradient) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, gradient.colors[0]);
        grad.addColorStop(1, gradient.colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (design.background.type === 'image' && bgImage) {
      // Cubrir todo el canvas manteniendo proporción
      const imgRatio = bgImage.width / bgImage.height;
      const canvasRatio = width / height;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = height * imgRatio;
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgRatio;
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      }

      ctx.drawImage(bgImage, drawX, drawY, drawWidth, drawHeight);

      // Overlay oscuro
      if (design.background.overlay) {
        ctx.fillStyle = `rgba(0, 0, 0, ${design.background.overlayOpacity})`;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // Dibujar badge (esquina superior)
    if (design.badge.visible && design.badge.text) {
      ctx.save();
      ctx.fillStyle = design.badge.bgColor;
      const badgeText = design.badge.text;
      ctx.font = `bold 24px Arial`;
      const textWidth = ctx.measureText(badgeText).width;
      const badgeWidth = textWidth + 40;
      const badgeHeight = 48;
      const badgeX = width - badgeWidth - 40;
      const badgeY = 40;

      // Rectángulo con bordes redondeados
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
      ctx.fill();

      // Texto del badge
      ctx.fillStyle = design.badge.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
      ctx.restore();
    }

    // Dibujar emoji/icono
    if (design.icon.visible && design.icon.emoji) {
      ctx.save();
      ctx.font = `${design.icon.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(design.icon.emoji, 120, height / 2);
      ctx.restore();
    }

    // Dibujar título
    if (design.title.text) {
      ctx.save();
      ctx.font = `bold ${design.title.fontSize}px ${design.title.fontFamily}`;
      ctx.fillStyle = design.title.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Sombra
      if (design.title.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      }

      // Dividir texto en líneas si es muy largo
      const maxWidth = width - (design.icon.visible ? 200 : 100);
      const lines = wrapText(ctx, design.title.text, maxWidth);
      const lineHeight = design.title.fontSize * 1.2;
      const startY = design.title.y - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, i) => {
        const xPos = design.icon.visible ? width / 2 + 60 : width / 2;
        ctx.fillText(line, xPos, startY + i * lineHeight);
      });

      ctx.restore();
    }

    // Dibujar subtítulo
    if (design.subtitle.visible && design.subtitle.text) {
      ctx.save();
      ctx.font = `${design.subtitle.fontSize}px ${design.subtitle.fontFamily}`;
      ctx.fillStyle = design.subtitle.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const subtitleY = design.title.y + design.title.fontSize * 0.8 + 40;
      const xPos = design.icon.visible ? width / 2 + 60 : width / 2;
      ctx.fillText(design.subtitle.text, xPos, subtitleY);

      ctx.restore();
    }

    // Dibujar branding
    if (design.branding.visible && design.branding.text) {
      ctx.save();
      ctx.font = `bold ${design.branding.fontSize}px Arial`;
      ctx.fillStyle = design.branding.color;
      ctx.textBaseline = 'bottom';

      const brandingY = height - 40;
      let brandingX: number;

      switch (design.branding.position) {
        case 'bottom-left':
          ctx.textAlign = 'left';
          brandingX = 40;
          break;
        case 'bottom-right':
          ctx.textAlign = 'right';
          brandingX = width - 40;
          break;
        case 'bottom-center':
          ctx.textAlign = 'center';
          brandingX = width / 2;
          break;
      }

      ctx.fillText(design.branding.text, brandingX, brandingY);
      ctx.restore();
    }

    // Dibujar logo
    if (design.logo.visible && logoImage) {
      ctx.save();

      // Calcular tamaño manteniendo proporción
      const logoRatio = logoImage.width / logoImage.height;
      let logoWidth = design.logo.size;
      let logoHeight = design.logo.size / logoRatio;

      // Si es más alto que ancho, ajustar
      if (logoHeight > design.logo.size) {
        logoHeight = design.logo.size;
        logoWidth = design.logo.size * logoRatio;
      }

      // Calcular posición
      const margin = 40;
      let logoX: number;
      let logoY: number;

      switch (design.logo.position) {
        case 'top-left':
          logoX = margin;
          logoY = margin;
          break;
        case 'top-right':
          logoX = width - logoWidth - margin;
          logoY = margin;
          break;
        case 'bottom-left':
          logoX = margin;
          logoY = height - logoHeight - margin;
          break;
        case 'bottom-right':
          logoX = width - logoWidth - margin;
          logoY = height - logoHeight - margin;
          break;
        case 'center':
          logoX = (width - logoWidth) / 2;
          logoY = (height - logoHeight) / 2;
          break;
      }

      ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
      ctx.restore();
    }
  }, [design, bgImage, logoImage]);

  // Función para dividir texto en líneas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Renderizar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCanvas(ctx);
  }, [drawCanvas]);

  // Aplicar plantilla
  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setDesign({ ...template.design });
  };

  // Cargar imagen de fondo
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setDesign(prev => ({
        ...prev,
        background: {
          ...prev.background,
          type: 'image',
          imageUrl: event.target?.result as string,
          overlay: true,
          overlayOpacity: 0.4,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Exportar imagen
  const exportImage = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = CANVAS_WIDTH;
    exportCanvas.height = CANVAS_HEIGHT;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    drawCanvas(ctx, true);

    const link = document.createElement('a');
    link.download = 'og-image-1200x630.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  // Actualizar diseño
  const updateDesign = (updates: Partial<OGDesign>) => {
    setDesign(prev => ({ ...prev, ...updates }));
  };

  const updateBackground = (updates: Partial<OGDesign['background']>) => {
    setDesign(prev => ({ ...prev, background: { ...prev.background, ...updates } }));
  };

  const updateTitle = (updates: Partial<OGDesign['title']>) => {
    setDesign(prev => ({ ...prev, title: { ...prev.title, ...updates } }));
  };

  const updateSubtitle = (updates: Partial<OGDesign['subtitle']>) => {
    setDesign(prev => ({ ...prev, subtitle: { ...prev.subtitle, ...updates } }));
  };

  const updateBranding = (updates: Partial<OGDesign['branding']>) => {
    setDesign(prev => ({ ...prev, branding: { ...prev.branding, ...updates } }));
  };

  const updateBadge = (updates: Partial<OGDesign['badge']>) => {
    setDesign(prev => ({ ...prev, badge: { ...prev.badge, ...updates } }));
  };

  const updateIcon = (updates: Partial<OGDesign['icon']>) => {
    setDesign(prev => ({ ...prev, icon: { ...prev.icon, ...updates } }));
  };

  const updateLogo = (updates: Partial<OGDesign['logo']>) => {
    setDesign(prev => ({ ...prev, logo: { ...prev.logo, ...updates } }));
  };

  // Cargar imagen de logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      updateLogo({
        imageUrl: event.target?.result as string,
        visible: true,
      });
    };
    reader.readAsDataURL(file);
  };

  // Eliminar logo
  const removeLogo = () => {
    updateLogo({ imageUrl: '', visible: false });
    setLogoImage(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Imágenes OG</h1>
        <p className={styles.subtitle}>
          Crea imágenes Open Graph profesionales para Facebook, Twitter, LinkedIn y WhatsApp
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de controles */}
        <div className={styles.controlsPanel}>
          {/* Tabs */}
          <div className={styles.tabs}>
            {[
              { id: 'templates', label: '📋 Plantillas' },
              { id: 'background', label: '🎨 Fondo' },
              { id: 'title', label: '📝 Título' },
              { id: 'subtitle', label: '💬 Subtítulo' },
              { id: 'branding', label: '🏷️ Marca' },
              { id: 'badge', label: '🏅 Badge' },
              { id: 'icon', label: '😀 Icono' },
              { id: 'logo', label: '🖼️ Logo' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido del tab activo */}
          <div className={styles.tabContent}>
            {/* Plantillas */}
            {activeTab === 'templates' && (
              <div className={styles.templatesGrid}>
                {TEMPLATES.map(template => (
                  <button
                    key={template.type}
                    className={styles.templateCard}
                    onClick={() => applyTemplate(template)}
                  >
                    <span className={styles.templateIcon}>{template.icon}</span>
                    <span className={styles.templateName}>{template.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Fondo */}
            {activeTab === 'background' && (
              <div className={styles.controlGroup}>
                <label className={styles.label}>Tipo de fondo</label>
                <div className={styles.bgTypeSelector}>
                  {['color', 'gradient', 'image'].map(type => (
                    <button
                      key={type}
                      className={`${styles.bgTypeBtn} ${design.background.type === type ? styles.bgTypeBtnActive : ''}`}
                      onClick={() => updateBackground({ type: type as BackgroundType })}
                    >
                      {type === 'color' ? '🎨 Color' : type === 'gradient' ? '🌈 Gradiente' : '🖼️ Imagen'}
                    </button>
                  ))}
                </div>

                {design.background.type === 'color' && (
                  <div className={styles.inputRow}>
                    <label>Color:</label>
                    <input
                      type="color"
                      value={design.background.color}
                      onChange={e => updateBackground({ color: e.target.value })}
                      className={styles.colorPicker}
                    />
                  </div>
                )}

                {design.background.type === 'gradient' && (
                  <div className={styles.gradientsGrid}>
                    {GRADIENTS.map(g => (
                      <button
                        key={g.name}
                        className={`${styles.gradientSwatch} ${design.background.gradientName === g.name ? styles.gradientSwatchActive : ''}`}
                        style={{ background: g.css }}
                        onClick={() => updateBackground({ gradientName: g.name })}
                        title={g.name}
                      />
                    ))}
                  </div>
                )}

                {design.background.type === 'image' && (
                  <>
                    <button
                      className={styles.uploadBtn}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📷 Subir imagen
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      style={{ display: 'none' }}
                    />

                    {design.background.imageUrl && (
                      <>
                        <div className={styles.inputRow}>
                          <label>
                            <input
                              type="checkbox"
                              checked={design.background.overlay}
                              onChange={e => updateBackground({ overlay: e.target.checked })}
                            />
                            Overlay oscuro
                          </label>
                        </div>
                        {design.background.overlay && (
                          <div className={styles.inputRow}>
                            <label>Opacidad: {Math.round(design.background.overlayOpacity * 100)}%</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={design.background.overlayOpacity}
                              onChange={e => updateBackground({ overlayOpacity: parseFloat(e.target.value) })}
                              className={styles.rangeInput}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Título */}
            {activeTab === 'title' && (
              <div className={styles.controlGroup}>
                <div className={styles.inputRow}>
                  <label>Texto:</label>
                  <textarea
                    value={design.title.text}
                    onChange={e => updateTitle({ text: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                    placeholder="Escribe tu título aquí..."
                  />
                </div>

                <div className={styles.inputRow}>
                  <label>Fuente:</label>
                  <select
                    value={design.title.fontFamily}
                    onChange={e => updateTitle({ fontFamily: e.target.value })}
                    className={styles.select}
                  >
                    {FONTS.map(f => (
                      <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputRow}>
                  <label>Tamaño: {design.title.fontSize}px</label>
                  <input
                    type="range"
                    min="32"
                    max="120"
                    value={design.title.fontSize}
                    onChange={e => updateTitle({ fontSize: parseInt(e.target.value) })}
                    className={styles.rangeInput}
                  />
                </div>

                <div className={styles.inputRow}>
                  <label>Color:</label>
                  <input
                    type="color"
                    value={design.title.color}
                    onChange={e => updateTitle({ color: e.target.value })}
                    className={styles.colorPicker}
                  />
                </div>

                <div className={styles.inputRow}>
                  <label>Posición Y: {design.title.y}px</label>
                  <input
                    type="range"
                    min="100"
                    max="450"
                    value={design.title.y}
                    onChange={e => updateTitle({ y: parseInt(e.target.value) })}
                    className={styles.rangeInput}
                  />
                </div>

                <div className={styles.inputRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={design.title.shadow}
                      onChange={e => updateTitle({ shadow: e.target.checked })}
                    />
                    Sombra de texto
                  </label>
                </div>
              </div>
            )}

            {/* Subtítulo */}
            {activeTab === 'subtitle' && (
              <div className={styles.controlGroup}>
                <div className={styles.inputRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={design.subtitle.visible}
                      onChange={e => updateSubtitle({ visible: e.target.checked })}
                    />
                    Mostrar subtítulo
                  </label>
                </div>

                {design.subtitle.visible && (
                  <>
                    <div className={styles.inputRow}>
                      <label>Texto:</label>
                      <input
                        type="text"
                        value={design.subtitle.text}
                        onChange={e => updateSubtitle({ text: e.target.value })}
                        className={styles.input}
                        placeholder="Subtítulo o descripción"
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <label>Fuente:</label>
                      <select
                        value={design.subtitle.fontFamily}
                        onChange={e => updateSubtitle({ fontFamily: e.target.value })}
                        className={styles.select}
                      >
                        {FONTS.map(f => (
                          <option key={f.value} value={f.value}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputRow}>
                      <label>Tamaño: {design.subtitle.fontSize}px</label>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        value={design.subtitle.fontSize}
                        onChange={e => updateSubtitle({ fontSize: parseInt(e.target.value) })}
                        className={styles.rangeInput}
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <label>Color:</label>
                      <input
                        type="color"
                        value={design.subtitle.color}
                        onChange={e => updateSubtitle({ color: e.target.value })}
                        className={styles.colorPicker}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Branding */}
            {activeTab === 'branding' && (
              <div className={styles.controlGroup}>
                <div className={styles.inputRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={design.branding.visible}
                      onChange={e => updateBranding({ visible: e.target.checked })}
                    />
                    Mostrar marca/URL
                  </label>
                </div>

                {design.branding.visible && (
                  <>
                    <div className={styles.inputRow}>
                      <label>Texto:</label>
                      <input
                        type="text"
                        value={design.branding.text}
                        onChange={e => updateBranding({ text: e.target.value })}
                        className={styles.input}
                        placeholder="tudominio.com"
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <label>Posición:</label>
                      <select
                        value={design.branding.position}
                        onChange={e => updateBranding({ position: e.target.value as 'bottom-left' | 'bottom-right' | 'bottom-center' })}
                        className={styles.select}
                      >
                        <option value="bottom-left">Abajo izquierda</option>
                        <option value="bottom-center">Abajo centro</option>
                        <option value="bottom-right">Abajo derecha</option>
                      </select>
                    </div>

                    <div className={styles.inputRow}>
                      <label>Tamaño: {design.branding.fontSize}px</label>
                      <input
                        type="range"
                        min="16"
                        max="36"
                        value={design.branding.fontSize}
                        onChange={e => updateBranding({ fontSize: parseInt(e.target.value) })}
                        className={styles.rangeInput}
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <label>Color:</label>
                      <input
                        type="color"
                        value={design.branding.color}
                        onChange={e => updateBranding({ color: e.target.value })}
                        className={styles.colorPicker}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Badge */}
            {activeTab === 'badge' && (
              <div className={styles.controlGroup}>
                <div className={styles.inputRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={design.badge.visible}
                      onChange={e => updateBadge({ visible: e.target.checked })}
                    />
                    Mostrar badge
                  </label>
                </div>

                {design.badge.visible && (
                  <>
                    <div className={styles.inputRow}>
                      <label>Texto:</label>
                      <input
                        type="text"
                        value={design.badge.text}
                        onChange={e => updateBadge({ text: e.target.value })}
                        className={styles.input}
                        placeholder="NUEVO"
                        maxLength={15}
                      />
                    </div>

                    <div className={styles.badgePresets}>
                      {['NUEVO', 'HOT 🔥', 'GRATIS', '-50%', 'PRO', 'BETA', 'TOP', 'VIP'].map(preset => (
                        <button
                          key={preset}
                          className={styles.badgePreset}
                          onClick={() => updateBadge({ text: preset })}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <div className={styles.inputRow}>
                      <label>Color fondo:</label>
                      <input
                        type="color"
                        value={design.badge.bgColor}
                        onChange={e => updateBadge({ bgColor: e.target.value })}
                        className={styles.colorPicker}
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <label>Color texto:</label>
                      <input
                        type="color"
                        value={design.badge.textColor}
                        onChange={e => updateBadge({ textColor: e.target.value })}
                        className={styles.colorPicker}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Icono */}
            {activeTab === 'icon' && (
              <div className={styles.controlGroup}>
                <div className={styles.inputRow}>
                  <label>
                    <input
                      type="checkbox"
                      checked={design.icon.visible}
                      onChange={e => updateIcon({ visible: e.target.checked })}
                    />
                    Mostrar icono/emoji
                  </label>
                </div>

                {design.icon.visible && (
                  <>
                    <div className={styles.emojiGrid}>
                      {POPULAR_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          className={`${styles.emojiBtn} ${design.icon.emoji === emoji ? styles.emojiBtnActive : ''}`}
                          onClick={() => updateIcon({ emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className={styles.inputRow}>
                      <label>O escribe emoji:</label>
                      <input
                        type="text"
                        value={design.icon.emoji}
                        onChange={e => updateIcon({ emoji: e.target.value })}
                        className={styles.input}
                        maxLength={4}
                      />
                    </div>

                    <div className={styles.inputRow}>
                      <label>Tamaño: {design.icon.size}px</label>
                      <input
                        type="range"
                        min="40"
                        max="150"
                        value={design.icon.size}
                        onChange={e => updateIcon({ size: parseInt(e.target.value) })}
                        className={styles.rangeInput}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Logo */}
            {activeTab === 'logo' && (
              <div className={styles.controlGroup}>
                <p className={styles.logoDescription}>
                  Sube tu logo o imagen de marca para añadirla a la imagen OG.
                </p>

                {!design.logo.imageUrl ? (
                  <>
                    <button
                      className={styles.uploadBtn}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      🖼️ Subir logo
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </>
                ) : (
                  <>
                    <div className={styles.logoPreview}>
                      <img src={design.logo.imageUrl} alt="Logo preview" />
                      <button
                        className={styles.removeLogoBtn}
                        onClick={removeLogo}
                        title="Eliminar logo"
                      >
                        ✕
                      </button>
                    </div>

                    <div className={styles.inputRow}>
                      <label>
                        <input
                          type="checkbox"
                          checked={design.logo.visible}
                          onChange={e => updateLogo({ visible: e.target.checked })}
                        />
                        Mostrar logo
                      </label>
                    </div>

                    {design.logo.visible && (
                      <>
                        <div className={styles.inputRow}>
                          <label>Tamaño: {design.logo.size}px</label>
                          <input
                            type="range"
                            min="40"
                            max="200"
                            value={design.logo.size}
                            onChange={e => updateLogo({ size: parseInt(e.target.value) })}
                            className={styles.rangeInput}
                          />
                        </div>

                        <div className={styles.inputRow}>
                          <label>Posición:</label>
                          <select
                            value={design.logo.position}
                            onChange={e => updateLogo({ position: e.target.value as typeof design.logo.position })}
                            className={styles.select}
                          >
                            <option value="top-left">Arriba izquierda</option>
                            <option value="top-right">Arriba derecha</option>
                            <option value="bottom-left">Abajo izquierda</option>
                            <option value="bottom-right">Abajo derecha</option>
                            <option value="center">Centro</option>
                          </select>
                        </div>

                        <button
                          className={styles.changeLogoBtn}
                          onClick={() => logoInputRef.current?.click()}
                        >
                          📷 Cambiar logo
                        </button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Botón exportar */}
          <button className={styles.exportBtn} onClick={exportImage}>
            💾 Descargar imagen (1200×630)
          </button>
        </div>

        {/* Preview del canvas */}
        <div className={styles.previewPanel}>
          <div className={styles.previewWrapper}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className={styles.canvas}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            />
          </div>

          <div className={styles.previewInfo}>
            <div className={styles.sizeInfo}>
              <span>📐 1200 × 630 px</span>
              <span className={styles.separator}>•</span>
              <span>Ratio 1.91:1</span>
            </div>
            <div className={styles.platformsInfo}>
              ✅ Facebook • ✅ Twitter • ✅ LinkedIn • ✅ WhatsApp
            </div>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Qué son las imágenes Open Graph?"
        subtitle="Aprende a optimizar tus previsualizaciones en redes sociales"
        icon="📚"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h3>¿Qué es Open Graph?</h3>
            <p>
              Open Graph (OG) es un protocolo creado por Facebook que permite controlar cómo se muestra
              el contenido de tu web cuando se comparte en redes sociales. Las imágenes OG son las
              previsualizaciones que aparecen en Facebook, Twitter, LinkedIn, WhatsApp y otras plataformas.
            </p>
          </section>

          <section className={styles.eduSection}>
            <h3>Tamaños recomendados</h3>
            <div className={styles.sizesGrid}>
              <div className={styles.sizeCard}>
                <h4>📘 Facebook</h4>
                <p><strong>1200 × 630 px</strong></p>
                <p>Ratio 1.91:1</p>
              </div>
              <div className={styles.sizeCard}>
                <h4>🐦 Twitter</h4>
                <p><strong>1200 × 628 px</strong></p>
                <p>Ratio 1.91:1</p>
              </div>
              <div className={styles.sizeCard}>
                <h4>💼 LinkedIn</h4>
                <p><strong>1200 × 627 px</strong></p>
                <p>Ratio 1.91:1</p>
              </div>
              <div className={styles.sizeCard}>
                <h4>💬 WhatsApp</h4>
                <p><strong>1200 × 630 px</strong></p>
                <p>Ratio 1.91:1</p>
              </div>
            </div>
            <p className={styles.note}>
              💡 <strong>1200 × 630 px</strong> es el tamaño universal que funciona en todas las plataformas.
            </p>
          </section>

          <section className={styles.eduSection}>
            <h3>Cómo implementar la imagen OG</h3>
            <p>Añade estas meta tags en el <code>&lt;head&gt;</code> de tu página HTML:</p>
            <pre className={styles.codeBlock}>
{`<meta property="og:image" content="https://tudominio.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:title" content="Título de tu página" />
<meta property="og:description" content="Descripción breve" />

<!-- Para Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://tudominio.com/og-image.png" />`}
            </pre>
          </section>

          <section className={styles.eduSection}>
            <h3>Consejos de diseño</h3>
            <ul className={styles.tipsList}>
              <li>✅ Usa texto grande y legible (mínimo 60px para el título)</li>
              <li>✅ Alto contraste entre texto y fondo</li>
              <li>✅ Incluye tu logo o branding</li>
              <li>✅ Deja márgenes de seguridad (algunas plataformas recortan los bordes)</li>
              <li>✅ Evita texto muy cerca de los bordes</li>
              <li>⚠️ No dependas solo de texto pequeño (puede no verse bien en móvil)</li>
            </ul>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-og-images')} />
      <Footer appName="generador-og-images" />
    </div>
  );
}
