
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Slide, ViewportState } from './types';
import { RING_RADIUS, ZOOM_SCALE } from './constants';
import CircularViewer from './components/CircularViewer';
import SlideEditor from './components/SlideEditor';
import NavigationOverlay from './components/NavigationOverlay';
import { summarizeSlideContent } from './services/geminiService';

const INITIAL_SLIDES: Slide[] = [
  { 
    id: '1', 
    title: 'L\'Histoire Oubliée', 
    content: 'Une exploration des racines de la pensée critique et de la remise en question des récits officiels.', 
    imageUrl: 'https://picsum.photos/seed/history/1200/800', 
    type: 'image' 
  },
  { 
    id: '2', 
    title: 'La Mécanique Circulaire', 
    content: 'Pourquoi la roue est le symbole éternel de la progression et du retour aux sources.', 
    imageUrl: 'https://picsum.photos/seed/circle/1200/800', 
    type: 'image' 
  },
  { 
    id: '3', 
    title: 'Zooming Reality', 
    content: 'Le pouvoir de changer de perspective, du global au local, du macro au micro.', 
    imageUrl: 'https://picsum.photos/seed/zoom/1200/800', 
    type: 'image' 
  },
  { 
    id: '4', 
    title: 'Équilibre Orbital', 
    content: 'Maintenir le centre au milieu du chaos créatif.', 
    imageUrl: 'https://picsum.photos/seed/orbit/1200/800', 
    type: 'image' 
  },
];

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 0.4,
    translateX: 0,
    translateY: 0,
    activeSlideId: null,
    isManual: false,
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isDragging = useRef(false);
  const startDragPos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  const snapTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const calculateSlidePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: RING_RADIUS * Math.cos(angle),
      y: RING_RADIUS * Math.sin(angle),
      angle
    };
  };

  const handleSlideSelect = useCallback((id: string | null) => {
    if (!id) {
      setViewport({
        scale: 0.4,
        translateX: 0,
        translateY: 0,
        activeSlideId: null,
        isManual: false,
      });
      return;
    }

    const index = slides.findIndex(s => s.id === id);
    if (index === -1) return;

    const { x, y } = calculateSlidePosition(index, slides.length);

    setViewport({
      scale: ZOOM_SCALE,
      translateX: -x * ZOOM_SCALE,
      translateY: -y * ZOOM_SCALE,
      activeSlideId: id,
      isManual: false,
    });
  }, [slides]);

  const navigate = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = slides.findIndex(s => s.id === viewportRef.current.activeSlideId);
    let nextIndex = 0;

    if (viewportRef.current.activeSlideId === null) {
      nextIndex = 0;
    } else {
      if (direction === 'next') {
        nextIndex = (currentIndex + 1) % slides.length;
      } else {
        nextIndex = (currentIndex - 1 + slides.length) % slides.length;
      }
    }
    handleSlideSelect(slides[nextIndex].id);
  }, [slides, handleSlideSelect]);

  // --- MOUSE CONTROLS ---

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left Click
      isDragging.current = true;
      startDragPos.current = { x: e.clientX, y: e.clientY };
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setViewport(v => ({ ...v, isManual: true }));
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setViewport(prev => {
      const limit = RING_RADIUS * Math.max(prev.scale, 0.4) * 3;
      return {
        ...prev,
        translateX: Math.min(Math.max(prev.translateX + dx, -limit), limit),
        translateY: Math.min(Math.max(prev.translateY + dy, -limit), limit),
        // Suppression du activeSlideId: null ici pour permettre d'ajuster sans perdre le focus
      };
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Si on a très peu bougé et qu'on a cliqué sur le fond, on désélectionne
    const dist = Math.hypot(e.clientX - startDragPos.current.x, e.clientY - startDragPos.current.y);
    if (dist < 5 && (e.target as HTMLElement).id === 'main-container') {
        handleSlideSelect(null);
    }

    setTimeout(() => {
      setViewport(v => ({ ...v, isManual: false }));
    }, 50);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    // Si on double clique sur le fond
    if ((e.target as HTMLElement).id === 'main-container') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.width / 2;
      const mouseY = e.clientY - rect.height / 2;

      setViewport(prev => ({
        ...prev,
        scale: Math.min(prev.scale * 2, 8),
        translateX: prev.translateX - mouseX * 0.5,
        translateY: prev.translateY - mouseY * 0.5,
        activeSlideId: null,
        isManual: false
      }));
    }
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSlideSelect(null);
  };

  // --- WHEEL ZOOM ---

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();

      setViewport(prev => {
        if (e.ctrlKey) {
          const zoomSensitivity = 0.007;
          const delta = -e.deltaY * zoomSensitivity;
          const oldScale = prev.scale;
          const newScale = Math.min(Math.max(oldScale * (1 + delta), 0.04), 12);
          
          let convergence = 1.0;
          if (newScale < oldScale && newScale < 0.7) {
            convergence = 0.96;
          }

          return {
            ...prev,
            scale: newScale,
            translateX: prev.translateX * convergence,
            translateY: prev.translateY * convergence,
            isManual: true,
            // On ne désactive plus activeSlideId au scroll pour permettre l'ajustement
          };
        } else if (!isDragging.current) {
          const sensitivity = 0.8;
          return {
            ...prev,
            translateX: prev.translateX - e.deltaX * sensitivity,
            translateY: prev.translateY - e.deltaY * sensitivity,
            isManual: true,
          };
        }
        return prev;
      });

      if (snapTimeoutRef.current) window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(() => {
        setViewport(curr => {
          if (curr.scale < 0.45 && curr.activeSlideId === null && !isDragging.current) {
            return { ...curr, scale: 0.4, translateX: 0, translateY: 0, isManual: false };
          }
          return { ...curr, isManual: false };
        });
      }, 300);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
      if (e.key === 'Escape') handleSlideSelect(null);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKey);
    };
  }, [navigate, handleSlideSelect]);

  const addSlide = async (title: string, content: string, imageUrl?: string) => {
    setIsProcessing(true);
    let finalTitle = title;
    if (!title && content) {
      finalTitle = await summarizeSlideContent(content);
    }
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: finalTitle || 'Nouveau Diapositif',
      content,
      imageUrl,
      type: imageUrl ? 'image' : 'text'
    };
    setSlides(prev => [...prev, newSlide]);
    setIsEditorOpen(false);
    setIsProcessing(false);
  };

  const deleteSlide = (id: string) => {
    setSlides(prev => prev.filter(s => s.id !== id));
    if (viewport.activeSlideId === id) handleSlideSelect(null);
  };

  return (
    <div 
      id="main-container"
      className="relative w-screen h-screen bg-[#050505] overflow-hidden text-white select-none touch-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2000px] h-[2000px] bg-amber-500/5 rounded-full blur-[180px]"></div>
      </div>

      <CircularViewer 
        slides={slides} 
        viewport={viewport} 
        onSelect={handleSlideSelect} 
      />

      <NavigationOverlay 
        activeSlide={slides.find(s => s.id === viewport.activeSlideId)}
        onNext={() => navigate('next')}
        onPrev={() => navigate('prev')}
        onBack={() => handleSlideSelect(null)}
        onOpenEditor={() => setIsEditorOpen(true)}
        totalSlides={slides.length}
        currentIndex={slides.findIndex(s => s.id === viewport.activeSlideId)}
      />

      {isEditorOpen && (
        <SlideEditor 
          onClose={() => setIsEditorOpen(false)} 
          onSave={addSlide}
          onDelete={deleteSlide}
          slides={slides}
          isProcessing={isProcessing}
        />
      )}

      {viewport.activeSlideId === null && viewport.scale < 0.6 && (
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center pointer-events-none transition-all duration-1000 opacity-60">
          <p className="text-[10px] font-mono tracking-[0.5em] text-amber-500/80 uppercase">Double-clic Fond : Zoom Libre • Clic Droit : Retour Centre</p>
        </div>
      )}
    </div>
  );
};

export default App;
