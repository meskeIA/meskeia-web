'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './CreadorThumbnails.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
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

      <RelatedApps apps={getRelatedApps('creador-thumbnails')} />

      <Footer appName="creador-thumbnails" />
    </div>
  );
}
