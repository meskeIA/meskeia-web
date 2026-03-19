'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './CreadorThumbnails.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Constantes del canvas
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

// Tipos
type BackgroundType = 'color' | 'gradient' | 'image';
type ElementType = 'text' | 'image' | 'shape' | 'emoji';
type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart' | 'arrow-right' | 'arrow-down' | 'play-button' | 'badge' | 'check' | 'cross';

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  // Propiedades de texto
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textShadow?: boolean;
  textShadowColor?: string;
  textStroke?: boolean;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  // Propiedades de imagen
  imageSrc?: string;
  // Propiedades de forma
  shapeType?: ShapeType;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  badgeText?: string;
  // Emoji
  emoji?: string;
}

interface Background {
  type: BackgroundType;
  color: string;
  gradientName: string;
  imageUrl: string;
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
  { name: 'Gris Neutro', colors: ['#E0E0E0', '#BDBDBD'], css: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)' },
];

// Fuentes disponibles
const FONTS = [
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'Bebas Neue', value: 'Bebas Neue, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

// Formas disponibles
const SHAPES: { type: ShapeType; icon: string; name: string }[] = [
  { type: 'rectangle', icon: '⬜', name: 'Rectángulo' },
  { type: 'circle', icon: '⚪', name: 'Círculo' },
  { type: 'triangle', icon: '🔺', name: 'Triángulo' },
  { type: 'star', icon: '⭐', name: 'Estrella' },
  { type: 'heart', icon: '❤️', name: 'Corazón' },
  { type: 'arrow-right', icon: '➡️', name: 'Flecha →' },
  { type: 'arrow-down', icon: '⬇️', name: 'Flecha ↓' },
  { type: 'play-button', icon: '▶️', name: 'Play' },
  { type: 'badge', icon: '🏷️', name: 'Badge' },
  { type: 'check', icon: '✅', name: 'Check' },
  { type: 'cross', icon: '❌', name: 'Cruz' },
];

// Emojis populares
const POPULAR_EMOJIS = ['😀', '😂', '🤔', '😱', '🔥', '💯', '👍', '👎', '💪', '🎉', '⚡', '💡', '🚀', '⭐', '❤️', '💰', '🎯', '📌', '🔴', '🟢', '🔵', '⚠️', '❗', '❓', '✨', '🏆', '🎬', '📹', '🎥', '📺'];

// Genera ID único
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function CreadorThumbnailsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Estados
  const [background, setBackground] = useState<Background>({
    type: 'color',
    color: '#FFFFFF',
    gradientName: 'meskeIA',
    imageUrl: '',
  });

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'background' | 'text' | 'image' | 'shapes' | 'emoji'>('background');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Obtener elemento seleccionado
  const selectedElement = elements.find(el => el.id === selectedId);

  // Calcular escala para preview
  useEffect(() => {
    const updateScale = () => {
      const containerWidth = Math.min(window.innerWidth - 400, 900);
      setScale(containerWidth / CANVAS_WIDTH);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Dibujar canvas
  const drawCanvas = useCallback((ctx: CanvasRenderingContext2D, forExport = false) => {
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;

    // Limpiar
    ctx.clearRect(0, 0, width, height);

    // Dibujar fondo
    if (background.type === 'color') {
      ctx.fillStyle = background.color;
      ctx.fillRect(0, 0, width, height);
    } else if (background.type === 'gradient') {
      const gradient = GRADIENTS.find(g => g.name === background.gradientName);
      if (gradient) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, gradient.colors[0]);
        grad.addColorStop(1, gradient.colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (background.type === 'image' && background.imageUrl) {
      const img = new Image();
      img.src = background.imageUrl;
      if (img.complete) {
        ctx.drawImage(img, 0, 0, width, height);
      }
    }

    // Dibujar elementos ordenados por posición en array (último = encima)
    const visibleElements = elements.filter(el => el.visible);

    visibleElements.forEach(el => {
      ctx.save();

      // Transformaciones
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-el.width / 2, -el.height / 2);

      if (el.type === 'text' && el.text) {
        const fontStyle = el.fontStyle === 'italic' ? 'italic ' : '';
        const fontWeight = el.fontWeight === 'bold' ? 'bold ' : '';
        ctx.font = `${fontStyle}${fontWeight}${el.fontSize}px ${el.fontFamily}`;
        ctx.textBaseline = 'top';

        // Sombra
        if (el.textShadow) {
          ctx.shadowColor = el.textShadowColor || 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }

        // Stroke (contorno)
        if (el.textStroke && el.textStrokeWidth) {
          ctx.strokeStyle = el.textStrokeColor || '#000000';
          ctx.lineWidth = el.textStrokeWidth;
          ctx.lineJoin = 'round';
          ctx.strokeText(el.text, 0, 0);
        }

        // Texto
        ctx.fillStyle = el.color || '#000000';
        ctx.fillText(el.text, 0, 0);
        ctx.shadowColor = 'transparent';
      }

      if (el.type === 'image' && el.imageSrc) {
        const img = new Image();
        img.src = el.imageSrc;
        if (img.complete) {
          ctx.drawImage(img, 0, 0, el.width, el.height);
        }
      }

      if (el.type === 'shape') {
        ctx.fillStyle = el.fill || '#2E86AB';
        ctx.strokeStyle = el.stroke || '#000000';
        ctx.lineWidth = el.strokeWidth || 0;

        drawShape(ctx, el.shapeType!, el.width, el.height, el.badgeText);
      }

      if (el.type === 'emoji' && el.emoji) {
        ctx.font = `${el.fontSize}px Arial`;
        ctx.textBaseline = 'top';
        ctx.fillText(el.emoji, 0, 0);
      }

      ctx.restore();

      // Dibujar selección (solo en preview, no en export)
      if (!forExport && el.id === selectedId) {
        ctx.save();
        ctx.strokeStyle = '#2E86AB';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(el.x - 2, el.y - 2, el.width + 4, el.height + 4);
        ctx.restore();
      }
    });
  }, [background, elements, selectedId]);

  // Dibujar forma específica
  const drawShape = (ctx: CanvasRenderingContext2D, type: ShapeType, w: number, h: number, badgeText?: string) => {
    ctx.beginPath();

    switch (type) {
      case 'rectangle':
        ctx.rect(0, 0, w, h);
        break;
      case 'circle':
        ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        break;
      case 'triangle':
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        break;
      case 'star':
        drawStar(ctx, w / 2, h / 2, 5, w / 2, w / 4);
        break;
      case 'heart':
        drawHeart(ctx, w, h);
        break;
      case 'arrow-right':
        ctx.moveTo(0, h * 0.3);
        ctx.lineTo(w * 0.6, h * 0.3);
        ctx.lineTo(w * 0.6, 0);
        ctx.lineTo(w, h / 2);
        ctx.lineTo(w * 0.6, h);
        ctx.lineTo(w * 0.6, h * 0.7);
        ctx.lineTo(0, h * 0.7);
        ctx.closePath();
        break;
      case 'arrow-down':
        ctx.moveTo(w * 0.3, 0);
        ctx.lineTo(w * 0.7, 0);
        ctx.lineTo(w * 0.7, h * 0.6);
        ctx.lineTo(w, h * 0.6);
        ctx.lineTo(w / 2, h);
        ctx.lineTo(0, h * 0.6);
        ctx.lineTo(w * 0.3, h * 0.6);
        ctx.closePath();
        break;
      case 'play-button':
        // Círculo rojo
        ctx.fillStyle = '#FF0000';
        ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Triángulo blanco
        ctx.beginPath();
        ctx.fillStyle = '#FFFFFF';
        ctx.moveTo(w * 0.35, h * 0.25);
        ctx.lineTo(w * 0.75, h / 2);
        ctx.lineTo(w * 0.35, h * 0.75);
        ctx.closePath();
        ctx.fill();
        return;
      case 'badge':
        ctx.roundRect(0, 0, w, h, 8);
        ctx.fill();
        if (badgeText) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, w / 2, h / 2);
        }
        return;
      case 'check':
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = w * 0.15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(w * 0.15, h * 0.5);
        ctx.lineTo(w * 0.4, h * 0.75);
        ctx.lineTo(w * 0.85, h * 0.25);
        ctx.stroke();
        return;
      case 'cross':
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = w * 0.15;
        ctx.lineCap = 'round';
        ctx.moveTo(w * 0.2, h * 0.2);
        ctx.lineTo(w * 0.8, h * 0.8);
        ctx.moveTo(w * 0.8, h * 0.2);
        ctx.lineTo(w * 0.2, h * 0.8);
        ctx.stroke();
        return;
    }

    ctx.fill();
    if (ctx.lineWidth > 0) ctx.stroke();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.moveTo(w / 2, h * 0.3);
    ctx.bezierCurveTo(w * 0.1, 0, 0, h * 0.4, w / 2, h);
    ctx.moveTo(w / 2, h * 0.3);
    ctx.bezierCurveTo(w * 0.9, 0, w, h * 0.4, w / 2, h);
    ctx.closePath();
  };

  // Redibujar cuando cambie algo
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Si hay imagen de fondo, esperar a que cargue
    if (background.type === 'image' && background.imageUrl) {
      const img = new Image();
      img.onload = () => drawCanvas(ctx);
      img.src = background.imageUrl;
    } else {
      drawCanvas(ctx);
    }
  }, [background, elements, selectedId, drawCanvas]);

  // Handlers de mouse para drag
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Buscar elemento clickeado (de arriba a abajo)
    const clickedElement = [...elements].reverse().find(el =>
      el.visible &&
      x >= el.x && x <= el.x + el.width &&
      y >= el.y && y <= el.y + el.height
    );

    if (clickedElement) {
      setSelectedId(clickedElement.id);
      setIsDragging(true);
      setDragOffset({ x: x - clickedElement.x, y: y - clickedElement.y });
    } else {
      setSelectedId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedId) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setElements(prev => prev.map(el =>
      el.id === selectedId
        ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
        : el
    ));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Añadir texto
  const addText = () => {
    const newElement: CanvasElement = {
      id: generateId(),
      type: 'text',
      x: 100,
      y: 100,
      width: 400,
      height: 80,
      rotation: 0,
      visible: true,
      text: 'Tu texto aquí',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 64,
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#FFFFFF',
      textShadow: true,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textStroke: true,
      textStrokeColor: '#000000',
      textStrokeWidth: 2,
    };
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  // Añadir imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxWidth = 400;
        const width = Math.min(img.width, maxWidth);
        const height = width / aspectRatio;

        const newElement: CanvasElement = {
          id: generateId(),
          type: 'image',
          x: 100,
          y: 100,
          width,
          height,
          rotation: 0,
          visible: true,
          imageSrc: event.target?.result as string,
        };
        setElements(prev => [...prev, newElement]);
        setSelectedId(newElement.id);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Añadir forma
  const addShape = (shapeType: ShapeType) => {
    const newElement: CanvasElement = {
      id: generateId(),
      type: 'shape',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      visible: true,
      shapeType,
      fill: shapeType === 'play-button' ? '#FF0000' : '#2E86AB',
      stroke: '#000000',
      strokeWidth: 0,
      badgeText: shapeType === 'badge' ? 'NUEVO' : undefined,
    };
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  // Añadir emoji
  const addEmoji = (emoji: string) => {
    const newElement: CanvasElement = {
      id: generateId(),
      type: 'emoji',
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      rotation: 0,
      visible: true,
      emoji,
      fontSize: 64,
    };
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  // Actualizar elemento seleccionado
  const updateSelected = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el =>
      el.id === selectedId ? { ...el, ...updates } : el
    ));
  };

  // Eliminar elemento
  const deleteSelected = () => {
    if (!selectedId) return;
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  // Mover capa
  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedId) return;
    setElements(prev => {
      const index = prev.findIndex(el => el.id === selectedId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index + 1 : index - 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newElements = [...prev];
      [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
      return newElements;
    });
  };

  // Duplicar elemento
  const duplicateSelected = () => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    const newElement = {
      ...element,
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20,
    };
    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  // Subir imagen de fondo
  const handleBackgroundImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackground(prev => ({
        ...prev,
        type: 'image',
        imageUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
    if (bgFileInputRef.current) bgFileInputRef.current.value = '';
  };

  // Exportar PNG
  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dibujar fondo
    if (background.type === 'image' && background.imageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawElementsAndExport(ctx, canvas);
      };
      img.src = background.imageUrl;
    } else {
      if (background.type === 'color') {
        ctx.fillStyle = background.color;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else if (background.type === 'gradient') {
        const gradient = GRADIENTS.find(g => g.name === background.gradientName);
        if (gradient) {
          const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          grad.addColorStop(0, gradient.colors[0]);
          grad.addColorStop(1, gradient.colors[1]);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
      }
      drawElementsAndExport(ctx, canvas);
    }
  };

  const drawElementsAndExport = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Cargar todas las imágenes primero
    const imageElements = elements.filter(el => el.type === 'image' && el.imageSrc);
    const imagePromises = imageElements.map(el => {
      return new Promise<{ el: CanvasElement; img: HTMLImageElement }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ el, img });
        img.src = el.imageSrc!;
      });
    });

    Promise.all(imagePromises).then((loadedImages) => {
      const imageMap = new Map(loadedImages.map(({ el, img }) => [el.id, img]));

      elements.filter(el => el.visible).forEach(el => {
        ctx.save();
        ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-el.width / 2, -el.height / 2);

        if (el.type === 'text' && el.text) {
          const fontStyle = el.fontStyle === 'italic' ? 'italic ' : '';
          const fontWeight = el.fontWeight === 'bold' ? 'bold ' : '';
          ctx.font = `${fontStyle}${fontWeight}${el.fontSize}px ${el.fontFamily}`;
          ctx.textBaseline = 'top';

          if (el.textShadow) {
            ctx.shadowColor = el.textShadowColor || 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
          }

          if (el.textStroke && el.textStrokeWidth) {
            ctx.strokeStyle = el.textStrokeColor || '#000000';
            ctx.lineWidth = el.textStrokeWidth;
            ctx.lineJoin = 'round';
            ctx.strokeText(el.text, 0, 0);
          }

          ctx.fillStyle = el.color || '#000000';
          ctx.fillText(el.text, 0, 0);
          ctx.shadowColor = 'transparent';
        }

        if (el.type === 'image') {
          const img = imageMap.get(el.id);
          if (img) {
            ctx.drawImage(img, 0, 0, el.width, el.height);
          }
        }

        if (el.type === 'shape') {
          ctx.fillStyle = el.fill || '#2E86AB';
          ctx.strokeStyle = el.stroke || '#000000';
          ctx.lineWidth = el.strokeWidth || 0;
          drawShape(ctx, el.shapeType!, el.width, el.height, el.badgeText);
        }

        if (el.type === 'emoji' && el.emoji) {
          ctx.font = `${el.fontSize}px Arial`;
          ctx.textBaseline = 'top';
          ctx.fillText(el.emoji, 0, 0);
        }

        ctx.restore();
      });

      // Descargar
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'thumbnail-youtube.png';
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    });
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' && selectedId) {
        deleteSelected();
      }
      if (e.key === 'd' && e.ctrlKey && selectedId) {
        e.preventDefault();
        duplicateSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎬 Creador de Thumbnails YouTube</h1>
        <p className={styles.subtitle}>
          Diseña miniaturas profesionales para tus videos. Añade texto, imágenes y formas.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="creador-thumbnails-disclaimer"
      />

      <div className={styles.editor}>
        {/* Panel izquierdo - Herramientas */}
        <div className={styles.toolsPanel}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'background' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('background')}
            >
              🎨 Fondo
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'text' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('text')}
            >
              📝 Texto
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'image' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('image')}
            >
              🖼️ Imagen
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'shapes' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('shapes')}
            >
              ⬜ Formas
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'emoji' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('emoji')}
            >
              😀 Emoji
            </button>
          </div>

          <div className={styles.tabContent}>
            {/* Tab Fondo */}
            {activeTab === 'background' && (
              <div className={styles.section}>
                <h3>Tipo de fondo</h3>
                <div className={styles.bgTypeButtons}>
                  <button
                    className={`${styles.bgTypeBtn} ${background.type === 'color' ? styles.bgTypeActive : ''}`}
                    onClick={() => setBackground(prev => ({ ...prev, type: 'color' }))}
                  >
                    Color
                  </button>
                  <button
                    className={`${styles.bgTypeBtn} ${background.type === 'gradient' ? styles.bgTypeActive : ''}`}
                    onClick={() => setBackground(prev => ({ ...prev, type: 'gradient' }))}
                  >
                    Degradado
                  </button>
                  <button
                    className={`${styles.bgTypeBtn} ${background.type === 'image' ? styles.bgTypeActive : ''}`}
                    onClick={() => bgFileInputRef.current?.click()}
                  >
                    Imagen
                  </button>
                </div>

                {background.type === 'color' && (
                  <div className={styles.colorSection}>
                    <label>Color de fondo</label>
                    <input
                      type="color"
                      value={background.color}
                      onChange={(e) => setBackground(prev => ({ ...prev, color: e.target.value }))}
                      className={styles.colorPicker}
                    />
                  </div>
                )}

                {background.type === 'gradient' && (
                  <div className={styles.gradientsGrid}>
                    {GRADIENTS.map(g => (
                      <button
                        key={g.name}
                        className={`${styles.gradientBtn} ${background.gradientName === g.name ? styles.gradientActive : ''}`}
                        style={{ background: g.css }}
                        onClick={() => setBackground(prev => ({ ...prev, gradientName: g.name }))}
                        title={g.name}
                      >
                        <span className={styles.gradientName}>{g.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImage}
                  className={styles.hiddenInput}
                />
              </div>
            )}

            {/* Tab Texto */}
            {activeTab === 'text' && (
              <div className={styles.section}>
                <button onClick={addText} className={styles.addBtn}>
                  + Añadir Texto
                </button>

                {selectedElement?.type === 'text' && (
                  <div className={styles.textProps}>
                    <label>Texto</label>
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      className={styles.input}
                    />

                    <label>Fuente</label>
                    <select
                      value={selectedElement.fontFamily}
                      onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className={styles.select}
                    >
                      {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                      ))}
                    </select>

                    <label>Tamaño: {selectedElement.fontSize}px</label>
                    <input
                      type="range"
                      min="24"
                      max="200"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                      className={styles.slider}
                    />

                    <div className={styles.row}>
                      <label>Color</label>
                      <input
                        type="color"
                        value={selectedElement.color || '#FFFFFF'}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        className={styles.colorPickerSmall}
                      />
                    </div>

                    <div className={styles.checkboxRow}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedElement.fontWeight === 'bold'}
                          onChange={(e) => updateSelected({ fontWeight: e.target.checked ? 'bold' : 'normal' })}
                        />
                        Negrita
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedElement.fontStyle === 'italic'}
                          onChange={(e) => updateSelected({ fontStyle: e.target.checked ? 'italic' : 'normal' })}
                        />
                        Cursiva
                      </label>
                    </div>

                    <div className={styles.checkboxRow}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedElement.textShadow}
                          onChange={(e) => updateSelected({ textShadow: e.target.checked })}
                        />
                        Sombra
                      </label>
                      {selectedElement.textShadow && (
                        <input
                          type="color"
                          value={selectedElement.textShadowColor || 'rgba(0,0,0,0.5)'}
                          onChange={(e) => updateSelected({ textShadowColor: e.target.value })}
                          className={styles.colorPickerSmall}
                        />
                      )}
                    </div>

                    <div className={styles.checkboxRow}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedElement.textStroke}
                          onChange={(e) => updateSelected({ textStroke: e.target.checked })}
                        />
                        Contorno
                      </label>
                      {selectedElement.textStroke && (
                        <>
                          <input
                            type="color"
                            value={selectedElement.textStrokeColor || '#000000'}
                            onChange={(e) => updateSelected({ textStrokeColor: e.target.value })}
                            className={styles.colorPickerSmall}
                          />
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={selectedElement.textStrokeWidth || 2}
                            onChange={(e) => updateSelected({ textStrokeWidth: Number(e.target.value) })}
                            className={styles.numberInput}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Imagen */}
            {activeTab === 'image' && (
              <div className={styles.section}>
                <button onClick={() => fileInputRef.current?.click()} className={styles.addBtn}>
                  + Subir Imagen
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.hiddenInput}
                />
                <p className={styles.hint}>
                  Sube PNG o JPG desde tu ordenador. Arrastra para posicionar.
                </p>

                {selectedElement?.type === 'image' && (
                  <div className={styles.imageProps}>
                    <label>Ancho: {Math.round(selectedElement.width)}px</label>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      value={selectedElement.width}
                      onChange={(e) => {
                        const newWidth = Number(e.target.value);
                        const ratio = selectedElement.height / selectedElement.width;
                        updateSelected({ width: newWidth, height: newWidth * ratio });
                      }}
                      className={styles.slider}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tab Formas */}
            {activeTab === 'shapes' && (
              <div className={styles.section}>
                <h3>Formas</h3>
                <div className={styles.shapesGrid}>
                  {SHAPES.map(shape => (
                    <button
                      key={shape.type}
                      className={styles.shapeBtn}
                      onClick={() => addShape(shape.type)}
                      title={shape.name}
                    >
                      <span className={styles.shapeIcon}>{shape.icon}</span>
                      <span className={styles.shapeName}>{shape.name}</span>
                    </button>
                  ))}
                </div>

                {selectedElement?.type === 'shape' && (
                  <div className={styles.shapeProps}>
                    <div className={styles.row}>
                      <label>Color relleno</label>
                      <input
                        type="color"
                        value={selectedElement.fill || '#2E86AB'}
                        onChange={(e) => updateSelected({ fill: e.target.value })}
                        className={styles.colorPickerSmall}
                      />
                    </div>

                    <label>Tamaño: {Math.round(selectedElement.width)}px</label>
                    <input
                      type="range"
                      min="30"
                      max="400"
                      value={selectedElement.width}
                      onChange={(e) => updateSelected({ width: Number(e.target.value), height: Number(e.target.value) })}
                      className={styles.slider}
                    />

                    {selectedElement.shapeType === 'badge' && (
                      <>
                        <label>Texto del badge</label>
                        <input
                          type="text"
                          value={selectedElement.badgeText || ''}
                          onChange={(e) => updateSelected({ badgeText: e.target.value })}
                          className={styles.input}
                          placeholder="NUEVO"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab Emoji */}
            {activeTab === 'emoji' && (
              <div className={styles.section}>
                <h3>Emojis populares</h3>
                <div className={styles.emojiGrid}>
                  {POPULAR_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      className={styles.emojiBtn}
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {selectedElement?.type === 'emoji' && (
                  <div className={styles.emojiProps}>
                    <label>Tamaño: {selectedElement.fontSize}px</label>
                    <input
                      type="range"
                      min="32"
                      max="200"
                      value={selectedElement.fontSize}
                      onChange={(e) => updateSelected({ fontSize: Number(e.target.value), width: Number(e.target.value), height: Number(e.target.value) })}
                      className={styles.slider}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Canvas central */}
        <div className={styles.canvasContainer}>
          <div className={styles.canvasWrapper} style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}>
            <canvas
              ref={previewCanvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className={styles.canvas}
              style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>
          <p className={styles.canvasInfo}>1280 × 720 px (YouTube recomendado)</p>
        </div>

        {/* Panel derecho - Capas */}
        <div className={styles.layersPanel}>
          <h3>Capas</h3>

          {elements.length === 0 ? (
            <p className={styles.noLayers}>Sin elementos. Añade texto, imágenes o formas.</p>
          ) : (
            <div className={styles.layersList}>
              {[...elements].reverse().map((el, index) => (
                <div
                  key={el.id}
                  className={`${styles.layerItem} ${el.id === selectedId ? styles.layerSelected : ''}`}
                  onClick={() => setSelectedId(el.id)}
                >
                  <span className={styles.layerIcon}>
                    {el.type === 'text' && '📝'}
                    {el.type === 'image' && '🖼️'}
                    {el.type === 'shape' && '⬜'}
                    {el.type === 'emoji' && el.emoji}
                  </span>
                  <span className={styles.layerName}>
                    {el.type === 'text' && (el.text?.slice(0, 15) || 'Texto')}
                    {el.type === 'image' && 'Imagen'}
                    {el.type === 'shape' && SHAPES.find(s => s.type === el.shapeType)?.name}
                    {el.type === 'emoji' && 'Emoji'}
                  </span>
                  <button
                    className={styles.layerVisibility}
                    onClick={(e) => {
                      e.stopPropagation();
                      setElements(prev => prev.map(item =>
                        item.id === el.id ? { ...item, visible: !item.visible } : item
                      ));
                    }}
                  >
                    {el.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedId && (
            <div className={styles.layerActions}>
              <button onClick={() => moveLayer('up')} className={styles.layerBtn} title="Subir capa">
                ⬆️
              </button>
              <button onClick={() => moveLayer('down')} className={styles.layerBtn} title="Bajar capa">
                ⬇️
              </button>
              <button onClick={duplicateSelected} className={styles.layerBtn} title="Duplicar (Ctrl+D)">
                📋
              </button>
              <button onClick={deleteSelected} className={styles.layerBtnDanger} title="Eliminar (Delete)">
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Botón exportar */}
      <div className={styles.exportSection}>
        <button onClick={exportPNG} className={styles.exportBtn}>
          📥 Descargar PNG
        </button>
        <p className={styles.exportHint}>Se descargará a 1280×720 píxeles (resolución óptima para YouTube)</p>
      </div>

      {/* Info */}
      <div className={styles.infoSection}>
        <h3>Consejos para thumbnails efectivos</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📐</span>
            <h4>Resolución correcta</h4>
            <p>1280×720 px es la resolución recomendada por YouTube para miniaturas</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔤</span>
            <h4>Texto legible</h4>
            <p>Usa fuentes grandes y con contraste. El texto debe verse bien en móviles</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎨</span>
            <h4>Colores llamativos</h4>
            <p>Los colores brillantes y contrastantes atraen más clics</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>😀</span>
            <h4>Emociones</h4>
            <p>Los emojis y expresiones faciales generan curiosidad</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres crear thumbnails más efectivos?"
        subtitle="Aprende los secretos del CTR, qué colores funcionan y cómo estructurar tus miniaturas para conseguir más clics"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Tipos de contenido YouTube y sus thumbnails óptimos</h2>
          <p>
            Cada género de YouTube tiene convenciones visuales propias. Conocerlas te ayuda a
            crear miniaturas coherentes con las expectativas de tu audiencia y a destacar dentro
            de tu nicho.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de contenido</th>
                  <th>Tamaño recomendado</th>
                  <th>CTR medio del sector</th>
                  <th>Colores más efectivos</th>
                  <th>Texto en thumbnail</th>
                  <th>Estilo visual dominante</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎓 Tutoriales</td>
                  <td>1280×720 px</td>
                  <td>5 – 8 %</td>
                  <td>Azul, naranja, blanco</td>
                  <td>Sí (número o pregunta)</td>
                  <td>Cara + texto grande + resultado</td>
                </tr>
                <tr>
                  <td>🎙️ Vlogs</td>
                  <td>1280×720 px</td>
                  <td>3 – 6 %</td>
                  <td>Cálidos, saturados</td>
                  <td>Opcional</td>
                  <td>Momento emocional del vídeo</td>
                </tr>
                <tr>
                  <td>🎮 Gaming</td>
                  <td>1280×720 px</td>
                  <td>6 – 12 %</td>
                  <td>Rojo, amarillo, negro</td>
                  <td>Sí (corto e impactante)</td>
                  <td>Acción + expresión exagerada</td>
                </tr>
                <tr>
                  <td>📰 Noticias / Actualidad</td>
                  <td>1280×720 px</td>
                  <td>4 – 7 %</td>
                  <td>Rojo, blanco, negro</td>
                  <td>Sí (titular corto)</td>
                  <td>Foto de portada + texto llamativo</td>
                </tr>
                <tr>
                  <td>🎭 Entretenimiento</td>
                  <td>1280×720 px</td>
                  <td>7 – 15 %</td>
                  <td>Cualquiera, alta saturación</td>
                  <td>Opcional</td>
                  <td>Expresión facial exagerada</td>
                </tr>
                <tr>
                  <td>📚 Educativo / Divulgación</td>
                  <td>1280×720 px</td>
                  <td>4 – 9 %</td>
                  <td>Azul, verde, blanco</td>
                  <td>Sí (concepto clave)</td>
                  <td>Infografía o imagen conceptual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Quién usa esta herramienta y cómo</h2>
          <p>
            El creador de thumbnails de meskeIA está pensado para perfiles muy diferentes.
            Aquí te mostramos cuatro casos reales con estrategias concretas.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌱</span>
                <h4>Youtuber principiante</h4>
              </div>
              <p className={styles.escenarioExample}>
                Está arrancando su canal y necesita establecer una identidad visual coherente
                desde el primer vídeo. Usa la herramienta para crear una plantilla base con
                sus colores de marca y la replica en cada nuevo thumbnail.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: define tu paleta de 2-3 colores desde el día 1. La coherencia visual
                hace que los suscriptores reconozcan tus vídeos en el feed instantáneamente.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h4>Creator de tutoriales tech</h4>
              </div>
              <p className={styles.escenarioExample}>
                Necesita maximizar el CTR en un nicho competido. Experimenta con distintas
                combinaciones de fondo + texto + expresión facial para encontrar la fórmula
                que genera más clics en sus tutoriales de programación.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa texto con número («5 trucos», «Error #1») y contrasta el fondo
                oscuro con letras blancas o amarillas. El CTR en tutoriales tech mejora un
                20-30 % con este patrón.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍳</span>
                <h4>Canal de cocina</h4>
              </div>
              <p className={styles.escenarioExample}>
                Publica recetas semanales y quiere mantener un estilo visual apetecible y
                consistente. Crea thumbnails con fondo cálido, foto del plato y el nombre
                de la receta en tipografía gruesa.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: los colores cálidos (naranja, rojo, amarillo) estimulan el apetito
                visualmente. Evita azules y verdes intensos en canales de comida.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h4>Agencia de contenido</h4>
              </div>
              <p className={styles.escenarioExample}>
                Gestiona múltiples canales de clientes con identidades visuales distintas.
                Usa la herramienta para crear plantillas por cliente y producir thumbnails
                en serie manteniendo cada brand guideline.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: guarda una plantilla por cliente con sus colores corporativos ya
                configurados. Reducirás el tiempo de producción de cada thumbnail en un 60 %.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre thumbnails de YouTube</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es el tamaño ideal de un thumbnail de YouTube?</summary>
                <p>
                  YouTube recomienda 1280×720 píxeles en formato 16:9, con un peso máximo de
                  2 MB. Esta resolución garantiza que la miniatura se vea nítida tanto en TV
                  como en móvil. Nuestra herramienta exporta exactamente a 1280×720 px por
                  defecto. Formatos aceptados: JPG, PNG, GIF o BMP.
                </p>
                <p className={styles.faqTip}>
                  Dato: un thumbnail pixelado o borroso reduce el CTR hasta un 15 % porque
                  transmite falta de profesionalidad.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuánto afecta el thumbnail al CTR?</summary>
                <p>
                  El thumbnail es el factor que más influye en el CTR (Click Through Rate)
                  junto al título. Según datos internos de YouTube, optimizar la miniatura
                  puede aumentar el CTR entre un 30 % y un 154 %. Un CTR superior al 4-6 %
                  se considera bueno; por encima del 10 % es excelente.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Debo poner texto en todos los thumbnails?</summary>
                <p>
                  Depende del tipo de contenido. En tutoriales y contenido educativo, el texto
                  ayuda a clarificar de qué trata el vídeo (especialmente si el título es largo).
                  En vlogs y contenido emocional, la imagen sola puede ser más impactante. La
                  regla general: máximo 3-4 palabras, tipografía grande y con contraste.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué colores generan más clics en YouTube?</summary>
                <p>
                  El rojo y el naranja son los colores con mayor tasa de clic en YouTube,
                  seguidos del amarillo. El azul funciona bien en canales de tecnología y
                  educación. Lo más importante es el contraste: un texto blanco sobre fondo
                  oscuro o un texto negro sobre fondo claro siempre es legible, incluso a
                  tamaño miniatura en móvil.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cada cuánto debo actualizar thumbnails antiguos?</summary>
                <p>
                  Si un vídeo tiene más de 3 meses y su CTR está por debajo del 2-3 %, vale
                  la pena probar un thumbnail nuevo. YouTube Studio permite ver el CTR por
                  vídeo en el panel de analytics. Actualizar el thumbnail no afecta al
                  posicionamiento del vídeo y puede multiplicar las vistas de contenido ya
                  publicado.
                </p>
                <p className={styles.faqTip}>
                  Tip: muchos creadores «reviven» vídeos antiguos solo cambiando el thumbnail
                  y el título, sin regrabar nada.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿YouTube penaliza los thumbnails clickbait?</summary>
                <p>
                  Sí. YouTube analiza si los usuarios que hacen clic en un vídeo lo abandonan
                  rápidamente (alta tasa de rebote). Si el thumbnail promete algo que el vídeo
                  no cumple, YouTube reduce la distribución orgánica. Desde 2023, también puede
                  eliminar thumbnails que considere engañosos o que violen sus políticas.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué herramientas usan los youtubers profesionales?</summary>
                <p>
                  Los creadores más grandes suelen usar Adobe Photoshop o Canva Pro para
                  thumbnails muy elaborados. Para thumbnails rápidos y eficientes, herramientas
                  online como la nuestra son ideales: no requieren instalación, exportan en la
                  resolución correcta y permiten reutilizar plantillas. Muchos creators medianos
                  trabajan íntegramente con herramientas web.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Funciona poner la cara en el thumbnail?</summary>
                <p>
                  Sí, y mucho. Los estudios de YouTube indican que los thumbnails con caras
                  humanas y expresiones emocionales claras (sorpresa, alegría, miedo) generan
                  hasta un 38 % más de clics que los thumbnails sin personas. La expresión
                  exagerada funciona mejor que una pose natural porque capta la atención en
                  el feed donde todo compite por los ojos del usuario.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo crear un thumbnail profesional: 7 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Define la paleta de colores del canal</strong>
                <p>
                  Elige 2-3 colores que representen tu marca y úsalos siempre. La coherencia
                  entre thumbnails hace que tu canal sea reconocible en el feed y aumenta la
                  fidelización de suscriptores.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Crea una plantilla base reutilizable</strong>
                <p>
                  Diseña un layout con posición fija para el texto, el logo y los elementos
                  de marca. Así cada nuevo thumbnail solo requiere cambiar la imagen principal
                  y el texto, no rediseñar desde cero.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Elige una imagen principal de alto impacto</strong>
                <p>
                  La imagen debe comunicar la emoción o el tema del vídeo en un vistazo.
                  Una cara con expresión clara, el resultado final de un tutorial o una
                  escena impactante del vídeo son las opciones más efectivas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Añade texto conciso (máx. 3-4 palabras)</strong>
                <p>
                  El texto del thumbnail complementa al título, no lo repite. Usa una
                  frase corta que genere curiosidad o que destaque el beneficio clave del
                  vídeo. Tipografía bold, grande y con contraste sobre el fondo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Verifica legibilidad en tamaño pequeño (móvil)</strong>
                <p>
                  Aleja el zoom al 25 % o reduce la vista previa. El thumbnail debe ser
                  legible y reconocible a 120 px de ancho, que es como aparece en el feed
                  móvil. Si el texto no se lee o la imagen se confunde, simplifica.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Exporta en JPG/PNG mínimo 1280×720 px</strong>
                <p>
                  Usa el botón «Descargar PNG» de esta herramienta para obtener exactamente
                  1280×720 px. Sube la imagen a YouTube Studio desde la sección de
                  personalización del vídeo, en el campo «Miniatura personalizada».
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Haz A/B test con YouTube Studio</strong>
                <p>
                  YouTube permite probar hasta 3 thumbnails distintos para el mismo vídeo
                  desde la pestaña «Experimentos» en YouTube Studio. Deja correr el test al
                  menos 2 semanas antes de elegir el ganador definitivo.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>6 mejores prácticas para thumbnails de YouTube</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Resolución mínima 1280×720 (16:9)</h4>
              <p>
                Es el estándar de YouTube. Una miniatura más pequeña se pixela en televisores
                y monitores 4K. Siempre exporta a resolución completa aunque el archivo
                pese algo más.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎨</span>
              <h4>Mantén coherencia visual entre vídeos</h4>
              <p>
                Los canales con thumbnails cohesivos tienen hasta un 25 % más de visualizaciones
                por sesión porque los espectadores reconocen el canal en el feed y confían
                en la calidad del contenido.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">😮</span>
              <h4>Caras con expresión exagerada aumentan el CTR</h4>
              <p>
                La sorpresa, el miedo o la alegría exagerada captan la atención en milésimas
                de segundo. Estudios de YouTube muestran que los thumbnails con expresiones
                faciales claras generan hasta un 38 % más de clics.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <h4>Contrasta texto sobre fondo oscuro o claro</h4>
              <p>
                Nunca pongas texto gris sobre fondo gris ni amarillo claro sobre blanco.
                La regla de oro: ratio de contraste mínimo 4,5:1 según las guías de
                accesibilidad WCAG, que coincide con lo más legible en YouTube.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <h4>Prueba legibilidad a 120 px de ancho (móvil)</h4>
              <p>
                El 70 % del tráfico de YouTube viene de móviles. Reduce el zoom o usa la
                vista previa miniatura del editor para comprobar que todos los elementos
                son legibles en pantalla pequeña.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Actualiza thumbnails de vídeos con bajo CTR</h4>
              <p>
                Revisa el CTR de tus vídeos en YouTube Studio (pestaña Alcance). Los que
                tengan menos del 2-3 % son candidatos a thumbnail nuevo. Cambiar la miniatura
                puede reactivar vídeos que llevan meses sin visitas.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores que arruinan tus thumbnails</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Usar texto demasiado pequeño.</strong> Si el texto no se lee a tamaño
                miniatura en un móvil, no cumple su función. Usa tipografía bold de al menos
                60-80 px en el diseño a 1280 px (equivale a unos 6-8 pt en miniatura).
              </li>
              <li>
                <strong>Thumbnails engañosos (clickbait).</strong> YouTube detecta cuando los
                espectadores abandonan el vídeo rápido tras hacer clic. Si el thumbnail no
                refleja el contenido real, el algoritmo reduce drásticamente la distribución
                orgánica del vídeo.
              </li>
              <li>
                <strong>No mantener coherencia visual entre vídeos.</strong> Cambiar de estilo
                en cada thumbnail dificulta que los espectadores reconozcan tu canal en el feed.
                La identidad visual consistente es uno de los factores clave de crecimiento
                sostenido en YouTube.
              </li>
              <li>
                <strong>Usar imágenes de baja resolución.</strong> Una foto pixelada o borrosa
                transmite falta de profesionalidad y reduce el CTR. Usa siempre imágenes de
                al menos 1280×720 px o fotos propias de alta calidad.
              </li>
              <li>
                <strong>Saturar el thumbnail con demasiados elementos.</strong> Un thumbnail
                con texto, logo, dos caras, flechas y fondo complejo resulta caótico en
                tamaño miniatura. Aplica la regla de «un mensaje, una imagen»: el espectador
                debe captar el tema en menos de un segundo.
              </li>
              <li>
                <strong>Ignorar las métricas de CTR en YouTube Studio.</strong> El CTR es el
                indicador más directo de la eficacia de tu thumbnail. Revisar las métricas
                de alcance mensualmente y experimentar con nuevos diseños es la única forma
                de mejorar sistemáticamente tus miniaturas.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('creador-thumbnails')} />

      <ShareCard appName="creador-thumbnails" />
      <Footer appName="creador-thumbnails" />
    </div>
  );
}
